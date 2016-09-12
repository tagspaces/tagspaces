/* Copyright (c) 2012-2016 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */

/* global define, isFirefox  */

define(function(require, exports, module) {
  'use strict';

  console.log('Loading settings.api.js..');

  var TSCORE = require('tscore');
  exports.DefaultSettings = require('tssettingsdefault').defaultSettings;
  exports.Settings = undefined;

  var tagTemplate = {
    'title': undefined,
    'type': 'plain'
    /*
     "pattern":"yyyymmddhhmmss-yyyymmddhhmmss",
     "example":"20120114123456-20120823231235",
     "regex":"",
     "maxlength":17,
     "chainedTags":[
     "isbn","autor"
     ],
     "url": "http://example.com",
     "action":"showDatePicker",
     "prefixes":[
     "EUR", "USD", "BGN"
     ]
     */
  };

  var locationTemplate = {
    'name': undefined,
    'path': undefined,
    'perspective': undefined
  };

  var tagGroupTemplate = {
    'title': undefined,
    'key': undefined,
    'expanded': true,
    'children': []
  };

  var firstRun = false;

  //////////////////// Settings upgrade methods ///////////////////
  function upgradeSettings() {
    var oldBuildNumber = parseInt(exports.Settings.appBuildID);
    // For compartibility reasons
    if (exports.Settings.appBuildID === undefined) {
      oldBuildNumber = parseInt(exports.Settings.appBuild);
      exports.Settings.appBuildID = exports.DefaultSettings.appBuildID;
      saveSettings();
    }
    var newBuildNumber = parseInt(exports.DefaultSettings.appBuildID);
    // Workarround for settings update, please comment for production
    //oldBuildNumber = 1;
    //newBuildNumber = 2;
    if (oldBuildNumber < newBuildNumber) {
      console.log('Upgrading settings');
      exports.Settings.appVersion = exports.DefaultSettings.appVersion;
      exports.Settings.appBuild = exports.DefaultSettings.appBuild;
      exports.Settings.appBuildID = exports.DefaultSettings.appBuildID;
      getPerspectiveExtensions();
      getExtensionPath();
      getShowUnixHiddenEntries();
      getCheckForUpdates();
      if (oldBuildNumber <= 1700) {
        setPrefixTagContainer('');
        setTagDelimiter(' ');
        setCalculateTags(false);
      }
      if (oldBuildNumber <= 20140307000000) {
        addFileType({
          'type': 'odt',
          'viewer': 'editorODF',
          'editor': 'false'
        });
        addFileType({
          'type': 'ods',
          'viewer': 'editorODF',
          'editor': 'false'
        });
        addFileType({
          'type': 'odp',
          'viewer': 'editorODF',
          'editor': 'false'
        });
        addFileType({
          'type': 'odg',
          'viewer': 'editorODF',
          'editor': 'false'
        });
      }
      if (oldBuildNumber <= 20141002000000) {
        updateFileType({
          'type': 'json',
          'viewer': 'editorJSON',
          'editor': 'editorJSON'
        });
        updateFileType({
          'type': 'html',
          'viewer': 'viewerHTML',
          'editor': 'editorHTML'
        });
        updateFileType({
          'type': 'htm',
          'viewer': 'viewerHTML',
          'editor': 'editorHTML'
        });
      }
      if (oldBuildNumber <= 20141123000000) {
        updateFileType({
          'type': 'mhtml',
          'viewer': 'viewerMHTML',
          'editor': 'false'
        });
        updateFileType({
          'type': 'mht',
          'viewer': 'viewerMHTML',
          'editor': 'false'
        });
      }
      if (oldBuildNumber <= 20150727000000) {
        updateFileType({
          'type': 'ogg',
          'viewer': 'viewerAudioVideo',
          'editor': 'false'
        });
        updateFileType({
          'type': 'oga',
          'viewer': 'viewerAudioVideo',
          'editor': 'false'
        });
        updateFileType({
          'type': 'ogv',
          'viewer': 'viewerAudioVideo',
          'editor': 'false'
        });
        updateFileType({
          'type': 'ogx',
          'viewer': 'viewerAudioVideo',
          'editor': 'false'
        });
        updateFileType({
          'type': 'webm',
          'viewer': 'viewerAudioVideo',
          'editor': 'false'
        });
        updateFileType({
          'type': 'mp3',
          'viewer': 'viewerAudioVideo',
          'editor': 'false'
        });
        updateFileType({
          'type': 'mp4',
          'viewer': 'viewerAudioVideo',
          'editor': 'false'
        });
        addFileType({
          'type': 'epub',
          'viewer': 'viewerEPUB',
          'editor': 'false'
        });
        addFileType({
          'type': 'zip',
          'viewer': 'viewerZIP',
          'editor': 'false'
        });
        if (isCordovaAndroid) {
          TSCORE.showAlertDialog("Due some major changes in the app, you have to manually reconnect your locations. Please excuse us for this inconvenience.");
        }
      }

      saveSettings();
    }
  }

  function addTagGroup(newTagGroup) { // TODO add parameters replace and merge
    var tagGroupExist = false;
    exports.Settings.tagGroups.forEach(function(value) {
      if (value.key === newTagGroup.key) {
        //exports.Settings.tagGroups.splice($.inArray(value, exports.Settings.tagGroups), 1);
        tagGroupExist = true;
      }
    });
    if (!tagGroupExist) {
      exports.Settings.tagGroups.push(newTagGroup);
    }
    //exports.Settings.tagGroups.push(newTagGroup);
  }

  function addFileType(newFileType) {
    var fileTypeExist = false;
    exports.Settings.supportedFileTypes.forEach(function(value) {
      if (value.type === newFileType.type) {
        fileTypeExist = true;
      }
    });
    if (!fileTypeExist) {
      exports.Settings.supportedFileTypes.push(newFileType);
    }
  }

  function updateFileType(newFileType) {
    exports.Settings.supportedFileTypes.forEach(function(value) {
      if (value.type === newFileType.type) {
        value.viewer = newFileType.viewer;
        value.editor = newFileType.editor;
      }
    });
  }

  function addToSettingsArray(arrayLocation, value) {
    if (arrayLocation instanceof Array) {
      if ($.inArray(value, arrayLocation) < 0) {
        arrayLocation.push(value);
      }
    }
  }

  function removeFromSettingsArray(arrayLocation, value) {
    if (arrayLocation instanceof Array) {
      arrayLocation.splice($.inArray(value, arrayLocation), 1);
    }
  }

  function removeFromSettingsArrayById(arrayLocation, id) {
    if (arrayLocation instanceof Array) {
      arrayLocation.forEach(function(value, index) {
        if (value.id === id) {
          arrayLocation.splice(index, 1);
        }
      });
    }
  }

  //////////////////// getter and setter methods ///////////////////

  function getPerspectiveExtensions() {
    var perspectives = [];
    getExtensions().forEach(function(extension) {
      if (extension.type === "perspective") {
        perspectives.push({'id': extension.id, 'name': extension.name});
      }
    });
    return perspectives;
  }

  function getViewerExtensions() {
    var viewers = [];
    getExtensions().forEach(function(extension) {
      if (extension.type === "viewer" || extension.type === "editor") {
        viewers.push({'id': extension.id, 'name': extension.name});
      }
    });
    return viewers;
  }

  function getEditorExtensions() {
    var editors = [];
    getExtensions().forEach(function(extension) {
      if (extension.type === "editor") {
        editors.push({'id': extension.id, 'name': extension.name});
      }
    });
    return editors;
  }

  function getActivatedPerspectives() {
    if (!exports.Settings.perspectives) {
      exports.Settings.perspectives = exports.DefaultSettings.perspectives;
    }

    var matchedPerspectives = [];

    exports.Settings.perspectives.forEach(function(activatedPerspective) {
      getPerspectiveExtensions().forEach(function(perspective) {
        if (activatedPerspective.id === perspective.id) {
          activatedPerspective.name = perspective.name;
          matchedPerspectives.push(activatedPerspective);
        }
      });
    });

    if (matchedPerspectives.length > 0) {
      exports.Settings.perspectives = matchedPerspectives;
      saveSettings();
    }
    return exports.Settings.perspectives;
  }

  function setActivatedPerspectives(value) {

    exports.Settings.perspectives = value;
  }

  function isFirstRun() {
    if (exports.Settings.firstRun === undefined || exports.Settings.firstRun === true) {
      exports.Settings.firstRun = false;
      saveSettings();
      return true;
    } else {
      return false;
    }
  }

  function getExtensions() {
    if (!exports.Settings.extensions || exports.Settings.extensions.length < 1) {
      exports.Settings.extensions = [];
      exports.DefaultSettings.ootbPerspectives.forEach(function(extensionId) {
        exports.Settings.extensions.push({'id': extensionId, 'name': extensionId, 'type': 'perspective'});
      });
      exports.DefaultSettings.ootbViewers.forEach(function(extensionId) {
        exports.Settings.extensions.push({'id': extensionId, 'name': extensionId, 'type': 'viewer'});
      });
      exports.DefaultSettings.ootbEditors.forEach(function(extensionId) {
        exports.Settings.extensions.push({'id': extensionId, 'name': extensionId, 'type': 'editor'});
      });
    }
    return exports.Settings.extensions;
  }

  function setExtensions(extensions) {

    exports.Settings.extensions = extensions;
  }

  function getExtensionPath() {
    if (exports.Settings.extensionsPath === undefined) {
      exports.Settings.extensionsPath = exports.DefaultSettings.extensionsPath;
    }
    return exports.Settings.extensionsPath;
  }

  function setExtensionPath(value) {

    exports.Settings.extensionsPath = value;
  }

  function getIsWindowMaximized() {
    if (exports.Settings.isWindowMaximized === undefined) {
      exports.Settings.isWindowMaximized = exports.DefaultSettings.isWindowMaximized;
    }
    return exports.Settings.isWindowMaximized;
  }

  function setIsWindowMaximized(value) {

    exports.Settings.isWindowMaximized = value;
  }

  function getLastOpenedLocation() {
    if (exports.Settings.lastOpenedLocation === undefined) {
      exports.Settings.lastOpenedLocation = exports.DefaultSettings.lastOpenedLocation;
    }
    return exports.Settings.lastOpenedLocation;
  }

  function setLastOpenedLocation(value) {

    exports.Settings.lastOpenedLocation = value;
  }

  function getDefaultLocation() {

    return exports.Settings.defaultLocation || "";
  }

  function setDefaultLocation(value) {

    exports.Settings.defaultLocation = value;
  }

  function getSupportedLanguages() {

    return exports.DefaultSettings.supportedLanguages;
  }

  function getCloseViewerKeyBinding() {
    updateKeyBindingsSetting();
    if (exports.Settings.keyBindings.closeViewer === undefined) {
      exports.Settings.keyBindings.closeViewer = exports.DefaultSettings.keyBindings.closeViewer;
      saveSettings();
    }
    return exports.Settings.keyBindings.closeViewer;
  }

  function setCloseViewerKeyBinding(value) {

    exports.Settings.keyBindings.closeViewer = value;
  }

  function getEditDocumentKeyBinding() {
    updateKeyBindingsSetting();
    if (exports.Settings.keyBindings.editDocument === undefined) {
      exports.Settings.keyBindings.editDocument = exports.DefaultSettings.keyBindings.editDocument;
      saveSettings();
    }
    return exports.Settings.keyBindings.editDocument;
  }

  function setEditDocumentKeyBinding(value) {

    exports.Settings.keyBindings.editDocument = value;
  }

  function getSaveDocumentKeyBinding() {
    updateKeyBindingsSetting();
    if (exports.Settings.keyBindings.saveDocument === undefined) {
      exports.Settings.keyBindings.saveDocument = exports.DefaultSettings.keyBindings.saveDocument;
      saveSettings();
    }
    return exports.Settings.keyBindings.saveDocument;
  }

  function setSaveDocumentKeyBinding(value) {

    exports.Settings.keyBindings.saveDocument = value;
  }

  function getReloadApplicationKeyBinding() {
    //if (exports.Settings.keyBindings === undefined) {
    //    exports.Settings.keyBindings = exports.DefaultSettings.keyBindings;
    //    saveSettings();
    //}
    //if (exports.Settings.keyBindings.reloadApplication === undefined) {
    //    exports.Settings.keyBindings.reloadApplication = exports.DefaultSettings.keyBindings.reloadApplication;
    //    saveSettings();
    //}
    return exports.DefaultSettings.keyBindings.reloadApplication;
  }

  function setReloadApplicationKeyBinding(value) {

    consolo.log('Not supported command'); //exports.Settings.keyBindings.reloadApplication = value;
  }

  function getToggleFullScreenKeyBinding() {
    updateKeyBindingsSetting();
    if (exports.Settings.keyBindings.toggleFullScreen === undefined) {
      exports.Settings.keyBindings.toggleFullScreen = exports.DefaultSettings.keyBindings.toggleFullScreen;
      saveSettings();
    }
    return exports.Settings.keyBindings.toggleFullScreen;
  }

  function setToggleFullScreenKeyBinding(value) {

    exports.Settings.keyBindings.toggleFullScreen = value;
  }

  function getAddRemoveTagsKeyBinding() {
    updateKeyBindingsSetting();
    if (exports.Settings.keyBindings.addRemoveTags === undefined) {
      exports.Settings.keyBindings.addRemoveTags = exports.DefaultSettings.keyBindings.addRemoveTags;
      saveSettings();
    }
    return exports.Settings.keyBindings.addRemoveTags;
  }

  function setAddRemoveTagsKeyBinding(value) {

    exports.Settings.keyBindings.addRemoveTags = value;
  }

  function getReloadDocumentKeyBinding() {
    updateKeyBindingsSetting();
    if (exports.Settings.keyBindings.reloadDocument === undefined) {
      exports.Settings.keyBindings.reloadDocument = exports.DefaultSettings.keyBindings.reloadDocument;
      saveSettings();
    }
    return exports.Settings.keyBindings.reloadDocument;
  }

  function setReloadDocumentKeyBinding(value) {

    exports.Settings.keyBindings.reloadDocument = value;
  }

  function setSelectAllKeyBinding(value) {

    exports.Settings.keyBindings.selectAll = value;
  }

  function getSelectAllKeyBinding() {
    updateKeyBindingsSetting();
    if (exports.Settings.keyBindings.selectAll === undefined) {
      exports.Settings.keyBindings.selectAll = exports.DefaultSettings.keyBindings.selectAll;
      saveSettings();
    }
    return exports.Settings.keyBindings.selectAll;
  }

  function getRenamingFileKeyBinding() {
    updateKeyBindingsSetting;
    if (exports.Settings.keyBindings.renameFile === undefined) {
      exports.Settings.keyBindings.renameFile = exports.DefaultSettings.keyBindings.renameFile;
      saveSettings();
    }
    return exports.Settings.keyBindings.renameFile;
  }

  function setRenamingFileKeyBinding(value) {
    exports.Settings.keyBindings.renameFile = value;
  }

  function getDeleteDocumentKeyBinding() {
    updateKeyBindingsSetting();
    if (exports.Settings.keyBindings.deleteDocument === undefined) {
      exports.Settings.keyBindings.deleteDocument = exports.DefaultSettings.keyBindings.deleteDocument;
      saveSettings();
    }
    return exports.Settings.keyBindings.deleteDocument;
  }

  function setDeleteDocumentKeyBinding(value) {

    exports.Settings.keyBindings.deleteDocument = value;
  }

  function getPropertiesDocumentKeyBinding() {
    updateKeyBindingsSetting();
    if (exports.Settings.keyBindings.propertiesDocument === undefined) {
      exports.Settings.keyBindings.propertiesDocument = exports.DefaultSettings.keyBindings.propertiesDocument;
      saveSettings();
    }
    return exports.Settings.keyBindings.propertiesDocument;
  }

  function setPropertiesDocumentKeyBinding(value) {

    exports.Settings.keyBindings.propertiesDocument = value;
  }

  function getNextDocumentKeyBinding() {
    updateKeyBindingsSetting();
    if (exports.Settings.keyBindings.nextDocument === undefined) {
      exports.Settings.keyBindings.nextDocument = exports.DefaultSettings.keyBindings.nextDocument;
      saveSettings();
    }
    return exports.Settings.keyBindings.nextDocument;
  }

  function setNextDocumentKeyBinding(value) {

    exports.Settings.keyBindings.nextDocument = value;
  }

  function getPrevDocumentKeyBinding() {
    updateKeyBindingsSetting();
    if (exports.Settings.keyBindings.prevDocument === undefined) {
      exports.Settings.keyBindings.prevDocument = exports.DefaultSettings.keyBindings.prevDocument;
      saveSettings();
    }
    return exports.Settings.keyBindings.prevDocument;
  }

  function setShowTagLibraryKeyBinding(value) {

    exports.Settings.keyBindings.showTagLibrary = value;
  }

  function getShowTagLibraryKeyBinding() {
    updateKeyBindingsSetting();
    if (exports.Settings.keyBindings.showTagLibrary === undefined) {
      exports.Settings.keyBindings.showTagLibrary = exports.DefaultSettings.keyBindings.showTagLibrary;
      saveSettings();
    }
    return exports.Settings.keyBindings.showTagLibrary;
  }

  function setShowFolderNavigatorKeyBinding(value) {

    exports.Settings.keyBindings.showFolderNavigator = value;
  }

  function getShowFolderNavigatorBinding() {
    updateKeyBindingsSetting();
    if (exports.Settings.keyBindings.showFolderNavigator === undefined) {
      exports.Settings.keyBindings.showFolderNavigator = exports.DefaultSettings.keyBindings.showFolderNavigator;
      saveSettings();
    }
    return exports.Settings.keyBindings.showFolderNavigator;
  }

  function setPrevDocumentKeyBinding(value) {

    exports.Settings.keyBindings.prevDocument = value;
  }

  function getOpenDevToolsScreenKeyBinding() {
    updateKeyBindingsSetting();
    if (exports.Settings.keyBindings.openDevTools === undefined) {
      exports.Settings.keyBindings.openDevTools = exports.DefaultSettings.keyBindings.openDevTools;
      saveSettings();
    }
    return exports.Settings.keyBindings.openDevTools;
  }

  function setOpenDevToolsScreenKeyBinding(value) {

    exports.Settings.keyBindings.openDevTools = value;
  }

  function getSearchKeyBinding() {
    updateKeyBindingsSetting();
    if (exports.Settings.keyBindings.openSearch === undefined) {
      exports.Settings.keyBindings.openSearch = exports.DefaultSettings.keyBindings.openSearch;
      saveSettings();
    }
    return exports.Settings.keyBindings.openSearch;
  }

  function setSearchKeyBinding(value) {

    exports.Settings.keyBindings.openSearch = value;
  }

  function getInterfaceLanguage() {
    if (exports.Settings.interfaceLanguage === undefined) {
      exports.Settings.interfaceLanguage = exports.DefaultSettings.interfaceLanguage;
      saveSettings();
    }
    return exports.Settings.interfaceLanguage;
  }

  function setInterfaceLanguage(value) {

    exports.Settings.interfaceLanguage = value;
  }

  function getShowWarningRecursiveScan() {
    if (exports.Settings.showWarningRecursiveScan === undefined) {
      exports.Settings.showWarningRecursiveScan = exports.DefaultSettings.showWarningRecursiveScan;
      saveSettings();
    }
    return exports.Settings.showWarningRecursiveScan;
  }

  function setShowWarningRecursiveScan(value) {
    exports.Settings.showWarningRecursiveScan = value;
    saveSettings();
  }

  function getShowMainMenu() {
    if (exports.Settings.showMainMenu === undefined) {
      exports.Settings.showMainMenu = exports.DefaultSettings.showMainMenu;
    }
    return exports.Settings.showMainMenu;
  }

  function setShowMainMenu(value) {

    exports.Settings.showMainMenu = value;
  }

  function getWebDavPath() {
    if (exports.Settings.webDavPath === undefined) {
      exports.Settings.webDavPath = exports.DefaultSettings.webDavPath;
    }
    return exports.Settings.webDavPath;
  }

  function setWebDavPath(value) {

    exports.Settings.webDavPath = value;
  }

  function getShowUnixHiddenEntries() {
    if (exports.Settings.showUnixHiddenEntries === undefined) {
      exports.Settings.showUnixHiddenEntries = exports.DefaultSettings.showUnixHiddenEntries;
    }
    return exports.Settings.showUnixHiddenEntries;
  }

  function setShowUnixHiddenEntries(value) {

    exports.Settings.showUnixHiddenEntries = value;
  }

  function getCheckForUpdates() {
    if (exports.Settings.checkForUpdates === undefined) {
      exports.Settings.checkForUpdates = exports.DefaultSettings.checkForUpdates;
    }
    return exports.Settings.checkForUpdates;
  }

  function setCheckForUpdates(value) {

    exports.Settings.checkForUpdates = value;
  }

  function getPrefixTagContainer() {
    if (exports.Settings.prefixTagContainer === undefined) {
      exports.Settings.prefixTagContainer = exports.DefaultSettings.prefixTagContainer;
    }
    return exports.Settings.prefixTagContainer;
  }

  function setPrefixTagContainer(value) {

    exports.Settings.prefixTagContainer = value;
  }

  function getTagDelimiter() {
    if (exports.Settings.tagDelimiter === undefined) {
      exports.Settings.tagDelimiter = exports.DefaultSettings.tagDelimiter;
    }
    return exports.Settings.tagDelimiter;
  }

  function setTagDelimiter(value) {

    exports.Settings.tagDelimiter = value;
  }

  function getCalculateTags() {
    if (exports.Settings.calculateTags === undefined) {
      exports.Settings.calculateTags = exports.DefaultSettings.calculateTags;
    }
    return exports.Settings.calculateTags;
  }

  function setCalculateTags(value) {

    exports.Settings.calculateTags = value;
  }

  function getLoadLocationMeta() {
    if (exports.Settings.loadLocationMeta === undefined) {
      exports.Settings.loadLocationMeta = exports.DefaultSettings.loadLocationMeta;
    }
    return exports.Settings.loadLocationMeta;
  }

  function setLoadLocationMeta(value) {

    exports.Settings.loadLocationMeta = value;
  }

  function getUseSearchInSubfolders() {
    if (exports.Settings.useSearchInSubfolders === undefined) {
      exports.Settings.useSearchInSubfolders = exports.DefaultSettings.useSearchInSubfolders;
    }
    return exports.Settings.useSearchInSubfolders;
  }

  function setUseSearchInSubfolders(value) {
    exports.Settings.useSearchInSubfolders = value;
  }

  function getMaxSearchResultCount() {
    if (exports.Settings.maxSearchResultCount === undefined) {
      exports.Settings.maxSearchResultCount = exports.DefaultSettings.maxSearchResultCount;
    }
    return exports.Settings.maxSearchResultCount;
  }

  function setMaxSearchResultCount(value) {
    if (isNaN(value) || value < 0 || value > 2000) {
      value = 0;
    }
    exports.Settings.maxSearchResultCount = value;
  }

  function getWatchCurrentDirectory() {
    if (exports.Settings.watchCurrentDirectory === undefined) {
      exports.Settings.watchCurrentDirectory = exports.DefaultSettings.watchCurrentDirectory;
    }
    return exports.Settings.watchCurrentDirectory;
  }

  function setWatchCurrentDirectory(value) {
    exports.Settings.watchCurrentDirectory = value;
  }

  function getEnableMetaData() {
    if (exports.Settings.enableMetaData === undefined) {
      exports.Settings.enableMetaData = exports.DefaultSettings.enableMetaData;
    }
    return exports.Settings.enableMetaData;
  }

  function setEnableMetaData(value) {

    exports.Settings.enableMetaData = value;
  }

  function getSupportedFileTypes() {
    if (exports.Settings.supportedFileTypes === undefined) {
      exports.Settings.supportedFileTypes = exports.DefaultSettings.supportedFileTypes;
    }
    return exports.Settings.supportedFileTypes;
  }

  function setSupportedFileTypes(value) {

    exports.Settings.supportedFileTypes = value;
  }

  function getNewTextFileContent() {

    return exports.DefaultSettings.newTextFileContent;
  }

  function getNewHTMLFileContent() {

    return exports.DefaultSettings.newHTMLFileContent;
  }

  function getNewMDFileContent() {

    return exports.DefaultSettings.newMDFileContent;
  }

  function getUseTrashCan() {
    if (exports.Settings.useTrashCan === undefined) {
      exports.Settings.useTrashCan = exports.DefaultSettings.useTrashCan;
    }
    return exports.Settings.useTrashCan;
  }

  function setUseTrashCan(value) {

    exports.Settings.useTrashCan = value;
  }

  function getUseOCR() {
    if (exports.Settings.useOCR === undefined) {
      exports.Settings.useOCR = exports.DefaultSettings.useOCR;
    }
    return exports.Settings.useOCR;
  }

  function setUseOCR(value) {

    exports.Settings.useOCR = value;
  }

  function getUseTextExtraction() {
    if (exports.Settings.useTextExtraction === undefined) {
      exports.Settings.useTextExtraction = exports.DefaultSettings.useTextExtraction;
    }
    return exports.Settings.useTextExtraction;
  }

  function setUseTextExtraction(value) {

    exports.Settings.useTextExtraction = value;
  }

  function getUseGenerateThumbnails() {
    if (exports.Settings.useGenerateThumbnails === undefined) {
      exports.Settings.useGenerateThumbnails = exports.DefaultSettings.useGenerateThumbnails;
    }
    return exports.Settings.useGenerateThumbnails;
  }

  function setUseGenerateThumbnails(value) {

    exports.Settings.useGenerateThumbnails = value;
  }

  function getWriteMetaToSidecarFile() {
    if (exports.Settings.writeMetaToSidecarFile === undefined) {
      exports.Settings.writeMetaToSidecarFile = exports.DefaultSettings.writeMetaToSidecarFile;
      saveSettings();
    }
    return exports.Settings.writeMetaToSidecarFile;
  }

  function setWriteMetaToSidecarFile(value) {

    exports.Settings.writeMetaToSidecarFile = value;
  }

  function getUseDefaultLocation() {
    if (exports.Settings.useDefaultLocation === undefined) {
      exports.Settings.useDefaultLocation = exports.DefaultSettings.useDefaultLocation;
      saveSettings();
    }
    return exports.Settings.useDefaultLocation;
  }

  function setUseDefaultLocation(value) {

    exports.Settings.useDefaultLocation = value;
  }
  function getColoredFileExtensionsEnabled() {
    if (exports.Settings.coloredFileExtensionsEnabled === undefined) {
      exports.Settings.coloredFileExtensionsEnabled = exports.DefaultSettings.coloredFileExtensionsEnabled;
      saveSettings();
    }
    return exports.Settings.coloredFileExtensionsEnabled;
  }

  function setColoredFileExtensionsEnabled(value) {

    exports.Settings.coloredFileExtensionsEnabled = value;
  }

  //////////////////// API methods ///////////////////
  function getFileTypeEditor(fileTypeExt) {
    for (var i = 0; i < exports.Settings.supportedFileTypes.length; i++) {
      if (exports.Settings.supportedFileTypes[i].type === fileTypeExt) {
        return exports.Settings.supportedFileTypes[i].editor;
      }
    }
    return false;
  }

  function getFileTypeViewer(fileTypeExt) {
    for (var i = 0; i < exports.Settings.supportedFileTypes.length; i++) {
      if (exports.Settings.supportedFileTypes[i].type === fileTypeExt) {
        return exports.Settings.supportedFileTypes[i].viewer;
      }
    }
    return false;
  }

  // Returns the tag information from the setting for a given tag
  function findTag(tagName) {
    for (var i = 0; i < exports.Settings.tagGroups.length; i++) {
      for (var j = 0; j < exports.Settings.tagGroups[i].children.length; j++) {
        // console.log("Current tagname "+exports.Settings.tagGroups[i].children[j].title);
        if (exports.Settings.tagGroups[i].children[j].title === tagName) {
          return exports.Settings.tagGroups[i].children[j];
        }
      }
    }
    return false;
  }

  function getAllTags() {
    var allTags = [];
    for (var i = 0; i < exports.Settings.tagGroups.length; i++) {
      // console.log("Current taggroup "+exports.Settings.tagGroups[i].key);
      for (var j = 0; j < exports.Settings.tagGroups[i].children.length; j++) {
        // console.log("Current tagname "+exports.Settings.tagGroups[i].children[j].title);
        if (exports.Settings.tagGroups[i].children[j].type === 'plain') {
          allTags.push(exports.Settings.tagGroups[i].children[j].title);
        }
      }
    }
    return allTags;
  }

  function getTagData(tagTitle, tagGroupKey) {
    for (var i = 0; i < exports.Settings.tagGroups.length; i++) {
      if (exports.Settings.tagGroups[i].key === tagGroupKey) {
        for (var j = 0; j < exports.Settings.tagGroups[i].children.length; j++) {
          if (exports.Settings.tagGroups[i].children[j].title === tagTitle) {
            return exports.Settings.tagGroups[i].children[j];
          }
        }
      }
    }
  }

  function getTagGroupData(tagGroupKey) {
    for (var i = 0; i < exports.Settings.tagGroups.length; i++) {
      if (exports.Settings.tagGroups[i].key === tagGroupKey) {
        return exports.Settings.tagGroups[i];
      }
    }
  }

  function getAllTagGroupData() {
    if (exports.Settings.tagGroups.length > 0) {
      return exports.Settings.tagGroups;
    }
  }

  function deleteTagGroup(tagData) {
    for (var i = 0; i < exports.Settings.tagGroups.length; i++) {
      if (exports.Settings.tagGroups[i].key === tagData.key) {
        console.log('Deleting taggroup ' + exports.Settings.tagGroups[i].key);
        exports.Settings.tagGroups.splice(i, 1);
        break;
      }
    }
    saveSettings();
  }

  function editTag(tagData, newTagName, newColor, newTextColor, newKeyBinding) {
    for (var i = 0; i < exports.Settings.tagGroups.length; i++) {
      if (exports.Settings.tagGroups[i].key === tagData.parentKey) {
        for (var j = 0; j < exports.Settings.tagGroups[i].children.length; j++) {
          if (exports.Settings.tagGroups[i].children[j].title === tagData.title) {
            exports.Settings.tagGroups[i].children[j].title = newTagName;
            exports.Settings.tagGroups[i].children[j].color = newColor;
            exports.Settings.tagGroups[i].children[j].textcolor = newTextColor;
            exports.Settings.tagGroups[i].children[j].keyBinding = newKeyBinding;
            break;
          }
        }
      }
    }
    saveSettings();
  }

  function deleteTag(tagData) {
    for (var i = 0; i < exports.Settings.tagGroups.length; i++) {
      if (exports.Settings.tagGroups[i].key === tagData.parentKey) {
        for (var j = 0; j < exports.Settings.tagGroups[i].children.length; j++) {
          if (exports.Settings.tagGroups[i].children[j].title === tagData.title) {
            exports.Settings.tagGroups[i].children.splice(j, 1);
            break;
          }
        }
      }
    }
    exports.saveSettings();
  }

  function moveTag(tagData, targetTagGroupKey) {
    var targetTagGroupData = getTagGroupData(targetTagGroupKey);
    if (createTag(targetTagGroupData, tagData.title, tagData.color, tagData.textcolor)) {
      deleteTag(tagData);
      saveSettings();
    }
  }

  function createTag(tagData, newTagName, newTagColor, newTagTextColor) {
    exports.Settings.tagGroups.forEach(function(value) {
      if (value.key === tagData.key) {
        //console.log("Creating tag: "+newTagName+" with parent: "+tagData.key);
        var tagExistsInGroup = false;
        value.children.forEach(function(child) {
          if (child.title === newTagName) {
            tagExistsInGroup = true;
          }
        });
        // Create tag if it is not existing in the current group
        if (!tagExistsInGroup && newTagName.length >= 1) {
          var newTagModel = JSON.parse(JSON.stringify(tagTemplate));
          newTagModel.title = newTagName;
          newTagModel.color = newTagColor;
          newTagModel.textcolor = newTagTextColor;
          value.children.push(newTagModel);
        } else {
          console.log('Tag with the same name already exist in this group or tag length is not correct');
        }
      }
    });
    saveSettings();
    return true;
  }

  function editTagGroup(tagData, tagGroupName) {
    for (var i = 0; i < exports.Settings.tagGroups.length; i++) {
      if (exports.Settings.tagGroups[i].key === tagData.key) {
        exports.Settings.tagGroups[i].title = tagGroupName;
        break;
      }
    }
    saveSettings();
  }

  function duplicateTagGroup(tagData, tagGroupName, tagGroupKey) {
    var newTagGroupModel;
    for (var i = 0; i < exports.Settings.tagGroups.length; i++) {
      if (exports.Settings.tagGroups[i].key === tagData.key) {
        newTagGroupModel = JSON.parse(JSON.stringify(exports.Settings.tagGroups[i]));
        break;
      }
    }
    newTagGroupModel.title = tagGroupName;
    newTagGroupModel.key = tagGroupKey;
    console.log('Creating taggroup: ' + JSON.stringify(newTagGroupModel) + ' with key: ' + tagGroupKey);
    exports.Settings.tagGroups.push(newTagGroupModel);
    saveSettings();
  }

  function sortTagGroup(tagData) {
    for (var i = 0; i < exports.Settings.tagGroups.length; i++) {
      if (exports.Settings.tagGroups[i].key === tagData.key) {
        exports.Settings.tagGroups[i].children.sort(function(a, b) {
          return a.title.localeCompare(b.title);
        });
        break;
      }
    }
    saveSettings();
  }

  function createTagGroup(tagData, tagGroupName) {
    var newTagGroupModel = JSON.parse(JSON.stringify(tagGroupTemplate));
    newTagGroupModel.title = tagGroupName;
    //newTagGroupModel.children = [];
    newTagGroupModel.key = '' + TSCORE.Utils.getRandomInt(10000, 99999);
    console.log('Creating taggroup: ' + JSON.stringify(newTagGroupModel) + ' with key: ' + newTagGroupModel.key);
    exports.Settings.tagGroups.push(newTagGroupModel);
    saveSettings();
  }

  function moveTagGroup(tagData, direction) {
    var targetPosition;
    var currentPosition;
    exports.Settings.tagGroups.forEach(function(value, index) {
      if (value.key === tagData.key) {
        currentPosition = index;
      }
    });
    if (direction === 'up') {
      targetPosition = currentPosition - 1;
    }
    if (direction === 'down') {
      targetPosition = currentPosition + 1;
    }
    // Check if target position is within the taggroups array range
    if (targetPosition < 0 || targetPosition >= exports.Settings.tagGroups.length || targetPosition === currentPosition) {
      return false;
    }
    var tmpTagGroup = exports.Settings.tagGroups[currentPosition];
    exports.Settings.tagGroups[currentPosition] = exports.Settings.tagGroups[targetPosition];
    exports.Settings.tagGroups[targetPosition] = tmpTagGroup;
    saveSettings();
  }

  function createLocation(name, location, perspectiveId) {
    var newLocationModel = JSON.parse(JSON.stringify(locationTemplate));
    name = name.replace('\\', '\\\\');
    name = name.replace('\\\\\\', '\\\\');
    name = name.replace('\\\\\\\\', '\\\\');
    newLocationModel.name = name;
    newLocationModel.path = location;
    newLocationModel.perspective = perspectiveId;
    var createLoc = true;
    exports.Settings.tagspacesList.forEach(function(value) {
      if (value.path === newLocationModel.path) {
        TSCORE.showAlertDialog($.i18n.t('ns.dialogs:selectedPathExistContentAlert'), $.i18n.t('ns.dialogs:selectedPathExistTitleAlert'));
        createLoc = false;
      }
      if (value.name === newLocationModel.name) {
        TSCORE.showAlertDialog($.i18n.t('ns.dialogs:selectedLocationNameExistContentAlert'), $.i18n.t('ns.dialogs:selectedLocationNameExistTitleAlert'));
        createLoc = false;
      }
    });
    if (createLoc) {
      exports.Settings.tagspacesList.push(newLocationModel);
      saveSettings();
    }
  }

  function editLocation(oldName, newName, newLocation, perspectiveId) {
    //        name = name.replace("\\", "\\\\");
    //        name = name.replace("\\\\\\", "\\\\");
    //        name = name.replace("\\\\\\\\", "\\\\");   
    console.log('Old Name: ' + oldName + ' New Name: ' + newName + ' New Loc: ' + newLocation);
    var editLoc = true;
    exports.Settings.tagspacesList.forEach(function(value) {
      /* if(value.path == newLocation) {
       TSCORE.showAlertDialog("Selected path is already used by a location!","Duplicated Location Path");
       editLocation = false;
       }  */
      if (value.name === newName && value.name !== oldName) {
        TSCORE.showAlertDialog($.i18n.t('ns.dialogs:selectedLocationNameExistContentAlert'), $.i18n.t('ns.dialogs:selectedLocationNameExistTitleAlert'));
        editLoc = false;
      }
    });
    if (editLoc) {
      exports.Settings.tagspacesList.forEach(function(value) {
        if (value.name === oldName) {
          value.name = newName;
          value.path = newLocation;
          value.perspective = perspectiveId;
        }
      });
      saveSettings();
    }
  }

  function getLocation(path) {
    var location;
    exports.Settings.tagspacesList.forEach(function(value) {
      if (value.path === path) {
        location = value;
      }
    });
    return location;
  }

  function deleteLocation(name) {
    for (var i = 0; i < exports.Settings.tagspacesList.length; i++) {
      console.log('Traversing connections ' + exports.Settings.tagspacesList[i].name + ' searching for ' + name);
      if (exports.Settings.tagspacesList[i].name === name) {
        console.log('Deleting connections ' + exports.Settings.tagspacesList[i].name);
        exports.Settings.tagspacesList.splice(i, 1);
        break;
      }
    }
    saveSettings();
  }

  function updateSettingMozillaPreferences(settings) {
    var tmpSettings = JSON.parse(settings);
    if (tmpSettings !== null) {
      exports.Settings = tmpSettings;
      console.log('Settings loaded from firefox preferences: ' + tmpSettings);
    } else {
      exports.Settings = exports.DefaultSettings;
      console.log('Default settings loaded(Firefox)!');
    }
    saveSettings();
  }

  function loadDefaultSettings() {
    exports.Settings = exports.DefaultSettings;
    saveSettings();
    TSCORE.reloadUI();
    console.log('Default settings loaded.');
  }

  function loadSettingsLocalStorage() {
    try {
      var tmpSettings = JSON.parse(localStorage.getItem('tagSpacesSettings'));
      //Cordova try to load saved setting in app storage
      if (isCordova) {
        var appStorageSettings = JSON.parse(TSCORE.IO.loadSettings());
        var appStorageTagGroups = JSON.parse(TSCORE.IO.loadSettingsTags());
        if (appStorageSettings) {
          tmpSettings = appStorageSettings;
        }
        if (appStorageTagGroups) {
          tmpSettings.tagGroups = appStorageTagGroups.tagGroups;
        }
      }
      //console.log("Settings: "+JSON.stringify(tmpSettings));        
      if (tmpSettings !== null) {
        exports.Settings = tmpSettings;
      } else {
        // If no settings found in the local storage,
        // the application runs for the first time.
        firstRun = true;
      }
      console.log('Loaded settings from local storage: '); //+ JSON.stringify(exports.Settings));
    } catch (ex) {
      console.log('Loading settings from local storage failed due exception: ' + ex);
    }
  }

  // Save setting
  function saveSettings() {
    // TODO Make a file based json backup
    // Making a backup of the last settings
    localStorage.setItem('tagSpacesSettingsBackup1', localStorage.getItem('tagSpacesSettings'));
    // Storing setting in the local storage of mozilla and chorme
    localStorage.setItem('tagSpacesSettings', JSON.stringify(exports.Settings));
    // Storing settings in firefox native preferences
    if (isFirefox || isChrome || isCordova) {
      TSCORE.IO.saveSettings(JSON.stringify(exports.Settings));
      if (isCordova) {
        TSCORE.IO.saveSettingsTags(JSON.stringify(exports.Settings.tagGroups));
      }
    }
    console.log('Tagspace Settings Saved!');
  }

  function updateKeyBindingsSetting() {
    if (exports.Settings.keyBindings === undefined) {
      exports.Settings.keyBindings = exports.DefaultSettings.keyBindings;
      saveSettings();
    }
  }

  // Public API definition
  exports.upgradeSettings = upgradeSettings;
  exports.getActivatedPerspectives = getActivatedPerspectives;
  exports.setActivatedPerspectives = setActivatedPerspectives;
  exports.getExtensions = getExtensions;
  exports.setExtensions = setExtensions;
  exports.getPerspectiveExtensions = getPerspectiveExtensions;
  exports.getViewerExtensions = getViewerExtensions;
  exports.getEditorExtensions = getEditorExtensions;
  exports.isFirstRun = isFirstRun;
  exports.getExtensionPath = getExtensionPath;
  exports.setExtensionPath = setExtensionPath;
  exports.getShowUnixHiddenEntries = getShowUnixHiddenEntries;
  exports.setShowUnixHiddenEntries = setShowUnixHiddenEntries;
  exports.getCheckForUpdates = getCheckForUpdates;
  exports.setCheckForUpdates = setCheckForUpdates;
  exports.getSupportedFileTypes = getSupportedFileTypes;
  exports.setSupportedFileTypes = setSupportedFileTypes;
  exports.setPrefixTagContainer = setPrefixTagContainer;
  exports.getPrefixTagContainer = getPrefixTagContainer;
  exports.getTagDelimiter = getTagDelimiter;
  exports.setTagDelimiter = setTagDelimiter;
  exports.getShowMainMenu = getShowMainMenu;
  exports.setShowMainMenu = setShowMainMenu;
  exports.getWebDavPath = getWebDavPath;
  exports.setWebDavPath = setWebDavPath;
  exports.getCalculateTags = getCalculateTags;
  exports.setCalculateTags = setCalculateTags;
  exports.getLoadLocationMeta = getLoadLocationMeta;
  exports.setLoadLocationMeta = setLoadLocationMeta;
  exports.getUseSearchInSubfolders = getUseSearchInSubfolders;
  exports.setUseSearchInSubfolders = setUseSearchInSubfolders;
  exports.getMaxSearchResultCount = getMaxSearchResultCount;
  exports.setMaxSearchResultCount = setMaxSearchResultCount;
  exports.getWatchCurrentDirectory = getWatchCurrentDirectory;
  exports.setWatchCurrentDirectory = setWatchCurrentDirectory;
  exports.setEnableMetaData = setEnableMetaData;
  exports.getEnableMetaData = getEnableMetaData;
  exports.getIsWindowMaximized = getIsWindowMaximized;
  exports.setIsWindowMaximized = setIsWindowMaximized;
  exports.getLastOpenedLocation = getLastOpenedLocation;
  exports.setLastOpenedLocation = setLastOpenedLocation;
  exports.getShowWarningRecursiveScan = getShowWarningRecursiveScan;
  exports.setShowWarningRecursiveScan = setShowWarningRecursiveScan;
  exports.getSupportedLanguages = getSupportedLanguages;
  exports.getInterfaceLanguage = getInterfaceLanguage;
  exports.setInterfaceLanguage = setInterfaceLanguage;
  exports.getCloseViewerKeyBinding = getCloseViewerKeyBinding;
  exports.setCloseViewerKeyBinding = setCloseViewerKeyBinding;
  exports.getAddRemoveTagsKeyBinding = getAddRemoveTagsKeyBinding;
  exports.setAddRemoveTagsKeyBinding = setAddRemoveTagsKeyBinding;
  exports.getEditDocumentKeyBinding = getEditDocumentKeyBinding;
  exports.setEditDocumentKeyBinding = setEditDocumentKeyBinding;
  exports.getOpenDevToolsScreenKeyBinding = getOpenDevToolsScreenKeyBinding;
  exports.setOpenDevToolsScreenKeyBinding = setOpenDevToolsScreenKeyBinding;
  exports.getToggleFullScreenKeyBinding = getToggleFullScreenKeyBinding;
  exports.setToggleFullScreenKeyBinding = setToggleFullScreenKeyBinding;
  exports.getReloadApplicationKeyBinding = getReloadApplicationKeyBinding;
  exports.setReloadApplicationKeyBinding = setReloadApplicationKeyBinding;
  exports.getSaveDocumentKeyBinding = getSaveDocumentKeyBinding;
  exports.setSaveDocumentKeyBinding = setSaveDocumentKeyBinding;
  exports.getReloadDocumentKeyBinding = getReloadDocumentKeyBinding;
  exports.setReloadDocumentKeyBinding = setReloadDocumentKeyBinding;
  exports.getSelectAllKeyBinding = getSelectAllKeyBinding;
  exports.setSelectAllKeyBinding = setSelectAllKeyBinding;
  exports.getRenamingFileKeyBinding = getRenamingFileKeyBinding;
  exports.setRenamingFileKeyBinding = setRenamingFileKeyBinding;
  exports.getDeleteDocumentKeyBinding = getDeleteDocumentKeyBinding;
  exports.setDeleteDocumentKeyBinding = setDeleteDocumentKeyBinding;
  exports.getPropertiesDocumentKeyBinding = getPropertiesDocumentKeyBinding;
  exports.setPropertiesDocumentKeyBinding = setPropertiesDocumentKeyBinding;
  exports.getNextDocumentKeyBinding = getNextDocumentKeyBinding;
  exports.setNextDocumentKeyBinding = setNextDocumentKeyBinding;
  exports.getPrevDocumentKeyBinding = getPrevDocumentKeyBinding;
  exports.setPrevDocumentKeyBinding = setPrevDocumentKeyBinding;
  exports.setShowTagLibraryKeyBinding = setShowTagLibraryKeyBinding;
  exports.getShowTagLibraryKeyBinding = getShowTagLibraryKeyBinding;
  exports.setShowFolderNavigatorKeyBinding = setShowFolderNavigatorKeyBinding;
  exports.getShowFolderNavigatorBinding = getShowFolderNavigatorBinding;
  exports.getSearchKeyBinding = getSearchKeyBinding;
  exports.setSearchKeyBinding = setSearchKeyBinding;
  exports.getDefaultLocation = getDefaultLocation;
  exports.setDefaultLocation = setDefaultLocation;
  exports.getUseTrashCan = getUseTrashCan;
  exports.setUseTrashCan = setUseTrashCan;
  exports.getUseOCR = getUseOCR;
  exports.setUseOCR = setUseOCR;
  exports.getUseTextExtraction = getUseTextExtraction;
  exports.setUseTextExtraction = setUseTextExtraction;
  exports.getUseGenerateThumbnails = getUseGenerateThumbnails;
  exports.setUseGenerateThumbnails = setUseGenerateThumbnails;

  exports.getNewTextFileContent = getNewTextFileContent;
  exports.getNewHTMLFileContent = getNewHTMLFileContent;
  exports.getNewMDFileContent = getNewMDFileContent;
  exports.getFileTypeEditor = getFileTypeEditor;
  exports.getFileTypeViewer = getFileTypeViewer;
  exports.getAllTags = getAllTags;

  exports.getTagData = getTagData;
  exports.getTagGroupData = getTagGroupData;
  exports.getAllTagGroupData = getAllTagGroupData;

  exports.deleteTag = deleteTag;
  exports.deleteTagGroup = deleteTagGroup;
  exports.editTag = editTag;
  exports.createTag = createTag;
  exports.findTag = findTag;
  exports.moveTag = moveTag;
  exports.editTagGroup = editTagGroup;
  exports.sortTagGroup = sortTagGroup;
  exports.moveTagGroup = moveTagGroup;
  exports.createTagGroup = createTagGroup;
  exports.duplicateTagGroup = duplicateTagGroup;
  exports.createLocation = createLocation;
  exports.editLocation = editLocation;
  exports.deleteLocation = deleteLocation;
  exports.getLocation = getLocation;
  exports.updateSettingMozillaPreferences = updateSettingMozillaPreferences;
  exports.loadSettingsLocalStorage = loadSettingsLocalStorage;
  exports.loadDefaultSettings = loadDefaultSettings;
  exports.saveSettings = saveSettings;
  exports.addTagGroup = addTagGroup;
  exports.setWriteMetaToSidecarFile = setWriteMetaToSidecarFile;
  exports.getWriteMetaToSidecarFile = getWriteMetaToSidecarFile;
  exports.getUseDefaultLocation = getUseDefaultLocation;
  exports.setUseDefaultLocation = setUseDefaultLocation;
  exports.getColoredFileExtensionsEnabled = getColoredFileExtensionsEnabled;
  exports.setColoredFileExtensionsEnabled = setColoredFileExtensionsEnabled;
});
