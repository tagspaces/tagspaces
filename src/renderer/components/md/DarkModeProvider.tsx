import type { FC, ReactNode, Dispatch, SetStateAction } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

export type SetState<T> = Dispatch<SetStateAction<T>>;
export const darkModeCtx = createContext<boolean>(false);
export const setDarkModeCtx = createContext<SetState<boolean>>(() => undefined);

export const useDarkMode = () => {
  return useContext(darkModeCtx);
};

export const useSetDarkMode = () => {
  return useContext(setDarkModeCtx);
};

export const DarkModeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') {
      // If window object is not available (like during server-side rendering),
      // default to false or true based on your preference.
      return false;
    }
    // @ts-ignore
    if (window.theme) {
      // @ts-ignore
      return window.theme === 'dark';
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (event: MediaQueryListEvent) => {
      const newColorScheme = !!event.matches;

      setDarkMode(newColorScheme);
    };

    media.addEventListener('change', listener);
    return () => {
      media.removeEventListener('change', listener);
    };
  }, []);

  useEffect(() => {
    // For Algolia DocSearch
    document.documentElement.setAttribute(
      'data-theme',
      darkMode ? 'dark' : 'light',
    );
    // For TailwindCSS
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <darkModeCtx.Provider value={darkMode}>
      <setDarkModeCtx.Provider value={setDarkMode}>
        {children}
      </setDarkModeCtx.Provider>
    </darkModeCtx.Provider>
  );
};
