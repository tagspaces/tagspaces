/*
 * Copyright (c) 2016-present - TagSpaces GmbH. All rights reserved.
 */

import { test, expect } from './fixtures';
import {
  defaultLocationPath,
  defaultLocationName,
  createPwMinioLocation,
  createPwLocation,
  createS3Location,
} from './location.helpers';
import {
  clickOn,
  expectElementExist,
  expectMediaPlay,
  getGridFileSelector,
  isDisplayed,
} from './general.helpers';
import { startTestingApp, stopApp, testDataRefresh } from './hook';
import { openContextEntryMenu } from './test-utils';
import { clearDataStorage, closeWelcomePlaywright } from './welcome.helpers';
import { stopServices } from '../setup-functions';

let s3ServerInstance;
let webServerInstance;
let minioServerInstance;

test.beforeAll(async ({ isWeb, isS3, s3Server, webServer, minioServer }) => {
  s3ServerInstance = s3Server;
  webServerInstance = webServer;
  minioServerInstance = minioServer;

  await startTestingApp({ isWeb, isS3 });
  await closeWelcomePlaywright();
});

test.afterAll(async () => {
  await stopServices(s3ServerInstance, webServerInstance, minioServerInstance);
  await testDataRefresh(s3ServerInstance);
  await clearDataStorage();
  await stopApp();
});
/*test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    await takeScreenshot(testInfo);
  }
});*/
test.beforeEach(async ({ isMinio, isS3 }) => {
  if (isMinio) {
    await createPwMinioLocation('', defaultLocationName, true);
  } else if (isS3) {
    await createS3Location('', defaultLocationName, true);
  } else {
    await createPwLocation(defaultLocationPath, defaultLocationName, true);
  }
  await clickOn('[data-tid=location_' + defaultLocationName + ']');
  await expectElementExist(getGridFileSelector('empty_folder'), true, 8000);
  // If its have opened file
  // await closeFileProperties();
});

test.describe('TST59 - Media player', () => {
  test('TST5901 - Play ogg file [web,minio,electron]', async () => {
    await openContextEntryMenu(
      getGridFileSelector('sample.ogg'),
      'fileMenuOpenFile',
    );
    await expectMediaPlay(false);
  });

  /**
   * http://localhost:63342/test-artifacts/playwright-report/trace/manifest.webmanifest?_ijt=eojod6f91jej1donf3vd1jp8ju
   */
  test('TST5902 - Play ogv file [web,minio,electron]', async ({ isWin }) => {
    if (!isWin) {
      await openContextEntryMenu(
        getGridFileSelector('sample.ogv'),
        'fileMenuOpenFile',
      );
      await expectMediaPlay();
    }
  });

  test('TST5903 - Open and close about dialog [web,minio,electron]', async () => {
    await openContextEntryMenu(
      getGridFileSelector('sample.mp4'),
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

  test('TST5904 - Play mp3 [web,minio,electron]', async () => {
    await openContextEntryMenu(
      getGridFileSelector('sample.mp3'),
      'fileMenuOpenFile',
    );
    await expectMediaPlay(false);
  });

  /**
   * for mp4 codecs missing web on Chromium browser
   */
  test('TST5905 - Play webm [web,minio,electron]', async () => {
    await openContextEntryMenu(
      getGridFileSelector('sample.webm'),
      'fileMenuOpenFile',
    );

    await expectMediaPlay(false);

    // Access the iframe
    /*const iframeElement = await global.client.waitForSelector('iframe');
    const frame = await iframeElement.contentFrame();

    // Click on the desired element within the iframe
    await frame.click('#container');
    const playExists = await isDisplayed('[data-plyr=play]', true, 2000, frame);
    expect(playExists).toBeTruthy();*/
  });

  test('TST5906 - Play flac [web,minio,electron]', async () => {
    await openContextEntryMenu(
      getGridFileSelector('sample.flac'),
      'fileMenuOpenFile',
    );
    await expectMediaPlay(false);
  });

  test('TST5911 - Play 3gp [web,minio,electron]', async () => {
    /*await clickOn('[data-tid=settings]');
    await clickOn('[data-tid=fileTypeSettingsDialog]');
    const selectEl = global.client.locator('[data-tid=viewerTIDgif]');
    await selectEl.evaluate(node => node.scrollIntoView());
   // await selectEl.scrollIntoViewIfNeeded();
    await clickOn('[data-tid=viewerTIDgif]');
    await clickOn('[data-tid=Media_PlayerviewerTIDgif]');
    await clickOn('[data-tid=closeSettingsDialog]');*/

    await openContextEntryMenu(
      getGridFileSelector('sample.3gp'),
      'fileMenuOpenFile',
    );
    await expectMediaPlay(false);
  });
});
