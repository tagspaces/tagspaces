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
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import LoadingLazy from '-/components/LoadingLazy';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';

type DirectoryMenuContextData = {
  openDirectoryMenu: (
    event: React.MouseEvent<Element, MouseEvent>,
    dirPath: string,
    x?: number,
    y?: number,
    mode?: boolean,
    perspectives?: boolean,
    items?: React.ReactNode,
  ) => void;
  closeDirectoryMenu: () => void;
  openRenameEntryDialog: () => void;
  closeRenameEntryDialog: () => void;
};

export const DirectoryMenuContext = createContext<DirectoryMenuContextData>({
  openDirectoryMenu: undefined,
  closeDirectoryMenu: undefined,
  openRenameEntryDialog: undefined,
  closeRenameEntryDialog: undefined,
});

export type DirectoryMenuContextProviderProps = {
  children: React.ReactNode;
};

const DirectoryMenu = React.lazy(
  () =>
    import(/* webpackChunkName: "DirectoryMenu" */ '../../menus/DirectoryMenu'),
);
const RenameEntryDialog = React.lazy(
  () =>
    import(
      /* webpackChunkName: "DirectoryMenu" */ '../../dialogs/RenameEntryDialog'
    ),
);

export const DirectoryMenuContextProvider = ({
  children,
}: DirectoryMenuContextProviderProps) => {
  // const { currentDirectoryPath } = useDirectoryContentContext();
  const { setSelectedEntries } = useSelectedEntriesContext();
  const [directoryContextMenuAnchorEl, setDirectoryContextMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const openRenameEntry = useRef<boolean>(false);
  const perspectiveMode = useRef<boolean>(false);
  const switchPerspectives = useRef<boolean>(false);
  const directoryPath = useRef<string>(undefined);
  const mouseX = useRef<number>(undefined);
  const mouseY = useRef<number>(undefined);
  const menuItems = useRef<React.ReactNode>(undefined);

  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  const openDirectoryMenu = (
    event: React.MouseEvent<Element, MouseEvent>,
    dirPath: string,
    x?: number,
    y?: number,
    mode?: boolean,
    perspectives?: boolean,
    items?: React.ReactNode,
  ) => {
    event.preventDefault();
    setSelectedEntries([]);
    directoryPath.current = dirPath;
    mouseX.current = x;
    mouseY.current = y;
    perspectiveMode.current = mode;
    switchPerspectives.current = perspectives;
    menuItems.current = items;
    // @ts-ignore
    setDirectoryContextMenuAnchorEl(event.currentTarget);
  };

  const closeDirectoryMenu = () => {
    directoryPath.current = undefined;
    mouseX.current = undefined;
    mouseY.current = undefined;
    perspectiveMode.current = false;
    switchPerspectives.current = false;
    menuItems.current = undefined;
    setDirectoryContextMenuAnchorEl(null);
  };

  const openRenameEntryDialog = () => {
    openRenameEntry.current = true;
    forceUpdate();
  };

  const closeRenameEntryDialog = () => {
    openRenameEntry.current = false;
    forceUpdate();
  };

  function DirectoryMenuAsync(props) {
    return (
      <React.Suspense fallback={<LoadingLazy />}>
        <DirectoryMenu {...props} />
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

  const context = useMemo(() => {
    return {
      openDirectoryMenu,
      closeDirectoryMenu,
      openRenameEntryDialog,
      closeRenameEntryDialog,
    };
  }, []);

  return (
    <DirectoryMenuContext.Provider value={context}>
      <RenameEntryDialogAsync
        open={openRenameEntry.current}
        onClose={closeRenameEntryDialog}
      />
      <DirectoryMenuAsync
        open={Boolean(directoryContextMenuAnchorEl)}
        onClose={() => directoryContextMenuAnchorEl}
        anchorEl={directoryContextMenuAnchorEl}
        perspectiveMode={perspectiveMode.current}
        switchPerspectives={switchPerspectives.current}
        directoryPath={directoryPath.current}
        mouseX={mouseX.current}
        mouseY={mouseY.current}
        openRenameDirectoryDialog={openRenameEntryDialog}
      />
      {children}
    </DirectoryMenuContext.Provider>
  );
};
