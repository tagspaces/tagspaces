/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2021-present TagSpaces UG (haftungsbeschraenkt)
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

import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { emphasize, Theme } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Tooltip from '-/components/Tooltip';
import Chip from '@mui/material/Chip';
import ExpandMoreIcon from '@mui/icons-material/MoreVert';
import PlatformIO from '../services/platform-facade';
import {
  normalizePath,
  extractShortDirectoryName
} from '@tagspaces/tagspaces-common/paths';
import i18n from '../services/i18n';
import DirectoryMenu from './menus/DirectoryMenu';
import { TS } from '-/tagspaces.namespace';
import { LocalLocationIcon, CloudLocationIcon } from '-/components/CommonIcons';
import { locationType } from '@tagspaces/tagspaces-common/misc';

const StyledBreadcrumb = styled(Chip)(({ theme }) => {
  const backgroundColor =
    theme.palette.mode === 'light'
      ? theme.palette.grey[100]
      : theme.palette.grey[800];
  return {
    backgroundColor,
    height: theme.spacing(3),
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightRegular,
    '&:hover, &:focus': {
      backgroundColor: emphasize(backgroundColor, 0.06)
    },
    '&:active': {
      boxShadow: theme.shadows[1],
      backgroundColor: emphasize(backgroundColor, 0.12)
    }
  };
}) as typeof Chip; // TypeScript only: need a type cast here because https://github.com/Microsoft/TypeScript/issues/26591

const NoWrapBreadcrumb = styled(StyledBreadcrumb)(({ theme }) => {
  return { flexWrap: 'nowrap' };
});

interface Props {
  currentDirectoryPath: string;
  currentLocationPath: string;
  currentLocation: TS.Location;
  loadDirectoryContent: (
    path: string,
    generateThumbnails: boolean,
    loadDirMeta?: boolean
  ) => void;
  language: string;
  switchPerspective: (perspectiveId: string) => void;
  setSelectedEntries: (selectedEntries: Array<Object>) => void;
  openDirectory: () => void;
  reflectCreateEntry: (path: string, isFile: boolean) => void;
  openRenameDirectoryDialog: () => void;
  openMoveCopyFilesDialog: () => void;
  isDesktopMode: boolean;
}

function PathBreadcrumbs(props: Props) {
  let pathParts: Array<string> = [];

  const [
    directoryContextMenuAnchorEl,
    setDirectoryContextMenuAnchorEl
  ] = useState<null | HTMLElement>(null);

  const {
    currentDirectoryPath,
    currentLocationPath,
    currentLocation,
    loadDirectoryContent,
    setSelectedEntries,
    openDirectory,
    reflectCreateEntry,
    openRenameDirectoryDialog,
    openMoveCopyFilesDialog,
    isDesktopMode
  } = props;

  const openDirectoryMenu = (event: React.MouseEvent<Element, MouseEvent>) => {
    event.preventDefault();
    setSelectedEntries([]);
    // @ts-ignore
    setDirectoryContextMenuAnchorEl(event.currentTarget);
  };

  const closeDirectoryMenu = () => {
    setDirectoryContextMenuAnchorEl(null);
  };

  const normalizedCurrentDirPath = normalizePath(
    currentDirectoryPath.split('\\').join('/')
  );

  const locationTypeIcon =
    currentLocation && currentLocation.type === locationType.TYPE_CLOUD ? (
      <CloudLocationIcon />
    ) : (
      <LocalLocationIcon />
    );

  let currentFolderChipIcon = undefined;

  if (currentDirectoryPath) {
    // Make the path unix like ending always with /
    const addSlash = PlatformIO.haveObjectStoreSupport() ? '//' : '/';
    let normalizedCurrentPath =
      addSlash + normalizePath(currentDirectoryPath.split('\\').join('/'));

    let normalizedCurrentLocationPath = '';
    if (currentLocationPath) {
      normalizedCurrentLocationPath =
        addSlash + normalizePath(currentLocationPath.split('\\').join('/'));
    }

    while (
      normalizedCurrentPath.lastIndexOf('/') > 0 &&
      normalizedCurrentPath.startsWith(normalizedCurrentLocationPath)
    ) {
      pathParts.push(
        normalizedCurrentPath
          .substring(PlatformIO.haveObjectStoreSupport() ? 2 : 1)
          .split('/')
          .join(PlatformIO.getDirSeparator())
      ); // TODO: optimization needed
      normalizedCurrentPath = normalizedCurrentPath.substring(
        0,
        normalizedCurrentPath.lastIndexOf('/')
      );
    }

    currentFolderChipIcon = pathParts.length === 1 && locationTypeIcon;

    if (pathParts.length >= 1) {
      pathParts = pathParts.slice(1, pathParts.length); // remove current directory
    }
    pathParts = pathParts.reverse();
  }

  let currentFolderName = extractShortDirectoryName(
    normalizePath(normalizedCurrentDirPath),
    '/'
  );
  if (currentLocation && (!currentFolderName || currentFolderName === '/')) {
    currentFolderName = currentLocation.name;
  }

  function getBreadcrumbs() {
    let breadcrumbs = [];
    if (pathParts.length > 0) {
      breadcrumbs = pathParts.map((pathPart, index) => {
        const folderName = extractShortDirectoryName(
          pathPart,
          PlatformIO.getDirSeparator()
        );
        return (
          <Tooltip
            key={pathPart}
            title={i18n.t('core:navigateTo') + ' ' + pathPart}
          >
            <StyledBreadcrumb
              component="a"
              href="#"
              label={folderName}
              icon={index === 0 && locationTypeIcon}
              onClick={() => loadDirectoryContent(pathPart, false, true)}
            />
          </Tooltip>
        );
      });
    }
    if (currentDirectoryPath) {
      const curDirBreadcrumb = (
        <Tooltip
          title={
            i18n.t('core:openDirectoryMenu') +
            ' - ' +
            (currentDirectoryPath || '')
          }
        >
          <StyledBreadcrumb
            data-tid="folderContainerOpenDirMenu"
            label={currentFolderName}
            icon={currentFolderChipIcon}
            deleteIcon={<ExpandMoreIcon />}
            onDelete={openDirectoryMenu}
            onClick={openDirectoryMenu}
            onContextMenu={openDirectoryMenu}
          />
        </Tooltip>
      );
      breadcrumbs = [...breadcrumbs, curDirBreadcrumb];
    }
    return breadcrumbs;
  }

  return (
    <>
      <Breadcrumbs
        sx={{ display: 'flex', flexWrap: 'nowrap' }}
        maxItems={isDesktopMode ? 3 : 1}
        itemsAfterCollapse={isDesktopMode ? 2 : 1}
        itemsBeforeCollapse={isDesktopMode ? 1 : 0}
        aria-label="breadcrumb"
        separator={
          <span
            style={{
              marginLeft: -4,
              marginRight: -5
            }}
          >
            {'›'}
          </span>
        }
      >
        {getBreadcrumbs()}
      </Breadcrumbs>
      <DirectoryMenu
        open={Boolean(directoryContextMenuAnchorEl)}
        onClose={closeDirectoryMenu}
        anchorEl={directoryContextMenuAnchorEl}
        directoryPath={currentDirectoryPath}
        loadDirectoryContent={loadDirectoryContent}
        openRenameDirectoryDialog={openRenameDirectoryDialog}
        openMoveCopyFilesDialog={openMoveCopyFilesDialog}
        openDirectory={openDirectory}
        reflectCreateEntry={reflectCreateEntry}
      />
    </>
  );
}

export default PathBreadcrumbs;
