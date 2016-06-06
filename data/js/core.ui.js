/* Copyright (c) 2012-2016 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */

/* global define, Handlebars, isNode, isFirefox,WebAudioRecorder */
define(function(require, exports, module) {
  'use strict';

  console.log('Loading core.ui.js ...');

  var TSCORE = require('tscore');
  var TSPOSTIO = require("tspostioapi");

  var fileContent;
  var fileType;
  var waitingDialogTimeoutID;
  var addFileInputName;

  var fileDropTemplate = Handlebars.compile(
          '<div id="fileDropArea">' +
          '<div id="fileDropExplanation"><i class="fa fa-2x fa-mail-forward"></i><br>' +
          '<span>Drop files here in order to be copied or moved in the current folder</span></div>' +
          '</div>'
  );

  function initUI() {
    $('#appVersion').text(TSCORE.Config.DefaultSettings.appVersion + '.' + TSCORE.Config.DefaultSettings.appBuild);
    $('#appVersion').attr('title', 'BuildID: ' + TSCORE.Config.DefaultSettings.appVersion + '.' + TSCORE.Config.DefaultSettings.appBuild + '.' + TSCORE.Config.DefaultSettings.appBuildID);

    // prevent default behavior from changing page on dropped file
    $(document).on('drop dragend dragenter dragover', function(event) { // dragleave
      //  dragstart drag
      event.preventDefault();
    });

    // Managing droping of files in the perspectives
    if (isNode || isElectron) {
      $('#viewContainers').on('dragenter', function(event) {
        event.preventDefault();
        showFileDropArea();
      });
      $('#viewContainers').on('drop', function(event) {
        //event.preventDefault();
        if (event.originalEvent.dataTransfer !== undefined) {
          var files = event.originalEvent.dataTransfer.files;
          TSCORE.IO.focusWindow();
          hideFileDropArea();
          TSCORE.PerspectiveManager.clearSelectedFiles();
          var filePath;
          if (files !== undefined && files.length > 0) {
            for (var i = 0; i < files.length; i++) {
              // file[i] -> {"webkitRelativePath":"","path":"/home/na/Desktop/Kola2","lastModifiedDate":"2014-07-11T16:40:52.000Z","name":"Kola2","type":"","size":4096}
              filePath = files[i].path;
              if (filePath.length > 1) {
                TSCORE.selectedFiles.push(filePath);
              }
            }
          }
          if (TSCORE.selectedFiles.length > 0) {
            showMoveCopyFilesDialog();
          }
        }
      });
    }

    $('#addFileInput').on('change', function(selection) {
      //console.log("Selected File: "+$("#addFileInput").val());
      var file = selection.currentTarget.files[0];
      //console.log("Selected File: "+JSON.stringify(selection.currentTarget.files[0]));
      addFileInputName = decodeURIComponent(file.name);
      var reader = new FileReader();
      reader.onload = onFileReadComplete;
      if (isCordova) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });

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

    function eulaVersion() {
      if (TSCORE.PRO) {
        $('#aboutIframe').attr('src', 'pro/about.html');
      } else {
        $('#aboutIframe').attr('src', 'about.html');
      }
    }

    $('#aboutDialogBack').click(function() {
      eulaVersion();
    });
    $('#confirmButtonDialog').click(function() {
      eulaVersion();
    });
    $('#closeDialog').click(function() {
      eulaVersion();
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

    $('#fileOpenProperties').click(function() {
    });
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

    $('#perspectiveSwitcherButton').prop('disabled', true);

    $('#newVersionAvailable').on("click", function() {
      $('#openWhatsnew').click();
    });

    var $contactUsContent = $('#contactUsContent');
    $contactUsContent.on('click', '#openHints', showWelcomeDialog);
    $contactUsContent.on('click', '#openUservoice', function(e) {
      e.preventDefault();
      TSCORE.IO.openFile($(this).attr('href'));
    });
    $contactUsContent.on('click', '#openGooglePlay', function(e) {
      e.preventDefault();
      TSCORE.IO.openFile($(this).attr('href'));
    });
    $contactUsContent.on('click', '#openAppleAppStore', function(e) {
      e.preventDefault();
      TSCORE.IO.openFile($(this).attr('href'));
    });
    $contactUsContent.on('click', '#openWhatsnew', function(e) {
      e.preventDefault();
      TSCORE.IO.openFile($(this).attr('href'));
    });
    $contactUsContent.on('click', '#openGitHubIssues', function(e) {
      e.preventDefault();
      TSCORE.IO.openFile($(this).attr('href'));
    });
    $contactUsContent.on('click', '#helpUsTranslate', function(e) {
      e.preventDefault();
      TSCORE.IO.openFile($(this).attr('href'));
    });
    $contactUsContent.on('click', '#openTwitter', function(e) {
      e.preventDefault();
      TSCORE.IO.openFile($(this).attr('href'));
    });
    $contactUsContent.on('click', '#openTwitter2', function(e) {
      e.preventDefault();
      TSCORE.IO.openFile($(this).attr('href'));
    });
    $contactUsContent.on('click', '#openGooglePlus', function(e) {
      e.preventDefault();
      TSCORE.IO.openFile($(this).attr('href'));
    });
    $contactUsContent.on('click', '#openFacebook', function(e) {
      e.preventDefault();
      TSCORE.IO.openFile($(this).attr('href'));
    });
    $contactUsContent.on('click', '#openSupportUs', function(e) {
      e.preventDefault();
      TSCORE.IO.openFile($(this).attr('href'));
    });

    $('#newVersionMenu').on('click', '.whatsNewLink', function(e) {
      e.preventDefault();
      TSCORE.IO.openFile($(this).attr('href'));
    });

    // Hide drop downs by click and drag
    $(document).click(function() {
      TSCORE.hideAllDropDownMenus();
    });

    platformTuning();
  }

  function showFileDropArea() {
    if ($('#fileDropArea').length < 1) {
      $('#viewContainers').append(fileDropTemplate({}));
      $('#fileDropArea').on('dragleave', function(event) {
        event.preventDefault();
        hideFileDropArea();
      });
    } else {
      $('#fileDropArea').show();
    }
  }

  function hideFileDropArea() {
    $('#fileDropArea').hide();
  }

  function onFileReadComplete(event) {
    console.log('Content on file read complete: ' + JSON.stringify(event));
    //change name for ios fakepath
    if (isCordovaiOS) {
      var fileExt = TSCORE.TagUtils.extractFileExtension(addFileInputName);
      addFileInputName = TSCORE.TagUtils.beginTagContainer + TSCORE.TagUtils.formatDateTime4Tag(new Date(), true) + TSCORE.TagUtils.endTagContainer + fileExt;
    }
    var filePath = TSCORE.currentPath + TSCORE.dirSeparator + addFileInputName;

    // TODO event.currentTarget.result is ArrayBuffer
    // Sample call from PRO version using content = TSCORE.Utils.base64ToArrayBuffer(baseString);

    TSCORE.IO.saveBinaryFilePromise(filePath, event.currentTarget.result).then(function() {
      TSCORE.showSuccessDialog("File saved successfully.");
      TSCORE.PerspectiveManager.refreshFileListContainer();
    }, function(error) {
      TSCORE.hideLoadingAnimation();
      TSCORE.showAlertDialog("Saving " + filePath + " failed.");
      console.error("Save to file " + filePath + " failed " + error);
    });
    addFileInputName = undefined;
  }

  var openWaitingDialog;

  function showWaitingDialog(message, title) {
    openWaitingDialog = true;
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
      if (openWaitingDialog) {
        waitingModal.modal({
          backdrop: 'static',
          show: true
        });
        openWaitingDialog = false;
      }
    }, 500);

    waitingModal.draggable({
      handle: ".modal-header"
    });
  }

  function hideWaitingDialog(message, title) {
    openWaitingDialog = false;
    window.clearTimeout(waitingDialogTimeoutID);
    $('#waitingDialog').modal('hide');
  }

  function showSuccessDialog(message) {
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
  }

  function showAlertDialog(message, title) {
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
  }

  function showConfirmDialog(title, message, okCallback, cancelCallback, confirmShowNextTime) {
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
    confirmModal.draggable({
      handle: ".modal-header"
    });
  }

  function showFileCreateDialog() {
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
  }

  function showFileRenameDialog(filePath) {
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
  }

  function showFileDeleteDialog(filePath) {
    console.log('Deleting file...');
    var dlgConfirmMsgId = 'ns.dialogs:fileDeleteContentConfirm';
    if (TSCORE.PRO && TSCORE.Config.getUseTrashCan()) {
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
  }

  function showDeleteFilesDialog() {
    console.log('Deleting files...');
    var selFiles = " ";

    TSCORE.Utils.getUniqueSelectedFiles().forEach(function(file) {
      selFiles += " " + TSCORE.Utils.baseName(file) + " ,";
    });

    selFiles = selFiles.substring(0, selFiles.length - 1);
    var dlgConfirmMsgId = 'ns.dialogs:selectedFilesDeleteContentConfirm';

    if (TSCORE.PRO && TSCORE.Config.getUseTrashCan()) {
      dlgConfirmMsgId = 'ns.pro:trashFilesDeleteContentConfirm';
    }

    TSCORE.showConfirmDialog(
            $.i18n.t('ns.dialogs:fileDeleteTitleConfirm'),
            $.i18n.t(dlgConfirmMsgId, {selectedFiles: selFiles}),
            function() {
              if (TSCORE.IO.stopWatchingDirectories) {
                TSCORE.IO.stopWatchingDirectories();
              }
              TSCORE.IOUtils.deleteFiles(TSCORE.Utils.getUniqueSelectedFiles());
            }
    );
  }

  function showTagEditDialog() {
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
  }

  function showRenameFileDialog() {
    if (TSCORE.selectedFiles[0]) {
      $('#renamedFileName').val(TSCORE.selectedFiles[0]);
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
    } else {
      TSCORE.showAlertDialog("Renaming file failed. Please select a file.");
    }
  }

  function showDirectoryBrowserDialog(path) {
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
  }

  function showOptionsDialog() {
    require([
      'text!templates/OptionsDialog.html',
      'tsoptions'
    ], function(uiTPL, controller) {
      if ($('#dialogOptions').length < 1) {
        var uiTemplate = Handlebars.compile(uiTPL);
        $('body').append(uiTemplate({isProVersion: TSCORE.PRO ? true : false, isElectron: isElectron ? true : false}));

        controller.initUI();
      }
      $('#dialogOptions').i18n();
      controller.reInitUI();
    });
  }

  function showWelcomeDialog() {
    startGettingStartedTour();
  }

  function startGettingStartedTour() {
    var tsGettingStarted = require('tsgettingstarted');
    tsGettingStarted.startTour();
  }

  function showMoveCopyFilesDialog() {
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
          if (TSCORE.IO.stopWatchingDirectories) {
            TSCORE.IO.stopWatchingDirectories();
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
          if (TSCORE.IO.stopWatchingDirectories) {
            TSCORE.IO.stopWatchingDirectories();
          }
          Promise.all(fileOperations).then(function(success) {
            // TODO handle copying sidecar files
            TSCORE.hideWaitingDialog();
            TSCORE.navigateToDirectory(TSCORE.currentPath);
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
  }

  function showAboutDialog() {
    $('#dialogAboutTS').modal({
      backdrop: 'static',
      show: true
    });
    $('#dialogAboutTS').draggable({
      handle: ".modal-header"
    });
  }

  // Open Audio Recording Dialog
  function showAudioRecordingDialog() {
    $('#audioRecordingDialog').modal({
      backdrop: 'static',
      show: true
    });
    $('#audioRecordingDialog').draggable({
      handle: ".modal-header"
    });
  }

// navigator.getUserMedia shim
  navigator.getUserMedia =
          navigator.getUserMedia ||
          navigator.webkitGetUserMedia ||
          navigator.mozGetUserMedia ||
          navigator.msGetUserMedia;

// URL shim
  window.URL = window.URL || window.webkitURL;

// audio context + .createScriptProcessor shim
  var audioContext = new AudioContext;
  if (audioContext.createScriptProcessor == null)
    audioContext.createScriptProcessor = audioContext.createJavaScriptNode;


  // elements (jQuery objects)
  var $testToneLevel = $('#testToneLevel'),
          $microphone = $('#microphone'),
          $microphoneLevel = $('#microphoneLevel'),
          $timeLimit = $('#time-limit'),
          $encoding = $('input[name="encoding"]'),
          $encodingOption = $('#encoding-option'),
          $encodingProcess = $('input[name="encoding-process"]'),
          $reportInterval = $('#report-interval'),
          $bufferSize = $('#buffer-size'),
          $recording = $('#recording'),
          $timeDisplay = $('#time-display'),
          $record = $('#record'),
          $cancel = $('#cancel'),
          $dateTime = $('#date-time'),
          $recordingList = $('#recordingList'),
          $modalLoading = $('#modal-loading'),
          $modalProgress = $('#modal-progress'),
          $modalError = $('#modal-error');

  // initialize input element states (required for reloading page on Firefox)
  //$testToneLevel.attr('disabled', false);
  //$testToneLevel[0].valueAsNumber = 0;
  //$microphone.attr('disabled', false);
  //$microphone[0].checked = false;
  //$microphoneLevel.attr('disabled', false);
  //$microphoneLevel[0].valueAsNumber = 0;
  //$timeLimit.attr('disabled', false);
  //$timeLimit[0].valueAsNumber = 3;
  //$encoding.attr('disabled', false);
  //$encoding[0].checked = true;
  //$encodingProcess.attr('disabled', false);
  //$encodingProcess[0].checked = true;
  //$reportInterval.attr('disabled', false);
  //$reportInterval[0].valueAsNumber = 1;
  //$bufferSize.attr('disabled', false);


  var testTone = (function() {
    var osc = audioContext.createOscillator(),
            lfo = audioContext.createOscillator(),
            ampMod = audioContext.createGain(),
            output = audioContext.createGain();
    lfo.type = 'square';
    lfo.frequency.value = 2;
    osc.connect(ampMod);
    lfo.connect(ampMod.gain);
    output.gain.value = 0.5;
    ampMod.connect(output);
    osc.start();
    lfo.start();
    return output;
  })();


  var testToneLevel = audioContext.createGain(),
          microphone = undefined,     // obtained by user click
          microphoneLevel = audioContext.createGain(),
          mixer = audioContext.createGain();
  testTone.connect(testToneLevel);
  testToneLevel.gain.value = 0;
  testToneLevel.connect(mixer);
  microphoneLevel.gain.value = 0;
  microphoneLevel.connect(mixer);
  mixer.connect(audioContext.destination);

// audio recorder object
  var audioRecorder = new WebAudioRecorder(mixer, {
    workerDir: require([
      "js!data/libs/audio-record/",
    ]),
    onEncoderLoading: function(recorder, encoding) {
      $modalLoading.find('.modal-title').html("Loading " + encoding.toUpperCase() + " encoder ...");
      $modalLoading.modal('show');
    },
    onEncoderLoaded: function() {
      $modalLoading.modal('hide');
    }
  });

  // mixer levels
  $testToneLevel.on('input', function() {
    var level = $testToneLevel[0].valueAsNumber / 100;
    testToneLevel.gain.value = level * level;
  });

  $microphoneLevel.on('input', function() {
    var level = $microphoneLevel[0].valueAsNumber / 100;
    microphoneLevel.gain.value = level * level;
  });

// obtaining microphone input
  $microphone.click(function() {
    if (microphone == null)
      navigator.getUserMedia({ audio: true },
              function(stream) {
                microphone = audioContext.createMediaStreamSource(stream);
                microphone.connect(microphoneLevel);
                $microphone.attr('disabled', true);
                $microphoneLevel.removeClass('hidden');
              },
              function(error) {
                $microphone[0].checked = false;
                audioRecorder.onError(audioRecorder, "Could not get audio input.");
              });
  });

  // encoding selector + encoding options
  var OGG_QUALITY = [-0.1, 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
          OGG_KBPS = [45, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 500],
          //MP3_BIT_RATE = [64, 80, 96, 112, 128, 160, 192, 224, 256, 320],
          ENCODING_OPTION = {
            wav: {
              label: '',
              hidden: true,
              max: 1,
              text: function(val) { return ''; }
            },
            ogg: {
              label: 'Quality',
              hidden: false,
              max: OGG_QUALITY.length - 1,
              text: function(val) {
                return OGG_QUALITY[val].toFixed(1) +
                        " (~" + OGG_KBPS[val] + "kbps)";
              }
            },
            //mp3: {
            //  label: 'Bit rate',
            //  hidden: false,
            //  max: MP3_BIT_RATE.length - 1,
            //  text: function(val) { return "" + MP3_BIT_RATE[val] + "kbps"; }
            //}
          };

  //function startRecording() {
  //  $recording.removeClass('hidden');
  //  $record.html('STOP');
  //  $cancel.removeClass('hidden');
  //  disableControlsOnRecord(true);
  //  audioRecorder.setOptions({
  //    timeLimit: $timeLimit[0].valueAsNumber * 60,
  //    encodeAfterRecord: encodingProcess === 'separate',
  //    progressInterval: $reportInterval[0].valueAsNumber * 1000,
  //    ogg: { quality: OGG_QUALITY[optionValue.ogg] },
  //    mp3: { bitRate: MP3_BIT_RATE[optionValue.mp3] }
  //  });
  //  audioRecorder.startRecording();
  //  //setProgress(0);
  //}
  //
  //function stopRecording(finish) {
  //  $recording.addClass('hidden');
  //  $record.html('RECORD');
  //  $cancel.addClass('hidden');
  //  //disableControlsOnRecord(false);
  //  if (finish) {
  //    audioRecorder.finishRecording();
  //    if (audioRecorder.options.encodeAfterRecord) {
  //      $modalProgress
  //      .find('.modal-title')
  //      .html("Encoding " + audioRecorder.encoding.toUpperCase());
  //      $modalProgress.modal('show');
  //    }
  //  } else
  //    audioRecorder.cancelRecording();
  //}

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
      // Directory menu
      $('#directoryMenuOpenDirectory').parent().hide();
      $('#directoryMenuRenameDirectory').parent().hide();
      $('#directoryMenuDeleteDirectory').parent().hide();
      $('#directoryMenuCreateDirectory').parent().hide();
      // File menu
      $('#fileMenuOpenDirectory').parent().hide();
      $('#fileMenuOpenNatively').parent().hide();
      $('#fileMenuAddTag').parent().hide();
      $('#fileMenuMoveCopyFile').parent().hide();
      $('#fileMenuRenameFile').parent().hide();
      $('#fileMenuDeleteFile').parent().hide();
      // Tag menu
      $('#tagMenuEditTag').parent().hide();
      $('#tagMenuMoveTagFirst').parent().hide();
      $('#tagMenuMoveTagLeft').parent().hide();
      $('#tagMenuMoveTagRight').parent().hide();
      $('#tagMenuRemoveTag').parent().hide();
      $('#openDirectory').parent().hide();
      // File opener menu
      $('#tagFile').parent().hide();
      $('#renameFile').parent().hide();
      $('#duplicateFile').parent().hide();
      $('#sendFile').parent().hide();
      $('#deleteFile').parent().hide();
      $('#openNatively').parent().hide();
      $('#addTagFileViewer').hide();
    } else if (isWeb) {
      $('#directoryMenuOpenDirectory').parent().hide();
      $('#fileMenuOpenDirectory').parent().hide();
      $('#fileMenuOpenNatively').parent().hide();
      $('#openDirectory').parent().hide();
      $('#openNatively').hide();
    } else if (isFirefox) {
      $('#openNatively').hide();
      $('#fileMenuOpenNatively').parent().hide();
    } else if (isNode || isElectron) {
      $('#openFileInNewWindow').hide();
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

  function showContextMenu(menuId, sourceObject) {
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
  }

  function hideAllDropDownMenus() {
    $('#tagGroupMenu').hide();
    $('#tagTreeMenu').hide();
    $('#directoryMenu').hide();
    $('#tagMenu').hide();
    $('#fileMenu').hide();
    $('.dirAltNavMenu').hide();
    $('#locationTagTreeMenu').hide();
    //$('#searchOptions').hide();
  }

  function showLocationsPanel() {
    TSCORE.openLeftPanel();
    $('#tagGroupsContent').hide();
    $('#contactUsContent').hide();
    $('#locationContent').show();
    $('#showTagGroups').removeClass('active');
    $('#contactUs').removeClass('active');
    $('#showLocations').addClass('active');
  }

  function showTagsPanel() {
    TSCORE.openLeftPanel();
    $('#locationContent').hide();
    $('#contactUsContent').hide();
    $('#tagGroupsContent').show();
    $('#showLocations').removeClass('active');
    $('#contactUs').removeClass('active');
    $('#showTagGroups').addClass('active');
  }

  function showContactUsPanel() {
    TSCORE.openLeftPanel();
    $('#locationContent').hide();
    $('#tagGroupsContent').hide();
    $('#contactUsContent').show();
    $('#showLocations').removeClass('active');
    $('#showTagGroups').removeClass('active');
    $('#contactUs').addClass('active');
  }

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
  exports.enableTopToolbar = enableTopToolbar;
  exports.disableTopToolbar = disableTopToolbar;
  exports.hideWaitingDialog = hideWaitingDialog;
  exports.showWaitingDialog = showWaitingDialog;
  exports.showAlertDialog = showAlertDialog;
  exports.showSuccessDialog = showSuccessDialog;
  exports.showConfirmDialog = showConfirmDialog;
  exports.showFileRenameDialog = showFileRenameDialog;
  exports.showRenameFileDialog = showRenameFileDialog;
  exports.showFileCreateDialog = showFileCreateDialog;
  exports.showFileDeleteDialog = showFileDeleteDialog;
  exports.showDeleteFilesDialog = showDeleteFilesDialog;
  exports.showWelcomeDialog = showWelcomeDialog;
  exports.startGettingStartedTour = startGettingStartedTour;
  exports.showTagEditDialog = showTagEditDialog;
  exports.showOptionsDialog = showOptionsDialog;
  exports.showAboutDialog = showAboutDialog;
  exports.showAudioRecordingDialog = showAudioRecordingDialog;
  exports.showLocationsPanel = showLocationsPanel;
  exports.showTagsPanel = showTagsPanel;
  exports.showContactUsPanel = showContactUsPanel;
  exports.showDirectoryBrowserDialog = showDirectoryBrowserDialog;
  exports.showMoveCopyFilesDialog = showMoveCopyFilesDialog;
  exports.hideAllDropDownMenus = hideAllDropDownMenus;
  exports.createHTMLFile = createHTMLFile;
  exports.createMDFile = createMDFile;
  exports.createTXTFile = createTXTFile;
});
