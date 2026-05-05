import { describe, expect, test } from '@playwright/test';

import {
  applyCreateToIndex,
  applyDeleteToIndex,
  applyUpdateToIndex,
} from '-/utils/indexReflect';

// Minimal fixture — the reflect helpers only touch `.path`; other fields
// are carried through via the input entry.
const entry = (path, extra = {}) => ({
  name: path.split('/').pop(),
  path,
  isFile: true,
  size: 0,
  lmdt: 0,
  ...extra,
});

describe('applyDeleteToIndex', () => {
  test('removes the matching entry and returns the survivors', () => {
    const index = [entry('a.txt'), entry('b.txt'), entry('c.txt')];
    expect(applyDeleteToIndex(index, 'b.txt')).toEqual([
      entry('a.txt'),
      entry('c.txt'),
    ]);
  });

  test('REGRESSION: returns survivors, not the deleted entry (splice bug)', () => {
    // A naive `splice(i, 1)` implementation returned the REMOVED slice
    // and passed it to setIndex, leaving the index as a single element
    // containing only the deleted file. Guard against that forever.
    const index = [entry('keep1.txt'), entry('victim.txt'), entry('keep2.txt')];
    const result = applyDeleteToIndex(index, 'victim.txt');
    expect(result).toEqual([entry('keep1.txt'), entry('keep2.txt')]);
    // Specifically: result must NOT be the one-element [deleted] array.
    expect(result).not.toEqual([entry('victim.txt')]);
    expect(result.length).toBe(2);
  });

  test('returns null when path is not in the index (no-op)', () => {
    const index = [entry('a.txt'), entry('b.txt')];
    expect(applyDeleteToIndex(index, 'missing.txt')).toBeNull();
  });

  test('returns null for empty or undefined index', () => {
    expect(applyDeleteToIndex([], 'a.txt')).toBeNull();
    expect(applyDeleteToIndex(undefined, 'a.txt')).toBeNull();
  });

  test('does not mutate the input array', () => {
    const index = [entry('a.txt'), entry('b.txt')];
    const snapshot = [...index];
    applyDeleteToIndex(index, 'a.txt');
    expect(index).toEqual(snapshot);
  });
});

describe('applyCreateToIndex', () => {
  test('appends a new entry when its path is not already present', () => {
    const index = [entry('a.txt')];
    expect(applyCreateToIndex(index, entry('b.txt'))).toEqual([
      entry('a.txt'),
      entry('b.txt'),
    ]);
  });

  test('returns null when an entry with the same path already exists', () => {
    const index = [entry('a.txt', { size: 10 })];
    expect(applyCreateToIndex(index, entry('a.txt', { size: 20 }))).toBeNull();
  });

  test('returns null for empty or undefined index (no bootstrap via reflect)', () => {
    expect(applyCreateToIndex([], entry('a.txt'))).toBeNull();
    expect(applyCreateToIndex(undefined, entry('a.txt'))).toBeNull();
  });

  test('does not mutate the input array', () => {
    const index = [entry('a.txt')];
    const snapshot = [...index];
    applyCreateToIndex(index, entry('b.txt'));
    expect(index).toEqual(snapshot);
  });
});

describe('applyUpdateToIndex', () => {
  test('replaces the matching entry in-place (same path, new meta)', () => {
    const index = [
      entry('a.txt'),
      entry('b.txt', { size: 10 }),
      entry('c.txt'),
    ];
    const updated = entry('b.txt', { size: 42 });
    expect(applyUpdateToIndex(index, 'b.txt', updated)).toEqual([
      entry('a.txt'),
      updated,
      entry('c.txt'),
    ]);
  });

  test('also handles rename/move — oldPath differs from newEntry.path', () => {
    // The useEffect action dispatcher maps both "update" and "move" to
    // reflectUpdateEntry. A move changes the entry's path; the replacement
    // is indexed by oldPath but the new entry carries the new path.
    const index = [entry('old-name.txt'), entry('other.txt')];
    const moved = entry('new-name.txt', { size: 100 });
    expect(applyUpdateToIndex(index, 'old-name.txt', moved)).toEqual([
      moved,
      entry('other.txt'),
    ]);
  });

  test('returns null when oldPath is not in the index', () => {
    const index = [entry('a.txt'), entry('b.txt')];
    expect(
      applyUpdateToIndex(index, 'missing.txt', entry('missing.txt')),
    ).toBeNull();
  });

  test('returns null for empty or undefined index', () => {
    expect(applyUpdateToIndex([], 'a.txt', entry('a.txt'))).toBeNull();
    expect(applyUpdateToIndex(undefined, 'a.txt', entry('a.txt'))).toBeNull();
  });

  test('does not mutate the input array', () => {
    const index = [entry('a.txt'), entry('b.txt')];
    const snapshot = [...index];
    applyUpdateToIndex(index, 'a.txt', entry('a.txt', { size: 99 }));
    expect(index).toEqual(snapshot);
  });
});
