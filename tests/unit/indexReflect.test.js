import { describe, expect, test } from '@playwright/test';

import {
  applyBulkCreateToIndex,
  applyBulkUpdateToIndex,
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

describe('applyBulkCreateToIndex', () => {
  test('appends all new entries in a single allocation', () => {
    const index = [entry('a.txt')];
    expect(
      applyBulkCreateToIndex(index, [entry('b.txt'), entry('c.txt')]),
    ).toEqual([entry('a.txt'), entry('b.txt'), entry('c.txt')]);
  });

  test('dedups against existing index paths', () => {
    // Bulk equivalent of the single-entry "already present" no-op. New
    // entries whose path already exists must be silently dropped.
    const index = [entry('a.txt'), entry('b.txt')];
    expect(
      applyBulkCreateToIndex(index, [
        entry('a.txt', { size: 999 }), // dup — drop
        entry('c.txt'),
      ]),
    ).toEqual([entry('a.txt'), entry('b.txt'), entry('c.txt')]);
  });

  test('dedups within the bulk batch itself', () => {
    // A naive impl would only check against `current`. If the same path
    // appears twice in `newEntries`, only the first should land — otherwise
    // a bulk add inserts duplicates the single helper would have refused.
    const index = [entry('a.txt')];
    expect(
      applyBulkCreateToIndex(index, [
        entry('b.txt'),
        entry('b.txt', { size: 7 }), // intra-batch dup — drop
        entry('c.txt'),
      ]),
    ).toEqual([entry('a.txt'), entry('b.txt'), entry('c.txt')]);
  });

  test('returns null when every entry is already present', () => {
    const index = [entry('a.txt'), entry('b.txt')];
    expect(
      applyBulkCreateToIndex(index, [entry('a.txt'), entry('b.txt')]),
    ).toBeNull();
  });

  test('returns null for empty or undefined inputs', () => {
    expect(applyBulkCreateToIndex(undefined, [entry('a.txt')])).toBeNull();
    expect(applyBulkCreateToIndex([], [entry('a.txt')])).toBeNull();
    expect(applyBulkCreateToIndex([entry('a.txt')], [])).toBeNull();
    expect(applyBulkCreateToIndex([entry('a.txt')], undefined)).toBeNull();
  });

  test('does not mutate inputs', () => {
    const index = [entry('a.txt')];
    const incoming = [entry('b.txt'), entry('c.txt')];
    const indexSnapshot = [...index];
    const incomingSnapshot = [...incoming];
    applyBulkCreateToIndex(index, incoming);
    expect(index).toEqual(indexSnapshot);
    expect(incoming).toEqual(incomingSnapshot);
  });

  test('skips falsy entries in the batch', () => {
    // The caller filters with .filter(Boolean) before passing in, but the
    // helper should be defensive — a single undefined slot must not throw
    // or get added.
    const index = [entry('a.txt')];
    expect(
      applyBulkCreateToIndex(index, [entry('b.txt'), undefined, null]),
    ).toEqual([entry('a.txt'), entry('b.txt')]);
  });
});

describe('applyBulkUpdateToIndex', () => {
  test('replaces all matching entries in a single walk', () => {
    const index = [
      entry('a.txt'),
      entry('b.txt', { size: 10 }),
      entry('c.txt', { size: 20 }),
    ];
    const updatedB = entry('b.txt', { size: 42 });
    const updatedC = entry('c.txt', { size: 84 });
    expect(
      applyBulkUpdateToIndex(index, [
        { oldPath: 'b.txt', entry: updatedB },
        { oldPath: 'c.txt', entry: updatedC },
      ]),
    ).toEqual([entry('a.txt'), updatedB, updatedC]);
  });

  test('handles bulk moves — oldPath differs from newEntry.path', () => {
    // Same rename-semantics contract as the single-entry update helper. A
    // 3500-file cross-volume move dispatches as a uniform "move" action
    // batch that lands here.
    const index = [entry('old1.txt'), entry('old2.txt'), entry('keep.txt')];
    const new1 = entry('new1.txt');
    const new2 = entry('new2.txt');
    expect(
      applyBulkUpdateToIndex(index, [
        { oldPath: 'old1.txt', entry: new1 },
        { oldPath: 'old2.txt', entry: new2 },
      ]),
    ).toEqual([new1, new2, entry('keep.txt')]);
  });

  test('returns null when no oldPath is in the index', () => {
    const index = [entry('a.txt')];
    expect(
      applyBulkUpdateToIndex(index, [
        { oldPath: 'missing-1.txt', entry: entry('x.txt') },
        { oldPath: 'missing-2.txt', entry: entry('y.txt') },
      ]),
    ).toBeNull();
  });

  test('returns null for empty or undefined inputs', () => {
    expect(
      applyBulkUpdateToIndex(undefined, [
        { oldPath: 'a.txt', entry: entry('a.txt') },
      ]),
    ).toBeNull();
    expect(
      applyBulkUpdateToIndex([], [{ oldPath: 'a.txt', entry: entry('a.txt') }]),
    ).toBeNull();
    expect(applyBulkUpdateToIndex([entry('a.txt')], [])).toBeNull();
    expect(applyBulkUpdateToIndex([entry('a.txt')], undefined)).toBeNull();
  });

  test('ignores malformed update tuples without crashing', () => {
    // Defensive: the producer in the context provider filters with
    // .filter((a) => a.oldEntryPath && a.entry) but a regression there
    // should not blow up the helper.
    const index = [entry('a.txt')];
    expect(
      applyBulkUpdateToIndex(index, [
        { oldPath: 'a.txt', entry: entry('a.txt', { size: 99 }) },
        { oldPath: '', entry: entry('x.txt') }, // empty oldPath — skip
        { oldPath: 'b.txt', entry: null }, // null entry — skip
      ]),
    ).toEqual([entry('a.txt', { size: 99 })]);
  });

  test('does not mutate inputs', () => {
    const index = [entry('a.txt'), entry('b.txt')];
    const updates = [
      { oldPath: 'a.txt', entry: entry('a.txt', { size: 99 }) },
    ];
    const indexSnapshot = [...index];
    const updatesSnapshot = [...updates];
    applyBulkUpdateToIndex(index, updates);
    expect(index).toEqual(indexSnapshot);
    expect(updates).toEqual(updatesSnapshot);
  });
});
