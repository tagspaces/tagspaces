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
  //console.log(arg);
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

  webContents.on('crash', function() {
    console.log("WebContent crashed");
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  mainWindow.on('minimize', function(event) {
    event.preventDefault();
    mainWindow.hide();
  });
  //
  if (process.platform == 'darwin') {
    trayIcon = new Tray('assets/icon32.png');
  } else if (process.platform == 'win') {
    trayIcon = new Tray('assets/icon32.png');
  } else {
    trayIcon = new Tray('assets/icon32.png');
  }
  var trayMenuTemplate = [
    {
      label: 'Show App',
      click: function() {
        mainWindow.show();
      }
    },
    {
      label: 'Quit',
      click: function(event) {
        console.log(event);
        app.quit();
        //event.ipcRenderer.send('remove-tray');
        //ipcRenderer.send('window-all-closed');
      }
    }
  ];

  trayIcon.on('click', function() {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });

  var title = 'TagSpaces App';
  var trayMenu = Menu.buildFromTemplate(trayMenuTemplate);
  trayIcon.setToolTip(title);
  trayIcon.setTitle(title);
  trayIcon.setContextMenu(trayMenu);

  globalShortcut.register('ctrl+Alt+space', function(){
    mainWindow.webContents.send('play-pause', 'play-pause');
  });

  globalShortcut.register('ctrl+Alt+P', function(){
    mainWindow.webContents.send('play', 'play');
  });

  globalShortcut.register('ctrl+Alt+N', function(){
    mainWindow.webContents.send("new-file" ,"new");
  });

  globalShortcut.register('ctrl+Alt+I', function(){
    mainWindow.webContents.send("next-file" ,"next");
  });

  globalShortcut.register('ctrl+Alt+O', function(){
    mainWindow.webContents.send("previous-file" ,"previous");
  });

  globalShortcut.register('CommandOrControl+Alt+T', function () {
    mainWindow.webContents.send("showing-tagspaces" ,"tagspaces");
  })
});
