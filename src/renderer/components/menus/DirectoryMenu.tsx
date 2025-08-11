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

import React, { useContext } from 'react';
import { Menu } from '@mui/material';
import { formatDateTime4Tag } from '@tagspaces/tagspaces-common/misc';
import AppConfig from '-/AppConfig';
import {
  extractParentDirectoryPath,
  extractDirectoryName,
  getThumbFileLocationForDirectory,
  normalizePath,
  generateSharingLink,
} from '@tagspaces/tagspaces-common/paths';
import { Pro } from '-/pro';
import {
  createNewInstance,
  getRelativeEntryPath,
  openDirectoryMessage,
} from '-/services/utils-io';
import { PerspectiveIDs } from '-/perspectives';
import TsMenuList from '-/components/TsMenuList';
import { getDirectoryMenuItems } from '-/perspectives/common/DirectoryMenuItems';
import { useTranslation } from 'react-i18next';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { useTaggingActionsContext } from '-/hooks/useTaggingActionsContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { usePlatformFacadeContext } from '-/hooks/usePlatformFacadeContext';
import { useThumbGenerationContext } from '-/hooks/useThumbGenerationContext';
import { generateClipboardLink } from '-/utils/dom';
import { useEditedEntryContext } from '-/hooks/useEditedEntryContext';
import { TS } from '-/tagspaces.namespace';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import { useCreateDirectoryDialogContext } from '-/components/dialogs/hooks/useCreateDirectoryDialogContext';
import { useProgressDialogContext } from '-/components/dialogs/hooks/useProgressDialogContext';
import { useNewFileDialogContext } from '-/components/dialogs/hooks/useNewFileDialogContext';
import { useNewAudioDialogContext } from '-/components/dialogs/hooks/useNewAudioDialogContext';
import { useProTeaserDialogContext } from '-/components/dialogs/hooks/useProTeaserDialogContext';
import { useDeleteMultipleEntriesDialogContext } from '-/components/dialogs/hooks/useDeleteMultipleEntriesDialogContext';
import { useFileUploadContext } from '-/hooks/useFileUploadContext';
import { TabNames } from '-/hooks/EntryPropsTabsContextProvider';
import { useMenuContext } from '-/components/dialogs/hooks/useMenuContext';
import { useImportMacTagDialogContext } from '-/components/dialogs/hooks/useImportMacTagDialogContext';

interface Props {
  open: boolean;
  classes?: any;
  onClose: (param?: any) => void;
  anchorEl?: Element;
  items?: React.ReactNode;
  directoryPath?: string;
  switchPerspective?: (perspectiveId: string) => void;
  perspectiveMode?: boolean;
  switchPerspectives?: boolean;
  mouseX?: number;
  mouseY?: number;
}

function DirectoryMenu(props: Props) {
  const { t } = useTranslation();
  const {
    openAddRemoveTagsDialog,
    openMoveCopyFilesDialog,
    openRenameEntryDialog,
  } = useMenuContext();
  const { openEntry } = useOpenedEntryContext();
  const { selectedEntries, setSelectedEntries } = useSelectedEntriesContext();
  const { addTags } = useTaggingActionsContext();
  const { openProgressDialog, closeProgressDialog } =
    useProgressDialogContext();
  const { openNewFileDialog } = useNewFileDialogContext();
  const { currentLocation, getLocationPath, findLocation } =
    useCurrentLocationContext();
  const { setThumbnailImageChange, getMetadataID } = useIOActionsContext();
  const { showNotification } = useNotificationContext();
  const { openFileUpload } = useFileUploadContext();
  const { openCreateDirectoryDialog } = useCreateDirectoryDialogContext();
  const {
    openDirectory,
    currentDirectoryPath,
    currentDirectoryEntries,
    setManualDirectoryPerspective,
    openCurrentDirectory,
    getAllPropertiesPromise,
  } = useDirectoryContentContext();
  const { generateThumbnails } = useThumbGenerationContext();
  const { copyFilePromise, renameFilePromise } = usePlatformFacadeContext();
  const { setReflectActions } = useEditedEntryContext();
  const { openNewAudioDialog } = useNewAudioDialogContext();
  const { openProTeaserDialog } = useProTeaserDialogContext();
  const { openImportMacTagDialog } = useImportMacTagDialogContext();
  const { openDeleteMultipleEntriesDialog } =
    useDeleteMultipleEntriesDialogContext();

  const thumbDialogContext = Pro?.contextProviders?.ThumbDialogContext
    ? useContext<TS.ThumbDialogContextData>(
        Pro.contextProviders.ThumbDialogContext,
      )
    : undefined;
  const bgndDialogContext = Pro?.contextProviders?.BgndDialogContext
    ? useContext<TS.BgndDialogContextData>(
        Pro.contextProviders.BgndDialogContext,
      )
    : undefined;

  const {
    open,
    onClose,
    anchorEl,
    mouseX,
    mouseY,
    items,
    switchPerspective,
    perspectiveMode,
    switchPerspectives,
  } = props;
  const directoryPath = props.directoryPath || currentDirectoryPath;

  function generateFolderLink(): Promise<any> {
    let locationID = undefined;
    let entryPath = currentDirectoryPath;
    if (selectedEntries && selectedEntries.length > 0) {
      if (selectedEntries[0]['locationID']) {
        locationID = selectedEntries[0]['locationID'];
      }
      entryPath = selectedEntries[0].path;
    }
    const tmpLoc = findLocation(locationID);
    return getLocationPath(tmpLoc).then((locationPath) => {
      const relativePath = getRelativeEntryPath(locationPath, entryPath);
      const folderName = extractDirectoryName(
        selectedEntries[0] ? selectedEntries[0].name : currentDirectoryPath,
        currentLocation?.getDirSeparator(),
      );
      return getMetadataID(entryPath, selectedEntries[0]?.uuid, tmpLoc).then(
        (id) => {
          return {
            url: generateSharingLink(locationID, undefined, relativePath, id),
            name: folderName,
          };
        },
      );
    });
  }

  function copySharingLink() {
    generateFolderLink().then((sharingLink) => {
      const clibboardItem = generateClipboardLink(
        sharingLink.url,
        sharingLink.name,
      );
      navigator.clipboard
        .write(clibboardItem)
        .then(() => {
          showNotification(t('core:sharingLinkCopied'));
          return true;
        })
        .catch(() => {
          showNotification(t('core:sharingLinkFailed'));
        });
    });
  }

  function openDir() {
    return openDirectory(directoryPath);
  }

  function showProperties() {
    return openEntry(directoryPath, TabNames.propertiesTab);
  }

  function perspectiveSwitch(perspectiveId) {
    if (
      Pro ||
      perspectiveId === PerspectiveIDs.GRID ||
      perspectiveId === PerspectiveIDs.LIST
    ) {
      if (switchPerspective) {
        switchPerspective(perspectiveId);
      } else {
        setManualDirectoryPerspective(perspectiveId);
      }
    } else if (perspectiveId === PerspectiveIDs.GALLERY) {
      openProTeaserDialog(PerspectiveIDs.GALLERY);
    } else if (perspectiveId === PerspectiveIDs.MAPIQUE) {
      openProTeaserDialog(PerspectiveIDs.MAPIQUE);
    } else if (perspectiveId === PerspectiveIDs.KANBAN) {
      openProTeaserDialog(PerspectiveIDs.KANBAN);
    }
  }

  function showDeleteDirectoryDialog() {
    if (!selectedEntries.some((entry) => entry.path === directoryPath)) {
      setSelectedEntries([currentLocation.toFsEntry(directoryPath, false)]);
    }
    openDeleteMultipleEntriesDialog();
  }

  function createNewFile(entryType?: TS.FileType) {
    openNewFileDialog(entryType);
  }

  function createNewAudio() {
    openNewAudioDialog();
  }

  function showInFileManager() {
    openDirectoryMessage(directoryPath);
  }

  function openInNewWindow() {
    generateFolderLink().then((sharingLink) => {
      if (sharingLink && sharingLink.url !== undefined) {
        const newInstanceLink =
          window.location.href.split('?')[0] +
          '?' +
          sharingLink.url.split('?')[1];
        createNewInstance(newInstanceLink);
      }
    });
  }

  function addExistingFile() {
    openFileUpload(directoryPath);
  }

  function importMacTags() {
    openImportMacTagDialog(directoryPath);
  }

  function onFail(message) {
    console.log('Camera Failed: ' + message);
  }

  function onCameraSuccess(imageURL) {
    window.resolveLocalFileSystemURL(
      imageURL,
      (fp) => {
        moveFile(fp.nativeURL);
      },
      () => {
        console.log('Failed to get filesystem url');
      },
    );
  }

  function moveFile(filePath) {
    const fileName =
      'IMG_TS' +
      AppConfig.beginTagContainer +
      formatDateTime4Tag(new Date(), true) +
      AppConfig.endTagContainer +
      '.jpg';
    const newFilePath =
      normalizePath(directoryPath) +
      currentLocation.getDirSeparator() +
      fileName;

    renameFilePromise(
      filePath,
      newFilePath,
      currentLocation.uuid,
      undefined,
      false,
    )
      .then((newEntry) => {
        setReflectActions({
          action: 'add',
          entry: newEntry,
        });
        showNotification(
          'File ' + newFilePath + ' successfully imported.',
          'default',
          true,
        );
        return true;
      })
      .catch((error) => {
        // TODO showAlertDialog("Saving " + filePath + " failed.");
        console.log('Save to file ' + newFilePath + ' failed ' + error);
        showNotification(
          'Importing file ' + newFilePath + ' failed.',
          'error',
          true,
        );
        return true;
      });
  }

  // function loadImageLocal() {
  //   onClose();
  //   navigator.camera.getPicture(onCameraSuccess, onFail, {
  //     destinationType: Camera.DestinationType.FILE_URI,
  //     sourceType: Camera.PictureSourceType.PHOTOLIBRARY
  //   });
  // }

  function cameraTakePicture() {
    // @ts-ignore
    navigator.camera.getPicture(onCameraSuccess, onFail, {
      // quality: 50,
      // @ts-ignore
      destinationType: Camera.DestinationType.FILE_URI, // DATA_URL, // Return base64 encoded string
      // encodingType: Camera.EncodingType.JPEG,
      // @ts-ignore
      mediaType: Camera.MediaType.PICTURE, // ALLMEDIA
    });
  }

  function setFolderThumbnail() {
    const parentDirectoryPath = extractParentDirectoryPath(
      directoryPath,
      currentLocation?.getDirSeparator(),
    );
    const parentDirectoryName = extractDirectoryName(
      parentDirectoryPath,
      currentLocation?.getDirSeparator(),
    );
    const targetThumbPath = getThumbFileLocationForDirectory(
      parentDirectoryPath,
      currentLocation?.getDirSeparator(),
    );

    copyFilePromise(
      getThumbFileLocationForDirectory(
        directoryPath,
        currentLocation?.getDirSeparator(),
      ),
      targetThumbPath,
      currentLocation.uuid,
      t('core:thumbAlreadyExists', { directoryName: parentDirectoryName }),
    )
      .then(() => {
        const entry: TS.FileSystemEntry = currentLocation.toFsEntry(
          parentDirectoryPath,
          false,
        );
        setThumbnailImageChange({
          ...entry,
          meta: { id: entry.uuid, thumbPath: targetThumbPath },
        });
        showNotification(
          'Thumbnail created for: ' + parentDirectoryPath,
          'default',
          true,
        );
        return true;
      })
      .catch((error) => {
        showNotification('Thumbnail creation failed.', 'default', true);
        console.log('Error setting Thumb for entry: ' + directoryPath, error);
        return true;
      });
  }

  function reloadDirectory() {
    if (generateThumbnails) {
      return generateThumbnails(currentDirectoryEntries).then(() =>
        openCurrentDirectory(),
      );
    } else {
      return openCurrentDirectory();
    }
  }
  function changeFolderThumbnail() {
    if (selectedEntries.length === 1) {
      thumbDialogContext.openThumbsDialog(selectedEntries[0]);
    } else {
      getAllPropertiesPromise(currentDirectoryPath).then(
        (fsEntry: TS.FileSystemEntry) =>
          thumbDialogContext.openThumbsDialog(fsEntry),
      );
    }
  }
  function changeFolderBackground() {
    if (selectedEntries.length === 1) {
      bgndDialogContext.openBgndDialog(selectedEntries[0]);
    } else {
      getAllPropertiesPromise(currentDirectoryPath).then(
        (fsEntry: TS.FileSystemEntry) =>
          bgndDialogContext.openBgndDialog(fsEntry),
      );
    }
  }

  const menuItems = items
    ? items
    : getDirectoryMenuItems(
        currentLocation,
        selectedEntries,
        perspectiveMode, // lastSelectedEntryPath !== currentDirectoryPath,
        currentLocation?.isReadOnly,
        onClose,
        t,
        openDir,
        reloadDirectory,
        openRenameEntryDialog,
        openMoveCopyFilesDialog,
        showDeleteDirectoryDialog,
        showInFileManager,
        createNewFile,
        createNewAudio,
        openCreateDirectoryDialog,
        addExistingFile,
        setFolderThumbnail,
        copySharingLink,
        importMacTags,
        switchPerspectives ? perspectiveSwitch : undefined,
        showProperties,
        cameraTakePicture,
        openAddRemoveTagsDialog,
        openInNewWindow,
        changeFolderThumbnail,
        changeFolderBackground,
      );

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorReference={mouseY && mouseX ? 'anchorPosition' : undefined}
      anchorPosition={
        mouseY && mouseX ? { top: mouseY, left: mouseX } : undefined
      }
    >
      <TsMenuList>{menuItems}</TsMenuList>
    </Menu>
  );
}

export default DirectoryMenu;
