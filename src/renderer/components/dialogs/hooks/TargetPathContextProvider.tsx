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
import { locationType } from '@tagspaces/tagspaces-common/misc';
import { getFirstRWLocation } from '-/reducers/locations';
import { PerspectiveIDs } from '-/perspectives';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';

type TargetPathContextData = {
  targetDirectoryPath: string;
};

export const TargetPathContext = createContext<TargetPathContextData>({
  targetDirectoryPath: undefined,
});

export type TargetPathContextProviderProps = {
  children: React.ReactNode;
};

export const TargetPathContextProvider = ({
  children,
}: TargetPathContextProviderProps) => {
  const { currentLocation } = useCurrentLocationContext();
  const { selectedEntries } = useSelectedEntriesContext();
  const { currentDirectoryPath, getPerspective } = useDirectoryContentContext();

  const firstRWLocation = useSelector(getFirstRWLocation);

  const context = useMemo(() => {
    let targetDirectoryPath = currentDirectoryPath;
    if (
      getPerspective() === PerspectiveIDs.KANBAN &&
      selectedEntries &&
      selectedEntries.length === 1 &&
      !selectedEntries[0].isFile
    ) {
      targetDirectoryPath = selectedEntries[0].path;
    }

    if (!targetDirectoryPath) {
      const isCloudLocation =
        currentLocation && currentLocation.type === locationType.TYPE_CLOUD;
      if (isCloudLocation) {
        targetDirectoryPath = '/';
      } else if (firstRWLocation) {
        targetDirectoryPath = firstRWLocation.path;
      }
    }
    return {
      targetDirectoryPath,
    };
  }, [firstRWLocation, selectedEntries, currentDirectoryPath]);

  return (
    <TargetPathContext.Provider value={context}>
      {children}
    </TargetPathContext.Provider>
  );
};
