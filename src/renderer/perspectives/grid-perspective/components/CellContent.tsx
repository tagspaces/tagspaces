/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces UG (haftungsbeschraenkt)
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
import { useTheme } from '@mui/material/styles';
import classNames from 'classnames';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Tooltip from '-/components/Tooltip';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import IconButton from '@mui/material/IconButton';
import { SelectedIcon, UnSelectedIcon } from '-/components/CommonIcons';
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
import { FolderIcon } from '-/components/CommonIcons';
import { dataTidFormat } from '-/services/test';
import {
  getSupportedFileTypes,
  isDesktopMode,
  isReorderTags,
} from '-/reducers/settings';
import {
  classes,
  GridStyles,
} from '-/perspectives/grid-perspective/components/styles.css';
import { useTranslation } from 'react-i18next';
import { useTaggingActionsContext } from '-/hooks/useTaggingActionsContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';

const maxDescriptionPreviewLength = 100;

interface Props {
  selected: boolean;
  isLast?: boolean;
  fsEntry: TS.FileSystemEntry;
  entrySize: string;
  style?: any;
  thumbnailMode: any;
  selectEntry: (fsEntry: TS.FileSystemEntry) => void;
  deselectEntry: (fsEntry: TS.FileSystemEntry) => void;
  showTags: boolean;
  handleTagMenu: (event: Object, tag: TS.Tag, entryPath: string) => void;
  layoutType: string;
  handleGridContextMenu: (event: Object, fsEntry: TS.FileSystemEntry) => void;
  handleGridCellDblClick: (event: Object, fsEntry: TS.FileSystemEntry) => void;
  handleGridCellClick: (event: Object, fsEntry: TS.FileSystemEntry) => void;
  showEntriesDescription?: boolean;
}

function CellContent(props: Props) {
  const {
    selected,
    fsEntry,
    entrySize,
    thumbnailMode,
    handleTagMenu,
    layoutType,
    handleGridContextMenu,
    handleGridCellDblClick,
    handleGridCellClick,
    showEntriesDescription,
    showTags,
    selectEntry,
    deselectEntry,
    isLast,
  } = props;

  const { t } = useTranslation();
  const theme = useTheme();
  const { selectedEntries } = useSelectedEntriesContext();
  const { addTags, editTagForEntry } = useTaggingActionsContext();
  const { readOnlyMode } = useCurrentLocationContext();
  const supportedFileTypes = useSelector(getSupportedFileTypes);
  const reorderTags: boolean = useSelector(isReorderTags);
  const lastThumbnailImageChange = useSelector(getLastThumbnailImageChange);
  const desktopMode = useSelector(isDesktopMode);

  const dispatch: AppDispatch = useDispatch();

  // You can use the dispatch function to dispatch actions
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
    if (description && description.length > maxDescriptionPreviewLength) {
      description = getDescriptionPreview(
        description,
        maxDescriptionPreviewLength,
      );
    }

    if (description && layoutType === 'row' && fSystemEntry.isFile) {
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

  const entrySizeFormatted =
    fSystemEntry.isFile && formatFileSize(fSystemEntry.size) + ' | ';
  const entryLMDTFormatted =
    fSystemEntry.isFile &&
    fSystemEntry.lmdt &&
    formatDateTime(fSystemEntry.lmdt, true);

  let tmbSize = 85;
  const isSmall = entrySize === 'small';
  if (isSmall) {
    tmbSize = 30;
  } else if (entrySize === 'normal') {
    tmbSize = 70;
  } else if (entrySize === 'big') {
    tmbSize = 100;
  }

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

  function renderGridCell() {
    return (
      <div
        data-tid={'fsEntryName_' + dataTidFormat(fSystemEntry.name)}
        style={{
          background: fileSystemEntryBgColor,
          borderRadius: 5,
          // opacity: fileSystemEntry.isIgnored ? 0.3 : 1
        }}
      >
        <div
          className={classes.gridCellThumb}
          style={{
            position: 'relative',
            height: 150,
          }}
        >
          {fSystemEntry.thumbPath ? (
            <img
              alt="thumbnail"
              className={classes.gridCellThumb}
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
                objectFit: thumbnailMode,
                position: 'absolute',
                width: '100%',
                height: 150,
              }}
            />
          ) : (
            <EntryIcon
              isFile={fSystemEntry.isFile}
              fileExtension={fSystemEntry.extension}
            />
          )}
          <div id="gridCellTags" className={classes.gridCellTags}>
            <IconButton
              style={{
                opacity: selected ? 1 : 0.5,
                padding: desktopMode ? 5 : 8,
              }}
              onMouseLeave={(e) => {
                //@ts-ignore
                e.target.style.opacity = selected ? 1 : 0.5;
              }}
              onMouseOver={(e) => {
                //@ts-ignore
                e.target.style.opacity = 1;
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (selected) {
                  deselectEntry(fSystemEntry);
                } else {
                  selectEntry(fSystemEntry);
                }
              }}
            >
              {selected ? (
                <SelectedIcon
                  style={{
                    opacity: 1,
                    borderRadius: 15,
                    backgroundColor: '#d7d7d7',
                  }}
                />
              ) : (
                <UnSelectedIcon
                  style={{
                    opacity: 0.7,
                    borderRadius: 15,
                    backgroundColor: 'd7d7d7',
                  }}
                />
              )}
            </IconButton>
            {showTags && entryTags ? renderTags : tagPlaceholder}
          </div>
          {description && (
            <Tooltip title={t('core:entryDescription')}>
              <Typography
                data-tid="gridCellDescription"
                className={classes.gridCellDescription}
                variant="caption"
              >
                {description}
              </Typography>
            </Tooltip>
          )}
        </div>
        <Typography className={classes.gridCellTitle} variant="body1">
          {entryTitle}
        </Typography>
        <div className={classes.gridDetails}>
          <Tooltip title={fSystemEntry.path}>
            <Typography
              className={classes.gridFileExtension}
              style={{
                backgroundColor: fileSystemEntryColor,
                textShadow: '1px 1px #8f8f8f',
                textOverflow: 'unset',
                maxWidth: fSystemEntry.isFile ? 50 : 100,
              }}
              noWrap={true}
              variant="button"
            >
              {fSystemEntry.isFile ? (
                fSystemEntry.extension
              ) : (
                <FolderOpenIcon />
              )}
            </Typography>
          </Tooltip>
          {fSystemEntry.isFile && fSystemEntry.lmdt && (
            <Typography className={classes.gridSizeDate} variant="caption">
              <Tooltip
                title={
                  t('core:modifiedDate') +
                  ': ' +
                  formatDateTime(fSystemEntry.lmdt, true)
                }
              >
                <span>{formatDateTime(fSystemEntry.lmdt, false)}</span>
              </Tooltip>
              <Tooltip title={fSystemEntry.size + ' ' + t('core:sizeInBytes')}>
                <span>{' | ' + formatFileSize(fSystemEntry.size)}</span>
              </Tooltip>
            </Typography>
          )}
        </div>
      </div>
    );
  }

  function renderRowCell() {
    const backgroundColor = selected
      ? theme.palette.primary.light
      : fileSystemEntryBgColor;

    return (
      <Grid
        container
        wrap="nowrap"
        className={classes.rowHover}
        sx={{ backgroundColor }}
      >
        <Grid
          item
          style={{
            minHeight: entryHeight,
            width: isSmall ? 80 : 60,
            padding: 3,
            marginRight: 5,
            textAlign: 'left',
            display: 'flex',
          }}
        >
          <div
            data-tid="rowCellTID"
            style={{
              display: 'flex',
              flexDirection: isSmall ? 'row' : 'column',
              flex: 1,
              padding: 4,
              borderWidth: 1,
              color: 'white',
              textTransform: 'uppercase',
              fontSize: 12,
              fontWeight: 'bold',
              borderRadius: 4,
              textAlign: 'center',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              backgroundColor: fileSystemEntryColor,
              alignItems: 'center',
            }}
            role="button"
            onClick={(e) => {
              e.stopPropagation();
              if (selected) {
                deselectEntry(fSystemEntry);
              } else {
                selectEntry(fSystemEntry);
              }
            }}
          >
            {selected ? <SelectedIcon /> : <UnSelectedIcon />}
            {fSystemEntry.isFile ? (
              <span
                style={{
                  width: '100%',
                  marginTop: isSmall ? 0 : 10,
                  textShadow: '1px 1px #8f8f8f',
                  overflowWrap: 'anywhere',
                }}
              >
                {fSystemEntry.extension}
              </span>
            ) : (
              <FolderIcon style={{ margin: '0 auto' }} />
            )}
          </div>
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
            <Typography style={{ wordBreak: 'break-all', alignSelf: 'center' }}>
              <Tooltip title={fSystemEntry.path}>
                <>{entryTitle}</>
              </Tooltip>
              &nbsp;
              {showTags && entryTags ? renderTags : tagPlaceholder}
            </Typography>
          </Grid>
        ) : (
          <Grid item xs zeroMinWidth>
            <Tooltip title={fSystemEntry.path}>
              <Typography style={{ wordBreak: 'break-all' }}>
                {entryTitle}
              </Typography>
            </Tooltip>
            {showTags && entryTags ? renderTags : tagPlaceholder}
            <Typography
              style={{
                color: 'gray',
              }}
              variant="body2"
            >
              <Tooltip title={fSystemEntry.size + ' ' + t('core:sizeInBytes')}>
                <span>{entrySizeFormatted}</span>
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
              {/* <Tooltip title={t('core:entryDescription')}> */}
              <span>{description}</span>
              {/* </Tooltip> */}
            </Typography>
          </Grid>
        )}
        {fSystemEntry.thumbPath && (
          <Grid item style={{ display: 'flex', alignItems: 'center' }}>
            <img
              alt="thumbnail"
              className={classes.gridCellThumb}
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
                objectFit: thumbnailMode,
                paddingRight: 4,
                paddingTop: 4,
                height: tmbSize,
                width: tmbSize,
              }}
            />
          </Grid>
        )}
      </Grid>
    );
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

  let entryHeight = 130;
  if (entrySize === 'small') {
    entryHeight = 35;
  } else if (entrySize === 'normal') {
    entryHeight = 70;
  } else if (entrySize === 'big') {
    entryHeight = 100;
  }

  return (
    <GridStyles>
      <Paper
        elevation={2}
        data-entry-id={fSystemEntry.uuid}
        className={classNames(
          layoutType === 'grid' && classes.gridCell,
          layoutType === 'row' && classes.rowCell,
          selected && layoutType === 'grid' && classes.selectedGridCell,
          selected && layoutType === 'row' && classes.selectedRowCell,
        )}
        style={{
          minHeight: layoutType === 'row' ? entryHeight : 'auto',
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
        {layoutType === 'grid' && renderGridCell()}
        {layoutType === 'row' && renderRowCell()}
      </Paper>
    </GridStyles>
  );
}

export default CellContent;
