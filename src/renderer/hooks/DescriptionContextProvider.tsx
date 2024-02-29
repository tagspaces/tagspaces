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

import React, {
  createContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Pro } from '-/pro';
import { useTranslation } from 'react-i18next';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { TS } from '-/tagspaces.namespace';
import { useEditedEntryMetaContext } from '-/hooks/useEditedEntryMetaContext';

type DescriptionContextData = {
  description: string;
  isSaveDescriptionConfirmOpened: boolean;
  setSaveDescriptionConfirmOpened: (open: boolean) => void;
  setDescription: (description: string) => void;
  saveDescription: () => void;
};

export const DescriptionContext = createContext<DescriptionContextData>({
  description: undefined,
  isSaveDescriptionConfirmOpened: false,
  setSaveDescriptionConfirmOpened: () => {},
  setDescription: () => {},
  saveDescription: undefined,
});

export type DescriptionContextProviderProps = {
  children: React.ReactNode;
};

export const DescriptionContextProvider = ({
  children,
}: DescriptionContextProviderProps) => {
  const { t } = useTranslation();
  const { openedEntry } = useOpenedEntryContext();
  const { readOnlyMode } = useCurrentLocationContext();
  const { showNotification } = useNotificationContext();
  const { setDescriptionChange } = useEditedEntryMetaContext();
  const description = useRef<string>(openedEntry.meta?.description);
  const lastOpenedFile = useRef<TS.OpenedEntry>(openedEntry);
  const isChanged = useRef<boolean>(false);
  const [isSaveDescriptionConfirmOpened, saveDescriptionConfirmOpened] =
    useState<boolean>(false);

  useEffect(() => {
    if (openedEntry) {
      if (
        isChanged.current
        //openedFile.current !== undefined &&
        //openedFile.current.path !== openedEntry.path &&
        //openedFile.current.meta &&
        //openedEntry.meta &&
        //openedFile.current.meta.description !== openedEntry.meta.description
      ) {
        // handle not saved changes
        //addToEntryContainer({ ...openedFile.current, editMode: false });
        //setSelectedEntries([]);
        saveDescriptionConfirmOpened(true);
      } else {
        lastOpenedFile.current = { ...openedEntry };
        description.current = openedEntry.meta?.description;
      }
    } else {
      description.current = undefined;
      // openedFile.current = undefined;
    }
  }, [openedEntry]);

  const saveDescription = () => {
    if (readOnlyMode) {
      return;
    }
    if (!Pro) {
      showNotification(t('core:thisFunctionalityIsAvailableInPro'));
      return;
    }
    if (!Pro.MetaOperations) {
      showNotification(t('Saving description not supported'));
      return;
    }
    if (description.current !== undefined) {
      setDescriptionChange(
        lastOpenedFile.current,
        description.current,
        lastOpenedFile.current.locationId,
      ).then(() => {
        lastOpenedFile.current = { ...openedEntry };
        description.current = openedEntry.meta?.description;
      });
    }
  };

  function setDescription(d: string) {
    description.current = d;
    isChanged.current = true;
  }

  function setSaveDescriptionConfirmOpened(isOpened: boolean) {
    if (!isOpened) {
      isChanged.current = false;
      // reloadOpenedFile();
    }
    saveDescriptionConfirmOpened(isOpened);
  }

  const context = useMemo(() => {
    return {
      description: description.current,
      isSaveDescriptionConfirmOpened,
      setSaveDescriptionConfirmOpened,
      setDescription,
      saveDescription,
    };
  }, [description.current, isSaveDescriptionConfirmOpened]);

  return (
    <DescriptionContext.Provider value={context}>
      {children}
    </DescriptionContext.Provider>
  );
};
