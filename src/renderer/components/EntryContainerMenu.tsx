import AppConfig from '-/AppConfig';
import {
  CloseIcon,
  DeleteIcon,
  DownloadIcon,
  FullScreenIcon,
  FullWidthIcon,
  LinkIcon,
  NavigateToFolderIcon,
  OpenEntryNativelyIcon,
  OpenNewWindowIcon,
  ParentFolderIcon,
  ReloadIcon,
} from '-/components/CommonIcons';
import TsMenuList from '-/components/TsMenuList';
import ConfirmDialog from '-/components/dialogs/ConfirmDialog';
import MenuKeyBinding from '-/components/menus/MenuKeyBinding';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useFullScreenContext } from '-/hooks/useFullScreenContext';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import {
  getKeyBindingObject,
  getWarningOpeningFilesExternally,
  isDesktopMode,
} from '-/reducers/settings';
import {
  createNewInstance,
  openDirectoryMessage,
  openFileMessage,
} from '-/services/utils-io';
import {
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material';
import { extractDirectoryName } from '@tagspaces/tagspaces-common/paths';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

interface Props {
  anchorEl: null | HTMLElement;
  handleClose: () => void;
  startClosingEntry: (event) => void;
  reloadDocument: () => void;
  fileViewerContainer: HTMLDivElement;
}

function EntryContainerMenu(props: Props) {
  const {
    anchorEl,
    handleClose,
    reloadDocument,
    startClosingEntry,
    fileViewerContainer,
  } = props;

  const { toggleFullScreen } = useFullScreenContext();
  const { openedEntry } = useOpenedEntryContext();
  const { t } = useTranslation();
  // const theme = useTheme();
  const {
    toggleEntryFullWidth,
    openLink,
    sharingLink,
    sharingParentFolderLink,
  } = useOpenedEntryContext();
  const keyBindings = useSelector(getKeyBindingObject);
  const { currentLocation } = useCurrentLocationContext();
  const { deleteFile, downloadFsEntry } = useIOActionsContext();
  //const { showNotification } = useNotificationContext();
  const desktopMode = useSelector(isDesktopMode);
  const warningOpeningFilesExternally = useSelector(
    getWarningOpeningFilesExternally,
  );
  const [isDeleteEntryModalOpened, setDeleteEntryModalOpened] =
    useState<boolean>(false);

  const navigateToFolder = () => {
    if (openedEntry.isFile) {
      openLink(sharingParentFolderLink);
    } else {
      openLink(sharingLink);
    }
    handleClose();
  };

  const openInNewWindow = () => {
    createNewInstance(window.location.href);
    handleClose();
  };

  const shareFile = (filePath: string) => {
    currentLocation.shareFiles([filePath]);
    handleClose();
  };

  const openNatively = () => {
    if (openedEntry.path) {
      if (openedEntry.isFile) {
        openFileMessage(openedEntry.path, warningOpeningFilesExternally);
      } else {
        openDirectoryMessage(openedEntry.path);
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
        <MenuKeyBinding keyBinding={keyBindings['reloadDocument']} />
      </MenuItem>,
    );
    menuItems.push(
      <MenuItem
        key={'downloadFileKey'}
        data-tid="downloadFileTID"
        aria-label={t('core:downloadFile')}
        onClick={() => {
          downloadFsEntry(openedEntry);
          /*if (openedEntry.isEncrypted) {
            currentLocation
              .getFileContentPromise(openedEntry.path, 'arraybuffer')
              .then((arrayBuffer) => {
                const url = window.URL || window.webkitURL;
                const openedEntryUrl = url.createObjectURL(
                  new Blob([arrayBuffer]),
                );
                const downloadResult = downloadFile(
                  openedEntry.path,
                  openedEntryUrl,
                  currentLocation?.getDirSeparator(),
                );
                if (downloadResult === -1) {
                  showNotification(t('core:cantDownloadLocalFile'));
                }
              });
          } else {
            const downloadResult = downloadFile(
              openedEntry.path,
              openedEntry.url,
              currentLocation?.getDirSeparator(),
            );
            if (downloadResult === -1) {
              showNotification(t('core:cantDownloadLocalFile'));
            }
          }*/
          handleClose();
        }}
      >
        <ListItemIcon>
          <DownloadIcon />
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
          toggleFullScreen(fileViewerContainer);
          handleClose();
        }}
      >
        <ListItemIcon>
          <FullScreenIcon />
        </ListItemIcon>
        <ListItemText primary={t('core:switchToFullscreen')} />
        <MenuKeyBinding keyBinding={keyBindings['toggleFullScreen']} />
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
            <FullWidthIcon />
          </ListItemIcon>
          <ListItemText primary={t('core:openInFullWidth')} />
          <MenuKeyBinding keyBinding={keyBindings['openInFullWidth']} />
        </MenuItem>,
      );
    }
    if (!currentLocation?.isReadOnly) {
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
        currentLocation?.haveObjectStoreSupport() ||
        currentLocation?.haveWebDavSupport() ||
        AppConfig.isWeb
      ) &&
      !(AppConfig.isAndroid && !openedEntry.isFile)
    ) {
      menuItems.push(
        <MenuItem
          key={'openFileExternallyKey'}
          data-tid="openFileExternallyTID"
          aria-label={t('core:openFileExternally')}
          onClick={openNatively}
        >
          <ListItemIcon>
            <OpenEntryNativelyIcon />
          </ListItemIcon>
          <ListItemText
            primary={t(
              openedEntry.isFile
                ? 'core:openFileNatively'
                : 'core:openDirectoryExternally',
            )}
          />
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
        <MenuKeyBinding keyBinding={keyBindings['reloadDocument']} />
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
        currentLocation?.haveObjectStoreSupport() ||
        currentLocation?.haveWebDavSupport() ||
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
            <OpenEntryNativelyIcon />
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
            <FullWidthIcon />
          </ListItemIcon>
          <ListItemText primary={t('core:openInFullWidth')} />
          <MenuKeyBinding keyBinding={keyBindings['openInFullWidth']} />
        </MenuItem>,
      );
    }
    if (!currentLocation?.isReadOnly) {
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
          {/* <MenuKeyBinding keyBinding={keyBindings['deleteDocument']} /> */}
        </MenuItem>,
      );
    }
  }

  menuItems.push(<Divider key={'divider5'} />);
  menuItems.push(
    <MenuItem
      key={'openDirectoryExternallyKey'}
      data-tid="closeEntryTID"
      aria-label={t('core:closeEntry')}
      onClick={startClosingEntry}
    >
      <ListItemIcon>
        <CloseIcon />
      </ListItemIcon>
      <ListItemText primary={t('core:closeEntry')} />
      <MenuKeyBinding keyBinding={keyBindings['closeViewer']} />
    </MenuItem>,
  );

  const entryName = openedEntry.path
    ? extractDirectoryName(openedEntry.path, currentLocation?.getDirSeparator())
    : '';

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
        <TsMenuList sx={{ minWidth: 300 }}>{menuItems}</TsMenuList>
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
                  dirPath: entryName,
                })
          }
          list={openedEntry.isFile && [entryName]}
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
