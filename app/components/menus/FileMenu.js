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

const FileMenu = (props: Props) => {
  function showDeleteFileDialog() {
    props.onClose();
    props.openDeleteFileDialog();
  }

  function showRenameFileDialog() {
    props.onClose();
    props.openRenameFileDialog();
  }

  function showMoveCopyFilesDialog() {
    props.onClose();
    props.openMoveCopyFilesDialog();
  }

  function showAddRemoveTagsDialog() {
    props.onClose();
    props.openAddRemoveTagsDialog();
  }

  function showInFileManager() {
    props.onClose();
    if (props.selectedFilePath) {
      props.showInFileManager(props.selectedFilePath);
    }
  }

  function openFileNatively() {
    props.onClose();
    if (props.selectedFilePath) {
      props.openFileNatively(props.selectedFilePath);
    }
  }

  function openFile() {
    props.onClose();
    if (props.selectedFilePath) {
      props.openFile(props.selectedFilePath);
    }
  }

  return (
    <div style={{ overflowY: 'hidden !important' }}>
      <Menu
        anchorEl={props.anchorEl}
        open={props.open}
        onClose={props.onClose}
      >
        <MenuItem
          data-tid="fileMenuOpenFile"
          onClick={openFile}
        >
          <ListItemIcon>
            <OpenFile />
          </ListItemIcon>
          <ListItemText inset primary={i18n.t('core:openFile')} />
        </MenuItem>
        <MenuItem
          data-tid="fileMenuRenameFile"
          onClick={showRenameFileDialog}
        >
          <ListItemIcon>
            <RenameFile />
          </ListItemIcon>
          <ListItemText inset primary={i18n.t('core:renameFile')} />
        </MenuItem>
        <MenuItem
          data-tid="fileMenuOpenFileNatively"
          onClick={openFileNatively}
        >
          <ListItemIcon>
            <OpenFileNatively />
          </ListItemIcon>
          <ListItemText inset primary={i18n.t('core:openFileNatively')} />
        </MenuItem>
        <MenuItem
          data-tid="fileMenuOpenContainingFolder"
          onClick={showInFileManager}
        >
          <ListItemIcon>
            <OpenContainingFolder />
          </ListItemIcon>
          <ListItemText inset primary={i18n.t('core:showInFileManager')} />
        </MenuItem>
        <Divider />
        <MenuItem
          data-tid="fileMenuAddRemoveTags"
          onClick={showAddRemoveTagsDialog}
        >
          <ListItemIcon>
            <AddRemoveTags />
          </ListItemIcon>
          <ListItemText inset primary={i18n.t('core:addRemoveTags')} />
        </MenuItem>
        <MenuItem
          data-tid="fileMenuMoveCopyFile"
          onClick={showMoveCopyFilesDialog}
        >
          <ListItemIcon>
            <MoveCopy />
          </ListItemIcon>
          <ListItemText inset primary={i18n.t('core:moveCopyFile')} />
        </MenuItem>
        <MenuItem data-tid="fileMenuDeleteFile" onClick={showDeleteFileDialog}>
          <ListItemIcon>
            <DeleteForever />
          </ListItemIcon>
          <ListItemText inset primary={i18n.t('core:deleteEntry')} />
        </MenuItem>
      </Menu>
    </div>
  );
};

export default FileMenu;
