import AppConfig from '-/AppConfig';
import {
  ChangeBackgroundIcon,
  CopyMoveIcon,
  CopyPictureIcon,
  DeleteIcon,
  EntryPropertiesIcon,
  ImportTagsIcon,
  LinkIcon,
  OpenEntryNativelyIcon,
  OpenFolderIcon,
  OpenNewWindowIcon,
  PictureIcon,
  ReloadIcon,
  RenameIcon,
  TagIcon,
} from '-/components/CommonIcons';
import { ProLabel } from '-/components/HelperComponents';
import MenuKeyBinding from '-/components/menus/MenuKeyBinding';
import NewSubMenu from '-/perspectives/common/NewSubMenu';
import { Pro } from '-/pro';
import {
  getKeyBindingObject,
  isDevMode,
  isHideProFeatures,
} from '-/reducers/settings';
import { TS } from '-/tagspaces.namespace';
import { CommonLocation } from '-/utils/CommonLocation';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import { useSelector } from 'react-redux';

export function getDirectoryMenuItems(
  currentLocation: CommonLocation,
  selectedEntries: TS.FileSystemEntry[],
  perspectiveMode: boolean,
  // todo remove this is param in currentLocation
  isReadOnlyMode: boolean,
  onClose: () => void,
  t: (txt: string) => string,
  openDirectory?: () => void,
  reloadDirectory?: () => void,
  showRenameDirectoryDialog?: () => void,
  openMoveCopyDialog?: (entries?: TS.FileSystemEntry[]) => void,
  showDeleteDirectoryDialog?: () => void,
  showInFileManager?: () => void,
  createNewFile?: (fileType?: TS.FileType) => void,
  createNewAudio?: () => void,
  showCreateDirectoryDialog?: () => void,
  addExistingFile?: () => void,
  setFolderThumbnail?: () => void,
  copySharingLink?: () => void,
  copyRelativePath?: () => void,
  extractTags?: () => void,
  switchPerspective?: (perspectiveId: string) => void,
  showProperties?: () => void,
  cameraTakePicture?: () => void,
  showAddRemoveTagsDialog?: (
    entries: TS.FileSystemEntry[],
    openedEntry?: TS.FileSystemEntry,
    fileChanged?: boolean,
  ) => void,
  openInNewWindow?: () => void,
  changeFolderThumbnail?: () => void,
  changeFolderBackground?: () => void,
) {
  const keyBindings = useSelector(getKeyBindingObject);
  const devMode: boolean = useSelector(isDevMode);
  const hideProFeatures: boolean = useSelector(isHideProFeatures);
  const menuItems = [];
  if (selectedEntries.length < 2) {
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
      if (openInNewWindow && !AppConfig.isNativeMobile) {
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
            <RenameIcon />
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
          openMoveCopyDialog(selectedEntries);
        }}
      >
        <ListItemIcon>
          <CopyMoveIcon />
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

  if (!isReadOnlyMode && showAddRemoveTagsDialog) {
    menuItems.push(
      <MenuItem
        key="dirMenuAddRemoveTags"
        data-tid="dirMenuAddRemoveTags"
        onClick={() => {
          onClose();
          showAddRemoveTagsDialog(selectedEntries);
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
    currentLocation &&
    selectedEntries.length < 2 &&
    !(
      currentLocation.haveObjectStoreSupport() ||
      currentLocation.haveWebDavSupport() ||
      AppConfig.isNativeMobile ||
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
          <OpenEntryNativelyIcon />
        </ListItemIcon>
        <ListItemText primary={t('core:showInFileManager')} />
        <MenuKeyBinding keyBinding={keyBindings['openFileExternally']} />
      </MenuItem>,
    );
  }
  menuItems.push(<Divider key={`divider-${menuItems.length}`} />);
  // All create/add actions (new text/markdown/rich-text/link/template/audio
  // file, new subfolder, add from device) are grouped into a single "New ▸"
  // submenu — see NewSubMenu. It owns its own submenu state, so it's pushed as
  // one self-contained element.
  if (
    !isReadOnlyMode &&
    !perspectiveMode &&
    (createNewFile ||
      createNewAudio ||
      showCreateDirectoryDialog ||
      addExistingFile ||
      cameraTakePicture)
  ) {
    menuItems.push(
      <NewSubMenu
        key="newSubMenu"
        onClose={onClose}
        t={t}
        createNewFile={createNewFile}
        createNewAudio={createNewAudio}
        showCreateDirectoryDialog={showCreateDirectoryDialog}
        addExistingFile={addExistingFile}
        cameraTakePicture={cameraTakePicture}
      />,
    );
  }
  if (selectedEntries.length < 2) {
    menuItems.push(<Divider key={`divider-${menuItems.length}`} />);
    if (
      !hideProFeatures &&
      Pro &&
      !isReadOnlyMode &&
      setFolderThumbnail &&
      perspectiveMode
    ) {
      menuItems.push(
        <MenuItem
          key="setAsThumb"
          data-tid="setAsThumbTID"
          disabled={!Pro}
          onClick={() => {
            onClose();
            setFolderThumbnail();
          }}
        >
          <ListItemIcon>
            <CopyPictureIcon />
            {!Pro && <ProLabel />}
          </ListItemIcon>
          <ListItemText primary={t('core:setAsParentFolderThumbnail')} />
        </MenuItem>,
      );
    }
    if (!hideProFeatures && Pro && !isReadOnlyMode && changeFolderThumbnail) {
      menuItems.push(
        <MenuItem
          key="changeThumb"
          data-tid="changeThumbTID"
          disabled={!Pro}
          onClick={() => {
            onClose();
            changeFolderThumbnail();
          }}
        >
          <ListItemIcon>
            <PictureIcon />
            {!Pro && <ProLabel />}
          </ListItemIcon>
          <ListItemText primary={t('core:changeThumbnail')} />
        </MenuItem>,
      );
    }
    if (!hideProFeatures && Pro && !isReadOnlyMode && changeFolderBackground) {
      menuItems.push(
        <MenuItem
          key="changeBackground"
          data-tid="changeBackgroundTID"
          disabled={!Pro}
          onClick={() => {
            onClose();
            changeFolderBackground();
          }}
        >
          <ListItemIcon>
            <ChangeBackgroundIcon />
            {!Pro && <ProLabel />}
          </ListItemIcon>
          <ListItemText primary={t('core:changeBackgroundColor')} />
        </MenuItem>,
      );
    }
  }
  if (selectedEntries.length === 1 && copyRelativePath) {
    menuItems.push(
      <MenuItem
        key="copyRelativePath"
        data-tid="copyRelativePathTID"
        onClick={() => {
          onClose();
          copyRelativePath();
        }}
      >
        <ListItemIcon>
          <LinkIcon />
        </ListItemIcon>
        <ListItemText primary={t('core:copyRelativePath')} />
      </MenuItem>,
    );
  }
  if (selectedEntries.length === 1 && copySharingLink) {
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

  if (!hideProFeatures && !isReadOnlyMode && extractTags) {
    menuItems.push(
      <MenuItem
        key="extractTags"
        data-tid="extractTags"
        disabled={!Pro}
        onClick={() => {
          onClose();
          extractTags();
        }}
      >
        <ListItemIcon>
          <ImportTagsIcon />
        </ListItemIcon>
        <ListItemText
          primary={
            <>
              {t('core:extractTags')}
              {!Pro && <ProLabel />}
            </>
          }
        />
      </MenuItem>,
    );
  }

  if (selectedEntries.length < 2 && showProperties) {
    menuItems.push(<Divider key={`divider-${menuItems.length}`} />);
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
          <EntryPropertiesIcon />
        </ListItemIcon>
        <ListItemText primary={t('core:directoryPropertiesTitle')} />
        <MenuKeyBinding keyBinding={keyBindings['openEntryDetails']} />
      </MenuItem>,
    );
  }
  return menuItems;
}
