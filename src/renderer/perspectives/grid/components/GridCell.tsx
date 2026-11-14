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
import { MoreMenuIcon } from '-/components/CommonIcons';
import EntryIcon from '-/components/EntryIcon';
import TsIconButton from '-/components/TsIconButton';
import TsTooltip from '-/components/TsTooltip';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { usePerspectiveSettingsContext } from '-/hooks/usePerspectiveSettingsContext';
import {
  CELL_MENU_BUTTON_CLASS,
  EntryBadge,
  EntryTags,
  revealOnHoverSx,
  tintLayer,
  useDescriptionPreview,
  useEntryTags,
  useEntryThumbnail,
} from '-/perspectives/common/EntryCellParts';
import {
  getDefaultFolderColor,
  getSupportedFileTypes,
} from '-/reducers/settings';
import { dataTidFormat } from '-/services/test';
import {
  findBackgroundColorForFolder,
  findColorForEntry,
} from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import {
  formatDateTime,
  formatFileSize,
} from '@tagspaces/tagspaces-common/misc';
import { extractTitle } from '@tagspaces/tagspaces-common/paths';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { defaultSettings } from '../index';

// Centralize entry size config for maintainability
const ENTRY_SIZES = {
  tiny: 130,
  small: 160,
  big: 250,
  huge: 300,
  normal: 200,
} as const;

// Height reserved below the thumbnail for title, description and meta row.
const FOOTER_HEIGHT = 70;

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
  const { findLocation } = useCurrentLocationContext();
  const supportedFileTypes = useSelector(getSupportedFileTypes);
  const defaultFolderColor = useSelector(getDefaultFolderColor);
  const location = findLocation(fsEntry.locationID);

  const cellHeight = calculateEntryHeight(entrySize);
  const thumbHeight = cellHeight - FOOTER_HEIGHT;
  const isSmall = entrySize === 'tiny' || entrySize === 'small';

  const { cellRef, thumbSrc, onThumbError } = useEntryThumbnail(
    fsEntry,
    location,
  );
  const { entryTags, visibleTags, overflowTags } = useEntryTags(
    fsEntry,
    location,
    maxVisibleTags,
  );
  const description = useDescriptionPreview(
    fsEntry,
    showEntriesDescription,
    defaultSettings.maxDescriptionPreviewLength,
  );

  const badgeColor = useMemo(
    () => findColorForEntry(fsEntry, supportedFileTypes, defaultFolderColor),
    [fsEntry, supportedFileTypes, defaultFolderColor],
  );
  const folderBgColor = findBackgroundColorForFolder(fsEntry);

  const entryTitle = useMemo(
    () =>
      extractTitle(fsEntry.name, !fsEntry.isFile, location?.getDirSeparator()),
    [fsEntry.name, fsEntry.isFile, location],
  );

  const handleCellClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      AppConfig.isCapacitoriOS
        ? handleGridCellDblClick(event, fsEntry)
        : handleGridCellClick(event, fsEntry);
    },
    [fsEntry, handleGridCellDblClick, handleGridCellClick],
  );

  const handleContextMenu = useCallback(
    (event: React.MouseEvent) => handleGridContextMenu(event, fsEntry),
    [fsEntry, handleGridContextMenu],
  );

  const handleDoubleClick = useCallback(
    (event: React.MouseEvent) => handleGridCellDblClick(event, fsEntry),
    [fsEntry, handleGridCellDblClick],
  );

  // Every hook has run by now, so bailing out is safe for the rules of hooks.
  if (!location && fsEntry.locationID) {
    return null;
  }

  const isDark = theme.palette.mode === 'dark';
  const primary = theme.palette.primary.main;
  const showMeta = !isSmall && fsEntry.isFile && !!fsEntry.lmdt;

  return (
    <Box
      ref={cellRef}
      data-entry-id={fsEntry.uuid}
      data-tid={`fsEntryName_${dataTidFormat(fsEntry.name)}`}
      data-selected={selected}
      onContextMenu={handleContextMenu}
      onDoubleClick={handleDoubleClick}
      onClick={handleCellClick}
      onDrag={handleCellClick}
      sx={{
        height: cellHeight,
        maxWidth: 400,
        marginBottom: 'auto',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        cursor: 'default',
        borderRadius: AppConfig.defaultCSSRadius,
        border: '1px solid',
        borderColor: selected ? primary : theme.palette.divider,
        // Opaque base so the text stays readable on dark/coloured folder
        // backgrounds; the selection tint is layered on top of it.
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        backgroundImage: selected
          ? tintLayer(alpha(primary, isDark ? 0.2 : 0.08))
          : 'none',
        // A 1px ring on top of the 1px border reads as a 2px outline for the
        // selected state without shifting the layout.
        boxShadow: selected ? `0 0 0 1px ${primary}` : 'none',
        transition:
          'box-shadow 150ms ease, border-color 150ms ease, background-color 150ms ease',
        '&:hover': {
          borderColor: selected
            ? primary
            : alpha(theme.palette.text.primary, 0.24),
          boxShadow: selected
            ? `0 0 0 1px ${primary}, 0 6px 16px ${alpha('#000', isDark ? 0.45 : 0.12)}`
            : `0 6px 16px ${alpha('#000', isDark ? 0.45 : 0.12)}`,
        },
        '&:hover .ts-grid-thumb': { transform: 'scale(1.03)' },
        ...revealOnHoverSx(selected),
      }}
    >
      <Box
        sx={{
          position: 'relative',
          flex: '0 0 auto',
          height: thumbHeight,
          overflow: 'hidden',
          backgroundColor:
            folderBgColor && folderBgColor !== 'transparent'
              ? folderBgColor
              : alpha(theme.palette.text.primary, isDark ? 0.06 : 0.035),
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1,
            padding: '2px',
          }}
        >
          <EntryTags
            fsEntry={fsEntry}
            entryTags={entryTags}
            visibleTags={visibleTags}
            overflowTags={overflowTags}
            showTags={showTags}
            // Keep per-tag DnD active during multi-select: dragging a tag onto
            // a selected entry applies it to the whole selection (endDrag in
            // TagContainerDnd). Only read-only locations use static tags.
            staticTags={!!location?.isReadOnly}
            handleTagMenu={handleTagMenu}
          />
        </Box>
        {thumbSrc ? (
          <Box
            component="img"
            className="ts-grid-thumb"
            loading="lazy"
            decoding="async"
            draggable={false}
            onError={onThumbError}
            alt={t('core:thumbnailOfEntry', { name: fsEntry.name })}
            data-tid="imageThumbnailTID"
            src={thumbSrc}
            sx={{
              display: 'block',
              width: '100%',
              height: thumbHeight,
              objectFit: thumbnailMode,
              transition: 'transform 250ms ease',
            }}
          />
        ) : (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box sx={{ width: '45%', opacity: 0.9 }}>
              <EntryIcon
                isFile={fsEntry.isFile}
                fileExtension={fsEntry.extension}
                isSymbolicLink={fsEntry.isSymbolicLink}
                isBrokenSymlink={fsEntry.isBrokenSymlink}
              />
            </Box>
          </Box>
        )}
      </Box>
      <Box
        sx={{
          flex: '1 1 auto',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '5px 4px 4px 8px',
        }}
      >
        <Box sx={{ minWidth: 0, paddingRight: '4px' }}>
          <Typography
            variant="body2"
            noWrap
            title={fsEntry.name}
            sx={{ lineHeight: 1.35 }}
          >
            {entryTitle}
          </Typography>
          {description && (
            <Typography
              title={description}
              data-tid="gridCellDescription"
              variant="caption"
              noWrap
              component="div"
              sx={{
                lineHeight: 1.3,
                fontStyle: 'italic',
                color: theme.palette.text.secondary,
              }}
            >
              {description}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            minWidth: 0,
          }}
        >
          <EntryBadge
            fsEntry={fsEntry}
            color={badgeColor}
            selected={selected}
            selectionMode={selectionMode}
          />
          <Typography
            variant="caption"
            noWrap
            component="div"
            sx={{ flex: 1, minWidth: 0, color: theme.palette.text.secondary }}
          >
            {showMeta && (
              <>
                <TsTooltip
                  title={
                    t('core:modifiedDate') +
                    ': ' +
                    formatDateTime(fsEntry.lmdt, true)
                  }
                >
                  <span>{formatDateTime(fsEntry.lmdt, false)}</span>
                </TsTooltip>
                {' · '}
                <TsTooltip title={fsEntry.size + ' ' + t('core:sizeInBytes')}>
                  <span>{formatFileSize(fsEntry.size)}</span>
                </TsTooltip>
              </>
            )}
          </Typography>
          <TsIconButton
            className={CELL_MENU_BUTTON_CLASS}
            aria-label="entry context menu"
            size="small"
            onClick={handleContextMenu}
          >
            <MoreMenuIcon />
          </TsIconButton>
        </Box>
      </Box>
    </Box>
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
