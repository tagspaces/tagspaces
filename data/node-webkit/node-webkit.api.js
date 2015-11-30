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

  // Activating browser specific exports modul
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

  var rootMenu = new gui.Menu({
    type: 'menubar'
  });
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

  var handleTray = function() {
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
  };

  var handleStartParameters = function() {
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
  };

  var initMainMenu = function() {
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
  };

  function generateDirectoryTree(dirPath) {
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
      //TSCORE.showAlertDialog("Generating folder tree for " + dirPath + " failed.");
    }
  }

  var createDirectoryIndex = function(dirPath) {
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

  };

  var createDirectoryTree = function(dirPath) {
    console.log("Creating directory index for: " + dirPath);
    TSCORE.showWaitingDialog($.i18n.t("ns.common:waitDialogDiectoryIndexing"));

    var directoyTree = generateDirectoryTree(dirPath);
    //console.log(JSON.stringify(directoyTree));
    TSPOSTIO.createDirectoryTree(directoyTree);
  };

  var createDirectory = function(dirPath, silentMode) {
    console.log("Creating directory: " + dirPath);
    fs.mkdir(dirPath, function(error) {
      if (error) {
        TSCORE.hideLoadingAnimation();
        console.error("Creating directory " + dirPath + " failed " + error);
        TSCORE.showAlertDialog("Creating " + dirPath + " failed.");
        return;
      }
      if (silentMode !== true) {
        TSPOSTIO.createDirectory(dirPath);
      }
    });
  };

  var createMetaFolder = function(dirPath) {
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
  };

  var copyFile = function(sourceFilePath, targetFilePath) {
    console.log("Copy file: " + sourceFilePath + " to " + targetFilePath);

    if (sourceFilePath.toLowerCase() === targetFilePath.toLowerCase()) {
      TSCORE.hideWaitingDialog();
      TSCORE.showAlertDialog($.i18n.t("ns.common:fileTheSame"), $.i18n.t("ns.common:fileNotCopyied"));
      return false;
    }
    if (fs.lstatSync(sourceFilePath).isDirectory()) {
      TSCORE.hideWaitingDialog();
      TSCORE.showAlertDialog($.i18n.t("ns.common:fileIsDirectory", {fileName:sourceFilePath}));
      return false;
    }
    if (fs.existsSync(targetFilePath)) {
      TSCORE.hideWaitingDialog();
      TSCORE.showAlertDialog($.i18n.t("ns.common:fileExists", {fileName:targetFilePath}),  $.i18n.t("ns.common:fileRenameFailed"));
      return false;
    }

    var rd = fs.createReadStream(sourceFilePath);
    rd.on("error", function(err) {
      TSCORE.hideWaitingDialog();
      TSCORE.showAlertDialog($.i18n.t("ns.common:fileCopyFailed", {fileName:sourceFilePath}));
    });
    var wr = fs.createWriteStream(targetFilePath);
    wr.on("error", function(err) {
      TSCORE.hideWaitingDialog();
      TSCORE.showAlertDialog($.i18n.t("ns.common:fileCopyFailed", {fileName:sourceFilePath}));
    });
    wr.on("close", function(ex) {
      TSPOSTIO.copyFile(sourceFilePath, targetFilePath);
    });
    rd.pipe(wr);
  };

  var renameFile = function(filePath, newFilePath) {
    console.log("Renaming file: " + filePath + " to " + newFilePath);

    if (filePath === newFilePath) {
      TSCORE.hideWaitingDialog();
      TSCORE.showAlertDialog($.i18n.t("ns.common:fileTheSame"), $.i18n.t("ns.common:fileNotMoved"));
      return false;
    }
    if (fs.lstatSync(filePath).isDirectory()) {
      TSCORE.hideWaitingDialog();
      TSCORE.showAlertDialog($.i18n.t("ns.common:fileIsDirectory", {fileName:filePath}));
      return false;
    }
    if (fs.existsSync(newFilePath)) {
      TSCORE.hideWaitingDialog();
      TSCORE.showAlertDialog($.i18n.t("ns.common:fileExists", {fileName:newFilePath}), $.i18n.t("ns.common:fileRenameFailed"));
      return false;
    }
    fs.move(filePath, newFilePath, function(error) {
      if (error) {
        TSCORE.hideWaitingDialog();
        //TSCORE.showAlertDialog($.i18n.t("ns.common:fileRenameFailedDiffPartition", {fileName:filePath}));
        TSCORE.showAlertDialog("Renaming: " + filePath + " failed.");
        return;
      }
      TSPOSTIO.renameFile(filePath, newFilePath);
    });
  };

  var renameDirectory = function(dirPath, newDirName) {
    var newDirPath = TSCORE.TagUtils.extractParentDirectoryPath(dirPath) + TSCORE.dirSeparator + newDirName;
    console.log("Renaming file: " + dirPath + " to " + newDirPath);

    // TODO check if file opened for editing in the same directory as source dir

    if (dirPath === newDirPath) {
      TSCORE.hideWaitingDialog();
      TSCORE.showAlertDialog($.i18n.t("ns.common:directoryTheSame"), $.i18n.t("ns.common:directoryNotMoved"));
      return false;
    }
    if (fs.existsSync(newDirPath)) {
      TSCORE.hideWaitingDialog();
      TSCORE.showAlertDialog($.i18n.t("ns.common:directoryExists", {dirName:newDirPath}), $.i18n.t("ns.common:directoryRenameFailed"));
      return false;
    }
    var dirStatus = fs.lstatSync(dirPath);
    if (dirStatus.isDirectory) {
      fs.rename(dirPath, newDirPath, function(error) {
        if (error) {
          TSCORE.hideLoadingAnimation();
          console.error("Renaming directory failed " + error);
          TSCORE.showAlertDialog("Renaming " + dirPath + " failed.");
          return;
        }
        TSPOSTIO.renameDirectory(dirPath, newDirPath);
      });
    } else {
      TSCORE.hideWaitingDialog();
      TSCORE.showAlertDialog($.i18n.t("ns.common:pathIsNotDirectory", {dirName:dirPath}), $.i18n.t("ns.common:directoryRenameFailed"));
      return false;
    }
  };

  var loadTextFilePromise = function(filePath, isPreview) {
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
  };

  var loadTextStreamPromise = function(filePath, isPreview) {
//    console.log("Loading text stream for: " + filePath);
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
            reject(error)
          } else {
            resolve(content);
          }
        });
      }
    });
  };

  var loadTextFile = function(filePath, isPreview) {
    console.log("Loading file: " + filePath);
    loadTextFilePromise(filePath, isPreview).then(function(content) {
        TSPOSTIO.loadTextFile(content);
      }, 
      function(error) {
        TSCORE.hideLoadingAnimation();
        console.error("Loading file " + filePath + " failed " + error);
        TSCORE.showAlertDialog("Lading " + filePath + " failed.");
      }
    );
  };

  function saveFilePromise(filePath, content) {
    return new Promise(function(resolve,reject) {
      fs.writeFile(filePath, content, 'utf8', function(error) {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }

  var saveTextFile = function(filePath, content, overWrite, silentMode) {
    console.log("Saving file: " + filePath);

    /** TODO check if fileExist by saving needed
    if(overWrite) {
        // Current implementation
    } else {
        if (!pathUtils.existsSync(filePath)) {
           // Current implementation
        }
    }
    */

    // Handling the UTF8 support for text files
    var UTF8_BOM = "\ufeff";

    if (content.indexOf(UTF8_BOM) === 0) {
      console.log("Content beging with a UTF8 bom");
    } else {
      content = UTF8_BOM + content;
    }

    var isNewFile = !fs.existsSync(filePath);

    saveFilePromise(filePath, content).then(function() {
        if (!silentMode) {
          TSPOSTIO.saveTextFile(filePath, isNewFile);
        }
      }, 
      function(error) {
        TSCORE.hideLoadingAnimation();
        console.error("Save to file " + filePath + " failed " + error);
        TSCORE.showAlertDialog("Saving " + filePath + " failed.");
      }
    );
  };

  var saveBinaryFile = function(filePath, content, overWrite, silentMode) {
    console.log("Saving binary file: " + filePath);
    if (!fs.existsSync(filePath) || overWrite === true) {
        var buff = TSCORE.Utils.arrayBufferToBuffer(content);
        saveFilePromise(filePath, buff).then(function() {
          if (!silentMode) {
            TSPOSTIO.saveBinaryFile(filePath);
          }
        }, 
        function(error) {
          TSCORE.hideLoadingAnimation();
          console.error("Save to file " + filePath + " failed " + error);
          TSCORE.showAlertDialog("Saving " + filePath + " failed.");
        }
      );
    } else {
      TSCORE.showAlertDialog($.i18n.t("ns.common:fileExists", {fileName: filePath}));
    }
  };

  var getDirectoryMetaInformation = function(dirPath, readyCallback) {
    listDirectory(dirPath, function(anotatedDirList) {
      TSCORE.metaFileList = anotatedDirList;
      readyCallback(anotatedDirList);
    });
  };

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

    return new Promise(function(resolve,reject) {
      fs.rmdir(path, function(error) {
        if (error) {
         reject(error);
        } else {
          resolve();
        }  
      });
    });
  }

  var deleteElement = function(path) {
    deleteFilePromise(path).then(function() {
        TSPOSTIO.deleteElement(path); 
      }, 
      function(error) {
        TSCORE.hideLoadingAnimation();
        TSCORE.showAlertDialog("Deleting file " + path + " failed.");
        console.error("Deleting file " + path + " failed " + error);
      }
    );
  };

  var deleteDirectory = function(path) {
    deleteDirectoryPromise(path).then(function(){
        TSPOSTIO.deleteDirectory(path);
      },  
      function(error) {
        TSCORE.hideLoadingAnimation();
        console.error("Deleting directory " + path + " failed " + error);
        TSPOSTIO.deleteDirectoryFailed(path);
      }
    );
  };

  var checkAccessFileURLAllowed = function() {
    console.log("checkAccessFileURLAllowed function not relevant for node..");
  };

  var checkNewVersion = function() {
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
  };

  var selectDirectory = function() {
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
  };

  var openDirectory = function(dirPath) {
    gui.Shell.openItem(dirPath);
  };

  var openFile = function(filePath) {
    gui.Shell.openItem(filePath);
  };

  // Bring the TagSpaces window on top of the windows
  var focusWindow = function() {
    gui.Window.get().focus();
  };

  var selectFile = function() {
    if (document.getElementById('fileDialog') === null) {
      $("#folderLocation").after('<input style="display:none;" id="fileDialog" type="file" />');
    }
    var chooser = $('#fileDialog');
    chooser.change(function() {
      console.log("File selected: " + $(this).val());
    });
    chooser.trigger('click');
  };

  var watchDirecotory = function(dirPath, listener) {
    if (fsWatcher) {
      fsWatcher.close();
    }
    fsWatcher = fs.watch(dirPath, {persistent: true, recursive: false}, listener);
  };

  function getFile(fileURL, result, error) {
    getFileContentPromise(fullPath).then(function(content) {
      result(new File([content], fileURL, {}));
    }, error);
  }

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

  /*
    stats for file:
    "dev":41,
    "mode":33204,
    "nlink":1,
    "uid":1000,
    "gid":1000,
    "rdev":0,
    "blksize":4096,
    "ino":2634172,
    "size":230,
    "blocks":24,
    "atime":"2015-11-24T09:56:41.932Z",
    "mtime":"2015-11-23T14:29:29.689Z",
    "ctime":"2015-11-23T14:29:29.689Z",
    "birthtime":"2015-11-23T14:29:29.689Z",
    "isFile":true,
    "path":"/home/somefile.txt"
  */
  var getPropertiesPromise = function(path) {
    return new Promise(function(resolve, reject) {
      fs.lstat(path, function(err, stats) {
        if (err) {
          resolve(false);
        }
        if (stats) {
          var entry = {}
          entry.name = path.substring(path.lastIndexOf(TSCORE.dirSeparator)+1, path.length);
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
  };

  var getFileProperties = function(filePath) {
    console.log("getFileProperties: " + filePath);
    getPropertiesPromise(filePath).then(function(fileProperties) {
      if (fileProperties) {
        TSPOSTIO.getFileProperties(fileProperties);
      }
    }).catch(function(error) {
      TSCORE.hideLoadingAnimation();
      TSCORE.showAlertDialog("Error getting properties for " + filePath);
    });
  };

  var listDirectory = function(dirPath, readyCallback) {
    //walkDirectory(dirPath).then(
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
  };

  function listDirectoryPromise(path){
    var statEntriesPromises = [];

    return new Promise(function(resolve, reject) {
      fs.readdir(path, function(error, entries) {
        if (error) {
          console.log("Error listing directory " + path);
          resolve(statEntriesPromises);
        } else {
          if(entries) {
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

  exports.createDirectory = createDirectory;
  exports.createMetaFolder = createMetaFolder;
  exports.renameDirectory = renameDirectory;
  exports.renameFile = renameFile;
  exports.copyFile = copyFile;
  exports.loadTextFile = loadTextFile;
  exports.loadTextFilePromise = loadTextFilePromise;
  exports.saveTextFile = saveTextFile;
  exports.saveBinaryFile = saveBinaryFile;
  exports.listDirectory = listDirectory;
  exports.deleteElement = deleteElement;
  exports.deleteDirectory = deleteDirectory;
  exports.createDirectoryIndex = createDirectoryIndex;
  exports.createDirectoryTree = createDirectoryTree;
  exports.selectDirectory = selectDirectory;
  exports.openDirectory = openDirectory;
  exports.openFile = openFile;
  exports.selectFile = selectFile;
  exports.checkAccessFileURLAllowed = checkAccessFileURLAllowed;
  exports.checkNewVersion = checkNewVersion;
  exports.getFileProperties = getFileProperties;
  exports.initMainMenu = initMainMenu;
  exports.handleStartParameters = handleStartParameters;
  exports.handleTray = handleTray;
  exports.focusWindow = focusWindow;
  exports.showMainWindow = showMainWindow;
  exports.getPropertiesPromise = getPropertiesPromise;
  exports.getFile = getFile;
  exports.getFileContent = getFileContent;
  exports.getDirectoryMetaInformation = getDirectoryMetaInformation;
  exports.getFileContentPromise = getFileContentPromise;
  exports.listDirectoryPromise = listDirectoryPromise;
});
