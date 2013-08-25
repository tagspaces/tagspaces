/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define(function (require, exports, module) {
    "use strict";

    // Activating browser specific exports modul
    console.log("Loading ioapi.cordova.js..");

    var TSCORE = require("tscore");
    
    var TSPOSTIO = require("tspostioapi");   

    var fsRoot = undefined;

    document.addEventListener("deviceready", onDeviceReady, false);

    // Cordova loaded and can be used
    function onDeviceReady() {
        console.log(">>>>>>>>>>>>>>>>>>>>>>> Dev Ready: "+device.platform+" - "+device.version);
        getFileSystem();
    }

    function getFileSystem() {
        console.log(">>>>>>>>>>>>>>>>>>>>>>> FS");
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
            function (fileSystem) { // success get file system
                fsRoot = fileSystem.root;
                console.log("Filesystem Name: " + fsRoot.fullPath);
            }, function (evt) { // error get file system
                console.log("File System Error: " + evt.target.error.code);
            }
        );
   }

    function scanDirectory(dirPath, index) {
        try {  
            var dirList = nativeIO.getDirEntries(dirPath);
            for (var i=0; i < dirList.length; i++) {
                var path = dirPath+getDirseparator()+dirList[i];
                var isDir = nativeIO.isDirectory(path);
                var fileSize = 0; //nativeIO.getFileSize(path);
                index.push({
                    "name": dirList[i],
                    "type": isDir?"directory":"file",
                    "size": fileSize,
                    "lmdt": "0",
                    "path": path  
                }); 
                if (isDir) {
                    scanDirectory(path, index);
                }                           
            }
            return index;
        } catch(ex) {
            console.error("Listing directory failed "+ex);
        }   
    }
    
    function generateDirectoryTree(dirPath) {
        try {
            var tree = {}; 
            tree["name"] = dirPath.substring(dirPath.lastIndexOf(getDirseparator()) + 1, dirPath.length);
            tree["type"] = "directory";
            tree["lmdt"] = 0;   
            tree["path"] = dirPath;         
            tree["children"] = [];            
            var dirList = nativeIO.getDirEntries(dirPath); 
            for (var i=0; i < dirList.length; i++) {
                var path = dirPath+getDirseparator()+dirList[i];
                var isDir = nativeIO.isDirectory(path);
                if (!isDir) {
                    tree["children"].push({
                        "name": dirList[i],
                        "type": "file",
                        "size": 0,
                        "lmdt": 0,   
                        "path": path 
                    });            
                } else {
                    tree["children"].push( generateDirectoryTree(path) );                   
                }  
            }
            return tree;
        } catch(ex) {
            console.error("Scanning directory "+dirPath+" failed "+ex);
        }         
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
        if(path.indexOf(fsRoot.path) > 0) {
            path.substring(fsRoot.path.length+1, path.length);                    
        }
        return path;
    }
    
    exports.checkNewVersion = function() {
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
    }   
    
    exports.loadTextFile = function(filePath) {
        console.log("Loading file: "+filePath);
  
    }
    
    exports.listDirectory = function (dirPath) {
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
                            console.log(entries[i].name);
                            anotatedDirList.push({
                                "name": entries[i].name,
                                "type": entries[i].isDirectory ? "directory" : "file",
                                "size": "0",
                                "lmdt": "0",
                                "path": entries[i].fullPath
                            });
                        }
                        // {"isFile":true,"isDirectory":false,"name":"bla.png","fullPath":"C:\\Users\\na\\Documents\\bla.png","filesystem":null}
                        console.log("Dir content: " + JSON.stringify(entries));
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
    }
    
    exports.getSubdirs = function(dirPath) {
        dirPath = dirPath+"/"; // TODO make it platform independent
        dirPath = normalizePath(dirPath);
                
        console.log("Getting subdirs: "+dirPath);
        
        fsRoot.getDirectory(dirPath, {create: false, exclusive: false}, 
            function (dirEntry) {
                var directoryReader = dirEntry.createReader();        
                // Get a list of all the entries in the directory
                directoryReader.readEntries(
                    function (entries) { 
                        var i;
                        var anotatedDirList = [];
                        for (i = 0; i < entries.length; i++) {
                            console.log(entries[i].name);
                            if(entries[i].isDirectory) {
                                anotatedDirList.push({
                                    "title": entries[i].name,
                                    "isFolder": true,
                                    "key": entries[i].fullPath
                                }); 
                            }                              
                        }
                        console.log("Subdir content: " + JSON.stringify(entries));
                        TSPOSTIO.getSubdirs(anotatedDirList);                      
                        
                    }, function (error) { // error get file system
                        console.log("Dir List Error: " + error.code);
                    }            
               );
           },
           function (error) {
                console.log("Getting dir: "+dirPath+" failed with error code: " + error.code);
           }                
        );         
    }

    exports.deleteElement = function(path) {
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
    }

    exports.createDirectoryIndex = function(dirPath) {
        console.log("Creating index for directory: "+dirPath);
        var directoryIndex = [];
        directoryIndex = scanDirectory(dirPath, directoryIndex);
        //console.log(JSON.stringify(directoryIndex));
        TSPOSTIO.createDirectoryIndex(directoryIndex);
    }
    
    exports.createDirectoryTree = function(dirPath) {
        console.log("Creating directory index for: "+dirPath);
        var directoyTree = generateDirectoryTree(dirPath);
        //console.log(JSON.stringify(directoyTree));
        TSPOSTIO.createDirectoryTree(directoyTree);
    }

    exports.saveTextFile = function(filePath,content) {
        console.log("Saving file: "+filePath);

    }   

    exports.createDirectory = function(dirPath) {
        console.log("Creating directory: "+dirPath);    

    }  
    
    exports.renameFile = function(filePath, newFilePath) {
        filePath = normalizePath(filePath);
        var newFileName = newFilePath.substring(newFilePath.lastIndexOf('/')+1);
        var parentDirEntry = undefined;
        
        fsRoot.getDirectory(dirPath, {create: false, exclusive: false}, 
            function (dirEntry) {
                var directoryReader = dirEntry.createReader();        

           },
           function (error) {
                console.log("Getting dir: "+dirPath+" failed with error code: " + error.code);
           }                
        );         
        
        fsRoot.getFile(filePath, {create: false, exclusive: false}, 
            function(entry) {
                entry.moveTo(
                    parentDirEntry,
                    newFileName,
                    function() {
                        console.log("file renamed to: "+newFilePath);
                    },
                    function() {
                        console.log("error renaming: "+filePath);
                    }                                  
                );
            },
            function() {
                console.log("error getting file");
            }        
        );
    }

    exports.selectDirectory = function() {
        console.log("Select directory!");

    }

    exports.selectFile = function() {
        console.log("Select file!");

    }
    
    exports.checkAccessFileURLAllowed = function() {
        console.log("checkAccessFileURLAllowed function not relevant for android..");        
    }
    
    exports.openDirectory = function(dirPath) {
        // TODO implement openDirectory
        console.log("Open directory functionality not implemented on android yet!");
        TSCORE.showAlertDialog("Select file functionality not implemented on chrome yet!");
    }
    
    exports.openExtensionsDirectory = function() {
        // TODO implement openExtensionsDirectory
        console.log("Open extensions directory functionality not implemented on android yet!");
        TSCORE.showAlertDialog("Open extensions directory functionality not implemented on chrome yet!"); 
    }
});