/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces UG (haftungsbeschraenkt)
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

import React, { createContext, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  getEditedEntryPaths,
  getLastSearchTimestamp,
  getSearchFilter
} from '-/reducers/app';
import { TS } from '-/tagspaces.namespace';
import GlobalSearch from '-/services/search-index';
import { sortByCriteria } from '@tagspaces/tagspaces-common/misc';
import { Pro } from '-/pro';
import { PerspectiveIDs } from '-/perspectives';
import { defaultSettings } from '-/perspectives/grid-perspective';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';

type SortedDirContextData = {
  sortedDirContent: TS.FileSystemEntry[];
  getSettings: (perspective?: string) => TS.FolderSettings;
  sortBy: string;
  orderBy: null | boolean;
  setSortBy: (sort: string) => void;
  setOrderBy: (isAsc: null | boolean) => void;
};

export const SortedDirContext = createContext<SortedDirContextData>({
  sortedDirContent: undefined,
  getSettings: () => undefined,
  sortBy: defaultSettings.sortBy,
  orderBy: defaultSettings.orderBy,
  setSortBy: () => {},
  setOrderBy: () => {}
});

export type SortedDirContextProviderProps = {
  children: React.ReactNode;
};

export const SortedDirContextProvider = ({
  children
}: SortedDirContextProviderProps) => {
  const {
    currentDirectoryEntries,
    directoryMeta
  } = useDirectoryContentContext();
  const lastSearchTimestamp = useSelector(getLastSearchTimestamp);
  const searchFilter: string = useSelector(getSearchFilter);
  /*const editedEntryPaths: Array<TS.EditedEntryPath> = useSelector(
    getEditedEntryPaths
  );*/
  const settings = getSettings();
  const [sortBy, setSortBy] = useState<string>(
    settings && settings.sortBy ? settings.sortBy : defaultSettings.sortBy
  );
  const [orderBy, setOrderBy] = useState<null | boolean>(
    settings && typeof settings.orderBy !== 'undefined'
      ? settings.orderBy
      : defaultSettings.orderBy
  );

  function getSettings(perspective = PerspectiveIDs.GRID): TS.FolderSettings {
    if (
      Pro &&
      directoryMeta &&
      directoryMeta.perspectiveSettings &&
      directoryMeta.perspectiveSettings[perspective]
    ) {
      return directoryMeta.perspectiveSettings[perspective];
    } else {
      // loading settings for not Pro
      return JSON.parse(localStorage.getItem(defaultSettings.settingsKey));
    }
  }

  const sortedDirContent = useMemo(() => {
    if (searchFilter) {
      if (lastSearchTimestamp) {
        return GlobalSearch.getInstance()
          .getResults()
          .filter(entry =>
            entry.name.toLowerCase().includes(searchFilter.toLowerCase())
          );
      } else {
        return sortByCriteria(
          currentDirectoryEntries,
          sortBy,
          orderBy
        ).filter(entry =>
          entry.name.toLowerCase().includes(searchFilter.toLowerCase())
        );
      }
    }
    if (lastSearchTimestamp) {
      if (sortBy === 'byRelevance') {
        // initial search results is sorted by relevance
        if (orderBy) {
          return GlobalSearch.getInstance().getResults();
        } else {
          return [...GlobalSearch.getInstance().getResults()].reverse();
        }
      } else {
        return sortByCriteria(
          GlobalSearch.getInstance().getResults(),
          sortBy,
          orderBy
        );
      }
    }
    // not in search mode
    return sortByCriteria(currentDirectoryEntries, sortBy, orderBy);
  }, [
    currentDirectoryEntries,
    lastSearchTimestamp,
    searchFilter,
    sortBy,
    orderBy
  ]);

  const context = useMemo(() => {
    return {
      sortedDirContent,
      getSettings,
      sortBy,
      orderBy,
      setSortBy,
      setOrderBy
    };
  }, [
    sortedDirContent,
    directoryMeta
    // editedEntryPaths,
  ]);

  return (
    <SortedDirContext.Provider value={context}>
      {children}
    </SortedDirContext.Provider>
  );
};
