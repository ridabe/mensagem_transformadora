import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Image, StyleSheet, View, Linking } from 'react-native';

import { AppButton, AppText, Card, ScreenLayout } from '../components';
import type { HomeStackParamList } from '../navigation/RootNavigator';
import { theme } from '../theme/theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'About'>;

export function AboutScreen({ navigation }: Props) {
  return (
    <ScreenLayout title="Sobre o Aplicativo" scroll contentStyle={styles.content}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../img/logo.png')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Logo Mensagem Transformadora"
        />
        <AppText variant="title" style={styles.title}>
          Mensagem Transformadora
        </AppText>
        <View style={styles.badge}>
          <AppText variant="caption" style={styles.badgeText}>
            Versão 1.0
          </AppText>
        </View>
      </View>

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

      <View style={styles.actions}>
        <AppButton label="Voltar" variant="ghost" onPress={() => navigation.goBack()} />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  badge: {
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  badgeText: {
    color: theme.colors.primary,
    fontWeight: '600',
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
});
