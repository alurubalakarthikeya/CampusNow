import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { type as typeScale } from '@/constants/typography';

type EmptyStateProps = {
  title: string;
  message?: string;
  /** Optional quiet action under the copy */
  action?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Empty states are typographic. No illustrations, no giant graphics —
 * whitespace and two lines of copy.
 */
export function EmptyState({ title, message, action, style }: EmptyStateProps) {
  return (
    <View style={[styles.wrap, style]}>
      <Text style={typeScale.heading}>{title}</Text>
      {message ? <Text style={[typeScale.bodyLarge, styles.message]}>{message}</Text> : null}
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: spacing.xxxl,
    gap: spacing.sm,
  },
  message: {
    color: colors.muted,
    maxWidth: 320,
  },
  action: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
  },
});
