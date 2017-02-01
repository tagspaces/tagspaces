/* Copyright (c) 2012-2015 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */
/* global define  */

/**
 * A implementation of the IOAPI for the Chrome/Chromium extensions platform
 * @class FirefoxAddon
 * @memberof IOAPI
 */
define(function(require, exports, module) {
  "use strict";

  console.log("Loading mozilla.api.js..");

  var TSCORE = require("tscore");
  var TSPOSTIO = require("tspostioapi");
  var args = [];
  
  document.documentElement.addEventListener("tsMessage", function(event) {
    console.log("Message received in page script from content script"); //+JSON.stringify(event.detail));
    var message = event.detail;
    switch (message.command) {
      case "loadSettings":
        if (message.success) {
          try {
            console.log("Loading settings...: " + JSON.stringify(message.content));
            TSCORE.Config.updateSettingMozillaPreferences(message.content);

            TSCORE.initLocations();
            TSCORE.generateTagGroups();

          } catch (ex) {
            console.log("Exception while getting setting from firefox failed " + ex);
          }
        } else {
          console.log("Getting setting from firefox failed");
        }
        break;
      case "saveSettings":
        if (message.success) {
          console.log("Saving setting as native mozilla preference successfull!");
        } else {
          console.log("Saving setting as native mozilla preference failed!");
        }
        break;
      case "createDirectoryTree":
        if (message.success) {
          console.log("Directory tree: " + JSON.stringify(message.content));
          TSPOSTIO.createDirectoryTree(message.content);
        } else {
          console.error("Indexing directory failed");
        }
        break;
      case "selectDirectory":
        if (message.success) {
          TSPOSTIO.selectDirectory(message.content);
        } else {
          console.error("Selecting directory failed.");
        }
        break;
      case "checkNewVersion":
        if (message.success) {
          TSCORE.updateNewVersionData(message.content);
        } else {
          console.error("Checking for new version failed.");
        }
        break;
      default:
        break;
    }
  }, false);

  function base64toArrayBuffer(str) {
    var bstr =  atob(str);
    var len = bstr.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
      bytes[i] = bstr.charCodeAt(i);
    }
    return bytes.buffer;
  }

  function ab2str(buf) {
    //TODO add support for larger files
    // http://updates.html5rocks.com/2014/08/Easier-ArrayBuffer---String-conversion-with-the-Encoding-API
    return String.fromCharCode.apply(null, new Uint8Array(buf));
  }

  function focusWindow() {
    // Bring the TagSpaces window on top of the windows
    window.focus();
  }

  function saveSettings(content) {
    console.log("Saving setting...");
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {
      "detail": {
        "command": "saveSettings",
        "content": content
      }
    });
    document.documentElement.dispatchEvent(event);
  }

  function loadSettings() {
    console.log("Loading setting from firefox preferences...");
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {
      "detail": {
        "command": "loadSettings"
      }
    });
    document.documentElement.dispatchEvent(event);
  }

  /**
   * Checks if new version is available
   * @name checkNewVersion
   * @method
   * @memberof IOAPI.FirefoxAddon
   */
  function checkNewVersion() {
    console.log("Checking for new version...");
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {
      "detail": {
        "command": "checkNewVersion"
      }
    });
    document.documentElement.dispatchEvent(event);
  }

  /**
   * Creates a list with containing the files and the sub directories of a given directory
   * @name listDirectoryPromise
   * @method
   * @memberof IOAPI.FirefoxAddon
   * @param {string} dirPath - the directory path which is listed
   * @returns {Promise.<Success, Error>}
   */
  function listDirectoryPromise(dirPath) {
     return new Promise(function(resolve, reject) {

      console.log("Listing directory: " + dirPath);
      var event = document.createEvent('CustomEvent');
      event.initCustomEvent("addon-message", true, true, {
        "detail": {
        "command": "listDirectory",
        "path": dirPath
        }
      });
      document.documentElement.dispatchEvent(event);

      function eventListener(event) {
        var message = event.detail;
        if (message.command === "listDirectory") {
          if (message.success) {
            resolve(message.content);
          } else {
            reject("listDirectory" + dirPath + " failed");
          }
          document.documentElement.removeEventListener("tsMessage", eventListener);
        }
      }
      document.documentElement.addEventListener("tsMessage", eventListener);
     });
  }

  /**
   * Finds out the properties of a file or directory such last modification date or file size
   * @name getPropertiesPromise
   * @method
   * @memberof IOAPI.FirefoxAddon
   * @param {string} filePath - full path to the file or the directory, which will be analysed
   * @returns {Promise.<Success, Error>}
   */
  function getPropertiesPromise(filePath) {
    console.log("Getting file properties...");
    return new Promise(function(resolve, reject) {
      var event = document.createEvent('CustomEvent');
      event.initCustomEvent("addon-message", true, true, {
        "detail": {
          "command": "getFileProperties",
          "path": filePath
        }
      });
      document.documentElement.dispatchEvent(event);

      function eventListener(event) {
        console.log("Message received in page script from content script"); //+JSON.stringify(event.detail));
        var message = event.detail;
        if (message.command === "getFileProperties") {
          if (message.success) {
            resolve(message.content);
          } else {
            reject("Getting file properties failed");
          }
          document.documentElement.removeEventListener("tsMessage", eventListener);
        }
      }
      document.documentElement.addEventListener("tsMessage", eventListener);
    });
  }

  /**
   * Creates recursively a tree structure for a given directory path
   * @name createDirectoryTree
   * @method
   * @memberof IOAPI.FirefoxAddon
   * @param {string} dirPath - the full path of the directory for which the tree will be generated
   */
  function createDirectoryTree(dirPath) {
    console.log("Creating directory tree for: " + dirPath);
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {
      "detail": {
        "command": "createDirectoryTree",
        "path": dirPath
      }
    });
    document.documentElement.dispatchEvent(event);
  }

  /**
   * Load the content of a text file
   * @name loadTextFilePromise
   * @method
   * @memberof IOAPI.FirefoxAddon
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
   * @memberof IOAPI.FirefoxAddon
   * @param {string} fullPath - the full path of the file which will be loaded
   * @param {string} type - the type of the XHR response, defaul is *arraybuffer*
   * @returns {Promise.<Success, Error>}
   */
  function getFileContentPromise(filePath, type) {
    console.log("getFileContentPromise: " + filePath);
    return new Promise(function(resolve, reject) {
      var event = document.createEvent('CustomEvent');
      var command = (type === "text") ? "loadTextFile" : "getFileContent";
      event.initCustomEvent("addon-message", true, true, {
        "detail": {
          "command": command,
          "path": filePath
        }
      });
      document.documentElement.dispatchEvent(event);

      function eventListener(event) {
        console.log("Message received in page script from content script"); //+JSON.stringify(event.detail));
        var message = event.detail;
        if (message.command === command) {
          if (message.success) {
            if(message.command === "getFileContent") {
              //TODO: fix buffer conversion
              var arrBuff = base64toArrayBuffer(message.content);
              resolve(arrBuff);
            } else {
              resolve(message.content);
            }
          } else {
            reject("File content loading failed");
          }
          document.documentElement.removeEventListener("tsMessage", eventListener);
        }
      }

      document.documentElement.addEventListener("tsMessage", eventListener);
    });
  }

  /**
   * Persists a given content(binary supported) to a specified filepath
   * @name saveFilePromise
   * @method
   * @memberof IOAPI.FirefoxAddon
   * @param {string} filePath - the full path of the file which should be saved
   * @param {string} content - content that will be saved
   * @param {boolean} overWrite - if true existing file path will be overwritten
   * @returns {Promise.<Success, Error>}
   */
  function saveFilePromise(filePath, content, overWrite) {
    return new Promise(function(resolve, reject) {
      console.log("Saving file: " + filePath);
      var event = document.createEvent('CustomEvent');
      event.initCustomEvent("addon-message", true, true, {
        "detail": {
          "command": "saveTextFile",
          "path": filePath,
          "content": content,
          "overwrite": overWrite
        }
      });
      document.documentElement.dispatchEvent(event);
      function eventListener(event) {
        var message = event.detail;
        if (message.command === "saveTextFile") {
          if (message.success) {
            resolve(message.content);
          } else {
            reject("Save text file failed");
          }
          document.documentElement.removeEventListener("tsMessage", eventListener);
        }
      }
      document.documentElement.addEventListener("tsMessage", eventListener);
    });
  }

  /**
    * Persists a given binary content to a specified filepath
    * @name saveBinaryFilePromise
    * @method
    * @memberof IOAPI.FirefoxAddon
    * @param {string} filePath - the full path of the file which will be saved
    * @param {string} content - content that will be saved
    * @param {string} overWrite - if true existing file path will be overwritten
    * @returns {Promise.<Success, Error>}
    */
  function saveBinaryFilePromise(filePath, content, overWrite) {
    return new Promise(function(resolve, reject) {
    console.log("Saving binary file post: " + filePath); //+" - "+content);
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {
      "detail": {
        "command": "saveBinaryFile",
        "path": filePath,
        "content": ab2str(content),
        "overwrite": overWrite
      }
    });
    document.documentElement.dispatchEvent(event);
      function eventListener(event) {
        var message = event.detail;
        if (message.command === "saveBinaryFile") {
          if (message.success) {
            resolve(message.content);
          } else {
            reject("Save bin file failed");
          }
          document.documentElement.removeEventListener("tsMessage", eventListener);
        }
      }
      document.documentElement.addEventListener("tsMessage", eventListener);
    });
  }

   /**
   * Creates a directory
   * @name createDirectory
   * @method
   * @memberof IOAPI.FirefoxAddon
   * @param {string} dirPath - the full path of the folder which will be created
   * @param {string} silentMode - //TODO
   */
  function createDirectory(dirPath, silentMode) {
    createDirectoryPromise(dirPath).then(function() {
      if(!silentMode) {
        TSPOSTIO.createDirectory(dirPath);
      }
    }, function(error){
      console.log(error);
    });
  }

  /**
   * Creates a directory
   * @name createDirectoryPromise
   * @method
   * @memberof IOAPI.FirefoxAddon
   * @param {string} dirPath - the full path of the folder which will be created
   * @returns {Promise.<Success, Error>}
   */
  function createDirectoryPromise(dirPath) {
    return new Promise(function(resolve, reject) {
      console.log("Directory " + dirPath + " created.");
      var event = document.createEvent('CustomEvent');
      event.initCustomEvent("addon-message", true, true, {
        "detail": {
          "command": "createDirectory",
          "path": dirPath
        }
      });
      document.documentElement.dispatchEvent(event);
      function eventListener(event) {
        var message = event.detail;
        if (message.command === "createDirectory") {
          if (message.success) {
            resolve(message.content);
          } else {
            reject("Create directory failed");
          }
          document.documentElement.removeEventListener("tsMessage", eventListener);
        }
      }
      document.documentElement.addEventListener("tsMessage", eventListener);
    });
  }

  /**
    * Copies a given file to a specified location
    * @name copyFilePromise
    * @method
    * @memberof IOAPI.FirefoxAddon
    * @param {string} filePath - the full path of a file which will be copied
    * @param {string} newFilePath - the full path destination of the copied file
    * @returns {Promise.<Success, Error>}
    */
  function copyFilePromise(filePath, newFilePath) {
    return new Promise(function(resolve, reject) {
      console.log("Copy " + filePath + " to " + newFilePath);
      var event = document.createEvent('CustomEvent');
      event.initCustomEvent("addon-message", true, true, {
        "detail": {
          "command": "copy",
          "path": filePath,
          "newPath": newFilePath
        }
      });
      document.documentElement.dispatchEvent(event);
      function eventListener(event) {
        var message = event.detail;
        if (message.command === "copy") {
          if (message.success) {
            resolve(message.content);
          } else {
            reject("Copy file failed");
          }
          document.documentElement.removeEventListener("tsMessage", eventListener);
        }
      }
      document.documentElement.addEventListener("tsMessage", eventListener);
    });
  }
  /**
    * Renames a given file
    * @name renameFilePromise
    * @method
    * @memberof IOAPI.FirefoxAddon
    * @param {string} filePath - the full path of the file which will be renamed
    * @param {string} newPath - the desired full path after the file rename
    * @returns {Promise.<Success, Error>}
    */
  function renameFilePromise(filePath, newPath) {
    return new Promise(function(resolve, reject) {
      console.log("Renaming " + filePath + " to " + newFilePath);
      var event = document.createEvent('CustomEvent');
      event.initCustomEvent("addon-message", true, true, {
        "detail": {
          "command": "rename",
          "path": filePath,
          "newPath": newFilePath
        }
      });

      document.documentElement.dispatchEvent(event);
      function eventListener(event) {
        var message = event.detail;
        if (message.command === "rename") {
          if (message.success) {
            resolve(message.content);
          } else {
            reject("Rename file failed");
          }
          document.documentElement.removeEventListener("tsMessage", eventListener);
        }
      }
      document.documentElement.addEventListener("tsMessage", eventListener);
    });
  }

  /**
    * Rename a directory
    * @name renameDirectoryPromise
    * @method
    * @memberof IOAPI.FirefoxAddon
    * @param {string} path - the full path of the directory which will be renamed
    * @returns {Promise.<Success, Error>}
    */
  function renameDirectoryPromise(path) {
    return new Promise(function(res, rej) {
      TSCORE.showAlertDialog($.i18n.t("ns.common:functionalityNotImplemented"));
      res(true);
    });
  }

  /**
    * Delete a specified file
    * @name deleteFilePromise
    * @method
    * @memberof IOAPI.FirefoxAddon
    * @param {string} path - the full path of the file which will be deleted
    * @returns {Promise.<Success, Error>}
    */
  function deleteFilePromise(path) {
    return new Promise(function(resolve, reject) {
      console.log("Deleting: " + path);
      var event = document.createEvent('CustomEvent');
      event.initCustomEvent("addon-message", true, true, {
        "detail": {
          "command": "delete",
          "path": path
        }
      });
      document.documentElement.dispatchEvent(event);

      function eventListener(event) {
        var message = event.detail;
        if (message.command === "delete") {
          if (message.success) {
            resolve(message.content);
          } else {
            reject("Delete file failed");
          }
          document.documentElement.removeEventListener("tsMessage", eventListener);
        }
      }
      document.documentElement.addEventListener("tsMessage", eventListener);
    });
  }

  /**
   * Delete a specified directory, the directory should be empty, if the trash can functionality is not enabled
   * @name deleteDirectoryPromise
   * @method
   * @memberof IOAPI.FirefoxAddon
   * @param {string} path - the full path of the directory which will be deleted
   * @returns {Promise.<Success, Error>}
   */
  function deleteDirectoryPromise(path) {
    return new Promise(function(res, rej) {
      TSCORE.showAlertDialog($.i18n.t("ns.common:functionalityNotImplemented"));
      res(true);
    });
  }

   /**
    * Selects a directory with the help of a directory chooser
    * @name selectDirectory
    * @method
    * @memberof IOAPI.FirefoxAddon
    */
  function selectDirectory() {
    console.log("Selecting directory...");
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {
      "detail": {
        "command": "selectDirectory"
      }
    });
    document.documentElement.dispatchEvent(event);
  }
  /**
     * Selects a file with the help of a file chooser
     * @name selectFile
     * @method
     * @memberof IOAPI.FirefoxAddon
     */
  function selectFile() {
    console.log("Selecting file...");
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {
      "detail": {
        "command": "selectFile"
      }
    });
    document.documentElement.dispatchEvent(event);
  }

  /**
    * Opens a directory in the operating system's default file manager
    * @name openDirectory
    * @method
    * @memberof IOAPI.FirefoxAddon
    * @param {string} dirPath - the full path of the directory which will be opened
    */
  function openDirectory(dirPath) {
    console.log("Opening directory: " + dirPath);
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {
      "detail": {
        "command": "openDirectory",
        "path": dirPath
      }
    });
    document.documentElement.dispatchEvent(event);
  }

  /**
    * Opens a given file url in a new tab or window
    * @name openFile
    * @method
    * @memberof IOAPI.FirefoxAddon
    * @param {string} url - the url of file which will be opened in new window or tab
    */
  function openFile(url) {
    window.open(url, '_blank');
  }

  // mozilla specific
  exports.saveSettings = saveSettings;
  exports.loadSettings = loadSettings;

  // Platform API
  exports.focusWindow = focusWindow;
  exports.checkNewVersion = checkNewVersion;

  exports.createDirectoryTree = createDirectoryTree;

  exports.listDirectoryPromise = listDirectoryPromise;

  exports.getPropertiesPromise = getPropertiesPromise;

  exports.loadTextFilePromise = loadTextFilePromise;
  exports.getFileContentPromise = getFileContentPromise;

  exports.saveFilePromise = saveFilePromise;
  exports.saveTextFilePromise = saveFilePromise;
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
