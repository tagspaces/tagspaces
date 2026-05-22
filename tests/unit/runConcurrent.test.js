import { describe, expect, test } from '@playwright/test';

import { runConcurrent } from '-/utils/runConcurrent';

// Helper: a worker that resolves after a tunable delay and records its
// peak observed concurrency via shared counters. Returns the input value.
function makeTrackingWorker(state, delayMs = 5) {
  return async (item) => {
    state.inFlight += 1;
    state.peak = Math.max(state.peak, state.inFlight);
    await new Promise((r) => setTimeout(r, delayMs));
    state.inFlight -= 1;
    return item;
  };
}

describe('runConcurrent', () => {
  test('settles every item and returns them indexed by input order', async () => {
    // Workers complete in non-input order — settled[i] must still
    // correspond to items[i] regardless of who finishes first.
    const items = [50, 5, 30, 1, 20];
    const settled = await runConcurrent(
      items,
      async (n) => {
        await new Promise((r) => setTimeout(r, n));
        return n * 2;
      },
      4,
    );
    expect(settled.length).toBe(items.length);
    expect(settled.map((r) => r.status)).toEqual(
      Array(items.length).fill('fulfilled'),
    );
    expect(settled.map((r) => r.value)).toEqual(items.map((n) => n * 2));
  });

  test('peak in-flight never exceeds the concurrency cap', async () => {
    // The load-bearing invariant. The original OOM crashes happened because
    // copyFilesWithProgress eagerly fired thousands of IPC calls. If this
    // helper silently exceeded its cap a future regression would re-OOM
    // the renderer.
    const state = { inFlight: 0, peak: 0 };
    const items = new Array(50).fill(0).map((_, i) => i);
    const cap = 8;
    await runConcurrent(items, makeTrackingWorker(state, 3), cap);
    expect(state.peak).toBeGreaterThan(0);
    expect(state.peak).toBeLessThanOrEqual(cap);
  });

  test('caps concurrency below the number of items (small batch)', async () => {
    // When items.length < concurrency, we shouldn't spin up more workers
    // than there are items to process — wasted promises, wasted budget.
    const state = { inFlight: 0, peak: 0 };
    const items = [1, 2, 3];
    await runConcurrent(items, makeTrackingWorker(state, 5), 16);
    expect(state.peak).toBeLessThanOrEqual(items.length);
  });

  test('treats invalid concurrency values as at least 1', async () => {
    // Defensive: a 0 or negative cap from a buggy caller should still make
    // forward progress (one-at-a-time), not spin forever or deadlock.
    const items = [1, 2, 3];
    const r0 = await runConcurrent(items, async (n) => n, 0);
    const rNeg = await runConcurrent(items, async (n) => n, -5);
    expect(r0.map((x) => x.value)).toEqual(items);
    expect(rNeg.map((x) => x.value)).toEqual(items);
  });

  test('captures rejections without aborting siblings', async () => {
    // A failure for one item must not poison the whole batch — the user's
    // 3500-file copy depends on a single bad file (ENOENT, permission, etc.)
    // not killing the other 3499.
    const items = ['ok-a', 'fail-b', 'ok-c', 'fail-d', 'ok-e'];
    const settled = await runConcurrent(
      items,
      async (name) => {
        if (name.startsWith('fail')) {
          throw new Error('boom-' + name);
        }
        return name.toUpperCase();
      },
      3,
    );
    expect(settled.length).toBe(items.length);
    expect(settled[0]).toEqual({ status: 'fulfilled', value: 'OK-A' });
    expect(settled[1].status).toBe('rejected');
    expect(String(settled[1].reason.message)).toBe('boom-fail-b');
    expect(settled[2]).toEqual({ status: 'fulfilled', value: 'OK-C' });
    expect(settled[3].status).toBe('rejected');
    expect(settled[4]).toEqual({ status: 'fulfilled', value: 'OK-E' });
  });

  test('onSettled fires for every item, exactly once, with the per-item result', async () => {
    const seen = [];
    const items = [10, 20, 30, 40];
    await runConcurrent(
      items,
      async (n) => {
        if (n === 20) throw new Error('twenty');
        return n + 1;
      },
      2,
      (item, idx, result) => {
        seen.push({ item, idx, status: result.status });
      },
    );
    expect(seen.length).toBe(items.length);
    // Sort by idx for a deterministic assertion regardless of completion order
    seen.sort((a, b) => a.idx - b.idx);
    expect(seen).toEqual([
      { item: 10, idx: 0, status: 'fulfilled' },
      { item: 20, idx: 1, status: 'rejected' },
      { item: 30, idx: 2, status: 'fulfilled' },
      { item: 40, idx: 3, status: 'fulfilled' },
    ]);
  });

  test('abort signal stops new items from being picked up', async () => {
    // Aborting mid-batch is what powers the per-row Cancel button. Workers
    // already running may finish, but the queue must not advance past the
    // abort point — otherwise "Cancel" would keep doing work for seconds.
    const controller = new AbortController();
    const startedIndices = [];
    const items = new Array(20).fill(0).map((_, i) => i);

    const settled = await runConcurrent(
      items,
      async (i) => {
        startedIndices.push(i);
        // Trip the abort after the first 4 items have started.
        if (i === 3) {
          controller.abort();
        }
        await new Promise((r) => setTimeout(r, 5));
        return i;
      },
      4,
      undefined,
      controller.signal,
    );

    // Only a bounded number of items should have started — not all 20.
    expect(startedIndices.length).toBeLessThan(items.length);
    // The pre-allocated results array still has items.length slots; the
    // tail items are simply never written. NOTE: settled is a sparse array
    // (created via `new Array(N)`), and Array.prototype.filter skips empty
    // slots — so we walk indices manually to count what's actually missing.
    expect(settled.length).toBe(items.length);
    let unfilled = 0;
    for (let i = 0; i < settled.length; i += 1) {
      if (settled[i] === undefined) unfilled += 1;
    }
    expect(unfilled).toBeGreaterThan(0);
  });

  test('handles an empty input list', async () => {
    // Edge case: caller may pass [] when the prefilter rejected everything
    // (e.g. zero sidecars to copy). Must resolve to [] without spinning.
    const seen = [];
    const settled = await runConcurrent(
      [],
      async () => 'never-called',
      8,
      () => seen.push('settled'),
    );
    expect(settled).toEqual([]);
    expect(seen.length).toBe(0);
  });

  test('worker receives both the item and its original index', async () => {
    const calls = [];
    const items = ['a', 'b', 'c'];
    await runConcurrent(
      items,
      async (item, idx) => {
        calls.push({ item, idx });
        return item;
      },
      2,
    );
    calls.sort((a, b) => a.idx - b.idx);
    expect(calls).toEqual([
      { item: 'a', idx: 0 },
      { item: 'b', idx: 1 },
      { item: 'c', idx: 2 },
    ]);
  });
});
