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
// import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
// import AppBar from 'material-ui/AppBar';
// import Toolbar from 'material-ui/Toolbar';
// import Typography from 'material-ui/Typography';
// import Button from 'material-ui/Button';
// import IconButton from 'material-ui/IconButton';
// import ArrowDropDownIcon from 'material-ui-icons/ArrowDropDown';
// import FolderIcon from 'material-ui-icons/Folder';
// import MoreVertIcon from 'material-ui-icons/MoreVert';
import { withStyles } from 'material-ui/styles';
// import Menu, { MenuItem } from 'material-ui/Menu';
// import { ListItemIcon, ListItemText } from 'material-ui/List';
// import ListSubheader from 'material-ui/List/ListSubheader';

// import i18n from '../services/i18n';
import { type Location } from '../reducers/locations';
// import { extractDirectoryName } from '../utils/paths';

const styles = theme => ({
  mainPanel: {
    flex: '1 1 100%',
    width: '100%',
    height: '100%',
    overflowY: 'hidden',
    backgroundColor: theme.palette.background.default,
    backgroundImage: 'url(assets/images/background.png)',
    backgroundRepeat: 'repeat',
    opacity: '0.4'
  },
  slogan: {
    top: '45%',
    width: '100%',
    textAlign: 'center',
    position: 'absolute',
  }
});

type Props = {
  classes: Object,
  locations: Array<Location>
};

type State = {
  currentLocation?: Location
};

class WelcomePanel extends React.Component<Props, State> {
  state = {
    currentLocation: null,
  };

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.mainPanel}>
        <div className={classes.slogan}>
          <img src="assets/images/welcome-logo.png" alt="Organize your files" />
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(WelcomePanel);
