/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2024-present TagSpaces GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License (version 3) as
 * published by the Free Software Foundation.
 */

import { TS } from '-/tagspaces.namespace';

/**
 * Pure transforms that the `reflect*Entry` hook helpers in
 * LocationIndexContextProvider apply to the in-memory index when a
 * file system action fires ("add" / "delete" / "update" / "move").
 *
 * Returning `null` signals "no change — caller should NOT update state".
 * Returning an array is the new index the caller should persist. Keeping
 * these pure (no refs, no setIndex) makes them unit-testable without
 * mounting the whole provider tree.
 *
 * Invariants preserved from the original hook helpers:
 * - Never mutate the input array (always returns a fresh copy on change).
 * - Skip when the current index is undefined or empty. This prevents a
 *   reflect action from "bootstrapping" an index the provider never
 *   actually loaded — that's the job of loadIndexFromDisk / createIndex.
 */

type Index = TS.FileSystemEntry[] | undefined;

/**
 * Remove the entry at `path` (exact match). Returns the filtered array,
 * or `null` if the entry isn't in the current index / index is empty.
 *
 * NOTE: historically this was implemented with `Array.prototype.splice`
 * which returns the REMOVED slice — the buggy version replaced the index
 * with just the deleted entry instead of the survivors.
 */
export function applyDeleteToIndex(
  current: Index,
  path: string,
): TS.FileSystemEntry[] | null {
  if (!current || current.length < 1) return null;
  const next = current.filter((entry) => entry.path !== path);
  return next.length === current.length ? null : next;
}

/**
 * Append `newEntry` if no entry with the same `path` already exists.
 * Returns the new array, or `null` if the entry is already present or the
 * current index is empty/undefined.
 */
export function applyCreateToIndex(
  current: Index,
  newEntry: TS.FileSystemEntry,
): TS.FileSystemEntry[] | null {
  if (!current || current.length < 1) return null;
  if (current.some((entry) => entry.path === newEntry.path)) return null;
  return [...current, newEntry];
}

/**
 * Replace the entry matching `oldPath` with `newEntry`. Used for both
 * `update` (same path, new meta) and `move` (new path) actions. Returns
 * the new array, or `null` if no entry matches `oldPath`.
 */
export function applyUpdateToIndex(
  current: Index,
  oldPath: string,
  newEntry: TS.FileSystemEntry,
): TS.FileSystemEntry[] | null {
  if (!current || current.length < 1) return null;
  if (!current.some((entry) => entry.path === oldPath)) return null;
  return current.map((entry) => (entry.path === oldPath ? newEntry : entry));
}
