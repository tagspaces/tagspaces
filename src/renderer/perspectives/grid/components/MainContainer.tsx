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

import FileSourceDnd from '-/components/FileSourceDnd';
import TagDropContainer from '-/components/TagDropContainer';
import AddTagToTagGroupDialog from '-/components/dialogs/AddTagToTagGroupDialog';
import { useDeleteMultipleEntriesDialogContext } from '-/components/dialogs/hooks/useDeleteMultipleEntriesDialogContext';
import { useMenuContext } from '-/components/dialogs/hooks/useMenuContext';
import EntryTagMenu from '-/components/menus/EntryTagMenu';
import { TabNames } from '-/hooks/EntryPropsTabsContextProvider';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { usePerspectiveActionsContext } from '-/hooks/usePerspectiveActionsContext';
import { usePerspectiveSettingsContext } from '-/hooks/usePerspectiveSettingsContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { fileOperationsEnabled } from '-/perspectives/common/main-container';
import { useReloadOnFocus } from '-/perspectives/common/useReloadOnFocus';
import GridOptionsMenu from '-/perspectives/grid/components/GridOptionsMenu';
import GridPagination from '-/perspectives/grid/components/GridPagination';
import GridSettingsDialog from '-/perspectives/grid/components/GridSettingsDialog';
import MainToolbar from '-/perspectives/grid/components/MainToolbar';
import SortingMenu from '-/perspectives/grid/components/SortingMenu';
import { GridCellsStyleContextProvider } from '-/perspectives/grid/hooks/GridCellsStyleProvider';
import { useSortedDirContext } from '-/perspectives/grid/hooks/useSortedDirContext';
import { Pro } from '-/pro';
import { getDesktopMode, getKeyBindingObject } from '-/reducers/settings';
import { openURLExternally } from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import useFirstRender from '-/utils/useFirstRender';
import { Box } from '@mui/material';
import Links from 'assets/links';
import React, { useEffect, useRef, useState } from 'react';
import { GlobalHotKeys } from 'react-hotkeys';
import { useSelector } from 'react-redux';
import GridCell from './GridCell';

interface Props {}

function GridPerspective(props: Props) {
  const {
    openRenameEntryDialog,
    openAddRemoveTagsDialog,
    openMoveCopyFilesDialog,
  } = useMenuContext();
  const { openEntry, openPrevFile, openNextFile, openedEntry, fileChanged } =
    useOpenedEntryContext();
  const { showNotification } = useNotificationContext();
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
  const { selectedEntries, setSelectedEntries } = useSelectedEntriesContext();
  const keyBindings = useSelector(getKeyBindingObject);

  // Create functions that dispatch actions
  const handleSetSelectedEntries = (entries: Array<TS.FileSystemEntry>) => {
    const selected = showDirectories
      ? entries
      : entries.filter((entry) => entry.isFile);
    setSelectedEntries(selected);
  };

  const [mouseX, setMouseX] = useState<number>(undefined);
  const [mouseY, setMouseY] = useState<number>(undefined);
  const selectedEntry = useRef<TS.FileSystemEntry>(undefined);
  const selectedTag = useRef<TS.Tag | null>(null);
  //const perspectiveMode = useRef<boolean>(true);
  const [tagContextMenuAnchorEl, setTagContextMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const [sortingContextMenuAnchorEl, setSortingContextMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const [optionsContextMenuAnchorEl, setOptionsContextMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const [isAddTagDialogOpened, setIsAddTagDialogOpened] =
    useState<TS.Tag>(undefined);
  const [isGridSettingsDialogOpened, setIsGridSettingsDialogOpened] =
    useState<boolean>(false);
  const firstRender = useFirstRender();

  useReloadOnFocus(currentLocation?.reloadOnFocus, () =>
    openDirectory(currentDirectoryPath),
  );

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
    selectedEntry.current = undefined;
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
    entry: TS.FileSystemEntry,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    selectedTag.current = tag;
    selectedEntry.current = entry;
    setTagContextMenuAnchorEl(event.currentTarget);
  };

  const closeOptionsMenu = () => {
    setOptionsContextMenuAnchorEl(null);
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
      if (selectedEntries && selectedEntries.length > 0) {
        if (
          openedEntry &&
          fileChanged &&
          selectedEntries &&
          selectedEntries.some((e) => e.path === openedEntry.path)
        ) {
          showNotification(
            `You can't edit tags, because '${openedEntry.path}' is opened for editing`,
            'default',
            true,
          );
          return;
        }
        openAddRemoveTagsDialog(selectedEntries);
      }
    },
    renameFile: () => {
      if (selectedEntries && selectedEntries.length === 1) {
        openRenameEntryDialog();
      }
    },
    copyMoveSelectedEntries: () => {
      if (selectedEntries && selectedEntries.length > 0) {
        openMoveCopyFilesDialog(selectedEntries);
      }
    },
    openEntry: (e) => {
      // e.preventDefault();
      if (selectedEntries && selectedEntries.length === 1) {
        const entry = selectedEntries[0];
        if (entry.isFile) {
          openEntry(entry.path);
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
        openEntry(entry.path, TabNames.propertiesTab);
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
      <FileSourceDnd entry={fsEntry}>
        <TagDropContainer entry={fsEntry}>
          <GridCell
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
      </FileSourceDnd>
    );
  };

  return (
    <Box
      sx={{
        height: '100%',
      }}
      data-tid="gridPerspectiveContainer"
    >
      <MainToolbar
        prefixDataTID={'grid'}
        toggleSelectAllFiles={toggleSelectAllFiles}
        handleSortingMenu={handleSortingMenu}
        handleExportCsvMenu={handleExportCsvMenu}
        openSettings={openSettings}
      />
      <GlobalHotKeys
        keyMap={keyMap}
        handlers={keyBindingHandlers}
        allowChanges={true}
      >
        <GridCellsStyleContextProvider>
          <GridPagination
            //directories={sortedDirectories}
            desktopMode={desktopMode}
            //files={sortedFiles}
            getCellContent={getCellContent}
            currentDirectoryPath={currentDirectoryPath}
            onClick={onClick}
            setSelectedEntries={handleSetSelectedEntries}
            clearSelection={clearSelection}
          />
        </GridCellsStyleContextProvider>
      </GlobalHotKeys>
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
      {/* TODO EntryTagMenu is used in TagSelect we cannot move confirm dialog from menu */}
      <EntryTagMenu
        anchorEl={tagContextMenuAnchorEl}
        open={Boolean(tagContextMenuAnchorEl)}
        onClose={() => setTagContextMenuAnchorEl(null)}
        setIsAddTagDialogOpened={setIsAddTagDialogOpened}
        selectedTag={selectedTag.current}
        currentEntry={selectedEntry.current}
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
    </Box>
  );
}
export default GridPerspective;
