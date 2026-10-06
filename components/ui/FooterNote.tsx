import type { ReactNode } from 'react';
import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';

import { colors } from '@/constants/colors';

/**
 * The quiet line of housekeeping copy that closes a page — centred, small and
 * grey, the same voice as the footer of a well-kept settings screen.
 */
export function FooterNote({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.note, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  note: {
    fontSize: 12.5,
    lineHeight: 18,
    textAlign: 'center',
    color: colors.faint,
  },
});
