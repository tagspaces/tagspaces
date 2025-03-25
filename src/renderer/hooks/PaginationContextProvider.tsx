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

import React, { createContext, useEffect, useMemo, useState } from 'react';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { defaultSettings } from '-/perspectives/grid';
import { useSortedDirContext } from '-/perspectives/grid/hooks/useSortedDirContext';
import { TS } from '-/tagspaces.namespace';
import { usePerspectiveSettingsContext } from '-/hooks/usePerspectiveSettingsContext';
import { useEditedEntryMetaContext } from '-/hooks/useEditedEntryMetaContext';

type PaginationContextData = {
  page: number;
  //pageFiles: TS.FileSystemEntry[];
  getResentPageFiles: () => TS.FileSystemEntry[];
  setCurrentPage: (page?: number) => void;
};

export const PaginationContext = createContext<PaginationContextData>({
  page: 1,
  //pageFiles: [],
  getResentPageFiles: undefined,
  setCurrentPage: undefined,
});

export type PaginationContextProviderProps = {
  children: React.ReactNode;
};

export const PaginationContextProvider = ({
  children,
}: PaginationContextProviderProps) => {
  const initPage = 1;
  const { currentDirectoryPath, searchQuery } = useDirectoryContentContext();
  const { setReflectMetaActions } = useEditedEntryMetaContext();
  const { settings, showDirectories } = usePerspectiveSettingsContext();
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
  }, [currentDirectoryPath, searchQuery, settings]); //, isSearchMode isMetaFolderExist]);

  /*const pageFiles: TS.FileSystemEntry[] = useMemo(() => {
    return getPageFiles(page, sortedDirContent);
  }, [page, sortedDirContent, settings]);*/

  function getResentPageFiles() {
    return getPageFiles(page, sortedDirContent);
  }

  function getPageFiles(currentPage: number, dirContent: TS.FileSystemEntry[]) {
    const gridPageLimit =
      settings && settings.gridPageLimit
        ? settings.gridPageLimit
        : defaultSettings.gridPageLimit;
    const files = dirContent.filter((entry) => {
      if (entry) {
        if (!showDirectories) {
          return entry.isFile;
        }
        return true;
      }
      return false;
    });
    const showPagination = gridPageLimit && files.length > gridPageLimit;
    if (showPagination) {
      const start = (currentPage - 1) * gridPageLimit;
      return files.slice(start, start + gridPageLimit);
    }
    return files;
  }

  function setCurrentPage(currentPage?: number) {
    const cPage = currentPage ? currentPage : initPage;
    if (page !== cPage) {
      setPage(cPage);
      const files = getPageFiles(cPage, sortedDirContent);
      if (files && files.length > 0) {
        const actions: TS.EditMetaAction[] = files.map((file) => ({
          action: 'thumbGenerate',
          entry: file,
        }));
        setReflectMetaActions(...actions);
      }
    }
  }

  const context = useMemo(() => {
    return {
      page,
      getResentPageFiles,
      setCurrentPage,
    };
  }, [page, currentDirectoryPath, sortedDirContent, settings]);

  return (
    <PaginationContext.Provider value={context}>
      {children}
    </PaginationContext.Provider>
  );
};
