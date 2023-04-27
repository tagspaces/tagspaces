/*
 * Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved.
 */
import { test } from '@playwright/test';
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
  expectElementExist,
  takeScreenshot
} from './general.helpers';
import { renameFolder } from './test-utils';
import { startTestingApp, stopApp, testDataRefresh } from './hook';
import { init } from './welcome.helpers';

test.beforeAll(async () => {
  await startTestingApp('extconfig-with-welcome.js');
  await init();
});

test.afterAll(async () => {
  await stopApp();
  await testDataRefresh();
});

test.afterEach(async () => {
  await init();
});

test.beforeEach(async () => {
  if (global.isMinio) {
    await createPwMinioLocation('', defaultLocationName, true);
  } else {
    await createPwLocation(defaultLocationPath, defaultLocationName, true);
  }
  await clickOn('[data-tid=location_' + defaultLocationName + ']');
  // If its have opened file
  // await closeFileProperties();
});

test.describe('TST01 - Folder management', () => {
  test('TST0101 - Create subfolder [web,minio,electron]', async () => {
    const testFolder = await createNewDirectory();
    await expectElementExist('[data-tid=fsEntryName_' + testFolder + ']');
    await global.client.dblclick('[data-tid=fsEntryName_' + testFolder + ']');
    await deleteDirectory();
    // await takeScreenshot('TST0101 after deleteDirectory');
    await reloadDirectory();
    // await takeScreenshot('TST0101 after reloadDirectory');
    await expectElementExist(
      '[data-tid=fsEntryName_' + testFolder + ']',
      false,
      5000
    );
  });

  test('TST0102 - Reload folder [web,minio,electron]', async () => {
    const testFolder = await createNewDirectory();
    await global.client.dblclick('[data-tid=fsEntryName_' + testFolder + ']');
    await reloadDirectory();
    await deleteDirectory();
    await expectElementExist(
      '[data-tid=fsEntryName_' + testFolder + ']',
      false,
      5000
    );
  });

  test('TST0103 - Rename folder [web,minio,electron]', async () => {
    const testFolder = await createNewDirectory();
    await global.client.dblclick('[data-tid=fsEntryName_' + testFolder + ']');
    const newDirectoryName = await renameFolder();
    await clickOn('[data-tid=gridPerspectiveOnBackButton]');
    await takeScreenshot('TST0103 - Rename folder - after OnBackButton');
    await expectElementExist(
      '[data-tid=fsEntryName_' + newDirectoryName + ']',
      true,
      2000
    );
    // cleanup
    await global.client.dblclick(
      '[data-tid=fsEntryName_' + newDirectoryName + ']'
    );
    await deleteDirectory();
    await takeScreenshot('TST0103 - Rename folder - after deleteDirectory');
    await expectElementExist(
      '[data-tid=fsEntryName_' + newDirectoryName + ']',
      false,
      5000
    );
  });

  test('TST0104 - Delete empty folder [web,minio,electron]', async () => {
    // await setSettings('[data-tid=settingsSetUseTrashCan]');
    // await global.client.pause(500);
    const testFolder = await createNewDirectory();
    await expectElementExist('[data-tid=fsEntryName_' + testFolder + ']');
    await global.client.dblclick('[data-tid=fsEntryName_' + testFolder + ']');
    await deleteDirectory();
    await expectElementExist(
      '[data-tid=fsEntryName_' + testFolder + ']',
      false,
      5000
    );
  });

  test.skip('TST0105 - Show folder tags [electron, TODO]', async () => {});

  test.skip('TST0106 - Show folder tags [TODO]', async () => {
    // await createNewDirectory();
  });

  test.skip('TST0107 - Show in file manager [manual]', async () => {});

  test.skip('TST0108 - Show directory properties [electron, TODO]', async () => {});

  test.skip('TST0109 - Delete non empty folder by disabled trashcan should not be possible [electron, TODO]', async () => {});

  test.skip('TST0110 - Delete not empty folder to trashcan [electron, TODO]', async () => {});

  test.skip('TST0111 - Open parent directory [electron, TODO]', async () => {});
});
