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
import { useDispatch, useSelector } from 'react-redux';
import { actions as AppActions, AppDispatch } from '-/reducers/app';
import { useTranslation } from 'react-i18next';
import PlatformIO from '-/services/platform-facade';
import {
  extractDirectoryName,
  extractContainingDirectoryPath,
  getMetaFileLocationForFile,
  getThumbFileLocationForFile,
  extractFileName,
  extractTags,
} from '@tagspaces/tagspaces-common/paths';
import { formatDateTime4Tag } from '@tagspaces/tagspaces-common/misc';
import { generateFileName } from '-/services/utils-io';
import AppConfig from '-/AppConfig';
import {
  getPrefixTagContainer,
  getWarningOpeningFilesExternally,
} from '-/reducers/settings';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { useLocationIndexContext } from '-/hooks/useLocationIndexContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { usePlatformFacadeContext } from '-/hooks/usePlatformFacadeContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';

type FsActionsContextData = {
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

export const FsActionsContext = createContext<FsActionsContextData>({
  renameDirectory: () => Promise.resolve(''),
  renameFile: () => Promise.resolve(false),
  openFileNatively: undefined,
  duplicateFile: undefined,
});

export type FsActionsContextProviderProps = {
  children: React.ReactNode;
};

export const FsActionsContextProvider = ({
  children,
}: FsActionsContextProviderProps) => {
  const { t } = useTranslation();
  const { setSelectedEntries, selectedEntries } = useSelectedEntriesContext();
  const { reflectRenameOpenedEntry } = useOpenedEntryContext();
  const { openDirectory, currentDirectoryPath, reflectRenameEntries } =
    useDirectoryContentContext();
  const { reflectRenameEntry } = useLocationIndexContext();
  const { showNotification } = useNotificationContext();
  //const { watcher } = useFSWatcherContext();
  const {
    copyFilePromise,
    renameFilePromise,
    renameFilesPromise,
    renameDirectoryPromise,
  } = usePlatformFacadeContext();
  const dispatch: AppDispatch = useDispatch();
  const warningOpeningFilesExternally = useSelector(
    getWarningOpeningFilesExternally,
  );
  const prefixTagContainer = useSelector(getPrefixTagContainer);

  const renameDirectory = useMemo(() => {
    return (directoryPath: string, newDirectoryName: string): Promise<string> =>
      renameDirectoryPromise(directoryPath, newDirectoryName)
        .then((newDirPath) => {
          if (currentDirectoryPath === directoryPath) {
            openDirectory(newDirPath).then(() => {
              //reflectRenameOpenedEntry(directoryPath, newDirPath);
              reflectRenameEntry(directoryPath, newDirPath);
            });
          } else {
            reflectRenameEntries([[directoryPath, newDirPath]]).then(() => {
              reflectRenameOpenedEntry(directoryPath, newDirPath);
              reflectRenameEntry(directoryPath, newDirPath);
              /*dispatch(
                AppActions.reflectRenameEntry(directoryPath, newDirPath),
              );*/
            });
          }
          setSelectedEntries([]);

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
  }, [reflectRenameEntries]);

  const renameFile = useMemo(() => {
    return (
      filePath: string,
      newFilePath: string,
      reflect: boolean = true,
    ): Promise<boolean> =>
      renameFilePromise(filePath, newFilePath)
        .then((result) => {
          const newFilePathFromPromise = result[1];
          console.info('File renamed ' + filePath + ' to ' + newFilePath);
          showNotification(t('core:renamingSuccessfully'), 'default', true);
          // Update sidecar file and thumb
          return renameFilesPromise([
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
          ])
            .then(() => {
              if (reflect) {
                reflectRenameEntries([[filePath, newFilePathFromPromise]]).then(
                  () => {
                    reflectRenameOpenedEntry(filePath, newFilePathFromPromise);
                    reflectRenameEntry(filePath, newFilePathFromPromise);
                    /*dispatch(
                      AppActions.reflectRenameEntry(
                        filePath,
                        newFilePathFromPromise,
                      ),
                    );*/
                  },
                );
              }
              // setSelectedEntries([]);
              console.info(
                'Renaming meta file and thumb successful from ' +
                  filePath +
                  ' to:' +
                  newFilePath,
              );
              return true;
            })
            .catch((err) => {
              if (reflect) {
                reflectRenameEntries([[filePath, newFilePathFromPromise]]).then(
                  () => {
                    reflectRenameOpenedEntry(filePath, newFilePathFromPromise);
                    reflectRenameEntry(filePath, newFilePathFromPromise);
                    /*dispatch(
                      AppActions.reflectRenameEntry(
                        filePath,
                        newFilePathFromPromise,
                      ),
                    );*/
                  },
                );
              }
              // setSelectedEntries([]);
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
  }, [reflectRenameEntries]);

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
        .then(() => {
          // if (onDuplicateFile) {
          //  onDuplicateFile(dirPath);
          // } else {
          return openDirectory(dirPath);
          // }
          // return true;
        })
        .catch((error) => {
          showNotification('Error creating duplicate: ', error);
        });
    }
    showNotification('Unanble to duplicate, no file selected');
  }

  const context = useMemo(() => {
    return {
      renameDirectory,
      renameFile,
      openFileNatively,
      duplicateFile,
    };
  }, [renameDirectory, renameFile]); //, watcher

  return (
    <FsActionsContext.Provider value={context}>
      {children}
    </FsActionsContext.Provider>
  );
};
