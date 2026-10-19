export const colors = {
  primary: '#6527B8', primaryPressed: '#4E1D91', primarySoft: '#F4EEFB',
  accent: '#F58220', accentSoft: '#FFF1E5',
  white: '#FFFFFF', background: '#FAFAFC', heading: '#1D1D22', body: '#64666D',
  muted: '#92959C', border: '#E8E7EC', success: '#15803D', successSoft: '#F0FDF4',
  danger: '#B91C1C', dangerSoft: '#FEF2F2', warning: '#A16207', warningSoft: '#FEFCE8',
} as const;
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { small: 8, button: 14, card: 20, sheet: 30, pill: 999 } as const;
export const typography = {
  regular: 'Manrope_400Regular', medium: 'Manrope_500Medium', semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold', extrabold: 'Manrope_800ExtraBold',
} as const;
