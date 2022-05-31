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
import NewFileIcon from '@material-ui/icons/InsertDriveFile';
import ShareIcon from '@material-ui/icons/Link';
import RenameFolderIcon from '@material-ui/icons/FormatTextdirectionLToR';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import NewFolderIcon from '@material-ui/icons/CreateNewFolder';
import PropertiesIcon from '@material-ui/icons/Info';
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
  normalizePath,
  generateSharingLink
} from '-/utils/paths';
import PlatformIO from '-/services/platform-facade';
import { formatDateTime4Tag } from '-/utils/misc';
import { actions as AppActions, getSelectedEntries } from '-/reducers/app';
import IOActions from '-/reducers/io-actions';
import TaggingActions from '-/reducers/tagging-actions';
import { getAllPropertiesPromise } from '-/services/utils-io';
import FileUploadContainer, {
  FileUploadContainerRef
} from '-/components/FileUploadContainer';
import { TS } from '-/tagspaces.namespace';
import { ProLabel, BetaLabel } from '-/components/HelperComponents';
import Links from '-/links';
import { PerspectiveIDs, AvailablePerspectives } from '-/perspectives';

interface Props {
  open: boolean;
  classes?: any;
  onClose: (param?: any) => void;
  anchorEl: Element;
  directoryPath: string;
  loadDirectoryContent: (path: string, generateThumbnails: boolean) => void;
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
    notificationType?: string,
    autohide?: boolean
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
  currentLocation?: TS.Location;
  locations?: Array<TS.Location>;
}

const DirectoryMenu = (props: Props) => {
  const fileUploadContainerRef = useRef<FileUploadContainerRef>(null);

  const {
    selectedEntries,
    isReadOnlyMode,
    currentLocation,
    locations,
    showNotification,
    onClose
  } = props;

  function copySharingLink() {
    onClose();
    if (selectedEntries.length === 1) {
      const entryFromIndex = selectedEntries[0].locationID;
      const locationID = entryFromIndex
        ? selectedEntries[0].locationID
        : currentLocation.uuid;
      let relativePath = selectedEntries[0].path;
      const tmpLoc = locations.find(location => location.uuid === locationID);
      const locationPath = tmpLoc.path;
      if (
        locationPath &&
        relativePath &&
        relativePath.startsWith(locationPath)
      ) {
        // remove location path from entry path if possible
        relativePath = relativePath.substr(locationPath.length);
      }
      const sharingLink = generateSharingLink(
        locationID,
        undefined,
        relativePath
      );
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

  const [
    isCreateDirectoryDialogOpened,
    setIsCreateDirectoryDialogOpened
  ] = useState(false);

  function reloadDirectory() {
    onClose();
    props.loadDirectoryContent(props.directoryPath, true);
  }

  function openDirectory() {
    onClose();
    props.loadDirectoryContent(props.directoryPath, true);
  }

  function showProperties() {
    onClose();
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
    onClose();
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
      const openPersDocs = window.confirm(i18n.t('perspectiveInPro'));
      if (openPersDocs) {
        props.openURLExternally(
          Links.documentationLinks.galleryPerspective,
          true
        );
      }
    } else if (perspectiveId === PerspectiveIDs.MAPIQUE) {
      const openPersDocs = window.confirm(i18n.t('perspectiveInPro'));
      if (openPersDocs) {
        props.openURLExternally(
          Links.documentationLinks.mapiquePerspective,
          true
        );
      }
    } else if (perspectiveId === PerspectiveIDs.KANBAN) {
      const openPersDocs = window.confirm(i18n.t('perspectiveInPro'));
      if (openPersDocs) {
        props.openURLExternally(
          Links.documentationLinks.kanbanPerspective,
          true
        );
      }
    } else if (perspectiveId === PerspectiveIDs.WIKI) {
      const openPersDocs = window.confirm(i18n.t('perspectiveInPro'));
      if (openPersDocs) {
        props.openURLExternally(
          Links.documentationLinks.kanbanPerspective,
          true
        );
      }
    }
  }

  function showDeleteDirectoryDialog() {
    onClose();
    props.setSelectedEntries([
      { isFile: false, name: props.directoryPath, path: props.directoryPath }
    ]);
    props.toggleDeleteMultipleEntriesDialog();
  }

  function showRenameDirectoryDialog() {
    onClose();
    props.openRenameDirectoryDialog();
  }

  function showCreateDirectoryDialog() {
    onClose();
    setIsCreateDirectoryDialogOpened(true);
  }

  function createNewFile() {
    onClose();
    props.toggleCreateFileDialog();
  }

  function showInFileManager() {
    onClose();
    props.openDirectory(props.directoryPath);
  }

  function addExistingFile() {
    onClose();
    fileUploadContainerRef.current.onFileUpload();
  }

  function importMacTags() {
    onClose();
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
    onClose();
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
    onClose();
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

  if (selectedEntries.length < 2) {
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
    if (!isReadOnlyMode) {
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

  if (!isReadOnlyMode) {
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
    selectedEntries.length < 2 &&
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
  if (!isReadOnlyMode && !props.perspectiveMode) {
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
  if (Pro && props.perspectiveMode && selectedEntries.length < 2) {
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
  if (selectedEntries.length === 1) {
    menuItems.push(
      <MenuItem
        key="copySharingLink"
        data-tid="copyDirectorySharingLink"
        onClick={copySharingLink}
      >
        <ListItemIcon>
          <ShareIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:copySharingLink')} />
      </MenuItem>
    );
  }

  if (
    selectedEntries.length < 2 &&
    AppConfig.isElectron &&
    AppConfig.isMacLike
  ) {
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
    AvailablePerspectives.forEach(perspective => {
      let badge = <></>;
      if (!Pro && perspective.pro) {
        badge = <ProLabel />;
      }
      if (!Pro && perspective.beta) {
        badge = <BetaLabel />;
      }
      if (Pro && perspective.beta) {
        badge = <BetaLabel />;
      }
      menuItems.push(
        <MenuItem
          key={perspective.key}
          data-tid={perspective.key}
          onClick={() => switchPerspective(perspective.id)}
        >
          <ListItemIcon>{perspective.icon}</ListItemIcon>
          <ListItemText
            primary={
              <>
                {perspective.title}
                {badge}
              </>
            }
          />
        </MenuItem>
      );
    });
  }

  if (selectedEntries.length < 2) {
    menuItems.push(<Divider key="divider3" />);
    menuItems.push(
      <MenuItem
        key="showProperties"
        data-tid="showProperties"
        onClick={showProperties}
      >
        <ListItemIcon>
          <PropertiesIcon />
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
