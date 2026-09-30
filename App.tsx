import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts as useNunito,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from '@expo-google-fonts/nunito';
import {
  useFonts as useInter,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { AuthProvider } from './src/context/AuthContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import Toast from 'react-native-toast-message';
import { customToastConfig } from './src/components/ToastConfig';
import { OtaUpdateBanner } from './src/components/OtaUpdateBanner';
import { useOtaUpdate } from './src/hooks/useOtaUpdate';

SplashScreen.preventAutoHideAsync().catch(() => {});

function AppContent() {
  const ota = useOtaUpdate();

  return (
    <>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
      <OtaUpdateBanner
        status={ota.status}
        errorMessage={ota.errorMessage}
        onUpdate={ota.applyUpdate}
        onDismiss={ota.dismiss}
      />
      <Toast config={customToastConfig} />
    </>
  );
}

export default function App() {
  const [nunitoLoaded] = useNunito({ Nunito_700Bold, Nunito_800ExtraBold, Nunito_900Black });
  const [interLoaded] = useInter({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });

  const fontsReady = nunitoLoaded && interLoaded;

  useEffect(() => {
    if (fontsReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsReady]);

  if (!fontsReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
