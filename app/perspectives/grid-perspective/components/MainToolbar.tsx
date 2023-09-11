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
  PerspectiveSettingsIcon
} from '-/components/CommonIcons';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import AppConfig from '-/AppConfig';
import { Pro } from '-/pro';
import { ProTooltip } from '-/components/HelperComponents';
import {
  actions as LocationIndexActions,
  getSearchQuery
} from '-/reducers/location-index';
import { getKeyBindingObject } from '-/reducers/settings';
import { TS } from '-/tagspaces.namespace';
import {
  actions as AppActions,
  AppDispatch,
  isReadOnlyMode
} from '-/reducers/app';
import {
  classes,
  GridStyles
} from '-/perspectives/grid-perspective/components/styles.css';
import { useTranslation } from 'react-i18next';

interface Props {
  prefixDataTID?: string;
  selectedEntries: Array<TS.FileSystemEntry>;
  loadParentDirectoryContent: () => void;
  toggleSelectAllFiles: (event: any) => void;
  someFileSelected: boolean;
  handleLayoutSwitch: (event: Object) => void;
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
  openShareFilesDialog?: () => void;
  directoryPath: string;
  keyBindings: Array<any>;
}

function MainToolbar(props: Props) {
  const {
    prefixDataTID,
    selectedEntries,
    toggleSelectAllFiles,
    someFileSelected,
    loadParentDirectoryContent,
    layoutType,
    handleLayoutSwitch,
    openAddRemoveTagsDialog,
    openMoveCopyFilesDialog,
    openDeleteFileDialog,
    fileOperationsEnabled,
    handleSortingMenu,
    openSettings,
    keyBindings,
    openShareFilesDialog
  } = props;

  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const readOnlyMode = useSelector(isReadOnlyMode);

  function showProperties() {
    return dispatch(AppActions.openEntry(props.directoryPath));
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
            keyBindings['openParentDirectory'].toUpperCase() +
            ')'
          }
        >
          <IconButton
            aria-label={t('core:navigateToParentDirectory')}
            data-tid={prefixDataTID + 'PerspectiveOnBackButton'}
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
            <ParentFolderIcon />
          </IconButton>
        </Tooltip>
        <Tooltip
          title={
            t('core:toggleSelectAllFiles') +
            ' (' +
            keyBindings['selectAll'].toUpperCase() +
            ')'
          }
        >
          <IconButton
            data-tid={prefixDataTID + 'PerspectiveSelectAllFiles'}
            onClick={toggleSelectAllFiles}
            size="large"
          >
            {someFileSelected ? <SelectedIcon /> : <UnSelectedIcon />}
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
              keyBindings['addRemoveTags'].toUpperCase() +
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
                onClick={openDeleteFileDialog}
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
            <Tooltip title={t('core:exportCsv')}>
              <IconButton
                data-tid={prefixDataTID + 'PerspectiveExportCsvMenuTID'}
                onClick={props.handleExportCsvMenu}
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
