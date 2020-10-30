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

import React from 'react';
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

const isLocationsReadOnly = window.ExtLocationsReadOnly;

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

interface State {
  locationDirectoryContextMenuAnchorEl?: Object | null;
  locationContextMenuOpened?: boolean;
  directoryContextMenuAnchorEl?: Object | null;
  directoryContextMenuOpened?: boolean;
  selectedLocation: Location | null;
  selectedDirectoryPath?: string | null;
  isCreateLocationDialogOpened?: boolean;
  isEditLocationDialogOpened?: boolean;
  isDeleteLocationDialogOpened?: boolean;
  isSelectDirectoryDialogOpened?: boolean;
  createLocationDialogKey: string;
  isCreateDirectoryDialogOpened?: boolean;
  locationManagerMenuOpened: boolean;
  locationManagerMenuAnchorEl: Object | null;
}

type SubFolder = {
  uuid: string;
  name: string;
  path: string;
  children?: Array<SubFolder>;
};

class LocationManager extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.directoryTreeRef = [];
  }

  state = {
    locationDirectoryContextMenuAnchorEl: null,
    locationContextMenuOpened: false,
    directoryContextMenuAnchorEl: null,
    directoryContextMenuOpened: false,
    selectedLocation: null,
    selectedDirectoryPath: null,
    isCreateLocationDialogOpened: false,
    isEditLocationDialogOpened: false,
    isDeleteLocationDialogOpened: false,
    isCreateDirectoryDialogOpened: false,
    isSelectDirectoryDialogOpened: false,
    locationManagerMenuOpened: false,
    locationManagerMenuAnchorEl: null,
    createLocationDialogKey: uuidv1(),
    editLocationDialogKey: uuidv1()
  };

  componentDidMount() {
    if (this.props.locations.length < 1) {
      const devicePaths = PlatformIO.getDevicePaths();

      Object.keys(devicePaths).forEach(key => {
        this.props.addLocation(
          {
            uuid: uuidv1(),
            type: locationType.TYPE_LOCAL,
            name: key, // TODO use i18n
            paths: [devicePaths[key]],
            isDefault: AppConfig.isWeb && devicePaths[key] === '/files/', // Used for the web ts demo
            isReadOnly: false,
            persistIndex: false
          },
          false
        );
      });
    }
  }

  handleCloseDialogs = () => {
    this.setState({
      isCreateLocationDialogOpened: false,
      isEditLocationDialogOpened: false,
      isDeleteLocationDialogOpened: false,
      selectedDirectoryPath: undefined
    });
  };

  showCreateLocationDialog = () => {
    this.handleRequestCloseContextMenus();
    this.setState({ isCreateLocationDialogOpened: true });
  };

  closeChromeExtDialog = () => {
    this.handleRequestCloseContextMenus();
    this.setState({
      isCreateLocationDialogOpened: false,
      isEditLocationDialogOpened: false,
      selectedDirectoryPath: undefined
    });
  };

  indexLocation = () => {
    this.handleRequestCloseContextMenus();
    const { selectedLocation } = this.state;
    const { currentLocationId, createDirectoryIndex } = this.props;
    const isCurrentLocation =
      selectedLocation &&
      selectedLocation.uuid &&
      selectedLocation.uuid === currentLocationId;

    if (selectedLocation.type === locationType.TYPE_CLOUD) {
      PlatformIO.enableObjectStoreSupport(selectedLocation)
        .then(() => {
          createDirectoryIndex(
            selectedLocation.paths[0],
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
        selectedLocation.paths[0],
        selectedLocation.fullTextIndex,
        isCurrentLocation
      );
    }
  };

  moveLocationUp = () => {
    this.handleRequestCloseContextMenus();
    if (this.state.selectedLocation && this.state.selectedLocation.uuid) {
      this.props.moveLocationUp(this.state.selectedLocation.uuid);
    }
  };

  moveLocationDown = () => {
    this.handleRequestCloseContextMenus();
    if (this.state.selectedLocation && this.state.selectedLocation.uuid) {
      this.props.moveLocationDown(this.state.selectedLocation.uuid);
    }
  };

  showInFileManager = () => {
    this.handleRequestCloseContextMenus();
    this.props.openDirectory(this.state.selectedLocation.paths[0]);
  };

  closeLocation = () => {
    this.handleRequestCloseContextMenus();
    if (this.state.selectedLocation && this.state.selectedLocation.uuid) {
      this.props.closeLocation(this.state.selectedLocation.uuid);
      this.directoryTreeRef[this.state.selectedLocation.uuid].closeLocation();
      // this.directoryTreeRef[this.state.selectedLocation.uuid] = undefined;
      // this.directoryTreeRef[this.state.selectedLocation.uuid].closeLocation();
      /* this.setState({
        dirs: {}
      }); */
    }
  };

  showEditLocationDialog = () => {
    this.handleRequestCloseContextMenus();
    this.setState({ isEditLocationDialogOpened: true });
  };

  showDeleteLocationDialog = () => {
    this.handleRequestCloseContextMenus();
    this.setState({ isDeleteLocationDialogOpened: true });
  };

  handleDirectoryContextMenu = (
    event: React.ChangeEvent<HTMLInputElement>,
    directoryPath: string
  ) => {
    this.setState({
      directoryContextMenuOpened: true,
      directoryContextMenuAnchorEl: event.currentTarget,
      selectedDirectoryPath: directoryPath
    });
  };

  toggleDirectoryMenuClose = (event: React.ChangeEvent<HTMLInputElement>) => {
    const opened = this.state.directoryContextMenuOpened;
    this.setState({
      directoryContextMenuOpened: !opened,
      directoryContextMenuAnchorEl: event ? event.currentTarget : null
    });
  };

  createNewDirectoryExt = (path: string) => {
    this.setState({
      isCreateDirectoryDialogOpened: true,
      selectedDirectoryPath: path
    });
  };

  closeNewDirectoryDialog = () => {
    this.setState({ isCreateDirectoryDialogOpened: false });
  };

  showSelectDirectoryDialog = () => {
    this.setState({
      isSelectDirectoryDialogOpened: true,
      selectedDirectoryPath: ''
    });
  };

  chooseDirectoryPath = (currentPath: string) => {
    this.setState({
      isSelectDirectoryDialogOpened: false,
      selectedDirectoryPath: currentPath
    });
  };

  closeSelectDirectoryExtDialog = () => {
    this.setState({ isSelectDirectoryDialogOpened: false });
  };

  handleRequestCloseContextMenus = () => {
    this.setState({
      directoryContextMenuOpened: false,
      directoryContextMenuAnchorEl: null,
      locationContextMenuOpened: false,
      locationDirectoryContextMenuAnchorEl: null
      // selectedLocation: null,
      // selectedDirectoryPath: null,
    });
  };

  handleLocationContextMenuClick = (event: any, location: Location) => {
    event.preventDefault();
    event.stopPropagation();
    this.setState({
      locationContextMenuOpened: true,
      locationDirectoryContextMenuAnchorEl: event.currentTarget,
      selectedLocation: location
    });
  };

  // todo https://stackoverflow.com/questions/37949981/call-child-method-from-parent
  // const directoryTreeRef = useRef();

  handleLocationClick = (location: Location) => {
    this.directoryTreeRef[location.uuid].changeLocation(location);
    if (location.uuid === this.props.currentLocationId) {
      this.props.loadDirectoryContent(location.paths[0]);
    } else {
      // this.directoryTreeRef[location.uuid].loadSubDir(location, 1);
      this.props.setSelectedEntries([]);
      this.props.openLocation(location);
      if (this.props.hideDrawer) {
        this.props.hideDrawer();
      }
    }

    // const grid = document.querySelector('[data-tid="perspectiveGridFileTable"]');
    // const firstGridItem = grid.querySelector('div');
    // if (isObj(firstGridItem)) {
    //   firstGridItem.parentNode.scrollTop = target.offsetTop;
    // }
  };

  reloadDirectory = () => {
    this.handleRequestCloseContextMenus();
    if (this.state.selectedDirectoryPath) {
      this.props.loadDirectoryContent(this.state.selectedDirectoryPath);
    }
  };

  resetState = dialogKey => {
    // @ts-ignore
    this.setState({
      [dialogKey]: uuidv1()
    });
  };

  /**
   * https://github.com/react-component/table/blob/master/examples/react-dnd.js
   * @param item
   * @param monitor
   */
  handleFileMoveDrop = (item, monitor) => {
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
      if (this.props.isReadOnlyMode) {
        this.props.showNotification(
          i18n.t('core:dndDisabledReadOnlyMode'),
          'error',
          true
        );
        return;
      }
      if (!AppConfig.isWin && !path.startsWith('/')) {
        this.props.showNotification(
          i18n.t('Moving file not possible'),
          'error',
          true
        );
        return;
      }
      if (AppConfig.isWin && !path.substr(1).startsWith(':')) {
        this.props.showNotification(
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
              this.props.resetProgress();
              this.props
                .uploadFiles(arrPath, targetPath, this.props.onUploadProgress)
                .then((fsEntries: Array<FileSystemEntry>) => {
                  this.props.reflectCreateEntries(fsEntries);
                  return true;
                })
                .catch(error => {
                  console.log('uploadFiles', error);
                });
              this.props.toggleUploadDialog();
              return true;
            })
            .catch(error => {
              console.log('enableObjectStoreSupport', error);
            });
        } else if (targetLocation.type === locationType.TYPE_LOCAL) {
          PlatformIO.disableObjectStoreSupport();
          this.props.moveFiles(arrPath, targetPath);
        }
        this.props.setSelectedEntries([]);
      }
    }
  };

  // <Tooltip id="tooltip-icon" title={i18n.t('core:moreOperations')} placement="bottom"></Tooltip>
  renderLocation = (location: Location) => {
    const isCloudLocation = location.type === locationType.TYPE_CLOUD;

    return (
      <div key={location.uuid}>
        <ListItem
          data-tid={'location_' + location.name.replace(/ /g, '_')}
          className={
            this.props.currentLocationId === location.uuid
              ? this.props.classes.listItemSelected
              : this.props.classes.listItem
          }
          title={
            location.isDefault
              ? i18n.t('core: thisIsStartupLocation') +
                ' : ' +
                location.paths[0]
              : location.paths[0]
          }
          button
          onClick={() => this.handleLocationClick(location)}
          onContextMenu={event =>
            this.handleLocationContextMenuClick(event, location)
          }
        >
          <ListItemIcon
            // onClick={(e) => {
            //   e.preventDefault();
            //   this.loadSubDirectories(location, 1);
            // }}
            style={{ minWidth: 'auto' }}
          >
            {isCloudLocation ? (
              <CloudLocationIcon className={this.props.classes.icon} />
            ) : (
              <LocationIcon className={this.props.classes.icon} />
            )}
          </ListItemIcon>

          {isCloudLocation && !AppConfig.isElectron ? (
            <div style={{ maxWidth: 250 }}>
              <Typography
                variant="inherit"
                style={{ paddingLeft: 5, paddingRight: 5 }}
                className={this.props.classes.header}
                data-tid="locationTitleElement"
                noWrap
              >
                {location.name}
              </Typography>
            </div>
          ) : (
            <TargetMoveFileBox
              accepts={[DragItemTypes.FILE]}
              onDrop={this.handleFileMoveDrop}
              path={location.paths[0]}
              location={location}
            >
              <div style={{ maxWidth: 250 }}>
                <Typography
                  variant="inherit"
                  style={{ paddingLeft: 5, paddingRight: 5 }}
                  className={this.props.classes.header}
                  data-tid="locationTitleElement"
                  noWrap
                >
                  {location.name}
                </Typography>
              </div>
            </TargetMoveFileBox>
          )}
          {!isLocationsReadOnly && (
            <ListItemSecondaryAction>
              <IconButton
                aria-label={i18n.t('core:options')}
                aria-haspopup="true"
                edge="end"
                data-tid={'locationMoreButton_' + location.name}
                onClick={event =>
                  this.handleLocationContextMenuClick(event, location)
                }
                onContextMenu={event =>
                  this.handleLocationContextMenuClick(event, location)
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
          ref={dirTree => {
            this.directoryTreeRef[location.uuid] = dirTree;
          }}
          classes={this.props.classes}
          loadDirectoryContent={this.props.loadDirectoryContent}
          location={location}
          showUnixHiddenEntries={this.props.showUnixHiddenEntries}
          moveFiles={this.props.moveFiles}
          handleFileMoveDrop={this.handleFileMoveDrop}
        />
      </div>
    );
  };

  handleLocationManagerMenu = (event: any) => {
    this.setState({
      locationManagerMenuOpened: true,
      locationManagerMenuAnchorEl: event.currentTarget
    });
  };

  handleCloseLocationManagerMenu = () => {
    this.setState({ locationManagerMenuOpened: false });
  };

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.panel} style={this.props.style}>
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
            onClick={this.handleLocationManagerMenu}
          >
            <MoreVertIcon />
          </IconButton>
        </div>
        <LocationManagerMenu
          anchorEl={this.state.locationManagerMenuAnchorEl}
          open={this.state.locationManagerMenuOpened}
          onClose={this.handleCloseLocationManagerMenu}
          openURLExternally={this.props.openURLExternally}
        />
        {!isLocationsReadOnly && (
          <div style={{ width: '100%', textAlign: 'center', marginBottom: 10 }}>
            <Button
              data-tid="createNewLocation"
              onClick={this.showCreateLocationDialog}
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
          {this.state.isCreateLocationDialogOpened && (
            <CreateLocationDialogAsync
              key={this.state.createLocationDialogKey}
              resetState={this.resetState}
              open={this.state.isCreateLocationDialogOpened}
              onClose={this.handleCloseDialogs}
              addLocation={this.props.addLocation}
              showSelectDirectoryDialog={this.showSelectDirectoryDialog}
            />
          )}
          {this.state.isEditLocationDialogOpened && (
            <EditLocationDialogAsync
              key={this.state.editLocationDialogKey}
              resetState={this.resetState}
              open={this.state.isEditLocationDialogOpened}
              onClose={this.handleCloseDialogs}
              location={this.state.selectedLocation}
              editLocation={this.props.editLocation}
              showSelectDirectoryDialog={this.showSelectDirectoryDialog}
              selectedDirectoryPath={this.state.selectedDirectoryPath}
            />
          )}
          {this.state.isDeleteLocationDialogOpened && (
            <ConfirmDialog
              open={this.state.isDeleteLocationDialogOpened}
              onClose={this.handleCloseDialogs}
              title={i18n.t('core:deleteLocationTitleAlert')}
              content={i18n.t('core:deleteLocationContentAlert', {
                locationName: this.state.selectedLocation
                  ? this.state.selectedLocation.name
                  : ''
              })}
              confirmCallback={result => {
                if (result && this.state.selectedLocation) {
                  this.props.removeLocation(this.state.selectedLocation);
                  this.directoryTreeRef[
                    this.state.selectedLocation.uuid
                  ].removeLocation();
                }
              }}
              cancelDialogTID="cancelDeleteLocationDialog"
              confirmDialogTID="confirmDeleteLocationDialog"
            />
          )}
          {this.state.isSelectDirectoryDialogOpened && (
            <SelectDirectoryDialog
              open={this.state.isSelectDirectoryDialogOpened}
              onClose={this.closeSelectDirectoryExtDialog}
              createNewDirectoryExt={this.createNewDirectoryExt}
              chooseDirectoryPath={this.chooseDirectoryPath}
              selectedDirectoryPath={this.state.selectedDirectoryPath}
            />
          )}
          {this.state.isCreateDirectoryDialogOpened && (
            <CreateDirectoryDialog
              open={this.state.isCreateDirectoryDialogOpened}
              onClose={this.closeNewDirectoryDialog}
              selectedDirectoryPath={this.state.selectedDirectoryPath}
            />
          )}
          <Menu
            anchorEl={this.state.locationDirectoryContextMenuAnchorEl}
            open={this.state.locationContextMenuOpened}
            onClose={this.handleRequestCloseContextMenus}
          >
            <MenuItem
              data-tid="editLocation"
              onClick={this.showEditLocationDialog}
            >
              <ListItemIcon>
                <EditIcon />
              </ListItemIcon>
              <ListItemText primary={i18n.t('core:editLocationTitle')} />
            </MenuItem>
            <MenuItem data-tid="indexLocation" onClick={this.indexLocation}>
              <ListItemIcon>
                <RefreshIcon />
              </ListItemIcon>
              <ListItemText primary={i18n.t('core:indexLocation')} />
            </MenuItem>
            <MenuItem data-tid="moveLocationUp" onClick={this.moveLocationUp}>
              <ListItemIcon>
                <ArrowUpwardIcon />
              </ListItemIcon>
              <ListItemText primary={i18n.t('core:moveUp')} />
            </MenuItem>
            <MenuItem
              data-tid="moveLocationDown"
              onClick={this.moveLocationDown}
            >
              <ListItemIcon>
                <ArrowDownwardIcon />
              </ListItemIcon>
              <ListItemText primary={i18n.t('core:moveDown')} />
            </MenuItem>
            <MenuItem
              data-tid="removeLocation"
              onClick={this.showDeleteLocationDialog}
            >
              <ListItemIcon>
                <DeleteIcon />
              </ListItemIcon>
              <ListItemText primary={i18n.t('core:removeLocation')} />
            </MenuItem>
            <MenuItem
              data-tid="showInFileManager"
              onClick={this.showInFileManager}
            >
              <ListItemIcon>
                <OpenFolderNativelyIcon />
              </ListItemIcon>
              <ListItemText primary={i18n.t('core:showInFileManager')} />
            </MenuItem>
            <MenuItem data-tid="removeLocation" onClick={this.closeLocation}>
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
            {this.props.locations.map(this.renderLocation)}
          </List>
        </div>
        <DirectoryMenu
          open={this.state.directoryContextMenuOpened}
          onClose={this.toggleDirectoryMenuClose}
          anchorEl={this.state.directoryContextMenuAnchorEl}
          directoryPath={this.state.selectedDirectoryPath}
          loadDirectoryContent={this.props.loadDirectoryContent}
          openDirectory={this.props.openDirectory}
          openFsEntry={this.props.openFsEntry}
          reflectCreateEntry={this.props.reflectCreateEntry}
          deleteDirectory={this.props.deleteDirectory}
          classes={this.props.classes}
        />
      </div>
    );
  }
}

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
