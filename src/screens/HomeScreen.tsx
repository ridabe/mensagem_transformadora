import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import React from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { AppButton, Card, Fab, IconButton, ScreenLayout } from '../components';
import type { HomeStackParamList } from '../navigation/RootNavigator';
import { sermonNoteRepository } from '../repositories/sermonNoteRepository';
import { theme } from '../theme/theme';
import { AppText } from '../components/AppText';
import type { SermonNote } from '../types/sermon';

type Props = NativeStackScreenProps<HomeStackParamList, 'History'>;

export function HomeScreen({ navigation }: Props) {
  const [query, setQuery] = React.useState('');
  const [debouncedQuery, setDebouncedQuery] = React.useState('');
  const [items, setItems] = React.useState<SermonNote[]>([]);
  const [status, setStatus] = React.useState<'loading' | 'ready'>('loading');

  React.useEffect(() => {
    const handle = setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => clearTimeout(handle);
  }, [query]);

  const load = React.useCallback(async () => {
    setStatus('loading');
    try {
      const data = await sermonNoteRepository.list({ searchText: debouncedQuery, limit: 500, offset: 0 });
      setItems(data);
    } finally {
      setStatus('ready');
    }
  }, [debouncedQuery]);

  useFocusEffect(
    React.useCallback(() => {
      load();
    }, [load])
  );

  const renderItem = React.useCallback(
    ({ item, index }: { item: SermonNote; index: number }) => {
      const palette = getPrimaryCardPalette(index);
      return (
      <Pressable onPress={() => navigation.navigate('Details', { id: item.id })} style={styles.cardPressable}>
        <Card style={[styles.coloredCard, { backgroundColor: palette.bg, borderColor: palette.bg }]}>
          <View pointerEvents="none" style={[styles.coloredOverlay, { backgroundColor: palette.overlay }]} />
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
          <AppText style={styles.cardMeta} numberOfLines={1}>
            <AppText variant="caption" color={theme.colors.mutedText}>
              Versículo base:{' '}
            </AppText>
            {item.mainVerse}
          </AppText>
        </Card>
      </Pressable>
      );
    },
    [navigation]
  );

  return (
    <ScreenLayout
      title="Histórico"
      rightHeader={
        <IconButton iconName="home" accessibilityLabel="Início" onPress={() => navigation.navigate('Home')} />
      }
    >
      <View style={styles.container}>
        <View style={styles.searchWrap}>
          <MaterialIcons name="search" size={20} color={theme.colors.mutedText} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar por título, pregador, igreja, versículo..."
            placeholderTextColor={theme.colors.mutedText}
            style={styles.searchInput}
            autoCapitalize="sentences"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
        </View>

        {status === 'loading' && items.length === 0 ? (
          <Card>
            <AppText variant="subtitle">Carregando...</AppText>
          </Card>
        ) : items.length === 0 ? (
          <Card>
            <View style={styles.emptyHeader}>
              <View style={styles.emptyIcon}>
                <MaterialIcons name={debouncedQuery ? 'search-off' : 'inbox'} size={22} color={theme.colors.primary} />
              </View>
              <View style={styles.emptyText}>
                <AppText variant="subtitle">
                  {debouncedQuery ? 'Nada encontrado' : 'Sem mensagens no histórico'}
                </AppText>
                <AppText color={theme.colors.mutedText} style={styles.paragraph}>
                  {debouncedQuery
                    ? 'Tente buscar por outros termos.'
                    : 'Crie sua primeira anotação para começar a registrar suas mensagens.'}
                </AppText>
              </View>
            </View>
            {!debouncedQuery ? (
              <View style={styles.emptyActions}>
                <AppButton label="Criar primeira mensagem" iconName="add" onPress={() => navigation.navigate('NewMessage')} />
              </View>
            ) : null}
          </Card>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={styles.list}
          />
        )}
      </View>

      <Fab onPress={() => navigation.navigate('NewMessage')} accessibilityLabel="Nova mensagem" />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: theme.spacing.md },
  paragraph: { marginTop: theme.spacing.sm },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    paddingVertical: 0,
    color: theme.colors.text
  },
  list: { flex: 1, marginTop: theme.spacing.md },
  listContent: { paddingBottom: 120 },
  separator: { height: theme.spacing.md },
  cardPressable: {},
  coloredCard: { overflow: 'hidden', position: 'relative' },
  coloredOverlay: {
    position: 'absolute',
    right: -70,
    top: -50,
    width: 180,
    height: 180,
    borderRadius: 90
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  cardTitle: { flex: 1, paddingRight: theme.spacing.md },
  cardMeta: { marginTop: theme.spacing.sm },
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

function getPrimaryCardPalette(index: number): { bg: string; overlay: string } {
  const variants = [
    { bg: theme.colors.primarySoft, overlay: '#1E6FDB1A' },
    { bg: theme.colors.backgroundAlt, overlay: '#1E6FDB14' },
    { bg: '#D7E7FF', overlay: '#1E6FDB17' }
  ];
  return variants[index % variants.length];
}
