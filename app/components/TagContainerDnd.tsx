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
import {
  DragSource,
  DropTarget,
  ConnectDragPreview,
  ConnectDragSource,
  ConnectDropTarget
} from 'react-dnd';

import { getEmptyImage } from 'react-dnd-html5-backend';
import DragItemTypes from './DragItemTypes';
import TagContainer from './TagContainer';
import { TS } from '-/tagspaces.namespace';

const boxSource = {
  // Expected the drag source specification to only have some of the following keys: canDrag, beginDrag, isDragging, endDrag
  beginDrag(props) {
    // console.log('beginDrag', props);
    return {
      index: props.index,
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
      dropResult.tagGroupId !== item.sourceTagGroupId
    ) {
      if (props.moveTag) {
        // console.log(`Dropped ${item.tagId} from ${item.sourceTagGroupId} into ${dropResult.tagGroupId}!`);
        props.moveTag(
          item.tagTitle,
          item.sourceTagGroupId,
          dropResult.tagGroupId
        );
      } else if (props.addTag) {
        // add from file DnD to tagGroup
        props.addTag(props.tag, dropResult.tagGroupId);
      }
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

const boxTarget = {
  hover(props, monitor) {
    const dragItem = monitor.getItem();
    if (props.tagGroup && dragItem.sourceTagGroupId === props.tagGroup.uuid) {
      // sort only tagGroups
      const dragIndex = dragItem.index;
      const hoverIndex = props.index;
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      // Determine rectangle on screen
      const hoverBoundingRect =
        props.tagContainerRef && props.tagContainerRef.current
          ? props.tagContainerRef.current.getBoundingClientRect()
          : undefined; // findDOMNode(component).getBoundingClientRect(); // tagContainerRef.current.getBoundingClientRect();

      // Get vertical middle (bottom = right; top = left)
      const hoverMiddleY =
        (hoverBoundingRect.right - hoverBoundingRect.left) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = clientOffset.x - hoverBoundingRect.left;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      // Time to actually perform the action
      props.changeTagOrder(props.tagGroup.uuid, dragIndex, hoverIndex);
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      dragItem.index = hoverIndex;
    }
  }
};

interface Props {
  tag: TS.Tag;
  index: number;
  tagGroup?: TS.TagGroup;
  handleTagMenu: (event: Object, tag: TS.Tag, param: any) => void;
  handleRemoveTag?: (event: Object, tag: TS.Tag) => void;
  isDragging?: boolean;
  tagMode?: 'default' | 'display' | 'remove';
  entryPath?: string;
  addTags?: (paths: Array<string>, tags: Array<TS.Tag>) => void;
  addTag?: (tag: TS.Tag, parentTagGroupUuid: TS.Uuid) => void;
  moveTag?: () => void;
  changeTagOrder?: (
    tagGroupUuid: TS.Uuid,
    fromIndex: number,
    toIndex: number
  ) => void;
  connectDragSource?: ConnectDragSource;
  connectDropTarget: ConnectDropTarget;
  connectDragPreview?: ConnectDragPreview;
  deleteIcon?: Object;
  selectedEntries: Array<TS.FileSystemEntry>;
  tagContainerRef?: string;
}

const TagContainerDnd = (props: Props) => {
  const {
    tag,
    tagGroup,
    entryPath,
    handleTagMenu,
    deleteIcon,
    selectedEntries,
    isDragging,
    connectDragSource,
    connectDropTarget,
    addTags,
    tagMode,
    tagContainerRef
  } = props;

  // Use empty image as a drag preview so browsers don't draw it
  // and we can draw whatever we want on the custom drag layer instead.
  props.connectDragPreview(getEmptyImage(), {
    // IE fallback: specify that we'd rather screenshot the node
    // when it already knows it's being dragged so we can hide it with CSS.
    captureDraggingState: true
  });

  return connectDropTarget(
    connectDragSource(
      <span ref={tagContainerRef}>
        <TagContainer
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
    )
  );
};

/**
 * Specifies which props to inject into your component.
 */
const collectSource = (connect, monitor) => ({
  // Call this function inside render()
  // to let React DnD handle the drag events:
  connectDragSource: connect.dragSource(),
  // You can ask the monitor about the current drag preview
  connectDragPreview: connect.dragPreview(),
  // You can ask the monitor about the current drag state:
  isDragging: monitor.isDragging()
});

const collectTarget = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop()
});

export default DragSource(
  DragItemTypes.TAG,
  boxSource,
  collectSource
)(DropTarget(DragItemTypes.TAG, boxTarget, collectTarget)(TagContainerDnd));
