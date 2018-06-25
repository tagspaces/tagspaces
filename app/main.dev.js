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
 * @flow
 */

import { app, BrowserWindow, ipcMain, globalShortcut, dialog } from 'electron';
import windowStateKeeper from 'electron-window-state';
import path from 'path';

let mainWindow = null;
global.splashWorkerWindow = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
  console.log = () => {};
  console.time = () => {};
  console.timeEnd = () => {};
}

let debugMode;
let startupFilePath;
let portableMode;

process.argv.forEach((arg, count) => {
  if (arg.toLowerCase() === '-d' || arg.toLowerCase() === '--debug') {
    debugMode = true;
  } else if (arg.toLowerCase() === '-p' || arg.toLowerCase() === '--portable') {
    app.setPath('userData', process.cwd() + '/tsprofile'); // making the app portable
    portableMode = true;
  } else if (arg.indexOf('-psn') >= 0) { // ignoring the -psn process serial number parameter on MacOS by double click
    arg = '';
  } else if (arg === '.' || count === 0) { // ignoring the first argument
    // Ignore these argument
  } else if (arg.length > 2) {
    // console.warn('Opening file: ' + arg);
    startupFilePath = arg;
  }

  if (portableMode) {
    startupFilePath = undefined;
  }
});

if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
  require('electron-debug')({ showDevTools: false });
  const p = path.join(__dirname, '..', 'app', 'node_modules');
  require('module').globalPaths.push(p);
}

const installExtensions = async () => {
  const { default: installExtension, REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } = require('electron-devtools-installer');

  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = [
    REACT_DEVELOPER_TOOLS,
    REDUX_DEVTOOLS
  ];

  return Promise
    .all(extensions.map(name => installExtension(name.id, forceDownload)))
    .catch(console.log);
};

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', async () => {
  let showWorkerWindow = false;

  if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
    await installExtensions();
  }

  if (process.env.NODE_ENV === 'development') {
    showWorkerWindow = true;
  }

  const mainWindowState = windowStateKeeper({
    defaultWidth: 1280,
    defaultHeight: 800
  });

  // console.log('Dev ' + process.env.NODE_ENV + ' worker ' + showWorkerWindow);
  global.splashWorkerWindow = new BrowserWindow({
    show: showWorkerWindow,
    width: 800,
    height: 600,
    frame: false,
    // transparent: true,
  });

  global.splashWorkerWindow.loadURL(`file://${__dirname}/splash.html`);

  mainWindow = new BrowserWindow({
    show: false,
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    icon: path.join(__dirname, 'assets/icons/128x128.png')
  });

  const indexPath = `file://${__dirname}/app.html`;
  mainWindow.loadURL(indexPath);
  mainWindow.setAutoHideMenuBar(true);
  mainWindow.setMenuBarVisibility(false);

  ipcMain.on('worker', (event, arg) => {
    // console.log('worker event in main.' + arg.result.length);
    if (mainWindow) {
      mainWindow.webContents.send(arg.id, arg);
    }
  });

  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    mainWindow.show();
    global.splashWorkerWindow.hide(); // Comment for easy dubugging of the worker
    mainWindow.focus();
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
    try {
      global.splashWorkerWindow.close();
      global.splashWorkerWindow = null;
    } catch (err) {
      console.warn('Error closing the splash window. ' + err);
    }
  });

  mainWindow.webContents.on('crashed', () => {
    const options = {
      type: 'info',
      title: 'Renderer Process Crashed',
      message: 'This process has crashed.',
      buttons: ['Reload', 'Close']
    };
    dialog.showMessageBox(mainWindow, options, (index) => {
      mainWindow.hide();
      if (index === 0) {
        reloadApp();
      } else {
        mainWindow.close();
      }
    });
  });

  ipcMain.on('app-data-path-request', (event) => {
    event.returnValue = app.getPath('appData');
  });

  ipcMain.on('app-version-request', (event) => {
    event.returnValue = app.getVersion();
  });

  ipcMain.on('app-dir-path-request', (event) => {
    event.returnValue = path.join(__dirname, '');
  });

  ipcMain.on('global-shortcuts-enabled', (e, arg) => {
    if (arg) {
      globalShortcut.register('CommandOrControl+Alt+P', resumePlayback);
      globalShortcut.register('MediaPlayPause', resumePlayback);
      globalShortcut.register('CommandOrControl+Alt+N', newTextFile);
      globalShortcut.register('CommandOrControl+Alt+D', getNextFile);
      globalShortcut.register('MediaNextTrack', getNextFile);
      globalShortcut.register('CommandOrControl+Alt+A', getPreviousFile);
      globalShortcut.register('MediaPreviousTrack', getPreviousFile);
      globalShortcut.register('CommandOrControl+Alt+W', showTagSpaces);
    } else {
      globalShortcut.unregisterAll();
    }
  });

  ipcMain.on('relaunch-app', reloadApp);

  ipcMain.on('quit-application', () => {
    app.quit();
  });

  mainWindowState.manage(mainWindow);

  function showTagSpaces() {
    if (mainWindow) {
      mainWindow.restore();
      mainWindow.show();
    }
    // mainWindow.webContents.send("showing-tagspaces", "tagspaces");
  }

  function newTextFile() {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.webContents.send('file', 'new-text-file');
    }
  }

  function getNextFile() {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.webContents.send('file', 'next-file');
    }
  }

  function getPreviousFile() {
    if (mainWindow) {
      mainWindow.show();
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
      mainWindow.loadURL(indexPath);
    }
  }

  process.on('uncaughtException', (error) => {
    if (error.stack) {
      console.error('error:', error.stack);
      throw new Error('error:', error.stack);
    }
    reloadApp();
  });
});

