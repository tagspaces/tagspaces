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
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ShowEntriesWithTagIcon from '@material-ui/icons/SearchOutlined';
import Edit from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/DeleteForever';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { actions as LocationIndexActions } from '-/reducers/location-index';
import i18n from '-/services/i18n';
import { getMaxSearchResults } from '-/reducers/settings';
import { actions as AppActions, getSelectedEntries } from '-/reducers/app';
import { TS } from '-/tagspaces.namespace';
import TaggingActions from '-/reducers/tagging-actions';

const isTagLibraryReadOnly =
  window.ExtTagLibrary && window.ExtTagLibrary.length > 0;

interface Props {
  anchorEl?: Element;
  open?: boolean;
  onClose: () => void;
  selectedTag?: TS.Tag;
  searchLocationIndex: (searchQuery: TS.SearchQuery) => void;
  openSearchPanel: () => void;
  showEditTagDialog: () => void;
  showDeleteTagDialog: () => void;
  maxSearchResults: number;
  selectedEntries: Array<any>;
  addTags: (
    paths: Array<string>,
    tags: Array<TS.Tag>,
    updateIndex?: boolean
  ) => void;
}

const TagMenu = (props: Props) => {
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

  function showEditTagDialog() {
    props.onClose();
    props.showEditTagDialog();
  }

  function showDeleteTagDialog() {
    props.onClose();
    props.showDeleteTagDialog();
  }

  function applyTag() {
    const selectedEntryPaths = props.selectedEntries.map(entry => entry.path);
    props.addTags(selectedEntryPaths, [props.selectedTag]);
    props.onClose();
  }

  return (
    <div style={{ overflowY: 'hidden' }}>
      <Menu anchorEl={props.anchorEl} open={props.open} onClose={props.onClose}>
        <MenuItem
          data-tid="showFilesWithThisTag"
          onClick={showFilesWithThisTag}
        >
          <ListItemIcon>
            <ShowEntriesWithTagIcon />
          </ListItemIcon>
          <ListItemText primary={i18n.t('core:showFilesWithThisTag')} />
        </MenuItem>
        {props.selectedEntries && props.selectedEntries.length > 0 && (
          <MenuItem data-tid="applyTagTID" onClick={applyTag}>
            <ListItemIcon>
              <ShowEntriesWithTagIcon />
            </ListItemIcon>
            <ListItemText primary={i18n.t('core:applyTag')} />
          </MenuItem>
        )}
        {!isTagLibraryReadOnly && (
          <MenuItem data-tid="editTagDialog" onClick={showEditTagDialog}>
            <ListItemIcon>
              <Edit />
            </ListItemIcon>
            <ListItemText primary={i18n.t('core:editTag')} />
          </MenuItem>
        )}
        {!isTagLibraryReadOnly && (
          <MenuItem data-tid="deleteTagDialog" onClick={showDeleteTagDialog}>
            <ListItemIcon>
              <DeleteIcon />
            </ListItemIcon>
            <ListItemText primary={i18n.t('core:deleteTagFromTagGroup')} />
          </MenuItem>
        )}
      </Menu>
    </div>
  );
};

function mapStateToProps(state) {
  return {
    maxSearchResults: getMaxSearchResults(state),
    selectedEntries: getSelectedEntries(state)
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      openSearchPanel: AppActions.openSearchPanel,
      searchLocationIndex: LocationIndexActions.searchLocationIndex,
      addTags: TaggingActions.addTags
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(TagMenu);
