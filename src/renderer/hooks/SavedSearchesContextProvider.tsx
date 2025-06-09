/*
Copyright (c) 2024-present The TagSpaces GmbH. All rights reserved.
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
import { getTagColors } from '-/services/taglibrary-utils';
import {
  getShowUnixHiddenEntries,
  getTagColor,
  getTagTextColor,
} from '-/reducers/settings';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useEditedTagLibraryContext } from '-/hooks/useEditedTagLibraryContext';

type SavedSearchesContextData = {
  searches: TS.SearchQuery[];
  addSearch: (newSearch: TS.SearchQuery) => void;
  editSearch: (newSearch: TS.SearchQuery) => void;
  addSearches: (newSearches: TS.SearchQuery[]) => void;
  delAllSearches: () => void;
  removeSearch: (uuid: string) => void;
  findFromSavedSearch: (uuid: string) => void;
};

export const SavedSearchesContext = createContext<SavedSearchesContextData>({
  searches: undefined,
  addSearch: undefined,
  editSearch: undefined,
  addSearches: undefined,
  delAllSearches: undefined,
  removeSearch: undefined,
  findFromSavedSearch: undefined,
});

export type SavedSearchesContextProviderProps = {
  children: React.ReactNode;
};

export const SavedSearchesContextProvider = ({
  children,
}: SavedSearchesContextProviderProps) => {
  const searchesKey = 'tsSavedSearches';
  const { setSearchQuery } = useDirectoryContentContext();
  const { tagGroups } = useEditedTagLibraryContext();
  const reduxSearches = useSelector(getSearches);
  const defaultBackgroundColor = useSelector(getTagColor);
  const defaultTextColor = useSelector(getTagTextColor);
  const showUnixHiddenEntries = useSelector(getShowUnixHiddenEntries);
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
    if (searches.current && uuid) {
      searches.current = searches.current.filter((item) => item.uuid !== uuid);
      localStorage.setItem(searchesKey, JSON.stringify(searches.current));
      sendMessage();
      forceUpdate();
    }
  }

  function updateTagColors(tags: TS.Tag[]) {
    return tags.map((tag) => {
      const tagColors = getTagColors(
        tag.title,
        tagGroups,
        defaultTextColor,
        defaultBackgroundColor,
      );
      return {
        ...tag,
        ...tagColors,
      };
    });
  }

  function findFromSavedSearch(uuid: string) {
    const savedSearch = searches.current.find((search) => search.uuid === uuid);
    if (!savedSearch) {
      return true;
    }

    setSearchQuery({
      ...savedSearch,
      ...(savedSearch.tagsAND && {
        tagsAND: updateTagColors(savedSearch.tagsAND),
      }),
      ...(savedSearch.tagsNOT && {
        tagsNOT: updateTagColors(savedSearch.tagsNOT),
      }),
      ...(savedSearch.tagsOR && {
        tagsOR: updateTagColors(savedSearch.tagsOR),
      }),
      showUnixHiddenEntries,
      executeSearch: true,
    });
  }

  const context = useMemo(() => {
    return {
      searches: searches.current,
      addSearch,
      addSearches,
      editSearch,
      delAllSearches,
      removeSearch,
      findFromSavedSearch,
    };
  }, [searches.current]);

  return (
    <SavedSearchesContext.Provider value={context}>
      {children}
    </SavedSearchesContext.Provider>
  );
};
