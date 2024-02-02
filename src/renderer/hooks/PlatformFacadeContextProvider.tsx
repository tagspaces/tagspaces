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
import PlatformFacade from '-/services/platform-facade';
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
import { actions as AppActions, AppDispatch } from '-/reducers/app';
import { useDispatch, useSelector } from 'react-redux';
import { useEditedEntryContext } from '-/hooks/useEditedEntryContext';
import { getAllPropertiesPromise, toFsEntry } from '-/services/utils-io';
import { getUseTrashCan } from '-/reducers/settings';

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
  ) => Promise<any>;
  copyFilePromiseOverwrite: (
    sourceFilePath: string,
    targetFilePath: string,
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
  renameDirectoryPromise: (dirPath: string, newDirName: string) => Promise<any>;
  copyDirectoryPromise: (
    param: any,
    newDirPath: string,
    onProgress?,
  ) => Promise<any>;
  moveDirectoryPromise: (
    param: any,
    newDirPath: string,
    onProgress?,
  ) => Promise<any>;
  saveFilePromise: (
    param: any,
    content: any,
    overwrite: boolean,
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
  const { reflectAddEntry, reflectDeleteEntries, setReflectActions } =
    useEditedEntryContext();
  const { ignoreByWatcher, deignoreByWatcher, ignored } = useFSWatcherContext(); //watcher

  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const useTrashCan = useSelector(getUseTrashCan);

  function createDirectoryPromise(path: string): Promise<any> {
    ignoreByWatcher(path);

    return PlatformFacade.createDirectoryPromise(path).then((result) => {
      reflectAddEntry(toFsEntry(path, false));
      deignoreByWatcher(path);
      return result;
    });
  }

  /**
   * @param filePath
   * return Promise<directoryPath> of directory in order to open Folder properties next
   */
  function setFolderThumbnailPromise(filePath: string): Promise<string> {
    const directoryPath = extractContainingDirectoryPath(
      filePath,
      PlatformFacade.getDirSeparator(),
    );
    const directoryName = extractDirectoryName(
      directoryPath,
      PlatformFacade.getDirSeparator(),
    );
    const sourceThumbPath = getThumbFileLocationForFile(
      filePath,
      PlatformFacade.getDirSeparator(),
      false,
    );

    const destThumbPath = getThumbFileLocationForDirectory(
      directoryPath,
      PlatformFacade.getDirSeparator(),
    );

    return copyFilePromise(
      sourceThumbPath,
      destThumbPath,
      t('core:thumbAlreadyExists', { directoryName }),
    ).then(() => {
      dispatch(AppActions.setLastThumbnailImageChange(destThumbPath));
      return directoryPath;
    });
  }

  function copyFilePromise(
    sourceFilePath: string,
    targetFilePath: string,
    confirmMessage: string = 'File ' +
      targetFilePath +
      ' exist do you want to override it?',
  ): Promise<any> {
    return PlatformFacade.getPropertiesPromise(targetFilePath).then(
      (isTargetExist) => {
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
      },
    );
  }

  function copyFilesWithProgress(
    paths: Array<string>,
    targetPath: string,
    onProgress = undefined,
  ) {
    const controller = new AbortController();
    const signal = controller.signal;

    const ioJobPromises = paths.map((path) => {
      const targetFile =
        normalizePath(targetPath) +
        PlatformFacade.getDirSeparator() +
        extractFileName(path, PlatformFacade.getDirSeparator());
      return {
        promise: copyFilePromiseOverwrite(path, targetFile),
        path: path,
      };
    });
    const progress = (completed, path) => {
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
    };
    return trackProgress(ioJobPromises, signal, progress);
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
  ): Promise<any> {
    ignoreByWatcher(targetFilePath);
    return PlatformFacade.copyFilePromiseOverwrite(
      sourceFilePath,
      targetFilePath,
    ).then((result) => {
      getAllPropertiesPromise(targetFilePath).then(
        (fsEntry: TS.FileSystemEntry) => reflectAddEntry(fsEntry),
      );
      deignoreByWatcher(targetFilePath);
      return result;
    });
  }

  function renameFilePromise(
    filePath: string,
    newFilePath: string,
    onProgress = undefined,
    reflect = true,
  ): Promise<any> {
    ignoreByWatcher(filePath, newFilePath);
    return PlatformFacade.renameFilePromise(
      filePath,
      newFilePath,
      onProgress,
    ).then((result) => {
      getAllPropertiesPromise(newFilePath).then(
        (fsEntry: TS.FileSystemEntry) => {
          if (reflect) {
            setReflectActions({
              action: 'update',
              entry: fsEntry,
              oldEntryPath: filePath,
            });
          }
        },
      );
      deignoreByWatcher(filePath, newFilePath);
      return result;
    });
  }

  function renameFilesPromise(
    renameJobs: Array<Array<string>>,
    onProgress = undefined,
    reflect = true,
  ): Promise<any> {
    const flatArray = renameJobs.flat();
    ignoreByWatcher(...flatArray);
    return Promise.all(
      renameJobs.map(async (renameJob) => {
        try {
          return await PlatformFacade.renameFilePromise(
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
          entry: toFsEntry(job[1], true),
          oldEntryPath: job[0],
        }));
        setReflectActions(...actions);
      }
      deignoreByWatcher(...flatArray);
      return ret;
    });
  }

  function renameDirectoryPromise(
    dirPath: string,
    newDirName: string,
  ): Promise<any> {
    ignoreByWatcher(dirPath, newDirName);
    return PlatformFacade.renameDirectoryPromise(dirPath, newDirName).then(
      (newDirPath) => {
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
      },
    );
  }

  function copyDirectoryPromise(
    param: any,
    newDirPath: string,
    onProgress = undefined,
  ): Promise<any> {
    ignoreByWatcher(param.path, newDirPath);
    return PlatformFacade.copyDirectoryPromise(
      param,
      newDirPath,
      onProgress,
    ).then((result) => {
      getAllPropertiesPromise(param.path).then((fsEntry: TS.FileSystemEntry) =>
        reflectAddEntry(fsEntry),
      );
      deignoreByWatcher(param.path, newDirPath);
      return result;
    });
  }

  function moveDirectoryPromise(
    param: any,
    newDirPath: string,
    onProgress = undefined,
  ): Promise<any> {
    ignoreByWatcher(param.path, newDirPath);
    return PlatformFacade.moveDirectoryPromise(
      param,
      newDirPath,
      onProgress,
    ).then((result) => {
      getAllPropertiesPromise(newDirPath).then((fsEntry: TS.FileSystemEntry) =>
        setReflectActions(
          { action: 'delete', entry: toFsEntry(param.path, false) },
          { action: 'add', entry: fsEntry },
        ),
      );

      deignoreByWatcher(param.path, newDirPath);
      return result;
    });
  }

  function saveFilePromise(
    param: any,
    content: any,
    overwrite: boolean,
  ): Promise<TS.FileSystemEntry> {
    ignoreByWatcher(param.path);
    return PlatformFacade.saveFilePromise(param, content, overwrite).then(
      (fsEntry) => {
        reflectAddEntry(fsEntry);
        deignoreByWatcher(param.path);
        return fsEntry;
      },
    );
  }

  function saveTextFilePromise(
    param: any,
    content: string,
    overwrite: boolean,
  ): Promise<TS.FileSystemEntry> {
    ignoreByWatcher(param.path);
    return PlatformFacade.saveTextFilePromise(param, content, overwrite).then(
      (fsEntry) => {
        reflectAddEntry(fsEntry);
        deignoreByWatcher(param.path);
        return fsEntry;
      },
    );
  }

  function saveBinaryFilePromise(
    param: any,
    content: any,
    overwrite: boolean,
    onUploadProgress?: (
      progress: any, // ManagedUpload.Progress,
      response: any, // AWS.Response<AWS.S3.PutObjectOutput, AWS.AWSError>
    ) => void,
  ): Promise<TS.FileSystemEntry> {
    ignoreByWatcher(param.path);
    return PlatformFacade.saveBinaryFilePromise(
      param,
      content,
      overwrite,
      onUploadProgress,
    ).then((fsEntry) => {
      reflectAddEntry(fsEntry);
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
          return PlatformFacade.deleteFilePromise(e.path, useTrashCan);
        }
        return PlatformFacade.deleteDirectoryPromise(e.path, useTrashCan);
      });
      return Promise.all(promises).then(() => {
        reflectDeleteEntries(...entries);
        deignoreByWatcher(...entriesPaths);
        return true;
      });
    }
    return Promise.resolve(false);
  }

  const context = useMemo(() => {
    return {
      createDirectoryPromise,
      copyFilePromise,
      copyFilesWithProgress,
      copyFilePromiseOverwrite,
      renameFilePromise,
      renameFilesPromise,
      renameDirectoryPromise,
      copyDirectoryPromise,
      moveDirectoryPromise,
      saveFilePromise,
      saveTextFilePromise,
      saveBinaryFilePromise,
      deleteEntriesPromise,
      setFolderThumbnailPromise,
    };
  }, [ignored]); //watcher

  return (
    <PlatformFacadeContext.Provider value={context}>
      {children}
    </PlatformFacadeContext.Provider>
  );
};
