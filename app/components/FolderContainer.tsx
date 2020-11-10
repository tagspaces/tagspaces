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

import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Button from '@material-ui/core/Button';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import BackButtonIcon from '@material-ui/icons/ArrowBack';
import IconButton from '@material-ui/core/IconButton';
import FolderSeparatorIcon from '@material-ui/icons/ChevronRight';
import MenuIcon from '@material-ui/icons/Menu';
import Badge from '@material-ui/core/Badge';
import { withStyles, withTheme } from '@material-ui/core/styles';
import LocationMenu from './menus/LocationMenu';
import DirectoryMenu from './menus/DirectoryMenu';
import i18n from '../services/i18n';
import {
  getPerspectives,
  getMaxSearchResults,
  getDesktopMode
} from '-/reducers/settings';
import { getLocations, Location } from '-/reducers/locations';
import {
  actions as AppActions,
  getDirectoryContent,
  getLastSelectedEntry,
  getSearchResultCount,
  isReadOnlyMode,
  getCurrentLocationPath,
  getCurrentDirectoryPerspective,
  OpenedEntry
} from '../reducers/app';
import TaggingActions from '../reducers/tagging-actions';
import { normalizePath, extractShortDirectoryName } from '-/utils/paths';
import PlatformIO from '../services/platform-io';
import LoadingLazy from '../components/LoadingLazy';
import { Pro } from '../pro';
import { savePerspective } from '-/utils/metaoperations';
import {
  enhanceOpenedEntry,
  FileSystemEntry,
  FileSystemEntryMeta
} from '-/services/utils-io';

const GridPerspective = React.lazy(() =>
  import(
    /* webpackChunkName: "GridPerspective" */ '../perspectives/grid-perspective/'
  )
);
const GridPerspectiveAsync = props => (
  <React.Suspense fallback={<LoadingLazy />}>
    <GridPerspective {...props} />
  </React.Suspense>
);

let GalleryPerspective = React.Fragment;
if (Pro && Pro.Perspectives && Pro.Perspectives.GalleryPerspective) {
  // GalleryPerspective = React.lazy(() => import(/* webpackChunkName: "GalleryPerspective" */ '../node_modules/@tagspaces/pro/modules/perspectives/gallery'));
  // eslint-disable-next-line prefer-destructuring
  GalleryPerspective = Pro.Perspectives.GalleryPerspective;
}
const GalleryPerspectiveAsync = props => (
  <React.Suspense fallback={<LoadingLazy />}>
    <GalleryPerspective {...props} />
  </React.Suspense>
);

let MapiquePerspective = React.Fragment;
if (Pro && Pro.Perspectives && Pro.Perspectives.MapiquePerspective) {
  // MapiquePerspective = React.lazy(() => import(/* webpackChunkName: "MapiquePerspective" */ '../node_modules/@tagspaces/pro/modules/perspectives/mapique'));
  // eslint-disable-next-line prefer-destructuring
  MapiquePerspective = Pro.Perspectives.MapiquePerspective;
}
const MapiquePerspectiveAsync = props => (
  <React.Suspense fallback={<LoadingLazy />}>
    <MapiquePerspective {...props} />
  </React.Suspense>
);

/* let TreeVizPerspective = React.Fragment;
if (Pro && Pro.Perspectives && Pro.Perspectives.TreeVizPerspective) {
  // TreeVizPerspective = React.lazy(() => import(/!* webpackChunkName: "TreeVizPerspective" *!/ '../node_modules/@tagspaces/pro/modules/perspectives/treeviz'));
  // eslint-disable-next-line prefer-destructuring
  TreeVizPerspective = Pro.Perspectives.TreeVizPerspective;
}
const TreeVizPerspectiveAsync = props => (
  <React.Suspense fallback={<LoadingLazy />}>
    <TreeVizPerspective {...props} />
  </React.Suspense>
); */

let KanBanPerspective = React.Fragment;
if (Pro && Pro.Perspectives && Pro.Perspectives.KanBanPerspective) {
  // eslint-disable-next-line prefer-destructuring
  KanBanPerspective = Pro.Perspectives.KanBanPerspective;
}
const KanBanPerspectiveAsync = props => (
  <React.Suspense fallback={<LoadingLazy />}>
    <KanBanPerspective {...props} />
  </React.Suspense>
);

const WelcomePanel = React.lazy(() =>
  import(/* webpackChunkName: "WelcomePanel" */ './WelcomePanel')
);
const WelcomePanelAsync = props => (
  <React.Suspense fallback={<LoadingLazy />}>
    <WelcomePanel {...props} />
  </React.Suspense>
);

const CounterBadge: any = withStyles(theme => ({
  badge: {
    top: '50%',
    right: -15,
    color:
      theme.palette.type === 'light'
        ? theme.palette.grey[900]
        : theme.palette.grey[200],
    backgroundColor:
      theme.palette.type === 'light'
        ? theme.palette.grey[200]
        : theme.palette.grey[900]
  }
}))(Badge);

const styles: any = (theme: any) => ({
  mainPanel: {
    flex: '1 1 100%',
    width: '100%',
    height: '100%',
    maxHeight: '100%',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.default,
    display: 'flex',
    flexDirection: 'column'
  },
  toolbar: {
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 5,
    display: 'flex',
    justifyContent: 'center'
  },
  topPanel: {
    height: 50,
    width: '100%',
    backgroundColor: theme.palette.background.default
  },
  centerPanel: {
    flex: '1 1 auto',
    width: '100%',
    backgroundColor: theme.palette.background.default
  },
  flexMiddle: {
    flex: '1 1 10%',
    display: 'flex',
    flexDirection: 'column'
  },
  folderButton: {
    minWidth: 30,
    paddingLeft: 3,
    paddingRight: 3,
    lineHeight: '17px',
    margin: '0 auto',
    backgroundColor: theme.palette.background.default
  },
  locationSelectorButton: {
    whiteSpace: 'nowrap',
    paddingLeft: 10,
    paddingRight: 10,
    alignItems: 'center'
  }
});

interface Props {
  classes: any;
  settings: any;
  theme: any;
  windowHeight: number;
  windowWidth: number;
  directoryContent: Array<Object>;
  currentDirectoryPath: string | null;
  searchResultCount: number;
  addTags: () => void;
  removeTags: () => void;
  removeAllTags: () => void;
  editTagForEntry: () => void;
  openFileNatively: (path: string) => void;
  toggleCreateFileDialog: () => void;
  deleteFile: () => void;
  renameFile: () => void;
  openDirectory: () => void;
  showInFileManager: () => void;
  openFsEntry: (fsEntry: FileSystemEntry) => void;
  deleteDirectory: (path: string) => void;
  reflectCreateEntry: (path: string, isFile: boolean) => void;
  loadDirectoryContent: (path: string) => void;
  loadParentDirectoryContent: () => void;
  setLastSelectedEntry: (entryPath: string | null) => void;
  isReadOnlyMode: boolean;
  isDesktopMode: boolean;
  showNotification: (content: string) => void;
  openSearchPanel: () => void;
  showDrawer: () => void;
  setCurrentDirectoryPerspective: (perspective: string) => void;
  maxSearchResults: number;
  currentDirectoryPerspective: string;
  currentLocationPath: string;
  locations: Array<Location>;
  openedFiles: Array<OpenedEntry>;
  updateCurrentDirEntry: (path: string, entry: Object) => void;
  setCurrentDirectoryColor: (color: string) => void;
}

const FolderContainer = (props: Props) => {
  // const [isDirectoryMenuOpened, setDirectoryMenuOpened] = useState<boolean>(false);
  /* const [directoryContextMenuOpened, setDirectoryContextMenuOpened] = useState<
    boolean
  >(false); */
  const [
    directoryContextMenuAnchorEl,
    setDirectoryContextMenuAnchorEl
  ] = useState<null | HTMLElement>(null);
  // const [perspectiveChooserMenuOpened,setPerspectiveChooserMenuOpened] = useState<boolean>(false);

  useEffect(() => {
    if (props.openedFiles.length > 0) {
      const openedFile = props.openedFiles[0];
      if (openedFile.path === props.currentDirectoryPath) {
        if (openedFile.color) {
          props.setCurrentDirectoryColor(openedFile.color);
        }
        if (openedFile.perspective) {
          props.setCurrentDirectoryPerspective(openedFile.perspective);
        }
      } else if (openedFile.changed) {
        const currentEntry = enhanceOpenedEntry(
          openedFile,
          props.settings.tagDelimiter
        );
        props.updateCurrentDirEntry(openedFile.path, currentEntry);
      }
    }
  }, [props.openedFiles]);

  let pathParts: Array<string> = [];

  if (props.currentDirectoryPath) {
    // Make the path unix like ending always with /
    const addSlash = PlatformIO.haveObjectStoreSupport() ? '//' : '/';
    let normalizedCurrentPath =
      addSlash +
      normalizePath(props.currentDirectoryPath.split('\\').join('/'));

    let normalizedCurrentLocationPath = '';
    if (props.currentLocationPath) {
      normalizedCurrentLocationPath =
        addSlash +
        normalizePath(props.currentLocationPath.split('\\').join('/'));
    }

    while (
      normalizedCurrentPath.lastIndexOf('/') > 0 &&
      normalizedCurrentPath.startsWith(normalizedCurrentLocationPath)
    ) {
      pathParts.push(
        normalizedCurrentPath.substring(
          PlatformIO.haveObjectStoreSupport() ? 2 : 1
        )
      );
      normalizedCurrentPath = normalizedCurrentPath.substring(
        0,
        normalizedCurrentPath.lastIndexOf('/')
      );
    }

    // console.log('Path parts : ' + JSON.stringify(pathParts));
    if (pathParts.length >= 1) {
      pathParts = pathParts.slice(1, pathParts.length); // remove current directory
    }
    pathParts = pathParts.reverse();
    if (pathParts.length > 2) {
      pathParts = pathParts.slice(pathParts.length - 2, pathParts.length); // leave only the last 2 dirs in the path
    }
  }

  const openDirectoryMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setDirectoryContextMenuAnchorEl(event.currentTarget);
    // setDirectoryContextMenuOpened(true);
  };

  const closeDirectoryMenu = () => {
    setDirectoryContextMenuAnchorEl(null);
    // setDirectoryContextMenuOpened(false);
  };

  const switchPerspective = (perspectiveId: string) => {
    /* if (!Pro) {
      props.showNotification(i18n.t('core:needProVersion'));
      return;
    } */
    props.setCurrentDirectoryPerspective(perspectiveId);
    /* savePerspective(props.currentDirectoryPath, perspectiveId || 'default')
      .then((entryMeta: FileSystemEntryMeta) => {
        props.setCurrentDirectoryPerspective(entryMeta.perspective);
        return true;
      })
      .catch(error => {
        console.warn('Error saving perspective for folder ' + error);
        props.showNotification(i18n.t('Error saving perspective for folder'));
      }); */
  };

  /* const togglePerspectiveChooserClose = (event?: any) => {
    perspectiveChooserMenuAnchorEl = event ? event.currentTarget : null;
    setPerspectiveChooserMenuOpened(!perspectiveChooserMenuOpened);
  }; */

  const renderPerspective = () => {
    if (!props.currentDirectoryPath && props.directoryContent.length < 1) {
      return <WelcomePanelAsync />;
    }
    if (
      Pro &&
      props.currentDirectoryPerspective ===
        Pro.Perspectives.AvailablePerspectives.GALLERY
    ) {
      return (
        <GalleryPerspectiveAsync
          directoryContent={props.directoryContent}
          openFsEntry={props.openFsEntry}
          currentDirectoryPath={props.currentDirectoryPath}
          windowWidth={props.windowWidth}
          switchPerspective={switchPerspective}
        />
      );
    }
    /* if (
      Pro &&
      props.currentDirectoryPerspective ===
        Pro.Perspectives.AvailablePerspectives.TREEVIZ
    ) {
      return (
        <TreeVizPerspectiveAsync
          directoryContent={props.directoryContent}
          currentDirectoryPath={props.currentDirectoryPath}
          windowWidth={props.windowWidth}
          switchPerspective={switchPerspective}
        />
      );
    } */
    if (
      Pro &&
      props.currentDirectoryPerspective ===
        Pro.Perspectives.AvailablePerspectives.MAPIQUE
    ) {
      return (
        <MapiquePerspectiveAsync
          directoryContent={props.directoryContent}
          currentDirectoryPath={props.currentDirectoryPath}
          windowWidth={props.windowWidth}
          switchPerspective={switchPerspective}
          openedFiles={props.openedFiles}
        />
      );
    }
    if (
      Pro &&
      props.currentDirectoryPerspective ===
        Pro.Perspectives.AvailablePerspectives.KANBAN
    ) {
      return (
        <KanBanPerspectiveAsync
          directoryContent={props.directoryContent}
          loadDirectoryContent={props.loadDirectoryContent}
          openFsEntry={props.openFsEntry}
          loadParentDirectoryContent={props.loadParentDirectoryContent}
          deleteFile={props.deleteFile}
          renameFile={props.renameFile}
          openDirectory={props.openDirectory}
          showInFileManager={props.showInFileManager}
          currentDirectoryPath={props.currentDirectoryPath}
          setLastSelectedEntry={props.setLastSelectedEntry}
          addTags={props.addTags}
          editTagForEntry={props.editTagForEntry}
          deleteDirectory={props.deleteDirectory}
          removeTags={props.removeTags}
          removeAllTags={props.removeAllTags}
          windowWidth={props.windowWidth}
          switchPerspective={switchPerspective}
        />
      );
    }
    //  else if (this.state.currentPerspective === 'default') {
    return (
      <GridPerspectiveAsync
        directoryContent={props.directoryContent}
        loadDirectoryContent={props.loadDirectoryContent}
        openFsEntry={props.openFsEntry}
        loadParentDirectoryContent={props.loadParentDirectoryContent}
        deleteFile={props.deleteFile}
        renameFile={props.renameFile}
        openDirectory={props.openDirectory}
        showInFileManager={props.showInFileManager}
        currentDirectoryPath={props.currentDirectoryPath}
        setLastSelectedEntry={props.setLastSelectedEntry}
        addTags={props.addTags}
        editTagForEntry={props.editTagForEntry}
        deleteDirectory={props.deleteDirectory}
        removeTags={props.removeTags}
        removeAllTags={props.removeAllTags}
        windowWidth={props.windowWidth}
      />
    );
  };

  const {
    currentDirectoryPath = '',
    loadDirectoryContent,
    searchResultCount,
    classes,
    maxSearchResults,
    openSearchPanel,
    showDrawer,
    isDesktopMode,
    theme,
    loadParentDirectoryContent
  } = props;
  const normalizedCurrentDirPath = normalizePath(
    currentDirectoryPath.split('\\').join('/')
  );
  let searchResultCounterText = searchResultCount + ' ' + i18n.t('entries');
  if (searchResultCount >= maxSearchResults) {
    searchResultCounterText =
      'Max. search count reached, showing only the first ' +
      searchResultCount +
      ' entries.';
  }
  return (
    <div>
      <div className={classes.mainPanel}>
        <div className={classes.topPanel}>
          <div className={classes.toolbar}>
            {isDesktopMode ? (
              <LocationMenu />
            ) : (
              <Button
                id="mobileMenuButton"
                style={{ marginLeft: -8 }}
                onClick={showDrawer}
              >
                <MenuIcon />
              </Button>
            )}
            <CounterBadge
              showZero={true}
              title={searchResultCounterText}
              badgeContent={searchResultCount}
              color="secondary"
              max={maxSearchResults - 1}
              onClick={() => {
                openSearchPanel();
              }}
            />
            <div className={classes.flexMiddle} />
            <React.Fragment>
              {isDesktopMode &&
                pathParts.length > 0 &&
                pathParts.map(pathPart => (
                  <Button
                    key={pathPart}
                    onClick={() => loadDirectoryContent(pathPart)}
                    title={'Navigate to: ' + pathPart}
                    style={{
                      paddingLeft: 3,
                      paddingRight: 0,
                      minWidth: 10,
                      lineHeight: '17px',
                      overflow: 'hidden',
                      backgroundColor: theme.palette.background.default
                    }}
                  >
                    {extractShortDirectoryName(pathPart, '/')}
                    <FolderSeparatorIcon />
                  </Button>
                ))}
              {!isDesktopMode && pathParts.length > 0 && (
                <React.Fragment>
                  <IconButton
                    onClick={loadParentDirectoryContent}
                    data-tid="openParentDirectory"
                    size="small"
                    style={{
                      overflow: 'hidden',
                      backgroundColor: theme.palette.background.default
                    }}
                    title={i18n.t('core:navigateToParentDirectory')}
                  >
                    <BackButtonIcon />
                  </IconButton>
                </React.Fragment>
              )}
              {props.currentDirectoryPath && (
                <React.Fragment>
                  <Button
                    data-tid="folderContainerOpenDirMenu"
                    title={
                      i18n.t('core:openDirectoryMenu') +
                      ' - ' +
                      (currentDirectoryPath || '')
                    }
                    className={classes.folderButton}
                    onClick={openDirectoryMenu}
                    onContextMenu={openDirectoryMenu}
                  >
                    {extractShortDirectoryName(
                      normalizePath(normalizedCurrentDirPath),
                      '/'
                    )}
                    <MoreVertIcon />
                  </Button>
                  <DirectoryMenu
                    open={Boolean(directoryContextMenuAnchorEl)}
                    onClose={closeDirectoryMenu}
                    anchorEl={directoryContextMenuAnchorEl}
                    directoryPath={currentDirectoryPath}
                    loadDirectoryContent={props.loadDirectoryContent}
                    openDirectory={props.openDirectory}
                    reflectCreateEntry={props.reflectCreateEntry}
                    openFsEntry={props.openFsEntry}
                    toggleCreateFileDialog={props.toggleCreateFileDialog}
                    deleteDirectory={props.deleteDirectory}
                    switchPerspective={switchPerspective}
                    isReadOnlyMode={props.isReadOnlyMode}
                  />
                </React.Fragment>
              )}
            </React.Fragment>
          </div>
        </div>
        <div
          className={classes.centerPanel}
          style={{ height: props.windowHeight }}
        >
          {renderPerspective()}
        </div>
      </div>
    </div>
  );
};

function mapStateToProps(state) {
  return {
    settings: state.settings,
    lastSelectedEntry: getLastSelectedEntry(state),
    perspectives: getPerspectives(state),
    directoryContent: getDirectoryContent(state),
    currentDirectoryPerspective: getCurrentDirectoryPerspective(state),
    searchResultCount: getSearchResultCount(state),
    currentLocationPath: getCurrentLocationPath(state),
    locations: getLocations(state),
    maxSearchResults: getMaxSearchResults(state),
    isDesktopMode: getDesktopMode(state),
    isReadOnlyMode: isReadOnlyMode(state)
  };
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(
    {
      addTags: TaggingActions.addTags,
      removeTags: TaggingActions.removeTags,
      removeAllTags: TaggingActions.removeAllTags,
      editTagForEntry: TaggingActions.editTagForEntry,
      openFileNatively: AppActions.openFileNatively,
      toggleCreateFileDialog: AppActions.toggleCreateFileDialog,
      deleteFile: AppActions.deleteFile,
      renameFile: AppActions.renameFile,
      openDirectory: AppActions.openDirectory,
      showInFileManager: AppActions.showInFileManager,
      openFsEntry: AppActions.openFsEntry,
      deleteDirectory: AppActions.deleteDirectory,
      reflectCreateEntry: AppActions.reflectCreateEntry,
      loadDirectoryContent: AppActions.loadDirectoryContent,
      loadParentDirectoryContent: AppActions.loadParentDirectoryContent,
      setLastSelectedEntry: AppActions.setLastSelectedEntry,
      showNotification: AppActions.showNotification,
      openSearchPanel: AppActions.openSearchPanel,
      setCurrentDirectoryPerspective: AppActions.setCurrentDirectoryPerspective,
      updateCurrentDirEntry: AppActions.updateCurrentDirEntry,
      setCurrentDirectoryColor: AppActions.setCurrentDirectoryColor
      // changeLocation: AppActions.changeLocation
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapActionCreatorsToProps
  // @ts-ignore
)(withStyles(styles)(withTheme(FolderContainer)));
