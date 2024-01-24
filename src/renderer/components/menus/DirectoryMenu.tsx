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
import { useSelector, useDispatch } from 'react-redux';
import Menu from '@mui/material/Menu';
import { formatDateTime4Tag } from '@tagspaces/tagspaces-common/misc';
import AppConfig from '-/AppConfig';
import {
  extractContainingDirectoryPath,
  extractDirectoryName,
  getThumbFileLocationForDirectory,
  normalizePath,
  generateSharingLink,
} from '@tagspaces/tagspaces-common/paths';
import { Pro } from '-/pro';
import PlatformIO from '-/services/platform-facade';
import { actions as AppActions, AppDispatch } from '-/reducers/app';
import FileUploadContainer, {
  FileUploadContainerRef,
} from '-/components/FileUploadContainer';
import { TS } from '-/tagspaces.namespace';
import { getRelativeEntryPath, toFsEntry } from '-/services/utils-io';
import PlatformFacade from '-/services/platform-facade';
import { getDirectoryMenuItems } from '-/perspectives/common/DirectoryMenuItems';
import { getLocations } from '-/reducers/locations';
import { useTranslation } from 'react-i18next';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { useTaggingActionsContext } from '-/hooks/useTaggingActionsContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { useLocationIndexContext } from '-/hooks/useLocationIndexContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { usePlatformFacadeContext } from '-/hooks/usePlatformFacadeContext';
import { GALLERY_ID, GRID_ID, KANBAN_ID, LIST_ID, MAPIQUE_ID } from '-/const';

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
  const { currentLocation, readOnlyMode, getLocationPath } =
    useCurrentLocationContext();
  const { showNotification } = useNotificationContext();
  const {
    openDirectory,
    currentDirectoryPath,
    setDirectoryPerspective,
    openCurrentDirectory,
  } = useDirectoryContentContext();
  const { reflectCreateEntry } = useLocationIndexContext();
  const { copyFilePromise, renameFilePromise } = usePlatformFacadeContext();
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
  const locations: Array<TS.Location> = useSelector(getLocations);
  const dispatch: AppDispatch = useDispatch();

  const toggleCreateDirectoryDialog = () => {
    dispatch(AppActions.toggleCreateDirectoryDialog());
  };

  const toggleNewFileDialog = () => {
    dispatch(AppActions.toggleNewFileDialog());
  };

  const toggleProgressDialog = () => {
    dispatch(AppActions.toggleProgressDialog());
  };

  const toggleDeleteMultipleEntriesDialog = () => {
    dispatch(AppActions.toggleDeleteMultipleEntriesDialog());
  };

  const toggleProTeaser = (slidePage) => {
    dispatch(AppActions.toggleProTeaser(slidePage));
  };

  function generateFolderLink(): Promise<string> {
    let locationID = currentLocation.uuid;
    let entryPath = currentDirectoryPath;
    if (selectedEntries && selectedEntries.length > 0) {
      if (selectedEntries[0]['locationID']) {
        locationID = selectedEntries[0]['locationID'];
      }
      entryPath = selectedEntries[0].path;
    }
    const tmpLoc = locations.find((location) => location.uuid === locationID);
    return getLocationPath(tmpLoc).then((locationPath) => {
      const relativePath = getRelativeEntryPath(locationPath, entryPath);
      return generateSharingLink(locationID, undefined, relativePath);
    });
  }

  function copySharingLink() {
    //if (selectedEntries && selectedEntries.length === 1) {
    generateFolderLink().then((sharingLink) =>
      navigator.clipboard
        .writeText(sharingLink)
        .then(() => {
          showNotification(t('core:sharingLinkCopied'));
          return true;
        })
        .catch(() => {
          showNotification(t('core:sharingLinkFailed'));
        }),
    );
  }

  /*  const [
    isCreateDirectoryDialogOpened,
    setIsCreateDirectoryDialogOpened
  ] = useState(false);*/

  function openDir() {
    return openDirectory(directoryPath);
  }

  function showProperties() {
    return openEntry(directoryPath);
  }

  function perspectiveSwitch(perspectiveId) {
    if (Pro || perspectiveId === GRID_ID || perspectiveId === LIST_ID) {
      if (switchPerspective) {
        switchPerspective(perspectiveId);
      } else {
        setDirectoryPerspective(perspectiveId, undefined, true);
      }
    } else if (perspectiveId === GALLERY_ID) {
      toggleProTeaser(GALLERY_ID);
      // const openPersDocs = window.confirm(t('perspectiveInPro'));
      // if (openPersDocs) {
      //   openURLExternally(
      //     Links.documentationLinks.galleryPerspective,
      //     true
      //   );
      // }
    } else if (perspectiveId === MAPIQUE_ID) {
      toggleProTeaser(MAPIQUE_ID);
      // const openPersDocs = window.confirm(t('perspectiveInPro'));
      // if (openPersDocs) {
      //   openURLExternally(
      //     Links.documentationLinks.mapiquePerspective,
      //     true
      //   );
      // }
    } else if (perspectiveId === KANBAN_ID) {
      toggleProTeaser(KANBAN_ID);
      // const openPersDocs = window.confirm(t('perspectiveInPro'));
      // if (openPersDocs) {
      //   openURLExternally(
      //     Links.documentationLinks.kanbanPerspective,
      //     true
      //   );
      // }
    }
  }

  function showDeleteDirectoryDialog() {
    if (!selectedEntries.some((entry) => entry.path === directoryPath)) {
      setSelectedEntries([
        {
          isFile: false,
          name: directoryPath,
          path: directoryPath,
          tags: [],
          size: 0,
          lmdt: 0,
        },
      ]);
    }
    toggleDeleteMultipleEntriesDialog();
  }

  /*function showCreateDirectoryDialog() {
    setIsCreateDirectoryDialogOpened(true);
  }*/

  function createNewFile() {
    toggleNewFileDialog();
  }

  function createNewAudio() {
    dispatch(AppActions.toggleNewAudioDialog());
  }

  function showInFileManager() {
    PlatformIO.openDirectory(directoryPath);
  }

  function openInNewWindow() {
    generateFolderLink().then((sharingLink) => {
      const newInstanceLink =
        window.location.href.split('?')[0] + '?' + sharingLink.split('?')[1];
      PlatformIO.createNewInstance(newInstanceLink);
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
      toggleProgressDialog();

      const entryCallback = (entry) => {
        PlatformFacade.readMacOSTags(entry.path)
          .then((tags) => {
            if (tags.length > 0) {
              addTags([entry.path], tags, true);
            }
            return tags;
          })
          .catch((err) => {
            console.warn('Error creating tags: ' + err);
          });
      };
      Pro.MacTagsImport.importTags(directoryPath, entryCallback)
        .then(() => {
          toggleProgressDialog();
          console.log('Import tags succeeded ' + directoryPath);
          showNotification(
            'Tags from ' + directoryPath + ' are imported successfully.',
            'default',
            true,
          );
          return true;
        })
        .catch((err) => {
          console.warn('Error importing tags: ' + err);
          toggleProgressDialog();
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
      normalizePath(directoryPath) + PlatformIO.getDirSeparator() + fileName;

    renameFilePromise(filePath, newFilePath)
      .then(() => {
        showNotification(
          'File ' + newFilePath + ' successfully imported.',
          'default',
          true,
        );
        reflectCreateEntry(toFsEntry(newFilePath, true));
        dispatch(AppActions.reflectCreateEntry(newFilePath, true));
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
    const parentDirectoryPath = extractContainingDirectoryPath(
      directoryPath,
      PlatformIO.getDirSeparator(),
    );
    const parentDirectoryName = extractDirectoryName(
      parentDirectoryPath,
      PlatformIO.getDirSeparator(),
    );

    copyFilePromise(
      getThumbFileLocationForDirectory(
        directoryPath,
        PlatformIO.getDirSeparator(),
      ),
      getThumbFileLocationForDirectory(
        parentDirectoryPath,
        PlatformIO.getDirSeparator(),
      ),
      t('core:thumbAlreadyExists', { directoryName: parentDirectoryName }),
    )
      .then(() => {
        showNotification(
          'Thumbnail created for: ' + parentDirectoryPath,
          'default',
          true,
        );
        return true;
      })
      .catch((error) => {
        showNotification('Thumbnail creation failed.', 'default', true);
        console.warn('Error setting Thumb for entry: ' + directoryPath, error);
        return true;
      });
  }

  const menuItems = getDirectoryMenuItems(
    currentLocation,
    selectedEntries.length,
    perspectiveMode, // lastSelectedEntryPath !== currentDirectoryPath,
    readOnlyMode,
    onClose,
    t,
    openDir,
    openCurrentDirectory,
    openRenameDirectoryDialog,
    openMoveCopyFilesDialog,
    showDeleteDirectoryDialog,
    showInFileManager,
    createNewFile,
    createNewAudio,
    toggleCreateDirectoryDialog,
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
    <div style={{ overflowY: 'hidden' }}>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
        anchorReference={mouseY && mouseX ? 'anchorPosition' : undefined}
        anchorPosition={
          mouseY && mouseX ? { top: mouseY, left: mouseX } : undefined
        }
      >
        {menuItems}
      </Menu>
      <FileUploadContainer
        id="dirMenuId"
        ref={fileUploadContainerRef}
        directoryPath={directoryPath}
      />
    </div>
  );
}

export default DirectoryMenu;
