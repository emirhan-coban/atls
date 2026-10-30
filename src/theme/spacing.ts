export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
};

export const borderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
};

export type SpacingType = typeof spacing;
export type BorderRadiusType = typeof borderRadius;

/**
 * Page-level layout. Every screen uses these so content does not shift sideways when switching tabs.
 * Spacing between cards inside a screen is `section`; the bottom padding leaves room for the floating tab bar.
 */
export const layout = {
  /** Left and right margin of every screen and sheet. */
  screen: 20,
  /** Gap between stacked cards and sections. */
  section: 14,
  /** Space under the last item so the floating tab bar never covers it. */
  tabBarClearance: 112,
  /** Padding inside cards. */
  card: 16,
};
