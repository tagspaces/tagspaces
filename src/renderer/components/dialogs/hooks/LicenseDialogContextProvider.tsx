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
import { actions as SettingsActions, isFirstRun } from '-/reducers/settings';
import { AppDispatch } from '-/reducers/app';
import { useDispatch, useSelector } from 'react-redux';
import AppConfig from '-/AppConfig';

type LicenseDialogContextData = {
  openLicenseDialog: () => void;
  closeLicenseDialog: () => void;
};

export const LicenseDialogContext = createContext<LicenseDialogContextData>({
  openLicenseDialog: undefined,
  closeLicenseDialog: undefined,
});

export type LicenseDialogContextProviderProps = {
  children: React.ReactNode;
};

const LicenseDialog = React.lazy(
  () => import(/* webpackChunkName: "LicenseDialog" */ '../LicenseDialog'),
);

export const LicenseDialogContextProvider = ({
  children,
}: LicenseDialogContextProviderProps) => {
  const firstRun: boolean = useSelector(isFirstRun);
  const open = useRef<boolean>(firstRun);
  const dispatch: AppDispatch = useDispatch();

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  useEffect(() => {
    if (AppConfig.isElectron) {
      window.electronIO.ipcRenderer.on('toggle-license-dialog', () => {
        openDialog();
      });

      return () => {
        if (window.electronIO.ipcRenderer) {
          window.electronIO.ipcRenderer.removeAllListeners(
            'toggle-license-dialog',
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

  function LicenseDialogAsync(props) {
    return (
      <React.Suspense fallback={<LoadingLazy />}>
        <LicenseDialog {...props} />
      </React.Suspense>
    );
  }

  const context = useMemo(() => {
    return {
      openLicenseDialog: openDialog,
      closeLicenseDialog: closeDialog,
    };
  }, []);

  return (
    <LicenseDialogContext.Provider value={context}>
      <LicenseDialogAsync
        open={open.current}
        onClose={(event, reason) => {
          if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
            return true;
          }
          dispatch(SettingsActions.setFirstRun(false));
          closeDialog();
        }}
      />
      {children}
    </LicenseDialogContext.Provider>
  );
};
