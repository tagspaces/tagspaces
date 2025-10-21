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
import { useEffect, useReducer, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { defaultSettings } from '../index';

export function urlGetDelim(url) {
  return url.indexOf('?') > 0 ? '&' : '?';
}

export function calculateEntryWidth(entrySize: TS.EntrySizes) {
  let entryWidth = 200;
  if (entrySize === 'tiny') {
    entryWidth = 130;
  } else if (entrySize === 'small') {
    entryWidth = 160;
  } else if (entrySize === 'normal') {
    entryWidth = 200;
  } else if (entrySize === 'big') {
    entryWidth = 250;
  } else if (entrySize === 'huge') {
    entryWidth = 300;
  }
  return entryWidth;
}

export function calculateEntryHeight(entrySize: TS.EntrySizes) {
  let entryHeight = 200;
  if (entrySize === 'tiny') {
    entryHeight = 130;
  } else if (entrySize === 'small') {
    entryHeight = 160;
  } else if (entrySize === 'normal') {
    entryHeight = 200;
  } else if (entrySize === 'big') {
    entryHeight = 250;
  } else if (entrySize === 'huge') {
    entryHeight = 300;
  }
  return entryHeight;
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
  const thumbPath = useRef<string>(undefined);
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);
  const firstRender = useFirstRender();

  const fileSystemEntryColor = findColorForEntry(fsEntry, supportedFileTypes);
  const maxHeight = calculateEntryHeight(entrySize);
  const entryPath = fsEntry.path;
  const isSmall = entrySize === 'tiny' || entrySize === 'small';
  const gridCellLocation = findLocation(fsEntry.locationID);

  function getThumbUrl() {
    if (gridCellLocation) {
      return gridCellLocation
        .getThumbPath(fsEntry.meta.thumbPath, fsEntry.meta?.lastUpdated)
        .then((tmbPath) => {
          if (tmbPath !== thumbPath.current) {
            thumbPath.current = tmbPath;
            return true;
          }
          return false;
        });
    }
    return Promise.resolve(false);
  }

  function setThumbPath(): Promise<boolean> {
    if (gridCellLocation && fsEntry.meta) {
      if (fsEntry.meta.thumbPath) {
        if (gridCellLocation.encryptionKey) {
          let thumbFilePath = getThumbFileLocationForFile(
            fsEntry.path,
            gridCellLocation.getDirSeparator(),
            false,
          );
          return gridCellLocation
            .getFileContentPromise(thumbFilePath, 'arraybuffer')
            .then((arrayBuffer) => {
              if (arrayBuffer) {
                return arrayBufferToDataURL(arrayBuffer, 'image/jpeg').then(
                  (dataURL) => {
                    thumbPath.current = dataURL;
                    return true;
                  },
                );
              } else if (arrayBuffer === undefined) {
                return getThumbUrl();
              }
            });
        } else {
          return getThumbUrl();
        }
      }
    }
    return Promise.resolve(false);
  }

  useEffect(() => {
    setThumbPath().then((success) => {
      if (success) {
        forceUpdate();
      }
    });
  }, [fsEntry]);

  useEffect(() => {
    if (!firstRender && metaActions && metaActions.length > 0) {
      for (const action of metaActions) {
        if (
          action.entry &&
          cleanTrailingDirSeparator(cleanFrontDirSeparator(fsEntry.path)) ===
            cleanTrailingDirSeparator(cleanFrontDirSeparator(action.entry.path))
        ) {
          if (action.action === 'thumbChange') {
            fsEntry.meta = { ...action.entry.meta };
            setThumbPath().then((success) => {
              if (success) {
                forceUpdate();
              }
            });
          } else if (
            action.action === 'bgdColorChange' ||
            action.action === 'descriptionChange'
          ) {
            fsEntry.meta = { ...action.entry.meta };
            forceUpdate();
          }
        }
      }
    }
  }, [metaActions]);

  if (!gridCellLocation && fsEntry.locationID) {
    // location not exist in locationManager (maybe removed)
    return null;
  }

  const handleEditTag = (path: string, tag: TS.Tag, newTagTitle?: string) => {
    editTagForEntry(path, tag, newTagTitle);
  };

  const handleAddTag = (tag: TS.Tag, parentTagGroupUuid: TS.Uuid) => {
    addTag([tag], parentTagGroupUuid);
  };

  // remove isNewFile on Cell click it will open file in editMode
  /*const fSystemEntry: TS.FileSystemEntry = (({ isNewFile, ...o }) => o)(
    fsEntry,
  );*/

  const entryTitle = extractTitle(
    fsEntry.name,
    !fsEntry.isFile,
    gridCellLocation?.getDirSeparator(),
  );

  let description;
  if (showEntriesDescription) {
    description = fsEntry.meta?.description;
    if (
      description &&
      description.length > defaultSettings.maxDescriptionPreviewLength
    ) {
      description = getDescriptionPreview(
        description,
        defaultSettings.maxDescriptionPreviewLength,
      );
    }
  }

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

  let fileNameTags = [];
  if (fsEntry.isFile) {
    fileNameTags = extractTagsAsObjects(
      fsEntry.name,
      tagDelimiter,
      gridCellLocation?.getDirSeparator(),
    );
  }
  const fileSystemEntryTags =
    fsEntry.meta && fsEntry.meta.tags ? fsEntry.meta.tags : [];
  const sideCarTagsTitles = fileSystemEntryTags.map((tag) => tag.title);
  const entryTags = [
    ...fileSystemEntryTags,
    ...fileNameTags.filter((tag) => !sideCarTagsTitles.includes(tag.title)),
  ];
  const renderTags = () => {
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
  };

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
              if (selected) {
                selectEntry(fsEntry, false);
              } else {
                selectEntry(fsEntry);
              }
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
      data-tid={'fsEntryName_' + dataTidFormat(fsEntry.name)}
      raised={selected}
      sx={{
        height: maxHeight,
        minHeight: maxHeight,
        maxHeight: maxHeight,
        maxWidth: 400,
        marginBottom: 'auto', // isLast ? 40 : 'auto',
        borderRadius: AppConfig.defaultCSSRadius,
        backgroundColor: alpha(theme.palette.divider, 0.7),
        border:
          '2px solid ' +
          (selected ? theme.palette.primary.main : 'transparent'), // theme.palette.divider
        display: 'flex',
        boxShadow: 'none',
        flexDirection: 'column',
      }}
      onContextMenu={(event) => handleGridContextMenu(event, fsEntry)}
      onDoubleClick={(event) => {
        handleGridCellDblClick(event, fsEntry);
      }}
      onClick={(event) => {
        event.stopPropagation();
        AppConfig.isCordovaiOS // TODO DoubleClick not fired in Cordova IOS
          ? handleGridCellDblClick(event, fsEntry)
          : handleGridCellClick(event, fsEntry);
      }}
      onDrag={(event) => {
        handleGridCellClick(event, fsEntry);
      }}
    >
      <Box
        sx={{
          height: maxHeight - 70,
          position: 'relative',
          backgroundColor: findBackgroundColorForFolder(fsEntry),
        }}
      >
        <Box sx={{ position: 'absolute' }}>
          {showTags && entryTags ? (
            renderTags()
          ) : (
            <TagsPreview tags={entryTags} />
          )}
        </Box>
        {fsEntry.meta && fsEntry.meta.thumbPath && thumbPath.current ? (
          <CardMedia
            component="img"
            loading="lazy"
            // @ts-ignore
            onError={(i) => (i.target.style.display = 'none')}
            alt="thumbnail image"
            height="auto"
            src={thumbPath.current.replace(/#/g, '%23')}
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
            onClick={(event) => handleGridContextMenu(event, fsEntry)}
          >
            <MoreMenuIcon />
          </TsIconButton>
        }
        subheader={generateCardHeader()}
        avatar={generateExtension()}
      ></CardHeader>
    </Card>
  );
}

export default GridCell;
