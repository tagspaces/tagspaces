/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2023-present TagSpaces GmbH
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

import React from 'react';
import { useSelector } from 'react-redux';
import AppConfig from '-/AppConfig';
import { TS } from '-/tagspaces.namespace';
import { getDesktopMode, getEntryContainerTab } from '-/reducers/settings';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { usePerspectiveSettingsContext } from '-/hooks/usePerspectiveSettingsContext';
import FileSourceDnd from '-/components/FileSourceDnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import TargetFileBox from '-/components/TargetFileBox';
import CustomDragLayer from '-/components/CustomDragLayer';
import TargetMoveFileBox from '-/components/TargetMoveFileBox';
import DragItemTypes from '-/components/DragItemTypes';
import DragHandleIcon from '@mui/icons-material/DragHandleOutlined';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import {
  fileOperationsEnabled,
  folderOperationsEnabled,
} from '-/perspectives/common/main-container';
import { useSortedDirContext } from '-/perspectives/grid/hooks/useSortedDirContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { useEntryExistDialogContext } from '-/components/dialogs/hooks/useEntryExistDialogContext';
import i18n from '-/services/i18n';
import { TabNames } from '-/hooks/EntryPropsTabsContextProvider';
import { useMenuContext } from '-/components/dialogs/hooks/useMenuContext';

interface Props {
  fsEntry: TS.FileSystemEntry;
  index: number;
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
  ) => any;
  isLast?: boolean;
}

function CellView(props: Props) {
  const { fsEntry, index, cellContent, isLast } = props;
  const { showDirectories, singleClickAction } =
    usePerspectiveSettingsContext();
  const theme = useTheme();

  const { openDirectoryMenu, openFileMenu } = useMenuContext();
  const { openEntryInternal, openedEntry } = useOpenedEntryContext();
  const { openDirectory } = useDirectoryContentContext();
  const { moveFiles, openFileNatively } = useIOActionsContext();
  const { readOnlyMode, currentLocationId, findLocation } =
    useCurrentLocationContext();
  const { selectedEntries, setSelectedEntries, lastSelectedEntryPath } =
    useSelectedEntriesContext();
  const { handleEntryExist, openEntryExistDialog } =
    useEntryExistDialogContext();
  const { sortedDirContent, nativeDragModeEnabled } = useSortedDirContext();
  const { showNotification } = useNotificationContext();

  const desktopMode = useSelector(getDesktopMode);
  const selectedTabName = useSelector(getEntryContainerTab);
  // const fileSourceRef = useRef<HTMLDivElement | null>(null);

  /*useEffect(() => {
    const dragItem = fileSourceRef.current;
    if (dragItem) {
      const handleDragStart = (e) => {
        e.preventDefault()
        window.electronIO.ipcRenderer.startDrag(fsEntry.path);
      };

      dragItem.addEventListener('dragstart', handleDragStart);

      return () => {
        dragItem.removeEventListener('dragstart', handleDragStart);
      };
    }
  }, [fileSourceRef.current]);*/

  if (!fsEntry || (!fsEntry.isFile && !showDirectories)) {
    return null;
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
      openFileMenu(event, lastSelectedEntryPath);
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
      openDirectoryMenu(event, fsEntry.path); // lastSelectedEntryPath
    }
  };

  const openLocation = (fsEntry: TS.FileSystemEntry) => {
    if (fsEntry.isFile) {
      setSelectedEntries([fsEntry]);
      openEntryInternal(fsEntry);
      //openEntry(fsEntry.path);
    } else {
      console.log('Handle Grid cell db click, selected path : ', fsEntry.path);
      openDirectory(fsEntry.path);
    }
  };

  const handleGridCellDblClick = (event, fsEntry: TS.FileSystemEntry) => {
    setSelectedEntries([]);
    openLocation(fsEntry);
  };

  const handleGridCellClick = (event, fsEntry: TS.FileSystemEntry) => {
    const selectHelperKey = AppConfig.isMacLike ? event.metaKey : event.ctrlKey;
    if (event.shiftKey) {
      let lastSelectedIndex = -1;
      if (lastSelectedEntryPath) {
        lastSelectedIndex = sortedDirContent.findIndex(
          (entry) => entry.path === lastSelectedEntryPath,
        );
      }
      const currentSelectedIndex = sortedDirContent.findIndex(
        (entry) => entry.path === fsEntry.path,
      );
      if (lastSelectedIndex < 0) {
        lastSelectedIndex = currentSelectedIndex;
      }

      let entriesToSelect;
      // console.log('lastSelectedIndex: ' + lastSelectedIndex + '  currentSelectedIndex: ' + currentSelectedIndex);
      if (currentSelectedIndex > lastSelectedIndex) {
        entriesToSelect = sortedDirContent.slice(
          lastSelectedIndex,
          currentSelectedIndex + 1,
        );
      } else if (currentSelectedIndex < lastSelectedIndex) {
        entriesToSelect = sortedDirContent
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
        const currentSelectedEntry = sortedDirContent.find(
          (entry) => entry.path === fsEntry.path,
        );
        if (currentSelectedEntry) {
          // in KanBan sortedDirContent not content dragging entry from subfolder
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
          if (
            !openedEntry ||
            openedEntry.isFile ||
            selectedTabName !== TabNames.aiTab
          ) {
            // dont open file if chat mode is enabled
            openEntryInternal(fsEntry);
          }
        } else if (singleClickAction === 'openExternal') {
          openFileNatively(fsEntry.path);
        }
      }
    }
  };

  const handleFileMoveDrop = (item, monitor) => {
    if (readOnlyMode) {
      showNotification(
        'Importing files is disabled because the location is in read-only mode.',
        'error',
        true,
      ); //i18n.t('core:dndDisabledReadOnlyMode')
      return;
    }
    if (item) {
      const { entry } = item;
      let arrPath;
      if (
        selectedEntries &&
        selectedEntries.length > 0 &&
        selectedEntries.some((e) => e.path === entry.path)
      ) {
        const arrSelected = selectedEntries
          .map((entry) => entry.path)
          // remove target folder selection
          .filter((epath) => epath !== item.targetPath);
        if (arrSelected.length > 0) {
          arrPath = arrSelected;
        } else {
          arrPath = [entry.path];
        }
      } else if (entry) {
        arrPath = [entry.path];
      }
      console.log('Dropped files: ' + JSON.stringify(arrPath));
      handleEntryExist(selectedEntries, item.targetPath).then((exist) => {
        if (exist) {
          openEntryExistDialog(exist, () => {
            moveFiles(arrPath, item.targetPath, currentLocationId);
          });
        } else {
          moveFiles(arrPath, item.targetPath, currentLocationId);
        }
      });
    }
  };

  const key = fsEntry.path;

  if (fsEntry.isFile) {
    const currentLocation = findLocation();
    return (
      <div>
        {nativeDragModeEnabled &&
          AppConfig.isElectron &&
          currentLocation &&
          !currentLocation.haveObjectStoreSupport() && (
            <div
              style={{
                display: 'flex',
              }}
              draggable="true"
              onDragStart={(e) => {
                e.preventDefault();
                window.electronIO.ipcRenderer.startDrag(fsEntry.path);
              }}
            >
              <DragHandleIcon style={{ color: theme.palette.text.primary }} />
              <Typography
                color="textSecondary"
                variant="caption"
                style={{ alignSelf: 'center' }}
              >
                {i18n.t('dragOutsideApp')}
              </Typography>
            </div>
          )}

        {cellContent(
          fsEntry,
          selectedEntries,
          index,
          handleGridContextMenu,
          handleGridCellClick,
          handleGridCellDblClick,
          isLast,
        )}
      </div>
    );
  }
  const { FILE } = NativeTypes;

  return (
    <div
      style={{
        position: 'relative',
      }}
      key={key}
    >
      <TargetFileBox accepts={[FILE]} directoryPath={fsEntry.path}>
        <CustomDragLayer />
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
      </TargetFileBox>
    </div>
  );
}

export default CellView;
