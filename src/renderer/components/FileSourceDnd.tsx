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
import { DragSource, ConnectDragSource, ConnectDragPreview } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import DragItemTypes from './DragItemTypes';

interface Props {
  children: Array<any>;
  connectDragSource: ConnectDragSource;
  connectDragPreview: ConnectDragPreview;
}

const boxSource = {
  beginDrag(props) {
    // console.log('beginDrag', props);
    const entryPath = props.children.props.entryPath;
    const selectedEntries = props.children.props.selectedEntries;
    if (!selectedEntries.some((entry) => entry.path === entryPath)) {
      return {
        path: entryPath,
        selectedEntries: [{ path: entryPath }],
      };
    } else {
      return {
        path: entryPath,
        selectedEntries: selectedEntries,
      };
    }
  },

  /* endDrag(props, monitor) {
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
    } */
};

const FileSourceDnd = (props: Props) => {
  // Use empty image as a drag preview so browsers don't draw it
  // and we can draw whatever we want on the custom drag layer instead.
  // if(props.children.props.selectedEntries &&  props.children.props.selectedEntries.length > 1) {
  props.connectDragPreview(getEmptyImage(), {
    // IE fallback: specify that we'd rather screenshot the node
    // when it already knows it's being dragged so we can hide it with CSS.
    captureDraggingState: true,
  });
  // }

  return props.connectDragSource(<span>{props.children}</span>);
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
  isDragging: monitor.isDragging(),
});

export default DragSource(
  DragItemTypes.FILE,
  boxSource,
  collect,
)(FileSourceDnd);
