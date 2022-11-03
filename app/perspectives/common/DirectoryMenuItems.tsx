import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import OpenFolderIcon from '@mui/icons-material/SubdirectoryArrowLeft';
import ListItemText from '@mui/material/ListItemText';
import i18n from '-/services/i18n';
import AutoRenew from '@mui/icons-material/Autorenew';
import RenameFolderIcon from '@mui/icons-material/FormatTextdirectionLToR';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import PlatformIO from '-/services/platform-facade';
import AppConfig from '@tagspaces/tagspaces-platforms/AppConfig';
import OpenFolderNativelyIcon from '@mui/icons-material/Launch';
import Divider from '@mui/material/Divider';
import NewFileIcon from '@mui/icons-material/InsertDriveFile';
import NewFolderIcon from '@mui/icons-material/CreateNewFolder';
import AddExistingFileIcon from '@mui/icons-material/ExitToApp';
import { Pro } from '-/pro';
import ImageIcon from '@mui/icons-material/Image';
import ShareIcon from '@mui/icons-material/Link';
import ImportTagsIcon from '@mui/icons-material/FindInPage';
import { BetaLabel, ProLabel } from '-/components/HelperComponents';
import { AvailablePerspectives } from '-/perspectives';
import PropertiesIcon from '@mui/icons-material/Info';
import React from 'react';

export function getDirectoryMenuItems(
  selectedEntriesLength: number,
  perspectiveMode: boolean,
  isReadOnlyMode: boolean,
  onClose: () => void,
  openDirectory?: () => void,
  reloadDirectory?: () => void,
  showRenameDirectoryDialog?: () => void,
  showDeleteDirectoryDialog?: () => void,
  showInFileManager?: () => void,
  createNewFile?: () => void,
  showCreateDirectoryDialog?: () => void,
  addExistingFile?: () => void,
  setFolderThumbnail?: () => void,
  copySharingLink?: () => void,
  importMacTags?: () => void,
  switchPerspective?: (perspectiveId: string) => void,
  showProperties?: () => void,
  cameraTakePicture?: () => void
) {
  const menuItems = [];
  if (selectedEntriesLength < 2) {
    if (perspectiveMode) {
      if (openDirectory) {
        menuItems.push(
          <MenuItem
            key="openDirectory"
            data-tid="openDirectory"
            onClick={() => {
              onClose();
              openDirectory();
            }}
          >
            <ListItemIcon>
              <OpenFolderIcon />
            </ListItemIcon>
            <ListItemText primary={i18n.t('core:openDirectory')} />
          </MenuItem>
        );
      }
    } else if (reloadDirectory) {
      menuItems.push(
        <MenuItem
          key="reloadDirectory"
          data-tid="reloadDirectory"
          onClick={() => {
            onClose();
            reloadDirectory();
          }}
        >
          <ListItemIcon>
            <AutoRenew />
          </ListItemIcon>
          <ListItemText primary={i18n.t('core:reloadDirectory')} />
        </MenuItem>
      );
    }
    if (!isReadOnlyMode && showRenameDirectoryDialog) {
      menuItems.push(
        <MenuItem
          key="renameDirectory"
          data-tid="renameDirectory"
          onClick={() => {
            onClose();
            showRenameDirectoryDialog();
          }}
        >
          <ListItemIcon>
            <RenameFolderIcon />
          </ListItemIcon>
          <ListItemText primary={i18n.t('core:renameDirectory')} />
        </MenuItem>
      );
    }
  }

  if (!isReadOnlyMode && showDeleteDirectoryDialog) {
    menuItems.push(
      <MenuItem
        key="deleteDirectory"
        data-tid="deleteDirectory"
        onClick={() => {
          onClose();
          showDeleteDirectoryDialog();
        }}
      >
        <ListItemIcon>
          <DeleteForeverIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:deleteDirectory')} />
      </MenuItem>
    );
  }

  if (
    selectedEntriesLength < 2 &&
    !(
      PlatformIO.haveObjectStoreSupport() ||
      PlatformIO.haveWebDavSupport() ||
      AppConfig.isWeb
    ) &&
    showInFileManager
  ) {
    menuItems.push(
      <MenuItem
        key="showInFileManager"
        data-tid="showInFileManager"
        onClick={() => {
          onClose();
          showInFileManager();
        }}
      >
        <ListItemIcon>
          <OpenFolderNativelyIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:showInFileManager')} />
      </MenuItem>
    );
  }
  if (!perspectiveMode) {
    menuItems.push(<Divider key="divider1" />);
  }
  if (!isReadOnlyMode && !perspectiveMode) {
    if (createNewFile) {
      menuItems.push(
        <MenuItem
          key="createNewFile"
          data-tid="createNewFile"
          onClick={() => {
            onClose();
            createNewFile();
          }}
        >
          <ListItemIcon>
            <NewFileIcon />
          </ListItemIcon>
          <ListItemText primary={i18n.t('core:newFileNote')} />
        </MenuItem>
      );
    }
    if (showCreateDirectoryDialog) {
      menuItems.push(
        <MenuItem
          key="newSubDirectory"
          data-tid="newSubDirectory"
          onClick={() => {
            onClose();
            showCreateDirectoryDialog();
          }}
        >
          <ListItemIcon>
            <NewFolderIcon />
          </ListItemIcon>
          <ListItemText primary={i18n.t('core:newSubdirectory')} />
        </MenuItem>
      );
    }
    if (addExistingFile) {
      menuItems.push(
        <MenuItem
          key="addExistingFile"
          data-tid="addExistingFile"
          onClick={() => {
            onClose();
            addExistingFile();
          }}
        >
          <ListItemIcon>
            <AddExistingFileIcon />
          </ListItemIcon>
          <ListItemText primary={i18n.t('core:addFiles')} />
        </MenuItem>
      );
    }
  }
  if (
    Pro &&
    perspectiveMode &&
    selectedEntriesLength < 2 &&
    setFolderThumbnail
  ) {
    menuItems.push(
      <MenuItem
        key="setAsThumb"
        data-tid="setAsThumbTID"
        onClick={() => {
          onClose();
          setFolderThumbnail();
        }}
      >
        <ListItemIcon>
          <ImageIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:setAsParentFolderThumbnail')} />
      </MenuItem>
    );
  }
  if (selectedEntriesLength === 1 && copySharingLink) {
    menuItems.push(
      <MenuItem
        key="copySharingLink"
        data-tid="copyDirectorySharingLink"
        onClick={() => {
          onClose();
          copySharingLink();
        }}
      >
        <ListItemIcon>
          <ShareIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:copySharingLink')} />
      </MenuItem>
    );
  }

  if (
    selectedEntriesLength < 2 &&
    AppConfig.isElectron &&
    AppConfig.isMacLike &&
    importMacTags
  ) {
    menuItems.push(
      <MenuItem
        key="importMacTags"
        data-tid="importMacTags"
        onClick={() => {
          onClose();
          importMacTags();
        }}
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

  if (AppConfig.isCordova && cameraTakePicture) {
    // .isCordovaAndroid) {
    menuItems.push(
      <MenuItem
        key="takePicture"
        data-tid="takePicture"
        onClick={() => {
          onClose();
          cameraTakePicture();
        }}
      >
        <ListItemIcon>
          <AddExistingFileIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:cameraTakePicture')} />
      </MenuItem>
    );
  }
  if (!perspectiveMode && switchPerspective) {
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
          onClick={() => {
            onClose();
            switchPerspective(perspective.id);
          }}
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

  if (selectedEntriesLength < 2 && showProperties) {
    menuItems.push(<Divider key="divider3" />);
    menuItems.push(
      <MenuItem
        key="showProperties"
        data-tid="showProperties"
        onClick={() => {
          onClose();
          showProperties();
        }}
      >
        <ListItemIcon>
          <PropertiesIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:directoryPropertiesTitle')} />
      </MenuItem>
    );
  }
  return menuItems;
}
