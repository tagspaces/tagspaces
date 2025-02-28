/*
Copyright (c) 2024-present The TagSpaces GmbH. All rights reserved.
*/

import React, { createContext, useCallback, useMemo, useState } from 'react';

import fscreen from 'fscreen';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';

type FullScreenContextData = {
  isFullscreen: boolean;
  setFullscreen: (fullScreen: boolean) => void;
  toggleFullScreen: (element: HTMLDivElement) => void;
};

export const FullScreenContext = createContext<FullScreenContextData>({
  isFullscreen: undefined,
  setFullscreen: undefined,
  toggleFullScreen: undefined,
});

export type FullScreenContextProviderProps = {
  children: React.ReactNode;
};

export const FullScreenContextProvider = ({
  children,
}: FullScreenContextProviderProps) => {
  const { openedEntry } = useOpenedEntryContext();
  const [isFullscreen, setFullscreen] = useState<boolean>(false);

  const toggleFullScreen = useCallback(
    (element: HTMLDivElement) => {
      if (openedEntry.isFile) {
        if (isFullscreen) {
          fscreen.exitFullscreen();
        } else {
          fscreen.requestFullscreen(element); //fileViewerContainer.current);
        }
      }
    },
    [isFullscreen],
  );

  const context = useMemo(() => {
    return {
      isFullscreen,
      setFullscreen,
      toggleFullScreen,
    };
  }, [isFullscreen]);

  return (
    <FullScreenContext.Provider value={context}>
      {children}
    </FullScreenContext.Provider>
  );
};
