/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2025-present TagSpaces GmbH
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

import SaveSearchDialog from '-/components/dialogs/SaveSearchDialog';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useSavedSearchesContext } from '-/hooks/useSavedSearchesContext';
import { getShowUnixHiddenEntries } from '-/reducers/settings';
import { TS } from '-/tagspaces.namespace';
import { mergeWithExtractedTags } from '@tagspaces/tagspaces-common/misc';
import React, {
  createContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { useSelector } from 'react-redux';

type SearchQueryContextData = {
  tempSearchQuery: TS.SearchQuery;
  setTempSearchQuery: (props: any, override?: boolean) => TS.SearchQuery;
  executeSearch: () => void;
  clearSearch: () => void;
  openSaveSearchDialog: (savedSearchUuid?: string) => void;
  closeSaveSearchDialog: () => void;
};

export const SearchQueryContext = createContext<SearchQueryContextData>({
  tempSearchQuery: undefined,
  setTempSearchQuery: undefined,
  executeSearch: undefined,
  clearSearch: undefined,
  openSaveSearchDialog: undefined,
  closeSaveSearchDialog: undefined,
});

export type SearchQueryContextProviderProps = {
  children: React.ReactNode;
};

export const SearchQueryContextProvider = ({
  children,
}: SearchQueryContextProviderProps) => {
  const {
    openCurrentDirectory,
    searchQuery,
    setSearchQuery,
    exitSearchMode,
    currentDirectoryPath,
  } = useDirectoryContentContext();
  const { searches } = useSavedSearchesContext();
  const tempSearchQuery = useRef<TS.SearchQuery>({ ...searchQuery });
  const showUnixHiddenEntries = useSelector(getShowUnixHiddenEntries);
  const [saveSearchDialogOpened, setSaveSearchDialogOpened] =
    useState<boolean>(false);
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  useEffect(() => {
    if (searchQuery && Object.keys(searchQuery).length > 0) {
      tempSearchQuery.current = { ...searchQuery };
    } else {
      tempSearchQuery.current = {};
    }
    forceUpdate();
  }, [searchQuery]);

  function setTempSearchQuery(props: any, override = false): TS.SearchQuery {
    if (override) {
      tempSearchQuery.current = props;
    } else {
      tempSearchQuery.current = {
        searchBoxing: 'location', // default
        //...searchQuery,
        ...tempSearchQuery.current,
        //executeSearch: false,
        ...props,
      };
    }
    forceUpdate();
    return tempSearchQuery.current;
  }

  function clearSearch() {
    openCurrentDirectory().then(() => {
      //tempSearchQuery.current = {}; //...searchQuery };
      setSearchQuery({});
      exitSearchMode();
    });
  }

  function executeSearch() {
    const tagsAND = mergeWithExtractedTags(
      tempSearchQuery.current.textQuery,
      tempSearchQuery.current.tagsAND,
      '+',
    );
    const tagsOR = mergeWithExtractedTags(
      tempSearchQuery.current.textQuery,
      tempSearchQuery.current.tagsOR,
      '|',
    );
    const tagsNOT = mergeWithExtractedTags(
      tempSearchQuery.current.textQuery,
      tempSearchQuery.current.tagsNOT,
      '-',
    );
    const query: TS.SearchQuery = {
      textQuery: tempSearchQuery.current.textQuery,
      tagsAND,
      tagsOR,
      tagsNOT,
      searchBoxing: tempSearchQuery.current.searchBoxing,
      searchType: tempSearchQuery.current.searchType,
      fileTypes: tempSearchQuery.current.fileTypes,
      lastModified: tempSearchQuery.current.lastModified,
      dateCreated: tempSearchQuery.current.dateCreated,
      fileSize: tempSearchQuery.current.fileSize,
      tagTimePeriodFrom: tempSearchQuery.current.tagTimePeriodFrom,
      tagTimePeriodTo: tempSearchQuery.current.tagTimePeriodTo,
      // tagPlaceRadius,
      maxSearchResults: tempSearchQuery.current.maxSearchResults,
      currentDirectory: currentDirectoryPath,
      forceIndexing: tempSearchQuery.current.forceIndexing,
      showUnixHiddenEntries,
      executeSearch: true,
    };
    console.log('Search object: ' + JSON.stringify(query));
    setSearchQuery(query);
  }

  function openSaveSearchDialog(savedSearchUuid: string = undefined) {
    if (savedSearchUuid) {
      const savedSearch: TS.SearchQuery = searches.find(
        (search) => search.uuid === savedSearchUuid,
      );
      if (savedSearch) {
        setTempSearchQuery({ ...savedSearch }, true);
      } else {
        setTempSearchQuery({ uuid: undefined });
        exitSearchMode(false);
      }
    } else {
      setTempSearchQuery({ uuid: undefined }, true);
      exitSearchMode(false);
    }
    setSaveSearchDialogOpened(true);
  }

  function closeSaveSearchDialog() {
    setSaveSearchDialogOpened(false);
  }

  const context = useMemo(() => {
    return {
      tempSearchQuery: tempSearchQuery.current,
      executeSearch: executeSearch,
      clearSearch: clearSearch,
      setTempSearchQuery: setTempSearchQuery,
      openSaveSearchDialog: openSaveSearchDialog,
      closeSaveSearchDialog: closeSaveSearchDialog,
    };
  }, [tempSearchQuery.current]);

  return (
    <SearchQueryContext.Provider value={context}>
      {children}
      <SaveSearchDialog
        open={saveSearchDialogOpened}
        onClose={() => {
          tempSearchQuery.current = {};
          setSaveSearchDialogOpened(false);
        }}
      />
    </SearchQueryContext.Provider>
  );
};
