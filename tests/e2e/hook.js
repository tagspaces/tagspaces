/* Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved. */
import electronPath from 'electron';
import pathLib from 'path';
import fse from 'fs-extra';

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
    if (isPlaywright) {
      const windowHandle = await global.client.evaluateHandle(() => window);
      const title = await global.client.evaluateHandle(() => document.title);
      windowHandle.history.pushState('', title, windowHandle.location.pathname);
    } else {
      //clearAllURLParams && clears everything in localStorage
      await global.client.execute(
        "window.history.pushState('', document.title, window.location.pathname);localStorage.clear();"
      );
      // global.client.executeScript('window.localStorage.clear()');
      // global.client.clearLocalStorage();
      // window.localStorage.clear();
      //await global.client.reloadSession();
      await global.client.refresh();
    }
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

export async function copyExtConfig(extconfig = 'extconfig-with-welcome.js') {
  const srcDir = pathLib.join(__dirname, '..', '..', 'scripts', extconfig);
  const destDir = pathLib.join(__dirname, '..', '..', 'app', 'extconfig.js');
  await fse.copy(srcDir, destDir);
}

export async function removeExtConfig() {
  await fse.remove(pathLib.join(__dirname, '..', 'app', 'extconfig.js'));
}

export async function startTestingApp(extconfig) {
  if (extconfig) {
    await copyExtConfig(extconfig);
  }
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
    if (global.isPlaywright) {
      const { webkit, chromium } = require('playwright');
      global.app = await chromium.launch({
        headless: global.isHeadlessMode,
        slowMo: 50
      }); //browser

      global.context = await global.app.newContext({
        viewport: { width: 1920, height: 1080 }
      });

      global.client = await global.context.newPage(); //page
      await global.client.goto('http://localhost:8000');
      // await global.client.screenshot({ path: `example.png` });
      // await global.client.close();
    } else {
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
    }
  } else if (global.isPlaywright) {
    const { _electron: electron } = require('playwright');
    // Launch Electron app.
    global.app = await electron.launch({
      args: [
        pathLib.join(__dirname, '..', '..', 'app', 'main.prod.js'),
        // `--user-data-dir=${tempDir.path}`,
        '--no-sandbox',
        '--whitelisted-ips',
        // '--enable-logging', // after enabling cmd windows appears in Windows
        '--ignore-certificate-errors',
        '--ignore-ssl-errors',
        '--disable-dev-shm-usage'
      ],
      env: {
        ELECTRON_ENABLE_LOGGING: true,
        ELECTRON_ENABLE_STACK_DUMPING: true,
        NODE_ENV: 'test'
      }
    });

    // Get the first window that the app opens, wait if necessary.
    global.client = await global.app.firstWindow();
    await global.client.waitForLoadState('load'); //'domcontentloaded'); //'networkidle');
    // await global.client.bringToFront();

    // Print the title.
    // console.log(await global.client.title());

    if (process.env.SHOW_CONSOLE) {
      // Direct Electron console to Node terminal.
      global.client.on('console', console.debug);
    }
    // Click button.
    /*await global.client.click('[data-tid=location_supported-filestypes]');
    // Capture a screenshot.
    await global.client.screenshot({
      path: pathLib.join(__dirname, 'intro.png')
    });*/
    // Exit app.
    // await global.app.close();
  } else {
    const { Application } = require('spectron');
    global.app = new Application({
      path: electronPath,
      args: [pathLib.join(__dirname, '..', '..', 'app')],
      // startTimeout: 500,
      waitTimeout: 1000,
      waitforInterval: 50,
      maxInstances: 1,
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
  if (global.isPlaywright && global.app) {
    await global.app.close();
  } else if (global.isWeb) {
    await global.client.closeWindow();
    // await global.client.end();
  } else if (global.app && global.app.isRunning()) {
    // await clearLocalStorage();
    return global.app.stop();
  }
}

export async function testDataRefresh() {
  const fse = require('fs-extra');
  //const gracefulFs = require('graceful-fs')
  //gracefulFs.gracefulify(fse);

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
  /*if (global.isElectron && global.client) {
    await global.client.waitForTimeout(1000);
  }*/
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
