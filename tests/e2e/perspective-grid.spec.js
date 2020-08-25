/* Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved. */
import { delay, clearLocalStorage } from './hook';
import {
  createLocation,
  openLocation,
  defaultLocationPath,
  defaultLocationName,
  closeFileProperties
} from './location.helpers';
import { searchEngine } from './search.spec';
import {
  openFile,
  checkFilenameForExist,
  openContextEntryMenu,
  perspectiveGridTable,
  firstFile,
  openDirectoryMenu,
  firstFileName
} from './perspective.spec';
import { closeWelcome } from './welcome.helpers';

const subFolderName = '/test-perspective-grid';
const subFolderContentExtractionPath =
  defaultLocationPath + '/content-extraction';
const subFolderThumbnailsPath = defaultLocationPath + '/thumbnails';

const testTagName = 'testTag';
const testTestFilename = 'sample_exif';
const newFileName = 'newFileName';
const newTagName = 'newTagName';
const selectedFileStyle = 'rgb(29, 209, 159)';

describe('TST51 - Perspective Grid', () => {
  beforeEach(async () => {
    await clearLocalStorage();
    await delay(500);
    //await closeWelcome();
    //await delay(500);
    await createLocation(defaultLocationPath, defaultLocationName, true);
    await delay(500);
    await openLocation(defaultLocationName);
    await delay(500);
    await closeFileProperties();
  });

  it('TST5112 - Show sub folders', async () => {
    const gridPerspectiveOptionsMenu = await global.client.$(
      '[data-tid=gridPerspectiveOptionsMenu]'
    );
    // await gridPerspectiveOptionsMenu.waitForDisplayed();
    await gridPerspectiveOptionsMenu.click();

    // hide sub folder in the grid perspective
    const gridPerspectiveToggleShowDirectories = await global.client.$(
      '[data-tid=gridPerspectiveToggleShowDirectories]'
    );
    await gridPerspectiveToggleShowDirectories.waitForDisplayed();
    // await elem.waitForVisible();
    const folder = await global.client.$(
      '//*[@data-tid="perspectiveGridFileTable"]/div'
    );
    const file = await global.client.$(
      '//*[@data-tid="perspectiveGridFileTable"]/span'
    );
    await gridPerspectiveToggleShowDirectories.click();
    //await delay(500);
    expect(await file.isDisplayed()).toBe(true);
    expect(await folder.isDisplayed()).toBe(false);

    // show sub folder in the grid perspective
    await gridPerspectiveOptionsMenu.waitForDisplayed();
    await gridPerspectiveOptionsMenu.click();

    await gridPerspectiveToggleShowDirectories.waitForDisplayed();
    await gridPerspectiveToggleShowDirectories.click();

    expect(await file.isDisplayed()).toBe(true);
    expect(await folder.isDisplayed()).toBe(true);
  });

  it('TST5113 - Show sub folders content', async () => {});

  it('TST5101 - Open file with click', async () => {
    await searchEngine(testTestFilename);
    await openFile(perspectiveGridTable, firstFile);
    await checkFilenameForExist(testTestFilename);
  });

  it('TST5102 - Select/deselect all files', async () => {
    await global.client.waitForVisible(
      '[data-tid=gridPerspectiveSelectAllFiles]'
    );
    await global.client.click('[data-tid=gridPerspectiveSelectAllFiles]');
    await global.client.waitForVisible(
      '[data-tid=gridPerspectiveToggleShowDirectories]'
    );
    await global.client.click(
      '[data-tid=gridPerspectiveToggleShowDirectories]'
    );
    await delay(500);
    const file = await global.client.getAttribute(
      '//*[@data-tid="perspectiveGridFileTable"]/div[1]',
      'style'
    );
    await delay(500);
    expect(file).toContain(selectedFileStyle);
  });

  // This scenario includes "Add tags" && "Remove tags" to be fulfilled
  it('TST5103 - Add tags to the selected files', async () => {
    await searchEngine(testTestFilename);
  });

  it('TST5104 - Remove tags from selected files', async () => {
    await searchEngine(testTestFilename);
  });

  it('TST51** - Return directory back', async () => {
    await global.client.waitForVisible(
      '[data-tid=gridPerspectiveOnBackButton]'
    );
    await global.client.click('[data-tid=gridPerspectiveOnBackButton]');
    // check parent directory
    await global.client.waitForVisible(
      '//*[@data-tid="perspectiveGridFileTable"]/div[1]'
    );
    await global.client.click(
      '//*[@data-tid="perspectiveGridFileTable"]/div[1]'
    );
    // const file = await global.client.getAttribute('//*[@data-tid="perspectiveGridFileTable"]/div[1]/div/p', 'style');
    // await delay(500);
    // expect(file).toContain(selectedFileStyle);
  });

  it('TST51** - Changing the Perspective View', async () => {
    await global.client.waitForVisible(
      '[data-tid=gridPerspectiveSwitchLayoutToRow]'
    );
    await global.client.click('[data-tid=gridPerspectiveSwitchLayoutToRow]');
    // check perspective view
  });

  it('TST51** - Show/Hide directories in perspective view', async () => {
    await global.client.waitForVisible(
      '[data-tid=gridPerspectiveToggleShowDirectories]'
    );
    await global.client.click(
      '[data-tid=gridPerspectiveToggleShowDirectories]'
    );
    // Check if the directories are displayed
  });

  // Scenarios for sorting files in grid perspective
  describe('TST5117 - Testing sort files in the grid perspective:', () => {
    beforeEach(async () => {
      await delay(500);
      await global.client.waitForVisible('[data-tid=gridPerspectiveSortMenu]');
      await global.client.click('[data-tid=gridPerspectiveSortMenu]');
    });

    it('TST10** - Sort by name', async () => {
      await global.client.waitForVisible(
        '[data-tid=gridPerspectiveSortByName]'
      );
      await global.client.click('[data-tid=gridPerspectiveSortByName]');
      // check all selected files
    });

    it('TST10** - Sort by size', async () => {
      await global.client.waitForVisible(
        '[data-tid=gridPerspectiveSortBySize]'
      );
      await global.client.click('[data-tid=gridPerspectiveSortBySize]');
      // check parent directory
    });

    it('TST10** - Sort by date', async () => {
      await global.client.waitForVisible(
        '[data-tid=gridPerspectiveSortByDate]'
      );
      await global.client.click('[data-tid=gridPerspectiveSortByDate]');
      // check perspective view
    });

    it('TST10** - Sort by extension', async () => {
      await global.client.waitForVisible('[data-tid=gridPerspectiveSortByExt]');
      await global.client.click('[data-tid=gridPerspectiveSortByExt]');
      // Check if the directories are displayed
    });

    it('TST10** - Sort by tags', async () => {
      await global.client.waitForVisible(
        '[data-tid=gridPerspectiveSortByTags]'
      );
      await global.client.click('[data-tid=gridPerspectiveSortByTags]');
      // Check if the directories are displayed
    });
  });
});

// Test the functionality of the right button on a file on a grid perspective table
// Scenarios for right button on a file
describe('TST50** - Right button on a file', () => {
  beforeEach(async () => {
    await clearLocalStorage();
    await createLocation(defaultLocationPath, defaultLocationName, true);
    await delay(500);
    await openLocation(defaultLocationName);
    await delay(500);
    await openDirectoryMenu('createNewFile');
  });

  it('TST5016 - Open file', async () => {
    await searchEngine('bmp');
    await openContextEntryMenu(
      perspectiveGridTable + firstFile,
      'fileMenuOpenFile'
    );
    // Check if the file is opened
    await delay(500);
    const webViewer = await global.client.element('#webViewer');
    await delay(500);
    expect(webViewer.selector).toBe('#webViewer');
  });

  it('TST5017 - Rename file', async () => {
    await searchEngine('textfile');
    await openContextEntryMenu(
      perspectiveGridTable + firstFile,
      'fileMenuRenameFile'
    );
    await delay(500);
    await global.client
      .waitForVisible('[data-tid=renameFileDialogInput] input')
      .setValue('[data-tid=renameFileDialogInput] input', newFileName);
    await delay(1500);
    await global.client
      .waitForVisible('[data-tid=confirmRenameFileDialog]')
      .click('[data-tid=confirmRenameFileDialog]');
    const fileName = await global.client
      .waitForVisible(perspectiveGridTable + firstFile)
      .getText(perspectiveGridTable + firstFile);
    expect(fileName).toContain(newFileName);
    // Check if the directories are displayed
    await searchEngine(newFileName);
    await delay(500);
    await openContextEntryMenu(
      perspectiveGridTable + firstFile,
      'fileMenuDeleteFile'
    );
    await delay(500);
    await global.client
      .waitForVisible('[data-tid=confirmDeleteFileDialog]')
      .click('[data-tid=confirmDeleteFileDialog]');
  });

  it('TST5018 - Delete file', async () => {
    await searchEngine('textfile');
    await openContextEntryMenu(
      perspectiveGridTable + firstFile,
      'fileMenuDeleteFile'
    );
    await delay(500);
    // Check if the directories are displayed
    await global.client
      .waitForVisible('[data-tid=confirmDeleteFileDialog]')
      .click('[data-tid=confirmDeleteFileDialog]');
  });

  it('TST5026 - Open file natively', async () => {
    await searchEngine('textfile');
    await openContextEntryMenu(
      perspectiveGridTable + firstFile,
      'fileMenuOpenFileNatively'
    );
    // check parent directory
  });

  it('TST50** - Open containing folder', async () => {
    await searchEngine('textfile');
    await openContextEntryMenu(
      perspectiveGridTable + firstFile,
      'fileMenuOpenContainingFolder'
    );
    // check parent directory
  });

  it('TST50** - Add / Remove tags', async () => {
    await searchEngine('textfile');
    await openContextEntryMenu(
      perspectiveGridTable + firstFile,
      'fileMenuAddRemoveTags'
    );
    // Check if the directories are displayed

    await searchEngine('textfile');
    await openContextEntryMenu(
      perspectiveGridTable + firstFile,
      'fileMenuDeleteFile'
    );
  });

  it('TST10** - Move / Copy file', async () => {
    await searchEngine('textfile');
    await openContextEntryMenu(
      perspectiveGridTable + firstFile,
      'fileMenuMoveCopyFile'
    );
    // Check if the directories are displayed
  });
});
