/*
Copyright (c) 2024-present The TagSpaces GmbH. All rights reserved.
*/

import React, { createContext, useEffect, useReducer, useRef } from 'react';
import { TS } from '-/tagspaces.namespace';
import { generateSharingLink } from '@tagspaces/tagspaces-common/paths';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { getRelativeEntryPath } from '-/services/utils-io';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import AppConfig from '-/AppConfig';
import { FixedSizeArray } from '-/services/FixedSizeArray';

type BrowserHistoryContextData = {
  historyIndex: number;
  canGoBack: boolean;
  canGoForward: boolean;
  goBack: () => void;
  goForward: () => void;
  openHistoryItem: (item: TS.HistoryItem) => void;
};

export const BrowserHistoryContext = createContext<BrowserHistoryContextData>({
  historyIndex: undefined,
  canGoBack: false,
  canGoForward: false,
  goBack: undefined,
  goForward: undefined,
  openHistoryItem: undefined,
});

export type BrowserHistoryContextProviderProps = {
  children: React.ReactNode;
};

export const BrowserHistoryContextProvider = ({
  children,
}: BrowserHistoryContextProviderProps) => {
  const { currentLocationId, findLocation, openLocationById } =
    useCurrentLocationContext();
  const { openedEntry, openLink, openEntry } = useOpenedEntryContext();
  const { currentLocationPath, currentDirectoryPath } =
    useDirectoryContentContext();
  const history = useRef<FixedSizeArray<TS.HistoryItem>>(
    new FixedSizeArray<TS.HistoryItem>(50),
  );
  const historyIndex = useRef<number>(0);
  const isNavigating = useRef<boolean>(false);
  const goBackRef = useRef<(() => void) | null>(null);
  const goForwardRef = useRef<(() => void) | null>(null);
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);
  const currentLocation = findLocation();

  useEffect(() => {
    goBackRef.current = goBack;
    goForwardRef.current = goForward;
  });

  useEffect(() => {
    if (AppConfig.isElectron) {
      window.electronIO.ipcRenderer.on('history', (arg) => {
        if (arg === 'go-back') {
          goBackRef.current?.();
        } else if (arg === 'go-forward') {
          goForwardRef.current?.();
        }
      });

      return () => {
        if (window.electronIO.ipcRenderer) {
          window.electronIO.ipcRenderer.removeAllListeners('history');
        }
      };
    }
  }, []);

  useEffect(() => {
    if (openedEntry) {
      const relEntryPath = getRelativeEntryPath(
        currentLocationPath,
        openedEntry.path,
      );
      if (openedEntry.isFile) {
        addHistory(
          openedEntry.path,
          generateSharingLink(openedEntry.locationID, relEntryPath),
          openedEntry.locationID,
        );
      } else {
        addHistory(
          openedEntry.path,
          generateSharingLink(
            openedEntry.locationID,
            relEntryPath,
            relEntryPath,
          ),
          openedEntry.locationID,
        );
      }
    }
  }, [openedEntry]);

  useEffect(() => {
    if (
      currentLocation &&
      currentDirectoryPath &&
      currentLocation.path !== currentDirectoryPath
    ) {
      const relEntryPath = getRelativeEntryPath(
        currentLocationPath,
        currentDirectoryPath,
      );
      addHistory(
        currentDirectoryPath,
        generateSharingLink(currentLocationId, relEntryPath, relEntryPath),
        currentLocationId,
      );
    }
  }, [currentDirectoryPath]);

  function addHistory(path, url, lid) {
    if (isNavigating.current) return;
    const lastItem = lastHistoryItem();
    if (!lastItem || lastItem.path !== path) {
      const sliced = history.current.slice(0, historyIndex.current + 1);
      //const filtered = sliced.filter((item) => item.path !== path); // unique history items
      history.current.setArray([...sliced, { path, url, lid }]);
      historyIndex.current = history.current.getArray().length - 1;
      forceUpdate();
    }
  }

  function lastHistoryItem() {
    return history.current.get(historyIndex.current);
  }

  function goBack() {
    if (historyIndex.current > 0) {
      isNavigating.current = true;
      historyIndex.current = historyIndex.current - 1;
      const item = lastHistoryItem();
      if (item) {
        openHistoryItem(item);
      }
      forceUpdate();
      setTimeout(() => {
        isNavigating.current = false;
      }, 300);
    }
  }

  function goForward() {
    if (historyIndex.current < history.current.getArray().length - 1) {
      isNavigating.current = true;
      historyIndex.current = historyIndex.current + 1;
      const item = lastHistoryItem();
      if (item) {
        openHistoryItem(item);
      }
      forceUpdate();
      setTimeout(() => {
        isNavigating.current = false;
      }, 300);
    }
  }

  function openHistoryItem(item: TS.HistoryItem) {
    if (item.url) {
      openLink(item.url, { fullWidth: false });
    } else {
      if (item.lid !== currentLocationId) {
        openLocationById(item.lid);
      }
      openEntry(item.path);
    }
  }

  const context = {
    historyIndex: historyIndex.current,
    canGoBack: historyIndex.current > 0,
    canGoForward: historyIndex.current < history.current.getArray().length - 1,
    goBack,
    goForward,
    openHistoryItem,
  };

  return (
    <BrowserHistoryContext.Provider value={context}>
      {children}
    </BrowserHistoryContext.Provider>
  );
};
