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
import { useDispatch, useSelector } from 'react-redux';
import {
  actions as AppActions,
  AppDispatch,
  OpenedEntry,
} from '-/reducers/app';
import { Pro } from '-/pro';
import { useTranslation } from 'react-i18next';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';

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
  saveDescription: () => {},
});

export type DescriptionContextProviderProps = {
  children: React.ReactNode;
};

export const DescriptionContextProvider = ({
  children,
}: DescriptionContextProviderProps) => {
  const { t } = useTranslation();
  const { setSelectedEntries } = useSelectedEntriesContext();
  const {
    openedEntry,
    addToEntryContainer,
    updateOpenedFile,
    reloadOpenedFile,
  } = useOpenedEntryContext();
  const { switchLocationTypeByID, switchCurrentLocationType, readOnlyMode } =
    useCurrentLocationContext();
  const { updateCurrentDirEntry } = useDirectoryContentContext();
  const { showNotification } = useNotificationContext();
  const openedFile = useRef<OpenedEntry>(openedEntry);
  const isChanged = useRef<boolean>(false);
  const [isSaveDescriptionConfirmOpened, saveDescriptionConfirmOpened] =
    useState<boolean>(false);

  useEffect(() => {
    if (openedEntry) {
      if (
        openedFile.current !== undefined &&
        isChanged.current &&
        openedFile.current.path !== openedEntry.path &&
        openedFile.current.description !== openedEntry.description
      ) {
        // handle not saved changes
        addToEntryContainer({ ...openedFile.current, editMode: false });
        setSelectedEntries([]);
        saveDescriptionConfirmOpened(true);
      } else {
        openedFile.current = openedEntry;
      }
    } else {
      openedFile.current = undefined;
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
    if (openedFile.current.description !== undefined) {
      //forceUpdate();
      //setDescriptionChanged(false);
      if (openedFile.current.locationId) {
        switchLocationTypeByID(openedFile.current.locationId).then(
          (currentLocationId) => {
            saveMetaData()
              .then(() => switchCurrentLocationType())
              .catch((error) => {
                console.warn('Error saving description ' + error);
                switchCurrentLocationType().then(() =>
                  showNotification(t('Error saving description')),
                );
              });
          },
        );
      } else {
        console.debug(
          'openedFile:' +
            openedFile.current.path +
            ' dont have locationId! Current Location can be changed. Trying to save opened file in current location',
        );
        saveMetaData();
      }
    }
  };

  function saveMetaData() {
    return Pro.MetaOperations.saveFsEntryMeta(openedFile.current.path, {
      description: openedFile.current.description,
    }).then((entryMeta) => {
      // @ts-ignore
      updateCurrentDirEntry(openedFile.current.path, {
        description: entryMeta.description,
      });
      openedFile.current.description = undefined;
      isChanged.current = false;
      return updateOpenedFile(openedFile.current.path, entryMeta);
    });
  }

  function setDescription(d: string) {
    openedFile.current.description = d;
    isChanged.current = true;
  }

  function setSaveDescriptionConfirmOpened(isOpened: boolean) {
    if (!isOpened) {
      isChanged.current = false;
      reloadOpenedFile();
    }
    saveDescriptionConfirmOpened(isOpened);
  }

  const context = useMemo(() => {
    return {
      description: openedFile.current?.description,
      isSaveDescriptionConfirmOpened,
      setSaveDescriptionConfirmOpened,
      setDescription,
      saveDescription,
    };
  }, [openedFile.current, isSaveDescriptionConfirmOpened]);

  return (
    <DescriptionContext.Provider value={context}>
      {children}
    </DescriptionContext.Provider>
  );
};
