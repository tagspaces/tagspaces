/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2026-present TagSpaces GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License (version 3) as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

/**
 * redux-persist transform that encrypts credential fields at rest (Electron,
 * opt-in). The master key never enters the renderer — encrypt/decrypt run in
 * the main process via synchronous IPC; only the resulting strings cross.
 *
 * - inbound (store → localStorage): encrypt, only if Electron AND the opt-in
 *   flag is on. All-or-nothing per slice (never write a partial mix).
 * - outbound (localStorage → store): always attempt to decrypt tagged values
 *   (flag-independent) so disabling the feature / loading after a previous
 *   enable still works. Legacy plaintext passes through untouched.
 *
 * Scope is a declarative registry — one entry per persisted slice.
 */

import { createTransform } from 'redux-persist';
import AppConfig from '-/AppConfig';
import { isEncryptAtRestEnabled } from '-/services/encryptAtRestState';
import { notifyUser } from '-/services/globalErrorHandlers';

// Mirrors RAWENC_PREFIX in src/main/credentialCipher.ts (no shared module
// between renderer and main).
const PREFIX = 'tsenc:v1:';

type Registry = {
  [sliceKey: string]: {
    /** When set, the slice is an object and the array lives at this key. */
    nestedArray?: string;
    /** Sensitive string fields on each array entry. */
    fields: string[];
  };
};

const REGISTRY: Registry = {
  locations: {
    fields: [
      'secretAccessKey',
      'accessKeyId',
      'sessionToken',
      'encryptionKey',
      'password',
    ],
  },
  settings: {
    nestedArray: 'mapTileServers',
    fields: ['serverURL', 'serverInfo'],
  },
};

type SyncResult = { available: boolean; values?: (string | null)[] } | null;
export type SyncFn = (channel: string, values: string[]) => SyncResult;

const defaultSync: SyncFn = (channel, values) => {
  const io = (window as any).electronIO?.ipcRenderer;
  if (!AppConfig.isElectron || !io || typeof io.getSync !== 'function') {
    return null;
  }
  try {
    return io.getSync(channel, values) as SyncResult;
  } catch (e) {
    console.warn('credentialsTransform: sync IPC failed', e);
    return null;
  }
};

function notifyDecryptFailure(names: string[]): void {
  let msg: string;
  try {
    // Lazy require so this module has no eager i18n dependency.
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    const i18n = require('-/services/i18n').default;
    msg = i18n.t('core:credentialsCouldNotBeUnlocked', {
      names: names.join(', '),
    });
  } catch {
    msg = `Could not unlock saved credentials for: ${names.join(
      ', ',
    )}. Please re-enter them or import from an encrypted backup.`;
  }
  notifyUser(msg, 'warning', 'credentialUnlockTID');
}

/**
 * Encrypt (inbound) or decrypt (outbound) the sensitive fields of one slice.
 * Returns a new slice (copy-on-write) or the original when there is nothing
 * to do / on an aborted encryption.
 */
export function transformSlice(
  subState: any,
  key: string,
  mode: 'encrypt' | 'decrypt',
  syncFn: SyncFn,
): any {
  const reg = REGISTRY[key];
  if (!reg) {
    return subState;
  }

  let containers: any[];
  if (reg.nestedArray) {
    const arr = subState && subState[reg.nestedArray];
    if (!Array.isArray(arr) || arr.length === 0) {
      return subState;
    }
    containers = arr;
  } else {
    if (!Array.isArray(subState)) {
      return subState;
    }
    containers = subState;
  }

  const picks: { ci: number; f: string; v: string }[] = [];
  containers.forEach((c, ci) => {
    if (!c) {
      return;
    }
    reg.fields.forEach((f) => {
      const v = c[f];
      if (typeof v !== 'string' || v.length === 0) {
        return;
      }
      const isEnc = v.startsWith(PREFIX);
      if (mode === 'encrypt' && isEnc) {
        return; // idempotent — already encrypted
      }
      if (mode === 'decrypt' && !isEnc) {
        return; // legacy plaintext passthrough
      }
      picks.push({ ci, f, v });
    });
  });
  if (picks.length === 0) {
    return subState;
  }

  const channel =
    mode === 'encrypt' ? 'encryptCredentials' : 'decryptCredentials';
  const res = syncFn(
    channel,
    picks.map((p) => p.v),
  );

  if (mode === 'encrypt') {
    // All-or-nothing: never write a partial plaintext/ciphertext mix.
    if (
      !res ||
      res.available !== true ||
      !Array.isArray(res.values) ||
      res.values.length !== picks.length
    ) {
      return subState;
    }
  }

  const newContainers = containers.map((c) => (c ? { ...c } : c));
  const failed: string[] = [];

  picks.forEach((p, idx) => {
    if (mode === 'encrypt') {
      newContainers[p.ci][p.f] = (res as any).values[idx];
    } else {
      const ok = !!res && res.available === true && Array.isArray(res.values);
      const dec = ok ? (res as any).values[idx] : null;
      if (dec === null || dec === undefined) {
        newContainers[p.ci][p.f] = undefined;
        const c = newContainers[p.ci];
        failed.push(c.name || c.uuid || '?');
      } else {
        newContainers[p.ci][p.f] = dec;
      }
    }
  });

  if (mode === 'decrypt' && failed.length > 0) {
    notifyDecryptFailure(failed);
  }

  if (reg.nestedArray) {
    return { ...subState, [reg.nestedArray]: newContainers };
  }
  return newContainers;
}

export function createCredentialsTransform(syncFn: SyncFn = defaultSync) {
  return createTransform(
    // inbound: store → persisted
    (subState: any, key: any) => {
      if (!AppConfig.isElectron || !isEncryptAtRestEnabled()) {
        return subState;
      }
      return transformSlice(subState, key as string, 'encrypt', syncFn);
    },
    // outbound: persisted → store (flag-independent)
    (subState: any, key: any) =>
      transformSlice(subState, key as string, 'decrypt', syncFn),
    { whitelist: Object.keys(REGISTRY) },
  );
}

export const credentialsTransform = createCredentialsTransform();
