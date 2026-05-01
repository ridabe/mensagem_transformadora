import React from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { theme } from '../theme/theme';
import { AppText } from './AppText';

export type PremiumSplashOverlayProps = {
  visible: boolean;
  durationMs?: number;
  canFinish?: boolean;
  onRequestHideNativeSplash?: () => void;
  onFinished: () => void;
};

export function PremiumSplashOverlay({
  visible,
  durationMs = 2400,
  canFinish = true,
  onRequestHideNativeSplash,
  onFinished
}: PremiumSplashOverlayProps) {
  const opacity = React.useRef(new Animated.Value(0)).current;
  const scale = React.useRef(new Animated.Value(0.985)).current;

  const didRunRef = React.useRef(false);
  const minElapsedRef = React.useRef(false);
  const fadeOutStartedRef = React.useRef(false);

  React.useEffect(() => {
    if (!visible) return;
    if (didRunRef.current) return;
    didRunRef.current = true;

    onRequestHideNativeSplash?.();

    const fadeInMs = 420;
    const fadeOutMs = 420;
    const holdMs = Math.max(0, durationMs - fadeInMs - fadeOutMs);

    const fadeIn = Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: fadeInMs, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 560, useNativeDriver: true })
    ]);

    const hold = Animated.delay(holdMs);

    const startFadeOut = () => {
      if (fadeOutStartedRef.current) return;
      fadeOutStartedRef.current = true;
      Animated.timing(opacity, { toValue: 0, duration: fadeOutMs, useNativeDriver: true }).start(({ finished }) => {
        if (finished) onFinished();
      });
    };

    Animated.sequence([fadeIn, hold]).start(({ finished }) => {
      if (!finished) return;
      minElapsedRef.current = true;
      if (canFinish) startFadeOut();
    });
  }, [canFinish, durationMs, onFinished, onRequestHideNativeSplash, opacity, scale, visible]);

  React.useEffect(() => {
    if (!visible) return;
    if (!minElapsedRef.current) return;
    if (!canFinish) return;
    if (fadeOutStartedRef.current) return;

    fadeOutStartedRef.current = true;
    Animated.timing(opacity, { toValue: 0, duration: 420, useNativeDriver: true }).start(({ finished }) => {
      if (finished) onFinished();
    });
  }, [canFinish, onFinished, opacity, visible]);

  if (!visible) return null;

  return (
    <View style={styles.wrap} pointerEvents="auto">
      <LinearGradient
        colors={[theme.colors.brand, theme.colors.brandSoft, theme.colors.primary] as const}
        start={{ x: 0.1, y: 0.05 }}
        end={{ x: 0.9, y: 0.95 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={[theme.colors.goldOverlay, '#D7B15A00', '#D7B15A00'] as const}
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
    borderColor: theme.colors.surfaceOverlayStrong,
    backgroundColor: theme.colors.surfaceOverlay,
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoRingInner: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: theme.colors.surfaceOverlay,
    borderWidth: 1,
    borderColor: theme.colors.surfaceOverlayStrong,
    alignItems: 'center',
    justifyContent: 'center'
  },
  logo: { width: 54, height: 54 },
  wordmark: { marginTop: theme.spacing.lg, alignItems: 'center' },
  kicker: { color: theme.colors.onBrandSoft },
  title: { color: theme.colors.onBrand, textAlign: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  titleAccent: { color: theme.colors.gold },
  goldDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.gold,
    marginLeft: 8,
    marginTop: 6
  },
  subtitle: { marginTop: theme.spacing.md, textAlign: 'center', maxWidth: 320 }
});
