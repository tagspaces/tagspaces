/* Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved. */
import { Application } from 'spectron';
import electronPath from 'electron';
import pathLib from 'path';

const winMinio = pathLib.resolve(__dirname, '../bin/minio.exe');
const unixMinio = 'minio';

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
  await global.app.webContents.executeJavaScript('localStorage.clear()');
  global.app.webContents.reload();
  // browser.clearLocalStorage();
  // global.app.client.localStorage('DELETE');
  // global.app.client.reload(false);
}

export async function startSpectronApp() {
  if (global.isWeb) {
    const webdriverio = await require('webdriverio');
    const options = {
      host: 'localhost', // Use localhost as chrome driver server
      port: 9515, // "9515" is the port opened by chrome driver.
      capabilities: {
        browserName: 'chrome'
        /*'goog:chromeOptions': {
          binary: electronPath, // Path to your Electron binary.
          args: [ /!* cli arguments *!/] // Optional, perhaps 'app=' + /path/to/your/app/
        }*/
      },
      logLevel: 'silent'
    };
    global.client = await webdriverio.remote(options);
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
