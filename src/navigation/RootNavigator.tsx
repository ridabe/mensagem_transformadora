import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';

import { DashboardScreen } from '../screens/DashboardScreen';
import { EditMessageScreen } from '../screens/EditMessageScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { GuideScreen } from '../screens/GuideScreen';
import { MessageDetailsScreen } from '../screens/MessageDetailsScreen';
import { NewMessageScreen } from '../screens/NewMessageScreen';
import { StartScreen } from '../screens/StartScreen';
import { AboutScreen } from '../screens/AboutScreen';
import { theme } from '../theme/theme';

export type HomeStackParamList = {
  Home: undefined;
  History: undefined;
  NewMessage: undefined;
  Details: { id: string };
  Edit: { id: string };
  About: undefined;
};

export type RootTabParamList = {
  HomeStack: undefined;
  Guide: undefined;
  Dashboard: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      <HomeStack.Screen name="Home" component={StartScreen} />
      <HomeStack.Screen name="History" component={HomeScreen} />
      <HomeStack.Screen name="NewMessage" component={NewMessageScreen} />
      <HomeStack.Screen name="Details" component={MessageDetailsScreen} />
      <HomeStack.Screen name="Edit" component={EditMessageScreen} />
      <HomeStack.Screen name="About" component={AboutScreen} />
    </HomeStack.Navigator>
  );
}

export function RootNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.mutedText,
        tabBarStyle: { borderTopColor: theme.colors.border }
      }}
    >
      <Tab.Screen
        name="HomeStack"
        component={HomeStackNavigator}
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="home" color={color} size={size} />
        }}
      />
      <Tab.Screen
        name="Guide"
        component={GuideScreen}
        options={{
          title: 'Guia',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="menu-book" color={color} size={size} />
        }}
      />
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="insights" color={color} size={size} />
        }}
      />
    </Tab.Navigator>
  );
}
