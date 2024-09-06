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
import LoadingLazy from '-/components/LoadingLazy';

type CreateEditLocationDialogContextData = {
  openCreateEditLocationDialog: () => void;
  closeCreateEditLocationDialog: () => void;
};

export const CreateEditLocationDialogContext =
  createContext<CreateEditLocationDialogContextData>({
    openCreateEditLocationDialog: undefined,
    closeCreateEditLocationDialog: undefined,
  });

export type CreateEditLocationDialogContextProviderProps = {
  children: React.ReactNode;
};

const CreateEditLocationDialog = React.lazy(
  () =>
    import(
      /* webpackChunkName: "CreateEditLocationDialog" */ '../CreateEditLocationDialog'
    ),
);

export const CreateEditLocationDialogContextProvider = ({
  children,
}: CreateEditLocationDialogContextProviderProps) => {
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

  function CreateEditLocationDialogAsync(props) {
    return (
      <React.Suspense fallback={<LoadingLazy />}>
        <CreateEditLocationDialog {...props} />
      </React.Suspense>
    );
  }

  const context = useMemo(() => {
    return {
      openCreateEditLocationDialog: openDialog,
      closeCreateEditLocationDialog: closeDialog,
    };
  }, []);

  return (
    <CreateEditLocationDialogContext.Provider value={context}>
      <CreateEditLocationDialogAsync
        open={open.current}
        onClose={closeDialog}
      />
      {children}
    </CreateEditLocationDialogContext.Provider>
  );
};
