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
 * @flow
 */

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import LocationIcon from '@material-ui/icons/WorkOutline';
import CloudLocationIcon from '@material-ui/icons/CloudQueue';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubHeader from '@material-ui/core/ListSubheader';
import { withTheme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import i18n from '../services/i18n';
import { getLocations, type Location, locationType } from '../reducers/locations';
import {
  actions as AppActions,
  getCurrentLocationId } from '../reducers/app';

type Props = {
  currentLocationId: string | null,
  theme: Object,
  locations: Array<Location>,
  menuAnchorEl: null | Object,
  openLocation: (location: Location) => void
};

type State = {
  currentLocation?: Location | null,
  locationChooserMenuOpened: boolean,
  locationChooserMenuAnchorEl: null | Object
};

class LocationMenu extends React.Component<Props, State> {
  state = {
    locationChooserMenuOpened: false,
    locationChooserMenuAnchorEl: null,
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let currentLocation;
    if (nextProps.currentLocationId && nextProps.locations) {
      nextProps.locations.map((location: Location) => {
        if (location.uuid === nextProps.currentLocationId) {
          currentLocation = location;
        }
      });
    }
    return {
      ...prevState,
      currentLocation,
    };
  }

  openLocation = location => {
    this.props.openLocation(location);
    this.toggleLocationChooser();
  };

  toggleLocationChooser = (event?: Object) => {
    this.setState({
      locationChooserMenuOpened: !this.state.locationChooserMenuOpened,
      locationChooserMenuAnchorEl: event ? event.currentTarget : null
    });
  };

  render() {
    const { theme } = this.props;
    const { currentLocation } = this.state;
    return (
      <div style={{
        backgroundColor: theme.palette.background.default,
      }}
      >
        <Button
          data-tid="folderContainerLocationChooser"
          onClick={this.toggleLocationChooser}
          title={this.state.currentLocation && this.state.currentLocation.name}
          style={{ paddingRight: 0, paddingLeft: 11 }}
        >
          {this.state.currentLocation
            ? <LocationIcon /> // this.state.currentLocation.name
            : i18n.t('core:pleaseOpenLocation')}
          <ArrowDropDownIcon />
        </Button>
        <Menu
          id="simple-menu"
          open={this.state.locationChooserMenuOpened}
          anchorEl={this.state.locationChooserMenuAnchorEl}
          onClose={this.toggleLocationChooser}
          PaperProps={{
            style: {
              maxHeight: 48 * 6.5,
              width: 300
            }
          }}
        >
          <div style={{ display: 'none' }} />
          <ListSubHeader>{i18n.t('core:chooseLocation')}</ListSubHeader>
          {this.props.locations.map((location: Location) => (
            <MenuItem
              data-tid="folderContainerMenuOpenLocation"
              key={location.uuid}
              onClick={() => this.openLocation(location)}
              style={(currentLocation && currentLocation.uuid === location.uuid) ? { backgroundColor: theme.palette.primary.light } : {}}
            >
              <ListItemIcon>
                { location.type === locationType.TYPE_CLOUD ?
                  (<CloudLocationIcon />) : (<LocationIcon />)
                }
              </ListItemIcon>
              <ListItemText inset primary={location.name} />
            </MenuItem>
          ))}
        </Menu>
      </div>
    );
  }
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
      openLocation: AppActions.openLocation,
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapActionCreatorsToProps
)(withTheme()(LocationMenu));
