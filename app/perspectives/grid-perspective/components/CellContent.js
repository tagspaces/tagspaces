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
 * @flow
 */

import React from 'react';
import formatDistance from 'date-fns/formatDistance';
import removeMd from 'remove-markdown';
import classNames from 'classnames';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import FolderIcon from '@material-ui/icons/FolderOpen';
import {
  formatFileSize,
  formatDateTime,
} from '../../../utils/misc';
import { extractTitle } from '../../../utils/paths';
import {
  type FileSystemEntry,
  findColorForFileEntry
} from '../../../services/utils-io';
import TagContainerDnd from '../../../components/TagContainerDnd';
import TagContainer from '../../../components/TagContainer';
import AppConfig from '../../../config';
import i18n from '../../../services/i18n';
import { type Tag } from '../../../reducers/taglibrary';

const maxDescriptionPreviewLength = 100;

type Props = {
  selected: boolean,
  fsEntry: FileSystemEntry,
  entrySize: string,
  classes: Object,
  theme: Object,
  supportedFileTypes: Array<Object>,
  thumbnailMode: any,
  addTags: () => void,
  selectedEntries: Array<Object>,
  isReadOnlyMode: boolean,
  handleTagMenu: (event: Object, tag: Tag, entryPath: string) => void,
  layoutType: string,
  handleGridContextMenu: () => void,
  handleGridCellDblClick: () => void,
  handleGridCellClick: () => void
};

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
    selectedEntries,
    isReadOnlyMode,
    handleTagMenu,
    layoutType,
    handleGridContextMenu,
    handleGridCellDblClick,
    handleGridCellClick
  } = props;
  const fsEntryBackgroundColor = fsEntry.color ? fsEntry.color : 'transparent';

  let description = removeMd(fsEntry.description);
  if (description.length > maxDescriptionPreviewLength) {
    description = description.substr(0, maxDescriptionPreviewLength) + '...';
  }

  const fsEntryColor = findColorForFileEntry(
    fsEntry.extension,
    fsEntry.isFile,
    supportedFileTypes
  );

  let thumbPathUrl = fsEntry.thumbPath
    ? 'url("' + fsEntry.thumbPath + '")'
    : '';
  if (AppConfig.isWin) {
    thumbPathUrl = thumbPathUrl.split('\\').join('\\\\');
  }


  function renderGridCell() {
    return (
      <div style={{
        backgroundColor: fsEntryBackgroundColor
      }}
      >
        <div
          className={classes.gridCellThumb}
          style={{
            backgroundSize: thumbnailMode,
            backgroundImage: thumbPathUrl,
            height: 150 // fsEntry.isFile ? 150 : 70
          }}
        >
          <div id="gridCellTags" className={classes.gridCellTags}>
            {
              fsEntry.tags.map(tag => renderTag(tag))
            }
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
          data-tid="fsEntryName"
          title={fsEntry.path}
          noWrap={true}
          variant="body1"
        >
          {extractTitle(fsEntry.name, !fsEntry.isFile)}
        </Typography>
        {fsEntry.isFile ? (
          <div className={classes.gridDetails}>
            <Typography
              className={classes.gridFileExtension}
              style={{ backgroundColor: fsEntryColor }}
              noWrap={true}
              variant="button"
              title={fsEntry.path}
            >
              {fsEntry.extension}
            </Typography>
            <Typography className={classes.gridSizeDate} variant="caption">
              <span
                title={
                  i18n.t('core:modifiedDate') +
                  ': ' +
                  formatDateTime(fsEntry.lmdt, true)
                }
              >
                {fsEntry.lmdt && ' ' + formatDistance(fsEntry.lmdt, new Date(), { addSuffix: true }) /* ⏲ */}
              </span>
              <span title={fsEntry.size + ' ' + i18n.t('core:sizeInBytes')}>
                {' ' + formatFileSize(fsEntry.size)}
              </span>
            </Typography>
          </div>
        ) : (
          <div className={classes.gridDetails}>
            <FolderIcon
              className={classes.gridFolder}
              style={{ backgroundColor: fsEntryColor }}
              title={fsEntry.path}
            />
          </div>
        )}
      </div>
    );
  }

  function renderRowCell() {
    let tmbSize = 85;
    if (entrySize === 'small') {
      tmbSize = 50;
    } else if (entrySize === 'normal') {
      tmbSize = 85;
    } else if (entrySize === 'big') {
      tmbSize = 120;
    }
    return (
      <Grid
        container
        wrap="nowrap"
        style={{
          backgroundColor: theme.palette.background.default
        }}
      >
        <Grid
          item
          style={{
            minHeight: entryHeight,
            padding: 10,
            marginRight: 5,
            backgroundColor: fsEntryBackgroundColor
          }}
        >
          {fsEntry.isFile ? (
            <div
              className={classes.rowFileExtension}
              title={fsEntry.path}
              style={{ backgroundColor: fsEntryColor }}
            >
              {fsEntry.extension}
            </div>
          ) : (
            <span className={classes.gridFolder} title={fsEntry.path}>
              <FolderIcon
                className={classes.rowFolder}
                style={{ backgroundColor: fsEntryColor }}
              />
            </span>
          )}
        </Grid>
        <Grid item xs zeroMinWidth>
          <Typography style={{ wordBreak: 'break-all' }}>
            {extractTitle(fsEntry.name, !fsEntry.isFile)}
          </Typography>
          {fsEntry.tags.map(tag => renderTag(tag))}
          {entrySize !== 'small' && (
            <Typography
              style={{
                color: 'gray',
                padding: 5
              }}
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
                {fsEntry.isFile && fsEntry.lmdt && '️ ' + formatDistance(fsEntry.lmdt, new Date(), { addSuffix: true }) + ' '}
              </span>
              <span title={i18n.t('core:entryDescription')}>
                {description && description}
              </span>
            </Typography>
          )}
        </Grid>
        {fsEntry.thumbPath && (
          <Grid
            item
          >
            <div
              className={classes.gridCellThumb}
              style={{
                backgroundSize: thumbnailMode,
                backgroundImage: thumbPathUrl,
                margin: 1,
                height: tmbSize,
                width: tmbSize
              }}
            />
          </Grid>
        )}
      </Grid>
    );
  }

  function renderTag(tag: Object) {
    return isReadOnlyMode ? (
      <TagContainer
        tag={tag}
        key={tag.id}
        entryPath={fsEntry.path}
        addTags={addTags}
        handleTagMenu={handleTagMenu}
        selectedEntries={selectedEntries}
      />
    ) : (
      <TagContainerDnd
        tag={tag}
        key={tag.id}
        entryPath={fsEntry.path}
        addTags={addTags}
        handleTagMenu={handleTagMenu}
        selectedEntries={selectedEntries}
      />
    );
  }

  let entryHeight = 130;
  if (entrySize === 'small') {
    entryHeight = 50;
  } else if (entrySize === 'normal') {
    entryHeight = 80;
  } else if (entrySize === 'big') {
    entryHeight = 130;
  }

  let gridCell = React.Fragment;
  if (layoutType === 'grid') {
    gridCell = renderGridCell();
  } else if (layoutType === 'row') {
    gridCell = renderRowCell();
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
        backgroundColor: theme.palette.background.default
      }}
      onContextMenu={event => handleGridContextMenu(event, fsEntry)}
      onDoubleClick={event => handleGridCellDblClick(event, fsEntry)}
      onClick={event => handleGridCellClick(event, fsEntry)}
    >{gridCell}</Paper>
  );
};

export default CellContent;
