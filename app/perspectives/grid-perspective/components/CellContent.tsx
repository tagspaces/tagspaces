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
import removeMd from 'remove-markdown';
import classNames from 'classnames';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import FolderIcon from '@material-ui/icons/Folder';
import SelectedIcon from '@material-ui/icons/CheckBox';
import UnSelectedIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import TagIcon from '@material-ui/icons/LocalOfferOutlined';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { formatFileSize, formatDateTime } from '-/utils/misc';
import { extractTagsAsObjects, extractTitle } from '-/utils/paths';
import { findColorForFileEntry } from '-/services/utils-io';
import TagContainerDnd from '-/components/TagContainerDnd';
import TagContainer from '-/components/TagContainer';
import i18n from '-/services/i18n';
import PlatformIO from '-/services/platform-io';
import { AppConfig } from '-/config';
import EntryIcon from '-/components/EntryIcon';
import { TS } from '-/tagspaces.namespace';
import TaggingActions from '-/reducers/tagging-actions';

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
}

const CellContent = (props: Props) => {
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
  const fsEntryBackgroundColor = fsEntry.color; //  ? fsEntry.color : 'transparent';
  const entryTitle = extractTitle(
    fsEntry.name,
    !fsEntry.isFile,
    PlatformIO.getDirSeparator()
  );

  let description = removeMd(fsEntry.description);

  if (description.length > maxDescriptionPreviewLength) {
    description = description.substr(0, maxDescriptionPreviewLength) + '...';
  }

  if (description && layoutType === 'row' && fsEntry.isFile) {
    description = ' | ' + description;
  }

  const fsEntryColor = findColorForFileEntry(
    fsEntry.extension,
    fsEntry.isFile,
    supportedFileTypes
  );

  const fileNameTags = extractTagsAsObjects(
    fsEntry.name,
    AppConfig.tagDelimiter,
    PlatformIO.getDirSeparator()
  );

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
  const tagPlaceholder =
    tagTitles.length > 0 ? (
      <IconButton title={tagTitles} onClick={() => openFsEntry(fsEntry)}>
        <TagIcon />
      </IconButton>
    ) : null;

  function renderGridCell() {
    return (
      <div
        style={{
          backgroundColor: fsEntryBackgroundColor,
          opacity: fsEntry.isIgnored ? 0.3 : 1
        }}
      >
        <div
          className={classes.gridCellThumb}
          title={fsEntry.isIgnored && i18n.t('core:ignoredFolder')}
          style={{
            position: 'relative',
            height: 150
          }}
        >
          {fsEntry.thumbPath ? (
            <img
              alt="thumbnail"
              className={classes.gridCellThumb}
              src={fsEntry.thumbPath}
              // @ts-ignore
              onError={i => (i.target.style.display = 'none')}
              // @ts-ignore
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
          {description.length > 0 && (
            <Typography
              id="gridCellDescription"
              className={classes.gridCellDescription}
              title={i18n.t('core:filePropertiesDescription')}
              variant="caption"
            >
              {description}
            </Typography>
          )}
        </div>
        <Typography
          className={classes.gridCellTitle}
          data-tid={'fsEntryName_' + fsEntry.name}
          title={fsEntry.path}
          noWrap={true}
          variant="body1"
        >
          {entryTitle}
        </Typography>
        <div className={classes.gridDetails}>
          <Typography
            className={classes.gridFileExtension}
            style={{
              backgroundColor: fsEntryColor,
              maxWidth: fsEntry.isFile ? 50 : 100
            }}
            noWrap={true}
            variant="button"
            title={fsEntry.path}
          >
            {fsEntry.isFile ? fsEntry.extension : i18n.t('core:folder')}
          </Typography>
          {fsEntry.isFile && fsEntry.lmdt && (
            <Typography className={classes.gridSizeDate} variant="caption">
              <span
                title={
                  i18n.t('core:modifiedDate') +
                  ': ' +
                  formatDateTime(fsEntry.lmdt, true)
                }
              >
                {formatDateTime(fsEntry.lmdt, false)}
              </span>
              <span title={fsEntry.size + ' ' + i18n.t('core:sizeInBytes')}>
                {' | ' + formatFileSize(fsEntry.size)}
              </span>
            </Typography>
          )}
        </div>
      </div>
    );
  }

  function renderRowCell(selected: boolean) {
    let tmbSize = 85;
    if (entrySize === 'small') {
      tmbSize = 30;
    } else if (entrySize === 'normal') {
      tmbSize = 70;
    } else if (entrySize === 'big') {
      tmbSize = 100;
    }
    return (
      <Grid
        container
        wrap="nowrap"
        className={classes.rowHover}
        title={fsEntry.isIgnored && i18n.t('core:ignoredFolder')}
        style={{
          opacity: fsEntry.isIgnored ? 0.3 : 1,
          backgroundColor: selected
            ? theme.palette.primary.light
            : theme.palette.background.default
        }}
      >
        <Grid
          item
          style={{
            minHeight: entryHeight,
            width: 50,
            maxWidth: 50,
            padding: 3,
            marginRight: 5,
            textAlign: 'left',
            display: 'flex'
          }}
        >
          <div
            data-tid="rowCellTID"
            className={classes.rowFileExtension}
            role="presentation"
            title={fsEntry.path}
            onClick={e => {
              e.stopPropagation();
              if (selected) {
                deselectEntry(fsEntry);
              } else {
                selectEntry(fsEntry);
              }
            }}
            style={{
              backgroundColor: fsEntryColor
            }}
          >
            {fsEntry.isFile ? fsEntry.extension : <FolderIcon />}
            {entrySize !== 'small' &&
              (selected ? (
                <SelectedIcon style={{ paddingTop: 5 }} />
              ) : (
                <UnSelectedIcon style={{ paddingTop: 5 }} />
              ))}
          </div>
        </Grid>
        {entrySize === 'small' ? (
          <Grid
            item
            xs
            zeroMinWidth
            style={{
              display: 'flex'
            }}
          >
            <Typography style={{ wordBreak: 'break-all', alignSelf: 'center' }}>
              {entryTitle}
              &nbsp;
              {showTags && entryTags ? renderTags(entryTags) : tagPlaceholder}
            </Typography>
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
              <span title={fsEntry.size + ' ' + i18n.t('core:sizeInBytes')}>
                {fsEntry.isFile && formatFileSize(fsEntry.size) + ' - '}
              </span>
              <span
                title={
                  i18n.t('core:modifiedDate') +
                  ': ' +
                  formatDateTime(fsEntry.lmdt, true)
                }
              >
                {fsEntry.isFile &&
                  fsEntry.lmdt &&
                  formatDateTime(fsEntry.lmdt, false)}
              </span>
              <span title={i18n.t('core:entryDescription')}>{description}</span>
            </Typography>
          </Grid>
        )}
        {fsEntry.thumbPath && (
          <Grid item style={{ display: 'flex', alignItems: 'center' }}>
            <img
              alt="thumbnail"
              className={classes.gridCellThumb}
              src={fsEntry.thumbPath}
              // @ts-ignore
              onError={i => (i.target.style.display = 'none')}
              // @ts-ignore
              loading="lazy"
              style={{
                objectFit: thumbnailMode,
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
      onClick={event =>
        AppConfig.isCordovaiOS // TODO DoubleClick not fired in Cordova IOS
          ? handleGridCellDblClick(event, fsEntry)
          : handleGridCellClick(event, fsEntry)
      }
    >
      {gridCell}
    </Paper>
  );
};

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(
    {
      editTagForEntry: TaggingActions.editTagForEntry
    },
    dispatch
  );
}

export default connect(undefined, mapActionCreatorsToProps)(CellContent);
