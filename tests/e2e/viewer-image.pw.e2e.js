/*
 * Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved.
 */
import {
  createPwLocation,
  createPwMinioLocation,
  defaultLocationPath,
  defaultLocationName
} from './location.helpers';
import {
  clickOn,
  closeOpenedFile,
  expectElementExist,
  isElementDisplayed
} from './general.helpers';
import { openContextEntryMenu, toContainTID } from './test-utils';
import { startTestingApp, stopSpectronApp, testDataRefresh } from './hook';

const title = 'About HTML Viewer';

export const firstFile = '/span';
export const perspectiveGridTable = '//*[@data-tid="perspectiveGridFileTable"]';

describe('TST65 - HTML viewer [electron]', () => {
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

  it('TST5301 - Open JPG [electron]', async () => {
    if (!global.isMinio) {
      // Show in File Manager option is missing for Minio Location
      // await searchEngine('html');
      await openContextEntryMenu(
        '[data-tid="fsEntryName_sample_exif[iptc].jpg"]',
        'fileMenuOpenFile'
      );
    }
    // await closeOpenedFile();
    await expectElementExist('#FileViewer', true, 2000);
  });

  it('TST5302 - Open BMP [electron]', async () => {
    if (!global.isMinio) {
      // Show in File Manager option is missing for Minio Location
      // await searchEngine('html');
      await openContextEntryMenu(
        '[data-tid="fsEntryName_sample.bmp"]',
        'fileMenuOpenFile'
      );
    }
    await expectElementExist('#FileViewer', true, 2000);
  });

  it('TST5303 - Open GIF [electron]', async () => {
    if (!global.isMinio) {
      // Show in File Manager option is missing for Minio Location
      // await searchEngine('html');
      await openContextEntryMenu(
        '[data-tid="fsEntryName_sample.gif"]',
        'fileMenuOpenFile'
      );
    }
    await expectElementExist('#FileViewer', true, 2000);
  });

  it.skip('TST5304 - Open Animated GIF, check if plays [manual]', async () => {});

  it('TST5305 - Open W-E-B-P [electron]', async () => {
    if (!global.isMinio) {
      // Show in File Manager option is missing for Minio Location
      // await searchEngine('html');
      await openContextEntryMenu(
        '[data-tid="fsEntryName_sample.webp"]',
        'fileMenuOpenFile'
      );
    }
    await expectElementExist('#FileViewer', true, 2000);
  });

  it('TST5306 - Open SVG [electron]', async () => {
    if (!global.isMinio) {
      // Show in File Manager option is missing for Minio Location
      // await searchEngine('html');
      await openContextEntryMenu(
        '[data-tid="fsEntryName_sample.svg"]',
        'fileMenuOpenFile'
      );
    }
    await expectElementExist('#FileViewer', true, 2000);
  });

  it('TST5307 - Open PNG [electron]', async () => {
    if (!global.isMinio) {
      // Show in File Manager option is missing for Minio Location
      // await searchEngine('html');
      await openContextEntryMenu(
        '[data-tid="fsEntryName_sample.png"]',
        'fileMenuOpenFile'
      );
    }
    await expectElementExist('#FileViewer', true, 2000);
  });

  it('TST5308 - Open PSD [electron]', async () => {
    if (!global.isMinio) {
      // Show in File Manager option is missing for Minio Location
      // await searchEngine('html');
      await openContextEntryMenu(
        '[data-tid="fsEntryName_sample.psd"]',
        'fileMenuOpenFile'
      );
    }
    await expectElementExist('#FileViewer', true, 2000);
  });

  it('TST5309 - Open TIFF [electron]', async () => {
    if (!global.isMinio) {
      // Show in File Manager option is missing for Minio Location
      // await searchEngine('html');
      await openContextEntryMenu(
        '[data-tid="fsEntryName_sample.tiff"]',
        'fileMenuOpenFile'
      );
    }
    await expectElementExist('#FileViewer', true, 2000);
  });

  it.skip('TST5310 - Rotate Image Left, Right, Zoom In, Out, Reset [manual]', async () => {});

  it.skip('TST5311 - Zoom with mouse wheel [manual]', async () => {});

  it.skip('TST5312 - Zoom with touch [manual]', async () => {});

  it.skip('TST5313 - Rotate JPG according to EXIF [manual]', async () => {});

  it.skip('TST5314 - Change background colors  [manual]', async () => {});

  it.skip('TST5315 - Remove unneeded rotation css classes, reset rotation [manual]', async () => {});

  it.skip('TST5316 - Switching between Color / Black&White mode [manual]', async () => {});

  it.skip('TST5317 - Read exif data from JPG [electron]', async () => {});

  it.skip('TST5318 - Open and close about dialog [electron]', async () => {
    // TODO Open and close About dialog
    // const openViewerMenu = await global.client('#viewerMainMenuButton');
    // await openViewerMenu.waitForDisplayed();
    // await openViewerMenu.click();
    // await delay(555500);
    // await aboutDialogExt();
  });
});
