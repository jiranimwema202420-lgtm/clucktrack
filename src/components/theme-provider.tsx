'use client';

import * as React from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeProviderProps {
  children: React.ReactNode;
  attribute?: 'class' | 'data-theme';
  defaultTheme?: Theme;
  enableSystem?: boolean;
}

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(
  undefined
);

export function ThemeProvider({
  children,
  attribute = 'class',
  defaultTheme = 'system',
  enableSystem = true,
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = React.useState<'light' | 'dark'>(
    'light'
  );

  React.useEffect(() => {
    const storedTheme = window.localStorage.getItem(
      'clucktrack-theme'
    ) as Theme | null;

    if (
      storedTheme === 'light' ||
      storedTheme === 'dark' ||
      storedTheme === 'system'
    ) {
      setThemeState(storedTheme);
    }
  }, []);

  React.useEffect(() => {
    const root = document.documentElement;

    const getResolvedTheme = (): 'light' | 'dark' => {
      if (theme === 'light') return 'light';
      if (theme === 'dark') return 'dark';

      if (enableSystem) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
      }

      return 'light';
    };

    const resolved = getResolvedTheme();

    setResolvedTheme(resolved);

    if (attribute === 'class') {
      root.classList.remove('light', 'dark');
      root.classList.add(resolved);
    } else {
      root.setAttribute('data-theme', resolved);
    }

    window.localStorage.setItem('clucktrack-theme', theme);
  }, [theme, attribute, enableSystem]);

  React.useEffect(() => {
    if (!enableSystem || theme !== 'system') return;

    const mediaQuery = window.matchMedia(
      '(prefers-color-scheme: dark)'
    );

    const handleChange = (event: MediaQueryListEvent) => {
      const nextTheme = event.matches ? 'dark' : 'light';

      setResolvedTheme(nextTheme);

      const root = document.documentElement;

      if (attribute === 'class') {
        root.classList.remove('light', 'dark');
        root.classList.add(nextTheme);
      } else {
        root.setAttribute('data-theme', nextTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme, attribute, enableSystem]);

  const setTheme = React.useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme);
  }, []);

  const value = React.useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [theme, resolvedTheme, setTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = React.useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used inside a ThemeProvider');
  }

  return context;
}