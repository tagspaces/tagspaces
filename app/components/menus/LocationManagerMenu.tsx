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

import React, { useState } from 'react';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import CreateLocationIcon from '@material-ui/icons/CreateNewFolder';
import ExportImportIcon from '@material-ui/icons/SwapHoriz';
import OpenLinkIcon from '@material-ui/icons/Link';
import HelpIcon from '@material-ui/icons/Help';
import CloseIcon from '@material-ui/icons/Close';
import classNames from 'classnames';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import AppConfig from '-/config';
import i18n from '-/services/i18n';
import { Pro } from '../../pro';
import { actions as AppActions } from '-/reducers/app';
import Links from '-/links';
import { ProLabel } from '-/components/HelperComponents';

interface Props {
  classes: any;
  exportLocations: () => void;
  importLocations: () => void;
  showCreateLocationDialog: () => void;
  toggleOpenLinkDialog: () => void;
  closeAllLocations: () => void;
  openURLExternally: (url: string, skipConfirmation?: boolean) => void;
}

const LocationManagerMenu = (props: Props) => {
  const [
    locationManagerMenuAnchorEl,
    setLocationManagerMenuAnchorEl
  ] = useState<null | HTMLElement>(null);

  const menuItems = [];
  if (!AppConfig.locationsReadOnly) {
    menuItems.push(
      <MenuItem
        key="locationManagerMenuCreateLocation"
        data-tid="locationManagerMenuCreateLocation"
        onClick={() => {
          setLocationManagerMenuAnchorEl(null);
          props.showCreateLocationDialog();
        }}
      >
        <ListItemIcon>
          <CreateLocationIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.t('core:createLocationTitle')} />
      </MenuItem>
    );
  }

  menuItems.push(
    <MenuItem
      key="locationManagerMenuOpenLink"
      data-tid="locationManagerMenuOpenLink"
      onClick={() => {
        setLocationManagerMenuAnchorEl(null);
        props.toggleOpenLinkDialog();
      }}
    >
      <ListItemIcon>
        <OpenLinkIcon />
      </ListItemIcon>
      <ListItemText primary={i18n.t('core:openLink')} />
    </MenuItem>
  );

  if (!AppConfig.isCordovaAndroid) {
    // https://trello.com/c/z6ESlqxz/697-exports-to-json-or-csv-do-not-work-on-android
    menuItems.push(
      <MenuItem
        disabled={!Pro}
        key="locationManagerMenuExportLocationsTID"
        data-tid="locationManagerMenuExportLocationsTID"
        onClick={() => {
          setLocationManagerMenuAnchorEl(null);
          props.exportLocations();
        }}
      >
        <ListItemIcon>
          <ExportImportIcon />
        </ListItemIcon>
        <ListItemText
          primary={
            <>
              {i18n.t('core:exportLocationTitle')}
              <ProLabel />
            </>
          }
        />
      </MenuItem>
    );
  }
  menuItems.push(
    <MenuItem
      disabled={!Pro}
      key="locationManagerMenuImportLocations"
      data-tid="locationManagerMenuImportLocationsTID"
      onClick={() => {
        setLocationManagerMenuAnchorEl(null);
        props.importLocations();
      }}
    >
      <ListItemIcon>
        <ExportImportIcon />
      </ListItemIcon>
      <ListItemText
        primary={
          <>
            {i18n.t('core:importLocationTitle')}
            <ProLabel />
          </>
        }
      />
    </MenuItem>
  );

  menuItems.push(
    <MenuItem
      key="locationManagerMenuCloseAll"
      data-tid="locationManagerMenuCloseAll"
      onClick={() => {
        setLocationManagerMenuAnchorEl(null);
        props.closeAllLocations();
      }}
    >
      <ListItemIcon>
        <CloseIcon />
      </ListItemIcon>
      <ListItemText primary={i18n.t('core:closeAllLocations')} />
    </MenuItem>
  );

  menuItems.push(
    <MenuItem
      key="locationManagerMenuHelp"
      data-tid="locationManagerMenuHelp"
      onClick={() => {
        setLocationManagerMenuAnchorEl(null);
        props.openURLExternally(Links.documentationLinks.locations, true);
      }}
    >
      <ListItemIcon>
        <HelpIcon />
      </ListItemIcon>
      <ListItemText primary={i18n.t('core:help')} />
    </MenuItem>
  );

  return (
    <>
      <div className={props.classes.toolbar}>
        <Typography
          className={classNames(props.classes.panelTitle, props.classes.header)}
          variant="subtitle1"
        >
          {i18n.t('core:locationManager')}
        </Typography>
        <IconButton
          data-tid="locationManagerMenu"
          onClick={event => setLocationManagerMenuAnchorEl(event.currentTarget)}
        >
          <MoreVertIcon />
        </IconButton>
      </div>
      <Menu
        anchorEl={locationManagerMenuAnchorEl}
        open={Boolean(locationManagerMenuAnchorEl)}
        onClose={() => {
          setLocationManagerMenuAnchorEl(null);
        }}
      >
        {menuItems}
      </Menu>
    </>
  );
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      closeAllLocations: AppActions.closeAllLocations
    },
    dispatch
  );
}
export default connect(undefined, mapDispatchToProps)(LocationManagerMenu);
