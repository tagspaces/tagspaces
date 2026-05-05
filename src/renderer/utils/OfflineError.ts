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

// Thrown when a remote (S3 / WebDAV) operation is attempted while
// navigator.onLine is false. Detected by name to follow the same convention
// as the AbortError handling already in DirectoryContentContextProvider.
export class OfflineError extends Error {
  constructor(message = 'Network is offline') {
    super(message);
    this.name = 'OfflineError';
  }
}

export function isOfflineError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'name' in err &&
    (err as { name: string }).name === 'OfflineError'
  );
}

/**
 * Initial online state. Reads navigator.onLine when available so that an app
 * launched while offline doesn't start in a falsely-online state. The window
 * 'online'/'offline' events (wired in services/onlineListener.ts) only fire
 * on transitions, so without this the boot value would lag reality.
 *
 * Falls back to `true` in non-browser contexts (Node/SSR) — being optimistic
 * is correct because remote operations will surface their own errors if the
 * environment can't reach the network.
 */
export function deriveInitialOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

export interface RemoteCapableLocation {
  haveObjectStoreSupport: () => boolean;
  haveWebDavSupport: () => boolean;
  name: string;
}

/**
 * Returns a rejected Promise<OfflineError> when `loc` is a remote (S3/WebDAV)
 * location and navigator.onLine is false. Returns null otherwise.
 *
 * Free function (not a class method) so adding offline checks doesn't change
 * the structural shape of CommonLocation — sites like dialogs spread location
 * objects and TS would otherwise complain about a missing class member.
 */
export function offlineRejectionIfRemote(
  loc: RemoteCapableLocation,
  op: string,
): Promise<never> | null {
  if (typeof navigator === 'undefined' || navigator.onLine) return null;
  if (!loc.haveObjectStoreSupport() && !loc.haveWebDavSupport()) return null;
  return Promise.reject(
    new OfflineError(
      `Cannot ${op} on remote location "${loc.name}" while offline`,
    ),
  );
}
