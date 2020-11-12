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

import uuidv1 from 'uuid';
import pathLib from 'path';
import { Location, getLocation, locationType } from './locations';
import PlatformIO from '../services/platform-io';
import AppConfig from '../config';
import {
  deleteFilesPromise,
  loadMetaDataPromise,
  renameFilesPromise,
  enhanceDirectoryContent,
  FileSystemEntryMeta,
  FileSystemEntry,
  getAllPropertiesPromise
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
  extractLocation
} from '-/utils/paths';
import { formatDateTime4Tag, getURLParameter } from '-/utils/misc';
import i18n from '../services/i18n';
import { Pro } from '../pro';
// import { getThumbnailURLPromise } from '../services/thumbsgenerator';
import { actions as LocationIndexActions } from './location-index';
import { Tag } from './taglibrary';

export const types = {
  DEVICE_ONLINE: 'APP/DEVICE_ONLINE',
  DEVICE_OFFLINE: 'APP/DEVICE_OFFLINE',
  PROGRESS: 'APP/PROGRESS',
  RESET_PROGRESS: 'APP/RESET_PROGRESS',
  LOGIN_REQUEST: 'APP/LOGIN_REQUEST',
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
  TOGGLE_ONBOARDING_DIALOG: 'APP/TOGGLE_ONBOARDING_DIALOG',
  TOGGLE_KEYBOARD_DIALOG: 'APP/TOGGLE_KEYBOARD_DIALOG',
  TOGGLE_LICENSE_DIALOG: 'APP/TOGGLE_LICENSE_DIALOG',
  TOGGLE_THIRD_PARTY_LIBS_DIALOG: 'APP/TOGGLE_THIRD_PARTY_LIBS_DIALOG',
  TOGGLE_SETTINGS_DIALOG: 'APP/TOGGLE_SETTINGS_DIALOG',
  TOGGLE_CREATE_DIRECTORY_DIALOG: 'APP/TOGGLE_CREATE_DIRECTORY_DIALOG',
  TOGGLE_CREATE_FILE_DIALOG: 'APP/TOGGLE_CREATE_FILE_DIALOG',
  TOGGLE_SELECT_DIRECTORY_DIALOG: 'APP/TOGGLE_SELECT_DIRECTORY_DIALOG',
  TOGGLE_UPLOAD_DIALOG: 'APP/TOGGLE_UPLOAD_DIALOG',
  CLEAR_UPLOAD_DIALOG: 'APP/CLEAR_UPLOAD_DIALOG',
  TOGGLE_PROGRESS_DIALOG: 'APP/TOGGLE_PROGRESS_DIALOG',
  OPEN_LOCATIONMANAGER_PANEL: 'APP/OPEN_LOCATIONMANAGER_PANEL',
  OPEN_TAGLIBRARY_PANEL: 'APP/OPEN_TAGLIBRARY_PANEL',
  OPEN_SEARCH_PANEL: 'APP/OPEN_SEARCH_PANEL',
  OPEN_PERSPECTIVES_PANEL: 'APP/OPEN_PERSPECTIVES_PANEL',
  OPEN_HELPFEEDBACK_PANEL: 'APP/OPEN_HELPFEEDBACK_PANEL',
  CLOSE_ALLVERTICAL_PANELS: 'APP/CLOSE_ALLVERTICAL_PANELS',
  REFLECT_DELETE_ENTRY: 'APP/REFLECT_DELETE_ENTRY',
  REFLECT_RENAME_ENTRY: 'APP/REFLECT_RENAME_ENTRY',
  REFLECT_CREATE_ENTRY: 'APP/REFLECT_CREATE_ENTRY',
  // REFLECT_UPDATE_SIDECARTAGS: 'APP/REFLECT_UPDATE_SIDECARTAGS',
  // REFLECT_UPDATE_SIDECARMETA: 'APP/REFLECT_UPDATE_SIDECARMETA',
  UPDATE_CURRENTDIR_ENTRY: 'APP/UPDATE_CURRENTDIR_ENTRY'
};
export const perspectives = {
  DEFAULT: 'default',
  GALLERY: 'gallery',
  // TREEVIZ: 'treeviz',
  MAPIQUE: 'mapique',
  KANBAN: 'kanban'
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
  changed?: boolean;
  /**
   * if its true iframe will be reloaded
   * if its false && editMode==true and changed==true => show reload dialog
   * default: undefined
   */
  shouldReload?: boolean;
  focused?: boolean; // TODO make it mandatory once support for multiple files is added
  tags?: Array<Tag>;
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
  onboardingDialogOpened: false,
  keysDialogOpened: false,
  createFileDialogOpened: false,
  licenseDialogOpened: false,
  thirdPartyLibsDialogOpened: false,
  settingsDialogOpened: false,
  createDirectoryDialogOpened: false,
  selectDirectoryDialogOpened: false,
  lastSelectedEntry: null,
  selectedEntries: [],
  isEntryInFullWidth: false,
  isGeneratingThumbs: false,
  locationManagerPanelOpened: showLocations,
  tagLibraryPanelOpened: showTagLibrary,
  searchPanelOpened: showSearch,
  perspectivesPanelOpened: false,
  helpFeedbackPanelOpened: false
};

// The state described here will not be persisted
export default (state: any = initialState, action: any) => {
  switch (action.type) {
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
      return {
        ...state,
        currentDirectoryEntries: action.directoryContent,
        currentDirectoryColor: action.directoryMeta
          ? action.directoryMeta.color || ''
          : '',
        currentDirectoryPerspective: action.directoryMeta
          ? action.directoryMeta.perspective
          : undefined,
        currentDirectoryPath: action.directoryPath,
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
    case types.SET_LAST_SELECTED_ENTRY: {
      /* console.time('SET_LAST_SELECTED_ENTRY'); // Measure set last selected entry
    const result = { ...state, lastSelectedEntry: action.entryPath };
    console.timeEnd('SET_LAST_SELECTED_ENTRY');
    return result; */
      return { ...state, lastSelectedEntry: action.entryPath };
    }
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
    case types.TOGGLE_ONBOARDING_DIALOG: {
      return {
        ...state,
        onboardingDialogOpened: !state.onboardingDialogOpened
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
    case types.TOGGLE_SELECT_DIRECTORY_DIALOG: {
      return {
        ...state,
        selectDirectoryDialogOpened: !state.selectDirectoryDialogOpened
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
      if (PlatformIO.haveObjectStoreSupport()) {
        // upload dialog have objectStore support only
        return {
          ...state,
          progress: [],
          uploadDialogOpened: false
        };
      }
      return state;
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
          notificationType: action.notificationType,
          autohide: action.autohide
        }
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
          openedFiles: newOpenedFiles
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
      return {
        ...state,
        currentDirectoryEntries: state.currentDirectoryEntries.map(entry => {
          if (entry.path !== action.path) {
            return entry;
          }
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
              ...extractTagsAsObjects(
                action.newPath,
                AppConfig.tagDelimiter,
                PlatformIO.getDirSeparator()
              )
            ]
          };
        }),
        openedFiles: state.openedFiles.map(entry => {
          if (entry.path !== action.path) {
            return entry;
          }
          return {
            ...entry,
            path: action.newPath // TODO handle change extension case
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
      // eslint-disable-next-line no-restricted-globals
      window.history.pushState('', 'TagSpaces', location.pathname);
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
        perspectivesPanelOpened: false,
        helpFeedbackPanelOpened: false
      };
    }
    case types.OPEN_TAGLIBRARY_PANEL: {
      return {
        ...state,
        locationManagerPanelOpened: false,
        tagLibraryPanelOpened: true,
        searchPanelOpened: false,
        perspectivesPanelOpened: false,
        helpFeedbackPanelOpened: false
      };
    }
    case types.OPEN_SEARCH_PANEL: {
      return {
        ...state,
        locationManagerPanelOpened: false,
        tagLibraryPanelOpened: false,
        searchPanelOpened: true,
        perspectivesPanelOpened: false,
        helpFeedbackPanelOpened: false
      };
    }
    case types.OPEN_PERSPECTIVES_PANEL: {
      return {
        ...state,
        locationManagerPanelOpened: false,
        tagLibraryPanelOpened: false,
        searchPanelOpened: false,
        perspectivesPanelOpened: true,
        helpFeedbackPanelOpened: false
      };
    }
    case types.OPEN_HELPFEEDBACK_PANEL: {
      return {
        ...state,
        locationManagerPanelOpened: false,
        tagLibraryPanelOpened: false,
        searchPanelOpened: false,
        perspectivesPanelOpened: false,
        helpFeedbackPanelOpened: true
      };
    }
    case types.CLOSE_ALLVERTICAL_PANELS: {
      return {
        ...state,
        locationManagerPanelOpened: false,
        tagLibraryPanelOpened: false,
        searchPanelOpened: false,
        perspectivesPanelOpened: false,
        helpFeedbackPanelOpened: false
      };
    }
    default: {
      return state;
    }
  }
};

function getNextFile(
  pivotFilePath?: string,
  lastSelectedEntry?: string,
  currentDirectoryEntries?: Array<FileSystemEntry>
): FileSystemEntry {
  const currentEntries = currentDirectoryEntries
    ? currentDirectoryEntries.filter(entry => entry.isFile)
    : [];
  let filePath = pivotFilePath;
  if (!filePath) {
    if (lastSelectedEntry) {
      filePath = lastSelectedEntry;
    } else if (currentEntries.length > 0) {
      filePath = currentEntries[0].path;
    } else {
      return undefined;
    }
  }
  let nextFile;
  currentEntries.forEach((entry, index) => {
    if (entry.path === filePath) {
      const nextIndex = index + 1;
      if (nextIndex < currentEntries.length) {
        nextFile = currentEntries[nextIndex];
      } else {
        // eslint-disable-next-line prefer-destructuring
        nextFile = currentEntries[0];
      }
    }
  });
  if (nextFile === undefined) {
    // eslint-disable-next-line prefer-destructuring
    nextFile = currentEntries[0];
  }
  return nextFile;
}

function getPrevFile(
  pivotFilePath?: string,
  lastSelectedEntry?: string,
  currentDirectoryEntries?: Array<FileSystemEntry>
): FileSystemEntry {
  const currentEntries = currentDirectoryEntries
    ? currentDirectoryEntries.filter(entry => entry.isFile)
    : [];
  let filePath = pivotFilePath;
  if (!filePath) {
    if (lastSelectedEntry) {
      filePath = lastSelectedEntry;
    } else if (currentEntries.length > 0) {
      filePath = currentEntries[0].path;
    } else {
      return undefined;
    }
  }
  let prevFile;
  currentEntries.forEach((entry, index) => {
    if (entry.path === filePath) {
      const prevIndex = index - 1;
      if (prevIndex >= 0) {
        prevFile = currentEntries[prevIndex];
      } else {
        prevFile = currentEntries[currentEntries.length - 1];
      }
    }
  });
  if (prevFile === undefined) {
    // eslint-disable-next-line prefer-destructuring
    prevFile = currentEntries[0];
  }
  return prevFile;
}

export const actions = {
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
  showSelectDirectoryDialog: () => (dispatch: (actions: Object) => void) => {
    dispatch(actions.toggleSelectDirectoryDialog());
  },
  toggleEditTagDialog: (tag: Tag) => ({
    type: types.TOGGLE_EDIT_TAG_DIALOG,
    tag
  }),
  toggleAboutDialog: () => ({ type: types.TOGGLE_ABOUT_DIALOG }),
  toggleOnboardingDialog: () => ({ type: types.TOGGLE_ONBOARDING_DIALOG }),
  toggleKeysDialog: () => ({ type: types.TOGGLE_KEYBOARD_DIALOG }),
  toggleLicenseDialog: () => ({ type: types.TOGGLE_LICENSE_DIALOG }),
  toggleThirdPartyLibsDialog: () => ({
    type: types.TOGGLE_THIRD_PARTY_LIBS_DIALOG
  }),
  toggleSettingsDialog: () => ({ type: types.TOGGLE_SETTINGS_DIALOG }),
  toggleCreateDirectoryDialog: () => ({
    type: types.TOGGLE_CREATE_DIRECTORY_DIALOG
  }),
  toggleCreateFileDialog: () => ({ type: types.TOGGLE_CREATE_FILE_DIALOG }),
  toggleSelectDirectoryDialog: () => ({
    type: types.TOGGLE_SELECT_DIRECTORY_DIALOG
  }),
  toggleUploadDialog: () => ({
    type: types.TOGGLE_UPLOAD_DIALOG
  }),
  clearUploadDialog: () => ({
    type: types.CLEAR_UPLOAD_DIALOG
  }),
  toggleProgressDialog: () => ({
    type: types.TOGGLE_PROGRESS_DIALOG
  }),
  openLocationManagerPanel: () => ({ type: types.OPEN_LOCATIONMANAGER_PANEL }),
  openTagLibraryPanel: () => ({ type: types.OPEN_TAGLIBRARY_PANEL }),
  openSearchPanel: () => ({ type: types.OPEN_SEARCH_PANEL }),
  openPerspectivesPanel: () => ({ type: types.OPEN_PERSPECTIVES_PANEL }),
  openHelpFeedbackPanel: () => ({ type: types.OPEN_HELPFEEDBACK_PANEL }),
  closeAllVerticalPanels: () => ({ type: types.CLOSE_ALLVERTICAL_PANELS }),
  loadParentDirectoryContent: () => (
    dispatch: (actions: Object) => void,
    getState: () => any
  ) => {
    const state = getState();
    const { currentDirectoryPath } = state.app;
    const currentLocationPath = normalizePath(getCurrentLocationPath(state));

    if (currentDirectoryPath) {
      const parentDirectory = extractParentDirectoryPath(
        currentDirectoryPath,
        PlatformIO.getDirSeparator()
      );
      // console.log('parentDirectory: ' + parentDirectory  + ' - currentLocationPath: ' + currentLocationPath);
      if (parentDirectory.includes(currentLocationPath)) {
        dispatch(actions.loadDirectoryContent(parentDirectory));
      } else {
        dispatch(
          actions.showNotification(
            i18n.t('core:parentDirNotInLocation'),
            'warning',
            true
          )
        );
      }
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
  loadDirectoryContent: (directoryPath: string) => (
    dispatch: (actions: Object) => void,
    getState: () => any
  ) => {
    console.time('listDirectoryPromise');
    const { settings, locations } = getState();
    window.walkCanceled = false;

    function loadDirectoryContentInt(fsEntryMeta?: FileSystemEntryMeta) {
      // Uncomment the following line will to clear all content before loading new dir content
      dispatch(actions.loadDirectorySuccessInt(directoryPath, [], true)); // this is to reset directoryContent (it will reset color too)
      const location = extractLocation(directoryPath, locations);
      if (location !== undefined) {
        dispatch(actions.changeLocation(location));
      }
      // dispatch(actions.setCurrentDirectoryColor('')); // this is to reset color only
      dispatch(actions.showNotification(i18n.t('core:loading'), 'info', false));
      PlatformIO.listDirectoryPromise(directoryPath, false)
        .then(results => {
          prepareDirectoryContent(
            results,
            directoryPath,
            settings,
            dispatch,
            getState,
            fsEntryMeta
          );
          return true;
        })
        .catch(error => {
          console.timeEnd('listDirectoryPromise');
          dispatch(actions.loadDirectoryFailure(error)); // Currently this is never called, due the promise always resolve
        });
    }

    loadMetaDataPromise(
      normalizePath(directoryPath) + PlatformIO.getDirSeparator()
    )
      .then(fsEntryMeta => {
        loadDirectoryContentInt(fsEntryMeta);
        /* if (fsEntryMeta.color) { // TODO rethink this states changes are expensive
          dispatch(actions.setCurrentDirectoryColor(fsEntryMeta.color));
        }
        if (fsEntryMeta.perspective) {
          dispatch(actions.setCurrentDirPerspective(fsEntryMeta.perspective));
        } */

        return true;
      })
      .catch(err => {
        console.log('Error loading meta of the current folder' + err);
        loadDirectoryContentInt();
      });
  },
  loadDirectorySuccess: (
    directoryPath: string,
    directoryContent: Array<Object>,
    directoryMeta?: FileSystemEntryMeta
  ) => (dispatch: (actions: Object) => void) => {
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
    directoryMeta?: FileSystemEntryMeta
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
    thumbUrl: thumbUrl + '?' + new Date().getTime()
  }),
  updateThumbnailUrls: (tmbURLs: Array<any>) => ({
    type: types.UPDATE_THUMB_URLS,
    tmbURLs
  }),
  setGeneratingThumbnails: (isGeneratingThumbs: boolean) => ({
    type: types.SET_GENERATING_THUMBNAILS,
    isGeneratingThumbs
  }),
  setLastSelectedEntry: (entryPath: string | null) => ({
    type: types.SET_LAST_SELECTED_ENTRY,
    entryPath
  }),
  setCurrentDirectoryColor: (color: string) => ({
    type: types.SET_CURRENDIRECTORYCOLOR,
    color
  }),
  setCurrentDirectoryPerspective: (perspective: string) => ({
    type: types.SET_CURRENDIRECTORYPERSPECTIVE,
    perspective
  }),
  setSelectedEntries: (selectedEntries: Array<Object>) => ({
    type: types.SET_SELECTED_ENTRIES,
    selectedEntries
  }),
  deleteDirectory: (directoryPath: string) => (
    dispatch: (actions: Object) => void,
    getState: () => any
  ) => {
    const { settings } = getState();
    PlatformIO.deleteDirectoryPromise(directoryPath, settings.useTrashCan)
      .then(() => {
        dispatch(actions.reflectDeleteEntry(directoryPath));
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
    dispatch: (actions: Object) => void
  ) => {
    PlatformIO.renameDirectoryPromise(directoryPath, newDirectoryName)
      .then(newDirPath => {
        dispatch(actions.reflectRenameEntry(directoryPath, newDirPath));
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
      });
  },
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
            .then((fsEntry: FileSystemEntry) => {
              dispatch(actions.openFsEntry(fsEntry)); // TODO return fsEntry from saveFilePromise and simplify
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
          // TODO select file // dispatch(actions.setLastSelectedEntry(filePath));
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
      .then((fsEntry: FileSystemEntry) => {
        dispatch(actions.reflectCreateEntry(filePath, true));
        dispatch(actions.openFsEntry(fsEntry)); // TODO return fsEntry from saveFilePromise and simplify

        dispatch(actions.setLastSelectedEntry(filePath));
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
  changeLocation: (location: Location) => (
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
  openLocation: (location: Location) => (
    dispatch: (actions: Object) => void
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
          dispatch(actions.loadDirectoryContent(location.paths[0]));
          return true;
        })
        .catch(() => {
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
      dispatch(actions.loadDirectoryContent(location.paths[0]));
      if (Pro && Pro.Watcher && location.watchForChanges) {
        Pro.Watcher.watchFolder(location.paths[0], dispatch, actions);
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
        return true;
      });
    }
  },
  clearDirectoryContent: () => ({
    type: types.CLEAR_DIRECTORY_CONTENT
  }),
  showNotification: (
    text: string,
    notificationType: string = 'default',
    autohide: boolean = true
  ) => ({
    type: types.SET_NOTIFICATION,
    visible: true,
    text,
    notificationType,
    autohide
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

            let entryForOpening: OpenedEntry = openedFiles.find(
              obj => obj.path === entryPath
            );

            if (!entryForOpening) {
              entryForOpening = findExtensionsForEntry(
                supportedFileTypes,
                entryPath,
                entryProps.isFile
              );
            }

            if (fsEntryMeta.changed !== undefined) {
              entryForOpening.changed = fsEntryMeta.changed;
            } /* else {
            entryForOpening.changed = true;
          } */
            if (fsEntryMeta.editMode !== undefined) {
              entryForOpening.editMode = fsEntryMeta.editMode;
            }
            entryForOpening.shouldReload = fsEntryMeta.shouldReload;
            if (fsEntryMeta.color) {
              entryForOpening.color = fsEntryMeta.color;
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
  openFsEntry: (fsEntry: FileSystemEntry) => (
    dispatch: (actions: Object) => void,
    getState: () => any
  ) => {
    let entryForOpening: OpenedEntry;
    const { openedFiles } = getState().app;
    /**
     * check for editMode in order to show save changes dialog (shouldReload: false)
     */
    if (openedFiles.length > 0) {
      const openFile = openedFiles[0];
      if (openFile.editMode && openFile.changed) {
        entryForOpening = { ...openFile, shouldReload: false };
        dispatch(actions.addToEntryContainer(entryForOpening));
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
    if (fsEntry.url) {
      entryForOpening.url = fsEntry.url;
    } else if (PlatformIO.haveObjectStoreSupport()) {
      entryForOpening.url = PlatformIO.getURLforPath(fsEntry.path);
    }
    if (fsEntry.perspective) {
      entryForOpening.perspective = fsEntry.perspective;
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
    const localePar = getURLParameter(fsEntry.path);
    let startPar = '?open=' + encodeURIComponent(fsEntry.path);
    if (localePar && localePar.length > 1) {
      startPar += '&locale=' + localePar;
    }
    // eslint-disable-next-line no-restricted-globals
    window.history.pushState('', 'TagSpaces', location.pathname + startPar);

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
    const nextFile = getNextFile(
      path,
      getState().app.lastSelectedEntry,
      getState().app.currentDirectoryEntries
    );
    if (nextFile !== undefined) {
      dispatch(actions.openFsEntry(nextFile));
      dispatch(actions.setLastSelectedEntry(nextFile.path));
      dispatch(actions.setSelectedEntries([nextFile]));
      return nextFile;
    }
  },
  openPrevFile: (path?: string) => (
    dispatch: (actions: Object) => void,
    getState: () => any
  ) => {
    const prevFile = getPrevFile(
      path,
      getState().app.lastSelectedEntry,
      getState().app.currentDirectoryEntries
    );
    if (prevFile !== undefined) {
      dispatch(actions.openFsEntry(prevFile));
      dispatch(actions.setLastSelectedEntry(prevFile.path));
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
  reflectCreateEntries: (fsEntries: Array<FileSystemEntry>) => (
    dispatch: (actions: Object) => void
  ) => {
    fsEntries.map(entry => dispatch(actions.reflectCreateEntryInt(entry))); // TODO remove map and set state once
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
  },
  updateCurrentDirEntry: (path: string, entry: Object) => ({
    type: types.UPDATE_CURRENTDIR_ENTRY,
    path,
    entry
  }),
  /**
   * @deprecated use updateCurrentDirEntry instead
   * @param path
   * @param entryMeta
   */
  /* reflectUpdateSidecarMeta: (path: string, entryMeta: Object) => (
    dispatch: (actions: Object) => void
  ) => {
    dispatch(actions.reflectUpdateSidecarMetaInt(path, entryMeta));
    dispatch(LocationIndexActions.reflectUpdateSidecarMeta(path, entryMeta));
  }, */
  /**
   * @deprecated use updateCurrentDirEntry instead
   * @param path
   * @param entryMeta
   */
  /* reflectUpdateSidecarMetaInt: (path: string, entryMeta: Object) => ({
    type: types.REFLECT_UPDATE_SIDECARMETA,
    path,
    entryMeta
  }), */
  reflectUpdateSidecarTags: (
    path: string,
    tags: Array<Tag>,
    updateIndex: boolean = true
  ) => (dispatch: (actions: Object) => void, getState: () => any) => {
    const { openedFiles } = getState().app;
    /**
     * if its have openedFiles updateCurrentDirEntry is called from FolderContainer (useEffect -> ... if (openedFile.changed)
     */
    if (openedFiles.length === 0) {
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
          getThumbFileLocationForFile(filePath, PlatformIO.getDirSeparator())
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
      .then(() => {
        console.info('File renamed ' + filePath + ' to ' + newFilePath);
        dispatch(
          actions.showNotification(
            i18n.t('core:renamingSuccessfully'),
            'default',
            true
          )
        );
        dispatch(actions.reflectRenameEntry(filePath, newFilePath));
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
            getThumbFileLocationForFile(filePath, PlatformIO.getDirSeparator()),
            getThumbFileLocationForFile(
              newFilePath,
              PlatformIO.getDirSeparator()
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
      }),
  openFileNatively: (selectedFile: string) => () => {
    PlatformIO.openFile(selectedFile);
  },
  openURLExternally: (url: string, addAppVersion: boolean = false) => () => {
    if (window.confirm('Do you really want to open this url: ' + url + ' ?')) {
      PlatformIO.openUrl(url);
    }
  },
  saveFile: () => () => {
    actions.showNotification(i18n.t('core:notImplementedYet'), 'warning', true);
  }
};

function prepareDirectoryContent(
  dirEntries,
  directoryPath,
  settings,
  dispatch,
  getState,
  dirEntryMeta
) {
  const currentLocation: Location = getLocation(
    getState(),
    getState().app.currentLocationId
  );
  const isCloudLocation = currentLocation.type === locationType.TYPE_CLOUD;

  const {
    directoryContent,
    tmbGenerationPromises,
    tmbGenerationList
  } = enhanceDirectoryContent(
    dirEntries,
    isCloudLocation,
    settings.showUnixHiddenEntries,
    settings.useGenerateThumbnails
  );

  function handleTmbGenerationResults(results) {
    // console.log('tmb results' + JSON.stringify(results));
    const tmbURLs = [];
    results.map(tmbResult => {
      if (tmbResult.tmbPath && tmbResult.tmbPath.length > 0) {
        // dispatch(actions.updateThumbnailUrl(tmbResult.filePath, tmbResult.tmbPath));
        tmbURLs.push(tmbResult);
      }
      return true;
    });
    dispatch(actions.setGeneratingThumbnails(false));
    // dispatch(actions.hideNotifications());
    if (tmbURLs.length > 0) {
      dispatch(actions.updateThumbnailUrls(tmbURLs));
    }
    return true;
  }

  function handleTmbGenerationFailed(error) {
    console.warn('Thumb generation failed: ' + error);
    dispatch(actions.setGeneratingThumbnails(false));
    dispatch(
      actions.showNotification(
        i18n.t('core:generatingThumbnailsFailed'),
        'warning',
        true
      )
    );
  }

  dispatch(actions.setGeneratingThumbnails(false));
  if (tmbGenerationList.length > 0) {
    dispatch(actions.setGeneratingThumbnails(true));
    PlatformIO.createThumbnailsInWorker(tmbGenerationList)
      .then(handleTmbGenerationResults)
      .catch(handleTmbGenerationFailed);
  }
  if (tmbGenerationPromises.length > 0) {
    dispatch(actions.setGeneratingThumbnails(true));
    Promise.all(tmbGenerationPromises)
      .then(handleTmbGenerationResults)
      .catch(handleTmbGenerationFailed);
  }

  console.log('Dir ' + directoryPath + ' contains ' + directoryContent.length);
  dispatch(
    actions.loadDirectorySuccess(directoryPath, directoryContent, dirEntryMeta)
  );
}

function findExtensionPathForId(extensionId: string): string {
  const extensionPath = 'node_modules/' + extensionId;
  return extensionPath;
}

function findExtensionsForEntry(
  supportedFileTypes: Array<any>,
  entryPath: string,
  isFile: boolean = true
): OpenedEntry {
  const fileExtension = extractFileExtension(
    entryPath,
    PlatformIO.getDirSeparator()
  ).toLowerCase();
  const viewingExtensionPath = isFile
    ? findExtensionPathForId('@tagspaces/text-viewer')
    : 'about:blank';
  const fileForOpening: OpenedEntry = {
    path: entryPath,
    viewingExtensionPath,
    viewingExtensionId: '',
    isFile,
    changed: false,
    lmdt: 0,
    size: 0
  };
  supportedFileTypes.map(fileType => {
    if (fileType.viewer && fileType.type.toLowerCase() === fileExtension) {
      fileForOpening.viewingExtensionId = fileType.viewer;
      /* if (fileType.color) {
        fileForOpening.color = fileType.color;
      } */
      fileForOpening.viewingExtensionPath = findExtensionPathForId(
        fileType.viewer
      );
      if (fileType.editor && fileType.editor.length > 0) {
        fileForOpening.editingExtensionId = fileType.editor;
        fileForOpening.editingExtensionPath = findExtensionPathForId(
          fileType.editor
        );
      }
    }
    return true;
  });
  return fileForOpening;
}

export function findAvailableExtensions() {
  // TODO Search in users tagspaces folder
  // Search in the installation folder
  const extensionsFound = [
    {
      extensionId: '@tagspaces/archive-viewer',
      extensionName: 'Archive Viewer',
      extensionType: 'viewer'
    },
    {
      extensionId: '@tagspaces/document-viewer',
      extensionName: 'Documents Viewer',
      extensionType: 'viewer'
    },
    // { extensionId: '@tagspaces/ebook-viewer', extensionName: 'EPUB Viewer', extensionType: 'viewer' },
    {
      extensionId: '@tagspaces/html-editor',
      extensionName: 'HTML Editor',
      extensionType: 'editor'
    },
    {
      extensionId: '@tagspaces/html-viewer',
      extensionName: 'HTML Viewer',
      extensionType: 'viewer'
    },
    {
      extensionId: '@tagspaces/image-viewer',
      extensionName: 'Image Viewer',
      extensionType: 'viewer'
    },
    {
      extensionId: '@tagspaces/json-editor',
      extensionName: 'JSON Viewer',
      extensionType: 'editor'
    },
    {
      extensionId: '@tagspaces/md-viewer',
      extensionName: 'MarkDown Viewer',
      extensionType: 'viewer'
    },
    {
      extensionId: '@tagspaces/media-player',
      extensionName: 'Media Player',
      extensionType: 'viewer'
    },
    {
      extensionId: '@tagspaces/mhtml-viewer',
      extensionName: 'MHTML Viewer',
      extensionType: 'viewer'
    },
    {
      extensionId: '@tagspaces/pdf-viewer',
      extensionName: 'PDF Viewer',
      extensionType: 'viewer'
    },
    {
      extensionId: '@tagspaces/plain-viewer',
      extensionName: 'Experimental Viewer - insecure!!!',
      extensionType: 'viewer'
    },
    {
      extensionId: '@tagspaces/rtf-viewer',
      extensionName: 'RTF Viewer',
      extensionType: 'viewer'
    },
    {
      extensionId: '@tagspaces/text-editor',
      extensionName: 'Text Editor',
      extensionType: 'editor'
    },
    {
      extensionId: '@tagspaces/text-viewer',
      extensionName: 'Text Viewer',
      extensionType: 'viewer'
    },
    {
      extensionId: '@tagspaces/url-viewer',
      extensionName: 'URL Viewer',
      extensionType: 'viewer'
    }
  ];
  return extensionsFound;
}

// Selectors
export const getDirectoryContent = (state: any) =>
  state.app.currentDirectoryEntries;
export const getCurrentDirectoryColor = (state: any) =>
  state.app.currentDirectoryColor;
export const getCurrentDirectoryPerspective = (state: any) =>
  state.app.currentDirectoryPerspective;
export const getDirectoryPath = (state: any) => state.app.currentDirectoryPath;
export const getProgress = (state: any) => state.app.progress;
export const getCurrentLocationPath = (state: any) => {
  let pathCurrentLocation;
  if (state.locations) {
    state.locations.map(location => {
      if (
        state.app.currentLocationId &&
        location.uuid === state.app.currentLocationId
      ) {
        if (AppConfig.isElectron && location.paths[0].startsWith('./')) {
          // TODO test relative path (Directory Back) with other platforms
          // relative paths
          pathCurrentLocation = pathLib.resolve(location.paths[0]);
        } else {
          pathCurrentLocation = location.paths[0];
        }
      }
      return true;
    });
  }
  return pathCurrentLocation;
};
export const isUpdateAvailable = (state: any) => state.app.isUpdateAvailable;
export const isUpdateInProgress = (state: any) => state.app.isUpdateInProgress;
export const isOnline = (state: any) => state.app.isOnline;
export const getLastSelectedEntry = (state: any) => state.app.lastSelectedEntry;
export const getSelectedTag = (state: any) => state.app.tag;
export const getSelectedEntries = (state: any) => state.app.selectedEntries;
// export const isFileOpened = (state: any) => state.app.openedFiles.length > 0;
export const isGeneratingThumbs = (state: any) => state.app.isGeneratingThumbs;
// export const isFileDragged = (state: any) => state.app.isFileDragged;
export const isReadOnlyMode = (state: any) => state.app.isReadOnlyMode;
export const isOnboardingDialogOpened = (state: any) =>
  state.app.onboardingDialogOpened;
export const isEditTagDialogOpened = (state: any) =>
  state.app.editTagDialogOpened;
export const isAboutDialogOpened = (state: any) => state.app.aboutDialogOpened;
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
export const isSelectDirectoryDialogOpened = (state: any) =>
  state.app.selectDirectoryDialogOpened;
export const isUploadDialogOpened = (state: any) =>
  state.app.uploadDialogOpened;
export const isProgressOpened = (state: any) => state.app.progressDialogOpened;
export const getOpenedFiles = (state: any) => state.app.openedFiles;
export const getNotificationStatus = (state: any) =>
  state.app.notificationStatus;
export const getSearchResultCount = (state: any) =>
  state.app.currentDirectoryEntries.length;
export const getCurrentLocationId = (state: any) => state.app.currentLocationId;
export const isEntryInFullWidth = (state: any) => state.app.isEntryInFullWidth;
export const isLoading = (state: any) => state.app.isLoading;
export const isLocationManagerPanelOpened = (state: any) =>
  state.app.locationManagerPanelOpened;
export const isTagLibraryPanelOpened = (state: any) =>
  state.app.tagLibraryPanelOpened;
export const isSearchPanelOpened = (state: any) => state.app.searchPanelOpened;
export const isPerspectivesPanelOpened = (state: any) =>
  state.app.perspectivesPanelOpened;
export const isHelpFeedbackPanelOpened = (state: any) =>
  state.app.helpFeedbackPanelOpened;
