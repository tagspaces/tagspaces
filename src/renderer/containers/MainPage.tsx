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
  actions as SettingsActions,
} from '../reducers/settings';
import {
  actions as AppActions,
  isAboutDialogOpened,
  isOnboardingDialogOpened,
  isKeysDialogOpened,
  isLicenseDialogOpened,
  isThirdPartyLibsDialogOpened,
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
  isProgressOpened,
  isDeleteMultipleEntriesDialogOpened,
  isImportKanBanDialogOpened,
  currentUser,
  isLocationDialogOpened,
  isProTeaserVisible,
  isTruncatedConfirmDialogOpened,
  isNewAudioDialogOpened,
} from '../reducers/app';
import TargetFileBox from '../components/TargetFileBox';
import LoadingLazy from '../components/LoadingLazy';
import CustomDragLayer from '-/components/CustomDragLayer';
import FileUploadDialog from '-/components/dialogs/FileUploadDialog';
import ProgressDialog from '-/components/dialogs/ProgressDialog';
import useEventListener from '-/utils/useEventListener';
import ConfirmDialog from '-/components/dialogs/ConfirmDialog';
import { TS } from '-/tagspaces.namespace';
import PageNotification from '-/containers/PageNotification';
import MoveOrCopyFilesDialog from '-/components/dialogs/MoveOrCopyFilesDialog';
import { Pro } from '-/pro';
import NewFileDialog from '-/components/dialogs/NewFileDialog';
import IsTruncatedConfirmDialog from '-/components/dialogs/IsTruncatedConfirmDialog';
import { styled, useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { DescriptionContextProvider } from '-/hooks/DescriptionContextProvider';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import NewAudioDialog from '-/components/dialogs/NewAudioDialog';

const drawerWidth = 320;
const body = document.getElementsByTagName('body')[0];
const bufferedLeftSplitResize = buffer({
  timeout: 300,
  id: 'buffered-leftsplit-resize',
});

const KanBanImportDialog = Pro && Pro.UI ? Pro.UI.KanBanImportDialog : false;

const PREFIX = 'MainPage';

const classes = {
  content: `${PREFIX}-content`,
  contentShift: `${PREFIX}-contentShift`,
};

const Root = styled('div')(({ theme }) => ({
  height: '100%',
  [`& .${classes.content}`]: {
    height: '100%',
    flexGrow: 1,
    padding: 0,
    paddingLeft: drawerWidth,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  [`& .${classes.contentShift}`]: {
    height: '100%',
    padding: 0,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
}));

interface Props {
  //isFirstRun: boolean;
  setFirstRun: (isFirstRun: boolean) => void;
  isDesktopMode: boolean;
  isSettingsDialogOpened: boolean;
  isNewEntryDialogOpened: boolean;
  isNewFileDialogOpened: boolean;
  isNewAudioDialogOpened: boolean;
  isCreateDirectoryOpened: any;
  toggleCreateDirectoryDialog: () => void;
  isAboutDialogOpened: boolean;
  isLocationDialogOpened: boolean;
  isKeysDialogOpened: boolean;
  isLicenseDialogOpened: boolean;
  isThirdPartyLibsDialogOpened: boolean;
  isOnboardingDialogOpened: boolean;
  isUploadProgressDialogOpened: string | undefined;
  isTruncatedConfirmDialogOpened: boolean;
  isProgressDialogOpened: boolean;
  isProTeaserVisible: boolean;
  toggleUploadDialog: () => void;
  toggleOpenLinkDialog: () => void;
  toggleProgressDialog: () => void;
  resetProgress: () => void;
  isEditTagDialogOpened: boolean;
  keyBindings: any;
  toggleEditTagDialog: (tag: TS.Tag) => void;
  toggleNewEntryDialog: () => void; // needed by electron-menus
  toggleNewFileDialog: () => void; // needed by electron-menus
  toggleNewAudioDialog: () => void; // needed by electron-menus
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
  // setSelectedEntries: (selectedEntries: Array<Object>) => void; // needed by electron-menus
  openLocationManagerPanel: () => void;
  openTagLibraryPanel: () => void;
  // openSearchPanel: () => void;
  openHelpFeedbackPanel: () => void;
  // closeAllVerticalPanels: () => void;
  //leftSplitSize: number;
  mainSplitSize: any;
  toggleShowUnixHiddenEntries: () => void;
  toggleTruncatedConfirmDialog: () => void;
  setMainVerticalSplitSize: (splitSize: string) => void;
  isLocationManagerPanelOpened: boolean;
  isOpenLinkDialogOpened: boolean;
  isTagLibraryPanelOpened: boolean;
  isSearchPanelOpened: boolean;
  isHelpFeedbackPanelOpened: boolean;
  onUploadProgress: (progress: Progress, response: any) => void;
  isDeleteMultipleEntriesDialogOpened: boolean;
  isImportKanBanDialogOpened: boolean;
  toggleDeleteMultipleEntriesDialog: () => void;
  user: CognitoUserInterface;
}

const CreateEditLocationDialog = React.lazy(
  () =>
    import(
      /* webpackChunkName: "CreateEditLocationDialog" */ '../components/dialogs/CreateEditLocationDialog'
    ),
);
function CreateEditLocationDialogAsync(props) {
  return (
    <React.Suspense fallback={<LoadingLazy />}>
      <CreateEditLocationDialog {...props} />
    </React.Suspense>
  );
}

const AboutDialog = React.lazy(
  () =>
    import(
      /* webpackChunkName: "AboutDialog" */ '../components/dialogs/AboutDialog'
    ),
);
function AboutDialogAsync(props) {
  return (
    <React.Suspense fallback={<LoadingLazy />}>
      <AboutDialog {...props} />
    </React.Suspense>
  );
}

const LicenseDialog = React.lazy(
  () =>
    import(
      /* webpackChunkName: "LicenseDialog" */ '../components/dialogs/LicenseDialog'
    ),
);
function LicenseDialogAsync(props) {
  return (
    <React.Suspense fallback={<LoadingLazy />}>
      <LicenseDialog {...props} />
    </React.Suspense>
  );
}

const KeyboardDialog = React.lazy(
  () =>
    import(
      /* webpackChunkName: "KeyboardDialog" */ '../components/dialogs/KeyboardDialog'
    ),
);
function KeyboardDialogAsync(props) {
  return (
    <React.Suspense fallback={<LoadingLazy />}>
      <KeyboardDialog {...props} />
    </React.Suspense>
  );
}

const ThirdPartyLibsDialog = React.lazy(
  () =>
    import(
      /* webpackChunkName: "ThirdPartyLibsDialog" */ '../components/dialogs/ThirdPartyLibsDialog'
    ),
);
function ThirdPartyLibsDialogAsync(props) {
  return (
    <React.Suspense fallback={<LoadingLazy />}>
      <ThirdPartyLibsDialog {...props} />
    </React.Suspense>
  );
}

const OnboardingDialog = React.lazy(
  () =>
    import(
      /* webpackChunkName: "OnboardingDialog" */ '../components/dialogs/OnboardingDialog'
    ),
);
function OnboardingDialogAsync(props) {
  return (
    <React.Suspense fallback={<LoadingLazy />}>
      <OnboardingDialog {...props} />
    </React.Suspense>
  );
}

const EditEntryTagDialog = React.lazy(
  () =>
    import(
      /* webpackChunkName: "EditEntryTagDialog" */ '../components/dialogs/EditEntryTagDialog'
    ),
);
function EditEntryTagDialogAsync(props) {
  return (
    <React.Suspense fallback={<LoadingLazy />}>
      <EditEntryTagDialog {...props} />
    </React.Suspense>
  );
}

const OpenLinkDialog = React.lazy(
  () =>
    import(
      /* webpackChunkName: "OpenLinkDialog" */ '../components/dialogs/OpenLinkDialog'
    ),
);
function OpenLinkDialogAsync(props) {
  return (
    <React.Suspense fallback={<LoadingLazy />}>
      <OpenLinkDialog {...props} />
    </React.Suspense>
  );
}

const ProTeaserDialog = React.lazy(
  () =>
    import(
      /* webpackChunkName: "ProTeaserDialog" */ '../components/dialogs/ProTeaserDialog'
    ),
);
function ProTeaserDialogAsync(props) {
  return (
    <React.Suspense fallback={<LoadingLazy />}>
      <ProTeaserDialog {...props} />
    </React.Suspense>
  );
}

function MainPage(props: Props) {
  const { t } = useTranslation();
  const { deleteEntries } = useIOActionsContext();
  const { selectedEntries } = useSelectedEntriesContext();
  const {
    openLink,
    openedEntry,
    isEntryInFullWidth,
    goForward,
    goBack,
    setEntryInFullWidth,
  } = useOpenedEntryContext();

  const {
    loadParentDirectoryContent,
    enterSearchMode,
    exitSearchMode,
    openCurrentDirectory,
  } = useDirectoryContentContext();
  const { showNotification } = useNotificationContext();
  const theme = useTheme();
  const percent = useRef<number | undefined>(undefined);
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

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
    height,
  });

  const [drawerOpened, setDrawerOpened] = useState<boolean>(true);
  const [moveCopyDialogOpened, setMoveCopyDialogOpened] =
    useState<any>(undefined);

  useEventListener('message', (e) => {
    if (typeof e.data === 'string') {
      // console.log(e.data);
      try {
        const data = JSON.parse(e.data);
        if (data.command === 'openLinkExternally') {
          openLink(data.link, { fullWidth: false });
        }
      } catch (ex) {
        console.debug(
          'useEventListener message:' + e.data + ' parse error:',
          ex,
        );
      }
    }
  });

  useEffect(() => {
    if (!AppConfig.isCordova) {
      updateDimensions();
    }
    /*listen({
      ...props,
      goBack,
      goForward,
      openFsEntry,
      openNextFile,
      openPrevFile,
      setSearchQuery,
    });*/
  }, []);

  useEffect(() => {
    // setPercent(undefined);
    if (isEntryInFullWidth) {
      setDrawerOpened(false); // !props.isEntryInFullWidth);
    }
  }, [isEntryInFullWidth]);

  useEffect(() => {
    updateDimensions();
  }, [openedEntry]);

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

    if (openedEntry && !isEntryInFullWidth) {
      const isFillWidth = h > w;
      if (isFillWidth !== isEntryInFullWidth) {
        setEntryInFullWidth(isFillWidth);
      }
    }
  };

  const toggleDrawer = () => {
    setDrawerOpened((prevOpen) => !prevOpen);
  };

  const keyBindingHandlers = {
    openParentDirectory: loadParentDirectoryContent,
    toggleShowHiddenEntries: props.toggleShowUnixHiddenEntries,
    showLocationManager: () => {
      props.openLocationManagerPanel();
      setDrawerOpened(true);
    },
    showTagLibrary: () => {
      props.openTagLibraryPanel();
      setDrawerOpened(true);
    },
    openSearch: () => enterSearchMode(),
    closeSearch: () => {
      exitSearchMode();
      openCurrentDirectory();
    },
    showHelp: () => {
      props.openHelpFeedbackPanel();
      setDrawerOpened(true);
    },
  };

  const keyMap = {
    openParentDirectory: props.keyBindings.openParentDirectory,
    toggleShowHiddenEntries: props.keyBindings.toggleShowHiddenEntries,
    showLocationManager: props.keyBindings.showLocationManager,
    showTagLibrary: props.keyBindings.showTagLibrary,
    openSearch: props.keyBindings.openSearch,
    closeSearch: props.keyBindings.Escape,
    showHelp: props.keyBindings.showHelp,
  };

  const {
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
    toggleNewAudioDialog,
    toggleUploadDialog,
    toggleProgressDialog,
    toggleEditTagDialog,
    toggleOpenLinkDialog,
    toggleProTeaser,
    setFirstRun,
    isDesktopMode,
    mainSplitSize,
  } = props;

  const { FILE } = NativeTypes;

  const setPercent = (p: number | undefined) => {
    percent.current = p;
    if (p !== undefined) {
      bufferedLeftSplitResize(() => {
        if (mainSplitSize !== p + '%') {
          props.setMainVerticalSplitSize(p + '%');
        }
      });
    }
    forceUpdate();
  };

  function renderContainers() {
    let initialPrimarySize = mainSplitSize;
    let minPrimarySize = '250px';
    let minSecondarySize = '250px';
    let renderSplitter;

    if (!openedEntry) {
      percent.current = undefined;
      initialPrimarySize = '100%';
      minSecondarySize = '0%';
      renderSplitter = function () {
        return null;
      };
    }
    if (isEntryInFullWidth) {
      percent.current = undefined;
      initialPrimarySize = '0%';
      minPrimarySize = '0%';
      renderSplitter = function () {
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
          toggleDrawer={toggleDrawer}
          toggleProTeaser={toggleProTeaser}
          drawerOpened={drawerOpened}
          goBack={goBack}
          goForward={goForward}
          /*openMoveCopyFilesDialog={() =>
            setMoveCopyDialogOpened(props.selectedEntries)
          }*/
        />
        {openedEntry && (
          <DescriptionContextProvider>
            <EntryContainer key="EntryContainerID" />
          </DescriptionContextProvider>
        )}
      </Split>
    );
  }

  return (
    <Root>
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
        {props.isTruncatedConfirmDialogOpened && (
          <IsTruncatedConfirmDialog
            open={true}
            onClose={props.toggleTruncatedConfirmDialog}
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
            selectedDirectoryPath={props.isCreateDirectoryOpened?.rootDirPath}
            callback={props.isCreateDirectoryOpened?.callback}
          />
        )}
        <NewEntryDialog
          open={props.isNewEntryDialogOpened}
          onClose={(event, reason) => {
            if (reason !== 'backdropClick') {
              toggleNewEntryDialog();
            }
          }}
        />
        {props.isNewFileDialogOpened && (
          <NewFileDialog
            open={props.isNewFileDialogOpened}
            onClose={(event, reason) => {
              if (reason !== 'backdropClick') {
                toggleNewFileDialog();
              }
            }}
          />
        )}
        {props.isNewAudioDialogOpened && (
          <NewAudioDialog
            open={props.isNewAudioDialogOpened}
            onClose={toggleNewAudioDialog}
          />
        )}
        <SettingsDialog
          open={props.isSettingsDialogOpened}
          onClose={toggleSettingsDialog}
        />
        {KanBanImportDialog && selectedEntries[0] && (
          <KanBanImportDialog
            open={props.isImportKanBanDialogOpened}
            onClose={props.toggleImportKanBanDialog}
          />
        )}
        {props.isDeleteMultipleEntriesDialogOpened && (
          <ConfirmDialog
            open={props.isDeleteMultipleEntriesDialogOpened}
            onClose={() => props.toggleDeleteMultipleEntriesDialog()}
            title={t('core:deleteConfirmationTitle')}
            content={t('core:deleteConfirmationContent')}
            list={selectedEntries.map((fsEntry) => fsEntry.name)}
            confirmCallback={(result) => {
              if (result && selectedEntries) {
                deleteEntries(...selectedEntries).then(
                  (success) =>
                    success &&
                    selectedEntries.length > 1 &&
                    showNotification(
                      t('core:deletingEntriesSuccessful', {
                        dirPath: selectedEntries
                          .map((fsEntry) => fsEntry.name)
                          .toString(),
                      }),
                      'default',
                      true,
                    ),
                );
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
            height: '100%',
          }}
        >
          <style>
            {`
              body { background-color: ${
                theme.palette.background.default
              } !important;}
              .default-splitter {
                --default-splitter-line-margin: 2px !important;
                --default-splitter-line-size: 1px !important;
                --default-splitter-line-color: ${
                  theme.palette.divider
                } !important;
              }

              .react-split .split-container.vertical .splitter {
                background-color: ${theme.palette.background.default};
              }

              .react-split .split-container {
                --react-split-splitter: ${
                  !openedEntry || isEntryInFullWidth ? '0' : '3px'
                } !important;
              }
              .react-split .secondary .full-content {
                display: flex;
                flex-direction: column;
              }
          `}
          </style>
          {isDesktopMode || (AppConfig.isAmplify && !props.user) ? (
            <TargetFileBox
              accepts={[FILE]}
              setMoveCopyDialogOpened={setMoveCopyDialogOpened}
            >
              <CustomDragLayer />
              <Drawer variant="persistent" anchor="left" open={drawerOpened}>
                <MobileNavigation width={drawerWidth} />
              </Drawer>
              <main
                className={clsx(classes.content, {
                  [classes.contentShift]: !drawerOpened,
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
                disableDiscovery={AppConfig.isIOS}
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
    </Root>
  );
}

function mapStateToProps(state) {
  return {
    isEditTagDialogOpened: isEditTagDialogOpened(state),
    isCreateDirectoryOpened: isCreateDirectoryOpened(state),
    isNewEntryDialogOpened: isNewEntryDialogOpened(state),
    isNewFileDialogOpened: isNewFileDialogOpened(state),
    isNewAudioDialogOpened: isNewAudioDialogOpened(state),
    isSettingsDialogOpened: isSettingsDialogOpened(state),
    isAboutDialogOpened: isAboutDialogOpened(state),
    isLocationDialogOpened: isLocationDialogOpened(state),
    isKeysDialogOpened: isKeysDialogOpened(state),
    isOnboardingDialogOpened: isOnboardingDialogOpened(state),
    isLicenseDialogOpened: isLicenseDialogOpened(state),
    isThirdPartyLibsDialogOpened: isThirdPartyLibsDialogOpened(state),
    isUploadProgressDialogOpened: isUploadDialogOpened(state),
    isTruncatedConfirmDialogOpened: isTruncatedConfirmDialogOpened(state),
    isOpenLinkDialogOpened: isOpenLinkDialogOpened(state),
    isProTeaserVisible: isProTeaserVisible(state),
    isProgressDialogOpened: isProgressOpened(state),
    isDesktopMode: getDesktopMode(state),
    keyBindings: getKeyBindingObject(state),
    mainSplitSize: getMainVerticalSplitSize(state),
    isLocationManagerPanelOpened: isLocationManagerPanelOpened(state),
    isTagLibraryPanelOpened: isTagLibraryPanelOpened(state),
    isSearchPanelOpened: isSearchPanelOpened(state),
    isHelpFeedbackPanelOpened: isHelpFeedbackPanelOpened(state),
    isDeleteMultipleEntriesDialogOpened:
      isDeleteMultipleEntriesDialogOpened(state),
    isImportKanBanDialogOpened: isImportKanBanDialogOpened(state),
    user: currentUser(state),
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      toggleCreateDirectoryDialog: AppActions.toggleCreateDirectoryDialog,
      toggleUploadDialog: AppActions.toggleUploadDialog,
      toggleProgressDialog: AppActions.toggleProgressDialog,
      resetProgress: AppActions.resetProgress,
      toggleEditTagDialog: AppActions.toggleEditTagDialog,
      toggleTruncatedConfirmDialog: AppActions.toggleTruncatedConfirmDialog,
      onUploadProgress: AppActions.onUploadProgress,
      toggleNewEntryDialog: AppActions.toggleNewEntryDialog,
      toggleNewFileDialog: AppActions.toggleNewFileDialog,
      toggleNewAudioDialog: AppActions.toggleNewAudioDialog,
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
      toggleShowUnixHiddenEntries: SettingsActions.toggleShowUnixHiddenEntries,
      setMainVerticalSplitSize: SettingsActions.setMainVerticalSplitSize,
      openLocationManagerPanel: AppActions.openLocationManagerPanel,
      openTagLibraryPanel: AppActions.openTagLibraryPanel,
      // openSearchPanel: AppActions.openSearchPanel,
      openHelpFeedbackPanel: AppActions.openHelpFeedbackPanel,
      // closeAllVerticalPanels: AppActions.closeAllVerticalPanels,
      toggleDeleteMultipleEntriesDialog:
        AppActions.toggleDeleteMultipleEntriesDialog,
      setFirstRun: SettingsActions.setFirstRun,
    },
    dispatch,
  );
}

const areEqual = (prevProp, nextProp) =>
  /* JSON.stringify(nextProp.theme.palette) ===
    JSON.stringify(prevProp.theme.palette) && */
  nextProp.isAboutDialogOpened === prevProp.isAboutDialogOpened &&
  JSON.stringify(nextProp.isCreateDirectoryOpened) ===
    JSON.stringify(prevProp.isCreateDirectoryOpened) &&
  nextProp.isNewEntryDialogOpened === prevProp.isNewEntryDialogOpened &&
  nextProp.isNewFileDialogOpened === prevProp.isNewFileDialogOpened &&
  nextProp.isNewAudioDialogOpened === prevProp.isNewAudioDialogOpened &&
  nextProp.isDeleteMultipleEntriesDialogOpened ===
    prevProp.isDeleteMultipleEntriesDialogOpened &&
  nextProp.isDesktopMode === prevProp.isDesktopMode &&
  nextProp.isEditTagDialogOpened === prevProp.isEditTagDialogOpened &&
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
  nextProp.isSearchPanelOpened === prevProp.isSearchPanelOpened &&
  nextProp.isSettingsDialogOpened === prevProp.isSettingsDialogOpened &&
  nextProp.isTagLibraryPanelOpened === prevProp.isTagLibraryPanelOpened &&
  nextProp.isTruncatedConfirmDialogOpened ===
    prevProp.isTruncatedConfirmDialogOpened &&
  nextProp.isThirdPartyLibsDialogOpened ===
    prevProp.isThirdPartyLibsDialogOpened &&
  nextProp.isUploadProgressDialogOpened ===
    prevProp.isUploadProgressDialogOpened &&
  nextProp.isImportKanBanDialogOpened === prevProp.isImportKanBanDialogOpened &&
  nextProp.mainSplitSize === prevProp.mainSplitSize;

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(React.memo(MainPage, areEqual));
