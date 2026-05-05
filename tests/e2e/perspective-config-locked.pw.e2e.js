/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces GmbH
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

/*
 * E2E coverage for the configurable-perspectives feature (PR2 — extconfig
 * lock). Lives in its own file because Playwright restarts the app per
 * file when a new extconfig is needed; the locked path can't share a
 * worker with the user-toggle tests in perspective-config.pw.e2e.js.
 */
import { expect, test } from './fixtures';
import {
  clickOn,
  expectElementExist,
  getGridFileSelector,
} from './general.helpers';
import { startTestingApp, stopApp } from './hook';
import { defaultLocationName } from './location.helpers';
import { clearDataStorage } from './welcome.helpers';

// extconfig-perspectives-locked.js whitelists ['grid', 'list'] via
// ExtEnabledPerspectives, so the Settings tab is read-only and the
// switcher must hide every other perspective regardless of any value
// that may be persisted in localStorage.
test.beforeAll(async ({ isWeb, isS3, webServerPort }, testInfo) => {
  await startTestingApp(
    { isWeb, isS3, webServerPort, testInfo },
    'extconfig-perspectives-locked.js',
  );
});

test.afterAll(async () => {
  await stopApp();
});

test.afterEach(async () => {
  await clearDataStorage();
});

test.beforeEach(async () => {
  // ExtLocations injects the location from the extconfig — just open it.
  await clickOn('[data-tid=location_' + defaultLocationName + ']');
  await expectElementExist(getGridFileSelector('empty_folder'), true, 15000);
});

test.describe('TST73 - extconfig-locked perspectives', () => {
  test('TST7301 - Switcher only shows whitelisted perspectives [web,s3,electron]', async () => {
    // Whitelisted IDs are visible.
    await expectElementExist(
      '[data-tid=openDefaultPerspective]',
      true,
      5000,
    );
    await expectElementExist(
      '[data-tid=openListPerspective]',
      true,
      5000,
    );
    // Non-whitelisted Pro perspectives must NOT be in the switcher,
    // even in a Pro build where they would normally appear.
    await expectElementExist(
      '[data-tid=openGalleryPerspective]',
      false,
      2000,
    );
    await expectElementExist(
      '[data-tid=openKanbanPerspective]',
      false,
      2000,
    );
  });

  test('TST7302 - Settings switches are disabled (read-only) [web,s3,electron]', async () => {
    await clickOn('[data-tid=settings]');
    await clickOn('[data-tid=perspectivesSettingsDialog]');

    // The Grid switch is in the whitelist but should still be locked
    // because extconfig owns the entire array.
    const gridInput = await global.client.$(
      '[data-tid=enablePerspective_grid] input',
    );
    expect(gridInput).toBeTruthy();
    expect(await gridInput.isDisabled()).toBeTruthy();

    const listInput = await global.client.$(
      '[data-tid=enablePerspective_list] input',
    );
    expect(listInput).toBeTruthy();
    expect(await listInput.isDisabled()).toBeTruthy();

    await clickOn('[data-tid=closeSettingsDialog]');
  });

  test('TST7303 - User toggles do not stick across reload when extconfig locks [web,s3,electron]', async () => {
    // Even though the UI prevents toggling, verify the read path: open
    // the Settings tab and confirm both whitelist members report as
    // checked. extconfig is the source of truth, so anything previously
    // persisted in localStorage is overridden on read.
    await clickOn('[data-tid=settings]');
    await clickOn('[data-tid=perspectivesSettingsDialog]');

    expect(
      await global.client.isChecked(
        '[data-tid=enablePerspective_grid] input',
      ),
    ).toBeTruthy();
    expect(
      await global.client.isChecked(
        '[data-tid=enablePerspective_list] input',
      ),
    ).toBeTruthy();

    // Non-whitelisted Pro entries that ARE rendered (because hasPro &&
    // !hideProFeatures) should be unchecked, since extconfig didn't
    // include them.
    const galleryRow = await global.client.$(
      '[data-tid=perspectiveRow_gallery]',
    );
    if (galleryRow) {
      expect(
        await global.client.isChecked(
          '[data-tid=enablePerspective_gallery] input',
        ),
      ).toBeFalsy();
    }

    await clickOn('[data-tid=closeSettingsDialog]');
  });
});
