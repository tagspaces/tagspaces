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

  // Bring the TagSpaces window on top of the windows
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

  function createDirectoryIndex(dirPath) {
    TSCORE.showWaitingDialog($.i18n.t("ns.common:waitDialogDiectoryIndexing"));

    var directoryIndex = [];
    TSCORE.Utils.walkDirectory(dirPath, {recursive: true}, function(fileEntry) {
      directoryIndex.push(fileEntry);
    }).then(
      function(entries) {
        TSPOSTIO.createDirectoryIndex(directoryIndex);
      },
      function(err) {
        console.warn("Error creating index: " + err);
      }
    ).catch(function() {
      TSCORE.hideWaitingDialog();
    });

  }


  function listDirectory(dirPath, readyCallback) {
    listDirectoryPromise(dirPath).then(
      function(entries) {
        if (readyCallback) {
          readyCallback(entries);
        }
        TSPOSTIO.listDirectory(entries);
        console.log("Listing: " + dirPath + " done!");
      },
      function(err) {
        if (readyCallback) {
          readyCallback([]);
        } else {
          TSPOSTIO.errorOpeningPath();
        }
        console.log("Error listing directory" + err);
      }
    );
  }

  function listDirectoryPromise(path) {
    return new Promise(function(resolve, reject) {
      var statEntriesPromises = [];
      fs.readdir(path, function(error, entries) {
        if (error) {
          console.log("Error listing directory " + path);
          resolve(statEntriesPromises);
        } else {
          if (entries) {
            entries.forEach(function(entry) {
              statEntriesPromises.push(getPropertiesPromise(path + TSCORE.dirSeparator + entry));
            });
          }
          Promise.all(statEntriesPromises).then(function(enhancedEntries) {
            resolve(enhancedEntries);
          }, function(err) {
            resolve(statEntriesPromises);
            //reject("At least one get file properties failed.");
          });
        }
      });
    });
  }

  /** @deprecated */
  function getDirectoryMetaInformation(dirPath, readyCallback) {
    listDirectory(dirPath, function(anotatedDirList) {
      TSCORE.metaFileList = anotatedDirList;
      readyCallback(anotatedDirList);
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
        } else {
          resolve(false);
        }
      });
    });
  }

  /** @deprecated */
  function getFileProperties(filePath) {
    getPropertiesPromise(filePath).then(function(fileProperties) {
      if (fileProperties) {
        TSPOSTIO.getFileProperties(fileProperties);
      }
    }).catch(function(error) {
      TSCORE.hideLoadingAnimation();
      TSCORE.showAlertDialog("Error getting properties for " + filePath);
    });
  }

  /**
   * Create a directory
   * @name createDirectoryPromise
   * @method
   * @private
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

  /** @deprecated */
  function createDirectory(dirPath, silentMode) {
    createDirectoryPromise(dirPath).then(function() {
      if (!silentMode) {
        TSPOSTIO.createDirectory(dirPath);
      }
    }, function(error) {
      TSCORE.hideLoadingAnimation();
      console.error("Creating directory " + dirPath + " failed");
      if (!silentMode) {
        TSCORE.showAlertDialog("Creating " + dirPath + " failed.");
      }
    });
  }

  /** @deprecated */
  function createMetaFolder(dirPath) {
    if (dirPath.lastIndexOf(TSCORE.metaFolder) >= dirPath.length - TSCORE.metaFolder.length) {
      console.log("Can not create meta folder in a meta folder");
      return;
    }
    var metaDirPath = dirPath + TSCORE.dirSeparator + TSCORE.metaFolder;

    fs.stat(metaDirPath, function(error, stats) {
      if (error) {
        console.log("Getting fstats failed");
      }
      if (stats && stats.isDirectory()) {
        console.log("Directory already exists ");
        return;
      }
      createDirectory(metaDirPath, true);
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

  /** @deprecated */
  function copyFile(sourceFilePath, targetFilePath) {
    console.log("Copy file: " + sourceFilePath + " to " + targetFilePath);
    copyFilePromise(sourceFilePath, targetFilePath).then(function(success) {
      TSCORE.hideWaitingDialog();
      TSPOSTIO.copyFile(sourceFilePath, targetFilePath);
    }, function(err) {
      TSCORE.hideWaitingDialog();
      TSCORE.showAlertDialog(err);
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
        resolve(true);
      });
    });
  }

  /** @deprecated */
  function renameFile(filePath, newFilePath) {
    renameFilePromise(filePath, newFilePath).then(function(success) {
      TSCORE.hideWaitingDialog();
      TSPOSTIO.renameFile(filePath, newFilePath);
    }, function(err) {
      TSCORE.hideWaitingDialog();
      TSCORE.showAlertDialog(err);
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

  /** @deprecated */
  function renameDirectory(dirPath, newDirName) {
    alert("Not implemented");
    /*var newDirPath = TSCORE.TagUtils.extractParentDirectoryPath(dirPath) + TSCORE.dirSeparator + newDirName;
    renameDirectoryPromise(dirPath, newDirPath).then(function() {
      TSCORE.hideWaitingDialog();
      TSPOSTIO.renameDirectory(dirPath, newDirPath);
    }, function(err) {
      TSCORE.hideWaitingDialog();
      TSCORE.showAlertDialog(err);
    });*/
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

  /** @deprecated */
  function loadTextFile(filePath, isPreview) {
    console.log("Loading file: " + filePath);
    loadTextFilePromise(filePath, isPreview).then(function(content) {
        TSPOSTIO.loadTextFile(content);
      },
      function(error) {
        TSCORE.hideLoadingAnimation();
        console.error("Loading file " + filePath + " failed " + error);
        TSCORE.showAlertDialog("Loading " + filePath + " failed.");
      }
    );
  }

  function getFile(fileURL, result, error) {
    getFileContentPromise(fullPath).then(function(content) {
      result(new File([content], fileURL, {}));
    }, error);
  }

  /** @deprecated */
  function getFileContent(fullPath, result, error) {

    getFileContentPromise(fullPath).then(result, error);
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
    return saveFilePromise(filePath, content, overwrite);
  }

  /** @deprecated */
  function saveTextFile(filePath, content, overwrite, silentMode) {
    console.log("Saving file: " + filePath);

    // Handling the UTF8 support for text files
    var UTF8_BOM = "\ufeff";

    if (content.indexOf(UTF8_BOM) === 0) {
      console.log("Content beging with a UTF8 bom");
    } else {
      content = UTF8_BOM + content;
    }

    var isNewFile = !fs.existsSync(filePath);

    saveFilePromise(filePath, content, overwrite).then(function() {
      if (!silentMode) {
        TSPOSTIO.saveTextFile(filePath, isNewFile);
      }
    }, function(error) {
      TSCORE.hideLoadingAnimation();
      console.error("Save to file " + filePath + " failed " + error);
      if (!silentMode) {
        TSCORE.showAlertDialog("Saving " + filePath + " failed.");
      }
    });
  }

  /** @deprecated */
  function saveBinaryFile(filePath, content, overwrite, silentMode) {
    console.log("Saving binary file: " + filePath);
    var buff = TSCORE.Utils.arrayBufferToBuffer(content);
    saveFilePromise(filePath, buff, overwrite).then(function() {
      if (!silentMode) {
        TSPOSTIO.saveBinaryFile(filePath);
      }
    }, function(error) {
      TSCORE.hideLoadingAnimation();
      console.error("Save to file " + filePath + " failed " + error);
      if (!silentMode) {
        TSCORE.showAlertDialog("Saving " + filePath + " failed.");
      }
    });
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

  /** @deprecated */
  function deleteElement(path) {

    deleteFilePromise(path).then(function() {
        TSPOSTIO.deleteElement(path);
      },
      function(error) {
        TSCORE.hideLoadingAnimation();
        TSCORE.showAlertDialog("Deleting file " + path + " failed.");
        console.error("Deleting file " + path + " failed " + error);
      }
    );
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

  /** @deprecated */
  function deleteDirectory(path) {
    //if (TSCORE.PRO && TSCORE.Config.getUseTrashCan()) {
    //  return trash([path]);
    //}

    deleteDirectoryPromise(path).then(function() {
        TSPOSTIO.deleteDirectory(path);
      },
      function(error) {
        TSCORE.hideLoadingAnimation();
        console.error("Deleting directory " + path + " failed " + error);
        TSPOSTIO.deleteDirectoryFailed(path);
      }
    );
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

  exports.createDirectoryIndex = createDirectoryIndex;
  exports.createDirectoryTree = createDirectoryTree;

  exports.listDirectoryPromise = listDirectoryPromise;
  exports.listDirectory = listDirectory; /** @deprecated */
  exports.getDirectoryMetaInformation = getDirectoryMetaInformation;

  exports.getPropertiesPromise = getPropertiesPromise;
  exports.getFileProperties = getFileProperties; /** @deprecated */

  exports.loadTextFilePromise = loadTextFilePromise;
  exports.loadTextFile = loadTextFile;
  exports.getFile = getFile;
  exports.getFileContent = getFileContent; /** @deprecated */
  exports.getFileContentPromise = getFileContentPromise;

  exports.saveFilePromise = saveFilePromise;
  exports.saveTextFilePromise = saveTextFilePromise;
  exports.saveBinaryFilePromise = saveBinaryFilePromise;
  exports.saveTextFile = saveTextFile; /** @deprecated */
  exports.saveBinaryFile = saveBinaryFile; /** @deprecated */

  exports.createDirectoryPromise = createDirectoryPromise;
  exports.createDirectory = createDirectory; /** @deprecated */
  exports.createMetaFolder = createMetaFolder; /** @deprecated */

  exports.copyFilePromise = copyFilePromise;
  exports.copyFile = copyFile; /** @deprecated */

  exports.renameFilePromise = renameFilePromise;
  exports.renameFile = renameFile; /** @deprecated */

  exports.renameDirectoryPromise = renameDirectoryPromise;
  exports.renameDirectory = renameDirectory; /** @deprecated */

  exports.deleteFilePromise = deleteFilePromise;
  exports.deleteElement = deleteElement; /** @deprecated */

  exports.deleteDirectoryPromise = deleteDirectoryPromise;
  exports.deleteDirectory = deleteDirectory; /** @deprecated */

  exports.selectDirectory = selectDirectory;
  exports.selectFile = selectFile;

  exports.openDirectory = openDirectory;
  exports.openFile = openFile;

});
