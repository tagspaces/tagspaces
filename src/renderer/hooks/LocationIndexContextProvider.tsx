/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2023-present TagSpaces UG (haftungsbeschraenkt)
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

import React, {
  createContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import * as cordovaIO from '@tagspaces/tagspaces-common-cordova';
import * as objectStoreAPI from '@tagspaces/tagspaces-common-aws';
import { TS } from '-/tagspaces.namespace';
import {
  createDirectoryIndex,
  executePromisesInBatches,
  getThumbPath,
  loadIndexFromDisk,
} from '-/services/utils-io';
import { getEnableWS } from '-/reducers/settings';
import { locationType } from '@tagspaces/tagspaces-common/misc';
import PlatformIO from '-/services/platform-facade';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { getLocations } from '-/reducers/locations';
import AppConfig from '-/AppConfig';
import Search from '-/services/search';
import { getThumbFileLocationForFile } from '@tagspaces/tagspaces-common/paths';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { useEditedEntryContext } from '-/hooks/useEditedEntryContext';

type LocationIndexContextData = {
  index: TS.FileSystemEntry[];
  indexLoadedOn: number;
  isIndexing: boolean;
  getIndex: () => TS.FileSystemEntry[];
  cancelDirectoryIndexing: () => void;
  createLocationIndex: (location: TS.Location) => Promise<boolean>;
  createLocationsIndexes: (extractText?: boolean) => Promise<boolean>;
  clearDirectoryIndex: () => void;
  searchLocationIndex: (searchQuery: TS.SearchQuery) => void;
  searchAllLocations: (searchQuery: TS.SearchQuery) => void;
  setIndex: (i: TS.FileSystemEntry[]) => void;
  indexUpdateSidecarTags: (path: string, tags: Array<TS.Tag>) => void;
  reflectUpdateSidecarMeta: (path: string, entryMeta: Object) => void;
};

export const LocationIndexContext = createContext<LocationIndexContextData>({
  index: [],
  indexLoadedOn: undefined,
  isIndexing: false,
  getIndex: undefined,
  cancelDirectoryIndexing: () => {},
  createLocationIndex: () => Promise.resolve(false),
  createLocationsIndexes: () => Promise.resolve(false),
  clearDirectoryIndex: () => {},
  searchLocationIndex: () => {},
  searchAllLocations: () => {},
  setIndex: () => {},
  indexUpdateSidecarTags: () => {},
  reflectUpdateSidecarMeta: () => {},
});

export type LocationIndexContextProviderProps = {
  children: React.ReactNode;
};

export const LocationIndexContextProvider = ({
  children,
}: LocationIndexContextProviderProps) => {
  const { t } = useTranslation();

  const { currentLocation, getLocationPath } = useCurrentLocationContext();
  const { setSearchResults, appendSearchResults, updateCurrentDirEntries } =
    useDirectoryContentContext();
  const { actions } = useEditedEntryContext();
  const { showNotification, hideNotifications } = useNotificationContext();
  const { switchLocationTypeByID, switchCurrentLocationType } =
    useCurrentLocationContext();

  const enableWS = useSelector(getEnableWS);
  const allLocations = useSelector(getLocations);

  const isIndexing = useRef<boolean>(false);
  //const lastError = useRef(undefined);
  const index = useRef<TS.FileSystemEntry[]>(undefined);
  const indexLoadedOn = useRef<number>(undefined);
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  useEffect(() => {
    clearDirectoryIndex();
  }, [currentLocation]);

  useEffect(() => {
    if (actions && actions.length > 0) {
      for (const action of actions) {
        if (action.action === 'add') {
          reflectCreateEntry(action.entry);
        } else if (action.action === 'delete') {
          reflectDeleteEntry(action.entry.path);
        } else if (action.action === 'update') {
          let i = index.current.findIndex(
            (e) => e.path === action.oldEntryPath,
          );
          if (i !== -1) {
            index.current[i] = action.entry;
          }
        }
      }
    }
  }, [actions]);

  function setIndex(i) {
    index.current = i;
    if (index.current && index.current.length > 0) {
      indexLoadedOn.current = new Date().getTime();
    } else {
      indexLoadedOn.current = undefined;
    }
  }

  function getIndex() {
    return index.current;
  }

  function reflectDeleteEntry(path: string) {
    if (!index.current || index.current.length < 1) {
      return;
    }
    for (let i = 0; i < index.current.length; i += 1) {
      if (index.current[i].path === path) {
        index.current = index.current.splice(i, 1);
        i -= 1;
      }
    }
  }

  function reflectCreateEntry(newEntry: TS.FileSystemEntry) {
    if (!index.current || index.current.length < 1) {
      return;
    }
    let entryFound = index.current.some(
      (entry) => entry.path === newEntry.path,
    );
    if (!entryFound) {
      index.current.push(newEntry);
    }
    // else todo update index entry ?
  }

  function indexUpdateSidecarTags(path: string, tags: Array<TS.Tag>) {
    if (!index.current || index.current.length < 1) {
      return;
    }
    for (let i = 0; i < index.current.length; i += 1) {
      if (index.current[i].path === path) {
        index.current[i].tags = [
          ...index.current[i].tags.filter((tag) => tag.type === 'plain'),
          ...tags,
        ];
      }
    }
  }

  function reflectUpdateSidecarMeta(path: string, entryMeta: Object) {
    if (!index.current || index.current.length < 1) {
      return;
    }
    for (let i = 0; i < index.current.length; i += 1) {
      if (index.current[i].path === path) {
        index.current[i] = {
          ...index.current[i],
          ...entryMeta,
        };
      }
    }
  }

  function cancelDirectoryIndexing() {
    window.walkCanceled = true;
    isIndexing.current = false;
    forceUpdate();
  }

  function createDirIndex(
    directoryPath: string,
    extractText: boolean,
    isCurrentLocation = true,
    locationID: string = undefined,
    ignorePatterns: Array<string> = [],
  ): Promise<boolean> {
    isIndexing.current = true;
    forceUpdate();
    return createDirectoryIndexWrapper(
      { path: directoryPath, locationID },
      extractText,
      ignorePatterns,
      enableWS,
    )
      .then((directoryIndex) => {
        if (isCurrentLocation) {
          // Load index only if current location
          setIndex(directoryIndex);
        }
        isIndexing.current = false;
        forceUpdate();
        return true;
      })
      .catch((err) => {
        isIndexing.current = false;
        //lastError.current = err;
        forceUpdate();
        return false;
      });
  }

  function createLocationIndex(location: TS.Location): Promise<boolean> {
    if (location) {
      return getLocationPath(location).then((locationPath) => {
        const isCurrentLocation =
          currentLocation && currentLocation.uuid === location.uuid;
        return createDirIndex(
          locationPath,
          location.fullTextIndex,
          isCurrentLocation,
          location.uuid,
          location.ignorePatternPaths,
        )
          .then(() => true)
          .catch(() => {
            return false;
          });
      });
    }
    return Promise.resolve(false);
  }

  function createDirectoryIndexWrapper(
    param: string | any,
    extractText = false,
    ignorePatterns: Array<string> = [],
    enableWS = true,
    // disableIndexing = true,
  ): Promise<any> {
    return switchLocationTypeByID(param.locationID)
      .then(() =>
        createDirectoryIndex(param, extractText, ignorePatterns, enableWS),
      )
      .then((index) => switchCurrentLocationType().then(() => index))
      .catch((err) => {
        //lastError.current = err;
        console.warn('Error loading text content ' + err);
        return false; //switchCurrentLocationType();
      });
  }

  async function createLocationsIndexes(extractText = true): Promise<boolean> {
    isIndexing.current = true;
    forceUpdate();
    //(async () => {
    for (let location of allLocations) {
      try {
        const locationPath = await getLocationPath(location);
        await createDirectoryIndexWrapper(
          { path: locationPath, locationID: location.uuid },
          extractText,
          location.ignorePatternPaths,
          enableWS,
        );
      } catch (error) {
        console.error('An error occurred:', error);
      }
    }
    // })();
    isIndexing.current = false;
    forceUpdate();
    console.log('Resolution is complete!');
    return true;
    /*.catch((e) => {
        isIndexing.current = false;
        forceUpdate();
        console.warn('Resolution is failed!', e);
        return false;
      });*/
  }

  function clearDirectoryIndex() {
    isIndexing.current = false;
    setIndex([]);
    forceUpdate();
  }

  function normalizePath(filePath) {
    //filePath = filePath.replace(new RegExp("//+", "g"), "/");
    filePath = filePath.replace('\\', '/');
    if (filePath.indexOf('/') === 0) {
      filePath = filePath.substr(1);
    }
    return decodeURIComponent(filePath);
  }

  function enhanceSearchEntry(
    entry: TS.FileSystemEntry,
  ): Promise<TS.FileSystemEntry> {
    if (entry.isFile) {
      const loc = allLocations.find((l) => l.uuid === entry.locationID);
      if (loc) {
        const thumbFilePath = getThumbFileLocationForFile(
          entry.path,
          PlatformIO.getDirSeparator(),
          false,
        );
        /*loc.type === locationType.TYPE_CLOUD
            ? // @ts-ignore
              entry.thumbPath || (entry.meta && entry.meta.thumbPath) // todo create thumbpath for s3
            : getThumbFileLocationForFile(
                entry.path,
                PlatformIO.getDirSeparator(),
                false,
              );*/
        if (thumbFilePath) {
          return checkFileExist(thumbFilePath, loc).then((exist) => {
            if (exist) {
              const thumbPath =
                loc.type === locationType.TYPE_CLOUD
                  ? getURLforPath(thumbFilePath, loc)
                  : thumbFilePath;
              return { ...entry, meta: { ...entry.meta, thumbPath } };
            }
            return undefined;
          });
        }
      }
    }
    return undefined;
  }

  function getURLforPath(path: string, location: TS.Location) {
    const api = objectStoreAPI.getS3Api(location);
    return api.getSignedUrl('getObject', {
      Bucket: location.bucketName,
      Key: normalizePath(path),
      Expires: 900,
    });
  }

  function checkFileExist(
    path: string,
    location: TS.Location,
  ): Promise<boolean> {
    if (location.type === locationType.TYPE_LOCAL) {
      return window.electronIO.ipcRenderer.invoke('checkFileExist', path);
    } else if (location.type === locationType.TYPE_CLOUD) {
      const api = objectStoreAPI.getS3Api(location);
      return api
        .headObject({
          Bucket: location.bucketName,
          Key: normalizePath(path),
        })
        .promise()
        .then(
          () => true,
          (err) => false,
        );
    } else if (location.type === locationType.TYPE_WEBDAV) {
      // TODO
    } else if (AppConfig.isCordova) {
      return cordovaIO.checkFileExist(path);
    }
  }

  function enhanceSearchEntries(entries: TS.FileSystemEntry[]) {
    const promises: Promise<TS.FileSystemEntry>[] = entries.map(
      (entry: TS.FileSystemEntry) => enhanceSearchEntry(entry),
    );
    executePromisesInBatches(promises).then((entriesEnhanced) => {
      updateCurrentDirEntries(entriesEnhanced, false);
    });
  }

  function getSearchResults(
    searchIndex: TS.FileSystemEntry[],
    searchQuery: TS.SearchQuery,
    //isCloudLocation: boolean,
  ): Promise<TS.FileSystemEntry[]> {
    return Search.searchLocationIndex(searchIndex, searchQuery)
      .then((searchResults) => {
        //enhanceSearchEntries(searchResults);
        return searchResults;
      })
      .catch((err) => {
        // dispatch(AppActions.hideNotifications());
        console.log('Searching Index failed: ', err);
        showNotification(
          t('core:searchingFailed') + ' ' + err.message,
          'warning',
          true,
        );
        return [];
      });
  }

  function searchLocationIndex(searchQuery: TS.SearchQuery) {
    window.walkCanceled = false;
    if (!currentLocation) {
      //showNotification(t('core:pleaseOpenLocation'), 'warning', true);
      searchAllLocations(searchQuery);
      return;
    }

    const isCloudLocation = currentLocation.type === locationType.TYPE_CLOUD;
    showNotification(t('core:searching'), 'default', false, 'TIDSearching');
    setTimeout(async () => {
      const currentPath = await getLocationPath(currentLocation);
      let directoryIndex = getIndex();
      if (!directoryIndex || directoryIndex.length < 1) {
        directoryIndex = await loadIndexFromDisk(
          currentPath,
          currentLocation.uuid,
        );
        setIndex(directoryIndex);
      }
      // Workaround used to show the start search notification
      const currentTime = new Date().getTime();
      const indexAge = indexLoadedOn.current
        ? currentTime - indexLoadedOn.current
        : 0;
      const maxIndexAge = currentLocation.maxIndexAge
        ? currentLocation.maxIndexAge
        : AppConfig.maxIndexAge;

      if (
        searchQuery.forceIndexing ||
        (!currentLocation.disableIndexing &&
          (!directoryIndex ||
            directoryIndex.length < 1 ||
            indexAge > maxIndexAge))
      ) {
        console.log('Start creating index for : ' + currentPath);
        const newIndex = await createDirectoryIndex(
          {
            path: currentPath,
            locationID: currentLocation.uuid,
            ...(isCloudLocation && { bucketName: currentLocation.bucketName }),
          },
          currentLocation.fullTextIndex,
          currentLocation.ignorePatternPaths,
          enableWS,
        );
        setIndex(newIndex);
      }
      getSearchResults(getIndex(), searchQuery).then((results) => {
        setSearchResults(results);
        enhanceSearchEntries(results);
      });

      hideNotifications();
    }, 50);
  }

  function searchAllLocations(searchQuery: TS.SearchQuery) {
    console.time('globalSearch');
    setSearchResults([]);
    showNotification(t('core:searching'), 'default', false, 'TIDSearching');

    // Preparing for global search
    // setSearchResults([]);
    /*if (currentLocation && currentLocation.type === locationType.TYPE_CLOUD) {
      PlatformIO.disableObjectStoreSupport();
    }*/
    window.walkCanceled = false;
    //let searchResultCount = 0;
    let searchResults = [];
    let maxSearchResultReached = false;

    const result = allLocations.reduce(
      (accumulatorPromise, location) =>
        accumulatorPromise.then(async () => {
          // cancel search if max search result count reached
          if (searchResults.length >= searchQuery.maxSearchResults) {
            maxSearchResultReached = true;
            return Promise.resolve();
          }
          const nextPath = await getLocationPath(location);
          const isCloudLocation = location.type === locationType.TYPE_CLOUD;
          await switchLocationTypeByID(location.uuid);
          let directoryIndex = await loadIndexFromDisk(nextPath, location.uuid);
          //console.log('Searching in: ' + nextPath);
          showNotification(
            t('core:searching') + ' ' + location.name,
            'default',
            false,
            'TIDSearching',
          );

          /*const folderIndexPath =
            getMetaDirectoryPath(nextPath) +
            PlatformIO.getDirSeparator() +
            AppConfig.folderIndexFile;
          const indexExist = await PlatformIO.checkFileExist(folderIndexPath);*/

          if (
            !location.disableIndexing &&
            (!directoryIndex ||
              directoryIndex.length < 1 ||
              searchQuery.forceIndexing)
            // || (!location.disableIndexing && !indexExist)
          ) {
            console.log('Creating index for : ' + nextPath);
            directoryIndex = await createDirectoryIndex(
              {
                path: nextPath,
                locationID: location.uuid,
                ...(isCloudLocation && { bucketName: location.bucketName }),
              },
              location.fullTextIndex,
              location.ignorePatternPaths,
              enableWS,
            );
          }
          return getSearchResults(directoryIndex, searchQuery).then(
            (results) => {
              //searchResultCount += results.length;
              if (results.length > 0) {
                searchResults = [...searchResults, ...results];
                appendSearchResults(results);
              }
              //hideNotifications();
              return true;
            },
          );
          /*return Search.searchLocationIndex(directoryIndex, searchQuery)
            .then((searchResults: Array<TS.FileSystemEntry>) => {
              let enhancedSearchResult = searchResults;
              if (isCloudLocation) {
                enhancedSearchResult = searchResults
                  // Excluding s3 folders from global search
                  .filter((entry) => entry && entry.isFile)
                  .map((entry: TS.FileSystemEntry) => {
                    const cleanedPath = entry.path.startsWith('/')
                      ? entry.path.substr(1)
                      : entry.path;
                    const url = PlatformIO.getURLforPath(cleanedPath);
                    let thumbPath;
                    if (
                      entry.meta &&
                      entry.meta.thumbPath &&
                      entry.meta.thumbPath.length > 1 &&
                      !entry.meta.thumbPath.startsWith('http')
                    ) {
                      thumbPath = PlatformIO.getURLforPath(
                        entry.meta.thumbPath,
                      );
                    }
                    return { ...entry, url, thumbPath };
                  });
              }

              searchResultCount += enhancedSearchResult.length;
              appendSearchResults(enhancedSearchResult);
              hideNotifications();
              /!*if (isCloudLocation) {
                PlatformIO.disableObjectStoreSupport();
              }*!/
              return true;
            })
            .catch((e) => {
              /!*if (isCloudLocation) {
                PlatformIO.disableObjectStoreSupport();
              }*!/
              console.log('Searching Index failed: ', e);
              setSearchResults([]);
              // dispatch(AppActions.hideNotifications());
              showNotification(
                t('core:searchingFailed') + ' ' + e.message,
                'warning',
                true,
              );
            });*/
        }),
      Promise.resolve(),
    );

    result
      .then(() => {
        enhanceSearchEntries(searchResults);
        console.timeEnd('globalSearch');
        if (maxSearchResultReached) {
          showNotification(
            'Global search finished, reaching the max. search results. The first ' +
              searchResults.length +
              ' entries are listed.',
            'default',
            true,
          );
        } else {
          showNotification(t('Global search completed'), 'default', true);
        }
        console.log('Global search completed!');
        return switchCurrentLocationType();
      })
      .catch((e) => {
        /*if (
          currentLocation &&
          currentLocation.type === locationType.TYPE_CLOUD
        ) {
          PlatformIO.enableObjectStoreSupport(currentLocation);
        }*/
        console.timeEnd('globalSearch');
        console.warn('Global search failed!', e);
      });
  }

  const context = useMemo(() => {
    return {
      index: index.current,
      indexLoadedOn: indexLoadedOn.current,
      isIndexing: isIndexing.current,
      cancelDirectoryIndexing,
      createLocationIndex,
      createLocationsIndexes,
      clearDirectoryIndex,
      searchLocationIndex,
      searchAllLocations,
      setIndex,
      getIndex,
      //reflectDeleteEntry,
      //reflectDeleteEntries,
      //reflectCreateEntry,
      //reflectRenameEntry,
      indexUpdateSidecarTags,
      reflectUpdateSidecarMeta,
    };
  }, [currentLocation, index.current, isIndexing.current]);

  return (
    <LocationIndexContext.Provider value={context}>
      {children}
    </LocationIndexContext.Provider>
  );
};
