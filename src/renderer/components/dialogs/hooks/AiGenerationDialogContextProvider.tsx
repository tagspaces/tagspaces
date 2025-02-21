/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2024-present TagSpaces GmbH
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

import { Pro } from '-/pro';
import React, { createContext, useMemo, useReducer, useRef } from 'react';
import { useProTeaserDialogContext } from '-/components/dialogs/hooks/useProTeaserDialogContext';
import { TS } from '-/tagspaces.namespace';

type AiGenerationDialogContextData = {
  openAiGenerationDialog: (
    optionSelected?: generateOptionType,
    selectedEntries?: TS.FileSystemEntry[],
  ) => void;
  closeAiGenerationDialog: () => void;
};

export const AiGenerationDialogContext =
  createContext<AiGenerationDialogContextData>({
    openAiGenerationDialog: undefined,
    closeAiGenerationDialog: undefined,
  });

export type AiGenerationDialogContextProviderProps = {
  children: React.ReactNode;
};

export type generateOptionType = 'tags' | 'summary' | 'analyseImages';

export const AiGenerationDialogContextProvider = ({
  children,
}: AiGenerationDialogContextProviderProps) => {
  const { openProTeaserDialog } = useProTeaserDialogContext();
  const open = useRef<boolean>(false);
  const option = useRef<generateOptionType>(undefined);
  const selected = useRef<TS.FileSystemEntry[]>(undefined);
  const AiGenerationDialog = Pro && Pro.UI ? Pro.UI.AiGenerationDialog : false;
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  function openDialog(
    optionSelected: generateOptionType = undefined,
    selectedEntries: TS.FileSystemEntry[] = undefined,
  ) {
    if (AiGenerationDialog) {
      open.current = true;
      option.current = optionSelected;
      selected.current = selectedEntries;
      forceUpdate();
    } else {
      openProTeaserDialog('ai');
    }
  }

  function closeDialog() {
    open.current = false;
    forceUpdate();
  }

  const context = useMemo(() => {
    return {
      openAiGenerationDialog: openDialog,
      closeAiGenerationDialog: closeDialog,
    };
  }, []);

  return (
    <AiGenerationDialogContext.Provider value={context}>
      {AiGenerationDialog && (
        <AiGenerationDialog
          open={open.current}
          onClose={closeDialog}
          option={option.current}
          selected={selected.current}
        />
      )}
      {children}
    </AiGenerationDialogContext.Provider>
  );
};
