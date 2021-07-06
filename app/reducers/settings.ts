/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces UG (haftungsbeschraenkt)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License (version 3) as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import semver from 'semver';
import uuidv1 from 'uuid';
import i18n from '-/services/i18n';
import defaultSettings from './settings-default';
import PlatformIO from '-/services/platform-io';
import AppConfig from '-/config';
import versionMeta from '-/version.json';
import { actions as AppActions } from './app';
import { TS } from '-/tagspaces.namespace';

export const types = {
  UPGRADE_SETTINGS: 'SETTINGS/UPGRADE_SETTINGS',
  SET_LANGUAGE: 'SETTINGS/SET_LANGUAGE',
  TOGGLE_SHOWUNIXHIDDENENTRIES: 'SETTINGS/TOGGLE_SHOWUNIXHIDDENENTRIES',
  SET_DESKTOPMODE: 'SETTINGS/SET_DESKTOPMODE',
  SET_SAVE_TAGS_IN_LOCATION: 'SETTINGS/SET_SAVE_TAGS_IN_LOCATION',
  SET_TAG_DELIMITER: 'SETTINGS/SET_TAG_DELIMITER',
  SET_MAX_SEARCH_RESULT: 'SETTINGS/SET_MAX_SEARCH_RESULT',
  SET_CHECKFORUPDATES: 'SETTINGS/SET_CHECKFORUPDATES',
  SET_USEDEFAULTLOCATION: 'SETTINGS/SET_USEDEFAULTLOCATION',
  SET_COLOREDFILEEXTENSION: 'SETTINGS/SET_COLOREDFILEEXTENSION',
  SET_SHOWTAGAREAONSTARTUP: 'SETTINGS/SET_SHOWTAGAREAONSTARTUP',
  SET_LOADSLOCATIONMETADATA: 'SETTINGS/SET_LOADSLOCATIONMETADATA',
  SET_SEARCHINSUBFOLDERS: 'SETTINGS/SET_SEARCHINSUBFOLDERS',
  SET_WATCHCURRENTDIRECTORY: 'SETTINGS/SET_WATCHCURRENTDIRECTORY',
  SET_APPDATAPATH: 'SETTINGS/SET_APPDATAPATH',
  SET_CONTENTHASH: 'SETTINGS/SET_CONTENTHASH',
  SET_UPDATEAVAILABLE: 'SETTINGS/SET_UPDATEAVAILABLE',
  SET_UPDATEINPROGRESS: 'SETTINGSAPP/SET_UPDATEINPROGRESS',
  SET_EMAIL: 'SETTINGS/SET_EMAIL',
  SET_CALCULATETAGS: 'SETTINGS/SET_CALCULATETAGS',
  SET_USETRASHCAN: 'SETTINGS/SET_USETRASHCAN',
  SET_PERSISTTAGSINSIDECARFILE: 'SETTINGS/SET_PERSISTTAGSINSIDECARFILE',
  SET_ADDTAGSTOLIBRARY: 'SETTINGS/SET_ADDTAGSTOLIBRARY',
  SET_USEGENERATETHUMBNAILS: 'SETTINGS/SET_USEGENERATETHUMBNAILS',
  SET_USETEXTEXTRACTION: 'SETTINGS/SET_USETEXTEXTRACTION',
  SET_TAGCOLOR: 'SETTINGS/SET_TAGCOLOR',
  SET_TAGTEXTCOLOR: 'SETTINGS/SET_TAGTEXTCOLOR',
  SET_CURRENTTHEME: 'SETTINGS/SET_CURRENTTHEME',
  SWITCH_THEME: 'SETTINGS/SWITCH_THEME',
  SET_KEYBINDING: 'SETTINGS/SET_KEYBINDING',
  SET_GLOBAL_KEYBINDING: 'SETTINGS/SET_GLOBAL_KEYBINDING',
  SET_ZOOM_RESET: 'SETTINGS/SET_ZOOM_RESET',
  SET_ZOOM_RESTORE: 'SETTINGS/SET_ZOOM_RESTORE',
  SET_ZOOM_IN: 'SETTINGS/SET_ZOOM_IN',
  SET_ZOOM_OUT: 'SETTINGS/SET_ZOOM_OUT',
  SET_SUPPORTED_FILE_TYPES: 'SETTINGS/SET_SUPPORTED_FILE_TYPES',
  SET_LAST_PUBLISHED_VERSION: 'SETTINGS/SET_LAST_PUBLISHED_VERSION',
  SET_ENTRY_PROPERTIES_SPLIT_SIZE: 'SETTINGS/SET_ENTRY_PROPERTIES_SPLIT_SIZE',
  SET_MAIN_VSPLIT_SIZE: 'SETTINGS/SET_MAIN_VSPLIT_SIZE',
  SET_LEFT_VSPLIT_SIZE: 'SETTINGS/SET_LEFT_VSPLIT_SIZE',
  SET_FIRST_RUN: 'SETTINGS/SET_FIRST_RUN',
  TOGGLE_TAGGROUP: 'TOGGLE_TAGGROUP',
  ADD_MAPTILE_SERVER: 'SET_MAPTILE_SERVER',
  EDIT_MAPTILE_SERVER: 'EDIT_MAPTILE_SERVER',
  DELETE_MAPTILE_SERVER: 'DELETE_MAPTILE_SERVER'
};

export default (state: any = defaultSettings, action: any) => {
  switch (action.type) {
    case types.UPGRADE_SETTINGS: {
      const mergedKeyBindings = defaultSettings.keyBindings.map(x =>
        Object.assign(
          x,
          state.keyBindings.find(y => y.name === x.name)
        )
      );
      const mergedFileTypes = defaultSettings.supportedFileTypes.map(x =>
        Object.assign(
          x,
          state.supportedFileTypes.find(y => y.type === x.type)
        )
      );
      const combinedFileTypes = state.supportedFileTypes.map(x =>
        Object.assign(
          x,
          mergedFileTypes.find(y => y.type === x.type)
        )
      );
      return {
        ...defaultSettings,
        ...state,
        currentTheme: window.ExtTheme || state.currentTheme,
        supportedThemes: defaultSettings.supportedThemes, // taking always the themes from default settings
        supportedLanguages: defaultSettings.supportedLanguages, // taking always the languages from default settings
        keyBindings: [
          // ...defaultSettings.keyBindings, // use to reset to the default key bindings
          ...mergedKeyBindings
        ],
        supportedFileTypes: [
          // ...defaultSettings.supportedFileTypes, // use to reset to the default file types
          ...combinedFileTypes
        ]
      };
    }
    case types.TOGGLE_SHOWUNIXHIDDENENTRIES: {
      return { ...state, showUnixHiddenEntries: !state.showUnixHiddenEntries };
    }
    case types.SET_TAG_DELIMITER: {
      return { ...state, tagDelimiter: action.delimiter };
    }
    case types.SET_MAX_SEARCH_RESULT: {
      return { ...state, maxSearchResult: action.maxSearchResult };
    }
    case types.SET_DESKTOPMODE: {
      return { ...state, desktopMode: action.desktopMode };
    }
    case types.SET_SAVE_TAGS_IN_LOCATION: {
      return { ...state, saveTagInLocation: action.saveTagInLocation };
    }
    case types.SET_CHECKFORUPDATES: {
      return { ...state, checkForUpdates: action.checkForUpdates };
    }
    case types.SET_USEDEFAULTLOCATION: {
      return { ...state, useDefaultLocation: action.useDefaultLocation };
    }
    case types.SET_COLOREDFILEEXTENSION: {
      return { ...state, coloredFileExtension: action.coloredFileExtension };
    }
    case types.SET_SHOWTAGAREAONSTARTUP: {
      return { ...state, showTagAreaOnStartup: action.showTagAreaOnStartup };
    }
    case types.SET_LOADSLOCATIONMETADATA: {
      return { ...state, loadsLocationMetaData: action.loadsLocationMetaData };
    }
    case types.SET_SEARCHINSUBFOLDERS: {
      return { ...state, searchInSubfolders: action.searchInSubfolders };
    }
    case types.SET_WATCHCURRENTDIRECTORY: {
      return { ...state, watchCurrentDirectory: action.watchCurrentDirectory };
    }
    case types.SET_FIRST_RUN: {
      return { ...state, firstRun: action.firstRun };
    }
    case types.SET_LANGUAGE: {
      i18n.changeLanguage(action.language);
      return { ...state, interfaceLanguage: action.language };
    }
    case types.SET_APPDATAPATH: {
      return { ...state, appDataPath: action.path };
    }
    case types.SET_CONTENTHASH: {
      return { ...state, contentHash: action.contentHash };
    }
    case types.SET_UPDATEAVAILABLE: {
      return { ...state, isUpdateAvailable: action.isUpdateAvailable };
    }
    case types.SET_UPDATEINPROGRESS: {
      return { ...state, isUpdateInProgress: action.isUpdateInProgress };
    }
    case types.SET_CALCULATETAGS: {
      return { ...state, calculateTags: action.calculateTags };
    }
    case types.SET_USETRASHCAN: {
      return { ...state, useTrashCan: action.useTrashCan };
    }
    case types.SET_PERSISTTAGSINSIDECARFILE: {
      return {
        ...state,
        persistTagsInSidecarFile: action.persistTagsInSidecarFile
      };
    }
    case types.SET_ADDTAGSTOLIBRARY: {
      return { ...state, addTagsToLibrary: action.addTagsToLibrary };
    }
    case types.SET_USEGENERATETHUMBNAILS: {
      return { ...state, useGenerateThumbnails: action.useGenerateThumbnails };
    }
    case types.SET_USETEXTEXTRACTION: {
      return { ...state, useTextExtraction: action.useTextExtraction };
    }
    case types.SET_EMAIL: {
      return {
        ...state,
        isLoading: true,
        email: action.email
      };
    }
    case types.SET_TAGCOLOR: {
      return { ...state, tagBackgroundColor: action.tagColor };
    }
    case types.SET_TAGTEXTCOLOR: {
      return { ...state, tagTextColor: action.tagTextColor };
    }
    case types.SET_CURRENTTHEME: {
      return { ...state, currentTheme: action.currentTheme };
    }
    case types.SWITCH_THEME: {
      let currentTheme = 'dark';
      if (state.currentTheme === 'dark') {
        currentTheme = 'light';
      }
      return { ...state, currentTheme };
    }
    case types.SET_KEYBINDING: {
      let indexForEditing = -1;
      state.keyBindings.map((kb, index) => {
        if (kb.name === action.keyBindingName) {
          indexForEditing = index;
        }
        return true;
      });
      if (indexForEditing >= 0) {
        return {
          ...state,
          keyBindings: [
            ...state.keyBindings.slice(0, indexForEditing),
            { name: action.keyBindingName, command: action.keyBindingCommand },
            ...state.keyBindings.slice(indexForEditing + 1)
          ]
        };
      }
      return state;
    }
    case types.SET_GLOBAL_KEYBINDING: {
      return {
        ...state,
        enableGlobalKeyboardShortcuts: action.enableGlobalKeyboardShortcuts
      };
    }
    case types.SET_ZOOM_RESET: {
      PlatformIO.setZoomFactorElectron(1);
      return { ...state, zoomFactor: 1 };
    }
    case types.SET_ZOOM_RESTORE: {
      PlatformIO.setZoomFactorElectron(state.zoomFactor);
      return state;
    }
    case types.SET_ZOOM_IN: {
      let zoomLevel = state.zoomFactor;
      const offSet = 0.1;
      const correctedOffset = offSet * 4;
      const threshold = zoomLevel + correctedOffset;
      if (zoomLevel.toPrecision(2) <= threshold) {
        zoomLevel += offSet;
        PlatformIO.setZoomFactorElectron(zoomLevel);
      }
      return { ...state, zoomFactor: zoomLevel };
    }
    case types.SET_ZOOM_OUT: {
      let zoomLevel = state.zoomFactor;
      const offSet = 0.1;
      if (zoomLevel.toPrecision(2) > offSet * 4) {
        zoomLevel -= offSet;
        PlatformIO.setZoomFactorElectron(zoomLevel);
      }
      return { ...state, zoomFactor: zoomLevel };
    }
    case types.SET_SUPPORTED_FILE_TYPES: {
      return {
        ...state,
        supportedFileTypes: action.supportedFileTypes
      };
    }
    case types.SET_ENTRY_PROPERTIES_SPLIT_SIZE: {
      return {
        ...state,
        entryPropertiesSplitSize: action.entryPropertiesSplitSize
      };
    }
    case types.SET_MAIN_VSPLIT_SIZE: {
      return {
        ...state,
        mainVerticalSplitSize: action.mainVerticalSplitSize
      };
    }
    case types.SET_LEFT_VSPLIT_SIZE: {
      return {
        ...state,
        leftVerticalSplitSize: action.leftVerticalSplitSize
      };
    }
    case types.SET_LAST_PUBLISHED_VERSION: {
      return {
        ...state,
        lastPublishedVersion: action.lastPublishedVersion
      };
    }
    case types.TOGGLE_TAGGROUP: {
      let tagGroupCollapsed;
      if (state.tagGroupCollapsed) {
        if (state.tagGroupCollapsed.includes(action.uuid)) {
          tagGroupCollapsed = state.tagGroupCollapsed.filter(
            tagGroupUUID => tagGroupUUID !== action.uuid
          );
        } else {
          tagGroupCollapsed = [...state.tagGroupCollapsed, action.uuid];
        }
      } else {
        tagGroupCollapsed = [action.uuid];
      }
      return {
        ...state,
        tagGroupCollapsed
      };
    }
    case types.ADD_MAPTILE_SERVER: {
      let mapTileServers;
      if (action.isDefault) {
        mapTileServers = [
          { ...action.tileServer, uuid: uuidv1() },
          ...state.mapTileServers
        ];
      } else {
        mapTileServers = [
          ...state.mapTileServers,
          { ...action.tileServer, uuid: uuidv1() }
        ];
      }
      return {
        ...state,
        mapTileServers
      };
    }
    case types.EDIT_MAPTILE_SERVER: {
      let mapTileServers;
      if (action.isDefault) {
        mapTileServers = [
          action.tileServer,
          ...state.mapTileServers.filter(
            tileServer => tileServer.uuid !== action.tileServer.uuid
          )
        ];
      } else {
        mapTileServers = [
          ...state.mapTileServers.filter(
            tileServer => tileServer.uuid !== action.tileServer.uuid
          ),
          action.tileServer
        ];
      }

      return {
        ...state,
        mapTileServers
      };
    }
    case types.DELETE_MAPTILE_SERVER: {
      const mapTileServers = state.mapTileServers.filter(
        tileServer => tileServer.uuid !== action.uuid
      );
      return {
        ...state,
        mapTileServers
      };
    }
    default: {
      return state;
    }
  }
};

export const actions = {
  addTileServers: (
    tileServer: TS.MapTileServer,
    isDefault: boolean = false
  ) => ({
    type: types.ADD_MAPTILE_SERVER,
    tileServer,
    isDefault
  }),
  editTileServers: (
    tileServer: TS.MapTileServer,
    isDefault: boolean = false
  ) => ({
    type: types.EDIT_MAPTILE_SERVER,
    tileServer,
    isDefault
  }),
  deleteTileServer: (uuid: string) => ({
    type: types.DELETE_MAPTILE_SERVER,
    uuid
  }),
  toggleTagGroup: (tagGroupUUID: string) => ({
    type: types.TOGGLE_TAGGROUP,
    uuid: tagGroupUUID
  }),
  setTagDelimiter: (delimiter: string) => ({
    type: types.SET_TAG_DELIMITER,
    delimiter
  }),
  setMaxSearchResult: (maxSearchResult: number) => ({
    type: types.SET_MAX_SEARCH_RESULT,
    maxSearchResult
  }),
  setDesktopMode: (desktopMode: boolean) => ({
    type: types.SET_DESKTOPMODE,
    desktopMode
  }),
  setSaveTagInLocation: (saveTagInLocation: boolean) => ({
    type: types.SET_SAVE_TAGS_IN_LOCATION,
    saveTagInLocation
  }),
  toggleShowUnixHiddenEntries: () => ({
    type: types.TOGGLE_SHOWUNIXHIDDENENTRIES
  }),
  setCheckForUpdates: (checkForUpdates: boolean) => ({
    type: types.SET_CHECKFORUPDATES,
    checkForUpdates
  }),
  setLanguage: (language: string) => ({ type: types.SET_LANGUAGE, language }),
  setUseDefaultLocation: (useDefaultLocation: boolean) => ({
    type: types.SET_USEDEFAULTLOCATION,
    useDefaultLocation
  }),
  setColoredFileExtension: (coloredFileExtension: boolean) => ({
    type: types.SET_COLOREDFILEEXTENSION,
    coloredFileExtension
  }),
  setShowTagAreaOnStartup: (showTagAreaOnStartup: boolean) => ({
    type: types.SET_SHOWTAGAREAONSTARTUP,
    showTagAreaOnStartup
  }),
  setLoadsLocationMetaData: (loadsLocationMetaData: boolean) => ({
    type: types.SET_LOADSLOCATIONMETADATA,
    loadsLocationMetaData
  }),
  setSearchInSubfolders: (searchInSubfolders: boolean) => ({
    type: types.SET_SEARCHINSUBFOLDERS,
    searchInSubfolders
  }),
  setWatchCurrentDirectory: (watchCurrentDirectory: boolean) => ({
    type: types.SET_WATCHCURRENTDIRECTORY,
    watchCurrentDirectory
  }),
  setCalculateTags: (calculateTags: boolean) => ({
    type: types.SET_CALCULATETAGS,
    calculateTags
  }),
  setUseTrashCan: (useTrashCan: boolean) => ({
    type: types.SET_USETRASHCAN,
    useTrashCan
  }),
  setPersistTagsInSidecarFile: (persistTagsInSidecarFile: boolean) => ({
    type: types.SET_PERSISTTAGSINSIDECARFILE,
    persistTagsInSidecarFile
  }),
  setAddTagsToLibrary: (addTagsToLibrary: boolean) => ({
    type: types.SET_ADDTAGSTOLIBRARY,
    addTagsToLibrary
  }),
  setUseGenerateThumbnails: (useGenerateThumbnails: boolean) => ({
    type: types.SET_USEGENERATETHUMBNAILS,
    useGenerateThumbnails
  }),
  setUseTextExtraction: (useTextExtraction: boolean) => ({
    type: types.SET_USETEXTEXTRACTION,
    useTextExtraction
  }),
  setAppDataPath: (path: string) => ({ type: types.SET_APPDATAPATH, path }),
  setContentHash: (contentHash: string) => ({
    type: types.SET_CONTENTHASH,
    contentHash
  }),
  setEmail: (email: string) => ({ type: types.SET_EMAIL, email }),
  setZoomRestoreApp: () => ({ type: types.SET_ZOOM_RESTORE }),
  setZoomResetApp: () => ({ type: types.SET_ZOOM_RESET }),
  setZoomInApp: () => ({ type: types.SET_ZOOM_IN }),
  setZoomOutApp: () => ({ type: types.SET_ZOOM_OUT }),
  setTagColor: (tagColor: string) => ({ type: types.SET_TAGCOLOR, tagColor }),
  setTagTextColor: (tagTextColor: string) => ({
    type: types.SET_TAGTEXTCOLOR,
    tagTextColor
  }),
  setCurrentTheme: (currentTheme: string) => ({
    type: types.SET_CURRENTTHEME,
    currentTheme
  }),
  switchTheme: () => ({ type: types.SWITCH_THEME }),
  setKeyBinding: (keyBindingName: string, keyBindingCommand: string) => ({
    type: types.SET_KEYBINDING,
    keyBindingName,
    keyBindingCommand
  }),
  setGlobalKeyBinding: (enableGlobalKeyboardShortcuts: boolean) => ({
    type: types.SET_GLOBAL_KEYBINDING,
    enableGlobalKeyboardShortcuts
  }),
  setSupportedFileTypes: (supportedFileTypes: []) => ({
    type: types.SET_SUPPORTED_FILE_TYPES,
    supportedFileTypes
  }),
  setEntryPropertiesSplitSize: (entryPropertiesSplitSize: number) => ({
    type: types.SET_ENTRY_PROPERTIES_SPLIT_SIZE,
    entryPropertiesSplitSize
  }),
  setMainVerticalSplitSize: (mainVerticalSplitSize: any) => ({
    type: types.SET_MAIN_VSPLIT_SIZE,
    mainVerticalSplitSize
  }),
  setLeftVerticalSplitSize: (leftVerticalSplitSize: number) => ({
    type: types.SET_LEFT_VSPLIT_SIZE,
    leftVerticalSplitSize
  }),
  setFirstRun: (firstRun: boolean) => ({
    type: types.SET_FIRST_RUN,
    firstRun
  }),
  upgradeSettings: () => ({
    type: types.UPGRADE_SETTINGS
  }),
  setLastPublishedVersion: (lastPublishedVersion: string) => ({
    type: types.SET_LAST_PUBLISHED_VERSION,
    lastPublishedVersion
  }),
  checkForUpdate: () => (
    dispatch: (actions: Object) => void
    // getState: () => any
  ) => {
    // const { settings } = getState();
    getLastVersionPromise()
      .then(lastVersion => {
        console.log('Last version on server: ' + lastVersion);
        const newVersion = semver.coerce(lastVersion); // lastVersion '3.0.5' ;
        const currentVersion = semver.coerce(versionMeta.version);
        // const lastPublishedVersion = semver.coerce(settings.lastPublishedVersion);
        if (semver.valid(newVersion) && semver.gt(newVersion, currentVersion)) {
          console.log('New version available: ' + newVersion.version + '!');
          dispatch(actions.setLastPublishedVersion(newVersion.version));
          // if (semver.gt(newVersion, lastPublishedVersion)) {
          dispatch(AppActions.setUpdateAvailable(true));
          // }
        } else {
          console.log(
            'Current version: ' + versionMeta.version + ' is up to date'
          );
        }
        return true;
      })
      .catch(error => {
        console.warn('Error while checking for update: ' + error);
      });
  }
};

export function getLastVersionPromise(): Promise<string> {
  return new Promise((resolve, reject) => {
    console.log('Checking for new version...');
    const xhr = new XMLHttpRequest();
    const updateUrl =
      AppConfig.links.checkNewVersionURL + '?cv=' + versionMeta.version;
    xhr.open('GET', updateUrl, true);
    xhr.responseType = 'json';
    xhr.onerror = reject;
    xhr.onload = () => {
      const data = xhr.response || xhr.responseText;
      // console.log('Response from server: ' + JSON.stringify(data));
      const versioningData = JSON.parse(JSON.stringify(data));
      if (versioningData.appVersion && versioningData.appVersion.length > 0) {
        resolve(versioningData.appVersion);
      } else {
        reject('Could not validate update data');
      }
    };
    xhr.send();
  });
}

// Selectors
export const getMapTileServer = (state: any): TS.MapTileServer =>
  AppConfig.mapTileServers
    ? AppConfig.mapTileServers[0]
    : state.settings.mapTileServers[0];
export const getMapTileServers = (state: any): Array<TS.MapTileServer> =>
  AppConfig.mapTileServers || state.settings.mapTileServers;
export const getSettings = (state: any) => state.settings;
export const getDesktopMode = (state: any) => {
  if (typeof window.ExtDisplayMode === 'undefined') {
    return state.settings.desktopMode;
  }
  return window.ExtDisplayMode !== 'mobile';
};
export const getCheckForUpdateOnStartup = (state: any) =>
  state.settings.checkForUpdates;
export const getLastPublishedVersion = (state: any) =>
  state.settings.lastPublishedVersion;
export const getShowUnixHiddenEntries = (state: any) =>
  state.settings.showUnixHiddenEntries;
export const getUseDefaultLocation = (state: any) =>
  state.settings.useDefaultLocation;
export const getColoredFileExtension = (state: any) =>
  state.settings.coloredFileExtension;
export const getShowTagAreaOnStartup = (state: any) =>
  state.settings.showTagAreaOnStartup;
export const getLoadsLocationMetaData = (state: any) =>
  state.settings.loadsLocationMetaData;
export const getSearchInSubfolders = (state: any) =>
  state.settings.searchInSubfolders;
export const getWatchCurrentDirectory = (state: any) =>
  state.settings.watchCurrentDirectory;
export const getCurrentLanguage = (state: any) =>
  state.settings.interfaceLanguage;
export const getAppDataPath = (state: any) => state.settings.appDataPath;
export const getSupportedLanguages = (state: any) => state.settings.languages;
export const getCalculateTags = (state: any) => state.settings.calculateTags;
export const getUseTrashCan = (state: any) => state.settings.useTrashCan;
export const getPersistTagsInSidecarFile = (state: any) =>
  AppConfig.useSidecarsForFileTaggingDisableSetting
    ? AppConfig.useSidecarsForFileTagging
    : state.settings.persistTagsInSidecarFile;
export const getUseGenerateThumbnails = (state: any) =>
  state.settings.useGenerateThumbnails;
export const getUseTextExtraction = (state: any) =>
  state.settings.useTextExtraction;
export const getKeyBindings = (state: any) => state.settings.keyBindings;
export const getKeyBindingObject = (state: any) =>
  generateKeyBindingObject(state.settings.keyBindings);
export const getSupportedFileTypes = (state: any) =>
  state.settings.supportedFileTypes;
/* export const getPerspectives = (state: any) =>
  state.settings.supportedPerspectives; */
export const getTagColor = (state: any) => state.settings.tagBackgroundColor;
export const getTagTextColor = (state: any) => state.settings.tagTextColor;
export const getCurrentTheme = (state: any) => state.settings.currentTheme;
export const isGlobalKeyBindingEnabled = (state: any) =>
  state.settings.enableGlobalKeyboardShortcuts;
export const getLeftVerticalSplitSize = (state: any) =>
  state.settings.leftVerticalSplitSize;
export const getMainVerticalSplitSize = (state: any) =>
  state.settings.mainVerticalSplitSize;
export const getTagDelimiter = (state: any) => state.settings.tagDelimiter;
export const getMaxSearchResults = (state: any) =>
  state.settings.maxSearchResult;
export const isDesktopMode = (state: any) => state.settings.desktopMode;
export const isFirstRun = (state: any) => {
  if (typeof window.ExtIsFirstRun === 'undefined') {
    return state.settings.firstRun;
  }
  return window.ExtIsFirstRun;
};

function generateKeyBindingObject(keyBindings: Array<Object>) {
  const kbObject = {};
  keyBindings.map((kb: any) => {
    kbObject[kb.name] = kb.command;
    return true;
  });
  return kbObject;
}
