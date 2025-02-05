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
import { slidesNames } from '-/content/ProTeaserSlides';
import React, { createContext, useMemo, useReducer, useRef } from 'react';

type ProTeaserDialogContextData = {
  openProTeaserDialog: (slidePage?: string) => void;
  closeProTeaserDialog: () => void;
};

export const ProTeaserDialogContext = createContext<ProTeaserDialogContextData>(
  {
    openProTeaserDialog: undefined,
    closeProTeaserDialog: undefined,
  },
);

export type ProTeaserDialogContextProviderProps = {
  children: React.ReactNode;
};

const ProTeaserDialog = React.lazy(
  () => import(/* webpackChunkName: "ProTeaserDialog" */ '../ProTeaserDialog'),
);

export const ProTeaserDialogContextProvider = ({
  children,
}: ProTeaserDialogContextProviderProps) => {
  const open = useRef<boolean>(false);
  const slideIndex = useRef<number>(-1);

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  function getProTeaserSlideIndex(slideName: string): number {
    if (!slideName) {
      return 0;
    }
    return slidesNames.findIndex((key) => key === slideName);
  }

  function openDialog(page?: string) {
    let index = -1;
    const proTeaserIndex = getProTeaserSlideIndex(page);
    if (proTeaserIndex && proTeaserIndex > -1) {
      index = proTeaserIndex;
    } else if (slideIndex.current === -1) {
      index = 0;
    }
    slideIndex.current = index;
    open.current = true;
    forceUpdate();
  }

  function closeDialog() {
    open.current = false;
    forceUpdate();
  }

  function ProTeaserDialogAsync(props) {
    return (
      <React.Suspense fallback={<LoadingLazy />}>
        <ProTeaserDialog {...props} />
      </React.Suspense>
    );
  }

  const context = useMemo(() => {
    return {
      openProTeaserDialog: openDialog,
      closeProTeaserDialog: closeDialog,
    };
  }, []);

  return (
    <ProTeaserDialogContext.Provider value={context}>
      <ProTeaserDialogAsync
        open={open.current}
        onClose={closeDialog}
        slideIndex={slideIndex.current}
      />
      {children}
    </ProTeaserDialogContext.Provider>
  );
};
