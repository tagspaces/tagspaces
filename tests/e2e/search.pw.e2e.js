import { expect, test } from '@playwright/test';
import {
  clickOn,
  expectElementExist,
  getGridFileName,
  getGridFileSelector,
  setSettings,
  takeScreenshot
} from './general.helpers';
import { startTestingApp, stopApp, testDataRefresh } from './hook';
import {
  closeFileProperties,
  closeLocation,
  createPwLocation,
  createPwMinioLocation,
  defaultLocationName,
  defaultLocationPath,
  getPwLocationTid
} from './location.helpers';
import {
  emptyFolderName,
  searchEngine,
  testFilename,
  addRemoveTagsInSearchResults,
  createSavedSearch,
  addSearchCommand
} from './search.helpers';
import { clearDataStorage, closeWelcomePlaywright } from './welcome.helpers';
import { openContextEntryMenu } from './test-utils';
import { dataTidFormat } from '../../app/services/test';
import { AddRemoveTagsToSelectedFiles } from './perspective-grid.helpers';

test.beforeAll(async () => {
  await startTestingApp('extconfig.js'); //'extconfig-with-welcome.js');
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
  // await closeWelcomePlaywright();
  if (global.isMinio) {
    await createPwMinioLocation('', defaultLocationName, true);
  } else {
    await createPwLocation(defaultLocationPath, defaultLocationName, true);
  }
  await clickOn('[data-tid=location_' + defaultLocationName + ']');
  // If its have opened file
  // await closeFileProperties();
});

test.describe('TST06 - Test Search in file structure:', () => {
  test('TST0601 - Search in current location [web,electron]', async () => {
    await global.client.dblclick(
      '[data-tid=fsEntryName_' + emptyFolderName + ']'
    );

    await searchEngine(testFilename); //, { reindexing: true });
    // expected current filename
    await expectElementExist(getGridFileSelector(testFilename), true, 5000);
    // await checkFilenameForExist(testFilename);
  });

  /*
  test('TST0602 - Search in sub folder: word with "?" in front of the query', async () => {
    await searchEngine('? ' + testFileInSubDirectory);
    // expected current filename
    await checkFilenameForExist(testFileInSubDirectory);
  });

  test('TST0602 - Advanced Search: word with "?" in front of the query', async () => {
    await searchEngine('? ' + testFileInSubDirectory);
    // expected current filename
    await checkFilenameForExist(testFileInSubDirectory);
  });

  test('TST0603 - Advanced Search: word with "!" symbol in front of the query', async () => {
    await searchEngine('! ' + testFileInSubDirectory);
    // expected current filename
    await checkFilenameForExist(testFileInSubDirectory);
  });

  test('TST0604 - Search for tag', async () => {
    await searchEngine('! ' + testFileInSubDirectory, searchTag);
    // expected current filename and tag
    await checkFilenameForExist(testFileInSubDirectory);
  });

  test('TST0604 - Advanced Search: word with "+" symbol in front of the query', async () => {
    await searchEngine('+ ' + testFileInSubDirectory);
  });

  test('TST0604 - Advanced Search: word and tag', async () => {
    await searchEngine('+ ' + testFileInSubDirectory);
    // expected current filename and tag
    await checkFilenameForExist(testFilename, searchTag);
  });

  test('Advanced Search: test with regex query', async () => {
    await searchEngine(regexQuery);
    // expected current filename
    await checkFilenameForExist(testFileInSubDirectory);
  });

  test('Advanced Search: reset button', async () => {
    await searchEngine(testFileInSubDirectory, searchTag, true);
    // expected to reset all search engine
  });*/

  test('TST0621 - Search actions - open location [web,electron]', async () => {
    const lastLocationTID = await getPwLocationTid(-1);
    await closeLocation(lastLocationTID);
    await expectElementExist('[data-tid=WelcomePanelTID]', true);
    await searchEngine('l:', {}, false);
    await clickOn('#textQuery-option-0');
    await clickOn('[data-tid=folderContainerOpenDirMenu]');
    await clickOn('[data-tid=showProperties]');
    await expectElementExist(
      '[data-tid=OpenedTID' + lastLocationTID + ']',
      true
    );
  });

  test('TST0622 - Search actions - filter [web,electron]', async () => {
    await searchEngine('f:txt', {}, false);
    const file = await getGridFileName(0);
    expect(file).toContain('txt');
  });

  test('TST0623 - Search actions - history [web,electron]', async () => {
    const file = 'sample.txt';
    // add file to history
    await openContextEntryMenu(
      '[data-tid="fsEntryName_' + file + '"]',
      'fileMenuOpenFile'
    );
    await closeFileProperties();

    await addSearchCommand('h:', false);
    await clickOn('#textQuery-option-0');
    await expectElementExist(
      '[data-tid=OpenedTID' + dataTidFormat(file) + ']',
      true
    );
  });

  test('TST0624 - Search actions - bookmarks [web,electron]', async () => {
    const bookmarkFileTitle = 'sample.txt';
    await openContextEntryMenu(
      '[data-tid="fsEntryName_' + bookmarkFileTitle + '"]',
      'fileMenuOpenFile'
    );

    // Create
    await clickOn('[data-tid=toggleBookmarkTID]');
    await clickOn('[data-tid=fileContainerCloseOpenedFile]');

    await addSearchCommand('b:', false);
    await clickOn('#textQuery-option-0');
    await expectElementExist(
      '[data-tid=OpenedTID' + dataTidFormat(bookmarkFileTitle) + ']',
      true
    );
  });

  test('TST0625 - Search actions - execute query from stored searches [web,electron]', async () => {
    const storedSearchTitle = 'jpgSearch';
    await createSavedSearch({ title: storedSearchTitle, textQuery: 'jpg' });

    await searchEngine('q:', {}, false);
    await clickOn('#textQuery-option-0');
    // expect to not exist other than jpg files extensions like txt
    await expectElementExist(getGridFileSelector('sample.txt'), false, 5000);
  });

  test('TST0626 - Search actions - execute query from search history [web,electron]', async () => {
    await searchEngine('txt');
    await clickOn('#clearSearchID');

    await searchEngine('s:', {}, false);
    await clickOn('#textQuery-option-0');
    // expect to not exist other than txt files extensions like jpg
    await expectElementExist(getGridFileSelector('sample.jpg'), false, 5000);
  });

  test('TST0627 - Search q. comp - +tag -tag |tag [web,electron]', async () => {
    // Add 3 files tags
    const file1 = 'txt';
    const tags1 = ['test-tag1'];
    const tags2 = ['test-tag1', 'test-tag2'];
    const tags3 = ['test-tag2', 'test-tag3'];
    await clickOn('[data-tid="fsEntryName_sample.' + file1 + '"]');
    await AddRemoveTagsToSelectedFiles(tags1, true);

    const file2 = 'jpg';
    await clickOn('[data-tid="fsEntryName_sample.' + file2 + '"]');
    await AddRemoveTagsToSelectedFiles(tags2, true);

    const file3 = 'gif';
    await clickOn('[data-tid="fsEntryName_sample.' + file3 + '"]');
    await AddRemoveTagsToSelectedFiles(tags3, true);

    function getFileName(fileExt, tags) {
      return (
        '[data-tid="fsEntryName_sample[' +
        tags.join(' ') +
        '].' +
        fileExt +
        '"]'
      );
    }
    // Search for + one tag only: test-tag2
    await addSearchCommand('+' + tags1[0], true);
    await expectElementExist(getFileName(file1, tags1), true, 5000);
    await expectElementExist(getFileName(file2, tags2), true, 5000);
    await expectElementExist(getFileName(file3, tags3), false, 5000);
    // Search for - tag
    await addSearchCommand('-' + tags2[1], true);
    await expectElementExist(getFileName(file1, tags1), true, 5000);
    await expectElementExist(getFileName(file2, tags2), false, 5000);
    await expectElementExist(getFileName(file3, tags3), false, 5000);

    await clickOn('#clearSearchID');

    // Search for | tag - tag
    await addSearchCommand('|' + tags1[0], false);
    await addSearchCommand('|' + tags2[1], true);
    await expectElementExist(getFileName(file1, tags1), true, 5000);
    await expectElementExist(getFileName(file2, tags2), true, 5000);
    await expectElementExist(getFileName(file3, tags3), true, 5000);

    await addSearchCommand('-' + tags3[1], true);
    await expectElementExist(getFileName(file1, tags1), true, 5000);
    await expectElementExist(getFileName(file2, tags2), true, 5000);
    await expectElementExist(getFileName(file3, tags3), false, 5000);
  });

  test('TST0642 - Add/Remove sidecar tags in search results [web,electron]', async () => {
    await setSettings('[data-tid=settingsSetPersistTagsInSidecarFile]', true);
    await addRemoveTagsInSearchResults(['sidecar-tag5', 'sidecar-tag6']);
  });

  test('TST0643 - Add/Remove filename tags in search results [web,electron]', async () => {
    await addRemoveTagsInSearchResults(['filename-tag5', 'filename-tag6']);
  });
});
