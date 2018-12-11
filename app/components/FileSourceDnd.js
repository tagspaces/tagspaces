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
import type { ConnectDragSource } from 'react-dnd';
import DragItemTypes from './DragItemTypes';

type Props = {

  children: Array<Object>,
  connectDragSource: ConnectDragSource
};

const boxSource = {
  beginDrag(props) {
    // console.log('beginDrag', props);
    return {
      path: props.children.props.entryPath
    };
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

class FileSourceDnd extends React.Component<Props> {
  /* componentDidMount() {
    const xml = '<svg version="1.1" height="25" width="100" xmlns="http://www.w3.org/2000/svg">' +
      '<g>' +
      '<rect x="0" y="0" rx="5" ry="5" width="100%" height="100%" style="fill:' + this.props.tag.color + ';opacity:0.5" />' +
      '<text x="50%" y="55%" font-family="Roboto,Arial,Helvetica,Sans" font-size="13" dominant-baseline="middle" text-anchor="middle" fill="' + this.props.tag.textcolor + '">' + this.props.tag.title + '</text>' +
      '</g>' +
      '</svg>';
    const img = new Image();
    img.src = `data:image/svg+xml;charset=utf-8,${xml.replace(/(\r\n|\n|\r)/gm, '')}`;
    img.onload = () => this.props.connectDragPreview(img, { anchorX: 1, anchorY: 0 });
    // this.props.connectDragPreview(getEmptyImage(), { captureDraggingState: true });
  } */

  render() {
    const { connectDragSource } = this.props;

    return connectDragSource(
      <span>
        {this.props.children}
      </span>);
  }
}

export default DragSource(DragItemTypes.FILE, boxSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))(FileSourceDnd);
