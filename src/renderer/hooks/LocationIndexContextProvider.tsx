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

import React, { createContext, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { actions as AppActions, AppDispatch } from '-/reducers/app';
import { useTranslation } from 'react-i18next';
import { TS } from '-/tagspaces.namespace';
import { createDirectoryIndex, toFsEntry } from '-/services/utils-io';
import { getEnableWS } from '-/reducers/settings';
import { locationType } from '@tagspaces/tagspaces-common/misc';
import PlatformIO from '-/services/platform-facade';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { getLocations } from '-/reducers/locations';
import AppConfig from '-/AppConfig';
import { hasIndex, loadIndex } from '@tagspaces/tagspaces-platforms/indexer';
import Search from '-/services/search';
import {
  extractFileExtension,
  extractFileName,
  extractTagsAsObjects,
  getThumbFileLocationForFile,
} from '@tagspaces/tagspaces-common/paths';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';

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
  reflectDeleteEntry: (path: string) => void;
  reflectDeleteEntries: (paths: string[]) => void;
  reflectCreateEntry: (newEntry: TS.FileSystemEntry) => void;
  reflectRenameEntry: (path: string, newPath: string) => void;
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
  reflectDeleteEntry: () => {},
  reflectDeleteEntries: () => {},
  reflectCreateEntry: () => {},
  reflectRenameEntry: () => {},
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
  const dispatch: AppDispatch = useDispatch();

  const { currentLocation, getLocationPath } = useCurrentLocationContext();
  const {
    setSearchResults,
    appendSearchResults,
    addDirectoryEntries,
    removeDirectoryEntries,
  } = useDirectoryContentContext();
  const { showNotification, hideNotifications } = useNotificationContext();

  const enableWS = useSelector(getEnableWS);
  const allLocations = useSelector(getLocations);

  const isIndexing = useRef<boolean>(false);
  const lastError = useRef(undefined);
  const index = useRef<TS.FileSystemEntry[]>(undefined);
  const indexLoadedOn = useRef<number>(undefined);

  useEffect(() => {
    clearDirectoryIndex();
  }, [currentLocation]);

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

  function deleteEntry(path: string) {
    removeDirectoryEntries([path]);
    reflectDeleteEntry(path);
    dispatch(AppActions.reflectDeleteEntry(path));
  }
  function createEntry(path: string, isFile: boolean) {
    const entry = toFsEntry(path, isFile);
    addDirectoryEntries([entry]);
    reflectCreateEntry(entry);
    dispatch(AppActions.reflectCreateEntry(path, isFile));
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

  function reflectDeleteEntries(paths: string[]) {
    if (!index.current || index.current.length < 1) {
      return;
    }
    for (let i = 0; i < index.current.length; i += 1) {
      if (paths.some((path) => index.current[i].path === path)) {
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
      index.current = [...index.current, newEntry];
    }
    // else todo update index entry ?
  }

  function reflectRenameEntry(path: string, newPath: string) {
    if (!index.current || index.current.length < 1) {
      return;
    }
    for (let i = 0; i < index.current.length; i += 1) {
      if (index.current[i].path === path) {
        index.current[i].path = newPath;
        index.current[i].name = extractFileName(
          newPath,
          PlatformIO.getDirSeparator(),
        );
        index.current[i].extension = extractFileExtension(
          newPath,
          PlatformIO.getDirSeparator(),
        );
        index.current[i].tags = [
          ...index.current[i].tags.filter((tag) => tag.type === 'sidecar'), // add only sidecar tags
          ...extractTagsAsObjects(
            newPath,
            AppConfig.tagDelimiter,
            PlatformIO.getDirSeparator(),
          ),
        ];
      }
    }
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
  }

  function createDirIndex(
    directoryPath: string,
    extractText: boolean,
    isCurrentLocation = true,
    locationID: string = undefined,
    ignorePatterns: Array<string> = [],
  ): Promise<boolean> {
    isIndexing.current = true;
    return createDirectoryIndex(
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
        /* if (Pro && Pro.Indexer) {
          Pro.Indexer.persistIndex(
            directoryPath,
            directoryIndex,
            PlatformIO.getDirSeparator()
          );
        } */
        return true;
      })
      .catch((err) => {
        isIndexing.current = false;
        lastError.current = err;
        return false;
      });
  }

  function createLocationIndex(location: TS.Location): Promise<boolean> {
    if (location) {
      const isCurrentLocation =
        currentLocation && currentLocation.uuid === location.uuid;
      getLocationPath(location).then((locationPath) => {
        if (location.type === locationType.TYPE_CLOUD) {
          return PlatformIO.enableObjectStoreSupport(location)
            .then(() =>
              createDirIndex(
                locationPath,
                location.fullTextIndex,
                isCurrentLocation,
                location.uuid,
              ),
            )
            .catch(() => {
              PlatformIO.disableObjectStoreSupport();
              return false;
            });
        } else if (location.type === locationType.TYPE_WEBDAV) {
          PlatformIO.enableWebdavSupport(location);
          return createDirIndex(
            locationPath,
            location.fullTextIndex,
            isCurrentLocation,
            location.uuid,
          );
        } else if (location.type === locationType.TYPE_LOCAL) {
          PlatformIO.disableObjectStoreSupport();
          return createDirIndex(
            locationPath,
            location.fullTextIndex,
            isCurrentLocation,
            location.uuid,
          );
        }
      });
    }
    return Promise.resolve(false);
  }

  function createLocationsIndexes(extractText = true): Promise<boolean> {
    isIndexing.current = true;
    const promises = allLocations.map((location: TS.Location) =>
      getLocationPath(location).then((locationPath) =>
        createDirectoryIndex(
          { path: locationPath, location: location.uuid },
          extractText,
          location.ignorePatternPaths,
          enableWS,
        ).catch((err) => {
          isIndexing.current = false;
          lastError.current = err;
        }),
      ),
    );
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

    return Promise.all(promises)
      .then((e) => {
        isIndexing.current = false;
        console.log('Resolution is complete!', e);
        return true;
      })
      .catch((e) => {
        console.warn('Resolution is failed!', e);
        return false;
      });
  }

  function clearDirectoryIndex() {
    isIndexing.current = false;
    setIndex([]);
  }

  function searchLocationIndex(searchQuery: TS.SearchQuery) {
    window.walkCanceled = false;
    /*if (!currentLocation) {
      if (searchQuery.currentDirectory) {
        currentLocation = getLocationByPath(
          state,
          searchQuery.currentDirectory
        );
      }
    }*/
    if (!currentLocation) {
      showNotification(t('core:pleaseOpenLocation'), 'warning', true);
      return;
    }

    const isCloudLocation = currentLocation.type === locationType.TYPE_CLOUD;
    showNotification(t('core:searching'), 'default', false, 'TIDSearching');
    setTimeout(async () => {
      const index = getIndex();
      // Workaround used to show the start search notification
      const currentTime = new Date().getTime();
      const indexAge = indexLoadedOn.current
        ? currentTime - indexLoadedOn.current
        : 0;
      const maxIndexAge = currentLocation.maxIndexAge
        ? currentLocation.maxIndexAge
        : AppConfig.maxIndexAge;

      const currentPath = await getLocationPath(currentLocation);
      if (
        searchQuery.forceIndexing ||
        (!currentLocation.disableIndexing &&
          (!index || index.length < 1 || indexAge > maxIndexAge))
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
      } else if (isCloudLocation || !index || index.length === 0) {
        const newIndex = await loadIndex(
          {
            path: currentPath,
            locationID: currentLocation.uuid,
            ...(isCloudLocation && { bucketName: currentLocation.bucketName }),
          },
          PlatformIO.getDirSeparator(),
          PlatformIO.loadTextFilePromise,
        );
        setIndex(newIndex);
      }
      Search.searchLocationIndex(getIndex(), searchQuery)
        .then((searchResults) => {
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
                    PlatformIO.getDirSeparator(),
                  ),
                );
              }
            });
          }
          setSearchResults(searchResults);
          hideNotifications();
          return true;
        })
        .catch((err) => {
          setSearchResults([]);
          // dispatch(AppActions.hideNotifications());
          console.log('Searching Index failed: ', err);
          showNotification(
            t('core:searchingFailed') + ' ' + err.message,
            'warning',
            true,
          );
        });
    }, 50);
  }

  function searchAllLocations(searchQuery: TS.SearchQuery) {
    console.time('globalSearch');
    showNotification(t('core:searching'), 'default', false, 'TIDSearching');

    // Preparing for global search
    // setSearchResults([]);
    if (currentLocation && currentLocation.type === locationType.TYPE_CLOUD) {
      PlatformIO.disableObjectStoreSupport();
    }
    window.walkCanceled = false;
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
          const nextPath = await getLocationPath(location);
          let directoryIndex = [];
          let indexExist = false;
          const isCloudLocation = location.type === locationType.TYPE_CLOUD;
          console.log('Searching in: ' + nextPath);
          showNotification(
            t('core:searching') + ' ' + location.name,
            'default',
            true,
            'TIDSearching',
          );
          if (isCloudLocation) {
            await PlatformIO.enableObjectStoreSupport(location);
          }
          // if (Pro && Pro.Indexer && Pro.Indexer.hasIndex) {
          indexExist = await hasIndex(
            nextPath,
            PlatformIO.getPropertiesPromise,
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
                ...(isCloudLocation && { bucketName: location.bucketName }),
              },
              location.fullTextIndex,
              location.ignorePatternPaths,
              enableWS,
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
                  bucketName: currentLocation.bucketName,
                }),
              },
              PlatformIO.getDirSeparator(),
              PlatformIO.loadTextFilePromise,
            );
          }
          return Search.searchLocationIndex(directoryIndex, searchQuery)
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
              appendSearchResults(enhancedSearchResult);
              hideNotifications();
              if (isCloudLocation) {
                PlatformIO.disableObjectStoreSupport();
              }
              return true;
            })
            .catch((e) => {
              if (isCloudLocation) {
                PlatformIO.disableObjectStoreSupport();
              }
              console.log('Searching Index failed: ', e);
              setSearchResults([]);
              // dispatch(AppActions.hideNotifications());
              showNotification(
                t('core:searchingFailed') + ' ' + e.message,
                'warning',
                true,
              );
            });
        }),
      Promise.resolve(),
    );

    result
      .then(() => {
        console.timeEnd('globalSearch');
        if (maxSearchResultReached) {
          showNotification(
            'Global search finished, reaching the max. search results. The first ' +
              searchResultCount +
              ' entries are listed.',
            'default',
            true,
          );
        } else {
          showNotification(t('Global search completed'), 'default', true);
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
      .catch((e) => {
        if (
          currentLocation &&
          currentLocation.type === locationType.TYPE_CLOUD
        ) {
          PlatformIO.enableObjectStoreSupport(currentLocation);
        }
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
      reflectDeleteEntry,
      reflectDeleteEntries,
      reflectCreateEntry,
      reflectRenameEntry,
      indexUpdateSidecarTags,
      reflectUpdateSidecarMeta,
    };
  }, [
    currentLocation,
    index,
    isIndexing.current,
    addDirectoryEntries,
    removeDirectoryEntries,
  ]);

  return (
    <LocationIndexContext.Provider value={context}>
      {children}
    </LocationIndexContext.Provider>
  );
};
