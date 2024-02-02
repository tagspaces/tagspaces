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
import classNames from 'classnames';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Tooltip from '-/components/Tooltip';
import IconButton from '@mui/material/IconButton';
import {
  SelectedIcon,
  UnSelectedIcon,
  FolderOutlineIcon,
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
import { TS } from '-/tagspaces.namespace';
import {
  actions as AppActions,
  AppDispatch,
  getLastThumbnailImageChange,
} from '-/reducers/app';
import { getSupportedFileTypes, isReorderTags } from '-/reducers/settings';
import { defaultSettings } from '../index';
import { useTranslation } from 'react-i18next';
import { useTaggingActionsContext } from '-/hooks/useTaggingActionsContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { usePerspectiveSettingsContext } from '-/hooks/usePerspectiveSettingsContext';
import i18n from '-/services/i18n';

const PREFIX = 'RowStyles';
export const classes = {
  rowCell: `${PREFIX}-rowCell`,
  rowHover: `${PREFIX}-rowHover`,
  selectedRowCell: `${PREFIX}-selectedRowCell`,
};

export const RowPaper = styled(Paper)(({ theme }) => ({
  [`& .${classes.rowCell}`]: {
    boxShadow: 'none',
    borderLeft: '1px solid transparent',
    borderRight: '1px solid transparent',
    borderTop: '1px solid transparent',
    borderBottom: '1px solid ' + theme.palette.divider,
    margin: 0,
    marginTop: 0,
    marginBottom: 0,
  },
  [`& .${classes.rowHover}`]: {
    '&:hover': {
      backgroundColor: theme.palette.divider + ' !important',
    },
  },
  [`& .${classes.selectedRowCell}`]: {
    border: '1px solid' + theme.palette.primary.main + ' !important',
  },
}));

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
  showEntriesDescription?: boolean;
}

export function calculateEntryHeight(entrySize: TS.EntrySizes) {
  let entryHeight = 200;
  if (entrySize === 'tiny') {
    entryHeight = 30;
  } else if (entrySize === 'small') {
    entryHeight = 70;
  } else if (entrySize === 'normal') {
    entryHeight = 90;
  } else if (entrySize === 'big') {
    entryHeight = 120;
  } else if (entrySize === 'huge') {
    entryHeight = 150;
  }
  return entryHeight;
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
  const { addTags, editTagForEntry } = useTaggingActionsContext();
  const { readOnlyMode } = useCurrentLocationContext();
  const supportedFileTypes = useSelector(getSupportedFileTypes);
  const reorderTags: boolean = useSelector(isReorderTags);
  const lastThumbnailImageChange = useSelector(getLastThumbnailImageChange);
  const dispatch: AppDispatch = useDispatch();

  // You can use the dispatch function to dispatch actions
  const handleEditTag = (path: string, tag: TS.Tag, newTagTitle?: string) => {
    editTagForEntry(path, tag, newTagTitle);
  };
  const handleAddTags = (paths: Array<string>, tags: Array<TS.Tag>) => {
    addTags(paths, tags);
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

    if (description && fSystemEntry.isFile) {
      description = ' | ' + description;
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

  const entrySizeFormatted = fSystemEntry.isFile
    ? formatFileSize(fSystemEntry.size) + ' | '
    : '';

  const entryLMDTFormatted =
    fSystemEntry.isFile &&
    fSystemEntry.lmdt &&
    formatDateTime(fSystemEntry.lmdt, true);

  let tagTitles = '';
  if (entryTags) {
    entryTags.map((tag) => {
      tagTitles += tag.title + ', ';
      return true;
    });
  }
  tagTitles = tagTitles.substring(0, tagTitles.length - 2);
  const tagPlaceholder = <TagsPreview tags={entryTags} />;

  function urlGetDelim(url) {
    return url.indexOf('?') > 0 ? '&' : '?';
  }

  const entryPath = fSystemEntry.path;

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

  function generateExtension() {
    return selectionMode ? (
      <IconButton
        style={{
          width: 35,
          height: 35,
          padding: 4,
          paddingBottom: 2,
          alignSelf: 'center',
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
              backgroundColor: '#d7d7d7',
            }}
          />
        ) : (
          <UnSelectedIcon
            style={{
              borderRadius: 15,
              backgroundColor: 'd7d7d7',
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
            alignSelf: 'center',
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

  const entryHeight = calculateEntryHeight(entrySize);
  const isSmall = entrySize === 'tiny'; // || entrySize === 'small';

  const backgroundColor = selected
    ? theme.palette.primary.light
    : fileSystemEntryBgColor;

  return (
    <RowPaper
      elevation={2}
      data-entry-id={fSystemEntry.uuid}
      className={classNames(
        classes.rowCell,
        selected && classes.selectedRowCell,
      )}
      style={{
        minHeight: entryHeight,
        marginBottom: isLast ? 40 : 'auto',
        backgroundColor: theme.palette.background.default,
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
      <Grid
        container
        wrap="nowrap"
        className={classes.rowHover}
        sx={{ backgroundColor, borderRadius: '4px' }}
      >
        <Grid
          item
          style={{
            minHeight: entryHeight,
            width: 45,
            height: 30,
            padding: 3,
            marginRight: 5,
            textAlign: 'left',
            display: 'flex',
            alignSelf: 'center',
          }}
        >
          {generateExtension()}
        </Grid>
        {isSmall ? (
          <Grid
            item
            xs
            zeroMinWidth
            style={{
              display: 'flex',
            }}
          >
            <Typography
              variant="body2"
              style={{
                overflowX: 'clip',
                textWrap: 'nowrap',
                alignSelf: 'center',
              }}
              title={
                fSystemEntry.name +
                ' | ' +
                entrySizeFormatted +
                formatDateTime(fSystemEntry.lmdt, true)
              }
            >
              <>{entryTitle}</>
              &nbsp;
              {showTags && entryTags ? renderTags : tagPlaceholder}
            </Typography>
          </Grid>
        ) : (
          <Grid item xs zeroMinWidth style={{ alignSelf: 'center' }}>
            <Typography
              variant="body1"
              title={fSystemEntry.name}
              style={{ wordBreak: 'break-all' }}
            >
              {entryTitle}
            </Typography>
            <Typography
              data-tid="gridCellDescription"
              style={{
                color: 'gray',
              }}
              variant="body2"
            >
              <Tooltip title={fSystemEntry.size + ' ' + t('core:sizeInBytes')}>
                {entrySizeFormatted}
              </Tooltip>
              <Tooltip
                title={
                  t('core:modifiedDate') +
                  ': ' +
                  formatDateTime(fSystemEntry.lmdt, true)
                }
              >
                <span>{entryLMDTFormatted}</span>
              </Tooltip>
              <span>{description}</span>
            </Typography>
            {showTags && entryTags ? renderTags : tagPlaceholder}
          </Grid>
        )}
        {fSystemEntry.thumbPath && (
          <Grid
            item
            style={{
              display: 'flex',
              width: entryHeight,
              alignItems: 'center',
            }}
          >
            <img
              alt="thumbnail"
              src={
                fSystemEntry.thumbPath +
                (lastThumbnailImageChange &&
                lastThumbnailImageChange.thumbPath === fSystemEntry.thumbPath &&
                !PlatformIO.haveObjectStoreSupport() &&
                !PlatformIO.haveWebDavSupport()
                  ? urlGetDelim(fSystemEntry.thumbPath) +
                    lastThumbnailImageChange.dt
                  : '')
              }
              // @ts-ignore
              onError={(i) => (i.target.style.display = 'none')}
              loading="lazy"
              style={{
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                // borderRadius: 5,
                // backgroundColor: 'red',
                objectFit: thumbnailMode,
                height: entryHeight - 5,
                width: entryHeight - 5,
              }}
            />
          </Grid>
        )}
      </Grid>
    </RowPaper>
  );
}

export default RowCell;
