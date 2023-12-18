/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces UG (haftungsbeschraenkt)
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
import { useDispatch, useSelector } from 'react-redux';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '-/components/Tooltip';
import IconButton from '@mui/material/IconButton';
import SortingIcon from '@mui/icons-material/SwapVerticalCircle';
import TagIcon from '@mui/icons-material/LocalOffer';
import ShareIcon from '@mui/icons-material/Share';
import { SelectedIcon, UnSelectedIcon } from '-/components/CommonIcons';
import CopyIcon from '@mui/icons-material/FileCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import ExportIcon from '@mui/icons-material/AssignmentReturn';
import {
  ParentFolderIcon,
  FolderPropertiesIcon,
  PerspectiveSettingsIcon,
} from '-/components/CommonIcons';
import AppConfig from '-/AppConfig';
import { Pro } from '-/pro';
import { ProTooltip } from '-/components/HelperComponents';
import { getKeyBindingObject } from '-/reducers/settings';
import { TS } from '-/tagspaces.namespace';
import { actions as AppActions, AppDispatch } from '-/reducers/app';
import {
  classes,
  GridStyles,
} from '-/perspectives/grid-perspective/components/styles.css';
import { useTranslation } from 'react-i18next';
import { useOpenedEntryContext } from '-/hooks/useOpenedEntryContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useLocationIndexContext } from '-/hooks/useLocationIndexContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';

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

  const { t } = useTranslation();
  const { openEntry } = useOpenedEntryContext();
  const { loadParentDirectoryContent, currentDirectoryPath } =
    useDirectoryContentContext();
  const { selectedEntries } = useSelectedEntriesContext();
  const keyBindings = useSelector(getKeyBindingObject);
  const dispatch: AppDispatch = useDispatch();
  const { readOnlyMode } = useCurrentLocationContext();

  function showProperties() {
    return openEntry(currentDirectoryPath, true);
  }

  return (
    <GridStyles>
      <Toolbar
        className={classes.topToolbar}
        data-tid={prefixDataTID + 'perspectiveToolbar'}
      >
        <Tooltip
          title={
            t('core:navigateToParentDirectory') +
            ' (' +
            keyBindings['openParentDirectory']
              .replace('command', '⌘')
              .replace('+', ' + ')
              .toUpperCase() +
            ')'
          }
        >
          <IconButton
            aria-label={t('core:navigateToParentDirectory')}
            data-tid={prefixDataTID + 'PerspectiveOnBackButton'}
            onClick={() => {
              /*if (searchQuery && Object.keys(searchQuery).length > 0) {
                dispatch(LocationIndexActions.setSearchQuery({}));
                openCurrentDirectory();
              } else {*/
              loadParentDirectoryContent();
            }}
            size="large"
          >
            <ParentFolderIcon />
          </IconButton>
        </Tooltip>
        <Tooltip
          title={
            t('core:toggleSelectAllFiles') +
            ' (' +
            keyBindings['selectAll']
              .replace('command', '⌘')
              .replace('+', ' + ')
              .toUpperCase() +
            ')'
          }
        >
          <IconButton
            data-tid={prefixDataTID + 'PerspectiveSelectAllFiles'}
            onClick={toggleSelectAllFiles}
            size="large"
          >
            {selectedEntries.length > 1 ? <SelectedIcon /> : <UnSelectedIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title={t('core:directoryPropertiesTitle')}>
          <IconButton
            aria-label={t('core:directoryPropertiesTitle')}
            data-tid="openFolderProperties"
            onClick={showProperties}
            size="large"
          >
            <FolderPropertiesIcon />
          </IconButton>
        </Tooltip>
        {!readOnlyMode && (
          <Tooltip
            title={
              t('core:tagSelectedEntries') +
              ' (' +
              keyBindings['addRemoveTags']
                .replace('command', '⌘')
                .replace('+', ' + ')
                .toUpperCase() +
              ')'
            }
          >
            <span>
              <IconButton
                aria-label={t('core:tagSelectedEntries')}
                data-tid={prefixDataTID + 'PerspectiveAddRemoveTags'}
                disabled={selectedEntries.length < 1}
                onClick={openAddRemoveTagsDialog}
                size="large"
              >
                <TagIcon />
              </IconButton>
            </span>
          </Tooltip>
        )}
        {!readOnlyMode && (
          <Tooltip title={t('core:copyMoveSelectedEntries')}>
            <span>
              <IconButton
                aria-label={t('core:copyMoveSelectedEntries')}
                data-tid={prefixDataTID + 'PerspectiveCopySelectedFiles'}
                disabled={selectedEntries.length < 1}
                onClick={openMoveCopyFilesDialog}
                size="large"
              >
                <CopyIcon />
              </IconButton>
            </span>
          </Tooltip>
        )}
        {!readOnlyMode && (
          <Tooltip
            title={
              t('core:deleteSelectedEntries') +
              ' (' +
              keyBindings['deleteDocument'].toUpperCase() +
              ')'
            }
          >
            <span>
              <IconButton
                aria-label={t('core:deleteSelectedEntries')}
                data-tid={prefixDataTID + 'PerspectiveDeleteMultipleFiles'}
                onClick={() =>
                  dispatch(AppActions.toggleDeleteMultipleEntriesDialog())
                }
                disabled={selectedEntries.length < 1}
                size="large"
              >
                <DeleteIcon />
              </IconButton>
            </span>
          </Tooltip>
        )}
        {openShareFilesDialog && (
          <ProTooltip tooltip={t('core:shareFiles')}>
            <span>
              <IconButton
                aria-label={t('core:shareFiles')}
                data-tid={prefixDataTID + 'PerspectiveShareFiles'}
                onClick={openShareFilesDialog}
                disabled={selectedEntries.length < 1}
                size="large"
              >
                <ShareIcon />
              </IconButton>
            </span>
          </ProTooltip>
        )}
        <Tooltip title={t('core:sort')}>
          <IconButton
            // title={t('core:sort')}
            aria-label={t('core:sort')}
            data-tid={prefixDataTID + 'PerspectiveSortMenu'}
            onClick={(e) => {
              handleSortingMenu(e);
            }}
            size="large"
          >
            <SortingIcon />
          </IconButton>
        </Tooltip>
        {Pro &&
          !AppConfig.isCordovaAndroid && ( // https://trello.com/c/z6ESlqxz/697-exports-to-json-or-csv-do-not-work-on-android
            <Tooltip title={t('core:exportCsv')}>
              <IconButton
                data-tid={prefixDataTID + 'PerspectiveExportCsvMenuTID'}
                onClick={handleExportCsvMenu}
                style={{ transform: 'scale(-1, 1)' }}
                size="large"
              >
                <ExportIcon />
              </IconButton>
            </Tooltip>
          )}
        <Tooltip title={t('core:perspectiveSettingsTitle')}>
          <IconButton
            data-tid={prefixDataTID + 'PerspectiveOptionsMenu'}
            onClick={openSettings}
            size="large"
          >
            <PerspectiveSettingsIcon />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </GridStyles>
  );
}

export default MainToolbar;
