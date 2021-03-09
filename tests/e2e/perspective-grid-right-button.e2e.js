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
  closeLocation
} from './location.helpers';
import { searchEngine } from './search.helpers';
import {
  openContextEntryMenu,
  perspectiveGridTable,
  firstFile,
  toContainTID,
  firstFolder
} from './test-utils';
import {
  addInputKeys,
  clickOn,
  createNewDirectory,
  createTxtFile,
  doubleClickOn,
  expectElementExist,
  expectTagsExist,
  expectTagsExistBySelector,
  getGridFileName,
  removeTagFromTagMenu,
  selectorFile,
  selectorFolder,
  selectRowFiles,
  setInputKeys,
  setSettings,
  showFilesWithTag,
  waitForNotification
} from './general.helpers';
import { AddRemoveTagsToSelectedFiles } from './perspective-grid.helpers';

const testTagName = 'test-tag'; // TODO fix camelCase tag name
const newFileName = 'newFileName.txt';

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

  /*afterEach(async () => {
    if (global.isMinio || global.isWeb) {
      await closeLocation(defaultLocationName);
    }
  });*/

  test('TST5016 - Open file [web,minio,electron]', async () => {
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
    await global.client.pause(500);
    await global.client.switchToFrame(webViewer);
    await global.client.pause(500);
    const iframeBody = await global.client.$('body');
    await iframeBody.waitForDisplayed();
    const bodyTxt = await iframeBody.getText();

    await global.client.switchToParentFrame();
    expect(toContainTID(bodyTxt)).toBe(true);
  });

  test('TST5017 - Rename file [web,minio,electron]', async () => {
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

  test('TST5018 - Delete file [web,minio,electron]', async () => {
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

  test('TST5019 - Rename tag in file [web,minio,electron]', async () => {
    await searchEngine('desktop');
    // Select file
    await clickOn(selectorFile);
    await AddRemoveTagsToSelectedFiles([testTagName], true);
    await expectTagsExistBySelector(selectorFile, [testTagName], true);

    /*await AddRemoveTagsToFile(perspectiveGridTable + firstFile, [testTagName], {
      add: true
    });*/
    await clickOn('[data-tid=tagMoreButton_' + testTagName + ']');
    await global.client.pause(500);
    await clickOn('[data-tid=editTagDialogMenu]');
    await setInputKeys('editTagEntryDialog_input', testTagName + '-edited');
    await clickOn('[data-tid=confirmEditTagEntryDialog]');
    await waitForNotification();

    await expectTagsExistBySelector(
      selectorFile,
      [testTagName + '-edited'],
      true
    );

    //cleanup
    await clickOn(selectorFile);
    await AddRemoveTagsToSelectedFiles([testTagName + '-edited'], false);
    await expectTagsExistBySelector(
      selectorFile,
      [testTagName + '-edited'],
      false
    );
  });

  test('TST5023 - Remove tag from file (tag menu) [web,minio,electron]', async () => {
    await searchEngine('desktop');
    // select file
    await clickOn(selectorFile);
    await AddRemoveTagsToSelectedFiles([testTagName], true);
    await expectTagsExistBySelector(selectorFile, [testTagName], true);

    await removeTagFromTagMenu(testTagName);
    await global.client.pause(500);

    await expectTagsExistBySelector(selectorFile, [testTagName], false);
  });

  test('TST5024 - Show files with a given tag (tag menu) [web,minio,electron]', async () => {
    //open Option menu
    await clickOn('[data-tid=gridPerspectiveOptionsMenu]');
    //click on hide directories
    await clickOn('[data-tid=gridPerspectiveToggleShowDirectories]');

    await selectRowFiles([0, 1, 2]);
    await AddRemoveTagsToSelectedFiles([testTagName], true);
    await showFilesWithTag(testTagName);

    const filesList = await global.client.$$(selectorFile);
    for (let i = 0; i < filesList.length; i++) {
      await expectTagsExist(filesList[i], [testTagName], true);
    }

    /*const classNotSelected = await getGridCellClass(0);
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
    await AddRemoveTagsToSelectedFiles([testTagName], false);*/
  });

  /**
   * TODO web sometimes: stale element reference: stale element reference: element is not attached to the page document
   * TODO minio sometimes: stale element reference: stale element reference: element is not attached to the page document
   */
  test('TST5025 - Add - Remove tags (file menu) [web,electron]', async () => {
    await searchEngine('desktop');
    const tags = [testTagName, testTagName + '2'];
    // select file
    await clickOn(selectorFile);
    await AddRemoveTagsToSelectedFiles(tags, true);

    await expectTagsExistBySelector(selectorFile, tags, true);

    // remove tags
    await clickOn(selectorFile);
    await AddRemoveTagsToSelectedFiles(tags, false);

    await expectTagsExistBySelector(selectorFile, tags, false);
  });

  test('TST5026 - Open file natively [electron]', async () => {
    if (!global.isMinio) {
      // Open file natively option is missing for Minio Location
      await searchEngine('txt');
      await openContextEntryMenu(selectorFile, 'fileMenuOpenFileNatively');
    }
    // check parent directory
  });

  test('TST5027 - Open containing folder [web,minio,electron]', async () => {
    if (!global.isMinio) {
      // Show in File Manager option is missing for Minio Location
      await searchEngine('txt');
      await openContextEntryMenu(selectorFile, 'fileMenuOpenContainingFolder');
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
  test('TST5028 - Move - Copy file (file menu) [minio,electron]', async () => {
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

  it.skip('TST5029 - Add file from file manager with dnd [Electron, manual]', async () => {});

  test('TST5033 - Open directory (directory menu) [web,minio,electron]', async () => {
    // open empty_folder
    await openContextEntryMenu(
      perspectiveGridTable + firstFolder,
      'openDirectory'
    );
    if (isWeb) {
      await global.client.pause(500);
    }
    const firstFileName = await getGridFileName(0);
    expect(firstFileName).toBe(undefined); //'sample.eml');
  });

  test('TST5034 - Rename directory (directory menu) [web,minio,electron]', async () => {
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
  test('TST5035 - Delete directory (directory menu) [web,minio,electron]', async () => {
    // await setSettings('[data-tid=settingsSetUseTrashCan]');
    // await global.client.pause(500);
    await doubleClickOn(selectorFolder);
    const testFolder = await createNewDirectory('aaa');

    await openContextEntryMenu(selectorFolder, 'deleteDirectory');
    await clickOn('[data-tid=confirmDeleteFileDialog]');

    await expectElementExist(
      '[data-tid=fsEntryName_' + testFolder + ']',
      false
    );
  });

  test('TST5036 - Open directory properties (directory menu) [web,minio,electron]', async () => {
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

  test('TST5038 - Return directory back [web,minio,electron]', async () => {
    // await expectElementExist(selectorFolder);

    //Open folder
    await doubleClickOn(selectorFolder);

    await expectElementExist(selectorFolder, false);
    await clickOn('[data-tid=gridPerspectiveOnBackButton]');
    await expectElementExist(selectorFolder);
  });

  test('TST5039 - Changing the Perspective View [web,minio,electron]', async () => {
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
    //await deleteFirstFile();
    //const firstFileName = await getGridFileName(0);
    //expect(firstFileName).toBe(undefined);
  });
});
