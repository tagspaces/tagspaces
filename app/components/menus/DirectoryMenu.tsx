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
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Tooltip from '@material-ui/core/Tooltip';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Divider from '@material-ui/core/Divider';
import OpenFolderIcon from '@material-ui/icons/SubdirectoryArrowLeft';
import AddExistingFileIcon from '@material-ui/icons/ExitToApp';
import ImportTagsIcon from '@material-ui/icons/FindInPage';
import OpenFolderNativelyIcon from '@material-ui/icons/Launch';
import AutoRenew from '@material-ui/icons/Autorenew';
import DefaultPerspectiveIcon from '@material-ui/icons/GridOn';
import GalleryPerspectiveIcon from '@material-ui/icons/Camera';
import MapiquePerspectiveIcon from '@material-ui/icons/Map';
import KanBanPerspectiveIcon from '@material-ui/icons/Dashboard';
import NewFileIcon from '@material-ui/icons/InsertDriveFile';
import NewFolderIcon from '@material-ui/icons/CreateNewFolder';
import RenameFolderIcon from '@material-ui/icons/FormatTextdirectionLToR';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import SettingsIcon from '@material-ui/icons/Settings';
import { Progress } from 'aws-sdk/clients/s3';
import ImageIcon from '@material-ui/icons/Image';
import { Pro } from '../../pro';
import CreateDirectoryDialog from '../dialogs/CreateDirectoryDialog';
// import RenameDirectoryDialog from '../dialogs/RenameDirectoryDialog';
import AppConfig from '-/config';
import i18n from '-/services/i18n';
import {
  extractContainingDirectoryPath,
  extractDirectoryName,
  getThumbFileLocationForDirectory,
  normalizePath
} from '-/utils/paths';
import PlatformIO from '-/services/platform-io';
import { formatDateTime4Tag } from '-/utils/misc';
import {
  actions as AppActions,
  getSelectedEntries,
  perspectives
} from '-/reducers/app';
import IOActions from '-/reducers/io-actions';
import TaggingActions from '-/reducers/tagging-actions';
import { getAllPropertiesPromise } from '-/services/utils-io';
import FileUploadContainer, {
  FileUploadContainerRef
} from '-/components/FileUploadContainer';
import { TS } from '-/tagspaces.namespace';
import { ProLabel, BetaLabel } from '-/components/HelperComponents';
import Links from '-/links';

interface Props {
  open: boolean;
  classes?: any;
  onClose: (param?: any) => void;
  anchorEl: Element;
  directoryPath: string;
  loadDirectoryContent: (path: string) => void;
  openDirectory: (path: string) => void;
  openFsEntry: (fsEntry: TS.FileSystemEntry) => void;
  reflectCreateEntry?: (path: string, isFile: boolean) => void;
  toggleCreateFileDialog?: () => void;
  uploadFilesAPI: (
    files: Array<File>,
    destination: string,
    onUploadProgress?: (progress: Progress, response: any) => void
  ) => any;
  reflectCreateEntries: (fsEntries: Array<TS.FileSystemEntry>) => void;
  onUploadProgress: (progress: Progress, response: any) => void;
  switchPerspective?: (perspectiveId: string) => void;
  setCurrentDirectoryPerspective: (perspective: string) => void;
  perspectiveMode?: boolean;
  showNotification?: (
    text: string,
    notificationType: string,
    autohide: boolean
  ) => void;
  isReadOnlyMode?: boolean;
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
  selectedEntries: Array<any>;
  setSelectedEntries: (selectedEntries: Array<Object>) => void;
  mouseX?: number;
  mouseY?: number;
  openURLExternally?: (url: string, skipConfirmation: boolean) => void;
}

const DirectoryMenu = (props: Props) => {
  const fileUploadContainerRef = useRef<FileUploadContainerRef>(null);

  const [
    isCreateDirectoryDialogOpened,
    setIsCreateDirectoryDialogOpened
  ] = useState(false);

  function reloadDirectory() {
    props.onClose();
    props.loadDirectoryContent(props.directoryPath);
  }

  function openDirectory() {
    props.onClose();
    props.loadDirectoryContent(props.directoryPath);
  }

  function showProperties() {
    props.onClose();
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
    props.onClose();
    if (Pro) {
      if (props.switchPerspective) {
        props.switchPerspective(perspectiveId);
      } else {
        props.setCurrentDirectoryPerspective(perspectiveId);
      }
    } else if (perspectiveId === perspectives.GALLERY) {
      const openPersDocs = window.confirm(
        'Gallery is part of the PRO version. Do you want to learn more about this perspective?'
      );
      if (openPersDocs) {
        props.openURLExternally(
          Links.documentationLinks.galleryPerspective,
          true
        );
      }
    } else if (perspectiveId === perspectives.MAPIQUE) {
      const openPersDocs = window.confirm(
        'Mapique is part of the PRO version. Do you want to learn more about this perspective?'
      );
      if (openPersDocs) {
        props.openURLExternally(
          Links.documentationLinks.mapiquePerspective,
          true
        );
      }
    } else if (perspectiveId === perspectives.KANBAN) {
      const openPersDocs = window.confirm(
        'Kanban is part of the PRO version. Do you want to learn more about this perspective?'
      );
      if (openPersDocs) {
        props.openURLExternally(
          Links.documentationLinks.kanbanPerspective,
          true
        );
      }
    }
  }

  function showDeleteDirectoryDialog() {
    props.onClose();
    props.setSelectedEntries([
      { isFile: false, name: props.directoryPath, path: props.directoryPath }
    ]);
    props.toggleDeleteMultipleEntriesDialog();
  }

  function showRenameDirectoryDialog() {
    props.onClose();
    props.openRenameDirectoryDialog();
  }

  function showCreateDirectoryDialog() {
    props.onClose();
    setIsCreateDirectoryDialogOpened(true);
  }

  function createNewFile() {
    props.onClose();
    props.toggleCreateFileDialog();
  }

  function showInFileManager() {
    props.onClose();
    props.openDirectory(props.directoryPath);
  }

  function addExistingFile() {
    props.onClose();
    fileUploadContainerRef.current.onFileUpload();
  }

  function importMacTags() {
    props.onClose();
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
        Pro.MacTagsImport.readMacOSTags(entry.path)
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
    props.onClose();
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
    props.onClose();
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

  const menuItems = [];

  if (props.selectedEntries.length < 2) {
    if (props.perspectiveMode) {
      menuItems.push(
        <MenuItem
          key="openDirectory"
          data-tid="openDirectory"
          onClick={openDirectory}
        >
          <ListItemIcon>
            <OpenFolderIcon />
          </ListItemIcon>
          <ListItemText primary={i18n.t('core:openDirectory')} />
        </MenuItem>
      );
    } else {
      menuItems.push(
        <MenuItem
          key="reloadDirectory"
          data-tid="reloadDirectory"
          onClick={reloadDirectory}
        >
          <ListItemIcon>
            <AutoRenew />
          </ListItemIcon>
          <ListItemText primary={i18n.t('core:reloadDirectory')} />
        </MenuItem>
      );
    }
    if (!props.isReadOnlyMode) {
      menuItems.push(
        <MenuItem
          key="renameDirectory"
          data-tid="renameDirectory"
          onClick={showRenameDirectoryDialog}
        >
          <ListItemIcon>
            <RenameFolderIcon />
          </ListItemIcon>
          <ListItemText primary={i18n.t('core:renameDirectory')} />
        </MenuItem>
      );
    }
  }

  if (!props.isReadOnlyMode) {
    menuItems.push(
      <MenuItem
        key="deleteDirectory"
        data-tid="deleteDirectory"
        onClick={showDeleteDirectoryDialog}
      >
        <ListItemIcon>
          <DeleteForeverIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:deleteDirectory')} />
      </MenuItem>
    );
  }

  if (
    props.selectedEntries.length < 2 &&
    !(PlatformIO.haveObjectStoreSupport() || AppConfig.isWeb)
  ) {
    menuItems.push(
      <MenuItem
        key="showInFileManager"
        data-tid="showInFileManager"
        onClick={showInFileManager}
      >
        <ListItemIcon>
          <OpenFolderNativelyIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:showInFileManager')} />
      </MenuItem>
    );
  }
  if (!props.perspectiveMode) {
    menuItems.push(<Divider key="divider1" />);
  }
  if (!props.isReadOnlyMode && !props.perspectiveMode) {
    menuItems.push(
      <MenuItem
        key="newSubDirectory"
        data-tid="newSubDirectory"
        onClick={showCreateDirectoryDialog}
      >
        <ListItemIcon>
          <NewFolderIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:newSubdirectory')} />
      </MenuItem>
    );
    menuItems.push(
      <MenuItem
        key="createNewFile"
        data-tid="createNewFile"
        onClick={createNewFile}
      >
        <ListItemIcon>
          <NewFileIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:newFileNote')} />
      </MenuItem>
    );
    menuItems.push(
      <MenuItem
        key="addExistingFile"
        data-tid="addExistingFile"
        onClick={addExistingFile}
      >
        <ListItemIcon>
          <AddExistingFileIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:addFiles')} />
      </MenuItem>
    );
  }
  if (Pro && props.perspectiveMode && props.selectedEntries.length < 2) {
    menuItems.push(
      <MenuItem
        key="setAsThumb"
        data-tid="setAsThumbTID"
        onClick={setFolderThumbnail}
      >
        <ListItemIcon>
          <ImageIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:setAsParentFolderThumbnail')} />
      </MenuItem>
    );
  }

  if (props.selectedEntries.length < 2 && process.platform === 'darwin') {
    menuItems.push(
      <MenuItem
        key="importMacTags"
        data-tid="importMacTags"
        onClick={importMacTags}
      >
        <ListItemIcon>
          <ImportTagsIcon />
        </ListItemIcon>
        <ListItemText
          primary={
            <>
              {i18n.t('core:importMacTags')}
              {Pro ? <BetaLabel /> : <ProLabel />}
            </>
          }
        />
      </MenuItem>
    );
  }

  if (AppConfig.isCordova) {
    // .isCordovaAndroid) {
    menuItems.push(
      <MenuItem
        key="takePicture"
        data-tid="takePicture"
        onClick={cameraTakePicture}
      >
        <ListItemIcon>
          <AddExistingFileIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:cameraTakePicture')} />
      </MenuItem>
    );
  }
  if (!props.perspectiveMode) {
    menuItems.push(<Divider key="divider2" />);
    menuItems.push(
      <MenuItem
        key="openDefaultPerspective"
        data-tid="openDefaultPerspective"
        onClick={() => switchPerspective(perspectives.DEFAULT)}
        title="Switch to default perspective"
      >
        <ListItemIcon>
          <DefaultPerspectiveIcon />
        </ListItemIcon>
        <ListItemText primary="Default Perspective" />
      </MenuItem>
    );
    menuItems.push(
      <Tooltip title="Switch to Gallery perspective">
        <MenuItem
          key="openGalleryPerspective"
          data-tid="openGalleryPerspective"
          onClick={() => switchPerspective(perspectives.GALLERY)}
        >
          <ListItemIcon>
            <GalleryPerspectiveIcon />
          </ListItemIcon>
          <ListItemText
            primary={
              <>
                Gallery Perspective
                <ProLabel />
              </>
            }
          />
        </MenuItem>
      </Tooltip>
    );
    menuItems.push(
      <Tooltip title="Switch to Mapique perspective">
        <MenuItem
          key="openMapiquePerspective"
          data-tid="openMapiquePerspective"
          onClick={() => switchPerspective(perspectives.MAPIQUE)}
        >
          <ListItemIcon>
            <MapiquePerspectiveIcon />
          </ListItemIcon>
          <ListItemText
            primary={
              <>
                Mapique Perspective
                <ProLabel />
              </>
            }
          />
        </MenuItem>
      </Tooltip>
    );
    menuItems.push(
      <Tooltip title="Switch to Kanban perspective">
        <MenuItem
          key="openKanBanPerspective"
          data-tid="openKanBanPerspectiveTID"
          onClick={() => switchPerspective(perspectives.KANBAN)}
        >
          <ListItemIcon>
            <KanBanPerspectiveIcon />
          </ListItemIcon>
          <ListItemText
            primary={
              <>
                Kanban Perspective
                {Pro ? <BetaLabel /> : <ProLabel />}
              </>
            }
          />
        </MenuItem>
      </Tooltip>
    );
  }

  if (props.selectedEntries.length < 2) {
    menuItems.push(<Divider key="divider3" />);
    menuItems.push(
      <MenuItem
        key="showProperties"
        data-tid="showProperties"
        onClick={showProperties}
      >
        <ListItemIcon>
          <SettingsIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:directoryPropertiesTitle')} />
      </MenuItem>
    );
  }

  return (
    <div style={{ overflowY: 'hidden' }}>
      {isCreateDirectoryDialogOpened && ( // TODO move dialogs in MainContainer and don't include the Menu HTML always
        <CreateDirectoryDialog
          key={'createDir' + props.directoryPath}
          open={isCreateDirectoryDialogOpened}
          onClose={() => setIsCreateDirectoryDialogOpened(false)}
          selectedDirectoryPath={props.directoryPath}
        />
      )}
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
};

function mapStateToProps(state) {
  return {
    selectedEntries: getSelectedEntries(state)
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      showNotification: AppActions.showNotification,
      onUploadProgress: AppActions.onUploadProgress,
      toggleUploadDialog: AppActions.toggleUploadDialog,
      toggleProgressDialog: AppActions.toggleProgressDialog,
      toggleCreateFileDialog: AppActions.toggleCreateFileDialog,
      resetProgress: AppActions.resetProgress,
      reflectCreateEntries: AppActions.reflectCreateEntries,
      setCurrentDirectoryPerspective: AppActions.setCurrentDirectoryPerspective,
      extractContent: IOActions.extractContent,
      uploadFilesAPI: IOActions.uploadFilesAPI,
      addTags: TaggingActions.addTags,
      toggleDeleteMultipleEntriesDialog:
        AppActions.toggleDeleteMultipleEntriesDialog,
      setSelectedEntries: AppActions.setSelectedEntries,
      openURLExternally: AppActions.openURLExternally
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(DirectoryMenu);
