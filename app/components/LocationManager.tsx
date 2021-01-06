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

import React, { useEffect, useRef, useState } from 'react';
import { bindActionCreators } from 'redux';
import uuidv1 from 'uuid';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import EditIcon from '@material-ui/icons/Edit';
import RefreshIcon from '@material-ui/icons/Refresh';
import DeleteIcon from '@material-ui/icons/DeleteForever';
import CloseIcon from '@material-ui/icons/Close';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import OpenFolderNativelyIcon from '@material-ui/icons/Launch';
import styles from './SidePanels.css';
import LocationManagerMenu from './menus/LocationManagerMenu';
import ConfirmDialog from './dialogs/ConfirmDialog';
import SelectDirectoryDialog from './dialogs/SelectDirectoryDialog';
import CreateDirectoryDialog from './dialogs/CreateDirectoryDialog';
import CustomLogo from './CustomLogo';
import {
  actions as LocationActions,
  getLocations,
  locationType,
  Location
} from '../reducers/locations';
import { actions as AppActions } from '../reducers/app';
import { actions as LocationIndexActions } from '../reducers/location-index';
import { getPerspectives } from '-/reducers/settings';
import i18n from '../services/i18n';
import AppConfig from '../config';
import PlatformIO from '../services/platform-io';
import LoadingLazy from '-/components/LoadingLazy';
import LocationView from '-/components/LocationView';

const CreateLocationDialog = React.lazy(() =>
  import(
    /* webpackChunkName: "CreateLocationDialog" */ './dialogs/CreateLocationDialog'
  )
);
const CreateLocationDialogAsync = props => (
  <React.Suspense fallback={<LoadingLazy />}>
    <CreateLocationDialog {...props} />
  </React.Suspense>
);

const EditLocationDialog = React.lazy(() =>
  import(
    /* webpackChunkName: "CreateLocationDialog" */ './dialogs/EditLocationDialog'
  )
);
const EditLocationDialogAsync = props => (
  <React.Suspense fallback={<LoadingLazy />}>
    <EditLocationDialog {...props} />
  </React.Suspense>
);

interface Props {
  classes: any;
  style: any;
  locations: Array<Location>;
  perspectives: Array<Object>;
  // currentLocationId: string;
  hideDrawer: () => void;
  openURLExternally: (path: string) => void;
  openFileNatively: (path: string) => void;
  openDirectory: (path: string) => void;
  toggleOpenLinkDialog: () => void;
  showInFileManager: (path: string) => void;
  createDirectoryIndex: (
    path: string,
    fullTextIndex: boolean,
    isCurrentLocation: boolean
  ) => void;
  addLocation: (location: Location, openAfterCreate?: boolean) => void;
  editLocation: () => void;
  moveLocationUp: (locationId: string) => void;
  moveLocationDown: (locationId: string) => void;
  closeLocation: (locationId: string) => void;
  removeLocation: (location: Location) => void;
  isCurrentLocation: (uuid: string) => boolean;
}

type SubFolder = {
  uuid: string;
  name: string;
  path: string;
  children?: Array<SubFolder>;
};

const LocationManager = (props: Props) => {
  const directoryTreeRef = useRef([]);
  const [
    locationDirectoryContextMenuAnchorEl,
    setLocationDirectoryContextMenuAnchorEl
  ] = useState<null | HTMLElement>(null);
  const [
    locationManagerMenuAnchorEl,
    setLocationManagerMenuAnchorEl
  ] = useState<null | HTMLElement>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location>(null);
  const [selectedDirectoryPath, setSelectedDirectoryPath] = useState<string>(
    null
  );
  const [
    isCreateLocationDialogOpened,
    setCreateLocationDialogOpened
  ] = useState<boolean>(false);
  const [isEditLocationDialogOpened, setEditLocationDialogOpened] = useState<
    boolean
  >(false);
  const [
    isDeleteLocationDialogOpened,
    setDeleteLocationDialogOpened
  ] = useState<boolean>(false);
  const [
    isCreateDirectoryDialogOpened,
    setCreateDirectoryDialogOpened
  ] = useState<boolean>(false);
  const [
    isSelectDirectoryDialogOpened,
    setSelectDirectoryDialogOpened
  ] = useState<boolean>(false);

  useEffect(() => {
    // directoryTreeRef.current = directoryTreeRef.current.slice(0, props.locations.length);
    if (props.locations.length < 1) {
      // init locations
      const devicePaths = PlatformIO.getDevicePaths();

      Object.keys(devicePaths).forEach(key => {
        props.addLocation(
          {
            uuid: uuidv1(),
            type: locationType.TYPE_LOCAL,
            name: key, // TODO use i18n
            path: devicePaths[key],
            isDefault: AppConfig.isWeb && devicePaths[key] === '/files/', // Used for the web ts demo
            isReadOnly: false,
            persistIndex: false
          },
          false
        );
      });
    }
  }, []); // props.locations]);

  const indexLocation = () => {
    setLocationDirectoryContextMenuAnchorEl(null);
    const { createDirectoryIndex } = props;
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
            selectedLocation.path || selectedLocation.paths[0],
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
        selectedLocation.path || selectedLocation.paths[0],
        selectedLocation.fullTextIndex,
        isCurrentLocation
      );
    }
  };

  const moveLocationUp = () => {
    setLocationDirectoryContextMenuAnchorEl(null);
    if (selectedLocation && selectedLocation.uuid) {
      props.moveLocationUp(selectedLocation.uuid);
    }
  };

  const moveLocationDown = () => {
    setLocationDirectoryContextMenuAnchorEl(null);
    if (selectedLocation && selectedLocation.uuid) {
      props.moveLocationDown(selectedLocation.uuid);
    }
  };

  const showInFileManager = () => {
    setLocationDirectoryContextMenuAnchorEl(null);
    props.openDirectory(selectedLocation.path || selectedLocation.paths[0]);
  };

  const closeLocation = () => {
    setLocationDirectoryContextMenuAnchorEl(null);
    if (selectedLocation && selectedLocation.uuid) {
      props.closeLocation(selectedLocation.uuid);
      directoryTreeRef.current[selectedLocation.uuid].closeLocation();
    }
  };

  const showEditLocationDialog = () => {
    setLocationDirectoryContextMenuAnchorEl(null);
    setEditLocationDialogOpened(true);
  };

  const showDeleteLocationDialog = () => {
    setLocationDirectoryContextMenuAnchorEl(null);
    setDeleteLocationDialogOpened(true);
  };

  const createNewDirectoryExt = (path: string) => {
    setCreateDirectoryDialogOpened(true);
    setSelectedDirectoryPath(path);
  };

  const showSelectDirectoryDialog = () => {
    setSelectDirectoryDialogOpened(true);
    setSelectedDirectoryPath('');
  };

  const chooseDirectoryPath = (currentPath: string) => {
    setSelectDirectoryDialogOpened(true);
    setSelectedDirectoryPath(currentPath);
  };

  const handleLocationContextMenuClick = (event: any, location: Location) => {
    event.preventDefault();
    event.stopPropagation();
    setLocationDirectoryContextMenuAnchorEl(event.currentTarget);
    setSelectedLocation(location);
  };

  const handleLocationManagerMenu = (event: any) => {
    setLocationManagerMenuAnchorEl(event.currentTarget);
  };

  const handleCloseLocationManagerMenu = () => {
    setLocationManagerMenuAnchorEl(null);
  };

  const { classes } = props;
  return (
    <div className={classes.panel} style={props.style}>
      <CustomLogo />
      <div className={classes.toolbar}>
        <Typography
          className={classNames(classes.panelTitle, classes.header)}
          variant="subtitle1"
        >
          {i18n.t('core:locationManager')}
        </Typography>
        <IconButton
          data-tid="locationManagerMenu"
          onClick={handleLocationManagerMenu}
        >
          <MoreVertIcon />
        </IconButton>
      </div>
      <LocationManagerMenu
        anchorEl={locationManagerMenuAnchorEl}
        open={Boolean(locationManagerMenuAnchorEl)}
        onClose={handleCloseLocationManagerMenu}
        openURLExternally={props.openURLExternally}
        showCreateLocationDialog={() => {
          setLocationManagerMenuAnchorEl(null);
          setCreateLocationDialogOpened(true);
        }}
        toggleOpenLinkDialog={props.toggleOpenLinkDialog}
      />
      {!AppConfig.locationsReadOnly && (
        <div
          style={{
            width: '100%',
            textAlign: 'center',
            marginBottom: 10
          }}
        >
          <Button
            data-tid="createNewLocation"
            onClick={() => setCreateLocationDialogOpened(true)}
            title={i18n.t('core:createLocationTitle')}
            className={classes.mainActionButton}
            size="small"
            variant="outlined"
            color="primary"
            style={{ width: '95%' }}
          >
            {/* <CreateLocationIcon className={classNames(classes.leftIcon)} /> */}
            {i18n.t('core:createLocationTitle')}
          </Button>
        </div>
      )}
      <div>
        {isCreateLocationDialogOpened && (
          <CreateLocationDialogAsync
            // key={createLocationDialogKey}
            open={isCreateLocationDialogOpened}
            onClose={() => setCreateLocationDialogOpened(false)}
            addLocation={props.addLocation}
            showSelectDirectoryDialog={showSelectDirectoryDialog}
          />
        )}
        {isEditLocationDialogOpened && (
          <EditLocationDialogAsync
            // key={this.state.editLocationDialogKey}
            open={isEditLocationDialogOpened}
            onClose={() => setEditLocationDialogOpened(false)}
            location={selectedLocation}
            editLocation={props.editLocation}
            showSelectDirectoryDialog={showSelectDirectoryDialog}
            selectedDirectoryPath={selectedDirectoryPath}
          />
        )}
        {isDeleteLocationDialogOpened && (
          <ConfirmDialog
            open={isDeleteLocationDialogOpened}
            onClose={() => setDeleteLocationDialogOpened(false)}
            title={i18n.t('core:deleteLocationTitleAlert')}
            content={i18n.t('core:deleteLocationContentAlert', {
              locationName: selectedLocation ? selectedLocation.name : ''
            })}
            confirmCallback={result => {
              if (result && selectedLocation) {
                props.removeLocation(selectedLocation);
                directoryTreeRef.current[
                  selectedLocation.uuid
                ].removeLocation();
              }
            }}
            cancelDialogTID="cancelDeleteLocationDialog"
            confirmDialogTID="confirmDeleteLocationDialog"
          />
        )}
        {isSelectDirectoryDialogOpened && (
          <SelectDirectoryDialog
            open={isSelectDirectoryDialogOpened}
            onClose={() => setSelectDirectoryDialogOpened(false)}
            createNewDirectoryExt={createNewDirectoryExt}
            chooseDirectoryPath={chooseDirectoryPath}
          />
        )}
        {isCreateDirectoryDialogOpened && (
          <CreateDirectoryDialog
            open={isCreateDirectoryDialogOpened}
            onClose={() => setCreateDirectoryDialogOpened(false)}
            selectedDirectoryPath={selectedDirectoryPath}
          />
        )}
        <Menu
          anchorEl={locationDirectoryContextMenuAnchorEl}
          open={Boolean(locationDirectoryContextMenuAnchorEl)}
          onClose={() => setLocationDirectoryContextMenuAnchorEl(null)}
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
          <MenuItem
            data-tid="removeLocation"
            onClick={showDeleteLocationDialog}
          >
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
        <List
          className={classes.locationListArea}
          data-tid="locationList"
          style={{
            maxHeight: 'calc(100vh - 175px)',
            // @ts-ignore
            overflowY: AppConfig.isFirefox ? 'auto' : 'overlay'
          }}
        >
          {props.locations.map(location => (
            <LocationView
              key={location.uuid}
              classes={props.classes}
              location={location}
              handleLocationContextMenuClick={handleLocationContextMenuClick}
              hideDrawer={props.hideDrawer}
            />
          ))}
        </List>
      </div>
    </div>
  );
};

function mapStateToProps(state) {
  return {
    locations: getLocations(state),
    // currentLocationId: getCurrentLocationId(state),
    perspectives: getPerspectives(state)
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      addLocation: LocationActions.addLocation,
      moveLocationUp: LocationActions.moveLocationUp,
      moveLocationDown: LocationActions.moveLocationDown,
      editLocation: LocationActions.editLocation,
      removeLocation: LocationActions.removeLocation,
      createDirectoryIndex: LocationIndexActions.createDirectoryIndex,
      closeLocation: AppActions.closeLocation,
      openDirectory: AppActions.openDirectory,
      showInFileManager: AppActions.showInFileManager,
      openFileNatively: AppActions.openFileNatively,
      toggleOpenLinkDialog: AppActions.toggleOpenLinkDialog,
      openURLExternally: AppActions.openURLExternally,
      isCurrentLocation: AppActions.isCurrentLocation
    },
    dispatch
  );
}

export default withStyles(styles)(
  // @ts-ignore
  connect(mapStateToProps, mapDispatchToProps)(LocationManager)
);
