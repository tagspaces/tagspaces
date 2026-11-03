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
import { Pro } from '-/pro';

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

export const DownloadUrlContextProvider = ({
  children,
}: DownloadUrlContextProviderProps) => {
  // Download from URL is a Pro feature; the dialog implementation lives in the
  // Pro module and is reached via Pro.UI. Read it at render time (not module
  // scope) so a circular import with the Pro bundle can't capture `undefined`.
  // On Lite it is unavailable — the menu entry is disabled (or hidden) — so
  // this provider simply renders nothing.
  const DownloadUrlDialog = Pro && Pro.UI ? Pro.UI.DownloadUrlDialog : false;
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

  const context = useMemo(() => {
    return {
      openDownloadUrl: openDialog,
      closeDownloadUrl: closeDialog,
    };
  }, []);

  return (
    <DownloadUrlDialogContext.Provider value={context}>
      {DownloadUrlDialog && (
        <DownloadUrlDialog open={open.current} onClose={closeDialog} />
      )}
      {children}
    </DownloadUrlDialogContext.Provider>
  );
};
