/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */

import pm2 from '@elife/pm2';
import {
  BrowserWindow,
  BrowserWindowConstructorOptions,
  app,
  dialog,
  globalShortcut,
  ipcMain,
  shell,
} from 'electron';
import windowStateKeeper from 'electron-window-state';
import findFreePorts from 'find-free-ports';
import path from 'path';
import propertiesReader from 'properties-reader';
import i18nInit from '../renderer/services/i18nInit';
import buildDockMenu from './electron-dock-menu';
import buildDesktopMenu from './electron-menus';
import buildTrayMenu from './electron-tray-menu';
import { getExtensions } from './extension-utils';
import loadMainEvents from './mainEvents';
import protocol from './protocol';
import settings from './settings';
import { Extensions } from './types';
import { resolveHtmlPath } from './util';

// --- App State ---
let isMacLike = process.platform === 'darwin';
let mainWindow: BrowserWindow | null = null;
let globalShortcutsEnabled = false;
let startupFilePath: string | undefined;
let portableMode: boolean | undefined;
const SUPPORTED_EXTS = new Set(['.md', '.mmd', '.txt', '.html', '.glb']);

// --- Debug/Dev Mode ---
const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';
const testMode = process.env.NODE_ENV === 'test';

if (isDebug || testMode) {
  require('electron-debug')({ showDevTools: false });
  if (isMacLike) {
    app.disableHardwareAcceleration();
  }
} else {
  // Silence console logs in production
  console.log = () => {};
}

// --- Parse Startup Arguments ---
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
    arg = '';
  } else if (
    arg.endsWith('main.prod.js') ||
    arg.indexOf('node_modules/electron/dist/') > -1 ||
    arg.endsWith('electronmon/src/hook.js') ||
    arg === '.' ||
    arg === '--require' ||
    count === 0
  ) {
    // ignore
  } else if (arg.length > 2) {
    startupFilePath = arg;
  }
  if (portableMode) {
    startupFilePath = undefined;
  }
});

// --- Browser Window Options ---
const browserWindowOptions: BrowserWindowConstructorOptions = {
  show: false,
  center: true,
  autoHideMenuBar: true,
  titleBarStyle: isMacLike ? 'hidden' : 'default',
  webPreferences: {
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

// --- DevTools Extension Installer ---
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

// --- Utility Functions ---
function getSpellcheckLanguage(i18n: string) {
  const supportedLanguages =
    mainWindow?.webContents.session.availableSpellCheckerLanguages;
  if (!supportedLanguages) return 'en';
  if (supportedLanguages.includes(i18n)) return i18n;
  if (i18n.length > 2) {
    const shortI18n = i18n.substring(0, 2);
    if (supportedLanguages.includes(shortI18n)) return shortI18n;
  }
  return 'en';
}

function showApp() {
  const windows = BrowserWindow.getAllWindows();
  windows.forEach((win, i) => {
    if (win && i < 1) {
      if (win.isMinimized()) win.restore();
      else win.show();
    }
  });
}

function showMainWindow() {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
  }
}

// --- Panel/Command Functions ---
function openLocationManagerPanel() {
  BrowserWindow.getFocusedWindow()?.webContents.send(
    'panels',
    'open-location-manager-panel',
  );
}
function openTagLibraryPanel() {
  BrowserWindow.getFocusedWindow()?.webContents.send(
    'panels',
    'open-tag-library-panel',
  );
}
function openHelpFeedbackPanel() {
  BrowserWindow.getFocusedWindow()?.webContents.send(
    'panels',
    'open-help-feedback-panel',
  );
}
function goBack() {
  BrowserWindow.getFocusedWindow()?.webContents.send('history', 'go-back');
}
function goForward() {
  BrowserWindow.getFocusedWindow()?.webContents.send('history', 'go-forward');
}
function setZoomResetApp() {
  BrowserWindow.getFocusedWindow()?.webContents.send(
    'cmd',
    'set-zoom-reset-app',
  );
}
function setZoomInApp() {
  BrowserWindow.getFocusedWindow()?.webContents.send('cmd', 'set-zoom-in-app');
}
function setZoomOutApp() {
  BrowserWindow.getFocusedWindow()?.webContents.send('cmd', 'set-zoom-out-app');
}
function exitFullscreen() {
  BrowserWindow.getFocusedWindow()?.webContents.send('cmd', 'exit-fullscreen');
}
function toggleSettingsDialog() {
  BrowserWindow.getFocusedWindow()?.webContents.send('toggle-settings-dialog');
}
function toggleKeysDialog() {
  BrowserWindow.getFocusedWindow()?.webContents.send('toggle-keys-dialog');
}
function toggleOnboardingDialog() {
  BrowserWindow.getFocusedWindow()?.webContents.send(
    'toggle-onboarding-dialog',
  );
}
function openURLExternally(data: any) {
  BrowserWindow.getFocusedWindow()?.webContents.send(
    'open-url-externally',
    data,
  );
}
function toggleLicenseDialog() {
  BrowserWindow.getFocusedWindow()?.webContents.send('toggle-license-dialog');
}
function toggleThirdPartyLibsDialog() {
  BrowserWindow.getFocusedWindow()?.webContents.send(
    'toggle-third-party-libs-dialog',
  );
}
function toggleAboutDialog() {
  BrowserWindow.getFocusedWindow()?.webContents.send('toggle-about-dialog');
}
function showSearch() {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow) focusedWindow.webContents.send('cmd', 'open-search');
  else {
    showMainWindow();
    mainWindow?.webContents.send('cmd', 'open-search');
  }
}
function newTextFile() {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow) focusedWindow.webContents.send('new-text-file');
  else {
    showMainWindow();
    mainWindow?.webContents.send('new-text-file');
  }
}
function newMDFile() {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow) focusedWindow.webContents.send('new-md-file');
  else {
    showMainWindow();
    mainWindow?.webContents.send('new-md-file');
  }
}
function getNextFile() {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow) focusedWindow.webContents.send('perspective', 'next-file');
  else {
    showMainWindow();
    mainWindow?.webContents.send('perspective', 'next-file');
  }
}
function getPreviousFile() {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow)
    focusedWindow.webContents.send('perspective', 'previous-file');
  else {
    showMainWindow();
    mainWindow?.webContents.send('perspective', 'previous-file');
  }
}
function showCreateDirectoryDialog() {
  BrowserWindow.getFocusedWindow()?.webContents.send(
    'show-create-directory-dialog',
  );
}
function toggleOpenLinkDialog() {
  BrowserWindow.getFocusedWindow()?.webContents.send('toggle-open-link-dialog');
}
function resumePlayback() {
  BrowserWindow.getAllWindows().forEach((win) =>
    win.webContents.send('play-pause'),
  );
}
function reloadApp() {
  BrowserWindow.getFocusedWindow()?.loadURL(resolveHtmlPath('index.html'));
}
function createNewWindowInstance(url?: string) {
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
  if (mainWindow) {
    // @ts-ignore
    mainWindow.fileChanged = false;
    // @ts-ignore
    mainWindow.descriptionChanged = false;
  }
  newWindowInstance.setMenuBarVisibility(false);
  if (url) newWindowInstance.loadURL(url);
  else newWindowInstance.loadURL(resolveHtmlPath('index.html'));
}

// --- Menu Binding ---
function bindTrayMenu(i18n: any) {
  buildTrayMenu(
    {
      showTagSpaces: showApp,
      resumePlayback,
      createNewWindowInstance,
      openSearch: showSearch,
      toggleNewFileDialog: newMDFile,
      openNextFile: getNextFile,
      openPrevFile: getPreviousFile,
      quitApp: reloadApp,
    },
    i18n,
    isMacLike,
    globalShortcutsEnabled,
  );
}
function bindAppMenu(i18n: any) {
  buildDesktopMenu(
    {
      showTagSpaces: showApp,
      openSearch: showSearch,
      toggleNewFileDialog: newMDFile,
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

// --- WebSocket Server ---
async function findPort() {
  if (isDebug || testMode) return 2000;
  const defaultWSPort = settings.getInitWsPort();
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
    let filepath, script, envPath;
    if (app.isPackaged) {
      filepath = process.resourcesPath;
      script = 'app.asar/node_modules/@tagspaces/tagspaces-ws/build/index.js';
      envPath = path.join(filepath, 'app.asar/.env');
    } else {
      filepath = path.join(
        __dirname,
        '../node_modules/@tagspaces/tagspaces-ws/build',
      );
      script = 'index.js';
      envPath = path.join(__dirname, '../.env');
    }
    const properties = propertiesReader(envPath);
    const results = new Promise((resolve, reject) => {
      findPort().then((freePort) => {
        try {
          pm2.start(
            {
              name: 'Tagspaces WS',
              script,
              cwd: filepath,
              args: ['-p', freePort, '-k', properties.get('KEY')],
              restartAt: [],
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
                mainWindow?.webContents.send('start_ws', { port: freePort });
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

// --- Main Window Creation ---
const createWindow = async (i18n: any) => {
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

  if (isDebug) await installExtensions();

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

  mainWindow.webContents.on('before-input-event', (_, input) => {
    if (!mainWindow) throw new Error('"mainWindow" is not defined');
    if (input.type === 'keyDown' && input.key === 'F12') {
      mainWindow.webContents.isDevToolsOpened()
        ? mainWindow.webContents.closeDevTools()
        : mainWindow.webContents.openDevTools({ mode: 'right' });
    }
  });

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) throw new Error('"mainWindow" is not defined');
    if (process.env.START_MINIMIZED) mainWindow.minimize();
    else mainWindow.show();
  });

  mainWindow.on('show', () => {
    if (!mainWindow) throw new Error('"mainWindow" is not defined');
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
      if (choice === 0) e.preventDefault();
      // No action needed for "Close Application", window will close
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.on(
    'render-process-gone',
    (_, { reason, exitCode }) => {
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
};

// --- Electron App Events ---
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

// Mac only solution for opening files
app.on('open-file', (event, filePath) => {
  event.preventDefault(); // important — prevents default macOS behavior
  startupFilePath = filePath;
  if (app.isReady()) {
    const startupParameter = '?cmdopen=' + encodeURIComponent(startupFilePath);
    const url = resolveHtmlPath('index.html') + startupParameter;
    createNewWindowInstance(url);
  } else {
  }
});

if (!isDebug) {
  const gotLock = app.requestSingleInstanceLock();
  if (!gotLock) {
    app.quit();
  } else {
    // Windows and Linux solution for opening files
    app.on('second-instance', (event, argv) => {
      const fileArg = argv.find((arg) =>
        SUPPORTED_EXTS.has(path.extname(arg).toLowerCase()),
      );
      const startupParameter = '?cmdopen=' + encodeURIComponent(fileArg);
      const url = resolveHtmlPath('index.html') + startupParameter;
      createNewWindowInstance(url);
    });
  }
}

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

// --- Startup ---
startWS();

let appI18N: any;

protocol.register();

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
              toggleNewFileDialog: newMDFile,
              openNextFile: getNextFile,
              openPrevFile: getPreviousFile,
            },
            i18n,
          ),
        );
      }
      createWindow(i18n);

      protocol.initialize();

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

      // --- IPC Main Handlers ---
      ipcMain.on('show-main-window', showApp);
      ipcMain.on('create-new-window', (e, url) => createNewWindowInstance(url));
      ipcMain.on('file-changed', (e, isChanged) => {
        // @ts-ignore
        if (mainWindow) mainWindow.fileChanged = isChanged;
      });
      ipcMain.on('description-changed', (e, isChanged) => {
        // @ts-ignore
        if (mainWindow) mainWindow.descriptionChanged = isChanged;
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
            mainWindow?.webContents.send('set_extensions', setExtensions);
          })
          .catch((err) => console.error('load-extensions', err));
      });

      ipcMain.on('focus-window', () => mainWindow?.focus());
      ipcMain.on('get-user-home-path', (event) => {
        event.returnValue = app.getPath('home');
      });
      ipcMain.on('worker-response', (event, arg) => {
        mainWindow?.webContents.send(arg.id, arg);
      });
      ipcMain.on('app-data-path-request', (event) => {
        event.returnValue = app.getPath('appData');
      });
      ipcMain.on('app-version-request', (event) => {
        event.returnValue = app.getVersion();
      });
      ipcMain.on('set-language', (e, language) => {
        i18n.changeLanguage(language);
      });
      ipcMain.on('setZoomFactor', (event, zoomLevel) => {
        BrowserWindow.getFocusedWindow()?.webContents.setZoomFactor(zoomLevel);
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

      process.removeAllListeners('uncaughtException');
      process.on('uncaughtException', (error) => {
        console.error(
          'UNCAUGHT EXCEPTION in main:',
          error && error.stack ? error.stack : error,
        );
        const msg = error && error.message ? error.message : '';
        //@ts-ignore
        const code = error && error.code ? error.code : '';
        const isAbort = error && error.name === 'AbortError';
        const isSocketHangUp =
          msg.includes('socket hang up') ||
          code === 'ECONNRESET' ||
          code === 'ECONNABORTED';

        if (isAbort || isSocketHangUp) {
          console.warn(
            'Known non-fatal error (ignored):',
            msg || code || error,
          );
          return;
        }
        try {
          reloadApp();
        } catch (reloadErr) {
          console.error(
            'reloadApp() failed, exiting process:',
            reloadErr && reloadErr.stack ? reloadErr.stack : reloadErr,
          );
          process.exit(1);
        }
      });
    });
  })
  .catch(console.log);
