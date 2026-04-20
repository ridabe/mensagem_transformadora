export const theme = {
  colors: {
    background: '#F7F7F8',
    backgroundAlt: '#EEF2FF',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    text: '#121417',
    mutedText: '#5E6872',
    border: '#E6E8EB',
    primary: '#1E6FDB',
    primarySoft: '#E7F0FF',
    primaryPressed: '#1759B0',
    accent: '#7C3AED',
    accentSoft: '#F3E8FF',
    danger: '#D92D20',
    dangerPressed: '#B42318'
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24
  },
  radius: {
    sm: 10,
    md: 14,
    lg: 18,
    pill: 999
  },
  typography: {
    title: { fontSize: 18, fontWeight: '700' as const, letterSpacing: 0.2 },
    subtitle: { fontSize: 14, fontWeight: '600' as const },
    body: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
    caption: { fontSize: 12, fontWeight: '500' as const }
  }
};
