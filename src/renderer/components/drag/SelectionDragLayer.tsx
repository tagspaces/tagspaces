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
// Custom Drag Layer for Rendering the Selection Rectangle
// **********************************************************************
//
// This component uses useDragLayer to tap into the current drag state
// and renders a rectangle that goes from the initial drag point to the
// current pointer location.
//
import DragItemTypes from '-/components/DragItemTypes';
import { alpha, useTheme } from '@mui/material/styles';
import React from 'react';
import { useDragLayer } from 'react-dnd';

const SelectionDragLayer: React.FC = () => {
  const theme = useTheme();
  const { isDragging, itemType, initialOffset, currentOffset } = useDragLayer(
    (monitor) => ({
      isDragging: monitor.isDragging(),
      itemType: monitor.getItemType(),
      initialOffset: monitor.getInitialClientOffset(),
      currentOffset: monitor.getClientOffset(),
    }),
  );

  // Only render the selection rectangle when dragging with the selection type.
  if (
    !isDragging ||
    itemType !== DragItemTypes.SELECTION ||
    !initialOffset ||
    !currentOffset
  ) {
    return null;
  }

  // Compute rectangle geometry based on the initial and current pointer locations
  const x = Math.min(initialOffset.x, currentOffset.x);
  const y = Math.min(initialOffset.y, currentOffset.y);
  const width = Math.abs(initialOffset.x - currentOffset.x);
  const height = Math.abs(initialOffset.y - currentOffset.y);

  const layerStyle: React.CSSProperties = {
    position: 'fixed',
    pointerEvents: 'none',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    zIndex: 1000,
  };

  return (
    <div style={layerStyle}>
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width,
          height,
          border: '1px dashed black',
          backgroundColor: alpha(theme.palette.primary.main, 0.2),
        }}
      />
    </div>
  );
};

export default SelectionDragLayer;
