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
import PerspectivesIcon from '@material-ui/icons/MapOutlined';
import SettingsIcon from '@material-ui/icons/Settings';
import ThemingIcon from '@material-ui/icons/InvertColors'; // Palette
import { withTheme } from '@material-ui/core/styles';
import SplitPane from 'react-split-pane';
import LogoIcon from '../assets/images/icon100x100.svg';
import AboutDialog from './dialogs/AboutDialog';
import KeyboardDialog from './dialogs/KeyboardDialog';
import LicenseDialog from './dialogs/LicenseDialog';
import ThirdPartyLibsDialog from './dialogs/ThirdPartyLibsDialog';
import SettingsDialog from './dialogs/SettingsDialog';
import CreateDirectoryDialog from './dialogs/CreateDirectoryDialog';
import CreateFileDialog from './dialogs/CreateFileDialog';
import SelectDirectoryDialog from './dialogs/SelectDirectoryDialog';
import TagLibrary from '../components/TagLibrary';
import Search from '../components/Search';
import PerspectiveManager from '../components/PerspectiveManager';
import LocationManager from '../components/LocationManager';
import style from './VerticalNavigation.css';
import i18n from '../services/i18n';
import {
  actions as AppActions,
  getDirectoryPath,
  isAboutDialogOpened,
  isKeysDialogOpened,
  isLicenseDialogOpened,
  isThirdPartyLibsDialogOpened,
  isSettingsDialogOpened,
  isCreateFileDialogOpened,
  isCreateDirectoryOpened,
  isSelectDirectoryDialogOpened,
} from '../reducers/app';
import {
  actions as SettingActions,
} from '../reducers/settings';


export const AppVerticalPanels = {
  tagLibrary: 'tagLibrary',
  search: 'search',
  perspectiveManager: 'perspectiveManager',
  locationManager: 'locationManager',
  settings: 'settings'
};

type Props = {
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
  switchTheme: () => void,
  shouldTogglePanel: string,
  currentDirectory: string
};

type State = {
  selectedDirectoryPath?: string,
  isLocationManagerVisible?: boolean,
  isTagLibraryVisible?: boolean,
  isSearchVisible?: boolean,
  isPerspectiveManagerVisible?: boolean,
  isManagementPanelVisible?: boolean, // evtl. redux migration
  CreateFileDialogKey: string
};

class VerticalNavigation extends React.Component<Props, State> {
  state = {
    isLocationManagerVisible: true,
    isTagLibraryVisible: false,
    isSearchVisible: false,
    isPerspectiveManagerVisible: false,
    isManagementPanelVisible: true,
    CreateFileDialogKey: uuidv1(),
  };

  componentWillReceiveProps(nextProps: Props) {
    if (
      nextProps.shouldTogglePanel &&
      this.props.shouldTogglePanel !== nextProps.shouldTogglePanel
    ) {
      this.togglePanel(nextProps.shouldTogglePanel);
    }
  }

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
    }
  };

  hideAllPanels() {
    this.setState({
      isLocationManagerVisible: false,
      isTagLibraryVisible: false,
      isSearchVisible: false,
      isPerspectiveManagerVisible: false,
      isManagementPanelVisible: false
    });
    this.props.setManagementPanelVisibility(false);
  }

  togglePanel = panelName => {
    switch (panelName) {
    case AppVerticalPanels.locationManager:
      this.props.setManagementPanelVisibility(
        !this.state.isLocationManagerVisible
      );
      this.setState({
        isLocationManagerVisible: !this.state.isLocationManagerVisible,
        isTagLibraryVisible: false,
        isSearchVisible: false,
        isPerspectiveManagerVisible: false,
      });
      break;
    case AppVerticalPanels.tagLibrary:
      this.props.setManagementPanelVisibility(
        !this.state.isTagLibraryVisible
      );
      this.setState({
        isLocationManagerVisible: false,
        isTagLibraryVisible: !this.state.isTagLibraryVisible,
        isSearchVisible: false,
        isPerspectiveManagerVisible: false,
      });
      break;
    case AppVerticalPanels.search:
      this.props.setManagementPanelVisibility(!this.state.isSearchVisible);
      this.setState({
        isLocationManagerVisible: false,
        isTagLibraryVisible: false,
        isSearchVisible: !this.state.isSearchVisible,
        isPerspectiveManagerVisible: false,
      });
      break;
    case AppVerticalPanels.perspectiveManager:
      this.props.setManagementPanelVisibility(
        !this.state.isPerspectiveManagerVisible
      );
      this.setState({
        isLocationManagerVisible: false,
        isTagLibraryVisible: false,
        isSearchVisible: false,
        isPerspectiveManagerVisible: true,
      });
      break;
    default:
      // this.props.setManagementPanelVisibility(false);
      // this.setState({
      //   isLocationManagerVisible: false,
      //   isTagLibraryVisible: false,
      //   isSearchVisible: false,
      //   isPerspectiveManagerVisible: false,
      //   isSettingsVisible: false
      // });
      break;
    }
  };

  chooseDirectoryPath = (currentPath: string) => {
    this.setState({
      selectedDirectoryPath: currentPath
    });
  };

  resetState = (dialogKey) => {
    this.setState({
      [dialogKey]: uuidv1()
    });
  };

  render() {
    return (
      <div>
        <CreateDirectoryDialog
          open={this.props.isCreateDirectoryOpened}
          onClose={this.props.toggleCreateDirectoryDialog}
          selectedDirectoryPath={this.props.currentDirectory}
        />
        <AboutDialog
          open={this.props.isAboutDialogOpened}
          toggleLicenseDialog={this.props.toggleLicenseDialog}
          toggleThirdPartyLibsDialog={this.props.toggleThirdPartyLibsDialog}
          onClose={this.props.toggleAboutDialog}
        />
        <KeyboardDialog
          open={this.props.isKeysDialogOpened}
          onClose={this.props.toggleKeysDialog}
        />
        <LicenseDialog
          open={this.props.isLicenseDialogOpened}
          onClose={this.props.toggleLicenseDialog}
        />
        <ThirdPartyLibsDialog
          open={this.props.isThirdPartyLibsDialogOpened}
          onClose={this.props.toggleThirdPartyLibsDialog}
        />
        <SettingsDialog
          open={this.props.isSettingsDialogOpened}
          onClose={this.props.toggleSettingsDialog}
        />
        <CreateFileDialog
          key={this.state.CreateFileDialogKey}
          resetState={this.resetState}
          open={this.props.isCreateFileDialogOpened}
          selectedDirectoryPath={this.state.selectedDirectoryPath || this.props.currentDirectory}
          chooseDirectoryPath={this.chooseDirectoryPath}
          onClose={this.props.toggleCreateFileDialog}
        />
        <SelectDirectoryDialog
          open={this.props.isSelectDirectoryDialogOpened}
          onClose={this.props.toggleSelectDirectoryDialog}
          chooseDirectoryPath={this.chooseDirectoryPath}
          selectedDirectoryPath={this.state.selectedDirectoryPath || this.props.currentDirectory}
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
              className={style.verticalNavButton}
              onClick={this.props.toggleAboutDialog}
              style={{ ...this.styles.button, marginTop: 10, marginBottom: 10 }}
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
            <IconButton
              className={style.verticalNavButton}
              onClick={this.props.toggleCreateFileDialog}
              style={{ ...this.styles.button, marginBottom: 20 }}
              title={i18n.t('core:createFileTitle')}
              data-tid="locationManager"
            >
              <NewFileIcon style={this.styles.buttonIcon} />
            </IconButton>
            <IconButton
              className={style.verticalNavButton}
              onClick={() => {
                this.togglePanel(AppVerticalPanels.locationManager);
              }}
              style={
                this.state.isLocationManagerVisible
                  ? { ...this.styles.button, ...this.styles.selectedButton }
                  : this.styles.button
              }
              title={i18n.t('core:locationManager')}
              data-tid="locationManager"
            >
              <LocationsIcon style={this.styles.buttonIcon} />
            </IconButton>
            <IconButton
              title={i18n.t('core:tagGroupOperations')}
              data-tid="tagLibrary"
              className={style.verticalNavButton}
              onClick={() => {
                this.togglePanel(AppVerticalPanels.tagLibrary);
              }}
              style={
                this.state.isTagLibraryVisible
                  ? { ...this.styles.button, ...this.styles.selectedButton }
                  : this.styles.button
              }
            >
              <TagLibraryIcon style={this.styles.buttonIcon} />
            </IconButton>
            <IconButton
              title={i18n.t('core:searchTitle')}
              data-tid="search"
              className={style.verticalNavButton}
              onClick={() => {
                this.togglePanel(AppVerticalPanels.search);
              }}
              style={
                this.state.isSearchVisible
                  ? { ...this.styles.button, ...this.styles.selectedButton }
                  : this.styles.button
              }
            >
              <SearchIcon style={this.styles.buttonIcon} />
            </IconButton>
            { /* <IconButton
              title={i18n.t('core:perspectiveManager')}
              data-tid="perspectiveManager"
              className={style.verticalNavButton}
              onClick={() => {
                this.togglePanel(AppVerticalPanels.perspectiveManager);
              }}
              disabled={false}
              style={
                this.state.isPerspectiveManagerVisible
                  ? { ...this.styles.button, ...this.styles.selectedButton }
                  : this.styles.button
              }
            >
              <PerspectivesIcon style={this.styles.buttonIcon} />
            </IconButton> */ }
            <IconButton
              title={i18n.t('core:switchTheme')}
              data-tid="switchTheme"
              className={style.verticalNavButton}
              onClick={this.props.switchTheme}
              style={this.state.isSettingsDialogOpened ? { ...this.styles.button, ...this.styles.themingButton, ...this.styles.selectedButton } : { ...this.styles.button, ...this.styles.themingButton }}
            >
              <ThemingIcon style={this.styles.buttonIcon} />
            </IconButton>
            <IconButton
              title={i18n.t('core:settings')}
              data-tid="settings"
              className={style.verticalNavButton}
              onClick={this.props.toggleSettingsDialog}
              style={this.state.isSettingsDialogOpened ? { ...this.styles.button, ...this.styles.settingsButton, ...this.styles.selectedButton } : { ...this.styles.button, ...this.styles.settingsButton }}
            >
              <SettingsIcon style={this.styles.buttonIcon} />
            </IconButton>
          </div>
          {this.state.isManagementPanelVisible && (
            <div style={this.styles.panel}>
              <LocationManager
                style={{
                  display: this.state.isLocationManagerVisible
                    ? 'block'
                    : 'none'
                }}
              />
              <TagLibrary
                style={{
                  display: this.state.isTagLibraryVisible ? 'block' : 'none'
                }}
              />
              <Search
                style={{
                  display: this.state.isSearchVisible ? 'block' : 'none'
                }}
              />
              <PerspectiveManager
                style={{
                  display: this.state.isPerspectiveManagerVisible
                    ? 'block'
                    : 'none'
                }}
              />
            </div>
          )}
        </SplitPane>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    isAboutDialogOpened: isAboutDialogOpened(state),
    isKeysDialogOpened: isKeysDialogOpened(state),
    isLicenseDialogOpened: isLicenseDialogOpened(state),
    isThirdPartyLibsDialogOpened: isThirdPartyLibsDialogOpened(state),
    isSettingsDialogOpened: isSettingsDialogOpened(state),
    isCreateDirectoryOpened: isCreateDirectoryOpened(state),
    isCreateFileDialogOpened: isCreateFileDialogOpened(state),
    isSelectDirectoryDialogOpened: isSelectDirectoryDialogOpened(state),
    currentDirectory: getDirectoryPath(state),
  };
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators({
    toggleCreateDirectoryDialog: AppActions.toggleCreateDirectoryDialog,
    toggleCreateFileDialog: AppActions.toggleCreateFileDialog,
    toggleSelectDirectoryDialog: AppActions.toggleSelectDirectoryDialog,
    toggleSettingsDialog: AppActions.toggleSettingsDialog,
    toggleKeysDialog: AppActions.toggleKeysDialog,
    toggleLicenseDialog: AppActions.toggleLicenseDialog,
    toggleThirdPartyLibsDialog: AppActions.toggleThirdPartyLibsDialog,
    toggleAboutDialog: AppActions.toggleAboutDialog,
    switchTheme: SettingActions.switchTheme,
  }, dispatch);
}

export default connect(mapStateToProps, mapActionCreatorsToProps)(
  withTheme()(VerticalNavigation)
);
