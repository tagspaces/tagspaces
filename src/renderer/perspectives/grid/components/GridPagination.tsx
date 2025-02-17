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

import React, { useEffect, useReducer, useRef } from 'react';
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
import { useTranslation } from 'react-i18next';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { usePaginationContext } from '-/hooks/usePaginationContext';
import { usePerspectiveSettingsContext } from '-/hooks/usePerspectiveSettingsContext';
import GridCellsContainer from './GridCellsContainer';
import { dataTidFormat } from '-/services/test';
import CellView from '-/perspectives/common/CellView';
import { useSortedDirContext } from '-/perspectives/grid/hooks/useSortedDirContext';
import SelectionDragLayer from '-/components/drag/SelectionDragLayer';
import { SelectionArea } from '-/components/drag/SelectionArea';

interface Props {
  desktopMode: boolean;
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
  const { t } = useTranslation();
  const {
    getCellContent,
    currentDirectoryPath,
    openRenameEntryDialog,
    setFileContextMenuAnchorEl,
    setDirContextMenuAnchorEl,
    selectedEntries,
    setSelectedEntries,
  } = props;
  const {
    showDetails,
    showDescription,
    showDirectories,
    showTags,
    gridPageLimit,
  } = usePerspectiveSettingsContext();
  const { findLocation } = useCurrentLocationContext();
  const { directoryMeta } = useDirectoryContentContext();
  const { sortedDirContent } = useSortedDirContext();
  const { page, pageFiles, setCurrentPage } = usePaginationContext();
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);
  const currentLocation = findLocation();

  const theme = useTheme();
  const showPagination = sortedDirContent.length !== pageFiles.length;
  const paginationCount = showPagination
    ? Math.ceil(sortedDirContent.length / gridPageLimit)
    : 10;

  const backgroundImage = useRef<string>('none');
  const thumbImage = useRef<string>('none');
  const containerEl = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerEl.current) {
      containerEl.current.scrollTop = 0;
    }
    if (currentLocation) {
      currentLocation
        .getFolderBgndPath(currentDirectoryPath, directoryMeta?.lastUpdated)
        .then((bgPath) => {
          const bgImage = 'url("' + bgPath + '")';
          if (bgImage !== backgroundImage.current) {
            backgroundImage.current = bgImage;
            forceUpdate();
          }
        });
      currentLocation
        .getFolderThumbPath(currentDirectoryPath, directoryMeta?.lastUpdated)
        .then((thumbPath) => {
          const thbImage = 'url("' + thumbPath + '")';
          if (thbImage !== thumbImage.current) {
            thumbImage.current = thbImage;
            forceUpdate();
          }
        });
    }
  }, [currentDirectoryPath, containerEl.current, directoryMeta]);

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

  const files: TS.FileSystemEntry[] = [];
  const dirs: TS.FileSystemEntry[] = [];

  for (const entry of sortedDirContent) {
    if (entry.isFile) {
      files.push(entry);
    } else {
      dirs.push(entry);
    }
  }

  let folderSummary =
    (dirs.length > 0 ? dirs.length + ' folder(s) and ' : '') +
    files.length +
    ' file(s) found';
  if (selectedEntries && selectedEntries.length > 0) {
    folderSummary = selectedEntries.length + ' entries selected';
  }

  // **********************************************************************
  // Utility: Check if Two Rectangles Intersect
  // **********************************************************************
  const rectIntersects = (r1: DOMRect, r2: DOMRect): boolean => {
    return !(
      r2.left > r1.right ||
      r2.right < r1.left ||
      r2.top > r1.bottom ||
      r2.bottom < r1.top
    );
  };

  // Called when a selection drag ends. We look for any item elements whose
  // bounding rectangle intersects the drag rectangle.
  const handleSelect = (selectionRect: DOMRect) => {
    const container = containerEl.current;
    if (!container) return;

    const newlySelected: string[] = [];
    // Find all elements that represent items (we use the data-item attribute)
    const itemElements = container.querySelectorAll('[data-entry-id]');
    itemElements.forEach((el) => {
      const itemRect = el.getBoundingClientRect();
      if (rectIntersects(selectionRect, itemRect)) {
        const id = el.getAttribute('data-entry-id');
        newlySelected.push(id);
      }
    });
    if (newlySelected.length > 0) {
      setSelectedEntries(
        pageFiles.filter((e) => newlySelected.includes(e.uuid)),
      );
    }
  };

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions,jsx-a11y/no-static-element-interactions
    <div
      data-tid="backgroundTID"
      style={{
        height: '100%',
        background: `${dirColor}`,
      }}
    >
      <SelectionDragLayer />
      <SelectionArea onSelect={handleSelect}>
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
            backgroundImage: backgroundImage.current,
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
                          data-tid={'currentDir_' + dataTidFormat(folderName)}
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
                    data-tid={'allFilesCount' + files.length}
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
                          {getDescriptionPreview(
                            directoryMeta.description,
                            200,
                          )}
                        </Typography>
                      )}
                  </Box>
                  <div
                    data-tid="folderThumbTID"
                    style={{
                      borderRadius: 10,
                      height: 100,
                      width: 140,
                      backgroundImage: thumbImage.current,
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
                {/*<MilkdownEditor
                  content={directoryMeta.description}
                  readOnly={true}
                  currentFolder={currentDirectoryPath}
                  lightMode={true}
                />*/}
              </Grid>
            )}
          </Grid>
          <GridCellsContainer>
            {pageFiles.map((entry, index, dArray) => (
              <CellView
                key={entry.uuid + index}
                fsEntry={entry}
                index={index}
                cellContent={getCellContent}
                setFileContextMenuAnchorEl={setFileContextMenuAnchorEl}
                setDirContextMenuAnchorEl={setDirContextMenuAnchorEl}
                isLast={index === dArray.length - 1}
              />
            ))}
            {pageFiles.length < 1 && (
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
            {files.length < 1 && dirs.length >= 1 && !showDirectories && (
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
          {!showDetails && !showPagination && pageFiles.length > 0 && (
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
      </SelectionArea>
    </div>
  );
}

export default GridPagination;
