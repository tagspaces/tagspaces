/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces UG (haftungsbeschraenkt)
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

import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { GlobalHotKeys } from 'react-hotkeys';
import { getDesktopMode, getKeyBindingObject } from '-/reducers/settings';
import FileMenu from '-/components/menus/FileMenu';
import DirectoryMenu from '-/components/menus/DirectoryMenu';
import EntryTagMenu from '-/components/menus/EntryTagMenu';
import AddRemoveTagsDialog from '-/components/dialogs/AddRemoveTagsDialog';
import MoveCopyFilesDialog from '-/components/dialogs/MoveCopyFilesDialog';
import TagDropContainer from '-/components/TagDropContainer';
import RowCell from '-/perspectives/list/components/RowCell';
import MainToolbar from '-/perspectives/grid/components/MainToolbar';
import SortingMenu from '-/perspectives/grid/components/SortingMenu';
import GridOptionsMenu from '-/perspectives/grid/components/GridOptionsMenu';
import GridPagination from '-/perspectives/grid/components/GridPagination';
import GridSettingsDialog from '-/perspectives/grid/components/GridSettingsDialog';
import AddTagToTagGroupDialog from '-/components/dialogs/AddTagToTagGroupDialog';
import { TS } from '-/tagspaces.namespace';
import { Pro } from '-/pro';
import Links from 'assets/links';
import { defaultSettings } from '../index';
import { fileOperationsEnabled } from '-/perspectives/common/main-container';
import { openURLExternally } from '-/services/utils-io';
import { useSortedDirContext } from '-/perspectives/grid/hooks/useSortedDirContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { usePerspectiveSettingsContext } from '-/hooks/usePerspectiveSettingsContext';
import { ListCellsStyleContextProvider } from '../hooks/ListCellsStyleProvider';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { usePerspectiveActionsContext } from '-/hooks/usePerspectiveActionsContext';
import useFirstRender from '-/utils/useFirstRender';
import { useDeleteMultipleEntriesDialogContext } from '-/components/dialogs/hooks/useDeleteMultipleEntriesDialogContext';

interface Props {
  openRenameEntryDialog: () => void;
}

function ListPerspective(props: Props) {
  const { openRenameEntryDialog } = props;

  const { openEntry, openPrevFile, openNextFile } = useOpenedEntryContext();
  const { actions } = usePerspectiveActionsContext();
  const { showDirectories } = usePerspectiveSettingsContext();
  const { currentLocation } = useCurrentLocationContext();
  const { openDirectory, currentDirectoryPath } = useDirectoryContentContext();
  const { openFileNatively, duplicateFile } = useIOActionsContext();
  const { openDeleteMultipleEntriesDialog } =
    useDeleteMultipleEntriesDialogContext();

  const { sortedDirContent, sortBy, orderBy, setSortBy, setOrderBy } =
    useSortedDirContext();
  const desktopMode = useSelector(getDesktopMode);
  const { selectedEntries, setSelectedEntries, lastSelectedEntryPath } =
    useSelectedEntriesContext();
  const keyBindings = useSelector(getKeyBindingObject);

  // Create functions that dispatch actions
  const handleSetSelectedEntries = (entries: Array<TS.FileSystemEntry>) => {
    const selected = showDirectories
      ? entries
      : entries.filter((entry) => entry.isFile);
    setSelectedEntries(selected);
  };

  const ShareFilesDialog = Pro && Pro.UI ? Pro.UI.ShareFilesDialog : false;

  const [mouseX, setMouseX] = useState<number>(undefined);
  const [mouseY, setMouseY] = useState<number>(undefined);
  // const selectedEntry = useRef<FileSystemEntry>(undefined);
  const selectedEntryPath = useRef<string>(undefined);
  const selectedTag = useRef<TS.Tag | null>(null);
  const perspectiveMode = useRef<boolean>(true);
  const [fileContextMenuAnchorEl, setFileContextMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const [dirContextMenuAnchorEl, setDirContextMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const [tagContextMenuAnchorEl, setTagContextMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const [sortingContextMenuAnchorEl, setSortingContextMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const [optionsContextMenuAnchorEl, setOptionsContextMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const [isAddTagDialogOpened, setIsAddTagDialogOpened] =
    useState<TS.Tag>(undefined);
  const [isMoveCopyFilesDialogOpened, setIsMoveCopyFilesDialogOpened] =
    useState<boolean>(false);
  const [isShareFilesDialogOpened, setIsShareFilesDialogOpened] =
    useState<boolean>(false);
  const [isAddRemoveTagsDialogOpened, setIsAddRemoveTagsDialogOpened] =
    useState<boolean>(false);
  const [isGridSettingsDialogOpened, setIsGridSettingsDialogOpened] =
    useState<boolean>(false);
  const firstRender = useFirstRender();

  useEffect(() => {
    if (!firstRender && actions && actions.length > 0) {
      for (const action of actions) {
        if (action.action === 'openNext') {
          openNextFile(sortedDirContent);
        } else if (action.action === 'openPrevious') {
          openPrevFile(sortedDirContent);
        }
      }
    }
  }, [actions]);

  const handleSortBy = (handleSort) => {
    if (sortBy !== handleSort) {
      setSortBy(handleSort);
    } else {
      setOrderBy(!orderBy);
    }
    setSortingContextMenuAnchorEl(null);
  };

  const handleSortingMenu = (event) => {
    const anchor = event ? event.currentTarget : null;
    setSortingContextMenuAnchorEl(anchor);
  };

  const handleExportCsvMenu = () => {
    if (Pro) {
      if (selectedEntries && selectedEntries.length > 0) {
        Pro.exportAsCsv.ExportAsCsv(selectedEntries);
      } else {
        Pro.exportAsCsv.ExportAsCsv(sortedDirContent);
      }
    }
  };

  const clearSelection = () => {
    setSelectedEntries([]);
    selectedEntryPath.current = undefined;
  };

  const toggleSelectAllFiles = () => {
    if (selectedEntries.length > 1) {
      clearSelection();
    } else {
      handleSetSelectedEntries(sortedDirContent);
    }
  };

  const openHelpWebPage = () => {
    closeOptionsMenu();
    openURLExternally(Links.documentationLinks.defaultPerspective, true);
  };

  const openSettings = () => {
    closeOptionsMenu();
    setIsGridSettingsDialogOpened(true);
  };

  const handleTagMenu = (
    event: React.ChangeEvent<HTMLInputElement>,
    tag: TS.Tag,
    entryPath: string,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    selectedTag.current = tag;
    selectedEntryPath.current = entryPath;
    setTagContextMenuAnchorEl(event.currentTarget);
  };

  const closeOptionsMenu = () => {
    setOptionsContextMenuAnchorEl(null);
  };

  const openMoveCopyFilesDialog = () => {
    setIsMoveCopyFilesDialogOpened(true);
  };

  const openShareFilesDialog = () => {
    if (currentLocation && currentLocation.haveObjectStoreSupport()) {
      setIsShareFilesDialogOpened(true);
    }
  };

  const openAddRemoveTagsDialog = () => {
    setIsAddRemoveTagsDialogOpened(true);
  };

  const keyMap = {
    nextDocument: keyBindings.nextDocument,
    prevDocument: keyBindings.prevDocument,
    selectAll: keyBindings.selectAll,
    deleteDocument: keyBindings.deleteDocument,
    addRemoveTags: keyBindings.addRemoveTags,
    renameFile: keyBindings.renameFile,
    duplicateFile: keyBindings.duplicateFile,
    copyMoveSelectedEntries: keyBindings.copyMoveSelectedEntries,
    openEntry: keyBindings.openEntry,
    openEntryDetails: keyBindings.openEntryDetails,
    openFileExternally: keyBindings.openFileExternally,
    reloadDocument: keyBindings.reloadDocument,
  };

  const onContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setMouseX(event.clientX);
    setMouseY(event.clientY);
    if (selectedEntries.length > 0) {
      setSelectedEntries([]);
    }
    perspectiveMode.current = false;
    setDirContextMenuAnchorEl(event.currentTarget);
  };

  const onClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (selectedEntries.length > 0) {
      setSelectedEntries([]);
    }
  };

  const keyBindingHandlers = {
    nextDocument: () => openNextFile(sortedDirContent),
    prevDocument: () => openPrevFile(sortedDirContent),
    selectAll: () => toggleSelectAllFiles(),
    deleteDocument: () => {
      if (fileOperationsEnabled(selectedEntries)) {
        openDeleteMultipleEntriesDialog();
      }
    },
    addRemoveTags: () => {
      if (lastSelectedEntryPath) {
        openAddRemoveTagsDialog();
      }
    },
    renameFile: () => {
      if (selectedEntries && selectedEntries.length === 1) {
        openRenameEntryDialog();
      }
    },
    copyMoveSelectedEntries: () => {
      if (selectedEntries && selectedEntries.length > 0) {
        openMoveCopyFilesDialog();
      }
    },
    openEntry: (e) => {
      // e.preventDefault();
      if (selectedEntries && selectedEntries.length === 1) {
        const entry = selectedEntries[0];
        if (entry.isFile) {
          openEntry(entry.path, false);
        } else {
          openDirectory(entry.path);
        }
      }
    },
    openFileExternally: () => {
      if (selectedEntries && selectedEntries.length === 1) {
        const entry = selectedEntries[0];
        openFileNatively(entry.path);
      }
    },
    openEntryDetails: () => {
      if (selectedEntries && selectedEntries.length === 1) {
        const entry = selectedEntries[0];
        openEntry(entry.path, true);
      }
    },
    duplicateFile: () => {
      if (selectedEntries && selectedEntries.length === 1) {
        const entry = selectedEntries[0];
        duplicateFile(entry.path);
      }
    },
    reloadDocument: () => {
      openDirectory(currentDirectoryPath);
    },
  };

  const sortedDirectories = sortedDirContent.filter((entry) => !entry.isFile);
  const sortedFiles = sortedDirContent.filter((entry) => entry.isFile);

  const getCellContent = (
    fsEntry: TS.FileSystemEntry,
    selectedEntries: Array<TS.FileSystemEntry>,
    index: number,
    handleGridContextMenu: (
      event: React.MouseEvent<HTMLDivElement>,
      fsEntry: TS.FileSystemEntry,
    ) => void,
    handleGridCellClick,
    handleGridCellDblClick,
    isLast?: boolean,
  ) => {
    let selected = false;
    if (
      selectedEntries &&
      selectedEntries.some((entry) => entry.path === fsEntry.path)
    ) {
      selected = true;
    }

    const selectionMode = selectedEntries.length > 1;
    return (
      <TagDropContainer
        entryPath={fsEntry.path} // TODO remove entryPath it is already included in selectedEntries
        selectedEntries={
          selectedEntries.length > 0 ? selectedEntries : [fsEntry]
        }
      >
        <RowCell
          selected={selected}
          fsEntry={fsEntry}
          isLast={isLast}
          selectionMode={selectionMode}
          handleTagMenu={handleTagMenu}
          handleGridContextMenu={(
            event: React.MouseEvent<HTMLDivElement>,
            fsEntry: TS.FileSystemEntry,
          ) => {
            setMouseX(event.clientX);
            setMouseY(event.clientY);
            handleGridContextMenu(event, fsEntry);
          }}
          handleGridCellDblClick={handleGridCellDblClick}
          handleGridCellClick={handleGridCellClick}
        />
      </TagDropContainer>
    );
  };

  return (
    <div
      style={{
        height: '100%', // 'calc(100% - 47px)'
      }}
      data-tid={defaultSettings.testID}
    >
      <MainToolbar
        prefixDataTID={'list'}
        toggleSelectAllFiles={toggleSelectAllFiles}
        openAddRemoveTagsDialog={openAddRemoveTagsDialog}
        openMoveCopyFilesDialog={openMoveCopyFilesDialog}
        handleSortingMenu={handleSortingMenu}
        handleExportCsvMenu={handleExportCsvMenu}
        openSettings={openSettings}
        openShareFilesDialog={openShareFilesDialog}
      />
      <GlobalHotKeys
        keyMap={keyMap}
        handlers={keyBindingHandlers}
        allowChanges={true}
      >
        <ListCellsStyleContextProvider>
          <GridPagination
            directories={sortedDirectories}
            desktopMode={desktopMode}
            openRenameEntryDialog={openRenameEntryDialog}
            files={sortedFiles}
            getCellContent={getCellContent}
            currentDirectoryPath={currentDirectoryPath}
            onClick={onClick}
            onContextMenu={onContextMenu}
            selectedEntries={selectedEntries}
            setSelectedEntries={handleSetSelectedEntries}
            setFileContextMenuAnchorEl={setFileContextMenuAnchorEl}
            setDirContextMenuAnchorEl={setDirContextMenuAnchorEl}
            clearSelection={clearSelection}
          />
        </ListCellsStyleContextProvider>
      </GlobalHotKeys>
      {isAddRemoveTagsDialogOpened && (
        <AddRemoveTagsDialog
          open={isAddRemoveTagsDialogOpened}
          onClose={() => setIsAddRemoveTagsDialogOpened(false)}
        />
      )}
      {isAddTagDialogOpened !== undefined && (
        <AddTagToTagGroupDialog
          open={true}
          onClose={() => setIsAddTagDialogOpened(undefined)}
          selectedTag={isAddTagDialogOpened}
        />
      )}
      {isGridSettingsDialogOpened && (
        <GridSettingsDialog
          open={isGridSettingsDialogOpened}
          onClose={() => {
            setIsGridSettingsDialogOpened(false);
          }}
          openHelpWebPage={openHelpWebPage}
          handleSortingMenu={handleSortingMenu}
        />
      )}
      {isMoveCopyFilesDialogOpened && (
        <MoveCopyFilesDialog
          open={isMoveCopyFilesDialogOpened}
          onClose={() => setIsMoveCopyFilesDialogOpened(false)}
        />
      )}
      {isShareFilesDialogOpened && Pro && (
        <ShareFilesDialog
          open={isShareFilesDialogOpened}
          onClose={() => setIsShareFilesDialogOpened(false)}
        />
      )}
      {Boolean(fileContextMenuAnchorEl) && (
        <FileMenu
          anchorEl={fileContextMenuAnchorEl}
          mouseX={mouseX}
          mouseY={mouseY}
          open={Boolean(fileContextMenuAnchorEl)}
          onClose={() => setFileContextMenuAnchorEl(null)}
          openRenameFileDialog={openRenameEntryDialog}
          openMoveCopyFilesDialog={openMoveCopyFilesDialog}
          openShareFilesDialog={openShareFilesDialog}
          openAddRemoveTagsDialog={openAddRemoveTagsDialog}
          selectedFilePath={
            lastSelectedEntryPath ? lastSelectedEntryPath : currentDirectoryPath
          }
        />
      )}
      <DirectoryMenu
        open={Boolean(dirContextMenuAnchorEl)}
        onClose={() => {
          setDirContextMenuAnchorEl(null);
          perspectiveMode.current = true;
        }}
        anchorEl={dirContextMenuAnchorEl}
        mouseX={mouseX}
        mouseY={mouseY}
        directoryPath={lastSelectedEntryPath}
        openRenameDirectoryDialog={openRenameEntryDialog}
        openMoveCopyFilesDialog={openMoveCopyFilesDialog}
        perspectiveMode={perspectiveMode.current}
        openAddRemoveTagsDialog={openAddRemoveTagsDialog}
      />
      {/* {Boolean(tagContextMenuAnchorEl) && ( // TODO EntryTagMenu is used in TagSelect we cannot move confirm dialog from menu */}
      <EntryTagMenu
        anchorEl={tagContextMenuAnchorEl}
        open={Boolean(tagContextMenuAnchorEl)}
        onClose={() => setTagContextMenuAnchorEl(null)}
        setIsAddTagDialogOpened={setIsAddTagDialogOpened}
        selectedTag={selectedTag.current}
        currentEntryPath={selectedEntryPath.current}
      />
      {Boolean(sortingContextMenuAnchorEl) && (
        <SortingMenu
          open={Boolean(sortingContextMenuAnchorEl)}
          onClose={() => setSortingContextMenuAnchorEl(null)}
          anchorEl={sortingContextMenuAnchorEl}
          handleSortBy={handleSortBy}
        />
      )}
      {Boolean(optionsContextMenuAnchorEl) && (
        <GridOptionsMenu
          open={Boolean(optionsContextMenuAnchorEl)}
          onClose={closeOptionsMenu}
          anchorEl={optionsContextMenuAnchorEl}
          openHelpWebPage={openHelpWebPage}
          openSettings={openSettings}
        />
      )}
    </div>
  );
}
export default ListPerspective;
