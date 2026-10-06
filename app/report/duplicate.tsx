import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Wifi } from 'lucide-react-native';

import { colors } from '@/constants/colors';
import { type as typeScale } from '@/constants/typography';
import { Screen } from '@/components/layout/Screen';
import { PageHeading } from '@/components/layout/PageHeading';
import { Card, CardSection } from '@/components/ui/Card';
import { FooterNote } from '@/components/ui/FooterNote';
import { Metric } from '@/components/ui/Metric';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Buttons';
import { StatusDot } from '@/components/ui/StatusDot';
import { campusApi } from '@/data/campusApi';
import { useReportDraft } from '@/stores/reportDraft';
import type { CampusIssue, Report } from '@/types';
import { haptics } from '@/utils/haptics';

type Match = { report: Report; issue: CampusIssue | null } | null;

/**
 * Smart duplicate detection. The point of this screen is that the student
 * should think "oh, I don't need another report" — so the affected count
 * becomes the loudest number and the follow action is the primary one.
 */
export default function DuplicateScreen() {
  const router = useRouter();
  const draft = useReportDraft();
  const [match, setMatch] = useState<Match | undefined>(undefined);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    let alive = true;
    campusApi.findDuplicate(draft.categoryId).then((result) => {
      if (alive) setMatch(result);
    });
    return () => {
      alive = false;
    };
  }, [draft.categoryId]);

  const follow = async () => {
    if (!match) return;
    setFollowing(true);
    haptics.success();
    await campusApi.followIssue(match.report.id);
    router.replace({ pathname: '/report/details', params: { id: match.report.id } });
  };

  if (match === undefined) {
    return (
      <Screen back section="Duplicate check">
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[typeScale.meta, styles.loadingText]}>Checking nearby reports…</Text>
        </View>
      </Screen>
    );
  }

  const affected = match?.issue?.reportCount ?? match?.report.affectedStudents ?? 0;
  const title = match?.issue?.title ?? `${match?.report.title ?? 'Issue'}`;
  const detail = match?.issue?.detail ?? 'Campus operations is already on it';

  if (!match) {
    return (
      <Screen back section="Duplicate check">
        <PageHeading title="Nothing similar nearby." size="display" />
        <Card style={styles.hero}>
          <CardSection
            first
            title="You are the first to report this"
            description="Campus operations picks it up from here and updates this screen as it moves."
          />
        </Card>
        <PrimaryButton
          label="Continue report"
          onPress={() => router.push('/report/review')}
          style={styles.primary}
        />
      </Screen>
    );
  }

  return (
    <Screen back section="Duplicate check">
      <PageHeading label="Smart duplicate detection" title="This may already be happening." size="display" />

      <Card style={styles.hero}>
        <CardSection
          first
          title={title}
          description="A nearby issue sounds the same as yours. Follow it instead of filing a duplicate."
        >
          <View style={styles.heroTop}>
            <View style={styles.heroHead}>
              <Wifi size={16} color={colors.faint} strokeWidth={1.9} />
              <Text style={typeScale.bodyStrong}>Already being handled</Text>
            </View>
            <StatusDot tone="warning" size={8} />
          </View>

          <Metric value={affected} size="hero" label="students affected" style={styles.metric} />

          <View style={styles.footer}>
            <StatusDot tone="warning" size={7} />
            <Text style={[typeScale.meta, styles.footerText]}>{detail}</Text>
          </View>
        </CardSection>
      </Card>

      <PrimaryButton
        label="Follow existing issue"
        onPress={follow}
        loading={following}
        style={styles.primary}
      />
      <SecondaryButton
        label="Report something different"
        onPress={() => router.push('/report/review')}
        style={styles.secondary}
      />

      <FooterNote style={styles.note}>
        Following keeps you updated without creating a duplicate report.
      </FooterNote>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: colors.muted,
  },
  hero: {
    marginTop: 16,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  metric: {
    marginTop: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  footerText: {
    flex: 1,
  },
  primary: {
    marginTop: 20,
  },
  secondary: {
    marginTop: 10,
  },
  note: {
    marginTop: 20,
  },
});
