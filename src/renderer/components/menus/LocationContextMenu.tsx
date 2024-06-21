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
import { useDispatch } from 'react-redux';
import { getUuid } from '@tagspaces/tagspaces-common/utils-io';
import { generateSharingLink } from '@tagspaces/tagspaces-common/paths';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DeleteIcon from '@mui/icons-material/DeleteForever';
import OpenFolderNativelyIcon from '@mui/icons-material/Launch';
import { OpenNewWindowIcon, CloseIcon } from '-/components/CommonIcons';
import { locationType } from '@tagspaces/tagspaces-common/misc';
import AppConfig from '-/AppConfig';
import { actions as LocationActions } from '-/reducers/locations';
import { AppDispatch } from '-/reducers/app';
import { useTranslation } from 'react-i18next';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useLocationIndexContext } from '-/hooks/useLocationIndexContext';
import { createNewInstance, openDirectoryMessage } from '-/services/utils-io';
import { useCreateEditLocationDialogContext } from '-/components/dialogs/hooks/useCreateEditLocationDialogContext';

interface Props {
  //setEditLocationDialogOpened: (open: boolean) => void;
  setDeleteLocationDialogOpened: (open: boolean) => void;
  //closeLocationTree: () => void;
}

function LocationContextMenu(props: Props) {
  const {
    setDeleteLocationDialogOpened,
    //closeLocationTree
  } = props;
  const { t } = useTranslation();

  const {
    addLocation,
    closeLocation,
    getLocationPosition,
    selectedLocation,
    locationDirectoryContextMenuAnchorEl,
    setLocationDirectoryContextMenuAnchorEl,
    getLocationPath,
  } = useCurrentLocationContext();
  const { createLocationIndex } = useLocationIndexContext();
  const { openCreateEditLocationDialog } = useCreateEditLocationDialogContext();
  const dispatch: AppDispatch = useDispatch();

  const moveLocationUp = (locationId) => {
    dispatch(LocationActions.moveLocationUp(locationId));
  };

  const moveLocationDown = (locationId) => {
    dispatch(LocationActions.moveLocationDown(locationId));
  };

  const indexLocation = () => {
    setLocationDirectoryContextMenuAnchorEl(null);
    createLocationIndex(selectedLocation);
  };

  const showEditLocationDialog = () => {
    setLocationDirectoryContextMenuAnchorEl(null);
    openCreateEditLocationDialog();
  };

  const duplicateLocation = () => {
    const locationPosition = getLocationPosition(selectedLocation.uuid);
    addLocation(
      {
        ...selectedLocation,
        uuid: getUuid(),
        name: selectedLocation.name + ' (copy)',
        isDefault: false,
      },
      false,
      locationPosition + 1,
    );
    setLocationDirectoryContextMenuAnchorEl(null);
  };

  const moveLocationUpInt = () => {
    setLocationDirectoryContextMenuAnchorEl(null);
    if (selectedLocation && selectedLocation.uuid) {
      moveLocationUp(selectedLocation.uuid);
    }
  };

  const moveLocationDownInt = () => {
    setLocationDirectoryContextMenuAnchorEl(null);
    if (selectedLocation && selectedLocation.uuid) {
      moveLocationDown(selectedLocation.uuid);
    }
  };

  const showDeleteLocationDialog = () => {
    setLocationDirectoryContextMenuAnchorEl(null);
    setDeleteLocationDialogOpened(true);
  };

  const showInFileManagerInt = () => {
    setLocationDirectoryContextMenuAnchorEl(null);
    getLocationPath(selectedLocation).then((path) =>
      openDirectoryMessage(path),
    );
  };

  const closeLocationInt = () => {
    setLocationDirectoryContextMenuAnchorEl(null);
    if (selectedLocation && selectedLocation.uuid) {
      closeLocation(selectedLocation.uuid);
      //closeLocationTree();
    }
  };

  const openInNewWindow = () => {
    setLocationDirectoryContextMenuAnchorEl(null);
    const sharingLink = generateSharingLink(selectedLocation.uuid);
    createNewInstance(
      window.location.href.split('?')[0] + '?' + sharingLink.split('?')[1],
    );
  };

  const menuItems = [];
  if (!AppConfig.locationsReadOnly && !selectedLocation.isNotEditable) {
    menuItems.push(
      <MenuItem
        key="editLocation"
        data-tid="editLocation"
        onClick={showEditLocationDialog}
      >
        <ListItemIcon>
          <EditIcon />
        </ListItemIcon>
        <ListItemText primary={t('core:editLocationTitle')} />
      </MenuItem>,
    );
  }
  menuItems.push(
    <MenuItem
      key="locationMenuOpenFileNewWindow"
      data-tid="locationMenuOpenFileNewWindow"
      onClick={openInNewWindow}
    >
      <ListItemIcon>
        <OpenNewWindowIcon />
      </ListItemIcon>
      <ListItemText primary={t('core:openInWindow')} />
    </MenuItem>,
  );
  if (selectedLocation.type === locationType.TYPE_LOCAL) {
    menuItems.push(
      <MenuItem
        key="showInFileManager"
        data-tid="showInFileManager"
        onClick={showInFileManagerInt}
      >
        <ListItemIcon>
          <OpenFolderNativelyIcon />
        </ListItemIcon>
        <ListItemText primary={t('core:showInFileManager')} />
      </MenuItem>,
    );
  }
  menuItems.push(<Divider />);
  menuItems.push(
    <MenuItem
      key="duplicateLocation"
      data-tid="duplicateLocationTID"
      onClick={duplicateLocation}
    >
      <ListItemIcon>
        <ContentCopyIcon />
      </ListItemIcon>
      <ListItemText primary={t('core:duplicateLocationTitle')} />
    </MenuItem>,
  );
  menuItems.push(
    <MenuItem
      key="indexLocation"
      data-tid="indexLocation"
      onClick={indexLocation}
    >
      <ListItemIcon>
        <RefreshIcon />
      </ListItemIcon>
      <ListItemText primary={t('core:indexLocation')} />
    </MenuItem>,
  );
  if (!AppConfig.locationsReadOnly) {
    menuItems.push(<Divider />);
    menuItems.push(
      <MenuItem
        key="moveLocationUp"
        data-tid="moveLocationUp"
        onClick={moveLocationUpInt}
      >
        <ListItemIcon>
          <ArrowUpwardIcon />
        </ListItemIcon>
        <ListItemText primary={t('core:moveUp')} />
      </MenuItem>,
    );
    menuItems.push(
      <MenuItem
        key="moveLocationDown"
        data-tid="moveLocationDown"
        onClick={moveLocationDownInt}
      >
        <ListItemIcon>
          <ArrowDownwardIcon />
        </ListItemIcon>
        <ListItemText primary={t('core:moveDown')} />
      </MenuItem>,
    );
    menuItems.push(<Divider />);
    menuItems.push(
      <MenuItem
        key="removeLocation"
        data-tid="removeLocation"
        onClick={showDeleteLocationDialog}
      >
        <ListItemIcon>
          <DeleteIcon />
        </ListItemIcon>
        <ListItemText primary={t('core:removeLocation')} />
      </MenuItem>,
    );
  }
  menuItems.push(
    <MenuItem
      key="closeLocationTID"
      data-tid="closeLocationTID"
      onClick={closeLocationInt}
    >
      <ListItemIcon>
        <CloseIcon />
      </ListItemIcon>
      <ListItemText primary={t('core:closeLocation')} />
    </MenuItem>,
  );

  return (
    <Menu
      anchorEl={locationDirectoryContextMenuAnchorEl}
      open={Boolean(locationDirectoryContextMenuAnchorEl)}
      onClose={() => setLocationDirectoryContextMenuAnchorEl(null)}
    >
      {menuItems}
    </Menu>
  );
}

export default LocationContextMenu;
