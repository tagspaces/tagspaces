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

import { Location, getLocation, locationType } from './locations';
import { createDirectoryIndex } from '../services/utils-io';
import { Pro } from '../pro';
import {
  extractFileExtension,
  extractFileName,
  extractTagsAsObjects
  // getThumbFileLocationForFile
} from '../utils/paths';
import Search, { SearchQuery } from '../services/search';
import { actions as AppActions } from './app';
import AppConfig from '../config';
import i18n from '../services/i18n';
// import PlatformIO from '../services/platform-io';
import { Tag } from './taglibrary';
import SearchIndex from '../services/search-index';

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
  isIndexing: false
};

export default (state: any = initialState, action: any) => {
  switch (action.type) {
    case types.INDEX_DIRECTORY_START: {
      return {
        ...state,
        isIndexing: true
      };
    }
    case types.INDEX_DIRECTORY_CLEAR: {
      // SearchIndex.length = 0;
      SearchIndex.splice(0, SearchIndex.length);
      return {
        ...state,
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
        isIndexing: false
      };
    }
    case types.INDEX_DIRECTORY_FAILURE: {
      // SearchIndex.length = 0;
      return {
        ...state,
        lastError: action.error,
        isIndexing: false
      };
    }
    case types.REFLECT_DELETE_ENTRY: {
      for (let i = 0; i < SearchIndex.length; i += 1) {
        if (SearchIndex[i].path === action.path) {
          SearchIndex.splice(i, 1);
          i -= 1;
        }
      }
      return state;
    }
    case types.REFLECT_CREATE_ENTRY: {
      let entryFound = false;
      for (let i = 0; i < SearchIndex.length; i += 1) {
        if (SearchIndex[i].path === action.path) {
          entryFound = true;
        }
      }
      if (entryFound) {
        return state;
      }
      SearchIndex.push(action.newEntry);
      return state;
    }
    case types.REFLECT_RENAME_ENTRY: {
      for (let i = 0; i < SearchIndex.length; i += 1) {
        if (SearchIndex[i].path === action.path) {
          SearchIndex[i].path = action.newPath;
          // thumbPath: getThumbFileLocationForFile(action.newPath), // disabled due performance concerns
          SearchIndex[i].name = extractFileName(action.newPath);
          SearchIndex[i].extension = extractFileExtension(action.newPath);
          SearchIndex[i].tags = [
            ...SearchIndex[i].tags.filter(tag => tag.type === 'sidecar'), // add only sidecar tags
            ...extractTagsAsObjects(action.newPath) // , getTagDelimiter(state))
          ];
        }
      }
      return state;
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
      for (let i = 0; i < SearchIndex.length; i += 1) {
        if (SearchIndex[i].path === action.path) {
          SearchIndex[i].tags = [
            ...SearchIndex[i].tags.filter(tag => tag.type === 'plain'),
            ...action.tags
          ];
        }
      }
      return state;
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
      for (let i = 0; i < SearchIndex.length; i += 1) {
        if (SearchIndex[i].path === action.path) {
          SearchIndex[i] = {
            ...SearchIndex[i],
            ...action.entryMeta
          };
        }
      }
      return state;
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
    getState: () => any
  ) => {
    const state = getState();
    const currentLocation: Location = getLocation(
      state,
      state.app.currentLocationId
    );
    dispatch(actions.startDirectoryIndexing());
    createDirectoryIndex(directoryPath, extractText)
      .then(() => {
        dispatch(actions.indexDirectorySuccess());
        if (Pro && Pro.Indexer) {
          // && (currentLocation.persistIndex || PlatformIO.haveObjectStoreSupport())) { // always persist on s3 stores
          Pro.Indexer.persistIndex(
            directoryPath,
            SearchIndex,
            currentLocation.type === locationType.TYPE_CLOUD
              ? '/'
              : AppConfig.dirSeparator
          );
        }
        return true;
      })
      .catch(err => {
        dispatch(actions.indexDirectoryFailure(err));
      });
  },
  loadDirectoryIndex: (directoryPath: string) => (
    dispatch: (actions: Object) => void,
    getState: () => any
  ) => {
    const state = getState();
    const currentLocation: Location = getLocation(
      state,
      state.app.currentLocationId
    );
    dispatch(actions.startDirectoryIndexing());
    dispatch(
      AppActions.showNotification(i18n.t('core:loadingIndex'), 'default', true)
    );
    if (Pro && Pro.Indexer.loadIndex) {
      Pro.Indexer.loadIndex(
        directoryPath,
        currentLocation.type === locationType.TYPE_CLOUD
          ? '/'
          : AppConfig.dirSeparator
      )
        .then(() => {
          dispatch(actions.indexDirectorySuccess());
          return true;
        })
        .catch(err => {
          dispatch(actions.indexDirectoryFailure(err));
          dispatch(
            AppActions.showNotification(
              i18n.t('core:loadingIndexFailed'),
              'warning',
              true
            )
          );
        });
    }
  },
  clearDirectoryIndex: () => ({
    type: types.INDEX_DIRECTORY_CLEAR
  }),
  searchLocationIndex: (searchQuery: SearchQuery) => (
    dispatch: (actions: Object) => void,
    getState: () => any
  ) => {
    dispatch(
      AppActions.showNotification(i18n.t('core:searching'), 'default', false)
    );
    setTimeout(() => {
      // Workaround used to show the start search notification
      Search.searchLocationIndex(
        getState().locationIndex.currentDirectoryIndex,
        searchQuery
      )
        .then(searchResults => {
          dispatch(AppActions.updateSearchResults(searchResults));
          dispatch(AppActions.hideNotifications());
          return true;
        })
        .catch(() => {
          dispatch(AppActions.updateSearchResults([]));
          dispatch(AppActions.hideNotifications());
          dispatch(
            AppActions.showNotification(
              i18n.t('core:searchingFailed'),
              'warning',
              true
            )
          );
        });
    }, 50);
  },
  indexDirectorySuccess: () => ({
    type: types.INDEX_DIRECTORY_SUCCESS
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
export const getIndexedEntriesCount = (state: any) => SearchIndex.length;
export const isIndexing = (state: any) => state.locationIndex.isIndexing;
