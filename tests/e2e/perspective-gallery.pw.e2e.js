/*
 * Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved.
 */
import { test } from '@playwright/test';
import {
  defaultLocationPath,
  defaultLocationName,
  createPwMinioLocation,
  createPwLocation,
} from './location.helpers';
import {
  clickOn,
  expectElementExist,
  expectElementSelected,
  getGridFileSelector,
  takeScreenshot,
} from './general.helpers';
import { startTestingApp, stopApp, testDataRefresh } from './hook';
import { clearDataStorage } from './welcome.helpers';
import { openContextEntryMenu } from './test-utils';
import { dataTidFormat } from '../../src/renderer/services/test';

test.beforeAll(async () => {
  await startTestingApp('extconfig.js');
  //await clearDataStorage();
});

test.afterAll(async () => {
  await stopApp();
});

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    await takeScreenshot(testInfo);
  }
  await clearDataStorage();
  await testDataRefresh();
});

test.beforeEach(async () => {
  if (global.isMinio) {
    await createPwMinioLocation('', defaultLocationName, true);
  } else {
    await createPwLocation(defaultLocationPath, defaultLocationName, true);
  }
  await clickOn('[data-tid=location_' + defaultLocationName + ']');
  await clickOn('[data-tid=openGalleryPerspective]');
});

test.describe('TST51 - Perspective openGalleryPerspective', () => {
  test('TST5120 - prev/next button [web,electron,_pro]', async () => {
    const fileName = 'sample.svg';
    const nextFileName = 'sample.tga';
    await clickOn(getGridFileSelector(fileName));
    await clickOn('[data-tid=perspectiveGalleryOpenFileButton]');
    await expectElementExist(
      '[data-tid=OpenedTID' + dataTidFormat(fileName) + ']',
      true,
    );
    await clickOn('[data-tid=fileContainerNextFile]');
    await expectElementExist(
      '[data-tid=OpenedTID' + dataTidFormat(nextFileName) + ']',
      true,
    );
    await clickOn('[data-tid=fileContainerPrevFile]');
    await expectElementExist(
      '[data-tid=OpenedTID' + dataTidFormat(fileName) + ']',
      true,
    );
  });
});
