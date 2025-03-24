/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License (version 3) as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import React, {
  createContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import { TS } from '-/tagspaces.namespace';
import {
  normalizePath,
  generateSharingLink,
} from '@tagspaces/tagspaces-common/paths';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { useEditedEntryContext } from '-/hooks/useEditedEntryContext';
import { getRelativeEntryPath, instanceId } from '-/services/utils-io';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useSelector } from 'react-redux';
import { defaultTitle } from '-/services/search';
import useFirstRender from '-/utils/useFirstRender';

export const historyKeys = {
  fileOpenKey: 'tsLastOpenedFilesHistory',
  folderOpenKey: 'tsLastOpenedFoldersHistory',
  fileEditKey: 'tsLastEditedFilesHistory',
  searchHistoryKey: 'tsSearchHistory',
};

export const HistoryContext = createContext<TS.HistoryContextData>({
  fileOpenHistory: undefined,
  folderOpenHistory: undefined,
  fileEditHistory: undefined,
  searchHistory: undefined,
  saveHistory: undefined,
  delAllHistory: undefined,
  delHistory: undefined,
  //openItem: undefined,
});

export type HistoryContextProviderProps = {
  children: React.ReactNode;
};

export const HistoryContextProvider = ({
  children,
}: HistoryContextProviderProps) => {
  const { actions } = useEditedEntryContext();
  const { findLocation } = useCurrentLocationContext();
  const { currentLocationPath, searchQuery, isSearchMode } =
    useDirectoryContentContext();
  const { openedEntry, openLink, openEntry } = useOpenedEntryContext();
  const fileOpenHistory = useRef<TS.HistoryItem[]>(
    getHistory(historyKeys.fileOpenKey),
  );
  const folderOpenHistory = useRef<TS.HistoryItem[]>(
    getHistory(historyKeys.folderOpenKey),
  );
  const fileEditHistory = useRef<TS.HistoryItem[]>(
    getHistory(historyKeys.fileEditKey),
  );
  const searchHistory = useRef<TS.HistoryItem[]>(
    getHistory(historyKeys.searchHistoryKey),
  );
  const fileOpenHistorySettings = useSelector(
    (state: any) => state.settings[historyKeys.fileOpenKey],
  );
  const folderOpenHistorySettings = useSelector(
    (state: any) => state.settings[historyKeys.folderOpenKey],
  );
  const fileEditHistorySettings = useSelector(
    (state: any) => state.settings[historyKeys.fileEditKey],
  );
  const searchHistoryKeySettings = useSelector(
    (state: any) => state.settings[historyKeys.searchHistoryKey],
  );
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);
  const firstRender = useFirstRender();
  const broadcast = new BroadcastChannel('history-sync');
  const currentLocation = findLocation();

  useEffect(() => {
    // Listen for messages from other tabs
    broadcast.onmessage = (event: MessageEvent) => {
      const action = event.data as TS.BroadcastMessage;
      if (instanceId !== action.uuid) {
        if (action.type === 'historyChanged') {
          reflectHistory(action.payload, getHistory(action.payload));
        }
      }
    };
  }, []);

  useEffect(() => {
    if (isSearchMode && currentLocation) {
      const searchTitle = defaultTitle(searchQuery);
      if (searchTitle.length > 0) {
        saveHistory(
          historyKeys.searchHistoryKey,
          {
            creationTimeStamp: new Date().getTime(),
            path:
              searchTitle +
              ' ' +
              (currentLocation.path
                ? currentLocation.path
                : currentLocation.name),
            url: '/',
            lid: currentLocation.uuid,
            searchQuery: searchQuery,
          },
          searchHistoryKeySettings,
        );
      }
    }
  }, [searchQuery]);

  useEffect(() => {
    if (openedEntry) {
      const relEntryPath = getRelativeEntryPath(
        currentLocationPath,
        openedEntry.path,
      );
      if (openedEntry.isFile) {
        saveHistory(
          historyKeys.fileOpenKey,
          {
            creationTimeStamp: new Date().getTime(),
            path: openedEntry.path,
            url: generateSharingLink(openedEntry.locationID, relEntryPath),
            lid: openedEntry.locationID,
          },
          fileOpenHistorySettings,
        );
      } else {
        saveHistory(
          historyKeys.folderOpenKey,
          {
            creationTimeStamp: new Date().getTime(),
            path: openedEntry.path,
            url: generateSharingLink(
              openedEntry.locationID,
              relEntryPath,
              relEntryPath,
            ),
            lid: openedEntry.locationID,
          },
          folderOpenHistorySettings,
        );
      }
    }
  }, [openedEntry]);

  useEffect(() => {
    if (!firstRender && actions && actions.length > 0) {
      for (const action of actions) {
        if (action.action === 'edit') {
          const relativePath = getRelativeEntryPath(
            currentLocationPath,
            action.entry.path,
          );
          saveHistory(
            historyKeys.fileEditKey,
            {
              creationTimeStamp: new Date().getTime(),
              path: relativePath,
              url: generateSharingLink(action.entry.locationID, relativePath),
              lid: action.entry.locationID,
            },
            fileEditHistorySettings,
          );
        }
      }
    }
  }, [actions]);

  function sendMessage(key: string) {
    const message: TS.BroadcastMessage = {
      uuid: instanceId,
      type: 'historyChanged',
      payload: key,
    };
    broadcast.postMessage(message);
  }

  /**
   * @param key
   * @param historyItem
   * @param limit if limit = 0 history is disabled
   */
  function saveHistory(
    key,
    historyItem: TS.HistoryItem,
    limit, // = SettingsDefault[key]
  ) {
    if (limit > 0) {
      let history: TS.HistoryItem[] = [];
      const file: TS.HistoryItem = {
        ...historyItem,
        path: normalizePath(historyItem.path),
        creationTimeStamp: new Date().getTime(),
      };
      const item = localStorage.getItem(key);
      if (item) {
        history = JSON.parse(item).filter((item) => item.path !== file.path);
        const historyLength = history.unshift(file);
        if (historyLength > limit) {
          history = history.slice(0, limit);
        }
      } else {
        history.push(file);
      }

      if (history && history.length > 0) {
        localStorage.setItem(key, JSON.stringify(history));
        reflectHistory(key, history);
        sendMessage(key);
      }
    }
  }

  function reflectHistory(key, items) {
    if (key === historyKeys.fileOpenKey) {
      fileOpenHistory.current = items;
    } else if (key === historyKeys.folderOpenKey) {
      folderOpenHistory.current = items;
    } else if (key === historyKeys.fileEditKey) {
      fileEditHistory.current = items;
    } else if (key === historyKeys.searchHistoryKey) {
      searchHistory.current = items;
    }
    forceUpdate();
  }

  function getHistory(key): Array<TS.HistoryItem> {
    const item = localStorage.getItem(key);
    if (item) {
      return JSON.parse(item);
    }
    return undefined;
  }

  function delAllHistory(key) {
    localStorage.removeItem(key);
    reflectHistory(key, []);
    sendMessage(key);
  }

  function delHistory(key, creationTimeStamp) {
    const item = localStorage.getItem(key);
    if (item) {
      const items = JSON.parse(item);
      const history = items.filter(
        (item) => item.creationTimeStamp !== creationTimeStamp,
      );
      localStorage.setItem(key, JSON.stringify(history));
      reflectHistory(key, history);
      sendMessage(key);
    }
  }

  /*function openItem(item: TS.HistoryItem) {
    if (item.url) {
      openLink(item.url, { fullWidth: false });
    } else {
      if (item.lid !== currentLocation.uuid) {
        openLocationById(item.lid);
      }
      openEntry(item.path);
    }
  }*/

  /*function delItem(item: TS.HistoryItem, key: string) {
    /!*if (key === bookmarksKey) {
      delBookmark(item.path);
    } else {*!/
    delHistory(key, item.creationTimeStamp);
    //}
  }*/

  const context = useMemo(() => {
    return {
      fileOpenHistory: fileOpenHistory.current,
      folderOpenHistory: folderOpenHistory.current,
      fileEditHistory: fileEditHistory.current,
      searchHistory: searchHistory.current,
      saveHistory,
      delAllHistory,
      delHistory,
      //openItem,
    };
  }, [
    fileOpenHistory.current,
    folderOpenHistory.current,
    fileEditHistory.current,
    searchHistory.current,
    currentLocation,
  ]);

  return (
    <HistoryContext.Provider value={context}>
      {children}
    </HistoryContext.Provider>
  );
};
