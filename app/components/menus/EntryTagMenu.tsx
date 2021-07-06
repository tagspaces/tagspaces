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

import React, { useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/DeleteForever';
import AddIcon from '@material-ui/icons/Add';
import ShowEntriesWithTagIcon from '@material-ui/icons/SearchOutlined';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ConfirmDialog from '../dialogs/ConfirmDialog';
import i18n from '-/services/i18n';
import { actions as LocationIndexActions } from '-/reducers/location-index';
import { getMaxSearchResults } from '-/reducers/settings';
import { actions as AppActions } from '-/reducers/app';
import { TS } from '-/tagspaces.namespace';
import OpenFolderIcon from '@material-ui/icons/SubdirectoryArrowLeft';

interface Props {
  open: boolean;
  onClose: () => void;
  anchorEl: Element | null;
  selectedTag: TS.Tag | null;
  currentEntryPath: string;
  removeTags: (paths: Array<string>, tags: Array<TS.Tag>) => void;
  searchLocationIndex?: (searchQuery: TS.SearchQuery) => void;
  maxSearchResults?: number;
  openSearchPanel?: () => void;
  setIsAddTagDialogOpened?: (tag: TS.Tag) => void;
  toggleEditTagDialog?: (tag: TS.Tag) => void;
  isReadOnlyMode?: boolean;
}

const EntryTagMenu = (props: Props) => {
  const [isDeleteTagDialogOpened, setIsDeleteTagDialogOpened] = useState(false);

  function showEditTagDialog() {
    props.onClose();
    // setIsEditTagDialogOpened(true);
    const tag = props.selectedTag;
    tag.path = props.currentEntryPath;
    props.toggleEditTagDialog(tag);
  }

  function showDeleteTagDialog() {
    props.onClose();
    setIsDeleteTagDialogOpened(true);
  }

  function showAddTagDialog() {
    props.onClose();
    props.setIsAddTagDialogOpened(props.selectedTag);
  }

  function showFilesWithThisTag() {
    if (props.selectedTag) {
      props.openSearchPanel();
      props.searchLocationIndex({
        tagsAND: [props.selectedTag],
        maxSearchResults: props.maxSearchResults
      });
    }
    props.onClose();
  }

  function handleCloseDialogs() {
    setIsDeleteTagDialogOpened(false);
  }

  function confirmRemoveTag() {
    props.removeTags([props.currentEntryPath], [props.selectedTag]);
    handleCloseDialogs();
  }

  const menuItems = [
    <MenuItem
      key="showFilesWithThisTag"
      data-tid="showFilesWithThisTag"
      onClick={showFilesWithThisTag}
    >
      <ListItemIcon>
        <ShowEntriesWithTagIcon />
      </ListItemIcon>
      <ListItemText primary={i18n.t('core:showFilesWithThisTag')} />
    </MenuItem>
  ];
  if (!props.isReadOnlyMode) {
    if (props.setIsAddTagDialogOpened) {
      menuItems.push(
        <MenuItem
          key="addTagMenu"
          data-tid="addTagMenuTID"
          onClick={showAddTagDialog}
        >
          <ListItemIcon>
            <AddIcon />
          </ListItemIcon>
          <ListItemText primary={i18n.t('core:addTagToTagGroup')} />
        </MenuItem>
      );
    }
    menuItems.push(
      <MenuItem
        key="editTagDialogMenu"
        data-tid="editTagDialogMenu"
        onClick={showEditTagDialog}
      >
        <ListItemIcon>
          <EditIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:editTagTitle')} />
      </MenuItem>
    );
    menuItems.push(
      <MenuItem
        key="deleteTagMenu"
        data-tid="deleteTagMenu"
        onClick={showDeleteTagDialog}
      >
        <ListItemIcon>
          <DeleteIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:removeTag')} />
      </MenuItem>
    );
  }

  return (
    <div style={{ overflowY: 'hidden' }}>
      <Menu anchorEl={props.anchorEl} open={props.open} onClose={props.onClose}>
        {menuItems}
      </Menu>
      <ConfirmDialog
        open={isDeleteTagDialogOpened}
        onClose={handleCloseDialogs}
        title={i18n.t('core:removeTag')}
        content={i18n.t('core:removeTagTooltip')}
        confirmCallback={result => {
          if (result) {
            confirmRemoveTag();
          }
        }}
        cancelDialogTID="cancelDeleteTagDialogTagMenu"
        confirmDialogTID="confirmRemoveTagFromFile"
        confirmDialogContentTID="confirmDialogContent"
      />
    </div>
  );
};

function mapStateToProps(state) {
  return {
    maxSearchResults: getMaxSearchResults(state)
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      searchLocationIndex: LocationIndexActions.searchLocationIndex,
      openSearchPanel: AppActions.openSearchPanel,
      toggleEditTagDialog: AppActions.toggleEditTagDialog
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(EntryTagMenu);
