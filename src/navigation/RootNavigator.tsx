import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';
import { MainTabs } from './MainTabs';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import AddChildScreen from '../screens/auth/AddChildScreen';
import PremiumScreen from '../screens/profile/PremiumScreen';
import ChildProgressScreen from '../screens/home/ChildProgressScreen';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  const { isLoading, isAuthenticated, hasSeenOnboarding, authEntryScreen } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cream }}>
        <ActivityIndicator color={colors.teal} size="large" />
      </View>
    );
  }

  // Onboarding → auth → main are mutually exclusive phases. Each phase
  // mounts a fresh Stack.Navigator (keyed by phase) so `initialRouteName`
  // is re-evaluated on every transition instead of only on first mount —
  // otherwise a stale navigator can be asked to navigate to a route it
  // never registered (e.g. "Login" while still on the Onboarding-only tree).
  if (!hasSeenOnboarding) {
    return (
      <Stack.Navigator key="onboarding" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      </Stack.Navigator>
    );
  }

  if (!isAuthenticated) {
    return (
      <Stack.Navigator
        key={`auth-${authEntryScreen}`}
        initialRouteName={authEntryScreen}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator key="main" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="AddChild" component={AddChildScreen} />
      <Stack.Screen name="ChildProgress" component={ChildProgressScreen} />
      <Stack.Screen name="Premium" component={PremiumScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}
