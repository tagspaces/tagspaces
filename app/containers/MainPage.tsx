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
import withStyles from '@mui/styles/withStyles';
import { translate } from 'react-i18next';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Drawer from '@mui/material/Drawer';
import { HotKeys } from 'react-hotkeys';
import { NativeTypes } from 'react-dnd-html5-backend';
import { Progress } from 'aws-sdk/clients/s3';
import { CognitoUserInterface } from '@aws-amplify/ui-components';
import { Split } from 'ts-react-splitter';
import { buffer } from '@tagspaces/tagspaces-common/misc';
import AppConfig from '-/AppConfig';
import MobileNavigation from '../components/MobileNavigation';
import FolderContainer from '../components/FolderContainer';
import EntryContainer from '../components/EntryContainer';
import SettingsDialog from '../components/dialogs/settings/SettingsDialog';
import CreateDirectoryDialog from '../components/dialogs/CreateDirectoryDialog';
import NewEntryDialog from '../components/dialogs/NewEntryDialog';
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
  isNewEntryDialogOpened,
  isNewFileDialogOpened,
  isSettingsDialogOpened,
  isOpenLinkDialogOpened,
  isReadOnlyMode,
  isProgressOpened,
  getOpenedFiles,
  OpenedEntry,
  isDeleteMultipleEntriesDialogOpened,
  isImportKanBanDialogOpened,
  getSelectedEntries,
  currentUser,
  isLocationDialogOpened,
  isProTeaserVisible
} from '../reducers/app';
import TargetFileBox from '../components/TargetFileBox';
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
import MoveOrCopyFilesDialog from '-/components/dialogs/MoveOrCopyFilesDialog';
import PlatformIO from '-/services/platform-facade';
import { Pro } from '-/pro';
import NewFileDialog from '-/components/dialogs/NewFileDialog';

const drawerWidth = 320;
const body = document.getElementsByTagName('body')[0];
const bufferedLeftSplitResize = buffer({
  timeout: 300,
  id: 'buffered-leftsplit-resize'
});

const KanBanImportDialog = Pro && Pro.UI ? Pro.UI.KanBanImportDialog : false;

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
  isNewEntryDialogOpened: boolean;
  isNewFileDialogOpened: boolean;
  isCreateDirectoryOpened: any;
  toggleCreateDirectoryDialog: () => void;
  isAboutDialogOpened: boolean;
  isLocationDialogOpened: boolean;
  isKeysDialogOpened: boolean;
  isLicenseDialogOpened: boolean;
  isThirdPartyLibsDialogOpened: boolean;
  isOnboardingDialogOpened: boolean;
  isUploadProgressDialogOpened: string | undefined;
  isProgressDialogOpened: boolean;
  isProTeaserVisible: boolean;
  toggleUploadDialog: () => void;
  toggleOpenLinkDialog: () => void;
  toggleProgressDialog: () => void;
  resetProgress: () => void;
  isEditTagDialogOpened: boolean;
  keyBindings: any;
  toggleEditTagDialog: (tag: TS.Tag) => void;
  setEntryFullWidth: (isFullWidth: boolean) => void;
  loadParentDirectoryContent: () => void;
  openLink: (linkURL: string, options?: any) => void;
  saveFile: () => void; // needed by electron-menus
  setZoomResetApp: () => void; // needed by electron-menus
  setZoomInApp: () => void; // needed by electron-menus
  setZoomOutApp: () => void; // needed by electron-menus
  toggleNewEntryDialog: () => void; // needed by electron-menus
  toggleNewFileDialog: () => void; // needed by electron-menus
  showCreateDirectoryDialog: () => void; // needed by electron-menus
  toggleSettingsDialog: () => void; // needed by electron-menus
  toggleKeysDialog: () => void; // needed by electron-menus
  toggleLicenseDialog: () => void; // needed by electron-menus
  toggleImportKanBanDialog: () => void;
  toggleThirdPartyLibsDialog: () => void; // neede by electron-menus
  toggleAboutDialog: () => void; // needed by electron-menus
  toggleLocationDialog: () => void; // needed by electron-menus
  toggleOnboardingDialog: () => void; // needed by electron-menus
  toggleProTeaser: () => void; // needed by electron-menus
  // setLastSelectedEntry: (path: string) => void; // needed by electron-menus
  setSelectedEntries: (selectedEntries: Array<Object>) => void; // needed by electron-menus
  openFsEntry: (fsEntry: TS.FileSystemEntry) => void; // needed by electron-menus
  openNextFile: (path?: string) => void; // needed by electron-menus
  openPrevFile: (path?: string) => void; // needed by electron-menus
  openLocationManagerPanel: () => void;
  openTagLibraryPanel: () => void;
  // openSearchPanel: () => void;
  openHelpFeedbackPanel: () => void;
  // closeAllVerticalPanels: () => void;
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
  loadDirectoryContent: (
    path: string,
    generateThumbnails: boolean,
    loadDirMeta?: boolean
  ) => void;
  uploadFilesAPI: (
    files: Array<File>,
    destination: string,
    onUploadProgress?: (progress: Progress, response: any) => void
  ) => any;
  onUploadProgress: (progress: Progress, response: any) => void;
  isDeleteMultipleEntriesDialogOpened: boolean;
  isImportKanBanDialogOpened: boolean;
  toggleDeleteMultipleEntriesDialog: () => void;
  selectedEntries: Array<any>;
  deleteFile: (path: string, uuid: string) => void;
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

const ProTeaserDialog = React.lazy(() =>
  import(
    /* webpackChunkName: "ProTeaserDialog" */ '../components/dialogs/ProTeaserDialog'
  )
);
function ProTeaserDialogAsync(props) {
  return (
    <React.Suspense fallback={<LoadingLazy />}>
      <ProTeaserDialog {...props} />
    </React.Suspense>
  );
}

function MainPage(props: Props) {
  const percent = useRef<number | undefined>(undefined);
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

  useEventListener('message', e => {
    if (typeof e.data === 'string') {
      // console.log(e.data);
      try {
        const data = JSON.parse(e.data);
        if (data.command === 'openLinkExternally') {
          openLink(data.link);
        }
      } catch (ex) {
        console.debug(
          'useEventListener message:' + e.data + ' parse error:',
          ex
        );
      }
    }
  });

  function goForward() {
    window.history.forward();
    window.addEventListener(
      'popstate',
      () => {
        props.openLink(window.location.href, { fullWidth: false });
      },
      { once: true }
    );
  }

  function goBack() {
    // console.log(
    //   '>>> current href: ' + decodeURIComponent(window.location.href)
    // );
    window.history.back(); // window.history.go(-1);
    window.addEventListener(
      'popstate',
      () => {
        props.openLink(window.location.href, { fullWidth: false });
        // console.log(
        //   '>>> last href: ' + decodeURIComponent(window.location.href)
        // );
      },
      { once: true }
    );
  }

  useEffect(() => {
    if (!AppConfig.isCordova) {
      updateDimensions();
    }
    listen({ ...props, goBack, goForward });
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
      .then(() => loadDirectoryContent(props.directoryPath, true, true))
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
      props.toggleUploadDialog();
      return props
        .uploadFilesAPI(files, props.directoryPath, props.onUploadProgress)
        .then(fsEntries => {
          props.reflectCreateEntries(fsEntries);
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
    showLocationManager: () => {
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
    showLocationManager: props.keyBindings.showLocationManager,
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
    toggleNewEntryDialog,
    toggleNewFileDialog,
    toggleUploadDialog,
    toggleProgressDialog,
    toggleEditTagDialog,
    toggleOpenLinkDialog,
    toggleProTeaser,
    setFirstRun,
    loadDirectoryContent,
    directoryPath,
    mainSplitSize,
    openedFiles,
    openLink,
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
          toggleProTeaser={toggleProTeaser}
          drawerOpened={drawerOpened}
          openedFiles={openedFiles}
          currentDirectoryPath={directoryPath}
          goBack={goBack}
          goForward={goForward}
          openMoveCopyFilesDialog={() =>
            setMoveCopyDialogOpened(props.selectedEntries)
          }
        />
        {isFileOpened && (
          <EntryContainer
            key="EntryContainerID"
            loadDirectoryContent={loadDirectoryContent}
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
      <MoveOrCopyFilesDialog
        open={moveCopyDialogOpened !== undefined}
        onClose={() => {
          setMoveCopyDialogOpened(undefined);
        }}
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
          onClose={(event, reason) => {
            if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
              return true;
            }
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
          onClose={() => toggleEditTagDialog(undefined)}
        />
      )}
      {props.isOpenLinkDialogOpened && (
        <OpenLinkDialogAsync
          open={props.isOpenLinkDialogOpened}
          onClose={toggleOpenLinkDialog}
          openLink={openLink}
        />
      )}
      {props.isProTeaserVisible && (
        <ProTeaserDialogAsync
          open={props.isProTeaserVisible}
          onClose={toggleProTeaser}
        />
      )}
      {props.isUploadProgressDialogOpened !== undefined && (
        <FileUploadDialog
          open={true}
          onClose={toggleUploadDialog}
          title={props.isUploadProgressDialogOpened}
        />
      )}
      {props.isProgressDialogOpened && (
        <ProgressDialog
          open={props.isProgressDialogOpened}
          onClose={toggleProgressDialog}
        />
      )}
      {props.isCreateDirectoryOpened !== null && (
        <CreateDirectoryDialog
          open={true}
          onClose={toggleCreateDirectoryDialog}
          selectedDirectoryPath={
            props.isCreateDirectoryOpened &&
            props.isCreateDirectoryOpened.rootDirPath
              ? props.isCreateDirectoryOpened.rootDirPath
              : directoryPath
          }
          callback={props.isCreateDirectoryOpened?.callback}
          reflect={props.isCreateDirectoryOpened?.reflect}
        />
      )}
      {props.isNewEntryDialogOpened && (
        <NewEntryDialog
          open={props.isNewEntryDialogOpened}
          onClose={toggleNewEntryDialog}
        />
      )}
      {props.isNewFileDialogOpened && (
        <NewFileDialog
          open={props.isNewFileDialogOpened}
          onClose={toggleNewFileDialog}
        />
      )}
      <SettingsDialog
        open={props.isSettingsDialogOpened}
        onClose={toggleSettingsDialog}
      />
      {KanBanImportDialog && props.selectedEntries[0] && (
        <KanBanImportDialog
          open={props.isImportKanBanDialogOpened}
          onClose={props.toggleImportKanBanDialog}
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
                  return props.deleteFile(fsEntry.path, fsEntry.uuid);
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
          // backgroundColor: theme.palette.background.default,
          height: '100%'
        }}
      >
        <style>
          {`
              .default-splitter {
                --default-splitter-line-margin: 2px !important;
                --default-splitter-line-size: 1px !important;
                --default-splitter-line-color: ${theme.palette.divider} !important;
              }

              .react-split .split-container.vertical .splitter {
                background-color: ${theme.palette.background.default};
              }

              .react-split .split-container {
                --react-split-splitter:3px !important;
              }
          `}
        </style>
        {props.isDesktopMode || (AppConfig.isAmplify && !props.user) ? (
          <TargetFileBox
            accepts={[FILE]}
            onDrop={(item: any) => {
              if (
                AppConfig.isElectron &&
                !PlatformIO.haveObjectStoreSupport() &&
                !PlatformIO.haveWebDavSupport()
              ) {
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
                hideDrawer={() => setDrawerOpened(false)}
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
    isNewEntryDialogOpened: isNewEntryDialogOpened(state),
    isNewFileDialogOpened: isNewFileDialogOpened(state),
    isSettingsDialogOpened: isSettingsDialogOpened(state),
    isAboutDialogOpened: isAboutDialogOpened(state),
    isLocationDialogOpened: isLocationDialogOpened(state),
    isKeysDialogOpened: isKeysDialogOpened(state),
    isOnboardingDialogOpened: isOnboardingDialogOpened(state),
    isLicenseDialogOpened: isLicenseDialogOpened(state),
    isThirdPartyLibsDialogOpened: isThirdPartyLibsDialogOpened(state),
    isUploadProgressDialogOpened: isUploadDialogOpened(state),
    isOpenLinkDialogOpened: isOpenLinkDialogOpened(state),
    isProTeaserVisible: isProTeaserVisible(state),
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
    isImportKanBanDialogOpened: isImportKanBanDialogOpened(state),
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
      openLink: AppActions.openLink,
      setZoomResetApp: SettingsActions.setZoomResetApp,
      setZoomInApp: SettingsActions.setZoomInApp,
      setZoomOutApp: SettingsActions.setZoomOutApp,
      toggleNewEntryDialog: AppActions.toggleNewEntryDialog,
      toggleNewFileDialog: AppActions.toggleNewFileDialog,
      showCreateDirectoryDialog: AppActions.showCreateDirectoryDialog,
      toggleSettingsDialog: AppActions.toggleSettingsDialog,
      toggleKeysDialog: AppActions.toggleKeysDialog,
      toggleLicenseDialog: AppActions.toggleLicenseDialog,
      toggleImportKanBanDialog: AppActions.toggleImportKanBanDialog,
      toggleThirdPartyLibsDialog: AppActions.toggleThirdPartyLibsDialog,
      toggleAboutDialog: AppActions.toggleAboutDialog,
      toggleLocationDialog: AppActions.toggleLocationDialog,
      toggleOnboardingDialog: AppActions.toggleOnboardingDialog,
      toggleOpenLinkDialog: AppActions.toggleOpenLinkDialog,
      toggleProTeaser: AppActions.toggleProTeaser,
      setSelectedEntries: AppActions.setSelectedEntries,
      // setGeneratingThumbnails: AppActions.setGeneratingThumbnails,
      openFsEntry: AppActions.openFsEntry,
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
      // closeAllVerticalPanels: AppActions.closeAllVerticalPanels,
      toggleDeleteMultipleEntriesDialog:
        AppActions.toggleDeleteMultipleEntriesDialog,
      setFirstRun: SettingsActions.setFirstRun,
      uploadFilesAPI: IOActions.uploadFilesAPI,
      deleteDirectory: AppActions.deleteDirectory,
      deleteFile: AppActions.deleteFile,
      setSearchQuery: LocationIndexActions.setSearchQuery,
      addExtensions: AppActions.addExtensions,
      addSupportedFileTypes: SettingsActions.addSupportedFileTypes
    },
    dispatch
  );
}

const areEqual = (prevProp, nextProp) =>
  /* JSON.stringify(nextProp.theme.palette) ===
    JSON.stringify(prevProp.theme.palette) && */
  nextProp.directoryPath === prevProp.directoryPath &&
  nextProp.isAboutDialogOpened === prevProp.isAboutDialogOpened &&
  JSON.stringify(nextProp.isCreateDirectoryOpened) ===
    JSON.stringify(prevProp.isCreateDirectoryOpened) &&
  nextProp.isNewEntryDialogOpened === prevProp.isNewEntryDialogOpened &&
  nextProp.isNewFileDialogOpened === prevProp.isNewFileDialogOpened &&
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
  nextProp.isProTeaserVisible === prevProp.isProTeaserVisible &&
  nextProp.isProgressDialogOpened === prevProp.isProgressDialogOpened &&
  nextProp.isReadOnlyMode === prevProp.isReadOnlyMode &&
  nextProp.isSearchPanelOpened === prevProp.isSearchPanelOpened &&
  nextProp.isSettingsDialogOpened === prevProp.isSettingsDialogOpened &&
  nextProp.isTagLibraryPanelOpened === prevProp.isTagLibraryPanelOpened &&
  nextProp.isThirdPartyLibsDialogOpened ===
    prevProp.isThirdPartyLibsDialogOpened &&
  nextProp.isUploadProgressDialogOpened ===
    prevProp.isUploadProgressDialogOpened &&
  nextProp.isImportKanBanDialogOpened === prevProp.isImportKanBanDialogOpened &&
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
