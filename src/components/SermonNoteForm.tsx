import React from 'react';
import { Alert, LayoutAnimation, Platform, Pressable, StyleSheet, TextInput, UIManager, View } from 'react-native';

import { theme } from '../theme/theme';
import { AppButton } from './AppButton';
import { AppText } from './AppText';
import { Card } from './Card';
import { IconButton } from './IconButton';

export type SermonNoteFormValues = {
  userName: string;
  preacherName: string;
  churchName: string;
  sermonDate: string;
  sermonTime: string;
  sermonTitle: string;
  mainVerse: string;
  secondaryVerses: string[];
  introduction: string;
  keyPoints: Array<{ id: string; title: string; content: string }>;
  highlightedPhrasesText: string;
  personalObservations: string;
  practicalApplications: string;
  conclusion: string;
  finalSummary: string;
};

export type SermonNoteFormProps = {
  mode: 'create' | 'edit';
  initialValues: SermonNoteFormValues;
  isSubmitting?: boolean;
  submitLabel?: string;
  onCancel: () => void;
  onSubmit: (values: SermonNoteFormValues) => Promise<void>;
};

export function SermonNoteForm({
  mode,
  initialValues,
  isSubmitting = false,
  submitLabel = 'Salvar',
  onCancel,
  onSubmit
}: SermonNoteFormProps) {
  React.useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const [userName, setUserName] = React.useState(initialValues.userName);
  const [preacherName, setPreacherName] = React.useState(initialValues.preacherName);
  const [churchName, setChurchName] = React.useState(initialValues.churchName);
  const [sermonDate, setSermonDate] = React.useState(initialValues.sermonDate);
  const [sermonTime, setSermonTime] = React.useState(initialValues.sermonTime);
  const [sermonTitle, setSermonTitle] = React.useState(initialValues.sermonTitle);
  const [mainVerse, setMainVerse] = React.useState(initialValues.mainVerse);
  const [secondaryVerses, setSecondaryVerses] = React.useState<string[]>(
    initialValues.secondaryVerses.length > 0 ? initialValues.secondaryVerses : ['']
  );
  const [introduction, setIntroduction] = React.useState(initialValues.introduction);
  const [keyPoints, setKeyPoints] = React.useState<Array<{ id: string; title: string; content: string }>>(
    initialValues.keyPoints.length > 0 ? initialValues.keyPoints : [{ id: createId(), title: '', content: '' }]
  );
  const [highlightedPhrasesText, setHighlightedPhrasesText] = React.useState(initialValues.highlightedPhrasesText);
  const [personalObservations, setPersonalObservations] = React.useState(initialValues.personalObservations);
  const [practicalApplications, setPracticalApplications] = React.useState(initialValues.practicalApplications);
  const [conclusion, setConclusion] = React.useState(initialValues.conclusion);
  const [finalSummary, setFinalSummary] = React.useState(initialValues.finalSummary);
  const placeholderTextColor = theme.colors.mutedText;

  function handleAddSecondaryVerse() {
    if (isSubmitting) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSecondaryVerses((prev) => [...prev, '']);
  }

  async function handleSubmit() {
    if (isSubmitting) return;

    const requiredErrors: string[] = [];
    if (!userName.trim()) requiredErrors.push('Nome do usuário');
    if (!preacherName.trim()) requiredErrors.push('Nome do pregador');
    if (!churchName.trim()) requiredErrors.push('Igreja');
    if (!sermonTitle.trim()) requiredErrors.push('Título da pregação');
    if (!mainVerse.trim()) requiredErrors.push('Versículo base');
    if (!sermonDate.trim()) requiredErrors.push('Data');

    if (requiredErrors.length > 0) {
      Alert.alert('Campos obrigatórios', `Preencha: ${requiredErrors.join(', ')}`);
      return;
    }

    const values: SermonNoteFormValues = {
      userName,
      preacherName,
      churchName,
      sermonDate,
      sermonTime,
      sermonTitle,
      mainVerse,
      secondaryVerses,
      introduction,
      keyPoints,
      highlightedPhrasesText,
      personalObservations,
      practicalApplications,
      conclusion,
      finalSummary
    };

    await onSubmit(values);
  }

  return (
    <View style={styles.stack}>
      <Card>
        <AppText variant="subtitle">Identificação</AppText>
        <View style={styles.field}>
          <AppText variant="overline" style={styles.label}>
            Nome do usuário *
          </AppText>
          <TextInput
            value={userName}
            onChangeText={setUserName}
            style={styles.input}
            placeholder="Ex.: Rida"
            placeholderTextColor={placeholderTextColor}
          />
        </View>
        <View style={styles.field}>
          <AppText variant="overline" style={styles.label}>
            Nome do pregador *
          </AppText>
          <TextInput
            value={preacherName}
            onChangeText={setPreacherName}
            style={styles.input}
            placeholder="Ex.: Pr. João"
            placeholderTextColor={placeholderTextColor}
          />
        </View>
        <View style={styles.field}>
          <AppText variant="overline" style={styles.label}>
            Igreja *
          </AppText>
          <TextInput
            value={churchName}
            onChangeText={setChurchName}
            style={styles.input}
            placeholder="Ex.: Igreja Batista Central"
            placeholderTextColor={placeholderTextColor}
          />
        </View>
      </Card>

      <Card>
        <AppText variant="subtitle">Dados da pregação</AppText>
        <View style={styles.row}>
          <View style={styles.rowItem}>
            <AppText variant="overline" style={styles.label}>
              Data {mode === 'create' ? '(automática)' : ''} *
            </AppText>
            <TextInput
              value={sermonDate}
              editable={mode !== 'create'}
              onChangeText={setSermonDate}
              style={[styles.input, mode === 'create' ? styles.inputDisabled : null]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={placeholderTextColor}
              autoCapitalize="none"
            />
          </View>
          <View style={styles.rowItem}>
            <AppText variant="overline" style={styles.label}>
              Horário (opcional)
            </AppText>
            <TextInput
              value={sermonTime}
              onChangeText={setSermonTime}
              style={styles.input}
              placeholder="HH:MM"
              placeholderTextColor={placeholderTextColor}
              autoCapitalize="none"
            />
          </View>
        </View>
        <View style={styles.field}>
          <AppText variant="overline" style={styles.label}>
            Título da pregação *
          </AppText>
          <TextInput
            value={sermonTitle}
            onChangeText={setSermonTitle}
            style={styles.input}
            placeholder="Ex.: A fé que transforma"
            placeholderTextColor={placeholderTextColor}
          />
        </View>
        <View style={styles.field}>
          <AppText variant="overline" style={styles.label}>
            Versículo base *
          </AppText>
          <TextInput
            value={mainVerse}
            onChangeText={setMainVerse}
            style={styles.input}
            placeholder="Ex.: João 3:16"
            placeholderTextColor={placeholderTextColor}
          />
        </View>

        <View style={styles.field}>
          <View style={styles.inlineHeader}>
            <AppText variant="overline" style={styles.label}>
              Versículos secundários
            </AppText>
            {secondaryVerses.length <= 1 ? (
              <Pressable
                onPress={handleAddSecondaryVerse}
                style={({ pressed }) => [styles.inlineAction, pressed ? styles.inlineActionPressed : null]}
                disabled={isSubmitting}
              >
                <AppText variant="caption" style={styles.inlineActionText}>
                  + Adicionar
                </AppText>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.dynamicStack}>
            {secondaryVerses.map((value, index) => (
              <View key={`verse-${index}`} style={styles.dynamicRow}>
                <TextInput
                  value={value}
                  onChangeText={(text) => setSecondaryVerses((prev) => prev.map((v, i) => (i === index ? text : v)))}
                  style={[styles.input, styles.dynamicInput]}
                  placeholder={`Versículo ${index + 1}`}
                  placeholderTextColor={placeholderTextColor}
                />
                <IconButton
                  iconName="delete"
                  accessibilityLabel="Remover versículo"
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setSecondaryVerses((prev) => (prev.length <= 1 ? [''] : prev.filter((_, i) => i !== index)));
                  }}
                  disabled={isSubmitting}
                />
              </View>
            ))}
            {secondaryVerses.length > 1 ? (
              <View style={styles.secondaryAddFooter}>
                <Pressable
                  onPress={handleAddSecondaryVerse}
                  style={({ pressed }) => [styles.inlineAction, pressed ? styles.inlineActionPressed : null]}
                  disabled={isSubmitting}
                >
                  <AppText variant="caption" style={styles.inlineActionText}>
                    + Adicionar
                  </AppText>
                </Pressable>
              </View>
            ) : null}
          </View>
        </View>
      </Card>

      <Card>
        <AppText variant="subtitle">Introdução</AppText>
        <View style={styles.field}>
          <AppText variant="overline" style={styles.label}>
            Texto (opcional)
          </AppText>
          <TextInput
            value={introduction}
            onChangeText={setIntroduction}
            style={[styles.input, styles.textarea]}
            placeholder="Escreva a introdução..."
            placeholderTextColor={placeholderTextColor}
            multiline
            textAlignVertical="top"
          />
        </View>
      </Card>

      <Card>
        <View style={styles.inlineHeader}>
          <AppText variant="subtitle">Pontos principais</AppText>
          <Pressable
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setKeyPoints((prev) => [...prev, { id: createId(), title: '', content: '' }]);
            }}
            style={({ pressed }) => [styles.inlineAction, pressed ? styles.inlineActionPressed : null]}
            disabled={isSubmitting}
          >
            <AppText variant="caption" style={styles.inlineActionText}>
              + Adicionar
            </AppText>
          </Pressable>
        </View>

        <View style={styles.dynamicStack}>
          {keyPoints.map((p, index) => (
            <View key={p.id} style={styles.pointBlock}>
              <View style={styles.pointHeader}>
                <AppText variant="overline" style={styles.label}>
                  Ponto {index + 1}
                </AppText>
                <IconButton
                  iconName="delete"
                  accessibilityLabel="Remover ponto"
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setKeyPoints((prev) => (prev.length <= 1 ? prev : prev.filter((x) => x.id !== p.id)));
                  }}
                  disabled={isSubmitting || keyPoints.length <= 1}
                />
              </View>
              <TextInput
                value={p.title}
                onChangeText={(text) => setKeyPoints((prev) => prev.map((x) => (x.id === p.id ? { ...x, title: text } : x)))}
                style={styles.input}
                placeholder="Título do ponto"
                placeholderTextColor={placeholderTextColor}
              />
              <TextInput
                value={p.content}
                onChangeText={(text) => setKeyPoints((prev) => prev.map((x) => (x.id === p.id ? { ...x, content: text } : x)))}
                style={[styles.input, styles.textarea]}
                placeholder="Conteúdo do ponto"
                placeholderTextColor={placeholderTextColor}
                multiline
                textAlignVertical="top"
              />
            </View>
          ))}
        </View>
      </Card>

      <Card>
        <AppText variant="subtitle">Frases marcantes</AppText>
        <View style={styles.field}>
          <AppText variant="overline" style={styles.label}>
            Uma frase por linha (opcional)
          </AppText>
          <TextInput
            value={highlightedPhrasesText}
            onChangeText={setHighlightedPhrasesText}
            style={[styles.input, styles.textarea]}
            placeholder="Escreva frases marcantes...\nEx.: “Deus age no secreto.”"
            placeholderTextColor={placeholderTextColor}
            multiline
            textAlignVertical="top"
          />
        </View>
      </Card>

      <Card>
        <AppText variant="subtitle">Anotações</AppText>
        <View style={styles.field}>
          <AppText variant="overline" style={styles.label}>
            Observações pessoais (opcional)
          </AppText>
          <TextInput
            value={personalObservations}
            onChangeText={setPersonalObservations}
            style={[styles.input, styles.textarea]}
            placeholder="Suas observações..."
            placeholderTextColor={placeholderTextColor}
            multiline
            textAlignVertical="top"
          />
        </View>
        <View style={styles.field}>
          <AppText variant="overline" style={styles.label}>
            Aplicações práticas (opcional)
          </AppText>
          <TextInput
            value={practicalApplications}
            onChangeText={setPracticalApplications}
            style={[styles.input, styles.textarea]}
            placeholder="Como aplicar isso no dia a dia..."
            placeholderTextColor={placeholderTextColor}
            multiline
            textAlignVertical="top"
          />
        </View>
        <View style={styles.field}>
          <AppText variant="overline" style={styles.label}>
            Conclusão (opcional)
          </AppText>
          <TextInput
            value={conclusion}
            onChangeText={setConclusion}
            style={[styles.input, styles.textarea]}
            placeholder="Escreva a conclusão..."
            placeholderTextColor={placeholderTextColor}
            multiline
            textAlignVertical="top"
          />
        </View>
      </Card>

      <Card>
        <AppText variant="subtitle">Resumo final</AppText>
        <View style={styles.field}>
          <AppText variant="overline" style={styles.label}>
            Opcional (pode ser gerado no Módulo 6)
          </AppText>
          <TextInput
            value={finalSummary}
            onChangeText={setFinalSummary}
            style={[styles.input, styles.textarea]}
            placeholder="Resumo final..."
            placeholderTextColor={placeholderTextColor}
            multiline
            textAlignVertical="top"
          />
        </View>
      </Card>

      <View style={styles.actions}>
        <AppButton label={submitLabel} onPress={handleSubmit} loading={isSubmitting} />
        <View style={styles.spacer} />
        <AppButton label="Cancelar" variant="ghost" onPress={onCancel} disabled={isSubmitting} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: theme.spacing.md },
  field: { marginTop: theme.spacing.md },
  label: { color: theme.colors.mutedText, marginBottom: theme.spacing.xs },
  input: {
    borderWidth: 1,
    borderColor: '#00000014',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    color: theme.colors.text
  },
  inputDisabled: { opacity: 0.7 },
  textarea: { minHeight: 130, paddingTop: 12 },
  row: { flexDirection: 'row', gap: theme.spacing.md },
  rowItem: { flex: 1 },
  inlineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  inlineAction: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface
  },
  inlineActionPressed: { backgroundColor: '#00000008' },
  inlineActionText: { color: theme.colors.text },
  dynamicStack: { marginTop: theme.spacing.sm, gap: theme.spacing.sm },
  dynamicRow: { flexDirection: 'row', alignItems: 'center' },
  dynamicInput: { flex: 1, marginRight: theme.spacing.sm },
  secondaryAddFooter: { flexDirection: 'row', justifyContent: 'flex-start' },
  pointBlock: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface
  },
  pointHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm
  },
  actions: { marginTop: theme.spacing.sm },
  spacer: { height: theme.spacing.sm }
});

function createId(): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `${Date.now().toString(36)}${random}`;
}

