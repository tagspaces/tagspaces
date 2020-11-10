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
import SettingsIcon from '@material-ui/icons/Settings';
import { withStyles } from '@material-ui/core/styles';
import TagLibrary from '../components/TagLibrary';
import Search from '../components/Search';
import LocationManager from '../components/LocationManager';
import HelpFeedbackPanel from '../components/HelpFeedbackPanel';
import i18n from '../services/i18n';
import {
  actions as AppActions,
  isSettingsDialogOpened,
  isLocationManagerPanelOpened,
  isTagLibraryPanelOpened,
  isSearchPanelOpened,
  isPerspectivesPanelOpened,
  isHelpFeedbackPanelOpened,
  isReadOnlyMode,
  getDirectoryPath
} from '../reducers/app';
import { actions as SettingsActions, isFirstRun } from '../reducers/settings';

const styles: any = (theme: any) => ({
  bottomToolbar: {
    marginTop: 9,
    textAlign: 'center',
    backgroundColor: theme.palette.background.default
  },
  buttonIcon: {
    color: '#d6d6d6' // theme.palette.text.primary
  },
  button: {},
  selectedButton: {
    backgroundColor: '#880E4F'
  }
});

interface Props {
  classes: any;
  isFirstRun: boolean;
  setFirstRun: (isFirstRun: boolean) => void;
  toggleOnboardingDialog: () => void;
  toggleCreateFileDialog: () => void;
  toggleAboutDialog: () => void;
  toggleKeysDialog: () => void;
  toggleSettingsDialog: () => void;
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
  openFileNatively: (url: string) => void;
  openURLExternally: (url: string) => void;
  switchTheme: () => void;
  hideDrawer: () => void;
  isReadOnlyMode: boolean;
  showNotification: (message: string) => void;
  directoryPath: string;
}

interface State {
  isProTeaserVisible: boolean;
}

class MobileNavigation extends React.Component<Props, State> {
  state = {
    isManagementPanelVisible: true,
    isProTeaserVisible: false
  };

  toggleProTeaser = () => {
    this.setState({ isProTeaserVisible: !this.state.isProTeaserVisible });
  };

  render() {
    const {
      classes,
      isLocationManagerPanelOpened,
      isTagLibraryPanelOpened,
      isSearchPanelOpened,
      isHelpFeedbackPanelOpened,
      isReadOnlyMode,
      toggleCreateFileDialog,
      toggleOnboardingDialog,
      toggleSettingsDialog,
      toggleKeysDialog,
      openLocationManagerPanel,
      openTagLibraryPanel,
      openSearchPanel,
      showNotification,
      hideDrawer,
      openFileNatively,
      openURLExternally,
      directoryPath
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
          <LocationManager
            hideDrawer={hideDrawer}
            style={{
              display: isLocationManagerPanelOpened ? 'block' : 'none'
            }}
          />
          {isTagLibraryPanelOpened && <TagLibrary />}
          {isSearchPanelOpened && <Search hideDrawer={hideDrawer} />}
          {/* {isPerspectivesPanelOpened && <PerspectiveManager />} */}
          {isHelpFeedbackPanelOpened && (
            <HelpFeedbackPanel
              openFileNatively={openFileNatively}
              openURLExternally={openURLExternally}
              toggleKeysDialog={toggleKeysDialog}
              toggleOnboardingDialog={toggleOnboardingDialog}
              toggleProTeaser={this.toggleProTeaser}
            />
          )}
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
          <IconButton
            id="verticalNavButton"
            onClick={() => {
              if (isReadOnlyMode || !directoryPath) {
                showNotification(
                  'You are in read-only mode or there is no opened location'
                );
              } else {
                toggleCreateFileDialog();
                hideDrawer();
              }
            }}
            style={{ marginTop: -15, marginLeft: 10 }}
            title={i18n.t('core:createFileTitle')}
            data-tid="locationManager"
          >
            <NewFileIcon color="primary" />
          </IconButton>
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
    isReadOnlyMode: isReadOnlyMode(state),
    directoryPath: getDirectoryPath(state)
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
      showNotification: AppActions.showNotification,
      closeAllVerticalPanels: AppActions.closeAllVerticalPanels,
      switchTheme: SettingsActions.switchTheme,
      setFirstRun: SettingsActions.setFirstRun
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapActionCreatorsToProps
)(withStyles(styles)(MobileNavigation));
