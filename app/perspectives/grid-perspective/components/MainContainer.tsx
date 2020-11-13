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

import React from 'react';
import uuidv1 from 'uuid';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import memoize from 'memoize-one';
import { GlobalHotKeys } from 'react-hotkeys';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { FileSystemEntry } from '-/services/utils-io';
import { Tag } from '-/reducers/taglibrary';
import {
  getSupportedFileTypes,
  getDesktopMode,
  getKeyBindingObject
} from '-/reducers/settings';
import { sortByCriteria, isObj, isVisibleOnScreen } from '-/utils/misc';
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
import { extractFileName } from '-/utils/paths';
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
  removeTags: () => void;
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
}

interface State {
  fileContextMenuAnchorEl: Element;
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
  allFilesSelected: boolean;
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
}

class GridPerspective extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    const settings = JSON.parse(localStorage.getItem('tsPerspectiveGrid')); // loading settings
    this.state = {
      fileContextMenuOpened: false,
      fileContextMenuAnchorEl: null,
      dirContextMenuOpened: false,
      dirContextMenuAnchorEl: null,
      tagContextMenuOpened: false,
      tagContextMenuAnchorEl: null,
      sortingContextMenuOpened: false,
      sortingContextMenuAnchorEl: null,
      optionsContextMenuOpened: false,
      optionsContextMenuAnchorEl: null,
      selectedEntryPath: '',
      sortBy: settings && settings.sortBy ? settings.sortBy : 'byName',
      orderBy:
        settings && typeof settings.orderBy !== 'undefined'
          ? settings.orderBy
          : true,
      layoutType:
        settings && settings.layoutType ? settings.layoutType : 'grid',
      singleClickAction:
        settings && settings.singleClickAction
          ? settings.singleClickAction
          : 'openInternal', // openExternal
      doubleClickAction:
        settings && settings.doubleClickAction
          ? settings.doubleClickAction
          : 'openInternal', // openExternal
      entrySize: settings && settings.entrySize ? settings.entrySize : 'normal', // small, big
      thumbnailMode:
        settings && settings.thumbnailMode ? settings.thumbnailMode : 'cover', // contain
      fileOperationsEnabled: false,
      allFilesSelected: false,
      showDirectories:
        settings && typeof settings.showDirectories !== 'undefined'
          ? settings.showDirectories
          : true,
      showTags:
        settings && typeof settings.showTags !== 'undefined'
          ? settings.showTags
          : true,
      isDeleteMultipleFilesDialogOpened: false,
      isMoveCopyFilesDialogOpened: false,
      isAddRemoveTagsDialogOpened: false,
      isFileRenameDialogOpened: false,
      isGridSettingsDialogOpened: false,
      selectedTag: null,
      gridPageLimit:
        settings && settings.gridPageLimit ? settings.gridPageLimit : 100
    };
  }

  static getDerivedStateFromProps(nextProps: Props, prevState: State) {
    const { lastSelectedEntryPath, selectedEntries } = nextProps;
    let fileOperationsEnabled = false;

    // if (lastSelectedEntryPath !== null) {
    // this.makeFirstSelectedEntryVisible(); // disable due to wrong scrolling
    // }

    if (selectedEntries && selectedEntries.length > 0) {
      let selectionContainsDirectories = false;
      selectedEntries.map(entry => {
        if (!entry.isFile) {
          selectionContainsDirectories = true;
        }
        return true;
      });
      fileOperationsEnabled = !selectionContainsDirectories;
    }

    return {
      ...prevState,
      fileOperationsEnabled
    };

    // const grid = document.querySelector(
    //   '[data-tid="perspectiveGridFileTable"]'
    // );
    // const firstGridItem = grid.querySelector('div');

    // if (isObj(firstGridItem)) {
    //   firstGridItem.scrollIntoView({ top: 80 });
    // }
  }

  sort = memoize((data, criteria, order) =>
    sortByCriteria(data, criteria, order)
  );

  makeFirstSelectedEntryVisible = () => {
    const { selectedEntries } = this.props;
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
  };

  saveSettings() {
    const settingsObj = {
      showDirectories: this.state.showDirectories,
      showTags: this.state.showTags,
      layoutType: this.state.layoutType,
      orderBy: this.state.orderBy,
      sortBy: this.state.sortBy,
      singleClickAction: this.state.singleClickAction,
      doubleClickAction: this.state.doubleClickAction,
      entrySize: this.state.entrySize,
      thumbnailMode: this.state.thumbnailMode,
      gridPageLimit: this.state.gridPageLimit
    };
    localStorage.setItem('tsPerspectiveGrid', JSON.stringify(settingsObj));
  }

  /* scrollToBottom = () => {
    const messagesContainer = ReactDOM.findDOMNode(this.messagesContainer);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }; */

  // mainGrid;

  handleLayoutSwitch = (layoutType: string) => {
    this.setState({ layoutType }, this.saveSettings);
  };

  handleGridPageLimit = (gridPageLimit: number) => {
    this.handleCloseDialogs();
    this.setState({ gridPageLimit }, this.saveSettings);
  };

  handleSortBy = sortBy => {
    this.closeSortingMenu();
    this.setState(
      {
        orderBy: !this.state.orderBy,
        sortBy
      },
      this.saveSettings
    );
  };

  handleSortingMenu = event => {
    this.setState({
      sortingContextMenuOpened: !this.state.sortingContextMenuOpened,
      sortingContextMenuAnchorEl: event ? event.currentTarget : null
    });
  };

  handleOptionsMenu = event => {
    this.setState({
      optionsContextMenuOpened: !this.state.optionsContextMenuOpened,
      optionsContextMenuAnchorEl: event ? event.currentTarget : null
    });
  };

  handleGridCellClick = (event, fsEntry: FileSystemEntry) => {
    const {
      selectedEntries,
      directoryContent,
      lastSelectedEntryPath,
      setLastSelectedEntry,
      setSelectedEntries
    } = this.props;
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
        if (this.state.singleClickAction === 'openInternal') {
          this.props.openFsEntry(fsEntry);
        } else if (this.state.singleClickAction === 'openExternal') {
          this.props.openFileNatively(fsEntry.path);
        }
        // else if (this.state.singleClickAction === 'selects') {}
      }
    }
  };

  clearSelection = () => {
    const { setSelectedEntries, setLastSelectedEntry } = this.props;
    setSelectedEntries([]);
    this.setState({
      allFilesSelected: false
    });
    setLastSelectedEntry(null);
  };

  toggleSelectAllFiles = () => {
    if (this.state.allFilesSelected) {
      this.clearSelection();
    } else {
      const selectedEntries = [];
      this.props.directoryContent.map(entry => {
        if (entry.isFile) {
          selectedEntries.push(entry);
        }
        return true;
      });
      this.props.setSelectedEntries(selectedEntries);
      this.setState({
        allFilesSelected: !this.state.allFilesSelected
      });
    }
  };

  toggleShowDirectories = () => {
    this.closeOptionsMenu();
    this.setState(
      {
        showDirectories: !this.state.showDirectories
      },
      this.saveSettings
    );
  };

  toggleShowTags = () => {
    this.closeOptionsMenu();
    this.setState(
      {
        showTags: !this.state.showTags
      },
      this.saveSettings
    );
  };

  toggleThumbnailsMode = () => {
    this.closeOptionsMenu();
    this.setState(
      {
        thumbnailMode:
          this.state.thumbnailMode === 'cover' ? 'contain' : 'cover'
      },
      this.saveSettings
    );
  };

  changeEntrySize = entrySize => {
    this.closeOptionsMenu();
    this.setState({ entrySize }, this.saveSettings);
  };

  changeSingleClickAction = singleClickAction => {
    this.closeOptionsMenu();
    this.setState({ singleClickAction }, this.saveSettings);
  };

  openHelpWebPage = () => {
    this.closeOptionsMenu();
    this.props.openURLExternally(
      AppConfig.documentationLinks.defaultPerspective
    );
  };

  openSettings = () => {
    this.closeOptionsMenu();
    this.openGridSettingsDialog();
  };

  handleGridCellDblClick = (event, fsEntry: FileSystemEntry) => {
    this.props.setSelectedEntries([]);
    if (this.props.currentLocation.type === locationType.TYPE_CLOUD) {
      PlatformIO.enableObjectStoreSupport(this.props.currentLocation)
        .then(() => {
          this.openLocation(fsEntry);
          return true;
        })
        .catch(error => {
          console.log('enableObjectStoreSupport', error);
        });
    } else if (this.props.currentLocation.type === locationType.TYPE_LOCAL) {
      PlatformIO.disableObjectStoreSupport();
      this.openLocation(fsEntry);
    }
  };

  openLocation = (fsEntry: FileSystemEntry) => {
    if (fsEntry.isFile) {
      this.props.setSelectedEntries([fsEntry]);
      this.props.openFsEntry(fsEntry);
    } else {
      console.log('Handle Grid cell db click, selected path : ', fsEntry.path);
      this.props.loadDirectoryContent(fsEntry.path);
    }
  };

  handleGridContextMenu = (event, fsEntry: FileSystemEntry) => {
    const { desktopMode, selectedEntries } = this.props;
    if (fsEntry.isFile) {
      if (!desktopMode) {
        if (
          selectedEntries &&
          selectedEntries.some(entry => entry.path === fsEntry.path)
        ) {
          this.props.setSelectedEntries(
            selectedEntries.filter(entry => entry.path !== fsEntry.path)
          ); // deselect selected entry
        } else {
          this.props.setSelectedEntries([...selectedEntries, fsEntry]);
        }
      } else {
        this.props.setSelectedEntries(
          event.ctrlKey ? [...selectedEntries, fsEntry] : [fsEntry]
        );
        this.setState({
          fileContextMenuOpened: true,
          fileContextMenuAnchorEl: event.currentTarget,
          selectedEntryPath: fsEntry.path
        });
      }
    } else {
      this.props.setSelectedEntries([fsEntry]);
      this.setState({
        dirContextMenuOpened: true,
        dirContextMenuAnchorEl: event.currentTarget,
        selectedEntryPath: fsEntry.path
      });
    }
  };

  handleTagMenu = (
    event: React.ChangeEvent<HTMLInputElement>,
    tag: Tag,
    entryPath: string
  ) => {
    event.preventDefault();
    event.stopPropagation();

    this.setState({
      selectedTag: tag,
      tagContextMenuAnchorEl: event.currentTarget,
      tagContextMenuOpened: true,
      selectedEntryPath: entryPath
    });
  };

  closeFileMenu = () => {
    this.setState({
      fileContextMenuOpened: false,
      fileContextMenuAnchorEl: null
    });
  };

  closeDirMenu = () => {
    this.setState({
      dirContextMenuOpened: false,
      dirContextMenuAnchorEl: null
    });
  };

  closeTagMenu = () => {
    this.setState({
      tagContextMenuOpened: false,
      tagContextMenuAnchorEl: null
    });
  };

  closeSortingMenu = () => {
    this.setState({
      sortingContextMenuOpened: false,
      sortingContextMenuAnchorEl: null
    });
  };

  closeOptionsMenu = () => {
    this.setState({
      optionsContextMenuOpened: false,
      optionsContextMenuAnchorEl: null
    });
  };

  handleCloseDialogs = (clearSelection: boolean = false) => {
    this.setState({
      isFileRenameDialogOpened: false,
      isDeleteMultipleFilesDialogOpened: false,
      isAddRemoveTagsDialogOpened: false,
      isMoveCopyFilesDialogOpened: false,
      isGridSettingsDialogOpened: false
    });
    if (clearSelection) {
      this.clearSelection();
    }
  };

  openFileRenameDialog = () => {
    this.setState({ isFileRenameDialogOpened: true });
  };

  openMoveCopyFilesDialog = () => {
    this.setState({ isMoveCopyFilesDialogOpened: true });
  };

  openDeleteFileDialog = () => {
    this.setState({ isDeleteMultipleFilesDialogOpened: true });
  };

  openAddRemoveTagsDialog = () => {
    this.setState({ isAddRemoveTagsDialogOpened: true });
  };

  openGridSettingsDialog = () => {
    this.setState({ isGridSettingsDialogOpened: true });
  };

  handleFileMoveDrop = (item, monitor) => {
    if (this.props.isReadOnlyMode) {
      this.props.showNotification(
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
      this.props.moveFiles(arrPath, item.path);
      this.clearSelection();
    }
  };

  renderCell = (fsEntry: FileSystemEntry) => {
    const {
      entrySize,
      layoutType,
      showDirectories,
      thumbnailMode
    } = this.state;
    const {
      classes,
      theme,
      selectedEntries,
      addTags,
      supportedFileTypes,
      openFsEntry
    } = this.props;
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
          isReadOnlyMode={this.props.isReadOnlyMode}
          handleTagMenu={this.handleTagMenu}
          layoutType={layoutType}
          showTags={this.state.showTags}
          openFsEntry={openFsEntry}
          handleGridContextMenu={this.handleGridContextMenu}
          handleGridCellDblClick={this.handleGridCellDblClick}
          handleGridCellClick={this.handleGridCellClick}
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
          onDrop={this.handleFileMoveDrop}
        >
          {cellContent}
        </TargetMoveFileBox>
      </div>
    );
  };

  keyMap = {
    nextDocument: this.props.keyBindings.nextDocument,
    prevDocument: this.props.keyBindings.prevDocument,
    selectAll: this.props.keyBindings.selectAll,
    deleteDocument: this.props.keyBindings.deleteDocument,
    addRemoveTags: this.props.keyBindings.addRemoveTags,
    renameFile: this.props.keyBindings.renameFile,
    openEntry: this.props.keyBindings.openEntry,
    openFileExternally: this.props.keyBindings.openFileExternally
  };

  keyBindingHandlers = {
    nextDocument: () => this.props.openNextFile(),
    prevDocument: () => this.props.openPrevFile(),
    selectAll: () => this.toggleSelectAllFiles(),
    deleteDocument: () => {
      if (this.state.fileOperationsEnabled) {
        this.openDeleteFileDialog();
      }
    },
    addRemoveTags: () => {
      if (this.props.selectedEntries && this.props.selectedEntries.length > 0) {
        this.openAddRemoveTagsDialog();
      }
    },
    renameFile: () => {
      if (
        this.props.selectedEntries &&
        this.props.selectedEntries.length === 1 &&
        this.props.selectedEntries[0].isFile
      ) {
        this.setState(
          { selectedEntryPath: this.props.selectedEntries[0].path },
          () => {
            this.openFileRenameDialog();
          }
        );
      }
    },
    openEntry: e => {
      e.preventDefault();
      const { lastSelectedEntryPath } = this.props;
      if (lastSelectedEntryPath) {
        const lastSelectedEntryFile = this.props.directoryContent.find(
          fsEntry => fsEntry.isFile && fsEntry.path === lastSelectedEntryPath
        );
        if (lastSelectedEntryFile) {
          this.props.openFsEntry(lastSelectedEntryFile);
        } else {
          this.props.loadDirectoryContent(lastSelectedEntryPath);
        }
      }
    },
    openFileExternally: () => {
      if (this.props.lastSelectedEntryPath) {
        this.props.openFileNatively(this.props.lastSelectedEntryPath);
      }
    }
  };

  render() {
    const {
      classes,
      directoryContent,
      selectedEntries,
      loadParentDirectoryContent,
      theme
    } = this.props;
    const { layoutType, entrySize, sortBy, orderBy } = this.state;
    const selectedFilePaths = selectedEntries
      .filter(fsEntry => fsEntry.isFile)
      .map(fsentry => fsentry.path);
    const sortedContent = this.sort(directoryContent, sortBy, orderBy);
    const sortedDirectories = sortedContent.filter(entry => !entry.isFile);
    const sortedFiles = sortedContent.filter(entry => entry.isFile);
    const locationPath = this.props.currentLocation
      ? this.props.currentLocation.path || this.props.currentLocation.paths[0]
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
            (AppConfig.isCordova ? '290' /* '595' */ : '104') + // todo handle cordova screen sizes
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
          layoutType={this.state.layoutType}
          isReadOnlyMode={this.props.isReadOnlyMode}
          selectedEntries={this.props.selectedEntries}
          loadParentDirectoryContent={loadParentDirectoryContent}
          toggleSelectAllFiles={this.toggleSelectAllFiles}
          allFilesSelected={this.state.allFilesSelected}
          handleLayoutSwitch={this.handleLayoutSwitch}
          openAddRemoveTagsDialog={this.openAddRemoveTagsDialog}
          fileOperationsEnabled={this.state.fileOperationsEnabled}
          openMoveCopyFilesDialog={this.openMoveCopyFilesDialog}
          openDeleteFileDialog={this.openDeleteFileDialog}
          handleSortingMenu={this.handleSortingMenu}
          handleOptionsMenu={this.handleOptionsMenu}
        />
        <GlobalHotKeys keyMap={this.keyMap} handlers={this.keyBindingHandlers}>
          <GridPagination
            gridPageLimit={this.state.gridPageLimit}
            className={
              layoutType === 'grid'
                ? classes.gridContainer
                : classes.rowContainer
            }
            style={{
              gridTemplateColumns:
                layoutType === 'grid'
                  ? 'repeat(auto-fit,minmax(' + entryWidth + 'px,1fr))'
                  : 'none'
            }}
            theme={theme}
            // gridRef={this.mainGrid}
            directories={sortedDirectories}
            showDirectories={this.state.showDirectories}
            files={sortedFiles}
            renderCell={this.renderCell}
            currentPage={1}
            currentLocationPath={locationPath}
            currentDirectoryPath={this.props.currentDirectoryPath}
          />
        </GlobalHotKeys>
        <AddRemoveTagsDialog
          open={this.state.isAddRemoveTagsDialogOpened}
          onClose={this.handleCloseDialogs}
          addTags={this.props.addTags}
          removeTags={this.props.removeTags}
          removeAllTags={this.props.removeAllTags}
          selectedEntries={this.props.selectedEntries}
        />
        <GridSettingsDialog
          open={this.state.isGridSettingsDialogOpened}
          onClose={this.handleCloseDialogs}
          setGridPageLimit={this.handleGridPageLimit}
          gridPageLimit={this.state.gridPageLimit}
        />
        <MoveCopyFilesDialog
          key={uuidv1()}
          open={this.state.isMoveCopyFilesDialogOpened}
          onClose={this.handleCloseDialogs}
          selectedFiles={selectedFilePaths}
        />
        <RenameFileDialog
          open={this.state.isFileRenameDialogOpened}
          onClose={this.handleCloseDialogs}
          selectedFilePath={this.state.selectedEntryPath}
        />
        <ConfirmDialog
          open={this.state.isDeleteMultipleFilesDialogOpened}
          onClose={this.handleCloseDialogs}
          title={i18n.t('core:deleteConfirmationTitle')}
          content={i18n.t('core:deleteConfirmationContent')}
          list={selectedFilePaths.map(path =>
            extractFileName(path, PlatformIO.getDirSeparator())
          )}
          confirmCallback={result => {
            if (result && selectedEntries) {
              selectedEntries.map(fsentry => {
                if (fsentry.isFile) {
                  this.props.deleteFile(fsentry.path);
                }
                return true;
              });
            }
            this.handleCloseDialogs(true);
          }}
          cancelDialogTID="cancelDeleteFileDialog"
          confirmDialogTID="confirmDeleteFileDialog"
          confirmDialogContentTID="confirmDeleteDialogContent"
        />
        <FileMenu
          anchorEl={this.state.fileContextMenuAnchorEl}
          open={this.state.fileContextMenuOpened}
          onClose={this.closeFileMenu}
          openDeleteFileDialog={this.openDeleteFileDialog}
          openRenameFileDialog={this.openFileRenameDialog}
          openMoveCopyFilesDialog={this.openMoveCopyFilesDialog}
          openAddRemoveTagsDialog={this.openAddRemoveTagsDialog}
          openFsEntry={this.props.openFsEntry}
          openFileNatively={this.props.openFileNatively}
          showInFileManager={this.props.showInFileManager}
          isReadOnlyMode={this.props.isReadOnlyMode}
          selectedFilePath={this.state.selectedEntryPath}
        />
        <DirectoryMenu
          open={this.state.dirContextMenuOpened}
          onClose={this.closeDirMenu}
          anchorEl={this.state.dirContextMenuAnchorEl}
          directoryPath={this.state.selectedEntryPath}
          loadDirectoryContent={this.props.loadDirectoryContent}
          openDirectory={this.props.openDirectory}
          openFsEntry={this.props.openFsEntry}
          deleteDirectory={this.props.deleteDirectory}
          isReadOnlyMode={this.props.isReadOnlyMode}
          perspectiveMode={true}
        />
        <EntryTagMenu
          anchorEl={this.state.tagContextMenuAnchorEl}
          open={this.state.tagContextMenuOpened}
          onClose={this.closeTagMenu}
          selectedTag={this.state.selectedTag}
          currentEntryPath={this.state.selectedEntryPath}
          removeTags={this.props.removeTags}
          isReadOnlyMode={this.props.isReadOnlyMode}
        />
        <SortingMenu
          open={this.state.sortingContextMenuOpened}
          onClose={this.closeSortingMenu}
          anchorEl={this.state.sortingContextMenuAnchorEl}
          sortBy={this.state.sortBy}
          orderBy={this.state.orderBy}
          handleSortBy={this.handleSortBy}
        />
        <GridOptionsMenu
          open={this.state.optionsContextMenuOpened}
          onClose={this.closeOptionsMenu}
          anchorEl={this.state.optionsContextMenuAnchorEl}
          toggleShowDirectories={this.toggleShowDirectories}
          showDirectories={this.state.showDirectories}
          toggleShowTags={this.toggleShowTags}
          showTags={this.state.showTags}
          toggleThumbnailsMode={this.toggleThumbnailsMode}
          thumbnailMode={this.state.thumbnailMode}
          entrySize={this.state.entrySize}
          changeSingleClickAction={this.changeSingleClickAction}
          singleClickAction={this.state.singleClickAction}
          changeEntrySize={this.changeEntrySize}
          openHelpWebPage={this.openHelpWebPage}
          openSettings={this.openSettings}
        />
      </div>
    );
  }
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
    currentLocation: getLocation(state, state.app.currentLocationId)
  };
}

export default connect(
  mapStateToProps,
  mapActionCreatorsToProps
  // @ts-ignore
)(withStyles(styles, { withTheme: true })(GridPerspective));
