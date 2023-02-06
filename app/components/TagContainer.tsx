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
import { connect } from 'react-redux';
import Button from '@mui/material/Button';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PlaceIcon from '@mui/icons-material/Place';
import DateIcon from '@mui/icons-material/DateRange';
import RemoveTagIcon from '@mui/icons-material/Close';
import Tooltip from '-/components/Tooltip';
import { formatDateTime } from '@tagspaces/tagspaces-common/misc';
import { getTagColor, getTagTextColor } from '-/reducers/settings';
import { isGeoTag } from '-/utils/geo';
import { isDateTimeTag, convertToDateTime, convertToDate } from '-/utils/dates';
import { TS } from '-/tagspaces.namespace';
import { getTagColors } from '-/services/taglibrary-utils';

interface Props {
  tag: TS.Tag;
  isReadOnlyMode?: boolean;
  // allTags?: Array<TS.Tag>;
  defaultTextColor?: string;
  defaultBackgroundColor?: string;
  tagGroup?: TS.TagGroup;
  handleTagMenu?: (
    event: Object,
    tag: TS.Tag,
    tagGroup: TS.TagGroup | string,
    haveSelectedEntries: boolean
  ) => void; // TODO refactor
  handleRemoveTag?: (event: Object, tags: Array<TS.Tag>) => void;
  isDragging?: boolean;
  tagMode?: 'default' | 'display' | 'remove';
  entryPath?: string;
  deleteIcon?: Object;
  addTags?: (paths: Array<string>, tags: Array<TS.Tag>) => void;
  moveTag?: (
    tagTitle: string,
    fromTagGroupId: TS.Uuid,
    toTagGroupId: TS.Uuid
  ) => void;
  selectedEntries?: Array<TS.FileSystemEntry>;
  reorderTags?: boolean;
}

function TagContainer(props: Props) {
  const {
    tag,
    deleteIcon,
    isDragging,
    defaultTextColor,
    defaultBackgroundColor,
    tagGroup,
    entryPath,
    // allTags,
    handleRemoveTag,
    handleTagMenu,
    selectedEntries,
    addTags,
    tagMode
  } = props;
  let { title } = tag;

  // Check if tag is plus code
  let isTagGeo = false;
  let isTagDate = false;
  let isDateSmartTag = false;
  let isGeoSmartTag = false;
  if (!tagGroup) {
    isTagGeo = isGeoTag(title); // || isLatLong
    isTagDate = !isTagGeo && isDateTimeTag(title);
  }

  let textColor: string;
  let backgroundColor: string;
  if (tag.color && tag.textcolor) {
    textColor = tag.textcolor;
    backgroundColor = tag.color;
  } else {
    const tagColors = getTagColors(
      title,
      defaultTextColor,
      defaultBackgroundColor
    );
    textColor = tagColors.textcolor;
    backgroundColor = tagColors.color;
  }

  let tid = 'tagContainer_';
  if (title && title.length > 0) {
    tid += title.replace(/ /g, '_');
  }

  function getActionMenu() {
    if (
      props.isReadOnlyMode // || (tag.functionality && tag.functionality.length > 0)
    ) {
      return <div style={{ width: 10 }} />;
    }
    return tagMode === 'remove' ? (
      deleteIcon || (
        <RemoveTagIcon
          data-tid={'tagRemoveButton_' + title.replace(/ /g, '_')}
          style={{
            color: tag.textcolor,
            fontSize: 20
          }}
          onClick={event => handleRemoveTag(event, [tag])}
        />
      )
    ) : (
      <MoreVertIcon
        data-tid={'tagMoreButton_' + title.replace(/ /g, '_')}
        style={{
          color: tag.textcolor,
          marginLeft: -5,
          marginRight: -5,
          height: 20,
          top: 0
        }}
      />
    );
  }

  if (tag.functionality && tag.functionality.length > 0) {
    const tagFunc = tag.functionality;
    if (
      tagFunc === 'now' ||
      tagFunc === 'today' ||
      tagFunc === 'tomorrow' ||
      tagFunc === 'yesterday' ||
      tagFunc === 'currentMonth' ||
      tagFunc === 'currentYear' ||
      tagFunc === 'dateTagging'
    ) {
      isDateSmartTag = true;
    } else if (tagFunc === 'geoTagging') {
      isGeoSmartTag = true;
    }
  }

  let tagTitle = ''; // tag.title;
  if (isTagDate) {
    let date;
    if (tag.title.length > 8) {
      date = new Date(convertToDateTime(tag.title)).getTime();
    } else {
      date = new Date(convertToDate(tag.title)).getTime();
    }
    tagTitle = formatDateTime(date, true);
  }

  if (tag.description) {
    tagTitle = tagTitle + ' ' + tag.description;
  }

  if (isTagDate && title.length > 8) {
    title = title.substring(0, 8) + '...';
  }

  return (
    <div
      role="presentation"
      data-tid={tid}
      key={tag.id || (tagGroup ? tagGroup.uuid : '') + tid} // don't set unique uuidv1() here - menu anchorEl needs to be the same for the same TagContainer key (or TagMenu will be displayed in top left corner)
      onClick={event => {
        if (event.ctrlKey && addTags) {
          const selectedEntryPaths = [];
          selectedEntries.map(entry => selectedEntryPaths.push(entry.path));
          addTags(selectedEntryPaths, [tag]);
          // Removing tags doesn't seem to work correctly here, yet. Using sidecar tagging, but the removeTagsFromEntry function in tagging.actions.js
          // doesn't recignize it correctly, thinking it's a plain tag and thus tries to rename the files
          // } else if (event.shiftKey) {
          //   const selectedEntryPaths = [];
          //   selectedEntries.map(entry => selectedEntryPaths.push(entry.path));
          //   removeTags(selectedEntryPaths, [tag]);
        } else if (handleTagMenu) {
          handleTagMenu(
            event,
            tag,
            entryPath || tagGroup,
            selectedEntries && selectedEntries.length > 0
          );
        }
      }}
      onContextMenu={event => {
        if (handleTagMenu) {
          handleTagMenu(
            event,
            tag,
            entryPath || tagGroup,
            selectedEntries && selectedEntries.length > 0
          );
        }
      }}
      onDoubleClick={event => {
        if (handleTagMenu) {
          handleTagMenu(
            event,
            tag,
            entryPath || tagGroup,
            selectedEntries && selectedEntries.length > 0
          );
        }
      }}
      style={{
        backgroundColor: 'transparent',
        display: 'inline-block'
      }}
    >
      <Tooltip title={tagTitle}>
        <Button
          size="small"
          style={{
            opacity: isDragging ? 0.5 : 1,
            fontSize: 13,
            textTransform: 'none',
            color: textColor,
            backgroundColor,
            minHeight: 0,
            minWidth: 0,
            margin: 2,
            paddingTop: 0,
            paddingBottom: 0,
            paddingRight: 0,
            paddingLeft: 5,
            borderRadius: 5
          }}
        >
          <span style={{ flexGrow: 1 }}>
            {(isTagGeo || isGeoSmartTag) && (
              <PlaceIcon
                style={{
                  color: tag.textcolor,
                  height: 20,
                  marginBottom: -5,
                  marginLeft: -5,
                  marginRight: 0
                }}
              />
            )}
            {(isTagDate || isDateSmartTag) && (
              <DateIcon
                style={{
                  color: tag.textcolor,
                  height: 20,
                  marginBottom: -5,
                  marginLeft: -5,
                  marginRight: 0
                }}
              />
            )}
            {!isTagGeo && title}
          </span>
          {getActionMenu()}
        </Button>
      </Tooltip>
    </div>
  );
}

function mapStateToProps(state) {
  return {
    defaultBackgroundColor: getTagColor(state),
    defaultTextColor: getTagTextColor(state)
    // selectedEntries: getSelectedEntries(state)
  };
}
export default connect(mapStateToProps)(TagContainer);
