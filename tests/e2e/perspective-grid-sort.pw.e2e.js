/*
 * Copyright (c) 2016-present - TagSpaces GmbH. All rights reserved.
 */
import { test, expect } from './fixtures';
import {
  defaultLocationName,
  createPwMinioLocation,
  createPwLocation,
  createS3Location,
} from './location.helpers';
import {
  clickOn,
  expectElementExist,
  getGridFileName,
  getGridFileSelector,
  takeScreenshot,
} from './general.helpers';

import { startTestingApp, stopApp } from './hook';
import { closeWelcomePlaywright } from './welcome.helpers';
import { getDirEntries } from './perspective-grid.helpers';

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

/*test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    await takeScreenshot(testInfo);
  }
});*/

test.beforeEach(async ({ isMinio, isS3, testDataDir }) => {
  if (isMinio) {
    await createPwMinioLocation('', defaultLocationName, true);
  } else if (isS3) {
    await createS3Location('', defaultLocationName, true);
  } else {
    await createPwLocation(testDataDir, defaultLocationName, true);
  }
  await clickOn('[data-tid=location_' + defaultLocationName + ']');
  await expectElementExist(getGridFileSelector('empty_folder'), true, 8000);
  // If its have opened file
  // await closeFileProperties();
  await clickOn('[data-tid=gridPerspectiveSortMenu]');
});

// Scenarios for sorting files in grid perspective
test.describe('TST5003 - Testing sort files in the grid perspective', () => {
  test('TST10xx - Sort by name [web,minio,s3,electron]', async ({
    testDataDir,
  }) => {
    // DESC
    await clickOn('[data-tid=gridPerspectiveSortByName]');
    let sorted = getDirEntries(testDataDir, 'byName', false);
    for (let i = 0; i < sorted.length; i += 1) {
      const fileName = await getGridFileName(i);
      expect(fileName).toBe(sorted[i].name); //'sample_exif.jpg');
    }

    // ASC
    await clickOn('[data-tid=gridPerspectiveSortMenu]');
    await clickOn('[data-tid=gridPerspectiveSortByName]');

    sorted = getDirEntries(testDataDir, 'byName', true);
    for (let i = 0; i < sorted.length; i += 1) {
      const fileName = await getGridFileName(i);
      expect(fileName).toBe(sorted[i].name); //'sample.avif');
    }
  });

  test('TST10xx - Sort by size [web,minio,s3,electron]', async ({
    testDataDir,
  }) => {
    await clickOn('[data-tid=gridPerspectiveSortBySize]');
    // DESC
    let sorted = getDirEntries(testDataDir, 'byFileSize', true);
    for (let i = 0; i < sorted.length; i += 1) {
      const fileName = await getGridFileName(i);
      expect(fileName).toBe(sorted[i].name); //'sample.csv');
    }

    // ASC
    await clickOn('[data-tid=gridPerspectiveSortMenu]');
    await clickOn('[data-tid=gridPerspectiveSortBySize]');
    sorted = getDirEntries(testDataDir, 'byFileSize', false);
    for (let i = 0; i < sorted.length; i += 1) {
      const fileName = await getGridFileName(i);
      expect(fileName).toBe(sorted[i].name); //'sample.nef');
    }
  });

  test('TST10xx - Sort by date [web,minio,s3,electron]', async ({
    testDataDir,
  }) => {
    await clickOn('[data-tid=gridPerspectiveSortByDate]');

    let sorted = getDirEntries(testDataDir, 'byDateModified', true);
    for (let i = 0; i < sorted.length; i += 1) {
      const fileName = await getGridFileName(i);
      expect(fileName).toBe(sorted[i].name);
    }

    // ASC
    await clickOn('[data-tid=gridPerspectiveSortMenu]');
    await clickOn('[data-tid=gridPerspectiveSortByDate]');

    sorted = getDirEntries(testDataDir, 'byDateModified', false);
    for (let i = 0; i < sorted.length; i += 1) {
      const fileName = await getGridFileName(i);
      expect(fileName).toBe(sorted[i].name);
    }
  });

  test('TST10xx - Sort by extension [web,minio,s3,electron]', async ({
    testDataDir,
  }) => {
    await clickOn('[data-tid=gridPerspectiveSortByExt]');
    let sorted = getDirEntries(testDataDir, 'byExtension', true);
    for (let i = 0; i < sorted.length; i += 1) {
      const fileName = await getGridFileName(i);
      expect(fileName).toBe(sorted[i].name);
    }

    await clickOn('[data-tid=gridPerspectiveSortMenu]');
    await clickOn('[data-tid=gridPerspectiveSortByExt]');
    sorted = getDirEntries(testDataDir, 'byExtension', false);
    for (let i = 0; i < sorted.length; i += 1) {
      const fileName = await getGridFileName(i);
      expect(fileName).toBe(sorted[i].name);
    }
  });

  test('TST10xx - Sort by tags [web,minio,s3,electron]', async ({
    testDataDir,
  }) => {
    await clickOn('[data-tid=gridPerspectiveSortByFirstTag]');
    let sorted = getDirEntries(testDataDir, 'byFirstTag', true);
    for (let i = 0; i < sorted.length; i += 1) {
      const fileName = await getGridFileName(i);
      expect(fileName).toBe(sorted[i].name);
    }
    // ASC
    await clickOn('[data-tid=gridPerspectiveSortMenu]');
    await clickOn('[data-tid=gridPerspectiveSortByFirstTag]');
    sorted = getDirEntries(testDataDir, 'byFirstTag', false);
    for (let i = 0; i < sorted.length; i += 1) {
      const fileName = await getGridFileName(i);
      expect(fileName).toBe(sorted[i].name);
    }
  });
});
