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

import React from 'react';
import { ListItemIcon, Menu, MenuItem, Divider } from '@mui/material';
import SelectAllIcon from '@mui/icons-material/SelectAll';
import { useTranslation } from 'react-i18next';
import CopyIcon from '@mui/icons-material/FileCopy';
import HtmlIcon from '@mui/icons-material/Html';
import RttIcon from '@mui/icons-material/Rtt';
import { DeleteIcon } from '-/components/CommonIcons';
import ConfirmDialog from '-/components/dialogs/ConfirmDialog';
import { useChatContext } from '-/hooks/useChatContext';
import { useNotificationContext } from '-/hooks/useNotificationContext';

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
      /*slotProps={{
        paper: {
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&::before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        },
      }}*/
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      <MenuItem onClick={handleSelectAll}>
        <ListItemIcon>
          <SelectAllIcon fontSize="small" />
        </ListItemIcon>
        {t('core:selectAll')}
      </MenuItem>
      <MenuItem onClick={handleCopy}>
        <ListItemIcon>
          <CopyIcon fontSize="small" />
        </ListItemIcon>
        {t('core:copy')}
      </MenuItem>
      <MenuItem onClick={clearHistory}>
        <ListItemIcon>
          <DeleteIcon fontSize="small" />
        </ListItemIcon>
        {t('core:clearHistory')}
      </MenuItem>
      <Divider />
      <MenuItem onClick={saveAsHtml}>
        <ListItemIcon>
          <HtmlIcon fontSize="small" />
        </ListItemIcon>
        {t('core:saveAsHtml')}
      </MenuItem>
      <MenuItem onClick={saveAsMarkdown}>
        <ListItemIcon>
          <RttIcon fontSize="small" />
        </ListItemIcon>
        {t('core:saveAsMd')}
      </MenuItem>
    </Menu>
  );
}

export default ChatMenu;
