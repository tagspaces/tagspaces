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
import { DragSource, ConnectDragPreview, ConnectDragSource } from 'react-dnd';

import { getEmptyImage } from 'react-dnd-html5-backend';
import DragItemTypes from './DragItemTypes';
import TagContainer from './TagContainer';
import { TagGroup, Tag } from '../reducers/taglibrary';
import { FileSystemEntry } from '-/services/utils-io';

const boxSource = {
  beginDrag(props) {
    // console.log('beginDrag', props);
    return {
      tagTitle: props.tag.title,
      tag: props.tag,
      sourceTagGroupId: props.tagGroup ? props.tagGroup.uuid : undefined
    };
  },

  endDrag(props, monitor) {
    const item = monitor.getItem();
    const dropResult = monitor.getDropResult();

    // console.log('DropRESULT: ', dropResult);
    // console.log('item: ', item);
    if (
      dropResult &&
      dropResult.tagGroupId &&
      dropResult.tagGroupId !== item.sourceTagGroupId &&
      props.moveTag
    ) {
      // console.log(`Dropped ${item.tagId} from ${item.sourceTagGroupId} into ${dropResult.tagGroupId}!`);
      props.moveTag(
        item.tagTitle,
        item.sourceTagGroupId,
        dropResult.tagGroupId
      );
    } else if (dropResult && dropResult.entryPath && props.addTags) {
      // console.log(`Dropped item: ${item.tag.title} onto file: ${dropResult.entryPath}!`);
      if (
        props.selectedEntries.some(entry => entry.path === dropResult.entryPath)
      ) {
        const selectedEntryPaths = [];
        props.selectedEntries.map(entry => selectedEntryPaths.push(entry.path));
        props.addTags(selectedEntryPaths, [item.tag]);
      } else {
        props.addTags([dropResult.entryPath], [item.tag]);
      }
    }
  }
};

interface Props {
  tag: Tag;
  key: string;
  tagGroup?: TagGroup;
  handleTagMenu: (event: Object, tag: Tag, param: any) => void;
  handleRemoveTag?: (event: Object, tag: Tag) => void;
  isDragging?: boolean;
  tagMode?: 'default' | 'display' | 'remove';
  entryPath?: string;
  addTags?: (paths: Array<string>, tags: Array<Tag>) => void;
  moveTag?: () => void;
  connectDragSource?: ConnectDragSource;
  connectDragPreview?: ConnectDragPreview;
  deleteIcon?: Object;
  selectedEntries: Array<FileSystemEntry>;
}

const TagContainerDnd = (props: Props) => {
  const {
    key,
    tag,
    tagGroup,
    entryPath,
    handleTagMenu,
    deleteIcon,
    selectedEntries,
    isDragging,
    connectDragSource,
    addTags,
    tagMode
  } = props;

  // Use empty image as a drag preview so browsers don't draw it
  // and we can draw whatever we want on the custom drag layer instead.
  props.connectDragPreview(getEmptyImage(), {
    // IE fallback: specify that we'd rather screenshot the node
    // when it already knows it's being dragged so we can hide it with CSS.
    captureDraggingState: true
  });

  return connectDragSource(
    <span>
      <TagContainer
        key={key}
        tag={tag}
        tagGroup={tagGroup}
        handleTagMenu={handleTagMenu}
        deleteIcon={deleteIcon}
        addTags={addTags}
        tagMode={tagMode}
        entryPath={entryPath}
        isDragging={isDragging}
        selectedEntries={selectedEntries}
      />
    </span>
  );
};

/**
 * Specifies which props to inject into your component.
 */
const collect = (connect, monitor) => ({
  // Call this function inside render()
  // to let React DnD handle the drag events:
  connectDragSource: connect.dragSource(),
  // You can ask the monitor about the current drag preview
  connectDragPreview: connect.dragPreview(),
  // You can ask the monitor about the current drag state:
  isDragging: monitor.isDragging()
});

export default DragSource(
  DragItemTypes.TAG,
  boxSource,
  collect
)(TagContainerDnd);
