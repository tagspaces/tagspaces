/*
 * Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved.
 */
import { delay, clearLocalStorage } from './hook';
import {
  createLocation,
  openLocation,
  defaultLocationPath,
  defaultLocationName,
  closeFileProperties,
  createMinioLocation
} from './location.helpers';
import { closeOpenedFile } from './general.helpers';
import { searchEngine } from './search.spec';

export const firstFile = '/span';
export const perspectiveGridTable = '//*[@data-tid="perspectiveGridFileTable"]';

describe('TST53 - Image viewer [electron, web]', () => {
  beforeEach(async () => {
    await clearLocalStorage();
    if (global.isMinio) {
      await createMinioLocation('', defaultLocationName, true);
    } else {
      await createLocation(defaultLocationPath, defaultLocationName, true);
    }
    await openLocation(defaultLocationName);
    await closeFileProperties();
  });

  it('TST5301 - Open JPG [web,electron]', async () => {
    await delay(500);
    await searchEngine('_exif');
    await delay(500);
    const file = await global.client.$(perspectiveGridTable + firstFile);
    await file.waitForDisplayed();
    await file.doubleClick();
    await delay(500);
    await closeOpenedFile();
    // TODO test for finding a text in the exif
  });

  it('TST5302 - Open BMP [web,electron]', async () => {
    await delay(500);
    await searchEngine('bmp');
    await delay(500);
    const file = await global.client.$(perspectiveGridTable + firstFile);
    await file.waitForDisplayed();
    await file.doubleClick();
    await delay(500);
    await closeOpenedFile();
  });

  it('TST5303 - Open GIF [web,electron]', async () => {
    await delay(500);
    await searchEngine('gif');
    await delay(500);
    const file = await global.client.$(perspectiveGridTable + firstFile);
    await file.waitForDisplayed();
    await file.doubleClick();
    await delay(500);
    await closeOpenedFile();
  });

  it('TST5305 - Open WEBP [web,electron]', async () => {
    await delay(500);
    await searchEngine('webp');
    await delay(500);
    const file = await global.client.$(perspectiveGridTable + firstFile);
    await file.waitForDisplayed();
    await file.doubleClick();
    await delay(500);
    await closeOpenedFile();
  });

  it('TST5306 - Open SVG [web,electron]', async () => {
    await delay(500);
    await searchEngine('svg');
    await delay(500);
    const file = await global.client.$(perspectiveGridTable + firstFile);
    await file.waitForDisplayed();
    await file.doubleClick();
    await delay(500);
    await closeOpenedFile();
  });

  it('TST5307 - Open PNG [web,electron]', async () => {
    await delay(500);
    await searchEngine('png');
    await delay(500);
    const file = await global.client.$(perspectiveGridTable + firstFile);
    await file.waitForDisplayed();
    await file.doubleClick();
    await delay(500);
    await closeOpenedFile();
  });

  it('TST5308 - Open PSD [web,electron]', async () => {
    await delay(500);
    await searchEngine('psd');
    await delay(500);
    const file = await global.client.$(perspectiveGridTable + firstFile);
    await file.waitForDisplayed();
    await file.doubleClick();
    await delay(500);
    await closeOpenedFile();
  });

  it('TST5309 - Open TIFF [web,electron]', async () => {
    await delay(500);
    await searchEngine('tiff');
    await delay(500);
    const file = await global.client.$(perspectiveGridTable + firstFile);
    await file.waitForDisplayed();
    await file.doubleClick();
    await delay(500);
    await closeOpenedFile();
    // TODO Open and close About dialog

    // const openViewerMenu = await global.client.$('#viewerMainMenuButton');
    // await openViewerMenu.waitForDisplayed();
    // await openViewerMenu.click();
    // await delay(555500);
  });
});
