/* Copyright (c) 2012-2014 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */
define(function(require, exports, module) {
"use strict";
    
    // Activating browser specific exports modul
    console.log("Loading postioapi.js ...");

    var TSCORE = require("tscore");
    
    exports.createDirectoryIndex = function(directoryIndex) {
        console.log("Directory index created");
        TSCORE.PerspectiveManager.updateFileBrowserData(directoryIndex);
        //TSCORE.hideLoadingAnimation();        
    };   
    
    exports.createDirectoryTree = function(directoyTree) {
        TSCORE.PerspectiveManager.updateTreeData(directoyTree);
        //TSCORE.hideLoadingAnimation();         
    };    
    
    exports.createDirectory = function(dirPath) {
        //TODO evtl navigate to parent dir
        TSCORE.navigateToDirectory(dirPath);
        TSCORE.hideLoadingAnimation();        
    };

    exports.renameFile = function(oldFilePath, newFilePath) {
        var lastOpenedFile = TSCORE.FileOpener.getOpenedFilePath();        
        if(lastOpenedFile != undefined) {
            console.log("Last opened Filename: "+lastOpenedFile);
            // TODO handle case in which a file opened for editing and a tag has been added / file renamed
            if(TSCORE.FileOpener.isFileOpened() && (oldFilePath == lastOpenedFile) ) {
                TSCORE.FileOpener.openFile(newFilePath);                    
            }
        }

        var oldFileContainingPath = TSCORE.TagUtils.extractContainingDirectoryPath(oldFilePath),
            newFileConaintingPath = TSCORE.TagUtils.extractContainingDirectoryPath(newFilePath);
        if(oldFileContainingPath !== newFileConaintingPath) {
            // File was moved
            // TODO consider case - file was moved in subdir shown in the recursive search results
            TSCORE.removeFileModel(TSCORE.fileList, oldFilePath);
            TSCORE.PerspectiveManager.removeFileUI(oldFilePath);    
        } else {
            // File was just renamed
            TSCORE.updateFileModel(TSCORE.fileList, oldFilePath, newFilePath);
            TSCORE.PerspectiveManager.updateFileUI(oldFilePath, newFilePath);            
        } 
        TSCORE.hideLoadingAnimation();    
        TSCORE.PerspectiveManager.clearSelectedFiles();
    };
        
    exports.loadTextFile = function(content) {
        TSCORE.FileOpener.updateEditorContent(content);
        TSCORE.hideLoadingAnimation();
    };
    
    exports.saveTextFile = function(filePath, isNewFile) {
        // If the file is new, then refresh the filelist 
        if(isNewFile) {
            TSCORE.PerspectiveManager.refreshFileListContainer();            
        }
        //if(!TSCORE.FileOpener.isFileOpened()) {
            TSCORE.FileOpener.openFile(filePath);                    
        //}
        TSCORE.hideLoadingAnimation();                             
    };
    
    exports.listDirectory = function(anotatedDirList) {
        TSCORE.PerspectiveManager.updateFileBrowserData(anotatedDirList);
        TSCORE.updateSubDirs(anotatedDirList);
    };

    exports.listSubDirectories = function(dirList, dirPath) {
        console.log("Listing Subdirs: "+JSON.stringify(dirList));
        TSCORE.subfoldersDirBrowser = dirList;
        if(TSCORE.directoryBrowser !== undefined) {
            TSCORE.directoryBrowser.reInitUI(dirPath);            
        }
    };

    exports.errorOpeningPath = function() {
        TSCORE.showAlertDialog($.i18n.t("ns.dialogs:errorOpeningLocationAlert"));
        TSCORE.closeCurrentLocation();
    };
    
    exports.deleteElement = function(filePath) {
        TSCORE.removeFileModel(TSCORE.fileList, filePath);
        TSCORE.PerspectiveManager.removeFileUI(filePath);
        TSCORE.closeFileViewer();
        TSCORE.hideLoadingAnimation();        
    };
    
    exports.checkNewVersion = function(data) {
        TSCORE.updateNewVersionData(data);    
    };  

    exports.selectDirectory = function(dirPath) {
        // TODO make the use of this function more general
        if(!TSCORE.TagUtils.stringEndsWith(dirPath, TSCORE.dirSeparator)) {
            dirPath = dirPath + TSCORE.dirSeparator;
        }
        var dirName = TSCORE.TagUtils.extractContainingDirectoryName(dirPath);
        $("#connectionName").val(dirName);                
        $("#folderLocation").val(dirPath);
        $("#folderLocation2").val(dirPath);        
    };
    
    exports.openDirectory = function(dirPath) {

    };

    exports.selectFile = function() {
        console.log("File selected: "+$(this).val());
    };
    
    exports.openExtensionsDirectory = function() {
    
    };
    
    exports.getFileProperties = function(fileProperties) {
        console.log("File properties: "+JSON.stringify(fileProperties));
        TSCORE.FileOpener.setFileProperties(fileProperties);
    };
    
});