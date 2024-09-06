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

import React, { createContext, CSSProperties, useMemo } from 'react';

type ListCellsStyleData = {
  cellsStyle: CSSProperties;
};

export const ListCellsStyleContext = createContext<ListCellsStyleData>({
  cellsStyle: undefined,
});

export type ListCellsStyleContextProviderProps = {
  children: React.ReactNode;
};

export const ListCellsStyleContextProvider = ({
  children,
}: ListCellsStyleContextProviderProps) => {
  const context = useMemo(() => {
    return {
      cellsStyle: {
        marginTop: 5,
        marginBottom: 70,
        paddingRight: 4,
        paddingLeft: 4,
        gridTemplateColumns: 'none',
      },
    };
  }, []);

  return (
    <ListCellsStyleContext.Provider value={context}>
      {children}
    </ListCellsStyleContext.Provider>
  );
};
