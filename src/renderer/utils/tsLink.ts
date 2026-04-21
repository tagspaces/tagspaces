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

export type TsLinkKind =
  | 'cmd'
  | 'ts'
  | 'external'
  | 'relative'
  | 'self'
  | 'unsupported';

export interface TsLinkParsed {
  kind: TsLinkKind;
  decodedURI: string;
  lid?: string;
  dPath?: string;
  ePath?: string;
  cmdOpen?: string;
  id?: string;
}

export const EXTERNAL_PROTOCOLS = [
  'http://',
  'https://',
  'onenote:',
  'mailto:',
  'tel:',
  'file://',
];

function readParam(name: string, url: string): string | null {
  try {
    const param = new URL(url).searchParams.get(name);
    // Milkdown editor workaround — it appends a trailing backslash to param values.
    return param?.endsWith('\\') ? param.slice(0, -1) : param;
  } catch {
    return null;
  }
}

function safeDecode(value: string | null): string | undefined {
  if (value === null) return undefined;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function isPathEscape(path: string | null | undefined): boolean {
  if (!path) return false;
  return path.includes('../') || path.includes('..\\');
}

export function isRelativeLink(uri: string): boolean {
  if (!uri) return false;
  if (
    uri.startsWith('#') ||
    uri.startsWith('?') ||
    uri.startsWith('/') ||
    uri.startsWith('\\')
  ) {
    return false;
  }
  // Any protocol (http:, ts:, mailto:) or Windows drive letter (C:) — not relative.
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(uri)) return false;
  return true;
}

export function parseTsLink(
  url: string,
  currentPageHref?: string,
): TsLinkParsed {
  let decodedURI = url;
  try {
    decodedURI = decodeURI(url);
  } catch {
    // leave as-is if the URI is malformed
  }

  const cmdOpenRaw = readParam('cmdopen', url);
  const lidRaw = readParam('tslid', url);
  const dPathRaw = readParam('tsdpath', url);
  const ePathRaw = readParam('tsepath', url);
  const idRaw = readParam('tseid', url);

  if (cmdOpenRaw) {
    return {
      kind: 'cmd',
      decodedURI,
      lid: lidRaw || undefined,
      cmdOpen: safeDecode(cmdOpenRaw),
      id: idRaw || undefined,
    };
  }

  if (lidRaw) {
    return {
      kind: 'ts',
      decodedURI,
      lid: safeDecode(lidRaw),
      dPath: safeDecode(dPathRaw),
      ePath: safeDecode(ePathRaw),
      id: idRaw || undefined,
    };
  }

  if (currentPageHref && decodedURI === currentPageHref) {
    return { kind: 'self', decodedURI };
  }

  if (EXTERNAL_PROTOCOLS.some((p) => decodedURI.startsWith(p))) {
    return { kind: 'external', decodedURI };
  }

  if (isRelativeLink(decodedURI)) {
    return { kind: 'relative', decodedURI };
  }

  return { kind: 'unsupported', decodedURI };
}

export function resolveRelativePath(
  baseDir: string,
  relLink: string,
  sep: string,
): string {
  const relPath = relLink
    .replace(/^\.[\/\\]/, '')
    .split(/[\/\\]/)
    .filter((p) => p.length > 0)
    .join(sep);
  if (!relPath) return baseDir;
  // Don't use joinPaths here: on Windows it strips the leading separator of
  // the result (e.g. '/home/...' → 'home/...') via its drive-path trim,
  // which also fires for unix-style paths joined with '/' on win32.
  return baseDir.endsWith(sep) ? baseDir + relPath : baseDir + sep + relPath;
}
