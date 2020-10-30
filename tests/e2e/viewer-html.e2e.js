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
  createMinioLocation,
  aboutDialogExt
} from './location.helpers';
import { closeOpenedFile } from './general.helpers';
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

describe('TST65 - HTML viewer [electron]', () => {
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

  it('TST6501 - Open HTML [electron]', async () => {
    await delay(500);
    await searchEngine('html');
    await delay(500);
    const file = await global.client.$(perspectiveGridTable + firstFile);
    await file.waitForDisplayed();
    await file.doubleClick();
    await delay(500);
    await closeOpenedFile();
  });

  it('TST6502 - Open HTML in reader mode [electron]', async () => {
    await delay(500);
    await searchEngine('html');
    await delay(500);
    const file = await global.client.$(perspectiveGridTable + firstFile);
    await file.waitForDisplayed();
    await file.doubleClick();
    await delay(1500);
    const webViewer = await global.client.$('#FileViewer');
    //await delay(500);
    expect(await webViewer.isDisplayed()).toBe(true);
    await global.client.switchToFrame(webViewer);
    await delay(500);
    // const iframeBody = await global.client.$('body');
    // const bodyTxt = await iframeBody.getText();
    // await global.client.switchToParentFrame();
    // expect(toContainTID(bodyTxt)).toBe(true);
    // const editFile = await global.client.$('data-tid=fileContainerEditFile');
    // await editFile.waitForDisplayed();
    // await editFile.doubleClick();
    await global.client.switchToParentFrame();
    await closeOpenedFile();
  });
  it('TST6503 - Open about dialog [electron]', async () => {
    await delay(500);
    await searchEngine('html');
    await delay(500);
    const file = await global.client.$(perspectiveGridTable + firstFile);
    await file.waitForDisplayed();
    await file.doubleClick();
    await delay(1500);
    const webViewer = await global.client.$('#FileViewer');
    //await delay(500);
    expect(await webViewer.isDisplayed()).toBe(true);
    await global.client.switchToFrame(webViewer);
    await delay(500);
    const viewMainMenuButton = await global.client.$('#viewerMainMenuButton');
    await viewMainMenuButton.waitForDisplayed();
    await viewMainMenuButton.click();
    await delay(1500);
    const aboutButton = await global.client.$('#aboutButton');
    await aboutButton.waitForDisplayed();
    await aboutButton.click();
    await delay(5500);
    const closeAboutDialogButton = await global.client.$(
      '#closeAboutDialogButton'
    );
    await closeAboutDialogButton.waitForDisplayed();
    await closeAboutDialogButton.click();
    await delay(500);
    await global.client.switchToParentFrame();
    await closeOpenedFile();
  });
});
