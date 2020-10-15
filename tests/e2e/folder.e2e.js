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
  createMinioLocation
} from './location.helpers';
import {
  openSettingsDialog,
  closeSettingsDialog,
  reloadDirectory,
  openEntry,
  tsFolder,
  openDirectoryMenu,
  createNewDirectory,
  newHTMLFile,
  newMDFile,
  newTEXTFile,
  closeOpenedFile,
  deleteDirectory,
  returnDirectoryBack
} from './general.helpers';
import { renameDirectory } from './test-utils.spec';
import { searchEngine } from './search.spec';

export const firstFile = '/span';
export const perspectiveGridTable = '//*[@data-tid="perspectiveGridFileTable"]';
const subFolderName = '/test-perspective-grid';
const subFolderContentExtractionPath =
  defaultLocationPath + '/content-extraction';
const subFolderThumbnailsPath = defaultLocationPath + '/thumbnails';
const testFolder = 'testFolder';
const newDirectoryName = 'newDirectory';

describe('TST01 - Folder management [folder_mahagement, electron]', () => {
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

  it('TST0101 - Create subfolder [create_subfolder, electron]', async () => {
    await delay(500);
    await openDirectoryMenu();
    await delay(500);
    await createNewDirectory();
    await delay(500);
    await openEntry(testFolder);
    await delay(500);
    await deleteDirectory();
  });

  it('TST0102 - Reload folder [reload_folder, electron]', async () => {
    await delay(500);
    await openDirectoryMenu();
    await delay(500);
    await createNewDirectory();
    await delay(500);
    await openEntry(testFolder);
    await delay(500);
    await reloadDirectory();
    await delay(500);
    await deleteDirectory();
  });

  it('TST0103 - Rename folder [rename_folder, electron]', async () => {
    await delay(500);
    await openDirectoryMenu();
    await delay(500);
    await createNewDirectory();
    await delay(500);
    await openEntry(testFolder);
    await delay(500);
    await reloadDirectory();
    await delay(500);
    await openDirectoryMenu();
    const renameDirectory = await global.client.$('[data-tid=renameDirectory]');
    await renameDirectory.waitForDisplayed();
    await renameDirectory.click();
    await delay(500);
    const renameDirectoryDialogInput = await global.client.$(
      '[data-tid=renameDirectoryDialogInput] input'
    );
    await delay(1500);
    await renameDirectoryDialogInput.waitForDisplayed();
    await clearInputValue(renameDirectoryDialogInput);
    await delay(500);
    await renameDirectoryDialogInput.keys(newDirectoryName);
    const confirmRenameDirectoryDialog = await global.client.$(
      '[data-tid=confirmRenameDirectory]'
    );
    await confirmRenameDirectoryDialog.waitForDisplayed();
    await confirmRenameDirectoryDialog.click();
    await delay(55500);
    await deleteDirectory();
  });
});
