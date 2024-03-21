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

import React, { createContext, useMemo, useReducer, useRef } from 'react';
import { TS } from '-/tagspaces.namespace';
import { getTagLibrary } from '-/services/taglibrary-utils';

type EditedTagLibraryContextData = {
  tagGroups: TS.TagGroup[];
  reflectTagLibraryChanged: (tg: TS.TagGroup[]) => void;
};

export const EditedTagLibraryContext =
  createContext<EditedTagLibraryContextData>({
    tagGroups: undefined,
    reflectTagLibraryChanged: undefined,
  });

export type EditedTagLibraryContextProviderProps = {
  children: React.ReactNode;
};

export const EditedTagLibraryContextProvider = ({
  children,
}: EditedTagLibraryContextProviderProps) => {
  const tagGroups = useRef<TS.TagGroup[]>(getTagLibrary());

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  function reflectTagLibraryChanged(tg: TS.TagGroup[]) {
    tagGroups.current = tg;
    forceUpdate();
  }

  const context = useMemo(() => {
    return {
      tagGroups: tagGroups.current,
      reflectTagLibraryChanged,
    };
  }, [tagGroups.current]);

  return (
    <EditedTagLibraryContext.Provider value={context}>
      {children}
    </EditedTagLibraryContext.Provider>
  );
};
