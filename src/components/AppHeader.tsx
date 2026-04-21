import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '../theme/theme';
import { AppText } from './AppText';

export type AppHeaderProps = {
  title: string;
  right?: React.ReactNode;
  variant?: 'default' | 'brand' | 'transparent';
  showTitle?: boolean;
};

export function AppHeader({ title, right, variant = 'default', showTitle = true }: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const isBrand = variant === 'brand';
  const isTransparent = variant === 'transparent';

  return (
    <View
      style={[
        styles.container,
        isTransparent ? styles.containerTransparent : isBrand ? styles.containerBrand : styles.containerDefault,
        { paddingTop: Math.max(insets.top, theme.spacing.lg) }
      ]}
    >
      <View style={styles.left}>
        <Image
          source={require('../../img/logo.png')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Logo Mensagem Transformadora"
        />
        {showTitle ? (
          <AppText
            variant="title"
            numberOfLines={1}
            style={[styles.title, isBrand ? styles.titleBrand : styles.titleDefault]}
          >
            {title}
          </AppText>
        ) : null}
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
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  containerDefault: {
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: '#0000000A'
  },
  containerBrand: {
    backgroundColor: '#071A3A',
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4
  },
  containerTransparent: { backgroundColor: 'transparent', borderBottomWidth: 0 },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: theme.spacing.md },
  right: { alignItems: 'flex-end', justifyContent: 'center' },
  logo: { width: 22, height: 22, marginRight: theme.spacing.sm },
  title: { flexShrink: 1 },
  titleDefault: { color: theme.colors.text },
  titleBrand: { color: '#FFFFFF' }
});
