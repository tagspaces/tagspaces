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

import React, { createContext, useEffect, useMemo, useState } from 'react';
import { TS } from '-/tagspaces.namespace';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import useFirstRender from '-/utils/useFirstRender';

type SelectedEntryContextData = {
  selectedEntries: TS.FileSystemEntry[];
  lastSelectedEntryPath: string;
  setSelectedEntries(entries: TS.FileSystemEntry[]);
};

export const SelectedEntryContext = createContext<SelectedEntryContextData>({
  selectedEntries: undefined,
  lastSelectedEntryPath: undefined,
  setSelectedEntries: undefined,
});

export type SelectedEntryContextProviderProps = {
  children: React.ReactNode;
};

export const SelectedEntryContextProvider = ({
  children,
}: SelectedEntryContextProviderProps) => {
  const { currentLocation } = useCurrentLocationContext();
  const [selectedEntries, setSelectedEntries] = useState<TS.FileSystemEntry[]>(
    [],
  );
  const firstRender = useFirstRender();

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
  /*const setSelectedEntries = (entries: TS.FileSystemEntry[]) => {
    if (JSON.stringify(selectedEntries) !== JSON.stringify(entries)) {
      setSelectedEntriesInt(entries);
    }
  };*/

  const lastSelectedEntryPath = useMemo(() => {
    if (selectedEntries && selectedEntries.length > 0) {
      return selectedEntries[selectedEntries.length - 1].path;
    }
    return undefined;
  }, [selectedEntries]);

  /*function getSelectedEntriesLength() {
    return selectedEntries ? selectedEntries.length : 0;
  }*/

  const context = useMemo(() => {
    return {
      selectedEntries,
      //lastSelectedEntry: lastSelectedEntry.current,
      lastSelectedEntryPath,
      setSelectedEntries,
    };
  }, [selectedEntries]);

  return (
    <SelectedEntryContext.Provider value={context}>
      {children}
    </SelectedEntryContext.Provider>
  );
};
