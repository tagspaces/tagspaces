/*
 * Copyright (c) 2016-present - TagSpaces GmbH. All rights reserved.
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
  setPerspectiveSetting,
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

test.beforeAll(async ({ isWeb, isS3, s3Server, webServer, minioServer }) => {
  s3ServerInstance = s3Server;
  webServerInstance = webServer;
  minioServerInstance = minioServer;
  if (isS3) {
    await startTestingApp({ isWeb, isS3 });
    await closeWelcomePlaywright();
  } else {
    await startTestingApp({ isWeb, isS3 }, 'extconfig.js');
  }
});

test.afterAll(async () => {
  await stopServices(s3ServerInstance, webServerInstance, minioServerInstance);
  await stopApp();
});

test.afterEach(async ({ page }, testInfo) => {
  /*if (testInfo.status !== testInfo.expectedStatus) {
    await takeScreenshot(testInfo);
  }*/
  await testDataRefresh(s3ServerInstance);
  await clearDataStorage();
});

test.beforeEach(async ({ isMinio, isS3 }) => {
  if (isMinio) {
    await createPwMinioLocation('', defaultLocationName, true);
  } else if (isS3) {
    await createS3Location('', defaultLocationName, true);
  } else {
    await createPwLocation(defaultLocationPath, defaultLocationName, true);
  }
  await clickOn('[data-tid=location_' + defaultLocationName + ']');
  await expectElementExist(getGridFileSelector('empty_folder'), true, 8000);
  await clickOn('[data-tid=openKanbanPerspective]');
  await expectElementExist(
    '[data-tid=kanbanSettingsDialogOpenTID]',
    true,
    5000,
  );
});

test.describe('TST49 - Perspective KanBan', () => {
  test('TST4909 - move with copy/move file dialog [web,minio,electron,_pro]', async () => {
    const fileName = 'sample.bmp';

    await setPerspectiveSetting(
      'kanban',
      '[data-tid=kanbanPerspectiveToggleShowFolderContent]',
    );

    await expectElementExist(getGridFileSelector(fileName), true, 8000);
    await openContextEntryMenu(
      getGridFileSelector(fileName),
      'fileMenuMoveCopyFile',
    );
    await clickOn('[data-tid=MoveTargetempty_folder]');
    await clickOn('[data-tid=confirmMoveFiles]');

    // hide empty_folder in order to expect moved file is not shown
    await clickOn('[data-tid=empty_folderKanBanColumnActionTID]');
    await clickOn('[data-tid=columnVisibilityTID]');

    await expectElementExist(getGridFileSelector(fileName), false, 5000);
    await openContextEntryMenu(
      getGridFileSelector('empty_folder'),
      'openDirectory',
    );
    /*
    todo fileName not always show in KanBan empty_folder dir content is hidden -> hideFolderContentTID must be clicked on
    if (await isDisplayed('[data-tid=showFolderContentTID]')) {
     await clickOn('[data-tid=showFolderContentTID]');
    }*/
    await clickOn('[data-tid=openDefaultPerspective]');
    await expectElementExist(getGridFileSelector(fileName), true, 55000);
    await clickOn('[data-tid=openKanbanPerspective]');
  });

  test('TST4910 - prev/next button [web,electron,_pro]', async () => {
    const fileName = 'sample.3gp';
    const nextFileName = 'sample.avif';
    if (await isDisplayed('[data-tid=showFolderContentTID]')) {
      await clickOn('[data-tid=showFolderContentTID]');
    }
    await expectElementExist(getGridFileSelector(fileName), true, 8000);
    await clickOn(getGridFileSelector(fileName));
    await expectElementExist(
      '[data-tid=OpenedTID' + dataTidFormat(fileName) + ']',
      true,
      5000,
    );
    await clickOn('[data-tid=fileContainerNextFile]');
    await expectElementExist(
      '[data-tid=OpenedTID' + dataTidFormat(nextFileName) + ']',
      true,
      5000,
    );
    await clickOn('[data-tid=fileContainerPrevFile]');
    await expectElementExist(
      '[data-tid=OpenedTID' + dataTidFormat(fileName) + ']',
      true,
      5000,
    );
  });
});
