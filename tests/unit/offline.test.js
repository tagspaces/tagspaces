import { afterEach, beforeEach, describe, expect, test } from '@playwright/test';

import {
  deriveInitialOnline,
  isOfflineError,
  OfflineError,
  offlineRejectionIfRemote,
} from '-/utils/OfflineError';

// In Node 21+ `globalThis.navigator` is exposed as a getter-only property,
// so plain `globalThis.navigator = …` throws. Use defineProperty to fully
// replace the descriptor for each test, then restore the original.
let originalDescriptor;
function setNavigator(value) {
  if (value === undefined) {
    delete globalThis.navigator;
    return;
  }
  Object.defineProperty(globalThis, 'navigator', {
    value,
    configurable: true,
    writable: true,
  });
}

beforeEach(() => {
  originalDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
});

afterEach(() => {
  delete globalThis.navigator;
  if (originalDescriptor) {
    Object.defineProperty(globalThis, 'navigator', originalDescriptor);
  }
});

describe('OfflineError', () => {
  test('has name "OfflineError" and is an Error', () => {
    const err = new OfflineError('boom');
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('OfflineError');
    expect(err.message).toBe('boom');
  });

  test('default message when none supplied', () => {
    const err = new OfflineError();
    expect(err.message).toBe('Network is offline');
  });
});

describe('isOfflineError', () => {
  test('true for OfflineError instances', () => {
    expect(isOfflineError(new OfflineError())).toBe(true);
  });

  test('true for any object whose name field is "OfflineError"', () => {
    // Catches the case where the error crosses a serialization boundary
    // and only the name is preserved (e.g. structured-clone via IPC).
    expect(isOfflineError({ name: 'OfflineError', message: 'x' })).toBe(true);
  });

  test('false for AbortError, plain Error, and non-objects', () => {
    const abort = new Error('aborted');
    abort.name = 'AbortError';
    expect(isOfflineError(abort)).toBe(false);
    expect(isOfflineError(new Error('boom'))).toBe(false);
    expect(isOfflineError(null)).toBe(false);
    expect(isOfflineError(undefined)).toBe(false);
    expect(isOfflineError('OfflineError')).toBe(false);
  });
});

describe('offlineRejectionIfRemote', () => {
  const remoteCloud = {
    name: 'my-bucket',
    haveObjectStoreSupport: () => true,
    haveWebDavSupport: () => false,
  };
  const remoteWebDav = {
    name: 'my-webdav',
    haveObjectStoreSupport: () => false,
    haveWebDavSupport: () => true,
  };
  const local = {
    name: 'local-folder',
    haveObjectStoreSupport: () => false,
    haveWebDavSupport: () => false,
  };

  test('returns null when navigator is undefined (Node/SSR)', () => {
    setNavigator(undefined);
    expect(offlineRejectionIfRemote(remoteCloud, 'list')).toBeNull();
  });

  test('returns null when online (regardless of location type)', () => {
    setNavigator({ onLine: true });
    expect(offlineRejectionIfRemote(remoteCloud, 'list')).toBeNull();
    expect(offlineRejectionIfRemote(remoteWebDav, 'list')).toBeNull();
    expect(offlineRejectionIfRemote(local, 'list')).toBeNull();
  });

  test('returns null for local locations even when offline', () => {
    setNavigator({ onLine: false });
    expect(offlineRejectionIfRemote(local, 'list')).toBeNull();
  });

  test('rejects with OfflineError for S3 (TYPE_CLOUD) when offline', async () => {
    setNavigator({ onLine: false });
    const result = offlineRejectionIfRemote(remoteCloud, 'list directory');
    expect(result).not.toBeNull();
    let caught;
    try {
      await result;
    } catch (e) {
      caught = e;
    }
    expect(isOfflineError(caught)).toBe(true);
    // The op + location name should appear in the message so that surfaced
    // toasts can attribute the failure if needed.
    expect(caught.message).toContain('list directory');
    expect(caught.message).toContain('my-bucket');
  });

  test('rejects with OfflineError for WebDAV when offline', async () => {
    setNavigator({ onLine: false });
    const result = offlineRejectionIfRemote(remoteWebDav, 'save file');
    let caught;
    try {
      await result;
    } catch (e) {
      caught = e;
    }
    expect(isOfflineError(caught)).toBe(true);
  });
});

describe('deriveInitialOnline', () => {
  test('reflects navigator.onLine when navigator exists', () => {
    setNavigator({ onLine: true });
    expect(deriveInitialOnline()).toBe(true);
    setNavigator({ onLine: false });
    expect(deriveInitialOnline()).toBe(false);
  });

  test('falls back to true when navigator is undefined (SSR/Node)', () => {
    // Without this fallback an app launched in a non-browser context (or
    // a renderer that hasn't initialized navigator yet) would start in a
    // falsely-offline state and block all remote operations.
    setNavigator(undefined);
    expect(deriveInitialOnline()).toBe(true);
  });
});
