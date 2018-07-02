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
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ImportExportIcon from '@material-ui/icons/ImportExport';
import AddIcon from '@material-ui/icons/Add';
import ImportExportTagGroupsDialog from '../dialogs/ImportExportTagGroupsDialog';
import SelectDirectoryDialog from '../dialogs/SelectDirectoryDialog';
import i18n from '../../services/i18n';
import AppConfig from '../../config';

type Props = {
  anchorEl: Object,
  open: boolean,
  onClose: () => void,
  importTagGroups: () => void,
  exportTagGroups: () => void,
  showCreateTagGroupDialog: () => void
};

type State = {
  open?: boolean,
  tagGroups?: Array<Object>,
  isCreateDirectoryDialogOpened?: boolean,
  isSelectDirectoryDialogOpened?: boolean,
  isImportExportTagGroupDialogOpened?: boolean,
  selectedDirectoryPath?: string,
  dialogModeImport?: boolean
};

class TagLibraryMenu extends React.Component<Props, State> {
  fileInput: Object | null;

  state = {
    open: false,
    tagGroups: null,
    selectedDirectoryPath: '',
    isSelectDirectoryDialogOpened: false,
    isImportExportTagGroupDialogOpened: false,
    dialogModeImport: false
  };

  handleCloseDialogs = () => {
    this.setState({
      isImportExportTagGroupDialogOpened: false
    });
  };

  handleExportTagGroup = () => {
    this.props.onClose();
    this.setState({
      dialogModeImport: false,
      tagGroups: this.props.tagGroups,
      isImportExportTagGroupDialogOpened: true
    });
  };

  showSelectDirectoryDialog = () => {
    this.setState({
      isSelectDirectoryDialogOpened: true,
      selectedDirectoryPath: ''
    });
  };

  closeSelectDirectoryExtDialog = () => {
    this.setState({ isSelectDirectoryDialogOpened: false });
  };

  handleImportTagGroup = () => {
    this.props.onClose();
    this.setState({ dialogModeImport: true });

    if (AppConfig.isElectron) {
      this.fileInput.click();
    } else {
      // TODO Select directory or file from dialog
      this.showSelectDirectoryDialog();
    }
  };

  handleFileInputChange = (selection: Object) => {
    const target = selection.currentTarget;
    const file = target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const jsonObj = JSON.parse(reader.result);
        if (jsonObj.tagGroups) {
          this.setState({
            isImportExportTagGroupDialogOpened: true,
            tagGroups: jsonObj.tagGroups
          });
        } else {
          // TODO connect showNotification
          /* this.props.showNotification(
            i18n.t('core:invalidImportFile', 'warning', true)
          ); */
        }
      } catch (e) {
        console.error('Error : ', e);
        // TODO connect showNotification
        /* this.props.showNotification(
          i18n.t('core:invalidImportFile', 'warning', true)
        ); */
      }
    };
    reader.readAsText(file);
    target.value = null;
  };

  render() {
    return (
      <div style={{ overflowY: 'hidden !important' }}>
        <ImportExportTagGroupsDialog
          open={this.state.isImportExportTagGroupDialogOpened}
          onClose={this.handleCloseDialogs}
          tagGroups={this.state.tagGroups}
          dialogModeImport={this.state.dialogModeImport}
          exportTagGroups={this.props.exportTagGroups}
          importTagGroups={this.props.importTagGroups}
        />
        <SelectDirectoryDialog
          open={this.state.isSelectDirectoryDialogOpened}
          onClose={this.closeSelectDirectoryExtDialog}
          selectedDirectoryPath={this.state.selectedDirectoryPath}
        />
        <Menu
          anchorEl={this.props.anchorEl}
          open={this.props.open}
          onClose={this.props.onClose}
        >
          <MenuItem
            data-tid="createNewTagGroup"
            onClick={() => {
              this.props.onClose();
              this.props.showCreateTagGroupDialog();
            }}
          >
            <ListItemIcon>
              <AddIcon />
            </ListItemIcon>
            <ListItemText primary={i18n.t('core:createTagGroupTitle')} />
          </MenuItem>
          <MenuItem
            data-tid="importTagGroup"
            onClick={this.handleImportTagGroup}
          >
            <ListItemIcon>
              <ImportExportIcon />
            </ListItemIcon>
            <ListItemText primary={i18n.t('core:importTags')} />
          </MenuItem>
          <MenuItem
            data-tid="exportTagGroup"
            onClick={this.handleExportTagGroup}
          >
            <ListItemIcon>
              <ImportExportIcon />
            </ListItemIcon>
            <ListItemText primary={i18n.t('core:exportTagGroupsButton')} />
          </MenuItem>
        </Menu>
        <input
          style={{ display: 'none' }}
          ref={input => {
            this.fileInput = input;
          }}
          accept="*"
          type="file"
          onChange={this.handleFileInputChange}
        />
      </div>
    );
  }
}

export default TagLibraryMenu;
