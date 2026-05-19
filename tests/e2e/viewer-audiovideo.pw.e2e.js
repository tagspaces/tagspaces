/*
 * Copyright (c) 2016-present - TagSpaces GmbH. All rights reserved.
 */

import { expect, test } from './fixtures';
import {
  clickOn,
  expectElementExist,
  expectMediaPlay,
  getGridFileSelector,
  isDisplayed,
} from './general.helpers';
import { startTestingApp, stopApp } from './hook';
import {
  createPwLocation,
  createS3Location,
  defaultLocationName,
} from './location.helpers';
import { openContextEntryMenu } from './test-utils';
import { clearDataStorage, closeWelcomePlaywright } from './welcome.helpers';

test.beforeAll(async ({ isWeb, isS3, webServerPort }, testInfo) => {
  await startTestingApp({ isWeb, isS3, webServerPort, testInfo });
  await closeWelcomePlaywright();
});

test.afterAll(async () => {
  await clearDataStorage();
  await stopApp();
});

test.beforeEach(async ({ isS3, testDataDir }) => {
  if (isS3) {
    await createS3Location('', defaultLocationName, true);
  } else {
    await createPwLocation(testDataDir, defaultLocationName, true);
  }
  await clickOn('[data-tid=location_' + defaultLocationName + ']');
  await expectElementExist(getGridFileSelector('empty_folder'), true, 15000);
  // If its have opened file
  // await closeFileProperties();
});

test.describe('TST59 - Media player', () => {
  test('TST5901 - Play ogg file [web,s3,electron]', async () => {
    await openContextEntryMenu(
      getGridFileSelector('sample.ogg'),
      'fileMenuOpenFile',
    );
    await expectMediaPlay(false);
  });

  test('TST5902 - Play webm file [web,s3,electron]', async ({ isWeb }) => {
    // Smoke test for the media-player (Vidstack) extension: opening a video
    // file mounts the player with the correct source. This is intentionally
    // NOT a decode/seek assertion — the player lazy-loads (load="visible" +
    // preload="metadata") and a headless/offscreen CI Electron window never
    // reaches HAVE_METADATA, so video.duration is NaN for every codec
    // (ogv/mp4/webm alike). sample.webm is used because it is small and
    // royalty-free; the assertion lives in expectMediaPlay().
    await openContextEntryMenu(
      getGridFileSelector('sample.webm'),
      'fileMenuOpenFile',
    );
    await expectMediaPlay(!isWeb, 'sample.webm');
  });

  test('TST5903 - Open and close about dialog [web,s3,electron]', async () => {
    await openContextEntryMenu(
      getGridFileSelector('sample.ogv'),
      'fileMenuOpenFile',
    );
    await expectElementExist('iframe', true, 8000);
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
      frame,
    );
    expect(aboutExists).toBeTruthy();

    await frame.click('[data-tid=AboutDialogOkTID]');
    const aboutNotExists = await isDisplayed(
      '[data-tid=AboutDialogTID]',
      false,
      2000,
      frame,
    );
    // Expect that the element of AboutDialog not exist within the iframe
    expect(aboutNotExists).toBeTruthy();
  });

  test('TST5904 - Play mp3 [web,s3,electron]', async () => {
    await openContextEntryMenu(
      getGridFileSelector('sample.mp3'),
      'fileMenuOpenFile',
    );
    await expectMediaPlay(false);
  });

  test('TST5906 - Play flac [web,s3,electron]', async () => {
    await openContextEntryMenu(
      getGridFileSelector('sample.flac'),
      'fileMenuOpenFile',
    );
    await expectMediaPlay(false);
  });

});
