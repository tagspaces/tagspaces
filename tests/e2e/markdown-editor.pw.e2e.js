/*
 * Copyright (c) 2016-present - TagSpaces GmbH. All rights reserved.
 */
import { test, expect } from './fixtures';
import {
  defaultLocationName,
  createPwMinioLocation,
  createPwLocation,
  createS3Location,
} from './location.helpers';
import {
  clickOn,
  expectElementExist,
  expectFileContain,
  frameLocator,
  getGridFileSelector,
  isDisplayed,
  takeScreenshot,
  writeTextInIframeInput,
} from './general.helpers';
import { startTestingApp, stopApp } from './hook';
import { openContextEntryMenu, toContainTID } from './test-utils';
import { clearDataStorage, closeWelcomePlaywright } from './welcome.helpers';
import { dataTidFormat } from '../../src/renderer/services/test';

test.beforeAll(async ({ isWeb, isS3, webServerPort }, testInfo) => {
  await startTestingApp({ isWeb, isS3, webServerPort, testInfo });
  // await clearDataStorage();
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
  await closeWelcomePlaywright();
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

test.describe('TST69 - Markdown editor', () => {
  test('TST6901 - Open and render md file [web,minio,s3,electron]', async () => {
    await openContextEntryMenu(
      getGridFileSelector('sample.md'),
      'fileMenuOpenFile',
    );
    await expect
      .poll(
        async () => {
          const fLocator = await frameLocator();
          const bodyTxt = await fLocator.locator('body').innerText();
          return toContainTID(bodyTxt);
        },
        {
          message: 'make sure bodyTxt contain etete&5435', // custom error message
          // Poll for 10 seconds; defaults to 5 seconds. Pass 0 to disable timeout.
          timeout: 10000,
        },
      )
      .toBe(true);
  });

  test('TST6902 - Open settings [web,minio,s3,electron]', async () => {
    await openContextEntryMenu(
      getGridFileSelector('sample.md'),
      'fileMenuOpenFile',
    );
    await clickOn('[data-tid=fileContainerEditFile]');
    // Access the iframe
    const iframeElement = await global.client.waitForSelector('iframe');
    const frame = await iframeElement.contentFrame();

    await frame.click('[data-tid=mainMenuTID]');
    await frame.click('[data-tid=settingsIDTID]');

    let settingsExists = await isDisplayed(
      '#md-editor-settings-title',
      true,
      2000,
      frame,
    );
    expect(settingsExists).toBeTruthy();

    await frame.click('[data-tid=settingsOkTID]');

    settingsExists = await isDisplayed(
      '#md-editor-settings-title',
      false,
      2000,
      frame,
    );
    expect(settingsExists).toBeTruthy();
  });

  test('TST6903 - Save text [web,s3,electron]', async () => {
    // open fileProperties
    const fileName = 'sample.md';
    const newFileContent = 'etete&5435_new_text_saved';
    await clickOn(getGridFileSelector(fileName));
    await expectElementExist(
      '[data-tid=OpenedTID' + dataTidFormat(fileName) + ']',
      true,
      8000,
    );
    await clickOn('[data-tid=fileContainerEditFile]');
    await writeTextInIframeInput(
      newFileContent,
      '.milkdown div[contenteditable=true]',
    );
    await clickOn('[data-tid=fileContainerSaveFile]');
    await clickOn('[data-tid=cancelEditingTID]');
    await clickOn('[data-tid=propsActionsMenuTID]');
    await clickOn('[data-tid=reloadPropertiesTID]');
    await expectFileContain(newFileContent, 10000);
  });
});
