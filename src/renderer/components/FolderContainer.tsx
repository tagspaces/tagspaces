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
import RenderPerspective from '-/components/RenderPerspective';
import SearchBox from '-/components/SearchBox';
import Tooltip from '-/components/Tooltip';
import TsButton from '-/components/TsButton';
import TsIconButton from '-/components/TsIconButton';
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
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
  ChatIcon,
  GoBackIcon,
  GoForwardIcon,
  MainMenuIcon,
  SearchIcon,
} from './CommonIcons';
import { BetaLabel } from './HelperComponents';
import PathBreadcrumbs from './PathBreadcrumbs';
import TsMenuList from './TsMenuList';

interface Props {
  toggleDrawer?: () => void;
  drawerOpened: boolean;
  style?: any;
}

function FolderContainer(props: Props) {
  const devMode: boolean = useSelector(isDevMode);
  const { toggleDrawer, drawerOpened, style } = props;
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
  const open = Boolean(perspectiveMenuAnchorEl);
  const perspectiveMenuOpenClick = (event: React.MouseEvent<HTMLElement>) => {
    setPerspectiveMenuAnchorEl(event.currentTarget);
  };
  const handlePerspectiveMenuClose = () => {
    setPerspectiveMenuAnchorEl(null);
  };

  const showWelcomePanel =
    !currentDirectoryPath && currentDirectoryEntries.length < 1;

  function CircularProgressWithLabel(prop) {
    return (
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
            style={{ color: theme.palette.text.primary, fontSize: 8 }}
          >
            {`${prop.value}%`}
          </Typography>
        </Box>
      </Box>
    );
  }

  const getProgressValue = () => {
    const objProgress = progress.find(
      (fileProgress) =>
        fileProgress.progress < 100 && fileProgress.progress > -1,
    );
    if (objProgress !== undefined) {
      return objProgress.progress;
    }
    return 100;
  };

  const switchPerspective = (perspectiveId: string) => {
    if (
      Pro ||
      perspectiveId === PerspectiveIDs.GRID ||
      perspectiveId === PerspectiveIDs.LIST
    ) {
      setManualDirectoryPerspective(perspectiveId);
    } else if (perspectiveId === PerspectiveIDs.GALLERY) {
      openProTeaserDialog(PerspectiveIDs.GALLERY);
    } else if (perspectiveId === PerspectiveIDs.MAPIQUE) {
      openProTeaserDialog(PerspectiveIDs.MAPIQUE);
    } else if (perspectiveId === PerspectiveIDs.KANBAN) {
      openProTeaserDialog(PerspectiveIDs.KANBAN);
    } else if (perspectiveId === PerspectiveIDs.FOLDERVIZ) {
      openProTeaserDialog(PerspectiveIDs.FOLDERVIZ);
    }
  };

  const perspectiveToggleButtons = [];
  AvailablePerspectives.forEach((perspective) => {
    if (!devMode && perspective.id === PerspectiveIDs.CALENDAR) {
      return;
    }
    perspectiveToggleButtons.push(
      <ToggleButton
        value={perspective.id}
        aria-label={perspective.id}
        key={perspective.id}
        data-tid={perspective.key}
        onClick={() => switchPerspective(perspective.id)}
        style={{
          opacity: 0.9,
          backgroundColor: theme.palette.background.default,
          borderColor: theme.palette.divider,
        }}
      >
        <Tooltip
          title={
            perspective.title +
            (perspective.beta ? ' ' + t('core:betaStatus').toUpperCase() : '')
          }
        >
          <div style={{ display: 'flex' }}>{perspective.icon}</div>
        </Tooltip>
      </ToggleButton>,
    );
  });

  const openSearchMode = () => {
    // setSearchQuery({ textQuery: '' });
    enterSearchMode();
  };

  const openSearchKeyBinding = `${adjustKeyBinding(keyBindings.openSearch)}`;
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const readOnlyLocation = findLocation()?.isReadOnly;

  const perspectiveMenuItem = [];
  AvailablePerspectives.forEach((perspective) => {
    let badge = <></>;
    // if (!Pro && perspective.pro) {
    //   badge = <ProLabel />;
    // }
    if (perspective.beta) {
      badge = <BetaLabel />;
    }
    if (!devMode && perspective.id === PerspectiveIDs.CALENDAR) {
      return;
    }
    perspectiveMenuItem.push(
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
      </MenuItem>,
    );
  });

  return (
    <div
      style={{
        width: '100%',
        height: 'calc(100% - 50px)',
        backgroundColor: theme.palette.background.default,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        ...style,
      }}
      data-tid="folderContainerTID"
    >
      <div
        style={{
          paddingLeft: 5,
          paddingRight: 5,
          display: 'flex',
          alignItems: 'center',
          minHeight: 50,
          // @ts-ignore
          WebkitAppRegion: 'drag',
          marginLeft:
            AppConfig.isMacLike &&
            isDesktopMode &&
            !AppConfig.isWeb &&
            !drawerOpened
              ? 60
              : 0,
        }}
      >
        <TsIconButton
          id="mobileMenuButton"
          style={
            {
              WebkitAppRegion: 'no-drag',
            } as React.CSSProperties & { WebkitAppRegion?: string }
          }
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
          style={
            {
              WebkitAppRegion: 'no-drag',
            } as React.CSSProperties & { WebkitAppRegion?: string }
          }
        >
          <GoBackIcon />
        </TsIconButton>
        {smallScreen && (
          <TsIconButton
            tooltip={t('core:goforward') + ' - BETA'}
            id="goForwardButton"
            disabled={historyIndex === 0}
            onClick={goForward}
            style={
              {
                WebkitAppRegion: 'no-drag',
              } as React.CSSProperties & { WebkitAppRegion?: string }
            }
          >
            <GoForwardIcon />
          </TsIconButton>
        )}
        {isSearchMode ? (
          /* todo rethink if open props is needed */
          <SearchBox />
        ) : (
          <>
            <div
              style={{
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
                  style={
                    {
                      maxWidth: 100,
                      WebkitAppRegion: 'no-drag',
                    } as React.CSSProperties & { WebkitAppRegion?: string }
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
                  style={
                    {
                      marginTop: -2,
                      marginRight: 5,
                      minWidth: 100,
                      width: 'stretch',
                      maxWidth: 300,
                      margin: '0 auto',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      WebkitAppRegion: 'no-drag',
                    } as React.CSSProperties & { WebkitAppRegion?: string }
                  }
                >
                  {t('core:searchTitle')}
                  <span style={{ width: 10 }} />
                  {openSearchKeyBinding}
                </TsButton>
              )}
            </div>

            {progress?.length > 0 && (
              <TsIconButton
                id="progressButton"
                title={t('core:progress')}
                data-tid="uploadProgress"
                onClick={() => openFileUploadDialog()}
                style={
                  {
                    position: 'relative',
                    padding: '8px 12px 6px 8px',
                    margin: '0',
                    WebkitAppRegion: 'no-drag',
                  } as React.CSSProperties & { WebkitAppRegion?: string }
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
      </div>
      <div style={{ minHeight: '100%', width: '100%', overflowY: 'auto' }}>
        {/* eslint-disable-next-line jsx-a11y/anchor-has-content,jsx-a11y/anchor-is-valid */}
        <a href="#" id="downloadFile" />
        <RenderPerspective />
      </div>
      {isDesktopMode ? (
        <ToggleButtonGroup
          value={currentPerspective}
          size="small"
          data-tid="floatingPerspectiveSwitcher"
          disabled={showWelcomePanel}
          aria-label="change perspective"
          exclusive
          style={{
            bottom: -35,
            right: 15,
            zIndex: 1000,
            // opacity: 0.9,
            position: 'absolute',
          }}
        >
          {perspectiveToggleButtons}
          {aiDefaultProvider && (
            <Tooltip
              title={
                readOnlyLocation
                  ? t('core:aiChatForFolderDisabled')
                  : t('core:aiChatForFolder')
              }
            >
              <ToggleButton
                value=""
                // disabled={readOnlyLocation}
                aria-label="chat-label"
                data-tid="chatTID"
                style={{
                  marginLeft: 5,
                  borderColor: theme.palette.divider,
                  ...(!readOnlyLocation && {
                    color: theme.palette.primary.main,
                  }),
                  backgroundColor: theme.palette.background.default,
                }}
                onClick={() => {
                  if (readOnlyLocation) return;
                  openEntry(currentDirectoryPath, TabNames.aiTab);
                }}
              >
                <ChatIcon />
              </ToggleButton>
            </Tooltip>
          )}
        </ToggleButtonGroup>
      ) : (
        <>
          <Fab
            size="medium"
            color="secondary"
            aria-label="add"
            style={{
              bottom: -30,
              right: 20,
              position: 'absolute',
            }}
            onClick={perspectiveMenuOpenClick}
          >
            <BlurOnIcon />
          </Fab>
          <Menu
            id="demo-positioned-menu"
            aria-labelledby="demo-positioned-button"
            anchorEl={perspectiveMenuAnchorEl}
            open={open}
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
            <TsMenuList>{perspectiveMenuItem}</TsMenuList>
          </Menu>
        </>
      )}
    </div>
  );
}

export default FolderContainer;
