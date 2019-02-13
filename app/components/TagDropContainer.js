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
import { DropTarget } from 'react-dnd';
import DragItemTypes from './DragItemTypes';

type Props = {
  children: Array<Object>,
  canDrop: boolean,
  isOver: boolean,
  connectDropTarget: (param: Object) => void
};

const boxTarget = {
  drop(props) {
    return {
      entryPath: props.entryPath
    };
  }
};

const TagDropContainer = (props: Props) => {
  const { canDrop, isOver, connectDropTarget } = props;
  const isActive = canDrop && isOver;

  let border = '2px solid transparent';
  let backgroundColor = 'transparent';
  if (isActive) {
    border = '2px solid #f7cf00';
    backgroundColor = '#f7cf00';
  } else if (canDrop) {
    border = '2px solid #ffeaa5';
    backgroundColor = '#ffeaa5';
  }

  return connectDropTarget(
    <div
      style={{
        border,
        backgroundColor,
        borderRadius: 5
      }}
    >
      {props.children}
    </div>
  );
};

export default DropTarget(DragItemTypes.TAG, boxTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop()
}))(TagDropContainer);
