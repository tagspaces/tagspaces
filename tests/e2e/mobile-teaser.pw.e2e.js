/*
 * Copyright (c) 2016-present - TagSpaces GmbH. All rights reserved.
 */
import { test, expect } from './fixtures';
import {
  createPwLocation,
  createS3Location,
  defaultLocationName,
} from './location.helpers';
import {
  clickOn,
  expectElementExist,
  getGridFileSelector,
} from './general.helpers';
import { startTestingApp, stopApp } from './hook';
import { clearDataStorage, closeWelcomePlaywright } from './welcome.helpers';

test.beforeAll(async ({ isWeb, isS3, webServerPort }, testInfo) => {
  if (isS3) {
    await startTestingApp({ isWeb, isS3, webServerPort, testInfo });
    await closeWelcomePlaywright();
  } else {
    // extconfig.js sets ExtIsFirstRun = false, which disables the
    // license/onboarding flow. The mobile-teaser dialog is wired to NOT
    // auto-open in that case (see MobileTeaserDialogContextProvider), so the
    // teaser never pops over the tests — we open it on demand from the Help
    // panel instead. TST9401 asserts that suppression explicitly.
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

test.describe('TST94 - Mobile apps teaser dialog', () => {
  test('TST9401 - Does not auto-open on startup when onboarding is disabled via extconfig [electron,web,s3]', async () => {
    // With onboarding disabled through extconfig (ExtIsFirstRun = false), the
    // teaser must stay hidden on startup. The dialog uses keepMounted, so the
    // close button can be attached-but-hidden — assert on visibility.
    expect(
      await global.client.isVisible('[data-tid=closeMobileTeaserTID]'),
    ).toBe(false);
  });

  test('TST9402 - Open from Help panel, navigate slides, dismiss with "do not show again" [electron,web,s3]', async () => {
    // Open the Help & Feedback side panel.
    await clickOn('[data-tid=helpFeedback]');

    // The "Get Android App" entry opens the teaser on the Android slide (index 1).
    await clickOn('[data-tid=getAndroidAppTID]');
    await global.client.waitForSelector('[data-tid=closeMobileTeaserTID]', {
      timeout: 5000,
      state: 'visible',
    });

    // On the last slide: Next is disabled, Back is enabled.
    expect(
      await global.client.isDisabled('[data-tid=mobileTeaserNextTID]'),
    ).toBe(true);
    expect(
      await global.client.isDisabled('[data-tid=mobileTeaserBackTID]'),
    ).toBe(false);

    // Go back to the first (iOS) slide — Swiper transition is 500ms.
    await clickOn('[data-tid=mobileTeaserBackTID]');
    await global.client.waitForTimeout(600);

    // On the first slide: Back is disabled, Next is enabled again.
    expect(
      await global.client.isDisabled('[data-tid=mobileTeaserBackTID]'),
    ).toBe(true);
    expect(
      await global.client.isDisabled('[data-tid=mobileTeaserNextTID]'),
    ).toBe(false);

    // Toggle "Do not show this again" (a TsSwitch — target its inner input).
    const toggle = '[data-tid=mobileTeaserDoNotShowTID] input';
    await global.client.check(toggle);
    expect(await global.client.isChecked(toggle)).toBe(true);

    // Close via the X.
    await clickOn('[data-tid=closeMobileTeaserTID]');
    await global.client.waitForSelector('[data-tid=closeMobileTeaserTID]', {
      timeout: 3000,
      state: 'hidden',
    });

    // The preference is persisted to redux-persist (settings.hideMobileTeaser).
    const hidden = await global.client.evaluate(() => {
      const root = JSON.parse(localStorage.getItem('persist:root') || '{}');
      if (!root.settings) return null;
      return JSON.parse(root.settings).hideMobileTeaser;
    });
    expect(hidden).toBe(true);
  });
});
