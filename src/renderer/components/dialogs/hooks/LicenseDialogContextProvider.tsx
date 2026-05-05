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
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import LoadingLazy from '-/components/LoadingLazy';
import {
  actions as SettingsActions,
  isFirstRun,
  isOnboardingCompleted,
} from '-/reducers/settings';
import { AppDispatch } from '-/reducers/app';
import { useDispatch, useSelector } from 'react-redux';
import AppConfig from '-/AppConfig';
import { OnboardingDialogContext } from '-/components/dialogs/hooks/OnboardingDialogContextProvider';

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
  const onboardingCompleted: boolean = useSelector(isOnboardingCompleted);
  const [open, setOpen] = useState<boolean>(false);
  const dispatch: AppDispatch = useDispatch();
  const { openOnboardingDialog } = useContext(OnboardingDialogContext);

  // Auto-open whenever firstRun becomes true. This covers fresh installs
  // (defaults to true) and manual resets (Settings → Restore Defaults clears
  // localStorage, reload re-applies defaults). Reactive — works regardless
  // of redux-persist rehydration timing.
  useEffect(() => {
    if (firstRun) setOpen(true);
  }, [firstRun]);

  useEffect(() => {
    if (AppConfig.isElectron) {
      window.electronIO.ipcRenderer.on('toggle-license-dialog', () => {
        setOpen(true);
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
    setOpen(true);
  }

  function closeDialog() {
    setOpen(false);
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
        open={open}
        onClose={(event, reason) => {
          if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
            return true;
          }
          const wasFirstRun = firstRun;
          dispatch(SettingsActions.setFirstRun(false));
          closeDialog();
          // Chain into the onboarding wizard only on the very first run,
          // and only if the user has not already completed it (e.g. via the
          // help-menu re-trigger). Existing users who re-open the license
          // dialog from the menu should not get the wizard popped up.
          if (wasFirstRun && !onboardingCompleted && openOnboardingDialog) {
            openOnboardingDialog();
          }
        }}
      />
      {children}
    </LicenseDialogContext.Provider>
  );
};
