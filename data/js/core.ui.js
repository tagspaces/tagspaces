/* Copyright (c) 2012-2015 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */
/* global define, Handlebars, isNode, isFirefox  */
define(function(require, exports, module) {
  'use strict';
  console.log('Loading core.ui.js ...');
  var TSCORE = require('tscore');
  var TSPOSTIO = require("tspostioapi");
  var fileContent;
  var fileType;
  var waitingDialogTimeoutID;

  var showWaitingDialog = function(message, title) {
    if (!title) {
      title = $.i18n.t('ns.dialogs:titleWaiting');
    }
    if (!message) {
      message = 'No Message to Display.';
    }
    var waitingModal = $('#waitingDialog');
    waitingModal.find('#waitingHeader').text(title);
    waitingModal.find('#waitingMessage').text(message);

    waitingDialogTimeoutID = window.setTimeout(function() {
      waitingModal.modal({
        backdrop: 'static',
        show: true
      });
    }, 500);
  };

  var hideWaitingDialog = function(message, title) {
    window.clearTimeout(waitingDialogTimeoutID);
    $('#waitingDialog').modal('hide');
  };

  var showSuccessDialog = function(message) {
    if (!message) {
      return;
    }
    var n = noty({
      text: message,
      //dismissQueue: false,
      layout: 'bottomCenter',
      theme: 'relax',
      type: 'success',
      animation: {
        open: 'animated fadeIn',
        close: 'animated fadeOut',
        easing: 'swing',
        speed: 500
      },
      timeout: 4000,
      maxVisible: 1,
      closeWith: ['button', 'click'],
    });
  };

  var showAlertDialog = function(message, title) {
    if (!title) {
      title = $.i18n.t('ns.dialogs:titleAlert');
    }
    if (!message) {
      message = 'No Message to Display.';
    }
    var n = noty({
      text: "<strong>" + title + "</strong><br>" + message,
      layout: 'bottomCenter',
      theme: 'relax',
      type: 'warning',
      animation: {
        open: 'animated fadeIn',
        close: 'animated fadeOut',
        easing: 'swing',
        speed: 500
      },
      timeout: 6000,
      maxVisible: 4,
      closeWith: ['button', 'click'],
    });
    /*var alertModal = $('#alertDialog');
    alertModal.find('h4').text(title);
    alertModal.find('.modal-body').empty();
    alertModal.find('.modal-body').text(message);
    alertModal.find('#okButton').off('click').click(function() {
      alertModal.modal('hide');
    });
    // Focusing the ok button by default
    alertModal.off('shown.bs.modal');
    alertModal.on('shown.bs.modal', function() {
      alertModal.find('#okButton').focus();
    });
    alertModal.modal({
      backdrop: 'static',
      show: true
    });*/
  };

  var showConfirmDialog = function(title, message, okCallback, cancelCallback, confirmShowNextTime) {
    if (!title) {
      title = $.i18n.t('ns.dialogs:titleConfirm');
    }
    if (!message) {
      message = 'No Message to Display.';
    }
    var confirmModal = $('#confirmDialog');
    if (confirmShowNextTime) {
      confirmModal.find('#showThisDialogAgain').prop('checked', true);
    } else {
      confirmModal.find('#showThisDialogAgainContainer').hide();
    }
    confirmModal.find('h4').text(title);
    confirmModal.find('#dialogContent').text(message);
    confirmModal.find('#confirmButton').off('click').click(function() {
      okCallback(confirmModal.find('#showThisDialogAgain').prop('checked'));
      confirmModal.modal('hide');
    });
    // Focusing the confirm button by default
    confirmModal.off('shown.bs.modal');
    confirmModal.on('shown.bs.modal', function() {
      confirmModal.find('#confirmButton').focus();
    });
    confirmModal.find('#cancelButton').off('click').click(function() {
      if (cancelCallback !== undefined) {
        cancelCallback();
      }
      confirmModal.modal('hide');
    });
    confirmModal.modal({
      backdrop: 'static',
      show: true
    });
  };

  var showFileCreateDialog = function() {
    fileContent = TSCORE.Config.getNewTextFileContent();
    // Default new file in text file
    fileType = 'txt';
    $('#newFileNameTags').select2('data', null);
    $('#newFileNameTags').select2({
      multiple: true,
      tags: TSCORE.Config.getAllTags(),
      tokenSeparators: [
        ',',
        ' '
      ],
      minimumInputLength: 2,
      selectOnBlur: true
    });
    $('#newFileName').val('');
    $('#tagWithCurrentDate').prop('checked', false);
    $('#txtFileTypeButton').button('toggle');
    $('#formFileCreate').validator();
    $('#formFileCreate').submit(function(e) {
      e.preventDefault();
    });
    $('#formFileCreate').on('invalid.bs.validator', function() {
      $('#fileCreateConfirmButton').prop('disabled', true);
    });
    $('#formFileCreate').on('valid.bs.validator', function() {
      $('#fileCreateConfirmButton').prop('disabled', false);
    });
    $('#dialogFileCreate').on('shown.bs.modal', function() {
      $('#newFileName').select2().focus();
    });
    $('#dialogFileCreate').modal({
      backdrop: 'static',
      show: true
    });
    $('#dialogFileCreate').draggable({
      handle: ".modal-header"
    });
  };

  var showFileRenameDialog = function(filePath) {
    $('#renamedFileName').attr('filepath', filePath);
    $('#renamedFileName').val(TSCORE.TagUtils.extractFileName(filePath));

    $('#formFileRename').validator();
    $('#formFileRename').submit(function(e) {
      e.preventDefault();
      if ($('#renameFileButton').prop('disabled') === false) {
        $('#renameFileButton').click();
      }
    });
    $('#formFileRename').on('invalid.bs.validator', function() {
      $('#renameFileButton').prop('disabled', true);
    });
    $('#formFileRename').on('valid.bs.validator', function() {
      $('#renameFileButton').prop('disabled', false);
    });
    $('#dialogFileRename').on('shown.bs.modal', function() {
      $('#renamedFileName').focus();
    });
    $('#dialogFileRename').modal({
      backdrop: 'static',
      show: true
    });
    $('#dialogFileRename').draggable({
      handle: ".modal-header"
    });
  };

  var showFileDeleteDialog = function(filePath) {
    console.log('Deleting file...');
    var dlgConfirmMsgId = 'ns.dialogs:fileDeleteContentConfirm';
    if (TSCORE.Config.getUseTrashCan()) {
      dlgConfirmMsgId = 'ns.pro:trashDeleteContentConfirm';
    }
    TSCORE.showConfirmDialog($.i18n.t('ns.dialogs:fileDeleteTitleConfirm'), $.i18n.t(dlgConfirmMsgId, {
      filePath: filePath
    }), function() {
      TSCORE.IO.deleteFilePromise(filePath).then(function() {
          TSPOSTIO.deleteElement(filePath);
        },
        function(error) {
          TSCORE.hideLoadingAnimation();
          TSCORE.showAlertDialog("Deleting file " + filePath + " failed.");
          console.error("Deleting file " + filePath + " failed " + error);
        }
      );
    });
  };

  var showTagEditDialog = function() {
    $('#newTagName').val(TSCORE.selectedTag);
    $('#formEditTag').validator();
    $('#formEditTag').submit(function(e) {
      e.preventDefault();
      if ($('#editTagButton').prop('disabled') === false) {
        $('#editTagButton').click();
      }
    });
    $('#formEditTag').on('invalid.bs.validator', function() {
      $('#editTagButton').prop('disabled', true);
    });
    $('#formEditTag').on('valid.bs.validator', function() {
      $('#editTagButton').prop('disabled', false);
    });
    $('#dialogEditTag').on('shown.bs.modal', function() {
      $('#newTagName').focus();
    });
    $('#dialogEditTag').modal({
      backdrop: 'static',
      show: true
    });
    $('#dialogEditTag').draggable({
      handle: ".modal-header"
    });
  };

  var showDirectoryBrowserDialog = function(path) {
    require([
      'text!templates/DirectoryBrowserDialog.html',
      'tsdirectorybrowser'
    ], function(uiTPL, controller) {
      TSCORE.directoryBrowser = controller;
      if ($('#directoryBrowserDialog').length < 1) {
        var uiTemplate = Handlebars.compile(uiTPL);
        $('body').append(uiTemplate());
        TSCORE.directoryBrowser.initUI();
      }
      $('#directoryBrowserDialog').i18n();
      TSCORE.IOUtils.listSubDirectories(path);
    });
  };

  var showOptionsDialog = function() {
    require([
      'text!templates/OptionsDialog.html',
      'tsoptions'
    ], function(uiTPL, controller) {
      if ($('#dialogOptions').length < 1) {
        var uiTemplate = Handlebars.compile(uiTPL);
        $('body').append(uiTemplate({isProVersion: TSCORE.PRO ? true : false}));

        controller.initUI();
      }
      $('#dialogOptions').i18n();
      controller.reInitUI();
    });
  };

  var showWelcomeDialog = function() { startGettingStartedTour(); };

  var startGettingStartedTour = function() {
    var tsGettingStarted = require('tsgettingstarted');
    tsGettingStarted.startTour();
  };

  var showMoveCopyFilesDialog = function() {
    require(['text!templates/MoveCopyFilesDialog.html'], function(uiTPL) {
      if ($('#dialogMoveCopyFiles').length < 1) {
        var uiTemplate = Handlebars.compile(uiTPL);
        $('body').append(uiTemplate());

        $('#moveFilesButton').click(function(e) {
          e.preventDefault();
          // TODO move to ioutils
          TSCORE.showWaitingDialog('Please wait, while files are being renamed.');
          var newFilePath, filePath;
          var fileOperations = [];
          for (var i = 0; i < TSCORE.selectedFiles.length; i++) {
            newFilePath = $('#moveCopyDirectoryPath').val() + TSCORE.dirSeparator + TSCORE.TagUtils.extractFileName(TSCORE.selectedFiles[i]);
            filePath = TSCORE.selectedFiles[i];
            fileOperations.push(TSCORE.IO.renameFilePromise(filePath, newFilePath));
          }
          Promise.all(fileOperations).then(function(success) {
            // TODO handle moving sidecar files
            TSCORE.hideWaitingDialog();
            TSCORE.navigateToDirectory(TSCORE.currentPath);
            TSCORE.showSuccessDialog("Files successfully moved");
          }, function(err) {
            TSCORE.hideWaitingDialog();
            TSCORE.showAlertDialog("Renaming files failed");
          });
        });

        $('#copyFilesButton').click(function(e) {
          e.preventDefault();
          TSCORE.showWaitingDialog('Please wait, while files are being copied.');
          var newFilePath, filePath;
          var fileOperations = [];
          for (var i = 0; i < TSCORE.selectedFiles.length; i++) {
            var newFilePath = $('#moveCopyDirectoryPath').val() + TSCORE.dirSeparator + TSCORE.TagUtils.extractFileName(TSCORE.selectedFiles[i]);
            var filePath = TSCORE.selectedFiles[i];
            fileOperations.push(TSCORE.IO.copyFilePromise(filePath, newFilePath));
          }
          Promise.all(fileOperations).then(function(success) {
            // TODO handle copying sidecar files
            TSCORE.hideWaitingDialog();
            TSCORE.showSuccessDialog("Files successfully copied");
          }, function(err) {
            TSCORE.hideWaitingDialog();
            TSCORE.showAlertDialog("Copying files failed");
          });
        });
        $('#selectDirectoryMoveCopyDialog').click(function(e) {
          e.preventDefault();
          TSCORE.IO.selectDirectory();
        });
      }
      $('#moveCopyDirectoryPath').val(TSCORE.currentPath);
      $('#moveCopyFileList').children().remove();
      for (var i = 0; i < TSCORE.selectedFiles.length; i++) {
        $('#moveCopyFileList').append($('<p>', {
          text: TSCORE.selectedFiles[i]
        }));
      }
      $('#dialogMoveCopyFiles').i18n();
      $('#dialogMoveCopyFiles').draggable({
        handle: '.modal-header'
      });
      $('#dialogMoveCopyFiles').modal({
        backdrop: 'static',
        show: true
      });
      $('#dialogMoveCopyFiles').draggable({
        handle: ".modal-header"
      });
      console.log('Selected files: ' + TSCORE.selectedFiles);
    });
  };

  var showAboutDialog = function() {
    $('#dialogAboutTS').modal({
      backdrop: 'static',
      show: true
    });
    $('#dialogAboutTS').draggable({
      handle: ".modal-header"
    });
  };

  var initUI = function() {
    if (TSCORE.PRO) {
      //TSCORE.PRO.sayHi();
    }

    $('#appVersion').text(TSCORE.Config.DefaultSettings.appVersion + '.' + TSCORE.Config.DefaultSettings.appBuild);
    $('#appVersion').attr('title', 'BuildID: ' + TSCORE.Config.DefaultSettings.appVersion + '.' + TSCORE.Config.DefaultSettings.appBuild + '.' + TSCORE.Config.DefaultSettings.appBuildID);
    // prevent default behavior from changing page on dropped file
    $(document).on('drop dragend dragenter dragleave dragover', function(event) {
      //  dragstart drag
      event.preventDefault();
    });
    // Managing droping of files in the perspectives
    if (isNode) {
      $('#viewContainers').on('dragenter', function(event) {
        event.preventDefault();
        $('#viewContainers').attr('style', 'border:2px dashed #098ddf');
      });
      $('#viewContainers').on('dragleave', function(event) {
        event.preventDefault();
        $('#viewContainers').attr('style', 'border:0px');
      });
      $('#viewContainers').on('drop', function(event) {
        //event.preventDefault();
        if (event.originalEvent.dataTransfer !== undefined) {
          var files = event.originalEvent.dataTransfer.files;
          TSCORE.IO.focusWindow();
          $('#viewContainers').attr('style', 'border:0px');
          TSCORE.PerspectiveManager.clearSelectedFiles();
          var filePath;
          if (files !== undefined && files.length > 0) {
            for (var i = 0; i < files.length; i++) {
              filePath = files[i].path;
              if (filePath.length > 1) {
                //console.log("Selecting files: "+JSON.stringify(files[i]));
                TSCORE.selectedFiles.push(filePath); //{"webkitRelativePath":"","path\":"/home/na/Desktop/Kola2","lastModifiedDate":"2014-07-11T16:40:52.000Z","name":"Kola2","type":"","size":4096}
              }
            }
          }
          if (TSCORE.selectedFiles.length > 0) {
            showMoveCopyFilesDialog();
          }
        }
      });
    }
    platformTuning();
    var addFileInputName;
    $('#addFileInput').on('change', function(selection) {
      //console.log("Selected File: "+$("#addFileInput").val());
      var file = selection.currentTarget.files[0];
      //console.log("Selected File: "+JSON.stringify(selection.currentTarget.files[0]));
      addFileInputName = decodeURIComponent(file.name);
      var reader = new FileReader();
      reader.onload = onFileReadComplete;
      reader.readAsArrayBuffer(file);
    });

    function onFileReadComplete(event) {
      console.log('Content on file read complete: ' + JSON.stringify(event));
      //change name for ios fakepath
      if (isCordovaiOS) {
        var parts = addFileInputName.split('.');
        var ext = (parts.length > 1) ? '.' + parts.pop() : '';
        addFileInputName = TSCORE.TagUtils.beginTagContainer + TSCORE.TagUtils.formatDateTime4Tag(new Date(), true) + TSCORE.TagUtils.endTagContainer + ext;
      }
      var filePath = TSCORE.currentPath + TSCORE.dirSeparator + addFileInputName;
      TSCORE.IO.saveBinaryFilePromise(filePath, event.currentTarget.result).then(function() {
        TSPOSTIO.saveBinaryFile(filePath);
      }, function(error) {
        TSCORE.hideLoadingAnimation();
        TSCORE.showAlertDialog("Saving " + filePath + " failed.");
        console.error("Save to file " + filePath + " failed " + error);
      });
      addFileInputName = undefined;
    }
    $('#openLeftPanel').click(function() {
      TSCORE.openLeftPanel();
    });
    $('#closeLeftPanel').click(function() {
      TSCORE.closeLeftPanel();
    });
    $('#txtFileTypeButton').click(function(e) {
      // Fixes reloading of the application by click
      e.preventDefault();
      fileContent = TSCORE.Config.getNewTextFileContent();
      fileType = 'txt';
    });
    $('#htmlFileTypeButton').click(function(e) {
      // Fixes reloading of the application by click
      e.preventDefault();
      fileContent = TSCORE.Config.getNewHTMLFileContent();
      fileType = 'html';
    });
    $('#mdFileTypeButton').click(function(e) {
      // Fixes reloading of the application by click
      e.preventDefault();
      fileContent = TSCORE.Config.getNewMDFileContent();
      fileType = 'md';
    });
    $('#fileCreateConfirmButton').click(function() {
      var fileTags = '';
      var rawTags = $('#newFileNameTags').val().split(',');
      rawTags.forEach(function(value, index) {
        if (index === 0) {
          fileTags = value;
        } else {
          fileTags = fileTags + TSCORE.Config.getTagDelimiter() + value;
        }
      });
      if ($('#tagWithCurrentDate').prop('checked')) {
        if (fileTags.length < 1) {
          fileTags = TSCORE.TagUtils.formatDateTime4Tag(new Date());
        } else {
          fileTags = fileTags + TSCORE.Config.getTagDelimiter() + TSCORE.TagUtils.formatDateTime4Tag(new Date());
        }
      }
      if (fileTags.length > 0) {
        fileTags = TSCORE.TagUtils.beginTagContainer + fileTags + TSCORE.TagUtils.endTagContainer;
      }
      var filePath = TSCORE.currentPath + TSCORE.dirSeparator + $('#newFileName').val() + fileTags + '.' + fileType;
      TSCORE.IO.saveFilePromise(filePath, fileContent).then(function() {
        TSPOSTIO.saveTextFile(filePath, isNewFile);
      }, function(error) {
        TSCORE.hideLoadingAnimation();
        TSCORE.showAlertDialog("Saving " + filePath + " failed.");
        console.error("Save to file " + filePath + " failed " + error);
      });
    });
    $('#renameFileButton').click(function() {
      var initialFilePath = $('#renamedFileName').attr('filepath');
      var containingDir = TSCORE.TagUtils.extractContainingDirectoryPath(initialFilePath);
      var newFilePath = containingDir + TSCORE.dirSeparator + $('#renamedFileName').val();
      TSCORE.IO.renameFilePromise(initialFilePath, newFilePath).then(function(success) {
        TSCORE.hideWaitingDialog();
        TSPOSTIO.renameFile(initialFilePath, newFilePath);
      }, function(err) {
        TSCORE.hideWaitingDialog();
        TSCORE.showAlertDialog(err);
      });
    });
    // Edit Tag Dialog
    $('#plainTagTypeButton').click(function(e) {
      // Fixes reloading of the application by click
      e.preventDefault();
      TSCORE.selectedTag, $('#newTagName').datepicker('destroy').val('');
    });
    $('#dateTagTypeButton').click(function(e) {
      // Fixes reloading of the application by click
      e.preventDefault();
      TSCORE.selectedTag, $('#newTagName').datepicker({
        showWeek: true,
        firstDay: 1,
        dateFormat: 'yymmdd'
      });
    });
    $('#currencyTagTypeButton').click(function(e) {
      // Fixes reloading of the application by click
      e.preventDefault();
      TSCORE.selectedTag, $('#newTagName').datepicker('destroy').val('XEUR');
    });
    $('#editTagButton').click(function() {
      TSCORE.TagUtils.renameTag(TSCORE.selectedFiles[0], TSCORE.selectedTag, $('#newTagName').val());
    });
    // End Edit Tag Dialog
    $('#startNewInstanceBack').click(function() {
      if (!isCordova) {
        window.open(window.location.href, '_blank');
      }
    });
    $('#aboutDialogBack').click(function() {
      if (TSCORE.PRO) {
        $('#aboutIframe').attr('src', 'pro/about.html');
      } else {
        $('#aboutIframe').attr('src', 'about.html');
      }
    });
    // Open About Dialog
    $('#openAboutBox').click(function() {
      $('#dialogAbout').modal({
        backdrop: 'static',
        show: true
      });
      $('#dialogAbout').draggable({
        handle: ".modal-header"
      });
    });
    // Open Options Dialog
    $('#openOptions').click(function() {
      showOptionsDialog();
    });
    // File Menu
    $('#fileMenuAddTag').click(function() {
      TSCORE.showAddTagsDialog();
    });
    $('#fileMenuOpenFile').click(function() {
      TSCORE.FileOpener.openFile(TSCORE.selectedFiles[0]);
    });
    $('#fileMenuOpenNatively').click(function() {
      TSCORE.IO.openFile(TSCORE.selectedFiles[0]);
    });
    $('#fileMenuSendTo').click(function() {
      TSCORE.IO.sendFile(TSCORE.selectedFiles[0]);
    });
    $('#fileMenuOpenDirectory').click(function() {
      var dirPath = TSCORE.Utils.dirName(TSCORE.selectedFiles[0]);
      TSCORE.IO.openDirectory(dirPath);
    });
    $('#fileMenuRenameFile').click(function() {
      TSCORE.showFileRenameDialog(TSCORE.selectedFiles[0]);
    });
    $('#fileMenuMoveCopyFile').click(function() {
      TSCORE.showMoveCopyFilesDialog();
    });
    $('#fileMenuDeleteFile').click(function() {
      TSCORE.showFileDeleteDialog(TSCORE.selectedFiles[0]);
    });
    $('#fileOpenProperties').click(function() {});
    // End File Menu
    $('#showLocations').click(function() {
      showLocationsPanel();
    });
    $('#showTagGroups').click(function() {
      showTagsPanel();
    });
    $('#contactUs').click(function() {
      showContactUsPanel();
    });

    // Hide the tagGroupsContent or locationContent by default
    $('#locationContent').hide();

    // Search UI
    $('#searchToolbar').on('click', '#closeSearchOptionButton', function() {
      $('#searchOptions').hide();
    });

    $('#searchOptions').on('click', '.close', function() {
      $('#searchOptions').hide();
    });

    $('#searchToolbar').on('click', '#includeSubfoldersOption', function() {
      var searchQuery = $('#searchBox').val();
      if (searchQuery.indexOf('?') === 0) {
        $('#includeSubfoldersOption i').removeClass('fa-toggle-on').addClass('fa-toggle-off');
        $('#searchBox').val(searchQuery.substring(1, searchQuery.length));
      } else {
        $('#includeSubfoldersOption i').removeClass('fa-toggle-off').addClass('fa-toggle-on');
        $('#searchBox').val('?' + searchQuery);
      }
    });

    /*$('#searchBox').on('show.bs.popover', function() {
      var searchQuery = $('#searchBox').val();
      if (searchQuery.indexOf('?') === 0) {
        $('#includeSubfoldersOption i').removeClass('fa-toggle-off').addClass('fa-toggle-on');
      } else {
        $('#includeSubfoldersOption i').removeClass('fa-toggle-on').addClass('fa-toggle-off');
      }
    });*/

    $('#searchBox').prop('disabled', true)
      .focus(function() {
        if (!TSCORE.FileOpener.isFileOpened()) {
          $("#searchOptions").show();
        }
      })
      .keyup(function(e) {
        // On enter fire the search
        if (e.keyCode === 13) {
          $('#clearFilterButton').addClass('filterOn');
          TSCORE.PerspectiveManager.redrawCurrentPerspective();
          $('#searchOptions').hide();
          $('#searchButton').focus();
        } else if (e.keyCode == 27) {
          cancelSearch();
        } else {
          TSCORE.Search.nextQuery = this.value;
        }
        if (this.value.length === 0) {
          TSCORE.Search.nextQuery = this.value;
          $('#clearFilterButton').removeClass('filterOn');
          TSCORE.PerspectiveManager.redrawCurrentPerspective();
        }
      }).blur(function() {
        if (this.value.length === 0) {
          $('#clearFilterButton').removeClass('filterOn');
          TSCORE.PerspectiveManager.redrawCurrentPerspective();
        }
      });

    $('#showSearchButton').on('click', function() {
      TSCORE.showSearchArea();
    });

    $('#searchButton').prop('disabled', true).click(function(evt) {
      evt.preventDefault();
      $('#clearFilterButton').addClass('filterOn');
      $('#searchOptions').hide();
      TSCORE.PerspectiveManager.redrawCurrentPerspective();
    });

    $('#clearFilterButton').prop('disabled', true).click(function(e) {
      e.preventDefault();
      cancelSearch();
    });
    // Search UI END

    $('#perspectiveSwitcherButton').prop('disabled', true);
    var $contactUsContent = $('#contactUsContent');
    $contactUsContent.on('click', '#openHints', showWelcomeDialog);
    $contactUsContent.on('click', '#openUservoice', function(e) {
      e.preventDefault();
      openLinkExternally($(this).attr('href'));
    });
    $contactUsContent.on('click', '#openGooglePlay', function(e) {
      e.preventDefault();
      openLinkExternally($(this).attr('href'));
    });
    $contactUsContent.on('click', '#openAppleAppStore', function(e) {
      e.preventDefault();
      openLinkExternally($(this).attr('href'));
    });
    $contactUsContent.on('click', '#openWhatsnew', function(e) {
      e.preventDefault();
      openLinkExternally($(this).attr('href'));
    });
    $contactUsContent.on('click', '#openGitHubIssues', function(e) {
      e.preventDefault();
      openLinkExternally($(this).attr('href'));
    });
    $contactUsContent.on('click', '#helpUsTranslate', function(e) {
      e.preventDefault();
      openLinkExternally($(this).attr('href'));
    });
    $contactUsContent.on('click', '#openTwitter', function(e) {
      e.preventDefault();
      openLinkExternally($(this).attr('href'));
    });
    $contactUsContent.on('click', '#openTwitter2', function(e) {
      e.preventDefault();
      openLinkExternally($(this).attr('href'));
    });
    $contactUsContent.on('click', '#openGooglePlus', function(e) {
      e.preventDefault();
      openLinkExternally($(this).attr('href'));
    });
    $contactUsContent.on('click', '#openFacebook', function(e) {
      e.preventDefault();
      openLinkExternally($(this).attr('href'));
    });
    $contactUsContent.on('click', '#openSupportUs', function(e) {
      e.preventDefault();
      openLinkExternally($(this).attr('href'));
    });
    $('#newVersionMenu').on('click', '.whatsNewLink', function(e) {
      e.preventDefault();
      openLinkExternally($(this).attr('href'));
    });
    // Hide drop downs by click and drag
    $(document).click(function() {
      TSCORE.hideAllDropDownMenus();
    });
  };

  function cancelSearch() {
    clearSearchFilter();
    //$('#searchBox').popover('hide');
    $('#searchToolbar').hide();
    $('#showSearchButton').show();
    // Restoring initial dir listing without subdirectories
    TSCORE.IO.listDirectoryPromise(TSCORE.currentPath).then(
      function(entries) {
        TSPOSTIO.listDirectory(entries);
      },
      function(err) {
        TSPOSTIO.errorOpeningPath();
        console.warn("Error listing directory" + err);
      }
    );
  }

  function showSearchArea() {
    $('#searchToolbar').show();
    $('#showSearchButton').hide();
    $('#searchBox').focus();
  }

  // Handle external links
  function openLinkExternally(url) {
    if (isNode) {
      gui.Shell.openExternal(url);
    } else {
      // _system is needed for cordova
      window.open(url, '_system');
    }
  }

  function clearSearchFilter() {
    $('#searchOptions').hide();
    $('#searchBox').val('');
    $('#clearFilterButton').removeClass('filterOn');
    TSCORE.Search.nextQuery = '';
  }

  function disableTopToolbar() {
    $('#perspectiveSwitcherButton').prop('disabled', true);
    $('#searchBox').prop('disabled', true);
    $('#searchButton').prop('disabled', true);
    $('#clearFilterButton').prop('disabled', true);
  }

  function enableTopToolbar() {
    $('#perspectiveSwitcherButton').prop('disabled', false);
    $('#searchBox').prop('disabled', false);
    $('#searchButton').prop('disabled', false);
    $('#clearFilterButton').prop('disabled', false);
  }

  function platformTuning() {
    if (isCordova) {
      $('#directoryMenuOpenDirectory').parent().hide();
      $('#fileMenuOpenDirectory').parent().hide();
      $('#openDirectory').parent().hide();
      $('#downloadFile').parent().hide();
      $('#openFileInNewWindow').hide();
      $('#openGooglePlay').hide();
      $('.cancelButton').hide();
    } else if (isCordovaiOS) {
      $('#fullscreenFile').parent().hide();
    } else if (isChrome) {
      $('#directoryMenuOpenDirectory').parent().hide();
      $('#fileMenuOpenDirectory').parent().hide();
      $('#fileMenuOpenNatively').parent().hide();
      $('#openDirectory').parent().hide();
      $('#openNatively').hide();
    } else if (isWeb) {
      $('#directoryMenuOpenDirectory').parent().hide();
      $('#fileMenuOpenDirectory').parent().hide();
      $('#fileMenuOpenNatively').parent().hide();
      $('#openDirectory').parent().hide();
      $('#openNatively').hide();
    } else if (isFirefox) {
      $('#openNatively').hide();
      $('#fileMenuOpenNatively').parent().hide();
    } else if (isNode) {
      $('#openFileInNewWindow').hide();
      //handling window maximization
      var nwwin = gui.Window.get();
      nwwin.on('maximize', function() {
        TSCORE.Config.setIsWindowMaximized(true);
        TSCORE.Config.saveSettings();
      });
      nwwin.on('unmaximize', function() {
        TSCORE.Config.setIsWindowMaximized(false);
        TSCORE.Config.saveSettings();
      }); // Disabling automatic maximazation of the main window
      //if(TSCORE.Config.getIsWindowMaximized()){
      //    nwwin.maximize();
      //}
    }
    // Disable send to feature on all platforms except android cordova
    if (!isCordova) {
      $('#sendFile').hide();
      $('#fileMenuSendTo').hide();
    }
    if (isOSX) {
      $('body').addClass('osx');
    }
  }

  var showContextMenu = function(menuId, sourceObject) {
    var leftPos = sourceObject.offset().left;
    var topPos = sourceObject.offset().top;
    if (sourceObject.offset().top + sourceObject.height() + $(menuId).height() > window.innerHeight) {
      topPos = window.innerHeight - $(menuId).height();
      leftPos = sourceObject.offset().left + 15;
    }
    if (sourceObject.offset().left + sourceObject.width() + $(menuId).width() > window.innerWidth) {
      leftPos = window.innerWidth - $(menuId).width();
    }
    $(menuId).css({
      display: 'block',
      left: leftPos,
      top: topPos
    });
  };

  var hideAllDropDownMenus = function() {
    $('#tagGroupMenu').hide();
    $('#tagTreeMenu').hide();
    $('#directoryMenu').hide();
    $('#tagMenu').hide();
    $('#fileMenu').hide();
    $('.dirAltNavMenu').hide();
  };

  var showLocationsPanel = function() {
    TSCORE.openLeftPanel();
    $('#tagGroupsContent').hide();
    $('#contactUsContent').hide();
    $('#locationContent').show();
    $('#showTagGroups').removeClass('active');
    $('#contactUs').removeClass('active');
    $('#showLocations').addClass('active');
  };

  var showTagsPanel = function() {
    TSCORE.openLeftPanel();
    $('#locationContent').hide();
    $('#contactUsContent').hide();
    $('#tagGroupsContent').show();
    $('#showLocations').removeClass('active');
    $('#contactUs').removeClass('active');
    $('#showTagGroups').addClass('active');
  };

  var showContactUsPanel = function() {
    TSCORE.openLeftPanel();
    $('#locationContent').hide();
    $('#tagGroupsContent').hide();
    $('#contactUsContent').show();
    $('#showLocations').removeClass('active');
    $('#showTagGroups').removeClass('active');
    $('#contactUs').addClass('active');
  };

  function createHTMLFile() {
    var filePath = TSCORE.currentPath + TSCORE.dirSeparator + TSCORE.TagUtils.beginTagContainer + TSCORE.TagUtils.formatDateTime4Tag(new Date(), true) + TSCORE.TagUtils.endTagContainer + '.html';
    createNewTextFile(filePath, TSCORE.Config.getNewHTMLFileContent());
  }

  function createMDFile() {
    var filePath = TSCORE.currentPath + TSCORE.dirSeparator + TSCORE.TagUtils.beginTagContainer + TSCORE.TagUtils.formatDateTime4Tag(new Date(), true) + TSCORE.TagUtils.endTagContainer + '.md';
    createNewTextFile(filePath, TSCORE.Config.getNewMDFileContent());
  }

  function createTXTFile() {
    var filePath = TSCORE.currentPath + TSCORE.dirSeparator + TSCORE.TagUtils.beginTagContainer + TSCORE.TagUtils.formatDateTime4Tag(new Date(), true) + TSCORE.TagUtils.endTagContainer + '.txt';
    createNewTextFile(filePath, TSCORE.Config.getNewTextFileContent());
  }

  function createNewTextFile(filePath, content) {
    TSCORE.IO.saveFilePromise(filePath, content).then(function(isNewFile) {
      TSPOSTIO.saveTextFile(filePath, isNewFile);
    }, function(error) {
      TSCORE.hideLoadingAnimation();
      console.error("Save to file " + filePath + " failed " + error);
      TSCORE.showAlertDialog("Saving " + filePath + " failed.");
    });
  }

  // Public API definition
  exports.showContextMenu = showContextMenu;
  exports.initUI = initUI;
  exports.clearSearchFilter = clearSearchFilter;
  exports.openLinkExternally = openLinkExternally;
  exports.enableTopToolbar = enableTopToolbar;
  exports.disableTopToolbar = disableTopToolbar;
  exports.hideWaitingDialog = hideWaitingDialog;
  exports.showWaitingDialog = showWaitingDialog;
  exports.showAlertDialog = showAlertDialog;
  exports.showSuccessDialog = showSuccessDialog;
  exports.showConfirmDialog = showConfirmDialog;
  exports.showFileRenameDialog = showFileRenameDialog;
  exports.showFileCreateDialog = showFileCreateDialog;
  exports.showFileDeleteDialog = showFileDeleteDialog;
  exports.showWelcomeDialog = showWelcomeDialog;
  exports.startGettingStartedTour = startGettingStartedTour;
  exports.showTagEditDialog = showTagEditDialog;
  exports.showOptionsDialog = showOptionsDialog;
  exports.showAboutDialog = showAboutDialog;
  exports.showLocationsPanel = showLocationsPanel;
  exports.showTagsPanel = showTagsPanel;
  exports.showContactUsPanel = showContactUsPanel;
  exports.showDirectoryBrowserDialog = showDirectoryBrowserDialog;
  exports.showMoveCopyFilesDialog = showMoveCopyFilesDialog;
  exports.hideAllDropDownMenus = hideAllDropDownMenus;
  exports.createHTMLFile = createHTMLFile;
  exports.createMDFile = createMDFile;
  exports.createTXTFile = createTXTFile;
  exports.showSearchArea = showSearchArea;
});
