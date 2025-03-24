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

import { DeleteIcon, ReloadIcon } from '-/components/CommonIcons';
import TsMenuList from '-/components/TsMenuList';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
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
  const { onClose, refreshHistory, clearAll, open, anchorEl } = props;
  menuItems.push(
    <MenuItem
      key="refreshHistoryTID"
      data-tid="refreshHistoryTID"
      onClick={() => {
        onClose();
        refreshHistory();
      }}
    >
      <ListItemIcon>
        <ReloadIcon />
      </ListItemIcon>
      <ListItemText primary={<>{t('core:refresh')}</>} />
    </MenuItem>,
  );
  menuItems.push(
    <MenuItem
      key="clearHistoryTID"
      data-tid="clearHistoryTID"
      onClick={() => {
        onClose();
        clearAll();
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
      <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
        <TsMenuList>{menuItems}</TsMenuList>
      </Menu>
    </div>
  );
}

export default HistoryMenu;
