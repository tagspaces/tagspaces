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
import { SettingsTab } from '-/components/dialogs/SettingsDialog';

type SettingsDialogContextData = {
  openSettingsDialog: (tab?: SettingsTab) => void;
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
  () => import(/* webpackChunkName: "SettingsDialog" */ '../SettingsDialog'),
);

export const SettingsDialogContextProvider = ({
  children,
}: SettingsDialogContextProviderProps) => {
  const currentTab = useRef<SettingsTab>(SettingsTab.General);
  const open = useRef<boolean>(false);

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  useEffect(() => {
    if (AppConfig.isElectron) {
      window.electronIO.ipcRenderer.on('toggle-settings-dialog', () => {
        openDialog();
      });

      return () => {
        if (window.electronIO.ipcRenderer) {
          window.electronIO.ipcRenderer.removeAllListeners(
            'toggle-settings-dialog',
          );
        }
      };
    }
  }, []);

  function openDialog(tab: SettingsTab = SettingsTab.General) {
    currentTab.current = tab;
    open.current = true;
    forceUpdate();
  }

  function closeDialog() {
    open.current = false;
    currentTab.current = SettingsTab.General;
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
      <SettingsDialogAsync
        open={open.current}
        tab={currentTab.current}
        onClose={closeDialog}
      />
      {children}
    </SettingsDialogContext.Provider>
  );
};
