import { dataTidFormat } from '../../src/renderer/services/test';
import { AddRemovePropertiesTags } from './file.properties.helpers';
import { expect, test } from './fixtures';
import {
  clickOn,
  expectElementExist,
  expectElementSelected,
  getGridFileName,
  getGridFileSelector,
  openFile,
  selectorFile,
  setSettings,
} from './general.helpers';
import {
  createFileS3,
  createLocalFile,
  startTestingApp,
  stopApp,
} from './hook';
import {
  closeFileProperties,
  closeLocation,
  createPwLocation,
  createPwMinioLocation,
  createS3Location,
  defaultLocationName,
} from './location.helpers';
import { AddRemoveTagsToSelectedFiles } from './perspective-grid.helpers';
import {
  addRemoveTagsInSearchResults,
  addSearchCommand,
  createSavedSearch,
  emptyFolderName,
  searchEngine,
  testFilename,
} from './search.helpers';
import { openContextEntryMenu } from './test-utils';
import { clearDataStorage } from './welcome.helpers';

test.beforeAll(
  async ({ isWeb, isS3, webServerPort, testDataDir }, testInfo) => {
    await startTestingApp(
      { isWeb, isS3, webServerPort, testInfo },
      'extconfig-two-locations.js',
    );
    // await startTestingApp('extconfig-without-locations.js');
    // await clearDataStorage();
    if (isS3) {
      await createFileS3();
    } else {
      await createLocalFile(testDataDir);
    }
  },
);

test.afterAll(async () => {
  await stopApp();
});

test.afterEach(async ({ page }, testInfo) => {
  /*if (testInfo.status !== testInfo.expectedStatus) {
    await takeScreenshot(testInfo);
    const localStorage = await global.client.evaluate(() =>
      JSON.stringify(window.localStorage),
    );
    writeFile(
      testInfo.outputPath(testInfo.title + '_localstorage.json'),
      localStorage,
    );
  }*/
  await clearDataStorage();
});

test.beforeEach(async ({ isMinio, isS3, testDataDir }) => {
  // await closeWelcomePlaywright();
  if (isMinio) {
    await createPwMinioLocation('', defaultLocationName, true);
  } else if (isS3) {
    await createS3Location('', defaultLocationName, true);
  } else {
    await createPwLocation(testDataDir, defaultLocationName, true);
  }
  await clickOn('[data-tid=location_' + defaultLocationName + ']');
  await expectElementExist(getGridFileSelector('empty_folder'), true, 8000);
  // If its have opened file
  // await closeFileProperties();
});

test.describe('TST06 - Test Search in file structure:', () => {
  test('TST0601 - Search in current location [web,minio,s3,electron]', async () => {
    await global.client.dblclick(
      '[data-tid=fsEntryName_' + emptyFolderName + ']',
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

  test('TST0609 - Show thumbnails of image files in the search results [web,minio,s3,electron]', async ({
    isWin,
    isWeb,
  }) => {
    if (!isWin || !isWeb) {
      //todo on web windows only test not work
      await global.client.waitForSelector('img[data-tid="imageThumbnailTID"]', {
        visible: true,
      });
      const searchQuery = 'sample_exif.jpg'; //'jpg';
      await addSearchCommand(searchQuery, true);
      await expectElementExist('[data-tid=allFilesCount1]', true, 5000);
      await global.client.waitForSelector('img[data-tid="imageThumbnailTID"]', {
        visible: true,
      });
      const imageLocator = global.client.locator('img[data-tid="imageThumbnailTID"]');
      const imageCount = await imageLocator.count();
      expect(imageCount).toBeGreaterThan(0);
      const images = await imageLocator; //.elements();
      for (let i = 0; i < images.length; i++) {
        await expect(images[i]).toBeVisible();
        /*const src = await images[i].getAttribute('src');
          const fileExists = checkFileExist(src);
          expect(fileExists).toEqual(true, 'The file does not exist:' + src);*/
      }
    }
  });

  test('TST0621 - Search actions - open location [web,minio,s3,electron]', async () => {
    //const firstLocationTID = await getPwLocationTid(0);
    await closeLocation(); //lastLocationTID);
    await expectElementExist('[data-tid=WelcomePanelTID]', true);
    await addSearchCommand('l:', false);
    await clickOn('#textQuery-option-0');
    await expectElementExist('[data-tid=currentDir_empty_folder]', true, 5000);
  });

  test('TST0622 - Search actions - filter [web,minio,s3,electron]', async () => {
    await searchEngine('f:txt', {}, false);
    const file = await getGridFileName(0);
    expect(file).toContain('txt');
  });

  test('TST0623 - Search actions - history [web,minio,s3,electron,_pro]', async () => {
    const file = 'sample.txt';
    // add file to history
    await openContextEntryMenu(getGridFileSelector(file), 'fileMenuOpenFile');
    await closeFileProperties();

    await addSearchCommand('h:', false);
    await clickOn('#textQuery-option-0');
    await expectElementExist(
      '[data-tid=OpenedTID' + dataTidFormat(file) + ']',
      true,
    );
  });

  test('TST0624 - Search actions - bookmarks [web,minio,s3,electron,_pro]', async () => {
    const bookmarkFileTitle = 'sample.txt';
    await openContextEntryMenu(
      getGridFileSelector(bookmarkFileTitle),
      'fileMenuOpenFile',
    );

    // Create
    await clickOn('[data-tid=toggleBookmarkTID]');
    await clickOn('[data-tid=fileContainerCloseOpenedFile]');

    await addSearchCommand('b:', false);
    await clickOn('#textQuery-option-0');
    await expectElementExist(
      '[data-tid=OpenedTID' + dataTidFormat(bookmarkFileTitle) + ']',
      true,
    );
  });

  test('TST0625 - Search actions - execute query from stored searches [web,minio,s3,electron,_pro]', async () => {
    const storedSearchTitle = 'jpgSearch';
    await createSavedSearch({ title: storedSearchTitle, textQuery: 'jpg' });
    await clickOn('#clearSearchID');
    await expectElementExist('#textQuery', false, 5000);

    await searchEngine('q:', {}, false);
    await clickOn('#textQuery-option-0');
    await clickOn('#searchButton');
    // expect to not exist other than jpg files extensions like txt
    await expectElementExist(getGridFileSelector('sample.pdf'), false, 5000);
  });

  test('TST0626 - Search actions - execute query from search history [web,minio,s3,electron,_pro]', async () => {
    await searchEngine('txt');
    await clickOn('#clearSearchID');
    await expectElementExist('#textQuery', false, 5000);

    await searchEngine('s:', {}, false);
    await clickOn('#textQuery-option-0');
    // expect to not exist other than txt files extensions like jpg
    await expectElementExist(getGridFileSelector('sample.jpg'), false, 5000);
  });

  test('TST0627 - Search q. comp - AND tag NOT tag OR tag [web,minio,s3,electron]', async () => {
    // Add 3 files tags
    const file1 = 'txt';
    const tags1 = ['test-tag1'];
    const tags2 = ['test-tag1', 'test-tag2'];
    const tags3 = ['test-tag2', 'test-tag3'];
    await clickOn(getGridFileSelector('sample.' + file1));
    await expectElementExist(
      '[data-tid=OpenedTID' + dataTidFormat('sample.' + file1) + ']',
      true,
      5000,
    );
    await AddRemoveTagsToSelectedFiles('grid', tags1, true);

    await expectElementSelected(
      'sample' + ' ' + tags1.join(' ') + '.' + file1,
      true,
      5000,
    );

    const file2 = 'jpg';
    await clickOn(getGridFileSelector('sample.' + file2));
    await expectElementExist(
      '[data-tid=OpenedTID' + dataTidFormat('sample.' + file2) + ']',
      true,
      5000,
    );
    await AddRemoveTagsToSelectedFiles('grid', tags2, true);

    await expectElementSelected(
      'sample' + ' ' + tags2.join(' ') + '.' + file2,
      true,
    );

    const file3 = 'gif';
    await clickOn(getGridFileSelector('sample.' + file3));
    await expectElementExist(
      '[data-tid=OpenedTID' + dataTidFormat('sample.' + file3) + ']',
      true,
      5000,
    );
    await AddRemoveTagsToSelectedFiles('grid', tags3, true);

    await expectElementSelected(
      'sample' + ' ' + tags3.join(' ') + '.' + file3,
      true,
    );

    function getFileName(fileExt, tags) {
      return getGridFileSelector('sample[' + tags.join(' ') + '].' + fileExt);
    }
    // Search for + one tag only: test-tag2
    await addSearchCommand('+' + tags1[0], true);
    await expectElementExist(getFileName(file1, tags1), true, 5000);
    await expectElementExist(getFileName(file2, tags2), true, 5000);
    await expectElementExist(getFileName(file3, tags3), false, 5000000);
    // Search for - tag
    await addSearchCommand('-' + tags2[1], true);
    await expectElementExist(getFileName(file1, tags1), true, 5000);
    await expectElementExist(getFileName(file2, tags2), false, 5000);
    await expectElementExist(getFileName(file3, tags3), false, 5000);

    await clickOn('#clearSearchID');
    await expectElementExist('#textQuery', false, 5000);

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

  test('TST0629 - Search q. comp - file size [web,minio,s3,electron,_pro]', async () => {
    /*await openFolder('empty_folder');
    await expectElementExist(
      getGridFileSelector('empty_file.html'),
      true,
      8000,
    );*/

    await addSearchCommand('si:', false);
    await clickOn('#textQuery-option-0');
    await global.client.keyboard.press('Enter');
    await global.client.keyboard.press('Enter');
    //await global.client.waitForTimeout(180000);
    await expectElementExist(
      getGridFileSelector('empty_file.html'),
      true,
      8000,
    );
  });

  test('TST0630 - Search q. comp - type [web,minio,s3,electron,_pro]', async () => {
    await addSearchCommand('t:', false);
    // choose image file type
    await clickOn('#textQuery-option-1');
    await global.client.keyboard.press('Enter');
    await global.client.keyboard.press('Enter');
    await expectElementExist(getGridFileSelector('sample.tif'), true, 5000);
    await expectElementExist(getGridFileSelector('sample.csv'), false, 5000);
  });

  test('TST0631 - Search q. comp - last modified [web,minio,s3,electron,_pro]', async () => {
    await addSearchCommand('lm:', false);
    // choose option Today
    await clickOn('#textQuery-option-0');
    await global.client.keyboard.press('Enter');
    await global.client.keyboard.press('Enter');
    // TODO all files are modified today
    await expectElementExist(getGridFileSelector('sample.pdf'), true, 5000);
  });

  test('TST0632 - Search q. comp - accuracy (fuzzy, semi strict, strict) [web,minio,s3,electron]', async ({
    isS3,
    testDataDir,
  }) => {
    if (isS3) {
      await createFileS3('n1ote.txt');
      await createFileS3('note.txt');
    } else {
      await createLocalFile(testDataDir, 'n1ote.txt');
      await createLocalFile(testDataDir, 'note.txt');
    }
    // fuzzy
    await addSearchCommand('a:', false);
    await clickOn('#textQuery-option-0');
    await addSearchCommand('n1te', true);
    await expectElementExist(getGridFileSelector('n1ote.txt'), true, 5000);
    await expectElementExist(getGridFileSelector('note.txt'), true, 5000);
    await clickOn('#clearSearchID');
    await expectElementExist('#textQuery', false, 5000);
    // semi strict
    await addSearchCommand('a:', false);
    await clickOn('#textQuery-option-1');
    await addSearchCommand('note', true);
    await expectElementExist(getGridFileSelector('n1ote.txt'), false, 5000);
    await expectElementExist(getGridFileSelector('note.txt'), true, 5000);
    await clickOn('#clearSearchID');
    await expectElementExist('#textQuery', false, 5000);
    // strict
    await addSearchCommand('a:', false);
    await clickOn('#textQuery-option-1');
    await addSearchCommand('note', true);
    await expectElementExist(getGridFileSelector('n1ote.txt'), false, 5000);
    await expectElementExist(getGridFileSelector('note.txt'), true, 5000);
  });

  test('TST0633 - Search q. comp - scope (location) [web,minio,s3,electron]', async () => {
    await addSearchCommand('sc:', false);
    await clickOn('#textQuery-option-0');
    await addSearchCommand('empty_file.html', true);
    await expectElementExist(
      getGridFileSelector('empty_file.html'),
      true,
      5000,
    );
    await clickOn('#clearSearchID');
    await expectElementExist('#textQuery', false, 5000);

    await global.client.dblclick('[data-tid=fsEntryName_empty_folder]');
    await addSearchCommand('sc:', false);
    await clickOn('#textQuery-option-0');
    await addSearchCommand('sample.html', true);
    await expectElementExist(getGridFileSelector('sample.html'), true, 5000);
  });

  test('TST0634 - Search q. comp - scope (folder) [web,minio,s3,electron]', async () => {
    //await global.client.dblclick('[data-tid=fsEntryName_empty_folder]');
    await openContextEntryMenu(
      getGridFileSelector('empty_folder'),
      'openDirectory',
    );
    await expectElementExist(getGridFileSelector('empty_folder'), false, 8000);
    await addSearchCommand('sc:', false);
    await clickOn('#textQuery-option-1');
    await addSearchCommand('sample.html', true);
    await expectElementExist(selectorFile, false, 5000);
  });

  test('TST0635 - Search q. comp - scope (global) [web,minio,s3,electron]', async () => {
    // await clickOn('[data-tid=location_' + defaultLocationName + ']');
    await addSearchCommand('sc:', false);
    await clickOn('#textQuery-option-2');
    await addSearchCommand('sample.html', true);
    await expectElementExist(getGridFileSelector('sample.html'), true, 5000);
  });

  /**
   * for web fulltext index is not created in tsi.json
   */
  test('TST0636 - Search q. fulltext in content [minio,s3,electron,_pro]', async ({
    isS3,
    testDataDir,
  }) => {
    if (isS3) {
      await createFileS3('fulltext.txt', 'testing fulltext');
    } else {
      await createLocalFile(testDataDir, 'fulltext.txt', 'testing fulltext');
    }

    await addSearchCommand('sc:', false);
    await clickOn('#textQuery-option-2');
    await addSearchCommand('testing fulltext', true);
    await expectElementExist(getGridFileSelector('fulltext.txt'), true, 5000);
  });

  test('TST0637 - Add/Remove sidecar tags in search results [web,minio,s3,electron]', async () => {
    await setSettings('[data-tid=settingsSetPersistTagsInSidecarFile]', true);
    await addRemoveTagsInSearchResults(['sidecar-tag5', 'sidecar-tag6']);
  });

  test('TST0638 - Add/Remove filename tags in search results [web,minio,s3,electron]', async () => {
    await addRemoveTagsInSearchResults(['filename-tag5', 'filename-tag6']);
  });

  test('TST0646 - Open directory from search results [web,minio,s3,electron]', async ({
    isS3,
    testDataDir,
  }) => {
    if (isS3) {
      await createFileS3(
        'text_file.txt',
        'testing open subfolder from search results',
      );
    } else {
      await createLocalFile(
        testDataDir,
        'text_file.txt',
        'testing open subfolder from search results',
      );
    }
    await addSearchCommand('empty_folder', true);
    await expectElementExist(getGridFileSelector('empty_folder'), true, 5000);
    await openContextEntryMenu(
      getGridFileSelector('empty_folder'),
      'openDirectory',
    );
    await expectElementExist(getGridFileSelector('text_file.txt'), true, 5000);
  });

  test('TST0647 - Search by new sidecar tag [web,minio,s3,electron]', async () => {
    await setSettings('[data-tid=settingsSetPersistTagsInSidecarFile]', true);
    const tag = 'test-tag10';
    const fileName = 'sample';
    const fileExt = 'jpg';
    await openFile(fileName + '.' + fileExt, 'showPropertiesTID');
    await AddRemovePropertiesTags([tag], {
      add: true,
      remove: false,
    });
    await addSearchCommand('+' + tag, true);
    //const selector = getGridFileSelector('sample[' + tag + '].' + fileExt);
    //console.log('selector:'+selector)
    await expectElementExist(
      getGridFileSelector(fileName + '.' + fileExt),
      true,
      5000,
    );
  });
});
