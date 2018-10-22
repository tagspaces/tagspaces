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

class LocationMenu extends React.Component<Props, State> {
  state = {
    // locationChooserMenuOpened: false,
  };

  /* componentWillReceiveProps = (nextProps: Props) => {
    if (nextProps.currentLocationId != null) {
      this.props.locations.map((location: Location) => {
        if (location.uuid === nextProps.currentLocationId) {
          this.setState({
            currentLocation: location,
            currentPerspective: 'grid' // TODO for removing
          });
        }
        return true;
      });
    } else { // closing the perspective
      this.setState({
        currentLocation: undefined,
        currentPerspective: undefined
      });
    }
  };
  */

  openLocation = locationId => {
    this.props.openLocation(locationId);
    this.props.toggleLocationChooser();
  };

  render() {
    return (
      <Menu
        id="simple-menu"
        anchorEl={this.state.locationChooserMenuAnchorEl}
        open={this.props.locationChooserMenuOpened}
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
    );
  }
}

function mapStateToProps(state) {
  return {
    locations: getLocations(state),
  };
}

export default connect(mapStateToProps)(
  withStyles(LocationMenu)
);
