/*
 * Copyright (c) 2016-present - TagSpaces GmbH. All rights reserved.
 */
import { test, expect } from './fixtures';
import { startTestingApp, stopApp } from './hook';
import { closeWelcomePlaywright } from './welcome.helpers';

// These tests verify that the "Check for new version on startup" toggle
// gates the actual network call. There are two independent code paths
// that decide whether the update XHR fires:
//
//   1. state.settings.checkForUpdates  — the user's own preference (TST92)
//   2. AppConfig.ExtCheckForUpdatesOnStartup  — extconfig override that
//      a deployer sets to enforce a policy regardless of user choice
//      (TST93)
//
// The selector getCheckForUpdateOnStartup in reducers/settings.ts honors
// the override when defined and falls back to state otherwise. Both
// paths must be tested because a regression in either is harmful — an
// admin who set the override to false expects the call to be suppressed
// even if the user toggled their setting on.
//
// The update endpoint is mocked via Playwright route interception so:
//   - tests don't depend on updates.tagspaces.org being reachable
//   - we get a precise count of how many requests the app made
//   - tests run identically in CI and offline

const UPDATE_HOST_PATTERN = '**/updates.tagspaces.org/**';

async function setCheckForUpdates(enabled) {
  // Reach into redux-persist's serialised settings blob, flip the flag,
  // and write it back. More reliable than driving the Settings UI; the
  // app reads from this same localStorage entry at boot via redux-persist
  // before initApp dispatches checkForUpdate().
  await global.client.evaluate((next) => {
    const raw = localStorage.getItem('persist:root');
    const root = raw ? JSON.parse(raw) : {};
    const settings = root.settings ? JSON.parse(root.settings) : {};
    settings.checkForUpdates = next;
    root.settings = JSON.stringify(settings);
    localStorage.setItem('persist:root', JSON.stringify(root));
  }, enabled);
}

async function armUpdateInterceptor(captureBucket) {
  // route() both COUNTS and FULFILLS — keeps the test deterministic even
  // if the real server is reachable from the CI runner.
  await global.client.route(UPDATE_HOST_PATTERN, async (route) => {
    captureBucket.push(route.request().url());
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ appVersion: '99.99.99' }),
    });
  });
}

async function disarmUpdateInterceptor() {
  await global.client.unroute(UPDATE_HOST_PATTERN);
}

test.describe('TST92 - Check for update gating (user preference)', () => {
  test.beforeAll(async ({ isWeb, isS3, webServerPort }, testInfo) => {
    // No extconfig here: AppConfig.ExtCheckForUpdatesOnStartup stays
    // undefined and the runtime decision flows from state only.
    await startTestingApp({ isWeb, isS3, webServerPort, testInfo });
    await closeWelcomePlaywright();
  });

  test.afterAll(async () => {
    await stopApp();
  });

  test('TST9201 - Toggle OFF prevents the update XHR [electron,web,s3]', async () => {
    const requests = [];
    await armUpdateInterceptor(requests);
    try {
      await setCheckForUpdates(false);
      await global.client.reload();
      // Give initApp + setTimeout chains time to settle. The update XHR
      // is launched synchronously inside the initApp action when enabled.
      await global.client.waitForTimeout(3000);
      expect(requests.length).toBe(0);
    } finally {
      await disarmUpdateInterceptor();
    }
  });

  test('TST9202 - Toggle ON triggers the update XHR [electron,web,s3]', async () => {
    const requests = [];
    await armUpdateInterceptor(requests);
    try {
      await setCheckForUpdates(true);
      await global.client.reload();
      await expect
        .poll(() => requests.length, { timeout: 6000, intervals: [200] })
        .toBeGreaterThanOrEqual(1);
      // Sanity-check the URL shape — getLastVersionPromise() always
      // composes a URL under /releases/ that ends in a .json file.
      expect(requests[0]).toContain('/releases/');
      expect(requests[0]).toMatch(/\.json($|\?)/);
    } finally {
      await disarmUpdateInterceptor();
    }
  });
});

test.describe('TST93 - Check for update gating (extconfig override)', () => {
  test.beforeAll(async ({ isWeb, isS3, webServerPort }, testInfo) => {
    // Boot with extconfig-update-disabled.js, which sets
    // window.ExtCheckForUpdatesOnStartup = false. The selector then
    // returns false regardless of state.settings.checkForUpdates.
    await startTestingApp(
      { isWeb, isS3, webServerPort, testInfo },
      'extconfig-update-disabled.js',
    );
  });

  test.afterAll(async () => {
    await stopApp();
  });

  test('TST9301 - extconfig OFF beats user toggle ON [electron,web,s3]', async () => {
    const requests = [];
    await armUpdateInterceptor(requests);
    try {
      // User explicitly enables update checking…
      await setCheckForUpdates(true);
      await global.client.reload();
      // …but the deployer's extconfig override should win and suppress
      // the XHR. Wait the same 3s window as TST9201; the override path
      // is synchronous in the same initApp dispatch chain.
      await global.client.waitForTimeout(3000);
      expect(requests.length).toBe(0);
    } finally {
      await disarmUpdateInterceptor();
    }
  });
});
