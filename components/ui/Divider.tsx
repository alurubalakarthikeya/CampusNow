import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@/constants/colors';

type DividerProps = {
  /** Extra vertical breathing room around the rule */
  spacing?: number;
  inset?: number;
  strong?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** A one-pixel rule. Replaces most cards in the editorial layouts. */
export function Divider({ spacing = 0, inset = 0, strong = false, style }: DividerProps) {
  return (
    <View
      style={[
        styles.line,
        {
          backgroundColor: strong ? colors.lineStrong : colors.line,
          marginVertical: spacing,
          marginHorizontal: inset,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  line: {
    height: 1,
    // `alignSelf: stretch` (not `width: '100%'`) so a horizontal inset is
    // subtracted from the width instead of overflowing the parent.
    alignSelf: 'stretch',
  },
});
