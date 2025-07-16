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
import { cleanFrontDirSeparator } from '@tagspaces/tagspaces-common/paths';
import {
  actions as SettingsActions,
  getCheckForUpdateOnStartup,
  isGlobalKeyBindingEnabled,
} from '-/reducers/settings';
import {
  isWorkerAvailable,
  loadExtensions,
  setGlobalShortcuts,
  setLanguage,
} from '-/services/utils-io';
import { getURLParameter } from '-/utils/dom';
import i18n from '../services/i18n';

import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

type State = {};
export type AppDispatch = ThunkDispatch<State, any, AnyAction>;

export const types = {
  DEVICE_ONLINE: 'APP/DEVICE_ONLINE',
  DEVICE_OFFLINE: 'APP/DEVICE_OFFLINE',
  PROGRESS: 'APP/PROGRESS',
  PROGRESS_FINISH: 'APP/PROGRESS_FINISH',
  RESET_PROGRESS: 'APP/RESET_PROGRESS',
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
    case types.DEVICE_ONLINE: {
      return { ...state, isOnline: true, error: null };
    }
    case types.DEVICE_OFFLINE: {
      return { ...state, isOnline: false, error: null };
    }
    case types.PROGRESS: {
      const path = cleanFrontDirSeparator(action.path);
      const arrProgress = [
        {
          path: path,
          filePath: action.filePath,
          progress: action.progress,
          abort: action.abort,
          state: 'started',
        },
      ];
      state.progress.map((fileProgress) => {
        if (fileProgress && fileProgress.path !== path) {
          arrProgress.push(fileProgress);
        }
        return true;
      });
      return { ...state, progress: arrProgress };
    }
    case types.PROGRESS_FINISH: {
      const arrProgress = action.progresses.map((p) => ({
        ...p,
        state: 'finished',
      }));
      return { ...state, progress: arrProgress };
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
    case types.SET_SEARCH_FILTER: {
      if (action.searchFilter !== state.searchFilter) {
        return {
          ...state,
          searchFilter: action.searchFilter,
        };
      }
      return state;
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

    if (AppConfig.isElectron) {
      // Used by tests todo sendMessage only in test environment
      window.electronIO.ipcRenderer.sendMessage('startup-finished');
    }
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
  setSearchFilter: (searchFilter: string) => ({
    type: types.SET_SEARCH_FILTER,
    searchFilter,
  }),
};

// Selectors
export const getProgress = (state: any) => state.app.progress;
export const isUpdateAvailable = (state: any) => state.app.isUpdateAvailable;
export const isUpdateInProgress = (state: any) => state.app.isUpdateInProgress;
export const isOnline = (state: any) => state.app.isOnline;
export const isTagLibraryChanged = (state: any) => state.app.tagLibraryChanged;
export const getNotificationStatus = (state: any) =>
  state.app.notificationStatus;
export const isEntryInFullWidth = (state: any) => state.app.isEntryInFullWidth;
export const getSearchFilter = (state: any) => state.app.searchFilter;
