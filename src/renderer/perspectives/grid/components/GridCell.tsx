/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2023-present TagSpaces UG (haftungsbeschraenkt)
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

import React, { useEffect, useMemo, useReducer, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Tooltip from '-/components/Tooltip';
import { FolderOutlineIcon } from '-/components/CommonIcons';
import IconButton from '@mui/material/IconButton';
import {
  SelectedIcon,
  UnSelectedIcon,
  MoreMenuIcon,
} from '-/components/CommonIcons';
import {
  formatFileSize,
  formatDateTime,
  locationType,
} from '@tagspaces/tagspaces-common/misc';
import {
  extractTagsAsObjects,
  extractTitle,
} from '@tagspaces/tagspaces-common/paths';
import AppConfig from '-/AppConfig';
import {
  findBackgroundColorForFolder,
  findColorForEntry,
  getDescriptionPreview,
} from '-/services/utils-io';
import TagContainerDnd from '-/components/TagContainerDnd';
import TagContainer from '-/components/TagContainer';
import TagsPreview from '-/components/TagsPreview';
import EntryIcon from '-/components/EntryIcon';
import { TS } from '-/tagspaces.namespace';
import { dataTidFormat } from '-/services/test';
import { getSupportedFileTypes, isReorderTags } from '-/reducers/settings';
import { defaultSettings } from '../index';
import { useTaggingActionsContext } from '-/hooks/useTaggingActionsContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { usePerspectiveSettingsContext } from '-/hooks/usePerspectiveSettingsContext';
import i18n from '-/services/i18n';
import { useEditedEntryMetaContext } from '-/hooks/useEditedEntryMetaContext';

export function urlGetDelim(url) {
  return url.indexOf('?') > 0 ? '&' : '?';
}

export function calculateEntryWidth(entrySize: TS.EntrySizes) {
  let entryWidth = 200;
  if (entrySize === 'tiny') {
    entryWidth = 100;
  } else if (entrySize === 'small') {
    entryWidth = 150;
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
    entryHeight = 100;
  } else if (entrySize === 'small') {
    entryHeight = 150;
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
  style?: any;
  selectionMode: boolean;
  handleTagMenu: (event: Object, tag: TS.Tag, entryPath: string) => void;
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
  const { addTags, addTag, editTagForEntry } = useTaggingActionsContext();
  const { findLocation, readOnlyMode } = useCurrentLocationContext();
  const supportedFileTypes = useSelector(getSupportedFileTypes);
  const reorderTags: boolean = useSelector(isReorderTags);
  //const locations: Array<CommonLocation> = useSelector(getLocations);
  //const lastThumbnailImageChange = useSelector(getLastThumbnailImageChange);
  // const desktopMode = useSelector(isDesktopMode);
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  const fileSystemEntryColor = findColorForEntry(fsEntry, supportedFileTypes);
  const maxHeight = calculateEntryHeight(entrySize);
  const entryPath = fsEntry.path;
  const isSmall = entrySize === 'tiny' || entrySize === 'small';

  useEffect(() => {
    if (metaActions && metaActions.length > 0) {
      for (const action of metaActions) {
        if (fsEntry.path === action.entry.path) {
          /*if (action.action === 'thumbChange') {
            if (action.entry.meta.thumbPath) {
              thumbUrl.current = getThumbPath(
                action.entry.meta.thumbPath,
                action.entry.meta?.lastUpdated,
              );
            } else {
              //thumbnail deleted
              thumbUrl.current = undefined;
              if (fsEntry.meta) {
                const { thumbPath, ...meta } = fsEntry.meta;
                fsEntry.meta = meta;
              }
            }
            forceUpdate();
          } else*/
          /*if (action.action === 'bgdColorChange') {
            fileSystemEntryBgColor.current = findBackgroundColorForFolder(
              action.entry,
            );
            forceUpdate();
          } else*/
          if (
            action.action === 'thumbChange' ||
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

  const gridCellLocation = findLocation(fsEntry.locationID);
  if (!gridCellLocation && fsEntry.locationID) {
    // location not exist in locationManager (maybe removed)
    return null;
  }

  const handleEditTag = (path: string, tag: TS.Tag, newTagTitle?: string) => {
    editTagForEntry(path, tag, newTagTitle);
  };
  const handleAddTags = (paths: Array<string>, tags: Array<TS.Tag>) => {
    addTags(paths, tags);
  };

  const handleAddTag = (tag: TS.Tag, parentTagGroupUuid: TS.Uuid) => {
    addTag(tag, parentTagGroupUuid);
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
      AppConfig.tagDelimiter,
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
      const tagContainer = readOnlyMode ? (
        <TagContainer
          tag={tag}
          key={entryPath + tag.title}
          entryPath={entryPath}
          addTags={handleAddTags}
          handleTagMenu={handleTagMenu}
        />
      ) : (
        <TagContainerDnd
          tag={tag}
          index={tag.type === 'sidecar' ? index : index - sideCarLength}
          key={entryPath + tag.title}
          entryPath={entryPath}
          addTags={handleAddTags}
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
  }; //, [entryTags, readOnlyMode, reorderTags, entryPath]);

  function generateExtension() {
    return selectionMode ? (
      <IconButton
        style={{
          minWidth: 35,
          padding: 4,
          paddingBottom: 2,
        }}
        size="small"
        // onMouseLeave={(e) => {
        //   //@ts-ignore
        //   e.target.style.opacity = selected ? 1 : 0.5;
        // }}
        // onMouseOver={(e) => {
        //   //@ts-ignore
        //   e.target.style.opacity = 1;
        // }}
        onClick={(e) => {
          e.stopPropagation();
          if (selected) {
            selectEntry(fsEntry, false);
          } else {
            selectEntry(fsEntry);
          }
        }}
      >
        {selected ? (
          <SelectedIcon
            style={{
              borderRadius: 15,
              // backgroundColor: '#d7d7d7',
            }}
          />
        ) : (
          <UnSelectedIcon
            style={{
              borderRadius: 15,
              // backgroundColor: 'd7d7d7',
            }}
          />
        )}
      </IconButton>
    ) : (
      <Tooltip title={i18n.t('clickToSelect') + ' ' + fsEntry.path}>
        <Typography
          style={{
            paddingTop: 1,
            paddingBottom: 9,
            paddingLeft: 3,
            paddingRight: 3,
            fontSize: 13,
            minWidth: 35,
            color: 'white',
            borderRadius: 3,
            textAlign: 'center',
            display: 'inline',
            backgroundColor: fileSystemEntryColor,
            textShadow: '1px 1px #8f8f8f',
            textOverflow: 'unset',
            height: 15,
            maxWidth: fsEntry.isFile ? 50 : 100,
          }}
          noWrap={true}
          variant="button"
          onClick={(e) => {
            e.stopPropagation();
            selectEntry(fsEntry);
          }}
        >
          {fsEntry.isFile ? fsEntry.extension : <FolderOutlineIcon />}
        </Typography>
      </Tooltip>
    );
  }

  return (
    <Card
      data-entry-id={fsEntry.uuid}
      data-tid={'fsEntryName_' + dataTidFormat(fsEntry.name)}
      raised={selected}
      style={{
        height: maxHeight,
        minHeight: maxHeight,
        maxHeight: maxHeight,
        maxWidth: 400,
        marginBottom: isLast ? 40 : 'auto',
        border:
          '2px solid ' +
          (selected ? theme.palette.primary.main : 'transparent'),
        display: 'flex',
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
        style={{
          height: maxHeight - 70,
          position: 'relative',
          backgroundColor: findBackgroundColorForFolder(fsEntry),
        }}
      >
        <Box style={{ position: 'absolute' }}>
          {showTags && entryTags ? (
            renderTags()
          ) : (
            <TagsPreview tags={entryTags} />
          )}
        </Box>
        {fsEntry.meta && fsEntry.meta.thumbPath ? (
          <CardMedia
            component="img"
            loading="lazy"
            // @ts-ignore
            onError={(i) => (i.target.style.display = 'none')}
            alt="thumbnail image"
            height="auto"
            src={gridCellLocation.getThumbPath(
              fsEntry.meta.thumbPath,
              fsEntry.meta?.lastUpdated,
            )}
            style={{
              height: maxHeight - 70,
              objectFit: thumbnailMode,
            }}
          />
        ) : (
          <Box
            style={{
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
          style={{
            paddingRight: 4,
            overflowX: 'clip',
            textWrap: 'nowrap',
            whiteSpace: 'nowrap',
            //   display: '-webkit-box',
            //   WebkitLineClamp: 2,
            //   WebkitBoxOrient: 'vertical',
            //   textOverflow: 'ellipsis',
            //   overflow: 'hidden',
          }}
        >
          {entryTitle}
        </Typography>
        <Typography
          title={description}
          data-tid="gridCellDescription"
          variant="caption"
          display="block"
          gutterBottom
          style={{
            lineHeight: '12px',
            paddingRight: 4,
            overflowX: 'clip',
            textWrap: 'nowrap',
            whiteSpace: 'nowrap',
            color: 'gray',
            // wordBreak: 'break-word',
          }}
        >
          {description}
        </Typography>
      </CardContent>
      <CardHeader
        style={{ padding: 2 }}
        sx={{
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
          <IconButton
            aria-label="entry context menu"
            size="small"
            style={{ marginRight: 5 }}
            onClick={(event) => handleGridContextMenu(event, fsEntry)}
          >
            <MoreMenuIcon />
          </IconButton>
        }
        subheader={generateCardHeader()}
        avatar={generateExtension()}
      ></CardHeader>
    </Card>
  );
}

export default GridCell;
