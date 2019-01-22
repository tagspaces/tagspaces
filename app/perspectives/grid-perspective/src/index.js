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
 * @flow
 */

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import removeMd from 'remove-markdown';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import moment from 'moment';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import RadioCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import RadioUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Grid from '@material-ui/core/Grid';
import ParentDirIcon from '@material-ui/icons/SubdirectoryArrowLeft';
import ViewListIcon from '@material-ui/icons/ViewList';
import SwapVertIcon from '@material-ui/icons/SwapVert';
import ViewGridIcon from '@material-ui/icons/ViewModule';
import ArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import ArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Divider from '@material-ui/core/Divider';
import ThumbnailCoverIcon from '@material-ui/icons/PhotoSizeSelectActual';
import ThumbnailContainIcon from '@material-ui/icons/PhotoSizeSelectLarge';
import FolderIcon from '@material-ui/icons/FolderOpen';
import FolderHiddenIcon from '@material-ui/icons/Folder';
import TagIcon from '@material-ui/icons/LocalOffer';
import CopyIcon from '@material-ui/icons/FileCopy';
import DeleteIcon from '@material-ui/icons/Delete';
import SelectAllIcon from '@material-ui/icons/CheckBox';
import DeSelectAllIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import {
  type FileSystemEntry,
  findColorForFileEntry
} from '../../../services/utils-io';
import { type Tag } from '../../../reducers/taglibrary';
import {
  getSupportedFileTypes
} from '../../../reducers/settings';
import { extractTitle } from '../../../utils/paths';
import {
  formatFileSize,
  formatDateTime,
  isObj,
  isVisibleOnScreen
} from '../../../utils/misc';
import styles from './styles.css';
import FileMenu from '../../../components/menus/FileMenu';
import DirectoryMenu from '../../../components/menus/DirectoryMenu';
import EntryTagMenu from '../../../components/menus/EntryTagMenu';
import TagContainer from '../../../components/TagContainer';
import i18n from '../../../services/i18n';
import ConfirmDialog from '../../../components/dialogs/ConfirmDialog';
import AddRemoveTagsDialog from '../../../components/dialogs/AddRemoveTagsDialog';
import MoveCopyFilesDialog from '../../../components/dialogs/MoveCopyFilesDialog';
import RenameFileDialog from '../../../components/dialogs/RenameFileDialog';
import TagDropContainer from '../../../components/TagDropContainer';
import TargetMoveFileBox from '../../../components/TargetMoveFileBox';
import FileSourceDnd from '../../../components/FileSourceDnd';
import AppConfig from '../../../config';
import DragItemTypes from '../../../components/DragItemTypes';
import IOActions from '../../../reducers/io-actions';
import {
  actions as AppActions,
  getLastSelectedEntry,
} from '../../../reducers/app';

const maxDescriptionPreviewLength = 90;

const settings = JSON.parse(localStorage.getItem('tsPerspectiveGrid')); // loading settings

type Props = {
  classes: Object,
  currentDirectoryPath?: string,
  sortByCriteria: () => void,
  openFile: (path: string, isFile?: boolean) => void,
  deleteFile: (path: string) => void,
  deleteDirectory: (path: string) => void,
  loadDirectoryContent: (path: string) => void,
  openDirectory: (path: string) => void,
  openFileNatively: (path: string) => void,
  loadParentDirectoryContent: () => void,
  setLastSelectedEntry: (entryPath: string | null) => void,
  addTags: () => void,
  removeTags: () => void,
  removeAllTags: () => void,
  editTagForEntry: () => void,
  perspectiveCommand: Object,
  directoryContent: Array<FileSystemEntry>,
  moveFiles: (files: Array<string>, destination: string) => void
};

type State = {
  fileContextMenuAnchorEl?: Object | null,
  fileContextMenuOpened?: boolean,
  dirContextMenuAnchorEl?: Object | null,
  dirContextMenuOpened?: boolean,
  tagContextMenuAnchorEl?: Object | null,
  tagContextMenuOpened?: boolean,
  layoutType?: string,
  singleClickAction?: string,
  doubleClickAction?: string,
  entrySize?: string,
  thumbnailMode?: string,
  sortingContextMenuAnchorEl?: Object | null,
  sortingContextMenuOpened?: boolean | null,
  optionsContextMenuAnchorEl?: Object | null,
  optionsContextMenuOpened?: boolean | null,
  sortBy?: string,
  orderBy?: null | boolean,
  fileOperationsEnabled?: boolean,
  allFilesSelected?: boolean,
  showDirectories?: boolean,
  isDeleteMultipleFilesDialogOpened?: boolean,
  isMoveCopyFilesDialogOpened?: boolean,
  isAddRemoveTagsDialogOpened?: boolean,
  isFileRenameDialogOpened?: boolean,
  selectedEntryPath?: string,
  selectedTag?: Tag | null,
  selectedEntries?: Array<Object>
};

class GridPerspective extends React.Component<Props, State> {
  constructor(props) {
    super(props);
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
      orderBy: settings && settings.orderBy ? settings.orderBy : false,
      layoutType: settings && settings.layoutType ? settings.layoutType : 'grid',
      singleClickAction: settings && settings.singleClickAction ? settings.singleClickAction : 'openInternal', // openExternal
      doubleClickAction: settings && settings.doubleClickAction ? settings.doubleClickAction : 'openInternal', // openExternal
      entrySize: settings && settings.entrySize ? settings.entrySize : 'normal', // small, big
      thumbnailMode: settings && settings.thumbnailMode ? settings.thumbnailMode : 'cover', // contain
      fileOperationsEnabled: false,
      allFilesSelected: false,
      showDirectories: settings && settings.showDirectories ? settings.showDirectories : true,
      isDeleteMultipleFilesDialogOpened: false,
      isMoveCopyFilesDialogOpened: false,
      isAddRemoveTagsDialogOpened: false,
      isFileRenameDialogOpened: false,
      selectedTag: null,
      selectedEntries: []
    };
    // console.log('Sort by -->' + this.state.sortBy);
  }

  componentWillReceiveProps = (nextProps: Props) => {
    const cmd = nextProps.perspectiveCommand;
    const { directoryContent } = nextProps;
    if (cmd && cmd.key) {
      if (
        cmd.key === 'SELECT_FILE' &&
        cmd.value.length > 0 &&
        directoryContent &&
        directoryContent.length > 0
      ) {
        this.setState(
          {
            selectedEntries: nextProps.directoryContent.filter(
              fsEntry => fsEntry.path === cmd.value
            )
          },
          () => {
            this.computeFileOperationsEnabled();
            // this.makeFirstSelectedEntryVisible(); // disable due to wrong scrolling
          }
        );
      }

      if (cmd.key === 'TOGGLE_SELECT_ALL') {
        this.toggleSelectAllFiles();
      }

      if (
        cmd.key === 'ADD_REMOVE_TAGS' &&
        this.state.selectedEntries &&
        this.state.selectedEntries.length > 0
      ) {
        this.openAddRemoveTagsDialog();
      }

      if (
        cmd.key === 'RENAME_ENTRY' &&
        this.state.selectedEntries &&
        this.state.selectedEntries.length === 1
      ) {
        if (this.state.selectedEntries[0].isFile) {
          this.setState({ selectedEntryPath: this.state.selectedEntries[0].path }, () => {
            this.openFileRenameDialog();
          });
        }
      }

      if (cmd.key === 'DELETE_SELECTED_ENTRIES' && this.state.fileOperationsEnabled) {
        this.openDeleteFileDialog();
      }
    }

    // Directory changed
    if (
      nextProps.currentDirectoryPath !== this.props.currentDirectoryPath &&
      this.mainGrid
    ) {
      // Clear selection on directory change
      this.clearSelection();

      this.props.sortByCriteria(this.state.sortBy, this.state.orderBy);

      const grid = document.querySelector(
        '[data-tid="perspectiveGridFileTable"]'
      );
      const firstGridItem = grid.querySelector('div');

      if (isObj(firstGridItem)) {
        firstGridItem.scrollIntoView({ top: 0 });
      }
    }
  };

  makeFirstSelectedEntryVisible = () => {
    const { selectedEntries } = this.state;
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

  saveSettings() {
    const settingsObj = {
      showDirectories: this.state.showDirectories,
      layoutType: this.state.layoutType,
      orderBy: this.state.orderBy,
      sortBy: this.state.sortBy,
      singleClickAction: this.state.singleClickAction,
      doubleClickAction: this.state.doubleClickAction,
      entrySize: this.state.entrySize,
      thumbnailMode: this.state.thumbnailMode
    };
    localStorage.setItem('tsPerspectiveGrid', JSON.stringify(settingsObj));
  }

  scrollToBottom = () => {
    const messagesContainer = ReactDOM.findDOMNode(this.messagesContainer);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  };

  mainGrid;

  handleLayoutSwitch = (layoutType: string) => {
    this.setState({ layoutType }, this.saveSettings);
  };

  handleSortBy = sortBy => {
    this.closeSortingMenu();
    this.props.sortByCriteria(sortBy, !this.state.orderBy);
    this.setState({
      orderBy: !this.state.orderBy,
      sortBy
    }, this.saveSettings);
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
    const { selectedEntries } = this.state;
    if (event.ctrlKey && event.shiftKey) {
      const lastSelectedIndex = this.props.directoryContent.findIndex(entry => entry.path === this.props.lastSelectedEntry);
      const currentSelectedIndex = this.props.directoryContent.findIndex(entry => entry.path === fsEntry.path);
      let entriesToSelect;

      if (currentSelectedIndex > lastSelectedIndex) {
        entriesToSelect = this.props.directoryContent.slice(lastSelectedIndex, currentSelectedIndex + 1);
      } else {
        entriesToSelect = this.props.directoryContent.slice(currentSelectedIndex, lastSelectedIndex + 1);
      }

      this.setState(
        {
          selectedEntries: selectedEntries.concat(entriesToSelect)
        },
        this.computeFileOperationsEnabled
      );
      this.props.setLastSelectedEntry(fsEntry.path);
    } else if (event.ctrlKey) {
      if (
        selectedEntries &&
        selectedEntries.some(entry => entry.path === fsEntry.path)
      ) {
        this.setState(
          {
            selectedEntries: selectedEntries.filter(
              entry => entry.path !== fsEntry.path
            ) // deselect selected entry
          },
          this.computeFileOperationsEnabled
        );
        this.props.setLastSelectedEntry(null);
      } else {
        this.setState(
          {
            selectedEntries: [...selectedEntries, fsEntry]
          },
          this.computeFileOperationsEnabled
        );
        this.props.setLastSelectedEntry(fsEntry.path);
      }
    } else if (event.shiftKey) {
      const lastSelectedIndex = this.props.directoryContent.findIndex(entry => entry.path === this.props.lastSelectedEntry);
      const currentSelectedIndex = this.props.directoryContent.findIndex(entry => entry.path === fsEntry.path);
      let entriesToSelect;

      if (currentSelectedIndex > lastSelectedIndex) {
        entriesToSelect = this.props.directoryContent.slice(lastSelectedIndex, currentSelectedIndex + 1);
      } else {
        entriesToSelect = this.props.directoryContent.slice(currentSelectedIndex, lastSelectedIndex + 1);
      }

      this.setState(
        {
          selectedEntries: entriesToSelect
        },
        this.computeFileOperationsEnabled
      );
    } else {
      this.setState(
        {
          selectedEntries: [fsEntry]
        },
        this.computeFileOperationsEnabled
      );
      this.props.setLastSelectedEntry(fsEntry.path);
      if (fsEntry.isFile) {
        if (this.state.singleClickAction === 'openInternal') {
          this.props.openFile(fsEntry.path, fsEntry.isFile);
        } else if (this.state.singleClickAction === 'openExternal') {
          this.props.openFileNatively(fsEntry.path);
        } else {
          this.props.openFile(fsEntry.path, fsEntry.isFile);
        }
      }
    }
  };

  clearSelection = () => {
    this.setState(
      {
        selectedEntries: [],
        allFilesSelected: false
      },
      this.computeFileOperationsEnabled
    );
    this.props.setLastSelectedEntry(null);
  };

  toggleSelectAllFiles = () => {
    if (this.state.allFilesSelected) {
      this.clearSelection();
    } else {
      const selectedEntries = [];
      let lastSelectedPath = null;
      this.props.directoryContent.map(entry => {
        if (entry.isFile) {
          selectedEntries.push(entry);
          lastSelectedPath = entry.path;
        }
        return true;
      });
      this.setState(
        {
          selectedEntries,
          allFilesSelected: !this.state.allFilesSelected
        },
        this.computeFileOperationsEnabled
      );
      this.props.setLastSelectedEntry(lastSelectedPath);
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

  toggleThumbnailsMode = () => {
    this.closeOptionsMenu();
    this.setState(
      {
        thumbnailMode: this.state.thumbnailMode === 'cover' ? 'contain' : 'cover'
      },
      this.saveSettings
    );
  };

  changeEntrySize = (entrySize) => {
    this.closeOptionsMenu();
    this.setState({ entrySize },
      this.saveSettings
    );
  };

  changeSingleClickAction = (singleClickAction) => {
    this.closeOptionsMenu();
    this.setState({ singleClickAction },
      this.saveSettings
    );
  };

  handleGridCellDblClick = (event, fsEntry: FileSystemEntry) => {
    this.setState(
      {
        selectedEntries: []
      },
      this.computeFileOperationsEnabled
    );
    if (fsEntry.isFile) {
      this.setState(
        {
          selectedEntries: [fsEntry]
        },
        this.computeFileOperationsEnabled
      );
      this.props.openFile(fsEntry.path);
    } else {
      console.log('Handle Grid cell db click, selected path : ', fsEntry.path);
      this.props.loadDirectoryContent(fsEntry.path);
    }
  };

  handleGridContextMenu = (event, fsEntry: FileSystemEntry) => {
    const { selectedEntries } = this.state;

    if (fsEntry.isFile) {
      this.setState({
        fileContextMenuOpened: true,
        fileContextMenuAnchorEl: event.currentTarget,
        selectedEntryPath: fsEntry.path,
        selectedEntries: event.ctrlKey
          ? [...selectedEntries, fsEntry]
          : [fsEntry]
      });
    } else {
      this.setState({
        dirContextMenuOpened: true,
        dirContextMenuAnchorEl: event.currentTarget,
        selectedEntryPath: fsEntry.path,
        selectedEntries: [fsEntry]
      });
    }
  };

  handleTagMenu = (event: Object, tag: Tag, entryPath: string) => {
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

  handleCloseDialogs = () => {
    this.setState({
      isFileRenameDialogOpened: false,
      isDeleteMultipleFilesDialogOpened: false,
      isAddRemoveTagsDialogOpened: false,
      isMoveCopyFilesDialogOpened: false
    });
    this.clearSelection();
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

  computeFileOperationsEnabled = () => {
    const { selectedEntries } = this.state;
    if (selectedEntries && selectedEntries.length > 0) {
      let selectionContainsDirectories = false;
      selectedEntries.map(entry => {
        if (!entry.isFile) {
          selectionContainsDirectories = true;
        }
        return true;
      });
      this.setState({ fileOperationsEnabled: !selectionContainsDirectories });
    } else {
      this.setState({ fileOperationsEnabled: false });
    }
  };

  handleFileMoveDrop = (item, monitor) => {
    if (monitor) {
      const { path } = monitor.getItem();
      console.log('Dropped files: ' + path);
      this.props.moveFiles([path], item.children.props.entryPath);
    }
  };

  renderCell = (fsEntry: FileSystemEntry) => {
    const { entrySize } = this.state;
    if (!fsEntry.isFile && !this.state.showDirectories) {
      return;
    }
    const classes = this.props.classes;
    let selected = false;
    if (
      this.state.selectedEntries &&
      this.state.selectedEntries.some(entry => entry.path === fsEntry.path)
    ) {
      selected = true;
    }
    const { layoutType } = this.state;
    let entryHeight = 200;
    if (entrySize === 'small') {
      entryHeight = 50;
    } else if (entrySize === 'normal') {
      entryHeight = 100;
    } else if (entrySize === 'big') {
      entryHeight = 150;
    }
    const cellContent = (
      <TagDropContainer entryPath={fsEntry.path}>
        <Paper
          data-entry-id={fsEntry.uuid}
          className={classNames(
            layoutType === 'grid' && classes.gridCell,
            layoutType === 'row' && classes.rowCell,
            selected && layoutType === 'grid' && classes.selectedGridCell,
            selected && layoutType === 'row' && classes.selectedRowCell
          )}
          style={layoutType === 'row' ? {
            minHeight: entryHeight
          } : {}}
          onContextMenu={event => this.handleGridContextMenu(event, fsEntry)}
          onDoubleClick={event => this.handleGridCellDblClick(event, fsEntry)}
          onClick={event => this.handleGridCellClick(event, fsEntry)}
        >
          {this.renderCellContent(fsEntry)}
        </Paper>
      </TagDropContainer>
    );
    if (fsEntry.isFile) {
      return (
        <FileSourceDnd>
          {cellContent}
        </FileSourceDnd>
      );
    }

    return (
      <div style={{ position: 'relative' }}>
        <TargetMoveFileBox accepts={[DragItemTypes.FILE]} onDrop={this.handleFileMoveDrop}>
          {cellContent}
        </TargetMoveFileBox>
      </div>
    );
  };

  renderTag = (tag: Object, fsEntry) => (
    <TagContainer
      tag={tag}
      key={tag.id}
      entryPath={fsEntry.path}
      handleTagMenu={this.handleTagMenu}
    />
  );

  renderCellContent = (fsEntry: FileSystemEntry) => {
    const classes = this.props.classes;
    let description = removeMd(fsEntry.description);
    if (description.length > maxDescriptionPreviewLength) {
      description = description.substr(0, maxDescriptionPreviewLength) + '...';
    }
    const fsEntryColor = findColorForFileEntry(
      fsEntry.extension,
      fsEntry.isFile,
      this.props.supportedFileTypes
    );
    let thumbPathUrl = fsEntry.thumbPath
      ? 'url("' + fsEntry.thumbPath + '")'
      : '';
    if (AppConfig.isWin) {
      thumbPathUrl = thumbPathUrl.split('\\').join('\\\\');
    }
    if (this.state.layoutType === 'grid') {
      return (
        <div>
          <div
            className={classes.gridCellThumb}
            style={{
              backgroundSize: this.state.thumbnailMode,
              backgroundImage: thumbPathUrl,
              height: 150 // fsEntry.isFile ? 150 : 70
            }}
          >
            <div id="gridCellTags" className={classes.gridCellTags}>
              {fsEntry.tags.map(tag => this.renderTag(tag, fsEntry))}
            </div>
            {description.length > 0 && (
              <Typography
                className={classes.gridCellDescription}
                noWrap={true}
                title={i18n.t('core:filePropertiesDescription')}
                variant="caption"
              >
                {description}
              </Typography>
            )}
          </div>
          <Typography
            className={classes.gridCellTitle}
            data-tid="fsEntryName"
            title={fsEntry.path}
            noWrap={true}
            variant="body1"
          >
            {extractTitle(fsEntry.name, !fsEntry.isFile)}
          </Typography>
          {fsEntry.isFile ? (
            <div className={classes.gridDetails}>
              <Typography
                className={classes.gridFileExtension}
                style={{ backgroundColor: fsEntryColor }}
                noWrap={true}
                variant="button"
                title={fsEntry.path}
              >
                {fsEntry.extension}
              </Typography>
              <Typography className={classes.gridSizeDate} variant="caption">
                <span
                  title={
                    i18n.t('core:modifiedDate') +
                    ': ' +
                    formatDateTime(fsEntry.lmdt, true)
                  }
                >
                  {fsEntry.lmdt && ' ' + moment(fsEntry.lmdt).fromNow() /* ⏲ */}
                </span>
                <span title={fsEntry.size + ' ' + i18n.t('core:sizeInBytes')}>
                  {' ' + formatFileSize(fsEntry.size)}
                </span>
              </Typography>
            </div>
          ) : (
            <div className={classes.gridDetails}>
              <FolderIcon
                className={classes.gridFolder}
                style={{ backgroundColor: fsEntryColor }}
                title={fsEntry.path}
              />
              {/* <Typography className={classes.gridSizeDate} variant="caption">
                {' ' + formatDateTime4Tag(fsEntry.lmdt) }
              </Typography> */}
            </div>
          )}
        </div>
      );
    } else if (this.state.layoutType === 'row') {
      return (
        <Grid container wrap="nowrap" spacing={16}>
          <Grid
            item
            style={{
              padding: 10
            }}
          >
            {fsEntry.isFile ? (
              <div
                className={classes.rowFileExtension}
                title={fsEntry.path}
                style={{ backgroundColor: fsEntryColor }}
              >
                {fsEntry.extension}
              </div>
            ) : (
              <span className={classes.gridFolder} title={fsEntry.path}>
                <FolderIcon
                  className={classes.rowFolder}
                  style={{ backgroundColor: fsEntryColor }}
                />
              </span>
            )}
          </Grid>
          <Grid item xs zeroMinWidth>
            <Typography
              style={{
                padding: 5
              }}
            >
              {extractTitle(fsEntry.name, !fsEntry.isFile)}
            </Typography>
            {fsEntry.tags.map(tag => this.renderTag(tag, fsEntry))}
            <Typography
              noWrap
              style={{
                color: 'gray',
                padding: 5
              }}
            >
              <span title={fsEntry.size + ' ' + i18n.t('core:sizeInBytes')}>
                {fsEntry.isFile && formatFileSize(fsEntry.size) + ' - '}
              </span>
              <span
                title={
                  i18n.t('core:modifiedDate') +
                  ': ' +
                  formatDateTime(fsEntry.lmdt, true)
                }
              >
                {fsEntry.isFile && fsEntry.lmdt && '️ ' + moment(fsEntry.lmdt).fromNow() /* ⏲ */}
              </span>
              <span title={i18n.t('core:entryDescription')}>
                {description && description + ''}
              </span>
            </Typography>
          </Grid>
          {fsEntry.thumbPath && (
            <Grid
              item
              style={
                {
                  // margin: 5,
                }
              }
            >
              <div
                className={classes.gridCellThumb}
                style={{
                  backgroundSize: this.state.thumbnailMode,
                  backgroundImage: thumbPathUrl,
                  margin: 5,
                  height: 85,
                  width: 85
                }}
              />
            </Grid>
          )}
        </Grid>
      );
    }
  };

  render() {
    const classes = this.props.classes;
    const { selectedEntries = [], layoutType, entrySize } = this.state;
    const selectedFilePaths = selectedEntries.filter(fsEntry => fsEntry.isFile).map(fsentry => fsentry.path);
    let entryWidth = 200;
    if (entrySize === 'small') {
      entryWidth = 150;
    } else if (entrySize === 'normal') {
      entryWidth = 200;
    } else if (entrySize === 'big') {
      entryWidth = 300;
    }
    // console.log('Render grid');
    return (
      <div style={{ height: '100%' }}>
        <style>
          {`
            #gridCellTags:hover {
              opacity: 1
            }
          `}
        </style>
        <Toolbar
          className={classes.topToolbar}
          data-tid="perspectiveGridToolbar"
        >
          <IconButton
            title={i18n.t('core:toggleSelectAllFiles')}
            data-tid="gridPerspectiveSelectAllFiles"
            onClick={this.toggleSelectAllFiles}
          >
            {this.state.allFilesSelected ? (
              <SelectAllIcon />
            ) : (
              <DeSelectAllIcon />
            )}
          </IconButton>
          <IconButton
            title={i18n.t('core:navigateToParentDirectory')}
            aria-label={i18n.t('core:navigateToParentDirectory')}
            data-tid="gridPerspectiveOnBackButton"
            onClick={this.props.loadParentDirectoryContent}
          >
            <ParentDirIcon />
          </IconButton>
          {this.state.layoutType === 'row' ? (
            <IconButton
              title={i18n.t('core:switchToGridView')}
              aria-label={i18n.t('core:switchToGridView')}
              data-tid="gridPerspectiveSwitchLayoutToGrid"
              onClick={() => {
                this.handleLayoutSwitch('grid');
              }}
            >
              <ViewGridIcon />
            </IconButton>
          ) : (
            <IconButton
              title={i18n.t('core:switchToListView')}
              aria-label={i18n.t('core:switchToListView')}
              data-tid="gridPerspectiveSwitchLayoutToRow"
              onClick={() => {
                this.handleLayoutSwitch('row');
              }}
            >
              <ViewListIcon />
            </IconButton>
          )}
          <IconButton
            title={i18n.t('core:tagSelectedEntries')}
            aria-label={i18n.t('core:tagSelectedEntries')}
            data-tid="gridPerspectiveAddRemoveTags"
            disabled={selectedEntries.length < 1}
            onClick={this.openAddRemoveTagsDialog}
          >
            <TagIcon />
          </IconButton>
          <IconButton
            title={i18n.t('core:copyMoveSelectedEntries')}
            aria-label={i18n.t('core:copyMoveSelectedEntries')}
            data-tid="gridPerspectiveCopySelectedFiles"
            disabled={!this.state.fileOperationsEnabled}
            onClick={this.openMoveCopyFilesDialog}
          >
            <CopyIcon />
          </IconButton>
          <IconButton
            title={i18n.t('core:deleteSelectedEntries')}
            aria-label={i18n.t('core:deleteSelectedEntries')}
            data-tid="gridPerspectiveDeleteMultipleFiles"
            disabled={!this.state.fileOperationsEnabled}
            onClick={this.openDeleteFileDialog}
          >
            <DeleteIcon />
          </IconButton>
          <IconButton
            title={i18n.t('core:sort')}
            aria-label={i18n.t('core:sort')}
            data-tid="gridPerspectiveSortMenu"
            onClick={e => {
              this.handleSortingMenu(e);
            }}
          >
            <SwapVertIcon />
          </IconButton>
          <IconButton
            title={i18n.t('core:options')}
            data-tid="gridPerspectiveOptionsMenu"
            onClick={e => {
              this.handleOptionsMenu(e);
            }}
          >
            <MoreVertIcon />
          </IconButton>
        </Toolbar>
        <div style={{ height: '100%', overflowY: AppConfig.isFirefox ? 'auto' : 'overlay' }}>
          <div
            className={layoutType === 'grid' ? classes.gridContainer : classes.rowContainer}
            style={layoutType === 'grid' ? {
              gridTemplateColumns: 'repeat(auto-fit,minmax(' + entryWidth + 'px,1fr))'
            } : {}}
            ref={ref => {
              this.mainGrid = ref;
            }}
            data-tid="perspectiveGridFileTable"
          >
            {this.props.directoryContent.length > 0 ? (
              this.props.directoryContent.map(entry => this.renderCell(entry))
            ) : (
              <Typography style={{ padding: 15 }}>
                {i18n.t('core:noFileFolderFound')}
              </Typography>
            )}
          </div>
        </div>
        <AddRemoveTagsDialog
          open={this.state.isAddRemoveTagsDialogOpened}
          onClose={this.handleCloseDialogs}
          addTags={this.props.addTags}
          removeTags={this.props.removeTags}
          removeAllTags={this.props.removeAllTags}
          selectedEntries={this.state.selectedEntries}
        />
        <MoveCopyFilesDialog
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
          list={selectedFilePaths}
          confirmCallback={result => {
            if (result && this.state.selectedEntries) {
              this.state.selectedEntries.map(fsentry => {
                if (fsentry.isFile) {
                  this.props.deleteFile(fsentry.path);
                }
                return true;
              });
            }
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
          openFile={this.props.openFile}
          openFileNatively={this.props.openFileNatively}
          openDirectory={this.props.openDirectory}
          selectedFilePath={this.state.selectedEntryPath}
        />
        <DirectoryMenu
          open={this.state.dirContextMenuOpened}
          onClose={this.closeDirMenu}
          anchorEl={this.state.dirContextMenuAnchorEl}
          directoryPath={this.state.selectedEntryPath}
          loadDirectoryContent={this.props.loadDirectoryContent}
          openDirectory={this.props.openDirectory}
          openFileNatively={this.props.openFileNatively}
          openFile={this.props.openFile}
          deleteDirectory={this.props.deleteDirectory}
          perspectiveMode={true}
        />
        <EntryTagMenu
          anchorEl={this.state.tagContextMenuAnchorEl}
          open={this.state.tagContextMenuOpened}
          onClose={this.closeTagMenu}
          selectedTag={this.state.selectedTag}
          currentEntryPath={this.state.selectedEntryPath}
          removeTags={this.props.removeTags}
          editTagForEntry={this.props.editTagForEntry}
        />
        <Menu
          open={this.state.sortingContextMenuOpened}
          onClose={this.closeSortingMenu}
          anchorEl={this.state.sortingContextMenuAnchorEl}
        >
          <MenuItem
            data-tid="gridPerspectiveSortByName"
            onClick={() => { this.handleSortBy('byName'); }}
          >
            <ListItemIcon style={{ minWidth: 25 }}>
              {(this.state.sortBy === 'byName') && (
                this.state.orderBy ? <ArrowUpIcon /> : <ArrowDownIcon />
              )}
            </ListItemIcon>
            <ListItemText inset primary={i18n.t('core:fileTitle')} />
          </MenuItem>
          <MenuItem
            data-tid="gridPerspectiveSortBySize"
            onClick={() => { this.handleSortBy('byFileSize'); }}
          >
            <ListItemIcon style={{ minWidth: 25 }}>
              {(this.state.sortBy === 'byFileSize') && (
                this.state.orderBy ? <ArrowUpIcon /> : <ArrowDownIcon />
              )}
            </ListItemIcon>
            <ListItemText inset primary={i18n.t('core:fileSize')} />
          </MenuItem>
          <MenuItem
            data-tid="gridPerspectiveSortByDate"
            onClick={() => { this.handleSortBy('byDateModified'); }}
          >
            <ListItemIcon style={{ minWidth: 25 }}>
              {(this.state.sortBy === 'byDateModified') && (
                this.state.orderBy ? <ArrowUpIcon /> : <ArrowDownIcon />
              )}
            </ListItemIcon>
            <ListItemText inset primary={i18n.t('core:fileLDTM')} />
          </MenuItem>
          <MenuItem
            data-tid="gridPerspectiveSortByExt"
            onClick={() => { this.handleSortBy('byExtension'); }}
          >
            <ListItemIcon style={{ minWidth: 25 }}>
              {(this.state.sortBy === 'byExtension') && (
                this.state.orderBy ? <ArrowUpIcon /> : <ArrowDownIcon />
              )}
            </ListItemIcon>
            <ListItemText inset primary={i18n.t('core:fileExtension')} />
          </MenuItem>
        </Menu>
        <Menu
          open={this.state.optionsContextMenuOpened}
          onClose={this.closeOptionsMenu}
          anchorEl={this.state.optionsContextMenuAnchorEl}
        >
          <MenuItem
            data-tid="gridPerspectiveToggleShowDirectories"
            title={i18n.t('core:showHideDirectories')}
            aria-label={i18n.t('core:showHideDirectories')}
            onClick={this.toggleShowDirectories}
          >
            <ListItemIcon style={{ minWidth: 25 }}>
              {this.state.showDirectories ? <FolderIcon /> : <FolderHiddenIcon />}
            </ListItemIcon>
            <ListItemText inset primary={i18n.t('core:showHideDirectories')} />
          </MenuItem>
          <MenuItem
            data-tid="gridPerspectiveToggleThumbnailsMode"
            title={i18n.t('core:toggleThumbnailModeTitle')}
            aria-label={i18n.t('core:toggleThumbnailMode')}
            onClick={this.toggleThumbnailsMode}
          >
            <ListItemIcon>
              {this.state.thumbnailMode === 'cover' ? <ThumbnailCoverIcon /> : <ThumbnailContainIcon />}
            </ListItemIcon>
            <ListItemText inset primary={i18n.t('core:toggleThumbnailMode')} />
          </MenuItem>
          <Divider />
          <MenuItem
            data-tid="gridPerspectiveEntrySizeSmall"
            title={i18n.t('core:entrySizeSmall')}
            aria-label={i18n.t('core:entrySizeSmall')}
            onClick={() => this.changeEntrySize('small')}
          >
            <ListItemIcon>
              {this.state.entrySize === 'small' ? <RadioCheckedIcon /> : <RadioUncheckedIcon />}
            </ListItemIcon>
            <ListItemText inset primary={i18n.t('core:entrySizeSmall')} />
          </MenuItem>
          <MenuItem
            data-tid="gridPerspectiveEntrySizeNormal"
            title={i18n.t('core:entrySizeNormal')}
            aria-label={i18n.t('core:entrySizeNormal')}
            onClick={() => this.changeEntrySize('normal')}
          >
            <ListItemIcon>
              {this.state.entrySize === 'normal' ? <RadioCheckedIcon /> : <RadioUncheckedIcon />}
            </ListItemIcon>
            <ListItemText inset primary={i18n.t('core:entrySizeNormal')} />
          </MenuItem>
          <MenuItem
            data-tid="gridPerspectiveEntrySizeBig"
            title={i18n.t('core:entrySizeBig')}
            aria-label={i18n.t('core:entrySizeBig')}
            onClick={() => this.changeEntrySize('big')}
          >
            <ListItemIcon>
              {this.state.entrySize === 'big' ? <RadioCheckedIcon /> : <RadioUncheckedIcon />}
            </ListItemIcon>
            <ListItemText inset primary={i18n.t('core:entrySizeBig')} />
          </MenuItem>
          <Divider />
          <MenuItem
            data-tid="gridPerspectiveSingleClickOpenInternally"
            title={i18n.t('core:singleClickOpenInternally')}
            aria-label={i18n.t('core:singleClickOpenInternally')}
            onClick={() => this.changeSingleClickAction('openInternal')}
          >
            <ListItemIcon>
              {this.state.singleClickAction === 'openInternal' ? <RadioCheckedIcon /> : <RadioUncheckedIcon />}
            </ListItemIcon>
            <ListItemText inset primary={i18n.t('core:singleClickOpenInternally')} />
          </MenuItem>
          <MenuItem
            data-tid="gridPerspectiveSingleClickOpenExternally"
            title={i18n.t('core:singleClickOpenExternally')}
            aria-label={i18n.t('core:singleClickOpenExternally')}
            onClick={() => this.changeSingleClickAction('openExternal')}
          >
            <ListItemIcon>
              {this.state.singleClickAction === 'openExternal' ? <RadioCheckedIcon /> : <RadioUncheckedIcon />}
            </ListItemIcon>
            <ListItemText inset primary={i18n.t('core:singleClickOpenExternally')} />
          </MenuItem>
        </Menu>
      </div>
    );
  }
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators({
    moveFiles: IOActions.moveFiles,
    sortByCriteria: AppActions.sortByCriteria
  }, dispatch);
}

function mapStateToProps(state) {
  return {
    supportedFileTypes: getSupportedFileTypes(state),
    lastSelectedEntry: getLastSelectedEntry(state),
  };
}

export default connect(mapStateToProps, mapActionCreatorsToProps)(
  withStyles(styles)(GridPerspective)
);
