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
import uuidv1 from 'uuid';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Divider from '@material-ui/core/Divider';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/DeleteForever';
import ShowEntriesWithTagIcon from '@material-ui/icons/Launch';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ConfirmDialog from '../dialogs/ConfirmDialog';
import EditEntryTagDialog from '../dialogs/EditEntryTagDialog';
import DateCalendarDialog from '../dialogs/DateCalendarDialog';
import i18n from '../../services/i18n';
import { type Tag } from '../../reducers/taglibrary';
import { actions as LocationIndexActions } from '../../reducers/location-index';
import { type SearchQuery } from '../../services/search';
import { getMaxSearchResults } from '../../reducers/settings';


type Props = {
  open?: boolean,
  onClose: () => void,
  anchorEl?: Object | null,
  selectedTag?: Tag | null,
  currentEntryPath?: string,
  removeTags: (paths: Array<string>, tags: Array<Tag>) => void,
  editTagForEntry: (path: string, tag: Tag) => void,
  searchLocationIndex: (searchQuery: SearchQuery) => void,
  maxSearchResults: number,
  isReadOnlyMode: boolean
};

type State = {
  isEditTagDialogOpened?: boolean,
  isDateCalendarDialogOpened?: boolean,
  isDeleteTagDialogOpened?: boolean
};

class EntryTagMenu extends React.Component<Props, State> {
  state = {
    isEditTagDialogOpened: false,
    isDateCalendarDialogOpened: false,
    isDeleteTagDialogOpened: false
  };

  showEditTagDialog = () => {
    this.props.onClose();
    this.setState({ isEditTagDialogOpened: true });
  };

  showDeleteTagDialog = () => {
    this.props.onClose();
    this.setState({ isDeleteTagDialogOpened: true });
  };

  showDateCalendarDialog = () => {
    this.props.onClose();
    this.setState({ isDateCalendarDialogOpened: true });
  };

  showFilesWithThisTag = () => {
    if (this.props.selectedTag) {
      // this.props.togglePanel(AppVerticalPanels.search);
      this.props.searchLocationIndex({
        tagsAND: [this.props.selectedTag],
        maxSearchResults: this.props.maxSearchResults
      });
    }
    this.props.onClose();
  };

  handleCloseDialogs = () => {
    this.setState({
      isEditTagDialogOpened: false,
      isDateCalendarDialogOpened: false,
      isDeleteTagDialogOpened: false
    });
  };

  confirmRemoveTag = () => {
    this.props.removeTags(
      [this.props.currentEntryPath],
      [this.props.selectedTag]
    );
    this.handleCloseDialogs();
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
        {!this.props.isReadOnlyMode && (
          <div>
            <MenuItem data-tid="deleteTagMenu" onClick={this.showDeleteTagDialog}>
              <ListItemIcon>
                <DeleteIcon />
              </ListItemIcon>
              <ListItemText inset primary={i18n.t('core:removeTag')} />
            </MenuItem>
            <Divider />
            <MenuItem data-tid="editTagDialogMenu" onClick={this.showEditTagDialog}>
              <ListItemIcon>
                <EditIcon />
              </ListItemIcon>
              <ListItemText inset primary={i18n.t('core:tagProperties')} />
            </MenuItem>
          </div>
        )}
      </Menu>
      <ConfirmDialog
        open={this.state.isDeleteTagDialogOpened}
        onClose={this.handleCloseDialogs}
        title={i18n.t('core:removeTag')}
        content={i18n.t('core:removeTagTooltip')}
        confirmCallback={result => {
          if (result) {
            this.confirmRemoveTag();
          }
        }}
        cancelDialogTID={'cancelDeleteTagDialogTagMenu'}
        confirmDialogTID={'confirmRemoveTagFromFile'}
        confirmDialogContent={'confirmDialogContent'}
      />
      <EditEntryTagDialog
        key={uuidv1()}
        open={this.state.isEditTagDialogOpened}
        onClose={this.handleCloseDialogs}
        editTagForEntry={this.props.editTagForEntry}
        currentEntryPath={this.props.currentEntryPath}
        selectedTag={this.props.selectedTag}
      />
      <DateCalendarDialog
        open={this.state.isDateCalendarDialogOpened}
        onClose={this.handleCloseDialogs}
        editTagForEntry={this.props.editTagForEntry}
        currentEntryPath={this.props.currentEntryPath}
        selectedTag={this.props.selectedTag}
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

export default connect(mapStateToProps, mapDispatchToProps)(EntryTagMenu);
