/* Copyright (c) 2012-2015 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */
/* global define */
//cordova ios handleOpenURL is global
var handleOpenURL; // jshint ignore:line

define(function(require, exports, module) {
  "use strict";

  console.log("Loading ioapi.cordova.js..");

  var TSCORE = require("tscore");
  var TSPOSTIO = require("tspostioapi");
  var attachFastClick = require('cordova/fastclick/fastclick.min');
  var fsRoot;
  var urlFromIntent;
  var widgetAction;
  var loadedSettings, loadedSettingsTags;
  var appSettingFile = "settings.json";
  var appSettingTagsFile = "settingsTags.json";

  var anotatedTree;
  var pendingCallbacks = 0;

  document.addEventListener("deviceready", onDeviceReady, false);
  document.addEventListener("resume", onDeviceResume, false);
  document.addEventListener("initApp", onApplicationLoad, false);

  // Register ios file open handler
  handleOpenURL = function(url) {
    var fileName = url.substring(url.lastIndexOf('/') + 1, url.length);
    TSCORE.showConfirmDialog("File copied", "File " + fileName + " is copied in inbox folder. Would you like to open it ?", function() {
      TSCORE.FileOpener.openFile(url);
    });
  };

  // Platform specific functions
  function normalizePath(path) {
    //we set absoilute path because some extensions didn't recognize cdvfile
    //but in cordova.api implementation we didn't need absolute path so we strip nativeURL
    if (path.indexOf(fsRoot.nativeURL) === 0) {
      path = path.replace(fsRoot.nativeURL , "/");
    }
    if (path.indexOf(fsRoot.fullPath) === 0) {
      path = path.substring(fsRoot.fullPath.length, path.length);
    }
    return path;
  }

  function onDeviceReady() {
    console.log("Device Ready:"); // "+device.platform+" - "+device.version);
    // Redefining the back button
    document.addEventListener("backbutton", function(e) {
      TSCORE.FileOpener.closeFile();
      $('.modal').modal('hide');
      //e.preventDefault();
    }, false);

    // iOS specific initialization
    if (isCordovaiOS) {
      window.plugins = window.plugins || {};
      // TODO: use fileOpener2 plugin on all platforms
      // https://build.phonegap.com/plugins/1117
      window.plugins.fileOpener = cordova.plugins.fileOpener2;
    }

    if (window.plugins.webintent) {
      window.plugins.webintent.getUri(
        function(url) {
          if ("createTXTFile" === url || url.indexOf("TagSpaces") > 0) {
            widgetAction = url;
          } else {
            urlFromIntent = url;
          }
        }
        //, function(error) {
        //  TSCORE.showAlertDialog("WebIntent Error: " + error);
        //}
      );
      window.plugins.webintent.onNewIntent(function(url) {
        widgetAction = url;
        widgetActionHandler();
      });
    }

    attachFastClick(document.body);
    getFileSystem();

    if (isCordovaiOS) {
      setTimeout(function() {
        navigator.splashscreen.hide();
      }, 1000);

      //Enable TestFairy if available
      if (PRODUCTION != "true" && TestFairy) {
        TestFairy.begin("ef5d3fd8bfa17164b8068e71ccb32e1beea25f2f");
      }
    }
  }

  function onDeviceResume() {
    //TODO: reload curtent dir after background operation
    TSCORE.IO.listDirectory(TSCORE.currentPath);
  }

  function widgetActionHandler() {

    if (TSCORE.currentPath === null) {
      TSCORE.showAlertDialog("Please set location folder to use widget");
      return;
    }

    if (widgetAction === "createTXTFile") {
      TSCORE.createTXTFile();
    } else {
      var fileName = widgetAction.substring(widgetAction.lastIndexOf('/'), widgetAction.length);
      var newFileName = TSCORE.currentPath + fileName;
      var newFileFullPath = fsRoot.nativeURL + "/" + newFileName;
      renameFile(widgetAction, newFileName);
      TSCORE.FileOpener.openFile(newFileFullPath);
    }

    widgetAction = undefined;
  }

  function onApplicationLoad() {
    if (widgetAction) {
      widgetActionHandler();
    }
  }

  function getFileSystemPromise(path) {
    console.log("getFileSystemPromise: " + path);
    if (path.indexOf(cordova.file.applicationDirectory) === 0) {
    } else {
      path = (isCordovaiOS) ? cordova.file.applicationDirectory + "/" + file : "file:///" + path;
    }
    return new Promise(function(resolve, reject) {
      window.resolveLocalFileSystemURL(path, resolve,
        function(error) {
          TSCORE.hideLoadingAnimation();
          console.error("Error getting FileSystem: " + JSON.stringify(error));
          reject(error);
        });
    });
  }

  function resolveFullPath(localURL) {
    //Cordova file plugin didn't set fullpath so we set fullpath as absolute
    //this solve problem with extensions which can't use the cdvfile
    var URL = "cdvfile://localhost/persistent/";
    var fullPath = decodeURIComponent(localURL);
    if (fullPath.indexOf("cdvfile://localhost/root/") === 0) {
      URL = "cdvfile://localhost/root/";
    }

    fullPath = fsRoot.nativeURL + fullPath.substring(URL.length, fullPath.length);
    return fullPath;
  }

  function getAppStorageFileSystem(fileName, fileCallback, fail) {
    var dataFolderPath = (isCordovaiOS === true) ?
      cordova.file.dataDirectory : cordova.file.externalApplicationStorageDirectory;

    window.resolveLocalFileSystemURL(dataFolderPath,
      function(fs) {
        fs.getFile(fileName, {create:true}, fileCallback, fail);
      },
      function(error) {
        TSCORE.hideLoadingAnimation();
        console.error("Error getSettingsFileSystem: " + JSON.stringify(error));
      }
    );
  }

  function getFileSystem() {
    //on android cordova.file.externalRootDirectory points to sdcard0
    var fsURL = (isCordovaiOS === true) ? cordova.file.documentsDirectory : "file:///";
    window.resolveLocalFileSystemURL(fsURL,
      function(fileSystem) {
        fsRoot = fileSystem;
        //console.log("Filesystem Details: " + JSON.stringify(fsRoot));
        handleStartParameters();

        loadSettingsFile(appSettingFile, function(settings) {
          loadedSettings = settings;
          loadSettingsFile(appSettingTagsFile, function(settingsTags) {
            loadedSettingsTags = settingsTags;
            TSCORE.initApp();
          });
        });
      },
      function(err) {
        TSCORE.hideLoadingAnimation();
        console.error("Error resolving local file system url: " + JSON.stringify(err));
      }
    );
  }

  function generateDirectoryTree(entries) {
    var tree = {};
    var i;
    for (i = 0; i < entries.length; i++) {
      if (entries[i].isFile) {
        console.log("File: " + entries[i].name);
        tree.children.push({
          "name": entries[i].name,
          "isFile": entries[i].isFile,
          "size": "", // TODO size and lmtd
          "lmdt": "", //
          "path": entries[i].fullPath
        });
      } else {
        var directoryReader = entries[i].createReader();
        pendingCallbacks++;
        directoryReader.readEntries(
          generateDirectoryTree,
          function(error) {
            TSCORE.hideLoadingAnimation();
            console.error("Error reading dir entries: " + error.code);
          }); // jshint ignore:line
      }
    }
    pendingCallbacks--;
    console.log("Pending recursions: " + pendingCallbacks);
    if (pendingCallbacks <= 0) {
      TSPOSTIO.createDirectoryTree(anotatedTree);
    }
  }

  function saveSettingsFile(fileName, data) {
    getAppStorageFileSystem(fileName,
      function(fileEntry) {
        fileEntry.createWriter(
          function(writer) {
            writer.write(data);
          }, function(error) {
            TSCORE.hideLoadingAnimation();
            console.error("Error creating writter: " + JSON.stringify(error));
          }
        );
      },
      function(error) {
        TSCORE.hideLoadingAnimation();
        console.error("Error getting app storage file system: " + JSON.stringify(error));
      }
    );
  }

  function loadSettingsFile(fileName, ready) {
    getAppStorageFileSystem(fileName,
      function(fileEntry) {
        fileEntry.file(
          function(file) {
            var reader = new FileReader();
            reader.onloadend = function(evt) {
              var content = null;
              if (evt.target.result.length > 0) {
                content = evt.target.result;
              }
              ready(content);
            };
            reader.readAsText(file);
          },
          function(error) {
            TSCORE.hideLoadingAnimation();
            console.error("Error reading file: " + JSON.stringify(error));
          }
        );
      },
      function(error) {
        TSCORE.hideLoadingAnimation();
        console.log("Error getting app storage file system: " + JSON.stringify(error));
      }
    );
  }

  // Platform specific API calls

  function saveSettings(settings) {
    //
    saveSettingsFile(appSettingFile, settings);
  }

  function loadSettings() {
    //
    return loadedSettings;
  }

  function saveSettingsTags(tagGroups) {
    //TODO use js objects
    var jsonFormat = '{ "appName": "' + TSCORE.Config.DefaultSettings.appName +
        '", "appVersion": "' + TSCORE.Config.DefaultSettings.appVersion +
        '", "appBuild": "' + TSCORE.Config.DefaultSettings.appBuild +
        '", "settingsVersion": ' + TSCORE.Config.DefaultSettings.settingsVersion +
        ', "tagGroups": ' + tagGroups + ' }';
    saveSettingsFile(appSettingTagsFile, jsonFormat);
  }

  function loadSettingsTags() {

    return loadedSettingsTags;
  }

  function sendFile(filePath) {
    console.log("Sending file: " + filePath);
    window.plugins.fileOpener.send(filePath);
  }

  // Platform API

  function checkNewVersion() {
    console.log("Checking for new version...");
    var cVer = TSCORE.Config.DefaultSettings.appVersion + "." + TSCORE.Config.DefaultSettings.appBuild;
    $.ajax({
        url: 'http://tagspaces.org/releases/version.json?pVer=' + cVer,
        type: 'GET'
      })
      .done(function(data) {
        TSPOSTIO.checkNewVersion(data);
      })
      .fail(function(data) {
        console.log("AJAX failed " + data);
      });
  }

  function focusWindow() {
    // Bring the TagSpaces window on top of the windows
    console.log("Focusing window is not implemented in cordova.");
  }

  function handleStartParameters() {
    if (urlFromIntent !== undefined && urlFromIntent.length > 0) {
      console.log("Intent URL: " + urlFromIntent);
      var filePath = decodeURIComponent(urlFromIntent);
      TSCORE.FileOpener.openFileOnStartup(filePath);
    }
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
        console.warn("Error creating index: " + JSON.stringify(err));
      }
    ).catch(function() {
      TSCORE.hideWaitingDialog();
    });
  }

  function createDirectoryTree(dirPath) {
    // TODO
    TSCORE.showAlertDialog("Creating directory tree is not supported in Cordova yet.");
  }


  function listDirectoryPromise(path) {
    return new Promise(function(resolve, reject) {
      var anotatedDirList = [];
      var fileWorkers = [];
      getFileSystemPromise(path).then(function(fileSystem) {
        var reader = fileSystem.createReader();
        reader.readEntries(
          function(entries) {
            for (var i = 0; i < entries.length; i++) {
              if (entries[i].isDirectory) {
                anotatedDirList.push({
                  "name": entries[i].name,
                  "path": entries[i].fullPath,
                  "isFile": false,
                  "size": "",
                  "lmdt": ""
                });
              } else {
                var filePromise = Promise.resolve({
                  then: function(resolve, reject) {
                    if (entries[i] && entries[i].isFile) {
                      entries[i].file(function(entry) {
                          resolve({
                            "name": entry.name,
                            "isFile": true,
                            "size": entry.size,
                            "lmdt": entry.lastModifiedDate,
                            "path": entry.fullPath
                          });
                        }, function(err) {
                          console.log("Error reading entry " + entry.name);
                        }
                      );
                    }
                  }
                }); // jshint ignore:line
                fileWorkers.push(filePromise);
              }
            }
            Promise.all(fileWorkers).then(function(values) {
              if (values.length > 0) {
                anotatedDirList = anotatedDirList.concat(values);
              }
              resolve(anotatedDirList);
            });
          },
          function(err) {
            reject(err);
          }
        );
      }, function(err) {
        reject(err);
      }
      );
    });
  }

  function listDirectory(dirPath, callback, fs) {
    TSCORE.showLoadingAnimation();

    // directory path format DCIM/Camera/ !
    dirPath = dirPath + "/"; // TODO make it platform independent
    dirPath = normalizePath(dirPath);

    console.log("Listing directory: " + dirPath);
    var rootFS = fs || fsRoot;
    rootFS.getDirectory(dirPath, {
        create: false,
        exclusive: false
      },
      function(dirEntry) {
        var directoryReader = dirEntry.createReader();
        var anotatedDirList = [];
        var pendingCallbacks = 0;
        // Get a list of all the entries in the directory
        directoryReader.readEntries(
          function(entries) {
            var i;
            var normalizedPath;
            for (i = 0; i < entries.length; i++) {
              if (entries[i].isFile) {
                pendingCallbacks++;
                entries[i].file(
                  function(entry) {
                    if (!entry.fullPath) {
                      entry.fullPath = resolveFullPath(entry.localURL);
                    }
                    anotatedDirList.push({
                      "name": entry.name,
                      "isFile": true,
                      "size": entry.size,
                      "lmdt": entry.lastModifiedDate,
                      "path": entry.fullPath
                    });
                    pendingCallbacks--;
                    console.log("File: " + entry.name + " Size: " + entry.size + " i:" + i + " Callb: " + pendingCallbacks);
                    if (pendingCallbacks === 0 && i === entries.length) {
                      if (callback) {
                        callback(anotatedDirList);
                      } else {
                        TSPOSTIO.listDirectory(anotatedDirList);
                      }
                    }
                  }, // jshint ignore:line
                  function(error) { // error get file system
                    TSCORE.hideLoadingAnimation();
                    console.error("listDirectory error: " + JSON.stringify(error));
                    pendingCallbacks--;
                    if (pendingCallbacks === 0 && i === entries.length) {
                      if (callback) {
                        callback(anotatedDirList);
                      } else {
                        TSPOSTIO.listDirectory(anotatedDirList);
                      }
                    }
                  } // jshint ignore:line
                ); // jshint ignore:line
              } else {
                normalizedPath = normalizePath(entries[i].fullPath);
                anotatedDirList.push({
                  "name": entries[i].name,
                  "isFile": false,
                  "size": "",
                  "lmdt": "",
                  "path": normalizedPath
                });
                console.log("Dir: " + entries[i].name + " I:" + i + " Callb: " + pendingCallbacks);
                if ((pendingCallbacks === 0) && ((i + 1) == entries.length)) {
                  if (callback) {
                    callback(anotatedDirList);
                  } else {
                    TSPOSTIO.listDirectory(anotatedDirList);
                  }
                }
              }
            }
            if (pendingCallbacks === 0) {
              if (callback) {
                callback(anotatedDirList);
              } else {
                TSPOSTIO.listDirectory(anotatedDirList);
              }
            }
            //console.log("Dir content: " + JSON.stringify(entries));
          },
          function(error) { // error get file system
            TSCORE.hideLoadingAnimation();
            TSPOSTIO.errorOpeningPath(dirPath);
            console.error("Dir List Error: " + error.code);
            if (callback) {
              callback(anotatedDirList);
            }
          }
        );
      },
      function(error) {
        TSCORE.hideLoadingAnimation();
        TSPOSTIO.errorOpeningPath(dirPath);
        console.error("Getting dir: " + dirPath + " failed with error code: " + error.code);
        if (callback) {
          callback(anotatedDirList);
        }
      }
    );
  }

  function listSubDirectories(dirPath) {
    console.log("Listing sub directories of: " + dirPath);
    // directory path format DCIM/Camera/ !
    if (dirPath.lastIndexOf("/") === 0 || dirPath.lastIndexOf("/")  != dirPath.length - 1) {
      dirPath = dirPath + "/"; // TODO make it platform independent
    }

    dirPath = normalizePath(dirPath);
    console.log("Listing sub directories of : " + dirPath + " normalized.");
    TSCORE.showLoadingAnimation();

    fsRoot.getDirectory(dirPath, {
        create: false,
        exclusive: false
      },
      function(dirEntry) {
        var directoryReader = dirEntry.createReader();

        // Get a list of all the entries in the directory
        directoryReader.readEntries(
          function(entries) {
            var i;
            var anotatedDirList = [];
            for (i = 0; i < entries.length; i++) {
              if (entries[i].isDirectory) {
                anotatedDirList.push({
                  "name": entries[i].name,
                  "path": entries[i].fullPath
                });
              }
            }
            //console.log("Dir content: " + JSON.stringify(entries));
            TSPOSTIO.listSubDirectories(anotatedDirList, dirPath);
          },
          function(error) { // error get file system
            //TSPOSTIO.errorOpeningPath(dirPath);
            TSCORE.hideLoadingAnimation();
            console.error("Listing sub directories failed: " + error.code);
          }
        );
      },
      function(error) {
        //TSPOSTIO.errorOpeningPath(dirPath);
        TSCORE.hideLoadingAnimation();
        console.error("Getting sub directories of : " + dirPath + " failed: " + error.code);
      }
    );
  }

  function getDirectoryMetaInformation(dirPath, readyCallback) {
    console.log("getDirectoryMetaInformation directory: " + dirPath);
    dirPath = dirPath + "/"; // TODO make it platform independent
    dirPath = normalizePath(dirPath);
    var anotatedDirList = [];

    fsRoot.getDirectory(dirPath, {
        create: false,
        exclusive: false
      },
      function(dirEntry) {
        var directoryReader = dirEntry.createReader();
        directoryReader.readEntries(
          function(entries) {
            var i;
            var normalizedPath;
            for (i = 0; i < entries.length; i++) {
              if (entries[i].isFile) {
                entries[i].file(
                  function(entry) {
                    if (!entry.fullPath) {
                      entry.fullPath = resolveFullPath(entry.localURL);
                    }
                    anotatedDirList.push({
                      "name": entry.name,
                      "isFile": true,
                      "size": entry.size,
                      "lmdt": entry.lastModifiedDate,
                      "path": entry.fullPath
                    });
                    TSCORE.metaFileList = (anotatedDirList);
                  }, // jshint ignore:line
                  function(error) { // error get file system
                    TSCORE.hideLoadingAnimation();
                    console.error("listDirectory error: " + JSON.stringify(error));
                  } // jshint ignore:line
                ); // jshint ignore:line
              }
            }
            if (readyCallback) {
              readyCallback(anotatedDirList);
            }
          },
          function(error) {
            TSCORE.hideLoadingAnimation();
            console.warn("Error reading dir entries: " + error.code);
            if (readyCallback) {
              readyCallback(anotatedDirList);
            }
          }
        );
      },
      function(err) {
        TSCORE.hideLoadingAnimation();
        console.warn("error getting directory: " + err);
        if (readyCallback) {
          readyCallback(anotatedDirList);
        }
      }
    );
  }


  function getPropertiesPromise(filePath) {
    return new Promise(function(resolve, reject) {
        filePath = normalizePath(filePath);
      //getFileSystemPromise(dir).then(function(fileSystem) {
        var fileProperties = {};
        fsRoot.getFile(filePath, {
            create: false,
            exclusive: false
          },
          function(entry) {
            if (entry.isFile) {
              entry.file(
                function(file) {
                  fileProperties.path = entry.fullPath;
                  fileProperties.size = file.size;
                  fileProperties.lmdt = file.lastModifiedDate;
                  fileProperties.mimetype = file.type;
                  resolve(fileProperties);
                },
                function() {
                  reject("Error retrieving file properties of " + filePath);
                }
              );
            } else {
              reject("Error getting file properties. " + filePath + " is directory");
            }
          },
          function() {
            reject("error getting file");
          }
        );
      });
    //});
  }

  function getFileProperties(filePath) {
    getPropertiesPromise(filePath).then(function(fileProperties) {
      TSPOSTIO.getFileProperties(fileProperties);
    }).catch(function(error) {
      TSCORE.hideLoadingAnimation();
      console.error(error);
    });
  }


  function loadTextFile(filePath, isPreview) {
    console.log("Loading file: " + filePath);
    TSCORE.showLoadingAnimation();
    getFileContentPromise(filePath, "text").then(function(text) {
      if (isPreview) {
        text = text.slice(0, 10000);
      }
      TSPOSTIO.loadTextFile(text);
    }).catch(function(error) {
      TSCORE.hideLoadingAnimation();
      console.error(error);
    });
  }

  function getFile(fullPath, result, fail) {
    var filePath = normalizePath(fullPath);

    fsRoot.getFile(filePath, {create: false},
      function(fileEntry) {
        fileEntry.file(function(file) {
          result(file);
        }, fail);
      },
      fail
    );
  }

  function getFileContent(fullPath, result, error) {
    getFile(fullPath, function(file) {
      var reader = new FileReader();
      reader.onerror = function() {
        error(reader.error);
      };
      reader.onload = function() {
        result(reader.result);
      };
      reader.readAsArrayBuffer(file);
    }, error);
  }

  function getFilePromise(filePath, resolvePath) {
    return new Promise(function(resolve, reject) {
      if (resolvePath) {
        getFileSystemPromise(resolvePath).then(function(resfs) {
          resfs.getFile(filePath, {create: false},
            function(fileEntry) {
              fileEntry.file(resolve, reject);
            },
            reject
          );
        }).catch(reject);
      } else {
        getFile(filePath, resolve, reject);
      }
    });
  }

  function getFileContentPromise(filePath, type, resolvePath) {
    return new Promise(function(resolve, reject) {
      getFilePromise(filePath, resolvePath).then(function(file) {
        var reader = new FileReader();
        reader.onerror = function() {
          reject(reader.error);
        };
        reader.onload = function() {
          resolve(reader.result);
        };
        if (type === "text") {
          reader.readAsText(file);
        } else {
          reader.readAsArrayBuffer(file);
        }
      }, reject);
    });
  }


  function saveFilePromise(filePath, content, overWrite) {
    console.log("Saving file: " + filePath);
    return new Promise(function(resolve, reject) {
      var isFileNew = true;
      filePath = normalizePath(filePath);
      // Checks if the file already exists
      fsRoot.getFile(filePath, {
            create: false,
            exclusive: false
          },
          function(entry) {
            if (entry.isFile) {
              isFileNew = false;
            }
          },
          function() {}
      );
      if (isFileNew || overWrite === true) {
        fsRoot.getFile(filePath, {
            create: true,
            exclusive: false
          },
          function(entry) {
            entry.createWriter(
              function(writer) {
                writer.onwriteend = function(evt) {
                  //resolve(fsRoot.fullPath + "/" + filePath);
                  resolve(isFileNew);
                };
                writer.write(content);
              },
              function() {
                reject("error creating writter file: " + filePath);
              }
            );
          },
          function() {
            reject("Error getting file entry: " + filePath);
          }
        );
      } else {
        var errMsg = $.i18n.t("ns.common:fileExists", {fileName:filePath});
        TSCORE.showAlertDialog(errMsg);
        reject(errMsg);
      }
    });
  }

  function saveTextFilePromise(filePath, content, overWrite) {
    console.log("Saving file: " + filePath);
    // Handling the UTF8 support for text files
    var UTF8_BOM = "\ufeff";
    if (content.indexOf(UTF8_BOM) === 0) {
      console.log("Content beging with a UTF8 bom");
    } else {
      content = UTF8_BOM + content;
    }
    return saveFilePromise(filePath, content, overWrite);
  }

  function saveBinaryFilePromise(filePath, content, overWrite) {
    console.log("Saveing binary file: " + filePath);
    var dataView = new Int8Array(content);
    return saveFilePromise(filePath, content, overWrite);
  }

  function saveTextFile(filePath, content, overWrite, silentMode) {
    console.log("Saving file: " + filePath);
    TSCORE.showLoadingAnimation();

    // Handling the UTF8 support for text files
    var UTF8_BOM = "\ufeff";

    if (content.indexOf(UTF8_BOM) === 0) {
      console.log("Content beging with a UTF8 bom");
    } else {
      content = UTF8_BOM + content;
    }

    saveFilePromise(filePath, content, overWrite).then(function(isFileNew) {
      if (!silentMode) {
        TSPOSTIO.saveTextFile(filePath, isFileNew);
      }
    }).catch(function(error) {
      TSCORE.hideLoadingAnimation();
      console.log(error);
    });
  }

  function saveBinaryFile(filePath, content, overWrite, silentMode) {
    TSCORE.showLoadingAnimation();
    var dataView = new Int8Array(content);
    saveFilePromise(filePath, dataView.buffer, overWrite).then(function(isFileNew) {
      if (!silentMode) {
        TSPOSTIO.saveBinaryFile(filePath);
      }
    }).catch(function(error) {
      TSCORE.hideLoadingAnimation();
      console.log(error);
    });
  }


  function createDirectoryPromise(dirPath) {
    console.log("Creating directory: " + dirPath);
    return new Promise(function(resolve, reject) {
      dirPath = normalizePath(dirPath);
      fsRoot.getDirectory(dirPath, {
          create: true,
          exclusive: false
        },
        function(dirEntry) {
          resolve(dirPath);
        },
        function(error) {
          reject("Creating directory failed: " + dirPath + " failed with error code: " + error.code);
        }
      );
    });
  }

  function createDirectory(dirPath, silentMode) {
    createDirectoryPromise(dirPath).then(function() {
      if (!silentMode) {
        TSPOSTIO.createDirectory(dirPath);
      }
    }).catch(function(error) {
      TSCORE.hideLoadingAnimation();
      console.error(error);
    });
  }

  function createMetaFolder(dirPath) {
    if (dirPath.lastIndexOf(TSCORE.metaFolder) >= dirPath.length - TSCORE.metaFolder.length) {
      console.log("Can not create meta folder in a meta folder");
      return;
    }

    var metaDirPath = dirPath + TSCORE.dirSeparator + TSCORE.metaFolder;
    createDirectoryPromise(metaDirPath).then(function() {
      console.log("Metafolder created: " + metaDirPath);
    }).catch(function(error) {
      TSCORE.hideLoadingAnimation();
      console.error(error);
    });
  }


  function copyFilePromise(filePath, newFilePath) {
    return new Promise(function(resolve, reject) {
      filePath = normalizePath(filePath);
      var newFileName = newFilePath.substring(newFilePath.lastIndexOf('/') + 1);
      var newFileParentPath = normalizePath(newFilePath.substring(0, newFilePath.lastIndexOf('/')));
      // TODO check if the newFilePath exist or causes issues by copying
      fsRoot.getDirectory(newFileParentPath, {
          create: false,
          exclusive: false
        },
        function(parentDirEntry) {
          fsRoot.getFile(filePath, {
              create: false,
              exclusive: false
            },
            function(entry) {
              entry.copyTo(
                parentDirEntry,
                newFileName,
                function() {
                  console.log("File copy: target: " + newFilePath + " source: " + entry.fullPath);
                  resolve(newFilePath);
                },
                function() {
                  reject("error copying: " + filePath);
                }
              );
            },
            function() {
              reject("Error getting file: " + filePath);
            }
          );
        },
        function(error) {
          reject("Getting dir: " + newFileParentPath + " failed with error code: " + error.code);
        }
      );
    });
  }

  function copyFile(filePath, newFilePath) {
    copyFilePromise(filePath, newFilePath).then(function(newFilePath) {
      TSPOSTIO.copyFile(filePath, newFilePath);
    }).catch(function(error) {
      TSCORE.hideLoadingAnimation();
      console.log(error);
    });
  }


  function renameFilePromise(filePath, newFilePath) {
    return new Promise(function(resolve, reject) {

      filePath = normalizePath(filePath);
      var newFileName = newFilePath.substring(newFilePath.lastIndexOf('/') + 1);
      var newFileParentPath = normalizePath(newFilePath.substring(0, newFilePath.lastIndexOf('/') + 1));
      console.log("renameFile: " + newFileName + " newFilePath: " + newFilePath);
      // TODO check if the newFilePath exist or causes issues by renaming
      fsRoot.getDirectory(newFileParentPath, {
          create: false,
          exclusive: false
        },
        function(parentDirEntry) {
          fsRoot.getFile(filePath, {
              create: false,
              exclusive: false
            },
            function(entry) {
              entry.moveTo(
                parentDirEntry,
                newFileName,
                function() {
                  console.log("File renamed to: " + newFilePath + " Old name: " + entry.fullPath);
                  resolve(newFilePath);
                },
                function() {
                  reject("error renaming: " + filePath);
                }
              );
            },
            function() {
              reject("Error getting file: " + filePath);
            }
          );
        },
        function(error) {
          console.error("Getting dir: " + newFileParentPath + " failed with error code: " + error.code);
          reject(error);
        }
      );
    });
  }

  function renameFile(filePath, newFilePath) {
    renameFilePromise(filePath, newFilePath).then(function() {
      TSPOSTIO.renameFile(filePath, newFilePath);
    }).catch(function(error) {
      TSCORE.hideLoadingAnimation();
      console.error(error);
    });
  }


  function renameDirectoryPromise(dirPath, newDirName) {
    return new Promise(function(resolve, reject) {

      var newDirPath = TSCORE.TagUtils.extractParentDirectoryPath(dirPath) + TSCORE.dirSeparator + newDirName;
      TSCORE.showLoadingAnimation();

      dirPath = normalizePath(dirPath);
      var newDirParentPath = normalizePath(newDirPath.substring(0, newDirPath.lastIndexOf('/')));
      console.log("renameDirectoryPromise: " + dirPath + "to: " + newDirPath);
      // TODO check if the newFilePath exist or cause issues by renaming
      fsRoot.getDirectory(newDirParentPath, {
          create: false,
          exclusive: false
        },
        function(parentDirEntry) {
          fsRoot.getDirectory(dirPath, {
              create: false,
              exclusive: false
            },
            function(entry) {
              entry.moveTo(
                parentDirEntry,
                newDirName,
                function() {
                  console.log("Directory renamed to: " + newDirPath + " Old name: " + entry.fullPath);
                  resolve(newDirPath);
                },
                function() {
                  reject("error renaming: " + dirPath);
                }
              );
            },
            function() {
              reject("Error getting directory: " + dirPath);
            }
          );
        },
        function(error) {
          console.error("Getting dir: " + newDirParentPath + " failed with error code: " + error.code);
          reject(error);
        }
      );
    });
  }

  function renameDirectory(dirPath, newDirName) {
    renameDirectoryPromise(dirPath, newDirName).then(function(newDirPath) {
      TSPOSTIO.renameDirectory(dirPath, newDirPath);
    }).catch(function(error) {
      TSCORE.hideLoadingAnimation();
      console.error(error);
    });
  }


  function deleteFilePromise(filePath) {
    return new Promise(function(resolve, reject) {
      var path = normalizePath(filePath);
      fsRoot.getFile(path, {
          create: false,
          exclusive: false
        },
        function(entry) {
          entry.remove(
            function() {
              console.log("file deleted: " + path);
              resolve(filePath);
            },
            function() {
              reject("error deleting: " + filePath);
            }
          );
        },
        function() {
          reject("error getting file");
        }
      );
    });
  }

  function deleteElement(filePath) {
    deleteFilePromise(filePath).then(function() {
      TSPOSTIO.deleteElement(filePath);
    }).catch(function(error) {
      TSCORE.hideLoadingAnimation();
      console.error(error);
    });
  }


  function deleteDirectoryPromise(dirPath) {
    console.log("Deleting directory: " + dirPath);
    return new Promise(function(resolve, reject) {
      var path = normalizePath(dirPath);

      fsRoot.getDirectory(path, {
          create: false,
          exclusive: false
        },
        function(entry) {
          entry.remove(
            function() {
              console.log("file deleted: " + path);
              resolve(dirPath);
            },
            function() {
              //TSCORE.hideLoadingAnimation();
              //TSPOSTIO.deleteDirectoryFailed(path);
              reject("error deleting dir: " + dirPath);
            }
          );
        },
        function() {
          reject("error getting directory");
        }
      );
    });
  }

  function deleteDirectory(dirPath) {
    TSCORE.showLoadingAnimation();
    deleteDirectoryPromise(dirPath).then(function() {
      TSPOSTIO.deleteDirectory(dirPath);
    }).catch(function(error) {
      TSCORE.hideLoadingAnimation();
      TSPOSTIO.deleteDirectoryFailed(dirPath);
      console.error(error);
    });
  }


  function selectDirectory() {
    console.log("Open select directory dialog.");
    TSCORE.showDirectoryBrowserDialog(fsRoot.fullPath);
  }

  function selectFile() {
    //
    console.log("Operation selectFile not supported.");
  }


  function openDirectory(dirPath) {
    //
    TSCORE.showAlertDialog($.i18n.t("ns.dialogs:openContainingDirectoryAlert"));
  }

  function openFile(filePath) {
    console.log("Opening natively: " + filePath);
    window.plugins.fileOpener.open(filePath);
  }

  // Platform specific API calls
  exports.saveSettings = saveSettings;
  exports.loadSettings = loadSettings;
  exports.saveSettingsTags = saveSettingsTags;
  exports.loadSettingsTags = loadSettingsTags;
  exports.sendFile = sendFile;

  // Platform API
  exports.checkNewVersion = checkNewVersion;
  exports.focusWindow = focusWindow;
  exports.handleStartParameters = handleStartParameters;

  exports.createDirectoryIndex = createDirectoryIndex;
  exports.createDirectoryTree = createDirectoryTree;

  exports.listDirectoryPromise = listDirectoryPromise;
  exports.listDirectory = listDirectory; /** @deprecated */
  exports.listSubDirectories = listSubDirectories; /** @deprecated */
  exports.getDirectoryMetaInformation = getDirectoryMetaInformation;

  exports.getPropertiesPromise = getPropertiesPromise;
  exports.getFileProperties = getFileProperties; /** @deprecated */

  //exports.loadTextFilePromise = loadTextFilePromise;
  exports.loadTextFile = loadTextFile;
  exports.getFile = getFile; // export ??
  exports.getFileContent = getFileContent;
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
