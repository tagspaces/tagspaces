/* Copyright (c) 2012-2016 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */

/* global define, Handlebars  */
define(function(require, exports, module) {
  'use strict';

  console.log('Loading tags.ui.js...');

  var locationTagGroupKey = 'LTG';
  var calculatedTagGroupKey = 'CTG';

  var defaultTagColor = "#008000";
  var defaultTagTextColor = "#ffffff";

  var TSCORE = require('tscore');

  var tagGroupsTmpl = Handlebars.compile(
    '{{#each tagGroups}}' +
    '<div class="accordion-group disableTextSelection tagGroupContainer">' +
    '<div class="accordion-heading btn-group ui-droppable tagGroupContainerHeading flexLayout" key="{{key}}">' +
    '<button class="btn btn-link btn-lg tagGroupIcon" data-toggle="collapse" data-target="#tagButtons{{@index}}" data-i18n="[title]ns.common:toggleTagGroup" title="{{../toggleTagGroup}}">' +
    '<i class="fa fa-tags fa-fw"></i>' +
    '</button>' +
    '<button class="btn btn-link tagGroupTitle flexMaxWidth" data-toggle="collapse" data-target="#tagButtons{{@index}}" key="{{key}}">{{title}}&nbsp;' +
    '<sup><span class="badge" style="font-size: 9px;" data-i18n="[title]ns.common:tagGroupTagsCount">{{children.length}}</span></sup></button>' +
    '<button class="btn btn-link btn-lg tagGroupActions" key="{{key}}" data-i18n="[title]ns.common:tagGroupOperations" title="{{../tagGroupOperations}}">' +
    '<b class="fa fa-ellipsis-v"></b>' +
    '</button>' +
    '</div>' +
    '{{#if collapse}}' +
    '<div class="accordion-body collapse" id="tagButtons{{@index}}">' +
    '{{else}}' +
    '<div class="accordion-body collapse in" id="tagButtons{{@index}}">' +
    '{{/if}}' +
    '<div class="accordion-inner" id="tagButtonsContent{{@index}}" style="padding: 2px;">' +
    '<div>' +
    '{{#each children}}' +
    '<a class="btn btn-sm tagButton" tag="{{title}}" parentkey="{{../key}}" style="{{style}}" title="{{description}}" >' +
    '<span class="{{icon}}" /> ' +
    '{{title}}' +
    '{{#if count}} <span class="badge" style="font-size: 9px; background-color: rgba(187, 187, 187, 0.26);" data-i18n="[title]ns.common:tagGroupTagsCount1">{{count}}</span>{{/if}}' +
    '&nbsp;&nbsp;<span class="fa fa-ellipsis-v"></span>' +
    '</a>' +
    '{{/each}}' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '{{/each}}'
  );

  var tagButtonTmpl = Handlebars.compile('{{#each tags}} <button class="btn btn-sm tagButton" tag="{{tag}}" ' + 'filepath="{{filepath}}" style="{{style}}">{{tag}}&nbsp;&nbsp;<span class="fa fa-ellipsis-v dropDownIcon"></span></button>{{/each}}');


  function initUI() {
    $('#extMenuAddTagAsFilter').click(function() {
    });

    // Context menu for the tags in the file table and the file viewer
    $('#tagMenuAddTagAsFilter').click(function() {
      TSCORE.searchForTag(TSCORE.selectedTag);
    });

    $('#tagMenuEditTag').click(function() {
      TSCORE.showTagEditDialog();
    });

    $('#tagMenuRemoveTag').click(function() {
      TSCORE.TagUtils.removeTag(TSCORE.selectedFiles[0], TSCORE.selectedTag);
    });

    $('#tagMenuMoveTagFirst').click(function() {
      TSCORE.TagUtils.moveTagLocation(TSCORE.selectedFiles[0], TSCORE.selectedTag, 'first');
    });

    $('#tagMenuMoveTagRight').click(function() {
      TSCORE.TagUtils.moveTagLocation(TSCORE.selectedFiles[0], TSCORE.selectedTag, 'next');
    });

    $('#tagMenuMoveTagLeft').click(function() {
      TSCORE.TagUtils.moveTagLocation(TSCORE.selectedFiles[0], TSCORE.selectedTag, 'prev');
    });

    // Context menu for the tags in the tag tree
    $('#tagTreeMenuAddTagToFile').click(function() {
      TSCORE.TagUtils.addTag(TSCORE.Utils.getUniqueSelectedFiles(), [TSCORE.selectedTag]);
    });

    $('#tagTreeMenuAddTagAsFilter').click(function() {
      TSCORE.searchForTag(TSCORE.selectedTag);
    });

    $('#tagTreeMenuEditTag').click(function() {
      TSCORE.showTagEditInTreeDialog();
    });

    $('#tagTreeMenuDeleteTag').click(function() {
      TSCORE.showConfirmDialog('Delete Tag', 'Do you want to delete this tag from the taggroup?', function() {
        TSCORE.Config.deleteTag(TSCORE.selectedTagData);
        generateTagGroups();
      });
    });

    // Context menu for the tags groups
    $('#tagGroupMenuCreateNewTag').click(function() {
      TSCORE.showDialogTagCreate();
    });

    $('#tagGroupMenuImportTags').on('click', importTagGroups);

    $('#tagGroupMenuCreateTagGroup').click(function() {
      TSCORE.showDialogTagGroupCreate();
    });

    $('#tagGroupSort').click(function() {
      TSCORE.Config.sortTagGroup(TSCORE.selectedTagData);
      generateTagGroups();
    });

    $('#tagGroupMenuMoveUp').click(function() {
      TSCORE.Config.moveTagGroup(TSCORE.selectedTagData, 'up');
      generateTagGroups();
    });

    $('#tagGroupMenuMoveDown').click(function() {
      TSCORE.Config.moveTagGroup(TSCORE.selectedTagData, 'down');
      generateTagGroups();
    });

    $('#tagGroupMenuEdit').click(function() {
      TSCORE.showDialogEditTagGroup();
    });

    $('#tagGroupMenuDelete').click(function() {
      TSCORE.showConfirmDialog($.i18n.t('ns.dialogs:deleteTagGroupTitleConfirm'), $.i18n.t('ns.dialogs:deleteTagGroupContentConfirm', {
        tagGroup: TSCORE.selectedTagData.title
      }), function() {
        TSCORE.Config.deleteTagGroup(TSCORE.selectedTagData);
        generateTagGroups();
      });
    });

    // Dialogs
    $('#editTagInTreeButton').click(function() {
      TSCORE.Config.editTag(TSCORE.selectedTagData, $('#tagInTreeName').val(), $('#tagColor').val(), $('#tagTextColor').val(), $('#tagInTreeKeyBinding').val());
      generateTagGroups();
      TSCORE.PerspectiveManager.refreshFileListContainer();
    });

    $('#cleanTagsButton').click(function() {
      TSCORE.showConfirmDialog($.i18n.t('ns.dialogs:cleanFilesTitleConfirm'), $.i18n.t('ns.dialogs:cleanFilesContentConfirm'), function() {
        TSCORE.TagUtils.cleanFilesFromTags(TSCORE.Utils.getUniqueSelectedFiles());
      });
    });

    $('#addTagsButton').click(function() {
      var tags = $('#tags').val().split(',');
      TSCORE.TagUtils.addTag(TSCORE.Utils.getUniqueSelectedFiles(), tags);
    });

    $('#removeTagsButton').click(function() {
      var tags = $('#tags').val().split(',');
      TSCORE.TagUtils.removeTags(TSCORE.Utils.getUniqueSelectedFiles(), tags);
    });

    $('#createTagButton').click(function() {
      var tags = $('#newTagTitle').val().split(',');
      tags.forEach(function(value) {
        TSCORE.Config.createTag(TSCORE.selectedTagData, value);
      });
      generateTagGroups();
    });

    $('#createTagGroupButton').on("click", createTagGroup);

    $('#editTagGroupButton').click(function() {
      TSCORE.Config.editTagGroup(TSCORE.selectedTagData, $('#tagGroupName').val(), $('#editTagGroupBackgroundColor').val(), $('#editTagGroupForegroundColor').val(), $('#colorChangesToAllTags').prop('checked'));
      generateTagGroups();
    });
  }

  function importTagGroups() {
    console.log("tagGroupMenuImportTags");
    $('#jsonImportFileInput').click();
    $('#jsonImportFileInput').on('change', function(selection) {
      var file = selection.currentTarget.files[0];
      //addFileInputName = decodeURIComponent(file.name);
      var reader = new FileReader();
      reader.onload = function() {
        try {
          var jsonObj = JSON.parse(reader.result);
          if ($.isArray(jsonObj.tagGroups)) {
            showImportTagsDialog(jsonObj.tagGroups);
          } else {
            TSCORE.showAlertDialog($.i18n.t("ns.dialogs:invalidImportFile"));
          }
        } catch (e) {
          console.log(e);
          TSCORE.showAlertDialog($.i18n.t("ns.dialogs:invalidImportFile"));
        }
      };
      reader.readAsText(file);
    });
  }

  function createTagGroup() {
    TSCORE.Config.createTagGroup(TSCORE.selectedTagData, $('#newTagGroupName').val(), $('#tagGroupBackgroundColor').val(), $('#tagGroupForegroundColor').val());
    generateTagGroups();
  }

  function generateTagGroups() {
    console.log('Generating TagGroups...');
    var $tagGroupsContent = $('#tagGroupsContent');
    $tagGroupsContent.children().remove();
    $tagGroupsContent.addClass('accordion');

    var tagGroups = TSCORE.Config.Settings.tagGroups;
    var tag;
    // Cleaning Special TagGroups
    for (var k = 0; k < tagGroups.length; k++) {
      if (tagGroups[k].key.indexOf(locationTagGroupKey) === 0 || tagGroups[k].key === calculatedTagGroupKey) {
        console.log('Deleting:' + tagGroups[k].key + ' ' + k);
        tagGroups.splice(k, 1);
        k--;
      }
    }

    // Adding tags to the calculated tag group
    if (TSCORE.Config.getCalculateTags() && TSCORE.calculatedTags !== null) {
      tagGroups.push({
        'title': $.i18n.t('ns.common:tagsFromCurrentFolder'),
        'key': calculatedTagGroupKey,
        'expanded': true,
        'children': TSCORE.calculatedTags
      });
    }

    // Adding tag groups from the current location
    if (TSCORE.Config.getLoadLocationMeta() && TSCORE.locationTags !== null) {
      TSCORE.locationTags.forEach(function(data) {
        tagGroups.push({
          'title': data.title + ' (imported)',
          'key': locationTagGroupKey + TSCORE.TagUtils.formatDateTime4Tag(new Date(), true, true),
          'expanded': true,
          'children': data.children
        });
      });
    }

    // ehnances the taggroups with addition styling information
    for (var i = 0; i < tagGroups.length; i++) {
      for (var j = 0; j < tagGroups[i].children.length; j++) {
        tag = tagGroups[i].children[j];
        if (!tag.description) {
          tag.description = tag.title;
        }
        tag.icon = '';
        if (tag.type === 'smart') {
          tag.icon = 'fa fa-flask';
          if (tag.title === 'geoTag') {
            tag.icon = 'fa fa-map-marker';
          }
        }
        // Add keybinding to tags
        if (tag.keyBinding && tag.keyBinding.length > 0) {
          tag.icon = 'fa fa-keyboard-o';
          tag.description = tag.title + ' [' + tag.keyBinding + ']';
          Mousetrap.unbind(tag.keyBinding);
          Mousetrap.bind(tag.keyBinding, function(innerTag) {
            return function(e) {
              TSCORE.TagUtils.addTag(TSCORE.Utils.getUniqueSelectedFiles(), [innerTag]);
            };
          }(tag.title)); // jshint ignore:line
        }
        tag.style = generateTagStyle(tag);
      }
    }
    $tagGroupsContent.html(tagGroupsTmpl({
      'tagGroups': tagGroups,
      'toggleTagGroup': $.i18n.t('ns.common:toggleTagGroup'),
      'tagGroupOperations': $.i18n.t('ns.common:tagGroupOperations')
    }));

    $tagGroupsContent.find('.tagGroupIcon').each(function() {
      $(this).on('click', function() {
        var areaId = $(this).attr('data-target');
        if (areaId) {
          var index = areaId.substring(areaId.length - 1);
          tagGroups[index].collapse = $(areaId).is(':visible');
          TSCORE.Config.saveSettings();
        }
      });
    });

    $tagGroupsContent.find('.tagButton').each(function() {
      $(this).draggable({
        'appendTo': 'body',
        'helper': 'clone',
        'revert': 'invalid',
        'start': function() {
          console.log('Start dragging..........');
          TSCORE.selectedTagData = TSCORE.Config.getTagData($(this).attr('tag'), $(this).attr('parentKey'));
          TSCORE.selectedTag = generateTagValue(TSCORE.selectedTagData);
          TSCORE.selectedTagData.parentKey = $(this).attr('parentKey');
        }
      }).on('dblclick', function() {
        TSCORE.hideAllDropDownMenus();
        TSCORE.selectedTagData = TSCORE.Config.getTagData($(this).attr('tag'), $(this).attr('parentKey'));
        TSCORE.selectedTag = generateTagValue(TSCORE.selectedTagData);
        TSCORE.TagUtils.addTag(TSCORE.Utils.getUniqueSelectedFiles(), [TSCORE.selectedTag]);
      });
    });

    $tagGroupsContent.find('.tagGroupTitle').each(function() {
      $(this).on('click', function() {
        var areaId = $(this).attr('data-target');
        if (areaId) {
          var index = areaId.substring(areaId.length - 1);
          tagGroups[index].collapse = $(areaId).is(':visible');
          TSCORE.Config.saveSettings();
        }
      }).droppable({
        accept: '.tagButton',
        hoverClass: 'dirButtonActive',
        drop: function(event, ui) {
          //ui.draggable.detach();
          var parentKeyAttr = ui.draggable.attr('parentKey');
          var tagAttr = ui.draggable.attr('tag');
          var targetTagGroupKey = $(this).attr('key');
          if (parentKeyAttr && (targetTagGroupKey !== parentKeyAttr)) { // move from taggroup
            var tagGroupData = TSCORE.Config.getTagData(tagAttr, parentKeyAttr);
            //console.log('Moving tag: ' + tagGroupData.title + ' to ' + targetTagGroupKey);
            TSCORE.Config.moveTag(tagGroupData, targetTagGroupKey);
          } else if (tagAttr && tagAttr.length > 1) { // create from file
            var targetTagGroupData = TSCORE.Config.getTagGroupData(targetTagGroupKey);
            TSCORE.Config.createTag(targetTagGroupData, tagAttr, defaultTagColor, defaultTagTextColor);
          }
          generateTagGroups();
          $(ui.helper).remove();
        }
      });
    });

    $tagGroupsContent.on('contextmenu click', '.tagGroupActions', function() {
      TSCORE.hideAllDropDownMenus();
      TSCORE.selectedTag = $(this).attr('tag');
      TSCORE.selectedTagData = TSCORE.Config.getTagGroupData($(this).attr('key'));
      TSCORE.selectedTagData.parentKey = undefined;
      TSCORE.showContextMenu('#tagGroupMenu', $(this));
      return false;
    });

    $tagGroupsContent.on('contextmenu click', '.tagButton', function() {
      TSCORE.hideAllDropDownMenus();
      TSCORE.selectedTagData = TSCORE.Config.getTagData($(this).attr('tag'), $(this).attr('parentKey'));
      TSCORE.selectedTag = generateTagValue(TSCORE.selectedTagData);
      TSCORE.selectedTagData.parentKey = $(this).attr('parentKey');
      TSCORE.showContextMenu('#tagTreeMenu', $(this));
      return false;
    });

    $tagGroupsContent.append($('<button>', {
      'class': 'btn btn-link',
      'style': 'margin-top: 15px; margin-left: -8px; display: block;  color: #1DD19F;',
      'text': $.i18n.t('ns.common:createTagGroup'),
      'data-i18n': 'ns.common:createTagGroup;[title]ns.common:createTagGroupTooltip'
    }).on('click', TSCORE.showDialogTagGroupCreate));

    $tagGroupsContent.append($('<button>', {
      'class': 'btn btn-link',
      'style': 'margin-top: 0px; display: block; margin-left: -8px; color: #1DD19F;',
      'text': $.i18n.t('ns.common:importTags'),
      'data-i18n': 'ns.common:importTags;[title]ns.common:importTagsTooltip'
    }).on('click', importTagGroups));
  }

  function generateTagValue(tagData) {
    var tagValue = tagData.title;
    var d;
    if (tagData.type === 'smart') {
      switch (tagData.functionality) {
        case 'geoLocation': {
          $('#viewContainers').on('drop dragend', function(event) {
            if (TSCORE.selectedTag === 'geoTag') {
              tagValue = TSCORE.showTagEditDialog();
            }
          });
          break;
        }
        case 'today': {
          tagValue = TSCORE.TagUtils.formatDateTime4Tag(new Date(), false);
          break;
        }
        case 'tomorrow': {
          d = new Date();
          d.setDate(d.getDate() + 1);
          tagValue = TSCORE.TagUtils.formatDateTime4Tag(d, false);
          break;
        }
        case 'yesterday': {
          d = new Date();
          d.setDate(d.getDate() - 1);
          tagValue = TSCORE.TagUtils.formatDateTime4Tag(d, false);
          break;
        }
        case 'currentMonth': {
          var cMonth = '' + (new Date().getMonth() + 1);
          if (cMonth.length === 1) {
            cMonth = '0' + cMonth;
          }
          tagValue = '' + new Date().getFullYear() + cMonth;
          break;
        }
        case 'currentYear': {
          tagValue = '' + new Date().getFullYear();
          break;
        }
        case 'now': {
          tagValue = TSCORE.TagUtils.formatDateTime4Tag(new Date(), true);
          break;
        }
        default: {
          break;
        }
      }
    }
    return tagValue;
  }

  function openTagMenu(tagButton, tag, filePath) {
    TSCORE.selectedFiles.push(filePath);
    TSCORE.selectedTag = tag;
  }

  // Helper function generating tag buttons
  function generateTagButtons(commaSeparatedTags, filePath) {
    //console.log("Creating tags...");
    var tagString = '' + commaSeparatedTags;
    var context = {
      tags: []
    };
    if (tagString.length > 0) {
      var tags = tagString.split(',');
      for (var i = 0; i < tags.length; i++) {
        context.tags.push({
          filepath: filePath,
          tag: tags[i],
          style: generateTagStyle(TSCORE.Config.findTag(tags[i]))
        });
      }
    }
    var metaTags = TSCORE.Meta.getTagsFromMetaFile(filePath);
    if (metaTags.length > 0) {
      for (var i = 0; i < metaTags.length; i++) {
        var tag = metaTags[i];
        if (!tag.style) {
          tag.style = generateTagStyle(TSCORE.Config.findTag(tag.tag));
        }
      }

      context.tags = context.tags.concat(metaTags);
    }
    return tagButtonTmpl(context);
  }

  // Get the color for a tag
  function generateTagStyle(tagObject) {
    var tagStyle = '';
    if (tagObject.color !== undefined) {
      var textColor = tagObject.textcolor;
      if (textColor === undefined) {
        textColor = 'white';
      }
      tagStyle = 'color: ' + textColor + ' !important; background-color: ' + tagObject.color + ' !important;';
    }
    return tagStyle;
  }

  function showDialogTagCreate() {
    $('#newTagTitle').val('');
    $('#formAddTags').validator();
    $('#formAddTags').submit(function(e) {
      e.preventDefault();
      if ($('#createTagButton').prop('disabled') === false) {
        $('#createTagButton').click();
      }
    });
    $('#formAddTags').on('invalid.bs.validator', function() {
      $('#createTagButton').prop('disabled', true);
    });
    $('#formAddTags').on('valid.bs.validator', function() {
      $('#createTagButton').prop('disabled', false);
    });
    $('#dialogTagCreate').on('shown.bs.modal', function() {
      $('#newTagTitle').focus();
    });
    $('#dialogTagCreate').modal({
      backdrop: 'static',
      show: true
    });
    $('#dialogTagCreate').draggable({
      handle: ".modal-header"
    });
  }

  function showImportTagsDialog(tagGroups) {
    require(['text!templates/ImportTagsDialog.html'], function(uiTPL) {

      if ($('#dialogImportTags').length < 1) {
        var uiTemplate = Handlebars.compile(uiTPL);
        $('body').append(uiTemplate({objects: tagGroups}));

        $('#importTagsButton').on('click', function() {

          tagGroups.forEach(function(value) {
            TSCORE.Config.addTagGroup(value);
          });
          TSCORE.Config.saveSettings();
          generateTagGroups();
        });
      }
      $('#dialogImportTags').i18n();
      $('#dialogImportTags').modal({
        backdrop: 'static',
        show: true
      });
      $('#dialogImportTags').draggable({
        handle: ".modal-header"
      });
    });
  }

  function showDialogEditTagGroup() {
    $('#colorChangesToAllTags').prop('checked', false);

    var $editTagGroupBackgroundColorChooser = $('#editTagGroupBackgroundColorChooser');
    var $editTagGroupBackgroundColor = $('#editTagGroupBackgroundColor');
    $editTagGroupBackgroundColorChooser.simplecolorpicker({
      picker: false
    });
    $editTagGroupBackgroundColorChooser.on('change', function() {
      $editTagGroupBackgroundColor.val($editTagGroupBackgroundColorChooser.val());
    });

    if (TSCORE.selectedTagData.color === undefined || TSCORE.selectedTagData.color.length < 1) {
      $editTagGroupBackgroundColor.val(TSCORE.Config.getDefaultTagColor());
    } else {
      $editTagGroupBackgroundColor.val(TSCORE.selectedTagData.color);
    }

    var $editTagGroupForegroundColorChooser = $('#editTagGroupForegroundColorChooser');
    var $editTagGroupForegroundColor = $('#editTagGroupForegroundColor');
    $editTagGroupForegroundColorChooser.simplecolorpicker({
      picker: false
    });
    $editTagGroupForegroundColorChooser.on('change', function() {
      $editTagGroupForegroundColor.val($editTagGroupForegroundColorChooser.val());
    });

    if (TSCORE.selectedTagData.textcolor === undefined || TSCORE.selectedTagData.textcolor.length < 1) {
      $editTagGroupForegroundColor.val(TSCORE.Config.getDefaultTagTextColor());
    } else {
      $editTagGroupForegroundColor.val(TSCORE.selectedTagData.textcolor);
    }

    $('#colorChangesToAllTags').on('change', function() {
      $('#colorChangesToAllTags').prop('checked');
    });

    $('#tagGroupName').val(TSCORE.selectedTagData.title);
    $('#formTagGroupEdit').validator();
    $('#formTagGroupEdit').submit(function(e) {
      e.preventDefault();
      if ($('#editTagGroupButton').prop('disabled') === false) {
        $('#editTagGroupButton').click();
      }
    });
    $('#formTagGroupEdit').on('invalid.bs.validator', function() {
      $('#editTagGroupButton').prop('disabled', true);
    });
    $('#formTagGroupEdit').on('valid.bs.validator', function() {
      $('#editTagGroupButton').prop('disabled', false);
    });
    $('#dialogEditTagGroup').on('shown.bs.modal', function() {
      $('#tagGroupName').focus();
    });
    $('#dialogEditTagGroup').modal({
      backdrop: 'static',
      show: true
    });
    $('#dialogEditTagGroup').draggable({
      handle: ".modal-header"
    });
  }

  function showDialogTagGroupCreate() {
    var $tagGroupBackgroundColorChooser = $('#tagGroupBackgroundColorChooser');
    var $tagGroupBackgroundColor = $('#tagGroupBackgroundColor');
    $tagGroupBackgroundColorChooser.simplecolorpicker({
      picker: false
    });
    $tagGroupBackgroundColorChooser.on('change', function() {
      $tagGroupBackgroundColor.val($tagGroupBackgroundColorChooser.val());
    });

    $tagGroupBackgroundColor.val(TSCORE.Config.getDefaultTagColor());

    var $tagGroupForegroundColorChooser = $('#tagGroupForegroundColorChooser');
    var $tagGroupForegroundColor = $('#tagGroupForegroundColor');
    $tagGroupForegroundColorChooser.simplecolorpicker({
      picker: false
    });
    $tagGroupForegroundColorChooser.on('change', function() {
      $tagGroupForegroundColor.val($tagGroupForegroundColorChooser.val());
    });
    console.log(TSCORE.Config.getDefaultTagTextColor());
    $tagGroupForegroundColor.val(TSCORE.Config.getDefaultTagTextColor());

    $('#newTagGroupName').val('');
    $('#formTagGroupCreate').validator();
    $('#formTagGroupCreate').off();
    $('#formTagGroupCreate').on("submit", function(e) {
      e.preventDefault();
      if ($('#createTagGroupButton').prop('disabled') === false) {
        $('#createTagGroupButton').click();
      }
    });
    $('#formTagGroupCreate').on('invalid.bs.validator', function() {
      $('#createTagGroupButton').prop('disabled', true);
    });
    $('#formTagGroupCreate').on('valid.bs.validator', function() {
      $('#createTagGroupButton').prop('disabled', false);
    });
    $('#dialogTagGroupCreate').on('shown.bs.modal', function() {
      $('#newTagGroupName').focus();
    });
    $('#dialogTagGroupCreate').modal({
      backdrop: 'static',
      show: true
    });
    $('#dialogTagGroupCreate').draggable({
      handle: ".modal-header"
    });
  }

  function showTagEditInTreeDialog() {
    $('#tagInTreeName').val(TSCORE.selectedTagData.title);
    $('#tagInTreeKeyBinding').val(TSCORE.selectedTagData.keyBinding);
    var $tagColorChooser = $('#tagColorChooser');
    var $tagColor = $('#tagColor');
    $tagColorChooser.simplecolorpicker({
      picker: false
    });
    $tagColorChooser.on('change', function() {
      $tagColor.val($tagColorChooser.val());
    });
    if (TSCORE.selectedTagData.color === undefined || TSCORE.selectedTagData.color.length < 1) {
      $tagColor.val(defaultTagColor);
    } else {
      $tagColor.val(TSCORE.selectedTagData.color);
    }
    var $tagTextColorChooser = $('#tagTextColorChooser');
    var $tagTextColor = $('#tagTextColor');
    $tagTextColorChooser.simplecolorpicker({
      picker: false
    });
    $tagTextColorChooser.on('change', function() {
      $tagTextColor.val($tagTextColorChooser.val());
    });
    if (TSCORE.selectedTagData.textcolor === undefined || TSCORE.selectedTagData.textcolor.length < 1) {
      $tagTextColor.val(defaultTagTextColor);
    } else {
      $tagTextColor.val(TSCORE.selectedTagData.textcolor);
    }
    $('#formEditInTreeTag').validator();
    $('#formEditInTreeTag').on('invalid.bs.validator', function() {
      $('#editTagInTreeButton').prop('disabled', true);
    });
    $('#formEditInTreeTag').on('valid.bs.validator', function() {
      $('#editTagInTreeButton').prop('disabled', false);
    });
    $('#dialogEditInTreeTag').on('shown.bs.modal', function() {
      $('#tagInTreeName').focus();
    });
    $('#dialogEditInTreeTag').modal({
      backdrop: 'static',
      show: true
    });
    $('#dialogEditInTreeTag').draggable({
      handle: ".modal-header"
    });
  }

  function showAddTagsDialog() {
    if (!TSCORE.selectedFiles[0]) {
      TSCORE.showAlertDialog("Please select a file first.", "Tagging not possible!");
      return;
    }
    console.log('Adding tags...');
    //function split( val ) {
    //    return val.split( /,\s*/ );
    //}
    //function extractLast( term ) {
    //    return split( term ).pop();
    //}*/
    $('#tags').select2('data', null);
    $('#tags').select2({
      multiple: true,
      tags: TSCORE.Config.getAllTags(),
      tokenSeparators: [
        ',',
        ' '
      ],
      minimumInputLength: 1,
      selectOnBlur: true,
      formatSelectionCssClass: function(tag, container) {
        var style = generateTagStyle(TSCORE.Config.findTag(tag.text));
        if (style) {
          $(container).parent().attr("style", style);
        }
      }
    });
    $('#dialogAddTags').on('shown.bs.modal', function() {
      $('.select2-input').focus();
    });
    $('#dialogAddTags').modal({
      backdrop: 'static',
      show: true
    });
    $('#dialogAddTags').draggable({
      handle: ".modal-header"
    });
  }

  // Public Vars
  exports.calculatedTags = [];
  exports.locationTags = [];

  // Public API definition
  exports.initUI = initUI;
  exports.generateTagGroups = generateTagGroups;
  exports.openTagMenu = openTagMenu;
  exports.generateTagStyle = generateTagStyle;
  exports.generateTagButtons = generateTagButtons;
  exports.showAddTagsDialog = showAddTagsDialog;
  exports.showTagEditInTreeDialog = showTagEditInTreeDialog;
  exports.showDialogTagCreate = showDialogTagCreate;
  exports.showDialogEditTagGroup = showDialogEditTagGroup;
  exports.showDialogTagGroupCreate = showDialogTagGroupCreate;
});
