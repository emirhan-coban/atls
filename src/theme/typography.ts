/**
 * Display faces, loaded in App.tsx via @expo-google-fonts/instrument-serif. The family has only a regular and an
 * italic style, so headlines get their weight from size, and the italic is kept for one emphasised word or a subtitle.
 * `displayHeavy` is the same face; it stays as a name so headline styles do not need to change.
 */
export const fonts = {
  display: 'InstrumentSerif_400Regular',
  displayHeavy: 'InstrumentSerif_400Regular',
  displayItalic: 'InstrumentSerif_400Regular_Italic',
};

export const typography = {
  fontSize: {
    xxs: 10,
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  lineHeight: {
    tight: 1.15,
    normal: 1.35,
    relaxed: 1.5,
  },
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
    black: '900' as const,
  },
  letterSpacing: {
    tighter: -0.8,
    tight: -0.4,
    normal: 0,
    wide: 0.6,
    wider: 1.2,
    widest: 2.0,
  },
};

export type TypographyType = typeof typography;
