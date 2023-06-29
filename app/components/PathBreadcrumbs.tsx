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
import { emphasize, Theme } from '@mui/material/styles';
import withStyles from '@mui/styles/withStyles';
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

// @ts-ignore
const StyledBreadcrumb = withStyles((theme: Theme) => ({
  root: {
    backgroundColor: emphasize(theme.palette.background.default, 0.06),
    // height: theme.spacing(3),
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightRegular,
    '&:hover, &:focus': {
      backgroundColor: emphasize(theme.palette.background.default, 0.22)
    }
  }
}))(Chip) as typeof Chip;

const NoWrapBreadcrumb = withStyles({
  ol: {
    flexWrap: 'nowrap'
  }
})(Breadcrumbs);

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
  openFsEntry: (fsEntry: TS.FileSystemEntry) => void;
  isReadOnlyMode: boolean;
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
    openFsEntry,
    isReadOnlyMode,
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

  return (
    <>
      <NoWrapBreadcrumb
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
        {pathParts.length > 0 &&
          pathParts.map((pathPart, index) => {
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
          })}
        {currentDirectoryPath && (
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
        )}
      </NoWrapBreadcrumb>
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
        openFsEntry={openFsEntry}
      />
    </>
  );
}

export default PathBreadcrumbs;
