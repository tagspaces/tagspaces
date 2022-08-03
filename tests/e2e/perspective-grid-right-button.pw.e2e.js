/*
 * Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved.
 */
import {
  defaultLocationPath,
  defaultLocationName,
  renameFileFromMenu,
  deleteFileFromMenu,
  createPwMinioLocation,
  createPwLocation
} from './location.helpers';
import { searchEngine } from './search.helpers';
import { openContextEntryMenu, toContainTID } from './test-utils';
import {
  clickOn,
  createNewDirectory,
  createTxtFile,
  expectElementExist,
  expectTagsExist,
  expectTagsExistBySelector,
  generateFileName,
  getGridFileName,
  getGridFileSelector,
  isDisplayed,
  isElementDisplayed,
  reloadDirectory,
  removeTagFromTagMenu,
  selectorFile,
  selectorFolder,
  selectRowFiles,
  setInputKeys,
  setGridOptions,
  showFilesWithTag,
  waitForNotification
} from './general.helpers';
import { AddRemoveTagsToSelectedFiles } from './perspective-grid.helpers';
import { startTestingApp, stopSpectronApp, testDataRefresh } from './hook';
// import { defaultSettings as listDefaultSettings } from '../../app/perspectives/list/index';
// import { defaultSettings as gridDefaultSettings } from '../../app/perspectives/grid-perspective/index';
// import {
//   GridPerspectiveMeta,
//   ListPerspectiveMeta
// } from '../../app/perspectives/index';

const testTagName = 'testTag'; // TODO fix camelCase tag name

// Test the functionality of the right button on a file on a grid perspective table
// Scenarios for right button on a file
describe('TST50** - Right button on a file', () => {
  beforeAll(async () => {
    await startTestingApp('extconfig-with-welcome.js');
  });

  afterAll(async () => {
    await stopSpectronApp();
    await testDataRefresh();
  });
  beforeEach(async () => {
    if (global.isMinio) {
      await createPwMinioLocation('', defaultLocationName, true);
    } else {
      await createPwLocation(defaultLocationPath, defaultLocationName, true);
    }
    await clickOn('[data-tid=location_' + defaultLocationName + ']');
    // If its have opened file
    // await closeFileProperties();
  });

  test('TST5016 - Open file [web,minio,electron]', async () => {
    // await searchEngine('txt');
    await openContextEntryMenu(
      '[data-tid="fsEntryName_sample.txt"]', // perspectiveGridTable + firstFile,
      'fileMenuOpenFile'
    );
    // Check if the file is opened
    // await delay(1500);
    await expectElementExist('#FileViewer', true, 2000);
    const webViewer = await global.client.waitForSelector('#FileViewer');
    // await webViewer.waitForDisplayed();
    // await delay(5000);
    // expect(await webViewer.isDisplayed()).toBe(true);
    const iframe = await webViewer.contentFrame();
    // await global.client.switchToFrame(webViewer);
    // await isElementDisplayed(iframeBody,'body');
    const iframeBody = await iframe.waitForSelector('body');
    const bodyTxt = await iframeBody.innerText();
    const containTID = toContainTID(bodyTxt);
    if (!containTID) {
      console.debug('no containTID in:' + bodyTxt);
    }
    expect(containTID).toBe(true);
  });

  test('TST5017 - Rename file [web,minio,electron]', async () => {
    const newFileName = 'newFileName';
    const fileExtension = '.txt';
    // await searchEngine('txt');
    const sampleFileName = 'sample.txt';
    const oldName = await renameFileFromMenu(
      newFileName,
      getGridFileSelector(sampleFileName)
    );
    expect(oldName).toBe(sampleFileName);

    await expectElementExist(getGridFileSelector(newFileName + fileExtension));
    await expectElementExist(getGridFileSelector(oldName), false);

    // const fileNameTxt = await getFirstFileName();
    // expect(fileNameTxt).toContain(newFileName);

    // rename back to oldName
    const fileName = await renameFileFromMenu(
      oldName,
      getGridFileSelector(newFileName + fileExtension)
    );
    expect(fileName).toBe(newFileName + fileExtension);
  });

  test('TST5018 - Delete file [web,minio,electron]', async () => {
    // await createTxtFile();
    // await searchEngine('note'); //select new created file - note[date_created].txt
    const fileName = 'sample.html'; // await getGridFileName(-1);
    // expect(firstFileName).toBe('note.txt');

    // await expectElementExist(selectorFile, true);

    await deleteFileFromMenu(getGridFileSelector(fileName));
    await expectElementExist(getGridFileSelector(fileName), false);
    /* firstFileName = await getGridFileName(0);
    expect(firstFileName).toBe(undefined); */
  });

  test('TST5019 - Rename tag in file [web,minio,electron]', async () => {
    // await searchEngine('desktop');
    // Select file
    await clickOn(selectorFile);
    //Toggle Properties
    await clickOn('[data-tid=fileContainerToggleProperties]');
    await AddRemoveTagsToSelectedFiles([testTagName], true);
    await expectElementExist(
      selectorFile + '[1]//div[@id="gridCellTags"]//button[1]',
      true
    );
    await expectTagsExistBySelector(selectorFile, [testTagName], true);

    /* await AddRemoveTagsToFile(perspectiveGridTable + firstFile, [testTagName], {
      add: true
    }); */
    await clickOn('[data-tid=tagMoreButton_' + testTagName + ']');
    await clickOn('[data-tid=editTagDialogMenu]');
    await global.client.dblclick('[data-tid=editTagEntryDialog_input] input');
    await setInputKeys('editTagEntryDialog_input', testTagName + 'Edited');
    await clickOn('[data-tid=confirmEditTagEntryDialog]');
    // await waitForNotification();

    await expectElementExist(
      selectorFile + '[1]//div[@id="gridCellTags"]//button[1]',
      true
    );

    await expectTagsExistBySelector(
      selectorFile,
      [testTagName + 'Edited'],
      true
    );

    // cleanup
    await clickOn(selectorFile);
    await AddRemoveTagsToSelectedFiles([testTagName + 'Edited'], false);

    await expectElementExist(
      selectorFile + '[1]//div[@id="gridCellTags"]//button',
      false,
      1500
    );

    await expectTagsExistBySelector(
      selectorFile,
      [testTagName + 'Edited'],
      false
    );
  });

  test('TST5023 - Remove tag from file (tag menu) [web,minio,electron]', async () => {
    // await searchEngine('desktop');
    // select file
    await clickOn(selectorFile);
    //Toggle Properties
    await clickOn('[data-tid=fileContainerToggleProperties]');
    await AddRemoveTagsToSelectedFiles([testTagName], true);
    await expectElementExist(
      selectorFile + '[1]//div[@id="gridCellTags"]//button[1]',
      true
    );
    await expectTagsExistBySelector(selectorFile, [testTagName], true);

    await removeTagFromTagMenu(testTagName);

    await expectElementExist(
      selectorFile + '[1]//div[@id="gridCellTags"]//button[1]',
      false
    );
    await expectTagsExistBySelector(selectorFile, [testTagName], false);
  });

  /**
   * todo search not work
   */
  test('TST5024 - Show files with a given tag (tag menu)', async () => {
    await selectRowFiles([0, 1, 2]);
    await AddRemoveTagsToSelectedFiles([testTagName], true);
    await showFilesWithTag(testTagName);

    const filesList = await global.client.$$(selectorFile);
    for (let i = 0; i < filesList.length; i++) {
      await expectTagsExist(filesList[i], [testTagName], true);
    }

    // cleanup
    await selectRowFiles([0, 1, 2]);
    await AddRemoveTagsToSelectedFiles([testTagName], false);

    /* const classNotSelected = await getGridCellClass(0);
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
    await AddRemoveTagsToSelectedFiles([testTagName], false); */
  });

  /**
   * TODO web sometimes: stale element reference: stale element reference: element is not attached to the page document
   * TODO minio sometimes: stale element reference: stale element reference: element is not attached to the page document
   */
  test('TST5025 - Add - Remove tags (file menu) [web,electron]', async () => {
    // await searchEngine('desktop');
    const fileName = 'sample';
    const fileExt = 'desktop';
    const tags = [testTagName, testTagName + '2'];
    // select file
    await clickOn(getGridFileSelector(fileName + '.' + fileExt));
    await AddRemoveTagsToSelectedFiles(tags, true);

    let gridElement = await global.client.waitForSelector(
      getGridFileSelector(generateFileName(fileName, fileExt, tags, ' '))
    );
    gridElement = await gridElement.$('..');
    await expectTagsExist(gridElement, tags, true);
    // await expectTagsExistBySelector(selectorFile, tags, true);

    // remove tags
    await gridElement.click();
    await AddRemoveTagsToSelectedFiles(tags, false);

    gridElement = await global.client.waitForSelector(
      getGridFileSelector(fileName + '.' + fileExt)
    );
    gridElement = await gridElement.$('..');
    await expectTagsExist(gridElement, tags, false);
    // await expectTagsExistBySelector(selectorFile, tags, false);
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

  /* test('TST50** - Add / Remove tags', async () => {
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
  }); */

  /**
   * todo web: io-actions.ts:120 Moving files failed with Renaming file failedSignatureDoesNotMatch
   */
  test('TST5028 - Move - Copy file (file menu) [minio,electron]', async () => {
    // Move file in child folder
    // const fileExtension = 'pdf'; //'eml' -> todo search found extra files (.gitkeep) with fuseOptions = {threshold: 0.4,
    // await searchEngine(fileExtension);
    const fileName = 'sample.pdf';
    const fileSelector = getGridFileSelector(fileName);
    await openContextEntryMenu(fileSelector, 'fileMenuMoveCopyFile');
    await setInputKeys(
      'targetPathInput',
      defaultLocationPath + '/empty_folder'
    );

    await clickOn('[data-tid=confirmMoveFiles]');
    await waitForNotification();
    await expectElementExist(getGridFileSelector(fileName), false);
    // await clickOn('#clearSearchID');
    await global.client.dblclick(selectorFolder);
    // await searchEngine(fileExtension, { reindexing: true }); // TODO temp fix: https://trello.com/c/ZfcGGvOM/527-moved-files-is-not-indexing-not-found-in-search

    await expectElementExist(getGridFileSelector(fileName), true);
    // let firstFileName = await getGridFileName(0);
    // expect(firstFileName).toBe(fileName);

    // Copy file in parent directory
    await openContextEntryMenu(fileSelector, 'fileMenuMoveCopyFile');
    await setInputKeys('targetPathInput', defaultLocationPath);
    await clickOn('[data-tid=confirmCopyFiles]');
    await waitForNotification();
    // await clickOn('#clearSearchID');
    await clickOn('[data-tid=gridPerspectiveOnBackButton]');
    await expectElementExist(getGridFileSelector(fileName), true);
    // await searchEngine(fileExtension);
    /* firstFileName = await getGridFileName(0);
    expect(firstFileName).toBe('sample.' + fileExtension);
*/
    // cleanup
    await global.client.dblclick(selectorFolder);
    await expectElementExist(selectorFile, true);
    await deleteFileFromMenu();
    await expectElementExist(selectorFile, false);
    await reloadDirectory();
    await expectElementExist(selectorFile, false);
  });

  it.skip('TST5029 - Add file from file manager with dnd [manual]', async () => {});

  test('TST5033 - Open directory (directory menu) [web,minio,electron]', async () => {
    // open empty_folder
    await openContextEntryMenu(selectorFolder, 'openDirectory');
    // await global.client.screenshot({ path: 'screenshotTST5033.png' });
    await expectElementExist(selectorFile, false);
    // const firstFileName = await getGridFileName(0);
    // expect(firstFileName).toBe(undefined); //'sample.eml');
  });

  test('TST5034 - Rename directory (directory menu) [web,minio,electron]', async () => {
    const newDirName = 'new_dir_name';
    await openContextEntryMenu(selectorFolder, 'renameDirectory');
    const oldDirName = await setInputKeys('renameEntryDialogInput', newDirName);
    await clickOn('[data-tid=confirmRenameEntry]');
    await waitForNotification();

    // turn dir name back
    await openContextEntryMenu(selectorFolder, 'renameDirectory');
    const renamedDir = await setInputKeys('renameEntryDialogInput', oldDirName);
    await clickOn('[data-tid=confirmRenameEntry]');
    await waitForNotification();
    expect(renamedDir).toBe(newDirName);
  });

  /**
   * delete dir is not supported on minio
   */
  test('TST5035 - Delete directory (directory menu) [web,minio,electron]', async () => {
    // await setSettings('[data-tid=settingsSetUseTrashCan]');
    // await global.client.pause(500);
    await global.client.dblclick(selectorFolder);
    const testFolder = await createNewDirectory('aaa');

    await openContextEntryMenu(selectorFolder, 'deleteDirectory');
    await clickOn('[data-tid=confirmDeleteFileDialog]');

    await expectElementExist(
      '[data-tid=fsEntryName_' + testFolder + ']',
      false
    );
    // dir back to check if parent folder exist
    // await clickOn('[data-tid=gridPerspectiveOnBackButton]');
    // await expectElementExist(selectorFolder, true);
  });

  test('TST5036 - Open directory properties (directory menu) [web,minio,electron]', async () => {
    await openContextEntryMenu(selectorFolder, 'showProperties');
    await expectElementExist('[data-tid=fileNameProperties]', true);
  });

  test('TST5037 - Show sub folders [TST5037,web,minio,electron]', async () => {
    // click on hide directories
    await setGridOptions(false);

    // file
    await expectElementExist(selectorFile, true);
    // folder
    await expectElementExist(selectorFolder, false);

    // show sub folder in the grid perspective
    await setGridOptions(true);

    // file
    await expectElementExist(selectorFile, true);
    // folder
    await expectElementExist(selectorFolder, true);
  });

  test.skip('TST5038 - Return directory back [web,minio,electron]', async () => {
    // TODO
    // expect(received).toBe(expected) // Object.is equality
    // Expected: true
    // Received: false
    //   363 | ) {
    //   364 |   const displayed = await isDisplayed(selector, exist, timeout);
    // > 365 |   expect(displayed).toBe(true);
    //       |                     ^
    //   366 |   // return element;
    //   367 | }
    //   368 |
    //   at expectElementExist (e2e/general.helpers.js:365:21)
    //   at Object.<anonymous> (e2e/perspective-grid-right-button.pw.e2e.js:421:5)
    // await expectElementExist(selectorFolder);

    // Open folder
    await global.client.dblclick(selectorFolder);
    // await global.client.screenshot({ path: 'screenshotTST5038.png' });
    await expectElementExist(selectorFolder, false);
    await clickOn('[data-tid=gridPerspectiveOnBackButton]');
    await expectElementExist(selectorFolder);
  });

  test('TST5039 - Changing the Perspective View [web,minio,electron]', async () => {
    // await isDisplayed('[data-tid=perspectiveGridFileTable]', true);
    // await global.client.screenshot({ path: 'screenshotTST5039.png' });

    // const grid = await global.client.waitForSelector(
    //   '[data-tid=perspectiveGridFileTable]'
    // );
    // let gridStyle = await grid.getAttribute('style');
    // expect(gridStyle).toContain(
    //   'margin-top: 53px; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));'
    // );
    // await clickOn('[data-tid=openListPerspective]');
    // // check perspective view
    // gridStyle = await grid.getAttribute('style');
    // expect(gridStyle).toContain('grid-template-columns: none;');

    await expectElementExist(
      // '[data-tid=' + gridDefaultSettings.testID + ']',
      '[data-tid=gridPerspectiveContainer]',
      true
    );
    await clickOn('[data-tid=openListPerspective]'); // openListPerspective
    await expectElementExist(
      // '[data-tid=' + listDefaultSettings.testID + ']',
      '[data-tid=listPerspectiveContainer]',
      true
    );
  });

  test('TST5040 - Create file [TST5040,web,minio,electron]', async () => {
    // Open empty folder
    await global.client.dblclick(selectorFolder);

    await createTxtFile();
    // await searchEngine('note');
    await expectElementExist(selectorFile, true);

    // cleanup
    // await deleteFirstFile();
    // const firstFileName = await getGridFileName(0);
    // expect(firstFileName).toBe(undefined);
  });
});
