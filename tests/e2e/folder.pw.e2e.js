/*
 * Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved.
 */
import {
  defaultLocationPath,
  defaultLocationName,
  createPwMinioLocation,
  createPwLocation
} from './location.helpers';
import {
  reloadDirectory,
  createNewDirectory,
  deleteDirectory,
  clickOn,
  expectElementExist
} from './general.helpers';
import { renameFolder } from './test-utils';
import { startTestingApp, stopSpectronApp, testDataRefresh } from './hook';

// export const firstFile = '/span';
// export const perspectiveGridTable = '//*[@data-tid="perspectiveGridFileTable"]';
// const newDirectoryName = 'newDirectory';

describe('TST01 - Folder management', () => {
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

  it('TST0101 - Create subfolder [web,minio,electron]', async () => {
    const testFolder = await createNewDirectory();
    await expectElementExist('[data-tid=fsEntryName_' + testFolder + ']');
    await global.client.dblclick('[data-tid=fsEntryName_' + testFolder + ']');
    await deleteDirectory();
    await expectElementExist(
      '[data-tid=fsEntryName_' + testFolder + ']',
      false,
      2000
    );
  });

  it('TST0102 - Reload folder [web,minio,electron]', async () => {
    const testFolder = await createNewDirectory();
    await global.client.dblclick('[data-tid=fsEntryName_' + testFolder + ']');
    await reloadDirectory();
    await deleteDirectory();
    await expectElementExist(
      '[data-tid=fsEntryName_' + testFolder + ']',
      false
    );
  });

  it('TST0103 - Rename folder [web,minio,electron]', async () => {
    const testFolder = await createNewDirectory();
    await global.client.dblclick('[data-tid=fsEntryName_' + testFolder + ']');
    const newDirectoryName = await renameFolder();
    await clickOn('[data-tid=gridPerspectiveOnBackButton]');
    await expectElementExist('[data-tid=fsEntryName_' + newDirectoryName + ']');
    // cleanup
    await global.client.dblclick(
      '[data-tid=fsEntryName_' + newDirectoryName + ']'
    );
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
    await global.client.dblclick('[data-tid=fsEntryName_' + testFolder + ']');
    await deleteDirectory();
    await expectElementExist(
      '[data-tid=fsEntryName_' + testFolder + ']',
      false
    );
  });

  it.skip('TST0105 - Show folder tags [electron, TODO]', async () => {});

  it.skip('TST0106 - Show folder tags [TODO]', async () => {
    // await createNewDirectory();
  });

  it.skip('TST0107 - Show in file manager [manual]', async () => {});

  it.skip('TST0108 - Show directory properties [electron, TODO]', async () => {});

  it.skip('TST0109 - Delete non empty folder by disabled trashcan should not be possible [electron, TODO]', async () => {});

  it.skip('TST0110 - Delete not empty folder to trashcan [electron, TODO]', async () => {});

  it.skip('TST0111 - Open parent directory [electron, TODO]', async () => {});
});
