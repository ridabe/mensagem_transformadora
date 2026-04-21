import React from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { theme } from '../theme/theme';
import { AppText } from './AppText';

export type PremiumSplashOverlayProps = {
  visible: boolean;
  durationMs?: number;
  onRequestHideNativeSplash?: () => void;
  onFinished: () => void;
};

export function PremiumSplashOverlay({
  visible,
  durationMs = 2400,
  onRequestHideNativeSplash,
  onFinished
}: PremiumSplashOverlayProps) {
  const opacity = React.useRef(new Animated.Value(0)).current;
  const scale = React.useRef(new Animated.Value(0.985)).current;

  const didRunRef = React.useRef(false);

  React.useEffect(() => {
    if (!visible) return;
    if (didRunRef.current) return;
    didRunRef.current = true;

    onRequestHideNativeSplash?.();

    const fadeIn = Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 520, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 680, useNativeDriver: true })
    ]);

    const hold = Animated.delay(Math.max(0, durationMs - 520 - 520));

    const fadeOut = Animated.timing(opacity, { toValue: 0, duration: 520, useNativeDriver: true });

    Animated.sequence([fadeIn, hold, fadeOut]).start(({ finished }) => {
      if (finished) onFinished();
    });
  }, [durationMs, onFinished, onRequestHideNativeSplash, opacity, scale, visible]);

  if (!visible) return null;

  return (
    <View style={styles.wrap} pointerEvents="auto">
      <LinearGradient
        colors={['#071A3A', '#0B2E6F', '#0D47A1'] as const}
        start={{ x: 0.1, y: 0.05 }}
        end={{ x: 0.9, y: 0.95 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['#D7B15A33', '#D7B15A00', '#D7B15A00'] as const}
        start={{ x: 0.95, y: 0.1 }}
        end={{ x: 0.15, y: 0.8 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.dots} />

      <Animated.View style={[styles.content, { opacity, transform: [{ scale }] }]}>
        <View style={styles.logoRing}>
          <View style={styles.logoRingInner}>
            <Image source={require('../../img/logo.png')} style={styles.logo} resizeMode="contain" />
          </View>
        </View>

        <View style={styles.wordmark}>
          <AppText variant="overline" style={styles.kicker}>
            ANOTAÇÕES OFFLINE
          </AppText>
          <AppText variant="display" style={styles.title}>
            Mensagem
          </AppText>
          <View style={styles.titleRow}>
            <AppText variant="display" style={[styles.title, styles.titleAccent]}>
              Transformadora
            </AppText>
            <View style={styles.goldDot} />
          </View>
          <AppText style={styles.subtitle} color="#EAF2FF">
            Registre e revisite suas pregações com clareza.
          </AppText>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#071A3A',
    alignItems: 'center',
    justifyContent: 'center'
  },
  dots: {
    position: 'absolute',
    left: -80,
    top: -120,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#FFFFFF10'
  },
  content: { alignItems: 'center', paddingHorizontal: theme.spacing.xl },
  logoRing: {
    width: 118,
    height: 118,
    borderRadius: 59,
    borderWidth: 1,
    borderColor: '#FFFFFF22',
    backgroundColor: '#FFFFFF0F',
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoRingInner: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#FFFFFF10',
    borderWidth: 1,
    borderColor: '#FFFFFF1A',
    alignItems: 'center',
    justifyContent: 'center'
  },
  logo: { width: 54, height: 54 },
  wordmark: { marginTop: theme.spacing.lg, alignItems: 'center' },
  kicker: { color: '#FFFFFFB3' },
  title: { color: '#FFFFFF', textAlign: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  titleAccent: { color: '#D7B15A' },
  goldDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D7B15A',
    marginLeft: 8,
    marginTop: 6
  },
  subtitle: { marginTop: theme.spacing.md, textAlign: 'center', maxWidth: 320 }
});
