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

import ConfirmDialog from '-/components/dialogs/ConfirmDialog';
import { Pro } from '-/pro';
import React, { createContext, useMemo, useReducer, useRef } from 'react';
import { useTranslation } from 'react-i18next';

type AiGenerationDialogContextData = {
  openAiGenerationDialog: (optionSelected?: generateOptionType) => void;
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
  const { t } = useTranslation();
  const open = useRef<boolean>(false);
  const option = useRef<generateOptionType>(undefined);
  const AiGenerationDialog = Pro && Pro.UI ? Pro.UI.AiGenerationDialog : false;
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  function openDialog(optionSelected: generateOptionType = undefined) {
    open.current = true;
    option.current = optionSelected;
    forceUpdate();
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
      {AiGenerationDialog ? (
        <AiGenerationDialog
          open={open.current}
          onClose={closeDialog}
          option={option.current}
        />
      ) : (
        <ConfirmDialog
          open={true}
          onClose={() => {}}
          title={t('core:thisFunctionalityIsAvailableInPro')}
          confirmCallback={() => {}}
        />
      )}
      {children}
    </AiGenerationDialogContext.Provider>
  );
};
