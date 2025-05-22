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
import { useEffect, useRef } from 'react';

export function useCancelablePerLocation(locationUuid: string) {
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (locationUuid) {
      // Create a new AbortController for this location
      const controller = new AbortController();
      controllerRef.current = controller;

      return () => {
        // Cleanup: abort the fetch if the location changes or on unmount
        controller.abort();
      };
    } else {
      controllerRef.current = null;
    }
  }, [locationUuid]); // Re-run effect (and abort) only when UUID changes

  return {
    // Expose the signal and abort method for the current controller
    signal: controllerRef.current?.signal,
    abort: () => controllerRef.current?.abort(),
    cancelAbort: () => (controllerRef.current = null),
  };
}

/**
 * Wraps any Promise<T> so that it will reject with
 * an AbortError when signal.abort() is called.
 */
export function makeCancelable<T>(
  promise: Promise<T>,
  signal: AbortSignal,
): Promise<T> {
  // 1) If already aborted, fail fast:
  if (signal && signal.aborted) {
    return Promise.reject(new DOMException('Aborted', 'AbortError'));
  }

  return new Promise<T>((resolve, reject) => {
    // 2) Listener that rejects on abort:
    const onAbort = () => {
      reject(new DOMException('Aborted', 'AbortError'));
    };

    if (signal) {
      signal.addEventListener('abort', onAbort, { once: true });
    }

    // 3) When the real promise settles, clean up the abort listener:
    promise
      .then((value) => {
        if (signal) {
          signal.removeEventListener('abort', onAbort);
        }
        resolve(value);
      })
      .catch((err) => {
        if (signal) {
          signal.removeEventListener('abort', onAbort);
        }
        reject(err);
      });
  });
}
