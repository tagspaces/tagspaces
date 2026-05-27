// Pure helpers extracted from protocol.ts so they can be unit-tested without
// pulling in electron. Keep this file electron-free.

import { normalize } from 'path';
import { fileURLToPath } from 'url';

/**
 * Convert a tsfile:// request URL to a native filesystem path.
 *
 * Two quirks to handle:
 *
 * 1. The media-player extension preserves Windows backslashes when building
 *    the tsfile:// URL (e.g. tsfile:///E:\test\video.mp4). Node's
 *    fileURLToPath only accepts forward slashes in the URL path component,
 *    so we normalize before handing it off. fileURLToPath then re-produces
 *    the native Windows path with backslashes on its own.
 *
 * 2. Do NOT decodeURIComponent the path before constructing the file:// URL.
 *    fileURLToPath does its own %xx decoding. Pre-decoding turns escapes
 *    like `%5B`/`%5D`/`%20`/`%23` (which appear in filenames such as
 *    `Album [2020] (mix).webm`) into literal `[`/`]`/space/`#` — characters
 *    that are reserved or unsafe in URL paths and make fileURLToPath either
 *    throw or silently lose part of the path (e.g. `#` is treated as the
 *    start of a fragment and the rest of the filename is dropped).
 */
export const requestUrlToFilesystemPath = (
  url: string,
  scheme: string,
): string => {
  let filepath = url.slice(`${scheme}://`.length).replace(/\/$/, '');
  filepath = filepath.replace(/\\/g, '/');
  return normalize(fileURLToPath(`file://${filepath}`));
};

/**
 * Set CORS headers on a Response so tsfile:// resources can be consumed by
 * <video crossOrigin> / fetch() from extension iframes. Echoes the caller's
 * Origin back rather than using `*` so only origins that actually reached the
 * scheme inside this Electron process are served.
 */
export const withCors = (
  response: Response,
  request: { headers: { get: (name: string) => string | null } },
): Response => {
  const origin = request.headers.get('Origin');
  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.append('Vary', 'Origin');
  }
  response.headers.set('Access-Control-Allow-Headers', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  return response;
};
