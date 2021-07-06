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
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Divider from '@material-ui/core/Divider';
import OpenFile from '@material-ui/icons/SubdirectoryArrowRight';
import OpenFileNatively from '@material-ui/icons/Launch';
import OpenParentFolder from '@material-ui/icons/FolderOpen';
import OpenFolderInternally from '@material-ui/icons/Folder';
import AddRemoveTags from '@material-ui/icons/Loyalty';
import MoveCopy from '@material-ui/icons/FileCopy';
import DuplicateFile from '@material-ui/icons/PostAdd';
import ImageIcon from '@material-ui/icons/Image';
import RenameFile from '@material-ui/icons/FormatTextdirectionLToR';
import DeleteForever from '@material-ui/icons/DeleteForever';
import i18n from '-/services/i18n';
import AppConfig from '-/config';
import PlatformIO from '-/services/platform-io';
import {
  generateFileName,
  getAllPropertiesPromise,
  setFolderThumbnailPromise
} from '-/services/utils-io';
import { Pro } from '-/pro';
import {
  extractContainingDirectoryPath,
  extractFileName,
  extractParentDirectoryPath,
  extractTags
} from '-/utils/paths';
import { TS } from '-/tagspaces.namespace';
import { formatDateTime4Tag } from '-/utils/misc';
// import AddIcon from '@material-ui/icons/Add';

interface Props {
  anchorEl: Element;
  mouseX?: number;
  mouseY?: number;
  open: boolean;
  onClose: () => void;
  openDeleteFileDialog: () => void;
  openRenameFileDialog: () => void;
  openMoveCopyFilesDialog: () => void;
  openAddRemoveTagsDialog: () => void;
  openFsEntry: (fsEntry: TS.FileSystemEntry) => void;
  loadDirectoryContent: (path: string) => void;
  openFileNatively: (path: string) => void;
  showInFileManager: (path: string) => void;
  showNotification: (
    text: string,
    notificationType?: string,
    autohide?: boolean
  ) => void;
  selectedFilePath?: string;
  isReadOnlyMode: boolean;
  selectedEntries: Array<any>;
}

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

  function setFolderThumbnail() {
    props.onClose();
    setFolderThumbnailPromise(props.selectedFilePath)
      .then(
        (directoryPath: string) => {
          props.showNotification('Thumbnail created for: ' + directoryPath);
          return true;
        }

        // getAllPropertiesPromise(directoryPath)
        //   .then((fsEntry: FileSystemEntry) => {
        //     props.openFsEntry(fsEntry);
        //     return true;
        //   })
        //   .catch(error =>
        //     console.warn(
        //       'Error getAllPropertiesPromise for: ' + directoryPath,
        //       error
        //     )
        //   )
      )
      .catch(error => {
        props.showNotification('Thumbnail creation failed.');
        console.warn(
          'Error setting Thumb for entry: ' + props.selectedFilePath,
          error
        );
        return true;
      });
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

  function duplicateFile() {
    props.onClose();
    if (props.selectedFilePath) {
      const dirPath = extractContainingDirectoryPath(
        props.selectedFilePath,
        PlatformIO.getDirSeparator()
      );

      const fileName = extractFileName(
        props.selectedFilePath,
        PlatformIO.getDirSeparator()
      );

      const extractedTags = extractTags(
        props.selectedFilePath,
        AppConfig.tagDelimiter,
        PlatformIO.getDirSeparator()
      );
      extractedTags.push('copy');
      extractedTags.push(formatDateTime4Tag(new Date(), true));

      const newFilePath =
        (dirPath ? dirPath + PlatformIO.getDirSeparator() : '') +
        generateFileName(fileName, extractedTags, AppConfig.tagDelimiter);

      PlatformIO.copyFilePromise(props.selectedFilePath, newFilePath)
        .then(() => {
          props.loadDirectoryContent(dirPath);
          return true;
        })
        .catch(error => {
          props.showNotification('Error creating duplicate: ' + error.message);
        });
    }
  }

  function openFileNatively() {
    props.onClose();
    if (props.selectedFilePath) {
      props.openFileNatively(props.selectedFilePath);
    }
  }

  function openParentFolderInternally() {
    props.onClose();
    if (props.selectedFilePath) {
      const parentFolder = extractParentDirectoryPath(
        props.selectedFilePath,
        PlatformIO.getDirSeparator()
      );
      props.loadDirectoryContent(parentFolder);
    }
  }

  function openFile() {
    props.onClose();
    if (props.selectedFilePath) {
      getAllPropertiesPromise(props.selectedFilePath)
        .then((fsEntry: TS.FileSystemEntry) => {
          props.openFsEntry(fsEntry);
          return true;
        })
        .catch(error =>
          console.warn(
            'Error getting properties for entry: ' +
              props.selectedFilePath +
              ' - ' +
              error
          )
        );
    }
  }
  const menuItems = [];

  if (props.selectedEntries.length < 2) {
    menuItems.push(
      <MenuItem
        key="fileMenuOpenFile"
        data-tid="fileMenuOpenFile"
        onClick={openFile}
      >
        <ListItemIcon>
          <OpenFile />
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:openFile')} />
      </MenuItem>
    );
    menuItems.push(
      <MenuItem
        key="fileMenuOpenParentFolderInternally"
        data-tid="fileMenuOpenParentFolderInternally"
        onClick={openParentFolderInternally}
      >
        <ListItemIcon>
          <OpenParentFolder />
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:openParentFolder')} />
      </MenuItem>
    );
  }
  if (
    !(PlatformIO.haveObjectStoreSupport() || AppConfig.isWeb) &&
    props.selectedEntries.length < 2
  ) {
    menuItems.push(
      <MenuItem
        key="fileMenuOpenFileNatively"
        data-tid="fileMenuOpenFileNatively"
        onClick={openFileNatively}
      >
        <ListItemIcon>
          <OpenFileNatively />
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:openFileNatively')} />
      </MenuItem>
    );
    menuItems.push(
      <MenuItem
        key="fileMenuOpenContainingFolder"
        data-tid="fileMenuOpenContainingFolder"
        onClick={showInFileManager}
      >
        <ListItemIcon>
          <OpenFolderInternally />
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:showInFileManager')} />
      </MenuItem>
    );
    menuItems.push(<Divider key="fmDivider" />);
  }

  if (!props.isReadOnlyMode) {
    menuItems.push(
      <MenuItem
        key="fileMenuAddRemoveTags"
        data-tid="fileMenuAddRemoveTags"
        onClick={showAddRemoveTagsDialog}
      >
        <ListItemIcon>
          <AddRemoveTags />
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:addRemoveTags')} />
      </MenuItem>
    );
    menuItems.push(
      <MenuItem
        key="fileMenuRenameFile"
        data-tid="fileMenuRenameFile"
        onClick={showRenameFileDialog}
      >
        <ListItemIcon>
          <RenameFile />
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:renameFile')} />
      </MenuItem>
    );
    menuItems.push(
      <MenuItem
        key="fileMenuDuplicateFile"
        data-tid="fileMenuDuplicateFileTID"
        onClick={duplicateFile}
      >
        <ListItemIcon>
          <DuplicateFile />
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:duplicateFile')} />
      </MenuItem>
    );
    menuItems.push(
      <MenuItem
        key="fileMenuMoveCopyFile"
        data-tid="fileMenuMoveCopyFile"
        onClick={showMoveCopyFilesDialog}
      >
        <ListItemIcon>
          <MoveCopy />
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:moveCopyFile')} />
      </MenuItem>
    );
    if (Pro && props.selectedEntries.length < 2) {
      menuItems.push(
        <MenuItem
          key="setAsThumbTID"
          data-tid="setAsThumbTID"
          onClick={setFolderThumbnail}
        >
          <ListItemIcon>
            <ImageIcon />
          </ListItemIcon>
          <ListItemText primary={i18n.t('core:setAsThumbnail')} />
        </MenuItem>
      );
    }
    menuItems.push(
      <MenuItem
        key="fileMenuDeleteFile"
        data-tid="fileMenuDeleteFile"
        onClick={showDeleteFileDialog}
      >
        <ListItemIcon>
          <DeleteForever />
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:deleteEntry')} />
      </MenuItem>
    );
  }

  return (
    <div style={{ overflowY: 'hidden' }}>
      <Menu
        anchorEl={props.anchorEl}
        anchorReference={
          props.mouseY && props.mouseX ? 'anchorPosition' : undefined
        }
        anchorPosition={
          props.mouseY && props.mouseX
            ? { top: props.mouseY, left: props.mouseX }
            : undefined
        }
        open={props.open}
        onClose={props.onClose}
      >
        {menuItems}
      </Menu>
    </div>
  );
};

export default FileMenu;
