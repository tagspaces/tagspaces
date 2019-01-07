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
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import Typography from '@material-ui/core/Typography';
import FolderSeparatorIcon from '@material-ui/icons/KeyboardArrowRight';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { withStyles } from '@material-ui/core/styles';
import { HotKeys } from 'react-hotkeys';
import Loadable from 'react-loadable';
import WelcomePanel from './WelcomePanel';
import LocationMenu from './LocationMenu';
import DirectoryMenu from './menus/DirectoryMenu';
import i18n from '../services/i18n';
import { getPerspectives } from '../reducers/settings';
import {
  actions as AppActions,
  getDirectoryContent,
  getDirectoryPath,
  getLastSelectedEntry,
  getSearchResultCount,
  isReadOnlyMode,
} from '../reducers/app';
import TaggingActions from '../reducers/tagging-actions';
import { extractDirectoryName, normalizePath, extractShortDirectoryName } from '../utils/paths';

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
    flex: '1 1 10%',
    display: 'flex',
    flexDirection: 'column'
  },
  entriesFound: {
    alignSelf: 'center',
    paddingTop: 10
  },
  folderButton: {
    minWidth: 30,
    whiteSpace: 'nowrap',
    paddingLeft: 0,
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
  return <Typography style={{ padding: 10 }}>{i18n.t('core:loading')}</Typography>;
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
  sortByCriteria: () => void,
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
    perspectiveCommand: {}
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.currentPath !== nextProps.currentDirectoryPath) {
      // Make the path unix like ending always with /
      let normalizedPath = normalizePath(nextProps.currentDirectoryPath.split('\\').join('/')) + '/';
      let pathParts = [];
      while (normalizedPath.lastIndexOf('/') > 0) {
        pathParts.push(normalizedPath);
        normalizedPath = normalizedPath.substring(0, normalizedPath.lastIndexOf('/'));
      }
      pathParts = pathParts.reverse();
      // let pathParts = normalizedPath.split('/');
      if (pathParts.length > 1) {
        pathParts = pathParts.slice(0, pathParts.length - 2); // remove current directory
      }
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
        this.setState(
          {
            perspectiveCommand: { key: 'SELECT_FILE', value: nextFilePath }
          },
          () => {
            this.setState({ perspectiveCommand: {} });
          }
        );
        this.props.setLastSelectedEntry(nextFilePath);
      }
    },
    prevDocument: () => {
      const prevFilePath = this.props.getPrevFile();
      if (prevFilePath) {
        this.setState(
          {
            perspectiveCommand: { key: 'SELECT_FILE', value: prevFilePath }
          },
          () => {
            this.setState({ perspectiveCommand: {} });
          }
        );
        this.props.setLastSelectedEntry(prevFilePath);
      }
    },
    selectAll: () => {
      this.setState(
        {
          perspectiveCommand: { key: 'TOGGLE_SELECT_ALL' }
        },
        () => {
          this.setState({ perspectiveCommand: {} });
        }
      );
    },
    deleteDocument: () => {
      this.setState(
        {
          perspectiveCommand: { key: 'DELETE_SELECTED_ENTRIES' }
        },
        () => {
          this.setState({ perspectiveCommand: {} });
        }
      );
    },
    addRemoveTags: () => {
      this.setState(
        {
          perspectiveCommand: { key: 'ADD_REMOVE_TAGS' }
        },
        () => {
          this.setState({ perspectiveCommand: {} });
        }
      );
    },
    renameFile: () => {
      this.setState(
        {
          perspectiveCommand: { key: 'RENAME_ENTRY' }
        },
        () => {
          this.setState({ perspectiveCommand: {} });
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
    // console.log('renderPerspective: ', this.props);
    if (this.props.currentDirectoryPath && this.props.currentDirectoryPath.length >= 2) { // TODO handle location perspectives  === 'grid'
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
          removeTags={this.props.removeTags}
          removeAllTags={this.props.removeAllTags}
          windowWidth={this.props.windowWidth}
        />
      );
    } else if (this.state.currentPerspective === 'filemanager') {
      return <div>Place for another perspective</div>;
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
          addTags={this.props.addTags}
          removeTags={this.props.removeTags}
          removeAllTags={this.props.removeAllTags}
        />
      */
    }
    return (
      <WelcomePanel />
    );
  }

  render() {
    const {
      currentDirectoryPath = '',
      loadDirectoryContent,
      classes
    } = this.props;
    // console.log(this.props.windowHeight);
    return (
      <HotKeys handlers={this.keyBindingHandlers}>
        <div className={classes.mainPanel}>
          <div className={classes.topPanel}>
            <div className={classes.toolbar}>
              <LocationMenu />
              <div className={classes.flexMiddle} data-tid="entriesFound">
                { this.props.searchResultCount > 0 && (
                  <Typography style={{ whiteSpace: 'nowrap' }} className={classes.entriesFound}>
                    {this.props.searchResultCount} {i18n.t('entries')}
                  </Typography>
                ) }
              </div>
              {this.props.currentDirectoryPath && (
                <div style={{ whiteSpace: 'nowrap' }}>
                  { this.state.pathParts && this.state.pathParts.map((pathPart) => (
                    <span key={pathPart}>
                      <Button
                        onClick={() => loadDirectoryContent(pathPart)}
                        title={'Navigate to: ' + pathPart}
                        style={{ paddingLeft: 0, paddingRight: 0 }}
                      >
                        {extractShortDirectoryName(pathPart, '/')}
                        <FolderSeparatorIcon />
                      </Button>
                    </span>
                  ))}
                  <Button
                    data-tid="folderContainerOpenDirMenu"
                    title={i18n.t('core:openDirectoryMenu') + ' - ' + (currentDirectoryPath || '')}
                    className={classes.folderButton}
                    onClick={this.openDirectoryMenu}
                  >
                    { extractShortDirectoryName(normalizePath(currentDirectoryPath)) }
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
    isReadOnlyMode: isReadOnlyMode(state),
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
      sortByCriteria: AppActions.sortByCriteria,
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
