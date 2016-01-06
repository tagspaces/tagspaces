/* Copyright (c) 2012-2015 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */
/* global define, isWin */

/**
 * A implementation of the IOAPI for the Chrome/Chromium extensions platform
 * @class ChromeExtension
 * @memberof IOAPI
 */
define(function(require, exports, module) {
  "use strict";

  console.log("Loading Lite chrome.api.js..");

  // chrome.browserAction.setBadgeBackgroundColor({ color: '#00ff00' });
  // chrome.browserAction.setBadgeText({text: '9999'});

  // changing the name of the app
  $("#logo").text("TagSpaces Lite");

  var TSCORE = require("tscore");
  var TSPOSTIO = require("tspostioapi");
  var saveAs = require("libs/filesaver.js/FileSaver.min");

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

  /**
   * Checks if new version is available
   * @name checkNewVersion
   * @method
   * @memberof IOAPI.ChromeExtension
   */
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

  /**
   * Creates recursively a tree structure for a given directory path
   * @name createDirectoryTree
   * @method
   * @memberof IOAPI.ChromeExtension
   * @param {string} dirPath - the full path of the directory for which the tree will be generated
   */
  function createDirectoryTree(dirPath) {
    TSCORE.showAlertDialog("Creating directory tree not supported.");
    //var directoyTree = generateDirectoryTree(dirPath);
    //console.log(JSON.stringify(directoyTree));
    //TSPOSTIO.createDirectoryTree(directoyTree);
  }

  /**
   * Creates a list with containing the files and the sub directories of a given directory
   * @name listDirectoryPromise
   * @method
   * @memberof IOAPI.ChromeExtension
   * @param {string} dirPath - the full path of the directory for which the tree will be generated
   * @returns {Promise.<Success, Error>}
   */
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

  /**
   * Finds out the properties of a file or directory such last modification date or file size
   * @name getPropertiesPromise
   * @method
   * @memberof IOAPI.ChromeExtension
   * @param {string} filePath - full path to the file or the directory, which will be analysed
   * @returns {Promise.<Success, Error>}
   */
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

  /**
   * Load the content of a text file
   * @name loadTextFilePromise
   * @method
   * @memberof IOAPI.ChromeExtension
   * @param {string} filePath - the full path of the file which will be loaded
   * @returns {Promise.<Success, Error>}
   */
  function loadTextFilePromise(filePath) {
    //
    return getFileContentPromise(filePath, "text");
  }

  /**
   * Gets the content of file, useful for binary files
   * @name getFileContentPromise
   * @method
   * @memberof IOAPI.ChromeExtension
   * @param {string} fullPath - the full path of the file which will be loaded
   * @param {string} type - the type of the XHR response, defaul is *arraybuffer*
   * @returns {Promise.<Success, Error>}
   */
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

  /**
   * Persists a given content(binary supported) to a specified filepath
   * @name saveFilePromise
   * @method
   * @memberof IOAPI.ChromeExtension
   * @param {string} filePath - the full path of the file which should be saved
   * @param {string} content - content that will be saved
   * @param {boolean} overwrite - if true existing file path will be overwritten
   * @returns {Promise.<Success, Error>}
   */
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

  /**
   * Not supported on this platform
   * @name createDirectoryPromise
   * @method
   * @memberof IOAPI.ChromeExtension
   * @param {string} dirPath - the full path of the folder which will be created
   * @returns {Promise.<Success, Error>}
   */
  function createDirectoryPromise(dirPath) {
    return new Promise(function(res, rej) {
      rej("Creating directory is not supported in Chrome, please use the desktop version.");
    });
  }

  /**
   * Not supported on this platform
   * @name renameDirectoryPromise
   * @method
   * @memberof IOAPI.ChromeExtension
   * @returns {Promise.<Success, Error>}
   */
  function renameDirectoryPromise() {
    return new Promise(function(res, rej) {
      rej("Renaming directory is not supported in Chrome, please use the desktop version.");
    });
  }

  /**
   * Not supported on this platform
   * @name renameFilePromise
   * @method
   * @memberof IOAPI.ChromeExtension
   * @returns {Promise.<Success, Error>}
   */
  function renameFilePromise() {
    return new Promise(function(res, rej) {
      rej("Renaming file is not supported in Chrome, please use the desktop version.");
    });
  }

  /**
   * Not supported on this platform
   * @name copyFilePromise
   * @method
   * @memberof IOAPI.ChromeExtension
   * @returns {Promise.<Success, Error>}
   */
  function copyFilePromise() {
    return new Promise(function(res, rej) {
      rej("Copy file is not supported in Chrome, please use the desktop version.");
    });
  }

  /**
   * Not supported on this platform
   * @name deleteFilePromise
   * @method
   * @memberof IOAPI.ChromeExtension
   * @returns {Promise.<Success, Error>}
   */
  function deleteFilePromise() {
    return new Promise(function(res, rej) {
      rej("Creating directory is not supported in Chrome, please use the desktop version.");
    });
  }

  /**
   * Not supported on this platform
   * @name deleteDirectoryPromise
   * @method
   * @memberof IOAPI.ChromeExtension
   * @returns {Promise.<Success, Error>}
   */
  function deleteDirectoryPromise() {
    return new Promise(function(res, rej) {
      rej("Deleting directory is not supported in Chrome, please use the desktop version.");
    });
  }

  /**
   * Selects a directory with the help of a directory chooser
   * @name selectDirectory
   * @method
   * @memberof IOAPI.ChromeExtension
   */
  function selectDirectory() {
    console.log("Select directory!");
    var rootPath = "/";
    if (isWin) {
      rootPath = "C:";
    }
    TSCORE.showDirectoryBrowserDialog(rootPath);
  }

  /**
   * Not supported on this platform
   * @name selectFile
   * @method
   * @memberof IOAPI.ChromeExtension
   */
  function selectFile() {
    // TODO
    TSCORE.showAlertDialog("Select file not implemented!");
  }

  /**
   * Not supported on this platform
   * @name openDirectory
   * @method
   * @memberof IOAPI.ChromeExtension
   * @param {string} dirPath - the full path of the directory which will be opened
   */
  function openDirectory(dirPath) {
    // TODO
    TSCORE.showAlertDialog($.i18n.t("ns.dialogs:openContainingDirectoryAlert"));
  }

  /**
   * Not supported on this platform
   * @name openFile
   * @method
   * @memberof IOAPI.ChromeExtension
   * @param {string} filePath - the full path of the file which will be opened
   */
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
