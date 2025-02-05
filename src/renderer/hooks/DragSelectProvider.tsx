import React, { createContext, useState, useEffect, useContext } from 'react';
import DragSelect, { DSInputElement } from 'dragselect';
export type dropZones = ConstructorParameters<
  typeof DragSelect
>[0]['dropZones'];
/*export type CallbackObject = {
  /!**
   * The items currently selected
   *!/
  items?: Array<HTMLElement | SVGElement | any>
  /!**
   * The respective event object
   *!/
  event?: MouseEvent | TouchEvent | PointerEvent | KeyboardEvent | Event
  /!**
   * The single item currently interacted with
   *!/
  item?: HTMLElement | SVGElement | any
  /!**
   * Whether the interaction is a drag or a select
   *!/
  isDragging?: boolean
  /!**
   * Whether or not the drag interaction is via keyboard
   *!/
  isDraggingKeyboard?: boolean
  /!**
   * Pressed key (lowercase)
   *!/
  key?: string
  /!**
   * the settings being updates/manipulated/passed, also holds the previous value. i.e. updating selectorClass will publish { settings: { selectorClass: 'newVal', 'selectorClass:pre': 'oldVal' } }
   *!/
  settings?: Settings
  scroll_directions?: Array<'top' | 'bottom' | 'left' | 'right' | undefined>
  scroll_multiplier?: number
  /!**
   * The dropZone element that the element was dropped into (or the mouse is currently hovering over)
   *!/
  dropTarget?: DSDropZone
}*/

type ProviderProps = {
  children: React.ReactNode;
  settings?: ConstructorParameters<typeof DragSelect<DSInputElement>>[0];
};

const Context = createContext<DragSelect<DSInputElement> | undefined>(
  undefined,
);

function DragSelectProvider({ children, settings = {} }: ProviderProps) {
  const [ds, setDS] = useState<DragSelect<DSInputElement>>();

  useEffect(() => {
    setDS((prevState) => {
      if (prevState) return prevState;
      return new DragSelect({});
    });
    return () => {
      if (ds) {
        ds.stop();
        setDS(undefined);
      }
    };
  }, [ds]);

  useEffect(() => {
    ds?.setSettings(settings);
  }, [ds, settings]);

  return <Context.Provider value={ds}>{children}</Context.Provider>;
}

function useDragSelect() {
  const context = useContext(Context);
  return context;
}

export { DragSelectProvider, useDragSelect };
