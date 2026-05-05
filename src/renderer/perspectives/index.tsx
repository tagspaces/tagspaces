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
import ExtensionIcon from '@mui/icons-material/Extension';
import FolderVizPerspectiveIcon from '@mui/icons-material/Hub';
import MapiquePerspectiveIcon from '@mui/icons-material/Map';
import KanbanPerspectiveIcon from '@mui/icons-material/ViewKanban';
import ListPerspectiveIcon from '@mui/icons-material/ViewList';
import GridPerspectiveIcon from '@mui/icons-material/ViewModule';
import {
  externalPerspectiveLoaders,
  externalPerspectives,
} from '-/extension-config';

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
  beta: true,
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

export type PerspectiveMeta = {
  id: string;
  key: string;
  pro: boolean;
  beta: boolean;
  icon: React.ReactNode;
  title: string;
  // External-perspective fields. Built-in perspectives leave these unset.
  external?: boolean;
  componentExport?: string;
  onboardingExport?: string | null;
};

// Build registry entries for any external perspectives discovered at build
// time by scripts/generateExtensionsConfig.ts. The accompanying loader map
// (externalPerspectiveLoaders) drives the dynamic-import branch in
// RenderPerspective.tsx, and the onboarding flag drives the per-perspective
// onboarding wrapper.
const ExternalPerspectiveMetas: PerspectiveMeta[] = externalPerspectives
  .filter((ext) => externalPerspectiveLoaders[ext.id] !== undefined)
  .map((ext) => ({
    id: ext.id,
    key: ext.key,
    pro: ext.pro === true,
    beta: ext.beta === true,
    icon: <ExtensionIcon />,
    title: ext.title,
    external: true,
    componentExport: ext.componentExport,
    onboardingExport: ext.onboardingExport,
  }));

export const AvailablePerspectives: PerspectiveMeta[] = [
  GridPerspectiveMeta,
  ListPerspectiveMeta,
  GalleryPerspectiveMeta,
  MapiquePerspectiveMeta,
  KanbanPerspectiveMeta,
  FolderVizPerspectiveMeta,
  CalendarPerspectiveMeta,
  ...ExternalPerspectiveMetas,
];

export const DefaultEnabledPerspectives: string[] = AvailablePerspectives.map(
  (p) => p.id,
);

export function getPerspectiveMeta(
  perspectiveId: string,
): PerspectiveMeta | undefined {
  return AvailablePerspectives.find((p) => p.id === perspectiveId);
}

// Onboarding capability is only known for external perspectives today —
// they declare an onboardingExport in their tsextension manifest. Built-in
// perspectives don't ship onboarding screens. Also guards on the loader
// being present in the build-time generated map so a stale registry entry
// without a matching loader can't slip through.
export function perspectiveHasOnboarding(perspectiveId: string): boolean {
  const meta = getPerspectiveMeta(perspectiveId);
  if (!meta || !meta.external || !meta.onboardingExport) return false;
  return externalPerspectiveLoaders[perspectiveId] !== undefined;
}

// Cheap predicate: does this perspective have a build-time loader for its
// main component? Used as a synchronous gate before constructing a
// React.lazy thunk, so callers can short-circuit without invoking the
// loader (which would kick off a chunk fetch and leak an unhandled
// promise if the import later rejects).
export function hasExternalPerspectiveComponent(
  perspectiveId: string,
): boolean {
  const meta = getPerspectiveMeta(perspectiveId);
  if (!meta || !meta.external || !meta.componentExport) return false;
  return externalPerspectiveLoaders[perspectiveId] !== undefined;
}

// Returns a React.lazy-compatible loader for the perspective's main
// component. Reuses the build-time generated import() loader.
export function loadExternalPerspectiveComponent(
  perspectiveId: string,
): Promise<{ default: any }> | undefined {
  const meta = getPerspectiveMeta(perspectiveId);
  if (!meta || !meta.external || !meta.componentExport) return undefined;
  const loader = externalPerspectiveLoaders[perspectiveId];
  if (!loader) return undefined;
  return loader().then((mod: any) => ({ default: mod[meta.componentExport] }));
}

// Returns a React.lazy-compatible loader for the perspective's onboarding
// component, if it has one.
export function loadExternalPerspectiveOnboarding(
  perspectiveId: string,
): Promise<{ default: any }> | undefined {
  const meta = getPerspectiveMeta(perspectiveId);
  if (!meta || !meta.external || !meta.onboardingExport) return undefined;
  const loader = externalPerspectiveLoaders[perspectiveId];
  if (!loader) return undefined;
  return loader().then((mod: any) => ({ default: mod[meta.onboardingExport] }));
}

export function getVisiblePerspectives(
  enabledPerspectives: string[],
  hideProFeatures: boolean,
  pro: any,
): PerspectiveMeta[] {
  return AvailablePerspectives.filter((p) => {
    if (!enabledPerspectives.includes(p.id)) {
      return false;
    }
    if (hideProFeatures && !pro && p.pro === true) {
      return false;
    }
    return true;
  });
}
