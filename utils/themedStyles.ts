import { StyleSheet, type ImageStyle, type TextStyle, type ViewStyle } from 'react-native';

import { paletteVersion } from '@/constants/theme';

type Named = Record<string, ViewStyle | TextStyle | ImageStyle>;

/**
 * A themed replacement for `StyleSheet.create`.
 *
 * `StyleSheet.create` freezes the token values it is handed, which is exactly
 * why a module-level stylesheet can never follow a theme change. `createStyles`
 * takes a *factory* instead and rebuilds the sheet whenever the active palette
 * moves — the call sites keep reading `styles.card` exactly as before, so the
 * whole app became theme-aware without a second copy of every style.
 *
 * Usage:
 *
 *   const styles = createStyles(() => ({ card: { backgroundColor: colors.surface } }));
 */
export function createStyles<T extends Named>(factory: () => T): T {
  return createTokens(() => StyleSheet.create(factory()));
}

/**
 * The same lazy-rebuild trick for any token object — the type scale and the
 * layout borders use it so their colours follow the theme too.
 */
export function createTokens<T extends object>(factory: () => T): T {
  let builtVersion = -1;
  let built: T | null = null;

  const build = (): T => {
    if (built === null || builtVersion !== paletteVersion.current) {
      builtVersion = paletteVersion.current;
      built = factory();
    }
    return built;
  };

  return new Proxy({} as T, {
    get: (_target, property) => build()[property as keyof T],
    has: (_target, property) => property in build(),
    ownKeys: () => Reflect.ownKeys(build()),
    getOwnPropertyDescriptor: (_target, property) => ({
      configurable: true,
      enumerable: true,
      value: build()[property as keyof T],
    }),
  });
}
