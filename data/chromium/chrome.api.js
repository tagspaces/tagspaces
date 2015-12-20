/* Copyright (c) 2012-2015 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */
/* global define, isWin */

define(function(require, exports, module) {
  "use strict";

  console.log("Loading Lite chrome.api.js..");

  // chrome.browserAction.setBadgeBackgroundColor({ color: '#00ff00' });
  // chrome.browserAction.setBadgeText({text: '9999'});

  // changing the name of the app
  $("#logo").text("TagSpaces Lite");

  var TSCORE = require("tscore");
  var TSPOSTIO = require("tspostioapi");
  require("libs/filesaver.js/FileSaver");

  var dataBegin = "<script>addRow(";
  var dataEnd = ");</script>";
  var dataFile = '",0,"';
  var dataDir = '",1,"';


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

  function checkAccessFileURLAllowed() {
    chrome.extension.isAllowedFileSchemeAccess(function(isAllowedAccess) {
      if (!isAllowedAccess) {
        TSCORE.showAlertDialog($.i18n.t("ns.dialogs:accessFileURLNotAllowedAlert"));
      }
    });
  }

  function handleStartParameters() {
    var openFile = getURLParameter("openFile");
    if (openFile !== undefined && (openFile.length > 0)) { //  && openFile.indexOf("file://") === 0
      console.log("Opening file in browser: " + openFile);
      openFile = openFile.split("file://")[1];
      //var dirPath = TSCORE.TagUtils.extractContainingDirectoryPath(filePath);
      //TSCORE.IO.listDirectory(dirPath);
      TSCORE.FileOpener.openFileOnStartup(openFile);
    }
  }

  function focusWindow() {
    // Places the TagSpaces window on top of the windows
    window.focus();
  }

  function saveSettings(content) {
    /*chrome.storage.sync.set({'tagSpacesSettings': content}, function() {
        // Notify that we saved.
        message('Settings saved');
    });*/
  }

  function checkNewVersion() {
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
  }


  function createDirectoryTree(dirPath) {
    TSCORE.showAlertDialog("Creating directory not supported.");
    //var directoyTree = generateDirectoryTree(dirPath);
    //console.log(JSON.stringify(directoyTree));
    //TSPOSTIO.createDirectoryTree(directoyTree);
  }


  function listDirectoryPromise(dirPath) {
    //console.log("Listing directory: " + dirPath);
    return new Promise(function(resolve, reject) {
      var anotatedDirList = [];
      $.ajax({
          url: "file://" + dirPath,
          type: 'GET'
        })
        .done(function(data) {
          var folders = data.substring(data.indexOf(dataBegin) + dataBegin.length, data.lastIndexOf(dataEnd));
          folders = folders.split(dataBegin).join("");
          folders = folders.split(dataEnd);

          var name,
            path,
            isFile,
            fileSize,
            lastDateModified,
            fileProp;

          anotatedDirList = [];

          // sciping the first entry pointing to the parent directory
          for (var i = 1; i < folders.length; i++) {
            //console.log("Dir " + folders[i]);
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
          resolve(anotatedDirList);
        }).fail(function(error) {
          console.warn("Error listing files" + JSON.stringify(error));
          reject(error);
        });
    });
  }

  function getPropertiesPromise(filePath) {
    return new Promise(function(resolve, reject) {
      // TODO use listDirectory to get size and lmdt
      var fileProperties = {};
      fileProperties.path = filePath;
      fileProperties.size = 0;
      fileProperties.lmdt = 0;
      resolve(fileProperties);
    });
  }

  function loadTextFilePromise(filePath) {
    //
    return getFileContentPromise(filePath, "text");
  }

  function getFileContentPromise(fullPath, type) {
    console.log("getFileContentPromise: " + fullPath);
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
    console.log("Saving binary file: " + filePath);
    return new Promise(function(resolve, reject) {
      overwrite = overwrite || true;
      if (overwrite) {
        var blob = new Blob([content], {
          type: "text/plain;charset=utf-8"
        });
        saveAs(blob, TSCORE.TagUtils.extractFileName(filePath));
      }
      resolve();
    });
  }

  function createDirectoryPromise(dirPath) {
    return new Promise(function(res, rej) {
      TSCORE.showAlertDialog("Creating directory is not supported in Chrome, please use the desktop version.");
      res(true);
    });
  }

  function renameDirectoryPromise() {
    return new Promise(function(res, rej) {
      TSCORE.showAlertDialog("Renaming directory is not supported in Chrome, please use the desktop version.");
      res(true);
    });
  }

  function renameFilePromise() {
    return new Promise(function(res, rej) {
      TSCORE.showAlertDialog("Renaming file is not supported in Chrome, please use the desktop version.");
      res(true);
    });
  }

  function copyFilePromise() {
    return new Promise(function(res, rej) {
      TSCORE.showAlertDialog("Copy file is not supported in Chrome, please use the desktop version.");
      res(true);
    });
  }

  function deleteFilePromise() {
    return new Promise(function(res, rej) {
      TSCORE.showAlertDialog("Creating directory is not supported in Chrome, please use the desktop version.");
      res(true);
    });
  }

  function deleteDirectoryPromise() {
    return new Promise(function(res, rej) {
      TSCORE.showAlertDialog("Deleting directory is not supported in Chrome, please use the desktop version.");
      res(true);
    });
  }


  function selectDirectory() {
    console.log("Select directory!");
    var rootPath = "/";
    if (isWin) {
      rootPath = "C:";
    }
    TSCORE.showDirectoryBrowserDialog(rootPath);
  }

  function selectFile() {
    // TODO
    TSCORE.showAlertDialog("Select file not implemented!");
  }


  function openDirectory(dirPath) {
    // TODO
    TSCORE.showAlertDialog($.i18n.t("ns.dialogs:openContainingDirectoryAlert"));
  }

  function openFile(filePath) {
    // TODO
    TSCORE.showAlertDialog($.i18n.t("ns.dialogs:openFileNativelyAlert"));
  }

  // Platform specific calls
  exports.checkAccessFileURLAllowed = checkAccessFileURLAllowed;
  exports.saveSettings = saveSettings;

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
  exports.saveTextFilePromise = saveFilePromise;
  exports.saveBinaryFilePromise = saveFilePromise;

  exports.createDirectoryPromise = createDirectoryPromise;

  exports.copyFilePromise = copyFilePromise;
  exports.renameFilePromise = renameFilePromise;
  exports.renameDirectoryPromise = renameDirectoryPromise;

  exports.deleteFilePromise = deleteFilePromise;
  exports.deleteDirectoryPromise = deleteDirectoryPromise;

  exports.selectFile = selectFile;
  exports.selectDirectory = selectDirectory;

  exports.openDirectory = openDirectory;
  exports.openFile = openFile;
});
