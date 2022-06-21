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

import { loadIndex, hasIndex } from '@tagspaces/tagspaces-platforms/indexer';
import { getLocation, getLocationByPath, getLocations } from './locations';
import { createDirectoryIndex } from '-/services/utils-io';
import {
  extractFileExtension,
  extractFileName,
  extractTagsAsObjects,
  getLocationPath,
  getThumbFileLocationForFile
} from '-/utils/paths';
import Search from '../services/search';
import { actions as AppActions } from './app';
import i18n from '../services/i18n';
import PlatformIO from '../services/platform-facade';
import GlobalSearch from '../services/search-index';
import AppConfig from '-/config';
import { TS } from '-/tagspaces.namespace';
import { locationType } from '-/utils/misc';

export const types = {
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
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
  isIndexing: false,
  searchQuery: {}
};

export default (state: any = initialState, action: any) => {
  switch (action.type) {
    case types.SET_SEARCH_QUERY: {
      return { ...state, searchQuery: action.searchQuery };
    }
    case types.INDEX_DIRECTORY_START: {
      return {
        ...state,
        isIndexing: true
      };
    }
    case types.INDEX_DIRECTORY_CLEAR: {
      // GlobalSearch.index.length = 0;
      GlobalSearch.index.splice(0, GlobalSearch.index.length);
      GlobalSearch.indexLoadedOn = undefined;
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
      // GlobalSearch.index.length = 0;
      return {
        ...state,
        lastError: action.error,
        isIndexing: false
      };
    }
    case types.REFLECT_DELETE_ENTRY: {
      if (GlobalSearch.index.length < 1) {
        return state;
      }
      for (let i = 0; i < GlobalSearch.index.length; i += 1) {
        if (GlobalSearch.index[i].path === action.path) {
          GlobalSearch.index.splice(i, 1);
          i -= 1;
        }
      }
      return state;
    }
    case types.REFLECT_CREATE_ENTRY: {
      if (GlobalSearch.index.length < 1) {
        return state;
      }
      let entryFound = false;
      for (let i = 0; i < GlobalSearch.index.length; i += 1) {
        if (GlobalSearch.index[i].path === action.path) {
          entryFound = true;
        }
      }
      if (entryFound) {
        return state;
      }
      GlobalSearch.index.push(action.newEntry);
      return state;
    }
    case types.REFLECT_RENAME_ENTRY: {
      if (GlobalSearch.index.length < 1) {
        return state;
      }
      for (let i = 0; i < GlobalSearch.index.length; i += 1) {
        if (GlobalSearch.index[i].path === action.path) {
          GlobalSearch.index[i].path = action.newPath;
          GlobalSearch.index[i].name = extractFileName(
            action.newPath,
            PlatformIO.getDirSeparator()
          );
          GlobalSearch.index[i].extension = extractFileExtension(
            action.newPath,
            PlatformIO.getDirSeparator()
          );
          GlobalSearch.index[i].tags = [
            ...GlobalSearch.index[i].tags.filter(tag => tag.type === 'sidecar'), // add only sidecar tags
            ...extractTagsAsObjects(
              action.newPath,
              AppConfig.tagDelimiter,
              PlatformIO.getDirSeparator()
            )
          ];
        }
      }
      return state;
    }
    case types.REFLECT_UPDATE_SIDECARTAGS: {
      for (let i = 0; i < GlobalSearch.index.length; i += 1) {
        if (GlobalSearch.index[i].path === action.path) {
          GlobalSearch.index[i].tags = [
            ...GlobalSearch.index[i].tags.filter(tag => tag.type === 'plain'),
            ...action.tags
          ];
        }
      }
      return state;
    }
    case types.REFLECT_UPDATE_SIDECARMETA: {
      for (let i = 0; i < GlobalSearch.index.length; i += 1) {
        if (GlobalSearch.index[i].path === action.path) {
          GlobalSearch.index[i] = {
            ...GlobalSearch.index[i],
            ...action.entryMeta
          };
        }
      }
      return state;
    }
    default: {
      return state;
    }
  }
};

export const actions = {
  setSearchQuery: (searchQuery: TS.SearchQuery) => ({
    type: types.SET_SEARCH_QUERY,
    searchQuery
  }),
  startDirectoryIndexing: () => ({ type: types.INDEX_DIRECTORY_START }),
  cancelDirectoryIndexing: () => ({ type: types.INDEX_DIRECTORY_CANCEL }),
  createDirectoryIndex: (
    directoryPath: string,
    extractText: boolean,
    isCurrentLocation: boolean = true,
    locationID: string = undefined,
    ignorePatterns: Array<string> = []
  ) => (dispatch: (actions: Object) => void, getState: () => any) => {
    const { settings } = getState();
    dispatch(actions.startDirectoryIndexing());
    createDirectoryIndex(
      { path: directoryPath, locationID },
      extractText,
      ignorePatterns,
      settings.enableWS
    )
      .then(directoryIndex => {
        if (isCurrentLocation) {
          // Load index only if current location
          GlobalSearch.index = directoryIndex;
        }
        dispatch(actions.indexDirectorySuccess());
        /* if (Pro && Pro.Indexer) {
          Pro.Indexer.persistIndex(
            directoryPath,
            directoryIndex,
            PlatformIO.getDirSeparator()
          );
        } */
        return true;
      })
      .catch(err => {
        dispatch(actions.indexDirectoryFailure(err));
      });
  },
  createLocationIndex: (location: TS.Location) => (
    dispatch: (actions: Object) => void,
    getState: () => any
  ) => {
    if (location) {
      const { currentLocationId } = getState().app;
      const isCurrentLocation = currentLocationId === location.uuid;
      if (location.type === locationType.TYPE_CLOUD) {
        PlatformIO.enableObjectStoreSupport(location)
          .then(() => {
            dispatch(
              actions.createDirectoryIndex(
                getLocationPath(location),
                location.fullTextIndex,
                isCurrentLocation,
                location.uuid
              )
            );
            return true;
          })
          .catch(() => {
            PlatformIO.disableObjectStoreSupport();
          });
      } else if (location.type === locationType.TYPE_LOCAL) {
        PlatformIO.disableObjectStoreSupport();
        dispatch(
          actions.createDirectoryIndex(
            getLocationPath(location),
            location.fullTextIndex,
            isCurrentLocation,
            location.uuid
          )
        );
      }
    }
  },
  createLocationsIndexes: (extractText: boolean = true) => (
    dispatch: (actions: Object) => void,
    getState: () => any
  ) => {
    const state = getState();
    dispatch(actions.startDirectoryIndexing());
    const allLocations = getLocations(state);

    const promises = allLocations.map((location: TS.Location) => {
      const nextPath = getLocationPath(location);
      return (
        createDirectoryIndex(
          { path: nextPath, location: location.uuid },
          extractText,
          location.ignorePatternPaths,
          state.settings.enableWS
        )
          /* .then(directoryIndex => {
          if (Pro && Pro.Indexer) {
            Pro.Indexer.persistIndex(
              nextPath,
              directoryIndex,
              PlatformIO.getDirSeparator()
            );
          }
          return true;
        }) */
          .catch(err => {
            dispatch(actions.indexDirectoryFailure(err));
          })
      );
    });

    Promise.all(promises)
      .then(e => {
        dispatch(actions.indexDirectorySuccess());
        console.log('Resolution is complete!', e);
        return true;
      })
      .catch(e => {
        console.warn('Resolution is faled!', e);
      });
  },
  clearDirectoryIndex: () => ({
    type: types.INDEX_DIRECTORY_CLEAR
  }),
  searchLocationIndex: (searchQuery: TS.SearchQuery) => (
    dispatch: (actions: Object) => void,
    getState: () => any
  ) => {
    const state = getState();
    let currentLocation: TS.Location = getLocation(
      state,
      state.app.currentLocationId
    );
    window.walkCanceled = false;
    if (!currentLocation) {
      if (searchQuery.currentDirectory) {
        currentLocation = getLocationByPath(
          state,
          searchQuery.currentDirectory
        );
      }
    }
    if (!currentLocation) {
      dispatch(
        AppActions.showNotification(
          i18n.t('core:pleaseOpenLocation'),
          'warning',
          true
        )
      );
      return;
    }

    const isCloudLocation = currentLocation.type === locationType.TYPE_CLOUD;
    dispatch(
      AppActions.showNotification(
        i18n.t('core:searching'),
        'default',
        false,
        'TIDSearching'
      )
    );
    setTimeout(async () => {
      // Workaround used to show the start search notification
      const currentTime = new Date().getTime();
      const indexAge = GlobalSearch.indexLoadedOn
        ? currentTime - GlobalSearch.indexLoadedOn
        : 0;
      const maxIndexAge = currentLocation.maxIndexAge
        ? currentLocation.maxIndexAge
        : AppConfig.maxIndexAge;
      if (
        searchQuery.forceIndexing ||
        (!currentLocation.disableIndexing &&
          (!GlobalSearch.index ||
            GlobalSearch.index.length < 1 ||
            indexAge > maxIndexAge))
      ) {
        const currentPath = getLocationPath(currentLocation);
        console.log('Start creating index for : ' + currentPath);
        GlobalSearch.index = await createDirectoryIndex(
          {
            path: currentPath,
            locationID: currentLocation.uuid,
            ...(isCloudLocation && { bucketName: currentLocation.bucketName })
          },
          currentLocation.fullTextIndex,
          currentLocation.ignorePatternPaths,
          state.settings.enableWS
        );

        if (GlobalSearch.index && GlobalSearch.index.length > 0) {
          GlobalSearch.indexLoadedOn = new Date().getTime();
        }
      } else if (
        isCloudLocation ||
        !GlobalSearch.index ||
        GlobalSearch.index.length === 0
      ) {
        GlobalSearch.index = await loadIndex(
          {
            path: getLocationPath(currentLocation),
            locationID: currentLocation.uuid,
            ...(isCloudLocation && { bucketName: currentLocation.bucketName })
          },
          PlatformIO.getDirSeparator(),
          PlatformIO.loadTextFilePromise
        );
      }
      Search.searchLocationIndex(GlobalSearch.index, searchQuery)
        .then(searchResults => {
          if (isCloudLocation) {
            searchResults.forEach((entry: TS.FileSystemEntry) => {
              if (
                entry.thumbPath &&
                entry.thumbPath.length > 1
                // !entry.thumbPath.startsWith('http')
              ) {
                const thumbPath = entry.path.startsWith('/')
                  ? entry.path.substring(1)
                  : entry.path;
                // eslint-disable-next-line no-param-reassign
                entry.thumbPath = PlatformIO.getURLforPath(
                  getThumbFileLocationForFile(
                    thumbPath,
                    PlatformIO.getDirSeparator()
                  )
                );
              }
            });
          }
          dispatch(AppActions.setSearchResults(searchResults));
          dispatch(AppActions.hideNotifications());
          return true;
        })
        .catch(err => {
          dispatch(AppActions.setSearchResults([]));
          // dispatch(AppActions.hideNotifications());
          console.error('Searching Index failed: ', err);
          dispatch(
            AppActions.showNotification(
              i18n.t('core:searchingFailed') + ' ' + err.message,
              'warning',
              true
            )
          );
        });
    }, 50);
  },
  searchAllLocations: (searchQuery: TS.SearchQuery) => (
    dispatch: (actions: Object) => void,
    getState: () => any
  ) => {
    const state = getState();
    const currentLocation: TS.Location = getLocation(
      state,
      state.app.currentLocationId
    );
    console.time('globalSearch');
    dispatch(
      AppActions.showNotification(
        i18n.t('core:searching'),
        'default',
        false,
        'TIDSearching'
      )
    );

    // Preparing for global search
    dispatch(AppActions.setSearchResults([]));
    if (currentLocation && currentLocation.type === locationType.TYPE_CLOUD) {
      PlatformIO.disableObjectStoreSupport();
    }
    window.walkCanceled = false;
    const allLocations = getLocations(state);
    let searchResultCount = 0;
    let maxSearchResultReached = false;

    const result = allLocations.reduce(
      (accumulatorPromise, location) =>
        accumulatorPromise.then(async () => {
          // cancel search if max search result count reached
          if (searchResultCount >= searchQuery.maxSearchResults) {
            maxSearchResultReached = true;
            return Promise.resolve();
          }
          const nextPath = getLocationPath(location);
          let directoryIndex = [];
          let indexExist = false;
          const isCloudLocation = location.type === locationType.TYPE_CLOUD;
          console.log('Searching in: ' + nextPath);
          dispatch(
            AppActions.showNotification(
              i18n.t('core:searching') + ' ' + location.name,
              'default',
              true,
              'TIDSearching'
            )
          );
          if (isCloudLocation) {
            await PlatformIO.enableObjectStoreSupport(location);
          }
          // if (Pro && Pro.Indexer && Pro.Indexer.hasIndex) {
          indexExist = await hasIndex(
            nextPath,
            PlatformIO.getPropertiesPromise
          ); // , PlatformIO.getDirSeparator());

          if (
            searchQuery.forceIndexing ||
            (!location.disableIndexing && !indexExist)
          ) {
            console.log('Creating index for : ' + nextPath);
            directoryIndex = await createDirectoryIndex(
              {
                path: nextPath,
                locationID: location.uuid,
                ...(isCloudLocation && { bucketName: location.bucketName })
              },
              location.fullTextIndex,
              location.ignorePatternPaths,
              state.settings.enableWS
            );
            /* if (Pro && Pro.Indexer && Pro.Indexer.persistIndex) {
              Pro.Indexer.persistIndex(
                nextPath,
                directoryIndex,
                PlatformIO.getDirSeparator()
              );
            } */
          } else {
            // if (Pro && Pro.Indexer && Pro.Indexer.loadIndex) {
            console.log('Loading index for : ' + nextPath);
            directoryIndex = await loadIndex(
              {
                path: nextPath,
                locationID: location.uuid,
                ...(isCloudLocation && {
                  bucketName: currentLocation.bucketName
                })
              },
              PlatformIO.getDirSeparator(),
              PlatformIO.loadTextFilePromise
            );
          }
          return Search.searchLocationIndex(directoryIndex, searchQuery)
            .then((searchResults: Array<TS.FileSystemEntry>) => {
              let enhancedSearchResult = searchResults;
              if (isCloudLocation) {
                enhancedSearchResult = searchResults
                  // Excluding s3 folders from global search
                  .filter(entry => entry && entry.isFile)
                  .map((entry: TS.FileSystemEntry) => {
                    const cleanedPath = entry.path.startsWith('/')
                      ? entry.path.substr(1)
                      : entry.path;
                    const url = PlatformIO.getURLforPath(cleanedPath);
                    let thumbPath;
                    if (
                      entry.thumbPath &&
                      entry.thumbPath.length > 1 &&
                      !entry.thumbPath.startsWith('http')
                    ) {
                      thumbPath = PlatformIO.getURLforPath(entry.thumbPath);
                    }
                    return { ...entry, url, thumbPath };
                  });
              }

              searchResultCount += enhancedSearchResult.length;
              dispatch(AppActions.appendSearchResults(enhancedSearchResult));
              dispatch(AppActions.hideNotifications());
              if (isCloudLocation) {
                PlatformIO.disableObjectStoreSupport();
              }
              return true;
            })
            .catch(e => {
              if (isCloudLocation) {
                PlatformIO.disableObjectStoreSupport();
              }
              console.error('Searching Index failed: ', e);
              dispatch(AppActions.setSearchResults([]));
              // dispatch(AppActions.hideNotifications());
              dispatch(
                AppActions.showNotification(
                  i18n.t('core:searchingFailed') + ' ' + e.message,
                  'warning',
                  true
                )
              );
            });
        }),
      Promise.resolve()
    );

    result
      .then(() => {
        console.timeEnd('globalSearch');
        if (maxSearchResultReached) {
          dispatch(
            AppActions.showNotification(
              'Global search finished, reaching the max. search results. The first ' +
                searchResultCount +
                ' entries are listed.',
              'default',
              true
            )
          );
        } else {
          dispatch(
            AppActions.showNotification(
              i18n.t('Global search completed'),
              'default',
              true
            )
          );
        }
        console.log('Global search completed!');
        if (
          currentLocation &&
          currentLocation.type === locationType.TYPE_CLOUD
        ) {
          PlatformIO.enableObjectStoreSupport(currentLocation);
        }
        return true;
      })
      .catch(e => {
        if (
          currentLocation &&
          currentLocation.type === locationType.TYPE_CLOUD
        ) {
          PlatformIO.enableObjectStoreSupport(currentLocation);
        }
        console.timeEnd('globalSearch');
        console.warn('Global search failed!', e);
      });
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
  reflectUpdateSidecarTags: (path: string, tags: Array<TS.Tag>) => ({
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
export const getIndexedEntriesCount = (state: any) =>
  GlobalSearch.index ? GlobalSearch.index.length : 0;
export const isIndexing = (state: any) => state.locationIndex.isIndexing;
export const getSearchQuery = (state: any) => state.locationIndex.searchQuery;
