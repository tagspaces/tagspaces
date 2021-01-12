import pathLib from 'path';
import {
  startSpectronApp,
  stopSpectronApp,
  takeScreenshot,
  testDataRefresh
} from './e2e/hook';
import { closeWelcome } from './e2e/welcome.helpers';
import { clearStorage } from './e2e/clearstorage.helpers';

// the default timeout before starting every test
jasmine.DEFAULT_TIMEOUT_INTERVAL = 300000;

// global.isWin = /^win/.test(process.platform);
// global.isMac = /^darwin/.test(process.platform);
global.isWeb = process.env.NODE_JEST === 'test_web';
global.isHeadlessChrome = process.env.HEADLESS_CHROME === 'headless_chrome';
global.isMinio = global.isWeb || process.env.NODE_JEST === 'test_minio';
global.isElectron = process.env.NODE_JEST === 'test_electron';
global.isUnitTest =
  process.env.NODE_JEST === 'unit_test' ||
  (!global.isElectron && !global.isMinio && !global.isWeb);

/*jasmine.getEnv().addReporter({
  specStarted: function(result) {
    console.log(`Spec name: ${result.fullName}, description: ${result.description}`);
  }
});*/

/*jasmine.getEnv().addReporter({
  specStarted: result => (jasmine.currentTest = result)
});*/

jasmine.getEnv().addReporter({
  specDone: async result => {
    if (result.status !== 'disabled') {
      console.log('specDone Done' + JSON.stringify(result));
      if (result.status === 'failed') {
        await takeScreenshot();
      }
      // await clearLocalStorage(); //todo https://trello.com/c/hMCSKXWU/554-fix-takescreenshots-in-tests
    }
  }
});

beforeAll(async () => {
  testDataRefresh();
  await startSpectronApp();
});

afterAll(async () => {
  await stopSpectronApp();
});

beforeEach(async () => {
  if (global.isWeb) {
    await global.client.pause(500);
  }

  await closeWelcome();
});

afterEach(async () => {
  // takeScreenshot();
  // await clearLocalStorage();
  await clearStorage();
});
