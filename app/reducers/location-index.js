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

import { type Location, getLocation, locationType } from './locations';
import { createDirectoryIndex } from '../services/utils-io';
import { Pro } from '../pro';
import {
  extractFileExtension,
  extractFileName,
  extractTagsAsObjects,
  // getThumbFileLocationForFile
} from '../utils/paths';
import type { SearchQuery } from '../services/search';
import Search from '../services/search';
import { actions as AppActions } from './app';
import AppConfig from '../config';
import i18n from '../services/i18n';
// import PlatformIO from '../services/platform-io';
import { type Tag } from './taglibrary';

export const types = {
  INDEX_DIRECTORY: 'INDEX_DIRECTORY',
  INDEX_DIRECTORY_CLEAR: 'INDEX_DIRECTORY_CLEAR',
  INDEX_DIRECTORY_START: 'INDEX_DIRECTORY_START',
  INDEX_DIRECTORY_CANCEL: 'INDEX_DIRECTORY_CANCEL',
  INDEX_DIRECTORY_SUCCESS: 'INDEX_DIRECTORY_SUCCESS',
  INDEX_DIRECTORY_FAILURE: 'INDEX_DIRECTORY_FAILURE',
  INDEX_DIRECTORY_SEARCH: 'INDEX_DIRECTORY_SEARCH',
  REFLECT_DELETE_ENTRY: 'INDEX/REFLECT_DELETE_ENTRY',
  REFLECT_CREATE_ENTRY: 'INDEX/REFLECT_CREATE_ENTRY',
  REFLECT_RENAME_ENTRY: 'INDEX/REFLECT_RENAME_ENTRY',
  REFLECT_UPDATE_SIDECARTAGS: 'INDEX/REFLECT_UPDATE_SIDECARTAGS',
  REFLECT_UPDATE_SIDECARMETA: 'INDEX/REFLECT_UPDATE_SIDECARMETA'
};


export const initialState = {
  currentDirectoryIndex: [],
  isIndexing: false
};

export default (state: Object = initialState, action: Object) => {
  switch (action.type) {
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
  case types.INDEX_DIRECTORY_SUCCESS: {
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
  case types.REFLECT_DELETE_ENTRY: {
    const newDirectoryIndex = state.currentDirectoryIndex.filter((entry) => !entry.path.startsWith(action.path));
    if (state.currentDirectoryIndex.length > newDirectoryIndex.length) {
      return {
        ...state,
        currentDirectoryIndex: newDirectoryIndex
      };
    }
    return state;
  }
  case types.REFLECT_CREATE_ENTRY: {
    const entryIndex = state.currentDirectoryIndex.findIndex((entry) => entry.path === action.newEntry.path);
    if (entryIndex) {
      return state;
    }
    return {
      ...state,
      currentDirectoryIndex: [
        action.newEntry,
        ...state.currentDirectoryIndex
      ],
    };
  }
  case types.REFLECT_RENAME_ENTRY: {
    return {
      ...state,
      currentDirectoryIndex: state.currentDirectoryIndex.map((entry) => {
        if (entry.path !== action.path) {
          return entry;
        }
        return {
          ...entry,
          path: action.newPath,
          // thumbPath: getThumbFileLocationForFile(action.newPath), // disabled due performance concerns
          name: extractFileName(action.newPath),
          extension: extractFileExtension(action.newPath),
          tags: [
            ...entry.tags.filter(tag => tag.type === 'sidecar'), // add only sidecar tags
            ...extractTagsAsObjects(action.newPath) // , getTagDelimiter(state))
          ]
        };
      })
    };
    /* const indexForRenamingInIndex = state.currentDirectoryIndex.findIndex((entry) => entry.path === action.path);
    if (indexForRenamingInIndex >= 0) {
      const updateEntry = {
        ...state.currentDirectoryIndex[indexForRenamingInIndex],
        path: action.newPath,
        // thumbPath: getThumbFileLocationForFile(action.newPath), // disabled due performance concerns
        name: extractFileName(action.newPath),
        extension: extractFileExtension(action.newPath),
        tags: [
          ...state.currentDirectoryIndex[indexForRenamingInIndex].tags.filter(tag => tag.type === 'sidecar'), // add only sidecar tags
          ...extractTagsAsObjects(action.newPath) // , getTagDelimiter(state))
        ]
      };
      return {
        ...state,
        currentDirectoryIndex: [
          ...state.currentDirectoryIndex.slice(0, indexForRenamingInIndex),
          updateEntry,
          ...state.currentDirectoryIndex.slice(indexForRenamingInIndex + 1)
        ]
      };
    }
    return state; */
  }
  case types.REFLECT_UPDATE_SIDECARTAGS: {
    return {
      ...state,
      currentDirectoryIndex: state.currentDirectoryIndex.map((entry) => {
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
      })
    };
    /* const indexForUpdatingInIndex = state.currentDirectoryIndex.findIndex((entry) => entry.path === action.path);
    if (indexForUpdatingInIndex >= 0) {
      const updateEntry = {
        ...state.currentDirectoryIndex[indexForUpdatingInIndex],
        tags: [
          ...state.currentDirectoryIndex[indexForUpdatingInIndex].tags.filter(tag => tag.type === 'plain'),
          ...action.tags
        ]
      };
      return {
        ...state,
        currentDirectoryIndex: [
          ...state.currentDirectoryIndex.slice(0, indexForUpdatingInIndex),
          updateEntry,
          ...state.currentDirectoryIndex.slice(indexForUpdatingInIndex + 1)
        ]
      };
    }
    return state; */
  }
  case types.REFLECT_UPDATE_SIDECARMETA: {
    return {
      ...state,
      currentDirectoryIndex: state.currentDirectoryIndex.map((entry) => {
        if (entry.path !== action.path) {
          return entry;
        }
        return {
          ...entry,
          ...action.entryMeta
        };
      })
    };
    /* const indexForUpdatingInIndex = state.currentDirectoryIndex.findIndex((entry) => entry.path === action.path);
    if (indexForUpdatingInIndex >= 0) {
      const updateEntry = {
        ...state.currentDirectoryIndex[indexForUpdatingInIndex],
        ...action.entryMeta
      };
      return {
        ...state,
        currentDirectoryIndex: [
          ...state.currentDirectoryIndex.slice(0, indexForUpdatingInIndex),
          updateEntry,
          ...state.currentDirectoryIndex.slice(indexForUpdatingInIndex + 1)
        ]
      };
    }
    return state; */
  }
  default: {
    return state;
  }
  }
};

export const actions = {
  startDirectoryIndexing: () => ({ type: types.INDEX_DIRECTORY_START }),
  cancelDirectoryIndexing: () => ({ type: types.INDEX_DIRECTORY_CANCEL }),
  createDirectoryIndex: (directoryPath: string, extractText: boolean) => (
    dispatch: (actions: Object) => void,
    getState: () => Object
  ) => {
    const state = getState();
    const currentLocation: Location = getLocation(state, state.app.currentLocationId);
    dispatch(actions.startDirectoryIndexing());
    createDirectoryIndex(directoryPath, extractText)
      .then(directoryIndex => {
        dispatch(actions.indexDirectorySuccess(directoryIndex));
        if (Pro && Pro.Indexer) { // && (currentLocation.persistIndex || PlatformIO.haveObjectStoreSupport())) { // always persist on s3 stores
          Pro.Indexer.persistIndex(directoryPath, directoryIndex, (currentLocation.type === locationType.TYPE_CLOUD) ? '/' : AppConfig.dirSeparator);
        }
        return true;
      })
      .catch(err => {
        dispatch(actions.indexDirectoryFailure(err));
        // dispatch(actions.startDirectoryIndexing());
      });
  },
  loadDirectoryIndex: (directoryPath: string) => (
    dispatch: (actions: Object) => void,
    getState: () => Object
  ) => {
    const state = getState();
    const currentLocation: Location = getLocation(state, state.app.currentLocationId);
    dispatch(actions.startDirectoryIndexing());
    dispatch(AppActions.showNotification(i18n.t('core:loadingIndex'), 'default', true));
    if (Pro && Pro.Indexer.loadIndex) {
      Pro.Indexer.loadIndex(directoryPath, (currentLocation.type === locationType.TYPE_CLOUD) ? '/' : AppConfig.dirSeparator).then((directoryIndex) => {
        dispatch(actions.indexDirectorySuccess(directoryIndex));
        return true;
      }).catch(err => {
        dispatch(actions.indexDirectoryFailure(err));
        dispatch(AppActions.showNotification(i18n.t('core:loadingIndexFailed'), 'warning', true));
      });
    }
  },
  clearDirectoryIndex: () => ({
    type: types.INDEX_DIRECTORY_CLEAR
  }),
  searchLocationIndex: (searchQuery: SearchQuery) => (
    dispatch: (actions: Object) => void,
    getState: () => Object
  ) => {
    dispatch(AppActions.showNotification(i18n.t('core:searching'), 'default', false));
    setTimeout(() => { // Workaround used to show the start search notification
      Search.searchLocationIndex(
        getState().locationIndex.currentDirectoryIndex,
        searchQuery
      ).then((searchResults) => {
        dispatch(AppActions.updateSearchResults(searchResults));
        dispatch(AppActions.hideNotifications());
        return true;
      }).catch(() => {
        dispatch(AppActions.updateSearchResults([]));
        dispatch(AppActions.hideNotifications());
        dispatch(AppActions.showNotification(i18n.t('core:searchingFailed'), 'warning', true));
      });
    }, 50);
  },
  indexDirectorySuccess: (directoryIndex: Array<Object>) => ({
    type: types.INDEX_DIRECTORY_SUCCESS,
    directoryIndex
  }),
  indexDirectoryFailure: (error: string) => ({
    type: types.INDEX_DIRECTORY_FAILURE,
    error
  }),
  reflectDeleteEntry: (path: string) => ({
    type: types.REFLECT_DELETE_ENTRY,
    path
  }),
  reflectCreateEntry: (newEntry: Object) => ({
    type: types.REFLECT_CREATE_ENTRY,
    newEntry
  }),
  reflectRenameEntry: (path: string, newPath: string) => ({
    type: types.REFLECT_RENAME_ENTRY,
    path,
    newPath
  }),
  reflectUpdateSidecarTags: (path: string, tags: Array<Tag>) => ({
    type: types.REFLECT_UPDATE_SIDECARTAGS,
    path,
    tags
  }),
  reflectUpdateSidecarMeta: (path: string, entryMeta: Object) => ({
    type: types.REFLECT_UPDATE_SIDECARMETA,
    path,
    entryMeta
  })
};

// Selectors
export const getIndexedEntriesCount = (state: Object) => state.locationIndex.currentDirectoryIndex.length;
export const isIndexing = (state: Object) => state.locationIndex.isIndexing;
