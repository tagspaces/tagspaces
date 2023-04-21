import { clickOn, takeScreenshot } from './general.helpers';

export async function clearStorage() {
  if (global.session) {
    await global.session.send('Storage.clearDataForOrigin', {
      origin: 'app://',
      storageTypes:
        'appcache,cookies,filesystem,indexeddb,localstorage,serviceworkers,websql'
    }); //, { origin: 'your-electron-app-url' });
  } else {
    // await takeScreenshot('clearStorage');
    await clickOn('[data-tid=settings]', { timeout: 20000 });
    await clickOn('[data-tid=advancedSettingsDialogTID]');
    await clickOn('[data-tid=resetSettingsTID]');
    await clickOn('[data-tid=confirmResetSettingsDialogTID]');
  }
}
