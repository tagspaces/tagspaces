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
        TSCORE.hideWaitingDialog();
    };   
    
    exports.createDirectoryTree = function(directoyTree) {
        TSCORE.PerspectiveManager.updateTreeData(directoyTree);
        TSCORE.hideWaitingDialog();
    };
    
    exports.createDirectory = function(dirPath) {
        TSCORE.navigateToDirectory(dirPath);
        TSCORE.hideWaitingDialog();
    };

    exports.copyFile = function(sourceFilePath, targetFilePath) {
        var targetDirectory = TSCORE.TagUtils.extractContainingDirectoryPath(targetFilePath);
        if(targetDirectory === TSCORE.currentPath) {
            TSCORE.navigateToDirectory(TSCORE.currentPath);
            TSCORE.PerspectiveManager.clearSelectedFiles();
        }
        TSCORE.hideWaitingDialog();
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
            //TSCORE.removeFileModel(TSCORE.fileList, oldFilePath);
            //TSCORE.PerspectiveManager.removeFileUI(oldFilePath);
            TSCORE.navigateToDirectory(TSCORE.currentPath);
        } else {
            // File was renamed
            TSCORE.updateFileModel(TSCORE.fileList, oldFilePath, newFilePath);
            TSCORE.PerspectiveManager.updateFileUI(oldFilePath, newFilePath);            
        } 
        TSCORE.hideWaitingDialog();
        TSCORE.PerspectiveManager.clearSelectedFiles();
    };

    exports.renameDirectory = function(dirOldPath, dirNewPath) {
        TSCORE.navigateToDirectory(dirNewPath);
        TSCORE.hideLoadingAnimation();
    };

    exports.loadTextFile = function(content) {
        TSCORE.FileOpener.updateEditorContent(content);
        TSCORE.hideLoadingAnimation();
    };

    exports.saveBinaryFile = function(filePath) {
        TSCORE.PerspectiveManager.refreshFileListContainer();
    };

    exports.saveTextFile = function(filePath, isNewFile) {
        TSCORE.PerspectiveManager.refreshFileListContainer();

        if(isNewFile) {
            // If file is new open it in edit mode
            TSCORE.FileOpener.openFile(filePath, true);
        }
        TSCORE.FileOpener.setFileChanged(false);
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

    exports.errorOpeningPath = function(dirPath) {
        // Normalazing the paths
        var dir1 = TSCORE.TagUtils.cleanTrailingDirSeparator(TSCORE.currentLocationObject.path);
        var dir2 = TSCORE.TagUtils.cleanTrailingDirSeparator(dirPath);
        // Close the current location if the its path could not be opened
        if(dir1 === dir2) {
            TSCORE.showAlertDialog($.i18n.t("ns.dialogs:errorOpeningLocationAlert"));
            TSCORE.closeCurrentLocation();
        } else {
            TSCORE.showAlertDialog($.i18n.t("ns.dialogs:errorOpeningPathAlert"));
        }
     };
    
    exports.deleteElement = function(filePath) {
        TSCORE.removeFileModel(TSCORE.fileList, filePath);
        TSCORE.PerspectiveManager.removeFileUI(filePath);
        if(filePath === TSCORE.FileOpener.getOpenedFilePath()) {
            TSCORE.FileOpener.closeFile(true);
        }
        TSCORE.hideLoadingAnimation();        
    };

    exports.deleteDirectory = function(dirPath) {
        TSCORE.navigateToDirectory(TSCORE.TagUtils.extractParentDirectoryPath(dirPath));
        TSCORE.hideLoadingAnimation();
    };

    exports.deleteDirectoryFailed = function(dirPath) {
        console.log("Deleting of '"+dirPath+"' failed");
        TSCORE.showAlertDialog($.i18n.t("ns.dialogs:errorDeletingDirectoryAlert"));
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
        $("#moveCopyDirectoryPath").val(dirPath);
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