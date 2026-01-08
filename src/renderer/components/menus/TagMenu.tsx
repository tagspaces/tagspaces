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

import {
  DeleteIcon,
  EditIcon,
  SearchIcon,
  TagIcon,
} from '-/components/CommonIcons';
import TsMenuList from '-/components/TsMenuList';
import { useCurrentLocationContext } from '-/hooks/useCurrentLocationContext';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { useSelectedEntriesContext } from '-/hooks/useSelectedEntriesContext';
import { useTaggingActionsContext } from '-/hooks/useTaggingActionsContext';
import { getMaxSearchResults } from '-/reducers/settings';
import { TS } from '-/tagspaces.namespace';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

interface Props {
  anchorEl?: Element;
  open?: boolean;
  onClose: () => void;
  selectedTag?: TS.Tag;
  selectedTagGroupEntry?: TS.TagGroup;
  showEditTagDialog: () => void;
}

function TagMenu(props: Props) {
  const {
    selectedTag,
    selectedTagGroupEntry,
    onClose,
    showEditTagDialog,
    anchorEl,
    open,
  } = props;

  const { t } = useTranslation();
  const { selectedEntries } = useSelectedEntriesContext();
  const { addTags, deleteTag } = useTaggingActionsContext();
  const { currentLocation } = useCurrentLocationContext();
  const { setSearchQuery } = useDirectoryContentContext();
  const { openConfirmDialog } = useNotificationContext();
  const maxSearchResults: number = useSelector(getMaxSearchResults);
  const tagGroupReadOnly = selectedTagGroupEntry?.readOnly;

  function showFilesWithThisTag() {
    if (selectedTag) {
      setSearchQuery({
        tagsAND: [selectedTag],
        maxSearchResults: maxSearchResults,
        executeSearch: true,
        forceIndexing: true,
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
    openConfirmDialog(
      t('core:deleteTagFromTagGroup'),
      t('core:deleteTagFromTagGroupContentConfirm', {
        tagName: selectedTag ? selectedTag.title : '',
      }),
      (result) => {
        if (result) {
          if (selectedTag && selectedTagGroupEntry) {
            deleteTag(selectedTag.title, selectedTagGroupEntry.uuid);
          }
        }
      },
      'cancelDeleteTagDialogTagMenu',
      'confirmDeleteTagDialogTagMenu',
    );
  }

  function applyTag() {
    // const selectedEntryPaths = selectedEntries.map((entry) => entry.path);
    addTags(selectedEntries, [selectedTag]);
    onClose();
  }

  const isSmartTag =
    selectedTag.functionality && selectedTag.functionality.length > 0;

  return (
    <div style={{ overflowY: 'hidden' }}>
      <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
        <TsMenuList>
          {!isSmartTag && (
            <MenuItem
              data-tid="showFilesWithThisTag"
              onClick={showFilesWithThisTag}
            >
              <ListItemIcon>
                <SearchIcon />
              </ListItemIcon>
              <ListItemText primary={t('core:showFilesWithThisTag')} />
            </MenuItem>
          )}

          {selectedEntries &&
            selectedEntries.length > 0 &&
            !currentLocation?.isReadOnly && (
              <MenuItem data-tid="applyTagTID" onClick={applyTag}>
                <ListItemIcon>
                  <TagIcon />
                </ListItemIcon>
                <ListItemText primary={t('core:applyTag')} />
              </MenuItem>
            )}
          {!tagGroupReadOnly && !isSmartTag && (
            <MenuItem data-tid="editTagDialog" onClick={showEditTagMenuDialog}>
              <ListItemIcon>
                <EditIcon />
              </ListItemIcon>
              <ListItemText primary={t('core:editTag')} />
            </MenuItem>
          )}
          {!tagGroupReadOnly && !isSmartTag && (
            <MenuItem data-tid="deleteTagDialog" onClick={openDeleteTagDialog}>
              <ListItemIcon>
                <DeleteIcon />
              </ListItemIcon>
              <ListItemText primary={t('core:deleteTagFromTagGroup')} />
            </MenuItem>
          )}
        </TsMenuList>
      </Menu>
    </div>
  );
}

export default TagMenu;
