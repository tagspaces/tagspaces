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
  generateSharingLink
} from '@tagspaces/tagspaces-common/paths';
import { Pro } from '-/pro';
import i18n from '-/services/i18n';
import PlatformIO from '-/services/platform-facade';
import {
  actions as AppActions,
  AppDispatch,
  getDirectoryPath,
  getLastSelectedEntryPath,
  getSelectedEntries,
  isReadOnlyMode
} from '-/reducers/app';
import IOActions from '-/reducers/io-actions';
import TaggingActions from '-/reducers/tagging-actions';
import { getAllPropertiesPromise } from '-/services/utils-io';
import FileUploadContainer, {
  FileUploadContainerRef
} from '-/components/FileUploadContainer';
import { TS } from '-/tagspaces.namespace';
import { getRelativeEntryPath } from '-/services/utils-io';
import { PerspectiveIDs } from '-/perspectives';
import PlatformFacade from '-/services/platform-facade';
import { getDirectoryMenuItems } from '-/perspectives/common/DirectoryMenuItems';
import { getLocations } from "-/reducers/locations";

interface Props {
  open: boolean;
  classes?: any;
  onClose: (param?: any) => void;
  anchorEl: Element;
  directoryPath: string;
  loadDirectoryContent: (
    path: string,
    generateThumbnails: boolean,
    loadDirMeta?: boolean
  ) => void;
  openDirectory: (path: string) => void;
  openFsEntry: (fsEntry: TS.FileSystemEntry) => void;
  openAddRemoveTagsDialog?: () => void;
  reflectCreateEntry?: (path: string, isFile: boolean) => void;
  switchPerspective?: (perspectiveId: string) => void;
  perspectiveMode?: boolean;
  openRenameDirectoryDialog: () => void;
  openMoveCopyFilesDialog: () => void;
  mouseX?: number;
  mouseY?: number;
  currentLocation?: TS.Location;
}

function DirectoryMenu(props: Props) {
  const fileUploadContainerRef = useRef<FileUploadContainerRef>(null);
  const {
    open,
    onClose,
    anchorEl,
    mouseX,
    mouseY,
    directoryPath,
    currentLocation,
    openAddRemoveTagsDialog,
    openMoveCopyFilesDialog,
    openRenameDirectoryDialog
  } = props;

  const selectedEntries: Array<TS.FileSystemEntry> = useSelector(
    getSelectedEntries
  );
  const locations: Array<TS.Location> = useSelector(getLocations);
  const currentDirectoryPath = useSelector(getDirectoryPath);
  const lastSelectedEntryPath = useSelector(getLastSelectedEntryPath);
  const readOnlyMode = useSelector(isReadOnlyMode);
  const dispatch: AppDispatch = useDispatch();

  const loadDirectoryContent = (path, generateThumbnails, loadDirMeta) => {
    dispatch(
      AppActions.loadDirectoryContent(path, generateThumbnails, loadDirMeta)
    );
  };

  const toggleCreateDirectoryDialog = () => {
    dispatch(AppActions.toggleCreateDirectoryDialog());
  };

  const openFsEntry = fsEntry => {
    dispatch(AppActions.openFsEntry(fsEntry));
  };

  const reflectCreateEntry = (path, isFile) => {
    dispatch(AppActions.reflectCreateEntry(path, isFile));
  };

  const toggleNewFileDialog = () => {
    dispatch(AppActions.toggleNewFileDialog());
  };

  const uploadFilesAPI = (files, destination, onUploadProgress) => {
    dispatch(IOActions.uploadFilesAPI(files, destination, onUploadProgress));
  };

  const reflectCreateEntries = fsEntries => {
    dispatch(AppActions.reflectCreateEntries(fsEntries));
  };

  const onUploadProgress = (progress, response) => {
    dispatch(AppActions.onUploadProgress(progress, response));
  };

  const toggleUploadDialog = () => {
    dispatch(AppActions.toggleUploadDialog());
  };

  const toggleProgressDialog = () => {
    dispatch(AppActions.toggleProgressDialog());
  };

  const resetProgress = () => {
    dispatch(AppActions.resetProgress());
  };

  const addTags = (paths, tags, updateIndex) => {
    dispatch(TaggingActions.addTags(paths, tags, updateIndex));
  };

  const toggleDeleteMultipleEntriesDialog = () => {
    dispatch(AppActions.toggleDeleteMultipleEntriesDialog());
  };

  const setSelectedEntries = selectedEntries => {
    dispatch(AppActions.setSelectedEntries(selectedEntries));
  };

  const showNotification = (text, notificationType?, autohide?) => {
    dispatch(AppActions.showNotification(text, notificationType, autohide));
  };

  const toggleProTeaser = slidePage => {
    dispatch(AppActions.toggleProTeaser(slidePage));
  };

  const setCurrentDirectoryPerspective = perspective => {
    dispatch(AppActions.setCurrentDirectoryPerspective(perspective));
  };

  function generateFolderLink() {
    const entryFromIndex = selectedEntries[0]['locationID'];
    const locationID = entryFromIndex
      ? selectedEntries[0]['locationID']
      : currentLocation.uuid;
    const entryPath = selectedEntries[0].path;
    const tmpLoc = locations.find(location => location.uuid === locationID);
    const relativePath = getRelativeEntryPath(tmpLoc, entryPath);
    return generateSharingLink(locationID, undefined, relativePath);
  }

  function copySharingLink() {
    if (selectedEntries && selectedEntries.length === 1) {
      const sharingLink = generateFolderLink();
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

  /*  const [
    isCreateDirectoryDialogOpened,
    setIsCreateDirectoryDialogOpened
  ] = useState(false);*/

  function reloadDirectory() {
    loadDirectoryContent(directoryPath, true, true);
  }

  function openDirectory() {
    loadDirectoryContent(directoryPath, true, true);
  }

  function showProperties() {
    getAllPropertiesPromise(directoryPath)
      .then((fsEntry: TS.FileSystemEntry) => {
        openFsEntry(fsEntry);
        return true;
      })
      .catch(error =>
        console.warn(
          'Error getting properties for entry: ' + directoryPath + ' - ' + error
        )
      );
  }

  function switchPerspective(perspectiveId) {
    if (
      Pro ||
      perspectiveId === PerspectiveIDs.GRID ||
      perspectiveId === PerspectiveIDs.LIST
    ) {
      if (switchPerspective) {
        switchPerspective(perspectiveId);
      } else {
        setCurrentDirectoryPerspective(perspectiveId);
      }
    } else if (perspectiveId === PerspectiveIDs.GALLERY) {
      toggleProTeaser(PerspectiveIDs.GALLERY);
      // const openPersDocs = window.confirm(i18n.t('perspectiveInPro'));
      // if (openPersDocs) {
      //   openURLExternally(
      //     Links.documentationLinks.galleryPerspective,
      //     true
      //   );
      // }
    } else if (perspectiveId === PerspectiveIDs.MAPIQUE) {
      toggleProTeaser(PerspectiveIDs.MAPIQUE);
      // const openPersDocs = window.confirm(i18n.t('perspectiveInPro'));
      // if (openPersDocs) {
      //   openURLExternally(
      //     Links.documentationLinks.mapiquePerspective,
      //     true
      //   );
      // }
    } else if (perspectiveId === PerspectiveIDs.KANBAN) {
      toggleProTeaser(PerspectiveIDs.KANBAN);
      // const openPersDocs = window.confirm(i18n.t('perspectiveInPro'));
      // if (openPersDocs) {
      //   openURLExternally(
      //     Links.documentationLinks.kanbanPerspective,
      //     true
      //   );
      // }
    }
  }

  function showDeleteDirectoryDialog() {
    setSelectedEntries([
      {
        isFile: false,
        name: directoryPath,
        path: directoryPath,
        tags: [],
        size: 0,
        lmdt: 0
      }
    ]);
    toggleDeleteMultipleEntriesDialog();
  }

  /*function showCreateDirectoryDialog() {
    setIsCreateDirectoryDialogOpened(true);
  }*/

  function createNewFile() {
    toggleNewFileDialog();
  }

  function showInFileManager() {
    dispatch(AppActions.openDirectory(directoryPath));
  }

  function openInNewWindow() {
    // onClose();
    if (selectedEntries && selectedEntries.length === 1) {
      const sharingLink = generateFolderLink();
      const newInstanceLink =
        window.location.href.split('?')[0] + '?' + sharingLink.split('?')[1];
      PlatformIO.createNewInstance(newInstanceLink);
    }
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

      const entryCallback = entry => {
        PlatformFacade.readMacOSTags(entry.path)
          .then(tags => {
            if (tags.length > 0) {
              addTags([entry.path], tags, true);
            }
            return tags;
          })
          .catch(err => {
            console.warn('Error creating tags: ' + err);
          });
      };
      Pro.MacTagsImport.importTags(directoryPath, entryCallback)
        .then(() => {
          // loadDirectoryContent(directoryPath); // TODO after first import tags is not imported without reloadDirContent
          toggleProgressDialog();
          console.log('Import tags succeeded ' + directoryPath);
          showNotification(
            'Tags from ' + directoryPath + ' are imported successfully.',
            'default',
            true
          );
          return true;
        })
        .catch(err => {
          console.warn('Error importing tags: ' + err);
          toggleProgressDialog();
        });
    } else {
      showNotification(
        i18n.t('core:thisFunctionalityIsAvailableInPro'),
        'default',
        true
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
      fp => {
        moveFile(fp.nativeURL);
      },
      () => {
        console.log('Failed to get filesystem url');
      }
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

    PlatformIO.renameFilePromise(filePath, newFilePath)
      .then(() => {
        showNotification(
          'File ' + newFilePath + ' successfully imported.',
          'default',
          true
        );
        reflectCreateEntry(newFilePath, true);
        return true;
      })
      .catch(error => {
        // TODO showAlertDialog("Saving " + filePath + " failed.");
        console.error('Save to file ' + newFilePath + ' failed ' + error);
        showNotification(
          'Importing file ' + newFilePath + ' failed.',
          'error',
          true
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
      mediaType: Camera.MediaType.PICTURE // ALLMEDIA
    });
  }

  function setFolderThumbnail() {
    const parentDirectoryPath = extractContainingDirectoryPath(
      directoryPath,
      PlatformIO.getDirSeparator()
    );
    const parentDirectoryName = extractDirectoryName(
      parentDirectoryPath,
      PlatformIO.getDirSeparator()
    );

    PlatformIO.copyFilePromise(
      getThumbFileLocationForDirectory(
        directoryPath,
        PlatformIO.getDirSeparator()
      ),
      getThumbFileLocationForDirectory(
        parentDirectoryPath,
        PlatformIO.getDirSeparator()
      ),
      i18n.t('core:thumbAlreadyExists', { directoryName: parentDirectoryName })
    )
      .then(() => {
        showNotification(
          'Thumbnail created for: ' + parentDirectoryPath,
          'default',
          true
        );
        return true;
      })
      .catch(error => {
        showNotification('Thumbnail creation failed.', 'default', true);
        console.warn('Error setting Thumb for entry: ' + directoryPath, error);
        return true;
      });
  }

  const menuItems = getDirectoryMenuItems(
    currentLocation,
    selectedEntries.length,
    lastSelectedEntryPath !== currentDirectoryPath,
    readOnlyMode,
    onClose,
    openDirectory,
    reloadDirectory,
    openRenameDirectoryDialog,
    openMoveCopyFilesDialog,
    showDeleteDirectoryDialog,
    showInFileManager,
    createNewFile,
    toggleCreateDirectoryDialog,
    addExistingFile,
    setFolderThumbnail,
    copySharingLink,
    importMacTags,
    switchPerspective,
    showProperties,
    cameraTakePicture,
    openAddRemoveTagsDialog,
    openInNewWindow
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
        ref={fileUploadContainerRef}
        directoryPath={directoryPath}
        onUploadProgress={onUploadProgress}
        toggleUploadDialog={toggleUploadDialog}
        toggleProgressDialog={toggleProgressDialog}
        resetProgress={resetProgress}
        reflectCreateEntries={reflectCreateEntries}
        uploadFilesAPI={uploadFilesAPI}
      />
    </div>
  );
}

export default DirectoryMenu;
