import { clickOn } from './general.helpers';

export async function clearStorage() {
  if (!global.isWeb) {
    await clickOn('[data-tid=settings]');
    await global.client.pause(500);
    await clickOn('[data-tid=resetSettingsTID]');
    await clickOn('[data-tid=confirmResetSettingsDialogTID]');
    return true;
  }
  return false;
}
