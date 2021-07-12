import { clickOn } from './general.helpers';

export async function clearStorage() {
  await clickOn('[data-tid=settings]');
  await clickOn('[data-tid=advancedSettingsDialogTID]');
  await clickOn('[data-tid=resetSettingsTID]');
  await clickOn('[data-tid=confirmResetSettingsDialogTID]');
}
