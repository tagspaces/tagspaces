/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2025-present TagSpaces GmbH
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

// **********************************************************************
// Selection Area Component
// **********************************************************************
//
// This component covers the full area where selection is enabled.
// It uses React DnD’s useDrag so that a drag gesture anywhere in the
// container will produce the selection rectangle. When the drag ends,
// it computes the rectangle (in viewport coordinates) and passes it
// to an onSelect callback.
//
import DragItemTypes from '-/components/DragItemTypes';
import React, { useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';

interface SelectionAreaProps {
  onSelect: (rect: DOMRect) => void;
  children: React.ReactNode;
}

export const SelectionArea: React.FC<SelectionAreaProps> = ({
  onSelect,
  children,
}) => {
  // useDrag returns a ref that you attach to the element that should capture
  // drag events. Here we use it on the container.
  const [, drag, preview] = useDrag({
    type: DragItemTypes.SELECTION,
    // No payload is needed here
    item: {},
    end: (_, monitor) => {
      const initialOffset = monitor.getInitialClientOffset();
      const dropOffset = monitor.getClientOffset();
      if (initialOffset && dropOffset) {
        // Compute rectangle coordinates based on the drag's start and end points
        const x = Math.min(initialOffset.x, dropOffset.x);
        const y = Math.min(initialOffset.y, dropOffset.y);
        const width = Math.abs(initialOffset.x - dropOffset.x);
        const height = Math.abs(initialOffset.y - dropOffset.y);
        // Create a DOMRect-like object (DOMRect constructor is available in modern browsers)
        const rect = new DOMRect(x, y, width, height);
        onSelect(rect);
      }
    },
  });

  // Disable the default drag preview by using an empty image.
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  return <div ref={drag}>{children}</div>;
};
