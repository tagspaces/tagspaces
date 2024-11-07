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

import React, { useState } from 'react';
import { alpha, useTheme, styled } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import Box from '@mui/material/Box';
import Tooltip from '-/components/Tooltip';
import ToggleButton from '@mui/material/ToggleButton';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import TsButton from '-/components/TsButton';
import ButtonGroup from '@mui/material/ButtonGroup';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import TsIconButton from '-/components/TsIconButton';
import { Divider } from '@mui/material';
import {
  OpenLinkIcon,
  OpenNewWindowIcon,
  NewFileIcon,
  NewFolderIcon,
  LocalLocationIcon,
  SettingsIcon,
  CreateFileIcon,
  MarkdownFileIcon,
  AudioFileIcon,
  HTMLFileIcon,
  LinkFileIcon,
  AccountIcon,
  AddExistingFileIcon,
  HelpIcon,
  ThemingIcon,
  TagLibraryIcon,
  RecentThingsIcon,
} from '-/components/CommonIcons';
import InfoIcon from '-/components/InfoIcon';
import Popover from '@mui/material/Popover';
import { Pro } from '-/pro';
import CustomLogo from '-/components/CustomLogo';
import ProTeaser from '-/components/ProTeaser';
import TagLibrary from '-/components/TagLibrary';
import LocationManager from '-/components/LocationManager';
import HelpFeedbackPanel from '-/components/HelpFeedbackPanel';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import TsMenuList from '-/components/TsMenuList';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { AppDispatch } from '-/reducers/app';
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
import { useNewFileDialogContext } from '-/components/dialogs/hooks/useNewFileDialogContext';
import { useNewAudioDialogContext } from '-/components/dialogs/hooks/useNewAudioDialogContext';
import { useSettingsDialogContext } from '-/components/dialogs/hooks/useSettingsDialogContext';
import { usePanelsContext } from '-/hooks/usePanelsContext';
import { useUserContext } from '-/hooks/useUserContext';
import { useFileUploadContext } from '-/hooks/useFileUploadContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useLinkDialogContext } from '-/components/dialogs/hooks/useLinkDialogContext';
import { useDownloadUrlDialogContext } from '-/components/dialogs/hooks/useDownloadUrlDialogContext';

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
  const { setSelectedLocation, currentLocation } = useCurrentLocationContext();
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
              ref={anchorRef}
              aria-label="split button"
              style={{
                textAlign: 'center',
              }}
            >
              <Tooltip title={t('core:createNew')}>
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
              </Tooltip>
              <Tooltip title={t('core:openSharingLink')}>
                <TsButton
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
              </Tooltip>
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
                  <TsMenuList id="split-button-menu" autoFocusItem>
                    <MenuItem
                      key="createNewTextFileTID"
                      ata-tid="createNewTextFileTID"
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
                      key="createNewMarkdownFileTID"
                      ata-tid="createNewMarkdownFileTID"
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
                      key="createHTMLTextFileTID"
                      data-tid="createHTMLTextFileTID"
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
                      key="createNewLinkFile"
                      data-tid="createNewLinkFileTID"
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
                      key="addUploadFilesTID"
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
                            <FileDownloadIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={t('core:newFromDownloadURL')}
                          />
                        </MenuItem>
                      )}
                    <Divider />
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
                      <ListItemText primary={t('core:createDirectory')} />
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
                      <ListItemText primary={t('core:createLocation')} />
                    </MenuItem>
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
                      </>
                    )}
                  </TsMenuList>
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
          <TsIconButton
            id="verticalNavButton"
            data-tid="settings"
            onClick={() => {
              openSettingsDialog();
            }}
            style={{ marginTop: -15, marginRight: 2 }}
            size="large"
          >
            <SettingsIcon />
          </TsIconButton>
        </Tooltip>
        <ToggleButtonGroup exclusive>
          <ToggleButton
            onClick={() => showPanel('locationManagerPanel')}
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
              <TsIconButton
                data-tid="accountCircleIconTID"
                onClick={(event: React.MouseEvent<HTMLButtonElement>) =>
                  setAnchorUser(event.currentTarget)
                }
                style={{ marginTop: -15, marginRight: 2 }}
                size="large"
              >
                <AccountIcon />
              </TsIconButton>
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
            <TsIconButton
              data-tid="switchTheme"
              onClick={switchTheme}
              style={{ marginTop: -15, marginRight: 2 }}
              size="large"
            >
              <ThemingIcon />
            </TsIconButton>
          </Tooltip>
        )}
      </Box>
    </Root>
  );
}
export default MobileNavigation;
