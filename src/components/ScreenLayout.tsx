import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../theme/theme';
import { AppHeader } from './AppHeader';

export type ScreenLayoutProps = {
  title: string;
  rightHeader?: React.ReactNode;
  headerVariant?: React.ComponentProps<typeof AppHeader>['variant'];
  children: React.ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
};

export function ScreenLayout({
  title,
  rightHeader,
  headerVariant = 'default',
  children,
  scroll = false,
  contentStyle
}: ScreenLayoutProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <AppHeader title={title} right={rightHeader} variant={headerVariant} />
      {scroll ? (
        <ScrollView contentContainerStyle={[styles.content, contentStyle]} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  content: { flexGrow: 1, padding: theme.spacing.lg, backgroundColor: theme.colors.background }
});
