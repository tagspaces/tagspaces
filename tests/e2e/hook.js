/* Copyright (c) 2016-present - TagSpaces GmbH. All rights reserved. */
import fse from 'fs-extra';
import os from 'os';
import pathLib from 'path';
import {
  createDir,
  refreshS3testData,
  uploadFile,
} from '../s3rver/S3DataRefresh';

const windowWidth = 1400;
const windowHeight = 800;

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

export async function clearLocalStorage(isWeb) {
  /*if (!(await clearStorage())) {
    // TODO session is not implemented https://github.com/electron-userland/spectron/issues/117
    // await global.app.webContents.session.clearStorageData();
    global.app.webContents.reload();
  }*/
  if (isWeb) {
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

export async function copyExtConfig(
  { isWeb, isS3, testDataDir },
  extconfig = 'extconfig-with-welcome.js',
) {
  let srcDir;
  if (isWeb) {
    srcDir = pathLib.join(
      __dirname,
      '..',
      '..',
      'scripts',
      'web' + (isS3 ? 's3' : '') + extconfig,
    );

    if (!fse.existsSync(srcDir)) {
      srcDir = pathLib.join(
        __dirname,
        '..',
        '..',
        'scripts',
        (isS3 ? 's3' : '') + extconfig,
      );
    }
    if (!fse.existsSync(srcDir)) {
      srcDir = pathLib.join(__dirname, '..', '..', 'scripts', extconfig);
    }
  } else {
    srcDir = pathLib.join(
      __dirname,
      '..',
      '..',
      'scripts',
      (isS3 ? 's3' : '') + extconfig,
    );
    if (!fse.existsSync(srcDir)) {
      srcDir = pathLib.join(__dirname, '..', '..', 'scripts', extconfig);
    }
  }
  const destDir = pathLib.join(
    __dirname,
    '..',
    '..',
    isWeb ? 'web' : 'release/app/dist/renderer',
    'extconfig.js',
  );
  await fse.copy(srcDir, destDir);
  if (testDataDir) {
    await searchAndReplaceInFile(destDir, 'testdata-tmp', testDataDir);
  }
}

async function searchAndReplaceInFile(filePath, searchValue, replaceValue) {
  try {
    // 1. Read file as UTF‑8 text
    let content = await fse.readFile(filePath, 'utf8');

    // 2. Replace: if searchValue is a string, only first occurrence;
    //    use RegExp with global flag to replace all occurrences
    const updated = content.replace(
      typeof searchValue === 'string'
        ? new RegExp(searchValue, 'g')
        : searchValue, // assume user passed a RegExp
      replaceValue,
    );

    // 3. Write it back
    await fse.writeFile(filePath, updated, 'utf8');

    // console.log(`✓ Updated ${filePath}`);
  } catch (err) {
    console.error(`✗ Error processing file:`, err);
  }
}

export async function removeExtConfig(isWeb) {
  //if (!isWeb) {
  await fse.remove(
    pathLib.join(
      __dirname,
      '..',
      '..',
      isWeb ? 'web' : 'release/app/dist/renderer',
      'extconfig.js',
    ),
  );
  //  }
}

const waitForMainMessage = (electronApp, messageId) => {
  return electronApp.evaluate(({ ipcMain }, messageId) => {
    return new Promise((resolve) => {
      ipcMain.once(messageId, () => resolve());
    });
  }, messageId);
};

const waitForAppLoaded = async (electronApp) => {
  await waitForMainMessage(electronApp, 'startup-finished');
};

export async function startTestingApp(
  { isWeb, isS3, webServerPort, testInfo },
  extconfig,
) {
  if (extconfig) {
    await copyExtConfig(
      { isWeb, isS3, testDataDir: `testdata-${testInfo.workerIndex}` },
      extconfig,
    );
  } else {
    await removeExtConfig(isWeb);
  }
  const chromeDriverArgs = [
    // '--disable-gpu',
    '--disable-infobars',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-extensions',
    '--window-size=' + windowWidth + ',' + windowHeight,
  ];
  if (process.env.HEADLESS_MODE === 'true') {
    chromeDriverArgs.push('--headless');
  }

  if (isWeb) {
    const { webkit, chromium } = require('playwright-core');
    global.app = await chromium.launch({
      headless: process.env.HEADLESS_MODE === 'true',
      slowMo: 50,
    }); //browser

    global.context = await global.app.newContext({
      viewport: { width: windowWidth, height: windowHeight },
    });

    global.client = await global.context.newPage(); //page
    await global.client.goto('http://localhost:' + webServerPort);
    // await global.client.screenshot({ path: `example.png` });
    // await global.client.close();
  } else {
    //if (global.isPlaywright) {
    const { _electron: electron } = require('@playwright/test');
    // 1. Create a unique temporary directory for user data
    const userDataDir = fse.mkdtempSync(
      pathLib.join(os.tmpdir(), `electron-user-data-${testInfo.workerIndex}`),
    ); // :contentReference[oaicite:1]{index=1}

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
        `--user-data-dir=${userDataDir}`,
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
        // ...process.env,     // Preserve existing environment variables
        ELECTRON_ENABLE_LOGGING: true,
        ELECTRON_ENABLE_STACK_DUMPING: true,
        // NODE_ENV: 'test'
      },
    });
    const startupPromise = waitForAppLoaded(global.app);
    const appPath = await global.app.evaluate(async ({ app }) => {
      // This runs in the main Electron process, parameter here is always
      // the result of the require('electron') in the main app script.
      return app.getAppPath();
    });
    console.log('appPath:' + appPath);
    global.app.on('console', (msg) => {
      console.log(`[Electron Main] ${msg.type()}: ${msg.text()}`);
    });
    /* const mainProcess =  global.app.process();

    // 3. Pipe its stdout / stderr to your Playwright test’s console
    mainProcess.stdout.on("data", (chunk) => {
      // chunk is a Buffer; convert to string
      const text = chunk.toString("utf-8").trim();
      if (text)
        console.log(`[main stdout] ${text}`);
    });*/
    /* mainProcess.stderr.on("data", (chunk) => {
      const text = chunk.toString("utf-8").trim();
      if (text)
        console.error(`[main stderr] ${text}`);
    });*/

    // Get the Electron context.
    global.context = await global.app.context();
    await global.app.waitForEvent('window');
    // Get the first window that the app opens, wait if necessary.
    global.client = await global.app.firstWindow();
    // global.session = await global.client.context().newCDPSession(global.client);
    // Setting the viewport size helps keep test environments consistent.
    await global.client.setViewportSize({ width: windowWidth, height: windowHeight }); //{width: 1200,height: 800} ({ width: 800, height: 600 });
    await global.client.waitForLoadState('load'); //'domcontentloaded'); //'networkidle');

    if (process.env.SHOW_CONSOLE) {
      // Direct Electron console to Node terminal.
      global.client.on('console', console.debug);
    }
    await startupPromise;
  }
}

export async function stopApp(isWeb) {
  if (isWeb) {
    await global.context.close();
    // await global.client.closeWindow();
  } else if (global.app) {
    // global.isPlaywright &&
    await global.app.close();
  }
}

export async function testDataRefresh(isS3, testDataDir) {
  if (isS3) {
    //console.log('testDataDir:'+testDataDir);
    await refreshS3testData(testDataDir);
    //} else (isMinio){ todo minio
  } else {
    await fse.rm(testDataDir, {
      recursive: true,
      force: true,
      maxRetries: 5, // retry on EBUSY/EMFILE/ENFILE
      retryDelay: 100, // optional back‑off in ms
    });
    const src = pathLib.join(
      __dirname,
      '..',
      'testdata',
      'file-structure',
      'supported-filestypes',
    );
    //let newPath = pathLib.join(testDataDir, pathLib.basename(src));
    //console.log('newPath:'+testDataDir);
    await fse.copy(src, testDataDir); //, { overwrite: true });
  }
}

/*export async function deleteTestData() {
  const testDataDir = pathLib.join(
    __dirname,
    '..',
    'testdata-tmp',
    'file-structure',
    'supported-filestypes',
  );
  await fse.rm(testDataDir, {
    recursive: true,
    force: true,
    maxRetries: 5, // retry on EBUSY/EMFILE/ENFILE
    retryDelay: 100, // optional back‑off in ms
  });
  // await fse.emptyDir(testDataDir);
}*/

export async function createFileS3(
  fileName = 'empty_file.html',
  fileContent = '',
  rootFolder = 'empty_folder',
) {
  const filePath = pathLib.join(
    __dirname,
    '..',
    'testdata',
    'file-structure',
    'supported-filestypes',
    rootFolder,
    fileName,
  );
  await uploadFile(filePath, fileContent); //test content');
}
export async function createLocalFile(
  testDataDir,
  fileName = 'empty_file.html',
  fileContent = undefined,
  rootFolder = 'empty_folder',
) {
  const filePath = pathLib.join(testDataDir, rootFolder, fileName);
  try {
    if (fileContent) {
      await fse.outputFile(filePath, fileContent);
      console.log('file override:' + filePath);
    } else {
      await fse.createFile(filePath);
      console.log('Empty file created!');
    }
  } catch (err) {
    console.error(err);
  }
}

export async function createLocalFolder(
  testDataDir,
  folderName = 'empty_local_folder',
  rootFolder = 'empty_folder',
) {
  const folderPath = pathLib.join(testDataDir, rootFolder, folderName);
  try {
    await fse.mkdir(folderPath);
    console.log('Folder created! ' + folderPath);
  } catch (err) {
    console.error(err);
  }
}

export async function createFolderS3(
  folderName = 'empty_local_folder',
  rootFolder = 'empty_folder',
) {
  const folderPath = (rootFolder ? rootFolder + '/' : '') + folderName; //pathLib.join(rootFolder, folderName);

  try {
    await createDir(folderPath);
    console.log('Folder created! ' + folderPath);
  } catch (err) {
    console.error(err);
  }
}
