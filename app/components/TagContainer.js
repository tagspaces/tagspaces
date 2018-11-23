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
import RemoveTagIcon from '@material-ui/icons/Close';
import { type TagGroup, type Tag } from '../reducers/taglibrary';
import { getTagColor, getTagTextColor } from '../reducers/settings';

type Props = {
  tag: Tag,
  key?: string,
  defaultTextColor?: string,
  tagTextColor: string,
  defaultBackgroundColor?: string,
  tagBackgroundColor: string,
  tagGroup?: TagGroup,
  handleTagMenu: (event: Object, tag: Tag, tagGroup: TagGroup) => void, // TODO refactor
  handleTagMenu: (event: Object, tag: Tag, entryPath: string) => void,
  handleRemoveTag: (event: Object, tag: Tag) => void,
  isDragging?: boolean,
  tagMode?: 'default' | 'display' | 'remove',
  entryPath?: string,
  deleteIcon?: Object
};

class TagContainer extends React.Component<Props> {
  static defaultProps = {
    isDragging: false,
    tagMode: 'default',
    key: undefined,
    tagGroup: undefined,
    entryPath: undefined,
    deleteIcon: undefined,
    defaultTextColor: undefined,
    defaultBackgroundColor: undefined
  };

  render() {
    const {
      key,
      tag,
      deleteIcon,
      isDragging,
      defaultTextColor,
      tagTextColor,
      defaultBackgroundColor,
      tagBackgroundColor,
      tagGroup,
      entryPath
    } = this.props;
    const { tagMode } = this.props;
    let mode = '';

    if (tagMode === 'remove') {
      mode = deleteIcon || (
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

    return (
      <div
        data-tid={'tagContainer_' + tag.title.replace(/ /g, '_')}
        key={key || tag.id || uuidv1()}
        onClick={event => { if (this.props.handleTagMenu) { this.props.handleTagMenu(event, tag, entryPath || tagGroup); } }}
        onContextMenu={event => { if (this.props.handleTagMenu) { this.props.handleTagMenu(event, tag, entryPath || tagGroup); } }}
        onDoubleClick={event => { if (this.props.handleTagMenu) { this.props.handleTagMenu(event, tag, entryPath || tagGroup); } }}
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
            color: tag.textcolor || defaultTextColor || tagTextColor,
            backgroundColor: tag.color || defaultBackgroundColor || tagBackgroundColor,
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
    tagBackgroundColor: getTagColor(state),
    tagTextColor: getTagTextColor(state)
  };
}
export default connect(mapStateToProps)(TagContainer);
