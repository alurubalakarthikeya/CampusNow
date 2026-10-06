import { useEffect } from 'react';
import { Stack } from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from '@/constants/colors';
import { useAppReady } from '@/hooks/useAppReady';
import { useLiveTracking } from '@/hooks/useLiveTracking';
import { configureNotifications } from '@/utils/notify';
import { installWebBaseStyles } from '@/utils/webStyles';

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const ready = useAppReady();

  // Keeps every report filed on this device moving through its lifecycle.
  useLiveTracking();

  useEffect(() => {
    configureNotifications();
    // On the web the browser draws its own focus ring over our fields.
    installWebBaseStyles();
  }, []);

  useEffect(() => {
    if (ready) {
      void SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [ready]);

  // Poppins and the persisted store must be ready before the first paint so
  // no screen ever renders with a fallback font.
  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="notifications" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="report/location" />
        <Stack.Screen name="report/duplicate" options={{ animation: 'fade' }} />
        <Stack.Screen name="report/review" />
        <Stack.Screen name="report/details" />
        <Stack.Screen name="report/scan" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="campus/map" />
        <Stack.Screen name="campus/service" />
        <Stack.Screen name="profile/edit" />
        <Stack.Screen name="profile/notifications" />
        <Stack.Screen name="profile/campus" />
        <Stack.Screen name="profile/help" />
      </Stack>
    </SafeAreaProvider>
  );
}
