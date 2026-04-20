import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

import { initializeDatabase } from './src/database/migrations';
import { RootNavigator } from './src/navigation/RootNavigator';
import { navigationTheme } from './src/theme/navigationTheme';

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

  if (!ready) {
    return (
      <NavigationContainer theme={navigationTheme}>
        <StatusBar style="dark" />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style="dark" />
      <RootNavigator />
    </NavigationContainer>
  );
}
