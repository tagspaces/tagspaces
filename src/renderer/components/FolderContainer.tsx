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
import { BetaLabel } from '-/components/HelperComponents';
import PathBreadcrumbs from '-/components/PathBreadcrumbs';
import RenderPerspective from '-/components/RenderPerspective';
import SearchBox from '-/components/SearchBox';
import Tooltip from '-/components/Tooltip';
import TsButton from '-/components/TsButton';
import TsIconButton from '-/components/TsIconButton';
import TsMenuList from '-/components/TsMenuList';
import { AIProvider } from '-/components/chat/ChatTypes';
import { adjustKeyBinding } from '-/components/dialogs/KeyboardDialog';
import { useFileUploadDialogContext } from '-/components/dialogs/hooks/useFileUploadDialogContext';
import { useProTeaserDialogContext } from '-/components/dialogs/hooks/useProTeaserDialogContext';
import { TabNames } from '-/hooks/EntryPropsTabsContextProvider';
import { useBrowserHistoryContext } from '-/hooks/useBrowserHistoryContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { AvailablePerspectives, PerspectiveIDs } from '-/perspectives';
import { Pro } from '-/pro';
import { getProgress } from '-/reducers/app';
import {
  getDefaultAIProvider,
  getDesktopMode,
  getKeyBindingObject,
  isDevMode,
} from '-/reducers/settings';
import BlurOnIcon from '@mui/icons-material/BlurOn';
import { Fab, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
  AIIcon,
  GoBackIcon,
  GoForwardIcon,
  MainMenuIcon,
  SearchIcon,
} from './CommonIcons';
import TsToggleButton from './TsToggleButton';

interface Props {
  toggleDrawer?: () => void;
  drawerOpened: boolean;
  hidden?: boolean;
}

function FolderContainer({ toggleDrawer, drawerOpened, hidden }: Props) {
  const devMode: boolean = useSelector(isDevMode);
  const { t } = useTranslation();
  const theme = useTheme();
  const keyBindings = useSelector(getKeyBindingObject);
  const { findLocation } = useCurrentLocationContext();
  const { goForward, goBack, historyIndex } = useBrowserHistoryContext();
  const { openFileUploadDialog } = useFileUploadDialogContext();
  const { openProTeaserDialog } = useProTeaserDialogContext();
  const { openEntry } = useOpenedEntryContext();
  const aiDefaultProvider: AIProvider = useSelector(getDefaultAIProvider);
  const {
    currentDirectoryEntries,
    currentDirectoryPath,
    currentPerspective,
    setManualDirectoryPerspective,
    enterSearchMode,
    isSearchMode,
  } = useDirectoryContentContext();

  const isDesktopMode = useSelector(getDesktopMode);
  const progress = useSelector(getProgress);

  const [perspectiveMenuAnchorEl, setPerspectiveMenuAnchorEl] =
    useState<null | HTMLElement>(null);

  const openPerspectiveMenu = useCallback(
    (event: React.MouseEvent<HTMLElement>) =>
      setPerspectiveMenuAnchorEl(event.currentTarget),
    [],
  );
  const handlePerspectiveMenuClose = useCallback(
    () => setPerspectiveMenuAnchorEl(null),
    [],
  );

  const showWelcomePanel =
    !currentDirectoryPath && currentDirectoryEntries.length < 1;

  const CircularProgressWithLabel = useCallback(
    (prop: { value: number }) => (
      <Box position="relative" display="inline-flex">
        <CircularProgress size={24} variant="determinate" {...prop} />
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
            sx={{ color: theme.palette.text.primary, fontSize: '8px' }}
          >
            {`${prop.value}%`}
          </Typography>
        </Box>
      </Box>
    ),
    [theme.palette.text.primary],
  );

  const getProgressValue = useCallback(() => {
    const objProgress = progress.find(
      (fileProgress) =>
        fileProgress.progress < 100 && fileProgress.progress > -1,
    );
    return objProgress ? objProgress.progress : 100;
  }, [progress]);

  const switchPerspective = useCallback(
    (perspectiveId: string) => {
      if (
        Pro ||
        perspectiveId === PerspectiveIDs.GRID ||
        perspectiveId === PerspectiveIDs.LIST
      ) {
        setManualDirectoryPerspective(perspectiveId);
      } else if (
        [
          PerspectiveIDs.GALLERY,
          PerspectiveIDs.MAPIQUE,
          PerspectiveIDs.KANBAN,
          PerspectiveIDs.FOLDERVIZ,
        ].includes(perspectiveId)
      ) {
        openProTeaserDialog(perspectiveId);
      }
    },
    [setManualDirectoryPerspective, openProTeaserDialog],
  );

  const perspectiveToggleButtons = useMemo(
    () =>
      AvailablePerspectives.filter(
        (perspective) => devMode || perspective.id !== PerspectiveIDs.CALENDAR,
      ).map((perspective) => (
        <TsToggleButton
          value={perspective.id}
          aria-label={perspective.id}
          key={perspective.id}
          data-tid={perspective.key}
          onClick={() => switchPerspective(perspective.id)}
          sx={{
            opacity: 0.9,
            backgroundColor: theme.palette.background.default,
            border: '1px solid ' + theme.palette.divider,
          }}
        >
          <Tooltip
            title={
              perspective.title +
              (perspective.beta ? ' ' + t('core:betaStatus').toUpperCase() : '')
            }
          >
            <Box sx={{ display: 'flex' }}>{perspective.icon}</Box>
          </Tooltip>
        </TsToggleButton>
      )),
    [
      devMode,
      switchPerspective,
      theme.palette.background.default,
      theme.palette.divider,
      t,
    ],
  );

  const openSearchMode = useCallback(() => {
    enterSearchMode();
  }, [enterSearchMode]);

  const openSearchKeyBinding = useMemo(
    () => `${adjustKeyBinding(keyBindings.openSearch)}`,
    [keyBindings.openSearch],
  );
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const readOnlyLocation = findLocation()?.isReadOnly;

  const perspectiveMenuItems = useMemo(
    () =>
      AvailablePerspectives.filter(
        (perspective) => devMode || perspective.id !== PerspectiveIDs.CALENDAR,
      ).map((perspective) => {
        let badge = perspective.beta ? <BetaLabel /> : null;
        return (
          <MenuItem
            key={perspective.key}
            data-tid={perspective.key}
            onClick={() => {
              handlePerspectiveMenuClose();
              switchPerspective(perspective.id);
            }}
          >
            <ListItemIcon>{perspective.icon}</ListItemIcon>
            <ListItemText
              primary={
                <>
                  {perspective.title}
                  {badge}
                </>
              }
            />
          </MenuItem>
        );
      }),
    [devMode, handlePerspectiveMenuClose, switchPerspective],
  );

  return (
    <Box
      sx={{
        width: '100%',
        display: hidden ? 'none' : 'flex',
        height: 'calc(100% - 50px)',
        backgroundColor: theme.palette.background.default,
        flexDirection: 'column',
        position: 'relative',
      }}
      data-tid="folderContainerTID"
    >
      <Box
        sx={{
          paddingLeft: '5px',
          paddingRight: '5px',
          display: 'flex',
          alignItems: 'center',
          minHeight: 50,
          WebkitAppRegion: 'drag',
          marginLeft:
            AppConfig.isMacLike &&
            isDesktopMode &&
            !AppConfig.isWeb &&
            !drawerOpened
              ? '60px'
              : 0,
        }}
      >
        <TsIconButton
          id="mobileMenuButton"
          sx={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          onClick={toggleDrawer}
          tooltip={t('core:toggleSidebar')}
        >
          <MainMenuIcon />
        </TsIconButton>
        <TsIconButton
          tooltip={
            t('core:goback') + ' - BETA - ' + t('core:gobackClarification')
          }
          id="goBackButton"
          disabled={historyIndex === 0}
          onClick={goBack}
          sx={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <GoBackIcon />
        </TsIconButton>
        {smallScreen && (
          <TsIconButton
            tooltip={t('core:goforward') + ' - BETA'}
            id="goForwardButton"
            disabled={historyIndex === 0}
            onClick={goForward}
            sx={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          >
            <GoForwardIcon />
          </TsIconButton>
        )}
        {isSearchMode ? (
          <SearchBox />
        ) : (
          <>
            <Box
              sx={{
                margin: '0 10px 0 10px',
                flex: '1 1 1%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {smallScreen ? (
                <TsIconButton
                  tooltip={
                    t('core:openSearch') + ' (' + openSearchKeyBinding + ')'
                  }
                  data-tid="toggleSearch"
                  onClick={openSearchMode}
                  sx={
                    {
                      maxWidth: 100,
                      WebkitAppRegion: 'no-drag',
                    } as React.CSSProperties
                  }
                >
                  <SearchIcon />
                </TsIconButton>
              ) : (
                <TsButton
                  data-tid="toggleSearch"
                  onClick={openSearchMode}
                  color="secondary"
                  startIcon={<SearchIcon />}
                  sx={
                    {
                      marginTop: '-2px',
                      marginRight: '5px',
                      minWidth: 100,
                      maxHeight: 32,
                      width: 'stretch',
                      maxWidth: 300,
                      margin: '0 auto',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      WebkitAppRegion: 'no-drag',
                    } as React.CSSProperties
                  }
                >
                  {t('core:searchTitle')}
                  <Box sx={{ width: 10 }} />
                  {openSearchKeyBinding}
                </TsButton>
              )}
            </Box>
            {progress?.length > 0 && (
              <TsIconButton
                id="progressButton"
                title={t('core:progress')}
                data-tid="uploadProgress"
                onClick={() => openFileUploadDialog()}
                sx={
                  {
                    position: 'relative',
                    padding: '8px 12px 6px 8px',
                    margin: 0,
                    WebkitAppRegion: 'no-drag',
                  } as React.CSSProperties
                }
              >
                <CircularProgressWithLabel value={getProgressValue()} />
              </TsIconButton>
            )}
            <PathBreadcrumbs
              switchPerspective={switchPerspective}
              isDesktopMode={isDesktopMode}
            />
          </>
        )}
      </Box>
      <Box sx={{ minHeight: '100%', width: '100%', overflowY: 'auto' }}>
        {/* eslint-disable-next-line jsx-a11y/anchor-has-content,jsx-a11y/anchor-is-valid */}
        <a href="#" id="downloadFile" />
        <RenderPerspective />
      </Box>
      {isDesktopMode ? (
        <Box
          sx={{
            bottom: -35,
            right: 15,
            zIndex: 1000,
            position: 'absolute',
          }}
        >
          <ToggleButtonGroup
            value={currentPerspective}
            size="small"
            data-tid="floatingPerspectiveSwitcher"
            disabled={showWelcomePanel}
            aria-label="change perspective"
            exclusive
          >
            {perspectiveToggleButtons}
          </ToggleButtonGroup>
          {aiDefaultProvider && (
            <ToggleButtonGroup
              size="small"
              disabled={showWelcomePanel}
              aria-label="open folder ai chat"
              exclusive
            >
              <Tooltip
                title={
                  readOnlyLocation
                    ? t('core:aiChatForFolderDisabled')
                    : t('core:aiChatForFolder')
                }
              >
                <TsToggleButton
                  value=""
                  aria-label="chat-label"
                  data-tid="chatTID"
                  sx={{
                    marginLeft: '5px',
                    ...(readOnlyLocation
                      ? {}
                      : { color: theme.palette.primary.main }),
                    backgroundColor: theme.palette.background.default,
                    border: '1px solid ' + theme.palette.divider,
                  }}
                  onClick={() => {
                    if (readOnlyLocation) return;
                    openEntry(currentDirectoryPath, TabNames.aiTab);
                  }}
                >
                  <AIIcon />
                </TsToggleButton>
              </Tooltip>
            </ToggleButtonGroup>
          )}
        </Box>
      ) : (
        <>
          <Fab
            size="medium"
            color="secondary"
            aria-label="add"
            sx={{
              bottom: -30,
              right: 20,
              position: 'absolute',
            }}
            onClick={openPerspectiveMenu}
          >
            <BlurOnIcon />
          </Fab>
          <Menu
            id="demo-positioned-menu"
            aria-labelledby="demo-positioned-button"
            anchorEl={perspectiveMenuAnchorEl}
            open={Boolean(perspectiveMenuAnchorEl)}
            onClose={handlePerspectiveMenuClose}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
          >
            <TsMenuList>{perspectiveMenuItems}</TsMenuList>
          </Menu>
        </>
      )}
    </Box>
  );
}

export default React.memo(FolderContainer);
