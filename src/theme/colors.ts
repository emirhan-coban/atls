// ==============================================================================
// ATLS DESIGN SYSTEM: 60-30-10 COLOR ARCHITECTURE
// 60% Canvas (#090B0E deep slate/graphite)
// 30% Frosted Glass & Surface Structures (rgba(255,255,255,0.05-0.09) + 1px hairline)
// 10% Signature Passport Foil / Accent (#E5A93C Warm Amber & #3B82F6 Cobalt)
// ==============================================================================

export const colors = {
  // 60% DOMINANT CANVAS
  cosmic: {
    void: '#090B0E',        // Deepest neutral slate canvas (calm, zero disco)
    obsidian: '#0E1218',    // Secondary surface
    surface: '#131922',     // Subtle card backdrop
    surfaceElevated: '#18202C',
    glass: 'rgba(255, 255, 255, 0.05)',
    glassBorder: 'rgba(255, 255, 255, 0.10)',
    glassHover: 'rgba(255, 255, 255, 0.08)',
    glassActive: 'rgba(255, 255, 255, 0.14)',
  },

  // 10% SIGNATURE ACCENTS (Refined & Human)
  aura: {
    // Primary Signature: Passport Gold / Warm Amber
    gold: '#E5A93C',
    goldLight: '#F3C766',
    goldGlow: 'rgba(229, 169, 60, 0.25)',

    // Secondary Signature: Ink Cobalt (Traditional passport ink)
    sapphire: '#3B82F6',
    sapphireLight: '#60A5FA',
    sapphireGlow: 'rgba(59, 130, 246, 0.25)',

    // Subtle warm terracotta
    solar: '#E06D53',
    solarLight: '#F0907B',
    solarGlow: 'rgba(224, 109, 83, 0.20)',

    // Calmed secondary tones for accents
    purple: '#8B5CF6',
    purpleGlow: 'rgba(139, 92, 246, 0.20)',
    citron: '#E5A93C',      // Replaced neon lime with warm gold
    citronMuted: '#B8860B',
    emerald: '#10B981',     // Soft emerald (not blinding neon)
  },

  // Continents in Refined Monocle Style
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
      text: '#FCD34D',
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
      primary: '#F59E0B',
      gradient: ['#FBBF24', '#D97706'],
      bg: 'rgba(245, 158, 11, 0.10)',
      text: '#FCD34D',
      border: 'rgba(245, 158, 11, 0.25)',
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

  // Status with Real Passport Stamp Inks
  status: {
    visited: {
      color: '#3B82F6',               // Ink Blue
      light: 'rgba(59, 130, 246, 0.12)',
      border: 'rgba(59, 130, 246, 0.35)',
    },
    lived: {
      color: '#10B981',               // Green Residence Stamp
      light: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.35)',
    },
    want: {
      color: '#E5A93C',               // Warm Gold Wishlist
      light: 'rgba(229, 169, 60, 0.12)',
      border: 'rgba(229, 169, 60, 0.35)',
    },
  },

  // Primary brand palette
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  // 30% Neutrals & Frosted Glass Surfaces
  dark: {
    bg: '#090B0E',
    card: 'rgba(255, 255, 255, 0.05)',
    cardSecondary: '#131922',
    border: 'rgba(255, 255, 255, 0.10)',
    borderLight: 'rgba(255, 255, 255, 0.06)',
    textPrimary: '#FFFFFF',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
  },

  light: {
    bg: '#090B0E',
    card: 'rgba(255, 255, 255, 0.05)',
    cardSecondary: '#131922',
    border: 'rgba(255, 255, 255, 0.10)',
    textPrimary: '#FFFFFF',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
  },

  // Tasteful Gradients (no disco rainbow)
  gradients: {
    cosmicVoid: ['#090B0E', '#0E1218', '#131922'],
    solarAura: ['#E5A93C', '#D97706'],
    sapphireAura: ['#3B82F6', '#1D4ED8'],
    nebula: ['#3B82F6', '#10B981'],
    sunsetGlass: ['#E5A93C', '#E06D53'],
    glassCard: ['rgba(255, 255, 255, 0.07)', 'rgba(255, 255, 255, 0.02)'],
    passportGold: ['#E5A93C', '#B45309'],
  },

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export type ColorsType = typeof colors;
