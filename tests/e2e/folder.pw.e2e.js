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
import { AddRemoveTagsToSelectedFiles } from './perspective-grid.helpers';

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

test.describe('TST01 - Folder management', () => {
  test('TST0101 - Create subfolder [web,minio,electron]', async () => {
    const testFolder = await createNewDirectory();
    await expectElementExist('[data-tid=fsEntryName_' + testFolder + ']');
    await global.client.dblclick('[data-tid=fsEntryName_' + testFolder + ']');
    await deleteDirectory();
    // await takeScreenshot('TST0101 after deleteDirectory');
    await reloadDirectory();
    // await takeScreenshot('TST0101 after reloadDirectory');
    await expectElementExist(
      '[data-tid=fsEntryName_' + testFolder + ']',
      false,
      5000
    );
  });

  test('TST0102 - Reload folder [web,minio,electron]', async () => {
    const testFolder = await createNewDirectory();
    await global.client.dblclick('[data-tid=fsEntryName_' + testFolder + ']');
    await reloadDirectory();
    await deleteDirectory();
    await expectElementExist(
      '[data-tid=fsEntryName_' + testFolder + ']',
      false,
      5000
    );
  });

  test('TST0103 - Rename folder [web,minio,electron]', async () => {
    const testFolder = await createNewDirectory();
    await global.client.dblclick('[data-tid=fsEntryName_' + testFolder + ']');
    const newDirectoryName = await renameFolder();
    await clickOn('[data-tid=gridPerspectiveOnBackButton]');
    await expectElementExist(
      '[data-tid=fsEntryName_' + newDirectoryName + ']',
      true,
      5000
    );
    // cleanup
    await global.client.dblclick(
      '[data-tid=fsEntryName_' + newDirectoryName + ']'
    );
    await deleteDirectory();
    await expectElementExist(
      '[data-tid=fsEntryName_' + newDirectoryName + ']',
      false,
      5000
    );
  });

  test('TST0104 - Delete empty folder by disabled trashcan [web,minio,electron]', async () => {
    // await setSettings('[data-tid=settingsSetUseTrashCan]');
    const testFolder = await createNewDirectory();
    await expectElementExist('[data-tid=fsEntryName_' + testFolder + ']');
    await global.client.dblclick('[data-tid=fsEntryName_' + testFolder + ']');
    await deleteDirectory();
    await expectElementExist(
      '[data-tid=fsEntryName_' + testFolder + ']',
      false,
      5000
    );
  });

  test('TST0105 - Open subfolder [web,minio,electron]', async () => {
    await global.client.dblclick(
      '[data-tid=fsEntryName_' + emptyFolderName + ']'
    );
    await expectElementExist(selectorFile, false, 5000);
  });

  test('TST0106 - Show folder tags [web,minio,electron]', async () => {
    await openContextEntryMenu(
      '[data-tid=fsEntryName_empty_folder]',
      'showProperties'
    );
    await AddRemovePropertiesTags(['test-tag1', 'test-tag2'], {
      add: true,
      remove: false
    });
    await expectElementExist('[data-tid=tagContainer_test-tag1]', true, 5000);
    await expectElementExist('[data-tid=tagContainer_test-tag2]', true, 5000);
    await AddRemovePropertiesTags(['test-tag1', 'test-tag2'], {
      add: false,
      remove: true
    });
    await expectElementExist('[data-tid=tagContainer_test-tag1]', false, 5000);
    await expectElementExist('[data-tid=tagContainer_test-tag2]', false, 5000);
  });

  test.skip('TST0107 - Show in file manager [manual]', async () => {});

  test('TST0108 - Move folder [web,minio,electron]', async () => {
    await createFile('file_to_move.txt', 'testing file content');
    await openContextEntryMenu(
      '[data-tid=fsEntryName_empty_folder]',
      'fileMenuMoveCopyDirectoryTID'
    );
    await clickOn('[data-tid=newSubdirectoryTID]');
    const folderToMove = 'folder_to_move';
    await setInputKeys('directoryName', folderToMove);
    await clickOn('[data-tid=confirmCreateNewDirectory]');
    await clickOn('[data-tid=MoveTarget' + folderToMove + ']');
    await clickOn('[data-tid=confirmMoveFiles]');
    await clickOn('[data-tid=uploadCloseAndClearTID]');
    await clickOn('[data-tid=location_' + defaultLocationName + ']');
    await expectElementExist(
      '[data-tid=fsEntryName_empty_folder]',
      false,
      5000
    );
    await global.client.dblclick('[data-tid=fsEntryName_' + folderToMove + ']');
    await expectElementExist('[data-tid=fsEntryName_empty_folder]', true, 5000);
    await testDataRefresh();
  });

  test('TST0109 - Copy folder [web,minio,electron]', async () => {
    await createFile('file_to_copy.txt', 'testing file content');
    await openContextEntryMenu(
      '[data-tid=fsEntryName_empty_folder]',
      'fileMenuMoveCopyDirectoryTID'
    );
    await clickOn('[data-tid=newSubdirectoryTID]');
    const folderToCopy = 'folder_to_copy';
    await setInputKeys('directoryName', folderToCopy);
    await clickOn('[data-tid=confirmCreateNewDirectory]');
    await clickOn('[data-tid=MoveTarget' + folderToCopy + ']');
    await clickOn('[data-tid=confirmCopyFiles]');
    await clickOn('[data-tid=uploadCloseAndClearTID]');
    await clickOn('[data-tid=location_' + defaultLocationName + ']');
    await expectElementExist('[data-tid=fsEntryName_empty_folder]', true, 5000);
    await global.client.dblclick('[data-tid=fsEntryName_' + folderToCopy + ']');
    await expectElementExist('[data-tid=fsEntryName_empty_folder]', true, 5000);
    await testDataRefresh();
  });

  test('TST0110 - Tag folder [web,minio,electron]', async () => {
    await clickOn('[data-tid=fsEntryName_empty_folder]');
    await AddRemoveTagsToSelectedFiles('grid', ['test-tag1']);
    await expectElementExist('[data-tid=tagContainer_test-tag1]', true, 5000);
    /*await openContextEntryMenu(
      '[data-tid=fsEntryName_empty_folder]',
      'fileMenuMoveCopyDirectoryTID'
    );*/
  });

  test('TST0111 - Open folder properties [web,minio,electron]', async () => {
    await openContextEntryMenu(
      '[data-tid=fsEntryName_empty_folder]',
      'showProperties'
    );
    await expectElementExist('[data-tid=OpenedTIDempty_folder]', true, 5000);
    /*const divElement = await global.client.$(
      '[data-tid=OpenedTIDsupported-filestypes]'
    );
    const divText = await divElement.innerText();
    expect(divText).toEqual('empty_folder');*/
  });

  test('TST0112 - Delete non empty folder by disabled trashcan [web,minio,electron]', async () => {
    await openContextEntryMenu(
      '[data-tid=fsEntryName_empty_folder]',
      'deleteDirectory'
    );
    await clickOn('[data-tid=confirmDeleteFileDialog]');
    await expectElementExist(
      '[data-tid=fsEntryName_empty_folder]',
      false,
      5000
    );
  });

  test.skip('TST0113 - Delete not empty folder to trashcan [electron]', async () => {});

  test('TST0116 - Switch to Grid Perspective [web,minio,electron]', async () => {
    await clickOn('[data-tid=openListPerspective]');
    await expectElementExist('[data-tid=listPerspectiveContainer]', true, 5000);
    await clickOn('[data-tid=openDefaultPerspective]');
    await expectElementExist('[data-tid=listPerspectiveContainer]', false);
    await expectElementExist('[data-tid=gridPerspectiveContainer]', true, 5000);
    await clickOn('[data-tid=gridPerspectiveOptionsMenu]');
    await expectElementExist(
      '[data-tid=gridPerspectiveToggleShowDirectories]',
      true,
      5000
    );
    await clickOn('[data-tid=closePerspectiveSettingsTID]');
  });

  test('TST0117 - Switch to List Perspective [web,minio,electron]', async () => {
    await clickOn('[data-tid=openListPerspective]');
    await expectElementExist('[data-tid=gridPerspectiveContainer]', false);
    await expectElementExist('[data-tid=listPerspectiveContainer]', true, 5000);
    await expectElementExist(
      '[data-tid=listPerspectiveOptionsMenu]',
      true,
      5000
    );
  });

  test('TST0118 - Switch to Gallery Perspective [web,minio,electron,_pro]', async () => {
    await clickOn('[data-tid=openGalleryPerspective]');
    await expectElementExist(
      '[data-tid=perspectiveGalleryToolbar]',
      true,
      5000
    );
    await expectElementExist('[data-tid=perspectiveGalleryHelp]', true, 5000);
  });

  test('TST0119 - Switch to Mapique Perspective [web,minio,electron,_pro]', async () => {
    await clickOn('[data-tid=openMapiquePerspective]');
    await expectElementExist(
      '[data-tid=perspectiveMapiqueToolbar]',
      true,
      5000
    );
    await expectElementExist('[data-tid=perspectiveMapiqueHelp]', true, 5000);
  });

  test('TST0120 - Switch to Kanban Perspective [web,minio,electron,_pro]', async () => {
    await clickOn('[data-tid=openKanbanPerspective]');
    await expectElementExist(
      '[data-tid=kanbanSettingsDialogOpenTID]',
      true,
      5000
    );
  });
});
