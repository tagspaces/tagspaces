/* Copyright (c) 2012-2015 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */
/* global define, fs, process, gui, pathUtils  */
/* undef: true, unused: true */

var fs = require('fs-extra'); // jshint ignore:line
var pathUtils = require('path'); // jshint ignore:line
var gui = require('nw.gui'); // jshint ignore:line
var trash = require('trash'); // jshint ignore:line

define(function(require, exports, module) {
  "use strict";

  console.log("Loading ioapi.node.js..");

  var TSCORE = require("tscore");
  var TSPOSTIO = require("tspostioapi");
  var fsWatcher;
  var win = gui.Window.get();

  var showMainWindow = function() {
    win.show();
  };

  win.on('close', function() {
    if (TSCORE.FileOpener.isFileChanged()) {
      if (confirm($.i18n.t("ns.common:confirmApplicationClose"))) {
        win.close(true);
      }
    } else {
      win.close(true);
    }
  });

  var rootMenu = new gui.Menu({ type: 'menubar' });
  var aboutMenu = new gui.Menu();
  var viewMenu = new gui.Menu();

  var menuInitialuzed = false;

  process.on("uncaughtException", function(err) {
    //var msg = ' Information | Description \n' +
    //          '-------------|-----------------------------\n' +
    //          ' Date        | '+ new Date +'\n' +
    //          ' Type        | UncaughtException \n' +
    //          ' Stack       | '+ err.stack +'\n\n';
    //fs.appendFile(errorLogFile, '---uncaughtException---\n' + msg);
  });

  // Experimental functionality
  function watchDirecotory(dirPath, listener) {
    if (fsWatcher) {
      fsWatcher.close();
    }
    fsWatcher = fs.watch(dirPath, {persistent: true, recursive: false}, listener);
  }

  function handleTray() {
    // TODO disable in Ubuntu until node-webkit issue in unity fixed

    // Reference to window and tray
    var win = gui.Window.get();
    var tray;

    // Get the minimize event
    win.on('minimize', function() {
      // Hide window
      this.hide();

      // Show tray
      tray = new gui.Tray({
        title: 'Tray',
        icon: 'icon128.png'
      });

      // Show window and remove tray when clicked
      tray.on('click', function() {
        win.show();
        this.remove();
        tray = null;
      });
    });
  }

  function handleStartParameters() {
    //Windows "C:\Users\na\Desktop\TagSpaces\tagspaces.exe" --original-process-start-time=13043601900594583 "G:\data\assets\icon16.png"
    //Linux /opt/tagspaces/tagspaces /home/na/Dropbox/TagSpaces/README[README].md
    //OSX /home/na/Dropbox/TagSpaces/README[README].md
    //gui.App.on('open', function(cmdline) {
    //   console.log('Command line arguments on open: ' + cmdline);
    //   TSCORE.FileOpener.openFile(cmdArguments);
    //});
    var cmdArguments = gui.App.argv;
    if (cmdArguments && cmdArguments.length > 0) {
      console.log("CMD Arguments: " + cmdArguments[0] + " Process running in " + process.cwd());
      var dataPathIndex;
      cmdArguments.forEach(function(part, index) {
        if (part.indexOf("--data-path") === 0) {
          dataPathIndex = index;
        }
      });
      if (dataPathIndex >= 0 && cmdArguments.length >= dataPathIndex + 1) {
        cmdArguments.splice(dataPathIndex, 2);
      }
      console.log("CMD Arguments cleaned: " + cmdArguments);
      var filePath = "" + cmdArguments;
      if (filePath.length > 1) {
        var dirPath = TSCORE.TagUtils.extractContainingDirectoryPath(filePath);
        TSCORE.IO.listDirectory(dirPath);
        TSCORE.FileOpener.openFileOnStartup(filePath);
      }
    }
  }

  function initMainMenu() {
    if (isOSX) {
      rootMenu.createMacBuiltin("TagSpaces");
    }
    if (TSCORE.Config.getShowMainMenu() && !menuInitialuzed) {
      aboutMenu.append(new gui.MenuItem({
        type: 'normal',
        label: $.i18n.t("ns.common:aboutTagSpaces"),
        click: function() {
          TSCORE.UI.showAboutDialog();
        }
      }));

      viewMenu.append(new gui.MenuItem({
        type: 'normal',
        label: $.i18n.t("ns.common:showTagLibraryTooltip") + " (" + TSCORE.Config.getShowTagLibraryKeyBinding() + ")",
        click: function() {
          TSCORE.UI.showTagsPanel();
        }
      }));

      viewMenu.append(new gui.MenuItem({
        type: 'normal',
        label: $.i18n.t("ns.common:showLocationNavigatorTooltip") + " (" + TSCORE.Config.getShowFolderNavigatorBinding() + ")",
        click: function() {
          TSCORE.UI.showLocationsPanel();
        }
      }));

      viewMenu.append(new gui.MenuItem({
        type: 'separator'
      }));

      viewMenu.append(new gui.MenuItem({
        type: 'normal',
        label: $.i18n.t("ns.common:toggleFullScreen") + " (" + TSCORE.Config.getToggleFullScreenKeyBinding().toUpperCase() + ")",
        click: function() {
          win.toggleFullscreen();
        }
      }));

      viewMenu.append(new gui.MenuItem({
        type: 'normal',
        label: $.i18n.t("ns.common:showDevTools") + " (" + TSCORE.Config.getOpenDevToolsScreenKeyBinding().toUpperCase() + ")",
        click: function() {
          win.showDevTools();
        }
      }));

      viewMenu.append(new gui.MenuItem({
        type: 'separator'
      }));

      viewMenu.append(new gui.MenuItem({
        type: 'normal',
        label: $.i18n.t("ns.common:settings"),
        click: function() {
          TSCORE.UI.showOptionsDialog();
        }
      }));

      rootMenu.append(new gui.MenuItem({
        type: 'normal',
        label: $.i18n.t("ns.common:view"),
        submenu: viewMenu
      }));

      rootMenu.append(new gui.MenuItem({
        type: 'normal',
        label: $.i18n.t("ns.common:help"),
        submenu: aboutMenu
      }));
      win.menu = rootMenu;

      menuInitialuzed = true;
    } else {
      if (isOSX) {
        win.menu = rootMenu;
      }
    }
  }

  // Brings the TagSpaces window on top of the windows
  function focusWindow() {
    gui.Window.get().focus();
  }

  // IOAPI

  function checkNewVersion() {
    console.log("Checking for new version...");
    var cVer = TSCORE.Config.DefaultSettings.appVersion + "." + TSCORE.Config.DefaultSettings.appBuild;
    $.ajax({
        url: 'http://tagspaces.org/releases/version.json?nVer=' + cVer,
        type: 'GET'
      })
      .done(function(data) {
        TSPOSTIO.checkNewVersion(data);
      })
      .fail(function(data) {
        console.log("AJAX failed " + data);
      });
  }

  function createDirectoryTree(dirPath) {
    console.log("Creating directory index for: " + dirPath);
    TSCORE.showWaitingDialog($.i18n.t("ns.common:waitDialogDiectoryIndexing"));

    var generateDirectoryTree = function(dirPath) {
      try {
        var tree = {};
        var dstats = fs.lstatSync(dirPath);
        tree.name = pathUtils.basename(dirPath);
        tree.isFile = false;
        tree.lmdt = dstats.mtime;
        tree.path = dirPath;
        tree.children = [];
        var dirList = fs.readdirSync(dirPath);
        for (var i = 0; i < dirList.length; i++) {
          var path = dirPath + TSCORE.dirSeparator + dirList[i];
          var stats = fs.lstatSync(path);
          if (stats.isFile()) {
            tree.children.push({
              "name": pathUtils.basename(path),
              "isFile": true,
              "size": stats.size,
              "lmdt": stats.mtime,
              "path": path
            });
          } else {
            tree.children.push(generateDirectoryTree(path));
          }
        }
        return tree;
      } catch (ex) {
        TSCORE.hideLoadingAnimation();
        console.error("Generating tree for " + dirPath + " failed " + ex);
      }
    };
    var directoyTree = generateDirectoryTree(dirPath);
    //console.log(JSON.stringify(directoyTree));
    TSPOSTIO.createDirectoryTree(directoyTree);
  }

  function listDirectoryPromiseAsync(path) {
    console.time("listDirectoryPromise");
    return new Promise(function(resolve, reject) {
      var statEntriesPromises = [];
      fs.readdir(path, function(error, entries) {
        if (error) {
          console.log("Error listing directory " + path);
          resolve([]); // returning results even if any promise fails
        }

        if (entries) {
          entries.forEach(function(entry) {
            statEntriesPromises.push(getPropertiesPromise(path + TSCORE.dirSeparator + entry));
          });
          Promise.all(statEntriesPromises).then(function(enhancedEntries) {
            console.timeEnd("listDirectoryPromise");
            resolve(enhancedEntries);
          }, function(err) {
            resolve([]); // returning results even if any promise fails
          });
        }
      });
    });
  }

  function listDirectoryPromise(path) {
    console.time("listDirectoryPromise");
    return new Promise(function(resolve, reject) {
      var enhancedEntries = [];
      var entryPath;
      var stats;
      var eentry;
      fs.readdir(path, function(error, entries) {
        if (error) {
          console.log("Error listing directory " + path);
          resolve(enhancedEntries); // returning results even if any promise fails
        }

        if (entries) {
          entries.forEach(function(entry) {
            entryPath = path + TSCORE.dirSeparator + entry;
            try {
              stats = fs.statSync(entryPath);
              eentry = {};
              eentry.name = entry;
              eentry.isFile = stats.isFile();
              eentry.size = stats.size;
              eentry.lmdt = stats.mtime;
              eentry.path = entryPath;
              enhancedEntries.push(eentry);
            } catch(e) {
              console.warn("Error getting stats for " + entryPath);
            }
          });
          console.timeEnd("listDirectoryPromise");
          resolve(enhancedEntries);
        }
      });
    });
  }


  function getPropertiesPromise(path) {
    /**
     * stats for file:
     * "dev":41,
     * "mode":33204,
     * "nlink":1,
     * "uid":1000,
     * "gid":1000,
     * "rdev":0,
     * "blksize":4096,
     * "ino":2634172,
     * "size":230,
     * "blocks":24,
     * "atime":"2015-11-24T09:56:41.932Z",
     * "mtime":"2015-11-23T14:29:29.689Z",
     * "ctime":"2015-11-23T14:29:29.689Z",
     * "birthtime":"2015-11-23T14:29:29.689Z",
     * "isFile":true,
     * "path":"/home/somefile.txt"
     */
    return new Promise(function(resolve, reject) {
      fs.lstat(path, function(err, stats) {
        if (err) {
          resolve(false);
        }

        if (stats) {
          var entry = {};
          entry.name = path.substring(path.lastIndexOf(TSCORE.dirSeparator) + 1, path.length);
          entry.isFile = stats.isFile();
          entry.size = stats.size;
          entry.lmdt = stats.mtime;
          entry.path = path;
          resolve(entry);
        }
      });
    });
  }

  /**
   * Create a directory
   * @name createDirectoryPromise
   * @method
   * @memberof nwjs.ioapi
   * @param {string} dirPath - the full path of the folder which should be created
   * @returns {Promise.<Success, Error>}
   */
  function createDirectoryPromise(dirPath) {
    return new Promise(function(resolve, reject) {
      fs.mkdir(dirPath, function(error) {
        if (error) {
          reject("Error creating folder: " + dirPath);
        }
        resolve();
      });
    });
  }

  function copyFilePromise(sourceFilePath, targetFilePath) {
    return new Promise(function(resolve, reject) {
      getPropertiesPromise(sourceFilePath).then(function(entry) {
        if (!entry.isFile) {
          reject($.i18n.t("ns.common:fileIsDirectory", {fileName:sourceFilePath}));
        } else {
          getPropertiesPromise(targetFilePath).then(function(entry2) {
            if (entry2) {
              reject($.i18n.t("ns.common:fileExists", {fileName:targetFilePath}));
            } else {

              var rd = fs.createReadStream(sourceFilePath);
              rd.on("error", function(err) {
                reject($.i18n.t("ns.common:fileCopyFailed", {fileName:sourceFilePath}));
              });
              var wr = fs.createWriteStream(targetFilePath);
              wr.on("error", function(err) {
                reject($.i18n.t("ns.common:fileCopyFailed", {fileName:sourceFilePath}));
              });
              wr.on("close", function(ex) {
                resolve();
              });
              rd.pipe(wr);

            }
          }, function(err) {
            reject(err);
          });
        }
      }, function(err) {
        reject(err);
      });
    });
  }

  function renameFilePromise(filePath, newFilePath) {
    console.log("Renaming file: " + filePath + " to " + newFilePath);
    return new Promise(function(resolve, reject) {
      if (filePath === newFilePath) {
        reject($.i18n.t("ns.common:fileTheSame"), $.i18n.t("ns.common:fileNotMoved"));
      }
      if (fs.lstatSync(filePath).isDirectory()) {
        reject($.i18n.t("ns.common:fileIsDirectory", {fileName:filePath}));
      }
      if (fs.existsSync(newFilePath)) {
        reject($.i18n.t("ns.common:fileExists", {fileName:newFilePath}), $.i18n.t("ns.common:fileRenameFailed"));
      }
      fs.move(filePath, newFilePath, function(error) {
        if (error) {
          reject("Renaming: " + filePath + " failed.");
        }
        resolve([filePath, newFilePath]);
      });
    });
  }

  function renameDirectoryPromise(dirPath, newDirName) {
    var newDirPath = TSCORE.TagUtils.extractParentDirectoryPath(dirPath) + TSCORE.dirSeparator + newDirName;
    console.log("Renaming dir: " + dirPath + " to " + newDirPath);
    return new Promise(function(resolve, reject) {
      if (dirPath === newDirPath) { 
        reject($.i18n.t("ns.common:directoryTheSame"), $.i18n.t("ns.common:directoryNotMoved"));
      }
      if (fs.existsSync(newDirPath)) {
        reject($.i18n.t("ns.common:directoryExists", {dirName:newDirPath}), $.i18n.t("ns.common:directoryRenameFailed"));
      }
      var dirStatus = fs.lstatSync(dirPath);
      if (dirStatus.isDirectory) {
        fs.rename(dirPath, newDirPath, function(error) {
          if (error) {
            console.error("Renaming directory failed " + error);
            reject("Renaming " + dirPath + " failed."); 
          }
          resolve(newDirPath);
        });
      } else {
        reject($.i18n.t("ns.common:pathIsNotDirectory", {dirName:dirPath}), $.i18n.t("ns.common:directoryRenameFailed"));
      }
    });
  }


  function loadTextFilePromise(filePath, isPreview) {
    console.log("Loading file: " + filePath);
    return new Promise(function(resolve, reject) {
      if (isPreview) {
        var stream = fs.createReadStream(filePath, {
          start: 0,
          end: 10000
        });
        stream.on('error', function(err) {
          reject(err);
        });

        stream.on('data', function(content) {
          //console.log("Stream: " + content);
          resolve(content);
        });

      } else {
        fs.readFile(filePath, 'utf8', function(error, content) {
          if (error) {
            reject(error);
          } else {
            resolve(content);
          }
        });
      }
    });
  }

  function loadTextStreamPromise(filePath) {
    return new Promise(function(resolve, reject) {
      var stream = fs.createReadStream(filePath, {
        start: 0,
        end: 10000
      });
      stream.on('error', function(err) {
        reject(err);
      });

      stream.on('data', function(content) {
        //console.log("Stream: " + content);
        resolve(content);
      });
    });
  }

  function getFileContentPromise(fullPath, type) {
    return new Promise(function(resolve, reject) {
      var fileURL = fullPath;
      if (fileURL.indexOf("file://") === -1) {
        fileURL = "file://" + fileURL;
      }
      var xhr = new XMLHttpRequest();
      xhr.open("GET", fileURL, true);
      xhr.responseType = type || "arraybuffer";
      xhr.onerror = reject;

      xhr.onload = function() {
        var response = xhr.response || xhr.responseText;
        if (response) {
          resolve(response);
        } else {
          reject("getFileContentPromise error");
        }
      };
      xhr.send();
    });
  }


  function saveFilePromise(filePath, content, overwrite) {
    return new Promise(function(resolve, reject) {
      function saveFile(filePath, content, isNewFile) {
        fs.writeFile(filePath, content, 'utf8', function(error) {
          if (error) {
            reject(error);
          }
          resolve(isNewFile);
        });
      }

      getPropertiesPromise(filePath).then(function(entry) {
        overwrite = overwrite || true;
        if (entry && entry.isFile && overwrite) {
          saveFile(filePath, content, false);
        } else {
          saveFile(filePath, content, true);
        }
      }, function(err) {
        saveFile(filePath, content, true);
      });
    });
  }

  function saveTextFilePromise(filePath, content, overwrite) {
    console.log("Saving file: " + filePath);

    // Handling the UTF8 support for text files
    var UTF8_BOM = "\ufeff";

    if (content.indexOf(UTF8_BOM) === 0) {
      console.log("Content beging with a UTF8 bom");
    } else {
      content = UTF8_BOM + content;
    }

    return saveFilePromise(filePath, content, overwrite);
  }

  function saveBinaryFilePromise(filePath, content, overwrite) {
    console.log("Saving binary file: " + filePath);
    var buff = TSCORE.Utils.arrayBufferToBuffer(content);
    return saveFilePromise(filePath, buff, overwrite);
  }


  function deleteFilePromise(path) {
    
    if (TSCORE.PRO && TSCORE.Config.getUseTrashCan()) {
      return trash([path]);
    }

    return new Promise(function(resolve, reject) {
      fs.unlink(path, function(error) {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  function deleteDirectoryPromise(path) {

    if (TSCORE.PRO && TSCORE.Config.getUseTrashCan()) {
      return trash([path]);
    }

    return new Promise(function(resolve, reject) {
      fs.rmdir(path, function(error) {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }


  function selectDirectory() {
    if (document.getElementById('folderDialogNodeWebkit') === null) {
      $("body").append('<input style="display:none;" id="folderDialogNodeWebkit" type="file" nwdirectory />');
    }
    var chooser = $('#folderDialogNodeWebkit');
    chooser.on("change", function() {
      TSPOSTIO.selectDirectory($(this).val());
      $(this).off("change");
      $(this).val("");
    });
    chooser.trigger('click');
  }

  function selectFile() {
    if (document.getElementById('fileDialog') === null) {
      $("#folderLocation").after('<input style="display:none;" id="fileDialog" type="file" />');
    }
    var chooser = $('#fileDialog');
    chooser.change(function() {
      console.log("File selected: " + $(this).val());
    });
    chooser.trigger('click');
  }


  function openDirectory(dirPath) {
    // opens directory
    gui.Shell.openItem(dirPath);
  }

  function openFile(filePath) {
    // opens file with the native program
    gui.Shell.openItem(filePath);
  }

  // Platform specific calls
  exports.initMainMenu = initMainMenu;
  exports.showMainWindow = showMainWindow;

  // Platform API
  exports.handleStartParameters = handleStartParameters;
  exports.focusWindow = focusWindow;
  exports.checkNewVersion = checkNewVersion;

  exports.createDirectoryTree = createDirectoryTree;

  exports.listDirectoryPromise = listDirectoryPromise;

  exports.getPropertiesPromise = getPropertiesPromise;

  exports.loadTextFilePromise = loadTextFilePromise;
  exports.getFileContentPromise = getFileContentPromise;

  exports.saveFilePromise = saveFilePromise;
  exports.saveTextFilePromise = saveTextFilePromise;
  exports.saveBinaryFilePromise = saveBinaryFilePromise;

  exports.createDirectoryPromise = createDirectoryPromise;

  exports.copyFilePromise = copyFilePromise;
  exports.renameFilePromise = renameFilePromise;
  exports.renameDirectoryPromise = renameDirectoryPromise;

  exports.deleteFilePromise = deleteFilePromise;
  exports.deleteDirectoryPromise = deleteDirectoryPromise;

  exports.selectDirectory = selectDirectory;
  exports.selectFile = selectFile;

  exports.openDirectory = openDirectory;
  exports.openFile = openFile;
});
