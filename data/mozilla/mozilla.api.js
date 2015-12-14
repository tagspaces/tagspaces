/* Copyright (c) 2012-2015 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */
/* global define  */

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
      case "indexDirectory":
        if (message.success) {
          TSPOSTIO.createDirectoryIndex(message.content);
        } else {
          console.error("Indexing directory failed");
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
          TSPOSTIO.checkNewVersion(message.content);
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

  function listDirectory(dirPath) {
    console.log("Listing directory: " + dirPath);
    listDirectoryPromise(dirPath).then( function(success) {
        TSPOSTIO.listDirectory(success);
      },
      function(error) {
        console.warn("Error: " + error);
        TSPOSTIO.errorOpeningPath();
      }
    );
  }

  function getDirectoryMetaInformation(dirPath, readyCallback) {
    console.log("getDirectoryMetaInformation: " + dirPath);
    listDirectoryPromise(dirPath).then( function(success) {
        readyCallback(success);
      },
      function(error) {
        console.warn("Error: " + error);
        if(readyCallback) {
          readyCallback();
        } else {
          TSPOSTIO.errorOpeningPath();  
        }
      }
    );
  }


  function getFilePropertiesPromise(filePath) {
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

  function getFileProperties(filePath) {
    getFilePropertiesPromise(filePath).then(function(properties) {
      TSPOSTIO.getFileProperties(properties);
    }, function(error) {
      console.log("Error: " + error);
    });
  }


  function createDirectoryIndex(dirPath) {
    console.log("Creating directory index for: " + dirPath);
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {
      "detail": {
        "command": "createDirectoryIndex",
        "path": dirPath
      }
    });
    document.documentElement.dispatchEvent(event);
  }

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


  function loadTextFile(filePath) {
    console.log("Loading file: " + filePath);
    getFileContentPromise(filePath, "text").then(
      function(success) {
        TSPOSTIO.loadTextFile(success);
      },
      function(error) {
        console.warn("Error: " + error);
      }
    );
  }

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

  function getFileContent(filePath, result, error) {
    getFileContentPromise(filePath).then(result, error);
  }


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

  function saveTextFile(filePath, content, overWrite, silentMode) {
    saveFilePromise(filePath, content, overWrite).then(function() {
      if(!silentMode) {
        TSPOSTIO.saveTextFile(filePath);
      }
    }, function(error) {
      console.log(error);
    });
  }


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

  function saveBinaryFile(filePath, content, overWrite, silentMode) {
    saveBinaryFilePromise(filePath, content, overWrite).then(function() {
      if(!silentMode) {
        TSPOSTIO.saveBinaryFile(filePath);
      }
    }, function(error) {
      console.log(error);
    });
  }


  function createDirectory(dirPath, silentMode) {
    createDirectoryPromise(dirPath).then(function() {
      if(!silentMode) {
        TSPOSTIO.createDirectory(dirPath);
      }
    }, function(error){
      console.log(error);
    });
  }

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

  function copyFile(filePath, newFilePath) {
    copyFilePromise(filePath, newFilePath).then(function() {
      TSPOSTIO.copyFile(filePath, newFilePath);
    },function(error){
      console.log(error);
    });
  }


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

  function renameFile(filePath, newFilePath) {
    renameFilePromise(filePath, newFilePath).then(function() {
      TSPOSTIO.renameFile(filePath, newPath);
    }, function(error){
      console.log(error);
    });
  }


  function renameDirectoryPromise(path) {
    return new Promise(function(res, rej) {
      TSCORE.showAlertDialog($.i18n.t("ns.common:functionalityNotImplemented"));
      res(true);
    });
  }

  function renameDirectory(filePath, newFilePath) {
    renameDirectoryPromise();
  }


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

  function deleteElement(path) {
    deleteFilePromise(path).then(function(result) {
       TSPOSTIO.deleteElement(content);
    }, function(error) {
      console.log(error);
    });
  }


  function deleteDirectoryPromise(path) {
    return new Promise(function(res, rej) {
      TSCORE.showAlertDialog($.i18n.t("ns.common:functionalityNotImplemented"));
      res(true);
    });
  }

  function deleteDirectory(dirPath) {
    deleteDirectoryPromise();
  }


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

  function openFile(filePath) {
    // TODO implement openFile for firefox
    console.log("Open file functionality not implemented in Firefox yet!");
    TSCORE.showAlertDialog($.i18n.t("ns.dialogs:openFileNativelyAlert"));
  }

  // mozilla specific
  exports.saveSettings = saveSettings;
  exports.loadSettings = loadSettings;

  // Platform API
  exports.focusWindow = focusWindow;
  exports.checkNewVersion = checkNewVersion;

  exports.createDirectoryIndex = createDirectoryIndex;
  exports.createDirectoryTree = createDirectoryTree;

  exports.listDirectoryPromise = listDirectoryPromise;
  exports.listDirectory = listDirectory;
  exports.getDirectoryMetaInformation = getDirectoryMetaInformation;

  exports.getFileProperties = getFileProperties;

  exports.loadTextFile = loadTextFile;
  exports.getFileContentPromise = getFileContentPromise;
  exports.getFileContent = getFileContent;

  exports.saveFilePromise = saveFilePromise;
  exports.saveTextFilePromise = saveFilePromise;
  exports.saveBinaryFilePromise = saveBinaryFilePromise;
  exports.saveTextFile = saveTextFile; /** @deprecated */
  exports.saveBinaryFile = saveBinaryFile; /** @deprecated */

  exports.createDirectoryPromise = createDirectoryPromise;
  exports.createDirectory = createDirectory; /** @deprecated */

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
