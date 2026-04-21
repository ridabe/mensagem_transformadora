export const theme = {
  colors: {
    background: '#F7F9FC',
    backgroundAlt: '#EDF4FF',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    text: '#121417',
    mutedText: '#5E6872',
    border: '#E6E8EB',
    primary: '#0D47A1',
    primaryDark: '#071A3A',
    primarySoft: '#E8F0FF',
    primaryPressed: '#0B3B8C',
    accent: '#7E57C2',
    accentSoft: '#F3E8FF',
    gold: '#D7B15A',
    goldSoft: '#FFF5DC',
    success: '#43A047',
    successSoft: '#E8F5E9',
    danger: '#D92D20',
    dangerPressed: '#B42318'
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
    xxl: 32
  },
  radius: {
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
    pill: 999
  },
  typography: {
    display: { fontSize: 26, fontWeight: '800' as const, letterSpacing: 0.2, lineHeight: 30 },
    title: { fontSize: 18, fontWeight: '700' as const, letterSpacing: 0.2 },
    subtitle: { fontSize: 14, fontWeight: '600' as const, letterSpacing: 0.1 },
    body: { fontSize: 14, fontWeight: '400' as const, lineHeight: 21 },
    caption: { fontSize: 12, fontWeight: '600' as const, letterSpacing: 0.2 },
    overline: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 0.6 }
  },
  shadow: {
    sm: {
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 2
    },
    md: {
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 10 },
      elevation: 4
    }
  }
};
