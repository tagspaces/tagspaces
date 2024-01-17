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

import React, { useEffect, useReducer, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { GlobalHotKeys } from 'react-hotkeys';
import { isObj } from '@tagspaces/tagspaces-common/misc';
import { isVisibleOnScreen } from '-/utils/dom';
import { getDesktopMode, getKeyBindingObject } from '-/reducers/settings';
import FileMenu from '-/components/menus/FileMenu';
import DirectoryMenu from '-/components/menus/DirectoryMenu';
import EntryTagMenu from '-/components/menus/EntryTagMenu';
import AddRemoveTagsDialog from '-/components/dialogs/AddRemoveTagsDialog';
import MoveCopyFilesDialog from '-/components/dialogs/MoveCopyFilesDialog';
import TagDropContainer from '-/components/TagDropContainer';
import { actions as AppActions, AppDispatch } from '-/reducers/app';
import RowCell from '-/perspectives/list/components/RowCell';
import { EntrySizes } from '-/components/ZoomComponent';
import MainToolbar from '-/perspectives/grid-perspective/components/MainToolbar';
import SortingMenu from '-/perspectives/grid-perspective/components/SortingMenu';
import GridOptionsMenu from '-/perspectives/grid-perspective/components/GridOptionsMenu';
import PlatformIO from '-/services/platform-facade';
import GridPagination from '-/perspectives/grid-perspective/components/GridPagination';
import GridSettingsDialog from '-/perspectives/grid-perspective/components/GridSettingsDialog';
import AddTagToTagGroupDialog from '-/components/dialogs/AddTagToTagGroupDialog';
import { TS } from '-/tagspaces.namespace';
import { Pro } from '-/pro';
import Links from 'assets/links';
import { defaultSettings } from '../index';
import { PerspectiveIDs } from '-/perspectives';
import { fileOperationsEnabled } from '-/perspectives/common/main-container';
import useFirstRender from '-/utils/useFirstRender';
import { openURLExternally } from '-/services/utils-io';
import { useSortedDirContext } from '-/perspectives/grid-perspective/hooks/useSortedDirContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { useFsActionsContext } from '-/hooks/useFsActionsContext';

interface Props {
  openRenameEntryDialog: () => void;
}

function getSettings(directoryMeta: TS.FileSystemEntryMeta): TS.FolderSettings {
  if (
    Pro &&
    directoryMeta &&
    directoryMeta.perspectiveSettings &&
    directoryMeta.perspectiveSettings[PerspectiveIDs.LIST]
  ) {
    return directoryMeta.perspectiveSettings[PerspectiveIDs.LIST];
  } else {
    // loading settings for not Pro
    return JSON.parse(localStorage.getItem(defaultSettings.settingsKey));
  }
}

function ListPerspective(props: Props) {
  const { openRenameEntryDialog } = props;

  const { openEntry, openPrevFile, openNextFile } = useOpenedEntryContext();
  const {
    directoryMeta,
    openDirectory,
    currentDirectoryPath,
    setDirectoryMeta,
  } = useDirectoryContentContext();
  const { openFileNatively, duplicateFile } = useFsActionsContext();
  const dispatch: AppDispatch = useDispatch();

  const { sortedDirContent, sortBy, orderBy, setSortBy, setOrderBy } =
    useSortedDirContext();
  const desktopMode = useSelector(getDesktopMode);
  const { selectedEntries, setSelectedEntries, lastSelectedEntryPath } =
    useSelectedEntriesContext();
  const keyBindings = useSelector(getKeyBindingObject);
  //const searchFilter: string = useSelector(getSearchFilter);
  /*const editedEntryPaths: Array<TS.EditedEntryPath> = useSelector(
    getEditedEntryPaths
  );*/

  // Create functions that dispatch actions
  const handleSetSelectedEntries = (entries: Array<TS.FileSystemEntry>) => {
    const selected = showDirectories.current
      ? entries
      : entries.filter((entry) => entry.isFile);
    setSelectedEntries(selected);
  };

  const isLocal =
    Pro &&
    directoryMeta &&
    directoryMeta.perspectiveSettings &&
    directoryMeta.perspectiveSettings[PerspectiveIDs.LIST];
  const settings = getSettings(directoryMeta);

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
  /*const sortBy = useRef<string>(
    settings && settings.sortBy ? settings.sortBy : defaultSettings.sortBy
  );
  const orderBy = useRef<null | boolean>(
    settings && typeof settings.orderBy !== 'undefined'
      ? settings.orderBy
      : defaultSettings.orderBy
  );*/
  const singleClickAction = useRef<string>(
    settings && settings.singleClickAction
      ? settings.singleClickAction
      : defaultSettings.singleClickAction,
  );
  const entrySize = useRef<EntrySizes>(
    settings && settings.entrySize
      ? settings.entrySize
      : defaultSettings.entrySize,
  );
  const thumbnailMode = useRef<string>(
    settings && settings.thumbnailMode
      ? settings.thumbnailMode
      : defaultSettings.thumbnailMode,
  );
  const showDirectories = useRef<boolean>(
    settings && typeof settings.showDirectories !== 'undefined'
      ? settings.showDirectories
      : defaultSettings.showDirectories,
  );
  const showDetails = useRef<boolean>(
    settings && typeof settings.showDetails !== 'undefined'
      ? settings.showDetails
      : defaultSettings.showDetails,
  );
  const showDescription = useRef<boolean>(
    settings && typeof settings.showDescription !== 'undefined'
      ? settings.showDescription
      : defaultSettings.showDescription,
  );
  const showEntriesDescription = useRef<boolean>(
    settings && typeof settings.showEntriesDescription !== 'undefined'
      ? settings.showEntriesDescription
      : defaultSettings.showEntriesDescription,
  );
  const showTags = useRef<boolean>(
    settings && typeof settings.showTags !== 'undefined'
      ? settings.showTags
      : defaultSettings.showTags,
  );
  const [isMoveCopyFilesDialogOpened, setIsMoveCopyFilesDialogOpened] =
    useState<boolean>(false);
  const [isShareFilesDialogOpened, setIsShareFilesDialogOpened] =
    useState<boolean>(false);
  const [isAddRemoveTagsDialogOpened, setIsAddRemoveTagsDialogOpened] =
    useState<boolean>(false);
  const [isGridSettingsDialogOpened, setIsGridSettingsDialogOpened] =
    useState<boolean>(false);
  const gridPageLimit = useRef<number>(
    settings && settings.gridPageLimit
      ? settings.gridPageLimit
      : defaultSettings.gridPageLimit,
  );
  // true: save in default settings; false: save per folder settings; undefined - dont save changes
  const isDefaultSetting = useRef<boolean>(undefined);
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);
  const firstRender = useFirstRender();

  useEffect(() => {
    if (selectedEntries.length === 1) {
      makeFirstSelectedEntryVisible();
    }
  }, [selectedEntries]);

  useEffect(() => {
    if (!firstRender) {
      const perspectiveSettings = getSettings(directoryMeta);
      showDirectories.current =
        perspectiveSettings && perspectiveSettings.showDirectories !== undefined
          ? perspectiveSettings.showDirectories
          : defaultSettings.showDirectories;
      showDescription.current =
        perspectiveSettings && perspectiveSettings.showDescription !== undefined
          ? perspectiveSettings.showDescription
          : defaultSettings.showDescription;
      showEntriesDescription.current =
        perspectiveSettings &&
        perspectiveSettings.showEntriesDescription !== undefined
          ? perspectiveSettings.showEntriesDescription
          : defaultSettings.showEntriesDescription;
      showDetails.current =
        perspectiveSettings && perspectiveSettings.showDetails !== undefined
          ? perspectiveSettings.showDetails
          : defaultSettings.showDetails;
      showTags.current =
        perspectiveSettings && perspectiveSettings.showTags !== undefined
          ? perspectiveSettings.showTags
          : defaultSettings.showTags;
      setOrderBy(
        perspectiveSettings && perspectiveSettings.orderBy !== undefined
          ? perspectiveSettings.orderBy
          : defaultSettings.orderBy,
      );
      setSortBy(
        perspectiveSettings && perspectiveSettings.sortBy !== undefined
          ? perspectiveSettings.sortBy
          : defaultSettings.sortBy,
      );
      singleClickAction.current =
        perspectiveSettings &&
        perspectiveSettings.singleClickAction !== undefined
          ? perspectiveSettings.singleClickAction
          : defaultSettings.singleClickAction;
      entrySize.current =
        perspectiveSettings && perspectiveSettings.entrySize !== undefined
          ? perspectiveSettings.entrySize
          : defaultSettings.entrySize;
      thumbnailMode.current =
        perspectiveSettings && perspectiveSettings.thumbnailMode !== undefined
          ? perspectiveSettings.thumbnailMode
          : defaultSettings.thumbnailMode;
      gridPageLimit.current =
        perspectiveSettings && perspectiveSettings.gridPageLimit !== undefined
          ? perspectiveSettings.gridPageLimit
          : defaultSettings.gridPageLimit;
      forceUpdate();
    }
  }, [directoryMeta]);

  useEffect(() => {
    if (!firstRender && isDefaultSetting.current !== undefined) {
      const perspectiveSettings = {
        showDirectories: showDirectories.current,
        showDescription: showDescription.current,
        showEntriesDescription: showEntriesDescription.current,
        showDetails: showDetails.current,
        showTags: showTags.current,
        orderBy: orderBy,
        sortBy: sortBy,
        singleClickAction: singleClickAction.current,
        entrySize: entrySize.current,
        thumbnailMode: thumbnailMode.current,
        gridPageLimit: gridPageLimit.current,
      };
      if (Pro && !isDefaultSetting.current) {
        Pro.MetaOperations.savePerspectiveSettings(
          currentDirectoryPath,
          PerspectiveIDs.LIST,
          perspectiveSettings,
        ).then((fsEntryMeta: TS.FileSystemEntryMeta) => {
          setDirectoryMeta(fsEntryMeta);
        });
      } else {
        localStorage.setItem(
          defaultSettings.settingsKey,
          JSON.stringify(perspectiveSettings),
        );
        forceUpdate();
      }
      isDefaultSetting.current = undefined;
    }
  }, [
    isDefaultSetting.current,
    showDirectories.current,
    showDescription.current,
    showEntriesDescription.current,
    showDetails.current,
    showTags.current,
    orderBy,
    sortBy,
    singleClickAction.current,
    entrySize.current,
    thumbnailMode.current,
    gridPageLimit.current,
  ]);

  const makeFirstSelectedEntryVisible = () => {
    if (selectedEntries && selectedEntries.length > 0) {
      try {
        const firstSelectedElement = document.querySelector(
          '[data-entry-id="' + selectedEntries[0].uuid + '"]',
        );
        if (
          isObj(firstSelectedElement) &&
          !isVisibleOnScreen(firstSelectedElement)
        ) {
          firstSelectedElement.scrollIntoView(false);
        }
      } catch (ex) {
        console.debug('makeFirstSelectedEntryVisible:', ex);
      }
    }
  };

  const handleGridPageLimit = (limit: number) => {
    gridPageLimit.current = limit;
    // forceUpdate();
  };

  const handleSortBy = (handleSort) => {
    if (sortBy !== handleSort) {
      setSortBy(handleSort);
    } else {
      setOrderBy(!orderBy);
    }
    // forceUpdate();
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
    handleSetSelectedEntries([]);
    selectedEntryPath.current = undefined;
  };

  const toggleSelectAllFiles = () => {
    if (selectedEntries.length > 1) {
      clearSelection();
    } else {
      handleSetSelectedEntries(sortedDirContent);
    }
  };

  const toggleShowDirectories = () => {
    closeOptionsMenu();
    showDirectories.current = !showDirectories.current;
    // forceUpdate();
  };

  const toggleShowDetails = () => {
    closeOptionsMenu();
    showDetails.current = !showDetails.current;
  };

  const toggleShowDescription = () => {
    closeOptionsMenu();
    showDescription.current = !showDescription.current;
  };

  const toggleShowEntriesDescription = () => {
    closeOptionsMenu();
    showEntriesDescription.current = !showEntriesDescription.current;
  };

  const toggleShowTags = () => {
    closeOptionsMenu();
    showTags.current = !showTags.current;
    // forceUpdate();
  };

  const toggleThumbnailsMode = () => {
    closeOptionsMenu();
    const thumbMode = thumbnailMode.current === 'cover' ? 'contain' : 'cover';
    thumbnailMode.current = thumbMode;
    // forceUpdate();
    return thumbMode;
  };

  const changeEntrySize = (size) => {
    closeOptionsMenu();
    entrySize.current = size;
    // forceUpdate();
  };

  const changeSingleClickAction = (singleClick) => {
    closeOptionsMenu();
    singleClickAction.current = singleClick;
    // forceUpdate();
  };

  const openHelpWebPage = () => {
    closeOptionsMenu();
    openURLExternally(Links.documentationLinks.defaultPerspective);
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
    setIsShareFilesDialogOpened(true);
  };

  const openDeleteFileDialog = () => {
    dispatch(AppActions.toggleDeleteMultipleEntriesDialog());
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
      handleSetSelectedEntries([]);
    }
    perspectiveMode.current = false;
    setDirContextMenuAnchorEl(event.currentTarget);
  };

  const onClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (selectedEntries.length > 0) {
      handleSetSelectedEntries([]);
    }
  };

  const keyBindingHandlers = {
    nextDocument: () => openNextFile(),
    prevDocument: () => openPrevFile(),
    selectAll: () => toggleSelectAllFiles(),
    deleteDocument: () => {
      if (fileOperationsEnabled(selectedEntries)) {
        openDeleteFileDialog();
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

  let entryWidth = 200;
  if (entrySize.current === 'small') {
    entryWidth = 150;
  } else if (entrySize.current === 'normal') {
    entryWidth = 200;
  } else if (entrySize.current === 'big') {
    entryWidth = 300;
  }

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
    const selectEntry = (fsEntry: TS.FileSystemEntry) => {
      handleSetSelectedEntries([...selectedEntries, fsEntry]);
    };

    const deselectEntry = (fsEntry: TS.FileSystemEntry) => {
      const newSelection = selectedEntries.filter(
        (data) => data.path !== fsEntry.path,
      );
      handleSetSelectedEntries(newSelection);
    };

    const selectionMode = selectedEntries.length > 0;

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
          showEntriesDescription={showEntriesDescription.current}
          entrySize={entrySize.current}
          isLast={isLast}
          selectionMode={selectionMode}
          thumbnailMode={thumbnailMode.current}
          selectEntry={selectEntry}
          deselectEntry={deselectEntry}
          handleTagMenu={handleTagMenu}
          showTags={showTags.current}
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
        changeEntrySize={changeEntrySize}
        entrySize={entrySize.current}
        openSettings={openSettings}
        openShareFilesDialog={
          PlatformIO.haveObjectStoreSupport() ? openShareFilesDialog : undefined
        }
      />
      <GlobalHotKeys
        keyMap={keyMap}
        handlers={keyBindingHandlers}
        allowChanges={true}
      >
        <GridPagination
          gridPageLimit={gridPageLimit.current}
          style={{
            marginTop: 5,
            marginBottom: 70,
            paddingRight: 4,
            paddingLeft: 4,
            gridTemplateColumns: 'none',
          }}
          directories={sortedDirectories}
          showDetails={showDetails.current}
          showDescription={showDescription.current}
          showDirectories={showDirectories.current}
          desktopMode={desktopMode}
          openRenameEntryDialog={openRenameEntryDialog}
          showTags={showTags.current}
          thumbnailMode={thumbnailMode.current}
          entrySize={entrySize.current}
          files={sortedFiles}
          getCellContent={getCellContent}
          currentDirectoryPath={currentDirectoryPath}
          onClick={onClick}
          onContextMenu={onContextMenu}
          settings={settings}
          selectedEntries={selectedEntries}
          setSelectedEntries={handleSetSelectedEntries}
          singleClickAction={singleClickAction.current}
          setFileContextMenuAnchorEl={setFileContextMenuAnchorEl}
          setDirContextMenuAnchorEl={setDirContextMenuAnchorEl}
          clearSelection={clearSelection}
        />
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
          onClose={(isDefault) => {
            setIsGridSettingsDialogOpened(false);
            isDefaultSetting.current = isDefault;
          }}
          setGridPageLimit={handleGridPageLimit}
          gridPageLimit={gridPageLimit.current}
          toggleShowDirectories={toggleShowDirectories}
          toggleShowTags={toggleShowTags}
          toggleShowDetails={toggleShowDetails}
          toggleShowDescription={toggleShowDescription}
          toggleShowEntriesDescription={toggleShowEntriesDescription}
          showDetails={showDetails.current}
          showDescription={showDescription.current}
          showEntriesDescription={showEntriesDescription.current}
          showDirectories={showDirectories.current}
          showTags={showTags.current}
          toggleThumbnailsMode={toggleThumbnailsMode}
          thumbnailMode={thumbnailMode.current}
          changeEntrySize={changeEntrySize}
          entrySize={entrySize.current}
          changeSingleClickAction={changeSingleClickAction}
          singleClickAction={singleClickAction.current}
          openHelpWebPage={openHelpWebPage}
          handleSortingMenu={handleSortingMenu}
          isLocal={isLocal}
          resetLocalSettings={() => {
            Pro.MetaOperations.savePerspectiveSettings(
              currentDirectoryPath,
              PerspectiveIDs.LIST,
            ).then((fsEntryMeta: TS.FileSystemEntryMeta) => {
              setDirectoryMeta(fsEntryMeta);
              setIsGridSettingsDialogOpened(false);
            });
          }}
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
          openDeleteFileDialog={openDeleteFileDialog}
          openRenameFileDialog={openRenameEntryDialog}
          openMoveCopyFilesDialog={openMoveCopyFilesDialog}
          openShareFilesDialog={
            PlatformIO.haveObjectStoreSupport()
              ? openShareFilesDialog
              : undefined
          }
          openAddRemoveTagsDialog={openAddRemoveTagsDialog}
          selectedFilePath={
            lastSelectedEntryPath ? lastSelectedEntryPath : currentDirectoryPath
          }
        />
      )}
      {/* {Boolean(dirContextMenuAnchorEl) && ( // todo move dialogs from DirectoryMenu */}
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
          toggleShowDirectories={toggleShowDirectories}
          showDirectories={showDirectories.current}
          toggleShowTags={toggleShowTags}
          showTags={showTags.current}
          toggleThumbnailsMode={toggleThumbnailsMode}
          thumbnailMode={thumbnailMode.current}
          entrySize={entrySize.current}
          changeSingleClickAction={changeSingleClickAction}
          singleClickAction={singleClickAction.current}
          changeEntrySize={changeEntrySize}
          openHelpWebPage={openHelpWebPage}
          openSettings={openSettings}
        />
      )}
    </div>
  );
}

export default ListPerspective;
