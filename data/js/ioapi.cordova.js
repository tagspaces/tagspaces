/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define(function (require, exports, module) {
    "use strict";

    console.log("Loading ioapi.cordova.js..");

    var TSCORE = require("tscore");
    
    var TSPOSTIO = require("tspostioapi");   

    var fsRoot = undefined;

    document.addEventListener("deviceready", onDeviceReady, false);

    // Cordova loaded and can be used
    function onDeviceReady() {
        console.log("Devive Ready: "+device.platform+" - "+device.version);
        getFileSystem();
    }

    function getFileSystem() {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
            function (fileSystem) { // success get file system
                fsRoot = fileSystem.root;
                console.log("Filesystem Name: " + fsRoot.fullPath);
            }, 
            function (evt) { // error get file system
                console.log("File System Error: " + evt.target.error.code);
            }
        );
    }

    // TODO recursivly calling callback not working        
    function scanDirectory(dirPath, index) {

    }
    
    // TODO recursivly calling callback not working
    function generateDirectoryTree(dirPath) {        

    }   
    
    function isWindows() {
        return (navigator.platform == 'Win32');
    }
    
    function getDirseparator() {
        if(isWindows()) {
            return "\\";
        } else {
            return "/";
        }
    }
    
    function normalizePath(path) {
        if(path.indexOf(fsRoot.fullPath) >= 0) {
            path = path.substring(fsRoot.fullPath.length+1, path.length);                    
        }
        return path;
    }
    
    var checkNewVersion = function() {
        console.log("Checking for new version...");
        var cVer = TSCORE.Config.DefaultSettings["appVersion"]+"."+TSCORE.Config.DefaultSettings["appBuild"];
        $.ajax({
            url: 'http://tagspaces.org/releases/version.json?pVer='+cVer,
            type: 'GET',
        })
        .done(function(data) { 
            TSPOSTIO.checkNewVersion(data);    
        })
        .fail(function(data) { 
            console.log("AJAX failed "+data); 
        })
        ;            
    };   
    
    var listDirectory = function (dirPath) {
        // directory path format DCIM/Camera/ !
        dirPath = dirPath+"/"; // TODO make it platform independent
        dirPath = normalizePath(dirPath);
        
        console.log("Listing directory: " + dirPath);

        fsRoot.getDirectory(dirPath, {create: false, exclusive: false}, 
            function (dirEntry) {
                var directoryReader = dirEntry.createReader();
        
                // Get a list of all the entries in the directory
                directoryReader.readEntries(
                    function (entries) { 
                        var i;
                        var anotatedDirList = [];
                        for (i = 0; i < entries.length; i++) {
                            console.log("File: "+entries[i].name);
                            anotatedDirList.push({
                                "name":   entries[i].name,
                                "isFile": entries[i].isFile,
                                "size":   "0",
                                "lmdt":   "0",
                                "path":   entries[i].fullPath
                            });                            
                            // TODO get file size and last modified date in cordova     
                        }
                        //console.log("Dir content: " + JSON.stringify(entries));
                        TSPOSTIO.listDirectory(anotatedDirList);  
                    }, function (error) { // error get file system
                        console.log("Dir List Error: " + error.code);
                    }            
               );
           },
           function (error) {
                console.log("Getting dir: "+dirPath+" failed with error code: " + error.code);
           }                
        ); 
    };

    var deleteElement = function(path) {
        console.log("Deleting: "+path);
        
        path = normalizePath(path);
 
        fsRoot.getFile(path, {create: false, exclusive: false}, 
            function(entry) {
                entry.remove(
                    function() {
                        console.log("file deleted: "+path);
                    },
                    function() {
                        console.log("error deleting: "+path);
                    }                                  
                );
            },
            function() {
                console.log("error getting file");
            }        
        );
    };

    var createDirectoryIndex = function(dirPath) {
        console.log("Creating index for directory: "+dirPath);
        TSCORE.showAlertDialog("Creating directory index is not supported on Android yet.");                 
/*        var directoryIndex = [];
        directoryIndex = scanDirectory(dirPath, directoryIndex);
        console.log(JSON.stringify(directoryIndex));
        TSPOSTIO.createDirectoryIndex(directoryIndex); */
    };
    
    var createDirectoryTree = function(dirPath) {
        console.log("Creating directory index for: "+dirPath);
        TSCORE.showAlertDialog("Creating directory tree is not supported on Android yet.");                 
/*        var directoyTree = generateDirectoryTree(dirPath);
        //console.log(JSON.stringify(directoyTree));
        TSPOSTIO.createDirectoryTree(directoyTree);*/
    };

    var loadTextFile = function(filePath) {
        filePath = normalizePath(filePath);
        console.log("Loading file: "+filePath);
        fsRoot.getFile(filePath, {create: false, exclusive: false}, 
            function(entry) {
                entry.file(
                    function(file) {
                        var reader = new FileReader();
                        reader.onloadend = function(evt) {
                            TSPOSTIO.loadTextFile(evt.target.result); 
                        };
                        reader.readAsText(file);                              
                    },
                    function() {
                        console.log("error getting file: "+filePath);
                    }                                  
                );
            },
            function() {
                console.log("Error getting file entry: "+filePath);
            }        
        ); 
    };
    
    var saveTextFile = function(filePath,content) {
        filePath = normalizePath(filePath);
        console.log("Saving file: "+filePath);
        fsRoot.getFile(filePath, {create: true, exclusive: false}, 
            function(entry) {
                entry.createWriter(
                    function(writer) {
                        writer.onwriteend = function(evt) {
                            TSPOSTIO.saveTextFile(fsRoot.fullPath+"/"+filePath);
                        };
                        writer.write(content);                           
                    },
                    function() {
                        console.log("error creating writter file: "+filePath);
                    }                                  
                );
            },
            function() {
                console.log("Error getting file entry: "+filePath);
            }        
        ); 
    };   

    var createDirectory = function(dirPath) {
        dirPath = normalizePath(dirPath);
        console.log("Creating directory: "+dirPath);    
        fsRoot.getDirectory(dirPath, {create: true, exclusive: false}, 
           function (dirEntry) {
                TSPOSTIO.createDirectory();
           },
           function (error) {
                console.log("Creating directory failed: "+dirPath+" failed with error code: " + error.code);
           }  
        );
    }; 
    
    var renameFile = function(filePath, newFilePath) {
        filePath = normalizePath(filePath);
        var newFileName = newFilePath.substring(newFilePath.lastIndexOf('/')+1);
        var newFileParentPath = normalizePath(newFilePath.substring(0, newFilePath.lastIndexOf('/')));
        // TODO check if the newFilePath exist or cause issues by renaming
        fsRoot.getDirectory(newFileParentPath, {create: false, exclusive: false}, 
            function (parentDirEntry) {
                fsRoot.getFile(filePath, {create: false, exclusive: false}, 
                    function(entry) {
                        entry.moveTo(
                            parentDirEntry,
                            newFileName,
                            function() {
                                console.log("file renamed to: "+newFilePath);
                                TSPOSTIO.renameFile(filePath, newFilePath);                                
                            },
                            function() {
                                console.log("error renaming: "+filePath);
                            }                                  
                        );
                    },
                    function() {
                        console.log("Error getting file: "+filePath);
                    }        
                );      
           },
           function (error) {
                console.log("Getting dir: "+newFileParentPath+" failed with error code: " + error.code);
           }                
        );
    };

    var selectDirectory = function() {
        console.log("Operation selectDirectory not supported on Android yet!");
        TSCORE.showAlertDialog("Selecting directory not supported on Android yet, please enter the desired directory path manually in the textbox!");         
    };

    var selectFile = function() {
        console.log("Operation selectFile not supported on Android!");
    };
    
    var checkAccessFileURLAllowed = function() {
        console.log("checkAccessFileURLAllowed function not relevant for Android..");        
    };
    
    var openDirectory = function(dirPath) {
        TSCORE.showAlertDialog("Select file functionality not supported on Android!");
    };
    
    var openExtensionsDirectory = function() {
        TSCORE.showAlertDialog("Open extensions directory functionality not supported on Android!"); 
    };
    
	exports.createDirectory 			= createDirectory; 
	exports.renameFile 					= renameFile;
	exports.loadTextFile 				= loadTextFile;
	exports.saveTextFile 				= saveTextFile;
	exports.listDirectory 				= listDirectory;
	exports.deleteElement 				= deleteElement;
    exports.createDirectoryIndex 		= createDirectoryIndex;
    exports.createDirectoryTree 		= createDirectoryTree;
	exports.selectDirectory 			= selectDirectory;
	exports.openDirectory				= openDirectory;
	exports.selectFile 					= selectFile;
	exports.openExtensionsDirectory 	= openExtensionsDirectory;
	exports.checkAccessFileURLAllowed 	= checkAccessFileURLAllowed;
	exports.checkNewVersion 			= checkNewVersion;	    
});