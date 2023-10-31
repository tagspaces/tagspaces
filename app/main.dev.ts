/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces UG (haftungsbeschraenkt)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License (version 3) as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import {
  app,
  BrowserWindow,
  dialog,
  globalShortcut,
  ipcMain,
  shell,
} from 'electron';
import windowStateKeeper from 'electron-window-state';
import path from 'path';
import fs from 'fs-extra';
import pm2 from '@elife/pm2';
import findFreePorts from 'find-free-ports';
import propertiesReader from 'properties-reader';
//import i18n from '-/services/i18n'; // '-/i18nBackend';
import buildTrayIconMenu from '-/electron-tray-menu';
import buildDesktopMenu from '-/services/electron-menus';
import settings from '-/settings';
import { getExtensions } from '-/utils/extension-utils';
import i18nInit from '-/services/i18nInit';
const contextMenu = require('electron-context-menu');

// delete process.env.ELECTRON_ENABLE_SECURITY_WARNINGS;
// process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

// Enable the context with menu items such as cut, copy, paste or select all
contextMenu({
  showInspectElement: false,
  showSearchWithGoogle: false,
  showLookUpSelection: false,
  showServices: false,
});

const isMac = process.platform === 'darwin';
let mainWindow = null;
let usedWsPort = undefined;
// (global as any).splashWorkerWindow = null;

const testMode = process.env.NODE_ENV === 'test';

if (process.env.NODE_ENV === 'production') {
  // eslint-disable-next-line
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
  console.log = () => {};
  console.time = () => {};
  console.timeEnd = () => {};
} else if (testMode) {
  const dir = path.join(__dirname, '..', 'tests', 'test-reports');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const logFile = fs.createWriteStream(path.join(dir, 'log.txt'), {
    flags: 'a', // 'w'
  });
  console.error = function (d, ex) {
    logFile.write(d + '\n');
    if (ex) {
      logFile.write(ex.stack + '\n');
    }
  };
  console.log = console.error;
  console.debug = console.error;
  console.log('Environment testMode:' + testMode); // + ' process.env.NODE_ENV:'+process.env.NODE_ENV);
  // console.log('Env:' + JSON.stringify(process.env));
}

// let debugMode;
let startupFilePath;
let portableMode;

const devMode =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

process.argv.forEach((arg, count) => {
  console.log('Opening file: ' + arg);
  if (
    arg.toLowerCase() === '-d' ||
    arg.toLowerCase() === '--debug' ||
    arg.startsWith('--remote-debugging-port=') ||
    arg.startsWith('--inspect=')
  ) {
    // debugMode = true;
  } else if (arg.toLowerCase() === '-p' || arg.toLowerCase() === '--portable') {
    app.setPath('userData', process.cwd() + '/tsprofile'); // making the app portable
    portableMode = true;
  } else if (testMode || devMode) {
    // ignoring the spectron testing
    arg = '';
  } else if (
    arg.endsWith('main.prod.js') ||
    arg === './app/main.dev.babel.js' ||
    arg === '.' ||
    count === 0
  ) {
    // ignoring the first argument
  } else if (arg.length > 2) {
    // console.warn('Opening file: ' + arg);
    if (arg !== './app/main.dev.js' && arg !== './app/') {
      startupFilePath = arg;
    }
  }

  if (portableMode) {
    startupFilePath = undefined;
  }
});

let mainHTML = `file://${__dirname}/app.html`;
const workerDevMode = false;

if (devMode || testMode) {
  // eslint-disable-next-line
  // require('electron-debug')({ showDevTools: false, devToolsMode: 'right' });
  const p = path.join(__dirname, '..', 'app', 'node_modules');
  // eslint-disable-next-line
  require('module').globalPaths.push(p);
  // workerDevMode = true; // hide worker window in dev mode
  mainHTML = `file://${__dirname}/appd.html`;
}
// const log = require('electron-log');
// console.log = log.log;

app.commandLine.appendSwitch('--disable-http-cache');

app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);

    if (parsedUrl.origin !== 'file://') {
      event.preventDefault();
    }
  });
});

const installExtensions = () => {
  const {
    default: installExtension,
    REACT_DEVELOPER_TOOLS,
    REDUX_DEVTOOLS,
  } = require('electron-devtools-installer'); // eslint-disable-line

  // const forceDownload = !!process.env.UPGRADE_EXTENSIONS; // temp fix for electron-devtools-installer issue
  const extensions = [REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS];
  const extOptions = {
    loadExtensionOptions: { allowFileAccess: true },
    forceDownload: false,
  };

  return Promise.all(
    extensions.map(async (name) => await installExtension(name.id, extOptions)),
  ).catch(console.log);
};

function showTagSpaces() {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.show();
  }
}

function openLocationManagerPanel() {
  if (mainWindow) {
    showTagSpaces();
    mainWindow.webContents.send('cmd', 'open-location-manager-panel');
  }
}
function openTagLibraryPanel() {
  if (mainWindow) {
    showTagSpaces();
    mainWindow.webContents.send('cmd', 'open-tag-library-panel');
  }
}
function goBack() {
  if (mainWindow) {
    showTagSpaces();
    mainWindow.webContents.send('cmd', 'go-back');
  }
}
function goForward() {
  if (mainWindow) {
    showTagSpaces();
    mainWindow.webContents.send('cmd', 'go-forward');
  }
}
function setZoomResetApp() {
  if (mainWindow) {
    showTagSpaces();
    mainWindow.webContents.send('cmd', 'set-zoom-reset-app');
  }
}
function setZoomInApp() {
  if (mainWindow) {
    showTagSpaces();
    mainWindow.webContents.send('cmd', 'set-zoom-in-app');
  }
}
function setZoomOutApp() {
  if (mainWindow) {
    showTagSpaces();
    mainWindow.webContents.send('cmd', 'set-zoom-out-app');
  }
}
function exitFullscreen() {
  if (mainWindow) {
    showTagSpaces();
    mainWindow.webContents.send('cmd', 'exit-fullscreen');
  }
}
function toggleSettingsDialog() {
  if (mainWindow) {
    showTagSpaces();
    mainWindow.webContents.send('cmd', 'toggle-settings-dialog');
  }
}
function openHelpFeedbackPanel() {
  if (mainWindow) {
    showTagSpaces();
    mainWindow.webContents.send('cmd', 'open-help-feedback-panel');
  }
}
function toggleKeysDialog() {
  if (mainWindow) {
    showTagSpaces();
    mainWindow.webContents.send('cmd', 'toggle-keys-dialog');
  }
}
function toggleOnboardingDialog() {
  if (mainWindow) {
    showTagSpaces();
    mainWindow.webContents.send('cmd', 'toggle-onboarding-dialog');
  }
}
function openURLExternally(data) {
  if (mainWindow) {
    showTagSpaces();
    mainWindow.webContents.send('open-url-externally', data);
  }
}
function toggleLicenseDialog() {
  if (mainWindow) {
    showTagSpaces();
    mainWindow.webContents.send('cmd', 'toggle-license-dialog');
  }
}
function toggleThirdPartyLibsDialog() {
  if (mainWindow) {
    showTagSpaces();
    mainWindow.webContents.send('cmd', 'toggle-third-party-libs-dialog');
  }
}
function toggleAboutDialog() {
  if (mainWindow) {
    showTagSpaces();
    mainWindow.webContents.send('cmd', 'toggle-about-dialog');
  }
}
function showSearch() {
  if (mainWindow) {
    showTagSpaces();
    mainWindow.webContents.send('cmd', 'open-search');
  }
}

function newTextFile() {
  if (mainWindow) {
    showTagSpaces();
    mainWindow.webContents.send('cmd', 'new-text-file');
  }
}

function getNextFile() {
  if (mainWindow) {
    // showTagSpaces();
    mainWindow.webContents.send('cmd', 'next-file');
  }
}

function getPreviousFile() {
  if (mainWindow) {
    // showTagSpaces();
    mainWindow.webContents.send('cmd', 'previous-file');
  }
}

function showCreateDirectoryDialog() {
  if (mainWindow) {
    // showTagSpaces();
    mainWindow.webContents.send('cmd', 'show-create-directory-dialog');
  }
}

function toggleOpenLinkDialog() {
  if (mainWindow) {
    showTagSpaces();
    mainWindow.webContents.send('cmd', 'toggle-open-link-dialog');
  }
}

function resumePlayback() {
  if (mainWindow) {
    // showTagSpaces();
    mainWindow.webContents.send('play-pause', true);
  }
}

function reloadApp() {
  if (mainWindow) {
    showTagSpaces();
    mainWindow.loadURL(mainHTML);
  }
}

function createNewWindowInstance(url?) {
  const mainWindowState = windowStateKeeper({
    defaultWidth: 1280,
    defaultHeight: 800,
  });

  const mainWindowInstance = new BrowserWindow({
    show: true,
    center: true,
    width: mainWindowState.width,
    height: mainWindowState.height,
    webPreferences: {
      spellcheck: true,
      nodeIntegration: true,
      webviewTag: true,
      contextIsolation: false,
    },
  });

  mainWindowInstance.setMenuBarVisibility(false);
  mainWindowInstance.setAutoHideMenuBar(true);
  if (url) {
    mainWindowInstance.loadURL(url);
  } else {
    mainWindowInstance.loadURL(mainHTML);
  }
}

function buildTrayMenu(i18n) {
  /* let iconPath;
  if (devMode) {
    iconPath = path.resolve(__dirname, 'assets', 'icons', 'trayIcon@2x.png');
  } else {
    iconPath = path.resolve(
      process.resourcesPath,
      'app.asar',
      'assets',
      'icons',
      'trayIcon@2x.png'
    );
  } */

  buildTrayIconMenu(
    {
      showTagSpaces,
      resumePlayback,
      createNewWindowInstance,
      openSearch: showSearch,
      toggleNewFileDialog: newTextFile,
      openNextFile: getNextFile,
      openPrevFile: getPreviousFile,
      quitApp: reloadApp,
    },
    i18n,
    isMac,
  );
}

function buildAppMenu(i18n) {
  buildDesktopMenu(
    {
      showTagSpaces,
      openSearch: showSearch,
      toggleNewFileDialog: newTextFile,
      openNextFile: getNextFile,
      openPrevFile: getPreviousFile,
      quitApp: reloadApp,
      showCreateDirectoryDialog,
      toggleOpenLinkDialog,
      openLocationManagerPanel,
      openTagLibraryPanel,
      goBack,
      goForward,
      setZoomResetApp,
      setZoomInApp,
      setZoomOutApp,
      exitFullscreen,
      toggleSettingsDialog,
      openHelpFeedbackPanel,
      toggleKeysDialog,
      toggleOnboardingDialog,
      openURLExternally,
      toggleLicenseDialog,
      toggleThirdPartyLibsDialog,
      toggleAboutDialog,
      createNewWindowInstance,
    },
    i18n,
  );
}

async function startWS() {
  try {
    let filepath;
    let script;
    let envPath;
    if (devMode || testMode) {
      filepath = path.join(
        __dirname,
        'node_modules/@tagspaces/tagspaces-ws/build',
      );
      script = 'index.js';
      envPath = path.join(__dirname, '.env');
    } else {
      filepath = process.resourcesPath;
      script = 'app.asar/node_modules/@tagspaces/tagspaces-ws/build/index.js';
      envPath = path.join(process.resourcesPath, 'app.asar/.env');
    }
    const properties = propertiesReader(envPath);

    const results = await new Promise((resolve, reject) => {
      findFreePorts(1, { startPort: settings.getInitWsPort() }).then(
        ([freePort]) => {
          pm2.start(
            {
              name: 'Tagspaces WS',
              script, // Script to be run
              cwd: filepath, // './node_modules/tagspaces-ws', // './process1', cwd: '/path/to/npm/module/',
              args: ['-p', freePort, '-k', properties.get('KEY')],
              restartAt: [],
              // log: path.join(process.cwd(), 'thumbGen.log')
            },
            (err, pid) => {
              if (err && pid) {
                if (pid && pid.name) console.error(pid.name, err, pid);
                else console.error(err, pid);
                reject(err);
              } else if (err) {
                reject(err);
              } else {
                usedWsPort = freePort;
                if (mainWindow) {
                  mainWindow.webContents.send('start_ws', {
                    port: freePort,
                  });
                }
                resolve(
                  `Starting ${pid.name} on ${pid.cwd} - pid (${pid.child.pid})`,
                );
              }
            },
          );
        },
      );
    });
    console.debug(results);
  } catch (ex) {
    console.error('pm2.start Exception:', ex);
  }
}

async function createAppWindow() {
  let startupParameter = '';
  if (startupFilePath) {
    if (startupFilePath.startsWith('./') || startupFilePath.startsWith('.\\')) {
      startupParameter =
        '?cmdopen=' + encodeURIComponent(path.join(__dirname, startupFilePath));
    } else if (startupFilePath !== 'data:,') {
      startupParameter = '?cmdopen=' + encodeURIComponent(startupFilePath);
    }
  }

  const mainWindowState = windowStateKeeper({
    defaultWidth: 1280,
    defaultHeight: 800,
  });

  mainWindow = new BrowserWindow({
    show: true,
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    // icon: path.join(__dirname, 'assets/icons/128x128.png'),
    webPreferences: {
      spellcheck: true,
      nodeIntegration: true,
      webviewTag: true,
      contextIsolation: false,
    },
  });

  const winUserAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36';
  const testWinOnUnix = false; // set to true to simulate windows os, useful for testing s3 handling

  await mainWindow.loadURL(
    mainHTML + startupParameter,
    testWinOnUnix ? { userAgent: winUserAgent } : {},
  );
  mainWindow.setMenuBarVisibility(false);
  mainWindow.setAutoHideMenuBar(true);
  mainWindowState.manage(mainWindow);

  mainWindow.webContents.send('start_ws', {
    port: usedWsPort,
  });

  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (portableMode) {
      mainWindow.setTitle(mainWindow.title + ' Portable 🔌');
    }
    mainWindow.focus();
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  mainWindow.webContents.on(
    'render-process-gone',
    (_, { reason, exitCode }) => {
      /*console.error(
        `[web ui] render-process-gone: ${reason}, code: ${exitCode}`
      );*/
      // 'crashed'
      pm2.stopAll();
      globalShortcut.unregisterAll();
      app.quit();
    },
  );
}

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required'); // Fix broken autoplay functionality in the av player

app.on('window-all-closed', () => {
  pm2.stopAll();
  globalShortcut.unregisterAll();
  app.quit();
});

app.on('quit', () => {
  pm2.stopAll();
  globalShortcut.unregisterAll();
});

startWS();

app.on('ready', async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  const i18n = await i18nInit();

  try {
    buildAppMenu(i18n);
    await createAppWindow();
    buildTrayMenu(i18n);
  } catch (ex) {
    console.log('buildMenus', ex);
  }

  i18n.on('languageChanged', (lng) => {
    try {
      console.log('languageChanged:' + lng);
      buildAppMenu(i18n);
      buildTrayMenu(i18n);
    } catch (ex) {
      console.log('languageChanged', ex);
    }
  });

  ipcMain.on('show-main-window', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.show();
    }
  });

  ipcMain.on('create-new-window', (e, url) => {
    createNewWindowInstance(url);
  });

  ipcMain.on('load-extensions', () => {
    getExtensions(path.join(app.getPath('userData'), 'tsplugins'), true)
      .then(({ extensions, supportedFileTypes }) => {
        if (mainWindow) {
          mainWindow.webContents.send('set_extensions', {
            extensions,
            supportedFileTypes,
          });
          // mainWindow.webContents.send('set_supported_file_types', supportedFileTypes);
        }
      })
      .catch((err) => console.error('load-extensions', err));
  });

  ipcMain.on('remove-extension', (e, extensionId) => {
    try {
      const extBuildIndex = extensionId.indexOf('/build');
      fs.rmSync(
        path.join(
          app.getPath('userData'),
          'tsplugins',
          extBuildIndex > -1
            ? extensionId.substring(0, extBuildIndex)
            : extensionId,
        ),
        {
          recursive: true,
        },
      );
    } catch (e) {
      console.debug(e);
    }
  });

  ipcMain.handle('get-user-data', () => {
    return app.getPath('userData');
  });

  ipcMain.on('focus-window', () => {
    if (mainWindow) {
      mainWindow.focus();
    }
  });

  ipcMain.handle('get-device-paths', () => {
    const paths: any = {
      desktopFolder: app.getPath('desktop'),
      documentsFolder: app.getPath('documents'),
      downloadsFolder: app.getPath('downloads'),
      musicFolder: app.getPath('music'),
      picturesFolder: app.getPath('pictures'),
      videosFolder: app.getPath('videos'),
    };
    if (isMac) {
      paths.iCloudFolder =
        app.getPath('home') + '/Library/Mobile Documents/com~apple~CloudDocs';
    }
    return paths;
  });

  ipcMain.on('get-user-home-path', (event) => {
    event.returnValue = app.getPath('home');
  });

  ipcMain.on('worker-response', (event, arg) => {
    if (mainWindow) {
      mainWindow.webContents.send(arg.id, arg);
    }
  });

  ipcMain.handle('select-directory-dialog', async () => {
    const options = {
      properties: ['openDirectory', 'createDirectory'],
    };
    // @ts-ignore
    const resultObject = await dialog.showOpenDialog(options);

    if (resultObject.filePaths && resultObject.filePaths.length) {
      // alert(JSON.stringify(resultObject.filePaths));
      return resultObject.filePaths;
    }
    return false;
  });

  // end electron-io

  ipcMain.on('app-data-path-request', (event) => {
    event.returnValue = app.getPath('appData'); // eslint-disable-line
  });

  ipcMain.on('app-version-request', (event) => {
    event.returnValue = app.getVersion(); // eslint-disable-line
  });

  ipcMain.handle('move-to-trash', async (event, files) => {
    const result = [];
    files.forEach((fullPath) => {
      // console.debug('Trash:' + fullPath);
      result.push(shell.trashItem(fullPath));
    });

    let ret;
    try {
      ret = await Promise.all(result);
    } catch (err) {
      console.error('moveToTrash ' + JSON.stringify(files) + 'error:', err);
    }
    return ret;
  });

  /* ipcMain.on('move-to-trash', async (event, files) => {
    const result = [];
    files.forEach(fullPath => {
      console.debug('Trash:' + fullPath);
      result.push(shell.trashItem(fullPath));
    });
    try {
      event.returnValue = await Promise.all(result);
    } catch (err) {
      console.error('moveToTrash error:', err);
      event.returnValue = undefined;
    }
  }); */

  ipcMain.on('set-language', (e, language) => {
    i18n.changeLanguage(language);
  });

  ipcMain.on('global-shortcuts-enabled', (e, globalShortcutsEnabled) => {
    if (globalShortcutsEnabled) {
      globalShortcut.register('CommandOrControl+Shift+F', showSearch);
      globalShortcut.register('CommandOrControl+Shift+P', resumePlayback);
      globalShortcut.register('MediaPlayPause', resumePlayback);
      globalShortcut.register('CommandOrControl+Shift+N', newTextFile);
      globalShortcut.register('CommandOrControl+Shift+D', getNextFile);
      globalShortcut.register('MediaNextTrack', getNextFile);
      globalShortcut.register('CommandOrControl+Shift+A', getPreviousFile);
      globalShortcut.register('MediaPreviousTrack', getPreviousFile);
      globalShortcut.register('CommandOrControl+Shift+W', showTagSpaces);
    } else {
      globalShortcut.unregisterAll();
    }
  });

  ipcMain.on('relaunch-app', reloadApp);

  ipcMain.on('quit-application', () => {
    globalShortcut.unregisterAll();
    app.quit();
  });

  process.on('uncaughtException', (error) => {
    if (error.stack) {
      console.error('error:', error.stack);
      throw new Error(error.stack);
    }
    reloadApp();
  });

  /*process.on('SIGINT SIGTERM', () => {
    console.log('Detected SIGINT/SIGTERM');
  });

  process.on('SIGTERM', () => {
    console.log('Detected SIGTERM');
  });*/
});

// i18n.on('languageChanged', lng => {
// 'loaded', loaded => {
//  i18n.changeLanguage('en');
//  i18n.off('loaded');
// });
