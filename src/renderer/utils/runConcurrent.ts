/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2024-present TagSpaces GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License (version 3) as
 * published by the Free Software Foundation.
 */

/**
 * Worker-pool runner with a real concurrency cap. Items are processed in
 * order by a fixed-size pool of `concurrency` workers, each pulling the
 * next item only after its previous one settles. Unlike
 * `executePromisesInBatches`, the items are *factories* invoked only when
 * a slot becomes free — so the underlying work (IPC invokes, fs ops) is
 * throttled, not just the awaits.
 *
 * Important for big IO fanouts where eager `.map(() => invoke(...))` would
 * queue thousands of in-flight promises and OOM the renderer. Kept as a
 * leaf module (no Pro / DOM imports) so unit tests can import it without
 * dragging in the rest of services/utils-io.ts.
 */
export async function runConcurrent<I, R>(
  items: I[],
  worker: (item: I, index: number) => Promise<R>,
  concurrency: number,
  onSettled?: (item: I, index: number, result: PromiseSettledResult<R>) => void,
  abortSignal?: AbortSignal,
): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = new Array(items.length);
  if (items.length === 0) {
    return results;
  }
  let cursor = 0;
  const slots = Math.max(1, Math.min(concurrency, items.length));

  const runWorker = async () => {
    while (true) {
      if (abortSignal && abortSignal.aborted) {
        return;
      }
      const idx = cursor++;
      if (idx >= items.length) {
        return;
      }
      const item = items[idx];
      let result: PromiseSettledResult<R>;
      try {
        const value = await worker(item, idx);
        result = { status: 'fulfilled', value };
      } catch (reason) {
        result = { status: 'rejected', reason };
      }
      results[idx] = result;
      if (onSettled) {
        onSettled(item, idx, result);
      }
    }
  };

  await Promise.all(Array.from({ length: slots }, runWorker));
  return results;
}
