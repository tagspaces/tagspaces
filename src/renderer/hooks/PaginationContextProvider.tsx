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
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { defaultSettings } from '-/perspectives/grid';
import { useSortedDirContext } from '-/perspectives/grid/hooks/useSortedDirContext';
import { TS } from '-/tagspaces.namespace';
import { usePerspectiveSettingsContext } from '-/hooks/usePerspectiveSettingsContext';

type PaginationContextData = {
  page: number;
  pageFiles: TS.FileSystemEntry[];
  setCurrentPage: (page: number) => void;
};

export const PaginationContext = createContext<PaginationContextData>({
  page: 1,
  pageFiles: [],
  setCurrentPage: undefined,
});

export type PaginationContextProviderProps = {
  children: React.ReactNode;
};

export const PaginationContextProvider = ({
  children,
}: PaginationContextProviderProps) => {
  const initPage = 1;
  const { currentDirectoryPath, isSearchMode } = useDirectoryContentContext();
  const { settings } = usePerspectiveSettingsContext();
  const { sortedDirContent } = useSortedDirContext();

  const [page, setPage] = useState<number>(initPage);
  // const firstRender = useFirstRender();
  //const pageFiles = useRef<TS.FileSystemEntry[]>(getPageFiles(page));

  useEffect(() => {
    //pageFiles.current = getPageFiles(initPage);
    if (page !== initPage) {
      setPage(initPage);
    }
    /*if (isMetaFolderExist) {
      loadCurrentDirMeta(currentDirectoryPath, pageFiles).then(() =>
        console.debug('meta loaded')
      );
    }*/
  }, [currentDirectoryPath, isSearchMode]); //, isMetaFolderExist]);

  const pageFiles: TS.FileSystemEntry[] = useMemo(() => {
    return getPageFiles(page, sortedDirContent);
  }, [page, sortedDirContent, settings]);

  function getPageFiles(currentPage: number, dirContent: TS.FileSystemEntry[]) {
    const gridPageLimit =
      settings && settings.gridPageLimit
        ? settings.gridPageLimit
        : defaultSettings.gridPageLimit;
    const files = dirContent.filter((entry) => entry && entry.isFile);
    const showPagination = gridPageLimit && files.length > gridPageLimit;
    if (showPagination) {
      const start = (currentPage - 1) * gridPageLimit;
      return files.slice(start, start + gridPageLimit);
    }
    return files;
  }

  function setCurrentPage(currentPage: number) {
    setPage(currentPage);
    /*const entries = getPageFiles(currentPage, sortedDirContent);
    return generateThumbnails(entries).then(() => {
      return loadCurrentDirMeta(
        currentDirectoryPath,
        currentDirectoryEntries,
        entries
      ).then(entries => {
        updateCurrentDirEntries(entries);
        return true;
      });
    });*/
  }

  const context = useMemo(() => {
    return {
      page,
      pageFiles,
      setCurrentPage,
    };
  }, [page, pageFiles, currentDirectoryPath, settings]);

  return (
    <PaginationContext.Provider value={context}>
      {children}
    </PaginationContext.Provider>
  );
};
