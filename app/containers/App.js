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
// import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
// import injectTapEventPlugin from 'react-tap-event-plugin';
import { I18nextProvider } from 'react-i18next'; // as we build ourself via webpack
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import createMuiTheme from 'material-ui/styles/createMuiTheme';
import purple from '../assets/tspurple';
import { HotKeys } from 'react-hotkeys';
import green from '../assets/tsgreen';
import '../assets/fonts/roboto/index.css';
import i18n from '../services/i18n';
import { getCurrentTheme, getKeyBindingObject } from '../reducers/settings';
import AppOnBoarding from '../components/AppOnboarding';

// Needed for onTouchTap http://stackoverflow.com/a/34015469/988941
// injectTapEventPlugin();

const lightTheme = createMuiTheme({
  palette: {
    type: 'light', // Switching the dark mode on is a single property value change.
    primary: green,
    secondary: green
  }
});

const darkTheme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: purple,
  }
});

class App extends Component {
  props: {
    children: Object
  };

  render() {
    let theme;
    switch (this.props.currentTheme) {
    case 'light': {
      theme = lightTheme;
      break;
    }
    case 'dark': {
      theme = darkTheme;
      break;
    }
    default: {
      theme = lightTheme;
      break;
    }
    }

    return (
      <HotKeys keyMap={this.props.keyBindings}>
        <MuiThemeProvider
          theme={theme}
        >
          <I18nextProvider i18n={i18n}>{this.props.children}</I18nextProvider>
          <AppOnBoarding />
        </MuiThemeProvider>
      </HotKeys>
    );
  }
}

function mapStateToProps(state) {
  return {
    currentTheme: getCurrentTheme(state),
    keyBindings: getKeyBindingObject(state)
  };
}

export default connect(mapStateToProps)(App);
