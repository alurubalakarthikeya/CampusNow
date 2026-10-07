import { Text, View } from 'react-native';
import { AlertOctagon, Database, FileCheck2, PhoneCall, ShieldCheck, UserCheck } from 'lucide-react-native';

import { colors } from '@/constants/colors';
import { type as typeScale } from '@/constants/typography';
import { Screen } from '@/components/layout/Screen';
import { Card, CardSection, Pill } from '@/components/ui/Card';
import { FooterNote } from '@/components/ui/FooterNote';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { useUser } from '@/hooks/useCampusData';
import type { IconComponent } from '@/utils/icons';
import { createStyles } from '@/utils/themedStyles';

const VERSION = '1.0';
const EFFECTIVE = '1 October 2026';
const DESK_HOURS = 'Campus operations · Mon–Sat, 08:00–20:00';

/**
 * Terms of use.
 *
 * Short, readable and specific to what this app actually does: who may use
 * it, what a report means, what happens to the data, and what counts as
 * misuse. Written the way a campus would say it, not as legal fog.
 */
export default function TermsScreen() {
  const user = useUser();

  return (
    <Screen back section="Terms">
      <Card>
        <CardSection
          first
          title="Terms of use"
          description={`Version ${VERSION} · effective ${EFFECTIVE}`}
        >
          <View style={styles.metaRow}>
            <Pill tone="primary">Campus operations</Pill>
            <Text style={[typeScale.label, styles.meta]}>{DESK_HOURS}</Text>
          </View>
        </CardSection>
      </Card>

      <SectionLabel style={styles.section}>Who can use CampusNow</SectionLabel>
      <Card>
        <SectionRow
          first
          icon={UserCheck}
          title="Verified students only"
          body="An account is issued to a student of this campus and is tied to the college email and seat number verified at sign-in. There is no self sign-up, and accounts cannot be shared or transferred."
        />
        <SectionRow
          icon={ShieldCheck}
          title="One account per student"
          body={`This device is signed in as ${user.name}. Reports you file carry your name and seat number so the operations desk can follow up with you directly.`}
        />
      </Card>

      <SectionLabel style={styles.section}>What a report means</SectionLabel>
      <Card>
        <SectionRow
          first
          icon={FileCheck2}
          title="Reports must be true and specific"
          body="File a report when you have seen the fault yourself. Describe the block, floor and room, and attach a photo where you can. Reports are treated as statements to campus operations."
        />
        <SectionRow
          icon={AlertOctagon}
          title="False and abusive reports"
          body="Knowingly filing a false report, filing the same fault repeatedly to force attention, or using a report to harass a person or a department is a misuse of campus resources. It is handled under the student code of conduct and can suspend your access to CampusNow."
        />
        <SectionRow
          icon={PhoneCall}
          title="Not an emergency channel"
          body="Fire, injury, live wiring, gas or any other immediate danger must go to campus security or emergency services first. CampusNow tickets are read during operations hours, not around the clock."
        />
      </Card>

      <SectionLabel style={styles.section}>Your data</SectionLabel>
      <Card>
        <SectionRow
          first
          icon={Database}
          title="Stored on this device"
          body="Your verified email, seat number, the photo of your college ID and every report you file are stored on this phone. Nothing is uploaded while the app runs on local data."
        />
        <SectionRow
          title="What a ticket carries"
          body="When your report reaches the operations queue it carries your name, seat number, the description, the location and any photo you attached — so the desk can contact you about that fault."
        />
        <SectionRow
          title="What is never done"
          body="Your details are not sold, not published and not shown to other students. Your college ID photo is kept as proof of verification and is not shown to operations teams."
        />
      </Card>

      <SectionLabel style={styles.section}>Notifications and conduct</SectionLabel>
      <Card>
        <SectionRow
          first
          title="Updates"
          body="Status changes on reports you file or follow are delivered as system notifications. You can switch them off in settings; critical safety notices are always delivered."
        />
        <SectionRow
          title="Acceptable behaviour"
          body="No abusive language, no impersonation, no automated submissions and no attempts to access another student's reports. Reports may be merged, re-triaged or closed by operations at any time."
        />
      </Card>

      <Card muted style={styles.footerCard}>
        <View style={styles.footerRow}>
          <Text style={[typeScale.label, styles.footerText]}>
            Continuing to use CampusNow means you accept these terms. The version above is the one
            in force on this device; material changes are announced in your notifications before
            they take effect.
          </Text>
        </View>
      </Card>

      <FooterNote style={styles.footnote}>
        Questions about a report: reply to any notification, or email the campus operations desk.
      </FooterNote>
    </Screen>
  );
}

function SectionRow({
  icon: Icon,
  title,
  body,
  first = false,
}: {
  icon?: IconComponent;
  title: string;
  body: string;
  first?: boolean;
}) {
  return (
    <View style={[styles.row, first ? null : styles.rowRule]}>
      {Icon ? (
        <View style={styles.iconTile}>
          <Icon size={16} color={colors.inkSoft} strokeWidth={1.9} />
        </View>
      ) : null}
      <View style={styles.rowCopy}>
        <Text style={typeScale.bodyStrong}>{title}</Text>
        <Text style={[typeScale.meta, styles.rowBody]}>{body}</Text>
      </View>
    </View>
  );
}

const styles = createStyles(() => ({
  metaRow: {
    marginTop: 12,
    gap: 8,
  },
  meta: {
    color: colors.faint,
  },
  section: {
    marginTop: 26,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  rowRule: {
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  iconTile: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  rowCopy: {
    flex: 1,
    gap: 3,
  },
  rowBody: {
    color: colors.muted,
  },
  footerCard: {
    marginTop: 20,
  },
  footerRow: {
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  footerText: {
    fontSize: 12,
    lineHeight: 17.5,
    color: colors.muted,
  },
  footnote: {
    marginTop: 18,
  },
}));
