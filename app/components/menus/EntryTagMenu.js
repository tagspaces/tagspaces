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
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/DeleteForever';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ConfirmDialog from '../dialogs/ConfirmDialog';
import EditEntryTagDialog from '../dialogs/EditEntryTagDialog';
import DateCalendarDialog from '../dialogs/DateCalendarDialog';
import i18n from '../../services/i18n';
import { type Tag } from '../../reducers/taglibrary';

type Props = {
  open?: boolean,
  onClose: () => void,
  anchorEl?: Object | null,
  selectedTag?: Tag | null,
  currentEntryPath?: string,
  removeTags: (paths: Array<string>, tags: Array<Tag>) => void,
  editTagForEntry: (path: string, tag: Tag) => void
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
        <MenuItem data-tid="editTagDialogMenu" onClick={this.showEditTagDialog}>
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          <ListItemText inset primary={i18n.t('core:editTag')} />
        </MenuItem>
        <MenuItem data-tid="deleteTagMenu" onClick={this.showDeleteTagDialog}>
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <ListItemText inset primary={i18n.t('core:removeTag')} />
        </MenuItem>
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

/*
  <MenuItem data-tid="dateTagDialogMenu" onClick={this.showDateCalendarDialog}>
    <ListItemIcon>
      <EditIcon />
    </ListItemIcon>
    <ListItemText
      inset
      primary={i18n.t('core:editDateTag')}
    />
  </MenuItem>
*/

export default EntryTagMenu;
