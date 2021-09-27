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
import { emphasize, withStyles, Theme } from '@material-ui/core/styles';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Chip from '@material-ui/core/Chip';
import ExpandMoreIcon from '@material-ui/icons/MoreVert';
import PlatformIO from '../services/platform-io';
import LocationMenu from './menus/LocationMenu';
import { normalizePath, extractShortDirectoryName } from '-/utils/paths';
import i18n from '../services/i18n';
import DirectoryMenu from './menus/DirectoryMenu';
import { TS } from '-/tagspaces.namespace';
import { isDesktopMode } from '-/reducers/settings';

const StyledBreadcrumb = withStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.palette.grey[100],
    height: theme.spacing(3),
    color: theme.palette.grey[800],
    fontWeight: theme.typography.fontWeightRegular,
    '&:hover, &:focus': {
      backgroundColor: theme.palette.grey[300]
    },
    '&:active': {
      boxShadow: theme.shadows[1],
      backgroundColor: emphasize(theme.palette.grey[300], 0.12)
    }
  }
}))(Chip) as typeof Chip;

interface Props {
  currentDirectoryPath: string;
  currentLocationPath: string;
  loadDirectoryContent: (path: string, generateThumbnails: boolean) => void;
  switchPerspective: (perspectiveId: string) => void;
  setSelectedEntries: (selectedEntries: Array<Object>) => void;
  openDirectory: () => void;
  reflectCreateEntry: (path: string, isFile: boolean) => void;
  openFsEntry: (fsEntry: TS.FileSystemEntry) => void;
  isReadOnlyMode: boolean;
  openRenameDirectoryDialog: () => void;
  isDesktopMode: boolean;
}

function handleClick(event: React.MouseEvent<Element, MouseEvent>) {
  event.preventDefault();
  console.info('You clicked a breadcrumb.');
}

export default function PathBreadcrumbs(props: Props) {
  let pathParts: Array<string> = [];

  const [
    directoryContextMenuAnchorEl,
    setDirectoryContextMenuAnchorEl
  ] = useState<null | HTMLElement>(null);

  const {
    currentDirectoryPath,
    currentLocationPath,
    loadDirectoryContent,
    switchPerspective,
    setSelectedEntries,
    openDirectory,
    reflectCreateEntry,
    openFsEntry,
    isReadOnlyMode,
    openRenameDirectoryDialog,
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

  if (currentDirectoryPath) {
    // Make the path unix like ending always with /
    const addSlash = PlatformIO.haveObjectStoreSupport() ? '//' : '/';
    let normalizedCurrentPath =
      addSlash +
      normalizePath(props.currentDirectoryPath.split('\\').join('/'));

    let normalizedCurrentLocationPath = '';
    if (currentLocationPath) {
      normalizedCurrentLocationPath =
        addSlash +
        normalizePath(props.currentLocationPath.split('\\').join('/'));
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

    // console.log('Path parts : ' + JSON.stringify(pathParts));
    if (pathParts.length >= 1) {
      pathParts = pathParts.slice(1, pathParts.length); // remove current directory
    }
    pathParts = pathParts.reverse();
    // if (pathParts.length > 2) {
    //   pathParts = pathParts.slice(pathParts.length - 2, pathParts.length); // leave only the last 2 dirs in the path
    // }
  }

  return (
    <Breadcrumbs
      maxItems={isDesktopMode ? 3 : 1}
      itemsAfterCollapse={2}
      aria-label="breadcrumb"
      style={{ marginTop: 5 }}
      separator={<span style={{ marginLeft: -4, marginRight: -4 }}>/</span>}
    >
      {/* <LocationMenu /> */}
      {pathParts.length > 0 &&
        pathParts.map(pathPart => (
          <StyledBreadcrumb
            component="a"
            href="#"
            label={extractShortDirectoryName(
              pathPart,
              PlatformIO.getDirSeparator()
            )}
            onClick={() => loadDirectoryContent(pathPart, false)}
            title={'Navigate to: ' + pathPart}
          />
        ))}
      {props.currentDirectoryPath && (
        <>
          <StyledBreadcrumb
            data-tid="folderContainerOpenDirMenu"
            title={
              i18n.t('core:openDirectoryMenu') +
              ' - ' +
              (currentDirectoryPath || '')
            }
            label={extractShortDirectoryName(
              normalizePath(normalizedCurrentDirPath),
              '/'
            )}
            deleteIcon={<ExpandMoreIcon />}
            //onClick={handleClick}
            onDelete={openDirectoryMenu}
            onClick={openDirectoryMenu}
            onContextMenu={openDirectoryMenu}
          />
          <DirectoryMenu
            open={Boolean(directoryContextMenuAnchorEl)}
            onClose={closeDirectoryMenu}
            anchorEl={directoryContextMenuAnchorEl}
            directoryPath={currentDirectoryPath}
            loadDirectoryContent={loadDirectoryContent}
            openRenameDirectoryDialog={openRenameDirectoryDialog}
            openDirectory={openDirectory}
            reflectCreateEntry={reflectCreateEntry}
            openFsEntry={openFsEntry}
            switchPerspective={switchPerspective}
            isReadOnlyMode={isReadOnlyMode}
          />
        </>
      )}
    </Breadcrumbs>
  );
}
