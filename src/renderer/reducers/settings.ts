/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces GmbH
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

import AppConfig from '-/AppConfig';
import { AIProvider } from '-/components/chat/ChatTypes';
import { TabNames } from '-/hooks/EntryPropsTabsContextProvider';
import {
  getDefaultEditor,
  getDefaultViewer,
  getLastVersionPromise,
  mergeByProp,
  setZoomFactorElectron,
  updateByProp,
} from '-/services/utils-io';
import { mergeImportedSettings } from '-/services/export-import-validators';
import { TS } from '-/tagspaces.namespace';
import versionMeta from '-/version.json';
import { getUuid } from '@tagspaces/tagspaces-common/utils-io';
import semver from 'semver';
import { actions as AppActions } from './app';
import defaultSettings from './settings-default';

export const types = {
  UPGRADE_SETTINGS: 'SETTINGS/UPGRADE_SETTINGS',
  IMPORT_SETTINGS: 'SETTINGS/IMPORT_SETTINGS',
  SET_LANGUAGE: 'SETTINGS/SET_LANGUAGE',
  TOGGLE_SHOWUNIXHIDDENENTRIES: 'SETTINGS/TOGGLE_SHOWUNIXHIDDENENTRIES',
  TOGGLE_SHOWSYMBOLICLINKS: 'SETTINGS/TOGGLE_SHOWSYMBOLICLINKS',
  SET_ENTRY_CONTAINER_TAB: 'SETTINGS/SET_ENTRY_CONTAINER_TAB',
  SET_DESKTOPMODE: 'SETTINGS/SET_DESKTOPMODE',
  SET_USEONLYTAGSFROMTAGLIBRARY: 'SETTINGS/SET_USEONLYTAGSFROMTAGLIBRARY',
  SET_DEVMODE: 'SETTINGS/SET_DEVMODE',
  SET_ENABLE_WS: 'SETTINGS/SET_ENABLE_WS',
  SET_ENCRYPT_CREDENTIALS_AT_REST: 'SETTINGS/SET_ENCRYPT_CREDENTIALS_AT_REST',
  SET_ENCRYPT_CREDENTIALS_KEY_SOURCE:
    'SETTINGS/SET_ENCRYPT_CREDENTIALS_KEY_SOURCE',
  WARNING_OPENING_FILES_EXTERNALLY: 'SETTINGS/WARNING_OPENING_FILES_EXTERNALLY',
  SET_SAVE_TAGS_IN_LOCATION: 'SETTINGS/SET_SAVE_TAGS_IN_LOCATION',
  SET_TAG_DELIMITER: 'SETTINGS/SET_TAG_DELIMITER',
  SET_MAX_SEARCH_RESULT: 'SETTINGS/SET_MAX_SEARCH_RESULT',
  SET_CHECKFORUPDATES: 'SETTINGS/SET_CHECKFORUPDATES',
  SET_REORDER_TAGS: 'SETTINGS/SET_REORDER_TAGS',
  SET_DEFAULTPERSPECTIVE: 'SETTINGS/SET_DEFAULTPERSPECTIVE',
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
  SET_MAXCOLLECTEDTAG: 'SETTINGS/SET_MAXCOLLECTEDTAG',
  SET_FILENAMETAGPLACEDATEND: 'SETTINGS/SET_FILENAMETAGPLACEDATEND',
  SET_ADDTAGSTOLIBRARY: 'SETTINGS/SET_ADDTAGSTOLIBRARY',
  SET_REVISIONS_ENABLED: 'SETTINGS/SET_REVISIONS_ENABLED',
  SET_AI_PROVIDER: 'SETTINGS/SET_AI_PROVIDER',
  ADD_AI_PROVIDER: 'SETTINGS/ADD_AI_PROVIDER',
  REMOVE_AI_PROVIDER: 'SETTINGS/REMOVE_AI_PROVIDER',
  SET_AI_PROVIDERS: 'SETTINGS/SET_AI_PROVIDERS',
  SET_PREFIX_TAG_CONTAINER: 'SETTINGS/SET_PREFIX_TAG_CONTAINER',
  SET_AUTHOR: 'SETTINGS/SET_AUTHOR',
  SET_USEGENERATETHUMBNAILS: 'SETTINGS/SET_USEGENERATETHUMBNAILS',
  SET_TAGCOLOR: 'SETTINGS/SET_TAGCOLOR',
  SET_TAGTEXTCOLOR: 'SETTINGS/SET_TAGTEXTCOLOR',
  SET_DEFAULT_FOLDER_COLOR: 'SETTINGS/SET_DEFAULT_FOLDER_COLOR',
  SET_CURRENTTHEME: 'SETTINGS/SET_CURRENTTHEME',
  SET_CURRENT_REGULAR_THEME: 'SETTINGS/SET_CURRENT_REGULAR_THEME',
  SET_CURRENT_DARK_THEME: 'SETTINGS/SET_CURRENT_DARK_THEME',
  SET_GEO_TAGGING_FORMAT: 'SETTINGS/SET_GEO_TAGGING_FORMAT',
  SET_HISTORY: 'SETTINGS/SET_HISTORY',
  SWITCH_THEME: 'SETTINGS/SWITCH_THEME',
  SET_KEYBINDING: 'SETTINGS/SET_KEYBINDING',
  SET_GLOBAL_KEYBINDING: 'SETTINGS/SET_GLOBAL_KEYBINDING',
  SET_ZOOM_RESET: 'SETTINGS/SET_ZOOM_RESET',
  SET_ZOOM_RESTORE: 'SETTINGS/SET_ZOOM_RESTORE',
  SET_ZOOM_IN: 'SETTINGS/SET_ZOOM_IN',
  SET_ZOOM_OUT: 'SETTINGS/SET_ZOOM_OUT',
  SET_SUPPORTED_FILE_TYPES: 'SETTINGS/SET_SUPPORTED_FILE_TYPES',
  ADD_SUPPORTED_FILE_TYPES: 'SETTINGS/ADD_SUPPORTED_FILE_TYPES',
  REMOVE_SUPPORTED_FILE_TYPES: 'SETTINGS/REMOVE_SUPPORTED_FILE_TYPES',
  SET_LAST_PUBLISHED_VERSION: 'SETTINGS/SET_LAST_PUBLISHED_VERSION',
  SET_ENTRY_PROPERTIES_SPLIT_SIZE: 'SETTINGS/SET_ENTRY_PROPERTIES_SPLIT_SIZE',
  SET_MAIN_VSPLIT_SIZE: 'SETTINGS/SET_MAIN_VSPLIT_SIZE',
  SET_LEFT_PANEL_WIDTH: 'SETTINGS/SET_LEFT_PANEL_WIDTH',
  SET_FIRST_RUN: 'SETTINGS/SET_FIRST_RUN',
  SET_ONBOARDING_COMPLETED: 'SETTINGS/SET_ONBOARDING_COMPLETED',
  SET_HIDE_HOWTOSTART: 'SETTINGS/SET_HIDE_HOWTOSTART',
  SET_ONBOARDING_VERSION: 'SETTINGS/SET_ONBOARDING_VERSION',
  TOGGLE_TAGGROUP: 'TOGGLE_TAGGROUP',
  ADD_MAPTILE_SERVER: 'SET_MAPTILE_SERVER',
  EDIT_MAPTILE_SERVER: 'EDIT_MAPTILE_SERVER',
  DELETE_MAPTILE_SERVER: 'DELETE_MAPTILE_SERVER',
  SET_STORED_SEARCHES_VISIBLE: 'SET_STORED_SEARCHES_VISIBLE',
  SET_SHOW_BOOKMARKS: 'SET_SHOW_BOOKMARKS',
  SET_FILE_OPEN_HISTORY: 'SET_FILE_OPEN_HISTORY',
  SET_FOLDER_OPEN_HISTORY: 'SET_FOLDER_OPEN_HISTORY',
  SET_FILE_EDIT_HISTORY: 'SET_FILE_EDIT_HISTORY',
  SET_LAST_MOVE_COPY_MODE: 'SETTINGS/SET_LAST_MOVE_COPY_MODE',
  SET_LAST_LINK_TYPE: 'SETTINGS/SET_LAST_LINK_TYPE',
  SET_HIDE_PRO_FEATURES: 'SETTINGS/SET_HIDE_PRO_FEATURES',
  SET_AUTO_SAVE_DESCRIPTION: 'SETTINGS/SET_AUTO_SAVE_DESCRIPTION',
  SET_PERSPECTIVE_ENABLED: 'SETTINGS/SET_PERSPECTIVE_ENABLED',
  SET_ENABLED_PERSPECTIVES: 'SETTINGS/SET_ENABLED_PERSPECTIVES',
  MARK_PERSPECTIVE_ONBOARDING_SEEN: 'SETTINGS/MARK_PERSPECTIVE_ONBOARDING_SEEN',
  RESET_PERSPECTIVE_ONBOARDING: 'SETTINGS/RESET_PERSPECTIVE_ONBOARDING',
};

function generateUniqueName(array: Array<any>, baseName: string): string {
  let uniqueName = baseName;
  let count = 1;

  while (array.some((item) => item.name === uniqueName)) {
    uniqueName = `${baseName}${count}`;
    count++;
  }

  return uniqueName;
}

export default (state: any = defaultSettings, action: any) => {
  switch (action.type) {
    case types.UPGRADE_SETTINGS: {
      // const currentVersion = semver.coerce(versionMeta.version);
      // console.log('---->' + currentVersion);

      const mergedKeyBindings = defaultSettings.keyBindings.map((x) =>
        Object.assign(
          x,
          state.keyBindings.find((y) => y.name === x.name),
        ),
      );

      const explicitlyDeletedTypes = state.explicitlyDeletedFileTypes || [];
      const defaultFileTypes = defaultSettings.supportedFileTypes.filter(
        (item) => !explicitlyDeletedTypes.includes(item.type),
      );
      return {
        ...defaultSettings,
        ...state,
        currentTheme: AppConfig.ExtTheme || state.currentTheme,
        currentRegularTheme:
          AppConfig.ExtRegularTheme || state.currentRegularTheme,
        currentDarkTheme: AppConfig.ExtDarkTheme || state.currentDarkTheme,
        supportedThemes: defaultSettings.supportedThemes, // taking always the themes from default settings
        supportedLanguages: defaultSettings.supportedLanguages, // taking always the languages from default settings
        keyBindings: [
          // ...defaultSettings.keyBindings, // use to reset to the default key bindings
          ...mergedKeyBindings,
        ],
        supportedFileTypes: mergeByProp(
          defaultFileTypes,
          state.supportedFileTypes,
          'type',
        ),
        extensionsFound: defaultSettings.extensionsFound.map((ext) => {
          const stateExtension = state.extensionsFound.find(
            (ex) => ex.extensionId === ext.extensionId,
          );
          if (stateExtension) {
            return {
              ...ext,
              extensionEnabled: stateExtension.extensionEnabled,
            };
          }
          return ext;
        }),
      };
    }
    case types.IMPORT_SETTINGS: {
      // Merge imported settings over the current (trusted) state — never over
      // defaults — so a partial/old file can't wipe local-only preferences.
      return mergeImportedSettings(
        state,
        action.settings,
        defaultSettings.keyBindings,
      );
    }
    case types.TOGGLE_SHOWUNIXHIDDENENTRIES: {
      return { ...state, showUnixHiddenEntries: !state.showUnixHiddenEntries };
    }
    case types.TOGGLE_SHOWSYMBOLICLINKS: {
      return { ...state, showSymbolicLinks: !state.showSymbolicLinks };
    }
    case types.SET_ENTRY_CONTAINER_TAB: {
      return { ...state, entryContainerTab: action.entryContainerTab };
    }
    case types.SET_TAG_DELIMITER: {
      return { ...state, tagDelimiter: action.delimiter };
    }
    case types.SET_MAX_SEARCH_RESULT: {
      return { ...state, maxSearchResult: action.maxSearchResult };
    }
    case types.SET_DEFAULTPERSPECTIVE: {
      return { ...state, defaultPerspective: action.defaultPerspective };
    }
    case types.SET_DESKTOPMODE: {
      return { ...state, desktopMode: action.desktopMode };
    }
    case types.SET_USEONLYTAGSFROMTAGLIBRARY: {
      return {
        ...state,
        useOnlyTagsFromTagLibrary: action.useOnlyTagsFromTagLibrary,
      };
    }
    case types.SET_DEVMODE: {
      return { ...state, devMode: action.devMode };
    }
    case types.SET_HIDE_PRO_FEATURES: {
      return { ...state, hideProFeatures: action.hideProFeatures };
    }
    case types.SET_AUTO_SAVE_DESCRIPTION: {
      return { ...state, autoSaveDescription: action.autoSaveDescription };
    }
    case types.SET_ENABLE_WS: {
      return { ...state, enableWS: action.enableWS };
    }
    case types.SET_ENCRYPT_CREDENTIALS_AT_REST: {
      return {
        ...state,
        encryptCredentialsAtRest: action.encryptCredentialsAtRest,
      };
    }
    case types.SET_ENCRYPT_CREDENTIALS_KEY_SOURCE: {
      return {
        ...state,
        encryptCredentialsKeySource: action.encryptCredentialsKeySource,
      };
    }
    case types.WARNING_OPENING_FILES_EXTERNALLY: {
      return {
        ...state,
        warningOpeningFilesExternally: action.warningOpeningFilesExternally,
      };
    }
    case types.SET_SAVE_TAGS_IN_LOCATION: {
      return { ...state, saveTagInLocation: action.saveTagInLocation };
    }
    case types.SET_CHECKFORUPDATES: {
      return { ...state, checkForUpdates: action.checkForUpdates };
    }
    case types.SET_REORDER_TAGS: {
      return { ...state, reorderTags: action.reorderTags };
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
    case types.SET_ONBOARDING_COMPLETED: {
      return { ...state, onboardingCompleted: action.onboardingCompleted };
    }
    case types.SET_HIDE_HOWTOSTART: {
      return { ...state, hideHowToStart: action.hideHowToStart };
    }
    case types.SET_ONBOARDING_VERSION: {
      return { ...state, onboardingVersion: action.onboardingVersion };
    }
    case types.SET_LANGUAGE: {
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
        persistTagsInSidecarFile: action.persistTagsInSidecarFile,
      };
    }
    case types.SET_MAXCOLLECTEDTAG: {
      return {
        ...state,
        maxCollectedTag: action.maxCollectedTag,
      };
    }
    case types.SET_FILENAMETAGPLACEDATEND: {
      return {
        ...state,
        filenameTagPlacedAtEnd: action.filenameTagPlacedAtEnd,
      };
    }
    case types.SET_ADDTAGSTOLIBRARY: {
      return { ...state, addTagsToLibrary: action.addTagsToLibrary };
    }
    case types.SET_REVISIONS_ENABLED: {
      return { ...state, isRevisionsEnabled: action.enabled };
    }
    case types.SET_AI_PROVIDER: {
      return { ...state, aiProviderId: action.aiProviderId };
    }
    case types.ADD_AI_PROVIDER: {
      if (
        state.aiProviders.some((item) => item.name === action.aiProvider.name)
      ) {
        action.aiProvider.name = generateUniqueName(
          state.aiProviders,
          action.aiProvider.name,
        );
      }
      return {
        ...state,
        aiProviders: [...state.aiProviders, action.aiProvider],
      };
    }
    case types.REMOVE_AI_PROVIDER: {
      return {
        ...state,
        aiProviders: state.aiProviders.filter(
          (provider) => provider.id !== action.id,
        ),
      };
    }
    case types.SET_AI_PROVIDERS: {
      return {
        ...state,
        aiProviders: action.aiProviders,
      };
    }
    case types.SET_PREFIX_TAG_CONTAINER: {
      return { ...state, prefixTagContainer: action.prefixTagContainer };
    }
    case types.SET_AUTHOR: {
      const author =
        action.author === undefined ? defaultSettings.author : action.author;
      return { ...state, author: author };
    }
    case types.SET_USEGENERATETHUMBNAILS: {
      return { ...state, useGenerateThumbnails: action.useGenerateThumbnails };
    }
    case types.SET_EMAIL: {
      return {
        ...state,
        //isLoading: true,
        email: action.email,
      };
    }
    case types.SET_TAGCOLOR: {
      return { ...state, tagBackgroundColor: action.tagColor };
    }
    case types.SET_TAGTEXTCOLOR: {
      return { ...state, tagTextColor: action.tagTextColor };
    }
    case types.SET_DEFAULT_FOLDER_COLOR: {
      return { ...state, defaultFolderColor: action.color };
    }
    case types.SET_CURRENTTHEME: {
      return { ...state, currentTheme: action.currentTheme };
    }
    case types.SET_CURRENT_REGULAR_THEME: {
      return { ...state, currentRegularTheme: action.currentRegularTheme };
    }
    case types.SET_CURRENT_DARK_THEME: {
      return { ...state, currentDarkTheme: action.currentDarkTheme };
    }
    case types.SET_GEO_TAGGING_FORMAT: {
      return { ...state, geoTaggingFormat: action.geoTaggingFormat };
    }
    case types.SET_HISTORY: {
      return { ...state, [action.key]: action.value };
    }
    case types.SWITCH_THEME: {
      let currentTheme = 'dark';
      const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)');
      if (state.currentTheme === 'system') {
        currentTheme = systemDarkMode ? 'light' : 'dark';
      } else if (state.currentTheme === 'dark') {
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
            ...state.keyBindings.slice(indexForEditing + 1),
          ],
        };
      }
      return state;
    }
    case types.SET_GLOBAL_KEYBINDING: {
      return {
        ...state,
        enableGlobalKeyboardShortcuts: action.enableGlobalKeyboardShortcuts,
      };
    }
    case types.SET_ZOOM_RESET: {
      setZoomFactorElectron(1);
      return { ...state, zoomFactor: 1 };
    }
    case types.SET_ZOOM_RESTORE: {
      setZoomFactorElectron(state.zoomFactor);
      return state;
    }
    case types.SET_ZOOM_IN: {
      let zoomLevel = state.zoomFactor;
      const offSet = 0.1;
      const correctedOffset = offSet * 4;
      const threshold = zoomLevel + correctedOffset;
      if (zoomLevel.toPrecision(2) <= threshold) {
        zoomLevel += offSet;
        setZoomFactorElectron(zoomLevel);
      }
      return { ...state, zoomFactor: zoomLevel };
    }
    case types.SET_ZOOM_OUT: {
      let zoomLevel = state.zoomFactor;
      const offSet = 0.1;
      if (zoomLevel.toPrecision(2) > offSet * 4) {
        zoomLevel -= offSet;
        setZoomFactorElectron(zoomLevel);
      }
      return { ...state, zoomFactor: zoomLevel };
    }
    case types.SET_SUPPORTED_FILE_TYPES: {
      const added = action.supportedFileTypes.filter(
        (newObj) =>
          !state.supportedFileTypes.some(
            (oldObj) => oldObj.type === newObj.type,
          ),
      );

      const removed = state.supportedFileTypes.filter(
        (oldObj) =>
          !action.supportedFileTypes.some(
            (newObj) => newObj.type === oldObj.type,
          ),
      );
      return {
        ...state,
        supportedFileTypes: action.supportedFileTypes,
        explicitlyDeletedFileTypes: [
          ...state.explicitlyDeletedFileTypes.filter(
            (type) => !added.some((add) => add.type === type),
          ),
          ...removed.map((del) => del.type),
        ],
      };
    }
    case types.ADD_SUPPORTED_FILE_TYPES: {
      return {
        ...state,
        supportedFileTypes: updateByProp(
          state.supportedFileTypes,
          action.supportedFileTypes,
          'type',
        ),
      };
    }
    case types.REMOVE_SUPPORTED_FILE_TYPES: {
      const supportedFileTypes = state.supportedFileTypes.map(
        (fType: TS.FileTypes) => ({
          ...fType,
          ...(fType.viewer === action.extensionId && {
            viewer: getDefaultViewer(fType.type),
          }),
          ...(fType.editor === action.extensionId && {
            editor: getDefaultEditor(fType.type),
          }),
        }),
      );
      return {
        ...state,
        supportedFileTypes: supportedFileTypes,
      };
    }
    case types.SET_ENTRY_PROPERTIES_SPLIT_SIZE: {
      return {
        ...state,
        entrySplitSize: action.entrySplitSize,
      };
    }
    case types.SET_MAIN_VSPLIT_SIZE: {
      return {
        ...state,
        mainVSplitSize: action.mainVSplitSize,
      };
    }
    case types.SET_LEFT_PANEL_WIDTH: {
      return {
        ...state,
        leftPanelWidth: action.leftPanelWidth,
      };
    }
    case types.SET_LAST_PUBLISHED_VERSION: {
      return {
        ...state,
        lastPublishedVersion: action.lastPublishedVersion,
      };
    }
    case types.SET_STORED_SEARCHES_VISIBLE: {
      return {
        ...state,
        storedSearchesVisible: action.storedSearchesVisible,
      };
    }
    case types.SET_SHOW_BOOKMARKS: {
      return {
        ...state,
        showBookmarks: action.showBookmarks,
      };
    }
    case types.SET_FILE_OPEN_HISTORY: {
      return {
        ...state,
        fileOpenHistory: action.fileOpenHistory,
      };
    }
    case types.SET_FOLDER_OPEN_HISTORY: {
      return {
        ...state,
        folderOpenHistory: action.folderOpenHistory,
      };
    }
    case types.SET_LAST_MOVE_COPY_MODE: {
      return {
        ...state,
        lastMoveCopyMode: action.mode,
      };
    }
    case types.SET_LAST_LINK_TYPE: {
      return {
        ...state,
        lastLinkType: action.linkType,
      };
    }
    case types.SET_FILE_EDIT_HISTORY: {
      return {
        ...state,
        fileEditHistory: action.fileEditHistory,
      };
    }
    case types.SET_PERSPECTIVE_ENABLED: {
      const current: string[] = Array.isArray(state.enabledPerspectives)
        ? state.enabledPerspectives
        : [];
      const isEnabled = current.includes(action.perspectiveId);
      let next: string[];
      if (action.enabled && !isEnabled) {
        next = [...current, action.perspectiveId];
      } else if (!action.enabled && isEnabled) {
        next = current.filter((id) => id !== action.perspectiveId);
      } else {
        return state;
      }
      return { ...state, enabledPerspectives: next };
    }
    case types.SET_ENABLED_PERSPECTIVES: {
      return { ...state, enabledPerspectives: action.enabledPerspectives };
    }
    case types.MARK_PERSPECTIVE_ONBOARDING_SEEN: {
      const seen = state.seenPerspectiveOnboardings || {};
      if (seen[action.perspectiveId] === true) {
        return state;
      }
      return {
        ...state,
        seenPerspectiveOnboardings: {
          ...seen,
          [action.perspectiveId]: true,
        },
      };
    }
    case types.RESET_PERSPECTIVE_ONBOARDING: {
      const seen = { ...(state.seenPerspectiveOnboardings || {}) };
      delete seen[action.perspectiveId];
      return { ...state, seenPerspectiveOnboardings: seen };
    }
    case types.TOGGLE_TAGGROUP: {
      let tagGroupCollapsed;
      if (state.tagGroupCollapsed) {
        if (state.tagGroupCollapsed.includes(action.uuid)) {
          tagGroupCollapsed = state.tagGroupCollapsed.filter(
            (tagGroupUUID) => tagGroupUUID !== action.uuid,
          );
        } else {
          tagGroupCollapsed = [...state.tagGroupCollapsed, action.uuid];
        }
      } else {
        tagGroupCollapsed = [action.uuid];
      }
      return {
        ...state,
        tagGroupCollapsed,
      };
    }
    case types.ADD_MAPTILE_SERVER: {
      let mapTileServers;
      if (action.isDefault) {
        mapTileServers = [
          { ...action.tileServer, uuid: getUuid() },
          ...state.mapTileServers,
        ];
      } else {
        mapTileServers = [
          ...state.mapTileServers,
          { ...action.tileServer, uuid: getUuid() },
        ];
      }
      return {
        ...state,
        mapTileServers,
      };
    }
    case types.EDIT_MAPTILE_SERVER: {
      let mapTileServers;
      if (action.isDefault) {
        mapTileServers = [
          action.tileServer,
          ...state.mapTileServers.filter(
            (tileServer) => tileServer.uuid !== action.tileServer.uuid,
          ),
        ];
      } else {
        mapTileServers = [
          ...state.mapTileServers.filter(
            (tileServer) => tileServer.uuid !== action.tileServer.uuid,
          ),
          action.tileServer,
        ];
      }

      return {
        ...state,
        mapTileServers,
      };
    }
    case types.DELETE_MAPTILE_SERVER: {
      const mapTileServers = state.mapTileServers.filter(
        (tileServer) => tileServer.uuid !== action.uuid,
      );
      return {
        ...state,
        mapTileServers,
      };
    }
    default: {
      return state;
    }
  }
};

export const actions = {
  addTileServers: (tileServer: TS.MapTileServer, isDefault = false) => ({
    type: types.ADD_MAPTILE_SERVER,
    tileServer,
    isDefault,
  }),
  editTileServers: (tileServer: TS.MapTileServer, isDefault = false) => ({
    type: types.EDIT_MAPTILE_SERVER,
    tileServer,
    isDefault,
  }),
  deleteTileServer: (uuid: string) => ({
    type: types.DELETE_MAPTILE_SERVER,
    uuid,
  }),
  toggleTagGroup: (tagGroupUUID: string) => ({
    type: types.TOGGLE_TAGGROUP,
    uuid: tagGroupUUID,
  }),
  setTagDelimiter: (delimiter: string) => ({
    type: types.SET_TAG_DELIMITER,
    delimiter,
  }),
  setMaxSearchResult: (maxSearchResult: number) => ({
    type: types.SET_MAX_SEARCH_RESULT,
    maxSearchResult,
  }),
  setDesktopMode: (desktopMode: boolean) => ({
    type: types.SET_DESKTOPMODE,
    desktopMode,
  }),
  setUseOnlyTagsFromTagLibrary: (useOnlyTagsFromTagLibrary: boolean) => ({
    type: types.SET_USEONLYTAGSFROMTAGLIBRARY,
    useOnlyTagsFromTagLibrary,
  }),
  setDevMode: (devMode: boolean) => ({
    type: types.SET_DEVMODE,
    devMode,
  }),
  setHideProFeatures: (hideProFeatures: boolean) => ({
    type: types.SET_HIDE_PRO_FEATURES,
    hideProFeatures,
  }),
  setAutoSaveDescription: (autoSaveDescription: boolean) => ({
    type: types.SET_AUTO_SAVE_DESCRIPTION,
    autoSaveDescription,
  }),
  setEnableWS: (enableWS: boolean) => ({
    type: types.SET_ENABLE_WS,
    enableWS,
  }),
  setEncryptCredentialsAtRest: (encryptCredentialsAtRest: boolean) => ({
    type: types.SET_ENCRYPT_CREDENTIALS_AT_REST,
    encryptCredentialsAtRest,
  }),
  setEncryptCredentialsKeySource: (
    encryptCredentialsKeySource: 'off' | 'keychain' | 'password',
  ) => ({
    type: types.SET_ENCRYPT_CREDENTIALS_KEY_SOURCE,
    encryptCredentialsKeySource,
  }),
  setWarningOpeningFilesExternally: (
    warningOpeningFilesExternally: boolean,
  ) => ({
    type: types.WARNING_OPENING_FILES_EXTERNALLY,
    warningOpeningFilesExternally,
  }),
  setSaveTagInLocation: (saveTagInLocation: boolean) => ({
    type: types.SET_SAVE_TAGS_IN_LOCATION,
    saveTagInLocation,
  }),
  toggleShowUnixHiddenEntries: () => ({
    type: types.TOGGLE_SHOWUNIXHIDDENENTRIES,
  }),
  toggleShowSymbolicLinks: () => ({
    type: types.TOGGLE_SHOWSYMBOLICLINKS,
  }),
  setEntryContainerTab: (
    tabName: (typeof TabNames)[keyof typeof TabNames],
  ) => ({
    type: types.SET_ENTRY_CONTAINER_TAB,
    entryContainerTab: tabName,
  }),
  setCheckForUpdates: (checkForUpdates: boolean) => ({
    type: types.SET_CHECKFORUPDATES,
    checkForUpdates,
  }),
  reorderTags: (reorderTags: boolean) => ({
    type: types.SET_REORDER_TAGS,
    reorderTags,
  }),
  setLanguage: (language: string) => ({
    type: types.SET_LANGUAGE,
    language,
  }),
  setUseDefaultLocation: (useDefaultLocation: boolean) => ({
    type: types.SET_USEDEFAULTLOCATION,
    useDefaultLocation,
  }),
  setDefaultPerspective: (defaultPerspective: string) => ({
    type: types.SET_DEFAULTPERSPECTIVE,
    defaultPerspective,
  }),
  setPerspectiveEnabled: (perspectiveId: string, enabled: boolean) => ({
    type: types.SET_PERSPECTIVE_ENABLED,
    perspectiveId,
    enabled,
  }),
  setEnabledPerspectives: (enabledPerspectives: string[]) => ({
    type: types.SET_ENABLED_PERSPECTIVES,
    enabledPerspectives,
  }),
  markPerspectiveOnboardingSeen: (perspectiveId: string) => ({
    type: types.MARK_PERSPECTIVE_ONBOARDING_SEEN,
    perspectiveId,
  }),
  resetPerspectiveOnboarding: (perspectiveId: string) => ({
    type: types.RESET_PERSPECTIVE_ONBOARDING,
    perspectiveId,
  }),
  setColoredFileExtension: (coloredFileExtension: boolean) => ({
    type: types.SET_COLOREDFILEEXTENSION,
    coloredFileExtension,
  }),
  setShowTagAreaOnStartup: (showTagAreaOnStartup: boolean) => ({
    type: types.SET_SHOWTAGAREAONSTARTUP,
    showTagAreaOnStartup,
  }),
  setLoadsLocationMetaData: (loadsLocationMetaData: boolean) => ({
    type: types.SET_LOADSLOCATIONMETADATA,
    loadsLocationMetaData,
  }),
  setSearchInSubfolders: (searchInSubfolders: boolean) => ({
    type: types.SET_SEARCHINSUBFOLDERS,
    searchInSubfolders,
  }),
  setWatchCurrentDirectory: (watchCurrentDirectory: boolean) => ({
    type: types.SET_WATCHCURRENTDIRECTORY,
    watchCurrentDirectory,
  }),
  setCalculateTags: (calculateTags: boolean) => ({
    type: types.SET_CALCULATETAGS,
    calculateTags,
  }),
  setUseTrashCan: (useTrashCan: boolean) => ({
    type: types.SET_USETRASHCAN,
    useTrashCan,
  }),
  setPersistTagsInSidecarFile: (persistTagsInSidecarFile: boolean) => ({
    type: types.SET_PERSISTTAGSINSIDECARFILE,
    persistTagsInSidecarFile,
  }),
  setMaxCollectedTag: (maxCollectedTag: number) => ({
    type: types.SET_MAXCOLLECTEDTAG,
    maxCollectedTag,
  }),
  setFileNameTagPlace: (filenameTagPlacedAtEnd: boolean) => ({
    type: types.SET_FILENAMETAGPLACEDATEND,
    filenameTagPlacedAtEnd,
  }),
  setAddTagsToLibrary: (addTagsToLibrary: boolean) => ({
    type: types.SET_ADDTAGSTOLIBRARY,
    addTagsToLibrary,
  }),
  setRevisionsEnabled: (enabled: boolean) => ({
    type: types.SET_REVISIONS_ENABLED,
    enabled,
  }),
  setAiProvider: (aiProviderId: string) => ({
    type: types.SET_AI_PROVIDER,
    aiProviderId,
  }),
  setAiProviders: (aiProviders: AIProvider[]) => ({
    type: types.SET_AI_PROVIDERS,
    aiProviders,
  }),
  addAiProvider: (aiProvider: AIProvider) => ({
    type: types.ADD_AI_PROVIDER,
    aiProvider,
  }),
  removeAiProvider: (id: string) => ({
    type: types.REMOVE_AI_PROVIDER,
    id,
  }),
  setPrefixTagContainer: (prefixTagContainer: boolean) => ({
    type: types.SET_PREFIX_TAG_CONTAINER,
    prefixTagContainer,
  }),
  setAuthor: (author: string) => ({
    type: types.SET_AUTHOR,
    author,
  }),
  setUseGenerateThumbnails: (useGenerateThumbnails: boolean) => ({
    type: types.SET_USEGENERATETHUMBNAILS,
    useGenerateThumbnails,
  }),
  setAppDataPath: (path: string) => ({
    type: types.SET_APPDATAPATH,
    path,
  }),
  setContentHash: (contentHash: string) => ({
    type: types.SET_CONTENTHASH,
    contentHash,
  }),
  setEmail: (email: string) => ({ type: types.SET_EMAIL, email }),
  setZoomRestoreApp: () => ({ type: types.SET_ZOOM_RESTORE }),
  setZoomResetApp: () => ({ type: types.SET_ZOOM_RESET }),
  setZoomInApp: () => ({ type: types.SET_ZOOM_IN }),
  setZoomOutApp: () => ({ type: types.SET_ZOOM_OUT }),
  setTagColor: (tagColor: string) => ({
    type: types.SET_TAGCOLOR,
    tagColor,
  }),
  setTagTextColor: (tagTextColor: string) => ({
    type: types.SET_TAGTEXTCOLOR,
    tagTextColor,
  }),
  setDefaultFolderColor: (color: string) => ({
    type: types.SET_DEFAULT_FOLDER_COLOR,
    color,
  }),
  setCurrentTheme: (currentTheme: string) => ({
    type: types.SET_CURRENTTHEME,
    currentTheme,
  }),
  setCurrentRegularTheme: (currentRegularTheme: string) => ({
    type: types.SET_CURRENT_REGULAR_THEME,
    currentRegularTheme,
  }),
  setCurrentDarkTheme: (currentDarkTheme: string) => ({
    type: types.SET_CURRENT_DARK_THEME,
    currentDarkTheme,
  }),
  setGeoTaggingFormat: (geoTaggingFormat: string) => ({
    type: types.SET_GEO_TAGGING_FORMAT,
    geoTaggingFormat,
  }),
  setHistory: (key: string, value: number) => ({
    type: types.SET_HISTORY,
    key,
    value,
  }),
  switchTheme: () => ({ type: types.SWITCH_THEME }),
  setKeyBinding: (keyBindingName: string, keyBindingCommand: string) => ({
    type: types.SET_KEYBINDING,
    keyBindingName,
    keyBindingCommand,
  }),
  setGlobalKeyBinding: (enableGlobalKeyboardShortcuts: boolean) => ({
    type: types.SET_GLOBAL_KEYBINDING,
    enableGlobalKeyboardShortcuts,
  }),
  addSupportedFileTypes: (
    supportedFileTypes: Array<TS.FileTypes>,
    override = false,
  ) => ({
    type: types.ADD_SUPPORTED_FILE_TYPES,
    supportedFileTypes,
    override,
  }),
  removeSupportedFileTypes: (extensionId: string) => ({
    type: types.REMOVE_SUPPORTED_FILE_TYPES,
    extensionId,
  }),
  setSupportedFileTypes: (supportedFileTypes: Array<TS.FileTypes>) => ({
    type: types.SET_SUPPORTED_FILE_TYPES,
    supportedFileTypes,
  }),
  setEntryPropertiesSplitSize: (entrySplitSize: number) => ({
    type: types.SET_ENTRY_PROPERTIES_SPLIT_SIZE,
    entrySplitSize,
  }),
  setMainVerticalSplitSize: (mainVSplitSize: string) => ({
    type: types.SET_MAIN_VSPLIT_SIZE,
    mainVSplitSize,
  }),
  setLeftPanelWidth: (leftPanelWidth: number) => ({
    type: types.SET_LEFT_PANEL_WIDTH,
    leftPanelWidth,
  }),
  setFirstRun: (firstRun: boolean) => ({
    type: types.SET_FIRST_RUN,
    firstRun,
  }),
  setOnboardingCompleted: (onboardingCompleted: boolean) => ({
    type: types.SET_ONBOARDING_COMPLETED,
    onboardingCompleted,
  }),
  setHideHowToStart: (hideHowToStart: boolean) => ({
    type: types.SET_HIDE_HOWTOSTART,
    hideHowToStart,
  }),
  setOnboardingVersion: (onboardingVersion: number) => ({
    type: types.SET_ONBOARDING_VERSION,
    onboardingVersion,
  }),
  upgradeSettings: () => ({
    type: types.UPGRADE_SETTINGS,
  }),
  importSettings: (settings: Record<string, any>) => ({
    type: types.IMPORT_SETTINGS,
    settings,
  }),
  setLastPublishedVersion: (lastPublishedVersion: string) => ({
    type: types.SET_LAST_PUBLISHED_VERSION,
    lastPublishedVersion,
  }),
  setStoredSearchesVisible: (storedSearchesVisible: boolean) => ({
    type: types.SET_STORED_SEARCHES_VISIBLE,
    storedSearchesVisible,
  }),
  setShowBookmarks: (showBookmarks: boolean) => ({
    type: types.SET_SHOW_BOOKMARKS,
    showBookmarks,
  }),
  setFileOpenHistory: (fileOpenHistory: boolean) => ({
    type: types.SET_FILE_OPEN_HISTORY,
    fileOpenHistory,
  }),
  setFolderOpenHistory: (folderOpenHistory: boolean) => ({
    type: types.SET_FOLDER_OPEN_HISTORY,
    folderOpenHistory,
  }),
  setFileEditHistory: (fileEditHistory: boolean) => ({
    type: types.SET_FILE_EDIT_HISTORY,
    fileEditHistory,
  }),
  setLastMoveCopyMode: (mode: 'move' | 'copy') => ({
    type: types.SET_LAST_MOVE_COPY_MODE,
    mode,
  }),
  setLastLinkType: (linkType: 'ts' | 'relative') => ({
    type: types.SET_LAST_LINK_TYPE,
    linkType,
  }),
  checkForUpdate: () => (dispatch: (actions: Object) => void) => {
    getLastVersionPromise()
      .then((lastVersion) => {
        console.log('Last version on server: ' + lastVersion);
        const newVersion = semver.coerce(lastVersion); // lastVersion '3.0.5' ;
        const currentVersion = semver.coerce(versionMeta.version);
        // const lastPublishedVersion = semver.coerce(settings.lastPublishedVersion);
        if (semver.valid(newVersion) && semver.gt(newVersion, currentVersion)) {
          console.log('New version available: ' + newVersion.version + '!');
          dispatch(actions.setLastPublishedVersion(newVersion.version));
          dispatch(AppActions.setUpdateAvailable(true));
        } else {
          console.log(
            'Current version: ' + versionMeta.version + ' is up to date',
          );
        }
        return true;
      })
      .catch((error) => {
        console.log('Error while checking for update: ' + error);
      });
  },
};

function getDefaultAI(aiProviderId: string, aiProviders: AIProvider[]) {
  if (aiProviderId) {
    const provider = aiProviders.find((p) => p.enable && p.id === aiProviderId);
    if (provider) {
      return provider;
    }
  }
  if (aiProviders.length > 0) {
    return aiProviders.find((p) => p.enable);
  }
  return undefined;
}

// Selectors
export const getEntrySplitSize = (state: any): number => {
  const raw = state.settings.entrySplitSize;
  // Legacy values were strings like '45%' and are no longer valid (value is now pixels).
  return typeof raw === 'number' && isFinite(raw) ? raw : 200;
};
export const getLeftPanelWidth = (state: any): number => {
  const raw = state.settings.leftPanelWidth;
  return typeof raw === 'number' && isFinite(raw) ? raw : 320;
};
export const getMapTileServer = (state: any): TS.MapTileServer =>
  AppConfig.ExtMapTileServers
    ? AppConfig.ExtMapTileServers[0]
    : state.settings.mapTileServers[0];
export const getMapTileServers = (state: any): Array<TS.MapTileServer> =>
  AppConfig.ExtMapTileServers || state.settings.mapTileServers;
export const getSettings = (state: any) => state.settings;
export const getMaxRecentMoveCopyDestinations = (state: any): number => {
  const v = state.settings.tsRecentMoveCopyDestinations;
  return typeof v === 'number' && v >= 0 ? v : 6;
};
export const getLastMoveCopyMode = (state: any): 'move' | 'copy' => {
  return state.settings.lastMoveCopyMode === 'copy' ? 'copy' : 'move';
};
export const getLastLinkType = (state: any): 'ts' | 'relative' => {
  return state.settings.lastLinkType === 'ts' ? 'ts' : 'relative';
};
export const getEnableWS = (state: any) => state.settings.enableWS;
export const getEncryptCredentialsAtRest = (state: any) =>
  state.settings.encryptCredentialsAtRest === true;
export const getEncryptCredentialsKeySource = (
  state: any,
): 'off' | 'keychain' | 'password' => {
  const v = state.settings.encryptCredentialsKeySource;
  return v === 'keychain' || v === 'password' ? v : 'off';
};
export const getDesktopMode = (state: any) => {
  if (typeof AppConfig.ExtDisplayMode === 'undefined') {
    return state.settings.desktopMode;
  }
  return AppConfig.ExtDisplayMode !== 'mobile';
};
export const isDevMode = (state: any) =>
  AppConfig.ExtDevMode ? AppConfig.ExtDevMode : state.settings.devMode;
export const isHideProFeatures = (state: any) =>
  AppConfig.ExtHideProFeatures !== undefined
    ? AppConfig.ExtHideProFeatures
    : state.settings.hideProFeatures;
export const isAutoSaveDescription = (state: any) =>
  state.settings.autoSaveDescription;
export const isRevisionsEnabled = (state: any) =>
  state.settings.isRevisionsEnabled;
export const isReorderTags = (state: any) => state.settings.reorderTags;
export const getDefaultAIProvider = (state: any) => {
  if (typeof AppConfig.ExtAI === 'undefined') {
    return getDefaultAI(
      state.settings.aiProviderId,
      state.settings.aiProviders,
    );
  }
  return getDefaultAI(AppConfig.ExtAI.defaultEngine, AppConfig.ExtAI.engines);
};
export const getAIProviders = (state: any) => {
  if (typeof AppConfig.ExtAI === 'undefined') {
    return state.settings.aiProviders;
  }
  return AppConfig.ExtAI.engines;
};
export const getPrefixTagContainer = (state: any) =>
  state.settings.prefixTagContainer;
export const getAuthor = (state: any) =>
  AppConfig.ExtAuthor ?? state.settings.author;
export const getGeoTaggingFormat = (state: any) =>
  state.settings.geoTaggingFormat;
export const getAddTagsToLibrary = (state: any) =>
  state.settings.addTagsToLibrary;
export const getWarningOpeningFilesExternally = (state: any) =>
  state.settings.warningOpeningFilesExternally;
export const getCheckForUpdateOnStartup = (state: any) =>
  AppConfig.ExtCheckForUpdatesOnStartup !== undefined
    ? AppConfig.ExtCheckForUpdatesOnStartup
    : state.settings.checkForUpdates;
export const getLastPublishedVersion = (state: any) =>
  state.settings.lastPublishedVersion;
export const getShowUnixHiddenEntries = (state: any) =>
  state.settings.showUnixHiddenEntries;
export const getShowSymbolicLinks = (state: any) =>
  state.settings.showSymbolicLinks !== false;
export const getEntryContainerTab = (state: any) =>
  state.settings.entryContainerTab;
export const getUseDefaultLocation = (state: any) =>
  state.settings.useDefaultLocation;
export const getDefaultPerspective = (state: any) =>
  AppConfig.ExtDefaultPerspective ?? state.settings.defaultPerspective;
// Precedence: when extconfig.json defines ExtEnabledPerspectives, it is
// authoritative on every app load — the user's persisted toggles in
// state.settings.enabledPerspectives are ignored. Distributors / admins win
// over end-user preference; the Settings tab reflects this by rendering the
// rows read-only (see isEnabledPerspectivesLocked).
export const getEnabledPerspectives = (state: any): string[] => {
  if (Array.isArray(AppConfig.ExtEnabledPerspectives)) {
    return AppConfig.ExtEnabledPerspectives;
  }
  return Array.isArray(state.settings.enabledPerspectives)
    ? state.settings.enabledPerspectives
    : [];
};
export const isEnabledPerspectivesLocked = (): boolean =>
  Array.isArray(AppConfig.ExtEnabledPerspectives);
export const getSeenPerspectiveOnboardings = (
  state: any,
): Record<string, boolean> => state.settings.seenPerspectiveOnboardings || {};
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
export const getMaxCollectedTag = (state: any) =>
  state.settings.maxCollectedTag
    ? state.settings.maxCollectedTag
    : AppConfig.maxCollectedTag;
export const getPersistTagsInSidecarFile = (state: any): boolean =>
  AppConfig.ExtUseSidecarsForFileTagging !== undefined
    ? AppConfig.ExtUseSidecarsForFileTagging
    : state.settings.persistTagsInSidecarFile;
export const getFileNameTagPlace = (state: any): boolean =>
  typeof AppConfig.ExtFilenameTagPlacedAtEnd === 'undefined'
    ? state.settings.filenameTagPlacedAtEnd
    : AppConfig.ExtFilenameTagPlacedAtEnd;
export const getUseGenerateThumbnails = (state: any) =>
  state.settings.useGenerateThumbnails;
export const getKeyBindings = (state: any) => state.settings.keyBindings;
export const getKeyBindingObject = (state: any) =>
  generateKeyBindingObject(state.settings.keyBindings);
export const getSupportedFileTypes = (state: any) =>
  state.settings.supportedFileTypes;
export const getExtensionsFound = (state: any) =>
  state.settings.extensionsFound;
export const getTagColor = (state: any) => state.settings.tagBackgroundColor;
export const getTagTextColor = (state: any) => state.settings.tagTextColor;
export const getDefaultFolderColor = (state: any) =>
  AppConfig.ExtDefaultFolderColor ?? state.settings.defaultFolderColor;
export const getCurrentTheme = (state: any) => state.settings.currentTheme;
export const getDefaultRegularTheme = (state: any) =>
  state.settings.currentRegularTheme;
export const getDefaultDarkTheme = (state: any) =>
  state.settings.currentDarkTheme;
export const isGlobalKeyBindingEnabled = (state: any) =>
  state.settings.enableGlobalKeyboardShortcuts;
export const getMainVerticalSplitSize = (state: any) =>
  state.settings.mainVSplitSize;
export const getNewHTMLFileContent = (state: any) =>
  state.settings.newHTMLFileContent;
/*export const getEnabledExtensions = (state: any) =>
  state.settings.enabledExtensions;*/
export const getTagGroupCollapsed = (state: any) =>
  state.settings.tagGroupCollapsed;
export const getTagDelimiter = (state: any) => state.settings.tagDelimiter;
export const getMaxSearchResults = (state: any) =>
  state.settings.maxSearchResult;
export const isDesktopMode = (state: any) => state.settings.desktopMode;
export const useOnlyTagsFromTagLibrary = (state: any) =>
  state.settings.useOnlyTagsFromTagLibrary;
export const getStoredSearchesVisible = (state: any) =>
  state.settings.storedSearchesVisible;
export const getShowBookmarks = (state: any) => state.settings.showBookmarks;
export const getSaveTagInLocation = (state: any) =>
  typeof AppConfig.ExtUseLocationTags === 'undefined'
    ? state.settings.saveTagInLocation
    : AppConfig.ExtUseLocationTags;
export const getFileOpenHistory = (state: any) =>
  state.settings.fileOpenHistory;
export const getFolderOpenHistory = (state: any) =>
  state.settings.folderOpenHistory;
export const getFileEditHistory = (state: any) =>
  state.settings.fileEditHistory;
export const isFirstRun = (state: any) => {
  if (typeof AppConfig.ExtIsFirstRun === 'undefined') {
    return state.settings.firstRun;
  }
  return AppConfig.ExtIsFirstRun;
};
export const isOnboardingCompleted = (state: any) =>
  state.settings.onboardingCompleted === true;
export const isHowToStartHidden = (state: any) =>
  state.settings.hideHowToStart === true;
export const getOnboardingVersion = (state: any) =>
  state.settings.onboardingVersion || 0;

const kbObject: any = {};
function generateKeyBindingObject(keyBindings: Array<Object>) {
  // Object.keys(kbObject).forEach((k) => delete kbObject[k]);
  keyBindings.map((kb: any) => {
    kbObject[kb.name] = kb.command;
    return true;
  });
  return kbObject;
}
