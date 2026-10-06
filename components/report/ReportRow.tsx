import { StyleSheet, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

import { colors } from '@/constants/colors';
import { fontFamily, type as typeScale } from '@/constants/typography';
import { PressableScale } from '@/components/ui/PressableScale';
import { Surface } from '@/components/ui/Surface';
import { StatusDot, StatusLine } from '@/components/ui/StatusDot';
import type { Report } from '@/types';
import { stamp } from '@/utils/format';
import { isResolved, statusMeta } from '@/utils/status';
import { categoryIcons } from '@/utils/icons';

type ReportRowProps = {
  report: Report;
  onPress: () => void;
  /** The hero block is used for the most relevant report only */
  variant?: 'hero' | 'row';
  index?: number;
  /** Draws the hairline between stacked rows — omit on the first row */
  first?: boolean;
};

/** Hero block: the report the student is currently waiting on. */
export function ReportHero({ report, onPress, index }: ReportRowProps) {
  const Icon = categoryIcons[report.categoryId];
  const meta = statusMeta[report.status];

  return (
    <Surface corner="leaf" padding={18} onPress={onPress} accessibilityLabel={report.title}>
      <View style={styles.heroTop}>
        <View style={styles.heroIcon}>
          <Icon size={19} color={colors.primary} strokeWidth={1.8} />
        </View>
        <Text style={[typeScale.label, styles.index]}>{index !== undefined ? String(index).padStart(2, '0') : ''}</Text>
      </View>

      <Text style={[typeScale.heading, styles.heroTitle]} numberOfLines={2}>
        {report.title}
      </Text>
      <Text style={[typeScale.meta, styles.location]} numberOfLines={1}>
        {[report.location.buildingName, report.location.floor, report.location.room].filter(Boolean).join(' · ')}
      </Text>

      <View style={styles.heroFooter}>
        <StatusLine label={meta.label} tone={meta.tone} />
        <Text style={typeScale.meta}>{stamp(report.createdAt)}</Text>
      </View>
    </Surface>
  );
}

/**
 * Quiet row for everything else. Resolved history loses its weight so the
 * active work stands out.
 */
export function ReportRow({ report, onPress, index, first = false }: ReportRowProps) {
  const meta = statusMeta[report.status];
  const resolved = isResolved(report);

  return (
    <PressableScale
      onPress={onPress}
      accessibilityLabel={report.title}
      style={[styles.row, first ? null : styles.rowRule]}
    >
      <View style={styles.rowInner}>
          <View style={styles.rowLeft}>
            <StatusDot tone={resolved ? 'neutral' : meta.tone} size={6} />
            {index !== undefined ? (
              <Text style={[typeScale.label, styles.index]}>{String(index).padStart(2, '0')}</Text>
            ) : null}
          </View>

          <View style={styles.rowCopy}>
            <Text style={[styles.rowTitle, resolved ? styles.resolvedTitle : null]} numberOfLines={1}>
              {report.title}
            </Text>
            <Text style={typeScale.meta} numberOfLines={1}>
              {[report.location.buildingName, report.location.floor, report.location.room]
                .filter(Boolean)
                .join(' · ')}
            </Text>
            <Text style={[typeScale.meta, styles.rowStamp]}>{stamp(report.createdAt)}</Text>
          </View>

        <View style={styles.rowRight}>
          <Text style={[styles.rowStatus, { color: resolved ? colors.faint : colors.ink }]}>{meta.label}</Text>
          <ChevronRight size={16} color={colors.faint} strokeWidth={1.8} />
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryTint,
  },
  index: {
    color: colors.faint,
  },
  heroTitle: {
    marginTop: 12,
  },
  location: {
    marginTop: 3,
  },
  heroFooter: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  row: {
    paddingVertical: 13,
    // Rows carry the card's padding so their hairlines can run edge to edge.
    paddingHorizontal: 18,
  },
  rowRule: {
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  rowInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 5,
  },
  rowCopy: {
    flex: 1,
    gap: 2,
  },
  /** Never larger than the section heading that introduces it. */
  rowTitle: {
    fontFamily: fontFamily.medium,
    fontSize: 15,
    letterSpacing: -0.2,
    color: colors.ink,
  },
  resolvedTitle: {
    color: colors.inkSoft,
  },
  rowStamp: {
    color: colors.faint,
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: 6,
    paddingTop: 2,
  },
  rowStatus: {
    ...typeScale.meta,
    fontFamily: fontFamily.medium,
  },
});
