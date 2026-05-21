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
 * redux-persist transform that encrypts credential fields at rest (opt-in).
 * Synchronous; uses a pluggable provider:
 *
 * - **Keychain** (Electron): a 256-bit key sealed in `safeStorage` lives in
 *   the main process; the transform calls `getSync('encrypt|decryptCredentials')`.
 *   Wire prefix `tsenc:v1:` (AES-256-GCM via Node crypto in main).
 * - **Password** (web; or Electron fallback): a 64-byte raw key derived once
 *   from the user password at unlock lives in a renderer module singleton;
 *   the transform encrypts/decrypts in-process via the sync raw-key cipher.
 *   Wire prefix `tsenc:p1:` (AES-256-CBC + HMAC-SHA256 via CryptoJS).
 *
 * - inbound (store → localStorage): encrypt ONLY when the opt-in flag is on
 *   AND a provider is available. All-or-nothing per slice.
 * - outbound (localStorage → store): always attempt to decrypt anything
 *   carrying a `tsenc:` prefix; non-`tsenc:` (legacy plaintext) passes
 *   through. The provider returns null for values it can't unlock; that
 *   field is blanked (never crashes rehydrate).
 *
 * Scope is a declarative registry — one entry per persisted slice.
 */

import { createTransform } from 'redux-persist';
import AppConfig from '-/AppConfig';
import {
  getCredentialKey,
  getKeySource,
  hasCredentialKey,
  isEncryptAtRestEnabled,
} from '-/services/encryptAtRestState';
import { decryptWithRawKey, encryptWithRawKey } from '-/services/secure-crypto';
import { notifyUser } from '-/services/globalErrorHandlers';

/** Any value carrying any at-rest scheme prefix. */
const ENC_PREFIX = 'tsenc:';

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

/* -------------------------- providers ------------------------------ */

/**
 * Electron-keychain provider — the SHIPPED path. Behavior must remain
 * byte-for-byte identical: route every batch through the existing sync IPC.
 */
function keychainSync(channel: string, values: string[]): SyncResult {
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
}

/**
 * In-process password provider. Uses the in-memory raw key + the
 * synchronous AES-256-CBC + HMAC cipher in secure-crypto.ts.
 */
function passwordSync(channel: string, values: string[]): SyncResult {
  const key = getCredentialKey();
  if (!key || !Array.isArray(values)) {
    return { available: false };
  }
  try {
    if (channel === 'encryptCredentials') {
      return {
        available: true,
        values: values.map((v) =>
          typeof v === 'string' ? encryptWithRawKey(v, key) : v,
        ),
      };
    }
    // decrypt
    return {
      available: true,
      values: values.map((v) =>
        typeof v === 'string' ? (decryptWithRawKey(v, key) ?? null) : null,
      ),
    };
  } catch (e) {
    console.warn('credentialsTransform: password provider failed', e);
    return { available: false };
  }
}

/** Resolve the active provider. */
const defaultSync: SyncFn = (channel, values) => {
  const source = getKeySource();
  if (source === 'keychain') {
    return keychainSync(channel, values);
  }
  if (source === 'password' && hasCredentialKey()) {
    return passwordSync(channel, values);
  }
  return null;
};

/* -------------------------- transform ------------------------------ */

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
      const isEnc = v.startsWith(ENC_PREFIX);
      if (mode === 'encrypt' && isEnc) {
        return; // idempotent — already encrypted (any scheme)
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
        // Decrypt failed (key lost / wrong key / unsupported scheme).
        // Use an empty string instead of undefined so downstream consumers
        // (Leaflet templates, AWS SDK auth, etc.) don't crash on a missing
        // value. The user is notified below and can re-enter or restore.
        newContainers[p.ci][p.f] = '';
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

/** Probe whether a usable provider exists right now (for inbound gate). */
function providerAvailable(): boolean {
  const source = getKeySource();
  if (source === 'keychain') {
    const io = (window as any).electronIO?.ipcRenderer;
    return !!(AppConfig.isElectron && io && typeof io.getSync === 'function');
  }
  if (source === 'password') {
    return hasCredentialKey();
  }
  return false;
}

export function createCredentialsTransform(syncFn: SyncFn = defaultSync) {
  return createTransform(
    // inbound: store → persisted
    (subState: any, key: any) => {
      if (!isEncryptAtRestEnabled() || !providerAvailable()) {
        return subState;
      }
      return transformSlice(subState, key as string, 'encrypt', syncFn);
    },
    // outbound: persisted → store (flag-independent; tries any tsenc: value)
    (subState: any, key: any) =>
      transformSlice(subState, key as string, 'decrypt', syncFn),
    { whitelist: Object.keys(REGISTRY) },
  );
}

export const credentialsTransform = createCredentialsTransform();
