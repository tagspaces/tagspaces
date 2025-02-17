/*
Copyright (c) 2024-present The TagSpaces GmbH. All rights reserved.
*/

import React, { createContext, useMemo } from 'react';
import { TS } from '-/tagspaces.namespace';

type CrepeEditorContextData = {
  //searches: TS.SearchQuery[];
};

export const CrepeEditorContext = createContext<CrepeEditorContextData>({
  //searches:undefined
});

export type CrepeEditorContextProviderProps = {
  children: React.ReactNode;
};

export const CrepeEditorContextProvider = ({
  children,
}: CrepeEditorContextProviderProps) => {
  const context = useMemo(() => {
    return {};
  }, []);

  return (
    <CrepeEditorContext.Provider value={context}>
      {children}
    </CrepeEditorContext.Provider>
  );
};
