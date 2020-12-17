/* Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved. */
import { delay } from './hook';
import {
  createLocation,
  checkForIdExist,
  defaultLocationPath
} from './location.helpers';
import { openSettings } from './general.spec';
import { searchEngine, testFileInSubDirectory } from './search.spec';
import {
  checkFilenameForExist,
  firstFile,
  openDirectoryMenu,
  openFile,
  perspectiveGridTable
} from './test-utils.spec';

const testLocationName = '' + new Date().getTime();

describe('TST13 - Settings Key Bindings:', async () => {
  beforeEach(async () => {
    await delay(500);
    await createLocation(defaultLocationPath, testLocationName);
    await delay(2000);
  });

  it('TST1301 - Change key binding', async () => {
    await openSettings('keyBindingsSettingsDialog');
    // TODO Set the new value of 'Select all files' key binding button to (F8)

    // TODO check the new button (F8)
  });

  it('TST1307 - Show next document', async () => {
    // TODO show next document - arrow right
    // await global.client.keys('ArrowRight')
    // TODO show previous document - arrow left
    // await global.client.keys('ArrowLeft')
  });

  it('TST1312 - Rename file', async () => {
    await searchEngine('sample');
    await openFile(perspectiveGridTable, firstFile);
    await global.client.keys('F2');
    await delay(500);
    // set new file name
    await global.client
      .waitForVisible('[data-tid=renameFileDialogInput]')
      .setValue('[data-tid=renameFileDialogInput]', 'newFileName');
    await delay(500);
    await global
      .clientwaitForVisible('#confirmRenameFileDialog')
      .click('#confirmRenameFileDialog');
    await searchEngine('newFileName');
    await checkFilenameForExist('newFileName');
    // rename the new name to old name
    await openFile(perspectiveGridTable, firstFile);
    await global.client.keys('F2');
    // set new file name
    await global.client
      .waitForVisible('[data-tid=renameFileDialogInput]')
      .setValue('[data-tid=renameFileDialogInput]', 'sample.txt');
    await delay(500);
    await global
      .clientwaitForVisible('#confirmRenameFileDialog')
      .click('#confirmRenameFileDialog');
    // should find renamed file name
    await checkFilenameForExist('sample');
  });

  it('TST1313 - Open file', async () => {});

  it('TST1315 - Delete file', async () => {
    await openDirectoryMenu('[data-tid=createNewFile]');
    // find new created file
    await delay(500);
    // await searchEngine('newFile');
    await openFile(perspectiveGridTable, firstFile);
    // TODO check first file
    // await global.client.keys('Delete') // key binding Delete
    // await global.client.waitForVisible('[data-tid=confirmDeleteFileDialog]').click('[data-tid=confirmDeleteFileDialog]')
    // TODO first file should not be with empty file name
    // await global.client.waitForVisible(firstFileNameElement)
    // await global.client .getText(firstFileNameElement)
  });

  it('TST1316 - Show keyboard shortcuts help dialog', async () => {
    // TODO should to set current key binding to show keyboard shortcuts help dialog
    await global.client.keys('F1');
    await delay(500);
    await checkForIdExist('keyboardShortCutsDialog');
  });

  it('TST13** - Show tag library / Show location', async () => {
    await global.client.keys(['Control', '2']);
    await delay(500);
    await checkForIdExist('keyboardShortCutsDialog');
    await global.client.keys(['Control', '1']);
    await delay(500);
    await checkForIdExist('keyboardShortCutsDialog');
  });
});
