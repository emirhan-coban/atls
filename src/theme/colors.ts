// ==============================================================================
// ATLS DESIGN SYSTEM: 60-30-10 COLOR ARCHITECTURE
// 60% Canvas   — graphite surfaces (#090B0E → #18202C)
// 30% Glass    — frosted translucent layers + 1px hairline borders
// 10% Accent   — one signature: Passport Gold (#E5A93C). Cobalt = "visited" ink only.
// ==============================================================================

export const darkColors = {
  // 60% DOMINANT CANVAS
  canvas: {
    base: '#090B0E',        // App background
    raised: '#0E1218',      // Secondary surface
    surface: '#131922',     // Card backdrop
    elevated: '#18202C',    // Sheets, popovers
  },

  // 30% FROSTED GLASS (use with BlurView for floating layers)
  glass: {
    fill: 'rgba(255, 255, 255, 0.05)',
    fillStrong: 'rgba(255, 255, 255, 0.09)',
    fillActive: 'rgba(255, 255, 255, 0.14)',
    border: 'rgba(255, 255, 255, 0.16)',
    borderSoft: 'rgba(255, 255, 255, 0.06)',
    hairline: 'rgba(255, 255, 255, 0.11)',      // default 1px divider / card outline
    borderStrong: 'rgba(255, 255, 255, 0.22)',
    tint: 'rgba(9, 11, 14, 0.38)',   // dark scrim laid over BlurView
    scrimRgb: '9, 11, 14',            // rgb of the scrim GlassCard lays over the blur
    scrimOpacity: 0.38,               // how strongly that scrim covers the blur
    blurTint: 'dark' as 'dark' | 'light',
    blur: 55,                         // default BlurView intensity
  },

  // 10% SIGNATURE ACCENT — Passport Gold
  gold: {
    base: '#E5A93C',
    light: '#F3C766',
    deep: '#B45309',
    glow: 'rgba(229, 169, 60, 0.25)',
    tint: 'rgba(229, 169, 60, 0.12)',
    border: 'rgba(229, 169, 60, 0.35)',
    onGold: '#090B0E',      // text/icons placed on solid gold (white fails contrast)
  },

  // TEXT
  text: {
    primary: '#FFFFFF',
    soft: '#E2E8F0',
    secondary: '#94A3B8',
    muted: '#7D8BA1',
    faint: '#5E6E85',
  },

  // Dark translucent panels that sit above content without blur
  panel: {
    base: 'rgba(15, 20, 32, 0.88)',
    raised: 'rgba(20, 26, 40, 0.95)',
  },

  // STATUS — real passport-stamp inks (single source of truth)
  status: {
    visited: {
      color: '#3B82F6',              // Ink blue
      bright: '#60A5FA',
      deep: '#2563EB',
      light: 'rgba(59, 130, 246, 0.12)',
      border: 'rgba(59, 130, 246, 0.30)',
    },
    lived: {
      color: '#10B981',              // Residence green
      bright: '#34D399',
      light: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.30)',
    },
    want: {
      color: '#E5A93C',              // Wishlist gold
      light: 'rgba(229, 169, 60, 0.12)',
      border: 'rgba(229, 169, 60, 0.35)',
    },
  },

  danger: '#EF4444',
  dangerDeep: '#DC2626',
  dangerTint: 'rgba(239, 68, 68, 0.12)',
  dangerBorder: 'rgba(239, 68, 68, 0.30)',

  // Scrim behind modals and sheets
  overlay: 'rgba(0, 0, 0, 0.55)',

  // World map land, dimmed land and borders
  map: {
    land: '#18202C',
    landDim: '#101624',
    border: '#25324B',
  },

  // Continents — kept distinct from gold/blue/green status roles where possible
  continents: {
    europe: {
      name: 'Europe',
      primary: '#3B82F6',
      gradient: ['#60A5FA', '#2563EB'],
      bg: 'rgba(59, 130, 246, 0.10)',
      text: '#93C5FD',
      border: 'rgba(59, 130, 246, 0.25)',
    },
    asia: {
      name: 'Asia',
      primary: '#E5A93C',
      gradient: ['#F3C766', '#D97706'],
      bg: 'rgba(229, 169, 60, 0.10)',
      text: '#F3C766',
      border: 'rgba(229, 169, 60, 0.25)',
    },
    americas: {
      name: 'Americas',
      primary: '#10B981',
      gradient: ['#34D399', '#059669'],
      bg: 'rgba(16, 185, 129, 0.10)',
      text: '#6EE7B7',
      border: 'rgba(16, 185, 129, 0.25)',
    },
    africa: {
      name: 'Africa',
      primary: '#E06D53',
      gradient: ['#F0907B', '#C2410C'],
      bg: 'rgba(224, 109, 83, 0.10)',
      text: '#F0907B',
      border: 'rgba(224, 109, 83, 0.25)',
    },
    oceania: {
      name: 'Oceania',
      primary: '#06B6D4',
      gradient: ['#22D3EE', '#0891B2'],
      bg: 'rgba(6, 182, 212, 0.10)',
      text: '#67E8F9',
      border: 'rgba(6, 182, 212, 0.25)',
    },
    antarctica: {
      name: 'Antarctica',
      primary: '#94A3B8',
      gradient: ['#CBD5E1', '#64748B'],
      bg: 'rgba(148, 163, 184, 0.10)',
      text: '#E2E8F0',
      border: 'rgba(148, 163, 184, 0.25)',
    },
  },

  gradients: {
    canvas: ['#090B0E', '#0E1218', '#131922'],
    gold: ['#E5A93C', '#B45309'],
    glassCard: ['rgba(255, 255, 255, 0.07)', 'rgba(255, 255, 255, 0.02)'],
  },

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export type ColorsType = typeof darkColors;

// ==============================================================================
// LIGHT THEME — warm paper canvas, same roles as the dark palette.
// Gold is deepened so it stays readable as text on a light background.
// ==============================================================================
export const lightColors: ColorsType = {
  canvas: {
    base: '#F5F1E8',
    raised: '#FBF9F4',
    surface: '#FFFFFF',
    elevated: '#FFFFFF',
  },

  glass: {
    fill: 'rgba(20, 24, 31, 0.05)',
    fillStrong: 'rgba(20, 24, 31, 0.08)',
    fillActive: 'rgba(20, 24, 31, 0.12)',
    border: 'rgba(20, 24, 31, 0.16)',
    borderSoft: 'rgba(20, 24, 31, 0.06)',
    hairline: 'rgba(20, 24, 31, 0.10)',
    borderStrong: 'rgba(20, 24, 31, 0.20)',
    tint: 'rgba(255, 255, 255, 0.62)',
    scrimRgb: '255, 255, 255',
    scrimOpacity: 0.8,                // light glass needs a near-opaque scrim or text reads poorly over the blur
    blurTint: 'light',
    blur: 55,
  },

  gold: {
    base: '#B7791F',
    light: '#9A6208', // in the light theme "light" is the text-safe tone (the dark theme's is a bright tint)
    deep: '#8A5A12',
    glow: 'rgba(183, 121, 31, 0.22)',
    tint: 'rgba(183, 121, 31, 0.12)',
    border: 'rgba(183, 121, 31, 0.40)',
    onGold: '#FFFFFF',
  },

  text: {
    primary: '#14181F',
    soft: '#2A3140',
    secondary: '#454D5E',
    muted: '#5A6275',
    faint: '#7A8292',
  },

  panel: {
    base: 'rgba(255, 255, 255, 0.88)',
    raised: 'rgba(255, 255, 255, 0.96)',
  },

  status: {
    visited: {
      color: '#2563EB',
      bright: '#1D4ED8',
      deep: '#1E40AF',
      light: 'rgba(37, 99, 235, 0.10)',
      border: 'rgba(37, 99, 235, 0.30)',
    },
    lived: {
      color: '#059669',
      bright: '#047857',
      light: 'rgba(5, 150, 105, 0.10)',
      border: 'rgba(5, 150, 105, 0.30)',
    },
    want: {
      color: '#B7791F',
      light: 'rgba(183, 121, 31, 0.12)',
      border: 'rgba(183, 121, 31, 0.35)',
    },
  },

  danger: '#DC2626',
  dangerDeep: '#B91C1C',
  dangerTint: 'rgba(220, 38, 38, 0.10)',
  dangerBorder: 'rgba(220, 38, 38, 0.30)',

  overlay: 'rgba(20, 24, 31, 0.38)',

  map: {
    land: '#E6DFCD',
    landDim: '#EFEADC',
    border: '#C8BFA6',
  },

  continents: {
    europe: { ...darkColors.continents.europe, text: '#1D4ED8' },
    asia: { ...darkColors.continents.asia, text: '#8A5A12' },
    americas: { ...darkColors.continents.americas, text: '#047857' },
    africa: { ...darkColors.continents.africa, text: '#C2410C' },
    oceania: { ...darkColors.continents.oceania, text: '#0E7490' },
    antarctica: { ...darkColors.continents.antarctica, text: '#475569' },
  },

  gradients: {
    canvas: ['#F5F1E8', '#FBF9F4', '#FFFFFF'],
    gold: ['#D49A1E', '#8A5A12'],
    glassCard: ['rgba(255, 255, 255, 0.85)', 'rgba(255, 255, 255, 0.55)'],
  },

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

/** Static dark palette. Prefer `useTheme().colors` in components so they follow the theme. */
export const colors = darkColors;
