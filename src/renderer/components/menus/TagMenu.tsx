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
import { useSelector } from 'react-redux';
import ShowEntriesWithTagIcon from '@mui/icons-material/SearchOutlined';
import ApplyTagIcon from '@mui/icons-material/LocalOfferOutlined';
import Edit from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteForever';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { getMaxSearchResults } from '-/reducers/settings';
import { TS } from '-/tagspaces.namespace';
import { useTranslation } from 'react-i18next';
import { useTaggingActionsContext } from '-/hooks/useTaggingActionsContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';

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
    open,
  } = props;

  const { t } = useTranslation();
  const { selectedEntries } = useSelectedEntriesContext();
  const { addTags } = useTaggingActionsContext();
  const { readOnlyMode } = useCurrentLocationContext();
  const { setSearchQuery } = useDirectoryContentContext();
  const maxSearchResults: number = useSelector(getMaxSearchResults);

  function showFilesWithThisTag() {
    if (selectedTag) {
      setSearchQuery({
        tagsAND: [selectedTag],
        maxSearchResults: maxSearchResults,
        executeSearch: true,
      });
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
    const selectedEntryPaths = selectedEntries.map((entry) => entry.path);
    addTags(selectedEntryPaths, [selectedTag]);
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
