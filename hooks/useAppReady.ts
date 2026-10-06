import { useEffect, useState } from 'react';
import { useFonts } from '@expo-google-fonts/poppins';
import {
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

import { useAppStore } from '@/stores/appStore';

/** Waits for Poppins and the persisted store before the first paint. */
export function useAppReady(): boolean {
  const [fontsLoaded, fontError] = useFonts({
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const [hydrated, setHydrated] = useState(() => useAppStore.persist.hasHydrated());

  useEffect(() => {
    if (useAppStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    const unsubscribe = useAppStore.persist.onFinishHydration(() => setHydrated(true));
    return unsubscribe;
  }, []);

  return (fontsLoaded || Boolean(fontError)) && hydrated;
}
