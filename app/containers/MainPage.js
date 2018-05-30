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

import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from 'material-ui/styles';
import classNames from 'classnames';
import { translate } from 'react-i18next';
import SplitPane from 'react-split-pane';
import Drawer from 'material-ui/Drawer';
import Snackbar from 'material-ui/Snackbar';
import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import CloseIcon from 'material-ui-icons/Close';
import { HotKeys } from 'react-hotkeys';
import HTML5Backend, { NativeTypes } from 'react-dnd-html5-backend';
import { LinearProgress } from 'material-ui/Progress';
import { DragDropContext } from 'react-dnd';
import VerticalNavigation, {
  AppVerticalPanels
} from '../components/VerticalNavigation';
import FolderContainer from '../components/FolderContainer';
import EntryContainer from '../components/EntryContainer';
import {
  getDesktopMode,
  getKeyBindingObject,
  getLeftVerticalSplitSize,
  getMainVerticalSplitSize,
  getLastPublishedVersion,
  actions as SettingsActions
} from '../reducers/settings';
import {
  actions as AppActions,
  getNotificationStatus,
  isFileOpened,
  isFileDragged,
  isEntryInFullWidth,
  isUpdateAvailable,
  isIndexing
} from '../reducers/app';
import { buffer } from '../utils/misc';
import TargetFileBox from '../components/TargetFileBox';
import PlatformIO from '../services/platform-io';
import AppConfig from '../config';
// import i18n from '../services/i18n';
import buildDesktopMenu from '../services/electron-menus';
import buildTrayIconMenu from '../services/electron-tray-menu';

const initialSplitSize = 44;
const drawerWidth = 300;
const body = document.getElementsByTagName('body')[0];
const showOneColumnThreshold = 600;
const bufferedMainSplitResize = buffer({ timeout: 50, id: 'buffered-mainsplit-resize' });
const bufferedLeftSplitResize = buffer({ timeout: 300, id: 'buffered-leftsplit-resize' });

const styles = theme => ({
  content: {
    width: '100%',
    marginLeft: drawerWidth,
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    [theme.breakpoints.up('sm')]: {
      content: {
        height: 'calc(100% - 64px)',
        marginTop: 64
      }
    }
  },
  contentShift: {
    marginLeft: 0,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  drawerPaper: {
    height: '100%',
    width: drawerWidth
  },
  dropTarget: {
    margin: 5,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(198, 198, 198, 0.67);',
    zIndex: 100,
    border: '4px dashed white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }
});

type Props = {
  isDesktopMode: boolean,
  isFileOpened: boolean,
  isFileDragged: boolean,
  isIndexing: boolean,
  isEntryInFullWidth: boolean,
  classes: Object,
  notificationStatus: Object,
  lastPublishedVersion: string,
  isUpdateAvailable: boolean,
  hideNotifications: () => void,
  cancelDirectoryIndexing: () => void,
  setUpdateAvailable: (isUpdateAvailable: boolean) => void,
  setFileDragged: (isFileDragged: boolean) => void,
  saveFile: () => void, // needed by electron-menus
  setZoomResetApp: () => void, // needed by electron-menus
  setZoomInApp: () => void, // needed by electron-menus
  setZoomOutApp: () => void, // needed by electron-menus
  toggleCreateFileDialog: () => void, // needed by electron-menus
  showCreateDirectoryDialog: () => void, // needed by electron-menus
  toggleSettingsDialog: () => void, // needed by electron-menus
  toggleKeysDialog: () => void, // needed by electron-menus
  toggleLicenseDialog: () => void, // needed by electron-menus
  toggleThirdPartyLibsDialog: () => void, // neede by electron-menus
  toggleAboutDialog: () => void, // needed by electron-menus
  openFileNatively: () => void, // needed by electron-menus
  getNextFile: () => void, // needed by electron-menus
  getPrevFile: () => void, // needed by electron-menus
  leftSplitSize: number,
  mainSplitSize: any,
  setLeftVerticalSplitSize: (splitSize: number) => void,
  setMainVerticalSplitSize: (splitSize: string) => void
};

type State = {
  isManagementPanelVisible?: boolean, // optionality because of https://github.com/codemix/flow-runtime/issues/149
  mainSplitSize?: any,
  isDrawerOpened?: boolean,
  shouldTogglePanel?: string,
  width?: number,
  height?: number
};

class MainPage extends Component<Props, State> {
  state = {
    isManagementPanelVisible: true,
    mainSplitSize: '100%',
    isDrawerOpened: true,
    shouldTogglePanel: AppVerticalPanels.locationManager,
    width: 1000,
    height: 1000
  };

  componentWillMount() {
    this.updateDimensions();
  }

  componentDidMount = () => {
    window.addEventListener('resize', this.updateDimensions);
    // this.setupDesktopMenu();
    buildDesktopMenu({
      ...this.props,
      toggleTagLibrary: this.toggleTagLibrary,
      toggleLocationManager: this.toggleLocationManager,
      toggleSearch: this.toggleSearch,
    });
    buildTrayIconMenu(this.props);
  };

  componentWillReceiveProps(nextProps: Props) {
    const isEntryOpenedChanged = nextProps.isFileOpened !== this.props.isFileOpened;
    const isEntryOpenedFullWidthChanged = nextProps.isEntryInFullWidth !== this.props.isEntryInFullWidth;
    if (nextProps.isFileOpened && isEntryOpenedFullWidthChanged) {
      this.setState({
        mainSplitSize: nextProps.isEntryInFullWidth ? '0%' : this.props.mainSplitSize,
        isManagementPanelVisible: !nextProps.isEntryInFullWidth
      });
    } else if (nextProps.isFileOpened && isEntryOpenedChanged) {
      /* if (this.state.width && this.state.width > showOneColumnThreshold) {
        this.props.setMainVerticalSplitSize('50%');
      } else {
        this.props.setMainVerticalSplitSize('0%');
      } */
      this.setState({
        mainSplitSize: this.props.mainSplitSize,
      });
    }

    if (!nextProps.isFileOpened && isEntryOpenedChanged) {
      this.setState({
        mainSplitSize: '100%'
      });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions);
  }

  toggleLocationManager = () => {
    this.setState({ shouldTogglePanel: AppVerticalPanels.locationManager });
  };

  toggleTagLibrary = () => {
    this.setState({ shouldTogglePanel: AppVerticalPanels.tagLibrary });
  };

  toggleSearch = () => {
    this.setState({ shouldTogglePanel: AppVerticalPanels.search });
  };

  updateDimensions = () => {
    const width =
      window.innerWidth ||
      document.documentElement.clientWidth ||
      body.clientWidth;
    const height =
      window.innerHeight ||
      document.documentElement.clientHeight ||
      body.clientHeight;

    // console.log('Width: ' + width + ' Height: ' + height);
    this.setState({ width, height });

    // Hide folder container on windows resize or on mobile
    // Disable due a bug with the full width functionality
    /* if (this.props.isFileOpened) {
      if (width > showOneColumnThreshold) {
        // TODO hide management panel
        this.setState({
          mainSplitSize: this.props.mainSplitSize
        });
      } else {
        this.setState({
          mainSplitSize: '0%'
        });
      }
    } */
  };

  setManagementPanelVisibility = isVisible => {
    this.setState({
      isManagementPanelVisible: isVisible
    });
  };

  toggleDrawer = () => {
    this.setState({ isDrawerOpened: !this.state.isDrawerOpened });
  };

  skipRelease = () => {
    this.props.setUpdateAvailable(false);
  }

  openDownloadPage = () => {
    this.props.setUpdateAvailable(false);
    PlatformIO.openFile(AppConfig.downloadURL);
  }

  openChangelogPage = () => {
    PlatformIO.openFile(AppConfig.changelogURL);
  }

  handleFileDrop = (item, monitor) => {
    if (monitor) {
      const droppedFiles = monitor.getItem().files;
      console.log('Dropped files: ' + droppedFiles);
      this.props.setFileDragged(false);
      // this.setState({ droppedFiles });
    }
  };

  keyBindingHandlers = {
    showFolderNavigator: this.toggleLocationManager,
    showTagLibrary: this.toggleTagLibrary,
    openSearch: this.toggleSearch,
    showHelp: () => {
      PlatformIO.openFile('https://docs.tagspaces.org');
    },
  };

  render() {
    const { classes } = this.props;
    const { FILE } = NativeTypes;

    /* if (this.state.width < 400) {
      this.setManagementPanelVisibility(false);
    } */
    return (
      <HotKeys handlers={this.keyBindingHandlers}>
        {this.props.isFileDragged && (
          <div className={classes.dropTarget}>
            <TargetFileBox accepts={[FILE]} onDrop={this.handleFileDrop} />
          </div>
        )}
        {this.props.isDesktopMode ? (
          <SplitPane
            split="vertical"
            minSize={200}
            maxSize={450}
            resizerStyle={{ backgroundColor: 'gray' }}
            defaultSize={this.props.leftSplitSize}
            size={
              this.state.isManagementPanelVisible
                ? this.props.leftSplitSize
                : initialSplitSize
            }
            onChange={size => {
              this.setState({
                isManagementPanelVisible: size > initialSplitSize,
              });
              bufferedLeftSplitResize(() => this.props.setLeftVerticalSplitSize(size));
            }}
          >
            <VerticalNavigation
              setManagementPanelVisibility={this.setManagementPanelVisibility}
              shouldTogglePanel={this.state.shouldTogglePanel}
            />
            <SplitPane
              split="vertical"
              minSize="200"
              size={this.state.mainSplitSize}
              onChange={size => {
                if (size > 0 && this.state.width) {
                  const sizeInPercent = parseInt(((size * 100) / this.state.width), 10) + '%';
                  this.setState({
                    mainSplitSize: sizeInPercent
                  });
                  // bufferedMainSplitResize(() => this.props.setMainVerticalSplitSize(sizeInPercent));
                  this.props.setMainVerticalSplitSize(sizeInPercent);
                }
              }}
            >
              <FolderContainer
                isDesktopMode={this.props.isDesktopMode}
                windowHeight={this.state.height}
                windowWidth={this.state.width}
              />
              <EntryContainer />
            </SplitPane>
          </SplitPane>
        ) : (
          <div>
            <Drawer
              open={this.state.isDrawerOpened}
              type="persistent"
              classes={{
                paper: classes.drawerPaper
              }}
            >
              <VerticalNavigation
                setManagementPanelVisibility={this.setManagementPanelVisibility}
                shouldTogglePanel={this.state.shouldTogglePanel}
              />
            </Drawer>
            <SplitPane
              className={classNames(
                classes.content,
                this.state.isDrawerOpened && classes.contentShift
              )}
              split="vertical"
              minSize={150}
              defaultSize={this.state.isViewerPanelVisible ? '50%' : '100%'}
            >
              <FolderContainer
                isDesktopMode={this.props.isDesktopMode}
                toggleDrawer={this.toggleDrawer}
                windowHeight={this.state.height}
              />
              {this.props.isFileOpened && (
                <div style={{ backgroundColor: 'lightgray', height: '100%' }}>
                  FileViewer/Editor
                </div>
              )}
            </SplitPane>
          </div>
        )}
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          open={this.props.notificationStatus.visible}
          onClose={this.props.hideNotifications}
          autoHideDuration={this.props.notificationStatus.autohide ? 3000 : undefined}
          SnackbarContentProps={{
            'aria-describedby': 'message-id'
          }}
          message={
            <span id="message-id">{this.props.notificationStatus.text}</span>
          }
          action={[
            <IconButton
              key="close"
              aria-label="Close"
              color="inherit"
              onClick={this.props.hideNotifications}
            >
              <CloseIcon />
            </IconButton>,
          ]}
        />
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          open={this.props.isIndexing}
          autoHideDuration={undefined}
          SnackbarContentProps={{
            'aria-describedby': 'message-id'
          }}
          message={
            <div style={{ width: '100%' }}>
              <LinearProgress />
              <span id="message-id">Indexing</span>
            </div>
          }
          action={[
            <Button
              color="secondary"
              size="small"
              onClick={this.props.cancelDirectoryIndexing}
            >
              Cancel indexing
            </Button>
          ]}
        />
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          open={this.props.isUpdateAvailable}
          autoHideDuration={undefined}
          SnackbarContentProps={{
            'aria-describedby': 'message-id'
          }}
          message={
            <span id="message-id">Version {this.props.lastPublishedVersion} available.</span>
          }
          action={[
            <Button
              color="secondary"
              size="small"
              onClick={this.skipRelease}
            >
              Later
            </Button>,
            <Button
              color="secondary"
              size="small"
              onClick={this.openChangelogPage}
            >
              Release Notes
            </Button>,
            <Button
              color="primary"
              size="small"
              onClick={this.openDownloadPage}
            >
              Get Now
            </Button>,
          ]}
        />
      </HotKeys>
    );
  }
}

function mapStateToProps(state) {
  return {
    isIndexing: isIndexing(state),
    isFileOpened: isFileOpened(state),
    isFileDragged: isFileDragged(state),
    isEntryInFullWidth: isEntryInFullWidth(state),
    isDesktopMode: getDesktopMode(state),
    keyBindings: getKeyBindingObject(state),
    leftSplitSize: getLeftVerticalSplitSize(state),
    mainSplitSize: getMainVerticalSplitSize(state),
    isUpdateAvailable: isUpdateAvailable(state),
    lastPublishedVersion: getLastPublishedVersion(state),
    notificationStatus: getNotificationStatus(state)
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    setFileDragged: AppActions.setFileDragged,
    hideNotifications: AppActions.hideNotifications,
    cancelDirectoryIndexing: AppActions.cancelDirectoryIndexing,
    saveFile: AppActions.saveFile,
    setZoomResetApp: SettingsActions.setZoomResetApp,
    setZoomInApp: SettingsActions.setZoomInApp,
    setZoomOutApp: SettingsActions.setZoomOutApp,
    toggleCreateFileDialog: AppActions.toggleCreateFileDialog,
    showCreateDirectoryDialog: AppActions.showCreateDirectoryDialog,
    toggleSettingsDialog: AppActions.toggleSettingsDialog,
    toggleKeysDialog: AppActions.toggleKeysDialog,
    toggleLicenseDialog: AppActions.toggleLicenseDialog,
    toggleThirdPartyLibsDialog: AppActions.toggleThirdPartyLibsDialog,
    toggleAboutDialog: AppActions.toggleAboutDialog,
    openFileNatively: AppActions.openFileNatively,
    setUpdateAvailable: AppActions.setUpdateAvailable,
    getNextFile: AppActions.getNextFile,
    getPrevFile: AppActions.getPrevFile,
    setLeftVerticalSplitSize: SettingsActions.setLeftVerticalSplitSize,
    setMainVerticalSplitSize: SettingsActions.setMainVerticalSplitSize
  }, dispatch);
}

export default DragDropContext(HTML5Backend)(
  connect(mapStateToProps, mapDispatchToProps)(
    translate(['core'], { wait: true })(withStyles(styles)(MainPage))
  )
);
