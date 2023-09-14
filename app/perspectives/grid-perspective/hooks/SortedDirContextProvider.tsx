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
  getDirectoryContent,
  getDirectoryMeta,
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

type SortedDirContextData = {
  sortedDirContent: Array<TS.FileSystemEntry>;
  sortBy: string;
  orderBy: null | boolean;
  setSortBy: (sort: string) => void;
  setOrderBy: (isAsc: null | boolean) => void;
};

export const SortedDirContext = createContext<SortedDirContextData>({
  sortedDirContent: undefined,
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
  const directoryContent: Array<TS.FileSystemEntry> = useSelector(
    getDirectoryContent
  );
  const lastSearchTimestamp = useSelector(getLastSearchTimestamp);
  const searchFilter: string = useSelector(getSearchFilter);
  const directoryMeta: TS.FileSystemEntryMeta = useSelector(getDirectoryMeta);
  const editedEntryPaths: Array<TS.EditedEntryPath> = useSelector(
    getEditedEntryPaths
  );
  const settings = getSettings();
  const [sortBy, setSortBy] = useState<string>(
    settings && settings.sortBy ? settings.sortBy : defaultSettings.sortBy
  );
  const [orderBy, setOrderBy] = useState<null | boolean>(
    settings && typeof settings.orderBy !== 'undefined'
      ? settings.orderBy
      : defaultSettings.orderBy
  );

  function getSettings(): TS.FolderSettings {
    if (
      Pro &&
      directoryMeta &&
      directoryMeta.perspectiveSettings &&
      directoryMeta.perspectiveSettings[PerspectiveIDs.GRID]
    ) {
      return directoryMeta.perspectiveSettings[PerspectiveIDs.GRID];
    } else {
      // loading settings for not Pro
      return JSON.parse(localStorage.getItem(defaultSettings.settingsKey));
    }
  }

  function getSortedDirContent() {
    if (!lastSearchTimestamp) {
      // not in search mode
      return sortByCriteria(directoryContent, sortBy, orderBy);
    } else {
      if (sortBy === 'byRelevance') {
        // initial search results is sorted by relevance
        if (orderBy) {
          return GlobalSearch.getInstance().getResults();
        } else {
          return [...GlobalSearch.getInstance().getResults()].reverse();
        }
      } else {
        return sortByCriteria(
          searchFilter
            ? GlobalSearch.getInstance()
                .getResults()
                .filter(entry =>
                  entry.name.toLowerCase().includes(searchFilter.toLowerCase())
                )
            : GlobalSearch.getInstance().getResults(),
          sortBy,
          orderBy
        );
      }
    }
  }

  const context = useMemo(() => {
    return {
      sortedDirContent: getSortedDirContent(),
      sortBy,
      orderBy,
      setSortBy,
      setOrderBy
    };
  }, [
    directoryContent,
    lastSearchTimestamp,
    directoryMeta,
    searchFilter,
    editedEntryPaths,
    sortBy,
    orderBy
  ]);

  return (
    <SortedDirContext.Provider value={context}>
      {children}
    </SortedDirContext.Provider>
  );
};
