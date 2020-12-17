import {
  clearLocalStorage,
  startSpectronApp,
  stopSpectronApp,
  testDataRefresh
} from './e2e/hook';
import { closeWelcome } from './e2e/welcome.helpers';

// the default timeout before starting every test
jasmine.DEFAULT_TIMEOUT_INTERVAL = 300000;

// global.isWin = /^win/.test(process.platform);
// global.isMac = /^darwin/.test(process.platform);
global.isWeb = process.env.NODE_JEST === 'test_web';
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

beforeAll(async () => {
  if (!global.isUnitTest) {
    testDataRefresh();
    await startSpectronApp();
  }
});

afterAll(async () => {
  if (!global.isUnitTest) {
    await stopSpectronApp();
  }
});

beforeEach(async () => {
  if (!global.isUnitTest) {
    if (global.isWeb) {
      await global.client.pause(500);
    }

    await closeWelcome();
  }
});

afterEach(async () => {
  if (!global.isUnitTest) {
    await clearLocalStorage();
  }
});
