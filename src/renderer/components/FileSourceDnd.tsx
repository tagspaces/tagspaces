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

import React, { useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import DragItemTypes from './DragItemTypes';
import { TS } from '-/tagspaces.namespace';

interface Props {
  children: React.ReactNode;
  entry: TS.FileSystemEntry;
}

const FileSourceDnd: React.FC<Props> = ({ entry, children }) => {
  //const childProps = children as React.ReactElement<ChildProps>;
  //const entry = childProps.props.entry;

  const [collected, drag, preview] = useDrag({
    type: DragItemTypes.FILE,
    item: { entry: entry },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Disable the default drag preview by using an empty image.
  useEffect(() => {
    // Use empty image as a drag preview so browsers don't draw it
    // and we can draw whatever we want on the custom drag layer instead.
    preview(getEmptyImage(), {
      // IE fallback: specify that we'd rather screenshot the node
      // when it already knows it's being dragged so we can hide it with CSS.
      captureDraggingState: true,
    });
  }, [preview]);
  const { isDragging, ...rest } = collected;

  return (
    <span ref={drag} {...rest}>
      {children}
    </span>
  );
};

export default FileSourceDnd;
