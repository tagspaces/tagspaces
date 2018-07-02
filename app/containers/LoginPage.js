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
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import Button from '@material-ui/core/Button';
import { history } from '../store/configureStore';
import i18n from '../services/i18n';
// import Backend from '../services/backend';

class LoginPage extends Component {
  formValid: boolean;
  emailValid: boolean;
  passValid: boolean;
  handleInputChange: Function;

  constructor(props) {
    super(props);
    this.formValid = false;
    this.emailValid = false;
    this.passValid = false;

    this.state = {
      username: '',
      password: ''
    };
  }

  handleLogin = e => {
    e.preventDefault(); // dev mode
    history.push('/');
  };

  render() {
    return (
      <div style={{ backgroundColor: 'white' }}>
        <Button
          onClick={this.handleLogin}
        >
          {i18n.t('core:login')}
        </Button>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    common: state.common
  };
}

export default connect(mapStateToProps)(
  translate(['core'], { wait: true })(LoginPage)
);
