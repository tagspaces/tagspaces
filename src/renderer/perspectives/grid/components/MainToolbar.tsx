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

import AppConfig from '-/AppConfig';
import {
  AIIcon,
  CopyMoveIcon,
  DeleteIcon,
  DownloadIcon,
  DragOffIcon,
  DragOnIcon,
  EntryPropertiesIcon,
  ExportIcon,
  ParentFolderIcon,
  PerspectiveSettingsIcon,
  SelectedIcon,
  ShareIcon,
  SortingIcon,
  TagIcon,
  UnSelectedIcon,
} from '-/components/CommonIcons';
import { ProTooltip } from '-/components/HelperComponents';
import TsToolbarButton from '-/components/TsToolbarButton';
import ZoomComponent from '-/components/ZoomComponent';
import { useAiGenerationDialogContext } from '-/components/dialogs/hooks/useAiGenerationDialogContext';
import { useDeleteMultipleEntriesDialogContext } from '-/components/dialogs/hooks/useDeleteMultipleEntriesDialogContext';
import { TabNames } from '-/hooks/EntryPropsTabsContextProvider';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { usePerspectiveSettingsContext } from '-/hooks/usePerspectiveSettingsContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { useSortedDirContext } from '-/perspectives/grid/hooks/useSortedDirContext';
import { Pro } from '-/pro';
import { getKeyBindingObject } from '-/reducers/settings';
import { Box, Divider, Toolbar } from '@mui/material/';
import { alpha, useTheme } from '@mui/material/styles';
import { saveAs } from 'file-saver';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

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

  const { haveLocalSetting } = usePerspectiveSettingsContext();
  const { openAiGenerationDialog } = useAiGenerationDialogContext();
  const { nativeDragModeEnabled, setNativeDragModeEnabled } =
    useSortedDirContext();

  const { t } = useTranslation();
  const theme = useTheme();
  const { openEntry } = useOpenedEntryContext();
  const { loadParentDirectoryContent, currentDirectoryPath } =
    useDirectoryContentContext();
  const { selectedEntries } = useSelectedEntriesContext();
  const keyBindings = useSelector(getKeyBindingObject);
  const { findLocation, readOnlyMode } = useCurrentLocationContext();
  const { openDeleteMultipleEntriesDialog } =
    useDeleteMultipleEntriesDialogContext();
  const currentLocation = findLocation();

  function showProperties() {
    return openEntry(currentDirectoryPath, TabNames.propertiesTab);
  }

  function multipleDownload() {
    selectedEntries?.forEach((entry) => {
      if (entry.isFile) {
        const cleanedPath = entry.path.startsWith('/')
          ? entry.path.substr(1)
          : entry.path;
        currentLocation
          ?.generateURLforPath(cleanedPath, 900)
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
      <TsToolbarButton
        tooltip={t('core:navigateToParentDirectory')}
        title={t('core:parentFolder')}
        keyBinding={keyBindings['openParentDirectory']}
        aria-label={t('core:navigateToParentDirectory')}
        data-tid={prefixDataTID + 'PerspectiveOnBackButton'}
        onClick={() => {
          loadParentDirectoryContent();
        }}
      >
        <ParentFolderIcon />
      </TsToolbarButton>
      <TsToolbarButton
        tooltip={t('core:toggleSelectAllFiles')}
        title={t('core:selectAll')}
        keyBinding={keyBindings['selectAll']}
        data-tid={prefixDataTID + 'PerspectiveSelectAllFiles'}
        onClick={toggleSelectAllFiles}
      >
        {selectedEntries.length > 1 ? <SelectedIcon /> : <UnSelectedIcon />}
      </TsToolbarButton>
      <TsToolbarButton
        tooltip={t('core:directoryPropertiesTitle')}
        title={t('core:details')}
        aria-label={t('core:directoryPropertiesTitle')}
        data-tid="openFolderProperties"
        onClick={showProperties}
      >
        <EntryPropertiesIcon />
      </TsToolbarButton>
      <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1.5 }} />
      <Box sx={{ display: selectedEntries.length < 1 ? 'none' : 'flex' }}>
        {!readOnlyMode && (
          <TsToolbarButton
            tooltip={t('core:fileTags')}
            title={t('core:fileTags')}
            keyBinding={keyBindings['addRemoveTags']}
            aria-label={t('core:tagSelectedEntries')}
            data-tid={prefixDataTID + 'PerspectiveAddRemoveTags'}
            onClick={openAddRemoveTagsDialog}
          >
            <TagIcon />
          </TsToolbarButton>
        )}
        {!readOnlyMode && (
          <TsToolbarButton
            tooltip={t('core:aiGenSelectedEntries')}
            title={t('core:aiSettingsTab')}
            aria-label={t('core:aiGenSelectedEntries')}
            data-tid={prefixDataTID + 'PerspectiveAiGenTID'}
            onClick={() => openAiGenerationDialog()}
          >
            <AIIcon />
          </TsToolbarButton>
        )}
        {!readOnlyMode && (
          <TsToolbarButton
            tooltip={t('core:copyMoveSelectedEntries')}
            title={
              t('core:copyEntriesButton') + '/' + t('core:moveEntriesButton')
            }
            keyBinding={keyBindings['copyMoveSelectedEntries']}
            aria-label={t('core:copyMoveSelectedEntries')}
            data-tid={prefixDataTID + 'PerspectiveCopySelectedFiles'}
            onClick={openMoveCopyFilesDialog}
          >
            <CopyMoveIcon />
          </TsToolbarButton>
        )}
        {!readOnlyMode && (
          <TsToolbarButton
            tooltip={t('core:deleteSelectedEntries')}
            title={t('core:delete')}
            keyBinding={keyBindings['deleteDocument']}
            aria-label={t('core:deleteSelectedEntries')}
            data-tid={prefixDataTID + 'PerspectiveDeleteMultipleFiles'}
            onClick={() => openDeleteMultipleEntriesDialog()}
          >
            <DeleteIcon />
          </TsToolbarButton>
        )}
        {openShareFilesDialog && currentLocation?.haveObjectStoreSupport() && (
          <ProTooltip tooltip={t('core:shareFiles')}>
            <TsToolbarButton
              aria-label={t('core:shareFiles')}
              data-tid={prefixDataTID + 'PerspectiveShareFiles'}
              onClick={openShareFilesDialog}
              disabled={selectedEntries.length < 1}
            >
              <ShareIcon />
            </TsToolbarButton>
          </ProTooltip>
        )}
        <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />
      </Box>
      <TsToolbarButton
        tooltip={t('core:sort')}
        aria-label={t('core:sort')}
        title={t('core:sort')}
        data-tid={prefixDataTID + 'PerspectiveSortMenu'}
        onClick={(e) => {
          handleSortingMenu(e);
        }}
      >
        <SortingIcon />
      </TsToolbarButton>
      {showDownloadButton && (
        <TsToolbarButton
          tooltip={t('core:downloadFiles')}
          title={t('core:downloadsFolder')}
          data-tid={prefixDataTID + 'PerspectiveDownloadMultipleMenuTID'}
          onClick={multipleDownload}
        >
          <DownloadIcon />
        </TsToolbarButton>
      )}
      {Pro &&
        !AppConfig.isCordovaAndroid && ( // SaveAs do not work on Android
          <TsToolbarButton
            tooltip={t('core:exportCsv')}
            title={t('core:startExportButton')}
            data-tid={prefixDataTID + 'PerspectiveExportCsvMenuTID'}
            onClick={handleExportCsvMenu}
          >
            <ExportIcon />
          </TsToolbarButton>
        )}
      <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1.5 }} />
      <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
        <ZoomComponent preview={false} />
        <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />
      </Box>
      {AppConfig.isElectron && !currentLocation?.haveObjectStoreSupport() && (
        <TsToolbarButton
          tooltip={t('core:dragMode')}
          data-tid={prefixDataTID + 'PerspectiveDragNative'}
          onClick={() => {
            setNativeDragModeEnabled(!nativeDragModeEnabled);
          }}
          title={t('core:dragMode')}
        >
          {nativeDragModeEnabled ? <DragOnIcon /> : <DragOffIcon />}
        </TsToolbarButton>
      )}
      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ display: 'flex' }}>
        <TsToolbarButton
          tooltip={
            t('core:perspectiveSettingsTitle') +
            (folderSettingsAvailable ? ' - folder specific' : '')
          }
          title={t('core:setting')}
          data-tid={prefixDataTID + 'PerspectiveOptionsMenu'}
          onClick={openSettings}
        >
          {folderSettingsAvailable ? (
            <PerspectiveSettingsIcon color="primary" />
          ) : (
            <PerspectiveSettingsIcon />
          )}
        </TsToolbarButton>
      </Box>
    </Toolbar>
  );
}

export default MainToolbar;
