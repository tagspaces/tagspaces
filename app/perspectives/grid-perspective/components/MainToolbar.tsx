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
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import SettingsIcon from '@material-ui/icons/Settings';
import IconButton from '@material-ui/core/IconButton';
import ParentDirIcon from '@material-ui/icons/SubdirectoryArrowLeft';
import ViewGridIcon from '@material-ui/icons/ViewModule';
import SwapVertIcon from '@material-ui/icons/SwapVert';
import ViewListIcon from '@material-ui/icons/ViewList';
import TagIcon from '@material-ui/icons/LocalOffer';
import SelectAllIcon from '@material-ui/icons/CheckBox';
import DeSelectAllIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CopyIcon from '@material-ui/icons/FileCopy';
import DeleteIcon from '@material-ui/icons/Delete';
import ExportIcon from '@material-ui/icons/AssignmentReturn';
import i18n from '-/services/i18n';
import { Pro } from '-/pro';
import AppConfig from '-/config';

interface Props {
  classes: any;
  isReadOnlyMode: boolean;
  selectedEntries: Array<Object>;
  loadParentDirectoryContent: () => void;
  toggleSelectAllFiles: (event: any) => void;
  allFilesSelected: boolean;
  handleLayoutSwitch: (event: Object) => void;
  openAddRemoveTagsDialog: () => void;
  fileOperationsEnabled: boolean;
  openMoveCopyFilesDialog: () => void;
  openDeleteFileDialog: () => void;
  handleSortingMenu: (event: Object) => void;
  handleExportCsvMenu: () => void;
  layoutType: string;
  isDesktopMode: boolean;
  openSettings: () => void;
}

const MainToolbar = (props: Props) => {
  const {
    classes,
    selectedEntries,
    toggleSelectAllFiles,
    allFilesSelected,
    loadParentDirectoryContent,
    layoutType,
    handleLayoutSwitch,
    isReadOnlyMode,
    openAddRemoveTagsDialog,
    openMoveCopyFilesDialog,
    openDeleteFileDialog,
    fileOperationsEnabled,
    handleSortingMenu,
    isDesktopMode,
    openSettings
  } = props;

  return (
    <Toolbar className={classes.topToolbar} data-tid="perspectiveGridToolbar">
      <Tooltip title={i18n.t('core:toggleSelectAllFiles')}>
        <IconButton
          data-tid="gridPerspectiveSelectAllFiles"
          onClick={toggleSelectAllFiles}
        >
          {allFilesSelected ? <SelectAllIcon /> : <DeSelectAllIcon />}
        </IconButton>
      </Tooltip>
      {isDesktopMode && (
        <Tooltip title={i18n.t('core:navigateToParentDirectory')}>
          <IconButton
            aria-label={i18n.t('core:navigateToParentDirectory')}
            data-tid="gridPerspectiveOnBackButton"
            onClick={loadParentDirectoryContent}
          >
            <ParentDirIcon />
          </IconButton>
        </Tooltip>
      )}
      {layoutType === 'row' ? (
        <Tooltip title={i18n.t('core:switchToGridView')}>
          <IconButton
            aria-label={i18n.t('core:switchToGridView')}
            data-tid="gridPerspectiveSwitchLayoutToGrid"
            onClick={() => {
              handleLayoutSwitch('grid');
            }}
          >
            <ViewGridIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title={i18n.t('core:switchToListView')}>
          <IconButton
            aria-label={i18n.t('core:switchToListView')}
            data-tid="gridPerspectiveSwitchLayoutToRow"
            onClick={() => {
              handleLayoutSwitch('row');
            }}
          >
            <ViewListIcon />
          </IconButton>
        </Tooltip>
      )}
      {!isReadOnlyMode && (
        <Tooltip title={i18n.t('core:tagSelectedEntries')}>
          <span>
            <IconButton
              aria-label={i18n.t('core:tagSelectedEntries')}
              data-tid="gridPerspectiveAddRemoveTags"
              disabled={selectedEntries.length < 1}
              onClick={openAddRemoveTagsDialog}
            >
              <TagIcon />
            </IconButton>
          </span>
        </Tooltip>
      )}
      {!isReadOnlyMode && (
        <Tooltip title={i18n.t('core:copyMoveSelectedEntries')}>
          <span>
            <IconButton
              aria-label={i18n.t('core:copyMoveSelectedEntries')}
              data-tid="gridPerspectiveCopySelectedFiles"
              disabled={!fileOperationsEnabled}
              onClick={openMoveCopyFilesDialog}
            >
              <CopyIcon />
            </IconButton>
          </span>
        </Tooltip>
      )}
      {!isReadOnlyMode && (
        <Tooltip title={i18n.t('core:deleteSelectedEntries')}>
          <span>
            <IconButton
              aria-label={i18n.t('core:deleteSelectedEntries')}
              data-tid="gridPerspectiveDeleteMultipleFiles"
              disabled={!fileOperationsEnabled}
              onClick={openDeleteFileDialog}
            >
              <DeleteIcon />
            </IconButton>
          </span>
        </Tooltip>
      )}
      <Tooltip title={i18n.t('core:sort')}>
        <IconButton
          // title={i18n.t('core:sort')}
          aria-label={i18n.t('core:sort')}
          data-tid="gridPerspectiveSortMenu"
          onClick={e => {
            handleSortingMenu(e);
          }}
        >
          <SwapVertIcon />
        </IconButton>
      </Tooltip>
      {Pro &&
      !AppConfig.isCordovaAndroid && ( // https://trello.com/c/z6ESlqxz/697-exports-to-json-or-csv-do-not-work-on-android
          <Tooltip title={i18n.t('core:exportCsv')}>
            <IconButton
              data-tid="gridPerspectiveExportCsvMenuTID"
              onClick={props.handleExportCsvMenu}
              style={{ transform: 'scale(-1, 1)' }}
            >
              <ExportIcon />
            </IconButton>
          </Tooltip>
        )}
      <Tooltip title={i18n.t('core:options')}>
        <IconButton
          data-tid="gridPerspectiveOptionsMenu"
          onClick={openSettings}
        >
          <SettingsIcon />
        </IconButton>
      </Tooltip>
    </Toolbar>
  );
};

export default MainToolbar;
