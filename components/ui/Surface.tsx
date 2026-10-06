import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@/constants/colors';
import { corners, layout, shadows, type CornerKey } from '@/constants/layout';
import { PressableScale } from './PressableScale';

type SurfaceTone = 'surface' | 'muted' | 'sunken' | 'ink' | 'primary' | 'transparent';
type ShadowKey = keyof typeof shadows;

const toneBackground: Record<SurfaceTone, string> = {
  surface: colors.surface,
  muted: colors.surfaceMuted,
  sunken: colors.surfaceSunken,
  ink: colors.ink,
  primary: colors.primary,
  transparent: 'transparent',
};

export type SurfaceProps = {
  children?: ReactNode;
  /** Radius token — every surface is rounded equally on all four sides */
  corner?: CornerKey;
  tone?: SurfaceTone;
  /** true for the default card padding, or an explicit number */
  padding?: boolean | number;
  /** Default on: the grey border is what separates surfaces in this app */
  bordered?: boolean;
  borderColor?: string;
  /** Kept for API stability — every shadow token is now empty */
  elevation?: ShadowKey | 'none';
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  scaleTo?: number;
  accessibilityLabel?: string;
};

/** Solid surface. Used for content that must stay crisp and readable. */
export function Surface({
  children,
  corner = 'block',
  tone = 'surface',
  padding = false,
  bordered = true,
  borderColor,
  elevation = 'none',
  style,
  onPress,
  scaleTo,
  accessibilityLabel,
}: SurfaceProps) {
  const base: ViewStyle = {
    ...corners[corner],
    backgroundColor: toneBackground[tone],
    ...(padding ? { padding: padding === true ? layout.cardPadding : padding } : null),
    ...(bordered ? { borderWidth: 1, borderColor: borderColor ?? colors.line } : null),
    ...(elevation === 'none' ? null : shadows[elevation]),
  };

  if (onPress) {
    return (
      <PressableScale
        onPress={onPress}
        style={[base, style]}
        scaleTo={scaleTo}
        accessibilityLabel={accessibilityLabel}
      >
        {children}
      </PressableScale>
    );
  }

  return <View style={[base, style]}>{children}</View>;
}
