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

type KeyboardDialogContextData = {
  openKeyboardDialog: () => void;
  closeKeyboardDialog: () => void;
};

export const KeyboardDialogContext = createContext<KeyboardDialogContextData>({
  openKeyboardDialog: undefined,
  closeKeyboardDialog: undefined,
});

export type KeyboardDialogContextProviderProps = {
  children: React.ReactNode;
};

const KeyboardDialog = React.lazy(
  () => import(/* webpackChunkName: "KeyboardDialog" */ '../KeyboardDialog'),
);

export const KeyboardDialogContextProvider = ({
  children,
}: KeyboardDialogContextProviderProps) => {
  const open = useRef<boolean>(false);

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  useEffect(() => {
    if (AppConfig.isElectron) {
      window.electronIO.ipcRenderer.on('toggle-keys-dialog', (arg) => {
        openDialog();
      });

      return () => {
        if (window.electronIO.ipcRenderer) {
          window.electronIO.ipcRenderer.removeAllListeners(
            'toggle-keys-dialog',
          );
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

  function KeyboardDialogAsync(props) {
    return (
      <React.Suspense fallback={<LoadingLazy />}>
        <KeyboardDialog {...props} />
      </React.Suspense>
    );
  }

  const context = useMemo(() => {
    return {
      openKeyboardDialog: openDialog,
      closeKeyboardDialog: closeDialog,
    };
  }, []);

  return (
    <KeyboardDialogContext.Provider value={context}>
      <KeyboardDialogAsync open={open.current} onClose={closeDialog} />
      {children}
    </KeyboardDialogContext.Provider>
  );
};
