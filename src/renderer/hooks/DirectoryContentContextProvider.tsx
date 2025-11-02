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
import LoadingLazy from '-/components/LoadingLazy';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useEditedEntryContext } from '-/hooks/useEditedEntryContext';
import { useEditedEntryMetaContext } from '-/hooks/useEditedEntryMetaContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { PerspectiveIDs } from '-/perspectives';
import { defaultSettings as defaultGridSettings } from '-/perspectives/grid';
import { defaultSettings as defaultListSettings } from '-/perspectives/list';
import { Pro } from '-/pro';
import { actions as AppActions, AppDispatch } from '-/reducers/app';
import {
  actions as SettingsActions,
  getDefaultPerspective,
  getShowUnixHiddenEntries,
  getTagDelimiter,
} from '-/reducers/settings';
import {
  cleanMetaData,
  executePromisesInBatches,
  instanceId,
  mergeByPath,
  mergeFsEntryMeta,
  resolveRelativePath,
  updateFsEntries,
} from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import { CommonLocation } from '-/utils/CommonLocation';
import { arrayBufferToDataURL, updateHistory } from '-/utils/dom';
import {
  makeCancelable,
  useCancelablePerLocation,
} from '-/utils/useCancelablePerLocation';
import useFirstRender from '-/utils/useFirstRender';
import {
  cleanFrontDirSeparator,
  cleanTrailingDirSeparator,
  extractContainingDirectoryPath,
  extractParentDirectoryPath,
  getMetaFileLocationForDir,
  getMetaFileLocationForFile,
  getThumbFileLocationForDirectory,
  getThumbFileLocationForFile,
  isMeta,
} from '@tagspaces/tagspaces-common/paths';
import { enhanceEntry, getUuid } from '@tagspaces/tagspaces-common/utils-io';
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

type DirectoryContentContextData = {
  currentLocationPath: string;
  currentDirectoryEntries: TS.FileSystemEntry[];
  directoryMeta: TS.FileSystemEntryMeta;
  /**
   * @deprecated use currentDirectory instead
   */
  currentDirectoryPath: string;
  currentDirectory: TS.FileSystemEntry;
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
  sendDirMessage: (type: string, payload?: any) => void;
  isSearching: () => boolean;
  addDirectoryEntries: (entries: TS.FileSystemEntry[]) => void;
  //removeDirectoryEntries: (entryPaths: string[]) => void;
  //reflectRenameEntries: (paths: Array<string[]>) => Promise<boolean>;
  setSearchQuery: (sQuery: TS.SearchQuery) => void;
  loadParentDirectoryContent: () => void;
  loadDirectoryContent: (
    directoryPath: string,
    loadDirMeta?: boolean,
    showHiddenEntries?: boolean,
  ) => Promise<TS.FileSystemEntry[]>;
  enhanceDirectoryContent: (
    dirEntries,
    location: CommonLocation,
    showDirs?: boolean,
    limit?: number,
    getDirMeta?: boolean,
    generateThumbnails?: boolean,
  ) => any;
  openDirectory: (
    dirPath: string,
    showHiddenEntries?: boolean,
    location?: CommonLocation,
  ) => Promise<boolean>;
  openCurrentDirectory: (showHiddenEntries?: boolean) => Promise<boolean>;
  clearDirectoryContent: () => void;
  //perspective: TS.PerspectiveType;
  setManualDirectoryPerspective: (perspective: string, dir?: string) => void;
  setCurrentDirectoryColor: (color: string) => void;
  setCurrentDirectoryDirs: (dirs: TS.OrderVisibilitySettings[]) => void;
  setCurrentDirectoryFiles: (files: TS.OrderVisibilitySettings[]) => void;
  updateCurrentDirEntry: (path: string, entry: TS.FileSystemEntry) => void;
  updateCurrentDirEntries: (
    dirEntries: TS.FileSystemEntry[],
    checkCurrentDir?: boolean,
  ) => void;
  //updateThumbnailUrl: (filePath: string, thumbUrl: string) => void;
  setDirectoryMeta: (meta: TS.FileSystemEntryMeta) => void;
  setSearchResults: (entries: TS.FileSystemEntry[]) => void;
  appendSearchResults: (entries: TS.FileSystemEntry[]) => void;
  enterSearchMode: () => void;
  exitSearchMode: (force?: boolean) => void;
  getDefaultPerspectiveSettings: (perspective: string) => TS.FolderSettings;
  currentPerspective: TS.PerspectiveType;
  getAllPropertiesPromise: (
    entryPath: string,
    locationID?: string,
    //useEncryption?: boolean,
  ) => Promise<TS.FileSystemEntry>;
  loadCurrentDirMeta: (
    directoryPath: string,
    dirEntries: TS.FileSystemEntry[],
    pageFiles?: TS.FileSystemEntry[],
  ) => Promise<TS.FileSystemEntry[]>;
  openIsTruncatedConfirmDialog: () => void;
  closeIsTruncatedConfirmDialog: () => void;
  setThumbnails: (
    fsEntries: TS.FileSystemEntry[],
  ) => Promise<TS.FileSystemEntry[]>;
  setThumbnail: (fsEntry: TS.FileSystemEntry) => Promise<TS.FileSystemEntry>;
  getMetaForEntry: (fsEntry: TS.FileSystemEntry) => Promise<TS.FileSystemEntry>;
  getEnhancedDir: (entry: TS.FileSystemEntry) => Promise<TS.FileSystemEntry>;
};

export const DirectoryContentContext =
  createContext<DirectoryContentContextData>({
    currentLocationPath: undefined,
    currentDirectoryEntries: [],
    directoryMeta: undefined,
    //currentDirectoryPerspective: undefined,
    currentDirectoryPath: undefined,
    currentDirectory: undefined,
    currentDirectoryFiles: [],
    currentDirectoryDirs: [],
    //isMetaLoaded: undefined,
    //isMetaFolderExist: false,
    searchQuery: {},
    isSearchMode: false,
    sendDirMessage: undefined,
    isSearching: undefined,
    addDirectoryEntries: undefined,
    //removeDirectoryEntries: undefined,
    //reflectRenameEntries: undefined,
    setSearchQuery: () => {},
    loadParentDirectoryContent: undefined,
    loadDirectoryContent: undefined,
    enhanceDirectoryContent: undefined,
    openDirectory: undefined,
    openCurrentDirectory: undefined,
    clearDirectoryContent: () => {},
    //perspective: undefined,
    setManualDirectoryPerspective: undefined,
    setCurrentDirectoryColor: () => {},
    setCurrentDirectoryDirs: () => {},
    setCurrentDirectoryFiles: () => {},
    updateCurrentDirEntry: () => {},
    updateCurrentDirEntries: () => {},
    //updateThumbnailUrl: () => {},
    setDirectoryMeta: () => {},
    setSearchResults: () => {},
    appendSearchResults: () => {},
    enterSearchMode: () => {},
    exitSearchMode: () => {},
    getDefaultPerspectiveSettings: undefined,
    currentPerspective: undefined,
    getAllPropertiesPromise: undefined,
    loadCurrentDirMeta: undefined,
    openIsTruncatedConfirmDialog: undefined,
    closeIsTruncatedConfirmDialog: undefined,
    setThumbnails: undefined,
    setThumbnail: undefined,
    getMetaForEntry: undefined,
    getEnhancedDir: undefined,
  });

export type DirectoryContentContextProviderProps = {
  children: React.ReactNode;
};

const IsTruncatedConfirmDialog = React.lazy(
  () =>
    import(
      /* webpackChunkName: "IsTruncatedConfirmDialog" */ '../components/dialogs/IsTruncatedConfirmDialog'
    ),
);

export const DirectoryContentContextProvider = ({
  children,
}: DirectoryContentContextProviderProps) => {
  const dispatch: AppDispatch = useDispatch();
  const { t } = useTranslation();
  const {
    closeAllLocations,
    currentLocation,
    currentLocationId,
    findLocation,
    skipInitialDirList,
    getLocationPath,
    changeLocation,
  } = useCurrentLocationContext();
  const { actions } = useEditedEntryContext();
  const { metaActions, setReflectMetaActions } = useEditedEntryMetaContext();
  const { showNotification, hideNotifications } = useNotificationContext();
  const { selectedEntries, setSelectedEntries } = useSelectedEntriesContext();

  const currentLocationPath = useRef<string>('');
  //const useGenerateThumbnails = useSelector(getUseGenerateThumbnails);
  const showUnixHiddenEntries = useSelector(getShowUnixHiddenEntries);
  const defaultPerspective = useSelector(getDefaultPerspective);
  const tagDelimiter: string = useSelector(getTagDelimiter);

  const currentDirectoryEntries = useRef<TS.FileSystemEntry[]>([]);
  const { signal, abort, cancelAbort } =
    useCancelablePerLocation(currentLocationId);
  const searchQuery = useRef<TS.SearchQuery>({});
  const isSearchMode = useRef<boolean>(false);
  const manualPerspective = useRef<TS.PerspectiveType>('unspecified');
  const directoryMeta = useRef<TS.FileSystemEntryMeta>(getDefaultDirMeta());
  const open = useRef<boolean>(false);
  /**
   * isMetaLoaded boolean if thumbs and description from meta are loaded
   * is using why directoryMeta can be loaded but empty
   * undefined means no .ts folder exist
   */
  const isMetaLoaded = useRef<boolean>(undefined);
  //const isLoading = useRef<boolean>(false);
  //const isMetaFolderExist = useRef<boolean>(undefined);
  const currentDirectory = useRef<TS.FileSystemEntry>(undefined);
  const currentDirectoryFiles = useRef<TS.OrderVisibilitySettings[]>([]);
  const currentDirectoryDirs = useRef<TS.OrderVisibilitySettings[]>([]);
  const firstRender = useFirstRender();
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);
  const broadcast = new BroadcastChannel('ts-directory-channel');

  const defaultColumnsToShow = 3; //KanBan

  useEffect(() => {
    if (AppConfig.isElectron) {
      try {
        // Listen for messages from other instance
        broadcast.onmessage = (event: MessageEvent) => {
          const action = event.data as TS.BroadcastMessage;
          if (instanceId !== action.uuid) {
            if (action.type === 'moveFiles') {
              const filePaths = action.payload as string[];
              setCurrentDirectoryEntries(
                currentDirectoryEntries.current.filter(
                  (entry) => !filePaths.includes(entry.path),
                ),
              );
              //openDirectory(currentDirectoryPath.current);
            }
          }
        };
      } catch (e) {
        console.error('broadcast.onmessage error:', e);
      }

      window.electronIO.ipcRenderer.on('cmd', (arg) => {
        if (arg === 'open-search') {
          setSearchQuery({ textQuery: '' });
        } else if (arg === 'exit-fullscreen') {
          try {
            if (document.fullscreenElement) {
              document.exitFullscreen();
            }
          } catch (e) {
            console.log('Failed to exit fullscreen mode:', e);
          }
        } else if (arg === 'set-zoom-reset-app') {
          dispatch(SettingsActions.setZoomResetApp());
        } else if (arg === 'set-zoom-in-app') {
          dispatch(SettingsActions.setZoomInApp());
        } else if (arg === 'set-zoom-out-app') {
          dispatch(SettingsActions.setZoomOutApp());
        }
      });

      return () => {
        if (window.electronIO.ipcRenderer) {
          window.electronIO.ipcRenderer.removeAllListeners('cmd');
        }
      };
    }
  }, []);

  useEffect(() => {
    if (currentLocation) {
      // check for relative path for Location
      getLocationPath(currentLocation).then((locationPath) => {
        currentLocationPath.current = locationPath;
        if (!skipInitialDirList) {
          /*if (isLoading.current) {
            //cancel loading KanBan S3 folders on location-folder change
            abort();
          }
          isLoading.current = true;*/
          openDirectory(locationPath)
            .then((success) => {
              manualPerspective.current = 'unspecified';
              //isLoading.current = false;
              return success;
            })
            .catch((ex) => {
              //isLoading.current = false;
              console.log('Error openDirectory:', ex);
            });
        }
      });
    } else {
      currentLocationPath.current = '';
      clearDirectoryContent();
      exitSearchMode();
    }
  }, [currentLocation]);

  useEffect(() => {
    if (!firstRender && metaActions && metaActions.length > 0) {
      for (const action of metaActions) {
        if (
          action.entry &&
          cleanTrailingDirSeparator(currentDirectory.current?.path) ===
            cleanTrailingDirSeparator(action.entry.path)
        ) {
          if (action.action === 'perspectiveChange') {
            if (action.entry.meta.perspective !== undefined) {
              manualPerspective.current =
                action.entry.meta.perspective === PerspectiveIDs.UNSPECIFIED
                  ? defaultPerspective
                  : action.entry.meta.perspective;
              setDirectoryMeta(action.entry.meta);
            }
            //setManualDirectoryPerspective(action.entry.meta.perspective);
          } else if (
            action.action === 'bgdColorChange' ||
            action.action === 'thumbChange' ||
            action.action === 'bgdImgChange' ||
            action.action === 'descriptionChange'
          ) {
            directoryMeta.current = { ...action.entry.meta };
            forceUpdate();
          }
        }
      }
    }
  }, [metaActions]);

  useEffect(() => {
    if (!firstRender) {
      reflectActions(actions).catch(console.error);
      reflectSelection(actions);
    }
  }, [actions]);

  function sendDirMessage(type: string, payload?: any) {
    try {
      const message: TS.BroadcastMessage = { uuid: instanceId, type, payload };
      broadcast.postMessage(message);
    } catch (e) {
      console.error('broadcast.postMessage error:', e);
    }
  }

  const reflectActions = async (actions) => {
    if (actions && actions.length > 0) {
      let updateEntries = undefined;
      for (const action of actions) {
        const pathParts = action.entry?.path?.split(
          currentLocation.getDirSeparator(),
        );
        if (
          updateEntries === undefined &&
          pathParts.includes(AppConfig.metaFolder)
        ) {
          // skip metaFolder changes
          updateEntries = false;
        } else {
          updateEntries = true;
        }
        if (action.action === 'add') {
          await reflectAddAction(action.entry);
        } else if (action.action === 'delete') {
          reflectDeleteAction(action.entry);
          /// RENAME
        } else if (action.action === 'update') {
          let index = currentDirectoryEntries.current.findIndex(
            (e) =>
              cleanTrailingDirSeparator(cleanFrontDirSeparator(e.path)) ===
              cleanTrailingDirSeparator(
                cleanFrontDirSeparator(action.oldEntryPath),
              ),
          );
          if (index !== -1) {
            currentDirectoryEntries.current[index] = {
              ...currentDirectoryEntries.current[index],
              ...action.entry,
            };
          }
          if (
            action.entry &&
            cleanTrailingDirSeparator(currentDirectory.current?.path) ===
              cleanTrailingDirSeparator(action.entry.path)
          ) {
            directoryMeta.current = {
              ...directoryMeta.current,
              ...action.entry.meta,
              tags: action.entry.meta?.tags || [],
            };
          }
        } else if (action.action === 'move') {
          await reflectAddAction(action.entry);
          reflectDeleteAction(
            currentLocation.toFsEntry(action.oldEntryPath, action.entry.isFile),
          );
        }
      }
      if (updateEntries) {
        // create a shallow copy to publish changes
        currentDirectoryEntries.current = [...currentDirectoryEntries.current];
        forceUpdate();
      }
    }
  };

  function reflectSelection(actions: TS.EditAction[]) {
    let updated = false;
    if (actions && actions.length > 0) {
      let selected = [...selectedEntries];
      for (const action of actions) {
        if (
          action.source !== 'fsWatcher' &&
          action.source !== 'upload' &&
          action.source !== 'thumbgen' &&
          action.entry &&
          !isMeta(action.entry.path)
        ) {
          if (action.action === 'add') {
            if (
              currentDirectoryEntries.current.some(
                (entry) => entry.path === action.entry.path,
              ) &&
              !action.skipSelection
            ) {
              selected = [action.entry];
              updated = true;
            }
          } else if (action.action === 'delete') {
            let index = selectedEntries.findIndex(
              (e) => e.path === action.entry.path,
            );
            if (index !== -1) {
              selected.splice(index, 1);
              updated = true;
            }
          } else if (action.action === 'update') {
            let index = selectedEntries.findIndex(
              (e) => e.path === action.oldEntryPath,
            );
            if (index !== -1) {
              selected[index] = action.entry;
              updated = true;
            }
          }
        }
      }
      if (updated) {
        setSelectedEntries(selected);
      }
    }
  }

  function setThumbUrl(loc, fsEntry): Promise<TS.FileSystemEntry | undefined> {
    if (loc) {
      return loc
        .getThumbPath(fsEntry.meta.thumbPath, fsEntry.meta.lastUpdated)
        .then((tmbPath) => {
          if (tmbPath !== fsEntry.meta.thumbPath) {
            //thumbPath.current) {
            const meta = { ...fsEntry.meta, thumbPath: tmbPath };
            return { ...fsEntry, meta };
          }
        });
    }
    return Promise.resolve(undefined);
  }

  async function setThumbnails(
    fsEntries: TS.FileSystemEntry[],
  ): Promise<TS.FileSystemEntry[]> {
    const promises = fsEntries.map((fsEntry) =>
      setThumbnail(fsEntry).then((entry) => {
        if (entry !== undefined) {
          return entry;
        }
        return fsEntry;
      }),
    );
    const updated = await Promise.all(promises);
    return updated;
  }

  function setThumbnail(
    fsEntry: TS.FileSystemEntry,
  ): Promise<TS.FileSystemEntry | undefined> {
    const loc = findLocation(fsEntry.locationID);
    if (loc && fsEntry.meta) {
      if (fsEntry.meta.thumbPath) {
        if (loc.encryptionKey) {
          let thumbFilePath = getThumbFileLocationForFile(
            fsEntry.path,
            loc.getDirSeparator(),
            false,
          );
          return loc
            .getFileContentPromise(thumbFilePath, 'arraybuffer')
            .then((arrayBuffer) => {
              if (arrayBuffer) {
                return arrayBufferToDataURL(arrayBuffer, 'image/jpeg').then(
                  (dataURL) => {
                    const meta = { ...fsEntry.meta, thumbPath: dataURL };
                    return { ...fsEntry, meta };
                  },
                );
              } else if (arrayBuffer === undefined) {
                return setThumbUrl(loc, fsEntry);
              }
              return undefined;
            });
        } else {
          return setThumbUrl(loc, fsEntry);
        }
      }
    }
    return Promise.resolve(undefined);
  }

  async function reflectAddAction(entry: TS.FileSystemEntry) {
    const entryExist = currentDirectoryEntries.current.some(
      (e) => e.path === entry.path,
    );
    if (entryExist) {
      currentDirectoryEntries.current = currentDirectoryEntries.current.map(
        (e) => (e.path === entry.path ? entry : e),
      );
    } else {
      const dirPath = extractContainingDirectoryPath(
        entry.path,
        currentLocation?.getDirSeparator(),
      );
      if (
        cleanTrailingDirSeparator(
          cleanFrontDirSeparator(currentDirectory.current?.path),
        ) === cleanTrailingDirSeparator(cleanFrontDirSeparator(dirPath))
      ) {
        currentDirectoryEntries.current.push(entry);
      }
    }
  }

  function reflectDeleteAction(entry: TS.FileSystemEntry) {
    if (!entry.isFile) {
      if (entry.path === currentDirectory.current?.path) {
        loadParentDirectoryContent();
        return;
      }
    }
    let index = currentDirectoryEntries.current.findIndex(
      (e) =>
        cleanTrailingDirSeparator(e.path) ===
        cleanTrailingDirSeparator(entry.path),
    );
    if (index !== -1) {
      currentDirectoryEntries.current.splice(index, 1);
    }
  }

  function getDefaultDirMeta(): TS.FileSystemEntryMeta {
    const settings: TS.PerspectiveSettings = {
      [defaultPerspective]: getDefaultPerspectiveSettings(defaultPerspective),
    };
    return {
      id: getUuid(),
      perspectiveSettings: settings,
    };
  }

  function getDefaultPerspectiveSettings(perspective: string) {
    if (perspective === PerspectiveIDs.GRID) {
      return defaultGridSettings;
    } else if (perspective === PerspectiveIDs.LIST) {
      return defaultListSettings;
    } else if (Pro) {
      if (perspective === PerspectiveIDs.GALLERY) {
        return Pro.Perspectives.galleryDefaultSettings;
      } else if (perspective === PerspectiveIDs.MAPIQUE) {
        return Pro.Perspectives.mapiqueDefaultSettings;
      } else if (perspective === PerspectiveIDs.KANBAN) {
        return Pro.Perspectives.KanBanPerspectiveSettings;
      }
    }
    return defaultGridSettings;
  }

  function setCurrentDirectoryEntries(dirEntries: TS.FileSystemEntry[]) {
    cancelAbort();
    if (dirEntries && dirEntries.length > 0) {
      currentDirectoryEntries.current = dirEntries; //[...dirEntries];
      forceUpdate();
    } else if (currentDirectoryEntries.current.length > 0) {
      currentDirectoryEntries.current = [];
      forceUpdate();
    }
  }

  function exitSearchMode(force = true) {
    isSearchMode.current = false;
    dispatch(AppActions.setSearchFilter(undefined));
    if (force) {
      searchQuery.current = {};
    }
    forceUpdate();
  }

  function enterSearchMode() {
    searchQuery.current = {};
    if (!isSearchMode.current) {
      isSearchMode.current = true;
      forceUpdate();
    }
  }

  function setSearchResults(searchResults: TS.FileSystemEntry[]) {
    if (isSearchMode.current) {
      setCurrentDirectoryEntries(searchResults);
    }
  }

  function appendSearchResults(searchResults: TS.FileSystemEntry[]) {
    const newSearchResults = searchResults.filter(
      (result) =>
        !currentDirectoryEntries.current.some(
          (entry) => entry.path === result.path,
        ),
    );
    if (newSearchResults.length > 0) {
      setSearchResults([
        ...currentDirectoryEntries.current,
        ...newSearchResults,
      ]);
    }
  }

  function loadParentDirectoryContent() {
    if (isSearchMode.current) {
      exitSearchMode();
      return openCurrentDirectory();
    }

    if (currentDirectory.current !== undefined) {
      const loc = findLocation(currentDirectory.current.locationID);

      if (loc) {
        const parentDirectory = extractParentDirectoryPath(
          currentDirectory.current.path,
        );
        resolveRelativePath(loc.path).then((locationPath) => {
          if (
            !locationPath ||
            parentDirectory.startsWith(cleanTrailingDirSeparator(locationPath))
          ) {
            //limit opening only from location
            return openDirectory(parentDirectory, undefined, loc);
          } else {
            // don't open dirs parent to location
            showNotification(t('core:parentDirNotInLocation'), 'warning', true);
          }
        });
      }
    } else {
      showNotification(t('core:firstOpenaFolder'), 'warning', true);
    }
  }

  function updateCurrentDirEntry(path: string, entry: any) {
    if (path === currentDirectory.current?.path) {
      directoryMeta.current = directoryMeta.current
        ? { ...directoryMeta.current, ...entry }
        : entry;
    }
    const entryUpdated = { ...entry, ...(!entry.path && { path: path }) };

    setCurrentDirectoryEntries(
      updateFsEntries(currentDirectoryEntries.current, [entryUpdated]),
    );
  }

  /*const getMergedEntries = (entries1, entries2) => {
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
  };*/

  function updateCurrentDirEntries(
    dirEntries: TS.FileSystemEntry[],
    checkCurrentDir = true,
  ) {
    if (dirEntries) {
      //const entries = dirEntries.filter((e) => e !== undefined);
      const isNotFromCurrentDir =
        checkCurrentDir &&
        dirEntries.some(
          (e) =>
            !cleanFrontDirSeparator(e.path).startsWith(
              cleanFrontDirSeparator(currentDirectory.current?.path),
            ),
        );
      if (
        dirEntries.length > 0 &&
        !isNotFromCurrentDir //entries[0].path.startsWith(currentDirectoryPath.current)
      ) {
        if (
          currentDirectoryEntries.current &&
          currentDirectoryEntries.current.length > 0
        ) {
          setCurrentDirectoryEntries(
            mergeByPath(dirEntries, currentDirectoryEntries.current),
          );
          /* currentDirectoryEntries.current.map((e) => {
            const eUpdated = entries.filter((u) => u.path === e.path);
            if (eUpdated.length > 0) {
              const mergedMeta = eUpdated.reduce((merged, obj) => {
                return { ...merged, ...obj.meta };
              }, {});
              return { ...e, meta: { ...e.meta, ...mergedMeta } };
            }
            return e;
            })
          ); */
        } else {
          setCurrentDirectoryEntries(dirEntries);
        }
      }
    }
  }

  function getDefaultColumnsToShow(
    entries: TS.FileSystemEntry[],
  ): TS.OrderVisibilitySettings[] {
    return entries
      .filter((entry) => entry && !entry.isFile)
      .slice(0, defaultColumnsToShow)
      .map((dir) => ({
        uuid: dir.uuid,
        name: dir.name,
      }));
  }

  async function loadMetaDirectoryContent(
    directoryPath: string,
    location: CommonLocation,
    showHiddenEntries: boolean | undefined = undefined,
  ): Promise<TS.FileSystemEntry[]> {
    // Ensure selectedEntries is cleared if not empty
    if (selectedEntries.length > 0) {
      setSelectedEntries([]);
    }

    const isMetaPath = isMeta(directoryPath);
    let meta;
    if (!isMetaPath) {
      // Fetch directory metadata
      meta = await getDirMeta(directoryPath, location);
      // Update directory metadata
      if (meta) {
        directoryMeta.current = meta;
        currentDirectoryDirs.current = meta.customOrder?.folders || [];
        currentDirectoryFiles.current = meta.customOrder?.files || [];
      }
    }
    // Load directory content
    const entries = await loadDirectoryContentInt(
      directoryPath,
      location,
      showHiddenEntries,
    );
    // set default directory metadata
    if (!isMetaPath && !meta) {
      currentDirectoryFiles.current = [];
      // add defaultColumnsToShow for KanBan
      currentDirectoryDirs.current = getDefaultColumnsToShow(entries);
      const meta = cleanMetaData(
        mergeFsEntryMeta({
          ...getDefaultDirMeta(),
          customOrder: {
            folders: currentDirectoryDirs.current,
          },
        }),
      );
      directoryMeta.current = meta;
      const content = JSON.stringify(meta);
      const metaFilePath = getMetaFileLocationForDir(
        directoryPath,
        location.getDirSeparator(),
      );
      try {
        await location.saveTextFilePromise(
          { path: metaFilePath, locationID: location.uuid },
          content,
          true,
        );
      } catch (e) {
        console.log(e);
      }
    }

    setCurrentDirectoryEntries(entries);

    return entries;
  }

  /**
   * @deprecated for loadDirMeta=true use loadMetaDirectoryContent instead
   * @param directoryPath
   * @param loadDirMeta
   * @param showHiddenEntries
   */
  const loadDirectoryContent = useCallback(
    (
      directoryPath: string,
      loadDirMeta = false,
      showHiddenEntries = undefined,
    ): Promise<TS.FileSystemEntry[]> => {
      if (selectedEntries.length > 0) {
        setSelectedEntries([]);
      }

      if (loadDirMeta) {
        return getDirMeta(directoryPath, currentLocation).then((meta) => {
          if (meta) {
            directoryMeta.current = meta;
          } else {
            directoryMeta.current = getDefaultDirMeta();
          }

          if (signal?.aborted) {
            return [];
          }

          return loadDirectoryContentInt(
            directoryPath,
            currentLocation,
            showHiddenEntries,
          ).then((entries) => {
            setCurrentDirectoryEntries(entries);
            return entries;
          });
        });
      } else {
        isMetaLoaded.current = false;
        directoryMeta.current = getDefaultDirMeta();
        return loadDirectoryContentInt(
          directoryPath,
          currentLocation,
          showHiddenEntries,
        ).then((entries) => {
          setCurrentDirectoryEntries(entries);
          return entries;
        });
      }
    },
    [currentLocation, signal, selectedEntries, showUnixHiddenEntries],
  );

  const loadDirectoryContentInt = useCallback(
    (
      directoryPath: string,
      location: CommonLocation,
      showHiddenEntries = undefined,
    ): Promise<TS.FileSystemEntry[]> => {
      showNotification(t('core:loading'), 'info', false);

      const resultsLimit = {
        maxLoops: location?.maxLoops ?? AppConfig.maxLoops,
        IsTruncated: false,
      };

      const promise = location
        .listDirectoryPromise(
          directoryPath,
          [], // You can enhance this later for fullTextIndex
          location?.ignorePatternPaths ?? [],
          resultsLimit,
        )
        .then((results) => {
          if (signal?.aborted) return [];

          if (resultsLimit.IsTruncated) {
            openIsTruncatedConfirmDialog();
          }

          if (results !== undefined) {
            return loadDirectorySuccess(
              directoryPath,
              results,
              location,
              showHiddenEntries,
            );
          }
          return [];
        })
        .catch((error) => {
          return loadDirectoryFailure(error);
        });

      const cancelableFetch = makeCancelable(promise, signal);

      return cancelableFetch
        .then((response) => response)
        .catch((err) => {
          if (err.name === 'AbortError') {
            console.log('cancelableFetch was canceled');
          } else {
            console.error('Other error:', err);
          }
          return [];
        });
    },
    [signal, showUnixHiddenEntries],
  );

  function clearDirectoryContent() {
    currentDirectory.current = undefined;
    setCurrentDirectoryEntries([]);
  }

  function openCurrentDirectory(
    showHiddenEntries = undefined,
  ): Promise<boolean> {
    if (currentDirectory.current !== undefined) {
      return openDirectory(currentDirectory.current.path, showHiddenEntries);
    }
    return Promise.resolve(false);
  }

  function openDirectory(
    dirPath: string,
    showHiddenEntries = undefined,
    location: CommonLocation = undefined,
  ): Promise<boolean> {
    if (dirPath !== undefined) {
      /*if (
        location &&
        currentLocation &&
        currentLocation.type !== location.type
      ) {*/
      changeLocation(location, true);
      const cLocation = location || findLocation();
      if (cLocation) {
        return cLocation.checkDirExist(dirPath).then((exist) => {
          if (exist) {
            const reloadMeta =
              cleanTrailingDirSeparator(currentDirectory.current?.path) ===
              cleanTrailingDirSeparator(dirPath);
            return loadMetaDirectoryContent(
              dirPath,
              cLocation,
              showHiddenEntries,
            )
              .then((dirEntries) => {
                if (dirEntries && reloadMeta) {
                  // load meta files (reload of the same directory is not handled from ThumbGenerationContextProvider)
                  return loadCurrentDirMeta(dirPath, dirEntries).then(
                    (entries) => {
                      updateCurrentDirEntries(entries);
                      return true;
                    },
                  );
                }
                return true;
              })
              .then(() => {
                setReflectMetaActions({
                  action: 'thumbGenerate',
                });
                return true;
              });
          } else {
            showNotification(t('core:invalidLink'), 'warning', true);
            return false;
          }
        });
      }
    }
    return Promise.resolve(false);
  }

  function loadDirectorySuccess(
    directoryPath: string,
    dirEntries: TS.FileSystemEntry[],
    location: CommonLocation,
    showHiddenEntries = undefined,
  ): TS.FileSystemEntry[] {
    hideNotifications(['error']);

    if (isSearchMode.current) {
      isSearchMode.current = false;
      dispatch(AppActions.setSearchFilter(undefined));
    }

    const directoryContent = enhanceDirectoryContent(
      dirEntries,
      location,
      true,
      undefined,
      showHiddenEntries,
    );

    //setCurrentDirectoryEntries(directoryContent);
    currentDirectory.current = location.toFsEntry(
      cleanTrailingDirSeparator(directoryPath),
      false,
    );
    resolveRelativePath(location.path).then((locationPath) => {
      updateHistory(location.uuid, locationPath, directoryPath); //currentLocationPath.current
    });
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

  function enhanceDirectoryContent(
    dirEntries: TS.FileSystemEntry[],
    location: CommonLocation,
    showDirs = true,
    limit = undefined,
    showHiddenEntries = undefined,
  ): TS.FileSystemEntry[] {
    const directoryContent: TS.FileSystemEntry[] = [];
    const showHidden =
      showHiddenEntries !== undefined
        ? showHiddenEntries
        : showUnixHiddenEntries;

    dirEntries.forEach((entry) => {
      if (!showHidden && entry.name.startsWith('.')) {
        return;
      }

      if (!showDirs && !entry.isFile) {
        return;
      }

      if (limit !== undefined && directoryContent.length >= limit) {
        return;
      }

      const enhancedEntry: TS.FileSystemEntry = enhanceEntry(
        entry,
        tagDelimiter,
        location?.getDirSeparator(),
      );
      directoryContent.push({
        ...enhancedEntry,
        locationID: location.uuid,
      });
    });

    return directoryContent;
  }

  function isSearching(): boolean {
    return Object.keys(searchQuery.current).length > 0;
  }

  const currentPerspective: TS.PerspectiveType = useMemo(() => {
    if (manualPerspective.current === 'unspecified') {
      if (
        !directoryMeta.current ||
        !directoryMeta.current.perspective ||
        directoryMeta.current.perspective === 'unspecified'
      ) {
        return defaultPerspective;
      }
      return directoryMeta.current.perspective;
    }
    return manualPerspective.current;
  }, [currentDirectory.current, manualPerspective.current]);

  function setManualDirectoryPerspective(
    perspective: TS.PerspectiveType,
    directory: string = undefined,
  ) {
    manualPerspective.current = perspective;
    getAllPropertiesPromise(
      directory ? directory : currentDirectory.current?.path,
    )
      .then((entry: TS.FileSystemEntry) => {
        const action: TS.EditMetaAction = {
          action: 'perspectiveChange',
          entry: {
            ...entry,
            meta: { ...(entry.meta && entry.meta), perspective },
          },
        };
        setReflectMetaActions(action);
      })
      .catch((error) => {
        console.log('Error getting properties for entry: ' + directory, error);
      });
  }

  function setCurrentDirectoryDirs(dirs: TS.OrderVisibilitySettings[]) {
    currentDirectoryDirs.current = dirs;
    forceUpdate();
  }

  function setCurrentDirectoryFiles(files: TS.OrderVisibilitySettings[]) {
    currentDirectoryFiles.current = files;
    forceUpdate();
  }

  function addDirectoryEntries(entries: TS.FileSystemEntry[]) {
    setCurrentDirectoryEntries([
      ...currentDirectoryEntries.current,
      ...entries,
    ]);
  }

  function setDirectoryMeta(meta: TS.FileSystemEntryMeta) {
    directoryMeta.current = meta;
    isMetaLoaded.current = true;
    currentDirectoryDirs.current =
      directoryMeta.current?.customOrder?.folders || [];
    currentDirectoryFiles.current =
      directoryMeta.current?.customOrder?.files || [];
    forceUpdate();
  }

  function setSearchQuery(sQuery: TS.SearchQuery) {
    if (Object.keys(sQuery).length === 0) {
      exitSearchMode();
    } else {
      isSearchMode.current = true;
      searchQuery.current = sQuery;
      forceUpdate();
    }
  }

  /**
   *  get full entry properties - with full description
   */
  function getAllPropertiesPromise(
    entryPath: string,
    locationID: string = undefined,
  ): Promise<TS.FileSystemEntry> {
    const location = findLocation(locationID);
    return location.checkFileEncryptedPromise(entryPath).then((encrypted) =>
      location
        .getPropertiesPromise(entryPath, encrypted)
        .then((entryProps: TS.FileSystemEntry) => {
          if (entryProps) {
            if (typeof entryProps === 'boolean') {
              /*if(entryProps){
              showNotification('Can\'t get '+entryPath+' maybe the file is encrypted?');
            }*/
            } else {
              const entry = { ...entryProps, locationID: location.uuid };
              if (!entryProps.isFile) {
                return getEnhancedDir(entry);
              }
              return getEnhancedFile(entry, encrypted);
            }
          }
          console.log('Error getting props for ' + entryPath);
          return undefined;
        }),
    );
  }

  // meta-loader
  function getMetaForEntry(
    entry: TS.FileSystemEntry,
  ): Promise<TS.FileSystemEntry> {
    const location = findLocation(entry.locationID);
    if (!location) {
      return Promise.resolve(entry);
    }
    const metaPromise = entry.isFile
      ? loadMetaForFile(entry.path, location, entry.meta)
      : loadMetaForDir(entry.path, location, entry.meta);
    return metaPromise.then((meta) => {
      if (meta) {
        return enhanceEntry(
          {
            ...entry,
            meta: {
              ...(entry.meta && entry.meta),
              ...meta,
              // description: getDescriptionPreview(meta.description, 200),
            },
          },
          tagDelimiter,
          location?.getDirSeparator(),
        );
      }
      return entry;
    });
  }

  function loadMetaForDir(
    dirPath: string,
    location: CommonLocation,
    metaAdd?,
  ): Promise<TS.FileSystemEntryMeta> {
    return location
      .loadJSONFile(
        getMetaFileLocationForDir(dirPath, location.getDirSeparator()),
      )
      .then((meta: TS.FileSystemEntryMeta) => {
        if (meta) {
          return {
            ...(metaAdd && metaAdd),
            ...meta,
            // description: getDescriptionPreview(meta.description, 200),
          };
        }
        return undefined;
      });
  }

  function loadMetaForFile(
    filePath: string,
    location: CommonLocation,
    metaAdd?,
  ): Promise<TS.FileSystemEntryMeta> {
    return location
      .loadJSONFile(
        getMetaFileLocationForFile(filePath, location.getDirSeparator()),
      )
      .then((meta: TS.FileSystemEntryMeta) => {
        if (meta) {
          return {
            ...(metaAdd && metaAdd),
            ...meta,
            // description: getDescriptionPreview(meta.description, 200),
          };
        }
        return undefined;
      });
  }

  function loadCurrentDirMeta(
    directoryPath: string,
    dirEntries: TS.FileSystemEntry[],
    pageFiles?: TS.FileSystemEntry[],
  ): Promise<TS.FileSystemEntry[]> {
    if (!currentLocation) {
      return Promise.resolve([]);
    }
    return currentLocation
      .listMetaDirectoryPromise(directoryPath)
      .then((meta) => {
        const dirEntriesPromises = dirEntries
          .filter((entry) => !entry.isFile)
          .map((entry) => getEnhancedDir(entry));
        const files = pageFiles
          ? pageFiles
          : dirEntries.filter((entry) => entry.isFile);
        const fileEntriesPromises = getFileEntriesPromises(files, meta);
        const thumbs = getThumbs(files, meta);
        return getEntries(
          [...dirEntriesPromises, ...fileEntriesPromises, ...thumbs],
          dirEntries,
        );
      })
      .catch((ex) => {
        console.log(ex);
        return undefined;
      });
  }

  function getFileEntriesPromises(
    pageFiles: TS.FileSystemEntry[],
    meta: Array<any>,
  ): Promise<TS.FileSystemEntry>[] {
    return pageFiles.map((entry) => {
      const metaFilePath = getMetaFileLocationForFile(
        entry.path,
        currentLocation?.getDirSeparator(),
      );
      if (
        // check if metaFilePath exist in listMetaDirectory content
        meta.some((metaFile) => metaFilePath.endsWith(metaFile.path)) &&
        // !checkEntryExist(entry.path) &&
        entry.path.indexOf(
          AppConfig.metaFolder + currentLocation?.getDirSeparator(),
        ) === -1
      ) {
        return getMetaForEntry(entry);
      }
      return Promise.resolve(entry); //Promise.resolve({ [entry.path]: undefined });
    });
  }

  function getEntries(metaPromises, dirEntries): Promise<TS.FileSystemEntry[]> {
    // const catchHandler = (error) => undefined;
    //return Promise.all(metaPromises.map((promise) => promise.catch(catchHandler)))
    return executePromisesInBatches(metaPromises, 100)
      .then((entries: TS.FileSystemEntry[]) => {
        return mergeByPath(entries, dirEntries);
      })
      .catch((err) => {
        console.log('err updateEntries:', err);
        return undefined;
      });
  }

  function getThumbs(
    pageFiles: TS.FileSystemEntry[],
    meta?: Array<any>,
  ): Promise<TS.FileSystemEntry>[] {
    return pageFiles.map((entry) =>
      Promise.resolve(setThumbForEntry(entry, meta)),
    );
  }

  async function setThumbForEntry(
    entry: TS.FileSystemEntry,
    meta?: Array<any>, //TS.FileSystemEntryMeta[], -> todo extra path in meta
  ): Promise<TS.FileSystemEntry> {
    const thumbEntry = { ...entry, tags: [] };
    let thumbPath = getThumbFileLocationForFile(
      entry.path,
      currentLocation?.getDirSeparator(),
      false,
    );

    if (thumbPath) {
      if (
        currentLocation?.haveObjectStoreSupport() ||
        currentLocation?.haveWebDavSupport()
      ) {
        const metaFile =
          meta && meta.length < 999
            ? meta.find((m) => thumbPath && thumbPath.endsWith(m.path))
            : true;
        if (metaFile) {
          if (thumbPath && thumbPath.startsWith('/')) {
            thumbPath = thumbPath.substring(1);
          }

          thumbPath = await currentLocation.generateURLforPath(
            thumbPath,
            604800,
          );
          if (thumbPath) {
            thumbEntry.meta = { id: getUuid(), thumbPath };
          }
        }
      } else {
        const metaFile = meta?.find(
          (m) => thumbPath && thumbPath.endsWith(m.path),
        );
        if (metaFile) {
          thumbEntry.meta = { id: getUuid(), thumbPath }; //{ ...metaFile, thumbPath };
        }
      }
    }
    return thumbEntry;
  }

  function getEnhancedDir(
    entry: TS.FileSystemEntry,
  ): Promise<TS.FileSystemEntry> {
    if (!entry) {
      return Promise.resolve(undefined);
    }
    if (entry.isFile) {
      return Promise.reject(
        new Error('getEnhancedDir accept dir only:' + entry.path),
      );
    }
    if (entry.name === AppConfig.metaFolder) {
      return Promise.resolve(entry);
    }
    const location = findLocation(entry.locationID);
    return getDirMeta(entry.path, location).then((meta) => ({
      ...entry,
      meta,
    }));
  }

  function getEnhancedFile(
    entry: TS.FileSystemEntry,
    useEncryption: boolean = true,
  ): Promise<TS.FileSystemEntry> {
    if (!entry) {
      return Promise.resolve(undefined);
    }
    if (!entry.isFile) {
      return Promise.reject(
        new Error('getEnhancedFile accept file only:' + entry.path),
      );
    }

    const location = findLocation(entry.locationID);

    const thumbFilePath = getThumbFileLocationForFile(
      entry.path,
      location.getDirSeparator(),
      false,
    );

    return location
      .checkFileExist(thumbFilePath, useEncryption)
      .then((exist) => {
        const metaProps = exist ? { thumbPath: thumbFilePath } : {};

        const metaFilePath = getMetaFileLocationForFile(
          entry.path,
          location.getDirSeparator(),
        );

        try {
          return location
            .loadJSONFile(metaFilePath, useEncryption)
            .then((meta: TS.FileSystemEntryMeta) => {
              if (meta) {
                return enhanceEntry(
                  { ...entry, meta: { ...meta, ...metaProps } },
                  tagDelimiter,
                  location.getDirSeparator(),
                );
              }
              return enhanceEntry(
                { ...entry, meta: { ...metaProps } },
                tagDelimiter,
                location.getDirSeparator(),
              );
            });
        } catch (e) {
          return enhanceEntry(
            { ...entry, meta: { ...metaProps } },
            tagDelimiter,
            location.getDirSeparator(),
          );
        }
      });
  }

  function getDirMeta(
    dirPath: string,
    location: CommonLocation,
  ): Promise<TS.FileSystemEntryMeta> {
    return location.listMetaDirectoryPromise(dirPath).then(async (meta) => {
      const metaFilePath = getMetaFileLocationForDir(
        dirPath,
        location?.getDirSeparator(),
      );
      const thumbDirPath = getThumbFileLocationForDirectory(
        dirPath,
        location?.getDirSeparator(),
      );
      let thumbPath;
      const metaFile = meta.find((metaFile) =>
        thumbDirPath.endsWith(metaFile.path),
      );
      if (metaFile) {
        thumbPath = await location.getThumbPath(
          thumbDirPath,
          metaFile.lmdt, //? metaFile.lmdt : new Date().getTime(),
        );
        /*location.haveObjectStoreSupport() || location.haveWebDavSupport()
            ? await location.getURLforPathInt(thumbDirPath)
            : thumbDirPath;*/
      }
      if (
        meta.some((metaFile) => metaFilePath.endsWith(metaFile.path)) &&
        dirPath.indexOf(AppConfig.metaFolder + location?.getDirSeparator()) ===
          -1
      ) {
        return loadMetaForDir(dirPath, location, { thumbPath });
      }
      if (thumbPath) {
        return { id: '', thumbPath, lastUpdated: new Date().getTime() };
      }
      return undefined;
    });
  }

  function openIsTruncatedConfirmDialog() {
    open.current = true;
    forceUpdate();
  }

  function closeIsTruncatedConfirmDialog() {
    open.current = false;
    forceUpdate();
  }

  function IsTruncatedConfirmDialogAsync(props) {
    return (
      <React.Suspense fallback={<LoadingLazy />}>
        <IsTruncatedConfirmDialog {...props} />
      </React.Suspense>
    );
  }

  const context = useMemo(() => {
    return {
      currentLocationPath: currentLocationPath.current,
      currentDirectoryEntries: currentDirectoryEntries.current,
      directoryMeta: directoryMeta.current,
      currentDirectoryPath: currentDirectory.current?.path,
      currentDirectory: currentDirectory.current,
      currentDirectoryFiles: currentDirectoryFiles.current,
      currentDirectoryDirs:
        currentDirectoryDirs.current?.length > 0
          ? currentDirectoryDirs.current
          : getDefaultColumnsToShow(currentDirectoryEntries.current),
      //isMetaFolderExist: isMetaFolderExist.current,
      searchQuery: searchQuery.current,
      isSearchMode: isSearchMode.current,
      isSearching,
      sendDirMessage,
      currentPerspective,
      updateCurrentDirEntry,
      setSearchQuery,
      loadDirectoryContent,
      loadParentDirectoryContent,
      enhanceDirectoryContent,
      openDirectory,
      openCurrentDirectory,
      clearDirectoryContent,
      setManualDirectoryPerspective,
      setCurrentDirectoryColor,
      setCurrentDirectoryDirs,
      setCurrentDirectoryFiles,
      addDirectoryEntries,
      //removeDirectoryEntries,
      //reflectRenameEntries,
      updateCurrentDirEntries,
      //updateThumbnailUrl,
      setDirectoryMeta,
      setSearchResults,
      appendSearchResults,
      enterSearchMode,
      exitSearchMode,
      getDefaultPerspectiveSettings,
      getAllPropertiesPromise,
      loadCurrentDirMeta,
      openIsTruncatedConfirmDialog,
      closeIsTruncatedConfirmDialog,
      setThumbnails,
      setThumbnail,
      getMetaForEntry,
      getEnhancedDir,
    };
  }, [
    currentLocation,
    currentLocationPath.current,
    currentDirectoryEntries.current,
    currentDirectory.current,
    directoryMeta.current,
    currentDirectoryFiles.current,
    currentDirectoryDirs.current,
    isSearchMode.current,
    searchQuery.current,
  ]);

  return (
    <DirectoryContentContext.Provider value={context}>
      <IsTruncatedConfirmDialogAsync
        open={open.current}
        onClose={closeIsTruncatedConfirmDialog}
      />
      {children}
    </DirectoryContentContext.Provider>
  );
};
