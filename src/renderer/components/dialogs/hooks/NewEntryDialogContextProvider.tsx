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
import LoadingLazy from '-/components/LoadingLazy';

type NewEntryDialogContextData = {
  openNewEntryDialog: () => void;
  closeNewEntryDialog: () => void;
};

export const NewEntryDialogContext = createContext<NewEntryDialogContextData>({
  openNewEntryDialog: undefined,
  closeNewEntryDialog: undefined,
});

export type NewEntryDialogContextProviderProps = {
  children: React.ReactNode;
};

const NewEntryDialog = React.lazy(
  () => import(/* webpackChunkName: "NewEntryDialog" */ '../NewEntryDialog'),
);

export const NewEntryDialogContextProvider = ({
  children,
}: NewEntryDialogContextProviderProps) => {
  const open = useRef<boolean>(false);

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  function openDialog() {
    open.current = true;
    forceUpdate();
  }

  function closeDialog() {
    open.current = false;
    forceUpdate();
  }

  function NewEntryDialogAsync(props) {
    return (
      <React.Suspense fallback={<LoadingLazy />}>
        <NewEntryDialog {...props} />
      </React.Suspense>
    );
  }

  const context = useMemo(() => {
    return {
      openNewEntryDialog: openDialog,
      closeNewEntryDialog: closeDialog,
    };
  }, []);

  return (
    <NewEntryDialogContext.Provider value={context}>
      <NewEntryDialogAsync
        open={open.current}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            closeDialog();
          }
        }}
      />
      {children}
    </NewEntryDialogContext.Provider>
  );
};
