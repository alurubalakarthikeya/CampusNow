import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

import { colors, toneColor } from '@/constants/colors';
import { corners } from '@/constants/layout';
import { type as typeScale } from '@/constants/typography';
import { PressableScale } from './PressableScale';
import type { IconComponent } from '@/utils/icons';

/**
 * The container the whole app is built from: pure white, one grey pixel of a
 * border, a 16px radius and no shadow. Grouping content in it — rather than
 * inventing a new panel per screen — is what makes the pages read as a sys-
 * tem instead of a pile of boxes.
 */
export function Card({
  children,
  style,
  muted = false,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  muted?: boolean;
}) {
  return <View style={[styles.card, muted ? styles.cardMuted : null, style]}>{children}</View>;
}

/**
 * A small bordered tag: a status, a category, a code. One line, never a
 * headline — it sits beside the thing it describes.
 */
export function Pill({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'primary' | 'healthy' | 'warning' | 'critical';
}) {
  return (
    <View style={[styles.pill, { borderColor: colors.line, backgroundColor: colors.surface }]}>
      {tone !== 'neutral' ? (
        <View style={[styles.pillDot, { backgroundColor: toneColor[tone] }]} />
      ) : null}
      <Text style={[styles.pillText, tone !== 'neutral' ? { color: toneColor[tone] } : null]}>
        {children}
      </Text>
    </View>
  );
}

/**
 * A padded block inside a card: an optional title, a grey description and
 * whatever it holds. Sections are separated by a hairline instead of gaps, so
 * a card reads as one surface with structure rather than stacked boxes.
 */
export function CardSection({
  title,
  description,
  children,
  first = false,
  style,
}: {
  title?: string;
  description?: string;
  children?: ReactNode;
  /** The first section in a card draws no top rule */
  first?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const headed = Boolean(title || description);

  return (
    <View style={[styles.section, first ? null : styles.rule, style]}>
      {title ? <Text style={[typeScale.title, styles.sectionTitle]}>{title}</Text> : null}
      {description ? (
        <Text style={[typeScale.meta, title ? styles.description : null]}>{description}</Text>
      ) : null}
      {children ? <View style={headed ? styles.sectionBody : null}>{children}</View> : null}
    </View>
  );
}

/**
 * One line inside a card: an optional icon tile, a label, an optional grey line
 * under it and a trailing slot (a switch, a value, a chevron). Rows carry the
 * card's horizontal padding themselves so their hairlines run edge to edge —
 * use them directly inside `Card`, never inside a `CardSection`.
 */
export function CardRow({
  icon: Icon,
  leading,
  title,
  description,
  right,
  onPress,
  first = false,
  tone = 'ink',
  style,
}: {
  icon?: IconComponent;
  /** Replaces the icon tile — for a number, an avatar or any custom block */
  leading?: ReactNode;
  title: string;
  description?: string;
  right?: ReactNode;
  onPress?: () => void;
  first?: boolean;
  tone?: 'ink' | 'critical';
  style?: StyleProp<ViewStyle>;
}) {
  const body = (
    <>
      {leading ??
        (Icon ? (
          <View style={styles.iconTile}>
            <Icon
              size={16}
              color={tone === 'critical' ? colors.critical : colors.inkSoft}
              strokeWidth={1.9}
            />
          </View>
        ) : null)}
      <View style={styles.copy}>
        <Text
          style={[typeScale.bodyStrong, tone === 'critical' ? styles.critical : null]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {description ? (
          <Text style={[typeScale.meta, styles.rowDescription]} numberOfLines={2}>
            {description}
          </Text>
        ) : null}
      </View>
      {right ?? (onPress ? <ChevronRight size={17} color={colors.faint} strokeWidth={2} /> : null)}
    </>
  );

  const row: StyleProp<ViewStyle> = [styles.row, first ? null : styles.rowRule, style];

  if (onPress) {
    return (
      <PressableScale onPress={onPress} style={row} scaleTo={0.99} accessibilityLabel={title}>
        {body}
      </PressableScale>
    );
  }

  return <View style={row}>{body}</View>;
}

const styles = StyleSheet.create({
  card: {
    ...corners.leaf,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  cardMuted: {
    backgroundColor: colors.surfaceMuted,
  },
  section: {
    padding: 18,
  },
  rule: {
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  sectionTitle: {
    letterSpacing: -0.3,
  },
  description: {
    marginTop: 3,
  },
  sectionBody: {
    marginTop: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: 18,
  },
  rowRule: {
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  iconTile: {
    width: 32,
    height: 32,
    borderRadius: corners.chip.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  copy: {
    flex: 1,
    gap: 1,
  },
  rowDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  critical: {
    color: colors.critical,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: corners.chip.borderRadius,
    borderWidth: 1,
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pillText: {
    ...typeScale.label,
    fontSize: 12,
    lineHeight: 16,
  },
});
