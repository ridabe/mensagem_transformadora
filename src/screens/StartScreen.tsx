import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { AppButton, AppText, Card, IconButton, ScreenLayout, SermonCard } from '../components';
import type { HomeStackParamList } from '../navigation/RootNavigator';
import { sermonNoteRepository } from '../repositories/sermonNoteRepository';
import { theme } from '../theme/theme';
import type { SermonNote } from '../types/sermon';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

export function StartScreen({ navigation }: Props) {
  const [items, setItems] = React.useState<SermonNote[]>([]);
  const [status, setStatus] = React.useState<'loading' | 'ready'>('loading');

  const load = React.useCallback(async () => {
    setStatus('loading');
    try {
      const data = await sermonNoteRepository.list({ limit: 3, offset: 0 });
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setStatus('ready');
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      load();
    }, [load])
  );

  return (
    <ScreenLayout 
      title="Mensagem Transformadora" 
      headerVariant="brand" 
      scroll 
      contentStyle={styles.content}
      rightHeader={
        <IconButton 
          iconName="info-outline" 
          accessibilityLabel="Sobre o aplicativo" 
           color="#FFFFFF" 
           variant="brand"
          onPress={() => navigation.navigate('About')} 
        />
      }
    >
      <View style={styles.hero}>
        <LinearGradient
          colors={['#071A3A', '#0B2E6F', '#0D47A1'] as const}
          start={{ x: 0.05, y: 0.05 }}
          end={{ x: 0.95, y: 0.95 }}
          style={styles.heroGradient}
        >
          <LinearGradient
            colors={['#D7B15A33', '#D7B15A00', '#D7B15A00'] as const}
            start={{ x: 0.9, y: 0.1 }}
            end={{ x: 0.2, y: 0.9 }}
            style={styles.heroGold}
          />
          <View pointerEvents="none" style={styles.heroOrb} />

          <View style={styles.heroTop}>
            <View style={styles.heroBadge}>
              <MaterialIcons name="offline-bolt" size={18} color="#FFFFFF" />
              <AppText variant="caption" style={styles.heroBadgeText}>
                Offline • Local • Rápido
              </AppText>
            </View>
          </View>

          <AppText variant="display" style={styles.heroTitle}>
            Capture sua pregação.
          </AppText>
          <AppText style={styles.heroSubtitle} color="#EAF2FF">
            Um espaço premium para anotar, organizar e revisitar mensagens — sem depender de internet.
          </AppText>

          <View style={styles.heroActions}>
            <AppButton
              label="Nova mensagem"
              iconName="add"
              variant="light"
              onPress={() => navigation.navigate('NewMessage')}
            />
            <View style={styles.heroSpacer} />
            <AppButton
              label="Ver histórico"
              variant="outlineLight"
              iconName="history"
              onPress={() => navigation.navigate('History')}
            />
          </View>
        </LinearGradient>
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <AppText variant="overline" color={theme.colors.mutedText}>
            ATALHO RÁPIDO
          </AppText>
          <AppText variant="subtitle">Últimas mensagens</AppText>
        </View>
        <Pressable
          onPress={() => navigation.navigate('History')}
          style={({ pressed }) => [styles.link, pressed ? styles.linkPressed : null]}
        >
          <AppText variant="caption" style={styles.linkText}>
            Ver tudo
          </AppText>
          <MaterialIcons name="chevron-right" size={18} color={theme.colors.primary} />
        </Pressable>
      </View>

      {status === 'loading' && items.length === 0 ? (
        <Card>
          <AppText color={theme.colors.mutedText}>Carregando...</AppText>
        </Card>
      ) : items.length === 0 ? (
        <Card>
          <View style={styles.emptyHeader}>
            <View style={styles.emptyIcon}>
              <MaterialIcons name="auto-stories" size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.emptyText}>
              <AppText variant="subtitle">Nenhuma mensagem ainda</AppText>
              <AppText color={theme.colors.mutedText} style={styles.paragraph}>
                Crie sua primeira anotação e comece a construir seu histórico.
              </AppText>
            </View>
          </View>
          <View style={styles.emptyActions}>
            <AppButton label="Criar primeira mensagem" iconName="add" onPress={() => navigation.navigate('NewMessage')} />
          </View>
        </Card>
      ) : (
        <View style={styles.cards}>
          {items.map((item, index) => (
            <SermonCard
              key={item.id}
              title={item.sermonTitle}
              subtitle={`${item.preacherName} • ${item.churchName}`}
              meta={`${item.sermonDate}${item.sermonTime ? ` • ${item.sermonTime}` : ''}`}
              favorite={item.favorite}
              index={index}
              onPress={() => navigation.navigate('Details', { id: item.id })}
            />
          ))}
        </View>
      )}

      <View style={styles.bottomCta}>
        <AppButton
          label="Adicionar sermão"
          iconName="edit-note"
          onPress={() => navigation.navigate('NewMessage')}
        />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: theme.spacing.md, paddingBottom: 120 },
  hero: { borderRadius: theme.radius.xl, overflow: 'hidden' },
  heroGradient: { borderRadius: theme.radius.xl, padding: theme.spacing.xl, overflow: 'hidden' },
  heroGold: { ...StyleSheet.absoluteFillObject },
  heroOrb: {
    position: 'absolute',
    right: -90,
    top: -90,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#FFFFFF12'
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF1F',
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm
  },
  heroBadgeText: { color: '#FFFFFF', marginLeft: theme.spacing.sm },
  heroTitle: { color: '#FFFFFF', marginTop: theme.spacing.lg },
  heroSubtitle: { marginTop: theme.spacing.sm, lineHeight: 21 },
  heroActions: { marginTop: theme.spacing.xl },
  heroSpacer: { height: theme.spacing.sm },
  sectionHeader: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  link: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 6, borderRadius: theme.radius.pill },
  linkPressed: { backgroundColor: '#00000008' },
  linkText: { color: theme.colors.primary, marginRight: 2 },
  cards: { gap: theme.spacing.md },
  paragraph: { marginTop: theme.spacing.sm },
  bottomCta: { marginTop: theme.spacing.xl },
  emptyHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  emptyIcon: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyText: { flex: 1, paddingLeft: theme.spacing.md },
  emptyActions: { marginTop: theme.spacing.md }
});
