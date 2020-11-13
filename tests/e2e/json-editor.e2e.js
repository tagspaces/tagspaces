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
import { closeOpenedFile, openCloseAboutDialog } from './general.helpers';
import { searchEngine } from './search.spec';

export const firstFile = '/span';
export const perspectiveGridTable = '//*[@data-tid="perspectiveGridFileTable"]';

describe('TST57 - JSON editor [electron]', () => {
  beforeEach(async () => {
    await clearLocalStorage();
    if (global.isMinio) {
      await createMinioLocation('', defaultLocationName, true);
    } else {
      await createLocation(defaultLocationPath, defaultLocationName, true);
    }
    await openLocation(defaultLocationName);
    await closeFileProperties();
  });

  it('TST5701 - Open JSON [electron]', async () => {
    await delay(500);
    await searchEngine('json');
    await delay(500);
    const file = await global.client.$(perspectiveGridTable + firstFile);
    await file.waitForDisplayed();
    await file.doubleClick();
    await delay(500);
    await closeOpenedFile();
  });

  it('TST5705 - Open about dialog [electron]', async () => {
    await delay(500);
    await searchEngine('json');
    await delay(500);
    const file = await global.client.$(perspectiveGridTable + firstFile);
    await file.waitForDisplayed();
    await file.doubleClick();
    await delay(500);
    const webViewer = await global.client.$('#FileViewer');
    expect(await webViewer.isDisplayed()).toBe(true);
    await delay(1500);
    await global.client.switchToFrame(webViewer);
    await openCloseAboutDialog();
    await delay(500);
    await global.client.switchToParentFrame();
    await closeOpenedFile();
  });
});
