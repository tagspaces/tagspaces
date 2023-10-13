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
  useState
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { locationType } from '@tagspaces/tagspaces-common/misc';
import {
  actions as AppActions,
  AppDispatch,
  getEditedEntryPaths,
  getSelectedEntries
} from '-/reducers/app';
import { TS } from '-/tagspaces.namespace';
import { useTranslation } from 'react-i18next';
import {
  extractFileName,
  extractFileExtension,
  extractTagsAsObjects,
  extractParentDirectoryPath,
  getMetaFileLocationForDir,
  getThumbFileLocationForDirectory,
  normalizePath,
  getMetaDirectoryPath
} from '@tagspaces/tagspaces-common/paths';
import PlatformIO from '-/services/platform-facade';
import {
  getMetaForEntry,
  loadJSONFile,
  merge,
  updateFsEntries
} from '-/services/utils-io';
import AppConfig from '-/AppConfig';
import { PerspectiveIDs } from '-/perspectives';
import { updateHistory } from '-/utils/dom';
import { getShowUnixHiddenEntries } from '-/reducers/settings';
import { enhanceEntry, getUuid } from '@tagspaces/tagspaces-common/utils-io';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { Pro } from '-/pro';
import useFirstRender from '-/utils/useFirstRender';
import { useNotificationContext } from '-/hooks/useNotificationContext';

type DirectoryContentContextData = {
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
  isMetaFolderExist: boolean;
  isSearchMode: boolean;
  loadParentDirectoryContent: () => void;
  loadDirectoryContent: (
    directoryPath: string,
    loadDirMeta?: boolean
  ) => Promise<boolean>;
  enhanceDirectoryContent: (
    dirEntries,
    isCloudLocation,
    showDirs?: boolean,
    limit?: number,
    getDirMeta?: boolean,
    generateThumbnails?: boolean
  ) => any;
  openCurrentDirectory: () => Promise<boolean>;
  clearDirectoryContent: () => void;
  setCurrentDirectoryPerspective: (perspective: string) => void;
  setCurrentDirectoryColor: (color: string) => void;
  setCurrentDirectoryDirs: (dirs: TS.OrderVisibilitySettings[]) => void;
  setCurrentDirectoryFiles: (files: TS.OrderVisibilitySettings[]) => void;
  updateCurrentDirEntry: (path: string, entry: TS.FileSystemEntry) => void;
  updateCurrentDirEntries: (dirEntries: TS.FileSystemEntry[]) => void;
  updateThumbnailUrl: (filePath: string, thumbUrl: string) => void;
  setDirectoryMeta: (meta: TS.FileSystemEntryMeta) => void;
  watchForChanges: (location?: TS.Location) => void;
  getEnhancedDir: (entry: TS.FileSystemEntry) => Promise<TS.FileSystemEntry>;
  setSearchResults: (entries: TS.FileSystemEntry[]) => void;
  appendSearchResults: (entries: TS.FileSystemEntry[]) => void;
  enterSearchMode: () => void;
  exitSearchMode: () => void;
};

export const DirectoryContentContext = createContext<
  DirectoryContentContextData
>({
  currentDirectoryEntries: [],
  directoryMeta: undefined,
  currentDirectoryPerspective: undefined,
  currentDirectoryPath: undefined,
  currentDirectoryFiles: [],
  currentDirectoryDirs: [],
  //isMetaLoaded: undefined,
  isMetaFolderExist: false,
  isSearchMode: false,
  loadParentDirectoryContent: () => {},
  loadDirectoryContent: () => Promise.resolve(false),
  enhanceDirectoryContent: () => {},
  openCurrentDirectory: () => Promise.resolve(false),
  clearDirectoryContent: () => {},
  setCurrentDirectoryPerspective: () => {},
  setCurrentDirectoryColor: () => {},
  setCurrentDirectoryDirs: () => {},
  setCurrentDirectoryFiles: () => {},
  updateCurrentDirEntry: () => {},
  updateCurrentDirEntries: () => {},
  updateThumbnailUrl: () => {},
  setDirectoryMeta: () => {},
  watchForChanges: () => {},
  getEnhancedDir: () => Promise.resolve(undefined),
  setSearchResults: () => {},
  appendSearchResults: () => {},
  enterSearchMode: () => {},
  exitSearchMode: () => {}
});

export type DirectoryContentContextProviderProps = {
  children: React.ReactNode;
};

export const DirectoryContentContextProvider = ({
  children
}: DirectoryContentContextProviderProps) => {
  const dispatch: AppDispatch = useDispatch();
  const { t } = useTranslation();
  const { closeAllLocations, currentLocation } = useCurrentLocationContext();
  const { showNotification, hideNotifications } = useNotificationContext();
  const selectedEntries = useSelector(getSelectedEntries);
  //const useGenerateThumbnails = useSelector(getUseGenerateThumbnails);
  const showUnixHiddenEntries = useSelector(getShowUnixHiddenEntries);
  const editedEntryPaths = useSelector(getEditedEntryPaths);
  //const enableWS = useSelector(getEnableWS);

  const [currentDirectoryEntries, setCurrentDirectoryEntries] = useState<
    TS.FileSystemEntry[]
  >([]);
  const isSearchMode = useRef<boolean>(false);
  /**
   * if search is performed = timestamp otherwise undefined
   */
  const lastSearchTimestamp = useRef<number>(undefined);
  const directoryMeta = useRef<TS.FileSystemEntryMeta>({ id: getUuid() });
  /**
   * isMetaLoaded boolean if thumbs and description from meta are loaded
   * is using why directoryMeta can be loaded but empty
   * undefined means no .ts folder exist
   */
  const isMetaLoaded = useRef<boolean>(undefined);
  const isMetaFolderExist = useRef<boolean>(undefined);
  const currentDirectoryPath = useRef<string>(undefined);
  const currentPerspective = useRef<string>(PerspectiveIDs.UNSPECIFIED);
  const currentDirectoryFiles = useRef<TS.OrderVisibilitySettings[]>([]);
  const currentDirectoryDirs = useRef<TS.OrderVisibilitySettings[]>([]);
  const firstRender = useFirstRender();
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0, undefined);

  useEffect(() => {
    if (currentLocation) {
      loadDirectoryContent(PlatformIO.getLocationPath(currentLocation), true);
      if (currentLocation.type !== locationType.TYPE_CLOUD) {
        watchForChanges(currentLocation);
      }
    } else {
      clearDirectoryContent();
      exitSearchMode();
      if (Pro && Pro.Watcher) {
        Pro.Watcher.stopWatching();
      }
    }
  }, [currentLocation]);

  /**
   * HANDLE REFLECT_RENAME_ENTRY
   */
  useEffect(() => {
    if (!firstRender && editedEntryPaths && editedEntryPaths.length > 0) {
      let action;
      for (const editedEntryPath of editedEntryPaths) {
        action = editedEntryPath.action;
      }
      if (action === 'rename') {
        const oldFilePath = editedEntryPaths[0].path;
        const newFilePath = editedEntryPaths[1].path;
        const entry = currentDirectoryEntries.find(e => e.path === oldFilePath);
        if (entry) {
          const fileNameTags = entry.isFile
            ? extractTagsAsObjects(
                newFilePath,
                AppConfig.tagDelimiter,
                PlatformIO.getDirSeparator()
              )
            : []; // dirs dont have tags in filename
          const newEntry = {
            ...entry,
            path: newFilePath,
            name: extractFileName(newFilePath, PlatformIO.getDirSeparator()),
            extension: extractFileExtension(
              newFilePath,
              PlatformIO.getDirSeparator()
            ),
            tags: [
              ...entry.tags.filter(tag => tag.type !== 'plain'), //'sidecar'), // add only sidecar tags
              ...fileNameTags
            ]
          };
          const newDirectoryEntries = currentDirectoryEntries.map(entry =>
            entry.path === oldFilePath ? newEntry : entry
          );
          /*if (searchMode.current) {
            GlobalSearch.getInstance().setResults(newDirectoryEntries);
          } else {*/
          setCurrentDirectoryEntries(newDirectoryEntries);
          //}
        }
      } else if (action === 'delete') {
        const filePath = editedEntryPaths[0].path;
        const newDirectoryEntries = currentDirectoryEntries.filter(
          entry => entry.path !== filePath
        );

        /*if (searchMode.current) {
          GlobalSearch.getInstance().setResults(newDirectoryEntries);
        } else {*/
        setCurrentDirectoryEntries(newDirectoryEntries);
      }
    }
  }, [editedEntryPaths]);

  function exitSearchMode() {
    isSearchMode.current = false;
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
      result =>
        !currentDirectoryEntries.some(entry => entry.path === result.path)
    );
    if (newSearchResults.length > 0) {
      setSearchResults([...currentDirectoryEntries, ...newSearchResults]);
    }
  }

  function loadParentDirectoryContent() {
    if (isSearchMode.current) {
      exitSearchMode();
    }
    const currentLocationPath = normalizePath(currentLocation.path);

    // dispatch(actions.setIsLoading(true));

    if (currentDirectoryPath.current) {
      const parentDirectory = extractParentDirectoryPath(
        currentDirectoryPath.current,
        PlatformIO.getDirSeparator()
      );
      // console.log('parentDirectory: ' + parentDirectory  + ' - currentLocationPath: ' + currentLocationPath);
      if (parentDirectory.includes(currentLocationPath)) {
        loadDirectoryContent(parentDirectory, true);
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
      const entryUpdated = { ...entry, ...(!entry.path && { path: path }) };
      /*if (searchMode.current) {
        const results = updateFsEntries(
          GlobalSearch.getInstance().getResults(),
          [entryUpdated]
        );
        GlobalSearch.getInstance().setResults(results);
      } else {*/
      setCurrentDirectoryEntries(
        updateFsEntries(currentDirectoryEntries, [entryUpdated])
      );
    };
  }, [currentDirectoryEntries]);

  const getMergedEntries = (entries1, entries2) => {
    if (entries1 && entries1.length > 0) {
      return entries1.map(currentEntry => {
        const updatedEntries = entries2.filter(
          newEntry => newEntry && newEntry.path === currentEntry.path
        );
        if (updatedEntries && updatedEntries.length > 0) {
          const updatedEntry = updatedEntries.reduce(
            (prevValue, currentValue) =>
              merge(currentValue, prevValue) as TS.FileSystemEntry
          );
          return merge(updatedEntry, currentEntry);
        }
        return currentEntry;
      });
    }
    return entries2;
  };

  const updateCurrentDirEntries = useMemo(() => {
    return (dirEntries: TS.FileSystemEntry[]) => {
      if (currentDirectoryEntries && currentDirectoryEntries.length > 0) {
        setCurrentDirectoryEntries(
          getMergedEntries(currentDirectoryEntries, dirEntries)
        );
      } else {
        setCurrentDirectoryEntries(dirEntries);
      }
    };
  }, [currentDirectoryEntries]);

  function updateThumbnailUrl(filePath: string, thumbUrl: string) {
    const dirEntries = currentDirectoryEntries.map(entry => {
      if (entry.path === filePath) {
        return { ...entry, thumbPath: thumbUrl };
      }
      return entry;
    });
    setCurrentDirectoryEntries(dirEntries);
  }

  /*const getEnhancedDirs: Promise<TS.FileSystemEntry>[] = useMemo(() => {
    return currentDirectoryEntries
      .filter(entry => !entry.isFile)
      .map(entry => getEnhancedDir(entry));
  }, [currentDirectoryEntries]);*/

  const getEnhancedDir = (
    entry: TS.FileSystemEntry
  ): Promise<TS.FileSystemEntry> => {
    if (!entry) {
      return Promise.resolve(undefined);
    }
    if (entry.isFile) {
      return Promise.reject(
        new Error('getEnhancedDir accept dir only:' + entry.path)
      );
    }
    if (entry.name === AppConfig.metaFolder) {
      return Promise.resolve(undefined);
    }
    return PlatformIO.listMetaDirectoryPromise(entry.path).then(meta => {
      const metaFilePath = getMetaFileLocationForDir(
        entry.path,
        PlatformIO.getDirSeparator()
      );
      const thumbDirPath = getThumbFileLocationForDirectory(
        entry.path,
        PlatformIO.getDirSeparator()
      );
      let enhancedEntry;
      if (meta.some(metaFile => thumbDirPath.endsWith(metaFile.path))) {
        const thumbPath =
          PlatformIO.haveObjectStoreSupport() || PlatformIO.haveWebDavSupport()
            ? PlatformIO.getURLforPath(thumbDirPath)
            : thumbDirPath;
        enhancedEntry = { ...entry, thumbPath };
      }
      if (
        meta.some(metaFile => metaFilePath.endsWith(metaFile.path)) &&
        entry.path.indexOf(
          AppConfig.metaFolder + PlatformIO.getDirSeparator()
        ) === -1
      ) {
        return getMetaForEntry(enhancedEntry || entry, metaFilePath);
      }
      return enhancedEntry;
    });
  };

  function loadDirectoryContent(
    directoryPath: string,
    loadDirMeta = false
  ): Promise<boolean> {
    // console.debug('loadDirectoryContent:' + directoryPath);
    window.walkCanceled = false;

    // dispatch(actions.setIsLoading(true));

    if (selectedEntries.length > 0) {
      dispatch(AppActions.setSelectedEntries([]));
    }
    if (loadDirMeta) {
      const metaDirectory = getMetaDirectoryPath(directoryPath);
      return PlatformIO.checkDirExist(metaDirectory).then(exist => {
        if (exist) {
          isMetaFolderExist.current = true;
          const metaFilePath = getMetaFileLocationForDir(
            directoryPath,
            PlatformIO.getDirSeparator()
          );
          return loadJSONFile(metaFilePath)
            .then(fsEntryMeta => {
              isMetaLoaded.current = true;
              return loadDirectoryContentInt(
                directoryPath,
                fsEntryMeta
                // description: getDescriptionPreview(fsEntryMeta.description, 200)
              );
            })
            .catch(err => {
              console.debug(
                'Error loading meta of:' + directoryPath + ' ' + err
              );
              isMetaLoaded.current = false;
              return loadDirectoryContentInt(directoryPath);
            });
        } else {
          isMetaFolderExist.current = false;
          return loadDirectoryContentInt(directoryPath);
        }
      });
    } else {
      isMetaLoaded.current = false;
      return loadDirectoryContentInt(directoryPath);
    }
  }

  function loadDirectoryContentInt(
    directoryPath: string,
    fsEntryMeta?: TS.FileSystemEntryMeta
  ): Promise<boolean> {
    showNotification(t('core:loading'), 'info', false);
    const resultsLimit = {
      maxLoops:
        currentLocation && currentLocation.maxLoops
          ? currentLocation.maxLoops
          : AppConfig.maxLoops,
      IsTruncated: false
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
      resultsLimit
    )
      .then(results => {
        if (resultsLimit.IsTruncated) {
          //OPEN ISTRUNCATED dialog
          dispatch(AppActions.toggleTruncatedConfirmDialog());
        }
        updateHistory(currentLocation, directoryPath);
        if (results !== undefined) {
          // console.debug('app listDirectoryPromise resolved:' + results.length);
          return loadDirectorySuccess(directoryPath, results, fsEntryMeta);
        }
        /*dispatch(
          AppActions.updateCurrentDirectoryPerspective(
            fsEntryMeta ? fsEntryMeta.perspective : undefined
          )
        );*/
        return true;
      })
      .catch(error => {
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

  function openCurrentDirectory(): Promise<boolean> {
    if (currentDirectoryPath.current) {
      return loadDirectoryContent(currentDirectoryPath.current, true);
    }
    return Promise.resolve(false);
  }

  function loadDirectorySuccess(
    directoryPath: string,
    dirEntries: TS.FileSystemEntry[],
    dirMeta?: TS.FileSystemEntryMeta
  ): boolean {
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
      currentPerspective.current = PerspectiveIDs.UNSPECIFIED;
    }
    const directoryContent = enhanceDirectoryContent(
      dirEntries,
      currentLocation && currentLocation.type === locationType.TYPE_CLOUD,
      true
    );

    isSearchMode.current = false;
    setCurrentDirectoryEntries(directoryContent);

    if (
      currentDirectoryPath.current &&
      currentDirectoryPath.current.startsWith('./')
    ) {
      // relative paths
      currentDirectoryPath.current = PlatformIO.resolveFilePath(
        currentDirectoryPath.current
      );
    } else {
      currentDirectoryPath.current = directoryPath;
    }
    return true;
  }

  function loadDirectoryFailure(error?: any): boolean {
    console.error('Error loading directory: ', error);
    //hideNotifications();

    showNotification(
      t('core:errorLoadingFolder') + ': ' + error.message,
      'warning',
      false
    );
    closeAllLocations();
    return false;
  }

  function setCurrentDirectoryColor(color: string) {
    if (directoryMeta) {
      directoryMeta.current.color = color;
    }
  }

  function enhanceDirectoryContent(
    dirEntries,
    isCloudLocation,
    showDirs = true,
    limit = undefined
  ) {
    const directoryContent = [];
    dirEntries.map(entry => {
      if (!showUnixHiddenEntries && entry.name.startsWith('.')) {
        return true;
      }

      if (!showDirs && !entry.isFile) {
        return true;
      }

      if (limit !== undefined && directoryContent.length >= limit) {
        return true;
      }

      /*if (getDirMeta && !entry.isFile) {
        dirsMetaPromises.push(getEnhancedDir(entry));
      }*/

      const enhancedEntry: TS.FileSystemEntry = enhanceEntry(
        entry,
        AppConfig.tagDelimiter,
        PlatformIO.getDirSeparator()
      );
      directoryContent.push(enhancedEntry);
      /*if (
        // Enable thumb generation by
        generateThumbnails &&
        !AppConfig.isWeb && // not in webdav mode
        !PlatformIO.haveObjectStoreSupport() && // not in object store mode
        !PlatformIO.haveWebDavSupport() && // not in webdav mode
        enhancedEntry.isFile && // only for files
        genThumbnails() // enabled in the settings
      ) {
        // const isPDF = enhancedEntry.path.endsWith('.pdf');
        if (
          isWorkerAvailable &&
          supportedImgsWS.includes(enhancedEntry.extension)
        ) {
          // !isPDF) {
          tmbGenerationList.push(enhancedEntry.path);
        } else if (
          supportedImgs.includes(enhancedEntry.extension) ||
          supportedContainers.includes(enhancedEntry.extension) ||
          supportedText.includes(enhancedEntry.extension) ||
          supportedMisc.includes(enhancedEntry.extension) ||
          supportedVideos.includes(enhancedEntry.extension)
        ) {
          tmbGenerationPromises.push(
            getThumbnailURLPromise(enhancedEntry.path)
          );
        } else {
          console.log(
            'Unsupported thumbgeneration ext:' + enhancedEntry.extension
          );
        }
      }*/
      return true;
    });

    return directoryContent;
    /*return {
      directoryContent,
      tmbGenerationPromises,
      tmbGenerationList,
      dirsMetaPromises
    };*/
  }

  function setCurrentDirectoryPerspective(
    perspective: string,
    reload: boolean = true
  ) {
    currentPerspective.current = perspective;
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

  function setDirectoryMeta(meta: TS.FileSystemEntryMeta) {
    directoryMeta.current = meta;
    isMetaLoaded.current = true;
  }

  function watchForChanges(location?: TS.Location) {
    if (location === undefined) {
      location = currentLocation;
    }
    if (Pro && Pro.Watcher && location && location.watchForChanges) {
      const depth =
        currentPerspective.current === PerspectiveIDs.KANBAN ? 3 : 1;
      Pro.Watcher.watchFolder(
        PlatformIO.getLocationPath(location),
        dispatch,
        loadDirectoryContent,
        depth
      );
    }
  }

  const context = useMemo(() => {
    return {
      currentDirectoryEntries: currentDirectoryEntries,
      directoryMeta: directoryMeta.current,
      currentDirectoryPerspective: currentPerspective.current,
      currentDirectoryPath: currentDirectoryPath.current,
      currentDirectoryFiles: currentDirectoryFiles.current,
      currentDirectoryDirs: currentDirectoryDirs.current,
      isMetaFolderExist: isMetaFolderExist.current,
      isSearchMode: isSearchMode.current,
      loadDirectoryContent,
      loadParentDirectoryContent,
      enhanceDirectoryContent,
      openCurrentDirectory,
      clearDirectoryContent,
      setCurrentDirectoryPerspective,
      setCurrentDirectoryColor,
      setCurrentDirectoryDirs,
      setCurrentDirectoryFiles,
      updateCurrentDirEntry,
      updateCurrentDirEntries,
      updateThumbnailUrl,
      setDirectoryMeta,
      watchForChanges,
      getEnhancedDir,
      setSearchResults,
      appendSearchResults,
      enterSearchMode,
      exitSearchMode
    };
  }, [
    currentLocation,
    currentDirectoryEntries,
    currentDirectoryPath.current,
    directoryMeta.current,
    currentPerspective.current,
    isMetaFolderExist.current,
    currentDirectoryFiles.current,
    currentDirectoryDirs.current,
    updateCurrentDirEntries,
    isSearchMode.current
  ]);

  return (
    <DirectoryContentContext.Provider value={context}>
      {children}
    </DirectoryContentContext.Provider>
  );
};
