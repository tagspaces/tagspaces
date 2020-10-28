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
  reloadDirectory,
  openEntry,
  disableTrashBin,
  openDirectoryMenu,
  createNewDirectory,
  deleteDirectory,
  returnDirectoryBack
} from './general.helpers';
import { renameFolder, openParentDir } from './test-utils.spec';

export const firstFile = '/span';
export const perspectiveGridTable = '//*[@data-tid="perspectiveGridFileTable"]';
const testFolder = 'testFolder';
const newDirectoryName = 'newDirectory';

describe('TST01 - Folder management [electron]', () => {
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

  it('TST0101 - Create subfolder [electron]', async () => {
    await delay(500);
    await openDirectoryMenu();
    await delay(500);
    await createNewDirectory();
    await delay(500);
    await openEntry(testFolder);
    await delay(500);
    await deleteDirectory();
  });

  it('TST0102 - Reload folder [electron]', async () => {
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

  it('TST0103 - Rename folder [electron]', async () => {
    await delay(500);
    await openDirectoryMenu();
    await delay(500);
    await createNewDirectory();
    await delay(500);
    await openEntry(testFolder);
    await delay(500);
    await reloadDirectory();
    await delay(500);
    await renameFolder();
    await delay(500);
    // await reloadDirectory();
    // await delay(500);
    await openParentDir();
    await deleteDirectory();
  });

  it('TST0104 - Delete empty folder [electron]', async () => {
    await delay(500);
    await disableTrashBin();
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

  it('TST0106 - Show folder tags [electron]', async () => {
    await delay(500);
    await openDirectoryMenu();
    await delay(500);
    await createNewDirectory();
    await delay(500);
  });

  it('TST51** - Return directory back [electron]', async () => {
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
  });
});
