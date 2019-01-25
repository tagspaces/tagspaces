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
import { type Location, locationType } from './locations';
import PlatformIO from '../services/platform-io';
import AppConfig from '../config';
import {
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
import { formatDateTime4Tag } from '../utils/misc';
import i18n from '../services/i18n';
import { Pro } from '../pro';
import { getThumbnailURLPromise } from '../services/thumbsgenerator';
import { actions as LocationIndexActions } from './location-index';

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
  INDEX_DIRECTORY_SEARCH: 'APP/INDEX_DIRECTORY_SEARCH',
  OPEN_FILE: 'APP/OPEN_FILE',
  TOGGLE_ENTRY_FULLWIDTH: 'APP/TOGGLE_ENTRY_FULLWIDTH',
  CLOSE_ALL_FILES: 'APP/CLOSE_ALL_FILES',
  UPDATE_THUMB_URL: 'APP/UPDATE_THUMB_URL',
  UPDATE_THUMB_URLS: 'APP/UPDATE_THUMB_URLS',
  SET_NOTIFICATION: 'APP/SET_NOTIFICATION',
  SET_GENERATING_THUMBNAILS: 'APP/SET_GENERATING_THUMBNAILS',
  SET_NEW_VERSION_AVAILABLE: 'APP/SET_NEW_VERSION_AVAILABLE',
  SET_CURRENLOCATIONID: 'APP/SET_CURRENLOCATIONID',
  SET_LAST_SELECTED_ENTRY: 'APP/SET_LAST_SELECTED_ENTRY',
  SET_FILEDRAGGED: 'APP/SET_FILEDRAGGED',
  SET_READONLYMODE: 'APP/SET_READONLYMODE',
  RENAME_FILE: 'APP/RENAME_FILE',
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
  REFLECT_UPDATE_SIDECARTAGS: 'APP/REFLECT_UPDATE_SIDECARTAGS',
  REFLECT_UPDATE_SIDECARMETA: 'APP/REFLECT_UPDATE_SIDECARMETA'
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
  isEntryInFullWidth: false,
  isGeneratingThumbs: false
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
      currentDirectoryPath: action.directoryPath,
      isLoading: false
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
    let indexForRenamingInOpenedFiles = -1;
    // Updating entries in the current directory
    let openedFiles = state.openedFiles;
    state.currentDirectoryEntries.forEach((entry, index) => {
      if (entry.path === action.path) {
        indexForRemoving = index;
        openedFiles = []; // TODO extend for multiple files
      }
    });
    state.openedFiles.forEach((entry, index) => {
      if (entry.path === action.path) { // TODO handle directory case, update contained files and dirs too
        indexForRenamingInOpenedFiles = index;
      }
    });
    let directoryEntries = state.currentDirectoryEntries;
    if (indexForRemoving >= 0) {
      directoryEntries = [
        ...state.currentDirectoryEntries.slice(0, indexForRemoving),
        ...state.currentDirectoryEntries.slice(indexForRemoving + 1)
      ];
    }
    if (indexForRemoving >= 0 || indexForRenamingInOpenedFiles >= 0) {
      return {
        ...state,
        currentDirectoryEntries: directoryEntries,
        openedFiles
      };
    }
    return state;
  }
  case types.REFLECT_CREATE_ENTRY: {
    let currentDirectoryEntries = state.currentDirectoryEntries;
    // TODO Case changed current directory
    if (state.currentDirectoryPath === action.newEntry.path) {
      // Reindex ??
    }

    // Workarround for double update caused by the watcher
    let entryAlreadyAdded = false;
    state.currentDirectoryEntries.forEach((entry) => {
      if (entry.path === action.newEntry.path) {
        entryAlreadyAdded = true;
      }
    });
    if (
      !entryAlreadyAdded &&
      extractParentDirectoryPath(action.newEntry.path).replace(/(^\/)|(\/$)/g, '') === state.currentDirectoryPath.replace(/(^\/)|(\/$)/g, '')
    ) {
      currentDirectoryEntries = [ // TODO evtl. apply sorting
        ...state.currentDirectoryEntries,
        action.newEntry
      ];
    }
    return {
      ...state,
      currentDirectoryEntries
    };
  }
  case types.REFLECT_RENAME_ENTRY: {
    let indexForRenaming = -1;
    let indexForRenamingInOpenedFiles = -1;
    // Updating entries in the current directory
    state.currentDirectoryEntries.forEach((entry, index) => {
      if (entry.path === action.path) {
        indexForRenaming = index;
      }
    });
    state.openedFiles.forEach((entry, index) => {
      if (entry.path === action.path) { // TODO handle directory case, update contained files and dirs too
        indexForRenamingInOpenedFiles = index;
      }
    });
    let directoryEntries = state.currentDirectoryEntries;
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
    if (indexForRenaming >= 0 || indexForRenamingInOpenedFiles >= 0) {
      return {
        ...state,
        currentDirectoryEntries: directoryEntries,
        openedFiles
      };
    }
    return state;
  }
  case types.REFLECT_UPDATE_SIDECARTAGS: {
    let indexForUpdating = -1;
    let indexForUpdatingInOpenedFiles = -1;
    // Updating entries in the current directory
    state.currentDirectoryEntries.forEach((entry, index) => {
      if (entry.path === action.path) {
        indexForUpdating = index;
      }
    });
    state.openedFiles.forEach((entry, index) => {
      if (entry.path === action.path) {
        indexForUpdatingInOpenedFiles = index;
      }
    });
    let directoryEntries = state.currentDirectoryEntries;
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
    if (indexForUpdating >= 0 || indexForUpdatingInOpenedFiles >= 0) {
      return {
        ...state,
        currentDirectoryEntries: directoryEntries,
        openedFiles
      };
    }
    return state;
  }
  case types.REFLECT_UPDATE_SIDECARMETA: {
    let indexForUpdating = -1;
    let indexForUpdatingInOpenedFiles = -1;
    // Updating entries in the current directory
    state.currentDirectoryEntries.forEach((entry, index) => {
      if (entry.path === action.path) {
        indexForUpdating = index;
      }
    });
    state.openedFiles.forEach((entry, index) => {
      if (entry.path === action.path) {
        indexForUpdatingInOpenedFiles = index;
      }
    });
    let directoryEntries = state.currentDirectoryEntries;
    let openedFiles = state.openedFiles;
    if (indexForUpdating >= 0) {
      const updateEntry = {
        ...state.currentDirectoryEntries[indexForUpdating],
        description: action.entryMeta.description
      };
      directoryEntries = [
        ...state.currentDirectoryEntries.slice(0, indexForUpdating),
        updateEntry,
        ...state.currentDirectoryEntries.slice(indexForUpdating + 1)
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
    if (indexForUpdating >= 0 || indexForUpdatingInOpenedFiles >= 0) {
      return {
        ...state,
        currentDirectoryEntries: directoryEntries,
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
        actions.showNotification(i18n.t('core:firstOpenaFolder'), 'warning', true)
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
        actions.showNotification(i18n.t('core:firstOpenaFolder'), 'warning', true)
      );
    } else {
      dispatch(actions.toggleCreateFileDialog());
    }
  },
  showSelectDirectoryDialog: () => (
    dispatch: (actions: Object) => void,
  ) => {
    dispatch(actions.toggleSelectDirectoryDialog());
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
    const state = getState();
    const currentDirectoryPath = state.app.currentDirectoryPath;
    const currentLocationPath = getCurrentLocationPath(state);

    if (currentDirectoryPath) {
      const parentDirectory = extractParentDirectoryPath(currentDirectoryPath);
      if (parentDirectory.startsWith(currentLocationPath)) {
        dispatch(actions.loadDirectoryContent(parentDirectory));
      } else {
        dispatch(actions.showNotification(i18n.t('core:parentDirNotInLocation'), 'warning', true));
      }
    } else {
      dispatch(actions.showNotification(i18n.t('core:firstOpenaFolder'), 'warning', true));
    }
  },
  loadDirectoryContent: (directoryPath: string) => (
    dispatch: (actions: Object) => void,
    getState: () => Object
  ) => {
    console.time('listDirectoryPromise');
    const { settings } = getState();
    window.walkCanceled = false;
    dispatch(actions.showNotification(i18n.t('core:loading'), 'info', false));
    PlatformIO.listDirectoryPromise(directoryPath, false)
      .then(results => {
        const metaDirectory = getMetaDirectoryPath(directoryPath);
        // Case where current folder is a .ts folder
        if (normalizePath(directoryPath).endsWith(AppConfig.metaFolder)) {
          prepareDirectoryContent(
            results,
            directoryPath,
            settings,
            dispatch
          );
          return true;
        }
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
  ) => (
    dispatch: (actions: Object) => void
  ) => {
    dispatch(actions.hideNotifications());
    dispatch(actions.loadDirectorySuccessInt(directoryPath, directoryContent));
  },
  loadDirectorySuccessInt: (
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
    dispatch(actions.hideNotifications());
    dispatch(
      actions.showNotification(i18n.t('core:errorLoadingFolder'), 'warning', true)
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
  setGeneratingThumbnails: (isGeneratingThumbs: boolean) => ({
    type: types.SET_GENERATING_THUMBNAILS,
    isGeneratingThumbs
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
        dispatch(actions.showNotification(i18n.t('core:fileCreateSuccessfully'), 'info', true));
        dispatch(actions.openFile(filePath));
        // TODO select file // dispatch(actions.setLastSelectedEntry(filePath));
        return true;
      }).catch((err) => {
        console.warn('File creation failed with ' + err);
        dispatch(actions.showNotification(i18n.t('core:errorCreatingFile'), 'warning', true));
      });
    } else {
      dispatch(actions.showNotification(i18n.t('core:firstOpenaFolder'), 'warning', true));
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
  updateSearchResults: (searchResults: Array<Object> | []) => ({
    type: types.INDEX_DIRECTORY_SEARCH,
    searchResults
  }),
  setCurrentLocationId: (locationId: string | null) => ({
    type: types.SET_CURRENLOCATIONID,
    locationId
  }),
  openLocationById: (locationId: string) => (
    dispatch: (actions: Object) => void,
    getState: () => Object
  ) => {
    const locations: Array<Location> = getState().locations;
    locations.map(location => {
      if (location.uuid === locationId) {
        dispatch(actions.openLocation(location));
      }
      return true;
    });
  },
  openLocation: (location: Location) => (
    dispatch: (actions: Object) => void,
    getState: () => Object
  ) => {
    if (Pro && Pro.Watcher) {
      Pro.Watcher.stopWatching();
    }
    const currentLocationId = getState().app;
    if (location.type === locationType.TYPE_CLOUD) {
      PlatformIO.enableObjectStoreSupport(location).then(() => {
        dispatch(actions.showNotification(i18n.t('core:connectedtoObjectStore'), 'default', true));
        dispatch(actions.setReadOnlyMode(location.isReadOnly || false));
        dispatch(actions.setCurrentLocationId(location.uuid));
        dispatch(actions.loadDirectoryContent(location.paths[0]));
        if (location.uuid !== currentLocationId) {
          if (location.persistIndex) {
            dispatch(LocationIndexActions.loadDirectoryIndex(location.paths[0]));
          } else {
            dispatch(LocationIndexActions.createDirectoryIndex(location.paths[0]));
          }
        }
        return true;
      }).catch(() => {
        dispatch(actions.showNotification(i18n.t('core:connectedtoObjectStoreFailed'), 'warning', true));
        PlatformIO.disableObjectStoreSupport();
      });
    } else { // if (location.type === locationType.TYPE_LOCAL) {
      PlatformIO.disableObjectStoreSupport();
      dispatch(actions.setReadOnlyMode(location.isReadOnly || false));
      dispatch(actions.setCurrentLocationId(location.uuid));
      dispatch(actions.loadDirectoryContent(location.paths[0]));
      if (location.uuid !== currentLocationId) {
        if (location.persistIndex) {
          dispatch(LocationIndexActions.loadDirectoryIndex(location.paths[0]));
        } else {
          dispatch(LocationIndexActions.createDirectoryIndex(location.paths[0]));
        }
      }
      if (Pro && Pro.Watcher && location.watchForChanges) {
        Pro.Watcher.watchFolder(location.paths[0], dispatch, actions);
      }
    }
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
    const currentEntries = getState().app.currentDirectoryEntries.filter(entry => entry.isFile);
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
    const currentEntries = getState().app.currentDirectoryEntries.filter(entry => entry.isFile);
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
  reflectCreateEntryInt: (newEntry) => ({
    type: types.REFLECT_CREATE_ENTRY,
    newEntry
  }),
  reflectCreateEntry: (path: string, isFile: boolean) => (
    dispatch: (actions: Object) => void
  ) => {
    const newEntry = {
      uuid: uuidv1(),
      name: extractFileName(path),
      isFile,
      extension: extractFileExtension(path),
      description: '',
      tags: [],
      size: 0,
      lmdt: (new Date()).getTime(),
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
  reflectUpdateSidecarTagsInt: (path: string, tags: Array<Tags>) => ({
    type: types.REFLECT_UPDATE_SIDECARTAGS,
    path,
    tags
  }),
  reflectUpdateSidecarMetaInt: (path: string, entryMeta: Object) => ({
    type: types.REFLECT_UPDATE_SIDECARMETA,
    path,
    entryMeta
  }),
  reflectUpdateSidecarTags: (path: string, tags: Array<Tags>) => (
    dispatch: (actions: Object) => void
  ) => {
    dispatch(actions.reflectUpdateSidecarTagsInt(path, tags));
    dispatch(LocationIndexActions.reflectUpdateSidecarTags(path, tags));
  },
  reflectUpdateSidecarMeta: (path: string, entryMeta: Object) => (
    dispatch: (actions: Object) => void
  ) => {
    dispatch(actions.reflectUpdateSidecarMetaInt(path, entryMeta));
    dispatch(LocationIndexActions.reflectUpdateSidecarMeta(path, entryMeta));
  },
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
            i18n.t('core:renamingSuccessfully'),
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
    actions.showNotification(i18n.t('core:notImplementedYet'), 'warning', true);
    // const { app } = getState();
    /* PlatformIO.saveFilePromise(filePath, content, true).then((isNewFile) => {
      console.log(isNewFile);
      dispatch(
        actions.showNotification(i18n.t('core:fileCreatedSuccessfully.'), 'successfully', true)
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
      entry.name.startsWith('.')
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
    dispatch(actions.showNotification(i18n.t('core:generatingThumbnailsFailed'), 'warning', true));
  }

  if (tmbGenerationPromises.length > 0) {
    dispatch(actions.setGeneratingThumbnails(true));
    // dispatch(actions.showNotification(i18n.t('core:checkingThumbnails'), 'info', false));
    Promise.all(tmbGenerationPromises)
      .then(handleTmbGenerationResults)
      .catch(handleTmbGenerationFailed);
  } else if (tmbGenerationList.length > 0) {
    dispatch(actions.setGeneratingThumbnails(true));
    // dispatch(actions.showNotification(i18n.t('core:loadingOrGeneratingThumbnails'), 'info', false));
    PlatformIO.createThumbnailsInWorker(tmbGenerationList)
      .then(handleTmbGenerationResults)
      .catch(handleTmbGenerationFailed);
  } else { // no dirEntries
    console.log('Dir ' + directoryPath + ' contains ' + directoryContent.length);
    dispatch(actions.setGeneratingThumbnails(false));
    dispatch(actions.loadDirectorySuccess(directoryPath, directoryContent));
    return;
  }

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
export const getCurrentLocationPath = (state: Object) => {
  let pathCurrentLocation;
  if (state.locations) {
    state.locations.map((location) => {
      if (state.app.currentLocationId && location.uuid === state.app.currentLocationId) {
        pathCurrentLocation = location.paths[0];
      }
      return true;
    });
  }
  return pathCurrentLocation;
};
export const isUpdateAvailable = (state: Object) => state.app.isUpdateAvailable;
export const isUpdateInProgress = (state: Object) =>
  state.app.isUpdateInProgress;
export const isOnline = (state: Object) => state.app.isOnline;
export const getLastSelectedEntry = (state: Object) => state.app.lastSelectedEntry;
export const isFileOpened = (state: Object) => state.app.openedFiles.length > 0;
export const isGeneratingThumbs = (state: Object) => state.app.isGeneratingThumbs;
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
export const isEntryInFullWidth = (state: Object) => state.app.isEntryInFullWidth;
