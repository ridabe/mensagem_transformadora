import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

import { DonationModal } from './src/components';
import { PremiumSplashOverlay } from './src/components/PremiumSplashOverlay';
import { initializeDatabase } from './src/database/migrations';
import { useDonationGate } from './src/hooks/useDonationGate';
import { RootNavigator } from './src/navigation/RootNavigator';
import { reviewService } from './src/services/review/reviewService';
import { navigationTheme } from './src/theme/navigationTheme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [ready, setReady] = React.useState(false);
  const [showPremiumSplash, setShowPremiumSplash] = React.useState(true);
  const readyRef = React.useRef(false);
  const { shouldShowDonation, closeDonation, declineDonation, markAsPaid } = useDonationGate();

  React.useEffect(() => {
    reviewService.registerFirstAppOpen().catch(() => {});
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    const timeoutMs = 9000;

    const timeoutHandle = setTimeout(() => {
      if (cancelled) return;
      if (readyRef.current) return;
      console.error('Timeout ao inicializar o banco local. Continuando a abertura do app.');
      readyRef.current = true;
      setReady(true);
    }, timeoutMs);

    initializeDatabase()
      .then(() => {
        if (cancelled) return;
        clearTimeout(timeoutHandle);
        readyRef.current = true;
        setReady(true);
      })
      .catch((error) => {
        console.error('Falha ao inicializar o banco local:', error);
        if (cancelled) return;
        clearTimeout(timeoutHandle);
        readyRef.current = true;
        setReady(true);
      });

    return () => {
      cancelled = true;
      clearTimeout(timeoutHandle);
    };
  }, []);

  const handleRequestHideNativeSplash = React.useCallback(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style={showPremiumSplash ? 'light' : 'auto'} />
      {ready ? <RootNavigator /> : null}
      <DonationModal
        visible={ready && !showPremiumSplash && shouldShowDonation}
        onClose={closeDonation}
        onDecline={() => {
          declineDonation().catch(() => {});
        }}
        onPaid={(amountInCents) => {
          markAsPaid(amountInCents).catch(() => {});
        }}
      />
      <PremiumSplashOverlay
        visible={showPremiumSplash}
        durationMs={3000}
        canFinish
        onRequestHideNativeSplash={handleRequestHideNativeSplash}
        onFinished={() => setShowPremiumSplash(false)}
      />
    </NavigationContainer>
  );
}

