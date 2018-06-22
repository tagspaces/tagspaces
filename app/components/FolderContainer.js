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
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Button from 'material-ui/Button';
import ArrowDropDownIcon from 'material-ui-icons/ArrowDropDown';
import Typography from 'material-ui/Typography';
import FolderIcon from 'material-ui-icons/Folder';
import MoreVertIcon from 'material-ui-icons/MoreVert';
import { withStyles } from 'material-ui/styles';
import Menu, { MenuItem } from 'material-ui/Menu';
import { ListItemIcon, ListItemText } from 'material-ui/List';
import ListSubHeader from 'material-ui/List/ListSubheader';
import { HotKeys } from 'react-hotkeys';
import Loadable from 'react-loadable';
import WelcomePanel from './WelcomePanel';
import DirectoryMenu from './menus/DirectoryMenu';
import i18n from '../services/i18n';
import { getPerspectives } from '../reducers/settings';
import { getLocations, type Location } from '../reducers/locations';
import {
  actions as AppActions,
  getDirectoryContent,
  getDirectoryPath,
  getCurrentLocationId,
  getLastSelectedEntry,
  getSearchResultCount,
  isReadOnlyMode
} from '../reducers/app';
import TaggingActions from '../reducers/tagging-actions';
import { getAllTags, type Tag } from '../reducers/taglibrary';
import { extractDirectoryName } from '../utils/paths';

// https://reactjs.org/blog/2017/05/18/whats-new-in-create-react-app.html#code-splitting-with-dynamic-import
// https://medium.com/@magbicaleman/intro-to-dynamic-import-in-create-react-app-6305bb397c46

const styles = theme => ({
  mainPanel: {
    flex: '1 1 100%',
    width: '100%',
    height: '100%',
    maxHeight: '100%',
    overflowY: 'hidden',
    backgroundColor: theme.palette.background.default,
    display: 'flex',
    flexDirection: 'column'
  },
  toolbar: {
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 5,
    display: 'flex',
    justifyContent: 'center'
  },
  topPanel: {
    flex: '1 1 50px',
    height: 50,
    width: '100%',
    backgroundColor: theme.palette.background.default
  },
  centerPanel: {
    flex: '1 1 auto',
    width: '100%',
    backgroundColor: theme.palette.background.default
  },
  flexMiddle: {
    flex: '1 1 50%',
    display: 'flex',
    flexDirection: 'column',
  },
  entriesFound: {
    alignSelf: 'center',
    paddingTop: 10
  },
  folderButton: {
    minWidth: 30,
    whiteSpace: 'nowrap',
    margin: '0 auto'
  },
  locationSelectorButton: {
    whiteSpace: 'nowrap',
    paddingLeft: 10,
    paddingRight: 10,
    alignItems: 'center'
  }
});

function Loading() {
  return <div style={{ padding: 10 }}>Loading...</div>;
}

const GridPerspective = Loadable({
  // loader: () => import('../node_modules/@tagspaces/grid-perspective/index'),
  loader: () => import('../perspectives/grid-perspective/src/index'),
  // webpack: () => [require.resolveWeak('../perspectives/desktopr/index')],
  // modules: [path.join(__dirname, './perspectives/desktopr/index')],
  loading: Loading
});

const FileManagerPerspective = Loadable({
  loader: () => import('../perspectives/file-manager/index'),
  // webpack: () => [require.resolveWeak('../perspectives/file-manager/index')],
  // modules: [path.join(__dirname, '../perspectives/file-manager/index')],
  loading: Loading
});

type Props = {
  classes: Object,
  windowHeight: number,
  windowWidth: number,
  locations: Array<Location>,
  directoryContent: Array<Object>,
  currentLocationId: string | null,
  currentDirectoryPath: string | null,
  searchResultCount: number,
  lastSelectedEntry: string | null,
  allTags: Array<Tag>,
  settings: Object,
  addTags: () => void,
  removeTags: () => void,
  removeAllTags: () => void,
  editTagForEntry: () => void,
  openFileNatively: (path: string) => void,
  toggleCreateFileDialog: () => void,
  deleteFile: () => void,
  renameFile: () => void,
  getNextFile: () => string,
  getPrevFile: () => string,
  openDirectory: () => void,
  sortByCriteria: () => void,
  openLocation: (path: string) => void,
  openFile: (path: string) => void,
  deleteDirectory: (path: string) => void,
  reflectCreateEntry: (path: string, isFile: boolean) => void,
  loadDirectoryContent: (path: string) => void,
  loadParentDirectoryContent: () => void,
  setLastSelectedEntry: (entryPath: string | null) => void,
  isReadOnlyMode: boolean,
  showNotification: () => void
};

type State = {
  currentLocation?: Location,
  currentPerspective?: string,
  isPropertiesPanelVisible?: boolean,
  locationChooserMenuOpened?: boolean,
  locationChooserMenuAnchorEl?: null | Object,
  directoryMenuOpened?: boolean,
  directoryMenuAnchorEl?: null | Object,
  perspectiveChooserMenuOpened?: boolean,
  perspectiveChooserMenuAnchorEl?: null | Object,
  perspectiveCommand?: null | Object
};

class FolderContainer extends React.Component<Props, State> {
  state = {
    currentPerspective: '',
    isPropertiesPanelVisible: false,
    isDirectoryMenuOpened: false,
    locationChooserMenuOpened: false,
    locationChooserMenuAnchorEl: null,
    directoryContextMenuOpened: false,
    directoryContextMenuAnchorEl: null,
    perspectiveChooserMenuOpened: false,
    perspectiveChooserMenuAnchorEl: null,
    perspectiveCommand: {}
  };

  componentWillReceiveProps = (nextProps: Props) => {
    if (nextProps.currentLocationId != null) {
      this.props.locations.map((location: Location) => {
        if (location.uuid === nextProps.currentLocationId) {
          this.setState({
            currentLocation: location,
            currentPerspective: 'grid' // TODO for removing
          });
        }
        return true;
      });
    } else { // closing the perspective
      this.setState({
        currentLocation: undefined,
        currentPerspective: undefined
      });
    }
  };

  keyBindingHandlers = {
    openParentDirectory: this.props.loadParentDirectoryContent,
    nextDocument: () => {
      const nextFilePath = this.props.getNextFile();
      if (nextFilePath) {
        this.setState({
          perspectiveCommand: { key: 'SELECT_FILE', value: nextFilePath }
        }, () => { this.setState({ perspectiveCommand: {} }); });
        this.props.setLastSelectedEntry(nextFilePath);
      }
    },
    prevDocument: () => {
      const prevFilePath = this.props.getPrevFile();
      if (prevFilePath) {
        this.setState({
          perspectiveCommand: { key: 'SELECT_FILE', value: prevFilePath }
        }, () => { this.setState({ perspectiveCommand: {} }); });
        this.props.setLastSelectedEntry(prevFilePath);
      }
    },
    selectAll: () => {
      this.setState({
        perspectiveCommand: { key: 'TOGGLE_SELECT_ALL' }
      }, () => { this.setState({ perspectiveCommand: {} }); });
    },
    openEntry: () => {
      const { lastSelectedEntry } = this.props;
      if (lastSelectedEntry) {
        const isLastSelectedEntryFile = this.props.directoryContent.some(fsEntry => (fsEntry.isFile && fsEntry.path === lastSelectedEntry));
        if (isLastSelectedEntryFile) {
          this.props.openFile(lastSelectedEntry);
        } else {
          this.props.loadDirectoryContent(lastSelectedEntry);
        }
      }
    },
    openFileExternally: () => {
      if (this.props.lastSelectedEntry) {
        this.props.openFileNatively(this.props.lastSelectedEntry);
      }
    }
  };

  toggleLocationChooserClose = (event?: Object) => {
    this.setState({
      locationChooserMenuOpened: !this.state.locationChooserMenuOpened,
      locationChooserMenuAnchorEl: event ? event.currentTarget : null
    });
  };

  openDirectoryMenu = (event: Object) => {
    this.setState({
      directoryContextMenuOpened: true,
      directoryContextMenuAnchorEl: event ? event.currentTarget : null
    });
  };

  closeDirectoryMenu = () => {
    this.setState({
      directoryContextMenuOpened: false,
      directoryContextMenuAnchorEl: null
    });
  };

  togglePerspectiveChooserClose = (event?: Object) => {
    this.setState({
      perspectiveChooserMenuOpened: !this.state.perspectiveChooserMenuOpened,
      perspectiveChooserMenuAnchorEl: event ? event.currentTarget : null
    });
  };

  openLocation = locationId => {
    this.props.openLocation(locationId);
    this.toggleLocationChooserClose();
  };

  renderPerspective() {
    // console.log('renderPerspective: ', this.props);
    if (this.state.currentPerspective === 'grid') {
      return (
        <GridPerspective
          directoryContent={this.props.directoryContent}
          loadDirectoryContent={this.props.loadDirectoryContent}
          loadParentDirectoryContent={this.props.loadParentDirectoryContent}
          openFile={this.props.openFile}
          openFileNatively={this.props.openFileNatively}
          deleteFile={this.props.deleteFile}
          renameFile={this.props.renameFile}
          openDirectory={this.props.openDirectory}
          sortByCriteria={this.props.sortByCriteria}
          currentDirectoryPath={this.props.currentDirectoryPath}
          setLastSelectedEntry={this.props.setLastSelectedEntry}
          perspectiveCommand={this.state.perspectiveCommand}
          addTags={this.props.addTags}
          editTagForEntry={this.props.editTagForEntry}
          deleteDirectory={this.props.deleteDirectory}
          allTags={this.props.allTags}
          settings={this.props.settings}
          removeTags={this.props.removeTags}
          removeAllTags={this.props.removeAllTags}
          windowWidth={this.props.windowWidth}
        />
      );
    } else if (this.state.currentPerspective === 'filemanager') {
      return (<div>Place for another perspective</div>);
      /*
        <FileManagerPerspective
          directoryContent={this.props.directoryContent}
          loadDirectoryContent={this.props.loadDirectoryContent}
          openFile={this.props.openFile}
          openFileNatively={this.props.openFileNatively}
          deleteFile={this.props.deleteFile}
          renameFile={this.props.renameFile}
          openDirectory={this.props.openDirectory}
          sortByCriteria={this.props.sortByCriteria}
          currentDirectoryPath={this.props.currentDirectoryPath}
          setLastSelectedEntry={this.props.setLastSelectedEntry}
          perspectiveCommand={this.state.perspectiveCommand}
          deleteDirectory={this.props.deleteDirectory}
          tags={this.props.allTags}
          settings={this.props.settings}
          addTags={this.props.addTags}
          removeTags={this.props.removeTags}
          removeAllTags={this.props.removeAllTags}
        />
      */
    }
    return (
      <WelcomePanel
        locations={this.props.locations}
        openLocation={this.props.openLocation}
      />
    );
  }

  render() {
    const { classes } = this.props;
    // console.log(this.props.windowHeight);
    return (
      <HotKeys handlers={this.keyBindingHandlers}>
        <div className={classes.mainPanel}>
          <div className={classes.topPanel}>
            <div className={classes.toolbar}>
              <Button
                data-tid="folderContainerLocationChooser"
                className={classes.locationSelectorButton}
                onClick={this.toggleLocationChooserClose}
              >
                {this.state.currentLocation
                  ? this.state.currentLocation.name
                  : i18n.t('core:pleaseOpenLocation')}
                <ArrowDropDownIcon />
              </Button>
              <Menu
                id="simple-menu"
                anchorEl={this.state.locationChooserMenuAnchorEl}
                open={this.state.locationChooserMenuOpened}
                onClose={this.toggleLocationChooserClose}
                PaperProps={{
                  style: {
                    maxHeight: 48 * 6.5,
                    width: 300
                  }
                }}
              >
                <div style={{ display: 'none' }} />
                <ListSubHeader>{i18n.t('core:chooseLocation')}</ListSubHeader>
                {this.props.locations.map((location: Location) => (
                  <MenuItem
                    data-tid="folderContainerMenuOpenLocation"
                    key={location.uuid}
                    onClick={() => this.openLocation(location.uuid)}
                  >
                    <ListItemIcon>
                      <FolderIcon />
                    </ListItemIcon>
                    <ListItemText inset primary={location.name} />
                  </MenuItem>
                ))}
              </Menu>
              <div className={classes.flexMiddle} data-tid="entriesFound">
                {(this.props.searchResultCount > 0) && (
                  <Typography className={classes.entriesFound}>{this.props.searchResultCount} {i18n.t('entries')}</Typography>
                )}
              </div>
              {this.state.currentLocation &&
                this.props.currentDirectoryPath && (
                <div>
                  <Button
                    data-tid="folderContainerOpenDirMenu"
                    title={i18n.t('core:openDirectoryMenu')}
                    className={classes.folderButton}
                    onClick={this.openDirectoryMenu}
                  >
                    {extractDirectoryName(this.props.currentDirectoryPath)}
                    <MoreVertIcon />
                  </Button>
                  <DirectoryMenu
                    open={this.state.directoryContextMenuOpened}
                    onClose={this.closeDirectoryMenu}
                    anchorEl={this.state.directoryContextMenuAnchorEl}
                    directoryPath={this.props.currentDirectoryPath}
                    loadDirectoryContent={this.props.loadDirectoryContent}
                    openFileNatively={this.props.openFileNatively}
                    openDirectory={this.props.openDirectory}
                    reflectCreateEntry={this.props.reflectCreateEntry}
                    openFile={this.props.openFile}
                    toggleCreateFileDialog={this.props.toggleCreateFileDialog}
                    deleteDirectory={this.props.deleteDirectory}
                    showNotification={this.props.showNotification}
                    isReadOnlyMode={this.props.isReadOnlyMode}
                  />
                </div>
              )}
            </div>
          </div>
          <div className={classes.centerPanel} style={{ height: this.props.windowHeight }}>
            {this.renderPerspective()}
          </div>
        </div>
      </HotKeys>
    );
  }
}

function mapStateToProps(state) {
  return {
    locations: getLocations(state),
    currentDirectoryPath: getDirectoryPath(state),
    lastSelectedEntry: getLastSelectedEntry(state),
    currentLocationId: getCurrentLocationId(state),
    perspectives: getPerspectives(state),
    directoryContent: getDirectoryContent(state),
    allTags: getAllTags(state),
    searchResultCount: getSearchResultCount(state),
    isReadOnlyMode: isReadOnlyMode(state),
    settings: state.settings
  };
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators({
    addTags: TaggingActions.addTags,
    removeTags: TaggingActions.removeTags,
    removeAllTags: TaggingActions.removeAllTags,
    editTagForEntry: TaggingActions.editTagForEntry,
    openFileNatively: AppActions.openFileNatively,
    toggleCreateFileDialog: AppActions.toggleCreateFileDialog,
    deleteFile: AppActions.deleteFile,
    renameFile: AppActions.renameFile,
    getNextFile: AppActions.getNextFile,
    getPrevFile: AppActions.getPrevFile,
    openDirectory: AppActions.openDirectory,
    sortByCriteria: AppActions.sortByCriteria,
    openLocation: AppActions.openLocation,
    openFile: AppActions.openFile,
    deleteDirectory: AppActions.deleteDirectory,
    reflectCreateEntry: AppActions.reflectCreateEntry,
    loadDirectoryContent: AppActions.loadDirectoryContent,
    loadParentDirectoryContent: AppActions.loadParentDirectoryContent,
    setLastSelectedEntry: AppActions.setLastSelectedEntry,
    showNotification: AppActions.showNotification
  }, dispatch);
}

export default connect(mapStateToProps, mapActionCreatorsToProps)(
  withStyles(styles)(FolderContainer)
);
