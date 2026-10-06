import { StyleSheet, Text, View } from 'react-native';

import { colors, toneColor } from '@/constants/colors';
import { fontFamily, type as typeScale } from '@/constants/typography';
import { Surface } from '@/components/ui/Surface';
import { StatusDot } from '@/components/ui/StatusDot';
import type { Report } from '@/types';
import { statusCaption, statusHeadline, statusMeta, type LiveStage } from '@/utils/status';

type ReportStatusPanelProps = {
  report: Report;
  /** Set while a report filed here is still moving through its stages */
  live?: LiveStage | null;
};

/**
 * The current state of the report, stated plainly and prominently in the
 * same bordered surface as everything else.
 */
export function ReportStatusPanel({ report, live }: ReportStatusPanelProps) {
  const meta = statusMeta[report.status];

  return (
    <Surface corner="leaf" padding={20} style={styles.panel} accessibilityLabel="Current status">
      <View style={styles.headline}>
        <View style={styles.headlineLeft}>
          <StatusDot tone={meta.tone} size={8} />
          <Text style={[typeScale.bodyStrong, { color: toneColor[meta.tone] }]}>
            {statusHeadline(report)}
          </Text>
        </View>

        {live ? (
          <View style={styles.livePill}>
            <View style={styles.livePulse} />
            <Text style={styles.livePillText}>
              Live · stage {live.index + 1}/{5}
            </Text>
          </View>
        ) : null}
      </View>
      <Text style={[typeScale.bodyLarge, styles.body]}>{statusCaption(report)}</Text>
    </Surface>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginTop: 14,
  },
  headline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  headlineLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  body: {
    marginTop: 6,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primaryTintStrong,
    backgroundColor: colors.primaryTint,
  },
  livePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  livePillText: {
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    lineHeight: 16,
    color: colors.primary,
  },
});
