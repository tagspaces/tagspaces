/* Copyright (c) 2012-2016 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
  'use strict';

  console.log('Loading perspective.manager.js ...');

  var perspectives;
  var TSCORE = require('tscore');
  var TSPOSTIO = require("tspostioapi");

  function initPerspective(extPath) {
    return new Promise(function(resolve, reject) {
      require([extPath], function(perspective) {
        perspectives.push(perspective);
       
        // Creating perspective's toolbar
        $('#viewToolbars').append($('<div>', {
          id: perspective.ID + 'Toolbar',
          class: 'btn-toolbar'
        }).hide());
        // Creating perspective's container
        $('#viewContainers').append($('<div>', {
          id: perspective.ID + 'Container',
          style: 'width: 100%; height: 100%'
        }).hide());
        // Creating perspective's footer
        $('#viewFooters').append($('<div>', {
          id: perspective.ID + 'Footer'
        }).hide());
        //TODO: return init as promise
        perspective.init();
        resolve(true);
      }); // jshint ignore:line
    }); 
  }

  function initPerspectives() {
    perspectives = [];
    $('#viewSwitcher').empty();
    $('#viewContainers').empty();
    initWelcomeScreen();

    var extensions = TSCORE.Config.getActivatedPerspectives();
    var promises = [];
    for (var i = 0; i < extensions.length; i++) {
      var extPath = TSCORE.Config.getExtensionPath() + '/' + extensions[i].id + '/extension.js';
      promises.push(initPerspective(extPath));
    }
    
    return Promise.all(promises).then(function() {
      initPerspectiveSwitcher();
      // Opening last saved location by the start of the application
      var lastLocation = TSCORE.Config.getLastOpenedLocation(); 
      if (TSCORE.Config.getUseDefaultLocation()) {
        lastLocation = TSCORE.Config.getDefaultLocation();
      }
      if (lastLocation && lastLocation.length >= 1) {
        TSCORE.openLocation(lastLocation);
        TSCORE.IO.checkAccessFileURLAllowed ? TSCORE.IO.checkAccessFileURLAllowed() : true;
        var evt = TSCORE.createDocumentEvent("initApp");
        TSCORE.fireDocumentEvent(evt);
        $("#viewContainers").removeClass("appBackgroundTile");
      }
      $('#loading').hide();
      if (isNode || isElectron) {
        TSCORE.IO.showMainWindow();
      }
      return true;
    });
  }

  function initWelcomeScreen() {

    $('#viewContainers').append('<div id="welcomeScreen"></div>');
  }

  function initPerspectiveSwitcher() {
    var extensions = TSCORE.Config.getActivatedPerspectives();
    var $perspectiveSwitcher = $('#perspectiveSwitcher');

    $perspectiveSwitcher.empty();
    $perspectiveSwitcher.append($('<li>', {
      class: 'dropdown-header',
      text: $.i18n.t('ns.common:perspectiveSwitch')
    }).prepend("<button class='close'>&times;</button>")
    ).append("<li class='divider'></li>");

    for (var i = 0; i < extensions.length; i++) {
      var curPers;

      // Finding the right perspective 
      perspectives.forEach(function(value) {
        if (value.ID === extensions[i].id) {
          curPers = value;
        }
      }); // jshint ignore:line

      $perspectiveSwitcher.append($('<li>', {}).append($('<a>', {
        'viewid': curPers.ID,
        'title': curPers.ID,
        'id': curPers.ID + 'Button',
        'text': curPers.Title
      }).prepend($('<i>', {
        'class': curPers.Icon + ' fa-lg',
        'style': 'margin-right: 15px'
      }))));

      // Adding event listener & icon to the radio button
      $('#' + curPers.ID + 'Button').click(function() {
        changePerspective($(this).attr('viewid'));
      }); // jshint ignore:line
    }
  }

  function redrawCurrentPerspective() {
    clearSelectedFiles();
    for (var i = 0; i < perspectives.length; i++) {
      if (perspectives[i].ID === TSCORE.currentPerspectiveID) {
        try {
          perspectives[i].load();
          break;
        } catch (e) {
          console.warn("Error while executing 'redrawCurrentPerspective' on " + perspectives[i].ID + ' ' + e);
        }
      }
    }
  }

  function removeFileUI(filePath) {
    console.log('Removing file from perspectives');
    for (var i = 0; i < perspectives.length; i++) {
      try {
        perspectives[i].removeFileUI(filePath);
      } catch (e) {
        console.warn("Error while executing 'removeFileUI' on " + perspectives[i].ID + ' ' + e);
      }
    }
  }

  /*function removeAllFiles() {
    console.log('Removing file from perspectives');
    if (TSCORE.fileList && TSCORE.fileList.length > 0) {
      TSCORE.fileList = [];
      redrawCurrentPerspective();
    }
  }*/

  function updateFileUI(oldFilePath, newFilePath) {
    console.log('Updating file in perspectives');

    if (TSCORE.FileOpener.getOpenedFilePath() === oldFilePath && !TSCORE.FileOpener.isFileEdited()) {
      TSCORE.FileOpener.openFile(newFilePath);
    }

    for (var i = 0; i < perspectives.length; i++) {
      try {
        perspectives[i].updateFileUI(oldFilePath, newFilePath);
      } catch (e) {
        console.warn("Error while executing 'updateFileUI' on " + perspectives[i].ID + ' ' + e);
      }
    }
  }

  function getNextFile(filePath) {
    for (var i = 0; i < perspectives.length; i++) {
      if (perspectives[i].ID === TSCORE.currentPerspectiveID) {
        try {
          return perspectives[i].getNextFile(filePath);
        } catch (e) {
          console.warn("Error while executing 'getNextFile' on " + perspectives[i].ID + ' ' + e);
        }
      }
    }
  }

  function getPrevFile(filePath) {
    for (var i = 0; i < perspectives.length; i++) {
      if (perspectives[i].ID === TSCORE.currentPerspectiveID) {
        try {
          return perspectives[i].getPrevFile(filePath);
        } catch (e) {
          console.warn("Error while executing 'getPrevFile' on " + perspectives[i].ID + ' ' + e);
        }
      }
    }
  }

  function updateTreeData(treeData) {
    for (var i = 0; i < perspectives.length; i++) {
      try {
        perspectives[i].updateTreeData(treeData);
      } catch (e) {
        console.warn("Error while executing 'updateTreeData' on "); // + perspectives[i].ID + ' ' + e);
      }
    }
  }

  function updateFileBrowserData(dirList, isSearchResult) {
    console.log('Updating the file browser data...');
    TSCORE.fileList = [];
    TSCORE.showLoadingAnimation();
    if (!isSearchResult) { // TODO tmp solution for not hiding the loading dialog on search
      TSCORE.showWaitingDialog("Loading metadata and thumbnails");
    }

    var metaDataLoadingPromises = [];
    var tags, ext, title, fileSize, fileLMDT, path, filename, entry, thumbPath, metaObj;

    for (var i = 0; i < dirList.length; i++) {
      // Considering Unix HiddenEntries (. in the beginning of the filename)
      if (TSCORE.Config.getShowUnixHiddenEntries() || !TSCORE.Config.getShowUnixHiddenEntries() && dirList[i].path.indexOf(TSCORE.dirSeparator + '.') < 0) {
        filename = dirList[i].name.replace(/(<([^>]+)>)/gi, ''); // sanitizing filename
        path = dirList[i].path.replace(/(<([^>]+)>)/gi, ''); // sanitizing filepath
        title = TSCORE.TagUtils.extractTitle(filename);
        ext = TSCORE.TagUtils.extractFileExtension(filename);
        tags = TSCORE.TagUtils.extractTags(path);

        if (dirList[i].size) {
          fileSize = dirList[i].size;
        } else {
          fileSize = "";
        }

        if (dirList[i].lmdt) {
          fileLMDT = dirList[i].lmdt;
        } else {
          fileLMDT = '';
        }

        if (dirList[i].thumbPath) {
          thumbPath = dirList[i].thumbPath;
        } else {
          thumbPath = '';
        }

        metaObj = {
          thumbnailPath: thumbPath,
          metaData: null
        };

        entry = {
          "extension": ext,
          "title": title,
          "tags": tags,
          "size": fileSize,
          "lmdt": fileLMDT,
          "path": path,
          "name": filename,
          "isDirectory": !dirList[i].isFile,
          "meta": metaObj
        };
        TSCORE.fileList.push(entry);
        metaDataLoadingPromises.push(TSCORE.Meta.loadMetaFileJsonPromise(entry));

        if (!dirList[i].isFile) {
          entry = {
            "path": path,
            "name": filename,
            "isDirectory": true,
          };
          TSCORE.subDirsList.push(entry);
        }
      }
    }

    var loadAllHandler = function() {
      TSCORE.hideLoadingAnimation();
      TSCORE.hideWaitingDialog();
      redrawCurrentPerspective();
      if (TSCORE.PRO && !isSearchResult && TSCORE.Config.getUseTextExtraction()) {
        TSCORE.showLoadingAnimation();
        //TSCORE.showWaitingDialog("Extracting text content");
        TSCORE.PRO.extractTextContentFromFilesPromise(TSCORE.fileList).then(function() {
          console.log("Text extraction completed!");
          TSCORE.hideLoadingAnimation();
          TSCORE.hideWaitingDialog();
        }).catch(function(e) {
          console.log("Text extraction failed!");
          TSCORE.hideLoadingAnimation();
          TSCORE.hideWaitingDialog();
        });
      }
    };

    Promise.all(metaDataLoadingPromises).then(function(result) {
      console.log("MetaData loaded / Creating thumbs finished!");
      loadAllHandler();
    }).catch(function(e) {
      console.warn("MetaData loading / Creating thumbs failed: " + e);
      loadAllHandler();
    });
  }

  function refreshFileListContainer() {
    // TODO consider search view
    TSCORE.IO.listDirectoryPromise(TSCORE.currentPath).then(function(entries) {
      TSPOSTIO.listDirectory(entries);
    }).catch(function(err) {
      TSPOSTIO.errorOpeningPath(TSCORE.currentPath);
      console.warn("Error listing directory" + err);
    });
  }

  function hideAllPerspectives() {
    $('#welcomeScreen').hide();
    for (var i = 0; i < perspectives.length; i++) {
      $('#' + perspectives[i].ID + 'Container').hide();
      $('#' + perspectives[i].ID + 'Toolbar').hide();
    }
  }

  function changePerspective(viewType) {
    console.log('Change to ' + viewType + ' perspective.');
    TSCORE.showLoadingAnimation();
    // Loading first perspective by default
    if (viewType === undefined) {
      TSCORE.currentPerspectiveID = perspectives[0].ID;
    } else {
      //Setting the current view
      TSCORE.currentPerspectiveID = viewType;
    }
    if (TSCORE.currentPerspectiveID === undefined) {
      TSCORE.showAlertDialog('No Perspectives found', '');
      return false;
    }
    hideAllPerspectives();
    for (var i = 0; i < perspectives.length; i++) {
      if (perspectives[i].ID === viewType) {
        var $currentPerspectitveIcon = $('#currentPerspectitveIcon');
        $currentPerspectitveIcon.removeClass();
        $currentPerspectitveIcon.addClass(perspectives[i].Icon);
        $currentPerspectitveIcon.addClass('fa-lg');

        var $currentPerspectitveName = $('#currentPerspectitveName');
        $currentPerspectitveName.removeAttr("data-i18n");
        $currentPerspectitveName.text(' ' + perspectives[i].Title);
        $currentPerspectitveName.attr('title', perspectives[i].ID);

        perspectives[i].load();
        $('#' + perspectives[i].ID + 'Container').show();
      }
    }
    // Clear the list with the selected files    
    clearSelectedFiles();
    // Enabled the main toolbar e.g. search functionality
    TSCORE.enableTopToolbar();
  }

  function clearSelectedFiles() {
    // Clear selected files
    TSCORE.selectedFiles = [];
    if (perspectives) {
      for (var i = 0; i < perspectives.length; i++) {
        try {
          perspectives[i].clearSelectedFiles();
        } catch (e) {
          console.error('Error while executing \'clearSelectedFiles\' on ' + perspectives[i].ID + ' - ' + e);
        }
      }
    }
  }

  exports.initPerspectives = initPerspectives;
  exports.hideAllPerspectives = hideAllPerspectives;
  exports.redrawCurrentPerspective = redrawCurrentPerspective;
  exports.getNextFile = getNextFile;
  exports.getPrevFile = getPrevFile;
  exports.updateTreeData = updateTreeData;
  exports.updateFileBrowserData = updateFileBrowserData;
  exports.refreshFileListContainer = refreshFileListContainer;
  exports.clearSelectedFiles = clearSelectedFiles;
  //exports.removeAllFiles = removeAllFiles;
  exports.removeFileUI = removeFileUI;
  exports.updateFileUI = updateFileUI;
  exports.changePerspective = changePerspective;
});
