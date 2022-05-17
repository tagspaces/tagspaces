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

import React, { useEffect, useReducer, useRef, useState } from 'react';
import clsx from 'clsx';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { translate } from 'react-i18next';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import Drawer from '@material-ui/core/Drawer';
import { HotKeys } from 'react-hotkeys';
import { NativeTypes } from 'react-dnd-html5-backend';
import { Progress } from 'aws-sdk/clients/s3';
import { CognitoUserInterface } from '@aws-amplify/ui-components';
import { Split } from 'ts-react-splitter';
import MobileNavigation from '../components/MobileNavigation';
import FolderContainer from '../components/FolderContainer';
import EntryContainer from '../components/EntryContainer';
import SettingsDialog from '../components/dialogs/settings/SettingsDialog';
import CreateDirectoryDialog from '../components/dialogs/CreateDirectoryDialog';
import CreateFileDialog from '../components/dialogs/CreateDialog';
import {
  getDesktopMode,
  getKeyBindingObject,
  getMainVerticalSplitSize,
  actions as SettingsActions
} from '../reducers/settings';
import {
  actions as AppActions,
  isGeneratingThumbs,
  isAboutDialogOpened,
  isOnboardingDialogOpened,
  isKeysDialogOpened,
  isLicenseDialogOpened,
  isThirdPartyLibsDialogOpened,
  isEntryInFullWidth,
  getDirectoryPath,
  isLocationManagerPanelOpened,
  isTagLibraryPanelOpened,
  isSearchPanelOpened,
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
  currentUser,
  isLocationDialogOpened
} from '../reducers/app';
import { buffer } from '-/utils/misc';
import TargetFileBox from '../components/TargetFileBox';
import AppConfig from '../config';
import i18n from '../services/i18n';
import LoadingLazy from '../components/LoadingLazy';
import withDnDContext from '-/containers/withDnDContext';
import CustomDragLayer from '-/components/CustomDragLayer';
import IOActions from '-/reducers/io-actions';
import FileUploadDialog from '-/components/dialogs/FileUploadDialog';
import ProgressDialog from '-/components/dialogs/ProgressDialog';
import useEventListener from '-/utils/useEventListener';
import ConfirmDialog from '-/components/dialogs/ConfirmDialog';
import { TS } from '-/tagspaces.namespace';
import PageNotification from '-/containers/PageNotification';
import listen from '-/containers/RendererListener';
import { actions as LocationIndexActions } from '-/reducers/location-index';
import MoveCopyFilesDialog from '-/components/dialogs/MoveOrCopyFilesDialog';
import PlatformIO from '-/services/platform-facade';

const drawerWidth = 320;
const body = document.getElementsByTagName('body')[0];
const bufferedLeftSplitResize = buffer({
  timeout: 300,
  id: 'buffered-leftsplit-resize'
});

const styles: any = (theme: any) => ({
  content: {
    height: '100%',
    flexGrow: 1,
    padding: 0,
    paddingLeft: drawerWidth,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  contentShift: {
    height: '100%',
    padding: 0,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    }),
    marginLeft: 0
  }
});

interface Props {
  isFirstRun: boolean;
  setFirstRun: (isFirstRun: boolean) => void;
  isDesktopMode: boolean;
  openedFiles: Array<OpenedEntry>;
  isGeneratingThumbs: boolean;
  // setGeneratingThumbnails: (isGenerating: boolean) => void;
  isEntryInFullWidth: boolean;
  classes: any;
  theme: any;
  isReadOnlyMode: boolean;
  isSettingsDialogOpened: boolean;
  isCreateFileDialogOpened: boolean;
  isCreateDirectoryOpened: boolean;
  toggleCreateDirectoryDialog: () => void;
  isAboutDialogOpened: boolean;
  isLocationDialogOpened: boolean;
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
  loadParentDirectoryContent: () => void;
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
  toggleLocationDialog: () => void; // needed by electron-menus
  toggleOnboardingDialog: () => void; // needed by electron-menus
  // setLastSelectedEntry: (path: string) => void; // needed by electron-menus
  setSelectedEntries: (selectedEntries: Array<Object>) => void; // needed by electron-menus
  openFsEntry: (fsEntry: TS.FileSystemEntry) => void; // needed by electron-menus
  openURLExternally: (url: string, skipConfirm: boolean) => void;
  openNextFile: (path?: string) => void; // needed by electron-menus
  openPrevFile: (path?: string) => void; // needed by electron-menus
  openLocationManagerPanel: () => void;
  openTagLibraryPanel: () => void;
  // openSearchPanel: () => void;
  openHelpFeedbackPanel: () => void;
  closeAllVerticalPanels: () => void;
  leftSplitSize: number;
  mainSplitSize: any;
  toggleShowUnixHiddenEntries: () => void;
  setMainVerticalSplitSize: (splitSize: string) => void;
  isLocationManagerPanelOpened: boolean;
  isOpenLinkDialogOpened: boolean;
  isTagLibraryPanelOpened: boolean;
  isSearchPanelOpened: boolean;
  isHelpFeedbackPanelOpened: boolean;
  directoryPath: string;
  showNotification: (
    text: string,
    notificationType?: string,
    autohide?: boolean
  ) => void;
  reflectCreateEntries: (fsEntries: Array<TS.FileSystemEntry>) => void;
  loadDirectoryContent: (path: string, generateThumbnails: boolean) => void;
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
  setSearchQuery: (searchQuery: TS.SearchQuery) => void;
}

const CreateEditLocationDialog = React.lazy(() =>
  import(
    /* webpackChunkName: "CreateEditLocationDialog" */ '../components/dialogs/CreateEditLocationDialog'
  )
);
function CreateEditLocationDialogAsync(props) {
  return (
    <React.Suspense fallback={<LoadingLazy />}>
      <CreateEditLocationDialog {...props} />
    </React.Suspense>
  );
}

const AboutDialog = React.lazy(() =>
  import(
    /* webpackChunkName: "AboutDialog" */ '../components/dialogs/AboutDialog'
  )
);
function AboutDialogAsync(props) {
  return (
    <React.Suspense fallback={<LoadingLazy />}>
      <AboutDialog {...props} />
    </React.Suspense>
  );
}

const LicenseDialog = React.lazy(() =>
  import(
    /* webpackChunkName: "LicenseDialog" */ '../components/dialogs/LicenseDialog'
  )
);
function LicenseDialogAsync(props) {
  return (
    <React.Suspense fallback={<LoadingLazy />}>
      <LicenseDialog {...props} />
    </React.Suspense>
  );
}

const KeyboardDialog = React.lazy(() =>
  import(
    /* webpackChunkName: "KeyboardDialog" */ '../components/dialogs/KeyboardDialog'
  )
);
function KeyboardDialogAsync(props) {
  return (
    <React.Suspense fallback={<LoadingLazy />}>
      <KeyboardDialog {...props} />
    </React.Suspense>
  );
}

const ThirdPartyLibsDialog = React.lazy(() =>
  import(
    /* webpackChunkName: "ThirdPartyLibsDialog" */ '../components/dialogs/ThirdPartyLibsDialog'
  )
);
function ThirdPartyLibsDialogAsync(props) {
  return (
    <React.Suspense fallback={<LoadingLazy />}>
      <ThirdPartyLibsDialog {...props} />
    </React.Suspense>
  );
}

const OnboardingDialog = React.lazy(() =>
  import(
    /* webpackChunkName: "OnboardingDialog" */ '../components/dialogs/OnboardingDialog'
  )
);
function OnboardingDialogAsync(props) {
  return (
    <React.Suspense fallback={<LoadingLazy />}>
      <OnboardingDialog {...props} />
    </React.Suspense>
  );
}

const EditEntryTagDialog = React.lazy(() =>
  import(
    /* webpackChunkName: "EditEntryTagDialog" */ '../components/dialogs/EditEntryTagDialog'
  )
);
function EditEntryTagDialogAsync(props) {
  return (
    <React.Suspense fallback={<LoadingLazy />}>
      <EditEntryTagDialog {...props} />
    </React.Suspense>
  );
}

const OpenLinkDialog = React.lazy(() =>
  import(
    /* webpackChunkName: "OpenLinkDialog" */ '../components/dialogs/OpenLinkDialog'
  )
);
function OpenLinkDialogAsync(props) {
  return (
    <React.Suspense fallback={<LoadingLazy />}>
      <OpenLinkDialog {...props} />
    </React.Suspense>
  );
}

function MainPage(props: Props) {
  // const [percent, setPercent] = React.useState<number | undefined>(undefined);
  const percent = useRef<number | undefined>(undefined);
  const selectedDirectoryPath = useRef<string>('');
  const setSelectedDirectoryPath = (path: string) => {
    selectedDirectoryPath.current = path;
  };
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0);

  const width =
    window.innerWidth ||
    document.documentElement.clientWidth ||
    body.clientWidth;
  const height =
    window.innerHeight ||
    document.documentElement.clientHeight ||
    body.clientHeight;
  const [dimensions, setDimensions] = useState<any>({
    width,
    height
  });

  const [drawerOpened, setDrawerOpened] = useState<boolean>(true);
  const [moveCopyDialogOpened, setMoveCopyDialogOpened] = useState<any>(
    undefined
  );
  // const [rightPanelWidth, setRightPanelWidth] = useState<number>(0);

  useEffect(() => {
    if (!AppConfig.isCordova) {
      updateDimensions();
    }
    listen(props);
  }, []);

  useEffect(() => {
    // setPercent(undefined);
    if (props.isEntryInFullWidth) {
      setDrawerOpened(false); // !props.isEntryInFullWidth);
    }
  }, [props.isEntryInFullWidth]);

  useEffect(() => {
    updateDimensions();
  }, [props.openedFiles]);

  useEventListener('resize', () => {
    if (!AppConfig.isCordova) {
      updateDimensions();
    }
  });

  const updateDimensions = () => {
    const w =
      window.innerWidth ||
      document.documentElement.clientWidth ||
      body.clientWidth;
    const h =
      window.innerHeight ||
      document.documentElement.clientHeight ||
      body.clientHeight;

    // console.log('Width: ' + width + ' Height: ' + height);
    setDimensions({ width: w, height: h });

    if (props.openedFiles.length > 0 && !props.isEntryInFullWidth) {
      const isFillWidth = h > w;
      if (isFillWidth !== props.isEntryInFullWidth) {
        props.setEntryFullWidth(isFillWidth);
      }
    }
  };

  const toggleDrawer = () => {
    setDrawerOpened(prevOpen => !prevOpen);
  };

  const handleMoveCopyFiles = (files: Array<File>, move = false) => {
    const promises = [];
    for (const file of files) {
      if (move) {
        promises.push(
          PlatformIO.renameFilePromise(
            file.path,
            props.directoryPath + AppConfig.dirSeparator + file.name
          )
            .then(() => true)
            .catch(error => {
              console.log('renameFilePromise', error);
            })
        );
      } else {
        promises.push(
          PlatformIO.copyFilePromise(
            file.path,
            props.directoryPath + AppConfig.dirSeparator + file.name
          )
            .then(() => true)
            .catch(error => {
              console.log('copyFilePromise', error);
            })
        );
      }
    }
    Promise.all(promises)
      .then(() => props.loadDirectoryContent(props.directoryPath, true))
      .catch(error => {
        console.log('promises', error);
      });
  };
  /* const handleMoveFiles = (files: Array<File>) => {
    handleCopyFiles(files)
      .then(success => {
        if (AppConfig.isElectron && success) {
          for (const file of files) {
            PlatformIO.deleteFilePromise(file.path)
              .then(() => true)
              .catch(error => {
                console.log('deleteFilePromise', error);
              });
          }
        }
        return true;
      })
      .catch(error => {
        console.log('handleCopyFiles', error);
      });
  }; */

  const handleCopyFiles = files => {
    if (props.isReadOnlyMode) {
      props.showNotification(
        i18n.t('core:dndDisabledReadOnlyMode'),
        'error',
        true
      );
      return Promise.reject(i18n.t('core:dndDisabledReadOnlyMode'));
    }
    if (files) {
      console.log('Dropped files: ' + JSON.stringify(files));
      if (!props.directoryPath) {
        props.showNotification(
          'Importing files failed, because no folder is opened in TagSpaces!',
          'error',
          true
        );
        return Promise.reject(
          new Error(
            'Importing files failed, because no folder is opened in TagSpaces!'
          )
        );
      }
      props.resetProgress();
      return props
        .uploadFilesAPI(files, props.directoryPath, props.onUploadProgress)
        .then(fsEntries => {
          props.reflectCreateEntries(fsEntries);
          props.toggleUploadDialog();
          return true;
        })
        .catch(error => {
          console.log('uploadFiles', error);
        });
    }
    return Promise.reject(new Error('on files'));
  };

  const keyBindingHandlers = {
    openParentDirectory: props.loadParentDirectoryContent,
    toggleShowHiddenEntries: props.toggleShowUnixHiddenEntries,
    showFolderNavigator: () => {
      props.openLocationManagerPanel();
      setDrawerOpened(true);
    },
    showTagLibrary: () => {
      props.openTagLibraryPanel();
      setDrawerOpened(true);
    },
    openSearch: () => props.setSearchQuery({ textQuery: '' }), // props.openSearchPanel,
    closeSearch: () => props.setSearchQuery({}),
    showHelp: () => {
      props.openHelpFeedbackPanel();
      setDrawerOpened(true);
    }
  };

  const keyMap = {
    openParentDirectory: props.keyBindings.openParentDirectory,
    toggleShowHiddenEntries: props.keyBindings.toggleShowHiddenEntries,
    showFolderNavigator: props.keyBindings.showFolderNavigator,
    showTagLibrary: props.keyBindings.showTagLibrary,
    openSearch: props.keyBindings.openSearch,
    closeSearch: props.keyBindings.Escape,
    showHelp: props.keyBindings.showHelp
  };

  const {
    theme,
    toggleOnboardingDialog,
    toggleSettingsDialog,
    toggleKeysDialog,
    toggleLicenseDialog,
    toggleThirdPartyLibsDialog,
    toggleAboutDialog,
    toggleLocationDialog,
    toggleCreateDirectoryDialog,
    toggleCreateFileDialog,
    toggleUploadDialog,
    toggleProgressDialog,
    toggleEditTagDialog,
    toggleOpenLinkDialog,
    setFirstRun,
    openURLExternally,
    directoryPath,
    mainSplitSize,
    openedFiles,
    classes
  } = props;
  const { FILE } = NativeTypes;

  const isFileOpened = openedFiles.length > 0;

  const setPercent = (p: number | undefined) => {
    percent.current = p;
    if (p !== undefined) {
      bufferedLeftSplitResize(() => {
        if (props.mainSplitSize !== p + '%') {
          props.setMainVerticalSplitSize(p + '%');
        }
      });
    }
    forceUpdate();
  };

  const renderContainers = () => {
    let initialPrimarySize = mainSplitSize;
    let minPrimarySize = '250px';
    let minSecondarySize = '250px';
    let renderSplitter;

    if (!isFileOpened) {
      percent.current = undefined;
      initialPrimarySize = '100%';
      minSecondarySize = '0%';
      renderSplitter = function() {
        return null;
      };
    }
    if (props.isEntryInFullWidth) {
      percent.current = undefined;
      initialPrimarySize = '0%';
      minPrimarySize = '0%';
      renderSplitter = function() {
        return null;
      };
    }
    return (
      <Split
        initialPrimarySize={initialPrimarySize}
        minPrimarySize={minPrimarySize}
        minSecondarySize={minSecondarySize}
        renderSplitter={renderSplitter}
        percent={percent.current}
        setPercent={setPercent}
      >
        <FolderContainer
          windowHeight={dimensions.height}
          windowWidth={dimensions.width}
          toggleDrawer={toggleDrawer}
          drawerOpened={drawerOpened}
          openedFiles={openedFiles}
          currentDirectoryPath={directoryPath}
        />
        {isFileOpened && (
          <EntryContainer
            key="EntryContainerID"
            openedFiles={openedFiles}
            currentDirectoryPath={directoryPath}
          />
        )}
      </Split>
    );
  };

  return (
    <HotKeys
      handlers={keyBindingHandlers}
      keyMap={keyMap}
      style={{ height: '100%' }}
    >
      <MoveCopyFilesDialog
        open={moveCopyDialogOpened !== undefined}
        onClose={() => {
          setMoveCopyDialogOpened(undefined);
        }}
        fullScreen={false}
        selectedFiles={moveCopyDialogOpened}
        handleMoveFiles={files => {
          handleMoveCopyFiles(files, true);
          setMoveCopyDialogOpened(undefined);
        }}
        handleCopyFiles={files => {
          handleMoveCopyFiles(files, false);
          setMoveCopyDialogOpened(undefined);
        }}
      />
      {props.isLocationDialogOpened && (
        <CreateEditLocationDialogAsync
          open={props.isLocationDialogOpened}
          onClose={toggleLocationDialog}
        />
      )}
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
      <PageNotification />
      <div
        style={{
          backgroundColor: theme.palette.background.default,
          height: '100%'
        }}
      >
        {/* --default-splitter-line-hover-color: green !important; */}
        <style>
          {`
              .default-splitter {
                --default-splitter-line-margin: 4px !important;
                --default-splitter-line-size: 1px !important;
                --default-splitter-line-color: ${theme.palette.divider} !important;
              }

              .react-split .split-container.vertical .splitter {
                background-color: ${theme.palette.background.default};
              }
          `}
        </style>
        {props.isDesktopMode || (AppConfig.isAmplify && !props.user) ? (
          <TargetFileBox
            accepts={[FILE]}
            onDrop={(item: any) => {
              if (AppConfig.isElectron) {
                setMoveCopyDialogOpened(item.files);
              } else {
                handleCopyFiles(item.files);
              }
            }}
          >
            <CustomDragLayer />
            <Drawer variant="persistent" anchor="left" open={drawerOpened}>
              <MobileNavigation width={drawerWidth} />
            </Drawer>
            <main
              className={clsx(classes.content, {
                [classes.contentShift]: !drawerOpened
              })}
            >
              {renderContainers()}
            </main>
          </TargetFileBox>
        ) : (
          <>
            <SwipeableDrawer
              open={drawerOpened}
              onClose={() => setDrawerOpened(false)}
              onOpen={() => setDrawerOpened(true)}
              hysteresis={0.1}
              disableBackdropTransition={!AppConfig.isIOS}
            >
              <MobileNavigation
                width={drawerWidth}
                hideDrawer={() => props.closeAllVerticalPanels()}
              />
            </SwipeableDrawer>
            {renderContainers()}
          </>
        )}
      </div>
    </HotKeys>
  );
}

function mapStateToProps(state) {
  return {
    isEditTagDialogOpened: isEditTagDialogOpened(state),
    isCreateDirectoryOpened: isCreateDirectoryOpened(state),
    isCreateFileDialogOpened: isCreateFileDialogOpened(state),
    isSettingsDialogOpened: isSettingsDialogOpened(state),
    isAboutDialogOpened: isAboutDialogOpened(state),
    isLocationDialogOpened: isLocationDialogOpened(state),
    isKeysDialogOpened: isKeysDialogOpened(state),
    isOnboardingDialogOpened: isOnboardingDialogOpened(state),
    isLicenseDialogOpened: isLicenseDialogOpened(state),
    isThirdPartyLibsDialogOpened: isThirdPartyLibsDialogOpened(state),
    isUploadProgressDialogOpened: isUploadDialogOpened(state),
    isOpenLinkDialogOpened: isOpenLinkDialogOpened(state),
    isProgressDialogOpened: isProgressOpened(state),
    isReadOnlyMode: isReadOnlyMode(state),
    isGeneratingThumbs: isGeneratingThumbs(state),
    openedFiles: getOpenedFiles(state),
    isEntryInFullWidth: isEntryInFullWidth(state),
    isDesktopMode: getDesktopMode(state),
    keyBindings: getKeyBindingObject(state),
    mainSplitSize: getMainVerticalSplitSize(state),
    isLocationManagerPanelOpened: isLocationManagerPanelOpened(state),
    isTagLibraryPanelOpened: isTagLibraryPanelOpened(state),
    isSearchPanelOpened: isSearchPanelOpened(state),
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
      onUploadProgress: AppActions.onUploadProgress,
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
      toggleLocationDialog: AppActions.toggleLocationDialog,
      toggleOnboardingDialog: AppActions.toggleOnboardingDialog,
      toggleOpenLinkDialog: AppActions.toggleOpenLinkDialog,
      setSelectedEntries: AppActions.setSelectedEntries,
      // setGeneratingThumbnails: AppActions.setGeneratingThumbnails,
      openFsEntry: AppActions.openFsEntry,
      openURLExternally: AppActions.openURLExternally,
      setEntryFullWidth: AppActions.setEntryFullWidth,
      openNextFile: AppActions.openNextFile,
      openPrevFile: AppActions.openPrevFile,
      toggleShowUnixHiddenEntries: SettingsActions.toggleShowUnixHiddenEntries,
      setMainVerticalSplitSize: SettingsActions.setMainVerticalSplitSize,
      showNotification: AppActions.showNotification,
      reflectCreateEntries: AppActions.reflectCreateEntries,
      loadDirectoryContent: AppActions.loadDirectoryContent,
      openLocationManagerPanel: AppActions.openLocationManagerPanel,
      openTagLibraryPanel: AppActions.openTagLibraryPanel,
      // openSearchPanel: AppActions.openSearchPanel,
      openHelpFeedbackPanel: AppActions.openHelpFeedbackPanel,
      closeAllVerticalPanels: AppActions.closeAllVerticalPanels,
      toggleDeleteMultipleEntriesDialog:
        AppActions.toggleDeleteMultipleEntriesDialog,
      setFirstRun: SettingsActions.setFirstRun,
      uploadFilesAPI: IOActions.uploadFilesAPI,
      deleteDirectory: AppActions.deleteDirectory,
      deleteFile: AppActions.deleteFile,
      setSearchQuery: LocationIndexActions.setSearchQuery
    },
    dispatch
  );
}

const areEqual = (prevProp, nextProp) =>
  /* JSON.stringify(nextProp.theme.palette) ===
    JSON.stringify(prevProp.theme.palette) && */
  nextProp.directoryPath === prevProp.directoryPath &&
  nextProp.isAboutDialogOpened === prevProp.isAboutDialogOpened &&
  nextProp.isCreateDirectoryOpened === prevProp.isCreateDirectoryOpened &&
  nextProp.isCreateFileDialogOpened === prevProp.isCreateFileDialogOpened &&
  nextProp.isDeleteMultipleEntriesDialogOpened ===
    prevProp.isDeleteMultipleEntriesDialogOpened &&
  nextProp.isDesktopMode === prevProp.isDesktopMode &&
  nextProp.isEditTagDialogOpened === prevProp.isEditTagDialogOpened &&
  nextProp.isEntryInFullWidth === prevProp.isEntryInFullWidth &&
  nextProp.isHelpFeedbackPanelOpened === prevProp.isHelpFeedbackPanelOpened &&
  nextProp.isKeysDialogOpened === prevProp.isKeysDialogOpened &&
  nextProp.isLicenseDialogOpened === prevProp.isLicenseDialogOpened &&
  nextProp.isLocationDialogOpened === prevProp.isLocationDialogOpened &&
  nextProp.isLocationManagerPanelOpened ===
    prevProp.isLocationManagerPanelOpened &&
  nextProp.isOnboardingDialogOpened === prevProp.isOnboardingDialogOpened &&
  nextProp.isOpenLinkDialogOpened === prevProp.isOpenLinkDialogOpened &&
  nextProp.isProgressDialogOpened === prevProp.isProgressDialogOpened &&
  nextProp.isReadOnlyMode === prevProp.isReadOnlyMode &&
  nextProp.isSearchPanelOpened === prevProp.isSearchPanelOpened &&
  nextProp.isSettingsDialogOpened === prevProp.isSettingsDialogOpened &&
  nextProp.isTagLibraryPanelOpened === prevProp.isTagLibraryPanelOpened &&
  nextProp.isThirdPartyLibsDialogOpened ===
    prevProp.isThirdPartyLibsDialogOpened &&
  nextProp.isUploadProgressDialogOpened ===
    prevProp.isUploadProgressDialogOpened &&
  JSON.stringify(nextProp.selectedEntries) ===
    JSON.stringify(prevProp.selectedEntries) &&
  JSON.stringify(nextProp.openedFiles) === JSON.stringify(prevProp.openedFiles);

export default withDnDContext(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(
    translate(['core'], { wait: true })(
      React.memo(withStyles(styles, { withTheme: true })(MainPage), areEqual)
    )
  )
);
