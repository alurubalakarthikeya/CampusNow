import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { fontFamily, type as typeScale } from '@/constants/typography';
import { StatusDot } from '@/components/ui/StatusDot';
import type { TimelineStep } from '@/types';
import { clock, countdown } from '@/utils/format';
import type { LiveStage } from '@/utils/status';

type ProgressTimelineProps = {
  steps: TimelineStep[];
  /** Present only while a report filed here is still moving. */
  live?: LiveStage | null;
  /** Total number of stages, used for the "stage n of n" copy */
  total?: number;
};

/**
 * The main vertical axis of the report details screen. Progress should be
 * readable in a single glance: filled dot behind, solid dot now, hollow
 * ring ahead — and while a report is live, a bar that visibly fills inside
 * the stage it is sitting in.
 */
export function ProgressTimeline({ steps, live, total = steps.length }: ProgressTimelineProps) {
  return (
    <View>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const pending = step.state === 'pending';
        const current = step.state === 'current';

        return (
          <View key={step.status} style={styles.row}>
            <View style={styles.rail}>
              {current ? (
                <StatusDot tone="primary" size={13} halo haloSize={26} />
              ) : pending ? (
                <View style={styles.ring} />
              ) : (
                <StatusDot tone="primary" size={11} />
              )}
              {!isLast ? (
                <View style={[styles.connector, pending ? styles.connectorPending : null]} />
              ) : null}
            </View>

            <View style={[styles.copy, isLast ? styles.copyLast : null]}>
              <Text
                style={[
                  styles.label,
                  current ? styles.labelCurrent : pending ? styles.labelPending : null,
                ]}
              >
                {step.label}
              </Text>
              {current ? <Text style={typeScale.meta}>{step.caption}</Text> : null}

              {current && live ? (
                <View style={styles.live}>
                  <View style={styles.liveTrack}>
                    <View
                      style={[styles.liveFill, { width: `${Math.round(live.progress * 100)}%` }]}
                    />
                  </View>
                  <Text style={[typeScale.meta, styles.liveText]}>
                    Stage {live.index + 1} of {total}
                    {live.nextLabel ? ` · ${live.nextLabel} in ${countdown(live.msToNext ?? 0)}` : ' · complete'}
                  </Text>
                </View>
              ) : null}
            </View>

            {step.at ? <Text style={[typeScale.meta, styles.time]}>{clock(step.at)}</Text> : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  rail: {
    width: 26,
    alignItems: 'center',
    alignSelf: 'stretch',
    paddingTop: 2,
  },
  connector: {
    flex: 1,
    width: 2,
    marginTop: 4,
    marginBottom: 6,
    borderRadius: 1,
    backgroundColor: colors.primaryTintStrong,
  },
  connectorPending: {
    backgroundColor: colors.line,
  },
  ring: {
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
  },
  copy: {
    flex: 1,
    paddingBottom: 26,
    paddingLeft: 4,
    gap: 2,
  },
  copyLast: {
    paddingBottom: 0,
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: 15,
    letterSpacing: -0.2,
    color: colors.ink,
  },
  labelCurrent: {
    fontFamily: fontFamily.semibold,
    color: colors.primary,
    fontSize: 15,
  },
  labelPending: {
    color: colors.faint,
  },
  live: {
    gap: 6,
    marginTop: 8,
  },
  liveTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: colors.primaryTint,
  },
  liveFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  liveText: {
    color: colors.faint,
  },
  time: {
    color: colors.faint,
    paddingTop: 2,
  },
});
