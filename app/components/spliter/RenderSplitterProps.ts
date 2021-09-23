/**
 * Props for the renderSplitter callback in Split
 */
export type RenderSplitterProps = {
  /**
   * The measured size of the splitter in pixels.
   */
  pixelSize: number;
  /**
   * True if the splitter is horizontal (i.e. top/bottom); false otherwise.
   */
  horizontal: boolean;
  /**
   * True if the user is currently dragging the splitter; false otherwise.
   */
  dragging: boolean;
};
