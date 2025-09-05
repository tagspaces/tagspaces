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
import TagContainer from '-/components/TagContainer';
import TagContainerDnd from '-/components/TagContainerDnd';
import TagsPreview from '-/components/TagsPreview';
import Tooltip from '-/components/Tooltip';
import TsIconButton from '-/components/TsIconButton';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { usePerspectiveSettingsContext } from '-/hooks/usePerspectiveSettingsContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { useTaggingActionsContext } from '-/hooks/useTaggingActionsContext';
import {
  getSupportedFileTypes,
  getTagDelimiter,
  isReorderTags,
} from '-/reducers/settings';
import i18n from '-/services/i18n';
import {
  findBackgroundColorForFolder,
  findColorForEntry,
  getDescriptionPreview,
} from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import {
  formatDateTime,
  formatFileSize,
} from '@tagspaces/tagspaces-common/misc';
import {
  extractTagsAsObjects,
  extractTitle,
} from '@tagspaces/tagspaces-common/paths';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { defaultSettings } from '../index';

interface Props {
  selected: boolean;
  isLast?: boolean;
  fsEntry: TS.FileSystemEntry;
  style?: any;
  selectionMode: boolean;
  handleTagMenu: (
    event: Object,
    tag: TS.Tag,
    entry: TS.FileSystemEntry,
  ) => void;
  handleGridContextMenu: (event: Object, fsEntry: TS.FileSystemEntry) => void;
  handleGridCellDblClick: (event: Object, fsEntry: TS.FileSystemEntry) => void;
  handleGridCellClick: (event: Object, fsEntry: TS.FileSystemEntry) => void;
  showEntriesDescription?: boolean;
}

export function calculateEntryHeight(entrySize: TS.EntrySizes) {
  let entryHeight = 200;
  if (entrySize === 'tiny') {
    entryHeight = 35;
  } else if (entrySize === 'small') {
    entryHeight = 55;
  } else if (entrySize === 'normal') {
    entryHeight = 75;
  } else if (entrySize === 'big') {
    entryHeight = 95;
  } else if (entrySize === 'huge') {
    entryHeight = 115;
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
  const { addTag, editTagForEntry } = useTaggingActionsContext();
  const { currentLocation } = useCurrentLocationContext();
  const supportedFileTypes = useSelector(getSupportedFileTypes);
  const reorderTags: boolean = useSelector(isReorderTags);
  const tagDelimiter: string = useSelector(getTagDelimiter);
  //const rowCellLocation = findLocation(fsEntry.locationID);

  // You can use the dispatch function to dispatch actions
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
    currentLocation?.getDirSeparator(),
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

    if (description && fsEntry.isFile) {
      description = ' | ' + description;
    }
  }

  const fileSystemEntryColor = findColorForEntry(fsEntry, supportedFileTypes);
  const fileSystemEntryBgColor = findBackgroundColorForFolder(fsEntry);

  let fileNameTags = [];
  if (fsEntry.isFile) {
    fileNameTags = extractTagsAsObjects(
      fsEntry.name,
      tagDelimiter,
      currentLocation?.getDirSeparator(),
    );
  }

  const fileSystemEntryTags =
    fsEntry.meta && fsEntry.meta.tags ? fsEntry.meta.tags : [];
  const sideCarTagsTitles = fileSystemEntryTags.map((tag) => tag.title);
  const entryTags = [
    ...fileSystemEntryTags,
    ...fileNameTags.filter((tag) => !sideCarTagsTitles.includes(tag.title)),
  ];

  const entrySizeFormatted = fsEntry.isFile
    ? formatFileSize(fsEntry.size) + ' | '
    : '';

  const entryLMDTFormatted =
    fsEntry.isFile && fsEntry.lmdt && formatDateTime(fsEntry.lmdt, true);

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

  const entryPath = fsEntry.path;

  const renderTags = useMemo(() => {
    let sideCarLength = 0;
    return entryTags.map((tag: TS.Tag, index) => {
      const tagContainer = currentLocation?.isReadOnly ? (
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
  }, [entryTags, currentLocation?.isReadOnly, reorderTags, entryPath]);

  function generateExtension() {
    return selectionMode ? (
      <TsIconButton
        style={{
          width: 40,
          height: 35,
          alignSelf: 'center',
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (selected) {
            selectEntry(fsEntry, false);
          } else {
            selectEntry(fsEntry);
          }
        }}
      >
        {selected ? <SelectedIcon /> : <UnSelectedIcon />}
      </TsIconButton>
    ) : (
      <Tooltip title={i18n.t('clickToSelect') + ' ' + fsEntry.path}>
        <Typography
          style={{
            paddingTop: 1,
            paddingBottom: 9,
            paddingLeft: 3,
            paddingRight: 3,
            fontSize: 13,
            minWidth: 40,
            color: 'white',
            borderRadius: 3,
            textAlign: 'center',
            display: 'inline',
            backgroundColor: fileSystemEntryColor,
            textShadow: '1px 1px #8f8f8f',
            textOverflow: 'unset',
            height: 15,
            alignSelf: 'center',
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

  const entryHeight = calculateEntryHeight(entrySize);
  const isSmall = entrySize === 'tiny'; // || entrySize === 'small';

  let entryBackgroundColor = fileSystemEntryBgColor;
  if (entryBackgroundColor === 'transparent') {
    entryBackgroundColor = theme.palette.background.default;
  }

  const backgroundColor = selected
    ? theme.palette.primary.light
    : entryBackgroundColor;

  return (
    <Paper
      data-entry-id={fsEntry.uuid}
      style={{
        boxShadow: 'none',
        borderRadius: 0,
        borderLeft: '1px solid transparent',
        borderRight: '1px solid transparent',
        borderTop: '1px solid transparent',
        borderBottom: '1px solid ' + theme.palette.divider,
        background: 'transparent',
        margin: 0,
        paddingBottom: 5,
        marginLeft: 5,
        minHeight: entryHeight,
        marginBottom: isLast ? 40 : 'auto',
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
      <Grid
        container
        wrap="nowrap"
        sx={{
          borderRadius: AppConfig.defaultCSSRadius,
          backgroundColor,
          '&:hover': {
            backgroundColor: theme.palette.divider + ' !important',
          },
        }}
      >
        <Grid
          style={{
            minHeight: entryHeight,
            minWidth: 50,
            height: 30,
            padding: 3,
            textAlign: 'left',
            display: 'flex',
            alignSelf: 'center',
          }}
        >
          {generateExtension()}
        </Grid>
        {isSmall ? (
          <Grid
            style={{
              display: 'flex',
              width: '100%',
              marginLeft: 5,
            }}
          >
            <Typography
              variant="body2"
              style={{
                overflowX: 'hidden',
                textWrap: 'nowrap',
                alignSelf: 'center',
                marginRight: 5,
              }}
              title={
                fsEntry.name +
                ' | ' +
                entrySizeFormatted +
                formatDateTime(fsEntry.lmdt, true)
              }
            >
              <>{entryTitle}</>
              &nbsp;
              {showTags && entryTags ? renderTags : tagPlaceholder}
            </Typography>
          </Grid>
        ) : (
          <Grid sx={{ alignSelf: 'center', width: '100%', marginLeft: 5 }}>
            <Typography
              variant="body1"
              title={fsEntry.name}
              sx={{ wordBreak: 'break-all' }}
            >
              {entryTitle}
            </Typography>
            <Typography
              data-tid="gridCellDescription"
              sx={{
                color: 'gray',
              }}
              variant="body2"
            >
              <Tooltip title={fsEntry.size + ' ' + t('core:sizeInBytes')}>
                {entrySizeFormatted}
              </Tooltip>
              <Tooltip
                title={
                  t('core:modifiedDate') +
                  ': ' +
                  formatDateTime(fsEntry.lmdt, true)
                }
              >
                <span>{entryLMDTFormatted}</span>
              </Tooltip>
              <span>{description}</span>
            </Typography>
            {showTags && entryTags ? renderTags : tagPlaceholder}
          </Grid>
        )}
        {fsEntry.meta && fsEntry.meta.thumbPath && (
          <Grid
            style={{
              display: 'flex',
              width: entryHeight,
              alignItems: 'center',
            }}
          >
            <img
              alt="thumbnail"
              src={
                fsEntry.meta?.thumbPath +
                (fsEntry.meta &&
                fsEntry.meta.thumbPath &&
                !currentLocation.haveObjectStoreSupport() &&
                !currentLocation.haveWebDavSupport()
                  ? urlGetDelim(fsEntry.meta?.thumbPath) +
                    fsEntry.meta.lastUpdated
                  : '')
              }
              // @ts-ignore
              onError={(i) => (i.target.style.display = 'none')}
              loading="lazy"
              style={{
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                objectFit: thumbnailMode,
                height: entryHeight - 5,
                width: entryHeight - 5,
              }}
            />
          </Grid>
        )}
        <Grid
          sx={{
            display: 'flex',
            alignItems: 'center',
            marginRight: '5px',
            paddingRight: '10px',
          }}
        >
          <TsIconButton
            aria-label="entry context menu"
            onClick={(event) => handleGridContextMenu(event, fsEntry)}
          >
            <MoreMenuIcon />
          </TsIconButton>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default RowCell;
