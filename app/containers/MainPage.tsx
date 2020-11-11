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

import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { translate } from 'react-i18next';
import SplitPane from 'react-split-pane';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import Snackbar from '@material-ui/core/Snackbar';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { HotKeys } from 'react-hotkeys';
import { NativeTypes } from 'react-dnd-html5-backend';
import { Progress } from 'aws-sdk/clients/s3';
import VerticalNavigation from '../components/VerticalNavigation';
import MobileNavigation from '../components/MobileNavigation';
import FolderContainer from '../components/FolderContainer';
import EntryContainer from '../components/EntryContainer';
import SettingsDialog from '../components/dialogs/settings/SettingsDialog';
import CreateDirectoryDialog from '../components/dialogs/CreateDirectoryDialog';
import CreateFileDialog from '../components/dialogs/CreateDialog';
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
  isGeneratingThumbs,
  isAboutDialogOpened,
  isOnboardingDialogOpened,
  isKeysDialogOpened,
  isLicenseDialogOpened,
  isThirdPartyLibsDialogOpened,
  isEntryInFullWidth,
  isUpdateAvailable,
  getDirectoryPath,
  isLocationManagerPanelOpened,
  isTagLibraryPanelOpened,
  isSearchPanelOpened,
  isPerspectivesPanelOpened,
  isHelpFeedbackPanelOpened,
  isEditTagDialogOpened,
  isCreateDirectoryOpened,
  isSelectDirectoryDialogOpened,
  isUploadDialogOpened,
  isCreateFileDialogOpened,
  isSettingsDialogOpened,
  isReadOnlyMode,
  isProgressOpened,
  getOpenedFiles,
  OpenedEntry
} from '../reducers/app';
import {
  actions as LocationIndexActions,
  isIndexing
} from '../reducers/location-index';
import { buffer } from '-/utils/misc';
import TargetFileBox from '../components/TargetFileBox';
import AppConfig from '../config';
import buildDesktopMenu from '../services/electron-menus';
import buildTrayIconMenu from '../services/electron-tray-menu';
import i18n from '../services/i18n';
import { Pro } from '../pro';
import LoadingLazy from '../components/LoadingLazy';
import withDnDContext from '-/containers/withDnDContext';
import { CustomDragLayer } from '-/components/CustomDragLayer';
import IOActions from '-/reducers/io-actions';
import FileUploadDialog from '-/components/dialogs/FileUploadDialog';
import ProgressDialog from '-/components/dialogs/ProgressDialog';
import { FileSystemEntry } from '-/services/utils-io';

const initialSplitSize = 44;
const drawerWidth = 300;
const body = document.getElementsByTagName('body')[0];
// const showOneColumnThreshold = 600;
// const bufferedMainSplitResize = buffer({ timeout: 50, id: 'buffered-mainsplit-resize' });
const bufferedLeftSplitResize = buffer({
  timeout: 300,
  id: 'buffered-leftsplit-resize'
});

const styles: any = (theme: any) => ({
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

interface Props {
  isFirstRun: boolean;
  setFirstRun: (isFirstRun: boolean) => void;
  isDesktopMode: boolean;
  openedFiles: Array<OpenedEntry>;
  isIndexing: boolean;
  isGeneratingThumbs: boolean;
  setGeneratingThumbnails: (isGenerating: boolean) => void;
  isEntryInFullWidth: boolean;
  classes: any;
  theme: any;
  notificationStatus: any;
  lastPublishedVersion: string;
  isUpdateAvailable: boolean;
  isReadOnlyMode: boolean;
  isSettingsDialogOpened: boolean;
  isCreateFileDialogOpened: boolean;
  isCreateDirectoryOpened: boolean;
  toggleCreateDirectoryDialog: () => void;
  isAboutDialogOpened: boolean;
  isKeysDialogOpened: boolean;
  isLicenseDialogOpened: boolean;
  isThirdPartyLibsDialogOpened: boolean;
  isOnboardingDialogOpened: boolean;
  isSelectDirectoryDialogOpened: boolean;
  isUploadProgressDialogOpened: boolean;
  isProgressDialogOpened: boolean;
  toggleSelectDirectoryDialog: () => void;
  toggleUploadDialog: () => void;
  toggleProgressDialog: () => void;
  resetProgress: () => void;
  isEditTagDialogOpened: boolean;
  keyBindings: any;
  toggleEditTagDialog: () => void;
  setEntryFullWidth: (isFullWidth: boolean) => void;
  hideNotifications: () => void;
  cancelDirectoryIndexing: () => void;
  loadParentDirectoryContent: () => void;
  setUpdateAvailable: (isUpdateAvailable: boolean) => void;
  saveFile: () => void; // needed by electron-menus
  setZoomResetApp: () => void; // needed by electron-menus
  setZoomInApp: () => void; // needed by electron-menus
  setZoomOutApp: () => void; // needed by electron-menus
  toggleCreateFileDialog: () => void; // needed by electron-menus
  showCreateDirectoryDialog: () => void; // needed by electron-menus
  toggleSettingsDialog: () => void; // needed by electron-menus
  toggleKeysDialog: () => void; // needed by electron-menus
  toggleLicenseDialog: () => void; // needed by electron-menus
  toggleThirdPartyLibsDialog: () => void; // neede by electron-menus
  toggleAboutDialog: () => void; // needed by electron-menus
  toggleOnboardingDialog: () => void; // needed by electron-menus
  setLastSelectedEntry: (path: string) => void; // needed by electron-menus
  setSelectedEntries: (path: string) => void; // needed by electron-menus
  openFsEntry: (fsEntry: FileSystemEntry) => void; // needed by electron-menus
  openFileNatively: (url: string) => void; // needed by electron-menus
  openURLExternally: (url: string) => void;
  openNextFile: (path?: string) => void; // needed by electron-menus
  openPrevFile: (path?: string) => void; // needed by electron-menus
  openLocationManagerPanel: () => void;
  openTagLibraryPanel: () => void;
  openSearchPanel: () => void;
  openPerspectivesPanel: () => void;
  openHelpFeedbackPanel: () => void;
  closeAllVerticalPanels: () => void;
  leftSplitSize: number;
  mainSplitSize: any;
  toggleShowUnixHiddenEntries: () => void;
  setLeftVerticalSplitSize: (splitSize: number) => void;
  setMainVerticalSplitSize: (splitSize: string) => void;
  isLocationManagerPanelOpened: boolean;
  isTagLibraryPanelOpened: boolean;
  isSearchPanelOpened: boolean;
  isPerspectivesPanelOpened: boolean;
  isHelpFeedbackPanelOpened: boolean;
  directoryPath: string;
  showNotification: (
    text: string,
    notificationType?: string,
    autohide?: boolean
  ) => void;
  reflectCreateEntries: (fsEntries: Array<FileSystemEntry>) => void;
  uploadFilesAPI: (
    files: Array<File>,
    destination: string,
    onUploadProgress?: (progress: Progress, response: any) => void
  ) => any;
  onUploadProgress: (progress: Progress, response: any) => void;
}

const AboutDialog = React.lazy(() =>
  import(
    /* webpackChunkName: "AboutDialog" */ '../components/dialogs/AboutDialog'
  )
);
const AboutDialogAsync = props => (
  <React.Suspense fallback={<LoadingLazy />}>
    <AboutDialog {...props} />
  </React.Suspense>
);

const LicenseDialog = React.lazy(() =>
  import(
    /* webpackChunkName: "LicenseDialog" */ '../components/dialogs/LicenseDialog'
  )
);
const LicenseDialogAsync = props => (
  <React.Suspense fallback={<LoadingLazy />}>
    <LicenseDialog {...props} />
  </React.Suspense>
);

const KeyboardDialog = React.lazy(() =>
  import(
    /* webpackChunkName: "KeyboardDialog" */ '../components/dialogs/KeyboardDialog'
  )
);
const KeyboardDialogAsync = props => (
  <React.Suspense fallback={<LoadingLazy />}>
    <KeyboardDialog {...props} />
  </React.Suspense>
);

const ThirdPartyLibsDialog = React.lazy(() =>
  import(
    /* webpackChunkName: "ThirdPartyLibsDialog" */ '../components/dialogs/ThirdPartyLibsDialog'
  )
);
const ThirdPartyLibsDialogAsync = props => (
  <React.Suspense fallback={<LoadingLazy />}>
    <ThirdPartyLibsDialog {...props} />
  </React.Suspense>
);

const OnboardingDialog = React.lazy(() =>
  import(
    /* webpackChunkName: "OnboardingDialog" */ '../components/dialogs/OnboardingDialog'
  )
);
const OnboardingDialogAsync = props => (
  <React.Suspense fallback={<LoadingLazy />}>
    <OnboardingDialog {...props} />
  </React.Suspense>
);

const EditEntryTagDialog = React.lazy(() =>
  import(
    /* webpackChunkName: "EditEntryTagDialog" */ '../components/dialogs/EditEntryTagDialog'
  )
);
const EditEntryTagDialogAsync = props => (
  <React.Suspense fallback={<LoadingLazy />}>
    <EditEntryTagDialog {...props} />
  </React.Suspense>
);

const SelectDirectoryDialog = React.lazy(() =>
  import(
    /* webpackChunkName: "LicenseDialog" */ '../components/dialogs/SelectDirectoryDialog'
  )
);
const SelectDirectoryAsync = props => (
  <React.Suspense fallback={<LoadingLazy />}>
    <SelectDirectoryDialog {...props} />
  </React.Suspense>
);

interface State {
  selectedDirectoryPath: string;
  isManagementPanelVisible: boolean;
  mainSplitSize: any;
  isDrawerOpened: boolean;
  width: number;
  height: number;
}

let showVerticalPanel = true;
if (window.ExtDefaultVerticalPanel === 'none') {
  showVerticalPanel = false;
}

class MainPage extends Component<Props, State> {
  state = {
    selectedDirectoryPath: '',
    isManagementPanelVisible: showVerticalPanel,
    mainSplitSize: '100%',
    isDrawerOpened: true,
    width: 1000,
    height: 1000
  };

  UNSAFE_componentWillMount() {
    if (!AppConfig.isCordova) {
      this.updateDimensions();
    }
  }

  componentDidMount = () => {
    if (!AppConfig.isCordova) {
      window.addEventListener('resize', this.updateDimensions);
    }
    // this.setupDesktopMenu();
    buildDesktopMenu(this.props);
    buildTrayIconMenu(this.props);
  };

  componentWillReceiveProps(nextProps: Props) {
    const isFileOpened = this.props.openedFiles.length > 0;
    const isFileOpenedNext = nextProps.openedFiles.length > 0;
    const isEntryOpenedChanged = isFileOpenedNext !== isFileOpened;
    const isEntryOpenedFullWidthChanged =
      nextProps.isEntryInFullWidth !== this.props.isEntryInFullWidth;
    const width =
      window.innerWidth ||
      document.documentElement.clientWidth ||
      body.clientWidth;
    const height =
      window.innerHeight ||
      document.documentElement.clientHeight ||
      body.clientHeight;
    if (isFileOpenedNext) {
      if (height > width) {
        this.setState({
          mainSplitSize: '0%'
          // isManagementPanelVisible: !nextProps.isEntryInFullWidth
        });
      } else if (isEntryOpenedFullWidthChanged) {
        if (nextProps.isEntryInFullWidth) {
          this.props.closeAllVerticalPanels();
        }
        this.setState({
          mainSplitSize: nextProps.isEntryInFullWidth
            ? '0%'
            : this.props.mainSplitSize,
          isManagementPanelVisible: !nextProps.isEntryInFullWidth
        });
      } else if (isEntryOpenedChanged) {
        this.setState({
          mainSplitSize: this.props.mainSplitSize
        });
      }
    }
    if (!isFileOpenedNext && isEntryOpenedChanged) {
      this.setState({
        mainSplitSize: '100%'
      });
    }
    if (
      nextProps.isLocationManagerPanelOpened ||
      nextProps.isTagLibraryPanelOpened ||
      nextProps.isSearchPanelOpened ||
      nextProps.isPerspectivesPanelOpened ||
      nextProps.isHelpFeedbackPanelOpened
    ) {
      this.setManagementPanelVisibility(true);
      // if (!nextProps.isDesktopMode) {
      //   this.showDrawer();
      // }
    }

    if (
      !nextProps.isLocationManagerPanelOpened &&
      !nextProps.isTagLibraryPanelOpened &&
      !nextProps.isSearchPanelOpened &&
      !nextProps.isPerspectivesPanelOpened &&
      !nextProps.isHelpFeedbackPanelOpened
    ) {
      this.setManagementPanelVisibility(false);
    }
  }

  componentWillUnmount() {
    if (!AppConfig.isCordova) {
      window.removeEventListener('resize', this.updateDimensions);
    }
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

    if (this.props.openedFiles.length > 0) {
      this.props.setEntryFullWidth(height > width);
    }

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

  hideDrawer = () => {
    this.setState({
      isDrawerOpened: false
    });
  };

  showDrawer = () => {
    if (
      !this.props.isLocationManagerPanelOpened &&
      !this.props.isSearchPanelOpened &&
      !this.props.isTagLibraryPanelOpened
    ) {
      this.props.openLocationManagerPanel();
    }
    this.setState({
      isDrawerOpened: true
    });
  };

  /* toggleDrawer = () => {
    this.setState({
      isDrawerOpened: !this.state.isDrawerOpened
    });
  }; */

  skipRelease = () => {
    this.props.setUpdateAvailable(false);
  };

  getLatestVersion = () => {
    if (Pro) {
      this.props.showNotification(
        i18n.t('core:getLatestVersionPro'),
        'default',
        false
      );
    } else {
      this.props.openFileNatively(AppConfig.links.downloadURL);
    }
    this.props.setUpdateAvailable(false);
  };

  openChangelogPage = () => {
    this.props.openFileNatively(AppConfig.links.changelogURL);
  };

  handleFileDrop = (item, monitor) => {
    if (this.props.isReadOnlyMode) {
      this.props.showNotification(
        i18n.t('core:dndDisabledReadOnlyMode'),
        'error',
        true
      );
      return;
    }
    if (monitor) {
      const { files } = monitor.getItem();
      console.log('Dropped files: ' + JSON.stringify(files));
      if (!this.props.directoryPath) {
        this.props.showNotification(
          'Importing files failed, because no folder is opened in TagSpaces!',
          'error',
          true
        );
      } else {
        this.props.resetProgress();
        this.props
          .uploadFilesAPI(
            files,
            this.props.directoryPath,
            this.props.onUploadProgress
          )
          .then(fsEntries => {
            this.props.reflectCreateEntries(fsEntries);
            return true;
          })
          .catch(error => {
            console.log('uploadFiles', error);
          });
        this.props.toggleUploadDialog();
      }
    }
  };

  chooseDirectoryPath = (currentPath: string) => {
    this.setState({
      selectedDirectoryPath: currentPath
    });
  };

  keyBindingHandlers = {
    openParentDirectory: this.props.loadParentDirectoryContent,
    toggleShowHiddenEntries: this.props.toggleShowUnixHiddenEntries,
    showFolderNavigator: this.props.openLocationManagerPanel,
    showTagLibrary: this.props.openTagLibraryPanel,
    openSearch: this.props.openSearchPanel,
    showHelp: this.props.openHelpFeedbackPanel
  };

  keyMap = {
    openParentDirectory: this.props.keyBindings.openParentDirectory,
    toggleShowHiddenEntries: this.props.keyBindings.toggleShowHiddenEntries,
    showFolderNavigator: this.props.keyBindings.showFolderNavigator,
    showTagLibrary: this.props.keyBindings.showTagLibrary,
    openSearch: this.props.keyBindings.openSearch,
    showHelp: this.props.keyBindings.showHelp
  };

  render() {
    const {
      theme,
      isCreateFileDialogOpened,
      isSettingsDialogOpened,
      isAboutDialogOpened,
      isKeysDialogOpened,
      isOnboardingDialogOpened,
      isLicenseDialogOpened,
      isThirdPartyLibsDialogOpened,
      isSelectDirectoryDialogOpened,
      isCreateDirectoryOpened,
      isEditTagDialogOpened,
      isUploadProgressDialogOpened,
      isProgressDialogOpened,
      toggleOnboardingDialog,
      toggleSettingsDialog,
      toggleKeysDialog,
      toggleLicenseDialog,
      toggleThirdPartyLibsDialog,
      toggleAboutDialog,
      toggleCreateDirectoryDialog,
      toggleCreateFileDialog,
      toggleSelectDirectoryDialog,
      toggleUploadDialog,
      toggleProgressDialog,
      toggleEditTagDialog,
      setFirstRun,
      openURLExternally,
      directoryPath
    } = this.props;
    const { FILE } = NativeTypes;

    /* if (this.state.width < 400) {
      this.setManagementPanelVisibility(false);
    } */
    return (
      <HotKeys handlers={this.keyBindingHandlers} keyMap={this.keyMap}>
        {isAboutDialogOpened && (
          <AboutDialogAsync
            open={isAboutDialogOpened}
            openURLExternally={openURLExternally}
            toggleLicenseDialog={toggleLicenseDialog}
            toggleThirdPartyLibsDialog={toggleThirdPartyLibsDialog}
            onClose={toggleAboutDialog}
          />
        )}
        {isKeysDialogOpened && (
          <KeyboardDialogAsync
            open={isKeysDialogOpened}
            onClose={toggleKeysDialog}
          />
        )}
        {isLicenseDialogOpened && (
          <LicenseDialogAsync
            open={isLicenseDialogOpened}
            onClose={() => {
              setFirstRun(false);
              toggleLicenseDialog();
            }}
          />
        )}
        {isOnboardingDialogOpened && (
          <OnboardingDialogAsync
            open={isOnboardingDialogOpened}
            onClose={toggleOnboardingDialog}
          />
        )}
        {isThirdPartyLibsDialogOpened && (
          <ThirdPartyLibsDialogAsync
            open={isThirdPartyLibsDialogOpened}
            onClose={toggleThirdPartyLibsDialog}
          />
        )}
        {isEditTagDialogOpened && (
          <EditEntryTagDialogAsync
            open={isEditTagDialogOpened}
            onClose={toggleEditTagDialog}
          />
        )}
        {isSelectDirectoryDialogOpened && (
          <SelectDirectoryAsync
            open={isSelectDirectoryDialogOpened}
            onClose={toggleSelectDirectoryDialog}
            chooseDirectoryPath={this.chooseDirectoryPath}
            selectedDirectoryPath={
              this.state.selectedDirectoryPath || directoryPath
            }
          />
        )}
        {isUploadProgressDialogOpened && (
          <FileUploadDialog
            open={isUploadProgressDialogOpened}
            onClose={toggleUploadDialog}
          />
        )}
        {isProgressDialogOpened && (
          <ProgressDialog
            open={isProgressDialogOpened}
            onClose={toggleProgressDialog}
          />
        )}
        {isCreateDirectoryOpened && (
          <CreateDirectoryDialog
            open={isCreateDirectoryOpened}
            onClose={toggleCreateDirectoryDialog}
            selectedDirectoryPath={directoryPath}
          />
        )}
        <CreateFileDialog
          open={isCreateFileDialogOpened}
          selectedDirectoryPath={
            this.state.selectedDirectoryPath || directoryPath
          }
          chooseDirectoryPath={this.chooseDirectoryPath}
          onClose={toggleCreateFileDialog}
        />
        <SettingsDialog
          open={isSettingsDialogOpened}
          onClose={toggleSettingsDialog}
        />
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          open={this.props.notificationStatus.visible}
          onClose={this.props.hideNotifications}
          autoHideDuration={
            this.props.notificationStatus.autohide ? 3000 : undefined
          }
          message={this.props.notificationStatus.text}
          action={[
            <IconButton
              key="close"
              aria-label={i18n.t('core:closeButton')}
              color="inherit"
              onClick={this.props.hideNotifications}
            >
              <CloseIcon />
            </IconButton>
          ]}
        />
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          open={this.props.isGeneratingThumbs}
          autoHideDuration={undefined}
          message="Loading or generating thumbnails..."
          action={[
            <IconButton
              key="closeButton"
              aria-label={i18n.t('core:closeButton')}
              color="inherit"
              onClick={() => this.props.setGeneratingThumbnails(false)}
            >
              <CloseIcon />
            </IconButton>
          ]}
        />
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          open={this.props.isIndexing}
          autoHideDuration={undefined}
          message="Indexing"
          action={[
            <Button
              key="cancelIndexButton"
              color="secondary"
              size="small"
              onClick={this.props.cancelDirectoryIndexing}
              data-tid="cancelDirectoryIndexing"
            >
              {i18n.t('core:cancelIndexing')}
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
              key="laterButton"
              color="secondary"
              size="small"
              onClick={this.skipRelease}
            >
              {i18n.t('core:later')}
            </Button>,
            <Button
              key="changelogButton"
              color="secondary"
              size="small"
              onClick={this.openChangelogPage}
            >
              {i18n.t('core:releaseNotes')}
            </Button>,
            <Button
              key="latestVersionButton"
              color="primary"
              size="small"
              onClick={this.getLatestVersion}
            >
              {i18n.t('core:getItNow')}
            </Button>
          ]}
        />
        {this.props.isDesktopMode ? (
          <TargetFileBox
            // @ts-ignore
            accepts={[FILE]}
            onDrop={this.handleFileDrop}
          >
            <CustomDragLayer />
            <SplitPane
              split="vertical"
              style={{
                borderTop:
                  AppConfig.isElectron && !AppConfig.isMacLike
                    ? '1px solid lightgray'
                    : 'none'
              }}
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
                  isManagementPanelVisible: size > initialSplitSize
                });
                bufferedLeftSplitResize(() =>
                  this.props.setLeftVerticalSplitSize(size)
                );
              }}
            >
              <VerticalNavigation />
              <SplitPane
                split="vertical"
                minSize="200"
                resizerStyle={{ backgroundColor: theme.palette.divider }}
                size={this.state.mainSplitSize}
                onChange={size => {
                  if (size > 0 && this.state.width) {
                    const sizeInPercent =
                      // @ts-ignore
                      parseInt((size * 100) / this.state.width, 10) + '%';
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
                  openedFiles={this.props.openedFiles}
                  currentDirectoryPath={this.props.directoryPath}
                />
                {this.props.openedFiles.length > 0 && (
                  <EntryContainer
                    openedFiles={this.props.openedFiles}
                    currentDirectoryPath={this.props.directoryPath}
                  />
                )}
              </SplitPane>
            </SplitPane>
          </TargetFileBox>
        ) : (
          <React.Fragment>
            <SwipeableDrawer
              open={this.state.isDrawerOpened}
              onClose={this.hideDrawer}
              onOpen={this.showDrawer}
              hysteresis={0.1}
              disableBackdropTransition={!AppConfig.isIOS}
              disableDiscovery={AppConfig.isIOS}
            >
              <MobileNavigation hideDrawer={this.hideDrawer} />
            </SwipeableDrawer>
            <SplitPane
              split="vertical"
              minSize="200"
              resizerStyle={{ backgroundColor: theme.palette.divider }}
              size={this.state.mainSplitSize}
              onChange={size => {
                if (size > 0 && this.state.width) {
                  const sizeInPercent =
                    // @ts-ignore
                    parseInt((size * 100) / this.state.width, 10) + '%';
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
                showDrawer={this.showDrawer}
                openedFiles={this.props.openedFiles}
                currentDirectoryPath={this.props.directoryPath}
              />
              {this.props.openedFiles.length > 0 && (
                <EntryContainer
                  openedFiles={this.props.openedFiles}
                  currentDirectoryPath={this.props.directoryPath}
                />
              )}
            </SplitPane>
          </React.Fragment>
        )}
      </HotKeys>
    );
  }
}

function mapStateToProps(state) {
  return {
    isEditTagDialogOpened: isEditTagDialogOpened(state),
    isCreateDirectoryOpened: isCreateDirectoryOpened(state),
    isCreateFileDialogOpened: isCreateFileDialogOpened(state),
    isSelectDirectoryDialogOpened: isSelectDirectoryDialogOpened(state),
    isSettingsDialogOpened: isSettingsDialogOpened(state),
    isAboutDialogOpened: isAboutDialogOpened(state),
    isKeysDialogOpened: isKeysDialogOpened(state),
    isOnboardingDialogOpened: isOnboardingDialogOpened(state),
    isLicenseDialogOpened: isLicenseDialogOpened(state),
    isThirdPartyLibsDialogOpened: isThirdPartyLibsDialogOpened(state),
    isUploadProgressDialogOpened: isUploadDialogOpened(state),
    isProgressDialogOpened: isProgressOpened(state),
    isIndexing: isIndexing(state),
    isReadOnlyMode: isReadOnlyMode(state),
    isGeneratingThumbs: isGeneratingThumbs(state),
    // isFileOpened: isFileOpened(state),
    openedFiles: getOpenedFiles(state),
    isEntryInFullWidth: isEntryInFullWidth(state),
    isDesktopMode: getDesktopMode(state),
    keyBindings: getKeyBindingObject(state),
    leftSplitSize: getLeftVerticalSplitSize(state),
    mainSplitSize: getMainVerticalSplitSize(state),
    isUpdateAvailable: isUpdateAvailable(state),
    lastPublishedVersion: getLastPublishedVersion(state),
    notificationStatus: getNotificationStatus(state),
    isLocationManagerPanelOpened: isLocationManagerPanelOpened(state),
    isTagLibraryPanelOpened: isTagLibraryPanelOpened(state),
    isSearchPanelOpened: isSearchPanelOpened(state),
    isPerspectivesPanelOpened: isPerspectivesPanelOpened(state),
    isHelpFeedbackPanelOpened: isHelpFeedbackPanelOpened(state),
    directoryPath: getDirectoryPath(state)
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      loadParentDirectoryContent: AppActions.loadParentDirectoryContent,
      toggleCreateDirectoryDialog: AppActions.toggleCreateDirectoryDialog,
      toggleSelectDirectoryDialog: AppActions.toggleSelectDirectoryDialog,
      toggleUploadDialog: AppActions.toggleUploadDialog,
      toggleProgressDialog: AppActions.toggleProgressDialog,
      resetProgress: AppActions.resetProgress,
      toggleEditTagDialog: AppActions.toggleEditTagDialog,
      hideNotifications: AppActions.hideNotifications,
      onUploadProgress: AppActions.onUploadProgress,
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
      toggleOnboardingDialog: AppActions.toggleOnboardingDialog,
      setLastSelectedEntry: AppActions.setLastSelectedEntry,
      setSelectedEntries: AppActions.setSelectedEntries,
      setGeneratingThumbnails: AppActions.setGeneratingThumbnails,
      openFsEntry: AppActions.openFsEntry,
      openFileNatively: AppActions.openFileNatively,
      openURLExternally: AppActions.openURLExternally,
      setEntryFullWidth: AppActions.setEntryFullWidth,
      setUpdateAvailable: AppActions.setUpdateAvailable,
      openNextFile: AppActions.openNextFile,
      openPrevFile: AppActions.openPrevFile,
      toggleShowUnixHiddenEntries: SettingsActions.toggleShowUnixHiddenEntries,
      setLeftVerticalSplitSize: SettingsActions.setLeftVerticalSplitSize,
      setMainVerticalSplitSize: SettingsActions.setMainVerticalSplitSize,
      showNotification: AppActions.showNotification,
      reflectCreateEntries: AppActions.reflectCreateEntries,
      openLocationManagerPanel: AppActions.openLocationManagerPanel,
      openTagLibraryPanel: AppActions.openTagLibraryPanel,
      openSearchPanel: AppActions.openSearchPanel,
      openPerspectivesPanel: AppActions.openPerspectivesPanel,
      openHelpFeedbackPanel: AppActions.openHelpFeedbackPanel,
      closeAllVerticalPanels: AppActions.closeAllVerticalPanels,
      setFirstRun: SettingsActions.setFirstRun,
      uploadFilesAPI: IOActions.uploadFilesAPI
    },
    dispatch
  );
}

export default withDnDContext(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(
    translate(['core'], { wait: true })(
      withStyles(styles, { withTheme: true })(MainPage)
    )
  )
);
