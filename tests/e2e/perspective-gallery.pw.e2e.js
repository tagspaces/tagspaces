/*
 * Copyright (c) 2016-present - TagSpaces GmbH. All rights reserved.
 */
import { test, expect } from './fixtures';
import {
  defaultLocationName,
  createPwLocation,
  createS3Location,
} from './location.helpers';
import {
  clickOn,
  expectElementExist,
  getGridFileSelector,
} from './general.helpers';
import { startTestingApp, stopApp } from './hook';
import { clearDataStorage, closeWelcomePlaywright } from './welcome.helpers';
import { dataTidFormat } from '../../src/renderer/services/test';

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

test.afterEach(async ({ page }, testInfo) => {
  /*if (testInfo.status !== testInfo.expectedStatus) {
    await takeScreenshot(testInfo);
  }*/
  await clearDataStorage();
});

test.beforeEach(async ({ isS3, testDataDir }) => {
  if (isS3) {
    await createS3Location('', defaultLocationName, true);
  } else {
    await createPwLocation(testDataDir, defaultLocationName, true);
  }
  await clickOn('[data-tid=location_' + defaultLocationName + ']');
  await expectElementExist(getGridFileSelector('empty_folder'), true, 15000);
  await clickOn('[data-tid=openGalleryPerspective]');
});

test.describe('TST51 - Perspective openGalleryPerspective', () => {
  test('TST5120 - prev/next button [web,s3,electron,_pro]', async () => {
    const fileName = 'sample.svg';
    const nextFileName = 'sample.tga';
    await clickOn(getGridFileSelector(fileName));
    await clickOn('[data-tid=perspectiveGalleryOpenFileButton]');
    await expectElementExist(
      '[data-tid=OpenedTID' + dataTidFormat(fileName) + ']',
      true,
      10000,
    );
    await clickOn('[data-tid=fileContainerNextFile]');
    await expectElementExist(
      '[data-tid=OpenedTID' + dataTidFormat(nextFileName) + ']',
      true,
      4000,
    );
    await clickOn('[data-tid=fileContainerPrevFile]');
    await expectElementExist(
      '[data-tid=OpenedTID' + dataTidFormat(fileName) + ']',
      true,
      4000,
    );
  });

});

test.describe('TST57 - Perspective Gallery smoke (writable)', () => {
  // TST5120 above opens a file and leaves the app in the file viewer. The
  // outer file-level beforeEach (line ~42) re-clicks the default location
  // but the app sometimes lands on a blank page. Reload to guarantee a
  // clean slate — same fix as folderviz/calendar.
  test.beforeEach(async ({ isS3 }) => {
    test.skip(!isS3, 'Gallery writable smoke is S3-only for now');
    await global.client.reload();
    await closeWelcomePlaywright();
    // Redux-persist hydrates from localStorage which was just cleared by
    // clearDataStorage, so after reload there are no locations — re-create
    // the default. createS3Location is idempotent via its TID guard.
    await createS3Location('', defaultLocationName, true);
    await clickOn('[data-tid=location_' + defaultLocationName + ']');
    await expectElementExist(
      getGridFileSelector('empty_folder'),
      true,
      15000,
    );
    await clickOn('[data-tid=openGalleryPerspective]');
    await expectElementExist(
      '[data-tid=perspectiveGalleryToolbar]',
      true,
      10000,
    );
  });

  test('TST5701 - toolbar renders with EXIF-import enabled on writable [s3,electron,_pro]', async () => {
    // Smoke guard: gallery toolbar mounts, the always-present back button
    // is there, and the EXIF-import button is ENABLED on a writable
    // location (disabled={currentLocation?.isReadOnly} in gallery/MainToolbar.tsx).
    // Buttons like perspectiveGalleryToggleThumbs only render when
    // !isMasonryEnabled, so we don't assert them here.
    await expectElementExist(
      '[data-tid=galleryPerspectiveBackButton]',
      true,
      4000,
    );
    const exifButton = global.client.locator(
      '[data-tid=perspectiveGalleryImportEXIF]',
    );
    await expect(exifButton).toBeEnabled();
  });
});

const readOnlyGalleryLocationName = 'readonly-gallery-s3';

test.describe('TST58 - Perspective Gallery on read-only location', () => {
  test.beforeEach(async ({ isS3 }) => {
    test.skip(!isS3, 'Readonly Gallery e2e tests are S3-only for now');
    // Same test-ordering fix as folderviz/calendar: the outer file-level
    // beforeEach (line ~42) has already opened the writable default
    // location in gallery perspective. For the first readonly create we
    // need a clean slate — otherwise the post-confirm navigation to the
    // new location lands on a blank page and the sidebar TID isn't
    // discoverable within the click timeout.
    await global.client.reload();
    await closeWelcomePlaywright();
    await createS3Location(
      '',
      readOnlyGalleryLocationName,
      true,
      false,
      true,
    );
    await clickOn(
      '[data-tid=location_' + readOnlyGalleryLocationName + ']',
    );
    await expectElementExist(
      getGridFileSelector('empty_folder'),
      true,
      15000,
    );
    await clickOn('[data-tid=openGalleryPerspective]');
    await expectElementExist(
      '[data-tid=perspectiveGalleryToolbar]',
      true,
      10000,
    );
  });

  test('TST5810 - EXIF-import button is disabled on readonly [s3,electron,_pro]', async () => {
    // Regression guard for the readonly guard in gallery MainToolbar:
    // perspectiveGalleryImportEXIF is disabled when currentLocation.isReadOnly.
    const exifButton = global.client.locator(
      '[data-tid=perspectiveGalleryImportEXIF]',
    );
    await expect(exifButton).toBeDisabled();
  });

  test('TST5811 - opens on readonly without "read only Location" toast [s3,electron,_pro]', async () => {
    // Any internal settings/meta write on perspective open must be
    // guarded — no error toast should surface.
    await global.client.waitForTimeout(1000);
    const readOnlyToast = global.client.getByText(
      'read only Location',
      { exact: false },
    );
    await expect(readOnlyToast).toHaveCount(0);
  });
});
