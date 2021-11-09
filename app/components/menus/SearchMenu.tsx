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
import ExportImportIcon from '@material-ui/icons/SwapHoriz';
import i18n from '-/services/i18n';
import { Pro } from '../../pro';
import Links from '-/links';
import { ProLabel } from '-/components/HelperComponents';

interface Props {
  classes?: any;
  open: boolean;
  anchorEl: Element;
  onClose: () => void;
  openURLExternally: (url: string, skipConfirmation?: boolean) => void;
  importSearches: () => void;
  exportSearches: () => void;
}

const SearchMenu = (props: Props) => {
  const menuItems = [];
  menuItems.push(
    <MenuItem
      disabled={!Pro}
      key="exportSavedSearchTID"
      data-tid="exportSavedSearchTID"
      onClick={() => {
        props.onClose();
        props.exportSearches();
      }}
    >
      <ListItemIcon>
        <ExportImportIcon />
      </ListItemIcon>
      <ListItemText
        primary={
          <>
            {i18n.t('core:exportSavedSearch')}
            <ProLabel />
          </>
        }
      />
    </MenuItem>
  );
  menuItems.push(
    <MenuItem
      disabled={!Pro}
      key="importSavedSearchTID"
      data-tid="importSavedSearchTID"
      onClick={() => {
        props.onClose();
        props.importSearches();
      }}
    >
      <ListItemIcon>
        <ExportImportIcon />
      </ListItemIcon>
      <ListItemText
        primary={
          <>
            {i18n.t('core:importSavedSearch')}
            <ProLabel />
          </>
        }
      />
    </MenuItem>
  );
  menuItems.push(
    <MenuItem
      key="searchMenuHelp"
      data-tid="searchMenuHelp"
      onClick={() => {
        props.onClose();
        props.openURLExternally(Links.documentationLinks.search, true);
      }}
    >
      <ListItemIcon>
        <HelpIcon />
      </ListItemIcon>
      <ListItemText primary={i18n.t('core:help')} />
    </MenuItem>
  );

  return (
    <div style={{ overflowY: 'hidden' }}>
      <Menu anchorEl={props.anchorEl} open={props.open} onClose={props.onClose}>
        {menuItems}
      </Menu>
    </div>
  );
};

export default SearchMenu;
