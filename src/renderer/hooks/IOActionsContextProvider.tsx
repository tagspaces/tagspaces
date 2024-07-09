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

import React, { createContext, useEffect, useMemo } from 'react';
import { formatDateTime4Tag } from '@tagspaces/tagspaces-common/misc';
import { useTranslation } from 'react-i18next';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import {
  extractContainingDirectoryPath,
  extractDirectoryName,
  extractFileName,
  getBackupFileDir,
  getBackupFileLocation,
  getMetaDirectoryPath,
  getMetaFileLocationForFile,
  getMetaFileLocationForDir,
  getThumbFileLocationForFile,
  getBgndFileLocationForDirectory,
  getThumbFileLocationForDirectory,
  joinPaths,
  normalizePath,
  extractTags,
  cleanTrailingDirSeparator,
  cleanFrontDirSeparator,
  generateFileName,
  extractParentDirectoryPath,
} from '@tagspaces/tagspaces-common/paths';
import { getUuid } from '@tagspaces/tagspaces-common/utils-io';
import { actions as AppActions, AppDispatch } from '-/reducers/app';
import { useDispatch, useSelector } from 'react-redux';
import {
  cleanMetaData,
  executePromisesInBatches,
  mergeFsEntryMeta,
  openDirectoryMessage,
  openFileMessage,
} from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import { Progress } from 'aws-sdk/clients/s3';
import AppConfig from '-/AppConfig';
import {
  generateImageThumbnail,
  generateThumbnailPromise,
} from '-/services/thumbsgenerator';
import { base64ToBlob } from '-/utils/dom';
import {
  enhanceEntry,
  loadJSONString,
} from '@tagspaces/tagspaces-common/utils-io';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import {
  getFileNameTagPlace,
  getPrefixTagContainer,
  getWarningOpeningFilesExternally,
} from '-/reducers/settings';
import { usePlatformFacadeContext } from '-/hooks/usePlatformFacadeContext';
import { useEditedEntryContext } from '-/hooks/useEditedEntryContext';
import { useEditedEntryMetaContext } from '-/hooks/useEditedEntryMetaContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { Pro } from '-/pro';
import { useEditedKanBanMetaContext } from '-/hooks/useEditedKanBanMetaContext';
import { CommonLocation } from '-/utils/CommonLocation';

type IOActionsContextData = {
  createDirectory: (directoryPath: string) => Promise<boolean>;
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
  downloadFile: (
    url: string,
    targetPath: string,
    onDownloadProgress?: (progress: Progress, abort, fileName?) => void,
  ) => Promise<TS.FileSystemEntry>;
  uploadFilesAPI: (
    files: Array<any>,
    targetPath: string,
    onUploadProgress?: (progress: Progress, abort, fileName?) => void,
    uploadMeta?: boolean,
    open?: boolean,
    targetLocationId?: string,
    sourceLocationId?: string,
  ) => Promise<TS.FileSystemEntry[]>;
  uploadFiles: (
    paths: Array<string>,
    targetPath: string,
    onUploadProgress?: (progress: Progress, abort, fileName?) => void,
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
  downloadFile: undefined,
  uploadFilesAPI: undefined,
  uploadFiles: undefined,
  renameDirectory: undefined,
  renameFile: undefined,
  openFileNatively: undefined,
  duplicateFile: undefined,
  saveCurrentLocationMetaData: undefined,
  saveMetaDataPromise: undefined,
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
  const { selectedEntries } = useSelectedEntriesContext();
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
  const { actions, setReflectActions } = useEditedEntryContext();
  const { setReflectMetaActions } = useEditedEntryMetaContext();
  const { setReflectKanBanActions } = useEditedKanBanMetaContext();
  const { currentDirectoryPath, openDirectory, getAllPropertiesPromise } =
    useDirectoryContentContext();
  const { currentLocation, findLocation } = useCurrentLocationContext();
  const warningOpeningFilesExternally = useSelector(
    getWarningOpeningFilesExternally,
  );
  const prefixTagContainer = useSelector(getPrefixTagContainer);
  const filenameTagPlacedAtEnd = useSelector(getFileNameTagPlace);

  useEffect(() => {
    if (actions && actions.length > 0) {
      for (const action of actions) {
        if (action.action === 'add') {
          // reflect visibility change on new KanBan column add
          if (!action.entry.isFile) {
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
        } else if (action.action === 'update') {
          // reflect visibility change on renamed KanBan column
          if (!action.entry.isFile) {
            const dirPath = extractContainingDirectoryPath(
              action.entry.path,
              currentLocation?.getDirSeparator(),
            );
            if (
              cleanTrailingDirSeparator(
                cleanFrontDirSeparator(currentDirectoryPath),
              ) === cleanTrailingDirSeparator(cleanFrontDirSeparator(dirPath))
            ) {
              reflectRenameVisibility(action.oldEntryPath, action.entry.path);
            }
          }
        }
      }
    }
  }, [actions]);

  function createDirectory(directoryPath: string) {
    return createDirectoryPromise(directoryPath)
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
              deleteMeta(e.path, e.uuid);
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
      // Delete revisions, sidecar file and thumb
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
    )
      .then((moveArray) => {
        if (moveArray !== undefined) {
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
                  return moveDirectoryPromise({ path: backupDir }, newBackupDir)
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
            return true;
          });
          return moveFilesPromise(moveMetaJobs, location.uuid, undefined, false)
            .then(() => {
              console.log('Moving meta and thumbs successful');
              return reflect && reflectMoveFiles(moveJobs);
            })
            .catch((err) => {
              console.log('At least one meta or thumb was not moved ' + err);
              return reflect && reflectMoveFiles(moveJobs);
            });
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
          const metaPaths = paths.flatMap((path) => [
            getMetaFileLocationForFile(
              path,
              currentLocation?.getDirSeparator(),
            ),
            getThumbFileLocationForFile(
              path,
              currentLocation?.getDirSeparator(),
              false,
            ),
          ]);

          return copyFilesWithProgress(
            metaPaths,
            getMetaDirectoryPath(targetPath),
            locationID, //metaPaths.length > 10 ? undefined : onProgress,
            false,
          )
            .then(() => {
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
        showNotification(t('core:copyingFilesFailed'));
        return false;
      });
  }

  /**
   * S3 TODO deprecated fetch must be moved in main thread
   * @param url
   * @param targetPath
   * @param onDownloadProgress
   */
  function downloadFile(
    url: string,
    targetPath: string,
    onDownloadProgress?: (progress: Progress, abort, fileName?) => void,
  ): Promise<TS.FileSystemEntry> {
    function saveFile(response: Response): Promise<TS.FileSystemEntry> {
      if (AppConfig.isElectron && !currentLocation.haveObjectStoreSupport()) {
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
    return fetch(url)
      .then((response) => saveFile(response))
      .then((fsEntry: TS.FileSystemEntry) => {
        return generateThumbnailPromise(
          currentLocation.haveObjectStoreSupport() ? url : fsEntry.path,
          fsEntry.size,
          currentLocation.loadTextFilePromise,
          currentLocation.getFileContentPromise,
          currentLocation?.getDirSeparator(),
        ).then((dataURL) => {
          if (dataURL && dataURL.length > 6) {
            const baseString = dataURL.split(',').pop();
            const fileContent = base64ToBlob(baseString);
            return saveBinaryFilePromise(
              {
                path: getThumbFileLocationForFile(
                  targetPath,
                  currentLocation?.getDirSeparator(),
                  false,
                ),
              },
              fileContent,
              true,
            ).then((thumb: TS.FileSystemEntry) => ({
              ...fsEntry,
              thumbPath: currentLocation.getThumbPath(thumb.path),
            }));
          }
          return fsEntry;
        });
      });
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
    onUploadProgress?: (progress: Progress, abort, fileName?) => void,
    uploadMeta = true,
    open = true,
    targetLocationId: string = undefined,
    sourceLocationId: string = undefined,
  ): Promise<TS.FileSystemEntry[]> {
    if (AppConfig.isElectron || AppConfig.isCordovaiOS) {
      const arrFiles = [];
      for (let i = 0; i < files.length; i += 1) {
        arrFiles.push(files[i].path);
      }
      return uploadFiles(
        arrFiles,
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
              const thumbPath = await generateThumbnailPromise(
                currentLocation.getURLforPath(fileTargetPath),
                fsEntry.size,
                currentLocation.loadTextFilePromise,
                currentLocation.getFileContentPromise,
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
                fsEntry.meta.thumbPath =
                  currentLocation.getURLforPath(thumbPath);
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
    onUploadProgress?: (progress: Progress, response: any) => void,
    reflect: boolean = true,
    locationID: string = undefined,
  ) {
    return findLocation(locationID)
      .getPropertiesPromise(filePath)
      .then((entryProps) => {
        if (entryProps) {
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
                  fsEntry.meta = loadJSONString(fileContent.toString());
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
    onUploadProgress?: (progress: Progress, response: any) => void,
    uploadMeta = true,
    open = true,
    targetLocationId: string = undefined,
    sourceLocationId: string = undefined,
  ): Promise<TS.FileSystemEntry[]> {
    return new Promise((resolve, reject) => {
      const uploadJobs = [];
      paths.map((path) => {
        let target = joinPaths(
          currentLocation?.getDirSeparator(),
          targetPath,
          extractFileName(path, AppConfig.dirSeparator),
        ); // with "/" dir separator cannot extractFileName on Win
        // fix for Win
        /*if (
          currentLocation.haveObjectStoreSupport() &&
          (target.startsWith('\\') || target.startsWith('/'))
        ) {
          target = target.substr(1);
        }*/
        uploadJobs.push([path, target, 'file']);
        if (uploadMeta) {
          // copy meta
          uploadJobs.push([
            getMetaFileLocationForFile(path, AppConfig.dirSeparator),
            getMetaFileLocationForFile(
              target,
              currentLocation?.getDirSeparator(),
            ),
            'meta',
          ]);
          uploadJobs.push([
            getThumbFileLocationForFile(path, AppConfig.dirSeparator),
            getThumbFileLocationForFile(
              target,
              currentLocation?.getDirSeparator(),
            ),
            'thumb',
            path,
          ]);
        }
        return true;
      });
      const jobsPromises = uploadJobs.map((job) => {
        // console.log("Selected File: "+JSON.stringify(selection.currentTarget.files[0]));
        // const file = selection.currentTarget.files[0];
        const filePath = job[1];
        const fileType = job[2];

        // TODO try to replace this with <input type="file"
        if (AppConfig.isElectron) {
          return findLocation(sourceLocationId)
            .getFileContentPromise(job[0], 'arraybuffer')
            .then((fileContent) =>
              uploadFile(
                filePath,
                fileType,
                fileContent,
                onUploadProgress,
                false,
                targetLocationId,
              ),
            )
            .catch((err) => {
              // console.log('Error getting file:' + job[0] + ' ' + err);
              if (fileType === 'thumb' && job[3]) {
                return generateThumbnailPromise(
                  job[3],
                  0,
                  currentLocation.loadTextFilePromise,
                  currentLocation.getFileContentPromise,
                  currentLocation?.getDirSeparator(),
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
                    );
                  }
                  return undefined;
                });
              }
            });
        }

        return undefined;
      });
      Promise.allSettled(jobsPromises)
        .then((filesProm) => {
          const arrFiles: Array<TS.FileSystemEntry> = [];
          const arrMeta: Array<TS.FileSystemEntry> = [];

          filesProm.map((result) => {
            if (result.status !== 'rejected') {
              const file = result.value;
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
            const entriesEnhanced = arrFiles.map((file: TS.FileSystemEntry) => {
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
                    file.meta = {
                      ...(file.meta && file.meta),
                      thumbPath: currentLocation.getURLforPath(
                        file.meta.thumbPath,
                      ),
                    };
                  }
                }
              }
              if (file.meta) {
                return enhanceEntry(
                  file,
                  AppConfig.tagDelimiter,
                  currentLocation?.getDirSeparator(),
                );
              }
              return file;
            });
            const reflectActions: TS.EditAction[] = entriesEnhanced.map(
              (entry) => ({
                action: 'add',
                entry: entry,
                open: open,
                source: 'upload',
              }),
            );
            setReflectActions(...reflectActions);
            resolve(entriesEnhanced);
          } else {
            // eslint-disable-next-line prefer-promise-reject-errors
            reject('Upload failed');
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
          ],
          locationID,
          undefined,
          false,
        )
          .then(() => {
            if (reflect) {
              getAllPropertiesPromise(newFilePath).then(
                (fsEntry: TS.FileSystemEntry) => {
                  if (reflect) {
                    setReflectActions({
                      action: 'update',
                      entry: fsEntry,
                      oldEntryPath: filePath,
                    });
                  }
                  return fsEntry;
                },
              );
            }
            console.info(
              'Renaming meta file and thumb successful from ' +
                filePath +
                ' to:' +
                newFilePath,
            );
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
          `Error while renaming file ${filePath}`,
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
        AppConfig.tagDelimiter,
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
          AppConfig.tagDelimiter,
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
          showNotification('Error creating duplicate: ', error);
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
      .getPropertiesPromise(path)
      .then((entryProperties) =>
        saveMetaDataPromise(entryProperties, metaData),
      );
  }
  /**
   * @param entry
   * @param metaData - this will override existing meta data
   */
  async function saveMetaDataPromise(
    entry: TS.FileSystemEntry,
    metaData: any,
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
          await createDirectoryPromise(metaDirectoryPath, location.uuid);
        }

        metaFilePath = getMetaFileLocationForDir(
          entry.path,
          location.getDirSeparator(),
        );
      }
      const meta = cleanMetaData(mergeFsEntryMeta(metaData));
      const content = JSON.stringify(meta);
      return saveTextFilePromise(
        { path: metaFilePath, locationID: entry.locationID },
        content,
        true,
      ).then(() => meta);
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
    return location
      .loadMetaDataPromise(path)
      .then((fsEntryMeta: TS.FileSystemEntryMeta) => {
        if (fsEntryMeta.id) {
          return fsEntryMeta.id;
        } else {
          return saveFsEntryMeta(location.toFsEntry(path, fsEntryMeta.isFile), {
            ...fsEntryMeta,
            id: id,
          }).then((fsEntryMeta) => fsEntryMeta.id);
        }
      })
      .catch(() => {
        // create new meta id to not be changed -> next time listDirectory will get the same id for the file from meta
        const content = JSON.stringify({ id: id });
        const metaFilePath = path.endsWith(location.getDirSeparator())
          ? getMetaFileLocationForDir(path, location.getDirSeparator())
          : getMetaFileLocationForFile(path, location.getDirSeparator());
        return saveTextFilePromise(
          { path: metaFilePath, locationID: location.uuid },
          content,
          true,
        ).then(() => id);
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
    return findLocation(entry.locationID)
      .loadMetaDataPromise(entry.path)
      .then((fsEntryMeta) => {
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
      currentLocation.generateURLforPath(folderBgndPath, 604800);
    }
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
    if (
      currentLocation?.haveObjectStoreSupport() ||
      currentLocation?.haveWebDavSupport()
    ) {
      // reload cache
      const folderThumbPath = getThumbFileLocationForDirectory(
        entry.path,
        currentLocation?.getDirSeparator(),
      );
      currentLocation.generateURLforPath(folderThumbPath, 604800);
    }
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
                const action: TS.KanBanMetaActions = {
                  action: 'directoryVisibilityChange',
                  meta: updatedFsEntryMeta,
                };
                setReflectKanBanActions(action);
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
    return currentLocation
      .loadMetaDataPromise(currentDirPath)
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
                const action: TS.KanBanMetaActions = {
                  action: 'directoryVisibilityChange',
                  meta: updatedFsEntryMeta,
                };
                setReflectKanBanActions(action);
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
    const files: Array<TS.OrderVisibilitySettings> = filesArray.map((file) => ({
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
      downloadFile,
      uploadFilesAPI,
      uploadFiles,
      renameDirectory,
      renameFile,
      openFileNatively,
      duplicateFile,
      saveCurrentLocationMetaData,
      saveMetaDataPromise,
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
