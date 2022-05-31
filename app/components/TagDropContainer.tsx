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
  entryPath: string;
  selectedEntries?: Array<TS.FileSystemEntry>;
}

interface DragItem {
  index: number;
  sourceTagGroupId: string;
  tag: TS.Tag;
}

const TagDropContainer = (props: Props) => {
  const ref = useRef<HTMLDivElement>(null);

  const [collectedProps, drop] = useDrop({
    accept: DragItemTypes.TAG,
    collect(monitor: DropTargetMonitor) {
      const isActive = monitor.isOver({ shallow: true }) && monitor.canDrop();
      return {
        handlerId: monitor.getHandlerId(),
        isActive,
        canDrop: monitor.canDrop(),
        selectedEntries: props.selectedEntries,
        entryPath: props.entryPath
      };
    },
    drop(item: DragItem, monitor: DropTargetMonitor) {
      // console.log('DROP: ', item);
      // console.log('DROP: ', monitor.canDrop());
      return {
        selectedEntries: collectedProps.selectedEntries,
        entryPath: collectedProps.entryPath
      };
    }
  });

  drop(ref);

  let border = '2px solid transparent';
  let backgroundColor = 'transparent';
  if (collectedProps.isActive) {
    border = '2px solid #f7cf00';
    backgroundColor = '#f7cf00';
  } else if (collectedProps.canDrop) {
    border = '2px solid lightgray';
    backgroundColor = 'lightgray';
  }
  return (
    <div
      ref={ref}
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

export default TagDropContainer;
