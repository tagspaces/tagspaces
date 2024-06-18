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

type IsTruncatedConfirmDialogContextData = {
  openIsTruncatedConfirmDialog: () => void;
  closeIsTruncatedConfirmDialog: () => void;
};

export const IsTruncatedConfirmDialogContext =
  createContext<IsTruncatedConfirmDialogContextData>({
    openIsTruncatedConfirmDialog: undefined,
    closeIsTruncatedConfirmDialog: undefined,
  });

export type IsTruncatedConfirmDialogContextProviderProps = {
  children: React.ReactNode;
};

const IsTruncatedConfirmDialog = React.lazy(
  () =>
    import(
      /* webpackChunkName: "IsTruncatedConfirmDialog" */ '../IsTruncatedConfirmDialog'
    ),
);

export const IsTruncatedConfirmDialogContextProvider = ({
  children,
}: IsTruncatedConfirmDialogContextProviderProps) => {
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

  function IsTruncatedConfirmDialogAsync(props) {
    return (
      <React.Suspense fallback={<LoadingLazy />}>
        <IsTruncatedConfirmDialog {...props} />
      </React.Suspense>
    );
  }

  const context = useMemo(() => {
    return {
      openIsTruncatedConfirmDialog: openDialog,
      closeIsTruncatedConfirmDialog: closeDialog,
    };
  }, []);

  return (
    <IsTruncatedConfirmDialogContext.Provider value={context}>
      <IsTruncatedConfirmDialogAsync
        open={open.current}
        onClose={closeDialog}
      />
      {children}
    </IsTruncatedConfirmDialogContext.Provider>
  );
};
