import React from 'react';
import { XYCoord, useDragLayer } from 'react-dnd';
import { BoxDragPreview } from './BoxDragPreview';
import DragItemTypes from '-/components/DragItemTypes';

const layerStyles: React.CSSProperties = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%'
};

function getItemStyles(
  initialOffset: XYCoord | null,
  currentOffset: XYCoord | null
) {
  if (!initialOffset || !currentOffset) {
    return {
      display: 'none'
    };
  }

  const { x, y } = currentOffset;

  const transform = `translate(${x}px, ${y}px)`;
  return {
    transform,
    WebkitTransform: transform
  };
}

export interface CustomDragLayerProps {}

export const CustomDragLayer: React.FC<CustomDragLayerProps> = props => {
  const {
    itemType,
    isDragging,
    item,
    initialOffset,
    currentOffset
  } = useDragLayer(monitor => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging()
  }));

  function renderItem() {
    switch (itemType) {
      case DragItemTypes.FILE:
        return (
          <BoxDragPreview entries={item.selectedEntries} path={item.path} />
        );

      default:
        return null;
    }
  }

  if (!isDragging) {
    return null;
  }
  return (
    <div style={layerStyles}>
      <div style={getItemStyles(initialOffset, currentOffset)}>
        {renderItem()}
      </div>
    </div>
  );
};
