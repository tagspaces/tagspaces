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

import React, { useEffect, useRef, useState } from 'react';
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
import { CognitoUserInterface } from '@aws-amplify/ui-components';
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
  isUploadDialogOpened,
  isCreateFileDialogOpened,
  isSettingsDialogOpened,
  isOpenLinkDialogOpened,
  isReadOnlyMode,
  isProgressOpened,
  getOpenedFiles,
  OpenedEntry,
  isDeleteMultipleEntriesDialogOpened,
  getSelectedEntries,
  currentUser
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
import useEventListener from '-/utils/useEventListener';
import ConfirmDialog from '-/components/dialogs/ConfirmDialog';

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
  isUploadProgressDialogOpened: boolean;
  isProgressDialogOpened: boolean;
  toggleUploadDialog: () => void;
  toggleOpenLinkDialog: () => void;
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
  // setLastSelectedEntry: (path: string) => void; // needed by electron-menus
  setSelectedEntries: (selectedEntries: Array<Object>) => void; // needed by electron-menus
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
  isOpenLinkDialogOpened: boolean;
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
  isDeleteMultipleEntriesDialogOpened: boolean;
  toggleDeleteMultipleEntriesDialog: () => void;
  selectedEntries: Array<any>;
  deleteFile: (path: string) => void;
  deleteDirectory: (path: string) => void;
  user: CognitoUserInterface;
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

const OpenLinkDialog = React.lazy(() =>
  import(
    /* webpackChunkName: "OpenLinkDialog" */ '../components/dialogs/OpenLinkDialog'
  )
);
const OpenLinkDialogAsync = props => (
  <React.Suspense fallback={<LoadingLazy />}>
    <OpenLinkDialog {...props} />
  </React.Suspense>
);

/* let showVerticalPanel = true;
if (window.ExtDefaultVerticalPanel === 'none') {
  showVerticalPanel = false;
} */

const MainPage = (props: Props) => {
  /* const [selectedDirectoryPath, setSelectedDirectoryPath] = useState<string>(
    ''
  ); */
  const selectedDirectoryPath = useRef<string>('');
  const setSelectedDirectoryPath = (path: string) => {
    selectedDirectoryPath.current = path;
  };
  /* const [isManagementPanelVisible, setManagementPanelVisible] = useState<
    boolean
  >(window.ExtDefaultVerticalPanel !== 'none' && !props.isEntryInFullWidth); */
  // const [mainSplitSize, setMainSplitSize] = useState<any>('100%');
  // const [isDrawerOpened, setDrawerOpened] = useState<boolean>(true);
  const [dimensions, setDimensions] = useState<any>({
    width: 1000,
    height: 1000
  });

  useEffect(() => {
    if (!AppConfig.isCordova) {
      updateDimensions();
    }
    // this.setupDesktopMenu();
    buildDesktopMenu(props);
    buildTrayIconMenu(props);
  }, []);

  useEffect(() => {
    if (props.isEntryInFullWidth) {
      props.closeAllVerticalPanels();
      // setMainSplitSize('0%');
    } else {
      // setMainSplitSize(props.mainSplitSize);
      // setManagementPanelVisible(true);
      showDrawer();
    }
  }, [props.isEntryInFullWidth]);

  const getMainSplitSize = () => {
    if (props.openedFiles.length === 0) {
      return '100%';
    }

    if (props.isEntryInFullWidth) {
      return '0%';
    }
    const width =
      window.innerWidth ||
      document.documentElement.clientWidth ||
      body.clientWidth;
    const height =
      window.innerHeight ||
      document.documentElement.clientHeight ||
      body.clientHeight;
    if (height > width) {
      return '0%';
    }

    return props.mainSplitSize;
  };

  const isManagementPanelVisible = () => {
    if (
      props.isLocationManagerPanelOpened ||
      props.isTagLibraryPanelOpened ||
      props.isSearchPanelOpened ||
      props.isPerspectivesPanelOpened ||
      props.isHelpFeedbackPanelOpened
    ) {
      return true;
    }
    return false;
    // return window.ExtDefaultVerticalPanel !== 'none' && !props.isEntryInFullWidth;
  };

  useEventListener('resize', () => {
    if (!AppConfig.isCordova) {
      updateDimensions();
    }
  });

  const updateDimensions = () => {
    const width =
      window.innerWidth ||
      document.documentElement.clientWidth ||
      body.clientWidth;
    const height =
      window.innerHeight ||
      document.documentElement.clientHeight ||
      body.clientHeight;

    // console.log('Width: ' + width + ' Height: ' + height);
    setDimensions({ width, height });

    if (props.openedFiles.length > 0) {
      const isFillWidth = height > width;
      if (isFillWidth !== props.isEntryInFullWidth) {
        props.setEntryFullWidth(isFillWidth);
      }
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

  const showDrawer = () => {
    if (
      !props.isLocationManagerPanelOpened &&
      !props.isSearchPanelOpened &&
      !props.isTagLibraryPanelOpened
    ) {
      props.openLocationManagerPanel();
    }
    // setDrawerOpened(true);
  };

  const skipRelease = () => {
    props.setUpdateAvailable(false);
  };

  const getLatestVersion = () => {
    if (Pro) {
      props.showNotification(
        i18n.t('core:getLatestVersionPro'),
        'default',
        false
      );
    } else {
      props.openFileNatively(AppConfig.links.downloadURL);
    }
    props.setUpdateAvailable(false);
  };

  const openChangelogPage = () => {
    props.openFileNatively(AppConfig.links.changelogURL);
  };

  const handleFileDrop = (item, monitor) => {
    if (props.isReadOnlyMode) {
      props.showNotification(
        i18n.t('core:dndDisabledReadOnlyMode'),
        'error',
        true
      );
      return;
    }
    if (monitor) {
      const { files } = monitor.getItem();
      console.log('Dropped files: ' + JSON.stringify(files));
      if (!props.directoryPath) {
        props.showNotification(
          'Importing files failed, because no folder is opened in TagSpaces!',
          'error',
          true
        );
      } else {
        props.resetProgress();
        props
          .uploadFilesAPI(files, props.directoryPath, props.onUploadProgress)
          .then(fsEntries => {
            props.reflectCreateEntries(fsEntries);
            return true;
          })
          .catch(error => {
            console.log('uploadFiles', error);
          });
        props.toggleUploadDialog();
      }
    }
  };

  const keyBindingHandlers = {
    openParentDirectory: props.loadParentDirectoryContent,
    toggleShowHiddenEntries: props.toggleShowUnixHiddenEntries,
    showFolderNavigator: props.openLocationManagerPanel,
    showTagLibrary: props.openTagLibraryPanel,
    openSearch: props.openSearchPanel,
    showHelp: props.openHelpFeedbackPanel
  };

  const keyMap = {
    openParentDirectory: props.keyBindings.openParentDirectory,
    toggleShowHiddenEntries: props.keyBindings.toggleShowHiddenEntries,
    showFolderNavigator: props.keyBindings.showFolderNavigator,
    showTagLibrary: props.keyBindings.showTagLibrary,
    openSearch: props.keyBindings.openSearch,
    showHelp: props.keyBindings.showHelp
  };

  const handleSplitSizeChange = size => {
    if (size > 0 && dimensions.width) {
      const sizeInPercent =
        // @ts-ignore
        parseInt((size * 100) / dimensions.width, 10) + '%';
      // setMainSplitSize(sizeInPercent);
      props.setMainVerticalSplitSize(sizeInPercent);
    }
  };

  const {
    theme,
    toggleOnboardingDialog,
    toggleSettingsDialog,
    toggleKeysDialog,
    toggleLicenseDialog,
    toggleThirdPartyLibsDialog,
    toggleAboutDialog,
    toggleCreateDirectoryDialog,
    toggleCreateFileDialog,
    toggleUploadDialog,
    toggleProgressDialog,
    toggleEditTagDialog,
    toggleOpenLinkDialog,
    setFirstRun,
    openURLExternally,
    directoryPath
  } = props;
  const { FILE } = NativeTypes;

  /* if (this.state.width < 400) {
      this.setManagementPanelVisibility(false);
    } */
  return (
    <HotKeys handlers={keyBindingHandlers} keyMap={keyMap}>
      {props.isAboutDialogOpened && (
        <AboutDialogAsync
          open={props.isAboutDialogOpened}
          openURLExternally={openURLExternally}
          toggleLicenseDialog={toggleLicenseDialog}
          toggleThirdPartyLibsDialog={toggleThirdPartyLibsDialog}
          onClose={toggleAboutDialog}
        />
      )}
      {props.isKeysDialogOpened && (
        <KeyboardDialogAsync
          open={props.isKeysDialogOpened}
          onClose={toggleKeysDialog}
        />
      )}
      {props.isLicenseDialogOpened && (
        <LicenseDialogAsync
          open={props.isLicenseDialogOpened}
          onClose={() => {
            setFirstRun(false);
            toggleLicenseDialog();
          }}
        />
      )}
      {props.isOnboardingDialogOpened && (
        <OnboardingDialogAsync
          open={props.isOnboardingDialogOpened}
          onClose={toggleOnboardingDialog}
        />
      )}
      {props.isThirdPartyLibsDialogOpened && (
        <ThirdPartyLibsDialogAsync
          open={props.isThirdPartyLibsDialogOpened}
          onClose={toggleThirdPartyLibsDialog}
        />
      )}
      {props.isEditTagDialogOpened && (
        <EditEntryTagDialogAsync
          open={props.isEditTagDialogOpened}
          onClose={toggleEditTagDialog}
        />
      )}
      {props.isOpenLinkDialogOpened && (
        <OpenLinkDialogAsync
          open={props.isOpenLinkDialogOpened}
          onClose={toggleOpenLinkDialog}
        />
      )}
      {props.isUploadProgressDialogOpened && (
        <FileUploadDialog
          open={props.isUploadProgressDialogOpened}
          onClose={toggleUploadDialog}
        />
      )}
      {props.isProgressDialogOpened && (
        <ProgressDialog
          open={props.isProgressDialogOpened}
          onClose={toggleProgressDialog}
        />
      )}
      {props.isCreateDirectoryOpened && (
        <CreateDirectoryDialog
          open={props.isCreateDirectoryOpened}
          onClose={toggleCreateDirectoryDialog}
          selectedDirectoryPath={directoryPath}
        />
      )}
      {props.isCreateFileDialogOpened && (
        <CreateFileDialog
          open={props.isCreateFileDialogOpened}
          selectedDirectoryPath={selectedDirectoryPath.current || directoryPath}
          chooseDirectoryPath={currentPath =>
            setSelectedDirectoryPath(currentPath)
          }
          onClose={toggleCreateFileDialog}
        />
      )}
      {props.isSettingsDialogOpened && (
        <SettingsDialog
          open={props.isSettingsDialogOpened}
          onClose={toggleSettingsDialog}
        />
      )}
      {props.isDeleteMultipleEntriesDialogOpened && (
        <ConfirmDialog
          open={props.isDeleteMultipleEntriesDialogOpened}
          onClose={() => props.toggleDeleteMultipleEntriesDialog()}
          title={i18n.t('core:deleteConfirmationTitle')}
          content={i18n.t('core:deleteConfirmationContent')}
          list={props.selectedEntries.map(fsEntry => fsEntry.name)}
          confirmCallback={result => {
            if (result && props.selectedEntries) {
              const deletePromises = props.selectedEntries.map(fsEntry => {
                if (fsEntry.isFile) {
                  return props.deleteFile(fsEntry.path);
                }
                return props.deleteDirectory(fsEntry.path);
              });
              Promise.all(deletePromises)
                .then(delResult => {
                  // console.debug(delResult);
                  if (delResult.some(del => del)) {
                    props.setSelectedEntries([]);
                  } // TODO else { remove only deleted from setSelectedEntries}
                  return true;
                })
                .catch(err => {
                  console.warn('Deleting file failed', err);
                });
            }
          }}
          cancelDialogTID="cancelDeleteFileDialog"
          confirmDialogTID="confirmDeleteFileDialog"
          confirmDialogContentTID="confirmDeleteDialogContent"
        />
      )}
      <Snackbar
        data-tid={props.notificationStatus.tid}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={props.notificationStatus.visible}
        onClose={props.hideNotifications}
        autoHideDuration={props.notificationStatus.autohide ? 3000 : undefined}
        message={props.notificationStatus.text}
        action={[
          <IconButton
            data-tid={'close' + props.notificationStatus.tid}
            key="close"
            aria-label={i18n.t('core:closeButton')}
            color="inherit"
            onClick={props.hideNotifications}
          >
            <CloseIcon />
          </IconButton>
        ]}
      />
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={props.isGeneratingThumbs}
        autoHideDuration={undefined}
        message="Loading or generating thumbnails..."
        action={[
          <IconButton
            key="closeButton"
            aria-label={i18n.t('core:closeButton')}
            color="inherit"
            onClick={() => props.setGeneratingThumbnails(false)}
          >
            <CloseIcon />
          </IconButton>
        ]}
      />
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={props.isIndexing}
        autoHideDuration={undefined}
        message="Indexing"
        action={[
          <Button
            key="cancelIndexButton"
            color="secondary"
            size="small"
            onClick={props.cancelDirectoryIndexing}
            data-tid="cancelDirectoryIndexing"
          >
            {i18n.t('core:cancelIndexing')}
          </Button>
        ]}
      />
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        open={props.isUpdateAvailable}
        autoHideDuration={undefined}
        message={'Version ' + props.lastPublishedVersion + ' available.'}
        action={[
          <Button
            key="laterButton"
            color="secondary"
            size="small"
            onClick={skipRelease}
          >
            {i18n.t('core:later')}
          </Button>,
          <Button
            key="changelogButton"
            color="secondary"
            size="small"
            onClick={openChangelogPage}
          >
            {i18n.t('core:releaseNotes')}
          </Button>,
          <Button
            key="latestVersionButton"
            color="primary"
            size="small"
            onClick={getLatestVersion}
          >
            {i18n.t('core:getItNow')}
          </Button>
        ]}
      />
      {props.isDesktopMode || (AppConfig.isAmplify && !props.user) ? (
        <TargetFileBox
          // @ts-ignore
          accepts={[FILE]}
          onDrop={handleFileDrop}
        >
          <CustomDragLayer />
          <SplitPane
            split="vertical"
            // style={{
            //   borderTop:
            //     AppConfig.isElectron && !AppConfig.isMacLike
            //       ? '1px solid lightgray'
            //       : 'none'
            // }}
            minSize={200}
            maxSize={450}
            resizerStyle={{ backgroundColor: theme.palette.divider }}
            defaultSize={props.leftSplitSize}
            size={
              isManagementPanelVisible()
                ? props.leftSplitSize
                : initialSplitSize
            }
            onChange={size => {
              // setManagementPanelVisible(size > initialSplitSize);
              bufferedLeftSplitResize(() =>
                props.setLeftVerticalSplitSize(size)
              );
            }}
          >
            <VerticalNavigation />
            <SplitPane
              split="vertical"
              minSize="200"
              resizerStyle={{ backgroundColor: theme.palette.divider }}
              size={getMainSplitSize()}
              onChange={handleSplitSizeChange}
            >
              <FolderContainer
                windowHeight={dimensions.height}
                windowWidth={dimensions.width}
                openedFiles={props.openedFiles}
                currentDirectoryPath={props.directoryPath}
              />
              {props.openedFiles.length > 0 && (
                <EntryContainer
                  openedFiles={props.openedFiles}
                  currentDirectoryPath={props.directoryPath}
                />
              )}
            </SplitPane>
          </SplitPane>
        </TargetFileBox>
      ) : (
        <React.Fragment>
          <SwipeableDrawer
            open={isManagementPanelVisible()}
            onClose={() => props.closeAllVerticalPanels()}
            onOpen={showDrawer}
            hysteresis={0.1}
            disableBackdropTransition={!AppConfig.isIOS}
            // disableDiscovery={AppConfig.isIOS}
          >
            <MobileNavigation
              hideDrawer={() => props.closeAllVerticalPanels()}
            />
          </SwipeableDrawer>
          <SplitPane
            split="vertical"
            minSize="200"
            resizerStyle={{ backgroundColor: theme.palette.divider }}
            size={getMainSplitSize()}
            onChange={handleSplitSizeChange}
          >
            <FolderContainer
              windowHeight={dimensions.height}
              windowWidth={dimensions.width}
              showDrawer={showDrawer}
              openedFiles={props.openedFiles}
              currentDirectoryPath={props.directoryPath}
            />
            {props.openedFiles.length > 0 && (
              <EntryContainer
                openedFiles={props.openedFiles}
                currentDirectoryPath={props.directoryPath}
              />
            )}
          </SplitPane>
        </React.Fragment>
      )}
    </HotKeys>
  );
};

function mapStateToProps(state) {
  return {
    isEditTagDialogOpened: isEditTagDialogOpened(state),
    isCreateDirectoryOpened: isCreateDirectoryOpened(state),
    isCreateFileDialogOpened: isCreateFileDialogOpened(state),
    isSettingsDialogOpened: isSettingsDialogOpened(state),
    isAboutDialogOpened: isAboutDialogOpened(state),
    isKeysDialogOpened: isKeysDialogOpened(state),
    isOnboardingDialogOpened: isOnboardingDialogOpened(state),
    isLicenseDialogOpened: isLicenseDialogOpened(state),
    isThirdPartyLibsDialogOpened: isThirdPartyLibsDialogOpened(state),
    isUploadProgressDialogOpened: isUploadDialogOpened(state),
    isOpenLinkDialogOpened: isOpenLinkDialogOpened(state),
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
    directoryPath: getDirectoryPath(state),
    isDeleteMultipleEntriesDialogOpened: isDeleteMultipleEntriesDialogOpened(
      state
    ),
    selectedEntries: getSelectedEntries(state),
    user: currentUser(state)
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      loadParentDirectoryContent: AppActions.loadParentDirectoryContent,
      toggleCreateDirectoryDialog: AppActions.toggleCreateDirectoryDialog,
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
      toggleOpenLinkDialog: AppActions.toggleOpenLinkDialog,
      // setLastSelectedEntry: AppActions.setLastSelectedEntry,
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
      toggleDeleteMultipleEntriesDialog:
        AppActions.toggleDeleteMultipleEntriesDialog,
      setFirstRun: SettingsActions.setFirstRun,
      uploadFilesAPI: IOActions.uploadFilesAPI,
      deleteDirectory: AppActions.deleteDirectory,
      deleteFile: AppActions.deleteFile
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
