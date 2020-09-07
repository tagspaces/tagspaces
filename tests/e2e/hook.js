/* Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved. */
import { Application } from 'spectron';
import electronPath from 'electron';
import path from 'path';
import { closeWelcome } from './welcome.helpers';
import {
  startChromeDriver,
  startMinio,
  startWebServer,
  stopChromeDriver,
  stopMinio,
  stopWebServer
} from './test-utils.spec';

// Spectron API https://github.com/electron/spectron
// Webdriver.io http://webdriver.io/api.html

export const delay = time => new Promise(resolve => setTimeout(resolve, time));

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
export const getRandomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// the default timeout before starting every test
jasmine.DEFAULT_TIMEOUT_INTERVAL = 150000;

// use this pause only for visual debuging on places where you want to see the result after a given operation
// global.msDebugPause = 0;

// the default timeout before starting every test
// global.msPause = 3000;

global.isWin = /^win/.test(process.platform);
global.isMac = /^darwin/.test(process.platform);
global.isWeb = process.env.NODE_JEST === 'test_web';
global.isMinio = global.isWeb || process.env.NODE_JEST === 'test_minio';

export function clearLocalStorage() {
  // global.app.client.localStorage('DELETE');
  // global.app.client.reload(false);
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

beforeAll(async () => {
  if (global.isWeb) {
    global.webserver = await startWebServer();
    global.chromeDriver = await startChromeDriver();
  }
  if (global.isMinio) {
    global.minio = await startMinio();
  }
});

afterAll(async () => {
  if (global.isWeb) {
    // await stopWebServer(global.webserver); TODO stop webserver
    await stopChromeDriver(global.chromeDriver);
  }
  if (global.isMinio) {
    await stopMinio(global.minio);
  }
});

beforeEach(async () => {
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
      args: [path.join(__dirname, '..', '..', 'app')]
    });
    await global.app.start();
    global.client = global.app.client;
    await global.client.waitUntilWindowLoaded();
  }
  // global.app.browserWindow.focus();
  //let windowCount = await global.client.getWindowCount();
  // expect(windowCount).to.equal(2);
  // const mainWindow = await global.client.getWindowHandle();
  await closeWelcome();
  //windowCount = await global.client.getWindowCount();
  //expect(windowCount).to.equal(1);
  //const windowHandles = await global.client.getWindowHandles();
  //global.client.switchToWindow(windowHandles[0]);
  //global.client.switchToWindow(mainWindow);
});

afterEach(() => {
  if (global.app && global.app.isRunning()) {
    clearLocalStorage();
    return global.app.stop();
  }
});
