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
import {
  openSettingsDialog,
  closeSettingsDialog,
  reloadDirectory,
  openEntry,
  tsFolder,
  openDirectoryMenu,
  createNewDirectory,
  newHTMLFile,
  newMDFile,
  newTEXTFile,
  closeOpenedFile,
  deleteDirectory,
  returnDirectoryBack
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
    await clearLocalStorage();
    //  await delay(500);
    //await closeWelcome();
    //await delay(500);
    if (global.isMinio) {
      await createMinioLocation('', defaultLocationName, true);
    } else {
      await createLocation(defaultLocationPath, defaultLocationName, true);
    }
    // await delay(500);
    await openLocation(defaultLocationName);
    // await delay(500);
    await closeFileProperties();
  });

  it('TST0501 - Create HTML file [electron]', async () => {
    await delay(500);
    await openDirectoryMenu();
    await delay(500);
    await createNewDirectory();
    await delay(500);
    await reloadDirectory();
    await delay(500);
    await openEntry(testFolder);
    await delay(500);
    await openDirectoryMenu();
    await delay(500);
    await createNewDirectory();
    await delay(500);
    await reloadDirectory();
    await delay(500);
    await openEntry(testFolder);
    // create new file
    await newHTMLFile();
    await delay(500);
    await closeOpenedFile();
    await delay(500);
    await reloadDirectory();
    await delay(500);
    await returnDirectoryBack();
    // delete directory
    await deleteDirectory(testFolder);
    await delay(500);
  });

  it('TST0502 - Create MD file [electron]', async () => {
    await delay(500);
    await openDirectoryMenu();
    await delay(500);
    await createNewDirectory();
    await delay(500);
    await reloadDirectory();
    await delay(500);
    await openEntry(testFolder);
    await delay(500);
    await openDirectoryMenu();
    await delay(500);
    await createNewDirectory();
    await delay(500);
    await reloadDirectory();
    await delay(500);
    await openEntry(testFolder);
    // create new file
    await newMDFile();
    await delay(500);
    await closeOpenedFile();
    await delay(500);
    await reloadDirectory();
    await delay(500);
    await returnDirectoryBack();
    // delete directory
    await deleteDirectory(testFolder);
    await delay(500);
  });

  it('TST0502 - Create TEXT file [electron]', async () => {
    await delay(500);
    await openDirectoryMenu();
    await delay(500);
    await createNewDirectory();
    await delay(500);
    await reloadDirectory();
    await delay(500);
    await openEntry(testFolder);
    await delay(500);
    await openDirectoryMenu();
    await delay(500);
    await createNewDirectory();
    await delay(500);
    await reloadDirectory();
    await delay(500);
    await openEntry(testFolder);
    // create new file
    await newTEXTFile();
    await delay(500);
    await closeOpenedFile();
    await delay(500);
    await reloadDirectory();
    await delay(500);
    await returnDirectoryBack();
    // delete directory
    await deleteDirectory(testFolder);
    await delay(500);
  });

  it('TST0510 - Generate thumbnail from Images [electron]', async () => {
    // let filename = 'sample.jpg';
    await delay(500);
    await openSettingsDialog();
    // activate 'Show Hidden File' functionality in the general settings
    const showUnixHiddenEntries = await global.client.$(
      '[data-tid=settingsSetShowUnixHiddenEntries]'
    );
    await showUnixHiddenEntries.waitForDisplayed();
    await showUnixHiddenEntries.click();
    await closeSettingsDialog();
    await delay(500);
    await reloadDirectory();
    await delay(500);
    await openEntry(tsFolder);
    await delay(500);
    await searchEngine('jpg');
    // await openEntry('sample.jpg');
    // await openFile();
    await delay(500);
    const file = await global.client.$(perspectiveGridTable + firstFile);
    await file.waitForDisplayed();
    await file.doubleClick();
    await closeOpenedFile();
    // const file = await global.client.$(
    //   perspectiveGridTable + firstFile
    // );
    // expect(file).toBe(filename);
  });

  it('TST0511 - Generate thumbnail from Videos [electron]', async () => {
    await delay(500);
    await openSettingsDialog();
    // activate 'Show Hidden File' functionality in the general settings
    const showUnixHiddenEntries = await global.client.$(
      '[data-tid=settingsSetShowUnixHiddenEntries]'
    );
    await showUnixHiddenEntries.waitForDisplayed();
    await showUnixHiddenEntries.click();
    await closeSettingsDialog();
    await delay(500);
    await reloadDirectory();
    await delay(500);
    await openEntry(tsFolder);
    await delay(500);
    await searchEngine('mp4');
    await delay(500);
    const file = await global.client.$(perspectiveGridTable + firstFile);
    await file.waitForDisplayed();
    await file.doubleClick();
    await closeOpenedFile();
  });

  it('TST0516 - Generate thumbnail from PDF [electron]', async () => {
    await delay(500);
    await openSettingsDialog();
    // activate 'Show Hidden File' functionality in the general settings
    const showUnixHiddenEntries = await global.client.$(
      '[data-tid=settingsSetShowUnixHiddenEntries]'
    );
    await showUnixHiddenEntries.waitForDisplayed();
    await showUnixHiddenEntries.click();
    await closeSettingsDialog();
    await delay(500);
    await reloadDirectory();
    await delay(500);
    await openEntry(tsFolder);
    await delay(500);
    await searchEngine('pdf');
    await delay(500);
    const file = await global.client.$(perspectiveGridTable + firstFile);
    await file.waitForDisplayed();
    await file.doubleClick();
    await closeOpenedFile();
  });

  it('TST0517 - Generate thumbnail from ODT [electron]', async () => {
    await delay(500);
    await openSettingsDialog();
    // activate 'Show Hidden File' functionality in the general settings
    const showUnixHiddenEntries = await global.client.$(
      '[data-tid=settingsSetShowUnixHiddenEntries]'
    );
    await showUnixHiddenEntries.waitForDisplayed();
    await showUnixHiddenEntries.click();
    await closeSettingsDialog();
    await delay(500);
    await reloadDirectory();
    await delay(500);
    await openEntry(tsFolder);
    await delay(500);
    await searchEngine('odt');
    await delay(500);
    const file = await global.client.$(perspectiveGridTable + firstFile);
    await file.waitForDisplayed();
    await file.doubleClick();
    await closeOpenedFile();
  });

  it('TST0519 - Generate thumbnail from TIFF [electron]', async () => {
    await delay(500);
    await openSettingsDialog();
    // activate 'Show Hidden File' functionality in the general settings
    const showUnixHiddenEntries = await global.client.$(
      '[data-tid=settingsSetShowUnixHiddenEntries]'
    );
    await showUnixHiddenEntries.waitForDisplayed();
    await showUnixHiddenEntries.click();
    await closeSettingsDialog();
    await delay(500);
    await reloadDirectory();
    await delay(500);
    await openEntry(tsFolder);
    await delay(500);
    await searchEngine('tiff');
    await delay(500);
    const file = await global.client.$(perspectiveGridTable + firstFile);
    await file.waitForDisplayed();
    await file.doubleClick();
    await closeOpenedFile();
  });

  it('TST0520 - Generate thumbnail from PSD [electron]', async () => {
    await delay(500);
    await openSettingsDialog();
    // activate 'Show Hidden File' functionality in the general settings
    const showUnixHiddenEntries = await global.client.$(
      '[data-tid=settingsSetShowUnixHiddenEntries]'
    );
    await showUnixHiddenEntries.waitForDisplayed();
    await showUnixHiddenEntries.click();
    await closeSettingsDialog();
    await delay(500);
    await reloadDirectory();
    await delay(500);
    await openEntry(tsFolder);
    await delay(500);
    await searchEngine('psd');
    await delay(500);
    const file = await global.client.$(perspectiveGridTable + firstFile);
    await file.waitForDisplayed();
    await file.doubleClick();
    await closeOpenedFile();
  });

  it('TST0524 - Generate thumbnail from TXT [electron]', async () => {
    await delay(500);
    await openSettingsDialog();
    // activate 'Show Hidden File' functionality in the general settings
    const showUnixHiddenEntries = await global.client.$(
      '[data-tid=settingsSetShowUnixHiddenEntries]'
    );
    await showUnixHiddenEntries.waitForDisplayed();
    await showUnixHiddenEntries.click();
    await closeSettingsDialog();
    await delay(500);
    await reloadDirectory();
    await delay(500);
    await openEntry(tsFolder);
    await delay(500);
    await searchEngine('txt');
    await delay(500);
    const file = await global.client.$(perspectiveGridTable + firstFile);
    await file.waitForDisplayed();
    await file.doubleClick();
    await closeOpenedFile();
  });

  it('TST0523 - Generate thumbnail from HTML [electron]', async () => {
    await delay(500);
    await openSettingsDialog();
    // activate 'Show Hidden File' functionality in the general settings
    const showUnixHiddenEntries = await global.client.$(
      '[data-tid=settingsSetShowUnixHiddenEntries]'
    );
    await showUnixHiddenEntries.waitForDisplayed();
    await showUnixHiddenEntries.click();
    await closeSettingsDialog();
    await delay(500);
    await reloadDirectory();
    await delay(500);
    await openEntry(tsFolder);
    await delay(500);
    await searchEngine('html');
    await delay(500);
    const file = await global.client.$(perspectiveGridTable + firstFile);
    await file.waitForDisplayed();
    await file.doubleClick();
    await closeOpenedFile();
  });

  it('TST0522 - Generate thumbnail from URL [electron]', async () => {
    await delay(500);
    await openSettingsDialog();
    // activate 'Show Hidden File' functionality in the general settings
    const showUnixHiddenEntries = await global.client.$(
      '[data-tid=settingsSetShowUnixHiddenEntries]'
    );
    await showUnixHiddenEntries.waitForDisplayed();
    await showUnixHiddenEntries.click();
    await closeSettingsDialog();
    await delay(500);
    await reloadDirectory();
    await delay(500);
    await openEntry(tsFolder);
    await delay(500);
    await searchEngine('url');
    await delay(500);
    const file = await global.client.$(perspectiveGridTable + firstFile);
    await file.waitForDisplayed();
    await file.doubleClick();
    await closeOpenedFile();
  });
});
