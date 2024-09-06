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

import React from 'react';
import { useDrop } from 'react-dnd';
import { TS } from '-/tagspaces.namespace';
import { CommonLocation } from '-/utils/CommonLocation';

interface Props {
  accepts: string[];
  onDrop: (item: any, monitor: any) => void;
  location: CommonLocation;
  className: string;
}

const TargetTableMoveFileBox = (props: Props) => {
  const { accepts, onDrop, ...restProps } = props;

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: accepts,
    drop: (item: any, monitor) => {
      onDrop(
        {
          ...item,
          ...(restProps.location && { targetLocation: restProps.location }),
        },
        monitor,
      );
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  if (canDrop && isOver) {
    restProps.className += ' dropzone'; // TODO set props.location type and add dropzonecopy based on this type
  }
  return <tr ref={drop} {...restProps} />;
};

export default TargetTableMoveFileBox;
