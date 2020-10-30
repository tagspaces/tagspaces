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
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import HelpIcon from '@material-ui/icons/Help';
import UpdateIndexIcon from '@material-ui/icons/Update';
import i18n from '-/services/i18n';
import AppConfig from '-/config';

interface Props {
  classes?: any;
  open: boolean;
  anchorEl: Element;
  onClose: () => void;
  openURLExternally: (url: string) => void;
  createLocationsIndexes: () => void;
}

const SearchMenu = (props: Props) => (
  <div style={{ overflowY: 'hidden' }}>
    <Menu anchorEl={props.anchorEl} open={props.open} onClose={props.onClose}>
      <MenuItem
        data-tid="searchMenuHelp"
        onClick={() => {
          props.onClose();
          props.createLocationsIndexes();
        }}
      >
        <ListItemIcon>
          <UpdateIndexIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:Update all location indexes')} />
      </MenuItem>
      <MenuItem
        data-tid="searchMenuHelp"
        onClick={() => {
          props.onClose();
          props.openURLExternally(AppConfig.documentationLinks.search);
        }}
      >
        <ListItemIcon>
          <HelpIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:help')} />
      </MenuItem>
    </Menu>
  </div>
);

export default SearchMenu;
