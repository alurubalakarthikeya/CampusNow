import type { ReactNode } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

import { colors } from '@/constants/colors';
import { corners, layout, shadows, type CornerKey } from '@/constants/layout';
import { PressableScale } from './PressableScale';

export type GlassSurfaceProps = {
  children?: ReactNode;
  corner?: CornerKey;
  /** Blur strength, 1 – 100 */
  intensity?: number;
  /** Additional white wash so content on glass stays readable */
  wash?: number;
  padding?: boolean | number;
  bordered?: boolean;
  /** Kept for API stability — every shadow token is now empty */
  elevation?: keyof typeof shadows | 'none';
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  accessibilityLabel?: string;
};

/**
 * Glass is used sparingly: the floating dock, the home report surface,
 * status panels and selected location controls. Everything else stays
 * solid so the interface remains calm.
 */
export function GlassSurface({
  children,
  corner = 'leaf',
  intensity = 38,
  wash = 0.5,
  padding = false,
  bordered = true,
  elevation = 'none',
  style,
  onPress,
  accessibilityLabel,
}: GlassSurfaceProps) {
  const frame = (
    <View style={[corners[corner], elevation === 'none' ? null : shadows[elevation], style]}>
      <View
        style={[
          corners[corner],
          {
            overflow: 'hidden',
            borderWidth: bordered ? 1 : 0,
            borderColor: colors.glassBorder,
          },
        ]}
      >
        <BlurView
          intensity={intensity}
          tint="light"
          blurMethod={Platform.OS === 'android' ? 'dimezisBlurViewSdk31Plus' : undefined}
          style={StyleSheet.absoluteFill}
        />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: `rgba(255,255,255,${wash})` }]} />
        <View style={padding ? { padding: padding === true ? layout.cardPadding : padding } : undefined}>
          {children}
        </View>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <PressableScale onPress={onPress} accessibilityLabel={accessibilityLabel}>
        {frame}
      </PressableScale>
    );
  }

  return frame;
}
