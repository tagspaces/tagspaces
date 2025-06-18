/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2023-present TagSpaces GmbH
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
  useReducer,
  useRef,
  useState,
} from 'react';
import { Pro } from '-/pro';
import AppConfig from '-/AppConfig';
import { useTranslation } from 'react-i18next';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { TS } from '-/tagspaces.namespace';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import ConfirmDialog from '-/components/dialogs/ConfirmDialog';

type FilePropertiesContextData = {
  description: string;
  isDescriptionChanged: boolean;
  isSaveDescriptionConfirmOpened: boolean;
  isEditMode: boolean;
  setEditMode: (editMode: boolean) => void;
  isEditDescriptionMode: boolean;
  setEditDescriptionMode: (editMode: boolean) => void;
  setSaveDescriptionConfirmOpened: (open: boolean) => void;
  setDescription: (description: string) => void;
  saveDescription: () => Promise<boolean>;
  closeOpenedEntries: () => void;
};

export const FilePropertiesContext = createContext<FilePropertiesContextData>({
  description: undefined,
  isDescriptionChanged: false,
  isSaveDescriptionConfirmOpened: false,
  isEditMode: false,
  setEditMode: () => {},
  isEditDescriptionMode: undefined,
  setEditDescriptionMode: undefined,
  setSaveDescriptionConfirmOpened: () => {},
  setDescription: () => {},
  saveDescription: undefined,
  closeOpenedEntries: undefined,
});

export type FilePropertiesContextProviderProps = {
  children: React.ReactNode;
};

export const FilePropertiesContextProvider = ({
  children,
}: FilePropertiesContextProviderProps) => {
  const { t } = useTranslation();
  const { openedEntry, actuallyCloseFiles, openFsEntry } =
    useOpenedEntryContext();
  const { findLocation } = useCurrentLocationContext();
  const { showNotification } = useNotificationContext();
  const { setDescriptionChange } = useIOActionsContext();

  const lastOpenedFile = useRef<TS.OpenedEntry>({ ...openedEntry });
  const isDescriptionChanged = useRef<boolean>(false);
  const isSaveDescriptionConfirmOpened = useRef<boolean>(false);

  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isEditDescriptionMode, setIsEditDescriptionMode] =
    useState<boolean>(true);

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  useEffect(() => {
    if (openedEntry) {
      // auto set EditDescriptionMode on opening
      const openedLocation = findLocation(openedEntry.locationID);
      if (openedLocation) {
        if (openedLocation.isReadOnly) {
          if (isEditDescriptionMode) {
            setIsEditDescriptionMode(false);
          }
        } else if (!isEditDescriptionMode) {
          setIsEditDescriptionMode(true);
        }
      }

      if (
        JSON.stringify(lastOpenedFile.current) !== JSON.stringify(openedEntry)
      ) {
        if (lastOpenedFile.current?.path !== openedEntry.path) {
          if (isDescriptionChanged.current) {
            isDescriptionChanged.current = false;
            // handle not saved changes
            isSaveDescriptionConfirmOpened.current = true;
          } else {
            lastOpenedFile.current = { ...openedEntry };
            setIsEditMode(false);
          }
        } else {
          lastOpenedFile.current = { ...openedEntry };
        }

        forceUpdate();
      }
    }
  }, [openedEntry]);

  function closeOpenedEntries() {
    if (openedEntry) {
      if (isDescriptionChanged.current) {
        isDescriptionChanged.current = false;
        // handle not saved changes
        isSaveDescriptionConfirmOpened.current = true;
        forceUpdate();
      } else {
        actuallyCloseFiles();
      }
    }
  }

  function saveDescription(): Promise<boolean> {
    if (!lastOpenedFile.current) return Promise.resolve(false);

    const location = findLocation(lastOpenedFile.current.locationID);
    if (!location || location.isReadOnly) {
      showNotification(t('core:readonlyModeSave'));
      return Promise.resolve(false);
    }

    if (!Pro) {
      showNotification(t('core:thisFunctionalityIsAvailableInPro'));
      return Promise.resolve(false);
    }

    return setDescriptionChange(
      lastOpenedFile.current,
      lastOpenedFile.current.meta?.description,
    ).then(() => {
      if (lastOpenedFile.current.path !== openedEntry?.path) {
        lastOpenedFile.current = { ...openedEntry };
      } else {
        // to reload description
        lastOpenedFile.current = { ...lastOpenedFile.current };
      }
      isDescriptionChanged.current = false;
      setIsEditMode(false);
      return true;
    });
  }

  function setDescription(d: string) {
    if (lastOpenedFile.current?.meta?.description !== d) {
      lastOpenedFile.current = {
        ...lastOpenedFile.current,
        meta: {
          ...lastOpenedFile.current?.meta,
          description: d,
        },
      };
      if (!isDescriptionChanged.current) {
        isDescriptionChanged.current = true;
        forceUpdate();
      }
    }
  }

  function setEditMode(editMode: boolean) {
    setIsEditMode((prev) => {
      if (prev !== editMode) {
        isDescriptionChanged.current = false;
        lastOpenedFile.current = { ...openedEntry };
        return editMode;
      }
      return prev;
    });
  }
  function setEditDescriptionMode(editMode: boolean) {
    if (!editMode) {
      isDescriptionChanged.current = false;
    }
    setIsEditDescriptionMode((prev) => {
      if (prev !== editMode && !isEditMode) {
        if (AppConfig.isElectron) {
          window.electronIO.ipcRenderer.sendMessage(
            'description-changed',
            editMode,
          );
        }
        return editMode;
      }
      return prev;
    });
  }

  function setSaveDescriptionConfirmOpened(isOpened: boolean) {
    if (!isOpened) {
      isDescriptionChanged.current = false;
      setIsEditDescriptionMode(false);
    }
    lastOpenedFile.current = { ...openedEntry };
    isSaveDescriptionConfirmOpened.current = isOpened;
    forceUpdate();
  }

  const context = useMemo(
    () => ({
      description: lastOpenedFile.current?.meta?.description,
      isDescriptionChanged: isDescriptionChanged.current,
      isSaveDescriptionConfirmOpened: isSaveDescriptionConfirmOpened.current,
      setSaveDescriptionConfirmOpened,
      setDescription,
      saveDescription,
      isEditMode,
      setEditMode,
      isEditDescriptionMode,
      setEditDescriptionMode,
      closeOpenedEntries,
    }),
    [
      openedEntry,
      isDescriptionChanged.current,
      lastOpenedFile.current,
      isEditMode,
      isEditDescriptionMode,
      isSaveDescriptionConfirmOpened.current,
    ],
  );

  return (
    <FilePropertiesContext.Provider value={context}>
      {children}
      <ConfirmDialog
        open={isSaveDescriptionConfirmOpened.current}
        onClose={() => setSaveDescriptionConfirmOpened(false)}
        title={t('core:confirm')}
        content={t('core:saveDescriptionOnClosing')}
        confirmCallback={(result) => {
          if (result) {
            saveDescription().then(() => {
              openFsEntry(openedEntry);
            });
          } else {
            setSaveDescriptionConfirmOpened(false);
            openFsEntry(openedEntry);
          }
        }}
        cancelDialogTID="cancelSaveDescCloseDialog"
        confirmDialogTID="confirmSaveDescCloseDialog"
        confirmDialogContentTID="confirmDescDialogContent"
      />
    </FilePropertiesContext.Provider>
  );
};
