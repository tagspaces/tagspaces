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

class AppOnboarding extends React.Component {
  state = {
    run: true,
    steps: [
      {
        target: '.locationName',
        content: i18n.t('ns.common:welcomeContent'),
        placement: 'bottom',
      },
    ]
  };

  componentDidMount() {
    setTimeout(() => {
      this.setState({
        isReady: true,
        isRunning: true,
      });
    }, 1000);
  }

  checkForInitialTour() {
    this.joyride.start(true);
  }

  render() {
    const { steps, run } = this.state;

    return (
      <div className="AppOnboarding">
        <Joyride
          steps={steps}
          run={run}
          callback={this.callback}
        />
      </div>
    );
  }
}

export default AppOnboarding;
