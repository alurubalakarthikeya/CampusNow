import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { colors } from '@/constants/colors';
import { type as typeScale } from '@/constants/typography';
import { Screen } from '@/components/layout/Screen';
import { PageHeading } from '@/components/layout/PageHeading';
import { ProgressTimeline } from '@/components/report/ProgressTimeline';
import { ReportStatusPanel } from '@/components/report/ReportStatusPanel';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Buttons';
import { Card, CardSection } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { FooterNote } from '@/components/ui/FooterNote';
import { MetricPair } from '@/components/ui/MetricPair';
import { useReport } from '@/hooks/useCampusData';
import { useNow } from '@/hooks/useNow';
import { useAppStore } from '@/stores/appStore';
import type { Report } from '@/types';
import { clock, countdown, locationLine } from '@/utils/format';
import { haptics } from '@/utils/haptics';
import {
  buildActivity,
  buildTimeline,
  expectedUpdate,
  isResolved,
  liveStage,
} from '@/utils/status';

/**
 * Report details. The vertical timeline is the main axis of the screen, the
 * current state sits in the status panel, and the supporting numbers and the
 * activity log close it out as two quiet cards.
 */
export default function ReportDetailsScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const report = useReport(params.id);

  // A report filed from this device keeps moving: the screen reads the
  // current stage off a one-second clock and renders it live.
  const tracking = Boolean(report?.live) && report?.status !== 'resolved';
  const now = useNow(1000, tracking);
  const live = useMemo(
    () => (report && tracking ? liveStage(report, now) : null),
    [report, tracking, now],
  );
  const timeline = useMemo(() => (report ? buildTimeline(report, now) : []), [report, now]);
  const activity = useMemo(() => (report ? buildActivity(report, now) : []), [report, now]);

  if (!report) {
    return (
      <Screen back section="Report">
        <EmptyState
          title="That report has moved."
          message="We could not find this report on this device. Open it again from My reports."
        />
      </Screen>
    );
  }

  const resolved = isResolved(report);
  const nextUpdate = live
    ? live.nextLabel
      ? countdown(live.msToNext ?? 0)
      : 'Closed'
    : expectedUpdate(report);

  return (
    <Screen back section="Report">
      <PageHeading label={report.location.buildingName} title={report.title} size="display" />

      <ReportStatusPanel report={report} live={live} />

      <Card style={styles.card}>
        <CardSection first title="Progress" description={locationLine(report.location)}>
          <ProgressTimeline steps={timeline} live={live} />
        </CardSection>
      </Card>

      <Card style={styles.card}>
        <CardSection first>
          <MetricPair
            left={{
              value: report.affectedStudents,
              label: report.affectedStudents === 1 ? 'student affected' : 'students affected',
            }}
            right={{ value: nextUpdate, label: live ? 'next stage' : 'expected update' }}
          />
        </CardSection>
      </Card>

      <Card style={styles.card}>
        <CardSection first title="Activity" description={`Opened at ${clock(report.createdAt)}`} />
        {activity.map((entry) => (
          <View key={entry.id} style={styles.activityRow}>
            <Text style={[typeScale.body, styles.activityTime]}>{clock(entry.at)}</Text>
            <Text style={[typeScale.body, styles.activityText]}>{entry.text}</Text>
          </View>
        ))}
      </Card>

      {resolved ? (
        <ResolutionPrompt report={report} />
      ) : (
        <FooterNote style={styles.footnote}>
          You will get a notification here and on your device when the status changes. No need to
          create another report.
        </FooterNote>
      )}
    </Screen>
  );
}

/** Closes the loop: the student confirms whether the fix actually worked. */
function ResolutionPrompt({ report }: { report: Report }) {
  const confirmResolution = useAppStore((state) => state.confirmResolution);
  const reopenReport = useAppStore((state) => state.reopenReport);

  if (report.resolutionConfirmed) {
    return (
      <Card style={styles.card}>
        <CardSection
          first
          title="Fix confirmed"
          description="Your confirmation was shared with the operations team."
        />
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <CardSection
        first
        title="Did this get resolved?"
        description="Your answer closes the report or sends it back to the team."
      >
        <View style={styles.promptActions}>
          <PrimaryButton
            label="Yes, it's fixed"
            onPress={() => {
              haptics.success();
              confirmResolution(report.id);
            }}
            style={styles.promptButton}
          />
          <SecondaryButton
            label="Still broken"
            onPress={() => {
              haptics.warning();
              reopenReport(report.id);
            }}
            style={styles.promptButton}
          />
        </View>
      </CardSection>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 14,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  activityTime: {
    width: 46,
    color: colors.faint,
    fontVariant: ['tabular-nums'],
  },
  activityText: {
    flex: 1,
    color: colors.ink,
  },
  footnote: {
    marginTop: 20,
  },
  promptActions: {
    flexDirection: 'row',
    gap: 10,
  },
  promptButton: {
    flex: 1,
    height: 48,
  },
});
