/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces GmbH
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

/**
 * Client for the local worker process (@tagspaces/tagspaces-ws).
 *
 * Requests travel over the utilityProcess message port, which exists only
 * between this process and the worker it forked. That removes the whole class
 * of problems a loopback HTTP server has: there is no port for another local
 * process to connect to, nothing for a port scan to find, and no web page --
 * DNS-rebound or otherwise -- that can reach it. It also means there is no
 * shared secret to generate, pass, store or leak, because the operating system
 * already guarantees who is on the other end of the port.
 *
 * Protocol (see ipc.js in the worker):
 *   main -> worker   {id, op, params}        start an operation
 *                    {op: 'cancel', target}  abort an in-flight operation
 *   worker -> main   {id, ok: true,  result}
 *                    {id, ok: false, error, name}
 */
import type { UtilityProcess } from 'electron';

interface Pending {
  resolve: (value: any) => void;
  reject: (reason: Error) => void;
  timer?: ReturnType<typeof setTimeout>;
}

// Indexing a large tree legitimately takes minutes, so the ceiling is high; it
// exists only so a wedged worker cannot leak pending promises forever.
const DEFAULT_TIMEOUT_MS = 10 * 60 * 1000;
const PING_TIMEOUT_MS = 5000;

let worker: UtilityProcess | null = null;
let nextRequestId = 1;
const pending = new Map<number, Pending>();

function abortError(message: string): Error {
  const err = new Error(message);
  err.name = 'AbortError';
  return err;
}

function settle(id: number, fn: (p: Pending) => void): void {
  const p = pending.get(id);
  if (!p) {
    return;
  }
  pending.delete(id);
  if (p.timer) {
    clearTimeout(p.timer);
  }
  fn(p);
}

function rejectAll(message: string): void {
  const ids = Array.from(pending.keys());
  ids.forEach((id) => settle(id, (p) => p.reject(new Error(message))));
}

function onWorkerMessage(message: any): void {
  if (!message || typeof message !== 'object') {
    return;
  }
  const { id, ok, result, error, name } = message;
  if (typeof id !== 'number') {
    return;
  }
  settle(id, (p) => {
    if (ok) {
      p.resolve(result);
    } else if (name === 'AbortError') {
      p.reject(abortError(error || 'aborted'));
    } else {
      p.reject(new Error(error || 'worker operation failed'));
    }
  });
}

/**
 * Start routing requests to this worker. Called right after fork.
 */
export function attachWorker(proc: UtilityProcess): void {
  worker = proc;
  proc.on('message', onWorkerMessage);
  proc.once('exit', () => {
    if (worker === proc) {
      worker = null;
    }
    // Anything still in flight will never be answered.
    rejectAll('worker process exited');
  });
}

export function detachWorker(): void {
  worker = null;
  rejectAll('worker process stopped');
}

/** True when a worker is forked and its message port is wired up. */
export function isWorkerAttached(): boolean {
  return worker !== null;
}

/**
 * Run an operation in the worker.
 *
 * @param op operation name the worker exposes ('indexer', 'thumbGen', 'ping')
 * @param params structured-cloneable argument object
 * @param signal cancels the operation in the worker, not just locally
 */
export function callWorker(
  op: string,
  params?: any,
  signal?: AbortSignal,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<any> {
  const proc = worker;
  if (!proc) {
    return Promise.reject(new Error('no Worker Available!'));
  }
  if (signal && signal.aborted) {
    return Promise.reject(abortError('Aborted before sending'));
  }

  const id = nextRequestId;
  nextRequestId += 1;

  return new Promise((resolve, reject) => {
    const onAbort = () => {
      // Tell the worker to stop as well — otherwise it keeps walking a large
      // directory tree that nobody is waiting for any more.
      try {
        proc.postMessage({ op: 'cancel', target: id });
      } catch (e) {
        // Worker already gone; the exit handler will clean up.
      }
      settle(id, (p) => p.reject(abortError('Request aborted by signal')));
    };

    const timer = setTimeout(() => {
      settle(id, (p) => p.reject(new Error(`worker op '${op}' timed out`)));
      try {
        proc.postMessage({ op: 'cancel', target: id });
      } catch (e) {
        // ignore
      }
    }, timeoutMs);

    pending.set(id, {
      resolve: (value) => {
        if (signal) {
          signal.removeEventListener('abort', onAbort);
        }
        resolve(value);
      },
      reject: (reason) => {
        if (signal) {
          signal.removeEventListener('abort', onAbort);
        }
        reject(reason);
      },
      timer,
    });

    if (signal) {
      signal.addEventListener('abort', onAbort, { once: true });
    }

    try {
      proc.postMessage({ id, op, params });
    } catch (e) {
      settle(id, (p) => p.reject(e as Error));
    }
  });
}

/**
 * Confirm the worker is actually answering, not merely that a process exists.
 * This is what decides whether the app takes the worker code path at all.
 */
export function pingWorker(): Promise<boolean> {
  if (!isWorkerAttached()) {
    return Promise.resolve(false);
  }
  return callWorker('ping', undefined, undefined, PING_TIMEOUT_MS)
    .then(() => true)
    .catch(() => false);
}
