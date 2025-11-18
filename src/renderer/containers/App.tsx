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

import {
  getCurrentTheme,
  getDefaultDarkTheme,
  getDefaultRegularTheme,
} from '-/reducers/settings';
import { createTSTheme } from '-/utils/Themes';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useEffect, useMemo } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

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
    let lightTheme = createTSTheme(defaultRegularTheme, false);
    let darkTheme = createTSTheme(defaultDarkTheme, true);

    switch (currentTheme) {
      case 'light':
        return lightTheme;
      case 'dark':
        return darkTheme;
      case 'system':
        return systemDarkMode ? darkTheme : lightTheme;
      default:
        return lightTheme;
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
