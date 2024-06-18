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
import { TS } from '-/tagspaces.namespace';

type EditEntryTagDialogContextData = {
  openEditEntryTagDialog: (tag: TS.Tag) => void;
  closeEditEntryTagDialog: () => void;
};

export const EditEntryTagDialogContext =
  createContext<EditEntryTagDialogContextData>({
    openEditEntryTagDialog: undefined,
    closeEditEntryTagDialog: undefined,
  });

export type EditEntryTagDialogContextProviderProps = {
  children: React.ReactNode;
};

const EditEntryTagDialog = React.lazy(
  () =>
    import(
      /* webpackChunkName: "EditEntryTagDialog" */ '../EditEntryTagDialog'
    ),
);

export const EditEntryTagDialogContextProvider = ({
  children,
}: EditEntryTagDialogContextProviderProps) => {
  const open = useRef<boolean>(false);
  const selectedTag = useRef<TS.Tag>(undefined);

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  function openDialog(tag: TS.Tag) {
    open.current = true;
    selectedTag.current = tag;
    forceUpdate();
  }

  function closeDialog() {
    open.current = false;
    forceUpdate();
  }

  function EditEntryTagDialogAsync(props) {
    return (
      <React.Suspense fallback={<LoadingLazy />}>
        <EditEntryTagDialog {...props} />
      </React.Suspense>
    );
  }

  const context = useMemo(() => {
    return {
      openEditEntryTagDialog: openDialog,
      closeEditEntryTagDialog: closeDialog,
    };
  }, []);

  return (
    <EditEntryTagDialogContext.Provider value={context}>
      <EditEntryTagDialogAsync
        open={open.current}
        onClose={closeDialog}
        tag={selectedTag.current}
      />
      {children}
    </EditEntryTagDialogContext.Provider>
  );
};
