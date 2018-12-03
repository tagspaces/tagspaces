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
import OpenFolderIcon from '@material-ui/icons/SubdirectoryArrowLeft';
import AddExistingFileIcon from '@material-ui/icons/ExitToApp';
import OpenFolderNativelyIcon from '@material-ui/icons/Launch';
import AutoRenew from '@material-ui/icons/Autorenew';
import NewFileIcon from '@material-ui/icons/InsertDriveFile';
import NewFolderIcon from '@material-ui/icons/CreateNewFolder';
import RenameFolderIcon from '@material-ui/icons/FormatTextdirectionLToR';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import SettingsIcon from '@material-ui/icons/Settings';
import ConfirmDialog from '../dialogs/ConfirmDialog';
import CreateDirectoryDialog from '../dialogs/CreateDirectoryDialog';
import RenameDirectoryDialog from '../dialogs/RenameDirectoryDialog';
import AppConfig from '../../config';
import i18n from '../../services/i18n';
import { extractFileName, extractParentDirectoryPath } from '../../utils/paths'; // extractFileExtension
import PlatformIO from '../../services/platform-io';

type Props = {
  open?: boolean,
  onClose: () => void,
  anchorEl?: Object | null,
  directoryPath?: string,
  loadDirectoryContent: (path: string) => void,
  openDirectory: (path: string) => void,
  openFile: (path: string, isFile: boolean) => void,
  deleteDirectory: (path: string) => void,
  reflectCreateEntry?: (path: string, isFile: boolean) => void,
  toggleCreateFileDialog?: () => void,
  openFileNatively?: (path: string) => void,
  perspectiveMode: boolean,
  showNotification?: (
    text: string,
    notificationType: string,
    autohide: boolean
  ) => void,
  isReadOnlyMode: boolean
};

type State = {
  isCreateDirectoryDialogOpened?: boolean,
  isDeleteDirectoryDialogOpened?: boolean,
  isRenameDirectoryDialogOpened?: boolean
};

class DirectoryMenu extends React.Component<Props, State> {
  fileInput: Object | null;

  state = {
    isCreateDirectoryDialogOpened: false,
    isDeleteDirectoryDialogOpened: false,
    isRenameDirectoryDialogOpened: false
  };

  reloadDirectory = () => {
    this.props.onClose();
    this.props.loadDirectoryContent(this.props.directoryPath);
  };

  openParentDirectory = () => {
    this.props.onClose();
    const parentDirectory = extractParentDirectoryPath(
      this.props.directoryPath
    );
    this.props.loadDirectoryContent(parentDirectory);
  };

  openDirectory = () => {
    this.props.onClose();
    this.props.loadDirectoryContent(this.props.directoryPath);
  };

  showProperties = () => {
    this.props.onClose();
    this.props.openFile(this.props.directoryPath, false);
  };

  showDeleteDirectoryDialog = () => {
    this.props.onClose();
    this.setState({ isDeleteDirectoryDialogOpened: true });
  };

  showRenameDirectoryDialog = () => {
    this.props.onClose();
    this.setState({ isRenameDirectoryDialogOpened: true });
  };

  showCreateDirectoryDialog = () => {
    this.props.onClose();
    this.setState({ isCreateDirectoryDialogOpened: true });
  };

  createNewFile = () => {
    this.props.onClose();
    this.props.toggleCreateFileDialog();
  };

  handleCloseDialogs = () => {
    this.setState({
      isCreateDirectoryDialogOpened: false,
      isDeleteDirectoryDialogOpened: false,
      isRenameDirectoryDialogOpened: false
    });
  };

  showInFileManager = () => {
    this.props.onClose();
    this.props.openFileNatively(this.props.directoryPath);
  };

  showContainingFolderInFileManager = () => {
    this.props.onClose();
    this.props.openDirectory(this.props.directoryPath);
  };

  addExistingFile = () => {
    this.props.onClose();
    if (this.fileInput) {
      this.fileInput.click();
    }
  };

  handleFileInputChange = (selection: Object) => {
    // console.log("Selected File: "+JSON.stringify(selection.currentTarget.files[0]));
    const file = selection.currentTarget.files[0];
    const filePath =
      this.props.directoryPath +
      AppConfig.dirSeparator +
      decodeURIComponent(file.name);

    const reader = new FileReader();
    reader.onload = event => {
      // console.log('Content on file read complete: ' + JSON.stringify(event));
      // change name for ios fakepath
      // if (AppConfig.isCordovaiOS) {
      //   const fileExt = extractFileExtension(addFileInputName);
      //   addFileInputName = AppConfig.beginTagContainer + formatDateTime4Tag(new Date(), true) + AppConfig.endTagContainer + fileExt;
      // }
      // TODO event.currentTarget.result is ArrayBuffer
      // Sample call from PRO version using content = Utils.base64ToArrayBuffer(baseString);
      PlatformIO.saveBinaryFilePromise(
        filePath,
        event.currentTarget.result,
        true
      )
        .then(() => {
          this.props.showNotification(
            'File ' + filePath + ' successfully imported.',
            'default',
            true
          );
          this.props.reflectCreateEntry(filePath, true);
          return true;
        })
        .catch(error => {
          // TODO showAlertDialog("Saving " + filePath + " failed.");
          console.error('Save to file ' + filePath + ' failed ' + error);
          this.props.showNotification(
            'Importing file ' + filePath + ' failed.',
            'error',
            true
          );
          return true;
        });
    };

    if (AppConfig.isCordova) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  render() {
    return (
      <div style={{ overflowY: 'hidden !important' }}>
        <RenameDirectoryDialog
          open={this.state.isRenameDirectoryDialogOpened}
          onClose={this.handleCloseDialogs}
          selectedDirectoryPath={this.props.directoryPath}
        />
        <CreateDirectoryDialog
          open={this.state.isCreateDirectoryDialogOpened}
          onClose={this.handleCloseDialogs}
          selectedDirectoryPath={this.props.directoryPath}
        />
        <ConfirmDialog
          open={this.state.isDeleteDirectoryDialogOpened}
          onClose={this.handleCloseDialogs}
          title={i18n.t('core:deleteDirectoryTitleConfirm')}
          content={i18n.t('core:deleteDirectoryContentConfirm', {
            dirPath: this.props.directoryPath
              ? extractFileName(this.props.directoryPath)
              : ''
          })}
          confirmCallback={result => {
            if (result) {
              this.props.deleteDirectory(this.props.directoryPath);
            }
          }}
          confirmDialogContent={'confirmDialogContent'}
          cancelDialogTID={'cancelDeleteDirectoryDialog'}
          confirmDialogTID={'confirmDeleteDirectoryDialog'}
        />
        <Menu
          anchorEl={this.props.anchorEl}
          open={this.props.open}
          onClose={this.props.onClose}
        >
          {this.props.perspectiveMode && (
            <MenuItem
              data-tid="openDirectory"
              onClick={this.openDirectory}
            >
              <ListItemIcon>
                <OpenFolderIcon />
              </ListItemIcon>
              <ListItemText inset primary={i18n.t('core:openDirectory')} />
            </MenuItem>
          )}
          {!this.props.perspectiveMode && (
            <MenuItem
              data-tid="openParentDirectory"
              onClick={this.openParentDirectory}
            >
              <ListItemIcon>
                <OpenFolderIcon />
              </ListItemIcon>
              <ListItemText inset primary={i18n.t('core:openParentDirectory')} />
            </MenuItem>
          )}
          {!this.props.perspectiveMode && (
            <MenuItem data-tid="reloadDirectory" onClick={this.reloadDirectory}>
              <ListItemIcon>
                <AutoRenew />
              </ListItemIcon>
              <ListItemText inset primary={i18n.t('core:reloadDirectory')} />
            </MenuItem>
          )}
          {!this.props.isReadOnlyMode && (
            <MenuItem
              data-tid="renameDirectory"
              onClick={this.showRenameDirectoryDialog}
            >
              <ListItemIcon>
                <RenameFolderIcon />
              </ListItemIcon>
              <ListItemText inset primary={i18n.t('core:renameDirectory')} />
            </MenuItem>
          )}
          {!this.props.isReadOnlyMode && (
            <MenuItem
              data-tid="deleteDirectory"
              onClick={this.showDeleteDirectoryDialog}
            >
              <ListItemIcon>
                <DeleteForeverIcon />
              </ListItemIcon>
              <ListItemText inset primary={i18n.t('core:deleteDirectory')} />
            </MenuItem>
          )}
          <MenuItem
            data-tid="openDirectoryNatively"
            onClick={this.showInFileManager}
          >
            <ListItemIcon>
              <OpenFolderNativelyIcon />
            </ListItemIcon>
            <ListItemText
              inset
              primary={i18n.t('core:openDirectoryNatively')}
            />
          </MenuItem>
          {!this.props.perspectiveMode && (
            <Divider />
          )}
          {!this.props.isReadOnlyMode && !this.props.perspectiveMode && (
            <MenuItem
              data-tid="newSubDirectory"
              onClick={this.showCreateDirectoryDialog}
            >
              <ListItemIcon>
                <NewFolderIcon />
              </ListItemIcon>
              <ListItemText inset primary={i18n.t('core:newSubdirectory')} />
            </MenuItem>
          )}
          {!this.props.isReadOnlyMode && !this.props.perspectiveMode && (
            <MenuItem data-tid="createNewFile" onClick={this.createNewFile}>
              <ListItemIcon>
                <NewFileIcon />
              </ListItemIcon>
              <ListItemText inset primary={i18n.t('core:newFileNote')} />
            </MenuItem>
          )}
          {!this.props.isReadOnlyMode && !this.props.perspectiveMode && (
            <MenuItem data-tid="addExistingFile" onClick={this.addExistingFile}>
              <ListItemIcon>
                <AddExistingFileIcon />
              </ListItemIcon>
              <ListItemText inset primary={i18n.t('core:showAddFileDialog')} />
            </MenuItem>
          )}
          {!this.props.perspectiveMode && (
            <Divider />
          )}
          <MenuItem data-tid="showProperties" onClick={this.showProperties}>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText
              inset
              primary={i18n.t('core:directoryPropertiesTitle')}
            />
          </MenuItem>
        </Menu>
        <input
          style={{ display: 'none' }}
          ref={input => {
            this.fileInput = input;
          }}
          accept="*"
          type="file"
          onChange={this.handleFileInputChange}
        />
      </div>
    );
  }
}

export default DirectoryMenu;
