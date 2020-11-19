/*
 * Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved.
 */
import {
  createLocation,
  defaultLocationPath,
  defaultLocationName,
  closeFileProperties,
  createMinioLocation
} from './location.helpers';
import {
  reloadDirectory,
  openEntry,
  disableTrashBin,
  createNewDirectory,
  deleteDirectory,
  clickOn,
  expectElementExist,
  selectorFolder,
  doubleClickOn
} from './general.helpers';
import { renameFolder } from './test-utils.spec';

export const firstFile = '/span';
export const perspectiveGridTable = '//*[@data-tid="perspectiveGridFileTable"]';
const newDirectoryName = 'newDirectory';

describe('TST01 - Folder management [electron]', () => {
  beforeEach(async () => {
    // await clearLocalStorage();

    if (global.isMinio) {
      await createMinioLocation('', defaultLocationName, true);
    } else {
      await createLocation(defaultLocationPath, defaultLocationName, true);
    }
    await clickOn('[data-tid=location_' + defaultLocationName + ']');
    await closeFileProperties();
  });

  it('TST0101 - Create subfolder [electron]', async () => {
    const testFolder = await createNewDirectory();
    await expectElementExist('[data-tid=fsEntryName_' + testFolder + ']');
    await openEntry(testFolder);
    await deleteDirectory();
    await expectElementExist(
      '[data-tid=fsEntryName_' + testFolder + ']',
      false
    );
  });

  it('TST0102 - Reload folder [electron]', async () => {
    const testFolder = await createNewDirectory();
    await openEntry(testFolder);
    await reloadDirectory();
    await global.client.pause(500);
    await deleteDirectory();
    await expectElementExist(
      '[data-tid=fsEntryName_' + testFolder + ']',
      false
    );
  });

  // TODO
  it('TST0103 - Rename folder [electron]', async () => {
    const testFolder = await createNewDirectory();
    await openEntry(testFolder);
    const newDirectoryName = await renameFolder();
    //await openParentDir();
    /*await expectElementExist('[data-tid=fsEntryName_' + newDirectoryName + ']');
    await openEntry(newDirectoryName);
    await deleteDirectory();
    await expectElementExist(
        '[data-tid=fsEntryName_' + newDirectoryName + ']',
        false
    );*/
  });

  it('TST0104 - Delete empty folder [electron]', async () => {
    await disableTrashBin();
    await global.client.pause(500);
    const testFolder = await createNewDirectory();
    await expectElementExist('[data-tid=fsEntryName_' + testFolder + ']');
    await openEntry(testFolder);
    await deleteDirectory();
    await expectElementExist(
      '[data-tid=fsEntryName_' + testFolder + ']',
      false
    );
  });

  it('TST0106 - Show folder tags [electron]', async () => {
    // await createNewDirectory();
  });

  it('TST51** - Return directory back [electron]', async () => {
    await expectElementExist(selectorFolder);

    //Open folder
    await doubleClickOn(selectorFolder);

    await expectElementExist(selectorFolder, false);
    await clickOn('[data-tid=gridPerspectiveOnBackButton]');
    await expectElementExist(selectorFolder);
  });
});
