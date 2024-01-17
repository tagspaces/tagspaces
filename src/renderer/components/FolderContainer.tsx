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
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '-/components/Tooltip';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import AppConfig from '-/AppConfig';
// import LocationMenu from './menus/LocationMenu';
import {
  getMaxSearchResults,
  getDesktopMode,
  getDefaultPerspective,
} from '-/reducers/settings';
import { actions as AppActions, getProgress } from '../reducers/app';
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
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import RenderPerspective from '-/components/RenderPerspective';
import { useLocationIndexContext } from '-/hooks/useLocationIndexContext';
import { adjustKeyBinding } from '-/components/dialogs/KeyboardDialog';

interface Props {
  isDesktopMode: boolean;
  toggleDrawer?: () => void;
  toggleProTeaser: (slidePage?: string) => void;
  drawerOpened: boolean;
  maxSearchResults: number;
  defaultPerspective: string;
  toggleUploadDialog: () => void;
  progress?: Array<any>;
  goBack: () => void;
  goForward: () => void;
}

function FolderContainer(props: Props) {
  const {
    toggleDrawer,
    toggleProTeaser,
    isDesktopMode,
    defaultPerspective,
    goBack,
    goForward,
  } = props;

  const { t } = useTranslation();
  const theme = useTheme();
  const { openedEntries } = useOpenedEntryContext();
  const {
    setSearchQuery,
    currentDirectoryEntries,
    currentDirectoryPath,
    currentDirectoryPerspective,
    setCurrentDirectoryPerspective,
    enterSearchMode,
    isSearchMode,
  } = useDirectoryContentContext();

  /**
   * reflect update openedFile from perspective
   */
  /*useEffect(() => {
    const { editedEntryPaths, openedFiles, openEntry } = props;

    if (!firstRender && editedEntryPaths && editedEntryPaths.length > 0) {
      editedEntryPaths.forEach(editedEntryPath => {
        const { action, path } = editedEntryPath;
        // update opened file after delete sidecar tags
        if (path && action.startsWith('edit')) {
          const openedFile = openedFiles[0];
          if (openedFile.path === path) {
            openEntry(path);
          }
        }
      });
    }
  }, [props.editedEntryPaths]);*/

  const [isRenameEntryDialogOpened, setRenameEntryDialogOpened] =
    useState<boolean>(false);

  let currentPerspective =
    currentDirectoryPerspective || defaultPerspective || PerspectiveIDs.GRID;

  if (currentPerspective === PerspectiveIDs.UNSPECIFIED) {
    currentPerspective = defaultPerspective;
  }

  const showWelcomePanel =
    !currentDirectoryPath && currentDirectoryEntries.length < 1;
  // && !(isSearchMode && props.lastSearchTimestamp);

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
    const objProgress = props.progress.find(
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
      setCurrentDirectoryPerspective(perspectiveId);
    } else if (perspectiveId === PerspectiveIDs.GALLERY) {
      toggleProTeaser(PerspectiveIDs.GALLERY);
    } else if (perspectiveId === PerspectiveIDs.MAPIQUE) {
      toggleProTeaser(PerspectiveIDs.MAPIQUE);
    } else if (perspectiveId === PerspectiveIDs.KANBAN) {
      toggleProTeaser(PerspectiveIDs.KANBAN);
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

  const openSearchKeyBinding = AppConfig.isElectron
    ? ' (' +
      adjustKeyBinding(
        AppConfig.isMacLike ? 'Command+Shift+F' : 'Ctrl+Shift+F',
      ) +
      ')'
    : '';
  // keyBindings['openSearch'].toUpperCase()

  const isEntryOpened = openedEntries.length > 0;

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
        {isDesktopMode && (
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
            <Tooltip title={t('core:searchTitle') + openSearchKeyBinding}>
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
            {props.progress && props.progress.length > 0 && (
              <IconButton
                id="progressButton"
                title={t('core:progress')}
                data-tid="uploadProgress"
                onClick={() => props.toggleUploadDialog()}
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
      <div
        style={{
          minHeight: '100%',
          width: '100%',
        }}
      >
        {/*<LoadingAnimation />*/}
        <RenderPerspective openRenameEntryDialog={openRenameEntryDialog} />
        {isRenameEntryDialogOpened && (
          <RenameEntryDialog
            open={isRenameEntryDialogOpened}
            onClose={() => setRenameEntryDialogOpened(false)}
          />
        )}
      </div>
      {props.isDesktopMode && (
        <ToggleButtonGroup
          value={currentPerspective}
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

function mapStateToProps(state) {
  return {
    maxSearchResults: getMaxSearchResults(state),
    isDesktopMode: getDesktopMode(state),
    progress: getProgress(state),
    defaultPerspective: getDefaultPerspective(state),
  };
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(
    {
      toggleUploadDialog: AppActions.toggleUploadDialog,
    },
    dispatch,
  );
}

const areEqual = (prevProp: Props, nextProp: Props) =>
  nextProp.drawerOpened === prevProp.drawerOpened &&
  nextProp.isDesktopMode === prevProp.isDesktopMode &&
  /* this props is set before currentDirectoryEntries is loaded and will reload FolderContainer */
  JSON.stringify(nextProp.progress) === JSON.stringify(prevProp.progress);

export default connect(
  mapStateToProps,
  mapActionCreatorsToProps,
)(
  // @ts-ignore
  React.memo(FolderContainer, areEqual),
);
