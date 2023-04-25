/*
 * Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved.
 */
import {
  createLocation,
  defaultLocationPath,
  defaultLocationName,
  closeFileProperties,
  createMinioLocation
} from './location.helpers';
import {
  reloadDirectory,
  tsFolder,
  createNewDirectory,
  newHTMLFile,
  newMDFile,
  newTEXTFile,
  closeOpenedFile,
  deleteDirectory,
  clickOn,
  expectElementExist,
  selectorFile,
  setSettings,
  doubleClickOn
} from './general.helpers';
import { searchEngine } from './search.helpers';

export const firstFile = '/span';
export const perspectiveGridTable = '//*[@data-tid="perspectiveGridFileTable"]';
const subFolderName = '/test-perspective-grid';
const subFolderContentExtractionPath =
  defaultLocationPath + '/content-extraction';
const subFolderThumbnailsPath = defaultLocationPath + '/thumbnails';
const testFolder = 'testFolder';

describe('TST07 - General', () => {
  beforeEach(async () => {
    await clearLocalStorage();
    await delay(500);
  });

  it.skip('TST0701 - Open About TagSpaces', async () => {
    await global.client.waitForVisible('[data-tid=aboutTagSpaces]');
    await global.client.click('[data-tid=aboutTagSpaces]');
    await global.client.waitForVisible('[data-tid=closeAboutDialog]');
    await global.client.click('[data-tid=closeAboutDialog]');
  });

  it.skip('TST0705 - Open Settings Dialog', async () => {
    await global.client.waitForVisible('[data-tid=settings]');
    await global.client.click('[data-tid=settings]');
    await checkForIdExist('settingsDialog');
    await global.client.waitForVisible('[data-tid=closeSettingsDialog]');
    await global.client.click('[data-tid=closeSettingsDialog]');
  });

  it.skip('TST07** - Change theme color', async () => {
    await global.client.waitForVisible('[data-tid=settings]');
    await global.client.click('[data-tid=settings]');
    await delay(500);
    // activate dark theme
    await global.client.waitForVisible('[data-tid=settingsSetCurrentTheme]');
    await global.client.selectByValue(
      '[data-tid=settingsSetCurrentTheme]/div/select',
      'dark'
    );
    await delay(500);
    // const style = await global.client.getAttribute('//button[contains(., "done")]', 'style');
    // await delay(500);
    // expect(style).toContain('rgb(208, 107, 100)');
    // await global.client.waitForVisible('[data-tid=closeSettingsDialog]');
    // await global.client.click('[data-tid=closeSettingsDialog]');
  });

  /* it('TST10** - Desktop Mode', async () => {
    await createLocation(defaultLocationPath, testLocationName, false);
    await checkForIdExist('folderContainerLocationChooser');
    await delay(500);
    await global.client.waitForVisible('[data-tid=settings]');
    await global.client.click('[data-tid=settings]');
    await global.client.waitForVisible('[data-tid=settingsSetDesktopMode]');
    await global.client.click('[data-tid=settingsSetDesktopMode]');
    await delay(2000);
    await global.client.waitForVisible('[data-tid=closeSettingsDialog]');
    await global.client.click('[data-tid=closeSettingsDialog]');
    // set desktop mode and check for desktop text / Location Chooser bottom in Toolbar
    const isDesktopMode = await global.client.element('[data-tid=folderContainerLocationChooser]');
    await delay(500);
    expect(isDesktopMode.selector).not.toBe('[data-tid=folderContainerLocationChooser]');
  }); */

  // it('TST1003 - Checkbox in the settings to open the tag library on startup', async () => {
  //
  // });
});

describe('TST51 - Perspective Grid [general]', () => {
  beforeEach(async () => {
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
    /*await createNewDirectory();
    await reloadDirectory();
    // await global.client.pause(500);
    await expectElementExist('[data-tid=fsEntryName_' + testFolder + ']');
    await doubleClickOn('[data-tid=fsEntryName_' + testFolder + ']');*/

    //await setSettings('[data-tid=settingsSetUseTrashCan]');
    //await global.client.pause(500);
    await createNewDirectory();
    // await reloadDirectory();
    // await global.client.pause(500);
    await doubleClickOn('[data-tid=fsEntryName_' + testFolder + ']');
    // create new file
    await newHTMLFile();
    await closeOpenedFile();
    // await reloadDirectory();
    await expectElementExist(selectorFile, true);
    /*await global.client.pause(500);*/
    // delete directory

    // await deleteFirstFile();
    await deleteDirectory(testFolder);
    await global.client.pause(500);
    await expectElementExist(
      '[data-tid=fsEntryName_' + testFolder + ']',
      false
    );
  });

  it('TST0502 - Create MD file [electron]', async () => {
    await createNewDirectory();
    // await reloadDirectory();
    // await global.client.pause(500);
    await doubleClickOn('[data-tid=fsEntryName_' + testFolder + ']');

    // create new file
    await newMDFile();
    await closeOpenedFile();
    // await reloadDirectory();
    await expectElementExist(selectorFile, true);
    await global.client.pause(500);

    // await deleteFirstFile();
    await deleteDirectory(testFolder);
    await expectElementExist(
      '[data-tid=fsEntryName_' + testFolder + ']',
      false
    );
  });

  it('TST0502 - Create TEXT file [electron]', async () => {
    await createNewDirectory();
    // await reloadDirectory();
    // await global.client.pause(500);
    await doubleClickOn('[data-tid=fsEntryName_' + testFolder + ']');

    // create new file
    await newTEXTFile();
    await closeOpenedFile();
    // await reloadDirectory();
    await expectElementExist(selectorFile, true);
    await global.client.pause(500);

    // await deleteFirstFile();
    await deleteDirectory(testFolder);
    await expectElementExist(
      '[data-tid=fsEntryName_' + testFolder + ']',
      false
    );
  });

  it('TST0510 - Generate thumbnail from Images', async () => {
    // let filename = 'sample.jpg';
    // activate 'Show Hidden File' functionality in the general settings
    await setSettings('[data-tid=settingsSetShowUnixHiddenEntries]');
    await global.client.pause(500);
    await reloadDirectory();
    await global.client.pause(500);
    await doubleClickOn('[data-tid=fsEntryName_' + tsFolder + ']');

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

  it('TST0511 - Generate thumbnail from Videos', async () => {
    // activate 'Show Hidden File' functionality in the general settings
    await setSettings('[data-tid=settingsSetShowUnixHiddenEntries]');
    await global.client.pause(500);
    await reloadDirectory();
    await global.client.pause(500);
    await doubleClickOn('[data-tid=fsEntryName_' + tsFolder + ']');

    await searchEngine('mp4');
    await doubleClickOn(perspectiveGridTable + firstFile);
    await closeOpenedFile();
    //TODO expect
  });

  it('TST0516 - Generate thumbnail from PDF', async () => {
    // activate 'Show Hidden File' functionality in the general settings
    await setSettings('[data-tid=settingsSetShowUnixHiddenEntries]');
    await global.client.pause(500);
    await reloadDirectory();
    await global.client.pause(500);
    await doubleClickOn('[data-tid=fsEntryName_' + tsFolder + ']');

    await searchEngine('pdf');
    await doubleClickOn(perspectiveGridTable + firstFile);
    await closeOpenedFile();
    //TODO expect
  });

  it('TST0517 - Generate thumbnail from ODT', async () => {
    // activate 'Show Hidden File' functionality in the general settings
    await setSettings('[data-tid=settingsSetShowUnixHiddenEntries]');
    await global.client.pause(500);
    await reloadDirectory();
    await global.client.pause(500);
    await doubleClickOn('[data-tid=fsEntryName_' + tsFolder + ']');

    await searchEngine('odt');
    await doubleClickOn(perspectiveGridTable + firstFile);
    await closeOpenedFile();
    //TODO expect
  });

  it('TST0519 - Generate thumbnail from TIFF', async () => {
    // activate 'Show Hidden File' functionality in the general settings
    await setSettings('[data-tid=settingsSetShowUnixHiddenEntries]');
    await global.client.pause(500);
    await reloadDirectory();
    await global.client.pause(500);
    await doubleClickOn('[data-tid=fsEntryName_' + tsFolder + ']');

    await searchEngine('tiff');
    // await openEntry('sample.jpg');
    // await openFile();
    await doubleClickOn(perspectiveGridTable + firstFile);
    await closeOpenedFile();
    //TODO expect
  });

  it('TST0520 - Generate thumbnail from PSD', async () => {
    // activate 'Show Hidden File' functionality in the general settings
    await setSettings('[data-tid=settingsSetShowUnixHiddenEntries]');
    await global.client.pause(500);
    await reloadDirectory();
    await global.client.pause(500);
    await doubleClickOn('[data-tid=fsEntryName_' + tsFolder + ']');

    await searchEngine('psd');
    // await openEntry('sample.jpg');
    // await openFile();
    await doubleClickOn(perspectiveGridTable + firstFile);
    await closeOpenedFile();
    //TODO expect
  });

  it('TST0524 - Generate thumbnail from TXT', async () => {
    // activate 'Show Hidden File' functionality in the general settings
    await setSettings('[data-tid=settingsSetShowUnixHiddenEntries]');
    await global.client.pause(500);
    await reloadDirectory();
    await global.client.pause(500);
    await doubleClickOn('[data-tid=fsEntryName_' + tsFolder + ']');

    await searchEngine('txt');
    // await openEntry('sample.jpg');
    // await openFile();
    await doubleClickOn(perspectiveGridTable + firstFile);
    await closeOpenedFile();
    //TODO expect
  });

  it('TST0523 - Generate thumbnail from HTML', async () => {
    // activate 'Show Hidden File' functionality in the general settings
    await setSettings('[data-tid=settingsSetShowUnixHiddenEntries]');
    await global.client.pause(500);
    await reloadDirectory();
    await global.client.pause(500);
    await doubleClickOn('[data-tid=fsEntryName_' + tsFolder + ']');

    await searchEngine('html');
    // await openEntry('sample.jpg');
    // await openFile();
    await doubleClickOn(perspectiveGridTable + firstFile);
    await closeOpenedFile();
    //TODO expect
  });

  it('TST0522 - Generate thumbnail from URL', async () => {
    // activate 'Show Hidden File' functionality in the general settings
    await setSettings('[data-tid=settingsSetShowUnixHiddenEntries]');
    await global.client.pause(500);
    await reloadDirectory();
    await global.client.pause(500);
    await doubleClickOn('[data-tid=fsEntryName_' + tsFolder + ']');

    await searchEngine('url');
    // await openEntry('sample.jpg');
    // await openFile();
    await doubleClickOn(perspectiveGridTable + firstFile);
    await closeOpenedFile();
    //TODO expect
  });
});
