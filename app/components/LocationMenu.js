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
// import { bindActionCreators } from 'redux';
import FolderIcon from '@material-ui/icons/Folder';
import { withStyles } from '@material-ui/core/styles';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubHeader from '@material-ui/core/ListSubheader';
import Button from '@material-ui/core/Button';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
// import DirectoryMenu from './menus/DirectoryMenu';
import i18n from '../services/i18n';
import { getLocations, type Location } from '../reducers/locations';
/* import {
   actions as AppActions,
   getDirectoryContent,
   getDirectoryPath,
   getCurrentLocationId,
   getLastSelectedEntry,
   getSearchResultCount,
   isReadOnlyMode
} from '../reducers/app'; */
// import { extractDirectoryName } from '../utils/paths';

type Props = {
  classes: Object
};

class LocationMenu extends React.Component { // <Props, State> {
  openLocation = locationId => {
    this.props.openLocation(locationId);
    this.props.toggleLocationChooser();
  };

  toggleLocationChooser = (event?: Object) => {
    this.setState({
      locationChooserMenuOpened: !this.state.locationChooserMenuOpened,
      locationChooserMenuAnchorEl: event ? event.currentTarget : null
    });
  };

  render() {
    const { classes } = this.props;
    return (
      <div>
        <Button
          data-tid="folderContainerLocationChooser"
          className={classes.locationSelectorButton}
          onClick={this.toggleLocationChooser}
        >
          {this.state.currentLocation
            ? this.state.currentLocation.name
            : i18n.t('core:pleaseOpenLocation')}
          <ArrowDropDownIcon />
        </Button>
        <Menu
          id="simple-menu"
          open={this.props.open}
          anchorEl={this.props.menuAnchorEl}
          onClose={this.props.toggleLocationChooser}
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
              onClick={() => this.openLocation(location.uuid)}
            >
              <ListItemIcon>
                <FolderIcon />
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
  };
}

export default connect(mapStateToProps)(LocationMenu);
