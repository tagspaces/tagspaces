/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2023-present TagSpaces GmbH
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
import {
  FolderOutlineIcon,
  MoreMenuIcon,
  SelectedIcon,
  UnSelectedIcon,
} from '-/components/CommonIcons';
import EntryIcon from '-/components/EntryIcon';
import FileExtBadge from '-/components/FileExtBadge';
import TagContainer from '-/components/TagContainer';
import TagContainerDnd from '-/components/TagContainerDnd';
import TagsOverflowChip from '-/components/TagsOverflowChip';
import TagsPreview from '-/components/TagsPreview';
import Tooltip from '-/components/Tooltip';
import TsIconButton from '-/components/TsIconButton';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useEditedEntryMetaContext } from '-/hooks/useEditedEntryMetaContext';
import { usePerspectiveSettingsContext } from '-/hooks/usePerspectiveSettingsContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { useTaggingActionsContext } from '-/hooks/useTaggingActionsContext';
import { useCellVisibility } from '-/perspectives/grid/hooks/CellVisibilityContext';
import {
  getDefaultFolderColor,
  getSupportedFileTypes,
  getTagDelimiter,
  isReorderTags,
} from '-/reducers/settings';
import i18n from '-/services/i18n';
import { dataTidFormat } from '-/services/test';
import {
  findBackgroundColorForFolder,
  findColorForEntry,
  getDescriptionPreview,
} from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import { arrayBufferToDataURL } from '-/utils/dom';
import useFirstRender from '-/utils/useFirstRender';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import {
  formatDateTime,
  formatFileSize,
} from '@tagspaces/tagspaces-common/misc';
import {
  cleanFrontDirSeparator,
  cleanTrailingDirSeparator,
  extractTagsAsObjects,
  extractTitle,
  getThumbFileLocationForFile,
} from '@tagspaces/tagspaces-common/paths';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { defaultSettings } from '../index';

export function urlGetDelim(url) {
  return url.indexOf('?') > 0 ? '&' : '?';
}

// Centralize entry size config for maintainability
const ENTRY_SIZES = {
  tiny: 130,
  small: 160,
  big: 250,
  huge: 300,
  normal: 200,
} as const;

export function calculateEntryWidth(entrySize: TS.EntrySizes) {
  return ENTRY_SIZES[entrySize] ?? ENTRY_SIZES.normal;
}

export function calculateEntryHeight(entrySize: TS.EntrySizes) {
  return ENTRY_SIZES[entrySize] ?? ENTRY_SIZES.normal;
}

interface Props {
  selected: boolean;
  isLast?: boolean;
  fsEntry: TS.FileSystemEntry;
  selectionMode: boolean;
  handleTagMenu: (
    event: Object,
    tag: TS.Tag,
    fsEntry: TS.FileSystemEntry,
  ) => void;
  handleGridContextMenu: (event: Object, fsEntry: TS.FileSystemEntry) => void;
  handleGridCellDblClick: (event: Object, fsEntry: TS.FileSystemEntry) => void;
  handleGridCellClick: (event: Object, fsEntry: TS.FileSystemEntry) => void;
}

function GridCell(props: Props) {
  const {
    selected,
    fsEntry,
    handleTagMenu,
    handleGridContextMenu,
    handleGridCellDblClick,
    handleGridCellClick,
    selectionMode,
    isLast,
  } = props;

  const { t } = useTranslation();
  const theme = useTheme();
  const {
    entrySize,
    showEntriesDescription,
    showTags,
    thumbnailMode,
    maxVisibleTags,
  } = usePerspectiveSettingsContext();
  const { metaActions } = useEditedEntryMetaContext();
  // Intentionally do not subscribe to selectedEntries here. The cell receives
  // its own `selected` boolean from the parent; selectEntry is only used in
  // event handlers, where reading the latest selection from a ref is fine.
  const { selectEntry } = useSelectedEntriesContext();
  const { addTag, editTagForEntry } = useTaggingActionsContext();
  const { findLocation } = useCurrentLocationContext();
  const supportedFileTypes = useSelector(getSupportedFileTypes);
  const defaultFolderColor = useSelector(getDefaultFolderColor);
  const reorderTags: boolean = useSelector(isReorderTags);
  const tagDelimiter: string = useSelector(getTagDelimiter);
  const firstRender = useFirstRender();

  const fileSystemEntryColor = useMemo(
    () => findColorForEntry(fsEntry, supportedFileTypes, defaultFolderColor),
    [fsEntry, supportedFileTypes, defaultFolderColor],
  );
  const maxHeight = calculateEntryHeight(entrySize);
  const entryPath = fsEntry.path;
  const isSmall = entrySize === 'tiny' || entrySize === 'small';
  const gridCellLocation = findLocation(fsEntry.locationID);

  // Thumbnail state and helpers
  const [thumbSrc, setThumbSrc] = useState<string | undefined>(undefined);
  // Visibility-driven loading: defer setThumbPath until the cell scrolls
  // close to the viewport. The visibility context owns one shared
  // IntersectionObserver for the whole page.
  const cellRootRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const visibility = useCellVisibility();

  const getThumbUrl = useCallback(async (): Promise<string | undefined> => {
    if (!gridCellLocation) return undefined;
    try {
      const tmbPath = await gridCellLocation.getThumbPath(
        fsEntry.meta.thumbPath,
        fsEntry.meta?.lastUpdated,
      );
      return tmbPath ?? undefined;
    } catch {
      return undefined;
    }
  }, [gridCellLocation, fsEntry.meta?.thumbPath, fsEntry.meta?.lastUpdated]);

  const setThumbPath = useCallback(async () => {
    if (!gridCellLocation || !fsEntry.meta?.thumbPath) {
      setThumbSrc(undefined);
      return;
    }
    if (gridCellLocation.encryptionKey) {
      try {
        const thumbFilePath = getThumbFileLocationForFile(
          fsEntry.path,
          gridCellLocation.getDirSeparator(),
          false,
        );
        const arrayBuffer = await gridCellLocation.getFileContentPromise(
          thumbFilePath,
          'arraybuffer',
        );
        if (arrayBuffer) {
          const dataUrl = await arrayBufferToDataURL(arrayBuffer, 'image/jpeg');
          setThumbSrc(dataUrl);
          return;
        }
      } catch {
        // fallback below
      }
    }
    const url = await getThumbUrl();
    setThumbSrc(url);
  }, [gridCellLocation, fsEntry.path, fsEntry.meta, getThumbUrl]);

  useEffect(() => {
    if (isVisible) setThumbPath();
  }, [isVisible, setThumbPath]);

  // Subscribe the cell root to the shared IntersectionObserver. We only flip
  // isVisible on first transition to true — once a cell has loaded its thumb
  // we don't need to react further (the WeakSet inside the provider keeps
  // visibility state for any future scroll-back re-render). Cells that go
  // off-screen and come back will already have thumbSrc cached.
  useEffect(() => {
    const el = cellRootRef.current;
    if (!el) return;
    const cb = (visible: boolean) => {
      if (visible) setIsVisible(true);
    };
    const initial = visibility.observe(el, cb);
    if (initial) setIsVisible(true);
    return () => visibility.unobserve(el, cb);
  }, [visibility]);

  useEffect(() => {
    if (!firstRender && metaActions && metaActions.length > 0) {
      for (const action of metaActions) {
        if (
          action.entry &&
          cleanTrailingDirSeparator(cleanFrontDirSeparator(fsEntry.path)) ===
            cleanTrailingDirSeparator(cleanFrontDirSeparator(action.entry.path))
        ) {
          fsEntry.meta = { ...action.entry.meta };
          if (action.action === 'thumbChange') {
            setThumbSrc(undefined);
            setThumbPath();
          } else if (
            action.action === 'bgdColorChange' ||
            action.action === 'descriptionChange'
          ) {
            setThumbPath();
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metaActions]);

  if (!gridCellLocation && fsEntry.locationID) {
    return null;
  }

  // Memoized callbacks and derived data
  const handleEditTag = useCallback(
    (path: string, tag: TS.Tag, newTagTitle?: string) => {
      editTagForEntry(path, tag, newTagTitle);
    },
    [editTagForEntry],
  );

  const handleAddTag = useCallback(
    (tag: TS.Tag, parentTagGroupUuid: TS.Uuid) => {
      addTag([tag], parentTagGroupUuid);
    },
    [addTag],
  );

  const entryTitle = useMemo(
    () =>
      extractTitle(
        fsEntry.name,
        !fsEntry.isFile,
        gridCellLocation?.getDirSeparator(),
      ),
    [fsEntry.name, fsEntry.isFile, gridCellLocation],
  );

  const description = useMemo(() => {
    if (!showEntriesDescription) return undefined;
    let desc = fsEntry.meta?.description;
    if (desc && desc.length > defaultSettings.maxDescriptionPreviewLength) {
      desc = getDescriptionPreview(
        desc,
        defaultSettings.maxDescriptionPreviewLength,
      );
    }
    return desc;
  }, [showEntriesDescription, fsEntry.meta?.description]);

  // Prefer the value pre-parsed at load time by DirectoryContentContextProvider.
  // Fallback to a fresh parse if the entry came in through a path that did not
  // enrich it (defensive — should not normally happen for cells in the grid).
  const fileNameTags = useMemo(() => {
    if (!fsEntry.isFile) return [];
    if (fsEntry.parsedNameTags !== undefined) return fsEntry.parsedNameTags;
    return extractTagsAsObjects(
      fsEntry.name,
      tagDelimiter,
      gridCellLocation?.getDirSeparator(),
    );
  }, [
    fsEntry.isFile,
    fsEntry.name,
    fsEntry.parsedNameTags,
    tagDelimiter,
    gridCellLocation,
  ]);

  const fileSystemEntryTags: TS.Tag[] = fsEntry.meta?.tags ?? [];

  const entryTags = useMemo(() => {
    const sideCarTitles = new Set(fileSystemEntryTags.map((t) => t.title));
    return [
      ...fileSystemEntryTags,
      ...fileNameTags.filter((t) => !sideCarTitles.has(t.title)),
    ];
  }, [fileSystemEntryTags, fileNameTags]);

  // In multi-select (selectionMode) the drag operation is on the cell, not on
  // the tag (file move, not tag reorder). Skip the per-tag DnD wiring in that
  // mode — same logic as on read-only locations. Drops 2× useDrag/useDrop per
  // tag × N tags × M cells of overhead during multi-select.
  const useStaticTags = gridCellLocation.isReadOnly || selectionMode;
  // Cap the number of inline tag chips. Files with more get a "+N" chip that
  // opens the rest in a popover. 0 disables the cap.
  const cap =
    typeof maxVisibleTags === 'number' && maxVisibleTags > 0
      ? maxVisibleTags
      : Infinity;
  const visibleTags =
    entryTags.length > cap ? entryTags.slice(0, cap) : entryTags;
  const overflowTags =
    entryTags.length > cap ? entryTags.slice(cap) : undefined;
  const renderTags = useCallback(() => {
    let sideCarLength = 0;
    return visibleTags.map((tag: TS.Tag, index) => {
      const tagContainer = useStaticTags ? (
        <TagContainer
          tag={tag}
          key={entryPath + tag.title}
          entry={fsEntry}
          handleTagMenu={handleTagMenu}
        />
      ) : (
        <TagContainerDnd
          tag={tag}
          index={tag.type === 'sidecar' ? index : index - sideCarLength}
          key={entryPath + tag.title}
          entry={fsEntry}
          addTag={handleAddTag}
          handleTagMenu={handleTagMenu}
          editTagForEntry={handleEditTag}
          reorderTags={reorderTags}
        />
      );
      if (tag.type === 'sidecar') {
        sideCarLength = index + 1;
      }
      return tagContainer;
    });
  }, [
    visibleTags,
    useStaticTags,
    entryPath,
    fsEntry,
    handleTagMenu,
    handleAddTag,
    handleEditTag,
    reorderTags,
  ]);

  // Memoized handlers for clarity and performance
  const handleCellClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      AppConfig.isCordovaiOS || AppConfig.isCapacitoriOS
        ? handleGridCellDblClick(event, fsEntry)
        : handleGridCellClick(event, fsEntry);
    },
    [fsEntry, handleGridCellDblClick, handleGridCellClick],
  );

  const handleContextMenu = useCallback(
    (event: React.MouseEvent) => {
      handleGridContextMenu(event, fsEntry);
    },
    [fsEntry, handleGridContextMenu],
  );

  const handleThumbError = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      event.currentTarget.style.display = 'none';
    },
    [],
  );

  function generateCardHeader() {
    return (
      !isSmall &&
      fsEntry.isFile &&
      fsEntry.lmdt && (
        <>
          <Tooltip
            title={
              t('core:modifiedDate') + ': ' + formatDateTime(fsEntry.lmdt, true)
            }
          >
            {formatDateTime(fsEntry.lmdt, false)}
          </Tooltip>
          <Tooltip title={fsEntry.size + ' ' + t('core:sizeInBytes')}>
            <span>{' | ' + formatFileSize(fsEntry.size)}</span>
          </Tooltip>
        </>
      )
    );
  }

  function generateExtension() {
    return (
      <Tooltip title={i18n.t('clickToSelect') + ': ' + fsEntry.name}>
        <FileExtBadge
          sx={{
            backgroundColor: fileSystemEntryColor,
          }}
          noWrap={true}
          variant="button"
          onClick={(e) => {
            e.stopPropagation();
            if (selectionMode) {
              selectEntry(fsEntry, !selected);
            } else {
              selectEntry(fsEntry);
            }
          }}
        >
          {selectionMode ? (
            selected ? (
              <SelectedIcon />
            ) : (
              <UnSelectedIcon />
            )
          ) : fsEntry.isFile ? (
            fsEntry.extension
          ) : (
            <FolderOutlineIcon />
          )}
        </FileExtBadge>
      </Tooltip>
    );
  }

  return (
    <Card
      ref={(node: HTMLElement | null) => {
        cellRootRef.current = node;
      }}
      data-entry-id={fsEntry.uuid}
      data-tid={`fsEntryName_${dataTidFormat(fsEntry.name)}`}
      data-selected={selected}
      raised={selected}
      sx={{
        height: maxHeight,
        minHeight: maxHeight,
        maxHeight,
        maxWidth: 400,
        marginBottom: 'auto',
        borderRadius: AppConfig.defaultCSSRadius,
        backgroundColor: alpha(theme.palette.divider, 0.7),
        border: `2px solid ${selected ? theme.palette.primary.main : 'transparent'}`,
        display: 'flex',
        boxShadow: 'none',
        flexDirection: 'column',
      }}
      onContextMenu={handleContextMenu}
      onDoubleClick={(event) => handleGridCellDblClick(event, fsEntry)}
      onClick={handleCellClick}
      onDrag={handleCellClick}
    >
      <Box
        sx={{
          height: maxHeight - 70,
          position: 'relative',
          backgroundColor: findBackgroundColorForFolder(fsEntry),
        }}
      >
        <Box sx={{ position: 'absolute' }}>
          {showTags && entryTags.length > 0 ? (
            <>
              {renderTags()}
              {overflowTags && (
                <TagsOverflowChip
                  remaining={overflowTags}
                  entry={fsEntry}
                  handleTagMenu={handleTagMenu}
                />
              )}
            </>
          ) : (
            <TagsPreview tags={entryTags} />
          )}
        </Box>
        {fsEntry.meta?.thumbPath && thumbSrc ? (
          <CardMedia
            component="img"
            loading="lazy"
            onError={handleThumbError}
            alt={t('core:thumbnailImage')}
            data-tid="imageThumbnailTID"
            height="auto"
            src={thumbSrc.replace(/#/g, '%23')}
            sx={{
              height: maxHeight - 70,
              objectFit: thumbnailMode,
            }}
          />
        ) : (
          <Box
            sx={{
              width: '50%',
              height: 'auto',
              margin: '0 auto',
            }}
          >
            <EntryIcon
              isFile={fsEntry.isFile}
              fileExtension={fsEntry.extension}
            />
          </Box>
        )}
      </Box>

      <CardContent sx={{ padding: '1px 5px 0px 5px', flexGrow: 1 }}>
        <Typography
          title={fsEntry.name}
          sx={{
            paddingRight: '4px',
            overflowX: 'clip',
            textWrap: 'nowrap',
            whiteSpace: 'nowrap',
          }}
        >
          {entryTitle}
        </Typography>
        {description && (
          <Typography
            title={description}
            data-tid="gridCellDescription"
            variant="caption"
            display="block"
            gutterBottom
            sx={{
              lineHeight: '12px',
              paddingRight: '4px',
              overflowX: 'clip',
              textWrap: 'nowrap',
              whiteSpace: 'nowrap',
              fontStyle: 'italic',
              color: 'gray',
            }}
          >
            {description}
          </Typography>
        )}
      </CardContent>
      <CardHeader
        sx={{
          padding: '2px',
          '.MuiCardHeader-avatar': {
            margin: 0,
            alignSelf: 'flex-start',
          },
          '.MuiCardHeader-subheader': {
            fontSize: 12,
            marginLeft: '5px',
          },
        }}
        action={
          <TsIconButton
            aria-label="entry context menu"
            size="small"
            sx={{ marginRight: '5px' }}
            onClick={handleContextMenu}
          >
            <MoreMenuIcon />
          </TsIconButton>
        }
        subheader={generateCardHeader()}
        avatar={generateExtension()}
      />
    </Card>
  );
}

// Custom comparator: re-render only when something the cell actually displays
// changes. This makes single-file selection cheap — only the previously- and
// newly-selected cells repaint.
export default React.memo(GridCell, (prev, next) => {
  return (
    prev.selected === next.selected &&
    prev.selectionMode === next.selectionMode &&
    prev.fsEntry === next.fsEntry &&
    prev.fsEntry.meta === next.fsEntry.meta &&
    prev.isLast === next.isLast &&
    prev.handleTagMenu === next.handleTagMenu &&
    prev.handleGridContextMenu === next.handleGridContextMenu &&
    prev.handleGridCellClick === next.handleGridCellClick &&
    prev.handleGridCellDblClick === next.handleGridCellDblClick
  );
});
