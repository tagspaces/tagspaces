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

import React, {
  createContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import LoadingLazy from '-/components/LoadingLazy';
import AppConfig from '-/AppConfig';

type CreateDirectoryDialogContextData = {
  openCreateDirectoryDialog: (
    selectedDirectoryPath?: string,
    callback?: (newDirPath: string) => void,
    skipSelection?: boolean,
  ) => void;
  closeCreateDirectoryDialog: () => void;
};

export const CreateDirectoryDialogContext =
  createContext<CreateDirectoryDialogContextData>({
    openCreateDirectoryDialog: undefined,
    closeCreateDirectoryDialog: undefined,
  });

export type CreateDirectoryDialogContextProviderProps = {
  children: React.ReactNode;
};

const CreateDirectoryDialog = React.lazy(
  () =>
    import(
      /* webpackChunkName: "CreateDirectoryDialog" */ '../CreateDirectoryDialog'
    ),
);

export const CreateDirectoryDialogContextProvider = ({
  children,
}: CreateDirectoryDialogContextProviderProps) => {
  const open = useRef<boolean>(false);
  const selectedDirectoryPath = useRef<string>(undefined);
  const skipSelection = useRef<boolean>(false);
  const callbackFn = useRef<(newDirPath: string) => void>(undefined);

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  useEffect(() => {
    if (AppConfig.isElectron) {
      window.electronIO.ipcRenderer.on('show-create-directory-dialog', () => {
        openDialog(undefined, (dirPath) => {
          console.log(dirPath);
        });
      });

      return () => {
        if (window.electronIO.ipcRenderer) {
          window.electronIO.ipcRenderer.removeAllListeners(
            'show-create-directory-dialog',
          );
        }
      };
    }
  }, []);

  function openDialog(
    directoryPath: string,
    callback: (newDirPath: string) => void,
    skipSel: boolean = false,
  ) {
    open.current = true;
    selectedDirectoryPath.current = directoryPath;
    skipSelection.current = skipSel;
    callbackFn.current = callback;
    forceUpdate();
  }

  function closeDialog() {
    open.current = false;
    forceUpdate();
  }

  function CreateDirectoryDialogAsync(props) {
    return (
      <React.Suspense fallback={<LoadingLazy />}>
        <CreateDirectoryDialog {...props} />
      </React.Suspense>
    );
  }

  const context = useMemo(() => {
    return {
      openCreateDirectoryDialog: openDialog,
      closeCreateDirectoryDialog: closeDialog,
    };
  }, []);

  return (
    <CreateDirectoryDialogContext.Provider value={context}>
      <CreateDirectoryDialogAsync
        open={open.current}
        onClose={closeDialog}
        selectedDirectoryPath={selectedDirectoryPath.current}
        skipSelection={skipSelection.current}
        callback={callbackFn.current}
      />
      {children}
    </CreateDirectoryDialogContext.Provider>
  );
};
