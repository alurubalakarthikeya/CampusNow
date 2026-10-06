import { StyleSheet, Text, View } from 'react-native';
import { Bug, LifeBuoy, MessageSquare } from 'lucide-react-native';

import { colors } from '@/constants/colors';
import { type as typeScale } from '@/constants/typography';
import { Screen } from '@/components/layout/Screen';
import { Card, CardRow, CardSection } from '@/components/ui/Card';
import { SectionLabel } from '@/components/ui/SectionLabel';

const HELP_EMAIL = 'help@campusnow.app';

const LIFECYCLE: { title: string; detail: string }[] = [
  { title: 'Reported', detail: 'Campus operations receives it immediately.' },
  { title: 'Confirmed', detail: 'A coordinator verifies the issue and its severity.' },
  { title: 'Assigned', detail: 'The owning team is put on the job.' },
  { title: 'Investigating', detail: 'A technician is on site and updating the report.' },
  { title: 'Resolved', detail: 'You confirm the fix, or reopen it if it did not hold.' },
];

/** Help centre: how to reach operations and how the lifecycle works. */
export default function HelpScreen() {
  return (
    <Screen back section="Help">
      <SectionLabel style={styles.sectionFirst}>Reach us</SectionLabel>

      <Card>
        <CardRow
          first
          icon={MessageSquare}
          title="Email campus operations"
          description={HELP_EMAIL}
        />
        <CardRow
          icon={Bug}
          title="Report a problem with the app"
          description="Wrong location, missing category"
        />
      </Card>

      <SectionLabel style={styles.section}>How a report moves</SectionLabel>

      <Card>
        {LIFECYCLE.map((step, index) => (
          <CardRow
            key={step.title}
            first={index === 0}
            leading={
              <View style={styles.stepIndex}>
                <Text style={styles.stepIndexText}>{index + 1}</Text>
              </View>
            }
            title={step.title}
            description={step.detail}
          />
        ))}
      </Card>

      <Card style={styles.note}>
        <CardSection
          first
          title="No duplicates, ever"
          description="Similar reports are merged automatically, so you never need to file the same issue twice. Following an existing report gives you the same updates."
        />
      </Card>

      <View style={styles.footnote}>
        <LifeBuoy size={15} color={colors.faint} strokeWidth={1.8} />
        <Text style={[typeScale.meta, styles.footnoteText]}>
          CampusNow v1.0 · demo data only, nothing leaves this device
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 28,
    marginBottom: 8,
  },
  sectionFirst: {
    marginBottom: 8,
  },
  stepIndex: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryTint,
  },
  stepIndexText: {
    ...typeScale.meta,
    fontFamily: typeScale.bodyStrong.fontFamily,
    color: colors.primary,
  },
  note: {
    marginTop: 16,
  },
  footnote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    marginTop: 22,
  },
  footnoteText: {
    flex: 1,
    color: colors.faint,
  },
});
