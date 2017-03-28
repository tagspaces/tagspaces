/* Copyright (c) 2012-2017 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */

/* global define, Handlebars, isCordova  */
define(function(require, exports, module) {
  'use strict';

  console.log('Loading directories.ui.js ...');

  var TSCORE = require('tscore');
  var TSPOSTIO = require("tspostioapi");
  var tsExtManager = require('tsextmanager');

  var homeFolderTitle = 'Home';
  var directoryHistory = [];
  var metaTagGroupsHistory = null;
  var dir4ContextMenu = null;
  var folderPropertiesOpened = false;

  var alternativeDirectoryNavigatorTmpl = Handlebars.compile(
    '{{#each dirHistory}}' +
    '<div class="btn-group">' +
    '  <button class="btn btn-link dropdown-toggle" data-menu="{{@index}}">' +
    '    <div class="altNavFolderTitle">' +
    '      <span style="{{#if @last}} padding-right: 0 !important; color: black; {{/if}} padding-right: 5px; padding-left: 1px;">{{name}}</span>' +
    '      <i {{#if @last}} style="display: none;" {{/if}} class="fa fa-caret-right"></i>' +
    '    </div>' +
    '  </button>' +
    '  <div class="dropdown clearfix dirAltNavMenu" id="dirMenu{{@index}}" data-path="{{path}}">' +
    '    <ul role="menu" class="dropdown-menu">' +
    '      <li class="dropdown-header"><button class="close">&times;</button><span data-i18n="ns.common:actionsForDirectory2"></span>&nbsp;"{{name}}"</li>' +
    '      <li><a class="btn btn-link reloadCurrentDirectory" data-path="{{path}}" style="text-align: left"><i class="fa fa-refresh fa-fw fa-lg"></i><span data-i18n="ns.common:reloadCurrentDirectory"></span></a></li>' +
    '      <li><a class="btn btn-link createSubdirectory" data-path="{{path}}" style="text-align: left"><i class="fa fa-folder-o fa-fw fa-lg"></i><span data-i18n="ns.common:createSubdirectory"></span></a></li>' +
    '      <li><a class="btn btn-link renameDirectory" data-path="{{path}}" style="text-align: left"><i class="fa fa-paragraph fa-fw fa-lg"></i><span data-i18n="ns.common:renameDirectory"></span></a></li>' +
    '      <li class="divider" style="width: 100%"></li>' +
    '      <li class="dropdown-header"><span data-i18n="ns.common:subfodersOfDirectory2"></span>&nbsp;"{{name}}"</li>' +
    '      <div class="dirButtonContainer">' +
    '{{#if children}}' +
    '{{#each children}}' +
    '        <button class="btn dirButton" data-path="{{path}}" title="{{path}}"><i class="fa fa-folder-o"></i>&nbsp;{{name}}</button>' +
    '{{/each}}' +
    '{{else}}' +
    '        <div>&nbsp;&nbsp;&nbsp;<span data-i18n="ns.common:noSubfoldersFound"></span></div>' +
    '{{/if}}' +
    '      </div>' +
    '     </ul>' +
    '   </div>' +
    '</div>' +
    '{{/each}}' +
    '<button class="btn btn-link" data-i18n="[title]ns.common:folderPropertiesTooltip" id="toggleFolderProperitesButton"><i class="fa fa-info fa-lg"></i></button>' +
    ''
  );

  var mainDirectoryNavigatorTmpl = Handlebars.compile(
    '<div>{{#each dirHistory}}' +
    '  <div class="accordion-group disableTextSelection">' +
    '    <div class="accordion-heading btn-group flexLayout" data-path="{{path}}">' +
    '      <button class="btn btn-link btn-lg directoryIcon" data-toggle="collapse" data-target="#dirButtons{{@index}}" data-path="{{path}}" title="{{../toggleDirectory}}">' +
    '        <i class="fa fa-folder fa-fw"></i>' +
    '      </button>' +
    '      <button class="btn btn-link directoryTitle ui-droppable flexMaxWidth" data-path="{{path}}" title="{{path}}">{{name}}</button>' +
    '      <button class="btn btn-link btn-lg directoryActions" data-path="{{path}}" title="{{../directoryOperations}}">' +
    '        <b class="fa fa-ellipsis-v"></b>' +
    '      </button>' +
    '    </div>' +
    '    <div class="accordion-body collapse in" id="dirButtons{{@index}}">' +
    '      <div class="accordion-inner" id="dirButtonsContent{{@index}}" style="padding: 4px; padding-top: 0;">' +
    '        <div class="dirButtonContainer">' +
    '          <button class="btn btn-sm btn-default dirButton parentDirectoryButton" data-path="{{path}}/.." title="Go to parent folder">' +
    '            <i class="fa fa-level-up"></i>' +
    '          </button>' +
    '      {{#if children}}' +
    '        {{#each children}}' +
    '          <button class="btn btn-sm btn-default dirButton ui-droppable" data-path="{{path}}" title="{{path}}">' +
    '            <div><i class="fa fa-folder-o"></i>&nbsp;{{name}}</div>' +
    '          </button>' +
    '        {{/each}}' +
    '      {{else}}' +
    '          <div>&nbsp;&nbsp;&nbsp;{{../../noSubfoldersFound}}</div>' +
    '      {{/if}}' +
    '        </div>' +
    '        <div class="directoryTagsArea" data-path="{{path}}" style="padding: 4px; padding-left: 0; "></div>' +
    '      </div>' +
    '    </div>' +
    '  </div>' +
    '{{/each}}</div>'
  );

  var locationChooserTmpl = Handlebars.compile(
    '<li class="dropdown-header"><button class="close">&times;</button></li>' +
    '<li class="flexLayout">' +
    '  <button style="text-align: left;" class="btn btn-link flexMaxWidth" id="createNewLocation">' +
    '    <i class="fa fa-plus"></i>&nbsp;<span data-i18n="[title]ns.common:connectNewLocationTooltip;ns.common:connectNewLocationTooltip">{{connectLocation}}</span>' +
    '  </button>' +
    '</li>' +
    '<li class="divider"></li>' +
    '<li class="dropdown-header" data-i18n="ns.common:yourLocations">{{yourLocations}}</li>' +
    '{{#each locations}}' +
    '<li class="flexLayout">' +
    '  <button title="{{path}}" path="{{path}}" name="{{name}}" class="btn btn-link openLocation">' +
    '{{#if isDefault}}' +
    '    <i style="color: darkred" class="fa fa-bookmark" data-i18n="[title]ns.dialogs:startupLocation"></i>' +
    '{{else}}' +
    '    <i class="fa fa-bookmark"></i>' +
    '{{/if}}' +
    '  <span class="locationName">{{name}}</span></button>' +
    '  <button type="button" data-i18n="[title]ns.common:editLocation" title="{{editLocationTitle}}" location="{{name}}" path="{{path}}" class="btn btn-link pull-right editLocation">' +
    '    <i class="fa fa-pencil fa-lg"></i>' +
    '  </button>' +
    '</li>' +
    '{{/each}}'
  );

  function openLocation(path) {
    var originalPath = path;
    console.log('Opening location in : ' + path);

    TSCORE.currentLocationObject = TSCORE.Config.getLocation(path);

    // Add current application path to the relative path of the location in portable desktop mode
    if (isElectron && __dirname && path.indexOf(".") === 0) {
      if (path.indexOf("..") === 0) {
        path = pathUtils.normalize(pathUtils.dirname(pathUtils.dirname(__dirname)) + TSCORE.dirSeparator + path);
      } else {
        path = pathUtils.normalize(pathUtils.dirname(pathUtils.dirname(__dirname)) + path.substring(1, path.length));
      }
    }

    if (TSCORE.currentLocationObject !== undefined) {
      document.title = TSCORE.currentLocationObject.name + ' | ' + TSCORE.Config.getAppFullName();
      $('#locationName').removeAttr("data-i18n");
      $('#locationName').text(TSCORE.currentLocationObject.name).attr('title', path);
      // Handle open default perspective for a location
      var defaultPerspective = TSCORE.currentLocationObject.perspective;
      var activatedPerspectives = TSCORE.Config.getActivatedPerspectives();

      // Checking if specified perspective available
      var perspectiveFound;
      activatedPerspectives.forEach(function(perspective) {
        if (perspective.id === defaultPerspective) {
          perspectiveFound = true;
        }
      });

      if (perspectiveFound) {
        TSCORE.PerspectiveManager.changePerspective(defaultPerspective);
      } else if (activatedPerspectives.length > 0) {
        TSCORE.PerspectiveManager.changePerspective(activatedPerspectives[0].id);
      }

      // Saving the last opened location path in the settings
      TSCORE.Config.setLastOpenedLocation(originalPath);

      if ($('#defaultLocation').prop('checked') === true || $('#defaultLocationEdit').prop('checked') === true) {
        // console.log("set default path " + path);
        TSCORE.Config.setDefaultLocation(path);
        $('#defaultLocation').prop('checked', false);
        $('#defaultLocationEdit').prop('checked', false);
      }

      TSCORE.Config.saveSettings();
    }
    // Clear search query
    TSCORE.clearSearchFilter();
    // Clears the directory history
    directoryHistory = [];
    navigateToDirectory(path);
    if (TSCORE.Config.getShowTagAreaOnStartup()) {
      TSCORE.showTagsPanel();
    } else {
      TSCORE.showLocationsPanel();
    }
  }

  function getDirHistoryItem(path) {
    for (var i = 0; i < directoryHistory.length; i++) {
      if (directoryHistory[i].path === path) {
        return directoryHistory[i];
      }
    }
  }

  function loadFolderMetaData(path, element) {
    var historyItem = getDirHistoryItem(path);
    TSCORE.Meta.loadFolderMetaDataPromise(path).then(function(metaData) {
      historyItem.metaData = metaData;
      if (historyItem.metaData.perspectives) {
        TSCORE.PerspectiveManager.changePerspective(historyItem.metaData.perspectives);
      }
      generateFolderTags(metaData.tags, element);
      loadMetaTagGroups(historyItem.metaData);
    }).catch(function(err) {
      console.log("loadFolderMetaData: " + err);
      generateFolderTags(null, element);
    });
  }

  function loadMetaTagGroups(metaData) {
    //Load tagGroups only from location folder
    if (TSCORE.Config.getLastOpenedLocation().indexOf(TSCORE.currentPath) >= 0) {
      if (metaTagGroupsHistory) {
        metaTagGroupsHistory.forEach(function(value) {
          TSCORE.Config.deleteTagGroup(value);
        });
      }
      metaTagGroupsHistory = metaData.tagGroups;
      if (metaTagGroupsHistory) {
        metaData.tagGroups.forEach(function(value) {
          TSCORE.Config.addTagGroup(value);
        });
      }
      TSCORE.generateTagGroups(metaData.tagGroups);
    }
  }

  function generateFolderTags(tags, $directoryTagsArea) {
    if ($directoryTagsArea) {
      $directoryTagsArea.empty();
    }

    var tagString = '';
    if (tags) {
      tags.forEach(function(value, index) {
        if (index === 0) {
          tagString = value.title;
        } else {
          tagString = tagString + ',' + value.title;
        }
      });

      var genTagsBtns = TSCORE.generateTagButtons(tagString);
      if (genTagsBtns) {
        $directoryTagsArea.append(genTagsBtns);
      }
    }

    if (TSCORE.PRO && TSCORE.PRO.Directory) {
      TSCORE.PRO.Directory.setContextMenu($directoryTagsArea);
    }
    $("#locationContent .dropDownIcon").hide();
  }

  function updateSubDirs(dirList) {
    //console.log("Updating subdirs(TSCORE)..."+JSON.stringify(dirList));
    var hasSubFolders = false;
    for (var i = 0; i < directoryHistory.length; i++) {
      if (directoryHistory[i].path === TSCORE.currentPath) {
        directoryHistory[i].children = [];
        for (var j = 0; j < dirList.length; j++) {
          if (!dirList[j].isFile) {
            if (TSCORE.Config.getShowUnixHiddenEntries() || !TSCORE.Config.getShowUnixHiddenEntries() && dirList[j].name.indexOf('.') !== 0) {
              directoryHistory[i].children.push(dirList[j]);
              hasSubFolders = true;
            }
          }
        }
        // Sort the dirList alphabetically
        directoryHistory[i].children.sort(function(a, b) {
          return a.name.localeCompare(b.name);
        });
      }
    }
    generateDirPath();
    generateAlternativeDirPath();
    handleDirCollapsion();
  }

  function generateAlternativeDirPath() {
    console.log('Generating Alternative Directory Path...');

    var $alternativeNavigator = $('#alternativeNavigator');
    $alternativeNavigator.children().remove();

    $alternativeNavigator.html(alternativeDirectoryNavigatorTmpl({
      'dirHistory': directoryHistory
    }));

    $alternativeNavigator.find('.reloadCurrentDirectory').on('click', function() {
      navigateToDirectory($(this).attr('data-path'));
    });

    $alternativeNavigator.find('.createSubdirectory').on('click', function() {
      showCreateDirectoryDialog($(this).attr('data-path'));
    });

    $alternativeNavigator.find('.renameDirectory').on('click', function() {
      showRenameDirectoryDialog($(this).attr('data-path'));
    });

    $alternativeNavigator.find('.dropdown-toggle').on('contextmenu click', function() {
      TSCORE.hideAllDropDownMenus();
      $('#dirMenu' + $(this).attr('data-menu')).css("display", "block");
      return false;
    });

    $alternativeNavigator.find('.close').on("click", function() {
      TSCORE.hideAllDropDownMenus();
    });

    $alternativeNavigator.find('.dirButton').on("click", function() {
      navigateToDirectory($(this).attr('data-path'));
    });

    if ($alternativeNavigator.i18n) {
      $alternativeNavigator.i18n();
    }

    $('#toggleFolderProperitesButton').on('click', toggleFolderProperties);

    if (folderPropertiesOpened) {
      $('#toggleFolderProperitesButton').addClass('buttonToggled');
    } else {
      $('#toggleFolderProperitesButton').removeClass('buttonToggled');
    }
  }

  function generateDirPath() {
    console.log('Generating Directory Path...');
    var $locationContent = $('#locationContent');
    $locationContent.children().remove();
    $locationContent.html(mainDirectoryNavigatorTmpl({
      'dirHistory': directoryHistory,
      'noSubfoldersFound': $.i18n.t('ns.common:noSubfoldersFound'),
      'toggleDirectory': $.i18n.t('ns.common:toggleDirectory'),
      'directoryOperations': $.i18n.t('ns.common:directoryOperations')
    }));
    $locationContent.find('.directoryTitle').each(function() {
      loadFolderMetaData($(this).data('path'), $(this).parent().parent().find('.directoryTagsArea'));
      $(this).click(function() {
        navigateToDirectory($(this).data('path'));
      }).droppable({
        greedy: 'true',
        accept: '.fileTitleButton,.fileTile,.fileTileSelector,.fileInfoArea',
        hoverClass: 'dropOnFolder',
        drop: function(event, ui) {
          ui.draggable.detach();
          var filePath = ui.draggable.attr('filepath');
          var fileName = TSCORE.TagUtils.extractFileName(filePath);
          var targetDir = $(this).data('path');
          console.log('Moving file: ' + filePath + ' to ' + targetDir);
          var newFilePath = targetDir + TSCORE.dirSeparator + fileName;
          TSCORE.IO.renameFilePromise(filePath, newFilePath).then(function(success) {
            TSCORE.hideWaitingDialog();
            TSPOSTIO.renameFile(filePath, newFilePath);
          }, function(err) {
            TSCORE.hideWaitingDialog();
            TSCORE.showAlertDialog(err);
          });
          $(ui.helper).remove();
        }
      });
    });
    $locationContent.find('.dirButton').each(function() {
      $(this).click(function() {
        navigateToDirectory($(this).data('path'));
      }).droppable({
        greedy: 'true',
        accept: '.fileTitleButton,.fileTile,.fileTileSelector,.fileInfoArea',
        hoverClass: 'dropOnFolder',
        drop: function(event, ui) {
          ui.draggable.detach();
          // Fixing issue with dropping on stacked/overlapped directories
          if ($(this).parent().parent().parent().hasClass('in')) {
            var filePath = ui.draggable.attr('filepath');
            var fileName = TSCORE.TagUtils.extractFileName(filePath);
            var targetDir = $(this).data('path');
            console.log('Moving file: ' + filePath + ' to ' + targetDir);
            var newFilePath = targetDir + TSCORE.dirSeparator + fileName;
            TSCORE.IO.renameFilePromise(filePath, newFilePath).then(function(success) {
              TSCORE.hideWaitingDialog();
              TSPOSTIO.renameFile(filePath, newFilePath);
            }, function(err) {
              TSCORE.hideWaitingDialog();
              TSCORE.showAlertDialog(err);
            });
            $(ui.helper).remove();
          }
        }
      });
    });
  }

  function handleDirCollapsion() {
    $('#locationContent').find('.accordion-heading').each(function() {
      var key = $(this).data('path');
      console.log('Entered Header for: ' + key);
      if (getDirectoryCollapsed(key)) {
        $(this).find('i').removeClass('fa-folder-open');
        $(this).find('i').addClass('fa-folder');
        $(this).next().removeClass('in');
        $(this).next().addClass('out');
      } else {
        $(this).find('i').removeClass('fa-folder');
        $(this).find('i').addClass('fa-folder-open');
        $(this).next().removeClass('out');
        $(this).next().addClass('in');
      }
    });
  }

  function getDirectoryCollapsed(directoryPath) {
    for (var i = 0; i < directoryHistory.length; i++) {
      if (directoryHistory[i].path === directoryPath) {
        return directoryHistory[i].collapsed;
      }
    }
  }

  function setDirectoryCollapse(directoryPath, collapsed) {
    for (var i = 0; i < directoryHistory.length; i++) {
      if (directoryHistory[i].path === directoryPath) {
        directoryHistory[i].collapsed = collapsed;
      }
    }
  }

  function navigateToDirectory(directoryPath) {
    console.log('Navigating to directory: ' + directoryPath);
    var indexOfDots = directoryPath.indexOf("/..");
    if (indexOfDots === (directoryPath.length - 3)) {
      directoryPath = TSCORE.TagUtils.extractParentDirectoryPath(directoryPath.substring(0, indexOfDots));
    }

    // Clearing search results on directory change
    TSCORE.clearSearchFilter();
    // Cleaning the directory path from \\ \ and / 
    if (directoryPath.lastIndexOf('/') + 1 === directoryPath.length || directoryPath.lastIndexOf('\\') + 1 === directoryPath.length) {
      directoryPath = directoryPath.substring(0, directoryPath.length - 1);
    }
    if (directoryPath.lastIndexOf('\\\\') + 1 === directoryPath.length) {
      directoryPath = directoryPath.substring(0, directoryPath.length - 2);
    }
    var directoryFoundOn = -1;
    for (var i = 0; i < directoryHistory.length; i++) {
      if (directoryHistory[i].path === directoryPath) {
        directoryHistory[i].collapsed = false;
        directoryFoundOn = i;
      } else {
        directoryHistory[i].collapsed = true;
      }
    }
    // Removes the history only if it is a completely new path
    if (directoryFoundOn >= 0) {
      var diff1 = directoryHistory.length - (directoryFoundOn + 1);
      if (diff1 > 0) {
        directoryHistory.splice(directoryFoundOn + 1, diff1);
      }
    }
    // If directory path not in history then add it to the history
    if (directoryFoundOn < 0) {
      // var parentLocation = directoryPath.substring(0, directoryPath.lastIndexOf(TSCORE.dirSeparator));
      var parentLocation = TSCORE.TagUtils.extractParentDirectoryPath(directoryPath);
      var parentFound = -1;
      for (var j = 0; j < directoryHistory.length; j++) {
        if (directoryHistory[j].path === parentLocation) {
          parentFound = j;
        }
      }
      if (parentFound >= 0) {
        var diff2 = directoryHistory.length - (parentFound + 1);
        if (diff2 > 0) {
          directoryHistory.splice(parentFound + 1, diff2);
        }
      }
      var locationTitle = directoryPath.substring(directoryPath.lastIndexOf(TSCORE.dirSeparator) + 1, directoryPath.length);
      //ios workarround for empty directory title
      if (isCordovaiOS && locationTitle.length === 0) {
        locationTitle = homeFolderTitle;
      }
      directoryHistory.push({
        'name': locationTitle,
        'path': directoryPath,
        'collapsed': false
      });
    }
    console.log('Dir History: ' + JSON.stringify(directoryHistory));
    TSCORE.currentPath = directoryPath;

    initFolderProperties();

    TSCORE.Meta.getDirectoryMetaInformation().then(function(dirList) {
      TSCORE.metaFileList = dirList;
      listDirectory(directoryPath);
    }).catch(function(error) {
      console.log("Error getting meta information " + error);
      TSCORE.metaFileList = [];
      listDirectory(directoryPath);
    });
  }

  function listDirectory(dirPath) {
    TSCORE.showLoadingAnimation();
    //TSCORE.PerspectiveManager.removeAllFiles();
    TSCORE.IO.listDirectoryPromise(dirPath).then(function(entries) {
      TSPOSTIO.listDirectory(entries);
      TSCORE.hideLoadingAnimation();
      console.log("Listing: " + dirPath + " done!");

      // TODO enable after adding switch in the settings, disabling recursion does not work on windows
      // Disable watching on file operations with many fiels (copy, delete, rename, move)
      if (TSCORE.IO.watchDirectory && TSCORE.Config.getWatchCurrentDirectory()) {
        TSCORE.IO.watchDirectory(dirPath, function() {
          listDirectory(TSCORE.currentPath);
        });
      }
    }).catch(function(err) {
      TSPOSTIO.errorOpeningPath(dirPath);
      console.log("Error listing directory " + dirPath + " - " + err);
    });

    if (TSCORE.PRO && TSCORE.Config.getEnableMetaData()) {
      TSCORE.Meta.createMetaFolderPromise(dirPath);
    }
  }

  function initUI() {
    // Context Menus
    $('body').on('contextmenu click', '.directoryActions', function() {
      TSCORE.hideAllDropDownMenus();
      dir4ContextMenu = $(this).data('path');
      TSCORE.showContextMenu('#directoryMenu', $(this));
      return false;
    });

    $('#directoryMenuReloadDirectory').on('click', function() {
      navigateToDirectory(dir4ContextMenu);
    });

    $('#directoryMenuCreateDirectory').on('click', function() {
      showCreateDirectoryDialog(dir4ContextMenu);
    });

    $('#directoryMenuRenameDirectory').on('click', function() {
      showRenameDirectoryDialog(dir4ContextMenu);
    });

    $('#directoryMenuDeleteDirectory').on('click', function() {
      var dlgConfirmMsgId = 'ns.dialogs:deleteDirectoryContentConfirm';
      if (TSCORE.Config.getUseTrashCan()) {
        dlgConfirmMsgId = 'ns.pro:trashDirectoryContentConfirm';
      }
      TSCORE.showConfirmDialog($.i18n.t('ns.dialogs:deleteDirectoryTitleConfirm'), $.i18n.t(dlgConfirmMsgId, {
        dirPath: dir4ContextMenu
      }), function() {
        TSCORE.IO.deleteDirectoryPromise(dir4ContextMenu).then(function() {
            TSCORE.showSuccessDialog("Directory deleted successfully.");
            TSCORE.navigateToDirectory(TSCORE.TagUtils.extractParentDirectoryPath(dir4ContextMenu));
            TSCORE.hideLoadingAnimation();
          },
          function(error) {
            TSCORE.hideLoadingAnimation();
            console.error("Deleting directory " + dir4ContextMenu + " failed " + error);
            TSCORE.showAlertDialog($.i18n.t('ns.dialogs:errorDeletingDirectoryAlert'));
            TSCORE.hideLoadingAnimation();
          }
        );
      });
    });

    $('#directoryMenuOpenDirectory').on('click', function() {
      TSCORE.IO.openDirectory(dir4ContextMenu);
    });

    $('#locationSwitch').on('click', function() {
      TSCORE.UI.stopGettingStartedTour();
    });

    $('#editFolderDescriptionButton').on('click', editFolderDescription);

    $('#folderDescriptionPropertyRendered').on('click', editFolderDescription);

    $('#cancelEditFolderDescriptionButton').on('click', cancelEditFolderDescription);

    $('#saveFolderDescriptionButton').on('click', saveFolderDescription);

  }

  function saveFolderTags(event) {
    var newTags = $(this).val();
    console.log("Tags: " + newTags);
    TSCORE.Meta.loadFolderMetaDataPromise(TSCORE.currentPath).then(function(metaData) {
      newTags = newTags.split(",");
      metaData.tags = TSCORE.PRO.Directory.generateTags(newTags);
      TSCORE.PRO.Directory.saveMetaData(metaData);
    }).catch(function(err) {
      console.warn("Error getting folder metadata, saving folder tags failed.");
    });
  }

  function initFolderProperties() {
    $('#folderPathProperty').val(TSCORE.currentPath);

    $('#folderTagsProperty').off();
    $("#folderTagsProperty").val("");
    $('#folderTagsProperty').select2('data', null);

    cancelEditFolderDescription();
    $('#folderDescriptionPropertyRendered').empty();
    $('#folderDescriptionPropertyRendered').css("height", "0");
    $('#folderDescriptionPropertyRendered').css("padding", "0");
    $('#folderDescriptionProperty').val("");
    TSCORE.Meta.loadFolderMetaDataPromise(TSCORE.currentPath).then(function(metaData) {
      var tags = '';
      if (metaData.tags && metaData.tags.length > 0) {
        metaData.tags.forEach(function(tag) {
          tags = tags + "," + tag.title;
        });
        tags = tags.substring(1, tags.length);
      }

      $("#folderTagsProperty").val(tags);
      $('#folderTagsProperty').select2({
        multiple: true,
        tags: TSCORE.Config.getAllTags(),
        tokenSeparators: [',', ' '],
        minimumInputLength: 1,
        selectOnBlur: true,
        formatSelectionCssClass: function(tag, container) {
          var style = TSCORE.generateTagStyle(TSCORE.Config.findTag(tag.text));
          if (style) {
            $(container).parent().attr("style", style);
          }
        }
      });

      if (TSCORE.PRO && TSCORE.Config.getEnableMetaData()) { // TSCORE.Config.getWriteMetaToSidecarFile()
        $('#folderTagsProperty').on('change', saveFolderTags);
      } else {
        $('#folderTagsProperty').attr('disabled', 'disabled');
        // $('.select2-search-choice').css('padding-left', '4px !important');
      }

      if (metaData.description && metaData.description.length) {
        $('#folderDescriptionPropertyRendered').css("height", "200px");
        $('#folderDescriptionPropertyRendered').css("padding", "4px");
        TSCORE.Utils.setMarkDownContent($('#folderDescriptionPropertyRendered'), metaData.description);
        $('#folderDescriptionProperty').val(metaData.description);
      }
    }).catch(function(err) {
      console.warn("Error getting folder metadata.");
    });
  }

  // TODO handle the case: changing to next file/close while in edit mode
  function editFolderDescription() {
    if (TSCORE.PRO) {
      if (TSCORE.Config.getEnableMetaData()) {
        $('#folderDescriptionProperty').show();
        $('#folderDescriptionProperty').css("height", "200px");
        $('#folderDescriptionProperty').focus();
        $('#folderDescriptionPropertyRendered').hide();
        $('#editFolderDescriptionButton').hide();
        $('#cancelEditFolderDescriptionButton').show();
        $('#saveFolderDescriptionButton').show();
      } else {
        TSCORE.UI.showAlertDialog("In order to add or edit a description, you have to enable the use of hidden folders in the settings.");
      }
    } else {
      TSCORE.UI.showAlertDialog("Editing the folder description is possible with the TagSpaces PRO");
    }
  }

  function cancelEditFolderDescription() {
    $('#folderDescriptionProperty').hide();
    $('#folderDescriptionPropertyRendered').show();
    $('#editFolderDescriptionButton').show();
    $('#cancelEditFolderDescriptionButton').hide();
    $('#saveFolderDescriptionButton').hide();
  }

  function saveFolderDescription() {
    TSCORE.Meta.loadFolderMetaDataPromise(TSCORE.currentPath).then(function(metaData) {
      var folderDescription = $('#folderDescriptionProperty').val();
      metaData.description = folderDescription;
      TSCORE.PRO.Directory.saveMetaData(metaData);
      cancelEditFolderDescription();
      TSCORE.Utils.setMarkDownContent($('#folderDescriptionPropertyRendered'), folderDescription);
      $('#folderDescriptionPropertyRendered').css("height", "200px");
    }).catch(function(err) {
      console.warn("Error getting folder metadata.");
    });
  }

  function toggleFolderProperties() {
    if (folderPropertiesOpened) {
      $('#folderPropertiesArea').hide();
      $('#toggleFolderProperitesButton').removeClass('buttonToggled');
    } else {
      $('#folderPropertiesArea').show();
      $('#toggleFolderProperitesButton').addClass('buttonToggled');
    }
    folderPropertiesOpened = !folderPropertiesOpened;
  }

  function createLocation() {
    var locationPath = $('#folderLocation').val();
    TSCORE.Config.createLocation($('#connectionName').val(), locationPath, $('#locationPerspective').val());
    // Enable the UI behavior of a not empty location list
    $('#createNewLocation').attr('title', $.i18n.t('ns.common:connectNewLocationTooltip'));
    $('#locationName').prop('disabled', false);
    $('#selectLocation').prop('disabled', false);
    openLocation(locationPath);
    initLocations();
  }

  function editLocation() {
    var $connectionName2 = $('#connectionName2');
    var $folderLocation2 = $('#folderLocation2');
    TSCORE.Config.editLocation($connectionName2.attr('oldName'), $connectionName2.val(), $folderLocation2.val(), $('#locationPerspective2').val());
    if ($('#defaultLocationEdit').prop('checked') === false) {
      TSCORE.Config.setDefaultLocation(TSCORE.Config.Settings.tagspacesList[0].path);
    }
    openLocation($folderLocation2.val());
    initLocations();
  }

  function selectLocalDirectory() {
    TSCORE.IO.selectDirectory();
  }

  function showLocationEditDialog(name, path) {
    require(['text!templates/LocationEditDialog.html'], function(uiTPL) {
      var $dialogLocationEdit = $('#dialogLocationEdit');

      // Check if dialog already created
      if ($dialogLocationEdit.length < 1) {
        var uiTemplate = Handlebars.compile(uiTPL);
        $('body').append(uiTemplate());

        $('#formLocationEdit').submit(function(e) {
          e.preventDefault();
        });

        if (isWeb) {
          $('#selectLocalDirectory2').attr('style', 'visibility: hidden');
        } else {
          $('#selectLocalDirectory2').on('click', function(e) {
            e.preventDefault();
            selectLocalDirectory();
          });
        }

        $('#saveLocationButton').on('click', function() {
          $('#formLocationEdit').validator('validate');
          if ($(this).hasClass('disabled')) {
            return false;
          } else {
            editLocation();
          }
        });

        $('#deleteLocationButton').on('click', function() {
          showDeleteFolderConnectionDialog();
        });

        $('#formLocationEdit').validator();
        $('#formLocationEdit').on('invalid.bs.validator', function() {
          $('#saveLocationButton').prop('disabled', true);
        });
        $('#formLocationEdit').on('valid.bs.validator', function() {
          $('#saveLocationButton').prop('disabled', false);
        });

        $('#dialogLocationEdit').on('shown.bs.modal', function() {
          $('#formLocationEdit').validator('destroy');
          $('#formLocationEdit').validator();
        });

        $('#dialogLocationEdit').draggable({
          handle: ".modal-header"
        });

        $('#connectionName2').change(function() {
          $('#formLocationEdit').validator('validate');
        });

        $('#folderLocation2').change(function() {
          $('#formLocationEdit').validator('validate');
        });

        if (isCordova) {
          $('#folderLocation2').attr('placeholder', 'e.g.: DCIM/Camera');
        } else if (isWeb) {
          $('#folderLocation2').attr('placeholder', 'e.g.: /owncloud/remote.php/webdav/');
        }
      }

      var $connectionName2 = $('#connectionName2');
      var $folderLocation2 = $('#folderLocation2');
      var $locationPerspective2 = $('#locationPerspective2');
      var selectedPerspectiveId = TSCORE.Config.getLocation(path).perspective;

      $locationPerspective2.children().remove();
      TSCORE.Config.getActivatedPerspectives().forEach(function(value) {
        var name = value.name ? value.name : value.id;
        if (selectedPerspectiveId === value.id) {
          $locationPerspective2.append($('<option>').attr('selected', 'selected').text(name).val(value.id));
        } else {
          $locationPerspective2.append($('<option>').text(name).val(value.id));
        }
      });

      $connectionName2.val(name);
      $connectionName2.attr('oldName', name);
      $folderLocation2.val(path);
      $('#dialogLocationEdit').i18n();

      var isDefault = isDefaultLocation(path);
      $('#defaultLocationEdit').prop('checked', isDefault);

      $('#dialogLocationEdit').modal({
        backdrop: 'static',
        show: true
      });
    });
  }

  function showLocationCreateDialog() {
    require(['text!templates/LocationCreateDialog.html'], function(uiTPL) {
      var $dialogCreateFolderConnection = $('#dialogCreateFolderConnection');

      // Check if dialog already created
      if ($dialogCreateFolderConnection.length < 1) {
        var uiTemplate = Handlebars.compile(uiTPL);
        $('body').append(uiTemplate());

        $('#formLocationCreate').submit(function(e) {
          e.preventDefault();
        });

        if (isWeb) {
          $('#selectLocalDirectory').attr('style', 'visibility: hidden');
        } else {
          $('#selectLocalDirectory').on('click', function(e) {
            e.preventDefault();
            selectLocalDirectory();
          });
        }

        $('#createFolderConnectionButton').on('click', function() {
          $('#formLocationCreate').validator('validate');
          if ($(this).hasClass('disabled')) {
            return false;
          } else {
            createLocation();
          }
        });

        $('#formLocationCreate').on('invalid.bs.validator', function() {
          $('#createFolderConnectionButton').prop('disabled', true);
        });
        $('#formLocationCreate').on('valid.bs.validator', function() {
          $('#createFolderConnectionButton').prop('disabled', false);
        });

        $('#dialogCreateFolderConnection').on('shown.bs.modal', function() {
          $('#formLocationCreate').validator('destroy');
          $('#formLocationCreate').validator();
        });

        $('#dialogCreateFolderConnection').draggable({
          handle: ".modal-header"
        });

        $('#folderLocation').change(function() {
          $('#formLocationCreate').validator('validate');
        });

        $('#connectionName').change(function() {
          $('#formLocationCreate').validator('validate');
        });

        $('#dialogCreateFolderConnection').i18n();

        if (isCordova) {
          $('#folderLocation').attr('placeholder', 'e.g., DCIM/Camera for Photos on Android ');
        } else if (isChrome) {
          $('#folderLocation').attr('placeholder', 'e.g., /home/chronos/user/Downloads/ for Chrome OS Downloads');
        } else if (isWeb) {
          $('#folderLocation').attr('placeholder', 'e.g., /owncloud/remote.php/webdav/');
        }
      }

      $('#locationPerspective').empty();
      TSCORE.Config.getActivatedPerspectives().forEach(function(value) {
        var name = value.name ? value.name : value.id;
        $('#locationPerspective').append($('<option>').text(name).val(value.id));
      });

      $('#connectionName').val('');
      $('#folderLocation').val('');

      var enableDefaultlocation = (TSCORE.Config.getDefaultLocation() === "");
      $('#defaultLocation').prop('checked', enableDefaultlocation);
      $('#defaultLocation').prop('disabled', enableDefaultlocation);

      $('#dialogCreateFolderConnection').modal({
        backdrop: 'static',
        show: true
      });
    });
  }

  function createDirectory() {
    var dirPath = $('#createNewDirectoryButton').attr('path') + TSCORE.dirSeparator + $('#newDirectoryName').val();
    TSCORE.IO.createDirectoryPromise(dirPath).then(function() {
      TSCORE.showSuccessDialog("Directory created successfully.");
      TSCORE.navigateToDirectory(dirPath);
      TSCORE.hideWaitingDialog();
      TSCORE.hideLoadingAnimation();
    }, function(error) {
      TSCORE.hideWaitingDialog();
      TSCORE.hideLoadingAnimation();
      console.error("Creating directory: " + dirPath + " failed with: " + error);
      TSCORE.showAlertDialog("Creating " + dirPath + " failed!");
    });
  }

  function showCreateDirectoryDialog(dirPath) {
    require(['text!templates/DirectoryCreateDialog.html'], function(uiTPL) {
      if ($('#dialogDirectoryCreate').length < 1) {
        var uiTemplate = Handlebars.compile(uiTPL);
        $('body').append(uiTemplate());
        //$('#createNewDirectoryButton').off();
        $('#createNewDirectoryButton').on('click', createDirectory);

        $('#dialogDirectoryCreate').i18n();
        $('#formDirectoryCreate').validator();
        $('#formDirectoryCreate').submit(function(e) {
          e.preventDefault();
          if ($('#createNewDirectoryButton').prop('disabled') === false) {
            $('#createNewDirectoryButton').click();
          }
        });
        $('#formDirectoryCreate').on('invalid.bs.validator', function() {
          $('#createNewDirectoryButton').prop('disabled', true);
        });
        $('#formDirectoryCreate').on('valid.bs.validator', function() {
          $('#createNewDirectoryButton').prop('disabled', false);
        });
        $('#dialogDirectoryCreate').on('shown.bs.modal', function() {
          $('#newDirectoryName').focus();
        });
        $('#dialogDirectoryCreate').draggable({
          handle: ".modal-header"
        });
      }

      $('#createNewDirectoryButton').attr('path', dirPath);
      $('#newDirectoryName').val('');
      $('#dialogDirectoryCreate').modal({
        backdrop: 'static',
        show: true
      });
    });
  }

  function showRenameDirectoryDialog(dirPath) {
    require(['text!templates/DirectoryRenameDialog.html'], function(uiTPL) {
      if ($('#dialogDirectoryRename').length < 1) {
        var uiTemplate = Handlebars.compile(uiTPL);
        $('body').append(uiTemplate());
        $('#renameDirectoryButton').on('click', function() {
          var dirPath = $('#renameDirectoryButton').attr('path');
          var newDirPath = $('#directoryNewName').val();
          TSCORE.IO.renameDirectoryPromise(dirPath, newDirPath).then(function(newDirName) {
            TSCORE.showSuccessDialog("Directory renamed successfully.");
            TSCORE.navigateToDirectory(newDirName);
            TSCORE.hideLoadingAnimation();
          }, function(err) {
            TSCORE.hideWaitingDialog();
            TSCORE.showAlertDialog(err);
          });
        });
        $('#formDirectoryRename').submit(function(e) {
          e.preventDefault();
          if ($('#renameDirectoryButton').prop('disabled') === false) {
            $('#renameDirectoryButton').click();
          }
        });
        $('#formDirectoryRename').on('invalid.bs.validator', function() {
          $('#renameDirectoryButton').prop('disabled', true);
        });
        $('#formDirectoryRename').on('valid.bs.validator', function() {
          $('#renameDirectoryButton').prop('disabled', false);
        });
        $('#dialogDirectoryRename').i18n();
        $('#dialogDirectoryRename').on('shown.bs.modal', function() {
          $('#directoryNewName').focus();
          $('#formDirectoryRename').validator('destroy');
          $('#formDirectoryRename').validator();
        });
        $('#dialogDirectoryRename').draggable({
          handle: ".modal-header"
        });
      }
      $('#renameDirectoryButton').attr('path', dirPath);
      var dirName = TSCORE.TagUtils.extractDirectoryName(dirPath);
      $('#directoryNewName').val(dirName);
      $('#dialogDirectoryRename').modal({
        backdrop: 'static',
        show: true
      });
    });
  }

  function isDefaultLocation(path) {

    return (TSCORE.Config.getDefaultLocation() === path);
  }

  function deleteLocation(name) {
    console.log('Deleting folder connection..');
    TSCORE.Config.deleteLocation(name);
    //Opens the first location in the settings after deleting a location  
    if (TSCORE.Config.Settings.tagspacesList.length > 0) {
      openLocation(TSCORE.Config.Settings.tagspacesList[0].path);
      TSCORE.Config.setDefaultLocation(TSCORE.Config.Settings.tagspacesList[0].path);
      TSCORE.Config.saveSettings();
    } else {
      closeCurrentLocation();
      TSCORE.Config.setLastOpenedLocation("");
      TSCORE.Config.setDefaultLocation("");
      TSCORE.Config.saveSettings();
    }
    initLocations();
  }

  function closeCurrentLocation() {
    console.log('Closing location..');
    $('#locationName').text($.i18n.t('ns.common:chooseLocation')).attr('title', '');
    $('#locationContent').children().remove();
    // Clear the footer
    $('#statusBar').children().remove();
    $('#statusBar').text("");
    $('#alternativeNavigator').children().remove();
    TSCORE.disableTopToolbar();
    TSCORE.PerspectiveManager.hideAllPerspectives();
  }

  function showDeleteFolderConnectionDialog() {
    TSCORE.showConfirmDialog($.i18n.t('ns.dialogs:deleteLocationTitleAlert'), $.i18n.t('ns.dialogs:deleteLocationContentAlert', {
      locationName: $('#connectionName2').attr('oldName')
    }), function() {
      deleteLocation($('#connectionName2').attr('oldName'));
      $('#dialogLocationEdit').modal('hide');
    });
  }

  function initLocations() {
    console.log('Creating location menu...');
    var $locationsList = $('#locationsList');
    $locationsList.children().remove();

    TSCORE.Config.Settings.tagspacesList.forEach(function(element) {
      if (isDefaultLocation(element.path)) {
        element.isDefault = true;
      } else {
        element.isDefault = false;
      }
    });
    $locationsList.html(locationChooserTmpl({
      'locations': TSCORE.Config.Settings.tagspacesList,
      'yourLocations': $.i18n.t('ns.common:yourLocations'),
      'connectLocation': $.i18n.t('ns.common:connectNewLocationTooltip'),
      'editLocationTitle': $.i18n.t('ns.common:editLocation')
    }));
    $locationsList.find('.openLocation').each(function() {
      $(this).on('click', function() {
        openLocation($(this).attr('path'));
      });
    });
    $locationsList.find('.editLocation').each(function() {
      $(this).on('click', function() {
        console.log('Edit location clicked');
        showLocationEditDialog($(this).attr('location'), $(this).attr('path'));
        return false;
      });
    });
    $locationsList.find('#createNewLocation').on('click', function() {
      showLocationCreateDialog();
    });
  }

  // Public API definition
  exports.openLocation = openLocation;
  exports.closeCurrentLocation = closeCurrentLocation;
  exports.updateSubDirs = updateSubDirs;
  exports.initUI = initUI;
  exports.initLocations = initLocations;
  exports.showCreateDirectoryDialog = showCreateDirectoryDialog;
  exports.navigateToDirectory = navigateToDirectory;
  exports.generateFolderTags = generateFolderTags;
  exports.getDirHistoryItem = getDirHistoryItem;
});
