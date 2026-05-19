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

type Notifier = (
  text: string,
  notificationType?: 'default' | 'info' | 'warning' | 'error',
  autohide?: boolean,
  tid?: string,
) => void;

let currentNotifier: Notifier | null = null;
let installed = false;
let errorListener: ((event: ErrorEvent) => void) | null = null;
let rejectionListener: ((event: PromiseRejectionEvent) => void) | null = null;

type PendingNotice = {
  text: string;
  type: 'default' | 'info' | 'warning' | 'error';
  tid: string;
};
const pendingNotices: PendingNotice[] = [];

export function setGlobalErrorNotifier(fn: Notifier | null) {
  currentNotifier = fn;
  if (fn && pendingNotices.length > 0) {
    const queued = pendingNotices.splice(0, pendingNotices.length);
    queued.forEach((n) => {
      try {
        fn(n.text, n.type, true, n.tid);
      } catch (e) {
        console.error('globalErrorHandlers: notifier threw', e);
      }
    });
  }
}

/**
 * Surface a user notification from non-React code. If no notifier is
 * registered yet (e.g. during redux-persist rehydrate, before the
 * NotificationContext mounts), the notice is queued and flushed once one is.
 */
export function notifyUser(
  text: string,
  type: 'default' | 'info' | 'warning' | 'error' = 'warning',
  tid = 'globalNoticeTID',
) {
  if (currentNotifier) {
    try {
      currentNotifier(text, type, true, tid);
      return;
    } catch (e) {
      console.error('globalErrorHandlers: notifier threw', e);
    }
  }
  pendingNotices.push({ text, type, tid });
}

function notify(message: string) {
  if (currentNotifier) {
    try {
      currentNotifier(message, 'error', true, 'globalErrorTID');
    } catch (e) {
      console.error('globalErrorHandlers: notifier threw', e);
    }
  }
}

function fallbackMessage() {
  try {
    // Resolve lazily so this module has no eager dependency on i18n.
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    const i18n = require('-/services/i18n').default;
    return i18n.t('core:unexpectedError');
  } catch {
    return 'An unexpected error occurred';
  }
}

export function installGlobalErrorHandlers() {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  errorListener = (event: ErrorEvent) => {
    // Resource-load failures (img/script/link) deliver ErrorEvent with no
    // `error` field. They are noisy and not actionable here.
    if (!event.error) return;
    console.error('window.onerror:', event.error);
    notify(event.error?.message || fallbackMessage());
  };

  rejectionListener = (event: PromiseRejectionEvent) => {
    const reason: any = event.reason;
    console.error('unhandledrejection:', reason);
    const msg =
      reason instanceof Error
        ? reason.message
        : typeof reason === 'string'
          ? reason
          : fallbackMessage();
    notify(msg);
  };

  window.addEventListener('error', errorListener);
  window.addEventListener('unhandledrejection', rejectionListener);
}

export function uninstallGlobalErrorHandlers() {
  if (!installed || typeof window === 'undefined') return;
  if (errorListener) window.removeEventListener('error', errorListener);
  if (rejectionListener)
    window.removeEventListener('unhandledrejection', rejectionListener);
  errorListener = null;
  rejectionListener = null;
  installed = false;
}
