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

import { app, BrowserWindow, ipcMain, globalShortcut, dialog } from 'electron';
import windowStateKeeper from 'electron-window-state';
import path from 'path';

let mainWindow = null;
(global as any).splashWorkerWindow = null;

if (process.env.NODE_ENV === 'production') {
  // eslint-disable-next-line
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
  console.log = () => {};
  console.time = () => {};
  console.timeEnd = () => {};
}

// let debugMode;
let startupFilePath;
let portableMode;

process.argv.forEach((arg, count) => {
  if (arg.toLowerCase() === '-d' || arg.toLowerCase() === '--debug') {
    // debugMode = true;
  } else if (arg.toLowerCase() === '-p' || arg.toLowerCase() === '--portable') {
    app.setPath('userData', process.cwd() + '/tsprofile'); // making the app portable
    portableMode = true;
  } else if (arg.indexOf('-psn') >= 0) {
    // ignoring the -psn process serial number parameter on MacOS by double click
    arg = '';
  } else if (arg === './app/main.dev.babel.js' || arg === '.' || count === 0) {
    // ignoring the first argument
    // Ignore these argument
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

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  // eslint-disable-next-line
  require('electron-debug')({ showDevTools: false, devToolsMode: 'right' });
  const p = path.join(__dirname, '..', 'app', 'node_modules');
  // eslint-disable-next-line
  require('module').globalPaths.push(p);
}

// if (process.platform === 'linux') {
//   app.commandLine.appendSwitch('disable-gpu'); // Fix the freezing the app with a black box on dnd https://github.com/electron/electron/issues/12820
// }

// app.commandLine.appendSwitch('js-flags', '--max-old-space-size=4096'); // disabled due crashes on win 7
app.commandLine.appendSwitch('--disable-http-cache');

const installExtensions = async () => {
  const {
    default: installExtension,
    REACT_DEVELOPER_TOOLS,
    REDUX_DEVTOOLS
  } = require('electron-devtools-installer'); // eslint-disable-line

  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = [REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS];

  return Promise.all(
    extensions.map(name => installExtension(name.id, forceDownload))
  ).catch(console.log);
};

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required'); // Fix broken autoplay functionality in the av player

app.on('window-all-closed', () => {
  globalShortcut.unregisterAll();
  app.quit();
});

app.on('ready', async () => {
  let workerDevMode = false;
  let mainHTML = `file://${__dirname}/app.html`;

  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  if (process.env.NODE_ENV === 'development') {
    workerDevMode = true;
    mainHTML = `file://${__dirname}/appd.html`;
  }

  const mainWindowState = windowStateKeeper({
    defaultWidth: 1280,
    defaultHeight: 800
  });

  function createSplashWorker() {
    // console.log('Dev ' + process.env.NODE_ENV + ' worker ' + showWorkerWindow);
    (global as any).splashWorkerWindow = new BrowserWindow({
      show: workerDevMode,
      x: 0,
      y: 0,
      width: workerDevMode ? 800 : 1,
      height: workerDevMode ? 600 : 1,
      frame: false,
      webPreferences: {
        nodeIntegration: true
      }
    });

    (global as any).splashWorkerWindow.loadURL(
      `file://${__dirname}/splash.html`
    );
  }

  createSplashWorker();

  let startupParameter = '';
  if (startupFilePath) {
    if (startupFilePath.startsWith('./') || startupFilePath.startsWith('.\\')) {
      startupParameter =
        '?open=' + encodeURIComponent(path.join(__dirname, startupFilePath));
    } else {
      startupParameter = '?open=' + encodeURIComponent(startupFilePath);
    }
  }

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
      webviewTag: true
    }
  });

  const winUserAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36';
  const testWinOnUnix = false; // set to true to simulate windows os, useful for testing s3 handling

  mainWindow.loadURL(
    mainHTML + startupParameter,
    testWinOnUnix ? { userAgent: winUserAgent } : {}
  );
  mainWindow.setMenuBarVisibility(true);

  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    // mainWindow.show();
    (global as any).splashWorkerWindow.hide(); // Comment for easy debugging of the worker
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
    try {
      (global as any).splashWorkerWindow.close();
      (global as any).splashWorkerWindow = null;
    } catch (err) {
      // console.warn('Error closing the splash window. ' + err);
    }
  });

  mainWindow.webContents.on('crashed', () => {
    const options = {
      type: 'info',
      title: 'Renderer Process Crashed',
      message: 'This process has crashed.',
      buttons: ['Reload', 'Close']
    };

    if (!mainWindow) {
      globalShortcut.unregisterAll();
      return;
    }

    dialog.showMessageBox(mainWindow, options).then(dialogResponse => {
      mainWindow.hide();
      if (dialogResponse.response === 0) {
        reloadApp();
      } else {
        mainWindow.close();
        globalShortcut.unregisterAll();
      }
    });
  });

  (global as any).splashWorkerWindow.webContents.on('crashed', () => {
    try {
      (global as any).splashWorkerWindow.close();
      (global as any).splashWorkerWindow = null;
    } catch (err) {
      console.warn('Error closing the splash window. ' + err);
    }
    createSplashWorker();
  });

  ipcMain.on('worker', (event, arg) => {
    // console.log('worker event in main.' + arg.result.length);
    if (mainWindow) {
      mainWindow.webContents.send(arg.id, arg);
    }
  });

  ipcMain.on('setSplashVisibility', (event, arg) => {
    // worker window needed to be visible for the PDF tmb generation
    // console.log('worker event in main: ' + arg.visibility);
    if ((global as any).splashWorkerWindow && arg.visibility) {
      (global as any).splashWorkerWindow.show();
      // arg.visibility ? global.splashWorkerWindow.show() : global.splashWorkerWindow.hide();
    }
  });

  ipcMain.on('app-data-path-request', event => {
    event.returnValue = app.getPath('appData'); // eslint-disable-line
  });

  ipcMain.on('app-version-request', event => {
    event.returnValue = app.getVersion(); // eslint-disable-line
  });

  ipcMain.on('app-dir-path-request', event => {
    event.returnValue = path.join(__dirname, ''); // eslint-disable-line
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

  process.on('uncaughtException', error => {
    if (error.stack) {
      console.error('error:', error.stack);
      throw new Error(error.stack);
    }
    reloadApp();
  });

  mainWindowState.manage(mainWindow);

  function showTagSpaces() {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.show();
    }
  }

  function showSearch() {
    if (mainWindow) {
      showTagSpaces();
      mainWindow.webContents.send('file', 'open-search');
    }
  }

  function newTextFile() {
    if (mainWindow) {
      showTagSpaces();
      mainWindow.webContents.send('file', 'new-text-file');
    }
  }

  function getNextFile() {
    if (mainWindow) {
      mainWindow.webContents.send('file', 'next-file');
    }
  }

  function getPreviousFile() {
    if (mainWindow) {
      mainWindow.webContents.send('file', 'previous-file');
    }
  }

  function resumePlayback() {
    if (mainWindow) {
      mainWindow.webContents.send('play-pause', true);
    }
  }

  function reloadApp() {
    if (mainWindow) {
      mainWindow.loadURL(mainHTML);
    }
  }
});
