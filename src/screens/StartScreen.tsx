import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { AppButton, AppText, Card, IconButton, ScreenLayout } from '../components';
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
          onPress={() => navigation.navigate('About')} 
        />
      }
    >
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.heroBadge}>
            <MaterialIcons name="offline-bolt" size={18} color="#FFFFFF" />
            <AppText variant="caption" style={styles.heroBadgeText}>
              Offline • Local • Rápido
            </AppText>
          </View>
        </View>

        <AppText variant="title" style={styles.heroTitle}>
          Registre mensagens com clareza e revisite quando quiser.
        </AppText>
        <AppText style={styles.heroSubtitle} color="#EAF2FF">
          Crie, edite, favorite e organize suas anotações — tudo 100% offline.
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
      </View>

      <View style={styles.sectionHeader}>
        <AppText variant="subtitle">Últimas mensagens</AppText>
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
          <AppText variant="subtitle">Nenhuma mensagem ainda</AppText>
          <AppText color={theme.colors.mutedText} style={styles.paragraph}>
            Toque em “Nova mensagem” para criar sua primeira anotação.
          </AppText>
        </Card>
      ) : (
        <View style={styles.cards}>
          {items.map((item) => (
            <Pressable key={item.id} onPress={() => navigation.navigate('Details', { id: item.id })}>
              <Card>
                <View style={styles.cardHeader}>
                  <AppText variant="subtitle" numberOfLines={2} style={styles.cardTitle}>
                    {item.sermonTitle}
                  </AppText>
                  {item.favorite ? (
                    <MaterialIcons name="star" size={20} color={theme.colors.primary} />
                  ) : (
                    <MaterialIcons name="star-border" size={20} color={theme.colors.mutedText} />
                  )}
                </View>
                <AppText color={theme.colors.mutedText} style={styles.cardMeta} numberOfLines={1}>
                  {item.preacherName} • {item.churchName}
                </AppText>
                <AppText color={theme.colors.mutedText} style={styles.cardMeta} numberOfLines={1}>
                  {item.sermonDate}
                  {item.sermonTime ? ` • ${item.sermonTime}` : ''}
                </AppText>
              </Card>
            </Pressable>
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
  hero: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF26',
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm
  },
  heroBadgeText: { color: '#FFFFFF', marginLeft: theme.spacing.sm },
  heroTitle: { color: '#FFFFFF', marginTop: theme.spacing.md },
  heroSubtitle: { marginTop: theme.spacing.sm },
  heroActions: { marginTop: theme.spacing.lg },
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
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  cardTitle: { flex: 1, paddingRight: theme.spacing.md },
  cardMeta: { marginTop: theme.spacing.sm },
  paragraph: { marginTop: theme.spacing.sm },
  bottomCta: { marginTop: theme.spacing.xl }
});
