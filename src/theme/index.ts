// SmartKid Tutor — shared design tokens
// Mirrors the palette & type system used on web (frontend/) and in the
// mobile design showcase: teal/amber brand, Nunito display + Inter body.

export const colors = {
  teal: '#1A5F7A',
  tealDark: '#144F66',
  tealDeep: '#0F2F3E',
  amber: '#D97706',
  amberLight: '#F2A93B',
  amberDark: '#B86305',
  coral: '#E76F51',
  sage: '#6B8E7F',
  navy: '#0A192F',
  navyDark: '#070F1E',
  navyCard: '#112240',
  navyLight: '#1E3A5F',
  cream: '#FBF7EE',
  sand: '#F5F2EC',
  charcoal: '#0F172A',
  textLight: '#0F172A',
  textMuted: '#475569',
  textDim: '#64748B',
  muted: '#475569',
  mutedLight: '#64748B',
  border: '#E2E8F0',
  borderLight: 'rgba(0, 0, 0, 0.08)',
  white: '#FFFFFF',
  danger: '#DC2626',
  inputBg: '#FFFFFF',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 26,
  pill: 999,
} as const;

export const type = {
  display: 'Nunito_800ExtraBold',
  displayBlack: 'Nunito_900Black',
  displaySemi: 'Nunito_700Bold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemi: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
} as const;

export const shadow = {
  card: {
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  soft: {
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  glowTeal: {
    shadowColor: '#0EA5E9',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  glowAmber: {
    shadowColor: '#F59E0B',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
} as const;

