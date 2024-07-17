/*
 * Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved.
 */
import { test, expect } from './fixtures';
import {
  defaultLocationPath,
  defaultLocationName,
  createPwMinioLocation,
  createPwLocation,
  createS3Location,
} from './location.helpers';
import {
  clickOn,
  expectElementExist,
  getGridFileSelector,
  isDisplayed,
  takeScreenshot,
} from './general.helpers';
import { startTestingApp, stopApp, testDataRefresh } from './hook';
import { clearDataStorage, closeWelcomePlaywright } from './welcome.helpers';
import { openContextEntryMenu } from './test-utils';
import { dataTidFormat } from '../../src/renderer/services/test';
import { stopServices } from '../setup-functions';

let s3ServerInstance;
let webServerInstance;
let minioServerInstance;

test.beforeAll(async ({ s3Server, webServer, minioServer }) => {
  s3ServerInstance = s3Server;
  webServerInstance = webServer;
  minioServerInstance = minioServer;
  if (global.isS3) {
    await startTestingApp();
    await closeWelcomePlaywright();
  } else {
    await startTestingApp('extconfig.js');
  }
});

test.afterAll(async () => {
  await stopServices(s3ServerInstance, webServerInstance, minioServerInstance);
  await stopApp();
});

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    await takeScreenshot(testInfo);
  }
  await testDataRefresh(s3ServerInstance);
  await clearDataStorage();
});

test.beforeEach(async () => {
  if (global.isMinio) {
    await createPwMinioLocation('', defaultLocationName, true);
  } else if (global.isS3) {
    await createS3Location('', defaultLocationName, true);
  } else {
    await createPwLocation(defaultLocationPath, defaultLocationName, true);
  }
  await clickOn('[data-tid=location_' + defaultLocationName + ']');
  await clickOn('[data-tid=openKanbanPerspective]');
});

test.describe('TST49 - Perspective KanBan', () => {
  test('TST4909 - move with copy/move file dialog [web,electron,_pro]', async () => {
    const fileName = 'sample.bmp';
    if (await isDisplayed('[data-tid=showFolderContentTID]')) {
      await clickOn('[data-tid=showFolderContentTID]');
    }
    await openContextEntryMenu(
      getGridFileSelector(fileName),
      'fileMenuMoveCopyFile',
    );
    await clickOn('[data-tid=MoveTargetempty_folder]');
    await clickOn('[data-tid=confirmMoveFiles]');
    await openContextEntryMenu(
      getGridFileSelector('empty_folder'),
      'openDirectory',
    );
    await expectElementExist(getGridFileSelector(fileName), true);
  });

  test('TST4910 - prev/next button [web,electron,_pro]', async () => {
    const fileName = 'sample.3gp';
    const nextFileName = 'sample.avif';
    if (await isDisplayed('[data-tid=showFolderContentTID]')) {
      await clickOn('[data-tid=showFolderContentTID]');
    }
    await clickOn(getGridFileSelector(fileName));
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
