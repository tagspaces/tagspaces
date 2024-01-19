/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2024-present TagSpaces UG (haftungsbeschraenkt)
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
import { getSearchFilter } from '-/reducers/app';
import { TS } from '-/tagspaces.namespace';
import { sortByCriteria } from '@tagspaces/tagspaces-common/misc';
import { Pro } from '-/pro';
import { PerspectiveIDs } from '-/perspectives';
import { defaultSettings } from '-/perspectives/grid-perspective';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';

type SortedDirContextData = {
  sortedDirContent: TS.FileSystemEntry[];
  settings: TS.FolderSettings;
  sortBy: string;
  orderBy: null | boolean;
  setSortBy: (sort: string) => void;
  setOrderBy: (isAsc: null | boolean) => void;
};

export const SortedDirContext = createContext<SortedDirContextData>({
  sortedDirContent: undefined,
  settings: undefined,
  sortBy: undefined,
  orderBy: undefined,
  setSortBy: () => {},
  setOrderBy: () => {},
});

export type SortedDirContextProviderProps = {
  children: React.ReactNode;
};

export const SortedDirContextProvider = ({
  children,
}: SortedDirContextProviderProps) => {
  const {
    currentDirectoryEntries,
    directoryMeta,
    currentDirectoryPerspective,
  } = useDirectoryContentContext();
  const searchFilter: string = useSelector(getSearchFilter);

  const settings: TS.FolderSettings = useMemo(() => {
    return getSettings(directoryMeta, currentDirectoryPerspective);
  }, [directoryMeta, currentDirectoryPerspective]);

  const [sortBy, setSortBy] = useState<string>(
    settings && settings.sortBy ? settings.sortBy : defaultSettings.sortBy,
  );
  const [orderBy, setOrderBy] = useState<null | boolean>(
    settings && typeof settings.orderBy !== 'undefined'
      ? settings.orderBy
      : defaultSettings.orderBy,
  );

  function getSettings(
    meta,
    perspective = PerspectiveIDs.GRID,
  ): TS.FolderSettings {
    if (perspective === PerspectiveIDs.UNSPECIFIED) {
      perspective = PerspectiveIDs.GRID;
    }
    if (
      Pro &&
      meta &&
      meta.perspectiveSettings &&
      meta.perspectiveSettings[perspective]
    ) {
      return meta.perspectiveSettings[perspective];
    } else {
      // loading settings for not Pro
      return JSON.parse(localStorage.getItem(defaultSettings.settingsKey));
    }
  }

  const sortedDirContent = useMemo(() => {
    if (searchFilter) {
      /*if (lastSearchTimestamp) {
        return GlobalSearch.getInstance()
          .getResults()
          .filter(entry =>
            entry.name.toLowerCase().includes(searchFilter.toLowerCase())
          );
      } else {*/
      return sortByCriteria(currentDirectoryEntries, sortBy, orderBy).filter(
        (entry) =>
          entry.name.toLowerCase().includes(searchFilter.toLowerCase()),
      );
    }
    if (sortBy === 'byRelevance') {
      // initial search results is sorted by relevance
      if (orderBy) {
        return currentDirectoryEntries;
      } else {
        return [...currentDirectoryEntries].reverse();
      }
    }
    // not in search mode
    return sortByCriteria(currentDirectoryEntries, sortBy, orderBy).map(
      (o) => o,
    );
  }, [currentDirectoryEntries, searchFilter, sortBy, orderBy]);

  const context = useMemo(() => {
    return {
      sortedDirContent,
      settings,
      sortBy,
      orderBy,
      setSortBy,
      setOrderBy,
    };
  }, [sortedDirContent, settings, sortBy, orderBy]);

  return (
    <SortedDirContext.Provider value={context}>
      {children}
    </SortedDirContext.Provider>
  );
};
