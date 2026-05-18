import { describe, expect, test } from '@playwright/test';
import CryptoJS from 'crypto-js';
import {
  decryptString,
  encryptString,
  isEncryptedEnvelope,
} from '-/services/secure-crypto';

describe('secure-crypto', () => {
  const secret = JSON.stringify({ token: 'super-secret', n: 42 });
  const password = 'correct horse battery staple';

  test('round-trips through encrypt/decrypt', async () => {
    const blob = await encryptString(secret, password);
    expect(isEncryptedEnvelope(blob)).toBe(true);
    const header = JSON.parse(blob);
    expect(header.tsenc).toBe(2);
    expect(header.kdf).toBe('PBKDF2-SHA256');
    expect(header.iter).toBeGreaterThanOrEqual(120000);
    // ciphertext must not leak the plaintext
    expect(blob).not.toContain('super-secret');
    const out = await decryptString(blob, password);
    expect(out).toBe(secret);
  });

  test('wrong password → undefined (no throw)', async () => {
    const blob = await encryptString(secret, password);
    const out = await decryptString(blob, 'wrong password');
    expect(out).toBeUndefined();
  });

  test('tampered ciphertext is rejected (authenticated)', async () => {
    const blob = await encryptString(secret, password);
    const header = JSON.parse(blob);
    // Decode → flip a real ciphertext byte → re-encode, so the mutation is
    // deterministic (a base64 char flip can decode to identical bytes).
    const bytes = Buffer.from(header.ct, 'base64');
    bytes[Math.floor(bytes.length / 2)] ^= 0xff;
    header.ct = bytes.toString('base64');
    const out = await decryptString(JSON.stringify(header), password);
    expect(out).toBeUndefined();
  });

  test('isEncryptedEnvelope detects v2 and legacy, rejects plain json', () => {
    const legacy = CryptoJS.AES.encrypt('hello', 'pw').toString();
    expect(isEncryptedEnvelope(legacy)).toBe(true); // U2FsdGVk...
    expect(isEncryptedEnvelope('{"settings":{}}')).toBe(false);
    expect(isEncryptedEnvelope('not json at all')).toBe(false);
  });

  test('legacy v1 (raw CryptoJS) still decrypts', async () => {
    // Mirrors the old LocationsTransfer.exportLocations format.
    const legacyPayload = JSON.stringify({
      appName: 'TagSpaces',
      appVersion: '6.0.0',
      locations: [{ uuid: 'l1', name: 'L1', type: '1' }],
    });
    const legacyBlob = CryptoJS.AES.encrypt(
      legacyPayload,
      'oldpass',
    ).toString();
    const out = await decryptString(legacyBlob, 'oldpass');
    expect(JSON.parse(out).locations[0].uuid).toBe('l1');
    const bad = await decryptString(legacyBlob, 'nope');
    expect(bad).toBeUndefined();
  });
});
