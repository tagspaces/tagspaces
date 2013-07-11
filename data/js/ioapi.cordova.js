/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define(function (require, exports, module) {
    "use strict";

    // Activating browser specific exports modul
    console.log("Loading ioapi.cordova.js..");

    var TSCORE = require("tscore");

    var fsRoot = undefined;

    // handling document ready and phonegap deviceready
    window.addEventListener('load', function () {
        console.log(">>>>>>>>>>>>>>>>>>>>>>> Add Ev Li");
        document.addEventListener('deviceready', onDeviceReady, false);
    }, false);

    // Phonegap is loaded and can be used
    function onDeviceReady() {
        console.log(">>>>>>>>>>>>>>>>>>>>>>> Dev Ready");
        getFileSystem();
    }

    /* get the root file system */
//    function getFileSystem() {
        console.log(">>>>>>>>>>>>>>>>>>>>>>> FS");
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
            function (fileSystem) { // success get file system
                fsRoot = fileSystem.root;
                console.log("Filesystem: " + fsRoot);
            }, function (evt) { // error get file system
                console.log("File System Error: " + evt.target.error.code);
            }
        );
 //   }

    exports.createDirectory = function (dirPath) {
        console.log("Creating directory: " + dirPath);
    }

    exports.loadTextFile = function (filePath) {
        console.log("Loading file: " + filePath);
    }

    exports.renameFile = function (filePath, newFilePath) {
        console.log("Renaming file: " + filePath + " to " + newFilePath);
    }

    exports.saveTextFile = function (filePath, content) {
        console.log("Saving file: " + filePath);
    }

    exports.listDirectory = function (dirPath) {
        console.log("Listing directory: " + dirPath);
        //dirPath = "C:\\Users\\na\\Documents";
        var curDirectory = new DirectoryEntry("Documents1",dirPath);

        if(curDirectory.isDirectory) {
            var dirReader = curDirectory.createReader();
            dirReader.readEntries(
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
                    //console.log("Dir content: " + JSON.stringify(entries));
                    TSCORE.PerspectiveManager.updateFileBrowserData(anotatedDirList);
                },
                function (ex) {
                    console.log("Listing directory " + dirPath + " failed: " + ex);
                }
            );
        } else {
            console.error("Directory does not exists.");    
        }   
    }

    exports.getSubdirs = function (dirPath) {
        console.log("Getting subdirs: " + dirPath);
    }

    exports.deleteElement = function (path) {
        console.log("Deleting: " + path);
        //    IOAPI.plugin.removeFile(path)
    }

    exports.selectDirectory = function () {
        // TODO implement selectDirectory
        console.log("Select directory functionality not implemented on cordova yet!");
    }

    exports.selectFile = function () {
        // TODO implement selectFile
        console.log("Select file functionality not implemented on cordova yet!");
    }

    exports.openDirectory = function (dirPath) {
        // TODO implement openDirectory
        console.log("Open directory functionality not implemented on cordova yet!");
    }

    exports.openExtensionsDirectory = function () {
        // TODO implement openExtensionsDirectory
        console.log("Open extensions directory functionality not implemented on cordova yet!");
    }

    exports.checkNewVersion = function () {
        console.log("Checking for new version...");
        var cVer = TSCORE.Config.DefaultSettings["appVersion"] + "." + TSCORE.Config.DefaultSettings["appBuild"];
        $.ajax({
            url: 'http://tagspaces.org/releases/version.json?pVer=' + cVer,
            type: 'GET',
        })
        .done(function (data) {
            TSCORE.updateNewVersionData(data);
        })
        .fail(function (data) {
            console.log("AJAX failed " + data);
        })
        ;

    }
});