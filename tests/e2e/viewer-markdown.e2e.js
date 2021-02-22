/*
 * Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved.
 */
import { delay } from './hook';
import {
  createLocation,
  openLocation,
  defaultLocationPath,
  defaultLocationName,
  closeFileProperties,
  createMinioLocation
} from './location.helpers';
import { closeOpenedFile } from './general.helpers';
import { searchEngine } from './search.helpers';

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

describe('TST54 - Markdown viewer [electron]', () => {
  beforeEach(async () => {
    if (global.isMinio) {
      await createMinioLocation('', defaultLocationName, true);
    } else {
      await createLocation(defaultLocationPath, defaultLocationName, true);
    }
    await openLocation(defaultLocationName);
    await closeFileProperties();
  });

  it('TST5401 - Open MD [electron]', async () => {
    await delay(500);
    await searchEngine('md');
    await delay(500);
    const file = await global.client.$(perspectiveGridTable + firstFile);
    await file.waitForDisplayed();
    await file.doubleClick();
    await delay(500);
    await closeOpenedFile();
  });

  it.skip('TST5402 - Test opening of links [Electron, manual]', async () => {});

  it.skip('TST5403 - Find in document [Electron, manual]', async () => {});

  it.skip('TST5404 - Change zoom [Electron, manual]', async () => {});

  it.skip('TST5405 - Change theme [Electron, manual]', async () => {});

  it.skip('TST5406 - Show print dialog [Electron, manual]', async () => {});

  it.skip('TST5407 - Open and close about dialog [Electron]', async () => {});

  it.skip('TST5408 - Testing embedding local content like images [Electron, manual]', async () => {});
});
