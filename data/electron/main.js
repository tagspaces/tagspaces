'use strict';

const electron = require('electron');
const app = electron.app;  // Module to control application life.
const BrowserWindow = electron.BrowserWindow;  // Module to create native browser window.
const ipcMain = require('electron').ipcMain;
const Menu = require('electron').Menu;
const Tray = require('electron').Tray;
const globalShortcut = electron.globalShortcut;
const dialog = electron.dialog;

var debugMode;
var startupFilePath;
var trayIcon = null;

//handling start parameter
//console.log(JSON.stringify(process.argv));
process.argv.forEach(function(arg, count) {
  if (arg.toLowerCase() === '-d' || arg.toLowerCase() === '--debug') {
    debugMode = true;
  } else if (arg.toLowerCase() === '-p' || arg.toLowerCase() === '--portable') {
    app.setPath('userData', 'tsprofile'); // making the app portable
  } else if (arg === '.' || count === 0) { // ignoring the first argument
    //Ignore these argument
  } else if (arg.length > 2) {
    console.log("Opening file: " + arg);
    startupFilePath = arg;
  }
});

// In main process.
ipcMain.on('asynchronous-message', function(event, arg) {
  console.log(arg);  // prints "ping"
  event.sender.send('asynchronous-reply', 'pong');
});

ipcMain.on('synchronous-message', function(event, arg) {
  console.log(arg);  // prints "ping"
  event.returnValue = 'pong';
});

ipcMain.on('quit-application', function(event, arg) {
  app.quit();
});

var path = require('path');
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  //if (process.platform != 'darwin') {
  app.quit();
  //}
});

app.on('ready', function(event) {
  console.log(app.getLocale());
  console.log(app.getAppPath());
  mainWindow = new BrowserWindow({width: 1280, height: 768});

  //var indexPath = 'file://' + __dirname + '/index.html';
  var startupParameter = "";
  if (startupFilePath) {
    startupParameter = "?open=" + encodeURIComponent(startupFilePath);
  }
  var indexPath = 'file://' + path.dirname(__dirname) + '/index.html' + startupParameter;

  mainWindow.setMenu(null);
  mainWindow.loadURL(indexPath);

  if (debugMode) {
    mainWindow.webContents.openDevTools();
  }

  var webContents = mainWindow.webContents;

  webContents.on('crash', function(e) {
    console.log("WebContent crashed");
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  mainWindow.webContents.on('crashed', function(){
    const options = {
      type: 'info',
      title: 'Renderer Process Crashed',
      message: 'This process has crashed.',
      buttons: ['Reload', 'Close']
    };
    dialog.showMessageBox(mainWindow ,options, function(index) {
      mainWindow.hide();
      if (index === 0) {
        mainWindow.reload();
      } else {
        mainWindow.close();
      }
    });
  });

  //mainWindow.on('minimize', function(event) {
  //  event.preventDefault();
  //  mainWindow.hide();
  //});

  if (process.platform === 'darwin') {
    trayIcon = new Tray('assets/icon32.png');
  } else if (process.platform === 'win') {
    trayIcon = new Tray('assets/icon32.png');
  } else {
    trayIcon = new Tray('assets/icon32.png');
  }
  var trayMenuTemplate = [
    {
      label: 'TagSpaces',
      click: function() {
        mainWindow.show();
      }
    },
    {
      label: 'New File',
      click: newFile
    },
    {
      label: 'Next File',
      click: getNextFile
    },
    {
      label: 'Previous File',
      click: getPreviousFile
    },
    {
      label: 'Stop Playback',
      click: stopPlayback
    },
    {
      label: 'Resume Playback',
      click: resumePlayback
    },
    {
      label: 'Quit',
      click: function() {
        app.quit();
      }
    }
  ];

  trayIcon.on('click', function() {
    mainWindow.show();
    //mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });

  var title = 'TagSpaces App';
  var trayMenu = Menu.buildFromTemplate(trayMenuTemplate);
  trayIcon.setToolTip(title);
  trayIcon.setTitle(title);
  trayIcon.setContextMenu(trayMenu);

  globalShortcut.register('CommandOrControl+Alt+space', function() {
    stopPlayback();
  });

  globalShortcut.register('CommandOrControl+Alt+P', function() {
    resumePlayback();
  });

  globalShortcut.register('CommandOrControl+Alt+N', function() {
    newFile();
  });

  globalShortcut.register('CommandOrControl+Alt+I', function() {
    getNextFile();
  });

  globalShortcut.register('CommandOrControl+Alt+O', function() {
    getPreviousFile();
  });

  globalShortcut.register('CommandOrControl+Alt+L', function() {
    showTagSpaces();
  });

  function showTagSpaces() {
    mainWindow.show();
    mainWindow.webContents.send("showing-tagspaces", "tagspaces");
  }

  function newFile() {
    mainWindow.show();
    mainWindow.webContents.send("new-file", "new");
  }

  function getNextFile() {
    mainWindow.show();
    mainWindow.webContents.send("next-file", "next");
  }

  function getPreviousFile() {
    mainWindow.show();
    mainWindow.webContents.send("previous-file", "previous");
  }

  function resumePlayback() {
    mainWindow.show();
    mainWindow.webContents.send('play', 'play');
  }

  function stopPlayback() {
    mainWindow.show();
    mainWindow.webContents.send('play-pause', 'play-pause');
  }
});

process.on('uncaughtException', function(error) {
  if (error.stack) {
    console.error('error:', error.stack);
  }
  // Handle the error
  if (error) {
    const options = {
      type: 'info',
      title: 'Renderer Process Crashed',
      message: 'This process has crashed.',
      buttons: ['Reload', 'Close']
    };
    dialog.showMessageBox(mainWindow, options, function(index) {
      if (index === 0) {
        mainWindow.reload();
      } else {
        mainWindow.close();
      }
    });
  }
});