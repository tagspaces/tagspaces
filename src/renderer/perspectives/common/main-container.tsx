import { TS } from '-/tagspaces.namespace';
import FileSourceDnd from '-/components/FileSourceDnd';
import TargetMoveFileBox from '-/components/TargetMoveFileBox';
import DragItemTypes from '-/components/DragItemTypes';
import React from 'react';
import { locationType } from '@tagspaces/tagspaces-common/misc';
import PlatformIO from '-/services/platform-facade';
import AppConfig from '-/AppConfig';
import TagDropContainer from '-/components/TagDropContainer';
import { getAllPropertiesPromise } from '-/services/utils-io';

export const fileOperationsEnabled = (selectedEntries) => {
  let selectionContainsDirectories = false;
  if (selectedEntries && selectedEntries.length > 0) {
    selectionContainsDirectories = selectedEntries.some(
      (entry) => entry !== undefined && !entry.isFile,
    );
    return !selectionContainsDirectories;
  }
  return false;
};

export const folderOperationsEnabled = (selectedEntries) => {
  let selectionContainsFiles = false;
  if (selectedEntries && selectedEntries.length > 0) {
    selectionContainsFiles = selectedEntries.some(
      (entry) => entry !== undefined && entry.isFile,
    );
  }
  return !selectionContainsFiles;
};

export const renderCell = (
  fsEntry: TS.FileSystemEntry,
  index: number,
  cellContent: (
    fsEntry: TS.FileSystemEntry,
    selectedEntries: Array<TS.FileSystemEntry>,
    index: number,
    handleGridContextMenu: (
      event: React.MouseEvent<HTMLDivElement>,
      fsEntry: TS.FileSystemEntry,
    ) => void,
    handleGridCellClick,
    handleGridCellDblClick,
    isLast?: boolean,
  ) => any,
  showDirectories: boolean,
  isReadOnlyMode: boolean,
  desktopMode: boolean,
  singleClickAction: string,
  currentLocation,
  selectedEntries,
  setSelectedEntries,
  lastSelectedEntryPath,
  directoryContent,
  openFsEntry,
  openFileNatively,
  openDirectory,
  setFileContextMenuAnchorEl,
  setDirContextMenuAnchorEl,
  switchLocationTypeByID,
  showNotification: (
    text: string,
    notificationType: string,
    autohide: boolean,
  ) => void,
  moveFiles: (files: Array<string>, destination: string) => Promise<boolean>,
  clearSelection: () => void,
  isLast?: boolean,
) => {
  if (!fsEntry.isFile && !showDirectories) {
    return;
  }

  const handleGridContextMenu = (event, fsEntry: TS.FileSystemEntry) => {
    event.preventDefault();
    event.stopPropagation();
    // setMouseX(event.clientX);
    // setMouseY(event.clientY);
    const isEntryExist = selectedEntries.some(
      (entry) => entry.uuid === fsEntry.uuid,
    );
    if (fsEntry.isFile) {
      if (!desktopMode) {
        if (!isEntryExist) {
          if (selectedEntries.length > 0) {
            setSelectedEntries([...selectedEntries, fsEntry]);
          } else {
            setSelectedEntries([fsEntry]);
          }
        }
      } else if (
        selectedEntries.length === 0 ||
        !fileOperationsEnabled(selectedEntries)
      ) {
        setSelectedEntries([fsEntry]);
      } else if (event.ctrlKey) {
        if (!isEntryExist) {
          setSelectedEntries([...selectedEntries, fsEntry]);
        }
      } else if (isEntryExist) {
        // update selected entry
        setSelectedEntries([
          ...selectedEntries.filter((entry) => entry.uuid !== fsEntry.uuid),
          fsEntry,
        ]);
      } else {
        setSelectedEntries([fsEntry]);
      }
      setFileContextMenuAnchorEl(event.currentTarget);
    } else {
      if (
        selectedEntries.length === 0 ||
        !folderOperationsEnabled(selectedEntries)
      ) {
        setSelectedEntries([fsEntry]);
      } else if (isEntryExist) {
        // update selected entry
        setSelectedEntries([
          ...selectedEntries.filter((entry) => entry.uuid !== fsEntry.uuid),
          fsEntry,
        ]);
      } else {
        setSelectedEntries([fsEntry]);
      }
      if (setDirContextMenuAnchorEl) {
        setDirContextMenuAnchorEl(event.currentTarget);
      }
    }
  };

  const openLocation = (fsEntry: TS.FileSystemEntry) => {
    if (fsEntry.isFile) {
      setSelectedEntries([fsEntry]);
      openFsEntry(fsEntry);
      //openEntry(fsEntry.path);
    } else {
      console.log('Handle Grid cell db click, selected path : ', fsEntry.path);
      openDirectory(fsEntry.path);
    }
  };

  const handleGridCellDblClick = (event, fsEntry: TS.FileSystemEntry) => {
    setSelectedEntries([]);
    if (currentLocation.type === locationType.TYPE_CLOUD) {
      PlatformIO.enableObjectStoreSupport(currentLocation)
        .then(() => {
          openLocation(fsEntry);
          return true;
        })
        .catch((error) => {
          console.log('enableObjectStoreSupport', error);
        });
    } else if (currentLocation.type === locationType.TYPE_WEBDAV) {
      PlatformIO.enableWebdavSupport(currentLocation);
      openLocation(fsEntry);
    } else if (currentLocation.type === locationType.TYPE_LOCAL) {
      PlatformIO.disableObjectStoreSupport();
      PlatformIO.disableWebdavSupport();
      openLocation(fsEntry);
    }
  };

  const handleGridCellClick = (event, fsEntry: TS.FileSystemEntry) => {
    /*const {
      selectedEntries,
      directoryContent,
      lastSelectedEntry,
      setSelectedEntries
    } = props;*/
    const selectHelperKey = AppConfig.isMacLike ? event.metaKey : event.ctrlKey;
    if (event.shiftKey) {
      let lastSelectedIndex;
      if (lastSelectedEntryPath) {
        lastSelectedIndex = directoryContent.findIndex(
          (entry) => entry.path === lastSelectedEntryPath,
        );
      }
      const currentSelectedIndex = directoryContent.findIndex(
        (entry) => entry.path === fsEntry.path,
      );
      if (lastSelectedIndex < 0) {
        lastSelectedIndex = currentSelectedIndex;
      }

      let entriesToSelect;
      // console.log('lastSelectedIndex: ' + lastSelectedIndex + '  currentSelectedIndex: ' + currentSelectedIndex);
      if (currentSelectedIndex > lastSelectedIndex) {
        entriesToSelect = directoryContent.slice(
          lastSelectedIndex,
          currentSelectedIndex + 1,
        );
      } else if (currentSelectedIndex < lastSelectedIndex) {
        entriesToSelect = directoryContent
          .slice(currentSelectedIndex, lastSelectedIndex + 1)
          .reverse();
      } else if (currentSelectedIndex === lastSelectedIndex) {
        entriesToSelect = [fsEntry];
      }

      setSelectedEntries(entriesToSelect);
    } else if (event.type === 'drag') {
      if (
        selectedEntries &&
        selectedEntries.some((entry) => entry.path === fsEntry.path)
      ) {
      } else {
        const currentSelectedEntry = directoryContent.find(
          (entry) => entry.path === fsEntry.path,
        );
        if (currentSelectedEntry) {
          // in KanBan directoryContent not content dragging entry from subfolder
          setSelectedEntries([currentSelectedEntry]);
        }
      }
    } else if (selectHelperKey) {
      if (
        selectedEntries &&
        selectedEntries.some((entry) => entry.path === fsEntry.path)
      ) {
        setSelectedEntries(
          selectedEntries.filter((entry) => entry.path !== fsEntry.path),
        ); // deselect selected entry
      } else {
        setSelectedEntries([...selectedEntries, fsEntry]);
      }
    } else {
      setSelectedEntries([fsEntry]);
      if (fsEntry.isFile) {
        if (singleClickAction === 'openInternal') {
          switchLocationTypeByID(fsEntry.locationID).then(() => {
            getAllPropertiesPromise(fsEntry.path)
              .then((entry: TS.FileSystemEntry) => {
                if (entry) {
                  openFsEntry(entry);
                } else {
                  openFsEntry(fsEntry);
                  showNotification(
                    'File ' + fsEntry.path + ' not exist on filesystem!',
                    'warning',
                    true,
                  );
                }
              })
              .catch((error) => {
                console.warn(
                  'Error getting properties for entry: ' +
                    fsEntry.path +
                    ' - ' +
                    error,
                );
                return false;
              });
          });
        } else if (singleClickAction === 'openExternal') {
          openFileNatively(fsEntry.path);
        }
      }
    }
  };

  const handleFileMoveDrop = (item, monitor) => {
    if (isReadOnlyMode) {
      showNotification(
        'Importing files is disabled because the location is in read-only mode.',
        'error',
        true,
      ); //i18n.t('core:dndDisabledReadOnlyMode')
      return;
    }
    if (item) {
      // const mItem = monitor.getItem();
      let arrPath;
      if (item.selectedEntries && item.selectedEntries.length > 0) {
        const arrSelected = item.selectedEntries
          .map((entry) => entry.path)
          // remove target folder selection
          .filter((epath) => epath !== item.targetPath);
        if (arrSelected.length > 0) {
          arrPath = arrSelected;
        } else {
          arrPath = [item.path];
        }
      } else {
        arrPath = [item.path];
      }
      console.log('Dropped files: ' + item.path);
      moveFiles(arrPath, item.targetPath);
      //clearSelection();
    }
  };

  const key = fsEntry.path;

  if (fsEntry.isFile) {
    return (
      <FileSourceDnd key={key}>
        {cellContent(
          fsEntry,
          selectedEntries,
          index,
          handleGridContextMenu,
          handleGridCellClick,
          handleGridCellDblClick,
          isLast,
        )}
      </FileSourceDnd>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
      }}
      key={key}
    >
      <TargetMoveFileBox
        accepts={[DragItemTypes.FILE]}
        targetPath={fsEntry.path}
        onDrop={handleFileMoveDrop}
      >
        {cellContent(
          fsEntry,
          selectedEntries,
          index,
          handleGridContextMenu,
          handleGridCellClick,
          handleGridCellDblClick,
          isLast,
        )}
      </TargetMoveFileBox>
    </div>
  );
};

export const renderCellPlaceholder = () => {
  return (
    <div
      style={{
        position: 'relative',
      }}
    >
      <TagDropContainer entryPath="">
        <div></div>
      </TagDropContainer>
    </div>
  );
};
