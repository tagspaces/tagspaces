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

import React, { createContext, useMemo, useReducer, useRef } from 'react';
import LoadingLazy from '-/components/LoadingLazy';

type DownloadUrlContextData = {
  openDownloadUrl: () => void;
  closeDownloadUrl: () => void;
};

export const DownloadUrlDialogContext = createContext<DownloadUrlContextData>({
  openDownloadUrl: undefined,
  closeDownloadUrl: undefined,
});

export type DownloadUrlContextProviderProps = {
  children: React.ReactNode;
};

const DownloadUrlDialog = React.lazy(
  () =>
    import(/* webpackChunkName: "DownloadUrlDialog" */ '../DownloadUrlDialog'),
);

export const DownloadUrlContextProvider = ({
  children,
}: DownloadUrlContextProviderProps) => {
  const open = useRef<boolean>(false);

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  function openDialog() {
    open.current = true;
    forceUpdate();
  }

  function closeDialog() {
    open.current = false;
    forceUpdate();
  }

  function DownloadUrlAsync(props) {
    return (
      <React.Suspense fallback={<LoadingLazy />}>
        <DownloadUrlDialog {...props} />
      </React.Suspense>
    );
  }

  const context = useMemo(() => {
    return {
      openDownloadUrl: openDialog,
      closeDownloadUrl: closeDialog,
    };
  }, []);

  return (
    <DownloadUrlDialogContext.Provider value={context}>
      <DownloadUrlAsync open={open.current} onClose={closeDialog} />
      {children}
    </DownloadUrlDialogContext.Provider>
  );
};
