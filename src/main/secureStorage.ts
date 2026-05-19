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
 * Owns the at-rest credential data key. The key is generated once, sealed
 * with Electron `safeStorage` (OS keychain — macOS Keychain / Windows DPAPI
 * / Linux libsecret) and kept in `userData/credkey.bin`.
 *
 * The unsealed key NEVER leaves the main process: the renderer's synchronous
 * redux-persist transform calls `encryptCredentials` / `decryptCredentials`
 * over `sendSync`, and only the resulting strings cross the IPC boundary.
 *
 * Failure policy (data-loss avoidance): if `safeStorage` is unavailable, or
 * an existing sealed file cannot be unsealed, return `null` and report
 * `available:false` — never regenerate over an existing sealed file (that
 * would make already-encrypted credentials permanently unrecoverable).
 */

import { app, safeStorage, ipcMain, BrowserWindow } from 'electron';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { encryptWithKey, decryptWithKey } from './credentialCipher';

const KEY_FILENAME = 'credkey.bin';
const KEY_BYTES = 32;

let cachedKey: Buffer | null = null;
// Negative cache so a persistently-failing keychain isn't hit on every
// redux-persist write. Cleared by the status check so the user can retry
// after unlocking their keyring.
let negativeCache = false;

function keyFilePath(): string {
  return path.join(app.getPath('userData'), KEY_FILENAME);
}

function isWeakBackend(): boolean {
  try {
    if (
      process.platform === 'linux' &&
      typeof (safeStorage as any).getSelectedStorageBackend === 'function'
    ) {
      return (safeStorage as any).getSelectedStorageBackend() === 'basic_text';
    }
  } catch (e) {
    /* ignore */
  }
  return false;
}

/**
 * Returns the cached 32-byte data key, generating + sealing it on first use.
 * Returns null when unavailable / unsealable (see failure policy above).
 */
export function loadOrCreateKey(): Buffer | null {
  if (cachedKey) {
    return cachedKey;
  }
  if (negativeCache) {
    return null;
  }
  try {
    if (!safeStorage.isEncryptionAvailable()) {
      console.warn('secureStorage: safeStorage encryption not available');
      negativeCache = true;
      return null;
    }
    const p = keyFilePath();
    if (fs.existsSync(p)) {
      try {
        const sealed = fs.readFileSync(p);
        const b64 = safeStorage.decryptString(sealed);
        const key = Buffer.from(b64, 'base64');
        if (key.length !== KEY_BYTES) {
          console.warn('secureStorage: unsealed key has wrong length');
          negativeCache = true;
          return null;
        }
        cachedKey = key;
        return cachedKey;
      } catch (e) {
        // Keychain reset / different OS user / corrupt — do NOT regenerate.
        console.warn('secureStorage: could not unseal credential key', e);
        negativeCache = true;
        return null;
      }
    }
    // First run — generate and seal.
    const key = crypto.randomBytes(KEY_BYTES);
    const sealed = safeStorage.encryptString(key.toString('base64'));
    // new Uint8Array(): pinned @types/node 20.x `Buffer` lacks the
    // array-buffer generic TS 5.9's fs typings expect.
    fs.writeFileSync(p, new Uint8Array(sealed), { mode: 0o600 });
    cachedKey = key;
    return cachedKey;
  } catch (e) {
    console.warn('secureStorage: unexpected error acquiring key', e);
    negativeCache = true;
    return null;
  }
}

export default function registerSecureStorageEvents(): void {
  // Batched synchronous encrypt — one round-trip per persisted slice.
  ipcMain.on('encryptCredentials', (event, values: string[]) => {
    try {
      const key = loadOrCreateKey();
      if (!key || !Array.isArray(values)) {
        event.returnValue = { available: false };
        return;
      }
      event.returnValue = {
        available: true,
        values: values.map((v) =>
          typeof v === 'string' ? encryptWithKey(v, key) : v,
        ),
      };
    } catch (e) {
      event.returnValue = { available: false };
    }
  });

  // Batched synchronous decrypt — failed elements come back as null so the
  // renderer can blank just that field (never crash rehydrate).
  ipcMain.on('decryptCredentials', (event, values: string[]) => {
    try {
      const key = loadOrCreateKey();
      if (!key || !Array.isArray(values)) {
        event.returnValue = { available: false };
        return;
      }
      event.returnValue = {
        available: true,
        values: values.map((v) =>
          typeof v === 'string' ? (decryptWithKey(v, key) ?? null) : null,
        ),
      };
    } catch (e) {
      event.returnValue = { available: false };
    }
  });

  // Drives the Settings toggle enable/disable + tooltip. Clears the negative
  // cache first so a re-check retries after the user unlocks their keyring.
  ipcMain.handle('getCredentialKeyStatus', () => {
    try {
      negativeCache = false;
      const key = loadOrCreateKey();
      return { available: !!key, weak: !!key && isWeakBackend() };
    } catch (e) {
      return { available: false, weak: false };
    }
  });

  // Single-window guard for the activation / scrub flow.
  ipcMain.handle('getWindowCount', () => {
    try {
      return BrowserWindow.getAllWindows().filter((w) => !w.isDestroyed())
        .length;
    } catch (e) {
      return 1;
    }
  });

  // Push DOM storage to disk after the migration scrub.
  ipcMain.handle('flushStorageData', (event) => {
    try {
      const ses = event.sender?.session;
      if (ses && typeof ses.flushStorageData === 'function') {
        ses.flushStorageData();
      }
      return true;
    } catch (e) {
      return false;
    }
  });
}
