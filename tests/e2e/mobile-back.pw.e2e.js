/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2026-present TagSpaces GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License (version 3) as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import { dataTidFormat } from '../../src/renderer/services/test';
import { test } from './fixtures';
import {
  clickOn,
  expectElementExist,
  getGridFileSelector,
  openFile,
  openFolder,
} from './general.helpers';
import { startTestingApp, stopApp } from './hook';
import {
  createPwLocation,
  createS3Location,
  defaultLocationName,
} from './location.helpers';
import { clearDataStorage, closeWelcomePlaywright } from './welcome.helpers';

// Simulates the Android hardware back button / system back gesture: on
// device, io-capacitor's Capacitor backButton listener dispatches exactly
// this event (see onDeviceBackButton), handled by useMobileBackHandler.
async function pressBack() {
  await global.client.evaluate(() =>
    window.dispatchEvent(new CustomEvent('ts-back-button')),
  );
}

test.beforeAll(async ({ isWeb, isS3, webServerPort }, testInfo) => {
  if (isS3) {
    await startTestingApp({ isWeb, isS3, webServerPort, testInfo });
    await closeWelcomePlaywright();
  } else {
    await startTestingApp(
      { isWeb, isS3, webServerPort, testInfo },
      'extconfig.js',
    );
  }
});

test.afterAll(async () => {
  await stopApp();
});

test.afterEach(async () => {
  await clearDataStorage();
});

test.beforeEach(async ({ isS3, testDataDir }) => {
  if (isS3) {
    await createS3Location('', defaultLocationName, true);
  } else {
    await createPwLocation(testDataDir, defaultLocationName, true);
  }
  await clickOn('[data-tid=location_' + defaultLocationName + ']');
  await expectElementExist(getGridFileSelector('empty_folder'), true, 15000);
});

test.describe('TST95 - Mobile back navigation (back button/gesture chain)', () => {
  test('TST9501 - Back closes the opened file and stays in the directory [electron,web,s3]', async () => {
    const fileName = 'sample.txt';
    const openedSelector = '[data-tid=OpenedTID' + dataTidFormat(fileName) + ']';
    await openFile(fileName);

    await pressBack();

    await expectElementExist(openedSelector, false, 8000);
    // Still in the same directory afterwards.
    await expectElementExist(getGridFileSelector(fileName), true, 8000);
  });

  test('TST9502 - Back dismisses an open dialog before closing the opened file [electron,web,s3]', async () => {
    const fileName = 'sample.txt';
    const openedSelector = '[data-tid=OpenedTID' + dataTidFormat(fileName) + ']';
    await openFile(fileName);

    // Open the settings dialog on top of the opened file. The dialog uses
    // keepMounted, so it stays attached when closed — assert on visibility.
    await clickOn('[data-tid=settings]');
    await global.client.waitForSelector('[data-tid=closeSettingsDialog]', {
      timeout: 8000,
      state: 'visible',
    });

    // First back press closes only the top-most modal.
    await pressBack();
    await global.client.waitForSelector('[data-tid=closeSettingsDialog]', {
      timeout: 8000,
      state: 'hidden',
    });
    await expectElementExist(openedSelector, true, 8000);

    // Second back press closes the opened file.
    await pressBack();
    await expectElementExist(openedSelector, false, 8000);
  });

  test('TST9503 - Back navigates up to the parent directory [electron,web,s3]', async () => {
    const folderName = 'empty_folder';
    const currentDirSelector =
      '[data-tid=currentDir_' + dataTidFormat(folderName) + ']';
    await openFolder(folderName);

    await pressBack();

    await expectElementExist(currentDirSelector, false, 8000);
    // Back at the location root, the folder is listed again.
    await expectElementExist(getGridFileSelector(folderName), true, 8000);
  });

  test('TST9504 - Back at the location root shows the press-again-to-exit notification [electron,web,s3]', async () => {
    await pressBack();

    // On web/e2e no app exit is possible; the double-back-to-exit
    // notification must appear (on device the second press exits the app).
    await expectElementExist('[data-tid=notificationTID]', true, 8000);
  });
});
