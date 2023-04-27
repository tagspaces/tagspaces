/*
 * Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved.
 */
import { expect, test } from '@playwright/test';
import {
  defaultLocationPath,
  defaultLocationName,
  createPwMinioLocation,
  createPwLocation
} from './location.helpers';
import { clickOn, getGridFileName } from './general.helpers';

import { startTestingApp, stopApp, testDataRefresh } from './hook';
import { init } from './welcome.helpers';
import { getDirEntries } from './perspective-grid.helpers';

test.beforeAll(async () => {
  await startTestingApp('extconfig-with-welcome.js');
  await init();
});

test.afterAll(async () => {
  await stopApp();
  await testDataRefresh();
});

/*test.afterEach(async () => {
  await init();
});*/

test.beforeEach(async () => {
  if (global.isMinio) {
    await createPwMinioLocation('', defaultLocationName, true);
  } else {
    await createPwLocation(defaultLocationPath, defaultLocationName, true);
  }
  await clickOn('[data-tid=location_' + defaultLocationName + ']');
  // If its have opened file
  // await closeFileProperties();
  await clickOn('[data-tid=gridPerspectiveSortMenu]');
});

// Scenarios for sorting files in grid perspective
test.describe(
  'TST5003 - Testing sort files in the grid perspective [web,minio,electron]',
  () => {
    test('TST10xx - Sort by name [web,minio,electron]', async () => {
      // DESC
      await clickOn('[data-tid=gridPerspectiveSortByName]');
      let sorted = getDirEntries('byName', false);
      for (let i = 0; i < sorted.length; i += 1) {
        const fileName = await getGridFileName(i);
        expect(fileName).toBe(sorted[i].name); //'sample_exif.jpg');
      }

      // ASC
      await clickOn('[data-tid=gridPerspectiveSortMenu]');
      await clickOn('[data-tid=gridPerspectiveSortByName]');

      sorted = getDirEntries('byName', true);
      for (let i = 0; i < sorted.length; i += 1) {
        const fileName = await getGridFileName(i);
        expect(fileName).toBe(sorted[i].name); //'sample.avif');
      }
    });

    test('TST10xx - Sort by size [web,minio,electron]', async () => {
      await clickOn('[data-tid=gridPerspectiveSortBySize]');
      // DESC
      let sorted = getDirEntries('byFileSize', true);
      for (let i = 0; i < sorted.length; i += 1) {
        const fileName = await getGridFileName(i);
        expect(fileName).toBe(sorted[i].name); //'sample.csv');
      }

      // ASC
      await clickOn('[data-tid=gridPerspectiveSortMenu]');
      await clickOn('[data-tid=gridPerspectiveSortBySize]');
      sorted = getDirEntries('byFileSize', false);
      for (let i = 0; i < sorted.length; i += 1) {
        const fileName = await getGridFileName(i);
        expect(fileName).toBe(sorted[i].name); //'sample.nef');
      }
    });

    test('TST10xx - Sort by date [web,minio,electron]', async () => {
      await clickOn('[data-tid=gridPerspectiveSortByDate]');

      let sorted = getDirEntries('byDateModified', true);
      for (let i = 0; i < sorted.length; i += 1) {
        const fileName = await getGridFileName(i);
        expect(fileName).toBe(sorted[i].name);
      }

      // ASC
      await clickOn('[data-tid=gridPerspectiveSortMenu]');
      await clickOn('[data-tid=gridPerspectiveSortByDate]');

      sorted = getDirEntries('byDateModified', false);
      for (let i = 0; i < sorted.length; i += 1) {
        const fileName = await getGridFileName(i);
        expect(fileName).toBe(sorted[i].name);
      }
    });

    test('TST10xx - Sort by extension [web,minio,electron]', async () => {
      await clickOn('[data-tid=gridPerspectiveSortByExt]');
      let sorted = getDirEntries('byExtension', true);
      for (let i = 0; i < sorted.length; i += 1) {
        const fileName = await getGridFileName(i);
        expect(fileName).toBe(sorted[i].name);
      }

      await clickOn('[data-tid=gridPerspectiveSortMenu]');
      await clickOn('[data-tid=gridPerspectiveSortByExt]');
      sorted = getDirEntries('byExtension', false);
      for (let i = 0; i < sorted.length; i += 1) {
        const fileName = await getGridFileName(i);
        expect(fileName).toBe(sorted[i].name);
      }
    });

    test('TST10xx - Sort by tags [web,minio,electron]', async () => {
      await clickOn('[data-tid=gridPerspectiveSortByFirstTag]');
      let sorted = getDirEntries('byFirstTag', true);
      for (let i = 0; i < sorted.length; i += 1) {
        const fileName = await getGridFileName(i);
        expect(fileName).toBe(sorted[i].name);
      }
      // ASC
      await clickOn('[data-tid=gridPerspectiveSortMenu]');
      await clickOn('[data-tid=gridPerspectiveSortByFirstTag]');
      sorted = getDirEntries('byFirstTag', false);
      for (let i = 0; i < sorted.length; i += 1) {
        const fileName = await getGridFileName(i);
        expect(fileName).toBe(sorted[i].name);
      }
    });
  }
);
