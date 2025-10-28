// import { clickOn } from './general.helpers';

export async function clearStorage() {
  // Clear cookies and local storage data
  //await global.context.clearCookies();
  //await global.client.clearStorageState();

  if (global.client) {
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
  }
}
