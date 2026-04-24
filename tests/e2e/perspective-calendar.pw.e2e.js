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

const readOnlyLocationName = 'readonly-calendar-s3';

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

test.describe('TST53 - Perspective Calendar', () => {
  test.describe('writable location', () => {
    test.beforeEach(async ({ isS3 }) => {
      // Calendar is Pro-only and only exercised against S3 here.
      test.skip(!isS3, 'Calendar e2e tests are S3-only for now');
      await createS3Location('', defaultLocationName, true);
      await clickOn('[data-tid=location_' + defaultLocationName + ']');
      await expectElementExist(
        getGridFileSelector('empty_folder'),
        true,
        15000,
      );
      await clickOn('[data-tid=openCalendarPerspective]');
      // Calendar's toolbar currently reuses the FolderViz toolbar tid —
      // see calendar/MainToolbar.tsx. This test guards that the toolbar
      // mounts at all when the perspective opens.
      await expectElementExist(
        '[data-tid=perspectiveFolderVizToolbar]',
        true,
        10000,
      );
    });

    test('TST5301 - toolbar renders with the calendar view switches [s3,electron,_pro]', async () => {
      await expectElementExist(
        '[data-tid=perspectiveCalendarSwitchToYearsView]',
        true,
        4000,
      );
      await expectElementExist(
        '[data-tid=perspectiveCalendarSwitchToMonthView]',
        true,
        4000,
      );
      const indexButton = global.client.locator(
        '[data-tid=perspectiveCalendarIndexLocation]',
      );
      await expect(indexButton).toBeEnabled();
    });
  });

  test.describe('read-only location', () => {
    test.beforeEach(async ({ isS3 }) => {
      test.skip(!isS3, 'Calendar e2e tests are S3-only for now');
      // The preceding writable-location describe leaves the app in the
      // Calendar perspective with the default location open. When the first
      // readonly test then creates its location via the dialog, the
      // post-confirm navigation to the new location leaves the main content
      // blank and the new location's sidebar TID isn't discoverable in time.
      // Reload to guarantee a clean slate — same fix as FolderViz e2e.
      await global.client.reload();
      await closeWelcomePlaywright();
      await createS3Location('', readOnlyLocationName, true, false, true);
      await clickOn('[data-tid=location_' + readOnlyLocationName + ']');
      await expectElementExist(
        getGridFileSelector('empty_folder'),
        true,
        15000,
      );
      await clickOn('[data-tid=openCalendarPerspective]');
      await expectElementExist(
        '[data-tid=perspectiveFolderVizToolbar]',
        true,
        10000,
      );
    });

    test('TST5310 - index refresh button is disabled on readonly [s3,electron,_pro]', async () => {
      // Regression guard for the Calendar MainToolbar fix: the index
      // refresh button should be greyed out on readonly locations.
      const indexButton = global.client.locator(
        '[data-tid=perspectiveCalendarIndexLocation]',
      );
      await expect(indexButton).toBeDisabled();
    });

    test('TST5311 - switching calendar views does NOT show "read only Location" toast [s3,electron,_pro]', async () => {
      // Regression guard for the saveSettings-on-readonly fix in
      // PerspectiveSettingsContextProvider — switching calendar views
      // should NOT attempt a disk write and must not surface an error.
      await clickOn('[data-tid=perspectiveCalendarSwitchToYearsView]');
      await clickOn('[data-tid=perspectiveCalendarSwitchToMonthView]');
      await global.client.waitForTimeout(1000);
      const readOnlyToast = global.client.getByText(
        'read only Location',
        { exact: false },
      );
      await expect(readOnlyToast).toHaveCount(0);
    });
  });
});
