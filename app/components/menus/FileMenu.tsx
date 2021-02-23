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
import OpenContainingFolder from '@material-ui/icons/FolderOpen';
import AddRemoveTags from '@material-ui/icons/Loyalty';
import MoveCopy from '@material-ui/icons/FileCopy';
import ImageIcon from '@material-ui/icons/Image';
import RenameFile from '@material-ui/icons/FormatTextdirectionLToR';
import DeleteForever from '@material-ui/icons/DeleteForever';
import i18n from '-/services/i18n';
import AppConfig from '-/config';
import PlatformIO from '-/services/platform-io';
import {
  FileSystemEntry,
  getAllPropertiesPromise,
  setFolderThumbnailPromise
} from '-/services/utils-io';
import { Pro } from '-/pro';

interface Props {
  anchorEl: Element;
  open: boolean;
  onClose: () => void;
  openDeleteFileDialog: () => void;
  openRenameFileDialog: () => void;
  openMoveCopyFilesDialog: () => void;
  openAddRemoveTagsDialog: () => void;
  openFsEntry: (fsEntry: FileSystemEntry) => void;
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

  function openFileNatively() {
    props.onClose();
    if (props.selectedFilePath) {
      props.openFileNatively(props.selectedFilePath);
    }
  }

  function openFile() {
    props.onClose();
    if (props.selectedFilePath) {
      getAllPropertiesPromise(props.selectedFilePath)
        .then((fsEntry: FileSystemEntry) => {
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

  return (
    <div style={{ overflowY: 'hidden' }}>
      <Menu anchorEl={props.anchorEl} open={props.open} onClose={props.onClose}>
        {props.selectedEntries.length === 1 && (
          <MenuItem data-tid="fileMenuOpenFile" onClick={openFile}>
            <ListItemIcon>
              <OpenFile />
            </ListItemIcon>
            <ListItemText primary={i18n.t('core:openFile')} />
          </MenuItem>
        )}
        {!(PlatformIO.haveObjectStoreSupport() || AppConfig.isWeb) &&
          props.selectedEntries.length === 1 && (
            <>
              <MenuItem
                data-tid="fileMenuOpenFileNatively"
                onClick={openFileNatively}
              >
                <ListItemIcon>
                  <OpenFileNatively />
                </ListItemIcon>
                <ListItemText primary={i18n.t('core:openFileNatively')} />
              </MenuItem>
              <MenuItem
                data-tid="fileMenuOpenContainingFolder"
                onClick={showInFileManager}
              >
                <ListItemIcon>
                  <OpenContainingFolder />
                </ListItemIcon>
                <ListItemText primary={i18n.t('core:showInFileManager')} />
              </MenuItem>
              <Divider />
            </>
          )}
        {!props.isReadOnlyMode && (
          <>
            <MenuItem
              data-tid="fileMenuAddRemoveTags"
              onClick={showAddRemoveTagsDialog}
            >
              <ListItemIcon>
                <AddRemoveTags />
              </ListItemIcon>
              <ListItemText primary={i18n.t('core:addRemoveTags')} />
            </MenuItem>
            <MenuItem
              data-tid="fileMenuRenameFile"
              onClick={showRenameFileDialog}
            >
              <ListItemIcon>
                <RenameFile />
              </ListItemIcon>
              <ListItemText primary={i18n.t('core:renameFile')} />
            </MenuItem>
            <MenuItem
              data-tid="fileMenuMoveCopyFile"
              onClick={showMoveCopyFilesDialog}
            >
              <ListItemIcon>
                <MoveCopy />
              </ListItemIcon>
              <ListItemText primary={i18n.t('core:moveCopyFile')} />
            </MenuItem>
            {Pro && props.selectedEntries.length === 1 && (
              <MenuItem data-tid="setAsThumbTID" onClick={setFolderThumbnail}>
                <ListItemIcon>
                  <ImageIcon />
                </ListItemIcon>
                <ListItemText primary={i18n.t('core:setAsThumbnail')} />
              </MenuItem>
            )}
            <MenuItem
              data-tid="fileMenuDeleteFile"
              onClick={showDeleteFileDialog}
            >
              <ListItemIcon>
                <DeleteForever />
              </ListItemIcon>
              <ListItemText primary={i18n.t('core:deleteEntry')} />
            </MenuItem>
          </>
        )}
      </Menu>
    </div>
  );
};

export default FileMenu;
