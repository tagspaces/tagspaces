/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  globalShortcut,
  BrowserWindowConstructorOptions,
} from 'electron';
// import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import pm2 from '@elife/pm2';
import propertiesReader from 'properties-reader';
import { resolveHtmlPath } from './util';
import windowStateKeeper from 'electron-window-state';
import findFreePorts from 'find-free-ports';
import settings from './settings';
import { getExtensions } from './extension-utils';
import i18nInit from '../renderer/services/i18nInit';
import buildTrayMenu from './electron-tray-menu';
import buildDockMenu from './electron-dock-menu';
import buildDesktopMenu from './electron-menus';
import loadMainEvents from './mainEvents';
import { Extensions } from './types';

// class AppUpdater {
//   constructor() {
//     log.transports.file.level = 'info';
//     autoUpdater.logger = log;
//     autoUpdater.checkForUpdatesAndNotify();
//   }
// }

let isMacLike = process.platform === 'darwin';

let mainWindow: BrowserWindow | null = null;
/*let usedWsPort = undefined;

function getUsedWsPort() {
  return usedWsPort;
}*/

let globalShortcutsEnabled = false;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')({ showDevTools: false });
}

const testMode = process.env.NODE_ENV === 'test';

let startupFilePath;
let portableMode;

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
  } else if (testMode || isDebug) {
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

// if (isDebug) {
//   app.commandLine.appendSwitch('--allow-file-access-from-files');
// }

const browserWindowOptions: BrowserWindowConstructorOptions = {
  show: false,
  center: true,
  autoHideMenuBar: true,
  titleBarStyle: isMacLike ? 'hidden' : 'default',
  webPreferences: {
    // webSecurity: !isDebug,
    spellcheck: true,
    preload:
      app.isPackaged || !isDebug
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
  },
};

const defaultAppSize = {
  defaultWidth: 1280,
  defaultHeight: 800,
};

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

function getSpellcheckLanguage(i18n) {
  const supportedLanguages =
    mainWindow?.webContents.session.availableSpellCheckerLanguages;
  if (!supportedLanguages) {
    return 'en';
  }
  if (supportedLanguages.includes(i18n)) {
    return i18n;
  }
  if (i18n.length > 2) {
    const shortI18n = i18n.substring(0, 2);
    if (supportedLanguages.includes(shortI18n)) {
      return shortI18n;
    }
  }
  return 'en';
}

function showApp() {
  var windows = BrowserWindow.getAllWindows();
  windows.forEach((win, i) => {
    if (win) {
      if (win.isMinimized()) {
        win.restore();
      } else {
        win.show();
      }
    }
  });
  // if (mainWindow) {
  //   if (mainWindow.isMinimized()) {
  //     mainWindow.restore();
  //   }
  //   mainWindow?.show();
  // }
}

function showMainWindow() {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow?.show();
  }
}

function openLocationManagerPanel() {
  var focusedWindow = BrowserWindow.getFocusedWindow();
  focusedWindow?.webContents.send('cmd', 'open-location-manager-panel');
}

function openTagLibraryPanel() {
  var focusedWindow = BrowserWindow.getFocusedWindow();
  focusedWindow?.webContents.send('cmd', 'open-tag-library-panel');
}

function goBack() {
  var focusedWindow = BrowserWindow.getFocusedWindow();
  focusedWindow?.webContents.send('cmd', 'go-back');
}

function goForward() {
  var focusedWindow = BrowserWindow.getFocusedWindow();
  focusedWindow?.webContents.send('cmd', 'go-forward');
}

function setZoomResetApp() {
  var focusedWindow = BrowserWindow.getFocusedWindow();
  focusedWindow?.webContents.send('cmd', 'set-zoom-reset-app');
}

function setZoomInApp() {
  var focusedWindow = BrowserWindow.getFocusedWindow();
  focusedWindow?.webContents.send('cmd', 'set-zoom-in-app');
}

function setZoomOutApp() {
  var focusedWindow = BrowserWindow.getFocusedWindow();
  focusedWindow?.webContents.send('cmd', 'set-zoom-out-app');
}

function exitFullscreen() {
  var focusedWindow = BrowserWindow.getFocusedWindow();
  focusedWindow?.webContents.send('cmd', 'exit-fullscreen');
}

function toggleSettingsDialog() {
  var focusedWindow = BrowserWindow.getFocusedWindow();
  focusedWindow?.webContents.send('cmd', 'toggle-settings-dialog');
}

function openHelpFeedbackPanel() {
  var focusedWindow = BrowserWindow.getFocusedWindow();
  focusedWindow?.webContents.send('cmd', 'open-help-feedback-panel');
}

function toggleKeysDialog() {
  var focusedWindow = BrowserWindow.getFocusedWindow();
  focusedWindow?.webContents.send('cmd', 'toggle-keys-dialog');
}

function toggleOnboardingDialog() {
  var focusedWindow = BrowserWindow.getFocusedWindow();
  focusedWindow?.webContents.send('cmd', 'toggle-onboarding-dialog');
}

function openURLExternally(data) {
  var focusedWindow = BrowserWindow.getFocusedWindow();
  focusedWindow?.webContents.send('open-url-externally', data);
}

function toggleLicenseDialog() {
  var focusedWindow = BrowserWindow.getFocusedWindow();
  focusedWindow?.webContents.send('cmd', 'toggle-license-dialog');
}

function toggleThirdPartyLibsDialog() {
  var focusedWindow = BrowserWindow.getFocusedWindow();
  focusedWindow?.webContents.send('cmd', 'toggle-third-party-libs-dialog');
}

function toggleAboutDialog() {
  var focusedWindow = BrowserWindow.getFocusedWindow();
  focusedWindow?.webContents.send('cmd', 'toggle-about-dialog');
}

function showSearch() {
  var focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow) {
    focusedWindow?.webContents.send('cmd', 'open-search');
  } else {
    showMainWindow();
    mainWindow?.webContents.send('cmd', 'open-search');
  }
}

function newTextFile() {
  var focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow) {
    focusedWindow?.webContents.send('cmd', 'new-text-file');
  } else {
    showMainWindow();
    mainWindow?.webContents.send('cmd', 'new-text-file');
  }
}

function getNextFile() {
  var focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow) {
    focusedWindow?.webContents.send('cmd', 'next-file');
  } else {
    showMainWindow();
    mainWindow?.webContents.send('cmd', 'next-file');
  }
}

function getPreviousFile() {
  var focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow) {
    focusedWindow?.webContents.send('cmd', 'previous-file');
  } else {
    showMainWindow();
    mainWindow?.webContents.send('cmd', 'previous-file');
  }
}

function showCreateDirectoryDialog() {
  var focusedWindow = BrowserWindow.getFocusedWindow();
  focusedWindow?.webContents.send('cmd', 'show-create-directory-dialog');
}

function toggleOpenLinkDialog() {
  var focusedWindow = BrowserWindow.getFocusedWindow();
  focusedWindow?.webContents.send('cmd', 'toggle-open-link-dialog');
}

function resumePlayback() {
  // var focusedWindow = BrowserWindow.getFocusedWindow();
  // if (focusedWindow) {
  //   focusedWindow?.webContents.send('cmd', 'play-pause');
  // } else {
  //   mainWindow?.webContents.send('cmd', 'play-pause');
  // }
  var windows = BrowserWindow.getAllWindows();
  windows.forEach((win, i) => {
    win?.webContents.send('cmd', 'play-pause');
  });
}

function reloadApp() {
  var focusedWindow = BrowserWindow.getFocusedWindow();
  focusedWindow?.loadURL(resolveHtmlPath('index.html'));
}

function createNewWindowInstance(url?) {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow(appI18N);
    return;
  }

  const mainWindowState = windowStateKeeper(defaultAppSize);

  const newWindowInstance = new BrowserWindow({
    ...browserWindowOptions,
    width: mainWindowState.width,
    height: mainWindowState.height,
    x: mainWindowState.x,
    y: mainWindowState.y,
    show: true,
    center: true,
  });

  newWindowInstance.setMenuBarVisibility(false);

  if (url) {
    newWindowInstance.loadURL(url);
  } else {
    newWindowInstance.loadURL(resolveHtmlPath('index.html'));
  }
}

function bindTrayMenu(i18n) {
  buildTrayMenu(
    {
      showTagSpaces: showApp,
      resumePlayback,
      createNewWindowInstance,
      openSearch: showSearch,
      toggleNewFileDialog: newTextFile,
      openNextFile: getNextFile,
      openPrevFile: getPreviousFile,
      quitApp: reloadApp,
    },
    i18n,
    isMacLike,
    globalShortcutsEnabled,
  );
}

function bindAppMenu(i18n) {
  buildDesktopMenu(
    {
      showTagSpaces: showApp,
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

/*const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../../assets');

const getAssetPath = (...paths: string[]): string => {
  return path.join(RESOURCES_PATH, ...paths);
};*/

function startWS() {
  const port = isDebug ? 2000 : undefined;
  try {
    let filepath;
    let script;
    let envPath;
    if (app.isPackaged) {
      filepath = process.resourcesPath; // path.join(__dirname, '../../..');
      script = 'app.asar/node_modules/@tagspaces/tagspaces-ws/build/index.js'; //app.asar/
      envPath = path.join(filepath, 'app.asar/.env');
    } else {
      filepath = path.join(
        __dirname,
        '../node_modules/@tagspaces/tagspaces-ws/build',
      );
      script = 'index.js';
      envPath = path.join(__dirname, '../.env');
    }
    const properties = propertiesReader(envPath); //getAssetPath('.env')
    //console.debug(JSON.stringify(properties.get('KEY')));

    const results = new Promise((resolve, reject) => {
      findFreePorts(1, { startPort: settings.getInitWsPort() }).then(
        ([findPort]) => {
          const freePort = port ? port : findPort;
          try {
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
                  settings.setUsedWsPort(freePort);
                  mainWindow?.webContents.send('start_ws', {
                    port: freePort,
                  });
                  console.debug('start_ws:' + freePort);
                  resolve(
                    `Starting ${pid.name} on ${pid.cwd} - pid (${pid.child.pid})`,
                  );
                }
              },
            );
          } catch (e) {
            console.error('pm2.start err:', e);
            reject(e);
          }
        },
      );
    });
    results
      .then((results) => console.debug(results))
      .catch((err) => console.error('pm2.start err:', err));
  } catch (ex) {
    console.error('pm2.start Exception __dirname:' + __dirname, ex);
  }
}

const createWindow = async (i18n) => {
  let startupParameter = '';
  if (startupFilePath) {
    if (startupFilePath.startsWith('./') || startupFilePath.startsWith('.\\')) {
      startupParameter =
        '?cmdopen=' + encodeURIComponent(path.join(__dirname, startupFilePath));
    } else if (startupFilePath !== 'data:,') {
      startupParameter = '?cmdopen=' + encodeURIComponent(startupFilePath);
    }
  }

  if (isDebug) {
    await installExtensions();
  }

  const mainWindowState = windowStateKeeper(defaultAppSize);

  mainWindow = new BrowserWindow({
    ...browserWindowOptions,
    width: mainWindowState.width,
    height: mainWindowState.height,
  });

  mainWindow.setMenuBarVisibility(false);

  const winUserAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36';
  const testWinOnUnix = false; // set to true to simulate windows os, useful for testing s3 handling

  mainWindow.loadURL(
    resolveHtmlPath('index.html') + startupParameter,
    testWinOnUnix ? { userAgent: winUserAgent } : {},
  );
  /*.then(() => {
      mainWindow.webContents.send('start_ws', {
        port: getUsedWsPort(),
      });
    });*/

  /*mainWindow.webContents.on('did-finish-load', () => {
    const cssPath = app.isPackaged ? path.join(
      process.resourcesPath,
      'node_modules/@milkdown/theme-nord/lib/style.css',
    ) :  path.join(
      __dirname,
      '../../node_modules/@milkdown/theme-nord/lib/style.css',
    )
    mainWindow?.webContents.insertCSS(fs.readFileSync(cssPath, 'utf8'));
  });*/

  mainWindow.webContents.on('before-input-event', (_, input) => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }

    if (input.type === 'keyDown' && input.key === 'F12') {
      mainWindow.webContents.isDevToolsOpened()
        ? mainWindow.webContents.closeDevTools()
        : mainWindow.webContents.openDevTools({ mode: 'right' });
    }
  });

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }

    //console.log('prosess:' + stringifyMaxDepth(process, 3));
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }

    // if (isMacLike) {
    //   mainWindow.webContents.setZoomFactor(0.9);
    // }
  });

  mainWindow.on('closed', () => {
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
  try {
    bindAppMenu(i18n);
    bindTrayMenu(i18n);
  } catch (ex) {
    console.log('buildMenus', ex);
  }

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  // new AppUpdater();
};

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required'); // Fix broken autoplay functionality in the av player

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the macOS convention of having the application in memory even
  // after all windows have been closed
  if (!isMacLike) {
    // pm2.stopAll();
    // globalShortcut.unregisterAll();
    app.quit();
  }
});

app.on('activate', (event, hasVisibleWindows) => {
  // console.log('Activate ' + hasVisibleWindows);
  event.preventDefault();
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  // if (BrowserWindow.getAllWindows().length === 0) {
  //   createWindow(appI18N);
  // }
});

app.on('quit', () => {
  pm2.stopAll();
  globalShortcut.unregisterAll();
});

app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);

    if (parsedUrl.origin !== 'file://') {
      event.preventDefault();
    }
  });
});

startWS();

let appI18N;

app
  .whenReady()
  .then(() => {
    return i18nInit().then((i18n) => {
      appI18N = i18n;
      if (process.platform === 'darwin') {
        app.dock.setMenu(
          buildDockMenu(
            {
              showTagSpaces: showApp,
              resumePlayback,
              createNewWindowInstance,
              openSearch: showSearch,
              toggleNewFileDialog: newTextFile,
              openNextFile: getNextFile,
              openPrevFile: getPreviousFile,
            },
            i18n,
          ),
        );
      }
      createWindow(i18n);
      app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (mainWindow === null) createWindow(i18n);
      });

      i18n.on('languageChanged', (lng) => {
        try {
          console.log('languageChanged:' + lng);
          bindAppMenu(i18n);
          bindTrayMenu(i18n);
          const spellCheckLanguage = getSpellcheckLanguage(lng);
          mainWindow?.webContents.session.setSpellCheckerLanguages([
            spellCheckLanguage,
          ]);
        } catch (ex) {
          console.log('languageChanged', ex);
        }
      });

      ipcMain.on('show-main-window', () => {
        showApp();
      });

      ipcMain.on('create-new-window', (e, url) => {
        createNewWindowInstance(url);
      });

      loadMainEvents();

      ipcMain.on('load-extensions', () => {
        getExtensions(
          path.join(app.getPath('userData'), 'tsplugins'),
          ['@tagspaces/extensions', '@tagspacespro/extensions'],
          true,
        )
          .then(({ extensions, supportedFileTypes }) => {
            const setExtensions: Extensions = {
              extensions,
              supportedFileTypes,
            };
            console.log('set_extensions' + JSON.stringify(setExtensions));
            mainWindow?.webContents.send('set_extensions', setExtensions);
            // mainWindow.webContents.send('set_supported_file_types', supportedFileTypes);
          })
          .catch((err) => console.error('load-extensions', err));
      });

      ipcMain.on('focus-window', () => {
        mainWindow?.focus();
      });

      ipcMain.on('get-user-home-path', (event) => {
        event.returnValue = app.getPath('home');
      });

      ipcMain.on('worker-response', (event, arg) => {
        mainWindow?.webContents.send(arg.id, arg);
      });

      ipcMain.on('app-data-path-request', (event) => {
        event.returnValue = app.getPath('appData'); // eslint-disable-line
      });

      ipcMain.on('app-version-request', (event) => {
        event.returnValue = app.getVersion(); // eslint-disable-line
      });

      ipcMain.on('set-language', (e, language) => {
        i18n.changeLanguage(language);
      });

      ipcMain.on('setZoomFactor', (event, zoomLevel) => {
        var focusedWindow = BrowserWindow.getFocusedWindow();
        focusedWindow?.webContents.setZoomFactor(zoomLevel);
      });

      ipcMain.on('global-shortcuts-enabled', (e, globalShortcuts) => {
        globalShortcutsEnabled = globalShortcuts;
        try {
          bindTrayMenu(i18n);
        } catch (ex) {
          console.log('buildMenus', ex);
        }
        if (globalShortcutsEnabled) {
          globalShortcut.register('CommandOrControl+Shift+F', showSearch);
          globalShortcut.register('CommandOrControl+Shift+P', resumePlayback);
          globalShortcut.register('MediaPlayPause', resumePlayback);
          globalShortcut.register('CommandOrControl+Shift+N', newTextFile);
          globalShortcut.register('CommandOrControl+Shift+D', getNextFile);
          globalShortcut.register('MediaNextTrack', getNextFile);
          globalShortcut.register('CommandOrControl+Shift+A', getPreviousFile);
          globalShortcut.register('MediaPreviousTrack', getPreviousFile);
          globalShortcut.register('CommandOrControl+Shift+W', showApp);
        } else {
          globalShortcut.unregisterAll();
        }
      });

      ipcMain.on('relaunch-app', reloadApp);

      process.on('uncaughtException', (error) => {
        if (error.stack) {
          console.error('error:', error.stack);
          throw new Error(error.stack);
        }
        reloadApp();
      });
    });
  })
  .catch(console.log);
