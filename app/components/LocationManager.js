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
import 'rc-table/assets/index.css';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import FolderIcon from '@material-ui/icons/Folder';
// import StartupFolderIcon from '@material-ui-icons/FolderSpecial';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import RefreshIcon from '@material-ui/icons/Refresh';
import DeleteIcon from '@material-ui/icons/DeleteForever';
import CloseIcon from '@material-ui/icons/Close';
import DefaultLocationIcon from '@material-ui/icons/Highlight';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
// import Button from '@material-ui/Button';
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
import AppConfig from '../config';
import PlatformIO from '../services/platform-io';

type Props = {
  classes: Object,
  locations: Array<Location>,
  perspectives: Array<Object>,
  currentLocationId: string,
  // getDirectoriesTree: (path: string, deepLevel: number) => void,
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
    dirs: {}
  };

  getDirectoriesTree = (subFolder: SubFolder, deepLevel: number) =>
    // const { settings } = getState();
    PlatformIO.listDirectoryPromise(subFolder.path, false)
      .then(dirEntries => {
        const directoryContent = [];
        dirEntries.map(entry => {
          if (entry.name === AppConfig.metaFolder) { // TODO !settings.showUnixHiddenEntries &&
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

  loadSubDirectories = (location: Location, deepLevel: number) => {
    const subFolder = {
      uuid: location.uuid,
      name: location.name,
      path: location.path || location.paths[0],
    };
    this.getDirectoriesTree(subFolder, deepLevel).then(children => {
      /* const elem = this.iterateTree(subFolder.path);
      if (elem) {
        console.log(elem);
      } */
      if (children instanceof Array) {
        if (location.uuid) {
          const dirsTree = this.state.dirs;
          if (location.path === undefined) { // location
            dirsTree[location.uuid] = children;
          } else {
            const dirsCopy = this.getFirstLevelDirs(location.path, children);
            if (dirsCopy) {
              // console.log(dirsCopy);
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
      }
      /* [
        ...this.state.dirs,
        { [location.uuid]: children }
      ] */
      return true;
    })
      .catch(error => {
        console.log('loadSubDirectories', error);
      });
  };

  // https://codereview.stackexchange.com/questions/47932/recursion-vs-iteration-of-tree-structure
  /* searchPath = (path: string, current, depth) => {
    const children = current.children;
    if (children !== undefined) {
      for (let i = 0, len = children.length; i < len; i += 1) {
        if (path === children[i].path) {
          return children[i];
        }
        this.searchPath(path, children[i], depth + 1);
      }
    }
  }; */

  /* set = (path: string, arrChildren: Array<SubFolder>) => {
    for (const [uuid, arrSubDirs] of Object.entries(this.state.dirs)) {
      const arr = arrSubDirs.length;
      let a;
      for (a = 0; a < arr; a += 1) {
        if (path === arrSubDirs[a].path) {
          const copyObj = [...this.state.dirs[uuid]];
          copyObj[a].children = arrChildren;
          return copyObj;
        }
        if (arrSubDirs[a].children !== undefined) {
          let schema = arrSubDirs[a]; // a moving reference to internal objects within obj
          const pList = path.split('/');
          const len = pList.length;
          for (let i = 0; i < len - 1; i++) {
            const elem = pList[i];
            if (!schema[elem]) schema[elem] = {};
            schema = schema[elem];
          }

          schema[pList[len - 1]] = arrChildren;
          return schema;
        }
      }
    }
  }; */

  getFirstLevelDirs = (path: string, arrChildren: Array<SubFolder>) => {
    // const arrLocations = Object.entries(this.state.dirs);
    /* for (const uuid in this.state.dirs) {
      this.state.dirs[uuid].forEach((dir) => {
        if (path.indexOf(dir.path) === 0) {
          return [...this.state.dirs[uuid]];
        }
        // console.log(dir);
      });
    } */
    /* function getLevel(obj, depth) {
      let b;
      for (b = 0; b < depth; b += 1) {
        obj.children = arrChildren;
      }
    } */
    for (const [uuid, arrSubDirs] of Object.entries(this.state.dirs)) {
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
                  propPath = propPath + stackPath + '.' + i + '.children';
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
                  propPath: '.' + i + '.children'
                });
              }
            }
          }
        }
      }
    }
  };

  iterateTree = (path: string) => {
    // const arrLocations = Object.entries(this.state.dirs);
    for (const uuid in this.state.dirs) {
      this.state.dirs[uuid].forEach((dir) => {
        console.log(dir);
      });
    }
    /* if (arrLocations.length > 0) {
      arrLocations.forEach((location) => {
        const stack = [{
          depth: 0,
          element: location
        }];
        let stackItem = 0;
        let current;
        let children,
          i,
          len;
        let depth;

        while (current = stack[stackItem++]) {
          // get the arguments
          depth = current.depth;
          current = current.element;
          children = current.element.children;
          for (i = 0, len = children.length; i < len; i++) {
            stack.push({ // pass args via object or array
              element: children[i],
              depth: depth + 1
            });
          }
        }
      });
    } */
  };
  /* getDir = (path: string) => {
    const arrLocations = Object.values(this.state.dirs);
    if(arrLocations.length > 0) {
      arrLocations.forEach((location) => {
        if(location.paths[0] === path)
if(dir.children !== undefined){

}
      });
    }
    return undefined;
  };

  findDir = (arrDirs: Array<Object>, path) => {
      return arrDirs.find(obj => obj.path === path);
  }; */
  /* componentWillReceiveProps(nextProps) {
    if (this.props.locations !== nextProps.locations) {
      nextProps.locations.map(entry => {
        if (this.state.locationRootPath === entry.path || this.state.locationRootPath === entry.paths[0]) {
          console.log('componentWillReceiveProps');
          this.props.loadSubDirectories(entry);
        }
      });
    }
  } */

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
      if (this.state.dirs[location.uuid] !== undefined) {
        const dirsTree = this.state.dirs;
        dirsTree[location.uuid] = undefined;
        this.setState({
          dirs: dirsTree
        });
      }
      this.props.loadDirectoryContent(location.paths[0]);
    } else {
      this.loadSubDirectories(location, 1);
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

  renderNameColumnAction = (field, location, key) => {
    const children = (
      <span>
        <FolderIcon style={{ marginTop: 0, marginBottom: -8 }} className={this.props.classes.icon} />
        <span style={{ fontSize: 15 }}>{field}</span>
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
      this.onRowClick(record);
    }
  };

  onRowClick = (subDir) => {
    this.loadSubDirectories(subDir, 1);
    this.props.loadDirectoryContent(subDir.path);
  };

  renderHeaderRow = col =>
    /* const { children, ...rest } = col;
    const isSelectionBox = col.className.includes('selection-column');

    return (
      <th {...rest}>
        {isSelectionBox ? (
          children
        ) : (
          <span>
            <span xs={4}>{children}</span>
            <span xs={2}>Age</span>
            <span xs>Bar</span>
          </span>
        )}
      </th>
    ); */
    (<span />)
  ;
  // expandedRowRender = (record, index, indent, expanded) => (<p>extra: {record.name}</p>);

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
          header: { cell: this.renderHeaderRow },
        }}
        className="table"
        rowKey="path"
        data={this.state.dirs[location.uuid]}
        columns={columns}
        // expandedRowRender={this.expandedRowRender}
        onExpand={this.onExpand}
        // expandIcon={CustomExpandIcon}
        // expandIconAsCell
        /* onRow={(record, index) => ({
          onClick: this.onRowClick.bind(null, record, index),
        })} */
      />);
    }
    return (
      <div>
        <ListItem
          data-tid={'location_' + location.name.replace(/ /g, '_')}
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
          <ListItemText
            style={{ paddingLeft: 5, paddingRight: 5 }}
            data-tid="locationTitleElement"
            primary={location.name}
          />
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
        {table}
      </div>
    );
  };

  render() {
    const classes = this.props.classes;
    return (
      <div className={classes.panel} style={this.props.style}>
        <div className={classes.toolbar}>
          <Typography className={classes.panelTitle} type="subtitle1">
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
