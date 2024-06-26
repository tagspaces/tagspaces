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
import { alpha, useTheme, styled } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';
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
import { Divider } from '@mui/material';
import {
  OpenNewWindowIcon,
  AudioRecordIcon,
  NewFileIcon,
  NewFolderIcon,
  LocalLocationIcon,
  SettingsIcon,
} from '-/components/CommonIcons';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Popover from '@mui/material/Popover';
import { Pro } from '-/pro';
import CustomLogo from '-/components/CustomLogo';
import ProTeaser from '-/components/ProTeaser';
import TagLibrary from '-/components/TagLibrary';
import LocationManager from '-/components/LocationManager';
import HelpFeedbackPanel from '-/components/HelpFeedbackPanel';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { AppDispatch } from '../reducers/app';
import { ProLabel } from '-/components/HelperComponents';
import { actions as SettingsActions } from '-/reducers/settings';
import StoredSearches from '-/components/StoredSearches';
import UserDetailsPopover from '-/components/UserDetailsPopover';
import AppConfig from '-/AppConfig';
import { useTranslation } from 'react-i18next';
import { getKeyBindingObject } from '-/reducers/settings';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { createNewInstance } from '-/services/utils-io';
import { useCreateEditLocationDialogContext } from '-/components/dialogs/hooks/useCreateEditLocationDialogContext';
import { useCreateDirectoryDialogContext } from '-/components/dialogs/hooks/useCreateDirectoryDialogContext';
import { useNewEntryDialogContext } from '-/components/dialogs/hooks/useNewEntryDialogContext';
import { useNewFileDialogContext } from '-/components/dialogs/hooks/useNewFileDialogContext';
import { useNewAudioDialogContext } from '-/components/dialogs/hooks/useNewAudioDialogContext';
import { useSettingsDialogContext } from '-/components/dialogs/hooks/useSettingsDialogContext';
import { usePanelsContext } from '-/hooks/usePanelsContext';
import { useUserContext } from '-/hooks/useUserContext';

const PREFIX = 'MobileNavigation';

const classes = {
  button: `${PREFIX}-button`,
  selectedButton: `${PREFIX}-selectedButton`,
};

const Root = styled(Box)(({ theme }) => ({
  [`& .${classes.button}`]: {
    padding: 8,
    margin: 0,
  },
  [`& .${classes.selectedButton}`]: {
    backgroundColor: theme.palette.primary.light,
  },
}));

interface Props {
  hideDrawer?: () => void;
  width?: number;
}

function MobileNavigation(props: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch: AppDispatch = useDispatch();

  const { setSelectedLocation } = useCurrentLocationContext();
  const { openNewEntryDialog } = useNewEntryDialogContext();
  const { openCreateEditLocationDialog } = useCreateEditLocationDialogContext();
  const { openCreateDirectoryDialog } = useCreateDirectoryDialogContext();
  const { openNewFileDialog } = useNewFileDialogContext();
  const { openNewAudioDialog } = useNewAudioDialogContext();
  const { openSettingsDialog } = useSettingsDialogContext();
  const { currentOpenedPanel, showPanel } = usePanelsContext();
  const keyBindings = useSelector(getKeyBindingObject);
  /* const isLocationManagerPanelOpenedSelector = useSelector(
    isLocationManagerPanelOpened,
  );
  const isTagLibraryPanelOpenedSelector = useSelector(isTagLibraryPanelOpened);
  const isSearchPanelOpenedSelector = useSelector(isSearchPanelOpened);
  const isHelpFeedbackPanelOpenedSelector = useSelector(
    isHelpFeedbackPanelOpened,
  );*/
  const { currentUser } = useUserContext();

  const [showTeaserBanner, setShowTeaserBanner] = useState<boolean>(true);
  const [anchorUser, setAnchorUser] = useState<HTMLButtonElement | null>(null);

  const showProTeaser = !Pro && showTeaserBanner;

  const { hideDrawer, width } = props;
  /*const openLocationManagerPanel = () =>
    dispatch(AppActions.openLocationManagerPanel());
  const openTagLibraryPanel = () => dispatch(AppActions.openTagLibraryPanel());
  const openSearchPanel = () => dispatch(AppActions.openSearchPanel());
  const openHelpFeedbackPanel = () =>
    dispatch(AppActions.openHelpFeedbackPanel());*/
  const switchTheme = () => dispatch(SettingsActions.switchTheme());

  const [openedCreateMenu, setOpenCreateMenu] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    setOpenCreateMenu((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpenCreateMenu(false);
  };

  return (
    <Root
      style={{
        // backgroundColor: theme.palette.background.default,
        background: alpha(theme.palette.background.default, 0.85),
        backdropFilter: 'blur(5px)',
        height: '100%',
        overflow: 'hidden',
        width: width || 320,
        maxWidth: width || 320,
      }}
    >
      <Box
        style={{
          overflow: 'hidden',
          height: showProTeaser ? 'calc(100% - 220px)' : 'calc(100% - 55px)',
        }}
      >
        <Box>
          <CustomLogo />
          <Box style={{ width: '100%', textAlign: 'center' }}>
            <ButtonGroup
              // variant="contained"
              ref={anchorRef}
              aria-label="split button"
              color="primary"
              style={{
                textAlign: 'center',
              }}
            >
              <Button
                size="small"
                data-tid="createNewFileTID"
                onClick={() => {
                  openNewEntryDialog();
                  if (hideDrawer) {
                    hideDrawer();
                  }
                }}
              >
                {t('core:createNewFile')}
              </Button>

              <Button
                size="small"
                aria-controls={
                  openedCreateMenu ? 'split-button-menu' : undefined
                }
                aria-expanded={openedCreateMenu ? 'true' : undefined}
                aria-haspopup="menu"
                data-tid="createNewDropdownButtonTID"
                onClick={handleToggle}
              >
                <ArrowDropDownIcon />
              </Button>
            </ButtonGroup>
          </Box>
        </Box>
        <Popper
          sx={{
            zIndex: 1,
          }}
          open={openedCreateMenu}
          anchorEl={anchorRef.current}
          role={undefined}
          transition
          disablePortal
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin:
                  placement === 'bottom' ? 'center top' : 'center bottom',
              }}
            >
              <Paper>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList id="split-button-menu" autoFocusItem>
                    {!AppConfig.isCordova && (
                      <>
                        <MenuItem
                          key="createWindowTID"
                          ata-tid="createWindowTID"
                          onClick={() => {
                            createNewInstance();
                            setOpenCreateMenu(false);
                          }}
                        >
                          <ListItemIcon>
                            <OpenNewWindowIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={t('core:newWindow')}
                          ></ListItemText>
                        </MenuItem>
                        <Divider />
                      </>
                    )}
                    <MenuItem
                      key="createNewTextFileTID"
                      ata-tid="createNewTextFileTID"
                      onClick={() => {
                        openNewFileDialog();
                        setOpenCreateMenu(false);
                        if (hideDrawer) {
                          hideDrawer();
                        }
                      }}
                    >
                      <ListItemIcon>
                        <NewFileIcon />
                      </ListItemIcon>
                      <ListItemText primary={t('core:createTextFile')} />
                    </MenuItem>
                    <MenuItem
                      key="createNewFolderTID"
                      ata-tid="createNewFolderTID"
                      onClick={() => {
                        openCreateDirectoryDialog();
                        setOpenCreateMenu(false);
                        if (hideDrawer) {
                          hideDrawer();
                        }
                      }}
                    >
                      <ListItemIcon>
                        <NewFolderIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={t('core:createNewDirectoryTitle')}
                      />
                    </MenuItem>
                    <MenuItem
                      key="createNewAudio"
                      data-tid="createNewAudioTID"
                      disabled={!Pro}
                      onClick={() => {
                        openNewAudioDialog();
                        setOpenCreateMenu(false);
                        if (hideDrawer) {
                          hideDrawer();
                        }
                      }}
                    >
                      <ListItemIcon>
                        <AudioRecordIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <>
                            {t('core:newAudioRecording')}
                            {!Pro && <ProLabel />}
                          </>
                        }
                      />
                    </MenuItem>
                    <Divider />
                    <MenuItem
                      key="createNewLocationTID"
                      ata-tid="createNewFolderTID"
                      onClick={() => {
                        setSelectedLocation(undefined);
                        openCreateEditLocationDialog();
                        setOpenCreateMenu(false);
                        if (hideDrawer) {
                          hideDrawer();
                        }
                      }}
                    >
                      <ListItemIcon>
                        <LocalLocationIcon />
                      </ListItemIcon>
                      <ListItemText primary={t('core:createLocationTitle')} />
                    </MenuItem>
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
        <LocationManager
          reduceHeightBy={140}
          show={currentOpenedPanel === 'locationManagerPanel'}
        />
        {currentOpenedPanel === 'tagLibraryPanel' && (
          <TagLibrary reduceHeightBy={140} />
        )}
        {currentOpenedPanel === 'searchPanel' && (
          <StoredSearches reduceHeightBy={140} />
        )}
        {currentOpenedPanel === 'helpFeedbackPanel' && (
          <HelpFeedbackPanel reduceHeightBy={150} />
        )}
      </Box>
      <Box
        style={{
          textAlign: 'center',
        }}
      >
        {showProTeaser && (
          <ProTeaser setShowTeaserBanner={setShowTeaserBanner} />
        )}
        <Tooltip title={t('core:settings')}>
          <IconButton
            id="verticalNavButton"
            data-tid="settings"
            onClick={() => {
              openSettingsDialog();
            }}
            style={{ marginTop: -15, marginRight: 2 }}
            size="large"
          >
            <SettingsIcon />
          </IconButton>
        </Tooltip>
        <ToggleButtonGroup exclusive>
          <ToggleButton
            onClick={() => showPanel('locationManagerPanel')}
            size="small"
            className={
              currentOpenedPanel === 'locationManagerPanel'
                ? classNames(classes.button, classes.selectedButton)
                : classes.button
            }
            data-tid="locationManager"
            value="check"
          >
            <Tooltip
              title={t('core:locationManager')}
              keyBinding={keyBindings['showLocationManager']}
            >
              <LocalLocationIcon />
            </Tooltip>
          </ToggleButton>
          <ToggleButton
            data-tid="tagLibrary"
            onClick={() => showPanel('tagLibraryPanel')}
            size="small"
            className={
              currentOpenedPanel === 'tagLibraryPanel'
                ? classNames(classes.button, classes.selectedButton)
                : classes.button
            }
            value="check"
          >
            <Tooltip
              title={t('core:tagLibrary')}
              keyBinding={keyBindings['showTagLibrary']}
            >
              <TagLibraryIcon />
            </Tooltip>
          </ToggleButton>
          <ToggleButton
            data-tid="quickAccessButton"
            size="small"
            onClick={() => showPanel('searchPanel')}
            className={
              currentOpenedPanel === 'searchPanel'
                ? classNames(classes.button, classes.selectedButton)
                : classes.button
            }
            value="check"
          >
            <Tooltip title={t('core:quickAccess')}>
              <RecentThingsIcon />
            </Tooltip>
          </ToggleButton>
          <ToggleButton
            data-tid="helpFeedback"
            onClick={() => showPanel('helpFeedbackPanel')}
            size="small"
            className={
              currentOpenedPanel === 'helpFeedbackPanel'
                ? classNames(classes.button, classes.selectedButton)
                : classes.button
            }
            value="check"
          >
            <Tooltip title={t('core:helpFeedback')}>
              <HelpIcon />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
        {currentUser ? (
          <>
            <Tooltip title={t('core:userAccount')}>
              <IconButton
                data-tid="accountCircleIconTID"
                onClick={(event: React.MouseEvent<HTMLButtonElement>) =>
                  setAnchorUser(event.currentTarget)
                }
                style={{ marginTop: -15, marginRight: 2 }}
                size="large"
              >
                <AccountCircleIcon />
              </IconButton>
            </Tooltip>
            <Popover
              open={Boolean(anchorUser)}
              anchorEl={anchorUser}
              onClose={() => setAnchorUser(null)}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
            >
              <UserDetailsPopover onClose={() => setAnchorUser(null)} />
            </Popover>
          </>
        ) : (
          <Tooltip title={t('core:switchTheme')}>
            <IconButton
              data-tid="switchTheme"
              onClick={switchTheme}
              style={{ marginTop: -15, marginRight: 2 }}
              size="large"
            >
              <ThemingIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Root>
  );
}
export default MobileNavigation;
