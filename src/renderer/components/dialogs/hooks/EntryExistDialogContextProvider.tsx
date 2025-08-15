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

import React, { createContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TS } from '-/tagspaces.namespace';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';

type EntryExistDialogContextData = {
  handleEntryExist: (
    entries: TS.FileSystemEntry[],
    targetPath: string,
    targetLocationId?: string,
    confirmCallback?: () => void,
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
  const { openConfirmDialog } = useNotificationContext();

  async function handleEntryExist(
    entries: TS.FileSystemEntry[],
    targetPath: string,
    targetLocationId?: string,
    confirmCallback?: () => void,
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
        if (confirmCallback) {
          openDialog(arrExist, confirmCallback);
        }
        return arrExist;
      }
    }

    if (confirmCallback) {
      confirmCallback();
    }
    return Promise.resolve(undefined);
  }

  function openDialog(existPath: string[], confirmCallback: () => void) {
    if (existPath && existPath.length > 0) {
      openConfirmDialog(
        t('core:confirm'),
        formatFileExist(existPath) + ' exist do you want to override it?',
        (result) => {
          if (result) {
            confirmCallback();
          }
        },
        'cancelOverwriteByCopyMoveDialog',
        'confirmOverwriteByCopyMoveDialog',
        'confirmDialogContent',
      );
    }
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
    };
  }, []);

  return (
    <EntryExistDialogContext.Provider value={context}>
      {children}
    </EntryExistDialogContext.Provider>
  );
};
