/*
 * Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved.
 */
import { delay, clearLocalStorage } from './hook';
import {
  createLocation,
  openLocation,
  defaultLocationPath,
  defaultLocationName,
  closeFileProperties,
  openFilesOptionMenu,
  toggleShowDirectoriesClick,
  selectAllFilesClick,
  clearInputValue,
  getFirstFileName,
  renameFirstFile,
  deleteFirstFile,
  createMinioLocation
} from './location.helpers';
import { searchEngine, createNewFile } from './search.spec';
import {
  openFile,
  checkFilenameForExist,
  openContextEntryMenu,
  perspectiveGridTable,
  firstFile,
  openDirectoryMenu,
  firstFileName,
  startMinio,
  stopMinio,
  startWebServer,
  stopWebServer,
  toContainTID
} from './test-utils.spec';

const subFolderName = '/test-perspective-grid';
const subFolderContentExtractionPath =
  defaultLocationPath + '/content-extraction';
const subFolderThumbnailsPath = defaultLocationPath + '/thumbnails';

const testTagName = 'testTag';
const testTestFilename = 'sample';
const newFileName = 'newFileName.txt';
const newTagName = 'newTagName';

describe('TST51 - Perspective Grid', () => {
  beforeEach(async () => {
    await clearLocalStorage();
    //  await delay(500);
    //await closeWelcome();
    //await delay(500);
    if (global.isMinio) {
      await createMinioLocation('', defaultLocationName, true);
    } else {
      await createLocation(defaultLocationPath, defaultLocationName, true);
    }
    // await delay(500);
    await openLocation(defaultLocationName);
    // await delay(500);
    await closeFileProperties();
  });

  test('TST5112 - Show sub folders [show_sub_folders,web,electron]', async () => {
    await openFilesOptionMenu();
    await toggleShowDirectoriesClick();

    // await elem.waitForVisible();
    const folder = await global.client.$(
      '//*[@data-tid="perspectiveGridFileTable"]/div'
    );
    const file = await global.client.$(
      '//*[@data-tid="perspectiveGridFileTable"]/span'
    );

    // await delay(500);
    expect(await file.isDisplayed()).toBe(true);
    expect(await folder.isDisplayed()).toBe(false);

    // show sub folder in the grid perspective
    await openFilesOptionMenu();
    await toggleShowDirectoriesClick();

    expect(await file.isDisplayed()).toBe(true);
    expect(await folder.isDisplayed()).toBe(true);
  });

  /*test('TST5113 - Show sub folders content', async () => {});*/

  test('TST5101 - Open file with click [web,electron]', async () => {
    await searchEngine('txt'); //testTestFilename);
    await delay(500);
    await openFile(perspectiveGridTable, firstFile);
    await checkFilenameForExist(testTestFilename);
  });

  test('TST5102 - Select/deselect all files [web,electron]', async () => {
    await openFilesOptionMenu();
    await toggleShowDirectoriesClick();
    await selectAllFilesClick();

    const file = await global.client.$(
      '//*[@data-tid="perspectiveGridFileTable"]/span/div/div'
    );
    //expect(file).toHaveClass('selectedGridCell', { message: 'Not selected!', })
    const style = await file.getAttribute('class');
    //console.log(style);
    // await delay(90000);
    const containSelectedStyle =
      style.includes('jss131') || style.includes('jss124'); /*Mac Web*/ // || style.includes('jss136')
    expect(containSelectedStyle).toBe(true);
  });

  // This scenario includes "Add tags" && "Remove tags" to be fulfilled
  test('TST5103 - Add tags to the selected files [web,electron]', async () => {
    await searchEngine(testTestFilename);
  });

  test('TST5104 - Remove tags from selected files [web,electron]', async () => {
    await searchEngine(testTestFilename);
  });

  test('TST51** - Return directory back [web,electron]', async () => {
    const file = await global.client.$(
      '//*[@data-tid="perspectiveGridFileTable"]/span'
    );
    expect(await file.isDisplayed()).toBe(true);
    //Open folder
    const folder = await global.client.$(
      '//*[@data-tid="perspectiveGridFileTable"]/div'
    );

    await folder.doubleClick();
    expect(await file.isDisplayed()).toBe(false);
    const backButton = await global.client.$(
      '[data-tid=gridPerspectiveOnBackButton]'
    );
    await backButton.click();
    await delay(500);
    expect(await file.isDisplayed()).toBe(true);

    /*await global.client.click('[data-tid=gridPerspectiveOnBackButton]');
    // check parent directory
    await global.client.waitForVisible(
      '//!*[@data-tid="perspectiveGridFileTable"]/div[1]'
    );
    await global.client.click(
      '//!*[@data-tid="perspectiveGridFileTable"]/div[1]'
    );*/
    // const file = await global.client.getAttribute('//*[@data-tid="perspectiveGridFileTable"]/div[1]/div/p', 'style');
    // await delay(500);
    // expect(file).toContain(selectedFileStyle);
  });

  test('TST51** - Changing the Perspective View [web,electron]', async () => {
    const grid = await global.client.$('[data-tid=perspectiveGridFileTable]');
    let gridStyle = await grid.getAttribute('style');

    expect(gridStyle).toContain(
      'grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));'
    );

    const switchLayoutToRow = await global.client.$(
      '[data-tid=gridPerspectiveSwitchLayoutToRow]'
    );
    await switchLayoutToRow.click();
    // check perspective view
    // await delay(95000);

    gridStyle = await grid.getAttribute('style');
    expect(gridStyle).toContain('grid-template-columns: none;');
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

  // Scenarios for sorting files in grid perspective
  describe('TST5117 - Testing sort files in the grid perspective', () => {
    beforeEach(async () => {
      // await delay(500);
      const sortMenu = await global.client.$(
        '[data-tid=gridPerspectiveSortMenu]'
      );
      await sortMenu.click();
    });

    test('TST10** - Sort by name [web,electron]', async () => {
      const sortByName = await global.client.$(
        '[data-tid=gridPerspectiveSortByName]'
      );
      await sortByName.click();
      // todo check all selected files
    });

    test('TST10** - Sort by size [web,electron]', async () => {
      const sortBySize = await global.client.$(
        '[data-tid=gridPerspectiveSortBySize]'
      );
      await sortBySize.click();
      // todo check parent directory
    });

    test('TST10** - Sort by date [web,electron]', async () => {
      const sortByDate = await global.client.$(
        '[data-tid=gridPerspectiveSortByDate]'
      );
      await sortByDate.click();
      // todo check perspective view
    });

    test('TST10** - Sort by extension [web,electron]', async () => {
      const sortByExt = await global.client.$(
        '[data-tid=gridPerspectiveSortByExt]'
      );
      await sortByExt.click();
      // todo Check if the directories are displayed
    });

    test('TST10** - Sort by tags [web,electron]', async () => {
      const sortByTags = await global.client.$(
        '[data-tid=gridPerspectiveSortByFirstTag]'
      );
      await sortByTags.click();
      // todo Check if the directories are displayed
    });
  });
});

// Test the functionality of the right button on a file on a grid perspective table
// Scenarios for right button on a file
describe('TST50** - Right button on a file', () => {
  beforeEach(async () => {
    await clearLocalStorage();
    if (global.isMinio) {
      await createMinioLocation('', defaultLocationName, true);
    } else {
      await createLocation(defaultLocationPath, defaultLocationName, true);
    }
    // await delay(500);
    await openLocation(defaultLocationName);
    await closeFileProperties();
    // await delay(500);
    //await openDirectoryMenu('createNewFile');
  });

  test('TST5016 - Open file [web,electron]', async () => {
    //await searchEngine('bmp');
    await searchEngine('txt');
    await openContextEntryMenu(
      perspectiveGridTable + firstFile,
      'fileMenuOpenFile'
    );
    // Check if the file is opened
    //await delay(500);
    const webViewer = await global.client.$('#FileViewer');
    //await delay(500);
    expect(await webViewer.isDisplayed()).toBe(true);
    await global.client.switchToFrame(webViewer);
    const iframeBody = await global.client.$('body');
    const bodyTxt = await iframeBody.getText();
    await global.client.switchToParentFrame();
    expect(toContainTID(bodyTxt)).toBe(true);
    //expect(webViewer.selector).toBe('#webViewer');
  });

  test('TST5017 - Rename file [web,electron]', async () => {
    await searchEngine('txt');
    await delay(500);
    const oldName = await getFirstFileName();
    await renameFirstFile(newFileName);
    const fileNameTxt = await getFirstFileName();
    expect(fileNameTxt).toContain(newFileName);
    //rename back to oldName
    await renameFirstFile(oldName);
    const fileName = await getFirstFileName();
    expect(fileName).toContain(oldName);
  });

  test('TST** - Create file [web,electron]', async () => {
    await createNewFile();

    //TODO check if file is created
  });

  test('TST5018 - Delete file [web,electron]', async () => {
    await searchEngine('note'); //select new created file - note[date_created].txt
    await deleteFirstFile();

    //TODO check if file is deleted
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

  test('TST50** - Open containing folder [electron]', async () => {
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

  test('TST10** - Move / Copy file [web,electron]', async () => {
    await searchEngine('txt');
    await delay(500);
    await openContextEntryMenu(
      perspectiveGridTable + firstFile,
      'fileMenuMoveCopyFile'
    );
    //TODO
    const cancelButton = await global.client.$(
      '[data-tid=closeMoveCopyDialog]'
    );
    await cancelButton.click();

    // Check if the directories are displayed
  });
});
