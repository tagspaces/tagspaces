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
import Button from '@material-ui/core/Button';
// import FolderSeparatorIcon from '@material-ui/icons/KeyboardArrowRight';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Badge from '@material-ui/core/Badge';
import { withStyles } from '@material-ui/core/styles';
import { HotKeys } from 'react-hotkeys';
import LocationMenu from './menus/LocationMenu';
import DirectoryMenu from './menus/DirectoryMenu';
import i18n from '../services/i18n';
import {
  getPerspectives,
  getMaxSearchResults
} from '../reducers/settings';
import {
  actions as AppActions,
  getDirectoryContent,
  getDirectoryPath,
  getLastSelectedEntry,
  getSearchResultCount,
  isReadOnlyMode,
  getCurrentLocationPath
} from '../reducers/app';
import TaggingActions from '../reducers/tagging-actions';
import {
  normalizePath,
  extractShortDirectoryName
} from '../utils/paths';
import PlatformIO from '../services/platform-io';
import LoadingLazy from '../components/LoadingLazy';

const GridPerspective = React.lazy(() => import(/* webpackChunkName: "GridPerspective" */ '../perspectives/grid-perspective/'));
const GridPerspectiveAsync = props => (
  <React.Suspense fallback={<LoadingLazy />}>
    <GridPerspective {...props} />
  </React.Suspense>
);

const WelcomePanel = React.lazy(() => import(/* webpackChunkName: "WelcomePanel" */ './WelcomePanel'));
const WelcomePanelAsync = props => (
  <React.Suspense fallback={<LoadingLazy />}>
    <WelcomePanel {...props} />
  </React.Suspense>
);

const CounterBadge = withStyles(theme => ({
  badge: {
    top: '50%',
    right: -15,
    color: theme.palette.type === 'light' ? theme.palette.grey[900] : theme.palette.grey[200],
    backgroundColor: theme.palette.type === 'light' ? theme.palette.grey[200] : theme.palette.grey[900]
  },
}))(Badge);

const styles = theme => ({
  mainPanel: {
    flex: '1 1 100%',
    width: '100%',
    height: '100%',
    maxHeight: '100%',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.default,
    display: 'flex',
    flexDirection: 'column'
  },
  toolbar: {
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 5,
    display: 'flex',
    justifyContent: 'center',
  },
  topPanel: {
    height: 50,
    width: '100%',
    overflowX: 'overlay',
    backgroundColor: theme.palette.background.default
  },
  centerPanel: {
    flex: '1 1 auto',
    width: '100%',
    backgroundColor: theme.palette.background.default
  },
  flexMiddle: {
    flex: '1 1 10%',
    display: 'flex',
    flexDirection: 'column'
  },
  folderButton: {
    minWidth: 30,
    whiteSpace: 'nowrap',
    paddingLeft: 3,
    paddingRight: 3,
    margin: '0 auto'
  },
  locationSelectorButton: {
    whiteSpace: 'nowrap',
    paddingLeft: 10,
    paddingRight: 10,
    alignItems: 'center'
  }
});

type Props = {
  classes: Object,
  windowHeight: number,
  windowWidth: number,
  directoryContent: Array<Object>,
  currentDirectoryPath: string | null,
  searchResultCount: number,
  lastSelectedEntry: string | null,
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
  showInFileManager: () => void,
  openFile: (path: string) => void,
  deleteDirectory: (path: string) => void,
  reflectCreateEntry: (path: string, isFile: boolean) => void,
  loadDirectoryContent: (path: string) => void,
  loadParentDirectoryContent: () => void,
  setLastSelectedEntry: (entryPath: string | null) => void,
  isReadOnlyMode: boolean,
  showNotification: () => void,
  maxSearchResults: number
};

type State = {
  currentPerspective?: string,
  currentPath?: string,
  pathParts?: Array<string>,
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
    currentPerspective: undefined,
    currentPath: '',
    pathParts: [],
    isPropertiesPanelVisible: false,
    isDirectoryMenuOpened: false,
    directoryContextMenuOpened: false,
    directoryContextMenuAnchorEl: null,
    perspectiveChooserMenuOpened: false,
    perspectiveChooserMenuAnchorEl: null,
    perspectiveCommand: null
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.currentDirectoryPath && prevState.currentPath !== nextProps.currentDirectoryPath) {
      let currentLocationPath = '';
      if (nextProps.currentLocationPath) {
        currentLocationPath = nextProps.currentLocationPath;
      }
      // Make the path unix like ending always with /
      const addSlash = PlatformIO.haveObjectStoreSupport() ? '//' : '/';
      let normalizedCurrentPath = addSlash + normalizePath(nextProps.currentDirectoryPath.split('\\').join('/'));
      const normalizedCurrentLocationPath = addSlash + normalizePath(currentLocationPath.split('\\').join('/'));
      // console.log('Current path : ' + normalizedCurrentPath);
      // console.log('Current location path : ' + normalizedCurrentLocationPath);
      let pathParts = [];
      while (normalizedCurrentPath.lastIndexOf('/') > 0 && normalizedCurrentPath.startsWith(normalizedCurrentLocationPath)) {
        pathParts.push(normalizedCurrentPath.substring(PlatformIO.haveObjectStoreSupport() ? 2 : 1));
        normalizedCurrentPath = normalizedCurrentPath.substring(0, normalizedCurrentPath.lastIndexOf('/'));
      }
      // console.log('Path parts : ' + JSON.stringify(pathParts));
      if (pathParts.length >= 1) {
        pathParts = pathParts.slice(1, pathParts.length); // remove current directory
      }
      pathParts = pathParts.reverse();
      if (pathParts.length > 2) {
        pathParts = pathParts.slice(pathParts.length - 2, pathParts.length); // leave only the last 2 dirs in the path
      }
      return {
        ...prevState,
        currentPath: nextProps.currentDirectoryPath,
        pathParts
      };
    }
    return null;
  }

  keyBindingHandlers = {
    openParentDirectory: this.props.loadParentDirectoryContent,
    nextDocument: () => {
      const nextFilePath = this.props.getNextFile();
      if (nextFilePath) {
        this.props.setLastSelectedEntry(nextFilePath);
      }
    },
    prevDocument: () => {
      const prevFilePath = this.props.getPrevFile();
      if (prevFilePath) {
        this.props.setLastSelectedEntry(prevFilePath);
      }
    },
    selectAll: () => {
      this.setState(
        {
          perspectiveCommand: { key: 'TOGGLE_SELECT_ALL' }
        },
        () => {
          this.setState({ perspectiveCommand: null });
        }
      );
    },
    deleteDocument: () => {
      this.setState(
        {
          perspectiveCommand: { key: 'DELETE_SELECTED_ENTRIES' }
        },
        () => {
          this.setState({ perspectiveCommand: null });
        }
      );
    },
    addRemoveTags: () => {
      this.setState(
        {
          perspectiveCommand: { key: 'ADD_REMOVE_TAGS' }
        },
        () => {
          this.setState({ perspectiveCommand: null });
        }
      );
    },
    renameFile: () => {
      this.setState(
        {
          perspectiveCommand: { key: 'RENAME_ENTRY' }
        },
        () => {
          this.setState({ perspectiveCommand: null });
        }
      );
    },
    openEntry: () => {
      const { lastSelectedEntry } = this.props;
      if (lastSelectedEntry) {
        const isLastSelectedEntryFile = this.props.directoryContent.some(
          fsEntry => fsEntry.isFile && fsEntry.path === lastSelectedEntry
        );
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

  renderPerspective() {
    if (
      // TODO handle location perspectives  === 'grid'
      this.props.currentDirectoryPath &&
      this.props.currentDirectoryPath.length >= 2
    ) {
      return (
        <GridPerspectiveAsync
          directoryContent={this.props.directoryContent}
          loadDirectoryContent={this.props.loadDirectoryContent}
          openFile={this.props.openFile}
          openFileNatively={this.props.openFileNatively}
          loadParentDirectoryContent={this.props.loadParentDirectoryContent}
          deleteFile={this.props.deleteFile}
          renameFile={this.props.renameFile}
          openDirectory={this.props.openDirectory}
          showInFileManager={this.props.showInFileManager}
          currentDirectoryPath={this.props.currentDirectoryPath}
          setLastSelectedEntry={this.props.setLastSelectedEntry}
          perspectiveCommand={this.state.perspectiveCommand}
          addTags={this.props.addTags}
          editTagForEntry={this.props.editTagForEntry}
          deleteDirectory={this.props.deleteDirectory}
          removeTags={this.props.removeTags}
          removeAllTags={this.props.removeAllTags}
          windowWidth={this.props.windowWidth}
        />
      );
    } else if (this.state.currentPerspective === 'filemanager') {
      return <div>Place for another perspective</div>;
    }
    return <WelcomePanelAsync />;
  }

  render() {
    const {
      currentDirectoryPath = '',
      loadDirectoryContent,
      searchResultCount,
      classes,
      maxSearchResults
    } = this.props;
    const normalizedCurrentDirPath = normalizePath(currentDirectoryPath.split('\\').join('/'));
    let searchResultCounterText = searchResultCount + ' ' + i18n.t('entries');
    if (searchResultCount >= maxSearchResults) {
      searchResultCounterText = 'More than ' + (maxSearchResults - 1) + ' entries found, showing only the first ' + maxSearchResults ;
    }
    return (
      <HotKeys handlers={this.keyBindingHandlers}>
        <div className={classes.mainPanel}>
          <div className={classes.topPanel}>
            <div className={classes.toolbar}>
              <LocationMenu />
              <CounterBadge
                showZero={false}
                title={searchResultCounterText}
                badgeContent={searchResultCount}
                color="secondary"
                max={maxSearchResults - 1}
              />
              <div className={classes.flexMiddle} />
              {currentDirectoryPath && (
                <div>
                  {this.state.pathParts &&
                    this.state.pathParts.map(pathPart => (
                      <Button
                        key={pathPart}
                        onClick={() => loadDirectoryContent(pathPart)}
                        title={'Navigate to: ' + pathPart}
                        style={{ paddingLeft: 3, paddingRight: 0, minWidth: 10 }}
                      >
                        {extractShortDirectoryName(pathPart, '/')}
                        &nbsp;/&nbsp;
                      </Button>
                    ))}
                  <Button
                    data-tid="folderContainerOpenDirMenu"
                    title={
                      i18n.t('core:openDirectoryMenu') +
                      ' - ' +
                      (currentDirectoryPath || '')
                    }
                    className={classes.folderButton}
                    onClick={this.openDirectoryMenu}
                    onContextMenu={this.openDirectoryMenu}
                  >
                    {extractShortDirectoryName(
                      normalizePath(normalizedCurrentDirPath), '/'
                    )}
                    <MoreVertIcon />
                  </Button>
                  <DirectoryMenu
                    open={this.state.directoryContextMenuOpened}
                    onClose={this.closeDirectoryMenu}
                    anchorEl={this.state.directoryContextMenuAnchorEl}
                    directoryPath={currentDirectoryPath}
                    loadDirectoryContent={this.props.loadDirectoryContent}
                    openFileNatively={this.props.openFileNatively}
                    openDirectory={this.props.openDirectory}
                    loadParentDirectoryContent={this.props.loadParentDirectoryContent}
                    showInFileManager={this.props.showInFileManager}
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
          <div
            className={classes.centerPanel}
            style={{ height: this.props.windowHeight }}
          >
            {this.renderPerspective()}
          </div>
        </div>
      </HotKeys>
    );
  }
}

function mapStateToProps(state) {
  return {
    currentDirectoryPath: getDirectoryPath(state),
    lastSelectedEntry: getLastSelectedEntry(state),
    perspectives: getPerspectives(state),
    directoryContent: getDirectoryContent(state),
    searchResultCount: getSearchResultCount(state),
    // pathPart: getPathTrail(state),
    currentLocationPath: getCurrentLocationPath(state),
    maxSearchResults: getMaxSearchResults(state),
    isReadOnlyMode: isReadOnlyMode(state)
  };
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(
    {
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
      showInFileManager: AppActions.showInFileManager,
      openFile: AppActions.openFile,
      deleteDirectory: AppActions.deleteDirectory,
      reflectCreateEntry: AppActions.reflectCreateEntry,
      loadDirectoryContent: AppActions.loadDirectoryContent,
      loadParentDirectoryContent: AppActions.loadParentDirectoryContent,
      setLastSelectedEntry: AppActions.setLastSelectedEntry,
      showNotification: AppActions.showNotification
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapActionCreatorsToProps
)(withStyles(styles)(FolderContainer));
