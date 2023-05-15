/*
 * Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved.
 */

import { expect, test } from '@playwright/test';
import {
  defaultLocationPath,
  defaultLocationName,
  createPwMinioLocation,
  createPwLocation
} from './location.helpers';
import {
  clickOn,
  expectAudioPlay,
  getGridFileSelector,
  isDisplayed,
  takeScreenshot
} from './general.helpers';
import { startTestingApp, stopApp, testDataRefresh } from './hook';
import { openContextEntryMenu } from './test-utils';
import { clearDataStorage, closeWelcomePlaywright } from './welcome.helpers';

test.beforeAll(async () => {
  await startTestingApp();
  await closeWelcomePlaywright();
});

test.afterAll(async () => {
  await clearDataStorage();
  await stopApp();
  await testDataRefresh();
});
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    await takeScreenshot(testInfo);
  }
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

test.describe('TST59 - Media player', () => {
  test('TST5901 - Play ogg file [web,minio,electron]', async () => {
    await openContextEntryMenu(
      getGridFileSelector('sample.ogg'),
      'fileMenuOpenFile'
    );
    await expectAudioPlay();
  });

  test('TST5902 - Play ogv file [web,minio,electron]', async () => {
    await openContextEntryMenu(
      getGridFileSelector('sample.ogv'),
      'fileMenuOpenFile'
    );
    await expectAudioPlay();
  });

  test('TST5903 - Open and close about dialog [web,minio,electron]', async () => {
    await openContextEntryMenu(
      getGridFileSelector('sample.mp4'),
      'fileMenuOpenFile'
    );

    // Access the iframe
    const iframeElement = await global.client.waitForSelector('iframe');
    const frame = await iframeElement.contentFrame();

    // Click on the desired element within the iframe
    await frame.click('[data-tid=mediaPlayerMenuTID]');
    await frame.click('[data-tid=mediaPlayerAboutTID]');
    const aboutExists = await isDisplayed(
      '[data-tid=AboutDialogTID]',
      true,
      2000,
      frame
    );
    expect(aboutExists).toBeTruthy();

    await frame.click('[data-tid=AboutDialogOkTID]');
    const aboutNotExists = await isDisplayed(
      '[data-tid=AboutDialogTID]',
      false,
      2000,
      frame
    );
    // Expect that the element of AboutDialog not exist within the iframe
    expect(aboutNotExists).toBeTruthy();
  });

  test('TST5904 - Play mp3 [web,minio,electron]', async () => {
    await openContextEntryMenu(
      getGridFileSelector('sample.mp3'),
      'fileMenuOpenFile'
    );
    await expectAudioPlay();
  });

  /**
   * for mp4 codecs missing web on Chromium browser
   */
  test('TST5905 - Play webm [web,minio,electron]', async () => {
    await openContextEntryMenu(
      getGridFileSelector('sample.webm'),
      'fileMenuOpenFile'
    );

    await expectAudioPlay();

    // Access the iframe
    const iframeElement = await global.client.waitForSelector('iframe');
    const frame = await iframeElement.contentFrame();

    // Click on the desired element within the iframe
    await frame.click('#container');
    const playExists = await isDisplayed('[data-plyr=play]', true, 2000, frame);
    expect(playExists).toBeTruthy();
  });

  test('TST5906 - Play flac [web,minio,electron]', async () => {
    await openContextEntryMenu(
      getGridFileSelector('sample.flac'),
      'fileMenuOpenFile'
    );
    await expectAudioPlay();
  });
});
