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

import React, {
  createContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import LoadingLazy from '-/components/LoadingLazy';
import AppConfig from '-/AppConfig';
import { actions as SettingsActions } from '-/reducers/settings';

type NewFileDialogContextData = {
  openNewFileDialog: () => void;
  closeNewFileDialog: () => void;
};

export const NewFileDialogContext = createContext<NewFileDialogContextData>({
  openNewFileDialog: undefined,
  closeNewFileDialog: undefined,
});

export type NewFileDialogContextProviderProps = {
  children: React.ReactNode;
};

const NewFileDialog = React.lazy(
  () => import(/* webpackChunkName: "NewFileDialog" */ '../NewFileDialog'),
);

export const NewFileDialogContextProvider = ({
  children,
}: NewFileDialogContextProviderProps) => {
  const open = useRef<boolean>(false);

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  useEffect(() => {
    if (AppConfig.isElectron) {
      window.electronIO.ipcRenderer.on('cmd', (arg) => {
        if (arg === 'new-text-file') {
          openDialog();
        }
      });

      return () => {
        if (window.electronIO.ipcRenderer) {
          window.electronIO.ipcRenderer.removeAllListeners('cmd');
        }
      };
    }
  }, []);

  function openDialog() {
    open.current = true;
    forceUpdate();
  }

  function closeDialog() {
    open.current = false;
    forceUpdate();
  }

  function NewFileDialogAsync(props) {
    return (
      <React.Suspense fallback={<LoadingLazy />}>
        <NewFileDialog {...props} />
      </React.Suspense>
    );
  }

  const context = useMemo(() => {
    return {
      openNewFileDialog: openDialog,
      closeNewFileDialog: closeDialog,
    };
  }, []);

  return (
    <NewFileDialogContext.Provider value={context}>
      <NewFileDialogAsync
        open={open.current}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            closeDialog();
          }
        }}
      />
      {children}
    </NewFileDialogContext.Provider>
  );
};
