import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

import { initializeDatabase } from './src/database/migrations';
import { RootNavigator } from './src/navigation/RootNavigator';
import { navigationTheme } from './src/theme/navigationTheme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [ready, setReady] = React.useState(false);

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

  React.useEffect(() => {
    if (!ready) return;

    const minDurationMs = 2200;
    const startedAt = appStartedAt;
    const elapsed = Date.now() - startedAt;
    const remaining = Math.max(0, minDurationMs - elapsed);

    const handle = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, remaining);

    return () => clearTimeout(handle);
  }, [ready]);

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style="auto" />
      <RootNavigator />
    </NavigationContainer>
  );
}

const appStartedAt = Date.now();
