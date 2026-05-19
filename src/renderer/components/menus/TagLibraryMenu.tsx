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
import { SettingsTab } from '-/components/dialogs/SettingsDialog';
import { useSettingsDialogContext } from '-/components/dialogs/hooks/useSettingsDialogContext';
import { useEditedTagLibraryContext } from '-/hooks/useEditedTagLibraryContext';
import { Pro } from '-/pro';
import { getSaveTagInLocation } from '-/reducers/settings';
import { openURLExternally } from '-/services/utils-io';
import { Box } from '@mui/material';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Links from 'assets/links';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

interface Props {
  classes?: any;
  anchorEl: Element;
  open: boolean;
  onClose: () => void;
  showCreateTagGroupDialog: () => void;
}

function TagLibraryMenu(props: Props) {
  const { t } = useTranslation();
  const { refreshTagLibrary } = useEditedTagLibraryContext();
  const { openSettingsDialog } = useSettingsDialogContext();

  const saveTagInLocation: boolean = useSelector(getSaveTagInLocation);
  const fileInput = useRef<HTMLInputElement>(null);

  function handleExportTagGroup() {
    props.onClose();
    openSettingsDialog(SettingsTab.BackupRestore, {
      mode: 'export',
      scope: 'tagGroups',
    });
  }

  function handleImportTagGroup() {
    props.onClose();
    fileInput.current.click();
  }

  function handleFileInputChange(selection: any) {
    const target = selection.currentTarget;
    const file = target.files[0];
    if (file) {
      openSettingsDialog(SettingsTab.BackupRestore, {
        mode: 'import',
        scope: 'tagGroups',
        importFile: file,
      });
    }
    target.value = null;
  }

  return (
    <Box sx={{ overflowY: 'hidden' }}>
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
          {!AppConfig.isCordovaAndroid && !AppConfig.isCapacitorAndroid && (
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
    </Box>
  );
}

export default TagLibraryMenu;
