import AppConfig from '-/AppConfig';
import {
  AddExistingFileIcon,
  AudioRecordIcon,
  ChangeBackgroundIcon,
  CopyMoveIcon,
  CopyPictureIcon,
  DeleteIcon,
  EntryPropertiesIcon,
  HTMLFileIcon,
  ImportTagsIcon,
  LinkFileIcon,
  LinkIcon,
  MarkdownFileIcon,
  NewFileIcon,
  NewFolderIcon,
  OpenEntryNativelyIcon,
  OpenFolderIcon,
  OpenNewWindowIcon,
  PictureIcon,
  ReloadIcon,
  RenameIcon,
  TagIcon,
  TemplateFileIcon,
} from '-/components/CommonIcons';
import { ProLabel } from '-/components/HelperComponents';
import InfoIcon from '-/components/InfoIcon';
import MenuKeyBinding from '-/components/menus/MenuKeyBinding';
import { Pro } from '-/pro';
import { getKeyBindingObject, isDevMode } from '-/reducers/settings';
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
  importMacTags?: () => void,
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

  if (
    currentLocation &&
    selectedEntries.length < 2 &&
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
          <OpenEntryNativelyIcon />
        </ListItemIcon>
        <ListItemText primary={t('core:showInFileManager')} />
        <MenuKeyBinding keyBinding={keyBindings['openFileExternally']} />
      </MenuItem>,
    );
  }
  menuItems.push(<Divider key={`divider-${menuItems.length}`} />);
  if (!isReadOnlyMode && !perspectiveMode) {
    if (createNewFile) {
      menuItems.push(
        <MenuItem
          key="createNewTextFile"
          data-tid="createNewTextFileTID"
          onClick={() => {
            onClose();
            createNewFile('txt');
          }}
        >
          <ListItemIcon>
            <NewFileIcon />
          </ListItemIcon>
          <ListItemText primary={t('core:createTextFile')} />
        </MenuItem>,
      );

      menuItems.push(
        <MenuItem
          key="createNewMarkdownFile"
          data-tid="createNewMarkdownFileTID"
          onClick={() => {
            onClose();
            createNewFile('md');
          }}
        >
          <ListItemIcon>
            <MarkdownFileIcon />
          </ListItemIcon>
          <ListItemText primary={t('core:createMarkdown')} />
          <InfoIcon tooltip={t('core:createMarkdownTitle')} />
        </MenuItem>,
      );
      menuItems.push(
        <MenuItem
          key="createHTMLTextFile"
          data-tid="createHTMLTextFileTID"
          onClick={() => {
            onClose();
            createNewFile('html');
          }}
        >
          <ListItemIcon>
            <HTMLFileIcon />
          </ListItemIcon>
          <ListItemText primary={t('core:createRichTextFile')} />
          <InfoIcon tooltip={t('core:createNoteTitle')} />
        </MenuItem>,
      );
      menuItems.push(
        <MenuItem
          key="createNewLinkFile"
          data-tid="createNewLinkFileTID"
          onClick={() => {
            onClose();
            createNewFile('url');
          }}
        >
          <ListItemIcon>
            <LinkFileIcon />
          </ListItemIcon>
          <ListItemText primary={t('core:createLinkFile')} />
        </MenuItem>,
      );
      menuItems.push(
        <MenuItem
          key="createNewFromTemplate"
          data-tid="createNewFromTempateTID"
          onClick={() => {
            onClose();
            createNewFile();
          }}
        >
          <ListItemIcon>
            <TemplateFileIcon />
          </ListItemIcon>
          <ListItemText primary={t('core:createNewFromTemplate')} />
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
      menuItems.push(<Divider key={`divider-${menuItems.length}`} />);
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
  if (Pro && !isReadOnlyMode && selectedEntries.length < 2) {
    menuItems.push(<Divider key={`divider-${menuItems.length}`} />);
    if (setFolderThumbnail && perspectiveMode) {
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
            <CopyPictureIcon />
          </ListItemIcon>
          <ListItemText primary={t('core:setAsParentFolderThumbnail')} />
        </MenuItem>,
      );
    }
    if (changeFolderThumbnail) {
      menuItems.push(
        <MenuItem
          key="changeThumb"
          data-tid="changeThumbTID"
          onClick={() => {
            onClose();
            changeFolderThumbnail();
          }}
        >
          <ListItemIcon>
            <PictureIcon />
          </ListItemIcon>
          <ListItemText primary={t('core:changeThumbnail')} />
        </MenuItem>,
      );
    }
    if (changeFolderBackground) {
      menuItems.push(
        <MenuItem
          key="changeBackground"
          data-tid="changeBackgroundTID"
          onClick={() => {
            onClose();
            changeFolderBackground();
          }}
        >
          <ListItemIcon>
            <ChangeBackgroundIcon />
          </ListItemIcon>
          <ListItemText primary={t('core:changeBackgroundColor')} />
        </MenuItem>,
      );
    }
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
    selectedEntries.length < 2 &&
    AppConfig.isElectron &&
    AppConfig.isMacLike &&
    !perspectiveMode &&
    importMacTags
  ) {
    menuItems.push(
      <MenuItem
        key="importMacTags"
        data-tid="importMacTags"
        disabled={!Pro}
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
  // if (!perspectiveMode && switchPerspective) {
  //   menuItems.push(<Divider key={`divider-${menuItems.length}`} />);
  //   AvailablePerspectives.forEach((perspective) => {
  //     let badge = <></>;
  //     // if (!Pro && perspective.pro) {
  //     //   badge = <ProLabel />;
  //     // }
  //     if (perspective.beta) {
  //       badge = <BetaLabel />;
  //     }
  //     if (!devMode && perspective.id === PerspectiveIDs.CALENDAR) {
  //       return;
  //     }
  //     menuItems.push(
  //       <MenuItem
  //         key={perspective.key}
  //         data-tid={perspective.key}
  //         onClick={() => {
  //           onClose();
  //           switchPerspective(perspective.id);
  //         }}
  //       >
  //         <ListItemIcon>{perspective.icon}</ListItemIcon>
  //         <ListItemText
  //           primary={
  //             <>
  //               {perspective.title}
  //               {badge}
  //             </>
  //           }
  //         />
  //       </MenuItem>,
  //     );
  //   });
  // }

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
