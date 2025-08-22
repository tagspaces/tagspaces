/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces GmbH
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

import AppConfig from '-/AppConfig';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CopyMoveIcon,
  DeleteIcon,
  DownloadIcon,
  DuplicateFile,
  EntryPropertiesIcon,
  FolderIcon,
  LinkIcon,
  OpenEntryNativelyIcon,
  OpenFileIcon,
  OpenNewWindowIcon,
  ParentFolderIcon,
  PictureIcon,
  RenameIcon,
  ShareIcon,
  TagIcon,
} from '-/components/CommonIcons';
import TsMenuList from '-/components/TsMenuList';
import { useDeleteMultipleEntriesDialogContext } from '-/components/dialogs/hooks/useDeleteMultipleEntriesDialogContext';
import { useMenuContext } from '-/components/dialogs/hooks/useMenuContext';
import MenuKeyBinding from '-/components/menus/MenuKeyBinding';
import { TabNames } from '-/hooks/EntryPropsTabsContextProvider';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { usePlatformFacadeContext } from '-/hooks/usePlatformFacadeContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { Pro } from '-/pro';
import { getKeyBindingObject } from '-/reducers/settings';
import { supportedImgs } from '-/services/thumbsgenerator';
import {
  createNewInstance,
  getRelativeEntryPath,
  openDirectoryMessage,
} from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import { generateClipboardLink } from '-/utils/dom';
import { Menu, MenuItem } from '@mui/material';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import {
  extractContainingDirectoryPath,
  extractParentDirectoryPath,
  extractTitle,
  generateSharingLink,
} from '@tagspaces/tagspaces-common/paths';
import { useEffect, useReducer, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

interface Props {
  anchorEl: Element;
  mouseX?: number;
  mouseY?: number;
  open: boolean;
  onClose: () => void;
  reorderTop?: (entry: TS.FileSystemEntry) => void;
  reorderBottom?: (entry: TS.FileSystemEntry) => void;
  onDuplicateFile?: (fileDirPath: string) => void;
}

function FileMenu(props: Props) {
  const { reorderTop, reorderBottom, anchorEl, mouseX, mouseY, open, onClose } =
    props;

  const keyBindings = useSelector(getKeyBindingObject);
  const { t } = useTranslation();
  const {
    openAddRemoveTagsDialog,
    openMoveCopyFilesDialog,
    openRenameEntryDialog,
    openShareFilesDialog,
  } = useMenuContext();
  const { selectedEntries, lastSelectedEntry } = useSelectedEntriesContext();
  const { openDeleteMultipleEntriesDialog } =
    useDeleteMultipleEntriesDialogContext();
  const {
    setBackgroundImageChange,
    setThumbnailImageChange,
    openFileNatively,
    duplicateFile,
    setFolderBackgroundPromise,
    downloadFsEntry,
    getMetadataID,
  } = useIOActionsContext();
  const { openEntry, openedEntry, fileChanged } = useOpenedEntryContext();
  const { openDirectory, currentLocationPath, getAllPropertiesPromise } =
    useDirectoryContentContext();
  const { showNotification } = useNotificationContext();
  const { setFolderThumbnailPromise } = usePlatformFacadeContext();
  const { currentLocationId, currentLocation } = useCurrentLocationContext();
  const downloadFileUrl = useRef<string>(undefined);
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0, undefined);

  useEffect(() => {
    if (currentLocation?.haveObjectStoreSupport() && lastSelectedEntry) {
      currentLocation
        .generateURLforPath(lastSelectedEntry.path, 86400)
        .then((url) => {
          downloadFileUrl.current = url;
          forceUpdate();
        });
    }
  }, [currentLocationId, lastSelectedEntry]);

  function generateFileLink(): Promise<string> {
    const entryPath = selectedEntries[0].path;
    const relativePath = getRelativeEntryPath(currentLocationPath, entryPath);
    return getMetadataID(
      selectedEntries[0].path,
      selectedEntries[0].uuid,
      currentLocation,
    ).then((id) =>
      generateSharingLink(currentLocationId, relativePath, undefined, id),
    );
  }

  function showProperties() {
    onClose();
    if (selectedEntries && selectedEntries.length === 1) {
      openEntry(selectedEntries[0].path, TabNames.propertiesTab);
    }
  }

  function copySharingLink() {
    onClose();
    if (selectedEntries && selectedEntries.length === 1) {
      generateFileLink().then((sharingLink) => {
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
      });
    }
  }

  function showDeleteFileDialog() {
    onClose();
    openDeleteMultipleEntriesDialog();
  }

  function showRenameFileDialog() {
    onClose();
    openRenameEntryDialog();
  }

  function showMoveCopyFilesDialog() {
    onClose();
    openMoveCopyFilesDialog(selectedEntries);
  }

  function showShareFilesDialog() {
    onClose();
    openShareFilesDialog();
  }

  function setFolderThumbnail() {
    onClose();
    setFolderThumbnailPromise(lastSelectedEntry.path)
      .then((thumbPath: string) => {
        getAllPropertiesPromise(
          extractContainingDirectoryPath(lastSelectedEntry.path),
          lastSelectedEntry.locationID,
        ).then((dirEntry) => {
          setThumbnailImageChange({
            ...dirEntry,
            meta: { ...dirEntry.meta, thumbPath },
          });
        });
        //showNotification('Thumbnail created: ' + thumbPath);
        return true;
      })
      .catch((error) => {
        showNotification('Thumbnail creation failed.');
        console.log(
          'Error setting Thumb for entry: ' + lastSelectedEntry.path,
          error,
        );
        return true;
      });
  }

  async function setFolderBackground() {
    onClose();
    let path;
    if (
      currentLocation &&
      (currentLocation.haveObjectStoreSupport() ||
        currentLocation.haveWebDavSupport())
    ) {
      path = await currentLocation.generateURLforPath(
        lastSelectedEntry.path,
        604800,
      ); // 7 days
    } else {
      path = lastSelectedEntry.path;
    }

    const directoryPath = extractContainingDirectoryPath(
      lastSelectedEntry.path,
      currentLocation?.getDirSeparator(),
    );

    setFolderBackgroundPromise(path, directoryPath)
      .then((dirPath: string) => getAllPropertiesPromise(dirPath))
      .then((fsEntry: TS.FileSystemEntry) => {
        setBackgroundImageChange(fsEntry);
        showNotification('Background created for: ' + fsEntry.path);
        return true;
      })
      .catch((error) => {
        showNotification('Background creation failed.');
        console.log(
          'Error setting Background for entry: ' + lastSelectedEntry.path,
          error,
        );
        return true;
      });
  }

  function showAddRemoveTagsDialog() {
    onClose();
    if (
      openedEntry &&
      fileChanged &&
      selectedEntries &&
      selectedEntries.some((e) => e.path === openedEntry.path)
    ) {
      showNotification(
        `You can't edit tags, because '${openedEntry.path}' is opened for editing`,
        'default',
        true,
      );
      return;
    }
    openAddRemoveTagsDialog(selectedEntries);
  }

  function duplicateFileHandler() {
    onClose();
    duplicateFile(lastSelectedEntry.path);
  }

  function openParentFolderInternally() {
    onClose();
    if (lastSelectedEntry) {
      const directoryPath = extractContainingDirectoryPath(
        lastSelectedEntry.path,
        currentLocation?.getDirSeparator(),
      );
      const parentFolder = extractParentDirectoryPath(
        directoryPath,
        currentLocation?.getDirSeparator(),
      );
      return openDirectory(parentFolder);
    }
  }

  function openFile() {
    onClose();
    if (lastSelectedEntry) {
      return openEntry(lastSelectedEntry.path);
    }
  }

  function openInNewWindow() {
    onClose();
    if (selectedEntries && selectedEntries.length === 1) {
      generateFileLink().then((sharingLink) => {
        const newInstanceLink =
          window.location.href.split('?')[0] + '?' + sharingLink.split('?')[1];
        createNewInstance(newInstanceLink);
      });
    }
  }

  function openFileNativelyHandler() {
    onClose();
    if (lastSelectedEntry) {
      openFileNatively(lastSelectedEntry.path);
    }
  }

  const menuItems = [];

  const pathLowerCase = lastSelectedEntry?.path.toLowerCase();
  const isImageFile = supportedImgs.some((ext) =>
    pathLowerCase?.endsWith('.' + ext),
  );

  if (selectedEntries.length < 2) {
    menuItems.push(
      <MenuItem
        key="fileMenuOpenFile"
        data-tid="fileMenuOpenFile"
        onClick={openFile}
      >
        <ListItemIcon>
          <OpenFileIcon />
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
          <OpenEntryNativelyIcon />
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
            if (lastSelectedEntry) {
              openDirectoryMessage(lastSelectedEntry.path);
            }
          }}
        >
          <ListItemIcon>
            <FolderIcon />
          </ListItemIcon>
          <ListItemText primary={t('core:showInFileManager')} />
        </MenuItem>,
      );
    }
    menuItems.push(<Divider key={`divider-${menuItems.length}`} />);
  }
  if (!currentLocation?.isReadOnly) {
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
            reorderTop(lastSelectedEntry);
          }}
        >
          <ListItemIcon>
            <ArrowUpIcon />
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
            reorderBottom(lastSelectedEntry);
          }}
        >
          <ListItemIcon>
            <ArrowDownIcon />
          </ListItemIcon>
          <ListItemText primary={t('core:moveToBottom')} />
        </MenuItem>,
      );
    }
    menuItems.push(<Divider key={`divider-${menuItems.length}`} />);
    if (selectedEntries.length < 2) {
      menuItems.push(
        <MenuItem
          key="fileMenuRenameFile"
          data-tid="fileMenuRenameFile"
          onClick={showRenameFileDialog}
        >
          <ListItemIcon>
            <RenameIcon />
          </ListItemIcon>
          <ListItemText primary={t('core:renameFile')} />
          <MenuKeyBinding keyBinding={keyBindings['renameFile']} />
        </MenuItem>,
      );

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

    if (
      Pro &&
      currentLocation?.haveObjectStoreSupport() &&
      openShareFilesDialog
    ) {
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
          <CopyMoveIcon />
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
    menuItems.push(<Divider key={`divider-${menuItems.length}`} />);
    if (Pro && selectedEntries.length < 2) {
      menuItems.push(
        <MenuItem
          key="setAsThumbTID"
          data-tid="setAsThumbTID"
          onClick={setFolderThumbnail}
        >
          <ListItemIcon>
            <PictureIcon />
          </ListItemIcon>
          <ListItemText primary={t('core:setAsThumbnail')} />
        </MenuItem>,
      );
      if (isImageFile) {
        menuItems.push(
          <MenuItem
            key="setAsBgndTID"
            data-tid="setAsBgndTID"
            onClick={() => setFolderBackground()}
          >
            <ListItemIcon>
              <PictureIcon />
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
          if (selectedEntries && selectedEntries.length > 0) {
            const fsEntry = selectedEntries[selectedEntries.length - 1];
            currentLocation
              .checkFileEncryptedPromise(fsEntry.path)
              .then((encrypted) => {
                downloadFsEntry({ ...fsEntry, isEncrypted: encrypted });
              });
          }
          /*currentLocation
            .getPropertiesPromise(selectedFilePath)
            .then((fsEntry: TS.FileSystemEntry) => downloadFsEntry(fsEntry));*/
          /*const downloadResult = downloadFile(
            selectedFilePath,
            downloadFileUrl.current,
            currentLocation?.getDirSeparator(),
          );
          if (downloadResult === -1) {
            showNotification(t('core:cantDownloadLocalFile'));
          }*/
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
    menuItems.push(<Divider key={`divider-${menuItems.length}`} />);
    menuItems.push(
      <MenuItem
        key="showProperties"
        data-tid="showPropertiesTID"
        onClick={showProperties}
      >
        <ListItemIcon>
          <EntryPropertiesIcon />
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
      <TsMenuList>{menuItems}</TsMenuList>
    </Menu>
  );
}

export default FileMenu;
