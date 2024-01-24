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
import React from 'react';
import KanbanPerspectiveIcon from '@mui/icons-material/ViewKanban';
import MapiquePerspectiveIcon from '@mui/icons-material/Map';
import GalleryPerspectiveIcon from '@mui/icons-material/Camera';
import ListPerspectiveIcon from '@mui/icons-material/ViewList';
import GridPerspectiveIcon from '@mui/icons-material/ViewModule';
import FolderVizPerspectiveIcon from '@mui/icons-material/Hub';
import {
  FOLDERVIZ_ID,
  GALLERY_ID,
  GRID_ID,
  KANBAN_ID,
  LIST_ID,
  MAPIQUE_ID,
} from '-/const';

export const GridPerspectiveMeta = {
  id: GRID_ID,
  key: 'openDefaultPerspective',
  pro: false,
  beta: false,
  icon: <GridPerspectiveIcon />,
  title: 'Grid Perspective',
};

export const ListPerspectiveMeta = {
  id: LIST_ID,
  key: 'openListPerspective',
  pro: false,
  beta: false,
  icon: <ListPerspectiveIcon />,
  title: 'List Perspective',
};

export const MapiquePerspectiveMeta = {
  id: MAPIQUE_ID,
  key: 'openMapiquePerspective',
  pro: true,
  beta: false,
  icon: <MapiquePerspectiveIcon />,
  title: 'Mapique Perspective',
};

export const KanbanPerspectiveMeta = {
  id: KANBAN_ID,
  key: 'openKanbanPerspective',
  pro: true,
  beta: true,
  icon: <KanbanPerspectiveIcon />,
  title: 'Kanban Perspective',
};

export { KanbanPerspectiveIcon };

export const GalleryPerspectiveMeta = {
  id: GALLERY_ID,
  key: 'openGalleryPerspective',
  pro: true,
  beta: false,
  icon: <GalleryPerspectiveIcon />,
  title: 'Gallery Perspective',
};

export const FolderVizPerspectiveMeta = {
  id: FOLDERVIZ_ID,
  key: 'openFolderVizPerspective',
  pro: true,
  beta: true,
  icon: <FolderVizPerspectiveIcon />,
  title: 'FolderViz Perspective',
};

export const AvailablePerspectives = [];
AvailablePerspectives.push(GridPerspectiveMeta);
AvailablePerspectives.push(ListPerspectiveMeta);
AvailablePerspectives.push(GalleryPerspectiveMeta);
AvailablePerspectives.push(MapiquePerspectiveMeta);
AvailablePerspectives.push(KanbanPerspectiveMeta);
AvailablePerspectives.push(FolderVizPerspectiveMeta);
// AvailablePerspectives.push(WikiPerspectiveMeta);
