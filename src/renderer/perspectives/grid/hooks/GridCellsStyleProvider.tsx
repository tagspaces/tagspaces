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

import { usePerspectiveSettingsContext } from '-/hooks/usePerspectiveSettingsContext';
import {
  calculateEntryHeight,
  calculateEntryWidth,
} from '-/perspectives/grid/components/GridCell';
import React, { CSSProperties, createContext, useMemo } from 'react';

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
        marginTop: -5,
        display: 'grid',
        gridGap: '5px 5px',
        padding: 5,
        paddingTop: 10,
        paddingBottom: 70,
        // background: 'red',
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
