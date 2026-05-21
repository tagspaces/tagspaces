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
 * Synchronous accessors for the "encrypt stored credentials" feature.
 *
 * The redux-persist transform runs synchronously and only receives a single
 * slice, so it cannot read the opt-in flag from the store. A store
 * subscription (wired in configureStore) keeps `enabled` in sync with
 * `settings.encryptCredentialsAtRest`; the Settings activation handler also
 * sets it explicitly before flushing to remove ordering ambiguity.
 *
 * The persistor reference is parked here so the Settings dialog (deep in the
 * tree, with no persistor context) can flush during enable/disable + scrub.
 *
 * `keySource` and `credentialKey` carry the at-rest mode and (when password
 * mode) the derived 64-byte key for the current tab. The key is in-memory
 * only — never persisted, never written to sessionStorage — so a fresh tab
 * or a hard refresh forces the Unlock screen.
 */

export type KeySource = 'off' | 'keychain' | 'password';

let enabled = false;
let persistorRef: any = null;
let keySource: KeySource = 'off';
let credentialKey: Uint8Array | null = null;

export function setEncryptAtRestEnabled(value: boolean): void {
  enabled = !!value;
}

export function isEncryptAtRestEnabled(): boolean {
  return enabled;
}

export function setPersistorRef(persistor: any): void {
  persistorRef = persistor;
}

export function getPersistorRef(): any {
  return persistorRef;
}

export function setKeySource(source: KeySource): void {
  // NOTE: do NOT auto-clear `credentialKey` here. The store subscription
  // can briefly set source='off' during the gap between dispatching the
  // `encryptCredentialsAtRest` and `encryptCredentialsKeySource` actions;
  // if we cleared the key on that transient downgrade, the next persist
  // write would find no provider and write plaintext. Callers that
  // genuinely leave password mode (disable flow, UnlockScreen reset)
  // clear the key explicitly via `setCredentialKey(null)`.
  keySource = source === 'keychain' || source === 'password' ? source : 'off';
}

export function getKeySource(): KeySource {
  return keySource;
}

export function setCredentialKey(rawKey: Uint8Array | null): void {
  credentialKey = rawKey instanceof Uint8Array ? rawKey : null;
}

export function getCredentialKey(): Uint8Array | null {
  return credentialKey;
}

export function hasCredentialKey(): boolean {
  return credentialKey !== null;
}
