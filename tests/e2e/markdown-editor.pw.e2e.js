/*
 * Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved.
 */
import { test, expect } from '@playwright/test';
import {
  defaultLocationPath,
  defaultLocationName,
  createPwMinioLocation,
  createPwLocation
} from './location.helpers';
import { clickOn, frameLocator, isDisplayed } from './general.helpers';
import { startTestingApp, stopApp, testDataRefresh } from './hook';
import { openContextEntryMenu, toContainTID } from './test-utils';
import { init } from './welcome.helpers';

test.beforeAll(async () => {
  await startTestingApp();
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

test.describe('TST69 - Markdown editor', () => {
  test('TST6901 - Open and render md file [web,minio,electron]', async () => {
    await openContextEntryMenu(
      '[data-tid="fsEntryName_sample.md"]',
      'fileMenuOpenFile'
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
          timeout: 10000
        }
      )
      .toBe(true);
  });

  test('TST6902 - Open settings [web,minio,electron]', async () => {
    await openContextEntryMenu(
      '[data-tid="fsEntryName_sample.md"]',
      'fileMenuOpenFile'
    );

    // Access the iframe
    const iframeElement = await global.client.waitForSelector('iframe');
    const frame = await iframeElement.contentFrame();

    await frame.click('[data-tid=mdEditorMenuTID]');
    await frame.click('[data-tid=settingsTID]');

    let settingsExists = await isDisplayed(
      '#settings-dialog-title',
      true,
      2000,
      frame
    );
    expect(settingsExists).toBeTruthy();

    await frame.click('[data-tid=settingsOkTID]');

    settingsExists = await isDisplayed(
      '#settings-dialog-title',
      false,
      2000,
      frame
    );
    expect(settingsExists).toBeTruthy();
  });
});
