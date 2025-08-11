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
import React, { createContext, useMemo, useReducer, useRef } from 'react';

type ImportMacTagDialogContextData = {
  openImportMacTagDialog: (directoryPath: string) => void;
  closeImportMacTagDialog: () => void;
};

export const ImportMacTagDialogContext =
  createContext<ImportMacTagDialogContextData>({
    openImportMacTagDialog: () => {
      throw new Error(
        'openImportMacTagDialog must be used within a ImportMacTagDialogContextProvider',
      );
    },
    closeImportMacTagDialog: () => {
      throw new Error(
        'closeImportMacTagDialog must be used within a ImportMacTagDialogContextProvider',
      );
    },
  });

export type ImportMacTagDialogContextProviderProps = {
  children: React.ReactNode;
};

const ImportMacTagDialog = React.lazy(
  () =>
    import(
      /* webpackChunkName: "ImportMacTagDialog" */ '../ImportMacTagDialog'
    ),
);

export const ImportMacTagDialogContextProvider = ({
  children,
}: ImportMacTagDialogContextProviderProps) => {
  const open = useRef<boolean>(false);
  const directoryPath = useRef<string>(undefined);

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  function openDialog(path) {
    open.current = true;
    directoryPath.current = path;
    forceUpdate();
  }

  function closeDialog() {
    open.current = false;
    directoryPath.current = undefined;
    forceUpdate();
  }

  function ImportMacTagDialogAsync(props) {
    return (
      <React.Suspense fallback={<LoadingLazy />}>
        <ImportMacTagDialog {...props} />
      </React.Suspense>
    );
  }

  const context = useMemo(() => {
    return {
      openImportMacTagDialog: openDialog,
      closeImportMacTagDialog: closeDialog,
    };
  }, []);

  return (
    <ImportMacTagDialogContext.Provider value={context}>
      <ImportMacTagDialogAsync
        open={open.current}
        directoryPath={directoryPath.current}
        onClose={closeDialog}
      />
      {children}
    </ImportMacTagDialogContext.Provider>
  );
};
