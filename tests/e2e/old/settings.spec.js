/* Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved. */
import { delay, clearLocalStorage } from './hook';
import {
  createLocation,
  openLocation,
  defaultLocationPath,
  checkForIdExist
} from './location.helpers';

const testLocationName = '' + new Date().getTime();
const testNewLocationName = '' + new Date().getTime();

const hiddenFile = '.ts';
const perspectiveGridTable = '[data-tid=perspectiveGridFileTable]';

describe('TST10 - General', () => {
  beforeEach(async () => {
    await clearLocalStorage();
    await delay(500);
  });

  it('TST1001 - Show files & directories with dots in the begin of the filename', async () => {
    await createLocation(defaultLocationPath, testLocationName, true);
    await delay(500);
    await global.client.waitForVisible('[data-tid=settings]');
    await global.client.click('[data-tid=settings]');
    // activate 'Show Hidden File' functionality in the general settings
    await global.client.waitForVisible(
      '[data-tid=settingsSetShowUnixHiddenEntries]'
    );
    await global.client.click('[data-tid=settingsSetShowUnixHiddenEntries]');
    await global.client.waitForVisible('[data-tid=closeSettingsDialog]');
    await global.client.click('[data-tid=closeSettingsDialog]');
    await openLocation(testLocationName);
    // should find hidden file with dot in the begin of the filename
    await global.client.waitForVisible(perspectiveGridTable);
    const hiddenEntry = await global.client.getText(
      perspectiveGridTable,
      hiddenFile
    );
    expect(hiddenFile).toBe(hiddenEntry);
  });

  it('TST1002 - Use default location as startup location', async () => {
    // activate 'Use default location as a startup location'
    // functionality in the general settings
    await delay(500);
    await createLocation(defaultLocationPath, testLocationName, true);
    await delay(500);
    await createLocation(defaultLocationPath, testNewLocationName, true);
    await delay(500);
    await global.client.waitForVisible('[data-tid=settings]');
    await global.client.click('[data-tid=settings]');
    await global.client.waitForVisible(
      '[data-tid=settingsSetUseDefaultLocation]'
    );
    await global.client.click('[data-tid=settingsSetUseDefaultLocation]');
    await global.client.waitForVisible('[data-tid=closeSettingsDialog]');
    await global.client.click('[data-tid=closeSettingsDialog]');
    // reload application
    await global.client.keys('F5');
    await delay(500);
    await checkForIdExist('perspectiveGridFileTable');
  });
});
