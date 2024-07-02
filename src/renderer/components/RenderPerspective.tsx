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

import React, { useEffect, useReducer } from 'react';

import AppConfig from '-/AppConfig';

import { Pro } from '-/pro';
import { PerspectiveIDs } from '-/perspectives';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import LoadingLazy from '-/components/LoadingLazy';
import { SortedDirContextProvider } from '-/perspectives/grid/hooks/SortedDirContextProvider';
import { PaginationContextProvider } from '-/hooks/PaginationContextProvider';
import { ThumbGenerationContextProvider } from '-/hooks/ThumbGenerationContextProvider';
import { PerspectiveSettingsContextProvider } from '-/hooks/PerspectiveSettingsContextProvider';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import CustomDragLayer from '-/components/CustomDragLayer';
import TargetFileBox from '-/components/TargetFileBox';
import { NativeTypes } from 'react-dnd-html5-backend';
import { useEditedEntryMetaContext } from '-/hooks/useEditedEntryMetaContext';

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
      <ThumbGenerationContextProvider>
        <GalleryPerspective {...props} />
      </ThumbGenerationContextProvider>
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
      <ThumbGenerationContextProvider>
        <FolderVizPerspective {...props} />
      </ThumbGenerationContextProvider>
    </React.Suspense>
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

interface Props {
  openRenameEntryDialog: () => void;
}

function RenderPerspective(props: Props) {
  const { openRenameEntryDialog } = props;
  const { currentLocation } = useCurrentLocationContext();
  const { getPerspective } = useDirectoryContentContext();
  const { metaActions } = useEditedEntryMetaContext();
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  useEffect(() => {
    if (metaActions && metaActions.length > 0) {
      for (const action of metaActions) {
        if (action.action === 'perspectiveChange') {
          forceUpdate();
        }
      }
    }
  }, [metaActions]);

  const showWelcomePanel = !currentLocation;
  //!currentDirectoryPath && currentDirectoryEntries.length < 1;

  if (showWelcomePanel) {
    return AppConfig.showWelcomePanel ? <WelcomePanelAsync /> : null;
  }

  function getPerspectiveComponent() {
    const perspective = getPerspective();
    if (perspective === PerspectiveIDs.LIST) {
      return (
        <ListPerspectiveAsync openRenameEntryDialog={openRenameEntryDialog} />
      );
    }
    if (Pro && perspective === PerspectiveIDs.GALLERY) {
      return <GalleryPerspectiveAsync />;
    }
    if (Pro && perspective === PerspectiveIDs.MAPIQUE) {
      return <MapiquePerspectiveAsync />;
    }
    if (Pro && perspective === PerspectiveIDs.KANBAN) {
      return (
        <KanBanPerspectiveAsync openRenameEntryDialog={openRenameEntryDialog} />
      );
    }
    if (Pro && perspective === PerspectiveIDs.FOLDERVIZ) {
      return <FolderVizPerspectiveAsync />;
    }

    return (
      <GridPerspectiveAsync openRenameEntryDialog={openRenameEntryDialog} />
    );
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
