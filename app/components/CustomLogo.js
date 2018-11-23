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

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import IconButton from '@material-ui/core/IconButton';
import { Pro } from '../pro';
import TextLogoIcon from '../assets/images/text-logo.svg';
import { actions as AppActions } from '../reducers/app';

class CustomLogo extends Component {
  render() {
    return (
      <IconButton
        style={{ height: 50, padding: 0, marginBottom: 15 }}
        data-tid="aboutTagSpaces"
        onClick={this.props.toggleAboutDialog}
      >
        <img style={{ height: 40 }} src={Pro ? Pro.TextLogoIcon : TextLogoIcon} alt="TagSpaces Logo" />
      </IconButton>
    );
  }
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators({
    toggleAboutDialog: AppActions.toggleAboutDialog,
  }, dispatch);
}

export default connect(undefined, mapActionCreatorsToProps)(CustomLogo);
