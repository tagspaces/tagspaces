/*
 * Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved.
 */
import { delay, clearLocalStorage } from './hook';
import {
  createLocation,
  defaultLocationPath,
  defaultLocationName,
  closeFileProperties,
  createMinioLocation
} from './location.helpers';
import {
  reloadDirectory,
  openEntry,
  tsFolder,
  createNewDirectory,
  newHTMLFile,
  newMDFile,
  newTEXTFile,
  closeOpenedFile,
  deleteDirectory,
  returnDirectoryBack,
  clickOn,
  expectElementExist,
  selectorFile,
  settingsSetShowUnixHiddenEntries,
  doubleClickOn
} from './general.helpers';
import { searchEngine } from './search.spec';

export const firstFile = '/span';
export const perspectiveGridTable = '//*[@data-tid="perspectiveGridFileTable"]';
const subFolderName = '/test-perspective-grid';
const subFolderContentExtractionPath =
  defaultLocationPath + '/content-extraction';
const subFolderThumbnailsPath = defaultLocationPath + '/thumbnails';
const testFolder = 'testFolder';

describe('TST51 - Perspective Grid [general]', () => {
  beforeEach(async () => {
    // await clearLocalStorage();
    //  await delay(500);
    //await closeWelcome();
    //await delay(500);
    if (global.isMinio) {
      await createMinioLocation('', defaultLocationName, true);
    } else {
      await createLocation(defaultLocationPath, defaultLocationName, true);
    }
    // openLocation
    await clickOn('[data-tid=location_' + defaultLocationName + ']');
    // If its have opened file
    await closeFileProperties();
  });

  it('TST0501 - Create HTML file [electron]', async () => {
    await createNewDirectory();
    await reloadDirectory();
    await global.client.pause(500);
    await openEntry(testFolder);

    await createNewDirectory();
    await reloadDirectory();
    await global.client.pause(500);
    await openEntry(testFolder);
    // create new file
    await newHTMLFile();
    await closeOpenedFile();
    await reloadDirectory();
    await expectElementExist(selectorFile, true);
    await global.client.pause(500);
    await returnDirectoryBack();
    // delete directory
    await global.client.pause(500);
    await deleteDirectory(testFolder);
    //    await returnDirectoryBack();
    await expectElementExist(
      '[data-tid=fsEntryName_' + testFolder + ']',
      false
    );
  });

  it('TST0502 - Create MD file [electron]', async () => {
    await createNewDirectory();
    await reloadDirectory();
    await global.client.pause(500);
    await openEntry(testFolder);

    // create new file
    await newMDFile();
    await closeOpenedFile();
    await reloadDirectory();
    await expectElementExist(selectorFile, true);
    await global.client.pause(500);

    // delete directory
    await deleteDirectory(testFolder);
    await expectElementExist(
      '[data-tid=fsEntryName_' + testFolder + ']',
      false
    );
  });

  it('TST0502 - Create TEXT file [electron]', async () => {
    await createNewDirectory();
    await reloadDirectory();
    await global.client.pause(500);
    await openEntry(testFolder);

    // create new file
    await newTEXTFile();
    await closeOpenedFile();
    await reloadDirectory();
    await expectElementExist(selectorFile, true);
    await global.client.pause(500);

    // delete directory
    await deleteDirectory(testFolder);
    await expectElementExist(
      '[data-tid=fsEntryName_' + testFolder + ']',
      false
    );
  });

  it('TST0510 - Generate thumbnail from Images [electron]', async () => {
    // let filename = 'sample.jpg';
    // activate 'Show Hidden File' functionality in the general settings
    await settingsSetShowUnixHiddenEntries();
    await global.client.pause(500);
    await reloadDirectory();
    await global.client.pause(500);
    await openEntry(tsFolder);

    await searchEngine('jpg');
    // await openEntry('sample.jpg');
    // await openFile();
    await doubleClickOn(perspectiveGridTable + firstFile);
    await closeOpenedFile();
    //TODO expect
    // const file = await global.client.$(
    //   perspectiveGridTable + firstFile
    // );
    // expect(file).toBe(filename);
  });

  it('TST0511 - Generate thumbnail from Videos [electron]', async () => {
    // activate 'Show Hidden File' functionality in the general settings
    await settingsSetShowUnixHiddenEntries();
    await global.client.pause(500);
    await reloadDirectory();
    await global.client.pause(500);
    await openEntry(tsFolder);

    await searchEngine('mp4');
    await doubleClickOn(perspectiveGridTable + firstFile);
    await closeOpenedFile();
    //TODO expect
  });

  it('TST0516 - Generate thumbnail from PDF [electron]', async () => {
    // activate 'Show Hidden File' functionality in the general settings
    await settingsSetShowUnixHiddenEntries();
    await global.client.pause(500);
    await reloadDirectory();
    await global.client.pause(500);
    await openEntry(tsFolder);

    await searchEngine('pdf');
    await doubleClickOn(perspectiveGridTable + firstFile);
    await closeOpenedFile();
    //TODO expect
  });

  it('TST0517 - Generate thumbnail from ODT [electron]', async () => {
    // activate 'Show Hidden File' functionality in the general settings
    await settingsSetShowUnixHiddenEntries();
    await global.client.pause(500);
    await reloadDirectory();
    await global.client.pause(500);
    await openEntry(tsFolder);

    await searchEngine('odt');
    await doubleClickOn(perspectiveGridTable + firstFile);
    await closeOpenedFile();
    //TODO expect
  });

  it('TST0519 - Generate thumbnail from TIFF [electron]', async () => {
    // activate 'Show Hidden File' functionality in the general settings
    await settingsSetShowUnixHiddenEntries();
    await global.client.pause(500);
    await reloadDirectory();
    await global.client.pause(500);
    await openEntry(tsFolder);

    await searchEngine('tiff');
    // await openEntry('sample.jpg');
    // await openFile();
    await doubleClickOn(perspectiveGridTable + firstFile);
    await closeOpenedFile();
    //TODO expect
  });

  it('TST0520 - Generate thumbnail from PSD [electron]', async () => {
    // activate 'Show Hidden File' functionality in the general settings
    await settingsSetShowUnixHiddenEntries();
    await global.client.pause(500);
    await reloadDirectory();
    await global.client.pause(500);
    await openEntry(tsFolder);

    await searchEngine('psd');
    // await openEntry('sample.jpg');
    // await openFile();
    await doubleClickOn(perspectiveGridTable + firstFile);
    await closeOpenedFile();
    //TODO expect
  });

  it('TST0524 - Generate thumbnail from TXT [electron]', async () => {
    // activate 'Show Hidden File' functionality in the general settings
    await settingsSetShowUnixHiddenEntries();
    await global.client.pause(500);
    await reloadDirectory();
    await global.client.pause(500);
    await openEntry(tsFolder);

    await searchEngine('txt');
    // await openEntry('sample.jpg');
    // await openFile();
    await doubleClickOn(perspectiveGridTable + firstFile);
    await closeOpenedFile();
    //TODO expect
  });

  it('TST0523 - Generate thumbnail from HTML [electron]', async () => {
    // activate 'Show Hidden File' functionality in the general settings
    await settingsSetShowUnixHiddenEntries();
    await global.client.pause(500);
    await reloadDirectory();
    await global.client.pause(500);
    await openEntry(tsFolder);

    await searchEngine('html');
    // await openEntry('sample.jpg');
    // await openFile();
    await doubleClickOn(perspectiveGridTable + firstFile);
    await closeOpenedFile();
    //TODO expect
  });

  it('TST0522 - Generate thumbnail from URL [electron]', async () => {
    // activate 'Show Hidden File' functionality in the general settings
    await settingsSetShowUnixHiddenEntries();
    await global.client.pause(500);
    await reloadDirectory();
    await global.client.pause(500);
    await openEntry(tsFolder);

    await searchEngine('url');
    // await openEntry('sample.jpg');
    // await openFile();
    await doubleClickOn(perspectiveGridTable + firstFile);
    await closeOpenedFile();
    //TODO expect
  });
});
