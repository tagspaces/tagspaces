/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2025-present TagSpaces GmbH
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
import { createTheme } from '@mui/material';

export const createTSTheme = (themeName: string, isDark: boolean = false) => {
  let palette = isDark ? darkThemes[themeName] : lightThemes[themeName];
  if (!palette) {
    const primaryLightColor = isDark
      ? AppConfig.darkThemeLightColor
      : AppConfig.lightThemeLightColor;
    const primaryMainColor = isDark
      ? AppConfig.darkThemeMainColor
      : AppConfig.lightThemeMainColor;
    palette = {
      mode: isDark ? 'dark' : 'light',
      primary: {
        light: primaryLightColor,
        main: primaryMainColor,
        dark: primaryMainColor,
      },
      secondary: { main: isDark ? '#bbb' : '#777' },
      divider: isDark ? '#555' : '#ddd',
    };
  }

  return createTheme({
    palette,
    components: {
      MuiDialog: {
        styleOverrides: {
          paper: ({ theme }) => ({
            borderRadius: '15px',
            [theme.breakpoints.down('md')]: {
              borderRadius: '0px',
            },
          }),
        },
      },
    },
  });
};

export const darkThemes = {};
darkThemes['darklegacy'] = {
  mode: 'dark',
  primary: {
    light: AppConfig.darkThemeLightColor,
    main: AppConfig.darkThemeMainColor,
    dark: AppConfig.darkThemeMainColor,
  },
  secondary: { main: '#bbb' },
  background: { default: '#282A36' },
  divider: '#555',
};
darkThemes['dracula'] = {
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
};
darkThemes['darkblue'] = {
  mode: 'dark',
  primary: {
    light: '#a6def4',
    main: '#3bc8ff',
    dark: '#3bc8ff',
  },
  secondary: { main: '#bbb' },
  background: { default: '#001E3C' },
  text: { primary: '#f8f8f2' },
  divider: '#555',
};
darkThemes['oilgreen'] = {
  mode: 'dark',
  primary: {
    light: '#138086',
    main: '#138086',
    dark: '#04484cff',
  },
  secondary: { main: '#bbb' },
  background: { default: '#000' },
  text: { primary: '#f8f8f2' },
  divider: '#555',
};
darkThemes['orangegreen'] = {
  mode: 'dark',
  primary: {
    light: '#f3b759',
    main: '#f3b759',
    dark: '#fd8f52',
  },
  secondary: { main: '#bbb' },
  background: { default: '#0d4a3a' },
  text: { primary: '#f8f8f2' },
  divider: '#555',
};
darkThemes['limecoal'] = {
  mode: 'dark',
  primary: {
    light: '#a8b735ff', // fe7f2d
    main: '#a8b735ff',
    dark: '#a8b735ff',
  },
  secondary: { main: '#bbb' },
  background: { default: '#233d4d' },
  text: { primary: '#f8f8f2' },
  divider: '#555',
};

export const lightThemes = {};
lightThemes['legacy'] = {
  mode: 'light',
  primary: {
    light: AppConfig.lightThemeLightColor,
    main: AppConfig.lightThemeMainColor,
    dark: AppConfig.lightThemeMainColor,
  },
  secondary: { main: '#777' },
  background: { default: '#fff' },
  divider: '#ddd',
};
lightThemes['newlight'] = {
  mode: 'light',
  primary: {
    light: '#a6def4',
    main: '#3bc8ff',
    dark: '#3bc8ff',
  },
  secondary: { main: '#777' },
  background: { default: '#f4f4f4ff' },
  divider: '#ddd',
};
lightThemes['orange'] = {
  mode: 'light',
  primary: {
    light: '#fcb272ff',
    main: '#ed7a13',
    dark: '#b45808ff',
  },
  secondary: { main: '#777' },
  background: { default: '#f4f4f4ff' },
  divider: '#ddd',
};
lightThemes['herbal'] = {
  mode: 'light',
  primary: {
    light: '#b9d08fff',
    main: '#6a8042',
    dark: '#1e3006',
  },
  secondary: { main: '#777' },
  background: { default: '#f4f4f4ff' },
  divider: '#ddd',
};
lightThemes['lemonblue'] = {
  mode: 'light',
  primary: {
    light: '#486989ff',
    main: '#486989ff',
    dark: '#486989ff',
  },
  secondary: { main: '#777' },
  background: { default: '#f6f1dfff' },
  divider: '#ddd',
};
lightThemes['vanilablue'] = {
  mode: 'light',
  primary: {
    light: '#4c9db0',
    main: '#4c9db0',
    dark: '#4c9db0',
  },
  secondary: { main: '#777' },
  background: { default: '#ffebaf' },
  divider: '#ddd',
};
