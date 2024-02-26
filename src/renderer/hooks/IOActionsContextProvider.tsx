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

import React, { createContext, useMemo } from 'react';
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
  getThumbFileLocationForFile,
  joinPaths,
  normalizePath,
  extractTags,
} from '@tagspaces/tagspaces-common/paths';
import PlatformIO from '-/services/platform-facade';
import { actions as AppActions, AppDispatch } from '-/reducers/app';
import { useDispatch, useSelector } from 'react-redux';
import {
  executePromisesInBatches,
  generateFileName,
  getAllPropertiesPromise,
  getThumbPath,
  loadFileMetaDataPromise,
  toFsEntry,
} from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import { Progress } from 'aws-sdk/clients/s3';
import AppConfig from '-/AppConfig';
import { generateThumbnailPromise } from '-/services/thumbsgenerator';
import { base64ToArrayBuffer } from '-/utils/dom';
import {
  enhanceEntry,
  loadJSONString,
} from '@tagspaces/tagspaces-common/utils-io';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import {
  getPrefixTagContainer,
  getWarningOpeningFilesExternally,
} from '-/reducers/settings';
import { usePlatformFacadeContext } from '-/hooks/usePlatformFacadeContext';
import { useEditedEntryContext } from '-/hooks/useEditedEntryContext';

type IOActionsContextData = {
  createDirectory: (directoryPath: string) => Promise<boolean>;
  deleteEntries: (...entries: TS.FileSystemEntry[]) => Promise<boolean>;
  deleteDirectory: (directoryPath: string) => Promise<boolean>;
  deleteFile: (filePath: string, uuid: string) => Promise<boolean>;
  moveDirs: (
    dirPaths: Array<string>,
    targetPath: string,
    onProgress?,
  ) => Promise<boolean>;
  moveFiles: (
    paths: Array<string>,
    targetPath: string,
    onProgress?,
    reflect?: boolean,
  ) => Promise<boolean>;
  copyDirs: (
    dirPaths: Array<any>,
    targetPath: string,
    onProgress?,
  ) => Promise<boolean>;
  copyFiles: (
    paths: Array<string>,
    targetPath: string,
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
  ) => Promise<TS.FileSystemEntry[]>;
  uploadFiles: (
    paths: Array<string>,
    targetPath: string,
    onUploadProgress?: (progress: Progress, abort, fileName?) => void,
    uploadMeta?: boolean,
    open?: boolean,
  ) => Promise<TS.FileSystemEntry[]>;
  renameDirectory: (
    directoryPath: string,
    newDirectoryName: string,
  ) => Promise<string>;
  renameFile: (
    filePath: string,
    newFilePath: string,
    reflect?: boolean,
  ) => Promise<boolean>;
  openFileNatively: (selectedFile?: string) => void;
  duplicateFile: (selectedFilePath: string) => void;
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
    saveBinaryFilePromise,
    deleteEntriesPromise,
  } = usePlatformFacadeContext();
  const { setReflectActions } = useEditedEntryContext();
  const { currentDirectoryPath, openDirectory } = useDirectoryContentContext();
  const warningOpeningFilesExternally = useSelector(
    getWarningOpeningFilesExternally,
  );
  const prefixTagContainer = useSelector(getPrefixTagContainer);

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
            PlatformIO.getDirSeparator(),
          )} successful.`,
          'default',
          true,
        );
        return true;
      })
      .catch((error) => {
        console.warn('Error creating directory: ' + error);
        showNotification(
          `Error creating directory '${extractDirectoryName(
            directoryPath,
            PlatformIO.getDirSeparator(),
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
          if (success) {
            const fileNames = entries.map((e) => e.name).join(' ');
            showNotification(
              t('deletingEntriesSuccessful', {
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
    return deleteEntriesPromise(toFsEntry(directoryPath, false))
      .then(() => {
        showNotification(
          t(
            'deletingDirectorySuccessfull' as any,
            {
              dirPath: extractDirectoryName(
                directoryPath,
                PlatformIO.getDirSeparator(),
              ),
            } as any,
          ) as string,
          'default',
          true,
        );
        return true;
      })
      .catch((error) => {
        console.warn('Error while deleting directory: ' + error);
        showNotification(
          t(
            'errorDeletingDirectoryAlert' as any,
            {
              dirPath: extractDirectoryName(
                directoryPath,
                PlatformIO.getDirSeparator(),
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

  function deleteFile(filePath: string, uuid: string) {
    return deleteEntriesPromise(toFsEntry(filePath, true))
      .then(() => {
        showNotification(
          `Deleting file ${filePath} successful.`,
          'default',
          true,
        );
        // Delete revisions
        const backupFilePath = getBackupFileLocation(
          filePath,
          uuid,
          PlatformIO.getDirSeparator(),
        );
        const backupPath = extractContainingDirectoryPath(
          backupFilePath,
          PlatformIO.getDirSeparator(),
        );
        PlatformIO.deleteDirectoryPromise(backupPath)
          .then(() => {
            console.log('Cleaning revisions successful for ' + filePath);
            return true;
          })
          .catch((err) => {
            console.warn('Cleaning revisions failed ', err);
          });
        // Delete sidecar file and thumb
        deleteEntriesPromise(
          toFsEntry(
            getMetaFileLocationForFile(filePath, PlatformIO.getDirSeparator()),
            true,
          ),
          toFsEntry(
            getThumbFileLocationForFile(
              filePath,
              PlatformIO.getDirSeparator(),
              false,
            ),
            true,
          ),
        )
          .then(() => {
            console.log(
              'Cleaning meta file and thumb successful for ' + filePath,
            );
            return true;
          })
          .catch((err) => {
            console.warn('Cleaning meta file and thumb failed with ' + err);
          });
        return true;
      })
      .catch((error) => {
        console.warn('Error while deleting file: ' + error);
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
    onProgress = undefined,
  ): Promise<boolean> {
    const progress = dirPaths.length > 10 ? undefined : onProgress;
    const promises = dirPaths.map(({ path, count }) => {
      const dirName = extractDirectoryName(path, PlatformIO.getDirSeparator());
      return moveDirectoryPromise(
        { path: path, total: count },
        joinPaths(PlatformIO.getDirSeparator(), targetPath, dirName),
        progress,
        false,
      )
        .then((newDirPath) => {
          // console.log('Moving dir from ' + path + ' to ' + targetPath);
          const action: TS.EditAction = {
            action: 'move',
            entry: toFsEntry(newDirPath, false),
            oldEntryPath: path,
          };
          return action;
        })
        .catch((err) => {
          console.warn('Moving dirs failed ', err);
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
    onProgress = undefined,
    reflect = true,
  ): Promise<boolean> {
    const moveJobs = paths.map((path) => [
      path,
      normalizePath(targetPath) +
        PlatformIO.getDirSeparator() +
        extractFileName(path, PlatformIO.getDirSeparator()),
    ]);
    return moveFilesPromise(
      moveJobs,
      paths.length > 10 ? undefined : onProgress,
      false,
    )
      .then((moveArray) => {
        if (moveArray !== undefined) {
          showNotification(t('core:filesMovedSuccessful'));
          const moveMetaJobs = [];
          moveJobs.map((job) => {
            // Move revisions
            loadFileMetaDataPromise(job[0])
              .then((fsEntryMeta: TS.FileSystemEntryMeta) => {
                if (fsEntryMeta.id) {
                  const backupDir = getBackupFileDir(
                    job[0],
                    fsEntryMeta.id,
                    PlatformIO.getDirSeparator(),
                  );
                  const newBackupDir = getBackupFileDir(
                    job[1],
                    fsEntryMeta.id,
                    PlatformIO.getDirSeparator(),
                  );
                  return PlatformIO.moveDirectoryPromise(
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
                      console.warn('Moving revisions failed ', err);
                    });
                }
              })
              .catch((err) => {
                console.warn('loadFileMetaDataPromise', err);
              });

            // move meta
            moveMetaJobs.push([
              getMetaFileLocationForFile(job[0], PlatformIO.getDirSeparator()),
              getMetaFileLocationForFile(job[1], PlatformIO.getDirSeparator()),
            ]);
            moveMetaJobs.push([
              getThumbFileLocationForFile(
                job[0],
                PlatformIO.getDirSeparator(),
                false,
              ),
              getThumbFileLocationForFile(
                job[1],
                PlatformIO.getDirSeparator(),
                false,
              ),
            ]);
            return true;
          });
          return moveFilesPromise(moveMetaJobs, undefined, false)
            .then(() => {
              console.log('Moving meta and thumbs successful');
              return reflect && reflectMoveFiles(moveJobs);
            })
            .catch((err) => {
              console.warn('At least one meta or thumb was not moved ' + err);
              return reflect && reflectMoveFiles(moveJobs);
            });
        } else {
          showNotification(t('core:copyingFilesFailed'));
          return false;
        }
      })
      .catch((err) => {
        console.warn('Moving files failed with ' + err);
        showNotification(t('core:copyingFilesFailed'));
        return false;
      });
  }

  function copyDirs(
    dirPaths: Array<any>,
    targetPath: string,
    onProgress = undefined,
  ): Promise<boolean> {
    const progress = dirPaths.length > 10 ? undefined : onProgress;
    const promises = dirPaths.map(({ path, count }) => {
      const dirName = extractDirectoryName(path, PlatformIO.getDirSeparator());
      return copyDirectoryPromise(
        { path: path, total: count },
        joinPaths(PlatformIO.getDirSeparator(), targetPath, dirName),
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
          console.warn('Copy dirs failed ', err);
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
    onProgress,
  ): Promise<boolean> {
    return copyFilesWithProgress(
      paths,
      targetPath,
      paths.length > 10 ? undefined : onProgress,
    )
      .then((success) => {
        if (success) {
          showNotification(t('core:filesCopiedSuccessful'));
          const metaPaths = paths.flatMap((path) => [
            getMetaFileLocationForFile(path, PlatformIO.getDirSeparator()),
            getThumbFileLocationForFile(
              path,
              PlatformIO.getDirSeparator(),
              false,
            ),
          ]);

          return copyFilesWithProgress(
            metaPaths,
            getMetaDirectoryPath(targetPath),
            undefined, //metaPaths.length > 10 ? undefined : onProgress,
            false,
          )
            .then(() => {
              console.log('Copy meta and thumbs successful');
              return true;
            })
            .catch((err) => {
              console.warn('At least one meta or thumb was not copied ' + err);
              return true;
            });
        }
        return false;
      })
      .catch((err) => {
        console.warn('Moving files failed with ' + err);
        showNotification(t('core:copyingFilesFailed'));
        return false;
      });
  }

  /**
   * S3 TODO work for test files only
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
      if (AppConfig.isElectron && !PlatformIO.haveObjectStoreSupport()) {
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
          PlatformIO.haveObjectStoreSupport() ? url : fsEntry.path,
          fsEntry.size,
        ).then((dataURL) => {
          if (dataURL && dataURL.length > 6) {
            const baseString = dataURL.split(',').pop();
            const fileContent = base64ToArrayBuffer(baseString);
            return saveBinaryFilePromise(
              {
                path: getThumbFileLocationForFile(
                  targetPath,
                  PlatformIO.getDirSeparator(),
                  false,
                ),
              },
              fileContent,
              true,
            ).then((thumb: TS.FileSystemEntry) => ({
              ...fsEntry,
              thumbPath: getThumbPath(thumb.path),
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
   */
  function uploadFilesAPI(
    files: Array<any>,
    targetPath: string,
    onUploadProgress?: (progress: Progress, abort, fileName?) => void,
    uploadMeta = true,
    open = true,
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
        let filePath =
          normalizePath(targetPath) + PlatformIO.getDirSeparator() + fileName;
        if (
          PlatformIO.haveObjectStoreSupport() &&
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
          await PlatformIO.getPropertiesPromise(fileTargetPath);
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
                PlatformIO.getURLforPath(fileTargetPath),
                fsEntry.size,
              )
                .then((dataURL) => {
                  if (dataURL && dataURL.length > 6) {
                    const baseString = dataURL.split(',').pop();
                    const fileContent = base64ToArrayBuffer(baseString);
                    const thumbPath = getThumbFileLocationForFile(
                      fileTargetPath,
                      PlatformIO.getDirSeparator(),
                      false,
                    );
                    return PlatformIO.saveBinaryFilePromise(
                      { path: thumbPath },
                      fileContent,
                      true,
                    ).then(() => thumbPath);
                  }
                  return undefined;
                })
                .catch((err) => {
                  console.log('error generateThumbnail:', err);
                });
              if (thumbPath) {
                fsEntry.thumbPath = PlatformIO.getURLforPath(thumbPath);
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
  ) {
    return PlatformIO.getPropertiesPromise(filePath)
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
            { path: filePath },
            fileContent,
            true,
            onUploadProgress,
            reflect,
          )
            .then((fsEntry: TS.FileSystemEntry) => {
              // handle meta files
              if (fileType === 'meta') {
                try {
                  // eslint-disable-next-line no-param-reassign
                  fsEntry.meta = loadJSONString(fileContent.toString());
                } catch (e) {
                  console.debug('cannot parse entry meta');
                }
              } else if (fileType === 'thumb') {
                // eslint-disable-next-line no-param-reassign
                fsEntry.thumbPath = fsEntry.path;
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
   */
  function uploadFiles(
    paths: Array<string>,
    targetPath: string,
    onUploadProgress?: (progress: Progress, response: any) => void,
    uploadMeta = true,
    open = true,
  ): Promise<TS.FileSystemEntry[]> {
    return new Promise((resolve, reject) => {
      const uploadJobs = [];
      paths.map((path) => {
        let target =
          normalizePath(targetPath) +
          AppConfig.dirSeparator +
          extractFileName(path, AppConfig.dirSeparator); // PlatformIO.getDirSeparator()); // with "/" dir separator cannot extractFileName on Win
        // fix for Win
        if (
          PlatformIO.haveObjectStoreSupport() &&
          (target.startsWith('\\') || target.startsWith('/'))
        ) {
          target = target.substr(1);
        }
        uploadJobs.push([path, target, 'file']);
        if (uploadMeta) {
          // copy meta
          uploadJobs.push([
            getMetaFileLocationForFile(path, AppConfig.dirSeparator),
            getMetaFileLocationForFile(target, AppConfig.dirSeparator),
            'meta',
          ]);
          uploadJobs.push([
            getThumbFileLocationForFile(path, AppConfig.dirSeparator),
            getThumbFileLocationForFile(target, AppConfig.dirSeparator),
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
          // for AWS location getFileContentPromise cannot load with io-objectore
          return PlatformIO.getLocalFileContentPromise(job[0])
            .then((fileContent) =>
              uploadFile(
                filePath,
                fileType,
                fileContent,
                onUploadProgress,
                false,
              ),
            )
            .catch((err) => {
              // console.log('Error getting file:' + job[0] + ' ' + err);
              if (fileType === 'thumb' && job[3]) {
                return generateThumbnailPromise(job[3], 0).then((dataURL) => {
                  if (dataURL && dataURL.length > 6) {
                    const baseString = dataURL.split(',').pop();
                    const fileContent = base64ToArrayBuffer(baseString);
                    return uploadFile(
                      filePath,
                      fileType,
                      fileContent,
                      onUploadProgress,
                      false,
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
          const arrThumb: Array<TS.FileSystemEntry> = [];

          filesProm.map((result) => {
            if (result.status !== 'rejected') {
              const file = result.value;
              if (file) {
                if (file.meta) {
                  arrMeta.push(file);
                } else if (file.thumbPath) {
                  arrThumb.push(file);
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
              if (metaFilePath !== undefined) {
                for (let i = 0; i < arrMeta.length; i += 1) {
                  const metaFile = arrMeta[i];
                  if (
                    metaFile.path.replace(/[/\\]/g, '') ===
                    metaFilePath.replace(/[/\\]/g, '')
                  ) {
                    // eslint-disable-next-line no-param-reassign
                    file.meta = metaFile.meta;
                  }
                }
              }
              const thumbFilePath = getThumbFileLocationForFile(
                file.path,
                AppConfig.dirSeparator,
              );
              if (thumbFilePath !== undefined) {
                for (let i = 0; i < arrThumb.length; i += 1) {
                  const thumbFile = arrThumb[i];
                  if (
                    thumbFile.path.replace(/[/\\]/g, '') ===
                    thumbFilePath.replace(/[/\\]/g, '')
                  ) {
                    // eslint-disable-next-line no-param-reassign
                    file.thumbPath = PlatformIO.getURLforPath(
                      thumbFile.thumbPath,
                    );
                  }
                }
              }
              if (file.meta) {
                return enhanceEntry(
                  file,
                  AppConfig.tagDelimiter,
                  PlatformIO.getDirSeparator(),
                );
              }
              return file;
            });
            const reflectActions: TS.EditAction[] = entriesEnhanced.map(
              (entry) => ({
                action: 'add',
                entry: entry,
                open: open,
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
  ): Promise<string> {
    return renameDirectoryPromise(directoryPath, newDirectoryName)
      .then((newDirPath) => {
        if (currentDirectoryPath === directoryPath) {
          openDirectory(newDirPath);
        }

        showNotification(
          `Renaming directory ${extractDirectoryName(
            directoryPath,
            PlatformIO.getDirSeparator(),
          )} successful.`,
          'default',
          true,
        );
        return newDirPath;
      })
      .catch((error) => {
        console.warn('Error while renaming directory: ' + error);
        showNotification(
          `Error renaming directory '${extractDirectoryName(
            directoryPath,
            PlatformIO.getDirSeparator(),
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
    reflect = true,
  ): Promise<boolean> {
    return renameFilePromise(filePath, newFilePath, undefined, reflect)
      .then((result) => {
        // const newFilePathFromPromise = result[1];
        console.info('File renamed ' + filePath + ' to ' + newFilePath);
        showNotification(t('core:renamingSuccessfully'), 'default', true);
        // Update sidecar file and thumb
        return renameFilesPromise(
          [
            [
              getMetaFileLocationForFile(
                filePath,
                PlatformIO.getDirSeparator(),
              ),
              getMetaFileLocationForFile(
                newFilePath,
                PlatformIO.getDirSeparator(),
              ),
            ],
            [
              getThumbFileLocationForFile(
                filePath,
                PlatformIO.getDirSeparator(),
                false,
              ),
              getThumbFileLocationForFile(
                newFilePath,
                PlatformIO.getDirSeparator(),
                false,
              ),
            ],
          ],
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
            return true;
          })
          .catch((err) => {
            console.warn(
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
    // todo reload selectedEntries or find better place for this function
    if (selectedFile === undefined) {
      if (selectedEntries && selectedEntries.length > 0) {
        const fsEntry = selectedEntries[selectedEntries.length - 1];
        if (fsEntry.isFile) {
          PlatformIO.openFile(fsEntry.path, warningOpeningFilesExternally);
        } else {
          PlatformIO.openDirectory(fsEntry.path);
        }
      }
    } else {
      PlatformIO.openFile(selectedFile, warningOpeningFilesExternally);
    }
  }

  function duplicateFile(selectedFilePath: string) {
    if (selectedFilePath) {
      const dirPath = extractContainingDirectoryPath(
        selectedFilePath,
        PlatformIO.getDirSeparator(),
      );

      const fileName = extractFileName(
        selectedFilePath,
        PlatformIO.getDirSeparator(),
      );

      const extractedTags = extractTags(
        selectedFilePath,
        AppConfig.tagDelimiter,
        PlatformIO.getDirSeparator(),
      );
      extractedTags.push('copy');
      extractedTags.push(formatDateTime4Tag(new Date(), true));

      const newFilePath =
        (dirPath ? dirPath + PlatformIO.getDirSeparator() : '') +
        generateFileName(
          fileName,
          extractedTags,
          AppConfig.tagDelimiter,
          prefixTagContainer,
        );

      copyFilePromise(selectedFilePath, newFilePath)
        /*.then(() => {
          return openDirectory(dirPath);
        })*/
        .catch((error) => {
          showNotification('Error creating duplicate: ', error);
        });
    }
    showNotification('Unable to duplicate, no file selected');
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
    };
  }, [warningOpeningFilesExternally]);

  return (
    <IOActionsContext.Provider value={context}>
      {children}
    </IOActionsContext.Provider>
  );
};
