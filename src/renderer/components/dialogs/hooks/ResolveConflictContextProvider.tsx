/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces GmbH
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

import LoadingLazy from '-/components/LoadingLazy';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useEditedEntryContext } from '-/hooks/useEditedEntryContext';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { usePlatformFacadeContext } from '-/hooks/usePlatformFacadeContext';
import { Pro } from '-/pro';
import { isRevisionsEnabled } from '-/reducers/settings';
import { TS } from '-/tagspaces.namespace';
import {
  cleanTrailingDirSeparator,
  extractContainingDirectoryPath,
  getBackupFileDir,
  getBackupFileLocation,
  isMeta,
} from '@tagspaces/tagspaces-common/paths';
import React, { createContext, useMemo, useReducer, useRef } from 'react';
import { useSelector } from 'react-redux';

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
            if (
              cleanTrailingDirSeparator(currentDirectoryPath) ===
              cleanTrailingDirSeparator(openedEntryDir)
            ) {
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
      // write revisions
      if (Pro && revisionsEnabled && !isMeta(fileOpen.path)) {
        const id = await getMetadataID(fileOpen.path, fileOpen.uuid, location);
        const backupDir = getBackupFileDir(fileOpen.path, fileOpen.uuid);
        location.listDirectoryPromise(backupDir, []).then(async (backup) => {
          const haveBackup = backup.some((b) =>
            b.path.endsWith(fileOpen.extension),
          );
          if (!haveBackup) {
            try {
              const targetPath = getBackupFileLocation(
                fileOpen.path,
                id,
                location.getDirSeparator(),
              );
              await copyFilePromiseOverwrite(
                fileOpen.path,
                targetPath,
                fileOpen.locationID,
                false,
              );
            } catch (error) {
              console.log('copyFilePromiseOverwrite', error);
            }
          }
        });
        // wait 5ms in order ot get older timestamp
        await new Promise((resolve) => setTimeout(resolve, 5));
        const targetPath = getBackupFileLocation(
          fileOpen.path,
          id,
          location.getDirSeparator(),
        );
        await saveTextFilePromise(
          {
            path: targetPath,
            locationID: fileOpen.locationID,
          },
          textContent,
          false,
        );
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
