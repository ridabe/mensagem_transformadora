import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Keyboard, StyleSheet, TextInput, View } from 'react-native';

import { AppButton, AppText, IconButton, ScreenLayout } from '../components';
import type { HomeStackParamList } from '../navigation/RootNavigator';
import { PreSermonError, getPreSermonByCode } from '../services/preSermonService';

type Props = NativeStackScreenProps<HomeStackParamList, 'PreSermonCode'>;

export function PreSermonCodeScreen({ navigation }: Props) {
  const [code, setCode] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  function formatCodeInput(value: string): string {
    const cleaned = value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 7);

    if (cleaned.length <= 2) {
      return cleaned;
    }

    return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
  }

  function handleChangeText(value: string) {
    setErrorMessage(null);
    setCode(formatCodeInput(value));
  }

  async function handleLoadFromCode() {
    setErrorMessage(null);
    Keyboard.dismiss();

    try {
      setIsLoading(true);
      const preSermon = await getPreSermonByCode(code);
      navigation.replace('NewMessage', { preSermon });
    } catch (error) {
      if (error instanceof PreSermonError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Não foi possível carregar a mensagem agora. Tente novamente em instantes.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ScreenLayout
      title="Carregar do código fornecido"
      scroll
      rightHeader={
        <IconButton
          iconName="close"
          accessibilityLabel="Fechar"
          onPress={() => navigation.goBack()}
        />
      }
    >
      <AppText style={styles.description} color="#666">
        Digite o código informado pelo pregador para preencher automaticamente os dados principais.
      </AppText>

      <View style={styles.field}>
        <AppText variant="overline" style={styles.label}>
          Código do pré-sermão
        </AppText>
        <TextInput
          value={code}
          onChangeText={handleChangeText}
          style={styles.input}
          placeholder="Digite o código. Ex: MT-K8F3Q"
          placeholderTextColor="#999"
          keyboardType="default"
          autoCapitalize="characters"
          returnKeyType="done"
          onSubmitEditing={handleLoadFromCode}
          maxLength={8}
        />
        {errorMessage ? <AppText style={styles.error}>{errorMessage}</AppText> : null}
      </View>

      <View style={styles.actions}>
        <AppButton
          label="Carregar do código fornecido"
          onPress={handleLoadFromCode}
          loading={isLoading}
          disabled={isLoading || code.length < 8}
        />
        <View style={styles.spacer} />
        <AppButton
          label="Voltar"
          variant="ghost"
          onPress={() => navigation.goBack()}
          disabled={isLoading}
        />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  description: {
    marginBottom: 24,
    lineHeight: 22
  },
  field: { marginBottom: 24 },
  label: { color: '#666', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#00000014',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#000'
  },
  error: {
    marginTop: 8,
    color: '#B00020'
  },
  actions: {
    gap: 12
  },
  spacer: {
    height: 12
  }
});
