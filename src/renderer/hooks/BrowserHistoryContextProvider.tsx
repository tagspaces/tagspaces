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
  goBack: () => void;
  goForward: () => void;
  openHistoryItem: (item: TS.HistoryItem) => void;
};

export const BrowserHistoryContext = createContext<BrowserHistoryContextData>({
  historyIndex: undefined,
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
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);
  const currentLocation = findLocation();

  useEffect(() => {
    if (AppConfig.isElectron) {
      window.electronIO.ipcRenderer.on('history', (arg) => {
        if (arg === 'go-back') {
          goBack();
        } else if (arg === 'go-forward') {
          goForward();
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
    const lastItem = lastHistoryItem();
    if (!lastItem || lastItem.path !== path) {
      const sliced = history.current.slice(0, historyIndex.current + 1);
      //const filtered = sliced.filter((item) => item.path !== path); // unique history items
      history.current.setArray([...sliced, { path, url, lid }]);
      historyIndex.current = history.current.getArray().length - 1;
      forceUpdate();
    }
  }

  /*function haveHistory() {
    return historyIndex.current > 0;
  }*/

  function lastHistoryItem() {
    return history.current.get(historyIndex.current);
  }

  function goBack() {
    if (historyIndex.current > 0) {
      historyIndex.current = historyIndex.current - 1;
      const lastItem = lastHistoryItem();
      //const filtered = history.current.filter((item) => item.path !== lastItem.path);
      //history.current = [...filtered, lastItem];
      openHistoryItem(lastItem);
      forceUpdate();
    }
  }

  function goForward() {
    if (historyIndex.current < history.current.getArray().length) {
      historyIndex.current = historyIndex.current + 1;
      const lastItem = lastHistoryItem();
      //const filtered = history.current.filter((item) => item.path !== lastItem.path);
      //history.current = [...filtered, lastItem];
      openHistoryItem(lastItem);
      forceUpdate();
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
