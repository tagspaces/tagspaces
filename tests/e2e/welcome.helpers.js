import { clearStorage } from './clearstorage.helpers';

export async function clearDataStorage(isWeb) {
  if (isWeb) {
    //await global.context.clearCookies();
    //await global.context.clearStorageState();
    await global.client.evaluate(() => {
      window.history.pushState('', document.title, window.location.pathname);
      localStorage.clear();
    });
    await global.client.reload();
  } else {
    // await closeWelcomePlaywright();
    await clearStorage();
  }

  // await closeWelcomePlaywright();
}

export async function closeWelcomePlaywright() {
  // Order matters since the onboarding redesign: the License dialog now
  // opens alone first, and the Onboarding wizard is chained from the
  // license-accept handler. Dismiss them in that order. Each step is best-
  // effort — if the user already accepted the license in a prior test in
  // the same worker, the wait will timeout harmlessly.
  let licenseFound = false;
  try {
    const license = await global.client.waitForSelector(
      '[data-tid=agreeLicenseDialog]',
      { timeout: 3000, state: 'visible' },
    );
    if (license) {
      await license.click();
      licenseFound = true;
    }
  } catch (e) {
    // license dialog not present — nothing to accept
  }
  // Onboarding only chains in if the license was just accepted. Skip the
  // wait otherwise to avoid penalising tests where neither dialog is up.
  if (licenseFound) {
    try {
      const onboarding = await global.client.waitForSelector(
        '[data-tid=closeOnboardingDialog]',
        { timeout: 3000, state: 'visible' },
      );
      if (onboarding) await onboarding.click();
    } catch (e) {
      // onboarding wizard not present (e.g., onboardingCompleted already)
    }
  }
}
