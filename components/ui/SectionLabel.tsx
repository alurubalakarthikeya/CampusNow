import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { colors } from '@/constants/colors';
import { type as typeScale } from '@/constants/typography';

type SectionLabelProps = {
  children: ReactNode;
  /** Rendered opposite the label — a count, a link, a status */
  trailing?: ReactNode;
  tone?: 'muted' | 'ink' | 'primary';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

/**
 * The heading of a group of rows. It is set in ink at 15.5px semibold so it
 * always outranks the rows it introduces — a section heading must never be
 * smaller than its own content.
 */
export function SectionLabel({ children, trailing, tone = 'ink', style, textStyle }: SectionLabelProps) {
  const color = tone === 'ink' ? colors.ink : tone === 'primary' ? colors.primary : colors.muted;
  return (
    <View style={[styles.row, style]}>
      <Text style={[typeScale.section, { color }, textStyle]}>{children}</Text>
      {trailing ? <View>{trailing}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
