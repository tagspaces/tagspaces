/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces GmbH
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

import LoadingLazy from '-/components/LoadingLazy';
import React, { createContext, useMemo, useReducer, useRef } from 'react';

type BuyProDialogContextData = {
  openBuyProDialog: () => void;
  closeBuyProDialog: () => void;
};

export const BuyProDialogContext = createContext<BuyProDialogContextData>({
  openBuyProDialog: undefined,
  closeBuyProDialog: undefined,
});

export type BuyProDialogContextProviderProps = {
  children: React.ReactNode;
};

const BuyProDialog = React.lazy(
  () => import(/* webpackChunkName: "BuyProDialog" */ '../BuyProDialog'),
);

export const BuyProDialogContextProvider = ({
  children,
}: BuyProDialogContextProviderProps) => {
  const open = useRef<boolean>(false);
  const [ignored, forceUpdate] = useReducer((x: number) => x + 1, 0, undefined);

  function openDialog() {
    open.current = true;
    forceUpdate();
  }

  function closeDialog() {
    open.current = false;
    forceUpdate();
  }

  function BuyProDialogAsync(props) {
    return (
      <React.Suspense fallback={<LoadingLazy />}>
        <BuyProDialog {...props} />
      </React.Suspense>
    );
  }

  const context = useMemo(
    () => ({
      openBuyProDialog: openDialog,
      closeBuyProDialog: closeDialog,
    }),
    [],
  );

  return (
    <BuyProDialogContext.Provider value={context}>
      {children}
      {open.current && (
        <BuyProDialogAsync open={open.current} onClose={closeDialog} />
      )}
    </BuyProDialogContext.Provider>
  );
};
