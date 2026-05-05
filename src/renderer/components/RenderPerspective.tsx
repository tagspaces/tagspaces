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

import React, { useEffect } from 'react';

import AppConfig from '-/AppConfig';

import CustomDragLayer from '-/components/CustomDragLayer';
import LoadingLazy from '-/components/LoadingLazy';
import TargetFileBox from '-/components/TargetFileBox';
import { usePerspectiveOnboardingContext } from '-/components/dialogs/hooks/usePerspectiveOnboardingContext';
import { PaginationContextProvider } from '-/hooks/PaginationContextProvider';
import { PerspectiveSettingsContextProvider } from '-/hooks/PerspectiveSettingsContextProvider';
import { ThumbGenerationContextProvider } from '-/hooks/ThumbGenerationContextProvider';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import {
  AvailablePerspectives,
  hasExternalPerspectiveComponent,
  loadExternalPerspectiveComponent,
  PerspectiveIDs,
  perspectiveHasOnboarding,
} from '-/perspectives';
import PerspectiveErrorBoundary from '-/perspectives/PerspectiveErrorBoundary';
import { SortedDirContextProvider } from '-/perspectives/grid/hooks/SortedDirContextProvider';
import { Pro } from '-/pro';
import { getSeenPerspectiveOnboardings } from '-/reducers/settings';
import { NativeTypes } from 'react-dnd-html5-backend';
import { useSelector } from 'react-redux';

const GridPerspective = React.lazy(
  () =>
    import(/* webpackChunkName: "GridPerspective" */ '../perspectives/grid'),
);

function GridPerspectiveAsync(props) {
  return (
    <React.Suspense fallback={<LoadingLazy />}>
      <PerspectiveSettingsContextProvider>
        <SortedDirContextProvider>
          <PaginationContextProvider>
            <ThumbGenerationContextProvider>
              <GridPerspective {...props} />
            </ThumbGenerationContextProvider>
          </PaginationContextProvider>
        </SortedDirContextProvider>
      </PerspectiveSettingsContextProvider>
    </React.Suspense>
  );
}

const ListPerspective = React.lazy(
  () =>
    import(/* webpackChunkName: "ListPerspective" */ '../perspectives/list'),
);
function ListPerspectiveAsync(props) {
  return (
    <React.Suspense fallback={<LoadingLazy />}>
      <PerspectiveSettingsContextProvider>
        <SortedDirContextProvider>
          <PaginationContextProvider>
            <ThumbGenerationContextProvider>
              <ListPerspective {...props} />
            </ThumbGenerationContextProvider>
          </PaginationContextProvider>
        </SortedDirContextProvider>
      </PerspectiveSettingsContextProvider>
    </React.Suspense>
  );
}

let GalleryPerspective = React.Fragment;
if (Pro && Pro.Perspectives && Pro.Perspectives.GalleryPerspective) {
  // GalleryPerspective = React.lazy(() => import(/* webpackChunkName: "GalleryPerspective" */ '../node_modules/@tagspaces/pro/modules/perspectives/gallery'));

  GalleryPerspective = Pro.Perspectives.GalleryPerspective;
}
function GalleryPerspectiveAsync(props) {
  return (
    <React.Suspense fallback={<LoadingLazy />}>
      <PerspectiveSettingsContextProvider>
        <ThumbGenerationContextProvider>
          <GalleryPerspective {...props} />
        </ThumbGenerationContextProvider>
      </PerspectiveSettingsContextProvider>
    </React.Suspense>
  );
}

let MapiquePerspective = React.Fragment;
if (Pro && Pro.Perspectives && Pro.Perspectives.MapiquePerspective) {
  // MapiquePerspective = React.lazy(() => import(/* webpackChunkName: "MapiquePerspective" */ '../node_modules/@tagspaces/pro/modules/perspectives/mapique'));
  MapiquePerspective = Pro.Perspectives.MapiquePerspective;
}
function MapiquePerspectiveAsync(props) {
  return (
    <React.Suspense fallback={<LoadingLazy />}>
      <ThumbGenerationContextProvider>
        <MapiquePerspective {...props} />
      </ThumbGenerationContextProvider>
    </React.Suspense>
  );
}

let KanBanPerspective = React.Fragment;
if (Pro && Pro.Perspectives && Pro.Perspectives.KanBanPerspective) {
  KanBanPerspective = Pro.Perspectives.KanBanPerspective;
}
function KanBanPerspectiveAsync(props) {
  return (
    <React.Suspense fallback={<LoadingLazy />}>
      <PerspectiveSettingsContextProvider>
        <Pro.Perspectives.KanBanSortedDirContextProvider>
          <ThumbGenerationContextProvider>
            <KanBanPerspective {...props} />
          </ThumbGenerationContextProvider>
        </Pro.Perspectives.KanBanSortedDirContextProvider>
      </PerspectiveSettingsContextProvider>
    </React.Suspense>
  );
}

let FolderVizPerspective = React.Fragment;
if (Pro && Pro.Perspectives && Pro.Perspectives.FolderVizPerspective) {
  FolderVizPerspective = Pro.Perspectives.FolderVizPerspective;
}
function FolderVizPerspectiveAsync(props) {
  return (
    <React.Suspense fallback={<LoadingLazy />}>
      <PerspectiveSettingsContextProvider>
        <ThumbGenerationContextProvider>
          <FolderVizPerspective {...props} />
        </ThumbGenerationContextProvider>
      </PerspectiveSettingsContextProvider>
    </React.Suspense>
  );
}

let CalendarPerspective = React.Fragment;
if (Pro && Pro.Perspectives && Pro.Perspectives.CalendarPerspective) {
  CalendarPerspective = Pro.Perspectives.CalendarPerspective;
}
function CalendarPerspectiveAsync(props) {
  return (
    <React.Suspense fallback={<LoadingLazy />}>
      <PerspectiveSettingsContextProvider>
        <ThumbGenerationContextProvider>
          <CalendarPerspective {...props} />
        </ThumbGenerationContextProvider>
      </PerspectiveSettingsContextProvider>
    </React.Suspense>
  );
}

// Cache of lazy components for external (package-shipped) perspectives.
// Each entry is created on first render of that perspective and reused on
// subsequent switches so the chunk is only fetched once.
const externalLazyCache: Record<string, React.LazyExoticComponent<any>> = {};

function getExternalPerspectiveLazy(
  perspectiveId: string,
): React.LazyExoticComponent<any> | undefined {
  if (externalLazyCache[perspectiveId]) {
    return externalLazyCache[perspectiveId];
  }
  // Predicate-based gate so we don't kick off the dynamic import twice
  // (once to probe, once inside React.lazy) — the discarded probe promise
  // would otherwise leak as an unhandled rejection if the chunk failed.
  if (!hasExternalPerspectiveComponent(perspectiveId)) return undefined;
  externalLazyCache[perspectiveId] = React.lazy(
    () => loadExternalPerspectiveComponent(perspectiveId)!,
  );
  return externalLazyCache[perspectiveId];
}

function ExternalPerspectiveAsync({
  perspectiveId,
}: {
  perspectiveId: string;
}) {
  const Comp = getExternalPerspectiveLazy(perspectiveId);
  if (!Comp) return null;
  // Error boundary isolates failures in package-shipped code (chunk-load
  // errors, render-time exceptions in the perspective module) so a crash
  // shows an inline error instead of taking down the directory pane.
  return (
    <PerspectiveErrorBoundary perspectiveId={perspectiveId} context="render">
      <React.Suspense fallback={<LoadingLazy />}>
        <PerspectiveSettingsContextProvider>
          <SortedDirContextProvider>
            <PaginationContextProvider>
              <ThumbGenerationContextProvider>
                <Comp />
              </ThumbGenerationContextProvider>
            </PaginationContextProvider>
          </SortedDirContextProvider>
        </PerspectiveSettingsContextProvider>
      </React.Suspense>
    </PerspectiveErrorBoundary>
  );
}

const WelcomePanel = React.lazy(
  () => import(/* webpackChunkName: "WelcomePanel" */ './WelcomePanel'),
);
function WelcomePanelAsync(props) {
  return (
    <React.Suspense fallback={<LoadingLazy />}>
      <WelcomePanel {...props} />
    </React.Suspense>
  );
}

interface Props {}

function RenderPerspective(props: Props) {
  const { currentLocationId } = useCurrentLocationContext();
  const { currentPerspective } = useDirectoryContentContext();
  const { openPerspectiveOnboarding } = usePerspectiveOnboardingContext();
  const seenOnboardings = useSelector(getSeenPerspectiveOnboardings);

  // Auto-open the perspective's onboarding dialog the first time the user
  // switches into it. Only runs for perspectives that ship an
  // onboardingExport in their tsextension manifest. The "seen" flag is
  // persisted in Redux and cleared by the "Show intro" button in Settings
  // for manual re-runs.
  useEffect(() => {
    if (!currentPerspective || !currentLocationId) return;
    if (seenOnboardings[currentPerspective]) return;
    if (!perspectiveHasOnboarding(currentPerspective)) return;
    openPerspectiveOnboarding(currentPerspective);
    // We intentionally depend on currentPerspective only — re-running on
    // seenOnboardings changes would re-open the dialog after the user marks
    // it seen by closing it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPerspective, currentLocationId]);

  const showWelcomePanel = !currentLocationId;

  function getPerspectiveComponent() {
    if (currentPerspective === PerspectiveIDs.LIST) {
      return <ListPerspectiveAsync />;
    }
    if (Pro && currentPerspective === PerspectiveIDs.GALLERY) {
      return <GalleryPerspectiveAsync />;
    }
    if (Pro && currentPerspective === PerspectiveIDs.MAPIQUE) {
      return <MapiquePerspectiveAsync />;
    }
    if (Pro && currentPerspective === PerspectiveIDs.KANBAN) {
      return <KanBanPerspectiveAsync />;
    }
    if (Pro && currentPerspective === PerspectiveIDs.FOLDERVIZ) {
      return <FolderVizPerspectiveAsync />;
    }
    if (Pro && currentPerspective === PerspectiveIDs.CALENDAR) {
      return <CalendarPerspectiveAsync />;
    }
    // External perspective from a package — resolved via the build-time
    // generated loader map. Returns null silently if the perspective ID
    // doesn't match any built-in or external entry; the fallback effect in
    // FolderContainer.tsx will route to the first enabled perspective.
    const externalMeta = AvailablePerspectives.find(
      (p) => p.external && p.id === currentPerspective,
    );
    if (externalMeta) {
      return <ExternalPerspectiveAsync perspectiveId={externalMeta.id} />;
    }
    return <GridPerspectiveAsync />;
  }

  if (showWelcomePanel) {
    return AppConfig.ExtShowWelcomePanel ? <WelcomePanelAsync /> : null;
  }

  const { FILE } = NativeTypes;
  return (
    <TargetFileBox style={{ height: '100%' }} accepts={[FILE]}>
      <CustomDragLayer />
      {getPerspectiveComponent()}
    </TargetFileBox>
  );
}

export default RenderPerspective;
