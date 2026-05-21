import { describe, expect, test } from '@playwright/test';
import crypto from 'crypto';
import {
  transformSlice,
  createCredentialsTransform,
} from '-/services/credentialsTransform';
import {
  PWENC_PREFIX,
  checkVerifier,
  decryptWithRawKey,
  defaultKdfIterations,
  deriveRawKey,
  encryptWithRawKey,
  isAnyRawEncrypted,
  makeKdfSalt,
  makeVerifier,
} from '-/services/secure-crypto';
import { inferKeySource } from '-/services/credentialsBootstrap';
import {
  encryptWithKey,
  decryptWithKey,
  isRawEncrypted,
  RAWENC_PREFIX,
} from '../../src/main/credentialCipher';

const PREFIX = 'tsenc:v1:';

// Reversible fake of the main-process sync IPC: encrypt = prefix+base64,
// decrypt = inverse (null when not decryptable).
function makeFakeSync(opts = {}) {
  const calls = [];
  const fn = (channel, values) => {
    calls.push({ channel, values });
    if (opts.unavailable) {
      return { available: false };
    }
    if (opts.nullResult) {
      return null;
    }
    if (channel === 'encryptCredentials') {
      let out = values.map(
        (v) => PREFIX + Buffer.from(String(v), 'utf8').toString('base64'),
      );
      if (opts.shortEncrypt) {
        out = out.slice(0, -1);
      }
      return { available: true, values: out };
    }
    return {
      available: true,
      values: values.map((v) => {
        if (typeof v === 'string' && v.startsWith(PREFIX)) {
          try {
            return Buffer.from(v.slice(PREFIX.length), 'base64').toString(
              'utf8',
            );
          } catch (e) {
            return null;
          }
        }
        return null; // undecryptable
      }),
    };
  };
  fn.calls = calls;
  return fn;
}

describe('credentialCipher (main, Node crypto)', () => {
  const key = crypto.randomBytes(32);

  test('round-trips and tags with the prefix', () => {
    const secret = 'AKIA-super-secret-value/with+chars=';
    const enc = encryptWithKey(secret, key);
    expect(enc.startsWith(RAWENC_PREFIX)).toBe(true);
    expect(isRawEncrypted(enc)).toBe(true);
    expect(enc.includes(secret)).toBe(false);
    expect(decryptWithKey(enc, key)).toBe(secret);
  });

  test('wrong key → undefined (no throw)', () => {
    const enc = encryptWithKey('hello', key);
    expect(decryptWithKey(enc, crypto.randomBytes(32))).toBeUndefined();
  });

  test('tampered ciphertext is rejected (GCM auth)', () => {
    const enc = encryptWithKey('hello world', key);
    const parts = enc.slice(RAWENC_PREFIX.length).split('.');
    const ct = Buffer.from(parts[2], 'base64');
    ct[Math.floor(ct.length / 2)] ^= 0xff;
    parts[2] = ct.toString('base64');
    const tampered = RAWENC_PREFIX + parts.join('.');
    expect(decryptWithKey(tampered, key)).toBeUndefined();
  });

  test('malformed input → undefined; isRawEncrypted guards', () => {
    expect(decryptWithKey('not-encrypted', key)).toBeUndefined();
    expect(isRawEncrypted('plain')).toBe(false);
    expect(isRawEncrypted(123)).toBe(false);
  });
});

describe('credentialsTransform.transformSlice', () => {
  const loc = () => [
    {
      uuid: 'l1',
      name: 'My S3',
      accessKeyId: 'AKIA123',
      secretAccessKey: 'sshh',
      sessionToken: 'tok',
      encryptionKey: 'enc',
      password: 'pw',
      bucketName: 'bucket',
      region: 'eu',
      endpointURL: 'https://s3',
    },
  ];

  test('locations encrypt→decrypt round-trip; non-secret fields untouched', () => {
    const sync = makeFakeSync();
    const enc = transformSlice(loc(), 'locations', 'encrypt', sync);
    [
      'accessKeyId',
      'secretAccessKey',
      'sessionToken',
      'encryptionKey',
      'password',
    ].forEach((f) => expect(enc[0][f].startsWith(PREFIX)).toBe(true));
    expect(enc[0].name).toBe('My S3');
    expect(enc[0].bucketName).toBe('bucket');
    expect(enc[0].region).toBe('eu');
    expect(enc[0].endpointURL).toBe('https://s3');

    const dec = transformSlice(enc, 'locations', 'decrypt', sync);
    expect(dec[0].secretAccessKey).toBe('sshh');
    expect(dec[0].accessKeyId).toBe('AKIA123');
    expect(dec[0].password).toBe('pw');
  });

  test('settings.mapTileServers round-trip; input not mutated; other keys kept', () => {
    const settings = {
      interfaceLanguage: 'en',
      mapTileServers: [
        {
          uuid: 's1',
          name: 'MapTiler',
          serverURL: 'https://tiles?key=SECRET',
          serverInfo: 'info-secret',
        },
      ],
    };
    const original = JSON.parse(JSON.stringify(settings));
    const sync = makeFakeSync();
    const enc = transformSlice(settings, 'settings', 'encrypt', sync);
    expect(enc).not.toBe(settings);
    expect(enc.mapTileServers).not.toBe(settings.mapTileServers);
    expect(settings).toEqual(original); // live object untouched (COW)
    expect(enc.interfaceLanguage).toBe('en');
    expect(enc.mapTileServers[0].name).toBe('MapTiler');
    expect(enc.mapTileServers[0].serverURL.startsWith(PREFIX)).toBe(true);
    expect(enc.mapTileServers[0].serverInfo.startsWith(PREFIX)).toBe(true);

    const dec = transformSlice(enc, 'settings', 'decrypt', sync);
    expect(dec.mapTileServers[0].serverURL).toBe('https://tiles?key=SECRET');
    expect(dec.mapTileServers[0].serverInfo).toBe('info-secret');
  });

  test('legacy plaintext passes through decrypt unchanged', () => {
    const sync = makeFakeSync();
    const out = transformSlice(loc(), 'locations', 'decrypt', sync);
    expect(out[0].secretAccessKey).toBe('sshh');
    expect(sync.calls.length).toBe(0); // nothing prefixed → no IPC
  });

  test('empty/undefined sensitive fields are skipped', () => {
    const sync = makeFakeSync();
    const input = [{ uuid: 'l', name: 'n', secretAccessKey: '', password: undefined }];
    const out = transformSlice(input, 'locations', 'encrypt', sync);
    expect(out).toBe(input);
    expect(sync.calls.length).toBe(0);
  });

  test('encrypt is idempotent (already-prefixed skipped)', () => {
    const sync = makeFakeSync();
    const enc1 = transformSlice(loc(), 'locations', 'encrypt', sync);
    const enc2 = transformSlice(enc1, 'locations', 'encrypt', sync);
    expect(enc2).toBe(enc1); // nothing left to encrypt → same ref
  });

  test('all-or-nothing: short/unavailable encrypt result leaves slice unchanged', () => {
    const input = loc();
    expect(transformSlice(input, 'locations', 'encrypt', makeFakeSync({ shortEncrypt: true }))).toBe(input);
    expect(transformSlice(input, 'locations', 'encrypt', makeFakeSync({ unavailable: true }))).toBe(input);
    expect(transformSlice(input, 'locations', 'encrypt', makeFakeSync({ nullResult: true }))).toBe(input);
  });

  test('undecryptable element → that field becomes "" (safe for downstream), location otherwise intact', () => {
    const enc = [
      {
        uuid: 'l1',
        name: 'L1',
        accessKeyId: PREFIX + 'this-is-not-valid-base64-decryptable!!!',
        bucketName: 'b',
      },
    ];
    const sync = (channel, values) => ({
      available: true,
      values: values.map(() => null), // decrypt fails
    });
    const out = transformSlice(enc, 'locations', 'decrypt', sync);
    // Empty string — not undefined — so consumers (Leaflet templates,
    // AWS SDK auth, etc.) won't crash on a missing value.
    expect(out[0].accessKeyId).toBe('');
    expect(out[0].name).toBe('L1');
    expect(out[0].bucketName).toBe('b');
  });

  test('settings without mapTileServers → unchanged, no IPC', () => {
    const sync = makeFakeSync();
    const s = { interfaceLanguage: 'en' };
    expect(transformSlice(s, 'settings', 'encrypt', sync)).toBe(s);
    expect(transformSlice({ ...s, mapTileServers: [] }, 'settings', 'encrypt', sync))
      .toEqual({ ...s, mapTileServers: [] });
    expect(sync.calls.length).toBe(0);
  });
});

describe('credentialsTransform factory', () => {
  test('outbound decrypts (flag-independent); inbound is no-op off Electron', () => {
    const sync = makeFakeSync();
    const t = createCredentialsTransform(sync);
    const encrypted = [
      {
        uuid: 'l1',
        name: 'L1',
        secretAccessKey:
          PREFIX + Buffer.from('plain-secret', 'utf8').toString('base64'),
      },
    ];
    // outbound runs regardless of Electron/flag
    const out = t.out(encrypted, 'locations');
    expect(out[0].secretAccessKey).toBe('plain-secret');

    // inbound: AppConfig.isElectron is false under Node → pass-through
    const plain = [{ uuid: 'l', name: 'n', secretAccessKey: 'raw' }];
    const back = t.in(plain, 'locations');
    expect(back).toBe(plain);
  });
});

describe('secure-crypto raw-key cipher (password mode)', () => {
  const saltB64 = makeKdfSalt();
  const iter = Math.min(defaultKdfIterations(), 5000); // fast for tests

  test('deriveRawKey + encrypt/decrypt round-trip', async () => {
    const key = await deriveRawKey('correct horse battery staple', saltB64, iter);
    expect(key).toBeInstanceOf(Uint8Array);
    expect(key.length).toBe(64);

    const plain = 'AKIA-secret-value/+=';
    const enc = encryptWithRawKey(plain, key);
    expect(enc.startsWith(PWENC_PREFIX)).toBe(true);
    expect(enc.includes(plain)).toBe(false);
    expect(isAnyRawEncrypted(enc)).toBe(true);
    expect(decryptWithRawKey(enc, key)).toBe(plain);
  });

  test('wrong password derives a different key → decrypt returns undefined', async () => {
    const k1 = await deriveRawKey('right', saltB64, iter);
    const k2 = await deriveRawKey('wrong', saltB64, iter);
    const enc = encryptWithRawKey('hello', k1);
    expect(decryptWithRawKey(enc, k2)).toBeUndefined();
  });

  test('tampered MAC is rejected', async () => {
    const key = await deriveRawKey('pw', saltB64, iter);
    const enc = encryptWithRawKey('hello', key);
    const parts = enc.slice(PWENC_PREFIX.length).split('.');
    // Flip the last char of the MAC hex.
    parts[2] = parts[2].slice(0, -1) + (parts[2].slice(-1) === '0' ? '1' : '0');
    const tampered = PWENC_PREFIX + parts.join('.');
    expect(decryptWithRawKey(tampered, key)).toBeUndefined();
  });

  test('verifier accepts right key, rejects wrong key', async () => {
    const right = await deriveRawKey('pw1', saltB64, iter);
    const wrong = await deriveRawKey('pw2', saltB64, iter);
    const blob = makeVerifier(right);
    expect(checkVerifier(right, blob)).toBe(true);
    expect(checkVerifier(wrong, blob)).toBe(false);
  });

  test('isAnyRawEncrypted detects v1 + p1, rejects plain', () => {
    expect(isAnyRawEncrypted('tsenc:v1:abc')).toBe(true);
    expect(isAnyRawEncrypted('tsenc:p1:abc')).toBe(true);
    expect(isAnyRawEncrypted('plain')).toBe(false);
    expect(isAnyRawEncrypted(undefined)).toBe(false);
    expect(isAnyRawEncrypted(42)).toBe(false);
  });
});

describe('inferKeySource (bootstrap back-compat)', () => {
  test('flag off → off', () => {
    expect(inferKeySource(false, undefined, true)).toBe('off');
    expect(inferKeySource(false, 'password', true)).toBe('off');
  });

  test('explicit keychain / password is honored', () => {
    expect(inferKeySource(true, 'keychain', true)).toBe('keychain');
    expect(inferKeySource(true, 'password', false)).toBe('password');
  });

  test('shipped Electron-keychain back-compat: flag on, no explicit, Electron → keychain', () => {
    expect(inferKeySource(true, undefined, true)).toBe('keychain');
    expect(inferKeySource(true, 'off', true)).toBe('keychain');
  });

  test('non-Electron without explicit → off', () => {
    expect(inferKeySource(true, undefined, false)).toBe('off');
  });
});

describe('credentialsTransform with a password-style provider', () => {
  // Round-trip-compatible fake using the real sync raw-key cipher
  // construction (but with a non-derived key for speed).
  const rawKey = Uint8Array.from(crypto.randomBytes(64));
  const pwSync = (channel, values) => {
    if (channel === 'encryptCredentials') {
      return {
        available: true,
        values: values.map((v) => encryptWithRawKey(String(v), rawKey)),
      };
    }
    return {
      available: true,
      values: values.map((v) =>
        typeof v === 'string' ? (decryptWithRawKey(v, rawKey) ?? null) : null,
      ),
    };
  };

  test('locations round-trip uses tsenc:p1: and decrypts back', () => {
    const input = [
      {
        uuid: 'l1',
        name: 'L1',
        accessKeyId: 'AKIA',
        secretAccessKey: 'shhh',
      },
    ];
    const enc = transformSlice(input, 'locations', 'encrypt', pwSync);
    expect(enc[0].accessKeyId.startsWith('tsenc:p1:')).toBe(true);
    expect(enc[0].secretAccessKey.startsWith('tsenc:p1:')).toBe(true);
    const dec = transformSlice(enc, 'locations', 'decrypt', pwSync);
    expect(dec[0].accessKeyId).toBe('AKIA');
    expect(dec[0].secretAccessKey).toBe('shhh');
  });

  test('mapTileServers round-trip uses tsenc:p1: and decrypts back', () => {
    const settings = {
      mapTileServers: [
        { uuid: 's1', name: 'M', serverURL: 'https://x?k=K', serverInfo: 'I' },
      ],
    };
    const enc = transformSlice(settings, 'settings', 'encrypt', pwSync);
    expect(enc.mapTileServers[0].serverURL.startsWith('tsenc:p1:')).toBe(true);
    expect(enc.mapTileServers[0].serverInfo.startsWith('tsenc:p1:')).toBe(true);
    const dec = transformSlice(enc, 'settings', 'decrypt', pwSync);
    expect(dec.mapTileServers[0].serverURL).toBe('https://x?k=K');
    expect(dec.mapTileServers[0].serverInfo).toBe('I');
  });

  test('mixed-scheme decrypt: p1 values blank-but-string when only keychain sync is wired (cross-mode safety)', () => {
    // Same shape we'd see if a user switched key sources without disabling
    // first: the persistor still holds tsenc:p1: values but the active
    // provider only knows tsenc:v1:. decryptWithRawKey on a non-PWENC
    // prefix returns undefined → provider null → field set to "" (not
    // undefined — protects downstream consumers).
    const v1Only = (channel, values) => {
      // Mimic the keychain provider: returns null for anything it can't
      // decrypt.
      if (channel === 'decryptCredentials') {
        return { available: true, values: values.map(() => null) };
      }
      return { available: false };
    };
    const enc = [
      {
        uuid: 'l1',
        name: 'L1',
        accessKeyId: encryptWithRawKey('AKIA', rawKey), // tsenc:p1:
        bucketName: 'b',
      },
    ];
    const out = transformSlice(enc, 'locations', 'decrypt', v1Only);
    expect(out[0].accessKeyId).toBe('');
    expect(out[0].bucketName).toBe('b');
    expect(out[0].name).toBe('L1');
  });
});
