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
      case "rename":
        if (message.success) {
          TSPOSTIO.renameFile(message.content[0], message.content[1]);
        } else {
          console.error("Rename failed");
        }
        break;
      case "copy":
        if (message.success) {
          TSPOSTIO.copyFile(message.content[0], message.content[1]);
        } else {
          TSCORE.hideWaitingDialog();
          console.error("Rename failed " + message.content);
        }
        break;
      case "saveTextFile":
        if (message.success) {
          if (message.silent !== true) {
            TSPOSTIO.saveTextFile(message.content);
          }
        } else {
          console.error("Save failed");
        }
        break;
      case "saveBinaryFile":
        if (message.success) {
          if(message.silent !== true) {
            TSPOSTIO.saveBinaryFile(message.content);
          }
        } else {
          console.error("Save binary failed");
        }
        break;
      case "createDirectory":
        if (message.success) {
          if (message.silent !== true) {
            TSPOSTIO.createDirectory(message.content);  
          }
        } else {
          console.error("Create dir failed");
        }
        break;
      case "loadTextFile":
        if (message.success) {
          TSPOSTIO.loadTextFile(message.content);
        } else {
          console.error("File loading failed");
        }
        break;
      case "listDirectory":
        if(args[0]) {
          args[0](message.content);
          args = [];
        } else {
          if (message.success) {
            TSPOSTIO.listDirectory(message.content);
          } else {
            TSPOSTIO.errorOpeningPath();
          }
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
      case "delete":
        if (message.success) {
          TSPOSTIO.deleteElement(message.content);
        } else {
          console.error("Delete failed");
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
      case "getFileProperties":
        if (message.success) {
          TSPOSTIO.getFileProperties(message.content);
        } else {
          console.error("Getting file properties failed.");
        }
        break;
      case "getFileContent":
        if (message.success) {
          var arrBuff = base64toArrayBuffer(message.content);
          args[0](arrBuff);
        } else {
          args[1](message.content);
        }
        args = [];
        break;
      default:
        break;
    }
  }, false);

  var saveSettings = function(content) {
    console.log("Saving setting...");
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {
      "detail": {
        "command": "saveSettings",
        "content": content
      }
    });
    document.documentElement.dispatchEvent(event);
  };

  var loadSettings = function() {
    console.log("Loading setting from firefox preferences...");
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {
      "detail": {
        "command": "loadSettings"
      }
    });
    document.documentElement.dispatchEvent(event);
  };

  var createDirectory = function(dirPath, silentMode) {
    console.log("Directory " + dirPath + " created.");
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {
      "detail": {
        "command": "createDirectory",
        "path": dirPath,
        "silent" : silentMode
      }
    });
    document.documentElement.dispatchEvent(event);
  };

  var loadTextFile = function(filePath) {
    console.log("Loading file: " + filePath);
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {
      "detail": {
        "command": "loadTextFile",
        "path": filePath
      }
    });
    document.documentElement.dispatchEvent(event);
  };

  var copyFile = function(filePath, newFilePath) {
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
  };

  var renameFile = function(filePath, newFilePath) {
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
  };

  var renameDirectory = function(filePath, newFilePath) {
    TSCORE.showAlertDialog($.i18n.t("ns.common:functionalityNotImplemented"));
  };

  var saveTextFile = function(filePath, content, overWrite, silentMode) {
    console.log("Saving file: " + filePath);
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {
      "detail": {
        "command": "saveTextFile",
        "path": filePath,
        "content": content,
        "overwrite": overWrite,
        "silent": silentMode
      }
    });
    document.documentElement.dispatchEvent(event);
  };

  function ab2str(buf) {
    //TODO add support for larger files
    // http://updates.html5rocks.com/2014/08/Easier-ArrayBuffer---String-conversion-with-the-Encoding-API
    return String.fromCharCode.apply(null, new Uint8Array(buf));
  }

  var saveBinaryFile = function(filePath, content, overWrite, silentMode) {
    console.log("Saving binary file post: " + filePath); //+" - "+content);
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {
      "detail": {
        "command": "saveBinaryFile",
        "path": filePath,
        "content": ab2str(content),
        "overwrite": overWrite,
        "silent": silentMode
      }
    });
    document.documentElement.dispatchEvent(event);
  };

  var listDirectory = function(dirPath) {
    console.log("Listing directory: " + dirPath);
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {
      "detail": {
        "command": "listDirectory",
        "path": dirPath
      }
    });
    document.documentElement.dispatchEvent(event);
  };

  var deleteElement = function(path) {
    console.log("Deleting: " + path);
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {
      "detail": {
        "command": "delete",
        "path": path
      }
    });
    document.documentElement.dispatchEvent(event);
  };

  var deleteDirectory = function(dirPath) {
    TSCORE.showAlertDialog($.i18n.t("ns.common:functionalityNotImplemented"));
  };

  var checkAccessFileURLAllowed = function() {
    console.log("checkAccessFileURLAllowed function not relevant for node..");
  };

  var selectDirectory = function() {
    console.log("Selecting directory...");
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {
      "detail": {
        "command": "selectDirectory"
      }
    });
    document.documentElement.dispatchEvent(event);
  };

  var selectFile = function() {
    console.log("Selecting file...");
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {
      "detail": {
        "command": "selectFile"
      }
    });
    document.documentElement.dispatchEvent(event);
  };

  var openDirectory = function(dirPath) {
    console.log("Opening directory: " + dirPath);
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {
      "detail": {
        "command": "openDirectory",
        "path": dirPath
      }
    });
    document.documentElement.dispatchEvent(event);
  };

  var openExtensionsDirectory = function() {
    console.log("Opening extensions directory...");
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {
      "detail": {
        "command": "openExtensionsDirectory"
      }
    });
    document.documentElement.dispatchEvent(event);
  };

  var createDirectoryIndex = function(dirPath) {
    console.log("Creating directory index for: " + dirPath);
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {
      "detail": {
        "command": "createDirectoryIndex",
        "path": dirPath
      }
    });
    document.documentElement.dispatchEvent(event);
  };

  var createDirectoryTree = function(dirPath) {
    console.log("Creating directory tree for: " + dirPath);
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {
      "detail": {
        "command": "createDirectoryTree",
        "path": dirPath
      }
    });
    document.documentElement.dispatchEvent(event);
  };

  var checkNewVersion = function() {
    console.log("Checking for new version...");
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {
      "detail": {
        "command": "checkNewVersion"
      }
    });
    document.documentElement.dispatchEvent(event);
  };

  var getFileProperties = function(filePath) {
    console.log("Getting file properties...");
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {
      "detail": {
        "command": "getFileProperties",
        "path": filePath
      }
    });
    document.documentElement.dispatchEvent(event);
  };

  var openFile = function(filePath) {
    // TODO implement openFile for firefox
    console.log("Open file functionality not implemented in Firefox yet!");
    TSCORE.showAlertDialog($.i18n.t("ns.dialogs:openFileNativelyAlert"));
  };

  // Bring the TagSpaces window on top of the windows
  var focusWindow = function() {
    window.focus();
  };

  var getFileContent = function(filePath, result, error) {
    args = [result, error];
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {
      "detail": {
        "command": "getFileContent",
        "path": filePath
      }
    });
    document.documentElement.dispatchEvent(event);
  };

  function base64toArrayBuffer(str) {
    var bstr =  atob(str);
    var len = bstr.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
      bytes[i] = bstr.charCodeAt(i);
    }
    return bytes.buffer;
  }

  var getDirectoryMetaInformation = function(dirPath, readyCallback) {
    args = [readyCallback];
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent("addon-message", true, true, {
      "detail": {
        "command": "listDirectory",
        "path": dirPath
      }
    });
    document.documentElement.dispatchEvent(event);
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
  exports.getFileContent = getFileContent;
  exports.getDirectoryMetaInformation = getDirectoryMetaInformation;
  // mozilla specific
  exports.saveSettings = saveSettings;
  exports.loadSettings = loadSettings;
});
