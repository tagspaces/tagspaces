/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */

/**
 * A implementation of the IOAPI for the Chrome/Chromium extensions platform
 * @class WebDAV
 * @memberof IOAPI
 */
define(function(require, exports, module) {
  "use strict";

  // Activating browser specific exports modul
  console.log("Loading web.js..");

  var TSCORE = require("tscore");
  var TSPOSTIO = require("tspostioapi");

  require("webdavlib/webdavlib");

  var davClient;
  //exact copy of getAjax with timeout added 
  nl.sara.webdav.Client.prototype.getAjax = function(method, url, callback, headers) {
    var /** @type XMLHttpRequest */ ajax = (((typeof Components !== 'undefined') && (typeof Components.classes !== 'undefined')) ? Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Components.interfaces.nsIXMLHttpRequest) : new XMLHttpRequest());
    if (this._username !== null) {
      ajax.open(method, url, true, this._username, this._password);
    } else {
      ajax.open(method, url, true);
    }
    ajax.onreadystatechange = function() {
      nl.sara.webdav.Client.ajaxHandler(ajax, callback);
    };
    
    ajax.ontimeout = function() {
      ajax.readyState = 4;
      ajax.ajax.status = -1;
      nl.sara.webdav.Client.ajaxHandler(ajax, callback);
    };

    if (headers === undefined) {
      headers = {};
    }
    for (var header in this._headers) {
      if (headers[header] === undefined) {
        ajax.setRequestHeader(header, this._headers[header]);
      }
    }
    for (var header in headers) {
      ajax.setRequestHeader(header, headers[header]);
    }
    return ajax;
  };

  function connectDav() {
    console.log("Connecting webdav...");
    var useHTTPS = false;
    if (location.href.indexOf("https") === 0) {
      useHTTPS = true;
    }
    davClient = new nl.sara.webdav.Client(location.hostname, useHTTPS, location.port);
  }

  //window.setTimeout(
  connectDav();
  //, 2000);

  function getNameForPath(path) {
    if (path.lastIndexOf("/") == path.length - 1) {
      path = path.substring(0, path.lastIndexOf("/"));
    }
    var encodedName = path.substring(path.lastIndexOf("/") + 1, path.length);
    return decodeURI(encodedName);
  }

  function isDirectory(path) {
    // TODO find a better solution
    return path.lastIndexOf("/") == path.length - 1;
  }

  function checkStatusCode(code) {
    var status = parseInt(code / 100);
    if (status === 2) {
      return true;
    }
    return false;
  }

  function handleStartParameters() {
    var filePath = TSCORE.Utils.getURLParameter("open");
    if (filePath && (filePath.length > 0)) {
      filePath = decodeURIComponent(filePath);
      console.log("Opening file in browser: " + filePath);
      TSCORE.FileOpener.openFileOnStartup(filePath);
    }
  }

  function focusWindow() {
    // Bring the TagSpaces window on top of the windows
    window.focus();
  }

  /**
   * Checks if new version is available
   * @name checkNewVersion
   * @method
   * @memberof IOAPI.web
   */
  function checkNewVersion() {
    //
    console.log("Checking for new version not relevant fot the webdav version");
  }

  /**
   * Creates recursively a tree structure for a given directory path
   * @name createDirectoryTree
   * @method
   * @memberof IOAPI.web
   * @param {string} dirPath - the full path of the directory for which the tree will be generated
   */
  function createDirectoryTree(dirPath) {
    console.log("Creating directory index for: " + dirPath);
    TSCORE.showLoadingAnimation();

    var directoyTree = [];
    //console.log(JSON.stringify(directoyTree));
    TSPOSTIO.createDirectoryTree(directoyTree);
  }

  /**
   * Creates a list with containing the files and the sub directories of a given directory
   * @name listDirectoryPromise
   * @method
   * @memberof IOAPI.web
   * @param {string} dirPath - the directory path which is listed
   * @returns {Promise.<Success, Error>}
   */
  function listDirectoryPromise(dirPath) {
    dirPath = dirPath.split("//").join("/");
    console.log("Listing directory: " + dirPath);
    return new Promise(function(resolve, reject) {
      var anotatedDirList;

      var davSuccess = function(status, data) {
        console.log("Dirlist Status:  " + status);
        if (!checkStatusCode(status)) {
          console.warn("Listing directory " + dirPath + " failed " + status);
          reject("Listing directory " + dirPath + " failed " + status);
        }
        var dirList = data._responses;
        var fileName, isDir, filesize, lmdt, path;

        anotatedDirList = [];
        for (var entry in dirList) {
          path = dirList[entry].href;
          if (dirPath.toLowerCase() === path.toLowerCase()) {
            console.log("Skipping current folder");
          } else {
            isDir = false;
            filesize = undefined;
            lmdt = undefined;
            //console.log(dirList[entry]._namespaces["DAV:"]);
            if (typeof dirList[entry]._namespaces["DAV:"].getcontentlength === 'undefined' ||
              dirList[entry]._namespaces["DAV:"].getcontentlength._xmlvalue.length === 0
            ) {
              isDir = true;
            } else {
              filesize = dirList[entry]._namespaces["DAV:"].getcontentlength._xmlvalue[0].data;
              lmdt = data._responses[entry]._namespaces["DAV:"].getlastmodified._xmlvalue[0].data;
            }
            fileName = getNameForPath(path);
            anotatedDirList.push({
              "name": fileName,
              "isFile": !isDir,
              "size": filesize,
              "lmdt": lmdt,
              "path": decodeURI(path)
            });
          }
        }
        resolve(anotatedDirList);
      };

      if (dirPath.substring(dirPath.length - 1) !== "/") {
        dirPath = dirPath + "/";
      }
      dirPath = encodeURI(dirPath);

      davClient.propfind(
        dirPath,
        davSuccess,
        1 //1 , davClient.INFINITY
      );
    });
  }

  /**
   * Finds out the properties of a file or directory such last modification date or file size
   * @name getPropertiesPromise
   * @method
   * @memberof IOAPI.web
   * @param {string} filePath - full path to the file or the directory, which will be analysed
   * @returns {Promise.<Success, Error>}
   */
  function getPropertiesPromise(filePath) {
    return new Promise(function(resolve, reject) {
      davClient.propfind(encodeURI(filePath), function(status, data) {
        console.log("Properties Status / Content: " + status + " / " + JSON.stringify(data._responses));
        var fileProperties = {};
        if (checkStatusCode(status)) {
          for (var entry in data._responses) {
            fileProperties.path = filePath;
            fileProperties.size = data._responses[entry]._namespaces["DAV:"].getcontentlength;
            fileProperties.lmdt = data._responses[entry]._namespaces["DAV:"].getlastmodified._xmlvalue[0].data;
          }
          resolve(fileProperties);
        } else {
          reject("getFileProperties " + filePath + " failed " + status);
        }
      }, 1);
    });
  }

  /**
   * Load the content of a text file
   * @name loadTextFilePromise
   * @method
   * @memberof IOAPI.web
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
   * @memberof IOAPI.web
   * @param {string} filePath - the full path of the file which will be loaded
   * @param {string} type - the type of the XHR response, defaul is *arraybuffer*
   * @returns {Promise.<Success, Error>}
   */
  function getFileContentPromise(filePath, type) {
    console.log("getFileContent file: " + filePath);
    return new Promise(function(resolve, reject) {
      var ajax = davClient.getAjax("GET", filePath);
      ajax.onreadystatechange = null;
      ajax.responseType = type || "arraybuffer";
      ajax.onerror = reject;

      ajax.onload = function() {
        var response = ajax.response || ajax.responseText;
        if (checkStatusCode(ajax.status)) {
          resolve(response);
        } else {
          reject("getFileContentPromise ajax error");
        }
      };
      ajax.send();
    });
  }

  /**
   * Persists a given content(binary supported) to a specified filepath
   * @name saveFilePromise
   * @method
   * @memberof IOAPI.web
   * @param {string} filePath - the full path of the file which should be saved
   * @param {string} content - content that will be saved
   * @param {boolean} overWrite - if true existing file path will be overwritten
   * @param {boolean} mode - //TODO
   * @returns {Promise.<Success, Error>}
   */
  function saveFilePromise(filePath, content, overWrite, mode) {
    return new Promise(function(resolve, reject) {
      var isNewFile = false;
      davClient.propfind(encodeURI(filePath), function(status, data) {
        console.log("Check file exists: Status / Content: " + status + " / " + data);
        if (parseInt(status) === 404) {
          isNewFile = true;
        }
        if (isNewFile || overWrite === true || mode === "text") {
          davClient.put(
            encodeURI(filePath),
            function(status, data, headers) {
              console.log("Creating File Status/Content/Headers:  " + status + " / " + data + " / " + headers);
              if (checkStatusCode(status)) {
                resolve(isNewFile);
              } else {
                reject("saveFilePromise: " + filePath + " failed " + status);
              }
            },
            content,
            'application/octet-stream'
          );
        } else {
          reject("File Already Exists.");
        }
      }, 1);
    });
  }

  /**
    * Persists a given text content to a specified filepath
    * @name saveTextFilePromise
    * @method
    * @memberof IOAPI.web
    * @param {string} filePath - the full path of the file which will be saved
    * @param {string} content - content that will be saved
    * @param {string} overWrite - if true existing file path will be overwritten
    * @returns {Promise.<Success, Error>}
    */
  function saveTextFilePromise(filePath, content, overWrite) {
    console.log("Saving text file: " + filePath);
    return saveFilePromise(filePath, content, overWrite, "text");
  }

  /**
   * Persists a given binary content to a specified filepath
   * @name saveBinaryFilePromise
   * @method
   * @memberof IOAPI.web
   * @param {string} filePath - the full path of the file which will be saved
   * @param {string} content - content that will be saved
   * @param {string} overWrite - if true existing file path will be overwritten
   * @returns {Promise.<Success, Error>}
   */
  function saveBinaryFilePromise(filePath, content, overWrite) {
    console.log("Saving binary file: " + filePath);
    return saveFilePromise(filePath, content, overWrite);
  }

  /**
   * Creates a directory
   * @name createDirectoryPromise
   * @method
   * @memberof IOAPI.web
   * @param {string} dirPath - the full path of the folder which will be created
   * @returns {Promise.<Success, Error>}
   */
  function createDirectoryPromise(dirPath) {
    console.log("Creating directory: " + dirPath);
    return new Promise(function(resolve, reject) {
      davClient.mkcol(
        encodeURI(dirPath),
        function(status, data, headers) {
          console.log("Directory Creation Status/Content/Headers:  " + status + " / " + data + " / " + headers);
          if (checkStatusCode(status)) {
            resolve(dirPath);
          } else {
            reject("createDirectory " + dirPath + " failed " + status);
          }
        }
      );
    });
  }

  /**
   * Copies a given file to a specified location
   * @name copyFilePromise
   * @method
   * @memberof IOAPI.web
   * @param {string} filePath - the full path of a file which will be copied
   * @param {string} newFilePath - the full path destination of the copied file
   * @returns {Promise.<Success, Error>}
   */
  function copyFilePromise(filePath, newFilePath) {
    console.log("Copying file: " + filePath + " to " + newFilePath);
    return new Promise(function(resolve, reject) {
      if (filePath.toLowerCase() === newFilePath.toLowerCase()) {
        TSCORE.hideWaitingDialog();
        TSCORE.showAlertDialog($.i18n.t("ns.common:fileTheSame"), $.i18n.t("ns.common:fileNotCopyied"));
        reject($.i18n.t("ns.common:fileTheSame"));
      } else {
        davClient.copy(
          encodeURI(filePath),
          function(status, data, headers) {
            console.log("Copy File Status/Content/Headers:  " + status + " / " + data + " / " + headers);
            if (checkStatusCode(status)) {
              resolve(filePath, newFilePath);
            } else {
              reject("copyFile " + filePath + " failed " + status);
            }
          },
          encodeURI(newFilePath),
          davClient.FAIL_ON_OVERWRITE
        );
      }
    });
  }

  /**
   * Renames a given file
   * @name renameFilePromise
   * @method
   * @memberof IOAPI.web
   * @param {string} filePath - the full path of the file which will be renamed
   * @param {string} newFilePath - the desired full path after the file rename
   * @returns {Promise.<Success, Error>}
   */
  function renameFilePromise(filePath, newFilePath) {
    console.log("Renaming file: " + filePath + " to " + newFilePath);
    return new Promise(function(resolve, reject) {
      if (filePath === newFilePath) {
        TSCORE.hideWaitingDialog();
        TSCORE.showAlertDialog($.i18n.t("ns.common:fileTheSame"), $.i18n.t("ns.common:fileNotMoved"));
        reject($.i18n.t("ns.common:fileTheSame"));
      } else {
        davClient.move(
          encodeURI(filePath),
          function(status, data, headers) {
            console.log("Rename File Status/Content/Headers:  " + status + " / " + data + " / " + headers);
            if (checkStatusCode(status)) {
              resolve([filePath, newFilePath]);
            } else {
              reject("rename: " + filePath + " failed " + status);
            }
          },
          encodeURI(newFilePath),
          davClient.FAIL_ON_OVERWRITE
        );
      }
    });
  }

  /**
   * Rename a directory
   * @name renameDirectoryPromise
   * @method
   * @memberof IOAPI.web
   * @param {string} dirPath - the full path of the directory which will be renamed
   * @param {string} newDirPath - the desired full path after the directory rename
   * @returns {Promise.<Success, Error>}
   */
  function renameDirectoryPromise(dirPath, newDirPath) {
    var newDirPath = TSCORE.TagUtils.extractParentDirectoryPath(dirPath) + TSCORE.dirSeparator + newDirPath;
    console.log("Renaming directory: " + dirPath + " to " + newDirPath);
    return new Promise(function(resolve, reject) {
      if (dirPath === newDirPath) {
        TSCORE.hideWaitingDialog();
        TSCORE.showAlertDialog($.i18n.t("ns.common:fileTheSame"), $.i18n.t("ns.common:fileNotMoved"));
        reject($.i18n.t("ns.common:fileTheSame"));
      } else {
        davClient.move(
          encodeURI(dirPath),
          function(status, data, headers) {
            console.log("Rename Directory Status/Content/Headers:  " + status + " / " + data + " / " + headers);
            if (checkStatusCode(status)) {
              resolve(newDirPath);
            } else {
              reject("rename: " + dirPath + " failed " + status);
            }
          },
          encodeURI(newDirPath),
          davClient.FAIL_ON_OVERWRITE
        );
      }
    });
  }

  /**
   * Delete a specified file
   * @name deleteFilePromise
   * @method
   * @memberof IOAPI.web
   * @param {string} path - the full path of the file which will be deleted
   * @returns {Promise.<Success, Error>}
   */
  function deleteFilePromise(path) {
    //
    return deleteDirectoryPromise(path);
  }

  /**
   * Delete a specified directory, the directory should be empty, if the trash can functionality is not enabled
   * @name deleteDirectoryPromise
   * @method
   * @memberof IOAPI.web
   * @param {string} path - the full path of the directory which will be deleted
   * @returns {Promise.<Success, Error>}
   */
  function deleteDirectoryPromise(path) {
    return new Promise(function(resolve, reject) {
      davClient.remove(
        encodeURI(path),
        function(status, data, headers) {
          console.log("Directory/File Deletion Status/Content/Headers:  " + status + " / " + data + " / " + headers);
          if (checkStatusCode(status)) { 
            resolve(path);
          } else {
            reject("delete " + path + " failed " + status);
          }
        }
      );
    });
  }

  /**
   * Not implemented in the WebDAV version
   * @name selectDirectory
   * @method
   * @memberof IOAPI.web
   */
  function selectDirectory() {
    //
    TSCORE.showAlertDialog("Select directory is still not implemented in the webdav edition");
  }

  /**
   * Not implemented in the WebDAV version
   * @name selectFile
   * @method
   * @memberof IOAPI.web
   */
  function selectFile() {
    //
    TSCORE.showAlertDialog("selectFile not relevant for webdav");
  }

  /**
   * Not relevant in the WebDAV version
   * @name openDirectory
   * @method
   * @memberof IOAPI.web
   * @param {string} dirPath - the full path of the directory which will be opened
   */
  function openDirectory(dirPath) {
    //
    TSCORE.showAlertDialog("openDirectory not relevant for webdav.");
  }

  /**
   * Not relevant in the WebDAV version
   * @name openFile
   * @method
   * @memberof IOAPI.web
   * @param {string} filePath - the full path of the file which will be opened
   */
  function openFile(filePath) {
    window.open(filePath, '_blank');
  }

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
