/*
Copyright (c) 2024-present The TagSpaces UG (Haftungsbeschraenkt). All rights reserved.
*/

import React, {
  createContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import { TS } from '-/tagspaces.namespace';
import { generateSharingLink } from '@tagspaces/tagspaces-common/paths';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { getRelativeEntryPath } from '-/services/utils-io';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import AppConfig from '-/AppConfig';

type BrowserHistoryContextData = {
  haveHistory: () => boolean;
  goBack: () => void;
  goForward: () => void;
};

export const BrowserHistoryContext = createContext<BrowserHistoryContextData>({
  haveHistory: undefined,
  goBack: undefined,
  goForward: undefined,
});

export type BrowserHistoryContextProviderProps = {
  children: React.ReactNode;
};

export const BrowserHistoryContextProvider = ({
  children,
}: BrowserHistoryContextProviderProps) => {
  const { currentLocation, openLocationById } = useCurrentLocationContext();
  const { openedEntry, openLink, openEntry } = useOpenedEntryContext();
  const { currentLocationPath, currentDirectoryPath } =
    useDirectoryContentContext();
  const history = useRef<TS.HistoryItem[]>([]);
  const historyIndex = useRef<number>(0);
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

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
    if (currentLocation && currentDirectoryPath) {
      const relEntryPath = getRelativeEntryPath(
        currentLocationPath,
        currentDirectoryPath,
      );
      addHistory(
        currentDirectoryPath,
        generateSharingLink(currentLocation.uuid, relEntryPath, relEntryPath),
        currentLocation.uuid,
      );
    }
  }, [currentDirectoryPath]);

  function addHistory(path, url, lid) {
    const lastItem = lastHistoryItem();
    if (!lastItem || lastItem.path !== path) {
      const sliced = history.current.slice(0, historyIndex.current + 1);
      const filtered = sliced.filter((item) => item.path !== path);
      history.current = [...filtered, { path, url, lid }];
      historyIndex.current = history.current.length - 1;
      forceUpdate();
    }
  }

  function haveHistory() {
    return historyIndex.current > 0;
  }

  function lastHistoryItem() {
    return history.current[historyIndex.current];
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
    if (historyIndex.current < history.current.length) {
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
      if (item.lid !== currentLocation.uuid) {
        openLocationById(item.lid);
      }
      openEntry(item.path);
    }
  }

  const context = {
    haveHistory,
    goBack,
    goForward,
  };

  return (
    <BrowserHistoryContext.Provider value={context}>
      {children}
    </BrowserHistoryContext.Provider>
  );
};
