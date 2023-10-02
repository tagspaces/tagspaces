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

import React, { useCallback, useEffect, useState } from 'react';
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
  getDefaultPerspective
} from '-/reducers/settings';
import {
  actions as AppActions,
  getSelectedEntries,
  getProgress,
  isSearchMode,
  getLastSearchTimestamp,
  OpenedEntry
} from '../reducers/app';
import LoadingLazy from '../components/LoadingLazy';
import {
  GoBackIcon,
  GoForwardIcon,
  MainMenuIcon,
  SearchIcon
} from './CommonIcons';
import { Pro } from '../pro';
import RenameEntryDialog from '-/components/dialogs/RenameEntryDialog';
import { TS } from '-/tagspaces.namespace';
import PathBreadcrumbs from './PathBreadcrumbs';
import { enhanceOpenedEntry, openedToFsEntry } from '-/services/utils-io';
import {
  actions as LocationIndexActions,
  getSearchQuery
} from '-/reducers/location-index';
import { PerspectiveIDs, AvailablePerspectives } from '-/perspectives';
// import LoadingAnimation from '-/components/LoadingAnimation';
import SearchBox from '-/components/SearchBox';
import useFirstRender from '-/utils/useFirstRender';
import { useTranslation } from 'react-i18next';
import { SortedDirContextProvider } from '-/perspectives/grid-perspective/hooks/SortedDirContextProvider';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';

const GridPerspective = React.lazy(() =>
  import(
    /* webpackChunkName: "GridPerspective" */ '../perspectives/grid-perspective'
  )
);
function GridPerspectiveAsync(props) {
  return (
    <React.Suspense fallback={<LoadingLazy />}>
      <SortedDirContextProvider>
        <GridPerspective {...props} />
      </SortedDirContextProvider>
    </React.Suspense>
  );
}

const ListPerspective = React.lazy(() =>
  import(/* webpackChunkName: "ListPerspective" */ '../perspectives/list')
);
function ListPerspectiveAsync(props) {
  return (
    <React.Suspense fallback={<LoadingLazy />}>
      <SortedDirContextProvider>
        <ListPerspective {...props} />
      </SortedDirContextProvider>
    </React.Suspense>
  );
}

let GalleryPerspective = React.Fragment;
if (Pro && Pro.Perspectives && Pro.Perspectives.GalleryPerspective) {
  // GalleryPerspective = React.lazy(() => import(/* webpackChunkName: "GalleryPerspective" */ '../node_modules/@tagspaces/pro/modules/perspectives/gallery'));

  GalleryPerspective = Pro.Perspectives.GalleryPerspective;
}
function GalleryPerspectiveAsync(props) {
  return (
    <React.Suspense fallback={<LoadingLazy />}>
      <GalleryPerspective {...props} />
    </React.Suspense>
  );
}

let MapiquePerspective = React.Fragment;
if (Pro && Pro.Perspectives && Pro.Perspectives.MapiquePerspective) {
  // MapiquePerspective = React.lazy(() => import(/* webpackChunkName: "MapiquePerspective" */ '../node_modules/@tagspaces/pro/modules/perspectives/mapique'));
  MapiquePerspective = Pro.Perspectives.MapiquePerspective;
}
function MapiquePerspectiveAsync(props) {
  return (
    <React.Suspense fallback={<LoadingLazy />}>
      <MapiquePerspective {...props} />
    </React.Suspense>
  );
}

let KanBanPerspective = React.Fragment;
if (Pro && Pro.Perspectives && Pro.Perspectives.KanBanPerspective) {
  KanBanPerspective = Pro.Perspectives.KanBanPerspective;
}
function KanBanPerspectiveAsync(props) {
  return (
    <React.Suspense fallback={<LoadingLazy />}>
      <KanBanPerspective {...props} />
    </React.Suspense>
  );
}

const WelcomePanel = React.lazy(() =>
  import(/* webpackChunkName: "WelcomePanel" */ './WelcomePanel')
);
function WelcomePanelAsync(props) {
  return (
    <React.Suspense fallback={<LoadingLazy />}>
      <WelcomePanel {...props} />
    </React.Suspense>
  );
}

interface Props {
  settings: any;
  renameFile: () => void;
  reflectCreateEntry: (path: string, isFile: boolean) => void;
  setSelectedEntries: (selectedEntries: Array<Object>) => void;
  isDesktopMode: boolean;
  showNotification: (content: string) => void;
  toggleDrawer?: () => void;
  toggleProTeaser: (slidePage?: string) => void;
  drawerOpened: boolean;
  maxSearchResults: number;
  defaultPerspective: string;
  selectedEntries: Array<TS.FileSystemEntry>;
  toggleUploadDialog: () => void;
  progress?: Array<any>;
  searchQuery: TS.SearchQuery;
  setSearchQuery: (searchQuery: TS.SearchQuery) => void;
  enterSearchMode: () => void;
  exitSearchMode: () => void;
  goBack: () => void;
  goForward: () => void;
  lastSearchTimestamp: number;
  isSearchMode: boolean;
  openMoveCopyFilesDialog: () => void;
}

function FolderContainer(props: Props) {
  const {
    toggleDrawer,
    toggleProTeaser,
    isDesktopMode,
    setSelectedEntries,
    reflectCreateEntry,
    defaultPerspective,
    goBack,
    goForward
  } = props;

  const { t } = useTranslation();
  const theme = useTheme();
  const { openedEntries } = useOpenedEntryContext();
  const {
    currentDirectoryEntries,
    currentDirectoryPath,
    currentDirectoryPerspective,
    setCurrentDirectoryPerspective,
    loadParentDirectoryContent
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

  const [isRenameEntryDialogOpened, setIsRenameEntryDialogOpened] = useState<
    boolean
  >(false);

  let currentPerspective =
    currentDirectoryPerspective || defaultPerspective || PerspectiveIDs.GRID;

  if (currentPerspective === PerspectiveIDs.UNSPECIFIED) {
    currentPerspective = defaultPerspective;
  }

  const showWelcomePanel =
    !currentDirectoryPath &&
    currentDirectoryEntries.length < 1 &&
    !(props.isSearchMode && props.lastSearchTimestamp);

  const openRenameEntryDialog = useCallback(
    () => setIsRenameEntryDialogOpened(true),
    []
  );

  const renderPerspective = () => {
    if (showWelcomePanel) {
      return AppConfig.showWelcomePanel ? <WelcomePanelAsync /> : null;
    }
    if (currentPerspective === PerspectiveIDs.LIST) {
      return (
        <ListPerspectiveAsync openRenameEntryDialog={openRenameEntryDialog} />
      );
    }
    if (Pro && currentPerspective === PerspectiveIDs.GALLERY) {
      return (
        <GalleryPerspectiveAsync
          directoryContent={currentDirectoryEntries}
          lastSearchTimestamp={props.lastSearchTimestamp}
          switchPerspective={switchPerspective}
        />
      );
    }
    if (Pro && currentPerspective === PerspectiveIDs.MAPIQUE) {
      return (
        <MapiquePerspectiveAsync
          directoryContent={currentDirectoryEntries}
          lastSearchTimestamp={props.lastSearchTimestamp}
          switchPerspective={switchPerspective}
        />
      );
    }
    if (Pro && currentPerspective === PerspectiveIDs.KANBAN) {
      return (
        <KanBanPerspectiveAsync
          directoryContent={currentDirectoryEntries}
          lastSearchTimestamp={props.lastSearchTimestamp}
          openRenameEntryDialog={openRenameEntryDialog}
          loadParentDirectoryContent={loadParentDirectoryContent}
          renameFile={props.renameFile}
          switchPerspective={switchPerspective}
        />
      );
    }

    return (
      <GridPerspectiveAsync openRenameEntryDialog={openRenameEntryDialog} />
    );
  };

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
      fileProgress => fileProgress.progress < 100 && fileProgress.progress > -1
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
  AvailablePerspectives.forEach(perspective => {
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
      </ToggleButton>
    );
  });

  const toggleSearchMode = () => {
    if (props.isSearchMode) {
      props.setSearchQuery({});
      props.exitSearchMode();
    } else {
      props.setSearchQuery({ textQuery: '' });
      props.enterSearchMode();
    }
  };

  const openSearchKeyBinding = AppConfig.isElectron
    ? ' (' + (AppConfig.isMaclike ? '⌘' : 'Ctrl') + '+Shift+F)'
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
        position: 'relative'
      }}
      data-tid="folderContainerTID"
    >
      <div
        style={{
          paddingLeft: 5,
          paddingRight: 5,
          display: 'flex',
          alignItems: 'center',
          minHeight: 50
        }}
      >
        <IconButton
          id="mobileMenuButton"
          // style={{
          //   transform: drawerOpened ? 'rotate(0deg)' : 'rotate(180deg)',
          //   width: 50
          // }}
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
            >
              <GoForwardIcon />
            </IconButton>
          </Tooltip>
        )}
        {props.isSearchMode ? (
          /* todo rethink if open props is needed */
          <SearchBox
            open={props.isSearchMode}
            textQuery={props.searchQuery.textQuery}
          />
        ) : (
          <>
            <div
              style={{
                flex: '1 1 1%',
                display: 'flex',
                flexDirection: 'column'
              }}
            />
            {/* <MainSearchField
              fullWidth
              data-tid="toggleSearch"
              defaultValue=""
              variant="outlined"
              size="small"
              style={{
                minWidth: 40,
                width: isEntryOpened ? 40 : 220,
                marginRight: 10
              }}
              onKeyDown={toggleSearchMode}
              onClick={toggleSearchMode}
              margin="dense"
              placeholder={t('core:searchTitle') + openSearchKeyBinding}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" style={{ marginRight: 0 }}>
                    <IconButton size="small" edge="end">
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            /> */}
            <Tooltip title={t('core:searchTitle') + openSearchKeyBinding}>
              <IconButton data-tid="toggleSearch" onClick={toggleSearchMode}>
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
                  margin: '0'
                }}
              >
                <CircularProgressWithLabel value={getProgressValue()} />
              </IconButton>
            )}
            <PathBreadcrumbs
              switchPerspective={switchPerspective}
              setSelectedEntries={setSelectedEntries}
              reflectCreateEntry={reflectCreateEntry}
              isDesktopMode={isDesktopMode}
              openRenameDirectoryDialog={() =>
                setIsRenameEntryDialogOpened(true)
              }
              openMoveCopyFilesDialog={props.openMoveCopyFilesDialog}
            />
          </>
        )}
      </div>
      <div
        style={{
          minHeight: '100%',
          width: '100%'
        }}
      >
        {/*<LoadingAnimation />*/}
        {renderPerspective()}
        {isRenameEntryDialogOpened && (
          <RenameEntryDialog
            open={isRenameEntryDialogOpened}
            onClose={() => setIsRenameEntryDialogOpened(false)}
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
            backgroundColor: theme.palette.background.default
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
    settings: state.settings,
    selectedEntries: getSelectedEntries(state),
    maxSearchResults: getMaxSearchResults(state),
    isDesktopMode: getDesktopMode(state),
    progress: getProgress(state),
    searchQuery: getSearchQuery(state),
    defaultPerspective: getDefaultPerspective(state),
    lastSearchTimestamp: getLastSearchTimestamp(state),
    isSearchMode: isSearchMode(state)
  };
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(
    {
      toggleUploadDialog: AppActions.toggleUploadDialog,
      renameFile: AppActions.renameFile,
      reflectCreateEntry: AppActions.reflectCreateEntry,
      setSelectedEntries: AppActions.setSelectedEntries,
      showNotification: AppActions.showNotification,
      enterSearchMode: AppActions.enterSearchMode,
      exitSearchMode: AppActions.exitSearchMode,
      setSearchQuery: LocationIndexActions.setSearchQuery
    },
    dispatch
  );
}

const areEqual = (prevProp: Props, nextProp: Props) =>
  nextProp.settings.currentTheme === prevProp.settings.currentTheme &&
  nextProp.drawerOpened === prevProp.drawerOpened &&
  nextProp.isDesktopMode === prevProp.isDesktopMode &&
  /* this props is set before currentDirectoryEntries is loaded and will reload FolderContainer */
  JSON.stringify(nextProp.progress) === JSON.stringify(prevProp.progress) &&
  JSON.stringify(nextProp.searchQuery) ===
    JSON.stringify(prevProp.searchQuery) &&
  nextProp.lastSearchTimestamp === prevProp.lastSearchTimestamp &&
  nextProp.isSearchMode === prevProp.isSearchMode;

export default connect(
  mapStateToProps,
  mapActionCreatorsToProps
)(
  // @ts-ignore
  React.memo(FolderContainer, areEqual)
);
