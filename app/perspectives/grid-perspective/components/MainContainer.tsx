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

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { GlobalHotKeys } from 'react-hotkeys';
import { withStyles } from '@material-ui/core/styles';
import { FileSystemEntry } from '-/services/utils-io';
import { actions as TagLibraryActions, Tag, Uuid } from '-/reducers/taglibrary';
import {
  getSupportedFileTypes,
  getDesktopMode,
  getKeyBindingObject,
  isDesktopMode
} from '-/reducers/settings';
import { sortByCriteria } from '-/utils/misc';
import styles from './styles.css';
import FileMenu from '-/components/menus/FileMenu';
import DirectoryMenu from '-/components/menus/DirectoryMenu';
import EntryTagMenu from '-/components/menus/EntryTagMenu';
import i18n from '-/services/i18n';
import AddRemoveTagsDialog from '-/components/dialogs/AddRemoveTagsDialog';
import MoveCopyFilesDialog from '-/components/dialogs/MoveCopyFilesDialog';
import TargetMoveFileBox from '-/components/TargetMoveFileBox';
import FileSourceDnd from '-/components/FileSourceDnd';
import AppConfig from '-/config';
import DragItemTypes from '-/components/DragItemTypes';
import TagDropContainer from '-/components/TagDropContainer';
import IOActions from '-/reducers/io-actions';
import {
  actions as AppActions,
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
import { getLocation, Location, locationType } from '-/reducers/locations';
import PlatformIO from '-/services/platform-io';
import { getLocationPath } from '-/utils/paths';
import GridPagination from '-/perspectives/grid-perspective/components/GridPagination';
import GridSettingsDialog from '-/perspectives/grid-perspective/components/GridSettingsDialog';
import AddTagToTagGroupDialog from '-/components/dialogs/AddTagToTagGroupDialog';

interface Props {
  classes: any;
  theme: any;
  desktopMode: boolean;
  currentDirectoryPath: string;
  lastSelectedEntry: any;
  selectedEntries: Array<any>;
  supportedFileTypes: Array<any>;
  isReadOnlyMode: boolean;
  openFsEntry: (fsEntry?: FileSystemEntry) => void;
  openNextFile: () => any;
  openPrevFile: () => any;
  openRenameEntryDialog: () => void;
  loadDirectoryContent: (path: string) => void;
  openDirectory: (path: string) => void;
  showInFileManager: (path: string) => void;
  openFileNatively: (path?: string) => void;
  openURLExternally: (path: string) => void;
  loadParentDirectoryContent: () => void;
  // setLastSelectedEntry: (entryPath: string | null) => void;
  setSelectedEntries: (selectedEntries: Array<Object>) => void;
  addTags: () => void;
  addTag: (tag: Tag, parentTagGroupUuid: Uuid) => void;
  removeTags: (paths: Array<string>, tags: Array<Tag>) => void;
  removeAllTags: () => void;
  directoryContent: Array<FileSystemEntry>;
  moveFiles: (files: Array<string>, destination: string) => void;
  keyBindings: any;
  showNotification: (
    text: string,
    notificationType: string,
    autohide: boolean
  ) => void;
  currentLocation: Location;
  isDesktopMode: boolean;
  toggleDeleteMultipleEntriesDialog: () => void;
}

const GridPerspective = (props: Props) => {
  const settings = JSON.parse(localStorage.getItem('tsPerspectiveGrid')); // loading settings

  const [mouseX, setMouseX] = useState<number>(undefined);
  const [mouseY, setMouseY] = useState<number>(undefined);
  const allFilesSelected = useRef<boolean>(false);
  // const selectedEntry = useRef<FileSystemEntry>(undefined);
  const selectedEntryPath = useRef<string>(undefined);
  const selectedTag = useRef<Tag | null>(null);
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
  const [isAddTagDialogOpened, setIsAddTagDialogOpened] = useState<Tag>(
    undefined
  );
  const [sortBy, setSortBy] = useState<string>(
    settings && settings.sortBy ? settings.sortBy : 'byName'
  );
  const [orderBy, setOrderBy] = useState<null | boolean>(
    settings && typeof settings.orderBy !== 'undefined'
      ? settings.orderBy
      : true
  );
  const [layoutType, setLayoutType] = useState<string>(
    settings && settings.layoutType ? settings.layoutType : 'grid'
  );
  const [singleClickAction, setSingleClickAction] = useState<string>(
    settings && settings.singleClickAction
      ? settings.singleClickAction
      : 'openInternal' // openExternal
  );
  const [entrySize, setEntrySize] = useState<string>(
    settings && settings.entrySize ? settings.entrySize : 'normal' // small, big
  );
  const [thumbnailMode, setThumbnailMode] = useState<string>(
    settings && settings.thumbnailMode ? settings.thumbnailMode : 'contain' // cover contain
  );
  const [showDirectories, setShowDirectories] = useState<boolean>(
    settings && typeof settings.showDirectories !== 'undefined'
      ? settings.showDirectories
      : true
  );
  const [showTags, setShowTags] = useState<boolean>(
    settings && typeof settings.showTags !== 'undefined'
      ? settings.showTags
      : true
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
  const [gridPageLimit, setGridPageLimit] = useState<number>(
    settings && settings.gridPageLimit ? settings.gridPageLimit : 100
  );

  useEffect(() => {
    const settingsObj = {
      showDirectories,
      showTags,
      layoutType,
      orderBy,
      sortBy,
      singleClickAction,
      entrySize,
      thumbnailMode,
      gridPageLimit
    };
    localStorage.setItem('tsPerspectiveGrid', JSON.stringify(settingsObj));
  }, [
    showDirectories,
    showTags,
    layoutType,
    orderBy,
    sortBy,
    singleClickAction,
    entrySize,
    thumbnailMode,
    gridPageLimit
  ]);

  const fileOperationsEnabled = () => {
    let selectionContainsDirectories = false;
    if (props.selectedEntries && props.selectedEntries.length > 0) {
      selectionContainsDirectories = selectedEntries.some(
        entry => !entry.isFile
      );
    }
    return !selectionContainsDirectories;
  };

  const folderOperationsEnabled = () => {
    let selectionContainsFiles = false;
    if (props.selectedEntries && props.selectedEntries.length > 0) {
      selectionContainsFiles = selectedEntries.some(entry => entry.isFile);
    }
    return !selectionContainsFiles;
  };

  const sortedDirContentMemoized = useMemo(
    () => sortByCriteria(props.directoryContent, sortBy, orderBy),
    [props.directoryContent, sortBy, orderBy]
  );

  /* const makeFirstSelectedEntryVisible = () => {
    const { selectedEntries } = props;
    if (selectedEntries && selectedEntries.length > 0) {
      const firstSelectedElement = document.querySelector(
        '[data-entry-id="' + selectedEntries[0].uuid + '"]'
      );
      if (
        isObj(firstSelectedElement) &&
        !isVisibleOnScreen(firstSelectedElement)
      ) {
        // firstSelectedElement.parentNode.scrollTop = firstSelectedElement.offsetTop - firstSelectedElement.parentNode.offsetTop;
        firstSelectedElement.scrollIntoView(false);
      }
    }
  }; */

  const handleLayoutSwitch = (type: string) => {
    setLayoutType(type);
  };

  const handleGridPageLimit = (limit: number) => {
    setGridPageLimit(limit);
    setIsGridSettingsDialogOpened(false);
  };

  const handleSortBy = handleSort => {
    if (sortBy !== handleSort) {
      setSortBy(handleSort);
    } else {
      setOrderBy(!orderBy);
    }
    setSortingContextMenuAnchorEl(null);
  };

  const handleSortingMenu = event => {
    const anchor = event ? event.currentTarget : null;
    setSortingContextMenuAnchorEl(anchor);
  };

  const handleOptionsMenu = event => {
    const anchor = event ? event.currentTarget : null;
    setOptionsContextMenuAnchorEl(anchor);
  };

  const handleGridCellClick = (event, fsEntry: FileSystemEntry) => {
    const {
      selectedEntries,
      directoryContent,
      lastSelectedEntry,
      setSelectedEntries
    } = props;
    const selectHelperKey = AppConfig.isMacLike ? event.metaKey : event.ctrlKey;
    if (event.shiftKey) {
      let lastSelectedIndex;
      if (lastSelectedEntry) {
        lastSelectedIndex = directoryContent.findIndex(
          entry => entry.path === lastSelectedEntry.path
        );
      }
      const currentSelectedIndex = directoryContent.findIndex(
        entry => entry.path === fsEntry.path
      );
      if (lastSelectedIndex < 0) {
        lastSelectedIndex = currentSelectedIndex;
      }

      let entriesToSelect;
      // console.log('lastSelectedIndex: ' + lastSelectedIndex + '  currentSelectedIndex: ' + currentSelectedIndex);
      if (currentSelectedIndex > lastSelectedIndex) {
        entriesToSelect = directoryContent.slice(
          lastSelectedIndex,
          currentSelectedIndex + 1
        );
      } else if (currentSelectedIndex < lastSelectedIndex) {
        entriesToSelect = directoryContent
          .slice(currentSelectedIndex, lastSelectedIndex + 1)
          .reverse();
      } else if (currentSelectedIndex === lastSelectedIndex) {
        entriesToSelect = [fsEntry];
      }

      setSelectedEntries(entriesToSelect);
    } else if (selectHelperKey) {
      if (
        selectedEntries &&
        selectedEntries.some(entry => entry.path === fsEntry.path)
      ) {
        setSelectedEntries(
          selectedEntries.filter(entry => entry.path !== fsEntry.path)
        ); // deselect selected entry
      } else {
        // selectedEntry.current = fsEntry;
        setSelectedEntries([...selectedEntries, fsEntry]);
      }
    } else {
      setSelectedEntries([fsEntry]);
      if (fsEntry.isFile) {
        if (singleClickAction === 'openInternal') {
          props.openFsEntry(fsEntry);
        } else if (singleClickAction === 'openExternal') {
          props.openFileNatively(fsEntry.path);
        }
      }
    }
  };

  const clearSelection = () => {
    props.setSelectedEntries([]);
    allFilesSelected.current = false;
    // props.setLastSelectedEntry(null);
    // selectedEntry.current = undefined;
    selectedEntryPath.current = undefined;
  };

  const toggleSelectAllFiles = () => {
    if (selectedEntries.length > 0) {
      // && allFilesSelected.current) {
      clearSelection();
    } else {
      const selectedEntries = [];
      props.directoryContent.map(entry => {
        if (entry.isFile) {
          selectedEntries.push(entry);
        }
        return true;
      });
      props.setSelectedEntries(selectedEntries);
      allFilesSelected.current = true;
    }
  };

  const toggleShowDirectories = () => {
    closeOptionsMenu();
    setShowDirectories(!showDirectories);
  };

  const toggleShowTags = () => {
    closeOptionsMenu();
    setShowTags(!showTags);
  };

  const toggleThumbnailsMode = () => {
    closeOptionsMenu();
    const thumbMode = thumbnailMode === 'cover' ? 'contain' : 'cover';
    setThumbnailMode(thumbMode);
  };

  const changeEntrySize = size => {
    closeOptionsMenu();
    setEntrySize(size);
  };

  const changeSingleClickAction = singleClick => {
    closeOptionsMenu();
    setSingleClickAction(singleClick);
  };

  const openHelpWebPage = () => {
    closeOptionsMenu();
    props.openURLExternally(AppConfig.documentationLinks.defaultPerspective);
  };

  const openSettings = () => {
    closeOptionsMenu();
    setIsGridSettingsDialogOpened(true);
  };

  const handleGridCellDblClick = (event, fsEntry: FileSystemEntry) => {
    props.setSelectedEntries([]);
    if (props.currentLocation.type === locationType.TYPE_CLOUD) {
      PlatformIO.enableObjectStoreSupport(props.currentLocation)
        .then(() => {
          openLocation(fsEntry);
          return true;
        })
        .catch(error => {
          console.log('enableObjectStoreSupport', error);
        });
    } else if (props.currentLocation.type === locationType.TYPE_LOCAL) {
      PlatformIO.disableObjectStoreSupport();
      openLocation(fsEntry);
    }
  };

  const openLocation = (fsEntry: FileSystemEntry) => {
    if (fsEntry.isFile) {
      props.setSelectedEntries([fsEntry]);
      props.openFsEntry(fsEntry);
    } else {
      console.log('Handle Grid cell db click, selected path : ', fsEntry.path);
      props.loadDirectoryContent(fsEntry.path);
    }
  };

  const handleGridContextMenu = (event, fsEntry: FileSystemEntry) => {
    event.preventDefault();
    event.stopPropagation();
    setMouseX(event.clientX);
    setMouseY(event.clientY);
    const { desktopMode, selectedEntries } = props;
    const isEntryExist = selectedEntries.some(
      entry => entry.uuid === fsEntry.uuid
    );
    if (fsEntry.isFile) {
      if (!desktopMode) {
        if (selectedEntries && isEntryExist) {
          props.setSelectedEntries(
            selectedEntries.filter(entry => entry.uuid !== fsEntry.uuid)
          ); // deselect selected entry
        } else {
          props.setSelectedEntries([...selectedEntries, fsEntry]);
        }
      } else {
        if (props.selectedEntries.length === 0 || !fileOperationsEnabled()) {
          props.setSelectedEntries([fsEntry]);
        } else if (event.ctrlKey) {
          if (!isEntryExist) {
            props.setSelectedEntries([...selectedEntries, fsEntry]);
          }
        } else if (isEntryExist) {
          // update selected entry
          props.setSelectedEntries([
            ...selectedEntries.filter(entry => entry.uuid !== fsEntry.uuid),
            fsEntry
          ]);
        } else {
          props.setSelectedEntries([fsEntry]);
        }
        setFileContextMenuAnchorEl(event.currentTarget);
      }
    } else {
      if (props.selectedEntries.length === 0 || !folderOperationsEnabled()) {
        props.setSelectedEntries([fsEntry]);
      } else if (isEntryExist) {
        // update selected entry
        props.setSelectedEntries([
          ...selectedEntries.filter(entry => entry.uuid !== fsEntry.uuid),
          fsEntry
        ]);
      } else {
        props.setSelectedEntries([fsEntry]);
      }
      // selectedEntry.current = fsEntry;
      setDirContextMenuAnchorEl(event.currentTarget);
    }
  };

  const selectEntry = (fsEntry: FileSystemEntry) => {
    const { setSelectedEntries, selectedEntries } = props;
    setSelectedEntries([...selectedEntries, fsEntry]);
  };

  const deselectEntry = (fsEntry: FileSystemEntry) => {
    const { setSelectedEntries, selectedEntries } = props;
    const newSelection = selectedEntries.filter(
      data => data.path !== fsEntry.path
    );
    setSelectedEntries(newSelection);
  };

  const handleTagMenu = (
    event: React.ChangeEvent<HTMLInputElement>,
    tag: Tag,
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

  const handleFileMoveDrop = (item, monitor) => {
    if (props.isReadOnlyMode) {
      props.showNotification(
        i18n.t('core:dndDisabledReadOnlyMode'),
        'error',
        true
      );
      return;
    }
    if (monitor) {
      const { path, selectedEntries } = monitor.getItem();
      let arrPath;
      if (selectedEntries && selectedEntries.length > 0) {
        const arrSelected = selectedEntries
          .map(entry => entry.path)
          // remove target folder selection
          .filter(epath => epath !== item.path);
        if (arrSelected.length > 0) {
          arrPath = arrSelected;
        } else {
          arrPath = [path];
        }
      } else {
        arrPath = [path];
      }
      console.log('Dropped files: ' + path);
      props.moveFiles(arrPath, item.path);
      clearSelection();
    }
  };

  const renderCell = (fsEntry: FileSystemEntry) => {
    const {
      classes,
      theme,
      selectedEntries,
      addTags,
      addTag,
      supportedFileTypes,
      openFsEntry
    } = props;
    if (!fsEntry.isFile && !showDirectories) {
      return;
    }

    let selected = false;
    if (
      selectedEntries &&
      selectedEntries.some(entry => entry.path === fsEntry.path)
    ) {
      selected = true;
    } /* else {
      selectedEntries.push(fsEntry);
    } */

    const cellContent: any = (
      <TagDropContainer
        entryPath={fsEntry.path} // TODO remove entryPath it is already included in selectedEntries
        selectedEntries={
          selectedEntries.length > 0 ? selectedEntries : [fsEntry]
        }
      >
        <CellContent
          selected={selected}
          fsEntry={fsEntry}
          entrySize={entrySize}
          classes={classes}
          theme={theme}
          supportedFileTypes={supportedFileTypes}
          thumbnailMode={thumbnailMode}
          addTags={addTags}
          addTag={addTag}
          selectedEntries={selectedEntries}
          selectEntry={selectEntry}
          deselectEntry={deselectEntry}
          isReadOnlyMode={props.isReadOnlyMode}
          handleTagMenu={handleTagMenu}
          layoutType={layoutType}
          showTags={showTags}
          openFsEntry={openFsEntry}
          handleGridContextMenu={handleGridContextMenu}
          handleGridCellDblClick={handleGridCellDblClick}
          handleGridCellClick={handleGridCellClick}
        />
      </TagDropContainer>
    );

    const key = fsEntry.path;

    if (fsEntry.isFile) {
      return <FileSourceDnd key={key}>{cellContent}</FileSourceDnd>;
    }

    return (
      <div
        style={{
          position: 'relative'
        }}
        key={key}
      >
        <TargetMoveFileBox
          // @ts-ignore
          accepts={[DragItemTypes.FILE]}
          path={fsEntry.path}
          onDrop={handleFileMoveDrop}
        >
          {cellContent}
        </TargetMoveFileBox>
      </div>
    );
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

  const getSelEntryPath = () => {
    if (props.lastSelectedEntry) {
      return props.lastSelectedEntry.path;
    }
    return props.currentDirectoryPath;
  };

  const keyBindingHandlers = {
    nextDocument: () => props.openNextFile(),
    prevDocument: () => props.openPrevFile(),
    selectAll: () => toggleSelectAllFiles(),
    deleteDocument: () => {
      if (fileOperationsEnabled()) {
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

  const { classes, selectedEntries, loadParentDirectoryContent, theme } = props;
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
    ? getLocationPath(props.currentLocation)
    : '';
  let entryWidth = 200;
  if (entrySize === 'small') {
    entryWidth = 150;
  } else if (entrySize === 'normal') {
    entryWidth = 200;
  } else if (entrySize === 'big') {
    entryWidth = 300;
  }
  return (
    <div
      style={{
        height:
          'calc(100% - ' +
          (AppConfig.isCordova ? '320' : '51') + // todo handle cordova screen sizes
          'px)'
      }}
    >
      <MainToolbar
        classes={classes}
        layoutType={layoutType}
        isReadOnlyMode={props.isReadOnlyMode}
        selectedEntries={selectedEntries}
        loadParentDirectoryContent={loadParentDirectoryContent}
        toggleSelectAllFiles={toggleSelectAllFiles}
        allFilesSelected={
          allFilesSelected.current && selectedEntries.length > 0
        }
        handleLayoutSwitch={handleLayoutSwitch}
        openAddRemoveTagsDialog={openAddRemoveTagsDialog}
        fileOperationsEnabled={fileOperationsEnabled()}
        openMoveCopyFilesDialog={openMoveCopyFilesDialog}
        openDeleteFileDialog={openDeleteFileDialog}
        handleSortingMenu={handleSortingMenu}
        handleOptionsMenu={handleOptionsMenu}
        isDesktopMode={props.isDesktopMode}
      />
      <GlobalHotKeys
        keyMap={keyMap}
        handlers={keyBindingHandlers}
        allowChanges={true}
      >
        <GridPagination
          gridPageLimit={gridPageLimit}
          className={
            layoutType === 'grid' ? classes.gridContainer : classes.rowContainer
          }
          style={{
            marginTop: 53,
            gridTemplateColumns:
              layoutType === 'grid'
                ? 'repeat(auto-fit,minmax(' + entryWidth + 'px,1fr))'
                : 'none'
          }}
          theme={theme}
          // gridRef={this.mainGrid}
          directories={sortedDirectories}
          showDirectories={showDirectories}
          files={sortedFiles}
          renderCell={renderCell}
          currentPage={1}
          currentLocationPath={locationPath}
          currentDirectoryPath={props.currentDirectoryPath}
          onContextMenu={onContextMenu}
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
          open={isAddTagDialogOpened !== undefined}
          onClose={() => setIsAddTagDialogOpened(undefined)}
          addTag={props.addTag}
          selectedTag={isAddTagDialogOpened}
        />
      )}
      {isGridSettingsDialogOpened && (
        <GridSettingsDialog
          open={isGridSettingsDialogOpened}
          onClose={() => setIsGridSettingsDialogOpened(false)}
          setGridPageLimit={handleGridPageLimit}
          gridPageLimit={gridPageLimit}
          toggleShowDirectories={toggleShowDirectories}
          toggleShowTags={toggleShowTags}
          showDirectories={showDirectories}
          showTags={showTags}
          toggleThumbnailsMode={toggleThumbnailsMode}
          thumbnailMode={thumbnailMode}
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
        isReadOnlyMode={props.isReadOnlyMode}
        perspectiveMode={getSelEntryPath() !== props.currentDirectoryPath}
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
          sortBy={sortBy}
          orderBy={orderBy}
          handleSortBy={handleSortBy}
        />
      )}
      {Boolean(optionsContextMenuAnchorEl) && (
        <GridOptionsMenu
          open={Boolean(optionsContextMenuAnchorEl)}
          onClose={closeOptionsMenu}
          anchorEl={optionsContextMenuAnchorEl}
          toggleShowDirectories={toggleShowDirectories}
          showDirectories={showDirectories}
          toggleShowTags={toggleShowTags}
          showTags={showTags}
          toggleThumbnailsMode={toggleThumbnailsMode}
          thumbnailMode={thumbnailMode}
          entrySize={entrySize}
          changeSingleClickAction={changeSingleClickAction}
          singleClickAction={singleClickAction}
          changeEntrySize={changeEntrySize}
          openHelpWebPage={openHelpWebPage}
          openSettings={openSettings}
        />
      )}
    </div>
  );
};

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
    supportedFileTypes: getSupportedFileTypes(state),
    isReadOnlyMode: isReadOnlyMode(state),
    lastSelectedEntry: getLastSelectedEntry(state),
    desktopMode: getDesktopMode(state),
    selectedEntries: getSelectedEntries(state),
    keyBindings: getKeyBindingObject(state),
    currentLocation: getLocation(state, state.app.currentLocationId),
    isDesktopMode: isDesktopMode(state),
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
