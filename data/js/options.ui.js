/* Copyright (c) 2012-2015 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */
/* global define, Mousetrap, Handlebars  */
define(function(require, exports, module) {
  'use strict';
  console.log('Loading options.ui.js ...');
  var TSCORE = require('tscore');
  var tsExtManager = require('tsextmanager');
  var saveAs = require('libs/filesaver.js/FileSaver.min.js');

  function generateSelectOptions(parent, data, selectedId, helpI18NString) {
    parent.empty();
    if (!helpI18NString) {
      helpI18NString = "";
    }
    parent.append($('<option>')
      .text('')
      .attr("data-i18n", helpI18NString)
      .val('false'));
    data.forEach(function(extension) {
      if (selectedId === extension.id) {
        parent.append($('<option>').attr('selected', 'selected').text(extension.name).val(extension.id));
      } else {
        parent.append($('<option>').text(extension.name).val(extension.id));
      }
    });
  }

  function addPerspective(parent, perspectiveId) {
    var perspectiveControl = $('<div class="form-inline">')
      .append($('<div class="flexLayout">')
        .append($('<select class="form-control flexMaxWidth"></select>'))
        .append($('<button class="btn btn-link" style="width: 40px" data-i18n="[title]ns.dialogs:removePerspectiveTooltip"><i class="fa fa-times"></button>')
          .click(function() {
            var row4Remove = $(this).parent().parent();
            TSCORE.showConfirmDialog($.i18n.t('ns.dialogs:titleConfirm'), "Do you really want to remove this perspective?", function() {
              row4Remove.remove();
            });
          })));
    generateSelectOptions(perspectiveControl.find('select'), TSCORE.Config.getPerspectiveExtensions(), perspectiveId, "ns.dialogs:choosePerspective");
    perspectiveControl.i18n();
    parent.append(perspectiveControl);
  }

  function addFileType(parent, fileext, viewerId, editorId) {
    var fileTypeControl = $('<div class="form-inline">')
      .append($('<div class="flexLayout" >')
        .append($('<input style="width: 80px" type="text" class="form-control" data-i18n="[placeholder]ns.dialogs:fileExtensionPlaceholder">').val(fileext))
        .append($('<select class="ftviewer form-control flexMaxWidth"></select>'))
        .append($('<select class="fteditor form-control flexMaxWidth"></select>'))
        .append($('<button style="width: 30px" class="btn btn-link" data-i18n="[title]ns.dialogs:removeFileTypeTooltip"><i class="fa fa-times"></button>')
        .click(function() {
          var row4Remove = $(this).parent().parent();
          TSCORE.showConfirmDialog($.i18n.t('ns.dialogs:titleConfirm'), "Do you really want to remove this file type?", function() {
            row4Remove.remove();
          });
        })));

    generateSelectOptions(fileTypeControl.find('.ftviewer'), TSCORE.Config.getViewerExtensions(), viewerId, "ns.dialogs:chooseFileViewer");
    generateSelectOptions(fileTypeControl.find('.fteditor'), TSCORE.Config.getEditorExtensions(), editorId, "ns.dialogs:chooseFileEditor");

    fileTypeControl.i18n();
    parent.prepend(fileTypeControl);
  }

  function enableMetaData() {
    if (!TSCORE.PRO) {
      return;
    }
    var isMetaEnabled = $('#enableMetaData').is(':checked');
    if (!isMetaEnabled) { 
      $('#writeMetaToSidecarFile').attr('checked', false);
      $('#useOCR').attr('checked', false);
      $('#useTextExtraction').attr('checked', false);
      $('#useGenerateThumbnails').attr('checked', false);
      //TSCORE.Config.setWriteMetaToSidecarFile(false);
    }
    $('#writeMetaToSidecarFile').attr('disabled', !isMetaEnabled);
    $('#useOCR').attr('disabled', !isMetaEnabled);
    $('#useTextExtraction').attr('disabled', !isMetaEnabled);
    $('#useGenerateThumbnails').attr('disabled', !isMetaEnabled);
  }

  function initUI() {
    $('#addFileTypeButton').click(function(e) {
      // Fixes reloading of the application by click
      e.preventDefault();
      addFileType($('#fileTypesList'), '', '', '');
      //$('#fileTypesList').parent().animate({ scrollTop: ($('#fileTypesList').height()) }, 'slow');
    });
    $('#addPerspectiveButton').click(function(e) {
      // Fixes reloading of the application by click
      e.preventDefault();
      addPerspective($('#perspectiveList'), '');
    });
    $('#saveSettingsButton').click(function() {
      updateSettings();
      $('#dialogOptions').modal('hide');
    });
    $('#saveSettingsRestartButton').click(function() {
      updateSettings();
      TSCORE.reloadUI();
    });
    $('#defaultSettingsButton').click(function() {
      TSCORE.showConfirmDialog(
          $.i18n.t('ns.dialogs:restoreDefaulSettingTitleConfirm'),
          $.i18n.t('ns.dialogs:restoreDefaulSettingMessageConfirm'), function() {
        TSCORE.Config.loadDefaultSettings();
      });
    });
    $('#keyBindingInstructions').toggle();
    $('#keyBindingInstructionsToggle').on('click', function() {
      $('#keyBindingInstructions').toggle();
      return false;
    });
    if (isCordova) {
      $('#trashCanArea').hide();
      $('#exportTagGroupsButton').hide();
      $('#showMainMenuCheckbox').parent().hide();
    }
    $('#exportTagGroupsButton').click(function() {
      var jsonFormat = '{ "appName": "' + TSCORE.Config.DefaultSettings.appName +
        '", "appVersion": "' + TSCORE.Config.DefaultSettings.appVersion +
        '", "appBuild": "' + TSCORE.Config.DefaultSettings.appBuild +
        '", "settingsVersion": ' + TSCORE.Config.DefaultSettings.settingsVersion +
        ', "tagGroups": ';
      var blob = new Blob([jsonFormat + JSON.stringify(TSCORE.Config.getAllTagGroupData()) + '}'], {
        type: 'application/json'
      });
      saveAs(blob, 'tsm[' + TSCORE.TagUtils.formatDateTime4Tag(new Date(), true) + '].json');
      console.log('Group Data Saved...');
    });

    $('#enableMetaData').change(function() {
      enableMetaData();
    });
  }

  function reInitUI() {
    $('#extensionsPathInput').val(TSCORE.Config.getExtensionPath());
    $('#showHiddenFilesCheckbox').attr('checked', TSCORE.Config.getShowUnixHiddenEntries());
    $('#showMainMenuCheckbox').attr('checked', TSCORE.Config.getShowMainMenu());
    $('#checkforUpdatesCheckbox').attr('checked', TSCORE.Config.getCheckForUpdates());
    $('#calculateTagsCheckbox').attr('checked', TSCORE.Config.getCalculateTags());
    $('#loadLocationMetaData').attr('checked', TSCORE.Config.getLoadLocationMeta());
    $('#tagsDelimiterInput').val(TSCORE.Config.getTagDelimiter());
    $('#prefixTagContainerInput').val(TSCORE.Config.getPrefixTagContainer());
    $('#nextDocumentKeyBinding').val(TSCORE.Config.getNextDocumentKeyBinding());
    $('#prevDocumentKeyBinding').val(TSCORE.Config.getPrevDocumentKeyBinding());
    $('#closeDocumentKeyBinding').val(TSCORE.Config.getCloseViewerKeyBinding());
    $('#addRemoveTagsKeyBinding').val(TSCORE.Config.getAddRemoveTagsKeyBinding());
    $('#editDocumentKeyBinding').val(TSCORE.Config.getEditDocumentKeyBinding());
    $('#reloadDocumentKeyBinding').val(TSCORE.Config.getReloadDocumentKeyBinding());
    $('#saveDocumentKeyBinding').val(TSCORE.Config.getSaveDocumentKeyBinding());
    $('#documentPropertiesKeyBinding').val(TSCORE.Config.getPropertiesDocumentKeyBinding());
    $('#showSearchKeyBinding').val(TSCORE.Config.getSearchKeyBinding());
    $('#perspectiveList').empty();
    $('#writeMetaToSidecarFile').attr('checked', TSCORE.Config.getWriteMetaToSidecarFile());
    $('#useDefaultLocationCheckbox').attr('checked', TSCORE.Config.getUseDefaultLocation());
    $('#selectAllKeyBinding').val(TSCORE.Config.getSelectAllKeyBinding());
    if (TSCORE.PRO) {
      $('#enableMetaData').attr('checked', TSCORE.Config.getEnableMetaData());
      $('#useTrashCan').attr('checked', TSCORE.Config.getUseTrashCan());
      $('#useOCR').attr('checked', TSCORE.Config.getUseOCR());
      $('#useTextExtraction').attr('checked', TSCORE.Config.getUseTextExtraction());
      $('#useGenerateThumbnails').attr('checked', TSCORE.Config.getUseGenerateThumbnails());
      enableMetaData();
    }
    
    var $languagesDropdown = $('#languagesList');
    $languagesDropdown.empty();
    TSCORE.Config.getSupportedLanguages().forEach(function(value) {
      if (TSCORE.Config.getInterfaceLanguage() === value.iso) {
        $languagesDropdown.append($('<option>').attr('selected', 'selected').text(value.title).val(value.iso));
      } else {
        $languagesDropdown.append($('<option>').text(value.title).val(value.iso));
      }
    });
    $('#fileTypesList').empty();

    TSCORE.Config.getActivatedPerspectives().forEach(function(value) {
      addPerspective($('#perspectiveList'), value.id);
    });

    TSCORE.Config.getSupportedFileTypes().sort(stringSorting).forEach(function(value) {
      addFileType($('#fileTypesList'), value.type, value.viewer, value.editor);
    });

    $('#dialogOptions a:first').tab('show');
    $('#dialogOptions').modal({
      backdrop: 'static',
      show: true
    });
  }

  function stringSorting(a, b) {
    if (a.type > b.type) {
      return -1;
    }
    if (a.type < b.type) {
      return 1;
    }
    return 0;
  }

  function parseKeyBinding(keybinding) {
    keybinding = keybinding.trim();
    if (keybinding.indexOf(',') >= 0) {
      keybinding = keybinding.split(',');
    }
    return keybinding;
  }

  function updateSettings() {
    TSCORE.Config.setExtensionPath($('#extensionsPathInput').val());
    TSCORE.Config.setShowUnixHiddenEntries($('#showHiddenFilesCheckbox').is(':checked'));
    TSCORE.Config.setShowMainMenu($('#showMainMenuCheckbox').is(':checked'));
    TSCORE.Config.setCheckForUpdates($('#checkforUpdatesCheckbox').is(':checked'));
    TSCORE.Config.setCalculateTags($('#calculateTagsCheckbox').is(':checked'));
    TSCORE.Config.setTagDelimiter($('#tagsDelimiterInput').val());
    TSCORE.Config.setPrefixTagContainer($('#prefixTagContainerInput').val());
    TSCORE.Config.setLoadLocationMeta($('#loadLocationMetaData').is(':checked'));
    TSCORE.Config.setNextDocumentKeyBinding(parseKeyBinding($('#nextDocumentKeyBinding').val()));
    TSCORE.Config.setPrevDocumentKeyBinding(parseKeyBinding($('#prevDocumentKeyBinding').val()));
    TSCORE.Config.setCloseViewerKeyBinding(parseKeyBinding($('#closeDocumentKeyBinding').val()));
    TSCORE.Config.setAddRemoveTagsKeyBinding(parseKeyBinding($('#addRemoveTagsKeyBinding').val()));
    TSCORE.Config.setEditDocumentKeyBinding(parseKeyBinding($('#editDocumentKeyBinding').val()));
    TSCORE.Config.setReloadDocumentKeyBinding(parseKeyBinding($('#reloadDocumentKeyBinding').val()));
    TSCORE.Config.setSaveDocumentKeyBinding(parseKeyBinding($('#saveDocumentKeyBinding').val()));
    TSCORE.Config.setPropertiesDocumentKeyBinding(parseKeyBinding($('#documentPropertiesKeyBinding').val()));
    TSCORE.Config.setSearchKeyBinding(parseKeyBinding($('#showSearchKeyBinding').val()));
    TSCORE.Config.setSelectAllKeyBinding(parseKeyBinding($('#selectAllKeyBinding').val()));
    if (TSCORE.PRO) {
      TSCORE.Config.setEnableMetaData($('#enableMetaData').is(':checked'));
      TSCORE.Config.setUseTrashCan($('#useTrashCan').is(':checked'));   
      TSCORE.Config.setUseOCR($('#useOCR').is(':checked'));  
      TSCORE.Config.setUseTextExtraction($('#useTextExtraction').is(':checked')); 
      TSCORE.Config.setUseGenerateThumbnails($('#useGenerateThumbnails').is(':checked')); 
    }
    var interfaceLang = $('#languagesList').val();
    TSCORE.Config.setInterfaceLanguage(interfaceLang);
    TSCORE.switchInterfaceLanguage(interfaceLang);
    TSCORE.Config.setActivatedPerspectives(collectPerspectivesData());
    TSCORE.Config.setSupportedFileTypes(collectSupportedFileTypesData());
    TSCORE.Config.setWriteMetaToSidecarFile($('#writeMetaToSidecarFile').is(':checked'));
    TSCORE.Config.setUseDefaultLocation($('#useDefaultLocationCheckbox').is(':checked'));
    TSCORE.Config.saveSettings();
  }

  function collectPerspectivesData() {
    var data = [];
    $('#perspectiveList').children().each(function(index, element) {
      if ($(element).find('select').val() != 'false') {
        data.push({
          'id': $(element).find('select').val()
        });
      }
    });
    return data;
  }

  function collectSupportedFileTypesData() {
    var data = [];
    $('#fileTypesList').children().each(function(index, element) {
      data.push({
        'type': $(element).find('input').val(),
        'viewer': $(element).find('.ftviewer').val(),
        'editor': $(element).find('.fteditor').val()
      });
    });
    return data;
  }

  // Public Methods
  exports.initUI = initUI;
  exports.reInitUI = reInitUI;
});
