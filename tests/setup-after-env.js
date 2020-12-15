import {
  clearLocalStorage,
  startSpectronApp,
  stopSpectronApp
} from './e2e/hook';
import { closeWelcome } from './e2e/welcome.helpers';

// the default timeout before starting every test
jasmine.DEFAULT_TIMEOUT_INTERVAL = 150000;

global.isWin = /^win/.test(process.platform);
global.isMac = /^darwin/.test(process.platform);
global.isWeb = process.env.NODE_JEST === 'test_web';
global.isMinio = global.isWeb || process.env.NODE_JEST === 'test_minio';
global.isUnitTest = process.env.NODE_JEST === 'unit_test';

beforeAll(async () => {
  /*if (global.isWeb) {
    global.webserver = await startWebServer();
    global.chromeDriver = await startChromeDriver();
  }
  if (global.isMinio) {
    global.minio = await startMinio();
  } else {
    // copy extconfig
    const fse = require('fs-extra');
    const path = require('path');

    let srcDir = path.join(__dirname, '..', 'scripts', 'extconfig.js');
    let destDir = path.join(__dirname, '..', 'app', 'extconfig.js');

    fse.copySync(srcDir, destDir);
  }*/
  if (!global.isUnitTest) {
    await startSpectronApp();
  }
});

afterAll(async () => {
  /*if (global.isWeb) {
    // await stopWebServer(global.webserver); TODO stop webserver
    await stopChromeDriver(global.chromeDriver);
  }
  if (global.isMinio) {
    await stopMinio(global.minio);
  } else {
    // cleanup extconfig
    const fse = require('fs-extra');
    const path = require('path');
    fse.removeSync(path.join(__dirname, '..', 'app', 'extconfig.js'));
  }*/
  if (!global.isUnitTest) {
    await stopSpectronApp();
  }
});

beforeEach(async () => {
  if (!global.isUnitTest) {
    await closeWelcome();
  }
});

afterEach(async () => {
  if (!global.isUnitTest) {
    await clearLocalStorage();
  }
});
