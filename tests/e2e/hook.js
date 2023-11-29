/* Copyright (c) 2016-present - TagSpaces UG (Haftungsbeschraenkt). All rights reserved. */
import pathLib from 'path';
import fse from 'fs-extra';
// import { execSync } from 'child_process';

// Spectron API https://github.com/electron/spectron
// Webdriver.io http://webdriver.io/api.html

export const delay = (time) =>
  new Promise((resolve) => setTimeout(resolve, time));

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
export const getRandomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export function writeFile(filePath, fileContent) {
  fse.writeFileSync(filePath, fileContent);
}
export function checkFileExist(filePath) {
  return fse.existsSync(filePath);
}
// use this pause only for visual debuging on places where you want to see the result after a given operation
// global.msDebugPause = 0;

// the default timeout before starting every test
// global.msPause = 3000;

/**
 * https://github.com/microsoft/playwright/issues/18041
 * lsof -i :49352
 * pid: number
 * Returns: boolean true if the process was started by playwright.
 */
/*export const wasProcessStartedByPlaywright = (pid) => {
  // get parent tree
  const tree = execSync(`pstree -s -h -p -t -c -p ${pid}`)
    .toString()
    .trim();

  // check if any of the parents has a command that contains the string "playwright"
  const hasPlaywright = tree.includes('playwright');

  console.log(`Process ${pid} was started by Playwright: ${hasPlaywright}`);

  return hasPlaywright;
};*/

export async function clearLocalStorage() {
  /*if (!(await clearStorage())) {
    // TODO session is not implemented https://github.com/electron-userland/spectron/issues/117
    // await global.app.webContents.session.clearStorageData();
    global.app.webContents.reload();
  }*/
  if (global.isWeb) {
    const windowHandle = await global.client.evaluateHandle(() => window);
    const title = await global.client.evaluateHandle(() => document.title);
    windowHandle.history.pushState('', title, windowHandle.location.pathname);
  } else {
    await global.app.webContents.executeJavaScript(
      "window.history.pushState('', document.title, window.location.pathname);localStorage.clear()",
    );
    global.app.webContents.reload();
  }
  // browser.clearLocalStorage();
  // global.app.client.localStorage('DELETE');
  // global.app.client.reload(false);
}

export async function copyExtConfig(extconfig = 'extconfig-with-welcome.js') {
  const srcDir = pathLib.join(
    __dirname,
    '..',
    '..',
    'scripts',
    global.isWeb ? 'web' + extconfig : extconfig,
  );
  const destDir = pathLib.join(
    __dirname,
    '..',
    '..',
    global.isWeb ? 'web' : 'release/app/dist/renderer',
    'extconfig.js',
  );
  await fse.copy(srcDir, destDir);
}

export async function removeExtConfig() {
  await fse.remove(
    pathLib.join(
      __dirname,
      '..',
      '..',
      global.isWeb ? 'web' : 'release/app/dist/renderer',
      'extconfig.js',
    ),
  );
}

export async function startTestingApp(extconfig) {
  if (extconfig) {
    await copyExtConfig(extconfig);
  } else {
    await removeExtConfig();
  }
  const chromeDriverArgs = [
    // '--disable-gpu',
    '--disable-infobars',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-extensions',
    '--window-size=1920,1080',
  ];
  if (global.isHeadlessMode) {
    chromeDriverArgs.push('--headless');
  }

  if (global.isWeb) {
    const { webkit, chromium } = require('playwright');
    global.app = await chromium.launch({
      headless: global.isHeadlessMode,
      slowMo: 50,
    }); //browser

    global.context = await global.app.newContext({
      viewport: { width: 1920, height: 1080 },
    });

    global.client = await global.context.newPage(); //page
    await global.client.goto('http://localhost:8000');
    // await global.client.screenshot({ path: `example.png` });
    // await global.client.close();
  } else {
    //if (global.isPlaywright) {
    const { _electron: electron } = require('playwright');
    // Launch Electron app.
    global.app = await electron.launch({
      args: [
        pathLib.join(
          __dirname,
          '..',
          '..',
          'release',
          'app',
          'dist',
          'main',
          'main.js',
        ),
        // `--user-data-dir=${tempDir.path}`,
        '--integration-testing',
        '--no-sandbox',
        '--whitelisted-ips',
        // '--enable-logging', // after enabling cmd windows appears in Windows
        '--ignore-certificate-errors',
        '--ignore-ssl-errors',
        '--disable-dev-shm-usage',
      ],
      bypassCSP: true,
      env: {
        ELECTRON_ENABLE_LOGGING: true,
        ELECTRON_ENABLE_STACK_DUMPING: true,
        // NODE_ENV: 'test'
      },
    });

    // Get the Electron context.
    global.context = await global.app.context();

    // Get the first window that the app opens, wait if necessary.
    global.client = await global.app.firstWindow();
    // global.session = await global.client.context().newCDPSession(global.client);
    await global.client.setViewportSize({ width: 1920, height: 1080 }); // ({ width: 800, height: 600 });
    await global.client.waitForLoadState('load'); //'domcontentloaded'); //'networkidle');

    if (process.env.SHOW_CONSOLE) {
      // Direct Electron console to Node terminal.
      global.client.on('console', console.debug);
    }
  }
}

export async function stopApp() {
  if (global.isWeb) {
    await global.context.close();
    // await global.client.closeWindow();
  } else if (global.app) {
    // global.isPlaywright &&
    await global.app.close();
  }
}

export async function testDataRefresh() {
  const src = pathLib.join(
    __dirname,
    '..',
    'testdata',
    'file-structure',
    'supported-filestypes',
  );
  const dst = pathLib.join(__dirname, '..', 'testdata-tmp', 'file-structure');

  let newPath = pathLib.join(dst, pathLib.basename(src));
  await fse.emptyDir(newPath);
  await fse.copy(src, newPath); //, { overwrite: true });
}

export async function createFile(
  fileName = 'empty_file.html',
  fileContent = undefined,
  rootFolder = 'empty_folder',
) {
  const filePath = pathLib.join(
    __dirname,
    '..',
    'testdata-tmp',
    'file-structure',
    'supported-filestypes',
    rootFolder,
    fileName,
  );

  try {
    if (fileContent) {
      await fse.outputFile(filePath, fileContent);
    } else {
      await fse.createFile(filePath);
      console.log('Empty file created!');
    }
  } catch (err) {
    console.error(err);
  }
}

/*export async function takeScreenshot(name = expect.getState().currentTestName) {
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
    //.replace(/\*!/g, '')
    //.replace(/-/g, '');
    const imageBuffer = await global.app.browserWindow.capturePage();
    const fs = require('fs-extra');
    const path = pathLib.resolve(__dirname, 'test-pages', filename);
    fs.outputFile(path, imageBuffer, 'base64');
    /!*global.app.webContents
        .savePage(
          pathLib.resolve(__dirname, 'test-pages', filename),
          'HTMLComplete'
        )
        .then(function() {
          console.log('page saved');
        })
        .catch(function(error) {
          console.error('saving page failed', error.message);
        });*!/
  }
}*/

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
