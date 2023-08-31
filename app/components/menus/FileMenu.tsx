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
  setFolderBackgroundPromise,
  setFolderThumbnailPromise,
  getRelativeEntryPath
} from '-/services/utils-io';
import { Pro } from '-/pro';
import { TS } from '-/tagspaces.namespace';
import {
  actions as AppActions,
  AppDispatch,
  isReadOnlyMode
} from '-/reducers/app';
import { useSelector, useDispatch } from 'react-redux';
import { supportedImgs } from '-/services/thumbsgenerator';
import { getPrefixTagContainer } from '-/reducers/settings';
import {
  OpenNewWindowIcon,
  DeleteIcon,
  LinkIcon
} from '-/components/CommonIcons';
import { getLocations } from '-/reducers/locations';
import PropertiesIcon from '@mui/icons-material/Info';

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
  loadDirectoryContent: (
    path: string,
    generateThumbnails: boolean,
    loadDirMeta?: boolean
  ) => void;
  openFileNatively: (path: string) => void;
  showInFileManager: (path: string) => void;
  selectedFilePath?: string;
  selectedEntries: Array<any>;
  currentLocation: TS.Location;
  reorderTop?: () => void;
  reorderBottom?: () => void;
  onDuplicateFile?: (fileDirPath: string) => void;
}

function FileMenu(props: Props) {
  const {
    openDeleteFileDialog,
    openRenameFileDialog,
    openMoveCopyFilesDialog,
    openShareFilesDialog,
    openAddRemoveTagsDialog,
    showInFileManager,
    onDuplicateFile,
    loadDirectoryContent,
    selectedEntries,
    openFileNatively,
    currentLocation,
    reorderTop,
    reorderBottom,
    anchorEl,
    mouseX,
    mouseY,
    open,
    onClose,
    selectedFilePath
  } = props;
  const dispatch: AppDispatch = useDispatch();
  const locations: Array<TS.Location> = useSelector(getLocations);
  const readOnlyMode = useSelector(isReadOnlyMode);
  const prefixTagContainer = useSelector(getPrefixTagContainer);

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

  function showProperties() {
    onClose();
    if (selectedEntries && selectedEntries.length === 1) {
      dispatch(AppActions.openEntry(selectedEntries[0].path, true));
    }
  }

  function copySharingLink() {
    onClose();
    if (selectedEntries && selectedEntries.length === 1) {
      const sharingLink = generateFileLink();
      navigator.clipboard
        .writeText(sharingLink)
        .then(() => {
          dispatch(
            AppActions.showNotification(i18n.t('core:sharingLinkCopied'))
          );
          return true;
        })
        .catch(() => {
          dispatch(
            AppActions.showNotification(i18n.t('core:sharingLinkFailed'))
          );
        });
    }
  }

  function showDeleteFileDialog() {
    onClose();
    openDeleteFileDialog();
  }

  function showRenameFileDialog() {
    onClose();
    openRenameFileDialog();
  }

  function showMoveCopyFilesDialog() {
    onClose();
    openMoveCopyFilesDialog();
  }

  function showShareFilesDialog() {
    onClose();
    openShareFilesDialog();
  }

  function setFolderThumbnail() {
    onClose();
    setFolderThumbnailPromise(selectedFilePath)
      .then((directoryPath: string) => {
        dispatch(
          AppActions.showNotification('Thumbnail created for: ' + directoryPath)
        );
        return true;
      })
      .catch(error => {
        dispatch(AppActions.showNotification('Thumbnail creation failed.'));
        console.warn(
          'Error setting Thumb for entry: ' + selectedFilePath,
          error
        );
        return true;
      });
  }

  function setFolderBackground() {
    onClose();
    let path =
      PlatformIO.haveObjectStoreSupport() || PlatformIO.haveWebDavSupport()
        ? PlatformIO.getURLforPath(selectedFilePath)
        : selectedFilePath;

    const directoryPath = extractContainingDirectoryPath(
      selectedFilePath,
      PlatformIO.getDirSeparator()
    );

    setFolderBackgroundPromise(path, directoryPath)
      .then((directoryPath: string) => {
        dispatch(
          AppActions.setLastBackgroundImageChange(path, new Date().getTime())
        );
        dispatch(
          AppActions.showNotification(
            'Background created for: ' + directoryPath
          )
        );
        return true;
      })
      .catch(error => {
        dispatch(AppActions.showNotification('Background creation failed.'));
        console.warn(
          'Error setting Background for entry: ' + selectedFilePath,
          error
        );
        return true;
      });
  }

  function showAddRemoveTagsDialog() {
    onClose();
    openAddRemoveTagsDialog();
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
          prefixTagContainer
        );

      PlatformIO.copyFilePromise(selectedFilePath, newFilePath)
        .then(() => {
          if (onDuplicateFile) {
            onDuplicateFile(dirPath);
          } else {
            loadDirectoryContent(dirPath, true, true);
          }
          return true;
        })
        .catch(error => {
          dispatch(
            AppActions.showNotification('Error creating duplicate: ', error)
          );
        });
    }
  }

  function openParentFolderInternally() {
    onClose();
    if (selectedFilePath) {
      const parentFolder = extractParentDirectoryPath(
        selectedFilePath,
        PlatformIO.getDirSeparator()
      );
      dispatch(AppActions.exitSearchMode());
      loadDirectoryContent(parentFolder, false, true);
    }
  }

  function openFile() {
    onClose();
    if (selectedFilePath) {
      return dispatch(AppActions.openEntry(selectedFilePath));
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
        onClick={() => {
          onClose();
          if (selectedFilePath) {
            openFileNatively(selectedFilePath);
          }
        }}
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
        onClick={() => {
          onClose();
          if (selectedFilePath) {
            showInFileManager(selectedFilePath);
          }
        }}
      >
        <ListItemIcon>
          <OpenFolderInternally />
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:showInFileManager')} />
      </MenuItem>
    );
    menuItems.push(<Divider key="fmDivider" />);
  }
  if (!readOnlyMode) {
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
    if (reorderTop) {
      menuItems.push(
        <MenuItem
          key="reorderTop"
          data-tid="reorderTopTID"
          onClick={() => {
            onClose();
            reorderTop();
          }}
        >
          <ListItemIcon>
            <MoveToTopIcon />
          </ListItemIcon>
          <ListItemText primary={i18n.t('core:moveToTop')} />
        </MenuItem>
      );
    }
    if (reorderBottom) {
      menuItems.push(
        <MenuItem
          key="reorderBottom"
          data-tid="reorderBottomTID"
          onClick={() => {
            onClose();
            reorderBottom();
          }}
        >
          <ListItemIcon>
            <MoveToBottomIcon />
          </ListItemIcon>
          <ListItemText primary={i18n.t('core:moveToBottom')} />
        </MenuItem>
      );
    }
    menuItems.push(<Divider key="fmDivider1" />);
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

    if (Pro && openShareFilesDialog) {
      menuItems.push(
        <MenuItem
          key="fileMenuShareFile"
          data-tid="fileMenuShareFile"
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

  if (selectedEntries.length < 2) {
    menuItems.push(<Divider key="fmDivider3" />);
    menuItems.push(
      <MenuItem
        key="showProperties"
        data-tid="showPropertiesTID"
        onClick={showProperties}
      >
        <ListItemIcon>
          <PropertiesIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:filePropertiesTitle')} />
      </MenuItem>
    );
  }

  return (
    <div style={{ overflowY: 'hidden' }}>
      <Menu
        anchorEl={anchorEl}
        anchorReference={mouseY && mouseX ? 'anchorPosition' : undefined}
        anchorPosition={
          mouseY && mouseX ? { top: mouseY, left: mouseX } : undefined
        }
        open={open}
        onClose={onClose}
      >
        {menuItems}
      </Menu>
    </div>
  );
}

export default FileMenu;
