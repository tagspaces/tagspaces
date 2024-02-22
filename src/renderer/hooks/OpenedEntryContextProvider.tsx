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
import { AppDispatch, OpenedEntry } from '-/reducers/app';
import { Pro } from '-/pro';
import { TS } from '-/tagspaces.namespace';
import PlatformIO from '-/services/platform-facade';
import {
  findExtensionsForEntry,
  getAllPropertiesPromise,
  getRelativeEntryPath,
  loadJSONFile,
  openURLExternally,
} from '-/services/utils-io';
import {
  actions as SettingsActions,
  getNewHTMLFileContent,
  getSupportedFileTypes,
} from '-/reducers/settings';
import { getLocations } from '-/reducers/locations';
import { clearURLParam, getURLParameter, updateHistory } from '-/utils/dom';
import {
  cleanRootPath,
  cleanTrailingDirSeparator,
  extractContainingDirectoryPath,
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
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { usePlatformFacadeContext } from '-/hooks/usePlatformFacadeContext';
import { useEditedEntryContext } from '-/hooks/useEditedEntryContext';

type OpenedEntryContextData = {
  openedEntry: OpenedEntry;
  isEntryInFullWidth: boolean;
  sharingLink: string;
  sharingParentFolderLink: string;
  setEntryInFullWidth: (fullWidth: boolean) => void;
  addToEntryContainer: (fsEntry: OpenedEntry) => void;
  closeAllFiles: () => void;
  reflectUpdateOpenedFileContent: (entry: TS.FileSystemEntry) => void;
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
  getOpenedDirProps: () => Promise<TS.DirProp>;
};

export const OpenedEntryContext = createContext<OpenedEntryContextData>({
  openedEntry: undefined,
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
  getOpenedDirProps: undefined,
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
  } = useDirectoryContentContext();

  const { selectedEntries } = useSelectedEntriesContext();
  const { showNotification } = useNotificationContext();
  const { actions } = useEditedEntryContext();
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
  const currentEntry = useRef<OpenedEntry>(undefined);
  /* const dirProps = useRef<TS.DirProp>({
    totalSize: undefined,
    filesCount: undefined,
    dirsCount: undefined,
  });*/
  const isEntryInFullWidth = useRef<boolean>(false);
  const sharingLink = useRef<string>(undefined);
  const sharingParentFolderLink = useRef<string>(undefined);
  const firstRender = useFirstRender();
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  /**
   * Handle openLink from initApp
   */
  useEffect(() => {
    if (firstRender && currentEntry.current === undefined) {
      const lid = getURLParameter('tslid');
      const dPath = getURLParameter('tsdpath');
      const ePath = getURLParameter('tsepath');
      const cmdOpen = getURLParameter('cmdopen');
      if (lid || dPath || ePath) {
        setTimeout(() => {
          openLink(window.location.href);
        }, 1000);
      } else if (cmdOpen) {
        setTimeout(() => {
          openLink('ts://?cmdopen=' + cmdOpen, { fullWidth: true });
        }, 1000);
      }
    }
  }, []);

  useEffect(() => {
    if (actions && actions.length > 0) {
      for (const action of actions) {
        if (action.action === 'add') {
          if (action.open && action.entry.isFile && action.entry.isNewFile) {
            openFsEntry(action.entry, true);
          }
        } else if (action.action === 'delete') {
          if (
            currentEntry.current &&
            currentEntry.current.path.startsWith(action.entry.path)
          ) {
            closeAllFiles();
          }
        } else if (action.action === 'update' || action.action === 'move') {
          if (
            currentEntry.current &&
            action.oldEntryPath &&
            currentEntry.current.path === action.oldEntryPath
          ) {
            openFsEntry(action.entry);
          }
        }
      }
    }
  }, [actions]);

  useEffect(() => {
    if (
      currentEntry.current &&
      currentEntry.current.path === currentDirectoryPath
    ) {
      currentEntry.current = {
        ...currentEntry.current,
        perspective: currentDirectoryPerspective,
      };
      forceUpdate();
    }
  }, [currentDirectoryPerspective]);

  function getOpenedDirProps(): Promise<TS.DirProp> {
    if (
      currentEntry.current &&
      !currentEntry.current.isFile &&
      !PlatformIO.haveObjectStoreSupport() &&
      !PlatformIO.haveWebDavSupport()
    ) {
      return PlatformIO.getDirProperties(currentEntry.current.path).catch(
        (ex) => {
          console.debug('getDirProperties:', ex.message);
          return Promise.resolve(undefined);
        },
      );
    }
    return Promise.resolve(undefined);
  }

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

  function addToEntryContainer(fsEntry: OpenedEntry) {
    setSharedLinks(fsEntry);
    currentEntry.current = fsEntry;
    forceUpdate();
    // setOpenedEntries([fsEntry]); // [...openedEntries, fsEntry] // TODO uncomment for multiple file support
  }

  function closeOpenedEntries() {
    setSharedLinks();
    currentEntry.current = undefined;
    forceUpdate();
    // setOpenedEntries([]);
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

  /**
   * update openedEntry lmdt after save file
   * @param entry
   */
  function reflectUpdateOpenedFileContent(entry: TS.FileSystemEntry) {
    if (currentEntry.current) {
      if (currentEntry.current.path === entry.path) {
        currentEntry.current.lmdt = entry.lmdt;
        forceUpdate();
      }
    }
  }

  function reloadOpenedFile(): Promise<boolean> {
    if (currentEntry.current) {
      //openedEntries && openedEntries.length > 0) {
      const openedFile = currentEntry.current; //openedEntries[0];
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
        return loadJSONFile(metaFilePath).then((fsEntryMeta) => {
          if (fsEntryMeta) {
            return updateOpenedFile(openedFile.path, {
              ...fsEntryMeta,
              editMode: false,
              shouldReload: !openedFile.shouldReload,
            });
          }
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
    if (currentEntry.current && currentEntry.current.path === entryPath) {
      return PlatformIO.getPropertiesPromise(entryPath)
        .then((entryProps) => {
          if (entryProps) {
            let entryForOpening: OpenedEntry;

            entryForOpening = { ...currentEntry.current }; //entryExist };

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
    if (currentEntry.current) {
      //openedEntries.length > 0) {
      const openFile = currentEntry.current; //openedEntries[0];
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
    if (
      fsEntry.isNewFile &&
      AppConfig.editableFiles.includes(fsEntry.extension)
    ) {
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
        .then((fsEntry: TS.FileSystemEntry) => {
          showNotification(t('core:fileCreateSuccessfully'), 'info', true);
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
    saveFilePromise({ path: filePath }, fileContent, false, true)
      .then((fsEntry: TS.FileSystemEntry) => {
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

  const context = useMemo(() => {
    return {
      openedEntry: currentEntry.current,
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
      getOpenedDirProps,
    };
  }, [
    currentEntry.current,
    isEntryInFullWidth.current,
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
