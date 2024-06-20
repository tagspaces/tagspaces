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

type MoveOrCopyFilesDialogContextData = {
  openMoveOrCopyFilesDialog: (files: Array<File>) => void;
  closeMoveOrCopyFilesDialog: () => void;
};

export const MoveOrCopyFilesDialogContext =
  createContext<MoveOrCopyFilesDialogContextData>({
    openMoveOrCopyFilesDialog: undefined,
    closeMoveOrCopyFilesDialog: undefined,
  });

export type MoveOrCopyFilesDialogContextProviderProps = {
  children: React.ReactNode;
};

const MoveOrCopyFilesDialog = React.lazy(
  () =>
    import(
      /* webpackChunkName: "MoveOrCopyFilesDialog" */ '../MoveOrCopyFilesDialog'
    ),
);

export const MoveOrCopyFilesDialogContextProvider = ({
  children,
}: MoveOrCopyFilesDialogContextProviderProps) => {
  const open = useRef<boolean>(false);
  const files = useRef<Array<File>>(undefined);

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  function openDialog(selectedFiles: Array<File>) {
    open.current = true;
    files.current = selectedFiles;
    forceUpdate();
  }

  function closeDialog() {
    open.current = false;
    forceUpdate();
  }

  function MoveOrCopyFilesDialogAsync(props) {
    return (
      <React.Suspense fallback={<LoadingLazy />}>
        <MoveOrCopyFilesDialog {...props} />
      </React.Suspense>
    );
  }

  const context = useMemo(() => {
    return {
      openMoveOrCopyFilesDialog: openDialog,
      closeMoveOrCopyFilesDialog: closeDialog,
    };
  }, []);

  return (
    <MoveOrCopyFilesDialogContext.Provider value={context}>
      <MoveOrCopyFilesDialogAsync
        open={open.current}
        onClose={closeDialog}
        selectedFiles={files.current}
      />
      {children}
    </MoveOrCopyFilesDialogContext.Provider>
  );
};