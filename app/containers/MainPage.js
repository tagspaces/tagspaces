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
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import { translate } from 'react-i18next';
import SplitPane from 'react-split-pane';
import Drawer from '@material-ui/core/Drawer';
import Snackbar from '@material-ui/core/Snackbar';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { HotKeys } from 'react-hotkeys';
import HTML5Backend, { NativeTypes } from 'react-dnd-html5-backend';
// import LinearProgress from '@material-ui/core/LinearProgress';
import { DragDropContext } from 'react-dnd';
import VerticalNavigation, {
  AppVerticalPanels
} from '../components/VerticalNavigation';
import OnboardingDialog from '../components/dialogs/OnboardingDialog';
import FolderContainer from '../components/FolderContainer';
import EntryContainer from '../components/EntryContainer';
import {
  isFirstRun,
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
  isGeneratingThumbs,
  isFileOpened,
  // isFileDragged,
  isEntryInFullWidth,
  isUpdateAvailable,
  getDirectoryPath
} from '../reducers/app';
import { actions as LocationIndexActions, isIndexing } from '../reducers/location-index';
import { buffer } from '../utils/misc';
import { normalizePath } from '../utils/paths';
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
  }
});

type Props = {
  isDesktopMode: boolean,
  isFileOpened: boolean,
  // isFileDragged: boolean,
  isIndexing: boolean,
  isGeneratingThumbs: boolean,
  isEntryInFullWidth: boolean,
  classes: Object,
  notificationStatus: Object,
  lastPublishedVersion: string,
  isUpdateAvailable: boolean,
  isFirstRun: boolean,
  setFirstRun: (isFirstRun: boolean) => void,
  hideNotifications: () => void,
  cancelDirectoryIndexing: () => void,
  setUpdateAvailable: (isUpdateAvailable: boolean) => void,
  // setFileDragged: (isFileDragged: boolean) => void,
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
  setLastSelectedEntry: (path: string) => void, // needed by electron-menus
  openFile: (path: string) => void, // needed by electron-menus
  openFileNatively: () => void, // needed by electron-menus
  getNextFile: () => void, // needed by electron-menus
  getPrevFile: () => void, // needed by electron-menus
  leftSplitSize: number,
  mainSplitSize: any,
  toggleShowUnixHiddenEntries: () => void,
  setLeftVerticalSplitSize: (splitSize: number) => void,
  setMainVerticalSplitSize: (splitSize: string) => void,
  directoryPath?: string,
  showNotification?: (
    text: string,
    notificationType: string,
    autohide: boolean
  ) => void,
  reflectCreateEntry?: (path: string, isFile: boolean) => void
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
      toggleOnboarding: this.toggleOnboarding,
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

  toggleOnboarding = () => {
    this.props.setFirstRun(!this.props.isFirstRun);
  }

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
      const { files } = monitor.getItem();
      console.log('Dropped files: ' + JSON.stringify(files));
      if (!this.props.directoryPath) {
        this.props.showNotification(
          'Importing files failed. Please select Directory first!',
          'error',
          true
        );
      } else {
        files.map(file => { // TODO move this in reducer -> look at DirectoryMenu handleFileInputChange
          let filePath;
          let fileName = '';
          try {
            fileName = decodeURIComponent(file.name);
            filePath = normalizePath(this.props.directoryPath) + AppConfig.dirSeparator + fileName;
          } catch (err) {
            console.warn('Error decoding filename: ' + file.name + ' , skipping this file.');
          }
          if (!filePath) {
            return true;
          }

          const reader = new FileReader();
          reader.onload = event => {
          // console.log('Content on file read complete: ' + JSON.stringify(event));
          // change name for ios fakepath
          // if (AppConfig.isCordovaiOS) {
          //   const fileExt = extractFileExtension(addFileInputName);
          //   addFileInputName = AppConfig.beginTagContainer + formatDateTime4Tag(new Date(), true) + AppConfig.endTagContainer + fileExt;
          // }
          // TODO event.currentTarget.result is ArrayBuffer
          // Sample call from PRO version using content = Utils.base64ToArrayBuffer(baseString);
            PlatformIO.saveBinaryFilePromise(
              filePath,
              event.currentTarget.result,
              true
            )
              .then(() => {
                this.props.showNotification(
                  'File ' + fileName + '  imported as ' + filePath,
                  'default',
                  true
                );
                this.props.reflectCreateEntry(filePath, true);
                // this.props.openFile(filePath);
                return true;
              })
              .catch(() => {
                this.props.showNotification(
                  'Importing file ' + fileName + ' failed.',
                  'error',
                  true
                );
                return true;
              });
          };

          if (AppConfig.isCordova) {
            reader.readAsDataURL(file);
          } else {
            reader.readAsArrayBuffer(file);
          }
          return file;
        });
      }
    }
  };

  keyBindingHandlers = {
    toggleShowHiddenEntries: this.props.toggleShowUnixHiddenEntries,
    showFolderNavigator: this.toggleLocationManager,
    showTagLibrary: this.toggleTagLibrary,
    openSearch: this.toggleSearch,
    showHelp: () => {
      PlatformIO.openFile('https://docs.tagspaces.org');
    },
  };

  render() {
    const { classes, theme } = this.props;
    const { FILE } = NativeTypes;

    /* if (this.state.width < 400) {
      this.setManagementPanelVisibility(false);
    } */
    return (
      <HotKeys handlers={this.keyBindingHandlers}>
        <TargetFileBox accepts={[FILE]} onDrop={this.handleFileDrop}>
          {/* {this.props.isFileDragged && (
          <div className={classes.dropTarget}>
            <TargetFileBox accepts={[FILE]} onDrop={this.handleFileDrop} />
          </div>
        )} */}
          {this.props.isDesktopMode ? (
            <SplitPane
              split="vertical"
              minSize={200}
              maxSize={450}
              resizerStyle={{ backgroundColor: theme.palette.divider }}
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
                resizerStyle={{ backgroundColor: theme.palette.divider }}
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
                resizerStyle={{ backgroundColor: theme.palette.divider }}
                defaultSize={this.state.isViewerPanelVisible ? '50%' : '100%'}
              >
                <FolderContainer
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
            message={this.props.notificationStatus.text}
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
            open={this.props.isGeneratingThumbs}
            autoHideDuration={undefined}
            message={'Loading or generating thumbnails...'}
            action={[
              // <Button
              //   color="secondary"
              //   size="small"
              //   onClick={this.props.cancelDirectoryIndexing}
              // >
              // Cancel indexing
              // </Button>
            ]}
          />
          <Snackbar
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            open={this.props.isIndexing}
            autoHideDuration={undefined}
            message={'Indexing'}
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
            message={'Version ' + this.props.lastPublishedVersion + ' available.'}
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
          <OnboardingDialog
            open={this.props.isFirstRun}
            onClose={this.toggleOnboarding}
          />
        </TargetFileBox>
      </HotKeys>
    );
  }
}

function mapStateToProps(state) {
  return {
    isIndexing: isIndexing(state),
    isFirstRun: isFirstRun(state),
    isGeneratingThumbs: isGeneratingThumbs(state),
    isFileOpened: isFileOpened(state),
    // isFileDragged: isFileDragged(state),
    isEntryInFullWidth: isEntryInFullWidth(state),
    isDesktopMode: getDesktopMode(state),
    keyBindings: getKeyBindingObject(state),
    leftSplitSize: getLeftVerticalSplitSize(state),
    mainSplitSize: getMainVerticalSplitSize(state),
    isUpdateAvailable: isUpdateAvailable(state),
    lastPublishedVersion: getLastPublishedVersion(state),
    notificationStatus: getNotificationStatus(state),
    directoryPath: getDirectoryPath(state),
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    // setFileDragged: AppActions.setFileDragged,
    hideNotifications: AppActions.hideNotifications,
    cancelDirectoryIndexing: LocationIndexActions.cancelDirectoryIndexing,
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
    setLastSelectedEntry: AppActions.setLastSelectedEntry,
    openFile: AppActions.openFile,
    openFileNatively: AppActions.openFileNatively,
    setUpdateAvailable: AppActions.setUpdateAvailable,
    getNextFile: AppActions.getNextFile,
    getPrevFile: AppActions.getPrevFile,
    toggleShowUnixHiddenEntries: SettingsActions.toggleShowUnixHiddenEntries,
    setLeftVerticalSplitSize: SettingsActions.setLeftVerticalSplitSize,
    setMainVerticalSplitSize: SettingsActions.setMainVerticalSplitSize,
    showNotification: AppActions.showNotification,
    reflectCreateEntry: AppActions.reflectCreateEntry,
    setFirstRun: SettingsActions.setFirstRun,
  }, dispatch);
}

export default DragDropContext(HTML5Backend)(
  connect(mapStateToProps, mapDispatchToProps)(
    translate(['core'], { wait: true })(withStyles(styles, { withTheme: true })(MainPage))
  )
);
