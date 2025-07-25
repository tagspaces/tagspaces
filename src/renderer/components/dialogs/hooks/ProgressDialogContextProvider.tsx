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

type ProgressDialogContextData = {
  openProgressDialog: (title?: string) => void;
  closeProgressDialog: () => void;
};

export const ProgressDialogContext = createContext<ProgressDialogContextData>({
  openProgressDialog: undefined,
  closeProgressDialog: undefined,
});

export type ProgressDialogContextProviderProps = {
  children: React.ReactNode;
};

const ProgressDialog = React.lazy(
  () => import(/* webpackChunkName: "ProgressDialog" */ '../ProgressDialog'),
);

export const ProgressDialogContextProvider = ({
  children,
}: ProgressDialogContextProviderProps) => {
  const open = useRef<boolean>(false);
  const title = useRef<string>(undefined);

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  function openDialog(t) {
    open.current = true;
    title.current = t;
    forceUpdate();
  }

  function closeDialog() {
    open.current = false;
    title.current = undefined;
    forceUpdate();
  }

  function ProgressDialogAsync(props) {
    return (
      <React.Suspense fallback={<LoadingLazy />}>
        <ProgressDialog {...props} />
      </React.Suspense>
    );
  }

  const context = useMemo(() => {
    return {
      openProgressDialog: openDialog,
      closeProgressDialog: closeDialog,
    };
  }, []);

  return (
    <ProgressDialogContext.Provider value={context}>
      <ProgressDialogAsync
        open={open.current}
        title={title.current}
        onClose={closeDialog}
      />
      {children}
    </ProgressDialogContext.Provider>
  );
};
