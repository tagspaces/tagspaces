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

import AppConfig from '-/AppConfig';
import CustomDragLayer from '-/components/CustomDragLayer';
import DragItemTypes from '-/components/DragItemTypes';
import TargetFileBox from '-/components/TargetFileBox';
import TargetMoveFileBox from '-/components/TargetMoveFileBox';
import { useMenuContext } from '-/components/dialogs/hooks/useMenuContext';
import { TabNames } from '-/hooks/EntryPropsTabsContextProvider';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useIOActionsContext } from '-/hooks/useIOActionsContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { usePerspectiveSettingsContext } from '-/hooks/usePerspectiveSettingsContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { useSelectedEntriesRef } from '-/hooks/useSelectedEntriesRef';
import {
  fileOperationsEnabled,
  folderOperationsEnabled,
} from '-/perspectives/common/main-container';
import { useSortedDirContext } from '-/perspectives/grid/hooks/useSortedDirContext';
import { getEntryContainerTab } from '-/reducers/settings';
import i18n from '-/services/i18n';
import { TS } from '-/tagspaces.namespace';
import DragHandleIcon from '@mui/icons-material/DragHandleOutlined';
import { Box } from '@mui/material';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { extractContainingDirectoryPath } from '@tagspaces/tagspaces-common/paths';
import React, { memo } from 'react';
import { NativeTypes } from 'react-dnd-html5-backend';
import { useSelector } from 'react-redux';

interface Props {
  fsEntry: TS.FileSystemEntry;
  index: number;
  // Per-cell selection state computed once by the parent (GridPagination /
  // List MainContainer). Passing booleans here — instead of the full
  // selectedEntries array — lets the surrounding `memo()` actually skip
  // re-renders when the global selection changes for some other entry.
  selected: boolean;
  selectionMode: boolean;
  cellContent: (
    fsEntry: TS.FileSystemEntry,
    selected: boolean,
    selectionMode: boolean,
    index: number,
    handleGridContextMenu: (
      event: React.MouseEvent<HTMLDivElement>,
      fsEntry: TS.FileSystemEntry,
    ) => void,
    handleGridCellClick,
    handleGridCellDblClick,
    isLast?: boolean,
  ) => any;
  orderTop?: (entry: TS.FileSystemEntry) => void;
  orderBottom?: (entry: TS.FileSystemEntry) => void;
  isLast?: boolean;
}

function CellView(props: Props) {
  const {
    fsEntry,
    index,
    cellContent,
    selected,
    selectionMode,
    isLast,
    orderTop,
    orderBottom,
  } = props;
  const { showDirectories, singleClickAction } =
    usePerspectiveSettingsContext();
  const theme = useTheme();

  const { openFileMenu, openDirectoryMenu, openMoveCopyFilesDialog } =
    useMenuContext();
  const { openEntryInternal, openedEntry } = useOpenedEntryContext();
  const { openDirectory } = useDirectoryContentContext();
  const { openFileNatively } = useIOActionsContext();
  const { currentLocationId, currentLocation } = useCurrentLocationContext();
  // Read latest selectedEntries on demand from a ref so this memoised
  // component does not re-render on every selection change. Click handlers
  // (shift-range, ctrl-toggle, drag selection) read .current at gesture time.
  const { setSelectedEntries, addToSelection, lastSelectedEntry } =
    useSelectedEntriesContext();
  const selectedEntriesRef = useSelectedEntriesRef();
  const { sortedDirContent, nativeDragModeEnabled } = useSortedDirContext();
  const { showNotification } = useNotificationContext();
  const selectedTabName = useSelector(getEntryContainerTab);

  if (!fsEntry || (!fsEntry.isFile && !showDirectories)) {
    return null;
  }

  const handleGridContextMenu = (event, fsEntry: TS.FileSystemEntry) => {
    event.preventDefault();
    event.stopPropagation();
    const selectedEntries = selectedEntriesRef.current ?? [];
    const isEntryExist = selectedEntries.some(
      (entry) => entry.uuid === fsEntry.uuid,
    );
    if (event.ctrlKey) {
      addToSelection(fsEntry);
    } else {
      const operationEnabled = fsEntry.isFile
        ? fileOperationsEnabled(selectedEntries)
        : folderOperationsEnabled(selectedEntries);
      if (selectedEntries.length === 0 || !operationEnabled || !isEntryExist) {
        setSelectedEntries([fsEntry]);
      } else {
        addToSelection(fsEntry);
      }
      if (fsEntry.isFile) {
        const dirPath = extractContainingDirectoryPath(
          fsEntry.path,
          currentLocation?.getDirSeparator(),
        );
        openFileMenu(event, dirPath, orderTop, orderBottom);
      } else {
        openDirectoryMenu(event, fsEntry.path, true);
      }
    }
  };

  const openLocation = (fsEntry: TS.FileSystemEntry) => {
    if (fsEntry.isFile) {
      setSelectedEntries([fsEntry]);
      openEntryInternal(fsEntry);
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
    const selectedEntries = selectedEntriesRef.current ?? [];
    if (event.shiftKey) {
      let lastSelectedIndex = -1;
      if (lastSelectedEntry) {
        lastSelectedIndex = sortedDirContent.findIndex(
          (entry) => entry.path === lastSelectedEntry.path,
        );
      }
      const currentSelectedIndex = sortedDirContent.findIndex(
        (entry) => entry.path === fsEntry.path,
      );
      if (lastSelectedIndex < 0) {
        lastSelectedIndex = currentSelectedIndex;
      }

      let entriesToSelect;
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
            // do not open file if chat mode is enabled
            openEntryInternal(fsEntry);
          }
        } else if (singleClickAction === 'openExternal') {
          openFileNatively(fsEntry.path);
        }
      }
    }
  };

  const handleFileMoveDrop = (item, monitor) => {
    if (currentLocation?.isReadOnly) {
      showNotification(
        'Importing files is disabled because the location is in read-only mode.',
        'error',
        true,
      );
      return;
    }
    if (item) {
      const { entry } = item;
      const selectedEntries = selectedEntriesRef.current ?? [];
      let arrEntries;
      if (
        selectedEntries.length > 0 &&
        selectedEntries.some((e) => e.path === entry.path)
      ) {
        const arrSelected = selectedEntries.filter(
          (e) => e.path !== item.targetPath,
        );
        if (arrSelected.length > 0) {
          arrEntries = arrSelected;
        } else {
          arrEntries = [entry];
        }
      } else if (entry) {
        arrEntries = [entry];
      }
      openMoveCopyFilesDialog(arrEntries, item.targetPath, currentLocationId);
    }
  };

  const key = fsEntry.path;

  if (fsEntry.isFile) {
    return (
      <div>
        {nativeDragModeEnabled &&
          AppConfig.isElectron &&
          currentLocation &&
          !currentLocation.haveObjectStoreSupport() && (
            <Box
              sx={{
                display: 'flex',
              }}
              draggable="true"
              onDragStart={(e) => {
                e.preventDefault();
                window.electronIO.ipcRenderer.startDrag(fsEntry.path);
              }}
            >
              <DragHandleIcon sx={{ color: theme.palette.text.primary }} />
              <Typography
                variant="caption"
                sx={{ alignSelf: 'center', opacity: 0.5, marginLeft: '5px' }}
              >
                {i18n.t('dragOutsideApp')}
              </Typography>
            </Box>
          )}

        {cellContent(
          fsEntry,
          selected,
          selectionMode,
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
    <Box
      sx={{
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
            selected,
            selectionMode,
            index,
            handleGridContextMenu,
            handleGridCellClick,
            handleGridCellDblClick,
            isLast,
          )}
        </TargetMoveFileBox>
      </TargetFileBox>
    </Box>
  );
}

export default memo(CellView);
