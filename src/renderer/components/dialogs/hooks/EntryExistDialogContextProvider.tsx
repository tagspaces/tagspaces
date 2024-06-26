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
import { useTranslation } from 'react-i18next';
import ConfirmDialog from '-/components/dialogs/ConfirmDialog';
import { TS } from '-/tagspaces.namespace';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';

type EntryExistDialogContextData = {
  handleEntryExist: (
    entries: TS.FileSystemEntry[],
    targetPath: string,
    targetLocationId?: string,
  ) => Promise<string[]>;
  openEntryExistDialog: (
    existPath: string[],
    confirmCallback: () => void,
  ) => void;
};

export const EntryExistDialogContext =
  createContext<EntryExistDialogContextData>({
    handleEntryExist: undefined,
    openEntryExistDialog: undefined,
  });

export type EntryExistDialogContextProviderProps = {
  children: React.ReactNode;
};

export const EntryExistDialogContextProvider = ({
  children,
}: EntryExistDialogContextProviderProps) => {
  const { t } = useTranslation();
  const { findLocation } = useCurrentLocationContext();
  const confirmOverride = useRef<() => void>(undefined);
  const entriesExistPath = useRef<string[]>([]);

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  async function handleEntryExist(
    entries: TS.FileSystemEntry[],
    targetPath: string,
    targetLocationId?: string,
  ): Promise<string[]> {
    if (entries) {
      let arrExist = [];
      const location = findLocation(targetLocationId);
      const selectedFiles = entries
        .filter((fsEntry) => fsEntry.isFile)
        .map((fsentry) => fsentry.path);
      if (selectedFiles.length > 0) {
        const exist = await location.checkFilesExistPromise(
          selectedFiles,
          targetPath,
        );
        if (exist.length > 0) {
          arrExist.push(...exist);
        }
      }
      const selectedDirs = entries
        .filter((fsEntry) => !fsEntry.isFile)
        .map((fsentry) => fsentry.path);

      if (selectedDirs.length > 0) {
        const exist = await location.checkDirsExistPromise(
          selectedDirs,
          targetPath,
        );
        if (exist.length > 0) {
          arrExist.push(...exist);
        }
      }
      if (arrExist.length > 0) {
        return arrExist;
      }
    }
    return Promise.resolve(undefined);
  }

  function openDialog(existPath: string[], confirmCallback: () => void) {
    confirmOverride.current = confirmCallback;
    entriesExistPath.current = existPath;
    forceUpdate();
  }

  function closeDialog() {
    entriesExistPath.current = [];
    forceUpdate();
  }

  function formatFileExist(entries) {
    if (entries !== undefined) {
      return entries.join(', ');
    }
    return '';
  }

  const context = useMemo(() => {
    return {
      handleEntryExist: handleEntryExist,
      openEntryExistDialog: openDialog,
      closeEntryExistDialog: closeDialog,
    };
  }, []);

  return (
    <EntryExistDialogContext.Provider value={context}>
      <ConfirmDialog
        open={entriesExistPath.current.length > 0}
        onClose={() => {
          closeDialog();
        }}
        title={t('core:confirm')}
        content={
          formatFileExist(entriesExistPath.current) +
          ' exist do you want to override it?'
        }
        confirmCallback={(result) => {
          if (result) {
            confirmOverride.current();
          } else {
            entriesExistPath.current = [];
          }
        }}
        cancelDialogTID="cancelOverwriteByCopyMoveDialog"
        confirmDialogTID="confirmOverwriteByCopyMoveDialog"
        confirmDialogContentTID="confirmDialogContent"
      />
      {children}
    </EntryExistDialogContext.Provider>
  );
};
