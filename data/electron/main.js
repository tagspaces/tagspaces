'use strict';

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;
const Menu = electron.Menu;
const Tray = electron.Tray;
const globalShortcut = electron.globalShortcut;
const dialog = electron.dialog;
const windowStateKeeper = require('electron-window-state');

let debugMode;
let portableMode;
let startupFilePath;
let trayIcon = null;

// Removing buffer for security reasons
// delete global.Buffer;

const isOSX = /^darwin/.test(process.platform);

//handling start parameter
//console.log(JSON.stringify(process.argv));
process.argv.forEach((arg, count) => {
  if (arg.toLowerCase() === '-d' || arg.toLowerCase() === '--debug') {
    debugMode = true;
  } else if (arg.toLowerCase() === '-p' || arg.toLowerCase() === '--portable') {
    app.setPath('userData', process.cwd() + '/tsprofile'); // making the app portable
    portableMode = true;
  } else if (isOSX && arg.indexOf('-psn') >= 0) { // ignoring the -psn process serial number paremater on OSX by double click
    arg = "";
  } else if (arg === '.' || count === 0) { // ignoring the first argument
    //Ignore these argument
  } else if (arg.length > 2) {
    console.log("Opening file: " + arg);
    startupFilePath = arg;
  }
});

if (portableMode) {
  startupFilePath = undefined;
}

ipcMain.on('quit-application', (event, arg) => {
  app.quit();
});

let path = require('path');
let applicationPath = path.dirname(__dirname);
let indexPath = 'file://' + applicationPath + '/index.html';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null;
let newWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  //if (process.platform != 'darwin') {
  app.quit();
  //}
});

app.on('will-quit', () => {
  // Unregister all shortcuts.
  globalShortcut.unregisterAll();
});

ipcMain.on("new-win", () => {
  newWindow = new BrowserWindow({width: 1280, height: 768});

  let startupParameter = "";
  if (startupFilePath) {
    startupParameter = "?open=" + encodeURIComponent(startupFilePath);
  }

  newWindow.setMenu(null);
  newWindow.loadURL(indexPath + startupParameter);

  if (debugMode) {
    newWindow.webContents.openDevTools();
  }

  newWindow.once('ready-to-show', () => {
    newWindow.show();
  });

  ipcMain.on('win-close', (e, arg) => {
    newWindow.hide();
  });

  ipcMain.on('close', (e, arg) => {
    newWindow.hide();
  });
});

ipcMain.on('relaunch-app', reloadApp);

function reloadApp() {
  if (mainWindow) {
    mainWindow.loadURL(indexPath);
  }
  if (newWindow) {
    newWindow.loadURL(indexPath);
  }
}

app.on('ready', (event) => {
  //console.log(app.getLocale());
  //console.log(app.getAppPath());

  // Load the previous state with fallback to defaults
  let mainWindowState = windowStateKeeper({
    defaultWidth: 1280,
    defaultHeight: 768
  });

  // Create the window using the state information
  mainWindow = new BrowserWindow({
    'x': mainWindowState.x,
    'y': mainWindowState.y,
    'width': mainWindowState.width,
    'height': mainWindowState.height
  });

  // Let us register listeners on the window, so we can update the state
  // automatically (the listeners will be removed when the window is closed)
  // and restore the maximized or full screen state
  mainWindowState.manage(mainWindow);

  let startupParameter = "";
  if (startupFilePath) {
    startupParameter = "?open=" + encodeURIComponent(startupFilePath);
  }

  mainWindow.setMenu(null);
  mainWindow.loadURL(indexPath + startupParameter);

  if (debugMode) {
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  ipcMain.on('close', (e, arg) => {
    mainWindow.hide();
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

  ipcMain.on('win-close', (e, arg) => {
    mainWindow.hide();
  });

  let focusedWindow = BrowserWindow.getFocusedWindow();

  let trayIconPath;
  if (process.platform === 'darwin') {
    trayIconPath = path.join(__dirname, '/../assets/icon16.png');
  } else if (process.platform === 'win32') {
    trayIconPath = path.join(__dirname, '/../assets/trayicon.png');
  } else {
    trayIconPath = path.join(__dirname, '/../assets/trayicon.png');
  }

  trayIcon = new Tray(trayIconPath);

  let ctrlName = "Ctrl";
  if (process.platform == 'darwin') {
    ctrlName = "Cmd";
  }

  let trayMenuTemplate = [
    {
      label: 'Show TagSpaces (' + ctrlName + '+Alt+W)',
      click: showTagSpaces
    },
    {
      type: 'separator'
    },
    {
      label: 'New Text File (' + ctrlName + '+Alt+N)',
      click: newTextFile
    },
    {
      label: 'New HTML File',
      click: newHTMLFile
    },
    {
      label: 'New Markdown File',
      click: newMDFile
    },
    {
      label: 'New Audio File',
      click: newAudioFile
    },
    {
      type: 'separator'
    },
    {
      label: 'Open Next File (' + ctrlName + '+Alt+S)',
      click: getNextFile
    },
    {
      label: 'Open Previous File (' + ctrlName + '+Alt+A)',
      click: getPreviousFile
    },
    {
      type: 'separator'
    },
    {
      label: 'Pause/Resume Playback (' + ctrlName + '+Alt+P)',
      click: resumePlayback
    },
    {
      type: 'separator'
    },
    {
      label: 'Quit TagSpaces',
      click: () => {
        app.quit();
      }
    }
  ];

  trayIcon.on('click', () => {
    if (mainWindow) {
      mainWindow.show();
    } else {
      newWindow.show();
    }
  });

  let title = 'TagSpaces App';
  let trayMenu = Menu.buildFromTemplate(trayMenuTemplate);
  // trayIcon.setToolTip(title);
  // trayIcon.setTitle(title);
  trayIcon.setContextMenu(trayMenu);

  globalShortcut.register('CommandOrControl+Alt+P', resumePlayback);

  globalShortcut.register('CommandOrControl+Alt+N', newTextFile);

  globalShortcut.register('CommandOrControl+Alt+S', getNextFile);

  globalShortcut.register('CommandOrControl+Alt+A', getPreviousFile);

  globalShortcut.register('CommandOrControl+Alt+W', showTagSpaces);

  function showTagSpaces() {
    if (mainWindow) {
      mainWindow.restore();
      mainWindow.show();
    } else {
      newWindow.restore();
      newWindow.show();
    }
    //mainWindow.webContents.send("showing-tagspaces", "tagspaces");
  }

  function newTextFile() {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.webContents.send("file", "text");
    } else {
      newWindow.show();
      newWindow.webContents.send("file", "text");
    }
  }

  function newHTMLFile() {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.webContents.send("file", "html");
    } else {
      newWindow.show();
      newWindow.webContents.send("file", "html");
    }
  }

  function newMDFile() {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.webContents.send("file", "markdown");
    } else {
      newWindow.show();
      newWindow.webContents.send("file", "markdown");
    }
  }

  function newAudioFile() {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.webContents.send("file", "audio");
    } else {
      newWindow.show();
      newWindow.webContents.send("file", "audio");
    }
  }

  function getNextFile() {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.webContents.send("file", "next-file");
    } else {
      newWindow.show();
      newWindow.webContents.send("file", "next-file");
    }
  }

  function getPreviousFile() {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.webContents.send("file", "previous-file");
    } else {
      newWindow.show();
      newWindow.webContents.send("file", "previous-file");
    }
  }

  function resumePlayback() {
    if (mainWindow) {
      mainWindow.webContents.send("play-pause", true);
    } else {
      newWindow.webContents.send("play-pause", true);
    }
  }
});

process.on('uncaughtException', (error) => {
  if (error.stack) {
    console.error('error:', error.stack);
  }
  reloadApp();
});