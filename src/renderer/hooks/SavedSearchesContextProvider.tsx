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
import { instanceId } from '-/services/utils-io';
import { useSelector } from 'react-redux';
import { getSearches } from '-/reducers/searches';

type SavedSearchesContextData = {
  searches: TS.SearchQuery[];
  addSearch: (newSearch: TS.SearchQuery) => void;
  editSearch: (newSearch: TS.SearchQuery) => void;
  addSearches: (newSearches: TS.SearchQuery[]) => void;
  delAllSearches: () => void;
  removeSearch: (uuid: string) => void;
};

export const SavedSearchesContext = createContext<SavedSearchesContextData>({
  searches: undefined,
  addSearch: undefined,
  editSearch: undefined,
  addSearches: undefined,
  delAllSearches: undefined,
  removeSearch: undefined,
});

export type SavedSearchesContextProviderProps = {
  children: React.ReactNode;
};

export const SavedSearchesContextProvider = ({
  children,
}: SavedSearchesContextProviderProps) => {
  const searchesKey = 'tsSavedSearches';
  const reduxSearches = useSelector(getSearches);
  const searches = useRef<TS.SearchQuery[]>(getAllSearches());
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);
  const broadcast = new BroadcastChannel('searches-sync');

  useEffect(() => {
    // Listen for messages from other tabs
    broadcast.onmessage = (event: MessageEvent) => {
      const action = event.data as TS.BroadcastMessage;
      if (instanceId !== action.uuid) {
        if (action.type === 'searchesChanged') {
          searches.current = getAllSearches();
          forceUpdate();
        }
      }
    };
  }, []);

  function sendMessage() {
    const message: TS.BroadcastMessage = {
      uuid: instanceId,
      type: 'searchesChanged',
    };
    broadcast.postMessage(message);
  }

  function getAllSearches(): TS.SearchQuery[] {
    const item = localStorage.getItem(searchesKey);
    if (item) {
      return JSON.parse(item);
    }
    if (reduxSearches.length > 0) {
      //import from redux
      localStorage.setItem(searchesKey, JSON.stringify(reduxSearches));
    }
    return reduxSearches;
    //return [];
  }

  function addSearch(newSearch: TS.SearchQuery) {
    if (searches.current) {
      searches.current = searches.current.filter(
        (item) => item.uuid !== newSearch.uuid,
      );
      searches.current.unshift(newSearch);
    } else {
      searches.current.push(newSearch);
    }

    localStorage.setItem(searchesKey, JSON.stringify(searches.current));
    sendMessage();
    forceUpdate();
  }

  function addSearches(newSearches: TS.SearchQuery[]) {
    if (searches.current) {
      searches.current = searches.current.filter((item) =>
        newSearches.some((newItem) => newItem.uuid === item.uuid),
      );
      searches.current.unshift(...newSearches);
    } else {
      searches.current.push(...newSearches);
    }

    localStorage.setItem(searchesKey, JSON.stringify(searches.current));
    sendMessage();
    forceUpdate();
  }

  function editSearch(newSearch: TS.SearchQuery) {
    searches.current = searches.current.map((item) =>
      newSearch.uuid === item.uuid ? newSearch : item,
    );

    localStorage.setItem(searchesKey, JSON.stringify(searches.current));
    sendMessage();
    forceUpdate();
  }

  function delAllSearches() {
    localStorage.removeItem(searchesKey);
    searches.current = [];
    sendMessage();
    forceUpdate();
  }

  function removeSearch(uuid: string) {
    if (searches.current) {
      searches.current = searches.current.filter((item) => item.uuid !== uuid);
      localStorage.setItem(searchesKey, JSON.stringify(searches.current));
      sendMessage();
      forceUpdate();
    }
  }

  const context = useMemo(() => {
    return {
      searches: searches.current,
      addSearch,
      addSearches,
      editSearch,
      delAllSearches,
      removeSearch,
    };
  }, [searches.current]);

  return (
    <SavedSearchesContext.Provider value={context}>
      {children}
    </SavedSearchesContext.Provider>
  );
};
