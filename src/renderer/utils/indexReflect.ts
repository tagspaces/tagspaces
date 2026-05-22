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
 * Bulk variant of applyCreateToIndex. Calling the single-entry helper N times
 * in a loop is O(N*M) (each iteration re-scans + re-copies the growing
 * index). For huge batches (e.g. a 3500-file copy reflected into a 50k-entry
 * index) that's ~1.5 GB of intermediate allocations in a synchronous tick,
 * which OOMs the renderer before GC gets a chance. This variant is O(N+M):
 * one dedup Set, one combined copy.
 */
export function applyBulkCreateToIndex(
  current: Index,
  newEntries: TS.FileSystemEntry[],
): TS.FileSystemEntry[] | null {
  if (!current || current.length < 1) return null;
  if (!newEntries || newEntries.length === 0) return null;
  const existingPaths = new Set<string>();
  for (let i = 0; i < current.length; i += 1) {
    existingPaths.add(current[i].path);
  }
  const toAdd: TS.FileSystemEntry[] = [];
  for (let i = 0; i < newEntries.length; i += 1) {
    const e = newEntries[i];
    if (e && !existingPaths.has(e.path)) {
      existingPaths.add(e.path);
      toAdd.push(e);
    }
  }
  if (toAdd.length === 0) return null;
  return [...current, ...toAdd];
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

/**
 * Bulk variant of applyUpdateToIndex. Same motivation as
 * applyBulkCreateToIndex — a 3500-file move would otherwise re-scan +
 * re-map the index 3500 times. This builds one path→entry replacement map
 * and walks the index once: O(N + M).
 */
export function applyBulkUpdateToIndex(
  current: Index,
  updates: Array<{ oldPath: string; entry: TS.FileSystemEntry }>,
): TS.FileSystemEntry[] | null {
  if (!current || current.length < 1) return null;
  if (!updates || updates.length === 0) return null;
  const byOldPath = new Map<string, TS.FileSystemEntry>();
  for (let i = 0; i < updates.length; i += 1) {
    const u = updates[i];
    if (u && u.oldPath && u.entry) {
      byOldPath.set(u.oldPath, u.entry);
    }
  }
  if (byOldPath.size === 0) return null;
  let changed = false;
  const next: TS.FileSystemEntry[] = new Array(current.length);
  for (let i = 0; i < current.length; i += 1) {
    const e = current[i];
    const repl = byOldPath.get(e.path);
    if (repl) {
      next[i] = repl;
      changed = true;
    } else {
      next[i] = e;
    }
  }
  return changed ? next : null;
}
