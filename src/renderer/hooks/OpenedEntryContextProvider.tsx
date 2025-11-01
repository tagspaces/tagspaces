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
import { TabNames } from '-/hooks/EntryPropsTabsContextProvider';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useEditedEntryContext } from '-/hooks/useEditedEntryContext';
import { useEditedEntryMetaContext } from '-/hooks/useEditedEntryMetaContext';
import { useFilePropertiesContext } from '-/hooks/useFilePropertiesContext';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { usePlatformFacadeContext } from '-/hooks/usePlatformFacadeContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { AppDispatch } from '-/reducers/app';
import {
  actions as SettingsActions,
  getNewHTMLFileContent,
  getSupportedFileTypes,
} from '-/reducers/settings';
import { extractPDFcontent } from '-/services/thumbsgenerator';
import {
  findExtensionPathForId,
  getDirProperties,
  getNextFile,
  getPrevFile,
  getRelativeEntryPath,
  openURLExternally,
} from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import { CommonLocation } from '-/utils/CommonLocation';
import { clearURLParam, getURLParameter, updateHistory } from '-/utils/dom';
import useFirstRender from '-/utils/useFirstRender';
import versionMeta from '-/version.json';
import {
  formatDateTime4Tag,
  locationType,
} from '@tagspaces/tagspaces-common/misc';
import {
  cleanRootPath,
  cleanTrailingDirSeparator,
  extractContainingDirectoryPath,
  extractFileExtension,
  generateSharingLink,
  getMetaContentFileLocation,
  isMeta,
  joinPaths,
  normalizePath,
} from '@tagspaces/tagspaces-common/paths';
import React, {
  createContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

type OpenedEntryContextData = {
  haveOpenedEntry: boolean;
  openedEntry: TS.OpenedEntry;
  fileChanged: boolean;
  isEntryInFullWidth: boolean;
  sharingLink: string;
  sharingParentFolderLink: string;
  setEntryInFullWidth: (fullWidth: boolean) => void;
  setFileChanged: (isChanged: boolean) => void;
  addToEntryContainer: (fsEntry: TS.OpenedEntry) => void;
  /**
   * don't use this direct. In FilePropertiesContextProvider have wrapper function closeOpenedEntries that check for unsaved changes before close file
   */
  actuallyCloseFiles: () => void;
  reflectUpdateOpenedFileContent: (entry: TS.FileSystemEntry) => void;
  reloadOpenedFile: () => Promise<boolean>;
  /*updateOpenedFile: (
    entryPath: string,
    fsEntryMeta: TS.FileSystemEntryMeta,
  ) => Promise<boolean>;*/
  openEntry: (path?: string, tabSelected?: string) => Promise<boolean>;
  openFsEntry: (
    fsEntry?: TS.FileSystemEntry,
    tabSelected?: (typeof TabNames)[keyof typeof TabNames],
  ) => Promise<boolean>;
  openEntryInternal: (
    fsEntry: TS.FileSystemEntry,
    tabSelected?: string,
  ) => Promise<boolean>;
  openNextFile: (entries: TS.FileSystemEntry[]) => Promise<TS.FileSystemEntry>;
  openPrevFile: (entries: TS.FileSystemEntry[]) => Promise<TS.FileSystemEntry>;
  toggleEntryFullWidth: () => void;
  openLink: (url: string, options?) => void;
  //goForward: () => void;
  //goBack: () => void;
  createFileAdvanced: (
    targetPath: string,
    fileName: string,
    content: string,
    fileType?: TS.FileType,
    createMeta?: string,
  ) => void;
  createFile: () => void;
  getOpenedDirProps: () => Promise<TS.DirProp>;
};

export const OpenedEntryContext = createContext<OpenedEntryContextData>({
  haveOpenedEntry: false,
  openedEntry: undefined,
  fileChanged: false,
  isEntryInFullWidth: false,
  sharingLink: undefined,
  sharingParentFolderLink: undefined,
  setEntryInFullWidth: undefined,
  setFileChanged: undefined,
  addToEntryContainer: () => {},
  actuallyCloseFiles: () => {},
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
  //goForward: () => {},
  //goBack: () => {},
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

  const { findLocation, openLocation, getLocationPath, getFirstRWLocation } =
    useCurrentLocationContext();
  const { getMetadata } = useIOActionsContext();
  const {
    currentDirectoryPath,
    currentLocationPath,
    openDirectory,
    getAllPropertiesPromise,
    setSearchQuery,
  } = useDirectoryContentContext();

  const { selectedEntries, setSelectedEntries } = useSelectedEntriesContext();
  const { showNotification, openConfirmDialog } = useNotificationContext();
  const { actions } = useEditedEntryContext();
  const { metaActions } = useEditedEntryMetaContext();
  const { saveFilePromise } = usePlatformFacadeContext();
  const { setEditMode } = useFilePropertiesContext();

  const supportedFileTypes = useSelector(getSupportedFileTypes);
  //const locations: CommonLocation[] = useSelector(getLocations);
  const newHTMLFileContent = useSelector(getNewHTMLFileContent);
  const currentEntry = useRef<TS.OpenedEntry>(undefined);
  const fileChanged = useRef<boolean>(false);
  const isEntryInFullWidth = useRef<boolean>(false);
  const sharingLink = useRef<string>(undefined);
  const sharingParentFolderLink = useRef<string>(undefined);
  const firstRender = useFirstRender();
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);
  const currentLocation = findLocation();

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
    if (!firstRender && actions && actions.length > 0) {
      for (const action of actions) {
        if (action.action === 'add') {
          if (
            action.open &&
            action.entry.isFile &&
            !isMeta(action.entry.path)
          ) {
            //&& action.entry.isNewFile) {
            openFsEntry(action.entry);
          }
        } else if (action.action === 'delete') {
          if (
            currentEntry.current &&
            currentEntry.current.path.startsWith(action.entry.path)
          ) {
            actuallyCloseFiles();
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
    if (!firstRender && metaActions && metaActions.length > 0) {
      let isChanged = false;
      for (const action of metaActions) {
        if (
          currentEntry.current &&
          action.entry &&
          currentEntry.current.path === action.entry.path
        ) {
          if (
            action.action === 'bgdColorChange' ||
            action.action === 'thumbChange' ||
            action.action === 'bgdImgChange' ||
            action.action === 'autoSaveChange' ||
            (action.action === 'descriptionChange' &&
              currentEntry.current.meta?.description !==
                action.entry.meta?.description)
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

  function setLinkFromSearchConfirmDialogOpened(query: string) {
    if (query) {
      openConfirmDialog(
        t('core:invalidSharingLink'),
        t('core:confirmSearchById'),
        (result) => {
          if (result) {
            setSearchQuery({
              textQuery: query,
              searchBoxing: 'location',
              searchType: 'strict',
              maxSearchResults: 1,
              forceIndexing: true,
              executeSearch: true,
            });
          }
        },
        'linkFromSearchDialogCancel',
        'linkFromSearchDialogConfirm',
        'linkFromSearchDialogContent',
      );
    }
  }

  function openNextFile(
    entries: TS.FileSystemEntry[],
  ): Promise<TS.FileSystemEntry> {
    const nextFile: TS.FileSystemEntry = getNextFile(
      currentEntry.current?.path,
      selectedEntries && selectedEntries.length > 0
        ? selectedEntries[selectedEntries.length - 1].path
        : undefined,
      entries,
    );
    if (nextFile !== undefined) {
      return currentLocation
        .checkFileEncryptedPromise(nextFile.path)
        .then((encrypted) => {
          const file = { ...nextFile, isEncrypted: encrypted };
          return openFsEntry(file).then(() => {
            setSelectedEntries([file]);
            return file;
          });
        });
    }
    return Promise.resolve(undefined);
  }

  function openPrevFile(
    entries: TS.FileSystemEntry[],
  ): Promise<TS.FileSystemEntry> {
    const prevFile = getPrevFile(
      currentEntry.current?.path,
      selectedEntries && selectedEntries.length > 0
        ? selectedEntries[selectedEntries.length - 1].path
        : undefined,
      entries,
    );
    if (prevFile !== undefined) {
      return currentLocation
        .checkFileEncryptedPromise(prevFile.path)
        .then((encrypted) => {
          const file = { ...prevFile, isEncrypted: encrypted };
          return openFsEntry(file).then(() => {
            setSelectedEntries([file]);
            return file;
          });
        });
    }
    return Promise.resolve(undefined);
  }

  function getOpenedDirProps(): Promise<TS.DirProp> {
    if (currentEntry.current && !currentEntry.current.isFile) {
      const location = findLocation(currentEntry.current.locationID);
      if (
        location &&
        !location.haveObjectStoreSupport() &&
        !location.haveWebDavSupport()
      ) {
        return getDirProperties(currentEntry.current.path).catch((ex) => {
          console.debug('getDirProperties:', ex.message);
          return Promise.resolve(undefined);
        });
      }
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
          openedFile.uuid,
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
          openedFile.uuid,
        );
      }
    } else {
      sharingLink.current = undefined;
      sharingParentFolderLink.current = undefined;
    }
  }

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
      fileChanged.current = false;
      forceUpdate();
    });
  }

  function actuallyCloseFiles() {
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

  function openEntry(
    path?: string,
    tabSelected: string = undefined,
  ): Promise<boolean> {
    if (path === undefined) {
      return openFsEntry(undefined, tabSelected);
    }
    return getAllPropertiesPromise(path)
      .then((fsEntry: TS.FileSystemEntry) => openFsEntry(fsEntry, tabSelected))
      .catch((error) => {
        console.log(
          'Error getting properties for entry: ' + path + ' - ' + error,
        );
        return false;
      });
  }

  function openEntryInternal(
    fsEntry: TS.FileSystemEntry,
    tabSelected = undefined,
  ): Promise<boolean> {
    /**
     * used for encryption check
     */
    return getAllPropertiesPromise(fsEntry.path, fsEntry.locationID)
      .then((entry: TS.FileSystemEntry) => {
        if (entry) {
          return openFsEntry(entry, tabSelected);
        } else {
          if (typeof entry === 'boolean') {
            if (!entry) {
              showNotification(
                'File ' + fsEntry.path + ' not exist on filesystem!',
                'warning',
                true,
              );
            }
          }
          return openFsEntry(fsEntry, tabSelected);
        }
      })
      .catch((error) => {
        console.log(
          'Error getting properties for entry: ' + fsEntry.path + ' - ' + error,
        );
        return false;
      });
  }

  async function openFsEntry(
    fsEntry?: TS.FileSystemEntry,
    tabSelected: (typeof TabNames)[keyof typeof TabNames] = undefined,
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
    if (fileChanged.current && currentEntry.current) {
      entryForOpening = {
        ...currentEntry.current,
      }; // false };
      addToEntryContainer(entryForOpening);
      showNotification(
        `You can't open another file, because '${currentEntry.current.path}' is opened for editing`,
        'default',
        true,
      );
      return Promise.resolve(false);
    }

    entryForOpening = findExtensionsForEntry(fsEntry, supportedFileTypes);
    const loc = findLocation(fsEntry.locationID);
    if (loc?.haveObjectStoreSupport() || loc?.haveWebDavSupport()) {
      const cleanedPath = fsEntry.path.startsWith('/')
        ? fsEntry.path.substr(1)
        : fsEntry.path;
      entryForOpening.url = await loc?.getURLforPathInt(cleanedPath);
    } else if (fsEntry.url) {
      entryForOpening.url = fsEntry.url;
    }
    //set meta and generate new meta id if not exist
    if (fsEntry.isFile) {
      if (!fsEntry.meta?.id) {
        const meta: TS.FileSystemEntryMeta = await getMetadata(
          fsEntry.path,
          fsEntry.uuid,
          loc,
        );
        if (meta) {
          entryForOpening.uuid = meta.id;
          entryForOpening.meta = { ...fsEntry.meta, ...meta };
        }
      }
      if (fsEntry.meta?.thumbPath) {
        const thumb = await loc?.getThumbPath(
          fsEntry.meta.thumbPath,
          fsEntry.meta.lastUpdated,
        );
        if (thumb) {
          entryForOpening.meta.thumbPath = thumb;
        }
      }
    }
    if (
      fsEntry.isNewFile &&
      AppConfig.editableFiles.includes(fsEntry.extension)
    ) {
      setEditMode(true);
    }

    const locationName = loc ? loc.name : 'TagSpaces'; // TODO get it later from app config

    const entryNameForTitle =
      fsEntry.name.length > 40
        ? fsEntry.name.substring(0, 40) + '...'
        : fsEntry.name;

    document.title = entryNameForTitle + ' | ' + locationName;

    // update history window.location.href - used for shared link generation
    updateHistory(
      currentLocation?.uuid,
      currentLocationPath,
      currentDirectoryPath,
      fsEntry.path,
    );

    addToEntryContainer(entryForOpening);

    if (tabSelected !== undefined) {
      dispatch(SettingsActions.setEntryContainerTab(tabSelected));
      //setOpenedTab(tabSelected, entryForOpening);
      //dispatch(SettingsActions.setShowDetails(tabSelected));
    }
    /*if (
      selectedEntries.length !== 1 ||
      selectedEntries.some((e) => e.path !== fsEntry.path)
    ) {
      setSelectedEntries([fsEntry]);
    }*/
    if (loc.fullTextIndex && entryForOpening.extension === 'pdf') {
      //extract text from pdf
      loc
        .getFileContentPromise(entryForOpening.path, 'arraybuffer')
        .then((content) => {
          extractPDFcontent(content).then((txt) => {
            loc
              .saveTextFilePromise(
                { path: getMetaContentFileLocation(entryForOpening.path) },
                txt,
                true,
              )
              .then(() =>
                console.log('Content extracted:' + entryForOpening.path),
              );
          });
        });
    }
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
      if (AppConfig.isElectron) {
        window.electronIO.ipcRenderer.sendMessage('file-changed', isChanged);
      }
    }
  }

  function openLink(url: string, options = { fullWidth: true }) {
    try {
      const decodedURI = decodeURI(url);
      const lid = getURLParameter('tslid', url);
      const dPath = getURLParameter('tsdpath', url);
      const ePath = getURLParameter('tsepath', url);
      const cmdOpen = getURLParameter('cmdopen', url);
      const id = getURLParameter('tseid', url);
      if (cmdOpen && cmdOpen.length > 0) {
        const entryPath = decodeURIComponent(cmdOpen);
        const locationId = lid ? lid : getFirstRWLocation()?.uuid;
        getAllPropertiesPromise(entryPath, locationId)
          .then((fsEntry: TS.FileSystemEntry) => {
            if (fsEntry) {
              if (fsEntry.isFile) {
                openFsEntry(fsEntry);
                setEntryInFullWidth(options.fullWidth);
              } else {
                openDirectory(fsEntry.path);
              }
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
                const filePath =
                  (locationPath.length > 0 ? locationPath + '/' : '') +
                  entryPath;
                getAllPropertiesPromise(filePath, lid)
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
              let dirPath = locationPath;
              if (directoryPath && directoryPath.length > 0) {
                if (
                  directoryPath.includes('../') ||
                  directoryPath.includes('..\\')
                ) {
                  showNotification(t('core:invalidLink'), 'warning', true);
                  return true;
                }

                dirPath = joinPaths(
                  targetLocation.getDirSeparator(),
                  locationPath,
                  directoryPath,
                );
              }
              targetLocation.checkDirExist(dirPath).then((exist) => {
                if (exist) {
                  openDirectory(dirPath, undefined, targetLocation).then(() => {
                    if (entryPath && entryPath.length > 0) {
                      if (
                        entryPath.includes('../') ||
                        entryPath.includes('..\\')
                      ) {
                        showNotification(
                          t('core:invalidLink'),
                          'warning',
                          true,
                        );
                        return true;
                      }
                      const entryFullPath =
                        locationPath +
                        targetLocation.getDirSeparator() +
                        entryPath;
                      getAllPropertiesPromise(entryFullPath, lid)
                        .then((fsEntry: TS.FileSystemEntry) => {
                          if (fsEntry) {
                            openFsEntry(fsEntry);
                            if (options.fullWidth) {
                              setEntryInFullWidth(true);
                            }
                          } else if (id) {
                            //ENTRY NOT EXIST maybe moved
                            setLinkFromSearchConfirmDialogOpened(id);
                          }
                          return true;
                        })
                        .catch(() =>
                          showNotification(
                            t('core:invalidLink'),
                            'warning',
                            true,
                          ),
                        );
                    }
                  });
                } else if (id) {
                  //ENTRY NOT EXIST maybe moved
                  setLinkFromSearchConfirmDialogOpened(id);
                } else {
                  showNotification(t('core:invalidLink'), 'warning', true);
                }
              });
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
        decodedURI.startsWith('onenote:') ||
        decodedURI.startsWith('mailto:') ||
        decodedURI.startsWith('tel:') ||
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
    fileType: TS.FileType = 'md',
  ) {
    const creationDate = new Date().toISOString();
    const fileNameAndExt = fileName + '.' + fileType;
    const filePath =
      normalizePath(targetPath) +
      (currentLocation
        ? currentLocation.getDirSeparator()
        : AppConfig.dirSeparator) +
      fileNameAndExt;
    let fileContent = content;
    if (fileType === 'html') {
      fileContent = `${newHTMLFileContent.split('<body></body>')[0]}
<body data-createdwith="${versionMeta.name}" data-createdon="${creationDate}">
${content}
</body>
${newHTMLFileContent.split('<body></body>')[1]}`;
    } else if (fileType === 'md') {
      fileContent = content;
    } else if (fileType === 'url') {
      fileContent = '[InternetShortcut]\n' + 'URL=' + content + '\n';
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
        fileType.extensionExternalPath,
      );
      if (fileType.editor && fileType.editor.length > 0) {
        fileForOpening.editingExtensionId = fileType.editor;
        fileForOpening.editingExtensionPath = findExtensionPathForId(
          fileType.editor,
          fileType.extensionExternalPath,
        );
      }
    } else {
      fileForOpening.viewingExtensionPath = findExtensionPathForId(
        '@tagspaces/extensions/text-viewer',
      );
      /*openedEntry.isFile
        ? findExtensionPathForId('@tagspaces/extensions/text-viewer')
        : 'about:blank';*/
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
      haveOpenedEntry: currentEntry.current !== undefined,
      openedEntry: currentEntry.current,
      fileChanged: fileChanged.current,
      isEntryInFullWidth: isEntryInFullWidth.current,
      sharingLink: sharingLink.current,
      sharingParentFolderLink: sharingParentFolderLink.current,
      setEntryInFullWidth,
      setFileChanged,
      addToEntryContainer,
      actuallyCloseFiles,
      reflectUpdateOpenedFileContent,
      reloadOpenedFile,
      //updateOpenedFile,
      openEntry,
      openFsEntry,
      openEntryInternal,
      openNextFile,
      openPrevFile,
      toggleEntryFullWidth,
      //goForward,
      //goBack,
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
