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

import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme, styled } from '@mui/material/styles';
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
import PlatformIO from '-/services/platform-facade';
import EntryIcon from '-/components/EntryIcon';
import { TS } from '-/tagspaces.namespace';
import {
  actions as AppActions,
  AppDispatch,
  getLastThumbnailImageChange,
} from '-/reducers/app';
import { dataTidFormat } from '-/services/test';
import {
  getSupportedFileTypes,
  isDesktopMode,
  isReorderTags,
} from '-/reducers/settings';
import { defaultSettings } from '../index';
import { useTaggingActionsContext } from '-/hooks/useTaggingActionsContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { usePerspectiveSettingsContext } from '-/hooks/usePerspectiveSettingsContext';
import i18n from '-/services/i18n';

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
  const { selectedEntries, selectEntry } = useSelectedEntriesContext();
  const { addTags, editTagForEntry } = useTaggingActionsContext();
  const { readOnlyMode } = useCurrentLocationContext();
  const supportedFileTypes = useSelector(getSupportedFileTypes);
  const reorderTags: boolean = useSelector(isReorderTags);
  const lastThumbnailImageChange = useSelector(getLastThumbnailImageChange);
  // const desktopMode = useSelector(isDesktopMode);
  const dispatch: AppDispatch = useDispatch();

  const handleEditTag = (path: string, tag: TS.Tag, newTagTitle?: string) => {
    editTagForEntry(path, tag, newTagTitle);
  };
  const handleAddTags = (
    paths: Array<string>,
    tags: Array<TS.Tag>,
    updateIndex?,
  ) => {
    addTags(paths, tags, updateIndex);
  };

  const handleAddTag = (tag: TS.Tag, parentTagGroupUuid: TS.Uuid) => {
    dispatch(AppActions.addTag(tag, parentTagGroupUuid));
  };

  // remove isNewFile on Cell click it will open file in editMode
  const fSystemEntry: TS.FileSystemEntry = (({ isNewFile, ...o }) => o)(
    fsEntry,
  );

  const entryTitle = extractTitle(
    fSystemEntry.name,
    !fSystemEntry.isFile,
    PlatformIO.getDirSeparator(),
  );

  let description;
  if (showEntriesDescription) {
    description = fSystemEntry.description;
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

  const fileSystemEntryColor = findColorForEntry(
    fSystemEntry,
    supportedFileTypes,
  );
  const fileSystemEntryBgColor = findBackgroundColorForFolder(fSystemEntry);

  let fileNameTags = [];
  if (fSystemEntry.isFile) {
    fileNameTags = extractTagsAsObjects(
      fSystemEntry.name,
      AppConfig.tagDelimiter,
      PlatformIO.getDirSeparator(),
    );
  }

  const fileSystemEntryTags = fSystemEntry.tags ? fSystemEntry.tags : [];
  const sideCarTagsTitles = fileSystemEntryTags.map((tag) => tag.title);
  const entryTags = [
    ...fileSystemEntryTags,
    ...fileNameTags.filter((tag) => !sideCarTagsTitles.includes(tag.title)),
  ];

  const entryPath = fSystemEntry.path;
  const isSmall = entrySize === 'tiny' || entrySize === 'small';

  const renderTags = useMemo(() => {
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
  }, [entryTags, readOnlyMode, reorderTags, entryPath]);

  const maxHeight = calculateEntryHeight(entrySize);

  function generateCardHeader() {
    return (
      !isSmall &&
      fSystemEntry.isFile &&
      fSystemEntry.lmdt && (
        <>
          <Tooltip
            title={
              t('core:modifiedDate') +
              ': ' +
              formatDateTime(fSystemEntry.lmdt, true)
            }
          >
            {formatDateTime(fSystemEntry.lmdt, false)}
          </Tooltip>
          <Tooltip title={fSystemEntry.size + ' ' + t('core:sizeInBytes')}>
            <span>{' | ' + formatFileSize(fSystemEntry.size)}</span>
          </Tooltip>
        </>
      )
    );
  }

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
            selectEntry(fSystemEntry, false);
          } else {
            selectEntry(fSystemEntry);
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
      <Tooltip title={i18n.t('clickToSelect') + ' ' + fSystemEntry.path}>
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
            maxWidth: fSystemEntry.isFile ? 50 : 100,
          }}
          noWrap={true}
          variant="button"
          onClick={(e) => {
            e.stopPropagation();
            selectEntry(fSystemEntry);
          }}
        >
          {fSystemEntry.isFile ? fSystemEntry.extension : <FolderOutlineIcon />}
        </Typography>
      </Tooltip>
    );
  }

  const tmbImgSrc =
    fSystemEntry.thumbPath +
    (lastThumbnailImageChange &&
    lastThumbnailImageChange.thumbPath === fSystemEntry.thumbPath &&
    !PlatformIO.haveObjectStoreSupport() &&
    !PlatformIO.haveWebDavSupport()
      ? urlGetDelim(fSystemEntry.thumbPath) + lastThumbnailImageChange.dt
      : '');

  return (
    <Card
      data-entry-id={fSystemEntry.uuid}
      data-tid={'fsEntryName_' + dataTidFormat(fSystemEntry.name)}
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
      onContextMenu={(event) => handleGridContextMenu(event, fSystemEntry)}
      onDoubleClick={(event) => {
        handleGridCellDblClick(event, fSystemEntry);
      }}
      onClick={(event) => {
        event.stopPropagation();
        AppConfig.isCordovaiOS // TODO DoubleClick not fired in Cordova IOS
          ? handleGridCellDblClick(event, fSystemEntry)
          : handleGridCellClick(event, fSystemEntry);
      }}
      onDrag={(event) => {
        handleGridCellClick(event, fSystemEntry);
      }}
    >
      <Box
        style={{
          height: maxHeight - 70,
          position: 'relative',
          backgroundColor: fileSystemEntryBgColor || 'transparent',
        }}
      >
        <Box style={{ position: 'absolute' }}>
          {showTags && entryTags ? (
            renderTags
          ) : (
            <TagsPreview tags={entryTags} />
          )}
        </Box>
        {fSystemEntry.thumbPath ? (
          <CardMedia
            component="img"
            loading="lazy"
            // @ts-ignore
            onError={(i) => (i.target.style.display = 'none')}
            alt="thumbnail image"
            height="auto"
            src={tmbImgSrc}
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
              isFile={fSystemEntry.isFile}
              fileExtension={fSystemEntry.extension}
            />
          </Box>
        )}
      </Box>

      <CardContent sx={{ padding: '1px 5px 0px 5px', flexGrow: 1 }}>
        <Typography
          title={fSystemEntry.name}
          style={{
            paddingRight: 4,
            overflowX: 'clip',
            textWrap: 'nowrap', // isSmall ? 'nowrap' : 'unset',
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
          variant="caption"
          display="block"
          gutterBottom
          style={{
            lineHeight: '12px',
            paddingRight: 4,
            overflowX: 'clip',
            textWrap: 'nowrap',
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
            onClick={(event) => handleGridContextMenu(event, fSystemEntry)}
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
