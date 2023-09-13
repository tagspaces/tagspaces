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

import React, { createContext, useMemo } from 'react';
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
};

export const SortedDirContext = createContext<SortedDirContextData>({
  sortedDirContent: undefined
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
    const settings = getSettings();
    const sortBy =
      settings && settings.sortBy ? settings.sortBy : defaultSettings.sortBy;
    const orderBy =
      settings && typeof settings.orderBy !== 'undefined'
        ? settings.orderBy
        : defaultSettings.orderBy;
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
    const sortedDirContent = !lastSearchTimestamp
      ? getSortedDirContent()
      : GlobalSearch.getInstance().getResults();
    return {
      sortedDirContent
    };
  }, [
    directoryContent,
    lastSearchTimestamp,
    directoryMeta,
    searchFilter,
    editedEntryPaths
  ]);

  return (
    <SortedDirContext.Provider value={context}>
      {children}
    </SortedDirContext.Provider>
  );
};
