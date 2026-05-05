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
 * E2E coverage for the configurable-perspectives feature.
 *
 * PR1: dedicated Perspectives tab in Settings, switcher filtering by
 *      enabledPerspectives, fallback when the active perspective is
 *      disabled, guard against disabling every perspective.
 * PR3: external (package-shipped) perspective rendering and the
 *      per-perspective onboarding dialog. PR3 tests are tagged [_pro]
 *      and additionally probe for the dummy timeline-perspective —
 *      they self-skip if the build doesn't include it (the package is
 *      excluded from the default Pro release; only present locally with
 *      `npm run link4dev` in extensions-pro).
 *
 * PR2 (extconfig lock) lives in perspective-config-locked.pw.e2e.js
 * because that file needs a different extconfig and Playwright doesn't
 * support per-test extconfig swaps within a single worker.
 */
import { expect, test } from './fixtures';
import {
  clickOn,
  clickOnIfVisible,
  expectElementExist,
  getGridFileSelector,
} from './general.helpers';
import { startTestingApp, stopApp } from './hook';
import {
  createPwLocation,
  createS3Location,
  defaultLocationName,
} from './location.helpers';
import { clearDataStorage, closeWelcomePlaywright } from './welcome.helpers';

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
  // Each test toggles perspectives in Settings; clear localStorage so the
  // next test starts from the default-all-enabled state.
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

// Helpers — local to this file because they're specific to the new
// Perspectives Settings tab UX.

async function openPerspectivesSettings() {
  await clickOn('[data-tid=settings]');
  await clickOn('[data-tid=perspectivesSettingsDialog]');
}

async function closeSettings() {
  await clickOn('[data-tid=closeSettingsDialog]');
}

async function setPerspectiveEnabled(perspectiveId, enabled) {
  // setChecked is the right tool for MUI Switch — it is idempotent and
  // dispatches both the click and the resulting change event.
  await global.client.setChecked(
    '[data-tid=enablePerspective_' + perspectiveId + '] input',
    enabled,
  );
}

async function isPerspectiveSwitchChecked(perspectiveId) {
  return await global.client.isChecked(
    '[data-tid=enablePerspective_' + perspectiveId + '] input',
  );
}

async function timelineIsRegistered() {
  // The toolbar button only renders when the timeline perspective is in
  // visiblePerspectives, which only happens when the build picked up the
  // dummy via extension-config.ts. Probe the toolbar (visible whenever a
  // location is open) so this works without needing Settings open. Short
  // timeout so missing-build cases self-skip fast.
  try {
    await global.client.waitForSelector(
      '[data-tid=openTimelinePerspective]',
      { state: 'visible', timeout: 1500 },
    );
    return true;
  } catch (e) {
    return false;
  }
}

test.describe('TST71 - Configurable Perspectives', () => {
  test('TST7101 - Perspectives Settings tab opens and lists built-ins [web,s3,electron]', async () => {
    await openPerspectivesSettings();

    // The two free built-ins are always present in any build.
    await expectElementExist(
      '[data-tid=perspectiveRow_grid]',
      true,
      5000,
    );
    await expectElementExist(
      '[data-tid=perspectiveRow_list]',
      true,
      5000,
    );

    // Both are enabled by default after a fresh clearDataStorage.
    expect(await isPerspectiveSwitchChecked('grid')).toBeTruthy();
    expect(await isPerspectiveSwitchChecked('list')).toBeTruthy();

    await closeSettings();
  });

  test('TST7102 - Toggling a perspective off hides it from the switcher [web,s3,electron]', async () => {
    // Sanity: the List toggle button is in the toolbar before we touch anything.
    await expectElementExist(
      '[data-tid=openListPerspective]',
      true,
      5000,
    );

    await openPerspectivesSettings();
    await setPerspectiveEnabled('list', false);
    expect(await isPerspectiveSwitchChecked('list')).toBeFalsy();
    await closeSettings();

    // List button should now be gone from the switcher.
    await expectElementExist(
      '[data-tid=openListPerspective]',
      false,
      3000,
    );

    // Re-enable and verify it comes back.
    await openPerspectivesSettings();
    await setPerspectiveEnabled('list', true);
    expect(await isPerspectiveSwitchChecked('list')).toBeTruthy();
    await closeSettings();

    await expectElementExist(
      '[data-tid=openListPerspective]',
      true,
      5000,
    );
  });

  test('TST7103 - Active perspective falls back when disabled [web,s3,electron]', async () => {
    // Switch to List, confirm it became active.
    await clickOn('[data-tid=openListPerspective]');
    await expectElementExist(
      '[data-tid=listPerspectiveContainer]',
      true,
      5000,
    );

    // Disable List from Settings.
    await openPerspectivesSettings();
    await setPerspectiveEnabled('list', false);
    await closeSettings();

    // Fallback effect should route us to Grid (the first remaining enabled).
    await expectElementExist(
      '[data-tid=gridPerspectiveContainer]',
      true,
      5000,
    );
    await expectElementExist(
      '[data-tid=listPerspectiveContainer]',
      false,
      3000,
    );

    // Restore default state for the next test in this file (electron tests
    // don't reload between cases, so redux changes survive afterEach's
    // localStorage clear).
    await openPerspectivesSettings();
    await setPerspectiveEnabled('list', true);
    await closeSettings();
  });

  test('TST7104 - Cannot disable the last enabled perspective [web,s3,electron]', async () => {
    await openPerspectivesSettings();

    // Discover all perspective rows currently rendered. This is dynamic
    // on purpose — Pro builds with link4dev'd extensions add external
    // perspectives (e.g. timeline-perspective) that would survive a
    // hardcoded list and prevent Grid from being the last enabled one.
    const rowIds = await global.client.$$eval(
      '[data-tid^=perspectiveRow_]',
      (els) =>
        els
          .map((el) => el.getAttribute('data-tid'))
          .filter(Boolean)
          .map((tid) => tid.replace('perspectiveRow_', '')),
    );
    const others = rowIds.filter((id) => id !== 'grid');

    // Disable every other-than-grid row that is currently enabled and
    // whose switch is interactive (Pro-locked switches are read-only in
    // Lite builds).
    for (const id of others) {
      const input = await global.client.$(
        '[data-tid=enablePerspective_' + id + '] input',
      );
      if (!input) continue;
      if (await input.isDisabled()) continue;
      if (await input.isChecked()) {
        await setPerspectiveEnabled(id, false);
      }
    }

    // Grid should now be the only enabled perspective — verify by
    // re-reading the DOM.
    for (const id of others) {
      const input = await global.client.$(
        '[data-tid=enablePerspective_' + id + '] input',
      );
      if (!input) continue;
      if (await input.isDisabled()) continue;
      expect(await input.isChecked()).toBeFalsy();
    }

    // The handler refuses to dispatch when the user tries to disable the
    // last enabled perspective. Using a plain click here (not setChecked)
    // because setChecked would loop waiting for the input to actually
    // flip — and it never will.
    await global.client.click('[data-tid=enablePerspective_grid] input');
    // Give React a tick to re-render with the unchanged state.
    await global.client.waitForTimeout(300);

    // Grid switch is still on because the dispatch was suppressed.
    expect(await isPerspectiveSwitchChecked('grid')).toBeTruthy();

    await closeSettings();

    // Grid is still in the switcher.
    await expectElementExist(
      '[data-tid=openDefaultPerspective]',
      true,
      3000,
    );

    // Restore: re-enable everything we disabled so the next test starts
    // clean (electron tests share an in-memory redux store across cases).
    await openPerspectivesSettings();
    for (const id of others) {
      const input = await global.client.$(
        '[data-tid=enablePerspective_' + id + '] input',
      );
      if (!input) continue;
      if (await input.isDisabled()) continue;
      if (!(await input.isChecked())) {
        await setPerspectiveEnabled(id, true);
      }
    }
    await closeSettings();
  });
});

test.describe('TST72 - External perspective + onboarding', () => {
  // Single end-to-end scenario that exercises rendering + auto-onboarding
  // + Show intro in one pass. Splitting these into separate tests would
  // be more granular but unreliable: in-memory redux state (especially
  // seenPerspectiveOnboardings and currentPerspective) survives the
  // afterEach localStorage clear because electron tests don't reload
  // between cases. Sequencing here keeps the assertions independent of
  // any prior test's leftover state.
  test('TST7201 - Render, auto-onboard, persist seen, manual reopen [web,s3,electron,_pro]', async () => {
    if (!(await timelineIsRegistered())) {
      test.skip(
        true,
        'Timeline dummy not present in this build — run `npm run link4dev` in extensions-pro and rebuild.',
      );
      return;
    }

    // Step 1 — switching into timeline renders the dummy and auto-opens
    // the onboarding dialog (first-time auto-trigger; seenOnboardings
    // does not yet contain "timeline").
    await clickOn('[data-tid=openTimelinePerspective]');
    await expectElementExist('[data-tid=timelinePerspectiveTID]', true, 8000);
    await expectElementExist('[data-tid=timelineOnboardingTID]', true, 8000);

    // Step 2 — closing the dialog persists markPerspectiveOnboardingSeen.
    await clickOn('[data-tid=timelineOnboardingDoneTID]');
    await expectElementExist('[data-tid=timelineOnboardingTID]', false, 3000);

    // Step 3 — switching away to Grid and back must NOT re-trigger the
    // dialog (auto-trigger respects the seen flag).
    await clickOn('[data-tid=openDefaultPerspective]');
    await expectElementExist('[data-tid=gridPerspectiveContainer]', true, 5000);
    await clickOn('[data-tid=openTimelinePerspective]');
    await expectElementExist('[data-tid=timelinePerspectiveTID]', true, 5000);
    await expectElementExist('[data-tid=timelineOnboardingTID]', false, 3000);

    // Step 4 — Settings → Perspectives → Show intro must clear the seen
    // flag and reopen the onboarding dialog stacked above Settings.
    await openPerspectivesSettings();
    await clickOn('[data-tid=showPerspectiveIntro_timeline]');
    await expectElementExist('[data-tid=timelineOnboardingTID]', true, 5000);

    // Cleanup: dismiss the intro (re-marks seen) and the Settings dialog.
    await clickOn('[data-tid=closePerspectiveOnboardingTID]');
    await clickOnIfVisible('[data-tid=closeSettingsDialog]');
  });
});
