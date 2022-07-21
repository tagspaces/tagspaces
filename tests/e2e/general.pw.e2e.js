/*
 * Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved.
 */
import {
  defaultLocationPath,
  defaultLocationName,
  createPwMinioLocation,
  createPwLocation
} from './location.helpers';
import {
  reloadDirectory,
  tsFolder,
  createNewDirectory,
  newHTMLFile,
  newMDFile,
  closeOpenedFile,
  deleteDirectory,
  clickOn,
  expectElementExist,
  selectorFile,
  setSettings,
  takeScreenshot,
  createTxtFile
} from './general.helpers';
import { searchEngine } from './search.helpers';
import { startTestingApp, stopSpectronApp, testDataRefresh } from './hook';

export const firstFile = '/span';
export const perspectiveGridTable = '//*[@data-tid="perspectiveGridFileTable"]';
const subFolderName = '/test-perspective-grid';
const subFolderContentExtractionPath =
  defaultLocationPath + '/content-extraction';
const subFolderThumbnailsPath = defaultLocationPath + '/thumbnails';
const testFolder = 'testFolder';

describe('TST51 - Perspective Grid', () => {
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

  it('TST0501 - Create HTML file [electron,web]', async () => {
    await global.client.waitForLoadState('networkidle');
    await createNewDirectory();
    await expectElementExist(
      '[data-tid=fsEntryName_' + testFolder + ']',
      true,
      2000
    );
    await global.client.dblclick('[data-tid=fsEntryName_' + testFolder + ']');
    // create new file
    await newHTMLFile();
    await closeOpenedFile();
    // await reloadDirectory();
    await expectElementExist(selectorFile, true);

    // delete directory
    await deleteDirectory(testFolder);

    await expectElementExist(
      '[data-tid=fsEntryName_' + testFolder + ']',
      false,
      2000
    );
    await takeScreenshot('TST0501 after deleteDirectory');
  });

  it('TST0502 - Create MD file [electron,web]', async () => {
    await createNewDirectory();
    await expectElementExist(
      '[data-tid=fsEntryName_' + testFolder + ']',
      true,
      2000
    );
    await global.client.dblclick('[data-tid=fsEntryName_' + testFolder + ']');

    // create new file
    await newMDFile();
    await closeOpenedFile();
    // await reloadDirectory();
    await expectElementExist(selectorFile, true);

    // await deleteFirstFile();
    await deleteDirectory(testFolder);
    await expectElementExist(
      '[data-tid=fsEntryName_' + testFolder + ']',
      false,
      2000
    );
    await takeScreenshot('TST0502 after deleteDirectory');
  });

  it('TST0503 - Create TEXT file [electron,web]', async () => {
    await takeScreenshot('TST0503 start test');
    await createNewDirectory();
    await expectElementExist(
      '[data-tid=fsEntryName_' + testFolder + ']',
      true,
      2000
    );
    await takeScreenshot('TST0503 create folder');
    await global.client.dblclick('[data-tid=fsEntryName_' + testFolder + ']');

    // create new file
    await createTxtFile();
    await closeOpenedFile();
    // await reloadDirectory();
    await expectElementExist(selectorFile, true);

    // await deleteFirstFile();
    await deleteDirectory(testFolder);
    await expectElementExist(
      '[data-tid=fsEntryName_' + testFolder + ']',
      false,
      2000
    );
    await takeScreenshot('TST0503 after deleteDirectory');
  });

  it('TST0510 - Generate thumbnail from Images', async () => {
    // let filename = 'sample.jpg';
    // activate 'Show Hidden File' functionality in the general settings
    await setSettings('[data-tid=settingsSetShowUnixHiddenEntries]');
    await reloadDirectory();
    await global.client.dblclick('[data-tid=fsEntryName_' + tsFolder + ']');

    await searchEngine('jpg');
    // await openEntry('sample.jpg');
    // await openFile();
    await global.client.dblclick(perspectiveGridTable + firstFile);
    await closeOpenedFile();
    //TODO expect
    // const file = await global.client.$(
    //   perspectiveGridTable + firstFile
    // );
    // expect(file).toBe(filename);
  });

  it('TST0511 - Generate thumbnail from Videos', async () => {
    // activate 'Show Hidden File' functionality in the general settings
    await setSettings('[data-tid=settingsSetShowUnixHiddenEntries]');
    await reloadDirectory();
    await global.client.dblclick('[data-tid=fsEntryName_' + tsFolder + ']');

    await searchEngine('mp4');
    await global.client.dblclick(perspectiveGridTable + firstFile);
    await closeOpenedFile();
    //TODO expect
  });

  it('TST0516 - Generate thumbnail from PDF', async () => {
    // activate 'Show Hidden File' functionality in the general settings
    await setSettings('[data-tid=settingsSetShowUnixHiddenEntries]');
    await reloadDirectory();
    await global.client.dblclick('[data-tid=fsEntryName_' + tsFolder + ']');

    await searchEngine('pdf');
    await global.client.dblclick(perspectiveGridTable + firstFile);
    await closeOpenedFile();
    //TODO expect
  });

  it('TST0517 - Generate thumbnail from ODT', async () => {
    // activate 'Show Hidden File' functionality in the general settings
    await setSettings('[data-tid=settingsSetShowUnixHiddenEntries]');

    await reloadDirectory();

    await global.client.dblclick('[data-tid=fsEntryName_' + tsFolder + ']');

    await searchEngine('odt');
    await global.client.dblclick(perspectiveGridTable + firstFile);
    await closeOpenedFile();
    //TODO expect
  });

  it('TST0519 - Generate thumbnail from TIFF', async () => {
    // activate 'Show Hidden File' functionality in the general settings
    await setSettings('[data-tid=settingsSetShowUnixHiddenEntries]');

    await reloadDirectory();

    await global.client.dblclick('[data-tid=fsEntryName_' + tsFolder + ']');

    await searchEngine('tiff');
    // await openEntry('sample.jpg');
    // await openFile();
    await global.client.dblclick(perspectiveGridTable + firstFile);
    await closeOpenedFile();
    //TODO expect
  });

  it('TST0520 - Generate thumbnail from PSD', async () => {
    // activate 'Show Hidden File' functionality in the general settings
    await setSettings('[data-tid=settingsSetShowUnixHiddenEntries]');

    await reloadDirectory();

    await global.client.dblclick('[data-tid=fsEntryName_' + tsFolder + ']');

    await searchEngine('psd');
    // await openEntry('sample.jpg');
    // await openFile();
    await global.client.dblclick(perspectiveGridTable + firstFile);
    await closeOpenedFile();
    //TODO expect
  });

  it('TST0524 - Generate thumbnail from TXT', async () => {
    // activate 'Show Hidden File' functionality in the general settings
    await setSettings('[data-tid=settingsSetShowUnixHiddenEntries]');

    await reloadDirectory();

    await global.client.dblclick('[data-tid=fsEntryName_' + tsFolder + ']');

    await searchEngine('txt');
    // await openEntry('sample.jpg');
    // await openFile();
    await global.client.dblclick(perspectiveGridTable + firstFile);
    await closeOpenedFile();
    //TODO expect
  });

  it('TST0523 - Generate thumbnail from HTML', async () => {
    // activate 'Show Hidden File' functionality in the general settings
    await setSettings('[data-tid=settingsSetShowUnixHiddenEntries]');

    await reloadDirectory();

    await global.client.dblclick('[data-tid=fsEntryName_' + tsFolder + ']');

    await searchEngine('html');
    // await openEntry('sample.jpg');
    // await openFile();
    await global.client.dblclick(perspectiveGridTable + firstFile);
    await closeOpenedFile();
    //TODO expect
  });

  it('TST0522 - Generate thumbnail from URL', async () => {
    // activate 'Show Hidden File' functionality in the general settings
    await setSettings('[data-tid=settingsSetShowUnixHiddenEntries]');

    await reloadDirectory();

    await global.client.dblclick('[data-tid=fsEntryName_' + tsFolder + ']');

    await searchEngine('url');
    // await openEntry('sample.jpg');
    // await openFile();
    await global.client.dblclick(perspectiveGridTable + firstFile);
    await closeOpenedFile();
    //TODO expect
  });
});
