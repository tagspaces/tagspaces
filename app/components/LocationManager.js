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
 * @flow
 */

import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from 'material-ui/styles';
import classNames from 'classnames';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import MoreVertIcon from 'material-ui-icons/MoreVert';
import Menu, { MenuItem } from 'material-ui/Menu';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import Button from 'material-ui/Button';
import FolderIcon from 'material-ui-icons/Folder';
// import StartupFolderIcon from 'material-ui-icons/FolderSpecial';
import AddIcon from 'material-ui-icons/Add';
import EditIcon from 'material-ui-icons/Edit';
import RefreshIcon from 'material-ui-icons/Refresh';
import DeleteIcon from 'material-ui-icons/DeleteForever';
import CloseIcon from 'material-ui-icons/Close';
import DefaultLocationIcon from 'material-ui-icons/LightbulbOutline';
import ArrowDownwardIcon from 'material-ui-icons/ArrowDownward';
import ArrowUpwardIcon from 'material-ui-icons/ArrowUpward';
// import Button from 'material-ui/Button';
import styles from './SidePanels.css';
import DirectoryMenu from './menus/DirectoryMenu';
// import TreeNav from './TreeNav/TreeNav';
import EditLocationDialog from './dialogs/EditLocationDialog';
import CreateLocationDialog from './dialogs/CreateLocationDialog';
import ConfirmDialog from './dialogs/ConfirmDialog';
import SelectDirectoryDialog from './dialogs/SelectDirectoryDialog';
import CreateDirectoryDialog from './dialogs/CreateDirectoryDialog';
import {
  actions as LocationActions,
  getLocations,
  type Location
} from '../reducers/locations';
import { actions as AppActions, getCurrentLocationId } from '../reducers/app';
import { getPerspectives } from '../reducers/settings';
import i18n from '../services/i18n';
import { isObj } from '../utils/misc';
// import AppConfig from '../config';

type Props = {
  classes: Object,
  locations: Array<Location>,
  perspectives: Array<Object>,
  currentLocationId: string,
  loadDirectoryContent: (path: string) => void,
  openLocation: (path: string) => void,
  openFileNatively: (path: string) => void,
  openDirectory: (path: string) => void,
  createDirectoryIndex: (path: string) => void,
  addLocation: () => void,
  editLocation: () => void,
  moveLocationUp: (locationId: string) => void,
  moveLocationDown: (locationId: string) => void,
  closeLocation: (locationId: string) => void,
  removeLocation: (location: Location) => void,
  // renameDirectory: (directoryPath: string, newDirectoryName: string) => void,
  reflectCreateEntry: (path: string, isFile: boolean) => void,
  deleteDirectory: (directoryPath: string) => void,
  showNotification: (
    text: string,
    notificationType: string,
    autohide: boolean
  ) => void
};

type State = {
  locationDirectoryContextMenuAnchorEl?: Object | null,
  locationContextMenuOpened?: boolean,
  directoryContextMenuAnchorEl?: Object | null,
  directoryContextMenuOpened?: boolean,
  selectedLocation?: Location | null,
  selectedDirectoryPath?: string | null,
  locationRootPath?: string | null,
  isCreateLocationDialogOpened?: boolean,
  isEditLocationDialogOpened?: boolean,
  isDeleteLocationDialogOpened?: boolean,
  isSelectDirectoryDialogOpened?: boolean,
  isCreateDirectoryDialogOpened?: boolean
};

class LocationManager extends React.Component<Props, State> {
  state = {
    open: false,
    locationDirectoryContextMenuAnchorEl: null,
    locationContextMenuOpened: false,
    directoryContextMenuAnchorEl: null,
    directoryContextMenuOpened: false,
    selectedLocation: null,
    selectedDirectoryPath: null,
    locationRootPath: null,
    isCreateLocationDialogOpened: false,
    isEditLocationDialogOpened: false,
    isDeleteLocationDialogOpened: false,
    isCreateDirectoryDialogOpened: false,
    isSelectDirectoryDialogOpened: false
  };

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
    if (this.state.selectedLocation && this.state.selectedLocation.uuid) {
      this.props.createDirectoryIndex(this.state.selectedLocation.paths[0]);
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

  closeLocation = () => {
    this.handleRequestCloseContextMenus();
    if (this.state.selectedLocation && this.state.selectedLocation.uuid) {
      this.props.closeLocation(this.state.selectedLocation.uuid);
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

  handleDirectoryContextMenu = (event: Object, directoryPath: string) => {
    this.setState({
      directoryContextMenuOpened: true,
      directoryContextMenuAnchorEl: event.currentTarget,
      selectedDirectoryPath: directoryPath
    });
  };

  toggleDirectoryMenuClose = (event: Object) => {
    this.setState({
      directoryContextMenuOpened: !this.state.directoryContextMenuOpened,
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

  handleLocationContextMenuClick = (event: Object, location: Location) => {
    event.preventDefault();
    event.stopPropagation();
    this.setState({
      locationContextMenuOpened: true,
      locationDirectoryContextMenuAnchorEl: event.currentTarget,
      selectedLocation: location
    });
  };

  handleLocationClick = (location: Location) => {
    if (location.uuid === this.props.currentLocationId) {
      this.props.loadDirectoryContent(location.paths[0]);
    } else {
      this.props.openLocation(location.uuid);
      this.state.locationRootPath = location.paths[0];
    }
    const grid = document.querySelector('[data-tid="perspectiveGridFileTable"]');
    const firstGridItem = grid.querySelector('div');

    if (isObj(firstGridItem)) {
      firstGridItem.scrollIntoView({ top: 0 });
    }
  };

  reloadDirectory = () => {
    this.handleRequestCloseContextMenus();
    if (this.state.selectedDirectoryPath) {
      this.props.loadDirectoryContent(this.state.selectedDirectoryPath);
    }
  };

  // <Tooltip id="tooltip-icon" title={i18n.t('core:moreOperations')} placement="bottom"></Tooltip>
  renderLocation = (location: Location) => (
    <ListItem
      data-tid={'location_' + location.name.replace(/ /g,'_')}
      className={
        this.props.currentLocationId === location.uuid
          ? this.props.classes.listItemSelected
          : this.props.classes.listItem
      }
      key={location.uuid}
      title={location.paths[0]}
      button
      onClick={() => this.handleLocationClick(location)}
    >
      <ListItemIcon>
        <FolderIcon className={this.props.classes.icon} />
      </ListItemIcon>
      <ListItemText style={{ paddingLeft: 5, paddingRight: 5 }} data-tid="locationTitleElement" primary={location.name} />
      {location.isDefault && (
        <DefaultLocationIcon
          title={i18n.t('core: thisIsStartupLocation')}
          data-tid="startupIndication"
          className={this.props.classes.icon}
        />
      )}
      <IconButton
        aria-label={i18n.t('core:options')}
        aria-haspopup="true"
        data-tid={'locationMoreButton_' + location.name}
        onClick={event => this.handleLocationContextMenuClick(event, location)}
      >
        <MoreVertIcon />
      </IconButton>
    </ListItem>
  );

  render() {
    const classes = this.props.classes;
    return (
      <div className={classes.panel} style={this.props.style}>
        <div className={classes.toolbar}>
          <Typography className={classes.panelTitle} type="subheading">
            {i18n.t('core:locationManager')}
          </Typography>
        </div>
        <Button
          data-tid="createNewLocation"
          onClick={this.showCreateLocationDialog}
          title={i18n.t('core:createLocationTitle')}
          className={classes.mainActionButton}
          size="small"
          color="primary"
        >
          <AddIcon className={classNames(classes.leftIcon)} />
          {i18n.t('core:createLocationTitle')}
        </Button>
        <div>
          <CreateLocationDialog
            open={this.state.isCreateLocationDialogOpened}
            onClose={this.handleCloseDialogs}
            addLocation={this.props.addLocation}
            perspectives={this.props.perspectives}
            showSelectDirectoryDialog={this.showSelectDirectoryDialog}
            selectedDirectoryPath={this.state.selectedDirectoryPath}
          />
          <EditLocationDialog
            open={this.state.isEditLocationDialogOpened}
            onClose={this.handleCloseDialogs}
            location={this.state.selectedLocation}
            editLocation={this.props.editLocation}
            perspectives={this.props.perspectives}
            showSelectDirectoryDialog={this.showSelectDirectoryDialog}
            selectedDirectoryPath={this.state.selectedDirectoryPath}
          />
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
              }
            }}
            cancelDialogActionId={'cancelDeleteLocationDialog'}
            confirmDialogActionId={'confirmDeleteLocationDialog'}
          />
          <SelectDirectoryDialog
            open={this.state.isSelectDirectoryDialogOpened}
            onClose={this.closeSelectDirectoryExtDialog}
            createNewDirectoryExt={this.createNewDirectoryExt}
            chooseDirectoryPath={this.chooseDirectoryPath}
            selectedDirectoryPath={this.state.selectedDirectoryPath}
          />
          <CreateDirectoryDialog
            open={this.state.isCreateDirectoryDialogOpened}
            onClose={this.closeNewDirectoryDialog}
            selectedDirectoryPath={this.state.selectedDirectoryPath}
          />
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
              <ListItemText inset primary={i18n.t('core:editLocationTitle')} />
            </MenuItem>
            { this.state.selectedLocation && this.props.currentLocationId === this.state.selectedLocation.uuid && (
              <MenuItem
                data-tid="indexLocation"
                onClick={this.indexLocation}
              >
                <ListItemIcon>
                  <RefreshIcon />
                </ListItemIcon>
                <ListItemText inset primary={i18n.t('core:indexLocation')} />
              </MenuItem>
            )}
            <MenuItem data-tid="moveLocationUp" onClick={this.moveLocationUp}>
              <ListItemIcon>
                <ArrowUpwardIcon />
              </ListItemIcon>
              <ListItemText inset primary={i18n.t('core:moveUp')} />
            </MenuItem>
            <MenuItem
              data-tid="moveLocationDown"
              onClick={this.moveLocationDown}
            >
              <ListItemIcon>
                <ArrowDownwardIcon />
              </ListItemIcon>
              <ListItemText inset primary={i18n.t('core:moveDown')} />
            </MenuItem>
            <MenuItem
              data-tid="removeLocation"
              onClick={this.showDeleteLocationDialog}
            >
              <ListItemIcon>
                <DeleteIcon />
              </ListItemIcon>
              <ListItemText inset primary={i18n.t('core:removeLocation')} />
            </MenuItem>
            <MenuItem
              data-tid="removeLocation"
              onClick={this.closeLocation}
            >
              <ListItemIcon>
                <CloseIcon />
              </ListItemIcon>
              <ListItemText inset primary={i18n.t('core:closeLocation')} />
            </MenuItem>
          </Menu>
          <List
            className={classes.locationListArea}
            data-tid="locationList"
            style={{
              maxHeight: 'calc(100vh - 70px)',
              overflowY: 'overlay'
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
          openFileNatively={this.props.openFileNatively}
          openDirectory={this.props.openDirectory}
          openFile={this.props.openFile}
          reflectCreateEntry={this.props.reflectCreateEntry}
          deleteDirectory={this.props.deleteDirectory}
          classes={this.props.classes}
          showNotification={this.props.showNotification}
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    locations: getLocations(state),
    currentLocationId: getCurrentLocationId(state),
    perspectives: getPerspectives(state)
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    ...LocationActions,
    openLocation: AppActions.openLocation,
    createDirectoryIndex: AppActions.createDirectoryIndex,
    closeLocation: AppActions.closeLocation,
    loadDirectoryContent: AppActions.loadDirectoryContent,
    reflectCreateEntry: AppActions.reflectCreateEntry,
    deleteDirectory: AppActions.deleteDirectory,
    openDirectory: AppActions.openDirectory,
    openFileNatively: AppActions.openFileNatively,
  }, dispatch);
}

export default withStyles(styles)(
  connect(mapStateToProps, mapDispatchToProps)(LocationManager)
);
