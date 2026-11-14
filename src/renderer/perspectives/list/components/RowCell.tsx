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

interface Props {
  selected: boolean;
  isLast?: boolean;
  fsEntry: TS.FileSystemEntry;
  selectionMode: boolean;
  handleTagMenu: (
    event: Object,
    tag: TS.Tag,
    entry: TS.FileSystemEntry,
  ) => void;
  handleGridContextMenu: (event: Object, fsEntry: TS.FileSystemEntry) => void;
  handleGridCellDblClick: (event: Object, fsEntry: TS.FileSystemEntry) => void;
  handleGridCellClick: (event: Object, fsEntry: TS.FileSystemEntry) => void;
}

const ROW_HEIGHTS = {
  tiny: 35,
  small: 55,
  normal: 75,
  big: 95,
  huge: 115,
} as const;

export function calculateEntryHeight(entrySize: TS.EntrySizes) {
  return ROW_HEIGHTS[entrySize] ?? 200;
}

function RowCell(props: Props) {
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
    showTags,
    showEntriesDescription,
    thumbnailMode,
    maxVisibleTags,
  } = usePerspectiveSettingsContext();
  const { findLocation } = useCurrentLocationContext();
  const supportedFileTypes = useSelector(getSupportedFileTypes);
  const defaultFolderColor = useSelector(getDefaultFolderColor);
  // Resolve through the entry's own location: search results can span
  // several locations, so the current location is not always the right one.
  const location = findLocation(fsEntry.locationID);

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

  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      AppConfig.isCapacitoriOS
        ? handleGridCellDblClick(event, fsEntry)
        : handleGridCellClick(event, fsEntry);
    },
    [handleGridCellClick, handleGridCellDblClick, fsEntry],
  );

  const handleDoubleClick = useCallback(
    (event: React.MouseEvent) => handleGridCellDblClick(event, fsEntry),
    [handleGridCellDblClick, fsEntry],
  );

  const handleContextMenu = useCallback(
    (event: React.MouseEvent) => handleGridContextMenu(event, fsEntry),
    [handleGridContextMenu, fsEntry],
  );

  const handleDrag = useCallback(
    (event: React.DragEvent) => handleGridCellClick(event, fsEntry),
    [handleGridCellClick, fsEntry],
  );

  const entryHeight = calculateEntryHeight(entrySize);
  const isTiny = entrySize === 'tiny';
  const isDark = theme.palette.mode === 'dark';
  const primary = theme.palette.primary.main;
  const hasFolderColor = !!folderBgColor && folderBgColor !== 'transparent';
  const thumbSize = Math.max(entryHeight - 8, 24);

  const sizeText = fsEntry.isFile ? formatFileSize(fsEntry.size) : '';
  const dateText =
    fsEntry.isFile && fsEntry.lmdt ? formatDateTime(fsEntry.lmdt, true) : '';

  const tags = (
    <EntryTags
      fsEntry={fsEntry}
      entryTags={entryTags}
      visibleTags={visibleTags}
      overflowTags={overflowTags}
      showTags={showTags}
      // In multi-select the drag operation is on the row, not on the tag.
      staticTags={!!location?.isReadOnly || selectionMode}
      handleTagMenu={handleTagMenu}
    />
  );

  return (
    <Box
      ref={cellRef}
      data-entry-id={fsEntry.uuid}
      data-tid={`fsEntryName_${dataTidFormat(fsEntry.name)}`}
      data-selected={selected}
      onContextMenu={handleContextMenu}
      onDoubleClick={handleDoubleClick}
      onClick={handleClick}
      onDrag={handleDrag}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        minHeight: entryHeight,
        padding: '2px 4px 2px 6px',
        marginBottom: isLast ? '40px' : 0,
        cursor: 'default',
        borderRadius: AppConfig.defaultCSSRadius,
        // Opaque base so the text stays readable on dark/coloured folder
        // backgrounds; selection and hover tints are layered on top of it.
        backgroundColor: hasFolderColor
          ? folderBgColor
          : theme.palette.background.default,
        color: theme.palette.text.primary,
        backgroundImage: selected
          ? tintLayer(alpha(primary, isDark ? 0.24 : 0.12))
          : 'none',
        boxShadow: selected ? `inset 0 0 0 1px ${alpha(primary, 0.6)}` : 'none',
        transition: 'background-color 120ms ease, box-shadow 120ms ease',
        '&:hover': {
          backgroundImage: tintLayer(
            selected
              ? alpha(primary, isDark ? 0.3 : 0.16)
              : alpha(theme.palette.text.primary, isDark ? 0.08 : 0.05),
          ),
          boxShadow: selected
            ? `inset 0 0 0 1px ${alpha(primary, 0.6)}`
            : `inset 0 0 0 1px ${theme.palette.divider}`,
        },
        // Hairline separator in the gap below the row, inset to start at the
        // title column (6px padding + 64px badge + 10px gap). Hidden on the
        // last row and while the row is hovered/selected, where the rounded
        // highlight already separates it.
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          left: 80,
          right: 8,
          bottom: -1.5,
          height: '1px',
          backgroundColor: theme.palette.divider,
          pointerEvents: 'none',
          display: isLast || selected ? 'none' : 'block',
        },
        '&:hover::after': { display: 'none' },
        ...revealOnHoverSx(selected),
      }}
    >
      <EntryBadge
        fsEntry={fsEntry}
        color={badgeColor}
        selected={selected}
        selectionMode={selectionMode}
        width={64}
      />
      {isTiny ? (
        <Typography
          variant="body2"
          noWrap
          component="div"
          title={[fsEntry.name, sizeText, dateText].filter(Boolean).join(' · ')}
          sx={{ flex: 1, minWidth: 0 }}
        >
          {entryTitle}
          {tags}
        </Typography>
      ) : (
        <Box sx={{ flex: 1, minWidth: 0, paddingY: '3px' }}>
          <Typography
            variant="body2"
            title={fsEntry.path}
            sx={{
              fontWeight: 500,
              lineHeight: 1.35,
              wordBreak: 'break-word',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {entryTitle}
          </Typography>
          {(sizeText || dateText || description) && (
            <Typography
              data-tid="gridCellDescription"
              variant="caption"
              component="div"
              noWrap
              sx={{ color: theme.palette.text.secondary, lineHeight: 1.5 }}
            >
              {sizeText && (
                <TsTooltip title={fsEntry.size + ' ' + t('core:sizeInBytes')}>
                  <span>{sizeText}</span>
                </TsTooltip>
              )}
              {sizeText && dateText && ' · '}
              {dateText && (
                <TsTooltip title={t('core:modifiedDate') + ': ' + dateText}>
                  <span>{dateText}</span>
                </TsTooltip>
              )}
              {description && (
                <Box
                  component="span"
                  title={description}
                  sx={{ fontStyle: 'italic' }}
                >
                  {(sizeText || dateText ? ' · ' : '') + description}
                </Box>
              )}
            </Typography>
          )}
          {tags}
        </Box>
      )}
      {thumbSrc && (
        <Box
          component="img"
          loading="lazy"
          decoding="async"
          draggable={false}
          alt={t('core:thumbnailOfEntry', { name: fsEntry.name })}
          src={thumbSrc}
          onError={onThumbError}
          sx={{
            flexShrink: 0,
            width: thumbSize,
            height: thumbSize,
            objectFit: thumbnailMode,
            borderRadius: '6px',
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: alpha(theme.palette.text.primary, 0.04),
          }}
        />
      )}
      <TsIconButton
        className={CELL_MENU_BUTTON_CLASS}
        aria-label="entry context menu"
        size="small"
        onClick={handleContextMenu}
      >
        <MoreMenuIcon />
      </TsIconButton>
    </Box>
  );
}

// Custom comparator: re-render only when something the row actually displays
// changes. Mirrors GridCell's memoization so single-file selection doesn't
// repaint the entire visible page.
export default React.memo(RowCell, (prev, next) => {
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
