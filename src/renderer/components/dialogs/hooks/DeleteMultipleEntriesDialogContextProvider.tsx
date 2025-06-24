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

import React, { createContext, useMemo, useReducer, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import LoadingLazy from '-/components/LoadingLazy';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';

type DeleteMultipleEntriesDialogContextData = {
  openDeleteMultipleEntriesDialog: (callback?: () => void) => void;
  closeDeleteMultipleEntriesDialog: () => void;
};

export const DeleteMultipleEntriesDialogContext =
  createContext<DeleteMultipleEntriesDialogContextData>({
    openDeleteMultipleEntriesDialog: undefined,
    closeDeleteMultipleEntriesDialog: undefined,
  });

export type DeleteMultipleEntriesDialogContextProviderProps = {
  children: React.ReactNode;
};

const DeleteMultipleEntriesDialog = React.lazy(
  () =>
    import(
      /* webpackChunkName: "DeleteMultipleEntriesDialog" */ '../ConfirmDialog'
    ),
);

export const DeleteMultipleEntriesDialogContextProvider = ({
  children,
}: DeleteMultipleEntriesDialogContextProviderProps) => {
  const { t } = useTranslation();
  const { deleteEntries } = useIOActionsContext();
  const { selectedEntries } = useSelectedEntriesContext(); // todo don't use context provider here pass it like props in openDialog
  const { showNotification } = useNotificationContext();
  const open = useRef<boolean>(false);
  const callback = useRef<() => void>(undefined);

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  function openDialog(callbackFn?: () => void) {
    open.current = true;
    callback.current = callbackFn;
    forceUpdate();
  }

  function closeDialog() {
    open.current = false;
    forceUpdate();
  }

  function DeleteMultipleEntriesDialogAsync(props) {
    return (
      <React.Suspense fallback={<LoadingLazy />}>
        <DeleteMultipleEntriesDialog {...props} />
      </React.Suspense>
    );
  }

  const context = useMemo(() => {
    return {
      openDeleteMultipleEntriesDialog: openDialog,
      closeDeleteMultipleEntriesDialog: closeDialog,
    };
  }, [selectedEntries]);

  function deleteSelectedEntries() {
    if (selectedEntries) {
      deleteEntries(...selectedEntries).then((success) => {
        if (success) {
          //&& selectedEntries.length > 1) {
          showNotification(
            t('core:deletingEntriesSuccessful', {
              dirPath: selectedEntries
                .map((fsEntry) => fsEntry.name)
                .toString(),
            }),
            'default',
            true,
          );
          if (callback.current) {
            callback.current();
          }
          return true;
        }
        return false;
      });
    }
  }

  return (
    <DeleteMultipleEntriesDialogContext.Provider value={context}>
      <DeleteMultipleEntriesDialogAsync
        open={open.current}
        onClose={closeDialog}
        title={t('core:deleteConfirmationTitle')}
        content={t('core:deleteConfirmationContent')}
        list={selectedEntries.map((fsEntry) => fsEntry.name)}
        confirmCallback={(result) => result && deleteSelectedEntries()}
        cancelDialogTID="cancelDeleteFileDialog"
        confirmDialogTID="confirmDeleteFileDialog"
        confirmDialogContentTID="confirmDeleteDialogContent"
      />
      {children}
    </DeleteMultipleEntriesDialogContext.Provider>
  );
};
