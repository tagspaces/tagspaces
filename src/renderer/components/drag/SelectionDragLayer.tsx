// **********************************************************************
// Custom Drag Layer for Rendering the Selection Rectangle
// **********************************************************************
//
// This component uses useDragLayer to tap into the current drag state
// and renders a rectangle that goes from the initial drag point to the
// current pointer location.
//
import React from 'react';
import { useDragLayer } from 'react-dnd';
import { alpha, useTheme } from '@mui/material/styles';
import DragItemTypes from '-/components/DragItemTypes';

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
          backgroundColor: alpha(theme.palette.primary.main, 0.1),
        }}
      />
    </div>
  );
};

export default SelectionDragLayer;
