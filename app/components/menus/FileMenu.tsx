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
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ShareIcon from '@mui/icons-material/Share';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import OpenFile from '@mui/icons-material/SubdirectoryArrowRight';
import OpenFileNatively from '@mui/icons-material/Launch';
import { ParentFolderIcon } from '-/components/CommonIcons';
import OpenFolderInternally from '@mui/icons-material/Folder';
import AddRemoveTags from '@mui/icons-material/Loyalty';
import MoveCopy from '@mui/icons-material/FileCopy';
import MoveToTopIcon from '@mui/icons-material/VerticalAlignTop';
import MoveToBottomIcon from '@mui/icons-material/VerticalAlignBottom';
import DuplicateFile from '@mui/icons-material/PostAdd';
import ImageIcon from '@mui/icons-material/Image';
import RenameFile from '@mui/icons-material/FormatTextdirectionLToR';
import { formatDateTime4Tag } from '@tagspaces/tagspaces-common/misc';
import AppConfig from '-/AppConfig';
import {
  extractContainingDirectoryPath,
  extractFileName,
  extractParentDirectoryPath,
  extractTags,
  generateSharingLink
} from '@tagspaces/tagspaces-common/paths';
import i18n from '-/services/i18n';
import PlatformIO from '-/services/platform-facade';
import {
  generateFileName,
  getAllPropertiesPromise,
  setFolderBackgroundPromise,
  setFolderThumbnailPromise,
  getRelativeEntryPath
} from '-/services/utils-io';
import { Pro } from '-/pro';
import { TS } from '-/tagspaces.namespace';
import { bindActionCreators } from 'redux';
import { actions as AppActions } from '-/reducers/app';
import { connect } from 'react-redux';
import { supportedImgs } from '-/services/thumbsgenerator';
import {
  getEnableWS,
  getMapTileServers,
  getPrefixTagContainer,
  getSettings,
  isDevMode
} from '-/reducers/settings';
import {
  OpenNewWindowIcon,
  DeleteIcon,
  LinkIcon
} from '-/components/CommonIcons';

interface Props {
  anchorEl: Element;
  mouseX?: number;
  mouseY?: number;
  open: boolean;
  onClose: () => void;
  openDeleteFileDialog: () => void;
  openRenameFileDialog: () => void;
  openMoveCopyFilesDialog: () => void;
  openShareFilesDialog?: () => void;
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
  setLastBackgroundImageChange: (path: string, dt: number) => void;
  reorderTop?: () => void;
  reorderBottom?: () => void;
  onDuplicateFile?: (fileDirPath: string) => void;
  exitSearchMode: () => void;
  prefixTagContainer: string;
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

  function generateFileLink() {
    const entryFromIndex = selectedEntries[0].locationID;
    const locationID = entryFromIndex
      ? selectedEntries[0].locationID
      : currentLocation.uuid;
    const entryPath = selectedEntries[0].path;
    const tmpLoc = locations.find(location => location.uuid === locationID);
    const relativePath = getRelativeEntryPath(tmpLoc, entryPath);
    return generateSharingLink(locationID, relativePath);
  }

  function copySharingLink() {
    onClose();
    if (selectedEntries && selectedEntries.length === 1) {
      const sharingLink = generateFileLink();
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

  function showShareFilesDialog() {
    onClose();
    props.openShareFilesDialog();
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

  function setFolderBackground() {
    onClose();
    let path =
      PlatformIO.haveObjectStoreSupport() || PlatformIO.haveWebDavSupport()
        ? PlatformIO.getURLforPath(props.selectedFilePath)
        : props.selectedFilePath;

    const directoryPath = extractContainingDirectoryPath(
      props.selectedFilePath,
      PlatformIO.getDirSeparator()
    );

    setFolderBackgroundPromise(path, directoryPath)
      .then((directoryPath: string) => {
        props.setLastBackgroundImageChange(path, new Date().getTime());
        showNotification('Background created for: ' + directoryPath);
        return true;
      })
      .catch(error => {
        showNotification('Background creation failed.');
        console.warn(
          'Error setting Background for entry: ' + props.selectedFilePath,
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
        generateFileName(
          fileName,
          extractedTags,
          AppConfig.tagDelimiter,
          props.prefixTagContainer
        );

      PlatformIO.copyFilePromise(selectedFilePath, newFilePath)
        .then(() => {
          if (props.onDuplicateFile) {
            props.onDuplicateFile(dirPath);
          } else {
            props.loadDirectoryContent(dirPath, true, true);
          }
          return true;
        })
        .catch(error => {
          showNotification('Error creating duplicate: ', error);
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
      props.exitSearchMode();
      props.loadDirectoryContent(parentFolder, false, true);
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

  function openInNewWindow() {
    onClose();
    if (selectedEntries && selectedEntries.length === 1) {
      const sharingLink = generateFileLink();
      const newInstanceLink =
        window.location.href.split('?')[0] + '?' + sharingLink.split('?')[1];
      PlatformIO.createNewInstance(newInstanceLink);
    }
  }

  const menuItems = [];

  const pathLowerCase = selectedFilePath.toLowerCase();
  const isImageFile = supportedImgs.some(ext =>
    pathLowerCase.endsWith('.' + ext)
  );

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
        key="fileMenuOpenFileNewWindow"
        data-tid="fileMenuOpenFileNewWindow"
        onClick={openInNewWindow}
      >
        <ListItemIcon>
          <OpenNewWindowIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:openInWindow')} />
      </MenuItem>
    );
    menuItems.push(
      <MenuItem
        key="fileMenuOpenParentFolderInternally"
        data-tid="fileMenuOpenParentFolderInternally"
        onClick={openParentFolderInternally}
      >
        <ListItemIcon>
          <ParentFolderIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:openParentFolder')} />
      </MenuItem>
    );
  }
  if (
    !(
      PlatformIO.haveObjectStoreSupport() ||
      PlatformIO.haveWebDavSupport() ||
      AppConfig.isWeb
    ) &&
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
    if (props.reorderTop) {
      menuItems.push(
        <MenuItem
          key="reorderTop"
          data-tid="reorderTopTID"
          onClick={() => {
            onClose();
            props.reorderTop();
          }}
        >
          <ListItemIcon>
            <MoveToTopIcon />
          </ListItemIcon>
          <ListItemText primary={i18n.t('core:moveToTop')} />
        </MenuItem>
      );
    }
    if (props.reorderBottom) {
      menuItems.push(
        <MenuItem
          key="reorderBottom"
          data-tid="reorderBottomTID"
          onClick={() => {
            onClose();
            props.reorderBottom();
          }}
        >
          <ListItemIcon>
            <MoveToBottomIcon />
          </ListItemIcon>
          <ListItemText primary={i18n.t('core:moveToBottom')} />
        </MenuItem>
      );
    }
    menuItems.push(<Divider key="fmDivider3" />);
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
    if (selectedEntries.length < 2) {
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
    }

    if (Pro && props.openShareFilesDialog) {
      menuItems.push(
        <MenuItem
          key="fileMenuShareFile"
          data-tid="fileMenuMoveCopyFile"
          onClick={showShareFilesDialog}
        >
          <ListItemIcon>
            <ShareIcon />
          </ListItemIcon>
          <ListItemText primary={i18n.t('core:shareFiles')} />
        </MenuItem>
      );
    }
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
    menuItems.push(
      <MenuItem
        key="fileMenuDeleteFile"
        data-tid="fileMenuDeleteFile"
        onClick={showDeleteFileDialog}
      >
        <ListItemIcon>
          <DeleteIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:deleteEntry')} />
      </MenuItem>
    );
    menuItems.push(<Divider key="fmDivider2" />);
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
      if (isImageFile) {
        menuItems.push(
          <MenuItem
            key="setAsBgndTID"
            data-tid="setAsBgndTID"
            onClick={setFolderBackground}
          >
            <ListItemIcon>
              <ImageIcon />
            </ListItemIcon>
            <ListItemText primary={i18n.t('core:setAsBackground')} />
          </MenuItem>
        );
      }
    }
  }

  if (selectedEntries.length === 1) {
    menuItems.push(
      <MenuItem
        key="copySharingLink"
        data-tid="copyFileSharingLink"
        onClick={copySharingLink}
      >
        <ListItemIcon>
          <LinkIcon />
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

function mapStateToProps(state) {
  return {
    prefixTagContainer: getPrefixTagContainer(state)
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      setLastBackgroundImageChange: AppActions.setLastBackgroundImageChange,
      exitSearchMode: AppActions.exitSearchMode
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(FileMenu);
