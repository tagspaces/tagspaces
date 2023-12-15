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
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { locationType } from '@tagspaces/tagspaces-common/misc';
import {
  actions as AppActions,
  AppDispatch,
  getEditedEntryPaths,
} from '-/reducers/app';
import { TS } from '-/tagspaces.namespace';
import { useTranslation } from 'react-i18next';
import {
  extractContainingDirectoryPath,
  extractFileName,
  extractFileExtension,
  extractTagsAsObjects,
  extractParentDirectoryPath,
  getMetaFileLocationForDir,
  getMetaDirectoryPath,
} from '@tagspaces/tagspaces-common/paths';
import PlatformIO from '-/services/platform-facade';
import {
  getMetaForEntry,
  loadJSONFile,
  merge,
  updateFsEntries,
} from '-/services/utils-io';
import AppConfig from '-/AppConfig';
import { PerspectiveIDs } from '-/perspectives';
import { updateHistory } from '-/utils/dom';
import {
  getShowUnixHiddenEntries,
  getTagColor,
  getTagTextColor,
} from '-/reducers/settings';
import { enhanceEntry, getUuid } from '@tagspaces/tagspaces-common/utils-io';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { loadCurrentDirMeta } from '-/services/meta-loader';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { getSearches } from '-/reducers/searches';
import { getTagColors } from '-/services/taglibrary-utils';
import { defaultTitle } from '-/services/search';
import { Pro } from '-/pro';

type DirectoryContentContextData = {
  currentLocationPath: string;
  currentDirectoryEntries: TS.FileSystemEntry[];
  directoryMeta: TS.FileSystemEntryMeta;
  currentDirectoryPerspective: string;
  currentDirectoryPath: string;
  /**
   * used for reorder files in KanBan
   */
  currentDirectoryFiles: TS.OrderVisibilitySettings[];
  /**
   * used for reorder dirs in KanBan
   */
  currentDirectoryDirs: TS.OrderVisibilitySettings[];
  //isMetaLoaded: boolean;
  //isMetaFolderExist: boolean;
  searchQuery: TS.SearchQuery;
  isSearchMode: boolean;
  addDirectoryEntries: (entries: TS.FileSystemEntry[]) => void;
  removeDirectoryEntries: (entryPaths: string[]) => void;
  reflectRenameEntries: (paths: Array<string[]>) => Promise<boolean>;
  setSearchQuery: (sQuery: TS.SearchQuery) => void;
  loadParentDirectoryContent: () => void;
  loadDirectoryContent: (
    directoryPath: string,
    loadDirMeta?: boolean,
    showHiddenEntries?: boolean,
  ) => Promise<TS.FileSystemEntry[]>;
  enhanceDirectoryContent: (
    dirEntries,
    isCloudLocation,
    showDirs?: boolean,
    limit?: number,
    getDirMeta?: boolean,
    generateThumbnails?: boolean,
  ) => any;
  openDirectory: (
    dirPath: string,
    showHiddenEntries?: boolean,
  ) => Promise<boolean>;
  openCurrentDirectory: (showHiddenEntries?: boolean) => Promise<boolean>;
  clearDirectoryContent: () => void;
  setCurrentDirectoryPerspective: (perspective: string) => void;
  setCurrentDirectoryColor: (color: string) => void;
  setCurrentDirectoryDirs: (dirs: TS.OrderVisibilitySettings[]) => void;
  setCurrentDirectoryFiles: (files: TS.OrderVisibilitySettings[]) => void;
  updateCurrentDirEntry: (path: string, entry: TS.FileSystemEntry) => void;
  updateCurrentDirEntries: (dirEntries: TS.FileSystemEntry[]) => void;
  updateThumbnailUrl: (filePath: string, thumbUrl: string) => void;
  setDirectoryMeta: (meta: TS.FileSystemEntryMeta) => void;
  setSearchResults: (entries: TS.FileSystemEntry[]) => void;
  appendSearchResults: (entries: TS.FileSystemEntry[]) => void;
  enterSearchMode: () => void;
  exitSearchMode: () => void;
  findFromSavedSearch: (uuid: string) => void;
};

export const DirectoryContentContext =
  createContext<DirectoryContentContextData>({
    currentLocationPath: undefined,
    currentDirectoryEntries: [],
    directoryMeta: undefined,
    currentDirectoryPerspective: undefined,
    currentDirectoryPath: undefined,
    currentDirectoryFiles: [],
    currentDirectoryDirs: [],
    //isMetaLoaded: undefined,
    //isMetaFolderExist: false,
    searchQuery: {},
    isSearchMode: false,
    addDirectoryEntries: undefined,
    removeDirectoryEntries: undefined,
    reflectRenameEntries: undefined,
    setSearchQuery: () => {},
    loadParentDirectoryContent: () => {},
    loadDirectoryContent: undefined,
    enhanceDirectoryContent: () => {},
    openDirectory: undefined,
    openCurrentDirectory: undefined,
    clearDirectoryContent: () => {},
    setCurrentDirectoryPerspective: () => {},
    setCurrentDirectoryColor: () => {},
    setCurrentDirectoryDirs: () => {},
    setCurrentDirectoryFiles: () => {},
    updateCurrentDirEntry: () => {},
    updateCurrentDirEntries: () => {},
    updateThumbnailUrl: () => {},
    setDirectoryMeta: () => {},
    setSearchResults: () => {},
    appendSearchResults: () => {},
    enterSearchMode: () => {},
    exitSearchMode: () => {},
    findFromSavedSearch: () => {},
  });

export type DirectoryContentContextProviderProps = {
  children: React.ReactNode;
};

export const DirectoryContentContextProvider = ({
  children,
}: DirectoryContentContextProviderProps) => {
  const dispatch: AppDispatch = useDispatch();
  const { t } = useTranslation();
  const {
    closeAllLocations,
    currentLocation,
    skipInitialDirList,
    getLocationPath,
  } = useCurrentLocationContext();

  const currentLocationPath = useRef<string>('');

  const { showNotification, hideNotifications } = useNotificationContext();

  const { selectedEntries, setSelectedEntries } = useSelectedEntriesContext();
  //const useGenerateThumbnails = useSelector(getUseGenerateThumbnails);
  const showUnixHiddenEntries = useSelector(getShowUnixHiddenEntries);
  const editedEntryPaths = useSelector(getEditedEntryPaths);
  const searches = useSelector(getSearches);
  const defaultBackgroundColor = useSelector(getTagColor);
  const defaultTextColor = useSelector(getTagTextColor);
  const searchHistoryKey = useSelector((state: any) =>
    Pro ? state.settings[Pro.history.historyKeys.searchHistoryKey] : undefined,
  );

  //const enableWS = useSelector(getEnableWS);

  const [currentDirectoryEntries, setCurrentDirectoryEntries] = useState<
    TS.FileSystemEntry[]
  >([]);
  const searchQuery = useRef<TS.SearchQuery>({});
  const isSearchMode = useRef<boolean>(false);
  /**
   * if search is performed = timestamp otherwise undefined
   */
  // const lastSearchTimestamp = useRef<number>(undefined);
  const directoryMeta = useRef<TS.FileSystemEntryMeta>({ id: getUuid() });
  /**
   * isMetaLoaded boolean if thumbs and description from meta are loaded
   * is using why directoryMeta can be loaded but empty
   * undefined means no .ts folder exist
   */
  const isMetaLoaded = useRef<boolean>(undefined);
  //const isMetaFolderExist = useRef<boolean>(undefined);
  const currentDirectoryPath = useRef<string>(undefined);
  const currentPerspective = useRef<string>(PerspectiveIDs.UNSPECIFIED);
  const currentDirectoryFiles = useRef<TS.OrderVisibilitySettings[]>([]);
  const currentDirectoryDirs = useRef<TS.OrderVisibilitySettings[]>([]);
  // const firstRender = useFirstRender();
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  useEffect(() => {
    if (currentLocation) {
      getLocationPath(currentLocation).then((locationPath) => {
        currentLocationPath.current = locationPath;
        if (!skipInitialDirList) {
          return openDirectory(locationPath);
        }
      });
    } else {
      currentLocationPath.current = '';
      clearDirectoryContent();
      exitSearchMode();
    }
  }, [currentLocation]);

  /**
   * HANDLE REFLECT_RENAME_ENTRY
   */
  /*useEffect(() => {
    if (!firstRender && editedEntryPaths && editedEntryPaths.length > 0) {
      let action;
      for (const editedEntryPath of editedEntryPaths) {
        action = editedEntryPath.action;
      }
      if (action === 'rename') {
        const oldFilePath = editedEntryPaths[0].path;
        const newFilePath = editedEntryPaths[1].path;
        const entry = currentDirectoryEntries.find(
          (e) => e.path === oldFilePath,
        );
        if (entry) {
          const fileNameTags = entry.isFile
            ? extractTagsAsObjects(
                newFilePath,
                AppConfig.tagDelimiter,
                PlatformIO.getDirSeparator(),
              )
            : []; // dirs dont have tags in filename
          const newEntry = {
            ...entry,
            path: newFilePath,
            name: extractFileName(newFilePath, PlatformIO.getDirSeparator()),
            extension: extractFileExtension(
              newFilePath,
              PlatformIO.getDirSeparator(),
            ),
            tags: [
              ...entry.tags.filter((tag) => tag.type !== 'plain'), //'sidecar'), // add only sidecar tags
              ...fileNameTags,
            ],
          };
          const newDirectoryEntries = currentDirectoryEntries.map((entry) =>
            entry.path === oldFilePath ? newEntry : entry,
          );
          /!*if (searchMode.current) {
            GlobalSearch.getInstance().setResults(newDirectoryEntries);
          } else {*!/
          setCurrentDirectoryEntries(newDirectoryEntries);
          // setSelectedEntries newEntry to scroll into it
          setSelectedEntries([newEntry]);
          //}
        }
      }
    }
  }, [editedEntryPaths]);*/

  const reflectRenameEntries = useMemo(() => {
    return (paths: Array<string[]>): Promise<boolean> => {
      const metaChanged = [];
      const newEntries = paths
        .map((path) => {
          const entry = currentDirectoryEntries.find((e) => e.path === path[0]);
          if (path[0] === path[1]) {
            metaChanged.push(entry);
            return undefined;
          }
          return getNewEntry(entry, path[1]);
        })
        .filter((item) => item !== undefined);
      if (newEntries.length > 0) {
        const newDirectoryEntries = currentDirectoryEntries.map((entry) => {
          const newEntry = newEntries.find(
            (nEntry) => nEntry && nEntry.uuid === entry.uuid,
          );
          if (newEntry) {
            return newEntry;
          }
          return entry;
        });
        setCurrentDirectoryEntries(newDirectoryEntries);
        setSelectedEntries(newEntries);
      }

      if (metaChanged.length > 0) {
        const enhancedEntriesPromises = metaChanged.map((entry) =>
          getMetaForEntry(entry),
        );
        Promise.allSettled(enhancedEntriesPromises).then((results) => {
          const entries = results
            .filter(({ status }) => status === 'fulfilled')
            .map(
              (p) => (p as PromiseFulfilledResult<TS.FileSystemEntry>).value,
            );
          updateCurrentDirEntries(entries);
        });
        /* Promise.all(enhancedEntriesPromises).then((entries) => {
          updateCurrentDirEntries(entries);
        });*/
      }
      return Promise.resolve(true);
    };
  }, [currentDirectoryEntries]);

  function getNewEntry(entry: TS.FileSystemEntry, newPath): TS.FileSystemEntry {
    if (entry) {
      const fileNameTags = entry.isFile
        ? extractTagsAsObjects(
            newPath,
            AppConfig.tagDelimiter,
            PlatformIO.getDirSeparator(),
          )
        : []; // dirs dont have tags in filename
      return {
        ...entry,
        path: newPath,
        name: extractFileName(newPath, PlatformIO.getDirSeparator()),
        extension: extractFileExtension(newPath, PlatformIO.getDirSeparator()),
        tags: [
          ...entry.tags.filter((tag) => tag.type !== 'plain'), //'sidecar'), // add only sidecar tags
          ...fileNameTags,
        ],
      };
    }
    return undefined;
  }

  function exitSearchMode() {
    isSearchMode.current = false;
    dispatch(AppActions.setSearchFilter(undefined));
    forceUpdate();
  }

  function enterSearchMode() {
    isSearchMode.current = true;
    forceUpdate();
  }

  function setSearchResults(searchResults: TS.FileSystemEntry[]) {
    setCurrentDirectoryEntries(searchResults);
  }

  function appendSearchResults(searchResults: TS.FileSystemEntry[]) {
    const newSearchResults = searchResults.filter(
      (result) =>
        !currentDirectoryEntries.some((entry) => entry.path === result.path),
    );
    if (newSearchResults.length > 0) {
      setSearchResults([...currentDirectoryEntries, ...newSearchResults]);
    }
  }

  function loadParentDirectoryContent() {
    if (isSearchMode.current) {
      exitSearchMode();
    }

    // dispatch(actions.setIsLoading(true));

    if (currentDirectoryPath.current !== undefined) {
      const parentDirectory = extractParentDirectoryPath(
        currentDirectoryPath.current,
        PlatformIO.getDirSeparator(),
      );
      console.log(
        'parentDirectory: ' +
          parentDirectory +
          ' - currentLocationPath: ' +
          currentLocationPath.current,
      );
      if (parentDirectory.includes(currentLocationPath.current)) {
        openDirectory(parentDirectory);
      } else {
        showNotification(t('core:parentDirNotInLocation'), 'warning', true);
        // dispatch(actions.setIsLoading(false));
      }
    } else {
      showNotification(t('core:firstOpenaFolder'), 'warning', true);
      // dispatch(actions.setIsLoading(false));
    }
  }

  const updateCurrentDirEntry = useMemo(() => {
    return (path: string, entry: any) => {
      if (path === currentDirectoryPath.current) {
        directoryMeta.current = directoryMeta.current
          ? { ...directoryMeta.current, ...entry }
          : entry;
      }
      const entryUpdated = { ...entry, ...(!entry.path && { path: path }) };
      /*if (searchMode.current) {
        const results = updateFsEntries(
          GlobalSearch.getInstance().getResults(),
          [entryUpdated]
        );
        GlobalSearch.getInstance().setResults(results);
      } else {*/
      setCurrentDirectoryEntries(
        updateFsEntries(currentDirectoryEntries, [entryUpdated]),
      );
    };
  }, [currentDirectoryEntries]);

  const getMergedEntries = (entries1, entries2) => {
    if (entries1 && entries1.length > 0) {
      return entries1.map((currentEntry) => {
        const updatedEntries = entries2.filter(
          (newEntry) => newEntry && newEntry.path === currentEntry.path,
        );
        if (updatedEntries && updatedEntries.length > 0) {
          const updatedEntry = updatedEntries.reduce(
            (prevValue, currentValue) =>
              merge(currentValue, prevValue) as TS.FileSystemEntry,
          );
          return merge(updatedEntry, { ...currentEntry, tags: [] });
        }
        return currentEntry;
      });
    }
    return entries2;
  };

  function updateCurrentDirEntries(
    dirEntries: TS.FileSystemEntry[],
    currentDirEntries?: TS.FileSystemEntry[],
  ) {
    if (dirEntries) {
      const entries = dirEntries.filter((e) => e !== undefined);
      if (entries.length > 0) {
        const currDirEntries = currentDirEntries
          ? currentDirEntries
          : currentDirectoryEntries;
        if (currDirEntries && currDirEntries.length > 0) {
          setCurrentDirectoryEntries(getMergedEntries(currDirEntries, entries));
        } else {
          setCurrentDirectoryEntries(entries);
        }
      }
    }
  }

  function updateThumbnailUrl(filePath: string, thumbUrl: string) {
    const dirEntries = currentDirectoryEntries.map((entry) => {
      if (entry.path === filePath) {
        return { ...entry, thumbPath: thumbUrl };
      }
      return entry;
    });
    setCurrentDirectoryEntries(dirEntries);
  }

  function loadDirectoryContent(
    directoryPath: string,
    loadDirMeta = false,
    showHiddenEntries = undefined,
  ): Promise<TS.FileSystemEntry[]> {
    // console.debug('loadDirectoryContent:' + directoryPath);
    window.walkCanceled = false;

    // dispatch(actions.setIsLoading(true));

    if (selectedEntries.length > 0) {
      setSelectedEntries([]);
    }
    if (loadDirMeta) {
      const metaDirectory = getMetaDirectoryPath(directoryPath);
      return PlatformIO.checkDirExist(metaDirectory).then((exist) => {
        if (exist) {
          //isMetaFolderExist.current = true;
          const metaFilePath = getMetaFileLocationForDir(
            directoryPath,
            PlatformIO.getDirSeparator(),
          );
          return loadJSONFile(metaFilePath)
            .then((fsEntryMeta) => {
              isMetaLoaded.current = true;
              return loadDirectoryContentInt(
                directoryPath,
                fsEntryMeta,
                showHiddenEntries,
              );
            })
            .catch((err) => {
              console.debug(
                'Error loading meta of:' + directoryPath + ' ' + err,
              );
              isMetaLoaded.current = true;
              return loadDirectoryContentInt(
                directoryPath,
                undefined,
                showHiddenEntries,
              );
            });
        } else {
          //isMetaFolderExist.current = false;
          return loadDirectoryContentInt(
            directoryPath,
            undefined,
            showHiddenEntries,
          );
        }
      });
    } else {
      isMetaLoaded.current = false;
      return loadDirectoryContentInt(
        directoryPath,
        undefined,
        showHiddenEntries,
      );
    }
  }

  function loadDirectoryContentInt(
    directoryPath: string,
    fsEntryMeta?: TS.FileSystemEntryMeta,
    showHiddenEntries = undefined,
  ): Promise<TS.FileSystemEntry[]> {
    showNotification(t('core:loading'), 'info', false);
    const resultsLimit = {
      maxLoops:
        currentLocation && currentLocation.maxLoops
          ? currentLocation.maxLoops
          : AppConfig.maxLoops,
      IsTruncated: false,
    };
    return PlatformIO.listDirectoryPromise(
      directoryPath,
      [],
      /*fsEntryMeta &&
        fsEntryMeta.perspective &&
        (fsEntryMeta.perspective === PerspectiveIDs.KANBAN ||
          fsEntryMeta.perspective === PerspectiveIDs.GALLERY)
        ? [] //'extractThumbPath']
        : [], // mode,*/
      currentLocation ? currentLocation.ignorePatternPaths : [],
      resultsLimit,
    )
      .then((results) => {
        if (resultsLimit.IsTruncated) {
          //OPEN ISTRUNCATED dialog
          dispatch(AppActions.toggleTruncatedConfirmDialog());
        }
        updateHistory(
          { ...currentLocation, path: currentLocationPath.current },
          directoryPath,
        );
        if (results !== undefined) {
          // console.debug('app listDirectoryPromise resolved:' + results.length);
          return loadDirectorySuccess(
            directoryPath,
            results,
            fsEntryMeta,
            showHiddenEntries,
          );
        }
        /*dispatch(
          AppActions.updateCurrentDirectoryPerspective(
            fsEntryMeta ? fsEntryMeta.perspective : undefined
          )
        );*/
        return [];
      })
      .catch((error) => {
        // console.timeEnd('listDirectoryPromise');
        return loadDirectoryFailure(error);
        /*dispatch(
          AppActions.updateCurrentDirectoryPerspective(
            fsEntryMeta ? fsEntryMeta.perspective : undefined
          )
        );*/
      });
  }

  function clearDirectoryContent() {
    currentDirectoryPath.current = undefined;
    setCurrentDirectoryEntries([]);
  }

  function openCurrentDirectory(
    showHiddenEntries = undefined,
  ): Promise<boolean> {
    if (currentDirectoryPath.current !== undefined) {
      return openDirectory(currentDirectoryPath.current, showHiddenEntries);
    }
    return Promise.resolve(false);
  }

  function openDirectory(
    dirPath: string,
    showHiddenEntries = undefined,
  ): Promise<boolean> {
    if (dirPath !== undefined) {
      return loadDirectoryContent(dirPath, true, showHiddenEntries).then(
        (dirEntries) => {
          if (dirEntries) {
            return loadCurrentDirMeta(dirPath, dirEntries).then((entries) => {
              updateCurrentDirEntries(entries, dirEntries);
              return true;
            });
          }
        },
      );
    }
    return Promise.resolve(false);
  }

  function loadDirectorySuccess(
    directoryPath: string,
    dirEntries: TS.FileSystemEntry[],
    dirMeta?: TS.FileSystemEntryMeta,
    showHiddenEntries = undefined,
  ): TS.FileSystemEntry[] {
    hideNotifications(['error']);

    if (dirMeta) {
      directoryMeta.current = dirMeta;
      if (dirMeta.perspective) {
        currentPerspective.current = dirMeta.perspective;
      } else {
        currentPerspective.current = PerspectiveIDs.UNSPECIFIED;
      }
      if (dirMeta.customOrder) {
        if (dirMeta.customOrder.files) {
          currentDirectoryFiles.current = dirMeta.customOrder.files;
        }
        if (dirMeta.customOrder.folders) {
          currentDirectoryDirs.current = dirMeta.customOrder.folders;
        }
      }
    } else {
      directoryMeta.current = undefined;
      currentPerspective.current = PerspectiveIDs.UNSPECIFIED;
    }
    const directoryContent = enhanceDirectoryContent(
      dirEntries,
      currentLocation && currentLocation.type === locationType.TYPE_CLOUD,
      true,
      undefined,
      showHiddenEntries,
    );

    isSearchMode.current = false;

    /*if (
      currentDirectoryPath.current &&
      currentDirectoryPath.current.startsWith('./')
    ) {
      // relative paths
      currentDirectoryPath.current = PlatformIO.resolveFilePath(
        currentDirectoryPath.current
      );
    } else {*/
    //}
    setCurrentDirectoryEntries(directoryContent);
    currentDirectoryPath.current = directoryPath;
    return directoryContent;
  }

  function loadDirectoryFailure(error?: any) {
    console.log('Error loading directory: ', error);
    //hideNotifications();

    showNotification(
      t('core:errorLoadingFolder') + ': ' + error.message,
      'warning',
      false,
    );
    closeAllLocations();
    return [];
  }

  function setCurrentDirectoryColor(color: string) {
    if (directoryMeta) {
      directoryMeta.current.color = color;
    }
  }

  const enhanceDirectoryContent = useMemo(() => {
    return (
      dirEntries,
      isCloudLocation,
      showDirs = true,
      limit = undefined,
      showHiddenEntries = undefined,
    ) => {
      const directoryContent = [];
      const showHidden =
        showHiddenEntries !== undefined
          ? showHiddenEntries
          : showUnixHiddenEntries;
      dirEntries.map((entry) => {
        if (!showHidden && entry.name.startsWith('.')) {
          return true;
        }

        if (!showDirs && !entry.isFile) {
          return true;
        }

        if (limit !== undefined && directoryContent.length >= limit) {
          return true;
        }

        const enhancedEntry: TS.FileSystemEntry = enhanceEntry(
          entry,
          AppConfig.tagDelimiter,
          PlatformIO.getDirSeparator(),
        );
        directoryContent.push(enhancedEntry);
        return true;
      });

      return directoryContent;
    };
  }, [showUnixHiddenEntries]);

  function setCurrentDirectoryPerspective(
    perspective: string,
    reload: boolean = true,
  ) {
    currentPerspective.current = perspective;
    setSelectedEntries([]);
    /*if (PerspectiveIDs.KANBAN === perspective) {
      // many items can't be selected in KanBan
      if (selectedEntries.length > 1) {
        setSelectedEntries([selectedEntries[selectedEntries.length - 1]]);
      }
    }*/
    if (reload) {
      forceUpdate();
    }
  }

  /*const currentDirectoryPerspective: string = useMemo(
    () => currentPerspective.current,
    [currentDirectoryPath.current, currentPerspective.current]
  );*/

  function setCurrentDirectoryDirs(dirs: TS.OrderVisibilitySettings[]) {
    currentDirectoryDirs.current = dirs;
  }

  function setCurrentDirectoryFiles(files: TS.OrderVisibilitySettings[]) {
    currentDirectoryFiles.current = files;
  }

  const addDirectoryEntries = useMemo(() => {
    return (entries: TS.FileSystemEntry[]) => {
      setCurrentDirectoryEntries([...currentDirectoryEntries, ...entries]);
    };
  }, [currentDirectoryEntries]);

  const removeDirectoryEntries = useMemo(() => {
    return (entryPaths: string[]) => {
      if (entryPaths.some((ePath) => ePath === currentDirectoryPath.current)) {
        //handle currentDirectoryPath deleted
        return openDirectory(
          extractContainingDirectoryPath(
            currentDirectoryPath.current,
            PlatformIO.getDirSeparator(),
          ),
        );
      } else {
        const entries = currentDirectoryEntries.filter(
          (entry) => !entryPaths.includes(entry.path),
        );
        setCurrentDirectoryEntries(entries);
      }
    };
  }, [currentDirectoryEntries]);

  function setDirectoryMeta(meta: TS.FileSystemEntryMeta) {
    directoryMeta.current = meta;
    isMetaLoaded.current = true;
    forceUpdate();
  }

  function setSearchQuery(sQuery: TS.SearchQuery) {
    if (Object.keys(searchQuery).length === 0) {
      exitSearchMode();
    } else {
      isSearchMode.current = true;
      searchQuery.current = sQuery;
      const searchTitle = defaultTitle(sQuery);
      if (searchTitle.length > 0 && Pro && Pro.history) {
        const historyKeys = Pro.history.historyKeys;
        if (currentLocation) {
          Pro.history.saveHistory(
            historyKeys.searchHistoryKey,
            {
              path:
                searchTitle +
                ' ' +
                (currentLocation.path
                  ? currentLocation.path
                  : currentLocation.name),
              url: '/',
              lid: currentLocation.uuid,
              searchQuery: sQuery,
            },
            searchHistoryKey,
          );
        }
      }
      forceUpdate();
    }
  }

  function updateTagColors(tags: TS.Tag[]) {
    return tags.map((tag) => {
      const tagColors = getTagColors(
        tag.title,
        defaultTextColor,
        defaultBackgroundColor,
      );
      return {
        ...tag,
        ...tagColors,
      };
    });
  }

  function findFromSavedSearch(uuid: string) {
    const savedSearch = searches.find((search) => search.uuid === uuid);
    if (!savedSearch) {
      return true;
    }

    setSearchQuery({
      ...savedSearch,
      ...(savedSearch.tagsAND && {
        tagsAND: updateTagColors(savedSearch.tagsAND),
      }),
      ...(savedSearch.tagsNOT && {
        tagsNOT: updateTagColors(savedSearch.tagsNOT),
      }),
      ...(savedSearch.tagsOR && {
        tagsOR: updateTagColors(savedSearch.tagsOR),
      }),
      showUnixHiddenEntries,
      executeSearch: true,
    });
  }

  const context = useMemo(() => {
    return {
      currentLocationPath: currentLocationPath.current,
      currentDirectoryEntries: currentDirectoryEntries,
      directoryMeta: directoryMeta.current,
      currentDirectoryPerspective: currentPerspective.current,
      currentDirectoryPath: currentDirectoryPath.current,
      currentDirectoryFiles: currentDirectoryFiles.current,
      currentDirectoryDirs: currentDirectoryDirs.current,
      //isMetaFolderExist: isMetaFolderExist.current,
      searchQuery: searchQuery.current,
      isSearchMode: isSearchMode.current,
      setCurrentDirectoryEntries,
      updateCurrentDirEntry,
      setSearchQuery,
      loadDirectoryContent,
      loadParentDirectoryContent,
      enhanceDirectoryContent,
      openDirectory,
      openCurrentDirectory,
      clearDirectoryContent,
      setCurrentDirectoryPerspective,
      setCurrentDirectoryColor,
      setCurrentDirectoryDirs,
      setCurrentDirectoryFiles,
      addDirectoryEntries,
      removeDirectoryEntries,
      reflectRenameEntries,
      updateCurrentDirEntries,
      updateThumbnailUrl,
      setDirectoryMeta,
      setSearchResults,
      appendSearchResults,
      enterSearchMode,
      exitSearchMode,
      findFromSavedSearch,
    };
  }, [
    currentLocation,
    currentLocationPath.current,
    currentDirectoryEntries,
    currentDirectoryPath.current,
    directoryMeta.current,
    currentPerspective.current,
    //isMetaFolderExist.current,
    currentDirectoryFiles.current,
    currentDirectoryDirs.current,
    isSearchMode.current,
    searchQuery.current,
  ]);

  return (
    <DirectoryContentContext.Provider value={context}>
      {children}
    </DirectoryContentContext.Provider>
  );
};
