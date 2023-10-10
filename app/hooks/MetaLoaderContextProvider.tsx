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

import React, { createContext, useMemo } from 'react';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import {
  getMetaFileLocationForFile,
  getThumbFileLocationForFile
} from '@tagspaces/tagspaces-common/paths';
import PlatformIO from '-/services/platform-facade';
import { getMetaForEntry } from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import AppConfig from '-/AppConfig';

type MetaLoaderContextData = {
  loadCurrentDirMeta: (pageFiles?: TS.FileSystemEntry[]) => Promise<boolean>;
};

export const MetaLoaderContext = createContext<MetaLoaderContextData>({
  loadCurrentDirMeta: () => Promise.resolve(false)
});

export type MetaLoaderContextProviderProps = {
  children: React.ReactNode;
};

export const MetaLoaderContextProvider = ({
  children
}: MetaLoaderContextProviderProps) => {
  const {
    currentDirectoryEntries,
    currentDirectoryPath,
    getEnhancedDir,
    updateCurrentDirEntries
  } = useDirectoryContentContext();

  function loadCurrentDirMeta(
    pageFiles?: TS.FileSystemEntry[]
  ): Promise<boolean> {
    return PlatformIO.listMetaDirectoryPromise(currentDirectoryPath)
      .then(meta => {
        //metaLoadedLock.current = false;
        //props.setIsMetaLoaded(true);
        // props.setMetaForCurrentDir(meta);
        const dirEntriesPromises = getDirEntriesPromises();
        const files = pageFiles
          ? pageFiles
          : currentDirectoryEntries.filter(entry => entry.isFile);
        const fileEntriesPromises = getFileEntriesPromises(files, meta);
        const thumbs = getThumbs(files, meta);
        return updateEntries([
          ...dirEntriesPromises,
          ...fileEntriesPromises,
          ...thumbs
        ]);
      })
      .catch(ex => {
        console.error(ex);
        return false;
      });
  }

  const getDirEntriesPromises = (): Promise<any>[] =>
    currentDirectoryEntries
      .filter(entry => !entry.isFile)
      .map(entry => getEnhancedDir(entry)); //Promise.resolve({ [entry.path]: getEnhancedDir(entry) }));

  const getFileEntriesPromises = (
    pageFiles: TS.FileSystemEntry[],
    meta: Array<any>
  ): Promise<TS.FileSystemEntry>[] =>
    pageFiles.map(entry => {
      const metaFilePath = getMetaFileLocationForFile(
        entry.path,
        PlatformIO.getDirSeparator()
      );
      if (
        // check if metaFilePath exist in listMetaDirectory content
        meta.some(metaFile => metaFilePath.endsWith(metaFile.path)) &&
        // !checkEntryExist(entry.path) &&
        entry.path.indexOf(
          AppConfig.metaFolder + PlatformIO.getDirSeparator()
        ) === -1
      ) {
        return getMetaForEntry(
          entry,
          metaFilePath
        ); /*Promise.resolve({
          [entry.path]: getMetaForEntry(entry, metaFilePath)
        });*/
      }
      return Promise.resolve(undefined); //Promise.resolve({ [entry.path]: undefined });
    });

  const getThumbs = (
    pageFiles: TS.FileSystemEntry[],
    meta: Array<any>
  ): Promise<TS.FileSystemEntry>[] =>
    pageFiles.map(entry => Promise.resolve(setThumbForEntry(entry, meta)));

  const setThumbForEntry = (
    entry: TS.FileSystemEntry,
    meta: Array<any>
  ): TS.FileSystemEntry => {
    const thumbEntry = { ...entry };
    let thumbPath = getThumbFileLocationForFile(
      entry.path,
      PlatformIO.getDirSeparator(),
      false
    );
    if (thumbPath && meta.some(metaFile => thumbPath.endsWith(metaFile.path))) {
      thumbEntry.thumbPath = thumbPath;
      if (
        PlatformIO.haveObjectStoreSupport() ||
        PlatformIO.haveWebDavSupport()
      ) {
        if (thumbPath && thumbPath.startsWith('/')) {
          thumbPath = thumbPath.substring(1);
        }

        thumbPath = PlatformIO.getURLforPath(thumbPath, 604800);
        if (thumbPath) {
          thumbEntry.thumbPath = thumbPath;
        }
      }
    }
    return thumbEntry;
  };

  const updateEntries = metaPromises => {
    const catchHandler = error => undefined;
    return Promise.all(metaPromises.map(promise => promise.catch(catchHandler)))
      .then(entries => {
        updateCurrentDirEntries(entries);
        //updateCurrentDirectoryEntries(entries); // .filter(entry => entry !== undefined));
        // entriesUpdated.current = entries;
        return true;
      })
      .catch(err => {
        console.error('err updateEntries:', err);
        return false;
      });
  };

  const context = useMemo(() => {
    return {
      loadCurrentDirMeta
    };
  }, [currentDirectoryEntries]);

  return (
    <MetaLoaderContext.Provider value={context}>
      {children}
    </MetaLoaderContext.Provider>
  );
};
