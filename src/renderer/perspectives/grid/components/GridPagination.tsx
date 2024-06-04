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

import React, { useEffect, useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Tooltip from '-/components/Tooltip';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Pagination from '@mui/material/Pagination';
import AppConfig from '-/AppConfig';
import { extractDirectoryName } from '@tagspaces/tagspaces-common/paths';
import EntryIcon from '-/components/EntryIcon';
import TagsPreview from '-/components/TagsPreview';
import TagContainer from '-/components/TagContainer';
import { TS } from '-/tagspaces.namespace';
import { getDescriptionPreview } from '-/services/utils-io';
import { MilkdownEditor } from '@tagspaces/tagspaces-md';
import { renderCell } from '-/perspectives/common/main-container';
import { useTranslation } from 'react-i18next';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { usePaginationContext } from '-/hooks/usePaginationContext';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { usePerspectiveSettingsContext } from '-/hooks/usePerspectiveSettingsContext';
import GridCellsContainer from './GridCellsContainer';
import { useSortedDirContext } from '-/perspectives/grid/hooks/useSortedDirContext';
import { useEntryExistDialogContext } from '-/components/dialogs/hooks/useEntryExistDialogContext';

interface Props {
  directories: Array<TS.FileSystemEntry>;
  desktopMode: boolean;
  files: Array<TS.FileSystemEntry>;
  getCellContent: (
    fsEntry: TS.FileSystemEntry,
    selectedEntries: Array<TS.FileSystemEntry>,
    index: number,
    handleGridContextMenu,
    handleGridCellClick,
    handleGridCellDblClick,
    isLast?: boolean,
  ) => void;
  currentDirectoryPath: string;
  onContextMenu: (event: React.MouseEvent<HTMLDivElement>) => void;
  openRenameEntryDialog: () => void;
  onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
  // eslint-disable-next-line react/no-unused-prop-types
  selectedEntries; // cache only
  setSelectedEntries: (selectedEntries: Array<TS.FileSystemEntry>) => void;
  setFileContextMenuAnchorEl: (HTMLElement) => void;
  setDirContextMenuAnchorEl: (HTMLElement) => void;
  clearSelection: () => void;
}

function GridPagination(props: Props) {
  let { directories } = props;
  const { t } = useTranslation();
  const {
    getCellContent,
    desktopMode,
    currentDirectoryPath,
    openRenameEntryDialog,
    setFileContextMenuAnchorEl,
    setDirContextMenuAnchorEl,
    selectedEntries,
    setSelectedEntries,
    clearSelection,
    files,
  } = props;
  const {
    showDetails,
    showDescription,
    showDirectories,
    showTags,
    gridPageLimit,
    singleClickAction,
  } = usePerspectiveSettingsContext();
  const { handleEntryExist, openEntryExistDialog } =
    useEntryExistDialogContext();
  const { lastSelectedEntryPath } = useSelectedEntriesContext();
  const { openEntryInternal } = useOpenedEntryContext();
  const { moveFiles, openFileNatively } = useIOActionsContext();
  const { showNotification } = useNotificationContext();
  const { readOnlyMode, currentLocation } = useCurrentLocationContext();
  const { openDirectory, directoryMeta } = useDirectoryContentContext();
  const { sortedDirContent } = useSortedDirContext();
  const { page, pageFiles, setCurrentPage } = usePaginationContext();
  if (!showDirectories) {
    directories = [];
  }
  const theme = useTheme();
  const allFilesCount = files.length;
  const showPagination = gridPageLimit && files.length > gridPageLimit;
  const paginationCount = showPagination
    ? Math.ceil(allFilesCount / gridPageLimit)
    : 10;

  const containerEl = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerEl.current) {
      containerEl.current.scrollTop = 0;
    }
  }, [currentDirectoryPath, containerEl.current]);

  const handleChange = (event, value) => {
    setCurrentPage(value);
    if (containerEl && containerEl.current) {
      containerEl.current.scrollTop = 0;
    }
  };

  const folderName = extractDirectoryName(
    props.currentDirectoryPath,
    currentLocation?.getDirSeparator(),
  );

  const dirColor =
    directoryMeta && directoryMeta.color ? directoryMeta.color : 'transparent';

  let folderSummary =
    (directories.length > 0 ? directories.length + ' folder(s) and ' : '') +
    allFilesCount +
    ' file(s) found';
  if (selectedEntries && selectedEntries.length > 0) {
    folderSummary = selectedEntries.length + ' entries selected';
  }

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions,jsx-a11y/no-static-element-interactions
    <div
      style={{
        height: '100%',
        background: `${dirColor}`,
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
          backgroundImage:
            'url("' +
            currentLocation?.getFolderBgndPath(
              currentDirectoryPath,
              directoryMeta?.lastUpdated,
            ) +
            '")',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
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
                    !showDescription &&
                    directoryMeta &&
                    directoryMeta.description
                      ? 150
                      : 110,
                  position: 'relative',
                }}
              >
                {((folderName && folderName.length > 0) ||
                  (directoryMeta &&
                    directoryMeta.tags &&
                    directoryMeta.tags.length > 0)) && (
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      overflow: 'auto',
                      padding: 10,
                      marginRight: 160,
                      width: 'fit-content',
                      borderRadius: 8,
                      color: theme.palette.text.primary,
                    }}
                  >
                    <Tooltip title={t('core:renameDirectory')}>
                      <ButtonBase
                        data-tid={'currentDir_' + folderName}
                        style={{
                          fontSize: '1.5rem',
                          filter: `drop-shadow(0px 0px 4px ${theme.palette.background.default})`,
                        }}
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
                        {directoryMeta?.tags?.map((tag: TS.Tag) => {
                          return <TagContainer tag={tag} tagMode="display" />;
                        })}
                      </span>
                    ) : (
                      <TagsPreview tags={directoryMeta?.tags} />
                    )}
                  </Box>
                )}
                <Box
                  style={{
                    paddingBottom: 5,
                    marginTop: 10,
                    marginRight: 160,
                    padding: 10,
                    borderRadius: 10,
                    width: 'fit-content',
                    color: theme.palette.text.primary,
                  }}
                >
                  <Typography
                    style={{
                      fontSize: '0.9rem',
                      filter: `drop-shadow(0px 0px 4px ${theme.palette.background.default})`,
                    }}
                  >
                    {folderSummary}
                  </Typography>
                  {!showDescription &&
                    directoryMeta &&
                    directoryMeta.description && (
                      <Typography
                        style={{
                          fontSize: '0.8rem',
                          wordBreak: 'break-all',
                          filter: `drop-shadow(0px 0px 2px ${theme.palette.background.default})`,
                          height: 45,
                          overflowY: 'auto',
                        }}
                      >
                        {getDescriptionPreview(directoryMeta.description, 200)}
                      </Typography>
                    )}
                </Box>
                <div
                  data-tid="folderThumbTID"
                  style={{
                    borderRadius: 10,
                    height: 100,
                    width: 140,
                    backgroundImage:
                      'url("' +
                      currentLocation?.getFolderThumbPath(
                        currentDirectoryPath,
                        directoryMeta?.lastUpdated,
                      ) +
                      '")',
                    backgroundSize: 'cover', // cover contain
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center center',
                    position: 'absolute',
                    top: 0,
                    right: 0,
                  }}
                />
              </div>
            </Grid>
          )}
          {showDescription && directoryMeta && directoryMeta.description && (
            <Grid
              item
              xs={12}
              style={{
                backgroundColor: theme.palette.background.default,
                marginTop: showDetails ? 0 : 10,
                marginLeft: 25,
                marginRight: 10,
                padding: 10,
                borderRadius: 10,
              }}
            >
              <MilkdownEditor
                content={directoryMeta.description}
                readOnly={true}
                /*dark={theme.palette.mode === 'dark'}*/
                currentFolder={currentDirectoryPath}
                lightMode={true}
              />
            </Grid>
          )}
        </Grid>
        <GridCellsContainer>
          {page === 1 &&
            directories.map((entry, index) =>
              renderCell(
                entry,
                index,
                getCellContent,
                showDirectories,
                readOnlyMode,
                desktopMode,
                singleClickAction,
                currentLocation,
                selectedEntries,
                setSelectedEntries,
                lastSelectedEntryPath,
                sortedDirContent,
                openEntryInternal,
                openFileNatively,
                openDirectory,
                setFileContextMenuAnchorEl,
                setDirContextMenuAnchorEl,
                showNotification,
                moveFiles,
                handleEntryExist,
                openEntryExistDialog,
                clearSelection,
              ),
            )}
          {pageFiles.map((entry, index, dArray) =>
            renderCell(
              entry,
              index,
              getCellContent,
              showDirectories,
              readOnlyMode,
              desktopMode,
              singleClickAction,
              currentLocation,
              selectedEntries,
              setSelectedEntries,
              lastSelectedEntryPath,
              sortedDirContent,
              openEntryInternal,
              openFileNatively,
              openDirectory,
              setFileContextMenuAnchorEl,
              setDirContextMenuAnchorEl,
              showNotification,
              moveFiles,
              handleEntryExist,
              openEntryExistDialog,
              clearSelection,
              index === dArray.length - 1,
            ),
          )}
          {pageFiles.length < 1 && directories.length < 1 && (
            <div style={{ textAlign: 'center' }}>
              {!showDescription &&
                directoryMeta &&
                directoryMeta.description && (
                  <div
                    style={{
                      position: 'relative',
                      margin: 'auto',
                      maxWidth: 150,
                    }}
                  >
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
          {pageFiles.length < 1 &&
            directories.length >= 1 &&
            !showDirectories && (
              <div style={{ textAlign: 'center' }}>
                {!showDescription &&
                  directoryMeta &&
                  directoryMeta.description && (
                    <div
                      style={{
                        position: 'relative',
                        margin: 'auto',
                        maxWidth: 150,
                      }}
                    >
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
        </GridCellsContainer>
        {showPagination && (
          <Tooltip title={folderSummary}>
            <Pagination
              style={{
                left: 15,
                bottom: -40,
                zIndex: 1100,
                position: 'absolute',
                backgroundColor: theme.palette.background.default,
                opacity: 0.97,
                border: '1px solid lightgray',
                borderRadius: 5,
                padding: 3,
              }}
              count={paginationCount}
              page={page}
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
                  color: theme.palette.text.primary,
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

export default GridPagination;
