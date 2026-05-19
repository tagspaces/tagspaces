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
 * Synchronous AES-256-GCM for at-rest encryption of credential strings.
 *
 * Pure Node `crypto` — no `electron` import — so this module loads in the
 * Playwright unit harness and is testable with a fixed key. GCM provides the
 * authentication tag for free, so no separate HMAC is needed.
 *
 * Wire format (after the prefix):  b64(iv12) "." b64(tag16) "." b64(ct)
 *
 * The 256-bit key is high-entropy random (see secureStorage.ts), so there is
 * deliberately NO password KDF here — this runs on every redux-persist write.
 */

import crypto from 'crypto';

export const RAWENC_PREFIX = 'tsenc:v1:';

const IV_BYTES = 12; // GCM standard nonce length
const TAG_BYTES = 16;
const KEY_BYTES = 32; // AES-256

export function isRawEncrypted(v: unknown): v is string {
  return typeof v === 'string' && v.startsWith(RAWENC_PREFIX);
}

export function encryptWithKey(plaintext: string, key: Buffer): string {
  if (!Buffer.isBuffer(key) || key.length !== KEY_BYTES) {
    throw new Error('credentialCipher: invalid key');
  }
  const iv = crypto.randomBytes(IV_BYTES);
  // Normalize Buffers to Uint8Array at the crypto boundary: the pinned
  // @types/node (20.x) types `Buffer` without the array-buffer generic that
  // TS 5.9's lib `Uint8Array<TArrayBuffer>` / `crypto` overloads expect.
  const cipher = crypto.createCipheriv(
    'aes-256-gcm',
    new Uint8Array(key),
    new Uint8Array(iv),
  );
  const ct = Buffer.concat([
    new Uint8Array(cipher.update(plaintext, 'utf8')),
    new Uint8Array(cipher.final()),
  ]);
  const tag = cipher.getAuthTag();
  return `${RAWENC_PREFIX}${iv.toString('base64')}.${tag.toString(
    'base64',
  )}.${ct.toString('base64')}`;
}

/** Returns the plaintext, or undefined on tamper / wrong key / malformed. */
export function decryptWithKey(
  ciphertext: string,
  key: Buffer,
): string | undefined {
  try {
    if (
      !isRawEncrypted(ciphertext) ||
      !Buffer.isBuffer(key) ||
      key.length !== KEY_BYTES
    ) {
      return undefined;
    }
    const parts = ciphertext.slice(RAWENC_PREFIX.length).split('.');
    if (parts.length !== 3) {
      return undefined;
    }
    const iv = Buffer.from(parts[0], 'base64');
    const tag = Buffer.from(parts[1], 'base64');
    const ct = Buffer.from(parts[2], 'base64');
    if (iv.length !== IV_BYTES || tag.length !== TAG_BYTES) {
      return undefined;
    }
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      new Uint8Array(key),
      new Uint8Array(iv),
    );
    decipher.setAuthTag(new Uint8Array(tag));
    const pt = Buffer.concat([
      new Uint8Array(decipher.update(new Uint8Array(ct))),
      new Uint8Array(decipher.final()),
    ]);
    return pt.toString('utf8');
  } catch (e) {
    return undefined;
  }
}
