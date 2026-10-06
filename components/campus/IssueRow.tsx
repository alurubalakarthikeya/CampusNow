import { StyleSheet, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

import { colors } from '@/constants/colors';
import { fontFamily, type as typeScale } from '@/constants/typography';
import { PressableScale } from '@/components/ui/PressableScale';
import { StatusDot } from '@/components/ui/StatusDot';
import type { CampusIssue } from '@/types';
import { severityMeta } from '@/utils/status';

type IssueRowProps = {
  issue: CampusIssue;
  onPress?: () => void;
  /** Draws the hairline between stacked rows — omit on the first row */
  first?: boolean;
};

/** A quiet row — severity dot, statement, count — for use inside a card. */
export function IssueRow({ issue, onPress, first = false }: IssueRowProps) {
  const meta = severityMeta[issue.severity];

  return (
    <PressableScale
      onPress={onPress}
      accessibilityLabel={issue.title}
      style={[styles.row, first ? null : styles.rowRule]}
    >
      <StatusDot tone={meta.tone} size={7} />
      <View style={styles.copy}>
        <Text style={styles.title} numberOfLines={1}>
          {issue.title}
        </Text>
        <Text style={[typeScale.meta, styles.detail]} numberOfLines={1}>
          {issue.detail}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.count}>{issue.reportCount}</Text>
        <Text style={[typeScale.label, styles.countLabel]}>{issue.reportCount === 1 ? 'report' : 'reports'}</Text>
      </View>
      {onPress ? <ChevronRight size={16} color={colors.faint} strokeWidth={1.8} /> : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    // Rows carry the card's padding so their hairlines can run edge to edge.
    paddingHorizontal: 18,
  },
  rowRule: {
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: fontFamily.medium,
    fontSize: 15.5,
    letterSpacing: -0.3,
    color: colors.ink,
  },
  detail: {
    color: colors.muted,
  },
  right: {
    alignItems: 'flex-end',
  },
  count: {
    fontFamily: fontFamily.semibold,
    fontSize: 17,
    letterSpacing: -0.5,
    color: colors.ink,
  },
  countLabel: {
    fontSize: 11.5,
    lineHeight: 15,
    letterSpacing: 0,
  },
});
