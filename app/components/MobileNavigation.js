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
import classNames from 'classnames';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import IconButton from '@material-ui/core/IconButton';
import NewFileIcon from '@material-ui/icons/AddCircle';
import LocationsIcon from '@material-ui/icons/WorkOutline';
import TagLibraryIcon from '@material-ui/icons/LocalOfferOutlined';
import SearchIcon from '@material-ui/icons/SearchOutlined';
// import PerspectivesIcon from '@material-ui/icons/MapOutlined';
import SettingsIcon from '@material-ui/icons/Settings';
// import ThemingIcon from '@material-ui/icons/InvertColors';
// import UpgradeIcon from '@material-ui/icons/FlightTakeoff';
// import HelpIcon from '@material-ui/icons/HelpOutline';
import { withStyles } from '@material-ui/core/styles';
// import LogoIcon from '../assets/images/icon100x100.svg';
import TagLibrary from '../components/TagLibrary';
import Search from '../components/Search';
import PerspectiveManager from '../components/PerspectiveManager';
import LocationManager from '../components/LocationManager';
import HelpFeedbackPanel from '../components/HelpFeedbackPanel';
import i18n from '../services/i18n';
// import { Pro } from '../pro';
import {
  actions as AppActions,
  isSettingsDialogOpened,
  isLocationManagerPanelOpened,
  isTagLibraryPanelOpened,
  isSearchPanelOpened,
  isPerspectivesPanelOpened,
  isHelpFeedbackPanelOpened,
  isReadOnlyMode,
} from '../reducers/app';
import { actions as SettingsActions, isFirstRun } from '../reducers/settings';

const styles = theme => ({
  bottomToolbar: {
    textAlign: 'center',
    backgroundColor: theme.palette.background.default
  },
  buttonIcon: {
    color: '#d6d6d6' // theme.palette.text.primary
  },
  button: {
  },
  selectedButton: {
    backgroundColor: '#880E4F'
  },
});

type Props = {
  classes: Object,
  isFirstRun: boolean,
  setFirstRun: (isFirstRun: boolean) => void,
  toggleOnboardingDialog: () => void,
  toggleCreateFileDialog: () => void,
  toggleAboutDialog: () => void,
  toggleKeysDialog: () => void,
  toggleSettingsDialog: () => void,
  isSettingsDialogOpened: () => void,
  isLocationManagerPanelOpened: boolean,
  openLocationManagerPanel: () => void,
  isTagLibraryPanelOpened: boolean,
  openTagLibraryPanel: () => void,
  isSearchPanelOpened: boolean,
  openSearchPanel: () => void,
  isPerspectivesPanelOpened: boolean,
  // openPerspectivesPanel: () => void,
  isHelpFeedbackPanelOpened: boolean,
  openHelpFeedbackPanel: () => void,
  closeAllVerticalPanels: () => void,
  openFileNatively: (url: string) => void,
  openURLExternally: (url: string) => void,
  switchTheme: () => void,
  hideDrawer: () => void,
  isReadOnlyMode: boolean
};

type State = {
  isProTeaserVisible: boolean
};

class MobileNavigation extends React.Component<Props, State> {
  state = {
    isManagementPanelVisible: true,
    isProTeaserVisible: false
  };

  toggleProTeaser = () => {
    this.setState({ isProTeaserVisible: !this.state.isProTeaserVisible });
  }

  render() {
    const {
      classes,
      isFirstRun,
      isLocationManagerPanelOpened,
      isTagLibraryPanelOpened,
      isSearchPanelOpened,
      isSettingsDialogOpened,
      isPerspectivesPanelOpened,
      isHelpFeedbackPanelOpened,
      isReadOnlyMode,
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
      hideDrawer,
      openFileNatively,
      openURLExternally,
    } = this.props;
    return (
      <div style={{ height: '100%' }}>
        <style>
          {`
            #verticalNavButton:hover {
              background-color: #880E4F;
            }
          `}
        </style>
        <div style={{ width: 300, maxWidth: 300, height: 'calc(100% - 60px)' }}>
          <LocationManager hideDrawer={hideDrawer} style={{ display: isLocationManagerPanelOpened ? 'block' : 'none' }} />
          {isTagLibraryPanelOpened && <TagLibrary />}
          <Search hideDrawer={hideDrawer} style={{ display: isSearchPanelOpened ? 'block' : 'none' }} />
          {isPerspectivesPanelOpened && <PerspectiveManager />}
          {isHelpFeedbackPanelOpened && <HelpFeedbackPanel
            openFileNatively={openFileNatively}
            openURLExternally={openURLExternally}
            toggleKeysDialog={toggleKeysDialog}
            toggleOnboardingDialog={toggleOnboardingDialog}
            toggleProTeaser={this.toggleProTeaser}
          />}
        </div>
        <div className={classes.bottomToolbar}>
          <IconButton
            id="verticalNavButton"
            title={i18n.t('core:settings')}
            data-tid="settings"
            onClick={() => {
              toggleSettingsDialog();
              hideDrawer();
            }}
            style={{ marginTop: -15, marginRight: 10 }}
          >
            <SettingsIcon className={classes.buttonIcon} />
          </IconButton>
          <ToggleButtonGroup exclusive>
            <ToggleButton
              id="verticalNavButton"
              onClick={openLocationManagerPanel}
              className={
                isLocationManagerPanelOpened
                  ? classNames(classes.button, classes.selectedButton)
                  : classes.button
              }
              title={i18n.t('core:locationManager')}
              data-tid="locationManager"
            >
              <LocationsIcon className={classes.buttonIcon} />
            </ToggleButton>
            <ToggleButton
              id="verticalNavButton"
              title={i18n.t('core:tagGroupOperations')}
              data-tid="tagLibrary"
              onClick={openTagLibraryPanel}
              className={
                isTagLibraryPanelOpened
                  ? classNames(classes.button, classes.selectedButton)
                  : classes.button
              }
            >
              <TagLibraryIcon className={classes.buttonIcon} />
            </ToggleButton>
            <ToggleButton
              id="verticalNavButton"
              title={i18n.t('core:searchTitle')}
              data-tid="search"
              onClick={openSearchPanel}
              className={
                isSearchPanelOpened
                  ? classNames(classes.button, classes.selectedButton)
                  : classes.button
              }
            >
              <SearchIcon className={classes.buttonIcon} />
            </ToggleButton>
          </ToggleButtonGroup>
          {!isReadOnlyMode && (
            <IconButton
              id="verticalNavButton"
              onClick={() => {
                toggleCreateFileDialog();
                hideDrawer();
              }}
              style={{ marginTop: -15, marginLeft: 10 }}
              title={i18n.t('core:createFileTitle')}
              data-tid="locationManager"
            >
              <NewFileIcon color="primary" />
            </IconButton>
          )}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    isFirstRun: isFirstRun(state),
    isSettingsDialogOpened: isSettingsDialogOpened(state),
    isLocationManagerPanelOpened: isLocationManagerPanelOpened(state),
    isTagLibraryPanelOpened: isTagLibraryPanelOpened(state),
    isSearchPanelOpened: isSearchPanelOpened(state),
    isPerspectivesPanelOpened: isPerspectivesPanelOpened(state),
    isHelpFeedbackPanelOpened: isHelpFeedbackPanelOpened(state),
    isReadOnlyMode: isReadOnlyMode(state)
  };
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(
    {
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
      openFileNatively: AppActions.openFileNatively,
      openURLExternally: AppActions.openURLExternally,
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
)(withStyles(styles)(MobileNavigation));
