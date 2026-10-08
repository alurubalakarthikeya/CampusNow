import { Alert, Text, View } from 'react-native';
import { Database, HardDrive, Server, Smartphone } from 'lucide-react-native';

import { colors } from '@/constants/colors';
import { type as typeScale } from '@/constants/typography';
import { Screen } from '@/components/layout/Screen';
import { Card, CardRow, CardSection, Pill } from '@/components/ui/Card';
import { FooterNote } from '@/components/ui/FooterNote';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Buttons';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { useAppStore } from '@/stores/appStore';
import { useSessionStore } from '@/stores/sessionStore';
import { plural } from '@/utils/format';
import { forgetToken } from '@/utils/push';
import { createStyles } from '@/utils/themedStyles';

/**
 * Data & privacy.
 *
 * Every build of CampusNow answers three questions honestly: what is sitting
 * on this phone, what will be handed to the campus (and where it lands in
 * ServiceNow), and how to get rid of it. Nothing here is aspirational — the
 * lists are read from the store, so the screen cannot drift from reality.
 */
export default function DataPrivacyScreen() {
  const reports = useAppStore((state) => state.reports);
  const notifications = useAppStore((state) => state.notifications);
  const preferences = useAppStore((state) => state.preferences);
  const resetLocalData = useAppStore((state) => state.resetLocalData);
  const signOut = useSessionStore((state) => state.signOut);
  const email = useSessionStore((state) => state.email);
  const usn = useSessionStore((state) => state.usn);
  const idPhoto = useSessionStore((state) => state.idPhotoUri);

  const confirmClear = () => {
    Alert.alert(
      'Clear data on this device?',
      'Reports, notifications and preferences stored here are erased. Your verified identity stays so you can keep filing.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear data', style: 'destructive', onPress: () => resetLocalData() },
      ],
    );
  };

  const confirmSignOut = () => {
    Alert.alert(
      'Sign out and delete the verified identity?',
      'The college email, seat number and ID photo on this phone are removed. Filed reports stay until you clear them.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign out', style: 'destructive', onPress: () => signOut() },
      ],
    );
  };

  const forgetPush = async () => {
    await forgetToken();
    Alert.alert('Push registration cleared', 'The next time you turn push on, this device registers again.');
  };

  return (
    <Screen back section="Data">
      <SectionLabel>On this device</SectionLabel>

      <Card style={styles.card}>
        <CardSection first dense title="Nothing is uploaded yet" description="This build keeps every record in the phone's own storage.">
          <View style={styles.stored}>
            <StoredRow label="College email" value={email ?? 'Not signed in'} />
            <StoredRow label="Seat number" value={usn ?? 'Not signed in'} />
            <StoredRow label="ID card photo" value={idPhoto ? 'Stored locally' : 'Not captured'} />
            <StoredRow label="Filed reports" value={plural(reports.length, 'report')} />
            <StoredRow label="Notifications" value={plural(notifications.length, 'update')} />
            <StoredRow label="Preferences" value={preferences.pushEnabled ? 'Push enabled' : 'Push off'} />
          </View>
        </CardSection>
      </Card>

      <SectionLabel style={styles.section}>When the campus API lands</SectionLabel>

      <Card style={styles.card}>
        <CardRow
          first
          dense
          icon={Server}
          title="Incident record"
          description="Category, summary, description and evidence photo"
        />
        <CardRow
          dense
          icon={Database}
          title="ServiceNow columns"
          description="Assignment group, configuration item, impact, urgency, priority"
        />
        <CardRow
          dense
          icon={HardDrive}
          title="Location and identity"
          description="Block, floor and room plus your verified seat number"
        />
        <CardRow
          dense
          icon={Smartphone}
          title="Still device-only"
          description="Haptics, theme and the pushed-token stay on this phone"
        />
      </Card>

      <FooterNote style={styles.note}>
        Until the campus API is connected, sending a report only writes it here — no report, photo or
        identity leaves the device.
      </FooterNote>

      <SectionLabel style={styles.section}>Controls</SectionLabel>

      <Card style={styles.card}>
        <CardSection first dense title="Stored here" description="Erase everything this phone generated, then start from an empty inbox.">
          <PrimaryButton label="Clear data on this device" onPress={confirmClear} style={styles.action} />
        </CardSection>
        <CardSection dense title="Push registration" description="Drops the token this phone holds with the notification service.">
          <SecondaryButton label="Forget push registration" onPress={() => void forgetPush()} style={styles.action} />
        </CardSection>
        <CardSection dense title="Identity" description="Removes the verified email, seat number and ID photo from this phone.">
          <SecondaryButton label="Sign out" onPress={confirmSignOut} style={styles.action} />
        </CardSection>
      </Card>

      <View style={styles.pill}>
        <Pill tone="primary">Local first</Pill>
        <FooterNote style={styles.footnote}>
          Storage is cleared only by you. There is no account system to delete from, because nothing
          is sent anywhere.
        </FooterNote>
      </View>
    </Screen>
  );
}

function StoredRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.storedRow}>
      <Text style={[typeScale.label, styles.storedLabel]}>{label}</Text>
      <Text style={[typeScale.label, styles.storedValue]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = createStyles(() => ({
  card: {
    marginTop: 8,
  },
  section: {
    marginTop: 24,
    marginBottom: 8,
  },
  stored: {
    gap: 9,
  },
  storedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  storedLabel: {
    color: colors.muted,
  },
  storedValue: {
    flexShrink: 1,
    color: colors.ink,
  },
  action: {
    marginTop: 14,
    height: 46,
  },
  note: {
    marginTop: 12,
  },
  pill: {
    marginTop: 20,
    alignItems: 'center',
    gap: 10,
  },
  footnote: {
    textAlign: 'center',
  },
}));
