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
import { extractPDFcontent } from '-/services/thumbsgenerator';
import {
  executePromisesInBatches,
  isWorkerAvailable,
} from '-/services/utils-io';
import { prepareIndex, fuseOptions } from '@tagspaces/tagspaces-search';
import Fuse from 'fuse.js';
import { TS } from '-/tagspaces.namespace';
import { CommonLocation } from '-/utils/CommonLocation';
import useFirstRender from '-/utils/useFirstRender';
import { locationType } from '@tagspaces/tagspaces-common/misc';
import {
  cleanRootPath,
  cleanTrailingDirSeparator,
  getMetaDirectoryPath,
  getThumbFileLocationForDirectory,
  getThumbFileLocationForFile,
  joinPaths,
} from '@tagspaces/tagspaces-common/paths';
import { loadJSONString } from '@tagspaces/tagspaces-common/utils-io';
import {
  createIndex,
  createIncrementalIndex,
  getMetaIndexFilePath,
  getMetaFullTextFilePath,
  parseFullTextJsonl,
  serializeFullTextJsonl,
  mergeFullTextIntoIndex,
} from '@tagspaces/tagspaces-indexer';
import React, { createContext, useEffect, useReducer, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

type LocationIndexContextData = {
  indexLoadedOn: number | undefined;
  indexExpired: () => boolean;
  isIndexing: string | undefined;
  getIndex: () => TS.FileSystemEntry[] | undefined;
  getLastIndex: (locationId: string) => Promise<TS.FileSystemEntry[]>;
  cancelDirectoryIndexing: (locationId: string) => void;
  createLocationIndex: (
    location: CommonLocation,
    force?: boolean,
    fullTextIndex?: boolean,
    extractLinks?: boolean,
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
  indexExpired: () => true,
  isIndexing: undefined,
  getIndex: () => undefined,
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

  const isIndexing = useRef<string>(undefined);
  const walkingRef = useRef(true);
  const index = useRef<TS.FileSystemEntry[]>(undefined);
  const indexLoadedOn = useRef<number>(undefined);
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);
  const firstRender = useFirstRender();
  const maxIndexAge = useRef<number>(getMaxIndexAge(currentLocation));
  const prevLocationId = useRef<string>(currentLocationId);
  const enhancedIndex = useRef<any[]>(undefined);
  const fuseInstance = useRef<any>(undefined);
  // Entries the cached Fuse instance was built from — used to invalidate
  // the Fuse cache when searchAllLocations iterates over other locations
  // that have different prepared indexes.
  const fuseEntriesRef = useRef<any[]>(undefined);
  const fullTextMap = useRef<Record<string, string>>(undefined);
  const fullTextLoaded = useRef<boolean>(false);
  // In-flight fulltext load — coalesces concurrent searches so two queries
  // in the same tick don't both fetch+merge the same tsft.jsonl.
  const fullTextLoadPromise = useRef<Promise<void> | undefined>(undefined);

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
        } else if (action.action === 'update' || action.action === 'move') {
          reflectUpdateEntry(action.oldEntryPath, action.entry);
        } else {
          console.warn(
            'LocationIndexContextProvider: unhandled action type',
            action.action,
          );
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
    enhancedIndex.current = undefined;
    fuseInstance.current = undefined;
    fuseEntriesRef.current = undefined;
    fullTextMap.current = undefined;
    fullTextLoaded.current = false;
    fullTextLoadPromise.current = undefined;
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
        // Cache the loaded index so subsequent reads (triggered by effects
        // re-firing on isIndexing changes, navigation, etc.) don't re-read
        // and re-enhance the file from disk every time.
        setIndex(directoryIndex);
        return directoryIndex;
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
    const nextIndex = index.current.filter((entry) => entry.path !== path);
    if (nextIndex.length !== index.current.length) {
      setIndex(nextIndex, currentLocation);
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
    extractLinks?: boolean,
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
          !AppConfig.isNativeMobile
        ) {
          // Start indexing in worker if not in the object store mode
          return loc
            .createDirectoryIndexInWorker(
              dirPath,
              extractText,
              extractLinks ?? !!loc.extractLinks,
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
                extractLinks,
              );
            });
        }

        return createNotWorkerIndex(
          param,
          loc,
          extractText,
          ignorePatterns,
          isWalking,
          extractLinks,
        );
      });
    }
    return Promise.resolve(undefined);
  }

  async function createNotWorkerIndex(
    param: any,
    loc: CommonLocation,
    extractText = false,
    ignorePatterns: Array<string> = [],
    isWalking = () => true,
    extractLinks?: boolean,
    forceFullReindex = false,
  ): Promise<TS.FileSystemEntry[]> {
    const mode = ['loadMeta'];
    if (extractText) {
      mode.push('extractTextContent');
      if (extractLinks ?? loc.extractLinks) {
        mode.push('extractLinks');
      }
    }

    // Throttled progress callback — update notification at most every 250ms
    // to avoid flooding React with re-renders during large index walks
    const PROGRESS_THROTTLE_MS = 250;
    let lastProgressTs = 0;
    let lastDir = '';
    const onProgress = ({ count, entry }: { count: number; entry: any }) => {
      const now = Date.now();
      if (now - lastProgressTs < PROGRESS_THROTTLE_MS) return;
      lastProgressTs = now;
      const entryDir = entry.isFile
        ? entry.path.substring(0, entry.path.lastIndexOf('/'))
        : entry.path;
      // Skip UI update if we're still in the same directory
      if (entryDir === lastDir) return;
      lastDir = entryDir;
      const shortDir =
        entryDir.length > 60 ? '…' + entryDir.slice(-59) : entryDir;
      showNotification(
        t('core:indexing') + ': ' + count + '  •  ' + shortDir,
        'default',
        false,
        'TIDSearching',
      );
    };

    const indexParam: any = {
      ...param,
      listDirectoryPromise: loc.listDirectoryPromise,
      getFileContentPromise: loc.getFileContentPromise,
      onProgress,
    };
    if (extractText) {
      indexParam.extractPDFcontent = extractPDFcontent;
    }

    // Try incremental indexing if an existing index is available
    let existingIdx = index.current;
    if (!existingIdx && !forceFullReindex) {
      existingIdx = await loadIndexFromDisk(param.path, param.locationID);
    }

    let directoryIndex;
    if (existingIdx && existingIdx.length > 0 && !forceFullReindex) {
      // existingIdx here is the enhanced (absolute-path) form that the renderer
      // caches/returns from loadIndexFromDisk. createIncrementalIndex compares
      // entry.path against cleanRootPath(walked.path, rootPath) which is
      // relative, so we must de-enhance before handing it off — otherwise
      // every entry misses the map and the "incremental" run re-processes
      // (and on error re-persists) the whole index with bad paths.
      const sep = loc.getDirSeparator();
      const relativeExistingIdx = existingIdx.map((e) => ({
        ...e,
        path: cleanRootPath(e.path, param.path, sep),
      }));
      console.log('Attempting incremental index for: ' + param.path);
      const result = await createIncrementalIndex(
        indexParam,
        mode,
        ignorePatterns,
        isWalking,
        relativeExistingIdx,
        fullTextMap.current,
      );
      directoryIndex = result.index;
      console.log(
        `Incremental index stats: +${result.stats.added} ~${result.stats.modified} -${result.stats.deleted} =${result.stats.unchanged}`,
      );
    } else {
      directoryIndex = await createIndex(
        indexParam,
        mode,
        ignorePatterns,
        isWalking,
      );
    }

    if (!loc.isReadOnly) {
      persistIndex(param, directoryIndex).then((success) => {
        if (success) {
          console.log('Index generated in folder: ' + param.path);
        }
      });
    }
    return enhanceDirectoryIndex(directoryIndex, param.locationID, param.path);
  }

  function createDirectoryIndexWrapper(
    param: any,
    extractText = false,
    ignorePatterns: Array<string> = [],
    enableWS = true,
    extractLinks?: boolean,
  ): Promise<any> {
    const indexFilePath = getMetaIndexFilePath(param.path);

    ignoreByWatcher(indexFilePath);
    return createDirectoryIndex(
      param,
      extractText,
      ignorePatterns,
      enableWS,
      isWalking,
      extractLinks,
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
    fullTextIndex?: boolean,
    extractLinks?: boolean,
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
                createLocationIndexInt(location, fullTextIndex, extractLinks);
              }
            },
            'cancelIndexDisabledDialogTID',
            'confirmIndexDisabledDialogTID',
            'indexDisabledContentTID',
          );
        }
      } else {
        return createLocationIndexInt(location, fullTextIndex, extractLinks);
      }
    }
    return Promise.resolve(false);
  }

  function createLocationIndexInt(
    location: CommonLocation,
    fullTextIndex?: boolean,
    extractLinks?: boolean,
  ): Promise<boolean> {
    if (location) {
      isIndexing.current = location.uuid;
      forceUpdate();
    }
    return getLocationPath(location).then((locationPath) => {
      const isCurrentLocation =
        currentLocation && currentLocation.uuid === location.uuid;
      return createDirectoryIndexWrapper(
        { path: locationPath, locationID: location.uuid },
        fullTextIndex ?? location.fullTextIndex,
        location.ignorePatternPaths,
        enableWS,
        extractLinks,
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

  function enhanceSearchEntries(entries: TS.FileSystemEntry[]) {
    const promises: Promise<TS.FileSystemEntry>[] = entries.map(
      (entry: TS.FileSystemEntry) => enhanceSearchEntry(entry),
    );
    executePromisesInBatches(promises).then((entriesEnhanced) => {
      updateCurrentDirEntries(entriesEnhanced, false);
    });
  }

  function getOrCreateEnhancedIndex(
    searchIndex: TS.FileSystemEntry[],
    showUnixHiddenEntries: boolean,
  ) {
    // Use cached enhanced index if the raw index hasn't changed
    if (enhancedIndex.current && searchIndex === index.current) {
      return enhancedIndex.current;
    }
    const prepared = prepareIndex(
      searchIndex,
      tagDelimiter,
      showUnixHiddenEntries,
    );
    // Only cache if this is the current location's index
    if (searchIndex === index.current) {
      enhancedIndex.current = prepared;
    }
    return prepared;
  }

  function getOrCreateFuse(entries: any[]) {
    // Fuse cache tied to the specific entries array — otherwise
    // searchAllLocations would reuse the current location's Fuse when
    // iterating over other locations, and text search would return wrong
    // results (Fuse's internal index is bound to the collection at
    // construction).
    if (fuseInstance.current && fuseEntriesRef.current === entries) {
      return fuseInstance.current;
    }
    const fuse = new Fuse(entries, fuseOptions);
    // Only cache when this is the current location's prepared index —
    // otherwise each searchAllLocations iteration would overwrite the cache
    if (entries === enhancedIndex.current) {
      fuseInstance.current = fuse;
      fuseEntriesRef.current = entries;
    }
    return fuse;
  }

  function loadFullTextIfNeeded(
    searchIndex: TS.FileSystemEntry[],
  ): Promise<void> {
    // Only load fulltext for the current location's index, and only once
    if (
      fullTextLoaded.current ||
      searchIndex !== index.current ||
      !currentLocation
    ) {
      return Promise.resolve();
    }
    if (fullTextLoadPromise.current) {
      return fullTextLoadPromise.current;
    }

    const loadPromise = (async () => {
      try {
        const locationPath = await getLocationPath(currentLocation);
        const ftPath = getMetaFullTextFilePath(locationPath);
        // loadTextFilePromise returns undefined for non-existent files
        // (Electron main swallows ENOENT) — no separate existence check
        // needed, which saves a round-trip on S3/cloud locations.
        const ftContent = await currentLocation.loadTextFilePromise(ftPath);
        if (ftContent) {
          const trimmed = ftContent.trim();
          let ftMap: Record<string, string>;
          if (trimmed.startsWith('{') && !trimmed.startsWith('{"p"')) {
            try {
              ftMap = JSON.parse(trimmed);
            } catch (e) {
              ftMap = parseFullTextJsonl(ftContent);
            }
          } else {
            ftMap = parseFullTextJsonl(ftContent);
          }

          if (ftMap && typeof ftMap === 'object') {
            // Fulltext stores relative paths; index entries have absolute
            // paths after enhanceDirectoryIndex. Convert keys to absolute
            // so mergeFullTextIntoIndex matches by entry.path.
            // Defensive: legacy tsft.jsonl files (from before persist
            // normalization) may contain absolute keys — cleanRootPath
            // first so the subsequent join doesn't double the prefix.
            const sep = currentLocation.getDirSeparator();
            const absoluteFtMap: Record<string, string> = {};
            for (const [storedKey, content] of Object.entries(ftMap)) {
              const relPath = cleanRootPath(storedKey, locationPath, sep);
              const absPath = joinPaths(sep, locationPath, relPath);
              absoluteFtMap[absPath] = content as string;
            }
            fullTextMap.current = absoluteFtMap;
            mergeFullTextIntoIndex(searchIndex, absoluteFtMap);
            // Invalidate caches that were built without textContent
            enhancedIndex.current = undefined;
            fuseInstance.current = undefined;
            fuseEntriesRef.current = undefined;
          }
        }
      } catch (e: any) {
        // tsft.jsonl may not exist (no fulltext indexing enabled)
        console.log('No fulltext index found (tsft.jsonl)', e?.message || e);
      }
      fullTextLoaded.current = true;
    })();

    fullTextLoadPromise.current = loadPromise;
    return loadPromise;
  }

  async function getSearchResults(
    searchIndex: TS.FileSystemEntry[],
    searchQuery: TS.SearchQuery,
  ): Promise<TS.FileSystemEntry[]> {
    // Lazy-load fulltext index only when text search is needed
    const hasTextQuery =
      searchQuery.textQuery && searchQuery.textQuery.length > 1;
    if (hasTextQuery && !fullTextLoaded.current) {
      await loadFullTextIfNeeded(searchIndex);
    }

    const prepared = getOrCreateEnhancedIndex(
      searchIndex,
      searchQuery.showUnixHiddenEntries,
    );
    // Build Fuse lazily only when text query is present
    const fuse = hasTextQuery ? getOrCreateFuse(prepared) : undefined;

    return Search.searchLocationIndex(searchIndex, searchQuery, tagDelimiter, {
      preparedIndex: prepared,
      fuseInstance: fuse,
    })
      .then((searchResults) => {
        return searchResults;
      })
      .catch((err) => {
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
    let searchResults = [];
    let maxSearchResultReached = false;
    const searchingLocations = workSpace
      ? locations.filter((l) => l.workSpaceId === workSpace.uuid)
      : locations;

    // Sequential on mobile (memory), parallel on desktop/web
    const CONCURRENCY = AppConfig.isNativeMobile ? 1 : 3;

    const searchSingleLocation = async (location: CommonLocation) => {
      if (searchResults.length >= searchQuery.maxSearchResults) {
        maxSearchResultReached = true;
        return;
      }
      const nextPath = await getLocationPath(location);
      const isCloudLocation = location.type === locationType.TYPE_CLOUD;
      let directoryIndex = await loadIndexFromDisk(nextPath, location.uuid);
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
      const results = await getSearchResults(directoryIndex, searchQuery);
      if (results.length > 0) {
        searchResults = [...searchResults, ...results];
        appendSearchResults(results);
      }
    };

    // Execute with concurrency limiting
    const tasks = searchingLocations.map(
      (loc) => () => searchSingleLocation(loc),
    );
    const batchPromises = [];
    for (let i = 0; i < tasks.length; i += CONCURRENCY) {
      const batch = tasks.slice(i, i + CONCURRENCY);
      batchPromises.push(batch);
    }

    batchPromises
      .reduce(
        (acc, batch) =>
          acc.then(() =>
            Promise.allSettled(batch.map((task) => task())).then(() => {}),
          ),
        Promise.resolve(),
      )
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
    // Don't persist index for directories that no longer exist —
    // would otherwise recreate deleted folders via the .ts subdir
    const parentExists = await cLocation.checkDirExist(directoryPath);
    if (!parentExists) {
      console.log(
        'Skipping index persist — directory does not exist: ' + directoryPath,
      );
      return false;
    }
    const metaDirectory = getMetaDirectoryPath(directoryPath);
    const exist = await cLocation.checkDirExist(metaDirectory);
    try {
      if (!exist) {
        await cLocation.createDirectoryPromise(metaDirectory);
      }
      const sep = cLocation?.getDirSeparator();
      const folderIndexPath = metaDirectory + sep + AppConfig.folderIndexFile;
      const folderFullTextPath =
        metaDirectory + sep + AppConfig.folderFullTextFile;

      // Persisted tsi.json / tsft.jsonl must store paths relative to the
      // location root. Callers may hand us either relative entries (fresh
      // output of createIndex / createIncrementalIndex) or the enhanced
      // absolute-path entries cached in index.current (reflectCreate/
      // reflectDelete/reflectUpdate/reflectUpdateSidecarMeta all persist
      // index.current). cleanRootPath is a no-op when the root isn't a
      // prefix, so running it unconditionally is safe for both inputs.
      // Split: strip textContent from main index, collect into fulltext map
      const fullTextEntries: Record<string, string> = {};
      let hasFullText = false;
      const strippedIndex = directoryIndex.map((entry: any) => {
        if (!entry) return entry;
        const relPath = cleanRootPath(entry.path, directoryPath, sep);
        if (entry.textContent) {
          fullTextEntries[relPath] = entry.textContent;
          hasFullText = true;
          const { textContent, ...rest } = entry;
          return { ...rest, path: relPath };
        }
        return entry.path === relPath ? entry : { ...entry, path: relPath };
      });

      const saveIndex = cLocation
        .saveTextFilePromise(
          { ...param, path: folderIndexPath },
          JSON.stringify(strippedIndex),
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

      if (hasFullText) {
        const saveFullText = cLocation
          .saveTextFilePromise(
            { ...param, path: folderFullTextPath },
            serializeFullTextJsonl(fullTextEntries),
            true,
          )
          .then(() => {
            console.log('Fulltext index persisted to ' + folderFullTextPath);
          })
          .catch((err) => {
            console.log(
              'Error saving fulltext index for ' + folderFullTextPath,
              err,
            );
          });
        return Promise.all([saveIndex, saveFullText]).then(
          ([indexResult]) => indexResult,
        );
      }
      return saveIndex;
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
    const sep = loc ? loc.getDirSeparator() : AppConfig.dirSeparator;
    return directoryIndex.map((i: TS.FileSystemEntry) => {
      // Defensive: some legacy tsi.json files (from before the persist
      // normalization was in place) contain absolute paths. Running
      // cleanRootPath first yields the relative form in both cases and
      // avoids a double-join like "/a/b/c" + "/a/b/c/file" → "/a/b/c/a/b/c/file".
      const relPath = cleanRootPath(i.path, folderPath, sep);
      return {
        ...i,
        locationID,
        path: joinPaths(
          sep,
          folderPath,
          AppConfig.isWin ? relPath.replaceAll('/', sep) : relPath,
        ),
      };
    });
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

  const context = {
    indexLoadedOn: indexLoadedOn.current,
    indexExpired,
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
