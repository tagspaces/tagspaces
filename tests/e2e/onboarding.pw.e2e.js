/*
 * Copyright (c) 2016-present - TagSpaces GmbH. All rights reserved.
 */
import { test, expect } from './fixtures';
import { startTestingApp, stopApp } from './hook';
import { clearDataStorage } from './welcome.helpers';

// Onboarding tests boot the app WITHOUT an extconfig override so
// ExtIsFirstRun is undefined and the license/onboarding dialogs auto-show
// from default settings (firstRun: true). General tests use extconfig.js
// which suppresses the dialogs — that's why this file owns its own
// beforeAll instead of sharing the general suite's setup.

test.beforeAll(async ({ isWeb, isS3, webServerPort }, testInfo) => {
  await startTestingApp({ isWeb, isS3, webServerPort, testInfo });
});

test.afterAll(async () => {
  await stopApp();
});

test.afterEach(async ({ isWeb }) => {
  // Reset firstRun and onboarding flags between tests so each one starts
  // from a clean slate. clearDataStorage clears localStorage; we then
  // reload so providers re-mount and the license/wizard appear again.
  await clearDataStorage(isWeb);
  if (!isWeb) {
    await global.client.reload();
  }
});

test.describe('TST91 - Onboarding flow', () => {
  test('TST9101 - License dialog shown on first run [electron,web,s3]', async () => {
    // The license dialog blocks until accepted. Its primary CTA is the
    // "Agree License" button; the "Quit" button is the alternative.
    const agreeBtn = await global.client.waitForSelector(
      '[data-tid=agreeLicenseDialog]',
      { timeout: 10000, state: 'visible' },
    );
    expect(agreeBtn).toBeTruthy();

    const quitBtn = await global.client.$('[data-tid=confirmLicenseDialog]');
    expect(quitBtn).toBeTruthy();
  });

  test('TST9102 - Accepting license opens the onboarding wizard [electron,web,s3]', async () => {
    // License dialog should be visible.
    await global.client.waitForSelector('[data-tid=agreeLicenseDialog]', {
      timeout: 10000,
      state: 'visible',
    });

    // Accepting the license should close it and reveal the onboarding
    // wizard underneath. The wizard's close button has the stable data-tid
    // 'closeOnboardingDialog'.
    await global.client.click('[data-tid=agreeLicenseDialog]');

    const closeOnboarding = await global.client.waitForSelector(
      '[data-tid=closeOnboardingDialog]',
      { timeout: 5000, state: 'visible' },
    );
    expect(closeOnboarding).toBeTruthy();

    // The wizard footer should show a Next button on the first slide
    // (the finish CTA only appears on the last slide).
    const nextBtn = await global.client.waitForSelector(
      '[data-tid=onboardingNextTID]',
      { timeout: 3000, state: 'visible' },
    );
    expect(nextBtn).toBeTruthy();
  });

  test('TST9103 - Wizard navigates through all slides via Next [electron,web,s3]', async () => {
    await global.client.waitForSelector('[data-tid=agreeLicenseDialog]', {
      timeout: 10000,
      state: 'visible',
    });
    await global.client.click('[data-tid=agreeLicenseDialog]');
    await global.client.waitForSelector('[data-tid=closeOnboardingDialog]', {
      timeout: 5000,
      state: 'visible',
    });

    // 5 slides total → 4 Next clicks land us on slide 5.
    // After the 4th click, Next should be replaced by the finish CTA
    // (either onboardingOpenPrimaryTID or onboardingChooseFolderToStartTID).
    for (let i = 0; i < 4; i++) {
      await global.client.click('[data-tid=onboardingNextTID]');
      // Small settle time for Swiper transition (500ms speed).
      await global.client.waitForTimeout(600);
    }

    // The Next button should be gone on the last slide.
    const stillHasNext = await global.client.$(
      '[data-tid=onboardingNextTID]',
    );
    expect(stillHasNext).toBeFalsy();

    // The finish CTA must be present in one of its two forms.
    const openPrimary = await global.client.$(
      '[data-tid=onboardingOpenPrimaryTID]',
    );
    const chooseFolder = await global.client.$(
      '[data-tid=onboardingChooseFolderToStartTID]',
    );
    expect(openPrimary || chooseFolder).toBeTruthy();
  });

  test('TST9105 - License dialog only closes via its action buttons [electron,web,s3]', async () => {
    // The dialog should ignore Escape and backdrop clicks — only the
    // Agree / Quit buttons inside it may dismiss it. We can verify Escape
    // and backdrop, plus the Agree button. We don't click Quit because
    // it terminates the Electron app.
    await global.client.waitForSelector('[data-tid=agreeLicenseDialog]', {
      timeout: 10000,
      state: 'visible',
    });

    // Escape must NOT close the dialog.
    await global.client.keyboard.press('Escape');
    await global.client.waitForTimeout(300);
    expect(
      await global.client.isVisible('[data-tid=agreeLicenseDialog]'),
    ).toBe(true);

    // Clicking the backdrop (outside the dialog paper) must NOT close it.
    // The dialog paper is centered, so a click at (5, 5) lands on the
    // MUI backdrop covering the rest of the viewport.
    await global.client.mouse.click(5, 5);
    await global.client.waitForTimeout(300);
    expect(
      await global.client.isVisible('[data-tid=agreeLicenseDialog]'),
    ).toBe(true);

    // The Quit button must exist (alternative CTA) — we don't click it,
    // since it would terminate the app and end the test session.
    const quitBtn = await global.client.$('[data-tid=confirmLicenseDialog]');
    expect(quitBtn).toBeTruthy();

    // The Agree button must close the dialog.
    await global.client.click('[data-tid=agreeLicenseDialog]');
    await global.client.waitForSelector('[data-tid=agreeLicenseDialog]', {
      timeout: 5000,
      state: 'hidden',
    });
  });

  test('TST9104 - Closing the wizard marks onboarding completed [electron,web,s3]', async () => {
    await global.client.waitForSelector('[data-tid=agreeLicenseDialog]', {
      timeout: 10000,
      state: 'visible',
    });
    await global.client.click('[data-tid=agreeLicenseDialog]');
    await global.client.waitForSelector('[data-tid=closeOnboardingDialog]', {
      timeout: 5000,
      state: 'visible',
    });

    // Close via the X — this should dispatch setOnboardingCompleted(true).
    await global.client.click('[data-tid=closeOnboardingDialog]');

    // Wait for the dialog to actually disappear before reading state.
    await global.client.waitForSelector('[data-tid=closeOnboardingDialog]', {
      timeout: 3000,
      state: 'hidden',
    });

    // Read Redux-persisted settings from localStorage and verify the
    // onboardingCompleted flag was set.
    const onboardingCompleted = await global.client.evaluate(() => {
      const root = JSON.parse(localStorage.getItem('persist:root') || '{}');
      if (!root.settings) return null;
      const settings = JSON.parse(root.settings);
      return settings.onboardingCompleted;
    });
    expect(onboardingCompleted).toBe(true);
  });
});
