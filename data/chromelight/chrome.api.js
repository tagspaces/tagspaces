/* Copyright (c) 2012-2015 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */
/* global define, nativeIO, isWin */

define(function(require, exports, module) {
  "use strict";

  // Activating browser specific exports modul
  console.log("Loading light chrome.api.js..");

  // changing the name of the app
  $("#logo").text("TagSpaces Light");

  var TSCORE = require("tscore");

  var TSPOSTIO = require("tspostioapi");

  require("libs/filesaver.js/FileSaver");

  var dataBegin = "<script>addRow(";
  var dataEnd = ");</script>";
  var dataFile = '",0,"';
  var dataDir = '",1,"';

  // chrome.browserAction.setBadgeBackgroundColor({ color: '#00ff00' });
  // chrome.browserAction.setBadgeText({text: '9999'});

  var handleStartParameters = function() {
    var openFile = getURLParameter("openFile");
    if (openFile !== undefined && (openFile.length > 0)) { //  && openFile.indexOf("file://") === 0
      console.log("Opening file in browser: " + openFile);
      openFile = openFile.split("file://")[1];
      //var dirPath = TSCORE.TagUtils.extractContainingDirectoryPath(filePath);
      //TSCORE.IO.listDirectory(dirPath);
      TSCORE.FileOpener.openFileOnStartup(openFile);
    }
  };

  function getURLParameter(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split("=");
      if (pair[0] == variable) {
        return pair[1];
      }
    }
    return (false);
  }

  function scanDirectory(dirPath, index) {
    /*        $.ajax({
                url: "file://"+dirPath,
                type: 'GET'
            })
            .done(function(data) {
                //console.log("Dir List "+data);
                var folders = data.substring(data.indexOf(dataBegin)+dataBegin.length,data.lastIndexOf(dataEnd));
                folders = folders.split(dataBegin).join("");
                folders = folders.split(dataEnd);

                var name,
                    path,
                    isFile,
                    fileSize,
                    lastDateModified,
                    fileProp;

                // sciping the first entry pointing to the parent directory
                for (var i=1; i < folders.length; i++) {
                    console.log("Dir Req "+folders[i]);
                    name = folders[i].substring(2,folders[i].indexOf('","'));
                    path = dirPath+TSCORE.dirSeparator+name;
                    isFile = (folders[i].indexOf(dataFile) > 1);
                    fileSize = 0;
                    lastDateModified = 0;
                    if(isFile) {
                        fileProp = folders[i].substring(folders[i].indexOf(dataFile)+dataFile.length+1,folders[i].length-1);
                        fileProp = fileProp.split('","');
                        fileSize = fileProp[0];
                        lastDateModified = fileProp[1];
                    }
                    index.push({
                        "name": name,
                        "isFile": isFile,
                        "size": fileSize,
                        "lmdt": lastDateModified,
                        "path": path
                    });
                    if (!isFile) {
                        scanDirectory(path, index);
                    }
                }
                return index;
            })
            .fail(function(data) {
                TSPOSTIO.errorOpeningPath(dirPath);
                console.log("Error opening path "+data);
            });*/
  }

  function generateDirectoryTree(dirPath) {

  }

  var checkNewVersion = function() {
    console.log("Checking for new version...");
    var cVer = TSCORE.Config.DefaultSettings.appVersion + "." + TSCORE.Config.DefaultSettings.appBuild;
    $.ajax({
        url: 'http://tagspaces.org/releases/version.json?cVer=' + cVer,
        type: 'GET'
      })
      .done(function(data) {
        TSPOSTIO.checkNewVersion(data);
      })
      .fail(function(data) {
        console.log("AJAX failed " + data);
      });
  };

  var loadTextFile = function(filePath) {
    console.log("Loading file: " + filePath);
    $.ajax({
        url: "file://" + filePath,
        type: 'POST'
      })
      .done(function(data) {
        TSPOSTIO.loadTextFile(data);
      })
      .fail(function(data) {
        console.log("AJAX failed " + data);
      });
  };

  var listDirectory = function(dirPath) {
    console.log("Listing directory: " + dirPath);
    TSCORE.showLoadingAnimation();

    $.ajax({
        url: "file://" + dirPath,
        type: 'GET'
      })
      .done(function(data) {
        //console.log("Dir List "+data);
        var folders = data.substring(data.indexOf(dataBegin) + dataBegin.length, data.lastIndexOf(dataEnd));
        folders = folders.split(dataBegin).join("");
        folders = folders.split(dataEnd);

        var name,
          path,
          isFile,
          fileSize,
          lastDateModified,
          fileProp;

        var anotatedDirList = [];
        // sciping the first entry pointing to the parent directory
        for (var i = 1; i < folders.length; i++) {
          console.log("Dir " + folders[i]);
          name = folders[i].substring(2, folders[i].indexOf('","'));
          path = dirPath + TSCORE.dirSeparator + name;
          isFile = (folders[i].indexOf(dataFile) > 1);
          fileSize = 0;
          lastDateModified = 0;
          if (isFile) {
            fileProp = folders[i].substring(folders[i].indexOf(dataFile) + dataFile.length + 1, folders[i].length - 1);
            fileProp = fileProp.split('","');
            fileSize = fileProp[0];
            lastDateModified = fileProp[1];
          }
          anotatedDirList.push({
            "name": name,
            "isFile": isFile,
            "size": fileSize,
            "lmdt": lastDateModified,
            "path": path
          });
        }
        TSPOSTIO.listDirectory(anotatedDirList);
      })
      .fail(function(data) {
        TSPOSTIO.errorOpeningPath(dirPath);
        console.log("Error opening path " + data);
      });
  };

  var listSubDirectories = function(dirPath) {
    console.log("Listing sub directories: " + dirPath);
    TSCORE.showLoadingAnimation();

    $.ajax({
        url: "file://" + dirPath,
        type: 'GET'
      })
      .done(function(data) {
        //console.log("Dir List "+data);
        var folders = data.substring(data.indexOf(dataBegin) + dataBegin.length, data.lastIndexOf(dataEnd));
        folders = folders.split(dataBegin).join("");
        folders = folders.split(dataEnd);

        var name,
          path,
          isDir;

        var anotatedDirList = [];
        // skiping the first entry pointing to the parent directory
        for (var i = 1; i < folders.length; i++) {
          console.log("Dir " + folders[i]);
          name = folders[i].substring(2, folders[i].indexOf('","'));
          if (dirPath === TSCORE.dirSeparator) {
            path = dirPath + name;
          } else {
            path = dirPath + TSCORE.dirSeparator + name;
          }
          isDir = (folders[i].indexOf(dataDir) > 1);
          if (isDir) {
            anotatedDirList.push({
              "name": name,
              "path": path
            });
          }
        }
        TSPOSTIO.listSubDirectories(anotatedDirList, dirPath);
      })
      .fail(function(data) {
        TSPOSTIO.errorOpeningPath(dirPath);
        console.log("Error opening path " + data);
      });

  };

  var deleteElement = function(path) {
    TSCORE.showAlertDialog("Deleting files is not supported in TagSpaces Light, please use the desktop version.");
  };

  var deleteDirectory = function(dirPath) {
    TSCORE.showAlertDialog("Deleting directory is not supported in TagSpaces Light, please use the desktop version.");
  };

  var createDirectoryIndex = function(dirPath) {
    console.log("Creating index for directory: " + dirPath);
    TSCORE.showLoadingAnimation();
    var directoryIndex = [];
    directoryIndex = scanDirectory(dirPath, directoryIndex);
    console.log(JSON.stringify(directoryIndex));
    TSPOSTIO.createDirectoryIndex(directoryIndex);
  };

  var createDirectoryTree = function(dirPath) {
    TSCORE.showLoadingAnimation();
    console.log("Creating directory index for: " + dirPath);
    var directoyTree = generateDirectoryTree(dirPath);
    //console.log(JSON.stringify(directoyTree));
    TSPOSTIO.createDirectoryTree(directoyTree);
  };

  var saveTextFile = function(filePath, content) {
    TSCORE.showLoadingAnimation();
    console.log("Saving file: " + filePath);

    var blob = new Blob([content], {
      type: "text/plain;charset=utf-8"
    });
    saveAs(blob, TSCORE.TagUtils.extractFileName(filePath));
    // TODO close file after save

    //TSPOSTIO.saveTextFile(filePath);

  };

  var saveBinaryFile = function(filePath, content) {
    TSCORE.showLoadingAnimation();
    console.log("Saving binary file: " + filePath);

    var blob = new Blob([content], {
      type: "text/plain;charset=utf-8"
    });
    saveAs(blob, TSCORE.TagUtils.extractFileName(filePath));
    // TODO close file after save

    //TSPOSTIO.saveTextFile(filePath);

  };

  var createDirectory = function(dirPath) {
    TSCORE.showAlertDialog("Creating directory is not supported in TagSpaces Light, please use the desktop version.");
  };

  var renameDirectory = function(filePath, newFilePath) {
    TSCORE.showAlertDialog("Renaming directory is not supported in TagSpaces Light, please use the desktop version.");
  };

  var renameFile = function(filePath, newFilePath) {
    TSCORE.showAlertDialog("Tagging/Renaming files is not supported in TagSpaces Light, please use the desktop version.");
  };

  var copyFile = function(filePath, newFilePath) {
    TSCORE.showAlertDialog("Copy files is not supported in TagSpaces Light, please use the desktop version.");
  };

  var selectDirectory = function() {
    console.log("Select directory!");
    var rootPath = "/";
    if (isWin) {
      rootPath = "C:";
    }
    TSCORE.showDirectoryBrowserDialog(rootPath);
  };

  var selectFile = function() {
    console.log("Select file not implemented!");
  };

  var checkAccessFileURLAllowed = function() {
    chrome.extension.isAllowedFileSchemeAccess(function(isAllowedAccess) {
      if (!isAllowedAccess) {
        TSCORE.showAlertDialog($.i18n.t("ns.dialogs:accessFileURLNotAllowedAlert"));
      }
    });
  };

  var openDirectory = function(dirPath) {
    TSCORE.showAlertDialog($.i18n.t("ns.dialogs:openContainingDirectoryAlert"));
  };

  var openFile = function(filePath) {
    TSCORE.showAlertDialog($.i18n.t("ns.dialogs:openFileNativelyAlert"));
  };

  var openExtensionsDirectory = function() {
    TSCORE.showAlertDialog("Open extensions directory functionality not implemented on chrome yet!");
  };

  var getFileProperties = function(filePath) {
    var fileProperties = {};
    fileProperties.path = filePath;
    fileProperties.size = 0; // TODO use listDirectory to get size and lmdt
    fileProperties.lmdt = 0;
    TSPOSTIO.getFileProperties(fileProperties);
  };

  var saveSettings = function(content) {
    /*chrome.storage.sync.set({'tagSpacesSettings': content}, function() {
        // Notify that we saved.
        message('Settings saved');
    });*/
  };

  // Bring the TagSpaces window on top of the windows
  var focusWindow = function() {
    window.focus();
  };

  exports.focusWindow = focusWindow;
  exports.createDirectory = createDirectory;
  exports.copyFile = copyFile;
  exports.renameFile = renameFile;
  exports.renameDirectory = renameDirectory;
  exports.loadTextFile = loadTextFile;
  exports.saveTextFile = saveTextFile;
  exports.saveBinaryFile = saveBinaryFile;
  exports.listDirectory = listDirectory;
  exports.listSubDirectories = listSubDirectories;
  exports.deleteElement = deleteElement;
  exports.deleteDirectory = deleteDirectory;
  exports.createDirectoryIndex = createDirectoryIndex;
  exports.createDirectoryTree = createDirectoryTree;
  exports.selectDirectory = selectDirectory;
  exports.openDirectory = openDirectory;
  exports.openFile = openFile;
  exports.selectFile = selectFile;
  exports.openExtensionsDirectory = openExtensionsDirectory;
  exports.checkAccessFileURLAllowed = checkAccessFileURLAllowed;
  exports.checkNewVersion = checkNewVersion;
  exports.getFileProperties = getFileProperties;
  exports.saveSettings = saveSettings;
  exports.handleStartParameters = handleStartParameters;

});
