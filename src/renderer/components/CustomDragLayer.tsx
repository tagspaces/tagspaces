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
  // Render into document.body so position:fixed is anchored to the viewport,
  // not to a transformed ancestor (e.g. the MobileNavigation drawer or other
  // panels using CSS transforms). Without the portal, the layer is confined
  // to its containing block and the chip appears offset / duplicated when
  // multiple instances of CustomDragLayer are mounted in different subtrees.
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
