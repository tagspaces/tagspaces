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
import ShareIcon from '@material-ui/icons/Link';
import RenameFile from '@material-ui/icons/FormatTextdirectionLToR';
import DeleteForever from '@material-ui/icons/DeleteForever';
import { formatDateTime4Tag } from '@tagspaces/tagspaces-platforms/misc';
import AppConfig from '@tagspaces/tagspaces-platforms/AppConfig';
import {
  extractContainingDirectoryPath,
  extractFileName,
  extractParentDirectoryPath,
  extractTags,
  generateSharingLink
} from '@tagspaces/tagspaces-platforms/paths';
import i18n from '-/services/i18n';
import PlatformIO from '-/services/platform-facade';
import {
  generateFileName,
  getAllPropertiesPromise,
  setFolderThumbnailPromise
} from '-/services/utils-io';
import { Pro } from '-/pro';
import { TS } from '-/tagspaces.namespace';
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
  loadDirectoryContent: (
    path: string,
    generateThumbnails: boolean,
    loadDirMeta?: boolean
  ) => void;
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
  currentLocation: TS.Location;
  locations: Array<TS.Location>;
}

function FileMenu(props: Props) {
  const {
    selectedEntries,
    isReadOnlyMode,
    currentLocation,
    onClose,
    selectedFilePath,
    showNotification,
    locations
  } = props;

  function copySharingLink() {
    onClose();
    if (selectedEntries.length === 1) {
      const entryFromIndex = selectedEntries[0].locationID;
      const locationID = entryFromIndex
        ? selectedEntries[0].locationID
        : currentLocation.uuid;
      let relativePath = selectedEntries[0].path;
      const tmpLoc = locations.find(location => location.uuid === locationID);
      const locationPath = tmpLoc.path;
      if (
        locationPath &&
        relativePath &&
        relativePath.startsWith(locationPath)
      ) {
        // remove location path from entry path if possible
        relativePath = relativePath.substr(locationPath.length);
      }
      const sharingLink = generateSharingLink(locationID, relativePath);
      navigator.clipboard
        .writeText(sharingLink)
        .then(() => {
          showNotification(i18n.t('core:sharingLinkCopied'));
          return true;
        })
        .catch(() => {
          showNotification(i18n.t('core:sharingLinkFailed'));
        });
    }
  }

  function showDeleteFileDialog() {
    onClose();
    props.openDeleteFileDialog();
  }

  function showRenameFileDialog() {
    onClose();
    props.openRenameFileDialog();
  }

  function showMoveCopyFilesDialog() {
    onClose();
    props.openMoveCopyFilesDialog();
  }

  function setFolderThumbnail() {
    onClose();
    setFolderThumbnailPromise(props.selectedFilePath)
      .then((directoryPath: string) => {
        showNotification('Thumbnail created for: ' + directoryPath);
        return true;
      })
      .catch(error => {
        showNotification('Thumbnail creation failed.');
        console.warn(
          'Error setting Thumb for entry: ' + props.selectedFilePath,
          error
        );
        return true;
      });
  }

  function showAddRemoveTagsDialog() {
    onClose();
    props.openAddRemoveTagsDialog();
  }

  function showInFileManager() {
    onClose();
    if (props.selectedFilePath) {
      props.showInFileManager(props.selectedFilePath);
    }
  }

  function duplicateFile() {
    onClose();
    if (selectedFilePath) {
      const dirPath = extractContainingDirectoryPath(
        selectedFilePath,
        PlatformIO.getDirSeparator()
      );

      const fileName = extractFileName(
        selectedFilePath,
        PlatformIO.getDirSeparator()
      );

      const extractedTags = extractTags(
        selectedFilePath,
        AppConfig.tagDelimiter,
        PlatformIO.getDirSeparator()
      );
      extractedTags.push('copy');
      extractedTags.push(formatDateTime4Tag(new Date(), true));

      const newFilePath =
        (dirPath ? dirPath + PlatformIO.getDirSeparator() : '') +
        generateFileName(fileName, extractedTags, AppConfig.tagDelimiter);

      PlatformIO.copyFilePromise(selectedFilePath, newFilePath)
        .then(() => {
          props.loadDirectoryContent(dirPath, true);
          return true;
        })
        .catch(error => {
          showNotification('Error creating duplicate: ' + error.message);
        });
    }
  }

  function openFileNatively() {
    onClose();
    if (props.selectedFilePath) {
      props.openFileNatively(props.selectedFilePath);
    }
  }

  function openParentFolderInternally() {
    onClose();
    if (selectedFilePath) {
      const parentFolder = extractParentDirectoryPath(
        selectedFilePath,
        PlatformIO.getDirSeparator()
      );
      props.loadDirectoryContent(parentFolder, false);
    }
  }

  function openFile() {
    onClose();
    if (selectedFilePath) {
      getAllPropertiesPromise(selectedFilePath)
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

  if (selectedEntries.length < 2) {
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
    !(PlatformIO.haveObjectStoreSupport() || PlatformIO.haveWebDavSupport() || AppConfig.isWeb) &&
    selectedEntries.length < 2
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

  if (!isReadOnlyMode) {
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
    if (Pro && selectedEntries.length < 2) {
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

  if (selectedEntries.length === 1) {
    menuItems.push(
      <MenuItem
        key="copySharingLink"
        data-tid="copyFileSharingLink"
        onClick={copySharingLink}
      >
        <ListItemIcon>
          <ShareIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:copySharingLink')} />
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
}

export default FileMenu;
