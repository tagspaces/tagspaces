import { clickOn } from './general.helpers';

export async function closeWelcome() {
  const nextButton = await global.client.$('[data-tid=nextStepOnboarding]');
  if (await nextButton.isDisplayed()) {
    await nextButton.click();
    await nextButton.click();
    await nextButton.click();
    await nextButton.click();
    await global.client.pause(500);
    await clickOn('[data-tid=startTagSpacesAfterOnboarding]');
    await global.client.pause(600);
    await clickOn('[data-tid=agreeLicenseDialog]');
  }
}

export async function closeWelcomePlaywright() {
  try {
    const el = await global.client.waitForSelector(
      '[data-tid=closeOnboardingDialog]',
      {
        timeout: 3000,
        state: 'visible'
      }
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
