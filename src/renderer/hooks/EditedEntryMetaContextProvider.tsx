/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2023-present TagSpaces GmbH
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

type EditedEntryMetaContextData = {
  metaActions: TS.EditMetaAction[];
  setReflectMetaActions: (...actionsArray: TS.EditMetaAction[]) => void;
};

export const EditedEntryMetaContext = createContext<EditedEntryMetaContextData>(
  {
    metaActions: undefined,
    setReflectMetaActions: undefined,
  },
);

export type EditedEntryMetaContextProviderProps = {
  children: React.ReactNode;
};

export const EditedEntryMetaContextProvider = ({
  children,
}: EditedEntryMetaContextProviderProps) => {
  const metaActions = useRef<TS.EditMetaAction[]>(undefined);

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  function setReflectMetaActions(...actionsArray: TS.EditMetaAction[]) {
    metaActions.current = actionsArray;
    forceUpdate();
  }

  const context = useMemo(() => {
    return {
      metaActions: metaActions.current,
      setReflectMetaActions,
    };
  }, [metaActions.current]);

  return (
    <EditedEntryMetaContext.Provider value={context}>
      {children}
    </EditedEntryMetaContext.Provider>
  );
};
