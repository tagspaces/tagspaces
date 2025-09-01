/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces GmbH
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
  useRef,
  useState,
} from 'react';
import { extractContainingDirectoryPath } from '@tagspaces/tagspaces-common/paths';
import LoadingLazy from '-/components/LoadingLazy';
import { TS } from '-/tagspaces.namespace';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { Pro } from '-/pro';

type MenuContextData = {
  openMenu: (
    event: MouseEvent | React.MouseEvent<Element, MouseEvent>,
    entry: TS.FileSystemEntry,
  ) => void;
  openDirectoryMenu: (
    event: MouseEvent | React.MouseEvent<Element, MouseEvent>,
    dirPath: string,
    mode?: boolean,
    perspectives?: boolean,
    items?: React.ReactNode,
  ) => void;
  openFileMenu: (
    event: MouseEvent | React.MouseEvent<Element, MouseEvent>,
    dirPath: string,
    orderTop?: (entry: TS.FileSystemEntry) => void,
    orderBottom?: (entry: TS.FileSystemEntry) => void,
  ) => void;
  // setMousePosition: (x: number, y: number) => void;
  closeDirectoryMenu: () => void;
  openRenameEntryDialog: () => void;
  closeRenameEntryDialog: () => void;
  openMoveCopyFilesDialog: (
    entries: TS.FileSystemEntry[],
    targetDirectory?: string,
    targetLocationId?: string,
  ) => void;
  closeMoveCopyFilesDialog: () => void;
  openAddRemoveTagsDialog: (entries: TS.FileSystemEntry[]) => void;
  closeAddRemoveTagsDialog: () => void;
  openShareFilesDialog: (entries?: TS.FileSystemEntry[]) => void;
  closeShareFilesDialog: () => void;
};

export const MenuContext = createContext<MenuContextData>({
  openMenu: undefined,
  openDirectoryMenu: undefined,
  openFileMenu: undefined,
  closeDirectoryMenu: undefined,
  openRenameEntryDialog: undefined,
  closeRenameEntryDialog: undefined,
  openMoveCopyFilesDialog: undefined,
  closeMoveCopyFilesDialog: undefined,
  openAddRemoveTagsDialog: undefined,
  closeAddRemoveTagsDialog: undefined,
  openShareFilesDialog: undefined,
  closeShareFilesDialog: undefined,
});

export type MenuContextProviderProps = {
  children: React.ReactNode;
};

const DirectoryMenu = React.lazy(
  () =>
    import(/* webpackChunkName: "DirectoryMenu" */ '../../menus/DirectoryMenu'),
);
const FileMenu = React.lazy(
  () => import(/* webpackChunkName: "FileMenu" */ '../../menus/FileMenu'),
);
const RenameEntryDialog = React.lazy(
  () =>
    import(
      /* webpackChunkName: "RenameEntryDialog" */ '../../dialogs/RenameEntryDialog'
    ),
);
const MoveCopyFilesDialog = React.lazy(
  () =>
    import(
      /* webpackChunkName: "MoveCopyFilesDialog" */ '../../dialogs/MoveCopyFilesDialog'
    ),
);
const AddRemoveTagsDialog = React.lazy(
  () =>
    import(
      /* webpackChunkName: "AddRemoveTagsDialog" */ '../../dialogs/AddRemoveTagsDialog'
    ),
);

export const MenuContextProvider = ({ children }: MenuContextProviderProps) => {
  const { findLocation } = useCurrentLocationContext();
  // const { showNotification } = useNotificationContext();
  const [directoryContextMenuAnchorEl, setDirectoryContextMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const [fileContextMenuAnchorEl, setFileContextMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const currentEntries = useRef<TS.FileSystemEntry[]>(undefined);
  const targetDirectory = useRef<string>(undefined);
  const targetLocationId = useRef<string>(undefined);
  const openRenameEntry = useRef<boolean>(false);
  const openMoveCopyFiles = useRef<boolean>(false);
  const openAddRemoveTags = useRef<boolean>(false);
  const openShareFiles = useRef<boolean>(false);
  const perspectiveMode = useRef<boolean>(false);
  const switchPerspectives = useRef<boolean>(false);
  const directoryPath = useRef<string>(undefined);
  const mouseX = useRef<number>(undefined);
  const mouseY = useRef<number>(undefined);
  const reorderTop = useRef<(entry: TS.FileSystemEntry) => void>(undefined);
  const reorderBottom = useRef<(entry: TS.FileSystemEntry) => void>(undefined);
  const menuItems = useRef<React.ReactNode>(undefined);

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  const ShareFilesDialog = Pro && Pro.UI ? Pro.UI.ShareFilesDialog : false;

  const openMenu = useCallback(
    (
      event: MouseEvent | React.MouseEvent<Element, MouseEvent>,
      entry: TS.FileSystemEntry,
    ) => {
      if (entry) {
        currentEntries.current = [entry];
        if (entry.isFile) {
          const currentLocation = findLocation(entry.locationID);
          const dirPath = extractContainingDirectoryPath(
            entry.path,
            currentLocation?.getDirSeparator(),
          );
          openFileMenu(event, dirPath);
        } else {
          openDirectoryMenu(event, entry.path, true);
        }
      }
    },
    [],
  );

  const openDirectoryMenu = useCallback(
    (
      event: MouseEvent | React.MouseEvent<Element, MouseEvent>,
      dirPath: string,
      mode?: boolean,
      perspectives?: boolean,
      items?: React.ReactNode,
    ) => {
      event.preventDefault();
      directoryPath.current = dirPath;
      mouseX.current = event.clientX;
      mouseY.current = event.clientY;
      perspectiveMode.current = mode;
      switchPerspectives.current = perspectives;
      menuItems.current = items;
      // @ts-ignore
      setDirectoryContextMenuAnchorEl(event.currentTarget);
    },
    [],
  );

  const closeDirectoryMenu = useCallback(() => {
    directoryPath.current = undefined;
    mouseX.current = undefined;
    mouseY.current = undefined;
    perspectiveMode.current = false;
    switchPerspectives.current = false;
    menuItems.current = undefined;
    setDirectoryContextMenuAnchorEl(null);
  }, []);

  const openFileMenu = useCallback(
    (
      event: MouseEvent | React.MouseEvent<Element, MouseEvent>,
      dirPath: string,
      orderTop?: (entry: TS.FileSystemEntry) => void,
      orderBottom?: (entry: TS.FileSystemEntry) => void,
    ) => {
      event.preventDefault();
      directoryPath.current = dirPath;
      mouseX.current = event.clientX;
      mouseY.current = event.clientY;
      reorderTop.current = orderTop;
      reorderBottom.current = orderBottom;
      // @ts-ignore
      setFileContextMenuAnchorEl(event.currentTarget);
    },
    [],
  );

  const closeFileMenu = useCallback(() => {
    directoryPath.current = undefined;
    mouseX.current = undefined;
    mouseY.current = undefined;
    setFileContextMenuAnchorEl(null);
  }, []);

  const openRenameEntryDialog = useCallback(() => {
    openRenameEntry.current = true;
    forceUpdate();
  }, []);

  const closeRenameEntryDialog = useCallback(() => {
    openRenameEntry.current = false;
    forceUpdate();
  }, []);

  const openMoveCopyFilesDialog = useCallback(
    (
      entries: TS.FileSystemEntry[],
      tDirectory?: string,
      tLocationId?: string,
    ) => {
      openMoveCopyFiles.current = true;
      currentEntries.current = entries;
      targetDirectory.current = tDirectory;
      targetLocationId.current = tLocationId;
      forceUpdate();
    },
    [],
  );

  const closeMoveCopyFilesDialog = useCallback(() => {
    openMoveCopyFiles.current = false;
    forceUpdate();
  }, []);

  const openAddRemoveTagsDialog = useCallback(
    (entries: TS.FileSystemEntry[]) => {
      openAddRemoveTags.current = true;
      currentEntries.current = entries;
      forceUpdate();
    },
    [],
  );

  const closeAddRemoveTagsDialog = useCallback(() => {
    openAddRemoveTags.current = false;
    forceUpdate();
  }, []);

  const openShareFilesDialog = useCallback((entries?: TS.FileSystemEntry[]) => {
    openShareFiles.current = true;
    currentEntries.current = entries;
    forceUpdate();
  }, []);

  const closeShareFilesDialog = useCallback(() => {
    openShareFiles.current = false;
    forceUpdate();
  }, []);

  // memoize provider value so consumers only re-render when callbacks change ---
  const context = useMemo(() => {
    return {
      openMenu,
      openDirectoryMenu,
      closeDirectoryMenu,
      openFileMenu,
      closeFileMenu,
      openRenameEntryDialog,
      closeRenameEntryDialog,
      openMoveCopyFilesDialog,
      closeMoveCopyFilesDialog,
      openAddRemoveTagsDialog,
      closeAddRemoveTagsDialog,
      openShareFilesDialog,
      closeShareFilesDialog,
    };
  }, []);

  function DirectoryMenuAsync(props) {
    return (
      <React.Suspense fallback={<LoadingLazy />}>
        <DirectoryMenu {...props} />
      </React.Suspense>
    );
  }
  function FileMenuAsync(props) {
    return (
      <React.Suspense fallback={<LoadingLazy />}>
        <FileMenu {...props} />
      </React.Suspense>
    );
  }
  function RenameEntryDialogAsync(props) {
    return (
      <React.Suspense fallback={<LoadingLazy />}>
        <RenameEntryDialog {...props} />
      </React.Suspense>
    );
  }
  function MoveCopyFilesDialogAsync(props) {
    return (
      <React.Suspense fallback={<LoadingLazy />}>
        <MoveCopyFilesDialog {...props} />
      </React.Suspense>
    );
  }
  function AddRemoveTagsDialogAsync(props) {
    return (
      <React.Suspense fallback={<LoadingLazy />}>
        <AddRemoveTagsDialog {...props} />
      </React.Suspense>
    );
  }

  return (
    <MenuContext.Provider value={context}>
      <RenameEntryDialogAsync
        open={openRenameEntry.current}
        onClose={closeRenameEntryDialog}
      />
      <MoveCopyFilesDialogAsync
        open={openMoveCopyFiles.current}
        onClose={closeMoveCopyFilesDialog}
        entries={currentEntries.current}
        targetDir={targetDirectory.current}
        targetLocationId={targetLocationId.current}
      />
      <AddRemoveTagsDialogAsync
        open={openAddRemoveTags.current}
        onClose={closeAddRemoveTagsDialog}
        selected={currentEntries.current}
      />
      {ShareFilesDialog && (
        <ShareFilesDialog
          open={openShareFiles.current}
          onClose={closeShareFilesDialog}
        />
      )}
      <DirectoryMenuAsync
        open={Boolean(directoryContextMenuAnchorEl)}
        onClose={closeDirectoryMenu}
        anchorEl={directoryContextMenuAnchorEl}
        perspectiveMode={perspectiveMode.current}
        switchPerspectives={switchPerspectives.current}
        directoryPath={directoryPath.current}
        mouseX={mouseX.current}
        mouseY={mouseY.current}
        items={menuItems.current}
        openRenameDirectoryDialog={openRenameEntryDialog}
      />
      <FileMenuAsync
        open={Boolean(fileContextMenuAnchorEl)}
        onClose={closeFileMenu}
        anchorEl={fileContextMenuAnchorEl}
        selectedFilePath={directoryPath.current}
        mouseX={mouseX.current}
        mouseY={mouseY.current}
        reorderTop={reorderTop.current}
        reorderBottom={reorderBottom.current}
      />
      {children}
    </MenuContext.Provider>
  );
};
