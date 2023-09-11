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
import { useSelector, useDispatch } from 'react-redux';
import ShowEntriesWithTagIcon from '@mui/icons-material/SearchOutlined';
import ApplyTagIcon from '@mui/icons-material/LocalOfferOutlined';
import Edit from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteForever';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { actions as LocationIndexActions } from '-/reducers/location-index';
import { getMaxSearchResults } from '-/reducers/settings';
import {
  AppDispatch,
  getSelectedEntries,
  isReadOnlyMode
} from '-/reducers/app';
import { TS } from '-/tagspaces.namespace';
import TaggingActions from '-/reducers/tagging-actions';
import { useTranslation } from 'react-i18next';

const isTagLibraryReadOnly =
  window.ExtTagLibrary && window.ExtTagLibrary.length > 0;

interface Props {
  anchorEl?: Element;
  open?: boolean;
  onClose: () => void;
  selectedTag?: TS.Tag;
  showEditTagDialog: () => void;
  showDeleteTagDialog: () => void;
}

function TagMenu(props: Props) {
  const {
    selectedTag,
    onClose,
    showEditTagDialog,
    showDeleteTagDialog,
    anchorEl,
    open
  } = props;

  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const readOnlyMode = useSelector(isReadOnlyMode);
  const maxSearchResults: number = useSelector(getMaxSearchResults);
  const selectedEntries = useSelector(getSelectedEntries);

  function showFilesWithThisTag() {
    if (selectedTag) {
      dispatch(
        LocationIndexActions.setSearchQuery({
          tagsAND: [selectedTag],
          maxSearchResults: maxSearchResults,
          executeSearch: true
        })
      );
    }
    onClose();
  }

  function showEditTagMenuDialog() {
    onClose();
    showEditTagDialog();
  }

  function openDeleteTagDialog() {
    onClose();
    showDeleteTagDialog();
  }

  function applyTag() {
    const selectedEntryPaths = selectedEntries.map(entry => entry.path);
    dispatch(TaggingActions.addTags(selectedEntryPaths, [selectedTag]));
    onClose();
  }

  const isSmartTag =
    selectedTag.functionality && selectedTag.functionality.length > 0;

  return (
    <div style={{ overflowY: 'hidden' }}>
      <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
        {!isSmartTag && (
          <MenuItem
            data-tid="showFilesWithThisTag"
            onClick={showFilesWithThisTag}
          >
            <ListItemIcon>
              <ShowEntriesWithTagIcon />
            </ListItemIcon>
            <ListItemText primary={t('core:showFilesWithThisTag')} />
          </MenuItem>
        )}

        {selectedEntries && selectedEntries.length > 0 && !readOnlyMode && (
          <MenuItem data-tid="applyTagTID" onClick={applyTag}>
            <ListItemIcon>
              <ApplyTagIcon />
            </ListItemIcon>
            <ListItemText primary={t('core:applyTag')} />
          </MenuItem>
        )}
        {!isSmartTag && !isTagLibraryReadOnly && (
          <MenuItem data-tid="editTagDialog" onClick={showEditTagMenuDialog}>
            <ListItemIcon>
              <Edit />
            </ListItemIcon>
            <ListItemText primary={t('core:editTag')} />
          </MenuItem>
        )}
        {!isSmartTag && !isTagLibraryReadOnly && (
          <MenuItem data-tid="deleteTagDialog" onClick={openDeleteTagDialog}>
            <ListItemIcon>
              <DeleteIcon />
            </ListItemIcon>
            <ListItemText primary={t('core:deleteTagFromTagGroup')} />
          </MenuItem>
        )}
      </Menu>
    </div>
  );
}

export default TagMenu;
