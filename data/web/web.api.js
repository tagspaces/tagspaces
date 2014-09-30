/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define(function(require, exports, module) {
"use strict";
	
	// Activating browser specific exports modul
	console.log("Loading web.js..");
    
    var TSCORE = require("tscore");
    var TSPOSTIO = require("tspostioapi");

    require("webdavlib");

    var davClient;

    function connectDav() {
        console.log("Connecting webdav...");
        var useHTTPS = false;
        if(location.href.indexOf("https") === 0) {
            useHTTPS = true;
        }
        davClient = new nl.sara.webdav.Client(location.host, useHTTPS, location.port);
    }

    window.setTimeout(connectDav(), 2000);

    function listDirectory(dirPath) {
        console.log("Listing directory: "+dirPath);

        dirPath = encodeURI(dirPath + "/");

        davClient.propfind(
            dirPath,
            function( status, data ) {
                console.log("Dirlist Status:  "+status);
                //console.log("Dirlist Content: "+JSON.stringify(data._responses));
                var anotatedDirList = [],
                    dirList = data._responses,
                    fileName,
                    isDir,
                    filesize,
                    lmdt;

                for (var entry in dirList) {
                    var path = dirList[entry].href;
                    if(dirPath !== path) {
                        isDir = false;
                        filesize = undefined;
                        lmdt = undefined;
                        //console.log(dirList[entry]._namespaces["DAV:"]);
                        if (typeof dirList[entry]._namespaces["DAV:"].getcontentlength === 'undefined') {
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
                TSPOSTIO.listDirectory(anotatedDirList);
            },
            1 //1 , davClient.INFINITY
        );
    }

    function getNameForPath(path) {
        if(path.lastIndexOf("/") == path.length-1) {
            path = path.substring(0,path.lastIndexOf("/"));
        }
        var encodedName = path.substring(path.lastIndexOf("/")+1, path.length);
        return decodeURI(encodedName);
    }

    function isDirectory(path) {
        return path.lastIndexOf("/") == path.length-1;
    }

    var createDirectoryIndex = function(dirPath) {
        console.log("Creating index for directory: "+dirPath);
        TSCORE.showLoadingAnimation();  
        
        var directoryIndex = [];
        TSPOSTIO.createDirectoryIndex(directoryIndex);
    };	
    
    var createDirectoryTree = function(dirPath) {
        console.log("Creating directory index for: "+dirPath);
        TSCORE.showLoadingAnimation();  
                
        var directoyTree = [];
        //console.log(JSON.stringify(directoyTree));
        TSPOSTIO.createDirectoryTree(directoyTree);
    };    
	
    var createDirectory = function(dirPath) {
        console.log("Creating directory: "+dirPath);
        davClient.mkcol(
            dirPath,
            function( status, data, headers ) {
                console.log("Directory Creation Status/Content/Headers:  "+status+" / "+data+" / "+headers);
                TSPOSTIO.createDirectory(dirPath);
            }
        );
    };

    var copyFile = function(filePath, newFilePath) {
        console.log("Copying file: "+filePath+" to "+newFilePath);
        davClient.copy(
            filePath,
            function( status, data, headers ) {
                console.log("Copy File Status/Content/Headers:  "+status+" / "+data+" / "+headers);
                TSPOSTIO.copyFile(filePath, newFilePath);
            },
            newFilePath,
            davClient.FAIL_ON_OVERWRITE
        );
    };

    var renameFile = function(filePath, newFilePath) {
        console.log("Renaming file: "+filePath+" to "+newFilePath);
        davClient.move(
            filePath,
            function( status, data, headers ) {
                console.log("Rename File Status/Content/Headers:  "+status+" / "+data+" / "+headers);
                TSPOSTIO.renameFile(filePath, newFilePath);
            },
            newFilePath,
            davClient.FAIL_ON_OVERWRITE
        );
    };

    var renameDirectory = function(dirPath, newDirName) {
        var newDirPath = TSCORE.TagUtils.extractParentDirectoryPath(dirPath) + TSCORE.dirSeparator + newDirName;
        console.log("Renaming directory: "+dirPath+" to "+newDirPath);
        davClient.move(
            dirPath,
            function( status, data, headers ) {
                console.log("Rename Directory Status/Content/Headers:  "+status+" / "+data+" / "+headers);
                TSPOSTIO.renameDirectory(dirPath, newDirPath);
            },
            newDirPath,
            davClient.FAIL_ON_OVERWRITE
        );
    };
    	
    var loadTextFile = function(filePath) {
        console.log("Loading file: "+filePath);
        davClient.get(
            filePath,
            function( status, data, headers ) {
                console.log("Loading File Status/Content/Headers:  "+status+" / "+data+" / "+headers);
                TSPOSTIO.loadTextFile(data);
            }
            //,customHeaders
        );
        //TODO Perform file locking and unlocking
    };
	
    var saveTextFile = function(filePath,content,overWrite) {
      console.log("Saving file: "+filePath+" content: "+content);

      var isNewFile = false; // = !pathUtils.existsSync(filePath);
      davClient.propfind( filePath, function( status, data ) {
            console.log("Check file exists: Status / Content: "+status+" / "+data);
            if(status === "404") {
                isNewFile = true;
            }
            davClient.put(
                filePath,
                function( status, data, headers ) {
                    console.log("Creating File Status/Content/Headers:  "+status+" / "+data+" / "+headers);
                    TSPOSTIO.saveTextFile(filePath, isNewFile);
                },
                content
            );
        },1
      );
    };

    var saveBinaryFile = function(filePath,content) {
        console.log("Saving binary file: "+filePath+" content: "+content);

        var isNewFile = false;
        davClient.propfind( filePath, function( status, data ) {
            console.log("Check file exists: Status / Content: "+status+" / "+data);
            if(status === "404") {
                isNewFile = true;
            }
            if(isNewFile) {
                davClient.put(
                    filePath,
                    function( status, data, headers ) {
                        console.log("Creating File Status/Content/Headers:  "+status+" / "+data+" / "+headers);
                        TSPOSTIO.saveBinaryFile(filePath, isNewFile);
                    },
                    content
                );
            } else {
                TSCORE.showAlertDialog("File Already Exists.");
            }
        },1);
    };

    var deleteElement = function(path) {
      console.log("Deleting: "+path);
          davClient.remove(
              path,
              function( status, data, headers ) {
                  console.log("Directory/File Deletion Status/Content/Headers:  "+status+" / "+data+" / "+headers);
                  TSPOSTIO.deleteElement(path);
              }
          );
    };

    var deleteDirectory = function(path) {
        console.log("Deleting directory: "+path);
        davClient.remove(
            path,
            function( status, data, headers ) {
                console.log("Directory/File Deletion Status/Content/Headers:  "+status+" / "+data+" / "+headers);
                TSPOSTIO.deleteDirectory(path);
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
        davClient.propfind( filePath, function( status, data ) {
                console.log("Properties Status / Content: "+status+" / "+JSON.stringify(data._responses));
                var fileProperties = {};
                for (var entry in data._responses) {
                    fileProperties.path = filePath;
                    fileProperties.size = data._responses[entry]._namespaces["DAV:"].getcontentlength;
                    fileProperties.lmdt = data._responses[entry]._namespaces["DAV:"].getlastmodified._xmlvalue[0].data;
                }
                TSPOSTIO.getFileProperties(fileProperties);
            },1
        );
    };

    // Bring the TagSpaces window on top of the windows
    var focusWindow = function() {
        window.focus();
    };

    exports.focusWindow                 = focusWindow;
    exports.createDirectory             = createDirectory;
    exports.copyFile                    = copyFile;
    exports.renameFile                  = renameFile;
    exports.renameDirectory             = renameDirectory;
    exports.loadTextFile                = loadTextFile;
    exports.saveTextFile                = saveTextFile;
    exports.saveBinaryFile              = saveBinaryFile;
    exports.listDirectory               = listDirectory;
    exports.deleteElement               = deleteElement;
    exports.deleteDirectory             = deleteDirectory;
    exports.createDirectoryIndex        = createDirectoryIndex;
    exports.createDirectoryTree         = createDirectoryTree;
    exports.selectDirectory             = selectDirectory;
    exports.openDirectory               = openDirectory;
    exports.openFile                    = openFile;
    exports.selectFile                  = selectFile;
    exports.openExtensionsDirectory     = openExtensionsDirectory;
    exports.checkAccessFileURLAllowed   = checkAccessFileURLAllowed;
    exports.checkNewVersion             = checkNewVersion;
    exports.getFileProperties           = getFileProperties;
});