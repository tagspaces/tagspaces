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
import { bindActionCreators } from 'redux';
import Button from '@material-ui/core/Button';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import RemoveTagIcon from '@material-ui/icons/Close';
import { type TagGroup, type Tag, getAllTags } from '../reducers/taglibrary';
import { getTagColor, getTagTextColor } from '../reducers/settings';
import { getSelectedEntries } from '../reducers/app';
import TaggingActions from '../reducers/tagging-actions';

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
  removeTags: (paths: Array<string>, tags: Array<Tag>) => void,
  selectedEntries: Array<Object>
};


class TagContainer extends React.Component<Props> {
  shouldComponentUpdate(nextProps) {
    if (this.props.tag.title !== nextProps.tag.title
      || typeof this.props.key !== typeof nextProps.key
      || (this.props.key && nextProps.key && this.props.key !== nextProps.key)
      || this.props.tag.color !== nextProps.tag.color
      || this.props.tag.textcolor !== nextProps.tag.textcolor
      || this.props.allTags.some((currentTag: Tag) => {
        if (currentTag.title === this.props.tag.title) {
          return (nextProps.allTags.some((updatedTag: Tag) => {
            if (updatedTag.title === this.props.tag.title) {
              return currentTag.color !== updatedTag.color || currentTag.textcolor !== updatedTag.textcolor;
            }
            return false;
          }));
        }
        return false;
      })
      || (this.props.tagGroup && this.props.tagGroup ? (this.props.tagGroup.uuid !== nextProps.tagGroup.uuid) : false)
      || this.props.isDragging !== nextProps.isDragging
      || typeof this.props.entryPath !== typeof nextProps.entryPath
      || (this.props.entryPath && this.props.entryPath !== nextProps.entryPath)
      || this.props.selectedEntries !== nextProps.selectedEntries
    ) {
      return true;
    }
    return false;
  }

  render() {
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
      selectedEntries,
      addTags,
      removeTags
    } = this.props;
    const { tagMode } = this.props;
    let mode = '';

    let textColor = tag.textcolor || defaultTextColor;
    let backgroundColor = tag.color || defaultBackgroundColor;

    allTags.some((currentTag: Tag) => {
      if (currentTag.title === tag.title) {
        textColor = currentTag.textcolor;
        backgroundColor = currentTag.color;
        return true;
      }
      return false;
    });

    if (tagMode === 'remove') {
      mode = deleteIcon || (
        <RemoveTagIcon
          data-tid={'tagRemoveButton_' + tag.title.replace(/ /g, '_')}
          style={{
            color: tag.textColor
          }}
          onClick={event => this.props.handleRemoveTag(event, tag)}
        />
      );
    } else if (tagMode === 'display') {
      mode = '';
    } else {
      mode = (
        <MoreVertIcon
          data-tid={'tagMoreButton_' + tag.title.replace(/ /g, '_')}
          style={{
            color: tag.textColor
          }}
        />
      );
    }

    return (
      <div
        role="presentation"
        data-tid={'tagContainer_' + tag.title.replace(/ /g, '_')}
        key={key || tag.id || uuidv1()}
        onClick={event => {
          if (event.ctrlKey) {
            const selectedEntryPaths = [];
            selectedEntries.map(entry => selectedEntryPaths.push(entry.path));
            addTags(selectedEntryPaths, [tag]);
          // Removing tags doesn't seem to work correctly here, yet. Using sidecar tagging, but the removeTagsFromEntry function in tagging.actions.js
          // doesn't recignize it correctly, thinking it's a plain tag and thus tries to rename the files
          // } else if (event.shiftKey) {
          //   const selectedEntryPaths = [];
          //   selectedEntries.map(entry => selectedEntryPaths.push(entry.path));
          //   removeTags(selectedEntryPaths, [tag]);
          } else if (this.props.handleTagMenu) { this.props.handleTagMenu(event, tag, entryPath || tagGroup); }
        }}
        onContextMenu={event => { if (this.props.handleTagMenu) { this.props.handleTagMenu(event, tag, entryPath || tagGroup); } }}
        onDoubleClick={event => { if (this.props.handleTagMenu) { this.props.handleTagMenu(event, tag, entryPath || tagGroup); } }}
        style={{
          backgroundColor: 'transparent',
          marginLeft: 4,
          marginTop: 0,
          marginBottom: 4,
          display: 'inline-block'
        }}
      >
        <Button
          size="small"
          style={{
            opacity: isDragging ? 0.5 : 1,
            fontSize: 13,
            textTransform: 'none',
            color: textColor,
            backgroundColor,
            minHeight: 25,
            margin: 0,
            paddingTop: 0,
            paddingBottom: 0,
            paddingRight: 3,
            borderRadius: 5
          }}
        >
          <span>
            {tag.title}
          </span>
          {mode}
        </Button>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    allTags: getAllTags(state),
    defaultBackgroundColor: getTagColor(state),
    defaultTextColor: getTagTextColor(state),
    selectedEntries: getSelectedEntries(state)
  };
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators({
    addTags: TaggingActions.addTags,
    removeTags: TaggingActions.removeTags
  }, dispatch);
}

export default connect(mapStateToProps, mapActionCreatorsToProps)(TagContainer);
