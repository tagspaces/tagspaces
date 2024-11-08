/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces GmbH
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
import { alpha, useTheme } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';
import { saveAs } from 'file-saver';
import { Toolbar, Box, Divider, Badge } from '@mui/material/';
import Tooltip from '-/components/Tooltip';
import TsIconButton from '-/components/TsIconButton';
import SortingIcon from '@mui/icons-material/SwapVerticalCircle';
import ShareIcon from '@mui/icons-material/Share';
import DragOnIcon from '@mui/icons-material/CopyAllTwoTone';
import DragOffIcon from '@mui/icons-material/CopyAll';
import {
  SelectedIcon,
  UnSelectedIcon,
  DownloadIcon,
  TagIcon,
  DeleteIcon,
} from '-/components/CommonIcons';
import CopyIcon from '@mui/icons-material/FileCopy';
import ExportIcon from '@mui/icons-material/AssignmentReturn';
import {
  ParentFolderIcon,
  FolderPropertiesIcon,
  PerspectiveSettingsIcon,
} from '-/components/CommonIcons';
import AppConfig from '-/AppConfig';
import { Pro } from '-/pro';
import { ProTooltip } from '-/components/HelperComponents';
import ZoomComponent from '-/components/ZoomComponent';
import { getKeyBindingObject } from '-/reducers/settings';
import { actions as AppActions, AppDispatch } from '-/reducers/app';
import { useTranslation } from 'react-i18next';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { usePerspectiveSettingsContext } from '-/hooks/usePerspectiveSettingsContext';
import { useDeleteMultipleEntriesDialogContext } from '-/components/dialogs/hooks/useDeleteMultipleEntriesDialogContext';
import { useSortedDirContext } from '-/perspectives/grid/hooks/useSortedDirContext';

interface Props {
  prefixDataTID?: string;
  toggleSelectAllFiles: (event: any) => void;
  openAddRemoveTagsDialog: () => void;
  openMoveCopyFilesDialog: () => void;
  handleSortingMenu: (event: Object) => void;
  handleExportCsvMenu: () => void;
  openSettings: () => void;
  openShareFilesDialog?: () => void;
}

function MainToolbar(props: Props) {
  const {
    prefixDataTID,
    toggleSelectAllFiles,
    openAddRemoveTagsDialog,
    openMoveCopyFilesDialog,
    handleSortingMenu,
    handleExportCsvMenu,
    openSettings,
    openShareFilesDialog,
  } = props;

  const { haveLocalSetting, setSettings, saveSettings } =
    usePerspectiveSettingsContext();
  const { nativeDragModeEnabled, setNativeDragModeEnabled } =
    useSortedDirContext();

  const { t } = useTranslation();
  const theme = useTheme();
  const { openEntry } = useOpenedEntryContext();
  const { loadParentDirectoryContent, currentDirectoryPath } =
    useDirectoryContentContext();
  const { selectedEntries } = useSelectedEntriesContext();
  const keyBindings = useSelector(getKeyBindingObject);
  //const dispatch: AppDispatch = useDispatch();
  const { currentLocation, readOnlyMode } = useCurrentLocationContext();
  const { openDeleteMultipleEntriesDialog } =
    useDeleteMultipleEntriesDialogContext();

  function showProperties() {
    return openEntry(currentDirectoryPath, true);
  }

  function multipleDownload() {
    selectedEntries?.forEach((entry) => {
      if (entry.isFile) {
        const cleanedPath = entry.path.startsWith('/')
          ? entry.path.substr(1)
          : entry.path;
        currentLocation
          .generateURLforPath(cleanedPath, 900)
          .then((url) => fetch(url))
          .then((res) => res.blob()) // Gets the response and returns it as a blob
          .then((blob) => {
            saveAs(blob, entry.name);
          });
      }
    });
  }

  const showDownloadButton =
    AppConfig.isWeb &&
    selectedEntries?.length > 0 &&
    // (PlatformIO.haveObjectStoreSupport() || PlatformIO.haveWebDavSupport()) &&
    !AppConfig.isCordovaAndroid; // saveAs do not work on Android

  const folderSettingsAvailable = haveLocalSetting();

  return (
    <Toolbar
      style={{
        paddingLeft: 5,
        paddingRight: 5,
        position: 'absolute',
        zIndex: 1,
        background:
          'linear-gradient(0deg, ' +
          alpha(theme.palette.background.default, 0.67) +
          ' 0%, ' +
          theme.palette.background.default +
          ' 99%)',
        backdropFilter: 'blur(5px)',
        // borderBottom: '1px solid ' + theme.palette.divider,
        width: 'calc(100% - 10px)',
        overflowX: 'auto',
        overflowY: 'hidden',
      }}
      variant="dense"
      data-tid={prefixDataTID + 'perspectiveToolbar'}
    >
      <Tooltip
        title={t('core:navigateToParentDirectory')}
        keyBinding={keyBindings['openParentDirectory']}
      >
        <TsIconButton
          aria-label={t('core:navigateToParentDirectory')}
          data-tid={prefixDataTID + 'PerspectiveOnBackButton'}
          onClick={() => {
            loadParentDirectoryContent();
          }}
        >
          <ParentFolderIcon />
        </TsIconButton>
      </Tooltip>
      <Tooltip
        title={t('core:toggleSelectAllFiles')}
        keyBinding={keyBindings['selectAll']}
      >
        <TsIconButton
          data-tid={prefixDataTID + 'PerspectiveSelectAllFiles'}
          onClick={toggleSelectAllFiles}
        >
          {selectedEntries.length > 1 ? <SelectedIcon /> : <UnSelectedIcon />}
        </TsIconButton>
      </Tooltip>
      <Tooltip title={t('core:directoryPropertiesTitle')}>
        <TsIconButton
          aria-label={t('core:directoryPropertiesTitle')}
          data-tid="openFolderProperties"
          onClick={showProperties}
        >
          <FolderPropertiesIcon />
        </TsIconButton>
      </Tooltip>
      <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />
      <Box sx={{ display: selectedEntries.length < 1 ? 'none' : 'flex' }}>
        {!readOnlyMode && (
          <Tooltip
            title={t('core:tagSelectedEntries')}
            keyBinding={keyBindings['addRemoveTags']}
          >
            <span>
              <TsIconButton
                aria-label={t('core:tagSelectedEntries')}
                data-tid={prefixDataTID + 'PerspectiveAddRemoveTags'}
                onClick={openAddRemoveTagsDialog}
              >
                <TagIcon />
              </TsIconButton>
            </span>
          </Tooltip>
        )}
        {!readOnlyMode && (
          <Tooltip
            title={t('core:copyMoveSelectedEntries')}
            keyBinding={keyBindings['copyMoveSelectedEntries']}
          >
            <span>
              <TsIconButton
                aria-label={t('core:copyMoveSelectedEntries')}
                data-tid={prefixDataTID + 'PerspectiveCopySelectedFiles'}
                onClick={openMoveCopyFilesDialog}
              >
                <CopyIcon />
              </TsIconButton>
            </span>
          </Tooltip>
        )}
        {!readOnlyMode && (
          <Tooltip
            title={t('core:deleteSelectedEntries')}
            keyBinding={keyBindings['deleteDocument']}
          >
            <span>
              <TsIconButton
                aria-label={t('core:deleteSelectedEntries')}
                data-tid={prefixDataTID + 'PerspectiveDeleteMultipleFiles'}
                onClick={() => openDeleteMultipleEntriesDialog()}
              >
                <DeleteIcon />
              </TsIconButton>
            </span>
          </Tooltip>
        )}
        {openShareFilesDialog && (
          <ProTooltip tooltip={t('core:shareFiles')}>
            <span>
              <TsIconButton
                aria-label={t('core:shareFiles')}
                data-tid={prefixDataTID + 'PerspectiveShareFiles'}
                onClick={openShareFilesDialog}
                disabled={selectedEntries.length < 1}
              >
                <ShareIcon />
              </TsIconButton>
            </span>
          </ProTooltip>
        )}
        <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />
      </Box>
      <Tooltip title={t('core:sort')}>
        <TsIconButton
          aria-label={t('core:sort')}
          data-tid={prefixDataTID + 'PerspectiveSortMenu'}
          onClick={(e) => {
            handleSortingMenu(e);
          }}
        >
          <SortingIcon />
        </TsIconButton>
      </Tooltip>
      {showDownloadButton && (
        <Tooltip title={t('core:downloadFiles')}>
          <TsIconButton
            data-tid={prefixDataTID + 'PerspectiveDownloadMultipleMenuTID'}
            onClick={multipleDownload}
          >
            <DownloadIcon />
          </TsIconButton>
        </Tooltip>
      )}
      {Pro &&
        !AppConfig.isCordovaAndroid && ( // SaveAs do not worlk on Android
          <Tooltip title={t('core:exportCsv')}>
            <TsIconButton
              data-tid={prefixDataTID + 'PerspectiveExportCsvMenuTID'}
              onClick={handleExportCsvMenu}
              style={{ transform: 'scale(-1, 1)' }}
            >
              <ExportIcon />
            </TsIconButton>
          </Tooltip>
        )}
      <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />
      <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
        <ZoomComponent preview={false} />
        <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />
      </Box>
      {AppConfig.isElectron && !currentLocation.haveObjectStoreSupport() && (
        <Tooltip title={t('core:dragMode')}>
          <TsIconButton
            data-tid={prefixDataTID + 'PerspectiveDragNative'}
            onClick={() => {
              setNativeDragModeEnabled(!nativeDragModeEnabled);
            }}
          >
            {nativeDragModeEnabled ? <DragOnIcon /> : <DragOffIcon />}
          </TsIconButton>
        </Tooltip>
      )}
      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ display: 'flex' }}>
        <Tooltip
          title={
            t('core:perspectiveSettingsTitle') +
            (folderSettingsAvailable ? ' - folder specific' : '')
          }
        >
          <TsIconButton
            data-tid={prefixDataTID + 'PerspectiveOptionsMenu'}
            onClick={openSettings}
          >
            {folderSettingsAvailable ? (
              <PerspectiveSettingsIcon color="primary" />
            ) : (
              <PerspectiveSettingsIcon />
            )}
          </TsIconButton>
        </Tooltip>
      </Box>
    </Toolbar>
  );
}

export default MainToolbar;
