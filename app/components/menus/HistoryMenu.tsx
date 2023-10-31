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

import React from 'react';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import { Pro } from '../../pro';
import { useTranslation } from 'react-i18next';

interface Props {
  classes?: any;
  open: boolean;
  anchorEl: Element;
  onClose: () => void;
  refreshHistory: () => void;
  clearAll: () => void;
}

function HistoryMenu(props: Props) {
  const { t } = useTranslation();
  const menuItems = [];
  menuItems.push(
    <MenuItem
      disabled={!Pro}
      key="refreshHistoryTID"
      data-tid="refreshHistoryTID"
      onClick={() => {
        props.onClose();
        props.refreshHistory();
      }}
    >
      <ListItemIcon>
        <RefreshIcon />
      </ListItemIcon>
      <ListItemText primary={<>{t('core:refresh')}</>} />
    </MenuItem>,
  );
  menuItems.push(
    <MenuItem
      disabled={!Pro}
      key="clearHistoryTID"
      data-tid="clearHistoryTID"
      onClick={() => {
        props.onClose();
        props.clearAll();
      }}
    >
      <ListItemIcon>
        <DeleteIcon />
      </ListItemIcon>
      <ListItemText primary={<>{t('core:clearHistory')}</>} />
    </MenuItem>,
  );

  return (
    <div style={{ overflowY: 'hidden' }}>
      <Menu anchorEl={props.anchorEl} open={props.open} onClose={props.onClose}>
        {menuItems}
      </Menu>
    </div>
  );
}

export default HistoryMenu;
