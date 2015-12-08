/* Copyright (c) 2012-2015 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */
/*global isNode, isWin, isFirefox, Mousetrap, gui */

/**
 * Description
 * @class TSCORE
 */
define(function(require, exports, module) {
  'use strict';
  console.log('Loading core.api.js ...');
  var tsSettings = require('tssetting');
  var tsIOApi = require('tsioapi');
  var tsPersManager = require('tspersmanager');
  var tsTagUtils = require('tstagutils');
  var tsFileOpener = require('tsfileopener');
  var tsTagsUI = require('tstagsui');
  var tsDirectoriesUI = require('tsdirectoriesui');
  var tsCoreUI = require('tscoreui');
  var tsSearch = require('tssearch');
  var tsPro = require('tspro');
  var tsUtils = require('tsutils');
  var tsMeta = require('tsmeta');
  var tsExt = require('tsextapi');
  var tsExtManager = require('tsextmanager');
  var currentPath;
  var currentLocationObject;
  var currentPerspectiveID;
  // Current selected files
  var selectedFiles = [];
  // Current directory list of files
  var fileList = [];
  // List of the sub directories of the current directory
  var subDirsList = [];
  // List of meta files
  var metaFileList = [];
  // Last clicked button for removing a tag
  var selectedTag = '';
  var selectedTagData = '';
  var startTime;
  var subfoldersDirBrowser;
  var directoryBrowser;

  /**
   * Initalizes the application
   * @memberof TSCORE
   * @method initApp
   */
  function initApp() {
    console.log('Init application');
    tsSettings.loadSettingsLocalStorage();
    checkLocalStorageEnabled();
    // In firefox, by empty local storage trying to load the settings from mozilla preferences
    if (tsSettings.Settings === undefined && isFirefox) {
      window.setTimeout(tsIOApi.loadSettings, 1000);
      // executes initUI and updateSettingMozillaPreferences by success
      console.log('Loading setting with from mozilla pref executed with delay...');
    }
    // If still nothing found, loading the default setting from the application's javascript
    // This is usually the case by a new installation
    if (tsSettings.Settings === undefined) {
      tsSettings.Settings = tsSettings.DefaultSettings;
    }
    tsSettings.upgradeSettings();
    // Init UI components
    tsCoreUI.initUI();
    tsTagsUI.initUI();
    tsTagsUI.generateTagGroups();
    tsDirectoriesUI.initUI();
    tsDirectoriesUI.initLocations();
    tsFileOpener.initUI();
    tsPersManager.initPerspectives().then(function(result) {
      console.log("initPerspectives: " + result);
    }).catch(function(err) {
      alert("initPerspectives: " + err);
    });

    hideLoadingAnimation();

    $(document).ready(function() {
      reLayout();

      var language = tsSettings.getInterfaceLangauge();
      // "de-DE"
      var langURLParam = getParameterByName('locale');
      if (langURLParam.length > 1) {
        language = langURLParam;
      }
      switchInterfaceLanguage(language);
      initKeyBindings();
      tsIOApi.checkAccessFileURLAllowed ? tsIOApi.checkAccessFileURLAllowed() : true;
      // Show welcome dialog of first start
      if (tsSettings.isFirstRun()) {
        tsCoreUI.showWelcomeDialog();
      }
      // Show welcome dialog by no locations
      if (tsSettings.Settings.tagspacesList.length < 1) {
        tsCoreUI.startGettingStartedTour();
      }
      if (isNode || isChrome) {
        // Handle command line argument in node-webkit
        tsIOApi.handleStartParameters(); // Handle minimizing to the tray in node-webkit
        //tsIOApi.handleTray();
      }
      console.log('Docoument ready finished. Layout initialized');
      checkForNewVersion();
    });
  }

  function switchInterfaceLanguage(language) {
    $.i18n.init({
      ns: {
        namespaces: [
          'ns.common',
          'ns.dialogs',
          'ns.perspectiveList',
          'ns.pro',
        ]
      },
      lng: language,
      debug: true,
      fallbackLng: 'en_US'
    }, function() {
      $('[data-i18n]').i18n();
      if (isNode) {
        tsIOApi.initMainMenu();
      }
    });
    exports.currentLanguage = language;
  }

  function initKeyBindings() {
    if (isNode) {
      var win = gui.Window.get();
      Mousetrap.bind(tsSettings.getOpenDevToolsScreenKeyBinding(), function() {
        win.showDevTools();
      });
      Mousetrap.bind(tsSettings.getReloadApplicationKeyBinding(), function() {
        win.reloadIgnoringCache();
      });
      Mousetrap.bind(tsSettings.getToggleFullScreenKeyBinding(), function() {
        win.toggleFullscreen();
      });
    }
    Mousetrap.bind(tsSettings.getShowTagLibraryKeyBinding(), function() {
      tsCoreUI.showTagsPanel();
    });
    Mousetrap.bind(tsSettings.getShowFolderNavigatorBinding(), function() {
      tsCoreUI.showLocationsPanel();
    });
    Mousetrap.bind(tsSettings.getAddRemoveTagsKeyBinding(), function() {
      tsTagsUI.showAddTagsDialog();
    });
    Mousetrap.bind(tsSettings.getSearchKeyBinding(), function() {
      tsCoreUI.showSearchArea();
    });
  }

  // TODO
  function checkForNewVersion() {
    if (tsSettings.getCheckForUpdates()) {
      tsIOApi.checkNewVersion();
    }
  }

  function checkLocalStorageEnabled() {
    var val = 'tagspaces';
    try {
      localStorage.setItem(val, val);
      localStorage.removeItem(val);
    } catch (e) {
      tsCoreUI.showAlertDialog($.i18n.t('ns.dialogs:enableLocalStorageAlert'), 'Error');
    }
  }

  function getParameterByName(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
      results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }

  function updateNewVersionData(data) {
    console.log('Version Information: ' + data);
    var versioningData = JSON.parse(data);
    // Analysing Version Information
    var availableBuild = parseInt(versioningData.appBuild);
    var verA = versioningData.appVersion.split('.');
    if (verA[1].length == 1) {
      verA[1] = '0' + verA[1];
    }
    var availableVersion = parseFloat(verA[0] + '.' + verA[1]);
    var currentBuild = parseInt(tsSettings.DefaultSettings.appBuild);
    var verC = tsSettings.DefaultSettings.appVersion.split('.');
    if (verC[1].length == 1) {
      verC[1] = '0' + verC[1];
    }
    var currentVersion = parseFloat(verC[0] + '.' + verC[1]);
    /* Testing the new version notifications

        availableVersion = 2;
        currentVersion = 1;
        availableBuild = 2;
        currentBuild = 1; */
    if (availableVersion > currentVersion || availableVersion == currentVersion && availableBuild > currentBuild) {
      $('#newVersionAvailable').css('display', 'block');
      $('#whatsNewModal iframe').attr('src', 'http://tagspaces.org/whatsnew/');
      $('#whatsNewModal').on('show.bs.modal', function(e) {
        $('#whatsNewModal iframe').attr('src', 'http://tagspaces.org/whatsnew/');
      });
    }
  }

  function updateLogger() {
    console.log('Updating logger...');
  }

  var $loadingAnimation = $('#loadingAnimation');

  function showLoadingAnimation() {
    $loadingAnimation.show();
  }

  function hideLoadingAnimation() {
    setTimeout(function() {
      $loadingAnimation.hide();
    }, 500);
  }

  function removeFileModel(model, filePath) {
    console.log('Removing file from model');
    for (var i = 0; i < model.length; i++) {
      if (model[i][exports.fileListFILEPATH] === filePath) {
        model.splice(i, 1);
      }
    }
  }

  function updateFileModel(model, oldPath, newPath) {
    console.log('Removing file from model');
    var title = tsTagUtils.extractTitle(newPath),
      fileExt = tsTagUtils.extractFileExtension(newPath),
      fileTags = tsTagUtils.extractTags(newPath);
    for (var i = 0; i < model.length; i++) {
      if (model[i][exports.fileListFILEPATH] == oldPath) {
        model[i][exports.fileListFILEPATH] = newPath;
        model[i][exports.fileListTITLE] = title;
        model[i][exports.fileListTAGS] = fileTags;
        model[i][exports.fileListFILEEXT] = fileExt; // TODO complete the list
        //model[i][exports.fileListFILELMDT] = newPath;
        //model[i][exports.fileListFILENAME] = newPath;
        //model[i][exports.fileListFILESIZE] = newPath;
      }
    }
  }

  function exportFileListCSV(fileList) {
    var csv = '';
    var headers = [];
    var rows = [];
    var numberOfTagColumns = 40;
    // max. estimated to 40 ca. 5 symbols per tag _[er], max. path length 25x chars
    headers.push('path');
    headers.push('title');
    headers.push('size');
    for (var i = 0; i < numberOfTagColumns; i++) {
      headers.push('tag' + i);
    }
    csv += headers.join(',') + '\n';
    for (var i = 0; i < fileList.length; i++) {
      var row = fileList[i][exports.fileListFILEPATH] + ',' + fileList[i][exports.fileListTITLE] + ',' + fileList[i][exports.fileListFILESIZE] + ',' + fileList[i][exports.fileListTAGS];
      rows.push(row);
    }
    csv += rows.join('\n');
    return csv;
  }

  function exportFileListArray(fileList) {
    var rows = [];
    for (var i = 0; i < fileList.length; i++) {
      var row = [];
      row.path = fileList[i][exports.fileListFILEPATH];
      row.title = fileList[i][exports.fileListTITLE];
      row.size = fileList[i][exports.fileListFILESIZE];
      var tags = fileList[i][exports.fileListTAGS];
      for (var j = 0; j < tags.length; j++) {
        row['tag' + j] = tags[j];
      }
      rows.push(row);
    }
    return rows;
  }

  // UI and Layout functionalities
  var isFullWidth = false;
  var shouldOpenCol1 = true;
  var shouldOpenCol2 = true;
  var shouldOpenCol3 = false;

  function reLayout() {
    //console.log("Window w: "+window.innerWidth+" h: "+window.innerHeight+" orient: "+window.orientation+" dpi: "+window.devicePixelRatio);
    var fullWidth = window.innerWidth;
    var halfWidth = Math.round(window.innerWidth / 2);
    var isPortret = fullWidth < window.innerHeight;
    var oneColumn = fullWidth < 660;
    var twoColumn = fullWidth >= 660 && fullWidth < 1024;

    showPerspectiveMenu();
    tsCoreUI.hideAllDropDownMenus();

    if (isFullWidth) {
      oneColumn = true;
    }
    if (oneColumn) {
      if (shouldOpenCol3) {
        shouldOpenCol1 = false;
        shouldOpenCol2 = false;
      } else if (shouldOpenCol1) {
        shouldOpenCol1 = true;
        shouldOpenCol2 = true;
        shouldOpenCol3 = false;
        hidePerspectiveMenu();
      } else {
        shouldOpenCol2 = true;
      }
      if (!isFullWidth) {
        $('#toggleFullWidthButton').hide();
      }
    } else if (twoColumn) {
      $("#openLeftPanel").show();
      shouldOpenCol2 = true;
      if (shouldOpenCol3) {
        shouldOpenCol1 = false;
        shouldOpenCol3 = true;
      }
    } else { // three column
      $('#toggleFullWidthButton').show();
      if (isFullWidth) {
        shouldOpenCol1 = false;
        shouldOpenCol2 = false;
        shouldOpenCol3 = true;
      } else {
        shouldOpenCol2 = true;
      }
    }

    if (shouldOpenCol1) {
      $("#openLeftPanel").hide();
      $("#closeLeftPanel").show();
      $(".col1").show();
    } else {
      $("#closeLeftPanel").hide();
      $("#openLeftPanel").show();
      $(".col1").hide();
    }

    if (shouldOpenCol2) {
      //$("#openLeftPanel").hide();
      $(".col2").show();
    } else {
      $(".col2").hide();
    }

    if (shouldOpenCol3) {
      //$("#openLeftPanel").hide();
      $(".col3").show();
      hidePerspectiveMenu();
    } else {
      $(".col3").hide();
    }
  }

  function hidePerspectiveMenu() {
    $(".perspectiveMainMenuButton").hide();
  }

  function showPerspectiveMenu() {
    $(".perspectiveMainMenuButton").show();
  }

  function openFileViewer() {
    shouldOpenCol3 = true;
    reLayout();
  }

  function closeFileViewer() {
    shouldOpenCol3 = false;
    isFullWidth = false;
    reLayout();
  }

  function toggleFullWidth() {
    isFullWidth = !isFullWidth;
    reLayout();
  }

  function closeLeftPanel() {
    shouldOpenCol1 = false;
    reLayout();
  }

  function openLeftPanel() {
    shouldOpenCol1 = true;
    reLayout();
  }

  function reloadUI() {
    location.reload();
  }

  window.addEventListener('orientationchange', reLayout);

  $(window).on('resize', reLayout);

  function createDocumentEvent(type, data) {
    var evt = document.createEvent('Events');
    evt.initEvent(type, false, false);
    return evt;
  }

  function fireDocumentEvent(evt) {
    setTimeout(function() {
      document.dispatchEvent(evt);
    }, 0);
  }

  // Proxying applications parts
  exports.Config = tsSettings;
  exports.IO = tsIOApi;
  exports.UI = tsCoreUI;
  exports.PerspectiveManager = tsPersManager;
  exports.TagUtils = tsTagUtils;
  exports.FileOpener = tsFileOpener;
  exports.Search = tsSearch;
  exports.Utils = tsUtils;
  if (tsPro.available) {
    exports.PRO = tsPro;
  }
  exports.Meta = tsMeta;
  // Public API definition
  exports.dirSeparator = isWin && !isWeb ? '\\' : '/';
  exports.metaFolder = ".ts";
  exports.metaFolderFile = "tsm.json";
  exports.metaFileExt = ".json";
  exports.thumbFileExt = ".png";
  exports.contentFileExt = ".txt";
  exports.locationDesktop;
  exports.initApp = initApp;
  exports.reLayout = reLayout;
  exports.updateLogger = updateLogger;
  exports.showLoadingAnimation = showLoadingAnimation;
  exports.hideLoadingAnimation = hideLoadingAnimation;
  exports.reloadUI = reloadUI;
  exports.reLayout = reLayout;
  exports.openFileViewer = openFileViewer;
  exports.closeFileViewer = closeFileViewer;
  exports.openLeftPanel = openLeftPanel;
  exports.closeLeftPanel = closeLeftPanel;
  exports.toggleFullWidth = toggleFullWidth;
  exports.updateNewVersionData = updateNewVersionData;
  exports.exportFileListCSV = exportFileListCSV;
  exports.exportFileListArray = exportFileListArray;
  exports.removeFileModel = removeFileModel;
  exports.updateFileModel = updateFileModel;
  exports.switchInterfaceLanguage = switchInterfaceLanguage;
  exports.getParameterByName = getParameterByName;

  // Proxying functions from tsCoreUI
  // TODO use TSCORE.UI instead
  exports.clearSearchFilter = tsCoreUI.clearSearchFilter;
  exports.openLinkExternally = tsCoreUI.openLinkExternally;
  exports.enableTopToolbar = tsCoreUI.enableTopToolbar;
  exports.disableTopToolbar = tsCoreUI.disableTopToolbar;
  exports.showAlertDialog = tsCoreUI.showAlertDialog;
  exports.showSuccessDialog = tsCoreUI.showSuccessDialog;
  exports.showConfirmDialog = tsCoreUI.showConfirmDialog;
  exports.showTagEditDialog = tsCoreUI.showTagEditDialog;
  exports.hideAllDropDownMenus = tsCoreUI.hideAllDropDownMenus;
  exports.showFileCreateDialog = tsCoreUI.showFileCreateDialog;
  exports.showFileRenameDialog = tsCoreUI.showFileRenameDialog;
  exports.showFileDeleteDialog = tsCoreUI.showFileDeleteDialog;
  exports.showLocationsPanel = tsCoreUI.showLocationsPanel;
  exports.showTagsPanel = tsCoreUI.showTagsPanel;
  exports.showContextMenu = tsCoreUI.showContextMenu;
  exports.showDirectoryBrowserDialog = tsCoreUI.showDirectoryBrowserDialog;
  exports.createHTMLFile = tsCoreUI.createHTMLFile;
  exports.createMDFile = tsCoreUI.createMDFile;
  exports.createTXTFile = tsCoreUI.createTXTFile;
  exports.showSearchArea = tsCoreUI.showSearchArea;

  // Proxying functions from tsTagsUI
  exports.generateTagButtons = tsTagsUI.generateTagButtons;
  exports.generateTagStyle = tsTagsUI.generateTagStyle;
  exports.openTagMenu = tsTagsUI.openTagMenu;
  exports.showWaitingDialog = tsCoreUI.showWaitingDialog;
  exports.hideWaitingDialog = tsCoreUI.hideWaitingDialog;
  exports.showMoveCopyFilesDialog = tsCoreUI.showMoveCopyFilesDialog;
  exports.showAddTagsDialog = tsTagsUI.showAddTagsDialog;
  exports.showTagEditInTreeDialog = tsTagsUI.showTagEditInTreeDialog;
  exports.showDialogTagCreate = tsTagsUI.showDialogTagCreate;
  exports.showDialogEditTagGroup = tsTagsUI.showDialogEditTagGroup;
  exports.showDialogTagGroupCreate = tsTagsUI.showDialogTagGroupCreate;
  exports.calculatedTags = tsTagsUI.calculatedTags;
  exports.locationTags = tsTagsUI.locationTags;
  exports.generateTagGroups = tsTagsUI.generateTagGroups;

  // Proxying functions from directoriesUI
  exports.openLocation = tsDirectoriesUI.openLocation;
  exports.updateSubDirs = tsDirectoriesUI.updateSubDirs;
  exports.initLocations = tsDirectoriesUI.initLocations;
  exports.showCreateDirectoryDialog = tsDirectoriesUI.showCreateDirectoryDialog;
  exports.closeCurrentLocation = tsDirectoriesUI.closeCurrentLocation;
  exports.navigateToDirectory = tsDirectoriesUI.navigateToDirectory;
  exports.generateFolderTags = tsDirectoriesUI.generateFolderTags;
  // Public variables definition
  exports.currentPath = currentPath;
  exports.currentLanguage = exports.currentLanguage;
  exports.currentLocationObject = currentLocationObject;
  exports.currentPerspectiveID = currentPerspectiveID;
  exports.selectedFiles = selectedFiles;
  exports.fileList = fileList;
  exports.subDirsList = subDirsList;
  exports.selectedTag = selectedTag;
  exports.selectedTagData = selectedTagData;
  exports.startTime = startTime;
  exports.subfoldersDirBrowser = subfoldersDirBrowser;
  exports.directoryBrowser = directoryBrowser;
  exports.fileListFILEEXT = 0;
  exports.fileListTITLE = 1;
  exports.fileListTAGS = 2;
  exports.fileListFILESIZE = 3;
  exports.fileListFILELMDT = 4;
  exports.fileListFILEPATH = 5;
  exports.fileListFILENAME = 6;
  exports.fileListMETA = 7;
  //document events
  exports.createDocumentEvent = createDocumentEvent;
  exports.fireDocumentEvent = fireDocumentEvent;
  exports.metaFileList = metaFileList;
});
