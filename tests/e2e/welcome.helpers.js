import { clickOn } from './general.helpers';

export async function closeWelcome() {
  const nextButton = await global.client.$('[data-tid=nextStepOnboarding]');
  await nextButton.click();
  await nextButton.click();
  await nextButton.click();
  await nextButton.click();
  await global.client.pause(500);
  await clickOn('[data-tid=startTagSpacesAfterOnboarding]');
  await global.client.pause(500);
  await clickOn('[data-tid=agreeLicenseDialog]');
}
