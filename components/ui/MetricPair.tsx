import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@/constants/colors';
import { Metric } from './Metric';

export type MetricPairItem = {
  value: string | number;
  label: string;
  unit?: string;
  valueColor?: string;
};

type MetricPairProps = {
  left: MetricPairItem;
  right: MetricPairItem;
  /** The left block is slightly wider — asymmetric but on one grid */
  style?: StyleProp<ViewStyle>;
};

/**
 * Two numbers side by side, separated by a hairline rule instead of boxes.
 * Used for "47 students affected / 30 min expected update" and the profile
 * statistics.
 */
export function MetricPair({ left, right, style }: MetricPairProps) {
  return (
    <View style={[styles.row, style]}>
      <View style={styles.left}>
        <Metric
          value={left.value}
          label={left.label}
          unit={left.unit}
          valueColor={left.valueColor}
          size="large"
        />
      </View>
      <View style={styles.rule} />
      <View style={styles.right}>
        <Metric
          value={right.value}
          label={right.label}
          unit={right.unit}
          valueColor={right.valueColor}
          size="large"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  left: {
    flex: 1.15,
  },
  right: {
    flex: 1,
  },
  rule: {
    width: 1,
    backgroundColor: colors.line,
    marginHorizontal: 16,
  },
});
