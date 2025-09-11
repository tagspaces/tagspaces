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
import { getUuid } from '@tagspaces/tagspaces-common/utils-io';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useEditedEntryContext } from '-/hooks/useEditedEntryContext';
import { executePromisesInBatches } from '-/services/utils-io';
import { getUseTrashCan } from '-/reducers/settings';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import AppConfig from '-/AppConfig';
import { CommonLocation } from '-/utils/CommonLocation';

interface PlatformParms {
  path: string;
  lmdt?: number;
  locationID?: string;
  total?: number;
  encryptionKey?: string;
}
interface getLocationProps extends Omit<PlatformParms, 'path'> {
  // All the properties from PlatformParms, except 'path'
}
type PlatformFacadeContextData = {
  createDirectoryPromise: (
    path: string,
    locationID?: string,
    reflect?: boolean,
    open?: boolean,
    skipSelection?: boolean,
  ) => Promise<any>;
  copyFilePromise: (
    sourceFilePath: string,
    targetFilePath: string,
    locationID?: string,
    confirmMessage?: string,
  ) => Promise<any>;
  copyFilesWithProgress: (
    paths: Array<string>,
    targetPath: string,
    locationID: string,
    onProgress?,
    reflect?: boolean,
  ) => Promise<boolean>;
  copyFilePromiseOverwrite: (
    sourceFilePath: string,
    targetFilePath: string,
    locationID?: string,
    reflect?,
  ) => Promise<any>;
  renameFilePromise: (
    filePath: string,
    newFilePath: string,
    locationID: string,
    onProgress?,
    reflect?,
  ) => Promise<any>;
  renameFilesPromise: (
    renameJobs: Array<Array<string>>,
    locationID: string,
    onProgress?,
    reflect?,
  ) => Promise<any[]>;
  moveFilePromise: (
    param: PlatformParms,
    newFilePath: string,
    onProgress?,
    reflect?,
  ) => Promise<any>;
  moveFilesPromise: (
    renameJobs: Array<Array<string>>,
    locationID: string,
    onProgress?,
    reflect?,
    force?,
  ) => Promise<any[]>;
  reflectMoveFiles: (moveJobs: Array<Array<string>>) => Promise<boolean>;
  renameDirectoryPromise: (
    param: PlatformParms,
    newDirName: string,
  ) => Promise<any>;
  copyDirectoryPromise: (
    param: PlatformParms,
    newDirPath: string,
    onProgress?,
    reflect?,
  ) => Promise<any>;
  moveDirectoryPromise: (
    param: PlatformParms,
    newDirPath: string,
    onProgress?,
    reflect?,
  ) => Promise<any>;
  saveFilePromise: (
    param: PlatformParms,
    content: any,
    overwrite: boolean,
    open?: boolean,
  ) => Promise<any>;
  saveTextFilePromise: (
    param: PlatformParms,
    content: string,
    reflectUpdate: boolean,
  ) => Promise<any>;
  saveBinaryFilePromise: (
    param: PlatformParms,
    content: any,
    overwrite: boolean,
    onUploadProgress?: (
      progress: any, // ManagedUpload.Progress,
      response: any, // AWS.Response<AWS.S3.PutObjectOutput, AWS.AWSError>
    ) => void,
    reflect?: boolean | TS.ActionSource,
  ) => Promise<TS.FileSystemEntry>;
  deleteEntriesPromise: (...paths: TS.FileSystemEntry[]) => Promise<boolean>;
  setFolderThumbnailPromise: (
    filePath: string,
    force?: boolean,
  ) => Promise<string>;
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
  const { currentLocationId, findLocation } = useCurrentLocationContext();
  const { getAllPropertiesPromise } = useDirectoryContentContext();
  const { ignoreByWatcher, deignoreByWatcher, ignored } = useFSWatcherContext(); //watcher

  const { t } = useTranslation();
  const useTrashCan = useSelector(getUseTrashCan);

  function getLocation(param: getLocationProps): CommonLocation {
    const { locationID } = param;
    return findLocation(locationID);
  }

  function createDirectoryPromise(
    path: string,
    locationID?: string,
    reflect: boolean = true,
    open: boolean = true,
    skipSelection: boolean = false,
  ): Promise<any> {
    ignoreByWatcher(path);
    const currentLocation = getLocation({ locationID });
    return currentLocation.createDirectoryPromise(path).then((result) => {
      if (result !== undefined && reflect) {
        // do not reflect if directory not created
        reflectAddEntry(
          currentLocation.toFsEntry(path, false),
          open,
          'local',
          skipSelection,
        );
      }
      deignoreByWatcher(path);
      return result;
    });
  }

  /**
   * @param filePath
   * return Promise<destThumbPath>
   * @param force
   */
  function setFolderThumbnailPromise(
    filePath: string,
    force = true,
  ): Promise<string> {
    const currentLocation = findLocation();
    const directoryPath = extractContainingDirectoryPath(
      filePath,
      currentLocation?.getDirSeparator(),
    );
    const directoryName = extractDirectoryName(
      directoryPath,
      currentLocation?.getDirSeparator(),
    );
    const sourceThumbPath = getThumbFileLocationForFile(
      filePath,
      currentLocation?.getDirSeparator(),
      false,
    );

    const destThumbPath = getThumbFileLocationForDirectory(
      directoryPath,
      currentLocation?.getDirSeparator(),
    );

    return copyFilePromise(
      sourceThumbPath,
      destThumbPath,
      undefined,
      force ? t('core:thumbAlreadyExists', { directoryName }) : null,
    )
      .then(() => {
        //  dispatch(AppActions.setLastThumbnailImageChange(destThumbPath));
        return destThumbPath;
      })
      .catch((e) => {
        console.debug('set thumbnail for folder failed:', e);
        return undefined;
      });
  }

  function copyFilePromise(
    sourceFilePath: string,
    targetFilePath: string,
    locationID: string,
    confirmMessage?: string | null,
  ): Promise<any> {
    return getLocation({ locationID })
      .getPropertiesPromise(targetFilePath)
      .then((isTargetExist) => {
        if (isTargetExist) {
          const defaultConfirm = `File "${targetFilePath}" exists. Do you want to overwrite it?`;
          const text = confirmMessage ?? defaultConfirm;
          // eslint-disable-next-line no-alert
          const confirmOverwrite =
            confirmMessage !== null && window && window.confirm(text);
          if (confirmOverwrite === true) {
            return copyFilePromiseOverwrite(
              sourceFilePath,
              targetFilePath,
              locationID,
            );
          }
          // eslint-disable-next-line prefer-promise-reject-errors
          return Promise.reject(
            'File "' + targetFilePath + '" exists. Copying failed.',
          );
        }
        return copyFilePromiseOverwrite(
          sourceFilePath,
          targetFilePath,
          locationID,
        );
      });
  }

  function copyFilesWithProgress(
    paths: string[],
    targetPath: string,
    locationID: string,
    onProgress = undefined,
    reflect = true,
  ): Promise<boolean> {
    const controller = new AbortController();
    const signal = controller.signal;
    const location = findLocation(locationID);

    const ioJobPromises = paths.map((path) => {
      const targetFile =
        normalizePath(targetPath) +
        (location ? location.getDirSeparator() : AppConfig.dirSeparator) +
        extractFileName(path, location?.getDirSeparator());
      return {
        promise: copyFilePromiseOverwrite(path, targetFile, locationID, false),
        path: path,
      };
    });
    const progress = (completed, path) => {
      if (onProgress) {
        const progress = {
          loaded: completed, //processedSize,
          total: completed, //ioJobPromises.length,
          key: path, //targetPath,
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
        const targetPaths = paths.map((path) =>
          getAllPropertiesPromise(
            normalizePath(targetPath) +
              (location ? location.getDirSeparator() : AppConfig.dirSeparator) +
              extractFileName(path, location?.getDirSeparator()),
            locationID,
          ),
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
          console.log('Promise ' + path + ' error:', err);
          throw err; //return err;
        }),
    );

    // Use Promise.race() to wait for all progress promises to resolve
    return Promise.race(progressPromises)
      .then(() => Promise.all(promises))
      .catch((err) => {
        if (abortSignal.aborted) {
          aborted = true;
          console.log('Promise execution aborted');
        } else {
          throw err;
        }
      });
  }

  function copyFilePromiseOverwrite(
    sourceFilePath: string,
    targetFilePath: string,
    locationID: string,
    reflect: boolean = true,
  ): Promise<any> {
    ignoreByWatcher(targetFilePath);
    const location = getLocation({ locationID });
    return location
      .copyFilePromiseOverwrite(sourceFilePath, targetFilePath)
      .then((result) => {
        if (reflect) {
          getAllPropertiesPromise(targetFilePath, location.uuid).then(
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
   * @param locationID
   * @param onProgress
   * @param reflect
   * return Promise<TS.FileSystemEntry> new file entry renamed
   */
  function renameFilePromise(
    filePath: string,
    newFilePath: string,
    locationID: string = undefined,
    onProgress = undefined,
    reflect = true,
  ): Promise<TS.FileSystemEntry> {
    ignoreByWatcher(filePath, newFilePath);
    return getLocation({ locationID })
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
    locationID: string = undefined,
    onProgress = undefined,
    reflect = true,
  ): Promise<any[]> {
    const flatArray = renameJobs.flat();
    ignoreByWatcher(...flatArray);
    const location = getLocation({ locationID });
    return executePromisesInBatches(
      renameJobs.map(async (renameJob) => {
        try {
          return await location.renameFilePromise(
            renameJob[0],
            renameJob[1],
            onProgress,
          );
        } catch (err) {
          console.log('Error rename file:', err);
          return err; //false;
        }
      }),
    ).then((ret) => {
      if (reflect) {
        const actions: TS.EditAction[] = renameJobs.map((job) => ({
          action: 'update',
          entry: location.toFsEntry(job[1], true),
          oldEntryPath: job[0],
        }));
        setReflectActions(...actions);
      }
      deignoreByWatcher(...flatArray);
      return ret;
    });
  }

  function moveFilePromise(
    param: PlatformParms,
    newFilePath: string,
    onProgress = undefined,
    reflect = true,
  ): Promise<any> {
    ignoreByWatcher(param.path, newFilePath);
    return getLocation(param)
      .renameFilePromise(param.path, newFilePath, onProgress)
      .then((result) => {
        if (reflect) {
          reflectMoveFiles([[param.path, newFilePath]]);
        }
        deignoreByWatcher(param.path, newFilePath);
        return result;
      });
  }

  function moveFilesPromise(
    renameJobs: Array<Array<string>>,
    locationID: string,
    onProgress = undefined,
    reflect = true,
    force = false,
  ): Promise<any[]> {
    const flatArray = renameJobs.flat();
    ignoreByWatcher(...flatArray);
    return executePromisesInBatches(
      renameJobs.map(async (renameJob) => {
        try {
          return await getLocation({ locationID }).renameFilePromise(
            renameJob[0],
            renameJob[1],
            onProgress,
            force,
          );
        } catch (err) {
          console.log('Error rename file:', err);
          return err; //undefined;
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
    param: PlatformParms,
    newDirName: string,
  ): Promise<any> {
    ignoreByWatcher(param.path, newDirName);
    return getLocation(param)
      .renameDirectoryPromise(param.path, newDirName)
      .then((newDirPath) => {
        getAllPropertiesPromise(newDirPath).then(
          (fsEntry: TS.FileSystemEntry) =>
            setReflectActions({
              action: 'update',
              entry: fsEntry,
              oldEntryPath: param.path,
            }),
        );
        deignoreByWatcher(param.path, newDirName);
        return newDirPath;
      });
  }

  function copyDirectoryPromise(
    param: PlatformParms,
    newDirPath: string,
    onProgress = undefined,
    reflect = true,
  ): Promise<any> {
    ignoreByWatcher(param.path, newDirPath);
    return getLocation(param)
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
    param: PlatformParms,
    newDirPath: string,
    onProgress = undefined,
    reflect = true,
  ): Promise<any> {
    ignoreByWatcher(param.path, newDirPath);
    const location = getLocation(param);
    return location
      .moveDirectoryPromise(param, newDirPath, onProgress)
      .then((result) => {
        if (reflect) {
          getAllPropertiesPromise(newDirPath, location.uuid).then(
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
    param: PlatformParms,
    content: any,
    overwrite: boolean,
    open: boolean = false,
  ): Promise<TS.FileSystemEntry> {
    ignoreByWatcher(param.path);
    const location = getLocation(param);
    return location
      .saveFilePromise(param, content, overwrite)
      .then((fsEntry) => {
        const entry = {
          ...fsEntry,
          uuid: getUuid(),
          locationID: location.uuid,
        };
        reflectAddEntry(entry, open);
        deignoreByWatcher(param.path);
        return entry;
      });
  }

  function saveTextFilePromise(
    param: PlatformParms,
    content: string,
    reflectUpdate: boolean,
  ): Promise<TS.FileSystemEntry> {
    ignoreByWatcher(param.path);
    return getLocation(param)
      .saveTextFilePromise(param, content, true)
      .then((fsEntry) => {
        if (reflectUpdate) {
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
    param: PlatformParms,
    content: any,
    overwrite: boolean,
    onUploadProgress?: (
      progress: any, // ManagedUpload.Progress,
      response: any, // AWS.Response<AWS.S3.PutObjectOutput, AWS.AWSError>
    ) => void,
    reflect: boolean | TS.ActionSource = true,
  ): Promise<TS.FileSystemEntry> {
    ignoreByWatcher(param.path);
    const location = getLocation(param);
    return location
      .saveBinaryFilePromise(param, content, overwrite, onUploadProgress)
      .then((fsEntry: TS.FileSystemEntry) => {
        const entry = { ...fsEntry, locationID: location.uuid };
        if (reflect) {
          reflectAddEntry(
            entry,
            false,
            typeof reflect === 'boolean' ? 'local' : reflect,
          );
        }
        deignoreByWatcher(param.path);
        return entry;
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
          return getLocation(e).deleteFilePromise(e.path, useTrashCan);
        }
        return getLocation(e).deleteDirectoryPromise(e.path, useTrashCan);
      });
      return executePromisesInBatches(promises).then((success) => {
        reflectDeleteEntries(...entries);
        deignoreByWatcher(...entriesPaths);
        return !success.some((element) => !element);
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
  }, [ignored, currentLocationId]); //watcher

  return (
    <PlatformFacadeContext.Provider value={context}>
      {children}
    </PlatformFacadeContext.Provider>
  );
};
