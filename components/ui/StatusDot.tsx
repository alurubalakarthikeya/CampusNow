import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, toneColor, toneTint, type Tone } from '@/constants/colors';
import { type as typeScale } from '@/constants/typography';

type StatusDotProps = {
  tone?: Tone;
  size?: number;
  /** Draws a tinted halo — used for the current timeline step */
  halo?: boolean;
  haloSize?: number;
  style?: StyleProp<ViewStyle>;
};

export function StatusDot({ tone = 'primary', size = 8, halo = false, haloSize = 22, style }: StatusDotProps) {
  if (!halo) {
    return (
      <View
        style={[
          { width: size, height: size, borderRadius: size / 2, backgroundColor: toneColor[tone] },
          style,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.halo,
        {
          width: haloSize,
          height: haloSize,
          borderRadius: haloSize / 2,
          backgroundColor: toneTint[tone],
        },
        style,
      ]}
    >
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: toneColor[tone] }} />
    </View>
  );
}

type StatusLineProps = {
  label: string;
  tone?: Tone;
  /** Text after the label, quieter — e.g. a timestamp */
  meta?: string;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Dot + strong label + quiet metadata, used across the report feed. */
export function StatusLine({ label, tone = 'primary', meta, compact = false, style }: StatusLineProps) {
  return (
    <View style={[styles.line, style]}>
      <StatusDot tone={tone} size={compact ? 6 : 7} />
      <Text style={[typeScale.bodyStrong, { color: toneColor[tone] }]} numberOfLines={1}>
        {label}
      </Text>
      {meta ? (
        <Text style={[typeScale.meta, styles.meta]} numberOfLines={1}>
          {meta}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  halo: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  meta: {
    color: colors.muted,
  },
});
