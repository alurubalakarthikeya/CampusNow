import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@/constants/colors';
import { corners } from '@/constants/layout';
import { type as typeScale } from '@/constants/typography';
import type { Tone } from '@/constants/colors';
import { toneColor } from '@/constants/colors';
import { PressableScale } from './PressableScale';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  icon?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

const HEIGHT = 52;

/** The one strong action on a screen. */
export function PrimaryButton({
  label,
  onPress,
  icon,
  disabled = false,
  loading = false,
  style,
  accessibilityLabel,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <PressableScale
      onPress={onPress}
      disabled={isDisabled}
      accessibilityLabel={accessibilityLabel ?? label}
      style={[
        styles.base,
        corners.button,
        { backgroundColor: colors.primary, opacity: isDisabled ? 0.5 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text style={[typeScale.bodyStrong, styles.primaryLabel]}>{label}</Text>
        </View>
      )}
    </PressableScale>
  );
}

/** Supporting action — a white control with the same single grey border. */
export function SecondaryButton({
  label,
  onPress,
  icon,
  disabled = false,
  style,
  accessibilityLabel,
}: ButtonProps) {
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel ?? label}
      style={[styles.base, styles.outlined, corners.button, { opacity: disabled ? 0.5 : 1 }, style]}
    >
      <View style={styles.content}>
        {icon}
        <Text style={[typeScale.bodyStrong, { color: colors.ink }]}>{label}</Text>
      </View>
    </PressableScale>
  );
}

type TextButtonProps = {
  label: string;
  onPress?: () => void;
  /** 'muted' is the default quiet treatment */
  tone?: Tone | 'muted' | 'ink';
  align?: 'left' | 'center' | 'right';
  style?: StyleProp<ViewStyle>;
};

/** Lowest emphasis: a line of text that acts. */
export function TextButton({ label, onPress, tone = 'muted', align = 'center', style }: TextButtonProps) {
  const color = tone === 'muted' ? colors.muted : tone === 'ink' ? colors.ink : toneColor[tone];

  return (
    <PressableScale
      onPress={onPress}
      accessibilityLabel={label}
      scaleTo={0.97}
      style={[
        styles.textButton,
        { alignSelf: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center' },
        style,
      ]}
    >
      <Text style={[typeScale.bodyStrong, { color }]}>{label}</Text>
    </PressableScale>
  );
}

type ChipProps = {
  label: string;
  icon?: ReactNode;
  active?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * A small bordered selector. White with a 1px grey edge, exactly like the
 * filter rows in the reference: only the active one picks up the accent.
 */
export function Chip({ label, icon, active = false, onPress, style }: ChipProps) {
  return (
    <PressableScale
      onPress={onPress}
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      scaleTo={0.96}
      style={[
        styles.chip,
        {
          backgroundColor: active ? colors.primaryTint : colors.surface,
          borderColor: active ? colors.primaryTintStrong : colors.line,
        },
        style,
      ]}
    >
      {icon}
      <Text
        style={[
          typeScale.bodyStrong,
          { fontSize: 14, color: active ? colors.primary : colors.inkSoft },
        ]}
      >
        {label}
      </Text>
    </PressableScale>
  );
}

/** Wraps chips onto as many lines as they need. */
export function ChipWrap({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.chipWrap, style]}>{children}</View>;
}

/** Kept as the report filters' name for the same control. */
export function ChipButton(props: ChipProps) {
  return <Chip {...props} />;
}

const styles = StyleSheet.create({
  base: {
    height: HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  outlined: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  primaryLabel: {
    color: colors.white,
    fontSize: 16,
  },
  textButton: {
    paddingVertical: 12,
    paddingHorizontal: 6,
  },
  chip: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 13,
    borderRadius: corners.chip.borderRadius,
    borderWidth: 1,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
