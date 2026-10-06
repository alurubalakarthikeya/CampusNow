import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@/constants/colors';
import { corners } from '@/constants/layout';
import { type as typeScale } from '@/constants/typography';

type PageHeadingProps = {
  /** Small bordered pill beside the title — a status, a code, a category */
  label?: string;
  title: string;
  /** Sits opposite the pill — an action or a count */
  trailing?: ReactNode;
  /** `hero` is reserved for the greeting on Home */
  size?: 'hero' | 'display' | 'heading';
  style?: StyleProp<ViewStyle>;
};

/**
 * A screen's subject line — one compact line of type.
 *
 * Deliberately not a large title block: the bar already names the screen, so
 * this only appears where the subject itself is the content (a report's
 * title, a service's name, the greeting), and it never carries a paragraph
 * of explanation underneath.
 */
export function PageHeading({
  label,
  title,
  trailing,
  size = 'heading',
  style,
}: PageHeadingProps) {
  const titleStyle =
    size === 'hero' ? typeScale.hero : size === 'display' ? typeScale.display : typeScale.heading;

  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.row}>
        <Text style={[titleStyle, styles.title]} numberOfLines={2}>
          {title}
        </Text>
        {label ? (
          <View style={styles.pill}>
            <Text style={styles.pillText} numberOfLines={1}>
              {label}
            </Text>
          </View>
        ) : null}
      </View>
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    flexShrink: 1,
  },
  pill: {
    flexShrink: 1,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: corners.chip.borderRadius,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  pillText: {
    ...typeScale.label,
    fontSize: 12,
    lineHeight: 16,
  },
  trailing: {
    alignItems: 'flex-start',
  },
});
