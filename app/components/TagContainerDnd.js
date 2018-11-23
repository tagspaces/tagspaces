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
import { DragSource } from 'react-dnd';
import DragItemTypes from './DragItemTypes';
import TagContainer from './TagContainer';
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
  connectDragSource: (param: Object) => void,
  deleteIcon: Object
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

class TagContainerDnd extends React.Component<Props> {
  render() {
    const {
      key,
      tag,
      defaultTextColor,
      defaultBackgroundColor,
      tagGroup,
      entryPath,
      handleTagMenu,
      deleteIcon
    } = this.props;
    const { isDragging, connectDragSource, tagMode } = this.props;

    return connectDragSource(
      <span>
        <TagContainer
          key={key}
          defaultTextColor={defaultTextColor}
          defaultBackgroundColor={defaultBackgroundColor}
          tag={tag}
          tagGroup={tagGroup}
          handleTagMenu={handleTagMenu}
          deleteIcon={deleteIcon}
          tagMode={tagMode}
          entryPath={entryPath}
          isDragging={isDragging}
        />
      </span>
    );
  }
}

export default DragSource(DragItemTypes.TAG, boxSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))(TagContainerDnd);
