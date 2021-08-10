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

  it('TST5401 - Open MD [electron]', async () => {
    if (!global.isMinio) {
      // Show in File Manager option is missing for Minio Location
      // await searchEngine('html');
      await openContextEntryMenu(
        '[data-tid="fsEntryName_sample.md"]',
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

  it.skip('TST5402 - Test opening of links [manual]', async () => {});

  it.skip('TST5403 - Find in document [manual]', async () => {});

  it.skip('TST5404 - Change zoom [manual]', async () => {});

  it.skip('TST5405 - Change theme [manual]', async () => {});

  it.skip('TST5406 - Show print dialog [manual]', async () => {});

  it.skip('TST5407 - Open and close about dialog [electron]', async () => {});

  it.skip('TST5408 - Testing embedding local content like images [manual]', async () => {});
});
