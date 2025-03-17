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
import { Pro } from '-/pro';
import { Menu, MenuItem } from '@mui/material';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { useTranslation } from 'react-i18next';

interface Props {
  classes?: any;
  open: boolean;
  anchorEl: Element;
  onClose: () => void;
  refresh: () => void;
  clearAll: () => void;
}

function BookmarksMenu(props: Props) {
  const { t } = useTranslation();
  const menuItems = [];
  menuItems.push(
    <MenuItem
      disabled={!Pro}
      key="refreshBookmarks"
      data-tid="refreshBookmarksTID"
      onClick={() => {
        props.onClose();
        props.refresh();
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
      disabled={!Pro}
      key="clearBookmarksTID"
      data-tid="clearBookmarksTID"
      onClick={() => {
        props.onClose();
        props.clearAll();
      }}
    >
      <ListItemIcon>
        <DeleteIcon />
      </ListItemIcon>
      <ListItemText primary={<>{t('core:deleteBookmarks')}</>} />
    </MenuItem>,
  );

  return (
    <Menu anchorEl={props.anchorEl} open={props.open} onClose={props.onClose}>
      <TsMenuList>{menuItems}</TsMenuList>
    </Menu>
  );
}

export default BookmarksMenu;
