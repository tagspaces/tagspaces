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
  var TSPOSTIO = require('tspostioapi');
  var MAXSEARCHRESULTS = 1000;
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
      TSPOSTIO.listSubDirectories(anotatedDirList, dirPath);
    }).catch(function(error) {
      TSPOSTIO.errorOpeningPath(dirPath);
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

  function deleteFiles(filePathList) {
    TSCORE.showLoadingAnimation();
    var fileDeletionPromises = [];
    filePathList.forEach(function(filePath) {
      fileDeletionPromises.push(TSCORE.IO.deleteFilePromise(filePath));
    });

    Promise.all(fileDeletionPromises).then(function(fList) {
      fList.forEach(function(filePath) {
        TSCORE.Meta.updateMetaData(filePath);
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

  exports.stopDirectoryWalking = stopDirectoryWalking;
  exports.MAXSEARCHRESULTS = MAXSEARCHRESULTS;

  exports.walkDirectory = walkDirectory;
  exports.listSubDirectories = listSubDirectories;
  exports.createDirectoryIndex = createDirectoryIndex;
  exports.deleteFiles = deleteFiles;
  //TODO exports.createTree = createTree;
  //TODO exports.copyFiles = copyFiles;
  //TODO exports.moveFiles = moveFiles;
});
