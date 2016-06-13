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

  // Importing modules
  var tsSettings = require('tssetting');
  var tsIOApi = require('tsioapi');
  var tsPersManager = require('tspersmanager');
  var tsTagUtils = require('tstagutils');
  var tsFileOpener = require('tsfileopener');
  var tsTagsUI = require('tstagsui');
  var tsDirectoriesUI = require('tsdirectoriesui');
  var tsCoreUI = require('tscoreui');
  var tsSearch = require('tssearch');
  var tsSearchUI = require('tssearchui');
  var tsPro = require('tspro');
  var tsUtils = require('tsutils');
  var tsIOUtils = require('tsioutils');
  var tsMeta = require('tsmeta');
  var tsExt = require('tsextapi');
  var tsExtManager = require('tsextmanager');
  var TSCORE = require('tscore');
  var tsAudioRecorderUI = require('tsaudiorecorderui');

  // Defining variables
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

  // Loading animation related vars
  var $loadingAnimation = $('.loadingAnimation');
  var $statusBar = $('#statusBar');

  // UI and Layout functionalities
  var isFullWidth = false;
  var shouldOpenCol1 = true;
  var shouldOpenCol2 = true;
  var shouldOpenCol3 = false;
  var oneColumn = false;
  var saveOpenCol1 = false;

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
    tsSearchUI.initUI();
    tsAudioRecorderUI.initUI();
    tsExtManager.loadExtensionData().then(function() {
      tsPersManager.initPerspectives().then(function(result) {
        console.log("Perspectives Initialized: " + result);
      }).catch(function(err) {
        console.warn("Perspectives initialization failed: " + err);
      });
    });

    hideLoadingAnimation();

    $(document).ready(function() {
      reLayout();

      var language = tsSettings.getInterfaceLanguage();

      if (tsSettings.isFirstRun()) {
        // Showing license dialog
        tsCoreUI.showLicenseDialog();

        // Setting the language
        var browserLang = navigator.language || navigator.userLanguage;

        var languageMatched;

        tsSettings.getSupportedLanguages().forEach(function(value) {
          if (browserLang === value.iso) {
            language = browserLang;
            languageMatched = true;
          }
        });

        if (!languageMatched) {
          tsSettings.getSupportedLanguages().forEach(function(value) {
            if (value.iso.indexOf(browserLang) === 0) {
              language = value.iso;
            }
          });
        }

        tsSettings.setInterfaceLanguage(language);
        tsSettings.saveSettings();

      }

      var langURLParam = tsUtils.getURLParameter('locale');
      if (langURLParam && langURLParam.length > 1) {
        language = langURLParam;
      }

      switchInterfaceLanguage(language).then(function() {
        if (isNode || isElectron) {
          tsIOApi.initMainMenu();
        }

        if (tsSettings.Settings.tagspacesList.length < 1) {
          // Show getting started guide by no locations
          tsCoreUI.startGettingStartedTour();
        }
      }).catch(function() {
        console.warn("Language switching failed.");
      });

      initKeyBindings();
      tsIOApi.checkAccessFileURLAllowed ? tsIOApi.checkAccessFileURLAllowed() : true;

      if (isNode || isChrome || isElectron || isWeb) {
        // Handle command line argument in node-webkit
        tsIOApi.handleStartParameters(); // Handle minimizing to the tray in node-webkit
      }
      console.log('Document ready finished. Layout initialized');
      checkForNewVersion();
    });

    window.addEventListener('orientationchange', reLayout);

    $(window).on('resize', reLayout);
  }

  function switchInterfaceLanguage(language) {
    exports.currentLanguage = language;
    return new Promise(function(resolve, reject) {
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
        resolve();
      });
    });
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
      tsSearchUI.showSearchArea();
    });
    Mousetrap.bind(tsSettings.getRenamingFileKeyBinding(), function() {
      if (TSCORE.selectedFiles[0]) {
        tsCoreUI.showFileRenameDialog(TSCORE.selectedFiles[0]);
      }
    });
  }

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

  function updateNewVersionData(data) {
    console.log('Version Information: ' + JSON.stringify(data));
    var versioningData = JSON.parse(JSON.stringify(data));
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
      /*$('#whatsNewModal iframe').attr('src', 'http://tagspaces.org/whatsnew/');
       $('#whatsNewModal').on('show.bs.modal', function(e) {
       $('#whatsNewModal iframe').attr('src', 'http://tagspaces.org/whatsnew/');
       });*/
    }
  }

  function showLoadingAnimation() {
    $statusBar.hide();
    $loadingAnimation.show();
  }

  function hideLoadingAnimation() {
    setTimeout(function() {
      $loadingAnimation.hide();
      $statusBar.show();
    }, 500);
  }

  function removeFileModel(model, filePath) {
    console.log('Removing file from model');
    for (var i = 0; i < model.length; i++) {
      if (model[i].path === filePath) {
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
      if (model[i].path == oldPath) {
        model[i].path = newPath;
        model[i].title = title;
        model[i].tags = fileTags;
        model[i].extension = fileExt; // TODO complete the list
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
      var row = fileList[i].path + ',' + fileList[i].title + ',' + fileList[i].size + ',' + fileList[i].tags;
      rows.push(row);
    }
    csv += rows.join('\n');
    return csv;
  }

  function exportFileListArray(fileList) {
    var rows = [];
    for (var i = 0; i < fileList.length; i++) {
      var row = [];
      row.path = fileList[i].path;
      row.title = fileList[i].title;
      row.size = fileList[i].size;
      for (var j = 0; j < fileList[i].tags.length; j++) {
        row['tag' + j] = tags[j];
      }
      rows.push(row);
    }
    return rows;
  }

  function isOneColumn() {

    return oneColumn;
  }

  function reLayout() {
    //console.log("Window w: "+window.innerWidth+" h: "+window.innerHeight+" orient: "+window.orientation+" dpi: "+window.devicePixelRatio);
    var fullWidth = window.innerWidth;
    var halfWidth = Math.round(window.innerWidth / 2);
    var isPortret = fullWidth < window.innerHeight;
    oneColumn = fullWidth < 660;
    var twoColumn = fullWidth >= 660 && fullWidth < 1024;

    $("#searchOptions").hide();

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
    saveOpenCol1 = shouldOpenCol1;
    reLayout();
  }

  function closeFileViewer() {
    shouldOpenCol3 = false;
    isFullWidth = false;
    reLayout();
  }

  function toggleFullWidth() {
    isFullWidth = !isFullWidth;
    shouldOpenCol1 = saveOpenCol1;
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
  exports.IOUtils = tsIOUtils;
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
  exports.directoryExt = "DIRECTORY";
  exports.locationDesktop;
  exports.initApp = initApp;
  exports.reLayout = reLayout;
  exports.isOneColumn = isOneColumn;
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

  // Proxying functions from tsCoreUI
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
  exports.showRenameFileDialog = tsCoreUI.showRenameFileDialog;

  // Proxying functions from tsSearchUI
  exports.clearSearchFilter = tsSearchUI.clearSearchFilter;
  exports.showSearchArea = tsSearchUI.showSearchArea;
  exports.searchForTag = tsSearchUI.searchForTag;

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

  //document events
  exports.createDocumentEvent = createDocumentEvent;
  exports.fireDocumentEvent = fireDocumentEvent;
  exports.metaFileList = metaFileList;
});
