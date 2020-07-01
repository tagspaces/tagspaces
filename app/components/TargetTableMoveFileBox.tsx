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
import { DropTarget } from 'react-dnd';

/* const styles: any = () => ({
  dropzone: {
    margin: 5,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1dd19f40',
    zIndex: 1000,
    border: '3px dashed white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
    color: 'white'
  }
}); */

const boxTarget = {
  drop(props, monitor) {
    return props.onDrop(props, monitor);
  }
};

interface Props {
  canDrop: boolean;
  isOver: boolean;
  connectDropTarget: any;
  className: string;
}

const TargetTableMoveFileBox = (props: Props) => {
  const { canDrop, isOver, connectDropTarget, ...restProps } = props;
  if (canDrop && isOver) {
    restProps.className += ' dropzone';
  }
  return connectDropTarget(<tr {...restProps} />);
};

export default DropTarget(
  props => props.accepts,
  boxTarget,
  (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop()
  })
)(TargetTableMoveFileBox);
