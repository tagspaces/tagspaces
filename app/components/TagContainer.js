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
import uuidv1 from 'uuid';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import PlaceIcon from '@material-ui/icons/Place';
import DateIcon from '@material-ui/icons/DateRange';
import RemoveTagIcon from '@material-ui/icons/Close';
import { type TagGroup, type Tag, getAllTags } from '../reducers/taglibrary';
import { getTagColor, getTagTextColor } from '../reducers/settings';
import { isPlusCode } from '../utils/misc';
import { isDateTimeTag } from '../utils/dates';

type Props = {
  tag: Tag,
  allTags: Array<Tag>,
  key: string,
  defaultTextColor: string,
  defaultBackgroundColor: string,
  tagGroup: TagGroup,
  handleTagMenu: (event: Object, tag: Tag, tagGroup: TagGroup) => void, // TODO refactor
  handleTagMenu: (event: Object, tag: Tag, entryPath: string) => void,
  handleRemoveTag: (event: Object, tag: Tag) => void,
  isDragging: boolean,
  tagMode: 'default' | 'display' | 'remove',
  entryPath: string,
  deleteIcon: Object,
  addTags: (paths: Array<string>, tags: Array<Tag>) => void,
  // removeTags: (paths: Array<string>, tags: Array<Tag>) => void,
  selectedEntries: Array<Object>
};

const TagContainer = React.memo((props: Props) => {
  const {
    key,
    tag,
    deleteIcon,
    isDragging,
    defaultTextColor,
    defaultBackgroundColor,
    tagGroup,
    entryPath,
    allTags,
    handleRemoveTag,
    handleTagMenu,
    selectedEntries,
    addTags,
    tagMode
  } = props;

  let textColor = tag.textcolor || defaultTextColor;
  let backgroundColor = tag.color || defaultBackgroundColor;
  const { title } = tag;

  // Check if tag is plus code
  let isGeoTag = false;
  let isTagDate = false;
  if (!tagGroup) {
    isGeoTag = isPlusCode(title); // || isLatLong
    isTagDate = !isGeoTag && isDateTimeTag(title);
  }

  allTags.some((currentTag: Tag) => {
    if (currentTag.title === title) {
      textColor = currentTag.textcolor;
      backgroundColor = currentTag.color;
      return true;
    }
    return false;
  });

  return (
    <div
      role="presentation"
      data-tid={'tagContainer_' + title.replace(/ /g, '_')}
      key={key || tag.id || uuidv1()}
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
        } else if (handleTagMenu) { handleTagMenu(event, tag, entryPath || tagGroup); }
      }}
      onContextMenu={event => { if (handleTagMenu) { handleTagMenu(event, tag, entryPath || tagGroup); } }}
      onDoubleClick={event => { if (handleTagMenu) { handleTagMenu(event, tag, entryPath || tagGroup); } }}
      style={{
        backgroundColor: 'transparent',
        display: 'inline-block'
      }}
    >
      <Button
        title={title}
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
        <span style={{ flexGrow: '1' }}>
          {isGeoTag && (
            <PlaceIcon
              style={{
                color: tag.textColor,
                fontSize: 18,
                marginBottom: -5
              }}
            />
          )}
          {isTagDate && (
            <DateIcon
              style={{
                color: tag.textColor,
                fontSize: 18,
                marginBottom: -5
              }}
            />
          )}
          {!isTagDate && !isGeoTag && title }
        </span>
        {(tagMode === 'remove') ? (deleteIcon || (
          <RemoveTagIcon
            data-tid={'tagRemoveButton_' + title.replace(/ /g, '_')}
            style={{
              color: tag.textColor,
              fontSize: 20,
              marginBottom: -5
            }}
            onClick={event => handleRemoveTag(event, tag)}
          />
        )) : (
          <MoreVertIcon
            data-tid={'tagMoreButton_' + title.replace(/ /g, '_')}
            style={{
              color: tag.textColor,
              marginLeft: -5,
              marginRight: -5,
              top: 0
            }}
          />
        )}
      </Button>
    </div>
  );
});

function mapStateToProps(state) {
  return {
    allTags: getAllTags(state),
    defaultBackgroundColor: getTagColor(state),
    defaultTextColor: getTagTextColor(state),
    // selectedEntries: getSelectedEntries(state)
  };
}

export default connect(mapStateToProps)(TagContainer);
