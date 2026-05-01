import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Image, StyleSheet, View, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { AppButton, AppText, Card, ScreenLayout } from '../components';
import type { HomeStackParamList } from '../navigation/RootNavigator';
import { theme } from '../theme/theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'About'>;

export function AboutScreen({ navigation }: Props) {
  return (
    <ScreenLayout title="Sobre o Aplicativo" scroll contentStyle={styles.content}>
      <LinearGradient
        colors={[theme.colors.brand, theme.colors.brandSoft, theme.colors.primary] as const}
        start={{ x: 0.05, y: 0.05 }}
        end={{ x: 0.95, y: 0.95 }}
        style={styles.hero}
      >
        <View pointerEvents="none" style={styles.heroGold} />
        <View pointerEvents="none" style={styles.heroOrb} />
        <View style={styles.logoContainer}>
          <View style={styles.logoRing}>
            <View style={styles.logoRingInner}>
              <Image
                source={require('../../img/logo.png')}
                style={styles.logo}
                resizeMode="contain"
                accessibilityLabel="Logo Mensagem Transformadora"
              />
            </View>
          </View>
          <AppText variant="title" style={styles.title}>
            Mensagem Transformadora
          </AppText>
          <View style={styles.badge}>
            <AppText variant="caption" style={styles.badgeText}>
              Versão 1.0.5
            </AppText>
          </View>
        </View>
      </LinearGradient>

      <Card style={styles.card}>
        <View style={styles.row}>
          <AppText color={theme.colors.mutedText}>Desenvolvedor:</AppText>
          <AppText variant="subtitle">Ricardo Bene</AppText>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <AppText color={theme.colors.mutedText}>Empresa:</AppText>
          <AppText variant="subtitle">Algoritmum Desenvolvimento</AppText>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <AppText color={theme.colors.mutedText}>Licença:</AppText>
          <AppText variant="subtitle">Software Gratuito</AppText>
        </View>
      </Card>

      <View style={styles.descriptionContainer}>
        <AppText style={styles.description} color={theme.colors.mutedText}>
          Este aplicativo foi desenvolvido com o propósito de ajudar você a registrar, organizar e revisitar pregações de forma simples, 100% offline e com total privacidade dos seus dados.
        </AppText>
      </View>

      <Card style={styles.card}>
        <AppText variant="overline" color={theme.colors.mutedText}>
          Dados
        </AppText>
        <View style={styles.backupActions}>
          <AppButton label="Backup e Restauração" onPress={() => navigation.navigate('Backup')} />
        </View>
        <AppText variant="caption" color={theme.colors.mutedText} style={styles.backupHint}>
          Exporte um arquivo de backup para restaurar suas mensagens caso precise reinstalar o app.
        </AppText>
      </Card>

      <View style={styles.actions}>
        <AppButton label="Voltar" variant="ghost" onPress={() => navigation.goBack()} />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl
  },
  hero: {
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    overflow: 'hidden',
    marginBottom: theme.spacing.xl,
    ...theme.shadow.md
  },
  heroGold: {
    position: 'absolute',
    left: -160,
    bottom: -180,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: theme.colors.goldOverlay
  },
  heroOrb: {
    position: 'absolute',
    right: -90,
    top: -120,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: theme.colors.onBrandOverlay
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoRing: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 1,
    borderColor: theme.colors.surfaceOverlayStrong,
    backgroundColor: theme.colors.surfaceOverlay,
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoRingInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: theme.colors.surfaceOverlay,
    borderWidth: 1,
    borderColor: theme.colors.surfaceOverlayStrong,
    alignItems: 'center',
    justifyContent: 'center'
  },
  logo: { width: 54, height: 54 },
  title: {
    marginTop: theme.spacing.lg,
    textAlign: 'center',
    color: theme.colors.onBrand
  },
  badge: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.surfaceOverlay,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.surfaceOverlayStrong
  },
  badgeText: {
    color: theme.colors.onBrand,
    fontWeight: '700'
  },
  card: {
    marginBottom: theme.spacing.xl,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.xs,
  },
  descriptionContainer: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  description: {
    textAlign: 'center',
    lineHeight: 22,
  },
  actions: {
    marginTop: 'auto',
  },
  backupActions: {
    marginTop: theme.spacing.md,
  },
  backupHint: {
    marginTop: theme.spacing.md,
    lineHeight: 18,
  },
});
