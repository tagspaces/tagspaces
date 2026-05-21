/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2026-present TagSpaces GmbH
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
 * Best-effort multi-tab handshake for the web enable/disable + scrub flow.
 * Electron has `getWindowCount` IPC for the same purpose; the web fallback
 * is a `BroadcastChannel` ping/pong: each tab listens for pings and
 * responds with a pong; an active tab issues a ping and refuses to enable
 * if any other tab pongs within a short window.
 *
 * Implementation note: we use a SINGLE channel per tab for both the
 * responder and the prober. The BroadcastChannel spec exempts the same
 * channel instance from receiving its own messages, so this tab can't
 * ping itself. If we used two instances (one for responder, one for
 * prober) the responder would happily pong the prober within the same
 * tab — a false positive that would block enable on a single-tab session.
 */

const CHANNEL_NAME = 'ts-encrypt-tabs';
const PING_TIMEOUT_MS = 120;

type Msg = { type: 'ping' | 'pong'; id: string };

let channel: BroadcastChannel | null = null;

function ensureChannel(): BroadcastChannel | null {
  if (channel) {
    return channel;
  }
  if (typeof BroadcastChannel === 'undefined') {
    return null;
  }
  try {
    const ch = new BroadcastChannel(CHANNEL_NAME);
    ch.addEventListener('message', (event: MessageEvent<Msg>) => {
      const data = event?.data;
      if (data && data.type === 'ping' && typeof data.id === 'string') {
        try {
          ch.postMessage({ type: 'pong', id: data.id });
        } catch (e) {
          /* ignore */
        }
      }
    });
    channel = ch;
    return channel;
  } catch (e) {
    channel = null;
    return null;
  }
}

/** Idempotently install the responder listener (call once at app bootstrap). */
export function installTabGuardListener(): void {
  ensureChannel();
}

/**
 * Returns true if another tab on the same origin responded within the
 * timeout. Best-effort: returns false if BroadcastChannel is unavailable
 * or no other tab pongs in time.
 */
export async function isAnotherTabOpen(): Promise<boolean> {
  const ch = ensureChannel();
  if (!ch) {
    return false;
  }
  return new Promise<boolean>((resolve) => {
    let timer: any = null;
    let listener: ((event: MessageEvent<Msg>) => void) | null = null;
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const done = (result: boolean) => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      if (listener) {
        try {
          ch.removeEventListener('message', listener as any);
        } catch (e) {
          /* ignore */
        }
        listener = null;
      }
      resolve(result);
    };
    try {
      listener = (event: MessageEvent<Msg>) => {
        const data = event?.data;
        if (data && data.type === 'pong' && data.id === id) {
          done(true);
        }
      };
      ch.addEventListener('message', listener as any);
      // The same channel instance never receives its own postMessage,
      // so this can't be answered by our own responder in this tab.
      ch.postMessage({ type: 'ping', id });
      timer = setTimeout(() => done(false), PING_TIMEOUT_MS);
    } catch (e) {
      done(false);
    }
  });
}
