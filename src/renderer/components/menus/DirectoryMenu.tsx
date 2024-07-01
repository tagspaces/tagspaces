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

import React, { useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Menu, MenuList } from '@mui/material';
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
import { actions as AppActions, AppDispatch } from '-/reducers/app';
import FileUploadContainer, {
  FileUploadContainerRef,
} from '-/components/FileUploadContainer';
import {
  createNewInstance,
  getRelativeEntryPath,
  openDirectoryMessage,
  readMacOSTags,
} from '-/services/utils-io';
import { PerspectiveIDs } from '-/perspectives';
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

interface Props {
  open: boolean;
  classes?: any;
  onClose: (param?: any) => void;
  anchorEl: Element;
  directoryPath: string;
  openAddRemoveTagsDialog?: () => void;
  switchPerspective?: (perspectiveId: string) => void;
  perspectiveMode?: boolean;
  openRenameDirectoryDialog: () => void;
  openMoveCopyFilesDialog?: () => void;
  mouseX?: number;
  mouseY?: number;
}

function DirectoryMenu(props: Props) {
  const { t } = useTranslation();
  const { openEntry } = useOpenedEntryContext();
  const { selectedEntries, setSelectedEntries } = useSelectedEntriesContext();
  const { addTags } = useTaggingActionsContext();
  const { openProgressDialog } = useProgressDialogContext();
  const { openNewFileDialog } = useNewFileDialogContext();
  const { currentLocation, readOnlyMode, getLocationPath, findLocation } =
    useCurrentLocationContext();
  const { setThumbnailImageChange } = useIOActionsContext();
  const { showNotification } = useNotificationContext();
  const { openCreateDirectoryDialog } = useCreateDirectoryDialogContext();
  const {
    openDirectory,
    currentDirectoryPath,
    currentDirectoryEntries,
    setManualDirectoryPerspective,
    openCurrentDirectory,
  } = useDirectoryContentContext();
  const { generateThumbnails } = useThumbGenerationContext();
  const { copyFilePromise, renameFilePromise } = usePlatformFacadeContext();
  const { setReflectActions } = useEditedEntryContext();
  const { openNewAudioDialog } = useNewAudioDialogContext();
  const { openProTeaserDialog } = useProTeaserDialogContext();
  const { openDeleteMultipleEntriesDialog } =
    useDeleteMultipleEntriesDialogContext();
  const fileUploadContainerRef = useRef<FileUploadContainerRef>(null);
  const {
    open,
    onClose,
    anchorEl,
    mouseX,
    mouseY,
    openAddRemoveTagsDialog,
    openMoveCopyFilesDialog,
    openRenameDirectoryDialog,
    switchPerspective,
    perspectiveMode,
  } = props;
  const directoryPath = props.directoryPath || currentDirectoryPath;

  function generateFolderLink(): Promise<any> {
    let locationID = currentLocation.uuid;
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
        selectedEntries[0].name,
        currentLocation?.getDirSeparator(),
      );
      return {
        url: generateSharingLink(locationID, undefined, relativePath),
        name: folderName,
      };
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
    return openEntry(directoryPath);
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

  function createNewFile() {
    openNewFileDialog();
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
    fileUploadContainerRef.current.onFileUpload();
  }

  function importMacTags() {
    if (Pro && Pro.MacTagsImport && Pro.MacTagsImport.importTags) {
      if (
        !confirm(`Experimental feature\n
Depending on how many tags you have in your current directory, the tag extraction process may take a long time in which the application's user interface may appear as blocked.\n
Do you want to continue?`)
      ) {
        return false;
      }
      openProgressDialog();

      const entryCallback = (entry) => {
        readMacOSTags(entry.path)
          .then((tags) => {
            if (tags.length > 0) {
              addTags([entry.path], tags);
            }
            return tags;
          })
          .catch((err) => {
            console.log('Error creating tags: ' + err);
          });
      };
      Pro.MacTagsImport.importTags(
        directoryPath,
        currentLocation.listDirectoryPromise,
        entryCallback,
      )
        .then(() => {
          openProgressDialog();
          console.log('Import tags succeeded ' + directoryPath);
          showNotification(
            'Tags from ' + directoryPath + ' are imported successfully.',
            'default',
            true,
          );
          return true;
        })
        .catch((err) => {
          console.log('Error importing tags: ' + err);
          openProgressDialog();
        });
    } else {
      showNotification(
        t('core:thisFunctionalityIsAvailableInPro'),
        'default',
        true,
      );
      return true;
    }
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

  const menuItems = getDirectoryMenuItems(
    currentLocation,
    selectedEntries.length,
    perspectiveMode, // lastSelectedEntryPath !== currentDirectoryPath,
    readOnlyMode,
    onClose,
    t,
    openDir,
    reloadDirectory,
    openRenameDirectoryDialog,
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
    perspectiveSwitch,
    showProperties,
    cameraTakePicture,
    openAddRemoveTagsDialog,
    openInNewWindow,
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
      <MenuList>{menuItems}</MenuList>
      <FileUploadContainer
        id="dirMenuId"
        ref={fileUploadContainerRef}
        directoryPath={directoryPath}
      />
    </Menu>
  );
}

export default DirectoryMenu;
