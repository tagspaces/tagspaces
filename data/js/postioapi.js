/* Copyright (c) 2012-2013 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define(function(require, exports, module) {
"use strict";
    
    // Activating browser specific exports modul
    console.log("Loading  post ioapi ...");

    var TSCORE = require("tscore");
    
    exports.createDirectoryIndex = function(directoryIndex) {
        TSCORE.PerspectiveManager.updateFileBrowserData(directoryIndex);
    }   
    
    exports.createDirectoryTree = function(directoyTree) {
        TSCORE.PerspectiveManager.updateTreeData(directoyTree); 
    }    
    
    exports.createDirectory = function() {
        //TODO refresh the directory area
        // TSCORE.openFavorite(TSCORE.Config.Settings["tagspacesList"][0].path, TSCORE.Config.Settings["tagspacesList"][0].name);
    }

    exports.renameFile = function(oldFilePath, newFilePath) {
        // TODO handle case in which a file opened for editing and a tag has been added
        if(TSCORE.FileOpener.isFileOpened() && (oldFilePath == TSCORE.FileOpener.getOpenedFilePath()) ) {
            TSCORE.FileOpener.openFile(newFilePath);                    
        }
        // TODO to be replaced with a function which replaced the 
        // renamed file in the model of the perspective        
        TSCORE.PerspectiveManager.refreshFileListContainer();
    }
        
    exports.loadTextFile = function(content) {
        TSCORE.FileOpener.updateEditorContent(content);             
    }
    
    exports.saveTextFile = function() {
        TSCORE.PerspectiveManager.refreshFileListContainer();
        if(TSCORE.FileOpener.isFileOpened()) {
            // TODO Automatically reopening of the file is not desirable in every case ...
            //TSCORE.FileOpener.openFile(message.content);                    
        }                     
    }
    
    exports.listDirectory = function(anotatedDirList) {
        TSCORE.PerspectiveManager.updateFileBrowserData(anotatedDirList);
    }
    
    exports.getSubdirs = function(anotatedDirList) {
        TSCORE.updateSubDirs(anotatedDirList);
    }
    
    exports.deleteElement = function() {
        TSCORE.PerspectiveManager.refreshFileListContainer();
    }
    
    exports.checkNewVersion = function(data) {
        TSCORE.updateNewVersionData(data);    
    }   

    exports.selectDirectory = function(dirPath) {
        // TODO make the use of this function more general        
        $("#folderLocation").val(dirPath);
    }
    
    exports.openDirectory = function(dirPath) {

    }

    exports.selectFile = function() {
        console.log("File selected: "+$(this).val());
    }
    
    exports.openExtensionsDirectory = function() {
    }
});