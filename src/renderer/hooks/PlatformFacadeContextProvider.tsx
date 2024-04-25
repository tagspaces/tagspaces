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
import { TS } from '-/tagspaces.namespace';
import { useFSWatcherContext } from '-/hooks/useFSWatcherContext';
import {
  extractContainingDirectoryPath,
  extractDirectoryName,
  extractFileName,
  getThumbFileLocationForDirectory,
  getThumbFileLocationForFile,
  normalizePath,
} from '@tagspaces/tagspaces-common/paths';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useEditedEntryContext } from '-/hooks/useEditedEntryContext';
import { executePromisesInBatches } from '-/services/utils-io';
import { getUseTrashCan } from '-/reducers/settings';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';

type PlatformFacadeContextData = {
  createDirectoryPromise: (path: string) => Promise<any>;
  copyFilePromise: (
    sourceFilePath: string,
    targetFilePath: string,
    confirmMessage?: string,
  ) => Promise<any>;
  copyFilesWithProgress: (
    paths: Array<string>,
    targetPath: string,
    onProgress?,
    reflect?: boolean,
  ) => Promise<boolean>;
  copyFilePromiseOverwrite: (
    sourceFilePath: string,
    targetFilePath: string,
    reflect?,
  ) => Promise<any>;
  renameFilePromise: (
    filePath: string,
    newFilePath: string,
    onProgress?,
    reflect?,
  ) => Promise<any>;
  renameFilesPromise: (
    renameJobs: Array<Array<string>>,
    onProgress?,
    reflect?,
  ) => Promise<any>;
  moveFilePromise: (
    filePath: string,
    newFilePath: string,
    onProgress?,
    reflect?,
  ) => Promise<any>;
  moveFilesPromise: (
    renameJobs: Array<Array<string>>,
    onProgress?,
    reflect?,
  ) => Promise<any>;
  reflectMoveFiles: (moveJobs: Array<Array<string>>) => Promise<boolean>;
  renameDirectoryPromise: (dirPath: string, newDirName: string) => Promise<any>;
  copyDirectoryPromise: (
    param: any,
    newDirPath: string,
    onProgress?,
    reflect?,
  ) => Promise<any>;
  moveDirectoryPromise: (
    param: any,
    newDirPath: string,
    onProgress?,
    reflect?,
  ) => Promise<any>;
  saveFilePromise: (
    param: any,
    content: any,
    overwrite: boolean,
    open?: boolean,
  ) => Promise<any>;
  saveTextFilePromise: (
    param: any,
    content: string,
    overwrite: boolean,
  ) => Promise<any>;
  saveBinaryFilePromise: (
    param: any,
    content: any,
    overwrite: boolean,
    onUploadProgress?: (
      progress: any, // ManagedUpload.Progress,
      response: any, // AWS.Response<AWS.S3.PutObjectOutput, AWS.AWSError>
    ) => void,
    reflect?,
  ) => Promise<TS.FileSystemEntry>;
  deleteEntriesPromise: (...paths: TS.FileSystemEntry[]) => Promise<boolean>;
  setFolderThumbnailPromise: (filePath: string) => Promise<string>;
};

export const PlatformFacadeContext = createContext<PlatformFacadeContextData>({
  createDirectoryPromise: undefined,
  copyFilePromise: undefined,
  copyFilesWithProgress: undefined,
  copyFilePromiseOverwrite: undefined,
  renameFilePromise: undefined,
  renameFilesPromise: undefined,
  moveFilePromise: undefined,
  moveFilesPromise: undefined,
  reflectMoveFiles: undefined,
  renameDirectoryPromise: undefined,
  copyDirectoryPromise: undefined,
  moveDirectoryPromise: undefined,
  saveFilePromise: undefined,
  saveTextFilePromise: undefined,
  saveBinaryFilePromise: undefined,
  deleteEntriesPromise: undefined,
  setFolderThumbnailPromise: undefined,
});

export type PlatformFacadeContextProviderProps = {
  children: React.ReactNode;
};

export const PlatformFacadeContextProvider = ({
  children,
}: PlatformFacadeContextProviderProps) => {
  const {
    reflectAddEntry,
    reflectAddEntryPath,
    reflectDeleteEntries,
    setReflectActions,
  } = useEditedEntryContext();
  const { currentLocation } = useCurrentLocationContext();
  const { getAllPropertiesPromise } = useDirectoryContentContext();
  const { ignoreByWatcher, deignoreByWatcher, ignored } = useFSWatcherContext(); //watcher

  const { t } = useTranslation();
  const useTrashCan = useSelector(getUseTrashCan);

  function createDirectoryPromise(path: string): Promise<any> {
    ignoreByWatcher(path);

    return currentLocation.createDirectoryPromise(path).then((result) => {
      reflectAddEntry(
        currentLocation.toFsEntry(path, false, currentLocation.uuid),
      );
      deignoreByWatcher(path);
      return result;
    });
  }

  /**
   * @param filePath
   * return Promise<destThumbPath>
   */
  function setFolderThumbnailPromise(filePath: string): Promise<string> {
    const directoryPath = extractContainingDirectoryPath(
      filePath,
      currentLocation.getDirSeparator(),
    );
    const directoryName = extractDirectoryName(
      directoryPath,
      currentLocation.getDirSeparator(),
    );
    const sourceThumbPath = getThumbFileLocationForFile(
      filePath,
      currentLocation.getDirSeparator(),
      false,
    );

    const destThumbPath = getThumbFileLocationForDirectory(
      directoryPath,
      currentLocation.getDirSeparator(),
    );

    return copyFilePromise(
      sourceThumbPath,
      destThumbPath,
      t('core:thumbAlreadyExists', { directoryName }),
    ).then(() => {
      //  dispatch(AppActions.setLastThumbnailImageChange(destThumbPath));
      return destThumbPath;
    });
  }

  function copyFilePromise(
    sourceFilePath: string,
    targetFilePath: string,
    confirmMessage: string = 'File ' +
      targetFilePath +
      ' exist do you want to override it?',
  ): Promise<any> {
    return currentLocation
      .getPropertiesPromise(targetFilePath)
      .then((isTargetExist) => {
        if (isTargetExist) {
          // eslint-disable-next-line no-alert
          const confirmOverwrite = window && window.confirm(confirmMessage);
          if (confirmOverwrite === true) {
            return copyFilePromiseOverwrite(sourceFilePath, targetFilePath);
          }
          // eslint-disable-next-line prefer-promise-reject-errors
          return Promise.reject(
            'File "' + targetFilePath + '" exists. Copying failed.',
          );
        }
        return copyFilePromiseOverwrite(sourceFilePath, targetFilePath);
      });
  }

  function copyFilesWithProgress(
    paths: string[],
    targetPath: string,
    onProgress = undefined,
    reflect = true,
  ): Promise<boolean> {
    const controller = new AbortController();
    const signal = controller.signal;

    const ioJobPromises = paths.map((path) => {
      const targetFile =
        normalizePath(targetPath) +
        currentLocation.getDirSeparator() +
        extractFileName(path, currentLocation.getDirSeparator());
      return {
        promise: copyFilePromiseOverwrite(path, targetFile, false),
        path: path,
      };
    });
    const progress = (completed, path) => {
      if (onProgress) {
        const progress = {
          loaded: completed, //processedSize,
          total: ioJobPromises.length,
          key: targetPath,
        };
        onProgress(
          progress,
          () => {
            controller.abort();
          },
          path,
        );
      }
    };
    return trackProgress(ioJobPromises, signal, progress).then(() => {
      if (reflect) {
        const targetPaths = paths.map(
          (path) =>
            normalizePath(targetPath) +
            currentLocation.getDirSeparator() +
            extractFileName(path, currentLocation.getDirSeparator()),
        );
        return reflectAddEntryPath(...targetPaths);
      }
      return true;
    });
  }

  function trackProgress(promises, abortSignal, progress) {
    // const total = promises.length;
    let completed = 0;
    let aborted = false;

    // Create an array of promises that resolve when the original promises resolve
    const progressPromises = promises.map(({ promise, path }) =>
      promise
        .then(() => {
          if (!aborted) {
            completed++;
            // console.log(`Progress: ${completed}/${total}`);
            if (progress) {
              progress(completed, path);
            }
          }
        })
        .catch((err) => {
          completed++;
          if (progress) {
            progress(completed, path);
          }
          console.warn('Promise ' + path + ' error:', err);
        }),
    );

    // Use Promise.race() to wait for all progress promises to resolve
    return Promise.race(progressPromises)
      .then(() => Promise.all(promises))
      .catch((err) => {
        if (abortSignal.aborted) {
          aborted = true;
          console.warn('Promise execution aborted');
        } else {
          throw err;
        }
      });
  }

  function copyFilePromiseOverwrite(
    sourceFilePath: string,
    targetFilePath: string,
    reflect: boolean = true,
  ): Promise<any> {
    ignoreByWatcher(targetFilePath);
    return currentLocation
      .copyFilePromiseOverwrite(sourceFilePath, targetFilePath)
      .then((result) => {
        if (reflect) {
          getAllPropertiesPromise(targetFilePath).then(
            (fsEntry: TS.FileSystemEntry) => reflectAddEntry(fsEntry, false),
          );
        }
        deignoreByWatcher(targetFilePath);
        return result;
      });
  }

  /**
   * @param filePath
   * @param newFilePath
   * @param onProgress
   * @param reflect
   * return Promise<TS.FileSystemEntry> new file entry renamed
   */
  function renameFilePromise(
    filePath: string,
    newFilePath: string,
    onProgress = undefined,
    reflect = true,
  ): Promise<TS.FileSystemEntry> {
    ignoreByWatcher(filePath, newFilePath);
    return currentLocation
      .renameFilePromise(filePath, newFilePath, onProgress)
      .then((result) => {
        deignoreByWatcher(filePath, newFilePath);
        return getAllPropertiesPromise(newFilePath).then(
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
      });
  }

  function renameFilesPromise(
    renameJobs: Array<Array<string>>,
    onProgress = undefined,
    reflect = true,
  ): Promise<any> {
    const flatArray = renameJobs.flat();
    ignoreByWatcher(...flatArray);
    return executePromisesInBatches(
      renameJobs.map(async (renameJob) => {
        try {
          return await currentLocation.renameFilePromise(
            renameJob[0],
            renameJob[1],
            onProgress,
          );
        } catch (err) {
          console.warn('Error rename file:', err);
          return false;
        }
      }),
    ).then((ret) => {
      if (reflect) {
        const actions: TS.EditAction[] = renameJobs.map((job) => ({
          action: 'update',
          entry: currentLocation.toFsEntry(job[1], true, currentLocation.uuid),
          oldEntryPath: job[0],
        }));
        setReflectActions(...actions);
      }
      deignoreByWatcher(...flatArray);
      return ret;
    });
  }

  function moveFilePromise(
    filePath: string,
    newFilePath: string,
    onProgress = undefined,
    reflect = true,
  ): Promise<any> {
    ignoreByWatcher(filePath, newFilePath);
    return currentLocation
      .renameFilePromise(filePath, newFilePath, onProgress)
      .then((result) => {
        if (reflect) {
          reflectMoveFiles([[filePath, newFilePath]]);
        }
        deignoreByWatcher(filePath, newFilePath);
        return result;
      });
  }

  function moveFilesPromise(
    renameJobs: Array<Array<string>>,
    onProgress = undefined,
    reflect = true,
  ): Promise<any> {
    const flatArray = renameJobs.flat();
    ignoreByWatcher(...flatArray);
    return executePromisesInBatches(
      renameJobs.map(async (renameJob) => {
        try {
          return await currentLocation.renameFilePromise(
            renameJob[0],
            renameJob[1],
            onProgress,
          );
        } catch (err) {
          console.warn('Error rename file:', err);
          return undefined;
        }
      }),
    ).then((ret) => {
      deignoreByWatcher(...flatArray);
      const r = ret.filter((r) => r !== undefined);
      if (reflect && r.length > 0) {
        reflectMoveFiles(renameJobs);
      }
      return r;
    });
  }

  function reflectMoveFiles(moveJobs: Array<Array<string>>): Promise<boolean> {
    const promises = moveJobs.map((job) => {
      return getAllPropertiesPromise(job[1]).then(
        (newFsEntry: TS.FileSystemEntry) => {
          if (newFsEntry) {
            const actions: TS.EditAction[] = [
              {
                action: 'move',
                entry: newFsEntry,
                oldEntryPath: job[0],
              },
            ];
            return actions;
          }
          return undefined;
        },
      );
    });
    return Promise.all(promises).then((actionsArray) => {
      const actions = actionsArray.filter((a) => a !== undefined);
      if (actions.length > 0) {
        setReflectActions(...actions.flat());
      }
      return true;
    });
  }

  function renameDirectoryPromise(
    dirPath: string,
    newDirName: string,
  ): Promise<any> {
    ignoreByWatcher(dirPath, newDirName);
    return currentLocation
      .renameDirectoryPromise(dirPath, newDirName)
      .then((newDirPath) => {
        getAllPropertiesPromise(newDirPath).then(
          (fsEntry: TS.FileSystemEntry) =>
            setReflectActions({
              action: 'update',
              entry: fsEntry,
              oldEntryPath: dirPath,
            }),
        );
        deignoreByWatcher(dirPath, newDirName);
        return newDirPath;
      });
  }

  function copyDirectoryPromise(
    param: any,
    newDirPath: string,
    onProgress = undefined,
    reflect = true,
  ): Promise<any> {
    ignoreByWatcher(param.path, newDirPath);
    return currentLocation
      .copyDirectoryPromise(param, newDirPath, onProgress)
      .then((result) => {
        if (reflect) {
          getAllPropertiesPromise(param.path).then(
            (fsEntry: TS.FileSystemEntry) => reflectAddEntry(fsEntry),
          );
        }
        deignoreByWatcher(param.path, newDirPath);
        return result;
      });
  }

  function moveDirectoryPromise(
    param: any,
    newDirPath: string,
    onProgress = undefined,
    reflect = true,
  ): Promise<any> {
    ignoreByWatcher(param.path, newDirPath);
    return currentLocation
      .moveDirectoryPromise(param, newDirPath, onProgress)
      .then((result) => {
        if (reflect) {
          getAllPropertiesPromise(newDirPath).then(
            (fsEntry: TS.FileSystemEntry) =>
              setReflectActions({
                action: 'move',
                entry: fsEntry,
                oldEntryPath: param.path,
              }),
          );
        }

        deignoreByWatcher(param.path, newDirPath);
        return result;
      });
  }

  function saveFilePromise(
    param: any,
    content: any,
    overwrite: boolean,
    open: boolean = false,
  ): Promise<TS.FileSystemEntry> {
    ignoreByWatcher(param.path);
    return currentLocation
      .saveFilePromise(param, content, overwrite)
      .then((fsEntry) => {
        reflectAddEntry(fsEntry, open);
        deignoreByWatcher(param.path);
        return fsEntry;
      });
  }

  function saveTextFilePromise(
    param: any,
    content: string,
    isUpdated: boolean,
  ): Promise<TS.FileSystemEntry> {
    ignoreByWatcher(param.path);
    return currentLocation
      .saveTextFilePromise(param, content, isUpdated)
      .then((fsEntry) => {
        if (isUpdated) {
          setReflectActions({
            action: 'update',
            entry: fsEntry,
          });
        } else {
          reflectAddEntry(fsEntry);
        }
        deignoreByWatcher(param.path);
        return fsEntry;
      });
  }

  function saveBinaryFilePromise(
    param: any,
    content: any,
    overwrite: boolean,
    onUploadProgress?: (
      progress: any, // ManagedUpload.Progress,
      response: any, // AWS.Response<AWS.S3.PutObjectOutput, AWS.AWSError>
    ) => void,
    reflect: boolean = true,
  ): Promise<TS.FileSystemEntry> {
    ignoreByWatcher(param.path);
    return currentLocation
      .saveBinaryFilePromise(param, content, overwrite, onUploadProgress)
      .then((fsEntry) => {
        if (reflect) {
          reflectAddEntry(fsEntry, false);
        }
        deignoreByWatcher(param.path);
        return fsEntry;
      });
  }

  function deleteEntriesPromise(
    ...entries: TS.FileSystemEntry[]
  ): Promise<boolean> {
    if (entries.length > 0) {
      const entriesPaths = entries.map((e) => e.path);
      ignoreByWatcher(...entriesPaths);
      const promises = entries.map((e) => {
        if (e.isFile) {
          return currentLocation.deleteFilePromise(e.path, useTrashCan);
        }
        return currentLocation.deleteDirectoryPromise(e.path, useTrashCan);
      });
      return executePromisesInBatches(promises).then(() => {
        reflectDeleteEntries(...entries);
        deignoreByWatcher(...entriesPaths);
        return true;
      });
    }
    return Promise.resolve(false);
  }

  /*function loadTextFilePromise(
    locationID: string,
    path: string,
    isPreview?: boolean,
  ): Promise<string> {
    const location = findLocation(locationID);
    if(location){
      return location.loadTextFilePromise(path, isPreview);
    }
    return Promise.reject(new Error('loadTextFilePromise: no location locationID:'+locationID));
  }

  function getFileContentPromise(
    locationID: string,
    filePath: string,
    type?: string,
  ): Promise<string> {
    const location = findLocation(locationID);
    if(location){
      return location.getFileContentPromise(filePath, type);
    }
    return Promise.reject(new Error('getFileContentPromise: no location locationID:'+locationID));
  }*/

  const context = useMemo(() => {
    return {
      createDirectoryPromise,
      copyFilePromise,
      copyFilesWithProgress,
      copyFilePromiseOverwrite,
      renameFilePromise,
      renameFilesPromise,
      moveFilePromise,
      moveFilesPromise,
      reflectMoveFiles,
      renameDirectoryPromise,
      copyDirectoryPromise,
      moveDirectoryPromise,
      saveFilePromise,
      saveTextFilePromise,
      saveBinaryFilePromise,
      deleteEntriesPromise,
      setFolderThumbnailPromise,
    };
  }, [ignored, currentLocation]); //watcher

  return (
    <PlatformFacadeContext.Provider value={context}>
      {children}
    </PlatformFacadeContext.Provider>
  );
};
