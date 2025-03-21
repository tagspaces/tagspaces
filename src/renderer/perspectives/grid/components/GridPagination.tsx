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
import EntryIcon from '-/components/EntryIcon';
import TagContainer from '-/components/TagContainer';
import TagsPreview from '-/components/TagsPreview';
import TooltipTS from '-/components/Tooltip';
import { SelectionArea } from '-/components/drag/SelectionArea';
import SelectionDragLayer from '-/components/drag/SelectionDragLayer';
import LightMdEditor from '-/components/md/LigthMdEditor';
import { TabNames } from '-/hooks/EntryPropsTabsContextProvider';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { usePaginationContext } from '-/hooks/usePaginationContext';
import { usePerspectiveSettingsContext } from '-/hooks/usePerspectiveSettingsContext';
import CellView from '-/perspectives/common/CellView';
import { useSortedDirContext } from '-/perspectives/grid/hooks/useSortedDirContext';
import { Pro } from '-/pro';
import { dataTidFormat } from '-/services/test';
import { getDescriptionPreview } from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import { MilkdownProvider } from '@milkdown/react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Grid from '@mui/material/Grid2';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { extractDirectoryName } from '@tagspaces/tagspaces-common/paths';
import React, { useContext, useEffect, useReducer, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import GridCellsContainer from './GridCellsContainer';

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
  const { directoryMeta, getAllPropertiesPromise } =
    useDirectoryContentContext();
  const { sortedDirContent } = useSortedDirContext();
  const { page, pageFiles, setCurrentPage } = usePaginationContext();
  const { openEntry } = useOpenedEntryContext();
  const thumbDialogContext = Pro?.contextProviders?.ThumbDialogContext
    ? useContext<TS.ThumbDialogContextData>(
        Pro.contextProviders.ThumbDialogContext,
      )
    : undefined;
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
    <div
      data-tid="backgroundTID"
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
          overflowX: 'hidden',
          backgroundImage: backgroundImage.current,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <Grid container spacing={0}>
          <Grid size={12} style={{ height: 60 }} />
          {showDetails && (
            <Grid size={12}>
              <div
                style={{
                  marginLeft: 8,
                  marginRight: 8,
                  marginTop: 0,
                  marginBottom: 0,
                  height:
                    !showDescription &&
                    directoryMeta &&
                    directoryMeta.description
                      ? 150
                      : 115,
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
                    <TooltipTS title={t('core:renameDirectory')}>
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
                    </TooltipTS>
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
                        {getDescriptionPreview(directoryMeta.description, 200)}
                      </Typography>
                    )}
                </Box>
                <TooltipTS title={t('core:changeThumbnail')} placement="bottom">
                  <Box
                    sx={{
                      ':hover': {
                        border: '1px dashed gray !important',
                      },
                    }}
                    data-tid="folderThumbTID"
                    style={{
                      borderRadius: AppConfig.defaultCSSRadius,
                      border: '1px solid transparent',
                      height: 100,
                      width: 140,
                      backgroundImage: thumbImage.current,
                      backgroundSize: 'cover', // cover contain
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center center',
                      position: 'absolute',
                      top: 10,
                      right: 0,
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      if (Pro) {
                        getAllPropertiesPromise(currentDirectoryPath).then(
                          (fsEntry: TS.FileSystemEntry) =>
                            thumbDialogContext.openThumbsDialog(fsEntry),
                        );
                      }
                    }}
                  />
                </TooltipTS>
              </div>
            </Grid>
          )}
          {showDescription && directoryMeta?.description && (
            <Grid
              title={
                t('core:folderDescription') +
                ' - ' +
                t('core:doubleClickToEdit')
              }
              size={12}
              className="gridPagination"
              spacing={0}
              style={{
                backgroundColor: theme.palette.background.default,
                borderBottom: '1px solid ' + theme.palette.divider,
                marginTop: 10,
                marginLeft: 8,
                marginRight: 8,
                marginBottom: 5,
                borderRadius: AppConfig.defaultCSSRadius,
              }}
              onDoubleClick={() =>
                openEntry(currentDirectoryPath, TabNames.descriptionTab)
              }
            >
              <style>
                {`
                      .gridPagination .milkdown .ProseMirror h1 {
                          margin-top: 10px;
                      }
                     .gridPagination .milkdown { 
                          border-radius: ${AppConfig.defaultCSSRadius}px;
                      }
                      .gridPagination .milkdown .ProseMirror {
                          padding: 10px;
                      }
                      .gridPagination .milkdown .ProseMirror a {
                          color: ${theme.palette.primary.main};
                      }
                      .gridPagination .milkdown .ProseMirror img {
                          max-width: 99%;
                      }
                  `}
              </style>
              <MilkdownProvider>
                <LightMdEditor
                  defaultContent={directoryMeta.description}
                  placeholder=""
                />
              </MilkdownProvider>
            </Grid>
          )}
        </Grid>
        <SelectionDragLayer />
        <SelectionArea onSelect={handleSelect}>
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
            <TooltipTS title={folderSummary}>
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
            </TooltipTS>
          )}
          {!showDetails && !showPagination && pageFiles.length > 0 && (
            <div style={{ padding: 15, bottom: 10 }}>
              <Typography
                style={{
                  fontSize: '0.8rem',
                  filter: `drop-shadow(0px 0px 4px ${theme.palette.background.default})`,
                  color: theme.palette.text.primary,
                }}
              >
                {folderSummary}
              </Typography>
            </div>
          )}
        </SelectionArea>
      </div>
    </div>
  );
}

export default GridPagination;
