import * as React from 'react';
import { default as Measure, ContentRect } from 'react-measure';
import { DefaultSplitter } from './DefaultSplitter';
import { RenderSplitterProps } from './RenderSplitterProps';
// import './split.css';

type MeasuredDimensions = {
  height: number;
  width: number;
};

export type SplitMeasuredSizes = {
  /**
   * The measured size of the primary pane in pixels.
   */
  primary: number;
  /**
   * The measured size of the splitter in pixels.
   */
  splitter: number;
  /**
   * The measured size of the secondary pane in pixels.
   */
  secondary: number;
};

export type SplitProps = {
  /**
   * Add this attribute or set to true to create a top/bottom split.
   * Set to false to create a left|right split.
   */
  horizontal?: boolean;
  /**
   * The initial width/height of the left/top pane.
   * Width is specified as a CSS unit (e.g. %, fr, px).
   * The default is 50%.
   */
  initialPrimarySize?: string;
  /**
   * The preferred minimum width/height of the left/top pane.
   * Specified as a CSS unit (e.g. %, fr, px).
   * The default is 0.
   */
  minPrimarySize?: string;
  /**
   * The preferred minimum width/height of the right/bottom pane.
   * Specified as a CSS unit (e.g. %, fr, px).
   * The default is 0.
   */
  minSecondarySize?: string;
  /**
   * The width of the splitter between the panes.
   * Specified as a CSS unit (e.g. %, fr, px).
   * The default is 7px.
   */
  splitterSize?: string;
  /**
   * Render props for the splitter.
   * @param pixelSize The measured size of the splitter in pixels.
   * @param horizontal True if the splitter is horizontal (i.e. top/bottom); false otherwise.
   */
  renderSplitter?: (props: RenderSplitterProps) => React.ReactNode | undefined;
  /**
   * When true, if the user double clicks the splitter it will reset to its initial position.
   * The default is false.
   */
  resetOnDoubleClick?: boolean;
  /**
   * The colors to use for the default splitter.
   * Only used when renderSplitter is undefined;
   * The defaults are silver, gray, and black
   */
  defaultSplitterColors?: {
    color: string;
    hover: string;
    drag: string;
  };

  /**
   * Raised when the splitter moves to provide the primary size.
   * When the user has adjusted the splitter, this will be a percentage.
   * Otherwise, this will be the initialPrimarySize.
   */
  onSplitChanged?: (primarySize: string) => void;

  /**
   * Raised whenever the primary, splitter, or secondary measured sizes change.
   * These values are debounced at 500ms to prevent spamming this event.
   */
  onMeasuredSizesChanged?: (sizes: SplitMeasuredSizes) => void;

  percent: number | undefined;
  setPercent: (percent: number) => void;
  // hidePrimary?: (hide: boolean) => void;
};

export const Split = (props: React.PropsWithChildren<SplitProps>): JSX.Element => {
  const {
    horizontal = false,
    initialPrimarySize = '50%',
    minPrimarySize = '0px',
    minSecondarySize = '0px',
    splitterSize = '7px',
    renderSplitter,
    resetOnDoubleClick = false,
    defaultSplitterColors = {
      color: 'silver',
      hover: 'gray',
      drag: 'black',
    },
    onSplitChanged,
    onMeasuredSizesChanged,
    percent,
    setPercent
  } = props;

  const [contentMeasuredDimensions, setContentMeasuredDimensions] = React.useState<MeasuredDimensions>({
    height: 0,
    width: 0,
  });
  const [primaryMeasuredDimensions, setPrimaryMeasuredDimensions] = React.useState<MeasuredDimensions>({
    height: 0,
    width: 0,
  });
  const [splitterMeasuredDimensions, setSplitterMeasuredDimensions] = React.useState<MeasuredDimensions>({
    height: 0,
    width: 0,
  });

  const currentContentSize = React.useMemo(
    () => (horizontal ? contentMeasuredDimensions.height : contentMeasuredDimensions.width),
    [horizontal, contentMeasuredDimensions]
  );
  const currentPrimarySize = React.useMemo(
    () => (horizontal ? primaryMeasuredDimensions.height : primaryMeasuredDimensions.width),
    [horizontal, primaryMeasuredDimensions]
  );
  const currentSplitterSize = React.useMemo(
    () => (horizontal ? splitterMeasuredDimensions.height : splitterMeasuredDimensions.width),
    [horizontal, splitterMeasuredDimensions]
  );

  // const [percent, setPercent] = React.useState<number | undefined>(undefined);

  const [clientStart, setClientStart] = React.useState(0);
  const [primaryStart, setPrimaryStart] = React.useState(0);
  const [dragging, setDragging] = React.useState(false);

  React.useEffect(() => {
    if (onSplitChanged) {
      onSplitChanged(percent !== undefined ? `${percent}%` : initialPrimarySize);
    }
    /*if(hidePrimary) {
      if(hidePrimary) {
        setPercent(undefined);
      } else {
        setPercent(0);
      }
    }*/
  }, [percent, initialPrimarySize]);

  React.useEffect(() => {
    if (onMeasuredSizesChanged) {
      onMeasuredSizesChanged({
        primary: currentPrimarySize,
        splitter: currentSplitterSize,
        secondary: currentContentSize - (currentPrimarySize + currentSplitterSize),
      });
    }
  }, [horizontal, currentContentSize, currentPrimarySize, currentSplitterSize]);

  const onMeasureContent = (contentRect: ContentRect) => {
    contentRect.bounds &&
    setContentMeasuredDimensions({ height: contentRect.bounds.height, width: contentRect.bounds.width });
  };

  const onMeasurePrimary = (contentRect: ContentRect) => {
    contentRect.bounds &&
    setPrimaryMeasuredDimensions({ height: contentRect.bounds.height, width: contentRect.bounds.width });
  };

  const onMeasureSplitter = (contentRect: ContentRect) => {
    contentRect.bounds &&
    setSplitterMeasuredDimensions({ height: contentRect.bounds.height, width: contentRect.bounds.width });
  };

  const onSplitPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setClientStart(horizontal ? event.clientY : event.clientX);
    setPrimaryStart(currentPrimarySize);
    setDragging(true);
  };

  const onSplitPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      const position = horizontal ? event.clientY : event.clientX;
      const primarySize = primaryStart + (position - clientStart);
      const newPrimary = Math.max(0, Math.min(primarySize, currentContentSize));
      const newPercent = (newPrimary / currentContentSize) * 100;
      setPercent(newPercent);
    }
  };

  const onSplitPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.releasePointerCapture(event.pointerId);
    setDragging(false);
  };

  const onSplitDoubleClick = () => {
    resetOnDoubleClick && setPercent(undefined);
  };

  const children = React.Children.toArray(props.children);
  const primaryChild = children.length > 0 ? children[0] : <div />;
  const secondaryChild = children.length > 1 ? children[1] : <div />;

  const renderSizes = {
    primary: percent !== undefined ? `${percent}%` : initialPrimarySize,
    minPrimary: minPrimarySize ?? '0px',
    minSecondary: minSecondarySize ?? '0px',
  };

  const renderSplitterProps = {
    pixelSize: currentSplitterSize,
    horizontal,
    dragging: dragging,
  };

  const renderSplitVisual =
    renderSplitter ??
    (() => {
      return (
        <DefaultSplitter
          {...renderSplitterProps}
          color={dragging ? defaultSplitterColors.drag : defaultSplitterColors.color}
          hoverColor={dragging ? defaultSplitterColors.drag : defaultSplitterColors.hover}
        />
      );
    });

  const rootClassName = horizontal ? 'split-container horizontal' : 'split-container vertical';

  const rootStyle = {
    '--react-split-min-primary': renderSizes.minPrimary,
    '--react-split-min-secondary': renderSizes.minSecondary,
    '--react-split-primary': renderSizes.primary,
    '--react-split-splitter': splitterSize,
  } as React.CSSProperties;

  return (
    <Measure bounds onResize={onMeasureContent}>
      {({ measureRef: contentRef }) => (
        <div className="react-split" ref={contentRef}>
          <div className={rootClassName} style={rootStyle}>
            <div className="primary">
              <Measure bounds onResize={onMeasurePrimary}>
                {({ measureRef: primaryRef }) => (
                  <div className="full-content" ref={primaryRef}>
                    {primaryChild}
                  </div>
                )}
              </Measure>
            </div>
            <div
              className="splitter"
              tabIndex={-1}
              onPointerDown={onSplitPointerDown}
              onPointerUp={onSplitPointerUp}
              onPointerMove={onSplitPointerMove}
              onDoubleClick={onSplitDoubleClick}
            >
              <Measure bounds onResize={onMeasureSplitter}>
                {({ measureRef: splitterRef }) => (
                  <div className="full-content" ref={splitterRef}>
                    {renderSplitVisual(renderSplitterProps)}
                  </div>
                )}
              </Measure>
            </div>
            <div className="secondary">
              <div className="full-content">{secondaryChild}</div>
            </div>
          </div>
        </div>
      )}
    </Measure>
  );
};
