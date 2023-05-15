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
import {
  reloadDirectory,
  createNewDirectory,
  deleteDirectory,
  clickOn,
  expectElementExist,
  takeScreenshot,
  selectorFile,
  setInputKeys
} from './general.helpers';
import { openContextEntryMenu, renameFolder } from './test-utils';
import { createFile, startTestingApp, stopApp, testDataRefresh } from './hook';
import { clearDataStorage } from './welcome.helpers';
import { emptyFolderName } from './search.helpers';
import { AddRemovePropertiesTags } from './file.properties.helpers';
import { dataTidFormat } from '../../app/services/test';

test.beforeAll(async () => {
  await startTestingApp('extconfig.js');
  // await clearDataStorage();
});

test.afterAll(async () => {
  await stopApp();
  await testDataRefresh();
});

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    await takeScreenshot(testInfo);
  }
  await clearDataStorage();
});

test.beforeEach(async () => {
  if (global.isMinio) {
    await createPwMinioLocation('', defaultLocationName, true);
  } else {
    await createPwLocation(defaultLocationPath, defaultLocationName, true);
  }
  await clickOn('[data-tid=location_' + defaultLocationName + ']');
  // If its have opened file
  // await closeFileProperties();
});

test.describe('TST02 - Folder properties', () => {
  test('TST0201 - Open in main area [web,minio,electron]', async () => {
    const testFile = 'file_in_empty_folder.txt';
    await createFile(testFile);
    await openContextEntryMenu(
      '[data-tid=fsEntryName_empty_folder]',
      'showProperties'
    );
    await clickOn('[data-tid=openInMainAreaTID]');

    await expectElementExist(
      '[data-tid=fsEntryName_' + dataTidFormat(testFile) + ']',
      true,
      5000
    );
  });
});
