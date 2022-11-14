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
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '-/components/Tooltip';
import SettingsIcon from '@mui/icons-material/Settings';
import IconButton from '@mui/material/IconButton';
import ParentDirIcon from '@mui/icons-material/DriveFolderUploadRounded';
import SortingIcon from '@mui/icons-material/SwapVerticalCircle';
import TagIcon from '@mui/icons-material/LocalOffer';
import SelectAllIcon from '@mui/icons-material/CheckBox';
import DeSelectAllIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CopyIcon from '@mui/icons-material/FileCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import PropertiesIcon from '@mui/icons-material/Info';
import ExportIcon from '@mui/icons-material/AssignmentReturn';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import AppConfig from '@tagspaces/tagspaces-platforms/AppConfig';
import i18n from '-/services/i18n';
import { Pro } from '-/pro';
import {
  actions as LocationIndexActions,
  getSearchQuery
} from '-/reducers/location-index';
import { getKeyBindingObject } from '-/reducers/settings';
import { getAllPropertiesPromise } from '-/services/utils-io';
import { TS } from '-/tagspaces.namespace';
import { actions as AppActions } from '-/reducers/app';

interface Props {
  classes: any;
  isReadOnlyMode: boolean;
  selectedEntries: Array<Object>;
  loadParentDirectoryContent: () => void;
  toggleSelectAllFiles: (event: any) => void;
  someFileSelected: boolean;
  handleLayoutSwitch: (event: Object) => void;
  openFsEntry: (fsEntry?: TS.FileSystemEntry) => void;
  openAddRemoveTagsDialog: () => void;
  fileOperationsEnabled: boolean;
  openMoveCopyFilesDialog: () => void;
  openDeleteFileDialog: () => void;
  handleSortingMenu: (event: Object) => void;
  handleExportCsvMenu: () => void;
  layoutType: string;
  openSettings: () => void;
  searchQuery: TS.SearchQuery;
  setSearchQuery: (searchQuery: TS.SearchQuery) => void;
  openCurrentDirectory: () => void;
  directoryPath: string;
  keyBindings: Array<any>;
}

function MainToolbar(props: Props) {
  const {
    classes,
    selectedEntries,
    toggleSelectAllFiles,
    someFileSelected,
    loadParentDirectoryContent,
    layoutType,
    handleLayoutSwitch,
    isReadOnlyMode,
    openAddRemoveTagsDialog,
    openMoveCopyFilesDialog,
    openDeleteFileDialog,
    fileOperationsEnabled,
    handleSortingMenu,
    openSettings,
    keyBindings
  } = props;

  function showProperties() {
    getAllPropertiesPromise(props.directoryPath)
      .then((fsEntry: TS.FileSystemEntry) => {
        props.openFsEntry(fsEntry);
        return true;
      })
      .catch(error =>
        console.warn(
          'Error getting properties for entry: ' +
            props.directoryPath +
            ' - ' +
            error
        )
      );
  }

  return (
    <Toolbar className={classes.topToolbar} data-tid="perspectiveGridToolbar">
      <Tooltip
        title={
          i18n.t('core:toggleSelectAllFiles') +
          ' (' +
          keyBindings['selectAll'].toUpperCase() +
          ')'
        }
      >
        <IconButton
          data-tid="gridPerspectiveSelectAllFiles"
          onClick={toggleSelectAllFiles}
          size="large"
        >
          {someFileSelected ? <SelectAllIcon /> : <DeSelectAllIcon />}
        </IconButton>
      </Tooltip>
      <Tooltip
        title={
          i18n.t('core:navigateToParentDirectory') +
          ' (' +
          keyBindings['openParentDirectory'].toUpperCase() +
          ')'
        }
      >
        <IconButton
          aria-label={i18n.t('core:navigateToParentDirectory')}
          data-tid="gridPerspectiveOnBackButton"
          onClick={() => {
            if (
              props.searchQuery &&
              Object.keys(props.searchQuery).length > 0
            ) {
              props.setSearchQuery({});
              props.openCurrentDirectory();
            } else {
              loadParentDirectoryContent();
            }
          }}
          size="large"
        >
          <ParentDirIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title={i18n.t('core:directoryPropertiesTitle')}>
        <IconButton
          aria-label={i18n.t('core:directoryPropertiesTitle')}
          data-tid="openFolderProperties"
          onClick={showProperties}
          size="large"
        >
          <PropertiesIcon />
        </IconButton>
      </Tooltip>
      {/* {layoutType === 'row' ? (
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
      )} */}
      {!isReadOnlyMode && (
        <Tooltip
          title={
            i18n.t('core:tagSelectedEntries') +
            ' (' +
            keyBindings['addRemoveTags'].toUpperCase() +
            ')'
          }
        >
          <span>
            <IconButton
              aria-label={i18n.t('core:tagSelectedEntries')}
              data-tid="gridPerspectiveAddRemoveTags"
              disabled={selectedEntries.length < 1}
              onClick={openAddRemoveTagsDialog}
              size="large"
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
              size="large"
            >
              <CopyIcon />
            </IconButton>
          </span>
        </Tooltip>
      )}
      {!isReadOnlyMode && (
        <Tooltip
          title={
            i18n.t('core:deleteSelectedEntries') +
            ' (' +
            keyBindings['deleteDocument'].toUpperCase() +
            ')'
          }
        >
          <span>
            <IconButton
              aria-label={i18n.t('core:deleteSelectedEntries')}
              data-tid="gridPerspectiveDeleteMultipleFiles"
              disabled={!fileOperationsEnabled}
              onClick={openDeleteFileDialog}
              size="large"
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
          size="large"
        >
          <SortingIcon />
        </IconButton>
      </Tooltip>
      {Pro &&
      !AppConfig.isCordovaAndroid && ( // https://trello.com/c/z6ESlqxz/697-exports-to-json-or-csv-do-not-work-on-android
          <Tooltip title={i18n.t('core:exportCsv')}>
            <IconButton
              data-tid="gridPerspectiveExportCsvMenuTID"
              onClick={props.handleExportCsvMenu}
              style={{ transform: 'scale(-1, 1)' }}
              size="large"
            >
              <ExportIcon />
            </IconButton>
          </Tooltip>
        )}
      <Tooltip title={i18n.t('core:perspectiveSettingsTitle')}>
        <IconButton
          data-tid="gridPerspectiveOptionsMenu"
          onClick={openSettings}
          size="large"
        >
          <SettingsIcon />
        </IconButton>
      </Tooltip>
    </Toolbar>
  );
}

function mapStateToProps(state) {
  return {
    searchQuery: getSearchQuery(state),
    keyBindings: getKeyBindingObject(state)
  };
}
function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      setSearchQuery: LocationIndexActions.setSearchQuery,
      openCurrentDirectory: AppActions.openCurrentDirectory
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(MainToolbar);
