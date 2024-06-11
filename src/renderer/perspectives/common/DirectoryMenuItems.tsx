import React from 'react';
import { useSelector } from 'react-redux';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import OpenFolderIcon from '@mui/icons-material/SubdirectoryArrowLeft';
import MoveCopy from '@mui/icons-material/FileCopy';
import ListItemText from '@mui/material/ListItemText';
import RenameFolderIcon from '@mui/icons-material/FormatTextdirectionLToR';
import AppConfig from '-/AppConfig';
import OpenFolderNativelyIcon from '@mui/icons-material/Launch';
import Divider from '@mui/material/Divider';
import { Pro } from '-/pro';
import ImageIcon from '@mui/icons-material/Image';
import ImportTagsIcon from '@mui/icons-material/FindInPage';
import { BetaLabel, ProLabel } from '-/components/HelperComponents';
import { AvailablePerspectives } from '-/perspectives';
import PropertiesIcon from '@mui/icons-material/Info';
import {
  ReloadIcon,
  OpenNewWindowIcon,
  DeleteIcon,
  LinkIcon,
  AudioRecordIcon,
  NewFileIcon,
  NewFolderIcon,
  AddExistingFileIcon,
  TagIcon,
} from '-/components/CommonIcons';
import { getKeyBindingObject } from '-/reducers/settings';
import MenuKeyBinding from '-/components/menus/MenuKeyBinding';
import { CommonLocation } from '-/utils/CommonLocation';

export function getDirectoryMenuItems(
  currentLocation: CommonLocation,
  selectedEntriesLength: number,
  perspectiveMode: boolean,
  isReadOnlyMode: boolean,
  onClose: () => void,
  t: (txt: string) => string,
  openDirectory?: () => void,
  reloadDirectory?: () => void,
  showRenameDirectoryDialog?: () => void,
  openMoveCopyDialog?: () => void,
  showDeleteDirectoryDialog?: () => void,
  showInFileManager?: () => void,
  createNewFile?: () => void,
  createNewAudio?: () => void,
  showCreateDirectoryDialog?: () => void,
  addExistingFile?: () => void,
  setFolderThumbnail?: () => void,
  copySharingLink?: () => void,
  importMacTags?: () => void,
  switchPerspective?: (perspectiveId: string) => void,
  showProperties?: () => void,
  cameraTakePicture?: () => void,
  showAddRemoveTagsDialog?: () => void,
  openInNewWindow?: () => void,
) {
  const keyBindings = useSelector(getKeyBindingObject);
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
            <ListItemText primary={t('core:openDirectory')} />
            <MenuKeyBinding keyBinding={keyBindings['openEntry']} />
          </MenuItem>,
        );
      }
      if (openInNewWindow) {
        menuItems.push(
          <MenuItem
            key="openInNewWindow"
            data-tid="openInNewWindow"
            onClick={() => {
              onClose();
              openInNewWindow();
            }}
          >
            <ListItemIcon>
              <OpenNewWindowIcon />
            </ListItemIcon>
            <ListItemText primary={t('core:openInWindow')} />
          </MenuItem>,
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
            <ReloadIcon />
          </ListItemIcon>
          <ListItemText primary={t('core:reloadDirectory')} />
          <MenuKeyBinding keyBinding={keyBindings['reloadDocument']} />
        </MenuItem>,
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
          <ListItemText primary={t('core:renameDirectory')} />
          <MenuKeyBinding keyBinding={keyBindings['renameFile']} />
        </MenuItem>,
      );
    }
  }

  if (
    !isReadOnlyMode &&
    openMoveCopyDialog &&
    currentLocation
    // && currentLocation.type === locationType.TYPE_LOCAL
  ) {
    menuItems.push(
      <MenuItem
        key="fileMenuMoveCopyDirectory"
        data-tid="fileMenuMoveCopyDirectoryTID"
        onClick={() => {
          onClose();
          openMoveCopyDialog();
        }}
      >
        <ListItemIcon>
          <MoveCopy />
        </ListItemIcon>
        <ListItemText primary={t('core:moveCopyDirectory')} />
        <MenuKeyBinding keyBinding={keyBindings['copyMoveSelectedEntries']} />
      </MenuItem>,
    );
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
          <DeleteIcon />
        </ListItemIcon>
        <ListItemText primary={t('core:deleteDirectory')} />
        <MenuKeyBinding keyBinding={keyBindings['deleteDocument']} />
      </MenuItem>,
    );
  }

  if (
    currentLocation &&
    selectedEntriesLength < 2 &&
    !(
      currentLocation.haveObjectStoreSupport() ||
      currentLocation.haveWebDavSupport() ||
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
        <ListItemText primary={t('core:showInFileManager')} />
        <MenuKeyBinding keyBinding={keyBindings['openFileExternally']} />
      </MenuItem>,
    );
  }
  menuItems.push(<Divider key="divider1" />);
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
          <ListItemText primary={t('core:newFileNote')} />
        </MenuItem>,
      );
    }
    if (createNewAudio) {
      menuItems.push(
        <MenuItem
          key="createNewAudio"
          data-tid="createNewAudioTID"
          disabled={!Pro}
          onClick={() => {
            onClose();
            createNewAudio();
          }}
        >
          <ListItemIcon>
            <AudioRecordIcon />
          </ListItemIcon>
          <ListItemText
            primary={
              <>
                {t('core:newAudioRecording')}
                {!Pro && <ProLabel />}
              </>
            }
          />
        </MenuItem>,
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
          <ListItemText primary={t('core:newSubdirectory')} />
        </MenuItem>,
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
          <ListItemText primary={t('core:addFiles')} />
        </MenuItem>,
      );
    }
  }
  if (
    Pro &&
    !isReadOnlyMode &&
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
        <ListItemText primary={t('core:setAsParentFolderThumbnail')} />
      </MenuItem>,
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
          <LinkIcon />
        </ListItemIcon>
        <ListItemText primary={t('core:copySharingLink')} />
      </MenuItem>,
    );
  }

  if (!isReadOnlyMode && showAddRemoveTagsDialog) {
    menuItems.push(
      <MenuItem
        key="dirMenuAddRemoveTags"
        data-tid="dirMenuAddRemoveTags"
        onClick={() => {
          onClose();
          showAddRemoveTagsDialog();
        }}
      >
        <ListItemIcon>
          <TagIcon />
        </ListItemIcon>
        <ListItemText primary={t('core:addRemoveTags')} />
        <MenuKeyBinding keyBinding={keyBindings['addRemoveTags']} />
      </MenuItem>,
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
              {t('core:importMacTags')}
              {!Pro && <ProLabel />}
            </>
          }
        />
      </MenuItem>,
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
        <ListItemText primary={t('core:cameraTakePicture')} />
      </MenuItem>,
    );
  }
  if (!perspectiveMode && switchPerspective) {
    menuItems.push(<Divider key="divider2" />);
    AvailablePerspectives.forEach((perspective) => {
      let badge = <></>;
      if (!Pro && perspective.pro) {
        badge = <ProLabel />;
      }
      if (perspective.beta) {
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
        </MenuItem>,
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
        <ListItemText primary={t('core:directoryPropertiesTitle')} />
        <MenuKeyBinding keyBinding={keyBindings['openEntryDetails']} />
      </MenuItem>,
    );
  }
  return menuItems;
}
