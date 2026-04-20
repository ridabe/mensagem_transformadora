import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '../theme/theme';
import { AppText } from './AppText';

export type AppHeaderProps = {
  title: string;
  right?: React.ReactNode;
  variant?: 'default' | 'brand';
};

export function AppHeader({ title, right, variant = 'default' }: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const isBrand = variant === 'brand';

  return (
    <View
      style={[
        styles.container,
        isBrand ? styles.containerBrand : styles.containerDefault,
        { paddingTop: Math.max(insets.top, theme.spacing.lg) }
      ]}
    >
      <View style={styles.left}>
        <View style={[styles.logoWrap, isBrand ? styles.logoWrapBrand : styles.logoWrapDefault]}>
          <Image
            source={require('../../img/logo.png')}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Logo Mensagem Transformadora"
          />
        </View>
        <AppText
          variant="title"
          numberOfLines={1}
          style={[styles.title, isBrand ? styles.titleBrand : styles.titleDefault]}
        >
          {title}
        </AppText>
      </View>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between'
  },
  containerDefault: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  containerBrand: {
    backgroundColor: theme.colors.primary,
    borderBottomWidth: 0
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: theme.spacing.md },
  right: { alignItems: 'flex-end', justifyContent: 'center' },
  logoWrap: {
    width: 28,
    height: 28,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm
  },
  logoWrapDefault: {
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  logoWrapBrand: {
    backgroundColor: '#FFFFFF'
  },
  logo: { width: 18, height: 18 },
  title: { flexShrink: 1 },
  titleDefault: { color: theme.colors.text },
  titleBrand: { color: '#FFFFFF' }
});
