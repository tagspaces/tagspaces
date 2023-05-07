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
  createSavedSearch
} from './search.helpers';
import { init } from './welcome.helpers';
import { openContextEntryMenu } from './test-utils';
import { dataTidFormat } from '../../app/services/test';

test.beforeAll(async () => {
  await startTestingApp('extconfig-with-welcome.js');
  await init();
});

test.afterAll(async () => {
  await stopApp();
  await testDataRefresh();
});

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    await takeScreenshot(testInfo);
  }
  await init();
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

    await searchEngine('h:', {}, false);
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

    await searchEngine('b:', {}, false);
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

  test('TST0639 - Add/Remove sidecar tags in search results [web,electron]', async () => {
    await setSettings('[data-tid=settingsSetPersistTagsInSidecarFile]', true);
    await addRemoveTagsInSearchResults(['sidecar-tag5', 'sidecar-tag6']);
  });

  test('TST0640 - Add/Remove filename tags in search results [web,electron]', async () => {
    await addRemoveTagsInSearchResults(['filename-tag5', 'filename-tag6']);
  });
});
