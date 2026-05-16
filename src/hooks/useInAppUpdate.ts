import { useEffect } from 'react';
import { Alert } from 'react-native';
import InAppUpdates, {
  IAUUpdateKind,
  StatusUpdateEvent,
  IAUInstallStatus,
} from 'react-native-in-app-updates';

export function useInAppUpdate() {
  useEffect(() => {
    InAppUpdates.checkNeedsUpdate()
      .then((result) => {
        if (!result.shouldUpdate) return;

        InAppUpdates.addStatusUpdateListener(onStatusUpdate);
        InAppUpdates.startUpdate({ updateType: IAUUpdateKind.FLEXIBLE });
      })
      .catch(() => {
        // Silencia erros em builds de dev ou fora da Play Store
      });

    return () => {
      InAppUpdates.removeStatusUpdateListener(onStatusUpdate);
    };
  }, []);
}

function onStatusUpdate(event: StatusUpdateEvent) {
  if (event.status === IAUInstallStatus.DOWNLOADED) {
    Alert.alert(
      'Atualização disponível',
      'Uma nova versão foi baixada. Reinicie o app para aplicar.',
      [
        { text: 'Agora não', style: 'cancel' },
        {
          text: 'Reiniciar',
          onPress: () => InAppUpdates.installUpdate(),
        },
      ]
    );
  }
}
