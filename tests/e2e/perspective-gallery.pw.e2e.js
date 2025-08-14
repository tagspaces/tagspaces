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
  await clickOn('[data-tid=openGalleryPerspective]');
});

test.describe('TST51 - Perspective openGalleryPerspective', () => {
  test('TST5120 - prev/next button [web,minio,s3,electron,_pro]', async () => {
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
