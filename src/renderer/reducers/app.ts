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

import AppConfig from '-/AppConfig';
import { getURLParameter } from '-/utils/dom';
import {
  isWorkerAvailable,
  loadExtensions,
  setGlobalShortcuts,
  setLanguage,
} from '-/services/utils-io';
import i18n from '../services/i18n';
import {
  actions as SettingsActions,
  getCheckForUpdateOnStartup,
  isGlobalKeyBindingEnabled,
} from '-/reducers/settings';

import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';

type State = {};
export type AppDispatch = ThunkDispatch<State, any, AnyAction>;

export const types = {
  DEVICE_ONLINE: 'APP/DEVICE_ONLINE',
  DEVICE_OFFLINE: 'APP/DEVICE_OFFLINE',
  PROGRESS: 'APP/PROGRESS',
  PROGRESS_FINISH: 'APP/PROGRESS_FINISH',
  RESET_PROGRESS: 'APP/RESET_PROGRESS',
  //LOGIN_SUCCESS: 'APP/LOGIN_SUCCESS',
  LOGIN_FAILURE: 'APP/LOGIN_FAILURE',
  LOGOUT: 'APP/LOGOUT',
  SET_DIRECTORY_META: 'APP/SET_DIRECTORY_META',
  SET_SEARCH_FILTER: 'APP/SET_SEARCH_FILTER',
  SET_NEW_VERSION_AVAILABLE: 'APP/SET_NEW_VERSION_AVAILABLE',
  SET_CURRENLOCATIONID: 'APP/SET_CURRENLOCATIONID',
  SET_FILEDRAGGED: 'APP/SET_FILEDRAGGED',
  CLOSE_ALLVERTICAL_PANELS: 'APP/CLOSE_ALLVERTICAL_PANELS',
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
  error: null,
  loggedIn: false,
  isOnline: false,
  lastError: '',
  progress: [],
  isUpdateInProgress: false,
  isUpdateAvailable: false,
  searchResults: [],
  notificationStatus: {
    visible: false,
    text: 'Test',
    notificationType: '',
    autohide: false,
  },
  createDirectoryDialogOpened: null,
  tagLibraryChanged: false,
  isEntryInFullWidth: false,
  //locationManagerPanelOpened: showLocations,
  tagLibraryPanelOpened: showTagLibrary,
  searchPanelOpened: showSearch,
  /*user: window.ExtDemoUser
    ? {
        attributes: window.ExtDemoUser,
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        associateSoftwareToken: () => {},
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        verifySoftwareToken: () => {},
      }
    : undefined,*/
};

// The state described here will not be persisted
// eslint-disable-next-line default-param-last
export default (state: any = initialState, action: any) => {
  switch (action.type) {
    /* case types.LOGIN_SUCCESS: {
      return { ...state, user: action.user };
    }*/
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
          abort: action.abort,
        },
      ];
      state.progress.map((fileProgress) => {
        if (fileProgress.path !== action.path) {
          arrProgress.push(fileProgress);
        }
        return true;
      });
      return { ...state, progress: arrProgress };
    }
    case types.PROGRESS_FINISH: {
      return { ...state, progress: action.progresses };
    }
    case types.RESET_PROGRESS: {
      return { ...state, progress: [] };
    }
    case types.SET_NEW_VERSION_AVAILABLE: {
      if (action.isUpdateAvailable !== state.isUpdateAvailable) {
        return {
          ...state,
          isUpdateAvailable: action.isUpdateAvailable,
        };
      }
      return state;
    }
    /*case types.SET_SELECTED_ENTRIES: {
      if (
        JSON.stringify(action.selectedEntries) !==
        JSON.stringify(state.selectedEntries)
      ) {
        return { ...state, selectedEntries: action.selectedEntries };
      }
      return state;
    }*/
    /*case types.SET_TAG_LIBRARY_CHANGED: {
      return { ...state, tagLibraryChanged: !state.tagLibraryChanged };
    }*/
    /* case types.TOGGLE_EDIT_TAG_DIALOG: {
      return {
        ...state,
        tag: action.tag,
        editTagDialogOpened: !state.editTagDialogOpened,
      };
    }*/
    /*case types.TOGGLE_ABOUT_DIALOG: {
      return { ...state, aboutDialogOpened: !state.aboutDialogOpened };
    }*/
    /*case types.TOGGLE_LOCATION_DIALOG: {
      return { ...state, locationDialogOpened: !state.locationDialogOpened };
    }*/
    /*case types.TOGGLE_ONBOARDING_DIALOG: {
      return {
        ...state,
        onboardingDialogOpened: !state.onboardingDialogOpened,
      };
    }*/
    /*case types.TOGGLE_OPENLINK_DIALOG: {
      return {
        ...state,
        openLinkDialogOpened: !state.openLinkDialogOpened,
      };
    }*/
    /*case types.TOGGLE_OPEN_PRO_TEASER_DIALOG: {
      let index = -1;
      const proTeaserIndex = getProTeaserSlideIndex(action.proTeaserPage);
      if (proTeaserIndex && proTeaserIndex > -1) {
        index = proTeaserIndex;
      } else if (state.proTeaserIndex === -1) {
        index = 0;
      }
      return {
        ...state,
        proTeaserIndex: index,
      };
    }*/
    /*case types.TOGGLE_KEYBOARD_DIALOG: {
      return { ...state, keysDialogOpened: !state.keysDialogOpened };
    }*/
    /*case types.TOGGLE_NEW_ENTRY_DIALOG: {
      return {
        ...state,
        isNewEntryDialogOpened: !state.isNewEntryDialogOpened,
      };
    }*/
    /*case types.TOGGLE_NEW_FILE_DIALOG: {
      return {
        ...state,
        isNewFileDialogOpened: !state.isNewFileDialogOpened,
      };
    }*/
    /*case types.TOGGLE_NEW_AUDIO_DIALOG: {
      return {
        ...state,
        isNewAudioDialogOpened: !state.isNewAudioDialogOpened,
      };
    }*/
    /*case types.TOGGLE_DELETE_MULTIPLE_ENTRIES_DIALOG: {
      return {
        ...state,
        deleteMultipleEntriesDialogOpened:
          !state.deleteMultipleEntriesDialogOpened,
      };
    }*/
    /*case types.TOGGLE_IMPORT_KANBAN_DIALOG: {
      return {
        ...state,
        importKanBanDialogOpened: !state.importKanBanDialogOpened,
      };
    }*/
    /*case types.TOGGLE_LICENSE_DIALOG: {
      return { ...state, licenseDialogOpened: !state.licenseDialogOpened };
    }*/
    /*case types.TOGGLE_THIRD_PARTY_LIBS_DIALOG: {
      return {
        ...state,
        thirdPartyLibsDialogOpened: !state.thirdPartyLibsDialogOpened,
      };
    }*/
    /*case types.TOGGLE_SETTINGS_DIALOG: {
      return { ...state, settingsDialogOpened: !state.settingsDialogOpened };
    }*/
    /*case types.TOGGLE_CREATE_DIRECTORY_DIALOG: {
      // dialog closed = null
      return {
        ...state,
        createDirectoryDialogOpened:
          state.createDirectoryDialogOpened !== null ? null : action.props,
      };
    }*/
    /*case types.TOGGLE_UPLOAD_DIALOG: {
      // if (PlatformIO.haveObjectStoreSupport()) {
      // upload dialog have objectStore support only
      return {
        ...state,
        // progress: (state.uploadDialogOpened ? state.progress : []),
        uploadDialogOpened:
          state.uploadDialogOpened === undefined ? action.title : undefined,
      };
      //}
      // return state;
    }*/
    /*case types.TOGGLE_TRUNCATED_DIALOG: {
      return {
        ...state,
        isTruncatedConfirmDialogOpened: !state.isTruncatedConfirmDialogOpened,
      };
    }*/
    /* case types.SET_CURRENT_DIRECTORY_DIRS: {
      if (
        JSON.stringify(state.currentDirectoryDirs) !==
        JSON.stringify(action.dirs)
      ) {
        return {
          ...state,
          currentDirectoryDirs: action.dirs
        };
      }
      return state;
    }*/
    /*case types.CLEAR_UPLOAD_DIALOG: {
      // if (PlatformIO.haveObjectStoreSupport()) {
      // upload dialog have objectStore support only
      return {
        ...state,
        progress: [],
        uploadDialogOpened: undefined,
      };
      // }
      // return state;
    }*/
    /*case types.TOGGLE_PROGRESS_DIALOG: {
      return {
        ...state,
        progressDialogOpened: !state.progressDialogOpened,
      };
    }*/
    case types.SET_SEARCH_FILTER: {
      if (action.searchFilter !== state.searchFilter) {
        return {
          ...state,
          searchFilter: action.searchFilter,
        };
      }
      return state;
    }
    /*case types.OPEN_LOCATIONMANAGER_PANEL: {
      return {
        ...state,
        locationManagerPanelOpened: true,
        tagLibraryPanelOpened: false,
        searchPanelOpened: false,
        helpFeedbackPanelOpened: false,
      };
    }
    case types.OPEN_TAGLIBRARY_PANEL: {
      return {
        ...state,
        locationManagerPanelOpened: false,
        tagLibraryPanelOpened: true,
        searchPanelOpened: false,
        helpFeedbackPanelOpened: false,
      };
    }
    case types.OPEN_SEARCH_PANEL: {
      return {
        ...state,
        locationManagerPanelOpened: false,
        tagLibraryPanelOpened: false,
        searchPanelOpened: true,
        helpFeedbackPanelOpened: false,
      };
    }
    case types.OPEN_HELPFEEDBACK_PANEL: {
      return {
        ...state,
        locationManagerPanelOpened: false,
        tagLibraryPanelOpened: false,
        searchPanelOpened: false,
        helpFeedbackPanelOpened: true,
      };
    }*/
    /*case types.ADD_EXTENSIONS: {
      const extensions = mergeByProp(
        state.extensions,
        action.extensions,
        'extensionId',
      );
      return {
        ...state,
        extensions: extensions.map((ext) => {
          if (action.enabledExtensions.includes(ext.extensionId)) {
            return { ...ext, extensionEnabled: true };
          }
          return ext;
        }),
      };
    }*/
    /*case types.UPDATE_EXTENSION: {
      return {
        ...state,
        extensions: mergeByProp(
          state.extensions,
          [action.extension],
          'extensionId',
        ), // updateExtensions(state.extensions, action.extension)
      };
    }*/
    /*case types.REMOVE_EXTENSIONS: {
      return {
        ...state,
        extensions: state.extensions.filter(
          (ext) => ext.extensionId !== action.extensionId,
        ),
      };
    }*/
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
  /*addExtensions:
    (extensions: Array<TS.Extension>) =>
    (dispatch: (action) => void, getState: () => any) => {
      const { settings } = getState();
      dispatch(
        actions.addExtensionsInt(extensions, settings.enabledExtensions),
      );
    },
  addExtensionsInt: (
    extensions: Array<TS.Extension>,
    enabledExtensions: Array<string>,
  ) => ({
    type: types.ADD_EXTENSIONS,
    extensions,
    enabledExtensions,
  }),*/
  /*removeExtension: (extensionId: string) => ({
    type: types.REMOVE_EXTENSIONS,
    extensionId,
  }),*/
  /*updateExtension: (extension: TS.Extension) => ({
    type: types.UPDATE_EXTENSION,
    extension,
  }),*/
  /*setLastBackgroundImageChange: (folderPath, lastBackgroundImageChange) => ({
    type: types.LAST_BACKGROUND_IMAGE_CHANGE,
    folderPath,
    lastBackgroundImageChange,
  }),
  setLastBackgroundColorChange: (folderPath, lastBackgroundColorChange) => ({
    type: types.LAST_BACKGROUND_COLOR_CHANGE,
    folderPath,
    lastBackgroundColorChange,
  }),
  /!**
   * @param thumbPath
   * @param lastThumbnailImageChange - timestamp set -1 if thumbnail image deleted
   *!/
  setLastThumbnailImageChange: (thumbPath, lastThumbnailImageChange?) => ({
    type: types.LAST_THUMBNAIL_IMAGE_CHANGE,
    thumbPath,
    lastThumbnailImageChange: lastThumbnailImageChange || new Date().getTime(),
  }),*/
  //loggedIn: (user) => ({ type: types.LOGIN_SUCCESS, user }),
  /*openLink: (url: string, options = { fullWidth: true }) => ({
    type: types.OPEN_LINK,
    url,
    options
  }),*/
  initApp: () => (dispatch: (action) => void, getState: () => any) => {
    disableBackGestureMac();

    dispatch(SettingsActions.setZoomRestoreApp());
    dispatch(SettingsActions.upgradeSettings()); // TODO call this only on app version update
    const state = getState();
    if (getCheckForUpdateOnStartup(state)) {
      dispatch(SettingsActions.checkForUpdate());
    }
    /*if (isFirstRun(state)) {
      dispatch(actions.toggleOnboardingDialog());
      dispatch(actions.toggleLicenseDialog());
    }*/
    setTimeout(() => {
      setGlobalShortcuts(isGlobalKeyBindingEnabled(state));
      loadExtensions();
    }, 1000);
    const langURLParam = getURLParameter('locale');
    if (
      langURLParam &&
      langURLParam.length > 1 &&
      /^[a-zA-Z\-_]+$/.test('langURLParam')
    ) {
      i18n.changeLanguage(langURLParam).then(() => {
        dispatch(SettingsActions.setLanguage(langURLParam));
        setLanguage(langURLParam);
        return true;
      });
    }
    isWorkerAvailable().then((workerAvailable) =>
      workerAvailable
        ? console.log('Worker is available in renderer thread')
        : console.log('Worker is not available in renderer thread'),
    );
  },
  goOnline: () => ({ type: types.DEVICE_ONLINE }),
  goOffline: () => ({ type: types.DEVICE_OFFLINE }),
  setUpdateAvailable: (isUpdateAvailable: boolean) => ({
    type: types.SET_NEW_VERSION_AVAILABLE,
    isUpdateAvailable,
  }),
  setProgress: (path, progress, abort?, filePath = undefined) => ({
    type: types.PROGRESS,
    path,
    filePath,
    progress,
    abort,
  }),
  setProgresses: (progresses: { path: string; progress: number }[]) => ({
    type: types.PROGRESS_FINISH,
    progresses,
  }),
  resetProgress: () => ({ type: types.RESET_PROGRESS }),
  onUploadProgress:
    (progress, abort, fileName = undefined) =>
    (dispatch: (action) => void) => {
      const progressPercentage = Math.round(
        (progress.loaded / progress.total) * 100,
      );
      console.log(progressPercentage);

      dispatch(
        actions.setProgress(progress.key, progressPercentage, abort, fileName),
      );
    },
  /*showCreateDirectoryDialog:
    () => (dispatch: (action) => void, getState: () => any) => {
      dispatch(actions.toggleCreateDirectoryDialog());
    },*/
  /*showCreateFileDialog:
    () => (dispatch: (action) => void, getState: () => any) => {

      dispatch(actions.toggleNewEntryDialog());
    },*/
  /*toggleEditTagDialog: (tag: TS.Tag) => ({
    type: types.TOGGLE_EDIT_TAG_DIALOG,
    tag,
  }),*/
  //toggleAboutDialog: () => ({ type: types.TOGGLE_ABOUT_DIALOG }),
  //toggleLocationDialog: () => ({ type: types.TOGGLE_LOCATION_DIALOG }),
  //toggleOnboardingDialog: () => ({ type: types.TOGGLE_ONBOARDING_DIALOG }),
  //toggleKeysDialog: () => ({ type: types.TOGGLE_KEYBOARD_DIALOG }),
  //toggleOpenLinkDialog: () => ({ type: types.TOGGLE_OPENLINK_DIALOG }),
  /*toggleProTeaser: (slidePage?: string) => ({
    type: types.TOGGLE_OPEN_PRO_TEASER_DIALOG,
    proTeaserPage: slidePage,
  }),*/
  //toggleLicenseDialog: () => ({ type: types.TOGGLE_LICENSE_DIALOG }),
  /* toggleThirdPartyLibsDialog: () => ({
    type: types.TOGGLE_THIRD_PARTY_LIBS_DIALOG,
  }),*/
  //toggleSettingsDialog: () => ({ type: types.TOGGLE_SETTINGS_DIALOG }),
  /*toggleCreateDirectoryDialog: (props = undefined) => ({
    type: types.TOGGLE_CREATE_DIRECTORY_DIALOG,
    props,
  }),*/
  //toggleNewEntryDialog: () => ({ type: types.TOGGLE_NEW_ENTRY_DIALOG }),
  //toggleNewFileDialog: () => ({ type: types.TOGGLE_NEW_FILE_DIALOG }),
  //toggleNewAudioDialog: () => ({ type: types.TOGGLE_NEW_AUDIO_DIALOG }),
  /*toggleDeleteMultipleEntriesDialog: () => ({
    type: types.TOGGLE_DELETE_MULTIPLE_ENTRIES_DIALOG,
  }),*/
  /*toggleImportKanBanDialog: () => ({
    type: types.TOGGLE_IMPORT_KANBAN_DIALOG,
  }),*/
  /*toggleUploadDialog: (title = '') => ({
    type: types.TOGGLE_UPLOAD_DIALOG,
    title,
  }),*/
  /*toggleTruncatedConfirmDialog: () => ({
    type: types.TOGGLE_TRUNCATED_DIALOG,
  }),*/
  /*setCurrentDirectoryDirs: dirs => ({
    type: types.SET_CURRENT_DIRECTORY_DIRS,
    dirs
  }),*/
  /*clearUploadDialog: () => ({
    type: types.CLEAR_UPLOAD_DIALOG,
  }),*/
  /*toggleProgressDialog: () => ({
    type: types.TOGGLE_PROGRESS_DIALOG,
  }),*/
  /*openLocationManagerPanel: () => ({ type: types.OPEN_LOCATIONMANAGER_PANEL }),
  openTagLibraryPanel: () => ({ type: types.OPEN_TAGLIBRARY_PANEL }),
  openSearchPanel: () => ({ type: types.OPEN_SEARCH_PANEL }),
  openHelpFeedbackPanel: () => ({ type: types.OPEN_HELPFEEDBACK_PANEL }),*/
  /*setSelectedEntries: (selectedEntries: Array<TS.FileSystemEntry>) => (
    dispatch: (action) => void
  ) => {
    // const { openedFiles } = getState().app;
    // skip select other file if its have openedFiles in editMode
    // if (openedFiles.length === 0 || !openedFiles[0].editMode) {
    dispatch(actions.setSelectedEntriesInt(selectedEntries));
    // }
  },*/
  /*setSelectedEntriesInt: (selectedEntries: Array<TS.FileSystemEntry>) => ({
    type: types.SET_SELECTED_ENTRIES,
    selectedEntries
  }),*/
  /*addTag:
    (tag: any, parentTagGroupUuid: TS.Uuid) =>
    (dispatch: (action) => void, getState: () => any) => {
      const { locations } = getState();
      addTag(tag, parentTagGroupUuid, getTagLibrary(), locations);
      dispatch(actions.tagLibraryChanged());
    },
  tagLibraryChanged: () => ({
    type: types.SET_TAG_LIBRARY_CHANGED,
  }),*/
  /*openDirectory: (directoryPath: string) => () => {
    PlatformIO.openDirectory(directoryPath);
  },*/
  /*showInFileManager: (filePath: string) => () => {
    PlatformIO.showInFileManager(filePath);
  },*/
  setSearchFilter: (searchFilter: string) => ({
    type: types.SET_SEARCH_FILTER,
    searchFilter,
  }),
  /*reflectDeleteEntry: (path: string) => ({
    type: types.REFLECT_DELETE_ENTRY,
    path,
  }),
  reflectDeleteEntries: (paths: string[]) => ({
    type: types.REFLECT_DELETE_ENTRIES,
    paths,
  }),
  reflectCreateEntryInt: (newEntry: TS.FileSystemEntry) => ({
    type: types.REFLECT_CREATE_ENTRY,
    newEntry,
  }),
  reflectCreateEntries: (fsEntries: Array<TS.FileSystemEntry>) => ({
    type: types.REFLECT_CREATE_ENTRIES,
    fsEntries,
  }),*/
  /*reflectCreateEntries: (fsEntries: Array<TS.FileSystemEntry>) => (
    dispatch: (action) => void
  ) => {
    dispatch(actions.reflectCreateEntriesInt(fsEntries));
    dispatch(actions.setSelectedEntries(fsEntries));
  },*/
  /*reflectCreateEntry:
    (path: string, isFile: boolean) => (dispatch: (action) => void) => {
      dispatch(actions.reflectCreateEntries([toFsEntry(path, isFile)]));
    },*/
  /*reflectCreateEntryObj: (newEntry: TS.FileSystemEntry) => (
    dispatch: (action) => void
  ) => {
    dispatch(actions.setSelectedEntries([newEntry]));
    dispatch(actions.reflectCreateEntryInt(newEntry));
    //GlobalSearch.getInstance().reflectCreateEntry(newEntry);
  },*/
  /*reflectRenameEntry: (path: string, newPath: string) => ({
    type: types.REFLECT_RENAME_ENTRY,
    path,
    newPath,
  }),*/
  /*reflectRenameEntry: (path: string, newPath: string) => (
    dispatch: (action) => void
  ) => {
    dispatch(actions.reflectRenameEntryInt(path, newPath));
    // GlobalSearch.getInstance().reflectRenameEntry(path, newPath);
    dispatch(actions.setSelectedEntries([]));
  },*/
  /*reflectEditedEntryPaths: (editedEntryPaths: Array<TS.EditedEntryPath>) => ({
    type: types.REFLECT_EDITED_ENTRY_PATHS,
    editedEntryPaths,
  }),*/
  /*openFileNatively: (selectedFile: string) => (
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
  }*/
};

// Selectors
/*export const getLastBackgroundImageChange = (state: any) =>
  state.app.lastBackgroundImageChange;
export const getLastBackgroundColorChange = (state: any) =>
  state.app.lastBackgroundColorChange;
export const getLastThumbnailImageChange = (state: any) =>
  state.app.lastThumbnailImageChange;*/
//export const currentUser = (state: any) => state.app.user;
//export const getEditedEntryPaths = (state: any) => state.app.editedEntryPaths;
/*export const getCurrentDirectoryColor = (state: any) =>
  state.app.currentDirectoryColor;
export const getCurrentDirectoryDescription = (state: any) =>
  state.app.currentDirectoryDescription;
export const getCurrentDirectoryTags = (state: any) =>
  state.app.currentDirectoryTags;*/
export const getProgress = (state: any) => state.app.progress;
export const isUpdateAvailable = (state: any) => state.app.isUpdateAvailable;
export const isUpdateInProgress = (state: any) => state.app.isUpdateInProgress;
export const isOnline = (state: any) => state.app.isOnline;
/*export const getLastSelectedEntry = (state: any) => {
  const { selectedEntries } = state.app;
  if (selectedEntries && selectedEntries.length > 0) {
    return selectedEntries[selectedEntries.length - 1];
  }
  return undefined;
};
export const getLastSelectedEntryPath = (state: any) => {
  const { selectedEntries } = state.app;
  if (selectedEntries && selectedEntries.length > 0) {
    return selectedEntries[selectedEntries.length - 1].path;
  }
  return undefined;
};*/
//export const getSelectedTag = (state: any) => state.app.tag;
export const isTagLibraryChanged = (state: any) => state.app.tagLibraryChanged;
/*export const getSelectedEntries = (state: any) =>
  state.app.selectedEntries ? state.app.selectedEntries : [];*/
/*export const getSelectedEntriesLength = (state: any) =>
  state.app.selectedEntries ? state.app.selectedEntries.length : 0;*/
//export const getExtensions = (state: any) => state.app.extensions;
// export const getDirectoryMeta = (state: any) => state.app.directoryMeta;
// export const isGeneratingThumbs = (state: any) => state.app.isGeneratingThumbs;
// export const isReadOnlyMode = (state: any) => state.app.isReadOnlyMode;
/*export const isOnboardingDialogOpened = (state: any) =>
  state.app.onboardingDialogOpened;*/
/*export const isEditTagDialogOpened = (state: any) =>
  state.app.editTagDialogOpened;*/
//export const isAboutDialogOpened = (state: any) => state.app.aboutDialogOpened;
/*export const isLocationDialogOpened = (state: any) =>
  state.app.locationDialogOpened;*/
//export const isKeysDialogOpened = (state: any) => state.app.keysDialogOpened;
/*export const isLicenseDialogOpened = (state: any) =>
  state.app.licenseDialogOpened;*/
/*export const isThirdPartyLibsDialogOpened = (state: any) =>
  state.app.thirdPartyLibsDialogOpened;*/
/*export const isSettingsDialogOpened = (state: any) =>
  state.app.settingsDialogOpened;*/
/*export const isCreateDirectoryOpened = (state: any) =>
  state.app.createDirectoryDialogOpened;*/
/*export const isNewEntryDialogOpened = (state: any) =>
  state.app.isNewEntryDialogOpened;*/
/*export const isNewFileDialogOpened = (state: any) =>
  state.app.isNewFileDialogOpened;*/
/*export const isNewAudioDialogOpened = (state: any) =>
  state.app.isNewAudioDialogOpened;*/
/*export const isDeleteMultipleEntriesDialogOpened = (state: any) =>
  state.app.deleteMultipleEntriesDialogOpened;*/
/*export const isImportKanBanDialogOpened = (state: any) =>
  state.app.importKanBanDialogOpened;*/
/*export const isUploadDialogOpened = (state: any) =>
  state.app.uploadDialogOpened;*/
/*export const isTruncatedConfirmDialogOpened = (state: any) =>
  state.app.isTruncatedConfirmDialogOpened;*/
/*export const isOpenLinkDialogOpened = (state: any) =>
  state.app.openLinkDialogOpened;*/
//export const isProTeaserVisible = (state: any) => state.app.proTeaserIndex > -1;
//export const getProTeaserIndex = (state: any) => state.app.proTeaserIndex;
//export const isProgressOpened = (state: any) => state.app.progressDialogOpened;
//export const getOpenLink = (state: any) => state.app.openLink;
export const getNotificationStatus = (state: any) =>
  state.app.notificationStatus;
//export const getCurrentLocationId = (state: any) => state.app.currentLocationId;
export const isEntryInFullWidth = (state: any) => state.app.isEntryInFullWidth;
//export const isLoading = (state: any) => state.app.isLoading;
/*export const isLocationManagerPanelOpened = (state: any) =>
  state.app.locationManagerPanelOpened;*/
/*export const isTagLibraryPanelOpened = (state: any) =>
  state.app.tagLibraryPanelOpened;
export const isSearchPanelOpened = (state: any) => state.app.searchPanelOpened;
export const isHelpFeedbackPanelOpened = (state: any) =>
  state.app.helpFeedbackPanelOpened;*/
/*export const getLastSearchTimestamp = (state: any) =>
  state.app.lastSearchTimestamp;*/
//export const isSearchMode = (state: any) => state.app.searchMode;
export const getSearchFilter = (state: any) => state.app.searchFilter;

// export type CreateDirectoryAction = ReturnType<typeof actions.createDirectory>;
