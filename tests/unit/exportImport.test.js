import { describe, expect, test } from '@playwright/test';
import {
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

describe('export-import validators', () => {
  describe('validateLocations', () => {
    test('keeps valid items, drops malformed ones', () => {
      const out = validateLocations([
        { uuid: 'a', name: 'Loc A', type: '1' },
        { uuid: '', name: 'no uuid', type: '0' },
        { name: 'missing uuid', type: '0' },
        { uuid: 'b', name: 'Loc B', type: 0 },
        null,
        'not an object',
      ]);
      expect(out).toHaveLength(2);
      expect(out.map((l) => l.uuid)).toEqual(['a', 'b']);
    });

    test('non-array → undefined', () => {
      expect(validateLocations(undefined)).toBeUndefined();
      expect(validateLocations({})).toBeUndefined();
    });

    test('all invalid → undefined (never an empty array)', () => {
      expect(validateLocations([{ name: 'x' }, {}])).toBeUndefined();
    });
  });

  describe('validateSearches', () => {
    test('requires uuid + title', () => {
      const out = validateSearches([
        { uuid: 's1', title: 'Search 1' },
        { uuid: 's2' },
        { title: 'no uuid' },
      ]);
      expect(out).toHaveLength(1);
      expect(out[0].uuid).toBe('s1');
    });

    test('non-array → undefined', () => {
      expect(validateSearches('nope')).toBeUndefined();
    });
  });

  describe('validateTagGroups', () => {
    test('requires uuid|key + title + children array', () => {
      const out = validateTagGroups([
        { uuid: 'g1', title: 'G1', children: [] },
        { key: 'legacy', title: 'Legacy', children: [{ title: 't' }] },
        { uuid: 'g3', title: 'no children' },
        { uuid: 'g4', children: [] },
      ]);
      expect(out).toHaveLength(2);
      expect(out.map((g) => g.title)).toEqual(['G1', 'Legacy']);
    });

    test('all invalid → undefined', () => {
      expect(validateTagGroups([{ title: 'x' }])).toBeUndefined();
    });
  });

  describe('validateSettings', () => {
    test('strips non-importable keys', () => {
      const out = validateSettings({
        interfaceLanguage: 'de_DE',
        appDataPath: '/secret/path',
        userId: 'u1',
        supportedThemes: ['light'],
        tagDelimiter: ' ',
      });
      expect(out).toEqual({ interfaceLanguage: 'de_DE', tagDelimiter: ' ' });
      expect('appDataPath' in out).toBe(false);
      expect('userId' in out).toBe(false);
      expect('supportedThemes' in out).toBe(false);
    });

    test('drops only the bad-typed critical keys', () => {
      const out = validateSettings({
        interfaceLanguage: 5,
        keyBindings: 'not-array',
        aiProviders: {},
        tagDelimiter: ' ',
      });
      expect(out).toEqual({ tagDelimiter: ' ' });
    });

    test('non-object or empty-after-strip → undefined', () => {
      expect(validateSettings(null)).toBeUndefined();
      expect(validateSettings([1, 2])).toBeUndefined();
      expect(validateSettings({ appDataPath: '/x', userId: 'y' })).toBeUndefined();
    });
  });

  describe('normalizeEnvelope', () => {
    test('passes a versioned envelope through unchanged', () => {
      const env = { exportVersion: 1, settings: { a: 1 } };
      expect(normalizeEnvelope(env)).toBe(env);
    });

    test('wraps a legacy single-type file as exportVersion 0', () => {
      const out = normalizeEnvelope({
        appName: 'TagSpaces',
        appVersion: '6.0.0',
        tagGroups: [{ uuid: 'g', title: 'G', children: [] }],
      });
      expect(out.exportVersion).toBe(0);
      expect(out.tagGroups).toHaveLength(1);
      expect(out.settings).toBeUndefined();
    });

    test('junk → undefined', () => {
      expect(normalizeEnvelope(null)).toBeUndefined();
      expect(normalizeEnvelope({ foo: 'bar' })).toBeUndefined();
    });
  });

  describe('stripNonImportableSettings / cleanSearchesForExport', () => {
    test('strip removes every blacklisted key', () => {
      const input = {};
      NON_IMPORTABLE_SETTINGS_KEYS.forEach((k) => {
        input[k] = 'x';
      });
      input.keepMe = true;
      expect(stripNonImportableSettings(input)).toEqual({ keepMe: true });
    });

    test('clean drops currentDirectory and empty fileTypes', () => {
      const out = cleanSearchesForExport([
        {
          uuid: 's',
          title: 'S',
          currentDirectory: '/should/be/removed',
          fileTypes: [],
          textQuery: 'keep',
        },
      ]);
      expect(out[0].currentDirectory).toBeUndefined();
      expect(out[0].fileTypes).toBeUndefined();
      expect(out[0].textQuery).toBe('keep');
    });
  });

  describe('locationsHaveCredentials', () => {
    test('true when a secret is present', () => {
      expect(
        locationsHaveCredentials([{ uuid: 'a', secretAccessKey: 'sk' }]),
      ).toBe(true);
      expect(locationsHaveCredentials([{ uuid: 'a', password: 'p' }])).toBe(
        true,
      );
    });

    test('false for plain local locations', () => {
      expect(
        locationsHaveCredentials([{ uuid: 'a', name: 'local', type: '0' }]),
      ).toBe(false);
      expect(locationsHaveCredentials([])).toBe(false);
    });
  });

  describe('mergeImportedSettings', () => {
    const defaultKb = [
      { name: 'saveDocument', command: 'ctrl+s' },
      { name: 'openParentDir', command: 'backspace' },
    ];

    test('merges over current state, never over defaults; keeps local-only keys', () => {
      const state = {
        interfaceLanguage: 'en',
        localOnlyPref: 42,
        keyBindings: defaultKb,
      };
      const out = mergeImportedSettings(
        state,
        { interfaceLanguage: 'de_DE' },
        defaultKb,
      );
      expect(out.interfaceLanguage).toBe('de_DE');
      expect(out.localOnlyPref).toBe(42); // not wiped
    });

    test('strips system keys and applies aiProviders/author only if present', () => {
      const state = { author: 'me', aiProviders: [{ id: '1' }], x: 1 };
      const out = mergeImportedSettings(
        state,
        { appDataPath: '/evil', x: 2 },
        defaultKb,
      );
      expect(out.appDataPath).toBeUndefined();
      expect(out.x).toBe(2);
      expect(out.author).toBe('me'); // untouched (absent in file)
      expect(out.aiProviders).toEqual([{ id: '1' }]);
    });

    test('applies aiProviders/author when present in the file', () => {
      const state = { author: 'old', aiProviders: [] };
      const out = mergeImportedSettings(
        state,
        { author: 'new', aiProviders: [{ id: '2' }] },
        defaultKb,
      );
      expect(out.author).toBe('new');
      expect(out.aiProviders).toEqual([{ id: '2' }]);
    });

    test('name-merges keyBindings against defaults (unknown bindings dropped)', () => {
      const state = { keyBindings: defaultKb };
      const out = mergeImportedSettings(
        state,
        {
          keyBindings: [
            { name: 'saveDocument', command: 'cmd+s' },
            { name: 'totallyUnknown', command: 'f13' },
          ],
        },
        defaultKb,
      );
      expect(out.keyBindings).toHaveLength(2); // only known defaults
      const save = out.keyBindings.find((k) => k.name === 'saveDocument');
      expect(save.command).toBe('cmd+s'); // overridden from file
      const parent = out.keyBindings.find((k) => k.name === 'openParentDir');
      expect(parent.command).toBe('backspace'); // kept from default/state
      expect(
        out.keyBindings.find((k) => k.name === 'totallyUnknown'),
      ).toBeUndefined();
    });
  });

  describe('evaluatePasswordStrength', () => {
    test('empty / very short → weak, not ok', () => {
      expect(evaluatePasswordStrength('')).toMatchObject({
        score: 0,
        ok: false,
        label: 'weak',
      });
      expect(evaluatePasswordStrength('Ab1!')).toMatchObject({
        ok: false,
        label: 'weak',
      });
    });

    test('common / repeated passwords are capped', () => {
      expect(evaluatePasswordStrength('password').ok).toBe(false);
      expect(evaluatePasswordStrength('Password123!').ok).toBe(false); // contains "password"
      expect(evaluatePasswordStrength('aaaaaaaaaaaa')).toMatchObject({
        score: 0,
        ok: false,
      });
      expect(evaluatePasswordStrength('TagSpaces2024!').ok).toBe(false);
    });

    test('varied 12+ char password passes', () => {
      const s = evaluatePasswordStrength('Tr0ub4dour&3xy');
      expect(s.ok).toBe(true);
      expect(['good', 'strong']).toContain(s.label);
    });

    test('long single-class passphrase passes', () => {
      const s = evaluatePasswordStrength('correcthorsebatterystaple');
      expect(s.ok).toBe(true);
      expect(s.score).toBeGreaterThanOrEqual(3);
    });

    test('short-but-complex stays below the gate', () => {
      // 9 chars, all classes, but under the 10-char floor
      expect(evaluatePasswordStrength('Ab1!cd2?').ok).toBe(false);
    });
  });
});
