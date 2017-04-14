/* Copyright (c) 2012-2016 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */

const fs = require('fs-extra'); // jshint ignore:line
const pathUtils = require('path'); // jshint ignore:line
const electron = require('electron'); // jshint ignore:line
const remote = electron.remote; // jshint ignore:line
const ipcRenderer = require('electron').ipcRenderer; // jshint ignore:line

/**
 * A implementation of the IOAPI for the electron platform
 * @class Electron
 * @memberof IOAPI
 */
define(function(require, exports, module) {
  "use strict";

  console.log("Loading electron.api.js..");

  //console.log("CM Args: " + JSON.stringify(process.argv));

  var TSCORE = require("tscore");
  var TSPOSTIO = require("tspostioapi");
  var fsWatcher;
  var win = remote.getCurrentWindow();

  var showMainWindow = function() {
    win.show();
  };

  // Experimental functionality
  function watchDirectory(dirPath, listener) {
    stopWatchingDirectories();
    fsWatcher = fs.watch(dirPath, {persistent: true, recursive: false}, listener);
  }

  function stopWatchingDirectories() {
    if (fsWatcher) {
      fsWatcher.close();
    }
  }

  function handleStartParameters() {
    var filePath = TSCORE.Utils.getURLParameter("open");
    if (filePath && filePath.length) {
      filePath = decodeURIComponent(filePath);
      console.log("Opening file from command line: " + filePath);
      TSCORE.FileOpener.openFileOnStartup(filePath);
    }
  }

  function initMainMenu() {
    var Menu = remote.Menu;
    var template = [
      {
        label: $.i18n.t("ns.common:file"),
        submenu: [
          {
            label: $.i18n.t("ns.common:openNewInstance"),
            accelerator: '',
            click: function() {
              ipcRenderer.send("new-win", "newWin");
            }
          },
          {
            type: 'separator'
          },
          {
            label: $.i18n.t("ns.common:createFile"),
            accelerator: '',
            click: TSCORE.UI.createTXTFile
          },
          {
            label: $.i18n.t("ns.common:createMarkdown"),
            accelerator: '',
            click: TSCORE.UI.createMDFile
          },
          {
            label: $.i18n.t("ns.common:createRichTextFile"),
            accelerator: '',
            click: TSCORE.UI.createHTMLFile
          },
          /*{
            label: $.i18n.t("ns.common:createAudioFile"),
            accelerator: '',
            click: TSCORE.UI.showAudioRecordingDialog
          },*/
          {
            type: 'separator'
          },
          {
            label: $.i18n.t("ns.common:createDirectory"),
            accelerator: '',
            click: function() {
              if (!TSCORE.currentPath) {
                TSCORE.showAlertDialog("Not open current directory !");
              } else {
                TSCORE.showCreateDirectoryDialog(TSCORE.currentPath);
              }
            }
          },
          {
            type: 'separator'
          },
          {
            label: $.i18n.t("ns.common:saveFile"),
            accelerator: 'CmdOrCtrl+S',
            click: function() {
              if (TSCORE.FileOpener.isFileEdited) {
                TSCORE.FileOpener.saveFile();
              }
            }
          },
          {
            type: 'separator'
          },
          {
            label: $.i18n.t("ns.common:closeWin"),
            accelerator: '',
            click: function() {
              TSCORE.Config.saveSettings();
              win.destroy();
            }
          },
          {
            label: $.i18n.t("ns.common:exitApp"),
            accelerator: '',
            click: function() {
              //TSCORE.Config.saveSettings();
              ipcRenderer.send('quit-application', 'Bye, bye...');
            }
          }
        ]
      },
      {
        label: $.i18n.t("ns.common:edit"),
        submenu: [
          {
            label: $.i18n.t("ns.common:undo"),
            accelerator: 'CmdOrCtrl+Z',
            role: 'undo'
          },
          {
            label: $.i18n.t("ns.common:redo"),
            accelerator: 'Shift+CmdOrCtrl+Z',
            role: 'redo'
          },
          {
            type: 'separator'
          },
          {
            label: $.i18n.t("ns.common:cut"),
            accelerator: 'CmdOrCtrl+X',
            role: 'cut'
          },
          {
            label: $.i18n.t("ns.common:copy"),
            accelerator: 'CmdOrCtrl+C',
            role: 'copy'
          },
          {
            label: $.i18n.t("ns.common:paste"),
            accelerator: 'CmdOrCtrl+V',
            role: 'paste'
          },
          {
            label: $.i18n.t("ns.common:selectAll"),
            accelerator: 'CmdOrCtrl+A',
            role: 'selectall'
          },
        ]
      },
      {
        label: $.i18n.t("ns.common:view"),
        submenu: [
          {
            label: $.i18n.t("ns.common:reloadApplication"),
            accelerator: 'F5',
            click: function(item, focusedWindow) {
              ipcRenderer.send('relaunch-app', 'relaunch');
            }
          },
          {
            label: $.i18n.t("ns.common:showTagLibraryTooltip") + " (" + TSCORE.Config.getShowTagLibraryKeyBinding() + ")",
            click: function() {
              TSCORE.UI.showTagsPanel();
            }
          },
          {
            label: $.i18n.t("ns.common:showLocationNavigatorTooltip") + " (" + TSCORE.Config.getShowFolderNavigatorBinding() + ")",
            click: function() {
              TSCORE.UI.showLocationsPanel();
            }
          },
          {
            label: $.i18n.t("ns.common:toggleFullScreen"),
            accelerator: (function() {
              if (process.platform == 'darwin') {
                return 'Ctrl+Command+F';
              } else {
                return 'F11';
              }
            })(),
            click: function(item, focusedWindow) {
              focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
            }
          },
          {
            label: $.i18n.t("ns.common:showDevTools"),
            accelerator: TSCORE.Config.getOpenDevToolsScreenKeyBinding().toUpperCase(),
            click: function() {
              win.toggleDevTools();
            }
          },
          {
            label: $.i18n.t("ns.common:settings"),
            click: function() {
              TSCORE.UI.showOptionsDialog();
            }
          },
        ]
      },
      {
        label: $.i18n.t("ns.common:help"),
        submenu: [
          {
            accelerator: "F1",
            label: $.i18n.t("ns.common:documentation"),
            click: function() {
              TSCORE.UI.showDocumentation();
            }
          },
          {
            label: $.i18n.t("ns.common:startingHints"),
            click: function() {
              TSCORE.UI.startGettingStartedTour();
            }
          },
          {
            label: $.i18n.t("ns.common:shortcutKeys"),
            click: function() {
              TSCORE.UI.showKeysDialog();
            }
          },
          {
            label: $.i18n.t("ns.common:whatsNew"),
            click: function() {
              TSCORE.UI.whatsNew();
            }
          },
          {
            type: 'separator'
          },
          {
            label: $.i18n.t("ns.common:likeUsOnFacebook"),
            click: function() {
              TSCORE.UI.openFacebook();
            }
          },
          {
            label: $.i18n.t("ns.common:joinOnGooglePlus"),
            click: function() {
              TSCORE.UI.openGooglePlus();
            }
          },
          {
            label: $.i18n.t("ns.common:followOnTwitter"),
            click: function() {
              TSCORE.UI.openTwitter();
            }
          },
          {
            type: 'separator'
          },
          {
            label: $.i18n.t("ns.common:suggestNewFeatures"),
            click: function() {
              TSCORE.UI.suggestNewFeatures();
            }
          },
          {
            label: $.i18n.t("ns.common:reportIssues"),
            click: function() {
              TSCORE.UI.reportIssues();
            }
          },
          {
            type: 'separator'
          },
          {
            label: $.i18n.t("ns.common:license"),
            click: function() {
              TSCORE.UI.showLicenseDialog();
            }
          },
          {
            label: $.i18n.t("ns.common:aboutTagSpaces"),
            click: function() {
              TSCORE.UI.showAboutDialog();
            }
          },
        ]
      },
    ];

    if (process.platform == 'darwin') {
      template.unshift({
        label: $.i18n.t("ns.common:name"),
        submenu: [
          {
            label: $.i18n.t("ns.common:aboutTagSpaces"),
            role: 'about'
          },
          {
            type: 'separator'
          },
          {
            label: $.i18n.t("ns.common:services"),
            role: 'services',
            submenu: []
          },
          {
            type: 'separator'
          },
          {
            label: $.i18n.t("ns.common:hideTagSpaces"),
            accelerator: 'Command+H',
            role: 'hide'
          },
          {
            label: $.i18n.t("ns.common:hideOthers"),
            accelerator: 'Command+Alt+H',
            role: 'hideothers'
          },
          {
            label: $.i18n.t("ns.common:showAll"),
            role: 'unhide'
          },
          {
            type: 'separator'
          },
          {
            label: $.i18n.t("ns.common:quit"),
            accelerator: 'Command+Q',
            click: function() {
              ipcRenderer.send('quit-application', 'Bye, bye...');
            }
          },
        ]
      });
      // Window menu.
      /*template[3].submenu.push(
       {
       type: 'separator'
       },
       {
       label: 'Bring All to Front',
       role: 'front'
       }
       );*/
    }
    var menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    ipcRenderer.on("file", function(event, arg) {
      switch (arg) {
        case "text":
          TSCORE.UI.createTXTFile();
          break;
        case "html":
          TSCORE.UI.createHTMLFile();
          break;
        case "markdown":
          TSCORE.UI.createMDFile();
          break;
        case "audio":
          TSCORE.UI.showAudioRecordingDialog();
          break;
        case "next-file":
          if (TSCORE.selectedFiles[0]) {
            TSCORE.FileOpener.openFile(TSCORE.PerspectiveManager.getNextFile(TSCORE.selectedFiles[0]));
          } else {
            TSCORE.showAlertDialog($.i18n.t("ns.common:selectFile"));
          }
          break;
        case "previous-file":
          if (TSCORE.selectedFiles[0]) {
            TSCORE.FileOpener.openFile(TSCORE.PerspectiveManager.getPrevFile(TSCORE.selectedFiles[0]));
          } else {
            TSCORE.showAlertDialog($.i18n.t("ns.common:selectFile"));
          }
          break;
        default:
          return false;
      }
    });

    ipcRenderer.on("play-pause", function(event, arg) {
      // Create the event.
      var audioEvent = new CustomEvent('resume', {'detail': arg});
      window.dispatchEvent(audioEvent);
    });
  }

  // Brings the TagSpaces window on top of the windows
  function focusWindow() {
    win.focus();
  }

  function trash(files) {
    return new Promise(function(resolve, reject) {
      files.forEach(function(fullPath) {
        electron.shell.moveItemToTrash(fullPath);
      });
      resolve(true);
    });
  }

  // IOAPI
  /**
   * Checks if new version is available
   * @name checkNewVersion
   * @method
   * @memberof IOAPI.Electron
   */
  function checkNewVersion() {
    console.log("Checking for new version...");
    var cVer = TSCORE.Config.DefaultSettings.appVersion + "." + TSCORE.Config.DefaultSettings.appBuild;
    $.ajax({
      url: 'http://tagspaces.org/releases/version.json?eVer=' + cVer,
      type: 'GET'
    }).done(function(data) {
      TSCORE.updateNewVersionData(data);
    }).fail(function(data) {
      console.log("AJAX failed " + data);
    });
  }

  /**
   * Creates recursively a tree structure for a given directory path
   * @name createDirectoryTree
   * @method
   * @memberof IOAPI.Electron
   * @param {string} dirPath - the full path of the directory for which the tree will be generated
   */
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
    return directoyTree;
  }


  /**
   * Creates a list with containing the files and the sub directories of a given directory
   * @name listDirectoryPromiseAsync
   * @method
   * @memberof IOAPI.Electron
   * @param {string} path - the directory path for which the list will be created
   * @returns {Promise.<Success, Error>}
   */
  function listDirectoryPromiseAsync(path) {
    console.time("listDirectoryPromise");
    return new Promise(function(resolve, reject) {
      var statEntriesPromises = [];
      fs.readdir(path, function(error, entries) {
        if (error) {
          console.log("Error listing directory " + path);
          resolve([]); // returning results even if any promise fails
          return;
        }

        if (entries) {
          entries.forEach(function(entry) {
            statEntriesPromises.push(getPropertiesPromise(path + TSCORE.dirSeparator + entry));
          });
          Promise.all(statEntriesPromises).then(function(enhancedEntries) {
            console.timeEnd("listDirectoryPromise");
            resolve(enhancedEntries);
            return;
          }, function(err) {
            resolve([]); // returning results even if any promise fails
            return;
          });
        }
      });
    });
  }

  /**
   * Creates a list with containing the files and the sub directories of a given directory
   * @name listDirectoryPromise
   * @method
   * @memberof IOAPI.Electron
   * @param {string} path - the directory path which is listed
   * @param {boolean} lite - if true the path to a file thumbnails will be not included in the results
   * This will increase the performance of the function.
   * @returns {Promise.<Success, Error>}
   */
  function listDirectoryPromise(path, lite) {
    console.time("listDirectoryPromise");
    return new Promise(function(resolve, reject) {
      var enhancedEntries = [];
      var entryPath;
      var thumbPath;
      var stats;
      var thumbStats;
      var eentry;
      var metaMetaFolder = TSCORE.metaFolder + TSCORE.dirSeparator + TSCORE.metaFolder;

      fs.readdir(path, function(error, entries) {
        if (error) {
          console.log("Error listing directory " + path);
          resolve(enhancedEntries); // returning results even if any promise fails
          return;
        }

        if (entries) {
          entries.forEach(function(entry) {
            entryPath = path + TSCORE.dirSeparator + entry;
            thumbPath = path + TSCORE.dirSeparator + TSCORE.metaFolder + TSCORE.dirSeparator + entry + TSCORE.thumbFileExt;
            eentry = {};
            eentry.name = entry;
            eentry.path = entryPath;

            try {
              stats = fs.statSync(entryPath);
              eentry.isFile = stats.isFile();
              eentry.size = stats.size;
              eentry.lmdt = stats.mtime.getTime();

              if (!lite && eentry.isFile && thumbPath.indexOf(metaMetaFolder) < 0) { // prevent checking in .ts/.ts folder
                try {
                  thumbStats = fs.statSync(thumbPath);
                  if (thumbStats.isFile) {
                    eentry.thumbPath = thumbPath;
                  }
                } catch (e) {
                  console.log("Can not find thumbnail for file: " + thumbPath);
                }
                // TODO Extract the name of the sidecar json file
              }

            } catch (e) {
              console.warn("Can not load properties for: " + entryPath);
            }

            enhancedEntries.push(eentry);
          });
          console.timeEnd("listDirectoryPromise");
          resolve(enhancedEntries);
          return;
        }
      });
    });
  }

  /**
   * Finds out the properties of a file or directory such last modification date or file size
   * @name getPropertiesPromise
   * @method
   * @memberof IOAPI.Electron
   * @param {string} path - full path to the file or the directory, which will be analysed
   * @returns {Promise.<Success, Error>}
   */
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
          return;
        }

        if (stats) {
          var entry = {};
          entry.name = path.substring(path.lastIndexOf(TSCORE.dirSeparator) + 1, path.length);
          entry.isFile = stats.isFile();
          entry.size = stats.size;
          entry.lmdt = stats.mtime;
          entry.path = path;
          resolve(entry);
        }
      });
    });
  }

  /**
   * Creates a directory
   * @name createDirectoryPromise
   * @method
   * @memberof IOAPI.Electron
   * @param {string} dirPath - the full path of the folder which will be created
   * @returns {Promise.<Success, Error>}
   */
  function createDirectoryPromise(dirPath) {
    return new Promise(function(resolve, reject) {
      fs.mkdir(dirPath, function(error) {
        if (error) {
          reject("Error creating folder: " + dirPath);
          return;
        }
        resolve(dirPath);
      });
    });
  }

  /**
   * Copies a given file to a specified location
   * @name copyFilePromise
   * @method
   * @memberof IOAPI.Electron
   * @param {string} sourceFilePath - the full path of a file which will be copied
   * @param {string} targetFilePath - the full path destination of the copied file
   * @returns {Promise.<Success, Error>}
   */
  function copyFilePromise(sourceFilePath, targetFilePath) {
    console.log("Copying file: " + sourceFilePath + " to " + targetFilePath);
    return new Promise(function(resolve, reject) {
      if (sourceFilePath === targetFilePath) {
        reject($.i18n.t("ns.common:fileTheSame"), "File copying failed");
        return;
      } else if (fs.lstatSync(sourceFilePath).isDirectory()) {
        reject($.i18n.t("ns.common:fileIsDirectory", {fileName: sourceFilePath}));
        return;
      } else if (fs.existsSync(targetFilePath)) {
        reject($.i18n.t("ns.common:fileExists", {fileName: targetFilePath}), "File copying failed");
        return;
      } else {
        fs.copy(sourceFilePath, targetFilePath, function(error) {
          if (error) {
            reject("Copying: " + sourceFilePath + " failed.");
            return;
          }
          resolve([sourceFilePath, targetFilePath]);
        });
      }
    });
  }

  /**
   * Renames a given file
   * @name renameFilePromise
   * @method
   * @memberof IOAPI.Electron
   * @param {string} filePath - the full path of the file which will be renamed
   * @param {string} newFilePath - the desired full path after the file rename
   * @returns {Promise.<Success, Error>}
   */
  function renameFilePromise(filePath, newFilePath) {
    console.log("Renaming file: " + filePath + " to " + newFilePath);
    stopWatchingDirectories();
    return new Promise(function(resolve, reject) {
      if (filePath === newFilePath) {
        reject($.i18n.t("ns.common:fileTheSame"), $.i18n.t("ns.common:fileNotMoved"));
        return;
      } else if (fs.lstatSync(filePath).isDirectory()) {
        reject($.i18n.t("ns.common:fileIsDirectory", {fileName: filePath}));
        return;
      } else if (!fs.existsSync(filePath)) {
        reject("Source file does not exists " + filePath, $.i18n.t("ns.common:fileRenameFailed"));
        return;
      } else if (fs.existsSync(newFilePath)) {
        reject($.i18n.t("ns.common:fileExists", {fileName: newFilePath}), $.i18n.t("ns.common:fileRenameFailed"));
        return;
      } else {
        fs.move(filePath, newFilePath, {clobber: true}, function(error) {
          if (error) {
            reject("Renaming: " + filePath + " failed.", error);
            return;
          }
          resolve([filePath, newFilePath]);
        });
      }
    });
  }

  /**
   * Rename a directory
   * @name renameDirectoryPromise
   * @method
   * @memberof IOAPI.Electron
   * @param {string} dirPath - the full path of the directory which will be renamed
   * @param {string} newDirName - the desired full path after the directory rename
   * @returns {Promise.<Success, Error>}
   */
  function renameDirectoryPromise(dirPath, newDirName) {
    var newDirPath = TSCORE.TagUtils.extractParentDirectoryPath(dirPath) + TSCORE.dirSeparator + newDirName;
    console.log("Renaming dir: " + dirPath + " to " + newDirPath);
    stopWatchingDirectories();
    return new Promise(function(resolve, reject) {
      if (dirPath === newDirPath) {
        reject($.i18n.t("ns.common:directoryTheSame"), $.i18n.t("ns.common:directoryNotMoved"));
        return;
      } else if (fs.existsSync(newDirPath)) {
        reject($.i18n.t("ns.common:directoryExists", {dirName: newDirPath}), $.i18n.t("ns.common:directoryRenameFailed"));
        return;
      } else {
        var dirStatus = fs.lstatSync(dirPath);
        if (dirStatus.isDirectory) {
          fs.rename(dirPath, newDirPath, function(error) {
            if (error) {
              console.error("Renaming directory failed " + error);
              reject("Renaming " + dirPath + " failed.");
              return;
            }
            resolve(newDirPath);
          });
        } else {
          reject($.i18n.t("ns.common:pathIsNotDirectory", {dirName: dirPath}), $.i18n.t("ns.common:directoryRenameFailed"));
          return;
        }
      }
    });
  }

  /**
   * Load the content of a text file
   * @name loadTextFilePromise
   * @method
   * @memberof IOAPI.Electron
   * @param {string} filePath - the full path of the file which will be loaded
   * @param {boolean} isPreview - loads only begin of a file (first 10000 bytes) usefull for previewing of the file
   * @returns {Promise.<Success, Error>}
   */
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

  /**
   * Gets the content of file, useful for binary files
   * @name getFileContentPromise
   * @method
   * @memberof IOAPI.Electron
   * @param {string} fullPath - the full path of the file which will be loaded
   * @param {string} type - the type of the XHR response, defaul is *arraybuffer*
   * @returns {Promise.<Success, Error>}
   */
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

  /**
   * Persists a given content(binary supported) to a specified filepath
   * @name saveFilePromise
   * @method
   * @memberof IOAPI.Electron
   * @param {string} filePath - the full path of the file which should be saved
   * @param {string} content - content that will be saved
   * @param {boolean} overwrite - if true existing file path will be overwritten
   * @returns {Promise.<Success, Error>}
   */
  function saveFilePromise(filePath, content, overwrite) {
    overwrite = overwrite || true; // TODO check if true should the default value

    return new Promise(function(resolve, reject) {
      function saveFile(filePath, content, isNewFile) {
        fs.writeFile(filePath, content, 'utf8', function(error) {
          if (error) {
            reject(error);
            return;
          }
          resolve(isNewFile);
        });
      }

      getPropertiesPromise(filePath).then(function(entry) {
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

  /**
   * Persists a given text content to a specified filepath
   * @name saveTextFilePromise
   * @method
   * @memberof IOAPI.Electron
   * @param {string} filePath - the full path of the file which will be saved
   * @param {string} content - content that will be saved
   * @param {string} overwrite - if true existing file path will be overwritten
   * @returns {Promise.<Success, Error>}
   */
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

  /**
   * Persists a given binary content to a specified filepath
   * @name saveBinaryFilePromise
   * @method
   * @memberof IOAPI.Electron
   * @param {string} filePath - the full path of the file which will be saved
   * @param {string} content - content that will be saved
   * @param {string} overwrite - if true existing file path will be overwritten
   * @returns {Promise.<Success, Error>}
   */
  function saveBinaryFilePromise(filePath, content, overwrite) {
    console.log("Saving binary file: " + filePath);
    var buff = TSCORE.Utils.arrayBufferToBuffer(content);
    return saveFilePromise(filePath, buff, overwrite);
  }

  /**
   * Delete a specified file
   * @name deleteFilePromise
   * @method
   * @memberof IOAPI.Electron
   * @param {string} path - the full path of the file which will be deleted
   * @returns {Promise.<Success, Error>}
   */
  function deleteFilePromise(path) {
    if (TSCORE.PRO && TSCORE.Config.getUseTrashCan()) {
      return new Promise(function(resolve, reject) {
        trash([path]).then(function() {
          resolve(path);
        }, function(err) {
          reject(err);
        });
      });
    } else {
      return new Promise(function(resolve, reject) {
        fs.unlink(path, function(error) {
          if (error) {
            reject(error);
            return;
          } else {
            resolve(path);
          }
        });
      });
    }
  }

  /**
   * Delete a specified directory, the directory should be empty, if the trash can functionality is not enabled
   * @name deleteDirectoryPromise
   * @method
   * @memberof IOAPI.Electron
   * @param {string} path - the full path of the directory which will be deleted
   * @returns {Promise.<Success, Error>}
   */
  function deleteDirectoryPromise(path) {
    if (TSCORE.PRO && TSCORE.Config.getUseTrashCan()) {
      return trash([path]);
    } else {
      return new Promise(function(resolve, reject) {
        fs.rmdir(path, function(error) {
          if (error) {
            reject(error);
            return;
          } else {
            resolve(path);
          }
        });
      });
    }
  }

  /**
   * Selects a directory with the help of a directory chooser
   * @name selectDirectory
   * @method
   * @memberof IOAPI.Electron
   */
  function selectDirectory() {
    if (document.getElementById('folderDialogNodeWebkit') === null) {
      $("body").append('<input style="display:none;" id="folderDialogNodeWebkit" type="file" webkitdirectory />');
    }
    var chooser = $('#folderDialogNodeWebkit');
    chooser.on("change", function(ev) {
      var file = ev.target.files[0];
      TSPOSTIO.selectDirectory(file.path);
      $(this).off("change");
      $(this).val("");
    });
    chooser.trigger('click');
  }

  /**
   * Selects a file with the help of a file chooser
   * @name selectFile
   * @method
   * @memberof IOAPI.Electron
   */
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

  /**
   * Opens a directory in the operating system's default file manager
   * @name openDirectory
   * @method
   * @memberof IOAPI.Electron
   * @param {string} dirPath - the full path of the directory which will be opened
   */
  function openDirectory(dirPath) {
    // opens directory
    electron.shell.showItemInFolder(dirPath + TSCORE.dirSeparator + ".");
  }

  /**
   * Opens a file with the operating system's default program for the type of the file
   * @name openFile
   * @method
   * @memberof IOAPI.Electron
   * @param {string} filePath - the full path of the file which will be opened
   */
  function openFile(filePath) {
    // opens file with the native program
    if (isElectron && isOSX && (filePath.indexOf("http") === 0)) {
      electron.shell.openExternal(filePath);
    } else {
      electron.shell.openItem(filePath);
    }
  }

  // Platform specific calls
  exports.initMainMenu = initMainMenu;
  exports.showMainWindow = showMainWindow;

  exports.watchDirectory = watchDirectory; // Platform specific
  exports.stopWatchingDirectories = stopWatchingDirectories; // Platform specific

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
