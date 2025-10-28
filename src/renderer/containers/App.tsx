/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces GmbH
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

import AppConfig from '-/AppConfig';
import {
  getCurrentTheme,
  getDefaultDarkTheme,
  getDefaultRegularTheme,
} from '-/reducers/settings';
import {
  StyledEngineProvider,
  ThemeProvider,
  createTheme,
} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useEffect, useMemo } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

declare module '@mui/material/styles' {
  interface Theme extends Record<string, any> {}
}

// Theme definitions
const legacyTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      light: AppConfig.lightThemeLightColor,
      main: AppConfig.lightThemeMainColor,
      dark: AppConfig.lightThemeMainColor,
    },
    secondary: { main: '#777' },
    divider: '#ddd',
  },
});

const newlightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      light: '#a6def4',
      main: '#3bc8ff',
      dark: '#3bc8ff',
    },
    secondary: { main: '#777' },
    divider: '#ddd',
  },
});

const darklegacyTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      light: AppConfig.darkThemeLightColor,
      main: AppConfig.darkThemeMainColor,
      dark: AppConfig.darkThemeMainColor,
    },
    secondary: { main: '#bbb' },
    divider: '#555',
  },
});

const darkblueTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      light: '#a6def4',
      main: '#3bc8ff',
      dark: '#3bc8ff',
    },
    secondary: { main: '#bbb' },
    background: { default: '#001E3C' },
    divider: '#555',
  },
});

const draculaTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      light: '#503d50',
      main: '#BD93F9',
      dark: '#BD93F9',
    },
    secondary: { main: '#bbb' },
    divider: '#555',
    background: { default: '#282A36' },
    text: { primary: '#f8f8f2' },
  },
});

interface Props {
  children: React.ReactNode;
}

function App({ children }: Props) {
  const { i18n } = useTranslation();
  const currentTheme = useSelector(getCurrentTheme);
  const defaultDarkTheme = useSelector(getDefaultDarkTheme);
  const defaultRegularTheme = useSelector(getDefaultRegularTheme);
  const systemDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  // Memoize theme selection for performance and clarity
  const theme = useMemo(() => {
    let regularTheme = legacyTheme;
    let darkTheme = darklegacyTheme;

    switch (defaultRegularTheme) {
      case 'newlight':
        regularTheme = newlightTheme;
        break;
      case 'legacy':
      default:
        regularTheme = legacyTheme;
    }
    switch (defaultDarkTheme) {
      case 'darkblue':
        darkTheme = darkblueTheme;
        break;
      case 'dracula':
        darkTheme = draculaTheme;
        break;
      case 'darklegacy':
      default:
        darkTheme = darklegacyTheme;
    }
    switch (currentTheme) {
      case 'light':
        return regularTheme;
      case 'dark':
        return darkTheme;
      case 'system':
        return systemDarkMode ? darkTheme : regularTheme;
      default:
        return regularTheme;
    }
  }, [currentTheme, defaultDarkTheme, defaultRegularTheme, systemDarkMode]);

  useEffect(() => {
    const darkMode = theme.palette.mode === 'dark';
    // For 3th party css like TailwindCSS
    document.documentElement.setAttribute(
      'data-theme',
      darkMode ? 'dark' : 'light',
    );
    document.documentElement.classList.toggle('dark', darkMode);
  }, [theme.palette.mode]);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default App;
