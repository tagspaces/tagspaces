/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces GmbH
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

import React, { useEffect, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';

import { getEmptyImage } from 'react-dnd-html5-backend';
import { extractTags } from '@tagspaces/tagspaces-common/paths';
import AppConfig from '-/AppConfig';
import DragItemTypes from './DragItemTypes';
import TagContainer from './TagContainer';
import { TS } from '-/tagspaces.namespace';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useTaggingActionsContext } from '-/hooks/useTaggingActionsContext';
import { useSelector } from 'react-redux';
import { getTagDelimiter } from '-/reducers/settings';

interface Props {
  tag: TS.Tag;
  index: number;
  tagGroup?: TS.TagGroup;
  handleTagMenu: (
    event: Object,
    tag: TS.Tag,
    param: any,
    haveSelectedEntries: boolean,
  ) => void;
  handleRemoveTag?: (event: Object, tag: TS.Tag) => void;
  tagMode?: 'default' | 'display' | 'remove';
  entry?: TS.FileSystemEntry;
  addTag?: (tag: TS.Tag, parentTagGroupUuid: TS.Uuid) => void;
  moveTag?: (
    tagTitle: string,
    fromTagGroupId: TS.Uuid,
    toTagGroupId: TS.Uuid,
  ) => void;
  changeTagOrder?: (
    tagGroupUuid: TS.Uuid,
    fromIndex: number,
    toIndex: number,
  ) => void;
  editTagForEntry?: (path: string, tag: TS.Tag) => void;
  deleteIcon?: Object;
  selectedEntries: Array<TS.FileSystemEntry>;
  reorderTags?: boolean;
}

const TagContainerDnd = (props: Props) => {
  const {
    index,
    tag,
    tagGroup,
    entry,
    handleTagMenu,
    deleteIcon,
    addTag,
    tagMode,
    reorderTags,
    changeTagOrder,
    editTagForEntry,
    moveTag,
    selectedEntries,
  } = props;

  const { addTags } = useTaggingActionsContext();
  const { currentLocation } = useCurrentLocationContext();
  const tagContainerRef = useRef<HTMLSpanElement>(null);
  const tagDelimiter: string = useSelector(getTagDelimiter);

  const endDrag = (item, monitor) => {
    // const item = monitor.getItem();
    const dropResult = monitor.getDropResult();

    // console.log('DropRESULT: ', dropResult);
    if (
      dropResult &&
      dropResult.tagGroupId
      //tagGroup &&
      //dropResult.tagGroupId !== tagGroup.uuid
    ) {
      if (moveTag && tagGroup) {
        // console.log(`Dropped ${item.tagId} from ${tagGroup.uuid} into ${dropResult.tagGroupId}!`);
        moveTag(item.tag.title, tagGroup.uuid, dropResult.tagGroupId);
      } else if (addTag) {
        // add from file DnD to tagGroup
        addTag(tag, dropResult.tagGroupId);
      }
    } else if (dropResult && dropResult.entry) {
      // console.log(`Dropped item: ${item.tag.title} onto file: ${dropResult.entry.path}!`);
      if (
        selectedEntries.some((entry) => entry.path === dropResult.entry.path)
      ) {
        addTags(selectedEntries, [item.tag]);
      } else {
        addTags([dropResult.entry], [item.tag]);
      }
    }
  };

  const [collected, drag, preview] = useDrag({
    type: DragItemTypes.TAG,
    item: { tag, tagGroup },
    end: endDrag,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const boxTargetHover = (dragItem, monitor) => {
    // const dragItem = monitor.getItem();
    if (
      reorderTags &&
      tagGroup
      //&& dragItem.sourceTagGroupId === tagGroup.uuid
    ) {
      // sort tagGroups tags
      const dragIndex = dragItem.index;
      const hoverIndex = index;
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      // Determine rectangle on screen
      const hoverBoundingRect =
        tagContainerRef && tagContainerRef.current
          ? tagContainerRef.current.getBoundingClientRect()
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
      changeTagOrder(tagGroup.uuid, dragIndex, hoverIndex);
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      dragItem.index = hoverIndex;
    } else if (reorderTags && entry) {
      // sort fileSystemEntries tags
      const dragIndex = dragItem.index;
      const hoverIndex = index;
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      // Cannot drop into different tag type
      if (dragItem.tag.type !== tag.type) {
        return;
      }
      // Skip smart tags drop into another tag
      if (dragItem.tag.functionality !== undefined) {
        return;
      }
      // Skip reorder from TagGroup source
      /*if (dragItem.sourceTagGroupId !== undefined) {
        return;
      }*/
      // Skip reorder on DnD Tag from an other file
      if (dragItem.tag.type === 'plain') {
        const extractedTags = extractTags(
          entry.path,
          tagDelimiter,
          currentLocation?.getDirSeparator(),
        );
        if (
          extractedTags.length > 0 &&
          !extractedTags.includes(dragItem.tag.title)
        ) {
          return;
        }
      } else {
        // TODO check if sidecar tag exist in file (reorder only if exist)
      }

      dragItem.tag.position = hoverIndex;
      editTagForEntry(entry.path, dragItem.tag);

      dragItem.index = hoverIndex;
    }
  };

  const [, drop] = useDrop({
    accept: DragItemTypes.TAG,
    hover: boxTargetHover,
    /*hover: (item, monitor) => {
      // Implement hover logic here
    },*/
  });
  // Disable the default drag preview by using an empty image.
  useEffect(() => {
    // Use empty image as a drag preview so browsers don't draw it
    // and we can draw whatever we want on the custom drag layer instead.
    preview(getEmptyImage(), {
      // IE fallback: specify that we'd rather screenshot the node
      // when it already knows it's being dragged so we can hide it with CSS.
      captureDraggingState: true,
    });
  }, [preview]);

  const { isDragging, ...rest } = collected;

  drag(drop(tagContainerRef));

  return (
    <span ref={tagContainerRef} {...rest}>
      <TagContainer
        tag={tag}
        tagGroup={tagGroup}
        handleTagMenu={handleTagMenu}
        deleteIcon={deleteIcon}
        tagMode={tagMode}
        entry={entry}
        isDragging={isDragging}
        reorderTags={reorderTags}
      />
    </span>
  );
};

export default TagContainerDnd;
