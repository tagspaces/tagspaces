/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2024-present TagSpaces GmbH
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
 * https://usehooks-typescript.com/use-event-listener/
 * eslint-disable @typescript-eslint/ban-types
 */
import { useEffect, useState } from 'react';

type UseCancelableResult = {
  signal: AbortSignal;
  abort: () => void;
};

export const useCancelable = (): UseCancelableResult => {
  const [controller, setController] = useState(new AbortController());

  // Abort it automatically in the destructor
  useEffect(() => {
    return () => controller.abort();
  }, [controller]);

  return {
    signal: controller.signal,
    abort: () => {
      controller.abort();
      setController(new AbortController());
    },
  };
};

/**
 * Wraps any Promise<T> so that it will reject with
 * an AbortError when signal.abort() is called.
 */
export function makeCancelable<T>(
  promise: Promise<T>,
  signal: AbortSignal,
): Promise<T> {
  // 1) If already aborted, fail fast:
  if (signal.aborted) {
    return Promise.reject(new DOMException('Aborted', 'AbortError'));
  }

  return new Promise<T>((resolve, reject) => {
    // 2) Listener that rejects on abort:
    const onAbort = () => {
      reject(new DOMException('Aborted', 'AbortError'));
    };

    signal.addEventListener('abort', onAbort, { once: true });

    // 3) When the real promise settles, clean up the abort listener:
    promise
      .then((value) => {
        signal.removeEventListener('abort', onAbort);
        resolve(value);
      })
      .catch((err) => {
        signal.removeEventListener('abort', onAbort);
        reject(err);
      });
  });
}
