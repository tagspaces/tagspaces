// @ts-nocheck @ts-ignore
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

import React, {useEffect, useRef, useState} from 'react';
import { bindActionCreators } from 'redux';
import uuidv1 from 'uuid';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import LocationIcon from '@material-ui/icons/WorkOutline';
import CloudLocationIcon from '@material-ui/icons/CloudQueue';
import EditIcon from '@material-ui/icons/Edit';
import RefreshIcon from '@material-ui/icons/Refresh';
import DeleteIcon from '@material-ui/icons/DeleteForever';
import CloseIcon from '@material-ui/icons/Close';
import DefaultLocationIcon from '@material-ui/icons/Highlight';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import OpenFolderNativelyIcon from '@material-ui/icons/Launch';
import { Progress } from 'aws-sdk/clients/s3';
import styles from './SidePanels.css';
import DirectoryMenu from './menus/DirectoryMenu';
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
import {
  actions as AppActions,
  getCurrentLocationId,
  isReadOnlyMode
} from '../reducers/app';
import { actions as LocationIndexActions } from '../reducers/location-index';
import { getPerspectives, getShowUnixHiddenEntries } from '-/reducers/settings';
import i18n from '../services/i18n';
import AppConfig from '../config';
import PlatformIO from '../services/platform-io';
import TargetMoveFileBox from './TargetMoveFileBox';
import DragItemTypes from './DragItemTypes';
import IOActions from '../reducers/io-actions';
import DirectoryTreeView from '-/components/DirectoryTreeView';
import LoadingLazy from '-/components/LoadingLazy';
import { FileSystemEntry } from '-/services/utils-io';

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
  locations: Array<Location>;
  perspectives: Array<Object>;
  currentLocationId: string;
  isReadOnlyMode: boolean;
  hideDrawer: () => void;
  openFsEntry: (fsEntry: FileSystemEntry) => void;
  reflectCreateEntries: (fsEntries: Array<FileSystemEntry>) => void;
  openURLExternally: (path: string) => void;
  loadDirectoryContent: (path: string) => void;
  openLocation: (location: Location) => void;
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
  reflectCreateEntry: (path: string, isFile: boolean) => void;
  deleteDirectory: (directoryPath: string) => void;
  showUnixHiddenEntries: boolean;
  showNotification: (
    text: string,
    notificationType: string,
    autohide: boolean
  ) => void;
  moveFiles: (files: Array<string>, destination: string) => void;
  uploadFiles: (
    files: Array<string>,
    destination: string,
    onUploadProgress?: (progress: Progress, response: any) => void
  ) => Promise<Array<FileSystemEntry>>;
  toggleUploadDialog: () => void;
  resetProgress: () => void;
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
    directoryContextMenuAnchorEl,
    setDirectoryContextMenuAnchorEl
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

  /* state = {
    createLocationDialogKey: uuidv1(),
    editLocationDialogKey: uuidv1()
  }; */

  /* componentDidMount() {
    if (this.props.locations.length < 1) {
      const devicePaths = PlatformIO.getDevicePaths();

      Object.keys(devicePaths).forEach(key => {
        this.props.addLocation(
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
  } */

  /* const closeChromeExtDialog = () => {
    this.handleRequestCloseContextMenus();
    this.setState({
      isCreateLocationDialogOpened: false,
      isEditLocationDialogOpened: false,
      selectedDirectoryPath: undefined
    });
  }; */

  const indexLocation = () => {
    setLocationDirectoryContextMenuAnchorEl(null);
    const { currentLocationId, createDirectoryIndex } = props;
    const isCurrentLocation =
      selectedLocation &&
      selectedLocation.uuid &&
      selectedLocation.uuid === currentLocationId;

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
      // this.directoryTreeRef[this.state.selectedLocation.uuid] = undefined;
      // this.directoryTreeRef[this.state.selectedLocation.uuid].closeLocation();
      /* this.setState({
        dirs: {}
      }); */
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

  /* handleDirectoryContextMenu = (
    event: React.ChangeEvent<HTMLInputElement>,
    directoryPath: string
  ) => {
    this.setState({
      directoryContextMenuOpened: true,
      directoryContextMenuAnchorEl: event.currentTarget,
      selectedDirectoryPath: directoryPath
    });
  }; */

  const createNewDirectoryExt = (path: string) => {
    setCreateDirectoryDialogOpened(true);
    setSelectedDirectoryPath(path);
    /* this.setState({
      isCreateDirectoryDialogOpened: true,
      selectedDirectoryPath: path
    }); */
  };

  const showSelectDirectoryDialog = () => {
    setSelectDirectoryDialogOpened(true);
    setSelectedDirectoryPath('');
    /* this.setState({
      isSelectDirectoryDialogOpened: true,
      selectedDirectoryPath: ''
    }); */
  };

  const chooseDirectoryPath = (currentPath: string) => {
    setSelectDirectoryDialogOpened(true);
    setSelectedDirectoryPath(currentPath);
    /* this.setState({
      isSelectDirectoryDialogOpened: false,
      selectedDirectoryPath: currentPath
    }); */
  };

  /* const handleRequestCloseContextMenus = () => {
    this.setState({
      directoryContextMenuOpened: false,
      directoryContextMenuAnchorEl: null,
      locationContextMenuOpened: false,
      locationDirectoryContextMenuAnchorEl: null
      // selectedLocation: null,
      // selectedDirectoryPath: null,
    });
  }; */

  const handleLocationContextMenuClick = (event: any, location: Location) => {
    event.preventDefault();
    event.stopPropagation();
    setLocationDirectoryContextMenuAnchorEl(event.currentTarget);
    setSelectedLocation(location);
    /* this.setState({
      locationContextMenuOpened: true,
      locationDirectoryContextMenuAnchorEl: event.currentTarget,
      selectedLocation: location
    }); */
  };

  // todo https://stackoverflow.com/questions/37949981/call-child-method-from-parent
  // const directoryTreeRef = useRef();

  const handleLocationClick = (location: Location) => {
    directoryTreeRef.current[location.uuid].changeLocation(location);
    if (location.uuid === props.currentLocationId) {
      props.loadDirectoryContent(location.path || location.paths[0]);
    } else {
      // this.directoryTreeRef[location.uuid].loadSubDir(location, 1);
      props.setSelectedEntries([]);
      props.openLocation(location);
      if (props.hideDrawer) {
        props.hideDrawer();
      }
    }

    // const grid = document.querySelector('[data-tid="perspectiveGridFileTable"]');
    // const firstGridItem = grid.querySelector('div');
    // if (isObj(firstGridItem)) {
    //   firstGridItem.parentNode.scrollTop = target.offsetTop;
    // }
  };

  /* const reloadDirectory = () => {
    this.handleRequestCloseContextMenus();
    if (this.state.selectedDirectoryPath) {
      this.props.loadDirectoryContent(this.state.selectedDirectoryPath);
    }
  }; */

  const resetState = dialogKey => {
    // @ts-ignore
    /* this.setState({
      [dialogKey]: uuidv1()
    }); */
  };

  // const handleFileMoveDropMemo = useMemo(() => handleFileMoveDrop, []);

  /**
   * https://github.com/react-component/table/blob/master/examples/react-dnd.js
   * @param item
   * @param monitor
   */
  const handleFileMoveDrop = (item, monitor) => {
    if (monitor) {
      const { path, selectedEntries } = monitor.getItem();
      const arrPath = [];
      if (selectedEntries && selectedEntries.length > 0) {
        selectedEntries.map(entry => {
          arrPath.push(entry.path);
          return true;
        });
      } else {
        arrPath.push(path);
      }
      if (props.isReadOnlyMode) {
        props.showNotification(
          i18n.t('core:dndDisabledReadOnlyMode'),
          'error',
          true
        );
        return;
      }
      if (!AppConfig.isWin && !path.startsWith('/')) {
        props.showNotification(
          i18n.t('Moving file not possible'),
          'error',
          true
        );
        return;
      }
      if (AppConfig.isWin && !path.substr(1).startsWith(':')) {
        props.showNotification(
          i18n.t('Moving file not possible'),
          'error',
          true
        );
        return;
      }
      let targetPath = item.path;
      const targetLocation = item.location;
      if (targetPath === undefined) {
        targetPath = targetLocation.path;
      }
      /* if (item.children && item.children.props && item.children.props.path) {
        targetPath = item.children.props.path;
      } else {
        targetPath = item.children[1].props.record.path;
      } */
      if (monitor && targetPath !== undefined && targetLocation !== undefined) {
        // TODO handle monitor -> isOver and change folder icon
        console.log('Dropped files: ' + path);
        if (targetLocation.type === locationType.TYPE_CLOUD) {
          PlatformIO.enableObjectStoreSupport(targetLocation)
            .then(() => {
              props.resetProgress();
              props
                .uploadFiles(arrPath, targetPath, props.onUploadProgress)
                .then((fsEntries: Array<FileSystemEntry>) => {
                  props.reflectCreateEntries(fsEntries);
                  return true;
                })
                .catch(error => {
                  console.log('uploadFiles', error);
                });
              props.toggleUploadDialog();
              return true;
            })
            .catch(error => {
              console.log('enableObjectStoreSupport', error);
            });
        } else if (targetLocation.type === locationType.TYPE_LOCAL) {
          PlatformIO.disableObjectStoreSupport();
          props.moveFiles(arrPath, targetPath);
        }
        props.setSelectedEntries([]);
      }
    }
  };

  // <Tooltip id="tooltip-icon" title={i18n.t('core:moreOperations')} placement="bottom"></Tooltip>
  const renderLocation = (location: Location) => {
    const isCloudLocation = location.type === locationType.TYPE_CLOUD;

    return (
      <div key={location.uuid}>
        <ListItem
          data-tid={'location_' + location.name.replace(/ /g, '_')}
          className={
            props.currentLocationId === location.uuid
              ? props.classes.listItemSelected
              : props.classes.listItem
          }
          title={
            location.isDefault
              ? i18n.t('core: thisIsStartupLocation') + ' : ' + location.path ||
                location.paths[0]
              : location.path || location.paths[0]
          }
          button
          onClick={() => handleLocationClick(location)}
          onContextMenu={event =>
            handleLocationContextMenuClick(event, location)
          }
        >
          <ListItemIcon
            // onClick={(e) => {
            //   e.preventDefault();
            //   this.loadSubDirectories(location, 1);
            // }}
            style={{
              minWidth: 'auto'
            }}
          >
            {isCloudLocation ? (
              <CloudLocationIcon className={props.classes.icon} />
            ) : (
              <LocationIcon className={props.classes.icon} />
            )}
          </ListItemIcon>

          {isCloudLocation && !AppConfig.isElectron ? (
            <div
              style={{
                maxWidth: 250
              }}
            >
              <Typography
                variant="inherit"
                style={{
                  paddingLeft: 5,
                  paddingRight: 5
                }}
                className={props.classes.header}
                data-tid="locationTitleElement"
                noWrap
              >
                {location.name}
              </Typography>
            </div>
          ) : (
            <TargetMoveFileBox
              accepts={[DragItemTypes.FILE]}
              onDrop={handleFileMoveDrop}
              path={location.path || location.paths[0]}
              location={location}
            >
              <div
                style={{
                  maxWidth: 250
                }}
              >
                <Typography
                  variant="inherit"
                  style={{
                    paddingLeft: 5,
                    paddingRight: 5
                  }}
                  className={props.classes.header}
                  data-tid="locationTitleElement"
                  noWrap
                >
                  {location.name}
                </Typography>
              </div>
            </TargetMoveFileBox>
          )}
          {!AppConfig.locationsReadOnly && (
            <ListItemSecondaryAction>
              <IconButton
                aria-label={i18n.t('core:options')}
                aria-haspopup="true"
                edge="end"
                data-tid={'locationMoreButton_' + location.name}
                onClick={event =>
                  handleLocationContextMenuClick(event, location)
                }
                onContextMenu={event =>
                  handleLocationContextMenuClick(event, location)
                }
              >
                {location.isDefault && (
                  <DefaultLocationIcon data-tid="startupIndication" />
                )}
                <MoreVertIcon />
              </IconButton>
            </ListItemSecondaryAction>
          )}
        </ListItem>
        <DirectoryTreeView
          // key={location.uuid} TODO dont display not expanded
          ref={dirTree => {
            if (dirTree && !(location.uuid in directoryTreeRef.current)) {
              directoryTreeRef.current[location.uuid] = dirTree;
            }
          }}
          classes={props.classes}
          loadDirectoryContent={props.loadDirectoryContent}
          location={location}
          showUnixHiddenEntries={props.showUnixHiddenEntries}
          moveFiles={props.moveFiles}
          handleFileMoveDrop={handleFileMoveDrop}
        />
      </div>
    );
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
            resetState={resetState}
            open={isCreateLocationDialogOpened}
            onClose={() => setCreateLocationDialogOpened(false)}
            addLocation={props.addLocation}
            showSelectDirectoryDialog={showSelectDirectoryDialog}
          />
        )}
        {isEditLocationDialogOpened && (
          <EditLocationDialogAsync
            // key={this.state.editLocationDialogKey}
            resetState={resetState}
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
            selectedDirectoryPath={selectedDirectoryPath}
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
          {props.locations.map(renderLocation)}
        </List>
      </div>
      <DirectoryMenu
        open={Boolean(directoryContextMenuAnchorEl)}
        onClose={() => setDirectoryContextMenuAnchorEl(null)}
        anchorEl={directoryContextMenuAnchorEl}
        directoryPath={selectedDirectoryPath}
        loadDirectoryContent={props.loadDirectoryContent}
        openDirectory={props.openDirectory}
        openFsEntry={props.openFsEntry}
        reflectCreateEntry={props.reflectCreateEntry}
        deleteDirectory={props.deleteDirectory}
        classes={props.classes}
      />
    </div>
  );
};

function mapStateToProps(state) {
  return {
    locations: getLocations(state),
    currentLocationId: getCurrentLocationId(state),
    perspectives: getPerspectives(state),
    isReadOnlyMode: isReadOnlyMode(state),
    showUnixHiddenEntries: getShowUnixHiddenEntries(state)
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      ...LocationActions,
      openLocation: AppActions.openLocation,
      onUploadProgress: AppActions.onUploadProgress,
      toggleUploadDialog: AppActions.toggleUploadDialog,
      resetProgress: AppActions.resetProgress,
      createDirectoryIndex: LocationIndexActions.createDirectoryIndex,
      closeLocation: AppActions.closeLocation,
      loadDirectoryContent: AppActions.loadDirectoryContent,
      reflectCreateEntry: AppActions.reflectCreateEntry,
      deleteDirectory: AppActions.deleteDirectory,
      openDirectory: AppActions.openDirectory,
      showInFileManager: AppActions.showInFileManager,
      openFileNatively: AppActions.openFileNatively,
      openFsEntry: AppActions.openFsEntry,
      showNotification: AppActions.showNotification,
      reflectCreateEntries: AppActions.reflectCreateEntries,
      toggleOpenLinkDialog: AppActions.toggleOpenLinkDialog,
      moveFiles: IOActions.moveFiles,
      uploadFiles: IOActions.uploadFiles,
      openURLExternally: AppActions.openURLExternally,
      setSelectedEntries: AppActions.setSelectedEntries
    },
    dispatch
  );
}

export default withStyles(styles)(
  // @ts-ignore
  connect(mapStateToProps, mapDispatchToProps)(LocationManager)
);
