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
  useRef,
  useState
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '-/reducers/app';
import { useTranslation } from 'react-i18next';
import { TS } from '-/tagspaces.namespace';
import { createDirectoryIndex } from '-/services/utils-io';
import GlobalSearch from '-/services/search-index';
import { getEnableWS } from '-/reducers/settings';
import { locationType } from '@tagspaces/tagspaces-common/misc';
import PlatformIO from '-/services/platform-facade';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { getLocations } from '-/reducers/locations';
import AppConfig from '-/AppConfig';
import { hasIndex, loadIndex } from '@tagspaces/tagspaces-platforms/indexer';
import Search from '-/services/search';
import { getThumbFileLocationForFile } from '@tagspaces/tagspaces-common/paths';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';

type LocationIndexContextData = {
  searchQuery: TS.SearchQuery;
  isIndexing: boolean;
  cancelDirectoryIndexing: () => void;
  setSearchQuery: (searchQuery: TS.SearchQuery) => void;
  createLocationIndex: (location: TS.Location) => Promise<boolean>;
  createLocationsIndexes: (extractText?: boolean) => Promise<boolean>;
  clearDirectoryIndex: () => void;
  searchLocationIndex: (searchQuery: TS.SearchQuery) => void;
  searchAllLocations: (searchQuery: TS.SearchQuery) => void;
};

export const LocationIndexContext = createContext<LocationIndexContextData>({
  searchQuery: {},
  isIndexing: false,
  cancelDirectoryIndexing: () => {},
  setSearchQuery: () => {},
  createLocationIndex: () => Promise.resolve(false),
  createLocationsIndexes: () => Promise.resolve(false),
  clearDirectoryIndex: () => {},
  searchLocationIndex: () => {},
  searchAllLocations: () => {}
});

export type LocationIndexContextProviderProps = {
  children: React.ReactNode;
};

export const LocationIndexContextProvider = ({
  children
}: LocationIndexContextProviderProps) => {
  const { t } = useTranslation();

  const { currentLocation } = useCurrentLocationContext();
  const {
    setSearchResults,
    appendSearchResults
  } = useDirectoryContentContext();
  const { showNotification, hideNotifications } = useNotificationContext();

  const enableWS = useSelector(getEnableWS);
  const allLocations = useSelector(getLocations);

  const [searchQuery, setSearchQueryInt] = useState<TS.SearchQuery>({});
  const isIndexing = useRef<boolean>(false);
  const lastError = useRef(undefined);

  useEffect(() => {
    clearDirectoryIndex();
  }, [currentLocation]);

  function cancelDirectoryIndexing() {
    window.walkCanceled = true;
    isIndexing.current = false;
  }

  function setSearchQuery(searchQuery: TS.SearchQuery) {
    setSearchQueryInt(searchQuery);
    /*if (Object.keys(searchQuery).length === 0) {
     //exitSearchMode();
   }*/
  }

  function createDirIndex(
    directoryPath: string,
    extractText: boolean,
    isCurrentLocation = true,
    locationID: string = undefined,
    ignorePatterns: Array<string> = []
  ): Promise<boolean> {
    isIndexing.current = true;
    return createDirectoryIndex(
      { path: directoryPath, locationID },
      extractText,
      ignorePatterns,
      enableWS
    )
      .then(directoryIndex => {
        if (isCurrentLocation) {
          // Load index only if current location
          GlobalSearch.getInstance().setIndex(directoryIndex);
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
      .catch(err => {
        isIndexing.current = false;
        lastError.current = err;
        return false;
      });
  }

  function createLocationIndex(location: TS.Location): Promise<boolean> {
    if (location) {
      const isCurrentLocation =
        currentLocation && currentLocation.uuid === location.uuid;
      if (location.type === locationType.TYPE_CLOUD) {
        return PlatformIO.enableObjectStoreSupport(location)
          .then(() =>
            createDirIndex(
              PlatformIO.getLocationPath(location),
              location.fullTextIndex,
              isCurrentLocation,
              location.uuid
            )
          )
          .catch(() => {
            PlatformIO.disableObjectStoreSupport();
            return false;
          });
      } else if (location.type === locationType.TYPE_WEBDAV) {
        PlatformIO.enableWebdavSupport(location);
        return createDirIndex(
          PlatformIO.getLocationPath(location),
          location.fullTextIndex,
          isCurrentLocation,
          location.uuid
        );
      } else if (location.type === locationType.TYPE_LOCAL) {
        PlatformIO.disableObjectStoreSupport();
        return createDirIndex(
          PlatformIO.getLocationPath(location),
          location.fullTextIndex,
          isCurrentLocation,
          location.uuid
        );
      }
    }
    return Promise.resolve(false);
  }

  function createLocationsIndexes(extractText = true): Promise<boolean> {
    isIndexing.current = true;
    const promises = allLocations.map((location: TS.Location) => {
      const nextPath = PlatformIO.getLocationPath(location);
      return (
        createDirectoryIndex(
          { path: nextPath, location: location.uuid },
          extractText,
          location.ignorePatternPaths,
          enableWS
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
            isIndexing.current = false;
            lastError.current = err;
          })
      );
    });

    return Promise.all(promises)
      .then(e => {
        isIndexing.current = false;
        console.log('Resolution is complete!', e);
        return true;
      })
      .catch(e => {
        console.warn('Resolution is failed!', e);
        return false;
      });
  }

  function clearDirectoryIndex() {
    isIndexing.current = false;
    GlobalSearch.getInstance().setIndex([]);
    GlobalSearch.getInstance().setIndexLoadedOn(undefined);
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
      const index = GlobalSearch.getInstance().getIndex();
      // Workaround used to show the start search notification
      const currentTime = new Date().getTime();
      const indexAge = GlobalSearch.getInstance().getIndexLoadedOn()
        ? currentTime - GlobalSearch.getInstance().getIndexLoadedOn()
        : 0;
      const maxIndexAge = currentLocation.maxIndexAge
        ? currentLocation.maxIndexAge
        : AppConfig.maxIndexAge;
      if (
        searchQuery.forceIndexing ||
        (!currentLocation.disableIndexing &&
          (!index || index.length < 1 || indexAge > maxIndexAge))
      ) {
        const currentPath = PlatformIO.getLocationPath(currentLocation);
        console.log('Start creating index for : ' + currentPath);
        const newIndex = await createDirectoryIndex(
          {
            path: currentPath,
            locationID: currentLocation.uuid,
            ...(isCloudLocation && { bucketName: currentLocation.bucketName })
          },
          currentLocation.fullTextIndex,
          currentLocation.ignorePatternPaths,
          enableWS
        );
        GlobalSearch.getInstance().setIndex(newIndex);

        if (newIndex && newIndex.length > 0) {
          GlobalSearch.getInstance().setIndexLoadedOn(new Date().getTime());
        }
      } else if (isCloudLocation || !index || index.length === 0) {
        const newIndex = await loadIndex(
          {
            path: PlatformIO.getLocationPath(currentLocation),
            locationID: currentLocation.uuid,
            ...(isCloudLocation && { bucketName: currentLocation.bucketName })
          },
          PlatformIO.getDirSeparator(),
          PlatformIO.loadTextFilePromise
        );
        GlobalSearch.getInstance().setIndex(newIndex);
      }
      Search.searchLocationIndex(
        GlobalSearch.getInstance().getIndex(),
        searchQuery
      )
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
          setSearchResults(searchResults);
          hideNotifications();
          return true;
        })
        .catch(err => {
          setSearchResults([]);
          // dispatch(AppActions.hideNotifications());
          console.error('Searching Index failed: ', err);
          showNotification(
            t('core:searchingFailed') + ' ' + err.message,
            'warning',
            true
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
          const nextPath = PlatformIO.getLocationPath(location);
          let directoryIndex = [];
          let indexExist = false;
          const isCloudLocation = location.type === locationType.TYPE_CLOUD;
          console.log('Searching in: ' + nextPath);
          showNotification(
            t('core:searching') + ' ' + location.name,
            'default',
            true,
            'TIDSearching'
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
              enableWS
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
              appendSearchResults(enhancedSearchResult);
              hideNotifications();
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
              setSearchResults([]);
              // dispatch(AppActions.hideNotifications());
              showNotification(
                t('core:searchingFailed') + ' ' + e.message,
                'warning',
                true
              );
            });
        }),
      Promise.resolve()
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
            true
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
  }

  const context = useMemo(() => {
    return {
      searchQuery,
      isIndexing: isIndexing.current,
      cancelDirectoryIndexing,
      setSearchQuery,
      createLocationIndex,
      createLocationsIndexes,
      clearDirectoryIndex,
      searchLocationIndex,
      searchAllLocations
    };
  }, [searchQuery, isIndexing.current]);

  return (
    <LocationIndexContext.Provider value={context}>
      {children}
    </LocationIndexContext.Provider>
  );
};
