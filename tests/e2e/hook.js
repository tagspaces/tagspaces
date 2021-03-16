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
    //clearAllURLParams && clears everything in localStorage
    await global.client.execute(
      "window.history.pushState('', document.title, window.location.pathname);localStorage.clear();"
    );
    // global.client.executeScript('window.localStorage.clear()');
    // global.client.clearLocalStorage();
    // window.localStorage.clear();
    //await global.client.reloadSession();
    await global.client.refresh();
  } else {
    await global.app.webContents.executeJavaScript(
      "window.history.pushState('', document.title, window.location.pathname);localStorage.clear()"
    );
    global.app.webContents.reload();
  }
  // browser.clearLocalStorage();
  // global.app.client.localStorage('DELETE');
  // global.app.client.reload(false);
}

export async function startSpectronApp() {
  const chromeDriverArgs = [
    // '--disable-gpu',
    '--disable-infobars',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-extensions',
    '--window-size=1920,1080'
  ];
  if (global.isHeadlessMode) {
    chromeDriverArgs.push('--headless');
  }

  if (global.isWeb) {
    //require('scripts/wdio.conf');
    const webdriverio = require('webdriverio');
    // https://webdriver.io/docs/configurationfile.html

    const options = {
      host: 'localhost', // Use localhost as chrome driver server
      port: 9515, // "9515" is the port opened by chrome driver.
      capabilities: {
        browserName: 'chrome',
        'goog:chromeOptions': {
          w3c: true,
          args: chromeDriverArgs
        }
        // pageLoadStrategy: 'normal'
      },
      // Warns when a deprecated command is used
      deprecationWarnings: true,
      // If you only want to run your tests until a specific amount of tests have failed use
      // bail (default is 0 - don't bail, run all tests).
      bail: 0,
      reporters: ['spec'],
      /* afterTest: [async function(
        test,
        context,
        { error, result, duration, passed, retries }
      ) => {
        await takeScreenshot();
        await clearLocalStorage();
      }], */
      waitforTimeout: 5000,
      maxInstances: 1,
      // logLevel: 'debug'
      logLevel: 'silent',
      coloredLogs: true
    };
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
    setWdioImageComparisonService(global.client);

    await global.client.url('http://localhost:8000');
  } else {
    global.app = new Application({
      path: electronPath,
      args: [pathLib.join(__dirname, '..', '..', 'app')],
      // startTimeout: 500,
      waitTimeout: 1000,
      waitforInterval: 50,
      chromeDriverArgs: chromeDriverArgs
    });
    await global.app.start();
    global.client = global.app.client;
    await global.client.waitUntilWindowLoaded();
  }
}

function setWdioImageComparisonService(browser) {
  global.browser = browser;
  const WdioImageComparisonService = require('wdio-image-comparison-service')
    .default;
  let wdioImageComparisonService = new WdioImageComparisonService({
    baselineFolder: pathLib.join(__dirname, '../test-pages/Baseline/'),
    formatImageName: '{tag}-{logName}-{width}x{height}',
    screenshotPath: pathLib.join(__dirname, '../test-pages/'),
    savePerInstance: true,
    autoSaveBaseline: true,
    blockOutStatusBar: true,
    blockOutToolBar: true
  });
  // wdioImageComparisonService.defaultOptions.autoSaveBaseline = true;
  browser.defaultOptions = wdioImageComparisonService.defaultOptions;
  browser.folders = wdioImageComparisonService.folders;

  wdioImageComparisonService.before(browser.capabilities);
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

export async function takeScreenshot(name = expect.getState().currentTestName) {
  // if (jasmine.currentTest.failedExpectations.length > 0) {
  if (global.isWeb) {
    await global.client.saveFullPageScreen(`${name}`, {
      fullPageScrollTimeout: '1500'
    });
  } else {
    // await global.client.takeScreenshot();
    const filename = `${name}.png`; // -${new Date().toISOString()}
    //.replace(/\s/g, '_')
    //.replace(/:/g, '')
    //.replace(/\*/g, '')
    //.replace(/-/g, '');
    const imageBuffer = await global.app.browserWindow.capturePage();
    const fs = require('fs-extra');
    const path = pathLib.resolve(__dirname, 'test-pages', filename);
    fs.outputFile(path, imageBuffer, 'base64');
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
