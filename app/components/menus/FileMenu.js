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
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Divider from '@material-ui/core/Divider';
import OpenFile from '@material-ui/icons/SubdirectoryArrowLeft';
import OpenFileNatively from '@material-ui/icons/Launch';
import OpenContainingFolder from '@material-ui/icons/FolderOpen';
import AddRemoveTags from '@material-ui/icons/Loyalty';
import MoveCopy from '@material-ui/icons/FileCopy';
import RenameFile from '@material-ui/icons/FormatTextdirectionLToR';
import DeleteForever from '@material-ui/icons/DeleteForever';
import i18n from '../../services/i18n';
import { extractContainingDirectoryPath } from '../../utils/paths';

type Props = {
  anchorEl?: Object | null,
  open?: boolean,
  onClose: () => void,
  openDeleteFileDialog: () => void,
  openRenameFileDialog: () => void,
  openMoveCopyFilesDialog: () => void,
  openAddRemoveTagsDialog: () => void,
  openFile: (path: string) => void,
  openFileNatively: (path: string) => void,
  showInFileManager: (path: string) => void,
  selectedFilePath?: string
};

class FileMenu extends React.Component<Props> {
  showDeleteFileDialog = () => {
    this.props.onClose();
    this.props.openDeleteFileDialog();
  };

  showRenameFileDialog = () => {
    this.props.onClose();
    this.props.openRenameFileDialog();
  };

  showMoveCopyFilesDialog = () => {
    this.props.onClose();
    this.props.openMoveCopyFilesDialog();
  };

  showAddRemoveTagsDialog = () => {
    this.props.onClose();
    this.props.openAddRemoveTagsDialog();
  };

  showInFileManager = () => {
    this.props.onClose();
    if (this.props.selectedFilePath) {
      this.props.showInFileManager(this.props.selectedFilePath);
    }
  };

  openFileNatively = () => {
    this.props.onClose();
    if (this.props.selectedFilePath) {
      this.props.openFileNatively(this.props.selectedFilePath);
    }
  };

  openFile = () => {
    this.props.onClose();
    if (this.props.selectedFilePath) {
      this.props.openFile(this.props.selectedFilePath);
    }
  };

  render() {
    return (
      <div style={{ overflowY: 'hidden !important' }}>
        <Menu
          anchorEl={this.props.anchorEl}
          open={this.props.open}
          onClose={this.props.onClose}
        >
          <MenuItem
            data-tid="fileMenuOpenFile"
            onClick={this.openFile}
          >
            <ListItemIcon>
              <OpenFile />
            </ListItemIcon>
            <ListItemText inset primary={i18n.t('core:openFile')} />
          </MenuItem>
          <MenuItem
            data-tid="fileMenuRenameFile"
            onClick={this.showRenameFileDialog}
          >
            <ListItemIcon>
              <RenameFile />
            </ListItemIcon>
            <ListItemText inset primary={i18n.t('core:renameFile')} />
          </MenuItem>
          <MenuItem
            data-tid="fileMenuOpenFileNatively"
            onClick={this.openFileNatively}
          >
            <ListItemIcon>
              <OpenFileNatively />
            </ListItemIcon>
            <ListItemText inset primary={i18n.t('core:openFileNatively')} />
          </MenuItem>
          <MenuItem
            data-tid="fileMenuOpenContainingFolder"
            onClick={this.showInFileManager}
          >
            <ListItemIcon>
              <OpenContainingFolder />
            </ListItemIcon>
            <ListItemText inset primary={i18n.t('core:showInFileManager')} />
          </MenuItem>
          <Divider />
          <MenuItem
            data-tid="fileMenuAddRemoveTags"
            onClick={this.showAddRemoveTagsDialog}
          >
            <ListItemIcon>
              <AddRemoveTags />
            </ListItemIcon>
            <ListItemText inset primary={i18n.t('core:addRemoveTags')} />
          </MenuItem>
          <MenuItem
            data-tid="fileMenuMoveCopyFile"
            onClick={this.showMoveCopyFilesDialog}
          >
            <ListItemIcon>
              <MoveCopy />
            </ListItemIcon>
            <ListItemText inset primary={i18n.t('core:moveCopyFile')} />
          </MenuItem>
          <MenuItem data-tid="fileMenuDeleteFile" onClick={this.showDeleteFileDialog}>
            <ListItemIcon>
              <DeleteForever />
            </ListItemIcon>
            <ListItemText inset primary={i18n.t('core:deleteEntry')} />
          </MenuItem>
        </Menu>
      </div>
    );
  }
}

export default FileMenu;
