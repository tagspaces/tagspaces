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
import Table from 'rc-table';
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
import OpenFolderNativelyIcon from '@material-ui/icons/Launch';
import styles from './SidePanels.css';
import DirectoryMenu from './menus/DirectoryMenu';
import LocationManagerMenu from './menus/LocationManagerMenu';
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
  Location
} from '../reducers/locations';
import {
  actions as AppActions,
  getCurrentLocationId,
  isReadOnlyMode
} from '../reducers/app';
import { actions as LocationIndexActions } from '../reducers/location-index';
import {
  getPerspectives,
  getShowUnixHiddenEntries
} from '../reducers/settings';
import i18n from '../services/i18n';
import AppConfig from '../config';
import PlatformIO from '../services/platform-io';
import TargetMoveFileBox from './TargetMoveFileBox';
import DragItemTypes from './DragItemTypes';
import IOActions from '../reducers/io-actions';

const isLocationsReadOnly = window.ExtLocationsReadOnly;

interface Props {
  classes: any;
  locations: Array<Location>;
  perspectives: Array<Object>;
  currentLocationId: string;
  isReadOnlyMode: boolean;
  hideDrawer: () => void;
  openFile: (path: string) => void;
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
  // renameDirectory: (directoryPath: string, newDirectoryName: string) => void,
  reflectCreateEntry: (path: string, isFile: boolean) => void;
  deleteDirectory: (directoryPath: string) => void;
  showUnixHiddenEntries: boolean;
  showNotification: (
    text: string,
    notificationType: string,
    autohide: boolean
  ) => void;
  moveFiles: (files: Array<string>, destination: string) => void;
}

interface State {
  locationDirectoryContextMenuAnchorEl?: Object | null;
  locationContextMenuOpened?: boolean;
  directoryContextMenuAnchorEl?: Object | null;
  directoryContextMenuOpened?: boolean;
  selectedLocation: Location | null;
  selectedDirectoryPath?: string | null;
  locationRootPath?: string | null;
  isCreateLocationDialogOpened?: boolean;
  isEditLocationDialogOpened?: boolean;
  isDeleteLocationDialogOpened?: boolean;
  isSelectDirectoryDialogOpened?: boolean;
  createLocationDialogKey: string;
  isCreateDirectoryDialogOpened?: boolean;
  locationManagerMenuOpened: boolean;
  locationManagerMenuAnchorEl: Object | null;
  dirs?: Object;
}

type SubFolder = {
  uuid: string;
  name: string;
  path: string;
  children?: Array<SubFolder>;
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
    locationManagerMenuOpened: false,
    locationManagerMenuAnchorEl: null,
    createLocationDialogKey: uuidv1(),
    editLocationDialogKey: uuidv1(),
    dirs: {}
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

  loadSubDirectories = (location: Location, deepLevel: number) => {
    const subFolder = {
      uuid: location.uuid,
      name: location.name,
      path: location.path || location.paths[0]
    };
    this.getDirectoriesTree(subFolder, deepLevel)
      .then(children => {
        if (children instanceof Array) {
          if (location.uuid) {
            const dirsTree = {}; // this.state.dirs; (uncomment to allow open multiple Locations folders) //TODO set settings for this
            if (location.path === undefined) {
              // location
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
        } else if (location.path === undefined) {
          // if is Location
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
      // @ts-ignore
      .then(dirEntries => {
        const directoryContent = [];
        dirEntries.map(entry => {
          if (
            entry.name === AppConfig.metaFolder ||
            entry.name.endsWith('/' + AppConfig.metaFolder) ||
            (!this.props.showUnixHiddenEntries && entry.name.startsWith('.'))
          ) {
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
            directoryContent.map(directory =>
              promisesArr.push(
                this.getDirectoriesTree(directory, deepLevel - 1)
              )
            );
            return Promise.all(promisesArr);
          }
        }
        return subFolder;
      })
      .catch(error => {
        console.log('getDirectoriesTree', error);
      });

  /**
   * https://codereview.stackexchange.com/questions/47932/recursion-vs-iteration-of-tree-structure
   * Dynamically set property of nested object
   * */
  getMergedDirsCopy = (path: string, arrChildren: Array<SubFolder>) => {
    const entries = Object.entries(this.state.dirs);
    for (const [uuid, arrSubDirs] of entries) {
      const arr: number = (arrSubDirs as Array<any>).length;
      let a;
      for (a = 0; a < arr; a += 1) {
        if (path === arrSubDirs[a].path) {
          const copyObj = [...this.state.dirs[uuid]];
          copyObj[a].children = arrChildren;
          return copyObj;
        }
        if (arrSubDirs[a].children !== undefined) {
          const stack = [
            {
              depth: 0,
              element: arrSubDirs[a],
              propPath: ''
            }
          ];
          let stackItem = 0;
          let current;
          let children;
          let depth;
          let stackPath;
          let propPath = a + '.children';

          while ((current = stack[stackItem++])) {
            // get the arguments
            stackPath = current.propPath;
            depth = current.depth;
            current = current.element;
            children = current.children;
            if (children !== undefined) {
              const len = children.length;
              for (let i = 0; i < len; i++) {
                if (path === children[i].path) {
                  propPath =
                    propPath +
                    '.' +
                    (stackPath ? stackPath + '.' : '') +
                    i +
                    '.children';
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

                stack.push({
                  // pass args via object or array
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
    const { selectedLocation } = this.state;
    const { currentLocationId, createDirectoryIndex } = this.props;
    const isCurrentLocation =
      selectedLocation &&
      selectedLocation.uuid &&
      selectedLocation.uuid === currentLocationId;
    createDirectoryIndex(
      selectedLocation.paths[0],
      selectedLocation.fullTextIndex,
      isCurrentLocation
    );
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

  handleLocationContextMenuClick = (event: any, location: Location) => {
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
      this.props.setSelectedEntries([]);
      this.loadSubDirectories(location, 1);
      this.props.openLocation(location);
      this.state.locationRootPath = location.paths[0];
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

  renderNameColumnAction = field => {
    const children = (
      <span style={{ fontSize: 15, marginLeft: 5 }} title={field}>
        <FolderIcon
          style={{ marginTop: 0, marginBottom: -8 }}
          className={this.props.classes.icon}
        />
        {field && field.length > 25 ? field.substr(0, 25) + '...' : field}
      </span>
    );
    return {
      children,
      props: {}
    };
  };

  handleCellClick = (record, index) => ({
    /* onContextMenu: (e) => {
      this.handleFileContextMenu(e, record.path);
    }, */
    onClick: () => {
      this.onRowClick(record);
    }
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

  onRowClick = subDir => {
    this.loadSubDirectories(subDir, 1);
    this.props.loadDirectoryContent(subDir.path);
  };

  /**
   * https://github.com/react-component/table/blob/master/examples/react-dnd.js
   * @param item
   * @param monitor
   */
  handleFileMoveDrop = (item, monitor) => {
    const { path, selectedEntries } = monitor.getItem();
    const arrPath = [];
    if (selectedEntries && selectedEntries.length > 0) {
      selectedEntries.map(entry => {
        arrPath.push(entry.path);
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
    const targetPath = item.path;
    const targetLocationType = item.locationType;
    /*if (item.children && item.children.props && item.children.props.path) {
      targetPath = item.children.props.path;
    } else {
      targetPath = item.children[1].props.record.path;
    }*/
    if (monitor && targetPath != undefined) {
      // TODO handle monitor -> isOver and change folder icon
      console.log('Dropped files: ' + path);
      if (targetLocationType === locationType.TYPE_CLOUD) {
        this.props.uploadFiles(arrPath, targetPath);
      } else {
        //if (targetLocationType === locationType.TYPE_LOCAL) {
        this.props.moveFiles(arrPath, targetPath);
      }
      this.props.setSelectedEntries([]);
    }
  };

  renderBodyCell = props => (
    <td {...props} style={{ position: 'relative' }}>
      <TargetMoveFileBox
        // @ts-ignore
        accepts={[DragItemTypes.FILE]}
        onDrop={this.handleFileMoveDrop}
        path={
          //TODO rethink this its not reliable to get path like that (try Picture)
          props.children[0] !== undefined
            ? props.children[0]._owner.key
            : undefined
        }
        // locationType={location.type}
      >
        {props.children}
      </TargetMoveFileBox>
    </td>
  );

  // <Tooltip id="tooltip-icon" title={i18n.t('core:moreOperations')} placement="bottom"></Tooltip>
  renderLocation = (location: Location) => {
    let table;
    const isCloudLocation = location.type === locationType.TYPE_CLOUD;
    if (this.state.dirs[location.uuid] !== undefined) {
      const columns = [
        {
          title: undefined,
          dataIndex: 'name',
          key: 'name',
          width: '80%',
          render: this.renderNameColumnAction,
          onCell: this.handleCellClick
        }
      ];
      table = (
        <Table
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
          indentSize={20}
          // expandedRowRender={this.expandedRowRender}
          onExpand={this.onExpand}
          // expandIcon={this.CustomExpandIcon}
          // expandIconAsCell
          /* onRow={(record, index) => ({
						onClick: this.onRowClick.bind(null, record, index),
					})} */
        />
      );
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
            {location.type === locationType.TYPE_CLOUD ? (
              <CloudLocationIcon className={this.props.classes.icon} />
            ) : (
              <LocationIcon className={this.props.classes.icon} />
            )}
          </ListItemIcon>

          {isCloudLocation ? (
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
              // @ts-ignore
              accepts={[DragItemTypes.FILE]}
              onDrop={this.handleFileMoveDrop}
              path={location.paths[0]}
              locationType={location.type}
            >
              <div style={{ maxWidth: 250 }} path={location.paths[0]}>
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
        {table}
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
          <CreateLocationDialog
            key={this.state.createLocationDialogKey}
            resetState={this.resetState}
            open={this.state.isCreateLocationDialogOpened}
            onClose={this.handleCloseDialogs}
            addLocation={this.props.addLocation}
            showSelectDirectoryDialog={this.showSelectDirectoryDialog}
          />
          <EditLocationDialog
            key={this.state.editLocationDialogKey}
            resetState={this.resetState}
            open={this.state.isEditLocationDialogOpened}
            onClose={this.handleCloseDialogs}
            location={this.state.selectedLocation}
            editLocation={this.props.editLocation}
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
          openFile={this.props.openFile}
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
      moveFiles: IOActions.moveFiles,
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
