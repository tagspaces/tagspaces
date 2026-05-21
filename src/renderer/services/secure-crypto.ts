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
 * Password-based encryption for export files (credentials inside).
 *
 * Threat model: an attacker obtains the exported `.tsec` file and runs an
 * offline dictionary/brute-force attack against the user's passphrase. The
 * defenses are a slow KDF (PBKDF2) and authenticated encryption.
 *
 * Format (cleartext JSON header so we always know how to read it back):
 *   { tsenc: 2, cipher, kdf, iter, salt, iv, ct, mac? }
 *
 * - cipher "AES-256-GCM": AES-GCM via Web Crypto (auth tag in `ct`). Preferred.
 * - cipher "AES-256-CBC-HMAC-SHA256": CryptoJS fallback for environments
 *   without a usable `crypto.subtle` (e.g. Cordova file://). Encrypt-then-MAC.
 * - Legacy v1 files (raw CryptoJS `U2FsdGVkX1...` from the old locations
 *   export) are still decryptable so existing `.tsec` files keep working.
 *
 * Both v2 variants use PBKDF2-SHA256 with a random 16-byte salt; the iteration
 * count is stored in the header so future tuning never breaks old files.
 */

/* eslint-disable no-bitwise -- byte ↔ base64 / WordArray conversion and the
   constant-time MAC compare legitimately require bitwise operators. */

import CryptoJS from 'crypto-js';

const TSENC_VERSION = 2;
// OWASP-class iteration counts. Web Crypto is native (fast); the CryptoJS
// fallback is pure-JS and far slower, so it uses a lower but still strong count.
const PBKDF2_ITER_SUBTLE = 600000;
const PBKDF2_ITER_CRYPTOJS = 120000;

function getSubtle(): SubtleCrypto | undefined {
  try {
    const c: any =
      typeof globalThis !== 'undefined'
        ? (globalThis as any).crypto
        : undefined;
    return c && c.subtle ? (c.subtle as SubtleCrypto) : undefined;
  } catch (e) {
    return undefined;
  }
}

function randomBytes(len: number): Uint8Array {
  const c: any = (globalThis as any).crypto;
  if (c && typeof c.getRandomValues === 'function') {
    return c.getRandomValues(new Uint8Array(len));
  }
  // Fallback: CryptoJS CSPRNG
  const wa = CryptoJS.lib.WordArray.random(len);
  const out = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) {
    out[i] = (wa.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
  }
  return out;
}

function bytesToB64(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i += 1) {
    bin += String.fromCharCode(bytes[i]);
  }
  return btoa(bin);
}

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) {
    out[i] = bin.charCodeAt(i);
  }
  return out;
}

/** Standalone ArrayBuffer copy — satisfies Web Crypto's BufferSource type. */
function ab(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
}

function bytesToWordArray(bytes: Uint8Array): CryptoJS.lib.WordArray {
  const words: number[] = [];
  for (let i = 0; i < bytes.length; i += 1) {
    words[i >>> 2] |= bytes[i] << (24 - (i % 4) * 8);
  }
  return CryptoJS.lib.WordArray.create(words, bytes.length);
}

/** Length-safe constant-time string compare (defends MAC verification). */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/* ----------------------------- Web Crypto ------------------------------- */

async function deriveAesGcmKey(
  password: string,
  salt: Uint8Array,
  iterations: number,
): Promise<CryptoKey> {
  const subtle = getSubtle();
  const keyMaterial = await subtle.importKey(
    'raw',
    ab(new TextEncoder().encode(password)),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return subtle.deriveKey(
    { name: 'PBKDF2', salt: ab(salt), iterations, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

/* ------------------------- CryptoJS fallback ---------------------------- */

function deriveCryptoJsKeys(
  password: string,
  saltWa: CryptoJS.lib.WordArray,
  iterations: number,
) {
  // 64 bytes: 32 for AES-256, 32 for HMAC-SHA256.
  const dk = CryptoJS.PBKDF2(password, saltWa, {
    keySize: 64 / 4,
    iterations,
    hasher: CryptoJS.algo.SHA256,
  });
  const encKey = CryptoJS.lib.WordArray.create(dk.words.slice(0, 8), 32);
  const macKey = CryptoJS.lib.WordArray.create(dk.words.slice(8, 16), 32);
  return { encKey, macKey };
}

/* ------------------------------- API ------------------------------------ */

export function isEncryptedEnvelope(text: string): boolean {
  try {
    const o = JSON.parse(text);
    return o && typeof o === 'object' && o.tsenc === TSENC_VERSION;
  } catch (e) {
    // Legacy v1 (raw CryptoJS OpenSSL base64) is not JSON.
    return /^U2FsdGVk/.test(text.trim());
  }
}

export async function encryptString(
  plaintext: string,
  password: string,
): Promise<string> {
  const subtle = getSubtle();
  const salt = randomBytes(16);

  if (subtle) {
    const iv = randomBytes(12);
    const key = await deriveAesGcmKey(password, salt, PBKDF2_ITER_SUBTLE);
    const ctBuf = await subtle.encrypt(
      { name: 'AES-GCM', iv: ab(iv) },
      key,
      ab(new TextEncoder().encode(plaintext)),
    );
    return JSON.stringify({
      tsenc: TSENC_VERSION,
      cipher: 'AES-256-GCM',
      kdf: 'PBKDF2-SHA256',
      iter: PBKDF2_ITER_SUBTLE,
      salt: bytesToB64(salt),
      iv: bytesToB64(iv),
      ct: bytesToB64(new Uint8Array(ctBuf)),
    });
  }

  // Fallback: PBKDF2 + AES-CBC + HMAC-SHA256 (encrypt-then-MAC).
  const saltWa = bytesToWordArray(salt);
  const ivBytes = randomBytes(16);
  const ivWa = bytesToWordArray(ivBytes);
  const { encKey, macKey } = deriveCryptoJsKeys(
    password,
    saltWa,
    PBKDF2_ITER_CRYPTOJS,
  );
  const enc = CryptoJS.AES.encrypt(plaintext, encKey, {
    iv: ivWa,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  const saltB64 = bytesToB64(salt);
  const ivB64 = bytesToB64(ivBytes);
  const ctB64 = enc.ciphertext.toString(CryptoJS.enc.Base64);
  const mac = CryptoJS.HmacSHA256(
    `${saltB64}.${ivB64}.${ctB64}`,
    macKey,
  ).toString();
  return JSON.stringify({
    tsenc: TSENC_VERSION,
    cipher: 'AES-256-CBC-HMAC-SHA256',
    kdf: 'PBKDF2-SHA256',
    iter: PBKDF2_ITER_CRYPTOJS,
    salt: saltB64,
    iv: ivB64,
    ct: ctB64,
    mac,
  });
}

/** Decrypt v2 (GCM or CBC-HMAC) or legacy v1. undefined on any failure. */
export async function decryptString(
  text: string,
  password: string,
): Promise<string | undefined> {
  let header: any;
  try {
    header = JSON.parse(text);
  } catch (e) {
    header = undefined;
  }

  // ---- v2 ----
  if (header && header.tsenc === TSENC_VERSION) {
    try {
      const salt = b64ToBytes(header.salt);
      const iter = Number(header.iter) || PBKDF2_ITER_SUBTLE;

      if (header.cipher === 'AES-256-GCM') {
        const subtle = getSubtle();
        if (!subtle) {
          return undefined; // GCM file on a platform without Web Crypto
        }
        const key = await deriveAesGcmKey(password, salt, iter);
        const ptBuf = await subtle.decrypt(
          { name: 'AES-GCM', iv: ab(b64ToBytes(header.iv)) },
          key,
          ab(b64ToBytes(header.ct)),
        );
        return new TextDecoder().decode(ptBuf);
      }

      if (header.cipher === 'AES-256-CBC-HMAC-SHA256') {
        const { encKey, macKey } = deriveCryptoJsKeys(
          password,
          bytesToWordArray(salt),
          iter,
        );
        const expectedMac = CryptoJS.HmacSHA256(
          `${header.salt}.${header.iv}.${header.ct}`,
          macKey,
        ).toString();
        if (
          typeof header.mac !== 'string' ||
          !constantTimeEqual(expectedMac, header.mac)
        ) {
          return undefined; // tampered or wrong password
        }
        const decrypted = CryptoJS.AES.decrypt(
          CryptoJS.lib.CipherParams.create({
            ciphertext: CryptoJS.enc.Base64.parse(header.ct),
          }),
          encKey,
          {
            iv: bytesToWordArray(b64ToBytes(header.iv)),
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
          },
        );
        const txt = decrypted.toString(CryptoJS.enc.Utf8);
        return txt || undefined;
      }
      return undefined; // unknown cipher
    } catch (e) {
      return undefined;
    }
  }

  // ---- legacy v1: raw CryptoJS OpenSSL (old locations .tsec) ----
  try {
    const bytes = CryptoJS.AES.decrypt(text.trim(), password);
    const txt = bytes.toString(CryptoJS.enc.Utf8);
    return txt || undefined;
  } catch (e) {
    return undefined;
  }
}

/* ------------------------------------------------------------------ */
/* Synchronous raw-key cipher — used by the redux-persist credentials  */
/* transform on every write. The raw key is derived from the user      */
/* password ONCE at unlock/enable (see `deriveRawKey` below); no       */
/* PBKDF2 per write. Distinct prefix so a value carries its scheme.    */
/* ------------------------------------------------------------------ */

/** Prefix for password-based at-rest credential encryption (CBC + HMAC). */
export const PWENC_PREFIX = 'tsenc:p1:';
/** Fixed plaintext the verifier blob encrypts — proves the right password. */
const VERIFIER_SENTINEL = 'tsenc-verifier-v1';

/** Default PBKDF2 iteration count for the available KDF backend. */
export function defaultKdfIterations(): number {
  return getSubtle() ? PBKDF2_ITER_SUBTLE : PBKDF2_ITER_CRYPTOJS;
}

/** Random 16-byte base64 salt for PBKDF2 (not secret; stored alongside). */
export function makeKdfSalt(): string {
  return bytesToB64(randomBytes(16));
}

/** Copy a CryptoJS WordArray's leading bytes into a Uint8Array. */
function wordArrayToBytes(wa: CryptoJS.lib.WordArray, len: number): Uint8Array {
  const out = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) {
    out[i] = (wa.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
  }
  return out;
}

/**
 * PBKDF2 → 64-byte raw key (32 for AES-256-CBC + 32 for HMAC-SHA256).
 * Async by necessity (PBKDF2 is expensive); call ONCE at unlock/enable.
 */
export async function deriveRawKey(
  password: string,
  saltB64: string,
  iterations: number,
): Promise<Uint8Array> {
  const salt = b64ToBytes(saltB64);
  const subtle = getSubtle();
  if (subtle) {
    const km = await subtle.importKey(
      'raw',
      ab(new TextEncoder().encode(password)),
      'PBKDF2',
      false,
      ['deriveBits'],
    );
    const bits = await subtle.deriveBits(
      { name: 'PBKDF2', salt: ab(salt), iterations, hash: 'SHA-256' },
      km,
      512,
    );
    return new Uint8Array(bits);
  }
  // CryptoJS fallback — produces the same 64-byte material via PBKDF2-SHA256.
  const { encKey, macKey } = deriveCryptoJsKeys(
    password,
    bytesToWordArray(salt),
    iterations,
  );
  const out = new Uint8Array(64);
  out.set(wordArrayToBytes(encKey, 32), 0);
  out.set(wordArrayToBytes(macKey, 32), 32);
  return out;
}

function splitRawKey(rawKey: Uint8Array): {
  encWa: CryptoJS.lib.WordArray;
  macWa: CryptoJS.lib.WordArray;
} {
  if (!(rawKey instanceof Uint8Array) || rawKey.length !== 64) {
    throw new Error('secure-crypto: invalid raw key');
  }
  return {
    encWa: bytesToWordArray(rawKey.subarray(0, 32)),
    macWa: bytesToWordArray(rawKey.subarray(32, 64)),
  };
}

/**
 * AES-256-CBC + HMAC-SHA256 (encrypt-then-MAC), synchronous.
 *
 * Wire format after the prefix:
 *   ivB64 "." ctB64 "." macHex
 */
export function encryptWithRawKey(
  plaintext: string,
  rawKey: Uint8Array,
): string {
  const { encWa, macWa } = splitRawKey(rawKey);
  const iv = randomBytes(16);
  const ivWa = bytesToWordArray(iv);
  const enc = CryptoJS.AES.encrypt(plaintext, encWa, {
    iv: ivWa,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  const ivB64 = bytesToB64(iv);
  const ctB64 = enc.ciphertext.toString(CryptoJS.enc.Base64);
  const mac = CryptoJS.HmacSHA256(`${ivB64}.${ctB64}`, macWa).toString();
  return `${PWENC_PREFIX}${ivB64}.${ctB64}.${mac}`;
}

/** Returns the plaintext, or undefined on tamper / wrong key / malformed. */
export function decryptWithRawKey(
  ciphertext: string,
  rawKey: Uint8Array,
): string | undefined {
  try {
    if (
      typeof ciphertext !== 'string' ||
      !ciphertext.startsWith(PWENC_PREFIX)
    ) {
      return undefined;
    }
    const parts = ciphertext.slice(PWENC_PREFIX.length).split('.');
    if (parts.length !== 3) {
      return undefined;
    }
    const [ivB64, ctB64, mac] = parts;
    const { encWa, macWa } = splitRawKey(rawKey);
    const expected = CryptoJS.HmacSHA256(`${ivB64}.${ctB64}`, macWa).toString();
    if (!constantTimeEqual(expected, mac)) {
      return undefined;
    }
    const ivWa = bytesToWordArray(b64ToBytes(ivB64));
    const decrypted = CryptoJS.AES.decrypt(
      CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Base64.parse(ctB64),
      }),
      encWa,
      { iv: ivWa, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 },
    );
    const txt = decrypted.toString(CryptoJS.enc.Utf8);
    return txt || undefined;
  } catch (e) {
    return undefined;
  }
}

/**
 * Build a verifier blob for the given derived key — encrypts a fixed
 * sentinel string. Stored alongside the salt so a wrong password can be
 * detected without touching credential data.
 */
export function makeVerifier(rawKey: Uint8Array): string {
  return encryptWithRawKey(VERIFIER_SENTINEL, rawKey);
}

/** True iff `blob` decrypts under `rawKey` to the verifier sentinel. */
export function checkVerifier(rawKey: Uint8Array, blob: string): boolean {
  const out = decryptWithRawKey(blob, rawKey);
  return typeof out === 'string' && constantTimeEqual(out, VERIFIER_SENTINEL);
}

/** True if the value is encrypted under any at-rest scheme (`tsenc:*:`). */
export function isAnyRawEncrypted(v: unknown): v is string {
  return typeof v === 'string' && /^tsenc:[a-z0-9]+:/i.test(v);
}
