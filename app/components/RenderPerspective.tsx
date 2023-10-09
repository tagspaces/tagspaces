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

import React, { useEffect, useState } from 'react';
import {
  getBackupFileLocation,
  extractContainingDirectoryPath
} from '@tagspaces/tagspaces-common/paths';
import Tooltip from '-/components/Tooltip';
import {
  getLastSearchTimestamp,
  isSearchMode,
  OpenedEntry
} from '-/reducers/app';
import PlatformIO from '-/services/platform-facade';
import { TS } from '-/tagspaces.namespace';
import { format, formatDistanceToNow } from 'date-fns';
import DeleteIcon from '@mui/icons-material/Delete';
import PreviewIcon from '@mui/icons-material/Preview';
import RestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import IconButton from '@mui/material/IconButton';
import AppConfig from '-/AppConfig';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow
} from '@mui/material';
import { Pro } from '-/pro';
import FilePreviewDialog from '-/components/dialogs/FilePreviewDialog';
import { useTranslation } from 'react-i18next';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { PerspectiveIDs } from '-/perspectives';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useSelector } from 'react-redux';
import { getDefaultPerspective } from '-/reducers/settings';
import LoadingLazy from '-/components/LoadingLazy';
import { SortedDirContextProvider } from '-/perspectives/grid-perspective/hooks/SortedDirContextProvider';
import { PaginationContextProvider } from '-/hooks/PaginationContextProvider';
import { ThumbGenerationContextProvider } from '-/hooks/ThumbGenerationContextProvider';

const GridPerspective = React.lazy(() =>
  import(
    /* webpackChunkName: "GridPerspective" */ '../perspectives/grid-perspective'
  )
);
function GridPerspectiveAsync(props) {
  return (
    <React.Suspense fallback={<LoadingLazy />}>
      <SortedDirContextProvider>
        <PaginationContextProvider>
          <ThumbGenerationContextProvider>
            <GridPerspective {...props} />
          </ThumbGenerationContextProvider>
        </PaginationContextProvider>
      </SortedDirContextProvider>
    </React.Suspense>
  );
}

const ListPerspective = React.lazy(() =>
  import(/* webpackChunkName: "ListPerspective" */ '../perspectives/list')
);
function ListPerspectiveAsync(props) {
  return (
    <React.Suspense fallback={<LoadingLazy />}>
      <SortedDirContextProvider>
        <PaginationContextProvider>
          <ThumbGenerationContextProvider>
            <ListPerspective {...props} />
          </ThumbGenerationContextProvider>
        </PaginationContextProvider>
      </SortedDirContextProvider>
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
      <ThumbGenerationContextProvider>
        <KanBanPerspective {...props} />
      </ThumbGenerationContextProvider>
    </React.Suspense>
  );
}

const WelcomePanel = React.lazy(() =>
  import(/* webpackChunkName: "WelcomePanel" */ './WelcomePanel')
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
  const {
    currentDirectoryEntries,
    currentDirectoryPath,
    currentDirectoryPerspective
  } = useDirectoryContentContext();

  const searchMode = useSelector(isSearchMode);
  const lastSearchTimestamp = useSelector(getLastSearchTimestamp);
  const defaultPerspective = useSelector(getDefaultPerspective);

  let currentPerspective =
    currentDirectoryPerspective || defaultPerspective || PerspectiveIDs.GRID;

  if (currentPerspective === PerspectiveIDs.UNSPECIFIED) {
    currentPerspective = defaultPerspective;
  }

  const showWelcomePanel =
    !currentDirectoryPath &&
    currentDirectoryEntries.length < 1 &&
    !(searchMode && lastSearchTimestamp);

  if (showWelcomePanel) {
    return AppConfig.showWelcomePanel ? <WelcomePanelAsync /> : null;
  }
  if (currentPerspective === PerspectiveIDs.LIST) {
    return (
      <ListPerspectiveAsync openRenameEntryDialog={openRenameEntryDialog} />
    );
  }
  if (Pro && currentPerspective === PerspectiveIDs.GALLERY) {
    return (
      <GalleryPerspectiveAsync
        directoryContent={currentDirectoryEntries}
        lastSearchTimestamp={lastSearchTimestamp}
      />
    );
  }
  if (Pro && currentPerspective === PerspectiveIDs.MAPIQUE) {
    return (
      <MapiquePerspectiveAsync
        directoryContent={currentDirectoryEntries}
        lastSearchTimestamp={lastSearchTimestamp}
      />
    );
  }
  if (Pro && currentPerspective === PerspectiveIDs.KANBAN) {
    return (
      <KanBanPerspectiveAsync
        directoryContent={currentDirectoryEntries}
        lastSearchTimestamp={lastSearchTimestamp}
        openRenameEntryDialog={openRenameEntryDialog}
      />
    );
  }

  return <GridPerspectiveAsync openRenameEntryDialog={openRenameEntryDialog} />;
}

export default RenderPerspective;
