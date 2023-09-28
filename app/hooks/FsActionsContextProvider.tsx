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
import {
  actions as AppActions,
  AppDispatch,
  getDirectoryPath
} from '-/reducers/app';
import { useTranslation } from 'react-i18next';
import PlatformIO from '-/services/platform-facade';
import { extractDirectoryName } from '@tagspaces/tagspaces-common/paths';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import GlobalSearch from '-/services/search-index';
import { getUseTrashCan } from '-/reducers/settings';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';

type FsActionsContextData = {
  renameDirectory: (
    directoryPath: string,
    newDirectoryName: string
  ) => Promise<string>;
  createDirectory: (directoryPath: string, reflect?) => Promise<boolean>;
  deleteDirectory: (directoryPath: string) => Promise<boolean>;
};

export const FsActionsContext = createContext<FsActionsContextData>({
  renameDirectory: () => Promise.resolve(''),
  createDirectory: () => Promise.resolve(false),
  deleteDirectory: () => Promise.resolve(false)
});

export type FsActionsContextProviderProps = {
  children: React.ReactNode;
};

export const FsActionsContextProvider = ({
  children
}: FsActionsContextProviderProps) => {
  const { t } = useTranslation();
  const {
    openedEntries,
    reflectRenameDirectory,
    reflectDeleteDirectory
  } = useOpenedEntryContext();
  const {
    loadDirectoryContent,
    loadParentDirectoryContent
  } = useDirectoryContentContext();
  const dispatch: AppDispatch = useDispatch();
  const currentDirectoryPath = useSelector(getDirectoryPath);
  const useTrashCan = useSelector(getUseTrashCan);

  function renameDirectory(directoryPath: string, newDirectoryName: string) {
    return PlatformIO.renameDirectoryPromise(directoryPath, newDirectoryName)
      .then(newDirPath => {
        if (currentDirectoryPath === directoryPath) {
          loadDirectoryContent(newDirPath, false, true);
          reflectRenameDirectory(directoryPath, newDirPath);
          GlobalSearch.getInstance().reflectRenameEntry(
            directoryPath,
            newDirPath
          );
        } else {
          dispatch(AppActions.reflectRenameEntry(directoryPath, newDirPath));
        }

        dispatch(
          AppActions.showNotification(
            `Renaming directory ${extractDirectoryName(
              directoryPath,
              PlatformIO.getDirSeparator()
            )} successful.`,
            'default',
            true
          )
        );
        return newDirPath;
      })
      .catch(error => {
        console.warn('Error while renaming directory: ' + error);
        dispatch(
          AppActions.showNotification(
            `Error renaming directory '${extractDirectoryName(
              directoryPath,
              PlatformIO.getDirSeparator()
            )}'`,
            'error',
            true
          )
        );
        throw error;
      });
  }

  function createDirectory(directoryPath: string, reflect = true) {
    return PlatformIO.createDirectoryPromise(directoryPath)
      .then(result => {
        if (result !== undefined && result.dirPath !== undefined) {
          // eslint-disable-next-line no-param-reassign
          directoryPath = result.dirPath;
        }
        console.log(`Creating directory ${directoryPath} successful.`);
        if (reflect) {
          dispatch(AppActions.reflectCreateEntry(directoryPath, false));
        }
        dispatch(
          AppActions.showNotification(
            `Creating directory ${extractDirectoryName(
              directoryPath,
              PlatformIO.getDirSeparator()
            )} successful.`,
            'default',
            true
          )
        );
        return true;
      })
      .catch(error => {
        console.warn('Error creating directory: ' + error);
        dispatch(
          AppActions.showNotification(
            `Error creating directory '${extractDirectoryName(
              directoryPath,
              PlatformIO.getDirSeparator()
            )}'`,
            'error',
            true
          )
        );
        return false;
        // dispatch stopLoadingAnimation
      });
  }

  function deleteDirectory(directoryPath: string) {
    return PlatformIO.deleteDirectoryPromise(directoryPath, useTrashCan)
      .then(() => {
        if (directoryPath === currentDirectoryPath) {
          loadParentDirectoryContent();
          GlobalSearch.getInstance().reflectDeleteEntry(directoryPath);
          // close opened entries in deleted dir
          reflectDeleteDirectory(directoryPath);
        } else {
          dispatch(AppActions.reflectDeleteEntry(directoryPath));
        }
        dispatch(
          AppActions.showNotification(
            t(
              'deletingDirectorySuccessfull' as any,
              {
                dirPath: extractDirectoryName(
                  directoryPath,
                  PlatformIO.getDirSeparator()
                )
              } as any
            ) as string,
            'default',
            true
          )
        );
        return true;
      })
      .catch(error => {
        console.warn('Error while deleting directory: ' + error);
        dispatch(
          AppActions.showNotification(
            t(
              'errorDeletingDirectoryAlert' as any,
              {
                dirPath: extractDirectoryName(
                  directoryPath,
                  PlatformIO.getDirSeparator()
                )
              } as any
            ) as string,
            'error',
            true
          )
        );
        return false;
        // dispatch stopLoadingAnimation
      });
  }

  const context = useMemo(() => {
    return {
      renameDirectory,
      createDirectory,
      deleteDirectory
    };
  }, [openedEntries]);

  return (
    <FsActionsContext.Provider value={context}>
      {children}
    </FsActionsContext.Provider>
  );
};
