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
import { withTheme } from '@material-ui/core/styles';
import SplitPane from 'react-split-pane';
import LogoIcon from '../assets/images/icon100x100.svg';
import SettingsDialog from './dialogs/settings/SettingsDialog';
import CreateDirectoryDialog from './dialogs/CreateDirectoryDialog';
import CreateFileDialog from './dialogs/CreateFileDialog';
// import SelectDirectoryDialog from './dialogs/SelectDirectoryDialog';
import TagLibrary from '../components/TagLibrary';
import Search from '../components/Search';
import PerspectiveManager from '../components/PerspectiveManager';
import LocationManager from '../components/LocationManager';
import HelpFeedbackPanel from '../components/HelpFeedbackPanel';
import i18n from '../services/i18n';
import { Pro } from '../pro';
import { type Tag } from '../reducers/taglibrary';
import {
  actions as AppActions,
  getDirectoryPath,
  isEditTagDialogOpened,
  isAboutDialogOpened,
  isOnboardingDialogOpened,
  isKeysDialogOpened,
  isLicenseDialogOpened,
  isThirdPartyLibsDialogOpened,
  isSettingsDialogOpened,
  isCreateFileDialogOpened,
  isCreateDirectoryOpened,
  isSelectDirectoryDialogOpened,
  isLocationManagerPanelOpened,
  isTagLibraryPanelOpened,
  isSearchPanelOpened,
  isPerspectivesPanelOpened,
  isHelpFeedbackPanelOpened,
  isReadOnlyMode,
} from '../reducers/app';
import { actions as SettingsActions, isFirstRun } from '../reducers/settings';
import LoadingLazy from './LoadingLazy';

const EditEntryTagDialog = React.lazy(() => import(/* webpackChunkName: "EditEntryTagDialog" */ './dialogs/EditEntryTagDialog'));
const EditEntryTagDialogAsync = props => (
  <React.Suspense fallback={<LoadingLazy />}>
    <EditEntryTagDialog {...props} />
  </React.Suspense>
);

const LicenseDialog = React.lazy(() => import(/* webpackChunkName: "LicenseDialog" */ './dialogs/LicenseDialog'));
const LicenseDialogAsync = props => (
  <React.Suspense fallback={<LoadingLazy />}>
    <LicenseDialog {...props} />
  </React.Suspense>
);

const SelectDirectoryDialog = React.lazy(() => import(/* webpackChunkName: "LicenseDialog" */ './dialogs/SelectDirectoryDialog'));
const SelectDirectoryAsync = props => (
  <React.Suspense fallback={<LoadingLazy />}>
    <SelectDirectoryDialog {...props} />
  </React.Suspense>
);

const AboutDialog = React.lazy(() => import(/* webpackChunkName: "AboutDialog" */ './dialogs/AboutDialog'));
const AboutDialogAsync = props => (
  <React.Suspense fallback={<LoadingLazy />}>
    <AboutDialog {...props} />
  </React.Suspense>
);

const KeyboardDialog = React.lazy(() => import(/* webpackChunkName: "KeyboardDialog" */ './dialogs/KeyboardDialog'));
const KeyboardDialogAsync = props => (
  <React.Suspense fallback={<LoadingLazy />}>
    <KeyboardDialog {...props} />
  </React.Suspense>
);

// const SettingsDialog = React.lazy(() => import(/* webpackChunkName: "SettingsDialog" */ './dialogs/SettingsDialog'));
// const SettingsDialogAsync = props => (
//   <React.Suspense fallback={<LoadingLazy />}>
//     <SettingsDialog {...props} />
//   </React.Suspense>
// );

const ProTeaserDialog = React.lazy(() => import(/* webpackChunkName: "ProTeaserDialog" */ './dialogs/ProTeaserDialog'));
const ProTeaserDialogAsync = props => (
  <React.Suspense fallback={<LoadingLazy />}>
    <ProTeaserDialog {...props} />
  </React.Suspense>
);

const ThirdPartyLibsDialog = React.lazy(() => import(/* webpackChunkName: "ThirdPartyLibsDialog" */ './dialogs/ThirdPartyLibsDialog'));
const ThirdPartyLibsDialogAsync = props => (
  <React.Suspense fallback={<LoadingLazy />}>
    <ThirdPartyLibsDialog {...props} />
  </React.Suspense>
);

const OnboardingDialog = React.lazy(() => import(/* webpackChunkName: "OnboardingDialog" */ './dialogs/OnboardingDialog'));
const OnboardingDialogAsync = props => (
  <React.Suspense fallback={<LoadingLazy />}>
    <OnboardingDialog {...props} />
  </React.Suspense>
);

type Props = {
  isFirstRun: boolean,
  setFirstRun: (isFirstRun: boolean) => void,
  isOnboardingDialogOpened: boolean,
  toggleOnboardingDialog: () => void,
  isEditTagDialogOpened: boolean,
  toggleEditTagDialog: () => void,
  currentEntryPath: string,
  selectedTag: Tag,
  isAboutDialogOpened: boolean,
  toggleAboutDialog: () => void,
  isCreateDirectoryOpened: boolean,
  toggleCreateDirectoryDialog: () => void,
  isCreateFileDialogOpened: boolean,
  toggleCreateFileDialog: () => void,
  isKeysDialogOpened: boolean,
  toggleKeysDialog: () => void,
  isLicenseDialogOpened: boolean,
  toggleLicenseDialog: () => void,
  isThirdPartyLibsDialogOpened: boolean,
  toggleThirdPartyLibsDialog: () => void,
  isSettingsDialogOpened: boolean,
  toggleSettingsDialog: () => void,
  setManagementPanelVisibility: boolean => void,
  isSelectDirectoryDialogOpened: boolean,
  toggleSelectDirectoryDialog: () => void,
  isLocationManagerPanelOpened: boolean,
  openLocationManagerPanel: () => void,
  isTagLibraryPanelOpened: boolean,
  openTagLibraryPanel: () => void,
  isSearchPanelOpened: boolean,
  openSearchPanel: () => void,
  isPerspectivesPanelOpened: boolean,
  openPerspectivesPanel: () => void,
  isHelpFeedbackPanelOpened: boolean,
  openHelpFeedbackPanel: () => void,
  closeAllVerticalPanels: () => void,
  openFileNatively: (url: string) => void,
  switchTheme: () => void,
  shouldTogglePanel: string,
  currentDirectory: string,
  isReadOnlyMode: boolean
};

type State = {
  selectedDirectoryPath?: string,
  isManagementPanelVisible?: boolean, // evtl. redux migration
  CreateFileDialogKey: string,
  isProTeaserVisible: boolean
};

class VerticalNavigation extends React.Component<Props, State> {
  state = {
    isManagementPanelVisible: true,
    CreateFileDialogKey: uuidv1(),
    isProTeaserVisible: false
  };

  styles = {
    panel: {
      height: '100%',
      backgroundColor: '#2C001E' // 'rgb(89, 89, 89)' // '#00D1A1' // #008023
    },
    buttonIcon: {
      width: 28,
      height: 28,
      color: '#d6d6d6' // this.props.theme.palette.text.primary
    },
    button: {
      padding: 8,
      width: 44,
      height: 44
    },
    selectedButton: {
      borderRadius: 0,
      backgroundColor: '#880E4F'
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
  };

  toggleProTeaser = () => {
    this.setState({ isProTeaserVisible: !this.state.isProTeaserVisible });
  }

  chooseDirectoryPath = (currentPath: string) => {
    this.setState({
      selectedDirectoryPath: currentPath
    });
  };

  resetState = dialogKey => {
    this.setState({
      [dialogKey]: uuidv1()
    });
  };

  render() {
    const {
      isFirstRun,
      isEditTagDialogOpened,
      isAboutDialogOpened,
      isKeysDialogOpened,
      isOnboardingDialogOpened,
      isLicenseDialogOpened,
      isThirdPartyLibsDialogOpened,
      isSettingsDialogOpened,
      isCreateDirectoryOpened,
      isCreateFileDialogOpened,
      isSelectDirectoryDialogOpened,
      isLocationManagerPanelOpened,
      isTagLibraryPanelOpened,
      isSearchPanelOpened,
      isPerspectivesPanelOpened,
      isHelpFeedbackPanelOpened,
      currentDirectory,
      isReadOnlyMode,
      toggleCreateDirectoryDialog,
      toggleCreateFileDialog,
      toggleSelectDirectoryDialog,
      toggleOnboardingDialog,
      toggleSettingsDialog,
      toggleKeysDialog,
      toggleLicenseDialog,
      toggleThirdPartyLibsDialog,
      toggleAboutDialog,
      toggleEditTagDialog,
      openLocationManagerPanel,
      openTagLibraryPanel,
      openSearchPanel,
      openHelpFeedbackPanel,
      closeAllVerticalPanels,
      switchTheme,
      setManagementPanelVisibility,
      openFileNatively,
      setFirstRun
    } = this.props;
    return (
      <div>
        <style>
          {`
            #verticalNavButton:hover {
              border-radius: 0;
              background-color: #880E4F;
            }
          `}
        </style>
        <CreateDirectoryDialog
          open={isCreateDirectoryOpened}
          onClose={toggleCreateDirectoryDialog}
          selectedDirectoryPath={currentDirectory}
        />
        {isEditTagDialogOpened && (
          <EditEntryTagDialogAsync
            key={uuidv1()}
            open={isEditTagDialogOpened}
            onClose={toggleEditTagDialog}
            currentEntryPath={this.props.currentEntryPath}
            selectedTag={this.props.selectedTag}
          />
        )}
        {isSelectDirectoryDialogOpened && (
          <SelectDirectoryAsync
            open={isSelectDirectoryDialogOpened}
            onClose={toggleSelectDirectoryDialog}
            chooseDirectoryPath={this.chooseDirectoryPath}
            selectedDirectoryPath={
              this.state.selectedDirectoryPath || currentDirectory
            }
          />
        )}
        {isAboutDialogOpened && (
          <AboutDialogAsync
            open={isAboutDialogOpened}
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
        {(isLicenseDialogOpened) && (
          <LicenseDialogAsync
            open={isLicenseDialogOpened}
            onClose={() => {
              setFirstRun(false);
              toggleLicenseDialog();
            }}
          />
        )}
        {(isOnboardingDialogOpened) && (
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
        {this.state.isProTeaserVisible && (
          <ProTeaserDialogAsync
            open={this.state.isProTeaserVisible}
            onClose={this.toggleProTeaser}
            openFileNatively={openFileNatively}
            key={uuidv1()}
          />
        )}
        {/* {isSettingsDialogOpened && (
          <SettingsDialogAsync
            open={isSettingsDialogOpened}
            onClose={toggleSettingsDialog}
          />
        )} */}
        <SettingsDialog
          open={isSettingsDialogOpened}
          onClose={toggleSettingsDialog}
        />
        <CreateFileDialog
          key={uuidv1()}
          open={isCreateFileDialogOpened}
          selectedDirectoryPath={
            this.state.selectedDirectoryPath || currentDirectory
          }
          chooseDirectoryPath={this.chooseDirectoryPath}
          onClose={toggleCreateFileDialog}
        />
        <SplitPane
          split="vertical"
          minSize={44}
          maxSize={44}
          defaultSize={44}
          resizerStyle={{ backgroundColor: this.props.theme.palette.divider }}
        >
          <div style={this.styles.panel}>
            <IconButton
              onClick={toggleAboutDialog}
              style={{ ...this.styles.button, marginTop: 10, marginBottom: 16 }}
              title={i18n.t('core:aboutTitle')}
              data-tid="aboutTagSpaces"
            >
              <img
                style={{
                  ...this.styles.buttonIcon,
                  color: this.props.theme.palette.text.primary
                }}
                src={LogoIcon}
                alt="TagSpaces Logo"
              />
            </IconButton>
            { !isReadOnlyMode && (
              <IconButton
                id="verticalNavButton"
                onClick={toggleCreateFileDialog}
                style={{ ...this.styles.button, marginBottom: 20 }}
                title={i18n.t('core:createFileTitle')}
                data-tid="locationManager"
              >
                <NewFileIcon style={this.styles.buttonIcon} />
              </IconButton>
            )}
            <IconButton
              id="verticalNavButton"
              onClick={() => {
                if (isLocationManagerPanelOpened) {
                  closeAllVerticalPanels();
                } else {
                  openLocationManagerPanel();
                }
              }}
              style={
                isLocationManagerPanelOpened
                  ? { ...this.styles.button, ...this.styles.selectedButton }
                  : this.styles.button
              }
              title={i18n.t('core:locationManager')}
              data-tid="locationManager"
            >
              <LocationsIcon style={this.styles.buttonIcon} />
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
              style={
                isTagLibraryPanelOpened
                  ? { ...this.styles.button, ...this.styles.selectedButton }
                  : this.styles.button
              }
            >
              <TagLibraryIcon style={this.styles.buttonIcon} />
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
              style={
                isSearchPanelOpened
                  ? { ...this.styles.button, ...this.styles.selectedButton }
                  : this.styles.button
              }
            >
              <SearchIcon style={this.styles.buttonIcon} />
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
                  ? { ...this.styles.button, ...this.styles.selectedButton }
                  : this.styles.button
              }
            >
              <PerspectivesIcon style={this.styles.buttonIcon} />
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
              style={
                isHelpFeedbackPanelOpened
                  ? { ...this.styles.button, ...this.styles.selectedButton }
                  : this.styles.button
              }
            >
              <HelpIcon style={this.styles.buttonIcon} />
            </IconButton>
            {!Pro && (
              <IconButton
                id="verticalNavButton"
                title={i18n.t('core:upgradeToPro')}
                data-tid="upgradeToPro"
                onClick={this.toggleProTeaser}
                style={{ ...this.styles.button, ...this.styles.upgradeButton }}
              >
                <UpgradeIcon style={{
                  ...this.styles.buttonIcon,
                  // color: '1DD19F'
                }}
                />
              </IconButton>
            )}
            <IconButton
              id="verticalNavButton"
              title={i18n.t('core:switchTheme')}
              data-tid="switchTheme"
              onClick={switchTheme}
              style={{ ...this.styles.button, ...this.styles.themingButton }}
            >
              <ThemingIcon style={this.styles.buttonIcon} />
            </IconButton>
            <IconButton
              id="verticalNavButton"
              title={i18n.t('core:settings')}
              data-tid="settings"
              onClick={toggleSettingsDialog}
              style={
                isSettingsDialogOpened
                  ? {
                    ...this.styles.button,
                    ...this.styles.settingsButton,
                    ...this.styles.selectedButton
                  } : {
                    ...this.styles.button,
                    ...this.styles.settingsButton
                  }
              }
            >
              <SettingsIcon style={this.styles.buttonIcon} />
            </IconButton>
          </div>
          {this.state.isManagementPanelVisible && (
            <div style={this.styles.panel}>
              <LocationManager style={{ display: isLocationManagerPanelOpened ? 'block' : 'none' }} />
              { isTagLibraryPanelOpened && <TagLibrary /> }
              <Search style={{ display: isSearchPanelOpened ? 'block' : 'none' }} />
              { isPerspectivesPanelOpened && <PerspectiveManager /> }
              { isHelpFeedbackPanelOpened &&
              <HelpFeedbackPanel
                openFileNatively={openFileNatively}
                toggleKeysDialog={toggleKeysDialog}
                toggleOnboardingDialog={toggleOnboardingDialog}
                toggleProTeaser={this.toggleProTeaser}
              /> }
            </div>
          )}
        </SplitPane>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    isFirstRun: isFirstRun(state),
    isEditTagDialogOpened: isEditTagDialogOpened(state),
    isAboutDialogOpened: isAboutDialogOpened(state),
    isKeysDialogOpened: isKeysDialogOpened(state),
    isOnboardingDialogOpened: isOnboardingDialogOpened(state),
    isLicenseDialogOpened: isLicenseDialogOpened(state),
    isThirdPartyLibsDialogOpened: isThirdPartyLibsDialogOpened(state),
    isSettingsDialogOpened: isSettingsDialogOpened(state),
    isCreateDirectoryOpened: isCreateDirectoryOpened(state),
    isCreateFileDialogOpened: isCreateFileDialogOpened(state),
    isSelectDirectoryDialogOpened: isSelectDirectoryDialogOpened(state),
    isLocationManagerPanelOpened: isLocationManagerPanelOpened(state),
    isTagLibraryPanelOpened: isTagLibraryPanelOpened(state),
    isSearchPanelOpened: isSearchPanelOpened(state),
    isPerspectivesPanelOpened: isPerspectivesPanelOpened(state),
    isHelpFeedbackPanelOpened: isHelpFeedbackPanelOpened(state),
    currentDirectory: getDirectoryPath(state),
    isReadOnlyMode: isReadOnlyMode(state)
  };
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(
    {
      toggleCreateDirectoryDialog: AppActions.toggleCreateDirectoryDialog,
      toggleCreateFileDialog: AppActions.toggleCreateFileDialog,
      toggleSelectDirectoryDialog: AppActions.toggleSelectDirectoryDialog,
      toggleOnboardingDialog: AppActions.toggleOnboardingDialog,
      toggleSettingsDialog: AppActions.toggleSettingsDialog,
      toggleLicenseDialog: AppActions.toggleLicenseDialog,
      toggleThirdPartyLibsDialog: AppActions.toggleThirdPartyLibsDialog,
      toggleAboutDialog: AppActions.toggleAboutDialog,
      toggleEditTagDialog: AppActions.toggleEditTagDialog,
      toggleKeysDialog: AppActions.toggleKeysDialog,
      openLocationManagerPanel: AppActions.openLocationManagerPanel,
      openTagLibraryPanel: AppActions.openTagLibraryPanel,
      openSearchPanel: AppActions.openSearchPanel,
      openPerspectivesPanel: AppActions.openPerspectivesPanel,
      openHelpFeedbackPanel: AppActions.openHelpFeedbackPanel,
      openFileNatively: AppActions.openFileNatively,
      closeAllVerticalPanels: AppActions.closeAllVerticalPanels,
      switchTheme: SettingsActions.switchTheme,
      setFirstRun: SettingsActions.setFirstRun,
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapActionCreatorsToProps
)(withTheme(VerticalNavigation));
