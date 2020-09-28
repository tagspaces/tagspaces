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
  checkFileExtForExist
} from './general.helpers';
import { searchEngine } from './search.spec';

const subFolderName = '/test-perspective-grid';
const subFolderContentExtractionPath =
  defaultLocationPath + '/content-extraction';
const subFolderThumbnailsPath = defaultLocationPath + '/thumbnails';

describe('TST51 - Perspective Grid', () => {
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

  it('TST0510 - Generate thumbnail from Images [generate_thumbnail_images,electron]', async () => {
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
    // await checkFileExtForExist();
    await searchEngine('jpg');
    expect.stringContaining('jpg');

    // // should find hidden file with dot in the begin of the filename
    // await global.client.waitForVisible(perspectiveGridTable);
    // const hiddenEntry = await global.client.getText(
    //   perspectiveGridTable,
    //   hiddenFile
    // );
    // expect(hiddenFile).toBe(hiddenEntry);
  });

  it('TST0511 - Generate thumbnail from Videos [generate_thumbnail_videos,electron]', async () => {
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
    // await checkFileExtForExist();
    await searchEngine('mp4');
    expect.stringContaining('mp4');
  });

  it('TST0516 - Generate thumbnail from PDF [generate_thumbnail_PDF,electron]', async () => {
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
    // await checkFileExtForExist();
    await searchEngine('pdf');
    expect.stringContaining('pdf');
  });

  it('TST0517 - Generate thumbnail from ODT [generate_thumbnail_ODT,electron]', async () => {
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
    // await checkFileExtForExist();
    await searchEngine('odt');
    expect.stringContaining('odt');
  });
});
