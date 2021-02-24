/*
 * Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved.
 */
import {
  createLocation,
  defaultLocationPath,
  defaultLocationName,
  closeFileProperties,
  deleteFirstFile,
  createMinioLocation,
  getFirstFileName
} from './location.helpers';
import { searchEngine } from './search.helpers';
import { perspectiveGridTable, firstFile, firstFolder } from './test-utils';
import {
  addInputKeys,
  clickOn,
  createTxtFile,
  doubleClickOn,
  expectElementExist,
  expectExist,
  expectTagsExistBySelector,
  extractTags,
  getGridCellClass,
  getGridFileName,
  selectAllFiles,
  selectFilesByID,
  selectorFile,
  selectorFolder,
  selectRowFiles,
  setSettings,
  waitForNotification
} from './general.helpers';
import { AddRemoveTagsToSelectedFiles } from './perspective-grid.helpers';
import { getPropertiesFileName } from './file.properties.helpers';

/*const subFolderName = '/test-perspective-grid';
const subFolderContentExtractionPath =
  defaultLocationPath + '/content-extraction';
const subFolderThumbnailsPath = defaultLocationPath + '/thumbnails';
const testTestFilename = 'sample';
*/

describe('TST50 - Perspective Grid', () => {
  beforeEach(async () => {
    if (global.isMinio) {
      await createMinioLocation('', defaultLocationName, true);
    } else {
      await createLocation(defaultLocationPath, defaultLocationName, true);
    }
    // openLocation
    await clickOn('[data-tid=location_' + defaultLocationName + ']');
    // If its have opened file
    await closeFileProperties();
    if (global.isWeb) {
      await global.client.pause(500);
    }
  });

  test('TST5002 - Open file with click [web,minio,electron]', async () => {
    await searchEngine('txt'); //testTestFilename);
    const firstFileName = await getGridFileName(0);
    await clickOn(perspectiveGridTable + firstFile);
    //Toggle Properties
    await clickOn('[data-tid=fileContainerToggleProperties]');
    const propsFileName = await getPropertiesFileName();
    expect(firstFileName).toBe(propsFileName);
    // await checkFilenameForExist(testTestFilename);
  });

  // Scenarios for sorting files in grid perspective
  describe('TST5003 - Testing sort files in the grid perspective [web,minio,electron]', () => {
    beforeEach(async () => {
      await clickOn('[data-tid=gridPerspectiveSortMenu]');
      await global.client.pause(500);
    });

    test('TST10** - Sort by name [web,minio,electron]', async () => {
      await clickOn('[data-tid=gridPerspectiveSortByName]');
      await global.client.pause(500); // TODO
      let firstFileName = await getGridFileName(0);
      expect(firstFileName).toBe('sample.bmp');
      // ASC
      await clickOn('[data-tid=gridPerspectiveSortMenu]');
      await global.client.pause(500);
      await clickOn('[data-tid=gridPerspectiveSortByName]');
      await global.client.pause(500); // TODO
      firstFileName = await getGridFileName(0);
      expect(firstFileName).toBe('sample_exif.jpg');
    });

    test('TST10** - Sort by size [web,minio,electron]', async () => {
      await clickOn('[data-tid=gridPerspectiveSortBySize]');
      await global.client.pause(500); // TODO
      const firstFileName = await getGridFileName(0);
      expect(firstFileName).toBe('sample.ogv');
    });

    test('TST10** - Sort by date [web,minio,electron]', async () => {
      await clickOn('[data-tid=gridPerspectiveSortByDate]');
      await global.client.pause(500); //TODO

      await createTxtFile();
      // await global.client.pause(500);
      let firstFileName = await getGridFileName(0);

      expect(firstFileName).toBe('note.txt');

      //cleanup
      // await setSettings('[data-tid=settingsSetUseTrashCan]');
      // await global.client.pause(500);
      await deleteFirstFile();
      // firstFileName = await getGridFileName(0);
      // expect(firstFileName).not.toBe('note.txt'); TODO its have note.txt from another tests
    });

    test('TST10** - Sort by extension [web,minio,electron]', async () => {
      await clickOn('[data-tid=gridPerspectiveSortByExt]');
      await global.client.pause(1000); // TODO
      const firstFileName = await getGridFileName(0);
      expect(firstFileName).toBe('sample.zip');
    });

    test('TST10** - Sort by tags [web,minio,electron]', async () => {
      await clickOn('[data-tid=gridPerspectiveSortByFirstTag]');
      await global.client.pause(1000); // TODO
      const firstFileName = await getGridFileName(0);
      expect(firstFileName).toBe('sample_exif.jpg');
    });
  });

  test('TST5004 - Select-deselect all files [web,minio,electron]', async () => {
    const classNotSelected = await getGridCellClass(0);
    const classSelected = await selectAllFiles(classNotSelected);

    expect(classNotSelected).not.toBe(classSelected);

    const filesList = await global.client.$$(perspectiveGridTable + firstFile);
    for (let i = 0; i < filesList.length; i++) {
      let file = await filesList[i].$('div');
      file = await file.$('div');
      const style = await file.getAttribute('class');
      expect(style).toBe(classSelected);
    }

    /*const file = await global.client.$(perspectiveGridTable + '/span/div/div');
    //expect(file).toHaveClass('selectedGridCell', { message: 'Not selected!', })
    const style = await file.getAttribute('class');
    //console.log(style);
    // await delay(90000);
    const containSelectedStyle =
      style.includes('jss131') ||
      style.includes('jss124') ||
      style.includes('jss111'); /!*Mac Web*!/ // || style.includes('jss136') */
  });

  // This scenario includes "Add tags" && "Remove tags" to be fulfilled
  test('TST5005 - Add tags to the selected files [web,minio,electron]', async () => {
    /*const classNotSelected = await getGridCellClass(0);
    const classSelected = await selectAllFiles(classNotSelected);
    expect(classNotSelected).not.toBe(classSelected);*/

    //open Option menu
    await clickOn('[data-tid=gridPerspectiveOptionsMenu]');
    //click on hide directories
    await clickOn('[data-tid=gridPerspectiveToggleShowDirectories]');

    const selectedIds = await selectRowFiles([0, 1, 2]);

    const tags = ['test-tag1', 'test-tag2'];
    await AddRemoveTagsToSelectedFiles(tags);

    for (let i = 0; i < selectedIds.length; i++) {
      // const selectBox = await global.client.$('[data-tid=perspectiveGridFileTable]');
      await expectTagsExistBySelector(
        '[data-entry-id="' + selectedIds[i] + '"]',
        tags,
        true
      );
    }

    // Select all file and check if tag exist
    /*const filesList = await global.client.$$(perspectiveGridTable + firstFile);
    for (let i = 0; i < filesList.length; i++) {
      await expectTagsExist(filesList[i], tags, true);
    }*/
  });

  /**
   * TODO merge with TST5005
   */
  test('TST5006 - Remove tags from selected files [web,minio,electron]', async () => {
    /*const classNotSelected = await getGridCellClass(0);
    const classSelected = await selectAllFiles(classNotSelected);
    expect(classNotSelected).not.toBe(classSelected);*/

    //open Option menu
    await clickOn('[data-tid=gridPerspectiveOptionsMenu]');
    //click on hide directories
    await clickOn('[data-tid=gridPerspectiveToggleShowDirectories]');

    const selectedIds = await selectRowFiles([0, 1, 2]);

    const tags = ['test-tag1', 'test-tag2'];
    await AddRemoveTagsToSelectedFiles(tags, false);

    for (let i = 0; i < selectedIds.length; i++) {
      await expectTagsExistBySelector(
        '[data-entry-id="' + selectedIds[i] + '"]',
        tags,
        false
      );
    }
    // Select all file and check if tag exist
    /*const filesList = await global.client.$$(perspectiveGridTable + firstFile);
    for (let i = 0; i < filesList.length; i++) {
      await expectTagsExist(filesList[i], tags, false);
    }*/
  });

  test('TST5007 - Remove all tags from selected files [web,minio,electron]', async () => {
    //open Option menu
    await clickOn('[data-tid=gridPerspectiveOptionsMenu]');
    //click on hide directories
    await clickOn('[data-tid=gridPerspectiveToggleShowDirectories]');

    const selectedIds = await selectRowFiles([0, 1, 2]);
    const tags = ['test-tag1', 'test-tag2', 'test-tag3'];
    await AddRemoveTagsToSelectedFiles(tags, true);

    await selectFilesByID(selectedIds);

    await clickOn('[data-tid=gridPerspectiveAddRemoveTags]');
    await clickOn('[data-tid=cleanTagsMultipleEntries]');
    await global.client.pause(500);

    for (let i = 0; i < selectedIds.length; i++) {
      const gridElement = await global.client.$(
        '[data-entry-id="' + selectedIds[i] + '"]'
      );
      await expectExist(gridElement);
      const tags = await extractTags(gridElement);
      expect(tags.length).toBe(0);
    }

    /*const classNotSelected = await getGridCellClass(0);
    const classSelected = await selectAllFiles(classNotSelected);
    expect(classNotSelected).not.toBe(classSelected);

    await clickOn('[data-tid=gridPerspectiveAddRemoveTags]');

    await clickOn('[data-tid=cleanTagsMultipleEntries]');
    // await global.client.pause(500);
    await waitForNotification();
    const filesList = await global.client.$$(perspectiveGridTable + firstFile);
    for (let i = 0; i < filesList.length; i++) {
      const tags = await extractTags(filesList[i]);
      expect(tags.length).toBe(0);
    }*/
  });

  /**
   * TODO copy file on minio failed with path: ./testdata-tmp/file-structure/supported-filestypes/empty_folder
   * web cannot find bmp file
   */
  test('TST5008 - Copy file [electron]', async () => {
    const fileName = await getFirstFileName();

    // select file
    await clickOn(selectorFile);
    // open Copy File Dialog
    await clickOn('[data-tid=gridPerspectiveCopySelectedFiles]');
    await addInputKeys(
      'targetPathInput',
      defaultLocationPath + '/empty_folder'
    );
    await clickOn('[data-tid=confirmCopyFiles]');
    await waitForNotification();

    await doubleClickOn(selectorFolder);
    const firstFileName = await getGridFileName(0);
    expect(firstFileName).toBe(fileName);
    // cleanup
    await deleteFirstFile();
    await expectElementExist(selectorFile, false);
  });

  it.skip('TST5009 - Copy file on different partition [Electron, manual]', async () => {});

  /**
   * TODO reindexing don't work in web
   */
  test('TST5010 - Move file [minio,electron]', async () => {
    await searchEngine('epub');

    // select file
    await clickOn(perspectiveGridTable + firstFile);
    // open Copy File Dialog
    await clickOn('[data-tid=gridPerspectiveCopySelectedFiles]');
    await addInputKeys(
      'targetPathInput',
      defaultLocationPath + '/empty_folder'
    );
    await clickOn('[data-tid=confirmMoveFiles]');
    await waitForNotification();
    await clickOn('#clearSearchID');
    await global.client.pause(500);
    await doubleClickOn(perspectiveGridTable + firstFolder);
    await searchEngine('epub', { reindexing: true }); // TODO temp fix: https://trello.com/c/ZfcGGvOM/527-moved-files-is-not-indexing-not-found-in-search
    const firstFileName = await getGridFileName(0);
    expect(firstFileName).toBe('sample.epub');
    // cleanup
    await deleteFirstFile();
    await expectElementExist(selectorFile, false);
  });

  it.skip('TST5011 - Move file drag&drop in location navigator [Electron, manual]', async () => {});

  it.skip('TST5012 - Move file different partition [Electron, manual]', async () => {});

  test('TST5013 - Delete files from selection (many files) [web,minio,electron]', async () => {
    //open Option menu
    await clickOn('[data-tid=gridPerspectiveOptionsMenu]');
    //click on hide directories
    await clickOn('[data-tid=gridPerspectiveToggleShowDirectories]');

    const selectedIds = await selectRowFiles([0, 1, 2]);

    await clickOn('[data-tid=gridPerspectiveDeleteMultipleFiles]');
    await clickOn('[data-tid=confirmDeleteFileDialog]');
    await waitForNotification();

    for (let i = 0; i < selectedIds.length; i++) {
      await expectElementExist(
        '[data-entry-id="' + selectedIds[i] + '"]',
        false,
        1000
      );
    }

    /*await doubleClickOn(selectorFolder);
    await createTxtFile();
    await searchEngine('note');
    await expectElementExist(selectorFile, true);

    const classNotSelected = await getGridCellClass(0);
    await clickOn(selectorFile);
    const classSelected = await waitUntilClassChanged(
      selectorFile + '/div/div',
      classNotSelected
    );
    expect(classNotSelected).not.toBe(classSelected);

    await clickOn('[data-tid=gridPerspectiveDeleteMultipleFiles]');
    await clickOn('[data-tid=confirmDeleteFileDialog]');
    await waitForNotification();
    await expectElementExist(selectorFile, false);*/
  });

  it.skip('TST5015 - Tag file drag&drop in perspective [Electron, manual]', async () => {});

  /*test('TST51** - Show/Hide directories in perspective view', async () => { //TODO
    await global.client.waitForVisible(
      '[data-tid=gridPerspectiveToggleShowDirectories]'
    );
    await global.client.click(
      '[data-tid=gridPerspectiveToggleShowDirectories]'
    );
    // Check if the directories are displayed
  });*/
});
