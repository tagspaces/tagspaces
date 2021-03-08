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
import { renameFolder } from './test-utils';

// export const firstFile = '/span';
// export const perspectiveGridTable = '//*[@data-tid="perspectiveGridFileTable"]';
// const newDirectoryName = 'newDirectory';

describe('TST01 - Folder management', () => {
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
  it('TST0101 - Create subfolder [web,minio,electron]', async () => {
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
  it('TST0102 - Reload folder [web,minio,electron]', async () => {
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

  it('TST0103 - Rename folder [web,minio,electron]', async () => {
    const testFolder = await createNewDirectory();
    await doubleClickOn('[data-tid=fsEntryName_' + testFolder + ']');
    const newDirectoryName = await renameFolder();
    await global.client.pause(500);
    await clickOn('[data-tid=gridPerspectiveOnBackButton]');
    await expectElementExist('[data-tid=fsEntryName_' + newDirectoryName + ']');
    // cleanup
    await doubleClickOn('[data-tid=fsEntryName_' + newDirectoryName + ']');
    await deleteDirectory();
    await expectElementExist(
      '[data-tid=fsEntryName_' + newDirectoryName + ']',
      false
    );
  });

  it('TST0104 - Delete empty folder [web,minio,electron]', async () => {
    // await setSettings('[data-tid=settingsSetUseTrashCan]');
    // await global.client.pause(500);
    const testFolder = await createNewDirectory();
    await expectElementExist('[data-tid=fsEntryName_' + testFolder + ']');
    await doubleClickOn('[data-tid=fsEntryName_' + testFolder + ']');
    await deleteDirectory();
    await expectElementExist(
      '[data-tid=fsEntryName_' + testFolder + ']',
      false
    );
  });

  it.skip('TST0105 - Show folder tags [Electron, TODO]', async () => {});

  it.skip('TST0106 - Show folder tags [TODO]', async () => {
    // await createNewDirectory();
  });

  it.skip('TST0107 - Show in file manager [Electron, manual]', async () => {});

  it.skip('TST0108 - Show directory properties [Electron, TODO]', async () => {});

  it.skip('TST0109 - Delete non empty folder by disabled trashcan should not be possible [Electron, TODO]', async () => {});

  it.skip('TST0110 - Delete not empty folder to trashcan [Electron, TODO]', async () => {});

  it.skip('TST0111 - Open parent directory [Electron, TODO]', async () => {});
});
