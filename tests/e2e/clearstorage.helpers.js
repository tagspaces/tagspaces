import { clickOn } from './general.helpers';

export async function clearStorage() {
  /*if (global.session) {
    //await global.client.evaluate(() => window.localStorage.clear());
    //await global.client.evaluate(() => window.sessionStorage.clear());
    /!*await global.client.evaluate(() => {
      window.history.pushState('', document.title, window.location.pathname);
      window.localStorage.clear();
    });*!/
    await global.client.context().storageState({});
    await global.session.send('Storage.clearDataForOrigin', {
      origin: '*', //'app://',
      storageTypes: 'all'
      // 'appcache,cookies,filesystem,indexeddb,localstorage,serviceworkers,websql'
    }); //, { origin: 'your-electron-app-url' });
    await global.client.reload();
  } else {*/
  // await takeScreenshot('clearStorage');
  await clickOn('[data-tid=settings]', { timeout: 20000 });
  await clickOn('[data-tid=advancedSettingsDialogTID]');
  await clickOn('[data-tid=resetSettingsTID]');
  await clickOn('[data-tid=confirmResetSettingsDialogTID]');
  //}
}
