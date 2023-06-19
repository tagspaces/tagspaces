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
import classNames from 'classnames';
import Box from '@mui/material/Box';
import Tooltip from '-/components/Tooltip';
import ToggleButton from '@mui/material/ToggleButton';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import IconButton from '@mui/material/IconButton';
import ThemingIcon from '@mui/icons-material/InvertColors';
import TagLibraryIcon from '@mui/icons-material/LocalOfferOutlined';
import RecentThingsIcon from '@mui/icons-material/BookmarksOutlined';
import HelpIcon from '@mui/icons-material/HelpOutline';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import withStyles from '@mui/styles/withStyles';
import { CognitoUserInterface } from '@aws-amplify/ui-components';
import Popover from '@mui/material/Popover';
import { Pro } from '-/pro';
import CustomLogo from '-/components/CustomLogo';
import ProTeaser from '-/components/ProTeaser';
import TagLibrary from '-/components/TagLibrary';
import LocationManager from '-/components/LocationManager';
import HelpFeedbackPanel from '-/components/HelpFeedbackPanel';
import i18n from '-/services/i18n';
import {
  actions as AppActions,
  isSettingsDialogOpened,
  isLocationManagerPanelOpened,
  isTagLibraryPanelOpened,
  isSearchPanelOpened,
  isHelpFeedbackPanelOpened,
  isReadOnlyMode,
  getDirectoryPath
} from '../reducers/app';
import {
  actions as SettingsActions,
  getCurrentLanguage
} from '-/reducers/settings';
import StoredSearches from '-/components/StoredSearches';
import UserDetailsPopover from '-/components/UserDetailsPopover';
import { CreateFileIcon, LocalLocationIcon } from '-/components/CommonIcons';
import PlatformIO from '-/services/platform-facade';
import AppConfig from '-/AppConfig';

const styles: any = (theme: any) => ({
  selectedButton: {
    backgroundColor: theme.palette.primary.light
  }
});

interface Props {
  classes: any;
  language: string;
  toggleProTeaser: (slidePage?: string) => void;
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
  isHelpFeedbackPanelOpened: boolean;
  openHelpFeedbackPanel: () => void;
  // closeAllVerticalPanels: () => void;
  toggleLocationDialog: () => void;
  openURLExternally: (url: string, skipConfirmation?: boolean) => void;
  switchTheme: () => void;
  hideDrawer?: () => void;
  isReadOnlyMode: boolean;
  showNotification: (message: string) => void;
  directoryPath: string;
  user: CognitoUserInterface;
  width?: number;
  theme: any;
}

function MobileNavigation(props: Props) {
  const [showTeaserBanner, setShowTeaserBanner] = useState<boolean>(true);
  const [anchorUser, setAnchorUser] = useState<HTMLButtonElement | null>(null);

  const showProTeaser = !Pro && showTeaserBanner;

  const {
    classes,
    toggleCreateFileDialog,
    toggleLocationDialog,
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
    width,
    theme,
    switchTheme,
    user,
    language
  } = props;
  return (
    <Box
      style={{
        // backgroundColor: theme.palette.background.default,
        height: '100%',
        overflow: 'hidden',
        width: width || 320,
        maxWidth: width || 320
      }}
    >
      <Box
        style={{
          overflow: 'hidden',
          height: showProTeaser ? 'calc(100% - 220px)' : 'calc(100% - 55px)'
        }}
      >
        <CustomLogo />
        <ButtonGroup
          color="primary"
          style={{
            textAlign: 'center',
            display: 'block',
            whiteSpace: 'nowrap',
            marginBottom: 10,
            marginLeft: 15
          }}
        >
          <Tooltip title={i18n.t('core:createFileTitle')}>
            <Button
              data-tid="createNewFileTID"
              onClick={() => {
                toggleCreateFileDialog();
                if (hideDrawer) {
                  hideDrawer();
                }
              }}
              size="small"
              color="primary"
            >
              <CreateFileIcon />
              <span
                style={{
                  maxWidth: 180,
                  textOverflow: 'ellipsis',
                  overflow: 'hidden'
                }}
              >
                {i18n.t('core:create')}
              </span>
            </Button>
          </Tooltip>
          {!AppConfig.isCordova && (
            <Tooltip title={i18n.t('core:openNewInstance')}>
              <Button
                data-tid="newAppWindow"
                onClick={() => PlatformIO.createNewInstance()}
                size="small"
                color="primary"
              >
                <OpenInNewIcon />
                &nbsp;
                <span
                  style={{
                    maxWidth: 180,
                    textOverflow: 'ellipsis',
                    overflow: 'hidden'
                  }}
                >
                  {i18n.t('core:newWindow')}
                </span>
              </Button>
            </Tooltip>
          )}
        </ButtonGroup>
        <LocationManager
          reduceHeightBy={170}
          show={props.isLocationManagerPanelOpened}
        />
        {props.isTagLibraryPanelOpened && <TagLibrary reduceHeightBy={170} />}
        {props.isSearchPanelOpened && <StoredSearches reduceHeightBy={170} />}
        {props.isHelpFeedbackPanelOpened && (
          <HelpFeedbackPanel
            language={language}
            reduceHeightBy={170}
            openURLExternally={openURLExternally}
            toggleAboutDialog={toggleAboutDialog}
            toggleKeysDialog={toggleKeysDialog}
            toggleOnboardingDialog={toggleOnboardingDialog}
            toggleProTeaser={() => props.toggleProTeaser()}
          />
        )}
      </Box>
      <Box
        style={{
          textAlign: 'center'
        }}
      >
        {showProTeaser && (
          <ProTeaser
            toggleProTeaser={props.toggleProTeaser}
            setShowTeaserBanner={setShowTeaserBanner}
            openURLExternally={openURLExternally}
          />
        )}
        <Tooltip title={i18n.t('core:settings')}>
          <IconButton
            id="verticalNavButton"
            data-tid="settings"
            onClick={() => {
              toggleSettingsDialog();
            }}
            style={{ marginTop: -15, marginRight: 2 }}
            size="large"
          >
            <SettingsIcon />
          </IconButton>
        </Tooltip>
        <ToggleButtonGroup exclusive>
          <Tooltip title={i18n.t('core:locationManager')}>
            <ToggleButton
              onClick={openLocationManagerPanel}
              className={
                props.isLocationManagerPanelOpened
                  ? classNames(classes.button, classes.selectedButton)
                  : classes.button
              }
              data-tid="locationManager"
              value="check"
            >
              <LocalLocationIcon />
            </ToggleButton>
          </Tooltip>
          <Tooltip title={i18n.t('core:tagLibrary')}>
            <ToggleButton
              data-tid="tagLibrary"
              onClick={openTagLibraryPanel}
              className={
                props.isTagLibraryPanelOpened
                  ? classNames(classes.button, classes.selectedButton)
                  : classes.button
              }
              value="check"
            >
              <TagLibraryIcon />
            </ToggleButton>
          </Tooltip>
          <Tooltip title={i18n.t('core:quickAccess')}>
            <ToggleButton
              data-tid="quickAccessButton"
              onClick={openSearchPanel}
              className={
                props.isSearchPanelOpened
                  ? classNames(classes.button, classes.selectedButton)
                  : classes.button
              }
              value="check"
            >
              <RecentThingsIcon />
            </ToggleButton>
          </Tooltip>
          <Tooltip title={i18n.t('core:helpFeedback')}>
            <ToggleButton
              data-tid="helpFeedback"
              onClick={openHelpFeedbackPanel}
              className={
                props.isHelpFeedbackPanelOpened
                  ? classNames(classes.button, classes.selectedButton)
                  : classes.button
              }
              value="check"
            >
              <HelpIcon />
            </ToggleButton>
          </Tooltip>
        </ToggleButtonGroup>
        {user ? (
          <>
            <Tooltip title={i18n.t('core:userAccount')}>
              <IconButton
                data-tid="accountCircleIconTID"
                onClick={(event: React.MouseEvent<HTMLButtonElement>) =>
                  setAnchorUser(event.currentTarget)
                }
                style={{ marginTop: -15, marginRight: 2 }}
                size="large"
              >
                <AccountCircleIcon className={classes.buttonIcon} />
              </IconButton>
            </Tooltip>
            <Popover
              open={Boolean(anchorUser)}
              anchorEl={anchorUser}
              onClose={() => setAnchorUser(null)}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'center'
              }}
              transformOrigin={{
                vertical: 'bottom',
                horizontal: 'center'
              }}
            >
              <UserDetailsPopover onClose={() => setAnchorUser(null)} />
            </Popover>
          </>
        ) : (
          <Tooltip title={i18n.t('core:switchTheme')}>
            <IconButton
              data-tid="switchTheme"
              onClick={switchTheme}
              style={{ marginTop: -15, marginRight: 2 }}
              size="large"
            >
              <ThemingIcon className={classes.buttonIcon} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
}

function mapStateToProps(state) {
  return {
    isSettingsDialogOpened: isSettingsDialogOpened(state),
    isLocationManagerPanelOpened: isLocationManagerPanelOpened(state),
    isTagLibraryPanelOpened: isTagLibraryPanelOpened(state),
    isSearchPanelOpened: isSearchPanelOpened(state),
    isHelpFeedbackPanelOpened: isHelpFeedbackPanelOpened(state),
    isReadOnlyMode: isReadOnlyMode(state),
    directoryPath: getDirectoryPath(state),
    user: state.app.user,
    language: getCurrentLanguage(state)
  };
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(
    {
      toggleCreateFileDialog: AppActions.toggleCreateFileDialog,
      toggleOnboardingDialog: AppActions.toggleOnboardingDialog,
      toggleSettingsDialog: AppActions.toggleSettingsDialog,
      toggleProTeaser: AppActions.toggleProTeaser,
      toggleAboutDialog: AppActions.toggleAboutDialog,
      toggleKeysDialog: AppActions.toggleKeysDialog,
      openLocationManagerPanel: AppActions.openLocationManagerPanel,
      openTagLibraryPanel: AppActions.openTagLibraryPanel,
      openSearchPanel: AppActions.openSearchPanel,
      toggleLocationDialog: AppActions.toggleLocationDialog,
      openHelpFeedbackPanel: AppActions.openHelpFeedbackPanel,
      openURLExternally: AppActions.openURLExternally,
      showNotification: AppActions.showNotification,
      switchTheme: SettingsActions.switchTheme
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapActionCreatorsToProps
)(withStyles(styles)(MobileNavigation));
