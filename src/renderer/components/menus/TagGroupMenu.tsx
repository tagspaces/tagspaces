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
  ArrowDownIcon,
  ArrowUpIcon,
  DeleteIcon,
  EditIcon,
  TagIcon,
} from '-/components/CommonIcons';
import InfoIcon from '-/components/InfoIcon';
import TsMenuList from '-/components/TsMenuList';
import { useDirectoryContentContext } from '-/hooks/useDirectoryContentContext';
import { useTaggingActionsContext } from '-/hooks/useTaggingActionsContext';
import { getMaxSearchResults } from '-/reducers/settings';
import { TS } from '-/tagspaces.namespace';
import ShowEntriesWithTagIcon from '@mui/icons-material/SearchOutlined';
import SortTagGroupIcon from '@mui/icons-material/SortByAlpha';
import CollectTagsIcon from '@mui/icons-material/Voicemail';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

interface Props {
  classes?: any;
  anchorEl: Element;
  open: boolean;
  onClose: () => void;
  selectedTagGroupEntry: TS.TagGroup;
  showCreateTagsDialog: () => void;
  showDeleteTagGroupDialog: () => void;
  showEditTagGroupDialog: () => void;
  handleCloseTagGroupMenu: () => void;
}

function TagGroupMenu(props: Props) {
  const {
    open,
    onClose,
    selectedTagGroupEntry,
    handleCloseTagGroupMenu,
    anchorEl,
    showCreateTagsDialog,
    showEditTagGroupDialog,
    showDeleteTagGroupDialog,
  } = props;
  const { t } = useTranslation();

  const {
    collectTagsFromLocation,
    moveTagGroupUp,
    moveTagGroupDown,
    sortTagGroup,
  } = useTaggingActionsContext();
  const { setSearchQuery } = useDirectoryContentContext();
  const maxSearchResults = useSelector(getMaxSearchResults);

  function handleCollectTags() {
    onClose();

    if (selectedTagGroupEntry) {
      collectTagsFromLocation(selectedTagGroupEntry);
    }
    handleCloseTagGroupMenu();
    //dispatch(AppActions.tagLibraryChanged());
  }

  function moveTagGroupUpInt() {
    if (selectedTagGroupEntry) {
      moveTagGroupUp(selectedTagGroupEntry.uuid);
    }
    handleCloseTagGroupMenu();
  }

  function moveTagGroupDownInt() {
    if (selectedTagGroupEntry) {
      moveTagGroupDown(selectedTagGroupEntry.uuid);
    }
    handleCloseTagGroupMenu();
  }

  function sortTagGroupInt() {
    if (selectedTagGroupEntry) {
      sortTagGroup(selectedTagGroupEntry.uuid);
    }
    handleCloseTagGroupMenu();
  }

  function showFilesWithTags() {
    if (selectedTagGroupEntry) {
      // openSearchPanel();
      setSearchQuery({
        tagsOR: selectedTagGroupEntry.children,
        maxSearchResults: maxSearchResults,
        executeSearch: true,
      });
    }
    handleCloseTagGroupMenu();
  }

  return (
    <div style={{ overflowY: 'hidden' }}>
      <Menu anchorEl={anchorEl} open={open} onClose={handleCloseTagGroupMenu}>
        <TsMenuList>
          <MenuItem data-tid="createTags" onClick={showCreateTagsDialog}>
            <ListItemIcon>
              <TagIcon />
            </ListItemIcon>
            <ListItemText primary={t('core:addTags')} />
          </MenuItem>
          <MenuItem data-tid="editTagGroup" onClick={showEditTagGroupDialog}>
            <ListItemIcon>
              <EditIcon />
            </ListItemIcon>
            <ListItemText primary={t('core:editTagGroup')} />
          </MenuItem>
          <MenuItem data-tid="moveTagGroupUp" onClick={moveTagGroupUpInt}>
            <ListItemIcon>
              <ArrowUpIcon />
            </ListItemIcon>
            <ListItemText primary={t('core:moveTagGroupUp')} />
          </MenuItem>
          <MenuItem data-tid="moveTagGroupDown" onClick={moveTagGroupDownInt}>
            <ListItemIcon>
              <ArrowDownIcon />
            </ListItemIcon>
            <ListItemText primary={t('core:moveTagGroupDown')} />
          </MenuItem>
          <MenuItem data-tid="sortTagGroup" onClick={sortTagGroupInt}>
            <ListItemIcon>
              <SortTagGroupIcon />
            </ListItemIcon>
            <ListItemText primary={t('core:sortTagGroup')} />
          </MenuItem>
          <MenuItem data-tid="showFilesWithTagsTID" onClick={showFilesWithTags}>
            <ListItemIcon>
              <ShowEntriesWithTagIcon />
            </ListItemIcon>
            <ListItemText primary={t('core:showFilesWithTags')} />
            <InfoIcon tooltip={t('core:showFilesWithTagsTooltip')} />
          </MenuItem>
          <MenuItem
            data-tid="deleteTagGroup"
            onClick={showDeleteTagGroupDialog}
          >
            <ListItemIcon>
              <DeleteIcon />
            </ListItemIcon>
            <ListItemText primary={t('core:deleteTagGroup')} />
          </MenuItem>
          <MenuItem
            data-tid="collectTags"
            onClick={handleCollectTags}
            title={t('collectTagsFromLocationTitle')}
          >
            <ListItemIcon>
              <CollectTagsIcon />
            </ListItemIcon>
            <ListItemText primary={<>{t('core:collectTagsFromLocation')}</>} />
          </MenuItem>
        </TsMenuList>
      </Menu>
    </div>
  );
}

export default TagGroupMenu;
