/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */
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

  window.setTimeout(connectDav(), 2000);

  function checkStatusCode(code) {
    var status = parseInt(code / 100);
    if (status === 2) {
      return true;
    }
    return false;
  }

  function listDirectory(dirPath, readyCallback) {
    
    listDirectoryPromise(dirPath).then(function(anotatedDirList) {
        if (readyCallback) {
          readyCallback(anotatedDirList);
        } else {
          TSPOSTIO.listDirectory(anotatedDirList);
        }
        TSCORE.hideLoadingAnimation();
      },
      function(error) {
        if (readyCallback) {
          readyCallback(anotatedDirList);
        } else {
          //TSPOSTIO.errorOpeningPath();
        }
        TSCORE.hideLoadingAnimation();
        if (!readyCallback) {
          TSCORE.showAlertDialog("Listing " + dirPath + " failed.");
        }
        TSCORE.hideLoadingAnimation();
        console.warn("Listing directory " + dirPath + " failed " + status);
      }
    ); 
  }

  function listDirectoryPromise(dirPath) {
    console.log("Listing directory: " + dirPath);
    return new Promise(function(resolve, reject) {
      var anotatedDirList = [];
      dirPath = encodeURI(dirPath + "/");
      davClient.propfind(
        dirPath, //encodeURI(dirPath),
        function(status, data) {
          console.log("Dirlist Status:  " + status);
          if (!checkStatusCode(status)) { 
            reject("Listing directory " + dirPath + " failed " + status);
            console.warn("Listing directory " + dirPath + " failed " + status);
            return;
          }
          var dirList = data._responses,
          fileName, isDir, filesize, lmdt;

          for (var entry in dirList) {
            var path = dirList[entry].href;
            if (dirPath.toLowerCase() !== path.toLowerCase()) {
              isDir = false;
              filesize = undefined;
              lmdt = undefined;
              //console.log(dirList[entry]._namespaces["DAV:"]);
              if (typeof dirList[entry]._namespaces["DAV:"].getcontentlength === 'undefined' ||
                dirList[entry]._namespaces["DAV:"].getcontentlength._xmlvalue.length === 0
              ) {
                isDir = true;
              } else {
                filesize = dirList[entry]._namespaces["DAV:"].getcontentlength;
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
        },
        1 //1 , davClient.INFINITY
      );
    });
  };

  var getDirectoryMetaInformation = function(dirPath, readyCallback) {
    listDirectory(dirPath, function(anotatedDirList) {
      TSCORE.metaFileList = anotatedDirList;
      readyCallback(anotatedDirList);
    });
  };

  function getNameForPath(path) {
    if (path.lastIndexOf("/") == path.length - 1) {
      path = path.substring(0, path.lastIndexOf("/"));
    }
    var encodedName = path.substring(path.lastIndexOf("/") + 1, path.length);
    return decodeURI(encodedName);
  }

  function isDirectory(path) {
    return path.lastIndexOf("/") == path.length - 1;
  }

  var createDirectoryIndex = function(dirPath) {
    console.log("Creating index for directory: " + dirPath);
    TSCORE.showLoadingAnimation();

    var directoryIndex = [];
    TSPOSTIO.createDirectoryIndex(directoryIndex);
  };

  var createDirectoryTree = function(dirPath) {
    console.log("Creating directory index for: " + dirPath);
    TSCORE.showLoadingAnimation();

    var directoyTree = [];
    //console.log(JSON.stringify(directoyTree));
    TSPOSTIO.createDirectoryTree(directoyTree);
  };

  var createDirectory = function(dirPath, silentMode) {
    createDirectoryPromise(dirPath).then(function(dirPath) {
        if (silentMode !== true) {
          TSPOSTIO.createDirectory(dirPath);
        }
      }, function(error) {
        TSCORE.showAlertDialog("Creating directory" + dirPath + "failed");
        console.error(error);
      }
    );
  };

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

  var copyFile = function(filePath, newFilePath) {
    if (filePath.toLowerCase() === newFilePath.toLowerCase()) {
      TSCORE.hideWaitingDialog();
      TSCORE.showAlertDialog($.i18n.t("ns.common:fileTheSame"), $.i18n.t("ns.common:fileNotCopyied"));
      return false;
    }

    copyFilePromise(filePath, newFilePath).then(function(filePath, newFilePath) {
        TSPOSTIO.copyFile(filePath, newFilePath); 
      }, function(error) {
        TSCORE.hideWaitingDialog();
        TSCORE.showAlertDialog($.i18n.t("ns.common:fileCopyFailed", {fileName:newFilePath}));
        console.error(error);
      }
    );
  };

  function copyFilePromise(filePath, newFilePath) {
    console.log("Copying file: " + filePath + " to " + newFilePath);
    return new Promise(function(resolve, reject) {
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
    });
  }

  var renameFile = function(filePath, newFilePath) {
    if (filePath === newFilePath) {
      TSCORE.hideWaitingDialog();
      TSCORE.showAlertDialog($.i18n.t("ns.common:fileTheSame"), $.i18n.t("ns.common:fileNotMoved"));
      return false;
    }

    renameFilePromise(filePath, newFilePath).then(function() {
        TSPOSTIO.renameFile(filePath, newFilePath);
      }, function(error) {
        TSCORE.showAlertDialog("Renaming: " + filePath + " failed.");
        console.error(error);
      }
    );
  };

  var renameDirectory = function(dirPath, newDirName) {
    var newDirPath = TSCORE.TagUtils.extractParentDirectoryPath(dirPath) + TSCORE.dirSeparator + encodeURIComponent(newDirName);
    renameDirectoryPromise(dirPath, newDirPath).then(function() {
        TSPOSTIO.renameDirectory(dirPath, newDirName);
      }, function(error) {
        TSCORE.hideWaitingDialog();
        TSCORE.showAlertDialog($.i18n.t("ns.common:pathIsNotDirectory", {dirName:dirPath}), 
          $.i18n.t("ns.common:directoryRenameFailed"));
        console.error(error);
      }
    );
  };

  function renameFilePromise(filePath, newFilePath) {
    console.log("Renaming file: " + filePath + " to " + newFilePath);
    return renameDirectoryPromise(filePath, newFilePath);
  }

  function renameDirectoryPromise(dirPath, newDirPath) {
    console.log("Renaming directory: " + dirPath + " to " + newDirPath);
    return new Promise(function(resolve, reject){
      davClient.move(
        encodeURI(dirPath),
        function(status, data, headers) {
          console.log("Rename Directory Status/Content/Headers:  " + status + " / " + data + " / " + headers);
          if (checkStatusCode(status)) {
            resolve([dirPath, newDirPath]);
          } else {
            reject("rename: " + dirPath + " failed " + status);
          }
        },
        encodeURI(newDirPath),
        davClient.FAIL_ON_OVERWRITE
      );
    });
  }

  var loadTextFile = function(filePath) {
    console.log("Loading file: " + filePath);
    loadTextFilePromise(filePath).then(function(data) {
        TSPOSTIO.loadTextFile(data);
      }, function(error) {
        TSCORE.showAlertDialog("Loading " + filePath + " failed.");
        console.error(error);
      }
    );
  };

  function loadTextFilePromise(filePath) {
    return getFileContentPromise(filePath, "text");
  }

  var saveTextFile = function(filePath, content, overWrite, silentMode) {
    console.log("Saving file: " + filePath); //+" content: "+content);
    saveFilePromise(filePath, content, overWrite, silentMode, "text").then(function(isNewFile) {
        if (silentMode !== true) {
           TSPOSTIO.saveTextFile(filePath, isNewFile);
        }
      }, function(error) {
        TSCORE.showAlertDialog("Save file " + filePath + " failed.");
        console.error(error);
      }
    );
  };

  var saveBinaryFile = function(filePath, content, overWrite, silentMode) {
    console.log("Saving binary file: " + filePath); //+" content: "+content);
    saveFilePromise(filePath, content, overWrite, silentMode).then(function(isNewFile) {
        if (silentMode !== true) {
          TSPOSTIO.saveBinaryFile(filePath, isNewFile); 
        }
      }, function(error) {
        TSCORE.showAlertDialog("Save file " + filePath + " failed.");
        console.error(error);
      }
    );
  };

  function saveFilePromise(filePath, content, overWrite, silentMod, mode) {

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

  var deleteElement = function(path) {
    console.log("Deleting: " + path);
    deleteDirectoryPromise(path).then(function() {
        TSPOSTIO.deleteElement(path);
      }, function(error) {
        TSCORE.hideLoadingAnimation();
        TSCORE.showAlertDialog("Deletion of the file " + path + " failed");
        console.error(error);
      }
    );
  };

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

  function deleteFilePromise(path) {
    return deleteDirectoryPromise(path);
  }

  var deleteDirectory = function(path) {
    console.log("deleteDirectory: " + path);
    deleteDirectoryPromise(path).then(function() {
        TSPOSTIO.deleteDirectory(path);
      }, function(error) {
        TSCORE.hideLoadingAnimation();
        TSCORE.showAlertDialog("Deleting directory " + path + " failed.");
        console.error(error);
      }
    );
  };

  var checkAccessFileURLAllowed = function() {
    console.log("checkAccessFileURLAllowed function not relevant for webdav..");
  };

  var checkNewVersion = function() {
    console.log("Checking for new version not relevant fot the webdav version");
  };

  var selectDirectory = function() {
    TSCORE.showAlertDialog("Select directory is still not implemented in the webdav edition");
  };

  var openDirectory = function(dirPath) {
    console.log("openDirectory function not relevant for webdav..");
  };

  var openFile = function(filePath) {
    console.log("openFile function not relevant for webdav..");
  };

  var selectFile = function() {
    console.log("selectFile function not relevant for webdav..");
  };

  var openExtensionsDirectory = function() {
    console.log("openExtensionsDirectory function not relevant for webdav..");
  };

  var getFileProperties = function(filePath) {
    getFilePropertiesPromise(filePath).then(function(fileProperties) {
        TSPOSTIO.getFileProperties(fileProperties);
      }, function(error) {
        TSCORE.hideLoadingAnimation();
        TSCORE.closeFileViewer();
        TSCORE.showAlertDialog("File " + filePath + " get properties failed");
        console.error(error);;
      }
    );
  };

  function getFilePropertiesPromise(filePath) {
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

  // Bring the TagSpaces window on top of the windows
  var focusWindow = function() {
    window.focus();
  };

  var getFileContent = function(filePath, result, error) {
    getFileContentPromise(filePath).then(result, error);
  };

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
  exports.listDirectoryPromise = listDirectoryPromise;
  exports.getFileContentPromise = getFileContentPromise;
});
