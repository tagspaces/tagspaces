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
 * Pre-store bootstrap probe for the at-rest credential encryption feature.
 *
 * Runs SYNCHRONOUSLY in index.tsx BEFORE `configureStore` so the
 * `encryptAtRestState` singleton has the right `keySource` by the time
 * redux-persist rehydration calls the transform's outbound. Critical: a
 * shipped Electron-keychain user with `encryptCredentialsAtRest=true` and
 * no `encryptCredentialsKeySource` yet must be inferred as `'keychain'`
 * here — otherwise the gate sees `'off'`, the keychain provider isn't
 * picked, and rehydrate would blank every saved credential.
 */

import AppConfig from '-/AppConfig';
import { type KeySource, setKeySource } from '-/services/encryptAtRestState';

const PERSIST_ROOT_KEY = 'persist:root';
const KDF_LS_KEY = 'tsCredKdf';
const VERIFIER_LS_KEY = 'tsCredVerify';

/**
 * Single inference rule shared between the pre-store probe and the
 * post-rehydrate store subscription, so the singleton stays consistent
 * across the boot sequence. Shipped Electron-keychain users (flag=true,
 * source missing from their saved settings) are inferred as 'keychain'.
 */
export function inferKeySource(
  enabled: boolean,
  explicitSource: string | undefined,
  isElectron: boolean,
): KeySource {
  if (!enabled) {
    return 'off';
  }
  if (explicitSource === 'keychain' || explicitSource === 'password') {
    return explicitSource as KeySource;
  }
  return isElectron ? 'keychain' : 'off';
}

export type KdfMeta = {
  saltB64: string;
  iter: number;
  algo: string;
};

export type BootstrapProbe = {
  hasEncryptedData: boolean;
  /** Inferred mode from persisted state + platform. */
  inferredSource: KeySource;
  /** True if password mode is active and the unlock screen is required. */
  needsUnlock: boolean;
  /** PBKDF2 params + verifier blob — only present in password mode. */
  kdf?: KdfMeta;
  verifierBlob?: string;
};

/** Safe localStorage.getItem (web/Electron only — no-op if unavailable). */
function readLs(key: string): string | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    return window.localStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

/** Parse JSON, returning undefined on failure (never throws). */
function safeJson<T = any>(text: string | null | undefined): T | undefined {
  if (!text) {
    return undefined;
  }
  try {
    return JSON.parse(text) as T;
  } catch (e) {
    return undefined;
  }
}

/**
 * Read the persisted `settings` substate from `persist:root` without going
 * through redux-persist (we're pre-store). redux-persist v5 stores each
 * slice as a JSON-encoded string inside an outer JSON object.
 */
function readPersistedSettings(): any | undefined {
  const root = safeJson<Record<string, string>>(readLs(PERSIST_ROOT_KEY));
  if (!root || typeof root.settings !== 'string') {
    return undefined;
  }
  return safeJson(root.settings);
}

/**
 * Quick string scan: any `tsenc:` prefix anywhere inside `persist:root`
 * means there is encrypted data in localStorage. Robust against the
 * exact serialization shape (settings vs locations slice).
 */
function persistRootContainsEncrypted(): boolean {
  const raw = readLs(PERSIST_ROOT_KEY);
  return typeof raw === 'string' && raw.indexOf('tsenc:') !== -1;
}

function readKdf(): { kdf?: KdfMeta; verifierBlob?: string } {
  const kdf = safeJson<KdfMeta>(readLs(KDF_LS_KEY));
  const verifierBlob = readLs(VERIFIER_LS_KEY) || undefined;
  if (!kdf || typeof kdf.saltB64 !== 'string' || typeof kdf.iter !== 'number') {
    return {};
  }
  return { kdf, verifierBlob: verifierBlob || undefined };
}

/**
 * Synchronous probe — no async, no IPC. Reads localStorage only.
 * Determines the at-rest mode the app should boot in BEFORE the store is
 * created so rehydrate works correctly.
 */
export function probeBootstrap(): BootstrapProbe {
  const settings = readPersistedSettings();
  const enabled = settings?.encryptCredentialsAtRest === true;
  const explicit = settings?.encryptCredentialsKeySource;
  const hasEncryptedData = persistRootContainsEncrypted();
  const inferredSource = inferKeySource(
    enabled,
    explicit,
    AppConfig.isElectron,
  );

  if (inferredSource !== 'password') {
    return { hasEncryptedData, inferredSource, needsUnlock: false };
  }
  const { kdf, verifierBlob } = readKdf();
  const needsUnlock = hasEncryptedData && !!kdf && !!verifierBlob;
  return {
    hasEncryptedData,
    inferredSource: 'password',
    needsUnlock,
    kdf,
    verifierBlob,
  };
}

/**
 * Apply the probe's inferred mode to the singleton. Call once, right
 * before `configureStore`. The store subscription installed in
 * configureStore will keep the singleton in sync from then on.
 */
export function seedKeySourceFromProbe(probe: BootstrapProbe): void {
  setKeySource(probe.inferredSource);
}

export type PersistedThemeSettings = {
  currentTheme: 'light' | 'dark' | 'system';
  currentRegularTheme: string;
  currentDarkTheme: string;
};

/**
 * Read the persisted theme settings synchronously — used by the
 * pre-store UnlockScreen so it can wrap itself in the TagSpaces MUI
 * theme that matches the app the user will boot into. Falls back to
 * sensible defaults if persist:root is unreadable.
 */
export function readPersistedThemeSettings(): PersistedThemeSettings {
  const fallback: PersistedThemeSettings = {
    currentTheme: 'light',
    currentRegularTheme: 'legacy',
    currentDarkTheme: 'darklegacy',
  };
  const settings = readPersistedSettings();
  if (!settings) {
    return fallback;
  }
  const ct = settings.currentTheme;
  return {
    currentTheme:
      ct === 'light' || ct === 'dark' || ct === 'system' ? ct : 'light',
    currentRegularTheme:
      typeof settings.currentRegularTheme === 'string'
        ? settings.currentRegularTheme
        : fallback.currentRegularTheme,
    currentDarkTheme:
      typeof settings.currentDarkTheme === 'string'
        ? settings.currentDarkTheme
        : fallback.currentDarkTheme,
  };
}

/**
 * Fields the credentialsTransform encrypts — duplicated here for the
 * pre-store reset path (cannot import the transform's REGISTRY without
 * pulling in redux-persist + i18n side effects this early).
 */
const LOCATION_SECRET_FIELDS = [
  'secretAccessKey',
  'accessKeyId',
  'sessionToken',
  'encryptionKey',
  'password',
];
const TILE_SECRET_FIELDS = ['serverURL', 'serverInfo'];

function scrubEncryptedFields(sub: any, sliceKey: string): any {
  if (sliceKey === 'locations' && Array.isArray(sub)) {
    return sub.map((loc: any) => {
      if (!loc || typeof loc !== 'object') {
        return loc;
      }
      const out = { ...loc };
      LOCATION_SECRET_FIELDS.forEach((f) => {
        if (typeof out[f] === 'string' && out[f].startsWith('tsenc:')) {
          out[f] = '';
        }
      });
      return out;
    });
  }
  if (
    sliceKey === 'settings' &&
    sub &&
    typeof sub === 'object' &&
    Array.isArray(sub.mapTileServers)
  ) {
    return {
      ...sub,
      mapTileServers: sub.mapTileServers.map((srv: any) => {
        if (!srv || typeof srv !== 'object') {
          return srv;
        }
        const out = { ...srv };
        TILE_SECRET_FIELDS.forEach((f) => {
          if (typeof out[f] === 'string' && out[f].startsWith('tsenc:')) {
            out[f] = '';
          }
        });
        return out;
      }),
    };
  }
  return sub;
}

/**
 * "Forgot password" reset path used by the UnlockScreen. Strips every
 * `tsenc:*` value from the persisted whitelisted slices (locations
 * credential fields + `settings.mapTileServers[*].serverURL/.serverInfo`),
 * deletes the KDF metadata + verifier, and turns the feature flag off in
 * the persisted settings — so the next boot is clean, unencrypted, and
 * does NOT hit the unlock screen. Other settings and data are preserved.
 */
export function resetCredentialEncryptionStorage(): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    const rawRoot = window.localStorage.getItem(PERSIST_ROOT_KEY);
    const root = safeJson<Record<string, string>>(rawRoot);
    if (root && typeof root === 'object') {
      ['locations', 'settings'].forEach((sliceKey) => {
        if (typeof root[sliceKey] !== 'string') {
          return;
        }
        const parsed = safeJson<any>(root[sliceKey]);
        if (parsed === undefined) {
          return;
        }
        root[sliceKey] = JSON.stringify(scrubEncryptedFields(parsed, sliceKey));
      });
      if (typeof root.settings === 'string') {
        const settings = safeJson<any>(root.settings);
        if (settings && typeof settings === 'object') {
          settings.encryptCredentialsAtRest = false;
          settings.encryptCredentialsKeySource = 'off';
          root.settings = JSON.stringify(settings);
        }
      }
      window.localStorage.setItem(PERSIST_ROOT_KEY, JSON.stringify(root));
    }
    window.localStorage.removeItem(KDF_LS_KEY);
    window.localStorage.removeItem(VERIFIER_LS_KEY);
  } catch (e) {
    /* best-effort */
  }
}
