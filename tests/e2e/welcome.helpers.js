export async function closeWelcome() {
  const nextButton = await global.client.$('[data-tid=nextStepOnboarding]');
  await nextButton.click();
  await nextButton.click();
  await nextButton.click();
  await nextButton.click();
  const startButton = await global.client.$(
    '[data-tid=startTagSpacesAfterOnboarding]'
  );
  await startButton.click();
  const agreeLicenseDialog = await global.client.$(
    '[data-tid=agreeLicenseDialog]'
  );
  await agreeLicenseDialog.click();
}
