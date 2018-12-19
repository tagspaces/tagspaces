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
import { withStyles } from '@material-ui/core/styles';
import WelcomeLogo from '../assets/images/welcome-logo.png';
import WelcomeBackground from '../assets/images/background.png';
// import Menu from '@material-ui/core/Menu';
// import MenuItem from '@material-ui/core/MenuItem';
// import ListItemIcon from '@material-ui/core/ListItemCore';
// import ListItemText  from '@material-ui/core/ListItemtext';
// import ListSubheader from '@material-ui/core/ListSubheader';


// import i18n from '../services/i18n';
import { getLocations, type Location } from '../reducers/locations';
import {
  isFirstRun,
  actions as SettingsActions
} from '../reducers/settings'
// import { extractDirectoryName } from '../utils/paths';

const styles = theme => ({
  mainPanel: {
    flex: '1 1 100%',
    width: '100%',
    height: '100%',
    overflowY: 'hidden',
    backgroundColor: theme.palette.background.default,
    backgroundImage: 'url(' + WelcomeBackground + ')',
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
  currentLocation?: Location,
};

class WelcomePanel extends React.Component<Props, State> {
  state = {
    currentLocation: null,
  };

  toggleOnboarding = () => {
    this.props.setFirstRun(!this.props.isFirstRun);
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.mainPanel}>
        <div className={classes.slogan}>
          <img
            src={WelcomeLogo}
            alt="Organize your files"
            onClick={this.toggleOnboarding}
            // style={{ pointerEvents: 'none' }}
          />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    isFirstRun: isFirstRun(state),
    locations: getLocations(state),
  };
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(
    {
      setFirstRun: SettingsActions.setFirstRun,
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapActionCreatorsToProps)(
  withStyles(styles)(WelcomePanel)
);
