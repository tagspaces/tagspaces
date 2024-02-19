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
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import DragItemTypes from './DragItemTypes';
import { TS } from '-/tagspaces.namespace';

interface Props {
  children: React.ReactNode;
}
interface ChildProps {
  entryPath: string;
  selectedEntries: TS.FileSystemEntry[];
}

const FileSourceDnd: React.FC<Props> = ({ children }) => {
  const childProps = children as React.ReactElement<ChildProps>;
  const entryPath = childProps.props.entryPath;
  const selectedEntries = childProps.props.selectedEntries || [];
  let entries = !selectedEntries.some((entry) => entry.path === entryPath)
    ? [{ path: entryPath }]
    : selectedEntries;

  const [collected, drag, preview] = useDrag({
    type: DragItemTypes.FILE,
    item: { path: entryPath, selectedEntries: entries },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Use empty image as a drag preview so browsers don't draw it
  // and we can draw whatever we want on the custom drag layer instead.
  preview(getEmptyImage(), {
    // IE fallback: specify that we'd rather screenshot the node
    // when it already knows it's being dragged so we can hide it with CSS.
    captureDraggingState: true,
  });

  return (
    <span ref={drag} {...collected}>
      {children}
    </span>
  );
};

export default FileSourceDnd;
