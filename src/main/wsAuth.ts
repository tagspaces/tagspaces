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
 * Authentication for the local worker server (@tagspaces/tagspaces-ws).
 *
 * The key is generated fresh in memory on every app launch and handed to the
 * worker through its environment. Nothing secret is written to disk or shipped
 * in the package: a key that ships can be read out of the installer by anyone,
 * which is what made the previous build-time `KEY=production-<version>` scheme
 * equivalent to no authentication at all.
 *
 * Tokens are minted per request, expire in seconds, and name the endpoint they
 * are valid for, so a captured token is neither reusable later nor usable
 * against a different endpoint.
 */
import crypto from 'crypto';

// Must match the constants the worker verifies against (tagspaces-ws/auth.js).
const ISSUER = 'tagspaces-main';
const AUDIENCE = 'tagspaces-ws';
const TOKEN_TTL_SECONDS = 60;

let wsKey: string | undefined;

/**
 * Generate this launch's worker key. Called once per worker spawn; a restart
 * of the worker gets a new key and invalidates every token minted before it.
 */
export function generateWsKey(): string {
  wsKey = crypto.randomBytes(32).toString('base64url');
  return wsKey;
}

export function hasWsKey(): boolean {
  return wsKey !== undefined;
}

export function clearWsKey(): void {
  wsKey = undefined;
}

function base64url(input: string): string {
  return Buffer.from(input, 'utf8').toString('base64url');
}

/**
 * Mint a short-lived HS256 token for a single endpoint.
 *
 * Signing is done directly with node's crypto rather than via `jsonwebtoken`:
 * it is a few lines of HMAC, keeps the library (and its bundle weight) out of
 * the main process, and leaves verification — the half where a subtle mistake
 * actually costs something — to the hardened jwt.verify() call in the worker.
 *
 * @param subject the worker pathname this token may be used against, e.g. '/indexer'
 */
export function mintWsToken(subject: string): string {
  if (!wsKey) {
    throw new Error('Worker key not initialized');
  }
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64url(
    JSON.stringify({
      iss: ISSUER,
      aud: AUDIENCE,
      sub: subject,
      iat: now,
      exp: now + TOKEN_TTL_SECONDS,
    }),
  );
  const signingInput = `${header}.${payload}`;
  const signature = crypto
    .createHmac('sha256', wsKey)
    .update(signingInput)
    .digest('base64url');
  return `${signingInput}.${signature}`;
}
