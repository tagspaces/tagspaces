/* Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved. */
import { delay, clearLocalStorage } from './hook';
import {
  openFile,
  checkFilenameForExist,
  openDirectoryMenu,
  openContextEntryMenu,
  perspectiveGridTable,
  firstFile,
  firstFileName
} from './test-utils.spec';
import {
  createLocation,
  openLocation,
  defaultLocationPath,
  defaultLocationName
} from './location.helpers';
import { searchEngine } from './search.spec';

// const folderName = "test-data";
const testFolder = 'testFolder';
const currentDir = 'newDirectory';
const subDir = 'subDir';
const lastSubFolder = 'search';
// const renamedFolder = "renamedFolder";

describe('TST01+TST02 - Folder tests', () => {
  beforeEach(async () => {
    await clearLocalStorage();
    await delay(1000);
    await createLocation(defaultLocationPath, defaultLocationName, true);
    await delay(1000);
    await openLocation(defaultLocationName);
    await delay(1000);
  });

  it('TST0101 - Should create a folder', async () => {
    await openDirectoryMenu(defaultLocationName);
    await global.client.waitForVisible('[data-tid=newSubDirectory]');
    await global.client.click('[data-tid=newSubDirectory]');
    await delay(1500);
    // set new dir name
    await global.client
      .waitForVisible('[data-tid=directoryName] input')
      .keys('[data-tid=directoryName] input', testFolder);
    await delay(500);
    await global.client.waitForVisible('[data-tid=confirmCreateNewDirectory]');
    await global.client.click('[data-tid=confirmCreateNewDirectory]');
    // should find the folder with the given name in the UI
    await checkFilenameForExist(testFolder);
    await searchEngine(testFolder);
    await openFile(perspectiveGridTable, firstFile);
    await openDirectoryMenu('[data-tid=deleteDirectory]');
  });

  it('TST0201 - Should create a folder in alternative navigation', async () => {
    await openDirectoryMenu('newSubDirectory');
    // set new dir name
    await delay(1500);
    await global.client.keys('\uE004');
    // await global.client.waitUntil(() =>
    // await global.client.waitForVisible('[data-tid=directoryName]')
    //  .setValue('[data-tid=directoryName]', testFolder);
    // 500, 'expected text to be different after 5ms');
    await delay(1500);
    await global.client.$('[data-tid=directoryName] input').keys(testFolder);
    await global.client.keys('Tab');
    await global.client.keys('Tab');
    await global.client.keys('Enter');
    // await delay(1500);
    // await global.client.waitForVisible('[data-tid=confirmCreateNewDirectory]');
    // await delay(1500);
    // await global.client.click('[data-tid=confirmCreateNewDirectory]');
    // await global.client.$('[data-tid=confirmCreateNewDirectory]').click();
    // should find the folder with the given name in the UI
    await delay(5000);
    await checkFilenameForExist(testFolder);
    await delay(1500);
    await searchEngine(testFolder);
    await delay(1500);
    await openFile(perspectiveGridTable, firstFile);
    await delay(1500);
    await openDirectoryMenu('deleteDirectory');
  });

  it('TST0102 - Should reload a folder', async () => {
    await openDirectoryMenu('reloadDirectory');
    await delay(500);
    const dirName = await global.client
      .waitForVisible(perspectiveGridTable + firstFile)
      .getText(perspectiveGridTable + firstFile);
    expect(dirName).toContain(subDir);
  });

  it('TST0203 - Should reload folder in alternative navigation', async () => {
    await openDirectoryMenu('reloadDirectory');
    const folder = await global.client.getText(
      '[data-tid=folderContainerOpenDirMenu]'
    );
    await delay(500);
    expect(folder).toContain(defaultLocationName.toUpperCase());
  });

  describe('Rename folder', async () => {
    beforeEach(async () => {
      await searchEngine(currentDir);
    });

    it('TST0103 - Should rename a folder', async () => {
      await openContextEntryMenu(
        perspectiveGridTable + firstFile,
        'renameDirectory'
      );
      await delay(500);
      await global.client
        .waitForVisible('[data-tid=renameDirectoryDialogInput] input')
        .setValue('[data-tid=renameDirectoryDialogInput] input', testFolder);
      await delay(500);
      await global
        .clientwaitForVisible('[data-tid=confirmRenameDirectory]')
        .click('[data-tid=confirmRenameDirectory]');
      await delay(500);
      await searchEngine(currentDir);
      await global.client
        .waitForVisible('[data-tid=renameDirectoryDialogInput] input')
        .setValue('[data-tid=renameDirectoryDialogInput] input', currentDir);
      await delay(500);
      await global
        .clientwaitForVisible('[data-tid=confirmRenameDirectory]')
        .click('[data-tid=confirmRenameDirectory]');
    });

    it('TST0202 - Should rename a folder from the alternative navigation', async () => {
      await openDirectoryMenu('renameDirectory');
      await delay(500);
      await global.client
        .waitForVisible('[data-tid=directoryName] input')
        .setValue('[data-tid=directoryName] input', testFolder);
      await delay(5000);
      // // should find the new name of the folder
      // .waitForVisible('//*[@id="locationContent"]/div/div[2]/div[1]/button[2]')
      // .getText('//*[@id="locationContent"]/div/div[2]/div[1]/button[2]')
      // .should.eventually.equals(renamedFolder+'M')
      // //.waitForVisible('#perspectiveListContainer').should.eventually.exist;
    });
  });

  it('TST0105 - Open sub folder', async () => {
    await searchEngine(currentDir);
    await openContextEntryMenu(
      perspectiveGridTable + firstFile,
      'openDirectory'
    );
    await delay(500);
    const dirName = await global.client
      .waitForVisible(perspectiveGridTable + firstFile)
      .getText(perspectiveGridTable + firstFile);
    expect(dirName).toContain(subDir);
  });

  it('TST0111 - Open parent folder from the alternative navigation', async () => {
    await openDirectoryMenu('openParentDirectory');
    await delay(500);
    const dirName = await global.client
      .waitForVisible(perspectiveGridTable + firstFile)
      .getText(perspectiveGridTable + firstFile);
    expect(dirName).toContain(subDir);
  });

  it('TST0104 - Delete Folder', async () => {
    // await searchEngine(currentDir);
    // await openContextEntryMenu(perspectiveGridTable + firstFile, 'openDirectory');
    // await delay(500);
    // const dirName = await global.client.waitForVisible(perspectiveGridTable + firstFile).getText(perspectiveGridTable + firstFile);
    // expect(dirName).toContain(subDir);
  });
});
