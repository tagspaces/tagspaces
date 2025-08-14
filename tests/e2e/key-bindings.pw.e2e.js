/*
 * Copyright (c) 2016-present - TagSpaces GmbH. All rights reserved.
 */
import { test, expect } from './fixtures';
import {
  createPwLocation,
  createPwMinioLocation,
  createS3Location,
  defaultLocationName,
} from './location.helpers';
import {
  clickOn,
  expectElementExist,
  getGridFileSelector,
  selectorFile,
  setInputValue,
} from './general.helpers';
import { startTestingApp, stopApp } from './hook';
import { clearDataStorage, closeWelcomePlaywright } from './welcome.helpers';

const testFileName = 'sample.pdf';
const isMac = /^darwin/.test(process.platform);

test.beforeAll(async ({ isWeb, isS3, webServerPort }, testInfo) => {
  if (isS3) {
    await startTestingApp({ isWeb, isS3, webServerPort, testInfo });
    await closeWelcomePlaywright();
  } else {
    await startTestingApp(
      { isWeb, isS3, webServerPort, testInfo },
      'extconfig.js',
    );
  }
});

test.afterAll(async () => {
  await stopApp();
});

test.afterEach(async ({ page }, testInfo) => {
  /*if (testInfo.status !== testInfo.expectedStatus) {
    await takeScreenshot(testInfo);
  }*/
  await clearDataStorage();
});

test.beforeEach(async ({ isMinio, isS3, testDataDir }) => {
  if (isMinio) {
    await createPwMinioLocation('', defaultLocationName, true);
  } else if (isS3) {
    await createS3Location('', defaultLocationName, true);
  } else {
    await createPwLocation(testDataDir, defaultLocationName, true);
  }
  await clickOn('[data-tid=location_' + defaultLocationName + ']');
  await expectElementExist(getGridFileSelector('empty_folder'), true, 8000);
  // If its have opened file
  // await closeFileProperties();
});

test.describe('TST13 - Settings Key Bindings [electron]', () => {
  test('TST1311 - Test show search [electron,minio,s3]', async () => {
    await clickOn(selectorFile);
    await global.client.keyboard.press('ControlOrMeta+KeyF'); //('ControlOrMeta+KeyK');
    await global.client.keyboard.press('ControlOrMeta+KeyK'); // on Mac
    await expectElementExist('#textQuery', true, 5000);
  });

  test('TST1312 - Test rename file [electron,minio,s3]', async () => {
    const newTitle = 'renamed.pdf';
    await clickOn(getGridFileSelector(testFileName));
    await global.client.keyboard.press('F2');
    const inputSelector = '[data-tid=renameEntryDialogInput] input';
    const oldName = await global.client.inputValue(inputSelector);
    await setInputValue(inputSelector, newTitle);
    await clickOn('[data-tid=confirmRenameEntry]');
    //await expectElementExist('[data-tid=detailsTabTID]', true);
    await expectElementExist(getGridFileSelector(newTitle), true, 5000);
    //rename back
    //const name = extractFileNameWithoutExt(oldName, '/');
    await clickOn(getGridFileSelector(newTitle));
    await global.client.keyboard.press('F2');
    await setInputValue(inputSelector, oldName);
    await clickOn('[data-tid=confirmRenameEntry]');
    await expectElementExist(getGridFileSelector(oldName), true, 5000);
  });

  test('TST1313 - Test open file [electron,minio,s3]', async () => {
    await clickOn(getGridFileSelector(testFileName));
    await global.client.keyboard.press('Enter');
    await expectElementExist('[data-tid=detailsTabTID]', true, 5000);
  });

  test('TST1315 - Test delete file [electron,minio,s3]', async () => {
    await clickOn(getGridFileSelector(testFileName));
    if (isMac) {
      await global.client.keyboard.press('F8');
    } else {
      await global.client.keyboard.press('Delete');
    }
    await clickOn('[data-tid=confirmDeleteFileDialog]');
    await expectElementExist(getGridFileSelector(testFileName), false);
  });

  test('TST1316 - Show help and feedback panel in the left [electron,minio,s3]', async () => {
    await clickOn(getGridFileSelector('sample.txt'));
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
