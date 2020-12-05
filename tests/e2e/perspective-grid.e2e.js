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
  createMinioLocation,
  getPropertiesFileName,
  getPropertiesTags
} from './location.helpers';
import { searchEngine } from './search.spec';
import {
  openContextEntryMenu,
  perspectiveGridTable,
  firstFile,
  toContainTID
} from './test-utils.spec';
import {
  addInputKeys,
  clickOn,
  createTxtFile,
  disableTrashBin,
  doubleClickOn,
  expectElementExist,
  extractTags,
  getGridCellClass,
  getGridFileName,
  selectAllFiles,
  selectorFile,
  selectorFolder,
  waitForNotification,
  waitUntilClassChanged
} from './general.helpers';

const subFolderName = '/test-perspective-grid';
const subFolderContentExtractionPath =
  defaultLocationPath + '/content-extraction';
const subFolderThumbnailsPath = defaultLocationPath + '/thumbnails';

const testTagName = 'test-tag'; // TODO fix camelCase tag name
const testTestFilename = 'sample';
const newFileName = 'newFileName.txt';

describe('TST50 - Perspective Grid', () => {
  beforeEach(async () => {
    // await clearLocalStorage();
    // await closeWelcome();
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

  /*test('TST5113 - Show sub folders content', async () => {});*/

  test('TST5001 - Arrow keys select next/prev file [TST5001,web,minio,electron]', async () => {
    const firstFileName = await getGridFileName(0);

    // open fileProperties
    await clickOn(perspectiveGridTable + firstFile);
    //Toggle Properties
    await clickOn('[data-tid=fileContainerToggleProperties]');

    const propsFileName = await getPropertiesFileName();
    expect(firstFileName).toBe(propsFileName);

    await clickOn('[data-tid=fileContainerNextFile]');
    const propsNextFileName = await getPropertiesFileName();

    const secondFileName = await getGridFileName(1);
    expect(secondFileName).toBe(propsNextFileName);
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
      await disableTrashBin();
      await global.client.pause(500);
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
      style.includes('jss111'); /!*Mac Web*!/ // || style.includes('jss136') //TODO fix this is not stable*/
  });

  // This scenario includes "Add tags" && "Remove tags" to be fulfilled
  test('TST5005 - Add tags to the selected files [TST5005,web,minio,electron]', async () => {
    const classNotSelected = await getGridCellClass(0);
    const classSelected = await selectAllFiles(classNotSelected);
    expect(classNotSelected).not.toBe(classSelected);

    /*await openContextEntryMenu( TODO Right button deselect files
        perspectiveGridTable + firstFile,
        'fileMenuAddRemoveTags'
    );*/
    await clickOn('[data-tid=gridPerspectiveAddRemoveTags]');

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
    }
  });

  test('TST5006 - Remove tags from selected files [TST5006,web,minio,electron]', async () => {
    const classNotSelected = await getGridCellClass(0);
    const classSelected = await selectAllFiles(classNotSelected);
    expect(classNotSelected).not.toBe(classSelected);

    await clickOn('[data-tid=gridPerspectiveAddRemoveTags]');

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
    }
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
    // await delay(5000);
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

  test('TST5017 - Rename file [web,electron]', async () => {
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

  test('TST5027 - Open containing folder [electron]', async () => {
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

  //TODO fix electron: element not interactable
  test('TST5028 - Move / Copy file [TST5028]', async () => {
    await searchEngine('txt');
    await openContextEntryMenu(
      perspectiveGridTable + firstFile,
      'fileMenuMoveCopyFile'
    );
    //TODO
    await clickOn('[data-tid=closeMoveCopyDialog]');

    // Check if the directories are displayed
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
