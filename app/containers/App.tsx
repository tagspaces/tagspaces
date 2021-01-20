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
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { I18nextProvider } from 'react-i18next'; // as we build ourself via webpack
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import i18n from '../services/i18n';
import { getCurrentTheme } from '-/reducers/settings';
// import AppOnBoarding from '../components/AppOnboarding';
import AppConfig from '-/config';

const lightTheme = createMuiTheme({
  palette: {
    type: 'light', // Switching the dark mode on is a single property value change.
    primary: {
      light: AppConfig.lightThemeLightColor,
      main: AppConfig.lightThemeMainColor,
      dark: AppConfig.lightThemeMainColor,
      contrastText: '#ffffff'
    },
    secondary: {
      main: AppConfig.lightThemeMainColor
    },
    divider: '#ddd'
    // secondary: { main: '#cccccc', 200: '#ddd' }
  }
});

const darkTheme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      light: AppConfig.darkThemeLightColor,
      main: AppConfig.darkThemeMainColor,
      dark: AppConfig.darkThemeMainColor,
      contrastText: '#ffffff'
    },
    secondary: {
      main: AppConfig.darkThemeMainColor
    },
    divider: '#555'
    // secondary: { main: '#555', 200: '#777' }
  }
});

// const lightBlueTheme = createMuiTheme({
//   palette: {
//     type: 'light', // Switching the dark mode on is a single property value change.
//     primary: {
//       light: '#cbe9fa',
//       main: '#19aeff',
//       dark: '#19aeff',
//       contrastText: '#ffffff',
//     },
//     secondary: {
//       main: '#19aeff',
//     },
//     divider: '#ddd'
//     // secondary: { main: '#cccccc', 200: '#ddd' }
//   }
// });

class App extends Component {
  props: {
    children: Object;
    currentTheme: string;
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
      <ThemeProvider theme={theme}>
        <I18nextProvider i18n={i18n}>{this.props.children}</I18nextProvider>
        {/* <AppOnBoarding /> */}
      </ThemeProvider>
    );
  }
}

function mapStateToProps(state) {
  return {
    currentTheme: getCurrentTheme(state)
  };
}

export default connect(mapStateToProps)(App);
