/*
 * Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved.
 */
import { expect, test } from '@playwright/test';
import {
  defaultLocationPath,
  defaultLocationName,
  createPwMinioLocation,
  createPwLocation,
} from './location.helpers';
import {
  clickOn,
  createNewDirectory,
  expectElementExist,
  getGridFileSelector,
  rightClickOn,
  setInputKeys,
  takeScreenshot,
} from './general.helpers';
import { startTestingApp, stopApp, testDataRefresh } from './hook';
import { createSavedSearch, searchEngine } from './search.helpers';
import { openContextEntryMenu } from './test-utils';
import { dataTidFormat } from '../../src/renderer/services/test';
import { clearDataStorage, closeWelcomePlaywright } from './welcome.helpers';

test.beforeAll(async () => {
  await startTestingApp();
  //await clearDataStorage();
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
  await closeWelcomePlaywright();
  await clickOn('[data-tid=locationManager]');
  if (global.isMinio) {
    await createPwMinioLocation('', defaultLocationName, true);
  } else {
    await createPwLocation(defaultLocationPath, defaultLocationName, true);
  }
  await clickOn('[data-tid=location_' + defaultLocationName + ']');
  // If its have opened file
  // await closeFileProperties();
});

test.describe('TST09 - Quick access', () => {
  test('TST0901 - Create, rename and delete stored search [electron,_pro]', async () => {
    const storedSearchTitle = 'jpgSearch';
    await createSavedSearch({ title: storedSearchTitle, textQuery: 'jpg' });
    //await expectElementExist('[data-tid=quickAccessButton]');
    await clickOn('[data-tid=quickAccessButton]');
    // await clickOn('[data-tid=storedSearchesVisibleTID]');
    await expectElementExist(
      '[data-tid=StoredSearchTID' + storedSearchTitle + ']',
    );
    // Rename
    await clickOn('[data-tid=editSearchTID]');
    await setInputKeys('savedSearchTID', 'Renamed');
    await clickOn('[data-tid=confirmSavedSearchTID]');
    await expectElementExist(
      '[data-tid=StoredSearchTID' + storedSearchTitle + 'Renamed]',
    );
    //Delete
    await clickOn('[data-tid=editSearchTID]');
    await clickOn('[data-tid=deleteSavedSearchTID]');
    await expectElementExist(
      '[data-tid=StoredSearchTID' + storedSearchTitle + 'Renamed]',
      false,
    );
  });

  test('TST0902 - Create, execute and delete stored search [electron,_pro]', async () => {
    const storedSearchTitle = 'jpgExecutedSearch';
    const textQuery = 'jpg';
    await createSavedSearch({ title: storedSearchTitle, textQuery });
    //await expectElementExist('[data-tid=quickAccessButton]');
    await clickOn('[data-tid=quickAccessButton]');
    // await clickOn('[data-tid=storedSearchesVisibleTID]');
    await expectElementExist(
      '[data-tid=StoredSearchTID' + storedSearchTitle + ']',
    );
    // Execute
    await clickOn('[data-tid=StoredSearchTID' + storedSearchTitle + ']');
    const inputValue = await global.client.inputValue('#textQuery');
    expect(inputValue).toBe(textQuery);
    //Delete
    await clickOn('[data-tid=editSearchTID]');
    await clickOn('[data-tid=deleteSavedSearchTID]');
    await expectElementExist(
      '[data-tid=StoredSearchTID' + storedSearchTitle + ']',
      false,
    );
  });

  test('TST0905 - Create, open and remove bookmark to file in properties [electron,web,_pro]', async () => {
    const bookmarkFileTitle = 'sample.txt';
    const bookmarkFileTid = dataTidFormat(bookmarkFileTitle);
    await openContextEntryMenu(
      getGridFileSelector(bookmarkFileTitle), // todo rethink selector here contain dot
      'fileMenuOpenFile',
    );

    // Create
    await clickOn('[data-tid=toggleBookmarkTID]');
    await clickOn('[data-tid=fileContainerCloseOpenedFile]');

    // Open
    await clickOn('[data-tid=quickAccessButton]');
    await expectElementExist(
      '[data-tid=tsBookmarksTID' + bookmarkFileTid + ']',
    );
    await clickOn('[data-tid=tsBookmarksTID' + bookmarkFileTid + ']');
    await expectElementExist('[data-tid=OpenedTID' + bookmarkFileTid + ']');

    //Delete
    await clickOn('[data-tid=toggleBookmarkTID]');
    //await clickOn('[data-tid=fileContainerCloseOpenedFile]');
    //await clickOn('[id=mobileMenuButton]');

    await clickOn('[data-tid=BookmarksMenuTID]');
    await clickOn('[data-tid=refreshBookmarksTID]');

    await expectElementExist(
      '[data-tid=tsBookmarksTID' + bookmarkFileTid + ']',
      false,
    );
  });

  test('TST0906 - Create, open and remove bookmark to folder in quickaccess [electron,web,_pro]', async () => {
    const testFolder = 'empty_folder';
    await rightClickOn('[data-tid=fsEntryName_' + testFolder + ']');
    await clickOn('[data-tid=showProperties]');
    //await clickOn('[data-tid=folderContainerOpenDirMenu]');
    //await clickOn('[data-tid=showProperties]');

    // Create
    await clickOn('[data-tid=toggleBookmarkTID]');
    await clickOn('[data-tid=fileContainerCloseOpenedFile]');

    // Open
    await clickOn('[data-tid=quickAccessButton]');
    await expectElementExist('[data-tid=tsBookmarksTID' + testFolder + ']');
    await clickOn('[data-tid=tsBookmarksTID' + testFolder + ']');
    await clickOn('[data-tid=folderContainerOpenDirMenu]');
    await clickOn('[data-tid=showProperties]');
    await expectElementExist('[data-tid=OpenedTID' + testFolder + ']');

    //Delete
    await clickOn('[data-tid=toggleBookmarkTID]');
    await clickOn('[data-tid=BookmarksMenuTID]');
    await clickOn('[data-tid=refreshBookmarksTID]');

    await expectElementExist(
      '[data-tid=tsBookmarksTID' + testFolder + ']',
      false,
    );
  });

  test('TST0907 - Create 2 local bookmarks and delete all bookmarks [electron,_pro]', async () => {
    await clickOn('[data-tid=quickAccessButton]');
    const bookmarks = ['sample.txt', 'sample.jpg'];
    for (let i = 0; i < bookmarks.length; i++) {
      await openContextEntryMenu(
        getGridFileSelector(bookmarks[i]),
        'fileMenuOpenFile',
      );

      // Create
      await clickOn('[data-tid=toggleBookmarkTID]');
      await clickOn('[data-tid=fileContainerCloseOpenedFile]');
      // Refresh bookmarks
      await clickOn('[data-tid=BookmarksMenuTID]');
      await clickOn('[data-tid=refreshBookmarksTID]');

      await expectElementExist(
        '[data-tid=tsBookmarksTID' + dataTidFormat(bookmarks[i]) + ']',
      );
    }

    // Delete All bookmarks
    await clickOn('[data-tid=BookmarksMenuTID]');
    await clickOn('[data-tid=clearBookmarksTID]');
    for (let i = 0; i < bookmarks.length; i++) {
      await expectElementExist(
        '[data-tid=tsBookmarksTID' + dataTidFormat(bookmarks[i]) + ']',
        false,
      );
    }
  });
  test('TST0908 - Add, open and remove recently opened file [web,electron,_pro]', async () => {
    // Add
    const fileTitle = 'sample.jpg';
    const fileTid = dataTidFormat(fileTitle);
    await openContextEntryMenu(
      getGridFileSelector(fileTitle),
      'fileMenuOpenFile',
    );
    await clickOn('[data-tid=fileContainerCloseOpenedFile]');

    // Open
    await clickOn('[data-tid=quickAccessButton]');
    await clickOn('[data-tid=fileOpenHistoryTID]');
    await expectElementExist(
      '[data-tid=tsLastOpenedFilesHistoryTID' + fileTid + ']',
    );
    await clickOn('[data-tid=tsLastOpenedFilesHistoryTID' + fileTid + ']');
    await expectElementExist('[data-tid=OpenedTID' + fileTid + ']');

    //Delete
    await clickOn('[data-tid=fileOpenMenuTID]');
    await clickOn('[data-tid=clearHistoryTID]');
    await expectElementExist(
      '[data-tid=tsLastOpenedFilesHistoryTID' + fileTid + ']',
      false,
    );
  });

  test('TST0909 - Add 2 recently opened files and clear history [electron,_pro]', async () => {
    await clickOn('[data-tid=quickAccessButton]');
    await clickOn('[data-tid=fileOpenHistoryTID]');

    const files = ['sample.txt', 'sample.jpg'];
    for (let i = 0; i < files.length; i++) {
      // Add
      const fileTid = dataTidFormat(files[i]);
      await openContextEntryMenu(
        getGridFileSelector(files[i]),
        'fileMenuOpenFile',
      );
      await clickOn('[data-tid=fileContainerCloseOpenedFile]');
      // Refresh opened files
      await clickOn('[data-tid=fileOpenMenuTID]');
      await clickOn('[data-tid=refreshHistoryTID]');
      await expectElementExist(
        '[data-tid=tsLastOpenedFilesHistoryTID' + fileTid + ']',
      );
    }

    // Delete All bookmarks
    await clickOn('[data-tid=fileOpenMenuTID]');
    await clickOn('[data-tid=clearHistoryTID]');
    for (let i = 0; i < files.length; i++) {
      await expectElementExist(
        '[data-tid=tsLastOpenedFilesHistoryTID' + dataTidFormat(files[i]) + ']',
        false,
      );
    }
  });

  test.skip('TST0910 - Add, open and remove recently edited file [web,electron,_pro]', async () => {
    // Add
    const fileTitle = 'sample.txt';
    const fileTid = dataTidFormat(fileTitle);
    await openContextEntryMenu(
      getGridFileSelector(fileTitle),
      'fileMenuOpenFile',
    );
    await clickOn('[data-tid=fileContainerEditFile]');

    await clickOn('[data-tid=fileContainerCloseOpenedFile]');

    // Open
    await clickOn('[data-tid=quickAccessButton]');
    await clickOn('[data-tid=fileEditHistoryTID]');
    await expectElementExist(
      '[data-tid=tsLastOpenedFilesHistoryTID' + fileTid + ']',
    );
    await clickOn('[data-tid=tsLastOpenedFilesHistoryTID' + fileTid + ']');
    await expectElementExist('[data-tid=OpenedTID' + fileTid + ']');

    //Delete
    await clickOn('[data-tid=fileOpenMenuTID]');
    await clickOn('[data-tid=clearHistoryTID]');
    await expectElementExist(
      '[data-tid=tsLastOpenedFilesHistoryTID' + fileTid + ']',
      false,
    );
  });

  test('TST0912 - Add, open and remove recently opened folder properties [web,electron,_pro]', async () => {
    // Add
    const testFolder = 'empty_folder';
    await rightClickOn('[data-tid=fsEntryName_' + testFolder + ']');
    await clickOn('[data-tid=showProperties]');
    //await clickOn('[data-tid=folderContainerOpenDirMenu]');
    //await clickOn('[data-tid=showProperties]');
    await clickOn('[data-tid=fileContainerCloseOpenedFile]');

    // Open
    await clickOn('[data-tid=quickAccessButton]');
    await clickOn('[data-tid=folderOpenHistoryTID]');
    await expectElementExist(
      '[data-tid=tsLastOpenedFoldersHistoryTID' + testFolder + ']',
      true,
      10000,
    );
    await clickOn('[data-tid=tsLastOpenedFoldersHistoryTID' + testFolder + ']');
    await expectElementExist(
      '[data-tid=OpenedTID' + testFolder + ']',
      true,
      10000,
    );

    //Delete
    await clickOn('[data-tid=FolderOpenMenuTID]');
    await clickOn('[data-tid=clearHistoryTID]');
    await expectElementExist(
      '[data-tid=tsLastOpenedFoldersHistoryTID' + testFolder + ']',
      false,
      10000,
    );
  });

  test('TST0913 - Add 2 recently opened folders and clear history [web,electron,_pro]', async () => {
    const folders = ['new_folder', 'new_folder1'];
    for (let i = 0; i < folders.length; i++) {
      const testFolder = await createNewDirectory(folders[i]);
      // Add
      await rightClickOn('[data-tid=fsEntryName_' + testFolder + ']');
      await clickOn('[data-tid=showProperties]');
      /*await global.client.dblclick('[data-tid=fsEntryName_' + testFolder + ']');
      await clickOn('[data-tid=folderContainerOpenDirMenu]');
      await clickOn('[data-tid=showProperties]');*/
      await clickOn('[data-tid=fileContainerCloseOpenedFile]');
      await clickOn('[data-tid=gridPerspectiveOnBackButton]');
    }

    await clickOn('[data-tid=quickAccessButton]');
    await clickOn('[data-tid=folderOpenHistoryTID]');
    for (let i = 0; i < folders.length; i++) {
      // Open
      const testFolder = folders[i];
      await expectElementExist(
        '[data-tid=tsLastOpenedFoldersHistoryTID' + testFolder + ']',
        true,
        10000,
      );
      await clickOn(
        '[data-tid=tsLastOpenedFoldersHistoryTID' + testFolder + ']',
      );
      await expectElementExist(
        '[data-tid=OpenedTID' + testFolder + ']',
        true,
        10000,
      );
    }

    //Delete
    await clickOn('[data-tid=FolderOpenMenuTID]');
    await clickOn('[data-tid=clearHistoryTID]');
    for (let i = 0; i < folders.length; i++) {
      await expectElementExist(
        '[data-tid=tsLastOpenedFoldersHistoryTID' + folders[i] + ']',
        false,
        10000,
      );
    }
  });

  test.skip('TST0914 - Add search to search history and search [web,electron]', async () => {
    await searchEngine('txt');
    await clickOn('#clearSearchID');

    await expectElementExist(
      '[data-tid=tsLastOpenedFoldersHistoryTID]',
      false,
      10000,
    );
  });
});
