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
 */

/**
 * Pure, dependency-free helpers extracted from io-capacitor.ts so the core
 * logic (path → Directory mapping, binary→base64 encoding, write-content
 * classification) can be unit-tested in Node without the native Capacitor
 * bridge. The `platform`, `Directory` and `Encoding` values are injected by the
 * caller (io-capacitor.ts passes `Capacitor.getPlatform()`, `Directory` and
 * `Encoding`) so these functions are deterministic.
 */

export interface CapacitorDirectories {
  Documents: string;
  ExternalStorage: string;
}

export interface ResolvedCapacitorPath {
  path: string;
  directory: string | undefined;
}

/**
 * True when a path has already been converted into a URL the WebView can load —
 * i.e. Capacitor.convertFileSrc output (https://localhost/_capacitor_file_/… on
 * Android, capacitor://localhost/… on iOS) or a file/blob/data URL.
 *
 * Native filesystem paths never carry a scheme, so this cleanly separates "raw
 * path, still needs resolving" from "already resolved". Callers use it as an
 * idempotency guard: feeding an already-converted URL back into
 * resolveCapacitorPath() would treat it as a *relative* path and produce
 * file:///…/https:/localhost/_capacitor_file_/… , which 404s.
 */
export function isResolvedWebViewUrl(path: string): boolean {
  if (!path) return false;
  return /^(https?|capacitor|file|blob|data):/i.test(path);
}

/**
 * Determine the Capacitor Directory enum value and relative path from an
 * absolute/location-relative path.
 * - iOS: relative to Directory.Documents (the App Documents location stores "/",
 *   which maps to the Documents root → "."). iCloud ubiquity-container paths
 *   ("/Mobile Documents/" or "file://…") are passed through as percent-encoded
 *   raw file:// URLs with no `directory`.
 * - Android (MANAGE_EXTERNAL_STORAGE): everything maps to Directory.ExternalStorage,
 *   stripping the sdcard / storage prefixes to a relative path.
 */
export function resolveCapacitorPath(
  absolutePath: string,
  platform: string,
  Directory: CapacitorDirectories,
): ResolvedCapacitorPath {
  let path = absolutePath;

  if (platform === 'ios') {
    // iCloud ubiquity-container paths live outside the app sandbox, so they
    // can't be addressed relative to Directory.Documents. They are passed as
    // raw absolute paths (containing "/Mobile Documents/"). @capacitor/filesystem
    // addresses raw paths when no `directory` is given, but resolves them with
    // URL(string:) — which returns nil for unencoded spaces. So build a
    // percent-encoded file:// URL here (slashes preserved, spaces → %20).
    if (path.startsWith('file://') || path.includes('/Mobile Documents/')) {
      const abs = path.startsWith('file://') ? path.substring(7) : path;
      const encoded = abs.split('/').map(encodeURIComponent).join('/');
      return { path: 'file://' + encoded, directory: undefined };
    }
    // iOS: paths are relative to Documents directory
    if (path.startsWith('/')) {
      path = path.substring(1);
    }
    // Root of Documents = empty string or just "/" → use "." for Capacitor
    if (!path || path === '') {
      path = '.';
    }
    return { path, directory: Directory.Documents };
  }

  // Android: use ExternalStorage for sdcard paths
  if (path.startsWith('sdcard/')) {
    path = path.substring(7); // Remove 'sdcard/' prefix
    if (!path || path === '') path = '.';
    return { path, directory: Directory.ExternalStorage };
  }
  if (path.startsWith('/sdcard/')) {
    path = path.substring(8);
    if (!path || path === '') path = '.';
    return { path, directory: Directory.ExternalStorage };
  }
  if (path.startsWith('/storage/emulated/0/')) {
    path = path.substring(20);
    if (!path || path === '') path = '.';
    return { path, directory: Directory.ExternalStorage };
  }
  if (path.startsWith('/')) {
    // Absolute path — use ExternalStorage with relative path
    // For paths outside /storage/emulated/0, this may need MANAGE_EXTERNAL_STORAGE
    path = path.substring(1);
    if (!path || path === '') path = '.';
    return { path, directory: Directory.ExternalStorage };
  }

  if (!path || path === '') path = '.';
  return { path, directory: Directory.ExternalStorage };
}

/** Collapse any run of 2+ slashes into one. Passes through falsy input. */
export function normalizePath(path: string): string {
  if (!path) return path;
  return path.replace(/\/+/g, '/');
}

/**
 * Standard device folder map per platform. Keys deliberately match the
 * core.json translation keys (*Folder) so auto-created locations and the
 * onboarding slide get localized names instead of raw keys.
 */
export function getDevicePathsForPlatform(
  platform: string,
): Record<string, string> {
  if (platform === 'ios') {
    // The app's sandboxed Documents directory. iCloud Drive is resolved
    // separately via getICloudContainer().
    return {
      appDocumentsFolder: '/',
    };
  }
  return {
    dcimFolder: 'sdcard/DCIM/',
    documentsFolder: 'sdcard/Documents/',
    downloadsFolder: 'sdcard/Download/',
    picturesFolder: 'sdcard/Pictures/',
    moviesFolder: 'sdcard/Movies/',
  };
}

/**
 * Convert an ArrayBuffer or any TypedArray *view* (Uint8Array, etc.) to a base64
 * string. Critical: base64ToUint8Array() returns a Uint8Array, which is a view —
 * `instanceof ArrayBuffer` is false. Without the `ArrayBuffer.isView` branch the
 * thumbnail save path falls through to btoa(String(Uint8Array)) and writes
 * "MCwxLDIs..." junk to disk, producing zero-thumbnails on iOS/Android Capacitor.
 */
export function binaryToBase64(blob: ArrayBuffer | ArrayBufferView): string {
  const bytes =
    blob instanceof ArrayBuffer
      ? new Uint8Array(blob)
      : new Uint8Array(blob.buffer, blob.byteOffset, blob.byteLength);
  // Chunked to avoid blowing the JS engine's argument limit on large payloads
  // (apply spreads each byte as a separate argument).
  let binary = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode.apply(
      null,
      bytes.subarray(i, i + CHUNK) as any,
    );
  }
  return btoa(binary);
}

export interface WriteContentPlan {
  // 'text'   → write data as-is with the given encoding (UTF8)
  // 'base64' → write data (already-extracted base64) with no encoding
  // 'binary' → caller must convert the original content to base64 (async)
  mode: 'text' | 'base64' | 'binary';
  data?: string;
  encoding?: string;
}

/**
 * Decide how a value passed to saveFilePromise should be written:
 * - isRaw + string         → text (UTF8)
 * - non-raw data: URI      → extract the base64 payload, write as base64
 * - non-raw string         → text (UTF8)
 * - anything non-string    → binary (caller base64-encodes the bytes)
 *
 * The async base64 conversion is intentionally left to the caller so this
 * function stays pure/synchronous.
 */
export function classifyWriteContent(
  content: any,
  isRaw: boolean,
  Encoding: { UTF8: string },
): WriteContentPlan {
  if (isRaw) {
    if (typeof content === 'string') {
      return { mode: 'text', data: content, encoding: Encoding.UTF8 };
    }
    return { mode: 'binary' };
  }
  if (typeof content === 'string' && content.indexOf(';base64,') > 0) {
    // Data URI with base64
    const contentArray = content.split(';base64,');
    const data = contentArray.length > 1 ? contentArray[1] : contentArray[0];
    return { mode: 'base64', data };
  }
  if (typeof content === 'string') {
    return { mode: 'text', data: content, encoding: Encoding.UTF8 };
  }
  return { mode: 'binary' };
}
