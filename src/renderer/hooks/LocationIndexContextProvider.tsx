/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2023-present TagSpaces GmbH
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
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useEditedEntryContext } from '-/hooks/useEditedEntryContext';
import { useFSWatcherContext } from '-/hooks/useFSWatcherContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { Pro } from '-/pro';
import { getEnableWS, getTagDelimiter } from '-/reducers/settings';
import Search from '-/services/search';
import {
  executePromisesInBatches,
  isWorkerAvailable,
} from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import { CommonLocation } from '-/utils/CommonLocation';
import useFirstRender from '-/utils/useFirstRender';
import { locationType } from '@tagspaces/tagspaces-common/misc';
import {
  cleanTrailingDirSeparator,
  getMetaDirectoryPath,
  getThumbFileLocationForDirectory,
  getThumbFileLocationForFile,
  joinPaths,
} from '@tagspaces/tagspaces-common/paths';
import { loadJSONString } from '@tagspaces/tagspaces-common/utils-io';
import {
  createIndex,
  getMetaIndexFilePath,
} from '@tagspaces/tagspaces-indexer';
import React, { createContext, useEffect, useReducer, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

type LocationIndexContextData = {
  //index: TS.FileSystemEntry[];
  indexLoadedOn: number;
  isIndexing: string;
  getIndex: () => TS.FileSystemEntry[];
  getLastIndex: (locationId: string) => Promise<TS.FileSystemEntry[]>;
  cancelDirectoryIndexing: (locationId: string) => void;
  createLocationIndex: (
    location: CommonLocation,
    force?: boolean,
  ) => Promise<boolean>;
  createLocationsIndexes: (
    extractText?: boolean,
    workSpace?: TS.WorkSpace,
  ) => Promise<boolean>;
  clearDirectoryIndex: (persist?: boolean) => void;
  searchLocationIndex: (searchQuery: TS.SearchQuery) => void;
  searchAllLocations: (
    searchQuery: TS.SearchQuery,
    workSpace?: TS.WorkSpace,
  ) => void;
  setIndex: (i: TS.FileSystemEntry[], location?: CommonLocation) => void;
  //indexUpdateSidecarTags: (path: string, tags: Array<TS.Tag>) => void;
  reflectUpdateSidecarMeta: (path: string, entryMeta: Object) => void;
  findLinks: (
    link: string,
    locationId: string,
  ) => Promise<TS.FileSystemEntry[]>;
  checkIndexExist: (locationId: string) => Promise<boolean>;
};

export const LocationIndexContext = createContext<LocationIndexContextData>({
  //index: [],
  indexLoadedOn: undefined,
  isIndexing: undefined,
  getIndex: undefined,
  getLastIndex: undefined,
  cancelDirectoryIndexing: undefined,
  createLocationIndex: () => Promise.resolve(false),
  createLocationsIndexes: () => Promise.resolve(false),
  clearDirectoryIndex: () => {},
  searchLocationIndex: () => {},
  searchAllLocations: () => {},
  setIndex: () => {},
  findLinks: undefined,
  checkIndexExist: undefined,
  reflectUpdateSidecarMeta: () => {},
});

export type LocationIndexContextProviderProps = {
  children: React.ReactNode;
};

export const LocationIndexContextProvider = ({
  children,
}: LocationIndexContextProviderProps) => {
  const { t } = useTranslation();

  const {
    locations,
    findLocation,
    currentLocationId,
    currentLocation,
    getLocationPath,
  } = useCurrentLocationContext();
  const { ignoreByWatcher, deignoreByWatcher } = useFSWatcherContext();
  const { setSearchResults, appendSearchResults, updateCurrentDirEntries } =
    useDirectoryContentContext();
  const { actions } = useEditedEntryContext();
  const { showNotification, hideNotifications, openConfirmDialog } =
    useNotificationContext();

  const enableWS = useSelector(getEnableWS);
  const tagDelimiter: string = useSelector(getTagDelimiter);
  //const allLocations = useSelector(getLocations);

  const isIndexing = useRef<string>(undefined);
  const walkingRef = useRef(true);
  //const lastError = useRef(undefined);
  const index = useRef<TS.FileSystemEntry[]>(undefined);
  const indexLoadedOn = useRef<number>(undefined);
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);
  const firstRender = useFirstRender();
  const maxIndexAge = useRef<number>(getMaxIndexAge(currentLocation));
  const prevLocationId = useRef<string>(currentLocationId);

  useEffect(() => {
    if (currentLocationId) {
      clearDirectoryIndex(false);
      maxIndexAge.current = getMaxIndexAge(findLocation());
    }
    if (AppConfig.isElectron && prevLocationId.current !== currentLocationId) {
      if (prevLocationId.current) {
        window.electronIO.ipcRenderer.sendMessage(
          'cancelRequest',
          prevLocationId.current,
        );
      }
      prevLocationId.current = currentLocationId;
    }
  }, [currentLocationId]);

  useEffect(() => {
    if (!firstRender && actions && actions.length > 0) {
      for (const action of actions) {
        if (action.action === 'add') {
          reflectCreateEntry(action.entry);
        } else if (action.action === 'delete') {
          reflectDeleteEntry(action.entry.path);
        } else if (action.action === 'update') {
          reflectUpdateEntry(action.oldEntryPath, action.entry);
          /*let i = index.current.findIndex(
            (e) => e.path === action.oldEntryPath,
          );
          if (i !== -1) {
            index.current[i] = action.entry;
          }*/
        }
      }
    }
  }, [actions]);

  function getMaxIndexAge(location) {
    return location && location.maxIndexAge
      ? location.maxIndexAge
      : AppConfig.maxIndexAge;
  }
  function setIndex(i, location: CommonLocation = undefined) {
    index.current = i;
    if (index.current && index.current.length > 0) {
      indexLoadedOn.current = new Date().getTime();
    } else {
      indexLoadedOn.current = undefined;
    }
    if (location) {
      persistIndex(
        { path: location.path, locationID: location.uuid },
        index.current,
      ).then(() => {
        console.log('index persisted');
      });
    }
  }

  function getIndex() {
    return index.current;
  }

  function indexExpired() {
    const currentTime = new Date().getTime();
    const indexAge = indexLoadedOn.current
      ? currentTime - indexLoadedOn.current
      : 0;

    return indexAge > maxIndexAge.current;
  }

  async function checkIndexExist(locationId: string): Promise<boolean> {
    if (index.current === undefined || indexExpired()) {
      const location = findLocation(locationId);
      const locationPath = await getLocationPath(location);
      const directoryIndex = await loadIndexFromDisk(
        locationPath,
        location.uuid,
      );
      if (directoryIndex) {
        // index is up to date
        setIndex(directoryIndex, location);
        return true;
      }
    }
    return Promise.resolve(index.current !== undefined);
  }

  async function getLastIndex(
    locationId: string,
  ): Promise<TS.FileSystemEntry[]> {
    if (!index.current || index.current.length < 1 || indexExpired()) {
      const location = findLocation(locationId);
      const locationPath = await getLocationPath(location);
      const directoryIndex = await loadIndexFromDisk(
        locationPath,
        location.uuid,
      );
      if (directoryIndex) {
        return directoryIndex;
        //setIndex(directoryIndex, location);
      } else {
        await createLocationIndex(location);
      }
    }

    return index.current;
  }

  function reflectDeleteEntry(path: string) {
    if (!index.current || index.current.length < 1) {
      return;
    }
    for (let i = 0; i < index.current.length; i += 1) {
      if (index.current[i].path === path) {
        setIndex(index.current.splice(i, 1), currentLocation);
        //i -= 1;
        break;
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
      setIndex([...index.current, newEntry], currentLocation);
      //index.current.push(newEntry);
    }
    // else todo update index entry ?
  }

  function reflectUpdateEntry(path: string, newEntry: TS.FileSystemEntry) {
    if (!index.current || index.current.length < 1) {
      return;
    }
    if (index.current.some((i) => i.path === path)) {
      setIndex(
        index.current.map((i) => {
          if (i.path === path) {
            return newEntry;
          }
          return i;
        }),
        currentLocation,
      );
    }
  }

  async function findLinks(
    entryID: string,
    locationId: string,
  ): Promise<TS.FileSystemEntry[]> {
    const lastIndex = await getLastIndex(locationId);
    const foundEntriesLinkingToId = [];
    if (!lastIndex || lastIndex.length < 1) {
      return foundEntriesLinkingToId;
    }
    lastIndex.forEach((entry) =>
      entry.links?.some((link) => {
        if (link.type === 'tslink') {
          try {
            const validLink = new URL(link.href);
            const tseid = validLink.searchParams.get('tseid');
            if (entryID === tseid) {
              foundEntriesLinkingToId.push(entry);
            }
          } catch (e) {
            console.log('Link not valid: ' + link.href);
          }
        }
      }),
    );
    return foundEntriesLinkingToId;
  }

  /*function indexUpdateSidecarTags(path: string, tags: Array<TS.Tag>) {
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
  }*/

  function reflectUpdateSidecarMeta(path: string, entryMeta: Object) {
    if (!index.current || index.current.length < 1) {
      return;
    }
    setIndex(
      index.current.map((i) => {
        if (i.path === path) {
          return {
            ...i,
            meta: { ...(i.meta && i.meta), ...entryMeta },
          };
        }
        return i;
      }),
      currentLocation,
    );
    /*for (let i = 0; i < index.current.length; i += 1) {
      if (index.current[i].path === path) {
        index.current[i] = {
          ...index.current[i],
          meta: {...(index.current[i].meta && index.current[i].meta), ...entryMeta},
        };
      }
    }*/
  }

  function isWalking() {
    return walkingRef.current;
  }

  function cancelDirectoryIndexing(locationId: string) {
    if (locationId) {
      window.electronIO.ipcRenderer.sendMessage('cancelRequest', locationId);
      walkingRef.current = false;
      isIndexing.current = undefined;
      forceUpdate();
    }
  }

  function createDirectoryIndex(
    param: any,
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
      return isWorkerAvailable().then((isWorkerAvailable) => {
        const loc = findLocation(param.locationID);
        const dirPath = cleanTrailingDirSeparator(param.path);
        if (
          isWorkerAvailable &&
          enableWS &&
          !loc.haveObjectStoreSupport() &&
          !loc.haveWebDavSupport() &&
          !AppConfig.isCordova
        ) {
          // Start indexing in worker if not in the object store mode
          return loc
            .createDirectoryIndexInWorker(
              dirPath,
              extractText,
              !!loc.extractLinks,
              ignorePatterns,
              loc.uuid,
            )
            .then((result) => {
              if (result && result.success) {
                return loadIndexFromDisk(dirPath, param.locationID);
              } else if (result && result.error) {
                if (result.error === 'AbortError') {
                  return undefined;
                }
                console.error(
                  'createDirectoryIndexInWorker failed:' + result.error,
                );
              } else {
                console.error(
                  'createDirectoryIndexInWorker failed: unknown error',
                );
              }
              return createNotWorkerIndex(
                param,
                loc,
                extractText,
                ignorePatterns,
                isWalking,
              );
            });
        }

        return createNotWorkerIndex(
          param,
          loc,
          extractText,
          ignorePatterns,
          isWalking,
        );
      });
    }
    return Promise.resolve(undefined);
  }

  function createNotWorkerIndex(
    param: any,
    loc: CommonLocation,
    extractText = false,
    ignorePatterns: Array<string> = [],
    isWalking = () => true,
  ): Promise<TS.FileSystemEntry[]> {
    const mode = ['loadMeta'];
    if (extractText) {
      mode.push('extractTextContent');
      if (loc.extractLinks) {
        mode.push('extractLinks');
      }
    }
    return createIndex(
      {
        ...param,
        listDirectoryPromise: loc.listDirectoryPromise,
        getFileContentPromise: loc.getFileContentPromise,
      },
      mode,
      ignorePatterns,
      isWalking,
    )
      .then((directoryIndex) => {
        if (!loc.isReadOnly) {
          persistIndex(param, directoryIndex).then((success) => {
            if (success) {
              console.log('Index generated in folder: ' + param.path);
            }
          });
        }
        return enhanceDirectoryIndex(
          directoryIndex,
          param.locationID,
          param.path,
        );
      })
      .catch((err) => {
        console.log('Error creating index: ', err);
        return undefined;
      });
  }

  function createDirectoryIndexWrapper(
    param: any,
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

  function createLocationIndex(
    location: CommonLocation,
    force = false,
  ): Promise<boolean> {
    walkingRef.current = true;
    if (location) {
      if (location.disableIndexing) {
        if (force) {
          openConfirmDialog(
            t('core:confirm'),
            t('core:indexDisabledConfirm'),
            (result) => {
              if (result) {
                createLocationIndexInt(location);
              }
            },
            'cancelIndexDisabledDialogTID',
            'confirmIndexDisabledDialogTID',
            'indexDisabledContentTID',
          );
        }
      } else {
        return createLocationIndexInt(location);
      }
    }
    return Promise.resolve(false);
  }

  function createLocationIndexInt(location: CommonLocation): Promise<boolean> {
    if (location) {
      isIndexing.current = location.uuid;
      forceUpdate();
    }
    return getLocationPath(location).then((locationPath) => {
      const isCurrentLocation =
        currentLocation && currentLocation.uuid === location.uuid;
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

  async function createLocationsIndexes(
    extractText = true,
    workSpace: TS.WorkSpace = undefined,
  ): Promise<boolean> {
    walkingRef.current = true;
    const searchingLocation = workSpace
      ? locations.filter((l) => l.workSpaceId === workSpace.uuid)
      : locations;
    for (let location of searchingLocation) {
      try {
        if (!location.disableIndexing) {
          const locationPath = await getLocationPath(location);
          isIndexing.current = location.uuid; //locationPath
          forceUpdate();
          await createDirectoryIndexWrapper(
            { path: locationPath, locationID: location.uuid },
            extractText,
            location.ignorePatternPaths,
            enableWS,
          );
        }
      } catch (error) {
        console.error('An error occurred:', error);
      }
    }
    isIndexing.current = undefined;
    forceUpdate();
    console.log('Resolution is complete!');
    return true;
  }

  function clearDirectoryIndex(persist = false) {
    isIndexing.current = undefined;
    setIndex(undefined, persist ? currentLocation : undefined);
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
            if (loc.type === locationType.TYPE_CLOUD) {
              return loc.getURLforPathInt(thumbFilePath).then((thumbPath) => ({
                ...entry,
                meta: { ...entry.meta, thumbPath },
              }));
            }
            return {
              ...entry,
              meta: { ...entry.meta, thumbPath: thumbFilePath },
            };
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
    return Search.searchLocationIndex(searchIndex, searchQuery, tagDelimiter)
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
    walkingRef.current = true;
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

      if (!index.current || index.current.length < 1) {
        const directoryIndex = await loadIndexFromDisk(
          currentPath,
          currentLocation.uuid,
        );
        if (directoryIndex) {
          setIndex(directoryIndex);
        }
      }
      // Workaround used to show the start search notification
      const currentTime = new Date().getTime();
      const indexAge = indexLoadedOn.current
        ? currentTime - indexLoadedOn.current
        : 0;

      if (
        searchQuery.forceIndexing ||
        (!currentLocation.disableIndexing &&
          (!index.current ||
            index.current.length < 1 ||
            indexAge > maxIndexAge.current))
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
      getSearchResults(index.current, searchQuery).then((results) => {
        setSearchResults(results);
        enhanceSearchEntries(results);
      });

      hideNotifications();
    }, 50);
  }

  function searchAllLocations(
    searchQuery: TS.SearchQuery,
    workSpace: TS.WorkSpace = undefined,
  ) {
    console.time('globalSearch');
    setSearchResults([]);
    showNotification(t('core:searching'), 'default', false, 'TIDSearching');

    walkingRef.current = true;
    //let searchResultCount = 0;
    let searchResults = [];
    let maxSearchResultReached = false;
    const searchingLocation = workSpace
      ? locations.filter((l) => l.workSpaceId === workSpace.uuid)
      : locations;
    const result = searchingLocation.reduce(
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
    const cLocation = findLocation(param?.locationID);
    const metaDirectory = getMetaDirectoryPath(directoryPath);
    const exist = await cLocation.checkDirExist(metaDirectory);
    try {
      if (!exist) {
        await cLocation.createDirectoryPromise(metaDirectory); // todo platformFacade?
      }
      const folderIndexPath =
        metaDirectory +
        cLocation?.getDirSeparator() +
        AppConfig.folderIndexFile; // getMetaIndexFilePath(directoryPath);
      return cLocation
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
    } catch (e) {
      console.log('Error saving the index', e);
    }
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
    if (loc) {
      const folderIndexPath =
        getMetaDirectoryPath(folderPath) +
        loc.getDirSeparator() +
        AppConfig.folderIndexFile;
      return loc
        .getPropertiesPromise(folderIndexPath)
        .then((indexFile: TS.FileSystemEntry) => {
          if (indexFile) {
            const indexAge = new Date().getTime() - indexFile.lmdt;
            if (loc.disableIndexing || indexAge < maxIndexAge.current) {
              return loc
                .loadTextFilePromise(folderIndexPath)
                .then((jsonContent) => {
                  const directoryIndex = loadJSONString(
                    jsonContent,
                  ) as TS.FileSystemEntry[];
                  return enhanceDirectoryIndex(
                    directoryIndex,
                    locationID,
                    folderPath,
                  );
                })
                .catch((e) => {
                  console.log('cannot load json:' + folderPath, e);
                  return undefined;
                });
            }
          }
          return undefined;
        });
    }
    return Promise.resolve(undefined);
  }

  /*const context = useMemo(() => {
    return {
      //index: index.current,
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
      //indexUpdateSidecarTags,
      reflectUpdateSidecarMeta,
    };
  }, [currentLocation, index.current, isIndexing.current, enableWS]);*/

  const context = {
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
    getLastIndex,
    reflectUpdateSidecarMeta,
    findLinks,
    checkIndexExist,
  };

  return (
    <LocationIndexContext.Provider value={context}>
      {children}
    </LocationIndexContext.Provider>
  );
};
