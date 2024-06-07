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

import React, { useRef, useState } from 'react';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ImportExportIcon from '@mui/icons-material/SwapHoriz';
import HelpIcon from '@mui/icons-material/Help';
import AddIcon from '@mui/icons-material/Add';
import ReloadIcon from '@mui/icons-material/Sync';
import AppConfig from '-/AppConfig';
import ImportExportTagGroupsDialog from '../dialogs/ImportExportTagGroupsDialog';
import Links from 'assets/links';
import { ProLabel, ProTooltip } from '-/components/HelperComponents';
import { Pro } from '-/pro';
import { openURLExternally } from '-/services/utils-io';
import { useTranslation } from 'react-i18next';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { useEditedTagLibraryContext } from '-/hooks/useEditedTagLibraryContext';
import { useSelector } from 'react-redux';
import { getSaveTagInLocation } from '-/reducers/settings';
import { useTaggingActionsContext } from '-/hooks/useTaggingActionsContext';

interface Props {
  classes?: any;
  anchorEl: Element;
  open: boolean;
  onClose: () => void;
  showCreateTagGroupDialog: () => void;
  refreshTagsFromLocation: () => void;
}

function TagLibraryMenu(props: Props) {
  const { t } = useTranslation();
  const { showNotification } = useNotificationContext();
  const { tagGroups } = useEditedTagLibraryContext();

  const saveTagInLocation: boolean = useSelector(getSaveTagInLocation);
  const fileInput = useRef<HTMLInputElement>(null);
  const tagGroupsImported = useRef([]);
  // const [tagGroups, setTagGroups] = useState(null);
  const [
    isImportExportTagGroupDialogOpened,
    setIsImportExportTagGroupDialogOpened,
  ] = useState(false);
  const [dialogModeImport, setDialogModeImport] = useState(false);

  function handleCloseDialogs() {
    setIsImportExportTagGroupDialogOpened(false);
  }

  function handleExportTagGroup() {
    props.onClose();
    setDialogModeImport(false);
    // setTagGroups(props.tagGroups);
    setIsImportExportTagGroupDialogOpened(true);
  }

  function handleImportTagGroup() {
    props.onClose();
    setDialogModeImport(true);
    fileInput.current.click();
  }

  function handleFileInputChange(selection: any) {
    const target = selection.currentTarget;
    const file = target.files[0];
    const reader: any = new FileReader();

    reader.onload = () => {
      try {
        const jsonObj = JSON.parse(reader.result);
        if (jsonObj.tagGroups) {
          tagGroupsImported.current = jsonObj.tagGroups;
          setIsImportExportTagGroupDialogOpened(true);
        } else {
          showNotification(t('core:invalidImportFile'), 'warning', true);
        }
      } catch (e) {
        showNotification(t('core:invalidImportFile'), 'warning', true);
      }
    };
    reader.readAsText(file);
    target.value = null;
  }

  return (
    <div style={{ overflowY: 'hidden' }}>
      {isImportExportTagGroupDialogOpened && (
        <ImportExportTagGroupsDialog
          open={isImportExportTagGroupDialogOpened}
          onClose={handleCloseDialogs}
          tagGroups={dialogModeImport ? tagGroupsImported.current : tagGroups}
          dialogModeImport={dialogModeImport}
        />
      )}
      <Menu anchorEl={props.anchorEl} open={props.open} onClose={props.onClose}>
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
          <ListItemText primary={t('core:createTagGroupTitle')} />
        </MenuItem>
        <ProTooltip
          placement="right"
          tooltip={t('core:enableTagsFromLocationHelp')}
        >
          <MenuItem
            disabled={!Pro || !saveTagInLocation}
            data-tid="refreshTagGroups"
            onClick={() => {
              props.refreshTagsFromLocation();
              props.onClose();
            }}
          >
            <ListItemIcon>
              <ReloadIcon />
            </ListItemIcon>
            <ListItemText
              primary={
                <>
                  {t('core:refreshTagGroups')}
                  <ProLabel />
                </>
              }
            />
          </MenuItem>
        </ProTooltip>
        <MenuItem data-tid="importTagGroup" onClick={handleImportTagGroup}>
          <ListItemIcon>
            <ImportExportIcon />
          </ListItemIcon>
          <ListItemText primary={t('core:importTags')} />
        </MenuItem>
        {!AppConfig.isCordovaAndroid && (
          <MenuItem data-tid="exportTagGroup" onClick={handleExportTagGroup}>
            <ListItemIcon>
              <ImportExportIcon />
            </ListItemIcon>
            <ListItemText primary={t('core:exportTagGroupsButton')} />
          </MenuItem>
        )}
        <MenuItem
          data-tid="taglibraryHelp"
          onClick={() => {
            props.onClose();
            openURLExternally(Links.documentationLinks.taglibrary, true);
          }}
        >
          <ListItemIcon>
            <HelpIcon />
          </ListItemIcon>
          <ListItemText primary={t('core:help')} />
        </MenuItem>
      </Menu>
      <input
        style={{ display: 'none' }}
        ref={fileInput}
        accept="*"
        type="file"
        onChange={handleFileInputChange}
      />
    </div>
  );
}

export default TagLibraryMenu;
