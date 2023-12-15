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
import { useDispatch } from 'react-redux';

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
  ) => Promise<any>;
  renameFilesPromise: (
    renameJobs: Array<Array<string>>,
    onProgress?,
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
  deleteFilePromise: (path: string, useTrash?: boolean) => Promise<any>;
  deleteFilesPromise: (filePathList: Array<string>) => Promise<any>;
  deleteDirectoryPromise: (path: string, useTrash?: boolean) => Promise<any>;
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
  deleteFilePromise: undefined,
  deleteFilesPromise: undefined,
  deleteDirectoryPromise: undefined,
  setFolderThumbnailPromise: undefined,
});

export type PlatformFacadeContextProviderProps = {
  children: React.ReactNode;
};

export const PlatformFacadeContextProvider = ({
  children,
}: PlatformFacadeContextProviderProps) => {
  const { ignoreByWatcher, deignoreByWatcher, ignored } = useFSWatcherContext(); //watcher

  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();

  function createDirectoryPromise(path: string): Promise<any> {
    ignoreByWatcher(path);

    return PlatformFacade.createDirectoryPromise(path).then((result) => {
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
      deignoreByWatcher(targetFilePath);
      return result;
    });
  }

  function renameFilePromise(
    filePath: string,
    newFilePath: string,
    onProgress = undefined,
  ): Promise<any> {
    ignoreByWatcher(filePath, newFilePath);
    return PlatformFacade.renameFilePromise(
      filePath,
      newFilePath,
      onProgress,
    ).then((result) => {
      deignoreByWatcher(filePath, newFilePath);
      return result;
    });
  }

  function renameFilesPromise(
    renameJobs: Array<Array<string>>,
    onProgress = undefined,
  ): Promise<any> {
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
    );
  }

  function renameDirectoryPromise(
    dirPath: string,
    newDirName: string,
  ): Promise<any> {
    ignoreByWatcher(dirPath, newDirName);
    return PlatformFacade.renameDirectoryPromise(dirPath, newDirName).then(
      (result) => {
        deignoreByWatcher(dirPath, newDirName);
        return result;
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
      deignoreByWatcher(param.path, newDirPath);
      return result;
    });
  }
  function saveFilePromise(
    param: any,
    content: any,
    overwrite: boolean,
  ): Promise<any> {
    ignoreByWatcher(param.path);
    return PlatformFacade.saveFilePromise(param, content, overwrite).then(
      (result) => {
        deignoreByWatcher(param.path);
        return result;
      },
    );
  }

  function saveTextFilePromise(
    param: any,
    content: string,
    overwrite: boolean,
  ): Promise<any> {
    ignoreByWatcher(param.path);
    return PlatformFacade.saveTextFilePromise(param, content, overwrite).then(
      (result) => {
        deignoreByWatcher(param.path);
        return result;
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
    ).then((result) => {
      deignoreByWatcher(param.path);
      return result;
    });
  }

  function deleteFilePromise(path: string, useTrash?: boolean): Promise<any> {
    ignoreByWatcher(path);

    return PlatformFacade.deleteFilePromise(path, useTrash).then((result) => {
      deignoreByWatcher(path);
      return result;
    });
  }

  function deleteFilesPromise(filePathList: Array<string>) {
    const fileDeletionPromises = [];
    filePathList.forEach((filePath) => {
      fileDeletionPromises.push(deleteFilePromise(filePath));
    });
    return Promise.all(fileDeletionPromises);
  }

  function deleteDirectoryPromise(
    path: string,
    useTrash?: boolean,
  ): Promise<any> {
    ignoreByWatcher(path);

    return PlatformFacade.deleteDirectoryPromise(path, useTrash).then(
      (result) => {
        deignoreByWatcher(path);
        return result;
      },
    );
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
      deleteFilePromise,
      deleteFilesPromise,
      deleteDirectoryPromise,
      setFolderThumbnailPromise,
    };
  }, [ignored]); //watcher

  return (
    <PlatformFacadeContext.Provider value={context}>
      {children}
    </PlatformFacadeContext.Provider>
  );
};
