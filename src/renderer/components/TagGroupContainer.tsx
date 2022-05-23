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

import React, { ReactNode, useRef } from 'react';
import { DropTargetMonitor, useDrop } from 'react-dnd';
import DragItemTypes from './DragItemTypes';
import { TS } from '-/tagspaces.namespace';

interface Props {
  children: ReactNode;
  taggroup: TS.TagGroup;
}

const TagGroupContainer = (props: Props) => {
  const ref = useRef<HTMLDivElement>(null);

  const [collectedProps, drop] = useDrop({
    accept: DragItemTypes.TAG,
    collect(monitor: DropTargetMonitor) {
      const isActive = monitor.isOver({ shallow: true }) && monitor.canDrop();
      return {
        handlerId: monitor.getHandlerId(),
        isActive,
        canDrop: monitor.canDrop(),
        tagGroupId: props.taggroup.uuid
      };
    },
    drop() {
      return {
        tagGroupId: collectedProps.tagGroupId
      };
    }
  });

  drop(ref);

  const { isActive, canDrop } = collectedProps;

  let border = '2px solid transparent';
  let backgroundColor = 'transparent';
  if (isActive) {
    border = '2px solid #f7cf00';
    backgroundColor = '#d9d9d9b5';
  } else if (canDrop) {
    // border = '2px solid gray';
    backgroundColor = '#d9d9d9b5';
  }

  return (
    <div
      ref={ref}
      style={{
        margin: 0,
        padding: 0,
        borderRadius: 5,
        minHeight: 20,
        border,
        backgroundColor
      }}
    >
      {props.children}
    </div>
  );
};

export default TagGroupContainer;
