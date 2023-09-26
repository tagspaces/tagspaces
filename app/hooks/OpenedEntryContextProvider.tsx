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
import {
  actions as AppActions,
  AppDispatch,
  getDirectoryContent,
  getDirectoryPath,
  getEditedEntryPaths,
  getLastSelectedEntry,
  getOpenLink,
  isSearchMode,
  OpenedEntry
} from '-/reducers/app';
import { Pro } from '-/pro';
import { TS } from '-/tagspaces.namespace';
import PlatformIO from '-/services/platform-facade';
import {
  findExtensionsForEntry,
  getAllPropertiesPromise,
  getCleanLocationPath,
  getNextFile,
  getPrevFile,
  getRelativeEntryPath,
  loadJSONFile,
  openURLExternally
} from '-/services/utils-io';
import {
  actions as SettingsActions,
  getNewHTMLFileContent,
  getSupportedFileTypes
} from '-/reducers/settings';
import { getCurrentLocation, getLocations } from '-/reducers/locations';
import { clearURLParam, getURLParameter, updateHistory } from '-/utils/dom';
import {
  cleanRootPath,
  extractContainingDirectoryPath,
  extractTagsAsObjects,
  generateSharingLink,
  getMetaFileLocationForDir,
  getMetaFileLocationForFile,
  normalizePath
} from '@tagspaces/tagspaces-common/paths';
import GlobalSearch from '-/services/search-index';
import {
  formatDateTime4Tag,
  locationType
} from '@tagspaces/tagspaces-common/misc';
import { useTranslation } from 'react-i18next';
import versionMeta from '-/version.json';
import AppConfig from '-/AppConfig';
import useFirstRender from '-/utils/useFirstRender';

type OpenedEntryContextData = {
  openedEntries: OpenedEntry[];
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
    fsEntryMeta: TS.FileSystemEntryMeta
  ) => Promise<boolean>;
  openEntry: (path?: string, showDetails?) => void;
  openFsEntry: (fsEntry?: TS.FileSystemEntry, showDetails?) => void;
  openNextFile: (path?: string) => void;
  openPrevFile: (path?: string) => void;
  toggleEntryFullWidth: () => void;
  openLink: (url: string, options?) => void;
  createFileAdvanced: (
    targetPath: string,
    fileName: string,
    content: string,
    fileType: 'md' | 'txt' | 'html'
  ) => void;
  createFile: () => void;
  reflectRenameDirectory: (directoryPath: string, newDirPath: string) => void;
  reflectDeleteDirectory: (directoryPath: string) => void;
};

export const OpenedEntryContext = createContext<OpenedEntryContextData>({
  openedEntries: [],
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
  openNextFile: () => {},
  openPrevFile: () => {},
  toggleEntryFullWidth: () => {},
  openLink: () => {},
  createFile: () => {},
  createFileAdvanced: () => {},
  reflectRenameDirectory: () => {},
  reflectDeleteDirectory: () => {}
});

export type OpenedEntryContextProviderProps = {
  children: React.ReactNode;
};

export const OpenedEntryContextProvider = ({
  children
}: OpenedEntryContextProviderProps) => {
  const dispatch: AppDispatch = useDispatch();
  const { t } = useTranslation();
  const supportedFileTypes = useSelector(getSupportedFileTypes);
  const searchMode = useSelector(isSearchMode);
  const currentDirectoryEntries = useSelector(getDirectoryContent);
  const lastSelectedEntry: TS.FileSystemEntry = useSelector(
    getLastSelectedEntry
  );
  const locations: TS.Location[] = useSelector(getLocations);
  const currentLocation: TS.Location = useSelector(getCurrentLocation);
  const currentDirectoryPath = useSelector(getDirectoryPath);
  const historyKeys = Pro && Pro.history ? Pro.history.historyKeys : {};
  const fileOpenHistory = useSelector(
    (state: any) => state.settings[historyKeys.fileOpenKey]
  );
  const folderOpenHistory = useSelector(
    (state: any) => state.settings[historyKeys.folderOpenKey]
  );
  const newHTMLFileContent = useSelector(getNewHTMLFileContent);
  const initOpenLink = useSelector(getOpenLink);
  const editedEntryPaths = useSelector(getEditedEntryPaths);
  /*  const checkForUpdates = useSelector(getCheckForUpdateOnStartup);
  const firstRun = useSelector(isFirstRun);
  const enableGlobalKeyboardShortcuts = useSelector(isGlobalKeyBindingEnabled);*/
  const [openedEntries, setOpenedEntries] = useState([]);
  const [isEntryInFullWidth, setEntryInFullWidth] = useState(false);
  const sharingLink = useRef<string>(undefined);
  const sharingParentFolderLink = useRef<string>(undefined);
  const firstRender = useFirstRender();

  /**
   * Handle openLink from initApp
   */
  useEffect(() => {
    if (initOpenLink && initOpenLink.url) {
      openLink(initOpenLink.url, initOpenLink.options);
    }
  }, [initOpenLink]);

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

        if (openedEntries.some(entry => entry.path === oldFilePath)) {
          const extractedTags = extractTagsAsObjects(
            newFilePath,
            AppConfig.tagDelimiter,
            PlatformIO.getDirSeparator()
          );

          const newEntries = openedEntries.map(entry => {
            if (entry.path !== oldFilePath) {
              return entry;
            }
            const fileNameTags = entry.isFile ? extractedTags : []; // dirs dont have tags in filename
            // const { url, ...rest } = entry;
            const sidecarTags =
              entry.tags && entry.tags.length > 0
                ? entry.tags.filter(tag => tag.type !== 'plain')
                : [];
            return {
              ...entry,
              path: newFilePath, // TODO handle change extension case
              tags: [
                ...sidecarTags, // add only sidecar tags
                ...fileNameTags
              ]
              // shouldReload: true
            };
          });
          setSharedLinks(newEntries[0]);
          setOpenedEntries(newEntries);
        }
      } else if (action === 'delete') {
        const filePath = editedEntryPaths[0].path;
        if (
          openedEntries &&
          openedEntries.length > 0 &&
          openedEntries.some(file => file.path === filePath)
        ) {
          closeAllFiles();
        }
      }
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
            location => location.uuid === locationId
          );
          const folderPath = extractContainingDirectoryPath(openedFile.path);
          if (folderPath.indexOf(folderLocation.path) === 0) {
            sharingParentFolderLink.current = generateSharingLink(
              locationId,
              undefined,
              cleanRootPath(
                folderPath,
                folderLocation.path,
                PlatformIO.getDirSeparator()
              )
            );
          }

          //}
          if (params.has('tsepath')) {
            const entryPath = params.get('tsepath');
            if (openedFile.isFile) {
              sharingLink.current = generateSharingLink(locationId, entryPath);
            } else {
              sharingLink.current = generateSharingLink(
                locationId,
                undefined,
                entryPath
              );
            }
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
    document.title = 'TagSpaces'; // TODO move to AppConfig
    clearURLParam('tsepath');
    closeOpenedEntries(); // [...openedEntries, fsEntry] // TODO uncomment for multiple file support
    if (isEntryInFullWidth) {
      setEntryInFullWidth(false);
    }
  }

  function reflectUpdateOpenedFileContent(entryPath: string) {
    if (openedEntries && openedEntries.length > 0) {
      const openedFile: OpenedEntry = openedEntries.find(
        obj => obj.path === entryPath
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
            PlatformIO.getDirSeparator()
          )
        : getMetaFileLocationForDir(
            openedFile.path,
            PlatformIO.getDirSeparator()
          );
      try {
        return loadJSONFile(metaFilePath)
          .then(fsEntryMeta => {
            return updateOpenedFile(openedFile.path, {
              ...fsEntryMeta,
              editMode: false,
              shouldReload: !openedFile.shouldReload
            });
          })
          .catch(() =>
            updateOpenedFile(openedFile.path, {
              ...openedFile,
              editMode: false,
              shouldReload: !openedFile.shouldReload
            })
          );
      } catch (e) {
        return updateOpenedFile(openedFile.path, {
          ...openedFile,
          editMode: false,
          shouldReload: !openedFile.shouldReload
        });
      }
    }
    return Promise.resolve(false);
  }

  function updateOpenedFile(
    entryPath: string,
    fsEntryMeta: TS.FileSystemEntryMeta
  ): Promise<boolean> {
    if (
      openedEntries &&
      openedEntries.length > 0 &&
      openedEntries.some(obj => obj.path === entryPath)
    ) {
      return PlatformIO.getPropertiesPromise(entryPath)
        .then(entryProps => {
          if (entryProps) {
            let entryForOpening: OpenedEntry;
            const entryExist = openedEntries.find(
              obj => obj.path === entryPath
            );

            if (!entryExist) {
              entryForOpening = findExtensionsForEntry(
                fsEntryMeta.id, //|| fsEntryMeta.uuid,
                supportedFileTypes,
                entryPath,
                entryProps.isFile
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
        .catch(err => {
          console.error('updateOpenedFile ' + entryPath + ' not exist ' + err);
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
      .catch(error =>
        console.warn(
          'Error getting properties for entry: ' + path + ' - ' + error
        )
      );
  }

  function openFsEntry(fsEntry?: TS.FileSystemEntry, showDetails = false) {
    dispatch(SettingsActions.setShowDetails(showDetails));
    if (fsEntry === undefined) {
      if (lastSelectedEntry === undefined) {
        return;
      }
      if (!lastSelectedEntry.isFile) {
        dispatch(
          AppActions.loadDirectoryContent(lastSelectedEntry.path, false)
        );
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
              : undefined
        }; // false };
        addToEntryContainer(entryForOpening);
        dispatch(
          AppActions.showNotification(
            `You can't open another file, because '${openFile.path}' is opened for editing`,
            'default',
            true
          )
        );
        return false;
      }
    }
    // TODO decide to copy all props from {...fsEntry} into openedEntry
    entryForOpening = findExtensionsForEntry(
      fsEntry.uuid,
      supportedFileTypes,
      fsEntry.path,
      fsEntry.isFile
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
      updateHistory(currentLocation, currentDirectoryPath, fsEntry.path);
    }

    addToEntryContainer(entryForOpening);

    // save in history
    if (currentLocation) {
      if (Pro) {
        const relEntryPath = getRelativeEntryPath(
          currentLocation,
          fsEntry.path
        );
        const historyKeys = Pro.history.historyKeys;
        if (fsEntry.isFile) {
          Pro.history.saveHistory(
            historyKeys.fileOpenKey,
            {
              path: fsEntry.path,
              url: generateSharingLink(currentLocation.uuid, relEntryPath),
              lid: currentLocation.uuid
            },
            fileOpenHistory
          );
        } else {
          Pro.history.saveHistory(
            historyKeys.folderOpenKey,
            {
              path: fsEntry.path,
              url: generateSharingLink(
                currentLocation.uuid,
                relEntryPath,
                relEntryPath
              ),
              lid: currentLocation.uuid
            },
            folderOpenHistory
          );
        }
      }
    }
  }

  function openNextFile(path?: string) {
    const nextFile = getNextFile(
      path,
      lastSelectedEntry ? lastSelectedEntry.path : undefined,
      searchMode
        ? GlobalSearch.getInstance().getResults()
        : currentDirectoryEntries
    );
    if (nextFile !== undefined) {
      openFsEntry(nextFile);
      // dispatch(actions.setLastSelectedEntry(nextFile.path));
      dispatch(AppActions.setSelectedEntries([nextFile]));
      return nextFile;
    }
  }

  function openPrevFile(path?: string) {
    const prevFile = getPrevFile(
      path,
      lastSelectedEntry ? lastSelectedEntry.path : undefined,
      searchMode
        ? GlobalSearch.getInstance().getResults()
        : currentDirectoryEntries
    );
    if (prevFile !== undefined) {
      openFsEntry(prevFile);
      // dispatch(actions.setLastSelectedEntry(prevFile.path));
      dispatch(AppActions.setSelectedEntries([prevFile]));
    }
  }

  function toggleEntryFullWidth() {
    setEntryInFullWidth(!isEntryInFullWidth);
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
              dispatch(
                AppActions.loadDirectoryContent(fsEntry.path, false, true)
              );
            }
            return true;
          })
          .catch(err => {
            // console.log('Error opening from cmd ' + JSON.stringify(err));
            dispatch(
              AppActions.showNotification(
                t('Missing file or folder'),
                'warning',
                true
              )
            );
          });
      } else if (lid && lid.length > 0) {
        const locationId = decodeURIComponent(lid);
        const directoryPath = dPath && decodeURIComponent(dPath);
        const entryPath = ePath && decodeURIComponent(ePath);
        // Check for relative paths
        const targetLocation: TS.Location = locations.find(
          location => location.uuid === locationId
        );
        if (targetLocation) {
          let openLocationTimer = 1000;
          const isCloudLocation =
            targetLocation.type === locationType.TYPE_CLOUD;
          let skipListingLocation = directoryPath && directoryPath.length > 0;
          if (
            !currentLocation ||
            targetLocation.uuid !== currentLocation.uuid
          ) {
            dispatch(
              AppActions.openLocation(targetLocation, skipListingLocation)
            );
          } else {
            openLocationTimer = 0;
          }
          const locationPath = getCleanLocationPath(targetLocation);

          // setTimeout is needed for case of a location switch, if no location swith the timer is 0
          setTimeout(() => {
            if (isCloudLocation) {
              // PlatformIO.enableObjectStoreSupport(targetLocation).then(() => {
              if (directoryPath && directoryPath.length > 0) {
                const newRelDir = getRelativeEntryPath(
                  targetLocation,
                  directoryPath
                );
                const dirFullPath =
                  locationPath.length > 0
                    ? locationPath + '/' + newRelDir
                    : directoryPath;
                dispatch(
                  AppActions.loadDirectoryContent(dirFullPath, false, true)
                );
              } else {
                dispatch(
                  AppActions.loadDirectoryContent(locationPath, false, true)
                );
              }

              if (entryPath) {
                getAllPropertiesPromise(entryPath)
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
                    dispatch(
                      AppActions.showNotification(
                        t('core:invalidLink'),
                        'warning',
                        true
                      )
                    )
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
                  dispatch(
                    AppActions.showNotification(
                      t('core:invalidLink'),
                      'warning',
                      true
                    )
                  );
                  return true;
                }
                const dirFullPath =
                  locationPath + PlatformIO.getDirSeparator() + directoryPath;
                dispatch(
                  AppActions.loadDirectoryContent(dirFullPath, false, true)
                );
              } else {
                dispatch(
                  AppActions.loadDirectoryContent(locationPath, false, true)
                );
              }

              if (entryPath && entryPath.length > 0) {
                if (entryPath.includes('../') || entryPath.includes('..\\')) {
                  dispatch(
                    AppActions.showNotification(
                      t('core:invalidLink'),
                      'warning',
                      true
                    )
                  );
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
                    dispatch(
                      AppActions.showNotification(
                        t('core:invalidLink'),
                        'warning',
                        true
                      )
                    )
                  );
              }
            }
          }, openLocationTimer);
        } else {
          dispatch(
            AppActions.showNotification(t('core:invalidLink'), 'warning', true)
          );
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
      console.error('OpenLink:', e);
    }
  }

  function createFile() {
    if (currentDirectoryPath) {
      const filePath =
        currentDirectoryPath +
        PlatformIO.getDirSeparator() +
        'textfile' +
        AppConfig.beginTagContainer +
        formatDateTime4Tag(new Date(), true) +
        AppConfig.endTagContainer +
        '.txt';
      PlatformIO.saveFilePromise({ path: filePath }, '', true)
        .then(() => {
          dispatch(AppActions.reflectCreateEntry(filePath, true));
          dispatch(
            AppActions.showNotification(
              t('core:fileCreateSuccessfully'),
              'info',
              true
            )
          );
          openEntry(filePath);
          return true;
        })
        .catch(err => {
          console.warn('File creation failed with ' + err);
          dispatch(
            AppActions.showNotification(
              t('core:errorCreatingFile'),
              'warning',
              true
            )
          );
        });
    } else {
      dispatch(
        AppActions.showNotification(t('core:firstOpenaFolder'), 'warning', true)
      );
    }
  }

  function createFileAdvanced(
    targetPath: string,
    fileName: string,
    content: string,
    fileType: 'md' | 'txt' | 'html'
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
    PlatformIO.saveFilePromise({ path: filePath }, fileContent, false)
      .then((fsEntry: TS.FileSystemEntry) => {
        dispatch(AppActions.reflectCreateEntry(filePath, true));
        openFsEntry(fsEntry);

        // dispatch(actions.setSelectedEntries([fsEntry]));
        dispatch(
          AppActions.showNotification(
            `File '${fileNameAndExt}' created.`,
            'default',
            true
          )
        );
        return true;
      })
      .catch(error => {
        console.warn('Error creating file: ' + error);
        dispatch(
          AppActions.showNotification(
            `Error creating file '${fileNameAndExt}'`,
            'error',
            true
          )
        );
      });
  }

  function reflectRenameDirectory(directoryPath, newDirPath) {
    if (openedEntries && openedEntries.length > 0) {
      if (openedEntries[0].path === directoryPath) {
        const openedFile = openedEntries[0];
        openedFile.path = newDirPath;
        addToEntryContainer(openedFile);
      }
    }
  }

  function reflectDeleteDirectory(directoryPath) {
    if (
      openedEntries &&
      openedEntries.length > 0 &&
      openedEntries.some(
        file =>
          extractContainingDirectoryPath(
            file.path,
            PlatformIO.getDirSeparator()
          ) === directoryPath
      )
    ) {
      closeAllFiles();
    }
  }

  const context = useMemo(() => {
    return {
      openedEntries,
      isEntryInFullWidth,
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
      openNextFile,
      openPrevFile,
      toggleEntryFullWidth,
      openLink,
      createFile,
      createFileAdvanced,
      reflectRenameDirectory,
      reflectDeleteDirectory
    };
  }, [
    openedEntries,
    isEntryInFullWidth,
    currentLocation,
    currentDirectoryPath,
    fileOpenHistory,
    folderOpenHistory
  ]);

  return (
    <OpenedEntryContext.Provider value={context}>
      {children}
    </OpenedEntryContext.Provider>
  );
};
