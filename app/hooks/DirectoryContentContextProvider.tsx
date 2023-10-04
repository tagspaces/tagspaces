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
  getSelectedEntries,
  isSearchMode
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
  normalizePath
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
import {
  getEnableWS,
  getShowUnixHiddenEntries,
  getUseGenerateThumbnails
} from '-/reducers/settings';
import { enhanceEntry, getUuid } from '@tagspaces/tagspaces-common/utils-io';
import {
  getThumbnailURLPromise,
  supportedContainers,
  supportedImgs,
  supportedMisc,
  supportedText,
  supportedVideos
} from '-/services/thumbsgenerator';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import GlobalSearch from '-/services/search-index';
import { Pro } from '-/pro';
import useFirstRender from '-/utils/useFirstRender';

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
  isMetaLoaded: boolean;
  loadParentDirectoryContent: () => void;
  loadDirectoryContent: (
    directoryPath: string,
    generateThumbnails: boolean,
    loadDirMeta?: boolean
  ) => void;
  enhanceDirectoryContent: (
    dirEntries,
    isCloudLocation,
    showDirs?: boolean,
    limit?: number
  ) => any;
  openCurrentDirectory: () => void;
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
  isMetaLoaded: false,
  loadParentDirectoryContent: () => {},
  loadDirectoryContent: () => {},
  enhanceDirectoryContent: () => {},
  openCurrentDirectory: () => {},
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
  getEnhancedDir: () => Promise.resolve(undefined)
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
  const selectedEntries = useSelector(getSelectedEntries);
  const searchMode = useSelector(isSearchMode);
  const useGenerateThumbnails = useSelector(getUseGenerateThumbnails);
  const showUnixHiddenEntries = useSelector(getShowUnixHiddenEntries);
  const editedEntryPaths = useSelector(getEditedEntryPaths);
  const enableWS = useSelector(getEnableWS);
  //const defaultPerspective = useSelector(getDefaultPerspective);

  const [currentDirectoryEntries, setCurrentDirectoryEntries] = useState([]);
  const directoryMeta = useRef<TS.FileSystemEntryMeta>({ id: getUuid() });
  /**
   * isMetaLoaded boolean if thumbs and description from meta are loaded
   * is using why directoryMeta can be loaded but empty
   */
  const isMetaLoaded = useRef<boolean>(false);
  const currentDirectoryPath = useRef<string>(undefined);
  const currentPerspective = useRef<string>(PerspectiveIDs.UNSPECIFIED);
  const currentDirectoryFiles = useRef<TS.OrderVisibilitySettings[]>([]);
  const currentDirectoryDirs = useRef<TS.OrderVisibilitySettings[]>([]);
  const firstRender = useFirstRender();
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0, undefined);

  useEffect(() => {
    if (currentLocation) {
      currentDirectoryPath.current = PlatformIO.getLocationPath(
        currentLocation
      );
      loadDirectoryContent(
        currentDirectoryPath.current,
        currentLocation.type !== locationType.TYPE_CLOUD,
        true
      );
      if (currentLocation.type !== locationType.TYPE_CLOUD) {
        watchForChanges(currentLocation);
      }
    } else {
      clearDirectoryContent();
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
          if (searchMode) {
            GlobalSearch.getInstance().setResults(newDirectoryEntries);
          } else {
            setCurrentDirectoryEntries(newDirectoryEntries);
          }
        }
      } else if (action === 'delete') {
        const filePath = editedEntryPaths[0].path;
        const newDirectoryEntries = currentDirectoryEntries.filter(
          entry => entry.path !== filePath
        );

        if (searchMode) {
          GlobalSearch.getInstance().setResults(newDirectoryEntries);
        } else {
          setCurrentDirectoryEntries(newDirectoryEntries);
        }
      }
    }
  }, [editedEntryPaths]);

  function loadParentDirectoryContent() {
    const currentLocationPath = normalizePath(currentLocation.path);

    // dispatch(actions.setIsLoading(true));

    if (currentDirectoryPath.current) {
      const parentDirectory = extractParentDirectoryPath(
        currentDirectoryPath.current,
        PlatformIO.getDirSeparator()
      );
      // console.log('parentDirectory: ' + parentDirectory  + ' - currentLocationPath: ' + currentLocationPath);
      if (parentDirectory.includes(currentLocationPath)) {
        loadDirectoryContent(parentDirectory, false, true);
      } else {
        dispatch(
          AppActions.showNotification(
            t('core:parentDirNotInLocation'),
            'warning',
            true
          )
        );
        // dispatch(actions.setIsLoading(false));
      }
    } else {
      dispatch(
        AppActions.showNotification(t('core:firstOpenaFolder'), 'warning', true)
      );
      // dispatch(actions.setIsLoading(false));
    }
  }

  const updateCurrentDirEntry = useMemo(() => {
    return (path: string, entry: any) => {
      const entryUpdated = { ...entry, ...(!entry.path && { path: path }) };
      if (searchMode) {
        const results = updateFsEntries(
          GlobalSearch.getInstance().getResults(),
          [entryUpdated]
        );
        GlobalSearch.getInstance().setResults(results);
      } else {
        setCurrentDirectoryEntries(
          updateFsEntries(currentDirectoryEntries, [entryUpdated])
        );
      }
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
    generateThumbnails: boolean,
    loadDirMeta = false
  ) {
    // console.debug('loadDirectoryContent:' + directoryPath);
    window.walkCanceled = false;
    currentDirectoryPath.current = directoryPath;

    // dispatch(actions.setIsLoading(true));

    if (selectedEntries.length > 0) {
      dispatch(AppActions.setSelectedEntries([]));
    }
    if (loadDirMeta) {
      const metaFilePath = getMetaFileLocationForDir(
        directoryPath,
        PlatformIO.getDirSeparator()
      );
      loadJSONFile(metaFilePath)
        .then(fsEntryMeta =>
          loadDirectoryContentInt(
            generateThumbnails,
            fsEntryMeta
            // description: getDescriptionPreview(fsEntryMeta.description, 200)
          )
        )
        .catch(err => {
          console.debug('Error loading meta of:' + directoryPath + ' ' + err);
          loadDirectoryContentInt(generateThumbnails);
        });
    } else {
      loadDirectoryContentInt(generateThumbnails);
    }
  }

  function loadDirectoryContentInt(
    generateThumbnails: boolean,
    fsEntryMeta?: TS.FileSystemEntryMeta
  ) {
    dispatch(AppActions.showNotification(t('core:loading'), 'info', false));
    if (fsEntryMeta) {
      directoryMeta.current = fsEntryMeta;
      isMetaLoaded.current = generateThumbnails;
      if (fsEntryMeta.perspective) {
        currentPerspective.current = fsEntryMeta.perspective;
      } else {
        currentPerspective.current = PerspectiveIDs.UNSPECIFIED;
      }
    } else {
      isMetaLoaded.current = false;
      currentPerspective.current = PerspectiveIDs.UNSPECIFIED;
    }
    const resultsLimit = {
      maxLoops:
        currentLocation && currentLocation.maxLoops
          ? currentLocation.maxLoops
          : AppConfig.maxLoops,
      IsTruncated: false
    };
    PlatformIO.listDirectoryPromise(
      currentDirectoryPath.current,
      fsEntryMeta &&
        fsEntryMeta.perspective &&
        (fsEntryMeta.perspective === PerspectiveIDs.KANBAN ||
          fsEntryMeta.perspective === PerspectiveIDs.GALLERY)
        ? ['extractThumbPath']
        : [], // mode,
      currentLocation ? currentLocation.ignorePatternPaths : [],
      resultsLimit
    )
      .then(results => {
        if (resultsLimit.IsTruncated) {
          //OPEN ISTRUNCATED dialog
          dispatch(AppActions.toggleTruncatedConfirmDialog());
        }
        updateHistory(currentLocation, currentDirectoryPath.current);
        if (results !== undefined) {
          // console.debug('app listDirectoryPromise resolved:' + results.length);
          prepareDirectoryContent(results, fsEntryMeta, generateThumbnails);
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
        loadDirectoryFailure(error);
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

  function openCurrentDirectory() {
    if (currentDirectoryPath.current) {
      loadDirectoryContent(currentDirectoryPath.current, false, true);
    } else {
      dispatch(AppActions.setSearchResults([]));
    }
  }

  function loadDirectoryFailure(error?: any) {
    console.error('Error loading directory: ', error);
    dispatch(AppActions.hideNotifications());

    dispatch(
      AppActions.showNotification(
        t('core:errorLoadingFolder') + ': ' + error.message,
        'warning',
        false
      )
    );
    closeAllLocations();
    // dispatch(actions.loadDirectorySuccess(directoryPath, []));
  }

  function prepareDirectoryContent(
    dirEntries,
    dirEntryMeta,
    generateThumbnails
  ) {
    const isCloudLocation =
      currentLocation && currentLocation.type === locationType.TYPE_CLOUD;

    let {
      directoryContent,
      tmbGenerationPromises,
      tmbGenerationList,
      dirsMetaPromises
    } = enhanceDirectoryContent(
      dirEntries,
      isCloudLocation,
      true,
      undefined,
      true,
      generateThumbnails
    );

    function setUpdatedDirMeta(directoryContent) {
      if (dirsMetaPromises.length > 0) {
        Promise.all(dirsMetaPromises)
          .then(entries => {
            setCurrentDirectoryEntries(
              getMergedEntries(directoryContent, entries)
            );
            return true;
          })
          .catch(err => {
            console.error('err Enhanced Dir entries:', err);
            setCurrentDirectoryEntries(directoryContent);
            return false;
          });
      } else {
        setCurrentDirectoryEntries(directoryContent);
      }
    }

    function getUpdatedThumbnailUrls(directoryContent, tmbURLs: Array<any>) {
      return directoryContent.map(entry => {
        const tmbUrl = tmbURLs.find(tmbUrl => tmbUrl.filePath == entry.path);
        if (tmbUrl) {
          return { ...entry, thumbPath: tmbUrl.tmbPath };
        }
        return entry;
      });
      // setCurrentDirectoryEntries(dirEntries);
    }

    function handleTmbGenerationResults(results) {
      // console.log('tmb results' + JSON.stringify(results));
      const tmbURLs = [];
      results.flat(1).map(tmbResult => {
        if (tmbResult.tmbPath && tmbResult.tmbPath.length > 0) {
          // dispatch(actions.updateThumbnailUrl(tmbResult.filePath, tmbResult.tmbPath));
          tmbURLs.push(tmbResult);
        }
        return true;
      });
      dispatch(AppActions.setGeneratingThumbnails(false));
      // dispatch(actions.hideNotifications());
      if (tmbURLs.length > 0) {
        directoryContent = getUpdatedThumbnailUrls(directoryContent, tmbURLs);
      }
      setUpdatedDirMeta(directoryContent);
      return true;
    }

    function handleTmbGenerationFailed(error) {
      console.warn('Thumb generation failed: ' + error);
      dispatch(AppActions.setGeneratingThumbnails(false));
      dispatch(
        AppActions.showNotification(
          'Generating thumbnails failed', //t('core:generatingThumbnailsFailed'),
          'warning',
          true
        )
      );
    }

    if (
      tmbGenerationList.length > 0 ||
      tmbGenerationPromises.length > 0 ||
      dirsMetaPromises.length > 0
    ) {
      if (generateThumbnails) {
        dispatch(AppActions.setGeneratingThumbnails(true));
        if (tmbGenerationList.length > 0) {
          tmbGenerationPromises.push(
            PlatformIO.createThumbnailsInWorker(tmbGenerationList)
              //.then(handleTmbGenerationResults)
              .catch(() => {
                // WS error handle
                Promise.all(
                  tmbGenerationList.map(tmbPath =>
                    getThumbnailURLPromise(tmbPath)
                  )
                )
                  .then(handleTmbGenerationResults)
                  .catch(handleTmbGenerationFailed);
              })
          );
        }
        if (tmbGenerationPromises.length > 0) {
          Promise.all(tmbGenerationPromises)
            .then(handleTmbGenerationResults)
            .catch(handleTmbGenerationFailed);
        }
      } /*else {
        isMetaLoaded.current = false;
      }*/
    }

    console.log(
      'Dir ' +
        currentDirectoryPath.current +
        ' contains ' +
        directoryContent.length
    );
    loadDirectorySuccess(directoryContent, dirEntryMeta);
  }

  function loadDirectorySuccess(
    directoryContent: Array<any>,
    directoryMeta?: TS.FileSystemEntryMeta
  ) {
    dispatch(AppActions.hideNotifications(['error']));
    if (
      currentDirectoryPath.current &&
      currentDirectoryPath.current.startsWith('./')
    ) {
      // relative paths
      currentDirectoryPath.current = PlatformIO.resolveFilePath(
        currentDirectoryPath.current
      );
    }
    if (
      directoryMeta &&
      directoryMeta.customOrder &&
      directoryMeta.customOrder.files
    ) {
      currentDirectoryFiles.current = directoryMeta.customOrder.files;
    }
    if (
      directoryMeta &&
      directoryMeta.customOrder &&
      directoryMeta.customOrder.folders
    ) {
      currentDirectoryDirs.current = directoryMeta.customOrder.folders;
    }
    setCurrentDirectoryEntries(directoryContent);
  }

  function setCurrentDirectoryColor(color: string) {
    if (directoryMeta) {
      directoryMeta.current.color = color;
    }
  }

  function genThumbnails() {
    if (
      !currentDirectoryPath.current ||
      currentDirectoryPath.current.endsWith(
        AppConfig.dirSeparator + AppConfig.metaFolder
      ) ||
      currentDirectoryPath.current.endsWith(
        AppConfig.dirSeparator + AppConfig.metaFolder + AppConfig.dirSeparator
      )
    ) {
      return false; // dont generate thumbnails in meta folder
    }
    if (AppConfig.useGenerateThumbnails !== undefined) {
      return AppConfig.useGenerateThumbnails;
    }
    return useGenerateThumbnails;
  }

  function enhanceDirectoryContent(
    dirEntries,
    isCloudLocation,
    showDirs = true,
    limit = undefined,
    getDirMeta = false,
    generateThumbnails = true
  ) {
    const directoryContent = [];
    const tmbGenerationPromises = [];
    const tmbGenerationList = [];
    const dirsMetaPromises = [];
    const isWorkerAvailable = enableWS && PlatformIO.isWorkerAvailable();
    const supportedImgsWS = [
      'jpg',
      'jpeg',
      'jif',
      'jfif',
      'png',
      'gif',
      'svg',
      'tif',
      'tiff',
      'ico',
      'webp',
      'avif'
      // 'bmp' currently electron main processed: https://github.com/lovell/sharp/issues/806
    ];

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

      if (getDirMeta && !entry.isFile) {
        dirsMetaPromises.push(getEnhancedDir(entry));
      }

      const enhancedEntry: TS.FileSystemEntry = enhanceEntry(
        entry,
        AppConfig.tagDelimiter,
        PlatformIO.getDirSeparator()
      );
      directoryContent.push(enhancedEntry);
      if (
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
      }
      return true;
    });

    return {
      directoryContent,
      tmbGenerationPromises,
      tmbGenerationList,
      dirsMetaPromises
    };
  }

  function setCurrentDirectoryPerspective(perspective: string) {
    currentPerspective.current = perspective;
    forceUpdate();
  }

  const currentDirectoryPerspective: string = useMemo(
    () => currentPerspective.current,
    [currentDirectoryPath.current, currentPerspective.current]
  );

  function setCurrentDirectoryDirs(dirs: TS.OrderVisibilitySettings[]) {
    currentDirectoryDirs.current = dirs;
  }

  function setCurrentDirectoryFiles(files: TS.OrderVisibilitySettings[]) {
    currentDirectoryFiles.current = files;
  }

  function setDirectoryMeta(meta: TS.FileSystemEntryMeta) {
    directoryMeta.current = meta;
    //isMetaLoaded.current = true;
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
      currentDirectoryPerspective,
      currentDirectoryPath: currentDirectoryPath.current,
      currentDirectoryFiles: currentDirectoryFiles.current,
      currentDirectoryDirs: currentDirectoryDirs.current,
      isMetaLoaded: isMetaLoaded.current,
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
      getEnhancedDir
    };
  }, [
    currentLocation,
    currentDirectoryEntries,
    currentDirectoryPath.current,
    directoryMeta.current,
    isMetaLoaded.current,
    currentDirectoryPerspective,
    currentDirectoryFiles.current,
    currentDirectoryDirs.current,
    updateCurrentDirEntries
  ]);

  return (
    <DirectoryContentContext.Provider value={context}>
      {children}
    </DirectoryContentContext.Provider>
  );
};
