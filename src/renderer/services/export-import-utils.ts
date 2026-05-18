/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces GmbH
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

import { decryptString, encryptString } from '-/services/secure-crypto';
import { saveAsTextFile } from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import versionMeta from '-/version.json';
import { formatDateTime4Tag } from '@tagspaces/tagspaces-common/misc';
import {
  EXPORT_VERSION,
  TransferEnvelope,
  cleanSearchesForExport,
  stripNonImportableSettings,
} from '-/services/export-import-validators';

// Re-export the pure logic so existing call sites keep one import surface.
export {
  EXPORT_VERSION,
  NON_IMPORTABLE_SETTINGS_KEYS,
  cleanSearchesForExport,
  evaluatePasswordStrength,
  locationsHaveCredentials,
  mergeImportedSettings,
  normalizeEnvelope,
  stripNonImportableSettings,
  validateLocations,
  validateSearches,
  validateSettings,
  validateTagGroups,
} from '-/services/export-import-validators';
export type {
  PasswordStrength,
  TransferEnvelope,
  TransferSection,
} from '-/services/export-import-validators';

/** Hard cap on the size of a file we will attempt to import. */
export const MAX_IMPORT_BYTES = 8 * 1024 * 1024; // 8 MB

export function buildEnvelope(parts: {
  settings?: Record<string, any>;
  locations?: TS.S3Location[];
  tagGroups?: TS.TagGroup[];
  searches?: TS.SearchQuery[];
}): TransferEnvelope {
  const env: TransferEnvelope = {
    appName: versionMeta.name,
    appVersion: versionMeta.version,
    exportVersion: EXPORT_VERSION,
    exportDate: new Date().toISOString(),
  };
  if (parts.settings && Object.keys(parts.settings).length > 0) {
    env.settings = stripNonImportableSettings(parts.settings);
  }
  if (parts.locations && parts.locations.length > 0) {
    env.locations = parts.locations;
  }
  if (parts.tagGroups && parts.tagGroups.length > 0) {
    env.tagGroups = parts.tagGroups;
  }
  if (parts.searches && parts.searches.length > 0) {
    env.searches = cleanSearchesForExport(parts.searches);
  }
  return env;
}

/**
 * Serialize the envelope. With a password the whole JSON is encrypted with a
 * slow KDF + authenticated cipher (see secure-crypto) → `.tsec`; otherwise
 * pretty JSON → `.json`.
 */
export async function serializeEnvelope(
  env: TransferEnvelope,
  aesPassword?: string,
): Promise<{ blob: Blob; ext: '.tsec' | '.json' }> {
  if (aesPassword) {
    const payload = await encryptString(JSON.stringify(env), aesPassword);
    return {
      blob: new Blob([payload], { type: 'application/octet-stream' }),
      ext: '.tsec',
    };
  }
  return {
    blob: new Blob([JSON.stringify(env, null, 2)], {
      type: 'application/json',
    }),
    ext: '.json',
  };
}

export async function downloadEnvelope(
  env: TransferEnvelope,
  aesPassword?: string,
): Promise<void> {
  const { blob, ext } = await serializeEnvelope(env, aesPassword);
  const dateTimeTag = formatDateTime4Tag(new Date(), true);
  saveAsTextFile(blob, 'tagspaces-export [' + dateTimeTag + ']' + ext);
}

export function readImportFile(
  file: File,
): Promise<{ rawText: string; isEncrypted: boolean }> {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('no-file'));
      return;
    }
    if (file.size > MAX_IMPORT_BYTES) {
      reject(new Error('too-large'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      resolve({
        rawText: String(reader.result),
        isEncrypted: file.name.toLowerCase().endsWith('.tsec'),
      });
    reader.onerror = () => reject(reader.error || new Error('read-failed'));
    reader.readAsText(file);
  });
}

/** Decrypt + parse. Returns undefined on any failure (wrong password). */
export async function decryptEnvelope(
  rawText: string,
  aesPassword: string,
): Promise<any | undefined> {
  const txt = await decryptString(rawText, aesPassword);
  if (!txt) {
    return undefined;
  }
  try {
    return JSON.parse(txt);
  } catch (e) {
    return undefined;
  }
}

/** Parse JSON. Returns undefined on failure (never throws). */
export function parseEnvelope(rawText: string): any | undefined {
  try {
    const obj = JSON.parse(rawText);
    return obj && typeof obj === 'object' ? obj : undefined;
  } catch (e) {
    return undefined;
  }
}
