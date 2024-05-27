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

type PerspectiveActionsContextData = {
  actions: TS.PerspectiveActions[];
  setActions: (...actionsArray: TS.PerspectiveActions[]) => void;
};

export const PerspectiveActionsContext =
  createContext<PerspectiveActionsContextData>({
    actions: undefined,
    setActions: undefined,
  });

export type PerspectiveActionsContextProviderProps = {
  children: React.ReactNode;
};

export const PerspectiveActionsContextProvider = ({
  children,
}: PerspectiveActionsContextProviderProps) => {
  const actions = useRef<TS.PerspectiveActions[]>(undefined);

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  function setActions(...actionsArray: TS.PerspectiveActions[]) {
    actions.current = actionsArray;
    forceUpdate();
  }

  const context = useMemo(() => {
    return {
      actions: actions.current,
      setActions,
    };
  }, [actions.current]);

  return (
    <PerspectiveActionsContext.Provider value={context}>
      {children}
    </PerspectiveActionsContext.Provider>
  );
};
