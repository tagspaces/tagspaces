/*
 * Copyright (c) 2016-present - TagSpaces GmbH. All rights reserved.
 */
import { test, expect } from './fixtures';
import {
  createS3Location,
  defaultLocationName,
} from './location.helpers';
import {
  clickOn,
  expectElementExist,
  getGridFileSelector,
} from './general.helpers';
import { startTestingApp, stopApp } from './hook';
import { clearDataStorage, closeWelcomePlaywright } from './welcome.helpers';

const readOnlyLocationName = 'readonly-mapique-s3';

test.beforeAll(async ({ isWeb, isS3, webServerPort }, testInfo) => {
  if (isS3) {
    await startTestingApp({ isWeb, isS3, webServerPort, testInfo });
    await closeWelcomePlaywright();
  } else {
    await startTestingApp(
      { isWeb, isS3, webServerPort, testInfo },
      'extconfig.js',
    );
  }
});

test.afterAll(async () => {
  await stopApp();
});

test.afterEach(async () => {
  await clearDataStorage();
});

test.describe('TST54 - Perspective Mapique', () => {
  test.describe('writable location', () => {
    test.beforeEach(async ({ isS3 }) => {
      // Mapique is Pro-only and only exercised against S3 here.
      test.skip(!isS3, 'Mapique e2e tests are S3-only for now');
      await createS3Location('', defaultLocationName, true);
      await clickOn('[data-tid=location_' + defaultLocationName + ']');
      await expectElementExist(
        getGridFileSelector('empty_folder'),
        true,
        15000,
      );
      await clickOn('[data-tid=openMapiquePerspective]');
      await expectElementExist(
        '[data-tid=perspectiveMapiqueToolbar]',
        true,
        10000,
      );
    });

    test('TST5401 - toolbar renders with core map controls [s3,electron,_pro]', async () => {
      // Smoke guard: opening Mapique on a writable location mounts the
      // toolbar and the map-theme / cluster-group toggles. Disabled state
      // here is tied to `bounds.current` (the map's visible bounds), not
      // to isReadOnly — so no enabled-assertion, just existence.
      await expectElementExist(
        '[data-tid=perspectiveMapiqueRefreshCurrentFolder]',
        true,
        4000,
      );
      await expectElementExist(
        '[data-tid=perspectiveMapiqueToggleMapTheme]',
        true,
        4000,
      );
      await expectElementExist(
        '[data-tid=perspectiveMapiqueToggleClusterGroup]',
        true,
        4000,
      );
    });
  });

  test.describe('read-only location', () => {
    test.beforeEach(async ({ isS3 }) => {
      test.skip(!isS3, 'Mapique e2e tests are S3-only for now');
      // Same test-ordering fix as folderviz/calendar: the preceding
      // writable describe's state leaves the app in Mapique with the
      // default location open, which breaks the first readonly create +
      // open. Reload to guarantee a clean slate.
      await global.client.reload();
      await closeWelcomePlaywright();
      await createS3Location('', readOnlyLocationName, true, false, true);
      await clickOn('[data-tid=location_' + readOnlyLocationName + ']');
      await expectElementExist(
        getGridFileSelector('empty_folder'),
        true,
        15000,
      );
      await clickOn('[data-tid=openMapiquePerspective]');
      await expectElementExist(
        '[data-tid=perspectiveMapiqueToolbar]',
        true,
        10000,
      );
    });

    test('TST5410 - opens on readonly without error toast [s3,electron,_pro]', async () => {
      // Regression guard: opening Mapique on a read-only location should
      // not surface a "read only Location" toast (any auto-indexing or
      // meta write inside the perspective must be guarded).
      await global.client.waitForTimeout(1000);
      const readOnlyToast = global.client.getByText(
        'read only Location',
        { exact: false },
      );
      await expect(readOnlyToast).toHaveCount(0);
    });
  });
});
