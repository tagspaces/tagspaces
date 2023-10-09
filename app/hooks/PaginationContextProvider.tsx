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

import React, { createContext, useEffect, useMemo, useState } from 'react';
import {
  getMetaFileLocationForDir,
  getMetaFileLocationForFile,
  getThumbFileLocationForDirectory,
  getThumbFileLocationForFile
} from '@tagspaces/tagspaces-common/paths';
import { getMetaForEntry } from '-/services/utils-io';
import PlatformIO from '-/services/platform-facade';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { defaultSettings } from '-/perspectives/grid-perspective';
import { useSortedDirContext } from '-/perspectives/grid-perspective/hooks/useSortedDirContext';
import { TS } from '-/tagspaces.namespace';
import AppConfig from '-/AppConfig';
import { useSelector } from 'react-redux';
import { getLastSearchTimestamp } from '-/reducers/app';
import useFirstRender from '-/utils/useFirstRender';

type PaginationContextData = {
  page: number;
  pageFiles: TS.FileSystemEntry[];
  setCurrentPage: (page: number) => Promise<boolean>;
  getThumbs: (meta: Array<any>) => Promise<TS.FileSystemEntry>[];
  updateEntries: (meta: Promise<TS.FileSystemEntry>[]) => Promise<boolean>;
  loadCurrentDirMeta: () => Promise<boolean>;
};

export const PaginationContext = createContext<PaginationContextData>({
  page: 1,
  pageFiles: [],
  setCurrentPage: () => Promise.resolve(false),
  getThumbs: () => [],
  updateEntries: () => Promise.resolve(false),
  loadCurrentDirMeta: () => Promise.resolve(false)
});

export type PaginationContextProviderProps = {
  children: React.ReactNode;
};

export const PaginationContextProvider = ({
  children
}: PaginationContextProviderProps) => {
  // const { t } = useTranslation();
  const initPage = 1;
  const {
    currentDirectoryPath,
    updateCurrentDirEntries,
    getEnhancedDir,
    currentDirectoryPerspective,
    isMetaFolderExist
  } = useDirectoryContentContext();
  const lastSearchTimestamp = useSelector(getLastSearchTimestamp);
  const { getSettings, sortedDirContent } = useSortedDirContext();

  const [page, setPage] = useState<number>(initPage);
  // const firstRender = useFirstRender();
  //const pageFiles = useRef<TS.FileSystemEntry[]>(getPageFiles(page));

  useEffect(() => {
    //pageFiles.current = getPageFiles(initPage);
    if (page !== initPage) {
      setPage(initPage);
    }
    if (isMetaFolderExist) {
      loadCurrentDirMeta().then(() => console.debug('meta loaded'));
    }
  }, [currentDirectoryPath, lastSearchTimestamp, isMetaFolderExist]);

  const pageFiles: TS.FileSystemEntry[] = useMemo(() => {
    const settings = getSettings(currentDirectoryPerspective);
    const gridPageLimit =
      settings && settings.gridPageLimit
        ? settings.gridPageLimit
        : defaultSettings.gridPageLimit;
    const files = sortedDirContent.filter(entry => entry && entry.isFile);
    const showPagination = gridPageLimit && files.length > gridPageLimit;
    if (showPagination) {
      const start = (page - 1) * gridPageLimit;
      return files.slice(start, start + gridPageLimit);
    }
    return files;
  }, [page, sortedDirContent]);

  function setCurrentPage(currentPage: number) {
    /*if (isMetaLoaded.current) {
      return true;
    }*/
    //pageFiles.current = getPageFiles(currentPage);
    setPage(currentPage);
    return loadCurrentDirMeta();
  }

  function loadCurrentDirMeta(): Promise<boolean> {
    return PlatformIO.listMetaDirectoryPromise(currentDirectoryPath)
      .then(meta => {
        //metaLoadedLock.current = false;
        //props.setIsMetaLoaded(true);
        // props.setMetaForCurrentDir(meta);
        const dirEntriesPromises = getDirEntriesPromises();
        const fileEntriesPromises = getFileEntriesPromises(meta);
        const thumbs = getThumbs(meta);
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
    sortedDirContent
      .filter(entry => !entry.isFile)
      .map(entry => getEnhancedDir(entry)); //Promise.resolve({ [entry.path]: getEnhancedDir(entry) }));

  const getFileEntriesPromises = (
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

  const getThumbs = (meta: Array<any>): Promise<TS.FileSystemEntry>[] =>
    pageFiles.map(entry => Promise.resolve(setThumbs(entry, meta)));
  //Promise.resolve({ [entry.path]: setThumbs(entry, meta) })

  const setThumbs = (
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

  /*const updateCurrentDirectoryEntries = entries => {
    const entriesEnhanced = [];
    entries.forEach(entry => {
      if (entry) {
        for (const [key, value] of Object.entries(entry)) {
          if (value) {
            // !checkEntryExist(key)) {
            entriesEnhanced.push(value);
          }
        }
      }
    });
    if (entriesEnhanced.length > 0) {
      updateCurrentDirEntries(entriesEnhanced);
    }
  };*/

  const context = useMemo(() => {
    return {
      page,
      pageFiles,
      setCurrentPage,
      getThumbs,
      updateEntries,
      loadCurrentDirMeta
    };
  }, [page, pageFiles, currentDirectoryPath]);

  return (
    <PaginationContext.Provider value={context}>
      {children}
    </PaginationContext.Provider>
  );
};
