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
import { useDispatch, useSelector } from 'react-redux';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteForever';
import AddIcon from '@mui/icons-material/Add';
import ShowEntriesWithTagIcon from '@mui/icons-material/SearchOutlined';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ConfirmDialog from '../dialogs/ConfirmDialog';
import { getMaxSearchResults } from '-/reducers/settings';
import { TS } from '-/tagspaces.namespace';
import { useTranslation } from 'react-i18next';
import { useTaggingActionsContext } from '-/hooks/useTaggingActionsContext';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';

interface Props {
  open: boolean;
  onClose: () => void;
  anchorEl: Element | null;
  selectedTag: TS.Tag | null;
  currentEntryPath: string;
  removeTags?: (paths: Array<string>, tags: Array<TS.Tag>) => void;
  setIsAddTagDialogOpened?: (tag: TS.Tag) => void;
}

function EntryTagMenu(props: Props) {
  const {
    open,
    onClose,
    anchorEl,
    selectedTag,
    currentEntryPath,
    setIsAddTagDialogOpened,
  } = props;
  const removeTagsProps = props.removeTags;
  const { t } = useTranslation();

  const { setSearchQuery } = useDirectoryContentContext();
  const { removeTags, openEditEntryTagDialog } = useTaggingActionsContext();
  const { readOnlyMode } = useCurrentLocationContext();
  const [isDeleteTagDialogOpened, setIsDeleteTagDialogOpened] = useState(false);
  const maxSearchResults: number = useSelector(getMaxSearchResults);

  function showEditTagDialog() {
    onClose();
    const tag = selectedTag;
    tag.path = currentEntryPath;
    openEditEntryTagDialog(tag);
  }

  function showDeleteTagDialog() {
    onClose();
    setIsDeleteTagDialogOpened(true);
  }

  function showAddTagDialog() {
    onClose();
    setIsAddTagDialogOpened(selectedTag);
  }

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

  function handleCloseDialogs() {
    setIsDeleteTagDialogOpened(false);
  }

  function confirmRemoveTag() {
    if (removeTagsProps) {
      removeTagsProps([currentEntryPath], [selectedTag]);
    } else {
      removeTags([currentEntryPath], [selectedTag]).then(() =>
        handleCloseDialogs(),
      );
    }
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
      <ListItemText primary={t('core:showFilesWithThisTag')} />
    </MenuItem>,
  ];
  if (!readOnlyMode) {
    if (setIsAddTagDialogOpened) {
      menuItems.push(
        <MenuItem
          key="addTagMenu"
          data-tid="addTagMenuTID"
          onClick={showAddTagDialog}
        >
          <ListItemIcon>
            <AddIcon />
          </ListItemIcon>
          <ListItemText primary={t('core:addTagToTagGroup')} />
        </MenuItem>,
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
        <ListItemText primary={t('core:editTagTitle')} />
      </MenuItem>,
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
        <ListItemText primary={t('core:removeTag')} />
      </MenuItem>,
    );
  }

  return (
    <div style={{ overflowY: 'hidden' }}>
      <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
        {menuItems}
      </Menu>
      <ConfirmDialog
        open={isDeleteTagDialogOpened}
        onClose={handleCloseDialogs}
        title={t('core:removeTag')}
        content={t('core:removeTagTooltip')}
        confirmCallback={(result) => {
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
}

export default EntryTagMenu;
