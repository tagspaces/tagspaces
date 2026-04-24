/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2024-present TagSpaces GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License (version 3) as
 * published by the Free Software Foundation.
 */

import {
  cleanFrontDirSeparator,
  cleanTrailingDirSeparator,
} from '@tagspaces/tagspaces-common/paths';

/**
 * Normalize a path for scope comparisons.
 *
 * The enhanced index paths produced by `enhanceDirectoryIndex` (via
 * `joinPaths(sep, folderPath, relPath)`) have a leading separator. But
 * `location.path` / `currentDirectory.path` typically have no leading slash
 * and may have a trailing one (e.g. an S3 location configured as
 * `'my-folder/'`). Naive `.startsWith(location.path)` then silently drops
 * every entry.
 *
 * This helper strips BOTH the leading and trailing separator, and
 * normalizes backslashes to forward slashes so Windows and POSIX paths
 * compare consistently.
 */
export function normalizePathForCompare(p: string | undefined | null): string {
  return cleanTrailingDirSeparator(
    cleanFrontDirSeparator((p || '').replaceAll('\\', '/')),
  );
}

/**
 * Returns true when `itemPath` is the same as `rootPath` or lives underneath
 * it, using a separator boundary so `foo` does not match `foobar`.
 *
 * An empty `rootPath` (bucket-root S3 location, or unset scope) is treated
 * as "everything is within scope" so callers can use this helper uniformly
 * without special-casing the root.
 */
export function isPathWithinRoot(
  itemPath: string | undefined | null,
  rootPath: string | undefined | null,
): boolean {
  const rootNorm = normalizePathForCompare(rootPath);
  if (!rootNorm) return true;
  const itemNorm = normalizePathForCompare(itemPath);
  return itemNorm === rootNorm || itemNorm.startsWith(rootNorm + '/');
}

/**
 * Returns the portion of `itemPath` relative to `rootPath` (without a
 * leading separator). If `itemPath` is exactly `rootPath`, returns `''`.
 * If `rootPath` is empty, returns the normalized `itemPath` as-is.
 * If `itemPath` is NOT within `rootPath`, returns the normalized
 * `itemPath` as-is as a best-effort — callers that care should guard
 * with `isPathWithinRoot` first.
 */
export function relativePathFromRoot(
  itemPath: string | undefined | null,
  rootPath: string | undefined | null,
): string {
  const itemNorm = normalizePathForCompare(itemPath);
  const rootNorm = normalizePathForCompare(rootPath);
  if (!rootNorm) return itemNorm;
  if (itemNorm === rootNorm) return '';
  if (itemNorm.startsWith(rootNorm + '/')) {
    return itemNorm.slice(rootNorm.length + 1);
  }
  return itemNorm;
}
