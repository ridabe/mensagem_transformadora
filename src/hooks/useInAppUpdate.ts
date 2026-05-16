import Constants from 'expo-constants';
import { useEffect, useRef } from 'react';
import { Alert, Linking } from 'react-native';

const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.algoritmum.msgt';

export function useInAppUpdate() {
  const checked = useRef(false);

  useEffect(() => {
    if (checked.current) return;
    checked.current = true;

    checkForUpdate().catch(() => {});
  }, []);
}

async function checkForUpdate() {
  const currentCode = Constants.expoConfig?.android?.versionCode;
  if (!currentCode) return;

  const baseUrl = process.env.EXPO_PUBLIC_WEB_API_URL;
  if (!baseUrl) return;

  const response = await fetch(`${baseUrl}/api/app-version`, {
    headers: { 'Cache-Control': 'no-cache' },
  });
  if (!response.ok) return;

  const { versionCode } = (await response.json()) as { versionCode: number };
  if (versionCode > currentCode) {
    Alert.alert(
      'Nova versão disponível',
      'Há uma atualização do Mensagem Transformadora na Play Store. Deseja atualizar agora?',
      [
        { text: 'Agora não', style: 'cancel' },
        {
          text: 'Atualizar',
          onPress: () => Linking.openURL(PLAY_STORE_URL),
        },
      ]
    );
  }
}
