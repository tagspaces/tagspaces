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
  dialog,
} from 'electron';
// import { autoUpdater } from 'electron-updater';
//import log from 'electron-log';
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
  if (isMacLike) {
    // temp fix https://github.com/electron/electron/issues/43415#issuecomment-2359194469
    app.disableHardwareAcceleration();
  }
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
    arg.indexOf('node_modules/electron/dist/') > -1 ||
    arg.endsWith('electronmon/src/hook.js') ||
    //arg === './app/main.dev.babel.js' ||
    arg === '.' ||
    arg === '--require' ||
    count === 0
  ) {
    // ignoring the first argument
  } else if (arg.length > 2) {
    // console.warn('Opening file: ' + arg);
    //if (arg !== './app/main.dev.js' && arg !== './app/' && arg !== '') {
    startupFilePath = arg;
    //}
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
  const windows = BrowserWindow.getAllWindows();
  windows.forEach((win, i) => {
    if (win && i < 1) {
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
  const focusedWindow = BrowserWindow.getFocusedWindow();
  focusedWindow?.webContents.send('panels', 'open-location-manager-panel');
}

function openTagLibraryPanel() {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  focusedWindow?.webContents.send('panels', 'open-tag-library-panel');
}

function openHelpFeedbackPanel() {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  focusedWindow?.webContents.send('panels', 'open-help-feedback-panel');
}

function goBack() {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  focusedWindow?.webContents.send('history', 'go-back');
}

function goForward() {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  focusedWindow?.webContents.send('history', 'go-forward');
}

function setZoomResetApp() {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  focusedWindow?.webContents.send('cmd', 'set-zoom-reset-app');
}

function setZoomInApp() {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  focusedWindow?.webContents.send('cmd', 'set-zoom-in-app');
}

function setZoomOutApp() {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  focusedWindow?.webContents.send('cmd', 'set-zoom-out-app');
}

function exitFullscreen() {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  focusedWindow?.webContents.send('cmd', 'exit-fullscreen');
}

function toggleSettingsDialog() {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  focusedWindow?.webContents.send('toggle-settings-dialog');
}

function toggleKeysDialog() {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  focusedWindow?.webContents.send('toggle-keys-dialog');
}

function toggleOnboardingDialog() {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  focusedWindow?.webContents.send('toggle-onboarding-dialog');
}

function openURLExternally(data) {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  focusedWindow?.webContents.send('open-url-externally', data);
}

function toggleLicenseDialog() {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  focusedWindow?.webContents.send('toggle-license-dialog');
}

function toggleThirdPartyLibsDialog() {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  focusedWindow?.webContents.send('toggle-third-party-libs-dialog');
}

function toggleAboutDialog() {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  focusedWindow?.webContents.send('toggle-about-dialog');
}

function showSearch() {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow) {
    focusedWindow?.webContents.send('cmd', 'open-search');
  } else {
    showMainWindow();
    mainWindow?.webContents.send('cmd', 'open-search');
  }
}

function newTextFile() {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow) {
    focusedWindow?.webContents.send('new-text-file');
  } else {
    showMainWindow();
    mainWindow?.webContents.send('new-text-file');
  }
}

function getNextFile() {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow) {
    focusedWindow?.webContents.send('perspective', 'next-file');
  } else {
    showMainWindow();
    mainWindow?.webContents.send('perspective', 'next-file');
  }
}

function getPreviousFile() {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow) {
    focusedWindow?.webContents.send('perspective', 'previous-file');
  } else {
    showMainWindow();
    mainWindow?.webContents.send('perspective', 'previous-file');
  }
}

function showCreateDirectoryDialog() {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  focusedWindow?.webContents.send('show-create-directory-dialog');
}

function toggleOpenLinkDialog() {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  focusedWindow?.webContents.send('toggle-open-link-dialog');
}

function resumePlayback() {
  const windows = BrowserWindow.getAllWindows();
  windows.forEach((win, i) => {
    win?.webContents.send('play-pause');
  });
}

function reloadApp() {
  const focusedWindow = BrowserWindow.getFocusedWindow();
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
  // @ts-ignore
  mainWindow.fileChanged = false;
  // @ts-ignore
  mainWindow.descriptionChanged = false;

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

async function findPort() {
  if (isDebug) {
    return 2000;
  }
  const defaultWSPort = settings.getInitWsPort();
  //console.log('defaultWSPort:' + defaultWSPort);
  try {
    const [port] = await findFreePorts(1, { startPort: defaultWSPort });
    return port;
  } catch (e) {
    console.error('Error findPort:', e);
  }
  console.log('Using default WS port:' + defaultWSPort);
  return defaultWSPort;
}

function startWS() {
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
      findPort().then((freePort) => {
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
      });
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
    console.log('Startup file path: ' + startupFilePath);
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
  // @ts-ignore
  mainWindow.fileChanged = false;
  // @ts-ignore
  mainWindow.descriptionChanged = false;

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

  mainWindow.on('close', (e) => {
    // @ts-ignore
    if (mainWindow.fileChanged || mainWindow.descriptionChanged) {
      const choice = dialog.showMessageBoxSync(mainWindow, {
        type: 'question',
        buttons: [i18n.t('cancel'), i18n.t('closeApp')],
        defaultId: 1,
        cancelId: 0,
        title: i18n.t('unsavedChanges'),
        message: i18n.t('unsavedChangesMessage'),
        detail: i18n.t('unsavedChangesDetails'),
      });

      if (choice === 0) {
        // Cancel
        e.preventDefault(); // Prevent closing
      }
      // No action needed for "Close Application", window will close
    }
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
  const windows = BrowserWindow.getAllWindows();
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (windows.length === 0) {
    createWindow(appI18N);
  } else {
    showApp();
  }
  event.preventDefault();
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
      ipcMain.on('file-changed', (e, isChanged) => {
        if (mainWindow) {
          // @ts-ignore
          mainWindow.fileChanged = isChanged;
        }
      });
      ipcMain.on('description-changed', (e, isChanged) => {
        if (mainWindow) {
          // @ts-ignore
          mainWindow.descriptionChanged = isChanged;
        }
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
        const focusedWindow = BrowserWindow.getFocusedWindow();
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
