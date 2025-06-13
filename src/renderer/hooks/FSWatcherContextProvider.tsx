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

import React, { createContext, useEffect, useMemo, useRef } from 'react';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import AppConfig from '-/AppConfig';
import {
  extractContainingDirectoryPath,
  getFileLocationFromMetaFile,
} from '@tagspaces/tagspaces-common/paths';
import { locationType } from '@tagspaces/tagspaces-common/misc';
import { PerspectiveIDs } from '-/perspectives';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { Changed } from '../../main/chokidarWatcher';
import { useEditedEntryContext } from '-/hooks/useEditedEntryContext';
import { TS } from '-/tagspaces.namespace';
import { watchFolderMessage } from '-/services/utils-io';
import { Pro } from '-/pro';

type FSWatcherContextData = {
  ignored: string[];
  stopWatching: () => void;
  folderChanged: (event: string, path: string) => void;
  addToIgnored: (path: string) => void;
  removeFromIgnored: (path: string) => void;
  ignoreByWatcher: (...paths: string[]) => void;
  deignoreByWatcher: (...paths: string[]) => void;
};

export const FSWatcherContext = createContext<FSWatcherContextData>({
  ignored: undefined,
  folderChanged: undefined,
  stopWatching: undefined,
  addToIgnored: undefined,
  removeFromIgnored: undefined,
  ignoreByWatcher: undefined,
  deignoreByWatcher: undefined,
});

export type FSWatcherContextProviderProps = {
  children: React.ReactNode;
};

export const FSWatcherContextProvider = ({
  children,
}: FSWatcherContextProviderProps) => {
  const { currentLocationId, findLocation } = useCurrentLocationContext();
  const {
    getAllPropertiesPromise,
    currentDirectoryEntries,
    loadDirectoryContent,
    currentDirectoryPath,
    currentPerspective,
  } = useDirectoryContentContext();
  const { setReflectActions, reflectUpdateMeta } = useEditedEntryContext();
  const ignored = useRef<string[]>([]);
  const watchingFolderPath = useRef<string>(undefined);
  let timer; // Timer variable to delay batch execution
  const actionsQueue: TS.EditAction[] = [];
  const currentLocation = findLocation();

  useEffect(() => {
    if (
      currentLocation &&
      currentLocation.watchForChanges &&
      currentLocation.type !== locationType.TYPE_CLOUD
    ) {
      if (currentDirectoryPath && currentDirectoryPath.length > 0) {
        const depth = currentPerspective === PerspectiveIDs.KANBAN ? 3 : 1;

        watchFolder(currentDirectoryPath, depth);
      }
    } else {
      stopWatching();
    }
  }, [currentLocationId, currentDirectoryPath]);

  function watchFolder(locationPath, depth) {
    if (
      Pro &&
      currentLocation &&
      !currentLocation.haveObjectStoreSupport() &&
      !currentLocation.haveWebDavSupport()
    ) {
      console.log('Start watching: ' + locationPath);
      stopWatching();
      watchingFolderPath.current = locationPath;
      watchFolderMessage(locationPath, depth);
    }
  }

  function executeBatchActions() {
    if (actionsQueue.length > 0) {
      setReflectActions(...actionsQueue);
      // Clear the actions queue after executing batch changes
      actionsQueue.length = 0;
    }
  }

  const folderChanged = useMemo(() => {
    return (event, path): void => {
      console.log(`File ${path} has been ${event}`);
      if (watchingFolderPath.current === undefined) {
        return;
      }
      if (path.endsWith(AppConfig.metaFolder)) {
        // .ts dir created
        return;
      }
      // console.log(`ignored list:` + JSON.stringify(ignored.current));
      const pathParts = path.split(
        currentLocation
          ? currentLocation.getDirSeparator()
          : AppConfig.dirSeparator,
      );
      for (let i = 0; i < ignored.current.length; i++) {
        if (
          path.startsWith(ignored.current[i]) ||
          pathParts.includes(ignored.current[i])
        ) {
          // ignored.current.splice(i, 1);
          return;
        }
      }
      // Clear existing timer
      clearTimeout(timer);

      // Set timer to delay batch execution
      timer = setTimeout(() => {
        // Execute batch changes after 1 second delay
        executeBatchActions();
      }, 1000);

      switch (event) {
        case 'unlink':
        case 'unlinkDir':
          if (
            //currentDirectoryEntries.some((entry) => path === entry.path) &&
            !path.includes(AppConfig.metaFolder)
          ) {
            actionsQueue.push({
              action: 'delete',
              entry: currentLocation.toFsEntry(path, false),
              source: 'fsWatcher',
            });
            //reflectDeleteEntries(toFsEntry(path, false, currentLocation.uuid));
          }
          break;
        case 'add':
          if (!path.includes(AppConfig.metaFolder)) {
            actionsQueue.push({
              action: 'add',
              entry: currentLocation.toFsEntry(path, true),
              open: false,
              source: 'fsWatcher',
            });
            // reflectAddEntry(toFsEntry(path, true, currentLocation.uuid));
          }
          break;
        case 'addDir':
          if (!path.includes(AppConfig.metaFolder)) {
            actionsQueue.push({
              action: 'add',
              entry: currentLocation.toFsEntry(path, false),
              open: false,
              source: 'fsWatcher',
            });
            //reflectAddEntry(toFsEntry(path, false, currentLocation.uuid));
          }
          break;
        case 'change':
          console.log(`File ${path} has been changed`);

          // watching for changed sidecar files .ts/file.jpg.json
          if (path.includes(AppConfig.metaFolder)) {
            // todo reload meta for changed file only
            if (path.endsWith(AppConfig.metaFileExt)) {
              // endsWith json
              const filePath = getFileLocationFromMetaFile(
                path,
                currentLocation?.getDirSeparator(),
              );
              getAllPropertiesPromise(filePath).then((entry) =>
                reflectUpdateMeta(entry),
              );
            }
            if (path.endsWith(AppConfig.metaFolderFile)) {
              // endsWith tsm.json
              const directoryPath = getFileLocationFromMetaFile(
                path,
                currentLocation?.getDirSeparator(),
              );
              loadDirectoryContent(
                extractContainingDirectoryPath(
                  directoryPath,
                  currentLocation?.getDirSeparator(),
                ),
                false,
                true,
              );
            }
          }
          // } else { // TODO a separate watcher for the currently opened file should be created
          //   // handle file content changed
          //   dispatch(appActions.reflectUpdateOpenedFileContent(path));
          // }
          break;
        default:
          console.log(event, path);
          break;
      }
    };
  }, [currentDirectoryEntries, ignored.current]);

  useEffect(() => {
    if (AppConfig.isElectron) {
      window.electronIO.ipcRenderer.on('folderChanged', (message: Changed) => {
        const { path, eventName } = message;
        folderChanged(eventName, path);
      });

      return () => {
        window.electronIO.ipcRenderer.removeAllListeners('folderChanged');
      };
    }
  }, [folderChanged]);

  function stopWatching() {
    watchingFolderPath.current = undefined;
  }

  function isWatching() {
    return watchingFolderPath.current !== undefined; //watcher !== undefined; //&& !watcher.closed;
  }

  function addToIgnored(path: string) {
    if (path) {
      const index = ignored.current.indexOf(path);
      if (index === -1) {
        ignored.current.push(path);
      }
    }
  }

  function removeFromIgnored(path: string) {
    setTimeout(() => {
      for (let i = 0; i < ignored.current.length; i++) {
        const pathParts = ignored.current[i].split(
          currentLocation
            ? currentLocation.getDirSeparator()
            : AppConfig.dirSeparator,
        );
        if (path.startsWith(ignored.current[i]) || pathParts.includes(path)) {
          ignored.current.splice(i, 1);
        }
      }
    }, 2000);
  }

  function ignoreByWatcher(...paths) {
    if (isWatching()) {
      for (let i = 0; i < paths.length; i += 1) {
        addToIgnored(paths[i]);
      }
    }
  }

  function deignoreByWatcher(...paths) {
    if (isWatching()) {
      for (let i = 0; i < paths.length; i += 1) {
        removeFromIgnored(paths[i]);
      }
    }
  }

  const context = useMemo(() => {
    return {
      ignored: ignored.current,
      stopWatching,
      addToIgnored,
      folderChanged,
      removeFromIgnored,
      ignoreByWatcher,
      deignoreByWatcher,
    };
  }, [ignored.current]);

  return (
    <FSWatcherContext.Provider value={context}>
      {children}
    </FSWatcherContext.Provider>
  );
};
