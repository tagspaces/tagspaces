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

/**
 * Pure, dependency-free export/import logic: validators, the settings
 * strip/merge rules and the backward-compat envelope shim. Kept free of any
 * renderer/IO import so it stays unit-testable in a plain Node environment and
 * so the settings reducer can reuse the merge without an import cycle.
 */

import type { TS } from '-/tagspaces.namespace';

/** Bump on a breaking change to the envelope schema. `0` = legacy file. */
export const EXPORT_VERSION = 1;

export type TransferSection =
  | 'settings'
  | 'locations'
  | 'tagGroups'
  | 'searches';

export interface TransferEnvelope {
  appName: string;
  appVersion: string;
  exportVersion: number;
  exportDate: string;
  settings?: Record<string, any>;
  locations?: TS.S3Location[];
  tagGroups?: TS.TagGroup[];
  searches?: TS.SearchQuery[];
}

/**
 * Settings keys that must never travel through an export/import: volatile
 * runtime/session state and environment-derived static lists.
 */
export const NON_IMPORTABLE_SETTINGS_KEYS = [
  // system / volatile
  'appDataPath',
  'contentHash',
  'isUpdateInProgress',
  'isUpdateAvailable',
  'loggedIn',
  'userId',
  'error',
  'isOnline',
  // static / environment-derived
  'supportedLanguages',
  'supportedFileTypes',
  'supportedThemes',
  'supportedGeoTagging',
  'extensionsFound',
];

function isNonEmptyString(v: any): boolean {
  return typeof v === 'string' && v.length > 0;
}

/**
 * JSON.stringify replacer ported from the former ExportSearchesDialog: drops
 * the volatile `currentDirectory` and empty `fileTypes` arrays from a saved
 * search so exported searches stay portable.
 */
function searchesReplacer(key: string, value: any) {
  if (key !== 'currentDirectory' && value !== null && value !== '') {
    if (
      key !== 'fileTypes' ||
      (Array.isArray(value) && value.join('').length > 0)
    ) {
      return value;
    }
  }
  return undefined;
}

export function cleanSearchesForExport(
  searches: TS.SearchQuery[],
): TS.SearchQuery[] {
  try {
    return JSON.parse(JSON.stringify(searches, searchesReplacer));
  } catch (e) {
    console.error('cleanSearchesForExport failed', e);
    return searches;
  }
}

/** Remove non-portable keys from a settings object. */
export function stripNonImportableSettings(
  settings: Record<string, any>,
): Record<string, any> {
  const out: Record<string, any> = {};
  Object.keys(settings || {}).forEach((k) => {
    if (!NON_IMPORTABLE_SETTINGS_KEYS.includes(k)) {
      out[k] = settings[k];
    }
  });
  return out;
}

/** True when any selected location carries a secret that must be encrypted. */
export function locationsHaveCredentials(
  locations: TS.S3Location[] = [],
): boolean {
  return locations.some(
    (l) =>
      l &&
      Boolean(
        l.secretAccessKey ||
          l.accessKeyId ||
          l.sessionToken ||
          l.encryptionKey ||
          l.password,
      ),
  );
}

/**
 * Accept current envelopes as-is and wrap legacy single-type files (old
 * `{appName,appVersion,locations}` / `{...,tagGroups}` / `{...,searches}` and
 * decrypted legacy `.tsec` location files) as `exportVersion: 0` so they still
 * import.
 */
export function normalizeEnvelope(obj: any): TransferEnvelope | undefined {
  if (!obj || typeof obj !== 'object') {
    return undefined;
  }
  if (typeof obj.exportVersion === 'number') {
    return obj as TransferEnvelope;
  }
  const hasLegacy =
    Array.isArray(obj.locations) ||
    Array.isArray(obj.tagGroups) ||
    Array.isArray(obj.searches);
  if (!hasLegacy) {
    return undefined;
  }
  return {
    appName: obj.appName || 'TagSpaces',
    appVersion: obj.appVersion || '',
    exportVersion: 0,
    exportDate: obj.exportDate || '',
    settings: undefined,
    locations: Array.isArray(obj.locations) ? obj.locations : undefined,
    tagGroups: Array.isArray(obj.tagGroups) ? obj.tagGroups : undefined,
    searches: Array.isArray(obj.searches) ? obj.searches : undefined,
  };
}

/* ----------------------------- validators -------------------------------- *
 * Each is pure, never throws, drops invalid items, and returns undefined when
 * nothing usable survives. Callers must guard with these before dispatching so
 * a corrupt/empty section can never wipe good state (see CLAUDE.md data-loss
 * notes).
 * ------------------------------------------------------------------------- */

export function validateLocations(x: any): TS.S3Location[] | undefined {
  if (!Array.isArray(x)) {
    return undefined;
  }
  const valid = x.filter(
    (l) =>
      l &&
      typeof l === 'object' &&
      isNonEmptyString(l.uuid) &&
      isNonEmptyString(l.name) &&
      (typeof l.type === 'string' || typeof l.type === 'number'),
  );
  return valid.length > 0 ? valid : undefined;
}

export function validateSearches(x: any): TS.SearchQuery[] | undefined {
  if (!Array.isArray(x)) {
    return undefined;
  }
  const valid = x.filter(
    (s) =>
      s &&
      typeof s === 'object' &&
      isNonEmptyString(s.uuid) &&
      isNonEmptyString(s.title),
  );
  return valid.length > 0 ? valid : undefined;
}

export function validateTagGroups(x: any): TS.TagGroup[] | undefined {
  if (!Array.isArray(x)) {
    return undefined;
  }
  const valid = x.filter(
    (g) =>
      g &&
      typeof g === 'object' &&
      (isNonEmptyString(g.uuid) || isNonEmptyString((g as any).key)) &&
      isNonEmptyString(g.title) &&
      Array.isArray(g.children),
  );
  return valid.length > 0 ? valid : undefined;
}

export function validateSettings(x: any): Record<string, any> | undefined {
  if (!x || typeof x !== 'object' || Array.isArray(x)) {
    return undefined;
  }
  const out = stripNonImportableSettings(x);
  // light type sanity for a few critical keys — drop only the bad ones
  if ('keyBindings' in out && !Array.isArray(out.keyBindings)) {
    delete out.keyBindings;
  }
  if ('aiProviders' in out && !Array.isArray(out.aiProviders)) {
    delete out.aiProviders;
  }
  if ('tagDelimiter' in out && typeof out.tagDelimiter !== 'string') {
    delete out.tagDelimiter;
  }
  if ('interfaceLanguage' in out && typeof out.interfaceLanguage !== 'string') {
    delete out.interfaceLanguage;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

/**
 * Pure settings merge used by the IMPORT_SETTINGS reducer case. Merges the
 * incoming (file) settings over the current trusted state — never over
 * defaults — strips non-portable keys, applies the sensitive `aiProviders` /
 * `author` only when present in the file, and name-merges keyBindings against
 * the defaults so an unknown/removed binding can't break the app.
 */
export function mergeImportedSettings(
  state: Record<string, any>,
  incomingRaw: Record<string, any>,
  defaultKeyBindings: Array<{ name: string }>,
): Record<string, any> {
  const incoming = { ...(incomingRaw || {}) };
  NON_IMPORTABLE_SETTINGS_KEYS.forEach((k) => {
    delete incoming[k];
  });
  if (!('aiProviders' in incoming)) {
    delete incoming.aiProviders;
  }
  if (!('author' in incoming)) {
    delete incoming.author;
  }
  let mergedKeyBindings = state.keyBindings;
  if (Array.isArray(incoming.keyBindings)) {
    const stateKb = Array.isArray(state.keyBindings) ? state.keyBindings : [];
    mergedKeyBindings = (defaultKeyBindings || []).map((x) =>
      Object.assign(
        {},
        x,
        stateKb.find((y: any) => y && y.name === x.name),
        incoming.keyBindings.find((y: any) => y && y.name === x.name),
      ),
    );
    delete incoming.keyBindings;
  }
  return {
    ...state,
    ...incoming,
    keyBindings: mergedKeyBindings,
  };
}

/* -------------------------- password strength ---------------------------- */

export interface PasswordStrength {
  /** 0 (weak) … 4 (strong). */
  score: 0 | 1 | 2 | 3 | 4;
  /** Whether the password is strong enough to encrypt a credential export. */
  ok: boolean;
  label: 'weak' | 'fair' | 'good' | 'strong';
}

// Substrings that should hard-cap the score regardless of length/variety.
const WEAK_SUBSTRINGS = [
  'password',
  'passwort',
  'tagspaces',
  'qwerty',
  'qwertz',
  'letmein',
  'iloveyou',
  'admin',
  'welcome',
  '123456',
  '12345678',
  '111111',
  'abc123',
];

/**
 * Dependency-free passphrase assessment. The export KDF is deliberately slow
 * (PBKDF2 600k), so the real risk is short/dictionary passwords — this gates
 * those out while still letting a long multi-word passphrase through even if
 * it uses a single character class.
 */
export function evaluatePasswordStrength(pw: string): PasswordStrength {
  const toLabel = (s: number): PasswordStrength['label'] =>
    s <= 1 ? 'weak' : s === 2 ? 'fair' : s === 3 ? 'good' : 'strong';

  if (!pw) {
    return { score: 0, ok: false, label: 'weak' };
  }
  const len = pw.length;
  let score = 0;
  if (len >= 8) score += 1;
  if (len >= 12) score += 1;
  if (len >= 16) score += 1;

  const classes =
    (/[a-z]/.test(pw) ? 1 : 0) +
    (/[A-Z]/.test(pw) ? 1 : 0) +
    (/[0-9]/.test(pw) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(pw) ? 1 : 0);
  if (classes >= 3) score += 1;

  // Penalties
  if (len < 8) {
    score = 0;
  }
  if (/^(.)\1+$/.test(pw)) {
    score = 0; // a single repeated character
  }
  const lower = pw.toLowerCase();
  if (WEAK_SUBSTRINGS.some((w) => lower.includes(w))) {
    score = Math.min(score, 1);
  }

  const clamped = Math.max(0, Math.min(4, score)) as PasswordStrength['score'];
  return {
    score: clamped,
    // Require a long passphrase or a varied 10+ char password.
    ok: clamped >= 3 && len >= 10,
    label: toLabel(clamped),
  };
}
