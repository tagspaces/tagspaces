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
 * @flow
 */

import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ShowEntriesWithTagIcon from '@material-ui/icons/Launch';
import Edit from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/DeleteForever';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ConfirmDialog from '../dialogs/ConfirmDialog';
import EditTagDialog from '../dialogs/EditTagDialog';
import { type Tag, type TagGroup } from '../../reducers/taglibrary';
import { actions as LocationIndexActions } from '../../reducers/location-index';
import i18n from '../../services/i18n';
import { type SearchQuery } from '../../services/search';
import { getMaxSearchResults } from '../../reducers/settings';
import { AppVerticalPanels } from '../VerticalNavigation';

type Props = {
  anchorEl?: Object,
  open?: boolean,
  onClose: () => void,
  selectedTag?: Tag,
  selectedTagGroupEntry?: TagGroup,
  deleteTag: (uuid: string, tagGroupUuid: string) => void,
  searchLocationIndex: (searchQuery: SearchQuery) => void,
  editTag: () => void,
  togglePanel: () => void,
  maxSearchResults: number
};

type State = {
  isEditTagDialogOpened?: boolean,
  isDeleteTagDialogOpened?: boolean
};

class TagLibraryMenu extends React.Component<Props, State> {
  state = {
    isEditTagDialogOpened: false,
    isDeleteTagDialogOpened: false
  };

  tagSelectedFiles = () => {
    // TODO not implemented
    this.props.onClose();
  };

  showFilesWithThisTag = () => {
    if (this.props.selectedTag) {
      this.props.togglePanel(AppVerticalPanels.search);
      this.props.searchLocationIndex({
        tagsAND: [this.props.selectedTag],
        maxSearchResults: this.props.maxSearchResults
      });
    }
    this.props.onClose();
  };

  showEditTagDialog = () => {
    this.props.onClose();
    this.setState({ isEditTagDialogOpened: true });
  };

  showDeleteTagDialog = () => {
    this.props.onClose();
    this.setState({ isDeleteTagDialogOpened: true });
  };

  handleCloseDialogs = () => {
    this.setState({
      isEditTagDialogOpened: false,
      isDeleteTagDialogOpened: false
    });
  };

  confirmDeleteTag = () => {
    if (this.props.selectedTag && this.props.selectedTagGroupEntry) {
      this.props.deleteTag(
        this.props.selectedTag.id,
        this.props.selectedTagGroupEntry.uuid
      );
    }
  };

  render = () => (
    <div style={{ overflowY: 'hidden !important' }}>
      <Menu
        anchorEl={this.props.anchorEl}
        open={this.props.open}
        onClose={this.props.onClose}
      >
        <MenuItem
          data-tid="showFilesWithThisTag"
          onClick={this.showFilesWithThisTag}
        >
          <ListItemIcon>
            <ShowEntriesWithTagIcon />
          </ListItemIcon>
          <ListItemText inset primary={i18n.t('core:showFilesWithThisTag')} />
        </MenuItem>
        <MenuItem data-tid="editTagDialog" onClick={this.showEditTagDialog}>
          <ListItemIcon>
            <Edit />
          </ListItemIcon>
          <ListItemText inset primary={i18n.t('core:editTag')} />
        </MenuItem>
        <MenuItem data-tid="deleteTagDialog" onClick={this.showDeleteTagDialog}>
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <ListItemText
            inset
            primary={i18n.t('core:deleteTagFromTagGroup')}
          />
        </MenuItem>
      </Menu>
      <EditTagDialog
        open={this.state.isEditTagDialogOpened}
        onClose={this.handleCloseDialogs}
        editTag={this.props.editTag}
        selectedTagGroupEntry={this.props.selectedTagGroupEntry}
        selectedTag={this.props.selectedTag}
      />
      <ConfirmDialog
        open={this.state.isDeleteTagDialogOpened}
        onClose={this.handleCloseDialogs}
        title={i18n.t('core:deleteTagFromTagGroup')}
        content={i18n.t('core:deleteTagFromTagGroupContentConfirm', {
          tagName: this.props.selectedTag ? this.props.selectedTag.title : ''
        })}
        confirmCallback={result => {
          if (result) {
            this.confirmDeleteTag();
          }
        }}
        cancelDialogTID={'cancelDeleteTagDialogTagMenu'}
        confirmDialogTID={'confirmDeleteTagDialogTagMenu'}
      />
    </div>
  );
}

function mapStateToProps(state) {
  return {
    maxSearchResults: getMaxSearchResults(state)
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    searchLocationIndex: LocationIndexActions.searchLocationIndex,
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(TagLibraryMenu);
