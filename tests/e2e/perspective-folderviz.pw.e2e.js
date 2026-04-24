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

const readOnlyLocationName = 'readonly-folderviz-s3';

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

test.describe('TST52 - Perspective FolderViz', () => {
  test.describe('writable location', () => {
    test.beforeEach(async ({ isS3 }) => {
      // FolderViz is Pro-only and today only exercised against S3 in tests.
      test.skip(!isS3, 'FolderViz e2e tests are S3-only for now');
      await createS3Location('', defaultLocationName, true);
      await clickOn('[data-tid=location_' + defaultLocationName + ']');
      await expectElementExist(
        getGridFileSelector('empty_folder'),
        true,
        15000,
      );
      await clickOn('[data-tid=openFolderVizPerspective]');
      await expectElementExist(
        '[data-tid=perspectiveFolderVizToolbar]',
        true,
        10000,
      );
    });

    test('TST5201 - toolbar renders with all viz switches [s3,electron,_pro]', async () => {
      // Every viz-switch button is present, plus the index-refresh button
      // is ENABLED (writable location).
      await expectElementExist(
        '[data-tid=perspectiveFolderVizSwitchToRadialHorizontalTree]',
        true,
        4000,
      );
      await expectElementExist(
        '[data-tid=perspectiveFolderVizSwitchToRadialTreeViz]',
        true,
        4000,
      );
      await expectElementExist(
        '[data-tid=perspectiveFolderVizSwitchToTagsGraph]',
        true,
        4000,
      );
      await expectElementExist(
        '[data-tid=perspectiveFolderVizSwitchToLinkGraph]',
        true,
        4000,
      );
      await expectElementExist(
        '[data-tid=perspectiveFolderVizSwitchToRadialTreemap]',
        true,
        4000,
      );
      const indexButton = global.client.locator(
        '[data-tid=perspectiveFolderVizUpdateLocationIndex]',
      );
      await expect(indexButton).toBeEnabled();
    });

    test('TST5202 - switching viz types does not raise an error toast [s3,electron,_pro]', async () => {
      // Regression guard for the saveSettings write-on-viz-switch path.
      // On a writable location nothing should surface as an error.
      await clickOn(
        '[data-tid=perspectiveFolderVizSwitchToRadialTreeViz]',
      );
      await clickOn('[data-tid=perspectiveFolderVizSwitchToRadialTreemap]');
      await clickOn(
        '[data-tid=perspectiveFolderVizSwitchToRadialHorizontalTree]',
      );
      // No "read only Location" toast on a writable location.
      const readOnlyToast = global.client.getByText(
        'read only Location',
        { exact: false },
      );
      await expect(readOnlyToast).toHaveCount(0);
    });
  });

  test.describe('read-only location', () => {
    test.beforeEach(async ({ isS3 }) => {
      test.skip(!isS3, 'FolderViz e2e tests are S3-only for now');
      // The preceding writable-location describe leaves the app in FolderViz
      // perspective with the default location open. When the first read-only
      // test then creates its location via the dialog, the post-confirm
      // navigation to the new location leaves the main content blank
      // (fresh readonly + Pro side effects of opening a location that was
      // just dispatched to the store). Reload to guarantee a clean slate.
      await global.client.reload();
      await closeWelcomePlaywright();
      // Fresh name so createS3Location actually runs (its guard skips
      // creation when the last known location matches by TID).
      await createS3Location('', readOnlyLocationName, true, false, true);
      await clickOn('[data-tid=location_' + readOnlyLocationName + ']');
      await expectElementExist(
        getGridFileSelector('empty_folder'),
        true,
        15000,
      );
      await clickOn('[data-tid=openFolderVizPerspective]');
      await expectElementExist(
        '[data-tid=perspectiveFolderVizToolbar]',
        true,
        10000,
      );
    });

    test('TST5210 - index refresh button is disabled on readonly [s3,electron,_pro]', async () => {
      // Regression guard for the toolbar-disable fix in FolderViz
      // MainToolbar — the "Refresh Location Index" button should be
      // greyed out on readonly locations because a re-index can't persist.
      const indexButton = global.client.locator(
        '[data-tid=perspectiveFolderVizUpdateLocationIndex]',
      );
      await expect(indexButton).toBeDisabled();
    });

    test('TST5211 - switching viz types does NOT show "read only Location" toast [s3,electron,_pro]', async () => {
      // Regression guard for the saveSettings-on-readonly fix in
      // PerspectiveSettingsContextProvider: switching the viz type
      // updates in-memory settings and no longer attempts a disk write,
      // so no error toast should surface.
      await clickOn(
        '[data-tid=perspectiveFolderVizSwitchToRadialTreeViz]',
      );
      await clickOn('[data-tid=perspectiveFolderVizSwitchToRadialTreemap]');
      await clickOn('[data-tid=perspectiveFolderVizSwitchToTagsGraph]');
      // Give any toast a chance to surface, then assert it did not.
      await global.client.waitForTimeout(1000);
      const readOnlyToast = global.client.getByText(
        'read only Location',
        { exact: false },
      );
      await expect(readOnlyToast).toHaveCount(0);
    });

    test('TST5212 - links graph viz does NOT prompt to re-index on readonly [s3,electron,_pro]', async () => {
      // Regression guard for the MainToolbar `needsLinksGraphIndex` fix:
      // on readonly, switching to links graph used to show a confirm
      // dialog asking to index the location (which would then fail).
      await clickOn('[data-tid=perspectiveFolderVizSwitchToLinkGraph]');
      await global.client.waitForTimeout(1000);
      // The confirm dialog's dedicated confirm button would be
      // "confirmLinksGraphIndexTID" — asserting absence is the cleanest
      // check that the dialog did not appear.
      await expectElementExist(
        '[data-tid=confirmLinksGraphIndexTID]',
        false,
        500,
      );
    });
  });
});
