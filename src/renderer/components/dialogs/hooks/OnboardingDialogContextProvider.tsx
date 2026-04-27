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

import React, { createContext, useEffect, useMemo, useState } from 'react';
import LoadingLazy from '-/components/LoadingLazy';
import AppConfig from '-/AppConfig';

type OnboardingDialogContextData = {
  openOnboardingDialog: () => void;
  closeOnboardingDialog: () => void;
};

export const OnboardingDialogContext =
  createContext<OnboardingDialogContextData>({
    openOnboardingDialog: undefined,
    closeOnboardingDialog: undefined,
  });

export type OnboardingDialogContextProviderProps = {
  children: React.ReactNode;
};

const OnboardingDialog = React.lazy(
  () =>
    import(/* webpackChunkName: "OnboardingDialog" */ '../OnboardingDialog'),
);

export const OnboardingDialogContextProvider = ({
  children,
}: OnboardingDialogContextProviderProps) => {
  // Onboarding does not auto-open from state — it's chained from the
  // license-accept handler (LicenseDialogContextProvider) via this context,
  // and triggered manually via the help-menu IPC.
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    if (AppConfig.isElectron) {
      window.electronIO.ipcRenderer.on('toggle-onboarding-dialog', () => {
        setOpen(true);
      });

      return () => {
        if (window.electronIO.ipcRenderer) {
          window.electronIO.ipcRenderer.removeAllListeners(
            'toggle-onboarding-dialog',
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

  function OnboardingDialogAsync(props) {
    return (
      <React.Suspense fallback={<LoadingLazy />}>
        <OnboardingDialog {...props} />
      </React.Suspense>
    );
  }

  const context = useMemo(() => {
    return {
      openOnboardingDialog: openDialog,
      closeOnboardingDialog: closeDialog,
    };
  }, []);

  return (
    <OnboardingDialogContext.Provider value={context}>
      <OnboardingDialogAsync open={open} onClose={closeDialog} />
      {children}
    </OnboardingDialogContext.Provider>
  );
};
