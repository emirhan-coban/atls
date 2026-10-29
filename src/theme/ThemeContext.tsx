import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { Appearance, StyleSheet, useColorScheme } from 'react-native';
import { ColorsType, darkColors, lightColors } from './colors';
import { useAppStore } from '../stores/useAppStore';

export type ThemePreference = 'system' | 'light' | 'dark';
export type ThemeScheme = 'light' | 'dark';

interface ThemeValue {
  colors: ColorsType;
  scheme: ThemeScheme;
}

const ThemeContext = createContext<ThemeValue>({ colors: darkColors, scheme: 'dark' });

/**
 * Resolves the active palette from the user's preference (system / light / dark) and keeps
 * native chrome (keyboard, alerts, status bar) in sync via Appearance.setColorScheme.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const preference = useAppStore((state) => state.themePreference);
  const systemScheme = useColorScheme();

  useEffect(() => {
    Appearance.setColorScheme(preference === 'system' ? 'unspecified' : preference);
  }, [preference]);

  const scheme: ThemeScheme =
    preference === 'system' ? (systemScheme === 'light' ? 'light' : 'dark') : preference;

  const value = useMemo<ThemeValue>(
    () => ({ colors: scheme === 'light' ? lightColors : darkColors, scheme }),
    [scheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  return useContext(ThemeContext);
}

/**
 * Themed replacement for a module-level StyleSheet.create:
 *   const useStyles = makeStyles((colors) => StyleSheet.create({ ... }));
 *   const styles = useStyles();
 */
export function makeStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  factory: (colors: ColorsType) => T
) {
  return function useStyles(): T {
    const { colors } = useTheme();
    return useMemo(() => factory(colors), [colors]);
  };
}
