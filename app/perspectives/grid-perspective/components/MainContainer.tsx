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
import uuidv1 from 'uuid';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import memoize from 'memoize-one';
import { GlobalHotKeys } from 'react-hotkeys';
import { withStyles } from '@material-ui/core/styles';
import { FileSystemEntry } from '-/services/utils-io';
import { Tag } from '-/reducers/taglibrary';
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
import ConfirmDialog from '-/components/dialogs/ConfirmDialog';
import AddRemoveTagsDialog from '-/components/dialogs/AddRemoveTagsDialog';
import MoveCopyFilesDialog from '-/components/dialogs/MoveCopyFilesDialog';
import RenameFileDialog from '-/components/dialogs/RenameFileDialog';
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

interface Props {
  classes: any;
  theme: any;
  desktopMode: boolean;
  currentDirectoryPath: string;
  lastSelectedEntryPath: string | null;
  selectedEntries: Array<any>;
  supportedFileTypes: Array<any>;
  isReadOnlyMode: boolean;
  openFsEntry: (fsEntry: FileSystemEntry) => void;
  openNextFile: () => any;
  openPrevFile: () => any;
  deleteFile: (path: string) => void;
  deleteDirectory: (path: string) => void;
  loadDirectoryContent: (path: string) => void;
  openDirectory: (path: string) => void;
  showInFileManager: (path: string) => void;
  openFileNatively: (path: string) => void;
  openURLExternally: (path: string) => void;
  loadParentDirectoryContent: () => void;
  setLastSelectedEntry: (entryPath: string | null) => void;
  setSelectedEntries: (selectedEntries: Array<Object>) => void;
  addTags: () => void;
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
}

/* interface State {
  fileContextMenuOpened: boolean;
  dirContextMenuAnchorEl: Element;
  dirContextMenuOpened: boolean;
  tagContextMenuAnchorEl: Element;
  tagContextMenuOpened: boolean;
  layoutType: string;
  singleClickAction: string;
  doubleClickAction: string;
  entrySize: string;
  thumbnailMode: string;
  sortingContextMenuAnchorEl: Element;
  sortingContextMenuOpened: boolean | null;
  optionsContextMenuAnchorEl: Element;
  optionsContextMenuOpened: boolean | null;
  sortBy: string;
  orderBy: null | boolean;
  fileOperationsEnabled: boolean;
  // allFilesSelected: boolean;
  showDirectories: boolean;
  showTags: boolean;
  isDeleteMultipleFilesDialogOpened: boolean;
  isMoveCopyFilesDialogOpened: boolean;
  isAddRemoveTagsDialogOpened: boolean;
  isFileRenameDialogOpened: boolean;
  isGridSettingsDialogOpened: boolean;
  selectedEntryPath: string;
  selectedTag: Tag | null;
  gridPageLimit: number;
} */

const GridPerspective = (props: Props) => {
  const settings = JSON.parse(localStorage.getItem('tsPerspectiveGrid')); // loading settings

  const allFilesSelected = useRef<boolean>(false);
  const selectedEntryPath = useRef<string>('');
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
  // const [selectedEntryPath, setSelectedEntryPath] = useState<string>('');
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
  /* const [doubleClickAction, setDoubleClickAction] = useState<string>(
    settings && settings.doubleClickAction
      ? settings.doubleClickAction
      : 'openInternal' // openExternal
  ); */
  const [entrySize, setEntrySize] = useState<string>(
    settings && settings.entrySize ? settings.entrySize : 'normal' // small, big
  );
  const [thumbnailMode, setThumbnailMode] = useState<string>(
    settings && settings.thumbnailMode ? settings.thumbnailMode : 'cover' // contain
  );
  // const [fileOperationsEnabled, setFileOperationsEnabled] = useState<boolean>(false);
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
    isDeleteMultipleFilesDialogOpened,
    setIsDeleteMultipleFilesDialogOpened
  ] = useState<boolean>(false);
  const [
    isMoveCopyFilesDialogOpened,
    setIsMoveCopyFilesDialogOpened
  ] = useState<boolean>(false);
  const [
    isAddRemoveTagsDialogOpened,
    setIsAddRemoveTagsDialogOpened
  ] = useState<boolean>(false);
  const [isFileRenameDialogOpened, setIsFileRenameDialogOpened] = useState<
    boolean
  >(false);
  const [isGridSettingsDialogOpened, setIsGridSettingsDialogOpened] = useState<
    boolean
  >(false);
  // const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
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
      // doubleClickAction,
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
    // doubleClickAction,
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
  /* static getDerivedStateFromProps(nextProps: Props, prevState: State) {
    const { selectedEntries } = nextProps;
    let fileOperationsEnabled = false;

    if (selectedEntries && selectedEntries.length > 0) {
      let selectionContainsDirectories = false;
      selectedEntries.map(entry => {
        if (!entry.isFile) {
          selectionContainsDirectories = true;
        }
        return true;
      });
      fileOperationsEnabled = !selectionContainsDirectories;
    } else {
      GridPerspective.allFilesSelected = false;
    }

    return {
      ...prevState,
      fileOperationsEnabled
    };
  } */

  const sort = memoize((data, criteria, order) =>
    sortByCriteria(data, criteria, order)
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
      lastSelectedEntryPath,
      setLastSelectedEntry,
      setSelectedEntries
    } = props;
    const selectHelperKey = AppConfig.isMacLike ? event.metaKey : event.ctrlKey;
    if (event.shiftKey) {
      let lastSelectedIndex = directoryContent.findIndex(
        entry => entry.path === lastSelectedEntryPath
      );
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
        entriesToSelect = directoryContent.slice(
          currentSelectedIndex,
          lastSelectedIndex + 1
        );
      } else if (currentSelectedIndex === lastSelectedIndex) {
        entriesToSelect = [fsEntry];
        setLastSelectedEntry(fsEntry.path);
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
        setSelectedEntries([...selectedEntries, fsEntry]);
      }
    } else {
      setSelectedEntries([fsEntry]);
      setLastSelectedEntry(fsEntry.path);
      if (fsEntry.isFile) {
        if (singleClickAction === 'openInternal') {
          props.openFsEntry(fsEntry);
        } else if (singleClickAction === 'openExternal') {
          props.openFileNatively(fsEntry.path);
        }
        // else if (this.state.singleClickAction === 'selects') {}
      }
    }
  };

  const clearSelection = () => {
    props.setSelectedEntries([]);
    allFilesSelected.current = false;
    props.setLastSelectedEntry(null);
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
        }
        setFileContextMenuAnchorEl(event.currentTarget);
        selectedEntryPath.current = fsEntry.path;
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
      }
      selectedEntryPath.current = fsEntry.path;
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

  /* handleCloseDialogs = (clearSelection: boolean = false) => {
    this.setState({
      isFileRenameDialogOpened: false,
      isDeleteMultipleFilesDialogOpened: false,
      isAddRemoveTagsDialogOpened: false,
      isMoveCopyFilesDialogOpened: false,
      isGridSettingsDialogOpened: false
    });
    if (clearSelection) {
      clearSelection();
    }
  }; */

  const openMoveCopyFilesDialog = () => {
    setIsMoveCopyFilesDialogOpened(true);
  };

  const openDeleteFileDialog = () => {
    setIsDeleteMultipleFilesDialogOpened(true);
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
      const arrPath = [];
      if (selectedEntries && selectedEntries.length > 0) {
        selectedEntries.map(entry => {
          arrPath.push(entry.path);
          return true;
        });
      } else {
        arrPath.push(path);
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
      <div style={{ position: 'relative' }} key={key}>
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
      if (props.selectedEntries && props.selectedEntries.length > 0) {
        openAddRemoveTagsDialog();
      }
    },
    renameFile: () => {
      if (
        props.selectedEntries &&
        props.selectedEntries.length === 1 &&
        props.selectedEntries[0].isFile
      ) {
        selectedEntryPath.current = props.selectedEntries[0].path;
        setIsFileRenameDialogOpened(true);
      }
    },
    openEntry: e => {
      e.preventDefault();
      const { lastSelectedEntryPath } = props;
      if (lastSelectedEntryPath) {
        const lastSelectedEntryFile = props.directoryContent.find(
          fsEntry => fsEntry.isFile && fsEntry.path === lastSelectedEntryPath
        );
        if (lastSelectedEntryFile) {
          props.openFsEntry(lastSelectedEntryFile);
        } else {
          props.loadDirectoryContent(lastSelectedEntryPath);
        }
      }
    },
    openFileExternally: () => {
      if (props.lastSelectedEntryPath) {
        props.openFileNatively(props.lastSelectedEntryPath);
      }
    }
  };

  const {
    classes,
    directoryContent,
    selectedEntries,
    loadParentDirectoryContent,
    theme
  } = props;
  // const { layoutType, entrySize, sortBy, orderBy } = this.state;
  const selectedFilePaths = selectedEntries
    .filter(fsEntry => fsEntry.isFile)
    .map(fsentry => fsentry.path);
  const sortedContent = sort(directoryContent, sortBy, orderBy);
  const sortedDirectories = sortedContent.filter(entry => !entry.isFile);
  const sortedFiles = sortedContent.filter(entry => entry.isFile);
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
      <style>
        {`
            #gridCellTags:hover, #gridCellDescription:hover {
              opacity: 1
            }
          `}
      </style>
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
      <GlobalHotKeys keyMap={keyMap} handlers={keyBindingHandlers}>
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
      {isGridSettingsDialogOpened && (
        <GridSettingsDialog
          open={isGridSettingsDialogOpened}
          onClose={() => setIsGridSettingsDialogOpened(false)}
          setGridPageLimit={handleGridPageLimit}
          gridPageLimit={gridPageLimit}
        />
      )}
      {isMoveCopyFilesDialogOpened && (
        <MoveCopyFilesDialog
          key={uuidv1()}
          open={isMoveCopyFilesDialogOpened}
          onClose={() => setIsMoveCopyFilesDialogOpened(false)}
          selectedFiles={selectedFilePaths}
        />
      )}
      {isFileRenameDialogOpened && (
        <RenameFileDialog
          open={isFileRenameDialogOpened}
          onClose={() => setIsFileRenameDialogOpened(false)}
          selectedFilePath={selectedEntryPath.current}
        />
      )}
      {isDeleteMultipleFilesDialogOpened && (
        <ConfirmDialog
          open={isDeleteMultipleFilesDialogOpened}
          onClose={() => setIsDeleteMultipleFilesDialogOpened(false)}
          title={i18n.t('core:deleteConfirmationTitle')}
          content={i18n.t('core:deleteConfirmationContent')}
          list={selectedEntries.map(fsEntry => fsEntry.name)}
          confirmCallback={result => {
            if (result && selectedEntries) {
              const deletePromises = selectedEntries.map(fsEntry => {
                if (fsEntry.isFile) {
                  return props.deleteFile(fsEntry.path);
                }
                return props.deleteDirectory(fsEntry.path);
              });
              Promise.all(deletePromises)
                .then(delResult => {
                  // console.debug(delResult);
                  if (delResult.some(del => del)) {
                    props.setSelectedEntries([]);
                  } // TODO else { remove only deleted from setSelectedEntries}
                  return true;
                })
                .catch(err => {
                  console.warn('Deleting file failed', err);
                });
            }
            setIsDeleteMultipleFilesDialogOpened(false);
          }}
          cancelDialogTID="cancelDeleteFileDialog"
          confirmDialogTID="confirmDeleteFileDialog"
          confirmDialogContentTID="confirmDeleteDialogContent"
        />
      )}
      {Boolean(fileContextMenuAnchorEl) && (
        <FileMenu
          anchorEl={fileContextMenuAnchorEl}
          open={Boolean(fileContextMenuAnchorEl)}
          onClose={() => setFileContextMenuAnchorEl(null)}
          openDeleteFileDialog={openDeleteFileDialog}
          openRenameFileDialog={() => setIsFileRenameDialogOpened(true)}
          openMoveCopyFilesDialog={openMoveCopyFilesDialog}
          openAddRemoveTagsDialog={openAddRemoveTagsDialog}
          openFsEntry={props.openFsEntry}
          openFileNatively={props.openFileNatively}
          showInFileManager={props.showInFileManager}
          showNotification={props.showNotification}
          isReadOnlyMode={props.isReadOnlyMode}
          selectedFilePath={selectedEntryPath.current}
          selectedEntries={props.selectedEntries}
        />
      )}
      {/* {Boolean(dirContextMenuAnchorEl) && ( // todo move dialogs from DirectoryMenu */}
      <DirectoryMenu
        open={Boolean(dirContextMenuAnchorEl)}
        onClose={() => setDirContextMenuAnchorEl(null)}
        anchorEl={dirContextMenuAnchorEl}
        directoryPath={selectedEntryPath.current}
        loadDirectoryContent={props.loadDirectoryContent}
        openDirectory={props.openDirectory}
        openFsEntry={props.openFsEntry}
        deleteDirectory={props.deleteDirectory}
        isReadOnlyMode={props.isReadOnlyMode}
        perspectiveMode={true}
      />
      {/* {Boolean(tagContextMenuAnchorEl) && ( // TODO EntryTagMenu is used in TagSelect we cannot move confirm dialog from menu */}
      <EntryTagMenu
        anchorEl={tagContextMenuAnchorEl}
        open={Boolean(tagContextMenuAnchorEl)}
        onClose={() => setTagContextMenuAnchorEl(null)}
        selectedTag={selectedTag.current}
        currentEntryPath={selectedEntryPath.current}
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
      addTags: TaggingActions.addTags
    },
    dispatch
  );
}

function mapStateToProps(state) {
  return {
    supportedFileTypes: getSupportedFileTypes(state),
    isReadOnlyMode: isReadOnlyMode(state),
    lastSelectedEntryPath: getLastSelectedEntry(state),
    desktopMode: getDesktopMode(state),
    selectedEntries: getSelectedEntries(state),
    keyBindings: getKeyBindingObject(state),
    currentLocation: getLocation(state, state.app.currentLocationId),
    isDesktopMode: isDesktopMode(state)
  };
}

export default connect(
  mapStateToProps,
  mapActionCreatorsToProps
  // @ts-ignore
)(withStyles(styles, { withTheme: true })(GridPerspective));
