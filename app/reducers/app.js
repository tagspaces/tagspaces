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
 * @flow
 */

import uuidv1 from 'uuid';
import { type Location, getLocation, locationType } from './locations';
import PlatformIO from '../services/platform-io';
import Search, { type SearchQuery } from '../services/search';
import AppConfig from '../config';
import {
  type FileSystemEntry,
  createDirectoryIndex,
  enhanceEntry,
  deleteFilesPromise,
  renameFilesPromise
} from '../services/utils-io';
import {
  extractFileExtension,
  extractDirectoryName,
  extractFileName,
  getMetaDirectoryPath,
  getMetaFileLocationForFile,
  getThumbFileLocationForFile,
  extractParentDirectoryPath,
  extractTagsAsObjects, normalizePath
} from '../utils/paths';
import { sortByCriteria, formatDateTime4Tag } from '../utils/misc';
import i18n from '../services/i18n';
import { Pro } from '../pro';
import { getThumbnailURLPromise } from '../services/thumbsgenerator';
// import { getTagDelimiter } from './settings';

export const types = {
  DEVICE_ONLINE: 'APP/DEVICE_ONLINE',
  DEVICE_OFFLINE: 'APP/DEVICE_OFFLINE',
  LOGIN_REQUEST: 'APP/LOGIN_REQUEST',
  LOGIN_SUCCESS: 'APP/LOGIN_SUCCESS',
  LOGIN_FAILURE: 'APP/LOGIN_FAILURE',
  LOGOUT: 'APP/LOGOUT',
  LOAD_DIRECTORY_SUCCESS: 'APP/LOAD_DIRECTORY_SUCCESS',
  LOAD_DIRECTORY_FAILURE: 'APP/LOAD_DIRECTORY_FAILURE',
  CLEAR_DIRECTORY_CONTENT: 'APP/CLEAR_DIRECTORY_CONTENT',
  INDEX_DIRECTORY: 'APP/INDEX_DIRECTORY',
  INDEX_DIRECTORY_CLEAR: 'APP/INDEX_DIRECTORY_CLEAR',
  INDEX_DIRECTORY_START: 'APP/INDEX_DIRECTORY_START',
  INDEX_DIRECTORY_CANCEL: 'APP/INDEX_DIRECTORY_CANCEL',
  INDEX_DIRECTORY_SUCCESS: 'APP/INDEX_DIRECTORY_SUCCESS',
  INDEX_DIRECTORY_FAILURE: 'APP/INDEX_DIRECTORY_FAILURE',
  INDEX_DIRECTORY_SEARCH: 'APP/INDEX_DIRECTORY_SEARCH',
  OPEN_FILE: 'APP/OPEN_FILE',
  TOGGLE_ENTRY_FULLWIDTH: 'APP/TOGGLE_ENTRY_FULLWIDTH',
  CLOSE_ALL_FILES: 'APP/CLOSE_ALL_FILES',
  UPDATE_THUMB_URL: 'APP/UPDATE_THUMB_URL',
  UPDATE_THUMB_URLS: 'APP/UPDATE_THUMB_URLS',
  SET_NOTIFICATION: 'APP/SET_NOTIFICATION',
  SET_NEW_VERSION_AVAILABLE: 'APP/SET_NEW_VERSION_AVAILABLE',
  SET_CURRENLOCATIONID: 'APP/SET_CURRENLOCATIONID',
  SET_LAST_SELECTED_ENTRY: 'APP/SET_LAST_SELECTED_ENTRY',
  SET_FILEDRAGGED: 'APP/SET_FILEDRAGGED',
  SET_READONLYMODE: 'APP/SET_READONLYMODE',
  RENAME_FILE: 'APP/RENAME_FILE',
  SORT_BY: 'APP/SORT_BY',
  TOGGLE_ABOUT_DIALOG: 'APP/TOGGLE_ABOUT_DIALOG',
  TOGGLE_KEYBOARD_DIALOG: 'APP/TOGGLE_KEYBOARD_DIALOG',
  TOGGLE_LICENSE_DIALOG: 'APP/TOGGLE_LICENSE_DIALOG',
  TOGGLE_THIRD_PARTY_LIBS_DIALOG: 'APP/TOGGLE_THIRD_PARTY_LIBS_DIALOG',
  TOGGLE_SETTINGS_DIALOG: 'APP/TOGGLE_SETTINGS_DIALOG',
  TOGGLE_CREATE_DIRECTORY_DIALOG: 'APP/TOGGLE_CREATE_DIRECTORY_DIALOG',
  TOGGLE_CREATE_FILE_DIALOG: 'APP/TOGGLE_CREATE_FILE_DIALOG',
  TOGGLE_SELECT_DIRECTORY_DIALOG: 'APP/TOGGLE_SELECT_DIRECTORY_DIALOG',
  REFLECT_DELETE_ENTRY: 'APP/REFLECT_DELETE_ENTRY',
  REFLECT_RENAME_ENTRY: 'APP/REFLECT_RENAME_ENTRY',
  REFLECT_CREATE_ENTRY: 'APP/REFLECT_CREATE_ENTRY',
  REFLECT_UPDATE_SIDECARTAGS: 'APP/REFLECT_UPDATE_SIDECARTAGS'
};

export const NotificationTypes = {
  default: 'default',
  error: 'error'
};

export type OpenedEntry = {
  path: string,
  url?: string,
  viewingExtensionPath: string,
  viewingExtensionId: string,
  editingExtensionPath?: string,
  editingExtensionId?: string,
  isFile?: boolean,
  color?: string,
  editMode?: boolean,
  changed?: boolean,
  shouldReload?: boolean,
  focused?: boolean, // TODO make it mandatory once support for multiple files is added
  tags?: Array<Tag>
};

export const initialState = {
  isLoading: false,
  error: null,
  loggedIn: false,
  isOnline: false,
  lastError: '',
  isUpdateInProgress: false,
  isUpdateAvailable: false,
  currentLocationId: null,
  currentDirectoryPath: '',
  currentDirectoryEntries: [],
  currentDirectoryIndex: [],
  isIndexing: false,
  isReadOnlyMode: false,
  searchResults: [],
  notificationStatus: {
    visible: false,
    text: 'Test',
    notificationType: '',
    autohide: false
  },
  openedFiles: [],
  // isFileDragged: false,
  aboutDialogOpened: false,
  keysDialogOpened: false,
  createFileDialogOpened: false,
  licenseDialogOpened: false,
  thirdPartyLibsDialogOpened: false,
  settingsDialogOpened: false,
  createDirectoryDialogOpened: false,
  selectDirectoryDialogOpened: false,
  lastSelectedEntry: null,
  isEntryInFullWidth: false
};

// The state described here will not be persisted
export default (state: Object = initialState, action: Object) => {
  switch (action.type) {
  case types.DEVICE_ONLINE: {
    return { ...state, isOnline: true, error: null };
  }
  case types.DEVICE_OFFLINE: {
    return { ...state, isOnline: false, error: null };
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
      currentDirectoryPath: action.directoryPath
    };
  }
  case types.CLEAR_DIRECTORY_CONTENT: {
    return {
      ...state,
      currentDirectoryEntries: [],
      currentDirectoryPath: ''
    };
  }
  case types.INDEX_DIRECTORY_START: {
    return {
      ...state,
      currentDirectoryIndex: [],
      isIndexing: true
    };
  }
  case types.INDEX_DIRECTORY_CLEAR: {
    return {
      ...state,
      currentDirectoryIndex: [],
      isIndexing: false
    };
  }
  case types.INDEX_DIRECTORY_CANCEL: {
    window.walkCanceled = true;
    return { ...state, isIndexing: false };
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
  case types.INDEX_DIRECTORY_SUCCESS: {
    // return state; // uncomment to disable index in redux
    return {
      ...state,
      currentDirectoryIndex: action.directoryIndex,
      isIndexing: false
    };
  }
  case types.INDEX_DIRECTORY_FAILURE: {
    return {
      ...state,
      lastError: action.error,
      currentDirectoryIndex: [],
      isIndexing: false
    };
  }
  case types.TOGGLE_ABOUT_DIALOG: {
    return { ...state, aboutDialogOpened: !state.aboutDialogOpened };
  }
  case types.TOGGLE_KEYBOARD_DIALOG: {
    return { ...state, keysDialogOpened: !state.keysDialogOpened };
  }
  case types.TOGGLE_CREATE_FILE_DIALOG: {
    return { ...state, createFileDialogOpened: !state.createFileDialogOpened };
  }
  case types.TOGGLE_LICENSE_DIALOG: {
    return { ...state, licenseDialogOpened: !state.licenseDialogOpened };
  }
  case types.TOGGLE_THIRD_PARTY_LIBS_DIALOG: {
    return { ...state, thirdPartyLibsDialogOpened: !state.thirdPartyLibsDialogOpened };
  }
  case types.TOGGLE_SETTINGS_DIALOG: {
    return { ...state, settingsDialogOpened: !state.settingsDialogOpened };
  }
  case types.TOGGLE_CREATE_DIRECTORY_DIALOG: {
    return { ...state, createDirectoryDialogOpened: !state.createDirectoryDialogOpened };
  }
  case types.TOGGLE_SELECT_DIRECTORY_DIALOG: {
    return { ...state, selectDirectoryDialogOpened: !state.selectDirectoryDialogOpened };
  }
  case types.SORT_BY: {
    const data = sortByCriteria(
      action.sort,
      state.currentDirectoryEntries,
      action.order
    );
    return {
      ...state,
      currentDirectoryEntries: data,
      isLoading: false
    };
  }
  /* case types.SET_FILEDRAGGED: {
    return { ...state, isFileDragged: action.isFileDragged };
  } */
  case types.INDEX_DIRECTORY_SEARCH: {
    return {
      ...state,
      currentDirectoryEntries: action.searchResults,
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
  case types.UPDATE_THUMB_URL: {
    const dirEntries = [...state.currentDirectoryEntries];
    dirEntries.map((entry) => {
      if (entry.path === action.filePath) {
        entry.thumbPath = action.thumbUrl;
      }
      return true;
    });
    return {
      ...state,
      currentDirectoryEntries: [
        ...dirEntries
      ]
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
      currentDirectoryEntries: [
        ...dirEntries
      ]
    };
  }
  case types.REFLECT_DELETE_ENTRY: {
    let indexForRemoving = -1;
    let indexForRemovingInIndex = -1;
    let indexForRenamingInOpenedFiles = -1;
    // Updating entries in the current directory
    let openedFiles = state.openedFiles;
    state.currentDirectoryEntries.forEach((entry, index) => {
      if (entry.path === action.path) {
        indexForRemoving = index;
        openedFiles = []; // TODO extend for multiple files
      }
    });
    state.currentDirectoryIndex.forEach((entry, index) => {
      if (entry.path === action.path) { // TODO handle directory case, delete contained files and dirs
        indexForRemovingInIndex = index;
      }
    });
    state.openedFiles.forEach((entry, index) => {
      if (entry.path === action.path) { // TODO handle directory case, update contained files and dirs too
        indexForRenamingInOpenedFiles = index;
      }
    });
    let directoryEntries = state.currentDirectoryEntries;
    let directoryIndex = state.currentDirectoryIndex;
    if (indexForRemoving >= 0) {
      directoryEntries = [
        ...state.currentDirectoryEntries.slice(0, indexForRemoving),
        ...state.currentDirectoryEntries.slice(indexForRemoving + 1)
      ];
    }
    if (indexForRemovingInIndex >= 0) {
      directoryIndex = [
        ...state.currentDirectoryIndex.slice(0, indexForRemovingInIndex),
        ...state.currentDirectoryIndex.slice(indexForRemovingInIndex + 1)
      ];
    }
    if (indexForRemovingInIndex >= 0 || indexForRemoving >= 0 || indexForRenamingInOpenedFiles >= 0) {
      return {
        ...state,
        currentDirectoryEntries: directoryEntries,
        currentDirectoryIndex: directoryIndex,
        openedFiles
      };
    }
    return state;
  }
  case types.REFLECT_CREATE_ENTRY: {
    const newEntry: FileSystemEntry = {
      uuid: uuidv1(),
      name: extractFileName(action.path),
      isFile: action.isFile,
      extension: extractFileExtension(action.path),
      description: '',
      tags: [],
      size: 0,
      lmdt: (new Date()).getTime(),
      path: action.path
    };
    let currentDirectoryEntries = state.currentDirectoryEntries;
    // TODO Case changed current directory
    if (state.currentDirectoryPath === action.path) {
      // Reindex ??
    }

    // Workarround for double update caused by the watcher
    let entryAlreadyAdded = false;
    state.currentDirectoryEntries.forEach((entry) => {
      if (entry.path === action.path) {
        entryAlreadyAdded = true;
      }
    });
    if (
      !entryAlreadyAdded &&
      extractParentDirectoryPath(action.path) === state.currentDirectoryPath
    ) {
      currentDirectoryEntries = [ // TODO evtl. apply sorting
        ...state.currentDirectoryEntries,
        newEntry
      ];
    }
    return {
      ...state,
      currentDirectoryEntries,
      currentDirectoryIndex: [
        newEntry,
        ...state.currentDirectoryIndex
      ],
    };
  }
  case types.REFLECT_RENAME_ENTRY: {
    let indexForRenaming = -1;
    let indexForRenamingInIndex = -1;
    let indexForRenamingInOpenedFiles = -1;
    // Updating entries in the current directory
    state.currentDirectoryEntries.forEach((entry, index) => {
      if (entry.path === action.path) {
        indexForRenaming = index;
      }
    });
    state.currentDirectoryIndex.forEach((entry, index) => {
      if (entry.path === action.path) { // TODO handle directory case, update contained files and dirs too
        indexForRenamingInIndex = index;
      }
    });
    state.openedFiles.forEach((entry, index) => {
      if (entry.path === action.path) { // TODO handle directory case, update contained files and dirs too
        indexForRenamingInOpenedFiles = index;
      }
    });
    let directoryEntries = state.currentDirectoryEntries;
    let directoryIndex = state.currentDirectoryIndex;
    let openedFiles = state.openedFiles;
    if (indexForRenaming >= 0) {
      const updateEntry = {
        ...state.currentDirectoryEntries[indexForRenaming],
        path: action.newPath,
        // thumbPath: getThumbFileLocationForFile(action.newPath), // not needed due timing issue
        name: extractFileName(action.newPath),
        extension: extractFileExtension(action.newPath),
        tags: [
          ...state.currentDirectoryEntries[indexForRenaming].tags.filter(tag => tag.type === 'sidecar'), // add only sidecar tags
          ...extractTagsAsObjects(action.newPath) // , getTagDelimiter(state))  TODO https://itnext.io/passing-state-between-reducers-in-redux-318de6db06cd
        ]
      };
      directoryEntries = [
        ...state.currentDirectoryEntries.slice(0, indexForRenaming),
        updateEntry,
        ...state.currentDirectoryEntries.slice(indexForRenaming + 1)
      ];
    }
    if (indexForRenamingInIndex >= 0) {
      const updateEntry = {
        ...state.currentDirectoryIndex[indexForRenamingInIndex],
        path: action.newPath, // TODO handle thumbPath
        thumbPath: getThumbFileLocationForFile(action.newPath),
        name: extractFileName(action.newPath),
        extension: extractFileExtension(action.newPath),
        tags: [
          ...state.currentDirectoryEntries[indexForRenaming].tags.filter(tag => tag.type === 'sidecar'), // add only sidecar tags
          ...extractTagsAsObjects(action.newPath) // , getTagDelimiter(state))
        ]
      };
      directoryIndex = [
        ...state.currentDirectoryIndex.slice(0, indexForRenamingInIndex),
        updateEntry,
        ...state.currentDirectoryIndex.slice(indexForRenamingInIndex + 1)
      ];
    }
    if (indexForRenamingInOpenedFiles >= 0) {
      const updateEntry = {
        ...state.openedFiles[indexForRenamingInOpenedFiles],
        path: action.newPath, // TODO handle change extension case
      };
      openedFiles = [
        ...state.openedFiles.slice(0, indexForRenamingInOpenedFiles),
        updateEntry,
        ...state.openedFiles.slice(indexForRenamingInOpenedFiles + 1)
      ];
    }
    if (indexForRenamingInIndex >= 0 || indexForRenaming >= 0 || indexForRenamingInOpenedFiles >= 0) {
      return {
        ...state,
        currentDirectoryEntries: directoryEntries,
        currentDirectoryIndex: directoryIndex,
        openedFiles
      };
    }
    return state;
  }
  case types.REFLECT_UPDATE_SIDECARTAGS: {
    let indexForUpdating = -1;
    let indexForUpdatingInIndex = -1;
    let indexForUpdatingInOpenedFiles = -1;
    // Updating entries in the current directory
    state.currentDirectoryEntries.forEach((entry, index) => {
      if (entry.path === action.path) {
        indexForUpdating = index;
      }
    });
    state.currentDirectoryIndex.forEach((entry, index) => {
      if (entry.path === action.path) {
        indexForUpdatingInIndex = index;
      }
    });
    state.openedFiles.forEach((entry, index) => {
      if (entry.path === action.path) {
        indexForUpdatingInOpenedFiles = index;
      }
    });
    let directoryEntries = state.currentDirectoryEntries;
    let directoryIndex = state.currentDirectoryIndex;
    let openedFiles = state.openedFiles;
    if (indexForUpdating >= 0) {
      const updateEntry = {
        ...state.currentDirectoryEntries[indexForUpdating],
        tags: [
          ...state.currentDirectoryEntries[indexForUpdating].tags.filter(tag => tag.type === 'plain'),
          ...action.tags
        ]
      };
      directoryEntries = [
        ...state.currentDirectoryEntries.slice(0, indexForUpdating),
        updateEntry,
        ...state.currentDirectoryEntries.slice(indexForUpdating + 1)
      ];
    }
    if (indexForUpdatingInIndex >= 0) {
      const updateEntry = {
        ...state.currentDirectoryIndex[indexForUpdatingInIndex],
        tags: [
          ...state.currentDirectoryIndex[indexForUpdatingInIndex].tags.filter(tag => tag.type === 'plain'),
          ...action.tags
        ]
      };
      directoryIndex = [
        ...state.currentDirectoryIndex.slice(0, indexForUpdatingInIndex),
        updateEntry,
        ...state.currentDirectoryIndex.slice(indexForUpdatingInIndex + 1)
      ];
    }
    if (indexForUpdatingInOpenedFiles >= 0) {
      const updateEntry = {
        ...state.openedFiles[indexForUpdatingInOpenedFiles],
        shouldReload: true,
      };
      openedFiles = [
        ...state.openedFiles.slice(0, indexForUpdatingInOpenedFiles),
        updateEntry,
        ...state.openedFiles.slice(indexForUpdatingInOpenedFiles + 1)
      ];
    }
    if (indexForUpdatingInIndex >= 0 || indexForUpdating >= 0 || indexForUpdatingInOpenedFiles >= 0) {
      return {
        ...state,
        currentDirectoryEntries: directoryEntries,
        currentDirectoryIndex: directoryIndex,
        openedFiles
      };
    }
    return state;
  }
  case types.CLOSE_ALL_FILES: {
    return {
      ...state,
      openedFiles: [],
      isEntryInFullWidth: false
    };
  }
  default: {
    return state;
  }
  }
};

export const actions = {
  goOnline: () => ({ type: types.DEVICE_ONLINE }),
  goOffline: () => ({ type: types.DEVICE_OFFLINE }),
  setUpdateAvailable: (isUpdateAvailable: boolean) => ({ type: types.SET_NEW_VERSION_AVAILABLE, isUpdateAvailable }),
  showCreateDirectoryDialog: () => (
    dispatch: (actions: Object) => void,
    getState: () => Object
  ) => {
    const { app } = getState();
    if (!app.currentDirectoryPath) {
      dispatch(
        actions.showNotification('Please first open a folder!', 'warning', true)
      );
    } else {
      dispatch(actions.toggleCreateDirectoryDialog());
    }
  },
  showCreateFileDialog: () => (
    dispatch: (actions: Object) => void,
    getState: () => Object
  ) => {
    const { app } = getState();
    if (!app.currentDirectoryPath) {
      dispatch(
        actions.showNotification('Please first open a folder!', 'warning', true)
      );
    } else {
      dispatch(actions.toggleCreateFileDialog());
    }
  },
  showSelectDirectoryDialog: () => (
    dispatch: (actions: Object) => void,
    getState: () => Object
  ) => {
    const { app } = getState();
    // if (!app.currentDirectoryPath) {
    //   dispatch(
    //     actions.showNotification('Please first open a folder!', 'warning', true)
    //   );
    // } else {
    dispatch(actions.toggleSelectDirectoryDialog());
    // }
  },
  toggleAboutDialog: () => ({ type: types.TOGGLE_ABOUT_DIALOG }),
  toggleKeysDialog: () => ({ type: types.TOGGLE_KEYBOARD_DIALOG }),
  toggleLicenseDialog: () => ({ type: types.TOGGLE_LICENSE_DIALOG }),
  toggleThirdPartyLibsDialog: () => ({ type: types.TOGGLE_THIRD_PARTY_LIBS_DIALOG }),
  toggleSettingsDialog: () => ({ type: types.TOGGLE_SETTINGS_DIALOG }),
  toggleCreateDirectoryDialog: () => ({ type: types.TOGGLE_CREATE_DIRECTORY_DIALOG }),
  toggleCreateFileDialog: () => ({ type: types.TOGGLE_CREATE_FILE_DIALOG }),
  toggleSelectDirectoryDialog: () => ({ type: types.TOGGLE_SELECT_DIRECTORY_DIALOG }),
  loadParentDirectoryContent: () => (
    dispatch: (actions: Object) => void,
    getState: () => Object
  ) => {
    const { app } = getState();
    if (app.currentDirectoryPath) {
      const parentDirectory = extractParentDirectoryPath(app.currentDirectoryPath);
      dispatch(actions.loadDirectoryContent(parentDirectory));
    } else {
      dispatch(actions.showNotification('Please first open a folder!', 'warning', true));
    }
  },
  loadDirectoryContent: (directoryPath: string) => (
    dispatch: (actions: Object) => void,
    getState: () => Object
  ) => {
    console.time('listDirectoryPromise');
    const { settings } = getState();
    window.walkCanceled = false;
    PlatformIO.listDirectoryPromise(directoryPath, false)
      .then(results => {
        const metaDirectory = getMetaDirectoryPath(directoryPath);
        PlatformIO.getPropertiesPromise(metaDirectory)
          .then(stats => {
            if (stats && !stats.isFile) {
              prepareDirectoryContent(
                results,
                directoryPath,
                settings,
                dispatch
              );
            } else {
              console.log(
                'Failed getting meta folder, creating it for: ' +
                  directoryPath
              );
              PlatformIO.createDirectoryPromise(metaDirectory)
                .then(() => {
                  prepareDirectoryContent(
                    results,
                    directoryPath,
                    settings,
                    dispatch
                  );
                  return true;
                })
                .catch(() => {
                  console.warn(
                    'Failed creating meta folder for ' + directoryPath
                  );
                  prepareDirectoryContent(
                    results,
                    directoryPath,
                    settings,
                    dispatch
                  );
                });
            }
            return true;
          })
          .catch(() => {
            console.log(
              'Failed getting meta folder, creating it for: ' + directoryPath
            );
            PlatformIO.createDirectoryPromise(metaDirectory)
              .then(() => {
                prepareDirectoryContent(
                  results,
                  directoryPath,
                  settings,
                  dispatch
                );
                return true;
              })
              .catch(() => {
                console.warn(
                  'Failed creating meta folder for ' + directoryPath
                );
                prepareDirectoryContent(
                  results,
                  directoryPath,
                  settings,
                  dispatch
                );
              });
          });
        return true;
      })
      .catch(error => {
        console.timeEnd('listDirectoryPromise');
        dispatch(actions.loadDirectoryFailure(error)); // Currently this is never called, due the promise alwasy resolvse
      });
  },
  loadDirectorySuccess: (
    directoryPath: string,
    directoryContent: Array<Object>
  ) => ({
    type: types.LOAD_DIRECTORY_SUCCESS,
    directoryPath,
    directoryContent
  }),
  loadDirectoryFailure: (directoryPath: string, error: any) => (
    dispatch: (actions: Object) => void
  ) => {
    console.warn('Error loading directory: ' + error);
    dispatch(
      actions.showNotification('Error loading directory', 'warning', true)
    );
    dispatch(actions.loadDirectorySuccess(directoryPath, []));
  },
  updateThumbnailUrl: (filePath: string, thumbUrl: string) => ({
    type: types.UPDATE_THUMB_URL,
    filePath,
    thumbUrl
  }),
  updateThumbnailUrls: (tmbURLs: Array<any>) => ({
    type: types.UPDATE_THUMB_URLS,
    tmbURLs
  }),
  setLastSelectedEntry: (entryPath: string | null) => ({
    type: types.SET_LAST_SELECTED_ENTRY,
    entryPath
  }),
  deleteDirectory: (directoryPath: string) => (
    dispatch: (actions: Object) => void,
    getState: () => Object
  ) => {
    const { settings } = getState();
    PlatformIO.deleteDirectoryPromise(directoryPath, settings.useTrashCan)
      .then(() => {
        dispatch(actions.reflectDeleteEntry(directoryPath));
        dispatch(
          actions.showNotification(
            i18n.t('deletingDirectorySuccessfull', {
              dirPath: extractDirectoryName(directoryPath)
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
              dirPath: extractDirectoryName(directoryPath)
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
  renameDirectory: (directoryPath: string, newDirectoryName: string) => (
    dispatch: (actions: Object) => void
  ) => {
    PlatformIO.renameDirectoryPromise(directoryPath, newDirectoryName)
      .then((newDirPath) => {
        dispatch(actions.reflectRenameEntry(directoryPath, newDirPath));
        dispatch(
          actions.showNotification(
            `Renaming directory ${extractDirectoryName(
              directoryPath
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
            `Error renaming directory '${extractDirectoryName(directoryPath)}'`,
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
      .then(() => {
        console.log(`Creating directory ${directoryPath} successful.`);
        dispatch(actions.reflectCreateEntry(directoryPath, false));
        dispatch(
          actions.showNotification(
            `Creating directory ${extractDirectoryName(
              directoryPath
            )} successful.`, 'default', true
          )
        );
        return true;
      })
      .catch(error => {
        console.warn('Error creating directory: ' + error);
        dispatch(
          actions.showNotification(
            `Error creating directory '${extractDirectoryName(directoryPath)}'`,
            'error',
            true
          )
        );
        // dispatch stopLoadingAnimation
      });
  },
  createFile: () => (
    dispatch: (actions: Object) => void,
    getState: () => Object
  ) => {
    const { app } = getState();
    if (app.currentDirectoryPath) {
      const filePath = app.currentDirectoryPath + AppConfig.dirSeparator + 'textfile' + AppConfig.beginTagContainer + formatDateTime4Tag(new Date(), true) + AppConfig.endTagContainer + '.txt';
      PlatformIO.saveFilePromise(filePath, '', true).then(() => {
        dispatch(actions.reflectCreateEntry(filePath, true));
        dispatch(actions.showNotification('File create successfully', 'info', true));
        dispatch(actions.openFile(filePath));
        // TODO select file // dispatch(actions.setLastSelectedEntry(filePath));
        return true;
      }).catch((err) => {
        console.warn('File creation failed with ' + err);
        dispatch(actions.showNotification('Error creating file', 'warning', true));
      });
    } else {
      dispatch(actions.showNotification('Please first open a folder!', 'warning', true));
    }
  },
  createFileAdvanced: (targetPath: string, fileName: string, content: string, fileType: 'md' | 'txt' | 'html') => (
    dispatch: (actions: Object) => void,
    getState: () => Object
  ) => {
    const fileNameAndExt = fileName + '.' + fileType;
    const filePath = normalizePath(targetPath) + AppConfig.dirSeparator + fileNameAndExt;
    let fileContent = content;
    if (fileType === 'html') {
      const newHTMLFileContent = getState().settings.newHTMLFileContent;
      fileContent = newHTMLFileContent.split('<body></body>')[0] + '<body>' + content + '</body>' + newHTMLFileContent.split('<body></body>')[1];
    }
    PlatformIO.saveFilePromise(filePath, fileContent, true)
      .then(() => {
        dispatch(actions.reflectCreateEntry(filePath, true));
        dispatch(actions.openFile(filePath));
        dispatch(actions.setLastSelectedEntry(filePath));
        dispatch(
          actions.showNotification(
            `File '${fileNameAndExt}' created.`, 'default', true
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
  startDirectoryIndexing: () => ({ type: types.INDEX_DIRECTORY_START }),
  cancelDirectoryIndexing: () => ({ type: types.INDEX_DIRECTORY_CANCEL }),
  searchLocationIndexFinished: (searchResults: Array<Object> | []) => ({
    type: types.INDEX_DIRECTORY_SEARCH,
    searchResults
  }),
  searchLocationIndex: (searchQuery: SearchQuery) => (
    dispatch: (actions: Object) => void,
    getState: () => Object
  ) => {
    dispatch(actions.showNotification('Searching...', 'default', false));
    setTimeout(() => { // Workarround used to show the start search notication
      Search.searchLocationIndex(
        getState().app.currentDirectoryIndex,
        searchQuery
      ).then((searchResults) => {
        dispatch(actions.searchLocationIndexFinished(searchResults));
        dispatch(actions.hideNotifications());
        return true;
      }).catch(() => {
        dispatch(actions.searchLocationIndexFinished([]));
        dispatch(actions.hideNotifications());
        dispatch(actions.showNotification('Search failed.', 'warning', true));
      });
    }, 50);
  },
  setCurrentLocationId: (locationId: string | null) => ({
    type: types.SET_CURRENLOCATIONID,
    locationId
  }),
  openLocation: (locationId: string) => (
    dispatch: (actions: Object) => void,
    getState: () => Object
  ) => {
    const locations: Array<Location> = getState().locations;
    const currentLocationId = getState().app;
    if (Pro && Pro.Watcher) {
      Pro.Watcher.stopWatching();
    }

    locations.map(location => {
      if (location.uuid === locationId) {
        if (location.type === locationType.TYPE_CLOUD) {
          PlatformIO.enableObjectStoreSupport(location).then(() => {
            dispatch(actions.showNotification('Connected to object store', 'default', true));
            dispatch(actions.setReadOnlyMode(location.isReadOnly || false));
            dispatch(actions.setCurrentLocationId(location.uuid));
            dispatch(actions.loadDirectoryContent(location.paths[0]));
            if (locationId !== currentLocationId) {
              dispatch(actions.createDirectoryIndex(location.paths[0]));
            }
            return true;
          }).catch(() => {
            dispatch(actions.showNotification('Connection to object store failed!', 'warning', true));
            PlatformIO.disableObjectStoreSupport();
          });
        } else { // if (location.type === locationType.TYPE_LOCAL) {
          PlatformIO.disableObjectStoreSupport();
          dispatch(actions.setReadOnlyMode(location.isReadOnly || false));
          dispatch(actions.setCurrentLocationId(location.uuid));
          dispatch(actions.loadDirectoryContent(location.paths[0]));
          if (locationId !== currentLocationId) {
            dispatch(actions.createDirectoryIndex(location.paths[0]));
          }
          if (Pro && Pro.Watcher && location.watchForChanges) {
            Pro.Watcher.watchFolder(location.paths[0], dispatch, actions);
          }
        }
      }
      return true;
    });
  },
  closeLocation: (locationId: string) => (
    dispatch: (actions: Object) => void,
    getState: () => Object
  ) => {
    const locations: Array<Location> = getState().locations;
    const { currentLocationId } = getState().app;
    if (currentLocationId === locationId) {
      locations.map(location => {
        if (location.uuid === locationId) {
          // location needed evtl. to unwatch many loc. root folders if available
          dispatch(actions.setCurrentLocationId(null));
          dispatch(actions.clearDirectoryContent());
          dispatch(actions.clearDirectoryIndex());
          if (Pro && Pro.Watcher) {
            Pro.Watcher.stopWatching();
          }
        }
        return true;
      });
    }
  },
  createDirectoryIndex: (directoryPath: string) => (
    dispatch: (actions: Object) => void,
    getState: () => Object
  ) => {
    const state = getState();
    const currentLocation: Location = getLocation(state, state.app.currentLocationId);
    dispatch(actions.startDirectoryIndexing());
    createDirectoryIndex(directoryPath)
      .then(directoryIndex => {
        dispatch(actions.indexDirectorySuccess(directoryIndex));
        if (Pro && currentLocation.persistIndex) {
          Pro.Indexer.persistIndex(directoryPath, directoryIndex);
        }
        return true;
      })
      .catch(err => {
        dispatch(actions.indexDirectoryFailure(err));
        // dispatch(actions.startDirectoryIndexing());
      });
  },
  clearDirectoryIndex: () => ({
    type: types.INDEX_DIRECTORY_CLEAR
  }),
  clearDirectoryContent: () => ({
    type: types.CLEAR_DIRECTORY_CONTENT
  }),
  indexDirectorySuccess: (directoryIndex: Array<Object>) => ({
    type: types.INDEX_DIRECTORY_SUCCESS,
    directoryIndex
  }),
  indexDirectoryFailure: (error: string) => ({
    type: types.INDEX_DIRECTORY_FAILURE,
    error
  }),
  showNotification: (
    text: string,
    notificationType?: string = 'default',
    autohide?: boolean = true
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
  openFile: (entryPath: string, isFile?: boolean = true) => (
    dispatch: (actions: Object) => void,
    getState: () => Object
  ) => {
    const supportedFileTypes: Array<Object> = getState().settings
      .supportedFileTypes;
    const entryForOpening: OpenedEntry = findExtensionsForEntry(
      supportedFileTypes,
      entryPath,
      isFile
    );
    entryForOpening.url = PlatformIO.getURLforPath(entryPath); // Needed for the s3 support
    dispatch(actions.addToEntryContainer(entryForOpening));
  },
  toggleEntryFullWidth: () => ({
    type: types.TOGGLE_ENTRY_FULLWIDTH
  }),
  getNextFile: (pivotFilePath?: string) => (
    dispatch: (actions: Object) => void,
    getState: () => Object
  ) => {
    const currentEntries = getState().app.currentDirectoryEntries;
    const lastSelectedEntry = getState().app.lastSelectedEntry;
    let filePath = pivotFilePath;
    if (!filePath) {
      if (lastSelectedEntry) {
        filePath = lastSelectedEntry;
      } else if (currentEntries.length > 0) {
        filePath = currentEntries[0].path;
      } else {
        return false;
      }
    }
    let nextFilePath;
    currentEntries.forEach((entry, index) => {
      if (entry.path === filePath) {
        const nextIndex = index + 1;
        if (nextIndex < currentEntries.length) {
          nextFilePath = currentEntries[nextIndex].path;
        } else {
          nextFilePath = currentEntries[0].path;
        }
      }
    });
    return nextFilePath;
  },
  getPrevFile: (pivotFilePath?: string) => (
    dispatch: (actions: Object) => void,
    getState: () => Object
  ) => {
    const currentEntries = getState().app.currentDirectoryEntries;
    const lastSelectedEntry = getState().app.lastSelectedEntry;
    let filePath = pivotFilePath;
    if (!filePath) {
      if (lastSelectedEntry) {
        filePath = lastSelectedEntry;
      } else if (currentEntries.length > 0) {
        filePath = currentEntries[0].path;
      } else {
        return false;
      }
    }
    let prevFilePath;
    currentEntries.forEach((entry, index) => {
      if (entry.path === filePath) {
        const prevIndex = index - 1;
        if (prevIndex >= 0) {
          prevFilePath = currentEntries[prevIndex].path;
        } else {
          prevFilePath = currentEntries[currentEntries.length - 1].path;
        }
      }
    });
    return prevFilePath;
  },
  sortByCriteria: (sort: string, order: boolean) => ({
    type: types.SORT_BY,
    sort,
    order
  }),
  closeAllFiles: () => ({ type: types.CLOSE_ALL_FILES }),
  reflectDeleteEntry: (path: string) => ({
    type: types.REFLECT_DELETE_ENTRY,
    path
  }),
  reflectCreateEntry: (path: string, isFile: boolean) => ({
    type: types.REFLECT_CREATE_ENTRY,
    path,
    isFile
  }),
  reflectRenameEntry: (path: string, newPath: string) => ({
    type: types.REFLECT_RENAME_ENTRY,
    path,
    newPath
  }),
  reflectUpdateSidecarTags: (path: string, tags: Array<Tags>) => ({
    type: types.REFLECT_UPDATE_SIDECARTAGS,
    path,
    tags
  }),
  deleteFile: (filePath: string) => (
    dispatch: (actions: Object) => void,
    getState: () => Object
  ) => {
    const { settings } = getState();
    PlatformIO.deleteFilePromise(filePath, settings.useTrashCan)
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
          getMetaFileLocationForFile(filePath),
          getThumbFileLocationForFile(filePath),
        ]).then(() => {
          console.log('Cleaning meta file and thumb successful for ' + filePath);
          return true;
        }).catch((err) => {
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
  ) => {
    PlatformIO.renameFilePromise(filePath, newFilePath)
      .then(() => {
        // console.log('File renamed ' + filePath + ' to ' + newFilePath);
        dispatch(actions.reflectRenameEntry(filePath, newFilePath));
        // UI notification
        dispatch(
          actions.showNotification(
            'Renaming successfully.',
            'default',
            true
          )
        );
        // Update sidecar file and thumb
        renameFilesPromise([
          [getMetaFileLocationForFile(filePath), getMetaFileLocationForFile(newFilePath)],
          [getThumbFileLocationForFile(filePath), getThumbFileLocationForFile(newFilePath)]
        ]).then(() => {
          console.log('Renaming meta file and thumb successful for ' + filePath);
          return true;
        }).catch((err) => {
          console.warn('Renaming meta file and thumb failed with ' + err);
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
      });
  },
  openFileNatively: (selectedFile: string) => () => {
    PlatformIO.openFile(selectedFile);
  },
  saveFile: () => (
    dispatch: (actions: Object) => void,
    getState: () => Object
  ) => {
    actions.showNotification('Not implemented yet, please use the save button.', 'warning', true);
    // const { app } = getState();
    /* PlatformIO.saveFilePromise(filePath, content, true).then((isNewFile) => {
      console.log(isNewFile);
      dispatch(
        actions.showNotification('File created successfully.', 'successfully', true)
      );
      return true;
    }).catch((error) => {
      console.log('Creating the ' + filePath + ' failed ' + error);
      console.warn('Creating file failed ' + error);
      dispatch(
        actions.showNotification('Creating ' + filePath + ' failed.', 'warning', true)
      );
      return true;
    }); */
  }
};

function prepareDirectoryContent(
  dirEntries,
  directoryPath,
  settings,
  dispatch
) {
  const directoryContent = [];
  const tmbGenerationPromises = [];
  const tmbGenerationList = [];
  const isWorkerAvailable = PlatformIO.isWorkerAvailable();
  dirEntries.map(entry => {
    if (
      !settings.showUnixHiddenEntries &&
      entry.name === AppConfig.metaFolder
    ) {
      return true;
    }
    const enhancedEntry = enhanceEntry(entry);
    directoryContent.push(enhancedEntry);
    if ( // Enable thumb generation by
      !AppConfig.isWeb && // not in webdav mode
      !PlatformIO.haveObjectStoreSupport() && // not in object store mode
      enhancedEntry.isFile && // only for files
      settings.useGenerateThumbnails // enabled in the settings
    ) {
      if (isWorkerAvailable) {
        tmbGenerationList.push(enhancedEntry.path);
      } else {
        tmbGenerationPromises.push(getThumbnailURLPromise(enhancedEntry.path));
      }
    }
    return true;
  });

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
    dispatch(actions.hideNotifications());
    if (tmbURLs.length > 0) {
      dispatch(actions.updateThumbnailUrls(tmbURLs));
    }
    return true;
  }

  function handleTmbGenerationFailed(error) {
    console.warn('Thumb generation failed: ' + error);
    dispatch(actions.showNotification('Generating thumbnails failed', 'warning', true));
  }

  if (tmbGenerationPromises.length > 0) {
    dispatch(actions.showNotification('Checking thumbnails', 'info', false));
    Promise.all(tmbGenerationPromises)
      .then(handleTmbGenerationResults)
      .catch(handleTmbGenerationFailed);
  }

  if (tmbGenerationList.length > 0) {
    dispatch(actions.showNotification('Checking thumbnails', 'info', false));
    PlatformIO.createThumbnailsInWorker(tmbGenerationList)
      .then(handleTmbGenerationResults)
      .catch(handleTmbGenerationFailed);
  }

  // directoryContent.sort((a, b) => (a.name < b.name ? -1 : 1));
  // TODO check if here the right place for sorting
  sortByCriteria('byName', directoryContent, true); // ability to sort by metadata criteria
  console.log('Dir ' + directoryPath + ' contains ' + directoryContent.length);
  console.timeEnd('listDirectoryPromise');
  dispatch(actions.loadDirectorySuccess(directoryPath, directoryContent));
}

function findExtensionPathForId(extensionId: string): string {
  const extensionPath = 'node_modules/' + extensionId;
  return extensionPath;
}

function findExtensionsForEntry(
  supportedFileTypes: Array<Object>,
  entryPath: string,
  isFile: boolean = true
): OpenedEntry {
  const fileExtension = extractFileExtension(entryPath).toLowerCase();
  const viewingExtensionPath = isFile ? findExtensionPathForId('@tagspaces/text-viewer') : 'about:blank';
  const fileForOpening: OpenedEntry = {
    path: entryPath,
    viewingExtensionPath,
    viewingExtensionId: '',
    isFile,
    changed: false
  };
  supportedFileTypes.map(fileType => {
    if (fileType.viewer && fileType.type.toLowerCase() === fileExtension) {
      fileForOpening.viewingExtensionId = fileType.viewer;
      if (fileType.color) {
        fileForOpening.color = fileType.color;
      }
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
    { extensionId: '@tagspaces/archive-viewer', extensionName: 'Archive Viewer', extensionType: 'viewer' },
    { extensionId: '@tagspaces/document-viewer', extensionName: 'Documents Viewer', extensionType: 'viewer' },
    // { extensionId: '@tagspaces/ebook-viewer', extensionName: 'EPUB Viewer', extensionType: 'viewer' },
    { extensionId: '@tagspaces/html-editor', extensionName: 'HTML Editor', extensionType: 'editor' },
    { extensionId: '@tagspaces/html-viewer', extensionName: 'HTML Viewer', extensionType: 'viewer' },
    { extensionId: '@tagspaces/image-viewer', extensionName: 'Image Viewer', extensionType: 'viewer' },
    { extensionId: '@tagspaces/json-editor', extensionName: 'JSON Viewer', extensionType: 'editor' },
    { extensionId: '@tagspaces/md-viewer', extensionName: 'MarkDown Viewer', extensionType: 'viewer' },
    { extensionId: '@tagspaces/media-player', extensionName: 'Media Player', extensionType: 'viewer' },
    { extensionId: '@tagspaces/mhtml-viewer', extensionName: 'MHTML Viewer', extensionType: 'viewer' },
    { extensionId: '@tagspaces/pdf-viewer', extensionName: 'PDF Viewer', extensionType: 'viewer' },
    { extensionId: '@tagspaces/plain-viewer', extensionName: 'Simple Viewer', extensionType: 'viewer' },
    { extensionId: '@tagspaces/rtf-viewer', extensionName: 'RTF Viewer', extensionType: 'viewer' },
    { extensionId: '@tagspaces/text-editor', extensionName: 'Text Editor', extensionType: 'editor' },
    { extensionId: '@tagspaces/text-viewer', extensionName: 'Text Viewer', extensionType: 'viewer' },
    { extensionId: '@tagspaces/url-viewer', extensionName: 'URL Viewer', extensionType: 'viewer' },
  ];
  return extensionsFound;
}

// Selectors
export const getDirectoryContent = (state: Object) =>
  state.app.currentDirectoryEntries;
export const getDirectoryPath = (state: Object) =>
  state.app.currentDirectoryPath;
export const isUpdateAvailable = (state: Object) => state.app.isUpdateAvailable;
export const isUpdateInProgress = (state: Object) =>
  state.app.isUpdateInProgress;
export const isOnline = (state: Object) => state.app.isOnline;
export const getLastSelectedEntry = (state: Object) => state.app.lastSelectedEntry;
export const isFileOpened = (state: Object) => state.app.openedFiles.length > 0;
// export const isFileDragged = (state: Object) => state.app.isFileDragged;
export const isReadOnlyMode = (state: Object) => state.app.isReadOnlyMode;
export const isAboutDialogOpened = (state: Object) => state.app.aboutDialogOpened;
export const isKeysDialogOpened = (state: Object) => state.app.keysDialogOpened;
export const isLicenseDialogOpened = (state: Object) => state.app.licenseDialogOpened;
export const isThirdPartyLibsDialogOpened = (state: Object) => state.app.thirdPartyLibsDialogOpened;
export const isSettingsDialogOpened = (state: Object) => state.app.settingsDialogOpened;
export const isCreateDirectoryOpened = (state: Object) => state.app.createDirectoryDialogOpened;
export const isCreateFileDialogOpened = (state: Object) => state.app.createFileDialogOpened;
export const isSelectDirectoryDialogOpened = (state: Object) => state.app.selectDirectoryDialogOpened;
export const getOpenedFiles = (state: Object) => state.app.openedFiles;
export const getNotificationStatus = (state: Object) => state.app.notificationStatus;
export const getSearchResults = (state: Object) => state.app.currentDirectoryEntries;
export const getSearchResultCount = (state: Object) => state.app.currentDirectoryEntries.length;
export const getCurrentLocationId = (state: Object) => state.app.currentLocationId;
export const getIndexedEntriesCount = (state: Object) => state.app.currentDirectoryIndex.length;
export const isEntryInFullWidth = (state: Object) => state.app.isEntryInFullWidth;
export const isIndexing = (state: Object) => state.app.isIndexing;
