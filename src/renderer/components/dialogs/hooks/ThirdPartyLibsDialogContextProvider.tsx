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

type ThirdPartyLibsDialogContextData = {
  openThirdPartyLibsDialog: () => void;
  closeThirdPartyLibsDialog: () => void;
};

export const ThirdPartyLibsDialogContext =
  createContext<ThirdPartyLibsDialogContextData>({
    openThirdPartyLibsDialog: undefined,
    closeThirdPartyLibsDialog: undefined,
  });

export type ThirdPartyLibsDialogContextProviderProps = {
  children: React.ReactNode;
};

const ThirdPartyLibsDialog = React.lazy(
  () =>
    import(
      /* webpackChunkName: "ThirdPartyLibsDialog" */ '../ThirdPartyLibsDialog'
    ),
);

export const ThirdPartyLibsDialogContextProvider = ({
  children,
}: ThirdPartyLibsDialogContextProviderProps) => {
  const open = useRef<boolean>(false);

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  useEffect(() => {
    if (AppConfig.isElectron) {
      window.electronIO.ipcRenderer.on(
        'toggle-third-party-libs-dialog',
        (arg) => {
          openDialog();
        },
      );

      return () => {
        if (window.electronIO.ipcRenderer) {
          window.electronIO.ipcRenderer.removeAllListeners(
            'toggle-third-party-libs-dialog',
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

  function ThirdPartyLibsDialogAsync(props) {
    return (
      <React.Suspense fallback={<LoadingLazy />}>
        <ThirdPartyLibsDialog {...props} />
      </React.Suspense>
    );
  }

  const context = useMemo(() => {
    return {
      openThirdPartyLibsDialog: openDialog,
      closeThirdPartyLibsDialog: closeDialog,
    };
  }, []);

  return (
    <ThirdPartyLibsDialogContext.Provider value={context}>
      <ThirdPartyLibsDialogAsync open={open.current} onClose={closeDialog} />
      {children}
    </ThirdPartyLibsDialogContext.Provider>
  );
};
