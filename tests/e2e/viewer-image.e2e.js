/*
 * Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved.
 */
import { delay } from './hook';
import {
  createLocation,
  defaultLocationPath,
  defaultLocationName,
  closeFileProperties,
  createMinioLocation
} from './location.helpers';
import { clickOn, closeOpenedFile } from './general.helpers';
import { searchEngine } from './search.spec';

export const firstFile = '/span';
export const perspectiveGridTable = '//*[@data-tid="perspectiveGridFileTable"]';

// export async function aboutDialogExt(title, ext) {
//   await delay(500);
//   // should switch focus to iFrame
//   const switchFocus = await global.client.$('#viewer').frame(0);
//   // await global.client.waitForExist('#viewer').frame(0);
//   await switchFocus.waitForDisplayed();
//   await switchFocus.click();
//   const viewMainMenuButton = await global.client.$('#viewerMainMenuButton');
//   await viewMainMenuButton.waitForDisplayed();
//   await viewMainMenuButton.click();
//   await delay(500);
//   await global.client.waitForVisible('#aboutButton').click('#aboutButton');
//   await delay(1500);
//   const getTitle = await global.client
//     .waitForVisible('h4=' + title)
//     .getText('h4=' + title);
//   // should eventually equals('About HTML Viewer');
//   expect(getTitle).toBe(title);
//   await delay(1500);
//   await global.client
//     .waitForVisible('#closeAboutDialogButton')
//     .click('#closeAboutDialogButton');
// }

describe('TST53 - Image viewer [web,minio,electron]', () => {
  beforeEach(async () => {
    if (global.isMinio) {
      await createMinioLocation('', defaultLocationName, true);
    } else {
      await createLocation(defaultLocationPath, defaultLocationName, true);
    }
    await clickOn('[data-tid=location_' + defaultLocationName + ']');
    await closeFileProperties();
  });

  it('TST5301 - Open JPG [TST5301]', async () => {
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

  it('TST5302 - Open BMP [TST5302]', async () => {
    await delay(500);
    await searchEngine('bmp');
    await delay(500);
    const file = await global.client.$(perspectiveGridTable + firstFile);
    await file.waitForDisplayed();
    await file.doubleClick();
    await delay(500);
    await closeOpenedFile();
  });

  it('TST5303 - Open GIF [TST5303]', async () => {
    await delay(500);
    await searchEngine('gif');
    await delay(500);
    const file = await global.client.$(perspectiveGridTable + firstFile);
    await file.waitForDisplayed();
    await file.doubleClick();
    await delay(500);
    await closeOpenedFile();
  });

  it('TST5305 - Open WEBP [TST5305]', async () => {
    await delay(500);
    await searchEngine('webp');
    await delay(500);
    const file = await global.client.$(perspectiveGridTable + firstFile);
    await file.waitForDisplayed();
    await file.doubleClick();
    await delay(500);
    await closeOpenedFile();
  });

  it('TST5306 - Open SVG [TST5306]', async () => {
    await delay(500);
    await searchEngine('svg');
    await delay(500);
    const file = await global.client.$(perspectiveGridTable + firstFile);
    await file.waitForDisplayed();
    await file.doubleClick();
    await delay(500);
    await closeOpenedFile();
  });

  it('TST5307 - Open PNG [TST5307]', async () => {
    await delay(500);
    await searchEngine('png');
    await delay(500);
    const file = await global.client.$(perspectiveGridTable + firstFile);
    await file.waitForDisplayed();
    await file.doubleClick();
    await delay(500);
    await closeOpenedFile();
  });

  it('TST5308 - Open PSD [TST5308]', async () => {
    await delay(500);
    await searchEngine('psd');
    await delay(500);
    const file = await global.client.$(perspectiveGridTable + firstFile);
    await file.waitForDisplayed();
    await file.doubleClick();
    await delay(500);
    await closeOpenedFile();
  });

  it('TST5309 - Open TIFF [TST5309]', async () => {
    await delay(500);
    await searchEngine('tiff');
    await delay(500);
    const file = await global.client.$(perspectiveGridTable + firstFile);
    await file.waitForDisplayed();
    await file.doubleClick();
    await delay(500);
    await closeOpenedFile();

    // TODO Open and close About dialog

    // const openViewerMenu = await global.client('#viewerMainMenuButton');
    // await openViewerMenu.waitForDisplayed();
    // await openViewerMenu.click();
    // await delay(555500);
    // await aboutDialogExt();
  });
});
