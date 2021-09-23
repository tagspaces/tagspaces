import * as React from 'react';
import { RenderSplitterProps } from './RenderSplitterProps';

const getThinLineSize = (size: number) => `${size % 2 === 0 ? 2 : 3}px`;
const getCenteredMargin = (size: number) => `${Math.max(0, Math.floor(size / 2) - 1)}px`;

type Props = RenderSplitterProps & {
  color?: string;
  hoverColor?: string;
  dragColor?: string;
};

/**
 * The default splitter which provides a thin line within a larger mouse hit area.
 */
export const DefaultSplitter = (props: Props) => {
  const { dragging, pixelSize, color = 'silver', hoverColor = 'gray', dragColor = 'black' } = props;

  const cssProperties = {
    '--default-splitter-line-margin': getCenteredMargin(pixelSize),
    '--default-splitter-line-size': getThinLineSize(pixelSize),
    '--default-splitter-line-color': dragging ? dragColor : color,
    '--default-splitter-line-hover-color': dragging ? dragColor : hoverColor,
  } as React.CSSProperties;

  return (
    <div className="default-splitter" style={cssProperties}>
      <div className="line" />
    </div>
  );
};
