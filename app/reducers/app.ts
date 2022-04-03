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

import { v1 as uuidv1 } from 'uuid';
import { getLocation, getDefaultLocationId } from './locations';
import PlatformIO from '../services/platform-facade';
import AppConfig from '../config';
import {
  deleteFilesPromise,
  loadMetaDataPromise,
  renameFilesPromise,
  getAllPropertiesPromise,
  prepareDirectoryContent,
  findExtensionsForEntry,
  getNextFile,
  getPrevFile
} from '-/services/utils-io';
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
  getLocationPath
} from '-/utils/paths';
import {
  formatDateTime4Tag,
  getURLParameter,
  clearURLParam,
  updateHistory,
  clearAllURLParams,
  locationType
} from '-/utils/misc';
import i18n from '../services/i18n';
import { Pro } from '../pro';
import { actions as LocationIndexActions } from './location-index';
import {
  actions as SettingsActions,
  getCheckForUpdateOnStartup,
  isFirstRun,
  isGlobalKeyBindingEnabled
} from '-/reducers/settings';
import { TS } from '-/tagspaces.namespace';
import { PerspectiveIDs } from '-/perspectives';

export const types = {
  DEVICE_ONLINE: 'APP/DEVICE_ONLINE',
  DEVICE_OFFLINE: 'APP/DEVICE_OFFLINE',
  PROGRESS: 'APP/PROGRESS',
  RESET_PROGRESS: 'APP/RESET_PROGRESS',
  LOGIN_SUCCESS: 'APP/LOGIN_SUCCESS',
  LOGIN_FAILURE: 'APP/LOGIN_FAILURE',
  LOGOUT: 'APP/LOGOUT',
  LOAD_DIRECTORY_SUCCESS: 'APP/LOAD_DIRECTORY_SUCCESS',
  LOAD_DIRECTORY_FAILURE: 'APP/LOAD_DIRECTORY_FAILURE',
  CLEAR_DIRECTORY_CONTENT: 'APP/CLEAR_DIRECTORY_CONTENT',
  SET_SEARCH_RESULTS: 'APP/SET_SEARCH_RESULTS',
  APPEND_SEARCH_RESULTS: 'APP/APPEND_SEARCH_RESULTS',
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
  SET_LAST_SELECTED_ENTRY: 'APP/SET_LAST_SELECTED_ENTRY',
  SET_SELECTED_ENTRIES: 'APP/SET_SELECTED_ENTRIES',
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
  TOGGLE_THIRD_PARTY_LIBS_DIALOG: 'APP/TOGGLE_THIRD_PARTY_LIBS_DIALOG',
  TOGGLE_SETTINGS_DIALOG: 'APP/TOGGLE_SETTINGS_DIALOG',
  TOGGLE_CREATE_DIRECTORY_DIALOG: 'APP/TOGGLE_CREATE_DIRECTORY_DIALOG',
  TOGGLE_CREATE_FILE_DIALOG: 'APP/TOGGLE_CREATE_FILE_DIALOG',
  TOGGLE_DELETE_MULTIPLE_ENTRIES_DIALOG:
    'APP/TOGGLE_DELETE_MULTIPLE_ENTRIES_DIALOG',
  TOGGLE_UPLOAD_DIALOG: 'APP/TOGGLE_UPLOAD_DIALOG',
  CLEAR_UPLOAD_DIALOG: 'APP/CLEAR_UPLOAD_DIALOG',
  TOGGLE_PROGRESS_DIALOG: 'APP/TOGGLE_PROGRESS_DIALOG',
  OPEN_LOCATIONMANAGER_PANEL: 'APP/OPEN_LOCATIONMANAGER_PANEL',
  OPEN_TAGLIBRARY_PANEL: 'APP/OPEN_TAGLIBRARY_PANEL',
  OPEN_SEARCH_PANEL: 'APP/OPEN_SEARCH_PANEL',
  OPEN_HELPFEEDBACK_PANEL: 'APP/OPEN_HELPFEEDBACK_PANEL',
  CLOSE_ALLVERTICAL_PANELS: 'APP/CLOSE_ALLVERTICAL_PANELS',
  REFLECT_DELETE_ENTRY: 'APP/REFLECT_DELETE_ENTRY',
  REFLECT_RENAME_ENTRY: 'APP/REFLECT_RENAME_ENTRY',
  REFLECT_CREATE_ENTRY: 'APP/REFLECT_CREATE_ENTRY',
  // REFLECT_UPDATE_SIDECARTAGS: 'APP/REFLECT_UPDATE_SIDECARTAGS',
  // REFLECT_UPDATE_SIDECARMETA: 'APP/REFLECT_UPDATE_SIDECARMETA',
  UPDATE_CURRENTDIR_ENTRY: 'APP/UPDATE_CURRENTDIR_ENTRY',
  SET_ISLOADING: 'APP/SET_ISLOADING'
};

export const NotificationTypes = {
  default: 'default',
  error: 'error'
};

export type OpenedEntry = {
  path: string;
  url?: string;
  size: number;
  lmdt: number;
  viewingExtensionPath: string;
  viewingExtensionId: string;
  editingExtensionPath?: string;
  editingExtensionId?: string;
  isFile?: boolean;
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
  onboardingDialogOpened: false,
  keysDialogOpened: false,
  createFileDialogOpened: false,
  licenseDialogOpened: false,
  thirdPartyLibsDialogOpened: false,
  settingsDialogOpened: false,
  createDirectoryDialogOpened: false,
  // lastSelectedEntry: null,
  selectedEntries: [],
  isEntryInFullWidth: false,
  isGeneratingThumbs: false,
  locationManagerPanelOpened: showLocations,
  tagLibraryPanelOpened: showTagLibrary,
  searchPanelOpened: showSearch,
  helpFeedbackPanelOpened: false,
  user: window.ExtDemoUser
    ? {
        attributes: window.ExtDemoUser,
        associateSoftwareToken: () => {},
        verifySoftwareToken: () => {}
      }
    : undefined
};

// The state described here will not be persisted
export default (state: any = initialState, action: any) => {
  switch (action.type) {
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
        { path: action.path, progress: action.progress, abort: action.abort }
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
    case types.LOAD_DIRECTORY_SUCCESS: {
      let { directoryPath } = action;
      if (directoryPath && directoryPath.startsWith('./')) {
        // relative paths
        directoryPath = PlatformIO.resolveFilePath(directoryPath);
      }
      return {
        ...state,
        currentDirectoryEntries: action.directoryContent,
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
            : state.currentDirectoryPerspective,
        currentDirectoryPath: directoryPath,
        /**
         * used for reorder files in KanBan
         */
        currentDirectoryFiles: action.directoryMeta
          ? action.directoryMeta.files
          : [],
        /**
         * used for reorder dirs in KanBan
         */
        currentDirectoryDirs: action.directoryMeta
          ? action.directoryMeta.dirs
          : [],
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
    case types.TOGGLE_KEYBOARD_DIALOG: {
      return { ...state, keysDialogOpened: !state.keysDialogOpened };
    }
    case types.TOGGLE_CREATE_FILE_DIALOG: {
      return {
        ...state,
        createFileDialogOpened: !state.createFileDialogOpened
      };
    }
    case types.TOGGLE_DELETE_MULTIPLE_ENTRIES_DIALOG: {
      return {
        ...state,
        deleteMultipleEntriesDialogOpened: !state.deleteMultipleEntriesDialogOpened
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
      return {
        ...state,
        createDirectoryDialogOpened: !state.createDirectoryDialogOpened
      };
    }
    case types.TOGGLE_UPLOAD_DIALOG: {
      if (PlatformIO.haveObjectStoreSupport()) {
        // upload dialog have objectStore support only
        return {
          ...state,
          // progress: (state.uploadDialogOpened ? state.progress : []),
          uploadDialogOpened: !state.uploadDialogOpened
        };
      }
      return state;
    }
    case types.CLEAR_UPLOAD_DIALOG: {
      // if (PlatformIO.haveObjectStoreSupport()) {
      // upload dialog have objectStore support only
      return {
        ...state,
        progress: [],
        uploadDialogOpened: false
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
      return {
        ...state,
        currentDirectoryEntries: action.searchResults,
        isLoading: false
      };
    }
    case types.APPEND_SEARCH_RESULTS: {
      const newDirEntries = [...state.currentDirectoryEntries];
      for (let i = 0; i < action.searchResults.length; i += 1) {
        const index = newDirEntries.findIndex(
          entry => entry.path === action.searchResults[i].path
        );
        if (index === -1) {
          newDirEntries.push(action.searchResults[i]);
        }
      }
      return {
        ...state,
        currentDirectoryEntries: newDirEntries,
        isLoading: false
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
        ]
      };
    }
    case types.TOGGLE_ENTRY_FULLWIDTH: {
      return { ...state, isEntryInFullWidth: !state.isEntryInFullWidth };
    }
    case types.SET_ENTRY_FULLWIDTH: {
      return { ...state, isEntryInFullWidth: action.isFullWidth };
    }
    case types.UPDATE_THUMB_URL: {
      const dirEntries = [...state.currentDirectoryEntries];
      dirEntries.map(entry => {
        if (entry.path === action.filePath) {
          entry.thumbPath = action.thumbUrl;
        }
        return true;
      });
      return {
        ...state,
        currentDirectoryEntries: [...dirEntries]
      };
    }
    case types.UPDATE_THUMB_URLS: {
      const dirEntries = [...state.currentDirectoryEntries];
      for (const entry of dirEntries) {
        for (const tmbUrl of action.tmbURLs) {
          if (entry.path === tmbUrl.filePath) {
            entry.thumbPath = tmbUrl.tmbPath;
            break;
          }
        }
      }
      return {
        ...state,
        currentDirectoryEntries: [...dirEntries]
      };
    }
    case types.REFLECT_DELETE_ENTRY: {
      const newDirectoryEntries = state.currentDirectoryEntries.filter(
        entry => entry.path !== action.path
      );
      const newOpenedFiles = state.openedFiles.filter(
        entry => entry.path !== action.path
      );
      if (
        state.currentDirectoryEntries.length > newDirectoryEntries.length ||
        state.openedFiles.length > newOpenedFiles.length
      ) {
        return {
          ...state,
          currentDirectoryEntries: newDirectoryEntries,
          openedFiles: newOpenedFiles,
          isEntryInFullWidth: false
        };
      }
      return state;
    }
    case types.REFLECT_CREATE_ENTRY: {
      // Prevent adding entry twice e.g. by the watcher
      const entryIndex = state.currentDirectoryEntries.findIndex(
        entry => entry.path === action.newEntry.path
      );
      // clean all dir separators to have platform independent path match
      if (
        entryIndex < 0 &&
        extractParentDirectoryPath(
          action.newEntry.path,
          PlatformIO.getDirSeparator()
        ).replace(/[/\\]/g, '') ===
          state.currentDirectoryPath.replace(/[/\\]/g, '')
      ) {
        return {
          ...state,
          currentDirectoryEntries: [
            ...state.currentDirectoryEntries,
            action.newEntry
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

      return {
        ...state,
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
              ...entry.tags.filter(tag => tag.type === 'sidecar'), // add only sidecar tags
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
          return {
            ...entry,
            path: action.newPath, // TODO handle change extension case
            tags: [
              ...entry.tags.filter(tag => tag.type === 'sidecar'), // add only sidecar tags
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
    case types.UPDATE_CURRENTDIR_ENTRY: {
      return {
        ...state,
        currentDirectoryEntries: state.currentDirectoryEntries.map(entry => {
          if (entry.path !== action.path) {
            return entry;
          }
          if (action.entry.tags && action.entry.tags.length > 0) {
            /* const tags = [...entry.tags]; // .filter(tag => tag.type === 'plain')];
            action.entry.tags.map(tag => {
              if (!entry.tags.some(oldTag => oldTag.title === tag.title)) {
                tags.push(tag);
              }
              return true;
            }); */

            return {
              ...entry,
              ...action.entry
              // tags
              /* tags: [
                ...entry.tags.filter(tag => tag.type === 'plain'),
                ...action.entry.tags
              ] */
            };
          }
          return {
            ...entry,
            ...action.entry
          };
        })
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
    case types.CLOSE_ALLVERTICAL_PANELS: {
      return {
        ...state,
        locationManagerPanelOpened: false,
        tagLibraryPanelOpened: false,
        searchPanelOpened: false,
        helpFeedbackPanelOpened: false
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
  loggedIn: user => ({ type: types.LOGIN_SUCCESS, user }),
  initApp: () => (dispatch: (actions: Object) => void, getState: () => any) => {
    disableBackGestureMac();

    dispatch(SettingsActions.setZoomRestoreApp());
    dispatch(SettingsActions.upgradeSettings()); // TODO call this only on app version update
    const state = getState();
    const defaultLocationId = getDefaultLocationId(state);
    if (defaultLocationId && defaultLocationId.length > 0) {
      dispatch(actions.openLocationById(defaultLocationId));
    }
    if (getCheckForUpdateOnStartup(state)) {
      dispatch(SettingsActions.checkForUpdate());
    }
    if (isFirstRun(state)) {
      dispatch(actions.toggleOnboardingDialog());
      dispatch(actions.toggleLicenseDialog());
    }
    setTimeout(() => {
      PlatformIO.setGlobalShortcuts(isGlobalKeyBindingEnabled(state));
    }, 1000);
    const langURLParam = getURLParameter('locale');
    if (
      langURLParam &&
      langURLParam.length > 1 &&
      /^[a-zA-Z\-_]+$/.test('langURLParam')
    ) {
      dispatch(SettingsActions.setLanguage(langURLParam));
    }

    const lid = getURLParameter('tslid');
    const dPath = getURLParameter('tsdpath');
    const ePath = getURLParameter('tsepath');
    const cmdOpen = getURLParameter('cmdopen');
    if (lid || dPath || ePath) {
      setTimeout(() => {
        dispatch(actions.openLink(window.location.href));
      }, 1000);
    } else if (cmdOpen) {
      setTimeout(() => {
        dispatch(
          actions.openLink(
            window.location.href.split('?')[0] + '?cmdopen=' + cmdOpen
          )
        );
      }, 1000);
    }
  },
  goOnline: () => ({ type: types.DEVICE_ONLINE }),
  goOffline: () => ({ type: types.DEVICE_OFFLINE }),
  setUpdateAvailable: (isUpdateAvailable: boolean) => ({
    type: types.SET_NEW_VERSION_AVAILABLE,
    isUpdateAvailable
  }),
  setProgress: (path, progress, abort) => ({
    type: types.PROGRESS,
    path,
    progress,
    abort
  }),
  resetProgress: () => ({ type: types.RESET_PROGRESS }),
  onUploadProgress: (progress, abort) => (
    dispatch: (actions: Object) => void
  ) => {
    const progressPercentage = Math.round(
      (progress.loaded / progress.total) * 100
    );
    console.log(progressPercentage);

    dispatch(actions.setProgress(progress.key, progressPercentage, abort));
  },
  showCreateDirectoryDialog: () => (
    dispatch: (actions: Object) => void,
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
    dispatch: (actions: Object) => void,
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
      dispatch(actions.toggleCreateFileDialog());
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
  toggleLicenseDialog: () => ({ type: types.TOGGLE_LICENSE_DIALOG }),
  toggleThirdPartyLibsDialog: () => ({
    type: types.TOGGLE_THIRD_PARTY_LIBS_DIALOG
  }),
  toggleSettingsDialog: () => ({ type: types.TOGGLE_SETTINGS_DIALOG }),
  toggleCreateDirectoryDialog: () => ({
    type: types.TOGGLE_CREATE_DIRECTORY_DIALOG
  }),
  toggleCreateFileDialog: () => ({ type: types.TOGGLE_CREATE_FILE_DIALOG }),
  toggleDeleteMultipleEntriesDialog: () => ({
    type: types.TOGGLE_DELETE_MULTIPLE_ENTRIES_DIALOG
  }),
  toggleUploadDialog: () => ({
    type: types.TOGGLE_UPLOAD_DIALOG
  }),
  clearUploadDialog: () => (
    dispatch: (actions: Object) => void,
    getState: () => any
  ) => {
    // const currentLocation: Location = getState().locations.find(location => location.uuid === getCurrentLocationId(getState()))
    if (PlatformIO.haveObjectStoreSupport()) {
      // && currentLocation.type === locationType.TYPE_AMPLIFY) {
      const { currentDirectoryPath } = getState().app;
      dispatch(actions.clearUploadDialogInt());
      dispatch(actions.loadDirectoryContent(currentDirectoryPath, false));
    }
  },
  clearUploadDialogInt: () => ({
    type: types.CLEAR_UPLOAD_DIALOG
  }),
  toggleProgressDialog: () => ({
    type: types.TOGGLE_PROGRESS_DIALOG
  }),
  openLocationManagerPanel: () => ({ type: types.OPEN_LOCATIONMANAGER_PANEL }),
  openTagLibraryPanel: () => ({ type: types.OPEN_TAGLIBRARY_PANEL }),
  openSearchPanel: () => ({ type: types.OPEN_SEARCH_PANEL }),
  openHelpFeedbackPanel: () => ({ type: types.OPEN_HELPFEEDBACK_PANEL }),
  closeAllVerticalPanels: () => ({ type: types.CLOSE_ALLVERTICAL_PANELS }),
  setIsLoading: (isLoading: boolean) => ({
    type: types.SET_ISLOADING,
    isLoading
  }),
  loadParentDirectoryContent: () => (
    dispatch: (actions: Object) => void,
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
        dispatch(actions.loadDirectoryContent(parentDirectory, false));
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
  loadDirectoryContentInt: (
    directoryPath: string,
    generateThumbnails: boolean,
    fsEntryMeta?: TS.FileSystemEntryMeta
  ) => (dispatch: (actions: Object) => void, getState: () => any) => {
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
    /* PlatformIO.enableWebdavSupport({   TODO use this to enable webdav support for location the same like objectstore
      username: 'webdav',
      password: '1234',
      port: 8080
    }); */
    PlatformIO.listDirectoryPromise(
      directoryPath,
      ['extractThumbPath', 'extractThumbURL'],
      currentLocation ? currentLocation.ignorePatternPaths : []
    )
      .then(results => {
        if (results !== undefined) {
          // console.debug('app listDirectoryPromise resolved:' + results.length);
          dispatch(
            actions.setCurrentDirectoryPerspective(PerspectiveIDs.UNSPECIFIED)
          );
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
        return true;
      })
      .catch(error => {
        // console.timeEnd('listDirectoryPromise');
        dispatch(actions.loadDirectoryFailure(directoryPath, error)); // Currently this is never called, due the promise always resolve
      });
  },
  loadDirectoryContent: (
    directoryPath: string,
    generateThumbnails: boolean
  ) => async (dispatch: (actions: Object) => void, getState: () => any) => {
    // console.debug('loadDirectoryContent:' + directoryPath);
    window.walkCanceled = false;

    dispatch(actions.setIsLoading(true));

    const state = getState();
    const { selectedEntries } = state.app;
    if (selectedEntries.length > 0) {
      dispatch(actions.setSelectedEntries([]));
    }
    try {
      const fsEntryMeta = await loadMetaDataPromise(
        normalizePath(directoryPath) + PlatformIO.getDirSeparator()
      );
      // console.debug('Loading meta succeeded for:' + directoryPath);
      dispatch(
        actions.loadDirectoryContentInt(
          directoryPath,
          generateThumbnails,
          fsEntryMeta
        )
      );
      /* if (fsEntryMeta.color) { // TODO rethink this states changes are expensive
          dispatch(actions.setCurrentDirectoryColor(fsEntryMeta.color));
        }
        if (fsEntryMeta.perspective) {
          dispatch(actions.setCurrentDirPerspective(fsEntryMeta.perspective));
        } */

      // return true;
    } catch (err) {
      console.debug('Error loading meta of:' + directoryPath + ' ' + err);
      dispatch(
        actions.loadDirectoryContentInt(directoryPath, generateThumbnails)
      );
    }
  },
  loadDirectorySuccess: (
    directoryPath: string,
    directoryContent: Array<Object>,
    directoryMeta?: TS.FileSystemEntryMeta
  ) => (dispatch: (actions: Object) => void) => {
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
    dispatch(actions.hideNotifications());
    dispatch(
      actions.loadDirectorySuccessInt(
        directoryPath,
        directoryContent,
        false,
        directoryMeta
      )
    );
  },
  loadDirectorySuccessInt: (
    directoryPath: string,
    directoryContent: Array<Object>,
    showIsLoading?: boolean,
    directoryMeta?: TS.FileSystemEntryMeta
  ) => ({
    type: types.LOAD_DIRECTORY_SUCCESS,
    directoryPath: directoryPath || PlatformIO.getDirSeparator(),
    directoryContent,
    directoryMeta,
    showIsLoading
  }),
  loadDirectoryFailure: (directoryPath: string, error?: any) => (
    dispatch: (actions: Object) => void
  ) => {
    console.warn('Error loading directory: ' + error);
    dispatch(actions.hideNotifications());
    dispatch(
      actions.showNotification(
        i18n.t('core:errorLoadingFolder'),
        'warning',
        true
      )
    );
    dispatch(actions.loadDirectorySuccess(directoryPath, []));
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
  setSelectedEntries: (selectedEntries: Array<Object>) => (
    dispatch: (actions: Object) => void,
    getState: () => any
  ) => {
    // const { openedFiles } = getState().app;
    // skip select other file if its have openedFiles in editMode
    // if (openedFiles.length === 0 || !openedFiles[0].editMode) {
    dispatch(actions.setSelectedEntriesInt(selectedEntries));
    // }
  },
  setSelectedEntriesInt: (selectedEntries: Array<Object>) => ({
    type: types.SET_SELECTED_ENTRIES,
    selectedEntries
  }),
  deleteDirectory: (directoryPath: string) => (
    dispatch: (actions: Object) => void,
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
          dispatch(LocationIndexActions.reflectDeleteEntry(directoryPath));
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
    dispatch: (actions: Object) => void,
    getState: () => any
  ) =>
    PlatformIO.renameDirectoryPromise(directoryPath, newDirectoryName)
      .then(newDirPath => {
        const { currentDirectoryPath, openedFiles } = getState().app;
        if (currentDirectoryPath === directoryPath) {
          dispatch(actions.loadDirectoryContent(newDirPath, false));
          if (openedFiles && openedFiles.length > 0) {
            if (openedFiles[0].path === directoryPath) {
              const openedFile = openedFiles[0];
              openedFile.path = newDirPath;
              dispatch(actions.addToEntryContainer(openedFile));
            }
          }
          dispatch(
            LocationIndexActions.reflectRenameEntry(directoryPath, newDirPath)
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
  createDirectory: (directoryPath: string) => (
    dispatch: (actions: Object) => void
  ) => {
    PlatformIO.createDirectoryPromise(directoryPath)
      .then(result => {
        if (result !== undefined && result.dirPath !== undefined) {
          // eslint-disable-next-line no-param-reassign
          directoryPath = result.dirPath;
        }
        console.log(`Creating directory ${directoryPath} successful.`);
        dispatch(actions.reflectCreateEntry(directoryPath, false));
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
        // dispatch stopLoadingAnimation
      });
  },
  createFile: () => (
    dispatch: (actions: Object) => void,
    getState: () => any
  ) => {
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
      PlatformIO.saveFilePromise(filePath, '', true)
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
  ) => (dispatch: (actions: Object) => void, getState: () => any) => {
    const fileNameAndExt = fileName + '.' + fileType;
    const filePath =
      normalizePath(targetPath) + PlatformIO.getDirSeparator() + fileNameAndExt;
    let fileContent = content;
    if (fileType === 'html') {
      const { newHTMLFileContent } = getState().settings;
      fileContent =
        newHTMLFileContent.split('<body></body>')[0] +
        '<body>' +
        content +
        '</body>' +
        newHTMLFileContent.split('<body></body>')[1];
    }
    PlatformIO.saveFilePromise(filePath, fileContent, true)
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
  setSearchResults: (searchResults: Array<Object> | []) => ({
    type: types.SET_SEARCH_RESULTS,
    searchResults
  }),
  appendSearchResults: (searchResults: Array<Object> | []) => ({
    type: types.APPEND_SEARCH_RESULTS,
    searchResults
  }),
  setCurrentLocationId: (locationId: string | null) => ({
    type: types.SET_CURRENLOCATIONID,
    locationId
  }),
  changeLocation: (location: TS.Location) => (
    dispatch: (actions: Object) => void,
    getState: () => any
  ) => {
    const { currentLocationId } = getState().app;
    if (location.uuid !== currentLocationId) {
      dispatch(LocationIndexActions.clearDirectoryIndex());
      dispatch(actions.setCurrentLocationId(location.uuid));
    }
  },
  openLocationById: (locationId: string) => (
    dispatch: (actions: Object) => void,
    getState: () => any
  ) => {
    const { locations } = getState();
    locations.map(location => {
      if (location.uuid === locationId) {
        dispatch(actions.openLocation(location));
      }
      return true;
    });
  },
  openLocation: (location: TS.Location) => (
    dispatch: (actions: Object) => void,
    getState: () => any
  ) => {
    if (Pro && Pro.Watcher) {
      Pro.Watcher.stopWatching();
    }
    if (location.type === locationType.TYPE_CLOUD) {
      if (!Pro) {
        dispatch(
          actions.showNotification(
            i18n.t('core:thisFunctionalityIsAvailableInPro'),
            'warning',
            true
          )
        );
        return;
      }
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
          dispatch(
            actions.loadDirectoryContent(getLocationPath(location), false)
          );
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
      PlatformIO.disableObjectStoreSupport();
      dispatch(actions.setReadOnlyMode(location.isReadOnly || false));
      dispatch(actions.changeLocation(location));
      dispatch(actions.loadDirectoryContent(getLocationPath(location), true));
      if (Pro && Pro.Watcher && location.watchForChanges) {
        const perspective = getCurrentDirectoryPerspective(getState());
        const depth = perspective === PerspectiveIDs.KANBAN ? 3 : 1;
        Pro.Watcher.watchFolder(
          getLocationPath(location),
          dispatch,
          actions,
          depth
        );
      }
    }
  },
  closeLocation: (locationId: string) => (
    dispatch: (actions: Object) => void,
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
          if (Pro && Pro.Watcher) {
            Pro.Watcher.stopWatching();
          }
        }
        clearAllURLParams();
        return true;
      });
    }
  },
  closeAllLocations: () => (dispatch: (actions: Object) => void) => {
    // location needed evtl. to unwatch many loc. root folders if available
    dispatch(actions.setCurrentLocationId(null));
    dispatch(actions.clearDirectoryContent());
    dispatch(LocationIndexActions.clearDirectoryIndex());
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
    notificationType: string = 'default',
    autohide: boolean = true,
    tid: string = 'notificationTID'
  ) => ({
    type: types.SET_NOTIFICATION,
    visible: true,
    text,
    notificationType,
    autohide,
    tid
  }),
  hideNotifications: () => ({
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
    dispatch: (actions: Object) => void,
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
    fsEntryMeta: any // FileSystemEntryMeta,
    // isFile: boolean = true
  ) => (dispatch: (actions: Object) => void, getState: () => any) => {
    const { openedFiles } = getState().app;
    if (openedFiles && openedFiles.length > 0) {
      PlatformIO.getPropertiesPromise(entryPath)
        .then(entryProps => {
          if (entryProps) {
            const { supportedFileTypes } = getState().settings;

            let entryForOpening: OpenedEntry;
            const entryExist = openedFiles.find(obj => obj.path === entryPath);

            if (!entryExist) {
              entryForOpening = findExtensionsForEntry(
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
            dispatch(actions.addToEntryContainer(entryForOpening));
          }
          return true;
        })
        .catch(err => {
          console.error('updateOpenedFile ' + entryPath + ' not exist ' + err);
        });
    }
  },
  openFsEntry: (fsEntry?: TS.FileSystemEntry) => (
    dispatch: (actions: Object) => void,
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
      supportedFileTypes,
      fsEntry.path,
      fsEntry.isFile
    );
    if (PlatformIO.haveObjectStoreSupport()) {
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
    const currentLocation: TS.Location = getLocation(
      getState(),
      getState().app.currentLocationId
    );
    const { currentDirectoryPath } = getState().app;
    updateHistory(currentLocation, currentDirectoryPath, fsEntry.path);

    dispatch(actions.addToEntryContainer(entryForOpening));
  },
  toggleEntryFullWidth: () => ({
    type: types.TOGGLE_ENTRY_FULLWIDTH
  }),
  setEntryFullWidth: (isFullWidth: boolean) => ({
    type: types.SET_ENTRY_FULLWIDTH,
    isFullWidth
  }),
  openNextFile: (path?: string) => (
    dispatch: (actions: Object) => void,
    getState: () => any
  ) => {
    const lastSelectedEntry = getLastSelectedEntry(getState());
    const nextFile = getNextFile(
      path,
      lastSelectedEntry ? lastSelectedEntry.path : undefined,
      getState().app.currentDirectoryEntries
    );
    if (nextFile !== undefined) {
      dispatch(actions.openFsEntry(nextFile));
      // dispatch(actions.setLastSelectedEntry(nextFile.path));
      dispatch(actions.setSelectedEntries([nextFile]));
      return nextFile;
    }
  },
  openPrevFile: (path?: string) => (
    dispatch: (actions: Object) => void,
    getState: () => any
  ) => {
    const lastSelectedEntry = getLastSelectedEntry(getState());
    const prevFile = getPrevFile(
      path,
      lastSelectedEntry ? lastSelectedEntry.path : undefined,
      getState().app.currentDirectoryEntries
    );
    if (prevFile !== undefined) {
      dispatch(actions.openFsEntry(prevFile));
      // dispatch(actions.setLastSelectedEntry(prevFile.path));
      dispatch(actions.setSelectedEntries([prevFile]));
    }
  },
  closeAllFiles: () => ({ type: types.CLOSE_ALL_FILES }),
  reflectDeleteEntryInt: (path: string) => ({
    type: types.REFLECT_DELETE_ENTRY,
    path
  }),
  reflectDeleteEntry: (path: string) => (
    dispatch: (actions: Object) => void
  ) => {
    dispatch(actions.reflectDeleteEntryInt(path));
    dispatch(LocationIndexActions.reflectDeleteEntry(path));
  },
  reflectCreateEntryInt: newEntry => ({
    type: types.REFLECT_CREATE_ENTRY,
    newEntry
  }),
  reflectCreateEntries: (fsEntries: Array<TS.FileSystemEntry>) => (
    dispatch: (actions: Object) => void
  ) => {
    fsEntries.map(entry => dispatch(actions.reflectCreateEntryInt(entry))); // TODO remove map and set state once
    dispatch(actions.setSelectedEntries(fsEntries));
  },
  reflectCreateEntry: (path: string, isFile: boolean) => (
    dispatch: (actions: Object) => void
  ) => {
    const newEntry = {
      uuid: uuidv1(),
      name: isFile
        ? extractFileName(path, PlatformIO.getDirSeparator())
        : extractDirectoryName(path, PlatformIO.getDirSeparator()),
      isFile,
      extension: extractFileExtension(path, PlatformIO.getDirSeparator()),
      description: '',
      tags: [],
      size: 0,
      lmdt: new Date().getTime(),
      path
    };
    dispatch(actions.setSelectedEntries([newEntry]));
    dispatch(actions.reflectCreateEntryInt(newEntry));
    dispatch(LocationIndexActions.reflectCreateEntry(newEntry));
  },
  reflectRenameEntryInt: (path: string, newPath: string) => ({
    type: types.REFLECT_RENAME_ENTRY,
    path,
    newPath
  }),
  reflectRenameEntry: (path: string, newPath: string) => (
    dispatch: (actions: Object) => void
  ) => {
    dispatch(actions.reflectRenameEntryInt(path, newPath));
    dispatch(LocationIndexActions.reflectRenameEntry(path, newPath));
    dispatch(actions.setSelectedEntries([]));
  },
  updateCurrentDirEntry: (path: string, entry: Object) => ({
    type: types.UPDATE_CURRENTDIR_ENTRY,
    path,
    entry
  }),
  /**
   * @param path
   * @param tags
   * @param updateIndex
   */
  reflectUpdateSidecarTags: (
    path: string,
    tags: Array<TS.Tag>,
    updateIndex: boolean = true
  ) => (dispatch: (actions: Object) => void, getState: () => any) => {
    const { openedFiles, selectedEntries } = getState().app;
    /**
     * if its have openedFiles updateCurrentDirEntry is called from FolderContainer (useEffect -> ... if (openedFile.changed)
     */
    if (
      openedFiles.length === 0 ||
      !openedFiles.some(obj => obj.path === path) ||
      selectedEntries.length > 1
    ) {
      dispatch(actions.updateCurrentDirEntry(path, { tags }));
    }
    if (updateIndex) {
      dispatch(LocationIndexActions.reflectUpdateSidecarTags(path, tags));
    }
  },
  deleteFile: (filePath: string) => (
    dispatch: (actions: Object) => void,
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
    dispatch: (actions: Object) => void
  ) =>
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
        dispatch(actions.reflectRenameEntry(filePath, newFilePathFromPromise));
        // Update sidecar file and thumb
        renameFilesPromise([
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
            console.info(
              'Renaming meta file and thumb successful from ' +
                filePath +
                ' to:' +
                newFilePath
            );
            return true;
          })
          .catch(err => {
            console.warn(
              'Renaming meta file and thumb failed from ' +
                filePath +
                ' to:' +
                newFilePath +
                ' with ' +
                err
            );
          });
        return true;
      })
      .catch(error => {
        console.warn('Error while renaming file: ' + error);
        dispatch(
          actions.showNotification(
            `Error while renaming file ${filePath}`,
            'error',
            true
          )
        );
        throw error;
      }),
  openFileNatively: (selectedFile?: string) => (
    dispatch: (actions: Object) => void,
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
  openLink: (url: string) => (
    dispatch: (actions: Object) => void,
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
            dispatch(actions.setEntryFullWidth(true));
          } else {
            dispatch(actions.loadDirectoryContent(fsEntry.path, false));
          }
          return true;
        })
        .catch(() =>
          dispatch(
            actions.showNotification(
              i18n.t('missing file or folder'),
              'warning',
              true
            )
          )
        );
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
        if (targetLocation.uuid !== currentLocationId) {
          dispatch(actions.openLocation(targetLocation));
        } else {
          openLocationTimer = 0;
        }
        setTimeout(() => {
          if (isCloudLocation) {
            if (directoryPath && directoryPath.length > 0) {
              const dirFullPath = directoryPath;
              dispatch(actions.loadDirectoryContent(dirFullPath, false));
            }

            if (entryPath) {
              getAllPropertiesPromise(entryPath)
                .then((fsEntry: TS.FileSystemEntry) => {
                  if (fsEntry) {
                    dispatch(actions.openFsEntry(fsEntry));
                    dispatch(actions.setEntryFullWidth(true));
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
          } else {
            // local files case
            const locationPath = getLocationPath(targetLocation);
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
              dispatch(actions.loadDirectoryContent(dirFullPath, false));
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
                    dispatch(actions.setEntryFullWidth(true));
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
  openURLExternally: (url: string, skipConfirmation: boolean = false) => () => {
    if (skipConfirmation) {
      PlatformIO.openUrl(url);
    } else if (
      window.confirm('Do you really want to open this url: ' + url + ' ?')
    ) {
      PlatformIO.openUrl(url);
    }
  },
  saveFile: () => (dispatch: (actions: Object) => void) => {
    dispatch(
      actions.showNotification(
        i18n.t('core:notImplementedYet'),
        'warning',
        true
      )
    );
  },
  isCurrentLocation: (uuid: string) => (
    dispatch: (actions: Object) => void,
    getState: () => any
  ) => {
    const { currentLocationId } = getState().app;
    return currentLocationId === uuid;
  },
  openCurrentDirectory: () => (
    dispatch: (actions: Object) => void,
    getState: () => any
  ) => {
    const { currentDirectoryPath } = getState().app;
    if (currentDirectoryPath) {
      dispatch(actions.loadDirectoryContent(currentDirectoryPath, false));
    } else {
      dispatch(actions.setSearchResults([]));
    }
  }
};

// Selectors
export const currentUser = (state: any) => state.app.user;
export const getDirectoryContent = (state: any) =>
  state.app.currentDirectoryEntries;
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
        return getLocationPath(location);
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
export const getSelectedTag = (state: any) => state.app.tag;
export const getSelectedEntries = (state: any) =>
  state.app.selectedEntries ? state.app.selectedEntries : [];
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
export const isCreateFileDialogOpened = (state: any) =>
  state.app.createFileDialogOpened;
export const isDeleteMultipleEntriesDialogOpened = (state: any) =>
  state.app.deleteMultipleEntriesDialogOpened;
export const isUploadDialogOpened = (state: any) =>
  state.app.uploadDialogOpened;
export const isOpenLinkDialogOpened = (state: any) =>
  state.app.openLinkDialogOpened;
export const isProgressOpened = (state: any) => state.app.progressDialogOpened;
export const getOpenedFiles = (state: any) => state.app.openedFiles;
export const getNotificationStatus = (state: any) =>
  state.app.notificationStatus;
export const getSearchResultCount = (state: any) =>
  Object.keys(state.locationIndex.searchQuery).length === 0
    ? 0
    : state.app.currentDirectoryEntries.length;
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
