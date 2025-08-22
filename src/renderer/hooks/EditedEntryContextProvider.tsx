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
  useCallback,
  useMemo,
  useReducer,
  useState,
} from 'react';
import { extractTagsAsObjects } from '@tagspaces/tagspaces-common/paths';
import { TS } from '-/tagspaces.namespace';
import AppConfig from '-/AppConfig';
import { useSelector } from 'react-redux';
import { getTagDelimiter } from '-/reducers/settings';

type EditedEntryContextData = {
  actions: TS.EditAction[] | undefined;
  reflectUpdateMeta: (...entries: TS.FileSystemEntry[]) => void;
  setReflectActions: (...actionsArray: TS.EditAction[]) => void;
  reflectDeleteEntries: (...entries: TS.FileSystemEntry[]) => void;
  reflectAddEntryPath: (
    ...entriesPromises: Promise<TS.FileSystemEntry>[]
  ) => Promise<boolean>;
  reflectAddEntry: (
    entry: TS.FileSystemEntry,
    open?: boolean,
    source?: TS.ActionSource,
    skipSelection?: boolean,
  ) => void;
};

export const EditedEntryContext = createContext<EditedEntryContextData>({
  actions: undefined,
  reflectUpdateMeta: undefined,
  setReflectActions: undefined,
  reflectDeleteEntries: undefined,
  reflectAddEntryPath: undefined,
  reflectAddEntry: undefined,
});

export type EditedEntryContextProviderProps = {
  children: React.ReactNode;
};

export const EditedEntryContextProvider = ({
  children,
}: EditedEntryContextProviderProps) => {
  const tagDelimiter: string = useSelector(getTagDelimiter);
  const [actions, setActions] = useState<TS.EditAction[] | undefined>(
    undefined,
  );

  const setReflectActions = useCallback((...actionsArray: TS.EditAction[]) => {
    // keep the array as provided — immutability is preserved
    setActions(actionsArray.length > 0 ? [...actionsArray] : undefined);
  }, []);

  const reflectDeleteEntries = useCallback(
    (...entries: TS.FileSystemEntry[]) => {
      if (!entries || entries.length === 0) {
        setActions(undefined);
        return;
      }
      const actionsArray: TS.EditAction[] = entries.map((entry) => ({
        action: 'delete',
        entry,
      }));
      setActions(actionsArray);
    },
    [],
  );

  const reflectUpdateMeta = useCallback((...entries: TS.FileSystemEntry[]) => {
    if (!entries || entries.length === 0) {
      setActions(undefined);
      return;
    }
    const actionsArray: TS.EditAction[] = entries.map((fsEntry) => ({
      action: 'update',
      entry: fsEntry,
      oldEntryPath: fsEntry.path,
    }));
    setActions(actionsArray);
  }, []);

  const reflectAddEntryPath = useCallback(
    async (...entriesPromises: Promise<TS.FileSystemEntry>[]) => {
      try {
        const entries = await Promise.all(entriesPromises);
        const newActions: TS.EditAction[] = entries
          .filter((e) => !!e)
          .map((entry) => ({
            action: 'add',
            entry,
          }));
        if (newActions.length > 0) {
          setActions(newActions);
        }
        return true;
      } catch (err) {
        // handle silently or rethrow depending on your error policy
        // for now return false to indicate failure
        return false;
      }
    },
    [],
  );

  /**
   * warning: no entry.meta will be added in reflectAddEntry. To add meta use reflectAddEntryPath
   * @param entry
   * @param open
   * @param actionSource
   * @param skipSelection
   */
  const reflectAddEntry = useCallback(
    (
      entry: TS.FileSystemEntry,
      open = true,
      actionSource: TS.ActionSource = 'local',
      skipSelection: boolean = false,
    ) => {
      if (!entry.tags || entry.tags.length === 0) {
        entry.tags = extractTagsAsObjects(entry.name, tagDelimiter);
      }
      const currentAction: TS.EditAction = {
        action: 'add',
        entry,
        open,
        ...(typeof actionSource !== 'boolean' && { source: actionSource }),
        ...(skipSelection !== undefined && { skipSelection }),
      };
      setActions([currentAction]);
    },
    [],
  );

  const context = useMemo(
    () => ({
      actions,
      reflectUpdateMeta,
      setReflectActions,
      reflectDeleteEntries,
      reflectAddEntryPath,
      reflectAddEntry,
    }),
    [
      actions,
      reflectUpdateMeta,
      setReflectActions,
      reflectDeleteEntries,
      reflectAddEntryPath,
      reflectAddEntry,
    ],
  );

  return (
    <EditedEntryContext.Provider value={context}>
      {children}
    </EditedEntryContext.Provider>
  );
};
