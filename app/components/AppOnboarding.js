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
import Joyride from 'react-joyride';
import i18n from './../services/i18n';

class AppOnboarding extends Component {
  state = {
    run: false,
    steps: [
      {
        target: '[data-tid=createNewLocation]',
        content: i18n.t('ns.common:welcomeContent'),
        placement: 'bottom',
      },
      {
        target: '[data-tid=aboutTagSpaces]',
        content: 'Hello world',
        placement: 'bottom',
      },
    ]
  };

  componentDidMount() {
    /* setTimeout(() => {
      this.setState({
        run: true,
      });
    }, 1000); */
  }

  callback = (data) => {
    const { action, index, type } = data;
  };

  render() {
    const { steps, run } = this.state;

    return (
      <Joyride
        steps={steps}
        run={run}
        callback={this.callback}
      />
    );
  }
}

export default AppOnboarding;
