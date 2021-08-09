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

  it('TST6501 - Open HTML [electron]', async () => {
    if (!global.isMinio) {
      // Show in File Manager option is missing for Minio Location
      // await searchEngine('html');
      await openContextEntryMenu(
        '[data-tid="fsEntryName_sample.html"]',
        'fileMenuOpenFile'
      );
    }
    // await closeOpenedFile();
    await expectElementExist('#FileViewer', true, 2000);
    const webViewer = await global.client.$('#FileViewer');
    const iframe = await webViewer.contentFrame();
    const iframeBody = await iframe.$('body');
    await isElementDisplayed(iframeBody);
    const bodyTxt = await iframeBody.innerText();
    const containTID = toContainTID(bodyTxt);
    if (!containTID) {
      console.debug('no containTID in:' + bodyTxt);
    }
    expect(containTID).toBe(true);
  });

  it('TST6502 - Open HTML in reader mode [electron]', async () => {
    // await searchEngine('html');
    // const file = await global.client.$(perspectiveGridTable + firstFile);
    // await file.waitForDisplayed();
    // await file.doubleClick();
    // const webViewer = await global.client.$('#FileViewer');
    // expect(await webViewer.isDisplayed()).toBe(true);
    // await global.client.switchToFrame(webViewer);
    // // const iframeBody = await global.client.$('body');
    // // const bodyTxt = await iframeBody.getText();
    // // await global.client.switchToParentFrame();
    // // expect(toContainTID(bodyTxt)).toBe(true);
    // // const editFile = await global.client.$('data-tid=fileContainerEditFile');
    // // await editFile.waitForDisplayed();
    // // await editFile.doubleClick();
    // await global.client.switchToParentFrame();
    // await closeOpenedFile();
  });
  // it('TST6503 - Open about dialog [electron]', async () => {
  //   await delay(500);
  //   await searchEngine('html');
  //   await delay(500);
  //   const file = await global.client.$(perspectiveGridTable + firstFile);
  //   await file.waitForDisplayed();
  //   await file.doubleClick();
  //   await delay(500);
  //   const webViewer = await global.client.$('#FileViewer');
  //   expect(await webViewer.isDisplayed()).toBe(true);
  //   await global.client.switchToFrame(webViewer);
  //   await openCloseAboutDialog();
  //   await delay(500);
  //   await global.client.switchToParentFrame();
  //   await closeOpenedFile();
  // });

  it.skip('TST6504 - Open source url [manual]', async () => {});

  it.skip('TST6505 - Find in document [manual]', async () => {});

  it.skip('TST6506 - Change theme [manual]', async () => {});

  it.skip('TST6507 - Open print dialog [manual]', async () => {});

  it.skip('TST6508 - Testing embedding local content like images [manual]', async () => {});
});
