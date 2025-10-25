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
import { useMenuContext } from '-/components/dialogs/hooks/useMenuContext';
import { SelectionArea } from '-/components/drag/SelectionArea';
import SelectionDragLayer from '-/components/drag/SelectionDragLayer';
import LightMdEditor from '-/components/md/LigthMdEditor';
import { TabNames } from '-/hooks/EntryPropsTabsContextProvider';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { usePaginationContext } from '-/hooks/usePaginationContext';
import { usePerspectiveSettingsContext } from '-/hooks/usePerspectiveSettingsContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import CellView from '-/perspectives/common/CellView';
import { useSortedDirContext } from '-/perspectives/grid/hooks/useSortedDirContext';
import { Pro } from '-/pro';
import { dataTidFormat } from '-/services/test';
import { getDescriptionPreview } from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import { MilkdownProvider } from '@milkdown/react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Grid from '@mui/material/Grid';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { extractDirectoryName } from '@tagspaces/tagspaces-common/paths';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
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
  onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
  setSelectedEntries: (selectedEntries: Array<TS.FileSystemEntry>) => void;
  clearSelection: () => void;
}

function GridPagination(props: Props) {
  const { t } = useTranslation();
  const { getCellContent, currentDirectoryPath, setSelectedEntries, onClick } =
    props;
  const { selectedEntries } = useSelectedEntriesContext();
  const { openDirectoryMenu, openRenameEntryDialog } = useMenuContext();
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
  const { page, getResentPageFiles, setCurrentPage } = usePaginationContext();
  const { openEntry } = useOpenedEntryContext();
  const thumbDialogContext = Pro?.contextProviders?.ThumbDialogContext
    ? useContext<TS.ThumbDialogContextData>(
        Pro.contextProviders.ThumbDialogContext,
      )
    : undefined;
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const currentLocation = findLocation();
  const theme = useTheme();
  const pageFiles = getResentPageFiles();

  // Memoize derived values for performance
  const showPagination = useMemo(
    () => sortedDirContent.length !== pageFiles.length,
    [sortedDirContent.length, pageFiles.length],
  );
  const paginationCount = useMemo(
    () =>
      showPagination ? Math.ceil(sortedDirContent.length / gridPageLimit) : 10,
    [showPagination, sortedDirContent.length, gridPageLimit],
  );

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
          const bgImage = `url("${bgPath}")`;
          if (bgImage !== backgroundImage.current) {
            backgroundImage.current = bgImage;
            forceUpdate();
          }
        });
      currentLocation
        .getFolderThumbPath(currentDirectoryPath, directoryMeta?.lastUpdated)
        .then((thumbPath) => {
          const thbImage = `url("${thumbPath}")`;
          if (thbImage !== thumbImage.current) {
            thumbImage.current = thbImage;
            forceUpdate();
          }
        });
    }
  }, [currentDirectoryPath, directoryMeta?.lastUpdated, currentLocation]);

  const handleChange = useCallback(
    (event: React.ChangeEvent<unknown>, value: number) => {
      setCurrentPage(value);
      if (containerEl.current) {
        containerEl.current.scrollTop = 0;
      }
    },
    [setCurrentPage],
  );

  const folderName = useMemo(
    () => extractDirectoryName(currentDirectoryPath),
    [currentDirectoryPath],
  );

  const dirColor = directoryMeta?.color || 'transparent';

  // Separate files and directories
  const { files, dirs } = useMemo(() => {
    const files: TS.FileSystemEntry[] = [];
    const dirs: TS.FileSystemEntry[] = [];
    for (const entry of sortedDirContent) {
      if (entry.isFile) files.push(entry);
      else dirs.push(entry);
    }
    return { files, dirs };
  }, [sortedDirContent]);

  const folderSummary = useMemo(() => {
    if (selectedEntries && selectedEntries.length > 0) {
      return `${selectedEntries.length} entries selected`;
    }
    return `${dirs.length > 0 ? `${dirs.length} folder(s) and ` : ''}${files.length} file(s) found`;
  }, [selectedEntries, dirs.length, files.length]);

  // Utility: Check if Two Rectangles Intersect
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
  const handleSelect = useCallback(
    (selectionRect: DOMRect) => {
      const container = containerEl.current;
      if (!container) return;

      const newlySelected: string[] = [];
      const itemElements = container.querySelectorAll('[data-entry-id]');
      itemElements.forEach((el) => {
        const itemRect = el.getBoundingClientRect();
        if (rectIntersects(selectionRect, itemRect)) {
          const id = el.getAttribute('data-entry-id');
          if (id) newlySelected.push(id);
        }
      });
      if (newlySelected.length > 0) {
        setSelectedEntries(
          pageFiles.filter((e) => newlySelected.includes(e.uuid)),
        );
      }
    },
    [pageFiles, setSelectedEntries],
  );

  // Render folder details and description
  const renderFolderDetails = () => (
    <Grid size={12} sx={{ position: 'relative' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          overflow: 'auto',
          padding: '10px',
          marginRight: '160px',
          width: 'fit-content',
          borderRadius: 8,
          color: theme.palette.text.primary,
        }}
      >
        <TooltipTS title={t('core:renameDirectory')}>
          <ButtonBase
            data-tid={`currentDir_${dataTidFormat(folderName)}`}
            sx={{
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
          <Box sx={{ paddingLeft: '5px' }}>
            {directoryMeta?.tags?.map((tag) => (
              <TagContainer key={tag.title} tag={tag} tagMode="display" />
            ))}
          </Box>
        ) : (
          <TagsPreview tags={directoryMeta?.tags} />
        )}
      </Box>
      <Box
        data-tid={`allFilesCount${files.length}`}
        sx={{
          paddingBottom: '5px',
          marginTop: '10px',
          marginRight: '160px',
          padding: '10px',
          borderRadius: '10px',
          width: 'fit-content',
          color: theme.palette.text.primary,
        }}
      >
        <Typography
          sx={{
            fontSize: '0.9rem',
            filter: `drop-shadow(0px 0px 4px ${theme.palette.background.default})`,
          }}
        >
          {folderSummary}
        </Typography>
        {!showDescription && directoryMeta?.description && (
          <Typography
            sx={{
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
          style={{ backgroundImage: thumbImage.current }}
          sx={{
            ':hover': { border: '1px dashed gray !important' },
            borderRadius: AppConfig.defaultCSSRadius,
            border: '1px solid transparent',
            height: 100,
            width: 100,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center center',
            position: 'absolute',
            top: 0,
            right: 7,
            cursor: 'pointer',
          }}
          data-tid="folderThumbTID"
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
    </Grid>
  );

  // Render folder description in markdown editor
  const renderFolderDescription = () =>
    showDescription &&
    directoryMeta?.description && (
      <Grid
        title={`${t('core:folderDescription')} - ${t('core:doubleClickToEdit')}`}
        size={12}
        className="gridPagination"
        sx={{
          backgroundColor: theme.palette.background.default,
          borderBottom: `1px solid ${theme.palette.divider}`,
          marginTop: '10px',
          marginLeft: '8px',
          marginRight: '8px',
          marginBottom: '5px',
          borderRadius: AppConfig.defaultCSSRadius,
        }}
        onDoubleClick={() =>
          openEntry(currentDirectoryPath, TabNames.descriptionTab)
        }
      >
        <style>
          {`
            .gridPagination .milkdown .ProseMirror h1 { margin-top: 10px; }
            .gridPagination .milkdown { border-radius: ${AppConfig.defaultCSSRadius}; }
            .gridPagination .milkdown .ProseMirror { padding: 10px; }
            .gridPagination .milkdown .ProseMirror a { color: ${theme.palette.primary.main}; }
            .gridPagination .milkdown .ProseMirror img { max-width: 99%; }
          `}
        </style>
        <MilkdownProvider>
          <LightMdEditor
            defaultContent={directoryMeta.description}
            placeholder=""
          />
        </MilkdownProvider>
      </Grid>
    );

  // Render empty state
  const renderEmptyState = (message: string) => (
    <Box sx={{ textAlign: 'center' }}>
      {!showDescription && directoryMeta?.description && (
        <Box sx={{ position: 'relative', mx: 'auto', maxWidth: 150 }}>
          <EntryIcon isFile={false} />
        </Box>
      )}
      <Typography sx={{ padding: '15px', color: theme.palette.text.secondary }}>
        {message}
      </Typography>
      {!AppConfig.isCordova && (
        <Typography sx={{ color: theme.palette.text.secondary }}>
          {t('core:dragAndDropToImport')}
        </Typography>
      )}
    </Box>
  );

  return (
    <Box
      data-tid="backgroundTID"
      sx={{
        height: '100%',
        background: dirColor,
      }}
    >
      <Box
        ref={containerEl}
        onContextMenu={(event: React.MouseEvent<HTMLDivElement>) =>
          openDirectoryMenu(event, currentDirectoryPath)
        }
        onClick={onClick}
        style={{
          backgroundImage: backgroundImage.current,
        }}
        sx={{
          height: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <Grid container spacing={0}>
          <Grid size={12} sx={{ height: 70 }} />
          {showDetails && renderFolderDetails()}
          {renderFolderDescription()}
        </Grid>
        <SelectionDragLayer />
        <SelectionArea onSelect={handleSelect}>
          <GridCellsContainer>
            {pageFiles.map((entry, index) => (
              <CellView
                key={entry.uuid + index}
                fsEntry={entry}
                index={index}
                cellContent={getCellContent}
                isLast={index === pageFiles.length - 1}
              />
            ))}
            {pageFiles.length < 1 &&
              renderEmptyState(t('core:noFileFolderFound'))}
            {files.length < 1 &&
              dirs.length >= 1 &&
              !showDirectories &&
              renderEmptyState(t('core:noFileButFoldersFound'))}
          </GridCellsContainer>
          {showPagination && (
            <TooltipTS title={folderSummary}>
              <Pagination
                sx={{
                  left: 15,
                  bottom: -35,
                  zIndex: 1100,
                  position: 'absolute',
                  backgroundColor: theme.palette.background.default,
                  border: '1px solid ' + theme.palette.divider,
                  opacity: 0.97,
                  padding: '2px',
                  borderRadius: AppConfig.defaultCSSRadius,
                }}
                count={paginationCount}
                page={page}
                onChange={handleChange}
              />
            </TooltipTS>
          )}
          {!showDetails && !showPagination && pageFiles.length > 0 && (
            <Box sx={{ padding: '15px', bottom: '10px' }}>
              <Typography
                sx={{
                  fontSize: '0.8rem',
                  filter: `drop-shadow(0px 0px 4px ${theme.palette.background.default})`,
                  color: theme.palette.text.primary,
                }}
              >
                {folderSummary}
              </Typography>
            </Box>
          )}
        </SelectionArea>
      </Box>
    </Box>
  );
}

export default GridPagination;
