// import { clickOn } from './general.helpers';

export async function clearStorage() {
  // Clear cookies and local storage data
  //await global.context.clearCookies();
  //await global.client.clearStorageState();

  // Evaluate JavaScript to clear local storage.
  await global.client.evaluate(() => {
    window.localStorage.clear();
  });
  await global.client.evaluate(() => {
    window.sessionStorage.clear();
  });
  // Execute JavaScript to clear cookies.
  await global.client.evaluate(() => {
    document.cookie.split(';').forEach(function (c) {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });
  });
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
  /*await clickOn('[data-tid=settings]', { timeout: 20000 });
  await clickOn('[data-tid=advancedSettingsDialogTID]');
  await global.client.waitForTimeout(500);
  await clickOn('[data-tid=resetSettingsTID]');
  await global.client.waitForTimeout(500);
  await clickOn('[data-tid=confirmResetSettingsDialogTID]');*/
  //}
}
