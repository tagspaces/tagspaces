/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2024-present TagSpaces GmbH
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
  AIIcon,
  CopyToClipboardIcon,
  DeleteIcon,
  HTMLFileIcon,
  MarkdownFileIcon,
  SelectAllIcon,
} from '-/components/CommonIcons';
import { useSettingsDialogContext } from '-/components/dialogs/hooks/useSettingsDialogContext';
import { SettingsTab } from '-/components/dialogs/SettingsDialog';
import TsMenuList from '-/components/TsMenuList';
import { useChatContext } from '-/hooks/useChatContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';
import {
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

interface ChatMenuProps {
  anchorEl: null | HTMLElement;
  handleClose: () => void;
  handleSelectAll: () => void;
  handleCopy: () => void;
  saveAsHtml: () => void;
  saveAsMarkdown: () => void;
}

function ChatMenu(props: ChatMenuProps) {
  const { t } = useTranslation();
  const { openSettingsDialog } = useSettingsDialogContext();
  const {
    anchorEl,
    handleClose,
    handleSelectAll,
    handleCopy,
    saveAsHtml,
    saveAsMarkdown,
  } = props;

  const { deleteHistory } = useChatContext();
  const { openConfirmDialog } = useNotificationContext();

  const openAiSettings = () => {
    openSettingsDialog(SettingsTab.AI);
  };

  const clearHistory = () => {
    handleClose();
    openConfirmDialog(
      t('core:titleConfirm'),
      t('core:confirmHistoryDeletion'),
      (result) => {
        if (result) {
          deleteHistory();
        }
      },
      'cancelDeleteHistoryDialog',
      'confirmDeleteHistoryDialog',
      'confirmDeleteHistoryDialogContent',
    );
  };
  return (
    <Menu
      anchorEl={anchorEl}
      id="account-menu"
      open={Boolean(anchorEl)}
      onClose={handleClose}
      onClick={handleClose}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      <TsMenuList>
        <MenuItem onClick={handleSelectAll}>
          <ListItemIcon>
            <SelectAllIcon />
          </ListItemIcon>
          <ListItemText primary={t('core:selectAll')} />
        </MenuItem>
        {!AppConfig.isElectron && (
          <MenuItem onClick={handleCopy}>
            <ListItemIcon>
              <CopyToClipboardIcon />
            </ListItemIcon>
            <ListItemText primary={t('core:copy')} />
          </MenuItem>
        )}
        <MenuItem onClick={clearHistory}>
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <ListItemText primary={t('core:clearHistory')} />
        </MenuItem>
        <Divider />
        <MenuItem onClick={saveAsHtml}>
          <ListItemIcon>
            <HTMLFileIcon />
          </ListItemIcon>
          <ListItemText primary={t('core:saveAsHtml')} />
        </MenuItem>
        <MenuItem onClick={saveAsMarkdown}>
          <ListItemIcon>
            <MarkdownFileIcon />
          </ListItemIcon>
          <ListItemText primary={t('core:saveAsMd')} />
        </MenuItem>
        <Divider />
        <MenuItem onClick={openAiSettings}>
          <ListItemIcon>
            <AIIcon />
          </ListItemIcon>
          <ListItemText primary={t('core:aiSettings')} />
        </MenuItem>
      </TsMenuList>
    </Menu>
  );
}

export default ChatMenu;
