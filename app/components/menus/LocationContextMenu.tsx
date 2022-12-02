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
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DeleteIcon from '@mui/icons-material/DeleteForever';
import OpenFolderNativelyIcon from '@mui/icons-material/Launch';
import CloseIcon from '@mui/icons-material/Close';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { locationType } from '@tagspaces/tagspaces-common/misc';
import AppConfig from '-/AppConfig';
import { actions as LocationActions } from '-/reducers/locations';
import { actions as LocationIndexActions } from '-/reducers/location-index';
import i18n from '-/services/i18n';
import { actions as AppActions } from '-/reducers/app';
import { TS } from '-/tagspaces.namespace';
import PlatformIO from '-/services/platform-facade';

interface Props {
  setEditLocationDialogOpened: (open: boolean) => void;
  setDeleteLocationDialogOpened: (open: boolean) => void;
  createLocationIndex: (location: TS.Location) => void;
  selectedLocation: TS.Location;
  moveLocationUp: (locationId: string) => void;
  moveLocationDown: (locationId: string) => void;
  showInFileManager: (path: string) => void;
  closeLocation: (locationId: string) => void;
  closeLocationTree: () => void;
  locationDirectoryContextMenuAnchorEl: HTMLElement;
  setLocationDirectoryContextMenuAnchorEl: (el: HTMLElement) => void;
}

function LocationContextMenu(props: Props) {
  const indexLocation = () => {
    props.setLocationDirectoryContextMenuAnchorEl(null);
    props.createLocationIndex(props.selectedLocation);
  };

  const { selectedLocation } = props;

  const showEditLocationDialog = () => {
    props.setLocationDirectoryContextMenuAnchorEl(null);
    props.setEditLocationDialogOpened(true);
  };

  const moveLocationUp = () => {
    props.setLocationDirectoryContextMenuAnchorEl(null);
    if (selectedLocation && selectedLocation.uuid) {
      props.moveLocationUp(selectedLocation.uuid);
    }
  };

  const moveLocationDown = () => {
    props.setLocationDirectoryContextMenuAnchorEl(null);
    if (selectedLocation && selectedLocation.uuid) {
      props.moveLocationDown(selectedLocation.uuid);
    }
  };

  const showDeleteLocationDialog = () => {
    props.setLocationDirectoryContextMenuAnchorEl(null);
    props.setDeleteLocationDialogOpened(true);
  };

  const showInFileManager = () => {
    props.setLocationDirectoryContextMenuAnchorEl(null);
    props.showInFileManager(PlatformIO.getLocationPath(props.selectedLocation));
    // props.openDirectory(selectedLocation.path || selectedLocation.paths[0]);
  };

  const closeLocation = () => {
    props.setLocationDirectoryContextMenuAnchorEl(null);
    if (selectedLocation && selectedLocation.uuid) {
      props.closeLocation(selectedLocation.uuid);
      props.closeLocationTree();
    }
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
        <ListItemText primary={i18n.t('core:editLocationTitle')} />
      </MenuItem>
    );
  }
  menuItems.push(
    <MenuItem
      key="indexLocation"
      data-tid="indexLocation"
      onClick={indexLocation}
    >
      <ListItemIcon>
        <RefreshIcon />
      </ListItemIcon>
      <ListItemText primary={i18n.t('core:indexLocation')} />
    </MenuItem>
  );
  if (!AppConfig.locationsReadOnly) {
    menuItems.push(
      <MenuItem
        key="moveLocationUp"
        data-tid="moveLocationUp"
        onClick={moveLocationUp}
      >
        <ListItemIcon>
          <ArrowUpwardIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:moveUp')} />
      </MenuItem>
    );
    menuItems.push(
      <MenuItem
        key="moveLocationDown"
        data-tid="moveLocationDown"
        onClick={moveLocationDown}
      >
        <ListItemIcon>
          <ArrowDownwardIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:moveDown')} />
      </MenuItem>
    );
    menuItems.push(
      <MenuItem
        key="removeLocation"
        data-tid="removeLocation"
        onClick={showDeleteLocationDialog}
      >
        <ListItemIcon>
          <DeleteIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:removeLocation')} />
      </MenuItem>
    );
  }
  if (selectedLocation.type === locationType.TYPE_LOCAL) {
    menuItems.push(
      <MenuItem
        key="showInFileManager"
        data-tid="showInFileManager"
        onClick={showInFileManager}
      >
        <ListItemIcon>
          <OpenFolderNativelyIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:showInFileManager')} />
      </MenuItem>
    );
  }
  menuItems.push(
    <MenuItem
      key="closeLocationTID"
      data-tid="closeLocationTID"
      onClick={closeLocation}
    >
      <ListItemIcon>
        <CloseIcon />
      </ListItemIcon>
      <ListItemText primary={i18n.t('core:closeLocation')} />
    </MenuItem>
  );

  return (
    <Menu
      anchorEl={props.locationDirectoryContextMenuAnchorEl}
      open={Boolean(props.locationDirectoryContextMenuAnchorEl)}
      onClose={() => props.setLocationDirectoryContextMenuAnchorEl(null)}
    >
      {menuItems}
    </Menu>
  );
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      createLocationIndex: LocationIndexActions.createLocationIndex,
      moveLocationUp: LocationActions.moveLocationUp,
      moveLocationDown: LocationActions.moveLocationDown,
      showInFileManager: AppActions.showInFileManager,
      closeLocation: AppActions.closeLocation
    },
    dispatch
  );
}

export default connect(undefined, mapDispatchToProps)(LocationContextMenu);
