/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces GmbH
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

import AppConfig from '-/AppConfig';
import {
  AccountIcon,
  AddExistingFileIcon,
  AudioFileIcon,
  CreateFileIcon,
  DownloadIcon,
  HTMLFileIcon,
  HelpIcon,
  LinkFileIcon,
  LocalLocationIcon,
  MarkdownFileIcon,
  NewFileIcon,
  NewFolderIcon,
  OpenLinkIcon,
  OpenNewWindowIcon,
  RecentThingsIcon,
  SettingsIcon,
  TagLibraryIcon,
  ThemingIcon,
} from '-/components/CommonIcons';
import CustomLogo from '-/components/CustomLogo';
import HelpFeedbackPanel from '-/components/HelpFeedbackPanel';
import { ProLabel } from '-/components/HelperComponents';
import InfoIcon from '-/components/InfoIcon';
import LocationManager from '-/components/LocationManager';
import ProTeaser from '-/components/ProTeaser';
import StoredSearches from '-/components/StoredSearches';
import TagLibrary from '-/components/TagLibrary';
import TsButton from '-/components/TsButton';
import TsMenuList from '-/components/TsMenuList';
import TsToolbarButton from '-/components/TsToolbarButton';
import { useCreateDirectoryDialogContext } from '-/components/dialogs/hooks/useCreateDirectoryDialogContext';
import { useCreateEditLocationDialogContext } from '-/components/dialogs/hooks/useCreateEditLocationDialogContext';
import { useDownloadUrlDialogContext } from '-/components/dialogs/hooks/useDownloadUrlDialogContext';
import { useLinkDialogContext } from '-/components/dialogs/hooks/useLinkDialogContext';
import { useNewAudioDialogContext } from '-/components/dialogs/hooks/useNewAudioDialogContext';
import { useNewFileDialogContext } from '-/components/dialogs/hooks/useNewFileDialogContext';
import { useSettingsDialogContext } from '-/components/dialogs/hooks/useSettingsDialogContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useFileUploadContext } from '-/hooks/useFileUploadContext';
import { usePanelsContext } from '-/hooks/usePanelsContext';
import { useUserContext } from '-/hooks/useUserContext';
import { Pro } from '-/pro';
import { AppDispatch } from '-/reducers/app';
import {
  actions as SettingsActions,
  getKeyBindingObject,
  isDesktopMode,
} from '-/reducers/settings';
import { createNewInstance } from '-/services/utils-io';
import { ClickAwayListener } from '@mui/base/ClickAwayListener';
import { Divider, Popover } from '@mui/material';
import Box from '@mui/material/Box';
import ButtonGroup from '@mui/material/ButtonGroup';
import Grow from '@mui/material/Grow';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import { alpha, useTheme } from '@mui/material/styles';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import TsIconButton from './TsIconButton';
import UserDetailsPopover from './UserDetailsPopover';

interface Props {
  hideDrawer?: () => void;
  width?: number;
}

function MobileNavigation(props: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const desktopMode = useSelector(isDesktopMode);
  const dispatch: AppDispatch = useDispatch();
  const { setSelectedLocation, findLocation } = useCurrentLocationContext();
  const { currentDirectoryPath } = useDirectoryContentContext();
  const { openFileUpload } = useFileUploadContext();
  const { openCreateEditLocationDialog } = useCreateEditLocationDialogContext();
  const { openCreateDirectoryDialog } = useCreateDirectoryDialogContext();
  const { openNewFileDialog } = useNewFileDialogContext();
  const { openNewAudioDialog } = useNewAudioDialogContext();
  const { openSettingsDialog } = useSettingsDialogContext();
  const { openLinkDialog } = useLinkDialogContext();
  const { currentOpenedPanel, showPanel } = usePanelsContext();
  const { openDownloadUrl } = useDownloadUrlDialogContext();
  const keyBindings = useSelector(getKeyBindingObject);
  const { currentUser } = useUserContext();
  const [showTeaserBanner, setShowTeaserBanner] = useState<boolean>(true);
  const [anchorUser, setAnchorUser] = useState<HTMLButtonElement | null>(null);
  const showProTeaser = !Pro && showTeaserBanner;
  const { hideDrawer, width } = props;
  const switchTheme = () => dispatch(SettingsActions.switchTheme());
  const [openedCreateMenu, setOpenCreateMenu] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const currentLocation = findLocation();

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
    <Box
      style={{
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
          height: showProTeaser ? 'calc(100% - 190px)' : 'calc(100% - 55px)',
        }}
      >
        <Box>
          <CustomLogo />
          <Box
            style={{
              width: '100%',
              justifyContent: 'center',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ButtonGroup
              ref={anchorRef}
              aria-label="split button"
              style={{
                textAlign: 'center',
                marginLeft: 5,
                marginRight: 5,
              }}
            >
              <TsButton
                aria-controls={
                  openedCreateMenu ? 'split-button-menu' : undefined
                }
                aria-expanded={openedCreateMenu ? 'true' : undefined}
                aria-haspopup="menu"
                data-tid="createNewDropdownButtonTID"
                onClick={handleToggle}
                startIcon={<CreateFileIcon />}
                style={{
                  borderRadius: 'unset',
                  borderTopLeftRadius: AppConfig.defaultCSSRadius,
                  borderBottomLeftRadius: AppConfig.defaultCSSRadius,
                }}
              >
                <Box
                  style={{
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    maxWidth: 100,
                  }}
                >
                  {t('core:createNew')}
                </Box>
              </TsButton>
              <TsButton
                tooltip={t('core:openSharingLink')}
                data-tid="openLinkNavigationTID"
                onClick={() => {
                  openLinkDialog();
                }}
                style={{
                  borderRadius: 'unset',
                  borderTopRightRadius: AppConfig.defaultCSSRadius,
                  borderBottomRightRadius: AppConfig.defaultCSSRadius,
                }}
                startIcon={<OpenLinkIcon />}
              >
                <Box
                  style={{
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    maxWidth: 100,
                  }}
                >
                  {t('core:openLink')}
                </Box>
              </TsButton>
            </ButtonGroup>
            {currentUser ? (
              <>
                <TsIconButton
                  tooltip={t('core:userAccount')}
                  data-tid="accountCircleIconTID"
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) =>
                    setAnchorUser(event.currentTarget)
                  }
                  title={t('core:userAccount')}
                >
                  <AccountIcon />
                </TsIconButton>
                <Popover
                  open={Boolean(anchorUser)}
                  anchorEl={anchorUser}
                  onClose={() => setAnchorUser(null)}
                  anchorOrigin={{
                    vertical: 'bottom',
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
              <TsIconButton
                tooltip={t('core:switchTheme')}
                data-tid="switchTheme"
                onClick={switchTheme}
              >
                <ThemingIcon />
              </TsIconButton>
            )}
          </Box>
        </Box>

        <ClickAwayListener onClickAway={handleClose}>
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
                  <TsMenuList id="split-button-menu" autoFocusItem>
                    <MenuItem
                      key="navCreateNewTextFile"
                      data-tid="navCreateNewTextFileTID"
                      onClick={() => {
                        openNewFileDialog('txt');
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
                      key="navCreateNewMarkdownFile"
                      data-tid="navCreateNewMarkdownFileTID"
                      onClick={() => {
                        openNewFileDialog('md');
                        setOpenCreateMenu(false);
                        if (hideDrawer) {
                          hideDrawer();
                        }
                      }}
                    >
                      <ListItemIcon>
                        <MarkdownFileIcon />
                      </ListItemIcon>
                      <ListItemText primary={t('core:createMarkdown')} />
                      <InfoIcon tooltip={t('core:createMarkdownTitle')} />
                    </MenuItem>
                    <MenuItem
                      key="navCreateHTMLTextFile"
                      data-tid="navCreateHTMLTextFileTID"
                      onClick={() => {
                        openNewFileDialog('html');
                        setOpenCreateMenu(false);
                        if (hideDrawer) {
                          hideDrawer();
                        }
                      }}
                    >
                      <ListItemIcon>
                        <HTMLFileIcon />
                      </ListItemIcon>
                      <ListItemText primary={t('core:createRichTextFile')} />
                      <InfoIcon tooltip={t('core:createNoteTitle')} />
                    </MenuItem>
                    <MenuItem
                      key="navCreateNewLinkFile"
                      data-tid="navCreateNewLinkFileTID"
                      onClick={() => {
                        openNewFileDialog('url');
                        setOpenCreateMenu(false);
                        if (hideDrawer) {
                          hideDrawer();
                        }
                      }}
                    >
                      <ListItemIcon>
                        <LinkFileIcon />
                      </ListItemIcon>
                      <ListItemText primary={t('core:createLinkFile')} />
                    </MenuItem>
                    <MenuItem
                      key="navCreateNewAudio"
                      data-tid="navCreateNewAudioTID"
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
                        <AudioFileIcon />
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
                      key="addUploadFiles"
                      data-tid="addUploadFilesTID"
                      onClick={() => {
                        openFileUpload(currentDirectoryPath);
                        setOpenCreateMenu(false);
                        if (hideDrawer) {
                          hideDrawer();
                        }
                      }}
                    >
                      <ListItemIcon>
                        <AddExistingFileIcon />
                      </ListItemIcon>
                      <ListItemText primary={t('core:addFiles')} />
                    </MenuItem>
                    {AppConfig.isElectron &&
                      !currentLocation?.haveObjectStoreSupport() && (
                        <MenuItem
                          key="newFromDownloadURL"
                          data-tid="newFromDownloadURLTID"
                          onClick={() => {
                            openDownloadUrl();
                            setOpenCreateMenu(false);
                            if (hideDrawer) {
                              hideDrawer();
                            }
                          }}
                        >
                          <ListItemIcon>
                            <DownloadIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={t('core:newFromDownloadURL')}
                          />
                        </MenuItem>
                      )}
                    <Divider />
                    <MenuItem
                      key="createNewFolder"
                      data-tid="createNewFolderTID"
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
                      <ListItemText primary={t('core:createDirectory')} />
                    </MenuItem>
                    <Divider />
                    <MenuItem
                      key="createNewLocation"
                      data-tid="createNewLocationTID"
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
                      <ListItemText primary={t('core:createLocation')} />
                    </MenuItem>
                    {!AppConfig.isCordova && (
                      <>
                        <MenuItem
                          key="createWindow"
                          data-tid="createWindowTID"
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
                      </>
                    )}
                  </TsMenuList>
                </Paper>
              </Grow>
            )}
          </Popper>
        </ClickAwayListener>
        <LocationManager
          reduceHeightBy={150}
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
          display: 'flex',
          flexDirection: 'column',
          marginTop: desktopMode ? -10 : -25,
          backgroundColor: theme.palette.background.default,
        }}
      >
        {showProTeaser && (
          <ProTeaser setShowTeaserBanner={setShowTeaserBanner} />
        )}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignSelf: 'center',
            backgroundColor: theme.palette.background.default,
          }}
        >
          <TsToolbarButton
            title={t('core:locationManager')}
            tooltip={t('core:locationManager')}
            keyBinding={keyBindings['showLocationManager']}
            onClick={() => showPanel('locationManagerPanel')}
            sx={{
              backgroundColor:
                currentOpenedPanel === 'locationManagerPanel'
                  ? theme.palette.primary.light
                  : theme.palette.background.default,
            }}
            data-tid="locationManager"
          >
            <LocalLocationIcon />
          </TsToolbarButton>
          <TsToolbarButton
            data-tid="tagLibrary"
            title={t('core:tagLibrary')}
            tooltip={t('core:tagLibrary')}
            keyBinding={keyBindings['showTagLibrary']}
            onClick={() => showPanel('tagLibraryPanel')}
            sx={{
              backgroundColor:
                currentOpenedPanel === 'tagLibraryPanel'
                  ? theme.palette.primary.light
                  : theme.palette.background.default,
            }}
          >
            <TagLibraryIcon />
          </TsToolbarButton>
          <TsToolbarButton
            title={t('core:quickAccess')}
            tooltip={t('core:quickAccess')}
            data-tid="quickAccessButton"
            onClick={() => showPanel('searchPanel')}
            sx={{
              backgroundColor:
                currentOpenedPanel === 'searchPanel'
                  ? theme.palette.primary.light
                  : theme.palette.background.default,
            }}
          >
            <RecentThingsIcon />
          </TsToolbarButton>
          <TsToolbarButton
            tooltip={t('core:helpFeedback')}
            title={t('core:help')}
            data-tid="helpFeedback"
            onClick={() => showPanel('helpFeedbackPanel')}
            sx={{
              backgroundColor:
                currentOpenedPanel === 'helpFeedbackPanel'
                  ? theme.palette.primary.light
                  : theme.palette.background.default,
            }}
          >
            <HelpIcon />
          </TsToolbarButton>
          <TsToolbarButton
            tooltip={t('core:settings')}
            id="verticalNavButton"
            data-tid="settings"
            onClick={() => {
              openSettingsDialog();
            }}
            sx={{
              backgroundColor: theme.palette.background.default,
            }}
            title={t('core:settings')}
          >
            <SettingsIcon />
          </TsToolbarButton>
        </Box>
      </Box>
    </Box>
  );
}
export default MobileNavigation;
