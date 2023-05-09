/*
 * Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved.
 */
import { expect, test } from '@playwright/test';
import { defaultLocationName } from './location.helpers';
import {
  clickOn,
  expectElementExist,
  selectorFile,
  setInputValue,
  takeScreenshot
} from './general.helpers';
import { startTestingApp, stopApp, testDataRefresh } from './hook';
import { clearDataStorage } from './welcome.helpers';

test.beforeAll(async () => {
  await startTestingApp('extconfig.js');
  // await clearDataStorage();
});

test.afterAll(async () => {
  await stopApp();
  await testDataRefresh();
});

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    await takeScreenshot(testInfo);
  }
  await clearDataStorage();
});

test.beforeEach(async () => {
  // if (global.isMinio) {
  //   await createPwMinioLocation('', defaultLocationName, true);
  // } else {
  //   await createPwLocation(defaultLocationPath, defaultLocationName, true);
  // }
  await clickOn('[data-tid=location_' + defaultLocationName + ']');
  // If its have opened file
  // await closeFileProperties();
});

test.describe('TST13 - Settings Key Bindings [electron]', () => {
  test('TST1311 - Test show search [electron]', async () => {
    const isMac = /^darwin/.test(process.platform);
    await clickOn(selectorFile);
    if (isMac) {
      await global.client.keyboard.press('Meta+KeyF');
    } else {
      await global.client.keyboard.press('Control+KeyF');
    }
    await expectElementExist('#textQuery', true, 2000);
  });

  test('TST1312 - Test rename file [electron]', async () => {
    const newTitle = 'renamed.txt';
    await clickOn(selectorFile);
    await global.client.keyboard.press('F2');
    await setInputValue('[data-tid=renameEntryDialogInput] input', newTitle);
    await clickOn('[data-tid=closeRenameEntryDialog]');
  });

  test('TST1313 - Test open file [electron]', async () => {
    await clickOn(selectorFile);
    await global.client.keyboard.press('Enter');
    await expectElementExist('[data-tid=fileContainerToggleProperties]', true);
  });

  test('TST1315 - Test delete file [electron]', async () => {
    await clickOn(selectorFile);
    await global.client.keyboard.press('Delete');
    await clickOn('[data-tid=confirmDeleteFileDialog]');
    // await expectElementExist('[data-tid=confirmDeleteFileDialog]', true);
  });

  test('TST1316 - Show help and feedback panel in the left [electron]', async () => {
    await clickOn(selectorFile);
    await global.client.keyboard.press('F1');
    await expectElementExist('[data-tid=aboutDialog]', true);
  });

  test.skip('TST1301 - Change a key binding [electron]', async () => {});

  test.skip('TST1302 - Test select all [electron]', async () => {});

  test.skip('TST1303 - Test reload of document [electron]', async () => {});

  test.skip('TST1304 - Test close document [electron]', async () => {});

  test.skip('TST1305 - Test document properties [electron]', async () => {});

  test.skip('TST1306 - Test save document [electron]', async () => {});

  test.skip('TST1307 - Test show next document [electron]', async () => {});

  test.skip('TST1308 - Test show previous document [electron]', async () => {});

  test.skip('TST1309 - Test edit document [electron]', async () => {});

  test.skip('TST1310 - Test add / remove tags [electron]', async () => {});

  test.skip('TST1314 - Test open file externally [electron]', async () => {});
});
