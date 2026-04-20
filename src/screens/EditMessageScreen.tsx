import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Alert } from 'react-native';

import { AppText, Card, IconButton, ScreenLayout, SermonNoteForm } from '../components';
import type { HomeStackParamList } from '../navigation/RootNavigator';
import { sermonNoteRepository } from '../repositories/sermonNoteRepository';
import type { SermonNote } from '../types/sermon';
import type { SermonNoteFormValues } from '../components/SermonNoteForm';
import { theme } from '../theme/theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'Edit'>;

export function EditMessageScreen({ navigation, route }: Props) {
  const { id } = route.params;
  const [note, setNote] = React.useState<SermonNote | null>(null);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'not_found'>('loading');
  const [isSaving, setIsSaving] = React.useState(false);

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

  const initialValues = React.useMemo<SermonNoteFormValues | null>(() => {
    if (!note) return null;

    return {
      userName: note.userName,
      preacherName: note.preacherName,
      churchName: note.churchName,
      sermonDate: note.sermonDate,
      sermonTime: note.sermonTime ?? '',
      sermonTitle: note.sermonTitle,
      mainVerse: note.mainVerse,
      secondaryVerses: note.secondaryVerses.length > 0 ? note.secondaryVerses : [''],
      introduction: note.introduction ?? '',
      keyPoints:
        note.keyPoints.length > 0
          ? note.keyPoints
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((p) => ({ id: p.id, title: p.title, content: p.content }))
          : [{ id: createId(), title: '', content: '' }],
      highlightedPhrasesText: (note.highlightedPhrases ?? []).join('\n'),
      personalObservations: note.personalObservations ?? '',
      practicalApplications: note.practicalApplications ?? '',
      conclusion: note.conclusion ?? '',
      finalSummary: note.finalSummary ?? ''
    };
  }, [note]);

  async function handleSubmit(values: SermonNoteFormValues) {
    if (!note || isSaving) return;

    const updatedAt = new Date().toISOString();
    const trimmedSecondaryVerses = values.secondaryVerses.map((v) => v.trim()).filter((v) => v.length > 0);
    const trimmedHighlighted = splitLines(values.highlightedPhrasesText);
    const trimmedKeyPoints = values.keyPoints
      .map((p) => ({ ...p, title: p.title.trim(), content: p.content.trim() }))
      .filter((p) => p.title.length > 0 || p.content.length > 0);

    const updated: SermonNote = {
      ...note,
      userName: values.userName.trim(),
      preacherName: values.preacherName.trim(),
      churchName: values.churchName.trim(),
      sermonDate: values.sermonDate.trim(),
      sermonTime: values.sermonTime.trim() ? values.sermonTime.trim() : undefined,
      sermonTitle: values.sermonTitle.trim(),
      mainVerse: values.mainVerse.trim(),
      secondaryVerses: trimmedSecondaryVerses,
      introduction: values.introduction.trim() ? values.introduction.trim() : undefined,
      keyPoints: trimmedKeyPoints.map((p, index) => ({
        id: p.id,
        title: p.title,
        content: p.content,
        order: index + 1
      })),
      highlightedPhrases: trimmedHighlighted,
      personalObservations: values.personalObservations.trim() ? values.personalObservations.trim() : undefined,
      practicalApplications: values.practicalApplications.trim() ? values.practicalApplications.trim() : undefined,
      conclusion: values.conclusion.trim() ? values.conclusion.trim() : undefined,
      finalSummary: values.finalSummary.trim() ? values.finalSummary.trim() : undefined,
      updatedAt
    };

    try {
      setIsSaving(true);
      await sermonNoteRepository.update(updated);
      navigation.replace('Details', { id: updated.id });
    } catch {
      Alert.alert('Erro ao salvar', 'Não foi possível atualizar a mensagem localmente.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <ScreenLayout
      title="Editar"
      scroll
      rightHeader={
        <IconButton iconName="close" accessibilityLabel="Fechar" onPress={() => navigation.goBack()} />
      }
    >
      {status === 'loading' ? (
        <Card>
          <AppText variant="subtitle">Carregando...</AppText>
          <AppText color={theme.colors.mutedText} style={{ marginTop: theme.spacing.sm }}>
            Abrindo mensagem para edição.
          </AppText>
        </Card>
      ) : status === 'not_found' || !initialValues ? (
        <Card>
          <AppText variant="subtitle">Mensagem não encontrada</AppText>
          <AppText color={theme.colors.mutedText} style={{ marginTop: theme.spacing.sm }}>
            ID: {id}
          </AppText>
        </Card>
      ) : (
        <SermonNoteForm
          key={note?.id}
          mode="edit"
          initialValues={initialValues}
          isSubmitting={isSaving}
          submitLabel="Salvar alterações"
          onCancel={() => navigation.goBack()}
          onSubmit={handleSubmit}
        />
      )}
    </ScreenLayout>
  );
}

function createId(): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `${Date.now().toString(36)}${random}`;
}

function splitLines(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}
