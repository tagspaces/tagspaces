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
  isDisplayed,
  openFolder,
  setPerspectiveSetting,
  takeScreenshot,
  typeInputValue,
} from './general.helpers';
import {
  createFileS3,
  createFolderS3,
  createLocalFile,
  createLocalFolder,
  startTestingApp,
  stopApp,
} from './hook';
import { clearDataStorage, closeWelcomePlaywright } from './welcome.helpers';
import { openContextEntryMenu } from './test-utils';
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
  //await expectElementExist(getGridFileSelector('empty_folder'), true, 10000);
  await clickOn('[data-tid=openKanbanPerspective]');
  await expectElementExist(
    '[data-tid=kanbanSettingsDialogOpenTID]',
    true,
    5000,
  );
});

test.describe('TST49 - Perspective KanBan', () => {
  test('TST4901 - Folder which is opened in kanban for the first time [web,minio,electron,_pro]', async ({
    isS3,
    testDataDir,
  }) => {
    // Open max 3 sub-folders as columns on fresh folder
    await expectElementExist(
      '[data-tid=kanbanSettingsDialogOpenTID]',
      true,
      5000,
    );
    if (isS3) {
      await createFolderS3('test_kanban_column1');
      await createFolderS3('test_kanban_column2');
      await createFolderS3('test_kanban_column3');
      await createFolderS3('test_kanban_column4');
    } else {
      await createLocalFolder(testDataDir, 'test_kanban_column1');
      await createLocalFolder(testDataDir, 'test_kanban_column2');
      await createLocalFolder(testDataDir, 'test_kanban_column3');
      await createLocalFolder(testDataDir, 'test_kanban_column4');
    }

    await global.client.dblclick('[data-tid=empty_folderKanBanColumnTID]');
    await expectElementExist(
      '[data-tid=test_kanban_column1KanBanColumnTID]',
      true,
      5000,
    );
    await expectElementExist(
      '[data-tid=test_kanban_column2KanBanColumnTID]',
      true,
      5000,
    );
    await expectElementExist(
      '[data-tid=test_kanban_column3KanBanColumnTID]',
      true,
      5000,
    );
    await expectElementExist(
      '[data-tid=test_kanban_column4KanBanColumnTID]',
      false,
      5000,
    );
  });

  test('TST4902 - Show current folder [web,minio,electron,_pro]', async ({
    isS3,
    isMinio,
  }) => {
    await expectElementExist(
      '[data-tid=empty_folderKanBanColumnTID]',
      true,
      5000,
    );
    const locationFolderName = isS3 || isMinio ? '' : defaultLocationName;
    await expectElementExist(
      '[data-tid=' + locationFolderName + 'KanBanColumnTID]',
      false,
      5000,
    );

    await clickOn('[data-tid=showFolderContentTID]');

    await expectElementExist(
      '[data-tid=' + locationFolderName + 'KanBanColumnTID]',
      true,
      5000,
    );
  });

  test('TST4903 - Create new columns(sub-folder) [web,minio,electron,_pro]', async () => {
    const columnName = 'testFolder';
    await clickOn('[data-tid=createKanBanColumnTID]');

    await typeInputValue('[data-tid=directoryName] input', columnName, 0);
    await clickOn('[data-tid=confirmCreateNewDirectory]');

    await expectElementExist(
      '[data-tid=' + columnName + 'KanBanColumnTID]',
      true,
      5000,
    );
  });

  test('TST4904 - Rename column [web,minio,electron,_pro]', async () => {});

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
    /* await clickOn('[data-tid=empty_folderKanBanColumnActionTID]');
    await clickOn('[data-tid=columnVisibilityTID]');
    await expectElementExist(getGridFileSelector(fileName), false, 5000);*/

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
    await expectElementExist(getGridFileSelector(fileName), true, 5000);
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
