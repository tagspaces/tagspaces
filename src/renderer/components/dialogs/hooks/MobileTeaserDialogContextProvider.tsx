/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2026-present TagSpaces GmbH
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

import AppConfig from '-/AppConfig';
import LoadingLazy from '-/components/LoadingLazy';
import { isFirstRun, isMobileTeaserHidden } from '-/reducers/settings';
import React, {
  createContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import { useSelector } from 'react-redux';

type MobileTeaserDialogContextData = {
  openMobileTeaserDialog: (page?: 'ios' | 'android') => void;
  closeMobileTeaserDialog: () => void;
};

export const MobileTeaserDialogContext =
  createContext<MobileTeaserDialogContextData>({
    openMobileTeaserDialog: undefined,
    closeMobileTeaserDialog: undefined,
  });

export type MobileTeaserDialogContextProviderProps = {
  children: React.ReactNode;
};

const MobileTeaserDialog = React.lazy(
  () =>
    import(
      /* webpackChunkName: "MobileTeaserDialog" */ '../MobileTeaserDialog'
    ),
);

export function MobileTeaserDialogContextProvider({
  children,
}: MobileTeaserDialogContextProviderProps) {
  const open = useRef<boolean>(false);
  const slideIndex = useRef<number>(0);

  const firstRun: boolean = useSelector(isFirstRun);
  const teaserHidden: boolean = useSelector(isMobileTeaserHidden);
  // Snapshot firstRun at mount so a later flip to false (e.g. when a brand-new
  // user accepts the license this same session) does NOT trigger the teaser —
  // it targets returning users only.
  const firstRunAtMount = useRef<boolean>(firstRun);

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  function openDialog(page?: 'ios' | 'android') {
    slideIndex.current = page === 'android' ? 1 : 0;
    open.current = true;
    forceUpdate();
  }

  function closeDialog() {
    open.current = false;
    forceUpdate();
  }

  // Auto-open on startup for returning desktop (Electron) users only.
  // Fresh installs get the license/onboarding flow instead (excluded via
  // firstRunAtMount); native mobile and the web app never auto-show. Shows on
  // every startup until the user ticks "Do not show this again".
  //
  // When first-run/onboarding is controlled via extconfig (AppConfig.ExtIsFirstRun
  // is explicitly false — e.g. managed deployments and the e2e suite that boots
  // with scripts/extconfig.js), suppress the auto-open too: those environments
  // opt out of startup dialogs, and it keeps the teaser from popping over tests.
  // The Help-menu entries still open it on demand.
  useEffect(() => {
    if (
      AppConfig.isElectron &&
      !AppConfig.isNativeMobile &&
      AppConfig.ExtIsFirstRun !== false &&
      !firstRunAtMount.current &&
      !teaserHidden
    ) {
      openDialog();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const context = useMemo(() => {
    return {
      openMobileTeaserDialog: openDialog,
      closeMobileTeaserDialog: closeDialog,
    };
  }, []);

  return (
    <MobileTeaserDialogContext.Provider value={context}>
      {/* Render the lazy dialog inline (not via a nested component defined in
          render) so its component type stays stable. This provider re-renders
          whenever the tracked settings change (e.g. the "do not show again"
          switch), and a fresh nested component type would unmount/remount the
          whole dialog subtree — a visible flash. */}
      <React.Suspense fallback={<LoadingLazy />}>
        <MobileTeaserDialog
          open={open.current}
          onClose={closeDialog}
          slideIndex={slideIndex.current}
        />
      </React.Suspense>
      {children}
    </MobileTeaserDialogContext.Provider>
  );
}
