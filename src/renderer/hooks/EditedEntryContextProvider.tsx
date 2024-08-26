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
import { extractTagsAsObjects } from '@tagspaces/tagspaces-common/paths';
import { TS } from '-/tagspaces.namespace';
import AppConfig from '-/AppConfig';

type EditedEntryContextData = {
  actions: TS.EditAction[];
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
  const actions = useRef<TS.EditAction[]>(undefined);
  //const { getAllPropertiesPromise } = useDirectoryContentContext(); // cannot be injected here!

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  function setReflectActions(...actionsArray: TS.EditAction[]) {
    actions.current = actionsArray;
    forceUpdate();
  }

  function reflectDeleteEntries(...entries: TS.FileSystemEntry[]) {
    const actionsArray = [];
    for (let i = 0; i < entries.length; i++) {
      const currentAction: TS.EditAction = {
        action: 'delete',
        entry: entries[i],
      };
      actionsArray.push(currentAction);
    }
    actions.current = actionsArray;
    forceUpdate();
  }

  function reflectUpdateMeta(...entries: TS.FileSystemEntry[]) {
    actions.current = entries.map((fsEntry) => ({
      action: 'update',
      entry: fsEntry,
      oldEntryPath: fsEntry.path,
    }));
    forceUpdate();
  }

  function reflectAddEntryPath(
    ...entriesPromises: Promise<TS.FileSystemEntry>[]
  ): Promise<boolean> {
    //const entriesPromises = paths.map((path) => getAllPropertiesPromise(path));
    return Promise.all(entriesPromises).then((entries) => {
      const actions: TS.EditAction[] = entries
        .filter((entry) => entry)
        .map((entry) => ({
          action: 'add',
          entry: entry,
        }));
      if (actions.length > 0) {
        setReflectActions(...actions);
      }
      return true;
    });
  }

  /**
   * warning: no entry.meta will be added in reflectAddEntry. To add meta use reflectAddEntryPath
   * @param entry
   * @param open
   * @param actionSource
   */
  function reflectAddEntry(
    entry: TS.FileSystemEntry,
    open = true,
    actionSource: TS.ActionSource = 'local',
  ) {
    if (!entry.tags || entry.tags.length === 0) {
      entry.tags = extractTagsAsObjects(entry.name, AppConfig.tagDelimiter);
    }
    const currentAction: TS.EditAction = {
      action: 'add',
      entry: entry,
      open: open,
      ...(typeof actionSource !== 'boolean' && { source: actionSource }),
    };
    actions.current = [currentAction];
    forceUpdate();
  }

  const context = useMemo(() => {
    return {
      actions: actions.current,
      reflectUpdateMeta,
      setReflectActions,
      reflectDeleteEntries,
      reflectAddEntryPath,
      reflectAddEntry,
    };
  }, [actions.current]);

  return (
    <EditedEntryContext.Provider value={context}>
      {children}
    </EditedEntryContext.Provider>
  );
};
