import React, { useState } from 'react';
import {
  baseName,
  extractFileName,
  extractDirectoryName,
} from '@tagspaces/tagspaces-common/paths';
import PlatformIO from '-/services/platform-facade';
import {
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  MenuList,
  Divider,
} from '@mui/material';
import { OpenedEntry } from '-/reducers/app';
import { useSelector } from 'react-redux';
import AppConfig from '-/AppConfig';
import {
  DeleteIcon,
  LinkIcon,
  NavigateToFolderIcon,
  OpenNewWindowIcon,
  ParentFolderIcon,
  ReloadIcon,
} from '-/components/CommonIcons';
import ExpandIcon from '@mui/icons-material/SettingsEthernet';
import OpenNativelyIcon from '@mui/icons-material/Launch';
import FullScreenIcon from '@mui/icons-material/ZoomOutMap';
import FileDownloadIcon from '@mui/icons-material/AssignmentReturned';
import ConfirmDialog from '-/components/dialogs/ConfirmDialog';
import {
  getWarningOpeningFilesExternally,
  isDesktopMode,
} from '-/reducers/settings';
import { useTranslation } from 'react-i18next';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';

interface Props {
  anchorEl: null | HTMLElement;
  handleClose: () => void;
  openedEntry: OpenedEntry;
  toggleFullScreen: () => void;
  reloadDocument: () => void;
}

function EntryContainerMenu(props: Props) {
  const {
    anchorEl,
    handleClose,
    openedEntry,
    toggleFullScreen,
    reloadDocument,
  } = props;
  const { t } = useTranslation();
  // const theme = useTheme();
  const {
    toggleEntryFullWidth,
    openLink,
    sharingLink,
    sharingParentFolderLink,
  } = useOpenedEntryContext();
  const { readOnlyMode } = useCurrentLocationContext();
  const { deleteFile } = useIOActionsContext();
  const { showNotification } = useNotificationContext();
  const desktopMode = useSelector(isDesktopMode);
  const warningOpeningFilesExternally = useSelector(
    getWarningOpeningFilesExternally,
  );

  const [isDeleteEntryModalOpened, setDeleteEntryModalOpened] =
    useState<boolean>(false);

  const downloadCordova = (uri, filename) => {
    const { Downloader } = window.plugins;

    const downloadSuccessCallback = (result) => {
      // result is an object
      /* {
        path: "file:///storage/sdcard0/documents/My Pdf.pdf", // Returns full file path
        file: "My Pdf.pdf", // Returns Filename
        folder: "documents" // Returns folder name
      } */
      console.log(result.file); // My Pdf.pdf
    };

    const downloadErrorCallback = (error) => {
      console.log(error);
    };

    const options = {
      title: 'Downloading File:' + filename, // Download Notification Title
      url: uri, // File Url
      path: filename, // The File Name with extension
      description: 'The file is downloading', // Download description Notification String
      visible: true, // This download is visible and shows in the notifications while in progress and after completion.
      folder: 'documents', // Folder to save the downloaded file, if not exist it will be created
    };

    Downloader.download(
      options,
      downloadSuccessCallback,
      downloadErrorCallback,
    );
  };

  function downloadFile() {
    const entryName = `${baseName(
      openedEntry.path,
      PlatformIO.getDirSeparator(),
    )}`;
    const fileName = extractFileName(entryName, PlatformIO.getDirSeparator());

    if (AppConfig.isCordova) {
      if (openedEntry.url) {
        downloadCordova(openedEntry.url, entryName);
      } else {
        console.log('Can only download HTTP/HTTPS URIs');
        showNotification(t('core:cantDownloadLocalFile'));
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
    handleClose();
  }

  const navigateToFolder = () => {
    if (openedEntry.isFile) {
      openLink(sharingParentFolderLink);
    } else {
      openLink(sharingLink);
    }
    handleClose();
  };

  const openInNewWindow = () => {
    PlatformIO.createNewInstance(window.location.href);
    handleClose();
  };

  const shareFile = (filePath: string) => {
    PlatformIO.shareFiles([filePath]);
    handleClose();
  };

  const openNatively = () => {
    if (openedEntry.path) {
      if (openedEntry.isFile) {
        PlatformIO.openFile(openedEntry.path, warningOpeningFilesExternally);
        //dispatch(AppActions.openFileNatively(openedEntry.path));
      } else {
        PlatformIO.openDirectory(openedEntry.path);
      }
    }
    handleClose();
  };

  const menuItems = [];
  if (openedEntry.isFile) {
    menuItems.push(
      <MenuItem
        key={'reloadPropertiesKey'}
        data-tid="reloadPropertiesTID"
        aria-label={t('core:reloadFile')}
        onClick={() => {
          reloadDocument();
          handleClose();
        }}
      >
        <ListItemIcon>
          <ReloadIcon />
        </ListItemIcon>
        <ListItemText primary={t('core:reloadFile')} />
      </MenuItem>,
    );
    menuItems.push(
      <MenuItem
        key={'downloadFileKey'}
        data-tid="downloadFileTID"
        aria-label={t('core:downloadFile')}
        onClick={() => downloadFile()}
      >
        <ListItemIcon>
          <FileDownloadIcon />
        </ListItemIcon>
        <ListItemText primary={t('core:downloadFile')} />
      </MenuItem>,
    );
    menuItems.push(<Divider key={'divider1'} />);
    menuItems.push(
      <MenuItem
        key={'fileContainerSwitchToFullScreenKey'}
        data-tid="fileContainerSwitchToFullScreen"
        aria-label={t('core:switchToFullscreen')}
        onClick={() => {
          toggleFullScreen();
          handleClose();
        }}
      >
        <ListItemIcon>
          <FullScreenIcon />
        </ListItemIcon>
        <ListItemText primary={t('core:switchToFullscreen')} />
      </MenuItem>,
    );
    if (desktopMode) {
      menuItems.push(
        <MenuItem
          key={'openInFullWidthKey'}
          data-tid="openInFullWidthTID"
          aria-label={t('core:openInFullWidth')}
          onClick={() => {
            toggleEntryFullWidth();
            handleClose();
          }}
        >
          <ListItemIcon>
            <ExpandIcon />
          </ListItemIcon>
          <ListItemText primary={t('core:openInFullWidth')} />
        </MenuItem>,
      );
    }
    if (!readOnlyMode) {
      menuItems.push(<Divider key={'divider3'} />);
      menuItems.push(
        <MenuItem
          key={'deleteEntryKey'}
          data-tid="deleteEntryTID"
          aria-label={t('core:deleteEntry')}
          onClick={() => {
            setDeleteEntryModalOpened(true);
            handleClose();
          }}
        >
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <ListItemText primary={t('core:deleteEntry')} />
        </MenuItem>,
      );
    }
    menuItems.push(<Divider key={'divider2'} />);
    menuItems.push(
      <MenuItem
        key={'navigateToParentKey'}
        data-tid="navigateToParentTID"
        aria-label={t('core:navigateToParentDirectory')}
        onClick={navigateToFolder}
      >
        <ListItemIcon>
          <ParentFolderIcon />
        </ListItemIcon>
        <ListItemText primary={t('core:navigateToParentDirectory')} />
      </MenuItem>,
    );
    if (!AppConfig.isCordova) {
      menuItems.push(
        <MenuItem
          key={'openInWindowKey'}
          data-tid="openInWindowTID"
          aria-label={t('core:openInWindow')}
          onClick={openInNewWindow}
        >
          <ListItemIcon>
            <OpenNewWindowIcon />
          </ListItemIcon>
          <ListItemText primary={t('core:openInWindow')} />
        </MenuItem>,
      );
    }
    if (AppConfig.isCordova) {
      menuItems.push(
        <MenuItem
          key={'shareFileKey'}
          data-tid="shareFileTID"
          aria-label={t('core:shareFile')}
          onClick={() => shareFile(`file:///${openedEntry.path}`)}
        >
          <ListItemIcon>
            <LinkIcon />
          </ListItemIcon>
          <ListItemText primary={t('core:shareFile')} />
        </MenuItem>,
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
          key={'openFileExternallyKey'}
          data-tid="openFileExternallyTID"
          aria-label={t('core:openFileExternally')}
          onClick={openNatively}
        >
          <ListItemIcon>
            <OpenNativelyIcon />
          </ListItemIcon>
          <ListItemText primary={t('core:openFileExternally')} />
        </MenuItem>,
      );
    }
  } else {
    // folder
    menuItems.push(
      <MenuItem
        key={'reloadFolderKey'}
        data-tid="reloadFolderTID"
        aria-label={t('core:reloadDirectory')}
        onClick={() => {
          reloadDocument();
          handleClose();
        }}
      >
        <ListItemIcon>
          <ReloadIcon />
        </ListItemIcon>
        <ListItemText primary={t('core:reloadDirectory')} />
      </MenuItem>,
    );
    menuItems.push(<Divider key={'divider6'} />);
    menuItems.push(
      <MenuItem
        key={'openInMainAreaKey'}
        data-tid="openInMainAreaTID"
        aria-label={t('core:openInMainArea')}
        onClick={navigateToFolder}
      >
        <ListItemIcon>
          <NavigateToFolderIcon />
        </ListItemIcon>
        <ListItemText primary={t('core:openInMainArea')} />
      </MenuItem>,
    );
    if (!AppConfig.isCordova) {
      menuItems.push(
        <MenuItem
          key={'openInWindowKey'}
          data-tid="openInWindowTID"
          aria-label={t('core:openInWindow')}
          onClick={openInNewWindow}
        >
          <ListItemIcon>
            <OpenNewWindowIcon />
          </ListItemIcon>
          <ListItemText primary={t('core:openInWindow')} />
        </MenuItem>,
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
          key={'openDirectoryExternallyKey'}
          data-tid="openDirectoryExternallyTID"
          aria-label={t('core:openDirectoryExternally')}
          onClick={openNatively}
        >
          <ListItemIcon>
            <OpenNativelyIcon />
          </ListItemIcon>
          <ListItemText primary={t('core:openDirectoryExternally')} />
        </MenuItem>,
      );
    }
    if (desktopMode) {
      menuItems.push(
        <MenuItem
          key={'openInFullWidthKey'}
          data-tid="openInFullWidthTID"
          aria-label={t('core:openInFullWidth')}
          onClick={() => {
            toggleEntryFullWidth();
            handleClose();
          }}
        >
          <ListItemIcon>
            <ExpandIcon />
          </ListItemIcon>
          <ListItemText primary={t('core:openInFullWidth')} />
        </MenuItem>,
      );
    }
    if (!readOnlyMode) {
      menuItems.push(<Divider key={'divider4'} />);
      menuItems.push(
        <MenuItem
          key={'deleteFolderKey'}
          data-tid="deleteFolderTID"
          aria-label={t('core:deleteDirectory')}
          onClick={() => {
            setDeleteEntryModalOpened(true);
            handleClose();
          }}
        >
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <ListItemText primary={t('core:deleteDirectory')} />
        </MenuItem>,
      );
    }
  }

  return (
    <>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <MenuList>{menuItems}</MenuList>
      </Menu>
      {isDeleteEntryModalOpened && (
        <ConfirmDialog
          open={isDeleteEntryModalOpened}
          onClose={() => {
            setDeleteEntryModalOpened(false);
          }}
          title={
            openedEntry.isFile
              ? t('core:deleteConfirmationTitle')
              : t('core:deleteDirectory')
          }
          content={
            openedEntry.isFile
              ? t('core:doYouWantToDeleteFile')
              : t('core:deleteDirectoryContentConfirm', {
                  dirPath: openedEntry.path
                    ? extractDirectoryName(
                        openedEntry.path,
                        PlatformIO.getDirSeparator(),
                      )
                    : '',
                })
          }
          confirmCallback={(result) => {
            if (result) {
              return deleteFile(openedEntry.path, openedEntry.uuid);
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
