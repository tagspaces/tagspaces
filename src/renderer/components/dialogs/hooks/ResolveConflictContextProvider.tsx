/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces UG (haftungsbeschraenkt)
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

import React, { createContext, useMemo, useReducer, useRef } from 'react';
import {
  extractContainingDirectoryPath,
  getBackupFileLocation,
} from '@tagspaces/tagspaces-common/paths';
import LoadingLazy from '-/components/LoadingLazy';
import { TS } from '-/tagspaces.namespace';
import { Pro } from '-/pro';
import AppConfig from '-/AppConfig';
import { useEditedEntryContext } from '-/hooks/useEditedEntryContext';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import { usePlatformFacadeContext } from '-/hooks/usePlatformFacadeContext';
import { useSelector } from 'react-redux';
import { isRevisionsEnabled } from '-/reducers/settings';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';

type ResolveConflictContextData = {
  openResolveConflictDialog: (oEntry: TS.OpenedEntry, fContent: string) => void;
  closeResolveConflictDialog: () => void;
  saveFileOpen: (
    fileOpen: TS.OpenedEntry,
    textContent: string,
  ) => Promise<boolean>;
};

export const ResolveConflictContext = createContext<ResolveConflictContextData>(
  {
    openResolveConflictDialog: undefined,
    closeResolveConflictDialog: undefined,
    saveFileOpen: undefined,
  },
);

export type ResolveConflictContextProviderProps = {
  children: React.ReactNode;
};

const ResolveConflictDialog = React.lazy(
  () =>
    import(
      /* webpackChunkName: "ResolveConflictDialog" */ '../ResolveConflictDialog'
    ),
);

export const ResolveConflictContextProvider = ({
  children,
}: ResolveConflictContextProviderProps) => {
  const open = useRef<boolean>(false);
  const openedEntry = useRef<TS.OpenedEntry>(undefined);
  const fileContent = useRef<string>(undefined);

  const { findLocation } = useCurrentLocationContext();
  const { currentDirectoryPath, openDirectory } = useDirectoryContentContext();
  const { copyFilePromiseOverwrite, copyFilePromise, saveTextFilePromise } =
    usePlatformFacadeContext();
  const { getMetadataID } = useIOActionsContext();
  const { reflectUpdateOpenedFileContent } = useOpenedEntryContext();
  const { setReflectActions } = useEditedEntryContext();

  const revisionsEnabled = useSelector(isRevisionsEnabled);

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  function openDialog(oEntry: TS.OpenedEntry, fContent: string) {
    open.current = true;
    openedEntry.current = oEntry;
    fileContent.current = fContent;
    forceUpdate();
  }

  function closeDialog() {
    open.current = false;
    forceUpdate();
  }

  const override = (): Promise<boolean> => {
    const cLocation = findLocation(openedEntry.current.locationID);
    return cLocation
      .getPropertiesPromise(openedEntry.current.path)
      .then((entryProp: TS.FileSystemEntry) =>
        saveFileOpen(
          { ...openedEntry.current, lmdt: entryProp.lmdt },
          fileContent.current,
        ),
      );
  };

  const saveAs = (newFilePath: string): Promise<boolean> => {
    const cLocation = findLocation(openedEntry.current.locationID);
    return copyFilePromise(openedEntry.current.path, newFilePath).then(() =>
      cLocation
        .getPropertiesPromise(newFilePath)
        .then((entryProp: TS.FileSystemEntry) =>
          saveFileOpen(
            {
              ...openedEntry.current,
              path: entryProp.path,
              lmdt: entryProp.lmdt,
            },
            fileContent.current,
          ).then(() => {
            const openedEntryDir = extractContainingDirectoryPath(
              entryProp.path,
            );
            if (currentDirectoryPath === openedEntryDir) {
              return openDirectory(openedEntryDir).then(() => true);
            }
            return true;
          }),
        ),
    );
  };

  async function saveFileOpen(
    fileOpen: TS.OpenedEntry,
    textContent: string,
  ): Promise<boolean> {
    const location = findLocation(fileOpen.locationID);
    if (location) {
      if (
        Pro &&
        revisionsEnabled &&
        fileOpen.path.indexOf(
          location.getDirSeparator() +
            AppConfig.metaFolder +
            location.getDirSeparator(),
        ) === -1
      ) {
        const id = await getMetadataID(fileOpen.path, fileOpen.uuid, location);
        const targetPath = getBackupFileLocation(
          fileOpen.path,
          id,
          location.getDirSeparator(),
        );
        try {
          await copyFilePromiseOverwrite(
            fileOpen.path,
            targetPath,
            fileOpen.locationID,
            false,
          ); // todo test what happened if remove await?
        } catch (error) {
          console.log('copyFilePromiseOverwrite', error);
        }
      }
      return saveTextFilePromise(
        {
          path: fileOpen.path,
          lmdt: fileOpen.lmdt,
          locationID: fileOpen.locationID,
        },
        textContent,
        true,
      )
        .then((entry) => {
          reflectUpdateOpenedFileContent(entry);
          // send action to save in history
          const action: TS.EditAction = {
            action: 'edit',
            entry: entry,
          };
          setReflectActions(action);
          return true;
        })
        .catch((error) => {
          openDialog(fileOpen, textContent);
          console.log('Error saving file ' + fileOpen.path + ' - ' + error);
          return false;
        });
    }
  }

  function ResolveConflictDialogAsync(props) {
    return (
      <React.Suspense fallback={<LoadingLazy />}>
        <ResolveConflictDialog {...props} />
      </React.Suspense>
    );
  }

  const context = useMemo(() => {
    return {
      openResolveConflictDialog: openDialog,
      closeResolveConflictDialog: closeDialog,
      saveFileOpen: saveFileOpen,
    };
  }, []);

  return (
    <ResolveConflictContext.Provider value={context}>
      <ResolveConflictDialogAsync
        open={open.current}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            closeDialog();
          }
        }}
        openedEntry={openedEntry.current}
        override={override}
        saveAs={saveAs}
      />
      {children}
    </ResolveConflictContext.Provider>
  );
};
