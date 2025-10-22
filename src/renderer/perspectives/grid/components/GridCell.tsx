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
import TagsPreview from '-/components/TagsPreview';
import Tooltip from '-/components/Tooltip';
import TsIconButton from '-/components/TsIconButton';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useEditedEntryMetaContext } from '-/hooks/useEditedEntryMetaContext';
import { usePerspectiveSettingsContext } from '-/hooks/usePerspectiveSettingsContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { useTaggingActionsContext } from '-/hooks/useTaggingActionsContext';
import {
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
import { useCallback, useEffect, useMemo, useState } from 'react';
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
  const { entrySize, showEntriesDescription, showTags, thumbnailMode } =
    usePerspectiveSettingsContext();
  const { metaActions } = useEditedEntryMetaContext();
  const { selectedEntries, selectEntry } = useSelectedEntriesContext();
  const { addTag, editTagForEntry } = useTaggingActionsContext();
  const { findLocation } = useCurrentLocationContext();
  const supportedFileTypes = useSelector(getSupportedFileTypes);
  const reorderTags: boolean = useSelector(isReorderTags);
  const tagDelimiter: string = useSelector(getTagDelimiter);
  const firstRender = useFirstRender();

  const fileSystemEntryColor = useMemo(
    () => findColorForEntry(fsEntry, supportedFileTypes),
    [fsEntry, supportedFileTypes],
  );
  const maxHeight = calculateEntryHeight(entrySize);
  const entryPath = fsEntry.path;
  const isSmall = entrySize === 'tiny' || entrySize === 'small';
  const gridCellLocation = findLocation(fsEntry.locationID);

  // Thumbnail state and helpers
  const [thumbSrc, setThumbSrc] = useState<string | undefined>(undefined);

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
    setThumbPath();
  }, [setThumbPath]);

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

  const fileNameTags = useMemo(() => {
    if (!fsEntry.isFile) return [];
    return extractTagsAsObjects(
      fsEntry.name,
      tagDelimiter,
      gridCellLocation?.getDirSeparator(),
    );
  }, [fsEntry.isFile, fsEntry.name, tagDelimiter, gridCellLocation]);

  const fileSystemEntryTags: TS.Tag[] = fsEntry.meta?.tags ?? [];

  const entryTags = useMemo(() => {
    const sideCarTitles = new Set(fileSystemEntryTags.map((t) => t.title));
    return [
      ...fileSystemEntryTags,
      ...fileNameTags.filter((t) => !sideCarTitles.has(t.title)),
    ];
  }, [fileSystemEntryTags, fileNameTags]);

  const renderTags = useCallback(() => {
    let sideCarLength = 0;
    return entryTags.map((tag: TS.Tag, index) => {
      const tagContainer = gridCellLocation.isReadOnly ? (
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
    entryTags,
    gridCellLocation,
    entryPath,
    fsEntry,
    handleTagMenu,
    handleAddTag,
    selectedEntries,
    handleEditTag,
    reorderTags,
  ]);

  // Memoized handlers for clarity and performance
  const handleCellClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      AppConfig.isCordovaiOS
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
            renderTags()
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

export default GridCell;
