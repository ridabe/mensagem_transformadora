import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Alert } from 'react-native';

import { IconButton, ScreenLayout, SermonNoteForm } from '../components';
import type { HomeStackParamList } from '../navigation/RootNavigator';
import { sermonNoteRepository } from '../repositories/sermonNoteRepository';
import type { SermonNote } from '../types/sermon';
import type { SermonNoteFormValues } from '../components/SermonNoteForm';

type Props = NativeStackScreenProps<HomeStackParamList, 'NewMessage'>;

export function NewMessageScreen({ navigation, route }: Props) {
  const [isSaving, setIsSaving] = React.useState(false);
  const preSermon = route.params?.preSermon;

  const initialValues = React.useMemo<SermonNoteFormValues>(() => {
    const now = new Date();
    return {
      userName: '',
      preacherName: preSermon?.leader?.name ?? '',
      churchName: preSermon?.church?.name ?? '',
      sermonDate: toDateOnly(now),
      sermonTime: '',
      sermonTitle: preSermon?.title ?? '',
      mainVerse: preSermon?.mainVerse ?? '',
      secondaryVerses: preSermon?.secondaryVerses && preSermon.secondaryVerses.length > 0 ? preSermon.secondaryVerses : [''],
      introduction: '',
      keyPoints: [{ id: createId(), title: '', content: '' }],
      highlightedPhrasesText: '',
      personalObservations: '',
      practicalApplications: '',
      conclusion: '',
      finalSummary: ''
    };
  }, [preSermon]);

  async function handleSubmit(values: SermonNoteFormValues) {
    if (isSaving) return;

    const createdAt = new Date().toISOString();
    const trimmedSecondaryVerses = values.secondaryVerses.map((v) => v.trim()).filter((v) => v.length > 0);
    const trimmedHighlighted = splitLines(values.highlightedPhrasesText);
    const trimmedKeyPoints = values.keyPoints
      .map((p) => ({ ...p, title: p.title.trim(), content: p.content.trim() }))
      .filter((p) => p.title.length > 0 || p.content.length > 0);

    const note: SermonNote = {
      id: createId(),
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
      preSermonCode: preSermon?.shareCode,
      favorite: false,
      createdAt,
      updatedAt: createdAt
    };

    try {
      setIsSaving(true);
      await sermonNoteRepository.create(note);
      navigation.replace('Details', { id: note.id });
    } catch {
      Alert.alert('Erro ao salvar', 'Não foi possível salvar a mensagem localmente.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <ScreenLayout
      title="Anotar Pregação"
      scroll
      rightHeader={
        <IconButton iconName="close" accessibilityLabel="Fechar" onPress={() => navigation.goBack()} />
      }
    >
      <SermonNoteForm
        mode="create"
        initialValues={initialValues}
        isSubmitting={isSaving}
        submitLabel="Salvar"
        onCancel={() => navigation.goBack()}
        onSubmit={handleSubmit}
      />
    </ScreenLayout>
  );
}

function createId(): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `${Date.now().toString(36)}${random}`;
}

function toDateOnly(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function splitLines(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}
