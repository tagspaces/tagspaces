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
import { useDispatch, useSelector } from 'react-redux';
import { actions as AppActions, AppDispatch } from '-/reducers/app';
import { TS } from '-/tagspaces.namespace';
import { useTranslation } from 'react-i18next';
import {
  cleanTrailingDirSeparator,
  cleanFrontDirSeparator,
  extractContainingDirectoryPath,
  extractParentDirectoryPath,
  getMetaFileLocationForDir,
  getMetaFileLocationForFile,
  getThumbFileLocationForDirectory,
  getThumbFileLocationForFile,
} from '@tagspaces/tagspaces-common/paths';
import { executePromisesInBatches, updateFsEntries } from '-/services/utils-io';
import AppConfig from '-/AppConfig';
import { PerspectiveIDs } from '-/perspectives';
import { updateHistory } from '-/utils/dom';
import {
  actions as SettingsActions,
  getDefaultPerspective,
  getShowUnixHiddenEntries,
  getTagColor,
  getTagTextColor,
} from '-/reducers/settings';
import { enhanceEntry, getUuid } from '@tagspaces/tagspaces-common/utils-io';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { getSearches } from '-/reducers/searches';
import { getTagColors } from '-/services/taglibrary-utils';
import { Pro } from '-/pro';
import { defaultSettings as defaultGridSettings } from '-/perspectives/grid';
import { defaultSettings as defaultListSettings } from '-/perspectives/list';
import { useEditedEntryContext } from '-/hooks/useEditedEntryContext';
import { useEditedEntryMetaContext } from '-/hooks/useEditedEntryMetaContext';
import { useEditedKanBanMetaContext } from '-/hooks/useEditedKanBanMetaContext';
import { CommonLocation } from '-/utils/CommonLocation';
import { useCancelable } from '-/utils/useCancelable';
import LoadingLazy from '-/components/LoadingLazy';

type DirectoryContentContextData = {
  currentLocationPath: string;
  currentDirectoryEntries: TS.FileSystemEntry[];
  directoryMeta: TS.FileSystemEntryMeta;
  //currentDirectoryPerspective: TS.PerspectiveType;
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
  exitSearchMode: () => void;
  findFromSavedSearch: (uuid: string) => void;
  getDefaultPerspectiveSettings: (perspective: string) => TS.FolderSettings;
  getPerspective: () => TS.PerspectiveType;
  getAllPropertiesPromise: (
    entryPath: string,
    locationID?: string,
  ) => Promise<TS.FileSystemEntry>;
  loadCurrentDirMeta: (
    directoryPath: string,
    dirEntries: TS.FileSystemEntry[],
    pageFiles?: TS.FileSystemEntry[],
  ) => Promise<TS.FileSystemEntry[]>;
  openIsTruncatedConfirmDialog: () => void;
  closeIsTruncatedConfirmDialog: () => void;
};

export const DirectoryContentContext =
  createContext<DirectoryContentContextData>({
    currentLocationPath: undefined,
    currentDirectoryEntries: [],
    directoryMeta: undefined,
    //currentDirectoryPerspective: undefined,
    currentDirectoryPath: undefined,
    currentDirectoryFiles: [],
    currentDirectoryDirs: [],
    //isMetaLoaded: undefined,
    //isMetaFolderExist: false,
    searchQuery: {},
    isSearchMode: false,
    addDirectoryEntries: undefined,
    //removeDirectoryEntries: undefined,
    //reflectRenameEntries: undefined,
    setSearchQuery: () => {},
    loadParentDirectoryContent: () => {},
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
    findFromSavedSearch: () => {},
    getDefaultPerspectiveSettings: undefined,
    getPerspective: undefined,
    getAllPropertiesPromise: undefined,
    loadCurrentDirMeta: undefined,
    openIsTruncatedConfirmDialog: undefined,
    closeIsTruncatedConfirmDialog: undefined,
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
    findLocation,
    skipInitialDirList,
    getLocationPath,
  } = useCurrentLocationContext();
  const { actions } = useEditedEntryContext();
  const { metaActions, setReflectMetaActions } = useEditedEntryMetaContext();
  const { kanbanActions } = useEditedKanBanMetaContext();
  const { showNotification, hideNotifications } = useNotificationContext();
  const { selectedEntries, setSelectedEntries } = useSelectedEntriesContext();
  const { signal, abort } = useCancelable();

  const currentLocationPath = useRef<string>('');
  //const useGenerateThumbnails = useSelector(getUseGenerateThumbnails);
  const showUnixHiddenEntries = useSelector(getShowUnixHiddenEntries);
  const defaultPerspective = useSelector(getDefaultPerspective);
  //const editedEntryPaths = useSelector(getEditedEntryPaths);
  const searches = useSelector(getSearches);
  const defaultBackgroundColor = useSelector(getTagColor);
  const defaultTextColor = useSelector(getTagTextColor);

  //const enableWS = useSelector(getEnableWS);

  const currentDirectoryEntries = useRef<TS.FileSystemEntry[]>([]);
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
  const isLoading = useRef<boolean>(false);
  //const isMetaFolderExist = useRef<boolean>(undefined);
  const currentDirectoryPath = useRef<string>(undefined);
  const currentDirectoryFiles = useRef<TS.OrderVisibilitySettings[]>([]);
  const currentDirectoryDirs = useRef<TS.OrderVisibilitySettings[]>([]);
  // const firstRender = useFirstRender();
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  useEffect(() => {
    if (AppConfig.isElectron) {
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
          if (isLoading.current) {
            abort();
          }
          isLoading.current = true;
          openDirectory(locationPath)
            .then((success) => {
              manualPerspective.current = 'unspecified';
              isLoading.current = false;
              return success;
            })
            .catch((ex) => console.log(ex));
        }
      });
    } else {
      currentLocationPath.current = '';
      clearDirectoryContent();
      exitSearchMode();
    }
  }, [currentLocation]);

  useEffect(() => {
    if (metaActions && metaActions.length > 0) {
      for (const action of metaActions) {
        if (
          cleanTrailingDirSeparator(currentDirectoryPath.current) ===
          cleanTrailingDirSeparator(action.entry.path)
        ) {
          if (action.action === 'perspectiveChange') {
            if (action.entry.meta.perspective !== undefined) {
              manualPerspective.current =
                action.entry.meta.perspective === PerspectiveIDs.UNSPECIFIED
                  ? defaultPerspective
                  : action.entry.meta.perspective;
              forceUpdate();
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
    if (kanbanActions && kanbanActions.length > 0) {
      for (const action of kanbanActions) {
        if (action.action === 'directoryVisibilityChange') {
          directoryMeta.current = action.meta;
          currentDirectoryDirs.current = [
            ...directoryMeta.current.customOrder.folders,
          ];
          forceUpdate();
        }
      }
    }
  }, [kanbanActions]);

  useEffect(() => {
    reflectActions(actions).catch(console.error);
    reflectSelection(actions);
  }, [actions]);

  const reflectActions = async (actions) => {
    if (actions && actions.length > 0) {
      for (const action of actions) {
        if (action.action === 'add') {
          await reflectAddAction(action.entry);
        } else if (action.action === 'delete') {
          reflectDeleteAction(action.entry);
          /// RENAME
        } else if (action.action === 'update') {
          let index = currentDirectoryEntries.current.findIndex(
            (e) => e.path === action.oldEntryPath,
          );
          if (index !== -1) {
            currentDirectoryEntries.current[index] = {
              ...currentDirectoryEntries.current[index],
              ...action.entry,
            };
          }
          if (
            cleanTrailingDirSeparator(currentDirectoryPath.current) ===
            cleanTrailingDirSeparator(action.entry.path)
          ) {
            directoryMeta.current = {
              ...(directoryMeta.current && directoryMeta.current),
              ...(action.entry.meta && action.entry.meta),
            };
          }
        } else if (action.action === 'move') {
          await reflectAddAction(action.entry);
          reflectDeleteAction(
            currentLocation.toFsEntry(action.oldEntryPath, action.entry.isFile),
          );
        }
      }
      // create a shallow copy to publish changes
      currentDirectoryEntries.current = [...currentDirectoryEntries.current];
      forceUpdate();
    }
  };

  function reflectSelection(actions: TS.EditAction[]) {
    let updated = false;
    if (actions && actions.length > 0) {
      let selected = [];
      for (const action of actions) {
        if (
          action.source !== 'fsWatcher' &&
          action.source !== 'upload' &&
          action.source !== 'thumbgen' &&
          action.entry &&
          action.entry.path.indexOf(
            currentLocation?.getDirSeparator() + AppConfig.metaFolder,
          ) === -1
        ) {
          if (action.action === 'add') {
            if (
              currentDirectoryEntries.current.some(
                (entry) => entry.path === action.entry.path,
              )
            ) {
              selected.push(action.entry);
              updated = true;
              /*if (
                !selectedEntries.some(
                  (entry) => entry.path === action.entry.path,
                )
              ) {
                if (selectedEntries.length > 0) {
                  selected = [...selectedEntries, action.entry];
                } else {
                  selected.push(action.entry);
                }
                updated = true;
              }*/
            }
          } else if (action.action === 'delete') {
            let index = selectedEntries.findIndex(
              (e) => e.path === action.entry.path,
            );
            if (index !== -1) {
              selectedEntries.splice(index, 1);
              selected = [...selectedEntries];
              updated = true;
            }
          } else if (action.action === 'update') {
            let index = selectedEntries.findIndex(
              (e) => e.path === action.oldEntryPath,
            );
            if (index !== -1) {
              selectedEntries[index] = action.entry;
              selected = [...selectedEntries];
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
          cleanFrontDirSeparator(currentDirectoryPath.current),
        ) === cleanTrailingDirSeparator(cleanFrontDirSeparator(dirPath))
      ) {
        currentDirectoryEntries.current.push(entry);
      }
    }
  }

  function reflectDeleteAction(entry: TS.FileSystemEntry) {
    if (!entry.isFile) {
      if (entry.path === currentDirectoryPath.current) {
        loadParentDirectoryContent();
        return;
      }
    }
    let index = currentDirectoryEntries.current.findIndex(
      (e) => e.path === entry.path,
    );
    if (index !== -1) {
      currentDirectoryEntries.current.splice(index, 1);
    }
  }

  function getDefaultDirMeta(): TS.FileSystemEntryMeta {
    // const perspective = getPerspective();
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
    } else if (perspective === PerspectiveIDs.KANBAN && Pro) {
      return Pro.Perspectives.KanBanPerspectiveSettings;
    }
    return defaultGridSettings;
  }

  function setCurrentDirectoryEntries(dirEntries, reflect = true) {
    currentDirectoryEntries.current = dirEntries;
    if (reflect) {
      forceUpdate();
    }
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
    if (isSearchMode.current) {
      setCurrentDirectoryEntries(searchResults);
      /*setCurrentDirectoryEntries(
        searchResults.map((sr) => ({
          ...sr,
          // @ts-ignore temp fix model in common
          ...(sr.thumbPath && {
            // @ts-ignore
            meta: { ...(sr.meta && sr.meta), thumbPath: sr.thumbPath },
          }),
        })),
      );*/
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

    // dispatch(actions.setIsLoading(true));

    if (currentDirectoryPath.current !== undefined) {
      const parentDirectory = extractParentDirectoryPath(
        currentDirectoryPath.current,
        currentLocation?.getDirSeparator(),
      );
      console.log(
        'parentDirectory: ' +
          parentDirectory +
          ' - currentLocationPath: ' +
          currentLocationPath.current,
      );
      if (
        parentDirectory.includes(
          cleanTrailingDirSeparator(currentLocationPath.current),
        )
      ) {
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

  function updateCurrentDirEntry(path: string, entry: any) {
    if (path === currentDirectoryPath.current) {
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
      const entries = dirEntries.filter((e) => e !== undefined);
      const isNotFromCurrentDir =
        checkCurrentDir &&
        entries.some(
          (e) =>
            !cleanFrontDirSeparator(e.path).startsWith(
              cleanFrontDirSeparator(currentDirectoryPath.current),
            ),
        );
      if (
        entries.length > 0 &&
        !isNotFromCurrentDir //entries[0].path.startsWith(currentDirectoryPath.current)
      ) {
        //const currDirEntries = currentDirEntries ? currentDirEntries : currentDirectoryEntries;
        if (
          currentDirectoryEntries.current &&
          currentDirectoryEntries.current.length > 0
        ) {
          /*if (inlineUpdate) {
            // inline update currentDirectoryEntries
            let isUpdated = false;
            for (const oldEntry of currentDirectoryEntries.current) {
              const entryUpdated = entries.find(
                (updated) => updated.path === oldEntry.path,
              );
              if (entryUpdated) {
                oldEntry.meta = { ...oldEntry.meta, ...entryUpdated.meta };
                isUpdated = true;
              }
            }
            if (isUpdated) {
              forceUpdate();
            }
          }*/
          setCurrentDirectoryEntries(
            currentDirectoryEntries.current.map((e) => {
              const eUpdated = entries.filter((u) => u.path === e.path);
              if (eUpdated.length > 0) {
                const mergedMeta = eUpdated.reduce((merged, obj) => {
                  return { ...merged, ...obj.meta };
                }, {});
                return { ...e, meta: { ...e.meta, ...mergedMeta } };
              }
              return e;
            }),
          );
        } else {
          setCurrentDirectoryEntries(entries);
        }
      }
    }
  }

  function loadMetaDirectoryContent(
    directoryPath: string,
    location: CommonLocation,
    showHiddenEntries = undefined,
  ): Promise<TS.FileSystemEntry[]> {
    if (selectedEntries.length > 0) {
      setSelectedEntries([]);
    }
    return getDirMeta(directoryPath, location).then((meta) => {
      if (meta) {
        directoryMeta.current = meta;
      } else {
        directoryMeta.current = getDefaultDirMeta();
      }
      return loadDirectoryContentInt(
        directoryPath,
        location,
        showHiddenEntries,
      );
    });
  }

  /**
   * @deprecated for loadDirMeta=true use loadMetaDirectoryContent instead
   * @param directoryPath
   * @param loadDirMeta
   * @param showHiddenEntries
   */
  function loadDirectoryContent(
    directoryPath: string,
    loadDirMeta = false,
    showHiddenEntries = undefined,
  ): Promise<TS.FileSystemEntry[]> {
    // dispatch(actions.setIsLoading(true));

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
        if (signal.aborted) {
          return [];
        }
        return loadDirectoryContentInt(
          directoryPath,
          currentLocation,
          showHiddenEntries,
        );
      });
    } else {
      isMetaLoaded.current = false;
      directoryMeta.current = getDefaultDirMeta();
      return loadDirectoryContentInt(
        directoryPath,
        currentLocation,
        showHiddenEntries,
      );
    }
  }

  function loadDirectoryContentInt(
    directoryPath: string,
    location: CommonLocation,
    showHiddenEntries = undefined,
  ): Promise<TS.FileSystemEntry[]> {
    const uploadCancelled = new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject());
    });

    showNotification(t('core:loading'), 'info', false);
    const resultsLimit = {
      maxLoops:
        currentLocation && currentLocation.maxLoops
          ? currentLocation.maxLoops
          : AppConfig.maxLoops,
      IsTruncated: false,
    };
    const promise = location
      .listDirectoryPromise(
        directoryPath,
        [],
        currentLocation ? currentLocation.ignorePatternPaths : [],
        resultsLimit,
      )
      .then((results) => {
        if (signal.aborted) {
          return [];
        }
        if (resultsLimit.IsTruncated) {
          openIsTruncatedConfirmDialog();
        }
        if (results !== undefined) {
          // console.debug('app listDirectoryPromise resolved:' + results.length);
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
        // console.timeEnd('listDirectoryPromise');
        return loadDirectoryFailure(error);
      });
    return Promise.race([promise, uploadCancelled]).then(() => {
      // useCancelable will call abort when unmounted. After listDirectoryPromise succeeded,
      // we no longer care about that method of cancellation. Catch here to avoid an unhandled promise rejection.
      uploadCancelled.catch(() => {});
      return promise;
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
    location: CommonLocation = undefined,
  ): Promise<boolean> {
    if (dirPath !== undefined) {
      const cLocation = location || currentLocation;
      return cLocation.checkDirExist(dirPath).then((exist) => {
        if (exist) {
          const reloadMeta =
            cleanTrailingDirSeparator(currentDirectoryPath.current) ===
            cleanTrailingDirSeparator(dirPath);
          return loadMetaDirectoryContent(
            dirPath,
            cLocation,
            showHiddenEntries,
          ).then((dirEntries) => {
            if (dirEntries && reloadMeta) {
              // load meta files (reload of the same directory is not handled from ThumbGenerationContextProvider)
              return loadCurrentDirMeta(dirPath, dirEntries).then((entries) => {
                updateCurrentDirEntries(entries);
                return true;
              });
            }
            return true;
          });
        } else {
          showNotification(t('core:invalidLink'), 'warning', true);
          return false;
        }
      });
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

    if (directoryMeta.current) {
      /*if (directoryMeta.current.perspective) {
        currentPerspective.current = directoryMeta.current
          .perspective as TS.PerspectiveType;
      } else {
        currentPerspective.current = 'unspecified';
      }*/
      if (directoryMeta.current.customOrder) {
        if (directoryMeta.current.customOrder.files) {
          currentDirectoryFiles.current =
            directoryMeta.current.customOrder.files;
        }
        if (directoryMeta.current.customOrder.folders) {
          currentDirectoryDirs.current =
            directoryMeta.current.customOrder.folders;
        }
      }
    }

    const directoryContent = enhanceDirectoryContent(
      dirEntries,
      location,
      true,
      undefined,
      showHiddenEntries,
    );

    setCurrentDirectoryEntries(directoryContent);
    currentDirectoryPath.current = cleanTrailingDirSeparator(directoryPath);
    updateHistory(
      { ...location, path: currentLocationPath.current },
      directoryPath,
    );
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
        location?.getDirSeparator(),
      );
      directoryContent.push({ ...enhancedEntry, locationID: location.uuid });
      return true;
    });

    return directoryContent;
  }

  /*const perspective = useMemo(
    () => getPerspective(),
    [directoryMeta.current?.perspective, manualPerspective.current],
  );*/

  function getPerspective(): TS.PerspectiveType {
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
  }

  function setManualDirectoryPerspective(
    perspective: TS.PerspectiveType,
    directory: string = undefined,
  ) {
    manualPerspective.current = perspective;
    getAllPropertiesPromise(
      directory ? directory : currentDirectoryPath.current,
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
    forceUpdate();
  }

  function setSearchQuery(sQuery: TS.SearchQuery) {
    if (Object.keys(searchQuery).length === 0) {
      exitSearchMode();
    } else {
      isSearchMode.current = true;
      searchQuery.current = sQuery;
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

  /**
   *  get full entry properties - with full description
   */
  function getAllPropertiesPromise(
    entryPath: string,
    locationID: string = undefined,
  ): Promise<TS.FileSystemEntry> {
    const location = locationID ? findLocation(locationID) : currentLocation;
    return location
      .getPropertiesPromise(entryPath)
      .then((entryProps: TS.FileSystemEntry) => {
        if (entryProps) {
          const entry = { ...entryProps, locationID: location.uuid };
          if (!entryProps.isFile) {
            return getEnhancedDir(entry);
          }
          return getEnhancedFile(entry);
        }
        console.log('Error getting props for ' + entryPath);
        return undefined;
      });
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
          AppConfig.tagDelimiter,
          location?.getDirSeparator(),
        );
      }
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
        return getEntries([
          ...dirEntriesPromises,
          ...fileEntriesPromises,
          ...thumbs,
        ]);
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

  function getEntries(metaPromises): Promise<TS.FileSystemEntry[]> {
    // const catchHandler = (error) => undefined;
    //return Promise.all(metaPromises.map((promise) => promise.catch(catchHandler)))
    return executePromisesInBatches(metaPromises, 100)
      .then((entries: TS.FileSystemEntry[]) => {
        return entries;
      })
      .catch((err) => {
        console.log('err updateEntries:', err);
        return undefined;
      });
  }

  function getThumbs(
    pageFiles: TS.FileSystemEntry[],
    meta: Array<any>,
  ): Promise<TS.FileSystemEntry>[] {
    return pageFiles.map((entry) =>
      Promise.resolve(setThumbForEntry(entry, meta)),
    );
  }

  function setThumbForEntry(
    entry: TS.FileSystemEntry,
    meta: Array<any>, //TS.FileSystemEntryMeta[], -> todo extra path in meta
  ): TS.FileSystemEntry {
    const thumbEntry = { ...entry, tags: [] };
    let thumbPath = getThumbFileLocationForFile(
      entry.path,
      currentLocation?.getDirSeparator(),
      false,
    );
    const metaFile = meta.find((m) => thumbPath && thumbPath.endsWith(m.path));
    if (thumbPath && metaFile) {
      thumbEntry.meta = { id: getUuid(), thumbPath }; //{ ...metaFile, thumbPath };
      if (
        currentLocation?.haveObjectStoreSupport() ||
        currentLocation?.haveWebDavSupport()
      ) {
        if (thumbPath && thumbPath.startsWith('/')) {
          thumbPath = thumbPath.substring(1);
        }

        thumbPath = currentLocation.generateURLforPath(thumbPath, 604800);
        if (thumbPath) {
          thumbEntry.meta = { id: getUuid(), thumbPath };
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

    return location.checkFileExist(thumbFilePath).then((exist) => {
      const metaProps = exist ? { thumbPath: thumbFilePath } : {};

      const metaFilePath = getMetaFileLocationForFile(
        entry.path,
        location.getDirSeparator(),
      );

      try {
        return location
          .loadJSONFile(metaFilePath)
          .then((meta: TS.FileSystemEntryMeta) => {
            if (meta) {
              return enhanceEntry(
                { ...entry, meta: { ...meta, ...metaProps } },
                AppConfig.tagDelimiter,
                location.getDirSeparator(),
              );
            }
            return enhanceEntry(
              { ...entry, meta: { ...metaProps } },
              AppConfig.tagDelimiter,
              location.getDirSeparator(),
            );
          });
      } catch (e) {
        return enhanceEntry(
          { ...entry, meta: { ...metaProps } },
          AppConfig.tagDelimiter,
          location.getDirSeparator(),
        );
      }
    });
  }

  function getDirMeta(
    dirPath: string,
    location: CommonLocation,
  ): Promise<TS.FileSystemEntryMeta> {
    return location.listMetaDirectoryPromise(dirPath).then((meta) => {
      const metaFilePath = getMetaFileLocationForDir(
        dirPath,
        location?.getDirSeparator(),
      );
      const thumbDirPath = getThumbFileLocationForDirectory(
        dirPath,
        location?.getDirSeparator(),
      );
      let thumbPath;
      if (meta.some((metaFile) => thumbDirPath.endsWith(metaFile.path))) {
        thumbPath =
          location.haveObjectStoreSupport() || location.haveWebDavSupport()
            ? location.getURLforPath(thumbDirPath)
            : thumbDirPath;
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
      //currentDirectoryPerspective: currentPerspective.current,
      currentDirectoryPath: currentDirectoryPath.current,
      currentDirectoryFiles: currentDirectoryFiles.current,
      currentDirectoryDirs: currentDirectoryDirs.current,
      //isMetaFolderExist: isMetaFolderExist.current,
      searchQuery: searchQuery.current,
      isSearchMode: isSearchMode.current,
      getPerspective,
      setCurrentDirectoryEntries,
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
      findFromSavedSearch,
      getDefaultPerspectiveSettings,
      getAllPropertiesPromise,
      loadCurrentDirMeta,
      openIsTruncatedConfirmDialog,
      closeIsTruncatedConfirmDialog,
    };
  }, [
    currentLocation,
    currentLocationPath.current,
    currentDirectoryEntries.current,
    currentDirectoryPath.current,
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
