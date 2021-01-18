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
import { closeOpenedFile, openCloseAboutDialog } from './general.helpers';
import { searchEngine } from './search.spec';

const title = 'About HTML Viewer';

export const firstFile = '/span';
export const perspectiveGridTable = '//*[@data-tid="perspectiveGridFileTable"]';

describe('TST65 - HTML viewer [electron]', () => {
  beforeEach(async () => {
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
    await delay(500);
    const webViewer = await global.client.$('#FileViewer');
    expect(await webViewer.isDisplayed()).toBe(true);
    await global.client.switchToFrame(webViewer);
    await openCloseAboutDialog();
    await delay(500);
    await global.client.switchToParentFrame();
    await closeOpenedFile();
  });
});
