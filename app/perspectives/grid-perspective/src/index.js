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
import removeMd from 'remove-markdown';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import moment from 'moment';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
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
  getTagTextColor,
  getTagColor,
  getSupportedFileTypes
} from '../../../reducers/settings';
import { extractTitle } from '../../../utils/paths';
import {
  formatFileSize,
  formatDateTime,
  isObj,
  isVisibleOnScreen
} from '../../../utils/misc';
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
import AppConfig from '../../../config';

const maxDescriptionPreviewLength = 90;

const styles = theme => ({
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
    // gridAutoRows: 'minmax(220px,auto)',
    gridGap: '5px 5px',
    backgroundColor: theme.palette.background.default,
    padding: 10,
    marginBottom: 100
  },
  rowContainer: {
    display: 'grid',
    gridTemplateColumns: 'auto',
    gridGap: '1px 1px',
    backgroundColor: theme.palette.background.default,
    padding: 0,
    paddingRight: 10,
    margin: 0,
    marginBottom: 100
  },
  gridCell: {
    backgroundColor: theme.palette.background.paper,
    margin: 2,
    marginBottom: 5,
    marginRight: 5,
    borderRadius: 5
  },
  rowCell: {
    backgroundColor: theme.palette.background.paper,
    margin: 0,
    marginBottom: 1,
    borderRadius: 0
  },
  selectedGridCell: {
    backgroundColor: theme.palette.primary.light,
    boxShadow: '0 0 1pt 1pt ' + theme.palette.primary.light
  },
  selectedRowCell: {
    backgroundColor: theme.palette.primary.light
  },
  gridCellThumb: {
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  },
  gridCellTitle: {
    padding: 5,
    minHeight: 20
  },
  gridCellTags: {
    padding: 0,
    paddingTop: 5,
    zIndex: 100,
    overflowY: 'overlay',
    overflowX: 'hidden',
    opacity: 0.6
  },
  gridCellDescription: {
    padding: 5,
    margin: 4,
    backgroundColor: theme.palette.background.paper,
    opacity: 0.6,
    borderRadius: 5
  },
  gridFileExtension: {
    flex: 1,
    padding: 5,
    // marginBottom: 5,
    marginRight: 5,
    // marginLeft: 5,
    // borderRadius: 3,
    maxWidth: 45,
    minHeight: 16,
    borderWidth: 1,
    color: 'white',
    // color: theme.palette.getContrastText(),
    textAlign: 'center'
  },
  rowFileExtension: {
    flex: 1,
    padding: 5,
    marginTop: 5,
    marginRight: 5,
    marginLeft: 5,
    borderRadius: 3,
    maxWidth: 45,
    minHeight: 15,
    borderWidth: 1,
    color: 'white',
    textTransform: 'uppercase',
    fontSize: 12,
    fontWeight: 'bold',
    // color: theme.palette.getContrastText(),
    textAlign: 'center'
  },
  gridSizeDate: {
    flex: 3,
    textAlign: 'right',
    whiteSpace: 'nowrap',
    marginRight: 5,
    paddingTop: 5
  },
  gridDetails: {
    display: 'flex',
    whiteSpace: 'nowrap'
  },
  rowFolder: {
    color: 'white',
    padding: 5,
    marginRight: 5,
    marginTop: 5,
    minHeight: 10,
    height: 20,
    borderRadius: 5
  },
  gridFolder: {
    color: 'white',
    padding: 5,
    // marginLeft: 5,
    marginRight: 5,
    // marginBottom: 5,
    minHeight: 10,
    height: 20
    // borderRadius: 5
  },
  topToolbar: {
    paddingLeft: 5,
    paddingRight: 5,
    minHeight: 40,
    height: 53,
    backgroundColor: theme.palette.background.default,
    borderBottom: '1px solid ' + theme.palette.divider,
    width: '100%'
  }
});

type Props = {
  classes: Object,
  currentDirectoryPath?: string,
  sortByCriteria: () => void,
  openFile: (path: string, isFile?: boolean) => void,
  openFileNatively: (path: string) => void,
  deleteFile: (path: string) => void,
  deleteDirectory: (path: string) => void,
  loadDirectoryContent: (path: string) => void,
  openDirectory: (path: string) => void,
  loadParentDirectoryContent: () => void,
  setLastSelectedEntry: (entryPath: string | null) => void,
  addTags: () => void,
  removeTags: () => void,
  removeAllTags: () => void,
  editTagForEntry: () => void,
  perspectiveCommand: Object,
  directoryContent: Array<FileSystemEntry>
};

type State = {
  selectedItem?: Object,
  fileContextMenuAnchorEl?: Object | null,
  fileContextMenuOpened?: boolean,
  dirContextMenuAnchorEl?: Object | null,
  dirContextMenuOpened?: boolean,
  tagContextMenuAnchorEl?: Object | null,
  tagContextMenuOpened?: boolean,
  layoutType?: string,
  sortingContextMenuAnchorEl?: Object | null,
  sortingContextMenuOpened?: boolean | null,
  orderBy?: null | boolean,
  orderByDate?: null | boolean,
  orderByExt?: null | boolean,
  orderByName?: null | boolean,
  orderBySize?: null | boolean,
  orderByTags?: null | boolean,
  fileOperationsEnabled?: boolean,
  allFilesSelected?: boolean,
  showDirectories?: boolean,
  isDeleteMultipleFilesDialogOpened?: boolean,
  isMoveCopyFilesDialogOpened?: boolean,
  isAddRemoveTagsDialogOpened?: boolean,
  isFileRenameDialogOpened?: boolean,
  selectedEntryPath?: string,
  selectedTag?: Tag | null,
  selectedEntries?: Array
};

class GridPerspective extends React.Component<Props, State> {
  state = {
    selectedItem: {},
    fileContextMenuOpened: false,
    fileContextMenuAnchorEl: null,
    dirContextMenuOpened: false,
    dirContextMenuAnchorEl: null,
    tagContextMenuOpened: false,
    tagContextMenuAnchorEl: null,
    sortingContextMenuOpened: false,
    sortingContextMenuAnchorEl: null,
    selectedEntryPath: '',
    orderBy: false,
    orderByName: true,
    orderBySize: null,
    orderByDate: null,
    orderByTags: null,
    orderByExt: null,
    layoutType: 'grid',
    fileOperationsEnabled: false,
    allFilesSelected: false,
    showDirectories: true,
    isDeleteMultipleFilesDialogOpened: false,
    isMoveCopyFilesDialogOpened: false,
    isAddRemoveTagsDialogOpened: false,
    isFileRenameDialogOpened: false,
    selectedTag: null,
    selectedEntries: []
  };

  componentDidMount() {
    const settings = this.loadSettings();
    if (settings) {
      this.setState({
        showDirectories: settings.showDirectories,
        layoutType: settings.layoutType ? settings.layoutType : 'grid'
        // orderBy: settings.orderBy ? settings.orderBy : '',
      });
    }
  }

  componentWillReceiveProps = (nextProps: Props) => {
    const cmd = nextProps.perspectiveCommand;
    const { directoryContent } = nextProps;
    if (
      cmd &&
      cmd.key &&
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

    // Directory changed
    if (
      nextProps.currentDirectoryPath !== this.props.currentDirectoryPath &&
      this.mainGrid
    ) {
      const grid = document.querySelector(
        '[data-tid="perspectiveGridFileTable"]'
      );
      const firstGridItem = grid.querySelector('div');

      if (isObj(firstGridItem)) {
        firstGridItem.scrollIntoView({ top: 0 });
      }

      // Clear selection on directory change
      this.clearSelection();
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

  loadSettings = () => {
    const extSettings = JSON.parse(localStorage.getItem('tsPerspectiveGrid'));
    return extSettings;
  };

  saveSettings() {
    const settings = {
      showDirectories: this.state.showDirectories,
      layoutType: this.state.layoutType,
      orderBy: this.state.orderBy
    };
    localStorage.setItem('tsPerspectiveGrid', JSON.stringify(settings));
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
    this.handleSortMenuIconClick(sortBy, this.state.orderBy);
    this.setState({ orderBy: !this.state.orderBy });
    this.props.sortByCriteria(sortBy, this.state.orderBy);
  };

  handleSortingMenu = event => {
    this.setState({
      sortingContextMenuOpened: !this.state.sortingContextMenuOpened,
      sortingContextMenuAnchorEl: event ? event.currentTarget : null
    });
  };

  handleSortMenuIconClick = sort => {
    switch (sort) {
      case 'byName':
        if (this.state.orderByName === null) {
          this.setState({
            orderBySize: null,
            orderByTags: null,
            orderByExt: null,
            orderByDate: null,
            orderByName: true
          });
        } else {
          this.setState({
            orderBySize: null,
            orderByTags: null,
            orderByExt: null,
            orderByDate: null,
            orderByName: false
          });
        }
        break;
      case 'byFileSize':
        if (this.state.orderBySize === null) {
          this.setState({
            orderByName: null,
            orderByTags: null,
            orderByExt: null,
            orderByDate: null,
            orderBySize: true
          });
        } else {
          this.setState({
            orderByName: null,
            orderByTags: null,
            orderByExt: null,
            orderByDate: null,
            orderBySize: false
          });
        }
        break;
      case 'byTags':
        if (this.state.orderByTags === null) {
          this.setState({
            orderByName: null,
            orderBySize: null,
            orderByExt: null,
            orderByDate: null,
            orderByTags: true
          });
        } else {
          this.setState({
            orderByName: null,
            orderBySize: null,
            orderByExt: null,
            orderByDate: null,
            orderByTags: false
          });
        }
        break;
      case 'byExtension':
        if (this.state.orderByExt === null) {
          this.setState({
            orderByName: null,
            orderBySize: null,
            orderByTags: null,
            orderByDate: null,
            orderByExt: true
          });
        } else {
          this.setState({
            orderByName: null,
            orderBySize: null,
            orderByTags: null,
            orderByDate: null,
            orderByExt: false
          });
        }
        break;
      case 'byDateModified':
        if (this.state.orderByDate === null) {
          this.setState({
            orderByName: null,
            orderBySize: null,
            orderByTags: null,
            orderByExt: null,
            orderByDate: true
          });
        } else {
          this.setState({
            orderByName: null,
            orderBySize: null,
            orderByTags: null,
            orderByExt: null,
            orderByDate: false
          });
        }
        break;
      default:
        break;
    }
  };

  getLayoutClass = () => {
    switch (this.state.layoutType) {
      case 'grid':
        return this.props.classes.gridContainer;
      case 'row':
        return this.props.classes.rowContainer;
      default:
        return this.props.classes.gridContainer;
    }
  };

  handleGridCellClick = (event, fsEntry: FileSystemEntry) => {
    const { selectedEntries } = this.state;
    if (event.ctrlKey) {
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
    } else {
      this.setState(
        {
          selectedEntries: [fsEntry]
        },
        this.computeFileOperationsEnabled
      );
      this.props.setLastSelectedEntry(fsEntry.path);
      if (fsEntry.isFile) {
        this.props.openFile(fsEntry.path, fsEntry.isFile);
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
    this.setState(
      {
        showDirectories: !this.state.showDirectories
      },
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
          : [fsEntry],
        selectedItem: fsEntry
      });
    } else {
      this.setState({
        dirContextMenuOpened: true,
        dirContextMenuAnchorEl: event.currentTarget,
        selectedEntryPath: fsEntry.path,
        selectedEntries: [fsEntry],
        selectedItem: fsEntry
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

  handleCloseDialogs = () => {
    this.setState({
      isFileRenameDialogOpened: false,
      isDeleteMultipleFilesDialogOpened: false,
      isAddRemoveTagsDialogOpened: false,
      isMoveCopyFilesDialogOpened: false
    });
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

  renderSortMenuIcon = order => {
    if (order === null) {
      return <div>{null}</div>;
    } else if (order) {
      return <ArrowUpIcon />;
    }
    return <ArrowDownIcon />;
  };

  renderCell = (fsEntry: FileSystemEntry) => {
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
    //  key={fsEntry.uuid}
    return (
      <TagDropContainer entryPath={fsEntry.path}>
        <Paper
          data-entry-id={fsEntry.uuid}
          className={classNames(
            layoutType === 'grid' && classes.gridCell,
            layoutType === 'row' && classes.rowCell,
            selected && layoutType === 'grid' && classes.selectedGridCell,
            selected && layoutType === 'row' && classes.selectedRowCell
          )}
          onContextMenu={event => this.handleGridContextMenu(event, fsEntry)}
          onDoubleClick={event => this.handleGridCellDblClick(event, fsEntry)}
          onClick={event => this.handleGridCellClick(event, fsEntry)}
        >
          {this.renderCellContent(fsEntry)}
        </Paper>
      </TagDropContainer>
    );
  };

  renderTag = (tag: Object, fsEntry) => {
    return (
      <TagContainer
        defaultTextColor={this.props.tagTextColor}
        defaultBackgroundColor={this.props.tagBackgroundColor}
        tag={tag}
        entryPath={fsEntry.path}
        handleTagMenu={this.handleTagMenu}
      />
    );
  };

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
              backgroundImage: thumbPathUrl,
              height: 150 // fsEntry.isFile ? 150 : 70
            }}
          >
            <div className={classes.gridCellTags}>
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
              noWrap
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
                {fsEntry.lmdt && '️ ' + moment(fsEntry.lmdt).fromNow() /* ⏲ */}
              </span>
              <span title={i18n.t('core:entryDescription')}>
                {description && ' - ' + description}
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
    const selectedFilePaths = this.state.selectedEntries
      .filter(fsEntry => fsEntry.isFile)
      .map(fsentry => fsentry.path);

    return (
      <div style={{ height: '100%' }}>
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
            disabled={!this.state.fileOperationsEnabled}
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
            title={i18n.t('core:showHideDirectories')}
            aria-label={i18n.t('core:showHideDirectories')}
            data-tid="gridPerspectiveToggleShowDirectories"
            onClick={this.toggleShowDirectories}
          >
            {this.state.showDirectories ? <FolderIcon /> : <FolderHiddenIcon />}
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
        </Toolbar>
        <div style={{ height: '100%', overflowY: 'overlay' }}>
          <div
            className={this.getLayoutClass()}
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
          selectedItem={this.state.selectedItem}
          open={this.state.isAddRemoveTagsDialogOpened}
          onClose={this.handleCloseDialogs}
          selectedEntries={this.props.selectedEntries}
          selectedItems={[this.state.selectedEntryPath]}
          addTags={this.props.addTags}
          removeTags={this.props.removeTags}
          removeAllTags={this.props.removeAllTags}
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
            onClick={() => {
              this.handleSortBy('byName');
            }}
          >
            <ListItemIcon>
              {this.renderSortMenuIcon(this.state.orderByName)}
            </ListItemIcon>
            <ListItemText inset primary={i18n.t('core:fileTitle')} />
          </MenuItem>
          <MenuItem
            data-tid="gridPerspectiveSortBySize"
            onClick={() => {
              this.handleSortBy('byFileSize');
            }}
          >
            <ListItemIcon>
              {this.renderSortMenuIcon(this.state.orderBySize)}
            </ListItemIcon>
            <ListItemText inset primary={i18n.t('core:fileSize')} />
          </MenuItem>
          <MenuItem
            data-tid="gridPerspectiveSortByDate"
            onClick={() => {
              this.handleSortBy('byDateModified');
            }}
          >
            <ListItemIcon>
              {this.renderSortMenuIcon(this.state.orderByDate)}
            </ListItemIcon>
            <ListItemText inset primary={i18n.t('core:fileLDTM')} />
          </MenuItem>
          <MenuItem
            data-tid="gridPerspectiveSortByExt"
            onClick={() => {
              this.handleSortBy('byExtension');
            }}
          >
            <ListItemIcon>
              {this.renderSortMenuIcon(this.state.orderByExt)}
            </ListItemIcon>
            <ListItemText inset primary={i18n.t('core:fileExtension')} />
          </MenuItem>
          {/* <MenuItem
              data-tid="gridPerspectiveSortByTags"
              onClick={() => {
                this.handleSortBy('byTags');
              }}
            >
              <ListItemIcon>
                {this.renderSortMenuIcon(this.state.orderByTags)}
              </ListItemIcon>
              <ListItemText inset primary={i18n.t('core:fileTags')} />
            </MenuItem> */}
        </Menu>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    tagTextColor: getTagTextColor(state),
    tagBackgroundColor: getTagColor(state),
    supportedFileTypes: getSupportedFileTypes(state)
  };
}

export default connect(mapStateToProps)(
  withStyles(styles)(GridPerspective)
);
