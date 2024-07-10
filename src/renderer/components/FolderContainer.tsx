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

import React, { useCallback, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';
import useMediaQuery from '@mui/material/useMediaQuery';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '-/components/Tooltip';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import AppConfig from '-/AppConfig';
import { getDesktopMode, getKeyBindingObject } from '-/reducers/settings';
import {
  actions as AppActions,
  AppDispatch,
  getProgress,
} from '../reducers/app';
import {
  GoBackIcon,
  GoForwardIcon,
  MainMenuIcon,
  SearchIcon,
} from './CommonIcons';
import { Pro } from '../pro';
import RenameEntryDialog from '-/components/dialogs/RenameEntryDialog';
import PathBreadcrumbs from './PathBreadcrumbs';
import { PerspectiveIDs, AvailablePerspectives } from '-/perspectives';
// import LoadingAnimation from '-/components/LoadingAnimation';
import SearchBox from '-/components/SearchBox';
import { useTranslation } from 'react-i18next';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import RenderPerspective from '-/components/RenderPerspective';
import { adjustKeyBinding } from '-/components/dialogs/KeyboardDialog';
import { useFileUploadDialogContext } from '-/components/dialogs/hooks/useFileUploadDialogContext';
import { useProTeaserDialogContext } from '-/components/dialogs/hooks/useProTeaserDialogContext';
import CustomDragLayer from '-/components/CustomDragLayer';
import TargetFileBox from '-/components/TargetFileBox';
import { NativeTypes } from 'react-dnd-html5-backend';

interface Props {
  toggleDrawer?: () => void;
  drawerOpened: boolean;
  goBack: () => void;
  goForward: () => void;
}

function FolderContainer(props: Props) {
  const { toggleDrawer, goBack, goForward, drawerOpened } = props;

  const { t } = useTranslation();
  const theme = useTheme();
  const keyBindings = useSelector(getKeyBindingObject);
  const { openFileUploadDialog } = useFileUploadDialogContext();
  const { openProTeaserDialog } = useProTeaserDialogContext();
  const {
    setSearchQuery,
    currentDirectoryEntries,
    currentDirectoryPath,
    getPerspective,
    setManualDirectoryPerspective,
    enterSearchMode,
    isSearchMode,
  } = useDirectoryContentContext();

  const [isRenameEntryDialogOpened, setRenameEntryDialogOpened] =
    useState<boolean>(false);

  const isDesktopMode = useSelector(getDesktopMode);
  const progress = useSelector(getProgress);

  const showWelcomePanel =
    !currentDirectoryPath && currentDirectoryEntries.length < 1;

  const openRenameEntryDialog = useCallback(
    () => setRenameEntryDialogOpened(true),
    [],
  );

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
    perspectiveToggleButtons.push(
      <ToggleButton
        value={perspective.id}
        aria-label={perspective.id}
        key={perspective.id}
        data-tid={perspective.key}
        onClick={() => switchPerspective(perspective.id)}
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
    setSearchQuery({ textQuery: '' });
    enterSearchMode();
  };

  const openSearchKeyBinding = `${adjustKeyBinding(keyBindings.openSearch)}`;
  const isTinyMode = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <div
      style={{
        width: '100%',
        height: 'calc(100% - 50px)',
        backgroundColor: theme.palette.background.default,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
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
        <IconButton
          id="mobileMenuButton"
          style={{
            // @ts-ignore
            WebkitAppRegion: 'no-drag',
            // transform: drawerOpened ? 'rotate(0deg)' : 'rotate(180deg)',
          }}
          onClick={toggleDrawer}
        >
          <MainMenuIcon />
        </IconButton>
        <Tooltip
          title={
            t('core:goback') + ' - BETA - ' + t('core:gobackClarification')
          }
        >
          <IconButton
            id="goBackButton"
            disabled={window.history.length < 2}
            onClick={goBack}
            style={{
              // @ts-ignore
              WebkitAppRegion: 'no-drag',
            }}
          >
            <GoBackIcon />
          </IconButton>
        </Tooltip>
        {isTinyMode && (
          <Tooltip title={t('core:goforward') + ' - BETA'}>
            <IconButton
              id="goForwardButton"
              disabled={window.history.length < 2}
              onClick={goForward}
              style={{
                // @ts-ignore
                WebkitAppRegion: 'no-drag',
              }}
            >
              <GoForwardIcon />
            </IconButton>
          </Tooltip>
        )}
        {isSearchMode ? (
          /* todo rethink if open props is needed */
          <SearchBox open={isSearchMode} />
        ) : (
          <>
            <div
              style={{
                flex: '1 1 1%',
                display: 'flex',
                flexDirection: 'column',
              }}
            />
            {isTinyMode ? (
              <Tooltip
                title={t('core:openSearch') + ' (' + openSearchKeyBinding + ')'}
              >
                <IconButton
                  data-tid="toggleSearch"
                  onClick={openSearchMode}
                  style={{
                    // @ts-ignore
                    WebkitAppRegion: 'no-drag',
                  }}
                >
                  <SearchIcon />
                </IconButton>
              </Tooltip>
            ) : (
              <Button
                variant="outlined"
                size="small"
                data-tid="toggleSearch"
                onClick={openSearchMode}
                startIcon={<SearchIcon />}
                style={{
                  // @ts-ignore
                  WebkitAppRegion: 'no-drag',
                  marginRight: 5,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
              >
                {t('core:searchTitle')}
                <span style={{ width: 10 }} />
                {openSearchKeyBinding}
              </Button>
            )}

            {progress?.length > 0 && (
              <IconButton
                id="progressButton"
                title={t('core:progress')}
                data-tid="uploadProgress"
                onClick={() => openFileUploadDialog()}
                style={{
                  position: 'relative',
                  padding: '8px 12px 6px 8px',
                  margin: '0',
                  // @ts-ignore
                  WebkitAppRegion: 'no-drag',
                }}
              >
                <CircularProgressWithLabel value={getProgressValue()} />
              </IconButton>
            )}
            <PathBreadcrumbs
              switchPerspective={switchPerspective}
              isDesktopMode={isDesktopMode}
              openRenameDirectoryDialog={() => setRenameEntryDialogOpened(true)}
            />
          </>
        )}
      </div>
      <div style={{ minHeight: '100%', width: '100%' }}>
        {/*<LoadingAnimation />*/}
        {/* eslint-disable-next-line jsx-a11y/anchor-has-content,jsx-a11y/anchor-is-valid */}
        <a href="#" id="downloadFile" />
        <RenderPerspective openRenameEntryDialog={openRenameEntryDialog} />
        {isRenameEntryDialogOpened && (
          <RenameEntryDialog
            open={isRenameEntryDialogOpened}
            onClose={() => setRenameEntryDialogOpened(false)}
          />
        )}
      </div>
      {isDesktopMode && (
        <ToggleButtonGroup
          value={getPerspective()}
          size="small"
          data-tid="floatingPerspectiveSwitcher"
          disabled={showWelcomePanel}
          aria-label="change perspective"
          exclusive
          style={{
            bottom: -40,
            right: 15,
            zIndex: 1000,
            opacity: 0.9,
            position: 'absolute',
            backgroundColor: theme.palette.background.default,
          }}
        >
          {perspectiveToggleButtons}
        </ToggleButtonGroup>
      )}
    </div>
  );
}

export default FolderContainer;
