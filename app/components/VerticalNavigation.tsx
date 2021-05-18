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

import React, { useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import uuidv1 from 'uuid';
import IconButton from '@material-ui/core/IconButton';
import NewFileIcon from '@material-ui/icons/Add';
import LocationsIcon from '@material-ui/icons/WorkOutline';
import TagLibraryIcon from '@material-ui/icons/LocalOfferOutlined';
import SearchIcon from '@material-ui/icons/SearchOutlined';
// import PerspectivesIcon from '@material-ui/icons/MapOutlined';
import SettingsIcon from '@material-ui/icons/Settings';
import ThemingIcon from '@material-ui/icons/InvertColors';
import UpgradeIcon from '@material-ui/icons/FlightTakeoff';
import HelpIcon from '@material-ui/icons/HelpOutline';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import { withStyles } from '@material-ui/core/styles';
import SplitPane from 'react-split-pane';
import { CircularProgress, Typography } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import { CognitoUserInterface } from '@aws-amplify/ui-components';
import LogoIcon from '../assets/images/icon100x100.svg';
import TagLibrary from '../components/TagLibrary';
import Search from '../components/Search';
import LocationManager from '../components/LocationManager';
import HelpFeedbackPanel from '../components/HelpFeedbackPanel';
import i18n from '../services/i18n';
import { Pro } from '../pro';
import {
  actions as AppActions,
  getDirectoryPath,
  isSettingsDialogOpened,
  isLocationManagerPanelOpened,
  isTagLibraryPanelOpened as isTagLibraryOpened,
  isSearchPanelOpened as isSearchOpened,
  isPerspectivesPanelOpened as isPerspectivesOpened,
  isHelpFeedbackPanelOpened as isHelpFeedbackOpened,
  isReadOnlyMode,
  getProgress,
  currentUser
} from '../reducers/app';
import { actions as SettingsActions, isFirstRun } from '../reducers/settings';
import LoadingLazy from './LoadingLazy';
import AppConfig from '-/config';

const ProTeaserDialog = React.lazy(() =>
  import(/* webpackChunkName: "ProTeaserDialog" */ './dialogs/ProTeaserDialog')
);
const ProTeaserDialogAsync = props => (
  <React.Suspense fallback={<LoadingLazy />}>
    <ProTeaserDialog {...props} />
  </React.Suspense>
);

const styles: any = (theme: any) => ({
  panel: {
    height: '100%',
    backgroundColor: AppConfig.sidebarColor
  },
  buttonIcon: {
    width: 28,
    height: 28,
    color: '#d6d6d6'
  },
  button: {
    padding: 8,
    width: 44,
    height: 44
  },
  selectedButton: {
    borderRadius: 0,
    backgroundColor: AppConfig.sidebarSelectionColor
  },
  settingsButton: {
    position: 'absolute',
    bottom: 0,
    left: 0
  },
  themingButton: {
    position: 'absolute',
    bottom: 45,
    left: 0
  },
  upgradeButton: {
    position: 'absolute',
    bottom: 90,
    left: 0
  }
});

interface Props {
  classes: any;
  theme: any;
  isFirstRun: boolean;
  directoryPath: string;
  setFirstRun: (isFirstRun: boolean) => void;
  toggleOnboardingDialog: () => void;
  toggleCreateFileDialog: () => void;
  toggleAboutDialog: () => void;
  toggleKeysDialog: () => void;
  toggleSettingsDialog: () => void;
  toggleUploadDialog: () => void;
  isSettingsDialogOpened: () => void;
  isLocationManagerPanelOpened: boolean;
  openLocationManagerPanel: () => void;
  isTagLibraryPanelOpened: boolean;
  openTagLibraryPanel: () => void;
  isSearchPanelOpened: boolean;
  openSearchPanel: () => void;
  isPerspectivesPanelOpened: boolean;
  // openPerspectivesPanel: () => void,
  isHelpFeedbackPanelOpened: boolean;
  openHelpFeedbackPanel: () => void;
  closeAllVerticalPanels: () => void;
  openURLExternally: (url: string) => void;
  switchTheme: () => void;
  showNotification: (message: string) => void;
  isReadOnlyMode: boolean;
  progress?: Array<any>;
  user: CognitoUserInterface;
}

const VerticalNavigation = (props: Props) => {
  const [isProTeaserVisible, setIsProTeaserVisible] = useState<boolean>(false);

  const toggleProTeaser = () => {
    setIsProTeaserVisible(!isProTeaserVisible);
  };

  const getProgressValue = () => {
    const objProgress = props.progress.find(
      fileProgress => fileProgress.progress < 100 && fileProgress.progress > -1
    );
    if (objProgress !== undefined) {
      return objProgress.progress;
    }
    return 100;
  };

  const {
    classes,
    isTagLibraryPanelOpened,
    isSearchPanelOpened,
    isHelpFeedbackPanelOpened,
    toggleCreateFileDialog,
    toggleAboutDialog,
    toggleOnboardingDialog,
    toggleSettingsDialog,
    toggleKeysDialog,
    openLocationManagerPanel,
    openTagLibraryPanel,
    openSearchPanel,
    openHelpFeedbackPanel,
    closeAllVerticalPanels,
    switchTheme,
    openURLExternally,
    showNotification,
    directoryPath,
    theme,
    user
  } = props;
  return (
    <div>
      <style>
        {`
            #verticalNavButton:hover {
              border-radius: 0;
              background-color: ${AppConfig.sidebarSelectionColor}
            }
          `}
      </style>
      {isProTeaserVisible && (
        <ProTeaserDialogAsync
          open={isProTeaserVisible}
          onClose={toggleProTeaser}
          openURLExternally={openURLExternally}
          key={uuidv1()}
        />
      )}
      <SplitPane
        split="vertical"
        minSize={44}
        maxSize={44}
        defaultSize={44}
        resizerStyle={{ backgroundColor: theme.palette.divider }}
      >
        <div className={classes.panel}>
          <IconButton
            onClick={toggleAboutDialog}
            className={classes.button}
            style={{ marginTop: 10, marginBottom: 16 }}
            title={i18n.t('core:aboutTitle')}
            data-tid="aboutTagSpaces"
          >
            <img
              className={classes.buttonIcon}
              style={{
                color: props.theme.palette.text.primary
              }}
              src={LogoIcon}
              alt="TagSpaces Logo"
            />
          </IconButton>
          <IconButton
            id="verticalNavButton"
            onClick={() => {
              if (props.isReadOnlyMode || !directoryPath) {
                showNotification(
                  'You are in read-only mode or there is no opened location'
                );
              } else {
                toggleCreateFileDialog();
              }
            }}
            className={classes.button}
            style={{ marginBottom: 20 }}
            title={i18n.t('core:createFileTitle')}
            data-tid="locationManager"
          >
            <NewFileIcon className={classes.buttonIcon} />
          </IconButton>
          <IconButton
            id="verticalNavButton"
            onClick={() => {
              if (props.isLocationManagerPanelOpened) {
                closeAllVerticalPanels();
              } else {
                openLocationManagerPanel();
              }
            }}
            className={
              props.isLocationManagerPanelOpened
                ? [classes.button, classes.selectedButton].join(' ')
                : classes.button
            }
            title={i18n.t('core:locationManager')}
            data-tid="locationManagerPanel"
          >
            <LocationsIcon className={classes.buttonIcon} />
          </IconButton>
          <IconButton
            id="verticalNavButton"
            title={i18n.t('core:tagGroupOperations')}
            data-tid="tagLibrary"
            onClick={() => {
              if (isTagLibraryPanelOpened) {
                closeAllVerticalPanels();
              } else {
                openTagLibraryPanel();
              }
            }}
            className={
              isTagLibraryPanelOpened
                ? [classes.button, classes.selectedButton].join(' ')
                : classes.button
            }
          >
            <TagLibraryIcon className={classes.buttonIcon} />
          </IconButton>
          <IconButton
            id="verticalNavButton"
            title={i18n.t('core:searchTitle')}
            data-tid="search"
            onClick={() => {
              if (isSearchPanelOpened) {
                closeAllVerticalPanels();
              } else {
                openSearchPanel();
              }
            }}
            className={
              isSearchPanelOpened
                ? [classes.button, classes.selectedButton].join(' ')
                : classes.button
            }
          >
            <SearchIcon className={classes.buttonIcon} />
          </IconButton>
          {/* <IconButton
              title={i18n.t('core:perspectiveManager')}
              data-tid="perspectiveManager"
              onClick={() => {
                if (isPerspectivePanelOpened) {
                  closeAllVerticalPanels();
                } else {
                  openPerspectivesPanel();
                }
              }}
              disabled={false}
              style={
                isPerspectivePanelOpened
                  ? { ...classes.button, ...classes.selectedButton }
                  : classes.button
              }
            >
              <PerspectivesIcon style={classes.buttonIcon} />
            </IconButton> */}
          <IconButton
            id="verticalNavButton"
            title={i18n.t('core:helpFeedback')}
            data-tid="helpFeedback"
            onClick={() => {
              if (isHelpFeedbackPanelOpened) {
                closeAllVerticalPanels();
              } else {
                openHelpFeedbackPanel();
              }
            }}
            className={
              isHelpFeedbackPanelOpened
                ? [classes.button, classes.selectedButton].join(' ')
                : classes.button
            }
          >
            {user ? (
              <AccountCircleIcon className={classes.buttonIcon} />
            ) : (
              <HelpIcon className={classes.buttonIcon} />
            )}
          </IconButton>
          {!Pro && (
            <IconButton
              id="verticalNavButton"
              title={i18n.t('core:upgradeToPro')}
              data-tid="upgradeToPro"
              onClick={toggleProTeaser}
              // @ts-ignore
              className={[classes.button, classes.upgradeButton].join(' ')}
            >
              <UpgradeIcon className={classes.buttonIcon} />
            </IconButton>
          )}
          {props.progress && props.progress.length > 0 && (
            <IconButton
              id="progressButton"
              title={i18n.t('core:progress')}
              data-tid="uploadProgress"
              onClick={() => props.toggleUploadDialog()}
              // @ts-ignore
              className={[classes.button, classes.upgradeButton].join(' ')}
            >
              <CircularProgressWithLabel value={getProgressValue()} />
            </IconButton>
          )}
          <IconButton
            id="verticalNavButton"
            title={i18n.t('core:switchTheme')}
            data-tid="switchTheme"
            onClick={switchTheme}
            className={[classes.button, classes.themingButton].join(' ')}
          >
            <ThemingIcon className={classes.buttonIcon} />
          </IconButton>
          <IconButton
            id="verticalNavButton"
            title={i18n.t('core:settings')}
            data-tid="settings"
            onClick={toggleSettingsDialog}
            // @ts-ignore
            className={
              props.isSettingsDialogOpened
                ? [
                    classes.button,
                    classes.settingsButton,
                    classes.selectedButton
                  ].join(' ')
                : [classes.button, classes.settingsButton].join(' ')
            }
          >
            <SettingsIcon className={classes.buttonIcon} />
          </IconButton>
        </div>
        <div className={classes.panel}>
          {props.isLocationManagerPanelOpened && <LocationManager />}
          {isTagLibraryPanelOpened && <TagLibrary />}
          {isSearchPanelOpened && <Search />}
          {isHelpFeedbackPanelOpened && (
            <HelpFeedbackPanel
              openURLExternally={openURLExternally}
              toggleAboutDialog={toggleAboutDialog}
              toggleKeysDialog={toggleKeysDialog}
              toggleOnboardingDialog={toggleOnboardingDialog}
              toggleProTeaser={toggleProTeaser}
            />
          )}
        </div>
      </SplitPane>
    </div>
  );
};

function CircularProgressWithLabel(prop) {
  return (
    <Box position="relative" display="inline-flex">
      <CircularProgress variant="static" {...prop} />
      <Box
        top={0}
        left={0}
        bottom={0}
        right={0}
        position="absolute"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography
          variant="caption"
          component="div"
          style={{ color: 'white' }}
        >
          {`${prop.value}%`}
        </Typography>
      </Box>
    </Box>
  );
}

function mapStateToProps(state) {
  return {
    isFirstRun: isFirstRun(state),
    isSettingsDialogOpened: isSettingsDialogOpened(state),
    isLocationManagerPanelOpened: isLocationManagerPanelOpened(state),
    isTagLibraryPanelOpened: isTagLibraryOpened(state),
    isSearchPanelOpened: isSearchOpened(state),
    isPerspectivesPanelOpened: isPerspectivesOpened(state),
    isHelpFeedbackPanelOpened: isHelpFeedbackOpened(state),
    isReadOnlyMode: isReadOnlyMode(state),
    directoryPath: getDirectoryPath(state),
    progress: getProgress(state),
    user: currentUser(state)
  };
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(
    {
      toggleUploadDialog: AppActions.toggleUploadDialog,
      toggleCreateFileDialog: AppActions.toggleCreateFileDialog,
      toggleOnboardingDialog: AppActions.toggleOnboardingDialog,
      toggleSettingsDialog: AppActions.toggleSettingsDialog,
      toggleAboutDialog: AppActions.toggleAboutDialog,
      toggleKeysDialog: AppActions.toggleKeysDialog,
      openLocationManagerPanel: AppActions.openLocationManagerPanel,
      openTagLibraryPanel: AppActions.openTagLibraryPanel,
      openSearchPanel: AppActions.openSearchPanel,
      openPerspectivesPanel: AppActions.openPerspectivesPanel,
      openHelpFeedbackPanel: AppActions.openHelpFeedbackPanel,
      openURLExternally: AppActions.openURLExternally,
      closeAllVerticalPanels: AppActions.closeAllVerticalPanels,
      showNotification: AppActions.showNotification,
      switchTheme: SettingsActions.switchTheme,
      setFirstRun: SettingsActions.setFirstRun
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapActionCreatorsToProps
)(withStyles(styles, { withTheme: true })(VerticalNavigation));
