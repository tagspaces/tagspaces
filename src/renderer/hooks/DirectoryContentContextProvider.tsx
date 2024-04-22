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
import { locationType } from '@tagspaces/tagspaces-common/misc';
import { actions as AppActions, AppDispatch } from '-/reducers/app';
import { TS } from '-/tagspaces.namespace';
import { useTranslation } from 'react-i18next';
import {
  cleanTrailingDirSeparator,
  cleanFrontDirSeparator,
  extractContainingDirectoryPath,
  extractParentDirectoryPath,
} from '@tagspaces/tagspaces-common/paths';
import PlatformIO from '-/services/platform-facade';
import {
  getAllPropertiesPromise,
  toFsEntry,
  updateFsEntries,
} from '-/services/utils-io';
import AppConfig from '-/AppConfig';
import { PerspectiveIDs } from '-/perspectives';
import { updateHistory } from '-/utils/dom';
import {
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
import { defaultTitle } from '-/services/search';
import { Pro } from '-/pro';
import { defaultSettings as defaultGridSettings } from '-/perspectives/grid';
import { defaultSettings as defaultListSettings } from '-/perspectives/list';
import { useEditedEntryContext } from '-/hooks/useEditedEntryContext';
import { getDirMeta, loadCurrentDirMeta } from '-/services/meta-loader';
import { useEditedEntryMetaContext } from '-/hooks/useEditedEntryMetaContext';
import { useEditedKanBanMetaContext } from '-/hooks/useEditedKanBanMetaContext';

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
    isCloudLocation,
    showDirs?: boolean,
    limit?: number,
    getDirMeta?: boolean,
    generateThumbnails?: boolean,
  ) => any;
  openDirectory: (
    dirPath: string,
    locationID?: string,
    showHiddenEntries?: boolean,
  ) => Promise<boolean>;
  openCurrentDirectory: (showHiddenEntries?: boolean) => Promise<boolean>;
  clearDirectoryContent: () => void;
  perspective: TS.PerspectiveType;
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
    enhanceDirectoryContent: () => {},
    openDirectory: undefined,
    openCurrentDirectory: undefined,
    clearDirectoryContent: () => {},
    perspective: undefined,
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
    switchLocationTypeByID,
  } = useCurrentLocationContext();
  const { actions } = useEditedEntryContext();
  const { metaActions, setReflectMetaActions } = useEditedEntryMetaContext();
  const { kanbanActions } = useEditedKanBanMetaContext();
  const { showNotification, hideNotifications } = useNotificationContext();
  const { selectedEntries, setSelectedEntries } = useSelectedEntriesContext();

  const currentLocationPath = useRef<string>('');
  //const useGenerateThumbnails = useSelector(getUseGenerateThumbnails);
  const showUnixHiddenEntries = useSelector(getShowUnixHiddenEntries);
  const defaultPerspective = useSelector(getDefaultPerspective);
  //const editedEntryPaths = useSelector(getEditedEntryPaths);
  const searches = useSelector(getSearches);
  const defaultBackgroundColor = useSelector(getTagColor);
  const defaultTextColor = useSelector(getTagTextColor);
  const searchHistoryKey = useSelector((state: any) =>
    Pro ? state.settings[Pro.history.historyKeys.searchHistoryKey] : undefined,
  );

  //const enableWS = useSelector(getEnableWS);

  const currentDirectoryEntries = useRef<TS.FileSystemEntry[]>([]);
  const searchQuery = useRef<TS.SearchQuery>({});
  const isSearchMode = useRef<boolean>(false);
  //const currentPerspective = useRef<TS.PerspectiveType>('unspecified');
  const manualPerspective = useRef<TS.PerspectiveType>('unspecified');
  const directoryMeta = useRef<TS.FileSystemEntryMeta>(getDefaultDirMeta());
  /**
   * isMetaLoaded boolean if thumbs and description from meta are loaded
   * is using why directoryMeta can be loaded but empty
   * undefined means no .ts folder exist
   */
  const isMetaLoaded = useRef<boolean>(undefined);
  //const isMetaFolderExist = useRef<boolean>(undefined);
  const currentDirectoryPath = useRef<string>(undefined);
  const currentDirectoryFiles = useRef<TS.OrderVisibilitySettings[]>([]);
  const currentDirectoryDirs = useRef<TS.OrderVisibilitySettings[]>([]);
  // const firstRender = useFirstRender();
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  useEffect(() => {
    if (currentLocation) {
      // check for relative path for Location
      getLocationPath(currentLocation).then((locationPath) => {
        currentLocationPath.current = locationPath;
        if (!skipInitialDirList) {
          return openDirectory(locationPath, currentLocation.uuid);
        }
      });
      manualPerspective.current = 'unspecified';
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
            manualPerspective.current =
              action.entry.meta.perspective === PerspectiveIDs.UNSPECIFIED
                ? defaultPerspective
                : action.entry.meta.perspective;
            forceUpdate();
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
          // update ordered entries (KanBan) todo find better place for this
          /*if (Pro && Pro.MetaOperations && action.oldEntryPath) {
            const dirPath = extractContainingDirectoryPath(
              action.entry.path,
              PlatformIO.getDirSeparator(),
            );
            if (
              cleanTrailingDirSeparator(
                cleanFrontDirSeparator(currentDirectoryPath.current),
              ) === cleanTrailingDirSeparator(cleanFrontDirSeparator(dirPath))
            ) {
              const oldName = extractFileName(
                action.oldEntryPath,
                PlatformIO.getDirSeparator(),
              );
              const dirMeta: TS.FileSystemEntryMeta =
                await Pro.MetaOperations.getOrderEntryRenamed(
                  dirPath,
                  oldName,
                  action.entry.name,
                );
              if (dirMeta) {
                await saveMetaDataPromise(dirPath, dirMeta);
                directoryMeta.current = { ...dirMeta };
                if (directoryMeta.current.customOrder) {
                  if (directoryMeta.current.customOrder.files) {
                    currentDirectoryFiles.current = [
                      ...directoryMeta.current.customOrder.files,
                    ];
                  }
                  if (directoryMeta.current.customOrder.folders) {
                    currentDirectoryDirs.current = [
                      ...directoryMeta.current.customOrder.folders,
                    ];
                  }
                }
              }
            }
          }*/
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
            toFsEntry(
              action.oldEntryPath,
              action.entry.isFile,
              currentLocation.uuid,
            ),
          );
        }
      }
      // create a shallow copy to publish changes
      currentDirectoryEntries.current = [...currentDirectoryEntries.current];
      forceUpdate();
    }
  };

  function reflectSelection(actions) {
    let updated = false;
    if (actions && actions.length > 0) {
      let selected = [];
      for (const action of actions) {
        if (action.action === 'add') {
          if (
            currentDirectoryEntries.current.some(
              (entry) => entry.path === action.entry.path,
            )
          ) {
            if (selectedEntries.length > 0) {
              selected = [...selectedEntries, action.entry];
            } else {
              selected.push(action.entry);
            }
            updated = true;
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
        PlatformIO.getDirSeparator(),
      );
      if (
        cleanTrailingDirSeparator(
          cleanFrontDirSeparator(currentDirectoryPath.current),
        ) === cleanTrailingDirSeparator(cleanFrontDirSeparator(dirPath))
      ) {
        currentDirectoryEntries.current.push(entry);
        // reflect add KanBan folders visibility todo move in IOActionContext
        /*if (!entry.isFile) {
          await toggleDirVisibility(
            { name: entry.name, uuid: entry.uuid },
            dirPath,
            false,
          );
        }*/
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
        PlatformIO.getDirSeparator(),
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
        openDirectory(parentDirectory, currentLocation.uuid);
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

  /*function updateThumbnailUrl(filePath: string, thumbUrl: string) {
    const dirEntries = currentDirectoryEntries.current.map((entry) => {
      if (entry.path === filePath) {
        return { ...entry, thumbPath: thumbUrl };
      }
      return entry;
    });
    setCurrentDirectoryEntries(dirEntries);
  }*/

  function loadDirectoryContent(
    directoryPath: string,
    loadDirMeta = false,
    showHiddenEntries = undefined,
  ): Promise<TS.FileSystemEntry[]> {
    // console.debug('loadDirectoryContent:' + directoryPath);
    //window.walkCanceled = false;

    // dispatch(actions.setIsLoading(true));

    if (selectedEntries.length > 0) {
      setSelectedEntries([]);
    }
    if (loadDirMeta) {
      return getDirMeta(directoryPath).then((meta) => {
        if (meta) {
          directoryMeta.current = meta;
        } else {
          directoryMeta.current = getDefaultDirMeta();
        }
        return loadDirectoryContentInt(directoryPath, showHiddenEntries);
      });
      /*const metaDirectory = getMetaDirectoryPath(directoryPath);
      return PlatformIO.checkDirExist(metaDirectory).then((exist) => {
        if (exist) {
          //isMetaFolderExist.current = true;
          const metaFilePath = getMetaFileLocationForDir(
            directoryPath,
            PlatformIO.getDirSeparator(),
          );
          return loadJSONFile(metaFilePath).then((fsEntryMeta) => {
            isMetaLoaded.current = true;
            if (fsEntryMeta) {
              directoryMeta.current = fsEntryMeta;
            } else {
              directoryMeta.current = getDefaultDirMeta();
            }
            return loadDirectoryContentInt(directoryPath, showHiddenEntries);
          });
        } else {
          directoryMeta.current = getDefaultDirMeta();
          return loadDirectoryContentInt(directoryPath, showHiddenEntries);
        }
      });*/
    } else {
      isMetaLoaded.current = false;
      directoryMeta.current = getDefaultDirMeta();
      return loadDirectoryContentInt(directoryPath, showHiddenEntries);
    }
  }

  function loadDirectoryContentInt(
    directoryPath: string,
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
      currentLocation ? currentLocation.ignorePatternPaths : [],
      resultsLimit,
    )
      .then((results) => {
        if (resultsLimit.IsTruncated) {
          //OPEN ISTRUNCATED dialog
          dispatch(AppActions.toggleTruncatedConfirmDialog());
        }
        if (results !== undefined) {
          // console.debug('app listDirectoryPromise resolved:' + results.length);
          return loadDirectorySuccess(
            directoryPath,
            results,
            showHiddenEntries,
          );
        }
        return [];
      })
      .catch((error) => {
        // console.timeEnd('listDirectoryPromise');
        return loadDirectoryFailure(error);
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
      return openDirectory(
        currentDirectoryPath.current,
        currentLocation.uuid,
        showHiddenEntries,
      );
    }
    return Promise.resolve(false);
  }

  function openDirectory(
    dirPath: string,
    locationID: string = undefined,
    showHiddenEntries = undefined,
  ): Promise<boolean> {
    if (dirPath !== undefined) {
      const currentLocationID = locationID ? locationID : currentLocation.uuid;
      return switchLocationTypeByID(currentLocationID).then(() => {
        const reloadMeta = currentDirectoryPath.current === dirPath;
        return loadDirectoryContent(dirPath, true, showHiddenEntries).then(
          (dirEntries) => {
            if (dirEntries && reloadMeta) {
              // load meta files (reload of the same directory is not handled from ThumbGenerationContextProvider)
              return loadCurrentDirMeta(dirPath, dirEntries).then((entries) => {
                updateCurrentDirEntries(entries);
                return true;
              });
            }
            return true;
          },
        );
      });
    }
    return Promise.resolve(false);
  }

  function loadDirectorySuccess(
    directoryPath: string,
    dirEntries: TS.FileSystemEntry[],
    showHiddenEntries = undefined,
  ): TS.FileSystemEntry[] {
    hideNotifications(['error']);

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
    } /*else {
      currentPerspective.current = 'unspecified';
    }*/
    const directoryContent = enhanceDirectoryContent(
      dirEntries,
      currentLocation && currentLocation.type === locationType.TYPE_CLOUD,
      true,
      undefined,
      showHiddenEntries,
    );

    isSearchMode.current = false;

    setCurrentDirectoryEntries(directoryContent);
    currentDirectoryPath.current = cleanTrailingDirSeparator(directoryPath);
    updateHistory(
      { ...currentLocation, path: currentLocationPath.current },
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

  const perspective = useMemo(
    () => getPerspective(),
    [directoryMeta.current?.perspective, manualPerspective.current],
  );

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
        console.warn(
          'Error getting properties for entry: ' + directory + ' - ' + error,
        );
      });

    /*return new Promise((resolve) => {
      if (isManual) {
        //&& currentPerspective.current === 'unspecified') {
        manualPerspective.current = perspective;
        resolve(null);
      } else {
        if (
          directory === undefined ||
          directory === currentDirectoryPath.current
        ) {
          currentPerspective.current = perspective;
          manualPerspective.current = isManual ? perspective : 'unspecified';
        }
        savePerspective(
          directory ? directory : currentDirectoryPath.current,
          perspective,
        ).then((entryMeta: TS.FileSystemEntryMeta) => resolve(entryMeta));
      }
      setSelectedEntries([]);
      if (reload) {
        forceUpdate();
      }
    });*/
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

  /*function toggleDirVisibility(
    dir: TS.OrderVisibilitySettings,
    parentDirPath: string = undefined,
    update: boolean = true,
  ): Promise<TS.FileSystemEntryMeta> {
    if (Pro && Pro.MetaOperations) {
      return Pro.MetaOperations.toggleDirectoryVisibility(
        parentDirPath ? parentDirPath : currentDirectoryPath.current,
        {
          name: dir.name,
          uuid: dir.uuid,
        },
      ).then((meta: TS.FileSystemEntryMeta) => {
        if (meta) {
          directoryMeta.current = meta;
          currentDirectoryDirs.current = [
            ...directoryMeta.current.customOrder.folders,
          ];
          if (update) {
            forceUpdate();
          }
        }
        return meta;
      });
    }
  }*/

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
      perspective,
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
    };
  }, [
    currentLocation,
    currentLocationPath.current,
    currentDirectoryEntries.current,
    currentDirectoryPath.current,
    directoryMeta.current,
    //currentPerspective.current,
    perspective,
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
