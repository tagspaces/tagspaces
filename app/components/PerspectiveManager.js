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
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
// import Button from '@material-ui/Button';
// import { history } from '../store/configureStore';
import styles from './SidePanels.css';

type Props = {
  classes: Object,
  style: Object
};

type State = {};

class PerspectiveManager extends React.Component<Props, State> {
  render() {
    const classes = this.props.classes;

    return (
      <div className={classes.panel} style={this.props.style}>
        <Typography className={classes.panelTitle} type="subtitle1">Perspectives</Typography>
      </div>
    );
  }
  //         <Button onClick={() => history.push('/login')}>Login</Button>
}

export default withStyles(styles)(PerspectiveManager);
