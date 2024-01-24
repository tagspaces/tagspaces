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

import React, { createContext, CSSProperties, useMemo } from 'react';
import {
  calculateEntryHeight,
  calculateEntryWidth,
} from '-/perspectives/grid/components/GridCell';
import { usePerspectiveSettingsContext } from '-/hooks/usePerspectiveSettingsContext';

type GridCellsStyleData = {
  cellsStyle: CSSProperties;
};

export const GridCellsStyleContext = createContext<GridCellsStyleData>({
  cellsStyle: undefined,
});

export type GridCellsStyleContextProviderProps = {
  children: React.ReactNode;
};

export const GridCellsStyleContextProvider = ({
  children,
}: GridCellsStyleContextProviderProps) => {
  const { entrySize } = usePerspectiveSettingsContext();

  const context = useMemo(() => {
    return {
      cellsStyle: {
        margin: 0,
        display: 'grid',
        gridGap: '5px 5px',
        padding: 5,
        paddingBottom: 70,
        gridTemplateColumns:
          'repeat(auto-fit,minmax(' +
          calculateEntryWidth(entrySize) +
          'px,1fr))',
        gridTemplateRows:
          'repeat(auto-fit,minmax(' +
          calculateEntryHeight(entrySize) +
          'px,1fr))',
      },
    };
  }, [entrySize]);

  return (
    <GridCellsStyleContext.Provider value={context}>
      {children}
    </GridCellsStyleContext.Provider>
  );
};
