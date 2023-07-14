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

import React, { useRef, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Menu from '@mui/material/Menu';
import { Progress } from 'aws-sdk/clients/s3';
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
  toggleNewFileDialog?: () => void;
  uploadFilesAPI: (
    files: Array<File>,
    destination: string,
    onUploadProgress?: (progress: Progress, response: any) => void
  ) => any;
  reflectCreateEntries: (fsEntries: Array<TS.FileSystemEntry>) => void;
  onUploadProgress: (progress: Progress, response: any) => void;
  switchPerspective?: (perspectiveId: string) => void;
  toggleProTeaser?: (slidePage?: string) => void;
  setCurrentDirectoryPerspective: (perspective: string) => void;
  perspectiveMode?: boolean;
  showNotification?: (
    text: string,
    notificationType?: string,
    autohide?: boolean
  ) => void;
  toggleUploadDialog: () => void;
  toggleProgressDialog: () => void;
  resetProgress: () => void;
  addTags: (
    paths: Array<string>,
    tags: Array<TS.Tag>,
    updateIndex: boolean
  ) => void;
  toggleDeleteMultipleEntriesDialog: () => void;
  openRenameDirectoryDialog: () => void;
  openMoveCopyFilesDialog: () => void;
  selectedEntries: Array<TS.FileSystemEntry>;
  currentDirectoryPath: string;
  lastSelectedEntryPath: string;
  isReadOnlyMode: boolean;
  setSelectedEntries: (selectedEntries: Array<TS.FileSystemEntry>) => void;
  mouseX?: number;
  mouseY?: number;
  currentLocation?: TS.Location;
  locations?: Array<TS.Location>;
  toggleCreateDirectoryDialog: () => void;
}

function DirectoryMenu(props: Props) {
  const fileUploadContainerRef = useRef<FileUploadContainerRef>(null);

  const {
    selectedEntries,
    currentLocation,
    locations,
    toggleProTeaser,
    showNotification
  } = props;

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
    props.loadDirectoryContent(props.directoryPath, true, true);
  }

  function openDirectory() {
    props.loadDirectoryContent(props.directoryPath, true, true);
  }

  function showProperties() {
    getAllPropertiesPromise(props.directoryPath)
      .then((fsEntry: TS.FileSystemEntry) => {
        props.openFsEntry(fsEntry);
        return true;
      })
      .catch(error =>
        console.warn(
          'Error getting properties for entry: ' +
            props.directoryPath +
            ' - ' +
            error
        )
      );
  }

  function switchPerspective(perspectiveId) {
    if (
      Pro ||
      perspectiveId === PerspectiveIDs.GRID ||
      perspectiveId === PerspectiveIDs.LIST
    ) {
      if (props.switchPerspective) {
        props.switchPerspective(perspectiveId);
      } else {
        props.setCurrentDirectoryPerspective(perspectiveId);
      }
    } else if (perspectiveId === PerspectiveIDs.GALLERY) {
      toggleProTeaser(PerspectiveIDs.GALLERY);
      // const openPersDocs = window.confirm(i18n.t('perspectiveInPro'));
      // if (openPersDocs) {
      //   props.openURLExternally(
      //     Links.documentationLinks.galleryPerspective,
      //     true
      //   );
      // }
    } else if (perspectiveId === PerspectiveIDs.MAPIQUE) {
      toggleProTeaser(PerspectiveIDs.MAPIQUE);
      // const openPersDocs = window.confirm(i18n.t('perspectiveInPro'));
      // if (openPersDocs) {
      //   props.openURLExternally(
      //     Links.documentationLinks.mapiquePerspective,
      //     true
      //   );
      // }
    } else if (perspectiveId === PerspectiveIDs.KANBAN) {
      toggleProTeaser(PerspectiveIDs.KANBAN);
      // const openPersDocs = window.confirm(i18n.t('perspectiveInPro'));
      // if (openPersDocs) {
      //   props.openURLExternally(
      //     Links.documentationLinks.kanbanPerspective,
      //     true
      //   );
      // }
    }
  }

  function showDeleteDirectoryDialog() {
    props.setSelectedEntries([
      {
        isFile: false,
        name: props.directoryPath,
        path: props.directoryPath,
        tags: [],
        size: 0,
        lmdt: 0
      }
    ]);
    props.toggleDeleteMultipleEntriesDialog();
  }

  function showRenameDirectoryDialog() {
    props.openRenameDirectoryDialog();
  }

  function openMoveCopyDialog() {
    props.openMoveCopyFilesDialog();
  }

  /*function showCreateDirectoryDialog() {
    setIsCreateDirectoryDialogOpened(true);
  }*/

  function createNewFile() {
    props.toggleNewFileDialog();
  }

  function showInFileManager() {
    props.openDirectory(props.directoryPath);
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
      props.toggleProgressDialog();

      const entryCallback = entry => {
        PlatformFacade.readMacOSTags(entry.path)
          .then(tags => {
            if (tags.length > 0) {
              props.addTags([entry.path], tags, true);
            }
            return tags;
          })
          .catch(err => {
            console.warn('Error creating tags: ' + err);
          });
      };
      Pro.MacTagsImport.importTags(props.directoryPath, entryCallback)
        .then(() => {
          // props.loadDirectoryContent(props.directoryPath); // TODO after first import tags is not imported without reloadDirContent
          props.toggleProgressDialog();
          console.log('Import tags succeeded ' + props.directoryPath);
          props.showNotification(
            'Tags from ' + props.directoryPath + ' are imported successfully.',
            'default',
            true
          );
          return true;
        })
        .catch(err => {
          console.warn('Error importing tags: ' + err);
          props.toggleProgressDialog();
        });
    } else {
      props.showNotification(
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
      normalizePath(props.directoryPath) +
      PlatformIO.getDirSeparator() +
      fileName;

    PlatformIO.renameFilePromise(filePath, newFilePath)
      .then(() => {
        props.showNotification(
          'File ' + newFilePath + ' successfully imported.',
          'default',
          true
        );
        props.reflectCreateEntry(newFilePath, true);
        return true;
      })
      .catch(error => {
        // TODO showAlertDialog("Saving " + filePath + " failed.");
        console.error('Save to file ' + newFilePath + ' failed ' + error);
        props.showNotification(
          'Importing file ' + newFilePath + ' failed.',
          'error',
          true
        );
        return true;
      });
  }

  // function loadImageLocal() {
  //   props.onClose();
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
      props.directoryPath,
      PlatformIO.getDirSeparator()
    );
    const parentDirectoryName = extractDirectoryName(
      parentDirectoryPath,
      PlatformIO.getDirSeparator()
    );

    PlatformIO.copyFilePromise(
      getThumbFileLocationForDirectory(
        props.directoryPath,
        PlatformIO.getDirSeparator()
      ),
      getThumbFileLocationForDirectory(
        parentDirectoryPath,
        PlatformIO.getDirSeparator()
      ),
      i18n.t('core:thumbAlreadyExists', { directoryName: parentDirectoryName })
    )
      .then(() => {
        props.showNotification(
          'Thumbnail created for: ' + parentDirectoryPath,
          'default',
          true
        );
        return true;
      })
      .catch(error => {
        props.showNotification('Thumbnail creation failed.', 'default', true);
        console.warn(
          'Error setting Thumb for entry: ' + props.directoryPath,
          error
        );
        return true;
      });
  }

  const menuItems = getDirectoryMenuItems(
    currentLocation,
    props.selectedEntries.length,
    props.lastSelectedEntryPath !== props.currentDirectoryPath,
    props.isReadOnlyMode,
    props.onClose,
    openDirectory,
    reloadDirectory,
    showRenameDirectoryDialog,
    openMoveCopyDialog,
    showDeleteDirectoryDialog,
    showInFileManager,
    createNewFile,
    props.toggleCreateDirectoryDialog,
    addExistingFile,
    setFolderThumbnail,
    copySharingLink,
    importMacTags,
    switchPerspective,
    showProperties,
    cameraTakePicture,
    props.openAddRemoveTagsDialog,
    openInNewWindow
  );

  return (
    <div style={{ overflowY: 'hidden' }}>
      <Menu
        anchorEl={props.anchorEl}
        open={props.open}
        onClose={props.onClose}
        anchorReference={
          props.mouseY && props.mouseX ? 'anchorPosition' : undefined
        }
        anchorPosition={
          props.mouseY && props.mouseX
            ? { top: props.mouseY, left: props.mouseX }
            : undefined
        }
      >
        {menuItems}
      </Menu>
      <FileUploadContainer
        ref={fileUploadContainerRef}
        directoryPath={props.directoryPath}
        onUploadProgress={props.onUploadProgress}
        toggleUploadDialog={props.toggleUploadDialog}
        toggleProgressDialog={props.toggleProgressDialog}
        resetProgress={props.resetProgress}
        reflectCreateEntries={props.reflectCreateEntries}
        uploadFilesAPI={props.uploadFilesAPI}
      />
    </div>
  );
}

function mapStateToProps(state) {
  return {
    selectedEntries: getSelectedEntries(state),
    currentDirectoryPath: getDirectoryPath(state),
    lastSelectedEntryPath: getLastSelectedEntryPath(state),
    isReadOnlyMode: isReadOnlyMode(state)
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      showNotification: AppActions.showNotification,
      onUploadProgress: AppActions.onUploadProgress,
      toggleUploadDialog: AppActions.toggleUploadDialog,
      toggleProgressDialog: AppActions.toggleProgressDialog,
      toggleNewFileDialog: AppActions.toggleNewFileDialog,
      toggleCreateDirectoryDialog: AppActions.toggleCreateDirectoryDialog,
      toggleProTeaser: AppActions.toggleProTeaser,
      resetProgress: AppActions.resetProgress,
      reflectCreateEntries: AppActions.reflectCreateEntries,
      setCurrentDirectoryPerspective: AppActions.setCurrentDirectoryPerspective,
      extractContent: IOActions.extractContent,
      uploadFilesAPI: IOActions.uploadFilesAPI,
      addTags: TaggingActions.addTags,
      toggleDeleteMultipleEntriesDialog:
        AppActions.toggleDeleteMultipleEntriesDialog,
      setSelectedEntries: AppActions.setSelectedEntries
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(DirectoryMenu);
