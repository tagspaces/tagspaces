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

import { ErrorBoundary } from '-/components/ErrorBoundary';
import LoadingLazy from '-/components/LoadingLazy';
import TsDialogTitle from '-/components/dialogs/components/TsDialogTitle';
import {
  getPerspectiveMeta,
  loadExternalPerspectiveOnboarding,
  perspectiveHasOnboarding,
} from '-/perspectives';
import i18n from '-/services/i18n';
import { AppDispatch } from '-/reducers/app';
import { actions as SettingsActions } from '-/reducers/settings';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import React, { createContext, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

type PerspectiveOnboardingContextData = {
  openPerspectiveOnboarding: (perspectiveId: string) => void;
  closePerspectiveOnboarding: () => void;
};

export const PerspectiveOnboardingContext =
  createContext<PerspectiveOnboardingContextData>({
    openPerspectiveOnboarding: () => {},
    closePerspectiveOnboarding: () => {},
  });

export type PerspectiveOnboardingContextProviderProps = {
  children: React.ReactNode;
};

// Cache lazy onboarding components by perspective ID so each chunk is only
// fetched once across the lifetime of the app.
const onboardingLazyCache: Record<string, React.LazyExoticComponent<any>> = {};

function getOnboardingLazy(
  perspectiveId: string,
): React.LazyExoticComponent<any> | undefined {
  if (onboardingLazyCache[perspectiveId]) {
    return onboardingLazyCache[perspectiveId];
  }
  // Predicate-based gate so we don't fire the dynamic import twice (once
  // for the probe, once inside React.lazy). The discarded probe promise
  // would otherwise leak as an unhandled rejection on chunk-load failure.
  if (!perspectiveHasOnboarding(perspectiveId)) return undefined;
  onboardingLazyCache[perspectiveId] = React.lazy(
    () => loadExternalPerspectiveOnboarding(perspectiveId)!,
  );
  return onboardingLazyCache[perspectiveId];
}

export const PerspectiveOnboardingContextProvider = ({
  children,
}: PerspectiveOnboardingContextProviderProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const dispatch: AppDispatch = useDispatch();
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));

  function openDialog(perspectiveId: string) {
    if (!perspectiveId) return;
    setActiveId(perspectiveId);
  }

  function closeDialog() {
    if (activeId) {
      // Persist that the user has now seen this perspective's onboarding.
      // Manual re-opens from Settings clear the seen flag first, so this
      // simply re-marks it on close.
      dispatch(SettingsActions.markPerspectiveOnboardingSeen(activeId));
    }
    setActiveId(null);
  }

  const context = useMemo(
    () => ({
      openPerspectiveOnboarding: openDialog,
      closePerspectiveOnboarding: closeDialog,
    }),
    // openDialog/closeDialog are stable closures over setActiveId/dispatch
    // which are themselves stable. activeId changes are picked up via the
    // closeDialog reference at the moment it runs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeId],
  );

  const meta = activeId ? getPerspectiveMeta(activeId) : undefined;
  const title = meta ? meta.title : '';
  const Body = activeId ? getOnboardingLazy(activeId) : undefined;

  return (
    <PerspectiveOnboardingContext.Provider value={context}>
      <Dialog
        open={Boolean(activeId)}
        onClose={closeDialog}
        fullScreen={smallScreen}
        maxWidth="sm"
        fullWidth
        scroll="paper"
      >
        <TsDialogTitle
          dialogTitle={title}
          closeButtonTestId="closePerspectiveOnboardingTID"
          onClose={closeDialog}
        />
        <DialogContent>
          {Body && activeId && (
            <ErrorBoundary
              title={i18n.t('core:onboardingFailedToLoad')}
              label={`${i18n.t('core:perspectiveLabel')} ${activeId}`}
              resetKeys={[activeId]}
            >
              <React.Suspense fallback={<LoadingLazy />}>
                {React.createElement(Body as any, {
                  onClose: closeDialog,
                  perspectiveId: activeId,
                })}
              </React.Suspense>
            </ErrorBoundary>
          )}
        </DialogContent>
      </Dialog>
      {children}
    </PerspectiveOnboardingContext.Provider>
  );
};
