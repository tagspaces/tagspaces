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
import type { ConnectDragPreview, ConnectDragSource } from 'react-dnd';
import DragItemTypes from './DragItemTypes';
import TagContainer from './TagContainer';
import { type TagGroup, type Tag } from '../reducers/taglibrary';

const boxSource = {
  beginDrag(props) {
    // console.log('beginDrag', props);
    return {
      tagId: props.tag.id,
      tag: props.tag,
      sourceTagGroupId: props.tagGroup ? props.tagGroup.uuid : undefined
    };
  },

  endDrag(props, monitor) {
    const item = monitor.getItem();
    const dropResult = monitor.getDropResult();

    // console.log('DropRESULT: ', dropResult);
    // console.log('item: ', item);
    if (dropResult && dropResult.tagGroupId && dropResult.tagGroupId !== item.sourceTagGroupId && props.moveTag) {
      // console.log(`Dropped ${item.tagId} from ${item.sourceTagGroupId} into ${dropResult.tagGroupId}!`);
      props.moveTag(item.tagId, item.sourceTagGroupId, dropResult.tagGroupId);
    } else if (dropResult && dropResult.entryPath && props.addTags) {
      // console.log(`Dropped item: ${item.tag.title} onto file: ${dropResult.entryPath}!`);
      if (props.selectedEntries.some(entry => entry.path === dropResult.entryPath)) {
        const selectedEntryPaths = [];
        props.selectedEntries.map(entry => selectedEntryPaths.push(entry.path));
        props.addTags(selectedEntryPaths, [item.tag]);
      } else {
        props.addTags([dropResult.entryPath], [item.tag]);
      }
    }
  }
};

type Props = {
  tag: Tag,
  key: string,
  tagGroup: TagGroup,
  handleTagMenu: (event: Object, tag: Tag, tagGroup: TagGroup) => void, // TODO refactor
  handleTagMenu: (event: Object, tag: Tag, entryPath: string) => void,
  handleRemoveTag: (event: Object, tag: Tag) => void,
  isDragging: boolean,
  tagMode?: 'default' | 'display' | 'remove',
  entryPath?: string,
  addTags: (paths: Array<string>, tags: Array<Tag>) => void,
  moveTag: () => void,
  connectDragSource: ConnectDragSource,
  connectDragPreview: ConnectDragPreview,
  deleteIcon: Object,
  selectedEntries: Array<string>
};

// class TagContainerDnd extends React.PureComponent<Props> {
//   // componentDidMount() {
//   //   const xml = '<svg version="1.1" height="25" width="100" xmlns="http://www.w3.org/2000/svg">' +
//   //     '<g>' +
//   //     '<rect x="0" y="0" rx="5" ry="5" width="100%" height="100%" style="fill:' + this.props.tag.color + ';opacity:0.5" />' +
//   //     '<text x="50%" y="55%" font-family="Roboto,Arial,Helvetica,Sans" font-size="13" dominant-baseline="middle" text-anchor="middle" fill="' + this.props.tag.textcolor + '">' + this.props.tag.title + '</text>' +
//   //     '</g>' +
//   //     '</svg>';
//   //   const img = new Image();
//   //   img.src = `data:image/svg+xml;charset=utf-8,${xml.replace(/(\r\n|\n|\r)/gm, '')}`;
//   //   img.onload = () => this.props.connectDragPreview(img, { anchorX: 1, anchorY: 0 });
//   //   // this.props.connectDragPreview(getEmptyImage(), { captureDraggingState: true });
//   // }

//   shouldComponentUpdate(nextProps) {
//     if (this.props.tag.title !== nextProps.tag.title
//       || typeof this.props.key !== typeof nextProps.key
//       || (this.props.key && nextProps.key && this.props.key !== nextProps.key)
//       || this.props.tag.color !== nextProps.tag.color
//       || this.props.tag.textcolor !== nextProps.tag.textcolor
//       || (this.props.tagGroup && this.props.tagGroup ? (this.props.tagGroup.uuid !== nextProps.tagGroup.uuid) : false)
//       || this.props.isDragging !== nextProps.isDragging
//       || typeof this.props.entryPath !== typeof nextProps.entryPath
//       || (this.props.entryPath && this.props.entryPath !== nextProps.entryPath)
//     ) {
//       return true;
//     }
//     return false;
//   }

//   render() {
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
    </span>);
};

export default DragSource(DragItemTypes.TAG, boxSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  connectDragPreview: connect.dragPreview(),
  isDragging: monitor.isDragging()
}))(TagContainerDnd);
