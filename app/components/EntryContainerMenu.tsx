import React, { useState } from 'react';
import {
  baseName,
  extractFileName,
  extractDirectoryName
} from '@tagspaces/tagspaces-common/paths';
import PlatformIO from '-/services/platform-facade';
import { ListItemIcon, Menu, MenuItem, Typography } from '@mui/material';
import {
  actions as AppActions,
  AppDispatch,
  isReadOnlyMode,
  NotificationTypes,
  OpenedEntry
} from '-/reducers/app';
import { useDispatch, useSelector } from 'react-redux';
import AppConfig from '-/AppConfig';
import i18n from '-/services/i18n';
import {
  DeleteIcon,
  ExpandIcon,
  LinkIcon,
  NavigateToFolderIcon,
  OpenNewWindowIcon,
  ParentFolderIcon,
  ReloadIcon
} from '-/components/CommonIcons';
import OpenNativelyIcon from '@mui/icons-material/Launch';
import FullScreenIcon from '@mui/icons-material/ZoomOutMap';
import FileDownloadIcon from '@mui/icons-material/AssignmentReturned';
import ConfirmDialog from '-/components/dialogs/ConfirmDialog';
import { isDesktopMode } from '-/reducers/settings';

interface Props {
  anchorEl: null | HTMLElement;
  handleClose: () => void;
  openedEntry: OpenedEntry;
  toggleFullScreen: () => void;
  reloadDocument: () => void;
  sharingLink: string;
  sharingParentFolderLink: string;
}

function EntryContainerMenu(props: Props) {
  const {
    anchorEl,
    handleClose,
    openedEntry,
    toggleFullScreen,
    sharingLink,
    sharingParentFolderLink,
    reloadDocument
  } = props;
  // const theme = useTheme();
  const readOnlyMode = useSelector(isReadOnlyMode);
  const desktopMode = useSelector(isDesktopMode);
  const dispatch: AppDispatch = useDispatch();

  const [isDeleteEntryModalOpened, setDeleteEntryModalOpened] = useState<
    boolean
  >(false);

  const downloadCordova = (uri, filename) => {
    const { Downloader } = window.plugins;

    const downloadSuccessCallback = result => {
      // result is an object
      /* {
        path: "file:///storage/sdcard0/documents/My Pdf.pdf", // Returns full file path
        file: "My Pdf.pdf", // Returns Filename
        folder: "documents" // Returns folder name
      } */
      console.log(result.file); // My Pdf.pdf
    };

    const downloadErrorCallback = error => {
      console.log(error);
    };

    const options = {
      title: 'Downloading File:' + filename, // Download Notification Title
      url: uri, // File Url
      path: filename, // The File Name with extension
      description: 'The file is downloading', // Download description Notification String
      visible: true, // This download is visible and shows in the notifications while in progress and after completion.
      folder: 'documents' // Folder to save the downloaded file, if not exist it will be created
    };

    Downloader.download(
      options,
      downloadSuccessCallback,
      downloadErrorCallback
    );
  };

  function downloadFile() {
    const entryName = `${baseName(
      openedEntry.path,
      PlatformIO.getDirSeparator()
    )}`;
    const fileName = extractFileName(entryName, PlatformIO.getDirSeparator());

    if (AppConfig.isCordova) {
      if (openedEntry.url) {
        downloadCordova(openedEntry.url, entryName);
      } else {
        console.log('Can only download HTTP/HTTPS URIs');
        dispatch(
          AppActions.showNotification(
            i18n.t('core:cantDownloadLocalFile'),
            NotificationTypes.default
          )
        );
      }
    } else {
      const downloadLink = document.getElementById('downloadFile');
      if (downloadLink) {
        if (AppConfig.isWeb) {
          // eslint-disable-next-line no-restricted-globals
          const { protocol } = location;
          // eslint-disable-next-line no-restricted-globals
          const { hostname } = location;
          // eslint-disable-next-line no-restricted-globals
          const { port } = location;
          const link = `${protocol}//${hostname}${
            port !== '' ? `:${port}` : ''
          }/${openedEntry.path}`;
          downloadLink.setAttribute('href', link);
        } else {
          downloadLink.setAttribute('href', `file:///${openedEntry.path}`);
        }

        if (openedEntry.url) {
          // mostly the s3 case
          downloadLink.setAttribute('target', '_blank');
          downloadLink.setAttribute('href', openedEntry.url);
        }

        downloadLink.setAttribute('download', fileName); // works only for same origin
        downloadLink.click();
      }
    }
  }

  const navigateToFolder = () => {
    if (openedEntry.isFile) {
      dispatch(AppActions.openLink(sharingParentFolderLink));
    } else {
      dispatch(AppActions.openLink(sharingLink));
    }
  };

  const openInNewWindow = () => {
    PlatformIO.createNewInstance(window.location.href);
  };

  const shareFile = (filePath: string) => {
    PlatformIO.shareFiles([filePath]);
  };

  const openNatively = () => {
    if (openedEntry.path) {
      if (openedEntry.isFile) {
        dispatch(AppActions.openFileNatively(openedEntry.path));
      } else {
        dispatch(AppActions.openDirectory(openedEntry.path));
      }
    }
  };

  const menuItems = [];
  if (openedEntry.isFile) {
    menuItems.push(
      <MenuItem
        data-tid="downloadFileTID"
        aria-label={i18n.t('core:downloadFile')}
        onClick={() => downloadFile()}
      >
        <ListItemIcon>
          <FileDownloadIcon />
          <Typography variant="inherit">
            {i18n.t('core:downloadFile')}
          </Typography>
        </ListItemIcon>
      </MenuItem>
    );
    menuItems.push(
      <MenuItem
        data-tid="fileContainerSwitchToFullScreen"
        aria-label={i18n.t('core:switchToFullscreen')}
        onClick={() => toggleFullScreen()}
      >
        <ListItemIcon>
          <FullScreenIcon />
          <Typography variant="inherit">
            {i18n.t('core:switchToFullscreen')}
          </Typography>
        </ListItemIcon>
      </MenuItem>
    );
    if (desktopMode) {
      menuItems.push(
        <MenuItem
          data-tid="openInFullWidthTID"
          aria-label={i18n.t('core:openInFullWidth')}
          onClick={() => {
            dispatch(AppActions.toggleEntryFullWidth());
          }}
        >
          <ListItemIcon>
            <ExpandIcon />
            <Typography variant="inherit">
              {i18n.t('core:openInFullWidth')}
            </Typography>
          </ListItemIcon>
        </MenuItem>
      );
    }
    menuItems.push(
      <MenuItem
        data-tid="navigateToParentTID"
        aria-label={i18n.t('core:navigateToParentDirectory')}
        onClick={navigateToFolder}
      >
        <ListItemIcon>
          <ParentFolderIcon />
          <Typography variant="inherit">
            {i18n.t('core:navigateToParentDirectory')}
          </Typography>
        </ListItemIcon>
      </MenuItem>
    );
    if (!AppConfig.isCordova) {
      menuItems.push(
        <MenuItem
          data-tid="openInWindowTID"
          aria-label={i18n.t('core:openInWindow')}
          onClick={openInNewWindow}
        >
          <ListItemIcon>
            <OpenNewWindowIcon />
            <Typography variant="inherit">
              {i18n.t('core:openInWindow')}
            </Typography>
          </ListItemIcon>
        </MenuItem>
      );
    }
    if (AppConfig.isCordova) {
      menuItems.push(
        <MenuItem
          data-tid="shareFileTID"
          aria-label={i18n.t('core:shareFile')}
          onClick={() => shareFile(`file:///${openedEntry.path}`)}
        >
          <ListItemIcon>
            <LinkIcon />
            <Typography variant="inherit">
              {i18n.t('core:shareFile')}
            </Typography>
          </ListItemIcon>
        </MenuItem>
      );
    }
    if (
      !(
        PlatformIO.haveObjectStoreSupport() ||
        PlatformIO.haveWebDavSupport() ||
        AppConfig.isWeb
      )
    ) {
      menuItems.push(
        <MenuItem
          data-tid="openFileExternallyTID"
          aria-label={i18n.t('core:openFileExternally')}
          onClick={openNatively}
        >
          <ListItemIcon>
            <OpenNativelyIcon />
            <Typography variant="inherit">
              {i18n.t('core:openFileExternally')}
            </Typography>
          </ListItemIcon>
        </MenuItem>
      );
    }
    menuItems.push(
      <MenuItem
        data-tid="reloadPropertiesTID"
        aria-label={i18n.t('core:reloadFile')}
        onClick={reloadDocument}
      >
        <ListItemIcon>
          <ReloadIcon />
          <Typography variant="inherit">{i18n.t('core:reloadFile')}</Typography>
        </ListItemIcon>
      </MenuItem>
    );
    if (!readOnlyMode) {
      menuItems.push(
        <MenuItem
          data-tid="deleteEntryTID"
          aria-label={i18n.t('core:deleteEntry')}
          onClick={() => setDeleteEntryModalOpened(true)}
        >
          <ListItemIcon>
            <DeleteIcon />
            <Typography variant="inherit">
              {i18n.t('core:deleteEntry')}
            </Typography>
          </ListItemIcon>
        </MenuItem>
      );
    }
  } else {
    // folder
    menuItems.push(
      <MenuItem
        data-tid="openInMainAreaTID"
        aria-label={i18n.t('core:openInMainArea')}
        onClick={navigateToFolder}
      >
        <ListItemIcon>
          <NavigateToFolderIcon />
          <Typography variant="inherit">
            {i18n.t('core:openInMainArea')}
          </Typography>
        </ListItemIcon>
      </MenuItem>
    );
    if (!AppConfig.isCordova) {
      menuItems.push(
        <MenuItem
          data-tid="openInWindowTID"
          aria-label={i18n.t('core:openInWindow')}
          onClick={openInNewWindow}
        >
          <ListItemIcon>
            <OpenNewWindowIcon />
            <Typography variant="inherit">
              {i18n.t('core:openInWindow')}
            </Typography>
          </ListItemIcon>
        </MenuItem>
      );
    }
    if (
      !(
        PlatformIO.haveObjectStoreSupport() ||
        PlatformIO.haveWebDavSupport() ||
        AppConfig.isWeb
      )
    ) {
      menuItems.push(
        <MenuItem
          data-tid="openDirectoryExternallyTID"
          aria-label={i18n.t('core:openDirectoryExternally')}
          onClick={openNatively}
        >
          <ListItemIcon>
            <OpenNativelyIcon />
            <Typography variant="inherit">
              {i18n.t('core:openDirectoryExternally')}
            </Typography>
          </ListItemIcon>
        </MenuItem>
      );
    }
    menuItems.push(
      <MenuItem
        data-tid="reloadFolderTID"
        aria-label={i18n.t('core:reloadDirectory')}
        onClick={reloadDocument}
      >
        <ListItemIcon>
          <ReloadIcon />
          <Typography variant="inherit">
            {i18n.t('core:reloadDirectory')}
          </Typography>
        </ListItemIcon>
      </MenuItem>
    );
    if (desktopMode) {
      menuItems.push(
        <MenuItem
          data-tid="openInFullWidthTID"
          aria-label={i18n.t('core:openInFullWidth')}
          onClick={() => {
            dispatch(AppActions.toggleEntryFullWidth());
          }}
        >
          <ListItemIcon>
            <ExpandIcon />
            <Typography variant="inherit">
              {i18n.t('core:openInFullWidth')}
            </Typography>
          </ListItemIcon>
        </MenuItem>
      );
    }
    if (!readOnlyMode) {
      menuItems.push(
        <MenuItem
          data-tid="deleteFolderTID"
          aria-label={i18n.t('core:deleteDirectory')}
          onClick={() => setDeleteEntryModalOpened(true)}
        >
          <ListItemIcon>
            <DeleteIcon />
            <Typography variant="inherit">
              {i18n.t('core:deleteDirectory')}
            </Typography>
          </ListItemIcon>
        </MenuItem>
      );
    }
  }

  return (
    <>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
      >
        {menuItems}
      </Menu>
      {isDeleteEntryModalOpened && (
        <ConfirmDialog
          open={isDeleteEntryModalOpened}
          onClose={() => {
            setDeleteEntryModalOpened(false);
          }}
          title={
            openedEntry.isFile
              ? i18n.t('core:deleteConfirmationTitle')
              : i18n.t('core:deleteDirectory')
          }
          content={
            openedEntry.isFile
              ? i18n.t('core:doYouWantToDeleteFile')
              : i18n.t('core:deleteDirectoryContentConfirm', {
                  dirPath: openedEntry.path
                    ? extractDirectoryName(
                        openedEntry.path,
                        PlatformIO.getDirSeparator()
                      )
                    : ''
                })
          }
          confirmCallback={result => {
            if (result) {
              dispatch(
                AppActions.deleteFile(openedEntry.path, openedEntry.uuid)
              );
            }
          }}
          cancelDialogTID="cancelSaveBeforeCloseDialog"
          confirmDialogTID="confirmSaveBeforeCloseDialog"
          confirmDialogContentTID="confirmDialogContent"
        />
      )}
    </>
  );
}

export default EntryContainerMenu;
