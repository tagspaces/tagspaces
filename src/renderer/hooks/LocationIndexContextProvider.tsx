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
import { TS } from '-/tagspaces.namespace';
import { executePromisesInBatches } from '-/services/utils-io';
import { getEnableWS } from '-/reducers/settings';
import { loadJSONString } from '@tagspaces/tagspaces-common/utils-io';
import { locationType } from '@tagspaces/tagspaces-common/misc';
import {
  getMetaIndexFilePath,
  createIndex,
} from '@tagspaces/tagspaces-indexer';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import AppConfig from '-/AppConfig';
import Search from '-/services/search';
import {
  getThumbFileLocationForDirectory,
  getThumbFileLocationForFile,
  getMetaDirectoryPath,
  joinPaths,
  cleanTrailingDirSeparator,
} from '@tagspaces/tagspaces-common/paths';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { useEditedEntryContext } from '-/hooks/useEditedEntryContext';
import { useFSWatcherContext } from '-/hooks/useFSWatcherContext';
import { CommonLocation } from '-/utils/CommonLocation';
import { Pro } from '-/pro';

type LocationIndexContextData = {
  index: TS.FileSystemEntry[];
  indexLoadedOn: number;
  isIndexing: string;
  getIndex: () => TS.FileSystemEntry[];
  cancelDirectoryIndexing: () => void;
  createLocationIndex: (location: CommonLocation) => Promise<boolean>;
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
  isIndexing: undefined,
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

  const { locations, findLocation, currentLocation, getLocationPath } =
    useCurrentLocationContext();
  const { ignoreByWatcher, deignoreByWatcher } = useFSWatcherContext();
  const { setSearchResults, appendSearchResults, updateCurrentDirEntries } =
    useDirectoryContentContext();
  const { actions } = useEditedEntryContext();
  const { showNotification, hideNotifications } = useNotificationContext();

  const enableWS = useSelector(getEnableWS);
  //const allLocations = useSelector(getLocations);

  const isIndexing = useRef<string>(undefined);
  let walking = true;
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

  function isWalking() {
    return walking;
  }

  function cancelDirectoryIndexing() {
    walking = false;
    isIndexing.current = undefined;
    forceUpdate();
  }

  function createDirectoryIndex(
    param: string | any,
    extractText = false,
    ignorePatterns: Array<string> = [],
    enableWS = true,
    isWalking = () => true,
    // disableIndexing = true,
  ): Promise<TS.FileSystemEntry[]> {
    if (isWalking()) {
      if (Pro && Pro.Watcher) {
        Pro.Watcher.stopWatching();
      }
      let directoryPath;
      let locationID;
      if (typeof param === 'object' && param !== null) {
        directoryPath = param.path;
        ({ locationID } = param);
      } else {
        directoryPath = param;
      }
      const loc = findLocation(locationID);
      const dirPath = cleanTrailingDirSeparator(directoryPath);
      if (
        enableWS &&
        !loc.haveObjectStoreSupport() &&
        !loc.haveWebDavSupport() &&
        !AppConfig.isCordova
      ) {
        // Start indexing in worker if not in the object store mode
        return loc
          .createDirectoryIndexInWorker(dirPath, extractText, ignorePatterns)
          .then((result) => {
            if (result && result.success) {
              return loadIndexFromDisk(dirPath, locationID);
            } else if (result && result.error) {
              console.error(
                'createDirectoryIndexInWorker failed:' + result.error,
              );
            } else {
              console.error(
                'createDirectoryIndexInWorker failed: unknown error',
              );
            }
            return undefined; // todo create index not in worker
          });
      }

      const mode = ['extractThumbPath'];
      if (extractText) {
        mode.push('extractTextContent');
      }
      return createIndex(
        param,
        loc.listDirectoryPromise,
        loc.loadTextFilePromise,
        mode,
        ignorePatterns,
        isWalking,
      )
        .then((directoryIndex) =>
          persistIndex(param, directoryIndex).then((success) => {
            if (success) {
              console.log('Index generated in folder: ' + directoryPath);
              return enhanceDirectoryIndex(
                directoryIndex,
                locationID,
                directoryPath,
              );
              //return enhanceDirectoryIndex(param, directoryIndex, locationID);
            }
            return undefined;
          }),
        )
        .catch((err) => {
          console.log('Error creating index: ', err);
        });
    }
  }

  function createDirectoryIndexWrapper(
    param: string | any,
    extractText = false,
    ignorePatterns: Array<string> = [],
    enableWS = true,
    // disableIndexing = true,
  ): Promise<any> {
    const indexFilePath = getMetaIndexFilePath(param.path);

    ignoreByWatcher(indexFilePath);
    return createDirectoryIndex(
      param,
      extractText,
      ignorePatterns,
      enableWS,
      isWalking,
    )
      .then((index) => {
        deignoreByWatcher(indexFilePath);
        return index;
      })
      .catch((err) => {
        //lastError.current = err;
        console.log('Error loading text content ' + err);
        return false; //switchCurrentLocationType();
      });
  }

  function createLocationIndex(location: CommonLocation): Promise<boolean> {
    if (location) {
      return getLocationPath(location).then((locationPath) => {
        const isCurrentLocation =
          currentLocation && currentLocation.uuid === location.uuid;
        isIndexing.current = location.name;
        forceUpdate();
        return createDirectoryIndexWrapper(
          { path: locationPath, locationID: location.uuid },
          location.fullTextIndex,
          location.ignorePatternPaths,
          enableWS,
        )
          .then((directoryIndex) => {
            if (isCurrentLocation) {
              // Load index only if current location
              setIndex(directoryIndex);
            }
            isIndexing.current = undefined;
            forceUpdate();
            return true;
          })
          .catch((err) => {
            isIndexing.current = undefined;
            //lastError.current = err;
            forceUpdate();
            return false;
          });
      });
    }
    return Promise.resolve(false);
  }

  async function createLocationsIndexes(extractText = true): Promise<boolean> {
    for (let location of locations) {
      try {
        const locationPath = await getLocationPath(location);
        isIndexing.current = locationPath;
        forceUpdate();
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
    isIndexing.current = undefined;
    forceUpdate();
    console.log('Resolution is complete!');
    return true;
  }

  function clearDirectoryIndex() {
    isIndexing.current = undefined;
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
    const loc = findLocation(entry.locationID);
    if (loc) {
      const thumbFilePath = entry.isFile
        ? getThumbFileLocationForFile(entry.path, loc.getDirSeparator(), false)
        : getThumbFileLocationForDirectory(entry.path, loc.getDirSeparator());
      if (thumbFilePath) {
        return loc.checkFileExist(thumbFilePath).then((exist) => {
          if (exist) {
            const thumbPath =
              loc.type === locationType.TYPE_CLOUD
                ? loc.getURLforPath(thumbFilePath)
                : thumbFilePath;
            return { ...entry, meta: { ...entry.meta, thumbPath } };
          }
          return undefined;
        });
      }
    }
    return undefined;
  }

  /*function getURLforPath(path: string, location: CommonLocation) {
    const api = objectStoreAPI.getS3Api(location);
    return api.getSignedUrl('getObject', {
      Bucket: location.bucketName,
      Key: normalizePath(path),
      Expires: 900,
    });
  }*/

  /*function checkFileExist(
    path: string,
    location: CommonLocation,
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
  }*/

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
    walking = true;
    if (!currentLocation) {
      //showNotification(t('core:pleaseOpenLocation'), 'warning', true);
      searchAllLocations(searchQuery);
      return;
    }

    const isCloudLocation = currentLocation.type === locationType.TYPE_CLOUD;
    showNotification(
      t('core:searching') + ': ' + currentLocation.name,
      'default',
      false,
      'TIDSearching',
    );
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
        const newIndex = await createDirectoryIndexWrapper(
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

    walking = true;
    //let searchResultCount = 0;
    let searchResults = [];
    let maxSearchResultReached = false;

    const result = locations.reduce(
      (accumulatorPromise, location) =>
        accumulatorPromise.then(async () => {
          // cancel search if max search result count reached
          if (searchResults.length >= searchQuery.maxSearchResults) {
            maxSearchResultReached = true;
            return Promise.resolve();
          }
          const nextPath = await getLocationPath(location);
          const isCloudLocation = location.type === locationType.TYPE_CLOUD;
          let directoryIndex = await loadIndexFromDisk(nextPath, location.uuid);
          //console.log('Searching in: ' + nextPath);
          showNotification(
            t('core:searching') + ' ' + location.name,
            'default',
            false,
            'TIDSearching',
          );

          if (
            !location.disableIndexing &&
            (!directoryIndex ||
              directoryIndex.length < 1 ||
              searchQuery.forceIndexing)
            // || (!location.disableIndexing && !indexExist)
          ) {
            console.log('Creating index for : ' + nextPath);
            directoryIndex = await createDirectoryIndexWrapper(
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
      })
      .catch((e) => {
        console.timeEnd('globalSearch');
        console.log('Global search failed!', e);
      });
  }

  /**
   * persistIndex based on location - used for S3 and cordova only
   * for native used common-platform/indexer.js -> persistIndex instead
   * @param param
   * @param directoryIndex
   */
  async function persistIndex(param: string | any, directoryIndex: any) {
    let directoryPath;
    if (typeof param === 'object' && param !== null) {
      directoryPath = param.path;
    } else {
      directoryPath = param;
    }
    const metaDirectory = getMetaDirectoryPath(directoryPath);
    const exist = await currentLocation.checkDirExist(metaDirectory);
    if (!exist) {
      await currentLocation.createDirectoryPromise(metaDirectory); // todo platformFacade?
    }
    const folderIndexPath =
      metaDirectory +
      currentLocation?.getDirSeparator() +
      AppConfig.folderIndexFile; // getMetaIndexFilePath(directoryPath);
    return currentLocation
      .saveTextFilePromise(
        { ...param, path: folderIndexPath },
        JSON.stringify(directoryIndex), // relativeIndex),
        true,
      )
      .then(() => {
        console.log(
          'Index persisted for: ' + directoryPath + ' to ' + folderIndexPath,
        );
        return true;
      })
      .catch((err) => {
        console.log('Error saving the index for ' + folderIndexPath, err);
      });
  }

  function enhanceDirectoryIndex(
    directoryIndex: TS.FileSystemEntry[],
    locationID,
    folderPath,
  ): TS.FileSystemEntry[] {
    const loc = findLocation(locationID);
    return directoryIndex.map((i: TS.FileSystemEntry) => ({
      ...i,
      locationID,
      path: joinPaths(
        loc.getDirSeparator(),
        folderPath,
        AppConfig.isWin
          ? i.path.replaceAll('/', loc.getDirSeparator())
          : i.path, //toPlatformPath()
      ),
    }));
  }

  function loadIndexFromDisk(
    folderPath: string,
    locationID: string,
  ): Promise<TS.FileSystemEntry[]> {
    const loc = findLocation(locationID);
    const folderIndexPath =
      getMetaDirectoryPath(folderPath) +
      loc.getDirSeparator() +
      AppConfig.folderIndexFile;
    return loc
      .loadTextFilePromise(folderIndexPath)
      .then((jsonContent) => {
        const directoryIndex = loadJSONString(
          jsonContent,
        ) as TS.FileSystemEntry[];
        return enhanceDirectoryIndex(directoryIndex, locationID, folderPath);
      })
      .catch((e) => {
        console.log('cannot load json:' + folderPath, e);
        return undefined;
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
  }, [currentLocation, index.current, isIndexing.current, enableWS]);

  return (
    <LocationIndexContext.Provider value={context}>
      {children}
    </LocationIndexContext.Provider>
  );
};
