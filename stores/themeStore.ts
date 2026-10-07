import { useEffect } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { applyPalette, type ThemeMode, type ThemeScheme } from '@/constants/theme';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

function resolve(mode: ThemeMode): ThemeScheme {
  if (mode === 'system') {
    return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
  }
  return mode;
}

/**
 * Paints the palette *before* anything re-renders, so a mode change never
 * flashes the old colours, and mirrors the choice into the OS so native
 * chrome (keyboard, alerts, scroll indicators) matches the app.
 */
function paint(mode: ThemeMode): void {
  const next = resolve(mode);
  applyPalette(next);
  try {
    // `unspecified` hands the choice back to the OS when following system.
    Appearance.setColorScheme(mode === 'system' ? 'unspecified' : mode);
  } catch {
    // Older runtimes have no override — the app still themes itself.
  }
}

// Follow the device until the stored choice hydrates.
paint('system');

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'system',
      setMode: (mode) => {
        paint(mode);
        set({ mode });
      },
    }),
    {
      name: 'campusnow/theme-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ mode: state.mode }),
      onRehydrateStorage: () => (state) => {
        paint(state?.mode ?? 'system');
      },
    },
  ),
);

export type Theme = {
  mode: ThemeMode;
  scheme: ThemeScheme;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
};

/**
 * Read the active theme. Subscribing here is also what re-renders a screen
 * when the palette changes: stylesheet proxies rebuild on access, and this
 * hook is what makes the access happen again.
 */
export function useTheme(): Theme {
  const mode = useThemeStore((state) => state.mode);
  const system = useColorScheme();
  const scheme: ThemeScheme = mode === 'system' ? (system === 'dark' ? 'dark' : 'light') : mode;

  useEffect(() => {
    // The device flipped while we were following it.
    if (mode === 'system') paint('system');
  }, [mode, system]);

  return {
    mode,
    scheme,
    isDark: scheme === 'dark',
    setMode: useThemeStore.getState().setMode,
  };
}

/** Waits for the stored theme choice before the first paint. */
export function themeHydrated(): boolean {
  return useThemeStore.persist.hasHydrated();
}
