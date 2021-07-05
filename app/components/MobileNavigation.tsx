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
import uuidv1 from 'uuid';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import Tooltip from '@material-ui/core/Tooltip';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import IconButton from '@material-ui/core/IconButton';
import NewFileIcon from '@material-ui/icons/AddCircle';
import LocationsIcon from '@material-ui/icons/WorkOutline';
import TagLibraryIcon from '@material-ui/icons/LocalOfferOutlined';
import SearchIcon from '@material-ui/icons/SearchOutlined';
import HelpIcon from '@material-ui/icons/HelpOutline';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import SettingsIcon from '@material-ui/icons/Settings';
import { withStyles } from '@material-ui/core/styles';
import { CognitoUserInterface } from '@aws-amplify/ui-components';
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
import LoadingLazy from './LoadingLazy';
import { actions as SettingsActions, isFirstRun } from '../reducers/settings';

const styles: any = (theme: any) => ({
  bottomToolbar: {
    paddingTop: 9,
    paddingBottom: 3,
    textAlign: 'center',
    backgroundColor: theme.palette.background.default
  },
  selectedButton: {
    backgroundColor: '#880E4F'
  }
});

const ProTeaserDialog = React.lazy(() =>
  import(/* webpackChunkName: "ProTeaserDialog" */ './dialogs/ProTeaserDialog')
);
const ProTeaserDialogAsync = props => (
  <React.Suspense fallback={<LoadingLazy />}>
    <ProTeaserDialog {...props} />
  </React.Suspense>
);

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
  openURLExternally: (url: string) => void;
  switchTheme: () => void;
  hideDrawer: () => void;
  isReadOnlyMode: boolean;
  showNotification: (message: string) => void;
  directoryPath: string;
  user: CognitoUserInterface;
}

const MobileNavigation = (props: Props) => {
  const [isProTeaserVisible, setIsProTeaserVisible] = useState<boolean>(false);

  const toggleProTeaser = () => {
    setIsProTeaserVisible(!isProTeaserVisible);
  };

  const {
    classes,
    toggleCreateFileDialog,
    toggleOnboardingDialog,
    toggleSettingsDialog,
    toggleKeysDialog,
    toggleAboutDialog,
    openLocationManagerPanel,
    openTagLibraryPanel,
    openSearchPanel,
    openHelpFeedbackPanel,
    showNotification,
    hideDrawer,
    openURLExternally,
    directoryPath,
    user
  } = props;
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
        {props.isLocationManagerPanelOpened && (
          <LocationManager hideDrawer={hideDrawer} />
        )}
        {props.isTagLibraryPanelOpened && <TagLibrary />}
        {props.isSearchPanelOpened && <Search hideDrawer={hideDrawer} />}
        {/* {isPerspectivesPanelOpened && <PerspectiveManager />} */}
        {props.isHelpFeedbackPanelOpened && (
          <HelpFeedbackPanel
            openURLExternally={openURLExternally}
            toggleAboutDialog={toggleAboutDialog}
            toggleKeysDialog={toggleKeysDialog}
            toggleOnboardingDialog={toggleOnboardingDialog}
            toggleProTeaser={toggleProTeaser}
          />
        )}
      </div>
      <div className={classes.bottomToolbar}>
        <Tooltip title={i18n.t('core:settings')}>
          <IconButton
            id="verticalNavButton"
            data-tid="settings"
            onClick={() => {
              toggleSettingsDialog();
              hideDrawer();
            }}
            style={{ marginTop: -15, marginRight: 2 }}
          >
            <SettingsIcon />
          </IconButton>
        </Tooltip>
        <ToggleButtonGroup exclusive>
          <Tooltip title={i18n.t('core:locationManager')}>
            <ToggleButton
              id="verticalNavButton"
              onClick={openLocationManagerPanel}
              className={
                props.isLocationManagerPanelOpened
                  ? classNames(classes.button, classes.selectedButton)
                  : classes.button
              }
              data-tid="locationManager"
            >
              <LocationsIcon />
            </ToggleButton>
          </Tooltip>
          <Tooltip title={i18n.t('core:tagLibrary')}>
            <ToggleButton
              id="verticalNavButton"
              data-tid="tagLibrary"
              onClick={openTagLibraryPanel}
              className={
                props.isTagLibraryPanelOpened
                  ? classNames(classes.button, classes.selectedButton)
                  : classes.button
              }
            >
              <TagLibraryIcon />
            </ToggleButton>
          </Tooltip>
          <Tooltip title={i18n.t('core:searchTitle')}>
            <ToggleButton
              id="verticalNavButton"
              data-tid="search"
              onClick={openSearchPanel}
              className={
                props.isSearchPanelOpened
                  ? classNames(classes.button, classes.selectedButton)
                  : classes.button
              }
            >
              <SearchIcon />
            </ToggleButton>
          </Tooltip>
          <Tooltip title={i18n.t('core:helpFeedback')}>
            <ToggleButton
              id="verticalNavButton"
              data-tid="helpFeedback"
              onClick={openHelpFeedbackPanel}
              className={
                props.isHelpFeedbackPanelOpened
                  ? classNames(classes.button, classes.selectedButton)
                  : classes.button
              }
            >
              {user ? <AccountCircleIcon /> : <HelpIcon />}
            </ToggleButton>
          </Tooltip>
        </ToggleButtonGroup>
        <Tooltip title={i18n.t('core:createFileTitle')}>
          <IconButton
            id="verticalNavButton"
            onClick={() => {
              if (props.isReadOnlyMode || !directoryPath) {
                showNotification(
                  'You are in read-only mode or there is no opened location'
                );
              } else {
                toggleCreateFileDialog();
                hideDrawer();
              }
            }}
            style={{ marginTop: -15, marginLeft: 2 }}
            data-tid="locationManager"
          >
            <NewFileIcon />
          </IconButton>
        </Tooltip>
        {isProTeaserVisible && (
          <ProTeaserDialogAsync
            open={isProTeaserVisible}
            onClose={toggleProTeaser}
            openURLExternally={openURLExternally}
            key={uuidv1()} // TODO rethink to remove this
          />
        )}
      </div>
    </div>
  );
};

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
    directoryPath: getDirectoryPath(state),
    user: state.app.user
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
