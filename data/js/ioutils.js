/* Copyright (c) 2012-2015 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */
/* global define  */

/**
 * Description
 * @class IOAPI
 */
define(function(require, exports, module) {
  'use strict';
  console.log('Loading ioutils.js ...');

  var TSCORE = require('tscore');

  var stopDirectoryWalking = false;
  var searchResultsCounter = 0;

  function walkDirectory(path, options, fileCallback, dirCallback) {
    return TSCORE.IO.listDirectoryPromise(path, true).then(function(entries) {
      return Promise.all(entries.map(function(entry) {
        if (!options) {
          options = {};
          options.recursive = false;
        }
        if (entry.isFile) {
          if (fileCallback) {
            return fileCallback(entry);
          } else {
            return entry;
          }
        } else {
          if (dirCallback) {
            return dirCallback(entry);
          }
          if (options.recursive) { //  && !stopDirectoryWalking &&
            return walkDirectory(entry.path, options, fileCallback, dirCallback);
          } else {
            return entry;
          }
        }
      }));
    }).catch(function(err) {
      console.warn("Error walking directory " + err);
      return null;
    });
  }

  function listSubDirectories(dirPath) {
    console.log("Listing sub directories: " + dirPath);
    TSCORE.showLoadingAnimation();
    TSCORE.IO.listDirectoryPromise(dirPath).then(function(entries) {
      var anotatedDirList = [];
      var firstEntry = 0;
      // skiping the first entry pointing to the parent directory
      if (isChrome) {
        firstEntry = 1;
      }
      for (var i = firstEntry; i < entries.length; i++) {
        if (!entries[i].isFile) {
          anotatedDirList.push({
            "name": entries[i].name,
            "path": entries[i].path
          });
        }
      }
      TSCORE.subfoldersDirBrowser = anotatedDirList;
      if (TSCORE.directoryBrowser !== undefined) {
        TSCORE.directoryBrowser.reInitUI(dirPath);
      }      
    }).catch(function(error) {
      var dir1 = TSCORE.TagUtils.cleanTrailingDirSeparator(TSCORE.currentLocationObject.path);
      var dir2 = TSCORE.TagUtils.cleanTrailingDirSeparator(dirPath);
      // Close the current location if the its path could not be opened
      if (dir1 === dir2) {
        TSCORE.showAlertDialog($.i18n.t('ns.dialogs:errorOpeningLocationAlert'));
        TSCORE.closeCurrentLocation();
      } else {
        TSCORE.showAlertDialog($.i18n.t('ns.dialogs:errorOpeningPathAlert'));
      }

      TSCORE.hideLoadingAnimation();
      console.error("Error listDirectory " + dirPath + " error: " + error);
    });
  }

  function createDirectoryIndex(dirPath) {
    TSCORE.showWaitingDialog($.i18n.t("ns.common:waitDialogDiectoryIndexing"));

    var directoryIndex = [];
    TSCORE.IOUtils.walkDirectory(dirPath, {recursive: true}, function(fileEntry) {
      directoryIndex.push(fileEntry);
    }).then(function(entries) {
      TSCORE.hideWaitingDialog();
      TSCORE.PerspectiveManager.updateFileBrowserData(directoryIndex);
    }).catch(function(err) {
      console.warn("Error creating index: " + err);
      TSCORE.hideWaitingDialog();
    });
  }

  function createDirectoryTree(dirPath) {
    TSCORE.showWaitingDialog($.i18n.t("ns.common:waitDialogDiectoryIndexing"));
    // TODO user promiseAll
    var directoryTree = {};
    /*TSCORE.IOUtils.walkDirectory(dirPath, {recursive: true}, function(fileEntry) {
      directoryIndex.push(fileEntry);
    }).then(function(entries) {
      TSCORE.hideWaitingDialog();
      TSCORE.PerspectiveManager.updateFileBrowserData(directoryIndex);
    }).catch(function(err) {
      console.warn("Error creating index: " + err);
      TSCORE.hideWaitingDialog();
    });*/
  }

  function deleteFiles(filePathList) {
    TSCORE.showLoadingAnimation();
    var fileDeletionPromises = [];
    filePathList.forEach(function(filePath) {
      fileDeletionPromises.push(TSCORE.IO.deleteFilePromise(filePath));
    });

    Promise.all(fileDeletionPromises).then(function(fList) {
      fList.forEach(function(filePath) {
        TSCORE.Meta.deleteMetaData(filePath);
        TSCORE.PerspectiveManager.removeFileUI(filePath);
        if (filePath === TSCORE.FileOpener.getOpenedFilePath()) {
          TSCORE.FileOpener.closeFile(true);
        }
      });
      TSCORE.hideLoadingAnimation();
      TSCORE.showSuccessDialog("Files deleted successfully.");
    }, function(error) {
      TSCORE.hideLoadingAnimation();
      TSCORE.showAlertDialog("Deleting file " + filePath + " failed.");
      console.error("Deleting file " + filePath + " failed " + error);
    });
  }

  function renameFileSuccess(oldFilePath, newFilePath) {
    var lastOpenedFile = TSCORE.FileOpener.getOpenedFilePath();
    if (lastOpenedFile !== undefined) {
      console.log('Last opened Filename: ' + lastOpenedFile);
      // TODO handle case in which a file opened for editing and a tag has been added / file renamed
      if (isCordova) {
        lastOpenedFile = lastOpenedFile.substring(("file://").length, lastOpenedFile.length);
      }
      if (TSCORE.FileOpener.isFileOpened() && oldFilePath === lastOpenedFile) {
        TSCORE.FileOpener.openFile(newFilePath);
      }
    }
    var oldFileContainingPath = TSCORE.TagUtils.extractContainingDirectoryPath(oldFilePath),
      newFileConaintingPath = TSCORE.TagUtils.extractContainingDirectoryPath(newFilePath);
    if (oldFileContainingPath !== newFileConaintingPath) {
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
    TSCORE.Meta.updateMetaData(oldFilePath, newFilePath);
    TSCORE.hideWaitingDialog();
  };

  exports.renameFileSuccess = renameFileSuccess;
  exports.stopDirectoryWalking = stopDirectoryWalking;
  exports.walkDirectory = walkDirectory;
  exports.listSubDirectories = listSubDirectories;
  exports.createDirectoryIndex = createDirectoryIndex;
  exports.deleteFiles = deleteFiles;
  //TODO exports.createTree = createTree;
  //TODO exports.copyFiles = copyFiles;
  //TODO exports.moveFiles = moveFiles;
});
