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
  createNewDirectory,
  deleteDirectory,
  clickOn,
  expectElementExist,
  setSettings,
  doubleClickOn
} from './general.helpers';
import { renameFolder } from './test-utils.spec';

// export const firstFile = '/span';
// export const perspectiveGridTable = '//*[@data-tid="perspectiveGridFileTable"]';
// const newDirectoryName = 'newDirectory';

describe('TST01 - Folder management [electron]', () => {
  beforeEach(async () => {
    if (global.isMinio) {
      await createMinioLocation('', defaultLocationName, true);
    } else {
      await createLocation(defaultLocationPath, defaultLocationName, true);
    }
    await clickOn('[data-tid=location_' + defaultLocationName + ']');
    await closeFileProperties();
  });

  // TODO minio
  it('TST0101 - Create subfolder [TST0101,electron]', async () => {
    const testFolder = await createNewDirectory();
    await expectElementExist('[data-tid=fsEntryName_' + testFolder + ']');
    await doubleClickOn('[data-tid=fsEntryName_' + testFolder + ']');
    await deleteDirectory();
    await expectElementExist(
      '[data-tid=fsEntryName_' + testFolder + ']',
      false
    );
  });

  // TODO minio
  it('TST0102 - Reload folder [TST0102,electron]', async () => {
    const testFolder = await createNewDirectory();
    await doubleClickOn('[data-tid=fsEntryName_' + testFolder + ']');
    await reloadDirectory();
    await global.client.pause(500);
    await deleteDirectory();
    await expectElementExist(
      '[data-tid=fsEntryName_' + testFolder + ']',
      false
    );
  });

  // TODO
  it('TST0103 - Rename folder [TST0103]', async () => {
    const testFolder = await createNewDirectory();
    await doubleClickOn('[data-tid=fsEntryName_' + testFolder + ']');
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

  it('TST0104 - Delete empty folder [TST0104, electron]', async () => {
    await setSettings('[data-tid=settingsSetUseTrashCan]');
    await global.client.pause(500);
    const testFolder = await createNewDirectory();
    await expectElementExist('[data-tid=fsEntryName_' + testFolder + ']');
    await doubleClickOn('[data-tid=fsEntryName_' + testFolder + ']');
    await deleteDirectory();
    await expectElementExist(
      '[data-tid=fsEntryName_' + testFolder + ']',
      false
    );
  });

  it('TST0106 - Show folder tags [TST0106]', async () => {
    // await createNewDirectory();
  });
});
