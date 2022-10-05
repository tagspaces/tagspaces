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
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import LocationIcon from '@mui/icons-material/WorkOutline';
import CloudLocationIcon from '@mui/icons-material/CloudQueue';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubHeader from '@mui/material/ListSubheader';
import Tooltip from '-/components/Tooltip';
import withTheme from '@mui/styles/withTheme';
import IconButton from '@mui/material/IconButton';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { locationType } from '@tagspaces/tagspaces-platforms/misc';
import i18n from '-/services/i18n';
import { getLocations } from '-/reducers/locations';
import { actions as AppActions, getCurrentLocationId } from '-/reducers/app';
import { TS } from '-/tagspaces.namespace';

interface Props {
  currentLocationId: string | null;
  theme: any;
  locations: Array<TS.Location>;
  menuAnchorEl?: Element;
  openLocation: (location: TS.Location) => void;
}

function LocationMenu(props: Props) {
  const [
    locationChooserMenuAnchorEl,
    setLocationChooserMenuAnchorEl
  ] = useState<null | HTMLElement>(null);

  const openLocation = location => {
    props.openLocation(location);
    setLocationChooserMenuAnchorEl(null);
  };

  let currentLocation;
  if (props.currentLocationId && props.locations) {
    currentLocation = props.locations.find(
      (location: TS.Location) => location.uuid === props.currentLocationId
    );
  }

  const { theme } = props;
  const locationIcon =
    currentLocation && currentLocation.type === locationType.TYPE_CLOUD ? (
      <CloudLocationIcon />
    ) : (
      <LocationIcon />
    );

  return (
    <div
      style={{
        backgroundColor: theme.palette.background.default
      }}
    >
      <Tooltip
        title={
          currentLocation
            ? i18n.t('currentLocation') + ': ' + currentLocation.name
            : i18n.t('core:pleaseOpenLocation')
        }
      >
        <IconButton
          data-tid="folderContainerLocationChooser"
          id="locationMenuButton"
          onClick={event => setLocationChooserMenuAnchorEl(event.currentTarget)}
          style={{
            padding: 5,
            fontSize: theme.typography.fontSize,
            borderRadius: 10
          }}
          size="large"
        >
          {currentLocation ? locationIcon : i18n.t('core:pleaseOpenLocation')}
          <ArrowDropDownIcon />
        </IconButton>
      </Tooltip>
      {Boolean(locationChooserMenuAnchorEl) && (
        <Menu
          id="simple-menu"
          open={Boolean(locationChooserMenuAnchorEl)}
          anchorEl={locationChooserMenuAnchorEl}
          onClose={() => setLocationChooserMenuAnchorEl(null)}
          PaperProps={{
            style: {
              maxHeight: 48 * 6.5,
              width: 300
            }
          }}
        >
          <ListSubHeader
            style={{
              backgroundColor: theme.palette.background.default
            }}
          >
            {i18n.t('core:chooseLocation')}
          </ListSubHeader>
          {props.locations.map((location: TS.Location) => (
            <MenuItem
              data-tid="folderContainerMenuOpenLocation"
              key={location.uuid}
              onClick={() => openLocation(location)}
              style={
                currentLocation && currentLocation.uuid === location.uuid
                  ? { backgroundColor: theme.palette.primary.light }
                  : {}
              }
            >
              <ListItemIcon>
                {location.type === locationType.TYPE_CLOUD ? (
                  <CloudLocationIcon />
                ) : (
                  <LocationIcon />
                )}
              </ListItemIcon>
              <ListItemText primary={location.name} />
            </MenuItem>
          ))}
        </Menu>
      )}
    </div>
  );
}

function mapStateToProps(state) {
  return {
    locations: getLocations(state),
    currentLocationId: getCurrentLocationId(state)
  };
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(
    {
      openLocation: AppActions.openLocation
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapActionCreatorsToProps
)(withTheme(LocationMenu));
