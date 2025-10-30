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
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useEditedEntryContext } from '-/hooks/useEditedEntryContext';
import { useEditedEntryMetaContext } from '-/hooks/useEditedEntryMetaContext';
import { useLocationIndexContext } from '-/hooks/useLocationIndexContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { usePerspectiveActionsContext } from '-/hooks/usePerspectiveActionsContext';
import { usePlatformFacadeContext } from '-/hooks/usePlatformFacadeContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { Pro } from '-/pro';
import { actions as AppActions, AppDispatch } from '-/reducers/app';
import {
  getAuthor,
  getFileNameTagPlace,
  getPrefixTagContainer,
  getTagDelimiter,
  getWarningOpeningFilesExternally,
  isRevisionsEnabled,
} from '-/reducers/settings';
import {
  generateImageThumbnail,
  generateThumbnailPromise,
} from '-/services/thumbsgenerator';
import {
  cleanMetaData,
  downloadFile,
  executePromisesInBatches,
  mergeFsEntryMeta,
  openDirectoryMessage,
  openFileMessage,
} from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import { CommonLocation } from '-/utils/CommonLocation';
import { base64ToBlob } from '-/utils/dom';
import { formatDateTime4Tag } from '@tagspaces/tagspaces-common/misc';
import {
  cleanTrailingDirSeparator,
  extractContainingDirectoryPath,
  extractDirectoryName,
  extractFileName,
  extractTags,
  generateFileName,
  getBackupDir,
  getBackupFileDir,
  getBackupFileLocation,
  getBackupFolderLocation,
  getBgndFileLocationForDirectory,
  getFileLocationFromMetaFile,
  getMetaContentFileLocation,
  getMetaDirectoryPath,
  getMetaFileLocationForDir,
  getMetaFileLocationForFile,
  getThumbFileLocationForDirectory,
  getThumbFileLocationForFile,
  isMeta,
  joinPaths,
  normalizePath,
} from '@tagspaces/tagspaces-common/paths';
import {
  enhanceEntry,
  getUuid,
  loadJSONString,
} from '@tagspaces/tagspaces-common/utils-io';
import React, { createContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

type IOActionsContextData = {
  createDirectory: (
    directoryPath: string,
    locationID?: string,
    reflect?: boolean,
    open?: boolean,
    skipSelection?: boolean,
  ) => Promise<boolean>;
  deleteEntries: (...entries: TS.FileSystemEntry[]) => Promise<boolean>;
  deleteDirectory: (directoryPath: string) => Promise<boolean>;
  deleteFile: (filePath: string, uuid: string) => Promise<boolean>;
  moveDirs: (
    dirPaths: Array<string>,
    targetPath: string,
    locationID: string,
    onProgress?,
  ) => Promise<boolean>;
  moveFiles: (
    paths: Array<string>,
    targetPath: string,
    locationID: string,
    onProgress?,
    reflect?: boolean,
    force?: boolean,
  ) => Promise<boolean>;
  copyDirs: (
    dirPaths: Array<any>,
    targetPath: string,
    locationID: string,
    onProgress?,
  ) => Promise<boolean>;
  copyFiles: (
    paths: Array<string>,
    targetPath: string,
    locationID: string,
    onProgress?,
  ) => Promise<boolean>;
  downloadUrl: (
    url: string,
    targetPath: string,
    onDownloadProgress?: (progress, abort, fileName?) => void,
  ) => Promise<TS.FileSystemEntry>;
  downloadFsEntry: (fsEntry: TS.FileSystemEntry) => void;
  uploadFilesAPI: (
    files: Array<any>,
    targetPath: string,
    onUploadProgress?: (progress, abort, fileName?) => void,
    uploadMeta?: boolean,
    open?: boolean,
    targetLocationId?: string,
    sourceLocationId?: string,
  ) => Promise<TS.FileSystemEntry[]>;
  uploadMeta: (
    files: string[],
    targetPath: string,
    onUploadProgress?: (progress, abort, fileName?) => void,
    open?: boolean,
    targetLocationId?: string,
    sourceLocationId?: string,
  ) => Promise<TS.FileSystemEntry[]>;
  uploadFiles: (
    paths: Array<string>,
    targetPath: string,
    onUploadProgress?: (progress, abort, fileName?) => void,
    uploadMeta?: boolean,
    open?: boolean,
    targetLocationId?: string,
    sourceLocationId?: string,
  ) => Promise<TS.FileSystemEntry[]>;
  renameDirectory: (
    directoryPath: string,
    newDirectoryName: string,
    locationID: string,
  ) => Promise<string>;
  renameFile: (
    filePath: string,
    newFilePath: string,
    locationID: string,
    reflect?: boolean,
  ) => Promise<boolean>;
  openFileNatively: (selectedFile?: string) => void;
  duplicateFile: (selectedFilePath: string) => void;
  saveCurrentLocationMetaData: (
    path: string,
    metaData: any,
  ) => Promise<TS.FileSystemEntryMeta>;
  saveMetaDataPromise: (
    entry: TS.FileSystemEntry,
    metaData: any,
    reflect?: boolean,
  ) => Promise<TS.FileSystemEntryMeta>;
  getMetadata: (
    path: string,
    id: string,
    location: CommonLocation,
  ) => Promise<TS.FileSystemEntryMeta>;
  getMetadataID: (
    path: string,
    id: string,
    location: CommonLocation,
  ) => Promise<string>;
  saveFsEntryMeta: (
    entry: TS.FileSystemEntry,
    meta: any,
  ) => Promise<TS.FileSystemEntryMeta>;
  savePerspective: (
    entry: TS.FileSystemEntry,
    perspective: TS.PerspectiveType,
  ) => Promise<TS.FileSystemEntryMeta>;
  removeFolderCustomSettings: (
    path: string,
    perspective: string,
  ) => Promise<TS.FileSystemEntryMeta>;
  setAutoSave: (
    entry: TS.FileSystemEntry,
    autoSave: boolean,
    locationID?,
  ) => Promise<boolean>;
  setDescriptionChange: (
    entry: TS.FileSystemEntry,
    description: string,
  ) => Promise<boolean>;
  saveDirectoryPerspective: (
    entry: TS.FileSystemEntry,
    perspective: TS.PerspectiveType,
    locationID?,
  ) => Promise<boolean>;
  setBackgroundImageChange: (entry: TS.FileSystemEntry) => void;
  setBackgroundColorChange: (
    entry: TS.FileSystemEntry,
    color: string,
    locationID?,
  ) => Promise<boolean>;
  setThumbnailImageChange: (entry: TS.FileSystemEntry) => void;
  setFolderBackgroundPromise: (
    filePath: string,
    directoryPath: string,
  ) => Promise<string>;
  toggleDirVisibility: (
    dir: TS.OrderVisibilitySettings,
    parentDirPath?,
  ) => void;
  reflectRenameVisibility: (oldDirPath: string, newDirPath: string) => void;
  getDirectoryOrder: (
    path: string,
    dirs: Array<TS.FileSystemEntry>,
  ) => Promise<TS.FileSystemEntryMeta>;
  getFilesOrder: (
    entry: TS.FileSystemEntry,
    filesArray: Array<TS.FileSystemEntry>,
  ) => Promise<TS.FileSystemEntryMeta>;
  pushFileOrder: (
    path: string,
    file: TS.OrderVisibilitySettings,
    files?: Array<TS.OrderVisibilitySettings>,
  ) => Promise<TS.FileSystemEntryMeta>;
  reorderColumn: (
    entry: TS.FileSystemEntry,
    columnFiles?: TS.OrderVisibilitySettings[],
    filePath?: string,
  ) => Promise<TS.OrderVisibilitySettings[]>;
};

export const IOActionsContext = createContext<IOActionsContextData>({
  createDirectory: undefined,
  deleteEntries: undefined,
  deleteDirectory: undefined,
  deleteFile: undefined,
  moveDirs: undefined,
  moveFiles: undefined,
  copyDirs: undefined,
  copyFiles: undefined,
  downloadUrl: undefined,
  downloadFsEntry: undefined,
  uploadFilesAPI: undefined,
  uploadMeta: undefined,
  uploadFiles: undefined,
  renameDirectory: undefined,
  renameFile: undefined,
  openFileNatively: undefined,
  duplicateFile: undefined,
  saveCurrentLocationMetaData: undefined,
  saveMetaDataPromise: undefined,
  getMetadata: undefined,
  getMetadataID: undefined,
  saveFsEntryMeta: undefined,
  savePerspective: undefined,
  removeFolderCustomSettings: undefined,
  setAutoSave: undefined,
  setDescriptionChange: undefined,
  saveDirectoryPerspective: undefined,
  setBackgroundImageChange: undefined,
  setBackgroundColorChange: undefined,
  setThumbnailImageChange: undefined,
  setFolderBackgroundPromise: undefined,
  toggleDirVisibility: undefined,
  reflectRenameVisibility: undefined,
  getDirectoryOrder: undefined,
  getFilesOrder: undefined,
  pushFileOrder: undefined,
  reorderColumn: undefined,
});

export type IOActionsContextProviderProps = {
  children: React.ReactNode;
};

export const IOActionsContextProvider = ({
  children,
}: IOActionsContextProviderProps) => {
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const { showNotification } = useNotificationContext();
  const { selectedEntries, setSelectedEntries } = useSelectedEntriesContext();
  const {
    createDirectoryPromise,
    renameFilePromise,
    renameFilesPromise,
    moveFilesPromise,
    reflectMoveFiles,
    renameDirectoryPromise,
    copyFilePromise,
    copyFilesWithProgress,
    copyDirectoryPromise,
    moveDirectoryPromise,
    saveFilePromise,
    saveTextFilePromise,
    saveBinaryFilePromise,
    deleteEntriesPromise,
  } = usePlatformFacadeContext();
  const { setActions } = usePerspectiveActionsContext();
  const { setReflectActions } = useEditedEntryContext();
  const { setReflectMetaActions } = useEditedEntryMetaContext();
  const {
    currentDirectoryPath,
    openDirectory,
    getAllPropertiesPromise,
    setCurrentDirectoryDirs,
  } = useDirectoryContentContext();
  const { findLocation, getFirstRWLocation } = useCurrentLocationContext();
  const { reflectUpdateSidecarMeta } = useLocationIndexContext();
  const warningOpeningFilesExternally = useSelector(
    getWarningOpeningFilesExternally,
  );
  const author = useSelector(getAuthor);
  const revisionsEnabled = useSelector(isRevisionsEnabled);
  const prefixTagContainer = useSelector(getPrefixTagContainer);
  const filenameTagPlacedAtEnd = useSelector(getFileNameTagPlace);
  const tagDelimiter: string = useSelector(getTagDelimiter);
  //const firstRender = useFirstRender();
  const currentLocation = findLocation();

  /* useEffect(() => {
    if (!firstRender && actions && actions.length > 0) {
      for (const action of actions) {
        if (action.action === 'add') {
          // reflect visibility change on new KanBan column add
          if (
            action.entry &&
            !action.entry.isFile &&
            action.entry.meta?.perspective === 'kanban'
          ) {
            const dirPath = extractContainingDirectoryPath(
              action.entry.path,
              currentLocation?.getDirSeparator(),
            );
            if (
              cleanTrailingDirSeparator(
                cleanFrontDirSeparator(currentDirectoryPath),
              ) === cleanTrailingDirSeparator(cleanFrontDirSeparator(dirPath))
            ) {
              toggleDirVisibility(
                { name: action.entry.name, uuid: action.entry.uuid },
                dirPath,
              );
            }
          }
        }
      }
    }
  }, [actions]);*/

  function createDirectory(
    directoryPath: string,
    locationID?: string,
    reflect: boolean = true,
    open: boolean = true,
    skipSelection: boolean = false,
  ) {
    return createDirectoryPromise(
      directoryPath,
      locationID,
      reflect,
      open,
      skipSelection,
    )
      .then((result) => {
        if (result !== undefined && result.dirPath !== undefined) {
          // eslint-disable-next-line no-param-reassign
          directoryPath = result.dirPath;
        }
        console.log(`Creating directory ${directoryPath} successful.`);
        showNotification(
          `Creating directory ${extractDirectoryName(
            directoryPath,
            currentLocation?.getDirSeparator(),
          )} successful.`,
          'default',
          true,
        );
        return true;
      })
      .catch((error) => {
        console.log('Error creating directory: ' + error);
        showNotification(
          `Error creating directory '${extractDirectoryName(
            directoryPath,
            currentLocation?.getDirSeparator(),
          )}'`,
          'error',
          true,
        );
        return false;
        // dispatch stopLoadingAnimation
      });
  }

  function deleteEntries(...entries: TS.FileSystemEntry[]): Promise<boolean> {
    if (entries && entries.length > 0) {
      return deleteEntriesPromise(...entries)
        .then((success) => {
          const fileNames = entries
            .map((e) => {
              if (e.isFile) {
                deleteMeta(e.path, e.uuid);
              }
              return e.name;
            })
            .join(' ');
          if (success) {
            showNotification(
              t('deletingEntriesSuccessful', {
                dirPath: fileNames,
              }),
              'default',
              true,
            );
          } else {
            showNotification(
              t('deletingEntriesFailed', {
                dirPath: fileNames,
              }),
              'default',
              true,
            );
          }

          return success;
        })
        .catch((err) => {
          console.log('Deleting failed', err);
          return false;
        });
    }
  }

  function deleteDirectory(directoryPath: string) {
    return deleteEntriesPromise(currentLocation.toFsEntry(directoryPath, false))
      .then(() => {
        showNotification(
          t(
            'deletingDirectorySuccessfull' as any,
            {
              dirPath: extractDirectoryName(
                directoryPath,
                currentLocation?.getDirSeparator(),
              ),
            } as any,
          ) as string,
          'default',
          true,
        );
        return true;
      })
      .catch((error) => {
        console.log('Error while deleting directory: ' + error);
        showNotification(
          t(
            'errorDeletingDirectoryAlert' as any,
            {
              dirPath: extractDirectoryName(
                directoryPath,
                currentLocation?.getDirSeparator(),
              ),
            } as any,
          ) as string,
          'error',
          true,
        );
        return false;
        // dispatch stopLoadingAnimation
      });
  }

  function deleteMeta(filePath: string, uuid: string): Promise<boolean> {
    if (
      !filePath.endsWith(
        (currentLocation
          ? currentLocation.getDirSeparator()
          : AppConfig.dirSeparator) + AppConfig.metaFolder,
      )
    ) {
      // Delete revisions path
      const backupFilePath = getBackupFileLocation(
        filePath,
        uuid,
        currentLocation?.getDirSeparator(),
      );
      const backupPath = extractContainingDirectoryPath(
        backupFilePath,
        currentLocation?.getDirSeparator(),
      );
      const metaContentPath = getMetaContentFileLocation(
        filePath,
        currentLocation?.getDirSeparator(),
      );

      // Delete revisions, sidecar file and thumb, pdf content
      return deleteEntriesPromise(
        currentLocation.toFsEntry(backupPath, false),
        currentLocation.toFsEntry(
          getMetaFileLocationForFile(
            filePath,
            currentLocation?.getDirSeparator(),
          ),
          true,
        ),
        currentLocation.toFsEntry(
          getThumbFileLocationForFile(
            filePath,
            currentLocation?.getDirSeparator(),
            false,
          ),
          true,
        ),
        currentLocation.toFsEntry(metaContentPath, true),
      )
        .then(() => {
          console.log(
            'Cleaning revisions meta file and thumb successful for ' + filePath,
          );
          return true;
        })
        .catch((err) => {
          console.log('Cleaning meta file and thumb failed with ' + err);
          return false;
        });
    }
    return Promise.resolve(false);
  }

  function deleteFile(filePath: string, uuid: string) {
    return deleteEntriesPromise(currentLocation.toFsEntry(filePath, true))
      .then(() => {
        showNotification(
          `Deleting file ${filePath} successful.`,
          'default',
          true,
        );
        return deleteMeta(filePath, uuid).then(() => true);
      })
      .catch((error) => {
        console.log('Error while deleting file: ' + error);
        showNotification(
          `Error while deleting file ${filePath}`,
          'error',
          true,
        );
        return false;
      });
  }

  function moveDirs(
    dirPaths: Array<any>,
    targetPath: string,
    locationID: string,
    onProgress = undefined,
  ): Promise<boolean> {
    const progress = dirPaths.length > 10 ? undefined : onProgress;
    const promises = dirPaths.map(({ path, count }) => {
      const dirName = extractDirectoryName(
        path,
        currentLocation?.getDirSeparator(),
      );
      return moveDirectoryPromise(
        { path: path, total: count, locationID },
        joinPaths(currentLocation?.getDirSeparator(), targetPath, dirName),
        progress,
        false,
      )
        .then((newDirPath) => {
          // console.log('Moving dir from ' + path + ' to ' + targetPath);
          const action: TS.EditAction = {
            action: 'move',
            entry: currentLocation.toFsEntry(newDirPath, false),
            oldEntryPath: path,
          };
          return action;
        })
        .catch((err) => {
          console.log('Moving dirs failed ', err);
          showNotification(t('core:copyingFoldersFailed'));
          return undefined;
        });
    });
    return executePromisesInBatches(promises).then((actions) => {
      if (!progress) {
        const progresses = actions.map((action) =>
          action
            ? {
                path: action.entry.path,
                progress: 100,
              }
            : {
                path: action.entry.path,
                progress: 0,
              },
        );
        dispatch(AppActions.setProgresses(progresses));
      }
      setReflectActions(...actions.filter((value) => value !== undefined));
      return true;
    });
  }

  function moveFiles(
    paths: Array<string>,
    targetPath: string,
    locationID: string,
    onProgress = undefined,
    reflect = true,
    force = false,
  ): Promise<boolean> {
    const location = findLocation(locationID);
    const moveJobs = paths.map((path) => [
      path,
      normalizePath(targetPath) +
        location.getDirSeparator() +
        extractFileName(path, location.getDirSeparator()),
    ]);
    return moveFilesPromise(
      moveJobs,
      location.uuid,
      paths.length > 10 ? undefined : onProgress,
      false,
      force,
    )
      .then((moveArray) => {
        if (moveArray !== undefined && moveArray.length > 0) {
          setSelectedEntries([]);
          const moveError = moveArray.find((err) => err instanceof Error);
          if (!moveError) {
            showNotification(t('core:filesMovedSuccessful'));
            const moveMetaJobs = [];
            moveJobs.map((job) => {
              // Move revisions
              location
                .loadFileMetaDataPromise(job[0])
                .then((fsEntryMeta: TS.FileSystemEntryMeta) => {
                  if (fsEntryMeta.id) {
                    const backupDir = getBackupFileDir(
                      job[0],
                      fsEntryMeta.id,
                      location.getDirSeparator(),
                    );
                    const newBackupDir = getBackupFileDir(
                      job[1],
                      fsEntryMeta.id,
                      location.getDirSeparator(),
                    );
                    return moveDirectoryPromise(
                      { path: backupDir },
                      newBackupDir,
                    )
                      .then(() => {
                        console.log(
                          'Moving revisions successful from ' +
                            backupDir +
                            ' to ' +
                            newBackupDir,
                        );
                        return true;
                      })
                      .catch((err) => {
                        console.log('Moving revisions failed ', err);
                      });
                  }
                })
                .catch((err) => {
                  console.log('loadFileMetaDataPromise', err);
                });

              // move meta
              moveMetaJobs.push([
                getMetaFileLocationForFile(job[0], location.getDirSeparator()),
                getMetaFileLocationForFile(job[1], location.getDirSeparator()),
              ]);
              // move thumb
              moveMetaJobs.push([
                getThumbFileLocationForFile(
                  job[0],
                  location.getDirSeparator(),
                  false,
                ),
                getThumbFileLocationForFile(
                  job[1],
                  location.getDirSeparator(),
                  false,
                ),
              ]);
              // move pdf.txt
              moveMetaJobs.push([
                getMetaContentFileLocation(
                  job[0],
                  currentLocation?.getDirSeparator(),
                ),
                getMetaContentFileLocation(
                  job[1],
                  currentLocation?.getDirSeparator(),
                ),
              ]);
              return true;
            });
            return moveFilesPromise(
              moveMetaJobs,
              location.uuid,
              undefined,
              false,
              true,
            )
              .then(() => {
                console.log('Moving meta and thumbs successful');
                return reflect && reflectMoveFiles(moveJobs);
              })
              .catch((err) => {
                console.log('At least one meta or thumb was not moved ', err);
                return reflect && reflectMoveFiles(moveJobs);
              });
          } else {
            showNotification(
              t('core:copyingFilesFailed') + ' ' + moveError.message,
            );
            return false;
          }
        } else {
          showNotification(t('core:copyingFilesFailed'));
          return false;
        }
      })
      .catch((err) => {
        console.log('Moving files failed with ' + err);
        showNotification(t('core:copyingFilesFailed'));
        return false;
      });
  }

  function copyDirs(
    dirPaths: Array<any>,
    targetPath: string,
    locationID: string,
    onProgress = undefined,
  ): Promise<boolean> {
    const progress = dirPaths.length > 10 ? undefined : onProgress;
    const promises = dirPaths.map(({ path, count }) => {
      const dirName = extractDirectoryName(
        path,
        currentLocation?.getDirSeparator(),
      );
      return copyDirectoryPromise(
        { path: path, total: count, locationID },
        joinPaths(currentLocation?.getDirSeparator(), targetPath, dirName),
        progress,
        false,
      )
        .then((newDirPath) => {
          // console.log('Copy dir from ' + path + ' to ' + targetPath);
          return getAllPropertiesPromise(newDirPath).then(
            (fsEntry: TS.FileSystemEntry) => {
              const action: TS.EditAction = {
                action: 'add',
                entry: fsEntry, //toFsEntry(newDirPath, false),
              };
              return action;
            },
          );
        })
        .catch((err) => {
          console.log('Copy dirs failed ', err);
          showNotification(t('core:copyingFoldersFailed'));
          return undefined;
        });
    });
    return executePromisesInBatches(promises).then((actions) => {
      if (!progress) {
        const progresses = actions.map((action) =>
          action
            ? {
                path: action.entry.path,
                progress: 100,
              }
            : {
                path: action.entry.path,
                progress: 0,
              },
        );
        dispatch(AppActions.setProgresses(progresses));
      }
      setReflectActions(...actions.filter((value) => value !== undefined));
      return true;
    });
  }

  function copyFiles(
    paths: Array<string>,
    targetPath: string,
    locationID: string,
    onProgress,
  ): Promise<boolean> {
    return copyFilesWithProgress(
      paths,
      targetPath,
      locationID,
      paths.length > 10 ? undefined : onProgress,
    )
      .then((success) => {
        if (success) {
          showNotification(t('core:filesCopiedSuccessful'));
          const metaPaths = paths.flatMap((path) =>
            path.indexOf(
              AppConfig.dirSeparator +
                AppConfig.metaFolder +
                AppConfig.dirSeparator,
            ) !== -1
              ? []
              : [
                  getMetaFileLocationForFile(
                    path,
                    currentLocation?.getDirSeparator(),
                  ),
                  getThumbFileLocationForFile(
                    path,
                    currentLocation?.getDirSeparator(),
                    false,
                  ),
                ],
          );

          return copyFilesWithProgress(
            metaPaths,
            getMetaDirectoryPath(targetPath),
            locationID, //metaPaths.length > 10 ? undefined : onProgress,
            false,
          )
            .then(() => {
              paths.map((path) => {
                const location = findLocation(locationID);
                const targetFilePath =
                  normalizePath(targetPath) +
                  (location
                    ? location.getDirSeparator()
                    : AppConfig.dirSeparator) +
                  extractFileName(path, location?.getDirSeparator());
                setFileMetaId(locationID, targetFilePath, getUuid());
              });
              console.log('Copy meta and thumbs successful');
              return true;
            })
            .catch((err) => {
              console.log('At least one meta or thumb was not copied ' + err);
              return true;
            });
        }
        return false;
      })
      .catch((err) => {
        console.log('Copy files failed', err);
        showNotification(t('core:copyingFilesFailed') + ' ' + err.message);
        return false;
      });
  }

  function setFileMetaId(locationID: string, path: string, fileId: string) {
    const location = findLocation(locationID);
    location
      .loadMetaDataPromise(path)
      .then((fsEntryMeta: TS.FileSystemEntryMeta) => {
        if (fsEntryMeta.id) {
          return saveFsEntryMeta(location.toFsEntry(path, fsEntryMeta.isFile), {
            ...fsEntryMeta,
            id: fileId,
          });
        }
      })
      .catch(() => {});
  }

  function fetchUrl(url: string, targetPath: string, haveProgress: boolean) {
    if (AppConfig.isElectron) {
      return window.electronIO.ipcRenderer.invoke(
        'fetchUrl',
        url,
        targetPath,
        haveProgress,
      );
    }
    return fetch(url);
  }
  /**
   * @param url
   * @param targetPath
   * @param onDownloadProgress
   */
  function downloadUrl(
    url: string,
    targetPath: string,
    onDownloadProgress?: (progress, abort, fileName?) => void,
  ): Promise<TS.FileSystemEntry> {
    const location = currentLocation || getFirstRWLocation();
    function saveFile(response): Promise<TS.FileSystemEntry> {
      if (response.filePath) {
        //file is already saved
        return location.getPropertiesPromise(response.filePath);
      }
      if (AppConfig.isElectron && !location.haveObjectStoreSupport()) {
        return saveBinaryFilePromise(
          { path: targetPath },
          response.body,
          true,
          onDownloadProgress,
        );
      }
      return response.arrayBuffer().then((arrayBuffer) => {
        return saveFilePromise({ path: targetPath }, arrayBuffer, true);
      });
    }
    return fetchUrl(url, targetPath, onDownloadProgress !== undefined)
      .then((response) => saveFile(response))
      .then((fsEntry: TS.FileSystemEntry) => {
        return generateThumbnailPromise(
          location.haveObjectStoreSupport() ? url : fsEntry.path,
          fsEntry.size,
          location.loadTextFilePromise,
          location.getFileContentPromise,
          location.getThumbPath,
          location?.getDirSeparator(),
        ).then((dataURL) => {
          if (dataURL && dataURL.length > 6) {
            const baseString = dataURL.split(',').pop();
            const fileContent = base64ToBlob(baseString);
            return saveBinaryFilePromise(
              {
                path: getThumbFileLocationForFile(
                  targetPath,
                  location?.getDirSeparator(),
                  false,
                ),
              },
              fileContent,
              true,
            ).then((thumb: TS.FileSystemEntry) =>
              location.getThumbPath(thumb.path).then((thumbPath) => ({
                ...fsEntry,
                thumbPath: thumbPath,
              })),
            );
          }
          return fsEntry;
        });
      });
  }

  function downloadFsEntry(fsEntry: TS.FileSystemEntry) {
    const loc = findLocation(fsEntry.locationID);
    if (loc) {
      if (fsEntry.isEncrypted) {
        loc
          .getFileContentPromise(fsEntry.path, 'arraybuffer')
          .then((arrayBuffer) => {
            const url = window.URL || window.webkitURL;
            const openedEntryUrl = url.createObjectURL(new Blob([arrayBuffer]));
            const downloadResult = downloadFile(
              fsEntry.path,
              openedEntryUrl,
              currentLocation?.getDirSeparator(),
            );
            if (downloadResult === -1) {
              showNotification(t('core:cantDownloadLocalFile'));
            }
          });
      } else if (loc.haveObjectStoreSupport()) {
        loc.generateURLforPath(fsEntry.path, 86400).then((url) => {
          const downloadResult = downloadFile(
            fsEntry.path,
            url,
            currentLocation?.getDirSeparator(),
          );
          if (downloadResult === -1) {
            showNotification(t('core:cantDownloadLocalFile'));
          }
        });
      } else {
        const downloadResult = downloadFile(
          fsEntry.path,
          fsEntry.url,
          currentLocation?.getDirSeparator(),
        );
        if (downloadResult === -1) {
          showNotification(t('core:cantDownloadLocalFile'));
        }
      }
    }
  }
  /**
   * with HTML5 Files API
   * @param files
   * @param targetPath
   * @param onUploadProgress
   * @param uploadMeta - try to upload meta and thumbs if available
   * reader.onload not work for multiple files https://stackoverflow.com/questions/56178918/react-upload-multiple-files-using-window-filereader
   * @param open
   * @param targetLocationId
   * @param sourceLocationId
   */
  function uploadFilesAPI(
    files: Array<any>,
    targetPath: string,
    onUploadProgress?: (progress, abort, fileName?) => void,
    uploadMeta = true,
    open = true,
    targetLocationId: string = undefined,
    sourceLocationId: string = undefined,
  ): Promise<TS.FileSystemEntry[]> {
    if (onUploadProgress) {
      for (let i = 0; i < files.length; i += 1) {
        const key = cleanTrailingDirSeparator(targetPath) + '/' + files[i].name;
        onUploadProgress({ key: key, loaded: 0, total: 0 }, undefined);
      }
    }
    if (AppConfig.isElectron || AppConfig.isCordovaiOS) {
      return uploadFiles(
        files.map((f) => f.path),
        targetPath,
        onUploadProgress,
        uploadMeta,
        open,
        targetLocationId,
        sourceLocationId,
      );
    }

    return new Promise(async (resolve) => {
      const fsEntries = [];
      // -> cannot upload meta data (for every upload in web browser its need to have <input> element)
      await setupReader(0);

      async function setupReader(inx) {
        const file = files[inx];
        const reader = new FileReader();
        let fileName = file.name;
        try {
          fileName = decodeURIComponent(file.name);
        } catch (ex) {}
        let filePath = joinPaths(
          currentLocation?.getDirSeparator(),
          targetPath,
          fileName,
        );
        if (
          currentLocation?.haveObjectStoreSupport() &&
          (filePath.startsWith('\\') || filePath.startsWith('/'))
        ) {
          filePath = filePath.substr(1);
        }
        reader.onload = async (event: any) => {
          await readerLoaded(event, inx, filePath);
        };
        reader.readAsArrayBuffer(file);
      }

      async function readerLoaded(event, index, fileTargetPath) {
        const entryProps =
          await currentLocation.getPropertiesPromise(fileTargetPath);
        if (entryProps) {
          showNotification(
            'File with the same name already exist, importing skipped!',
            'warning',
            true,
          );
        } else {
          const result = event.currentTarget
            ? event.currentTarget.result
            : event.target.result;
          try {
            const fsEntry: TS.FileSystemEntry = await saveBinaryFilePromise(
              { path: fileTargetPath },
              new Uint8Array(result),
              true,
              onUploadProgress,
            );
            if (fsEntry) {
              // Generate Thumbnail
              const url =
                await currentLocation.getURLforPathInt(fileTargetPath);
              const thumbPath = await generateThumbnailPromise(
                url,
                fsEntry.size,
                currentLocation.loadTextFilePromise,
                currentLocation.getFileContentPromise,
                currentLocation.getThumbPath,
                currentLocation?.getDirSeparator(),
              )
                .then((dataURL) => {
                  if (dataURL && dataURL.length > 6) {
                    const baseString = dataURL.split(',').pop();
                    const fileContent = base64ToBlob(baseString);
                    const thumbPath = getThumbFileLocationForFile(
                      fileTargetPath,
                      currentLocation?.getDirSeparator(),
                      false,
                    );
                    return saveBinaryFilePromise(
                      { path: thumbPath },
                      fileContent,
                      true,
                      undefined,
                      'upload',
                    ).then(() => thumbPath);
                  }
                  return undefined;
                })
                .catch((err) => {
                  console.log('error generateThumbnail:', err);
                });
              if (thumbPath) {
                const tmbPath =
                  await currentLocation.getURLforPathInt(thumbPath);
                fsEntry.meta = {
                  ...fsEntry.meta,
                  thumbPath: tmbPath,
                };
              }
              fsEntries.push(fsEntry);
              showNotification(
                'File ' + fileTargetPath + ' successfully imported.',
                'default',
                true,
              );
              // dispatch(AppActions.reflectCreateEntry(fileTargetPath, true));
            }
          } catch (error) {
            console.log(
              'Uploading ' + fileTargetPath + ' failed with ' + error,
            );
            showNotification(
              'Importing file ' + fileTargetPath + ' failed.',
              'error',
              true,
            );
          }
        }

        // If there's a file left to load
        if (index < files.length - 1) {
          // Load the next file
          await setupReader(index + 1);
        } else {
          resolve(fsEntries);
        }
      }
    });
  }

  function uploadFile(
    filePath: string,
    fileType: string,
    fileContent: any,
    onUploadProgress?: (progress, response) => void,
    reflect: boolean = true,
    locationID: string = undefined,
    override = false,
  ): Promise<TS.FileSystemEntry> {
    return findLocation(locationID)
      .getPropertiesPromise(filePath)
      .then((entryProps) => {
        if (entryProps && !override) {
          showNotification(
            'File with the same name already exist, importing skipped!',
            'warning',
            true,
          );
          dispatch(AppActions.setProgress(filePath, -1, undefined));
        } else {
          // dispatch(AppActions.setProgress(filePath, progress));
          return saveBinaryFilePromise(
            { path: filePath, locationID: locationID },
            fileContent,
            true,
            onUploadProgress,
            reflect,
          )
            .then((fsEntry: TS.FileSystemEntry) => {
              // handle meta files
              if (fileType === 'meta') {
                try {
                  const data =
                    fileContent instanceof Uint8Array
                      ? new TextDecoder('utf-8')
                      : fileContent.toString();
                  fsEntry.meta = loadJSONString(data);
                } catch (e) {
                  console.debug('cannot parse entry meta');
                }
              } else if (fileType === 'thumb') {
                fsEntry.meta = {
                  ...(fsEntry.meta && fsEntry.meta),
                  thumbPath: fsEntry.path,
                };
              }

              return fsEntry;
            })
            .catch((err) => {
              console.log('Importing file ' + filePath + ' failed ', err);
              showNotification(
                'Importing file ' + filePath + ' failed.',
                'error',
                true,
              );
              return undefined;
            });
        }
        return undefined;
      })
      .catch((err) => {
        console.log('Error getting properties', err);
        return undefined;
      });
  }

  interface job {
    src: string;
    dst: string;
    type: 'meta' | 'thumb' | 'file';
    originalPathForThumb?: string;
  }
  /**
   * Uploads the “.meta” and thumbnail files.
   * Returns a Promise that resolves when *all* meta/thumb uploads settle.
   */
  function uploadMeta(
    paths: string[],
    targetPath: string,
    onUploadProgress?: (progress, response) => void,
    open = true,
    targetLocationId: string = undefined,
    sourceLocationId: string = undefined,
  ): Promise<TS.FileSystemEntry[]> {
    const metaJobs: job[] = [];
    const targetLocation = findLocation(targetLocationId);

    for (let i = 0; i < paths.length; i++) {
      const src = paths[i];
      let dst = joinPaths(
        targetLocation?.getDirSeparator(),
        targetPath,
        extractFileName(src),
      );
      // meta file
      metaJobs.push({
        src: getMetaFileLocationForFile(src),
        dst: getMetaFileLocationForFile(dst),
        type: 'meta',
      });

      // thumb file
      metaJobs.push({
        src: getThumbFileLocationForFile(src, undefined, false),
        dst: getThumbFileLocationForFile(dst, undefined, false),
        type: 'thumb',
        originalPathForThumb: src,
      });
    }
    return processUploadJobs(
      metaJobs,
      onUploadProgress,
      open,
      targetLocationId,
      sourceLocationId,
      true,
    ).then((entries) => {
      if (entries && entries.length > 0) {
        const filePaths = entries.map((entry) => {
          return getFileLocationFromMetaFile(entry.path);
        });
        const unique = [...new Set(filePaths)];
        const reflectActionsPromises: Promise<TS.EditAction>[] = unique.map(
          (path) => {
            return getAllPropertiesPromise(path, targetLocationId).then(
              (entry) => {
                return {
                  action: 'update',
                  entry: entry,
                  open: false,
                  oldEntryPath: entry.path,
                };
              },
            );
          },
        );
        Promise.all(reflectActionsPromises).then((reflectActions) => {
          setReflectActions(...reflectActions);
        });
      }
      return entries;
    });
  }

  /**
   * use with Electron only!
   * @param paths
   * @param targetPath
   * @param onUploadProgress
   * @param uploadMeta
   * @param open -> open files after upload
   * @param targetLocationId
   * @param sourceLocationId
   */
  function uploadFiles(
    paths: Array<string>,
    targetPath: string,
    onUploadProgress?: (progress, response) => void,
    uploadMeta = true,
    open = true,
    targetLocationId: string = undefined,
    sourceLocationId: string = undefined,
  ): Promise<TS.FileSystemEntry[]> {
    const uploadJobs: job[] = [];
    paths.map((path) => {
      let target = joinPaths(
        currentLocation?.getDirSeparator(),
        targetPath,
        extractFileName(path, AppConfig.dirSeparator),
      );
      uploadJobs.push({
        src: path,
        dst: target,
        type: 'file',
      });
      if (uploadMeta) {
        // copy meta
        uploadJobs.push({
          src: getMetaFileLocationForFile(path, AppConfig.dirSeparator),
          dst: getMetaFileLocationForFile(
            target,
            currentLocation?.getDirSeparator(),
          ),
          type: 'meta',
        });

        // thumb file
        uploadJobs.push({
          src: getThumbFileLocationForFile(path, AppConfig.dirSeparator),
          dst: getThumbFileLocationForFile(
            target,
            currentLocation?.getDirSeparator(),
            false,
          ),
          type: 'thumb',
          originalPathForThumb: path,
        });
      }
      return true;
    });
    return processUploadJobs(
      uploadJobs,
      onUploadProgress,
      open,
      targetLocationId,
      sourceLocationId,
    ).then((entries) => {
      const reflectActions: TS.EditAction[] = entries.map((entry) => ({
        action: 'add',
        entry: entry,
        open: open,
        source: 'upload',
      }));
      setReflectActions(...reflectActions);
      return entries;
    });
  }

  function processUploadJobs(
    uploadJobs: job[],
    onUploadProgress?: (progress, response) => void,
    open = true,
    targetLocationId: string = undefined,
    sourceLocationId: string = undefined,
    override = false,
  ): Promise<TS.FileSystemEntry[]> {
    return new Promise((resolve, reject) => {
      const jobsPromises: Promise<TS.FileSystemEntry>[] = uploadJobs.map(
        (job) => {
          // console.log("Selected File: "+JSON.stringify(selection.currentTarget.files[0]));
          // const file = selection.currentTarget.files[0];
          const filePath = job.dst;
          const fileType = job.type;
          const originalPathForThumb = job.originalPathForThumb;

          // TODO try to replace this with <input type="file"
          if (AppConfig.isElectron) {
            return findLocation(sourceLocationId)
              .getFileContentPromise(job.src, 'arraybuffer')
              .then((fileContent) =>
                uploadFile(
                  filePath,
                  fileType,
                  fileContent,
                  onUploadProgress,
                  false,
                  targetLocationId,
                  override,
                ),
              )
              .catch((err) => {
                if (
                  err &&
                  err.message &&
                  err.message.indexOf(
                    'Error: EISDIR: illegal operation on a directory, read',
                  ) > -1
                ) {
                  const errorMessage = t('core:uploadDirsNotSupported');
                  showNotification(errorMessage, 'warning', true);
                  dispatch(AppActions.setProgress(filePath, -1, errorMessage));
                }
                if (fileType === 'thumb' && originalPathForThumb) {
                  return generateThumbnailPromise(
                    originalPathForThumb,
                    0,
                    currentLocation.loadTextFilePromise,
                    currentLocation.getFileContentPromise,
                    currentLocation.getThumbPath,
                    currentLocation.getDirSeparator(),
                  ).then((dataURL) => {
                    if (dataURL && dataURL.length > 6) {
                      const baseString = dataURL.split(',').pop();
                      const fileContent = base64ToBlob(baseString);
                      return uploadFile(
                        filePath,
                        fileType,
                        fileContent,
                        onUploadProgress,
                        false,
                        targetLocationId,
                        override,
                      );
                    }
                    return undefined;
                  });
                }
              });
          }

          return undefined;
        },
      );
      Promise.allSettled(jobsPromises)
        .then((filesProm) => {
          const arrFiles: TS.FileSystemEntry[] = [];
          const arrMeta: TS.FileSystemEntry[] = [];

          filesProm.map((result) => {
            if (result.status !== 'rejected') {
              const file: TS.FileSystemEntry = result.value;
              if (file) {
                if (file.meta) {
                  arrMeta.push(file);
                } else {
                  arrFiles.push(file);
                }
              }
            }
            return true;
          });
          if (arrFiles.length > 0) {
            const numberOfFile = arrFiles.length;
            showNotification(
              numberOfFile + ' ' + 'file(s) successfully imported.',
              // 'Files: ' +
              //   arrFiles.map(file => file.name).toString() +
              //   ' successfully imported.',
              'default',
              true,
            );

            // Enhance entries
            const entriesEnhanced: Promise<TS.FileSystemEntry>[] = arrFiles.map(
              async (file: TS.FileSystemEntry) => {
                const metaFilePath = getMetaFileLocationForFile(
                  file.path,
                  AppConfig.dirSeparator,
                );

                const thumbFilePath = getThumbFileLocationForFile(
                  file.path,
                  AppConfig.dirSeparator,
                );
                if (metaFilePath !== undefined) {
                  for (let i = 0; i < arrMeta.length; i += 1) {
                    const metaFile = arrMeta[i];
                    const metaFilePath = metaFile.path.replace(/[/\\]/g, '');
                    if (metaFilePath === metaFilePath.replace(/[/\\]/g, '')) {
                      // eslint-disable-next-line no-param-reassign
                      file.meta = {
                        ...(file.meta && file.meta),
                        ...metaFile.meta,
                      };
                    } else if (
                      thumbFilePath &&
                      metaFilePath === thumbFilePath.replace(/[/\\]/g, '')
                    ) {
                      const thumbPath = await currentLocation.getURLforPathInt(
                        file.meta.thumbPath,
                      );
                      file.meta = {
                        ...(file.meta && file.meta),
                        thumbPath: thumbPath,
                      };
                    }
                  }
                }
                if (file.meta) {
                  const enhancedEntry: TS.FileSystemEntry = enhanceEntry(
                    file,
                    tagDelimiter,
                    currentLocation?.getDirSeparator(),
                  );
                  return enhancedEntry;
                }
                return file;
              },
            );
            Promise.all(entriesEnhanced).then((entries) => {
              resolve(entries);
            });
          } else {
            reject(undefined);
          }
          return true;
        })
        .catch((err) => {
          console.log('Error import fs: ' + err);
          reject(err);
        });
    });
  }

  function renameDirectory(
    directoryPath: string,
    newDirectoryName: string,
    locationID: string,
  ): Promise<string> {
    return renameDirectoryPromise(
      { path: directoryPath, locationID },
      newDirectoryName,
    )
      .then((newDirPath) => {
        if (currentDirectoryPath === directoryPath) {
          openDirectory(newDirPath);
        }

        showNotification(
          `Renaming directory ${extractDirectoryName(
            directoryPath,
            currentLocation?.getDirSeparator(),
          )} successful.`,
          'default',
          true,
        );
        return newDirPath;
      })
      .catch((error) => {
        console.log('Error while renaming directory: ' + error);
        showNotification(
          `Error renaming directory '${extractDirectoryName(
            directoryPath,
            currentLocation?.getDirSeparator(),
          )}'`,
          'error',
          true,
        );
        throw error;
      });
  }

  function renameFile(
    filePath: string,
    newFilePath: string,
    locationID: string,
    reflect = true,
  ): Promise<boolean> {
    return renameFilePromise(
      filePath,
      newFilePath,
      locationID,
      undefined,
      false,
    )
      .then(() => {
        // const newFilePathFromPromise = result[1];
        console.info('File renamed ' + filePath + ' to ' + newFilePath);
        showNotification(t('core:renamingSuccessfully'), 'default', true);
        // Update sidecar file and thumb
        return renameFilesPromise(
          [
            [
              getMetaFileLocationForFile(
                filePath,
                currentLocation?.getDirSeparator(),
              ),
              getMetaFileLocationForFile(
                newFilePath,
                currentLocation?.getDirSeparator(),
              ),
            ],
            [
              getThumbFileLocationForFile(
                filePath,
                currentLocation?.getDirSeparator(),
                false,
              ),
              getThumbFileLocationForFile(
                newFilePath,
                currentLocation?.getDirSeparator(),
                false,
              ),
            ],
            [
              getMetaContentFileLocation(
                filePath,
                currentLocation?.getDirSeparator(),
              ),
              getMetaContentFileLocation(
                newFilePath,
                currentLocation?.getDirSeparator(),
              ),
            ],
          ],
          locationID,
          undefined,
          false,
        )
          .then(() => {
            console.info(
              'Renaming meta file and thumb successful from ' +
                filePath +
                ' to:' +
                newFilePath,
            );
            if (reflect) {
              return getAllPropertiesPromise(newFilePath).then(
                (fsEntry: TS.FileSystemEntry) => {
                  if (reflect) {
                    setReflectActions({
                      action: 'update',
                      entry: fsEntry,
                      oldEntryPath: filePath,
                    });
                  }
                  return true;
                },
              );
            }
            return true;
          })
          .catch((err) => {
            console.log(
              'Renaming meta file and thumb failed from ' +
                filePath +
                ' to:' +
                newFilePath,
              err,
            );
            return false;
          });
      })
      .catch((error) => {
        console.log(`Error while renaming file ${filePath}`, error);
        showNotification(
          `Error while renaming file ${filePath}: ` + error.message,
          'error',
          true,
        );
        return false;
      });
  }

  function openFileNatively(selectedFile?: string) {
    if (selectedFile === undefined) {
      if (selectedEntries && selectedEntries.length > 0) {
        const fsEntry = selectedEntries[selectedEntries.length - 1];
        openFsEntryNatively(fsEntry);
      }
    } else {
      openFsEntryNatively(currentLocation.toFsEntry(selectedFile, true));
    }
  }

  function openFsEntryNatively(fsEntry: TS.FileSystemEntry) {
    if (fsEntry.isFile) {
      if (AppConfig.isCordova) {
        currentLocation.openFile(fsEntry);
      } else {
        openFileMessage(fsEntry.path, warningOpeningFilesExternally);
      }
    } else {
      openDirectoryMessage(fsEntry.path);
    }
  }

  function duplicateFile(selectedFilePath: string) {
    if (selectedFilePath) {
      const dirPath = extractContainingDirectoryPath(
        selectedFilePath,
        currentLocation?.getDirSeparator(),
      );

      const fileName = extractFileName(
        selectedFilePath,
        currentLocation?.getDirSeparator(),
      );

      const extractedTags = extractTags(
        selectedFilePath,
        tagDelimiter,
        currentLocation?.getDirSeparator(),
      );
      extractedTags.push('copy');
      extractedTags.push(formatDateTime4Tag(new Date(), true));

      const newFilePath = joinPaths(
        currentLocation?.getDirSeparator(),
        dirPath,
        generateFileName(
          fileName,
          extractedTags,
          tagDelimiter,
          currentLocation?.getDirSeparator(),
          prefixTagContainer,
          filenameTagPlacedAtEnd,
        ),
      );

      copyFilePromise(selectedFilePath, newFilePath)
        /*.then(() => {
          return openDirectory(dirPath);
        })*/
        .catch((error) => {
          showNotification('Error creating duplicate: ' + error.message);
        });
    } else {
      showNotification('Unable to duplicate, no file selected');
    }
  }

  function saveCurrentLocationMetaData(
    path: string,
    metaData: any,
  ): Promise<TS.FileSystemEntryMeta> {
    return currentLocation
      .checkFileEncryptedPromise(path)
      .then((encryption) =>
        currentLocation
          .getPropertiesPromise(path, encryption)
          .then((entryProperties) =>
            saveMetaDataPromise(entryProperties, metaData),
          ),
      );
  }
  /**
   * @param entry
   * @param metaData - this will override existing meta data
   */
  async function saveMetaDataPromise(
    entry: TS.FileSystemEntry,
    metaData: any,
    reflect = true,
  ): Promise<TS.FileSystemEntryMeta> {
    const location = findLocation(entry.locationID);
    //const cleanedMetaData = cleanMetaData(metaData);
    if (entry) {
      let metaFilePath;
      if (entry.isFile) {
        metaFilePath = getMetaFileLocationForFile(
          entry.path,
          location.getDirSeparator(),
        );
        // check and create meta folder if not exist
        const metaFolder = getMetaDirectoryPath(
          extractContainingDirectoryPath(
            entry.path,
            location.getDirSeparator(),
          ),
          location.getDirSeparator(),
        );
        const metaExist = await location.getPropertiesPromise(metaFolder);
        if (!metaExist) {
          await createDirectoryPromise(metaFolder, location.uuid);
        }
      } else {
        // check and create meta folder if not exist
        // todo not need to check if folder exist first createDirectoryPromise() recursively will skip creation of existing folders https://nodejs.org/api/fs.html#fs_fs_mkdir_path_options_callback
        const metaDirectoryPath = getMetaDirectoryPath(
          entry.path,
          location.getDirSeparator(),
        );
        const metaDirectoryProperties =
          await location.getPropertiesPromise(metaDirectoryPath);
        if (!metaDirectoryProperties) {
          await createDirectoryPromise(metaDirectoryPath, location.uuid, false);
        }

        metaFilePath = getMetaFileLocationForDir(
          entry.path,
          location.getDirSeparator(),
        );
      }
      const meta = mergeFsEntryMeta(metaData);
      const content = JSON.stringify(cleanMetaData(meta));
      return saveTextFilePromise(
        { path: metaFilePath, locationID: entry.locationID },
        content,
        reflect,
      )
        .then((success) => {
          if (success) {
            reflectUpdateSidecarMeta(entry.path, meta);
          }
          return meta;
        })
        .catch((err) => {
          console.log('Error ' + entry.path + ' with ' + err);
          showNotification('Error: ' + err.message, 'error', true);
          return undefined;
        });
    }
    return Promise.reject(new Error('file not found' + entry.path));
  }

  /**
   * @param path
   * @param id FileSystemEntry.uuid
   * @param location
   */
  function getMetadataID(
    path: string,
    id: string,
    location: CommonLocation,
  ): Promise<string> {
    return getMetadata(path, id, location).then((metaData) => metaData.id);
  }

  function getMetadata(
    path: string,
    id: string,
    location: CommonLocation,
  ): Promise<TS.FileSystemEntryMeta> {
    return location
      .loadMetaDataPromise(path)
      .then((fsEntryMeta: TS.FileSystemEntryMeta) => {
        if (fsEntryMeta.id) {
          return fsEntryMeta;
        } else {
          return saveFsEntryMeta(location.toFsEntry(path, fsEntryMeta.isFile), {
            ...fsEntryMeta,
            id: id,
          }).then((fsEntryMeta) => fsEntryMeta);
        }
      })
      .catch(() => {
        if (
          path.indexOf(location.getDirSeparator() + AppConfig.metaFolder) ===
            -1 &&
          path.indexOf(AppConfig.metaFolder + location.getDirSeparator()) === -1
        ) {
          // create new meta id to not be changed -> next time listDirectory will get the same id for the file from meta
          const mataData = { id: id };
          const metaFilePath = path.endsWith(location.getDirSeparator())
            ? getMetaFileLocationForDir(path, location.getDirSeparator())
            : getMetaFileLocationForFile(path, location.getDirSeparator());

          return saveTextFilePromise(
            { path: metaFilePath, locationID: location.uuid },
            JSON.stringify(mataData),
            false,
          )
            .then(() => mataData)
            .catch((e) => {
              console.error(e);
              return mataData;
            });
        } else {
          return { id: id };
        }
      });
  }

  /*function createFsEntryMeta(
    entry: TS.FileSystemEntry,
    props: any = {},
  ): Promise<string> {
    const newFsEntryMeta: TS.FileSystemEntryMeta = mergeFsEntryMeta(props);
    return saveMetaDataPromise(entry, newFsEntryMeta)
      .then(() => newFsEntryMeta.id)
      .catch((error) => {
        console.log(
          'Error saveMetaDataPromise for ' +
            entry.path +
            ' orphan id: ' +
            newFsEntryMeta.id,
          error,
        );
        return newFsEntryMeta.id;
      });
  }*/

  function saveFsEntryMeta(
    entry: TS.FileSystemEntry,
    meta: any,
  ): Promise<TS.FileSystemEntryMeta> {
    const location = findLocation(entry.locationID);
    return location
      .loadMetaDataPromise(entry.path)
      .then((fsEntryMeta) => {
        if (
          Pro &&
          revisionsEnabled &&
          !isMeta(entry.path) &&
          meta.description !== undefined
        ) {
          const uuid = entry.isFile ? entry.uuid : entry.meta?.id;
          getMetadataID(entry.path, uuid, location).then((id) => {
            if (fsEntryMeta && fsEntryMeta.description) {
              const backupDir = getBackupDir(entry);
              location.listDirectoryPromise(backupDir, []).then((backup) => {
                const haveBackup = backup.some((b) => b.path.endsWith('.meta'));
                if (!haveBackup) {
                  // init description
                  const targetPath = entry.isFile
                    ? getBackupFileLocation(
                        entry.path,
                        id,
                        location.getDirSeparator(),
                      )
                    : getBackupFolderLocation(
                        entry.path,
                        id,
                        location.getDirSeparator(),
                      );
                  saveTextFilePromise(
                    {
                      path: targetPath + '.meta',
                      locationID: entry.locationID,
                    },
                    JSON.stringify({ description: fsEntryMeta?.description }),
                    false,
                  );
                }
              });
            }
            // wait 5ms in order ot get older timestamp
            setTimeout(() => {
              const targetPath = entry.isFile
                ? getBackupFileLocation(
                    entry.path,
                    id,
                    location.getDirSeparator(),
                  )
                : getBackupFolderLocation(
                    entry.path,
                    id,
                    location.getDirSeparator(),
                  );
              saveTextFilePromise(
                { path: targetPath + '.meta', locationID: entry.locationID },
                JSON.stringify({
                  description: meta.description,
                  ...(author && { author: author }),
                }),
                false,
              );
            }, 5);
          });
        }
        return saveMetaDataPromise(entry, {
          ...fsEntryMeta,
          ...meta,
          lastUpdated: new Date().getTime(),
        });
      })
      .catch(() => {
        return saveMetaDataPromise(entry, mergeFsEntryMeta(meta));
      });
  }

  function savePerspective(
    entry: TS.FileSystemEntry,
    perspective: TS.PerspectiveType,
  ): Promise<TS.FileSystemEntryMeta> {
    return new Promise((resolve, reject) => {
      findLocation(entry.locationID)
        .loadMetaDataPromise(entry.path)
        .then((fsEntryMeta: TS.FileSystemEntryMeta) => {
          let updatedFsEntryMeta: TS.FileSystemEntryMeta;
          if (perspective && perspective !== 'unspecified') {
            updatedFsEntryMeta = {
              ...fsEntryMeta,
              perspective,
            };
          } else {
            const { perspective: remove, ...rest } = fsEntryMeta;
            updatedFsEntryMeta = rest;
          }
          saveMetaDataPromise(entry, updatedFsEntryMeta)
            .then(() => {
              resolve(updatedFsEntryMeta);
              return true;
            })
            .catch((err) => {
              console.log(
                'Error adding perspective for ' + entry.path + ' with ' + err,
              );
              reject();
            });
          return true;
        })
        .catch(() => {
          const newFsEntryMeta: TS.FileSystemEntryMeta = mergeFsEntryMeta({
            perspective,
          });
          saveMetaDataPromise(entry, newFsEntryMeta)
            .then(() => {
              resolve(newFsEntryMeta);
              return true;
            })
            .catch((error) => {
              console.log(
                'Error adding perspective for ' + entry.path + ' with ' + error,
              );
              reject();
            });
        });
    });
  }

  function removeFolderCustomSettings(
    path: string,
    perspective: string,
  ): Promise<TS.FileSystemEntryMeta> {
    return new Promise((resolve, reject) => {
      currentLocation
        .loadMetaDataPromise(path)
        .then((fsEntryMeta: TS.FileSystemEntryMeta) => {
          let updatedFsEntryMeta: TS.FileSystemEntryMeta = {
            ...(fsEntryMeta && fsEntryMeta),
            perspectiveSettings: {
              ...(fsEntryMeta &&
                fsEntryMeta.perspectiveSettings &&
                fsEntryMeta.perspectiveSettings),
              [perspective]: undefined,
            },
          };

          saveCurrentLocationMetaData(path, updatedFsEntryMeta)
            .then(() => {
              resolve(updatedFsEntryMeta);
              return true;
            })
            .catch((err) => {
              console.log('Error ' + path + ' with ' + err);
              reject();
            });
          return true;
        })
        .catch(() => {
          const newFsEntryMeta: TS.FileSystemEntryMeta = mergeFsEntryMeta({
            perspectiveSettings: {
              [perspective]: undefined,
            },
          });
          saveCurrentLocationMetaData(path, newFsEntryMeta)
            .then(() => {
              resolve(newFsEntryMeta);
              return true;
            })
            .catch((error) => {
              console.log('Error ' + path + ' with ' + error);
              reject();
            });
        });
    });
  }

  function setAutoSave(entry: TS.FileSystemEntry, autoSave: boolean) {
    return saveFsEntryMeta(entry, { autoSave }).then((meta) => {
      if (meta) {
        const action: TS.EditMetaAction = {
          action: 'autoSaveChange',
          entry: {
            ...entry,
            meta: { ...(entry.meta && entry.meta), ...meta },
          },
        };
        setReflectMetaActions(action);
        return true;
      }
      return false;
    });
  }

  function saveDirectoryPerspective(
    entry: TS.FileSystemEntry,
    perspective: TS.PerspectiveType,
  ): Promise<boolean> {
    return saveFsEntryMeta(entry, { perspective }).then((meta) => {
      if (meta) {
        const action: TS.EditMetaAction = {
          action: 'perspectiveChange',
          entry: {
            ...entry,
            meta: { ...(entry.meta && entry.meta), ...meta },
          },
        };
        setReflectMetaActions(action);
        return true;
      }
      return false;
    });
  }

  function setDescriptionChange(
    entry: TS.FileSystemEntry,
    description: string,
  ): Promise<boolean> {
    return saveFsEntryMeta(entry, { description }).then((meta) => {
      if (meta) {
        const action: TS.EditMetaAction = {
          action: 'descriptionChange',
          entry: {
            ...entry,
            meta: { ...(entry.meta && entry.meta), ...meta },
          },
        };
        setReflectMetaActions(action);
        return true;
      }
      return false;
    });
  }

  function setBackgroundImageChange(entry: TS.FileSystemEntry) {
    if (
      currentLocation?.haveObjectStoreSupport() ||
      currentLocation?.haveWebDavSupport()
    ) {
      // reload cache
      const folderBgndPath = getBgndFileLocationForDirectory(
        entry.path,
        currentLocation?.getDirSeparator(),
      );
      currentLocation
        .generateURLforPath(folderBgndPath, 604800)
        .then(() => setBackgroundImageChangeAction(entry));
    } else {
      setBackgroundImageChangeAction(entry);
    }
  }

  function setBackgroundImageChangeAction(entry: TS.FileSystemEntry) {
    const action: TS.EditMetaAction = {
      action: 'bgdImgChange',
      entry: {
        ...entry,
        meta: {
          ...(entry.meta && entry.meta),
          lastUpdated: new Date().getTime(),
        },
      },
    };
    setReflectMetaActions(action);
  }

  function setBackgroundColorChange(
    entry: TS.FileSystemEntry,
    color: string,
  ): Promise<boolean> {
    return saveFsEntryMeta(entry, { color }).then((meta) => {
      if (meta) {
        const action: TS.EditMetaAction = {
          action: 'bgdColorChange',
          entry: {
            ...entry,
            meta: { ...(entry.meta && entry.meta), ...meta },
          },
        };
        setReflectMetaActions(action);
        return true;
      }
      return false;
    });
  }

  function setThumbnailImageChange(entry: TS.FileSystemEntry) {
    const location = findLocation(entry.locationID);
    if (
      location &&
      (location?.haveObjectStoreSupport() || location?.haveWebDavSupport())
    ) {
      // reload cache
      if (entry.isFile) {
        location.delUrlCache(entry.meta.thumbPath);
        setThumbnailImageChangeAction(entry);
      } else {
        // reload cache for folder
        const folderThumbPath = getThumbFileLocationForDirectory(
          entry.path,
          location?.getDirSeparator(),
        );
        location
          .generateURLforPath(folderThumbPath, 604800)
          .then(() => setThumbnailImageChangeAction(entry));
      }
    } else {
      setThumbnailImageChangeAction(entry);
    }
  }

  function setThumbnailImageChangeAction(entry: TS.FileSystemEntry) {
    const action: TS.EditMetaAction = {
      action: 'thumbChange',
      entry: {
        ...entry,
        meta: { ...entry.meta, lastUpdated: new Date().getTime() },
      },
    };
    setReflectMetaActions(action);
  }

  /**
   * @param filePath
   * @param directoryPath
   * return Promise<directoryPath> of directory in order to open Folder properties next
   */
  function setFolderBackgroundPromise(
    filePath: string,
    directoryPath: string,
  ): Promise<string> {
    const folderBgndPath = getBgndFileLocationForDirectory(
      directoryPath,
      currentLocation?.getDirSeparator(),
    );

    return generateImageThumbnail(
      filePath,
      currentLocation.getFileContentPromise,
      currentLocation?.getDirSeparator(),
      AppConfig.maxBgndSize,
    ) // 4K -> 3840, 2K -> 2560
      .then((base64Image) => {
        if (base64Image) {
          const data = base64ToBlob(base64Image.split(',').pop());
          return saveBinaryFilePromise({ path: folderBgndPath }, data, true)
            .then(() => {
              // props.setLastBackgroundImageChange(new Date().getTime());
              return directoryPath;
            })
            .catch((error) => {
              console.log('Save to file failed ', error);
              return Promise.reject(error);
            });
        }
      })
      .catch((error) => {
        console.log('Background generation failed ', error);
        return Promise.reject(error);
      });
  }

  /**
   *
   * @param entry
   * @param columnFiles if = undefined toTop ordered
   * @param filePath
   */
  function reorderColumn(
    entry: TS.FileSystemEntry,
    columnFiles: TS.OrderVisibilitySettings[] = undefined,
    filePath = undefined,
  ): Promise<TS.OrderVisibilitySettings[]> {
    const dirPath = extractContainingDirectoryPath(
      filePath ? filePath : entry.path,
    );

    return pushFileOrder(
      dirPath,
      {
        uuid: entry.uuid,
        name: extractFileName(entry.path, currentLocation?.getDirSeparator()),
      },
      columnFiles,
    )
      .then((updatedFsEntryMeta) => {
        return saveCurrentLocationMetaData(dirPath, updatedFsEntryMeta)
          .then(() => {
            return updatedFsEntryMeta.customOrder.files;
          })
          .catch((err) => {
            console.log('Error adding files for ' + dirPath + ' with ' + err);
            return undefined;
          });
      })
      .catch((error) => {
        console.log('Error reorderTop ' + error);
        return undefined;
      });
  }

  function toggleDirVisibility(
    dir: TS.OrderVisibilitySettings,
    parentDirPath: string = undefined,
  ) {
    if (Pro) {
      const currentDirPath = parentDirPath
        ? parentDirPath
        : currentDirectoryPath;
      toggleDirectoryVisibility(currentDirPath, dir).then(
        (updatedFsEntryMeta) => {
          if (updatedFsEntryMeta) {
            saveCurrentLocationMetaData(currentDirPath, updatedFsEntryMeta)
              .then(() => {
                const folders = updatedFsEntryMeta.customOrder?.folders;
                if (folders) {
                  setCurrentDirectoryDirs(folders);
                }
                const action: TS.PerspectiveActions = { action: 'reload' };
                setActions(action);
              })
              .catch((err) => {
                console.log(
                  'Error adding dirs for ' + currentDirPath + ' with ' + err,
                );
              });
          }
        },
      );
    }
  }

  /**
   * @param currentDirPath
   * @param dir
   * return updatedFsEntryMeta
   */
  function toggleDirectoryVisibility(
    currentDirPath: string,
    dir: TS.OrderVisibilitySettings,
  ): Promise<TS.FileSystemEntryMeta> {
    return getMetadata(currentDirPath, dir.uuid, currentLocation)
      .then((fsEntryMeta) => {
        const customOrder: TS.CustomOrder = fsEntryMeta.customOrder
          ? fsEntryMeta.customOrder
          : {};

        let dirs: TS.OrderVisibilitySettings[] = [dir];
        if (customOrder.folders && customOrder.folders.length > 0) {
          const index = customOrder.folders.findIndex(
            (col) => col.name === dir.name,
          );
          if (index !== -1) {
            customOrder.folders.splice(index, 1);
            dirs = customOrder.folders;
          } else {
            dirs = [...customOrder.folders, dir];
          }
        }

        return {
          ...fsEntryMeta,
          customOrder: { ...customOrder, folders: dirs },
        };
      })
      .catch((ex) => {
        console.log(ex);
        return mergeFsEntryMeta({
          customOrder: { folders: [dir] },
        });
      });
  }

  function reflectRenameVisibility(
    oldDirPath: string,
    newDirPath: string,
  ): void {
    if (oldDirPath !== newDirPath) {
      const parentDirectory = extractContainingDirectoryPath(
        //extractParentDirectoryPath(
        oldDirPath,
        currentLocation?.getDirSeparator(),
      );
      const oldDir = extractDirectoryName(
        oldDirPath,
        currentLocation?.getDirSeparator(),
      );
      currentLocation
        .loadMetaDataPromise(parentDirectory)
        .then((fsEntryMeta) => {
          const customOrder: TS.CustomOrder = fsEntryMeta.customOrder
            ? fsEntryMeta.customOrder
            : {};

          //let dirs: TS.OrderVisibilitySettings[] = [dir];
          if (customOrder.folders && customOrder.folders.length > 0) {
            const index = customOrder.folders.findIndex(
              (col) => col.name === oldDir,
            );
            if (index !== -1) {
              const newDir = extractDirectoryName(
                newDirPath,
                currentLocation?.getDirSeparator(),
              );
              customOrder.folders[index] = {
                ...customOrder.folders[index],
                name: newDir,
              };
              const updatedFsEntryMeta = {
                ...fsEntryMeta,
                customOrder: { ...customOrder, folders: customOrder.folders },
              };

              saveCurrentLocationMetaData(parentDirectory, updatedFsEntryMeta)
                .then(() => {
                  const folders = updatedFsEntryMeta.customOrder?.folders;
                  if (folders) {
                    setCurrentDirectoryDirs(folders);
                  }
                  const action: TS.PerspectiveActions = { action: 'reload' };
                  setActions(action);
                })
                .catch((err) => {
                  console.log(
                    'Error adding dirs for ' + parentDirectory + ' with ' + err,
                  );
                });
            }
          }
        })
        .catch((ex) => {
          console.log(ex);
        });
    }
  }

  function getDirectoryOrder(
    path: string,
    dirs: Array<TS.FileSystemEntry>,
  ): Promise<TS.FileSystemEntryMeta> {
    const dirsArray: Array<TS.OrderVisibilitySettings> = dirs
      .filter((dir) => dir !== undefined)
      .map((dir) => ({ uuid: dir.uuid, name: dir.name }));
    return currentLocation
      .loadMetaDataPromise(path)
      .then((fsEntryMeta) => {
        const customOrder: TS.CustomOrder = fsEntryMeta.customOrder
          ? fsEntryMeta.customOrder
          : {};

        return {
          ...fsEntryMeta,
          customOrder: { ...customOrder, folders: dirsArray },
        };
      })
      .catch(() => {
        return {
          id: getUuid(),
          customOrder: { folders: dirsArray },
        };
      });
  }

  function getFilesOrder(
    entry: TS.FileSystemEntry,
    filesArray: Array<TS.FileSystemEntry>,
  ): Promise<TS.FileSystemEntryMeta> {
    const files: Array<TS.OrderVisibilitySettings> = filesArray
      .filter((f) => f.isFile)
      .map((file) => ({
        uuid: file.uuid,
        name: file.name,
      }));
    return currentLocation
      .loadMetaDataPromise(entry.path)
      .then((fsEntryMeta) => {
        const customOrder: TS.CustomOrder = fsEntryMeta.customOrder
          ? fsEntryMeta.customOrder
          : {};
        return {
          ...fsEntryMeta,
          customOrder: { ...customOrder, files: files },
        };
      })
      .catch(() => {
        return {
          id: entry.uuid || getUuid(),
          customOrder: { files: files },
        };
      });
  }

  /**
   * @param path
   * @param file
   * @param files === undefined toTop else toBottom
   */
  function pushFileOrder(
    path: string,
    file: TS.OrderVisibilitySettings,
    files: Array<TS.OrderVisibilitySettings> = undefined,
  ): Promise<TS.FileSystemEntryMeta> {
    return currentLocation
      .loadMetaDataPromise(path)
      .then((fsEntryMeta) => {
        const customOrder: TS.CustomOrder = fsEntryMeta.customOrder
          ? fsEntryMeta.customOrder
          : {};
        const customOrderFiles = customOrder.files
          ? customOrder.files.filter((f) => f.name !== file.name)
          : [];
        const orderFiles = files
          ? [
              ...customOrderFiles,
              ...files.filter(
                (f) =>
                  f.name !== file.name &&
                  !customOrderFiles.some((ff) => ff.name === f.name),
              ),
              file,
            ]
          : [file, ...customOrderFiles];

        return {
          ...fsEntryMeta,
          customOrder: { ...customOrder, files: orderFiles },
        };
      })
      .catch(() => {
        const orderFiles = files
          ? [...files.filter((f) => f.name !== file.name), file]
          : [file];
        return {
          id: getUuid(),
          customOrder: { files: orderFiles },
        };
      });
  }

  const context = useMemo(() => {
    return {
      createDirectory,
      deleteEntries,
      deleteDirectory,
      deleteFile,
      moveDirs,
      moveFiles,
      copyDirs,
      copyFiles,
      downloadUrl,
      downloadFsEntry,
      uploadFilesAPI,
      uploadFiles,
      uploadMeta,
      renameDirectory,
      renameFile,
      openFileNatively,
      duplicateFile,
      saveCurrentLocationMetaData,
      saveMetaDataPromise,
      getMetadata,
      getMetadataID,
      saveFsEntryMeta,
      savePerspective,
      removeFolderCustomSettings,
      setAutoSave,
      setDescriptionChange,
      saveDirectoryPerspective,
      setBackgroundImageChange,
      setBackgroundColorChange,
      setThumbnailImageChange,
      setFolderBackgroundPromise,
      toggleDirVisibility,
      reflectRenameVisibility,
      getDirectoryOrder,
      getFilesOrder,
      pushFileOrder,
      reorderColumn,
    };
  }, [
    warningOpeningFilesExternally,
    currentDirectoryPath,
    filenameTagPlacedAtEnd,
  ]);

  return (
    <IOActionsContext.Provider value={context}>
      {children}
    </IOActionsContext.Provider>
  );
};
