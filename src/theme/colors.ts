export const colors = {
  // Cosmic Void & Deep Obsidian Canvas
  cosmic: {
    void: '#07090E',        // Deepest space background
    obsidian: '#0B0F19',    // Secondary surface
    surface: '#111726',     // Card surface
    surfaceElevated: '#172033',
    glass: 'rgba(255, 255, 255, 0.05)',
    glassBorder: 'rgba(255, 255, 255, 0.10)',
    glassHover: 'rgba(255, 255, 255, 0.08)',
    glassActive: 'rgba(255, 255, 255, 0.14)',
  },

  // Celestial Auras & Neon Accents (Reference 1, 2, 3)
  aura: {
    solar: '#FF6B35',       // Warm solar flare / sunset core
    solarLight: '#FFA07A',
    solarGlow: 'rgba(255, 107, 53, 0.35)',
    
    sapphire: '#2E5CFF',    // Electric cosmic cobalt
    sapphireLight: '#60A5FA',
    sapphireGlow: 'rgba(46, 92, 255, 0.35)',

    purple: '#7C3AED',      // Ethereal nebula purple
    purpleGlow: 'rgba(124, 58, 237, 0.35)',

    citron: '#E2F952',      // Cyber lime / citron accent (Ref 3)
    citronMuted: '#9DB324',

    emerald: '#00F5A0',     // Neon aurora mint
  },

  // Continents in Cosmic Mode (Glow / Neon accents)
  continents: {
    europe: {
      name: 'Europe',
      primary: '#3B82F6',
      gradient: ['#60A5FA', '#1D4ED8'],
      bg: 'rgba(59, 130, 246, 0.12)',
      text: '#93C5FD',
      border: 'rgba(59, 130, 246, 0.3)',
    },
    asia: {
      name: 'Asia',
      primary: '#FF6B35',
      gradient: ['#FFA07A', '#DC2626'],
      bg: 'rgba(255, 107, 53, 0.12)',
      text: '#FDBA74',
      border: 'rgba(255, 107, 53, 0.3)',
    },
    americas: {
      name: 'Americas',
      primary: '#00F5A0',
      gradient: ['#34D399', '#059669'],
      bg: 'rgba(0, 245, 160, 0.12)',
      text: '#6EE7B7',
      border: 'rgba(0, 245, 160, 0.3)',
    },
    africa: {
      name: 'Africa',
      primary: '#F59E0B',
      gradient: ['#FBBF24', '#D97706'],
      bg: 'rgba(245, 158, 11, 0.12)',
      text: '#FCD34D',
      border: 'rgba(245, 158, 11, 0.3)',
    },
    oceania: {
      name: 'Oceania',
      primary: '#06B6D4',
      gradient: ['#22D3EE', '#0891B2'],
      bg: 'rgba(6, 182, 212, 0.12)',
      text: '#67E8F9',
      border: 'rgba(6, 182, 212, 0.3)',
    },
    antarctica: {
      name: 'Antarctica',
      primary: '#94A3B8',
      gradient: ['#CBD5E1', '#64748B'],
      bg: 'rgba(148, 163, 184, 0.12)',
      text: '#E2E8F0',
      border: 'rgba(148, 163, 184, 0.3)',
    },
  },

  // Status in Cosmic Glow
  status: {
    visited: {
      color: '#3B82F6',
      light: 'rgba(59, 130, 246, 0.15)',
      border: 'rgba(59, 130, 246, 0.4)',
    },
    lived: {
      color: '#00F5A0',
      light: 'rgba(0, 245, 160, 0.15)',
      border: 'rgba(0, 245, 160, 0.4)',
    },
    want: {
      color: '#FF6B35',
      light: 'rgba(255, 107, 53, 0.15)',
      border: 'rgba(255, 107, 53, 0.4)',
    },
  },

  // Primary brand palette (electric cosmic cobalt)
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

  // Neutrals for Dark Glass Canvas
  dark: {
    bg: '#07090E',
    card: '#111726',
    cardSecondary: '#172033',
    border: 'rgba(255, 255, 255, 0.10)',
    textPrimary: '#FFFFFF',
    textSecondary: '#CBD5E1',
    textMuted: '#64748B',
  },

  light: {
    bg: '#07090E', // Dark cosmic is our signature default
    card: 'rgba(255, 255, 255, 0.05)',
    cardSecondary: '#111726',
    border: 'rgba(255, 255, 255, 0.10)',
    textPrimary: '#FFFFFF',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
  },

  // Ethereal Gradients
  gradients: {
    cosmicVoid: ['#07090E', '#0B0F19', '#111726'],
    solarAura: ['#FF6B35', '#FFA07A', 'rgba(255, 107, 53, 0)'],
    sapphireAura: ['#2E5CFF', '#60A5FA', 'rgba(46, 92, 255, 0)'],
    nebula: ['#7C3AED', '#2E5CFF', '#00F5A0'],
    sunsetGlass: ['#FF6B35', '#F59E0B'],
    glassCard: ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.02)'],
    passportGold: ['#F59E0B', '#B45309'],
  },

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export type ColorsType = typeof colors;
