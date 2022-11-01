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

import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { GlobalHotKeys } from 'react-hotkeys';
import withStyles from '@mui/styles/withStyles';
import {
  isObj,
  locationType,
  sortByCriteria
} from '@tagspaces/tagspaces-platforms/misc';
import AppConfig from '@tagspaces/tagspaces-platforms/AppConfig';
import { isVisibleOnScreen } from '-/utils/dom';
import { actions as TagLibraryActions } from '-/reducers/taglibrary';
import {
  getSupportedFileTypes,
  getDesktopMode,
  getKeyBindingObject
  // isDesktopMode
} from '-/reducers/settings';
import styles from './styles.css';
import FileMenu from '-/components/menus/FileMenu';
import DirectoryMenu from '-/components/menus/DirectoryMenu';
import EntryTagMenu from '-/components/menus/EntryTagMenu';
import i18n from '-/services/i18n';
import AddRemoveTagsDialog from '-/components/dialogs/AddRemoveTagsDialog';
import MoveCopyFilesDialog from '-/components/dialogs/MoveCopyFilesDialog';
import TargetMoveFileBox from '-/components/TargetMoveFileBox';
import FileSourceDnd from '-/components/FileSourceDnd';
import DragItemTypes from '-/components/DragItemTypes';
import TagDropContainer from '-/components/TagDropContainer';
import IOActions from '-/reducers/io-actions';
import {
  actions as AppActions,
  getDirectoryMeta,
  getLastSelectedEntry,
  getSelectedEntries,
  isDeleteMultipleEntriesDialogOpened,
  isReadOnlyMode
} from '-/reducers/app';
import TaggingActions from '-/reducers/tagging-actions';
import CellContent from './CellContent';
import MainToolbar from './MainToolbar';
import SortingMenu from './SortingMenu';
import GridOptionsMenu from './GridOptionsMenu';
import { getLocation, getLocations } from '-/reducers/locations';
import PlatformIO from '-/services/platform-facade';
import GridPagination from '-/perspectives/grid-perspective/components/GridPagination';
import GridSettingsDialog from '-/perspectives/grid-perspective/components/GridSettingsDialog';
import AddTagToTagGroupDialog from '-/components/dialogs/AddTagToTagGroupDialog';
import { TS } from '-/tagspaces.namespace';
import { Pro } from '-/pro';
import Links from '-/links';
import { defaultSettings } from '../index';
import { PerspectiveIDs } from '-/perspectives';
import { fileOperationsEnabled } from '-/perspectives/common/main-container';

interface Props {
  classes: any;
  theme: any;
  desktopMode: boolean;
  currentDirectoryPath: string;
  lastSelectedEntry: any;
  selectedEntries: Array<any>;
  supportedFileTypes: Array<any>;
  isReadOnlyMode: boolean;
  openFsEntry: (fsEntry?: TS.FileSystemEntry) => void;
  openNextFile: () => any;
  openPrevFile: () => any;
  openRenameEntryDialog: () => void;
  loadDirectoryContent: (
    path: string,
    generateThumbnails: boolean,
    loadDirMeta?: boolean
  ) => void;
  openDirectory: (path: string) => void;
  showInFileManager: (path: string) => void;
  openFileNatively: (path?: string) => void;
  openURLExternally: (path: string) => void;
  loadParentDirectoryContent: () => void;
  setSelectedEntries: (selectedEntries: Array<TS.FileSystemEntry>) => void;
  addTags: () => void;
  addTag: (tag: TS.Tag, parentTagGroupUuid: TS.Uuid) => void;
  removeTags: (paths: Array<string>, tags: Array<TS.Tag>) => void;
  removeAllTags: () => void;
  directoryContent: Array<TS.FileSystemEntry>;
  moveFiles: (files: Array<string>, destination: string) => Promise<boolean>;
  keyBindings: any;
  showNotification: (
    text: string,
    notificationType: string,
    autohide: boolean
  ) => void;
  currentLocation: TS.Location;
  locations: Array<TS.Location>;
  toggleDeleteMultipleEntriesDialog: () => void;
  directoryMeta: TS.FileSystemEntryMeta;
  setDirectoryMeta: (fsEntryMeta: TS.FileSystemEntryMeta) => void;
}

function getSettings(directoryMeta: TS.FileSystemEntryMeta): TS.FolderSettings {
  if (
    Pro &&
    directoryMeta &&
    directoryMeta.perspectiveSettings &&
    directoryMeta.perspectiveSettings[PerspectiveIDs.GRID]
  ) {
    return {
      ...directoryMeta.perspectiveSettings[PerspectiveIDs.GRID],
      isLocal: true
    };
  } else {
    // loading settings for not Pro
    return JSON.parse(localStorage.getItem(defaultSettings.settingsKey));
  }
}

function GridPerspective(props: Props) {
  const settings = getSettings(props.directoryMeta);

  const [mouseX, setMouseX] = useState<number>(undefined);
  const [mouseY, setMouseY] = useState<number>(undefined);
  // const selectedEntry = useRef<FileSystemEntry>(undefined);
  const selectedEntryPath = useRef<string>(undefined);
  const selectedTag = useRef<TS.Tag | null>(null);
  const [
    fileContextMenuAnchorEl,
    setFileContextMenuAnchorEl
  ] = useState<null | HTMLElement>(null);
  const [
    dirContextMenuAnchorEl,
    setDirContextMenuAnchorEl
  ] = useState<null | HTMLElement>(null);
  const [
    tagContextMenuAnchorEl,
    setTagContextMenuAnchorEl
  ] = useState<null | HTMLElement>(null);
  const [
    sortingContextMenuAnchorEl,
    setSortingContextMenuAnchorEl
  ] = useState<null | HTMLElement>(null);
  const [
    optionsContextMenuAnchorEl,
    setOptionsContextMenuAnchorEl
  ] = useState<null | HTMLElement>(null);
  const [isAddTagDialogOpened, setIsAddTagDialogOpened] = useState<TS.Tag>(
    undefined
  );
  const sortBy = useRef<string>(
    settings && settings.sortBy ? settings.sortBy : defaultSettings.sortBy
  );
  const orderBy = useRef<null | boolean>(
    settings && typeof settings.orderBy !== 'undefined'
      ? settings.orderBy
      : defaultSettings.orderBy
  );
  const layoutType = useRef<string>(
    settings && settings.layoutType
      ? settings.layoutType
      : defaultSettings.layoutType
  );
  const singleClickAction = useRef<string>(
    settings && settings.singleClickAction
      ? settings.singleClickAction
      : defaultSettings.singleClickAction
  );
  const entrySize = useRef<string>(
    settings && settings.entrySize
      ? settings.entrySize
      : defaultSettings.entrySize
  );
  const thumbnailMode = useRef<string>(
    settings && settings.thumbnailMode
      ? settings.thumbnailMode
      : defaultSettings.thumbnailMode
  );
  const showDirectories = useRef<boolean>(
    settings && typeof settings.showDirectories !== 'undefined'
      ? settings.showDirectories
      : defaultSettings.showDirectories
  );
  const showDetails = useRef<boolean>(
    settings && typeof settings.showDetails !== 'undefined'
      ? settings.showDetails
      : defaultSettings.showDetails
  );
  const showDescription = useRef<boolean>(
    settings && typeof settings.showDescription !== 'undefined'
      ? settings.showDescription
      : defaultSettings.showDescription
  );
  const showTags = useRef<boolean>(
    settings && typeof settings.showTags !== 'undefined'
      ? settings.showTags
      : defaultSettings.showTags
  );
  const [
    isMoveCopyFilesDialogOpened,
    setIsMoveCopyFilesDialogOpened
  ] = useState<boolean>(false);
  const [
    isAddRemoveTagsDialogOpened,
    setIsAddRemoveTagsDialogOpened
  ] = useState<boolean>(false);
  const [isGridSettingsDialogOpened, setIsGridSettingsDialogOpened] = useState<
    boolean
  >(false);
  const gridPageLimit = useRef<number>(
    settings && settings.gridPageLimit
      ? settings.gridPageLimit
      : defaultSettings.gridPageLimit
  );
  // true: save in default settings; false: save per folder settings; undefined - dont save changes
  const isDefaultSetting = useRef<boolean>(undefined);
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0);

  const {
    classes,
    selectedEntries,
    loadParentDirectoryContent,
    theme,
    currentDirectoryPath
  } = props;

  useEffect(() => {
    if (props.selectedEntries.length === 1) {
      makeFirstSelectedEntryVisible();
    }
  }, [props.selectedEntries]);

  useEffect(() => {
    const perspectiveSettings = getSettings(props.directoryMeta);
    showDirectories.current =
      perspectiveSettings && perspectiveSettings.showDirectories !== undefined
        ? perspectiveSettings.showDirectories
        : defaultSettings.showDirectories;
    showDescription.current =
      perspectiveSettings && perspectiveSettings.showDescription !== undefined
        ? perspectiveSettings.showDescription
        : defaultSettings.showDescription;
    showDetails.current =
      perspectiveSettings && perspectiveSettings.showDetails !== undefined
        ? perspectiveSettings.showDetails
        : defaultSettings.showDetails;
    showTags.current =
      perspectiveSettings && perspectiveSettings.showTags !== undefined
        ? perspectiveSettings.showTags
        : defaultSettings.showTags;
    layoutType.current = defaultSettings.layoutType;
    orderBy.current =
      perspectiveSettings && perspectiveSettings.orderBy !== undefined
        ? perspectiveSettings.orderBy
        : defaultSettings.orderBy;
    sortBy.current =
      perspectiveSettings && perspectiveSettings.sortBy !== undefined
        ? perspectiveSettings.sortBy
        : defaultSettings.sortBy;
    singleClickAction.current =
      perspectiveSettings && perspectiveSettings.singleClickAction !== undefined
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
  }, [props.directoryMeta]);

  useEffect(() => {
    if (isDefaultSetting.current !== undefined) {
      const perspectiveSettings = {
        showDirectories: showDirectories.current,
        showDescription: showDescription.current,
        showDetails: showDetails.current,
        showTags: showTags.current,
        layoutType: layoutType.current,
        orderBy: orderBy.current,
        sortBy: sortBy.current,
        singleClickAction: singleClickAction.current,
        entrySize: entrySize.current,
        thumbnailMode: thumbnailMode.current,
        gridPageLimit: gridPageLimit.current
      };
      if (Pro && !isDefaultSetting.current) {
        Pro.MetaOperations.savePerspectiveSettings(
          currentDirectoryPath,
          PerspectiveIDs.GRID,
          perspectiveSettings
        ).then((fsEntryMeta: TS.FileSystemEntryMeta) => {
          props.setDirectoryMeta(fsEntryMeta);
        });
      } else {
        localStorage.setItem(
          defaultSettings.settingsKey,
          JSON.stringify(perspectiveSettings)
        );
        forceUpdate();
      }
      isDefaultSetting.current = undefined;
    }
  }, [
    isDefaultSetting.current,
    showDirectories.current,
    showDescription.current,
    showDetails.current,
    showTags.current,
    layoutType.current,
    orderBy.current,
    sortBy.current,
    singleClickAction.current,
    entrySize.current,
    thumbnailMode.current,
    gridPageLimit.current
  ]);

  const sortedDirContentMemoized = useMemo(
    () =>
      sortByCriteria(props.directoryContent, sortBy.current, orderBy.current),
    [props.directoryContent, sortBy.current, orderBy.current]
  );

  const makeFirstSelectedEntryVisible = () => {
    if (selectedEntries && selectedEntries.length > 0) {
      const firstSelectedElement = document.querySelector(
        '[data-entry-id="' + selectedEntries[0].uuid + '"]'
      );
      if (
        isObj(firstSelectedElement) &&
        !isVisibleOnScreen(firstSelectedElement)
      ) {
        firstSelectedElement.scrollIntoView(false);
      }
    }
  };

  const handleLayoutSwitch = (type: string) => {
    layoutType.current = type;
    // forceUpdate();
  };

  const handleGridPageLimit = (limit: number) => {
    gridPageLimit.current = limit;
    // forceUpdate();
  };

  const handleSortBy = handleSort => {
    if (sortBy.current !== handleSort) {
      sortBy.current = handleSort;
    } else {
      orderBy.current = !orderBy.current;
    }
    // forceUpdate();
    setSortingContextMenuAnchorEl(null);
  };

  const handleSortingMenu = event => {
    const anchor = event ? event.currentTarget : null;
    setSortingContextMenuAnchorEl(anchor);
  };

  const handleExportCsvMenu = () => {
    if (Pro) {
      Pro.exportAsCsv.ExportAsCsv(props.directoryContent);
    }
  };

  const clearSelection = () => {
    props.setSelectedEntries([]);
    selectedEntryPath.current = undefined;
  };

  const someFileSelected = selectedEntries.length > 1;

  const toggleSelectAllFiles = () => {
    if (someFileSelected) {
      clearSelection();
    } else {
      props.setSelectedEntries(props.directoryContent);
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

  const changeEntrySize = size => {
    closeOptionsMenu();
    entrySize.current = size;
    // forceUpdate();
  };

  const changeSingleClickAction = singleClick => {
    closeOptionsMenu();
    singleClickAction.current = singleClick;
    // forceUpdate();
  };

  const openHelpWebPage = () => {
    closeOptionsMenu();
    props.openURLExternally(Links.documentationLinks.defaultPerspective);
  };

  const openSettings = () => {
    closeOptionsMenu();
    setIsGridSettingsDialogOpened(true);
  };

  const handleTagMenu = (
    event: React.ChangeEvent<HTMLInputElement>,
    tag: TS.Tag,
    entryPath: string
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

  const openDeleteFileDialog = () => {
    props.toggleDeleteMultipleEntriesDialog();
  };

  const openAddRemoveTagsDialog = () => {
    setIsAddRemoveTagsDialogOpened(true);
  };

  const keyMap = {
    nextDocument: props.keyBindings.nextDocument,
    prevDocument: props.keyBindings.prevDocument,
    selectAll: props.keyBindings.selectAll,
    deleteDocument: props.keyBindings.deleteDocument,
    addRemoveTags: props.keyBindings.addRemoveTags,
    renameFile: props.keyBindings.renameFile,
    openEntry: props.keyBindings.openEntry,
    openFileExternally: props.keyBindings.openFileExternally
  };

  const onContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setMouseX(event.clientX);
    setMouseY(event.clientY);
    if (props.selectedEntries.length > 0) {
      props.setSelectedEntries([]);
    }
    setDirContextMenuAnchorEl(event.currentTarget);
  };

  const onClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (props.selectedEntries.length > 0) {
      props.setSelectedEntries([]);
    }
  };

  const getSelEntryPath = () => {
    if (props.lastSelectedEntry) {
      return props.lastSelectedEntry.path;
    }
    return currentDirectoryPath;
  };

  const keyBindingHandlers = {
    nextDocument: () => props.openNextFile(),
    prevDocument: () => props.openPrevFile(),
    selectAll: () => toggleSelectAllFiles(),
    deleteDocument: () => {
      if (fileOperationsEnabled(props.selectedEntries)) {
        openDeleteFileDialog();
      }
    },
    addRemoveTags: () => {
      if (getSelEntryPath()) {
        openAddRemoveTagsDialog();
      }
    },
    renameFile: () => {
      props.openRenameEntryDialog();
    },
    openEntry: e => {
      e.preventDefault();
      props.openFsEntry();
    },
    openFileExternally: () => {
      props.openFileNatively();
    }
  };

  const selectedFilePaths = selectedEntries
    ? selectedEntries
        .filter(fsEntry => fsEntry.isFile)
        .map(fsentry => fsentry.path)
    : [];
  const sortedDirectories = sortedDirContentMemoized.filter(
    entry => !entry.isFile
  );
  const sortedFiles = sortedDirContentMemoized.filter(entry => entry.isFile);
  const locationPath = props.currentLocation
    ? PlatformIO.getLocationPath(props.currentLocation)
    : '';
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
    index: number,
    handleGridContextMenu,
    handleGridCellClick,
    handleGridCellDblClick,
    isLast?: boolean
  ) => {
    let selected = false;
    if (
      selectedEntries &&
      selectedEntries.some(entry => entry.path === fsEntry.path)
    ) {
      selected = true;
    }
    const selectEntry = (fsEntry: TS.FileSystemEntry) => {
      props.setSelectedEntries([...selectedEntries, fsEntry]);
    };

    const deselectEntry = (fsEntry: TS.FileSystemEntry) => {
      const newSelection = selectedEntries.filter(
        data => data.path !== fsEntry.path
      );
      props.setSelectedEntries(newSelection);
    };
    return (
      <TagDropContainer
        entryPath={fsEntry.path} // TODO remove entryPath it is already included in selectedEntries
        selectedEntries={
          selectedEntries.length > 0 ? selectedEntries : [fsEntry]
        }
      >
        <CellContent
          selected={selected}
          fsEntry={fsEntry}
          entrySize={entrySize.current}
          classes={classes}
          isLast={isLast}
          theme={theme}
          supportedFileTypes={props.supportedFileTypes}
          thumbnailMode={thumbnailMode.current}
          addTags={props.addTags}
          addTag={props.addTag}
          selectedEntries={selectedEntries}
          selectEntry={selectEntry}
          deselectEntry={deselectEntry}
          isReadOnlyMode={props.isReadOnlyMode}
          handleTagMenu={handleTagMenu}
          layoutType={layoutType.current}
          showTags={showTags.current}
          openFsEntry={props.openFsEntry}
          handleGridContextMenu={handleGridContextMenu}
          handleGridCellDblClick={handleGridCellDblClick}
          handleGridCellClick={handleGridCellClick}
        />
      </TagDropContainer>
    );
  };

  return (
    <div
      style={{
        height: 'calc(100% - 48px)'
      }}
      data-tid={defaultSettings.testID}
    >
      <MainToolbar
        classes={classes}
        layoutType={layoutType.current}
        isReadOnlyMode={props.isReadOnlyMode}
        selectedEntries={selectedEntries}
        loadParentDirectoryContent={loadParentDirectoryContent}
        toggleSelectAllFiles={toggleSelectAllFiles}
        someFileSelected={someFileSelected}
        handleLayoutSwitch={handleLayoutSwitch}
        openAddRemoveTagsDialog={openAddRemoveTagsDialog}
        fileOperationsEnabled={fileOperationsEnabled(props.selectedEntries)}
        openMoveCopyFilesDialog={openMoveCopyFilesDialog}
        openDeleteFileDialog={openDeleteFileDialog}
        openFsEntry={props.openFsEntry}
        handleSortingMenu={handleSortingMenu}
        handleExportCsvMenu={handleExportCsvMenu}
        openSettings={openSettings}
        directoryPath={currentDirectoryPath}
      />
      <GlobalHotKeys
        keyMap={keyMap}
        handlers={keyBindingHandlers}
        allowChanges={true}
      >
        <GridPagination
          gridPageLimit={gridPageLimit.current}
          style={{
            margin: 0,
            display: 'grid',
            gridGap: '5px 5px',
            padding: 5,
            paddingBottom: 10,
            gridTemplateColumns:
              'repeat(auto-fit,minmax(' + entryWidth + 'px,1fr))'
          }}
          classes={classes}
          theme={theme}
          directories={sortedDirectories}
          showDetails={showDetails.current}
          showDescription={showDescription.current}
          showDirectories={showDirectories.current}
          isReadOnlyMode={props.isReadOnlyMode}
          layoutType={layoutType.current}
          desktopMode={props.desktopMode}
          openRenameEntryDialog={props.openRenameEntryDialog}
          showTags={showTags.current}
          thumbnailMode={thumbnailMode.current}
          entrySize={entrySize.current}
          files={sortedFiles}
          getCellContent={getCellContent}
          currentPage={1}
          currentLocationPath={locationPath}
          currentDirectoryPath={props.currentDirectoryPath}
          onClick={onClick}
          onContextMenu={onContextMenu}
          settings={settings}
          selectedEntries={props.selectedEntries}
          setSelectedEntries={props.setSelectedEntries}
          singleClickAction={singleClickAction.current}
          currentLocation={props.currentLocation}
          lastSelectedEntry={props.lastSelectedEntry}
          directoryContent={props.directoryContent}
          supportedFileTypes={props.supportedFileTypes}
          openFsEntry={props.openFsEntry}
          openFileNatively={props.openFileNatively}
          loadDirectoryContent={props.loadDirectoryContent}
          setFileContextMenuAnchorEl={setFileContextMenuAnchorEl}
          setDirContextMenuAnchorEl={setDirContextMenuAnchorEl}
          showNotification={props.showNotification}
          moveFiles={props.moveFiles}
          clearSelection={clearSelection}
        />
      </GlobalHotKeys>
      {isAddRemoveTagsDialogOpened && (
        <AddRemoveTagsDialog
          open={isAddRemoveTagsDialogOpened}
          onClose={() => setIsAddRemoveTagsDialogOpened(false)}
          addTags={props.addTags}
          removeTags={props.removeTags}
          removeAllTags={props.removeAllTags}
          selectedEntries={props.selectedEntries}
        />
      )}
      {isAddTagDialogOpened !== undefined && (
        <AddTagToTagGroupDialog
          open={true}
          onClose={() => setIsAddTagDialogOpened(undefined)}
          addTag={props.addTag}
          selectedTag={isAddTagDialogOpened}
        />
      )}
      {isGridSettingsDialogOpened && (
        <GridSettingsDialog
          open={isGridSettingsDialogOpened}
          onClose={isDefault => {
            setIsGridSettingsDialogOpened(false);
            isDefaultSetting.current = isDefault;
          }}
          setGridPageLimit={handleGridPageLimit}
          gridPageLimit={gridPageLimit.current}
          toggleShowDirectories={toggleShowDirectories}
          toggleShowTags={toggleShowTags}
          toggleShowDetails={toggleShowDetails}
          toggleShowDescription={toggleShowDescription}
          showDetails={showDetails.current}
          showDescription={showDescription.current}
          showDirectories={showDirectories.current}
          showTags={showTags.current}
          toggleThumbnailsMode={toggleThumbnailsMode}
          thumbnailMode={thumbnailMode.current}
          changeEntrySize={changeEntrySize}
          entrySize={entrySize.current}
          changeSingleClickAction={changeSingleClickAction}
          singleClickAction={singleClickAction.current}
          openHelpWebPage={openHelpWebPage}
          sortBy={sortBy.current}
          orderBy={orderBy.current}
          handleSortingMenu={handleSortingMenu}
          isLocal={settings && settings.isLocal}
          resetLocalSettings={() => {
            Pro.MetaOperations.savePerspectiveSettings(
              currentDirectoryPath,
              PerspectiveIDs.GRID
            ).then((fsEntryMeta: TS.FileSystemEntryMeta) => {
              props.setDirectoryMeta(fsEntryMeta);
              setIsGridSettingsDialogOpened(false);
            });
          }}
        />
      )}
      {isMoveCopyFilesDialogOpened && (
        <MoveCopyFilesDialog
          open={isMoveCopyFilesDialogOpened}
          onClose={() => setIsMoveCopyFilesDialogOpened(false)}
          selectedFiles={selectedFilePaths}
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
          openRenameFileDialog={props.openRenameEntryDialog}
          openMoveCopyFilesDialog={openMoveCopyFilesDialog}
          openAddRemoveTagsDialog={openAddRemoveTagsDialog}
          openFsEntry={props.openFsEntry}
          openFileNatively={props.openFileNatively}
          loadDirectoryContent={props.loadDirectoryContent}
          showInFileManager={props.showInFileManager}
          showNotification={props.showNotification}
          isReadOnlyMode={props.isReadOnlyMode}
          selectedFilePath={getSelEntryPath()}
          selectedEntries={props.selectedEntries}
          currentLocation={props.currentLocation}
          locations={props.locations}
        />
      )}
      {/* {Boolean(dirContextMenuAnchorEl) && ( // todo move dialogs from DirectoryMenu */}
      <DirectoryMenu
        open={Boolean(dirContextMenuAnchorEl)}
        onClose={() => setDirContextMenuAnchorEl(null)}
        anchorEl={dirContextMenuAnchorEl}
        mouseX={mouseX}
        mouseY={mouseY}
        directoryPath={getSelEntryPath()}
        loadDirectoryContent={props.loadDirectoryContent}
        openRenameDirectoryDialog={props.openRenameEntryDialog}
        openDirectory={props.openDirectory}
        openFsEntry={props.openFsEntry}
        perspectiveMode={getSelEntryPath() !== props.currentDirectoryPath}
        currentLocation={props.currentLocation}
        locations={props.locations}
      />
      {/* {Boolean(tagContextMenuAnchorEl) && ( // TODO EntryTagMenu is used in TagSelect we cannot move confirm dialog from menu */}
      <EntryTagMenu
        anchorEl={tagContextMenuAnchorEl}
        open={Boolean(tagContextMenuAnchorEl)}
        onClose={() => setTagContextMenuAnchorEl(null)}
        setIsAddTagDialogOpened={setIsAddTagDialogOpened}
        selectedTag={selectedTag.current}
        currentEntryPath={selectedEntryPath.current} // getSelEntryPath()}
        removeTags={props.removeTags}
        isReadOnlyMode={props.isReadOnlyMode}
      />
      {Boolean(sortingContextMenuAnchorEl) && (
        <SortingMenu
          open={Boolean(sortingContextMenuAnchorEl)}
          onClose={() => setSortingContextMenuAnchorEl(null)}
          anchorEl={sortingContextMenuAnchorEl}
          sortBy={sortBy.current}
          orderBy={orderBy.current}
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

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(
    {
      moveFiles: IOActions.moveFiles,
      setSelectedEntries: AppActions.setSelectedEntries,
      showNotification: AppActions.showNotification,
      openFileNatively: AppActions.openFileNatively,
      openURLExternally: AppActions.openURLExternally,
      openNextFile: AppActions.openNextFile,
      openPrevFile: AppActions.openPrevFile,
      setDirectoryMeta: AppActions.setDirectoryMeta,
      toggleDeleteMultipleEntriesDialog:
        AppActions.toggleDeleteMultipleEntriesDialog,
      addTags: TaggingActions.addTags,
      addTag: TagLibraryActions.addTag
    },
    dispatch
  );
}

function mapStateToProps(state) {
  return {
    directoryMeta: getDirectoryMeta(state),
    supportedFileTypes: getSupportedFileTypes(state),
    isReadOnlyMode: isReadOnlyMode(state),
    lastSelectedEntry: getLastSelectedEntry(state),
    desktopMode: getDesktopMode(state),
    selectedEntries: getSelectedEntries(state),
    keyBindings: getKeyBindingObject(state),
    currentLocation: getLocation(state, state.app.currentLocationId),
    locations: getLocations(state),
    isDeleteMultipleEntriesDialogOpened: isDeleteMultipleEntriesDialogOpened(
      state
    )
  };
}

export default connect(
  mapStateToProps,
  mapActionCreatorsToProps
  // @ts-ignore
)(withStyles(styles, { withTheme: true })(GridPerspective));
