import { clickOn } from './general.helpers';

export async function clearStorage() {
  await global.client.pause(500);
  await clickOn('[data-tid=settings]');
  //await clickOn('[data-tid=settings]');
  // const settingsDialog = await global.client.$('[data-tid=settingsDialog]');
  // await settingsDialog.waitForDisplayed();
  // await settingsDialog.click();
  await global.client.pause(500);
  await clickOn('[data-tid=resetSettingsTID]');
  await clickOn('[data-tid=confirmResetSettingsDialogTID]');
  return true;
}
