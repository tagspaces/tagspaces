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
import {
  actions as AppActions,
  AppDispatch,
  getEditedEntryPaths,
  OpenedEntry,
} from '-/reducers/app';
import { Pro } from '-/pro';
import { TS } from '-/tagspaces.namespace';
import PlatformIO from '-/services/platform-facade';
import {
  enhanceOpenedEntry,
  findExtensionsForEntry,
  getAllPropertiesPromise,
  getNextFile,
  getPrevFile,
  getRelativeEntryPath,
  loadJSONFile,
  openURLExternally,
  toFsEntry,
} from '-/services/utils-io';
import {
  actions as SettingsActions,
  getNewHTMLFileContent,
  getSupportedFileTypes,
  getTagDelimiter,
} from '-/reducers/settings';
import { getLocations } from '-/reducers/locations';
import { clearURLParam, getURLParameter, updateHistory } from '-/utils/dom';
import {
  cleanRootPath,
  cleanTrailingDirSeparator,
  extractContainingDirectoryPath,
  extractTagsAsObjects,
  generateSharingLink,
  getMetaFileLocationForDir,
  getMetaFileLocationForFile,
  normalizePath,
} from '@tagspaces/tagspaces-common/paths';
import {
  formatDateTime4Tag,
  locationType,
} from '@tagspaces/tagspaces-common/misc';
import { useTranslation } from 'react-i18next';
import versionMeta from '-/version.json';
import AppConfig from '-/AppConfig';
import useFirstRender from '-/utils/useFirstRender';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { useLocationIndexContext } from '-/hooks/useLocationIndexContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { usePlatformFacadeContext } from '-/hooks/usePlatformFacadeContext';

type OpenedEntryContextData = {
  openedEntries: OpenedEntry[];
  currentEntry: OpenedEntry;
  dirProps: TS.DirProp;
  isEntryInFullWidth: boolean;
  sharingLink: string;
  sharingParentFolderLink: string;
  setEntryInFullWidth: (fullWidth: boolean) => void;
  addToEntryContainer: (fsEntry: OpenedEntry) => void;
  closeAllFiles: () => void;
  reflectUpdateOpenedFileContent: (entryPath: string) => void;
  reloadOpenedFile: () => void;
  updateOpenedFile: (
    entryPath: string,
    fsEntryMeta: TS.FileSystemEntryMeta,
  ) => Promise<boolean>;
  openEntry: (path?: string, showDetails?) => void;
  openFsEntry: (fsEntry?: TS.FileSystemEntry, showDetails?) => void;
  toggleEntryFullWidth: () => void;
  openLink: (url: string, options?) => void;
  goForward: () => void;
  goBack: () => void;
  createFileAdvanced: (
    targetPath: string,
    fileName: string,
    content: string,
    fileType: 'md' | 'txt' | 'html',
  ) => void;
  createFile: () => void;
  reflectRenameOpenedEntry: (
    entryPath: string,
    newEntryPath: string,
    reload?: boolean,
  ) => void;
  reflectDeleteDirectory: (directoryPath: string) => void;
  reflectDeleteFile: (filePath: string) => void;
};

export const OpenedEntryContext = createContext<OpenedEntryContextData>({
  openedEntries: [],
  currentEntry: undefined,
  dirProps: undefined,
  isEntryInFullWidth: false,
  sharingLink: undefined,
  sharingParentFolderLink: undefined,
  setEntryInFullWidth: () => {},
  addToEntryContainer: () => {},
  closeAllFiles: () => {},
  reflectUpdateOpenedFileContent: () => {},
  reloadOpenedFile: () => {},
  updateOpenedFile: () => Promise.resolve(false),
  openEntry: () => {},
  openFsEntry: () => {},
  toggleEntryFullWidth: () => {},
  openLink: () => {},
  goForward: () => {},
  goBack: () => {},
  createFile: () => {},
  createFileAdvanced: () => {},
  reflectRenameOpenedEntry: () => {},
  reflectDeleteDirectory: undefined,
  reflectDeleteFile: undefined,
});

export type OpenedEntryContextProviderProps = {
  children: React.ReactNode;
};

export const OpenedEntryContextProvider = ({
  children,
}: OpenedEntryContextProviderProps) => {
  const dispatch: AppDispatch = useDispatch();
  const { t } = useTranslation();

  const { openLocation, currentLocation, getLocationPath } =
    useCurrentLocationContext();
  const {
    currentDirectoryPath,
    currentDirectoryPerspective,
    currentLocationPath,
    openDirectory,
    addDirectoryEntries,
  } = useDirectoryContentContext();

  const { selectedEntries, setSelectedEntries } = useSelectedEntriesContext();
  const { showNotification } = useNotificationContext();
  const { reflectCreateEntry } = useLocationIndexContext();
  const { saveFilePromise } = usePlatformFacadeContext();

  const supportedFileTypes = useSelector(getSupportedFileTypes);
  const locations: TS.Location[] = useSelector(getLocations);
  const historyKeys = Pro && Pro.history ? Pro.history.historyKeys : {};
  const fileOpenHistory = useSelector(
    (state: any) => state.settings[historyKeys.fileOpenKey],
  );
  const folderOpenHistory = useSelector(
    (state: any) => state.settings[historyKeys.folderOpenKey],
  );
  const newHTMLFileContent = useSelector(getNewHTMLFileContent);
  //const initOpenLink = useSelector(getOpenLink);
  const editedEntryPaths = useSelector(getEditedEntryPaths);
  const tagDelimiter = useSelector(getTagDelimiter);
  /*  const checkForUpdates = useSelector(getCheckForUpdateOnStartup);
  const firstRun = useSelector(isFirstRun);
  const enableGlobalKeyboardShortcuts = useSelector(isGlobalKeyBindingEnabled);*/
  const [openedEntries, setOpenedEntries] = useState<OpenedEntry[]>([]);
  const currentEntry = useRef<OpenedEntry>(openedEntries[0]); //enhanceOpenedEntry(openedEntries[0], tagDelimiter));
  const dirProps = useRef<TS.DirProp>();
  const isEntryInFullWidth = useRef<boolean>(false);
  const sharingLink = useRef<string>(undefined);
  const sharingParentFolderLink = useRef<string>(undefined);
  //const havePrevOpenedFile = React.useRef<boolean>(false);
  const firstRender = useFirstRender();
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  /**
   * Handle openLink from initApp
   */
  useEffect(() => {
    if (firstRender && openedEntries.length === 0) {
      const lid = getURLParameter('tslid');
      const dPath = getURLParameter('tsdpath');
      const ePath = getURLParameter('tsepath');
      const cmdOpen = getURLParameter('cmdopen');
      if (lid || dPath || ePath) {
        // openDefaultLocation = false;
        setTimeout(() => {
          openLink(window.location.href);
        }, 1000);
      } else if (cmdOpen) {
        // openDefaultLocation = false;
        setTimeout(() => {
          openLink(
            // window.location.href.split('?')[0] +
            'ts://?cmdopen=' + cmdOpen,
            { fullWidth: true },
          );
        }, 1000);
      }
    } else if (
      currentEntry.current &&
      !currentEntry.current.isFile &&
      !PlatformIO.haveObjectStoreSupport() &&
      !PlatformIO.haveWebDavSupport()
    ) {
      PlatformIO.getDirProperties(currentEntry.current.path)
        .then((dProps: TS.DirProp) => {
          dirProps.current = dProps;
          currentEntry.current.size = dProps.totalSize;
          forceUpdate();
        })
        .catch((ex) => console.debug('getDirProperties:', ex.message));
    }
    /*if (initOpenLink && initOpenLink.url) {
      openLink(initOpenLink.url, initOpenLink.options);
    }*/
  }, []);

  useEffect(() => {
    currentEntry.current = openedEntries[0];
    if (currentEntry.current) {
      forceUpdate();
    }
    /*if (
      !firstRender &&
      havePrevOpenedFile.current
      // && selectedEntries.length < 2
    ) {
      if (openedEntries.length > 0) {
        const openedFile = openedEntries[0];
        if (openedFile.path === currentDirectoryPath) {
          if (openedFile.color) {
            setCurrentDirectoryColor(openedFile.color);
          } else if (openedFile.color === undefined) {
            setCurrentDirectoryColor(undefined);
          }
          if (openedFile.perspective) {
            setCurrentDirectoryPerspective(openedFile.perspective);
          }
        } else {
          // update openedFile meta in grid perspective list (like description)
          const currentEntry: OpenedEntry = enhanceOpenedEntry(
            openedFile,
            AppConfig.tagDelimiter
          );
          updateCurrentDirEntry(openedFile.path, openedToFsEntry(currentEntry));
        }
      }
    }
    havePrevOpenedFile.current = openedEntries.length > 0;*/
  }, [openedEntries]);

  useEffect(() => {
    if (
      currentEntry.current &&
      currentEntry.current.path === currentDirectoryPath
    ) {
      currentEntry.current = {
        ...currentEntry.current,
        perspective: currentDirectoryPerspective,
      };
      setOpenedEntries([currentEntry.current]);
      // forceUpdate();
    }
  }, [currentDirectoryPerspective]);

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

        if (openedEntries.some((entry) => entry.path === oldFilePath)) {
          const extractedTags = extractTagsAsObjects(
            newFilePath,
            AppConfig.tagDelimiter,
            PlatformIO.getDirSeparator(),
          );

          const newEntries = openedEntries.map((entry) => {
            if (entry.path !== oldFilePath) {
              return entry;
            }
            const fileNameTags = entry.isFile ? extractedTags : []; // dirs dont have tags in filename
            // const { url, ...rest } = entry;
            const sidecarTags =
              entry.tags && entry.tags.length > 0
                ? entry.tags.filter((tag) => tag.type !== 'plain')
                : [];
            return {
              ...entry,
              path: newFilePath, // TODO handle change extension case
              tags: [
                ...sidecarTags, // add only sidecar tags
                ...fileNameTags,
              ],
              // shouldReload: true
            };
          });
          setSharedLinks(newEntries[0]);
          setOpenedEntries(newEntries);
        }
      } /*else if (action === 'delete') {
        const filePath = editedEntryPaths[0].path;
        if (
          openedEntries &&
          openedEntries.length > 0 &&
          openedEntries.some(file => file.path === filePath)
        ) {
          closeAllFiles();
        }
      }*/
    }
  }, [editedEntryPaths]);

  function setSharedLinks(openedFile?) {
    if (openedFile) {
      if (window.location.href.indexOf('?') > 0) {
        const sharingURL = new URL(window.location.href);
        const params = new URLSearchParams(sharingURL.search);
        if (params.has('tslid')) {
          const locationId = params.get('tslid');
          //if (params.has('tsdpath')) {
          // const folderPath2 = params.get('tsdpath');
          const folderLocation = locations.find(
            (location) => location.uuid === locationId,
          );
          const folderPath = extractContainingDirectoryPath(openedFile.path);
          if (
            folderPath.indexOf(
              cleanTrailingDirSeparator(folderLocation.path),
            ) === 0
          ) {
            sharingParentFolderLink.current = generateSharingLink(
              locationId,
              undefined,
              cleanRootPath(
                folderPath,
                folderLocation.path,
                PlatformIO.getDirSeparator(),
              ),
            );
          }

          //}
          if (params.has('tsepath')) {
            const entryPath = params.get('tsepath');
            if (openedFile.isFile) {
              const dirPath = params.has('tsdpath')
                ? params.get('tsdpath')
                : undefined;
              sharingLink.current = generateSharingLink(
                locationId,
                entryPath,
                dirPath,
              );
            } else {
              sharingLink.current = generateSharingLink(
                locationId,
                undefined,
                entryPath,
              );
            }
          } else if (params.has('tsdpath')) {
            sharingLink.current = generateSharingLink(
              locationId,
              undefined,
              params.get('tsdpath'),
            );
          } else {
            sharingLink.current = generateSharingLink(locationId);
          }
        }
      }
    } else {
      sharingLink.current = undefined;
      sharingParentFolderLink.current = undefined;
    }
  }
  /*function initApp() {
    disableBackGestureMac();
    // migrate TagLibrary from redux state

    dispatch(SettingsActions.setZoomRestoreApp());
    dispatch(SettingsActions.upgradeSettings()); // TODO call this only on app version update
    if (checkForUpdates) {
      dispatch(SettingsActions.checkForUpdate());
    }
    if (firstRun) {
      dispatch(AppActions.toggleOnboardingDialog());
      dispatch(AppActions.toggleLicenseDialog());
    }
    setTimeout(() => {
      PlatformIO.setGlobalShortcuts(enableGlobalKeyboardShortcuts);
      PlatformIO.loadExtensions();
    }, 1000);
    const langURLParam = getURLParameter('locale');
    if (
      langURLParam &&
      langURLParam.length > 1 &&
      /^[a-zA-Z\-_]+$/.test('langURLParam')
    ) {
      i18n.changeLanguage(langURLParam).then(() => {
        dispatch(SettingsActions.setLanguage(langURLParam));
        PlatformIO.setLanguage(langURLParam);
        return true;
      });
    }

    let openDefaultLocation = true;
    const lid = getURLParameter('tslid');
    const dPath = getURLParameter('tsdpath');
    const ePath = getURLParameter('tsepath');
    const cmdOpen = getURLParameter('cmdopen');
    if (lid || dPath || ePath) {
      openDefaultLocation = false;
      setTimeout(() => {
        openLink(window.location.href);
      }, 1000);
    } else if (cmdOpen) {
      openDefaultLocation = false;
      setTimeout(() => {
        openLink(
            // window.location.href.split('?')[0] +
            'ts://?cmdopen=' + cmdOpen,
            { fullWidth: true }
          );
      }, 1000);
    }
    const defaultLocationId = getDefaultLocationId(state);
    if (
      openDefaultLocation &&
      defaultLocationId &&
      defaultLocationId.length > 0
    ) {
      dispatch(actions.openLocationById(defaultLocationId));
    }
  }*/

  function addToEntryContainer(fsEntry: OpenedEntry) {
    setSharedLinks(fsEntry);
    setOpenedEntries([fsEntry]); // [...openedEntries, fsEntry] // TODO uncomment for multiple file support
  }

  function closeOpenedEntries() {
    setSharedLinks();
    setOpenedEntries([]);
  }

  function closeAllFiles() {
    const appName = versionMeta.name;
    document.title = appName;
    if (currentLocation) {
      document.title = currentLocation.name + ' | ' + appName;
    }
    clearURLParam('tsepath');
    closeOpenedEntries(); // [...openedEntries, fsEntry] // TODO uncomment for multiple file support
    if (isEntryInFullWidth.current) {
      isEntryInFullWidth.current = false;
      forceUpdate();
    }
  }

  function reflectUpdateOpenedFileContent(entryPath: string) {
    if (openedEntries && openedEntries.length > 0) {
      const openedFile: OpenedEntry = openedEntries.find(
        (obj) => obj.path === entryPath,
      );
      if (openedFile) {
        openedFile.shouldReload = true;
        addToEntryContainer(openedFile);
      }
    }
  }

  function reloadOpenedFile(): Promise<boolean> {
    if (openedEntries && openedEntries.length > 0) {
      const openedFile = openedEntries[0];
      const metaFilePath = openedFile.isFile
        ? getMetaFileLocationForFile(
            openedFile.path,
            PlatformIO.getDirSeparator(),
          )
        : getMetaFileLocationForDir(
            openedFile.path,
            PlatformIO.getDirSeparator(),
          );
      try {
        return loadJSONFile(metaFilePath)
          .then((fsEntryMeta) => {
            return updateOpenedFile(openedFile.path, {
              ...fsEntryMeta,
              editMode: false,
              shouldReload: !openedFile.shouldReload,
            });
          })
          .catch(() => {
            // @ts-ignore
            const entryMeta: TS.FileSystemEntryMeta = {
              ...openedFile,
              editMode: false,
              shouldReload: !openedFile.shouldReload,
            };
            return updateOpenedFile(openedFile.path, entryMeta);
          });
      } catch (e) {
        // @ts-ignore
        const entryMeta: TS.FileSystemEntryMeta = {
          ...openedFile,
          editMode: false,
          shouldReload: !openedFile.shouldReload,
        };
        return updateOpenedFile(openedFile.path, entryMeta);
      }
    }
    return Promise.resolve(false);
  }

  function updateOpenedFile(
    entryPath: string,
    fsEntryMeta: TS.FileSystemEntryMeta,
  ): Promise<boolean> {
    if (
      openedEntries &&
      openedEntries.length > 0 &&
      openedEntries.some((obj) => obj.path === entryPath)
    ) {
      return PlatformIO.getPropertiesPromise(entryPath)
        .then((entryProps) => {
          if (entryProps) {
            let entryForOpening: OpenedEntry;
            const entryExist = openedEntries.find(
              (obj) => obj.path === entryPath,
            );

            if (!entryExist) {
              entryForOpening = findExtensionsForEntry(
                fsEntryMeta.id, //|| fsEntryMeta.uuid,
                supportedFileTypes,
                entryPath,
                entryProps.isFile,
              );
            } else {
              entryForOpening = { ...entryExist };
            }

            /* if (fsEntryMeta.changed !== undefined) {
              entryForOpening.changed = fsEntryMeta.changed;
            } */
            if (fsEntryMeta.editMode !== undefined) {
              entryForOpening.editMode = fsEntryMeta.editMode;
            }
            entryForOpening.shouldReload = fsEntryMeta.shouldReload;
            if (fsEntryMeta.color) {
              if (fsEntryMeta.color === 'transparent') {
                entryForOpening.color = undefined;
              } else {
                entryForOpening.color = fsEntryMeta.color;
              }
            }
            if (fsEntryMeta.description !== undefined) {
              entryForOpening.description = fsEntryMeta.description;
            }
            if (fsEntryMeta.perspective) {
              entryForOpening.perspective = fsEntryMeta.perspective;
            } else {
              entryForOpening.perspective = 'unspecified';
            }
            if (fsEntryMeta.tags) {
              entryForOpening.tags = fsEntryMeta.tags;
            }
            if (fsEntryMeta.autoSave !== undefined) {
              entryForOpening.isAutoSaveEnabled = fsEntryMeta.autoSave;
            }
            entryForOpening.lmdt = entryProps.lmdt;
            entryForOpening.size = entryProps.size;
            addToEntryContainer(entryForOpening);
          }
          return true;
        })
        .catch((err) => {
          console.log('updateOpenedFile ' + entryPath + ' not exist ' + err);
          return Promise.resolve(false);
        });
    }
    return Promise.resolve(false);
  }

  function openEntry(path?: string, showDetails = false) {
    if (path === undefined) {
      return openFsEntry(undefined, showDetails);
    }
    return getAllPropertiesPromise(path)
      .then((fsEntry: TS.FileSystemEntry) => openFsEntry(fsEntry, showDetails))
      .catch((error) =>
        console.warn(
          'Error getting properties for entry: ' + path + ' - ' + error,
        ),
      );
  }

  function openFsEntry(fsEntry?: TS.FileSystemEntry, showDetails = false) {
    dispatch(SettingsActions.setShowDetails(showDetails));
    if (fsEntry === undefined) {
      if (selectedEntries && selectedEntries.length > 0) {
        const lastSelectedEntry = selectedEntries[selectedEntries.length - 1];
        if (!lastSelectedEntry.isFile) {
          return openDirectory(lastSelectedEntry.path); //, false);
        }
      } else {
        return;
      }
    }
    let entryForOpening: OpenedEntry;

    /**
     * check for editMode in order to show save changes dialog (shouldReload: false)
     */
    if (openedEntries.length > 0) {
      const openFile = openedEntries[0];
      if (openFile.editMode) {
        entryForOpening = {
          ...openFile,
          shouldReload:
            openFile.shouldReload !== undefined
              ? !openFile.shouldReload
              : undefined,
        }; // false };
        addToEntryContainer(entryForOpening);
        showNotification(
          `You can't open another file, because '${openFile.path}' is opened for editing`,
          'default',
          true,
        );
        return false;
      }
    }
    // TODO decide to copy all props from {...fsEntry} into openedEntry
    entryForOpening = findExtensionsForEntry(
      fsEntry.uuid,
      supportedFileTypes,
      fsEntry.path,
      fsEntry.isFile,
    );
    if (PlatformIO.haveObjectStoreSupport() || PlatformIO.haveWebDavSupport()) {
      const cleanedPath = fsEntry.path.startsWith('/')
        ? fsEntry.path.substr(1)
        : fsEntry.path;
      entryForOpening.url = PlatformIO.getURLforPath(cleanedPath);
    } else if (fsEntry.url) {
      entryForOpening.url = fsEntry.url;
    }
    if (fsEntry.perspective) {
      entryForOpening.perspective = fsEntry.perspective;
    }
    if (fsEntry.color) {
      entryForOpening.color = fsEntry.color;
    }
    if (fsEntry.description) {
      entryForOpening.description = fsEntry.description;
    }
    if (fsEntry.tags) {
      entryForOpening.tags = fsEntry.tags;
    }
    if (fsEntry.lmdt) {
      entryForOpening.lmdt = fsEntry.lmdt;
    }
    if (fsEntry.size) {
      entryForOpening.size = fsEntry.size;
    }
    if (fsEntry.isNewFile) {
      entryForOpening.editMode = true;
    }
    if (fsEntry.isAutoSaveEnabled !== undefined) {
      entryForOpening.isAutoSaveEnabled = fsEntry.isAutoSaveEnabled;
    } else if (fsEntry.meta && fsEntry.meta.autoSave) {
      entryForOpening.isAutoSaveEnabled = fsEntry.meta.autoSave;
    }

    document.title = fsEntry.name + ' | ' + 'TagSpaces'; // TODO get it later from app config

    if (currentLocation) {
      entryForOpening.locationId = currentLocation.uuid;
      updateHistory(
        { ...currentLocation, path: currentLocationPath },
        currentDirectoryPath,
        fsEntry.path,
      );
    }

    addToEntryContainer(entryForOpening);

    // save in history
    if (currentLocation) {
      if (Pro) {
        const relEntryPath = getRelativeEntryPath(
          currentLocationPath,
          fsEntry.path,
        );
        const historyKeys = Pro.history.historyKeys;
        if (fsEntry.isFile) {
          Pro.history.saveHistory(
            historyKeys.fileOpenKey,
            {
              path: fsEntry.path,
              url: generateSharingLink(currentLocation.uuid, relEntryPath),
              lid: currentLocation.uuid,
            },
            fileOpenHistory,
          );
        } else {
          Pro.history.saveHistory(
            historyKeys.folderOpenKey,
            {
              path: fsEntry.path,
              url: generateSharingLink(
                currentLocation.uuid,
                relEntryPath,
                relEntryPath,
              ),
              lid: currentLocation.uuid,
            },
            folderOpenHistory,
          );
        }
      }
    }
  }

  function toggleEntryFullWidth() {
    isEntryInFullWidth.current = !isEntryInFullWidth.current;
    forceUpdate();
  }

  function setEntryInFullWidth(fullWidth) {
    isEntryInFullWidth.current = fullWidth;
    forceUpdate();
  }

  function goForward() {
    window.history.forward();
    window.addEventListener(
      'popstate',
      () => {
        openLink(window.location.href, { fullWidth: false });
      },
      { once: true },
    );
  }

  function goBack() {
    // console.log(
    //   '>>> current href: ' + decodeURIComponent(window.location.href)
    // );
    window.history.back(); // window.history.go(-1);
    window.addEventListener(
      'popstate',
      () => {
        openLink(window.location.href, { fullWidth: false });
        // console.log(
        //   '>>> last href: ' + decodeURIComponent(window.location.href)
        // );
      },
      { once: true },
    );
  }

  function openLink(url: string, options = { fullWidth: true }) {
    try {
      const decodedURI = decodeURI(url);
      const lid = getURLParameter('tslid', url);
      const dPath = getURLParameter('tsdpath', url);
      const ePath = getURLParameter('tsepath', url);
      const cmdOpen = getURLParameter('cmdopen', url);
      if (cmdOpen && cmdOpen.length > 0) {
        const entryPath = decodeURIComponent(cmdOpen);
        getAllPropertiesPromise(entryPath)
          .then((fsEntry: TS.FileSystemEntry) => {
            if (fsEntry.isFile) {
              openFsEntry(fsEntry);
              setEntryInFullWidth(options.fullWidth);
            } else {
              openDirectory(fsEntry.path);
            }
            return true;
          })
          .catch((err) => {
            // console.log('Error opening from cmd ' + JSON.stringify(err));
            showNotification(t('Missing file or folder'), 'warning', true);
          });
      } else if (lid && lid.length > 0) {
        const locationId = decodeURIComponent(lid);
        let directoryPath = dPath && decodeURIComponent(dPath);
        const entryPath = ePath && decodeURIComponent(ePath);
        // fix for created bookmarks files without to have tsdpath in url
        if (!directoryPath && entryPath) {
          directoryPath = extractContainingDirectoryPath(entryPath);
        }
        // Check for relative paths
        const targetLocation: TS.Location = locations.find(
          (location) => location.uuid === locationId,
        );
        if (targetLocation) {
          let openLocationTimer = 1000;
          const isCloudLocation =
            targetLocation.type === locationType.TYPE_CLOUD;
          if (
            !currentLocation ||
            targetLocation.uuid !== currentLocation.uuid
          ) {
            openLocation(targetLocation, true);
          } else {
            openLocationTimer = 0;
          }
          getLocationPath(targetLocation).then((path) => {
            const locationPath: string = cleanTrailingDirSeparator(path);

            // setTimeout is needed for case of a location switch, if no location swith the timer is 0
            setTimeout(() => {
              if (isCloudLocation) {
                // PlatformIO.enableObjectStoreSupport(targetLocation).then(() => {
                if (directoryPath && directoryPath.length > 0) {
                  const newRelDir = getRelativeEntryPath(path, directoryPath);
                  const dirFullPath =
                    locationPath.length > 0
                      ? locationPath + '/' + newRelDir
                      : directoryPath;
                  openDirectory(dirFullPath);
                } else {
                  openDirectory(locationPath);
                }

                if (entryPath) {
                  getAllPropertiesPromise(
                    (locationPath.length > 0 ? locationPath + '/' : '') +
                      entryPath,
                  )
                    .then((fsEntry: TS.FileSystemEntry) => {
                      if (fsEntry) {
                        openFsEntry(fsEntry);
                        if (options.fullWidth) {
                          setEntryInFullWidth(true);
                        }
                      }
                      return true;
                    })
                    .catch(() =>
                      showNotification(t('core:invalidLink'), 'warning', true),
                    );
                }
                // });
              } else {
                // local files case
                if (directoryPath && directoryPath.length > 0) {
                  if (
                    directoryPath.includes('../') ||
                    directoryPath.includes('..\\')
                  ) {
                    showNotification(t('core:invalidLink'), 'warning', true);
                    return true;
                  }
                  const dirFullPath =
                    locationPath + PlatformIO.getDirSeparator() + directoryPath;
                  openDirectory(dirFullPath);
                } else {
                  openDirectory(locationPath);
                }

                if (entryPath && entryPath.length > 0) {
                  if (entryPath.includes('../') || entryPath.includes('..\\')) {
                    showNotification(t('core:invalidLink'), 'warning', true);
                    return true;
                  }
                  const entryFullPath =
                    locationPath + PlatformIO.getDirSeparator() + entryPath;
                  getAllPropertiesPromise(entryFullPath)
                    .then((fsEntry: TS.FileSystemEntry) => {
                      if (fsEntry) {
                        openFsEntry(fsEntry);
                        if (options.fullWidth) {
                          setEntryInFullWidth(true);
                        }
                      }
                      return true;
                    })
                    .catch(() =>
                      showNotification(t('core:invalidLink'), 'warning', true),
                    );
                }
              }
            }, openLocationTimer);
          });
        } else {
          showNotification(t('core:invalidLink'), 'warning', true);
        }
      } else if (decodedURI.endsWith(location.pathname)) {
        return true;
      } else if (
        // External URL case
        decodedURI.startsWith('http://') ||
        decodedURI.startsWith('https://') ||
        decodedURI.startsWith('file://')
      ) {
        openURLExternally(decodedURI);
      } else {
        console.log('Not supported URL format: ' + decodedURI);
      }
    } catch (e) {
      console.log('OpenLink:', e);
    }
  }

  function createFile() {
    if (currentDirectoryPath !== undefined) {
      const filePath =
        currentDirectoryPath +
        PlatformIO.getDirSeparator() +
        'textfile' +
        AppConfig.beginTagContainer +
        formatDateTime4Tag(new Date(), true) +
        AppConfig.endTagContainer +
        '.txt';
      saveFilePromise({ path: filePath }, '', true)
        .then(() => {
          reflectCreateEntry(toFsEntry(filePath, true));
          dispatch(AppActions.reflectCreateEntry(filePath, true));
          showNotification(t('core:fileCreateSuccessfully'), 'info', true);
          openEntry(filePath);
          return true;
        })
        .catch((err) => {
          console.warn('File creation failed with ' + err);
          showNotification(t('core:errorCreatingFile'), 'warning', true);
        });
    } else {
      showNotification(t('core:firstOpenaFolder'), 'warning', true);
    }
  }

  function createFileAdvanced(
    targetPath: string,
    fileName: string,
    content: string,
    fileType: 'md' | 'txt' | 'html',
  ) {
    const creationDate = new Date().toISOString();
    const fileNameAndExt = fileName + '.' + fileType;
    const creationMeta =
      'Created in ' +
      versionMeta.name +
      ' on ' +
      creationDate.substring(0, 10) +
      '.';
    const filePath =
      normalizePath(targetPath) + PlatformIO.getDirSeparator() + fileNameAndExt;
    let fileContent = content;
    if (fileType === 'html') {
      fileContent =
        newHTMLFileContent.split('<body></body>')[0] +
        '<body data-createdwith="' +
        versionMeta.name +
        '" data-createdon="' +
        creationDate +
        '" >' +
        content +
        '\n<br />\n' +
        creationMeta +
        '\n';
      '</body>' + newHTMLFileContent.split('<body></body>')[1];
    } else if (fileType === 'md') {
      fileContent = content + ' \n\n' + creationMeta + '\n';
    }
    saveFilePromise({ path: filePath }, fileContent, false)
      .then((fsEntry: TS.FileSystemEntry) => {
        addDirectoryEntries([fsEntry]);
        reflectCreateEntry(fsEntry); // toFsEntry(filePath, true);
        dispatch(AppActions.reflectCreateEntry(filePath, true));
        openFsEntry(fsEntry);
        setSelectedEntries([fsEntry]);
        showNotification(`File '${fileNameAndExt}' created.`, 'default', true);
        return true;
      })
      .catch((error) => {
        console.warn('Error creating file: ' + error);
        showNotification(
          `Error creating file '${fileNameAndExt}'`,
          'error',
          true,
        );
      });
  }

  function reflectRenameOpenedEntry(entryPath, newEntryPath, reload = false) {
    if (openedEntries && openedEntries.length > 0) {
      if (openedEntries[0].path === entryPath) {
        if (currentLocation) {
          updateHistory(
            { ...currentLocation, path: currentLocationPath },
            currentDirectoryPath,
            newEntryPath,
          );
        }
        if (reload) {
          openEntry(newEntryPath);
        } else {
          addToEntryContainer({ ...openedEntries[0], path: newEntryPath });
        }
      }
    }
  }

  const reflectDeleteDirectory = useMemo(() => {
    return (directoryPath: string) => {
      if (
        openedEntries &&
        openedEntries.length > 0 &&
        openedEntries.some(
          (file) => file.path.startsWith(directoryPath),
          /*extractContainingDirectoryPath(
              file.path,
              PlatformIO.getDirSeparator()
            ) === directoryPath */
        )
      ) {
        closeAllFiles();
      }
    };
  }, [openedEntries, isEntryInFullWidth.current]);

  const reflectDeleteFile = useMemo(() => {
    return (filePath: string) => {
      if (
        openedEntries &&
        openedEntries.length > 0 &&
        openedEntries.some((file) => file.path === filePath)
      ) {
        closeAllFiles();
      }
    };
  }, [openedEntries, isEntryInFullWidth.current]);

  const context = useMemo(() => {
    return {
      openedEntries,
      currentEntry: currentEntry.current,
      dirProps: dirProps.current,
      isEntryInFullWidth: isEntryInFullWidth.current,
      sharingLink: sharingLink.current,
      sharingParentFolderLink: sharingParentFolderLink.current,
      setEntryInFullWidth,
      addToEntryContainer,
      closeAllFiles,
      reflectUpdateOpenedFileContent,
      reloadOpenedFile,
      updateOpenedFile,
      openEntry,
      openFsEntry,
      toggleEntryFullWidth,
      goForward,
      goBack,
      openLink,
      createFile,
      createFileAdvanced,
      reflectRenameOpenedEntry,
      reflectDeleteDirectory,
      reflectDeleteFile,
    };
  }, [
    openedEntries,
    currentEntry.current,
    isEntryInFullWidth.current,
    dirProps.current,
    currentLocation,
    currentDirectoryPath,
    fileOpenHistory,
    folderOpenHistory,
  ]);

  return (
    <OpenedEntryContext.Provider value={context}>
      {children}
    </OpenedEntryContext.Provider>
  );
};
