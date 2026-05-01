export const theme = {
  colors: {
    background: '#F7F9FC',
    backgroundAlt: '#EDF4FF',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    text: '#121417',
    mutedText: '#5E6872',
    border: '#E6E8EB',
    borderMuted: '#D7DDEA',
    surfacePressed: '#00000008',
    surfaceOverlay: '#FFFFFF14',
    surfaceOverlayStrong: '#FFFFFF22',
    backdrop: '#00000066',
    brand: '#071A3A',
    brandSoft: '#0B2E6F',
    onBrand: '#FFFFFF',
    onBrandSoft: '#EAF2FF',
    primary: '#0D47A1',
    primaryDark: '#071A3A',
    primarySoft: '#E8F0FF',
    primaryExtraSoft: '#DCE7FF',
    primaryPressed: '#0B3B8C',
    primaryOverlay: '#0D47A11A',
    primaryOverlaySoft: '#0D47A114',
    onBrandOverlay: '#FFFFFF12',
    accent: '#7E57C2',
    accentSoft: '#F3E8FF',
    gold: '#D7B15A',
    goldSoft: '#FFF5DC',
    goldOverlay: '#D7B15A33',
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
    display: { fontSize: 30, fontWeight: '800' as const, letterSpacing: 0.2, lineHeight: 36 },
    title: { fontSize: 20, fontWeight: '700' as const, letterSpacing: 0.2, lineHeight: 26 },
    subtitle: { fontSize: 16, fontWeight: '600' as const, letterSpacing: 0.1, lineHeight: 22 },
    body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
    caption: { fontSize: 13, fontWeight: '600' as const, letterSpacing: 0.2, lineHeight: 18 },
    overline: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 0.6, lineHeight: 16 }
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
