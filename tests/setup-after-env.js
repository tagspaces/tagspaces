import {
  clearLocalStorage,
  startSpectronApp,
  stopSpectronApp,
  testDataRefresh
} from './e2e/hook';
import { closeWelcome } from './e2e/welcome.helpers';
import pathLib from 'path';

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
  if (global.isElectron) {
    // await global.client.takeScreenshot();
    const filename = `errorShot-${
      expect.getState().currentTestName
    }-${new Date().toISOString()}.png`
      .replace(/\s/g, '_')
      .replace(/:/g, '')
      .replace(/\*/g, '')
      .replace(/-/g, '');
    global.app.browserWindow.capturePage().then(function(imageBuffer) {
      const fs = require('fs');
      // const mkdirp = require('mkdirp');
      const path = pathLib.resolve(__dirname, 'test-pages', filename);
      // mkdirp.sync(path);
      fs.writeFileSync(path, imageBuffer);
    });
    /*global.app.webContents
      .savePage(
        pathLib.resolve(__dirname, 'test-pages', filename),
        'HTMLComplete'
      )
      .then(function() {
        console.log('page saved');
      })
      .catch(function(error) {
        console.error('saving page failed', error.message);
      });*/
  }
  await clearLocalStorage();
});
