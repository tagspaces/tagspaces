'use strict';

const electron = require('electron');
const app = electron.app;  // Module to control application life.
const BrowserWindow = electron.BrowserWindow;  // Module to create native browser window.


var debugMode;
process.argv.forEach(function(arg) {
  if (arg.indexOf('-d') >= 0) {
    debugMode = true;
  }

  //app.setPath('userData','data'); // making the app portable

});

var path = require('path');
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin') {
    app.quit();
  }
});

app.on('ready', function() {
  mainWindow = new BrowserWindow({width: 1280, height: 768});

  // and load the index.html of the app.
  //var indexPath = 'file://' + __dirname + '/index.html';
  var indexPath = 'file://' + path.dirname(__dirname) + '/index.html';
  console.log("mainWindow.loadURL: " + indexPath);
  console.log("App path: " + app.getAppPath());

  mainWindow.setMenu(null);
  mainWindow.loadURL(indexPath);

  if (debugMode) {
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});
