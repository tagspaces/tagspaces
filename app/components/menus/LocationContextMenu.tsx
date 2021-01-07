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
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import EditIcon from '@material-ui/icons/Edit';
import RefreshIcon from '@material-ui/icons/Refresh';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import DeleteIcon from '@material-ui/icons/DeleteForever';
import OpenFolderNativelyIcon from '@material-ui/icons/Launch';
import CloseIcon from '@material-ui/icons/Close';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  actions as LocationActions,
  Location,
  locationType
} from '-/reducers/locations';
import PlatformIO from '-/services/platform-io';
import { actions as LocationIndexActions } from '-/reducers/location-index';
import i18n from '-/services/i18n';
import { actions as AppActions } from '-/reducers/app';
import { getLocationPath } from '-/utils/paths';

interface Props {
  setEditLocationDialogOpened: (open: boolean) => void;
  setDeleteLocationDialogOpened: (open: boolean) => void;
  createDirectoryIndex: (
    path: string,
    fullTextIndex: boolean,
    isCurrentLocation: boolean
  ) => void;
  selectedLocation: Location;
  isCurrentLocation: (uuid: string) => boolean;
  moveLocationUp: (locationId: string) => void;
  moveLocationDown: (locationId: string) => void;
  showInFileManager: (path: string) => void;
  closeLocation: (locationId: string) => void;
  closeLocationTree: () => void;
  locationDirectoryContextMenuAnchorEl: HTMLElement;
  setLocationDirectoryContextMenuAnchorEl: (el: HTMLElement) => void;
}

const LocationContextMenu = (props: Props) => {
  const indexLocation = () => {
    props.setLocationDirectoryContextMenuAnchorEl(null);
    const { createDirectoryIndex, selectedLocation } = props;
    /* const isCurrentLocation =
          selectedLocation &&
          selectedLocation.uuid &&
          selectedLocation.uuid === currentLocationId; */
    const isCurrentLocation =
      selectedLocation && props.isCurrentLocation(selectedLocation.uuid);
    if (selectedLocation.type === locationType.TYPE_CLOUD) {
      PlatformIO.enableObjectStoreSupport(selectedLocation)
        .then(() => {
          createDirectoryIndex(
            getLocationPath(selectedLocation),
            selectedLocation.fullTextIndex,
            isCurrentLocation
          );
          return true;
        })
        .catch(() => {
          PlatformIO.disableObjectStoreSupport();
        });
    } else if (selectedLocation.type === locationType.TYPE_LOCAL) {
      PlatformIO.disableObjectStoreSupport();
      createDirectoryIndex(
        getLocationPath(selectedLocation),
        selectedLocation.fullTextIndex,
        isCurrentLocation
      );
    }
  };

  const showEditLocationDialog = () => {
    props.setLocationDirectoryContextMenuAnchorEl(null);
    props.setEditLocationDialogOpened(true);
  };

  const moveLocationUp = () => {
    props.setLocationDirectoryContextMenuAnchorEl(null);
    if (props.selectedLocation && props.selectedLocation.uuid) {
      props.moveLocationUp(props.selectedLocation.uuid);
    }
  };

  const moveLocationDown = () => {
    props.setLocationDirectoryContextMenuAnchorEl(null);
    if (props.selectedLocation && props.selectedLocation.uuid) {
      props.moveLocationDown(props.selectedLocation.uuid);
    }
  };

  const showDeleteLocationDialog = () => {
    props.setLocationDirectoryContextMenuAnchorEl(null);
    props.setDeleteLocationDialogOpened(true);
  };

  const showInFileManager = () => {
    props.setLocationDirectoryContextMenuAnchorEl(null);
    props.showInFileManager(getLocationPath(props.selectedLocation));
    // props.openDirectory(selectedLocation.path || selectedLocation.paths[0]);
  };

  const closeLocation = () => {
    props.setLocationDirectoryContextMenuAnchorEl(null);
    if (props.selectedLocation && props.selectedLocation.uuid) {
      props.closeLocation(props.selectedLocation.uuid);
      props.closeLocationTree();
    }
  };

  return (
    <Menu
      anchorEl={props.locationDirectoryContextMenuAnchorEl}
      open={Boolean(props.locationDirectoryContextMenuAnchorEl)}
      onClose={() => props.setLocationDirectoryContextMenuAnchorEl(null)}
    >
      <MenuItem data-tid="editLocation" onClick={showEditLocationDialog}>
        <ListItemIcon>
          <EditIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:editLocationTitle')} />
      </MenuItem>
      <MenuItem data-tid="indexLocation" onClick={indexLocation}>
        <ListItemIcon>
          <RefreshIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:indexLocation')} />
      </MenuItem>
      <MenuItem data-tid="moveLocationUp" onClick={moveLocationUp}>
        <ListItemIcon>
          <ArrowUpwardIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:moveUp')} />
      </MenuItem>
      <MenuItem data-tid="moveLocationDown" onClick={moveLocationDown}>
        <ListItemIcon>
          <ArrowDownwardIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:moveDown')} />
      </MenuItem>
      <MenuItem data-tid="removeLocation" onClick={showDeleteLocationDialog}>
        <ListItemIcon>
          <DeleteIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:removeLocation')} />
      </MenuItem>
      <MenuItem data-tid="showInFileManager" onClick={showInFileManager}>
        <ListItemIcon>
          <OpenFolderNativelyIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:showInFileManager')} />
      </MenuItem>
      <MenuItem data-tid="removeLocation" onClick={closeLocation}>
        <ListItemIcon>
          <CloseIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:closeLocation')} />
      </MenuItem>
    </Menu>
  );
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      createDirectoryIndex: LocationIndexActions.createDirectoryIndex,
      isCurrentLocation: AppActions.isCurrentLocation,
      moveLocationUp: LocationActions.moveLocationUp,
      moveLocationDown: LocationActions.moveLocationDown,
      showInFileManager: AppActions.showInFileManager,
      closeLocation: AppActions.closeLocation
    },
    dispatch
  );
}

// @ts-ignore
export default connect(undefined, mapDispatchToProps)(LocationContextMenu);
