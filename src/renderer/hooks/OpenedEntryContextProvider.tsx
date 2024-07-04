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
import { AppDispatch } from '-/reducers/app';
import { TS } from '-/tagspaces.namespace';
import {
  findExtensionPathForId,
  getDirProperties,
  getNextFile,
  getPrevFile,
  getRelativeEntryPath,
  openURLExternally,
} from '-/services/utils-io';
import {
  actions as SettingsActions,
  getNewHTMLFileContent,
  getSupportedFileTypes,
} from '-/reducers/settings';
import { clearURLParam, getURLParameter, updateHistory } from '-/utils/dom';
import {
  cleanRootPath,
  cleanTrailingDirSeparator,
  extractContainingDirectoryPath,
  generateSharingLink,
  joinPaths,
  normalizePath,
  extractFileExtension,
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
import { useEditedEntryMetaContext } from '-/hooks/useEditedEntryMetaContext';
import { CommonLocation } from '-/utils/CommonLocation';
import { useFilePropertiesContext } from '-/hooks/useFilePropertiesContext';

type OpenedEntryContextData = {
  openedEntry: TS.OpenedEntry;
  fileChanged: boolean;
  isEntryInFullWidth: boolean;
  sharingLink: string;
  sharingParentFolderLink: string;
  setEntryInFullWidth: (fullWidth: boolean) => void;
  setFileChanged: (isChanged: boolean) => void;
  addToEntryContainer: (fsEntry: TS.OpenedEntry) => void;
  closeAllFiles: () => void;
  reflectUpdateOpenedFileContent: (entry: TS.FileSystemEntry) => void;
  reloadOpenedFile: () => Promise<boolean>;
  /*updateOpenedFile: (
    entryPath: string,
    fsEntryMeta: TS.FileSystemEntryMeta,
  ) => Promise<boolean>;*/
  openEntry: (path?: string, showDetails?) => Promise<boolean>;
  openFsEntry: (fsEntry?: TS.FileSystemEntry, showDetails?) => Promise<boolean>;
  openEntryInternal: (
    fsEntry: TS.FileSystemEntry,
    showDetails?,
  ) => Promise<boolean>;
  openNextFile: (entries: TS.FileSystemEntry[]) => TS.FileSystemEntry;
  openPrevFile: (entries: TS.FileSystemEntry[]) => TS.FileSystemEntry;
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
  fileChanged: false,
  isEntryInFullWidth: false,
  sharingLink: undefined,
  sharingParentFolderLink: undefined,
  setEntryInFullWidth: undefined,
  setFileChanged: undefined,
  addToEntryContainer: () => {},
  closeAllFiles: () => {},
  reflectUpdateOpenedFileContent: () => {},
  reloadOpenedFile: undefined,
  //updateOpenedFile: () => Promise.resolve(false),
  openEntry: undefined,
  openFsEntry: undefined,
  openEntryInternal: undefined,
  openNextFile: undefined,
  openPrevFile: undefined,
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

  const { currentLocation, findLocation, openLocation, getLocationPath } =
    useCurrentLocationContext();
  const {
    currentDirectoryPath,
    currentLocationPath,
    openDirectory,
    getAllPropertiesPromise,
  } = useDirectoryContentContext();

  const { selectedEntries, setSelectedEntries } = useSelectedEntriesContext();
  const { showNotification } = useNotificationContext();
  const { actions } = useEditedEntryContext();
  const { metaActions } = useEditedEntryMetaContext();
  const { saveFilePromise } = usePlatformFacadeContext();
  const { setEditMode } = useFilePropertiesContext();

  const supportedFileTypes = useSelector(getSupportedFileTypes);
  //const locations: CommonLocation[] = useSelector(getLocations);
  const newHTMLFileContent = useSelector(getNewHTMLFileContent);
  const currentEntry = useRef<TS.OpenedEntry>(undefined);
  /* const dirProps = useRef<TS.DirProp>({
    totalSize: undefined,
    filesCount: undefined,
    dirsCount: undefined,
  });*/
  const fileChanged = useRef<boolean>(false);
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
    if (AppConfig.isElectron) {
      window.electronIO.ipcRenderer.on('cmd', (arg) => {
        if (arg === 'go-back') {
          goBack();
        } else if (arg === 'go-forward') {
          goForward();
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
    if (actions && actions.length > 0) {
      for (const action of actions) {
        if (action.action === 'add') {
          if (action.open && action.entry.isFile) {
            //&& action.entry.isNewFile) {
            openFsEntry(action.entry);
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
            openFsEntry({ ...action.entry, uuid: currentEntry.current.uuid });
          }
        }
      }
    }
  }, [actions]);

  useEffect(() => {
    if (metaActions && metaActions.length > 0) {
      let isChanged = false;
      for (const action of metaActions) {
        if (
          currentEntry.current &&
          currentEntry.current.path === action.entry.path
        ) {
          if (
            action.action === 'bgdColorChange' ||
            action.action === 'thumbChange' ||
            action.action === 'bgdImgChange' ||
            action.action === 'descriptionChange' ||
            action.action === 'autoSaveChange'
          ) {
            currentEntry.current = {
              ...currentEntry.current,
              meta: action.entry.meta,
            };
            isChanged = true;
          }
        }
      }
      if (isChanged) {
        forceUpdate();
      }
    }
  }, [metaActions]);

  useEffect(() => {
    if (
      currentLocation &&
      currentLocation.autoOpenedFilename &&
      currentLocation.autoOpenedFilename.length > 0
    ) {
      const autoOpenedFilePath = joinPaths(
        currentLocation?.getDirSeparator(),
        currentDirectoryPath,
        currentLocation.autoOpenedFilename,
      );
      currentLocation.checkFileExist(autoOpenedFilePath).then((exist) => {
        if (exist) {
          openEntry(autoOpenedFilePath);
        }
      });
    }
  }, [currentDirectoryPath]);

  function openNextFile(entries: TS.FileSystemEntry[]): TS.FileSystemEntry {
    const nextFile = getNextFile(
      currentEntry.current?.path,
      selectedEntries && selectedEntries.length > 0
        ? selectedEntries[selectedEntries.length - 1].path
        : undefined,
      entries,
    );
    if (nextFile !== undefined) {
      openFsEntry(nextFile);
      // dispatch(actions.setLastSelectedEntry(nextFile.path));
      setSelectedEntries([nextFile]);
      return nextFile;
    }
    return undefined;
  }

  function openPrevFile(entries: TS.FileSystemEntry[]): TS.FileSystemEntry {
    const prevFile = getPrevFile(
      currentEntry.current?.path,
      selectedEntries && selectedEntries.length > 0
        ? selectedEntries[selectedEntries.length - 1].path
        : undefined,
      entries,
    );
    if (prevFile !== undefined) {
      openFsEntry(prevFile);
      // dispatch(actions.setLastSelectedEntry(prevFile.path));
      setSelectedEntries([prevFile]);
      return prevFile;
    }
    return undefined;
  }

  function getOpenedDirProps(): Promise<TS.DirProp> {
    if (
      currentEntry.current &&
      !currentEntry.current.isFile &&
      !currentLocation.haveObjectStoreSupport() &&
      !currentLocation.haveWebDavSupport()
    ) {
      return getDirProperties(currentEntry.current.path).catch((ex) => {
        console.debug('getDirProperties:', ex.message);
        return Promise.resolve(undefined);
      });
    }
    return Promise.resolve(undefined);
  }

  async function setSharedLinks(openedFile?) {
    if (openedFile) {
      const folderLocation = findLocation(openedFile.locationID);
      const locationPath = await getLocationPath(folderLocation);
      const folderPath = extractContainingDirectoryPath(openedFile.path);
      if (folderPath.indexOf(cleanTrailingDirSeparator(locationPath)) === 0) {
        sharingParentFolderLink.current = generateSharingLink(
          openedFile.locationID,
          undefined,
          cleanRootPath(
            folderPath,
            locationPath,
            folderLocation?.getDirSeparator(),
          ),
        );
      }

      if (openedFile.isFile) {
        const relativePath = getRelativeEntryPath(
          locationPath,
          openedFile.path,
        );
        const relativeDirPath = getRelativeEntryPath(locationPath, folderPath);
        sharingLink.current = generateSharingLink(
          openedFile.locationID,
          relativePath,
          relativeDirPath,
        );
      } else {
        const relativePath = getRelativeEntryPath(
          locationPath,
          openedFile.path,
        );

        sharingLink.current = generateSharingLink(
          openedFile.locationID,
          undefined,
          relativePath,
        );
      }
    } else {
      sharingLink.current = undefined;
      sharingParentFolderLink.current = undefined;
    }
  }

  /*function setSharedLinks(openedFile?) {
    if (openedFile) {
      if (window.location.href.indexOf('?') > 0) {
        const sharingURL = new URL(window.location.href);
        const params = new URLSearchParams(sharingURL.search);
        if (params.has('tslid')) {
          const locationId = params.get('tslid');
          //if (params.has('tsdpath')) {
          // const folderPath2 = params.get('tsdpath');
          const folderLocation = findLocation(locationId);
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
                folderLocation?.getDirSeparator(),
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
  }*/

  function addToEntryContainer(fsEntry: TS.OpenedEntry) {
    setSharedLinks(fsEntry).then(() => {
      currentEntry.current = { ...fsEntry };
      forceUpdate();
    });
    // setOpenedEntries([fsEntry]); // [...openedEntries, fsEntry] // TODO uncomment for multiple file support
  }

  function closeOpenedEntries() {
    setSharedLinks().then(() => {
      currentEntry.current = undefined;
      forceUpdate();
    });
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
        currentEntry.current = { ...currentEntry.current, lmdt: entry.lmdt };
        forceUpdate();
      }
    }
  }

  function reloadOpenedFile(): Promise<boolean> {
    if (currentEntry.current) {
      //currentEntry.current.editMode = false;
      //return openEntry(currentEntry.current.path); //true);
      return getAllPropertiesPromise(
        currentEntry.current.path,
        currentEntry.current.locationID,
      )
        .then((fsEntry: TS.FileSystemEntry) =>
          openFsEntry({
            ...currentEntry.current,
            ...fsEntry,
            isNewFile: false,
          }),
        )
        .catch((error) => {
          console.log(
            'Error getting properties for entry: ' +
              currentEntry.current.path +
              ' - ' +
              error,
          );
          return false;
        });
    }
    return Promise.resolve(false);
  }

  function openEntry(path?: string, showDetails = undefined): Promise<boolean> {
    if (path === undefined) {
      return openFsEntry(undefined, showDetails);
    }
    return getAllPropertiesPromise(path)
      .then((fsEntry: TS.FileSystemEntry) => openFsEntry(fsEntry, showDetails))
      .catch((error) => {
        console.log(
          'Error getting properties for entry: ' + path + ' - ' + error,
        );
        return false;
      });
  }

  function openEntryInternal(
    fsEntry: TS.FileSystemEntry,
    showDetails = undefined,
  ): Promise<boolean> {
    return getAllPropertiesPromise(fsEntry.path, fsEntry.locationID)
      .then((entry: TS.FileSystemEntry) => {
        if (entry) {
          return openFsEntry(entry, showDetails);
        } else {
          showNotification(
            'File ' + fsEntry.path + ' not exist on filesystem!',
            'warning',
            true,
          );
          return openFsEntry(fsEntry, showDetails);
        }
      })
      .catch((error) => {
        console.log(
          'Error getting properties for entry: ' + fsEntry.path + ' - ' + error,
        );
        return false;
      });
  }

  function openFsEntry(
    fsEntry?: TS.FileSystemEntry,
    showDetails = undefined,
  ): Promise<boolean> {
    if (!fsEntry) {
      if (selectedEntries && selectedEntries.length > 0) {
        const lastSelectedEntry = selectedEntries[selectedEntries.length - 1];
        if (!lastSelectedEntry.isFile) {
          return openDirectory(lastSelectedEntry.path); //, false);
        }
      } else {
        return Promise.resolve(false);
      }
    }
    let entryForOpening: TS.OpenedEntry;

    /**
     * check for editMode in order to show save changes dialog (shouldReload: false)
     */
    if (currentEntry.current) {
      //openedEntries.length > 0) {
      const openFile = currentEntry.current; //openedEntries[0];
      if (fileChanged.current) {
        entryForOpening = {
          ...openFile,
        }; // false };
        addToEntryContainer(entryForOpening);
        showNotification(
          `You can't open another file, because '${openFile.path}' is opened for editing`,
          'default',
          true,
        );
        return Promise.resolve(false);
      }
    }
    if (showDetails !== undefined) {
      dispatch(SettingsActions.setShowDetails(showDetails));
    }
    entryForOpening = findExtensionsForEntry(fsEntry, supportedFileTypes);
    const loc = findLocation(fsEntry.locationID);
    if (loc.haveObjectStoreSupport() || loc.haveWebDavSupport()) {
      const cleanedPath = fsEntry.path.startsWith('/')
        ? fsEntry.path.substr(1)
        : fsEntry.path;
      entryForOpening.url = loc.getURLforPath(cleanedPath);
    } else if (fsEntry.url) {
      entryForOpening.url = fsEntry.url;
    }
    if (
      fsEntry.isNewFile &&
      AppConfig.editableFiles.includes(fsEntry.extension)
    ) {
      setEditMode(true);
    }

    const locationName = loc ? loc.name : 'TagSpaces'; // TODO get it later from app config

    document.title = fsEntry.name + ' | ' + locationName;

    // update history window.location.href - used for shared link generation
    updateHistory(
      { ...currentLocation, path: currentLocationPath },
      currentDirectoryPath,
      fsEntry.path,
    );

    addToEntryContainer(entryForOpening);
    return Promise.resolve(true);
  }

  function toggleEntryFullWidth() {
    isEntryInFullWidth.current = !isEntryInFullWidth.current;
    forceUpdate();
  }

  function setEntryInFullWidth(fullWidth) {
    isEntryInFullWidth.current = fullWidth;
    forceUpdate();
  }

  function setFileChanged(isChanged) {
    if (fileChanged.current !== isChanged) {
      fileChanged.current = isChanged;
      forceUpdate();
    }
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
        getAllPropertiesPromise(entryPath, lid)
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
        const targetLocation: CommonLocation = findLocation(locationId);
        if (targetLocation) {
          //let openLocationTimer = 1000;
          const isCloudLocation =
            targetLocation.type === locationType.TYPE_CLOUD;
          if (
            !currentLocation ||
            targetLocation.uuid !== currentLocation.uuid
          ) {
            openLocation(targetLocation, true);
          } /*else {
            openLocationTimer = 0;
          }*/
          getLocationPath(targetLocation).then((path) => {
            const locationPath: string = cleanTrailingDirSeparator(path);

            // setTimeout is needed for case of a location switch, if no location swith the timer is 0
            //setTimeout(() => {
            if (isCloudLocation) {
              if (directoryPath && directoryPath.length > 0) {
                const newRelDir = getRelativeEntryPath(path, directoryPath);
                const dirFullPath =
                  locationPath.length > 0
                    ? locationPath + '/' + newRelDir
                    : directoryPath;
                openDirectory(dirFullPath, undefined, targetLocation);
              } else {
                openDirectory(locationPath, undefined, targetLocation);
              }

              if (entryPath) {
                getAllPropertiesPromise(
                  (locationPath.length > 0 ? locationPath + '/' : '') +
                    entryPath,
                  lid,
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

                const dirFullPath = joinPaths(
                  targetLocation.getDirSeparator(),
                  locationPath,
                  directoryPath,
                );

                openDirectory(dirFullPath, undefined, targetLocation);
              } else {
                openDirectory(locationPath, undefined, targetLocation);
              }

              if (entryPath && entryPath.length > 0) {
                if (entryPath.includes('../') || entryPath.includes('..\\')) {
                  showNotification(t('core:invalidLink'), 'warning', true);
                  return true;
                }
                const entryFullPath =
                  locationPath + targetLocation.getDirSeparator() + entryPath;
                getAllPropertiesPromise(entryFullPath, lid)
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
            //}, openLocationTimer);
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
        showNotification(
          t('core:urlNotSupported') + ': ' + decodedURI,
          'info',
          true,
        );
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
        (currentLocation
          ? currentLocation.getDirSeparator()
          : AppConfig.dirSeparator) +
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
          console.log('File creation failed with ' + err);
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
      normalizePath(targetPath) +
      (currentLocation
        ? currentLocation.getDirSeparator()
        : AppConfig.dirSeparator) +
      fileNameAndExt;
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
        console.log('Error creating file: ' + error);
        showNotification(
          `Error creating file '${fileNameAndExt}'`,
          'error',
          true,
        );
      });
  }

  function addExtensionsForEntry(
    openedEntry: TS.OpenedEntry,
    supportedFileTypes: Array<TS.FileTypes>,
  ): TS.OpenedEntry {
    const fileExtension = extractFileExtension(
      openedEntry.path,
      currentLocation
        ? currentLocation.getDirSeparator()
        : AppConfig.dirSeparator,
    ).toLowerCase();

    const fileForOpening = { ...openedEntry };
    const fileType: TS.FileTypes = supportedFileTypes.find(
      (fileType) =>
        fileType.viewer && fileType.type.toLowerCase() === fileExtension,
    );
    if (fileType) {
      fileForOpening.viewingExtensionId = fileType.viewer;
      if (fileType.color) {
        fileForOpening.meta = fileForOpening.meta
          ? { ...fileForOpening.meta, color: fileType.color }
          : { id: openedEntry.uuid, color: fileType.color };
      }
      fileForOpening.viewingExtensionPath = findExtensionPathForId(
        fileType.viewer,
        //fileType.extensionExternalPath,
      );
      if (fileType.editor && fileType.editor.length > 0) {
        fileForOpening.editingExtensionId = fileType.editor;
        fileForOpening.editingExtensionPath = findExtensionPathForId(
          fileType.editor,
          //fileType.extensionExternalPath,
        );
      }
    } else {
      fileForOpening.viewingExtensionPath = openedEntry.isFile
        ? findExtensionPathForId('@tagspaces/extensions/text-viewer')
        : 'about:blank';
    }
    return fileForOpening;
  }

  function findExtensionsForEntry(
    entry: TS.FileSystemEntry,
    supportedFileTypes: Array<any>,
  ): TS.OpenedEntry {
    return addExtensionsForEntry(
      {
        ...entry,
        viewingExtensionPath: 'about:blank',
        viewingExtensionId: '',
        /*lmdt: 0,
        size: 0,
        name: '',
        tags: [],*/
      },
      supportedFileTypes,
    );
  }

  const context = useMemo(() => {
    return {
      openedEntry: currentEntry.current,
      fileChanged: fileChanged.current,
      isEntryInFullWidth: isEntryInFullWidth.current,
      sharingLink: sharingLink.current,
      sharingParentFolderLink: sharingParentFolderLink.current,
      setEntryInFullWidth,
      setFileChanged,
      addToEntryContainer,
      closeAllFiles,
      reflectUpdateOpenedFileContent,
      reloadOpenedFile,
      //updateOpenedFile,
      openEntry,
      openFsEntry,
      openEntryInternal,
      openNextFile,
      openPrevFile,
      toggleEntryFullWidth,
      goForward,
      goBack,
      openLink,
      createFile,
      createFileAdvanced,
      getOpenedDirProps,
    };
  }, [
    fileChanged.current,
    currentEntry.current,
    isEntryInFullWidth.current,
    currentLocation,
    currentDirectoryPath,
  ]);

  return (
    <OpenedEntryContext.Provider value={context}>
      {children}
    </OpenedEntryContext.Provider>
  );
};
