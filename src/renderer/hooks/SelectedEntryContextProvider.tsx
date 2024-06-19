/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2023-present TagSpaces UG (haftungsbeschraenkt)
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
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import useFirstRender from '-/utils/useFirstRender';
import { useEditedEntryContext } from '-/hooks/useEditedEntryContext';

type SelectedEntryContextData = {
  selectedEntries: TS.FileSystemEntry[];
  lastSelectedEntryPath: string;
  setSelectedEntries(entries: TS.FileSystemEntry[]);
  selectEntry(entry: TS.FileSystemEntry, select?: boolean);
};

export const SelectedEntryContext = createContext<SelectedEntryContextData>({
  selectedEntries: undefined,
  lastSelectedEntryPath: undefined,
  setSelectedEntries: undefined,
  selectEntry: undefined,
});

export type SelectedEntryContextProviderProps = {
  children: React.ReactNode;
};

export const SelectedEntryContextProvider = ({
  children,
}: SelectedEntryContextProviderProps) => {
  const { currentLocation } = useCurrentLocationContext();
  const selectedEntries = useRef<TS.FileSystemEntry[]>([]);
  const firstRender = useFirstRender();
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  useEffect(() => {
    if (!firstRender && !currentLocation) {
      setSelectedEntries([]);
    }
  }, [currentLocation]);

  //const lastSelectedEntry = useRef<TS.FileSystemEntry>(undefined);

  /*function getLastSelectedEntry() {
    if (selectedEntries && selectedEntries.length > 0) {
      return selectedEntries[selectedEntries.length - 1];
    }
    return undefined;
  }*/
  const setSelectedEntries = (entries: TS.FileSystemEntry[]) => {
    selectedEntries.current = entries ? entries : [];
    forceUpdate();
  };

  const selectEntry = (entry: TS.FileSystemEntry, select: boolean = true) => {
    if (select) {
      if (!selectedEntries.current.some((e) => e.path === entry.path)) {
        selectedEntries.current = [...selectedEntries.current, entry];
      }
    } else {
      //deselect
      selectedEntries.current = selectedEntries.current.filter(
        (data) => data.path !== entry.path,
      );
    }
    forceUpdate();
  };

  const lastSelectedEntryPath = useMemo(() => {
    if (selectedEntries.current && selectedEntries.current.length > 0) {
      return selectedEntries.current[selectedEntries.current.length - 1].path;
    }
    return undefined;
  }, [selectedEntries.current]);

  const context = useMemo(() => {
    return {
      selectedEntries: selectedEntries.current,
      lastSelectedEntryPath,
      setSelectedEntries,
      selectEntry,
    };
  }, [selectedEntries.current]);

  return (
    <SelectedEntryContext.Provider value={context}>
      {children}
    </SelectedEntryContext.Provider>
  );
};
