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
import AppConfig from '-/AppConfig';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { TS } from '-/tagspaces.namespace';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import { isAutoSaveDescription } from '-/reducers/settings';

type FilePropertiesContextData = {
  description: string;
  isDescriptionChanged: boolean;
  isEditMode: boolean;
  setEditMode: (editMode: boolean) => void;
  isEditDescriptionMode: boolean;
  setEditDescriptionMode: (editMode: boolean) => void;
  setSaveDescriptionConfirmOpened: (open: boolean) => void;
  setDescription: (description: string, changed?: boolean) => void;
  saveDescription: () => Promise<boolean>;
  closeOpenedEntries: () => void;
};

export const FilePropertiesContext = createContext<FilePropertiesContextData>({
  description: undefined,
  isDescriptionChanged: false,
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
  const { showNotification, openConfirmDialog } = useNotificationContext();
  const { setDescriptionChange } = useIOActionsContext();

  const autoSaveDesc = useSelector(isAutoSaveDescription);
  const lastOpenedFile = useRef<TS.OpenedEntry>({ ...openedEntry });
  const isDescriptionChanged = useRef<boolean>(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isEditDescriptionMode, setIsEditDescriptionMode] =
    useState<boolean>(false);

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  useEffect(() => {
    if (openedEntry) {
      // Description starts in read mode for every opened entry. The user
      // explicitly enters edit mode via the "Edit description" button (or by
      // double-clicking the description area). On read-only locations, force
      // edit mode off if it was somehow on.
      const openedLocation = findLocation(openedEntry.locationID);
      if (
        openedLocation &&
        openedLocation.isReadOnly &&
        isEditDescriptionMode
      ) {
        setIsEditDescriptionMode(false);
      }

      if (
        JSON.stringify(lastOpenedFile.current) !== JSON.stringify(openedEntry)
      ) {
        if (lastOpenedFile.current?.path !== openedEntry.path) {
          if (isDescriptionChanged.current) {
            isDescriptionChanged.current = false;
            // handle not saved changes
            setSaveDescriptionConfirmOpened(true);
          } else {
            lastOpenedFile.current = { ...openedEntry };
            setIsEditMode(Boolean(openedEntry.openInEditMode));
          }
        } else {
          lastOpenedFile.current = { ...openedEntry };
          if (openedEntry.openInEditMode && !isEditMode) {
            setIsEditMode(true);
          }
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
        setSaveDescriptionConfirmOpened(true);
        //forceUpdate();
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

  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, []);

  function setDescription(d: string, changed = true) {
    if (lastOpenedFile.current?.meta?.description !== d) {
      lastOpenedFile.current = {
        ...lastOpenedFile.current,
        meta: {
          ...lastOpenedFile.current?.meta,
          description: d,
        },
      };
      if (isDescriptionChanged.current !== changed) {
        isDescriptionChanged.current = changed;
        forceUpdate();
      }
      if (changed && autoSaveDesc) {
        if (autoSaveTimer.current) {
          clearTimeout(autoSaveTimer.current);
        }
        autoSaveTimer.current = setTimeout(() => {
          const entry = lastOpenedFile.current;
          const location = findLocation(entry?.locationID);
          if (entry && location && !location.isReadOnly) {
            setDescriptionChange(entry, entry.meta?.description ?? '').then(
              () => {
                isDescriptionChanged.current = false;
                forceUpdate();
              },
            );
          }
        }, 3000);
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
      lastOpenedFile.current = { ...openedEntry };
      setIsEditDescriptionMode(false);
      return;
    }

    // take a snapshot of the edited file so the confirm callback uses the current edited value
    const fileSnapshot = {
      ...lastOpenedFile.current,
      meta: { ...lastOpenedFile.current?.meta },
    };

    openConfirmDialog(
      t('core:confirm'),
      t('core:saveDescriptionOnClosing'),
      (result) => {
        if (result) {
          const location = findLocation(fileSnapshot.locationID);
          if (!location || location.isReadOnly) {
            showNotification(t('core:readonlyModeSave'));
            return;
          }

          setDescriptionChange(
            fileSnapshot,
            fileSnapshot.meta?.description,
          ).then(() => {
            // after saving, update refs and UI
            // make lastOpenedFile correspond to currently opened entry (it may have changed)
            lastOpenedFile.current = openedEntry
              ? { ...openedEntry }
              : fileSnapshot;
            isDescriptionChanged.current = false;
            setIsEditMode(false);
            openFsEntry(fileSnapshot);
          });
        } else {
          // user cancelled: discard changes and re-open the original entry
          isDescriptionChanged.current = false;
          lastOpenedFile.current = { ...openedEntry };
          setIsEditDescriptionMode(false);
          openFsEntry(openedEntry);
        }
      },
      'cancelSaveDescCloseDialog',
      'confirmSaveDescCloseDialog',
      'confirmDescDialogContent',
    );
  }

  const context = useMemo(
    () => ({
      description: lastOpenedFile.current?.meta?.description,
      isDescriptionChanged: isDescriptionChanged.current,
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
    ],
  );

  return (
    <FilePropertiesContext.Provider value={context}>
      {children}
    </FilePropertiesContext.Provider>
  );
};
