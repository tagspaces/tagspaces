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

import {
  formatDateTime4Tag,
  locationType
} from '@tagspaces/tagspaces-common/misc';
import AppConfig from '-/AppConfig';
import {
  extractFileExtension,
  extractDirectoryName,
  extractFileName,
  getMetaFileLocationForFile,
  getThumbFileLocationForFile,
  extractParentDirectoryPath,
  extractTagsAsObjects,
  normalizePath,
  extractContainingDirectoryPath,
  getMetaFileLocationForDir,
  generateSharingLink,
  getBackupFileLocation
} from '@tagspaces/tagspaces-common/paths';
import {
  getURLParameter,
  clearURLParam,
  updateHistory,
  clearAllURLParams
} from '-/utils/dom';
import { getLocation, getDefaultLocationId } from './locations';
import PlatformIO from '../services/platform-facade';
import {
  deleteFilesPromise,
  renameFilesPromise,
  getAllPropertiesPromise,
  prepareDirectoryContent,
  findExtensionsForEntry,
  getNextFile,
  getPrevFile,
  loadJSONFile,
  merge,
  setLocationType,
  getRelativeEntryPath,
  getCleanLocationPath,
  updateFsEntries,
  loadMetaDataPromise,
  mergeByProp,
  toFsEntry
} from '-/services/utils-io';
import { getUuid } from '@tagspaces/tagspaces-common/utils-io';
import i18n from '../services/i18n';
import { Pro } from '../pro';
import { actions as LocationIndexActions } from './location-index';
import { actions as tagLibraryActions } from './taglibrary';
import {
  actions as SettingsActions,
  getCheckForUpdateOnStartup,
  isFirstRun,
  isGlobalKeyBindingEnabled
} from '-/reducers/settings';
import { TS } from '-/tagspaces.namespace';
import { PerspectiveIDs } from '-/perspectives';
import versionMeta from '-/version.json';
import {
  addTag,
  getTagLibrary,
  setTagLibrary
} from '-/services/taglibrary-utils';
import { getProTeaserSlideIndex } from '-/content/ProTeaserSlides';
import GlobalSearch from '-/services/search-index';
import { extensionsFound } from '-/extension-config';

import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';

type State = {};
export type AppDispatch = ThunkDispatch<State, any, AnyAction>;

export const types = {
  DEVICE_ONLINE: 'APP/DEVICE_ONLINE',
  DEVICE_OFFLINE: 'APP/DEVICE_OFFLINE',
  PROGRESS: 'APP/PROGRESS',
  RESET_PROGRESS: 'APP/RESET_PROGRESS',
  LAST_BACKGROUND_IMAGE_CHANGE: 'APP/LAST_BACKGROUND_IMAGE_CHANGE',
  LAST_BACKGROUND_COLOR_CHANGE: 'APP/LAST_BACKGROUND_COLOR_CHANGE',
  LAST_THUMBNAIL_IMAGE_CHANGE: 'APP/LAST_THUMBNAIL_IMAGE_CHANGE',
  LOGIN_SUCCESS: 'APP/LOGIN_SUCCESS',
  LOGIN_FAILURE: 'APP/LOGIN_FAILURE',
  LOGOUT: 'APP/LOGOUT',
  LOAD_DIRECTORY_SUCCESS: 'APP/LOAD_DIRECTORY_SUCCESS',
  SET_DIRECTORY_META: 'APP/SET_DIRECTORY_META',
  LOAD_DIRECTORY_FAILURE: 'APP/LOAD_DIRECTORY_FAILURE',
  CLEAR_DIRECTORY_CONTENT: 'APP/CLEAR_DIRECTORY_CONTENT',
  // LOAD_PAGE_CONTENT: 'APP/LOAD_PAGE_CONTENT',
  SET_SEARCH_RESULTS: 'APP/SET_SEARCH_RESULTS',
  EXIT_SEARCH_MODE: 'APP/EXIT_SEARCH_MODE',
  ENTER_SEARCH_MODE: 'APP/ENTER_SEARCH_MODE',
  APPEND_SEARCH_RESULTS: 'APP/APPEND_SEARCH_RESULTS',
  SET_SEARCH_FILTER: 'APP/SET_SEARCH_FILTER',
  OPEN_FILE: 'APP/OPEN_FILE',
  TOGGLE_ENTRY_FULLWIDTH: 'APP/TOGGLE_ENTRY_FULLWIDTH',
  SET_ENTRY_FULLWIDTH: 'APP/SET_ENTRY_FULLWIDTH',
  CLOSE_ALL_FILES: 'APP/CLOSE_ALL_FILES',
  UPDATE_THUMB_URL: 'APP/UPDATE_THUMB_URL',
  UPDATE_THUMB_URLS: 'APP/UPDATE_THUMB_URLS',
  SET_NOTIFICATION: 'APP/SET_NOTIFICATION',
  SET_GENERATING_THUMBNAILS: 'APP/SET_GENERATING_THUMBNAILS',
  SET_NEW_VERSION_AVAILABLE: 'APP/SET_NEW_VERSION_AVAILABLE',
  SET_CURRENLOCATIONID: 'APP/SET_CURRENLOCATIONID',
  SET_CURRENDIRECTORYCOLOR: 'APP/SET_CURRENDIRECTORYCOLOR',
  SET_CURRENDIRECTORYPERSPECTIVE: 'APP/SET_CURRENDIRECTORYPERSPECTIVE',
  SET_IS_META_LOADED: 'APP/SET_IS_META_LOADED',
  SET_LAST_SELECTED_ENTRY: 'APP/SET_LAST_SELECTED_ENTRY',
  SET_SELECTED_ENTRIES: 'APP/SET_SELECTED_ENTRIES',
  SET_TAG_LIBRARY_CHANGED: 'APP/SET_TAG_LIBRARY_CHANGED',
  SET_FILEDRAGGED: 'APP/SET_FILEDRAGGED',
  SET_READONLYMODE: 'APP/SET_READONLYMODE',
  RENAME_FILE: 'APP/RENAME_FILE',
  TOGGLE_EDIT_TAG_DIALOG: 'APP/TOGGLE_EDIT_TAG_DIALOG',
  TOGGLE_ABOUT_DIALOG: 'APP/TOGGLE_ABOUT_DIALOG',
  TOGGLE_LOCATION_DIALOG: 'APP/TOGGLE_LOCATION_DIALOG',
  TOGGLE_ONBOARDING_DIALOG: 'APP/TOGGLE_ONBOARDING_DIALOG',
  TOGGLE_KEYBOARD_DIALOG: 'APP/TOGGLE_KEYBOARD_DIALOG',
  TOGGLE_LICENSE_DIALOG: 'APP/TOGGLE_LICENSE_DIALOG',
  TOGGLE_OPENLINK_DIALOG: 'APP/TOGGLE_OPENLINK_DIALOG',
  TOGGLE_OPEN_PRO_TEASER_DIALOG: 'APP/TOGGLE_OPEN_PRO_TEASER_DIALOG',
  TOGGLE_THIRD_PARTY_LIBS_DIALOG: 'APP/TOGGLE_THIRD_PARTY_LIBS_DIALOG',
  TOGGLE_SETTINGS_DIALOG: 'APP/TOGGLE_SETTINGS_DIALOG',
  TOGGLE_CREATE_DIRECTORY_DIALOG: 'APP/TOGGLE_CREATE_DIRECTORY_DIALOG',
  TOGGLE_NEW_ENTRY_DIALOG: 'APP/TOGGLE_NEW_ENTRY_DIALOG',
  TOGGLE_NEW_FILE_DIALOG: 'APP/TOGGLE_NEW_FILE_DIALOG',
  TOGGLE_DELETE_MULTIPLE_ENTRIES_DIALOG:
    'APP/TOGGLE_DELETE_MULTIPLE_ENTRIES_DIALOG',
  TOGGLE_IMPORT_KANBAN_DIALOG: 'APP/TOGGLE_IMPORT_KANBAN_DIALOG',
  TOGGLE_UPLOAD_DIALOG: 'APP/TOGGLE_UPLOAD_DIALOG',
  SET_CURRENT_DIRECTORY_DIRS: 'APP/SET_CURRENT_DIRECTORY_DIRS',
  CLEAR_UPLOAD_DIALOG: 'APP/CLEAR_UPLOAD_DIALOG',
  TOGGLE_PROGRESS_DIALOG: 'APP/TOGGLE_PROGRESS_DIALOG',
  OPEN_LOCATIONMANAGER_PANEL: 'APP/OPEN_LOCATIONMANAGER_PANEL',
  OPEN_TAGLIBRARY_PANEL: 'APP/OPEN_TAGLIBRARY_PANEL',
  OPEN_SEARCH_PANEL: 'APP/OPEN_SEARCH_PANEL',
  OPEN_HELPFEEDBACK_PANEL: 'APP/OPEN_HELPFEEDBACK_PANEL',
  CLOSE_ALLVERTICAL_PANELS: 'APP/CLOSE_ALLVERTICAL_PANELS',
  REFLECT_DELETE_ENTRY: 'APP/REFLECT_DELETE_ENTRY',
  REFLECT_DELETE_ENTRIES: 'APP/REFLECT_DELETE_ENTRIES',
  REFLECT_RENAME_ENTRY: 'APP/REFLECT_RENAME_ENTRY',
  REFLECT_CREATE_ENTRY: 'APP/REFLECT_CREATE_ENTRY',
  REFLECT_CREATE_ENTRIES: 'APP/REFLECT_CREATE_ENTRIES',
  // REFLECT_UPDATE_SIDECARTAGS: 'APP/REFLECT_UPDATE_SIDECARTAGS',
  // REFLECT_UPDATE_SIDECARMETA: 'APP/REFLECT_UPDATE_SIDECARMETA',
  UPDATE_CURRENTDIR_ENTRY: 'APP/UPDATE_CURRENTDIR_ENTRY',
  UPDATE_CURRENTDIR_ENTRIES: 'APP/UPDATE_CURRENTDIR_ENTRIES',
  REFLECT_EDITED_ENTRY_PATHS: 'APP/REFLECT_EDITED_ENTRY_PATHS',
  SET_ISLOADING: 'APP/SET_ISLOADING',
  ADD_EXTENSIONS: 'APP/ADD_EXTENSIONS',
  REMOVE_EXTENSIONS: 'APP/REMOVE_EXTENSIONS',
  UPDATE_EXTENSION: 'APP/UPDATE_EXTENSION'
};

export const NotificationTypes = {
  default: 'default',
  error: 'error'
};

export type OpenedEntry = {
  uuid: string;
  path: string;
  url?: string;
  size: number;
  lmdt: number;
  locationId: string;
  viewingExtensionPath: string;
  viewingExtensionId: string;
  editingExtensionPath?: string;
  editingExtensionId?: string;
  isFile?: boolean;
  isAutoSaveEnabled?: boolean;
  color?: string;
  description?: string;
  perspective?: string;
  editMode?: boolean;
  // changed?: boolean;
  /**
   * if its true iframe will be reloaded
   * if its false && editMode==true and changed==true => show reload dialog
   * default: undefined
   */
  shouldReload?: boolean;
  focused?: boolean; // TODO make it mandatory once support for multiple files is added
  tags?: Array<TS.Tag>;
};

let showLocations = true;
let showTagLibrary = false;
let showSearch = false;
if (window.ExtDefaultVerticalPanel === 'none') {
  showLocations = false;
  showTagLibrary = false;
  showSearch = false;
} else if (window.ExtDefaultVerticalPanel === 'locations') {
  showLocations = true;
  showTagLibrary = false;
  showSearch = false;
} else if (window.ExtDefaultVerticalPanel === 'taglibrary') {
  showLocations = false;
  showTagLibrary = true;
  showSearch = false;
} else if (window.ExtDefaultVerticalPanel === 'search') {
  showLocations = false;
  showTagLibrary = false;
  showSearch = true;
}

export const initialState = {
  extensions: extensionsFound,
  isLoading: false,
  error: null,
  loggedIn: false,
  isOnline: false,
  lastError: '',
  progress: [],
  isUpdateInProgress: false,
  isUpdateAvailable: false,
  currentLocationId: null,
  currentDirectoryPath: '',
  currentDirectoryColor: '',
  currentDirectoryDescription: '',
  currentDirectoryTags: [],
  currentDirectoryEntries: [],
  isReadOnlyMode: false,
  searchResults: [],
  notificationStatus: {
    visible: false,
    text: 'Test',
    notificationType: '',
    autohide: false
  },
  openedFiles: [],
  editTagDialogOpened: false,
  aboutDialogOpened: false,
  locationDialogOpened: false,
  openLinkDialogOpened: false,
  proTeaserIndex: -1,
  onboardingDialogOpened: false,
  keysDialogOpened: false,
  isNewEntryDialogOpened: false,
  isNewFileDialogOpened: false,
  licenseDialogOpened: false,
  thirdPartyLibsDialogOpened: false,
  settingsDialogOpened: false,
  createDirectoryDialogOpened: null,
  importKanBanDialogOpened: false,
  // lastSelectedEntry: null,
  selectedEntries: [],
  tagLibraryChanged: false,
  isEntryInFullWidth: false,
  isGeneratingThumbs: false,
  locationManagerPanelOpened: showLocations,
  tagLibraryPanelOpened: showTagLibrary,
  searchPanelOpened: showSearch,
  user: window.ExtDemoUser
    ? {
        attributes: window.ExtDemoUser,
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        associateSoftwareToken: () => {},
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        verifySoftwareToken: () => {}
      }
    : undefined
};

// The state described here will not be persisted
// eslint-disable-next-line default-param-last
export default (state: any = initialState, action: any) => {
  switch (action.type) {
    case types.LAST_BACKGROUND_IMAGE_CHANGE: {
      return {
        ...state,
        lastBackgroundImageChange: {
          folderPath: action.folderPath,
          dt: action.lastBackgroundImageChange
        }
      };
    }
    case types.LAST_BACKGROUND_COLOR_CHANGE: {
      return {
        ...state,
        lastBackgroundColorChange: {
          folderPath: action.folderPath,
          dt: action.lastBackgroundColorChange
        }
      };
    }
    case types.LAST_THUMBNAIL_IMAGE_CHANGE: {
      return {
        ...state,
        lastThumbnailImageChange: {
          thumbPath: action.thumbPath,
          dt: action.lastThumbnailImageChange
        }
      };
    }
    case types.LOGIN_SUCCESS: {
      return { ...state, user: action.user };
    }
    case types.DEVICE_ONLINE: {
      return { ...state, isOnline: true, error: null };
    }
    case types.DEVICE_OFFLINE: {
      return { ...state, isOnline: false, error: null };
    }
    case types.PROGRESS: {
      const arrProgress = [
        {
          path: action.path,
          filePath: action.filePath,
          progress: action.progress,
          abort: action.abort
        }
      ];
      state.progress.map(fileProgress => {
        if (fileProgress.path !== action.path) {
          arrProgress.push(fileProgress);
        }
        return true;
      });
      return { ...state, progress: arrProgress };
    }
    case types.RESET_PROGRESS: {
      return { ...state, progress: [] };
    }
    case types.SET_READONLYMODE: {
      return { ...state, isReadOnlyMode: action.isReadOnlyMode };
    }
    case types.SET_NEW_VERSION_AVAILABLE: {
      return {
        ...state,
        isUpdateAvailable: action.isUpdateAvailable
      };
    }
    case types.SET_DIRECTORY_META: {
      return {
        ...state,
        directoryMeta: action.directoryMeta
      };
    }
    case types.LOAD_DIRECTORY_SUCCESS: {
      let { directoryPath } = action;
      if (directoryPath && directoryPath.startsWith('./')) {
        // relative paths
        directoryPath = PlatformIO.resolveFilePath(directoryPath);
      }
      let currentDirectoryFiles: Array<TS.OrderVisibilitySettings> = [];
      if (
        action.directoryMeta &&
        action.directoryMeta.customOrder &&
        action.directoryMeta.customOrder.files
      ) {
        currentDirectoryFiles = action.directoryMeta.customOrder.files;
      }
      let currentDirectoryDirs: Array<TS.OrderVisibilitySettings> = [];
      if (
        action.directoryMeta &&
        action.directoryMeta.customOrder &&
        action.directoryMeta.customOrder.folders
      ) {
        currentDirectoryDirs = action.directoryMeta.customOrder.folders;
      }
      return {
        ...state,
        currentDirectoryEntries: action.directoryContent,
        directoryMeta: action.directoryMeta,
        currentDirectoryColor: action.directoryMeta
          ? action.directoryMeta.color || ''
          : '',
        currentDirectoryTags: action.directoryMeta
          ? action.directoryMeta.tags || []
          : '',
        currentDirectoryDescription: action.directoryMeta
          ? action.directoryMeta.description || ''
          : '',
        currentDirectoryPerspective:
          action.directoryMeta && action.directoryMeta.perspective
            ? action.directoryMeta.perspective
            : action.defaultPerspective, // state.currentDirectoryPerspective,
        currentDirectoryPath: directoryPath,
        /**
         * used for reorder files in KanBan
         */
        currentDirectoryFiles: currentDirectoryFiles,
        /**
         * used for reorder dirs in KanBan
         */
        currentDirectoryDirs: currentDirectoryDirs,
        isLoading: action.showIsLoading || false
      };
    }
    case types.CLEAR_DIRECTORY_CONTENT: {
      return {
        ...state,
        currentDirectoryEntries: [],
        currentDirectoryPath: ''
      };
    }
    case types.SET_CURRENLOCATIONID: {
      return {
        ...state,
        currentLocationId: action.locationId
      };
    }
    /* case types.SET_LAST_SELECTED_ENTRY: {
      return { ...state, lastSelectedEntry: action.entryPath };
    } */
    case types.SET_SELECTED_ENTRIES: {
      return { ...state, selectedEntries: action.selectedEntries };
    }
    case types.SET_TAG_LIBRARY_CHANGED: {
      return { ...state, tagLibraryChanged: !state.tagLibraryChanged };
    }
    case types.SET_CURRENDIRECTORYCOLOR: {
      if (state.currentDirectoryColor !== action.color) {
        return { ...state, currentDirectoryColor: action.color };
      }
      return state;
    }
    case types.SET_CURRENDIRECTORYPERSPECTIVE: {
      if (state.currentDirectoryPerspective !== action.perspective) {
        return { ...state, currentDirectoryPerspective: action.perspective };
      }
      return state;
    }
    case types.SET_IS_META_LOADED: {
      if (state.isMetaLoaded !== action.isMetaLoaded) {
        return { ...state, isMetaLoaded: action.isMetaLoaded };
      }
      return state;
    }
    case types.TOGGLE_EDIT_TAG_DIALOG: {
      return {
        ...state,
        tag: action.tag,
        editTagDialogOpened: !state.editTagDialogOpened
      };
    }
    case types.TOGGLE_ABOUT_DIALOG: {
      return { ...state, aboutDialogOpened: !state.aboutDialogOpened };
    }
    case types.TOGGLE_LOCATION_DIALOG: {
      return { ...state, locationDialogOpened: !state.locationDialogOpened };
    }
    case types.TOGGLE_ONBOARDING_DIALOG: {
      return {
        ...state,
        onboardingDialogOpened: !state.onboardingDialogOpened
      };
    }
    case types.TOGGLE_OPENLINK_DIALOG: {
      return {
        ...state,
        openLinkDialogOpened: !state.openLinkDialogOpened
      };
    }
    case types.TOGGLE_OPEN_PRO_TEASER_DIALOG: {
      let index = -1;
      const proTeaserIndex = getProTeaserSlideIndex(action.proTeaserPage);
      if (proTeaserIndex && proTeaserIndex > -1) {
        index = proTeaserIndex;
      } else if (state.proTeaserIndex === -1) {
        index = 0;
      }
      return {
        ...state,
        proTeaserIndex: index
      };
    }
    case types.TOGGLE_KEYBOARD_DIALOG: {
      return { ...state, keysDialogOpened: !state.keysDialogOpened };
    }
    case types.TOGGLE_NEW_ENTRY_DIALOG: {
      return {
        ...state,
        isNewEntryDialogOpened: !state.isNewEntryDialogOpened
      };
    }
    case types.TOGGLE_NEW_FILE_DIALOG: {
      return {
        ...state,
        isNewFileDialogOpened: !state.isNewFileDialogOpened
      };
    }
    case types.TOGGLE_DELETE_MULTIPLE_ENTRIES_DIALOG: {
      return {
        ...state,
        deleteMultipleEntriesDialogOpened: !state.deleteMultipleEntriesDialogOpened
      };
    }
    case types.TOGGLE_IMPORT_KANBAN_DIALOG: {
      return {
        ...state,
        importKanBanDialogOpened: !state.importKanBanDialogOpened
      };
    }
    case types.TOGGLE_LICENSE_DIALOG: {
      return { ...state, licenseDialogOpened: !state.licenseDialogOpened };
    }
    case types.TOGGLE_THIRD_PARTY_LIBS_DIALOG: {
      return {
        ...state,
        thirdPartyLibsDialogOpened: !state.thirdPartyLibsDialogOpened
      };
    }
    case types.TOGGLE_SETTINGS_DIALOG: {
      return { ...state, settingsDialogOpened: !state.settingsDialogOpened };
    }
    case types.TOGGLE_CREATE_DIRECTORY_DIALOG: {
      // dialog closed = null
      return {
        ...state,
        createDirectoryDialogOpened:
          state.createDirectoryDialogOpened !== null ? null : action.props
      };
    }
    case types.TOGGLE_UPLOAD_DIALOG: {
      // if (PlatformIO.haveObjectStoreSupport()) {
      // upload dialog have objectStore support only
      return {
        ...state,
        // progress: (state.uploadDialogOpened ? state.progress : []),
        uploadDialogOpened:
          state.uploadDialogOpened === undefined ? action.title : undefined
      };
      //}
      // return state;
    }
    case types.SET_CURRENT_DIRECTORY_DIRS: {
      return {
        ...state,
        currentDirectoryDirs: action.dirs
      };
    }
    case types.CLEAR_UPLOAD_DIALOG: {
      // if (PlatformIO.haveObjectStoreSupport()) {
      // upload dialog have objectStore support only
      return {
        ...state,
        progress: [],
        uploadDialogOpened: undefined
      };
      // }
      // return state;
    }
    case types.TOGGLE_PROGRESS_DIALOG: {
      return {
        ...state,
        progressDialogOpened: !state.progressDialogOpened
      };
    }
    case types.SET_SEARCH_RESULTS: {
      GlobalSearch.getInstance().setResults(action.searchResults);
      return {
        ...state,
        lastSearchTimestamp: new Date().getTime(),
        isLoading: false
      };
    }
    case types.EXIT_SEARCH_MODE: {
      GlobalSearch.getInstance().setResults([]);
      return {
        ...state,
        searchMode: false,
        lastSearchTimestamp: undefined,
        searchFilter: undefined,
        isLoading: false
      };
    }
    case types.ENTER_SEARCH_MODE: {
      GlobalSearch.getInstance().setResults([]);
      return {
        ...state,
        searchMode: true,
        searchFilter: undefined,
        isLoading: false
      };
    }
    case types.APPEND_SEARCH_RESULTS: {
      // const newDirEntries = [...state.currentDirectoryEntries];
      for (let i = 0; i < action.searchResults.length; i += 1) {
        const index = GlobalSearch.getInstance()
          .getResults()
          .findIndex(entry => entry.path === action.searchResults[i].path);
        if (index === -1) {
          GlobalSearch.getInstance().setResults([
            ...GlobalSearch.getInstance().getResults(),
            action.searchResults[i]
          ]);
        }
      }
      return {
        ...state,
        lastSearchTimestamp: new Date().getTime(),
        // currentDirectoryEntries: newDirEntries,
        isLoading: false
      };
    }
    case types.SET_SEARCH_FILTER: {
      return {
        ...state,
        searchFilter: action.searchFilter
      };
    }
    case types.SET_NOTIFICATION: {
      return {
        ...state,
        notificationStatus: {
          visible: action.visible,
          text: action.text,
          tid: action.tid,
          notificationType: action.notificationType,
          autohide: action.autohide
        }
      };
    }
    case types.SET_ISLOADING: {
      return {
        ...state,
        isLoading: action.isLoading
      };
    }
    case types.SET_GENERATING_THUMBNAILS: {
      return {
        ...state,
        isGeneratingThumbs: action.isGeneratingThumbs
      };
    }
    case types.OPEN_FILE: {
      return {
        ...state,
        openedFiles: [
          action.file
          // ...state.openedFiles // TODO uncomment for multiple file support
        ],
        ...(action.file.path === state.currentDirectoryPath &&
          action.file.description && {
            currentDirectoryDescription: action.file.description
          })
      };
    }
    case types.TOGGLE_ENTRY_FULLWIDTH: {
      return { ...state, isEntryInFullWidth: !state.isEntryInFullWidth };
    }
    case types.SET_ENTRY_FULLWIDTH: {
      return { ...state, isEntryInFullWidth: action.isFullWidth };
    }
    case types.UPDATE_THUMB_URL: {
      const dirEntries = state.currentDirectoryEntries.map(entry => {
        if (entry.path === action.filePath) {
          return { ...entry, thumbPath: action.thumbUrl };
        }
        return entry;
      });
      return {
        ...state,
        currentDirectoryEntries: dirEntries
      };
    }
    case types.UPDATE_THUMB_URLS: {
      const dirEntries = [...state.currentDirectoryEntries];
      for (let i = 0; i < dirEntries.length; i++) {
        const entry = dirEntries[i];
        const tmbURLs: any[] = action.tmbURLs;
        const tmbUrl = tmbURLs.find(tmbUrl => tmbUrl.filePath == entry.path);
        if (!tmbUrl) continue;
        dirEntries[i] = { ...entry };
        dirEntries[i].thumbPath = tmbUrl.tmbPath;
      }
      return {
        ...state,
        currentDirectoryEntries: dirEntries
      };
    }
    case types.REFLECT_DELETE_ENTRY: {
      const newDirectoryEntries = state.currentDirectoryEntries.filter(
        entry => entry.path !== action.path
      );
      const newOpenedFiles = state.openedFiles.filter(
        entry => entry.path !== action.path
      );
      const editedEntryPaths = [{ action: 'delete', path: action.path }];
      // check if currentDirectoryEntries or openedFiles changed
      if (
        state.currentDirectoryEntries.length > newDirectoryEntries.length ||
        state.openedFiles.length > newOpenedFiles.length
      ) {
        return {
          ...state,
          editedEntryPaths,
          currentDirectoryEntries: newDirectoryEntries,
          openedFiles: newOpenedFiles,
          isEntryInFullWidth: false
        };
      }
      return {
        ...state,
        editedEntryPaths
      };
    }
    case types.REFLECT_DELETE_ENTRIES: {
      const newDirectoryEntries = state.currentDirectoryEntries.filter(
        entry => !action.paths.some(path => path === entry.path)
      );
      const newOpenedFiles = state.openedFiles.filter(
        entry => !action.paths.some(path => path === entry.path)
      );
      const editedEntryPaths = action.paths.map(path => ({
        action: 'delete',
        path: path
      }));
      // check if currentDirectoryEntries or openedFiles changed
      if (
        state.currentDirectoryEntries.length > newDirectoryEntries.length ||
        state.openedFiles.length > newOpenedFiles.length
      ) {
        return {
          ...state,
          editedEntryPaths,
          currentDirectoryEntries: newDirectoryEntries,
          openedFiles: newOpenedFiles,
          isEntryInFullWidth: false
        };
      }
      return {
        ...state,
        editedEntryPaths
      };
    }
    case types.REFLECT_CREATE_ENTRY: {
      const newEntry: TS.FileSystemEntry = action.newEntry;
      // Prevent adding entry twice e.g. by entry rename in the watcher
      if (
        state.currentDirectoryEntries.some(
          entry => entry.path === newEntry.path
        )
      ) {
        return state;
      }
      const editedEntryPaths: Array<TS.EditedEntryPath> = [
        {
          action: newEntry.isFile ? 'createFile' : 'createDir',
          path: newEntry.path,
          uuid: newEntry.uuid
        }
      ];
      // clean all dir separators to have platform independent path match
      if (
        // entryIndex < 0 &&
        extractParentDirectoryPath(
          action.newEntry.path,
          PlatformIO.getDirSeparator()
        ).replace(/[/\\]/g, '') ===
        state.currentDirectoryPath.replace(/[/\\]/g, '')
      ) {
        return {
          ...state,
          editedEntryPaths,
          currentDirectoryEntries: [
            ...state.currentDirectoryEntries,
            action.newEntry
          ]
        };
      }
      return {
        ...state,
        editedEntryPaths
      };
    }
    case types.REFLECT_CREATE_ENTRIES: {
      if (
        action.fsEntries.length > 0 &&
        extractParentDirectoryPath(
          action.fsEntries[0].path,
          PlatformIO.getDirSeparator()
        ).replace(/[/\\]/g, '') ===
          state.currentDirectoryPath.replace(/[/\\]/g, '')
      ) {
        const editedEntryPaths: Array<TS.EditedEntryPath> = action.fsEntries.map(
          newEntry => ({
            action: newEntry.isFile ? 'createFile' : 'createDir',
            path: newEntry.path,
            uuid: newEntry.uuid
          })
        );
        return {
          ...state,
          editedEntryPaths,
          currentDirectoryEntries: [
            ...state.currentDirectoryEntries,
            ...action.fsEntries
          ]
        };
      }
      return state;
    }
    case types.REFLECT_RENAME_ENTRY: {
      const extractedTags = extractTagsAsObjects(
        action.newPath,
        AppConfig.tagDelimiter,
        PlatformIO.getDirSeparator()
      );

      const editedEntryPaths = [
        { action: 'rename', path: action.path },
        { action: 'rename', path: action.newPath }
      ];

      return {
        ...state,
        editedEntryPaths,
        currentDirectoryEntries: state.currentDirectoryEntries.map(entry => {
          if (entry.path !== action.path) {
            return entry;
          }
          const fileNameTags = entry.isFile ? extractedTags : []; // dirs dont have tags in filename
          return {
            ...entry,
            path: action.newPath,
            // thumbPath: getThumbFileLocationForFile(action.newPath, PlatformIO.getDirSeparator()), // not needed due timing issue
            name: extractFileName(action.newPath, PlatformIO.getDirSeparator()),
            extension: extractFileExtension(
              action.newPath,
              PlatformIO.getDirSeparator()
            ),
            tags: [
              ...entry.tags.filter(tag => tag.type !== 'plain'), //'sidecar'), // add only sidecar tags
              ...fileNameTags
            ]
          };
        }),
        openedFiles: state.openedFiles.map(entry => {
          if (entry.path !== action.path) {
            return entry;
          }
          const fileNameTags = entry.isFile ? extractedTags : []; // dirs dont have tags in filename
          // const { url, ...rest } = entry;
          const sidecarTags =
            entry.tags && entry.tags.length > 0
              ? entry.tags.filter(tag => tag.type !== 'plain')
              : [];
          return {
            ...entry,
            path: action.newPath, // TODO handle change extension case
            tags: [
              ...sidecarTags, // add only sidecar tags
              ...fileNameTags
            ]
            // shouldReload: true
          };
        })
      };
    }
    /* case types.REFLECT_UPDATE_SIDECARTAGS: {
      return {
        ...state,
        currentDirectoryEntries: state.currentDirectoryEntries.map(entry => {
          if (entry.path !== action.path) {
            return entry;
          }
          return {
            ...entry,
            tags: [
              ...entry.tags.filter(tag => tag.type === 'plain'),
              ...action.tags
            ]
          };
        }),
        openedFiles: state.openedFiles.map(entry => {
          if (entry.path !== action.path) {
            return entry;
          }
          return {
            ...entry,
            shouldReload: true
          };
        })
      };
    } */
    case types.UPDATE_CURRENTDIR_ENTRIES: {
      if (
        state.currentDirectoryEntries &&
        state.currentDirectoryEntries.length > 0
      ) {
        const newDirEntries = state.currentDirectoryEntries.map(
          currentEntry => {
            const updatedEntries = action.dirEntries.filter(
              newEntry => newEntry.path === currentEntry.path
            );
            if (updatedEntries && updatedEntries.length > 0) {
              const updatedEntry = updatedEntries.reduce(
                (prevValue, currentValue) => {
                  return merge(currentValue, prevValue);
                }
              );
              return merge(updatedEntry, currentEntry);
            }
            return currentEntry;
          }
        );

        return {
          ...state,
          currentDirectoryEntries: newDirEntries
        };
      }
      return {
        ...state,
        currentDirectoryEntries: action.dirEntries
      };
    }
    case types.REFLECT_EDITED_ENTRY_PATHS: {
      return {
        ...state,
        editedEntryPaths: action.editedEntryPaths // .map(path => ({ action: 'edit', path }))
      };
    }
    case types.UPDATE_CURRENTDIR_ENTRY: {
      return {
        ...state,
        // warning: edit action is handled in FolderContainer; to reload column in KanBan if properties is changed (dir color)
        // editedEntryPaths: [{ action: 'edit', path: action.path }],
        currentDirectoryEntries: updateFsEntries(
          state.currentDirectoryEntries,
          [action.entry]
        )
      };
    }
    /* case types.REFLECT_UPDATE_SIDECARMETA: {
      return {
        ...state,
        currentDirectoryEntries: state.currentDirectoryEntries.map(entry => {
          if (entry.path !== action.path) {
            return entry;
          }
          return {
            ...entry,
            ...action.entryMeta
          };
        }),
        openedFiles: state.openedFiles.map(entry => {
          if (entry.path !== action.path) {
            return entry;
          }
          return {
            ...entry,
            shouldReload: true
          };
        })
      };
    } */
    case types.CLOSE_ALL_FILES: {
      clearURLParam('tsepath');
      return {
        ...state,
        openedFiles: [],
        isEntryInFullWidth: false
      };
    }
    case types.OPEN_LOCATIONMANAGER_PANEL: {
      return {
        ...state,
        locationManagerPanelOpened: true,
        tagLibraryPanelOpened: false,
        searchPanelOpened: false,
        helpFeedbackPanelOpened: false
      };
    }
    case types.OPEN_TAGLIBRARY_PANEL: {
      return {
        ...state,
        locationManagerPanelOpened: false,
        tagLibraryPanelOpened: true,
        searchPanelOpened: false,
        helpFeedbackPanelOpened: false
      };
    }
    case types.OPEN_SEARCH_PANEL: {
      return {
        ...state,
        locationManagerPanelOpened: false,
        tagLibraryPanelOpened: false,
        searchPanelOpened: true,
        helpFeedbackPanelOpened: false
      };
    }
    case types.OPEN_HELPFEEDBACK_PANEL: {
      return {
        ...state,
        locationManagerPanelOpened: false,
        tagLibraryPanelOpened: false,
        searchPanelOpened: false,
        helpFeedbackPanelOpened: true
      };
    }
    /*case types.CLOSE_ALLVERTICAL_PANELS: {
      return {
        ...state,
        locationManagerPanelOpened: false,
        tagLibraryPanelOpened: false,
        searchPanelOpened: false,
        helpFeedbackPanelOpened: false
      };
    }*/
    case types.ADD_EXTENSIONS: {
      const extensions = mergeByProp(
        state.extensions,
        action.extensions,
        'extensionId'
      );
      return {
        ...state,
        extensions: extensions.map(ext => {
          if (action.enabledExtensions.includes(ext.extensionId)) {
            return { ...ext, extensionEnabled: true };
          }
          return ext;
        })
      };
    }
    case types.UPDATE_EXTENSION: {
      return {
        ...state,
        extensions: mergeByProp(
          state.extensions,
          [action.extension],
          'extensionId'
        ) // updateExtensions(state.extensions, action.extension)
      };
    }
    case types.REMOVE_EXTENSIONS: {
      return {
        ...state,
        extensions: state.extensions.filter(
          ext => ext.extensionId !== action.extensionId
        )
      };
    }
    default: {
      return state;
    }
  }
};

function disableBackGestureMac() {
  if (AppConfig.isMacLike) {
    const element = document.getElementById('root');
    element.addEventListener('touchstart', (e: MouseEvent) => {
      // is not near edge of view, exit
      if (e.pageX > 10 && e.pageX < window.innerWidth - 10) return;

      // prevent swipe to navigate gesture
      e.preventDefault();
    });
  }
}

export const actions = {
  addExtensions: (extensions: Array<TS.Extension>) => (
    dispatch: (action) => void,
    getState: () => any
  ) => {
    const { settings } = getState();
    dispatch(actions.addExtensionsInt(extensions, settings.enabledExtensions));
  },
  addExtensionsInt: (
    extensions: Array<TS.Extension>,
    enabledExtensions: Array<string>
  ) => ({
    type: types.ADD_EXTENSIONS,
    extensions,
    enabledExtensions
  }),
  removeExtension: (extensionId: string) => ({
    type: types.REMOVE_EXTENSIONS,
    extensionId
  }),
  updateExtension: (extension: TS.Extension) => ({
    type: types.UPDATE_EXTENSION,
    extension
  }),
  setLastBackgroundImageChange: (folderPath, lastBackgroundImageChange) => ({
    type: types.LAST_BACKGROUND_IMAGE_CHANGE,
    folderPath,
    lastBackgroundImageChange
  }),
  setLastBackgroundColorChange: (folderPath, lastBackgroundColorChange) => ({
    type: types.LAST_BACKGROUND_COLOR_CHANGE,
    folderPath,
    lastBackgroundColorChange
  }),
  /**
   * @param thumbPath
   * @param lastThumbnailImageChange - timestamp set -1 if thumbnail image deleted
   */
  setLastThumbnailImageChange: (thumbPath, lastThumbnailImageChange?) => ({
    type: types.LAST_THUMBNAIL_IMAGE_CHANGE,
    thumbPath,
    lastThumbnailImageChange: lastThumbnailImageChange || new Date().getTime()
  }),
  loggedIn: user => ({ type: types.LOGIN_SUCCESS, user }),
  initApp: () => (dispatch: (action) => void, getState: () => any) => {
    disableBackGestureMac();
    // migrate TagLibrary from redux state
    const { taglibrary } = getState();
    if (taglibrary && taglibrary.length > 0) {
      try {
        setTagLibrary(taglibrary);
        dispatch(tagLibraryActions.deleteAll());
      } catch (e) {
        console.error('migrate TagLibrary failed', e);
      }
    }

    dispatch(SettingsActions.setZoomRestoreApp());
    dispatch(SettingsActions.upgradeSettings()); // TODO call this only on app version update
    const state = getState();
    if (getCheckForUpdateOnStartup(state)) {
      dispatch(SettingsActions.checkForUpdate());
    }
    if (isFirstRun(state)) {
      dispatch(actions.toggleOnboardingDialog());
      dispatch(actions.toggleLicenseDialog());
    }
    setTimeout(() => {
      PlatformIO.setGlobalShortcuts(isGlobalKeyBindingEnabled(state));
      PlatformIO.loadExtensions();
    }, 1000);
    const langURLParam = getURLParameter('locale');
    if (
      langURLParam &&
      langURLParam.length > 1 &&
      /^[a-zA-Z\-_]+$/.test('langURLParam')
    ) {
      dispatch(SettingsActions.setLanguage(langURLParam));
    }

    let openDefaultLocation = true;
    const lid = getURLParameter('tslid');
    const dPath = getURLParameter('tsdpath');
    const ePath = getURLParameter('tsepath');
    const cmdOpen = getURLParameter('cmdopen');
    if (lid || dPath || ePath) {
      openDefaultLocation = false;
      setTimeout(() => {
        dispatch(actions.openLink(window.location.href));
      }, 1000);
    } else if (cmdOpen) {
      openDefaultLocation = false;
      setTimeout(() => {
        dispatch(
          actions.openLink(
            // window.location.href.split('?')[0] +
            'ts://?cmdopen=' + cmdOpen,
            { fullWidth: true }
          )
        );
      }, 1000);
    }
    const defaultLocationId = getDefaultLocationId(state);
    if (
      openDefaultLocation &&
      defaultLocationId &&
      defaultLocationId.length > 0
    ) {
      dispatch(actions.openLocationById(defaultLocationId));
    }
  },
  goOnline: () => ({ type: types.DEVICE_ONLINE }),
  goOffline: () => ({ type: types.DEVICE_OFFLINE }),
  setUpdateAvailable: (isUpdateAvailable: boolean) => ({
    type: types.SET_NEW_VERSION_AVAILABLE,
    isUpdateAvailable
  }),
  setProgress: (path, progress, abort?, filePath = undefined) => ({
    type: types.PROGRESS,
    path,
    filePath,
    progress,
    abort
  }),
  resetProgress: () => ({ type: types.RESET_PROGRESS }),
  onUploadProgress: (progress, abort, fileName = undefined) => (
    dispatch: (action) => void
  ) => {
    const progressPercentage = Math.round(
      (progress.loaded / progress.total) * 100
    );
    console.log(progressPercentage);

    dispatch(
      actions.setProgress(progress.key, progressPercentage, abort, fileName)
    );
  },
  showCreateDirectoryDialog: () => (
    dispatch: (action) => void,
    getState: () => any
  ) => {
    const { app } = getState();
    if (!app.currentDirectoryPath) {
      dispatch(
        actions.showNotification(
          i18n.t('core:firstOpenaFolder'),
          'warning',
          true
        )
      );
    } else {
      dispatch(actions.toggleCreateDirectoryDialog());
    }
  },
  showCreateFileDialog: () => (
    dispatch: (action) => void,
    getState: () => any
  ) => {
    const { app } = getState();
    if (!app.currentDirectoryPath) {
      dispatch(
        actions.showNotification(
          i18n.t('core:firstOpenaFolder'),
          'warning',
          true
        )
      );
    } else {
      dispatch(actions.toggleNewEntryDialog());
    }
  },
  toggleEditTagDialog: (tag: TS.Tag) => ({
    type: types.TOGGLE_EDIT_TAG_DIALOG,
    tag
  }),
  toggleAboutDialog: () => ({ type: types.TOGGLE_ABOUT_DIALOG }),
  toggleLocationDialog: () => ({ type: types.TOGGLE_LOCATION_DIALOG }),
  toggleOnboardingDialog: () => ({ type: types.TOGGLE_ONBOARDING_DIALOG }),
  toggleKeysDialog: () => ({ type: types.TOGGLE_KEYBOARD_DIALOG }),
  toggleOpenLinkDialog: () => ({ type: types.TOGGLE_OPENLINK_DIALOG }),
  toggleProTeaser: (slidePage?: string) => ({
    type: types.TOGGLE_OPEN_PRO_TEASER_DIALOG,
    proTeaserPage: slidePage
  }),
  toggleLicenseDialog: () => ({ type: types.TOGGLE_LICENSE_DIALOG }),
  toggleThirdPartyLibsDialog: () => ({
    type: types.TOGGLE_THIRD_PARTY_LIBS_DIALOG
  }),
  toggleSettingsDialog: () => ({ type: types.TOGGLE_SETTINGS_DIALOG }),
  toggleCreateDirectoryDialog: (props = undefined) => ({
    type: types.TOGGLE_CREATE_DIRECTORY_DIALOG,
    props
  }),
  toggleNewEntryDialog: () => ({ type: types.TOGGLE_NEW_ENTRY_DIALOG }),
  toggleNewFileDialog: () => ({ type: types.TOGGLE_NEW_FILE_DIALOG }),
  toggleDeleteMultipleEntriesDialog: () => ({
    type: types.TOGGLE_DELETE_MULTIPLE_ENTRIES_DIALOG
  }),
  toggleImportKanBanDialog: () => ({
    type: types.TOGGLE_IMPORT_KANBAN_DIALOG
  }),
  toggleUploadDialog: (title = '') => ({
    type: types.TOGGLE_UPLOAD_DIALOG,
    title
  }),
  setCurrentDirectoryDirs: dirs => ({
    type: types.SET_CURRENT_DIRECTORY_DIRS,
    dirs
  }),
  /*clearUploadDialog: () => (
    dispatch: (action) => void
    // getState: () => any
  ) => {
    // const currentLocation: Location = getState().locations.find(location => location.uuid === getCurrentLocationId(getState()))
    if (PlatformIO.haveObjectStoreSupport()) {
      // && currentLocation.type === locationType.TYPE_AMPLIFY) {
      dispatch(actions.clearUploadDialogInt());
      // const { currentDirectoryPath } = getState().app;
      // dispatch(actions.loadDirectoryContent(currentDirectoryPath, false));
    }
  },*/
  clearUploadDialog: () => ({
    type: types.CLEAR_UPLOAD_DIALOG
  }),
  toggleProgressDialog: () => ({
    type: types.TOGGLE_PROGRESS_DIALOG
  }),
  openLocationManagerPanel: () => ({ type: types.OPEN_LOCATIONMANAGER_PANEL }),
  openTagLibraryPanel: () => ({ type: types.OPEN_TAGLIBRARY_PANEL }),
  openSearchPanel: () => ({ type: types.OPEN_SEARCH_PANEL }),
  openHelpFeedbackPanel: () => ({ type: types.OPEN_HELPFEEDBACK_PANEL }),
  //closeAllVerticalPanels: () => ({ type: types.CLOSE_ALLVERTICAL_PANELS }),
  setIsLoading: (isLoading: boolean) => ({
    type: types.SET_ISLOADING,
    isLoading
  }),
  /* setMetaForCurrentDir: (metaFiles: Array<any>) => (
    dispatch: (action: any) => void,
    getState: () => any
  ) => {
    const state = getState();
    const {
      currentDirectoryPath,
      currentDirectoryColor,
      currentDirectoryPerspective
    } = state.app;
    if (
      metaFiles.some(metaFile => metaFile.path === AppConfig.metaFolderFile)
      // && !props.currentDirectoryColor
    ) {
      const metaFilePath = getMetaFileLocationForDir(
        currentDirectoryPath,
        PlatformIO.getDirSeparator()
      );
      loadJSONFile(metaFilePath)
        .then((fsEntryMeta: TS.FileSystemEntryMeta) => {
          if (
            fsEntryMeta.color &&
            currentDirectoryColor !== fsEntryMeta.color
          ) {
            dispatch(actions.setCurrentDirectoryColor(fsEntryMeta.color));
          }
          if (
            fsEntryMeta.perspective &&
            fsEntryMeta.perspective !== PerspectiveIDs.UNSPECIFIED &&
            currentDirectoryPerspective !== fsEntryMeta.perspective
          ) {
            dispatch(
              actions.setCurrentDirectoryPerspective(fsEntryMeta.perspective)
            );
          }
          return fsEntryMeta;
        })
        .catch(err => {
          console.error(err);
        });
    }
  }, */
  loadParentDirectoryContent: () => (
    dispatch: (action) => void,
    getState: () => any
  ) => {
    const state = getState();
    const { currentDirectoryPath } = state.app;
    const currentLocationPath = normalizePath(getCurrentLocationPath(state));

    dispatch(actions.setIsLoading(true));

    if (currentDirectoryPath) {
      const parentDirectory = extractParentDirectoryPath(
        currentDirectoryPath,
        PlatformIO.getDirSeparator()
      );
      // console.log('parentDirectory: ' + parentDirectory  + ' - currentLocationPath: ' + currentLocationPath);
      if (parentDirectory.includes(currentLocationPath)) {
        dispatch(actions.loadDirectoryContent(parentDirectory, false, true));
      } else {
        dispatch(
          actions.showNotification(
            i18n.t('core:parentDirNotInLocation'),
            'warning',
            true
          )
        );
        dispatch(actions.setIsLoading(false));
      }
    } else {
      dispatch(
        actions.showNotification(
          i18n.t('core:firstOpenaFolder'),
          'warning',
          true
        )
      );
      dispatch(actions.setIsLoading(false));
    }
  },
  updateCurrentDirectoryPerspective: (perspective: string) => (
    dispatch: (action) => void,
    getState: () => any
  ) => {
    const { currentDirectoryPerspective } = getState();
    if (perspective) {
      if (currentDirectoryPerspective !== perspective) {
        dispatch(actions.setCurrentDirectoryPerspective(perspective));
      }
    } else if (currentDirectoryPerspective !== PerspectiveIDs.UNSPECIFIED) {
      dispatch(
        actions.setCurrentDirectoryPerspective(PerspectiveIDs.UNSPECIFIED)
      );
    }
  },
  loadDirectoryContentInt: (
    directoryPath: string,
    generateThumbnails: boolean,
    fsEntryMeta?: TS.FileSystemEntryMeta
  ) => (dispatch: (action) => void, getState: () => any) => {
    const { settings } = getState();

    /* const { currentDirectoryPath } = getState().app;
    if (currentDirectoryPath !== directoryPath) {
      dispatch(actions.loadDirectorySuccessInt(directoryPath, [], true)); // this is to reset directoryContent (it will reset color too)
    } */
    // dispatch(actions.setCurrentDirectoryColor('')); // this is to reset color only
    dispatch(actions.showNotification(i18n.t('core:loading'), 'info', false));
    const currentLocation: TS.Location = getLocation(
      getState(),
      getState().app.currentLocationId
    );
    const resultsLimit = {
      maxLoops: currentLocation.maxLoops
        ? currentLocation.maxLoops
        : AppConfig.maxLoops,
      IsTruncated: false
    };
    PlatformIO.listDirectoryPromise(
      directoryPath,
      fsEntryMeta &&
        fsEntryMeta.perspective &&
        (fsEntryMeta.perspective === PerspectiveIDs.KANBAN ||
          fsEntryMeta.perspective === PerspectiveIDs.GALLERY)
        ? ['extractThumbPath']
        : [], // mode,
      currentLocation ? currentLocation.ignorePatternPaths : [],
      resultsLimit
    )
      .then(results => {
        if (resultsLimit.IsTruncated) {
          dispatch(
            actions.showNotification(
              i18n.t('warningDirectoryIsTruncated') + ': ' + directoryPath,
              'error',
              false
            )
          );
        }
        updateHistory(currentLocation, directoryPath);
        if (results !== undefined) {
          // console.debug('app listDirectoryPromise resolved:' + results.length);
          prepareDirectoryContent(
            results,
            directoryPath,
            settings,
            dispatch,
            getState,
            fsEntryMeta,
            generateThumbnails
          );
        }
        dispatch(
          actions.updateCurrentDirectoryPerspective(
            fsEntryMeta ? fsEntryMeta.perspective : undefined
          )
        );
        return true;
      })
      .catch(error => {
        // console.timeEnd('listDirectoryPromise');
        dispatch(actions.loadDirectoryFailure(directoryPath, error));
        dispatch(
          actions.updateCurrentDirectoryPerspective(
            fsEntryMeta ? fsEntryMeta.perspective : undefined
          )
        );
      });
  },
  loadDirectoryContent: (
    directoryPath: string,
    generateThumbnails: boolean,
    loadDirMeta = false
  ) => async (dispatch: (action) => void, getState: () => any) => {
    // console.debug('loadDirectoryContent:' + directoryPath);
    window.walkCanceled = false;

    dispatch(actions.setIsLoading(true));

    const state = getState();
    const { selectedEntries } = state.app;
    if (selectedEntries.length > 0) {
      dispatch(actions.setSelectedEntries([]));
    }
    if (loadDirMeta) {
      try {
        const metaFilePath = getMetaFileLocationForDir(
          directoryPath,
          PlatformIO.getDirSeparator()
        );
        const fsEntryMeta = await loadJSONFile(metaFilePath);
        /* const fsEntryMeta = await loadMetaDataPromise(
          normalizePath(directoryPath) + PlatformIO.getDirSeparator()
        ); */
        // console.debug('Loading meta succeeded for:' + directoryPath);
        dispatch(
          actions.loadDirectoryContentInt(
            directoryPath,
            generateThumbnails,
            fsEntryMeta
          )
        );
      } catch (err) {
        console.debug('Error loading meta of:' + directoryPath + ' ' + err);
        dispatch(
          actions.loadDirectoryContentInt(directoryPath, generateThumbnails)
        );
      }
    } else {
      dispatch(
        actions.loadDirectoryContentInt(directoryPath, generateThumbnails)
      );
    }
  },
  loadDirectorySuccess: (
    directoryPath: string,
    directoryContent: Array<any>,
    directoryMeta?: TS.FileSystemEntryMeta
  ) => (dispatch: (action) => void, getState: () => any) => {
    // const currentLocation: Location = getLocation(
    //  getState(),
    //  getState().app.currentLocationId
    // );
    // const { openedFiles } = getState().app;
    // const entryPath =
    //  openedFiles && openedFiles.length > 0 && openedFiles[0].path;
    // updateHistory(currentLocation, directoryPath, entryPath);
    /* const { selectedEntries } = getState().app;
    if (selectedEntries.length > 0) {
      // check and remove obsolete selectedEntries
      const newSelectedEntries = selectedEntries.filter(
        (entry: FileSystemEntry) =>
          directoryContent.some(
            (fsEntry: FileSystemEntry) => fsEntry.path === entry.path
          )
      );
      if (newSelectedEntries.length !== selectedEntries.length) {
        dispatch(actions.setSelectedEntries(newSelectedEntries));
      }
    } */
    const { settings } = getState();
    dispatch(actions.hideNotifications(['error']));
    dispatch(
      actions.loadDirectorySuccessInt(
        directoryPath,
        directoryContent,
        false,
        directoryMeta,
        settings.defaultPerspective
      )
    );
    dispatch(actions.setIsMetaLoaded(false));
  },
  loadDirectorySuccessInt: (
    directoryPath: string,
    directoryContent: Array<any>,
    showIsLoading?: boolean,
    directoryMeta?: TS.FileSystemEntryMeta,
    defaultPerspective?: string
  ) => ({
    type: types.LOAD_DIRECTORY_SUCCESS,
    directoryPath: directoryPath || PlatformIO.getDirSeparator(),
    directoryContent,
    directoryMeta,
    showIsLoading,
    defaultPerspective
  }),
  setDirectoryMeta: (directoryMeta: TS.FileSystemEntryMeta) => ({
    type: types.SET_DIRECTORY_META,
    directoryMeta
  }),
  loadDirectoryFailure: (directoryPath: string, error?: any) => (
    dispatch: (action) => void
  ) => {
    console.error('Error loading directory: ', error);
    dispatch(actions.hideNotifications());

    dispatch(
      actions.showNotification(
        i18n.t('core:errorLoadingFolder') + ': ' + error.message,
        'warning',
        false
      )
    );
    dispatch(actions.closeAllLocations());
    // dispatch(actions.loadDirectorySuccess(directoryPath, []));
  },
  updateThumbnailUrl: (filePath: string, thumbUrl: string) => ({
    type: types.UPDATE_THUMB_URL,
    filePath,
    thumbUrl // + '?' + new Date().getTime()
  }),
  updateThumbnailUrls: (tmbURLs: Array<any>) => ({
    type: types.UPDATE_THUMB_URLS,
    tmbURLs
  }),
  setGeneratingThumbnails: (isGeneratingThumbs: boolean) => ({
    type: types.SET_GENERATING_THUMBNAILS,
    isGeneratingThumbs
  }),
  /* setGeneratingThumbnails: (isGeneratingThumbs: boolean) => (
    dispatch: (actions: Object) => void
  ) => {
    dispatch(actions.hideNotifications());
    if (isGeneratingThumbs) {
      dispatch(
        actions.showNotification(
          i18n.t('core:loadingOrGeneratingThumbnails'),
          'info',
          true
        )
      );
    } else {
      console.log('Thumbnail generation ready');
      // dispatch(
      //   actions.showNotification(
      //     i18n.t('Thumbnail ready'),
      //     'info',
      //     true
      //   )
      // );
    }
  }, */
  /* setLastSelectedEntry: (entryPath: string | null) => ({
    type: types.SET_LAST_SELECTED_ENTRY,
    entryPath
  }), */
  setCurrentDirectoryColor: (color: string) => ({
    type: types.SET_CURRENDIRECTORYCOLOR,
    color
  }),
  setCurrentDirectoryPerspective: (perspective: string) => ({
    type: types.SET_CURRENDIRECTORYPERSPECTIVE,
    perspective
  }),
  setIsMetaLoaded: (isMetaLoaded: boolean) => ({
    type: types.SET_IS_META_LOADED,
    isMetaLoaded
  }),
  setSelectedEntries: (selectedEntries: Array<TS.FileSystemEntry>) => (
    dispatch: (action) => void
  ) => {
    // const { openedFiles } = getState().app;
    // skip select other file if its have openedFiles in editMode
    // if (openedFiles.length === 0 || !openedFiles[0].editMode) {
    dispatch(actions.setSelectedEntriesInt(selectedEntries));
    // }
  },
  setSelectedEntriesInt: (selectedEntries: Array<TS.FileSystemEntry>) => ({
    type: types.SET_SELECTED_ENTRIES,
    selectedEntries
  }),
  addTag: (tag: any, parentTagGroupUuid: TS.Uuid) => (
    dispatch: (action) => void,
    getState: () => any
  ) => {
    const { locations } = getState();
    addTag(tag, parentTagGroupUuid, getTagLibrary(), locations);
    dispatch(actions.tagLibraryChanged());
  },
  tagLibraryChanged: () => ({
    type: types.SET_TAG_LIBRARY_CHANGED
  }),
  deleteDirectory: (directoryPath: string) => (
    dispatch: (action) => void,
    getState: () => any
  ) => {
    const { settings } = getState();
    const { currentDirectoryPath, openedFiles } = getState().app;
    return PlatformIO.deleteDirectoryPromise(
      directoryPath,
      settings.useTrashCan
    )
      .then(() => {
        if (directoryPath === currentDirectoryPath) {
          dispatch(actions.loadParentDirectoryContent());
          GlobalSearch.getInstance().reflectDeleteEntry(directoryPath);
          // close opened entries in deleted dir
          if (
            openedFiles.length > 0 &&
            openedFiles.some(
              file =>
                extractContainingDirectoryPath(
                  file.path,
                  PlatformIO.getDirSeparator()
                ) === directoryPath
            )
          ) {
            dispatch(actions.closeAllFiles());
          }
        } else {
          dispatch(actions.reflectDeleteEntry(directoryPath));
        }
        dispatch(
          actions.showNotification(
            i18n.t('deletingDirectorySuccessfull', {
              dirPath: extractDirectoryName(
                directoryPath,
                PlatformIO.getDirSeparator()
              )
            }),
            'default',
            true
          )
        );
        return true;
      })
      .catch(error => {
        console.warn('Error while deleting directory: ' + error);
        dispatch(
          actions.showNotification(
            i18n.t('errorDeletingDirectoryAlert', {
              dirPath: extractDirectoryName(
                directoryPath,
                PlatformIO.getDirSeparator()
              )
            }),
            'error',
            true
          )
        );
        // dispatch stopLoadingAnimation
      });
  },
  openDirectory: (directoryPath: string) => () => {
    PlatformIO.openDirectory(directoryPath);
  },
  showInFileManager: (filePath: string) => () => {
    PlatformIO.showInFileManager(filePath);
  },
  renameDirectory: (directoryPath: string, newDirectoryName: string) => (
    dispatch: (action) => void,
    getState: () => any
  ) =>
    PlatformIO.renameDirectoryPromise(directoryPath, newDirectoryName)
      .then(newDirPath => {
        const { currentDirectoryPath, openedFiles } = getState().app;
        if (currentDirectoryPath === directoryPath) {
          dispatch(actions.loadDirectoryContent(newDirPath, false, true));
          if (openedFiles && openedFiles.length > 0) {
            if (openedFiles[0].path === directoryPath) {
              const openedFile = openedFiles[0];
              openedFile.path = newDirPath;
              dispatch(actions.addToEntryContainer(openedFile));
            }
          }
          GlobalSearch.getInstance().reflectRenameEntry(
            directoryPath,
            newDirPath
          );
        } else {
          dispatch(actions.reflectRenameEntry(directoryPath, newDirPath));
        }

        dispatch(
          actions.showNotification(
            `Renaming directory ${extractDirectoryName(
              directoryPath,
              PlatformIO.getDirSeparator()
            )} successful.`,
            'default',
            true
          )
        );
        return true;
      })
      .catch(error => {
        console.warn('Error while renaming directory: ' + error);
        dispatch(
          actions.showNotification(
            `Error renaming directory '${extractDirectoryName(
              directoryPath,
              PlatformIO.getDirSeparator()
            )}'`,
            'error',
            true
          )
        );
        throw error;
      }),
  createDirectory: (directoryPath: string, reflect = true) => (
    dispatch: (action) => void
  ) =>
    PlatformIO.createDirectoryPromise(directoryPath)
      .then(result => {
        if (result !== undefined && result.dirPath !== undefined) {
          // eslint-disable-next-line no-param-reassign
          directoryPath = result.dirPath;
        }
        console.log(`Creating directory ${directoryPath} successful.`);
        if (reflect) {
          dispatch(actions.reflectCreateEntry(directoryPath, false));
        }
        dispatch(
          actions.showNotification(
            `Creating directory ${extractDirectoryName(
              directoryPath,
              PlatformIO.getDirSeparator()
            )} successful.`,
            'default',
            true
          )
        );
        return true;
      })
      .catch(error => {
        console.warn('Error creating directory: ' + error);
        dispatch(
          actions.showNotification(
            `Error creating directory '${extractDirectoryName(
              directoryPath,
              PlatformIO.getDirSeparator()
            )}'`,
            'error',
            true
          )
        );
        return false;
        // dispatch stopLoadingAnimation
      }),
  createFile: () => (dispatch: (action) => void, getState: () => any) => {
    const { app } = getState();
    if (app.currentDirectoryPath) {
      const filePath =
        app.currentDirectoryPath +
        PlatformIO.getDirSeparator() +
        'textfile' +
        AppConfig.beginTagContainer +
        formatDateTime4Tag(new Date(), true) +
        AppConfig.endTagContainer +
        '.txt';
      PlatformIO.saveFilePromise({ path: filePath }, '', true)
        .then(() => {
          dispatch(actions.reflectCreateEntry(filePath, true));
          dispatch(
            actions.showNotification(
              i18n.t('core:fileCreateSuccessfully'),
              'info',
              true
            )
          );
          getAllPropertiesPromise(filePath)
            .then((fsEntry: TS.FileSystemEntry) => {
              dispatch(actions.openFsEntry(fsEntry)); // TODO return fsEntry from saveFilePromise and simplify
              // dispatch(actions.setSelectedEntries([fsEntry])); -> moved in reflectCreateEntry
              return true;
            })
            .catch(error =>
              console.warn(
                'Error getting properties for entry: ' +
                  filePath +
                  ' - ' +
                  error
              )
            );
          return true;
        })
        .catch(err => {
          console.warn('File creation failed with ' + err);
          dispatch(
            actions.showNotification(
              i18n.t('core:errorCreatingFile'),
              'warning',
              true
            )
          );
        });
    } else {
      dispatch(
        actions.showNotification(
          i18n.t('core:firstOpenaFolder'),
          'warning',
          true
        )
      );
    }
  },
  createFileAdvanced: (
    targetPath: string,
    fileName: string,
    content: string,
    fileType: 'md' | 'txt' | 'html'
  ) => (dispatch: (action) => void, getState: () => any) => {
    const creationDate = new Date().toISOString();
    const fileNameAndExt = fileName + '.' + fileType;
    const creationMeta =
      'Created in ' +
      versionMeta.name +
      ' on ' +
      creationDate.substring(0, 10) +
      '.';
    const filePath =
      normalizePath(targetPath) + PlatformIO.getDirSeparator() + fileNameAndExt;
    let fileContent = content;
    if (fileType === 'html') {
      const { newHTMLFileContent } = getState().settings;
      fileContent =
        newHTMLFileContent.split('<body></body>')[0] +
        '<body data-createdwith="' +
        versionMeta.name +
        '" data-createdon="' +
        creationDate +
        '" >' +
        content +
        '\n<br />\n' +
        creationMeta +
        '\n';
      '</body>' + newHTMLFileContent.split('<body></body>')[1];
    } else if (fileType === 'md') {
      fileContent = content + ' \n\n' + creationMeta + '\n';
    }
    PlatformIO.saveFilePromise({ path: filePath }, fileContent, false)
      .then((fsEntry: TS.FileSystemEntry) => {
        dispatch(actions.reflectCreateEntry(filePath, true));
        dispatch(actions.openFsEntry(fsEntry)); // TODO return fsEntry from saveFilePromise and simplify

        // dispatch(actions.setSelectedEntries([fsEntry]));
        dispatch(
          actions.showNotification(
            `File '${fileNameAndExt}' created.`,
            'default',
            true
          )
        );
        return true;
      })
      .catch(error => {
        console.warn('Error creating file: ' + error);
        dispatch(
          actions.showNotification(
            `Error creating file '${fileNameAndExt}'`,
            'error',
            true
          )
        );
      });
  },
  setSearchResults: (searchResults: Array<any> | []) => ({
    type: types.SET_SEARCH_RESULTS,
    searchResults
  }),
  exitSearchMode: () => (dispatch: (action) => void, getState: () => any) => {
    const { searchMode } = getState().app;
    if (searchMode) {
      dispatch(actions.exitSearchModeInt());
    }
  },
  exitSearchModeInt: () => ({
    type: types.EXIT_SEARCH_MODE
  }),
  enterSearchMode: () => (dispatch: (action) => void, getState: () => any) => {
    const { searchMode } = getState().app;
    if (!searchMode) {
      dispatch(actions.enterSearchModeInt());
    }
  },
  enterSearchModeInt: () => ({
    type: types.ENTER_SEARCH_MODE
  }),
  appendSearchResults: (searchResults: Array<any> | []) => ({
    type: types.APPEND_SEARCH_RESULTS,
    searchResults
  }),
  setSearchFilter: (searchFilter: string) => ({
    type: types.SET_SEARCH_FILTER,
    searchFilter
  }),
  setCurrentLocationId: (locationId: string | null) => ({
    type: types.SET_CURRENLOCATIONID,
    locationId
  }),
  changeLocation: (location: TS.Location) => (dispatch: (action) => void) => {
    dispatch(actions.changeLocationByID(location.uuid));
  },
  changeLocationByID: (locationId: string) => (
    dispatch: (action) => void,
    getState: () => any
  ) => {
    const { currentLocationId } = getState().app;
    if (locationId !== currentLocationId) {
      // dispatch(actions.exitSearchMode());
      dispatch(LocationIndexActions.clearDirectoryIndex());
      dispatch(actions.setCurrentLocationId(locationId));
    }
  },
  switchLocationTypeByID: (locationID: string) => (
    dispatch: (action) => Promise<string | null>,
    getState: () => any
  ): Promise<string | null> => {
    const location: TS.Location = getLocation(getState(), locationID);
    return dispatch(actions.switchLocationType(location));
  },
  /**
   * @param location
   * return Promise<currentLocationId> if location is changed or null if location and type is changed
   */
  switchLocationType: (location: TS.Location) => (
    dispatch: (action) => string | null,
    getState: () => any
  ): Promise<string | null> => {
    const { currentLocationId } = getState().app;
    if (location.uuid !== currentLocationId) {
      const currentLocation: TS.Location = getLocation(
        getState(),
        currentLocationId
      );
      if (
        currentLocation === undefined ||
        location.type !== currentLocation.type
      ) {
        return setLocationType(location).then(() => null);
      } else {
        // handle the same location type but different location
        // dispatch(actions.setCurrentLocationId(location.uuid));
        return setLocationType(location).then(() => currentLocationId);
      }
    }
    return Promise.resolve(null);
  },
  switchCurrentLocationType: (currentLocationId?: string) => (
    dispatch: (action) => boolean,
    getState: () => any
  ): Promise<boolean> => {
    // dispatch(actions.setCurrentLocationId(location.uuid));
    const location: TS.Location = getLocation(
      getState(),
      currentLocationId || getState().app.currentLocationId
    );

    return setLocationType(location);
  },
  openLocationById: (locationId: string, skipInitialDirList?: boolean) => (
    dispatch: (action) => void,
    getState: () => any
  ) => {
    const { locations } = getState();
    locations.map(location => {
      if (location.uuid === locationId) {
        dispatch(actions.openLocation(location, skipInitialDirList));
      }
      return true;
    });
  },
  openLocation: (location: TS.Location, skipInitialDirList?: boolean) => (
    dispatch: (action) => void,
    getState: () => any
  ) => {
    if (Pro && Pro.Watcher) {
      Pro.Watcher.stopWatching();
    }
    if (location.type === locationType.TYPE_CLOUD) {
      PlatformIO.enableObjectStoreSupport(location)
        .then(() => {
          dispatch(
            actions.showNotification(
              i18n.t('core:connectedtoObjectStore'),
              'default',
              true
            )
          );
          dispatch(actions.setReadOnlyMode(location.isReadOnly || false));
          dispatch(actions.changeLocation(location));
          if (!skipInitialDirList) {
            dispatch(
              actions.loadDirectoryContent(
                PlatformIO.getLocationPath(location),
                false,
                true
              )
            );
          }
          return true;
        })
        .catch(e => {
          console.log('connectedtoObjectStoreFailed', e);
          dispatch(
            actions.showNotification(
              i18n.t('core:connectedtoObjectStoreFailed'),
              'warning',
              true
            )
          );
          PlatformIO.disableObjectStoreSupport();
        });
    } else {
      if (location.type === locationType.TYPE_WEBDAV) {
        PlatformIO.enableWebdavSupport(location);
      } else {
        PlatformIO.disableObjectStoreSupport();
        PlatformIO.disableWebdavSupport();
      }
      dispatch(actions.setReadOnlyMode(location.isReadOnly || false));
      dispatch(actions.changeLocation(location));
      if (!skipInitialDirList) {
        dispatch(
          actions.loadDirectoryContent(
            PlatformIO.getLocationPath(location),
            true,
            true
          )
        );
      }
      dispatch(actions.watchForChanges(location));
    }
  },
  watchForChanges: (location?: TS.Location) => (
    dispatch: (action) => void,
    getState: () => any
  ) => {
    if (location === undefined) {
      location = getLocation(getState(), getState().app.currentLocationId);
    }
    if (Pro && Pro.Watcher && location && location.watchForChanges) {
      const perspective = getCurrentDirectoryPerspective(getState());
      const depth = perspective === PerspectiveIDs.KANBAN ? 3 : 1;
      Pro.Watcher.watchFolder(
        PlatformIO.getLocationPath(location),
        dispatch,
        actions,
        depth
      );
    }
  },
  closeLocation: (locationId: string) => (
    dispatch: (action) => void,
    getState: () => any
  ) => {
    const { locations } = getState();
    const { currentLocationId } = getState().app;
    if (currentLocationId === locationId) {
      locations.map(location => {
        if (location.uuid === locationId) {
          // location needed evtl. to unwatch many loc. root folders if available
          dispatch(actions.setCurrentLocationId(null));
          dispatch(actions.clearDirectoryContent());
          dispatch(LocationIndexActions.clearDirectoryIndex());
          dispatch(actions.setSelectedEntries([]));
          dispatch(actions.exitSearchMode());
          if (Pro && Pro.Watcher) {
            Pro.Watcher.stopWatching();
          }
        }
        clearAllURLParams();
        return true;
      });
    }
  },
  closeAllLocations: () => (dispatch: (action) => void) => {
    // location needed evtl. to unwatch many loc. root folders if available
    dispatch(actions.setCurrentLocationId(null));
    dispatch(actions.clearDirectoryContent());
    dispatch(LocationIndexActions.clearDirectoryIndex());
    dispatch(actions.setSelectedEntries([]));
    if (Pro && Pro.Watcher) {
      Pro.Watcher.stopWatching();
    }
    clearAllURLParams();
    return true;
  },
  clearDirectoryContent: () => ({
    type: types.CLEAR_DIRECTORY_CONTENT
  }),
  showNotification: (
    text: string,
    notificationType = 'default',
    autohide = true,
    tid = 'notificationTID'
  ) => ({
    type: types.SET_NOTIFICATION,
    visible: true,
    text,
    notificationType,
    autohide,
    tid
  }),
  hideNotifications: (excludeTypes = []) => (
    dispatch: (action) => void,
    getState: () => any
  ) => {
    const { notificationStatus } = getState().app;
    if (
      !excludeTypes.some(type => type === notificationStatus.notificationType)
    ) {
      dispatch(actions.hideNotificationsInt());
    }
  },
  hideNotificationsInt: () => ({
    type: types.SET_NOTIFICATION,
    visible: false,
    text: null,
    notificationType: 'default',
    autohide: true
  }),
  addToEntryContainer: (fsEntry: OpenedEntry) => ({
    type: types.OPEN_FILE,
    file: fsEntry
  }),
  /* setFileDragged: (isFileDragged: boolean) => ({
    type: types.SET_FILEDRAGGED,
    isFileDragged
  }), */
  setReadOnlyMode: (isReadOnlyMode: boolean) => ({
    type: types.SET_READONLYMODE,
    isReadOnlyMode
  }),
  reflectUpdateOpenedFileContent: (entryPath: string) => (
    dispatch: (action) => void,
    getState: () => any
  ) => {
    const { openedFiles } = getState().app;
    if (openedFiles && openedFiles.length > 0) {
      const openedFile: OpenedEntry = openedFiles.find(
        obj => obj.path === entryPath
      );
      if (openedFile) {
        openedFile.shouldReload = true;
        dispatch(actions.addToEntryContainer(openedFile));
      }
    }
  },
  updateOpenedFile: (
    entryPath: string,
    fsEntryMeta: any // TS.FileSystemEntryMeta,
    // isFile: boolean = true
  ) => (dispatch: (action) => void, getState: () => any): Promise<boolean> => {
    const { openedFiles } = getState().app;
    if (openedFiles && openedFiles.length > 0) {
      return PlatformIO.getPropertiesPromise(entryPath)
        .then(entryProps => {
          if (entryProps) {
            const { supportedFileTypes } = getState().settings;

            let entryForOpening: OpenedEntry;
            const entryExist = openedFiles.find(obj => obj.path === entryPath);

            if (!entryExist) {
              entryForOpening = findExtensionsForEntry(
                fsEntryMeta.id || fsEntryMeta.uuid,
                supportedFileTypes,
                entryPath,
                entryProps.isFile
              );
            } else {
              entryForOpening = { ...entryExist };
            }

            /* if (fsEntryMeta.changed !== undefined) {
              entryForOpening.changed = fsEntryMeta.changed;
            } */
            if (fsEntryMeta.editMode !== undefined) {
              entryForOpening.editMode = fsEntryMeta.editMode;
            }
            entryForOpening.shouldReload = fsEntryMeta.shouldReload;
            if (fsEntryMeta.color) {
              if (fsEntryMeta.color === 'transparent') {
                entryForOpening.color = undefined;
              } else {
                entryForOpening.color = fsEntryMeta.color;
              }
            }
            if (fsEntryMeta.description !== undefined) {
              entryForOpening.description = fsEntryMeta.description;
            }
            if (fsEntryMeta.perspective) {
              entryForOpening.perspective = fsEntryMeta.perspective;
            }
            if (fsEntryMeta.tags) {
              entryForOpening.tags = fsEntryMeta.tags;
            }
            if (fsEntryMeta.autoSave !== undefined) {
              entryForOpening.isAutoSaveEnabled = fsEntryMeta.autoSave;
            }
            entryForOpening.lmdt = entryProps.lmdt;
            entryForOpening.size = entryProps.size;
            dispatch(actions.addToEntryContainer(entryForOpening));
          }
          return true;
        })
        .catch(err => {
          console.error('updateOpenedFile ' + entryPath + ' not exist ' + err);
          return Promise.resolve(false);
        });
    }
    return Promise.resolve(false);
  },
  openEntry: (path: string) => (dispatch: (action) => void) => {
    return getAllPropertiesPromise(path)
      .then((fsEntry: TS.FileSystemEntry) =>
        dispatch(actions.openFsEntry(fsEntry))
      )
      .catch(error =>
        console.warn(
          'Error getting properties for entry: ' + path + ' - ' + error
        )
      );
  },
  openFsEntry: (fsEntry?: TS.FileSystemEntry) => (
    dispatch: (action) => void,
    getState: () => any
  ) => {
    if (fsEntry === undefined) {
      // eslint-disable-next-line no-param-reassign
      fsEntry = getLastSelectedEntry(getState());
      if (fsEntry === undefined) {
        return;
      }
      if (!fsEntry.isFile) {
        dispatch(actions.loadDirectoryContent(fsEntry.path, false));
        return;
      }
    }
    let entryForOpening: OpenedEntry;
    const { openedFiles } = getState().app;

    /**
     * check for editMode in order to show save changes dialog (shouldReload: false)
     */
    if (openedFiles.length > 0) {
      const openFile = openedFiles[0];
      if (openFile.editMode) {
        entryForOpening = {
          ...openFile,
          shouldReload:
            openFile.shouldReload !== undefined
              ? !openFile.shouldReload
              : undefined
        }; // false };
        dispatch(actions.addToEntryContainer(entryForOpening));
        dispatch(
          actions.showNotification(
            `You can't open another file, because '${openFile.path}' is opened for editing`,
            'default',
            true
          )
        );
        return false;
      }
    }

    const { supportedFileTypes } = getState().settings;
    // TODO decide to copy all props from {...fsEntry} into openedEntry
    entryForOpening = findExtensionsForEntry(
      fsEntry.uuid,
      supportedFileTypes,
      fsEntry.path,
      fsEntry.isFile
    );
    if (PlatformIO.haveObjectStoreSupport() || PlatformIO.haveWebDavSupport()) {
      const cleanedPath = fsEntry.path.startsWith('/')
        ? fsEntry.path.substr(1)
        : fsEntry.path;
      entryForOpening.url = PlatformIO.getURLforPath(cleanedPath);
    } else if (fsEntry.url) {
      entryForOpening.url = fsEntry.url;
    }
    if (fsEntry.perspective) {
      entryForOpening.perspective = fsEntry.perspective;
    }
    if (fsEntry.color) {
      entryForOpening.color = fsEntry.color;
    }
    if (fsEntry.description) {
      entryForOpening.description = fsEntry.description;
    }
    if (fsEntry.tags) {
      entryForOpening.tags = fsEntry.tags;
    }
    if (fsEntry.lmdt) {
      entryForOpening.lmdt = fsEntry.lmdt;
    }
    if (fsEntry.size) {
      entryForOpening.size = fsEntry.size;
    }
    if (fsEntry.isNewFile) {
      entryForOpening.editMode = true;
    }
    if (fsEntry.isAutoSaveEnabled !== undefined) {
      entryForOpening.isAutoSaveEnabled = fsEntry.isAutoSaveEnabled;
    } else if (fsEntry.meta && fsEntry.meta.autoSave) {
      entryForOpening.isAutoSaveEnabled = fsEntry.meta.autoSave;
    }

    document.title = fsEntry.name + ' | ' + 'TagSpaces'; // TODO get it later from app config

    const currentLocation: TS.Location = getLocation(
      getState(),
      getState().app.currentLocationId
    );

    if (currentLocation) {
      entryForOpening.locationId = currentLocation.uuid;
      const { currentDirectoryPath } = getState().app;
      updateHistory(currentLocation, currentDirectoryPath, fsEntry.path);
    }

    dispatch(actions.addToEntryContainer(entryForOpening));

    // save in history
    if (currentLocation) {
      if (Pro) {
        const historyKeys = Pro.history.historyKeys;
        const relEntryPath = getRelativeEntryPath(
          currentLocation,
          fsEntry.path
        );
        if (fsEntry.isFile) {
          Pro.history.saveHistory(
            historyKeys.fileOpenKey,
            {
              path: fsEntry.path,
              url: generateSharingLink(currentLocation.uuid, relEntryPath),
              lid: currentLocation.uuid
            },
            getState().settings[historyKeys.fileOpenKey]
          );
        } else {
          Pro.history.saveHistory(
            historyKeys.folderOpenKey,
            {
              path: fsEntry.path,
              url: generateSharingLink(
                currentLocation.uuid,
                relEntryPath,
                relEntryPath
              ),
              lid: currentLocation.uuid
            },
            getState().settings[historyKeys.folderOpenKey]
          );
        }
      }
    }
  },
  toggleEntryFullWidth: () => ({
    type: types.TOGGLE_ENTRY_FULLWIDTH
  }),
  setEntryFullWidth: (isFullWidth: boolean) => ({
    type: types.SET_ENTRY_FULLWIDTH,
    isFullWidth
  }),
  openNextFile: (path?: string) => (
    dispatch: (action) => void,
    getState: () => any
  ) => {
    const lastSelectedEntry = getLastSelectedEntry(getState());
    const nextFile = getNextFile(
      path,
      lastSelectedEntry ? lastSelectedEntry.path : undefined,
      getState().app.searchMode
        ? GlobalSearch.getInstance().getResults()
        : getState().app.currentDirectoryEntries
    );
    if (nextFile !== undefined) {
      dispatch(actions.openFsEntry(nextFile));
      // dispatch(actions.setLastSelectedEntry(nextFile.path));
      dispatch(actions.setSelectedEntries([nextFile]));
      return nextFile;
    }
  },
  openPrevFile: (path?: string) => (
    dispatch: (action) => void,
    getState: () => any
  ) => {
    const lastSelectedEntry = getLastSelectedEntry(getState());
    const prevFile = getPrevFile(
      path,
      lastSelectedEntry ? lastSelectedEntry.path : undefined,
      getState().app.searchMode
        ? GlobalSearch.getInstance().getResults()
        : getState().app.currentDirectoryEntries
    );
    if (prevFile !== undefined) {
      dispatch(actions.openFsEntry(prevFile));
      // dispatch(actions.setLastSelectedEntry(prevFile.path));
      dispatch(actions.setSelectedEntries([prevFile]));
    }
  },
  closeAllFiles: () => (dispatch: (action) => void) => {
    document.title = 'TagSpaces'; // TODO move to AppConfig
    dispatch(actions.closeAllFilesInt());
  },
  closeAllFilesInt: () => ({ type: types.CLOSE_ALL_FILES }),
  reflectDeleteEntryInt: (path: string) => ({
    type: types.REFLECT_DELETE_ENTRY,
    path
  }),
  reflectDeleteEntriesInt: (paths: string[]) => ({
    type: types.REFLECT_DELETE_ENTRIES,
    paths
  }),
  reflectDeleteEntry: (path: string) => (dispatch: (action) => void) => {
    dispatch(actions.reflectDeleteEntryInt(path));
    GlobalSearch.getInstance().reflectDeleteEntry(path);
  },
  reflectDeleteEntries: (paths: string[]) => (dispatch: (action) => void) => {
    dispatch(actions.reflectDeleteEntriesInt(paths));
    GlobalSearch.getInstance().reflectDeleteEntries(paths);
  },
  reflectCreateEntryInt: (newEntry: TS.FileSystemEntry) => ({
    type: types.REFLECT_CREATE_ENTRY,
    newEntry
  }),
  reflectCreateEntriesInt: (fsEntries: Array<TS.FileSystemEntry>) => ({
    type: types.REFLECT_CREATE_ENTRIES,
    fsEntries
  }),
  reflectCreateEntries: (fsEntries: Array<TS.FileSystemEntry>) => (
    dispatch: (action) => void
  ) => {
    dispatch(actions.reflectCreateEntriesInt(fsEntries));
    dispatch(actions.setSelectedEntries(fsEntries));
  },
  reflectCreateEntry: (path: string, isFile: boolean) => (
    dispatch: (action) => void
  ) => {
    dispatch(actions.reflectCreateEntryObj(toFsEntry(path, isFile)));
  },
  reflectCreateEntryObj: (newEntry: TS.FileSystemEntry) => (
    dispatch: (action) => void
  ) => {
    dispatch(actions.setSelectedEntries([newEntry]));
    dispatch(actions.reflectCreateEntryInt(newEntry));
    GlobalSearch.getInstance().reflectCreateEntry(newEntry);
  },
  reflectRenameEntryInt: (path: string, newPath: string) => ({
    type: types.REFLECT_RENAME_ENTRY,
    path,
    newPath
  }),
  reflectRenameEntry: (path: string, newPath: string) => (
    dispatch: (action) => void,
    getState: () => any
  ) => {
    const { searchMode } = getState().app;
    if (searchMode) {
      const results = GlobalSearch.getInstance()
        .getResults()
        .map((fsEntry: TS.FileSystemEntry) => {
          if (fsEntry.path === path) {
            return {
              ...fsEntry,
              path: newPath,
              name: extractFileName(newPath, PlatformIO.getDirSeparator())
            };
          }
          return fsEntry;
        });
      GlobalSearch.getInstance().setResults(results);
    }
    dispatch(actions.reflectRenameEntryInt(path, newPath));
    GlobalSearch.getInstance().reflectRenameEntry(path, newPath);
    dispatch(actions.setSelectedEntries([]));
  },
  /**
   * TODO include path in entry => only one entry parameter
   * @param path
   * @param entry
   */
  updateCurrentDirEntry: (path: string, entry: any) => (
    dispatch: (action) => void,
    getState: () => any
  ) => {
    const { searchMode } = getState().app;
    if (searchMode) {
      const results = updateFsEntries(GlobalSearch.getInstance().getResults(), [
        { ...entry, path }
      ]);
      GlobalSearch.getInstance().setResults(results);
    } else {
      dispatch(actions.updateCurrentDirEntryInt(path, entry));
    }
  },
  updateCurrentDirEntryInt: (path: string, entry: any) => ({
    type: types.UPDATE_CURRENTDIR_ENTRY,
    entry: { ...entry, path }
  }),
  updateCurrentDirEntries: (dirEntries: TS.FileSystemEntry[]) => ({
    type: types.UPDATE_CURRENTDIR_ENTRIES,
    dirEntries
  }),
  reflectEditedEntryPaths: (editedEntryPaths: Array<TS.EditedEntryPath>) => ({
    type: types.REFLECT_EDITED_ENTRY_PATHS,
    editedEntryPaths
  }),
  /**
   * @param path
   * @param tags
   * @param updateIndex
   */
  reflectUpdateSidecarTags: (
    path: string,
    tags: Array<TS.Tag>,
    updateIndex = true
  ) => (dispatch: (action) => void, getState: () => any) => {
    const { openedFiles, selectedEntries } = getState().app;
    // to reload cell in KanBan if add/remove sidecar tags
    const action: TS.EditedEntryAction = `edit${tags
      .map(tag => tag.title)
      .join()}`;
    dispatch(actions.reflectEditedEntryPaths([{ action, path }])); //[{ [path]: tags }]));
    /**
     * if its have openedFiles updateCurrentDirEntry is called from FolderContainer (useEffect -> ... if (openedFile.changed)
     */
    /*if (
      openedFiles.length === 0 ||
      !openedFiles.some(obj => obj.path === path) ||
      selectedEntries.length > 1
    ) {*/
    dispatch(actions.updateCurrentDirEntry(path, { tags }));
    // }
    if (updateIndex) {
      GlobalSearch.getInstance().reflectUpdateSidecarTags(path, tags);
    }
  },
  deleteFile: (filePath: string, uuid: string) => (
    dispatch: (action) => void,
    getState: () => any
  ) => {
    const { settings } = getState();
    return PlatformIO.deleteFilePromise(filePath, settings.useTrashCan)
      .then(() => {
        // TODO close file opener if this file is opened
        dispatch(actions.reflectDeleteEntry(filePath));
        dispatch(
          actions.showNotification(
            `Deleting file ${filePath} successful.`,
            'default',
            true
          )
        );
        // Delete revisions
        const backupFilePath = getBackupFileLocation(
          filePath,
          uuid,
          PlatformIO.getDirSeparator()
        );
        const backupPath = extractContainingDirectoryPath(
          backupFilePath,
          PlatformIO.getDirSeparator()
        );
        PlatformIO.deleteDirectoryPromise(backupPath)
          .then(() => {
            console.log('Cleaning revisions successful for ' + filePath);
            return true;
          })
          .catch(err => {
            console.warn('Cleaning revisions failed ', err);
          });
        // Delete sidecar file and thumb
        deleteFilesPromise([
          getMetaFileLocationForFile(filePath, PlatformIO.getDirSeparator()),
          getThumbFileLocationForFile(
            filePath,
            PlatformIO.getDirSeparator(),
            false
          )
        ])
          .then(() => {
            console.log(
              'Cleaning meta file and thumb successful for ' + filePath
            );
            return true;
          })
          .catch(err => {
            console.warn('Cleaning meta file and thumb failed with ' + err);
          });
        return true;
      })
      .catch(error => {
        console.warn('Error while deleting file: ' + error);
        dispatch(
          actions.showNotification(
            `Error while deleting file ${filePath}`,
            'error',
            true
          )
        );
      });
  },
  renameFile: (filePath: string, newFilePath: string) => (
    dispatch: (action) => void
  ): Promise<boolean> =>
    PlatformIO.renameFilePromise(filePath, newFilePath)
      .then(result => {
        const newFilePathFromPromise = result[1];
        console.info('File renamed ' + filePath + ' to ' + newFilePath);
        dispatch(
          actions.showNotification(
            i18n.t('core:renamingSuccessfully'),
            'default',
            true
          )
        );
        // Update sidecar file and thumb
        return renameFilesPromise([
          [
            getMetaFileLocationForFile(filePath, PlatformIO.getDirSeparator()),
            getMetaFileLocationForFile(
              newFilePath,
              PlatformIO.getDirSeparator()
            )
          ],
          [
            getThumbFileLocationForFile(
              filePath,
              PlatformIO.getDirSeparator(),
              false
            ),
            getThumbFileLocationForFile(
              newFilePath,
              PlatformIO.getDirSeparator(),
              false
            )
          ]
        ])
          .then(() => {
            dispatch(
              actions.reflectRenameEntry(filePath, newFilePathFromPromise)
            );
            console.info(
              'Renaming meta file and thumb successful from ' +
                filePath +
                ' to:' +
                newFilePath
            );
            return true;
          })
          .catch(err => {
            dispatch(
              actions.reflectRenameEntry(filePath, newFilePathFromPromise)
            );
            console.warn(
              'Renaming meta file and thumb failed from ' +
                filePath +
                ' to:' +
                newFilePath,
              err
            );
            return false;
          });
      })
      .catch(error => {
        console.error(`Error while renaming file ${filePath}`, error);
        dispatch(
          actions.showNotification(
            `Error while renaming file ${filePath}`,
            'error',
            true
          )
        );
        return false;
      }),
  openFileNatively: (selectedFile?: string) => (
    dispatch: (action) => void,
    getState: () => any
  ) => {
    if (selectedFile === undefined) {
      // eslint-disable-next-line no-param-reassign
      const fsEntry = getLastSelectedEntry(getState());
      if (fsEntry === undefined) {
        return;
      }
      if (fsEntry.isFile) {
        const { warningOpeningFilesExternally } = getState().settings;
        PlatformIO.openFile(fsEntry.path, warningOpeningFilesExternally);
      } else {
        PlatformIO.openDirectory(fsEntry.path);
      }
    } else {
      const { warningOpeningFilesExternally } = getState().settings;
      PlatformIO.openFile(selectedFile, warningOpeningFilesExternally);
    }
  },
  openLink: (url: string, options = { fullWidth: true }) => (
    dispatch: (action) => void,
    getState: () => any
  ) => {
    const decodedURI = decodeURI(url);
    const lid = getURLParameter('tslid', url);
    const dPath = getURLParameter('tsdpath', url);
    const ePath = getURLParameter('tsepath', url);
    const cmdOpen = getURLParameter('cmdopen', url);
    if (cmdOpen && cmdOpen.length > 0) {
      const entryPath = decodeURIComponent(cmdOpen);
      getAllPropertiesPromise(entryPath)
        .then((fsEntry: TS.FileSystemEntry) => {
          if (fsEntry.isFile) {
            dispatch(actions.openFsEntry(fsEntry));
            dispatch(actions.setEntryFullWidth(options.fullWidth));
          } else {
            dispatch(actions.loadDirectoryContent(fsEntry.path, false, true));
          }
          return true;
        })
        .catch(err => {
          // console.log('Error opening from cmd ' + JSON.stringify(err));
          dispatch(
            actions.showNotification(
              i18n.t('Missing file or folder'),
              'warning',
              true
            )
          );
        });
    } else if (lid && lid.length > 0) {
      const locationId = decodeURIComponent(lid);
      const directoryPath = dPath && decodeURIComponent(dPath);
      const entryPath = ePath && decodeURIComponent(ePath);
      // Check for relative paths
      const targetLocation: TS.Location = getLocation(getState(), locationId);
      if (targetLocation) {
        let openLocationTimer = 1000;
        const isCloudLocation = targetLocation.type === locationType.TYPE_CLOUD;
        const { currentLocationId } = getState().app;
        let skipListingLocation = directoryPath && directoryPath.length > 0;
        if (targetLocation.uuid !== currentLocationId) {
          dispatch(actions.openLocation(targetLocation, skipListingLocation));
        } else {
          openLocationTimer = 0;
        }
        const locationPath = getCleanLocationPath(targetLocation);

        // setTimeout is needed for case of a location switch, if no location swith the timer is 0
        setTimeout(() => {
          if (isCloudLocation) {
            // PlatformIO.enableObjectStoreSupport(targetLocation).then(() => {
            if (directoryPath && directoryPath.length > 0) {
              const newRelDir = getRelativeEntryPath(
                targetLocation,
                directoryPath
              );
              const dirFullPath =
                locationPath.length > 0
                  ? locationPath + '/' + newRelDir
                  : directoryPath;
              dispatch(actions.loadDirectoryContent(dirFullPath, false, true));
            } else {
              dispatch(actions.loadDirectoryContent(locationPath, false, true));
            }

            if (entryPath) {
              getAllPropertiesPromise(entryPath)
                .then((fsEntry: TS.FileSystemEntry) => {
                  if (fsEntry) {
                    dispatch(actions.openFsEntry(fsEntry));
                    if (options.fullWidth) {
                      dispatch(actions.setEntryFullWidth(true));
                    }
                  }
                  return true;
                })
                .catch(() =>
                  dispatch(
                    actions.showNotification(
                      i18n.t('core:invalidLink'),
                      'warning',
                      true
                    )
                  )
                );
            }
            // });
          } else {
            // local files case
            if (directoryPath && directoryPath.length > 0) {
              if (
                directoryPath.includes('../') ||
                directoryPath.includes('..\\')
              ) {
                dispatch(
                  actions.showNotification(
                    i18n.t('core:invalidLink'),
                    'warning',
                    true
                  )
                );
                return true;
              }
              const dirFullPath =
                locationPath + PlatformIO.getDirSeparator() + directoryPath;
              dispatch(actions.loadDirectoryContent(dirFullPath, false, true));
            } else {
              dispatch(actions.loadDirectoryContent(locationPath, false, true));
            }

            if (entryPath && entryPath.length > 0) {
              if (entryPath.includes('../') || entryPath.includes('..\\')) {
                dispatch(
                  actions.showNotification(
                    i18n.t('core:invalidLink'),
                    'warning',
                    true
                  )
                );
                return true;
              }
              const entryFullPath =
                locationPath + PlatformIO.getDirSeparator() + entryPath;
              getAllPropertiesPromise(entryFullPath)
                .then((fsEntry: TS.FileSystemEntry) => {
                  if (fsEntry) {
                    dispatch(actions.openFsEntry(fsEntry));
                    if (options.fullWidth) {
                      dispatch(actions.setEntryFullWidth(true));
                    }
                  }
                  return true;
                })
                .catch(() =>
                  dispatch(
                    actions.showNotification(
                      i18n.t('core:invalidLink'),
                      'warning',
                      true
                    )
                  )
                );
            }
          }
        }, openLocationTimer);
      } else {
        dispatch(
          actions.showNotification(i18n.t('core:invalidLink'), 'warning', true)
        );
      }
    } else if (decodedURI.endsWith(location.pathname)) {
      return true;
    } else if (
      // External URL case
      decodedURI.startsWith('http://') ||
      decodedURI.startsWith('https://') ||
      decodedURI.startsWith('file://')
    ) {
      dispatch(actions.openURLExternally(decodedURI));
    } else {
      console.log('Not supported URL format: ' + decodedURI);
    }
  },
  openURLExternally: (url: string, skipConfirmation = false) => () => {
    if (skipConfirmation) {
      PlatformIO.openUrl(url);
    } else if (
      window.confirm('Do you really want to open this url: ' + url + ' ?')
    ) {
      PlatformIO.openUrl(url);
    }
  },
  saveFile: () => (dispatch: (action) => void) => {
    dispatch(
      actions.showNotification(
        i18n.t('core:notImplementedYet'),
        'warning',
        true
      )
    );
  },
  isCurrentLocation: (uuid: string) => (
    dispatch: (action) => void,
    getState: () => any
  ) => {
    const { currentLocationId } = getState().app;
    return currentLocationId === uuid;
  },
  openCurrentDirectory: () => (
    dispatch: (action) => void,
    getState: () => any
  ) => {
    const { currentDirectoryPath } = getState().app;
    if (currentDirectoryPath) {
      dispatch(actions.loadDirectoryContent(currentDirectoryPath, false, true));
    } else {
      dispatch(actions.setSearchResults([]));
    }
  }
};

// Selectors
export const getLastBackgroundImageChange = (state: any) =>
  state.app.lastBackgroundImageChange;
export const getLastBackgroundColorChange = (state: any) =>
  state.app.lastBackgroundColorChange;
export const getLastThumbnailImageChange = (state: any) =>
  state.app.lastThumbnailImageChange;
export const currentUser = (state: any) => state.app.user;
export const getIsMetaLoaded = (state: any) => state.app.isMetaLoaded;
export const getDirectoryContent = (state: any) =>
  state.app.currentDirectoryEntries;
// export const getPageEntries = (state: any) => state.app.pageEntries;
export const getEditedEntryPaths = (state: any) => state.app.editedEntryPaths;
export const getCurrentDirectoryFiles = (state: any) =>
  state.app.currentDirectoryFiles;
export const getCurrentDirectoryDirs = (state: any) =>
  state.app.currentDirectoryDirs;
export const getCurrentDirectoryColor = (state: any) =>
  state.app.currentDirectoryColor;
export const getCurrentDirectoryDescription = (state: any) =>
  state.app.currentDirectoryDescription;
export const getCurrentDirectoryTags = (state: any) =>
  state.app.currentDirectoryTags;
export const getCurrentDirectoryPerspective = (state: any) =>
  state.app.currentDirectoryPerspective;
export const getDirectoryPath = (state: any) => state.app.currentDirectoryPath;
export const getProgress = (state: any) => state.app.progress;
export const getCurrentLocationPath = (state: any) => {
  if (state.locations) {
    for (let i = 0; i < state.locations.length; i += 1) {
      const location = state.locations[i];
      if (
        state.app.currentLocationId &&
        location.uuid === state.app.currentLocationId
      ) {
        return PlatformIO.getLocationPath(location);
      }
    }
  }
  return undefined;
};
export const getLocationPersistTagsInSidecarFile = (state: any) => {
  if (state.locations) {
    for (let i = 0; i < state.locations.length; i += 1) {
      const location = state.locations[i];
      if (
        state.app.currentLocationId &&
        location.uuid === state.app.currentLocationId
      ) {
        return location.persistTagsInSidecarFile;
      }
    }
  }
  return undefined;
};
export const isUpdateAvailable = (state: any) => state.app.isUpdateAvailable;
export const isUpdateInProgress = (state: any) => state.app.isUpdateInProgress;
export const isOnline = (state: any) => state.app.isOnline;
export const getLastSelectedEntry = (state: any) => {
  const { selectedEntries } = state.app;
  if (selectedEntries && selectedEntries.length > 0) {
    return selectedEntries[selectedEntries.length - 1];
  }
  return undefined;
};
export const getLastSelectedEntryPath = (state: any) => {
  const { selectedEntries, currentDirectoryPath } = state.app;
  if (selectedEntries && selectedEntries.length > 0) {
    return selectedEntries[selectedEntries.length - 1].path;
  }
  return currentDirectoryPath;
};
export const getSelectedTag = (state: any) => state.app.tag;
export const isTagLibraryChanged = (state: any) => state.app.tagLibraryChanged;
export const getSelectedEntries = (state: any) =>
  state.app.selectedEntries ? state.app.selectedEntries : [];
export const getSelectedEntriesLength = (state: any) =>
  state.app.selectedEntries ? state.app.selectedEntries.length : 0;
export const getExtensions = (state: any) => state.app.extensions;
export const getDirectoryMeta = (state: any) => state.app.directoryMeta;
export const isGeneratingThumbs = (state: any) => state.app.isGeneratingThumbs;
export const isReadOnlyMode = (state: any) => state.app.isReadOnlyMode;
export const isOnboardingDialogOpened = (state: any) =>
  state.app.onboardingDialogOpened;
export const isEditTagDialogOpened = (state: any) =>
  state.app.editTagDialogOpened;
export const isAboutDialogOpened = (state: any) => state.app.aboutDialogOpened;
export const isLocationDialogOpened = (state: any) =>
  state.app.locationDialogOpened;
export const isKeysDialogOpened = (state: any) => state.app.keysDialogOpened;
export const isLicenseDialogOpened = (state: any) =>
  state.app.licenseDialogOpened;
export const isThirdPartyLibsDialogOpened = (state: any) =>
  state.app.thirdPartyLibsDialogOpened;
export const isSettingsDialogOpened = (state: any) =>
  state.app.settingsDialogOpened;
export const isCreateDirectoryOpened = (state: any) =>
  state.app.createDirectoryDialogOpened;
export const isNewEntryDialogOpened = (state: any) =>
  state.app.isNewEntryDialogOpened;
export const isNewFileDialogOpened = (state: any) =>
  state.app.isNewFileDialogOpened;
export const isDeleteMultipleEntriesDialogOpened = (state: any) =>
  state.app.deleteMultipleEntriesDialogOpened;
export const isImportKanBanDialogOpened = (state: any) =>
  state.app.importKanBanDialogOpened;
export const isUploadDialogOpened = (state: any) =>
  state.app.uploadDialogOpened;
export const isOpenLinkDialogOpened = (state: any) =>
  state.app.openLinkDialogOpened;
export const isProTeaserVisible = (state: any) => state.app.proTeaserIndex > -1;
export const getProTeaserIndex = (state: any) => state.app.proTeaserIndex;
export const isProgressOpened = (state: any) => state.app.progressDialogOpened;
export const getOpenedFiles = (state: any) => state.app.openedFiles;
export const getNotificationStatus = (state: any) =>
  state.app.notificationStatus;
/*
export const getSearchResultCount = (state: any) =>
  Object.keys(state.locationIndex.searchQuery).length === 0
    ? 0
    : state.app.currentDirectoryEntries.length;
*/
export const getCurrentLocationId = (state: any) => state.app.currentLocationId;
export const isEntryInFullWidth = (state: any) => state.app.isEntryInFullWidth;
export const isLoading = (state: any) => state.app.isLoading;
export const isLocationManagerPanelOpened = (state: any) =>
  state.app.locationManagerPanelOpened;
export const isTagLibraryPanelOpened = (state: any) =>
  state.app.tagLibraryPanelOpened;
export const isSearchPanelOpened = (state: any) => state.app.searchPanelOpened;
export const isHelpFeedbackPanelOpened = (state: any) =>
  state.app.helpFeedbackPanelOpened;
export const getLastSearchTimestamp = (state: any) =>
  state.app.lastSearchTimestamp;
export const isSearchMode = (state: any) => state.app.searchMode;
export const getSearchFilter = (state: any) => state.app.searchFilter;

// export type CreateDirectoryAction = ReturnType<typeof actions.createDirectory>;
