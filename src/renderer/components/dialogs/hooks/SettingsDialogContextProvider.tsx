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

type SettingsDialogContextData = {
  openSettingsDialog: () => void;
  closeSettingsDialog: () => void;
};

export const SettingsDialogContext = createContext<SettingsDialogContextData>({
  openSettingsDialog: undefined,
  closeSettingsDialog: undefined,
});

export type SettingsDialogContextProviderProps = {
  children: React.ReactNode;
};

const SettingsDialog = React.lazy(
  () =>
    import(
      /* webpackChunkName: "SettingsDialog" */ '../settings/SettingsDialog'
    ),
);

export const SettingsDialogContextProvider = ({
  children,
}: SettingsDialogContextProviderProps) => {
  const open = useRef<boolean>(false);

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  useEffect(() => {
    if (AppConfig.isElectron) {
      window.electronIO.ipcRenderer.on('cmd', (arg) => {
        if (arg === 'toggle-settings-dialog') {
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

  function SettingsDialogAsync(props) {
    return (
      <React.Suspense fallback={<LoadingLazy />}>
        <SettingsDialog {...props} />
      </React.Suspense>
    );
  }

  const context = useMemo(() => {
    return {
      openSettingsDialog: openDialog,
      closeSettingsDialog: closeDialog,
    };
  }, []);

  return (
    <SettingsDialogContext.Provider value={context}>
      <SettingsDialogAsync open={open.current} onClose={closeDialog} />
      {children}
    </SettingsDialogContext.Provider>
  );
};
