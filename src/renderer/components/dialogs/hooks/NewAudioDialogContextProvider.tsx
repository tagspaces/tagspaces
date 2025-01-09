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

type NewAudioDialogContextData = {
  openNewAudioDialog: (title?: string) => void;
  closeNewAudioDialog: () => void;
};

export const NewAudioDialogContext = createContext<NewAudioDialogContextData>({
  openNewAudioDialog: undefined,
  closeNewAudioDialog: undefined,
});

export type NewAudioDialogContextProviderProps = {
  children: React.ReactNode;
};

const NewAudioDialog = React.lazy(
  () => import(/* webpackChunkName: "NewAudioDialog" */ '../NewAudioDialog'),
);

export const NewAudioDialogContextProvider = ({
  children,
}: NewAudioDialogContextProviderProps) => {
  const open = useRef<boolean>(false);
  const title = useRef<string>(undefined);

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  function openDialog(t = undefined) {
    open.current = true;
    title.current = t;
    forceUpdate();
  }

  function closeDialog() {
    open.current = false;
    forceUpdate();
  }

  function NewAudioDialogAsync(props) {
    return (
      <React.Suspense fallback={<LoadingLazy />}>
        <NewAudioDialog {...props} />
      </React.Suspense>
    );
  }

  const context = useMemo(() => {
    return {
      openNewAudioDialog: openDialog,
      closeNewAudioDialog: closeDialog,
    };
  }, []);

  return (
    <NewAudioDialogContext.Provider value={context}>
      <NewAudioDialogAsync
        open={open.current}
        onClose={closeDialog}
        title={title.current}
      />
      {children}
    </NewAudioDialogContext.Provider>
  );
};
