import { Alert, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, Building2, GraduationCap, LifeBuoy, LogOut, Pencil } from 'lucide-react-native';

import { colors } from '@/constants/colors';
import { fontFamily, type as typeScale } from '@/constants/typography';
import { Screen } from '@/components/layout/Screen';
import { Card, CardRow, CardSection } from '@/components/ui/Card';
import { FooterNote } from '@/components/ui/FooterNote';
import { Metric } from '@/components/ui/Metric';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { useReportStats, useUser } from '@/hooks/useCampusData';
import { useAppStore } from '@/stores/appStore';
import { plural } from '@/utils/format';

/**
 * Profile. Identity first, then the activity numbers, then a grouped settings
 * list — the shape of a well-kept account screen.
 */
export default function ProfileScreen() {
  const router = useRouter();
  const user = useUser();
  const stats = useReportStats();
  const resetDemoData = useAppStore((state) => state.resetDemoData);
  const initial = user.name.trim().charAt(0).toUpperCase();

  const confirmSignOut = () => {
    Alert.alert(
      'Sign out of CampusNow?',
      'Accounts arrive with the next milestone, so signing out clears the local demo data on this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign out', style: 'destructive', onPress: () => resetDemoData() },
      ],
    );
  };

  return (
    <Screen>
      <Card>
        <CardSection first title="Your profile" description="The name shown on every report you file.">
          <View style={styles.identity}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitial}>{initial}</Text>
            </View>
            <View style={styles.identityCopy}>
              <Text style={styles.name} numberOfLines={1}>
                {user.name}
              </Text>
              <Text style={typeScale.meta}>{user.degree}</Text>
              <View style={styles.university}>
                <GraduationCap size={13} color={colors.faint} strokeWidth={1.9} />
                <Text style={[typeScale.meta, styles.universityText]} numberOfLines={1}>
                  {user.university}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.editAction}>
            <CardRow
              first
              icon={Pencil}
              title="Edit profile"
              description="Name, degree and campus details"
              onPress={() => router.push('/profile/edit')}
              style={styles.editRow}
            />
          </View>
        </CardSection>

        <CardSection title="Activity" description="Everything you have filed, and where it stands today.">
          <View style={styles.statsRow}>
            <StatCell value={stats.total} label="Reports" />
            <View style={styles.statsRule} />
            <StatCell value={stats.resolved} label="Resolved" />
            <View style={styles.statsRule} />
            <StatCell value={stats.active} label="Active" />
          </View>
        </CardSection>
      </Card>

      <SectionLabel style={styles.section}>Settings</SectionLabel>

      <Card>
        <CardRow
          first
          icon={Bell}
          title="Notification preferences"
          description="Which updates reach you"
          onPress={() => router.push('/profile/notifications')}
        />
        <CardRow
          icon={Building2}
          title="Campus details"
          description="Blocks, campus ID and open work"
          onPress={() => router.push('/profile/campus')}
        />
        <CardRow
          icon={LifeBuoy}
          title="Help & feedback"
          description="Reach operations, or read how reports move"
          onPress={() => router.push('/profile/help')}
        />
      </Card>

      <Card style={styles.danger}>
        <CardRow
          first
          icon={LogOut}
          title="Sign out"
          tone="critical"
          onPress={confirmSignOut}
        />
      </Card>

      <FooterNote style={styles.footnote}>
        Signed in as {user.name} · {plural(stats.total, 'report')} on this device
      </FooterNote>
    </Screen>
  );
}

function StatCell({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.statCell}>
      <Metric value={value} label={label} align="center" />
    </View>
  );
}

const styles = StyleSheet.create({
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryTint,
  },
  avatarInitial: {
    fontFamily: fontFamily.semibold,
    fontSize: 22,
    color: colors.primary,
  },
  identityCopy: {
    flex: 1,
    gap: 1,
  },
  name: {
    fontFamily: fontFamily.semibold,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.5,
    color: colors.ink,
  },
  university: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  universityText: {
    flexShrink: 1,
    color: colors.faint,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  statsRule: {
    width: 1,
    backgroundColor: colors.line,
    marginVertical: 2,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  /** The edit row sits inside the identity card but keeps the card's gutter. */
  editAction: {
    marginTop: 14,
    marginHorizontal: -18,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  editRow: {
    paddingVertical: 10,
  },
  section: {
    marginTop: 28,
    marginBottom: 8,
  },
  danger: {
    marginTop: 14,
  },
  footnote: {
    marginTop: 20,
  },
});
