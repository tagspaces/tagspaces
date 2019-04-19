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
import Table from 'rc-table';
import { bindActionCreators } from 'redux';
import uuidv1 from 'uuid';
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
import FolderIcon from '@material-ui/icons/FolderOpen';
import LocationIcon from '@material-ui/icons/WorkOutline';
import CloudLocationIcon from '@material-ui/icons/CloudQueue';
import EditIcon from '@material-ui/icons/Edit';
import RefreshIcon from '@material-ui/icons/Refresh';
import DeleteIcon from '@material-ui/icons/DeleteForever';
import CloseIcon from '@material-ui/icons/Close';
import DefaultLocationIcon from '@material-ui/icons/Highlight';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import styles from './SidePanels.css';
import DirectoryMenu from './menus/DirectoryMenu';
import EditLocationDialog from './dialogs/EditLocationDialog';
import CreateLocationDialog from './dialogs/CreateLocationDialog';
import ConfirmDialog from './dialogs/ConfirmDialog';
import SelectDirectoryDialog from './dialogs/SelectDirectoryDialog';
import CreateDirectoryDialog from './dialogs/CreateDirectoryDialog';
import CustomLogo from './CustomLogo';
import {
  actions as LocationActions,
  getLocations,
  locationType,
  type Location
} from '../reducers/locations';
import { actions as AppActions, getCurrentLocationId, isReadOnlyMode } from '../reducers/app';
import { actions as LocationIndexActions } from '../reducers/location-index';
import { getPerspectives, getShowUnixHiddenEntries } from '../reducers/settings';
import i18n from '../services/i18n';
import { isObj } from '../utils/misc';
import AppConfig from '../config';
import PlatformIO from '../services/platform-io';
import TargetMoveFileBox from './TargetMoveFileBox';
import DragItemTypes from './DragItemTypes';
import IOActions from '../reducers/io-actions';

const isLocationsReadOnly = window.ExtLocationsReadOnly;

type Props = {
  classes: Object,
  locations: Array<Location>,
  perspectives: Array<Object>,
  currentLocationId: string,
  isReadOnlyMode: boolean,
  loadDirectoryContent: (path: string) => void,
  openLocation: (location: Location) => void,
  openFileNatively: (path: string) => void,
  openDirectory: (path: string) => void,
  showInFileManager: (path: string) => void,
  createDirectoryIndex: (path: string) => void,
  addLocation: (location: Location, openAfterCreate: boolean) => void,
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
  ) => void,
  moveFiles: (files: Array<string>, destination: string) => void
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
  isCreateDirectoryDialogOpened?: boolean,
  createLocationDialogKey: string,
  isCreateDirectoryDialogOpened?: boolean,
  dirs?: Object
};

type SubFolder = {
  uuid: string,
  name: string,
  path: string,
  children?: Array<SubFolder>
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
    isSelectDirectoryDialogOpened: false,
    createLocationDialogKey: uuidv1(),
    editLocationDialogKey: uuidv1(),
    dirs: {}
  };

  componentDidMount() {
    if (this.props.locations.length < 1) {
      const devicePaths = PlatformIO.getDevicePaths();

      Object.keys(devicePaths).forEach(key => {
        this.props.addLocation({
          uuid: uuidv1(),
          type: locationType.TYPE_LOCAL,
          name: key, // TODO use i18n
          paths: [devicePaths[key]],
          isDefault: (AppConfig.isWeb && devicePaths[key] === '/files/'), // Used for the web ts demo
          isReadOnly: false,
          persistIndex: false
        }, false);
      });
    }
  }

  loadSubDirectories = (location: Location, deepLevel: number) => {
    const subFolder = {
      uuid: location.uuid,
      name: location.name,
      path: location.path || location.paths[0],
    };
    this.getDirectoriesTree(subFolder, deepLevel).then(children => {
      if (children instanceof Array) {
        if (location.uuid) {
          const dirsTree = {}; // this.state.dirs; (uncomment to allow open multiple Locations folders) //TODO set settings for this
          if (location.path === undefined) { // location
            dirsTree[location.uuid] = children;
          } else {
            const dirsCopy = this.getMergedDirsCopy(location.path, children);
            if (dirsCopy) {
              dirsTree[location.uuid] = dirsCopy;
            } else {
              // eslint-disable-next-line no-param-reassign
              location.children = children;
              dirsTree[location.uuid] = [location];
            }
          }
          this.setState({
            dirs: dirsTree
          });
        }
      } else if (location.path === undefined) { // if is Location
        this.setState({
          dirs: {}
        });
      }
      return true;
    })
      .catch(error => {
        console.log('loadSubDirectories', error);
      });
  };

  getDirectoriesTree = (subFolder: SubFolder, deepLevel: number) =>
    // const { settings } = getState();
    PlatformIO.listDirectoryPromise(subFolder.path, false)
      .then(dirEntries => {
        const directoryContent = [];
        dirEntries.map(entry => {
          if (entry.name === AppConfig.metaFolder
            || entry.name.endsWith('/' + AppConfig.metaFolder)
            || (!this.props.showUnixHiddenEntries && entry.name.startsWith('.'))) {
            return true;
          }
          // const enhancedEntry = enhanceEntry(entry);
          if (!entry.isFile) {
            // eslint-disable-next-line no-param-reassign
            entry.uuid = subFolder.uuid;
            directoryContent.push(entry);
          }
          return true;
        });
        if (directoryContent.length > 0) {
          // eslint-disable-next-line no-param-reassign
          subFolder.children = directoryContent;
          if (deepLevel > 0) {
            const promisesArr = [];
            directoryContent.map(directory => promisesArr.push(this.getDirectoriesTree(directory, deepLevel - 1)));
            return Promise.all(promisesArr);
          }
        }
        return subFolder;
      })
      .catch(error => {
        console.log('getDirectoriesTree', error);
      })
  ;

  /**
   * https://codereview.stackexchange.com/questions/47932/recursion-vs-iteration-of-tree-structure
   * Dynamically set property of nested object
   * */
  getMergedDirsCopy = (path: string, arrChildren: Array<SubFolder>) => {
    const entries = Object.entries(this.state.dirs);
    for (const [uuid, arrSubDirs] of entries) {
      const arr = arrSubDirs.length;
      let a;
      for (a = 0; a < arr; a += 1) {
        if (path === arrSubDirs[a].path) {
          const copyObj = [...this.state.dirs[uuid]];
          copyObj[a].children = arrChildren;
          return copyObj;
        }
        if (arrSubDirs[a].children !== undefined) {
          const stack = [{
            depth: 0,
            element: arrSubDirs[a],
            propPath: ''
          }];
          let stackItem = 0;
          let current;
          let children;
          let depth;
          let stackPath;
          let propPath = a + '.children';

          while (current = stack[stackItem++]) {
            // get the arguments
            stackPath = current.propPath;
            depth = current.depth;
            current = current.element;
            children = current.children;
            if (children !== undefined) {
              const len = children.length;
              for (let i = 0; i < len; i++) {
                if (path === children[i].path) {
                  propPath = propPath + '.' + (stackPath ? stackPath + '.' : '') + i + '.children';
                  const copyObj = [...this.state.dirs[uuid]];

                  let schema = copyObj; // a moving reference to internal objects within obj
                  const pList = propPath.split('.');
                  const leng = pList.length;
                  for (let c = 0; c < leng - 1; c++) {
                    const elem = pList[c];
                    if (!schema[elem]) schema[elem] = {};
                    schema = schema[elem];
                  }
                  schema[pList[leng - 1]] = arrChildren;
                  return copyObj;
                }

                stack.push({ // pass args via object or array
                  element: children[i],
                  depth: depth + 1,
                  propPath: (stackPath ? stackPath + '.' : '') + i + '.children'
                });
              }
            }
          }
        }
      }
    }
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
      this.setState({
        dirs: {}
      });
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
      if (this.state.dirs[location.uuid] !== undefined) {
        const dirsTree = this.state.dirs;
        dirsTree[location.uuid] = undefined;
        this.setState({
          dirs: dirsTree
        });
      } else {
        this.loadSubDirectories(location, 1);
      }
      this.props.loadDirectoryContent(location.paths[0]);
    } else {
      this.loadSubDirectories(location, 1);
      this.props.openLocation(location);
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

  resetState = (dialogKey) => {
    this.setState({
      [dialogKey]: uuidv1()
    });
  };

  renderNameColumnAction = (field, location, key) => {
    const children = (
      <span style={{ fontSize: 15, marginLeft: 5 }} title={field}>
        <FolderIcon style={{ marginTop: 0, marginBottom: -8 }} className={this.props.classes.icon} />
        {field && field.length > 25 ? field.substr(0, 25) + '...' : field}
        {/* <IconButton
          style={{ float: 'right', paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 }}
          aria-label={i18n.t('core:options')}
          aria-haspopup="true"
          data-tid={'locationMoreButton_' + field.name}
          onClick={event => this.handleLocationContextMenuClick(event, location)}
        >
          <MoreVertIcon />
        </IconButton> */}
      </span>
    );
    return {
      children,
      props: {},
    }; // (<span>{ name }</span>);
  };

  handleCellClick = (record, index) => ({
    /* onContextMenu: (e) => {
      this.handleFileContextMenu(e, record.path);
    }, */
    onClick: () => {
      this.onRowClick(record);
    },
    /* onDoubleClick: (e) => {
      this.onRowClick(record, index, e);
    } */
  });

  onExpand = (expanded, record) => {
    // console.log('onExpand', expanded + JSON.stringify(record));
    if (expanded) {
      // this.onRowClick(record);
      this.loadSubDirectories(record, 1);
    }
  };

  onRowClick = (subDir) => {
    this.loadSubDirectories(subDir, 1);
    this.props.loadDirectoryContent(subDir.path);
  };

  /**
   * https://github.com/react-component/table/blob/master/examples/react-dnd.js
   * @param item
   * @param monitor
   */
  handleFileMoveDrop = (item, monitor) => {
    if (this.props.isReadOnlyMode) {
      this.props.showNotification(
        i18n.t('core:dndDisabledReadOnlyMode'),
        'error',
        true
      );
      return;
    }
    if (monitor) { // TODO handle monitor -> isOver and change folder icon
      const { path } = monitor.getItem();
      console.log('Dropped files: ' + path);
      this.props.moveFiles([path], item.children[1].props.record.path);
    }
  };

  renderBodyCell = (props) =>
    (
      <td {...props} style={{ position: 'relative' }} >
        <TargetMoveFileBox accepts={[DragItemTypes.FILE]} onDrop={this.handleFileMoveDrop} >{props.children}</TargetMoveFileBox>
      </td>
    )
  ;

  // <Tooltip id="tooltip-icon" title={i18n.t('core:moreOperations')} placement="bottom"></Tooltip>
  renderLocation = (location: Location) => {
    let table;
    if (this.state.dirs[location.uuid] !== undefined) {
      const columns = [
        {
          title: undefined,
          dataIndex: 'name',
          key: 'name',
          width: '80%',
          render: this.renderNameColumnAction,
          onCell: this.handleCellClick,
        }
      ];
      table = (<Table
        // defaultExpandAllRows
        // className={classes.locationListArea}
        components={{
          // header: { cell: this.renderHeaderRow },
          body: { cell: this.renderBodyCell }
        }}
        showHeader={false}
        // className="table"
        rowKey="path"
        data={this.state.dirs[location.uuid]}
        columns={columns}
        // expandedRowRender={this.expandedRowRender}
        onExpand={this.onExpand}
        // expandIcon={this.CustomExpandIcon}
        // expandIconAsCell
        /* onRow={(record, index) => ({
          onClick: this.onRowClick.bind(null, record, index),
        })} */
      />);
    }
    return (
      <div key={location.uuid}>
        <ListItem
          data-tid={'location_' + location.name.replace(/ /g, '_')}
          className={
            this.props.currentLocationId === location.uuid
              ? this.props.classes.listItemSelected
              : this.props.classes.listItem
          }
          title={location.isDefault ? i18n.t('core: thisIsStartupLocation') + ' : ' + location.paths[0] : location.paths[0]}
          button
          onClick={() => this.handleLocationClick(location)}
          onContextMenu={event => this.handleLocationContextMenuClick(event, location)}
        >
          <ListItemIcon
            // onClick={(e) => {
            //   e.preventDefault();
            //   this.loadSubDirectories(location, 1);
            // }}
            style={{ marginRight: 0 }}
          >
            { location.type === locationType.TYPE_CLOUD ?
              (<CloudLocationIcon className={this.props.classes.icon} />) :
              (<LocationIcon className={this.props.classes.icon} />)
            }
          </ListItemIcon>
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
          { !isLocationsReadOnly && (
            <ListItemSecondaryAction>
              <IconButton
                aria-label={i18n.t('core:options')}
                aria-haspopup="true"
                data-tid={'locationMoreButton_' + location.name}
                onClick={event => this.handleLocationContextMenuClick(event, location)}
                onContextMenu={event => this.handleLocationContextMenuClick(event, location)}
              >
                {location.isDefault && (
                  <DefaultLocationIcon data-tid="startupIndication" />
                )}
                <MoreVertIcon />
              </IconButton>
            </ListItemSecondaryAction>
          )}
        </ListItem>
        {table}
      </div>
    );
  };

  render() {
    const classes = this.props.classes;
    return (
      <div className={classes.panel} style={this.props.style}>
        <CustomLogo />
        <div className={classes.toolbar}>
          <Typography className={classes.panelTitle} type="subtitle1">
            {i18n.t('core:locationManager')}
          </Typography>
        </div>
        { !isLocationsReadOnly && (
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
          <CreateLocationDialog
            key={this.state.createLocationDialogKey}
            resetState={this.resetState}
            open={this.state.isCreateLocationDialogOpened}
            onClose={this.handleCloseDialogs}
            addLocation={this.props.addLocation}
            perspectives={this.props.perspectives}
            showSelectDirectoryDialog={this.showSelectDirectoryDialog}
            selectedDirectoryPath={this.state.selectedDirectoryPath}
          />
          <EditLocationDialog
            key={this.state.editLocationDialogKey}
            resetState={this.resetState}
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
            cancelDialogTID={'cancelDeleteLocationDialog'}
            confirmDialogTID={'confirmDeleteLocationDialog'}
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
              maxHeight: 'calc(100vh - 150px)',
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
          openFileNatively={this.props.openFileNatively}
          openDirectory={this.props.openDirectory}
          showInFileManager={this.props.showInFileManager}
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
    perspectives: getPerspectives(state),
    isReadOnlyMode: isReadOnlyMode(state),
    showUnixHiddenEntries: getShowUnixHiddenEntries(state)
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    ...LocationActions,
    openLocation: AppActions.openLocation,
    createDirectoryIndex: LocationIndexActions.createDirectoryIndex,
    closeLocation: AppActions.closeLocation,
    loadDirectoryContent: AppActions.loadDirectoryContent,
    reflectCreateEntry: AppActions.reflectCreateEntry,
    deleteDirectory: AppActions.deleteDirectory,
    openDirectory: AppActions.openDirectory,
    showInFileManager: AppActions.showInFileManager,
    openFileNatively: AppActions.openFileNatively,
    openFile: AppActions.openFile,
    showNotification: AppActions.showNotification,
    moveFiles: IOActions.moveFiles
  }, dispatch);
}

export default withStyles(styles)(
  connect(mapStateToProps, mapDispatchToProps)(LocationManager)
);
