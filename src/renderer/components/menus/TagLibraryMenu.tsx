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

import AppConfig from '-/AppConfig';
import {
  CreateFileIcon,
  ExportIcon,
  HelpIcon,
  ImportIcon,
  ReloadIcon,
} from '-/components/CommonIcons';
import { ProLabel, ProTooltip } from '-/components/HelperComponents';
import TsMenuList from '-/components/TsMenuList';
import { useEditedTagLibraryContext } from '-/hooks/useEditedTagLibraryContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import { Pro } from '-/pro';
import { getSaveTagInLocation } from '-/reducers/settings';
import { openURLExternally } from '-/services/utils-io';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Links from 'assets/links';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import ImportExportTagGroupsDialog from '../dialogs/ImportExportTagGroupsDialog';

interface Props {
  classes?: any;
  anchorEl: Element;
  open: boolean;
  onClose: () => void;
  showCreateTagGroupDialog: () => void;
}

function TagLibraryMenu(props: Props) {
  const { t } = useTranslation();
  const { showNotification } = useNotificationContext();
  const { tagGroups, refreshTagLibrary } = useEditedTagLibraryContext();

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
        <TsMenuList>
          <MenuItem
            data-tid="createNewTagGroup"
            onClick={() => {
              props.onClose();
              props.showCreateTagGroupDialog();
            }}
          >
            <ListItemIcon>
              <CreateFileIcon />
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
                refreshTagLibrary(true);
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
              <ImportIcon />
            </ListItemIcon>
            <ListItemText primary={t('core:importTags')} />
          </MenuItem>
          {!AppConfig.isCordovaAndroid && (
            <MenuItem data-tid="exportTagGroup" onClick={handleExportTagGroup}>
              <ListItemIcon>
                <ExportIcon />
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
        </TsMenuList>
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
