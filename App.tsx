import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

import { PremiumSplashOverlay } from './src/components/PremiumSplashOverlay';
import { initializeDatabase } from './src/database/migrations';
import { RootNavigator } from './src/navigation/RootNavigator';
import { navigationTheme } from './src/theme/navigationTheme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [ready, setReady] = React.useState(false);
  const [showPremiumSplash, setShowPremiumSplash] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;

    initializeDatabase()
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch((error) => {
        console.error('Falha ao inicializar o banco local:', error);
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleRequestHideNativeSplash = React.useCallback(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style={showPremiumSplash ? 'light' : 'auto'} />
      {ready ? <RootNavigator /> : null}
      <PremiumSplashOverlay
        visible={showPremiumSplash}
        durationMs={2400}
        canFinish={ready}
        onRequestHideNativeSplash={handleRequestHideNativeSplash}
        onFinished={() => setShowPremiumSplash(false)}
      />
    </NavigationContainer>
  );
}

