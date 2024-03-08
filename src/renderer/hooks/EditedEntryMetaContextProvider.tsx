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

import React, { createContext, useMemo, useReducer, useRef } from 'react';
import { getBgndFileLocationForDirectory } from '@tagspaces/tagspaces-common/paths';
import { TS } from '-/tagspaces.namespace';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { saveFsEntryMeta } from '-/utils/metaoperations';
import PlatformIO from '-/services/platform-facade';

type EditedEntryMetaContextData = {
  metaActions: TS.EditMetaAction[];
  setReflectMetaActions: (...actionsArray: TS.EditMetaAction[]) => void;
  setAutoSave: (
    entry: TS.FileSystemEntry,
    autoSave: boolean,
    locationId?,
  ) => Promise<boolean>;
  setDescriptionChange: (
    entry: TS.FileSystemEntry,
    description: string,
    locationId?,
  ) => Promise<boolean>;
  saveDirectoryPerspective: (
    entry: TS.FileSystemEntry,
    perspective: TS.PerspectiveType,
    locationId?,
  ) => Promise<boolean>;
  setBackgroundImageChange: (entry: TS.FileSystemEntry) => void;
  setBackgroundColorChange: (
    entry: TS.FileSystemEntry,
    color: string,
    locationId?,
  ) => Promise<boolean>;
  setThumbnailImageChange: (
    entry: TS.FileSystemEntry,
    thumbPath: string,
    locationId?,
  ) => Promise<boolean>;
};

export const EditedEntryMetaContext = createContext<EditedEntryMetaContextData>(
  {
    metaActions: undefined,
    setReflectMetaActions: undefined,
    setAutoSave: undefined,
    setDescriptionChange: undefined,
    saveDirectoryPerspective: undefined,
    setBackgroundImageChange: undefined,
    setBackgroundColorChange: undefined,
    setThumbnailImageChange: undefined,
  },
);

export type EditedEntryMetaContextProviderProps = {
  children: React.ReactNode;
};

export const EditedEntryMetaContextProvider = ({
  children,
}: EditedEntryMetaContextProviderProps) => {
  const { switchLocationTypeByID, switchCurrentLocationType } =
    useCurrentLocationContext();
  const metaActions = useRef<TS.EditMetaAction[]>(undefined);

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  function setReflectMetaActions(...actionsArray: TS.EditMetaAction[]) {
    metaActions.current = actionsArray;
    forceUpdate();
  }

  function setAutoSave(
    entry: TS.FileSystemEntry,
    autoSave: boolean,
    locationId = undefined,
  ) {
    return saveMetaData(entry.path, { autoSave }, locationId).then((meta) => {
      if (meta) {
        const action: TS.EditMetaAction = {
          action: 'autoSaveChange',
          entry: {
            ...entry,
            meta: meta,
          },
        };
        setReflectMetaActions(action);
        return true;
      }
      return false;
    });
  }

  function saveDirectoryPerspective(
    entry: TS.FileSystemEntry,
    perspective: TS.PerspectiveType,
    locationId = undefined,
  ): Promise<boolean> {
    return saveMetaData(entry.path, { perspective }, locationId).then(
      (meta) => {
        if (meta) {
          const action: TS.EditMetaAction = {
            action: 'perspectiveChange',
            entry: {
              ...entry,
              meta: meta,
            },
          };
          setReflectMetaActions(action);
          return true;
        }
        return false;
      },
    );
  }

  function setDescriptionChange(
    entry: TS.FileSystemEntry,
    description: string,
    locationId = undefined,
  ): Promise<boolean> {
    return saveMetaData(entry.path, { description }, locationId).then(
      (meta) => {
        if (meta) {
          const action: TS.EditMetaAction = {
            action: 'descriptionChange',
            entry: {
              ...entry,
              meta: meta,
            },
          };
          setReflectMetaActions(action);
          return true;
        }
        return false;
      },
    );
  }

  function setBackgroundImageChange(entry: TS.FileSystemEntry) {
    if (PlatformIO.haveObjectStoreSupport() || PlatformIO.haveWebDavSupport()) {
      // reload cache
      const folderBgndPath = getBgndFileLocationForDirectory(
        entry.path,
        PlatformIO.getDirSeparator(),
      );
      PlatformIO.generateURLforPath(folderBgndPath, 604800);
    }
    const action: TS.EditMetaAction = {
      action: 'bgdImgChange',
      entry: {
        ...entry,
        meta: { ...entry.meta, lastUpdated: new Date().getTime() },
      },
    };
    setReflectMetaActions(action);
  }

  function setBackgroundColorChange(
    entry: TS.FileSystemEntry,
    color: string,
    locationId = undefined,
  ): Promise<boolean> {
    return saveMetaData(entry.path, { color }, locationId).then((meta) => {
      if (meta) {
        const action: TS.EditMetaAction = {
          action: 'bgdColorChange',
          entry: {
            ...entry,
            meta: meta,
          },
        };
        setReflectMetaActions(action);
        return true;
      }
      return false;
    });
  }

  function setThumbnailImageChange(
    entry: TS.FileSystemEntry,
    thumbPath: string,
    locationId = undefined,
  ): Promise<boolean> {
    return saveMetaData(entry.path, { thumbPath }, locationId).then((meta) => {
      if (meta) {
        const action: TS.EditMetaAction = {
          action: 'thumbChange',
          entry: {
            ...entry,
            meta: meta,
          },
        };
        setReflectMetaActions(action);
        return true;
      }
      return false;
    });
  }

  function saveMetaData(
    path: string,
    meta: any,
    locationId = undefined,
  ): Promise<TS.FileSystemEntryMeta> {
    return switchLocationTypeByID(locationId).then((currentLocationId) =>
      saveFsEntryMeta(path, meta)
        .then((entryMeta) => entryMeta)
        .catch((error) => {
          if (currentLocationId) {
            switchCurrentLocationType();
          }
          console.warn('Error saving color for folder ' + error);
          // showNotification(t('Error saving color for folder'));
          return undefined;
        }),
    );
  }

  const context = useMemo(() => {
    return {
      metaActions: metaActions.current,
      setReflectMetaActions,
      setAutoSave,
      setDescriptionChange,
      saveDirectoryPerspective,
      setBackgroundImageChange,
      setBackgroundColorChange,
      setThumbnailImageChange,
    };
  }, [metaActions.current]);

  return (
    <EditedEntryMetaContext.Provider value={context}>
      {children}
    </EditedEntryMetaContext.Provider>
  );
};
