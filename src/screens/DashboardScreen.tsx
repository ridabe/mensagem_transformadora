import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Card, ScreenLayout } from '../components';
import { theme } from '../theme/theme';
import { AppText } from '../components/AppText';
import { sermonNoteRepository } from '../repositories/sermonNoteRepository';
import type { DashboardStats } from '../repositories/sermonNoteRepository';

export function DashboardScreen() {
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [status, setStatus] = React.useState<'loading' | 'ready'>('loading');

  const load = React.useCallback(async () => {
    setStatus('loading');
    try {
      const data = await sermonNoteRepository.getDashboardStats({ days: 7, topLimit: 5 });
      setStats(data);
    } finally {
      setStatus('ready');
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      load();
    }, [load])
  );

  const total = stats?.totalMessages ?? 0;
  const favorites = stats?.favorites ?? 0;
  const favoriteRatio = stats?.favoriteRatio ?? 0;
  const dailyCounts = stats?.dailyCounts ?? [];
  const topPreachers = stats?.topPreachers ?? [];
  const topChurches = stats?.topChurches ?? [];

  return (
    <ScreenLayout title="Dashboard" scroll>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AppText variant="subtitle">Visão geral</AppText>
          <Pressable onPress={load} style={({ pressed }) => [styles.refresh, pressed ? styles.refreshPressed : null]}>
            <MaterialIcons name="refresh" size={20} color={theme.colors.mutedText} />
          </Pressable>
        </View>

        <View style={styles.metricsRow}>
          <MetricCard
            title="Mensagens"
            value={String(total)}
            subtitle="Total cadastrado"
            iconName="notes"
            tone="primary"
          />
          <View style={styles.metricsSpacer} />
          <MetricCard
            title="Favoritos"
            value={String(favorites)}
            subtitle={total > 0 ? `${Math.round(favoriteRatio * 100)}% do total` : '0% do total'}
            iconName="star"
            tone="accent"
          />
        </View>

        <View style={styles.spacer} />

        <Card>
          <AppText variant="subtitle">Proporção de favoritos</AppText>
          <AppText color={theme.colors.mutedText} style={styles.paragraph}>
            {total > 0 ? `${favorites} de ${total} mensagens estão favoritados.` : 'Crie mensagens para visualizar estatísticas.'}
          </AppText>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.round(favoriteRatio * 100)}%` }]} />
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <AppText variant="subtitle" style={styles.sectionTitle}>
          Últimos 7 dias
        </AppText>
        <Card>
          {status === 'loading' && dailyCounts.length === 0 ? (
            <AppText color={theme.colors.mutedText}>Carregando...</AppText>
          ) : (
            <MiniBarChart data={dailyCounts} />
          )}
        </Card>
      </View>

      <View style={styles.section}>
        <AppText variant="subtitle" style={styles.sectionTitle}>
          Frequências
        </AppText>
        <View style={styles.grid}>
          <Card style={styles.gridCard}>
            <AppText variant="subtitle">Pregadores</AppText>
            {topPreachers.length === 0 ? (
              <AppText color={theme.colors.mutedText} style={styles.paragraph}>
                Sem dados ainda.
              </AppText>
            ) : (
              <TopList items={topPreachers} tone="primary" />
            )}
          </Card>
          <View style={styles.gridSpacer} />
          <Card style={styles.gridCard}>
            <AppText variant="subtitle">Igrejas</AppText>
            {topChurches.length === 0 ? (
              <AppText color={theme.colors.mutedText} style={styles.paragraph}>
                Sem dados ainda.
              </AppText>
            ) : (
              <TopList items={topChurches} tone="accent" />
            )}
          </Card>
        </View>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: theme.spacing.xl },
  sectionTitle: { marginBottom: theme.spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md },
  refresh: {
    width: 38,
    height: 38,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center'
  },
  refreshPressed: { backgroundColor: '#00000008' },
  metricsRow: { flexDirection: 'row' },
  metricsSpacer: { width: theme.spacing.md },
  spacer: { height: theme.spacing.md },
  paragraph: { marginTop: theme.spacing.sm },
  progressTrack: {
    marginTop: theme.spacing.md,
    height: 10,
    borderRadius: theme.radius.pill,
    backgroundColor: '#0B122014',
    overflow: 'hidden'
  },
  progressFill: {
    height: 10,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.gold
  },
  grid: { flexDirection: 'row' },
  gridSpacer: { width: theme.spacing.md },
  gridCard: { flex: 1 }
});

function MetricCard({
  title,
  value,
  subtitle,
  iconName,
  tone
}: {
  title: string;
  value: string;
  subtitle: string;
  iconName: React.ComponentProps<typeof MaterialIcons>['name'];
  tone: 'primary' | 'accent';
}) {
  const colors =
    tone === 'primary'
      ? (['#071A3A', '#0B2E6F', '#0D47A1'] as const)
      : (['#0B1220', '#1D1230', '#7E57C2'] as const);
  const iconBg = theme.colors.gold;

  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0.1, y: 0.05 }}
      end={{ x: 0.9, y: 0.95 }}
      style={metricStyles.card}
    >
      <View pointerEvents="none" style={metricStyles.orb} />
      <View style={metricStyles.header}>
        <View style={[metricStyles.iconWrap, { backgroundColor: iconBg }]}>
          <MaterialIcons name={iconName} size={18} color="#FFFFFF" />
        </View>
        <AppText variant="caption" style={metricStyles.kicker}>
          {title}
        </AppText>
      </View>
      <AppText style={metricStyles.value}>{value}</AppText>
      <AppText variant="caption" style={metricStyles.subtitle}>
        {subtitle}
      </AppText>
    </LinearGradient>
  );
}

const metricStyles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    overflow: 'hidden',
    ...theme.shadow.md
  },
  orb: {
    position: 'absolute',
    right: -70,
    top: -70,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: '#FFFFFF14'
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center'
  },
  kicker: { color: '#FFFFFFB3' },
  value: { fontSize: 36, fontWeight: '800', marginTop: theme.spacing.md, color: '#FFFFFF' },
  subtitle: { marginTop: theme.spacing.xs, color: '#FFFFFFB3' }
});

function MiniBarChart({ data }: { data: Array<{ day: string; count: number }> }) {
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <View style={chartStyles.wrap}>
      {data.map((d, idx) => {
        const height = Math.round((d.count / max) * 72);
        const label = d.day.slice(8, 10);
        const barColor = idx % 2 === 0 ? theme.colors.primaryDark : theme.colors.gold;
        return (
          <View key={d.day} style={chartStyles.item}>
            <View style={chartStyles.barTrack}>
              <View style={[chartStyles.bar, { height, backgroundColor: barColor }]} />
            </View>
            <AppText variant="caption" color={theme.colors.mutedText} style={chartStyles.day}>
              {label}
            </AppText>
            <AppText variant="caption" style={chartStyles.count}>
              {d.count}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}

const chartStyles = StyleSheet.create({
  wrap: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  item: { flex: 1, alignItems: 'center' },
  barTrack: {
    width: 16,
    height: 72,
    borderRadius: theme.radius.pill,
    backgroundColor: '#0B122014',
    overflow: 'hidden',
    justifyContent: 'flex-end'
  },
  bar: { width: 16, borderRadius: theme.radius.pill },
  day: { marginTop: theme.spacing.sm },
  count: { marginTop: 2 }
});

function TopList({
  items,
  tone
}: {
  items: Array<{ name: string; count: number }>;
  tone: 'primary' | 'accent';
}) {
  const max = Math.max(1, ...items.map((i) => i.count));
  const color = tone === 'primary' ? theme.colors.primary : theme.colors.accent;
  const soft = tone === 'primary' ? theme.colors.primarySoft : theme.colors.accentSoft;

  return (
    <View style={topStyles.list}>
      {items.map((item) => (
        <View key={item.name} style={topStyles.row}>
          <View style={topStyles.rowHeader}>
            <AppText numberOfLines={1} style={topStyles.name}>
              {item.name}
            </AppText>
            <AppText variant="caption" color={theme.colors.mutedText}>
              {item.count}
            </AppText>
          </View>
          <View style={[topStyles.track, { backgroundColor: soft }]}>
            <View style={[topStyles.fill, { width: `${Math.round((item.count / max) * 100)}%`, backgroundColor: color }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

const topStyles = StyleSheet.create({
  list: { marginTop: theme.spacing.md, gap: theme.spacing.md },
  row: {},
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { flex: 1, paddingRight: theme.spacing.sm },
  track: { height: 10, borderRadius: theme.radius.pill, overflow: 'hidden', marginTop: theme.spacing.sm },
  fill: { height: 10, borderRadius: theme.radius.pill }
});
