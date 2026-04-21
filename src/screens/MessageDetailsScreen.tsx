import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { AppButton, Card, IconButton, ScreenLayout } from '../components';
import type { HomeStackParamList } from '../navigation/RootNavigator';
import { sermonNoteRepository } from '../repositories/sermonNoteRepository';
import { shareSermonNoteAsPdf } from '../services/pdf';
import { theme } from '../theme/theme';
import { AppText } from '../components/AppText';
import type { SermonNote } from '../types/sermon';

type Props = NativeStackScreenProps<HomeStackParamList, 'Details'>;

export function MessageDetailsScreen({ navigation, route }: Props) {
  const { id } = route.params;
  const [note, setNote] = React.useState<SermonNote | null>(null);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'not_found'>('loading');
  const [isWorking, setIsWorking] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    setStatus('loading');

    sermonNoteRepository
      .getById(id)
      .then((result) => {
        if (cancelled) return;
        if (!result) {
          setNote(null);
          setStatus('not_found');
          return;
        }
        setNote(result);
        setStatus('ready');
      })
      .catch(() => {
        if (cancelled) return;
        setNote(null);
        setStatus('not_found');
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleToggleFavorite() {
    if (!note || isWorking) return;
    const updatedAt = new Date().toISOString();
    const next = !note.favorite;

    try {
      setIsWorking(true);
      await sermonNoteRepository.setFavorite(note.id, next, updatedAt);
      setNote({ ...note, favorite: next, updatedAt });
    } finally {
      setIsWorking(false);
    }
  }

  async function handleDuplicate() {
    if (!note || isWorking) return;
    try {
      setIsWorking(true);
      const newId = await sermonNoteRepository.duplicate(note.id);
      navigation.replace('Details', { id: newId });
    } catch {
      Alert.alert('Erro', 'Não foi possível duplicar a mensagem.');
      setIsWorking(false);
    }
  }

  async function handleExportPdf() {
    if (!note || isWorking) return;
    try {
      setIsWorking(true);
      await shareSermonNoteAsPdf(note);
    } catch {
      Alert.alert('Erro', 'Não foi possível gerar o PDF.');
    } finally {
      setIsWorking(false);
    }
  }
  function handleDelete() {
    if (!note || isWorking) return;

    Alert.alert('Excluir mensagem', 'Tem certeza que deseja excluir esta mensagem? Essa ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsWorking(true);
            await sermonNoteRepository.remove(note.id);
            navigation.popToTop();
          } catch {
            Alert.alert('Erro', 'Não foi possível excluir a mensagem.');
          } finally {
            setIsWorking(false);
          }
        }
      }
    ]);
  }

  const headerActions = (
    <View style={styles.headerActions}>
      <IconButton
        iconName={note?.favorite ? 'star' : 'star-border'}
        accessibilityLabel={note?.favorite ? 'Desfavoritar' : 'Favoritar'}
        onPress={handleToggleFavorite}
        disabled={status !== 'ready' || !note || isWorking}
        color={note?.favorite ? theme.colors.primary : theme.colors.text}
      />
      <View style={styles.headerSpacer} />
      <IconButton
        iconName="content-copy"
        accessibilityLabel="Duplicar"
        onPress={handleDuplicate}
        disabled={status !== 'ready' || !note || isWorking}
      />
      <View style={styles.headerSpacer} />
      <IconButton
        iconName="picture-as-pdf"
        accessibilityLabel="Exportar PDF"
        onPress={handleExportPdf}
        disabled={status !== 'ready' || !note || isWorking}
        color={theme.colors.primary}
      />
      <View style={styles.headerSpacer} />
      <IconButton
        iconName="delete"
        accessibilityLabel="Excluir"
        onPress={handleDelete}
        disabled={status !== 'ready' || !note || isWorking}
        color={theme.colors.danger}
      />
      <View style={styles.headerSpacer} />
      <IconButton
        iconName="edit"
        accessibilityLabel="Editar"
        onPress={() => navigation.navigate('Edit', { id })}
        disabled={status !== 'ready' || isWorking}
      />
    </View>
  );

  return (
    <ScreenLayout
      title="Detalhes"
      scroll
      rightHeader={headerActions}
    >
      {status === 'loading' ? (
        <Card>
          <AppText variant="subtitle">Carregando...</AppText>
          <AppText color={theme.colors.mutedText} style={styles.paragraph}>
            ID: {id}
          </AppText>
        </Card>
      ) : status === 'not_found' ? (
        <Card>
          <AppText variant="subtitle">Mensagem não encontrada</AppText>
          <AppText color={theme.colors.mutedText} style={styles.paragraph}>
            ID: {id}
          </AppText>
        </Card>
      ) : note ? (
        <View>
          <LinearGradient
            colors={['#071A3A', '#0B2E6F', '#0D47A1'] as const}
            start={{ x: 0.05, y: 0.05 }}
            end={{ x: 0.95, y: 0.95 }}
            style={styles.hero}
          >
            <View pointerEvents="none" style={styles.heroOrb} />
            <AppText variant="overline" style={styles.heroKicker}>
              DETALHES DA MENSAGEM
            </AppText>
            <AppText variant="title" style={styles.heroTitle}>
              {note.sermonTitle}
            </AppText>
            <AppText style={styles.heroMeta} color="#EAF2FF">
              {note.preacherName} • {note.churchName}
            </AppText>
            <AppText style={styles.heroMeta} color="#EAF2FF">
              {note.sermonDate}
              {note.sermonTime ? ` • ${note.sermonTime}` : ''}
            </AppText>
            <AppText style={styles.heroVerse} color="#FFFFFF">
              <AppText variant="caption" color="#EAF2FF">
                Versículo base:{' '}
              </AppText>
              {note.mainVerse}
            </AppText>
            <AppText variant="caption" style={styles.heroId} color="#FFFFFFB3">
              ID: {note.id}
            </AppText>
          </LinearGradient>

          <View style={styles.section}>
            <Card>
            <AppText variant="subtitle">Versículos secundários</AppText>
            {note.secondaryVerses.length === 0 ? (
              <AppText color={theme.colors.mutedText} style={styles.paragraph}>
                Nenhum.
              </AppText>
            ) : (
              <View style={styles.list}>
                {note.secondaryVerses.map((v, idx) => (
                  <AppText key={`${note.id}-sv-${idx}`} style={idx === 0 ? styles.listItemFirst : styles.listItem}>
                    • {v}
                  </AppText>
                ))}
              </View>
            )}
            </Card>
          </View>

          <View style={styles.section}>
            <Card>
            <AppText variant="subtitle">Pontos principais</AppText>
            {note.keyPoints.length === 0 ? (
              <AppText color={theme.colors.mutedText} style={styles.paragraph}>
                Nenhum.
              </AppText>
            ) : (
              <View style={styles.list}>
                {note.keyPoints.map((p) => (
                  <View key={p.id} style={styles.point}>
                    <AppText variant="subtitle">{p.order}. {p.title || 'Sem título'}</AppText>
                    {p.content ? <AppText style={styles.paragraph}>{p.content}</AppText> : null}
                  </View>
                ))}
              </View>
            )}
            </Card>
          </View>

          <View style={styles.section}>
            <Card>
              <AppText variant="subtitle">Frases marcantes</AppText>
              {note.highlightedPhrases.length === 0 ? (
                <AppText color={theme.colors.mutedText} style={styles.paragraph}>
                  Nenhuma.
                </AppText>
              ) : (
                <View style={styles.list}>
                  {note.highlightedPhrases.map((p, idx) => (
                    <AppText key={`${note.id}-hp-${idx}`} style={idx === 0 ? styles.listItemFirst : styles.listItem}>
                      • {p}
                    </AppText>
                  ))}
                </View>
              )}
            </Card>
          </View>

          <View style={styles.section}>
            <Card>
            <AppText variant="subtitle">Anotações</AppText>
            {note.introduction ? (
              <View style={styles.block}>
                <AppText variant="caption" color={theme.colors.mutedText}>
                  Introdução
                </AppText>
                <AppText style={styles.paragraph}>{note.introduction}</AppText>
              </View>
            ) : null}
            {note.personalObservations ? (
              <View style={styles.block}>
                <AppText variant="caption" color={theme.colors.mutedText}>
                  Observações pessoais
                </AppText>
                <AppText style={styles.paragraph}>{note.personalObservations}</AppText>
              </View>
            ) : null}
            {note.practicalApplications ? (
              <View style={styles.block}>
                <AppText variant="caption" color={theme.colors.mutedText}>
                  Aplicações práticas
                </AppText>
                <AppText style={styles.paragraph}>{note.practicalApplications}</AppText>
              </View>
            ) : null}
            {note.conclusion ? (
              <View style={styles.block}>
                <AppText variant="caption" color={theme.colors.mutedText}>
                  Conclusão
                </AppText>
                <AppText style={styles.paragraph}>{note.conclusion}</AppText>
              </View>
            ) : null}
            </Card>
          </View>

          <View style={styles.section}>
            <Card>
            <AppText variant="subtitle">Resumo final</AppText>
            {note.finalSummary ? (
              <AppText style={styles.paragraph}>{note.finalSummary}</AppText>
            ) : (
              <AppText color={theme.colors.mutedText} style={styles.paragraph}>
                Em branco.
              </AppText>
            )}
            </Card>
          </View>
        </View>
      ) : null}

      <View style={styles.actions}>
        <AppButton label="Voltar" variant="ghost" onPress={() => navigation.goBack()} disabled={isWorking} />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  paragraph: { marginTop: theme.spacing.sm },
  section: { marginTop: theme.spacing.md },
  list: { marginTop: theme.spacing.sm },
  listItemFirst: { marginTop: 0 },
  listItem: { marginTop: theme.spacing.xs },
  point: { paddingVertical: theme.spacing.sm, borderTopWidth: 1, borderTopColor: theme.colors.border },
  block: { marginTop: theme.spacing.md },
  actions: { marginTop: theme.spacing.md },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  headerSpacer: { width: 4 },
  hero: {
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    overflow: 'hidden',
    ...theme.shadow.md
  },
  heroOrb: {
    position: 'absolute',
    right: -90,
    top: -120,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#FFFFFF10'
  },
  heroKicker: { color: '#FFFFFFB3' },
  heroTitle: { color: '#FFFFFF', marginTop: theme.spacing.sm },
  heroMeta: { marginTop: theme.spacing.sm },
  heroVerse: { marginTop: theme.spacing.md },
  heroId: { marginTop: theme.spacing.md }
});
