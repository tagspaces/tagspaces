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
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { locationType } from '@tagspaces/tagspaces-common/misc';
import AppConfig from '-/AppConfig';
import {
  actions as LocationActions,
  getLocationPosition
} from '-/reducers/locations';
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
  addLocation: (
    location: TS.Location,
    openAfterCreate?: boolean,
    locationPosition?: number
  ) => void;
  locationPosition: number;
}

function LocationContextMenu(props: Props) {
  const {
    addLocation,
    selectedLocation,
    setEditLocationDialogOpened,
    setLocationDirectoryContextMenuAnchorEl,
    createLocationIndex,
    locationPosition,
    moveLocationUp,
    moveLocationDown,
    setDeleteLocationDialogOpened,
    closeLocationTree,
    closeLocation,
    showInFileManager,
    locationDirectoryContextMenuAnchorEl
  } = props;

  const indexLocation = () => {
    setLocationDirectoryContextMenuAnchorEl(null);
    createLocationIndex(selectedLocation);
  };

  const showEditLocationDialog = () => {
    setLocationDirectoryContextMenuAnchorEl(null);
    setEditLocationDialogOpened(true);
  };

  const duplicateLocation = () => {
    addLocation(
      {
        ...selectedLocation,
        uuid: getUuid(),
        name: selectedLocation.name + ' (copy)',
        isDefault: false
      },
      false,
      locationPosition + 1
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
    showInFileManager(PlatformIO.getLocationPath(selectedLocation));
  };

  const closeLocationInt = () => {
    setLocationDirectoryContextMenuAnchorEl(null);
    if (selectedLocation && selectedLocation.uuid) {
      closeLocation(selectedLocation.uuid);
      closeLocationTree();
    }
  };

  const openInNewWindow = () => {
    setLocationDirectoryContextMenuAnchorEl(null);
    const sharingLink = generateSharingLink(selectedLocation.uuid);
    PlatformIO.createNewInstance(
      window.location.href.split('?')[0] + '?' + sharingLink.split('?')[1]
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
        <ListItemText primary={i18n.t('core:editLocationTitle')} />
      </MenuItem>
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
      <ListItemText primary={i18n.t('core:openInWindow')} />
    </MenuItem>
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
        <ListItemText primary={i18n.t('core:showInFileManager')} />
      </MenuItem>
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
      <ListItemText primary={i18n.t('core:duplicateLocationTitle')} />
    </MenuItem>
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
      <ListItemText primary={i18n.t('core:indexLocation')} />
    </MenuItem>
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
        <ListItemText primary={i18n.t('core:moveUp')} />
      </MenuItem>
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
        <ListItemText primary={i18n.t('core:moveDown')} />
      </MenuItem>
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
        <ListItemText primary={i18n.t('core:removeLocation')} />
      </MenuItem>
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
      <ListItemText primary={i18n.t('core:closeLocation')} />
    </MenuItem>
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

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      createLocationIndex: LocationIndexActions.createLocationIndex,
      moveLocationUp: LocationActions.moveLocationUp,
      moveLocationDown: LocationActions.moveLocationDown,
      showInFileManager: AppActions.showInFileManager,
      closeLocation: AppActions.closeLocation,
      addLocation: LocationActions.addLocation
    },
    dispatch
  );
}

function mapStateToProps(state, ownProps) {
  return {
    locationPosition: getLocationPosition(state, ownProps.selectedLocation.uuid)
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LocationContextMenu);
