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
import Button from '@material-ui/core/Button';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import RemoveTagIcon from '@material-ui/icons/Close';
import { DragSource } from 'react-dnd';
import DragItemTypes from './DragItemTypes';
import { type TagGroup, type Tag } from '../reducers/taglibrary';

type Props = {
  tag: Tag,
  key: string,
  defaultTextColor: string,
  defaultBackgroundColor: string,
  tagGroup: TagGroup,
  handleTagMenu: (event: Object, tag: Tag, tagGroup: TagGroup) => void, // TODO refactor
  handleTagMenu: (event: Object, tag: Tag, entryPath: string) => void,
  handleRemoveTag: (event: Object, tag: Tag) => void,
  isDragging: boolean,
  tagMode?: 'default' | 'display' | 'remove',
  entryPath?: string,
  connectDragSource: (param: Object) => void
};

const boxSource = {
  beginDrag(props) {
    // console.log('beginDrag', props);
    return {
      tagId: props.tag.id,
      tag: props.tag,
      sourceTagGroupId: props.tagGroup.uuid
    };
  },

  endDrag(props, monitor) {
    const item = monitor.getItem();
    const dropResult = monitor.getDropResult();

    // console.log('DropRESULT: ', dropResult);
    // console.log('item: ', item);
    if (dropResult && dropResult.tagGroupId && dropResult.tagGroupId !== item.sourceTagGroupId) {
      // console.log(`Dropped ${item.tagId} from ${item.sourceTagGroupId} into ${dropResult.tagGroupId}!`);
      props.moveTag(item.tagId, item.sourceTagGroupId, dropResult.tagGroupId);
    } else if (dropResult && dropResult.entryPath) {
      // console.log(`Dropped item: ${item.tag.title} onto file: ${dropResult.entryPath}!`);
      props.addTags([dropResult.entryPath], [item.tag]);
    }
  }
};

class TagContainer extends React.Component<Props> {
  render() {
    const {
      tag,
      defaultTextColor,
      defaultBackgroundColor,
      tagGroup,
      entryPath
    } = this.props;
    const { isDragging, connectDragSource, tagMode } = this.props;
    let mode = '';

    if (tagMode === 'remove') {
      mode = (
        <RemoveTagIcon
          data-tid={'tagRemoveButton_' + tag.title.replace(/ /g, '_')}
          style={{
            color: 'white'
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
            color: 'white'
          }}
        />
      );
    }

    return connectDragSource(
      <div
        data-tid={'tagContainer_' + tag.title.replace(/ /g, '_')}
        key={this.props.key}
        onClick={event => this.props.handleTagMenu(event, tag, entryPath || tagGroup)}
        onContextMenu={event => this.props.handleTagMenu(event, tag, entryPath || tagGroup)}
        onDoubleClick={event => this.props.handleTagMenu(event, tag, entryPath || tagGroup)}
        style={{
          backgroundColor: 'transparent',
          marginLeft: 4,
          marginTop: 0,
          marginBottom: 0,
          display: 'inline-block'
        }}
      >
        <Button
          size="small"
          style={{
            opacity: isDragging ? 0.5 : 1,
            fontSize: 13,
            textTransform: 'none',
            color: tag.textcolor ? tag.textcolor : defaultTextColor,
            backgroundColor: tag.color ? tag.color : defaultBackgroundColor,
            minHeight: 25,
            margin: 0,
            paddingTop: 0,
            paddingBottom: 0,
            paddingRight: 3,
            borderRadius: 5
          }}
        >
          <span>
            {/* {tag.icon && tag.icon.length > 0 && tag.icon + ' '} TODO icon impl */}
            {tag.title}
          </span>
          {mode}
        </Button>
      </div>
    );
  }
}

export default DragSource(DragItemTypes.TAG, boxSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))(TagContainer);
