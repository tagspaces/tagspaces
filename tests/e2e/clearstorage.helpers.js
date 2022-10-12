import { clickOn, takeScreenshot } from './general.helpers';

export async function clearStorage() {
  await takeScreenshot('clearStorage');
  await clickOn('[data-tid=settings]', { timeout: 20000 });
  await clickOn('[data-tid=advancedSettingsDialogTID]');
  await clickOn('[data-tid=resetSettingsTID]');
  await clickOn('[data-tid=confirmResetSettingsDialogTID]');
}
