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
import CreateLocationIcon from '@material-ui/icons/CreateNewFolder';
import OpenLinkIcon from '@material-ui/icons/Link';
import HelpIcon from '@material-ui/icons/Help';
import i18n from '-/services/i18n';
import AppConfig from '-/config';

interface Props {
  classes?: any;
  open: boolean;
  anchorEl: Element;
  onClose: () => void;
  showCreateLocationDialog: () => void;
  toggleOpenLinkDialog: () => void;
  openURLExternally: (url: string, skipConfirmation?: boolean) => void;
}

const LocationManagerMenu = (props: Props) => (
  <div style={{ overflowY: 'hidden' }}>
    <Menu anchorEl={props.anchorEl} open={props.open} onClose={props.onClose}>
      {!AppConfig.locationsReadOnly && (
        <MenuItem
          data-tid="locationManagerMenuCreateLocation"
          onClick={() => {
            props.onClose();
            props.showCreateLocationDialog();
          }}
        >
          <ListItemIcon>
            <CreateLocationIcon />
          </ListItemIcon>
          <ListItemText primary={i18n.t('core:createLocationTitle')} />
        </MenuItem>
      )}
      <MenuItem
        data-tid="locationManagerMenuOpenLink"
        onClick={() => {
          props.onClose();
          props.toggleOpenLinkDialog();
        }}
      >
        <ListItemIcon>
          <OpenLinkIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:openLink')} />
      </MenuItem>
      <MenuItem
        data-tid="locationManagerMenuHelp"
        onClick={() => {
          props.onClose();
          props.openURLExternally(AppConfig.documentationLinks.locations, true);
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

export default LocationManagerMenu;
