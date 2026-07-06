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
import AppConfig from '-/AppConfig';
import {
  extractParentDirectoryPath,
  extractDirectoryName,
  getThumbFileLocationForDirectory,
  normalizePath,
} from '@tagspaces/tagspaces-common/paths';
import { Pro } from '-/pro';
import {
  buildSharingLinkForEntry,
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
  const { openFileUpload, openCameraCapture } = useFileUploadContext();
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
  const { openDeleteMultipleEntriesDialog } =
    useDeleteMultipleEntriesDialogContext();

  const extractTagsDialogContext = Pro?.contextProviders
    ?.ExtractTagsDialogContext
    ? useContext<TS.ExtractTagsDialogContextData>(
        Pro.contextProviders.ExtractTagsDialogContext,
      )
    : undefined;

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
    const entry = selectedEntries?.[0];
    const entryPath = entry?.path || currentDirectoryPath;
    const tmpLoc = findLocation(entry?.['locationID']);
    const folderName = extractDirectoryName(
      entry ? entry.name : currentDirectoryPath,
      currentLocation?.getDirSeparator(),
    );
    const folderEntry: TS.FileSystemEntry = entry
      ? ({ ...entry, isFile: false } as TS.FileSystemEntry)
      : ({
          uuid: '',
          name: folderName,
          isFile: false,
          path: entryPath,
          extension: '',
          tags: [],
          size: 0,
          lmdt: 0,
        } as TS.FileSystemEntry);
    return buildSharingLinkForEntry(folderEntry, tmpLoc, getMetadataID).then(
      (url) => ({ url, name: folderName }),
    );
  }

  function copyRelativePath() {
    onClose();
    const entryPath =
      selectedEntries?.length > 0
        ? selectedEntries[0].path
        : currentDirectoryPath;
    const locationID = selectedEntries?.[0]?.locationID;
    const tmpLoc = findLocation(locationID);
    getLocationPath(tmpLoc).then((locationPath) => {
      const relativePath = getRelativeEntryPath(locationPath, entryPath);
      navigator.clipboard.writeText(relativePath).then(() => {
        showNotification(t('core:pathCopied'));
      });
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

  function showAddRemoveTagsDialog() {
    // Opened from the directory menu, so the action targets the current
    // folder. Fall back to it when it isn't already part of the selection,
    // otherwise the tagging dialog would open with nothing preselected.
    const entries = selectedEntries.some(
      (entry) => entry.path === directoryPath,
    )
      ? selectedEntries
      : [currentLocation.toFsEntry(directoryPath, false)];
    openAddRemoveTagsDialog(entries);
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

  // Android WebView's file chooser behind "Add files" can't open the camera,
  // so on Capacitor Android we offer a dedicated "Take picture" entry that
  // drives the native camera plugin and feeds the photo into the same upload
  // pipeline. Not offered on iOS: WKWebView's file chooser already includes
  // "Take Photo", and the camera plugin's native presentation leaves the
  // WKWebView shifted after dismissal (same bug family as native fullscreen).
  function cameraTakePicture() {
    openCameraCapture(directoryPath);
  }

  function extractTags() {
    extractTagsDialogContext?.openExtractTagsDialog(directoryPath);
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
          t('core:thumbnailCreatedFor', { path: parentDirectoryPath }),
          'default',
          true,
        );
        return true;
      })
      .catch((error) => {
        showNotification(t('core:thumbnailCreationFailed'), 'default', true);
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
        copyRelativePath,
        extractTags,
        switchPerspectives ? perspectiveSwitch : undefined,
        showProperties,
        AppConfig.isCapacitorAndroid ? cameraTakePicture : undefined,
        showAddRemoveTagsDialog,
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
