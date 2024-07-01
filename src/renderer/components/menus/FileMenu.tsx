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
import { Menu, MenuList, MenuItem } from '@mui/material';
import Divider from '@mui/material/Divider';
import OpenFile from '@mui/icons-material/SubdirectoryArrowRight';
import OpenFileNatively from '@mui/icons-material/Launch';
import { ParentFolderIcon, DownloadIcon } from '-/components/CommonIcons';
import OpenFolderInternally from '@mui/icons-material/Folder';
import MoveCopy from '@mui/icons-material/FileCopy';
import MoveToTopIcon from '@mui/icons-material/VerticalAlignTop';
import MoveToBottomIcon from '@mui/icons-material/VerticalAlignBottom';
import DuplicateFile from '@mui/icons-material/PostAdd';
import ImageIcon from '@mui/icons-material/Image';
import RenameFile from '@mui/icons-material/FormatTextdirectionLToR';
import AppConfig from '-/AppConfig';
import {
  extractContainingDirectoryPath,
  extractParentDirectoryPath,
  generateSharingLink,
  extractTitle,
} from '@tagspaces/tagspaces-common/paths';
import {
  createNewInstance,
  downloadFile,
  getRelativeEntryPath,
  openDirectoryMessage,
} from '-/services/utils-io';
import { getKeyBindingObject } from '-/reducers/settings';
import { Pro } from '-/pro';
import { useSelector } from 'react-redux';
import { supportedImgs } from '-/services/thumbsgenerator';
import {
  OpenNewWindowIcon,
  DeleteIcon,
  LinkIcon,
  TagIcon,
} from '-/components/CommonIcons';
import PropertiesIcon from '@mui/icons-material/Info';
import { useTranslation } from 'react-i18next';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { usePlatformFacadeContext } from '-/hooks/usePlatformFacadeContext';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import MenuKeyBinding from '-/components/menus/MenuKeyBinding';
import { TS } from '-/tagspaces.namespace';
import { generateClipboardLink } from '-/utils/dom';
import { useDeleteMultipleEntriesDialogContext } from '-/components/dialogs/hooks/useDeleteMultipleEntriesDialogContext';

interface Props {
  anchorEl: Element;
  mouseX?: number;
  mouseY?: number;
  open: boolean;
  onClose: () => void;
  openRenameFileDialog: () => void;
  openMoveCopyFilesDialog: () => void;
  openShareFilesDialog?: () => void;
  openAddRemoveTagsDialog: () => void;
  selectedFilePath?: string;
  reorderTop?: () => void;
  reorderBottom?: () => void;
  onDuplicateFile?: (fileDirPath: string) => void;
}

function FileMenu(props: Props) {
  const {
    openRenameFileDialog,
    openMoveCopyFilesDialog,
    openShareFilesDialog,
    openAddRemoveTagsDialog,
    reorderTop,
    reorderBottom,
    anchorEl,
    mouseX,
    mouseY,
    open,
    onClose,
    selectedFilePath,
  } = props;

  const keyBindings = useSelector(getKeyBindingObject);
  const { t } = useTranslation();
  const { selectedEntries } = useSelectedEntriesContext();
  const { openDeleteMultipleEntriesDialog } =
    useDeleteMultipleEntriesDialogContext();
  const {
    setBackgroundImageChange,
    setThumbnailImageChange,
    openFileNatively,
    duplicateFile,
    setFolderBackgroundPromise,
  } = useIOActionsContext();
  const { openEntry } = useOpenedEntryContext();
  const { openDirectory, currentLocationPath } = useDirectoryContentContext();
  const { showNotification } = useNotificationContext();
  const { setFolderThumbnailPromise } = usePlatformFacadeContext();
  const { currentLocation, readOnlyMode } = useCurrentLocationContext();

  function generateFileLink() {
    const entryPath = selectedEntries[0].path;
    const relativePath = getRelativeEntryPath(currentLocationPath, entryPath);
    return generateSharingLink(currentLocation.uuid, relativePath);
  }

  function showProperties() {
    onClose();
    if (selectedEntries && selectedEntries.length === 1) {
      openEntry(selectedEntries[0].path, true);
    }
  }

  function copySharingLink() {
    onClose();
    if (selectedEntries && selectedEntries.length === 1) {
      const sharingLink = generateFileLink();
      const entryTitle = extractTitle(
        selectedEntries[0].name,
        !selectedEntries[0].isFile,
        currentLocation?.getDirSeparator(),
      );

      const clibboardItem = generateClipboardLink(sharingLink, entryTitle);

      navigator.clipboard
        .write(clibboardItem)
        .then(() => {
          showNotification(t('core:sharingLinkCopied'));
          return true;
        })
        .catch((e) => {
          console.log('Error copying to clipboard ' + e);
          showNotification(t('core:sharingLinkFailed'));
        });
    }
  }

  function showDeleteFileDialog() {
    onClose();
    openDeleteMultipleEntriesDialog();
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
    setFolderThumbnailPromise(selectedEntries[0].path) //selectedFilePath)
      .then((thumbPath: string) => {
        const entry: TS.FileSystemEntry = currentLocation.toFsEntry(
          extractContainingDirectoryPath(
            selectedEntries[0].path,
            currentLocation?.getDirSeparator(),
          ),
          false,
        );
        setThumbnailImageChange({
          ...entry,
          meta: { id: entry.uuid, thumbPath },
        });
        //showNotification('Thumbnail created: ' + thumbPath);
        return true;
      })
      .catch((error) => {
        showNotification('Thumbnail creation failed.');
        console.log(
          'Error setting Thumb for entry: ' + selectedEntries[0].path,
          error,
        );
        return true;
      });
  }

  function setFolderBackground() {
    onClose();
    let path =
      currentLocation &&
      (currentLocation.haveObjectStoreSupport() ||
        currentLocation.haveWebDavSupport())
        ? currentLocation.generateURLforPath(selectedFilePath, 604800) // 7 days
        : selectedFilePath;

    const directoryPath = extractContainingDirectoryPath(
      selectedFilePath,
      currentLocation?.getDirSeparator(),
    );

    setFolderBackgroundPromise(path, directoryPath)
      .then((directoryPath: string) => {
        setBackgroundImageChange(
          currentLocation.toFsEntry(directoryPath, false),
        );
        /*dispatch(
          AppActions.setLastBackgroundImageChange(path, new Date().getTime()),
        );*/
        showNotification('Background created for: ' + directoryPath);
        return true;
      })
      .catch((error) => {
        showNotification('Background creation failed.');
        console.log(
          'Error setting Background for entry: ' + selectedFilePath,
          error,
        );
        return true;
      });
  }

  function showAddRemoveTagsDialog() {
    onClose();
    openAddRemoveTagsDialog();
  }

  function duplicateFileHandler() {
    onClose();
    duplicateFile(selectedFilePath);
  }

  function openParentFolderInternally() {
    onClose();
    if (selectedFilePath) {
      const parentFolder = extractParentDirectoryPath(
        selectedFilePath,
        currentLocation?.getDirSeparator(),
      );
      return openDirectory(parentFolder);
    }
  }

  function openFile() {
    onClose();
    if (selectedFilePath) {
      return openEntry(selectedFilePath);
    }
  }

  function openInNewWindow() {
    onClose();
    if (selectedEntries && selectedEntries.length === 1) {
      const sharingLink = generateFileLink();
      const newInstanceLink =
        window.location.href.split('?')[0] + '?' + sharingLink.split('?')[1];
      createNewInstance(newInstanceLink);
    }
  }

  function openFileNativelyHandler() {
    onClose();
    if (selectedFilePath) {
      openFileNatively(selectedFilePath);
    }
  }

  const menuItems = [];

  const pathLowerCase = selectedFilePath.toLowerCase();
  const isImageFile = supportedImgs.some((ext) =>
    pathLowerCase.endsWith('.' + ext),
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
        <ListItemText primary={t('core:openFile')} />
        <MenuKeyBinding keyBinding={keyBindings['openEntry']} />
      </MenuItem>,
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
        <ListItemText primary={t('core:openInWindow')} />
      </MenuItem>,
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
        <ListItemText primary={t('core:openParentFolder')} />
      </MenuItem>,
    );
  }
  if (
    !(
      (currentLocation &&
        (currentLocation.haveObjectStoreSupport() ||
          currentLocation.haveWebDavSupport())) ||
      AppConfig.isWeb
    ) &&
    selectedEntries.length < 2
  ) {
    menuItems.push(
      <MenuItem
        key="fileMenuOpenFileNatively"
        data-tid="fileMenuOpenFileNatively"
        onClick={openFileNativelyHandler}
      >
        <ListItemIcon>
          <OpenFileNatively />
        </ListItemIcon>
        <ListItemText primary={t('core:openFileNatively')} />
        <MenuKeyBinding keyBinding={keyBindings['openFileExternally']} />
      </MenuItem>,
    );
    if (AppConfig.isElectron) {
      menuItems.push(
        <MenuItem
          key="fileMenuOpenContainingFolder"
          data-tid="fileMenuOpenContainingFolder"
          onClick={() => {
            onClose();
            if (selectedFilePath) {
              openDirectoryMessage(selectedFilePath);
            }
          }}
        >
          <ListItemIcon>
            <OpenFolderInternally />
          </ListItemIcon>
          <ListItemText primary={t('core:showInFileManager')} />
        </MenuItem>,
      );
    }
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
          <TagIcon />
        </ListItemIcon>
        <ListItemText primary={t('core:addRemoveTags')} />
        <MenuKeyBinding keyBinding={keyBindings['addRemoveTags']} />
      </MenuItem>,
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
          <ListItemText primary={t('core:moveToTop')} />
        </MenuItem>,
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
          <ListItemText primary={t('core:moveToBottom')} />
        </MenuItem>,
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
        <ListItemText primary={t('core:renameFile')} />
        <MenuKeyBinding keyBinding={keyBindings['renameFile']} />
      </MenuItem>,
    );
    if (selectedEntries.length < 2) {
      menuItems.push(
        <MenuItem
          key="fileMenuDuplicateFile"
          data-tid="fileMenuDuplicateFileTID"
          onClick={duplicateFileHandler}
        >
          <ListItemIcon>
            <DuplicateFile />
          </ListItemIcon>
          <ListItemText primary={t('core:duplicateFile')} />
          <MenuKeyBinding keyBinding={keyBindings['duplicateFile']} />
        </MenuItem>,
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
          <ListItemText primary={t('core:shareFiles')} />
        </MenuItem>,
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
        <ListItemText primary={t('core:moveCopyFile')} />
        <MenuKeyBinding keyBinding={keyBindings['copyMoveSelectedEntries']} />
      </MenuItem>,
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
        <ListItemText primary={t('core:deleteEntry')} />
        <MenuKeyBinding keyBinding={keyBindings['deleteDocument']} />
      </MenuItem>,
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
          <ListItemText primary={t('core:setAsThumbnail')} />
        </MenuItem>,
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
            <ListItemText primary={t('core:setAsBackground')} />
          </MenuItem>,
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
        <ListItemText primary={t('core:copySharingLink')} />
      </MenuItem>,
    );

    menuItems.push(
      <MenuItem
        key="downloadFileUrl"
        data-tid="downloadFileUrlTID"
        onClick={() => {
          const url = currentLocation.haveObjectStoreSupport()
            ? currentLocation.generateURLforPath(selectedFilePath, 86400)
            : undefined;
          const downloadResult = downloadFile(
            selectedFilePath,
            url,
            currentLocation?.getDirSeparator(),
          );
          if (downloadResult === -1) {
            showNotification(t('core:cantDownloadLocalFile'));
          }
          onClose();
        }}
      >
        <ListItemIcon>
          <DownloadIcon />
        </ListItemIcon>
        <ListItemText primary={t('core:downloadFile')} />
      </MenuItem>,
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
        <ListItemText primary={t('core:filePropertiesTitle')} />
        <MenuKeyBinding keyBinding={keyBindings['openEntryDetails']} />
      </MenuItem>,
    );
  }

  return (
    <Menu
      anchorEl={anchorEl}
      anchorReference={mouseY && mouseX ? 'anchorPosition' : undefined}
      anchorPosition={
        mouseY && mouseX ? { top: mouseY, left: mouseX } : undefined
      }
      open={open}
      onClose={onClose}
    >
      <MenuList>{menuItems}</MenuList>
    </Menu>
  );
}

export default FileMenu;
