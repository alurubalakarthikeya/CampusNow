import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@/constants/colors';
import { type as typeScale } from '@/constants/typography';

type MetricSize = 'hero' | 'large' | 'default' | 'small';

const valueStyle = {
  hero: typeScale.metricHero,
  large: typeScale.metricLarge,
  default: typeScale.metric,
  small: { ...typeScale.title, fontSize: 22, lineHeight: 26 },
} as const;

type MetricProps = {
  value: string | number;
  label?: string;
  size?: MetricSize;
  /** Unit rendered at label size next to the number, e.g. % or min */
  unit?: string;
  valueColor?: string;
  align?: 'left' | 'center' | 'right';
  style?: StyleProp<ViewStyle>;
};

/**
 * The large numerical statements the design leans on: 91%, 47, 14.
 * Numbers are typography, not decoration.
 */
export function Metric({
  value,
  label,
  size = 'default',
  unit,
  valueColor = colors.ink,
  align = 'left',
  style,
}: MetricProps) {
  const alignment: ViewStyle = {
    alignItems: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
  };

  return (
    <View style={[alignment, style]}>
      <View style={styles.valueRow}>
        <Text
          style={[valueStyle[size], { color: valueColor }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.6}
        >
          {value}
        </Text>
        {unit ? <Text style={[typeScale.title, styles.unit]}>{unit}</Text> : null}
      </View>
      {label ? (
        <Text style={[typeScale.meta, align === 'right' ? styles.labelRight : null]} numberOfLines={2}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  unit: {
    marginBottom: 6,
    color: colors.ink,
  },
  labelRight: {
    textAlign: 'right',
  },
});
