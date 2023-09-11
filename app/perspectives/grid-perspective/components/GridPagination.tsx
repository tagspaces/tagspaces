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

import React, { useEffect, useReducer, useRef } from 'react';
import { connect } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Tooltip from '-/components/Tooltip';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Pagination from '@mui/material/Pagination';
import { bindActionCreators } from 'redux';
import AppConfig from '-/AppConfig';
import {
  getMetaFileLocationForDir,
  getMetaFileLocationForFile,
  getThumbFileLocationForDirectory,
  getThumbFileLocationForFile,
  extractDirectoryName
} from '@tagspaces/tagspaces-common/paths';
import {
  actions as AppActions,
  getCurrentDirectoryColor,
  getIsMetaLoaded,
  getCurrentDirectoryTags,
  isLoading,
  getCurrentDirectoryDescription,
  getLastBackgroundImageChange,
  getLastThumbnailImageChange,
  getLastSelectedEntryPath,
  getLastSearchTimestamp
} from '-/reducers/app';
import EntryIcon from '-/components/EntryIcon';
import TagsPreview from '-/components/TagsPreview';
import TagContainer from '-/components/TagContainer';
import { TS } from '-/tagspaces.namespace';
import {
  getMetaForEntry,
  getDescriptionPreview,
  getFolderThumbPath,
  getFolderBgndPath
} from '-/services/utils-io';
import PlatformIO from '-/services/platform-facade';
import { MilkdownEditor } from '@tagspaces/tagspaces-md';
import { renderCell } from '-/perspectives/common/main-container';
import { useTranslation } from 'react-i18next';

interface Props {
  isMetaLoaded: boolean;
  setIsMetaLoaded: (isLoaded: boolean) => void;
  style?: any;
  // gridRef: Object;
  directories: Array<TS.FileSystemEntry>;
  showDirectories: boolean;
  showDetails: boolean;
  showDescription: boolean;
  isReadOnlyMode: boolean;
  layoutType: string;
  showTags: boolean;
  desktopMode: boolean;
  currentDirectoryDescription: string;
  thumbnailMode: string;
  entrySize: string;
  files: Array<TS.FileSystemEntry>;
  // pageEntries: Array<TS.FileSystemEntry>;
  getCellContent: (
    fsEntry: TS.FileSystemEntry,
    selectedEntries: Array<TS.FileSystemEntry>,
    index: number,
    handleGridContextMenu,
    handleGridCellClick,
    handleGridCellDblClick,
    isLast?: boolean
  ) => void;
  currentDirectoryColor: string;
  currentDirectoryTags: Array<TS.Tag>;
  isAppLoading: boolean;
  currentPage: number;
  gridPageLimit: number;
  currentLocationPath: string;
  currentDirectoryPath: string;
  onContextMenu: (event: React.MouseEvent<HTMLDivElement>) => void;
  openRenameEntryDialog: () => void;
  onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
  updateCurrentDirEntries: (dirEntries: TS.FileSystemEntry[]) => void;
  // eslint-disable-next-line react/no-unused-prop-types
  settings; // cache only
  // eslint-disable-next-line react/no-unused-prop-types
  selectedEntries; // cache only
  // setMetaForCurrentDir: (metaFiles: Array<any>) => void;
  lastBackgroundImageChange: any;
  lastThumbnailImageChange: any;
  setSelectedEntries: (selectedEntries: Array<TS.FileSystemEntry>) => void;
  singleClickAction: string;
  currentLocation: TS.Location;
  lastSelectedEntryPath: string;
  directoryContent: Array<TS.FileSystemEntry>;
  openEntry: (entryPath?: string) => void;
  openFileNatively: (path?: string) => void;
  loadDirectoryContent: (
    path: string,
    generateThumbnails: boolean,
    loadDirMeta?: boolean
  ) => void;
  setFileContextMenuAnchorEl: (HTMLElement) => void;
  setDirContextMenuAnchorEl: (HTMLElement) => void;
  showNotification: (
    text: string,
    notificationType: string,
    autohide: boolean
  ) => void;
  moveFiles: (files: Array<string>, destination: string) => Promise<boolean>;
  clearSelection: () => void;
  lastSearchTimestamp: number;
}

function GridPagination(props: Props) {
  let { directories } = props;
  const { t } = useTranslation();
  const {
    style,
    showDirectories,
    showDetails,
    showDescription,
    showTags,
    singleClickAction,
    getCellContent,
    isAppLoading,
    isReadOnlyMode,
    desktopMode,
    currentLocation,
    currentDirectoryColor,
    currentDirectoryTags,
    currentDirectoryDescription,
    currentDirectoryPath,
    lastThumbnailImageChange,
    openRenameEntryDialog,
    lastSelectedEntryPath,
    lastBackgroundImageChange,
    openEntry,
    openFileNatively,
    loadDirectoryContent,
    setFileContextMenuAnchorEl,
    setDirContextMenuAnchorEl,
    showNotification,
    moveFiles,
    directoryContent,
    gridPageLimit,
    currentPage,
    selectedEntries,
    setSelectedEntries,
    clearSelection,
    files
  } = props;
  if (!showDirectories) {
    directories = [];
  }
  const theme = useTheme();
  const allFilesCount = files.length;
  const showPagination = gridPageLimit && files.length > gridPageLimit;
  const paginationCount = showPagination
    ? Math.ceil(allFilesCount / gridPageLimit)
    : 10;

  const containerEl = useRef(null);
  // const entriesUpdated = useRef([]);
  const page = useRef<number>(currentPage);
  const metaLoadedLock = useRef<boolean>(false); // TODO move this for all perspectives - not lock if you open folder with diff perspective now
  const folderTmbPath = useRef<string>(
    getFolderThumbPath(currentDirectoryPath, lastThumbnailImageChange)
  );
  const folderBgndPath = useRef<string>(
    getFolderBgndPath(currentDirectoryPath, lastBackgroundImageChange)
  );
  // const [page, setPage] = useState(currentPage);

  let pageFiles;
  if (showPagination) {
    const start = (page.current - 1) * gridPageLimit;
    pageFiles = files.slice(start, start + gridPageLimit);
  } else {
    pageFiles = files;
  }
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  useEffect(() => {
    if (!props.isMetaLoaded && !metaLoadedLock.current) {
      metaLoadedLock.current = true;
      PlatformIO.listMetaDirectoryPromise(props.currentDirectoryPath)
        .then(meta => {
          metaLoadedLock.current = false;
          props.setIsMetaLoaded(true);
          // props.setMetaForCurrentDir(meta);
          const dirEntriesPromises = getDirEntriesPromises();
          const fileEntriesPromises = getFileEntriesPromises(meta);
          const thumbs = getThumbs(meta);
          updateEntries([
            ...dirEntriesPromises,
            ...fileEntriesPromises,
            ...thumbs
          ]);
          return true;
        })
        .catch(ex => console.error(ex));
    }
  }, [page.current, props.isMetaLoaded, files]);

  useEffect(() => {
    folderTmbPath.current = getFolderThumbPath(
      props.currentDirectoryPath,
      props.lastThumbnailImageChange
    );
    forceUpdate();
  }, [props.currentDirectoryPath, props.lastThumbnailImageChange]);

  useEffect(() => {
    folderBgndPath.current = getFolderBgndPath(
      props.currentDirectoryPath,
      props.lastBackgroundImageChange
    );
    forceUpdate();
  }, [props.currentDirectoryPath, props.lastBackgroundImageChange]);

  useEffect(() => {
    page.current = currentPage;
    /* if (page !== currentPage) {
       setPage(props.currentPage);
     } */
    if (containerEl && containerEl.current) {
      containerEl.current.scrollTop = 0;
    }
  }, [
    props.currentLocationPath,
    props.currentDirectoryPath,
    props.lastSearchTimestamp
  ]);

  const setThumbs = (
    entry: TS.FileSystemEntry,
    meta: Array<any>
  ): TS.FileSystemEntry => {
    const thumbEntry = { ...entry };
    let thumbPath = getThumbFileLocationForFile(
      entry.path,
      PlatformIO.getDirSeparator(),
      false
    );
    if (thumbPath && meta.some(metaFile => thumbPath.endsWith(metaFile.path))) {
      thumbEntry.thumbPath = thumbPath;
      if (
        PlatformIO.haveObjectStoreSupport() ||
        PlatformIO.haveWebDavSupport()
      ) {
        if (thumbPath && thumbPath.startsWith('/')) {
          thumbPath = thumbPath.substring(1);
        }

        thumbPath = PlatformIO.getURLforPath(thumbPath, 604800);
        if (thumbPath) {
          thumbEntry.thumbPath = thumbPath;
        }
      }
    }
    return thumbEntry;
  };

  const getThumbs = (meta: Array<any>): Promise<any>[] =>
    pageFiles.map(entry =>
      Promise.resolve({ [entry.path]: setThumbs(entry, meta) })
    );

  const getDirEntriesPromises = (): Promise<any>[] =>
    directories.map(async entry => {
      if (entry.name === AppConfig.metaFolder) {
        return Promise.resolve({ [entry.path]: undefined });
      }
      const meta = await PlatformIO.listMetaDirectoryPromise(entry.path);
      const metaFilePath = getMetaFileLocationForDir(
        entry.path,
        PlatformIO.getDirSeparator()
      );
      const thumbDirPath = getThumbFileLocationForDirectory(
        entry.path,
        PlatformIO.getDirSeparator()
      );
      let enhancedEntry;
      if (meta.some(metaFile => thumbDirPath.endsWith(metaFile.path))) {
        const thumbPath =
          PlatformIO.haveObjectStoreSupport() || PlatformIO.haveWebDavSupport()
            ? PlatformIO.getURLforPath(thumbDirPath)
            : thumbDirPath;
        enhancedEntry = { ...entry, thumbPath };
      }
      if (
        meta.some(metaFile => metaFilePath.endsWith(metaFile.path)) &&
        // !checkEntryExist(entry.path) &&
        entry.path.indexOf(
          AppConfig.metaFolder + PlatformIO.getDirSeparator()
        ) === -1
      ) {
        return getMetaForEntry(enhancedEntry || entry, metaFilePath);
      }
      return Promise.resolve({ [entry.path]: enhancedEntry });
    });

  const getFileEntriesPromises = (meta: Array<any>): Promise<any>[] =>
    pageFiles.map(entry => {
      const metaFilePath = getMetaFileLocationForFile(
        entry.path,
        PlatformIO.getDirSeparator()
      );
      if (
        // check if metaFilePath exist in listMetaDirectory content
        meta.some(metaFile => metaFilePath.endsWith(metaFile.path)) &&
        // !checkEntryExist(entry.path) &&
        entry.path.indexOf(
          AppConfig.metaFolder + PlatformIO.getDirSeparator()
        ) === -1
      ) {
        return getMetaForEntry(entry, metaFilePath);
      }
      return Promise.resolve({ [entry.path]: undefined });
    });

  const updateEntries = metaPromises => {
    const catchHandler = error => undefined;
    Promise.all(metaPromises.map(promise => promise.catch(catchHandler)))
      .then(entries => {
        updateCurrentDirEntries(entries); // .filter(entry => entry !== undefined));
        // entriesUpdated.current = entries;
        return true;
      })
      .catch(err => {
        console.error('err updateEntries:', err);
      });
  };

  const updateCurrentDirEntries = entries => {
    const entriesEnhanced = [];
    entries.forEach(entry => {
      if (entry) {
        for (const [key, value] of Object.entries(entry)) {
          if (value) {
            // !checkEntryExist(key)) {
            entriesEnhanced.push(value);
          }
        }
      }
    });
    if (entriesEnhanced.length > 0) {
      props.updateCurrentDirEntries(entriesEnhanced);
    }
  };

  /* const checkEntryExist = path => {
     const index = pageEntries.findIndex(
       objUpdated => Object.keys(objUpdated).indexOf(path) > -1
     );
     return index > -1;
   }; */

  const handleChange = (event, value) => {
    // setPage(value);
    page.current = value;
    props.setIsMetaLoaded(false);
    // forceUpdate();
    if (containerEl && containerEl.current) {
      containerEl.current.scrollTop = 0;
    }
  };

  const folderName = extractDirectoryName(
    props.currentDirectoryPath,
    PlatformIO.getDirSeparator()
  );

  const dirColor = currentDirectoryColor || 'transparent';

  let folderSummary =
    (directories.length > 0 ? directories.length + ' folder(s) and ' : '') +
    allFilesCount +
    ' file(s) found';
  if (selectedEntries && selectedEntries.length > 0) {
    folderSummary = selectedEntries.length + ' entries selected';
  }

  /* let descriptionHTML = '';
  if (showDescription && currentDirectoryDescription) {
    descriptionHTML = convertMarkDown(
      currentDirectoryDescription,
      props.currentDirectoryPath
    );
  }
  */

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions,jsx-a11y/no-static-element-interactions
    <div
      style={{
        height: '100%',
        background: `${dirColor}`
      }}
    >
      <div
        ref={containerEl}
        onContextMenu={(event: React.MouseEvent<HTMLDivElement>) =>
          props.onContextMenu(event)
        }
        onClick={(event: React.MouseEvent<HTMLDivElement>) =>
          props.onClick(event)
        }
        style={{
          height: '100%',
          overflowY: 'auto',
          backgroundImage: 'url("' + folderBgndPath.current + '")',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} style={{ height: 70 }} />
          {showDetails && (
            <Grid item xs={12}>
              <div
                style={{
                  marginLeft: 10,
                  marginRight: 10,
                  marginTop: 0,
                  marginBottom: 0,
                  height:
                    !showDescription && currentDirectoryDescription ? 150 : 110,
                  position: 'relative'
                }}
              >
                {((folderName && folderName.length > 0) ||
                  (currentDirectoryTags &&
                    currentDirectoryTags.length > 0)) && (
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      overflow: 'auto',
                      padding: 10,
                      marginRight: 160,
                      width: 'fit-content',
                      background: theme.palette.background.default,
                      borderRadius: 8,
                      color: theme.palette.text.primary
                    }}
                  >
                    <Tooltip
                      data-tid={'currentDir_' + folderName}
                      title={t('core:renameDirectory')}
                    >
                      <ButtonBase
                        style={{ fontSize: '1.5rem' }}
                        onClick={() => {
                          setSelectedEntries([]);
                          openRenameEntryDialog();
                        }}
                      >
                        {folderName}
                      </ButtonBase>
                    </Tooltip>
                    {showTags ? (
                      <span style={{ paddingLeft: 5 }}>
                        {currentDirectoryTags &&
                          currentDirectoryTags.map((tag: TS.Tag) => {
                            return (
                              <TagContainer
                                isReadOnlyMode
                                tag={tag}
                                tagMode="display"
                              />
                            );
                          })}
                      </span>
                    ) : (
                      <TagsPreview tags={currentDirectoryTags} />
                    )}
                  </Box>
                )}
                <Box
                  style={{
                    paddingBottom: 5,
                    background: theme.palette.background.default,
                    marginTop: 10,
                    marginRight: 160,
                    padding: 10,
                    borderRadius: 10,
                    width: 'fit-content',
                    color: theme.palette.text.primary
                  }}
                >
                  <Typography
                    style={{
                      fontSize: '0.9rem'
                    }}
                  >
                    {folderSummary}
                  </Typography>
                  {!showDescription && currentDirectoryDescription && (
                    <Typography
                      style={{
                        fontSize: '0.8rem',
                        wordBreak: 'break-all',
                        height: 45,
                        overflowY: 'auto'
                      }}
                    >
                      {getDescriptionPreview(currentDirectoryDescription, 200)}
                    </Typography>
                  )}
                </Box>
                <Tooltip title={t('core:thumbnail')}>
                  <div
                    style={{
                      borderRadius: 10,
                      height: 100,
                      width: 140,
                      backgroundImage: 'url("' + folderTmbPath.current + '")',
                      backgroundSize: 'cover', // cover contain
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center center',
                      position: 'absolute',
                      top: 0,
                      right: 0
                    }}
                  ></div>
                </Tooltip>
              </div>
            </Grid>
          )}
          {showDescription && currentDirectoryDescription && (
            <Grid
              item
              xs={12}
              style={{
                backgroundColor: theme.palette.background.default,
                marginTop: showDetails ? 0 : 10,
                marginLeft: 25,
                marginRight: 10,
                padding: 10,
                borderRadius: 10
              }}
            >
              <MilkdownEditor
                content={currentDirectoryDescription}
                readOnly={true}
                dark={theme.palette.mode === 'dark'}
                currentFolder={currentDirectoryPath}
                lightMode={true}
              />
            </Grid>
          )}
        </Grid>
        <div style={style} data-tid="perspectiveGridFileTable">
          {page.current === 1 &&
            directories.map((entry, index) =>
              renderCell(
                entry,
                index,
                getCellContent,
                showDirectories,
                isReadOnlyMode,
                desktopMode,
                singleClickAction,
                currentLocation,
                selectedEntries,
                setSelectedEntries,
                lastSelectedEntryPath,
                directoryContent,
                openEntry,
                openFileNatively,
                loadDirectoryContent,
                setFileContextMenuAnchorEl,
                setDirContextMenuAnchorEl,
                showNotification,
                moveFiles,
                clearSelection
              )
            )}
          {pageFiles.map((entry, index, dArray) =>
            renderCell(
              entry,
              index,
              getCellContent,
              showDirectories,
              isReadOnlyMode,
              desktopMode,
              singleClickAction,
              currentLocation,
              selectedEntries,
              setSelectedEntries,
              lastSelectedEntryPath,
              directoryContent,
              openEntry,
              openFileNatively,
              loadDirectoryContent,
              setFileContextMenuAnchorEl,
              setDirContextMenuAnchorEl,
              showNotification,
              moveFiles,
              clearSelection,
              index === dArray.length - 1
            )
          )}
          {!isAppLoading && pageFiles.length < 1 && directories.length < 1 && (
            <div style={{ textAlign: 'center' }}>
              {!showDescription && currentDirectoryDescription && (
                <div style={{ position: 'relative', marginBottom: 150 }}>
                  <EntryIcon isFile={false} />
                </div>
              )}
              <Typography
                style={{ padding: 15, color: theme.palette.text.secondary }}
              >
                {t('core:noFileFolderFound')}
              </Typography>
              {!AppConfig.isCordova && (
                <Typography style={{ color: theme.palette.text.secondary }}>
                  {t('core:dragAndDropToImport')}
                </Typography>
              )}
            </div>
          )}
          {!isAppLoading &&
            pageFiles.length < 1 &&
            directories.length >= 1 &&
            !showDirectories && (
              <div style={{ textAlign: 'center' }}>
                {!showDescription && currentDirectoryDescription && (
                  <div style={{ position: 'relative', marginBottom: 150 }}>
                    <EntryIcon isFile={false} />
                  </div>
                )}
                <Typography
                  style={{ padding: 15, color: theme.palette.text.secondary }}
                >
                  {t('core:noFileButFoldersFound')}
                </Typography>
                {!AppConfig.isCordova && (
                  <Typography style={{ color: theme.palette.text.secondary }}>
                    {t('core:dragAndDropToImport')}
                  </Typography>
                )}
              </div>
            )}
        </div>
        {showPagination && (
          <Tooltip title={folderSummary}>
            <Pagination
              style={{
                left: 15,
                bottom: 65,
                zIndex: 1100,
                position: 'absolute',
                backgroundColor: theme.palette.background.default,
                opacity: 0.97,
                border: '1px solid lightgray',
                borderRadius: 5,
                padding: 3
              }}
              count={paginationCount}
              page={page.current}
              onChange={handleChange}
            />
          </Tooltip>
        )}
        {!showDetails &&
          !showPagination &&
          (directories.length > 0 || pageFiles.length > 0) && (
            <div style={{ padding: 15, bottom: 10 }}>
              <Typography
                style={{
                  fontSize: '0.9rem',
                  color: theme.palette.text.primary
                }}
              >
                {folderSummary}
              </Typography>
            </div>
          )}
      </div>
    </div>
  );
}

function mapStateToProps(state) {
  return {
    isAppLoading: isLoading(state),
    currentDirectoryColor: getCurrentDirectoryColor(state),
    lastSearchTimestamp: getLastSearchTimestamp(state),
    // searchResultCount: getSearchResultCount(state),
    // pageEntries: getPageEntries(state),
    currentDirectoryTags: getCurrentDirectoryTags(state),
    isMetaLoaded: getIsMetaLoaded(state),
    currentDirectoryDescription: getCurrentDirectoryDescription(state),
    lastBackgroundImageChange: getLastBackgroundImageChange(state),
    lastThumbnailImageChange: getLastThumbnailImageChange(state),
    lastSelectedEntryPath: getLastSelectedEntryPath(state)
  };
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(
    {
      // setMetaForCurrentDir: AppActions.setMetaForCurrentDir,
      updateCurrentDirEntries: AppActions.updateCurrentDirEntries,
      setIsMetaLoaded: AppActions.setIsMetaLoaded
    },
    dispatch
  );
}

const areEqual = (prevProp: Props, nextProp: Props) =>
  //  nextProp.theme === prevProp.theme &&
  JSON.stringify(nextProp.lastBackgroundImageChange) ===
    JSON.stringify(prevProp.lastBackgroundImageChange) &&
  JSON.stringify(nextProp.lastThumbnailImageChange) ===
    JSON.stringify(prevProp.lastThumbnailImageChange) &&
  nextProp.currentDirectoryPath === prevProp.currentDirectoryPath &&
  nextProp.isMetaLoaded === prevProp.isMetaLoaded &&
  nextProp.showDirectories === prevProp.showDirectories &&
  nextProp.showDetails === prevProp.showDetails &&
  nextProp.showDescription === prevProp.showDescription &&
  nextProp.showTags === prevProp.showTags &&
  nextProp.thumbnailMode === prevProp.thumbnailMode &&
  nextProp.entrySize === prevProp.entrySize &&
  nextProp.gridPageLimit === prevProp.gridPageLimit &&
  nextProp.lastSearchTimestamp === prevProp.lastSearchTimestamp &&
  nextProp.currentDirectoryDescription ===
    prevProp.currentDirectoryDescription &&
  JSON.stringify(nextProp.files) === JSON.stringify(prevProp.files) &&
  JSON.stringify(nextProp.directories) ===
    JSON.stringify(prevProp.directories) &&
  JSON.stringify(nextProp.settings) === JSON.stringify(prevProp.settings) &&
  JSON.stringify(nextProp.selectedEntries) ===
    JSON.stringify(prevProp.selectedEntries) &&
  JSON.stringify(nextProp.currentDirectoryColor) ===
    JSON.stringify(prevProp.currentDirectoryColor);

export default connect(
  mapStateToProps,
  mapActionCreatorsToProps
)(React.memo(GridPagination, areEqual));
