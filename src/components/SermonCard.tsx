import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { theme } from '../theme/theme';
import { AppText } from './AppText';
import { Card } from './Card';

export type SermonCardProps = {
  title: string;
  subtitle: string;
  meta: string;
  favorite: boolean;
  onPress: () => void;
  index?: number;
  showVerseLine?: boolean;
  verseLine?: string;
};

export function SermonCard({
  title,
  subtitle,
  meta,
  favorite,
  onPress,
  index = 0,
  showVerseLine = false,
  verseLine
}: SermonCardProps) {
  const palette = getPrimaryCardPalette(index);

  return (
    <Pressable onPress={onPress}>
      <Card style={[styles.card, { backgroundColor: palette.bg, borderColor: palette.bg }]}>
        <View pointerEvents="none" style={[styles.overlay, { backgroundColor: palette.overlay }]} />
        <View style={styles.header}>
          <AppText variant="subtitle" numberOfLines={2} style={styles.title}>
            {title}
          </AppText>
          <MaterialIcons
            name={favorite ? 'star' : 'star-border'}
            size={20}
            color={favorite ? theme.colors.primary : theme.colors.mutedText}
          />
        </View>
        <AppText color={theme.colors.mutedText} style={styles.line} numberOfLines={1}>
          {subtitle}
        </AppText>
        <AppText color={theme.colors.mutedText} style={styles.line} numberOfLines={1}>
          {meta}
        </AppText>
        {showVerseLine && verseLine ? (
          <AppText style={styles.line} numberOfLines={1}>
            <AppText variant="caption" color={theme.colors.mutedText}>
              Versículo base:{' '}
            </AppText>
            {verseLine}
          </AppText>
        ) : null}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { overflow: 'hidden', position: 'relative' },
  overlay: {
    position: 'absolute',
    right: -70,
    top: -50,
    width: 180,
    height: 180,
    borderRadius: 90
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  title: { flex: 1, paddingRight: theme.spacing.md },
  line: { marginTop: theme.spacing.sm }
});

function getPrimaryCardPalette(index: number): { bg: string; overlay: string } {
  const variants = [
    { bg: theme.colors.primarySoft, overlay: '#0D47A11A' },
    { bg: theme.colors.backgroundAlt, overlay: '#0D47A114' },
    { bg: '#DCE7FF', overlay: '#0D47A117' }
  ];
  return variants[index % variants.length];
}
