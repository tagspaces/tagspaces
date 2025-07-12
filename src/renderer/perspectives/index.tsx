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
import CalendarPerspectiveIcon from '@mui/icons-material/CalendarMonth';
import GalleryPerspectiveIcon from '@mui/icons-material/Camera';
import FolderVizPerspectiveIcon from '@mui/icons-material/Hub';
import MapiquePerspectiveIcon from '@mui/icons-material/Map';
import KanbanPerspectiveIcon from '@mui/icons-material/ViewKanban';
import ListPerspectiveIcon from '@mui/icons-material/ViewList';
import GridPerspectiveIcon from '@mui/icons-material/ViewModule';

export const PerspectiveIDs = {
  UNSPECIFIED: 'unspecified',
  GRID: 'grid',
  LIST: 'list',
  GALLERY: 'gallery',
  FOLDERVIZ: 'folderviz',
  MAPIQUE: 'mapique',
  KANBAN: 'kanban',
  CALENDAR: 'calendar',
};

export const GridPerspectiveMeta = {
  id: PerspectiveIDs.GRID,
  key: 'openDefaultPerspective',
  pro: false,
  beta: false,
  icon: <GridPerspectiveIcon />,
  title: 'Grid Perspective',
};

export const ListPerspectiveMeta = {
  id: PerspectiveIDs.LIST,
  key: 'openListPerspective',
  pro: false,
  beta: false,
  icon: <ListPerspectiveIcon />,
  title: 'List Perspective',
};

export const MapiquePerspectiveMeta = {
  id: PerspectiveIDs.MAPIQUE,
  key: 'openMapiquePerspective',
  pro: true,
  beta: false,
  icon: <MapiquePerspectiveIcon />,
  title: 'Mapique Perspective',
};

export const KanbanPerspectiveMeta = {
  id: PerspectiveIDs.KANBAN,
  key: 'openKanbanPerspective',
  pro: true,
  beta: false,
  icon: <KanbanPerspectiveIcon />,
  title: 'Kanban Perspective',
};

export { KanbanPerspectiveIcon };

export const GalleryPerspectiveMeta = {
  id: PerspectiveIDs.GALLERY,
  key: 'openGalleryPerspective',
  pro: true,
  beta: false,
  icon: <GalleryPerspectiveIcon />,
  title: 'Gallery Perspective',
};

export const FolderVizPerspectiveMeta = {
  id: PerspectiveIDs.FOLDERVIZ,
  key: 'openFolderVizPerspective',
  pro: true,
  beta: false,
  icon: <FolderVizPerspectiveIcon />,
  title: 'FolderViz Perspective',
};

export const CalendarPerspectiveMeta = {
  id: PerspectiveIDs.CALENDAR,
  key: 'openCalendarPerspective',
  pro: true,
  beta: true,
  icon: <CalendarPerspectiveIcon />,
  title: 'Calendar Perspective',
};

export const AvailablePerspectives = [];
AvailablePerspectives.push(GridPerspectiveMeta);
AvailablePerspectives.push(ListPerspectiveMeta);
AvailablePerspectives.push(GalleryPerspectiveMeta);
AvailablePerspectives.push(MapiquePerspectiveMeta);
AvailablePerspectives.push(KanbanPerspectiveMeta);
AvailablePerspectives.push(FolderVizPerspectiveMeta);
// AvailablePerspectives.push(CalendarPerspectiveMeta);
