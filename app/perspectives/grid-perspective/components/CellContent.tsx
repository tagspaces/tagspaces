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

import React from 'react';
import classNames from 'classnames';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Tooltip from '-/components/Tooltip';
import FolderIcon from '@mui/icons-material/Folder';
import SelectedIcon from '@mui/icons-material/CheckBox';
import UnSelectedIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  formatFileSize,
  formatDateTime
} from '@tagspaces/tagspaces-platforms/misc';
import {
  extractTagsAsObjects,
  extractTitle
} from '@tagspaces/tagspaces-platforms/paths';
import AppConfig from '@tagspaces/tagspaces-platforms/AppConfig';
import {
  findBackgroundColorForFolder,
  findColorForEntry,
  removeMarkDown
} from '-/services/utils-io';
import TagContainerDnd from '-/components/TagContainerDnd';
import TagContainer from '-/components/TagContainer';
import TagsPreview from '-/components/TagsPreview';
import i18n from '-/services/i18n';
import PlatformIO from '-/services/platform-facade';
import EntryIcon from '-/components/EntryIcon';
import { TS } from '-/tagspaces.namespace';
import TaggingActions from '-/reducers/tagging-actions';
import { getLastThumbnailImageChange } from '-/reducers/app';
// import { getTagColor } from '-/reducers/settings';

const maxDescriptionPreviewLength = 100;

interface Props {
  selected: boolean;
  isLast?: boolean;
  fsEntry: TS.FileSystemEntry;
  entrySize: string;
  classes: any;
  style?: any;
  theme: any;
  supportedFileTypes: Array<Object>;
  thumbnailMode: any;
  addTags: () => void;
  addTag: (tag: TS.Tag, parentTagGroupUuid: TS.Uuid) => void;
  openFsEntry: (fsEntry: TS.FileSystemEntry) => void;
  selectedEntries: Array<TS.FileSystemEntry>;
  selectEntry: (fsEntry: TS.FileSystemEntry) => void;
  deselectEntry: (fsEntry: TS.FileSystemEntry) => void;
  isReadOnlyMode: boolean;
  showTags: boolean;
  handleTagMenu: (event: Object, tag: TS.Tag, entryPath: string) => void;
  layoutType: string;
  handleGridContextMenu: (event: Object, fsEntry: TS.FileSystemEntry) => void;
  handleGridCellDblClick: (event: Object, fsEntry: TS.FileSystemEntry) => void;
  handleGridCellClick: (event: Object, fsEntry: TS.FileSystemEntry) => void;
  editTagForEntry?: (path: string, tag: TS.Tag) => void;
  reorderTags: boolean;
  lastThumbnailImageChange: number;
}

function CellContent(props: Props) {
  const {
    selected,
    fsEntry,
    entrySize,
    classes,
    theme,
    supportedFileTypes,
    thumbnailMode,
    addTags,
    addTag,
    selectedEntries,
    isReadOnlyMode,
    handleTagMenu,
    layoutType,
    handleGridContextMenu,
    handleGridCellDblClick,
    handleGridCellClick,
    showTags,
    openFsEntry,
    selectEntry,
    deselectEntry,
    isLast
  } = props;
  const entryTitle = extractTitle(
    fsEntry.name,
    !fsEntry.isFile,
    PlatformIO.getDirSeparator()
  );

  let { description } = fsEntry;

  description = removeMarkDown(description);
  if (description && description.length > maxDescriptionPreviewLength) {
    description = description.substring(0, maxDescriptionPreviewLength) + '...';
  }

  if (description && layoutType === 'row' && fsEntry.isFile) {
    description = ' | ' + description;
  }

  const fsEntryColor = findColorForEntry(fsEntry, supportedFileTypes);
  const fsEntryBgColor = findBackgroundColorForFolder(fsEntry);

  let fileNameTags = [];
  if (fsEntry.isFile) {
    fileNameTags = extractTagsAsObjects(
      fsEntry.name,
      AppConfig.tagDelimiter,
      PlatformIO.getDirSeparator()
    );
  }

  const fsEntryTags = fsEntry.tags ? fsEntry.tags : [];
  const sideCarTagsTitles = fsEntryTags.map(tag => tag.title);
  const entryTags = [
    ...fsEntryTags,
    ...fileNameTags.filter(tag => !sideCarTagsTitles.includes(tag.title))
  ];

  let tagTitles = '';
  if (entryTags) {
    entryTags.map(tag => {
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
        style={{
          background: fsEntryBgColor,
          borderRadius: 5
          // opacity: fsEntry.isIgnored ? 0.3 : 1
        }}
      >
        <div
          className={classes.gridCellThumb}
          style={{
            position: 'relative',
            height: 150
          }}
        >
          {fsEntry.thumbPath ? (
            <img
              alt="thumbnail"
              className={classes.gridCellThumb}
              src={
                fsEntry.thumbPath +
                (props.lastThumbnailImageChange &&
                !PlatformIO.haveObjectStoreSupport() &&
                !PlatformIO.haveWebDavSupport()
                  ? urlGetDelim(fsEntry.thumbPath) +
                    props.lastThumbnailImageChange
                  : '')
              }
              // @ts-ignore
              onError={i => (i.target.style.display = 'none')}
              loading="lazy"
              style={{
                objectFit: thumbnailMode,
                position: 'absolute',
                width: '100%',
                height: 150
              }}
            />
          ) : (
            <EntryIcon isFile={fsEntry.isFile} />
          )}
          <div id="gridCellTags" className={classes.gridCellTags}>
            {showTags && entryTags ? renderTags(entryTags) : tagPlaceholder}
          </div>
          {description && (
            <Tooltip title={i18n.t('core:entryDescription')}>
              <Typography
                id="gridCellDescription"
                className={classes.gridCellDescription}
                variant="caption"
              >
                {description}
              </Typography>
            </Tooltip>
          )}
        </div>
        <Tooltip title={fsEntry.path}>
          <Typography
            className={classes.gridCellTitle}
            data-tid={'fsEntryName_' + fsEntry.name}
            noWrap={true}
            variant="body1"
          >
            {entryTitle}
          </Typography>
        </Tooltip>
        <div className={classes.gridDetails}>
          <Tooltip title={fsEntry.path}>
            <Typography
              className={classes.gridFileExtension}
              style={{
                backgroundColor: fsEntryColor,
                textShadow: '1px 1px #8f8f8f',
                maxWidth: fsEntry.isFile ? 50 : 100
              }}
              noWrap={true}
              variant="button"
            >
              {fsEntry.isFile ? fsEntry.extension : i18n.t('core:folder')}
            </Typography>
          </Tooltip>
          {fsEntry.isFile && fsEntry.lmdt && (
            <Typography className={classes.gridSizeDate} variant="caption">
              <Tooltip
                title={
                  i18n.t('core:modifiedDate') +
                  ': ' +
                  formatDateTime(fsEntry.lmdt, true)
                }
              >
                <span>{formatDateTime(fsEntry.lmdt, false)}</span>
              </Tooltip>
              <Tooltip title={fsEntry.size + ' ' + i18n.t('core:sizeInBytes')}>
                <span>{' | ' + formatFileSize(fsEntry.size)}</span>
              </Tooltip>
            </Typography>
          )}
        </div>
      </div>
    );
  }

  function renderRowCell(selected: boolean) {
    const isSmall = entrySize === 'small';
    let tmbSize = 85;
    if (isSmall) {
      tmbSize = 30;
    } else if (entrySize === 'normal') {
      tmbSize = 70;
    } else if (entrySize === 'big') {
      tmbSize = 100;
    }
    const backgroundColor = selected
      ? theme.palette.primary.light
      : fsEntryBgColor;

    const entrySizeFormatted =
      fsEntry.isFile && formatFileSize(fsEntry.size) + ' - ';
    const entryLMDTFormatted =
      fsEntry.isFile && fsEntry.lmdt && formatDateTime(fsEntry.lmdt, true);

    return (
      <Grid
        container
        wrap="nowrap"
        className={classes.rowHover}
        style={{
          // opacity: fsEntry.isIgnored ? 0.3 : 1,
          backgroundColor,
          borderRadius: 5
        }}
      >
        <Grid
          item
          style={{
            minHeight: entryHeight,
            width: isSmall ? 80 : 60,
            padding: 3,
            marginRight: 5,
            textAlign: 'left',
            display: 'flex'
          }}
        >
          <Tooltip title={fsEntry.path}>
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
                backgroundColor: fsEntryColor,
                // alignSelf: isSmall ? 'center' : 'auto',
                alignItems: 'center'
              }}
              role="presentation"
              onClick={e => {
                e.stopPropagation();
                if (selected) {
                  deselectEntry(fsEntry);
                } else {
                  selectEntry(fsEntry);
                }
              }}
            >
              {selected ? <SelectedIcon /> : <UnSelectedIcon />}
              {fsEntry.isFile ? (
                <span style={{ marginTop: isSmall ? 0 : 10 }}>
                  {fsEntry.extension}
                </span>
              ) : (
                <FolderIcon />
              )}
            </div>
          </Tooltip>
        </Grid>
        {isSmall ? (
          <Grid
            item
            xs
            zeroMinWidth
            style={{
              display: 'flex'
            }}
          >
            <Tooltip
              title={
                fsEntry.isFile ? entrySizeFormatted + entryLMDTFormatted : ''
              }
            >
              <Typography
                style={{ wordBreak: 'break-all', alignSelf: 'center' }}
              >
                {entryTitle}
                &nbsp;
                {showTags && entryTags ? renderTags(entryTags) : tagPlaceholder}
              </Typography>
            </Tooltip>
          </Grid>
        ) : (
          <Grid item xs zeroMinWidth>
            <Typography style={{ wordBreak: 'break-all' }}>
              {entryTitle}
            </Typography>
            {showTags && entryTags ? renderTags(entryTags) : tagPlaceholder}
            <Typography
              style={{
                color: 'gray'
              }}
              variant="body2"
            >
              <Tooltip title={fsEntry.size + ' ' + i18n.t('core:sizeInBytes')}>
                <span>{entrySizeFormatted}</span>
              </Tooltip>
              <Tooltip
                title={
                  i18n.t('core:modifiedDate') +
                  ': ' +
                  formatDateTime(fsEntry.lmdt, true)
                }
              >
                <span>{entryLMDTFormatted}</span>
              </Tooltip>
              <Tooltip title={i18n.t('core:entryDescription')}>
                <span>{description}</span>
              </Tooltip>
            </Typography>
          </Grid>
        )}
        {fsEntry.thumbPath && (
          <Grid item style={{ display: 'flex', alignItems: 'center' }}>
            <img
              alt="thumbnail"
              className={classes.gridCellThumb}
              src={
                fsEntry.thumbPath +
                (props.lastThumbnailImageChange &&
                !PlatformIO.haveObjectStoreSupport() &&
                !PlatformIO.haveWebDavSupport()
                  ? urlGetDelim(fsEntry.thumbPath) +
                    props.lastThumbnailImageChange
                  : '')
              }
              // @ts-ignore
              onError={i => (i.target.style.display = 'none')}
              loading="lazy"
              style={{
                objectFit: thumbnailMode,
                paddingRight: 4,
                paddingTop: 4,
                height: tmbSize,
                width: tmbSize
              }}
            />
          </Grid>
        )}
      </Grid>
    );
  }

  function renderTags(tags: Array<TS.Tag>) {
    let sideCarLength = 0;
    return tags.map((tag: TS.Tag, index) => {
      const tagContainer = isReadOnlyMode ? (
        <TagContainer
          tag={tag}
          key={fsEntry.path + tag.title}
          entryPath={fsEntry.path}
          addTags={addTags}
          handleTagMenu={handleTagMenu}
          selectedEntries={selectedEntries}
        />
      ) : (
        <TagContainerDnd
          tag={tag}
          index={tag.type === 'sidecar' ? index : index - sideCarLength}
          key={fsEntry.path + tag.title}
          entryPath={fsEntry.path}
          addTags={addTags}
          addTag={addTag}
          handleTagMenu={handleTagMenu}
          selectedEntries={selectedEntries}
          editTagForEntry={props.editTagForEntry}
          reorderTags={props.reorderTags}
        />
      );

      if (tag.type === 'sidecar') {
        sideCarLength = index + 1;
      }
      return tagContainer;
    });
  }

  let entryHeight = 130;
  if (entrySize === 'small') {
    entryHeight = 35;
  } else if (entrySize === 'normal') {
    entryHeight = 70;
  } else if (entrySize === 'big') {
    entryHeight = 100;
  }

  let gridCell: any = React.Fragment;
  if (layoutType === 'grid') {
    gridCell = renderGridCell();
  } else if (layoutType === 'row') {
    gridCell = renderRowCell(selected);
  }

  return (
    <Paper
      elevation={2}
      data-entry-id={fsEntry.uuid}
      className={classNames(
        layoutType === 'grid' && classes.gridCell,
        layoutType === 'row' && classes.rowCell,
        selected && layoutType === 'grid' && classes.selectedGridCell,
        selected && layoutType === 'row' && classes.selectedRowCell
      )}
      style={{
        minHeight: layoutType === 'row' ? entryHeight : 'auto',
        marginBottom: isLast ? 40 : 'auto',
        backgroundColor: theme.palette.background.default
      }}
      onContextMenu={event => handleGridContextMenu(event, fsEntry)}
      onDoubleClick={event => handleGridCellDblClick(event, fsEntry)}
      onClick={event => {
        event.stopPropagation();
        AppConfig.isCordovaiOS // TODO DoubleClick not fired in Cordova IOS
          ? handleGridCellDblClick(event, fsEntry)
          : handleGridCellClick(event, fsEntry);
      }}
    >
      {gridCell}
    </Paper>
  );
}

function mapStateToProps(state) {
  return {
    reorderTags: state.settings.reorderTags,
    lastThumbnailImageChange: getLastThumbnailImageChange(state)
  };
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(
    {
      editTagForEntry: TaggingActions.editTagForEntry
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapActionCreatorsToProps)(CellContent);
