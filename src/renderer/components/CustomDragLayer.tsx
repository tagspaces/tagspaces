import React from 'react';
import { createPortal } from 'react-dom';
import { XYCoord, useDragLayer } from 'react-dnd';
import { FilesDragPreview } from './FilesDragPreview';
import TagDragPreview from './TagDragPreview';
import DragItemTypes from '-/components/DragItemTypes';

const layerStyles: React.CSSProperties = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 2000,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
};

function getItemStyles(
  initialOffset: XYCoord | null,
  currentOffset: XYCoord | null,
  clientOffset: XYCoord | null,
) {
  if (!initialOffset || !currentOffset) {
    return {
      display: 'none',
    };
  }

  const { x, y } = clientOffset; // currentOffset;

  const transform = `translate(${x}px, ${y}px)`;
  return {
    transform,
    WebkitTransform: transform,
  };
}

export interface CustomDragLayerProps {}

const CustomDragLayer: React.FC<CustomDragLayerProps> = (props) => {
  const {
    itemType,
    isDragging,
    item,
    initialOffset,
    currentOffset,
    clientOffset,
  } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
    clientOffset: monitor.getClientOffset(),
    isDragging: monitor.isDragging(),
  }));

  function renderItem() {
    switch (itemType) {
      case DragItemTypes.FILE:
        return (
          <FilesDragPreview /*entries={item.selectedEntries} path={item.path}*/
          />
        );
      case DragItemTypes.TAG:
        return <TagDragPreview tag={item.tag} />;

      default:
        return null;
    }
  }

  if (!isDragging) {
    return null;
  }
  // Render into document.body so position:fixed resolves against the viewport
  // rather than the nearest containing block. The Splitter panes use
  // `contain: layout paint` (and other panels apply CSS transforms), both of
  // which establish containing blocks for fixed descendants — without this
  // portal, the layer is confined to its ancestor pane and the drag preview
  // appears shifted right by the drawer width / other layout offsets.
  return createPortal(
    <div style={layerStyles}>
      <div style={getItemStyles(initialOffset, currentOffset, clientOffset)}>
        {renderItem()}
      </div>
    </div>,
    document.body,
  );
};

export default React.memo(CustomDragLayer);
