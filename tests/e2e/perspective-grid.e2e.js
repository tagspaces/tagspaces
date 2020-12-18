/*
 * Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved.
 */
import {
  createLocation,
  defaultLocationPath,
  defaultLocationName,
  closeFileProperties,
  getFirstFileName,
  renameFirstFile,
  deleteFirstFile,
  createMinioLocation
} from './location.helpers';
import { searchEngine } from './search.spec';
import {
  openContextEntryMenu,
  perspectiveGridTable,
  firstFile,
  toContainTID,
  firstFolder
} from './test-utils.spec';
import {
  addInputKeys,
  clickOn,
  createNewDirectory,
  createTxtFile,
  doubleClickOn,
  expectElementExist,
  expectTagsExist,
  extractTags,
  getGridCellClass,
  getGridFileName,
  removeTagFromTagMenu,
  selectAllFiles,
  selectorFile,
  selectorFolder,
  setInputKeys,
  setSettings,
  showFilesWithTag,
  waitForNotification
} from './general.helpers';
import { AddRemoveTagsToSelectedFiles } from './perspective-grid.helpers';
import { getPropertiesFileName } from './file.properties.helpers';

const subFolderName = '/test-perspective-grid';
const subFolderContentExtractionPath =
  defaultLocationPath + '/content-extraction';
const subFolderThumbnailsPath = defaultLocationPath + '/thumbnails';

const testTagName = 'test-tag'; // TODO fix camelCase tag name
const testTestFilename = 'sample';
const newFileName = 'newFileName.txt';

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

  test('TST5002 - Open file with click [TST5002,web,minio,electron]', async () => {
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
  describe('TST5003 - Testing sort files in the grid perspective [TST5003,web,minio,electron]', () => {
    beforeEach(async () => {
      await clickOn('[data-tid=gridPerspectiveSortMenu]');
      await global.client.pause(500);
    });

    test('TST10** - Sort by name [web,minio,electron]', async () => {
      await clickOn('[data-tid=gridPerspectiveSortByName]');
      await global.client.pause(500); // TODO
      const firstFileName = await getGridFileName(0);
      expect(firstFileName).toBe('sample_exif.jpg');
    });

    /**
     * TODO web https://trello.com/c/b2isDaUc/533-switch-asc-desc-while-sort-by-options
     */
    test('TST10** - Sort by size [minio,electron]', async () => {
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
      await setSettings('[data-tid=settingsSetUseTrashCan]');
      await global.client.pause(500);
      await deleteFirstFile();
      // firstFileName = await getGridFileName(0);
      // expect(firstFileName).not.toBe('note.txt'); TODO its have note.txt from another tests
    });

    /**
     * TODO web https://trello.com/c/b2isDaUc/533-switch-asc-desc-while-sort-by-options
     */
    test('TST10** - Sort by extension [minio,electron]', async () => {
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

  test('TST5004 - Select/deselect all files [TST5004,web,minio,electron]', async () => {
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
  test('TST5005 - Add tags to the selected files [TST5005,electron]', async () => {
    const classNotSelected = await getGridCellClass(0);
    const classSelected = await selectAllFiles(classNotSelected);
    expect(classNotSelected).not.toBe(classSelected);

    /*await openContextEntryMenu( TODO Right button deselect files
        perspectiveGridTable + firstFile,
        'fileMenuAddRemoveTags'
    );*/

    const tags = ['test-tag1', 'test-tag2'];
    await AddRemoveTagsToSelectedFiles(tags);
    // Select all file and check if tag exist
    const filesList = await global.client.$$(perspectiveGridTable + firstFile);
    for (let i = 0; i < filesList.length; i++) {
      await expectTagsExist(filesList[i], tags, true);
    }
    /*await clickOn('[data-tid=gridPerspectiveAddRemoveTags]');

    await addInputKeys('AddRemoveTagsSelectTID', testTagName);
    await global.client.keys('Enter');
    await global.client.pause(500);
    await clickOn('[data-tid=addTagsMultipleEntries]');
    // await global.client.pause(500);
    await waitForNotification();
    const filesList = await global.client.$$(perspectiveGridTable + firstFile);
    for (let i = 0; i < filesList.length; i++) {
      const tags = await extractTags(filesList[i]);
      expect(tags.includes(testTagName)).toBe(true);
    }*/
  });

  test('TST5006 - Remove tags from selected files [TST5006, electron]', async () => {
    const classNotSelected = await getGridCellClass(0);
    const classSelected = await selectAllFiles(classNotSelected);
    expect(classNotSelected).not.toBe(classSelected);

    const tags = ['test-tag1', 'test-tag2'];
    await AddRemoveTagsToSelectedFiles(tags, false);

    // Select all file and check if tag exist
    const filesList = await global.client.$$(perspectiveGridTable + firstFile);
    for (let i = 0; i < filesList.length; i++) {
      await expectTagsExist(filesList[i], tags, false);
    }
    /*await clickOn('[data-tid=gridPerspectiveAddRemoveTags]');

    await addInputKeys('AddRemoveTagsSelectTID', testTagName);
    await global.client.keys('Enter');
    await global.client.pause(500);
    await clickOn('[data-tid=removeTagsMultipleEntries]');
    // await global.client.pause(500);
    await waitForNotification();
    const filesList = await global.client.$$(perspectiveGridTable + firstFile);
    for (let i = 0; i < filesList.length; i++) {
      const tags = await extractTags(filesList[i]);
      expect(tags.includes(testTagName)).toBe(false);
    }*/
  });

  test('TST5007 - Remove all tags from selected files [TST5007, electron]', async () => {
    const classNotSelected = await getGridCellClass(0);
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
    }
  });

  /**
   * TODO copy file on minio failed with path: ./testdata-tmp/file-structure/supported-filestypes/empty_folder
   */
  test('TST5008 - Copy file [TST5008,electron]', async () => {
    await searchEngine('bmp');

    // select file
    await clickOn(perspectiveGridTable + firstFile);
    // open Copy File Dialog
    await clickOn('[data-tid=gridPerspectiveCopySelectedFiles]');
    await addInputKeys(
      'targetPathInput',
      defaultLocationPath + '/empty_folder'
    );
    await clickOn('[data-tid=confirmCopyFiles]');
    await waitForNotification();
    await clickOn('#clearSearchID');
    await global.client.pause(500);
    await doubleClickOn(perspectiveGridTable + firstFolder);
    const firstFileName = await getGridFileName(0);
    expect(firstFileName).toBe('sample.bmp');
    // cleanup
    await deleteFirstFile();
    await expectElementExist(selectorFile, false);
  });

  test('TST5010 - Move file [TST5010,web,minio,electron]', async () => {
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

  test('TST5013 - Delete files from selection (many files) [TST5013,web,minio,electron]', async () => {
    await doubleClickOn(perspectiveGridTable + firstFolder);
    await createTxtFile();
    await searchEngine('note');
    await expectElementExist(selectorFile, true);

    const classNotSelected = await getGridCellClass(0);
    const classSelected = await selectAllFiles(classNotSelected);
    expect(classNotSelected).not.toBe(classSelected);

    await clickOn('[data-tid=gridPerspectiveDeleteMultipleFiles]');
    await clickOn('[data-tid=confirmDeleteFileDialog]');
    await waitForNotification();
    await expectElementExist(selectorFile, false);
  });
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

// Test the functionality of the right button on a file on a grid perspective table
// Scenarios for right button on a file
describe('TST50** - Right button on a file', () => {
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
  });

  test('TST5016 - Open file [TST5016,web,minio,electron]', async () => {
    //await searchEngine('bmp');
    await searchEngine('txt');
    await openContextEntryMenu(
      perspectiveGridTable + firstFile,
      'fileMenuOpenFile'
    );
    // Check if the file is opened
    // await delay(1500);
    const webViewer = await expectElementExist('#FileViewer');
    // const webViewer = await global.client.$('#FileViewer');
    // await webViewer.waitForDisplayed();
    //await delay(5000);
    // expect(await webViewer.isDisplayed()).toBe(true);
    await global.client.switchToFrame(webViewer);
    await global.client.pause(500);
    const iframeBody = await global.client.$('body');
    await iframeBody.waitForDisplayed();
    const bodyTxt = await iframeBody.getText();

    await global.client.switchToParentFrame();
    expect(toContainTID(bodyTxt)).toBe(true);
  });

  test('TST5017 - Rename file [web,web,minio,electron]', async () => {
    await searchEngine('txt');
    const oldName = await getFirstFileName();
    await renameFirstFile(newFileName);
    const fileNameTxt = await getFirstFileName();
    expect(fileNameTxt).toContain(newFileName);
    //rename back to oldName
    await renameFirstFile(oldName);
    const fileName = await getFirstFileName();
    expect(fileName).toContain(oldName);
  });

  test('TST5018 - Delete file [TST5018,web,minio,electron]', async () => {
    await createTxtFile();
    await searchEngine('note'); //select new created file - note[date_created].txt
    /*let firstFileName = await getGridFileName(0);
    expect(firstFileName).toBe('note.txt');*/

    await expectElementExist(selectorFile, true);

    await deleteFirstFile();
    await expectElementExist(selectorFile, false);
    /*firstFileName = await getGridFileName(0);
    expect(firstFileName).toBe(undefined);*/
  });

  test('TST5019 - Rename tag in file [TST5019,web,minio,electron]', async () => {
    await searchEngine('desktop');
    // Select file
    await clickOn(perspectiveGridTable + firstFile);
    await AddRemoveTagsToSelectedFiles([testTagName], true);
    let file = await global.client.$(perspectiveGridTable + firstFile);
    await expectTagsExist(file, [testTagName], true);

    /*await AddRemoveTagsToFile(perspectiveGridTable + firstFile, [testTagName], {
      add: true
    });*/
    await clickOn('[data-tid=tagMoreButton_' + testTagName + ']');
    await global.client.pause(500);
    await clickOn('[data-tid=editTagDialogMenu]');
    await setInputKeys('editTagEntryDialog_input', testTagName + '-edited');
    await clickOn('[data-tid=confirmEditTagEntryDialog]');
    await waitForNotification();

    file = await global.client.$(perspectiveGridTable + firstFile);
    await expectTagsExist(file, [testTagName + '-edited'], true);

    //cleanup
    await clickOn(perspectiveGridTable + firstFile);
    await AddRemoveTagsToSelectedFiles([testTagName + '-edited'], false);
    file = await global.client.$(perspectiveGridTable + firstFile);
    await expectTagsExist(file, [testTagName + '-edited'], false);
  });

  test('TST5023 - Remove tag from file (tag menu) [TST5023,web,minio,electron]', async () => {
    await searchEngine('desktop');
    // select file
    await clickOn(perspectiveGridTable + firstFile);
    await AddRemoveTagsToSelectedFiles([testTagName], true);
    let file = await global.client.$(perspectiveGridTable + firstFile);
    await expectTagsExist(file, [testTagName], true);

    await removeTagFromTagMenu(testTagName);
    await global.client.pause(500);

    file = await global.client.$(perspectiveGridTable + firstFile);
    await expectTagsExist(file, [testTagName], false);
  });

  test('TST5024 - Show files with a given tag (tag menu) [TST5024,web,minio,electron]', async () => {
    const classNotSelected = await getGridCellClass(0);
    const classSelected = await selectAllFiles(classNotSelected);
    expect(classNotSelected).not.toBe(classSelected);

    await AddRemoveTagsToSelectedFiles([testTagName], true);
    await showFilesWithTag(testTagName);

    const filesList = await global.client.$$(perspectiveGridTable + firstFile);
    for (let i = 0; i < filesList.length; i++) {
      await expectTagsExist(filesList[i], [testTagName], true);
    }

    // cleanup
    await selectAllFiles(classNotSelected);
    expect(classNotSelected).not.toBe(classSelected);
    await AddRemoveTagsToSelectedFiles([testTagName], false);
  });

  /**
   * TODO web sometimes: stale element reference: stale element reference: element is not attached to the page document
   * TODO minio sometimes: stale element reference: stale element reference: element is not attached to the page document
   */
  test('TST5025 - Add / Remove tags (file menu) [TST5025,electron]', async () => {
    await searchEngine('desktop');
    const tags = [testTagName, testTagName + '2'];
    // select file
    await clickOn(perspectiveGridTable + firstFile);
    await AddRemoveTagsToSelectedFiles(tags, true);

    const file = await global.client.$(perspectiveGridTable + firstFile);
    await expectTagsExist(file, tags, true);

    //cleanup
    await clickOn(perspectiveGridTable + firstFile);
    await AddRemoveTagsToSelectedFiles(tags, false);
  });

  test('TST5026 - Open file natively [electron]', async () => {
    if (!global.isMinio) {
      // Open file natively option is missing for Minio Location
      await searchEngine('txt');
      await openContextEntryMenu(
        perspectiveGridTable + firstFile,
        'fileMenuOpenFileNatively'
      );
    }
    // check parent directory
  });

  test('TST5027 - Open containing folder [electron,web]', async () => {
    if (!global.isMinio) {
      // Show in File Manager option is missing for Minio Location
      await searchEngine('txt');
      await openContextEntryMenu(
        perspectiveGridTable + firstFile,
        'fileMenuOpenContainingFolder'
      );
    }
    // check parent directory
  });

  /*test('TST50** - Add / Remove tags', async () => {
    await searchEngine('txt');
    await openContextEntryMenu(
      perspectiveGridTable + firstFile,
      'fileMenuAddRemoveTags'
    );
    //TODO cannot find cancelTagsMultipleEntries ??
    await delay(500);
    const cancelButton = await global.client
        .$('[data-tid=cancelTagsMultipleEntries]');
    await cancelButton.waitForDisplayed();
    await cancelButton.click();
  });*/

  /**
   * TODO github minio (expected selector to exist=false after 5s)
   */
  test('TST5028 - Move / Copy file (file menu) [TST5028,electron]', async () => {
    // Move file in child folder
    await searchEngine('eml');
    await openContextEntryMenu(
      perspectiveGridTable + firstFile,
      'fileMenuMoveCopyFile'
    );
    await addInputKeys(
      'targetPathInput',
      defaultLocationPath + '/empty_folder'
    );

    await clickOn('[data-tid=confirmMoveFiles]');
    await waitForNotification();
    await clickOn('#clearSearchID');
    await global.client.pause(500);
    await doubleClickOn(perspectiveGridTable + firstFolder);
    await searchEngine('eml', { reindexing: true }); // TODO temp fix: https://trello.com/c/ZfcGGvOM/527-moved-files-is-not-indexing-not-found-in-search
    let firstFileName = await getGridFileName(0);
    expect(firstFileName).toBe('sample.eml');

    //Copy file in parent directory
    await openContextEntryMenu(
      perspectiveGridTable + firstFile,
      'fileMenuMoveCopyFile'
    );
    await addInputKeys('targetPathInput', defaultLocationPath);
    await clickOn('[data-tid=confirmCopyFiles]');
    await waitForNotification();
    await clickOn('#clearSearchID');
    await clickOn('[data-tid=gridPerspectiveOnBackButton]');
    await global.client.pause(500);
    await searchEngine('eml');
    firstFileName = await getGridFileName(0);
    expect(firstFileName).toBe('sample.eml');

    // cleanup
    await deleteFirstFile();
    await expectElementExist(selectorFile, false);
  });

  test('TST5033 - Open directory (directory menu) [TST5033,web,minio,electron]', async () => {
    // open empty_folder
    await openContextEntryMenu(
      perspectiveGridTable + firstFolder,
      'openDirectory'
    );
    const firstFileName = await getGridFileName(0);
    expect(firstFileName).toBe(undefined); //'sample.eml');
  });

  /**
   * minio not support rename folder
   */
  test('TST5034 - Rename directory (directory menu) [TST5034,electron]', async () => {
    const newDirName = 'new_dir_name';
    await openContextEntryMenu(
      perspectiveGridTable + firstFolder,
      'renameDirectory'
    );
    const oldDirName = await setInputKeys(
      'renameDirectoryDialogInput',
      newDirName
    );
    await clickOn('[data-tid=confirmRenameDirectory]');
    await waitForNotification();

    //turn dir name back
    await openContextEntryMenu(
      perspectiveGridTable + firstFolder,
      'renameDirectory'
    );
    const renamedDir = await setInputKeys(
      'renameDirectoryDialogInput',
      oldDirName
    );
    await clickOn('[data-tid=confirmRenameDirectory]');
    await waitForNotification();
    expect(renamedDir).toBe(newDirName);
  });

  /**
   * delete dir is not supported on minio
   */
  test('TST5035 - Delete directory (directory menu) [TST5035,electron]', async () => {
    await setSettings('[data-tid=settingsSetUseTrashCan]');
    await global.client.pause(500);
    const testFolder = await createNewDirectory('aaa');

    await openContextEntryMenu(
      perspectiveGridTable + firstFolder,
      'deleteDirectory'
    );
    await clickOn('[data-tid=confirmDeleteDirectoryDialog]');

    await expectElementExist(
      '[data-tid=fsEntryName_' + testFolder + ']',
      false
    );
  });

  test('TST5036 - Open directory properties (directory menu) [TST5036,web,minio,electron]', async () => {
    await openContextEntryMenu(
      perspectiveGridTable + firstFolder,
      'showProperties'
    );
    await expectElementExist('[data-tid=fileNameProperties]', true);
  });

  test('TST5037 - Show sub folders [TST5037,web,minio,electron]', async () => {
    //open Option menu
    await clickOn('[data-tid=gridPerspectiveOptionsMenu]');
    //click on hide directories
    await clickOn('[data-tid=gridPerspectiveToggleShowDirectories]');

    //file
    await expectElementExist(selectorFile, true);
    //folder
    await expectElementExist(selectorFolder, false);

    if (global.isWeb) {
      await global.client.pause(500);
    }
    // show sub folder in the grid perspective
    await clickOn('[data-tid=gridPerspectiveOptionsMenu]');
    await clickOn('[data-tid=gridPerspectiveToggleShowDirectories]');

    //file
    await expectElementExist(selectorFile, true);
    //folder
    await expectElementExist(selectorFolder, true);
  });

  test('TST5038 - Return directory back [TST5038,web,minio,electron]', async () => {
    await expectElementExist(selectorFolder);

    //Open folder
    await doubleClickOn(selectorFolder);

    await expectElementExist(selectorFolder, false);
    await clickOn('[data-tid=gridPerspectiveOnBackButton]');
    await expectElementExist(selectorFolder);
  });

  test('TST5039 - Changing the Perspective View [TST5039,web,minio,electron]', async () => {
    const grid = await global.client.$('[data-tid=perspectiveGridFileTable]');
    let gridStyle = await grid.getAttribute('style');

    expect(gridStyle).toContain(
      'grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));'
    );

    await clickOn('[data-tid=gridPerspectiveSwitchLayoutToRow]');
    // check perspective view

    gridStyle = await grid.getAttribute('style');
    expect(gridStyle).toContain('grid-template-columns: none;');
  });

  test('TST5040 - Create file [TST5040,web,minio,electron]', async () => {
    await createTxtFile();
    await searchEngine('note');
    await expectElementExist(selectorFile, true);

    //cleanup
    await deleteFirstFile();
    const firstFileName = await getGridFileName(0);
    expect(firstFileName).toBe(undefined);
  });
});
