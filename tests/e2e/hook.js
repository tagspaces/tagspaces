/* Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved. */
import { Application } from 'spectron';
import electronPath from 'electron';
import pathLib from 'path';

// Spectron API https://github.com/electron/spectron
// Webdriver.io http://webdriver.io/api.html

export const delay = time => new Promise(resolve => setTimeout(resolve, time));

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
export const getRandomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// use this pause only for visual debuging on places where you want to see the result after a given operation
// global.msDebugPause = 0;

// the default timeout before starting every test
// global.msPause = 3000;

export async function clearLocalStorage() {
  /*if (!(await clearStorage())) {
    // TODO session is not implemented https://github.com/electron-userland/spectron/issues/117
    // await global.app.webContents.session.clearStorageData();
    global.app.webContents.reload();
  }*/
  if (global.isWeb) {
    // global.client.executeScript('window.localStorage.clear()');
    // global.client.clearLocalStorage();
    // window.localStorage.clear();
    global.client.refresh();
  } else {
    await global.app.webContents.executeJavaScript('localStorage.clear()');
    global.app.webContents.reload();
  }
  // browser.clearLocalStorage();
  // global.app.client.localStorage('DELETE');
  // global.app.client.reload(false);
}

export async function startSpectronApp() {
  if (global.isWeb) {
    const webdriverio = require('webdriverio');
    // https://webdriver.io/docs/configurationfile.html
    let options = {
      host: 'localhost', // Use localhost as chrome driver server
      port: 9515, // "9515" is the port opened by chrome driver.
      capabilities: {
        browserName: 'chrome',
        timeouts: {
          script: 60000
        }
      },
      waitforTimeout: 5000,
      // logLevel: 'debug'
      logLevel: 'silent'
    };
    if (global.isHeadlessChrome) {
      options = {
        ...options,
        capabilities: {
          browserName: 'chrome',
          'goog:chromeOptions': {
            // binary: electronPath, // Path to your Electron binary.
            // to run chrome headless the following flags are required
            // (see https://developers.google.com/web/updates/2017/04/headless-chrome)
            args: ['--headless', '--disable-gpu']
          },
          timeouts: {
            script: 60000
          }
        }
      };
    }
    // global.client = browser
    global.client = await webdriverio.remote(options);
    // global.client.setTimeout({ 'script': 60000 });
    /*client = await client
      .init()
      .setViewportSize({ width: 1024, height: 768 }, false)
      .timeouts('script', 6000)
      /!*
                 Cannot set 'implicit' timeout because of a bug in webdriverio [1].
                 [1] https://github.com/webdriverio/webdriverio/issues/974
                 *!/
      // .timeouts('implicit', 5000)
      .timeouts('pageLoad', 30000);*/

    await global.client.url('http://localhost:8000');
  } else {
    global.app = new Application({
      path: electronPath,
      args: [pathLib.join(__dirname, '..', '..', 'app')],
      // startTimeout: 500,
      waitTimeout: 1000,
      waitforInterval: 50
    });
    await global.app.start();
    global.client = global.app.client;
    await global.client.waitUntilWindowLoaded();
  }
}

export async function stopSpectronApp() {
  if (global.app && global.app.isRunning()) {
    // await clearLocalStorage();
    return global.app.stop();
  }
  if (global.isWeb) {
    await global.client.closeWindow();
    // await global.client.end();
  }
}

export function testDataRefresh() {
  const fse = require('fs-extra');
  const src = pathLib.join(
    __dirname,
    '..',
    'testdata',
    'file-structure',
    'supported-filestypes'
  );
  const dst = pathLib.join(__dirname, '..', 'testdata-tmp', 'file-structure');

  let newPath = pathLib.join(dst, pathLib.basename(src));
  fse.emptyDirSync(newPath);
  fse.copySync(src, newPath, { overwrite: true });
}

// the path the electron app, that will be tested
/* let testPath = '../tsn/app'; // '../repo/app';
if (global.isWin) {
  testPath = '..\\tsn\\app'; // '..\\repo\\app';
}

for (var index in process.argv) {
  let str = process.argv[index];
  if (str.indexOf('--webdav') == 0) {
    testPath = 'electron-app';
  }
} */

/*beforeAll(async () => {
  if (global.isWeb) {
    global.webserver = await startWebServer();
    global.chromeDriver = await startChromeDriver();
  }
  if (global.isMinio) {
    global.minio = await startMinio();
  } else {
    // copy extconfig
    const fse = require('fs-extra');
    const path = require('path');

    let srcDir = path.join(__dirname, '..', '..', 'scripts', 'extconfig.js');
    let destDir = path.join(__dirname, '..', '..', 'app', 'extconfig.js');

    fse.copySync(srcDir, destDir);
  }

  await startSpectronApp();
});

afterAll(async () => {
  if (global.isWeb) {
    // await stopWebServer(global.webserver); TODO stop webserver
    await stopChromeDriver(global.chromeDriver);
  }
  if (global.isMinio) {
    await stopMinio(global.minio);
  } else {
    // cleanup extconfig
    const fse = require('fs-extra');
    const path = require('path');
    fse.removeSync(path.join(__dirname, '..', '..', 'app', 'extconfig.js'));
  }
  await stopSpectronApp();
});*/
