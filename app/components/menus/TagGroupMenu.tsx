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
import Edit from '@material-ui/icons/Edit';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import DeleteTagGroupIcon from '@material-ui/icons/DeleteForever';
import SortTagGroupIcon from '@material-ui/icons/SortByAlpha';
import ShowEntriesWithTagIcon from '@material-ui/icons/SearchOutlined';
import TagIcon from '@material-ui/icons/LocalOffer';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import CollectTagsIcon from '@material-ui/icons/Voicemail';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import i18n from '-/services/i18n';
import { Pro } from '-/pro';
import { getMaxSearchResults } from '-/reducers/settings';
import { actions as AppActions } from '-/reducers/app';
import { actions as LocationIndexActions } from '-/reducers/location-index';
import { TS } from '-/tagspaces.namespace';
import InfoIcon from '-/components/InfoIcon';
import { ProLabel } from '-/components/HelperComponents';
interface Props {
  classes?: any;
  anchorEl: Element;
  open: boolean;
  onClose: () => void;
  selectedTagGroupEntry: TS.TagGroup;
  showCreateTagsDialog: () => void;
  showDeleteTagGroupDialog: () => void;
  showEditTagGroupDialog: () => void;
  moveTagGroupUp: (tagGroupId: string) => void;
  moveTagGroupDown: (tagGroupId: string) => void;
  sortTagGroup: (tagGroupId: string) => void;
  collectTagsFromLocation: (tagGroup: TS.TagGroup) => void;
  handleCloseTagGroupMenu: () => void;
  searchLocationIndex: (searchQuery: TS.SearchQuery) => void;
  openSearchPanel: () => void;
  maxSearchResults: number;
}

const TagGroupMenu = (props: Props) => {
  function handleCollectTags() {
    props.onClose();

    if (props.selectedTagGroupEntry) {
      props.collectTagsFromLocation(props.selectedTagGroupEntry);
    }
    props.handleCloseTagGroupMenu();
  }

  function moveTagGroupUp() {
    if (props.selectedTagGroupEntry) {
      props.moveTagGroupUp(props.selectedTagGroupEntry.uuid);
    }
    props.handleCloseTagGroupMenu();
  }

  function moveTagGroupDown() {
    if (props.selectedTagGroupEntry) {
      props.moveTagGroupDown(props.selectedTagGroupEntry.uuid);
    }
    props.handleCloseTagGroupMenu();
  }

  function sortTagGroup() {
    if (props.selectedTagGroupEntry) {
      props.sortTagGroup(props.selectedTagGroupEntry.uuid);
    }
    props.handleCloseTagGroupMenu();
  }

  function showFilesWithTags() {
    if (props.selectedTagGroupEntry) {
      props.openSearchPanel();
      props.searchLocationIndex({
        tagsOR: props.selectedTagGroupEntry.children,
        maxSearchResults: props.maxSearchResults
      });
    }
    props.handleCloseTagGroupMenu();
  }

  return (
    <div style={{ overflowY: 'hidden' }}>
      <Menu
        anchorEl={props.anchorEl}
        open={props.open}
        onClose={props.handleCloseTagGroupMenu}
      >
        <MenuItem data-tid="createTags" onClick={props.showCreateTagsDialog}>
          <ListItemIcon>
            <TagIcon />
          </ListItemIcon>
          <ListItemText primary={i18n.t('core:addTags')} />
        </MenuItem>
        <MenuItem
          data-tid="editTagGroup"
          onClick={props.showEditTagGroupDialog}
        >
          <ListItemIcon>
            <Edit />
          </ListItemIcon>
          <ListItemText primary={i18n.t('core:editTagGroup')} />
        </MenuItem>
        <MenuItem data-tid="moveTagGroupUp" onClick={moveTagGroupUp}>
          <ListItemIcon>
            <ArrowUpward />
          </ListItemIcon>
          <ListItemText primary={i18n.t('core:moveTagGroupUp')} />
        </MenuItem>
        <MenuItem data-tid="moveTagGroupDown" onClick={moveTagGroupDown}>
          <ListItemIcon>
            <ArrowDownward />
          </ListItemIcon>
          <ListItemText primary={i18n.t('core:moveTagGroupDown')} />
        </MenuItem>
        <MenuItem data-tid="sortTagGroup" onClick={sortTagGroup}>
          <ListItemIcon>
            <SortTagGroupIcon />
          </ListItemIcon>
          <ListItemText primary={i18n.t('core:sortTagGroup')} />
        </MenuItem>
        <MenuItem data-tid="showFilesWithTagsTID" onClick={showFilesWithTags}>
          <ListItemIcon>
            <ShowEntriesWithTagIcon />
          </ListItemIcon>
          <ListItemText primary={i18n.t('core:showFilesWithTags')} />
          <ListItemSecondaryAction>
            <InfoIcon tooltip={i18n.t('core:showFilesWithTagsTooltip')} />
          </ListItemSecondaryAction>
        </MenuItem>
        <MenuItem
          data-tid="deleteTagGroup"
          onClick={props.showDeleteTagGroupDialog}
        >
          <ListItemIcon>
            <DeleteTagGroupIcon />
          </ListItemIcon>
          <ListItemText primary={i18n.t('core:deleteTagGroup')} />
        </MenuItem>
        <MenuItem
          data-tid="collectTags"
          onClick={handleCollectTags}
          title={i18n.t('collectTagsFromLocationTitle')}
        >
          <ListItemIcon>
            <CollectTagsIcon />
          </ListItemIcon>
          <ListItemText
            primary={
              <>
                {i18n.t('core:collectTagsFromLocation')}
                <ProLabel />
              </>
            }
          />
        </MenuItem>
      </Menu>
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
      openSearchPanel: AppActions.openSearchPanel,
      searchLocationIndex: LocationIndexActions.searchLocationIndex
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(TagGroupMenu);
