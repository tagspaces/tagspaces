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
import FileExtBadge from '-/components/FileExtBadge';
import TagContainer from '-/components/TagContainer';
import TagContainerDnd from '-/components/TagContainerDnd';
import TagsPreview from '-/components/TagsPreview';
import Tooltip from '-/components/Tooltip';
import TsIconButton from '-/components/TsIconButton';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { usePerspectiveSettingsContext } from '-/hooks/usePerspectiveSettingsContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { useTaggingActionsContext } from '-/hooks/useTaggingActionsContext';
import {
  getSupportedFileTypes,
  getTagDelimiter,
  isReorderTags,
} from '-/reducers/settings';
import i18n from '-/services/i18n';
import {
  findBackgroundColorForFolder,
  findColorForEntry,
  getDescriptionPreview,
} from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import {
  formatDateTime,
  formatFileSize,
} from '@tagspaces/tagspaces-common/misc';
import {
  extractTagsAsObjects,
  extractTitle,
} from '@tagspaces/tagspaces-common/paths';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { defaultSettings } from '../index';

interface Props {
  selected: boolean;
  isLast?: boolean;
  fsEntry: TS.FileSystemEntry;
  style?: any;
  selectionMode: boolean;
  handleTagMenu: (
    event: Object,
    tag: TS.Tag,
    entry: TS.FileSystemEntry,
  ) => void;
  handleGridContextMenu: (event: Object, fsEntry: TS.FileSystemEntry) => void;
  handleGridCellDblClick: (event: Object, fsEntry: TS.FileSystemEntry) => void;
  handleGridCellClick: (event: Object, fsEntry: TS.FileSystemEntry) => void;
  showEntriesDescription?: boolean;
}

export function calculateEntryHeight(entrySize: TS.EntrySizes) {
  switch (entrySize) {
    case 'tiny':
      return 35;
    case 'small':
      return 55;
    case 'normal':
      return 75;
    case 'big':
      return 95;
    case 'huge':
      return 115;
    default:
      return 200;
  }
}

function RowCell(props: Props) {
  const {
    selected,
    fsEntry,
    handleTagMenu,
    handleGridContextMenu,
    handleGridCellDblClick,
    handleGridCellClick,
    showEntriesDescription,
    selectionMode,
    isLast,
  } = props;

  const { t } = useTranslation();
  const theme = useTheme();
  const { selectedEntries, selectEntry } = useSelectedEntriesContext();
  const { entrySize, showTags, thumbnailMode } =
    usePerspectiveSettingsContext();
  const { addTag, editTagForEntry } = useTaggingActionsContext();
  const { currentLocation } = useCurrentLocationContext();
  const supportedFileTypes = useSelector(getSupportedFileTypes);
  const reorderTags: boolean = useSelector(isReorderTags);
  const tagDelimiter: string = useSelector(getTagDelimiter);

  const handleAddTag = (tag: TS.Tag, parentTagGroupUuid: TS.Uuid) => {
    addTag([tag], parentTagGroupUuid);
  };

  const entryTitle = useMemo(
    () =>
      extractTitle(
        fsEntry.name,
        !fsEntry.isFile,
        currentLocation?.getDirSeparator(),
      ),
    [fsEntry.name, fsEntry.isFile, currentLocation],
  );

  const description = useMemo(() => {
    if (!showEntriesDescription) return '';
    let desc = fsEntry.meta?.description;
    if (desc && desc.length > defaultSettings.maxDescriptionPreviewLength) {
      desc = getDescriptionPreview(
        desc,
        defaultSettings.maxDescriptionPreviewLength,
      );
    }
    return desc && fsEntry.isFile ? ` | ${desc}` : desc || '';
  }, [showEntriesDescription, fsEntry.meta?.description, fsEntry.isFile]);

  const fileSystemEntryColor = useMemo(
    () => findColorForEntry(fsEntry, supportedFileTypes),
    [fsEntry, supportedFileTypes],
  );
  const fileSystemEntryBgColor = useMemo(
    () => findBackgroundColorForFolder(fsEntry),
    [fsEntry],
  );

  const fileNameTags = useMemo(
    () =>
      fsEntry.isFile
        ? extractTagsAsObjects(
            fsEntry.name,
            tagDelimiter,
            currentLocation?.getDirSeparator(),
          )
        : [],
    [fsEntry.isFile, fsEntry.name, tagDelimiter, currentLocation],
  );

  const fileSystemEntryTags: TS.Tag[] = fsEntry.meta?.tags ?? [];
  const sideCarTagsTitles = useMemo(
    () => fileSystemEntryTags.map((tag) => tag.title),
    [fileSystemEntryTags],
  );
  const entryTags = useMemo(
    () => [
      ...fileSystemEntryTags,
      ...fileNameTags.filter((tag) => !sideCarTagsTitles.includes(tag.title)),
    ],
    [fileSystemEntryTags, fileNameTags, sideCarTagsTitles],
  );

  const entrySizeFormatted = fsEntry.isFile
    ? `${formatFileSize(fsEntry.size)} | `
    : '';

  const entryLMDTFormatted =
    fsEntry.isFile && fsEntry.lmdt ? formatDateTime(fsEntry.lmdt, true) : '';

  const tagPlaceholder = <TagsPreview tags={entryTags} />;

  const entryPath = fsEntry.path;

  const renderTags = useMemo(() => {
    let sideCarLength = 0;
    return entryTags.map((tag: TS.Tag, index) => {
      const tagContainer = currentLocation?.isReadOnly ? (
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
          selectedEntries={selectedEntries}
          editTagForEntry={editTagForEntry}
          reorderTags={reorderTags}
        />
      );
      if (tag.type === 'sidecar') {
        sideCarLength = index + 1;
      }
      return tagContainer;
    });
  }, [
    entryTags,
    currentLocation?.isReadOnly,
    entryPath,
    fsEntry,
    handleTagMenu,
    addTag,
    selectedEntries,
    editTagForEntry,
    reorderTags,
  ]);

  const entryHeight = calculateEntryHeight(entrySize);
  const isSmall = entrySize === 'tiny';

  const entryBackgroundColor =
    fileSystemEntryBgColor === 'transparent'
      ? theme.palette.background.default
      : fileSystemEntryBgColor;

  const backgroundColor = selected
    ? theme.palette.primary.light
    : entryBackgroundColor;

  const handleBadgeClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (selectionMode) {
        selectEntry(fsEntry, !selected);
      } else {
        selectEntry(fsEntry);
      }
    },
    [selectionMode, selectEntry, fsEntry, selected],
  );

  const handlePaperClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      AppConfig.isCordovaiOS
        ? handleGridCellDblClick(event, fsEntry)
        : handleGridCellClick(event, fsEntry);
    },
    [handleGridCellClick, handleGridCellDblClick, fsEntry],
  );

  const handlePaperDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      handleGridCellDblClick(event, fsEntry);
    },
    [handleGridCellDblClick, fsEntry],
  );

  const handlePaperContextMenu = useCallback(
    (event: React.MouseEvent) => {
      handleGridContextMenu(event, fsEntry);
    },
    [handleGridContextMenu, fsEntry],
  );

  const handlePaperDrag = useCallback(
    (event: React.DragEvent) => {
      handleGridCellClick(event, fsEntry);
    },
    [handleGridCellClick, fsEntry],
  );

  function urlGetDelim(url: string) {
    return url.indexOf('?') > 0 ? '&' : '?';
  }

  return (
    <Paper
      data-entry-id={fsEntry.uuid}
      sx={{
        boxShadow: 'none',
        borderRadius: 0,
        borderLeft: '1px solid transparent',
        borderRight: '1px solid transparent',
        borderTop: '1px solid transparent',
        borderBottom: `1px solid ${theme.palette.divider}`,
        background: 'transparent',
        margin: 0,
        paddingBottom: '5px',
        marginLeft: '5px',
        minHeight: entryHeight,
        marginBottom: isLast ? '40px' : 'auto',
      }}
      onContextMenu={handlePaperContextMenu}
      onDoubleClick={handlePaperDoubleClick}
      onClick={handlePaperClick}
      onDrag={handlePaperDrag}
    >
      <Grid
        container
        wrap="nowrap"
        sx={{
          borderRadius: AppConfig.defaultCSSRadius,
          backgroundColor,
          '&:hover': {
            backgroundColor: `${theme.palette.divider} !important`,
          },
        }}
      >
        <Grid
          sx={{
            minHeight: entryHeight,
            minWidth: 50,
            height: 30,
            padding: '3px',
            textAlign: 'left',
            display: 'flex',
            alignSelf: 'center',
          }}
        >
          <Tooltip title={i18n.t('clickToSelect') + ': ' + fsEntry.name}>
            <FileExtBadge
              sx={{
                backgroundColor: fileSystemEntryColor,
              }}
              noWrap
              variant="button"
              onClick={handleBadgeClick}
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
        </Grid>
        {isSmall ? (
          <Grid
            sx={{
              display: 'flex',
              width: '100%',
              marginLeft: '5px',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                overflowX: 'hidden',
                textWrap: 'nowrap',
                alignSelf: 'center',
                marginRight: '5px',
              }}
              title={
                fsEntry.name +
                ' | ' +
                entrySizeFormatted +
                formatDateTime(fsEntry.lmdt, true)
              }
            >
              {entryTitle}
              &nbsp;
              {showTags && entryTags.length > 0 ? renderTags : tagPlaceholder}
            </Typography>
          </Grid>
        ) : (
          <Grid sx={{ alignSelf: 'center', width: '100%', marginLeft: '5px' }}>
            <Typography
              variant="body1"
              title={fsEntry.path}
              sx={{ wordBreak: 'break-all' }}
            >
              {entryTitle}
            </Typography>
            <Typography
              data-tid="gridCellDescription"
              sx={{ color: 'gray' }}
              variant="body2"
            >
              <Tooltip title={fsEntry.size + ' ' + t('core:sizeInBytes')}>
                {entrySizeFormatted}
              </Tooltip>
              <Tooltip
                title={
                  t('core:modifiedDate') +
                  ': ' +
                  formatDateTime(fsEntry.lmdt, true)
                }
              >
                <span>{entryLMDTFormatted}</span>
              </Tooltip>
              <span>{description}</span>
            </Typography>
            {showTags && entryTags.length > 0 ? renderTags : tagPlaceholder}
          </Grid>
        )}
        {fsEntry.meta?.thumbPath && (
          <Grid
            sx={{
              display: 'flex',
              width: entryHeight,
              alignItems: 'center',
            }}
          >
            <img
              alt="thumbnail"
              src={
                fsEntry.meta.thumbPath +
                (!currentLocation.haveObjectStoreSupport() &&
                !currentLocation.haveWebDavSupport()
                  ? urlGetDelim(fsEntry.meta.thumbPath) +
                    fsEntry.meta.lastUpdated
                  : '')
              }
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
              loading="lazy"
              style={{
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                objectFit: thumbnailMode,
                height: entryHeight - 5,
                width: entryHeight - 5,
              }}
            />
          </Grid>
        )}
        <Grid
          sx={{
            display: 'flex',
            alignItems: 'center',
            marginRight: '5px',
            paddingRight: '10px',
          }}
        >
          <TsIconButton
            aria-label="entry context menu"
            onClick={handlePaperContextMenu}
          >
            <MoreMenuIcon />
          </TsIconButton>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default RowCell;
