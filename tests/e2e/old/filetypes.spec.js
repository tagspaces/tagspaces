/* Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved. */
import { clearLocalStorage, delay } from './hook';
import {
  createLocation,
  defaultLocationPath,
  openLocation
} from './location.helpers';
import { openSettings } from './general.е2е';

const testLocationName = '' + new Date().getTime();

describe('TST12 - Settings file type:', async () => {
  beforeEach(async () => {
    await clearLocalStorage();
    await delay(500);
    await createLocation(defaultLocationPath, testLocationName);
    await delay(500);
    await openLocation(testLocationName);
    await delay(500);
    await openSettings('fileTypeSettingsDialog');
    await delay(500);
  });

  it('TST1201 - Add file type', async () => {
    // TODO add file type
    await global.client.waitForVisible(
      '[data-tid=settingsFileTypes_addFileType]'
    );
    await global.client.click('[data-tid=settingsFileTypes_addFileType]');
  });

  it('TST1202 - Remove file type', async () => {
    // TODO remove file type
    await global.client.waitForVisible(
      '[data-tid=settingsFileTypes_remove_bmp]'
    );
    await global.client.click('[data-tid=settingsFileTypes_remove_bmp]');
    const removeExt = await global.client.element(
      '[data-tid=settingsFileTypes_remove_bmp]'
    );
    await delay(500);
    expect(removeExt.selector).not.toBe(
      '[data-tid=settingsFileTypes_remove_bmp]'
    );
  });
});
