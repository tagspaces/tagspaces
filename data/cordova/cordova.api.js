/* Copyright (c) 2012-2015 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */
/* global define */
//cordova ios handleOpenURL is global
var handleOpenURL; // jshint ignore:line

/**
 * A implementation of the IOAPI for the Chrome/Chromium extensions platform
 * @class Cordova
 * @memberof IOAPI
 */
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
      path = (isCordovaiOS) ? cordova.file.applicationDirectory + "/" + path : "file:///" + path;
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

  /**
   * Creates recursively a tree structure for a given directory path
   * @name generateDirectoryTree
   * @method
   * @memberof IOAPI.Cordova
   * @param {string} entries - //TODO
   */
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

  /**
   * Checks if new version is available
   * @name checkNewVersion
   * @method
   * @memberof IOAPI.Cordova
   */
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

  /**
   *Bring the TagSpaces window on top of the windows
   *@name focusWindow
   *mthod
   *@memberof IOAPI.Cordova
   */
  function focusWindow() {
    // Bring the TagSpaces window on top of the windows
    console.log("Focusing window is not implemented in cordova.");
  }
  //TODO
  function handleStartParameters() {
    if (urlFromIntent !== undefined && urlFromIntent.length > 0) {
      console.log("Intent URL: " + urlFromIntent);
      var filePath = decodeURIComponent(urlFromIntent);
      TSCORE.FileOpener.openFileOnStartup(filePath);
    }
  }

  /**
   * Creates recursively a tree structure for a given directory path
   * @name createDirectoryTree
   * @method
   * @memberof IOAPI.Cordova
   * @param {string} dirPath - the full path of the directory for which the tree will be generated
   */
  function createDirectoryTree(dirPath) {
    // TODO
    TSCORE.hideLoadingAnimation();
    TSCORE.showAlertDialog("Creating directory tree is not supported in Cordova yet.");
  }

  /**
   * Creates a list with containing the files and the sub directories of a given directory
   * @name listDirectoryPromise
   * @method
   * @memberof IOAPI.Cordova
   * @param {string} path - the directory path for which the list will be created
   * @param {boolean} lite - if true the path to a file thumbnails will be not included in the results
   * This will increase the performance of the function.
   * @returns {Promise.<Success, Error>}
   */
  function listDirectoryPromise(path, lite) {
    console.time("listDirectoryPromise");
    return new Promise(function(resolve, reject) {
      var anotatedDirList = [];
      var fileWorkers = [];
      getFileSystemPromise(path).then(function(fileSystem) {
        var reader = fileSystem.createReader();
        reader.readEntries(
          function(entries) {
            entries.forEach(function(entry) {
              if (entry.isDirectory) {
                anotatedDirList.push({
                  "name": entry.name,
                  "path": entry.fullPath,
                  "isFile": false,
                  "size": "",
                  "lmdt": ""
                });
              } else if (entry.isFile) {
                if (lite) {
                  anotatedDirList.push({
                    "name": entry.name,
                    "path": entry.fullPath,
                    "isFile": true,
                    "size": "",
                    "lmdt": ""
                  });
                } else {
                  var filePromise = Promise.resolve({
                    then: function(onFulfill, onReject) {
                      entry.file(
                        function(fileEntry) {
                          if (!fileEntry.fullPath) {
                            fileEntry.fullPath = resolveFullPath(fileEntry.localURL);
                          }
                          anotatedDirList.push();
                          onFulfill({
                            "name": fileEntry.name,
                            "isFile": true,
                            "size": fileEntry.size,
                            "lmdt": fileEntry.lastModifiedDate,
                            "path": fileEntry.fullPath
                          });
                        },
                        function(err) {
                          onReject("Error reading entry " + path);
                        });
                    }
                  }); // jshint ignore:line
                  fileWorkers.push(filePromise);
                }
              }
            });

            Promise.all(fileWorkers).then(function(entries) {
              entries.forEach(function(entry) {
                anotatedDirList.push(entry);
              });
              console.timeEnd("listDirectoryPromise");
              resolve(anotatedDirList);
            }, function(err) {
              console.warn("At least one file worker failed for " + path + "err " + JSON.stringify(err));
              console.timeEnd("listDirectoryPromise");
              resolve(anotatedDirList);  // returning results even if any promise fails
            });

          }, function(err) {
            console.warn("Error reading entries promise from " + path + "err " + JSON.stringify(err));
            resolve(anotatedDirList);  // returning results even if any promise fails
          }
        );
      }, function() {
        console.warn("Error getting file system promise");
        resolve(anotatedDirList);  // returning results even if any promise fails
      }
      );
    });
  }

  /**
   * Finds out the properties of a file or directory such last modification date or file size
   * @name getPropertiesPromise
   * @method
   * @memberof IOAPI.Cordova
   * @param {string} filePath - full path to the file or the directory, which will be analysed
   * @returns {Promise.<Success, Error>}
   */
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
            reject("error getting file " + filePath);
          }
        );
      });
    //});
  }

  /**
   * Load the content of a text file
   * @name loadTextFilePromise
   * @method
   * @memberof IOAPI.Cordova
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
   * @memberof IOAPI.Cordova
   * @param {string} fullPath - the full path of the file which will be loaded
   * @param {string} type - the type of the XHR response, defaul is *arraybuffer*
   * @returns {Promise.<Success, Error>}
   */
  function getFileContentPromise(filePath, type, resolvePath) {
    // TODO refactor
    var getFilePromise = function(filePath, resolvePath) {

      var getFile = function(fullPath, result, fail) {
        var filePath = normalizePath(fullPath);

        fsRoot.getFile(filePath, {create: false},
          function(fileEntry) {
            fileEntry.file(function(file) {
              result(file);
            }, fail);
          },
          fail
        );
      };

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
    };

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

  /**
   * Persists a given content(binary supported) to a specified filepath
   * @name saveFilePromise
   * @method
   * @memberof IOAPI.Cordova
   * @param {string} filePath - the full path of the file which should be saved
   * @param {string} content - content that will be saved
   * @param {boolean} overWrite - if true existing file path will be overwritten
   * @returns {Promise.<Success, Error>}
   */
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

  /**
   * Persists a given text content to a specified filepath
   * @name saveTextFilePromise
   * @method
   * @memberof IOAPI.Cordova
   * @param {string} filePath - the full path of the file which will be saved
   * @param {string} content - content that will be saved
   * @param {string} overWrite - if true existing file path will be overwritten
   * @returns {Promise.<Success, Error>}
   */
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

  /**
   * Persists a given binary content to a specified filepath
   * @name saveBinaryFilePromise
   * @method
   * @memberof IOAPI.Cordova
   * @param {string} filePath - the full path of the file which will be saved
   * @param {string} content - content that will be saved
   * @param {string} overWrite - if true existing file path will be overwritten
   * @returns {Promise.<Success, Error>}
   */
  function saveBinaryFilePromise(filePath, content, overWrite) {
    console.log("Saveing binary file: " + filePath);
    var dataView = new Int8Array(content);
    return saveFilePromise(filePath, dataView, overWrite);
  }

  /**
   * Creates a directory
   * @name createDirectoryPromise
   * @method
   * @memberof IOAPI.Cordova
   * @param {string} dirPath - the full path of the folder which will be created
   * @returns {Promise.<Success, Error>}
   */
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

  /**
   * Copies a given file to a specified location
   * @name copyFilePromise
   * @method
   * @memberof IOAPI.Cordova
   * @param {string} filePath - the full path of a file which will be copied
   * @param {string} newFilePath - the full path destination of the copied file
   * @returns {Promise.<Success, Error>}
   */
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

  /**
   * Renames a given file
   * @name renameFilePromise
   * @method
   * @memberof IOAPI.Cordova
   * @param {string} filePath - the full path of the file which will be renamed
   * @param {string} newFilePath - the desired full path after the file rename
   * @returns {Promise.<Success, Error>}
   */
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
                  resolve([filePath, newFilePath]);
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

  /**
   * Rename a directory
   * @name renameDirectoryPromise
   * @method
   * @memberof IOAPI.Cordova
   * @param {string} dirPath - the full path of the directory which will be renamed
   * @param {string} newDirName - the desired full path after the directory rename
   * @returns {Promise.<Success, Error>}
   */
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

  /**
   * Delete a specified file
   * @name deleteFilePromise
   * @method
   * @memberof IOAPI.Cordova
   * @param {string} filePath - the full path of the file which will be deleted
   * @returns {Promise.<Success, Error>}
   */
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

  /**
   * Delete a specified directory, the directory should be empty, if the trash can functionality is not enabled
   * @name deleteDirectoryPromise
   * @method
   * @memberof IOAPI.Cordova
   * @param {string} dirPath - the full path of the directory which will be deleted
   * @returns {Promise.<Success, Error>}
   */
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
          reject("error getting directory " + dirPath);
        }
      );
    });
  }

  /**
   * Selects a directory with the help of a directory chooser
   * @name selectDirectory
   * @method
   * @memberof IOAPI.Cordova
   */
  function selectDirectory() {
    console.log("Open select directory dialog.");
    TSCORE.showDirectoryBrowserDialog(fsRoot.fullPath);
  }

  /**
   * Selects a file with the help of a file chooser
   * @name selectFile
   * @method
   * @memberof IOAPI.Cordova
   */
  function selectFile() {
    //
    console.log("Operation selectFile not supported.");
  }

  /**
   * Opens a directory in the operating system's default file manager
   * @name openDirectory
   * @method
   * @memberof IOAPI.Cordova
   * @param {string} dirPath - the full path of the directory which will be opened
   * @returns {Promise.<Success, Error>}
   */
  function openDirectory(dirPath) {

    TSCORE.showAlertDialog($.i18n.t("ns.dialogs:openContainingDirectoryAlert"));
  }

  /**
   * Opens a file with the operating system's default program for the type of the file
   * @name openFile
   * @method
   * @memberof IOAPI.Cordova
   * @param {string} filePath - the full path of the file which will be opened
   */
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
