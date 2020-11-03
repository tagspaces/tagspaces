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
import formatDistance from 'date-fns/formatDistance';
import removeMd from 'remove-markdown';
import classNames from 'classnames';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import FolderIcon from '@material-ui/icons/FolderOpen';
// import SelectedIcon from '@material-ui/icons/CheckCircle';
// import UnSelectedIcon from '@material-ui/icons/RadioButtonUnchecked';
import TagIcon from '@material-ui/icons/LocalOfferOutlined';
import { formatFileSize, formatDateTime } from '-/utils/misc';
import { extractTagsAsObjects, extractTitle } from '-/utils/paths';
import { FileSystemEntry, findColorForFileEntry } from '-/services/utils-io';
import TagContainerDnd from '-/components/TagContainerDnd';
import TagContainer from '-/components/TagContainer';
import i18n from '-/services/i18n';
import { Tag } from '-/reducers/taglibrary';
import PlatformIO from '-/services/platform-io';
import { AppConfig } from '-/config';

const maxDescriptionPreviewLength = 100;

interface Props {
  selected: boolean;
  fsEntry: FileSystemEntry;
  entrySize: string;
  classes: any;
  theme: any;
  supportedFileTypes: Array<Object>;
  thumbnailMode: any;
  addTags: () => void;
  openFsEntry: (fsEntry: FileSystemEntry) => void;
  selectedEntries: Array<FileSystemEntry>;
  isReadOnlyMode: boolean;
  showTags: boolean;
  handleTagMenu: (event: Object, tag: Tag, entryPath: string) => void;
  layoutType: string;
  handleGridContextMenu: (event: Object, fsEntry: FileSystemEntry) => void;
  handleGridCellDblClick: (event: Object, fsEntry: FileSystemEntry) => void;
  handleGridCellClick: (event: Object, fsEntry: FileSystemEntry) => void;
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
    selectedEntries,
    isReadOnlyMode,
    handleTagMenu,
    layoutType,
    handleGridContextMenu,
    handleGridCellDblClick,
    handleGridCellClick,
    showTags,
    openFsEntry
  } = props;
  const fsEntryBackgroundColor = fsEntry.color ? fsEntry.color : 'transparent';
  const entryTitle = extractTitle(
    fsEntry.name,
    !fsEntry.isFile,
    PlatformIO.getDirSeparator()
  );

  let description = removeMd(fsEntry.description);
  if (description.length > maxDescriptionPreviewLength) {
    description = description.substr(0, maxDescriptionPreviewLength) + '...';
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
          backgroundColor: fsEntryBackgroundColor
        }}
      >
        <div
          className={classes.gridCellThumb}
          style={{
            position: 'relative',
            // zIndex: 1,
            height: 150 // fsEntry.isFile ? 150 : 70
          }}
        >
          {fsEntry.thumbPath && (
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
          )}
          <div id="gridCellTags" className={classes.gridCellTags}>
            {showTags && entryTags
              ? entryTags.map(tag => renderTag(tag))
              : tagPlaceholder}
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
                {fsEntry.lmdt &&
                  ' ' +
                    formatDistance(fsEntry.lmdt, new Date(), {
                      addSuffix: true
                    })}
              </span>
              <span title={fsEntry.size + ' ' + i18n.t('core:sizeInBytes')}>
                {' ' + formatFileSize(fsEntry.size)}
              </span>
            </Typography>
          </div>
        ) : (
          <div className={classes.gridDetails} title={fsEntry.path}>
            <FolderIcon
              className={classes.gridFolder}
              style={{ backgroundColor: fsEntryColor }}
            />
          </div>
        )}
      </div>
    );
  }

  function renderRowCell(selected: boolean) {
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
        className={classes.rowHover}
        style={{
          backgroundColor: selected
            ? theme.palette.primary.light
            : theme.palette.background.default
        }}
      >
        <Grid
          item
          style={{
            minHeight: entryHeight,
            width: 70,
            maxWidth: 70,
            padding: 10,
            marginRight: 5,
            textAlign: 'center',
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
            <span title={fsEntry.path}>
              <FolderIcon
                className={classes.rowFolder}
                style={{ backgroundColor: fsEntryColor }}
              />
            </span>
          )}
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
              {showTags && entryTags
                ? entryTags.map(tag => renderTag(tag))
                : tagPlaceholder}
            </Typography>
          </Grid>
        ) : (
          <Grid item xs zeroMinWidth>
            <Typography style={{ wordBreak: 'break-all' }}>
              {entryTitle}
            </Typography>
            {showTags && entryTags
              ? entryTags.map(tag => renderTag(tag))
              : tagPlaceholder}
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
                {fsEntry.isFile &&
                  fsEntry.lmdt &&
                  '️ ' +
                    formatDistance(fsEntry.lmdt, new Date(), {
                      addSuffix: true
                    }) +
                    ' '}
              </span>
              <span title={i18n.t('core:entryDescription')}>
                {description && description}
              </span>
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

  function renderTag(tag: Tag) {
    return isReadOnlyMode ? (
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
        key={fsEntry.path + tag.title}
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

export default CellContent;
