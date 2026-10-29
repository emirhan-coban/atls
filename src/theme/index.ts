import { colors } from './colors';
import { spacing, borderRadius } from './spacing';
import { typography } from './typography';
import { shadows } from './shadows';
export { ThemeProvider, useTheme, makeStyles } from './ThemeContext';
export type { ThemePreference, ThemeScheme } from './ThemeContext';

export const theme = {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
};

export { colors, spacing, borderRadius, typography, shadows };
export default theme;
