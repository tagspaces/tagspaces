/*
 * Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved.
 */
import {
  defaultLocationPath,
  defaultLocationName,
  createPwMinioLocation,
  createPwLocation
} from './location.helpers';
import { clickOn, isDisplayed } from './general.helpers';
import { startTestingApp, stopSpectronApp, testDataRefresh } from './hook';
import { openContextEntryMenu, toContainTID } from './test-utils';

describe('TST59 - Media player', () => {
  beforeAll(async () => {
    await startTestingApp();
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

  test('TST5903 - Open and close about dialog [web,minio,electron]', async () => {
    await openContextEntryMenu(
      '[data-tid="fsEntryName_sample.mp4"]',
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

  test('TST5905 - Play mp4 [web,minio,electron]', async () => {
    await openContextEntryMenu(
      '[data-tid="fsEntryName_sample.mp4"]',
      'fileMenuOpenFile'
    );

    // Access the iframe
    const iframeElement = await global.client.waitForSelector('iframe');
    const frame = await iframeElement.contentFrame();

    // Click on the desired element within the iframe
    await frame.click('#container');
    const playExists = await isDisplayed('[data-plyr=play]', true, 2000, frame);
    expect(playExists).toBeTruthy();
  });
});
