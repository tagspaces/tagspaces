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

// export { default as FileManagerPerspective } from './rc-table';
import React from 'react';
import Table from 'rc-table';
import Checkbox from '@material-ui/core/Checkbox';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import { formatDateTime, formatFileSize } from '../../utils/misc';
import TagContainer from '../../components/TagContainer';
import FileMenu from '../../components/menus/FileMenu';
import { type FileSystemEntry } from '../../services/utils-io';
import { type Tag } from '../../reducers/taglibrary';
// import 'rc-table/assets/index.css';

type Props = {
  classes: Object,
  openFile: (path: string) => void,
  openFileNatively: (path: string) => void,
  deleteFile: (path: string) => void,
  renameFile: (path: string) => void,
  showInFileManager: (path: string) => void,
  loadDirectoryContent: (path: string) => void,
  directoryContent: Array<FileSystemEntry>
};

type State = {};

class FileManagerPerspective extends React.Component<Props, State> {
  state = {
    fileContextMenuOpened: false,
    fileContextMenuAnchorEl: null,
    selected: [],
    orderBy: '',
    data: [],
    order: '',
    checked: [0],
    itemPath: '',
    extension: this.props.directoryContent.map((item) => item.extension)
  };

  /*
   <Button
   data-tid="extension"
   title={this.state.extension}
   onClick={(e) => this.handleExtensionButton(e, this.state.itemPath)}
   >
   {this.state.extension}
   </Button>
   */

  handleRequestSort = (sortBy) => {
    this.setState({ orderBy: !this.state.orderBy });
    this.props.sortByCriteria(sortBy, this.state.orderBy);
  };

  handleSelectAllClick = (event, checked) => {
    if (checked) {
      this.setState({ selected: this.state.data.map(n => n.id) });
      return;
    }
    this.setState({ selected: [] });
  };

  handleClick = (event, id) => {
    const { selected } = this.state;
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    this.setState({ selected: newSelected });
  };

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
  };

  isSelected = id => this.state.selected.indexOf(id) !== -1;

  renderExtColumnAction = () => (
    <div>
      <Checkbox
        checked={this.state.checkBox}
        onChange={(event, checked) => this.setState({ checkBox: checked })}
        tabIndex={-1}
        disableRipple
      />
    </div>
  );

  renderExtHeadTableAction = () => (
    <div>
      <Tooltip
        title="Sort"
      >
        <Button
          title="Ext"
          onClick={this.handleRequestSort('ext', !this.state.order)}
        >
          <ArrowUpward style={{ width: 16, height: 16 }} />
        </Button>
      </Tooltip>
    </div>
  );


  renderNameColumnAction = (name) => (<span>{ name }</span>);

  renderIsFileColumnAction = (isFile) => {
    if (isFile) {
      return (<span>File</span>);
    }
    return (<span>Folder</span>);
  };

  renderTagColumnAction = (tags: Array<Tag>) =>
    // TODO color should come from this.props.settings.tagBackgroundColor
    tags.map((tag, index) => (
      <TagContainer
        key={index}
        defaultTextColor={'white'}
        defaultBackgroundColor={'green'}
        tag={tag}
        index={index}
      />
    ))
    ;

  renderLastModifiedColumnAction = (lmdt) => (<span>{ formatDateTime(lmdt, true) }</span>);

  renderSizeColumnAction = (size) => (<span>{ formatFileSize(size) }</span>);

  handleCellClick = (record, index) => ({
    onContextMenu: (e) => {
      this.handleFileContextMenu(e, record.path);
    },
    onClick: () => {
      this.setState({ checkBox: true });
    },
    onDoubleClick: (e) => {
      this.onRowClick(record, index, e);
    }
  });
  // <a
  // title="Ext"
  // onClick={e => this.handleRequestSort(e, 'ext', !this.state.order)}
  // >
  columns = [
    {
      title: this.renderExtHeadTableAction,
      dataIndex: 'ext',
      key: 'ext',
      width: '30%',
      render: this.renderExtColumnAction,
      onCell: this.handleCellClick
    },
    {
      title: (
        <div> Name
          <Tooltip
            title="Sort"
          >
            <ArrowUpward style={{ width: 16, height: 16 }} />
          </Tooltip>
        </div>
      ),
      dataIndex: 'name',
      key: 'name',
      width: '80%',
      render: this.renderNameColumnAction,
      onCell: this.handleCellClick
    },
    {
      title: (
        <div> Is File
          <Tooltip
            title="Sort"
          >
            <ArrowDownward style={{ width: 16, height: 16 }} />
          </Tooltip>
        </div>
      ),
      dataIndex: 'isFile',
      key: 'isFile',
      render: this.renderIsFileColumnAction,
      onCell: this.handleCellClick
    },
    {
      title: (
        <div> Tags
          <Tooltip
            title="Sort"
          >
            <ArrowDownward style={{ width: 16, height: 16 }} />
          </Tooltip>
        </div>
      ),
      dataIndex: 'tags',
      key: 'tags',
      render: this.renderTagColumnAction,
      onCell: this.handleCellClick
    },
    {
      title: (
        <div> Size
          <Tooltip
            title="Sort"
          >
            <ArrowDownward style={{ width: 16, height: 16 }} />
          </Tooltip>
        </div>
      ),
      dataIndex: 'size',
      key: 'size',
      render: this.renderSizeColumnAction,
      onCell: this.handleCellClick
    },
    {
      title: (
        <div> Last Modified
          <Tooltip
            title="Sort"
          >
            <ArrowDownward style={{ width: 16, height: 16 }} />
          </Tooltip>
        </div>
      ),
      dataIndex: 'lmdt',
      key: 'lmdt',
      render: this.renderLastModifiedColumnAction,
      onCell: this.handleCellClick
    }
  ];

  handleToggle = value => (e) => {
    e.preventDefault();
    const { checked } = this.state;
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    this.setState({
      checked: newChecked
    });
  };

  onRowClick = (record, index, event) => {
    this.setState({ itemPath: record.path });
    event.preventDefault();
    // console.log(`Click nth(${index}) row of parent, record.name: ${record.path}`);
    // See https://facebook.github.io/react/docs/events.html for original click event details.
    if (event.shiftKey) {
      console.log('Shift + mouse click triggered.');
    }
    if (record.isFile) {
      this.props.openFile(record.path);
    } else {
      this.props.loadDirectoryContent(record.path);
    }
  };

  handleFileContextMenu = (event, directoryPath) => {
    this.setState({
      fileContextMenuOpened: true,
      fileContextMenuAnchorEl: event.currentTarget,
      selectedFilePath: directoryPath
    });
  };

  toggleFileMenuClose = (event) => {
    this.setState({
      fileContextMenuOpened: !this.state.fileContextMenuOpened,
      fileContextMenuAnchorEl: event ? event.currentTarget : null
    });
  };

  handleRequestCloseContextMenus = () => {
    this.setState({
      fileContextMenuOpened: false,
      fileContextMenuAnchorEl: null
    });
  };

  render() {
    console.log('File Manager: ', this.props);
    const classes = this.props.classes;

    // numSelected={selected.length}
    // order={order}
    // orderBy={orderBy}
    // onSelectAllClick={this.handleSelectAllClick}
    // onRequestSort={this.handleRequestSort}

    return (
      <div>
        <Table
          rowKey="uuid"
          data={this.props.directoryContent}
          columns={this.columns}
        />
        <FileMenu
          classes={classes}
          open={this.state.fileContextMenuOpened}
          onClose={this.toggleFileMenuClose}
          anchorEl={this.state.fileContextMenuAnchorEl}
          openFileNatively={this.props.openFileNatively}
          openFile={this.props.openFile}
          deleteFile={this.props.deleteFile}
          renameFile={this.props.renameFile}
          copyFiles={this.props.copyFiles}
          moveFiles={this.props.moveFiles}
          showInFileManager={this.props.showInFileManager}
          addRemoveTags={this.props.addRemoveTags}
          selectedFilePath={this.state.selectedFilePath}
          allTags={this.props.allTags}
        />
      </div>
    );
  }
}

export default FileManagerPerspective;
