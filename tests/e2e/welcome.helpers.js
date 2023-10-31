import { clearStorage } from './clearstorage.helpers';

export async function clearDataStorage() {
  if (global.isWeb) {
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
  try {
    const el = await global.client.waitForSelector(
      '[data-tid=closeOnboardingDialog]',
      {
        timeout: 3000,
        state: 'visible',
      },
    );
    if (el) {
      await el.click();
      /*
      await global.client.click('[data-tid=nextStepOnboarding]');
      await global.client.click('[data-tid=nextStepOnboarding]');
      await global.client.click('[data-tid=nextStepOnboarding]');
      await global.client.click('[data-tid=nextStepOnboarding]');
      await global.client.click('[data-tid=startTagSpacesAfterOnboarding]');
      */
      await global.client.click('[data-tid=agreeLicenseDialog]');
    }
  } catch (e) {
    //console.log('closeOnboardingDialog not exist');
  }
}
