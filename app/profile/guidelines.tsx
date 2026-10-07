import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AlertTriangle, Camera, CheckCircle2, MapPin, Tag, Timer } from 'lucide-react-native';

import { colors } from '@/constants/colors';
import { type as typeScale } from '@/constants/typography';
import { Screen } from '@/components/layout/Screen';
import { PrimaryButton, TextButton } from '@/components/ui/Buttons';
import { Card, CardSection, Pill } from '@/components/ui/Card';
import { FooterNote } from '@/components/ui/FooterNote';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { useReportDraft } from '@/stores/reportDraft';
import { createStyles } from '@/utils/themedStyles';

const CHECKS: { icon: typeof Tag; title: string; body: string }[] = [
  {
    icon: Tag,
    title: 'Pick the category that matches the fault',
    body: 'It decides which team owns the ticket. WiFi, lab systems and classroom tech go to IT; cooling, power and upkeep go to Facilities.',
  },
  {
    icon: MapPin,
    title: 'Say exactly where it is',
    body: 'Block, floor and room — “Block B · 2nd floor · B204”. A technician should be able to walk straight to it without asking you.',
  },
  {
    icon: Timer,
    title: 'Say when it started',
    body: '“Since the 9am lecture” tells operations far more than “it is broken”. Mention if it happens at a particular time of day.',
  },
  {
    icon: Camera,
    title: 'Add one clear photo',
    body: 'Photograph the fault itself — the error on the projector, the socket, the mess counter. One good photo usually halves the triage time.',
  },
  {
    icon: CheckCircle2,
    title: 'Set severity honestly',
    body: '“Blocking” means work has stopped. Saving it for a real outage is what keeps the priority order meaningful for everyone.',
  },
];

/**
 * Reporting guidelines. The screen exists because the fastest fix is a
 * well-written report — it is the same advice the operations desk would give
 * on the phone, written down once.
 */
export default function GuidelinesScreen() {
  const router = useRouter();
  const beginReport = useReportDraft((state) => state.beginReport);

  return (
    <Screen back section="Guidelines">
      <Text style={[typeScale.body, styles.lede]}>
        Reports are read by a person who then has to find the fault, pick the right team and
        schedule the work. These five habits are what turn a report into a repair.
      </Text>

      <Card style={styles.card}>
        {CHECKS.map((item, index) => (
          <CardSection
            key={item.title}
            first={index === 0}
            dense
            title={item.title}
            description={item.body}
          />
        ))}
      </Card>

      <SectionLabel style={styles.section}>Before you file</SectionLabel>

      <Card>
        <CardSection
          first
          dense
          title="Check the campus map"
          description="Open issues are listed per block. If the same fault is already being tracked, follow it instead — you get every update without adding a duplicate."
        />
        <CardSection
          dense
          title="One fault per report"
          description="Two problems in one ticket are two tickets for the team. File the blocking one first and describe the rest in it."
        />
        <CardSection
          dense
          title="For an emergency, call security"
          description="Fire, injury, live wiring or a safety hazard is not a ticket. Call the campus security desk or emergency services first, then file the report."
        />
      </Card>

      <Card muted style={styles.warning}>
        <View style={styles.warningRow}>
          <AlertTriangle size={16} color={colors.muted} strokeWidth={1.9} />
          <Text style={[typeScale.label, styles.warningText]}>
            Filing a knowingly false report — or filing the same fault repeatedly to force
            attention — is a misuse of campus resources and is handled under the student code of
            conduct. Deliberate misuse can suspend your reporting access.
          </Text>
        </View>
      </Card>

      <PrimaryButton
        label="Start a report"
        onPress={() => {
          // A fresh draft: the guideline screen never resumes old work.
          beginReport();
          router.push('/report');
        }}
        style={styles.action}
      />
      <TextButton
        label="Read the terms of use"
        onPress={() => router.push('/profile/terms')}
        style={styles.secondary}
      />

      <FooterNote style={styles.footnote}>
        <Pill tone="primary">Operations</Pill>
      </FooterNote>
    </Screen>
  );
}

const styles = createStyles(() => ({
  lede: {
    marginTop: 6,
    marginBottom: 16,
  },
  card: {
    marginTop: 4,
  },
  section: {
    marginTop: 26,
    marginBottom: 8,
  },
  warning: {
    marginTop: 16,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17.5,
    color: colors.muted,
  },
  action: {
    marginTop: 20,
  },
  secondary: {
    marginTop: 4,
  },
  footnote: {
    marginTop: 16,
  },
}));
