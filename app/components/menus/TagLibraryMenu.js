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

import React, { useState } from 'react';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ImportExportIcon from '@material-ui/icons/ImportExport';
import HelpIcon from '@material-ui/icons/Help';
import AddIcon from '@material-ui/icons/Add';
import ImportExportTagGroupsDialog from '../dialogs/ImportExportTagGroupsDialog';
import SelectDirectoryDialog from '../dialogs/SelectDirectoryDialog';
import i18n from '../../services/i18n';
import AppConfig from '../../config';

type Props = {
  classes: Object,
  anchorEl: Object,
  tagGroups: Array<Object>,
  openURLExternally: (path: string) => void,
  open: boolean,
  onClose: () => void,
  importTagGroups: () => void,
  exportTagGroups: () => void,
  showCreateTagGroupDialog: () => void
};

const TagLibraryMenu = (props: Props) => {
  let fileInput;
  const [tagGroups, setTagGroups] = useState(null);
  const [selectedDirectoryPath, setSelectedDirectoryPath] = useState('');
  const [isSelectDirectoryDialogOpened, setIsSelectDirectoryDialogOpened] = useState(false);
  const [isImportExportTagGroupDialogOpened, setIsImportExportTagGroupDialogOpened] = useState(false);
  const [dialogModeImport, setDialogModeImport] = useState(false);

  function handleCloseDialogs() {
    setIsImportExportTagGroupDialogOpened(false);
  }

  function handleExportTagGroup() {
    props.onClose();
    setDialogModeImport(false);
    setTagGroups(props.tagGroups);
    setIsImportExportTagGroupDialogOpened(true);
  }

  function showSelectDirectoryDialog() {
    setIsSelectDirectoryDialogOpened(true);
    setSelectedDirectoryPath('');
  }

  function closeSelectDirectoryExtDialog() {
    setIsSelectDirectoryDialogOpened(false);
  }

  function handleImportTagGroup() {
    props.onClose();
    setDialogModeImport(true);

    if (AppConfig.isCordovaAndroid && AppConfig.isCordovaiOS) {
      // TODO Select directory or file from dialog
      showSelectDirectoryDialog();
    } else {
      fileInput.click();
    }
  }

  function handleFileInputChange(selection: Object) {
    const target = selection.currentTarget;
    const file = target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const jsonObj = JSON.parse(reader.result);
        if (jsonObj.tagGroups) {
          setTagGroups(jsonObj.tagGroups);
          setIsImportExportTagGroupDialogOpened(true);
        } else {
          // TODO connect showNotification
          /* props.showNotification(
            i18n.t('core:invalidImportFile', 'warning', true)
          ); */
        }
      } catch (e) {
        console.error('Error : ', e);
        // TODO connect showNotification
        /* props.showNotification(
          i18n.t('core:invalidImportFile', 'warning', true)
        ); */
      }
    };
    reader.readAsText(file);
    target.value = null;
  }

  return (
    <div style={{ overflowY: 'hidden !important' }}>
      <ImportExportTagGroupsDialog
        open={isImportExportTagGroupDialogOpened}
        onClose={handleCloseDialogs}
        tagGroups={tagGroups}
        dialogModeImport={dialogModeImport}
        exportTagGroups={props.exportTagGroups}
        importTagGroups={props.importTagGroups}
      />
      <SelectDirectoryDialog
        open={isSelectDirectoryDialogOpened}
        onClose={closeSelectDirectoryExtDialog}
        selectedDirectoryPath={selectedDirectoryPath}
      />
      <Menu
        anchorEl={props.anchorEl}
        open={props.open}
        onClose={props.onClose}
      >
        <MenuItem
          data-tid="createNewTagGroup"
          onClick={() => {
            props.onClose();
            props.showCreateTagGroupDialog();
          }}
        >
          <ListItemIcon>
            <AddIcon />
          </ListItemIcon>
          <ListItemText primary={i18n.t('core:createTagGroupTitle')} />
        </MenuItem>
        <MenuItem
          data-tid="importTagGroup"
          onClick={handleImportTagGroup}
        >
          <ListItemIcon>
            <ImportExportIcon />
          </ListItemIcon>
          <ListItemText primary={i18n.t('core:importTags')} />
        </MenuItem>
        <MenuItem
          data-tid="exportTagGroup"
          onClick={handleExportTagGroup}
        >
          <ListItemIcon>
            <ImportExportIcon />
          </ListItemIcon>
          <ListItemText primary={i18n.t('core:exportTagGroupsButton')} />
        </MenuItem>
        <MenuItem
          data-tid="tablibraryHelp"
          onClick={() => {
            props.onClose();
            props.openURLExternally(AppConfig.documentationLinks.taglibrary)
          }}
        >
          <ListItemIcon>
            <HelpIcon />
          </ListItemIcon>
          <ListItemText primary={i18n.t('core:help')} />
        </MenuItem>
      </Menu>
      <input
        style={{ display: 'none' }}
        ref={input => {
          fileInput = input;
        }}
        accept="*"
        type="file"
        onChange={handleFileInputChange}
      />
    </div>
  );
};

export default TagLibraryMenu;
