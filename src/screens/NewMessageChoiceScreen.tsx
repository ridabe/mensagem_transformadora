import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppText, IconButton, ScreenLayout } from '../components';
import type { HomeStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<HomeStackParamList, 'NewMessageChoice'>;

export function NewMessageChoiceScreen({ navigation }: Props) {
  return (
    <ScreenLayout
      title="Anotar Pregação"
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
        Você pode começar uma mensagem do zero ou carregar os dados principais informados pelo pregador.
      </AppText>

      <View style={styles.actions}>
        <AppButton
          label="Criar do zero"
          iconName="note-add"
          onPress={() => navigation.navigate('NewMessage')}
        />
        <View style={styles.spacer} />
        <AppButton
          label="Carregar do código fornecido"
          iconName="download"
          variant="secondary"
          onPress={() => navigation.navigate('PreSermonCode')}
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
  actions: {
    gap: 12
  },
  spacer: {
    height: 12
  }
});
