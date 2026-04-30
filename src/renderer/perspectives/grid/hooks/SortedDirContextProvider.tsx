/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2024-present TagSpaces GmbH
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

import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { usePerspectiveSettingsContext } from '-/hooks/usePerspectiveSettingsContext';
import { defaultSettings } from '-/perspectives/grid';
import { getSearchFilter } from '-/reducers/app';
import { TS } from '-/tagspaces.namespace';
import { sortByCriteria } from '@tagspaces/tagspaces-common/misc';
import React, { createContext, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

type SortedDirContextData = {
  sortedDirContent: TS.FileSystemEntry[];
  sortBy: string;
  orderBy: null | boolean;
  nativeDragModeEnabled: boolean;
  setSortBy: (sort: string) => void;
  setOrderBy: (isAsc: null | boolean) => void;
  setNativeDragModeEnabled: (enabled: boolean) => void;
};

export const SortedDirContext = createContext<SortedDirContextData>({
  sortedDirContent: undefined,
  sortBy: undefined,
  orderBy: undefined,
  nativeDragModeEnabled: undefined,
  setSortBy: undefined,
  setOrderBy: undefined,
  setNativeDragModeEnabled: undefined,
});

export type SortedDirContextProviderProps = {
  children: React.ReactNode;
};

export const SortedDirContextProvider = ({
  children,
}: SortedDirContextProviderProps) => {
  const { currentDirectoryEntries, currentDirectory } =
    useDirectoryContentContext();
  const { settings } = usePerspectiveSettingsContext();
  const searchFilter: string = useSelector(getSearchFilter);

  // Reset sort only when navigating to a different directory, not on reload of
  // the same directory. Reloading re-reads directoryMeta (new object reference),
  // which propagates a new settings reference — previously that caused this
  // effect to fire and wipe out the user's unsaved sort choice.
  useEffect(() => {
    if (settings.sortBy !== sortBy) {
      setSortBy(settings.sortBy);
    }
    if (settings.orderBy !== orderBy) {
      setOrderBy(settings.orderBy);
    }
  }, [currentDirectory?.path]);

  const [sortBy, setSortBy] = useState<string>(
    settings && settings.sortBy ? settings.sortBy : defaultSettings.sortBy,
  );
  const [orderBy, setOrderBy] = useState<null | boolean>(
    settings && typeof settings.orderBy !== 'undefined'
      ? settings.orderBy
      : defaultSettings.orderBy,
  );
  const [nativeDragModeEnabled, setNativeDragModeEnabled] =
    useState<boolean>(false);

  /*function getSettings(meta, persp = PerspectiveIDs.GRID): TS.FolderSettings {
    if (persp === PerspectiveIDs.UNSPECIFIED) {
      persp = PerspectiveIDs.GRID;
    }
    if (
      Pro &&
      meta &&
      meta.perspectiveSettings &&
      meta.perspectiveSettings[persp]
    ) {
      return meta.perspectiveSettings[persp];
    } else {
      // loading settings for not Pro
      return JSON.parse(localStorage.getItem(defaultSettings.settingsKey));
    }
  }*/

  const sortedDirContent = useMemo(() => {
    if (searchFilter) {
      const needle = searchFilter.toLowerCase();
      return sortByCriteria(currentDirectoryEntries, sortBy, orderBy).filter(
        (entry) => entry.name.toLowerCase().includes(needle),
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
    return sortByCriteria(currentDirectoryEntries, sortBy, orderBy);
  }, [currentDirectoryEntries, searchFilter, sortBy, orderBy]);

  const context = useMemo(() => {
    return {
      sortedDirContent,
      sortBy,
      orderBy,
      setSortBy,
      setOrderBy,
      nativeDragModeEnabled,
      setNativeDragModeEnabled,
    };
  }, [sortedDirContent, sortBy, orderBy, nativeDragModeEnabled]);

  return (
    <SortedDirContext.Provider value={context}>
      {children}
    </SortedDirContext.Provider>
  );
};
